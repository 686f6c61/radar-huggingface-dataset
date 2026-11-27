# dronefreak/bdd100k-syscv-cascade-rcnn-swin-s-fpn-fp16-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-cascade-rcnn-swin-s-fpn-fp16-3x` es un detector de objetos para escenas de conduccion autonoma, entrenado sobre el conjunto de datos BDD100K. Se trata de un espejo (mirror) de un checkpoint publicado originalmente por el equipo SysCV de la ETH Zurich en su zoo de modelos BDD100K, recuperado desde la Wayback Machine ante la caida del host original `dl.cv.ethz.ch`. El autor del repositorio anade un entorno de dependencias fijado y un script de inferencia para facilitar su uso.

Arquitectura y tamano: combina un backbone Swin Transformer (variante small, `swin_small_patch4_window7_224`) con un cuello FPN y una cabeza Cascade R-CNN para deteccion de objetos. El checkpoint contiene 93.953.310 parametros y el repositorio ocupa 1,7 GB. La resolucion de entrada nativa es 1280 x 720, sin reescalado.

Relevancia: el modelo es util para quien necesite reproducir resultados de deteccion en BDD100K sin depender de infraestructura caida, con pesos verificados por MD5 y un entorno reproducible (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2). Su licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro, lo que limita su aplicacion comercial directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone Swin Transformer small y cuello FPN |
| Parametros totales | 93.953.310 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1280 x 720) |
| Tipos de cuantizacion | FP16 (entrenamiento con precision mixta); no se documentan otras |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | bdd100k (educational, research and not-for-profit use) |
| Formato de pesos | safetensors (`model.safetensors`), equivalente a `.pth` original |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de deteccion en dos etapas: un backbone Swin Transformer small con ventanas desplazadas extrae caracteristicas jerarquicas, un FPN las combina a multiples escalas y una cabeza Cascade R-CNN refina las propuestas en cascada. La entrada es RGB a 1280 x 720 con normalizacion ImageNet (media y desviacion estandar). En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen.

Entrenamiento: sobre el split train de BDD100K (70.000 imagenes), 36 epocas (esquema 3x), optimizador AdamW con learning rate 0.0001 y weight decay 0.05, decaimiento en las epocas 27 y 33, batch de 32 (8 GPUs x 2 imagenes), entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720) y precision mixta FP16. El backbone se inicializa con pesos de ImageNet (`swin_small_patch4_window7_224.pth`). La configuracion proviene del repositorio SysCV y es Apache-2.0.

## Capacidades

- Deteccion de objetos en escenas de conduccion: 10 clases (pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign).
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y webcam (via `infer.py`).
- Salida en formato BDD100K mediante la opcion `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames para video (`--max-frames`).
- Ejecucion en CPU o GPU (se documenta 3,2 s/imagen en 8 hilos de CPU).
- Sin soporte de tool calling, agentes, texto, voz ni razonamiento multi-paso: es exclusivamente un modelo de vision por computador.

## Casos de uso

- Reproduccion de resultados academicos en BDD100K: permite validar el AP reportado por SysCV (35,49 en val) con pesos verificados por MD5, util para comparativas en papers de deteccion.
- Prototipado de sistemas ADAS en investigacion: deteccion de peatones, vehiculos y senales de trafico en secuencias de video de conduccion, con salida JSON compatible con el formato BDD100K.
- Analisis de escenas diurnas y nocturnas: el autor demuestra inferencia sobre clips de val de dia y de noche, lo que permite estudiar el comportamiento del detector en condiciones de iluminacion variadas.
- Extraccion de objetos para pipelines de etiquetado asistido: generar cajas candidatas sobre nuevos frames para revision humana en proyectos de anotacion.
- Evaluacion de tecnicas de despliegue: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) sirve como referencia reproducible para medir latencia en CPU frente a GPU.
- Docencia en vision por computador: ejemplo completo de deteccion en dos etapas con backbone transformer, configuracion y script de inferencia listos para usar.
- Investigacion sobre robustez en conduccion: analisis de falsos positivos y negativos por clase (por ejemplo, el AP bajo de train, 10,8) para estudiar clases minoritarias.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP en formato COCO, %), no verificados de forma independiente por el autor del espejo:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 35,5 | 60,2 | 35,4 | 17,0 | 40,0 | 58,0 |
| test | 34,9 | 58,1 | 35,5 | 17,5 | 40,3 | 53,5 |

AP por clase en val:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 38,8 | 30,0 | 53,6 | 46,5 | 49,5 | 10,8 | 28,1 | 29,5 | 26,6 | 41,4 |

Verificacion del espejo: en 20 imagenes aleatorias de val, 599 de las 610 cajas publicadas por SysCV son identicas en esta copia (CPU); las 610 coinciden con IoU >= 0,5, con una diferencia maxima de score de 0,0471. El MD5 de los pesos coincide con el fichero MD5 de SysCV. El entorno CUDA no se ha probado.

## Requisitos de hardware

- Inferencia en CPU: 3,2 s/imagen en 8 hilos, segun la model card. No se especifica RAM requerida.
- VRAM estimada: no disponible de forma explicita; con 93,95 M de parametros en FP16, los pesos ocupan aproximadamente 188 MB, a lo que hay que sumar activaciones a 1280 x 720 en el backbone Swin y el FPN.
- GPU recomendadas: no documentadas. Por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para inferencia en FP16, aunque no se aportan mediciones.
- GPU de consumo: previsiblemente compatible con RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se confirma en la informacion disponible.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10, mediante el script `infer.py` incluido. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Throughput y latencia en GPU: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros detectores en la informacion proporcionada para establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el propio zoo SysCV incluye otras variantes de deteccion sobre BDD100K (por ejemplo, configuraciones con backbone ResNet o Faster R-CNN), pero no se aportan sus metricas en esta ficha.

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cascade R-CNN Swin-S-FPN (este) | 93,95 M | 1280 x 720 | 35,49 | bdd100k | Hugging Face (espejo) |
| Otras variantes SysCV BDD100K | no disponible | no disponible | no disponible | Apache-2.0 (config) | GitHub SysCV |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia (educational, research and not-for-profit use). El uso comercial no esta permitido sin autorizacion.
- Verificacion parcial: la coincidencia con las predicciones originales de SysCV es "cercana, no exacta" (599 de 610 cajas identicas; diferencia maxima de score 0,0471). La causa no se investigo.
- Entorno CUDA no probado por el autor del espejo; solo se valido en CPU.
- Riesgo de falsos negativos y positivos en clases minoritarias: el AP de train es 10,8 y el de traffic light 26,6, muy por debajo de car (53,6).
- Sin capacidades linguisticas ni multimodales mas alla de la deteccion: no admite prompts, texto ni audio.
- Dependencia de un stack antiguo (mmdetection 2.x, mmcv-full 1.7.2, torch 2.0.1) que puede dificultar la integracion en entornos modernos.
- Posibles sesgos del dataset BDD100K (geografia, condiciones meteorologicas y demografia de las escenas) que se trasladan al modelo.
- El modelo detecta exclusivamente las 10 clases de BDD100K; cualquier otra categoria queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-swin-s-fpn-fp16-3x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_swin-s_fpn_fp16_3x_det_bdd100k.py
- Paper Swin Transformer (arXiv:2103.14030): https://arxiv.org/abs/2103.14030
- Pesos ImageNet del backbone: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_small_patch4_window7_224.pth
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-swin-s-fpn-fp16-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
