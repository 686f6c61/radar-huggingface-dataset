# Farhan2000/skin-lesion-classifier-resnet18

## Resumen

El skin-lesion-classifier-resnet18 es un clasificador de imágenes dermatoscópicas desarrollado por el usuario Farhan2000 y publicado en HuggingFace. Se trata de un ResNet18 estándar de torchvision al que se le ha sustituido la cabeza de clasificación original (1000 clases de ImageNet) por una capa lineal de 7 salidas, correspondientes a las siete categorías diagnósticas del dataset HAM10000: queratosis actínica, carcinoma basocelular, lesiones benignas queratosis-like, dermatofibroma, nevos melanocíticos, melanoma y lesiones vasculares. El autor lo declara explícitamente como proyecto educativo y no como dispositivo médico ni herramienta de diagnóstico.

El modelo resuelve una tarea de clasificación multiclase sobre imágenes únicas, no de generación de texto ni de razonamiento. Su relevancia es la de un ejemplo reproducible y ligero de transferencia de aprendizaje aplicada a imagen médica: un backbone convolucional de pequeño tamaño (en torno a 11,2 millones de parámetros y unos 45 MB en float32) que puede ejecutarse en CPU y que sirve como punto de partida para experimentar con pipelines de clasificación dermatológica. La model card reporta una exactitud de validación de 0,8937, sin desglose por clase ni detalle del protocolo de evaluación.

No se trata de un modelo de lenguaje: no tiene ventana de contexto, no soporta tool calling, no genera texto y no procesa lenguaje natural. Cualquier comparación con modelos generativos o multimodales de gran tamaño carece de sentido; su categoría real es la de los clasificadores de imagen convolucionales pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN con bloques residuales) de torchvision, con capa final `nn.Linear(512, 7)` |
| Parametros totales | Aproximadamente 11,2 millones (derivado de la arquitectura ResNet18 estandar con cabeza de 7 clases; no declarado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes; entrada tipica de 224x224 pixeles RGB, no declarada explicitamente) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye unicamente `model.pth` en precision nativa de PyTorch) |
| Idiomas soportados | No aplica (clasificacion de imagenes); el campo de idiomas figura como no disponible |
| Licencia | MIT |
| Formato de pesos | `model.pth` (state dict de PyTorch, `torch.load`); no se ofrecen safetensors, GGUF, ONNX ni TensorRT en el repositorio |

Datos adicionales: el repositorio ocupa 0,0 GB segun HuggingFace, el pipeline declarado es `image-classification`, la region de metadatos es `us` y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un ResNet18 sin modificar en el cuerpo: 18 capas con conexiones residuales organizadas en cuatro etapas de bloques BasicBlock, con normalizacion por lotes y activaciones ReLU, seguido de un pooling global promedio y una capa completamente conectada. El autor reemplaza la cabeza original de 1000 clases por `torch.nn.Linear(model.fc.in_features, 7)`, de modo que el modelo emite 7 logits, uno por clase del dataset. El modelo se carga con `weights=None` y posteriormente se sobrescriben los pesos con el state dict descargado mediante `hf_hub_download`.

El entrenamiento se realizo sobre el dataset HAM10000, enlazado en la model card a traves del repositorio `marmal88/skin_cancer`. El dataset HAM10000 contiene del orden de 10.000 imagenes dermatoscopicas anotadas por expertos en las siete categorias empleadas y esta fuertemente desbalanceado (el melanoma y el dermatofibroma estan muy infrarrepresentados frente a los nevos melanociticos). La model card no especifica el numero de epocas, el optimizador, la tasa de aprendizaje, la estrategia de aumento de datos, el esquema de particion train/validacion/test ni si se aplicaron tecnicas de reequilibrado de clases o perdidas ponderadas. Tampoco hay constancia de calibracion, validacion externa ni evaluacion cruzada. No se menciona ningun uso de RLHF, DPO ni tecnicas equivalentes, logicamente inaplicables a un clasificador de imagenes.

La unica innovacion tecnica reseñable es el uso de aprendizaje por transferencia desde pesos de ImageNet, aunque la model card no aclara si el backbone se inicializo con pesos preentrenados, congelo parcialmente durante el ajuste fino o se entreno desde cero.

