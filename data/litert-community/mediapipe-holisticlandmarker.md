# litert-community/MediaPipe-HolisticLandmarker

## Resumen

MediaPipe Holistic Landmarker es un paquete de inferencia multimodal desarrollado originalmente por Google y redistribuido por la comunidad litert-community. Resuelve la detección unificada de 553 puntos clave del cuerpo humano en tiempo real: 33 landmarks de pose, 478 de cara e iris y 21 por cada mano, además de 52 blendshapes faciales opcionales y una máscara de segmentación de primer plano. No es un modelo generativo ni un LLM, sino un bundle de siete submodelos `.tflite` empaquetados en un único fichero `holistic_landmarker.task` de 13,68 MB con pesos en FP16.

Su relevancia radica en la eficiencia: integra detección y refinamiento en cascada sobre tres regiones (pose, cara y manos) con resoluciones de entrada moderadas (de 128×128 a 256×256), lo que permite ejecución en tiempo real en dispositivos móviles, navegador y sistemas embebidos sin aceleración dedicada. Está pensado para el ecosistema MediaPipe Tasks, con soporte para Android, iOS, web, Python y Flutter.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de 7 submodelos TFLite (detectores + landmark detectors); no es un transformer |
| Parametros totales | no disponible (solo se publican tamanos de fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | Pesos FP16 en el bundle; entradas/salidas en float32; no se documentan otras variantes |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` empaquetados en `holistic_landmarker.task` (13,68 MB, SHA-256 `e2dab61191e2dcd0a15f943d8e3ed1dce13c82dfa597b9dd39f562975a50c3f8`) |

## Arquitectura y entrenamiento

El bundle no es una red única, sino una cascada de siete modelos TFLite organizados en tres etapas. La etapa de pose usa `pose_detector.tflite` (entrada `[1, 224, 224, 3]`) para localizar la región de interés y `pose_landmarks_detector.tflite` (entrada `[1, 256, 256, 3]`) para producir 33 landmarks 2D/3D y una máscara de segmentación `[1, 256, 256, 1]`. La etapa facial encadena `face_detector.tflite` (entrada `[1, 128, 128, 3]`, salidas `regressors` `[1, 896, 16]` y `classificators` `[1, 896, 1]`), `face_landmarks_detector.tflite` (entrada `[1, 192, 192, 3]`, 478 landmarks) y `face_blendshapes.tflite` (entrada `[1, 146, 2]`, 52 scores). La etapa de manos usa `hand_roi_refinement.tflite` (entrada `[1, 256, 256, 3]`, salida `[1, 1, 1, 4]` con centro y punto guía derivados de la muñeca de la pose) y `hand_landmarks_detector.tflite` (entrada `[1, 224, 224, 3]`, salidas de 21 landmarks, presencia, lateralidad y world landmarks).

No se documentan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO (no aplica a un modelo de visión). Las referencias técnicas citadas son los papers arXiv:2006.10204 (BlazePose) y arXiv:2006.10214 (MediaPipe Hands). La model card incluye además tres model cards upstream de Google en PDF: BlazePose GHUM 3D, Hand Tracking (Lite/Full) con análisis de fairness de octubre de 2021 y MediaPipe Face Mesh V2. La innovación destacable es el diseño en cascada con refinamiento de ROI, que reduce el coste computacional al aplicar los detectores de landmarks solo sobre recortes de baja resolución.

## Capacidades

- Detección de 553 landmarks corporales: 33 de pose, 478 de cara e iris y 2×21 de manos.
- Landmarks 3D de manos, incluidos world landmarks en coordenadas métricas.
- Clasificación de lateralidad de mano (izquierda/derecha) con score de presencia.
- 52 blendshapes faciales opcionales para expresividad y animación.
- Máscara de segmentación de pose en primer plano (`[1, 256, 256, 1]`).
- Ejecución on-device en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Procesamiento en tiempo real gracias a entradas de baja resolución y pesos FP16.
- No soporta tool calling, agentes, razonamiento multi-turno ni capacidades multilingües: es un modelo puramente perceptivo.

## Casos de uso

- **Captura de movimiento para animación**: el bundle produce 33 landmarks de pose y 21 por mano con coordenadas 2D y 3D, suficiente para retargeting en tiempo real sobre avatares o motores como Unity o Unreal sin hardware de captura dedicado.
- **Seguimiento facial para avatares y VTubing**: los 478 landmarks de cara e iris más los 52 blendshapes permiten animar expresiones faciales con latencia baja en navegador o móvil, usando la demo web oficial como referencia de integración.
- **Análisis ergonómico y de postura**: la combinación de pose y manos permite detectar posturas de trabajo, ángulos articulares y gestos repetitivos en vídeo de cámara convencional, útil en prevención de riesgos laborales o fisioterapia.
- **Interacción gestual sin contacto**: la detección de manos con lateralidad y world landmarks posibilita interfaces por gestos en quioscos, automoción o domótica, ejecutándose on-device sin enviar vídeo a la nube.
- **Fitness y rehabilitación**: el seguimiento de pose en tiempo real permite contar repeticiones, validar ángulos de articulaciones y corregir la forma del ejercicio en aplicaciones móviles, con la ventaja de que el modelo cabe holgadamente en un dispositivo de gama media.
- **Telepresencia y videoconferencia con efectos**: la máscara de segmentación de pose y los blendshapes faciales permiten sustituir el fondo, aplicar filtros expresivos o generar avatares animados durante llamadas, todo procesado localmente.
- **Investigación en visión por computador**: al ser un bundle reproducible con hashes SHA-256 por submodelo, sirve como línea base para comparar pipelines de detección de keypoints o para experimentar con el refinamiento de ROI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el bundle completo ocupa 13,68 MB en FP16 y los submodelos individuales van de 88,4 KB (`hand_roi_refinement.tflite`) a 5,48 MB (`hand_landmarks_detector.tflite`), por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU, GPU móvil y aceleradores de borde (NNAPI, Core ML, WebGL/WASM según plataforma).
- Cabe en cualquier GPU de consumo y en dispositivos móviles de gama media; no requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: MediaPipe Tasks (Android, iOS, web, Python, Flutter), LiteRT/TFLite Runtime y la demo web oficial de mediapipe-samples-web.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card solo afirma detección "en tiempo real".

## Comparativa con modelos similares

| Modelo | Tipo | Landmarks | Licencia | Disponibilidad |
|---|---|---|---|---|
| MediaPipe Holistic Landmarker (este) | Bundle TFLite unificado | 553 (33 pose + 478 cara + 42 manos) + 52 blendshapes + máscara | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| MediaPipe Pose Landmarker | TFLite | 33 pose + máscara | Apache 2.0 | MediaPipe Tasks |
| MediaPipe Face Landmarker | TFLite | 478 cara + blendshapes | Apache 2.0 | MediaPipe Tasks |
| MediaPipe Hand Landmarker | TFLite | 21 por mano | Apache 2.0 | MediaPipe Tasks |

La ventaja del bundle Holistic es la integración de las tres tareas en un único fichero con refinamiento de ROI compartido; el coste es que no permite prescindir de las etapas no deseadas si solo se necesita una región. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.
- Los resultados de benchmarks y las cifras de latencia no están publicados en la información disponible; no deben asumirse rendimientos concretos sin medirlos.
- La model card remite a análisis de fairness upstream (Hand Tracking, octubre de 2021) para sesgos; no se detallan en esta ficha sesgos específicos por tono de piel, género u oclusión.
- Riesgo de fallo en condiciones de oclusión, iluminación adversa, múltiples personas o resoluciones muy bajas, inherente a los detectores en cascada con entradas de 128×128 a 256×256.
- El refinamiento de ROI de manos depende de los keypoints de muñeca de la etapa de pose; si la pose falla, la detección de manos puede degradarse.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las model cards upstream de Google para condiciones adicionales de los submodelos originales.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere baja validación comunitaria de esta redistribución concreta.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-HolisticLandmarker
- Fichero del bundle: https://huggingface.co/litert-community/MediaPipe-HolisticLandmarker/blob/main/holistic_landmarker.task
- Documentación de la tarea: https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/holistic_landmarker
- Paper BlazePose: https://arxiv.org/abs/2006.10204
- Paper MediaPipe Hands: https://arxiv.org/abs/2006.10214
- Model card BlazePose GHUM 3D (PDF en el repo): https://huggingface.co/litert-community/MediaPipe-HolisticLandmarker/blob/main/Model%20Card%20BlazePose%20GHUM%203D.pdf
- Model card Hand Tracking (Lite/Full) con fairness (PDF en el repo): https://huggingface.co/litert-community/MediaPipe-HolisticLandmarker/blob/main/Model%20Card%20Hand%20Tracking%20%28Lite_Full%29%20with%20Fairness%20Oct%202021.pdf
- Model card MediaPipe Face Mesh V2 (PDF en el repo): https://huggingface.co/litert-community/MediaPipe-HolisticLandmarker/blob/main/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf
