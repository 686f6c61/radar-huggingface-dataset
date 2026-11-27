# dronefreak/bdd100k-syscv-faster-rcnn-convnext-s-fpn-fp16-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-convnext-s-fpn-fp16-3x` es un detector de objetos de dos etapas (Faster R-CNN) con backbone ConvNeXt-Small y cuello FPN, entrenado sobre el dataset de conduccion autonoma BDD100K. No es un modelo de lenguaje ni un modelo fundacional generativo: es un checkpoint de vision por computador para deteccion de objetos en escenas de trafico, con 66,7 millones de parametros y entrada nativa de 1280 x 720. Lo publica el usuario `dronefreak` como espejo (mirror) de un modelo del zoo oficial de SysCV (ETH Zurich), cuyo servidor de descargas `dl.cv.ethz.ch` esta caido; los pesos se recuperaron de una captura de Wayback Machine del 19 de febrero de 2025.

El modelo resuelve la tarea de detectar las diez clases de BDD100K (peatón, ciclista, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico) en imagenes de conduccion diurna y nocturna. Su relevancia actual es practica: preserva un checkpoint de referencia de SysCV que ya no es descargable desde su origen, con un entorno fijado (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia para imagen, video y webcam. El autor declara un Box AP de 34,79 en validacion, coherente con la linea base de Faster R-CNN sobre BDD100K.

Arquitectonicamente es un detector clasico de dos etapas: backbone convolucional ConvNeXt-S inicializado con pesos ImageNet, FPN para piramide de caracteristicas y cabecera Faster R-CNN. No hay innovaciones de decodificacion especulativa ni atencion lineal; la unica particularidad tecnica es el entrenamiento en precision mixta FP16 sobre el esquema de 36 epocas (3x) de mmdetection.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ConvNeXt-Small y FPN |
| Parametros totales | 66.727.906 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (`license: other`), uso educativo, de investigacion y sin animo de lucro; la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (tambien `.pth` original; repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue el diseno estandar de mmdetection 2.x: un backbone ConvNeXt-Small (familia presentada en "A ConvNet for the 2020s", CVPR 2022, arXiv:2201.03545) inicializado con pesos ImageNet de OpenMMLab, un Feature Pyramid Network que agrega las salidas multiescala del backbone y una cabecera Faster R-CNN con RPN y ROI head. La entrada es la resolucion nativa de BDD100K, 1280 x 720, sin redimensionado, con normalizacion ImageNet (media y desviacion tipica estandar) en RGB.

El entrenamiento usa el split train de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con AdamW a learning rate 0,0001, weight decay 0,05, decaimiento del learning rate en las epocas 27 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). Se emplea precision mixta FP16. No se documenta RLHF, DPO ni entrenamiento por preferencias, algo esperable en un detector. En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen; el autor reporta 2,0 s por imagen en 8 hilos de CPU.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam (via `infer.py`).
- Salida en formato BDD100K mediante `--json out.json`, ademas de visualizacion con umbral de score configurable (por defecto 0,3).
- Procesamiento de escenas diurnas y nocturnas (el autor valida con clips de dia y de noche).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No tiene modo thinking, vision multimodal de entrada libre, audio ni generacion de texto.

## Casos de uso

- Deteccion de peatones y vehiculos en pipelines de conduccion autonoma: el modelo entrega cajas con clase y score sobre imagenes de 1280 x 720, adecuado como baseline de percepcion o para comparar con detectores mas modernos.
- Anotacion asistida de datasets de trafico: ejecutar `infer.py` sobre carpetas de imagenes y exportar con `--json out.json` en formato BDD100K permite preetiquetar y revisar manualmente, reduciendo el coste de anotacion.
- Investigacion academica en deteccion sobre BDD100K: sirve como referencia reproducible de Faster R-CNN + ConvNeXt-S con configuracion fijada, util para experimentos de ablacion.
- Analisis de video de trafico: el script acepta ficheros de video y limita frames con `--max-frames`, lo que permite procesar clips de camara de vigilancia o dashcam y contar objetos por frame.
- Prototipado en CPU sin GPU: el autor reporta 2,0 s por imagen con 8 hilos de CPU, suficiente para demos, validacion cualitativa y pruebas de integracion en entornos sin acelerador.
- Pruebas de robustez dia/noche: al estar entrenado sobre BDD100K, que incluye escenas nocturnas, permite evaluar el comportamiento del detector en condiciones de iluminacion adversas antes de adoptar modelos mayores.
- Reproduccion de resultados de SysCV: el repo incluye las predicciones y scores de validacion archivados en `original/`, lo que facilita verificar el AP declarado sin reentrenar.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV; no verificados de forma independiente):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 34,8 | 61,0 | 33,8 | 16,9 | 39,5 | 57,6 |
| test | 34,5 | 59,7 | 34,1 | 17,6 | 40,0 | 53,0 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 37,6 | 30,4 | 52,6 | 47,6 | 51,0 | 4,5 | 28,5 | 29,6 | 25,5 | 40,6 |