## Capacidades

- Clasificacion de imagenes dermatoscopicas en 7 clases mutuamente excluyentes: queratosis actinica, carcinoma basocelular, lesiones benignas tipo queratosis, dermatofibroma, nevos melanociticos, melanoma y lesiones vasculares.
- Salida de logits crudos por clase, apta para aplicar `softmax` y obtener probabilidades, aunque el modelo no incluye calibracion documentada.
- Inferencia sobre una unica imagen por peticion (el ejemplo de carga no contempla procesamiento por lotes, aunque tecnicamente es posible).
- Ejecucion en CPU, dado el reducido tamano del modelo.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- No procesa texto, audio, video ni secuencias multimodales.
- No dispone de modo de razonamiento explicito (thinking mode).
- No genera lenguaje natural, por lo que no produce informes ni justificaciones de la prediccion.

## Casos de uso

- Docencia y practica de transferencia de aprendizaje: el modelo sirve como ejemplo minimo y reproducible de ajuste fino de un backbone clasico sobre un dataset medico, con un script de carga de pocas lineas.
- Prototipado de interfaces de triaje dermatologico: se puede integrar como clasificador de primera pasada en un prototipo de aplicacion que ordene imagenes por probabilidad de melanoma, siempre con supervision clinica y sin uso diagnostico.
- Pruebas de pipelines de gestion de imagenes medicas: su tamano permite validar extremo a extremo la carga, el preprocesado, la inferencia y el almacenamiento de predicciones en un entorno de desarrollo sin necesidad de GPU.
- Benchmark interno de referencia: al ser un ResNet18 con exactitud de validacion declarada de 0,8937, resulta util como linea base contra la que medir arquitecturas mas modernas (EfficientNet, ConvNeXt, ViT) sobre el mismo dataset.
- Analisis de desbalanceo de clases: el modelo permite estudiar en un caso real como un dataset con clases infrarrepresentadas afecta a las metricas agregadas, comparando la exactitud global con matrices de confusion por clase.
- Automatizacion de etiquetado asistido: en un flujo de anotacion, las predicciones pueden preordenar imagenes para que un dermatologo las revise, reduciendo el tiempo de clasificacion manual inicial.
- Experimentacion con cuantizacion y despliegue en el borde: dado su tamano reducido, es un candidato adecuado para probar exportacion a ONNX, TorchScript o TensorRT y medir el impacto en latencia y precision.
- Investigacion educativa sobre sesgos en imagen medica: permite ilustrar como un modelo entrenado en una unica fuente (HAM10000, mayoritariamente poblacion europea/australiana) generaliza mal a otras poblaciones o a imagenes tomadas con otros dispositivos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Fuente |
|---|---|---|---|
| Exactitud de validacion | 0,8937 | Validacion de HAM10000 | Model card del autor |
| Exactitud por clase (sensibilidad, especificidad) | No disponible | No disponible | No publicada |
| Matriz de confusion | No disponible | No disponible | No publicada |
| AUC-ROC | No disponible | No disponible | No publicada |
| Resultados en conjuntos externos | No disponible | No disponible | No publicada |

