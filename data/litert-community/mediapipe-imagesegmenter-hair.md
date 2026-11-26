# litert-community/MediaPipe-ImageSegmenter-Hair

## Resumen

MediaPipe-ImageSegmenter-Hair es un modelo de segmentación de imagen especializado en cabello, publicado por la comunidad litert-community en Hugging Face. Se distribuye como un fichero TFLite de 782 KB en precisión FP32, pensado para ejecutarse en dispositivo (on-device) mediante la tarea Image Segmenter de MediaPipe en Android, iOS, web, Python y Flutter. Su función concreta es generar una máscara por píxel con dos clases (fondo y cabello) sobre selfies, lo que lo hace idóneo para filtros AR de recoloreado de pelo y aplicaciones de realidad aumentada en tiempo real.

Técnicamente es una red encoder-decoder con conexiones skip que recibe un tensor de entrada de forma `[1, 512, 512, 4]` (RGB más un canal temporal/prior que rellena automáticamente el runtime de MediaPipe) y produce una salida de forma `[1, 512, 512, 2]` con probabilidades por clase. No es un modelo de lenguaje ni un modelo multimodal generativo: es un segmentador denso de propósito específico, con un tamaño mínimo que permite incluirlo en aplicaciones móviles sin penalizar el tamaño del binario.

Su relevancia actual radica en que ejemplifica el patrón de despliegue de modelos de visión ligeros en el ecosistema LiteRT/TFLite, con licencia Apache 2.0 y flujos de integración listos para producción en las principales plataformas móviles. No se dispone de información sobre parámetros totales, longitud de contexto (no aplica) ni idiomas soportados en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con conexiones skip (CNN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | FP32 (float32) según fichero publicado |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`hair_segmenter.tflite`, 781.618 bytes) |

Especificaciones adicionales del tensor:

| Dirección | Tensor | Forma | Tipo | Notas |
|---|---|---|---|---|
| Entrada | `input_1` | `[1, 512, 512, 4]` | float32 | Normalización `mean=[0.0]`, `std=[255.0]` |
| Salida | `conv2d_transpose_4` | `[1, 512, 512, 2]` | float32 | Máscaras por clase: `background`, `hair` |

Metadatos embebidos: `TFLITE_METADATA` con nombre `ImageSegmenter`, versión `1`, autor `MediaPipe`, y fichero asociado `labels.txt`.

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional de tipo encoder-decoder con conexiones skip, típica de los modelos de segmentación semántica densa. La entrada es un tensor de 4 canales y 512×512 píxeles: tres canales RGB más un cuarto canal de tipo temporal/prior que el runtime de MediaPipe `ImageSegmenter` rellena automáticamente. La salida es un mapa de 2 canales con probabilidades por píxel para las clases `background` y `hair`, lo que equivale a una segmentación binaria densa a resolución completa de entrada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a este tipo de modelo). Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura encoder-decoder con skip connections y la integración con el runtime de MediaPipe para el canal prior. El modelo se distribuye únicamente en FP32, sin variantes cuantizadas publicadas en la información disponible.

## Capacidades

- Segmentación densa de cabello en imágenes de selfie, con salida de probabilidad por píxel para las clases `background` y `hair`.
- Generación de máscaras de categoría y máscaras de confianza (opciones `output_category_mask` y `output_confidence_masks` del runtime).
- Ejecución on-device en Android, iOS, web, Python y Flutter mediante la tarea `ImageSegmenter` de MediaPipe.
- Integración con el ecosistema LiteRT/TFLite, con metadatos embebidos y fichero `labels.txt` asociado.
- Adecuado para pipelines de tiempo real en dispositivos móviles gracias a su tamaño reducido (782 KB) y a las latencias documentadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión de propósito único.
- No dispone de modo thinking, visión general, audio ni otras capacidades generativas.

## Casos de uso

