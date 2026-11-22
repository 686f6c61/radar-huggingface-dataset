# finvector/mistral_lora_investo_tri_merged

## Resumen

`finvector/mistral_lora_investo_tri_merged` es un modelo de embeddings de texto derivado de la familia Mistral, publicado por el usuario finvector en Hugging Face. Se distribuye como un modelo de `sentence-transformers` para la tarea de `feature-extraction`, es decir, para generar representaciones vectoriales densas de texto (embeddings) que puedan usarse en búsqueda semántica, clustering, clasificación y recuperación de información. Con 7.110.660.096 parámetros (aproximadamente 7,1 mil millones) y un repositorio de 14,2 GB en formato safetensors, el modelo encaja en la categoría de embeddings de gran tamano basados en un LLM decoder-only.

El nombre sugiere una construccion por fusión (merged) de adaptadores LoRA sobre una base Mistral, orientada a un dominio concreto (investo). La model card declara resultados bajo el paraguas de `e5-mistral-7b-instruct`, lo que apunta a que la arquitectura y el pipeline de evaluacion siguen el esquema de los embeddings de Mistral-7B instruidos para MTEB. No obstante, la informacion publica es escasa: cero descargas, cero likes y una model card que esencialmente contiene el bloque `model-index` con resultados de MTEB, sin secciones descriptivas de entrenamiento, datos o uso.

La relevancia de esta ficha es acotada pero concreta: sirve para evaluar si este checkpoint merece integrarse en un pipeline de recuperacion o clasificacion. Al tratarse de un modelo de embeddings y no de un modelo generativo, sus casos de uso se centran en similitud semantica y ranking, no en generacion de texto, tool calling ni razonamiento multi-paso. La licencia MIT facilita su adopcion comercial, pero la falta de documentacion sobre el proceso de entrenamiento obliga a validar su comportamiento en el dominio objetivo antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Mistral (base de embeddings tipo e5-mistral-7b-instruct, segun model card) |
| Parametros totales | 7.110.660.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se declaran versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (declarado en la model card); los benchmarks incluyen evaluaciones en de, es, fr, ja, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un `sentence-transformers` construido sobre una base Mistral de 7B, con un pipeline de `feature-extraction`. El identificador interno de la model card es `e5-mistral-7b-instruct`, lo que indica que la arquitectura de referencia es la de los modelos de embeddings que adaptan un LLM decoder-only de Mistral-7B para producir representaciones de frase y pasaje, habitualmente mediante pooling sobre el ultimo token y entrenamiento contrastivo. El sufijo `lora_investo_tri_merged` sugiere que se aplicaron adaptadores LoRA sobre esa base y que posteriormente se fusionaron en los pesos del modelo, un procedimiento habitual para consolidar ajustes de dominio sin mantener modulos separados en inferencia.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del objetivo contrastivo (por ejemplo, si se empleo triplet loss, in-batch negatives o hard negatives). La model card no incluye seccion de entrenamiento ni hiperparametros. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el modelo es, a efectos practicos, un encoder de embeddings derivado de Mistral.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion densa (pipeline `feature-extraction`).
- Clasificacion de texto por similitud o mediante cabezales sobre las representaciones (evaluado en tareas de Classification de MTEB).
- Recuperacion de informacion (Retrieval) en benchmarks como ArguAna, segun el `model-index`.
- Evaluacion en tareas STS (semantic textual similarity) en conjuntos C-MTEB (AFQMC, ATEC).
- Soporte multilingue parcial en evaluacion: los resultados declarados cubren configuraciones en ingles, aleman, espanol, frances, japones y chino, aunque el unico idioma declarado oficialmente es `en`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking. Al ser un modelo de embeddings, estas capacidades no aplican.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar pasajes con el modelo y recuperar los mas similares a una consulta mediante similitud coseno; adecuado por su tamano de 7B y su entrenamiento orientado a embeddings.
- Clasificacion de resenas y tickets: usar los embeddings como entrada a un clasificador ligero (regresion logistica o MLP) para categorizar sentimiento o tematica, apoyandose en los resultados de clasificacion declarados en MTEB.
- Deduplicacion y clustering de articulos: agrupar documentos por cercania en el espacio de embeddings para detectar duplicados o construir topicos, sin necesidad de un modelo generativo.
- Recuperacion aumentada (RAG) en dominios financieros o de inversion: el sufijo `investo` sugiere un ajuste de dominio; usar el modelo como retriever en un pipeline RAG para recuperar contexto relevante antes de pasarlo a un LLM generador.
- Ranking de candidatos en motores de recomendacion textual: calcular similitud entre el perfil de un usuario y descripciones de productos o contenidos para ordenar resultados.
- Evaluacion de similitud entre pares de frases en control de calidad de traducciones o parafrasis: usar las puntuaciones de similitud para detectar desviaciones semanticas entre original y version.
- Filtrado previo en pipelines de moderacion: generar embeddings de mensajes y comparar contra un conjunto de referencia de contenido problematico para un primer cribado barato antes de un modelo mas costoso.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`). Se muestran los valores principales por tarea.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| STS | MTEB AFQMC (validation) | cos_sim_spearman | 38,99 |
| STS | MTEB ATEC (test) | cos_sim_spearman | 42,84 |
| Classification | AmazonCounterfactualClassification (en) | accuracy | 78,69 |
| Classification | AmazonCounterfactualClassification (de) | accuracy | 74,05 |
| Classification | AmazonCounterfactualClassification (en-ext) | accuracy | 77,93 |
| Classification | AmazonCounterfactualClassification (ja) | accuracy | 77,22 |
| Classification | AmazonPolarityClassification | accuracy | 95,91 |
| Classification | AmazonReviewsClassification (en) | accuracy | 55,79 |
| Classification | AmazonReviewsClassification (de) | accuracy | 53,26 |
| Classification | AmazonReviewsClassification (es) | accuracy | 50,33 |
| Classification | AmazonReviewsClassification (fr) | accuracy | 49,30 |
| Classification | AmazonReviewsClassification (ja) | accuracy | 48,69 |
| Classification | AmazonReviewsClassification (zh) | accuracy | 46,24 |
| Retrieval | ArguAna | map_at_10 | 53,08 |
| Retrieval | ArguAna | ndcg_at_10 | 61,88 |
| Retrieval | ArguAna | mrr_at_10 | 53,34 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de generacion, lo cual es coherente con un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14,2 GB solo para pesos, mas overhead de activaciones y pooling; en la practica, reservar 16-18 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos, con overhead adicional; no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para FP16. Una RTX 3090 (24 GB) tambien es viable.
- Cabe en GPU de consumo de gama alta (RTX 4090, RTX 3090) en FP16; en GPUs de 16 GB habria que recurrir a cuantizacion o a offloading.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` (el tag `text-embeddings-inference` esta presente), y endpoints compatibles (`endpoints_compatible`). No se declaran pesos GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finvector/mistral_lora_investo_tri_merged | 7,11B | no disponible | Embeddings (Mistral-7B) | MIT | Hugging Face |
| intfloat/e5-mistral-7b-instruct | 7B (referencia en model card) | no disponible | Embeddings (Mistral-7B) | MIT (segun modelo base) | Hugging Face |
| BAAI/bge-large-en-v1.5 | ~335M | 512 tokens (tipico) | Embeddings encoder | MIT | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | ~22M | 256-512 tokens | Embeddings encoder | Apache-2.0 | Hugging Face |

