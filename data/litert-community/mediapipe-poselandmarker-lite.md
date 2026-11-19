# litert-community/MediaPipe-PoseLandmarker-Lite

## Resumen

MediaPipe Pose Landmarker (Lite) es un paquete de modelos de deteccion de puntos clave del cuerpo humano desarrollado por el equipo MediaPipe de Google y distribuido en el repositorio comunitario `litert-community` de Hugging Face. Implementa la arquitectura BlazePose GHUM 3D en su variante Lite, un diseno de dos etapas que combina un detector de persona y una red de regresion de 33 puntos clave tridimensionales. El artefacto principal es `pose_landmarker_lite.task`, un bundle de 5,78 MB con pesos en FP16 que integra dos submodelos TFLite.

El modelo resuelve el problema de la estimacion de pose corporal en tiempo real sobre dispositivos de borde, sin necesidad de GPU ni de conexion a un servidor. Frente a los modelos de pose basados en transformers de gran tamano, la propuesta de MediaPipe prioriza la latencia y el consumo energetico: el bundle completo cabe en menos de 6 MB y esta pensado para ejecutarse en Android, iOS, navegador web, Python y Flutter mediante la libreria MediaPipe Tasks. La variante Lite es la mas ligera de las tres disponibles (Lite, Full y Heavy) en la familia Pose Landmarker.

La relevancia actual del modelo radica en su papel como componente de referencia para pipelines de vision por computador en produccion movil: proporciona landmarks 2D normalizados, landmarks 3D metricos en el espacio GHUM, una puntuacion de presencia de pose y una mascara de segmentacion de primer plano, todo ello en una unica inferencia en cascada. Su licencia Apache 2.0 facilita la integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazePose GHUM 3D, pipeline en dos etapas (detector de persona + red de landmarks), submodelos TFLite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | pesos FP16 en el bundle; los `.tflite` internos declaran entradas/salidas `float32`; no se documentan otras variantes de cuantizacion |
| Idiomas soportados | no aplica (modelo de vision, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (bundle MediaPipe que contiene `pose_detector.tflite` y `pose_landmarks_detector.tflite`) |

## Arquitectura y entrenamiento

El modelo sigue el diseno BlazePose descrito en el paper arXiv:2006.10204. La primera etapa, `pose_detector.tflite` (2,96 MB), recibe una imagen RGB de `[1, 224, 224, 3]` normalizada con `mean=127.5` y `std=127.5`, y produce 2254 cajas candidatas con 12 valores por caja (coordenadas y puntos clave de la region de interes) junto con sus puntuaciones. La segunda etapa, `pose_landmarks_detector.tflite` (2,82 MB), toma un recorte RGB de `[1, 256, 256, 3]` normalizado con `mean=0.0` y `std=255.0` y devuelve cinco salidas: 195 valores de landmarks (33 puntos con coordenadas y visibilidad), una puntuacion de presencia `[1, 1]`, una mascara de segmentacion `[1, 256, 256, 1]` y un mapa de calor `[1, 64, 64, 39]` con stride 39, ademas de 117 valores de world landmarks `[1, 117]` derivados mediante el modelo corporal GHUM.

La innovacion tecnica principal es el uso del modelo parametrico GHUM para elevar los landmarks 2D a coordenadas 3D metricas en un espacio canonico del cuerpo, lo que permite estimar profundidad relativa sin calibracion de camara. El bundle empaqueta ambos submodelos con pesos en FP16 para reducir el tamano y el ancho de banda de memoria en dispositivos moviles. No se documentan en la informacion disponible el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset ni el uso de RLHF o DPO, por tratarse de un modelo discriminativo de vision y no de un modelo generativo de lenguaje.

## Capacidades

- Deteccion de pose corporal completa con 33 puntos clave (nariz, ojos, orejas, boca, hombros, codos, munecas, dedos, caderas, rodillas, tobillos, talones y puntas de los pies).
- Salida de landmarks 2D normalizados en coordenadas de pantalla con puntuacion de visibilidad por punto.
- Salida de landmarks 3D metricos en el espacio GHUM (world landmarks) para estimacion de profundidad relativa.
- Mascara de segmentacion de primer plano de la persona a resolucion `256x256`.
- Puntuacion de presencia de pose para filtrar fotogramas sin persona.
- Deteccion de multiples poses configurable mediante el parametro `num_poses`.
- Ejecucion en modo imagen, video y streaming en vivo (`VisionRunningMode`).
- Soporte multiplataforma: Android, iOS, Web (JavaScript/WASM), Python y Flutter.
- Ejecucion totalmente on-device, sin dependencia de red.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente perceptivo.

## Casos de uso

- **Aplicaciones de fitness y entrenamiento guiado**: el modelo permite contar repeticiones y evaluar la correccion postural comparando angulos articulares (codo, rodilla, cadera) entre fotogramas. La variante Lite es adecuada porque mantiene la inferencia por debajo del presupuesto de tiempo real en moviles de gama media.
- **Motion capture sin marcadores para animacion**: los world landmarks 3D en espacio GHUM permiten reconstruir el esqueleto de un actor y transferirlo a un rig de animacion. La salida de 33 puntos incluye manos y pies, suficiente para retargeting basico.
- **Realidad aumentada y filtros corporales**: la mascara de segmentacion `256x256` y los landmarks permiten superponer ropa virtual, efectos o avatares sobre la silueta del usuario en tiempo real dentro de una app movil.
- **Analisis ergonomico en entornos industriales**: con una camara fija y el modo video, el modelo puede monitorizar posturas de trabajo y detectar angulos de riesgo lumbar u hombro, procesando localmente para preservar la privacidad de los trabajadores.
- **Telemedicina y rehabilitacion**: seguimiento domiciliario de ejercicios de fisioterapia mediante la camara del movil, registrando la trayectoria de munecas y rodillas y detectando desviaciones respecto al patron correcto sin enviar video a la nube.
- **Deportes y analisis biomecanico amateur**: extraccion de trayectorias de tobillo y cadera en videos de carrera o salto para calcular parametros como la cadencia o el angulo de aterrizaje, usando el modo imagen sobre fotogramas extraidos.
- **Control gestual de interfaces**: los landmarks de manos y brazos permiten construir interacciones sin contacto en quioscos o pantallas publicas, ejecutando el modelo en WebAssembly dentro del navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el bundle completo ocupa 5,78 MB en disco y los pesos FP16 caben holgadamente en la memoria compartida de cualquier SoC movil moderno.
- GPU recomendadas: no requiere GPU dedicada. Esta disenado para CPU, GPU integrada o NPU de dispositivos moviles mediante los delegados de TensorFlow Lite / LiteRT (GPU delegate, NNAPI, Core ML, XNNPACK).
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) con un consumo de memoria despreciable; su uso en escritorio tiene sentido para procesamiento por lotes de video.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, Web, Flutter), TensorFlow Lite / LiteRT con los `.tflite` internos extraidos del bundle, y el runtime de MediaPipe en navegador via WebAssembly.
- Latencia y throughput: no disponibles en la informacion proporcionada. La variante Lite es la de menor coste computacional de la familia Pose Landmarker, pero no se aportan cifras de milisegundos por fotograma ni de FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe Pose Landmarker Lite (este modelo) | no disponible (bundle de 5,78 MB) | 224x224 detector + 256x256 landmarks | 33 landmarks 2D/3D, presencia, mascara, heatmap | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| MediaPipe Pose Landmarker Full | no disponible (mayor que Lite) | misma cascada | mismas salidas | Apache 2.0 | MediaPipe Tasks |
| MediaPipe Pose Landmarker Heavy | no disponible (el mayor de la familia) | misma cascada | mismas salidas | Apache 2.0 | MediaPipe Tasks |
| BlazePose GHUM 3D (paper original) | no disponible | imagen RGB | 33 landmarks 3D | investigacion | arXiv:2006.10204 |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre las variantes Lite, Full y Heavy, ni de comparaciones con alternativas de otros autores (por ejemplo, modelos de pose basados en HRNet o ViTPose).

