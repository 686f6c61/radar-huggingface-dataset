# litert-community/MediaPipe-ImageSegmenter-Selfie-Landscape

## Resumen

MediaPipe-ImageSegmenter-Selfie-Landscape es un modelo de segmentación de imagen orientado a la separación de la persona (selfie) respecto al fondo en fotogramas con relación de aspecto apaisada (16:9). Lo publica la comunidad litert-community en Hugging Face, empaquetado como `selfie_segmenter_landscape.tflite` con pesos en FP16 y un tamano de tan solo 250 KB. Deriva de la familia de segmentadores selfie de MediaPipe de Google, con una arquitectura encoder-decoder de tipo MobileNetV3, y esta disenado para ejecutarse en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante la tarea `ImageSegmenter` de MediaPipe.

El modelo resuelve un problema muy concreto: la segmentacion de persona en tiempo real para videollamadas, webcams de escritorio y flujos de video con formato panoramico. A diferencia de la variante cuadrada `selfie_segmenter.tflite`, esta version acepta entradas `[1, 144, 256, 3]` RGB, lo que reduce el coste computacional en streams anchos sin necesidad de recortar o deformar el fotograma. La salida es una mascara de segmentacion `segment_back` de forma `[1, 144, 256, 1]` en float32.

Su relevancia actual reside en que ofrece segmentacion de persona de baja latencia y huella minima (250 KB) sin depender de la nube, lo que lo hace apto para aplicaciones de privacidad estricta, dispositivos con recursos limitados y pipelines de vision por computador en el borde. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. No es un modelo de lenguaje ni un modelo generativo: es un modelo discriminativo de vision especializado en una unica tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de tipo MobileNetV3 (familia MediaPipe Selfie Segmenter) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | Pesos en float16; el archivo distribuido es FP16 (250,177 B) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), con metadatos `TFLITE_METADATA` embebidos (name `ImageSegmenter`, version `1`, author `MediaPipe`) |
| Entrada | `input_1`, forma `[1, 144, 256, 3]`, float32, normalizacion mean=[0.0], std=[255.0] |
| Salida | `segment_back`, forma `[1, 144, 256, 1]`, float32, mascara de segmentacion |
| Tamano del archivo | 250.2 KB (250,177 B) |
| SHA-256 | `490e9ea734313e0de10fa0cd9e3c6133e36ea4db2b7a49bde9ef019f72796b8e` |
| Tarea MediaPipe | `ImageSegmenter` (Vision) |
| Etiquetas | `labels.txt` empaquetado en los metadatos |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura encoder-decoder de tipo MobileNetV3, la misma familia que `selfie_segmenter.tflite`, pero con la entrada reformada a `[1, 144, 256, 3]` para fotogramas apaisados. La entrada se normaliza con media 0.0 y desviacion 255.0, y la salida es una mascara de un solo canal `segment_back` que representa la probabilidad de pertenencia a la clase persona/fondo. El modelo esta empaquetado como TFLite con metadatos asociados (nombre `ImageSegmenter`, version 1, autor MediaPipe) y un archivo `labels.txt` embebido.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a un modelo discriminativo de vision). La model card indica que es identico en familia al segmentador selfie cuadrado, unicamente reformado para aspecto panoramico con el fin de reducir computo en streams de videoconferencia anchos. Los pesos se distribuyen en float16, lo que reduce el tamano del artefacto a 250 KB.

## Capacidades

