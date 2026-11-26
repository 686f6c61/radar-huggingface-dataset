# litert-community/MediaPipe-InteractiveSegmenter-MagicTouch

## Resumen

MediaPipe MagicTouch (Interactive Segmenter) es un paquete de segmentación interactiva de imágenes publicado por la organización `litert-community` en Hugging Face. Se distribuye como un bundle `.task` de 30,5 MB para la tarea `InteractiveSegmenter` de MediaPipe, orientado a la segmentación guiada por indicaciones del usuario (puntos o trazos positivos y negativos) sobre una imagen ya cargada. El modelo no es un modelo generativo de lenguaje, sino un componente de visión por computador para ejecución en dispositivo (on-device) en Android, iOS, web, Python y Flutter.

La arquitectura es un esquema de dos etapas con estado: un codificador INT8 que procesa la imagen una sola vez en `set_image()` y produce cinco mapas de características multiescala, y un decodificador INT8 ligero que se ejecuta en cada trazo del usuario en `segment(strokes)` para refinar la máscara. El bundle empaqueta la versión v2 a resolución 768×768 con cuantización INT8, que sustituye al modelo v1 de un solo grafo a 512×512 en FP documentado en la model card original de marzo de 2023.

Su relevancia actual reside en la separación entre extracción de características e inferencia interactiva: permite refinar la segmentación con latencia baja tras un único coste inicial de codificación, lo que encaja con aplicaciones de edición de imagen, retoque fotográfico y anotación asistida en dispositivos móviles sin depender de servidores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador de segmentación interactiva (dos submodelos TFLite: encoder + decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 768×768) |
| Tipos de cuantización | INT8 (encoder y decoder) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (bundle MediaPipe con submodelos `.tflite` INT8) |

## Arquitectura y entrenamiento

El bundle contiene dos submodelos TFLite cuantizados a INT8. El codificador (`interactive_segmentation_encoder.int8.tflite`, 28,26 MB) recibe un tensor de entrada `[-1, 768, 768, 3]` en float32 y devuelve cinco mapas de características multiescala con formas `384×384×16`, `192×192×24`, `96×96×40`, `48×48×80` y `24×24×192`. Se ejecuta una única vez por imagen en `set_image()`. El decodificador (`interactive_segmentation_decoder.int8.tflite`, 2,27 MB) recibe el lienzo de indicaciones `[1, 768, 768, 3]` junto con los cinco mapas cacheados del codificador y produce una máscara `[1, 768, 768, 1]` en float32. Se ejecuta en cada llamada a `segment(strokes)`.

El diseño es explícitamente stateful: la imagen se codifica una vez y las sucesivas indicaciones del usuario (trazos positivos y negativos) reutilizan las características cacheadas, lo que reduce el coste por refinamiento. La model card diferencia claramente esta versión v2 (768×768, INT8, dos etapas) del modelo v1 documentado en el PDF adjunto (un solo grafo `512×512×4`, aproximadamente 6 MB en FP, con unos 30 FPS en la GPU de un Pixel 7). No se proporcionan en la información disponible datos sobre el conjunto de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO; tampoco se detalla la innovación algorítmica interna más allá de la separación encoder/decoder y el uso de indicaciones tipo brush.

## Capacidades

- Segmentación interactiva de imágenes guiada por indicaciones de punto o trazo (positivas y negativas).
- Generación de máscaras de segmentación de objetos indicados por el usuario mediante `InteractiveSegmenter`.
- Modo brush (`InteractiveSegmenterBrushMode`) para trazos continuos, además de indicaciones puntuales.
- Inferencia en dispositivo en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Procesamiento de imágenes a resolución 768×768 con mapas de características multiescala.
- Refinamiento iterativo de la máscara sin recodificar la imagen, gracias al estado interno del bundle.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, generación de texto ni capacidades multilingües: es un modelo exclusivamente de visión.

## Casos de uso

