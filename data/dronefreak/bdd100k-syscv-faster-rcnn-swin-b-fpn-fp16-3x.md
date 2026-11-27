# dronefreak/bdd100k-syscv-faster-rcnn-swin-b-fpn-fp16-3x

## Resumen

Faster R-CNN con backbone Swin-B y cuello FPN, entrenado sobre BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un detector de objetos de dos etapas en formato MMDetection, publicado como espejo del zoo de modelos de SysCV (ETH Zurich) despues de que su servidor `dl.cv.ethz.ch` quedase fuera de linea. Los pesos se recuperaron de la Wayback Machine (captura del 19 de febrero de 2025) y se acompanan de una configuracion fijada y un script de inferencia.

El checkpoint contiene 104.197.394 parametros y ocupa 1,8 GB en el repositorio. Trabaja a la resolucion nativa de BDD100K (1280 x 720) sin reescalado y detecta diez clases de trafico: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. Su interes actual es practico: es una referencia reproducible para evaluar pipelines de deteccion en conduccion autonoma cuando el host original ya no esta disponible.

La relevancia es acotada pero clara. Frente a detectores de una etapa mas modernos, este modelo ofrece una linea base solida (33,5 AP en validacion) con un stack MMDetection 2.x perfectamente fijado, lo que facilita la comparacion historica y la reproduccion de resultados en entornos legacy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone Swin Transformer Base (Swin-B), cuello FPN y cabecera de deteccion estandar |
| Parametros totales | 104.197.394 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | FP16 (entrenamiento con precision mixta); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | BDD100K (`other`): uso educativo, de investigacion y sin animo de lucro; la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; configuracion MMDetection en Python |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos y una cabecera los clasifica y refina. El backbone es Swin-B, un transformer jerarquico con atencion por ventanas desplazadas (paper arXiv:2103.14030, ICCV 2021), inicializado con pesos de ImageNet-22k (`swin_base_patch4_window7_224_22k.pth`). Sobre el backbone se anade una FPN que combina caracteristicas multiescala.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con AdamW, learning rate 0,0001, weight decay 0,05, decaimiento en las epocas 27 y 33, batch de 32 (8 GPU x 2 imagenes) y precision mixta FP16. Se aplica entrenamiento multiescala con 6 escalas entre (1280, 600) y (1280, 720). La inferencia usa umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen.

La verificacion del espejo es notable: el MD5 de los pesos (`042818cf1c65a3730a99c131a0cfdecb`) coincide con el archivo MD5 de SysCV y todas las claves cargan en su configuracion. En una comparacion sobre 20 imagenes aleatorias de validacion, 19 de las 605 cajas publicadas son identicas y 604 coinciden con IoU >= 0,5; la mayor diferencia de score es 0,0310. El autor declara que la causa no se investigo y que el entorno CUDA no se ha probado.

## Capacidades

- Deteccion de objetos en imagenes y video de escenas de conduccion, con 10 clases de BDD100K.
- Procesamiento de imagenes sueltas, carpetas de imagenes, archivos de video y flujo de webcam (0) mediante `infer.py`.
- Salida en formato BDD100K mediante `--json out.json`, ademas de visualizacion.
- Control de umbral de score (`--score-thr`, por defecto 0,3) y limite de frames (`--max-frames`).
- Deteccion multiescala gracias a la FPN, con rendimiento declarado por clase desde 7,1 AP (train) hasta 51,4 AP (car).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues: es exclusivamente un modelo de vision por computador.

## Casos de uso

- Linea base para investigacion en deteccion sobre BDD100K: permite reproducir los numeros de SysCV con un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y comparar variantes propias contra una referencia estable.
- Analisis de video de trafico: `infer.py drive.mov` procesa clips completos y exporta detecciones en JSON, util para contar vehiculos y peatones por fotograma en estudios de movilidad.
- Auditoria de datasets de conduccion: al estar entrenado solo con BDD100K, sirve para detectar imagenes fuera de dominio o etiquetas sospechosas en otros conjuntos de escenas viales.
- Prototipado de sistemas ADAS en CPU: con 3,4 s/imagen en 8 hilos de CPU, es viable para pruebas offline sin GPU, por ejemplo en la validacion de pipelines de preprocesado.
- Demostracion y docencia: el repositorio incluye video de demostracion con detecciones en clips diurnos y nocturnos, lo que facilita explicar el funcionamiento de un detector de dos etapas en clase.
- Evaluacion de robustez dia/noche: los clips de ejemplo cubren condiciones de iluminacion distintas, lo que permite medir la caida de rendimiento en escenarios nocturnos antes de desplegar un detector propio.
- Migracion de stacks legacy: util para equipos que aun mantienen MMDetection 2.x y necesitan un checkpoint verificado con MD5 y predicciones de validacion archivadas.

