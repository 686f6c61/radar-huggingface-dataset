# PlantNet/plantnet-300k-v2-cnxt

## Resumen

PlantNet/plantnet-300k-v2-cnxt es un clasificador de imágenes de plantas con 1.000 especies, desarrollado por PlantNet (equipo científico vinculado a Inria, CIRAD, IRD y Montpellier) mediante el ajuste fino del encoder DINOv3 ConvNeXt-Tiny de Meta sobre el conjunto de datos Pl@ntNet-300K-v2. El modelo resuelve una tarea concreta de visión por computador: dada una fotografía RGB de una planta, asignar una de las 1.000 clases de especie del vocabulario del dataset, devolviendo además el embedding de 768 dimensiones del encoder.

Técnicamente es una red convolucional ConvNeXt-Tiny (variante "tiny") preentrenada con el paradigma de autoaprendizaje DINOv3 de Meta y posteriormente ajustada de forma supervisada para clasificación de especies. La entrada es de 224 × 224 píxeles en RGB y el repositorio ocupa aproximadamente 0,1 GB, lo que lo convierte en un modelo ligero y desplegable en hardware modesto. No es un modelo generativo ni un modelo de lenguaje: no procesa texto ni mantiene conversaciones.

Su relevancia actual radica en que demuestra que un backbone convolucional compacto con preentrenamiento DINOv3 puede alcanzar un 82,16 % de accuracy en test sobre un problema de clasificación fine-grained con alta ambigüedad de etiquetas y distribución de cola larga, como es Pl@ntNet-300K. El modelo se publica como artefacto de investigación reproducible, con pesos en formato `model.pth` y utilidades de carga incluidas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ConvNeXt-Tiny (CNN) |
| Parametros totales | no disponible (ConvNeXt-Tiny, orden de ~28 M según la familia ConvNeXt, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen; sin capacidades lingüísticas) |
| Licencia | dinov3-license (licencia de Meta para DINOv3, con acceso restringido/gated) |
| Formato de pesos | `model.pth` (PyTorch); sin safetensors ni GGUF en el repositorio |
| Dimension de embedding | 768 |
| Numero de clases | 1.000 especies |
| Accuracy en validacion | 0,8248 |
| Accuracy en test | 0,8216 |
| Tamano de entrada | 224 × 224 RGB |
| Normalizacion | mean = (0,4425, 0,4695, 0,3266); std = (0,2353, 0,2219, 0,2325) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | transformers (pipeline `image-classification`), aunque la carga se hace con scripts propios (`model.py`, `transforms.py`) |

## Arquitectura y entrenamiento

El modelo es un ConvNeXt-Tiny adaptado al paradigma DINOv3. ConvNeXt es una red convolucional moderna que incorpora decisiones de diseño inspiradas en los transformers (bloques con depthwise convolution de kernel 7×7, normalización LayerNorm, activación GELU y estructura de stage computing). DINOv3 es el marco de autoaprendizaje de Meta que entrena representaciones visuales densas sin etiquetas; el checkpoint base `facebook/dinov3-convnext-tiny-pretrain-lvd1689m` corresponde a un ConvNeXt-Tiny preentrenado con DINOv3 sobre el corpus LVD-1689M.

Sobre ese backbone, PlantNet realizó un ajuste fino supervisado con el conjunto Pl@ntNet-300K-v2 (versión 2 del dataset publicado en Zenodo, registro 10419064). El dataset original Pl@ntNet-300K, presentado en NeurIPS Datasets and Benchmarks 2021, se caracteriza por una alta ambigüedad de etiquetas (varias especies visualmente similares) y una distribución de cola larga. El ajuste produce un cabezal de clasificación de 1.000 clases sobre el embedding de 768 dimensiones. La model card no detalla el número de épocas, la composición exacta del split, el uso de aumentos de datos ni si hubo destilación de conocimiento, aunque la referencia bibliográfica asociada (Moummad et al., 2026, arXiv:2604.27178, "Energy-Efficient Plant Monitoring via Knowledge Distillation") sugiere que este checkpoint forma parte de un trabajo sobre destilación orientada a eficiencia energética. No se especifican innovaciones de decodificación ni mecanismos de atención lineal, al no ser un modelo generativo.

## Capacidades

- Clasificación de imágenes de plantas en 1.000 especies del vocabulario Pl@ntNet-300K-v2.
- Extracción de embeddings visuales de 768 dimensiones a partir del encoder, útiles para búsqueda por similitud, clustering o transferencia a otras tareas.
- Procesamiento de imágenes RGB redimensionadas/recortadas a 224 × 224 con normalización específica de Pl@ntNet.
- Inferencia en CPU o GPU (el script de carga selecciona `cuda` si está disponible).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo "thinking", visión general, audio ni otras modalidades más allá de la imagen.
- Salida dual: logits de clasificación (1.000 clases) y embedding del encoder en una sola pasada.

## Casos de uso

