# dronefreak/bdd100k-mmdet-cascade-rcnn-r101-fpn-1x

## Resumen

Cascade R-CNN R101-FPN 1x sobre BDD100K es un detector de objetos de dos etapas (Cascade R-CNN con tres cabeceras en cascada) con backbone ResNet-101 y cuello FPN, entrenado por el equipo de BDD100K en 2020 para la deteccion de objetos en escenas de conduccion. Este repositorio, publicado por el usuario dronefreak, es un espejo (mirror) de los pesos oficiales originalmente alojados en el servidor de descargas de Berkeley, que se distribuian sin documentacion alguna. La model card actua precisamente como esa documentacion que faltaba: describe el entorno de ejecucion fijado, un script de inferencia y un proceso de verificacion de integridad.

El modelo resuelve la deteccion de clases relevantes para conduccion autonoma (vehiculos, peatones, senales de trafico, semaforos, ciclistas) sobre imagenes de dashcam en condiciones de dia y noche. Con 88,3 millones de parametros y un mAP@50:95 de 31,3 en el split de validacion de BDD100K, es un baseline clasico de 2020, no un modelo de ultima generacion. Su relevancia actual es practica: pocos checkpoints antiguos de mmdetection siguen siendo ejecutables hoy, y este repositorio fija las versiones (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) para que el modelo siga funcionando en hardware moderno.

No es un modelo de lenguaje ni un modelo generativo: es un detector puro de vision por computador en formato PyTorch/mmdetection, pensado para integrarse en pipelines de percepcion de vehiculos o en investigacion sobre deteccion en escenas de conduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN (3 etapas) con backbone ResNet-101 + FPN |
| Parametros totales | 88.276.988 (88,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, sin ventana de texto) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en precision original) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | bdd100k (license: other; ver LICENSE.txt en el repositorio) |
| Formato de pesos | safetensors y checkpoint PyTorch (.pth, cargado con torch.load(weights_only=True)) |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena tres cabeceras de clasificacion y regresion con umbrales de IoU crecientes, de modo que cada etapa refina las propuestas de la anterior. El backbone es una ResNet-101 inicializada con pesos de ImageNet de torchvision, y el cuello es un Feature Pyramid Network (FPN) que aporta representaciones multiescala. El modelo se entreno sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (configuracion 1x), con SGD, learning rate 0.02 y decaimientos en las epocas 8 y 11. El entrenamiento original uso PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 sobre GPUs TITAN Xp, datos todos ellos registrados en el propio checkpoint.

