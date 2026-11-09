# mboyanov/bg2vec

## Resumen

Bg2Vec es un modelo de embeddings de texto para búlgaro desarrollado por Martin Boyanov. Se construye aplicando el procedimiento LLM2Vec sobre BgGPT-7B-Instruct-v0.2, un decoder Mistral-7B adaptado por INSAIT para búlgaro. El resultado es un encoder bidireccional de 7.135 millones de parámetros que produce vectores de 4096 dimensiones, pensado para tareas de similitud semántica, recuperación de información y clasificación de texto en búlgaro.

El problema que resuelve es concreto: la mayoría de modelos de embeddings de alta calidad están optimizados para inglés o multilingüe general, con un rendimiento comparativamente inferior en búlgaro. Bg2Vec convierte un LLM generativo ya entrenado en búlgaro en un encoder de frases mediante dos etapas de fine-tuning con LoRA: predicción de token enmascarado con atención bidireccional (MNTP) y SimCSE no supervisado. Ambos adaptadores están fusionados en los pesos publicados.

Es relevante porque demuestra que se puede reutilizar un LLM de 7B específico de un idioma minoritario para construir un encoder competitivo con solo el 0,58% de los parámetros entrenables, y porque publica tanto el código de entrenamiento como una evaluación detallada en tareas MTEB en búlgaro frente a alternativas multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B) convertido en encoder bidireccional |
| Parámetros totales | 7.135.236.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento e inferencia de referencia; el modelo base soporta 4096, pero la card especifica truncado a 512 |
| Tipos de cuantización | no disponible (la card no documenta cuantizaciones publicadas; los pesos son bf16) |
| Idiomas soportados | búlgaro (bg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión de los embeddings | 4096 |
| Pooling | media sobre tokens reales, con normalización L2 |
| Modelo base | INSAIT-Institute/BgGPT-7B-Instruct-v0.2 |
| Dataset de entrenamiento | mboyanov/bgwiki (dump de Wikipedia búlgara, mayo 2024) |
| Librería | transformers (también compatible con llm2vec) |

## Arquitectura y entrenamiento

El modelo parte de BgGPT-7B-Instruct-v0.2, un transformer decoder de tipo Mistral con 7.135 millones de parámetros. El procedimiento LLM2Vec lo transforma en encoder en tres pasos. Primero se habilita atención bidireccional: cada token atiende a todos los tokens, anteriores y posteriores, eliminando la máscara causal. Segundo, se entrena un adaptador LoRA (r=16, alpha=32, dropout 0,05) sobre todas las proyecciones de atención y MLP —el 0,58% de los parámetros— con predicción de token enmascarado (MNTP) sobre Wikipedia búlgara: chunks de 512 tokens, hasta 50.000 chunks, estrategia `all_mask` con probabilidad de máscara 0,8, batch de 32 y 1000 pasos en bf16. La pérdida de validación baja de 5,53 en el paso 100 a 4,89 en el paso 1000. Tercero, se fusiona ese adaptador y se entrena un segundo LoRA con SimCSE no supervisado: cada artículo se empareja consigo mismo, textos truncados a 128 tokens, pérdida `HardNegativeNLLLoss` con negativos in-batch y escala 20, batch de 128, learning rate 3e-5 y dropout de atención 0,3.

En inferencia, LLM2Vec se reduce a dos operaciones: atención no causal y mean pooling. La card proporciona código con `transformers` puro que reproduce los vectores del paquete `llm2vec` con similitud coseno superior a 0,999. No se debe añadir prefijo de consulta ni instrucción: el modelo se entrenó sin ellos. El entrenamiento se ejecutó en una única GPU NVIDIA A100 de 80 GB o A6000 de 48 GB.

## Capacidades

- Generación de embeddings de frases y pasajes en búlgaro, con vectores de 4096 dimensiones normalizados L2.
- Similitud semántica entre textos: la card muestra un ejemplo con coseno de aproximadamente 0,787 para una paráfrasis positiva frente a 0,728 para una negativa.
- Recuperación de información (retrieval) y búsqueda semántica sobre corpus búlgaros.
- Clasificación de texto por similitud con etiquetas o prototipos, evaluada en tareas MTEB como sentimiento y clasificación de idioma.
- Extracción de características (`feature-extraction`) como pipeline principal.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints compatibles, según los tags del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es exclusivamente un encoder de texto.
- Capacidad monolingüe: no se documenta soporte funcional para otros idiomas.

## Casos de uso

- Búsqueda semántica en corpus búlgaros: indexar documentos de Wikipedia, prensa o documentación interna con vectores de 4096 dimensiones y recuperar por similitud coseno; el modelo está entrenado específicamente sobre texto búlgaro y supera al BgGPT causal en tareas de clasificación MTEB.
- Deduplicación y agrupación de documentos: calcular embeddings de pasajes de hasta 512 tokens y agrupar por similitud para eliminar duplicados o near-duplicates en datasets búlgaros.
- Clasificación de sentimiento y temática sin entrenamiento supervisado: usar similitud con descripciones de clase o ejemplos etiquetados; la card reporta 0,810 en MultilingualSentimentClassification y 0,609 en BulgarianStoreReviewSentimentClassification.
- Filtrado y enrutamiento de tickets de soporte: comparar el texto de la incidencia con descripciones de categorías para asignar colas, aprovechando que el modelo maneja texto coloquial búlgaro procedente de Wikipedia y reseñas.
- RAG sobre documentación en búlgaro: usar Bg2Vec como retriever en un pipeline de generación aumentada, combinándolo con un LLM generativo búlgaro como BgGPT para responder consultas sobre un corpus interno.
- Detección de paráfrasis y control de calidad de traducciones: comparar el original búlgaro con la traducción de vuelta para medir deriva semántica mediante coseno.
- Construcción de índices vectoriales para motores como FAISS, Qdrant o Milvus: los embeddings normalizados permiten usar producto interno como métrica directa.

## Benchmarks y rendimiento

Resultados de MTEB en tareas búlgaras, según la parte 5 de la serie de blog del autor. BgGPT usa mean pooling con su atención causal original.

| Tarea | Bg2Vec | BgGPT-7B-Instruct-v0.2 | bge-multilingual-gemma2 |
|---|---:|---:|---:|
| BulgarianStoreReviewSentimentClassfication | 0,609 | 0,570 | **0,696** |
| LanguageClassification | 0,983 | **0,992** | 0,920 |
| MultilingualSentimentClassification | 0,810 | 0,720 | **0,905** |
| SIB200Classification | no disponible | no disponible | no disponible |

La información proporcionada se interrumpe en la tabla de evaluación; no se dispone del resto de tareas ni de la puntuación media global de MTEB.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 14,3 GB solo para pesos, más activaciones y caché; en la práctica se recomienda al menos 20-24 GB para batches pequeños.
- GPU recomendadas: A100 80GB o A6000 48GB para entrenamiento (según la card); para inferencia, A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con bf16 y batches moderados; en GPUs de 16 GB requeriría cuantización, que la card no documenta.
- Opciones de despliegue: `transformers` con `attn_implementation="sdpa"`, paquete `llm2vec` (requiere `transformers` 4.44 o inferior), y Text Embeddings Inference (TEI) según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Embeddings |
|---|---:|---|---|---|---|
| Bg2Vec | 7,1B | 512 tokens en uso documentado | Búlgaro | Apache 2.0 | 4096 dim |
| BgGPT-7B-Instruct-v0.2 (causal, mean pooling) | 7,1B | 4096 | Búlgaro | no disponible en la información | 4096 dim |
| bge-multilingual-gemma2 | no disponible en la información | no disponible en la información | Multilingüe | no disponible en la información | no disponible en la información |

En las tres tareas MTEB comparadas, Bg2Vec supera a BgGPT con pooling causal en las dos tareas de sentimiento y clasificación de idioma, pero queda por debajo de bge-multilingual-gemma2 en las dos tareas de sentimiento (0,609 frente a 0,696 y 0,810 frente a 0,905). No se dispone de datos de otros encoders búlgaros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: entrenado y evaluado solo en búlgaro; no se garantiza un comportamiento correcto en otros idiomas.
- Longitud de contexto efectiva de 512 tokens en el código de referencia; textos más largos se truncan, lo que puede degradar la recuperación de pasajes largos.
- No admite prefijos de consulta ni instrucciones: añadirlos altera los vectores respecto al régimen de entrenamiento.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en similitud semántica cuando los textos comparten vocabulario sin compartir significado.
- Sesgos heredados del corpus: Wikipedia búlgara de mayo de 2024, con la cobertura, el estilo enciclopédico y los sesgos de esa fuente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base BgGPT-7B-Instruct-v0.2, no detallada en la información disponible.
- El paquete `llm2vec` exige una versión antigua de `transformers` (4.44 o inferior); con versiones recientes hay que usar el código de `transformers` puro incluido en la card.
- Solo 16 descargas y 1 like en Hugging Face en el momento de la consulta: ecosistema pequeño y poca validación externa.
- No se documentan cuantizaciones oficiales ni resultados de latencia/throughput para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mboyanov/bg2vec
- Modelo base: https://huggingface.co/INSAIT-Institute/BgGPT-7B-Instruct-v0.2
- Dataset de entrenamiento: https://huggingface.co/datasets/mboyanov/bgwiki
- Adaptador MNTP: https://huggingface.co/mboyanov/bggpt-mntp
- Código de entrenamiento: https://github.com/mboyanov/bg2vec
- Configuraciones de entrenamiento: https://github.com/mboyanov/bg2vec/tree/master/model_configurations
- Paper LLM2Vec: https://arxiv.org/abs/2404.05961
- Serie de blog "Let's build Bg2Vec": https://mboyanov.github.io/2024/05/18/Bg2Vec.html
- Evaluación (parte 5): https://mboyanov.github.io/2024/11/02/Bg2VecEval.html
- Demo de búsqueda: https://huggingface.co/spaces/mboyanov/bg2vec-demo
