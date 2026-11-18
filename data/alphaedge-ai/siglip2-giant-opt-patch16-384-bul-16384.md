# alphaedge-ai/siglip2-giant-opt-patch16-384-bul-16384

## Resumen

siglip2-giant-opt-patch16-384-bul-16384 es un modelo de visión-lenguaje derivado de google/siglip2-giant-opt-patch16-384, publicado por alphaedge-ai. Se trata de una versión "trimmed" (podada) del modelo original de Google, en la que se ha reducido el vocabulario del tokenizador de texto de 256.000 a 16.384 tokens seleccionando los tokens más relevantes para el búlgaro. El resultado es un modelo un 14,75% más pequeño en parámetros (1.595.847.794 frente a 1.871.885.426) y con una huella de memoria notablemente inferior, manteniendo la arquitectura y los pesos del codificador visual intactos.

El modelo pertenece a la familia SigLIP 2, que combina un codificador de imágenes tipo Vision Transformer con un codificador de texto, entrenados de forma conjunta mediante una función de pérdida sigmoidea. Está pensado para tareas de clasificación de imágenes zero-shot y para calcular similitud entre textos e imágenes, y se distribuye a través de la librería sentence-transformers y de los pipelines de Transformers.

La relevancia de esta variante es doble: por un lado, demuestra el método de trimming aplicado a un modelo multimodal de gran tamaño, mostrando cómo reducir el vocabulario de un tokenizador multilingüe afecta al tamaño total y al rendimiento en un idioma concreto; por otro, ofrece una alternativa más ligera para despliegues en búlgaro, con licencia Apache 2.0 y pesos en safetensors, aunque con la contrapartida de que el rendimiento en otros idiomas puede degradarse al haberse eliminado tokens no presentes en el corpus de selección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) + codificador de texto, SigLIP 2 (pérdida sigmoidea), parche de 16 px, resolución 384 px |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | búlgaro (bg) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una poda del SigLIP 2 Giant original de Google, un codificador visión-lenguaje con arquitectura de doble torre: un Vision Transformer con parches de 16×16 píxeles a resolución 384×384 y un codificador de texto transformer. SigLIP 2 se entrena con una pérdida sigmoidea sobre pares imagen-texto, lo que permite obtener embeddings alineados en un espacio compartido y realizar clasificación zero-shot comparando la similitud entre la imagen y las etiquetas candidatas. La variante "opt" del nombre hace referencia a la configuración optimizada del modelo base de Google, aunque la model card no detalla los hiperparámetros concretos de esa configuración.

El proceso de trimming consiste en reducir el vocabulario del tokenizador de texto de 256.000 a 16.384 tokens. Para ello se utilizaron 200.000 textos del dataset lbourdois/fineweb-2-trimming, se minaron los tokens más frecuentes en búlgaro y se conservaron únicamente esos, eliminando el resto del vocabulario y recortando las matrices de embedding correspondientes. Esto reduce el número de parámetros en 276.037.632 (un 14,75%) y el tamaño del repositorio a 6,4 GB. La model card no indica si hubo reentrenamiento adicional, ajuste fino o calibración tras el recorte; tampoco detalla el número de tokens de entrenamiento del modelo original ni si se aplicaron técnicas de RLHF o DPO, algo que no aplica a un codificador de este tipo.

## Capacidades

