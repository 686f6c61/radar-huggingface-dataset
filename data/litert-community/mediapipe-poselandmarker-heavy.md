# litert-community/MediaPipe-PoseLandmarker-Heavy

## Resumen

MediaPipe Pose Landmarker (Heavy) es un paquete de inferencia en dispositivo para la detección de pose corporal completa, distribuido por la comunidad `litert-community` a partir del modelo BlazePose GHUM 3D de Google. El artefacto principal, `pose_landmarker_heavy.task` (30,66 MB), empaqueta dos submodelos TFLite en FP16: un detector de persona que localiza la región de interés y un detector de puntos clave que predice 33 landmarks 2D y 3D, una máscara de segmentación y la presencia de pose. No es un modelo de lenguaje: es un modelo de visión por computador especializado en keypoint detection, pensado para ejecutarse en Android, iOS, Web, Python y Flutter mediante la librería MediaPipe.

Su relevancia radica en que ofrece la variante "Heavy" del pipeline BlazePose GHUM 3D con pesos en FP16, lo que reduce el tamaño del bundle manteniendo la precisión de la variante de mayor capacidad. El modelo sigue la arquitectura de dos etapas descrita en el paper BlazePose (arXiv:2006.10204) y utiliza el modelo corporal GHUM para derivar landmarks 3D métricos a partir de la predicción 2D. La licencia Apache 2.0 facilita su integración en productos comerciales sin restricciones adicionales.

El paquete está orientado a aplicaciones de tiempo real en el borde: fitness, rehabilitación, animación, control gestual o análisis deportivo, donde la latencia y la privacidad (procesamiento local sin envío de vídeo a la nube) son críticas. La información disponible no incluye detalles sobre el dataset de entrenamiento ni métricas de benchmarks publicadas por el autor en esta model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazePose GHUM 3D en dos etapas (detector de persona + detector de landmarks), empaquetado como bundle MediaPipe Tasks |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP16 (pesos float16 en los submodelos TFLite) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (bundle MediaPipe) con dos `.tflite` internos: `pose_detector.tflite` y `pose_landmarks_detector.tflite` |

## Arquitectura y entrenamiento

El bundle implementa un pipeline de dos etapas. La primera, `pose_detector.tflite` (2,96 MB), recibe una imagen RGB de `[1, 224, 224, 3]` normalizada con `mean=127.5` y `std=127.5`, y produce 2254 cajas candidatas de `[1, 2254, 12]` junto con sus puntuaciones `[1, 2254, 1]`. La segunda, `pose_landmarks_detector.tflite` (27,70 MB), toma un recorte ROI de `[1, 256, 256, 3]` normalizado con `mean=0.0` y `std=255.0`, y devuelve cinco salidas: landmarks normalizados `[1, 195]` (33 puntos × 5 valores), presencia `[1, 1]`, máscara de segmentación `[1, 256, 256, 1]`, mapa de calor `[1, 64, 64, 39]` y landmarks 3D métricos `[1, 117]` derivados mediante el modelo corporal GHUM.

La arquitectura subyacente es BlazePose, descrita en el paper arXiv:2006.10204, que combina un detector ligero con una red de regresión de puntos clave. El uso de GHUM permite obtener coordenadas 3D en metros, no solo proyecciones 2D. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF/DPO (no aplica al ser un modelo de visión). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal, que no tienen sentido en este dominio.

## Capacidades

