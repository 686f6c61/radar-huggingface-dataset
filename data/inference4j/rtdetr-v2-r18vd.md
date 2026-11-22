# inference4j/rtdetr-v2-r18vd

## Resumen

RT-DETRv2-R18-vd es un detector de objetos basado en transformer, exportado a ONNX, que implementa la variante ResNet-18 vd del modelo RT-DETRv2 (Real-Time DEtection TRansformer v2). El modelo original fue desarrollado por el grupo de investigación de la Universidad de Pekín y Baidu, y esta versión concreta es un espejo del export ONNX publicado por onnx-community, redistribuido por inference4j para su uso con su librería de inferencia en Java. Detecta las 80 clases del dataset COCO y está pensado para tareas de detección de objetos en tiempo real.

La relevancia de este modelo radica en su licencia Apache-2.0, que lo convierte en una alternativa comercialmente permisiva y no copyleft frente a los modelos de la familia YOLO (YOLOv8, YOLO26) publicados bajo AGPL. Para equipos que integran detección de objetos en productos propietarios, esto elimina la obligación de liberar el código de la aplicación. Además, al ser un transformer de detección sin necesidad de NMS (supresión de no máximos) en el post-procesado, simplifica el pipeline de inferencia.

El modelo alcanza un COCO AP de 48.1 en val2017 según los datos reportados por los autores de RT-DETR. El repositorio ocupa aproximadamente 0.1 GB, lo que refleja un peso ligero adecuado para despliegue en entornos con recursos limitados. La entrada es una imagen RGB de 640x640 normalizada y la salida son 300 detecciones candidatas con logits por clase y cajas normalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 ResNet-18 vd (detector de objetos basado en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (el repositorio contiene el export ONNX en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; las 80 clases COCO estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector de objetos end-to-end basado en transformer que elimina la necesidad de componentes heuristicos como el NMS. La variante R18-vd emplea un backbone ResNet-18 con la modificación "vd" (variante de diseño del backbone introducida en la familia RT-DETR), sobre el que se construye un encoder híbrido y un decoder transformer que produce directamente un conjunto fijo de 300 detecciones. El modelo está entrenado sobre COCO 2017 con 80 clases.

El export ONNX mantiene la arquitectura original sin cambios: la entrada `pixel_values` tiene forma `[batch, 3, 640, 640]` en RGB normalizado a rango 0-1, con redimensionado bilineal y sin letterbox. La salida consta de `logits` con forma `[batch, 300, 80]` (logits crudos a los que hay que aplicar sigmoid) y `pred_boxes` con forma `[batch, 300, 4]` en formato normalizado `[cx, cy, w, h]`. El post-procesado requiere convertir a `[x1, y1, x2, y2]`, escalar a las dimensiones de la imagen y filtrar por umbral de confianza (por ejemplo, > 0.5). No se dispone de información detallada sobre el número de tokens de entrenamiento, composición exacta del dataset más allá de COCO 2017, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a detección de objetos).

## Capacidades

- Detección de objetos en imágenes para las 80 clases del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia end-to-end sin NMS: el decoder produce directamente las detecciones finales, lo que simplifica el pipeline.
- Procesamiento por lotes (`batch`) gracias a la dimensión dinámica de la entrada ONNX.
- Salida de hasta 300 detecciones por imagen con puntuaciones de confianza por clase.
- Integración con la librería inference4j para Java mediante la API `DetrDetector.rtDetrV2()`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente de visión).
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la detección.

## Casos de uso