El autor documenta una verificacion de fidelidad: sobre 20 imagenes aleatorias de validacion, 21 de las 665 cajas publicadas por SysCV son identicas en esta copia y 664 coinciden con IoU >= 0,5 (esta copia produce 667 cajas), con una diferencia maxima de score de 0,0619. El MD5 de los pesos (`fe84d5e46664cfda6a37b1a2a2bcf76b`) coincide con el de SysCV y todas las claves cargan en su configuracion. No se han publicado comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 66,7 M de parametros en FP16 (unos 133 MB de pesos) y entrada de 1280 x 720, el consumo dominante son las activaciones, no los pesos.
- GPU recomendadas: no documentadas por el autor; el entorno fijado usa CUDA 11.8 (`env/requirements-cu118.txt`) y el autor indica que el entorno CUDA no ha sido probado.
- Cabe en GPU de consumo: si, por tamano de pesos (unos 133 MB en FP16); no se aportan mediciones de VRAM reales.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2, mmcls 0.25.0 y PyTorch 2.0.1 sobre Python 3.10, instalado en un entorno virtual limpio (`uv venv`). No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 2,0 s por imagen en 8 hilos de CPU, segun el autor; sin datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AP en BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN + ConvNeXt-S + FPN) | 66,7 M | 1280 x 720 | 34,8 | BDD100K (uso educativo/investigacion) | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | Apache-2.0 (config) | Servidor original `dl.cv.ethz.ch` caido |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre BDD100K: el dominio se limita a escenas de conduccion; el rendimiento fuera de ese dominio (interiores, imagenes aereas, otros paises) no esta caracterizado.
- Clases muy desequilibradas: el AP de `train` es de 4,5, practicamente inutilizable en produccion; `traffic light` (25,5) y `motorcycle` (28,5) tambien son debiles.
- AP global moderado (34,8 en val): no es un detector de ultima generacion; para produccion conviene evaluar alternativas mas recientes.
- Licencia restrictiva: los pesos caen bajo la licencia de BDD100K (uso educativo, de investigacion y sin animo de lucro); el uso comercial requiere revisar `LICENSE.txt` y probablemente licencias adicionales.
- Es un espejo no oficial: el autor advierte que la copia es "cercana, no exacta" respecto a SysCV (diferencias de score de hasta 0,0619) y que la causa no se investigo.
- Entorno CUDA no probado por el autor; el script de inferencia se valido en CPU. Riesgo de incompatibilidades con versiones modernas de PyTorch o mmdetection (el stack esta fijado a versiones de 2023).
- Entorno de mmdetection 2.x, en fin de vida: requiere un entorno virtual limpio y no es compatible con mmdetection 3.x.
- Riesgo de falsos negativos y positivos en condiciones de baja iluminacion, oclusion o clima adverso, no cuantificado en la model card.
- El video de demostracion fue revisado frame a frame para evitar matriculas legibles y rostros identificables, pero no se documentan garantias de privacidad en inferencia sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-convnext-s-fpn-fp16-3x
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-convnext-s-fpn-fp16-3x/blob/main/LICENSE.txt
- Zoo de modelos SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_convnext-s_fpn_fp16_3x_det_bdd100k.py
- Paper de ConvNeXt: https://arxiv.org/abs/2201.03545
- Dataset BDD100K: https://huggingface.co/dronefreak/BDD100K
- Pesos ImageNet de ConvNeXt-Small (OpenMMLab): https://download.openmmlab.com/mmclassification/v0/convnext/downstream/convnext-small_3rdparty_32xb128-noema_in1k_20220301-303e75e3.pth