- Filtros AR de recoloreado de pelo: el modelo genera una máscara binaria de cabello por píxel que permite recolorear solo la región capilar en aplicaciones de cámara en tiempo real, con latencias de decenas de milisegundos en móviles de gama media como el Pixel 6.
- Prueba virtual de tintes y productos capilares: en apps de e-commerce o de peluquería, la máscara permite previsualizar distintos colores o estilos sobre la foto del usuario sin subir la imagen a un servidor.
- Edición fotográfica on-device: integración en editores de imagen móviles para aplicar ajustes selectivos (color, brillo, saturación) únicamente sobre el cabello, preservando el resto de la escena.
- Segmentación previa en pipelines de embellecimiento: como paso anterior a modelos de generación o retoque facial, la máscara de cabello permite aislar la región y evitar artefactos en el resto de la imagen.
- Aplicaciones de videollamada y streaming: sustitución o recoloreado de cabello en tiempo real en el cliente, sin depender de servicios en la nube, gracias al despliegue nativo en Android, iOS y web.
- Prototipado rápido en Python y Flutter: el modelo se descarga con `huggingface_hub` y se ejecuta con `mediapipe` en pocas líneas, lo que facilita la validación de ideas y la creación de demos multiplataforma.
- Investigación en segmentación ligera: sirve como referencia de arquitectura encoder-decoder compacta para comparar técnicas de segmentación densa en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Latencia media del pipeline completo de la tarea MediaPipe Image Segmenter, según la documentación del Image Segmenter:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| HairSegmenter | Pixel 6 | 57,90 ms | no disponible en la información proporcionada |

No se han publicado resultados de benchmarks de calidad de segmentación (IoU, mIoU, F1) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está pensado para ejecución on-device en CPU/GPU móvil. El fichero pesa 782 KB en FP32 y la activación principal es de 512×512×4 en entrada y 512×512×2 en salida.
- GPU recomendadas: no se especifican GPU de escritorio; el objetivo son aceleradores móviles (GPU integradas en SoC Android/iOS) y CPU de dispositivos móviles.
- Cabe en cualquier GPU consumer y en cualquier dispositivo móvil moderno, dado el tamaño mínimo del modelo.
- Opciones de despliegue: MediaPipe Tasks (`ImageSegmenter`) en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript/TypeScript) y Flutter (Dart); el fichero es un `.tflite` compatible con el runtime LiteRT/TFLite.
- Latencia y throughput: 57,90 ms de latencia media en CPU sobre Pixel 6 según la documentación oficial; no se dispone de datos de throughput ni de latencia en GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de segmentación de cabello (parámetros, contexto, rendimiento, licencia y disponibilidad). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-ImageSegmenter-Hair | no disponible | no aplica | 57,90 ms CPU en Pixel 6 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de propósito único: solo segmenta cabello en imágenes de selfie; no es un modelo generativo ni multimodal y no debe evaluarse como tal.
- Riesgo de sesgo en la segmentación: al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos por tipo de cabello, tono de piel, peinados o condiciones de iluminación; se recomienda validar en la población objetivo antes de producción.
- Riesgo de errores en casos límite: cabello muy fino, fondos con colores similares, oclusiones parciales, sombreros o accesorios pueden degradar la máscara; no se han publicado métricas de calidad (IoU/mIoU) que permitan cuantificar este riesgo.
- Dependencia del runtime: el canal de entrada de 4 dimensiones debe ser rellenado por el runtime de MediaPipe `ImageSegmenter`; un uso fuera de este runtime requiere replicar ese preprocesado.
- Solo se distribuye en FP32: no hay variantes cuantizadas publicadas en la información disponible, lo que puede limitar optimizaciones adicionales de tamaño o latencia.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las condiciones de atribución y las de los componentes de MediaPipe subyacentes.
- No se documentan idiomas ni capacidades de texto: cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Hair
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Hair/blob/main/hair_segmenter.tflite
- Model card original (PDF): https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Hair/blob/main/Model%20Card%20-%20Hair%20Segmentation.pdf
- Documentación de MediaPipe Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Benchmarks de Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter#benchmarks
- Guía de configuración en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de configuración en Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de configuración en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de configuración en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de configuración en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Código fuente de la demo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-segmenter.ts
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook de Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