- **Moderación de contenido visual**: el modelo puede detectar personas y objetos sensibles en imágenes subidas por usuarios, filtrando por las clases COCO relevantes y umbral de confianza, con la ventaja de la licencia Apache-2.0 para productos comerciales.
- **Analítica de retail**: conteo y localización de personas y productos en imágenes de tienda, aprovechando la salida de hasta 300 detecciones por imagen y la ausencia de NMS para simplificar el post-procesado.
- **Vigilancia y seguridad perimetral**: detección de personas y vehículos en flujos de cámaras, con inferencia por lotes para procesar múltiples frames.
- **Automatización de inventario**: identificación de objetos en estanterías o almacenes a partir de fotografías, usando las clases COCO como base y ajustando el umbral según la aplicación.
- **Preprocesado para pipelines de visión**: generación de regiones de interés (ROI) para modelos posteriores (OCR, clasificación, segmentación) en aplicaciones de documento o escena.
- **Integración en aplicaciones Java empresariales**: despliegue mediante inference4j en backends Java sin necesidad de salir del ecosistema JVM, con el modelo ONNX cargado directamente.
- **Prototipado rápido en edge**: el tamaño reducido del repositorio (0.1 GB) y el backbone ResNet-18 permiten ejecución en dispositivos con recursos moderados mediante runtime ONNX.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| COCO AP (val2017) | 48.1 | Reportado por los autores de RT-DETR para la variante R18-vd |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, AP50, AP75, latencia o throughput) para esta variante concreta.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; por el tamaño del repositorio (0.1 GB) y el backbone ResNet-18, se estima un consumo moderado, aunque no se proporcionan cifras oficiales.
- **GPU recomendadas**: no disponible en la información proporcionada. Por el perfil del modelo (ResNet-18 + transformer ligero), es apto para GPUs de gama media, pero no se confirman modelos concretos.
- **Compatibilidad con GPU de consumo**: no confirmada explícitamente; el tamaño reducido sugiere que podría ejecutarse en GPUs de consumo, pero no hay datos oficiales.
- **Opciones de despliegue**: runtime ONNX (ONNX Runtime), inference4j (Java), y cualquier motor compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | COCO AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RT-DETRv2-R18-vd (este) | no disponible (backbone ResNet-18) | Imagen 640x640 | 48.1 | Apache-2.0 | ONNX en HF |
| YOLOv8 | no disponible en la información | Imagen (varias resoluciones) | no disponible en la información | AGPL-3.0 | Pesos en múltiples formatos |
| YOLO26 | no disponible en la información | Imagen (varias resoluciones) | no disponible en la información | AGPL-3.0 | Pesos en múltiples formatos |

La comparación cuantitativa con YOLOv8 y YOLO26 no puede completarse con los datos disponibles; la diferencia principal documentada es la licencia (Apache-2.0 frente a AGPL-3.0) y la ausencia de NMS en RT-DETRv2.

## Limitaciones y advertencias

- **Clases limitadas**: solo detecta las 80 clases de COCO; no cubre categorías específicas de dominio sin reentrenamiento o fine-tuning.
- **Sesgos del dataset**: COCO presenta sesgos conocidos de representación (geográficos, demográficos y de contexto), que pueden trasladarse a las detecciones.
- **Riesgo de falsos positivos y negativos**: como todo detector, puede fallar en objetos ocluidos, de pequeño tamaño o en condiciones de iluminación adversas; el umbral de confianza debe calibrarse por aplicación.
- **Sin NMS**: aunque simplifica el pipeline, en escenarios con objetos muy solapados puede requerir ajustes adicionales en el post-procesado.
- **Entrada fija**: la entrada está normalizada a 640x640 con redimensionado bilineal sin letterbox, lo que puede distorsionar la relación de aspecto de imágenes originales.
- **Licencia**: Apache-2.0 permite uso comercial sin obligación de copyleft, pero se debe conservar el aviso de licencia y atribución.
- **Idioma**: las etiquetas de clase están en inglés; no hay soporte multilingüe.
- **Sin datos de rendimiento en producción**: no se han publicado cifras de latencia ni throughput en la información disponible, por lo que la planificación de capacidad requiere pruebas propias.

## Enlaces

- [Modelo en Hugging Face (este repositorio)](https://huggingface.co/inference4j/rtdetr-v2-r18vd)
- [Modelo original PekingU/rtdetr_v2_r18vd](https://huggingface.co/PekingU/rtdetr_v2_r18vd)
- [Export ONNX de onnx-community](https://huggingface.co/onnx-community/rtdetr_v2_r18vd-ONNX)
- [Repositorio de código RT-DETR (lyuwenyu/RT-DETR)](https://github.com/lyuwenyu/RT-DETR)
- [Librería inference4j](https://github.com/inference4j/inference4j)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
