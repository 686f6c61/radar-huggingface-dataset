# edvv1n/bioclip-2

## Resumen

BioCLIP 2 es un modelo de visión-lenguaje de tipo CLIP especializado en clasificación de especies biológicas, desarrollado originalmente por el equipo de Imageomics (Ohio State University) y entrenado sobre el conjunto de datos TreeOfLife-200M. Esta ficha corresponde a la réplica publicada por el usuario `edvv1n` en Hugging Face, que no es el modelo original en formato PyTorch, sino el codificador visual de BioCLIP 2 compilado con IREE (Intermediate Representation Execution Environment) para su ejecución en Lumi, un runtime de inferencia local.

El artefacto contiene un directorio `v1/` con un manifiesto, avisos de licencia, un fichero VMFB (VM FlatBuffer, el formato de módulo compilado de IREE) por cada backend soportado (CPU, Metal, Vulkan y CUDA) y dos conjuntos de etiquetas del árbol de la vida: TreeOfLife200MCore y TreeOfLife200M, cada uno con sus embeddings de texto, etiquetas e índice HNSW para búsqueda aproximada de vecinos más cercanos. El repositorio ocupa 10,5 GB.

La relevancia de esta publicación es fundamentalmente práctica: permite desplegar la clasificación de especies de BioCLIP 2 en hardware heterogéneo (incluido Metal en Apple Silicon y Vulkan en GPUs de consumo) sin depender del stack de PyTorch, mediante módulos precompilados de IREE. No obstante, la información pública disponible es muy escasa: no se declaran licencia, idiomas ni pipeline, y no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual tipo CLIP (ViT) compilado con IREE; el modelo base BioCLIP 2 combina un codificador de imagen con embeddings de texto para clasificación zero-shot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no generativo de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen módulos VMFB compilados por backend, no pesos en cuantización estándar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio incluye avisos de licencia en `v1/`, pero no se especifica el tipo) |
| Formato de pesos | VMFB (IREE VM FlatBuffer) por backend: CPU, Metal, Vulkan y CUDA; además embeddings de texto, etiquetas e índice HNSW en `v1/` |

## Arquitectura y entrenamiento

El modelo subyacente, BioCLIP 2 (imageomics/bioclip-2), es un modelo de visión-lenguaje con arquitectura contrastiva tipo CLIP: un codificador de imagen (ViT) y un codificador de texto se entrenan para alinear imágenes y descripciones textuales en un espacio compartido, lo que permite clasificación zero-shot comparando el embedding de una imagen con los embeddings de texto de las clases candidatas. En esta réplica, el codificador visual se ha compilado con IREE a módulos VMFB específicos por backend, lo que permite ejecutarlo sobre CPU, Metal, Vulkan y CUDA.

El entrenamiento original de BioCLIP 2 se realizó sobre TreeOfLife-200M, un conjunto de aproximadamente 200 millones de imágenes de organismos vivos con taxonomía asociada. Esta réplica incluye dos conjuntos de etiquetas derivados de ese árbol taxonómico: TreeOfLife200MCore (probablemente un subconjunto taxonómico reducido) y TreeOfLife200M (el conjunto completo), cada uno con sus embeddings de texto precalculados, etiquetas e índice HNSW para búsqueda eficiente de la clase más próxima. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Clasificación de especies en imágenes: dado un fotografía de un organismo, el modelo devuelve la especie o taxón más probable comparando el embedding visual con los embeddings de texto del árbol de la vida.
- Clasificación zero-shot sobre un vocabulario taxonómico abierto: no requiere un clasificador entrenado específicamente para cada especie; las clases se definen mediante los embeddings de texto incluidos.
- Búsqueda aproximada de vecinos más cercanos: el índice HNSW incluido permite recuperar las k clases más similares de forma eficiente sobre cientos de millones de etiquetas.
- Ejecución multiplataforma: los módulos VMFB permiten inferencia en CPU, Apple Metal, Vulkan y CUDA sin PyTorch.
- Capacidades de generación de texto: no disponibles (el modelo no es generativo).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): únicamente visión para clasificación; no hay modo de razonamiento ni audio.