## Benchmarks y rendimiento

Resultados COCO-style box AP (%) en BDD100K, declarados por SysCV y no verificados de forma independiente (`verified: false` en la model card):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,5 | 59,2 | 32,1 | 15,8 | 38,5 | 55,9 |
| test | 32,7 | 57,3 | 32,2 | 16,4 | 38,1 | 50,7 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 36,2 |
| rider | 28,9 |
| car | 51,4 |
| truck | 44,2 |
| bus | 48,7 |
| train | 7,1 |
| motorcycle | 27,7 |
| bicycle | 27,0 |
| traffic light | 25,1 |
| traffic sign | 39,0 |

El model-index del repositorio declara ademas un Box AP de validacion de 34,46, ligeramente distinto del 33,5 de la tabla de SysCV; la discrepancia no se explica en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 104 M de parametros en FP16 el peso de los pesos ronda los 0,2 GB, y el consumo real dependera del tamano de lote y de las activaciones a 1280 x 720.
- GPU recomendadas: no se especifican; el autor solo confirma que el entorno CUDA no se ha probado y que la verificacion se hizo en CPU.
- CPU: 3,4 s/imagen con 8 hilos, segun la model card.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no hay medicion publicada de VRAM en tarjetas como RTX 4090.
- Despliegue: entorno fijado con Python 3.10, torch 2.0.1, mmcv-full 1.7.2 y mmdetection 2.28.2; instalacion via `uv` con `env/requirements-cu118.txt` (GPU NVIDIA) o `env/requirements-cpu.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector MMDetection).
- Latencia y throughput: solo el dato de CPU mencionado; no hay cifras de GPU.

## Comparativa con modelos similares

No se han publicado comparativas con otros detectores en la informacion disponible. Como referencia cualitativa, dentro del propio zoo de SysCV existen variantes de deteccion sobre BDD100K con otros backbones, pero no se aportan sus cifras en esta ficha.

| Modelo | Parametros | Contexto/entrada | AP val (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN Swin-B-FPN FP16 3x) | 104,2 M | 1280 x 720 | 33,5 | BDD100K (uso no comercial) | Hugging Face, espejo verificado |
| Otras variantes del zoo SysCV | no disponible | no disponible | no disponible | Apache-2.0 (config) | Host original offline |
| Detectores de una etapa modernos | no disponible | no disponible | no disponible | variable | no disponible |

## Limitaciones y advertencias

- Licencia BDD100K: solo permite uso educativo, de investigacion y sin animo de lucro; el uso comercial requiere revisar los terminos del dataset original.
- Entrenado exclusivamente con BDD100K (escenas de conduccion), por lo que el rendimiento fuera de ese dominio no esta caracterizado.
- Clases con muy bajo rendimiento: train obtiene 7,1 AP, y traffic light (25,1) y bicycle (27,0) son debiles; no es adecuado para tareas que dependan de esas clases.
- El autor declara que la diferencia frente a las predicciones originales de SysCV (mayor diferencia de score 0,0310) no se investigo, lo que introduce una incertidumbre residual en la reproducibilidad exacta.
- El entorno CUDA no se ha probado; solo se verifico la inferencia en CPU.
- Riesgo de sesgo por el dataset: condiciones de captura, geografia y horarios de BDD100K condicionan las detecciones.
- No es un modelo generativo: no alucina texto, pero puede producir falsos positivos y cajas mal localizadas en objetos pequenos (APs de 15,8 en validacion).
- Requiere un stack antiguo (MMDetection 2.x, torch 2.0.1) que puede entrar en conflicto con otros proyectos; se recomienda un entorno virtual aislado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-b-fpn-fp16-3x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_swin-b_fpn_fp16_3x_det_bdd100k.py
- Paper de Swin Transformer: https://arxiv.org/abs/2103.14030
- Pesos ImageNet del backbone: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_base_patch4_window7_224_22k.pth
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-b-fpn-fp16-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
