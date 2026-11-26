# dronefreak/bdd100k-mmdet-cascade-rcnn-r50-fpn-1x

## Resumen

Cascade R-CNN R50-FPN 1x sobre BDD100K es un detector de objetos para escenas de conduccion, publicado originalmente por el equipo de BDD100K en 2020 y replicado en Hugging Face por el usuario dronefreak con un entorno fijado y un script de inferencia. El modelo resuelve la deteccion de objetos en imagenes y video de trafico urbano (vehiculos, peatones, senales de trafico y semaforos) sobre el dataset BDD100K, uno de los referentes en conduccion autonoma. Es relevante porque el checkpoint original se distribuyo sin documentacion en el servidor de descargas de Berkeley y esta copia anade la documentacion, las dependencias exactas y las comprobaciones de integridad necesarias para ejecutarlo hoy.

La arquitectura es un detector de dos etapas Cascade R-CNN con backbone ResNet-50 y cuello FPN, con 69,2 millones de parametros y pesos en formato safetensors. No es un modelo de lenguaje: es un modelo puramente de vision por computador, entrenado sobre las 70.000 imagenes de entrenamiento de BDD100K durante 12 epocas (configuracion 1x de mmdetection). Reporta un mAP@50:95 de 31,0 en el split de validacion.

Su interes practico es acotado pero claro: sirve como linea base reproducible para experimentos de deteccion en conduccion, para comparar con detectores modernos y para prototipos de analisis de escenas viales. La licencia BDD100K condiciona su uso comercial, por lo que conviene revisarla antes de integrarlo en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN (3 etapas), ResNet-50 + FPN |
| Parametros totales | 69.232.636 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa texto) |
| Licencia | BDD100K (license: other, license_name: bdd100k) |
| Formato de pesos | safetensors (checkpoint mmdetection, cargado con torch.load weights_only=True) |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena tres cabezas de clasificacion y regresion con umbrales de IoU crecientes, de modo que cada etapa refina las propuestas de la anterior. El backbone es un ResNet-50 inicializado con pesos ImageNet de torchvision, y el cuello es un FPN que combina caracteristicas multiescala. Se entrenó con mmdetection 2.4.0, mmcv 1.1.3, PyTorch 1.6.0 y CUDA 10.2 sobre GPUs TITAN Xp, con el dataset de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (configuracion 1x), SGD con learning rate 0,02, decaimiento en las epocas 8 y 11 y tamano de batch 8 (4 por GPU).

La innovacion principal de esta copia no esta en el modelo sino en la reproducibilidad: el autor fija un entorno moderno (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) que sigue ejecutando el checkpoint de 2020, incluye un script de inferencia que soporta imagenes, carpetas, video y webcam, y documenta la verificacion de integridad del fichero (SHA-256) y la comparacion contra las predicciones originales publicadas. En 20 imagenes de test, la copia produce 683 cajas frente a las 683 del autor, todas emparejadas con IoU minimo 0,9981 e IoU mediana 1,0000, con una diferencia maxima de score de 0,0003; la causa de esa diferencia no se investigo.

## Capacidades

- Deteccion de objetos en imagenes individuales, carpetas de imagenes, ficheros de video y webcam.
- Deteccion de las clases de BDD100K en escenas de conduccion (vehiculos, peatones, senales de trafico, semaforos, entre otras).
- Salida de cajas en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames en video (`--max-frames`).
- Ejecucion en CPU y en GPU CUDA 11.8 (el entorno CUDA esta preparado pero no verificado a fecha de la model card).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Linea base reproducible para investigacion en deteccion vial: permite comparar nuevos detectores contra un resultado conocido (mAP@50:95 de 31,0 en validacion) sin tener que reconstruir el entorno de 2020.
- Analisis de escenas de trafico en video: el script `infer.py` procesa ficheros de video completos y exporta detecciones en JSON, util para contar vehiculos o peatones por frame en estudios de movilidad.
- Prototipado de sistemas ADAS: sirve para validar pipelines de percepcion (preprocesado, postprocesado, umbrales) antes de sustituir el detector por uno mas moderno.
- Auditoria de datasets de conduccion: detectar y visualizar anotaciones o imagenes problematicas comparando las predicciones del modelo con las etiquetas de BDD100K.
- Demostraciones y docencia: el soporte de webcam y la instalacion con `uv` o `pip` facilitan montar una demo en vivo de deteccion de objetos en el aula o en un taller.
- Verificacion de integridad de checkpoints heredados: la metodologia de esta copia (hash SHA-256, comparacion contra predicciones originales) es reutilizable para otros pesos antiguos sin documentacion.
- Generacion de datos pseudo-etiquetados: las detecciones con score alto pueden usarse como preetiquetas para entrenar o filtrar datasets propios de escenas viales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el split de validacion de BDD100K (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 31,0 |
| mAP@50 (val) | 54,9 |
| mAP@75 (val) | 29,7 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 69,2 M de parametros en precision completa el peso ocupa aproximadamente 277 MB, por lo que la VRAM necesaria es modesta y depende sobre todo de la resolucion de entrada y del tamano de batch.
- GPU recomendadas: el modelo se entreno en TITAN Xp; cualquier GPU moderna con al menos unos pocos GB de VRAM deberia bastar. El entorno CUDA 11.8 esta preparado pero no verificado segun la model card.
- Cabe en GPU consumer: si, por el reducido numero de parametros; no se especifica el modelo minimo probado.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 (unica via documentada); el script `infer.py` incluido soporta CPU y CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector mmdetection).
- Latencia y throughput: no disponibles; solo se ha verificado la ejecucion en CPU, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cascade R-CNN R50-FPN 1x (este) | 69,2 M | no aplica | 31,0 | BDD100K | Hugging Face (mirror) |
| Otros detectores de la familia BDD100K 2020 | no disponible | no aplica | no disponible | BDD100K | servidor de Berkeley |
| Detectores modernos tipo YOLO/DETR | no disponible | no aplica | no disponible | variable | multiples |

No se dispone en la informacion proporcionada de resultados de modelos comparables sobre el mismo split, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Licencia BDD100K: restringe el uso comercial; es imprescindible revisar el fichero LICENSE.txt del repositorio antes de cualquier despliegue en producto.
- Modelo de 2020: el stack original (PyTorch 1.6, CUDA 10.2, mmdetection 2.4.0) ya no funciona en GPUs actuales; hay que usar el entorno fijado por el autor y la rama 2.x de mmdetection.
- Solo se ha verificado el entorno de CPU; la ruta CUDA 11.8 no se ha probado segun la model card.
- La reproduccion no es exacta: hay diferencias minimas de score (hasta 0,0003) frente a las predicciones originales, de causa desconocida y no investigada.
- La ruta de webcam comparte el bucle de captura con los videos pero no se probo con una camara real.
- Riesgo de sesgos y alucinaciones propio de un detector: falsos positivos y negativos en condiciones de baja iluminacion, oclusion o clases poco representadas; el mAP@50:95 de 31,0 indica margen de error considerable en localizacion precisa.
- Sin soporte de texto, tool calling ni agentes; no debe plantearse como sustituto de un modelo multimodal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-r50-fpn-1x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-r50-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de Cascade R-CNN: no disponible en la informacion proporcionada
- Paper de BDD100K: no disponible en la informacion proporcionada
- Repositorio mmdetection: no disponible en la informacion proporcionada
- Servidor de descargas original de BDD100K (bdd100k/models/deprecated/detection/): no disponible como URL en la informacion proporcionada
