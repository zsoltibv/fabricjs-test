import { Component, ElementRef, ViewChild } from '@angular/core';
import { fabric } from 'fabric';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent {
  @ViewChild('canvas') canvasRef!: ElementRef;
  private canvas: fabric.Canvas | undefined;
  private isDrawing: boolean = false;
  private currentLine: fabric.Line | undefined;
  private gridSize: number = 30;

  ngAfterViewInit(): void {
    const canvasEl: HTMLCanvasElement = this.canvasRef.nativeElement;
    this.canvas = new fabric.Canvas(canvasEl);

    this.canvas.on('mouse:down', (event) => this.handleMouseDown(event));
    this.canvas.on('mouse:move', (event) => this.handleMouseMove(event));
    this.canvas.on('mouse:up', () => this.handleMouseUp());

    // add desk
    this.addDesk(this.canvas);
    // Add grid
    this.addGrid();

    //delete
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Delete') {
        if (this.canvas) {
          const activeObject = this.canvas.getActiveObject();

          if (activeObject) {
            // Delete the selected object on pressing the Delete key
            this.canvas.remove(activeObject);
            this.canvas.renderAll();
          }
        }
      }
    });
  }

  private addDesk(canvas: any): void {
    //add desk
    const desk = new fabric.Rect({
      width: 120,
      height: 60,
      fill: 'brown',
      selectable: true,
      lockScalingX: true,
      lockScalingY: true,
    });

    canvas.on('object:moving', (event: fabric.IEvent) => {
      const target = event.target as fabric.Object;
      const pointer = this.canvas!.getPointer(event.e);

      // Snap the desk to the grid
      const snappedPosition = this.snapToGrid(pointer);
      target.set({
        left: snappedPosition.x,
        top: snappedPosition.y,
      });
    });

    canvas.add(desk);
  }

  private addGrid(): void {
    for (let i = 0; i < this.canvas!.width! / this.gridSize; i++) {
      const lineX = new fabric.Line([i * this.gridSize, 0, i * this.gridSize, this.canvas!.height!], {
        stroke: '#ccc',
        selectable: false,
        evented: false,
        strokeWidth: 1
      });
      this.canvas!.add(lineX);
    }

    for (let i = 0; i < this.canvas!.height! / this.gridSize; i++) {
      const lineY = new fabric.Line([0, i * this.gridSize, this.canvas!.width!, i * this.gridSize], {
        stroke: '#ccc',
        selectable: false,
        evented: false,
        strokeWidth: 1
      });
      this.canvas!.add(lineY);
    }
  }

  private handleMouseDown(event: fabric.IEvent): void {
    if (!this.isDrawing) {
      const pointer = this.canvas!.getPointer(event.e);
      const targetObject = this.canvas!.findTarget(event.e, false);

      if (targetObject) {
        // If the click is on an existing object, select it
        this.canvas!.setActiveObject(targetObject);
      } else {
        const snappedPointer = this.snapToGrid(pointer);
        const points = [snappedPointer.x, snappedPointer.y, snappedPointer.x, snappedPointer.y];
        this.currentLine = new fabric.Line(points, {
          fill: 'red',
          stroke: 'red',
          strokeWidth: 3,
          selectable: true,
          evented: true,
        });
        this.isDrawing = true;
        this.canvas!.add(this.currentLine);
        // Select the newly created line
        this.canvas!.setActiveObject(this.currentLine);
      }
    }
  }

  private handleMouseMove(event: fabric.IEvent): void {
    if (this.isDrawing) {
      const pointer = this.canvas!.getPointer(event.e);
      const snappedPointer = this.snapToGrid(pointer);
      if (this.currentLine) {
        this.currentLine.set({ x2: snappedPointer.x, y2: snappedPointer.y });
        this.canvas!.renderAll();
      }
    }
  }

  private handleMouseUp(): void {
    this.isDrawing = false;
    this.currentLine = undefined;
  }

  private snapToGrid(pointer: { x: number; y: number }): fabric.Point {
    const snappedX = Math.round(pointer.x / this.gridSize) * this.gridSize;
    const snappedY = Math.round(pointer.y / this.gridSize) * this.gridSize;

    return new fabric.Point(snappedX, snappedY);
  }
}
