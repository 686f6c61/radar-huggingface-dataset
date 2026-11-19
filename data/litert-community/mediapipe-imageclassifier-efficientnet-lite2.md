# litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite2

## Resumen

MediaPipe-ImageClassifier-EfficientNet-Lite2 es un clasificador de imágenes de 1.000 clases (ImageNet-1k) empaquetado como modelo TensorFlow Lite para inferencia on-device mediante LiteRT y la tarea `ImageClassifier` de MediaPipe. Lo publica la comunidad `litert-community` a partir de los artefactos oficiales de Google (MediaPipe), en dos variantes: cuantizada a enteros INT8 (7,17 MB) y en coma flotante FP32 (24,33 MB). No es un modelo de lenguaje: es una red convolucional EfficientNet-Lite2 con entrada RGB de `[1, 260, 260, 3]` y salida softmax de `[1, 1000]`.

Su relevancia actual reside en el despliegue en el borde: al estar en formato `.tflite` con metadatos `TFLITE_METADATA` incrustados (incluida la lista de etiquetas), se integra directamente en Android, iOS, web y Python a través de MediaPipe Tasks, sin necesidad de servidores GPU. La variante INT8 reduce el peso a menos de un tercio del FP32, lo que la hace apta para dispositivos móviles y embebidos con memoria limitada.

Frente a EfficientNet-Lite0, este modelo escala la resolución de entrada (260×260 frente a 224×224) y la capacidad de la red, manteniendo activaciones ReLU6 y capas compatibles con hardware de borde. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite2 (CNN con compound scaling, activaciones ReLU6) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | INT8 full-integer y FP32 |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorFlow Lite (`.tflite`) con metadatos incrustados |

Especificaciones de entrada y salida:

| Variante | Fichero | Tamaño | Entrada | Salida | Normalización |
|---|---|---:|---|---|---|
| INT8 | `efficientnet_lite2_int8.tflite` | 7,17 MB (7.165.461 B) | `[1, 260, 260, 3]` `uint8` | `[1, 1000]` `uint8` (softmax, scale 0,00390625) | mean 127,0 / std 128,0; quant scale 0,0123429, zero_point 125 |
| FP32 | `efficientnet_lite2_float32.tflite` | 24,33 MB (24.325.765 B) | `[1, 260, 260, 3]` `float32` | `[1, 1000]` `float32` | mean 127,0 / std 128,0; rango [-0,9921875, 1,0] |

Ficheros complementarios: `labels.txt` (10,5 KB, 1.001 líneas; línea 1 `background`, líneas 2–1001 las 1.000 clases ImageNet). Ambos `.tflite` incrustan `labels_without_background.txt` en `TFLITE_METADATA`.

## Arquitectura y entrenamiento

EfficientNet-Lite2 es una variante de EfficientNet (Tan y Le, arXiv:1905.11946) adaptada para inferencia en el borde. Sustituye las activaciones Swish por ReLU6, elimina operaciones de squeeze-and-excitation y fija el coeficiente de escala de resolución en 260×260, manteniendo el escalado compuesto de profundidad, anchura y resolución característico de la familia EfficientNet. El resultado es una CNN puramente convolucional, sin mecanismos de atención, optimizada para kernels TFLite y aceleradores móviles (NNAPI, GPU delegate, Core ML).

El entrenamiento se realizó sobre ImageNet-1k (1.000 clases, formato de etiquetas de `tench` a `toilet tissue`). La model card no detalla el número de épocas, la composición exacta del dataset, el pipeline de data augmentation ni si hubo destilación desde un EfficientNet-B2 completo; esa información figura como no disponible. La cuantización INT8 es full-integer (entrada y salida `uint8`), lo que implica que el calibrado se realizó con un conjunto representativo no documentado en el repositorio.

No hay innovaciones de decodificación ni atención: es un clasificador estándar. La innovación relevante es el empaquetado: metadatos incrustados con nombre, versión, autor y fichero de etiquetas, lo que permite a MediaPipe Tasks resolver la mapa de etiquetas sin ficheros externos.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k con probabilidades softmax.
- Inferencia on-device en Android, iOS, web (JavaScript/WASM) y Python mediante MediaPipe Tasks.
- Inferencia independiente con LiteRT (antes TensorFlow Lite) sin depender de MediaPipe.
- Modo imagen estática (`VisionRunningMode.IMAGE`) y modos de vídeo/stream que expone la API de MediaPipe.
- Configuración de `max_results` para limitar el número de categorías devueltas.
- Entrada RGB de 260×260 con normalización integrada en el grafo (media 127,0, desviación 128,0).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües: las etiquetas están en inglés.
- No soporta visión generativa ni descripción de imágenes; solo etiquetado cerrado sobre las 1.000 clases.

## Casos de uso