La innovacion de este repositorio no esta en el modelo sino en la ingenieria de reproducibilidad: fija un entorno moderno que aun ejecuta la pila de mmdetection 2.x (Python 3.10, torch 2.0.1, CUDA 11.8 o CPU, mmcv-full 1.7.2, mmdetection 2.28.2) e incluye un script de inferencia que carga los pesos con `weights_only=True`, de modo que el checkpoint no puede ejecutar codigo. La verificacion reportada compara contra las predicciones de test publicadas por los autores en 20 imagenes aleatorias: 646 cajas frente a 647, con coincidencia de clase e IoU >= 0.5, IoU minimo 1.0000 y diferencia maxima de score 0.0000 (la discrepancia de una caja no fue investigada). La integridad del fichero se garantiza con SHA-256 `8f6ef242938fc6fd49c5aaed6eec36c5ef76065136cf9d0efc84e3bdb8d3eb44`.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion (vehiculos, peatones, ciclistas, senales de trafico, semaforos y clases equivalentes de BDD100K).
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam (via `infer.py`).
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json`.
- Umbral de score configurable (por defecto 0,3) y limite de frames para video (`--max-frames`).
- Funcionamiento en CPU y en GPU (el entorno CUDA 11.8 esta preparado pero no verificado segun la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion.

## Casos de uso

- Percepcion en prototipos de conduccion autonoma: el modelo detecta vehiculos, peatones y senales sobre frames de dashcam, y sirve como baseline de referencia frente a detectores mas modernos en experimentos academicos.
- Analisis de video de trafico grabado: `infer.py` procesa ficheros de video completos y exporta las cajas en JSON, lo que permite contar objetos por frame o reconstruir trayectorias en estudios de movilidad.
- Etiquetado asistido (pre-anotacion): generar detecciones con umbral bajo y revisarlas manualmente acelera la creacion de datasets propios de escenas de conduccion.
- Investigacion en robustez nocturna: al estar entrenado sobre BDD100K, que incluye imagenes nocturnas, resulta util para estudiar la degradacion de detectores en condiciones de baja iluminacion.
- Benchmark de reproducibilidad: sirve como referencia fija para comparar el impacto de cambios de entorno (versiones de torch, mmcv, GPU) sobre las mismas predicciones, gracias al proceso de verificacion documentado.
- Docencia y practicas de vision por computador: el entorno fijado y el script de inferencia permiten a estudiantes ejecutar un detector de dos etapas real sin resolver conflictos de dependencias.
- Integracion en pipelines de percepcion legacy: equipos que mantienen codigo basado en mmdetection 2.x pueden reutilizar este checkpoint sin migrar a la API 3.x.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 31,3 |
| mAP@50 (val) | 55,4 |
| mAP@75 (val) | 30,0 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 88,3 M de parametros en FP32 el peso de los tensores ronda los 350 MB, por lo que la VRAM necesaria es modesta (tipicamente por debajo de 4 GB con lotes pequenos), aunque el dato no esta confirmado en la model card.
- GPU recomendadas: el entrenamiento original uso TITAN Xp; para inferencia cualquier GPU NVIDIA con soporte CUDA 11.8 es suficiente. No se especifican A100, H100 ni RTX 4090 en la documentacion.
- Cabe en GPU de consumo: si, por el reducido numero de parametros; el repositorio incluye requisitos para CUDA 11.8 y para CPU.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 (unica pila verificada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo confirma que la ruta de CPU esta verificada y que la de CUDA 11.8 aun no se ha ejecutado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores sobre BDD100K (por ejemplo, variantes de Faster R-CNN, YOLO o RetinaNet) que permitan una comparacion numerica fiable. La comparativa queda como no disponible.

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cascade R-CNN R101-FPN 1x (este) | 88,3 M | no aplica | 31,3 | bdd100k | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de 2020: su rendimiento (31,3 mAP@50:95) esta muy por debajo de los detectores actuales; no debe tomarse como referencia de estado del arte.
- Entrenado exclusivamente sobre BDD100K (escenas de conduccion), por lo que generaliza mal fuera de ese dominio (interiores, imagenes aereas, otros paises o condiciones meteorologicas no representadas).
- Riesgo de falsos negativos y positivos en objetos pequenos, oclusiones y condiciones nocturnas o de baja visibilidad.
- La reproducibilidad exacta no esta garantizada: la verificacion reportada muestra una discrepancia de una caja frente a las predicciones originales de los autores, de causa no investigada.
- El entorno CUDA 11.8 no ha sido verificado; solo la ruta de CPU esta confirmada, lo que puede afectar al rendimiento en produccion.
- La licencia es "bdd100k" (license: other), no una licencia open source estandar; es imprescindible revisar LICENSE.txt antes de cualquier uso comercial, ya que BDD100K tiene terminos propios.
- El checkpoint se carga con `weights_only=True`, lo que es una medida de seguridad, pero no exime de auditar los scripts de inferencia antes de ejecutarlos.
- El repositorio incluye un video de demostracion con escenas de validacion; la model card indica que se comprobo frame a frame que no hubiera matriculas legibles ni rostros identificables, pero conviene tener en cuenta las implicaciones de privacidad al procesar video real.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-r101-fpn-1x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-r101-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Repositorio de mmdetection: https://github.com/open-mmlab/mmdetection
- Repositorio de mmcv: https://github.com/open-mmlab/mmcv
- Paper de Cascade R-CNN: no disponible en la informacion proporcionada
- Paper de BDD100K: no disponible en la informacion proporcionada
- Demo (video): https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-r101-fpn-1x/resolve/main/assets/demo_banner.mp4
