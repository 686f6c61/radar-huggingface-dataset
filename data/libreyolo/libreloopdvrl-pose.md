# LibreYOLO/LibreLoopDVRl-pose

## Resumen

LibreLoopDVRl-pose es un checkpoint de estimación de pose 2D multi-persona empaquetado para el framework LibreYOLO. Se trata de la variante de tamano L (large) del modelo LoopPose, desarrollado por el grupo LoopDVR (Great Bay University / Intellindust AI Lab) y redistribuido por el proyecto LibreYOLO bajo licencia Apache 2.0. El modelo detecta 17 keypoints del esqueleto COCO sobre una unica clase (`person`) y emplea un esquema de 60 queries, lo que lo situa en la familia de detectores basados en consultas (estilo DETR) adaptados a pose estimation.

La relevancia de este checkpoint es fundamentalmente de integracion: no introduce pesos nuevos ni reentrena el modelo original, sino que anade metadatos de checkpoint de LibreYOLO v1.0 (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoria unificada `LibreYOLO()` enrute el modelo sin heurísticas basadas en nombre de fichero. Los parametros aprendidos son identicos bit a bit al state dict upstream (`looppose-l.pth`).

El repositorio tiene un tamano de 0.1 GB y, en el momento de la consulta, no registra descargas ni likes. No se dispone de informacion sobre arquitectura interna detallada, numero de parametros, contexto (no aplica, es vision) ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (detector basado en queries, estilo DETR, segun el esquema de 60 queries; detalles internos no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (vision; sin metadatos de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con metadatos LibreYOLO v1.0) |
| Tarea | Keypoint detection / pose estimation 2D multi-persona |
| Keypoints | 17 (COCO) |
| Clases | 1 (`person`) |
| Queries | 60 |
| Tamano del repositorio | 0.1 GB |
| Libreria | libreyolo |
| Version upstream | LoopDVR `v1.0` (fichero `looppose-l.pth`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por los metadatos se sabe que pertenece a la familia LoopPose de LoopDVR, que emplea un esquema de 60 queries para predecir instancias de persona y sus 17 keypoints COCO en una unica clase. El diseno basado en queries es caracteristico de los detectores tipo DETR, aunque no se confirma en la documentacion proporcionada.

Respecto al entrenamiento, no se dispone de datos sobre numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF/DPO no aplican a vision) ni innovaciones de decodificacion. Lo unico verificable es que este repositorio no modifica los pesos: el autor declara que el state dict coincide bit a bit con el release oficial `looppose-l.pth` de LoopDVR `v1.0` (commit `f2aba1f122029e4db757b69cd37fc5a4909db34e`). La unica intervencion es el envoltorio de metadatos para LibreYOLO v1.0, generado mediante `weights/convert_loopdvr_weights.py`.

## Capacidades

- Estimacion de pose 2D multi-persona: detecta multiples personas en una imagen y predice 17 keypoints COCO por instancia.
- Deteccion de la clase `person` (unica clase soportada).
- Salida compatible con el pipeline `keypoint-detection` de Hugging Face.
- Integracion con la API unificada de LibreYOLO: `LibreYOLO("LibreLoopDVRl-pose.pt")` con enrutado automatico por metadatos.
- Soporte de guardado de resultados visuales (`save=True` en la llamada de inferencia).
- No se documentan capacidades de tool calling, agentes, multilingue, thinking mode, vision general, audio ni generacion de texto: es un modelo puramente de vision orientado a pose.

## Casos de uso

- Analisis de video deportivo: el modelo permite extraer el esqueleto de varios jugadores por fotograma para calcular angulos articulares, velocidad de movimiento y patrones biomecanicos, aprovechando la deteccion multi-persona con 17 keypoints.
- Monitorizacion de ergonomia en puestos de trabajo: procesando imagenes de camaras fijas se pueden detectar posturas incorrectas de los trabajadores y generar alertas, al ser un modelo ligero (repo de 0.1 GB) apto para despliegue en edge.
- Control de aforo y analisis de comportamiento en retail: la deteccion de personas con keypoints permite estimar orientacion y gestos basicos para analitica de flujos de clientes.
- Rehabilitacion y fisioterapia asistida: comparar la pose estimada del paciente con una pose de referencia para evaluar la correccion de ejercicios en tiempo real.
- Animacion y motion capture de bajo coste: extraccion de keypoints 2D desde video monocular para rigging posterior o retargeting en pipelines de animacion.
- Seguridad industrial: deteccion de personas en zonas restringidas y verificacion de posturas de riesgo (caidas, posturas forzadas) en entornos con camaras CCTV.
- Investigacion en vision por computador: modelo de referencia para comparar pipelines de pose estimation dentro del ecosistema LibreYOLO, gracias a la API unificada que permite intercambiar checkpoints sin reescribir codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.1 GB, lo que sugiere un modelo relativamente compacto, pero no se confirma el numero de parametros ni el consumo real en inferencia.
- GPU recomendadas: no disponible. Por el tamano del artefacto es plausible que funcione en GPU consumer, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` (`pip install libreyolo`) con la factoria `LibreYOLO()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El formato de pesos es `.pt` de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (estimacion de pose 2D multi-persona con 17 keypoints COCO), por lo que no es posible establecer una comparacion rigurosa con cifras.

## Limitaciones y advertencias

- Sesgos: no documentados. Al ser un modelo de vision entrenado sobre datos no especificados, puede heredar sesgos de representacion (iluminacion, etnia, complexion, ropa) del dataset original de LoopDVR.
- Alucinacion: en vision, el riesgo equivalente es la deteccion de keypoints inexistentes u oclusiones mal resueltas; no se documenta el comportamiento en escenas con oclusiones severas.
- Contexto e idioma: el modelo no procesa texto, por lo que las limitaciones linguisticas no aplican. No se especifican limitaciones de resolucion de entrada mas alla del metadato `imgsz` del checkpoint.
- Licencia: Apache 2.0, permite uso comercial con atribucion y conservacion del aviso de licencia y NOTICE. El copyright corresponde a The LoopDVR Authors (Great Bay University / Intellindust AI Lab).
- Caveat de integracion: el checkpoint depende de la version de LibreYOLO (metadatos v1.0). Cambios en la factoria o en el esquema de metadatos podrian requerir reconversion.
- Madurez: el repositorio no registra descargas ni likes en el momento de la consulta y fue creado en 2026-11-27; conviene validar el modelo en el caso de uso concreto antes de llevarlo a produccion.
- Unica clase: solo detecta `person`; no sirve para otras categorias sin reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRl-pose
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Web oficial LibreYOLO: https://www.libreyolo.com/
- PyPI libreyolo: https://pypi.org/project/libreyolo/
- Upstream LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
