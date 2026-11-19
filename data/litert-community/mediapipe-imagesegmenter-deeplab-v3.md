# litert-community/MediaPipe-ImageSegmenter-DeepLab-V3

## Resumen

MediaPipe-ImageSegmenter-DeepLab-V3 es un modelo de segmentación semántica de propósito general empaquetado en formato TensorFlow Lite (`.tflite`) y distribuido por la comunidad `litert-community` para su uso con la tarea `ImageSegmenter` de MediaPipe. Se trata de una implementación de la arquitectura DeepLab-v3 con atrous spatial pyramid pooling (ASPP) que toma imágenes RGB de `257 x 257` píxeles y produce logits por píxel para 21 clases del conjunto Pascal VOC, incluyendo fondo, persona, vehículos, animales y mobiliario.

El modelo es extremadamente compacto (2,78 MB en FP32) y está diseñado para inferencia en dispositivo (on-device) en Android, iOS, web, Python y Flutter, sin necesidad de backend. Es relevante porque ofrece un componente listo para producción de segmentación semántica de baja latencia dentro del ecosistema MediaPipe, con metadatos TFLite embebidos (`labelmap.txt` y `labels.txt`) que simplifican la integración.

La relevancia actual radica en su naturaleza reproducible: los binarios del repositorio son byte-idénticos a los artefactos oficiales servidos por Google desde `storage.googleapis.com/mediapipe-models`, lo que facilita la verificación de procedencia y el despliegue en pipelines de visión por computador en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLab-v3 con atrous spatial pyramid pooling (ASPP); red neuronal convolucional para segmentación semántica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de `[1, 257, 257, 3]`) |
| Tipos de cuantizacion | FP32 (float32); el repositorio solo distribuye la variante FP32 |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), con metadatos `TFLITE_METADATA` embebidos |
| Tamano del artefacto | 2,78 MB (2.780.176 bytes) |
| Entrada | `sub_7`: `[1, 257, 257, 3]`, float32, normalización `mean=[127.5]`, `std=[127.5]` |
| Salida | `ResizeBilinear_3`: `[1, 257, 257, 21]`, float32 (logits/probabilidades por píxel) |
| Clases | 21 (Pascal VOC: background, aeroplane, bicycle, bird, boat, bottle, bus, car, cat, chair, cow, dining table, dog, horse, motorbike, person, potted plant, sheep, sofa, train, tv) |
| Resolución de entrada | `257 x 257` |
| SHA-256 | `ff36e24d40547fe9e645e2f4e8745d1876d6e38b332d39a82f0bf0f5d1d561b3` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeepLab-v3, una red convolucional para segmentación semántica que emplea atrous spatial pyramid pooling (ASPP) para capturar contexto multi-escala mediante convoluciones dilatadas a distintas tasas. La entrada es una imagen RGB de `257 x 257` píxeles normalizada con media y desviación estándar de 127.5, y la salida es un tensor de `257 x 257 x 21` con logits por píxel para cada una de las 21 clases Pascal VOC. El grafo está optimizado para TFLite y se ejecuta a través del runtime LiteRT/MediaPipe.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que el modelo es puramente de visión y la model card no detalla el proceso de entrenamiento. La innovación técnica destacable es la inclusión de metadatos TFLite embebidos (`labelmap.txt` y `labels.txt`) y la verificación de procedencia byte a byte contra los artefactos oficiales de Google, lo que garantiza reproducibilidad. El modelo está pensado para inferencia en dispositivo y no incorpora mecanismos de decodificación especulativa ni atención lineal.

## Capacidades

- Segmentación semántica densa por píxel sobre 21 clases Pascal VOC (fondo, persona, animales, vehículos, mobiliario).
- Generación de máscaras de categoría (`output_category_mask=True`) y máscaras de confianza opcionales (`output_confidence_masks`).
- Ejecución en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Integración con el runtime LiteRT/TFLite y el ecosistema MediaPipe (`ImageSegmenter`).
- Extracción de primer plano y efectos fotográficos basados en las clases segmentadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo exclusivamente de visión).
- No dispone de modo de pensamiento (thinking mode), visión generativa, audio ni otras capacidades multimodales más allá de la segmentación de imágenes.

## Casos de uso

- **Extracción de primer plano en apps móviles**: el modelo segmenta la clase `person` (índice 15) y permite generar máscaras para sustituir fondos en tiempo real en Android o iOS, con latencias de ~123,93 ms en CPU y ~103,30 ms en GPU sobre Pixel 6.
- **Efectos fotográficos y edición**: uso de las máscaras por categoría para aplicar desenfoque selectivo, cambio de color o recorte por clase (por ejemplo, aislar `cat`, `dog` o `car`) en aplicaciones de retoque.
- **Comprensión de escenas en el borde**: clasificación y localización densa de objetos Pascal VOC en dispositivos sin conectividad, útil en aplicaciones de realidad aumentada o asistentes de accesibilidad que describen la escena.
- **Automatización de recortes en pipelines de datos**: procesamiento por lotes en Python para generar máscaras de segmentación sobre datasets de imágenes y alimentar etapas posteriores de anotación o aumento de datos.
- **Segmentación en web con JavaScript**: integración en aplicaciones web mediante MediaPipe Web para segmentar imágenes subidas por el usuario directamente en el navegador, sin enviar datos a un servidor.
- **Prototipado rápido en Flutter**: uso del paquete `flutter-mediapipe` para incorporar segmentación semántica en apps multiplataforma con un único artefacto de 2,78 MB.
- **Filtros y máscaras en videollamadas**: segmentación de la clase `person` para aplicar fondos virtuales o difuminado en tiempo real en aplicaciones de comunicación.