## Casos de uso

- Identificación de especies en aplicaciones de campo: una app móvil captura una foto y ejecuta el módulo VMFB de Metal o Vulkan en el dispositivo para devolver las especies candidatas consultando el índice HNSW local, sin necesidad de conexión.
- Catalogación automática de colecciones biológicas: un pipeline procesa lotes de imágenes de herbarios o museos y asigna taxones usando los embeddings de TreeOfLife200MCore, reduciendo el etiquetado manual.
- Monitorización de biodiversidad con cámaras trampa: el módulo CUDA procesa flujos de vídeo en servidores con GPU y clasifica los organismos detectados para estudios ecológicos.
- Investigación en ecología y conservación: permite generar etiquetas taxonómicas a gran escala sobre datasets de imágenes para análisis de distribución de especies.
- Filtrado y curación de datasets de imágenes: clasificación rápida de imágenes recolectadas en repositorios para separar organismos de imágenes irrelevantes.
- Herramienta educativa de identificación de fauna y flora: integración en aplicaciones de divulgación que muestran la especie probable y su posición taxonómica.
- Despliegue en hardware heterogéneo sin PyTorch: uso del módulo CPU o Vulkan en entornos embebidos o GPUs de consumo donde no está disponible el stack de deep learning habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 10,5 GB e incluye módulos compilados para cuatro backends, por lo que el peso en memoria depende del backend y del conjunto de etiquetas cargado.
- GPU recomendadas: no disponibles; los backends CUDA y Vulkan permiten usar GPUs NVIDIA y GPUs compatibles con Vulkan, respectivamente.
- Compatibilidad con GPU de consumo: probable mediante los backends Metal (Apple Silicon) y Vulkan (GPUs de consumo), aunque no se especifican requisitos mínimos.
- Opciones de despliegue: runtime de IREE con los módulos VMFB incluidos; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dataset de entrenamiento | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edvv1n/bioclip-2 (esta réplica) | CLIP visual compilado con IREE | TreeOfLife-200M (heredado del original) | VMFB por backend + embeddings + HNSW | no disponible | Hugging Face, 0 descargas |
| imageomics/bioclip-2 | CLIP visión-lenguaje original | TreeOfLife-200M | Pesos PyTorch (según el repo original) | no disponible en esta información | Hugging Face |
| CLIP original (OpenAI) | CLIP visión-lenguaje generalista | Datos web a gran escala | PyTorch, ONNX | MIT (según la información habitual del proyecto) | Hugging Face, GitHub |

La comparación con otros modelos especializados en clasificación biológica (por ejemplo, variantes de BioCLIP 1 u otros clasificadores taxonómicos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la información pública; el repositorio incluye avisos de licencia en `v1/`, pero debe verificarse antes de cualquier uso comercial.
- Es una réplica de terceros (usuario `edvv1n`), no la publicación oficial de Imageomics; no hay garantía de equivalencia con el modelo original.
- El artefacto está compilado para IREE y no se distribuyen pesos en safetensors ni GGUF, lo que limita su uso fuera de ese runtime.
- No se especifican idiomas soportados ni pipeline; la integración requiere trabajo manual con los embeddings y el índice HNSW.
- Riesgo de error taxonómico: la clasificación zero-shot depende de la calidad de los embeddings de texto y del árbol taxonómico incluido; especies raras o mal representadas en TreeOfLife-200M pueden clasificarse incorrectamente.
- Sesgos potenciales derivados del dataset de entrenamiento original (distribución geográfica y taxonómica de las imágenes), no documentados en esta réplica.
- Sin datos de benchmarks ni de latencia, no es posible evaluar su rendimiento frente a alternativas sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edvv1n/bioclip-2
- Modelo original BioCLIP 2: https://huggingface.co/imageomics/bioclip-2
- IREE (runtime de compilación): https://github.com/iree-org/iree
- Proyecto BioCLIP (Imageomics): https://imageomics.github.io/bioclip/
