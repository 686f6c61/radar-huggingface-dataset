# dronefreak/bdd100k-syscv-retinanet-pvtv2-b1-fpn-3x

## Resumen

RetinaNet PVTv2-B1-FPN 3x es un detector de objetos de una etapa (single-stage) entrenado sobre el conjunto de datos BDD100K para la deteccion de objetos propios de escenas de conduccion. Combina un backbone Pyramid Vision Transformer v2 (PVTv2-B1) con un cuello Feature Pyramid Network (FPN) y una cabeza de deteccion RetinaNet, todo implementado sobre el framework MMDetection. El modelo original forma parte del zoo de modelos de BDD100K publicado por SysCV (ETH Zurich) y este repositorio es un espejo comunitario que recupera los pesos desde la Wayback Machine ante la caida del host original `dl.cv.ethz.ch`.

El modelo resuelve la tarea de deteccion de diez clases de trafico (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) en imagenes de 1280 x 720 pixeles, la resolucion nativa de BDD100K. Su relevancia actual es practica: permite reproducir los resultados publicados por SysCV en un entorno fijado (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y sirve como linea base para investigacion en percepcion para conduccion autonoma.

Con aproximadamente 22,3 millones de parametros y un peso de repositorio de 0,9 GB, es un modelo compacto orientado a inferencia en tiempo casi real (0,05 s por imagen en una RTX 4070 SUPER). No es un modelo de lenguaje ni un modelo multimodal generativo: es un detector visual puro con licencia derivada de BDD100K, restringida a uso educativo, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet de una etapa con backbone PVTv2-B1, cuello FPN y cabeza de deteccion RetinaNet |
| Parametros totales | 22.293.822 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | bdd100k (uso educativo, de investigacion y sin animo de lucro) |
| Formato de pesos | safetensors (`model.safetensors`), con `.pth` equivalente en `original/`; configuracion en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clasico de RetinaNet: un backbone PVTv2-B1 extrae caracteristicas multiescala mediante atencion jerarquica con mapas de resolucion decreciente; un FPN fusiona esas escalas para construir una piramide de caracteristicas; y la cabeza RetinaNet predice, por cada ancla, la clase y la regresion de caja con la funcion de perdida focal caracteristica de este detector. El backbone se inicializa con pesos de ImageNet (`pvt_v2_b1.pth` del repositorio oficial de PVT). La entrada es de 1280 x 720 pixeles RGB con normalizacion ImageNet (media y desviacion estandar), sin redimensionado respecto al tamano nativo de BDD100K.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con optimizador AdamW, tasa de aprendizaje 0,0001, weight decay 0,0001, decaimiento de la tasa en las epocas 24 y 33, batch de 32 (8 GPU x 2 imagenes) y entrenamiento multiescala con 6 escalas entre (1280, 600) y (1280, 720). En test se aplica umbral de puntuacion 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. La configuracion procede del repositorio de SysCV; el espejo corrige una referencia rota en su fichero original (la config de b0 apuntaba a un fichero inexistente) y anade un entorno fijado y un script de inferencia.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion para diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Salida en formato COCO-style con cajas, etiquetas de clase y puntuaciones de confianza, exportable a JSON en formato BDD100K mediante la opcion `--json`.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y camara web en directo (opcion `--show`).
- Control del umbral de puntuacion (`--score-thr`, por defecto 0,3) y del numero maximo de fotogramas procesados (`--max-frames`).
- Ejecucion en GPU (CUDA 11.8) y en CPU (entorno alternativo `requirements-cpu.txt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision por computador.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion sobre imagen.

## Casos de uso

- Linea base de investigacion en deteccion para conduccion autonoma: el modelo reproduce exactamente las predicciones publicadas por SysCV (mismas 1954 cajas y puntuaciones en 20 imagenes de validacion), lo que permite comparar nuevas propuestas contra un resultado de referencia verificado sin depender de un host caido.
- Analisis offline de videos de trafico: con `infer.py drive.mov` se procesan clips completos y se generan detecciones en formato BDD100K para estudios de conteo de vehiculos, ocupacion de carril o analisis de flujo en intersecciones, gracias a la resolucion nativa de 1280 x 720 y al bajo coste por fotograma (0,05 s en RTX 4070 SUPER).
- Prototipado de sistemas ADAS en laboratorio: el detector identifica peatones, ciclistas y senales de trafico con un modelo de solo 22,3 millones de parametros, adecuado para validar pipelines de percepcion antes de invertir en modelos mayores.
- Etiquetado asistido y preanotacion de datasets: las salidas JSON en formato BDD100K pueden servir como propuestas iniciales que un humano revise, reduciendo el coste de anotacion en proyectos de vision para automocion.
- Educacion y docencia en vision por computador: el repositorio incluye un entorno fijado y reproducible (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2), lo que facilita practicas sobre deteccion de una etapa, FPN y backbones transformer.
- Demostraciones en tiempo real con camara web: la opcion `python infer.py 0 --show` permite visualizar detecciones en directo sobre una webcam, util para demos de percepcion en ferias o presentaciones academicas.
- Evaluacion comparativa de backbones: al ser un PVTv2-B1 sobre RetinaNet, sirve para medir el impacto del backbone transformer frente a alternativas convolucionales en la misma tarea y dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuacion de SysCV; la metrica de la model-index figura como no verificada, aunque el espejo documenta reproduccion exacta en GPU y CPU):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,6 | 58,9 | 30,8 | 14,5 | 38,8 | 53,8 |
| test | 31,8 | 56,2 | 30,7 | 15,4 | 38,1 | 49,7 |

AP por clase en validacion (COCO-style, %):

| Clase | AP |
|---|---|
| pedestrian | 35,3 |
| rider | 26,1 |
| car | 51,3 |
| truck | 45,0 |
| bus | 48,6 |
| train | 2,8 |
| motorcycle | 24,8 |
| bicycle | 26,4 |
| traffic light | 25,5 |
| traffic sign | 40,0 |

Rendimiento de inferencia declarado: 0,05 s por imagen en una RTX 4070 SUPER y 1,5 s por imagen con 8 hilos de CPU (umbral de puntuacion 0,05, NMS IoU 0,5, maximo 100 cajas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 22,3 millones de parametros y entrada de 1280 x 720, el peso de los pesos en precision completa ronda los 90 MB y el consumo dominante es el de las activaciones, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 4070 SUPER (medida de referencia del autor, 0,05 s/imagen); cualquier GPU NVIDIA con soporte CUDA 11.8 y suficiente memoria para la entrada a 1280 x 720. No se documentan medidas en A100 ni H100.
- Caben en GPU de consumo: si; el autor verifica la ejecucion en una RTX 4070 SUPER. No se especifica el minimo de VRAM necesario.
- Despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 y PyTorch 2.0.1 sobre Python 3.10 (entornos `env/requirements-cu118.txt` y `env/requirements-cpu.txt`); el script `infer.py` cubre imagen, carpeta, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput: 0,05 s/imagen en RTX 4070 SUPER (aproximadamente 20 imagenes por segundo) y 1,5 s/imagen en CPU con 8 hilos (aproximadamente 0,67 imagenes por segundo). Los pesos cargan con `torch.load(weights_only=True)`.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que establecer una comparacion cuantitativa fiable. Como referencia estructural, este modelo se situa en la familia de detectores de una etapa con backbone transformer:

| Modelo | Parametros | Contexto/entrada | AP en BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet PVTv2-B1-FPN 3x (este) | 22,3 M | 1280 x 720 | 32,6 | bdd100k (solo investigacion) | Hugging Face (espejo) |
| Alternativas RetinaNet con backbone CNN del zoo SysCV | no disponible | 1280 x 720 | no disponible | bdd100k | no disponible (host original caido) |
| Otros detectores de una etapa sobre BDD100K | no disponible | no disponible | no disponible | variable | no disponible |

La comparacion con alternativas concretas (por ejemplo, variantes con backbone ResNet o Swin del mismo zoo) no puede completarse con los datos disponibles.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se entrenaron sobre BDD100K y heredan su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. No esta permitido el uso comercial sin autorizacion adicional.
- Rendimiento muy desigual por clase: el AP de la clase train es de solo 2,8, y las clases pequenas o poco frecuentes (traffic light 25,5, motorcycle 24,8, bicycle 26,4, rider 26,1) quedan muy por debajo de car (51,3) o bus (48,6). Los objetos de tamano pequeno (APs 14,5 en val) son especialmente dificiles.
- Dependencia de la resolucion de entrada: el modelo esta entrenado y evaluado a 1280 x 720 sin redimensionado; usarlo con otras resoluciones o relaciones de aspecto puede degradar las detecciones.
- Riesgo de falsos positivos y negativos: como todo detector de una etapa, puede producir detecciones espurias con puntuaciones bajas; se recomienda ajustar el umbral de puntuacion segun el caso de uso (por defecto 0,3 en el script, 0,05 en la evaluacion).
- Entorno fragil: requiere versiones concretas de PyTorch, mmcv-full y MMDetection (stack de mmdetection 2.x); mezclar versiones puede romper la carga de pesos o la configuracion.
- Procedencia de los pesos: al ser un espejo recuperado de la Wayback Machine, la trazabilidad depende de la verificacion documentada (MD5 `b443f352d66b2ec843fe35f559cc26a7` y reproduccion exacta de predicciones); conviene validar el MD5 antes de usarlo en produccion.
- Sesgos del dataset: BDD100K refleja condiciones de captura concretas (camaras de vehiculo, geografia y climatologia especificas); el modelo puede generalizar mal a dominios visuales distintos.
- No apto para seguridad critica: no debe emplearse como unico componente de decision en sistemas de conduccion reales sin validacion exhaustiva y redundancia.
- Ausencia de benchmarks comparativos publicados en este repositorio mas alla de los resultados de SysCV; no hay datos de robustez ante condiciones adversas (lluvia, noche) mas alla del video de demostracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b1-fpn-3x
- Repositorio de modelos BDD100K de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV usada: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_pvtv2-b1_fpn_3x_det_bdd100k.py
- Paper de PVTv2: https://arxiv.org/abs/2106.13797
- Pesos de inicializacion PVTv2-B1 (ImageNet): https://github.com/whai362/PVT/releases/download/v2/pvt_v2_b1.pth
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b1-fpn-3x/blob/main/LICENSE.txt
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687 (referencia de la cita incluida en la model card)