## Limitaciones y advertencias

- Modelo puramente perceptivo: no genera texto, no razona y no admite instrucciones en lenguaje natural; cualquier uso conversacional requiere un modelo adicional.
- Precision limitada en la variante Lite: al ser la version mas pequena de la familia, los landmarks en poses extremas, oclusiones severas o cuerpos muy alejados de la camara pueden ser menos precisos que en Full o Heavy.
- Dependencia de la etapa de deteccion: si el detector de persona falla (multitudes densas, recortes parciales del cuerpo), la etapa de landmarks no recibe una region de interes valida.
- Sesgos no documentados: la informacion disponible no detalla la composicion demografica del dataset de entrenamiento ni evaluaciones de equidad entre tonos de piel, tipos corporales o indumentaria.
- Riesgo de falsos positivos en escenas sin personas: la puntuacion de presencia debe umbralizarse en produccion.
- Los landmarks 3D son relativos al espacio GHUM y no estan calibrados en metros absolutos con respecto a la camara; la escala depende de la normalizacion interna.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte oficial en el repositorio comunitario.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa de esta copia concreta frente al artefacto original de Google.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Lite
- Documentacion de MediaPipe Pose Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/pose_landmarker
- Paper BlazePose: https://arxiv.org/abs/2006.10204
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Lite/blob/main/pose_landmarker_lite.task
- Model card original de Google (PDF): https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Lite/blob/main/Model%20Card%20BlazePose%20GHUM%203D.pdf
