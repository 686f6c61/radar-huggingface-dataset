# dronefreak/bdd100k-syscv-cascade-rcnn-r50-fpn-3x

## Resumen

Cascade R-CNN R50-FPN 3x sobre BDD100K es un detector de objetos para escenas de conduccion, publicado por el autor `dronefreak` como espejo de un modelo del zoo oficial de SysCV (ETH Zurich). El checkpoint original alojado en `dl.cv.ethz.ch` estaba caido y los pesos se recuperaron desde la Wayback Machine (captura del 19 de febrero de 2025); este repositorio anade un entorno fijado y un script de inferencia. No es un modelo de lenguaje: es un detector de objetos clasico de dos etapas, sin parametros de contexto ni generacion de texto.

La arquitectura es Cascade R-CNN con backbone ResNet-50 e FPN, entrenada con el esquema 3x (36 epocas) sobre las 70.000 imagenes de entrenamiento de BDD100K. Detecta diez clases de trafico: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. El modelo tiene 69,2 millones de parametros y un tamano de repositorio de 0,7 GB.

Su relevancia actual es de tipo practico y de reproducibilidad: permite recuperar un baseline de deteccion para BDD100K cuando el host original no esta disponible, con verificacion exacta contra las predicciones publicadas por SysCV (746 cajas identicas en 20 imagenes de validacion) y MD5 de pesos coincidente. Es un punto de partida util para experimentos academicos de deteccion en conduccion autonoma, no un modelo de produccion moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone ResNet-50 e FPN (detector de dos etapas en cascada) |
| Parametros totales | 69.232.636 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo FP32 en safetensors y .pth) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | bdd100k (educational, research y not-for-profit; ver LICENSE.txt) |
| Formato de pesos | safetensors y .pth (PyTorch); configuracion en config.json y original_config.py |
| Libreria | mmdetection 2.28.2 (mmcv-full 1.7.2, torch 2.0.1, Python 3.10) |
| Entrada | 1280 x 720 RGB, tamano nativo de BDD100K sin redimensionado, normalizacion ImageNet |
| Clases | 10: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |
| Post-proceso | umbral de score 0.05, NMS con IoU 0.5, maximo 100 cajas por imagen |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena varias cabezas de clasificacion y regresion con umbrales de IoU crecientes, de modo que cada etapa refina las propuestas de la anterior y mejora la calidad de las cajas finales. El backbone es ResNet-50 inicializado con pesos ImageNet (`torchvision://resnet50`), combinado con una Feature Pyramid Network para detectar objetos a distintas escalas. El paper de referencia es "Cascade R-CNN: Delving into High Quality Object Detection" (CVPR 2018).

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con SGD de learning rate 0.04, weight decay 0.0001, decaimiento del learning rate en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). La configuracion procede de SysCV y esta publicada bajo Apache-2.0.

