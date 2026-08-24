# niroj-ebpearls/coffee-leaf-yolov12

## Resumen

El modelo `coffee-leaf-yolov12` es un detector de objetos basado en YOLOv12, desarrollado por Niroj Magar como parte de la tesis MCA-IV *Comparative Analysis of YOLOv12 Model for Coffee Leaf Disease Detection (S vs L)*. Su propósito es identificar enfermedades comunes en hojas de café —roya (rust), minador (miner), phoma y cercospora— además de distinguir hojas sanas. El modelo se distribuye en formato ONNX, pensado para inferencia en el navegador mediante ONNX Runtime Web, de modo que no requiere un servidor de inferencia dedicado.

Se ofrecen dos variantes: YOLOv12-s (9,23 millones de parámetros, 37,3 MB) y YOLOv12-l (26,34 millones de parámetros, 105,9 MB). Ambas aceptan una entrada de 640×640 píxeles y producen una salida de 8400 propuestas con 5 clases. La variante pequeña supera a la grande en este conjunto de datos concreto (mAP50 de 0,702 frente a 0,682) y es aproximadamente tres veces más rápida, lo que sugiere que el modelo grande sobreajusta los datos limitados y desequilibrados.

La relevancia actual radica en su aplicabilidad directa a la agricultura de precisión: al ejecutarse en el navegador, permite diagnósticos en campo sin conexión a un servidor central, facilitando la monitorización de cultivos en zonas rurales con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv12 (attention-centric, detección de una etapa) |
| Parametros totales | 9,23 M (variante s) / 26,34 M (variante l) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | fp32 (ONNX); no se admite int8 (corrompe la salida en WebGPU) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 13, simplificado, fp32) |

## Arquitectura y entrenamiento

YOLOv12 es un detector de objetos de una etapa con una arquitectura centrada en la atención (attention-centric), según la documentación de Ultralytics. Esta familia de modelos introduce mecanismos de atención en lugar de las convoluciones tradicionales en las capas de cuello de botella, logrando un equilibrio entre precisión y latencia. En este caso, el modelo se entrenó sobre un conjunto combinado de los datasets BRACOL, RoCoLe y un conjunto de campo recopilado específicamente en Letang, sumando 5.992 imágenes. El conjunto presenta un marcado desequilibrio de clases, con una sobrerrepresentación de la clase `rust`, lo que condiciona el rendimiento final.

El entrenamiento se realizó para las variantes S y L, y posteriormente se exportó a ONNX con `opset=13`, simplificación del grafo y precisión fp32. El batch es estático (tamaño 1) y el post-procesado (filtro de confianza, NMS por clase e inversión del letterbox) no está incluido en el grafo, por lo que debe implementarse en el consumidor. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, al tratarse de un modelo de visión supervisado.

## Capacidades

- Detección de objetos en imágenes de hojas de café, con localización y clasificación en 5 clases: `rust`, `miner`, `phoma`, `cercospora` y `healthy`.
- Inferencia en navegador mediante ONNX Runtime Web, sin necesidad de servidor dedicado.
- Salida estructurada: 8400 propuestas con 4 coordenadas de caja y 5 puntuaciones de clase por propuesta.
- Compatible con pipelines de visión artificial que requieran post-procesado personalizado (NMS, umbral de confianza).
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un detector visual especializado.

## Casos de uso

