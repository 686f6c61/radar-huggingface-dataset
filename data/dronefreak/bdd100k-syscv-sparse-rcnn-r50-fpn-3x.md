# dronefreak/bdd100k-syscv-sparse-rcnn-r50-fpn-3x

## Resumen

Sparse R-CNN R50-FPN 3x sobre BDD100K es un detector de objetos para escenas de conduccion, publicado como espejo del zoo de modelos de SysCV (ETH Zurich) por el usuario `dronefreak`. El modelo original de SysCV ya no era descargable porque el host `dl.cv.ethz.ch` esta fuera de linea; este repositorio recupera los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) y anade un entorno fijado y un script de inferencia. Se trata, por tanto, de una reproduccion verificada de un checkpoint de investigacion, no de un modelo nuevo.

Tecnicamente es un Sparse R-CNN con backbone ResNet-50 y cuello FPN, entrenado con el schedule 3x (36 epocas) sobre las 70 000 imagenes de entrenamiento de BDD100K a resolucion nativa de 1280 x 720. El modelo tiene 106 236 068 parametros y detecta diez clases de escenas de trafico: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.

Su relevancia es doble: por un lado, preserva un baseline de referencia del benchmark BDD100K que estaba practicamente perdido; por otro, sirve como punto de partida reproducible para investigacion en deteccion en conduccion autonoma, con pesos en safetensors, configuracion de mmdetection y resultados declarados por SysCV (31,31 AP en validacion). No es un modelo de lenguaje: es un detector puro de vision por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse R-CNN con backbone ResNet-50 y FPN (mmdetection 2.x) |
| Parametros totales | 106 236 068 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (deteccion visual; clases en ingles: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign) |
| Licencia | BDD100K (`license: other`), uso educativo, de investigacion y sin animo de lucro; la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, mismos tensores que el `.pth` original); incluye `config.json` y `original/` con artefactos de SysCV |

## Arquitectura y entrenamiento

Sparse R-CNN es un detector end-to-end que sustituye las propuestas densas de anchor por un conjunto fijo de propuestas aprendidas (cajas y features), refinadas en cascada por cabeceras dinamicas. En esta implementacion el backbone es ResNet-50 inicializado con pesos ImageNet (`torchvision://resnet50`), seguido de FPN; la entrada es la resolucion nativa de BDD100K (1280 x 720) sin redimensionado, en RGB con media y desviacion tipica de ImageNet.

El entrenamiento usa las 70 000 imagenes de train de BDD100K durante 36 epocas (schedule 3x), con AdamW (lr 2.5e-05, weight decay 0.0001), decaimiento en las epocas 27 y 33, batch de 32 (8 GPU x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En test se emiten como maximo 100 cajas por imagen. El autor del espejo verifica que el MD5 de los pesos (`f1f4b2a2cac1ba1715680c907091853a`) coincide con el de SysCV y que todas las claves cargan en su configuracion; ademas, sobre 20 imagenes aleatorias de validacion, 1789 de las 2000 cajas de las predicciones publicadas por SysCV son identicas (1999 con IoU >= 0,5), con una diferencia maxima de score de 0,0002.

## Capacidades

- Deteccion de objetos en imagenes individuales de escenas de conduccion (10 clases de BDD100K).
- Deteccion sobre video: el script `infer.py` procesa ficheros de video y permite limitar el numero de fotogramas con `--max-frames`.
- Inferencia en directo desde webcam (`python infer.py 0 --show`).
- Exportacion de detecciones en formato BDD100K mediante `--json out.json`.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) para ajustar precision/recall.
- Ejecucion en CPU y en GPU CUDA 11.8 (entornos separados en `env/`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Baseline de investigacion en BDD100K: reproducir el resultado de referencia de Sparse R-CNN R50-FPN 3x (31,31 AP en val) para comparar nuevas arquitecturas o estrategias de aumento de datos sobre el mismo protocolo.
- Prototipado de sistemas ADAS: deteccion de peatones, vehiculos y senales de trafico en fotogramas de camara frontal a 1280 x 720, con umbral de score ajustable para priorizar recall en escenarios criticos.
- Analisis offline de video de flota: procesar grabaciones con `infer.py drive.mov` y exportar detecciones en JSON para auditar eventos (por ejemplo, presencia de ciclistas o semaforos) sin necesidad de infraestructura en tiempo real.
- Etiquetado asistido (pre-anotacion): generar cajas candidatas sobre nuevos fotogramas de conduccion y revisarlas manualmente, reduciendo el coste de anotacion de datasets propios.
- Docencia y formacion en vision por computador: el repositorio incluye un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10) que permite montar el pipeline completo en un portatil con CPU en minutos.
- Validacion de pipelines de despliegue: servir como modelo de referencia para medir latencia y throughput (0,04 s/imagen en RTX 4070 SUPER, 1,1 s/imagen en 8 hilos de CPU) antes de migrar a modelos mas grandes.
- Pruebas de robustez diurna/nocturna: el autor incluye una demo con clips de dia y de noche, util para evaluar el comportamiento del detector en condiciones de iluminacion adversas.

