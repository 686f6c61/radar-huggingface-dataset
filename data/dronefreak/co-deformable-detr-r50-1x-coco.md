# dronefreak/co-deformable-detr-r50-1x-coco

## Resumen

Co-Deformable-DETR R50 1x COCO es un checkpoint de deteccion de objetos basado en la arquitectura Co-DETR (Cooperative Detection Transformer), presentada en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). El modelo combina un backbone ResNet-50 con el decodificador de Deformable DETR y un esquema de entrenamiento cooperativo que anade cabezas auxiliares de asignacion de etiquetas (ATSS, Faster R-CNN) para mejorar la supervision durante el entrenamiento. Este repositorio concreto es un espejo no oficial del checkpoint original, alojado por el usuario `dronefreak` para facilitar descargas reproducibles desde el Hub.

El modelo resuelve la tarea de deteccion de objetos en 80 categorias de COCO y reporta un box AP de 49,5 en COCO 2017 val con un schedule de 12 epocas (1x). Su relevancia practica radica en que ofrece un rendimiento cercano al estado del arte en deteccion con un backbone convolucional ligero, lo que lo hace desplegable en hardware modesto en comparacion con variantes ViT-L.

El checkpoint contiene 65.183.009 parametros totales en el fichero de pesos (48,8 M declarados como parametros de inferencia por el autor del espejo), ocupa 0,6 GB en el repositorio y se distribuye en formato safetensors y `.pth`. No es un modelo de `transformers`: requiere el codigo del proyecto Co-DETR y el stack OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (Deformable DETR con entrenamiento cooperativo), backbone ResNet-50 |
| Parametros totales | 65.183.009 (fichero safetensors); 48,8 M declarados como parametros de inferencia |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiquetas de clases COCO en ingles) |
| Licencia | unknown (licencia de pesos sin determinar) |
| Formato de pesos | safetensors, `.pth` (PyTorch), config `.py` de MMDetection |
| Libreria | mmdetection (2.x) |
| Tarea | object-detection |
| Dataset de entrenamiento | detection-datasets/coco |
| Schedule de entrenamiento | 12 epocas (1x) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

Co-DETR parte de Deformable DETR, un transformer de deteccion con atencion deformable y consultas de objeto aprendidas, y anade un esquema de "entrenamiento cooperativo": durante el entrenamiento se incorporan cabezas auxiliares basadas en asignadores de etiquetas clasicos (como ATSS y Faster R-CNN) que generan objetivos densos y de alta calidad para las consultas del decodificador. Estas cabezas solo se usan en entrenamiento y se descartan en inferencia, de modo que el modelo final mantiene la simplicidad de un DETR end-to-end sin NMS. El backbone es una ResNet-50, y el schedule corresponde a 12 epocas sobre COCO (1x).

El checkpoint fue entrenado sobre el dataset COCO de deteccion (80 categorias). No se dispone en la informacion proporcionada de detalles sobre numero exacto de tokens de entrenamiento (no aplica), composicion del dataset mas alla de COCO, ni sobre el uso de RLHF/DPO (no aplica a un modelo de vision). La innovacion tecnica destacable es precisamente el entrenamiento cooperativo con cabezas auxiliares, que mejora la convergencia y el AP final de los DETR sin coste adicional en inferencia.

## Capacidades

- Deteccion de objetos en 80 categorias de COCO (persona, vehiculo, animales, objetos cotidianos, etc.).
- Prediccion end-to-end sin necesidad de supresion de no maximos (NMS) en inferencia.
- Salida de cajas delimitadoras con etiqueta de clase y puntuacion de confianza.
- Exportacion de resultados en JSON (`--save-json`) para evaluacion o postproceso.
- Inferencia sobre imagen individual, carpeta de imagenes, video y webcam segun el script `tools/inference.py`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta vision-lenguaje, audio ni generacion de texto.
- Capacidad multilingue limitada a las etiquetas de clase en ingles.

## Casos de uso

