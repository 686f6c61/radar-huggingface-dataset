# ATH-MaaS/Ovis-VL-Embedding-9B

## Resumen

Ovis-VL-Embedding-9B es un modelo de embeddings vision-lenguaje de alta capacidad desarrollado por ATH-MaaS, inicializado a partir de Qwen3.5-9B. Su funcion es mapear texto, imagenes, documentos visuales, video y entradas multimodales intercaladas a un unico espacio de representacion coherente, lo que permite recuperacion cross-modal de alta precision con un solo codificador. A diferencia de los modelos generativos, es un bi-encoder disenado especificamente para tareas de retrieval, no para generacion de respuestas.

El modelo conserva los encoders nativos de texto y vision junto con el backbone multimodal compartido de Qwen3.5-9B, elimina la cabeza de modelado de lenguaje y utiliza directamente el estado oculto de la ultima capa en el ultimo token no de padding como embedding de recuperacion, sin cabezas de proyeccion especificas por modalidad. El resultado son vectores de 4096 dimensiones que se normalizan L2 y se comparan por similitud coseno.

Es relevante porque unifica en un solo encoder tareas que tradicionalmente requerian modelos separados (texto, imagen, documento visual, video), lo que simplifica arquitecturas de RAG multimodal, busqueda semantica y sistemas de recomendacion. Su licencia Apache 2.0 y su integracion con Sentence Transformers lo hacen directamente desplegable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (Gated DeltaNet + full-attention) con encoders de texto y vision, base Qwen3.5-9B |
| Parametros totales | 9B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | 4096 |
| Capas del backbone de lenguaje | 32 |
| Hidden size | 4096 |
| Tipo de modelo | Bi-encoder (no cross-encoder) |
| Tamano del repo | 16.8 GB |

## Arquitectura y entrenamiento

El backbone Qwen3.5-9B contiene 32 capas de lenguaje con hidden size 4096. Su pila hibrida repite tres capas Gated DeltaNet seguidas de una capa de full-attention con compuerta, combinando procesamiento eficiente de contexto largo con interaccion global periodica de tokens. La codificacion posicional multimodal preserva coordenadas temporales y espaciales bidimensionales para los tokens visuales. El modelo trata texto, imagenes, documentos visuales y frames de video muestreados como una unica secuencia intercalada, y el estado oculto de la ultima capa en el ultimo token no de padding se convierte directamente en el embedding de recuperacion.

El entrenamiento sigue tres etapas: primero, un preentrenamiento contrastivo multimodal a gran escala con datos multitarea que combina aprendizaje contrastivo focal sensible a la dificultad con destilacion de distribucion de similitud; segundo, un finetuning homogeneo de parametros completos con datos downstream de alta calidad, donde cada micro-batch se extrae de un unico dataset para que los candidatos agregados formen negativos consistentes con la tarea; tercero, una destilacion de embeddings con annealing que retiene ejemplos corregidos por el profesor, enfatiza ejemplos no resueltos del estudiante y aplica supervision forward-KL adaptativa a la confianza para transferir capacidades complementarias de expertos.

## Capacidades

- Generacion de embeddings para texto, imagenes, documentos visuales, video y entradas multimodales intercaladas en un unico espacio de 4096 dimensiones.
- Recuperacion cross-modal: busqueda de imagenes mediante consultas de texto, busqueda de texto mediante imagenes, y recuperacion entre documentos visuales y video.
- Busqueda de video y localizacion temporal gracias a la codificacion posicional temporal de los tokens visuales.
- Soporte de instrucciones de tarea especificas mediante prompts configurables (`query` y `document`) en el pipeline de Sentence Transformers.
- Extraccion de caracteristicas (feature-extraction) como tarea principal del pipeline.
- No realiza generacion de texto ni tool calling: es exclusivamente un modelo de representacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- RAG multimodal: indexar documentos con texto e imagenes mezcladas y recuperar los fragmentos relevantes ante una consulta textual, usando un unico encoder para todas las modalidades y evitando multiples pipelines de indexacion.
- Busqueda semantica de imagenes en catalogos: codificar un catalogo de productos o imagenes y permitir consultas en lenguaje natural, aprovechando el espacio compartido texto-imagen para ranking por similitud coseno.
- Recuperacion de documentos visuales: indexar PDFs escaneados, facturas o formularios y recuperar paginas relevantes por contenido visual y textual, util en gestion documental y compliance.
- Busqueda de video con localizacion temporal: codificar frames muestreados y consultas textuales para localizar segmentos concretos en archivos de video, adecuado para archivos audiovisuales y monitorizacion.
- Sistemas de recomendacion: generar embeddings de items multimodales y calcular vecinos mas cercanos para recomendacion basada en contenido.
- Deduplicacion y matching de imagenes o documentos: detectar duplicados o near-duplicates en grandes repositorios mediante similitud de embeddings normalizados.
- Clasificacion zero-shot por similitud: comparar embeddings de entradas contra etiquetas textuales codificadas como candidatos en el mismo espacio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 16.8 GB en safetensors, lo que corresponde aproximadamente a 16-17 GB en precision de 16 bits para los pesos. En fp32 se requeririan unos 34-36 GB.
- GPU recomendadas: A100 40GB o H100 para inferencia en fp16 sin cuantizar; A100 80GB si se procesan lotes grandes o secuencias multimodales largas.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en fp16, aunque el margen para lotes grandes y entradas de video es limitado. En GPUs de 16 GB seria necesaria cuantizacion, cuyos formatos no estan documentados en la informacion disponible.
- Opciones de despliegue: Sentence Transformers (>=5.4.0 con soporte de imagen) y Transformers (>=5.12.1) segun la model card. El soporte para vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible; al ser un bi-encoder de embeddings, los servidores de inferencia generativa no son el vehiculo natural.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ovis-VL-Embedding-9B | 9B | no disponible | texto, imagen, documento visual, video, intercalado | Apache 2.0 | Hugging Face |
| Alternativas de embeddings multimodales de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un bi-encoder: no genera respuestas ni realiza atencion cruzada entre consulta y candidato, por lo que no debe emplearse como modelo generativo o de razonamiento.
- La calidad de recuperacion depende de la instruccion de tarea; la model card indica que consultas y documentos usan el prompt `Represent the user's input.` por defecto, y variaciones en el prompt pueden alterar el ranking.
- Los embeddings deben normalizarse L2 antes de comparar; el ranking se realiza por similitud coseno o producto escalar de vectores normalizados.
- No se documentan sesgos conocidos, tasas de alucinacion (no aplica a generacion) ni limitaciones de idioma en la informacion disponible.
- La longitud de contexto no esta documentada, lo que impide planificar el tamano maximo de entrada para documentos o videos largos.
- Los formatos de cuantizacion no estan documentados, lo que limita el despliegue en hardware con VRAM reducida.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones de los datos de entrenamiento subyacentes de Qwen3.5-9B antes de un despliegue en produccion regulada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ATH-MaaS/Ovis-VL-Embedding-9B
- Repositorio GitHub: https://github.com/ATH-MaaS/Ovis-VL-Embedding
- Informe tecnico (arXiv): https://arxiv.org/pdf/2609.25165
