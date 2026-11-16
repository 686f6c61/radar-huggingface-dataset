# Hieule1/YOLO11_WoodCounterV1

## Resumen

YOLO11_WoodCounterV1 es un modelo de deteccion de objetos derivado de Ultralytics YOLO11s, publicado por el usuario Hieule1 en Hugging Face. Su unica tarea es localizar el extremo de cada tabla en la cara frontal de un paquete de madera, de modo que las tablas puedan contarse de forma automatica. El modelo se distribuye como un unico fichero ONNX simplificado (`endface_v1.onnx`, 37,9 MB) con forma estatica de entrada `[1, 3, 640, 640]` y una unica clase, `board_end`.

El modelo forma parte del proyecto GNL Vision: Wood Counter, una aplicacion de conteo de madera cuyo backend gestiona el troceado de la imagen, la decodificacion de las predicciones y la fusion de resultados entre teselas. La version 1 se entrena exclusivamente con fotos publicas (804 imagenes web con unos 61.000 extremos de tabla etiquetados), por lo que el autor la describe como una etapa de calentamiento previa al ajuste fino con imagenes reales de su propio patio.

Es relevante como ejemplo de modelo de deteccion vertical y ligero, desplegable en CPU mediante ONNX Runtime, orientado a una tarea industrial concreta (inventario de madera) y con un pipeline de inferencia documentado en un repositorio publico. No es un modelo de lenguaje: no genera texto ni soporta razonamiento, tool calling ni capacidades multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s, cabeza de deteccion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye unicamente en FP32 ONNX) |
| Idiomas soportados | no aplica (modelo de vision sin componente textual) |
| Licencia | AGPL-3.0, heredada de Ultralytics YOLO11 |
| Formato de pesos | ONNX simplificado, forma estatica, opset elegido por Ultralytics 8.4.215 |
| Clases | 1 (`0 = board_end`) |
| Entrada | `images`: float32 `[1, 3, 640, 640]`, RGB, valores 0-1, letterbox con relleno gris (114) |
| Salida | `output0`: `[1, 5, 8400]` = `cx, cy, w, h, score` por ancla, en espacio de 640 px, sin NMS |
| Tamano de fichero | 37,9 MB |
| SHA-256 | `adc75080dcc3c0351f2c1336746d6ee6420446742b1bfcc5716bc2df15d3db4e` |
| Libreria | onnx |

## Arquitectura y entrenamiento

El modelo es una instancia de YOLO11s de Ultralytics con cabeza de deteccion, exportada a ONNX con forma estatica y simplificacion. La salida cruda contiene 8400 anclas con cinco valores cada una (cuatro coordenadas de caja mas la puntuacion), sin supresion de no maximos incorporada; el consumidor debe transponer a `[8400, 5]`, filtrar por umbral de puntuacion, convertir de centro-mas-dimensiones a esquinas y aplicar NMS tras mapear las cajas al espacio de la imagen original.

El entrenamiento se realizo sobre 804 fotos web con aproximadamente 61.000 extremos de tabla etiquetados, fusionadas y deduplicadas a partir de dos conjuntos de Roboflow (`boards-count` de janioworkspace, version 2, y `boards` de paligemma-4duq6, version 5, ambos CC BY 4.0). Se partio de pesos preentrenados en COCO (`yolo11s.pt`) y se entrenaron 60 epocas con teselas de 640 px. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector. La innovacion practica no esta en la arquitectura sino en el pipeline de conteo: el modelo se entrena para que un extremo de tabla tipico ocupe unos 40 px de lado (raiz cuadrada del producto ancho por alto), lo que obliga a reescalar y trocear la foto del paquete en teselas de 640 x 640 con aproximadamente un 20 % de solape antes de inferir.

## Capacidades

- Deteccion de extremos de tabla (`board_end`) en imagenes de la cara frontal de paquetes de madera.
- Localizacion de cajas delimitadoras con puntuacion de confianza por instancia; el consumidor aplica el umbral (referencia: 0,25) y el NMS.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Integracion con el backend del proyecto GNL Vision: Wood Counter, que gestiona encuadre, troceado, decodificacion y fusion entre teselas.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, vision general, audio ni capacidades multilingues.
- Una unica clase: no detecta paquetes completos, separadores ni calzos.

## Casos de uso

