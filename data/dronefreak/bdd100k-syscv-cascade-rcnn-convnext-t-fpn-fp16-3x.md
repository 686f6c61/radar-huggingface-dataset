# dronefreak/bdd100k-syscv-cascade-rcnn-convnext-t-fpn-fp16-3x

## Resumen

Cascade R-CNN con backbone ConvNeXt-Tiny y cuello FPN, entrenado sobre BDD100K para deteccion de objetos en escenas de conduccion. El modelo lo desarrollo originalmente SysCV (grupo de investigacion de ETH Zurich) como parte de su zoo de modelos para BDD100K; este repositorio es un espejo creado por el usuario dronefreak que recupera los pesos desde la Wayback Machine ante la caida del host original `dl.cv.ethz.ch`. El checkpoint se publica con un entorno de inferencia fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script `infer.py` que acepta imagenes, video o webcam.

El modelo resuelve deteccion de objetos en 10 categorias propias de la conduccion autonoma: peatones, ciclistas, coches, camiones, autobuses, trenes, motos, bicicletas, semaforos y senales de trafico. Con 72,8 millones de parametros y entrada nativa de 1280x720, se posiciona como una opcion ligera y reproducible para investigacion en percepcion vial, no como un modelo de produccion de altas prestaciones.

Su relevancia actual es doble: por un lado, preserva pesos que estaban practicamente perdidos al desaparecer el host institucional; por otro, ofrece un baseline de referencia con resultados verificables (AP de caja de 35,8 en validacion) sobre el split de validacion de BDD100K, util para comparar arquitecturas de deteccion en el dominio de la conduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone ConvNeXt-Tiny, cuello FPN y cabeza de deteccion en cascada (3 etapas) |
| Parametros totales | 72.878.556 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 1280x720) |
| Tipos de cuantizacion | FP16 (entrenamiento e inferencia); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro; ver LICENSE.txt) |
| Formato de pesos | safetensors (tambien `.pth` original en `original/`) |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena tres cabezas de clasificacion y regresion con umbrales de IoU crecientes, lo que refina progresivamente las propuestas de region. El backbone es ConvNeXt-Tiny, una red convolucional moderna inspirada en los disenos de transformers visuales (paper "A ConvNet for the 2020s", CVPR 2022), inicializada con pesos ImageNet. Sobre el backbone se anade un FPN para fusion multiescala, y la cabeza en cascada opera sobre las caracteristicas resultantes. La entrada es la resolucion nativa de BDD100K, 1280x720, sin reescalado, con normalizacion ImageNet (media y desviacion tipica).

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (3x), con AdamW, learning rate 0,0001, weight decay 0,05, batch de 32 (8 GPUs x 4 imagenes), decaimiento del learning rate en las epocas 27 y 33, entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720) y precision mixta FP16. En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. La inferencia reportada tarda 2,6 s por imagen en 8 hilos de CPU.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en 10 categorias: peatones, riders, coches, camiones, autobuses, trenes, motos, bicicletas, semaforos y senales de trafico.
- Deteccion sobre imagenes sueltas, carpetas de imagenes, ficheros de video y flujo de webcam (via `infer.py`).
- Salida en formato BDD100K mediante la opcion `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames para video (`--max-frames`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector puro de vision.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Investigacion en percepcion vial: sirve como baseline reproducible para comparar nuevas arquitecturas de deteccion sobre BDD100K, ya que los resultados de SysCV y la configuracion exacta estan publicados y verificados.
- Prototipado de sistemas ADAS en laboratorio: permite generar detecciones sobre clips de validacion (dia y noche) para estudiar el comportamiento del modelo en condiciones de iluminacion adversas antes de invertir en modelos mayores.
- Analisis offline de grabaciones de trafico: el script acepta ficheros de video y produce salidas JSON en formato BDD100K, util para anotar o auditar conjuntos de datos propios.
- Docencia en vision por computador: el repositorio incluye un entorno fijado y un script de inferencia que funciona en CPU, lo que facilita reproducir el pipeline en aulas sin GPU.
- Verificacion de pesos y configuraciones: al conservar los MD5, predicciones y scores originales de SysCV en `original/`, permite auditar la fidelidad de la recuperacion y detectar discrepancias.
- Base para fine-tuning en dominios de conduccion especificos (por ejemplo, trafico urbano de una region concreta), partiendo de un checkpoint ya adaptado a BDD100K en lugar de uno generico de ImageNet.
- Deteccion en tiempo real aproximado sobre webcam para demos y pruebas de integracion de mmdetection en pipelines propios.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de score de SysCV). AP de caja estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 35,8 | 61,0 | 35,3 | 17,5 | 41,0 | 58,4 |
| test | 35,4 | 59,2 | 35,8 | 18,4 | 41,8 | 53,9 |

AP por categoria en validacion:

| Categoria | AP |
|---|---|
| pedestrian | 39,5 |
| rider | 30,6 |
| car | 54,1 |
| truck | 48,4 |
| bus | 52,0 |
| train | 5,9 |
| motorcycle | 29,1 |
| bicycle | 29,8 |
| traffic light | 27,0 |
| traffic sign | 42,1 |

El valor de mAP declarado en el model-index es 35,84 (Box AP en validacion, reportado por SysCV, no verificado de forma independiente). El autor documenta una verificacion parcial: sobre 20 imagenes aleatorias de validacion, 94 de las 671 cajas publicadas por SysCV son identicas en esta copia, 670 coinciden con IoU >= 0,5 (esta copia produce 673) y la mayor diferencia de score es 0,1710; la causa no se investigo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 72,9 M de parametros en FP16 el peso de los pesos ronda los 145 MB, por lo que la VRAM necesaria es modesta (estimacion habitual para este orden de magnitud: por debajo de 2 GB con entrada 1280x720, aunque el autor no lo cuantifica).
- GPU recomendadas: no se especifican en la informacion disponible. El entorno esta pensado para CUDA 11.8 (`requirements-cu118.txt`) y tambien hay un entorno CPU (`requirements-cpu.txt`).
- Cabe en GPU de consumo: si, por el tamano del modelo; el autor no detalla que tarjetas concretas ha probado.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2, torch 2.0.1, mmcls 0.25.0 y Python 3.10; script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 2,6 s por imagen en 8 hilos de CPU, segun el autor. No se han publicado cifras de latencia en GPU; el entorno CUDA no se ha probado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Cascade R-CNN ConvNeXt-T-FPN) | 72,9 M | 1280x720 | 35,8 | BDD100K (uso no comercial) | Hugging Face (espejo) |
| Otros modelos del zoo SysCV BDD100K | no disponible | no disponible | no disponible | BDD100K | Host original caido; espejos no documentados |
| Detectores genericos COCO (p. ej. Faster R-CNN, YOLO) | variable | variable | no comparable directamente (no entrenados en BDD100K) | variable | Amplia |

No se dispone de datos de benchmarks de alternativas equivalentes entrenadas sobre BDD100K en la informacion proporcionada, por lo que la comparativa cuantitativa con modelos de la misma categoria no esta disponible.

## Limitaciones y advertencias

- Licencia BDD100K: restringida a uso educativo, investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion adicional.
- El modelo solo detecta las 10 categorias de BDD100K; no cubre otras clases de objetos relevantes en conduccion (por ejemplo, conos, senalizacion temporal o animales).
- Rendimiento muy bajo en la clase `train` (AP 5,9), probablemente por escasez de ejemplos en el dataset; no es fiable para esa categoria.
- AP moderado en objetos pequenos (APs 17,5) y en clases como semaforos (27,0) y motos (29,1), lo que limita su uso en escenarios donde estos elementos son criticos.
- Riesgo de falsos negativos y positivos inherente a un detector con AP global de 35,8; no debe usarse como unico sistema de seguridad en vehiculos reales.
- La verificacion de fidelidad respecto a los pesos originales es parcial: hay discrepancias de score de hasta 0,1710 en algunas cajas, de causa no investigada.
- El entorno CUDA no ha sido probado por el autor; solo se documenta la inferencia en CPU.
- El repositorio no incluye informacion sobre sesgos demograficos o geograficos del dataset BDD100K que puedan afectar al rendimiento en distintas regiones.
- Modelo sin capacidades de lenguaje: no procesa texto ni responde a instrucciones, por lo que no debe confundirse con un modelo multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-t-fpn-fp16-3x
- Repositorio SysCV BDD100K models (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_convnext-t_fpn_fp16_3x_det_bdd100k.py
- Paper ConvNeXt ("A ConvNet for the 2020s", CVPR 2022): https://arxiv.org/abs/2201.03545
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-t-fpn-fp16-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