- Edición fotográfica en móvil: el usuario toca o traza sobre un objeto y el modelo devuelve la máscara para recortes o sustitución de fondo; el codificador se ejecuta una vez y cada trazo adicional solo invoca el decodificador de 2,27 MB, lo que mantiene la interacción ágil en Android e iOS.
- Anotación asistida de datasets: un anotador indica con trazos positivos y negativos la región de interés y el modelo genera la máscara, reduciendo el tiempo frente a la anotación poligonal manual; la licencia Apache 2.0 permite integrarlo en pipelines internos y comerciales.
- Herramientas de retoque en web: mediante el ejemplo de MediaPipe Samples Web y el bundle `.task`, se puede ofrecer segmentación interactiva en el navegador sin backend, con el coste de codificación asumido en el cliente.
- Aplicaciones de realidad aumentada: segmentar un objeto indicado por el usuario para aplicar efectos, oclusiones o superposiciones en tiempo real en dispositivos móviles, aprovechando el diseño on-device y la reutilización de características.
- Asistencia a la accesibilidad: selección de regiones de una imagen mediante indicaciones simples (un toque o un trazo) para usuarios con dificultades de precisión, con refinamiento iterativo sin recarga del modelo.
- Prototipado rápido en Python/Colab: el notebook de ejemplo permite validar flujos de segmentación interactiva antes de portar la lógica a Android, iOS, Flutter o web con el mismo bundle.
- Preprocesado en aplicaciones de visión: generar máscaras de objetos para tareas posteriores (medición, clasificación por región, composición) en entornos sin conectividad, dado que el modelo se ejecuta localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona, para el modelo v1 anterior documentado en el PDF adjunto, una cifra de aproximadamente 30 FPS en la GPU de un Pixel 7; no se aportan métricas de IoU, latencia ni throughput para la versión v2 INT8 de 768×768 incluida en este bundle.

## Requisitos de hardware

- VRAM estimada: no disponible; el bundle es de 30,53 MB (encoder 28,26 MB + decoder 2,27 MB), por lo que el peso en memoria es reducido, pero no se publican cifras de memoria en ejecución.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución on-device en Android, iOS y web, no para despliegue en GPU de servidor.
- Cabe en GPU de consumo: sí, por tamaño (30,53 MB), aunque la información disponible no detalla requisitos de memoria ni compatibilidad con GPUs de escritorio.
- Opciones de despliegue: MediaPipe Tasks (`InteractiveSegmenter`) en Python, Android, iOS, web y Flutter; los submodelos son TFLite INT8, por lo que también pueden ejecutarse con el runtime LiteRT/TFLite.
- Latencia y throughput: no disponibles para la versión v2; solo se cita ≈30 FPS en Pixel 7 GPU para el modelo v1 de 512×512 en FP.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de segmentación interactiva (por ejemplo, variantes de SAM) que permitan una comparación rigurosa de parámetros, contexto, resultados o latencia.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto ni lenguaje, por lo que no admite prompts en lenguaje natural ni tareas de generación.
- Depende de indicaciones del usuario (puntos o trazos); la calidad de la máscara está condicionada a la precisión de dichas indicaciones.
- Resolución de entrada fija a 768×768; no se documenta comportamiento con imágenes de otras resoluciones o relaciones de aspecto.
- No se publican datos sobre sesgos, dominios de entrenamiento ni robustez ante imágenes fuera de distribución.
- Riesgo de segmentación incorrecta en objetos ambiguos, oclusiones o bordes poco definidos; no se aportan métricas de error.
- La model card advierte de una discrepancia entre el PDF adjunto (modelo v1, 512×512, FP) y el bundle real (v2, 768×768, INT8); conviene no tomar las cifras del PDF como válidas para este paquete.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los componentes de MediaPipe y de los ejemplos de código enlazados.
- No se especifican requisitos de memoria en ejecución ni latencias para la versión v2, lo que dificulta planificar producción sin mediciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-InteractiveSegmenter-MagicTouch
- Documentación de MediaPipe Interactive Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/interactive_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/interactive_segmentation/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/python/interactive_segmenter.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/interactive-segmenter.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/interactive_segmenter
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/interactive_segmenter
- Model card original (PDF en el repo): https://huggingface.co/litert-community/MediaPipe-InteractiveSegmenter-MagicTouch/blob/main/Model%20Card%20MagicTouch.pdf
