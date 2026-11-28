# LibreYOLO/LibreLoopDVRx-pose

## Resumen

LibreLoopDVRx-pose es un modelo de estimación de pose 2D mult persona empaquetado para el framework LibreYOLO. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador especializado en detección de puntos clave (keypoint detection): predice 17 keypoints del esqueleto COCO sobre cada persona detectada en una imagen, con una única clase (`person`) y 60 queries de detección. Procede del proyecto LoopDVR (LoopPose, variante de tamaño X) desarrollado por The LoopDVR Authors (Great Bay University / Intellindust AI Lab) y ha sido reempaquetado por LibreYOLO para integrarse en su API unificada.

El valor del artefacto es fundamentalmente de interoperabilidad: los pesos son idénticos bit a bit al state dict original `looppose-x.pth` publicado en la release v1.0 de LoopDVR; el trabajo de LibreYOLO consiste en añadir metadatos de checkpoint (familia de modelo, tarea, tamaño, número de clases, nombres de clase, resolución de entrada) para que la factoría `LibreYOLO()` enrute el modelo sin heurísticas basadas en el nombre del fichero. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0.

Es relevante para quienes ya trabajan con el ecosistema LibreYOLO y quieren incorporar estimación de pose multi-persona sin salir de su API de inferencia, así como para reproducir los resultados de LoopPose en un formato de checkpoint estandarizado. El modelo es muy reciente (creado el 27 de noviembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoopDVR / LoopPose (arquitectura de estimacion de pose del proyecto LoopDVR; detalles internos de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada configurable via `imgsz`, valor por defecto no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (vision; sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint `.pt` para la libreria `libreyolo` (derivado de `looppose-x.pth`) |

Otros datos tecnicos: tarea `keypoint-detection`, pipeline de Hugging Face `keypoint-detection`, 17 keypoints COCO, 1 clase (`person`), 60 queries, tamano de repo 0,1 GB, libreria `libreyolo`.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de LoopDVR/LoopPose: solo indica que se trata de un modelo de estimacion de pose 2D multi-persona con 17 keypoints COCO, clase unica `person` y 60 queries. El termino "queries" sugiere un esquema de deteccion basado en consultas aprendidas (estilo DETR), pero la informacion proporcionada no confirma la arquitectura concreta ni los detalles del backbone, el decodificador o el mecanismo de asociacion entre queries y personas. Tampoco se detallan los datos de entrenamiento (numero de imagenes, composicion del dataset, uso de aumento de datos) ni si hubo fases de ajuste fino supervisado adicionales. Cualquier afirmacion sobre atencion, decodificacion o regimen de entrenamiento seria especulativa y no se incluye.

Lo que si esta documentado es el proceso de reempaquetado: los pesos provienen del commit `f2aba1f122029e4db757b69cd37fc5a4909db34e` del repositorio `Intellindust-AI-Lab/LoopDVR` y del fichero `looppose-x.pth` de la release v1.0 de `Siruuui/LoopDVR`. LibreYOLO no modifica los parametros aprendidos; solo envuelve el state dict con metadatos v1.0 (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoria unificada enrute el modelo. El script de conversion esta disponible en `weights/convert_loopdvr_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Estimacion de pose 2D multi-persona: detecta y localiza 17 keypoints del esqueleto COCO por persona en una imagen.
- Deteccion de una unica clase (`person`), con 60 queries de deteccion.
- Integracion con la API unificada de LibreYOLO: `LibreYOLO("LibreLoopDVRx-pose.pt")` devuelve un objeto modelo invocable sobre imagenes con opciones como `save=True`.
- Enrutado automatico por metadatos de checkpoint, sin depender de heurísticas sobre el nombre del fichero.
- Salida compatible con el formato de resultados de LibreYOLO (no se detalla el esquema exacto de keypoints en la informacion disponible).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de keypoint detection.

## Casos de uso

- Analisis de video de vigilancia o aforo: el modelo puede procesar fotogramas y extraer los 17 keypoints de cada persona detectada para estimar posturas, direccion de marcha o permanencia en zonas, aprovechando la deteccion multi-persona con 60 queries.
- Biomecanica deportiva y analisis de movimiento: sobre secuencias de video de atletas, la salida de keypoints permite calcular angulos articulares y trayectorias; el modelo es adecuado por su tarea especifica de pose 2D y su integracion directa en pipelines Python via LibreYOLO.
- Control de calidad ergonomico en entornos industriales: detectar posturas de riesgo (flexion de tronco, elevacion de brazos) en imagenes de planta mediante los keypoints COCO, con la ventaja de una unica clase `person` que simplifica el post-procesado.
- Animacion y captura de movimiento de bajo coste: usar los keypoints 2D como entrada para rigging o retargeting en herramientas de animacion, sustituyendo sistemas de captura con marcadores por inferencia sobre video convencional.
- Realidad aumentada y efectos sobre personas: anclar elementos graficos a articulaciones concretas (munecas, cabeza, caderas) en aplicaciones de filtros o prueba virtual, gracias a la salida de 17 puntos por persona.
- Investigacion en vision por computador: servir como baseline reproducible de LoopPose en el ecosistema LibreYOLO para comparar con otros modelos de pose (YOLO-pose, RTMPose, etc.) bajo una misma API de inferencia.
- Preprocesado para modelos de accion o gesto: generar esqueletos 2D por fotograma que alimenten clasificadores de accion temporal, aprovechando la deteccion multi-persona para escenas con varias personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de AP sobre COCO, latencia, throughput ni comparaciones numericas con otros modelos de pose. Tampoco se dispone de datos de rendimiento del reempaquetado en LibreYOLO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,1 GB, lo que sugiere un modelo de escala moderada, pero no se especifican parametros ni precision de pesos.
- GPU recomendadas: no disponibles. Al ser un modelo de vision de 0,1 GB, es probable que quepa en GPUs de consumo, pero esta afirmacion no puede confirmarse con la informacion proporcionada.
- Cabe en consumer GPU: no confirmado; el tamano del artefacto es compatible con GPUs de gama media, pero se desconoce el pico de memoria en inferencia.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` (`pip install libreyolo`) con la API `LibreYOLO(...)`. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX/TensorRT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreLoopDVRx-pose | no disponible | imagen, `imgsz` configurable | Pose 2D multi-persona, 17 keypoints COCO | Apache 2.0 | Hugging Face (LibreYOLO) |
| LoopPose-X (upstream) | no disponible | imagen | Pose 2D multi-persona, 17 keypoints COCO | Apache 2.0 | Release v1.0 de Siruuui/LoopDVR |
| YOLO-pose (familia) | no disponible en la informacion | imagen | Pose 2D | depende de la variante | Ecosistema Ultralytics / LibreYOLO |
| RTMPose | no disponible en la informacion | imagen / region | Pose 2D | Apache 2.0 (segun proyecto) | MMPose / OpenMMLab |

La comparacion cuantitativa (AP COCO, latencia) no esta disponible en la informacion proporcionada. La diferencia principal de LibreLoopDVRx-pose frente al LoopPose-X original es el empaquetado con metadatos LibreYOLO y la integracion en su API unificada; los pesos son identicos.

## Limitaciones y advertencias

- Modelo de vision especializado: no genera texto ni razona; no debe evaluarse como un LLM.
- Sin datos publicados de precision (AP COCO) ni de robustez ante oclusiones, multitudes densas o poses extremas; el rendimiento real en produccion no puede estimarse a partir de la informacion disponible.
- Clase unica `person`: no detecta otros objetos ni keypoints fuera del esquema COCO de 17 puntos (sin keypoints faciales finos ni de manos).
- 60 queries limitan el numero maximo de personas procesables por imagen; escenas con mas personas pueden requerir estrategias de troceado o perdida de detecciones.
- Sesgos conocidos: no documentados en la model card; al ser un modelo de pose, puede heredar sesgos de los datasets de entrenamiento (no detallados), con posible peor rendimiento en determinados fenotipos, vestimenta, iluminacion o condiciones de camara.
- Riesgo de alucinacion de keypoints: no documentado; en modelos de pose es habitual que aparezcan puntos mal localizados en oclusiones, pero no hay evidencia publicada para este checkpoint.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso; deben respetarse los ficheros `LICENSE` y `NOTICE` del repositorio y la atribucion a The LoopDVR Authors.
- Modelo muy reciente (creado el 27 de noviembre de 2026) y sin descargas ni likes: no hay validacion comunitaria ni informes de fallos en produccion.
- No se documentan requisitos de hardware, latencia ni soporte de exportacion a formatos como ONNX o TensorRT, lo que puede limitar el despliegue en entornos no Python.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRx-pose
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Script de conversion de pesos: https://github.com/LibreYOLO/libreyolo (ruta `weights/convert_loopdvr_weights.py`)
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Paquete PyPI `libreyolo`: https://pypi.org/project/libreyolo/
- Repositorio LoopDVR upstream: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
