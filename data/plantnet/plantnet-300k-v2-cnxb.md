# PlantNet/plantnet-300k-v2-cnxb

## Resumen

PlantNet/plantnet-300k-v2-cnxb es un clasificador de imagenes de plantas con 1.000 especies, desarrollado por el equipo de Pl@ntNet (INRIA, CIRAD, INRAE y AMAP) mediante fine-tuning del modelo de vision facebook/dinov3-convnext-base-pretrain-lvd1689m. Resuelve una tarea concreta de vision por computador: identificar la especie de una planta a partir de una fotografia RGB de 224 × 224 pixeles, devolviendo tanto el logit de la clase como el embedding de 1024 dimensiones del encoder.

El modelo se apoya en la arquitectura ConvNeXt-Base de la familia DINOv3, un backbone convolucional preentrenado con autosupervision sobre el dataset LVD-1689M de Meta. El fine-tuning se ha realizado sobre Pl@ntNet-300K-v2, la segunda version del dataset Pl@ntNet-300K publicado en Zenodo, que se caracteriza por una fuerte ambiguedad de etiquetas y una distribucion de cola larga entre especies.

Es relevante ahora porque forma parte del trabajo recogido en el preprint arXiv:2604.27178 sobre monitoreo de plantas energeticamente eficiente mediante destilacion de conocimiento, y porque ofrece un punto de partida reproducible para tareas de clasificacion botanica con un rendimiento declarado de 0,8331 de accuracy en test. El repositorio ocupa 0,4 GB y distribuye los pesos en formato `model.pth` (PyTorch), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ConvNeXt-Base (backbone convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | dinov3-license (licencia de Meta para DINOv3, con acceso restringido) |
| Formato de pesos | `model.pth` (PyTorch); no se distribuyen safetensors ni GGUF |
| Clases | 1.000 especies |
| Dimension de embedding | 1024 |
| Tamano de entrada | 224 × 224 RGB |
| Accuracy validacion (mejor) | 0,8358 |
| Accuracy test | 0,8331 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un ConvNeXt-Base adaptado por DINOv3, la tercera generacion de los modelos de representacion visual autosupervisada de Meta. DINOv3 combina un preentrenamiento autosupervisado a gran escala sobre el dataset LVD-1689M con un backbone convolucional moderno; en este caso, el encoder ConvNeXt-Base produce un embedding de 1024 dimensiones por imagen. Sobre ese encoder se ha anadido una cabeza de clasificacion lineal para las 1.000 clases de especies de Pl@ntNet-300K-v2.

El fine-tuning se ha realizado sobre Pl@ntNet-300K-v2, un dataset de imagenes de plantas con etiquetas ambiguas y distribucion de cola larga, publicado en Zenodo (registro 10419064). La model card no detalla el numero de imagenes de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos, balanceo de clases o ajuste fino selectivo de capas. Tampoco se especifica si se congelo el encoder o se entreno de extremo a extremo. El preprocesado documentado consiste en redimensionado y recorte a 224 × 224 y normalizacion con media (0,4425, 0,4695, 0,3266) y desviacion tipica (0,2353, 0,2219, 0,2325), calculadas sobre el conjunto de fine-tuning.

La innovacion tecnica principal no reside en el modelo en si, sino en su papel dentro del trabajo de destilacion de conocimiento para monitoreo de plantas energeticamente eficiente (arXiv:2604.27178), donde este clasificador de mayor capacidad actua presumiblemente como modelo profesor. La model card no describe mecanismos adicionales como atencion lineal, decodificacion especulativa ni modulos de vision-lenguaje.

## Capacidades

- Clasificacion de imagenes de plantas en 1.000 especies, con salida de logits por clase.
- Extraccion de embeddings visuales de 1024 dimensiones, utiles para busqueda por similitud, clustering o aprendizaje de representaciones.
- Identificacion de especie a partir de una unica fotografia RGB de 224 × 224.
- Recuperacion del nombre cientifico de la especie mediante el fichero `species_metadata.csv` incluido en el repositorio.
- Inferencia en CPU o GPU mediante PyTorch, con un cargador propio (`load_model`) y transformaciones de validacion (`ValTransform`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision para clasificacion.
- No dispone de capacidades multilingues, de audio ni de modo thinking.

## Casos de uso

- Identificacion de especies en aplicaciones de ciencia ciudadana: el modelo puede integrarse en una app movil o web que reciba una foto del usuario y devuelva la especie probable, replicando el flujo de Pl@ntNet con una ventana de entrada de 224 × 224 y una latencia propia de un ConvNeXt-Base.
- Filtrado automatico de imagenes en herbarios digitalizados: clasificar lotes de fotografias de especimenes para preetiquetar especies antes de la revision por botanicos, reduciendo el trabajo manual en colecciones grandes.
- Monitorizacion de biodiversidad en campo: desplegado en dispositivos con GPU de consumo o en el borde, permite censar flora en parcelas y comparar la distribucion de especies a lo largo del tiempo.
- Control de malas hierbas en agricultura de precision: clasificar imagenes capturadas por drones o robots agricolas para distinguir especies adventicias de cultivos y activar tratamientos localizados.
- Destilacion de conocimiento: usar este modelo como profesor para entrenar clasificadores mas pequenos y eficientes energeticamente, tal como plantea el preprint asociado, orientado a despliegue en dispositivos con recursos limitados.
- Indexacion y busqueda visual de flora: extraer los embeddings de 1024 dimensiones y construir un indice vectorial para recuperar imagenes visualmente similares o especies relacionadas en bases de datos botanicas.
- Investigacion en vision autosupervisada: servir como baseline de fine-tuning de DINOv3 ConvNeXt-Base en dominios de cola larga y etiquetas ambiguas, comparando estrategias de entrenamiento.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son las metricas de clasificacion de la propia model card:

| Metrica | Valor |
|---|---|
| Mejor accuracy de validacion | 0,8358 |
| Accuracy de test | 0,8331 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni resultados frente a otros clasificadores botanicos. Tampoco se detallan metricas complementarias como precision, recall, F1 por clase, matriz de confusion o rendimiento en clases raras de la cola larga.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; un ConvNeXt-Base con entrada de 224 × 224 y pesos en precision completa (fp32) requiere del orden de 1-2 GB de VRAM, y menos de 1 GB en fp16, aunque esta estimacion no la proporciona el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes para inferencia por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: el repositorio no esta integrado en pipelines estandar de vLLM, TGI, llama.cpp u Ollama (son herramientas orientadas a modelos de lenguaje). El despliegue documentado es mediante PyTorch, cargando `model.pth` con el cargador incluido y el transformador `ValTransform`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Accuracy test | Licencia | Formato |
|---|---|---|---|---|---|---|
| PlantNet/plantnet-300k-v2-cnxb | no disponible (ConvNeXt-Base) | 224 × 224 | 1.000 | 0,8331 | dinov3-license | `model.pth` |
| facebook/dinov3-convnext-base-pretrain-lvd1689m | no disponible (ConvNeXt-Base) | variable | sin cabeza de clasificacion | no aplica | dinov3-license | safetensors (repositorio original) |
| Otros clasificadores de Pl@ntNet-300K | no disponible | no disponible | 1.000 | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva, ya que la informacion disponible no incluye otros clasificadores botanicos con metricas publicadas sobre el mismo dataset. El modelo base DINOv3 ConvNeXt-Base no incorpora cabeza de clasificacion y requiere fine-tuning para esta tarea, mientras que esta version anade la cabeza de 1.000 clases y los pesos ajustados.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Pl@ntNet-300K-v2 presenta ambiguedad de etiquetas y una distribucion de cola larga, por lo que el rendimiento en especies raras o poco representadas sera previsiblemente inferior a la accuracy global de 0,8331.
- Riesgo de error en la identificacion: la accuracy de test es del 83,31 %, lo que implica que aproximadamente una de cada seis imagenes se clasifica de forma incorrecta; no debe usarse como unica fuente en contextos de alta responsabilidad (toxicologia, fitosanidad, certificacion).
- Limitaciones de entrada: solo acepta imagenes RGB de 224 × 224; no procesa texto, audio ni secuencias, y no dispone de ventana de contexto en el sentido de los modelos de lenguaje.
- Limitaciones de licencia: la licencia dinov3-license es una licencia de Meta con acceso restringido; es necesario aceptar la licencia del modelo base y autenticarse en Hugging Face antes de la primera carga. El uso comercial esta sujeto a los terminos de dicha licencia, que no se detallan en la informacion disponible.
- Formato de pesos: al distribuirse solo en `model.pth` con codigo de carga propio, no es compatible directamente con herramientas estandar de inferencia ni con cuantizacion via GGUF; la integracion en produccion requiere envolver el cargador en un servicio propio.
- Dependencia del modelo base: el uso esta condicionado a la aceptacion de la licencia de DINOv3 y a la disponibilidad del repositorio de Meta.
- Idiomas: no aplica, pero conviene senalar que la metadata de especies esta en formato tabular y no se especifica si los nombres comunes estan localizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/plantnet-300k-v2-cnxb
- Modelo base DINOv3 ConvNeXt-Base: https://huggingface.co/facebook/dinov3-convnext-base-pretrain-lvd1689m
- Dataset Pl@ntNet-300K-v2 en Zenodo: https://zenodo.org/records/10419064
- Preprint arXiv:2604.27178 (Energy-Efficient Plant Monitoring via Knowledge Distillation): https://arxiv.org/abs/2604.27178
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Sitio oficial de Pl@ntNet: https://plantnet.org/
- Herramienta de identificacion Pl@ntNet: https://identify.plantnet.org/
- Documentacion de Pl@ntNet: https://docs.plantnet.org/