- Clasificación de imágenes zero-shot: permite asignar etiquetas de texto arbitrarias a una imagen y obtener puntuaciones de similitud, sin entrenamiento específico para cada clase.
- Similitud texto-imagen: genera embeddings de imágenes y de textos en un espacio compartido, útiles para búsqueda y recuperación multimodal.
- Procesamiento de imágenes a resolución 384×384 con parches de 16×16.
- Soporte de búlgaro como idioma principal para las etiquetas y textos de consulta.
- Integración con sentence-transformers (métodos encode y similarity) y con el pipeline zero-shot-image-classification de Transformers.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni modo thinking: es un codificador, no un modelo generativo.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Moderación de contenido visual en búlgaro: clasificar imágenes entrantes contra un conjunto de etiquetas predefinidas (por ejemplo, contenido sensible, categorías de producto o tipos de escena) usando el pipeline zero-shot, sin necesidad de entrenar un clasificador específico.
- Búsqueda multimodal en catálogos: indexar imágenes de producto y consultas textuales en búlgaro en un mismo espacio de embeddings para recuperación semántica, aprovechando que el modelo reduce el coste de almacenamiento frente al original.
- Etiquetado automático de imágenes para plataformas de contenido en búlgaro: generar etiquetas candidatas y puntuarlas con el modelo para enriquecer metadatos de imágenes sin anotación manual.
- Filtrado y deduplicación de datasets visuales: calcular similitudes entre imágenes y descripciones textuales para detectar pares mal alineados o duplicados en corpus de entrenamiento.
- Sistemas de accesibilidad: asociar descripciones textuales en búlgaro a imágenes para generar alternativas de texto o verificar la coherencia entre una descripción y su imagen.
- Clasificación zero-shot en entornos con recursos limitados: al ser un 14,75% más pequeño que el original y con un vocabulario de 16.384 tokens, reduce la memoria necesaria para el codificador de texto, lo que facilita su despliegue en infraestructura modesta para aplicaciones centradas en búlgaro.
- Investigación sobre trimming de vocabularios multilingües: servir como referencia para estudiar el impacto de la reducción de vocabulario en modelos visión-lenguaje y comparar con el modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente proporciona las estadísticas de reducción de vocabulario (93,60%) y de parámetros (14,75%), sin métricas de precisión, recall ni comparaciones cuantitativas con el modelo original.

## Requisitos de hardware

- El modelo tiene 1.595.847.794 parámetros y un repositorio de 6,4 GB en safetensors; en precisión completa (fp32) requeriría aproximadamente 6,4 GB solo para los pesos, más memoria para activaciones y el codificador visual.
- En fp16/bf16, los pesos ocuparían alrededor de 3,2 GB, lo que permite inferencia en GPUs consumer con al menos 8 GB de VRAM, como una RTX 3060 Ti, RTX 4060 Ti o RTX 4070, siempre que se gestione el batch adecuadamente.
- Para lotes grandes o despliegues de producción se recomiendan GPUs con 16-24 GB de VRAM (RTX 4090, A10G, L4) o superiores (A100, H100) si se necesita alto throughput.
- Opciones de despliegue: pipeline de Transformers, sentence-transformers, y servidores de embeddings compatibles con sentence-transformers; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos.
- No se dispone de datos de latencia ni throughput publicados en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-bul-16384 | 1.595.847.794 | no disponible | búlgaro | apache-2.0 | Hugging Face |
| google/siglip2-giant-opt-patch16-384 (original) | 1.871.885.426 | no disponible | multilingüe | apache-2.0 | Hugging Face |
| google/siglip2-base-patch16-384 | no disponible en la información proporcionada | no disponible | multilingüe | apache-2.0 | Hugging Face |
| google/siglip2-so400m-patch14-384 | no disponible en la información proporcionada | no disponible | multilingüe | apache-2.0 | Hugging Face |

La comparación principal es con el modelo original de Google: la variante trimmed reduce un 14,75% los parámetros y un 93,60% el vocabulario, a costa de perder cobertura en idiomas distintos del búlgaro. Frente a las variantes base y so400m de SigLIP 2, esta versión giant trimmed conserva el tamaño grande del codificador visual pero con un tokenizador mucho más compacto, lo que la hace más ligera que el giant original pero más pesada que las variantes base. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El vocabulario se ha reducido a 16.384 tokens seleccionados para búlgaro; el rendimiento en otros idiomas puede degradarse notablemente porque se han eliminado tokens no presentes en el corpus de selección.
- La model card advierte explícitamente de que el modelo "may not perform well for other languages", por lo que no debe usarse como modelo multilingüe general.
- No se han publicado métricas de evaluación que confirmen que el rendimiento en búlgaro se mantiene respecto al modelo original; la afirmación de que "should perform similarly" es una expectativa del autor, no un resultado medido.
- Al ser un codificador de visión-lenguaje, no genera texto ni razona; no es adecuado para tareas de generación, código o agentes.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos web, puede heredar sesgos de esos corpus, especialmente en la selección de tokens y en la representación de imágenes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas o similitudes engañosas en dominios alejados de los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Google y del dataset utilizado para el trimming.
- El modelo tiene muy pocas descargas (9) y ningún "like" en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el soporte de contexto, lo que limita la planificación de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-bul-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de trimming: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
