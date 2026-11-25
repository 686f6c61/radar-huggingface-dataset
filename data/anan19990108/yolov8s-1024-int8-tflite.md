# anan19990108/yolov8s-1024-int8-tflite

## Resumen

YOLOv8s 1024 INT8 TFLite es una exportación cuantizada del detector de objetos YOLOv8s de Ultralytics, preparada por Andrew Chiao (usuario anan19990108) para su despliegue en dispositivos con recursos limitados mediante TensorFlow Lite. El modelo resuelve la detección de objetos en 80 clases del dataset COCO a una resolución de entrada de 1024×1024 píxeles, con cuantización completa de enteros de 8 bits (INT8) tanto en entrada como en salida, lo que reduce el peso del fichero a 11,10 MiB y permite inferencia eficiente en CPU y aceleradores móviles.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un detector visual optimizado para producción en el borde (edge computing). Frente a los pesos originales en PyTorch, el formato TFLite INT8 facilita el despliegue en Android mediante el delegado QNN HTP, con latencias medidas de 6,285 ms por imagen en un dispositivo Android 13. La arquitectura subyacente es la red convolucional YOLOv8s, con 11,2 millones de parámetros en su versión original, aunque el autor no detalla el recuento exacto tras la conversión.

El modelo se distribuye bajo licencia AGPL-3.0, heredada de Ultralytics, lo que impone obligaciones copyleft en el software que lo integre. Está pensado para tareas de visión por computador en tiempo real donde el coste computacional y el tamaño del binario son críticos, no para generación de texto ni razonamiento lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (red convolucional de detección de objetos, single-stage) |
| Parametros totales | no disponible (la variante YOLOv8s original declara 11,2 M, no confirmado para este fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8 full-integer post-training quantization (entrada y salida INT8) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas de clase en inglés en COCO) |
| Licencia | AGPL-3.0 |
| Formato de pesos | TFLite (`.tflite`, 11,10 MiB) |
| Resolución de entrada | 1024×1024×3, NHWC, INT8 |
| Resolución de salida | `[1, 84, 21504]`, INT8 |
| Dataset de entrenamiento | detection-datasets/coco (COCO) |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8s, un detector de objetos de una sola etapa basado en una red troncal convolucional con conexiones de cuello (neck) tipo PAN-FPN y una cabeza de detección anclada libre (anchor-free) que predice directamente centros, dimensiones y puntuaciones de clase. El modelo original se entrena sobre COCO, y esta exportación mantiene las 80 clases del dataset. La innovación principal de esta ficha no está en el entrenamiento, sino en el proceso de conversión: se aplica cuantización completa de enteros post-entrenamiento (full-integer PTQ) de TensorFlow Lite, con un conjunto de calibración de 128 imágenes extraídas del split de evaluación. No se documenta un reentrenamiento ni ajuste fino adicional; el autor indica que el modelo base es Ultralytics/YOLOv8 y que la conversión la preparó él mismo.

El pipeline de inferencia es explícito en la model card: la entrada debe ser una imagen RGB con letterbox, valor de relleno 114, normalizada a `[0,1]` y cuantizada con la escala y el punto cero del tensor de entrada. La salida `[1,84,21504]` contiene 4 canales de centro normalizado `xywh` relativos a la entrada del modelo y 80 canales de puntuación de clase COCO. La restauración de coordenadas, el recorte, el filtrado por confianza y la NMS (IoU 0,70, umbral 0,25) se realizan en el host, no dentro del grafo TFLite. No se mencionan técnicas como decodificación especulativa, atención lineal ni mecanismos de razonamiento multi-paso, por tratarse de un detector puramente convolucional.

## Capacidades

- Detección de objetos en 80 clases del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Salida de cajas delimitadoras en formato `xyxy` en píxeles de la imagen original orientada por EXIF, con etiqueta, identificador de clase y puntuación de confianza.
- Inferencia en CPU mediante TensorFlow Lite, sin necesidad de GPU.
- Aceleración en hardware móvil mediante el delegado QNN HTP en Android 13 (latencia media de 6,285 ms por imagen).
- Preprocesado y postprocesado definidos de forma determinista (letterbox, cuantización, NMS), lo que facilita la reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente visual.
- No dispone de capacidades multilingües ni de procesamiento de audio.
- No se documenta modo de pensamiento (thinking mode) ni ninguna capacidad generativa.

## Casos de uso

- Detección de objetos en tiempo real en dispositivos Android: el modelo se integra con el delegado QNN HTP y ofrece una latencia de 6,285 ms por imagen, adecuada para aplicaciones de cámara que requieren procesamiento por fotograma sin conexión a la nube.
- Videovigilancia en el borde: al pesar 11,10 MiB y ejecutarse en CPU, puede desplegarse en cámaras IP o mini-PCs para detectar personas y vehículos localmente, reduciendo el ancho de banda y preservando la privacidad.
- Automatización de inventario y logística: la detección de las 80 clases COCO permite identificar cajas, vehículos y personas en imágenes de almacén, con postprocesado configurable (umbral 0,25, NMS IoU 0,70) para ajustar la precisión.
- Aplicaciones de accesibilidad: descripción de escenas mediante la detección de objetos en imágenes capturadas por el móvil, con salida JSON estructurada que un sistema posterior puede convertir en audio.
- Robótica educativa y prototipado: el formato TFLite y el script de ejemplo en Python 3.11 permiten validar rápidamente un pipeline de detección en una Raspberry Pi o un dispositivo similar antes de invertir en hardware más potente.
- Análisis de imágenes aéreas o de tráfico: la resolución de entrada de 1024×1024 mejora la detección de objetos pequeños en comparación con resoluciones menores, útil para conteo de vehículos o peatones en imágenes de dron.
- Preprocesado en pipelines de visión industrial: el modelo puede actuar como primer filtro para localizar regiones de interés que luego se procesen con modelos más pesados, aprovechando su bajo coste computacional.

