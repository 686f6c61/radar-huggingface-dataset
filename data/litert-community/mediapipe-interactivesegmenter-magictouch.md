# litert-community/MediaPipe-InteractiveSegmenter-MagicTouch

## Resumen

MediaPipe MagicTouch (Interactive Segmenter) es un modelo de segmentación interactiva de imágenes desarrollado por Google y distribuido por la comunidad litert-community en Hugging Face. Resuelve un problema concreto: segmentar objetos indicados por el usuario mediante trazos o puntos positivos y negativos, sin necesidad de reentrenamiento ni de un modelo distinto por objeto. Se empaqueta como un bundle de MediaPipe Tasks (`interactive_segmentation.task`) de 30,5 MB y está pensado para inferencia on-device en Android, iOS, web, Python y Flutter.

La arquitectura es de dos etapas: un encoder que procesa la imagen una sola vez y un decoder ligero que se ejecuta en cada interacción del usuario. Esto permite refinamiento de baja latencia sin recalcular las características de la imagen completa. El bundle empaquetado corresponde a la versión v2, con resolución de 768 x 768 y cuantización INT8 en ambos submodelos.

Su relevancia actual radica en que ofrece segmentación promptable en el dispositivo con un tamaño reducido (30,5 MB) y licencia Apache 2.0, lo que facilita integrarla en aplicaciones móviles y web sin depender de servicios en la nube. No es un modelo de lenguaje: es un modelo de visión especializado en generación de máscaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de segmentación interactiva (dos grafos TFLite separados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de imagen 768 x 768 x 3 |
| Tipos de cuantizacion | INT8 (encoder y decoder) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) empaquetados en bundle `.task` de MediaPipe |

## Arquitectura y entrenamiento

El modelo sigue un diseño de dos etapas. El encoder (`interactive_segmentation_encoder.int8.tflite`, 28,26 MB) recibe una imagen RGB de forma `[-1, 768, 768, 3]` y produce cinco mapas de características multiescala: `384x384x16`, `192x192x24`, `96x96x40`, `48x48x80` y `24x24x192`. Se ejecuta una sola vez en la llamada `set_image()`. El decoder (`interactive_segmentation_decoder.int8.tflite`, 2,27 MB) recibe esos cinco mapas junto con un lienzo de prompt de `[1, 768, 768, 3]` y devuelve una máscara `[1, 768, 768, 1]`. Se ejecuta en cada llamada `segment(strokes)`, lo que permite refinamiento iterativo de baja latencia.

Ambos submodelos están cuantizados a INT8, aunque sus tensores de entrada y salida son `float32`. El bundle incluye además `manifest.pb` (50 B) y `metadata.pb` (12 B). La model card del repositorio señala que el PDF adjunto (`Model Card MagicTouch.pdf`, de 13 de marzo de 2023) documenta una versión anterior v1 de un solo grafo, `512 x 512 x 4` (aproximadamente 6 MB) en FP y unos 30 FPS en GPU de Pixel 7; el bundle actual empaqueta la versión v2 de dos etapas a 768 x 768 en INT8. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Segmentación interactiva promptable mediante trazos y puntos positivos y negativos (`BrushMode.POSITIVE` y negativos).
- Codificación de imagen única con decodificación por interacción, lo que permite refinamiento iterativo sin recomputar el encoder.
- Generación de máscaras de resolución completa a 768 x 768.
- Funcionamiento on-device en Android, iOS, web (JavaScript) y Flutter, además de Python.
- Integración nativa con MediaPipe Tasks mediante `InteractiveSegmenter`.
- No incluye tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Edición fotográfica en móvil: el usuario traza sobre un objeto y obtiene una máscara precisa para recortarlo o sustituir el fondo. El encoder se ejecuta una vez por imagen y cada trazo adicional solo invoca el decoder de 2,27 MB, lo que mantiene la interacción fluida en dispositivo.
- Herramientas de anotación de datasets: un anotador indica con puntos positivos y negativos el objeto de interés y el modelo genera la máscara, acelerando el etiquetado semántico de imágenes para entrenar otros modelos.
- Retoque y eliminación de objetos en apps de consumo: la máscara generada a 768 x 768 sirve como entrada para pipelines de inpainting o borrado de objetos, sin enviar la imagen a un servidor.
- Segmentación en tiempo real en web: mediante la demo y los bindings de MediaPipe para JavaScript, se puede integrar en un editor web que procese la imagen en el navegador.
- Aplicaciones de realidad aumentada: separar el sujeto del fondo en el dispositivo para superponer efectos o fondos virtuales en Android e iOS.
- Preprocesado en pipelines de visión: generar máscaras de objetos concretos como paso previo a clasificación, conteo o medición, aprovechando que el bundle es pequeño (30,5 MB) y no requiere GPU dedicada.
- Flujos de selección asistida en apps de productividad: selección de regiones de una imagen por trazo en herramientas de captura o documentación, con licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona, para la versión v1 anterior, una cifra de aproximadamente 30 FPS en la GPU de un Pixel 7; no se aportan métricas de IoU, latencia ni throughput para el bundle v2 INT8 de 768 x 768.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el bundle completo ocupa 30,5 MB, por lo que la huella de memoria es muy reducida y apta para dispositivos móviles.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución on-device (CPU/GPU/NPU móvil) mediante MediaPipe.
- Cabe en GPU de consumo: sí, por tamaño, aunque no se documentan requisitos mínimos concretos.
- Opciones de despliegue: MediaPipe Tasks (`InteractiveSegmenter`) en Python, web, Android, iOS y Flutter; los submodelos son TFLite y pueden ejecutarse con el runtime de TensorFlow Lite / LiteRT.
- Latencia y throughput: solo se documenta la cifra de aproximadamente 30 FPS en Pixel 7 GPU para la versión v1 de 512 x 512; no hay datos para la v2.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, la propia model card menciona la versión v1 del mismo modelo (un solo grafo, 512 x 512 x 4, aproximadamente 6 MB, FP, unos 30 FPS en Pixel 7 GPU), que es la única alternativa documentada; no se aportan datos de otros segmentadores interactivos.

| Modelo | Resolucion | Precision | Tamano | Etapas | Licencia |
|---|---|---|---|---|---|
| MagicTouch v2 (este bundle) | 768 x 768 | INT8 | 30,5 MB | Encoder + decoder | Apache 2.0 |
| MagicTouch v1 (referencia en PDF) | 512 x 512 x 4 | FP | aprox. 6 MB | Grafo unico | no disponible |

## Limitaciones y advertencias

- Modelo exclusivamente visual: no procesa texto, no soporta tool calling ni razonamiento multi-step.
- La calidad de la máscara depende de la precisión de los trazos del usuario; se requieren prompts positivos y negativos para refinar resultados ambiguos.
- No se documentan sesgos conocidos ni evaluación de robustez por tipo de imagen, iluminación o dominio.
- Riesgo de segmentación incorrecta en objetos con bordes poco definidos, oclusiones o imágenes de baja calidad; no hay métricas publicadas que cuantifiquen este riesgo.
- Resolución de entrada fija a 768 x 768; imágenes de otra resolución deben redimensionarse, lo que puede degradar la precisión en detalles finos.
- No hay información sobre el dataset de entrenamiento ni sobre limitaciones idiomáticas o culturales del dominio visual.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos de MediaPipe y LiteRT para el despliegue.
- El PDF de model card incluido documenta una versión anterior (v1); no debe tomarse como especificación del bundle v2 empaquetado.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-InteractiveSegmenter-MagicTouch
- Documentación de Interactive Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/interactive_segmenter
- Guía de instalación en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación en web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
