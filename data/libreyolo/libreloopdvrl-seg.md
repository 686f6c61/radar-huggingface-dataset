# LibreYOLO/LibreLoopDVRl-seg

## Resumen

LibreLoopDVRl-seg es un modelo de segmentación de instancias de la familia LoopDVR, en su variante LoopSeg de tamano L, redistribuido por el proyecto LibreYOLO como un checkpoint compatible con su API unificada. El modelo original procede de Intellindust AI Lab (Great Bay University) y fue publicado con pesos oficiales en la release `v1.0` del repositorio LoopDVR. LibreYOLO se limita a envolver el state dict original con metadatos de su framework, sin modificar ningun parametro aprendido.

El modelo resuelve segmentacion de instancias sobre las 80 clases de COCO, generando mascaras por instancia mediante 300 queries y prototipos de mascara de 160x160 que se reescalan a la resolucion de entrada. Su interes practico radica en que permite usar un segmentador de instancias de tipo query-based (estilo DETR) desde la misma interfaz `LibreYOLO()` que el resto de modelos del ecosistema, sin heurísticas basadas en el nombre del fichero.

La informacion disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada: la model card solo describe el empaquetado y las dimensiones de salida. No se publican parametros totales, contexto (no aplica, es vision), benchmarks ni detalles del dataset de entrenamiento mas alla de las 80 clases COCO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoopDVR LoopSeg (segmentacion de instancias query-based, familia DETR-like); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada configurable via `imgsz`, valor por defecto no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en `.pt`); no se documentan variantes GGUF, ONNX ni INT8 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint LibreYOLO v1.0); repo de 0.1 GB |

## Arquitectura y entrenamiento

LoopDVR LoopSeg es un segmentador de instancias de tipo query-based: emite 300 queries que predicen clases y mascaras, y utiliza 160x160 prototipos de mascara que se sobremuestrean a la resolucion de la imagen de entrada. El modelo cubre las 80 clases de COCO. No se dispone de informacion publica en la documentacion proporcionada sobre el backbone, el numero de capas, la composicion del dataset de entrenamiento, el numero de tokens/imagenes vistas ni si se aplico RLHF u otra fase de alineamiento (no aplica en vision, pero tampoco se documenta el regimen de augmentacion o destilacion).

La unica innovacion documentada en esta ficha es el empaquetado: LibreYOLO anade metadatos (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) al checkpoint para que la factoria `LibreYOLO()` enrute el modelo sin heurísticas por nombre de fichero. Los pesos son identicos bit a bit al state dict original de `loopseg-l.pth` publicado en la release `v1.0` de `Siruuui/LoopDVR`, derivado del commit `f2aba1f122029e4db757b69cd37fc5a4909db34e` de `Intellindust-AI-Lab/LoopDVR`.

## Capacidades

- Segmentacion de instancias sobre 80 clases COCO, con mascaras por objeto.
- Salida con 300 queries y prototipos de mascara de 160x160 reescalados a la resolucion de entrada.
- Integracion con la API unificada de LibreYOLO: `LibreYOLO("LibreLoopDVRl-seg.pt")` y llamada directa `model("image.jpg", save=True)`.
- Tarea declarada como `image-segmentation` / `instance-segmentation` en el pipeline de Hugging Face.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la imagen.
- No se documentan capacidades multilingues (no aplica).

## Casos de uso

- Anotacion automatica de datasets: usar el modelo para pre-etiquetar mascaras de instancia en imagenes y revisar manualmente solo los casos dudosos, reduciendo el coste de etiquetado en proyectos de vision con clases COCO.
- Segmentacion en pipelines de analitica de imagen: conteo y localizacion de objetos (personas, vehiculos, animales) en lotes de imagenes, aprovechando la salida de 300 queries para escenas con muchos objetos.
- Preprocesado para modelos downstream: generar mascaras de instancia que alimenten recortes por objeto antes de pasarlos a clasificadores o modelos de OCR.
- Prototipado rapido en investigacion: comparar un segmentador query-based con detectores YOLO dentro de la misma API de LibreYOLO, sin cambiar de framework.
- Integracion en aplicaciones de edicion o retoque: separar instancias para aplicar efectos, desenfoque de fondo o sustitucion de objetos.
- Evaluacion de robustez: al estar empaquetado con metadatos estandar, se puede insertar en suites de benchmark internas que ya consumen checkpoints LibreYOLO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 0.1 GB, lo que sugiere un checkpoint relativamente ligero, pero no se confirma el numero de parametros ni el pico de memoria en ejecucion.
- GPU recomendadas: no disponible. Al no documentarse el coste computacional, no se puede afirmar que quepa en GPUs de consumo como RTX 4090 o RTX 3060; conviene medirlo en el hardware objetivo.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` (`pip install libreyolo`) con el checkpoint `.pt`. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (estas dos ultimas no aplican a vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Licencia | Contexto / resolucion | Disponibilidad |
|---|---|---|---|---|---|
| LibreLoopDVRl-seg | Segmentacion de instancias query-based (LoopSeg L) | 80 COCO | Apache 2.0 | no disponible | Hugging Face + LibreYOLO |
| Mask R-CNN (referencia clasica) | Segmentacion de instancias two-stage | 80 COCO | depende de implementacion (habitualmente Apache/MIT en Detectron2) | no disponible en esta ficha | Amplia |
| YOLO-seg (variantes de la familia YOLO) | Segmentacion de instancias en un solo stage | 80 COCO | depende de la variante | no disponible en esta ficha | Amplia |

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparativa se limita a categoria, licencia y disponibilidad; no se puede establecer una comparacion cuantitativa fiable con Mask R-CNN ni con YOLO-seg.

## Limitaciones y advertencias

- Solo cubre las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no se segmentara correctamente.
- No hay informacion publica sobre sesgos del dataset de entrenamiento ni sobre el rendimiento en dominios distintos de COCO (imagen medica, satelital, industrial).
- Riesgo de alucinacion en el sentido de mascaras espurias o queries asignadas a objetos inexistentes: no cuantificado en la documentacion.
- No se documentan limitaciones de resolucion de entrada ni el comportamiento con imagenes de muy alta resolucion.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de copyright debe conservarse segun los terminos de la licencia; el repo incluye ficheros `LICENSE` y `NOTICE`.
- El modelo se distribuye sin garantias y con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- No se documentan requisitos de version de PyTorch ni de `libreyolo` mas alla de la instalacion por pip.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRl-seg
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Web de LibreYOLO: https://www.libreyolo.com/
- Paquete PyPI: https://pypi.org/project/libreyolo/
- Repositorio original LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos oficiales: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