- Identificación automática de especies en aplicaciones de ciencia ciudadana: el modelo clasifica una foto de planta en una de 1.000 especies con un 82,16 % de accuracy en test, adecuado para prefiltrar candidatos antes de la validación humana en plataformas tipo Pl@ntNet.
- Monitorización de biodiversidad en campo: integrado en trampas de cámara o dispositivos móviles, permite etiquetar observaciones florísticas de forma automática y alimentar bases de datos ecológicas con especies probables y su embedding asociado.
- Búsqueda visual por similitud: usando el embedding de 768 dimensiones, se puede construir un índice vectorial (FAISS, Qdrant) para recuperar imágenes visualmente parecidas de un herbario digital o de un catálogo de referencia.
- Preetiquetado en pipelines de anotación: el modelo actúa como clasificador previo que sugiere especies a anotadores humanos, reduciendo el coste de etiquetado en proyectos de digitalización de colecciones botánicas.
- Control de especies invasoras o seguimiento de cultivos: desplegado en un servicio de inferencia ligero (por ejemplo, TorchServe o un endpoint FastAPI), clasifica imágenes enviadas desde drones o móviles para alertar sobre presencia de especies de interés agronómico.
- Investigación en destilación y eficiencia energética: al ser un ConvNeXt-Tiny ajustado con DINOv3, sirve como modelo profesor o alumno en experimentos de destilación de conocimiento para despliegue en dispositivos de bajo consumo, en línea con el artículo asociado.
- Docencia y reproducción de experimentos: el repositorio incluye `model.py`, `transforms.py`, `model.pth` y `species_metadata.csv`, lo que facilita reproducir la evaluación y estudiar el efecto del preentrenamiento DINOv3 en tareas fine-grained.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de validación y test del propio modelo. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| Accuracy en validacion | 0,8248 |
| Accuracy en test | 0,8216 |
| Numero de clases | 1.000 |
| Dimension de embedding | 768 |
| Tamano de entrada | 224 × 224 RGB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un ConvNeXt-Tiny con entrada 224 × 224; el repositorio completo pesa ~0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas (e incluso en iGPU y en dispositivos embebidos tipo Jetson Nano en FP32/FP16).
- Opciones de despliegue: el repositorio no incluye integración directa con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo). El despliegue previsto es mediante PyTorch con los scripts `model.py` y `transforms.py`, o exportando a TorchScript/ONNX para servir con TorchServe, ONNX Runtime o un endpoint FastAPI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo (ConvNeXt-Tiny, ~28 M de parámetros según la familia, no confirmado), se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre Pl@ntNet-300K-v2 ni de comparativas con clasificadores botánicos alternativos. La model card solo referencia el checkpoint base DINOv3 ConvNeXt-Tiny y el dataset Pl@ntNet-300K-v2.

| Modelo | Parametros | Contexto/entrada | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PlantNet/plantnet-300k-v2-cnxt | no disponible (~28 M, familia ConvNeXt-Tiny) | 224 × 224 RGB | 0,8216 | dinov3-license (gated) | HuggingFace, pesos `model.pth` |
| facebook/dinov3-convnext-tiny-pretrain-lvd1689m | no disponible | 224 × 224 RGB (preentrenamiento) | no aplica (sin cabezal de 1.000 clases) | dinov3-license (gated) | HuggingFace |
| Pl@ntNet-300K (dataset) | no aplica | imágenes de plantas | no aplica | según Zenodo | Zenodo |

No disponible para el resto de alternativas comparables.

## Limitaciones y advertencias

- El modelo solo cubre 1.000 especies del vocabulario Pl@ntNet-300K-v2; cualquier planta fuera de ese conjunto se asignará a la clase más parecida, generando falsos positivos.
- El dataset de origen tiene alta ambigüedad de etiquetas y cola larga, por lo que el rendimiento en especies raras o visualmente similares será inferior al 82,16 % global.
- Riesgo de alucinación en sentido figurado: el clasificador siempre devuelve una clase, incluso ante imágenes que no son plantas o de baja calidad, sin mecanismo de abstención incorporado.
- La licencia `dinov3-license` de Meta es restrictiva y el modelo base está gated: es necesario aceptar la licencia de DINOv3 y autenticarse en Hugging Face antes de la primera carga. El uso comercial está sujeto a los términos de dicha licencia, que deben revisarse antes de producción.
- El repositorio no incluye pesos en safetensors ni GGUF, solo `model.pth`; la carga requiere ejecutar código Python del repositorio (`sys.path.insert` + `from model import load_model`), lo que implica confiar en el código del autor.
- La etiqueta `inference: false` en la model card indica que el pipeline de `transformers` no está habilitado de forma nativa; hay que usar los scripts propios.
- No hay información publicada sobre sesgos geográficos o taxonómicos del conjunto de entrenamiento, ni sobre calibración de probabilidades.
- Sin capacidades de texto, tool calling ni agentes: no es adecuado para tareas conversacionales o multimodales más allá de la clasificación de imagen.
- No se especifican versiones mínimas de PyTorch, CUDA ni `transformers`, lo que puede complicar la reproducibilidad en entornos no controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/plantnet-300k-v2-cnxt
- Modelo base DINOv3 ConvNeXt-Tiny: https://huggingface.co/facebook/dinov3-convnext-tiny-pretrain-lvd1689m
- Dataset Pl@ntNet-300K-v2 en Zenodo: https://zenodo.org/records/10419064
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Artículo asociado (Moummad et al., 2026): https://arxiv.org/abs/2604.27178
- Pl@ntNet (sitio principal): https://plantnet.org/
- Pl@ntNet identify: https://identify.plantnet.org/fr
- Documentación de Pl@ntNet: https://docs.plantnet.org/fr/tutorials/install-plantnet/
