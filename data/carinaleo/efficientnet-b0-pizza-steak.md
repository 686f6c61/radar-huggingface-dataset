# CarinaLeo/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por CarinaLeo como proyecto de aprendizaje. Se trata de un fine-tuning por transferencia sobre EfficientNet-B0 preentrenado en ImageNet (via torchvision), al que se le sustituye la cabeza de clasificacion original por una nueva capa lineal (1280 a 1) con dropout de 0,2 y activacion sigmoide. El modelo distingue entre dos clases: pizza (indice 0) y steak (indice 1), devolviendo la probabilidad de que la imagen pertenezca a la clase steak.

El modelo es relevante unicamente como ejemplo didactico de transfer learning en vision por computador con PyTorch, no como herramienta de produccion. No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imagenes de proposito muy especifico, entrenado con 1.200 imagenes y validado con 300, con un conjunto de test de 500 imagenes. Su publicacion en HuggingFace con licencia MIT lo hace libremente reutilizable, pero su alcance funcional es extremadamente limitado.

La arquitectura subyacente, EfficientNet-B0, es una CNN con compound scaling que equilibra profundidad, anchura y resolucion, con aproximadamente 5,3 millones de parametros en su version original de ImageNet. El autor reporta una precision de test del 99,80%, si bien no se especifican detalles sobre la composicion del dataset ni sobre posibles fugas entre particiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN) con cabeza lineal binaria |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict) |
| Entrada | Imagen RGB (resolucion no especificada en la model card) |
| Salida | Probabilidad sigmoide (clase 1 = steak, clase 0 = pizza) |
| Libreria | PyTorch |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

El modelo parte de EfficientNet-B0 preentrenado en ImageNet, disponible en torchvision. EfficientNet-B0 es una red neuronal convolucional que emplea compound scaling para escalar de forma conjunta profundidad, anchura y resolucion de entrada, usando bloques MBConv con conexiones residuales y Squeeze-and-Excitation. La cabeza original de 1.000 clases se reemplaza por Dropout(0,2) seguido de Linear(1280, 1) y activacion sigmoide, produciendo una unica probabilidad binaria.

El entrenamiento se realizo en dos fases. En la fase 1 se congelo el backbone y se entreno solo la nueva cabeza con Adam (lr 0,001) durante 5 epocas. En la fase 2 se descongelaron los ultimos 3 bloques de caracteristicas y se continuo el entrenamiento con Adam (lr 0,0001) durante 5 epocas adicionales. La funcion de perdida fue BCEWithLogitsLoss con batch size 32, y se aplico aumento de datos consistente en random resized crop, volteo horizontal y color jitter. El conjunto de datos consta de 1.200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se menciona el uso de RLHF, DPO ni tecnicas de regularizacion adicionales mas alla del dropout y el data augmentation.

## Capacidades

- Clasificacion binaria de imagenes en dos categorias: pizza y steak.
- Devuelve una probabilidad continua (sigmoide) de pertenecer a la clase steak.
- Inferencia sobre imagenes RGB individuales mediante funcion `predict` incluida en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion de texto.
- No detecta objetos ni segmenta: solo clasifica la imagen completa en una de dos clases.

## Casos de uso

- Clasificacion de menus fotograficos en una aplicacion de demostracion: el modelo puede etiquetar imagenes de platos como pizza o steak, util para prototipos de catalogacion automatica de recetas o menus digitales con solo dos categorias.
- Filtrado en un dataset de imagenes de comida: sirve para separar rapidamente imagenes de pizza y steak en un pipeline de curacion de datos, siempre que el universo se limite a esas dos clases.
- Proyecto educativo de transfer learning: es un ejemplo completo y reproducible de fine-tuning de EfficientNet-B0 en PyTorch, adecuado para docencia o tutoriales sobre clasificacion de imagenes.
- Prueba de concepto en una app movil o web: dado su reducido tamano (~5,3 M de parametros en el backbone), puede ejecutarse en CPU o en dispositivos con recursos limitados para una demo interactiva de clasificacion de platos.
- Baseline para experimentos de vision: sirve como punto de partida para comparar tecnicas de aumento de datos, congelacion de capas o tasas de aprendizaje en tareas de clasificacion binaria.
- Clasificacion en un juego o experiencia interactiva: puede integrarse en una aplicacion ludica que pida al usuario fotografiar un plato y determine si es pizza o steak, con la advertencia de que siempre devolvera una de las dos clases.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (reportada por el autor) | 99,80% |
| Tamano del conjunto de test | 500 imagenes |
| Tamano del conjunto de entrenamiento | 1.200 imagenes |
| Tamano del conjunto de validacion | 300 imagenes |

No se han publicado resultados comparativos con otros modelos ni desglose por clase, matriz de confusion o metricas adicionales (F1, precision, recall) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el backbone EfficientNet-B0 (~5,3 M de parametros) mas la cabeza lineal; el modelo completo ocupa del orden de decenas de MB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una NVIDIA T4, RTX 3060 o incluso CPU es suficiente para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU y en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga via `torch.load` con el state dict), TorchScript, ONNX Runtime tras exportacion, o integracion en un servicio FastAPI/Flask. No se proporcionan pesos en formato GGUF ni soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia por imagen en GPU deberia ser de pocos milisegundos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/Entrada | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CarinaLeo/efficientnet-b0-pizza-steak | ~5,3 M (backbone) | Clasificacion binaria pizza/steak | Imagen RGB | 99,80% en test (500 imgs) | MIT | HuggingFace |
| EfficientNet-B0 (ImageNet, torchvision) | ~5,3 M | Clasificacion 1.000 clases | Imagen RGB | No comparable (otra tarea) | BSD-3-Clause (torchvision) | torchvision |
| ResNet-18 (ImageNet, torchvision) | ~11,7 M | Clasificacion 1.000 clases | Imagen RGB | No comparable (otra tarea) | BSD-3-Clause (torchvision) | torchvision |
| MobileNetV3-Small (ImageNet, torchvision) | ~2,5 M | Clasificacion 1.000 clases | Imagen RGB | No comparable (otra tarea) | BSD-3-Clause (torchvision) | torchvision |

No se dispone de comparativas directas con otros clasificadores binarios pizza/steak en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre devolvera una de ellas, incluso ante imagenes no relacionadas (lo indica el propio autor).
- No se especifica la composicion del dataset ni el origen de las imagenes, por lo que no se puede evaluar el riesgo de sesgo por clase, iluminacion, estilo de fotografia o procedencia geografica.
- La precision del 99,80% procede de un unico conjunto de test de 500 imagenes; no se aporta matriz de confusion ni validacion cruzada, por lo que la cifra debe tomarse con cautela.
- Riesgo de sobreajuste elevado dado el reducido tamano del dataset (1.200 imagenes de entrenamiento) y la precision casi perfecta reportada.
- No apto para uso comercial en produccion sin una evaluacion independiente: la licencia MIT permite uso comercial, pero la fiabilidad del modelo en dominios distintos al de entrenamiento no esta demostrada.
- No procesa texto ni soporta idiomas; cualquier caso de uso multilingue o multimodal queda fuera de su alcance.
- No se proporcionan pesos en formatos estandar de despliegue (ONNX, TorchScript) ni instrucciones de exportacion, lo que anade trabajo de integracion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CarinaLeo/efficientnet-b0-pizza-steak
- EfficientNet (paper original, Tan y Le, 2019): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
- huggingface_hub (descarga de pesos): https://huggingface.co/docs/huggingface_hub
