# litert-community/MediaPipe-HolisticLandmarker

## Resumen

MediaPipe Holistic Landmarker es un paquete unificado de modelos de vision por computador desarrollado por Google y distribuido a traves de la organizacion litert-community en Hugging Face. Resuelve la deteccion de 553 puntos clave del cuerpo humano en tiempo real a partir de una sola imagen o fotograma de video: 33 landmarks de pose corporal, 478 landmarks faciales (incluyendo iris) y 2x21 puntos clave de manos, ademas de 52 blendshapes faciales opcionales y una mascara de segmentacion de la silueta en primer plano.

El modelo se empaqueta como un unico fichero `holistic_landmarker.task` de 13,68 MB con pesos en FP16 que integra siete submodelos `.tflite` organizados en tres etapas (pose, cara y manos). Esta disenado para inferencia on-device en Android, iOS, web, Python y Flutter mediante la libreria MediaPipe, lo que lo hace relevante para aplicaciones de captura de movimiento, realidad aumentada, animacion facial y analisis ergonomico sin depender de la nube.

Su relevancia actual radica en que consolida en un solo artefacto lo que antes requeria orquestar tres soluciones independientes (Pose, Face Mesh y Hands), reduciendo el coste de integracion y el consumo de recursos en dispositivos moviles y navegadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de deteccion en cascada con 7 submodelos TFLite (detectores + landmark detectors), no disponible el detalle de la red troncal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | FP16 (pesos del bundle); los submodelos se distribuyen en TFLite |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (bundle MediaPipe) que contiene 7 ficheros `.tflite` |

## Arquitectura y entrenamiento

El modelo es un pipeline en cascada de detectores y regresores de landmarks. La etapa de pose combina `pose_detector.tflite` (entrada 224x224x3) con `pose_landmarks_detector.tflite` (entrada 256x256x3), produciendo 33 landmarks 2D/3D y una mascara de segmentacion de 256x256x1. La etapa facial encadena `face_detector.tflite` (128x128x3), `face_landmarks_detector.tflite` en variante lite (192x192x3, que difiere del face landmarker independiente de 256x256) y `face_blendshapes.tflite` (entrada 146x2), que devuelve 52 puntuaciones de blendshape. La etapa de manos usa `hand_roi_refinement.tflite` (256x256x3) para refinar la region de interes a partir de los puntos de muneca y mano de la pose, sustituyendo la deteccion de palma independiente, y `hand_landmarks_detector.tflite` (224x224x3) para obtener 21 landmarks 3D y la lateralidad por mano.

No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset en la informacion proporcionada. Los tags hacen referencia a los papers arXiv:2006.10204 y arXiv:2006.10214, que corresponden a los trabajos de BlazePose y Face Mesh de Google. El repositorio incluye tres model cards upstream en PDF (BlazePose GHUM 3D, Hand Tracking Lite/Full con analisis de fairness de octubre de 2021 y MediaPipe Face Mesh V2) que documentan el entrenamiento y la evaluacion de los submodelos originales.

## Capacidades

- Deteccion de 33 landmarks de pose corporal en 2D y 3D.
- Deteccion de 478 landmarks faciales, incluyendo puntos de iris.
- Deteccion de 2x21 landmarks de mano con clasificacion de lateralidad (izquierda/derecha) y puntuacion de presencia.
- Calculo opcional de 52 blendshapes faciales (puntuaciones de expresion).
- Segmentacion de silueta en primer plano de la persona mediante mascara de 256x256.
- Inferencia en tiempo real on-device en Android, iOS, web, Python y Flutter.
- Procesamiento sobre imagen estatica o flujo de video (frame a frame).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente perceptivo.

## Casos de uso