- Detección de pose corporal completa con 33 landmarks (nariz, ojos, orejas, boca, hombros, codos, muñecas, dedos, caderas, rodillas, tobillos, talones y puntas de los pies).
- Predicción de landmarks 2D normalizados en pantalla (`[1, 195]`) y landmarks 3D métricos en el espacio mundial (`[1, 117]`) mediante GHUM.
- Segmentación de primer plano de la persona con máscara de `256×256`.
- Estimación de presencia de pose (`[1, 1]`), útil para filtrar fotogramas sin persona.
- Mapa de calor de `64×64×39` para las articulaciones, que puede emplearse en post-procesado o visualización.
- Ejecución en dispositivo (on-device) en Android, iOS, Web, Python y Flutter a través de MediaPipe Tasks.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- **Fitness y entrenamiento guiado en tiempo real**: el modelo detecta las 33 articulaciones en cada fotograma y permite comparar la postura del usuario con una referencia para corregir sentadillas, flexiones o yoga. La inferencia local en el dispositivo evita enviar vídeo a la nube y mantiene la latencia baja.
- **Rehabilitación física y telemedicina**: con los landmarks 3D métricos (GHUM) se pueden medir ángulos articulares reales (por ejemplo, flexión de rodilla) y registrar la evolución del paciente. La máscara de segmentación ayuda a aislar al paciente en escenas domésticas.
- **Animación y captura de movimiento sin marcadores**: los 33 puntos clave, incluidos dedos y pies, permiten dirigir un rig esquelético en motores como Unity o Unreal. El formato `.task` se integra en apps móviles y web, lo que facilita demos y prototipos.
- **Control gestual y interfaces sin contacto**: la detección de muñecas, manos y codos posibilita gestos de navegación en pantallas táctiles o entornos industriales donde no se puede tocar el dispositivo. La variante Heavy prioriza precisión sobre velocidad, adecuada para kioscos o señalización digital.
- **Análisis deportivo**: en deportes como atletismo, natación o artes marciales se pueden extraer trayectorias articulares y ángulos de zancada o golpeo para retroalimentación automática. La segmentación permite recortar al atleta y analizar su silueta.
- **Aplicaciones de bienestar y ergonomía**: detección de posturas prolongadas (sentado, inclinación de espalda) en webcams de escritorio, con alertas locales. El modelo es lo bastante pequeño (30,66 MB) para incluirse en una app de escritorio o extensión de navegador.
- **Realidad aumentada y filtros**: la máscara de segmentación y los landmarks permiten superponer accesorios virtuales (ropa, calzado) o efectos que siguen el cuerpo en tiempo real en apps móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el sentido tradicional; el bundle pesa 30,66 MB en FP16 y los submodelos suman aproximadamente 30,66 MB descomprimidos (2,96 MB + 27,70 MB). Cabe en la memoria de cualquier dispositivo móvil moderno y en GPUs de gama baja.
- **GPU recomendadas**: no requiere GPU dedicada; funciona en CPU, GPU móvil (Adreno, Mali, Apple GPU) y aceleradores NPU mediante delegados TFLite. En escritorio puede ejecutarse en CPU o en GPUs como GTX 1650, RTX 3050 o superiores si se usa el delegado GPU de TFLite.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en Raspberry Pi y dispositivos Android de gama media.
- **Opciones de despliegue**: MediaPipe Tasks (Android, iOS, Web, Python, Flutter), TFLite Runtime con delegados CPU/GPU/NNAPI/Core ML, y contenedores Python para servidores.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependen del hardware y del delegado. La variante Heavy es la más costosa de las tres (Lite, Full, Heavy) y está pensada para escenarios donde la precisión prima sobre los FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MediaPipe Pose Landmarker Heavy (este) | no disponible | no aplica | `224×224` + `256×256` RGB | 33 landmarks 2D/3D, máscara, presencia | Apache 2.0 | Hugging Face, MediaPipe |
| MediaPipe Pose Landmarker Full | no disponible | no aplica | `224×224` + `256×256` RGB | 33 landmarks 2D/3D, máscara, presencia | Apache 2.0 | MediaPipe |
| MediaPipe Pose Landmarker Lite | no disponible | no aplica | `224×224` + `256×256` RGB | 33 landmarks 2D/3D, máscara, presencia | Apache 2.0 | MediaPipe |
| YOLOv8-pose | no disponible | no aplica | `640×640` RGB | 17 keypoints COCO | AGPL-3.0 | Ultralytics |

La comparativa se limita a variantes del mismo pipeline porque la información disponible no incluye métricas de precisión que permitan contrastar con YOLOv8-pose u otros detectores. La diferencia principal frente a las variantes Lite y Full es la capacidad de la red de landmarks (Heavy es la de mayor tamaño y precisión, a costa de latencia). Frente a YOLOv8-pose, este modelo ofrece 33 puntos (incluidos pies y dedos) y landmarks 3D métricos, pero YOLOv8-pose tiene 17 puntos y licencia AGPL-3.0, más restrictiva para uso comercial.

## Limitaciones y advertencias

- **Sesgos**: no se documentan en la model card; como todo modelo de visión entrenado con datos de personas, puede tener sesgos de género, etnia, edad, complexidad corporal y condiciones de iluminación.
- **Alucinación**: en visión, el equivalente es la detección de poses falsas en imágenes sin persona; el modelo incluye una salida de presencia (`[1, 1]`) que debe usarse para filtrar esos casos.
- **Limitaciones de contexto o idioma**: no aplica idioma; el rendimiento puede degradarse con oclusiones severas, personas muy pequeñas en el encuadre, ropa que confunde la silueta o escenas con múltiples personas solapadas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; conviene conservar el aviso de licencia y el PDF de la model card original de Google.
- **Caveats para producción**: la variante Heavy es la más lenta del pipeline; en móviles de gama baja puede no alcanzar tiempo real. El bundle depende de la versión de MediaPipe Tasks, por lo que hay que fijar versiones. Los landmarks 3D GHUM son estimaciones métricas, no medidas clínicas; no deben usarse para diagnóstico médico sin validación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Heavy)
- [Documentación de MediaPipe Pose Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker)
- [Paper BlazePose (arXiv:2006.10204)](https://arxiv.org/abs/2006.10204)
- [Ejemplo Android](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/android)
- [Ejemplo iOS](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/ios)
- [Colab Python](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Pose_Landmarker.ipynb)
- [Ejemplo Web](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/pose-landmarker.ts)
- [Ejemplo Flutter](https://github.com/google/flutter-mediapipe/tree/main/samples/vision/pose_landmarker)
- [Demo web en vivo](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/pose_landmarker)