- Clasificación de fotos en aplicaciones móviles: integración directa con MediaPipe Tasks en Android e iOS; el modelo INT8 de 7,17 MB cabe en el APK/IPA sin descarga adicional y clasifica en el dispositivo sin enviar imágenes a un servidor.
- Moderación de contenido en el borde: filtrado previo de imágenes en el cliente para detectar categorías sensibles antes de subirlas a un backend, reduciendo coste de ancho de banda y latencia.
- Etiquetado automático de bibliotecas fotográficas: generación de metadatos de categoría (animales, objetos, alimentos) en aplicaciones de gestión de fotos personales, ejecutando el modelo en local para preservar la privacidad.
- Preprocesado en pipelines de visión: uso como extractor de clase gruesa antes de un modelo más específico (detección de objetos o segmentación), filtrando imágenes irrelevantes y ahorrando cómputo en etapas posteriores.
- Aplicaciones web sin backend: la variante INT8 se ejecuta en el navegador vía MediaPipe Web con el demo oficial; útil para demos interactivas, educación y prototipado sin infraestructura.
- Sistemas embebidos y robótica de bajo consumo: despliegue en Raspberry Pi, Coral o dispositivos con acelerador NNAPI, donde el presupuesto de memoria es de decenas de MB y se requiere clasificación en tiempo real a baja resolución.
- Control de calidad visual en industria: clasificación rápida de piezas o productos en líneas de producción con cámaras de baja resolución, usando la variante INT8 para minimizar latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye top-1 ni top-5 de ImageNet para ninguna de las dos variantes, ni latencias medidas por plataforma. El paper de EfficientNet (arXiv:1905.11946) reporta resultados para la familia EfficientNet, pero no para la variante Lite2 concreta empaquetada aquí, por lo que no se trasladan cifras.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU de escritorio; el modelo está pensado para memoria unificada de dispositivos móviles. El fichero INT8 ocupa 7,17 MB y el FP32 24,33 MB en disco; el pico de memoria en ejecución es del orden de decenas de MB, no disponible con precisión.
- GPU recomendadas: no requiere GPU dedicada. Se ejecuta en CPU móvil, GPU integrada (GPU delegate de TFLite) y aceleradores NNAPI/Core ML. En escritorio, cualquier CPU moderna basta para inferencia en tiempo real.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en GPUs integradas; también en dispositivos sin GPU.
- Opciones de despliegue: MediaPipe Tasks (`ImageClassifier`), LiteRT/TensorFlow Lite (intérprete directo), delegados NNAPI (Android), Core ML (iOS), GPU delegate y XNNPACK. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fuertemente de la plataforma y del delegado usado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Tamaño INT8 | Clases | Licencia | Formato |
|---|---|---|---:|---:|---|---|
| EfficientNet-Lite2 (este) | CNN EfficientNet-Lite2 | 260×260 | 7,17 MB | 1.000 | Apache 2.0 | TFLite |
| EfficientNet-Lite0 (MediaPipe) | CNN EfficientNet-Lite0 | 224×224 | no disponible | 1.000 | Apache 2.0 | TFLite |
| MobileNetV3 (TFLite) | CNN MobileNetV3 | 224×224 | no disponible | 1.000 | Apache 2.0 | TFLite |
| EfficientNet-B2 (Keras) | CNN EfficientNet | 260×260 | no disponible | 1.000 | Apache 2.0 | SavedModel/H5 |

La comparación cualitativa que ofrece la model card es que Lite2 aporta mayor precisión que Lite0 a costa de mayor resolución y capacidad. No se dispone de cifras de precisión ni latencia para ninguna de las alternativas en la información proporcionada, por lo que no se puede cuantificar la diferencia.

## Limitaciones y advertencias

- Clasificador cerrado: solo reconoce las 1.000 clases de ImageNet-1k; cualquier objeto fuera de ese vocabulario se asignará a la clase más parecida, con riesgo alto de error semántico.
- Sesgos de ImageNet: el dataset tiene desequilibrios conocidos de representación geográfica, cultural y demográfica; el modelo hereda esos sesgos en las etiquetas.
- Sin calibración documentada: la model card no describe el conjunto de calibración usado para la cuantización INT8, por lo que la pérdida de precisión frente a FP32 no está cuantificada.
- Etiquetas solo en inglés: no hay soporte multilingüe en los nombres de clase.
- Sin detección de "desconocido": el softmax siempre devuelve probabilidades sobre las 1.000 clases; no hay umbral de rechazo integrado, hay que implementarlo en la aplicación.
- Uso comercial permitido por Apache 2.0, sin restricciones adicionales conocidas, pero conviene revisar las licencias de las dependencias de MediaPipe y LiteRT en el producto final.
- No apto para tareas generativas, VQA, detección de objetos con cajas ni segmentación; para eso se requieren otros modelos de MediaPipe (Object Detector, Image Segmenter).
- Los ficheros publicados tienen cero descargas y cero likes en el momento de la ficha; es un espejo comunitario de artefactos oficiales de Google, no un modelo entrenado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite2
- Fichero INT8: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite2/blob/main/efficientnet_lite2_int8.tflite
- Fichero FP32: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite2/blob/main/efficientnet_lite2_float32.tflite
- Etiquetas: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite2/blob/main/labels.txt
- Documentación de MediaPipe Image Classifier: https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier
- Guía de instalación de MediaPipe para Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- LiteRT: https://developers.google.com/edge/litert
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier
- Paper de EfficientNet: https://arxiv.org/abs/1905.11946