- Inventario de madera en aserradero: fotografiar la cara frontal de un paquete y contar los extremos de tabla con el pipeline de teselado y NMS; el modelo esta entrenado para extremos de unos 40 px, de modo que el encuadre debe ajustarse a esa escala.
- Recepcion y control de pedidos: comparar el recuento automatico con la cantidad facturada para detectar discrepancias en la entrega de tablones.
- Automatizacion de inventario en aplicaciones moviles o de escritorio: el modelo ONNX de 37,9 MB se ejecuta en CPU, lo que permite desplegarlo en equipos sin GPU en el propio patio o almacen.
- Prototipado rapido de soluciones de vision industrial: sirve como punto de partida para ajuste fino con imagenes propias mediante los cuadernos de entrenamiento del repositorio GNL Vision.
- Investigacion aplicada en conteo de objetos densos: el esquema de teselado con solape y fusion por NMS es reutilizable en otras tareas de conteo con objetos pequenos y numerosos.
- Integracion en pipelines de control de calidad: combinado con el backend FastAPI del proyecto, se puede exponer como servicio HTTP interno que devuelve el recuento por imagen.
- Docencia y demostracion de despliegue ONNX: ejemplo completo de exportacion Ultralytics a ONNX, decodificacion manual de la salida y gestion de teselas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que esta version no tiene puntuacion de test contada a mano, ya que el conjunto de test bloqueado no incluye fotos del patio, y recomienda evaluar con el cuaderno `03_evaluate` antes de confiar en los recuentos. Como referencia operativa, el autor senala que la inferencia en CPU con ONNX Runtime tarda unos segundos por foto completa de paquete, en funcion del tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado (CPU); en GPU, el fichero ONNX de 37,9 MB en FP32 requiere una cantidad de memoria muy reducida, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; el autor no documenta requisitos de GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del fichero, aunque no se aportan mediciones oficiales.
- Opciones de despliegue: ONNX Runtime (proveedor `CPUExecutionProvider` en el ejemplo del autor); el backend del proyecto GNL Vision usa FastAPI con Uvicorn.
- Latencia y throughput: el autor indica "unos segundos" por foto completa de paquete en CPU, dependiendo del tamano; no se publican valores de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11_WoodCounterV1 | no disponible (YOLO11s) | no aplica | Deteccion de extremos de tabla (1 clase) | AGPL-3.0 | ONNX en Hugging Face |
| YOLO11s (Ultralytics, COCO) | no disponible | no aplica | Deteccion general de 80 clases | AGPL-3.0 | Pesos `.pt` y exportaciones |
| YOLOv8s (Ultralytics, COCO) | no disponible | no aplica | Deteccion general de 80 clases | AGPL-3.0 | Pesos `.pt` y exportaciones |

No se dispone de datos publicados de precision ni de latencia que permitan una comparacion cuantitativa con estos modelos; la comparativa se limita a la categoria, la tarea y la licencia.

## Limitaciones y advertencias

- Una sola clase: detecta extremos de tabla, no paquetes, separadores ni calzos.
- La precision depende del encuadre: los montones de fondo solo se ignoran si se recorta primero al paquete.
- Entrenado solo con fotos web: se esperan fallos en extremos descoloridos o sucios y cajas fusionadas en paquetes muy apretados.
- Sin puntuacion de test contada a mano para esta version; el autor recomienda evaluar con el cuaderno `03_evaluate` antes de fiarse de los recuentos.
- Licencia AGPL-3.0 heredada de Ultralytics: el uso comercial puede exigir una licencia comercial de Ultralytics; conviene revisar sus condiciones.
- Sin datos publicados de sesgos, alucinacion (no aplica a un detector) ni rendimiento multilingue; el modelo no procesa texto.
- La salida no incluye NMS: un consumidor que no implemente la decodificacion y fusion correctas obtendra cajas duplicadas o mal escaladas.
- Inferencia en CPU de varios segundos por foto completa, lo que limita el uso en tiempo real con camaras de alta resolucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hieule1/YOLO11_WoodCounterV1
- Repositorio del proyecto GNL Vision: Wood Counter: https://github.com/GNL-System/gnl-vision
- Dataset `boards-count` (janioworkspace, v2, CC BY 4.0): https://universe.roboflow.com/janioworkspace/boards-count-3v3ly/dataset/2
- Dataset `boards` (paligemma-4duq6, v5, CC BY 4.0): https://universe.roboflow.com/paligemma-4duq6/boards-lcoli/dataset/5
- Documentacion de Ultralytics YOLO11: https://docs.ultralytics.com