## Benchmarks y rendimiento

La model card reporta latencias medias de extremo a extremo del pipeline MediaPipe Tasks para la variante DeepLab-V3:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| DeepLab-V3 | Pixel 6 | 123,93 ms | 103,30 ms |

No se han publicado resultados de benchmarks de precisión (mIoU, pixel accuracy, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo es de 2,78 MB en FP32; la huella de memoria es mínima y cabe holgadamente en cualquier GPU consumer, e incluso en memoria compartida de dispositivos móviles.
- **GPU recomendadas**: no requiere GPU dedicada; funciona en CPU de dispositivos móviles (Pixel 6 reportado) y en GPUs integradas. Para despliegues en servidor, cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente, aunque el modelo está pensado para el borde.
- **Compatibilidad con GPU consumer**: sí, cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada.
- **Opciones de despliegue**: MediaPipe Tasks (`ImageSegmenter`) en Python, Android, iOS, web y Flutter; runtime LiteRT/TFLite. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput estimados**: ~123,93 ms en CPU y ~103,30 ms en GPU sobre Pixel 6 para el pipeline completo de MediaPipe Tasks. No se dispone de datos de throughput para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Resolución | Licencia | Formato | Latencia reportada |
|---|---|---|---:|---|---|---|
| MediaPipe-ImageSegmenter-DeepLab-V3 | Segmentación semántica | 21 (Pascal VOC) | 257 x 257 | Apache 2.0 | TFLite | 123,93 ms CPU / 103,30 ms GPU (Pixel 6) |
| Otros modelos de la familia MediaPipe Image Segmenter | Segmentación semántica | no disponible | no disponible | no disponible | TFLite | no disponible |
| Alternativas de segmentación en el borde (por ejemplo, variantes ligeras de DeepLab) | Segmentación semántica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- **Restricción de vocabulario**: el modelo solo segmenta las 21 clases Pascal VOC; los objetos fuera de ese vocabulario no se separan y se asignan a la clase más probable entre las disponibles.
- **Resolución fija**: la entrada está limitada a `257 x 257`, lo que puede producir pérdida de detalle en bordes finos y objetos pequeños.
- **Sesgos**: no se ha publicado un informe de equidad (fairness) específico para DeepLab-v3 en la página de documentación de MediaPipe; se desconoce el comportamiento diferencial por demografía, iluminación o tipo de escena.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero pueden producirse segmentaciones erróneas en píxeles ambiguos o de baja confianza.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del binario (el repositorio garantiza identidad byte a byte con los artefactos oficiales de Google).
- **Caveat de producción**: el modelo está pensado para inferencia en dispositivo; para cargas de servidor de alta concurrencia conviene evaluar el throughput real y el consumo energético en el hardware objetivo.
- **Sin soporte lingüístico ni multimodal**: no debe emplearse para tareas de texto, audio o razonamiento; su ámbito es exclusivamente la segmentación de imágenes.

## Enlaces

- [Hugging Face: litert-community/MediaPipe-ImageSegmenter-DeepLab-V3](https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-DeepLab-V3)
- [Archivo del modelo `deeplab_v3.tflite`](https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-DeepLab-V3/blob/main/deeplab_v3.tflite)
- [Documentación de MediaPipe Image Segmenter](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter)
- [Demo web de Image Segmenter](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter)
- [Guía de configuración en Python](https://developers.google.com/edge/mediapipe/solutions/setup_python)
- [Guía de configuración en Web/JavaScript](https://developers.google.com/edge/mediapipe/solutions/setup_web)
- [Guía de configuración en Android](https://developers.google.com/edge/mediapipe/solutions/setup_android)
- [Guía de configuración en iOS](https://developers.google.com/edge/mediapipe/solutions/setup_ios)
- [Guía de configuración en Flutter](https://developers.google.com/edge/mediapipe/solutions/setup_flutter)
- [Ejemplo Android en mediapipe-samples](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android)
- [Ejemplo iOS en mediapipe-samples](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios)
- [Notebook de Python en Colab](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb)
- [Ejemplo Flutter en flutter-mediapipe](https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter)
- [Artefacto oficial servido por Google](https://storage.googleapis.com/mediapipe-models/deeplab_v3.tflite)