- Monitorización de cultivos en campo: un agricultor fotografía hojas con su teléfono y la detección se ejecuta localmente en el navegador, identificando enfermedades al instante sin conexión a internet.
- Aplicación web de diagnóstico: una plataforma permite a usuarios subir imágenes de hojas y recibir un informe de enfermedades detectadas, con la inferencia corriendo en el cliente para reducir costes de servidor.
- Inspección aérea con drones: las imágenes capturadas por drones se procesan en un visor web, permitiendo mapear la distribución de enfermedades en plantaciones extensas.
- Sistema de alerta temprana: al detectar focos de roya (rust) en imágenes periódicas, se pueden generar avisos para aplicar tratamientos fungicidas de forma dirigida.
- Investigación agronómica: los investigadores pueden cuantificar la prevalencia de cada enfermedad en diferentes parcelas, usando el modelo como herramienta de análisis de imágenes.
- Herramienta educativa: estudiantes de agronomía pueden practicar la identificación de enfermedades comparando las predicciones del modelo con imágenes reales.
- Integración en plataformas de agricultura de precisión: el modelo ONNX puede desplegarse en servidores con ONNX Runtime o TensorRT para procesar flujos de imágenes desde sensores fijos.

## Benchmarks y rendimiento

Los resultados publicados en la tesis para el conjunto de datos combinado son los siguientes:

| Modelo | mAP50 | mAP50-95 | F1 | FPS (T4) |
|---|---|---|---|---|
| YOLOv12-s | 0,702 | 0,482 | 0,688 | 44,4 |
| YOLOv12-l | 0,682 | 0,465 | 0,660 | 28,9 |

La variante pequeña supera a la grande en todas las métricas, siendo además unas 1,5 veces más rápida en una GPU T4. El rendimiento por clase es desigual: las enfermedades individuales presentan mAP50-95 entre 0,29 y 0,40, mientras que la clase `healthy` alcanza 0,96, lo que infla la media global. No se han publicado comparaciones con otros detectores (p. ej., YOLOv11, Faster R-CNN) sobre el mismo conjunto de datos.

## Requisitos de hardware

- Inferencia en navegador: no requiere GPU dedicada; puede ejecutarse en CPU o GPU integrada mediante WebGPU/WebGL, gracias al tamaño reducido de los modelos (37 MB y 106 MB).
- Para despliegue en servidor, los modelos ONNX pueden ejecutarse con ONNX Runtime, TensorRT o TGI, con requisitos mínimos de VRAM (menos de 1 GB para la variante s en fp32).
- El entrenamiento original requirió una GPU (no especificada en la documentación), pero la inferencia es ligera.
- Latencia estimada: 44,4 FPS (variante s) y 28,9 FPS (variante l) en una GPU T4, según los datos de la tesis. En navegador, el rendimiento dependerá del dispositivo del cliente.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime (servidor), TensorRT, OpenVINO, entre otros.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de detección de enfermedades de café en la información proporcionada. La única comparativa interna es entre las variantes S y L del propio YOLOv12, ya descrita en la sección de benchmarks. Para una evaluación frente a alternativas como YOLOv11 o EfficientDet, sería necesario ejecutar los mismos conjuntos de datos, lo que no se ha documentado.

## Limitaciones y advertencias

- Desequilibrio de clases: el conjunto de datos está dominado por la clase `rust`, lo que provoca un rendimiento deficiente en las demás enfermedades (mAP50-95 entre 0,29 y 0,40).
- La métrica global está inflada por el alto acierto en la clase `healthy` (0,96), lo que puede dar una falsa sensación de precisión.
- No se ha validado el modelo para variedades de café o condiciones de cultivo distintas de las presentes en los datasets fuente (BRACOL, RoCoLe y Letang).
- El grafo ONNX no incluye post-procesado; los consumidores deben implementar el filtro de confianza, el NMS por clase y la inversión del letterbox, lo que puede introducir errores si no se hace correctamente.
- No se admite cuantización int8, ya que corrompe la salida bajo WebGPU; esto limita la optimización en dispositivos con recursos muy limitados.
- Aunque la licencia del modelo es MIT, los datasets utilizados (BRACOL, RoCoLe) pueden tener sus propias restricciones de uso; conviene verificarlas antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niroj-ebpearls/coffee-leaf-yolov12
- Repositorio oficial de YOLOv12: https://github.com/sunsmarterjie/yolov12
- Documentación de YOLO12 en Ultralytics: https://docs.ultralytics.com/models/yolo12
