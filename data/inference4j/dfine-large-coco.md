# inference4j/dfine-large-coco

## Resumen

D-FINE Large (COCO) en formato ONNX es la exportación del detector de objetos D-FINE Large desarrollado por el grupo USTC (Universidad de Ciencia y Tecnología de China), publicado originalmente por Peng et al. bajo el nombre de "Redefine Bounding Box Regression for DETR-based Object Detection". Este repositorio concreto, mantenido por `inference4j`, empaqueta los pesos en ONNX para su uso con la librería Java homónima de inferencia, sin dependencia de PyTorch en tiempo de ejecución.

El modelo resuelve detección de objetos sobre las 80 clases de COCO con una arquitectura transformer tipo DETR, sin necesidad de supresión no máxima (NMS) en el post-procesado, lo que simplifica los pipelines de despliegue. Reporta un COCO AP de 54,0 en val2017 según los autores originales, una cifra competitiva frente a detectores YOLO de tamaño similar.

Su relevancia actual radica en la licencia Apache-2.0: ofrece una alternativa comercialmente permisiva y no copyleft a YOLOv8 y YOLO26, que se distribuyen bajo AGPL-3.0. El repositorio ocupa 0,1 GB y está pensado para integración en aplicaciones Java mediante `DetrDetector.dfineLarge()`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Large (detector transformer basado en DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

D-FINE es un detector basado en DETR (Detection Transformer) que reformula la regresión de cajas delimitadoras. La variante Large emplea un backbone y un decoder transformer que predicen directamente un conjunto fijo de 300 detecciones por imagen, eliminando la necesidad de NMS. La entrada es un tensor `pixel_values` de forma `[batch, 3, 640, 640]` en RGB, normalizado a 0-1 con redimensionado bilineal (sin letterbox). La salida consta de `logits` de forma `[batch, 300, 80]` (logits crudos a los que hay que aplicar sigmoid) y `pred_boxes` de forma `[batch, 300, 4]` en formato normalizado `[cx, cy, w, h]`.

El entrenamiento se realizó sobre el conjunto COCO con sus 80 clases, según reportan los autores originales. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un detector). La innovación técnica destacable es la reformulación de la regresión de cajas que da nombre al modelo, orientada a mejorar la precisión de localización en detectores DETR. El repositorio es una conversión a ONNX del modelo PyTorch original, realizada por `onnx-community` y replicada por `inference4j` para su librería Java.

## Capacidades

- Detección de objetos en imágenes para las 80 clases de COCO (persona, vehículo, animales, mobiliario, electrodomésticos, etc.).
- Predicción directa de 300 cajas por imagen con sus puntuaciones de clase, sin post-procesado NMS.
- Salida de logits crudos y cajas normalizadas, lo que permite umbralizar la confianza (por ejemplo, > 0,5) según el caso de uso.
- Inferencia en Java mediante la librería `inference4j` (clase `DetrDetector.dfineLarge()`), sin dependencia de PyTorch.
- Ejecución sobre runtime ONNX, lo que facilita el despliegue en entornos JVM y en servicios sin stack de Python.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de audio o de visión generativa: es un detector puro.

## Casos de uso

- Moderación de imágenes en aplicaciones Java: el modelo puede detectar personas, vehículos u objetos sensibles en fotos subidas por usuarios, integrándose directamente en el backend JVM mediante `inference4j` sin necesidad de un microservicio Python.
- Análisis de tráfico urbano: con entrada 640x640 y 300 detecciones por imagen, es adecuado para contar vehículos y peatones en fotogramas de cámaras de vigilancia, filtrando por umbral de confianza.
- Automatización de inventario en retail: detección de productos y estanterías en fotografías de tienda, aprovechando la licencia Apache-2.0 para uso comercial sin obligaciones copyleft.
- Procesamiento por lotes de imágenes en pipelines de datos: al no requerir NMS, el post-procesado es trivial (conversión de `[cx, cy, w, h]` a `[x1, y1, x2, y2]` y filtrado por score), lo que simplifica la vectorización en lotes.
- Sistemas de asistencia a la conducción en prototipos: detección de peatones, señales y vehículos en imágenes de cámara, con la ventaja de una licencia permisiva frente a alternativas AGPL.
- Indexado y etiquetado automático de archivos multimedia: generación de metadatos de objetos presentes en una fototeca, ejecutable en JVM dentro de herramientas de gestión documental.
- Integración en aplicaciones de escritorio o Android basadas en Java: el formato ONNX y la librería `inference4j` permiten desplegar el detector en entornos sin Python, aunque el rendimiento dependerá del runtime ONNX disponible.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| COCO AP (val2017) | 54,0 | Reportado por los autores de D-FINE |

No se han publicado en la información disponible resultados adicionales de benchmarks (AP50, AP75, AP small/medium/large, latencia o throughput) para esta exportación ONNX concreta. Los 54,0 de COCO AP corresponden al modelo original según los autores, no a una medición independiente de esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere que los pesos en ONNX caben holgadamente en GPUs de consumo, aunque no se documenta la huella exacta en memoria durante la inferencia.
- GPU recomendadas: no disponible. Por el tamaño del repositorio (0,1 GB) y la resolución de entrada (640x640), es plausible su ejecución en GPUs de consumo como RTX 3060 o superiores, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; el tamaño de los pesos sugiere que sí, pero se desconoce el consumo real de memoria del runtime ONNX.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) y la librería Java `inference4j` mediante `DetrDetector.dfineLarge()`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| D-FINE Large (este) | no disponible | imagen 640x640 | 54,0 | Apache-2.0 | ONNX |
| YOLOv8 (variante grande) | no disponible en la información | imagen (resolución configurable) | no disponible | AGPL-3.0 | PyTorch, ONNX, etc. |
| YOLO26 | no disponible en la información | imagen (resolución configurable) | no disponible | AGPL-3.0 | no disponible |

La comparativa se limita a lo que la model card menciona explícitamente: D-FINE Large se presenta como alternativa permisiva (Apache-2.0) a YOLOv8 y YOLO26 (AGPL-3.0). No se dispone en la información proporcionada de cifras de parámetros, contexto ni benchmarks de los modelos YOLO para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo de visión puro: no procesa lenguaje, no soporta tool calling ni agentes; cualquier uso conversacional requeriría combinarlo con otro modelo.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre COCO, hereda los sesgos de representación de dicho dataset (posible infrarrepresentación de ciertas culturas, contextos y condiciones de iluminación).
- Riesgo de alucinación: en detección de objetos se traduce en falsos positivos y cajas mal localizadas; el umbral de confianza (> 0,5 sugerido) debe calibrarse según la aplicación.
- Limitaciones de idioma: no aplica, pero tampoco hay soporte multilingüe por ser un detector.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin obligaciones copyleft, pero conviene verificar la licencia del modelo original de USTC y de la conversión de `onnx-community`, ya que la cadena de procedencia debe respetarse.
- Caveat de producción: los 54,0 de COCO AP son la cifra reportada por los autores del modelo original, no una medición de esta exportación ONNX; la conversión podría introducir pequeñas diferencias numéricas.
- Sin datos de latencia, throughput ni huella de memoria: es necesario medir en el hardware objetivo antes de comprometerse a un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria de esta conversión concreta.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/inference4j/dfine-large-coco
- Modelo original en USTC: https://huggingface.co/ustc-community/dfine-large-coco
- Conversión ONNX de onnx-community: https://huggingface.co/onnx-community/dfine_l_coco-ONNX
- Repositorio GitHub de D-FINE: https://github.com/Peterande/D-FINE
- Librería inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