- Segmentacion de persona (selfie) frente al fondo en imagenes RGB con formato apaisado 16:9.
- Generacion de mascara de segmentacion binaria/probabilistica por pixel (`segment_back`) a resolucion 144x256.
- Salida de mascaras de confianza y mascara de categoria mediante la opcion `output_confidence_masks` y `output_category_mask` de la API `ImageSegmenter`.
- Ejecucion on-device en Android, iOS, web (JavaScript), Python y Flutter.
- Inferencia de baja latencia y huella minima (250 KB), apta para tiempo real en dispositivos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Videollamadas con desenfoque o reemplazo de fondo: el modelo segmenta a la persona en fotogramas 16:9 y permite aplicar desenfoque o sustitucion del fondo en tiempo real en apps de videoconferencia de escritorio y webcams, gracias a su entrada panoramica y su bajo coste computacional.
- Efectos de camara en navegador: integrado via MediaPipe Tasks para web, permite aplicar mascaras, filtros o recortes de persona en streams de `getUserMedia` sin enviar video al servidor, preservando la privacidad.
- Aplicaciones moviles de fotografia y video: en Android e iOS, se usa para recortar personas, aplicar fondos virtuales o generar stickers en apps de camara, con un artefacto de 250 KB que no penaliza el tamano de la app.
- Reuniones y webinars con fondo virtual: en pipelines de videoconferencia de escritorio, la mascara permite sustituir el fondo por imagenes o videos manteniendo la persona enfocada, con latencia adecuada para 30 fps en hardware consumer.
- Preprocesado en pipelines de vision: sirve como etapa de segmentacion de persona para tareas posteriores como estimacion de pose, reidentificacion o analisis de presencia, filtrando el fondo antes de pasos mas costosos.
- Demos y prototipos en Flutter: el paquete `flutter-mediapipe` incluye un sample de `image_segmenter` que permite validar rapidamente la segmentacion en apps multiplataforma antes de integrar en produccion.
- Privacidad por diseno en el borde: al ejecutarse on-device, evita enviar fotogramas a la nube, lo que resulta adecuado para aplicaciones en sectores regulados (salud, educacion) donde el video no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una seccion de "Latency Benchmarks" en la documentacion de MediaPipe Image Segmenter, pero el contenido citado se trunca y no incluye cifras concretas. No se aportan datos de latencia, throughput ni metricas de calidad (IoU, mAP) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo es de 250 KB y se ejecuta en CPU, GPU integrada o aceleradores moviles (NNAPI, Core ML, WebGL/WASM). La memoria en runtime es minima (unos pocos MB incluyendo buffers de entrada/salida de 144x256x3 y 144x256x1).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de moviles, portatiles y navegadores. En escritorio puede acelerarse con GPU integrada o delegados de TFLite.
- Cabe en cualquier GPU consumer y en practicamente cualquier dispositivo movil moderno; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: MediaPipe Tasks (`ImageSegmenter`) en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript/TypeScript) y Flutter (Dart); el artefacto es TFLite y puede ejecutarse con el interprete TFLite o con delegados (NNAPI, Core ML, GPU).
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la documentacion de MediaPipe para benchmarks de latencia end-to-end, pero las cifras no se incluyen en el extracto.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-ImageSegmenter-Selfie-Landscape (este) | no disponible (250 KB FP16) | 144x256x3 RGB | no aplica | Apache 2.0 | Hugging Face, TFLite |
| `selfie_segmenter.tflite` (MediaPipe, variante cuadrada) | misma familia MobileNetV3 | entrada cuadrada (no especificada en la informacion) | no aplica | Apache 2.0 | MediaPipe / Google |
| Segmentadores de persona genericos (p. ej. basados en DeepLab o Mask R-CNN) | millones de parametros | resoluciones variables | no aplica | variable | variable |

La comparativa se limita a la familia MediaPipe porque la informacion proporcionada no incluye datos de rendimiento de alternativas. La diferencia clave frente a la variante cuadrada es la forma de entrada apaisada (144x256) que reduce computo en streams 16:9. No se dispone de datos de benchmarks para comparar calidad (IoU) ni latencia con alternativas.

## Limitaciones y advertencias

- Modelo especializado unicamente en segmentacion de persona/fondo; no segmenta otras clases (coche, mascota, objetos) ni ofrece segmentacion semantica general.
- Entrada fija de 144x256; resoluciones distintas requieren redimensionado previo, lo que puede degradar la precision en rostros pequenos o escenas complejas.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento (tono de piel, genero, iluminacion, fondos); es probable que herede sesgos de los datos originales de MediaPipe, no documentados aqui.
- Riesgo de mascaras imprecisas en bordes de pelo, ropa con colores similares al fondo o condiciones de baja iluminacion; no hay metricas publicadas de calidad en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card PDF upstream de Google para terminos adicionales del modelo original.
- No apto para tareas de texto, razonamiento, codigo o agentes; su uso esta acotado a vision por computador.
- El contenido de la model card citada se trunca en la seccion de benchmarks de latencia, por lo que no se pueden verificar cifras de rendimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Landscape
- Documentacion de MediaPipe Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Sample Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Sample iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Sample Web (TypeScript): https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-segmenter.ts
- Sample Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Guias de setup: Python https://developers.google.com/edge/mediapipe/solutions/setup_python · Web https://developers.google.com/edge/mediapipe/solutions/setup_web · Android https://developers.google.com/edge/mediapipe/solutions/setup_android · iOS https://developers.google.com/edge/mediapipe/solutions/setup_ios · Flutter https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Model card PDF upstream: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Landscape/blob/main/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf
