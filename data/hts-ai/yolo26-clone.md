# hts-ai/YOLO26-clone

## Resumen

YOLO26 (repositorio `hts-ai/YOLO26-clone`) es un modelo de vision por computador de la familia YOLO publicada por Ultralytics, orientado a deteccion de objetos y a otras tareas visuales como segmentacion de instancias, segmentacion semantica, clasificacion de imagenes, estimacion de pose, deteccion de objetos orientados (OBB), estimacion de profundidad y seguimiento (tracking) de objetos entre fotogramas de video. El repositorio de HuggingFace lo ha publicado la cuenta `hts-ai`, no la organizacion oficial de Ultralytics, aunque la model card y el `model-index` referencian el modelo `ultralytics/yolo26` y enlazan a la documentacion, al paper y a la plataforma del fabricante.

El modelo se distribuye con la libreria `ultralytics` y licencia AGPL-3.0, con opcion de licencia Enterprise para uso comercial. El unico dato cuantitativo de rendimiento declarado es un mAP@0.5:0.95 de 57,5 sobre el split de validacion de COCO, marcado como no verificado (`verified: false`). No se especifican en la informacion disponible el numero de parametros, la resolucion de entrada ni las variantes de tamano, por lo que cualquier cifra de VRAM o latencia debe medirse en el entorno real de despliegue.

La relevancia de esta ficha es doble: por un lado, documenta la generacion YOLO26 de Ultralytics como modelo multitarea de vision; por otro, advierte de que la publicacion es un clon de terceros con 0 descargas y 0 likes en el momento de la consulta, sin verificacion de metricas, lo que exige cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Ultralytics YOLO26 (modelo de vision). Detalle de backbone, neck y head no disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision). Resolucion de entrada no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | 11 idiomas declarados en los metadatos: en, zh, ja, ru, de, fr, es, pt, tr, vi, ar. Corresponden a la documentacion del proyecto, no a procesamiento de lenguaje natural |
| Licencia | AGPL-3.0, con licencia comercial Enterprise disponible a traves de Ultralytics |
| Formato de pesos | no especificado en la informacion disponible. Repositorio de 1,2 GB; libreria declarada: `ultralytics` |
| Tarea principal (pipeline) | object-detection |
| Otras tareas declaradas | instance-segmentation, semantic-segmentation, image-classification, pose-estimation, obb, tracking, depth estimation |
| Dataset de evaluacion | COCO, split `validation` (`merve/coco`) |
| Metrica declarada | mAP@0.5:0.95 = 57,5 (no verificada) |
| Paper | arXiv:2606.03748 |
| Autor del repositorio | hts-ai (clon; el modelo referenciado es `ultralytics/yolo26`) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion y actualizacion | 2026-10-23 (ambas) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como parte de la familia YOLO26 de Ultralytics, una saga de detectores de un solo pase pensada para inferencia en tiempo real y ampliada a multiples cabeceras de tarea (deteccion, segmentacion de instancias y semantica, clasificacion, pose, OBB y profundidad). Los detalles concretos de arquitectura interna, funcion de perdida, estrategia de asignacion de etiquetas y mecanismos de exportacion no aparecen en el material consultado; la model card remite al paper oficial (arXiv:2606.03748) y a la documentacion de Ultralytics para esos puntos.

Tampoco se especifican en la informacion proporcionada el volumen de tokens o imagenes de entrenamiento, la composicion del dataset mas alla de la evaluacion en COCO, ni si hubo fases de ajuste fino con preferencias humanas (RLHF/DPO), algo por otra parte poco habitual en modelos discriminativos de vision. La model card se centra en el uso (entrenamiento, validacion, prediccion y despliegue mediante el paquete `ultralytics`) y en la comparativa grafica de rendimiento publicada como imagen, sin cifras textuales adicionales.

## Capacidades

- Deteccion de objetos: localizacion y clasificacion de instancias en imagen, tarea principal declarada en el pipeline.
- Segmentacion de instancias: mascaras por objeto, segun la lista de tareas de la model card.
- Segmentacion semantica: etiquetado por clase a nivel de pixel, tarea adicional listada por Ultralytics.
- Clasificacion de imagenes: categoria global por imagen.
- Estimacion de pose: localizacion de puntos clave sobre personas u objetos, segun la documentacion referenciada.
- Deteccion de objetos orientados (OBB): cajas rotadas, util para imagery aerea y escenas con objetos inclinados.
- Estimacion de profundidad: tarea listada en la model card de Ultralytics.
- Seguimiento (tracking) de objetos a lo largo de fotogramas de video.
- Multilingue en documentacion: espanol, ingles, chino, japones, coreano, ruso, aleman, frances, portugues, turco, vietnamita y arabe (no implica capacidades de NLP en el modelo).
- No se declaran en la informacion disponible capacidades de tool calling, razonamiento multi-paso, modo thinking ni procesamiento de audio o lenguaje natural.

## Casos de uso

- Inspeccion visual industrial: el modelo puede ejecutarse sobre imagenes de linea de produccion para detectar defectos, piezas mal orientadas o elementos ausentes, aprovechando la tarea de deteccion y, si se necesita precision geometrica, la de segmentacion de instancias.
- Analitica de retail y lineal de tienda: conteo y localizacion de productos en estanterias y deteccion de huecos, con tracking para agregar metricas por pasillo a partir de video.
- Videovigilancia y seguridad laboral: deteccion de personas y equipos de proteccion individual, con seguimiento entre fotogramas para evitar dobles conteos en escenas con oclusiones.
- Aforo y analisis de trafico: conteo de vehiculos y peatones en secuencias de camara fija, usando deteccion mas tracking; la estimacion de profundidad puede apoyar el calculo de distancias relativas.
- Teledeteccion y agricultura de precision: deteccion de objetos orientados (OBB) sobre imagenes de dron para localizar cultivos, naves o infraestructuras con orientacion arbitraria.
- Analisis deportivo y biomecanica: estimacion de pose sobre video para extraer esqueletos y calcular angulaciones o trayectorias de movimiento.
- Automatizacion de catalogos y control de calidad de imagen: clasificacion y deteccion sobre lotes de imagenes antes de publicarlas en un CMS o marketplace.
- Robotica y navegacion asistida: percepcion de obstaculos y objetos relevantes en tiempo real, siempre que se valide la latencia del modelo sobre el hardware objetivo.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| Deteccion de objetos | COCO (`merve/coco`) | validation | mAP@0.5:0.95 | 57,5 | No (`verified: false`) |

No se han publicado en la informacion disponible resultados de otras metricas (mAP@0.5, mAP por tamano de objeto, latencia, FPS), ni cifras para segmentacion, pose, clasificacion u OBB, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de la variante de tamano del modelo y de la cuantizacion, datos que no aparecen en la informacion proporcionada; debe medirse sobre el checkpoint concreto.
- GPU recomendadas: no disponibles. Por la naturaleza de la familia YOLO, el modelo esta disenado para inferencia de baja latencia, pero sin variantes ni resolucion de entrada publicadas no es posible recomendar modelos concretos (A100, H100, RTX 4090, etc.).
- Encaje en GPU de consumo: no confirmado en la informacion disponible. El repositorio ocupa 1,2 GB, dato que no equivale al peso del checkpoint ni al uso de VRAM en ejecucion.
- Opciones de despliegue: el paquete `ultralytics` cubre entrenamiento, validacion, prediccion y despliegue segun la documentacion oficial. Formatos de exportacion (ONNX, TensorRT, OpenVINO, CoreML) y su disponibilidad para este checkpoint no se detallan en la informacion consultada.
- Latencia y throughput: no disponibles. No se han publicado FPS ni tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de cifras de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion es cualitativa.

| Modelo | Familia / tarea | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLO26 (`hts-ai/YOLO26-clone`) | YOLO, deteccion y multitarea visual | no disponible | no disponible | mAP@0.5:0.95 57,5 en COCO val (no verificado) | AGPL-3.0 + Enterprise | HuggingFace, 0 descargas |
| YOLO11 (Ultralytics) | YOLO, deteccion y multitarea visual | no disponible | no disponible | no disponible en esta ficha | AGPL-3.0 + Enterprise | HuggingFace / GitHub de Ultralytics |
| YOLOv8 (Ultralytics) | YOLO, deteccion y multitarea visual | no disponible | no disponible | no disponible en esta ficha | AGPL-3.0 + Enterprise | HuggingFace / GitHub de Ultralytics |
| RT-DETR | Transformer de deteccion en tiempo real | no disponible | no disponible | no disponible en esta ficha | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio es un clon publicado por la cuenta `hts-ai`, no por Ultralytics. Conviene contrastar el checkpoint con la publicacion oficial `ultralytics/yolo26` antes de usarlo en produccion.
- La unica metrica declarada esta marcada como no verificada (`verified: false`); no hay validacion independiente del mAP de 57,5.
- El modelo no ha sido creado para procesar lenguaje natural: los 11 idiomas declarados corresponden a la documentacion del proyecto, no a capacidades linguisticas del checkpoint.
- No se especifican parametros, resolucion de entrada ni variantes de tamano, lo que impide estimar a priori VRAM, latencia o throughput.
- Licencia AGPL-3.0: el uso comercial en productos o servicios en red exige cumplir las obligaciones de la AGPL o adquirir una licencia Enterprise de Ultralytics. Verificar con el departamento legal antes de integrarlo.
- Riesgo de falsos positivos y negativos en dominios alejados del dataset de entrenamiento (COCO); es necesario validar con datos propios y ajustar umbrales de confianza y NMS.
- Sesgos potenciales derivados de la distribucion del dataset de entrenamiento: el rendimiento puede degradarse en condiciones de iluminacion, oclusion, clases poco representadas o sesgos demograficos en tareas de persona (pose, deteccion).
- Sin datos publicados de robustez frente a imagenes adversarias, dominios nocturnos o camaras de baja calidad.
- El rendimiento de tracking depende del algoritmo de asociacion y del framerate del video, no solo del detector.
- No hay garantia de mantenimiento ni soporte por parte del publicador del clon (0 descargas, 0 likes, sin actualizaciones desde la creacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hts-ai/YOLO26-clone
- Paper oficial de YOLO26: https://arxiv.org/abs/2606.03748
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- Documentacion en espanol: https://docs.ultralytics.com/es
- Tarea de deteccion: https://docs.ultralytics.com/tasks/detect
- Tarea de segmentacion de instancias: https://docs.ultralytics.com/tasks/segment
- Tarea de segmentacion semantica: https://docs.ultralytics.com/tasks/semantic
- Tarea de clasificacion: https://docs.ultralytics.com/tasks/classify
- Tarea de estimacion de profundidad: https://docs.ultralytics.com/tasks/depth
- Tarea de estimacion de pose: https://docs.ultralytics.com/tasks/pose
- Tarea de objetos orientados (OBB): https://docs.ultralytics.com/tasks/obb
- Modo tracking: https://docs.ultralytics.com/modes/track
- Repositorio de GitHub: https://github.com/ultralytics/ultralytics
- Incidencias y soporte: https://github.com/ultralytics/ultralytics/issues/new/choose
- Plataforma Ultralytics (modelo): https://platform.ultralytics.com/ultralytics/yolo26
- Licencia comercial Enterprise: https://www.ultralytics.com/license
- Discord: https://discord.com/invite/ultralytics
- Foro de la comunidad: https://community.ultralytics.com/
- Reddit: https://www.reddit.com/r/ultralytics/
- Notebook de ejemplo en Colab: https://colab.research.google.com/github/ultralytics/ultralytics/blob/main/examples/tutorial.ipynb
- Modelo en Kaggle: https://www.kaggle.com/models/ultralytics/yolo26