- Deteccion en video de trafico o dashcam: el modelo procesa fotogramas de video con `tools/inference.py` y produce cajas por fotograma, adecuado para analisis de escenas viales gracias a su backbone R50 ligero y su inferencia sin NMS.
- Anotacion asistida de datasets: generar preanotaciones sobre imagenes nuevas y exportarlas en JSON para revision humana, reduciendo el coste de etiquetado en proyectos de vision.
- Monitorizacion de aforo o presencia: detectar personas en imagenes de camaras fijas para conteo y alertas, con un coste computacional moderado.
- Control de calidad en linea de produccion: detectar objetos o defectos visibles en imagenes industriales dentro de un pipeline con MMDetection.
- Analisis de imagenes de satelite o dron: el autor del espejo se llama `dronefreak` y el modelo se ha probado en clips de dashcam; puede aplicarse a deteccion aerea de vehiculos o infraestructuras con el fine-tuning adecuado.
- Prototipado e investigacion en deteccion: servir como baseline reproducible para comparar variantes de DETR o para experimentar con el esquema de entrenamiento cooperativo.
- Integracion en sistemas de vision embebidos: al tener 48,8 M parametros de inferencia y un backbone R50, es viable en GPUs de gama media para tareas de deteccion en tiempo casi real.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (model-index de la model card, no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| COCO 2017 val (val2017) | box AP | 49,5 |

No se han publicado en la informacion disponible otros resultados de benchmarks (mAP por clase, AP50, AP75, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 48,8 M parametros de inferencia y backbone R50, la huella es moderada y cabe en GPUs consumer de gama media (por ejemplo, RTX 3060/4060 en adelante), aunque no se documenta una cifra exacta.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una RTX 3090/4090 o A100/H100 son holgadas, y una GPU consumer de 8-12 GB deberia bastar para inferencia en imagenes individuales.
- Cabe en GPU consumer: si, segun el tamano del modelo, aunque no se confirma con mediciones publicadas.
- Opciones de despliegue: MMDetection 2.25.3 con MMCV-full 1.5.0 y PyTorch 1.11; script `tools/inference.py` del fork `dronefreak/Co-DETR`; no es compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | COCO box AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-Deformable-DETR R50 1x (este) | 65,2 M totales / 48,8 M inferencia | no aplica | 49,5 (reportado) | unknown | Hugging Face (espejo) |
| Deformable DETR R50 | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible | MMDetection |
| DETR R50 | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible | MMDetection / transformers |
| Co-DETR ViT-L | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible | Hugging Face (oficial) |

No se dispone en la informacion proporcionada de cifras de AP para las alternativas, por lo que la comparacion cuantitativa queda limitada al dato reportado de este checkpoint.

## Limitaciones y advertencias

- Licencia de pesos sin determinar (`unknown`): no se puede garantizar el uso comercial sin consultar a los autores originales.
- Es un espejo no oficial: el autor del repositorio no reclama contribucion al metodo ni al entrenamiento; los creditos son de SenseTime X-Lab.
- Requiere el stack OpenMMLab 1.x y el codigo del proyecto Co-DETR; no funciona con `transformers` ni con pipelines estandar de PyTorch.
- El modelo solo detecta las 80 clases de COCO; cualquier dominio especifico requiere fine-tuning.
- Riesgo de falsos positivos y negativos inherente a la deteccion; no se documentan umbrales de confianza recomendados.
- No hay datos publicados sobre sesgos por clase, rendimiento en imagenes de baja iluminacion o dominios fuera de COCO.
- El benchmark de 49,5 box AP esta marcado como no verificado (`verified: false`) en el model-index.
- El modelo no genera texto ni razona: no debe usarse para tareas de lenguaje, agentes o tool calling.
- El repositorio tiene muy pocas descargas (14) y ningun "like", lo que sugiere poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/co-deformable-detr-r50-1x-coco
- Paper Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper DETR (referencia): https://arxiv.org/abs/1405.0312
- Repositorio oficial Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido por el autor del espejo: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Dataset COCO: https://huggingface.co/datasets/detection-datasets/coco
