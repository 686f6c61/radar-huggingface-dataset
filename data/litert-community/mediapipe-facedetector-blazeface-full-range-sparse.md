# litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range-Sparse

## Resumen

BlazeFace Sparse (Full-Range) es un detector facial de disparo único (single-shot) empaquetado para la tarea `FaceDetector` de MediaPipe y el runtime LiteRT (antiguo TensorFlow Lite). Lo distribuye la comunidad `litert-community` a partir del modelo original de Google, y se publica como un archivo `.tflite` de 676,7 KB con pesos en FP16. Su función es localizar rostros en imágenes de cámara de smartphone, incluyendo cámaras traseras con sujetos a unos 5 metros, y devolver por cada rostro una caja delimitadora alineada a los ejes, seis keypoints faciales aproximados y una puntuación de confianza.

La relevancia de esta variante está en la compresión: aplica poda estructurada de pesos (aproximadamente un 70 % de ceros en la mayoría de convoluciones `1x1`) sobre el detector BlazeFace full-range de tipo CenterNet, reduciendo el tamaño binario en torno a un 60 % sin perder el soporte de rango completo. El resultado es un modelo de menos de 1 MB, pensado para inferencia on-device en Android, iOS, web, Python y Flutter, donde el coste de memoria y de descarga es crítico.

Arquitectónicamente es una red convolucional de detección anclada (no un modelo generativo ni un transformer), con entrada fija de `[1, 192, 192, 3]` en `float32` RGB normalizada a `[-1.0, 1.0]` y dos salidas: `Identity` con `[1, 2304, 16]` (cajas y keypoints sin decodificar) e `Identity_1` con `[1, 2304, 1]` (puntuaciones). La decodificación de anclas y la supresión de no máximos (NMS) las realiza la tarea `FaceDetector` de MediaPipe, no el propio grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN single-shot tipo CenterNet/BlazeFace con poda estructurada de pesos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 192x192x3) |
| Tipos de cuantizacion | pesos FP16 (float16); no se documentan otras variantes en el repo |
| Idiomas soportados | no aplica (detección facial, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), con metadatos `TFLITE_METADATA` embebidos |

## Arquitectura y entrenamiento

El modelo es un detector convolucional de una sola etapa con formulación tipo CenterNet, derivado de la familia BlazeFace descrita en el paper arXiv:1907.05047. La innovación de esta variante concreta es la poda estructurada: se han llevado a cero aproximadamente el 70 % de los pesos en la mayoría de convoluciones `1x1`, lo que reduce el binario en torno a un 60 % manteniendo el rango de detección completo (hasta unos 5 metros). Los pesos se almacenan en FP16, lo que contribuye al tamaño final de 676,7 KB.

No se detallan en la información disponible el número de tokens ni la composición del dataset de entrenamiento, ni si hubo fases de ajuste fino con RLHF/DPO (no aplicable en un detector). El pipeline de inferencia espera una imagen RGB normalizada con `mean=[127.5]` y `std=[127.5]`; MediaPipe `FaceDetector` gestiona automáticamente el redimensionado y la normalización. Sobre las 2304 anclas de salida, la tarea aplica decodificación y NMS para producir las detecciones finales.

## Capacidades

- Detección de rostros en imágenes de cámara de smartphone, incluido rango completo (aproximadamente 5 metros) con cámara trasera.
- Devolución de caja delimitadora alineada a los ejes en píxeles (`origin_x`, `origin_y`, `width`, `height`).
- Seis keypoints faciales aproximados normalizados a `[0.0, 1.0]`: `left_eye`, `right_eye`, `nose_tip`, `mouth`, `left_eye_tragion`, `right_eye_tragion` (desde la perspectiva del observador).
- Puntuación de confianza por detección en `[0.0, 1.0]`, con umbral configurable (`min_detection_confidence`).
- Ejecución on-device en Android, iOS, web (JavaScript), Python y Flutter mediante MediaPipe Tasks.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es exclusivamente un detector visual.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Desbloqueo y autenticación facial en apps móviles: el detector localiza el rostro y sus keypoints antes de pasar a un modelo de reconocimiento; su tamaño inferior a 1 MB permite incluirlo en el binario de la app sin descargas adicionales.
- Preprocesado en pipelines de reconocimiento facial: actúa como etapa de detección y alineación (gracias a los 6 keypoints) antes de un modelo de embeddings, con latencia de milisegundos en GPU móvil.
- Videollamadas y filtros en tiempo real: a 90-165 FPS en GPU de Pixel 3/4, es viable para seguimiento facial por fotograma en apps de cámara y efectos AR.
- Fotografía computacional: detección de rostros en la cámara trasera a distancia (hasta ~5 m) para enfoque automático, exposición o composición de grupo en apps de cámara.
- Analítica de audiencia en dispositivos edge: conteo y localización de rostros en quioscos o pantallas interactivas sin enviar imágenes a la nube, reduciendo requisitos de privacidad y ancho de banda.
- Aplicaciones web sin backend: mediante el runtime web de MediaPipe, se puede ejecutar la detección en el navegador del usuario, útil para demos, herramientas de edición de foto o verificación previa a subida.
- Automatización de pruebas de UI en apps de cámara: validar que el encuadre y la detección funcionan en distintos dispositivos usando el modelo como referencia determinista.

