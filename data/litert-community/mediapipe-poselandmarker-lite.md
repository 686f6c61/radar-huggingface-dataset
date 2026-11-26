# litert-community/MediaPipe-PoseLandmarker-Lite

## Resumen

MediaPipe Pose Landmarker Lite es un paquete de inferencia para deteccion de puntos clave del cuerpo humano desarrollado por el equipo litert-community y publicado bajo licencia Apache 2.0. Se distribuye como un fichero `.task` de 5,78 MB que empaqueta dos submodelos TFLite en precision FP16: un detector de persona y una red de landmarks de pose basada en la arquitectura BlazePose GHUM 3D. El modelo resuelve el problema de estimacion de pose 2D y 3D directamente en dispositivo (on-device), sin necesidad de conexion a servidor, en plataformas Android, iOS, Web, Python y Flutter.

La relevancia de este paquete radica en su tamano reducido y su integracion con el ecosistema MediaPipe Tasks, que abstrae el preprocesado, la decodificacion de salidas y el seguimiento entre fotogramas. La variante Lite prioriza velocidad y huella de memoria frente a las variantes Full y Heavy, lo que la hace adecuada para aplicaciones moviles en tiempo real o entornos con recursos limitados.

El modelo produce 33 landmarks con coordenadas normalizadas de pantalla, 33 landmarks 3D en metros derivados del modelo corporal GHUM, una puntuacion de presencia de pose y una mascara de segmentacion de primer plano. No es un modelo de lenguaje ni procesa texto: su unica modalidad de entrada es imagen RGB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos etapas: detector de persona (BlazeFace-like) + red de landmarks BlazePose GHUM 3D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | Pesos FP16 en los `.tflite` empaquetados; entrada/salida en `float32` |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (contenedor MediaPipe) con dos `.tflite` internos (`pose_detector.tflite`, `pose_landmarks_detector.tflite`) |

Especificaciones adicionales del bundle:

| Parametro | Valor |
|---|---|
| Tamano del fichero `.task` | 5.777.746 B (5,78 MB) |
| Tamano de `pose_detector.tflite` | 2.959.078 B (2,96 MB) |
| Tamano de `pose_landmarks_detector.tflite` | 2.818.390 B (2,82 MB) |
| Entrada del detector | `[1, 224, 224, 3]` float32, normalizacion `mean=127.5`, `std=127.5` |
| Entrada del landmarker | `[1, 256, 256, 3]` float32, normalizacion `mean=0.0`, `std=255.0` |
| Salidas del landmarker | `landmarks [1,195]`, `presence [1,1]`, `segmentation_mask [1,256,256,1]`, `heat_map [1,64,64,39]`, `world_landmarks [1,117]` |
| Numero de landmarks | 33 |
| SHA-256 del `.task` | `59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a` |

## Arquitectura y entrenamiento

El paquete sigue un diseno en cascada de dos etapas tipico de BlazePose. La primera etapa, `pose_detector.tflite`, recibe una imagen RGB de 224x224 y produce 2254 candidatos de caja delimitadora con 12 valores cada uno (coordenadas y keypoints de referencia) mas una puntuacion de confianza por candidato. A partir del mejor candidato se recorta y alinea una region de interes que se reescala a 256x256. La segunda etapa, `pose_landmarks_detector.tflite`, procesa ese recorte y emite simultaneamente los 33 landmarks normalizados en pantalla (`[1,195]`), la presencia de pose (`[1,1]`), una mascara de segmentacion de 256x256, un mapa de calor de 64x64 con 39 canales y los 33 landmarks 3D en metros (`[1,117]`) calculados mediante el modelo corporal GHUM.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO, ya que no se trata de un modelo generativo de lenguaje. La innovacion tecnica documentada es la combinacion de deteccion de persona y regresion de landmarks en un unico grafo de tareas con soporte de seguimiento entre fotogramas y la derivacion de coordenadas metricas 3D a partir de un modelo parametrico de cuerpo humano (GHUM 3D). El articulo de referencia es arXiv:2006.10204 (BlazePose).

## Capacidades

- Deteccion de persona y estimacion de 33 puntos clave del cuerpo (cara, torso, brazos, manos, piernas y pies) en imagenes y video.
- Salida de landmarks 2D normalizados en coordenadas de pantalla.
- Salida de landmarks 3D en metros mediante el modelo GHUM 3D.
- Puntuacion de presencia de pose para filtrar fotogramas sin persona.
- Mascara de segmentacion de primer plano de la persona detectada.
- Mapa de calor de 64x64 con 39 canales utilizable para postprocesado o depuracion.
- Ejecucion on-device en Android, iOS, Web, Python y Flutter mediante MediaPipe Tasks.
- Soporte de modo imagen y modo video con seguimiento entre fotogramas (gestionado por la API de MediaPipe, no por el modelo en si).
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio.

## Casos de uso

