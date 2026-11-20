# ipsilondev/mediapipe-pose-landmarker

## Resumen

`ipsilondev/mediapipe-pose-landmarker` no es un modelo de IA generativa entrenado por su autor, sino un espejo (mirror) de dos ficheros oficiales de Google para la deteccion de landmarks de pose corporal: `pose_landmarker_lite.task` y `pose_landmarker_full.task`. El autor, `ipsilondev`, declara explicitamente que se trata de copias sin modificar de los bundles publicados por Google LLC bajo licencia Apache-2.0, con el objetivo de que aplicaciones Android puedan fijarlos por commit mediante un submódulo git y verificar su integridad con SHA-256.

Los ficheros corresponden a la arquitectura BlazePose de MediaPipe: un detector de pose con entrada de 224x224 y un modelo de regresion de 33 landmarks con entrada de 256x256, empaquetados en formato `.task` (bundle de MediaPipe Tasks) con pesos en float16. Se cargan mediante la libreria nativa `com.google.mediapipe:tasks-vision` para Android, no mediante runtimes web.

Su relevancia es practica y de cadena de suministro: ofrece artefactos binarios reproducibles y verificables para pipelines de vision por computador en movil, evitando dependencias de descargas dinamicas desde `storage.googleapis.com`. No hay pesos entrenados por el autor ni innovaciones de arquitectura propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazePose (MediaPipe Pose Landmarker): detector de pose 224x224 + modelo de 33 landmarks 256x256 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de vision) |
| Tipos de cuantizacion | float16 (unica precision publicada en estos bundles) |
| Idiomas soportados | no disponible (no aplica; modelo de vision, sin salida de texto) |
| Licencia | Apache-2.0 (Google LLC) |
| Formato de pesos | `.task` (bundle MediaPipe Tasks; contiene grafos TFLite) |

Detalle de ficheros:

| Fichero | Bytes | SHA-256 | Variante |
|---|---|---|---|
| `pose_landmarker_lite.task` | 5.777.746 | `59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a` | lite, float16 |
| `pose_landmarker_full.task` | 9.398.198 | `4eaa5eb7a98365221087693fcc286334cf0858e2eb6e15b506aa4a7ecdcec4ad` | full, float16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es BlazePose, un pipeline de dos etapas propio de MediaPipe: primero un detector de persona/pose que opera sobre recortes de 224x224 y despues un modelo de regresion que predice 33 landmarks corporales sobre regiones de 256x256. Los bundles `.task` empaquetan los grafos TFLite junto con los metadatos necesarios para la API `PoseLandmarker` de MediaPipe Tasks. Los pesos estan en float16.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens o imagenes, ni sobre procesos de RLHF/DPO (no aplicables a este tipo de modelo). El autor indica que no realizo conversion, cuantizacion ni ningun otro cambio respecto a los ficheros originales de Google. La unica particularidad tecnica documentada es la verificacion de integridad mediante SHA-256 y el almacenamiento como objetos LFS/Xet en Hugging Face, con ficheros puntero de aproximadamente 130 bytes si se clona sin `git-lfs`.

## Capacidades

- Deteccion de pose corporal con 33 landmarks (segun la descripcion del bundle de MediaPipe Pose Landmarker).
- Inferencia en dispositivo via `com.google.mediapipe:tasks-vision` para Android.
- Dos variantes de compromiso precision/rendimiento: `lite` (5,78 MB) y `full` (9,40 MB).
- Integracion como submódulo git fijado por commit, con verificacion de bytes por SHA-256.
- No incluye tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento.
- No incluye vision generativa, audio ni salida de texto.

## Casos de uso

- Aplicaciones Android de fitness: integrar `PoseLandmarker` con el bundle `lite` para estimar postura y angulos articulares en tiempo real en movil, con un fichero de 5,78 MB adecuado para dispositivos de gama media.
- Rehabilitacion y fisioterapia: usar la variante `full` para obtener landmarks mas precisos en ejercicios guiados, validando la integridad del fichero con SHA-256 en el pipeline de build.
- Cadena de suministro reproducible: fijar el repositorio como submódulo git por commit para garantizar que cada build de CI descarga exactamente los mismos bytes, sin depender de URLs dinamicas de Google Cloud Storage.
- Analisis deportivo offline: procesar videos de entrenamiento en un servicio backend que ejecute MediaPipe sobre fotogramas y derive metricas de movimiento a partir de los 33 landmarks.
- Control por gestos corporales: usar los landmarks para mapear movimientos del cuerpo a acciones en interfaces de realidad aumentada o juegos en Android.
- Verificacion de artefactos en auditorias: comprobar el SHA-256 de los bundles contra los valores documentados antes de desplegarlos en produccion, como control de integridad de dependencias binarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Los bundles estan pensados para inferencia en CPU/NPU en Android, no para GPU de escritorio.
- GPU recomendadas: no disponible; el caso de uso documentado es `MediaPipe Tasks` nativo en Android.
- Compatibilidad con GPU de consumo: no aplica segun la informacion disponible; el despliegue objetivo es movil.
- Opciones de despliegue: `com.google.mediapipe:tasks-vision` (Android). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `ipsilondev/mediapipe-pose-landmarker` (este) | BlazePose, 33 landmarks | 5,78 MB (lite) / 9,40 MB (full) | `.task` | Apache-2.0 | Espejo verificable de ficheros de Google |
| MediaPipe Pose Landmarker oficial (Google) | BlazePose, 33 landmarks | mismos bundles | `.task` | Apache-2.0 | Descarga desde `storage.googleapis.com` |
| Alternativas de estimacion de pose (p. ej. YOLO-Pose, RTMPose) | Deteccion/regresion de keypoints | no disponible | ONNX/TFLite | variable | No disponibles en la informacion proporcionada |

La comparativa con otros modelos de pose no puede completarse con datos concretos a partir de la informacion disponible; los unicos datos verificables son los de este repositorio y su origen oficial.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un espejo de artefactos de Google; cualquier cambio de comportamiento depende del upstream.
- Sin `git-lfs`, un clon devuelve ficheros puntero de aproximadamente 130 bytes, no los pesos reales; hay que usar `git lfs pull` o clonar con LFS y verificar el SHA-256.
- Orientado exclusivamente a Android mediante MediaPipe Tasks nativo; el autor indica que no se usa en runtimes web.
- Solo se publican variantes float16; no hay pesos en otras precisiones ni cuantizaciones documentadas.
- Sin informacion sobre sesgos, tasas de error o robustez en condiciones dificiles (oclusiones, iluminacion, cuerpos parciales).
- No aplica uso comercial restrictivo: la licencia Apache-2.0 de Google LLC permite uso comercial, pero conviene conservar avisos de licencia y atribucion.
- El repositorio muestra 0 descargas y 0 likes, por lo que no hay evidencia de adopcion ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/ipsilondev/mediapipe-pose-landmarker
- Origen `pose_landmarker_lite`: https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task
- Origen `pose_landmarker_full`: https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task
- Documentacion de MediaPipe Pose Landmarker (referencia del bundle): no disponible en la informacion proporcionada
- Repositorio base `mediapipepose` citado por el autor: no disponible como enlace directo en la informacion proporcionada