## Benchmarks y rendimiento

| Plataforma | Modo | Rendimiento reportado |
|---|---|---|
| Pixel 3 | GPU | ≈90 FPS |
| Pixel 4 | GPU | ≈165 FPS |
| Pixel 3 | CPU mononúcleo (XNNPACK) | ≈50 FPS |
| Pixel 6 | CPU / GPU (referencia BlazeFace short-range, no esta variante) | 2,94 ms / 7,41 ms |

Los datos de Pixel 3 y Pixel 4 provienen del PDF de model card incluido en el repo; la fila de Pixel 6 corresponde a la variante short-range según la documentación de MediaPipe y no debe atribuirse a este modelo full-range. No se han publicado resultados de benchmarks de precisión (mAP, recall) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: inferior a 10 MB en la práctica; el binario pesa 676,7 KB y la entrada es de 192x192x3 en `float32`.
- GPU recomendadas: no requiere GPU dedicada; funciona en GPU integrada de móvil (Adreno, Mali) y en CPU con XNNPACK.
- Cabe holgadamente en cualquier GPU consumer (RTX 4090, RTX 3060, etc.), aunque su uso típico es móvil y edge; en escritorio el cuello de botella será el preprocesado de imagen, no el modelo.
- Opciones de despliegue: MediaPipe Tasks (`FaceDetector`) en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript) y Flutter (Dart); runtime LiteRT/TFLite subyacente.
- Latencia y throughput: aproximadamente 90 FPS en GPU de Pixel 3, 165 FPS en GPU de Pixel 4 y 50 FPS en CPU mononúcleo de Pixel 3 (XNNPACK), según el PDF de model card.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Rango | Licencia | Notas |
|---|---|---|---|---|---|
| BlazeFace Sparse Full-Range (este) | CNN single-shot podada, FP16 | 676,7 KB | ~5 m | Apache 2.0 | ≈90 FPS Pixel 3 GPU |
| BlazeFace short-range (MediaPipe) | CNN single-shot | no disponible | corto | Apache 2.0 | 2,94 ms CPU / 7,41 ms GPU en Pixel 6; sin poda documentada |
| BlazeFace original (paper arXiv:1907.05047) | CNN single-shot | no disponible | corto/medio | no disponible | Referencia académica de la arquitectura |
| Otros detectores faciales on-device (p. ej. MTCNN, RetinaFace) | CNN multi-etapa / single-shot | varios MB | variable | variable | No se dispone de comparación numérica en la información proporcionada |

No se han publicado en la información disponible comparativas cuantitativas de precisión frente a MTCNN o RetinaFace; la comparación se limita a tamaño, rango y licencia.

## Limitaciones y advertencias

- Es un detector, no un modelo generativo: no produce texto, código ni razonamiento; cualquier expectativa de ese tipo es un error de uso.
- Solo devuelve keypoints aproximados (6 puntos); no es un modelo de malla facial ni de reconocimiento de identidad.
- El rango de detección está acotado a aproximadamente 5 metros y a la resolución de entrada fija de 192x192; rostros muy pequeños o muy alejados pueden no detectarse.
- No se documentan en la información disponible métricas de sesgo por tono de piel, género, edad u oclusión; en producción conviene validar el recall en poblaciones y condiciones de iluminación diversas.
- Riesgo de falsos positivos y falsos negativos inherente a un detector de menos de 1 MB; el umbral `min_detection_confidence` debe calibrarse por caso de uso.
- La poda del 70 % puede degradar la precisión frente al modelo denso original; no se aportan datos de mAP comparativos en la información disponible.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del modelo original de Google y de MediaPipe.
- El repo muestra 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB; verificar la integridad del archivo mediante el SHA-256 publicado antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range-Sparse
- Archivo del modelo: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range-Sparse/blob/main/blaze_face_full_range_sparse.tflite
- Documentación de MediaPipe Face Detector: https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
- LiteRT: https://developers.google.com/edge/litert
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_detector
- Guía Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/face_detector/python/face_detector.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/face_detector
- Paper BlazeFace: https://arxiv.org/abs/1907.05047