- **Fitness y entrenamiento guiado en movil**: la variante Lite permite estimar la postura del usuario en tiempo real en el propio telefono, comparar angulos articulares con una pose de referencia y corregir la ejecucion de un ejercicio sin enviar video a un servidor.
- **Telemedicina y rehabilitacion**: el modelo puede registrar la posicion de articulaciones durante ejercicios de rehabilitacion y generar metricas de rango de movimiento; sus landmarks 3D en metros facilitan el calculo de angulos y distancias reales.
- **Animacion y motion capture de bajo coste**: con la salida de 33 landmarks y world landmarks se puede accionar un rig esqueletico simple en un motor de juego o herramienta de animacion, usando la webcam del portatil y el runtime de Python o Web.
- **Analisis deportivo en video**: procesamiento por lotes de grabaciones con la API de Python para extraer series temporales de poses y calcular velocidad de gestos, simetria o deteccion de errores tecnicos.
- **Control por gestos en interfaces**: combinado con reglas geometricas sobre munecas y dedos, el modelo puede activar comandos en una aplicacion de escritorio o web sin necesidad de hardware especializado.
- **Realidad aumentada y filtros**: la mascara de segmentacion y los landmarks permiten anclar elementos graficos al cuerpo del usuario en aplicaciones de prueba virtual de ropa o efectos en directo.
- **Monitorizacion de ergonomia**: en una aplicacion de escritorio con webcam, el modelo puede estimar la postura del trabajador y alertar de posiciones mantenidas incorrectamente durante largos periodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el bundle completo ocupa 5,78 MB en disco; en ejecucion, con tensores intermedios y buffers de la API, el consumo tipico es del orden de decenas de MB de RAM, no de VRAM dedicada.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU movil y de escritorio. En Android e iOS se apoya en aceleradores como GPU delegate o NNAPI/XNNPACK segun la configuracion de MediaPipe.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada; el cuello de botella es la CPU y la camara, no la memoria grafica.
- Opciones de despliegue: MediaPipe Tasks para Android, iOS, Web (WASM), Python y Flutter; el fichero `.task` se carga directamente con la API `PoseLandmarker`. Tambien puede extraerse cada `.tflite` y ejecutarse con el interprete TFLite o LiteRT.
- Latencia y throughput: no disponibles en la informacion proporcionada. La variante Lite esta disenada para priorizar velocidad frente a Full y Heavy, pero no se aportan cifras de FPS ni de milisegundos por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Landmarks | 3D metrico | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| MediaPipe Pose Landmarker Lite (este) | no disponible (5,78 MB) | no aplica | 33 | Si (GHUM) | Apache 2.0 | MediaPipe Tasks, TFLite/LiteRT |
| MediaPipe Pose Landmarker Full | no disponible | no aplica | 33 | Si (GHUM) | Apache 2.0 | MediaPipe Tasks |
| MediaPipe Pose Landmarker Heavy | no disponible | no aplica | 33 | Si (GHUM) | Apache 2.0 | MediaPipe Tasks |
| YOLOv8-pose | no disponible en esta ficha | no aplica | 17 (COCO) | No | AGPL-3.0 (Ultralytics) | ONNX, TFLite, TensorRT |

Las variantes Full y Heavy de MediaPipe Pose Landmarker comparten arquitectura y salidas con Lite, pero priorizan precision sobre velocidad y tienen mayor huella. YOLOv8-pose ofrece 17 keypoints estilo COCO sin coordenadas 3D metricas y con licencia AGPL-3.0, lo que condiciona su uso comercial. No se dispone de cifras de precision comparadas en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado metricas de precision (PCK, mAP, error de landmarks) en la informacion disponible; la eleccion entre Lite, Full y Heavy debe validarse empiricamente en el caso de uso concreto.
- La variante Lite sacrifica precision frente a Full y Heavy; en poses complejas, oclusiones o cuerpos pequenos en la imagen puede degradarse mas.
- La deteccion se limita a una persona por fotograma en el flujo estandar de la API; escenas multitudinarias requieren estrategias adicionales.
- Los landmarks 3D en metros derivan de un modelo parametrico (GHUM) y no de una reconstruccion metrica real; pueden presentar sesgos sistematicos de escala y profundidad.
- El modelo puede verse afectado por sesgos de entrenamiento en cuanto a tono de piel, vestimenta, complexiones y condiciones de iluminacion; no se documenta la composicion del dataset.
- Riesgo de falsos positivos y de landmarks inestables en fotogramas con motion blur, baja resolucion o encuadres parciales.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los componentes upstream de Google MediaPipe y del modelo GHUM referenciados.
- El contenedor `.task` esta pensado para la API de MediaPipe; su uso con otros runtimes requiere extraer los `.tflite` internos y replicar el preprocesado y la decodificacion.
- No procesa lenguaje, audio ni texto; no dispone de capacidad de razonamiento ni de tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Lite
- Documentacion de MediaPipe Pose Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/ios
- Colab Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Pose_Landmarker.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/pose-landmarker.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/pose_landmarker
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/pose_landmarker
- Articulo BlazePose (arXiv:2006.10204): https://arxiv.org/abs/2006.10204