No se han publicado mas resultados de benchmarks en la informacion disponible. La unica cifra reportada es la exactitud de validacion de 0,8937, sin que se detalle el tamano del conjunto de validacion, la particion empleada ni si hubo fuga de datos entre entrenamiento y validacion.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en float32 (pesos de aproximadamente 45 MB mas activaciones de una imagen de 224x224). En float16 o int8 el consumo baja a decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; una RTX 3060, RTX 4060 o superior ofrece un margen enorme. Las GPU de datacenter (A100, H100) solo tienen sentido si se procesan lotes muy grandes en paralelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4090 y cualquier integrada moderna con soporte CUDA o ROCm. Tambien funciona en CPU sin problemas.
- Almacenamiento: el repositorio ocupa 0,0 GB segun HuggingFace, coherente con un unico fichero de pesos de decenas de MB.
- Opciones de despliegue: PyTorch nativo, TorchScript, exportacion a ONNX con ONNX Runtime, TensorRT para maximizar throughput, TorchServe o FastAPI como envoltorio HTTP. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, es razonable esperar latencias de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas que deben medirse en el entorno objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Rendimiento en HAM10000 | Disponibilidad |
|---|---|---|---|---|---|---|
| skin-lesion-classifier-resnet18 | Aproximadamente 11,2 M | Imagen (224x224 tipico) | No aplica | MIT | 0,8937 de exactitud de validacion (autor) | HuggingFace, 0 descargas |
| ResNet50 preentrenado en ImageNet | Aproximadamente 25,6 M | Imagen (224x224) | No aplica | Segun implementacion de torchvision | No disponible en la informacion proporcionada | torchvision, ampliamente disponible |
| EfficientNet-B0 | Aproximadamente 5,3 M | Imagen (224x224) | No aplica | Segun implementacion de torchvision | No disponible en la informacion proporcionada | torchvision, ampliamente disponible |
| ConvNeXt-Tiny | Aproximadamente 28 M | Imagen (224x224) | No aplica | Segun implementacion de torchvision | No disponible en la informacion proporcionada | torchvision, ampliamente disponible |
| DenseNet-121 | Aproximadamente 8 M | Imagen (224x224) | No aplica | Segun implementacion de torchvision | No disponible en la informacion proporcionada | torchvision, ampliamente disponible |

No se dispone de resultados comparativos de estos modelos sobre HAM10000 en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato de entrada y licencia. Cualquier afirmacion sobre que arquitectura rinde mejor en esta tarea requeriria una evaluacion propia con el mismo protocolo de particion.

## Limitaciones y advertencias

- Proyecto educativo declarado explicitamente por el autor: no es un dispositivo medico, no tiene marcado CE ni aprobacion de la FDA, y no debe usarse para diagnostico ni para decisiones clinicas.
- Exactitud de 0,8937 reportada sin desglose por clase: en un dataset tan desbalanceado como HAM10000, una exactitud global alta puede convivir con una sensibilidad muy baja en las clases minoritarias, melanoma incluido. Esta es la limitacion mas critica y no esta cuantificada.
- Riesgo elevado de falsos negativos en melanoma: dado el desbalanceo del dataset de entrenamiento y la ausencia de metricas por clase, no hay evidencia de que el modelo detecte adecuadamente la clase clinicamente mas relevante.
- Ausencia de validacion externa: no hay resultados en conjuntos de datos distintos de HAM10000 ni pruebas de generalizacion entre poblaciones, fototipos de piel, dispositivos de captura o condiciones de iluminacion.
- Sesgo demografico probable: HAM10000 procede mayoritariamente de poblaciones de Australia y Europa central, con fototipos claros, y esta sesgado hacia la dermatoscopia especializada.
- Dependencia del preprocesado: la model card no documenta la normalizacion, el redimensionado ni los valores de media y desviacion empleados en el entrenamiento. Replicar la inferencia con un preprocesado distinto puede degradar gravemente los resultados.
- Ausencia de calibracion: no se han publicado estudios de calibracion, por lo que las probabilidades de salida no deben interpretarse como niveles de confianza fiables.
- Idioma: no aplica, el modelo no procesa texto, pero conviene recordar que no puede generar explicaciones ni informes que acompañen a la prediccion.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia permisiva no exime de las obligaciones regulatorias aplicables a cualquier software con finalidad sanitaria.
- Huella publica minima: 0 descargas y 0 likes en HuggingFace, sin paper, sin repositorio de codigo de entrenamiento ni documentacion del proceso. La trazabilidad es practicamente nula.
- Fechas de metadatos inusuales: los campos de creacion y actualizacion registran 2026-09-18, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Farhan2000/skin-lesion-classifier-resnet18
- Dataset HAM10000 referenciado en la model card: https://huggingface.co/datasets/marmal88/skin_cancer
- Dataset original HAM10000 (ISIC Archive, referencia general): https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DBW86T
- Repositorio de torchvision (arquitectura ResNet18): https://github.com/pytorch/vision
- Documentacion de huggingface_hub para la descarga de pesos: https://huggingface.co/docs/huggingface_hub

Nota: los resultados de busqueda web realizados no aportaron enlaces especificos del modelo, el paper de entrenamiento ni un repositorio de codigo asociado. No se ha localizado publicacion cientifica, demo ni espacio de HuggingFace vinculado a este identificador.
