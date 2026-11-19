# litert-community/MediaPipe-PoseLandmarker-Full

## Resumen

MediaPipe Pose Landmarker (Full) es un paquete de inferencia en formato `.task` que contiene dos sub-modelos TFLite en FP16 para la deteccion de pose corporal completa: un detector de persona y una red de regresion de 33 keypoints 3D con segmentacion. Lo publica la comunidad `litert-community` como port del modelo original de Google MediaPipe, y esta pensado para ejecucion en dispositivo (on-device) en Android, iOS, Web, Python y Flutter mediante la libreria MediaPipe Tasks.

El modelo resuelve el problema de estimacion de pose en tiempo real sin depender de servidores: localiza una persona en una imagen RGB de `224x224`, recorta la region de interes y predice 33 landmarks normalizados en pantalla, 33 landmarks metricos en coordenadas 3D derivadas del modelo corporal GHUM, una mascara de segmentacion de primer plano y una puntuacion de presencia de pose. Su relevancia actual radica en que el bundle completo ocupa solo 9.4 MB, lo que lo hace viable en moviles de gama media y navegadores.

La arquitectura subyacente es BlazePose GHUM 3D, descrita en el paper arXiv:2006.10204. No es un modelo de lenguaje ni un transformer generativo: es una red convolucional de deteccion de keypoints optimizada para latencia. Esta ficha lo evalua como componente de vision por computador, no como LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazePose GHUM 3D, dos etapas: detector de persona (CNN) + detector de landmarks (CNN con heatmap y regresion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | pesos FP16 en ambos sub-modelos TFLite; no se documentan variantes INT8 en el repo |
| Idiomas soportados | no disponible (modelo independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) empaquetados en bundle `.task` de MediaPipe |

Especificaciones adicionales del bundle:

| Elemento | Valor |
|---|---|
| Fichero principal | `pose_landmarker_full.task` |
| Tamano del bundle | 9.40 MB (9,398,198 B) |
| Precision | float16 |
| Sub-modelo detector | `pose_detector.tflite`, 2.96 MB |
| Sub-modelo landmarks | `pose_landmarks_detector.tflite`, 6.44 MB |
| Entrada detector | `[1, 224, 224, 3]` float32, normalizacion mean=127.5, std=127.5 |
| Entrada landmarks | `[1, 256, 256, 3]` float32, normalizacion mean=0.0, std=255.0 |
| Salidas landmarks | landmarks `[1, 195]`, presencia `[1, 1]`, mascara `[1, 256, 256, 1]`, heatmap `[1, 64, 64, 39]`, world landmarks `[1, 117]` |
| Keypoints | 33 landmarks (nariz, ojos, orejas, boca, hombros, codos, munecas, dedos, caderas, rodillas, tobillos, talones, puntas de pie) |

## Arquitectura y entrenamiento

El bundle implementa un pipeline de dos etapas. La primera, `pose_detector.tflite`, procesa una imagen RGB de `224x224` y produce 2254 cajas candidatas con 12 valores cada una (coordenadas y keypoints asociados) mas una puntuacion de confianza por caja; de ahi se extrae la region de interes de la persona. La segunda, `pose_landmarks_detector.tflite`, recibe un recorte RGB de `256x256` y predice simultaneamente landmarks normalizados en pantalla (`[1, 195]`, 33 puntos con x, y, z y visibilidad), landmarks metricos 3D en el espacio del modelo GHUM (`[1, 117]`), una puntuacion de presencia, una mascara de segmentacion de primer plano de `256x256` y un heatmap de `64x64` con 39 canales.

La innovacion tecnica clave es el uso del modelo corporal GHUM 3D para derivar coordenadas metricas tridimensionales a partir de una sola imagen, junto con una representacion de keypoints con visibilidad explicita que permite filtrar oclusiones. El diseno esta optimizado para latencia movil: entradas pequenas, FP16 y dos etapas encadenadas en lugar de una red unica de alta resolucion.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada. El paper de referencia es arXiv:2006.10204 (BlazePose).

## Capacidades

- Deteccion de persona y estimacion de pose corporal completa con 33 keypoints.
- Prediccion de landmarks 2D normalizados en pantalla y landmarks 3D metricos (world landmarks) derivados de GHUM.
- Puntuacion de visibilidad por landmark, util para descartar puntos ocluidos.
- Segmentacion de primer plano de la persona mediante mascara de `256x256`.
- Puntuacion de presencia de pose para filtrar frames sin persona.
- Soporte de multiples poses por frame mediante el parametro `num_poses`.
- Ejecucion on-device en Android, iOS, Web, Python y Flutter via MediaPipe Tasks.
- Modos de ejecucion IMAGE, VIDEO y LIVE_STREAM segun la API de MediaPipe.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de texto o audio.

## Casos de uso

- **Analisis de forma deportiva en tiempo real**: integrado en una app movil, el modelo procesa frames de camara y compara angulos de rodilla, cadera y hombro con patrones de referencia para dar feedback correctivo en ejercicios como sentadillas o press de banca.
- **Rehabilitacion y fisioterapia remota**: el seguimiento de landmarks 3D metricos permite medir rangos de movimiento articulares en sesiones guiadas por videollamada, con la mascara de segmentacion para aislar al paciente del fondo.
- **Animacion de avatares y motion capture**: los world landmarks en coordenadas GHUM alimentan un rig esqueletico simplificado para retargeting en motores como Unity o Unreal, con latencia baja en dispositivos consumer.
- **Control gestual sin contacto**: la deteccion de munecas, dedos y hombros permite mapear gestos a comandos en interfaces de kiosco, television o automocion, sin depender de hardware dedicado.
- **Analisis ergonomico en entornos laborales**: procesamiento por lotes de video de camaras fijas para detectar posturas de riesgo (tronco inclinado, brazos elevados) y generar alertas; el modo VIDEO de MediaPipe permite decodificar flujos continuos.
- **Deporte y analitica de video amateur**: extraccion de esqueletos por frame para superponer trayectorias de articulaciones en grabaciones de entrenamiento, con la mascara de segmentacion para recortar al atleta.
- **Aplicaciones de fitness en navegador**: el bundle se ejecuta en Web mediante MediaPipe Tasks, permitiendo demos interactivas sin backend y con descarga inicial de 9.4 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El bundle completo pesa 9.4 MB, por lo que la huella de memoria es muy reducida en comparacion con modelos de vision generativos; no se dispone de cifra oficial de VRAM.
- Apto para CPU movil, GPU integrada y NPU de Android/iOS mediante LiteRT; no requiere GPU de escritorio.
- Cabe en cualquier GPU consumer (RTX 3050, RTX 4060, RTX 4090) y en iGPU; la carga es despreciable frente a modelos de difusion o LLM.
- Despliegue recomendado: MediaPipe Tasks (Python, Android, iOS, Web, Flutter); alternativas: LiteRT directamente, TFLite Interpreter, o conversion a ONNX para runtimes alternativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El diseno (entradas de 224 y 256 px, FP16) apunta a tiempo real en moviles, pero no hay cifras oficiales en la ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Keypoints | Segmentacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| MediaPipe Pose Landmarker Full (este) | no disponible | 224x224 + 256x256 | 33 (2D + 3D GHUM) | Si | Apache 2.0 | TFLite `.task` |
| MediaPipe Pose Landmarker Lite | no disponible | no disponible | 33 | Si | Apache 2.0 | TFLite `.task` |
| MediaPipe Pose Landmarker Heavy | no disponible | no disponible | 33 | Si | Apache 2.0 | TFLite `.task` |
| YOLOv8-pose (Ultralytics) | no disponible | 640x640 tipico | 17 | No | AGPL-3.0 | ONNX, PyTorch, TFLite |

La variante Full se situa entre Lite y Heavy en la familia MediaPipe Pose Landmarker; Lite sacrifica precision por latencia y Heavy prioriza precision. YOLOv8-pose ofrece 17 keypoints (sin manos ni pies detallados) y licencia AGPL, lo que condiciona uso comercial. No se dispone de comparativas numericas de precision entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de vision, no de lenguaje: no genera texto, no razona y no admite prompts; cualquier uso como componente de un agente requiere orquestacion externa.
- Precision limitada en poses muy ocluidas, personas de espaldas o recortes parciales del cuerpo; la puntuacion de visibilidad debe usarse para filtrar landmarks poco fiables.
- Los world landmarks 3D son estimaciones derivadas de GHUM, no medidas metricas exactas; no deben usarse para calculos clinicos sin calibracion.
- La mascara de segmentacion es de primer plano a `256x256`, con bordes gruesos; no sustituye una segmentacion de alta calidad.
- No se documentan sesgos demograficos en la informacion disponible; como todo modelo de vision entrenado con datos desconocidos, puede presentar variaciones de precision entre tonos de piel, complexiones y vestimenta.
- Licencia Apache 2.0 permite uso comercial y modificacion con atribucion; conviene revisar las condiciones de la libreria MediaPipe subyacente y de LiteRT.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha, y un tamano de repo reportado de 0.0 GB pese a que el bundle pesa 9.4 MB; verificar la integridad del fichero con el SHA-256 publicado antes de produccion.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que no se puede validar el rendimiento frente a alternativas sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Full
- Fichero del bundle: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Full/blob/main/pose_landmarker_full.task
- Model card upstream (PDF): https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Full/blob/main/Model%20Card%20BlazePose%20GHUM%203D.pdf
- Documentacion MediaPipe Pose Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/pose_landmarker
- Paper BlazePose: https://arxiv.org/abs/2006.10204
