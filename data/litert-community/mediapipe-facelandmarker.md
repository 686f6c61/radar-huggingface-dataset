# litert-community/MediaPipe-FaceLandmarker

## Resumen

MediaPipe Face Landmarker es un paquete de modelos de visión por computador para detección de geometría facial en dispositivo, publicado por la comunidad litert-community (organización de Google AI Edge en Hugging Face) y basado en los modelos originales de MediaPipe. No es un modelo de lenguaje: es un pipeline de tres redes neuronales TFLite empaquetadas en un único archivo `face_landmarker.task` de 3,76 MB con pesos en FP16, que resuelve detección de rostro, malla facial 3D de 478 puntos (incluidos 10 puntos de iris) y 52 coeficientes de blendshapes de expresión facial.

El paquete combina BlazeFace de corto alcance para la detección inicial, FaceMesh V2 para los landmarks y una red MLP-Mixer para los blendshapes, más metadatos de geometría canónica. Está pensado para ejecución local en Android, iOS, web (WASM), Python y Flutter mediante la API MediaPipe Tasks, sin dependencia de servicios en la nube.

Su relevancia actual reside en que permite animación facial, seguimiento de expresiones y efectos en tiempo real en dispositivos de consumo, con un tamaño inferior a 4 MB y licencia Apache 2.0, lo que facilita su integración en aplicaciones comerciales de realidad aumentada, videollamadas y avatares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: BlazeFace (detector) + FaceMesh V2 (landmarks) + MLP-Mixer (blendshapes) |
| Parametros totales | no disponible (pesos empaquetados de 3,76 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 (pesos del bundle); los sub-modelos declaran entradas/salidas float32 |
| Idiomas soportados | no disponible (independiente del idioma; procesa imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite empaquetado en `.task` (con `geometry_pipeline_metadata_landmarks.binarypb`) |

## Arquitectura y entrenamiento

El bundle `face_landmarker.task` contiene tres redes TFLite más metadatos de geometría canónica. El detector `face_detector.tflite` (229,7 KB) es un BlazeFace de corto alcance con entrada RGB de `[1, 128, 128, 3]` normalizada con media 127,5 y desviación 127,5, que produce 896 regresores de cajas/keypoints y 896 puntuaciones de clasificación. El modelo `face_landmarks_detector.tflite` (2,55 MB) es FaceMesh V2, con entrada RGB de `[-1, 256, 256, 3]` normalizada con media 0 y desviación 255, y salidas de 478 landmarks 3D (`[-1, 1, 1, 1434]`), una probabilidad de presencia facial y una puntuación `tongue_out`. El tercer componente, `face_blendshapes.tflite` (955,3 KB), es una red MLP-Mixer que consume 146 landmarks 2D (`[1, 146, 2]`) y emite 52 coeficientes de expresión en el rango `[0, 1]`.

No se dispone de información sobre el número de tokens, composición del dataset ni proceso de entrenamiento (RLHF/DPO no aplica). La model card referencia el paper arXiv:1907.05047 (BlazeFace) y enlaza las model cards originales de Google para BlazeFace, FaceMesh V2 y Blendshape V2 en PDF dentro del repositorio. Una innovación destacable es la inclusión de 10 landmarks de iris y la separación entre detección, malla y blendshapes, que permite ejecutar solo las etapas necesarias.

## Capacidades

- Detección de rostros en imágenes y vídeo con BlazeFace de corto alcance.
- Predicción de malla facial 3D de 478 puntos, incluidos 10 landmarks de iris.
- Estimación de 52 coeficientes de blendshapes de expresión facial (Blendshape V2) en `[0, 1]`.
- Puntuación de presencia facial y detección de lengua fuera de la boca (`tongue_out`).
- Ejecución en dispositivo en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Procesamiento en modo imagen, vídeo y streaming en directo (`VisionRunningMode`).
- Soporte de múltiples rostros mediante el parámetro `num_faces`.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling ni capacidades de agente.

## Casos de uso

- Animación de avatares en tiempo real: los 52 blendshapes permiten mapear expresiones faciales a rigs de avatar en aplicaciones de videollamada o mundos virtuales, con latencia baja al ejecutarse en dispositivo.
- Efectos de realidad aumentada: la malla de 478 puntos sirve para superponer filtros, maquillaje virtual o gafas ajustadas a la geometría facial en apps móviles Android e iOS.
- Análisis de atención y presencia: la puntuación de presencia facial y la detección de rostro permiten verificar que el usuario está frente a la cámara en sistemas de proctoring o señalización digital.
- Seguimiento ocular aproximado: los 10 landmarks de iris habilitan estimaciones básicas de dirección de mirada para interfaces de accesibilidad o estudios de atención.
- Captura de movimiento facial para creación de contenido: actores o streamers pueden generar datos de blendshapes para animar personajes en motores como Unity o Unreal mediante la integración de MediaPipe.
- Aplicaciones de salud y rehabilitación facial: el registro de expresiones y la detección de `tongue_out` pueden apoyar ejercicios de fisioterapia facial con retroalimentación visual.
- Procesamiento por lotes de imágenes en Python: el modo `VisionRunningMode.IMAGE` permite extraer landmarks y blendshapes de datasets de rostros para investigación en visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el bundle completo ocupa 3,76 MB y los sub-modelos suman aproximadamente 3,7 MB, por lo que cabe en memoria de cualquier dispositivo móvil.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para CPU, GPU móvil (OpenGL ES/Metal) y aceleradores NPU mediante LiteRT.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una GPU integrada, y en smartphones de gama baja.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT/TFLite, y el demo web oficial de MediaPipe Samples.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo on-device de menos de 4 MB, se espera ejecución en tiempo real, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe Face Landmarker (este) | 3,76 MB FP16 | no aplica | Detección + 478 landmarks + 52 blendshapes | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| MediaPipe Face Mesh (original) | no disponible | no aplica | 468 landmarks | Apache 2.0 | MediaPipe |
| MediaPipe BlazeFace (original) | no disponible | no aplica | Detección de rostro | Apache 2.0 | MediaPipe |
| MediaPipe Blendshape V2 (original) | no disponible | no aplica | 52 blendshapes | Apache 2.0 | MediaPipe |

La comparativa se limita a los componentes upstream de Google, ya que no se dispone de datos de benchmarks ni de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo facial, puede presentar variaciones de precisión según tono de piel, edad, iluminación y oclusión.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir landmarks o blendshapes incorrectos en rostros parcialmente ocluidos o con iluminación extrema.
- Limitaciones de contexto o idioma: no aplica idioma; el detector es de corto alcance y puede fallar en rostros pequeños o lejanos.
- Nota de espejado: los blendshapes `*Left` y `*Right` se refieren al rostro del sujeto, no al espectador; en selfies espejados se invierten.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las model cards originales de Google incluidas en el repositorio para condiciones adicionales.
- Caveat para producción: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que conviene validar el bundle y su SHA-256 antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-FaceLandmarker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_landmarker
- Documentación de MediaPipe Face Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker
- Paper BlazeFace: https://arxiv.org/abs/1907.05047
- Archivo del bundle: https://huggingface.co/litert-community/MediaPipe-FaceLandmarker/blob/main/face_landmarker.task
- Model card BlazeFace (PDF): https://huggingface.co/litert-community/MediaPipe-FaceLandmarker/blob/main/MediaPipe%20BlazeFace%20Model%20Card%20%28Short%20Range%29.pdf
- Model card Blendshape V2 (PDF): https://huggingface.co/litert-community/MediaPipe-FaceLandmarker/blob/main/Model%20Card%20Blendshape%20V2.pdf
- Model card Face Mesh V2 (PDF): https://huggingface.co/litert-community/MediaPipe-FaceLandmarker/blob/main/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf
