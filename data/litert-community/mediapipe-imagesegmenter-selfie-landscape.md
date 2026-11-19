# litert-community/MediaPipe-ImageSegmenter-Selfie-Landscape

## Resumen

MediaPipe Selfie Segmenter (Landscape 144×256) es un modelo de segmentación de imagen orientado a la separación de la persona del fondo en flujos de vídeo con relación de aspecto apaisada (16:9). Lo publica la organización `litert-community` en Hugging Face a partir del modelo original de Google MediaPipe, y se distribuye como un único archivo TFLite de 250 KB con pesos en FP16. Su función es generar una máscara de segmentación por píxel que aísla a la persona del fondo en tiempo real, pensada para videollamadas de escritorio, webcams y efectos de realidad aumentada.

Técnicamente es una red encoder-decoder de la familia MobileNetV3, la misma que el `selfie_segmenter.tflite` estándar, pero reformada para aceptar fotogramas RGB de `[1, 144, 256, 3]` (H×W). Esta orientación apaisada reduce el coste computacional en transmisiones de vídeo anchas, donde el encuadre horizontal es la norma. El modelo se integra mediante la tarea `ImageSegmenter` de MediaPipe, disponible en Python, Web/JavaScript, Android, iOS y Flutter.

Su relevancia actual reside en que es un componente de segmentación en dispositivo (on-device) extremadamente ligero, con licencia Apache 2.0 y latencias del orden de decenas de milisegundos en hardware móvil. No es un modelo de lenguaje ni un modelo generativo: es una herramienta de visión por computador especializada, y la ficha se limita a describir sus capacidades reales de segmentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de la familia MobileNetV3 (red convolucional) |
| Parametros totales | no disponible (pesos en FP16, archivo de 250,2 KB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP16 (pesos); entrada y salida en float32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`selfie_segmenter_landscape.tflite`) |
| Entrada | `input_1`: `[1, 144, 256, 3]`, float32, normalización mean=[0.0], std=[255.0] |
| Salida | `segment_back`: `[1, 144, 256, 1]`, float32 (máscara de segmentación) |
| Metadatos embebidos | `TFLITE_METADATA`: name `ImageSegmenter`, version `1`, author `MediaPipe`, archivo asociado `labels.txt` |
| Tarea MediaPipe | `ImageSegmenter` |
| Plataformas | Python, Web/JavaScript, Android (Kotlin/Java), iOS (Swift), Flutter (Dart) |

## Arquitectura y entrenamiento

El modelo es una red convolucional encoder-decoder de tipo MobileNetV3, la misma familia que el segmentador de selfies estándar de MediaPipe, pero con la entrada reformada a `[1, 144, 256, 3]` para encuadres apaisados. La entrada se normaliza con media 0.0 y desviación 255.0, y la salida es una máscara float32 de `[1, 144, 256, 1]` que representa la probabilidad de pertenencia al objeto segmentado (la persona) frente al fondo. El archivo incluye metadatos TFLite que declaran la tarea `ImageSegmenter` y un archivo `labels.txt` asociado.

No se detalla en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de ajuste fino con RLHF/DPO (no aplicables a este tipo de modelo). La model card indica que la evaluación de equidad se realizó sobre 1.594 imágenes comparadas con un IoU humano entre anotadores del 98,74%, y que el modelo upstream de Google data de mayo de 2021. No se especifican innovaciones como decodificación especulativa o atención lineal, que no aplican a esta arquitectura.

## Capacidades

- Segmentación de imagen por píxel: genera una máscara de confianza (`segment_back`) que separa a la persona del fondo en fotogramas RGB.
- Segmentación de retrato/selfie en orientación apaisada, optimizada para encuadres 16:9.
- Salida de máscara de categoría y máscaras de confianza mediante las opciones `output_category_mask` y `output_confidence_masks` de la tarea `ImageSegmenter`.
- Ejecución en dispositivo (on-device) en Android, iOS, Web, Python y Flutter.
- Modo de ejecución `IMAGE` (y modos de vídeo/stream según la API de MediaPipe, no detallados en la información disponible).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Videollamadas con desenfoque o sustitución de fondo: el modelo genera en tiempo real una máscara de la persona sobre fotogramas 16:9 de webcam, adecuada para integrarse en clientes de videoconferencia de escritorio y navegador.
- Efectos de realidad aumentada en apps móviles: permite recortar al usuario y aplicar filtros, marcos o fondos virtuales en Android e iOS con latencias de decenas de milisegundos.
- Procesamiento en navegador sin servidor: al ser un TFLite de 250 KB, puede ejecutarse en Web/JavaScript en el cliente, evitando enviar vídeo a un backend y reduciendo costes de infraestructura.
- Herramientas de creación de contenido: separación de persona y fondo para edición de vídeo o generación de miniaturas en pipelines de escritorio con Python.
- Aplicaciones de Flutter multiplataforma: integración en apps móviles y de escritorio mediante el paquete `flutter-mediapipe`, reutilizando el mismo modelo en varias plataformas.
- Prototipado rápido de visión por computador: sirve como baseline ligero para experimentos de segmentación binaria persona/fondo antes de escalar a modelos mayores.
- Telemedicina o docencia en remoto: recorte del ponente en transmisiones apaisadas para composición de escenas con presentaciones o pizarras digitales.

