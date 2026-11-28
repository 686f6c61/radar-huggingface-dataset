# LibreYOLO/LibreLoopDVRs

## Resumen

LibreLoopDVRs es un checkpoint de deteccion de objetos del proyecto LibreYOLO, una biblioteca de vision por computador con licencia MIT que unifica bajo una sola API distintos modelos de deteccion (YOLO, RT-DETR, RF-DETR y otros). Este checkpoint concreto es una reempaquetado del modelo LoopDet en su variante de tamano S, desarrollado originalmente por Intellindust AI Lab y la Great Bay University dentro del proyecto LoopDVR, y publicado aqui con metadatos de LibreYOLO para que la factoria `LibreYOLO()` lo enrute correctamente sin heuristica por nombre de fichero.

El modelo resuelve deteccion de objetos en 80 clases COCO mediante una arquitectura que combina un backbone ViT con procesamiento en bucle (`LoopedViT`), un encoder hibrido y un decoder DETR tambien con bucles y refinamiento FDR. Emplea 300 queries de objeto, lo que lo situa en la familia de detectores end-to-end sin NMS, un enfoque alternativo a los YOLO clasicos basados en anchors y supresion de no maximos.

Es relevante ahora porque ejemplifica la tendencia de detectores transformer con computo recurrente (reutilizacion de bloques en bucle para aumentar profundidad efectiva sin incrementar parametros), y porque su integracion en LibreYOLO permite intercambiarlo con otros detectores bajo la misma interfaz Python. Los parametros aprendidos son identicos bit a bit al state dict original; el reempaquetado solo anade metadatos de checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoopedViT (backbone ViT con bucles) + encoder hibrido + decoder DETR con bucles y refinamiento FDR |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; clases COCO en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch empaquetado para LibreYOLO) |

## Arquitectura y entrenamiento

LoopDet sigue un diseno de detector end-to-end tipo DETR: un backbone `LoopedViT` extrae caracteristicas de la imagen aplicando bloques transformer de forma recurrente, un encoder hibrido fusiona informacion multiescala y un decoder DETR con bucles genera predicciones a partir de 300 queries de objeto, refinadas mediante el mecanismo FDR. El procesamiento en bucle permite aumentar la profundidad efectiva de la red reutilizando pesos, lo que reduce el numero de parametros respecto a un apilamiento equivalente de capas independientes.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset de entrenamiento (mas alla de las 80 clases COCO que predice), ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion, que por otra parte no aplican a un detector. El checkpoint se deriva del commit `f2aba1f122029e4db757b69cd37fc5a4909db34e` del repositorio LoopDVR y de los pesos oficiales de la release `v1.0` (fichero `loopdet-s.pth`); las modificaciones introducidas por LibreYOLO son exclusivamente de metadatos (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`), sin cambios en los parametros aprendidos.

## Capacidades

- Deteccion de objetos en imagenes para las 80 clases del dataset COCO.
- Prediccion end-to-end sin NMS, con 300 queries de objeto por imagen.
- Tarea declarada: `object-detection`; el checkpoint expone `supported_tasks` y `default_task` a traves de los metadatos de LibreYOLO.
- Integracion con la API unificada de LibreYOLO: `LibreYOLO("LibreLoopDVRs.pt")` devuelve un objeto invocable sobre imagenes con opciones como `save=True`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): unicamente vision por computador orientada a deteccion; no se documentan modos adicionales.

## Casos de uso

- Monitorizacion de video en tiempo casi real: el detector puede procesarse fotograma a fotograma sobre streams de camaras para localizar personas, vehiculos y objetos COCO, integrándose en pipelines de vigilancia o analitica de trafico.
- Conteo y analitica en retail: deteccion de personas y productos en imagenes de estanterias o pasillos para generar metricas de afluencia y ocupacion, aprovechando las 80 clases COCO.
- Preprocesado para pipelines multimodales: uso del detector como etapa de region proposal o recorte de objetos antes de pasarlos a un modelo de vision-lenguaje, reduciendo el area de imagen a analizar.
- Control de calidad industrial ligero: deteccion de objetos y personas en lineas de produccion o almacenes para alertas de seguridad (por ejemplo, presencia de personas en zonas restringidas), siempre que las clases de interes esten cubiertas por COCO.
- Anotacion asistida de datasets: generacion automatica de cajas delimitadoras sobre imagenes nuevas para acelerar el etiquetado humano, con revision posterior.
- Prototipado e investigacion en detectores transformer: al compartir API con YOLO y RT-DETR en LibreYOLO, permite comparar el detector LoopDet frente a alternativas con el mismo codigo de evaluacion.
- Aplicaciones embebidas o de borde: al ser la variante S (small) de la familia LoopDet, es la opcion adecuada cuando se prioriza latencia y huella de memoria sobre precision, aunque no se publican cifras concretas de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros totales ni consumo de memoria).
- GPU recomendadas: no disponible; al tratarse de la variante S, se espera que quepa en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` (`pip install libreyolo`) con el checkpoint `.pt`; no se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / queries | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreLoopDVRs (LoopDet S) | no disponible | 300 queries, 80 clases COCO | Apache 2.0 | Hugging Face (LibreYOLO/LibreLoopDVRs) |
| YOLO (familia, via LibreYOLO) | no disponible | basado en anchors/grid, NMS | depende del checkpoint | via libreria libreyolo |
| RT-DETR (via LibreYOLO) | no disponible | end-to-end DETR | depende del checkpoint | via libreria libreyolo |
| RF-DETR (via LibreYOLO) | no disponible | end-to-end DETR | depende del checkpoint | via libreria libreyolo |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no sera reconocido.
- No se publican cifras de precision (mAP) ni de latencia, por lo que no es posible evaluar su idoneidad en produccion sin una validacion propia.
- Riesgo de sesgos heredados del dataset COCO (posibles diferencias de rendimiento entre categorias y contextos geograficos o culturales).
- Riesgo de falsos positivos y negativos inherente a cualquier detector; no hay calibracion de confianza documentada mas alla del umbral por defecto de la libreria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos podrian no estar alojados en el repositorio de Hugging Face; conviene verificar antes de depender de este checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de los autores originales (Great Bay University / Intellindust AI Lab) segun los ficheros `LICENSE` y `NOTICE`.
- El modelo no es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- No se documentan procesos de cuantizacion ni formatos alternativos de pesos, lo que limita el despliegue fuera de PyTorch/libreyolo.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRs
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Web de LibreYOLO: https://www.libreyolo.com/
- Paquete PyPI: https://pypi.org/project/libreyolo/
- Repositorio LoopDVR (origen): https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
- Codigo de conversion de pesos: `weights/convert_loopdvr_weights.py` en el repositorio LibreYOLO
