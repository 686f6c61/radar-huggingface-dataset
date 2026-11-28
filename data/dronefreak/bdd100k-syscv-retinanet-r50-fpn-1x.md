# dronefreak/bdd100k-syscv-retinanet-r50-fpn-1x

## Resumen

RetinaNet R50-FPN 1x sobre BDD100K es un detector de objetos denso de una etapa, pensado especificamente para escenas de conduccion. El checkpoint es un espejo del modelo publicado originalmente por el equipo SysCV de la ETH Zurich en su zoo de modelos para BDD100K; ante la caida del host `dl.cv.ethz.ch`, el autor de este repositorio recupero los pesos desde la Wayback Machine y anadio un entorno fijado y un script de inferencia. La arquitectura es la RetinaNet original de Lin et al. (ICCV 2017), con backbone ResNet-50 inicializado con pesos ImageNet y un cuello FPN, sumando 36.569.662 parametros.

El modelo resuelve la deteccion de las diez clases de trafico de BDD100K (peatón, ciclista, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico) sobre imagenes de 1280x720, el tamano nativo del dataset. Se entreno durante 12 epocas (el regimen "1x" de mmdetection) sobre las 70.000 imagenes de entrenamiento de BDD100K, con SGD a learning rate 0.02, weight decay 0.0001 y batch de 32 (8 GPU x 4 imagenes). Es relevante ahora porque el host original esta caido y este espejo verificado (MD5 coincidente) es una de las pocas formas practicas de reproducir los resultados publicados de SysCV.

La relevancia practica es la de un baseline solido y bien documentado para deteccion en escenas de conduccion: no compite con detectores modernos en precision, pero ofrece un punto de partida reproducible con mmdetection 2.x, pesos en safetensors y un script de inferencia que acepta imagenes, video y webcam. La licencia, heredada de BDD100K, restringe el uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (detector denso de una etapa) con backbone ResNet-50 y cuello FPN |
| Parametros totales | 36.569.662 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada fija de 1280x720) |
| Tipos de cuantizacion | no disponible (solo pesos FP32 en safetensors y `.pth`) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`); uso educativo, de investigacion y sin animo de lucro. La config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), `.pth` equivalente y predicciones/score files archivados en `original/` |
| Libreria | mmdetection 2.28.2 (con mmcv-full 1.7.2, torch 2.0.1, Python 3.10) |
| Entrada | 1280x720 RGB, media y desviacion tipica de ImageNet, sin redimensionado |
| Post-proceso | Umbral de score 0.05, NMS con IoU 0.5, maximo 100 cajas por imagen |
| Tamano del repositorio | 0.6 GB |

## Arquitectura y entrenamiento

RetinaNet es un detector de una sola etapa que combina un backbone ResNet-50 (inicializado con pesos `torchvision://resnet50`) con una Feature Pyramid Network para extraer caracteristicas multiescala. Sobre cada nivel de la piramide se aplican dos subredes ligeras: una de clasificacion por ancla y otra de regresion de cajas. La innovacion central del metodo es la Focal Loss, que reequilibra la enorme proporcion de anclas negativas frente a las positivas y permite que un detector denso de una etapa iguale o supere a los detectores de dos etapas de la epoca. La configuracion corresponde a la receta "1x" de mmdetection: 12 epocas, SGD con learning rate 0.02, weight decay 0.0001, decaimiento en las epocas 8 y 11 y batch efectivo de 32 (8 GPU x 4 imagenes), tal como indica el README de SysCV.

El entrenamiento se realizo sobre las 70.000 imagenes del split de entrenamiento de BDD100K, un dataset de escenas de conduccion heterogeneas con condiciones de dia, noche, lluvia y diferentes entornos urbanos y de autopista. No consta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion (no aplican a un detector). El checkpoint se sirve con un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 sobre Python 3.10) y un `infer.py` que soporta imagenes, carpetas, video y webcam, con exportacion a JSON en formato BDD100K. La verificacion del espejo es notable: el MD5 de los pesos (`e83f307a4541d0006b2977d6f8f9f0f1`) coincide con el de SysCV y todas las claves cargan en su configuracion. En 20 imagenes de validacion aleatorias, 1911 de las 1983 cajas de las predicciones publicadas son identicas en esta copia (1917 con IoU >= 0.5), con una diferencia maxima de score de 0.0996; la causa de esa discrepancia menor es desconocida segun el autor.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion para diez clases de BDD100K: peatón, rider, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico.
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y flujo de webcam mediante `infer.py`.
- Exportacion de detecciones en formato JSON compatible con BDD100K (`--json out.json`).
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames para video (`--max-frames`).
- Ejecucion en CPU y en GPU CUDA 11.8; el entorno incluye requisitos separados para ambos casos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision por computador.
- No dispone de modo "thinking", vision generativa, audio ni generacion de texto.

## Casos de uso

