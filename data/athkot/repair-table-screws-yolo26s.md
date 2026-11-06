# athkot/repair-table-screws-yolo26s

## Resumen

Repair Table Screws YOLO26s es un modelo de deteccion de objetos especializado en la identificacion de tornillos y agujeros de tornillo vacios sobre superficies de mesa de reparacion. Lo desarrolla el usuario athkot y se distribuye a traves de Hugging Face bajo la libreria Ultralytics. El modelo forma parte de la familia YOLO26, una generacion de detectores de la linea YOLO, y se ofrece en el tamano "s" (small) de esa familia.

El modelo resuelve una tarea muy concreta de vision por computador en entornos de reparacion o ensamblaje: localizar tornillos presentes y agujeros donde falta un tornillo. Se ha entrenado exclusivamente con datos sinteticos del dataset athkot/repair-table-screws-synthetic-15k, lo que lo hace relevante para casos donde no se dispone de imagenes reales etiquetadas y se opta por un pipeline de datos generados.

La relevancia practica es acotada pero clara: es un detector ligero (repo de 0,1 GB, formato ONNX y pesos Ultralytics) pensado para inspeccion visual automatizada, control de calidad o asistencia en tareas de montaje. No es un modelo de lenguaje ni un modelo multimodal general; es un detector de objetos de dos clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de objetos de la familia YOLO26, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos Ultralytics y ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | Ultralytics (best.pt) y ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26 en su variante "s" (small), un detector de objetos de una sola etapa orientado a inferencia en tiempo real. El modelo tiene dos clases de salida: `screw` y `empty_screw_hole`. No se dispone de informacion sobre el numero exacto de parametros, la composicion de la red ni las innovaciones internas de la variante YOLO26 en la informacion proporcionada.

El entrenamiento se realizo sobre el dataset sintetico athkot/repair-table-screws-synthetic-15k, compuesto por imagenes generadas y etiquetadas de forma sintetica. No se especifican el numero de tokens (no aplica), el numero de imagenes de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de aumento o ajuste fino posteriores. El autor reporta un mAP50 de 0,936 sobre la particion de validacion sintetica.

## Capacidades

- Deteccion de objetos en imagenes con dos clases: `screw` (tornillo presente) y `empty_screw_hole` (agujero de tornillo vacio).
- Inferencia mediante la API de Ultralytics: `YOLO("best.pt")("photo.jpg", conf=0.5)`.
- Exportacion a ONNX, segun los tags del repositorio, para despliegue en entornos sin PyTorch.
- Umbral de confianza configurable en la llamada de inferencia.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales mas alla de la deteccion de objetos.

## Casos de uso

- Inspeccion de calidad en linea de montaje: el detector localiza tornillos presentes y agujeros vacios en una imagen de la mesa de reparacion, permitiendo validar automaticamente si un ensamblaje esta completo antes de pasar a la siguiente fase.
- Asistencia a operarios en reparacion: una camara sobre la mesa captura la imagen y el modelo senala los agujeros sin tornillo, ayudando al operario a identificar piezas faltantes.
- Automatizacion de inventario de piezas: procesando imagenes de bandejas o mesas, el modelo cuenta tornillos y detecta huecos para estimar consumibles restantes.
- Control de calidad post-reparacion: comparar la deteccion sobre la imagen final con la esperada para detectar tornillos olvidados o mal colocados.
- Entrenamiento de robots de pick-and-place: el detector proporciona las coordenadas de agujeros vacios y tornillos para que un brazo robotico actue sobre ellos.
- Documentacion y trazabilidad: generar registros automaticos del estado de cada mesa de reparacion a partir de las detecciones, con marcas de tiempo y conteos por clase.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto de evaluacion |
|---|---|---|
| mAP50 | 0,936 | Particion de validacion sintetica del dataset athkot/repair-table-screws-synthetic-15k |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (mAP50-95, precision, recall, latencia) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 0,1 GB en repositorio y variante "s", es esperable que quepa en GPUs consumer, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion; por el tamano del repositorio y la variante small es plausible, pero no se aporta dato oficial.
- Opciones de despliegue: Ultralytics (PyTorch) y ONNX, segun los tags y el ejemplo de la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | mAP50 | Licencia | Formato |
|---|---|---|---|---|---|
| Repair Table Screws YOLO26s | YOLO26s | 2 (screw, empty_screw_hole) | 0,936 (val sintetica) | AGPL-3.0 | Ultralytics, ONNX |
| YOLOv8s (referencia generica) | YOLOv8s | 80 (COCO) | no disponible en esta ficha | AGPL-3.0 | Ultralytics, ONNX |
| YOLO11s (referencia generica) | YOLO11s | 80 (COCO) | no disponible en esta ficha | AGPL-3.0 | Ultralytics, ONNX |

No se dispone de datos de rendimiento de los modelos de referencia en la informacion proporcionada; la comparativa se limita a arquitectura, numero de clases, licencia y formatos. No se han identificado en la informacion otros detectores especializados en tornillos o agujeros de tornillo para una comparacion directa.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: el rendimiento en imagenes reales de mesas de reparacion puede degradarse respecto al mAP50 reportado en validacion sintetica.
- El mAP50 de 0,936 corresponde a la particion de validacion sintetica, no a un conjunto real independiente; no debe interpretarse como rendimiento en produccion.
- Solo detecta dos clases (`screw` y `empty_screw_hole`); no reconoce otros objetos, tipos de tornillo ni estados de la mesa.
- No se dispone de informacion sobre sesgos conocidos, tasas de falsos positivos o falsos negativos.
- Licencia AGPL-3.0: implica obligaciones de copyleft para uso en red y distribucion; conviene revisar las implicaciones antes de un uso comercial cerrado.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en tiempo real.
- No hay informacion sobre el numero de imagenes de entrenamiento ni sobre la diversidad de condiciones de iluminacion, angulos o fondos del dataset sintetico.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de detecciones espurias con umbrales de confianza bajos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athkot/repair-table-screws-yolo26s
- Dataset de entrenamiento: https://huggingface.co/datasets/athkot/repair-table-screws-synthetic-15k
- Libreria Ultralytics: https://github.com/ultralytics/ultralytics