No se documenta en la informacion disponible el uso de tecnicas como RLHF, DPO, decodificacion especulativa ni atencion lineal, que no aplican a este tipo de modelo. La innovacion tecnica destacable del repositorio es la recuperacion verificable del checkpoint: los pesos cargan con `torch.load(weights_only=True)`, el MD5 `2d223a9c398a5e0584a4b479ad5ce1a8` coincide con el fichero de SysCV y todas las claves cargan en su configuracion original.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con 10 clases de trafico.
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y webcam (script `infer.py`).
- Exportacion de detecciones en formato JSON compatible con BDD100K (`--json out.json`).
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames para video (`--max-frames`).
- Funcionamiento en CPU (2,5 s por imagen con 8 hilos) y en GPU con CUDA 11.8 (entorno CUDA no probado por el autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No tiene modo thinking, vision multimodal ni audio; su unica modalidad es la imagen RGB.

## Casos de uso

- Reproduccion de baselines academicos: sirve para replicar los resultados de SysCV en BDD100K con un entorno fijado y pesos verificados por MD5, util para comparar nuevas tecnicas de deteccion contra un punto de referencia estable.
- Deteccion de peatones y vehiculos en video de dashcam: el script de inferencia procesa ficheros `.mov` y exporta cajas por frame, adecuado para prototipos de analisis de trafico en investigación.
- Analisis de escenas nocturnas y diurnas: el modelo fue entrenado con la diversidad de BDD100K (dia, noche, lluvia) y el repositorio incluye una demo con clips diurnos y nocturnos, lo que permite evaluar el comportamiento por condiciones de iluminacion.
- Extraccion de objetos para pipelines de etiquetado asistido: las detecciones en formato JSON de BDD100K pueden usarse como preanotaciones para revisión humana en conjuntos de datos propios de conduccion.
- Docencia y cursos de vision por computador: el entorno reproducible (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y la inferencia en CPU permiten ejecutar el modelo sin GPU en aulas o portatiles.
- Evaluacion comparativa de detectores de dos etapas: al ser un Cascade R-CNN R50-FPN 3x canonico, sirve como referencia frente a detectores de una etapa (YOLO, RetinaNet) en tareas de deteccion de trafico.
- Analisis de senalizacion vial: las clases traffic light y traffic sign (AP 25,9 y 40,8 respectivamente) permiten experimentos de inventario de senales en grabaciones, con la cautela de su precision limitada en objetos pequenos.

## Benchmarks y rendimiento

Resultados COCO-style box AP (%) sobre BDD100K, declarados por SysCV y reproducidos en este repositorio:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,7 | 58,0 | 33,1 | 16,2 | 39,0 | 55,2 |
| test | 33,1 | 55,7 | 33,5 | 16,9 | 40,0 | 49,6 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 37,2 |
| rider | 27,5 |
| car | 53,3 |
| truck | 47,9 |
| bus | 49,8 |
| train | 0,0 |
| motorcycle | 27,7 |
| bicycle | 27,2 |
| traffic light | 25,9 |
| traffic sign | 40,8 |

El valor de mAP de la model-index (33,72 en validacion) corresponde al AP global de la tabla anterior. El autor verifica la reproduccion exacta: en 20 imagenes aleatorias de validacion, esta copia en CPU produce las mismas 746 cajas y scores que las predicciones publicadas por SysCV (su exportacion resta 1 px a `x2` e `y2`). No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 69,2 M de parametros en FP32 (unos 277 MB de pesos) y entrada de 1280 x 720, la huella es moderada y cabe en GPUs consumer con 8 GB o mas, aunque el dato no esta confirmado por el autor.
- GPU recomendadas: no disponible; el autor solo indica que el entorno CUDA 11.8 no ha sido probado. Cualquier GPU NVIDIA compatible con CUDA 11.8 deberia funcionar.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no hay medicion publicada.
- Inferencia en CPU: 2,5 s por imagen con 8 hilos, segun el autor.
- Opciones de despliegue: entorno mmdetection 2.x con `infer.py` incluido; requisitos en `env/requirements-cu118.txt` (GPU) o `env/requirements-cpu.txt` (CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput en GPU: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K para establecer una comparativa numerica fiable. Como referencia cualitativa de la misma categoria (deteccion de objetos de dos etapas con backbone ResNet-50), podrian citarse Faster R-CNN R50-FPN y Mask R-CNN R50-FPN, pero no se han publicado sus metricas en este contexto dentro de la informacion disponible.

| Modelo | Parametros | Contexto | AP en BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cascade R-CNN R50-FPN 3x (este) | 69,2 M | no aplica | 33,7 | bdd100k (solo investigacion) | Hugging Face |
| Faster R-CNN R50-FPN | no disponible | no aplica | no disponible | no disponible | no disponible |
| Mask R-CNN R50-FPN | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar `LICENSE.txt` y probablemente licencias adicionales.
- Clase `train` con AP 0,0: el modelo no detecta trenes de forma util en validacion, lo que refleja su escasez en el conjunto de datos.
- Objetos pequenos: APs de 16,2 en validacion indica un rendimiento bajo en instancias de pequeno tamano, relevante para senales y semaforos lejanos.
- Riesgo de falsos positivos y negativos en condiciones adversas (noche, lluvia, deslumbramiento), no cuantificado en la informacion disponible.
- Entorno antiguo y fragil: mmdetection 2.28.2, mmcv-full 1.7.2 y torch 2.0.1 requieren un entorno virtual limpio; el soporte CUDA no ha sido probado por el autor.
- Sin datos de sesgo demografico ni geografico mas alla de la composicion de BDD100K, que esta centrado en escenas de conduccion de determinadas regiones.
- No es un modelo de lenguaje: no admite prompts, contexto conversacional ni generacion de texto; cualquier uso en ese sentido es un error de categoria.
- El repositorio es un espejo no oficial; la fuente de verdad es el zoo de SysCV, actualmente caido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-r50-fpn-3x
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-r50-fpn-3x/blob/main/LICENSE.txt
- Zoo de modelos SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_r50_fpn_3x_det_bdd100k.py
- Paper de Cascade R-CNN (CVPR 2018): https://arxiv.org/abs/1712.00726
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687 (referencia de la cita; no enlazado en la model card)
- Dataset en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
