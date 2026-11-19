# litert-community/MediaPipe-GestureRecognizer

## Resumen

MediaPipe Gesture Recognizer es un pipeline de visión por computador para reconocimiento de gestos de la mano, empaquetado como un archivo `.task` de MediaPipe y publicado en Hugging Face por la organización `litert-community`. No es un modelo de lenguaje ni un transformer generativo: es un conjunto anidado de cuatro submodelos TFLite (detector de palmas, detector de 21 puntos clave 3D, embedder de geometría de mano y clasificador de gestos) que trabajan en cadena para identificar ocho gestos predefinidos a partir de una imagen o un flujo de vídeo.

El paquete completo pesa 8,37 MB con pesos en FP16 y está diseñado explícitamente para inferencia *on-device* en Android, iOS, web, Python y Flutter. La clasificación final no opera sobre píxeles crudos, sino sobre la geometría de los puntos clave de la mano, lo que reduce el coste computacional y mejora la robustez frente a variaciones de iluminación o fondo.

Es relevante para desarrolladores que necesitan interacción gestual en tiempo real sin depender de la nube ni de GPUs: el tamaño reducido y el formato TFLite permiten ejecutarlo en dispositivos móviles y navegadores. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline MediaPipe de cuatro submodelos TFLite: detector de palmas (CNN), detector de landmarks 3D, embedder de mano y clasificador de gestos |
| Parametros totales | No disponible (el autor no publica recuento de parámetros; el paquete pesa 8,37 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | Pesos en FP16; no se documentan otras variantes en el repositorio |
| Idiomas soportados | No disponible (no procesa texto; las etiquetas de salida están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (archivo MediaPipe que contiene miembros `.tflite` anidados) |

## Arquitectura y entrenamiento

El pipeline es una cascada de dos bundles anidados. El primero, `hand_landmarker.task` (7,82 MB), contiene un detector de palmas con entrada `[1, 192, 192, 3]` y salidas de 2016 anclas con 18 valores de regresión y una puntuación de detección, seguido de un detector de landmarks con entrada `[1, 224, 224, 3]` que produce 63 coordenadas normalizadas, 63 coordenadas en espacio mundo, una puntuación de presencia y una puntuación de lateralidad (izquierda/derecha). El segundo, `hand_gesture_recognizer.task` (554 KB), contiene un embedder que toma `[1, 21, 3]` landmarks, lateralidad y landmarks mundo para generar un vector de 128 dimensiones, y un clasificador que mapea ese embedding a 8 clases.

La innovación principal es que el clasificador de gestos nunca ve píxeles: opera sobre la geometría de la mano ya extraída, lo que hace que el clasificador final sea minúsculo (7,8 KB). El material de referencia incluye el paper arXiv:2006.10214 y una model card de Google de 2022 sobre clasificación de gestos con análisis de equidad. No se detallan en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento, ni si hubo ajuste por RLHF o DPO (no aplicable en este dominio).

## Capacidades

- Detección de manos en imagen o vídeo, con soporte para múltiples manos por fotograma.
- Extracción de 21 puntos clave 3D por mano, en coordenadas normalizadas y en coordenadas mundo.
- Clasificación de lateralidad (mano izquierda o derecha) con puntuación de confianza.
- Reconocimiento de 8 gestos: `Unknown`, `Closed_Fist`, `Open_Palm`, `Pointing_Up`, `Thumb_Down`, `Thumb_Up`, `Victory` e `ILoveYou`.
- Ejecución *on-device* en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Inferencia en tiempo real sobre flujos de cámara, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de lenguaje; es un modelo puramente perceptivo.

## Casos de uso

- Control gestual en aplicaciones móviles: integración con la API `GestureRecognizer` de MediaPipe Tasks en Android o iOS para sustituir botones por gestos como `Thumb_Up` o `Open_Palm`, con latencia propia de un modelo de 8 MB ejecutado en CPU.
- Interfaces sin contacto en navegador: la demo web oficial y el soporte de MediaPipe para web permiten desplegar reconocimiento de gestos en páginas con acceso a cámara, útil en quioscos o presentaciones.
- Accesibilidad: personas con movilidad reducida pueden usar gestos de la mano como entrada alternativa; la salida de 21 landmarks permite además construir controles personalizados sobre la posición de los dedos.
- Automatización de señalización en videollamadas: detección de `Thumb_Up` o `Victory` para reacciones o encuestas rápidas en aplicaciones de reuniones, procesando cada fotograma localmente para preservar la privacidad.
- Robótica e interacción humano-máquina: uso de los landmarks 3D y la lateralidad para mapear la pose de la mano a actuadores o a un cursor, con el clasificador de gestos como capa de comandos discretos.
- Análisis de lenguaje de signos y estudios de comportamiento: extracción de la geometría de la mano como característica intermedia para pipelines de investigación, dado que el embedder de 128 dimensiones es reutilizable como representación compacta.
- Filtrado y moderación de contenido visual: detección de gestos ofensivos o no deseados en plataformas que reciben imágenes de usuarios, ejecutando el pipeline en el dispositivo antes de subir el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el paquete completo ocupa 8,37 MB en disco y los pesos FP16 caben holgadamente en la memoria de cualquier dispositivo móvil.
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU, GPU móvil o aceleradores NPU vía LiteRT/TFLite.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, aunque su despliegue típico es en CPU de teléfono o navegador.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT/TFLite, y descarga del artefacto vía `huggingface_hub`.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño reducido de los submodelos sugiere inferencia en tiempo real, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Gestos | Licencia | Despliegue |
|---|---|---|---|---|---|
| MediaPipe Gesture Recognizer (este) | Pipeline TFLite con detector + landmarks + clasificador | 8,37 MB (FP16) | 8 clases fijas | Apache 2.0 | Android, iOS, web, Python, Flutter |
| MediaPipe Hand Landmarker | Detector de palmas + landmarks 3D | No disponible en la informacion | No clasifica gestos | Apache 2.0 | Android, iOS, web, Python |
| Clasificadores de gestos basados en CNN sobre píxeles | CNN de imagen completa | Variable, típicamente mayor | Depende del entrenamiento | Variable | Requiere framework de inferencia genérico |

La comparativa con alternativas de la misma categoría es limitada porque no se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El clasificador solo reconoce 8 gestos predefinidos; cualquier otra pose se etiqueta como `Unknown`, lo que limita su uso en dominios con vocabularios gestuales amplios.
- El reconocimiento depende de la calidad del detector de palmas y de landmarks; manos ocluidas, guantes, motion blur o iluminación extrema degradan la cadena completa.
- La documentación de Google incluye un análisis de equidad de 2022, lo que sugiere posibles diferencias de rendimiento entre tonos de piel y condiciones demográficas; conviene validar el modelo con el público objetivo antes de producción.
- No procesa texto ni lenguaje: no es adecuado para tareas de generación, razonamiento o agentes, pese a aparecer en un repositorio de modelos de Hugging Face.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de MediaPipe y de los submodelos originales de Google antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en 2026; no hay evidencia de mantenimiento activo por parte de `litert-community`.
- La precisión FP16 puede introducir pequeñas diferencias numéricas frente a una versión FP32, aunque no se documentan métricas de degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-GestureRecognizer
- Archivo `gesture_recognizer.task`: https://huggingface.co/litert-community/MediaPipe-GestureRecognizer/blob/main/gesture_recognizer.task
- Documentación de MediaPipe Gesture Recognizer: https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer
- Demo web oficial: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/gesture_recognizer
- Paper de referencia: https://arxiv.org/abs/2006.10214
- Model card de Google sobre clasificación de gestos y equidad (PDF incluido en el repositorio): https://huggingface.co/litert-community/MediaPipe-GestureRecognizer/blob/main/model_card_hand_gesture_classification_with_faireness_2022.pdf
