# LibreYOLO/LibreLoopDVRl

## Resumen

LibreLoopDVRl es un checkpoint de detección de objetos de la familia LoopDVR, en su variante de tamano L (LoopDet), reempaquetado por el proyecto LibreYOLO para su uso dentro de su framework unificado de visión por computador. El modelo original procede de Intellindust AI Lab y Great Bay University, y este repositorio es un envoltorio de metadatos: los pesos aprendidos son idénticos bit a bit al state dict original (`loopdet-l.pth`) publicado en la release v1.0 del proyecto LoopDVR.

La arquitectura combina un backbone ViT con bucles iterativos (`LoopedViT`), un encoder híbrido y un decoder DETR también con bucles, con un mecanismo de refinamiento FDR. Detecta las 80 clases de COCO y utiliza 300 queries en el decoder. El interés de este checkpoint es la integración en LibreYOLO: permite cargarlo con la misma API `LibreYOLO()` que el resto de detectores soportados, sin heurísticas basadas en el nombre del fichero.

El repositorio tiene un tamano de 0,1 GB, no registra descargas ni likes en el momento de la consulta y está publicado bajo licencia Apache 2.0. La model card no incluye datos de entrenamiento, benchmarks ni requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT con bucles (`LoopedViT`) + encoder híbrido + decoder DETR con bucles y refinamiento FDR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (detección de objetos, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`; el README no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), checkpoint LibreYOLO v1.0 |
| Clases | 80 (COCO) |
| Queries del decoder | 300 |
| Tamano del repositorio | 0,1 GB |
| Biblioteca | libreyolo |

## Arquitectura y entrenamiento

El modelo sigue el diseno LoopDVR: un backbone de tipo Vision Transformer que aplica sus bloques de forma iterada (looped), lo que permite reutilizar parametros a lo largo de varios ciclos de cómputo. Sobre él se situa un encoder híbrido y un decoder de estilo DETR que también opera en bucle y aplica refinamiento FDR sobre las 300 queries de salida. La tarea es detección de objetos con 80 clases COCO.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en detección) ni innovaciones adicionales más allá de la estructura de bucles. El reempaquetado de LibreYOLO no modifica los pesos: solo anade metadatos (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoría `LibreYOLO()` enrute el modelo correctamente. El script de conversión está en `weights/convert_loopdvr_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Detección de objetos en imágenes con 80 clases COCO (cajas delimitadoras y etiquetas de clase).
- Backbone con bucles que reutiliza parámetros en varias iteraciones, orientado a eficiencia de parametros frente a profundidad apilada.
- Decoder DETR con 300 queries y refinamiento FDR, lo que evita NMS posterior en el pipeline de detección.
- Integración con la API unificada de LibreYOLO: carga mediante `LibreYOLO("LibreLoopDVRl.pt")` y llamada directa `model("image.jpg", save=True)`.
- Soporte de tareas declarado en los metadatos del checkpoint (`task`, `supported_tasks`, `default_task`), aunque la model card solo detalla detección.
- No se documentan capacidades de segmentación, visión-lenguaje, tool calling ni agentes.

## Casos de uso

- Detección de objetos en pipelines de visión industrial: el modelo procesa imágenes con 80 clases COCO y puede integrarse en cadenas de inspección donde se requiera localizar y clasificar objetos en tiempo de ejecución mediante la API de LibreYOLO.
- Prototipado rápido de aplicaciones de detección: al cargarse con una sola línea (`LibreYOLO("LibreLoopDVRl.pt")`) y guardar resultados con `save=True`, es adecuado para validar ideas antes de invertir en entrenamiento propio.
- Benchmarking de arquitecturas con bucles: investigadores que comparen backbones looped frente a transformers apilados pueden usar este checkpoint como referencia de la variante L de LoopDVR.
- Moderación de contenido visual: la detección de las 80 clases COCO permite filtrar o etiquetar imágenes en flujos de subida de contenido.
- Automatización de anotación: generar cajas preliminares sobre datasets propios para revisión humana, aprovechando el decoder DETR sin NMS.
- Docencia y experimentación con LibreYOLO: sirve como ejemplo de modelo no-YOLO integrado en la misma factoría que YOLO, RF-DETR o RT-DETR, útil para ensenar la API unificada de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (la model card no indica número de parámetros ni resolución de entrada).
- GPU recomendadas: no disponibles; al ser un detector ViT de tamano L con decoder DETR, se espera que requiera GPU dedicada, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la única vía documentada es la librería `libreyolo` (PyPI, versión 1.8.0 en el momento de la consulta); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreLoopDVRl | no disponible | no aplica | Detección COCO (80 clases) | Apache 2.0 | Hugging Face (LibreYOLO/LibreLoopDVRl) |
| LoopDVR LoopDet L (original) | no disponible | no aplica | Detección COCO | Apache 2.0 | Release v1.0 en GitHub (Siruuui/LoopDVR) |
| YOLO (variantes de LibreYOLO) | no disponible en la información | no aplica | Detección | MIT (librería) | PyPI / GitHub LibreYOLO |
| RF-DETR / RT-DETR (soportados por LibreYOLO) | no disponible en la información | no aplica | Detección | según modelo | vía API LibreYOLO |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier clase fuera de ese conjunto no será reconocida.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre su comportamiento en dominios distintos de COCO (imágenes médicas, satelitales, nocturnas, etc.).
- Riesgo de alucinación entendido como falsos positivos: como todo detector, puede generar cajas sobre regiones sin objeto, especialmente en escenas con oclusiones o clases poco representadas.
- No se documentan límites de resolución de entrada ni de número de objetos detectables por imagen.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe conservar los avisos de copyright y la NOTICE del repositorio.
- Los pesos son idénticos al original; cualquier problema de precisión del modelo upstream se hereda sin cambios.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.
- La librería `libreyolo` es un proyecto independiente mantenido en tiempo libre según su propio README; conviene fijar versión en producción.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRl
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Script de conversión: https://github.com/LibreYOLO/libreyolo (ruta `weights/convert_loopdvr_weights.py`)
- Web oficial LibreYOLO: https://www.libreyolo.com/
- PyPI: https://pypi.org/project/libreyolo/
- Repositorio LoopDVR original: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