- Baseline reproducible para investigacion en deteccion sobre BDD100K: sirve como punto de comparacion controlado (misma config, mismos pesos verificados por MD5) para evaluar mejoras de backbone, FPN o estrategias de aumento de datos, evitando depender de un host caido.
- Prototipado de sistemas ADAS en laboratorio: el modelo detecta coches, peatones y senales sobre imagenes de 1280x720 a 0.07 s/imagen en una RTX 4070 SUPER, lo que permite iterar rapidamente sobre pipelines de percepcion antes de pasar a modelos mas pesados.
- Analisis offline de video de trafico: con `infer.py` sobre un fichero de video y exportacion a JSON, se pueden extraer detecciones frame a frame para estudiar flujos de vehiculos, ocupacion de carriles o presencia de peatones en grabaciones historicas.
- Anotacion asistida (pre-etiquetado): las detecciones con umbral bajo (0.05 en evaluacion, configurable en inferencia) pueden proponerse como cajas iniciales para que anotadores humanos las corrijan, acelerando la creacion de nuevos datasets de conduccion.
- Demostraciones y docencia: el script acepta webcam (`python infer.py 0 --show`), lo que permite montar una demo en vivo de deteccion en escenas de trafico con hardware de consumo.
- Validacion de infraestructura de despliegue: al ser un modelo mmdetection 2.x pequeno (36,5 M de parametros, 0,6 GB de repo), es util para verificar entornos CUDA/CPU, versiones de mmcv y flujos de carga de pesos safetensors antes de migrar a modelos mayores.
- Deteccion de semaforos y senales en imagenes estaticas: con AP de 22.5 y 35.8 respectivamente en validacion, puede emplearse en tareas de inventario o auditoria de infraestructura vial a partir de fotografias, aceptando su precision limitada.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los score files de SysCV), COCO-style box AP (%) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 28.6 | 52.1 | 26.6 | 10.6 | 34.6 | 49.6 |
| test | 27.1 | 49.2 | 25.5 | 10.8 | 34.4 | 44.1 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 29.9 |
| rider | 20.8 |
| car | 48.9 |
| truck | 42.4 |
| bus | 43.9 |
| train | 0.0 |
| motorcycle | 19.9 |
| bicycle | 21.7 |
| traffic light | 22.5 |
| traffic sign | 35.8 |

Rendimiento de inferencia declarado: 0.07 s/imagen en una RTX 4070 SUPER y 1.3 s/imagen en CPU con 8 hilos. No se han publicado en la informacion disponible resultados de benchmarks de otros modelos comparables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 36,5 M de parametros en FP32, los pesos ocupan aproximadamente 146 MB; el consumo real dependera del tamano de lote y de las activaciones a 1280x720, que son el factor dominante.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el autor reporta 0.07 s/imagen en una RTX 4070 SUPER. GPU de datacenter como A100 o H100 no aportan ventaja significativa para un modelo de este tamano.
- Cabe en GPU de consumo: si, en tarjetas como la RTX 4070 SUPER citada y, con margen, en GPUs de gama media con suficiente VRAM para las activaciones.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 (entornos `env/requirements-cu118.txt` o `env/requirements-cpu.txt`); el script `infer.py` cubre imagen, carpeta, video y webcam. No consta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput: 0.07 s/imagen en RTX 4070 SUPER (aproximadamente 14 imagenes/s) y 1.3 s/imagen en CPU con 8 hilos (aproximadamente 0.77 imagenes/s), segun el autor.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos sobre BDD100K, por lo que no es posible una comparacion cuantitativa rigurosa. A modo de contexto cualitativo:

| Modelo | Parametros | Contexto/entrada | AP en BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet R50-FPN 1x (este) | 36.569.662 | 1280x720 | 28.6 (val) | BDD100K (solo investigacion/educacion) | Hugging Face (espejo verificado) |
| Otros modelos del zoo SysCV BDD100K | no disponible | no disponible | no disponible | Apache-2.0 (config) | Host original `dl.cv.ethz.ch` caido |
| Detectores modernos tipo YOLO/DETR | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precision moderada: AP de 28.6 en validacion y 27.1 en test; clases como `train` obtienen AP 0.0 y las clases pequenas (APs 10.6) son especialmente debiles. No es adecuado para produccion con requisitos de seguridad.
- Licencia restrictiva: los pesos derivan de BDD100K y quedan limitados a uso educativo, de investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion adicional.
- Sesgos del dataset: BDD100K esta sesgado hacia escenas de conduccion de determinadas regiones y condiciones; el rendimiento puede degradarse en entornos no representados (clima extremo, paises no cubiertos, camaras con otra perspectiva).
- Riesgo de falsos negativos y positivos: al ser un detector denso con umbral de score bajo en evaluacion (0.05), en produccion habra que calibrar el umbral (`--score-thr`) y el NMS segun el caso de uso.
- Discrepancia de reproduccion: el espejo no reproduce exactamente las predicciones publicadas (1911 de 1983 cajas identicas en 20 imagenes de validacion); diferencias de hasta 0.0996 en score pueden afectar a comparaciones finas.
- Dependencia de un stack antiguo: mmdetection 2.28.2, mmcv-full 1.7.2 y torch 2.0.1 requieren un entorno dedicado (Python 3.10); no es compatible con las versiones actuales de mmdetection 3.x sin conversion.
- Sin capacidades linguisticas ni multimodales mas alla de la deteccion: no genera descripciones, no responde preguntas y no procesa texto.
- Entrada fija a 1280x720: imagenes con otra relacion de aspecto o resolucion requeriran redimensionado, lo que puede alterar la precision respecto a los resultados reportados.
- El host original de los pesos esta caido; la trazabilidad depende de este espejo y de la Wayback Machine.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-1x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-1x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models (deteccion): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV para este modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_r50_fpn_1x_det_bdd100k.py
- Paper del metodo (Focal Loss for Dense Object Detection, ICCV 2017): https://arxiv.org/abs/1708.02002
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