## Benchmarks y rendimiento

Latencia media de la pipeline completa de la tarea MediaPipe `ImageSegmenter`, según la documentación oficial del Image Segmenter:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| SelfieSegmenter (landscape) | Pixel 6 | 34,19 ms | 33,55 ms |

Evaluación de equidad del modelo landscape 144×256 (1.594 imágenes frente a un IoU humano entre anotadores del 98,74%):

| Métrica | Valor |
|---|---|
| IoU medio en 17 subregiones geográficas de la ONU | 95,99 ± 0,87 % |
| Rango de IoU entre subregiones | 94,71 % – 97,27 % |
| Desviación máxima por región | 1,28 % |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 250 KB y está pensado para ejecución en CPU/GPU móvil o en navegador, sin requisitos de VRAM dedicada significativos.
- GPU recomendadas: no aplica en el sentido de GPU de datacenter; se ejecuta en la GPU integrada de dispositivos móviles (Pixel 6 reportado) y en GPUs de consumo mediante delegados TFLite.
- Cabe en cualquier GPU de consumo y en la mayoría de CPUs modernas; no requiere acelerador dedicado.
- Opciones de despliegue: MediaPipe Tasks (`ImageSegmenter`) en Python, Web/JavaScript, Android, iOS y Flutter; el archivo TFLite puede ejecutarse con el intérprete TFLite y sus delegados (CPU, GPU, NNAPI en Android, Core ML en iOS).
- Latencia y throughput estimados: 34,19 ms en CPU y 33,55 ms en GPU sobre Pixel 6 para la pipeline completa, lo que equivale a aproximadamente 29 FPS en ambos casos en ese dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Tamano | Licencia | Plataformas |
|---|---|---|---|---|---|
| MediaPipe Selfie Segmenter Landscape 144×256 (este modelo) | Segmentación persona/fondo, MobileNetV3 | 144×256×3 | 250,2 KB (FP16) | Apache 2.0 | Python, Web, Android, iOS, Flutter |
| MediaPipe Selfie Segmenter estándar (`selfie_segmenter.tflite`) | Segmentación persona/fondo, MobileNetV3 | no disponible en la información | no disponible | Apache 2.0 (upstream MediaPipe) | Python, Web, Android, iOS, Flutter |
| Otros segmentadores de retrato de la familia MediaPipe | Segmentación persona/fondo | no disponible | no disponible | Apache 2.0 (upstream MediaPipe) | MediaPipe Tasks |

No se dispone en la información proporcionada de datos comparativos de parámetros, contexto o rendimiento frente a alternativas de otros proveedores; los modelos comparables citados pertenecen a la misma familia upstream de Google MediaPipe.

## Limitaciones y advertencias

- Usos fuera de alcance explícitos: cualquier forma de vigilancia o reconocimiento de identidad está fuera de alcance y no está habilitada por esta tecnología.
- No debe usarse para decisiones críticas para la vida humana.
- Rendimiento degradado con varias personas a escalas muy diferentes o con personas a más de 4 metros (14 pies) de la cámara.
- Es un modelo de segmentación binaria persona/fondo; no identifica individuos ni proporciona reconocimiento facial.
- La evaluación de equidad reportada cubre 17 subregiones geográficas y métricas de sesgo por tono de piel (Fitzpatrick), pero los datos completos de esa evaluación no se detallan en la información disponible.
- Riesgo de alucinación no aplica (no es un modelo generativo); el riesgo principal es una máscara imprecisa en condiciones de iluminación, oclusión o encuadre no apaisado.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del modelo upstream de Google MediaPipe.
- El modelo está optimizado para orientación apaisada; para encuadres verticales o cuadrados es preferible la variante estándar de la familia.
- No procesa texto ni audio; no debe emplearse en tareas de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Landscape
- Archivo del modelo: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Landscape/blob/main/selfie_segmenter_landscape.tflite
- Model card upstream (PDF): https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Landscape/blob/main/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf
- Documentación Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter#task_benchmarks
- Guía de instalación Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