## Benchmarks y rendimiento

| COCO val2017, 5.000 imágenes | AP50 | AP50–95 |
|---|---:|---:|
| INT8 (este modelo) | 57,18% | 37,07% |
| FP16 baseline | 59,30% | 41,12% |

| Medición en Android 13, delegado QNN HTP | Valor |
|---|---:|
| Latencia media por invocación | 6,285 ms |
| Latencia p95 | 6,440 ms |
| Imágenes de calibración | 128 (del split de evaluación) |

La medición de latencia excluye la decodificación de la imagen de origen, el preprocesado y el postprocesado en el host. El informe de evaluación completo se encuentra en `evaluation/results.json` del repositorio. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de visión.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo TFLite INT8 ocupa 11,10 MiB en disco y un espacio similar en memoria.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo está pensado para CPU y aceleradores móviles (QNN HTP en Android 13).
- Cabe en cualquier GPU de consumo y en dispositivos móviles de gama media, dado su tamaño reducido.
- Opciones de despliegue: TensorFlow Lite (intérprete de CPU), delegado QNN HTP en Android, y el script de ejemplo `examples/infer.py` con Python 3.11. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 6,285 ms de media y 6,440 ms en p95 por imagen en Android 13 con QNN HTP, excluyendo preprocesado y postprocesado. No se documenta throughput en CPU de escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Resolución | Formato | Licencia | AP50–95 (COCO) |
|---|---|---|---:|---|---:|
| YOLOv8s 1024 INT8 TFLite (este) | no disponible (YOLOv8s ~11,2 M) | 1024×1024 | TFLite INT8 | AGPL-3.0 | 37,07% |
| YOLOv8s FP16 baseline | ~11,2 M | 1024×1024 | no disponible | AGPL-3.0 | 41,12% |
| YOLOv8n (variante nano de Ultralytics) | ~3,2 M | 640×640 | PyTorch/TFLite | AGPL-3.0 | no disponible en esta ficha |
| YOLOv5s (Ultralytics) | ~7,2 M | 640×640 | PyTorch/TFLite | AGPL-3.0 | no disponible en esta ficha |

La comparación directa más fiable es contra el baseline FP16 del mismo autor, que pierde 2,12 puntos de AP50 y 4,05 puntos de AP50–95 tras la cuantización INT8. No se dispone de datos de benchmarks de las variantes nano o de YOLOv5s en la información proporcionada, por lo que no se comparan numéricamente.

## Limitaciones y advertencias

- La cuantización INT8 degrada la precisión respecto al baseline FP16: 57,18% frente a 59,30% en AP50 y 37,07% frente a 41,12% en AP50–95.
- El conjunto de calibración es reducido (128 imágenes del split de evaluación), lo que puede introducir sesgos en la cuantización para dominios distintos de COCO.
- El modelo solo detecta las 80 clases de COCO; no reconoce categorías fuera de ese conjunto ni proporciona segmentación, poses ni profundidad.
- Riesgo de falsos positivos y negativos en escenas con oclusión, objetos pequeños o condiciones de iluminación adversas, inherente a los detectores de una etapa.
- La licencia AGPL-3.0 impone obligaciones copyleft: el software que integre el modelo y se distribuya debe publicarse bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- El autor no documenta sesgos demográficos ni de otro tipo; al entrenarse sobre COCO, puede heredar los sesgos de representación de ese dataset.
- No se especifican los idiomas de las etiquetas más allá del inglés estándar de COCO.
- El modelo no es adecuado para tareas de generación de texto, razonamiento o agentes; su uso fuera de la visión por computador no está soportado.
- La fecha de creación indicada (2026-09-03) es posterior a la de esta ficha, lo que sugiere un posible error en los metadatos del repositorio; conviene verificar la vigencia del fichero antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/yolov8s-1024-int8-tflite
- Descarga directa del fichero TFLite: https://huggingface.co/anan19990108/yolov8s-1024-int8-tflite/resolve/main/yolov8s_1024_int8.tflite
- Checksums SHA-256: https://huggingface.co/anan19990108/yolov8s-1024-int8-tflite/blob/main/SHA256SUMS
- Script de inferencia de ejemplo: https://huggingface.co/anan19990108/yolov8s-1024-int8-tflite/blob/main/examples/infer.py
- Requisitos: https://huggingface.co/anan19990108/yolov8s-1024-int8-tflite/blob/main/requirements.txt
- Informe de evaluación: https://huggingface.co/anan19990108/yolov8s-1024-int8-tflite/blob/main/evaluation/results.json
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Dataset COCO (referencia): https://huggingface.co/datasets/detection-datasets/coco
