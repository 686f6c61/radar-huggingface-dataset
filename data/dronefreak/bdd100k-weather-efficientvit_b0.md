# dronefreak/bdd100k-weather-efficientvit_b0

## Resumen

EfficientViT-B0 fine-tuned on BDD100K Weather Classification es un clasificador de imagenes de escenas de conduccion que predice la condicion meteorologica a partir de una unica fotografia de calle. Lo desarrolla el usuario dronefreak como parte de BDD100K-Toolkit, una herramienta para preparar el dataset BDD100K, entrenar modelos sobre el y evaluarlos con las mismas metricas y los mismos splits. El modelo parte del backbone preentrenado timm/efficientvit_b0.r224_in1k y se ajusta para resolver una tarea de 7 clases: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown, derivadas del campo attributes.weather de BDD100K.

Se trata de un modelo muy pequeno (2,1 millones de parametros) basado en la arquitectura EfficientViT-B0, un vision transformer hibrido con atencion lineal multiescala disenado para ser eficiente en dispositivos con recursos limitados. Con una resolucion de entrada fija de 224x224 pixeles y pesos almacenados en un unico checkpoint PyTorch (.pt), esta pensado para clasificacion rapida en tiempo real, no para generacion de texto ni tareas multimodales.

Su relevancia actual reside en el nicho de la conduccion autonoma y el analisis de escenas de trafico: conocer la meteorologia ayuda a los sistemas de percepcion a anticipar condiciones adversas. Los resultados publicados por el autor muestran un Top-1 del 82,79% y un Top-5 del 99,79% sobre el split de test, con un F1 macro de 65,10%, en la misma horquilla que alternativas como ResNet-18, MobileNetV4-Conv-Small o ConvNeXt-Atto evaluadas en el mismo banco de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-B0 (vision transformer hibrido con atencion lineal multiescala) |
| Parametros totales | 2,1 M |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (entrada de imagen fija de 224x224 px) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en FP32; sin variantes GGUF, ONNX o cuantizadas publicadas) |
| Idiomas soportados | no aplicable (clasificacion de imagenes; etiquetas de clase en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo se basa en EfficientViT-B0, la variante mas pequena de la familia EfficientViT. EfficientViT sustituye la atencion softmax clasica por una atencion lineal multiescala y combina bloques convolucionales depthwise ligeros con capas de atencion en una disposicion tipo "sandwich", lo que reduce el coste computacional manteniendo la capacidad de modelar contexto global. Con 2,1 M de parametros y una resolucion de entrada de 224x224, el modelo es extremadamente ligero. El backbone original fue preentrenado sobre ImageNet-1k y despues ajustado para la tarea de meteorologia.

El ajuste se realizo sobre el dataset dronefreak/BDD100K-Weather-Classification, derivado del campo attributes.weather de BDD100K. Segun la informacion publicada, el entrenamiento tuvo un maximo de 50 epocas y se detuvo a las 17, siendo la epoca 7 la que produjo el mejor checkpoint (best.pt), seleccionado por F1 macro. El checkpoint almacena tanto el nombre del modelo timm como los nombres de las clases, la resolucion de imagen y los valores de normalizacion (media y desviacion tipica) usados en el preprocesado. No se especifican en la model card el optimizador, el learning rate, el tamano de lote ni las tecnicas de aumento de datos empleadas; estos datos figuran como no disponibles. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo que no aplica en un clasificador de imagenes.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en 7 clases meteorologicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Reconocimiento de condiciones de iluminacion y meteorologia adversas (lluvia, nieve) a partir de una unica fotografia de calle.
- Inferencia muy rapida por su tamano reducido (2,1 M de parametros), apta para ejecucion en tiempo real.
- Compatible con el ecosistema timm: se instancia con `timm.create_model` y se cargan pesos mediante `torch.load`.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, generacion de texto ni otras capacidades de modelos generativos.
- No dispone de capacidades multilingues ni de vision mas alla de la clasificacion (no detecta objetos ni segmenta).

## Casos de uso

- Percepcion para conduccion autonoma: el modelo clasifica la meteorologia de la escena en tiempo real para que el sistema de conduccion adapte su comportamiento (por ejemplo, aumentar la distancia de seguridad o reducir velocidad con lluvia o nieve).
- Preprocesado de datasets de conduccion: etiquetar automaticamente imagenes de trafico por condicion meteorologica antes de entrenar otros modelos, reduciendo el trabajo manual de anotacion.
- Monitorizacion de flotas y telematica: analizar fotos o fotogramas de camaras a bordo para registrar en que condiciones meteorologicas se producen incidentes o rutas.
- Sistemas avanzados de asistencia al conductor (ADAS) de bajo coste: al ser un modelo de 2,1 M de parametros, puede integrarse en unidades ECU o dispositivos embebidos con recursos muy limitados.
- Control de calidad en pipelines de captura de datos: detectar automaticamente condiciones de mal tiempo para priorizar o descartar muestras en conjuntos de datos de gran tamano.
- Segmentacion de datasets por escenario: usar la etiqueta meteorologica como metadato para entrenar o evaluar modelos especializados (por ejemplo, deteccion de objetos solo en condiciones de lluvia).
- Modulo auxiliar en robotica movil en exterior: aportar contexto meteorologico a un sistema de navegacion que opere en vias publicas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (10.000 imagenes). No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 82,79% |
| Top-5 accuracy | 99,79% |
| F1 macro | 65,10% |
| Balanced accuracy / recall macro | 63,62% |
| Precision macro | 67,11% |

Rendimiento por clase (test):

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 89,67% | 93,49% | 91,54% | 5.346 |
| foggy | 0,00% | 0,00% | 0,00% | 13 |
| overcast | 69,24% | 65,78% | 67,47% | 1.239 |
| partly cloudy | 68,19% | 64,50% | 66,30% | 738 |
| rainy | 86,10% | 69,65% | 77,00% | 738 |
| snowy | 86,24% | 72,56% | 78,81% | 769 |
| unknown | 70,34% | 79,34% | 74,57% | 1.157 |

Comparativa con otros modelos del mismo model zoo (mismo split de test, ordenado por Top-1):

| Modelo | Top-1 | F1 macro | Balanced acc | Precision macro |
|---|---|---|---|---|
| ConvNeXt-Atto | 83,00% | 67,44% | 65,25% | 81,38% |
| EfficientViT-B0 | 82,79% | 65,10% | 63,62% | 67,11% |
| ResNet-18 | 82,19% | 64,30% | 62,97% | 66,08% |
| MobileNetV4-Conv-Small | 82,16% | 66,51% | 64,37% | 80,44% |
| YOLO26n | 82,04% | 64,09% | 62,46% | 66,57% |
| YOLO11n | 81,32% | 62,91% | 61,19% | 65,68% |
| YOLOv8n | 81,22% | 63,07% | 61,42% | 65,52% |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 2,1 M de parametros en FP32, el checkpoint ocupa del orden de 8-9 MB; en inferencia puede ejecutarse con apenas unos cientos de MB contando el runtime de PyTorch y los tensores intermedios de una imagen de 224x224.
- GPU recomendadas: cualquier GPU moderna sirve. Una RTX 4090, A100 o H100 lo ejecutan sin dificultad, aunque estan sobredimensionadas para este tamano de modelo. Es perfectamente viable en GPUs de gama de entrada.
- Cabe en GPU de consumo: si, de forma holgada, y tambien en CPU. Su tamano permite despliegue en dispositivos embebidos (Jetson, Raspberry Pi con acelerador, etc.).
- Opciones de despliegue: libreria timm + PyTorch (uso directo segun el ejemplo de la model card), TorchScript, ONNX Runtime o TensorRT tras conversion. El repositorio no publica variantes GGUF, Ollama ni vLLM, y estos formatos no son habituales para clasificadores de imagenes.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por su tamano, se espera una latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Top-1 | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EfficientViT-B0 (este) | 2,1 M | 224x224 | 82,79% | 65,10% | Apache-2.0 | HuggingFace (timm) |
| ConvNeXt-Atto | no disponible | no disponible | 83,00% | 67,44% | no disponible | dentro del model zoo |
| ResNet-18 | no disponible | no disponible | 82,19% | 64,30% | no disponible | dentro del model zoo |
| MobileNetV4-Conv-Small | no disponible | no disponible | 82,16% | 66,51% | no disponible | dentro del model zoo |

Los cuatro modelos forman parte del mismo model zoo de BDD100K-Toolkit y se evaluaron sobre el mismo split de test, por lo que la comparacion es homogenea. EfficientViT-B0 ocupa el segundo puesto por Top-1 y el tercero por F1 macro, con un rendimiento muy cercano a ConvNeXt-Atto pese a su menor complejidad. No se dispone de datos de parametros, licencia ni entrada para el resto de modelos del zoo mas alla de sus metricas.

## Limitaciones y advertencias

- La clase foggy es un caso fallido: con solo 13 imagenes en test, el modelo no acierta ninguna (precision, recall y F1 del 0%). Debe tratarse como clase no soportada.
- Fuerte desbalance de clases en el dataset (5.346 imagenes de clear frente a 13 de foggy), lo que explica el buen Top-1 global pero un F1 macro bastante inferior (65,10%).
- Riesgo de confusion entre clases visualmente proximas (overcast y partly cloudy rondan el 64-69% de F1), con precision y recall moderados.
- Sesgo geografico y de dominio: el modelo se entrena con BDD100K, capturado en geografias, camaras y condiciones concretas; puede degradarse en otros paises, sensores o encuadres.
- Riesgo de alucinacion no aplicable (es un clasificador, no genera texto), pero si existe riesgo de clasificacion erronea en condiciones de iluminacion o meteorologia ambiguas.
- Licencia Apache-2.0, permisiva y apta para uso comercial, siempre que se respeten las condiciones de atribucion y las licencias del dataset subyacente (BDD100K tiene sus propias condiciones de uso).
- Tarea no oficial: el autor indica que se trata de una tarea no oficial construida a partir del campo attributes.weather de BDD100K, siguiendo el dataset de Kaggle del mismo nombre; no forma parte de los benchmarks oficiales de BDD100K.
- Metricas no verificadas de forma independiente (campo verified: false en todos los resultados).
- No se declaran idiomas ni datos multilingues; las etiquetas de clase estan en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_b0
- Repositorio BDD100K-Toolkit (codigo fuente de entrenamiento y evaluacion): https://github.com/dronefreak/bdd100k-toolkit
- Dataset de meteorologia usado: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Paper de EfficientViT: https://arxiv.org/abs/2205.14756
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Modelo base en timm: https://huggingface.co/timm/efficientvit_b0.r224_in1k
- Post del autor sobre el model zoo de BDD100K: https://huggingface.co/posts/dronefreak/988753800362571
- Coleccion de modelos de deteccion de objetos BDD100K del autor: https://huggingface.co/collections/dronefreak/bdd100k-object-detection-model-zoo
- Toolkit oficial de BDD100K (Berkeley): https://github.com/bdd100k/bdd100k
- Model zoo oficial de BDD100K (SysCV): https://github.com/SysCV/bdd100k-models
