# kaitlynbassford/face-analyzer-weights

## Resumen

`kaitlynbassford/face-analyzer-weights` no es un modelo entrenado por su autor, sino un repositorio espejo que agrupa los ficheros de pesos con licencia permisiva que consume la aplicacion [multimodal-face-analyzer](https://github.com/dpologdvinity/multimodal-face-analyzer). Publicado en octubre de 2026, el repositorio ocupa 0,4 GB y contiene quince ficheros que cubren deteccion de caras, mallas faciales y de manos, estimacion de edad, genero y etnia, clasificacion de emociones, deteccion de mascarillas, colorizacion y reconstruccion 3D de la cara.

Se trata, por tanto, de una coleccion heterogenea de modelos de vision por computador (CNN, grafos de MediaPipe y una red de colorizacion) y no de un modelo de lenguaje: no hay pesos transformer generativos, ni tokenizador, ni ventana de contexto, ni capacidad de generacion de texto. Su relevancia practica es la de un punto de descarga reproducible: la aplicacion `tools/fetch_models.py` verifica el sha256 de cada fichero contra `models/manifest.json` del repositorio de la aplicacion, de modo que cualquier desarrollador puede obtener binarios con licencias verificadas (MIT, Apache-2.0, BSD-2-Clause, CC BY 4.0 e Intel License Agreement) sin depender de los repositorios originales.

El autor solo aloja aquellos ficheros cuyo codigo y pesos permiten redistribucion clara; los pesos restringidos o de licencia ambigua se descargan desde su fuente original. Ningun fichero se relicencia: cada uno conserva las condiciones de su proyecto de origen, tal como se detalla en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: RetinaFace MobileNet-0.25 (deteccion), clasificadores CNN (FairFace, FER+, mini-Xception, detector de mascarillas), grafos MediaPipe Face Mesh V2 y Hand Landmarker, red de colorizacion de Zhang et al. y plantilla de alineacion 3D del BFM |
| Parametros totales | no disponible (el repositorio no publica recuentos de parametros) |
| Parametros activos | no aplica (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no aplica (modelos de vision, no modelos de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros se redistribuyen tal como se publicaron upstream, sin cuantizacion adicional declarada) |
| Idiomas soportados | no disponible (irrelevante para esta categoria de modelos) |
| Licencia | mixta: `mixed-permissive` (MIT, Apache-2.0, BSD-2-Clause, CC BY 4.0 e Intel License Agreement, segun fichero) |
| Formato de pesos | ONNX, safetensors, H5 (Keras), `.task` (MediaPipe/TensorFlow Lite), Caffe (`.caffemodel` y `.prototxt`), XML (cascada Haar), `.mat` y `.npy` |
| Tamano del repositorio | 0,4 GB |
| Numero de ficheros | 15 |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

Desglose de ficheros incluidos:

| Fichero | Tamano | Funcion | Licencia | Origen |
|---|---:|---|---|---|
| `opencv_face_detector.pbtxt` | 34.911 B | deteccion de caras | Apache-2.0 | opencv/opencv |
| `retinaface_mobilenet0.25.onnx` | 1.767.506 B | deteccion de caras | MIT (red) + Apache-2.0 (export ONNX) | biubug6/Pytorch_Retinaface, export de amd/retinaface |
| `fairface_7class.onnx` | 85.160.429 B | edad, genero y etnia (7 clases) | CC BY 4.0 | dchen236/FairFace |
| `mivolo_v2.safetensors` | 115.078.528 B | edad y genero | Apache-2.0 | iitolstykh/mivolo_v2 |
| `mivolo_v2_config.json` | 225 B | configuracion de MiVOLO v2 | Apache-2.0 | iitolstykh/mivolo_v2 |
| `emotion_ferplus.onnx` | 35.040.571 B | emocion | MIT | onnx/models (FER+) |
| `mini_xception_fer.h5` | 872.856 B | emocion | MIT | oarriaga/face_classification |
| `face_landmarker.task` | 3.758.596 B | landmarks faciales, mirada y liveness | Apache-2.0 | MediaPipe (Google) |
| `hand_landmarker.task` | 7.819.105 B | landmarks de manos | Apache-2.0 | MediaPipe (Google) |
| `mask_detector.h5` | 11.490.448 B | deteccion de mascarilla | MIT | chandrikadeb7/Face-Mask-Detection |
| `colorization_deploy_v2.prototxt` | 9.945 B | colorizacion | BSD-2-Clause | richzhang/colorization |
| `colorization_release_v2.caffemodel` | 128.946.764 B | colorizacion | BSD-2-Clause | richzhang/colorization |
| `pts_in_hull.npy` | 5.088 B | puntos del espacio de color para colorizacion | BSD-2-Clause | richzhang/colorization |
| `haarcascade_eye.xml` | 341.406 B | color de ojos y alineacion de inclinacion | Intel License Agreement (BSD-style) | opencv/opencv |
| `BFM/similarity_Lm3D_all.mat` | 994 B | reconstruccion 3D | MIT | sicxu/Deep3DFaceRecon_pytorch |

## Arquitectura y entrenamiento

El repositorio no entrena nada: agrega artefactos de inferencia ya entrenados por terceros. La deteccion de caras se cubre con dos opciones: el detector basado en el modulo DNN de OpenCV (fichero de configuracion `.pbtxt`) y RetinaFace con backbone MobileNet-0.25, exportado a ONNX por AMD a partir de la implementacion MIT de biubug6. La clasificacion demografica se reparte entre FairFace (modelo de 7 clases raciales, publicado en WACV 2021 por Karkkainen y Joo y convertido a ONNX sin que la conversion registre su origen) y MiVOLO v2, que estima edad y genero en un unico pase. La emocion se cubre con dos modelos: FER+ del ONNX Model Zoo y mini-Xception entrenado sobre FER2013 por Octavio Arriaga.

El seguimiento facial y manual se apoya en dos tareas de MediaPipe (Face Landmarker, basado en Face Mesh V2, y Hand Landmarker), que ademas de landmarks aportan estimacion de mirada y senales de liveness. Se anaden un detector de mascarillas entrenado por Chandrika Deb, una cascada Haar de OpenCV para ojos, la red de colorizacion "Colorful Image Colorization" de Zhang, Isola y Efros (ECCV 2016) en formato Caffe junto con su prototxt y la nube de puntos `pts_in_hull.npy`, y una plantilla de alineacion de landmarks del modelo 3D BFM procedente de Deep3DFaceRecon_pytorch.

No se documentan en la informacion disponible ni el numero de tokens o imagenes de entrenamiento, ni la composicion exacta de los datasets, ni si hubo ajuste por RLHF o DPO (tecnicas no aplicables a la mayoria de estos clasificadores). La unica innovacion operativa descrita es el mecanismo de distribucion: verificacion de integridad por sha256 contra un manifiesto y separacion estricta entre pesos redistribuibles y pesos que deben obtenerse del upstream.

## Capacidades

- Deteccion de caras en imagen completa, mediante OpenCV DNN y RetinaFace MobileNet-0.25.
- Malla facial densa con `face_landmarker.task`, incluyendo estimacion de mirada y senales de liveness (deteccion de presencia real frente a fotografia o pantalla).
- Malla de manos con `hand_landmarker.task`.
- Estimacion de edad y genero con dos vias independientes: FairFace (ademas con clasificacion en 7 categorias raciales) y MiVOLO v2.
- Clasificacion de emociones con dos modelos alternativos (FER+ y mini-Xception), lo que permite contraste o ensemble.
- Deteccion de mascarilla facial.
- Extraccion de color de ojos y alineacion por inclinacion mediante cascada Haar.
- Colorizacion automatica de imagenes en escala de grises con la red de Zhang et al.
- Plantilla de alineacion de landmarks para reconstruccion facial 3D (BFM).
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, generacion de texto ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Verificacion de identidad con prueba de vida: combinando `face_landmarker.task` (liveness y mirada) con RetinaFace para deteccion, se puede construir un control de acceso o un flujo KYC que descarte fotos de pantalla o impresas antes de comparar contra una base de referencia.
- Moderacion de contenido y analisis demografico agregado: FairFace y MiVOLO v2 permiten etiquetar grandes volumenes de imagenes por rango de edad y genero para estudios de representacion en medios, siempre que se apliquen las cautelas legales indicadas mas abajo.
- Analisis de reacciones en pruebas de usuario: `emotion_ferplus.onnx` o `mini_xception_fer.h5` permiten medir la respuesta emocional de participantes ante una interfaz, con la ventaja de que mini-Xception ocupa menos de 1 MB y puede ejecutarse en tiempo real en el dispositivo.
- Restauracion de archivos fotograficos: la red de colorizacion (128,9 MB) mas `pts_in_hull.npy` permite colorear automaticamente fotos historicas o escaneos en blanco y negro dentro de un pipeline de digitalizacion de fondos documentales.
- Control de cumplimiento sanitario o de acceso: el detector de mascarillas (11,5 MB) se puede integrar en camaras de entrada para verificar el uso de proteccion facial en entornos donde siga siendo obligatoria.
- Etiquetado automatico de datasets de caras: el conjunto completo sirve como preanotador para construir corpus de vision (bounding boxes, landmarks, atributos) antes de una revision humana, reduciendo el coste de anotacion manual.
- Realidad aumentada e interaccion sin contacto: los dos ficheros `.task` de MediaPipe permiten superponer efectos sobre la cara y las manos y habilitar gestos en navegador, Android o iOS sin necesidad de GPU dedicada.
- Auditoria de sesgo de otros sistemas: usar FairFace como referencia de atributos permite medir disparidades de rendimiento de un modelo de reconocimiento facial propio entre los siete grupos etnicos que clasifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar ficheros, tamanos, procedencia y licencias, sin incluir metricas de precision, recall, error medio de landmarks ni latencias. Tampoco los resultados de busqueda web proporcionados aportan cifras evaluables. Cualquier comparacion numerica entre estos modelos deberia realizarse con una evaluacion propia sobre el dominio objetivo (por ejemplo, WIDER FACE para deteccion o AffectNet para emocion), dado que no existe evidencia publicada vinculada a este espejo.

## Requisitos de hardware

- VRAM estimada: el fichero mas grande es `colorization_release_v2.caffemodel` con 128,9 MB, seguido de `mivolo_v2.safetensors` con 115,1 MB y `fairface_7class.onnx` con 85,2 MB. En FP32 y lote 1, cada componente cabe holgadamente por debajo de 1 GB de VRAM, por lo que un entorno con 2-4 GB dedicados es suficiente incluso ejecutando varios modelos en paralelo. Estas cifras son estimaciones derivadas del tamano de los ficheros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA o DirectML sirve; las cargas son tan reducidas que una RTX 3060, una RTX 4090 o una Tesla T4 estan sobredimensionadas para el conjunto completo. Las tarjetas A100 o H100 no aportan ventaja relevante en este escenario.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en graficos integrados recientes. La mayor parte de los componentes son viables en CPU: mini-Xception (0,87 MB), las dos tareas de MediaPipe (3,8 MB y 7,8 MB), el detector de mascarillas (11,5 MB) y RetinaFace (1,8 MB) pueden ejecutarse en tiempo real o casi en tiempo real en un portatil.
- Opciones de despliegue: ONNX Runtime para los ficheros `.onnx`; modulo DNN de OpenCV para `.pbtxt`, `.prototxt` y `.caffemodel`; MediaPipe Tasks (Python, C++, Android, iOS y JavaScript) para los `.task`; TensorFlow o Keras para los `.h5`; NumPy y SciPy para `pts_in_hull.npy` y `.mat`; Caffe solo si se mantiene un entorno heredado, dado que el modelo de colorizacion se distribuye en su formato original. vLLM, llama.cpp, Ollama y TGI no aplican porque no hay pesos de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Dentro del propio repositorio conviven alternativas para las mismas tareas, lo que permite comparar duplicidad funcional sin salir del conjunto:

| Tarea | Opcion A | Opcion B | Criterio de eleccion |
|---|---|---|---|
| Deteccion de caras | OpenCV DNN (`opencv_face_detector.pbtxt`, 35 KB de configuracion) | RetinaFace MobileNet-0.25 ONNX (1,8 MB) | RetinaFace aporta landmarks y suele ser mas robusto en caras pequenas o giradas; OpenCV es mas ligero de integrar si ya se usa el modulo DNN |
| Edad y genero | FairFace 7 clases ONNX (85,2 MB, CC BY 4.0) | MiVOLO v2 safetensors (115,1 MB, Apache-2.0) | FairFace anade categoria racial, lo que exige cautela legal; MiVOLO v2 tiene licencia Apache-2.0, mas sencilla de integrar en producto |
| Emocion | FER+ ONNX (35,0 MB, MIT) | mini-Xception H5 (0,87 MB, MIT) | FER+ es mas pesado; mini-Xception es 40 veces menor y apto para dispositivos con recursos limitados |
| Landmarks | MediaPipe Face Landmarker (3,8 MB, Apache-2.0) | Cascada Haar de ojos (341 KB, Intel License Agreement) | MediaPipe ofrece malla completa, mirada y liveness; la cascada Haar solo aporta posiciones oculares aproximadas |

Frente a alternativas externas (InsightFace, DeepFace como envoltorio de varios modelos, o los repositorios upstream por separado), no hay datos comparativos de precision, latencia ni consumo en la informacion disponible. La diferencia documentada frente a los upstream es de naturaleza operativa: este repositorio unifica la descarga, fija los tamanos y expone la licencia de cada pieza, mientras que los proyectos originales se distribuyen por separado y algunos pesos quedan deliberadamente fuera del espejo por su licencia.

## Limitaciones y advertencias

- No es un modelo entrenado ni validado por el autor del repositorio: es un espejo de artefactos de terceros. La responsabilidad sobre el comportamiento de cada red recae en su proyecto upstream.
- Licencias heterogeneas: `fairface_7class.onnx` es CC BY 4.0 y exige atribucion explicita; `haarcascade_eye.xml` se rige por el Intel License Agreement, cuyo texto completo esta en la cabecera del fichero; el resto son MIT, Apache-2.0 o BSD-2-Clause. La licencia global del repositorio figura como `other`/`mixed-permissive`, de modo que cada fichero debe revisarse antes de un uso comercial.
- La conversion a ONNX de FairFace no registra su origen, lo que dificulta auditar la fidelidad del modelo convertido respecto al original.
- Clasificar etnia o raza a partir de imagenes constituye tratamiento de categorias especiales de datos segun el articulo 9 del RGPD y requiere base juridica adecuada. El uso para decisiones automatizadas sobre personas (contratacion, seguros, acceso a servicios) es especialmente problematico y puede infringir normativa europea y estatal.
- La estimacion de edad y genero a partir de imagen es aproximada y presenta sesgos conocidos por grupo etnico, iluminacion y angulo de camara; los proyectos de origen documentan disparidades de rendimiento entre subgrupos. No debe usarse como fuente de verdad.
- Riesgo de falsos positivos y falsos negativos: el detector de mascarillas puede confundirse con manos u otros objetos sobre la boca, y las senales de liveness de MediaPipe pueden eludirse con ataques de presentacion elaborados. En un flujo de autenticacion conviene combinarlas con otras pruebas.
- Sin resultados de benchmarks publicados en esta informacion: no hay garantia documentada de precision para ningun caso de uso concreto.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de problemas.
- La aplicacion consumidora verifica integridad por sha256 contra un manifiesto externo; si ese manifiesto cambia, la descarga fallara. Conviene fijar la revision del repositorio de la aplicacion al desplegar.
- No aplica riesgo de alucinacion en el sentido de los modelos generativos, pero si existe riesgo de resultados plausibles y erroneos en todas las tareas de clasificacion (edad, genero, emocion, etnia).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kaitlynbassford/face-analyzer-weights
- Aplicacion que consume los pesos: https://github.com/dpologdvinity/multimodal-face-analyzer
- OpenCV (detector de caras y cascadas Haar): https://github.com/opencv/opencv/tree/4.x/samples/dnn/face_detector y https://github.com/opencv/opencv/tree/4.x/data/haarcascades
- RetinaFace ONNX (AMD): https://huggingface.co/amd/retinaface
- RetinaFace original (biubug6, MIT): https://github.com/biubug6/Pytorch_Retinaface
- FairFace: https://github.com/dchen236/FairFace
- MiVOLO v2: https://huggingface.co/iitolstykh/mivolo_v2 y https://github.com/WildChlamydia/MiVOLO
- FER+ en el ONNX Model Zoo: https://github.com/onnx/models/tree/main/validated/vision/body_analysis/emotion_ferplus
- mini-Xception (oarriaga/face_classification): https://github.com/oarriaga/face_classification
- MediaPipe Face Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
- MediaPipe Hand Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
- Detector de mascarillas: https://github.com/chandrikadeb7/Face-Mask-Detection
- Colorful Image Colorization: https://github.com/richzhang/colorization
- Deep3DFaceRecon_pytorch: https://github.com/sicxu/Deep3DFaceRecon_pytorch

Resultados de busqueda web consultados, ninguno de ellos con documentacion tecnica relevante sobre este repositorio:

- https://en.wikipedia.org/wiki/OpenAI%E2%80%93HuggingFace_incident
- https://benchlm.ai/
- https://claude.com/
- https://lingojam.org/face-analyzer
- https://footprintiq.app/find-person-by-photo