## Benchmarks y rendimiento

Resultados declarados por SysCV (AP estilo COCO, en %, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,3 | 57,2 | 29,2 | 15,7 | 35,0 | 51,5 |
| test | 31,2 | 55,6 | 30,2 | 16,5 | 35,9 | 47,2 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 33,9 |
| rider | 23,9 |
| car | 50,4 |
| truck | 45,0 |
| bus | 47,4 |
| train | 0,0 |
| motorcycle | 21,7 |
| bicycle | 22,5 |
| traffic light | 27,8 |
| traffic sign | 40,5 |

El valor de la model-index (mAP 31,31 en validacion) coincide con el AP global reportado. No se han publicado en la informacion disponible comparaciones directas con otros detectores sobre el mismo split.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con backbone ResNet-50 y entrada 1280 x 720, cabe holgadamente en GPUs consumer de 8-12 GB (el autor reporta ejecucion en una RTX 4070 SUPER de 12 GB).
- GPU recomendadas: RTX 4070 SUPER o superior para inferencia comoda; A100/H100 no son necesarias para este tamano de modelo.
- Cabe en GPU consumer: si, incluidas RTX 3060/4060 (12/8 GB) y similares; tambien funciona en CPU (1,1 s/imagen con 8 hilos).
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 (entornos `env/requirements-cu118.txt` y `env/requirements-cpu.txt`); el script `infer.py` cubre imagen, carpeta, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia: 0,04 s/imagen en RTX 4070 SUPER; 1,1 s/imagen en CPU con 8 hilos. Throughput no documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AP en BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sparse R-CNN R50-FPN 3x (este) | 106,2 M | 1280 x 720 | 31,31 | BDD100K (investigacion) | Hugging Face (espejo) |
| Faster R-CNN R50-FPN 3x (SysCV) | no disponible en la informacion | 1280 x 720 | no disponible en la informacion | BDD100K | zoo SysCV (host original caido) |
| Otros detectores del zoo SysCV | no disponible en la informacion | no disponible | no disponible en la informacion | BDD100K | no disponible |

No se dispone en la informacion proporcionada de resultados numericos de modelos alternativos sobre el mismo split, por lo que la comparativa cuantitativa queda limitada al propio modelo.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, que solo permite uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar `LICENSE.txt` y, probablemente, licencia adicional.
- Clase `train` con AP 0,0 en validacion: el detector no reconoce trenes de forma util, lo que limita su uso en escenas ferroviarias.
- Rendimiento modesto en clases pequenas o poco frecuentes: APs de 15,7 y AP de 21,7-23,9 en motorcycle, bicycle y rider, lo que implica falsos negativos frecuentes en objetos pequenos o parcialmente ocluidos.
- Reproduccion no exacta: 1789 de 2000 cajas coinciden de forma identica con las predicciones publicadas de SysCV; la causa de la discrepancia es desconocida y persiste en GPU y CPU.
- Entorno obsoleto: depende de mmdetection 2.x y mmcv-full 1.7.2, que ya no reciben mantenimiento; requiere un entorno virtual aislado con Python 3.10.
- Riesgo de alucinacion en sentido amplio: como cualquier detector, puede generar cajas espurias en escenas fuera de distribucion (clima extremo, camaras no frontales, imagenes nocturnas muy ruidosas); el umbral de score por defecto (0,3) debe calibrarse por caso de uso.
- Sesgos del dataset: BDD100K esta sesgado hacia escenas de conduccion en entornos urbanos y condiciones de camara frontal; el rendimiento puede degradarse en otros dominios (drones, vigilancia, imagenes aereas).
- Sin capacidades de lenguaje ni de razonamiento: no es apto para tareas de VQA, captioning ni agentes; su salida son cajas y etiquetas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente mas alla de la verificacion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-sparse-rcnn-r50-fpn-3x
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-sparse-rcnn-r50-fpn-3x/blob/main/LICENSE.txt
- Paper de Sparse R-CNN (CVPR 2021): https://arxiv.org/abs/2011.12450
- Zoo de modelos BDD100K de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV para este modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/sparse_rcnn_r50_fpn_3x_det_bdd100k.py
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