- Captura de movimiento sin marcadores: el pipeline unificado permite registrar simultaneamente postura corporal, gestos manuales y expresion facial en una sola pasada, adecuado para animacion de avatares y produccion de video.
- Realidad aumentada facial: los 478 landmarks y los 52 blendshapes permiten superponer filtros, maquillaje virtual o mascaras que responden a la expresion del usuario en tiempo real en apps moviles.
- Analisis ergonomico y de postura: los 33 landmarks de pose con coordenadas 3D permiten estimar angulos articulares para aplicaciones de prevencion de lesiones en entornos laborales o rehabilitacion.
- Control por gestos: los 21 landmarks por mano con lateralidad y presencia permiten implementar interfaces sin contacto en quioscos, presentaciones o sistemas de accesibilidad.
- Videoconferencia y avatares en navegador: al ejecutarse via MediaPipe en web, puede animar avatares o difuminar fondos usando la mascara de segmentacion sin enviar video al servidor.
- Fitness y entrenamiento guiado: la combinacion de pose y manos permite evaluar la ejecucion de ejercicios y corregir la tecnica en tiempo real desde el movil.
- Telemedicina y seguimiento motor: la deteccion facial y de manos facilita la evaluacion remota de movilidad facial (por ejemplo, tras un ictus) mediante blendshapes y landmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle completo ocupa 13,68 MB en FP16, por lo que la huella de memoria es inferior a 100 MB en la mayoria de configuraciones; no se especifica el consumo exacto.
- GPU recomendadas: no disponible. El diseno esta orientado a aceleracion en GPU movil (OpenGL ES/Metal), CPU y delegados de LiteRT/NNAPI.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles de gama media; no requiere GPU dedicada.
- Opciones de despliegue: MediaPipe Tasks en Android, iOS, web (JavaScript/TypeScript), Python y Flutter; el bundle `.task` se carga directamente con la API `HolisticLandmarker`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor lo describe como "en tiempo real".

## Comparativa con modelos similares

| Modelo | Tipo | Landmarks | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe Holistic Landmarker (este) | Pipeline unificado pose+cara+manos | 553 (33+478+42) | no aplica | Apache 2.0 | Hugging Face, MediaPipe |
| MediaPipe Pose Landmarker | Solo pose | 33 | no aplica | Apache 2.0 | MediaPipe |
| MediaPipe Face Landmarker | Solo cara + blendshapes | 478 + 52 blendshapes | no aplica | Apache 2.0 | MediaPipe |
| MediaPipe Hand Landmarker | Solo manos | 2x21 | no aplica | Apache 2.0 | MediaPipe |

La ventaja del Holistic Landmarker frente a los tres modelos independientes es la integracion en un unico artefacto y la reutilizacion de los puntos de muneca de la pose para inicializar la deteccion de manos, lo que reduce la latencia agregada. Como contrapartida, el detector facial interno usa una variante lite de 192x192 en lugar de la version de 256x256 del Face Landmarker independiente, lo que puede suponer menor precision en rostros pequenos o lejanos.

## Limitaciones y advertencias

- Modelo puramente perceptivo: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Precision dependiente de la calidad de imagen, iluminacion y oclusiones; el uso de una variante lite en la etapa facial puede degradar la precision en rostros pequenos.
- Riesgo de fallos en escenas con multiples personas, ya que el pipeline esta pensado para una persona principal por fotograma.
- Los model cards upstream documentan analisis de fairness para la deteccion de manos (octubre de 2021); pueden existir sesgos de rendimiento segun tono de piel, genero o condicion fisica que conviene evaluar en el dominio de despliegue.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los model cards upstream de Google incluidos en el repositorio.
- No se dispone de informacion sobre idiomas ni sobre el rendimiento en condiciones de baja luminosidad o camaras de baja resolucion.
- El repositorio figura con 0,0 GB de tamano reportado y 0 likes, lo que sugiere que es una redistribucion comunitaria y no el canal oficial de Google; conviene verificar la integridad mediante los SHA-256 publicados.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-HolisticLandmarker
- Documentacion oficial: https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/holistic_landmarker
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/ios
- Ejemplo Python: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/python
- Ejemplo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/holistic-landmarker.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/holistic_landmarker
- Paper BlazePose: https://arxiv.org/abs/2006.10204
- Paper Face Mesh: https://arxiv.org/abs/2006.10214