La comparacion con `e5-mistral-7b-instruct` es directa porque la propia model card usa ese nombre como referencia de evaluacion. Frente a encoders ligeros como `bge-large` o `all-MiniLM`, este modelo es dos ordenes de magnitud mayor, lo que implica mayor coste de inferencia pero potencialmente mejor calidad en dominios complejos. No se dispone de una comparacion numerica verificada entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no debe usarse para generar texto, razonar, invocar herramientas ni tareas de agente.
- Documentacion muy escasa: no se detallan datos de entrenamiento, hiperparametros ni el proceso de fusion LoRA; esto dificulta auditar sesgos o reproducir resultados.
- Resultados de benchmarks no verificados (`verified: false`) y declarados por el autor; deben tomarse como indicativos.
- Idioma declarado oficialmente solo `en`; aunque se evalua en otros idiomas, el soporte multilingue en produccion no esta garantizado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de similitudes espurias o recuperaciones irrelevantes en dominios fuera de distribucion.
- Sesgos potenciales heredados de Mistral-7B y de los datos de ajuste LoRA, no documentados.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validacion externa.
- Licencia MIT permite uso comercial, pero conviene verificar las obligaciones heredadas del modelo base Mistral y de los datasets de entrenamiento no declarados.
- No se ofrecen pesos cuantizados oficiales; el despliegue en hardware limitado requiere cuantizar por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/mistral_lora_investo_tri_merged
- Paper de referencia E5 (arxiv:2212.03533): https://arxiv.org/abs/2212.03533
- Paper de referencia sobre embeddings de LLM (arxiv:2401.00368): https://arxiv.org/abs/2401.00368
- Paper de Sentence-BERT (arxiv:2104.08663): https://arxiv.org/abs/2104.08663
- Paper de referencia sobre entrenamiento contrastivo (arxiv:2210.07316): https://arxiv.org/abs/2210.07316
- MTEB (Massive Text Embedding Benchmark): https://huggingface.co/spaces/mteb/leaderboard
- Documentacion de sentence-transformers: https://www.sbert.net/
