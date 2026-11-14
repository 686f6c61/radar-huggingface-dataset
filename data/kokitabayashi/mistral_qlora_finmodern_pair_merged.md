# kokitabayashi/mistral_qlora_finmodern_pair_merged

## Resumen

`kokitabayashi/mistral_qlora_finmodern_pair_merged` es un modelo de embeddings de texto derivado de Mistral-7B, publicado por el usuario kokitabayashi en Hugging Face. Se distribuye bajo la librería `sentence-transformers` con pipeline `feature-extraction`, lo que indica que su propósito es generar representaciones vectoriales densas para tareas de recuperación, similitud semántica, clasificación y clustering, no la generación de texto libre. El nombre sugiere un ajuste fino mediante QLoRA sobre pares del dominio financiero moderno y una posterior fusión de los pesos del adaptador con la base.

El modelo cuenta con 7.110.660.096 parámetros (aproximadamente 7,1 mil millones), un tamaño de repositorio de 14,2 GB y pesos en formato safetensors. La model card declara resultados de evaluación en tareas MTEB y C-MTEB, aunque los `model-index` están etiquetados con el nombre `e5-mistral-7b-instruct`, lo que apunta a que el autor reutilizó la plantilla de evaluación de ese modelo de referencia en lugar de generar una identidad propia.

Es relevante ahora porque los embeddings especializados de dominio (en este caso, financiero) permiten mejorar la recuperación semántica en pipelines RAG sobre documentación técnica y regulatoria, aunque la ausencia de documentación detallada sobre el dataset de entrenamiento y la falta de verificación de los benchmarks obligan a tratar sus resultados con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Mistral-7B (ajuste QLoRA y fusión de pesos) |
| Parametros totales | 7.110.660.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (declarado en la model card); los benchmarks incluyen evaluaciones en de, es, fr, ja y zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B, un transformer decoder-only con atención de ventana deslizante y RoPE, reutilizado aquí como encoder de frases mediante la técnica habitual en la familia E5-Mistral: pooling de la última representación oculta y entrenamiento con objetivos contrastivos sobre pares de frases. El nombre del repositorio indica que se aplicó un ajuste QLoRA (cuantización de 4 bits durante el entrenamiento del adaptador) sobre pares del dominio financiero moderno, seguido de una fusión de los pesos del adaptador con el modelo base para producir un checkpoint único.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la proporción de pares positivos y negativos, ni sobre si se aplicaron etapas de RLHF o DPO. La evaluación declarada se realizó con el arnés de MTEB y C-MTEB, lo que sugiere que el autor siguió la receta de evaluación de `intfloat/e5-mistral-7b-instruct`. La práctica de fusionar un adaptador QLoRA con la base puede introducir discrepancias numéricas entre la precisión del adaptador y la de la base, un problema documentado en la comunidad (véase el hilo de r/LocalLLaMA sobre corrupción de modelos tras merge y cuantización).

## Capacidades

- Generación de embeddings de frase y de pasaje para similitud semántica y recuperación densa.
- Codificación de consultas y documentos para pipelines de búsqueda semántica (bi-encoder).
- Clasificación de texto por similitud con prototipos o mediante clasificador sobre embeddings.
- Clustering y deduplicación semántica de documentos.
- Soporte de tareas MTEB de tipo STS, Classification y Retrieval (evaluado en el model-index).
- Capacidad multilingüe parcial evidenciada en los benchmarks (en, de, es, fr, ja, zh), aunque el campo `language` solo declara `en`.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explícito; al ser un modelo de embeddings, estas capacidades no aplican.

## Casos de uso

- Búsqueda semántica sobre documentación financiera: indexar informes, notas y filings como embeddings y recuperar los pasajes más relevantes para una consulta, aprovechando el ajuste declarado sobre pares del dominio financiero.
- RAG (retrieval-augmented generation) en asistentes internos: usar el modelo como recuperador en un pipeline que alimente a un LLM generador con contexto documental, reduciendo alucinaciones al acotar la evidencia.
- Deduplicación de noticias y comunicados: calcular similitud coseno entre embeddings para detectar publicaciones repetidas o casi idénticas en un feed de noticias financieras.
- Clasificación temática de tickets o correos: entrenar un clasificador ligero (regresión logística o kNN) sobre los embeddings para enrutar consultas a los equipos adecuados.
- Detección de similitud entre cláusulas contractuales: comparar fragmentos de contratos para identificar cláusulas equivalentes o contradictorias en procesos de revisión legal.
- Agrupación de opiniones de clientes: aplicar clustering sobre embeddings de reseñas para descubrir temas recurrentes sin etiquetas previas.
- Búsqueda multilingüe en catálogos: aunque el idioma declarado es `en`, los resultados en de, es, fr, ja y zh sugieren utilidad razonable para recuperación cross-lingual, siempre validando con datos propios.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| STS | MTEB AFQMC (validation) | cos_sim_spearman | 38,99 |
| STS | MTEB ATEC (test) | cos_sim_spearman | 42,84 |
| Classification | AmazonCounterfactual (en) | accuracy | 78,69 |
| Classification | AmazonCounterfactual (de) | accuracy | 74,05 |
| Classification | AmazonCounterfactual (en-ext) | accuracy | 77,93 |
| Classification | AmazonCounterfactual (ja) | accuracy | 77,22 |
| Classification | AmazonPolarity | accuracy | 95,91 |
| Classification | AmazonReviews (en) | accuracy | 55,79 |
| Classification | AmazonReviews (de) | accuracy | 53,26 |
| Classification | AmazonReviews (es) | accuracy | 50,33 |
| Classification | AmazonReviews (fr) | accuracy | 49,30 |
| Classification | AmazonReviews (ja) | accuracy | 48,69 |
| Classification | AmazonReviews (zh) | accuracy | 46,24 |
| Retrieval | ArguAna | ndcg_at_10 | 61,88 |
| Retrieval | ArguAna | map_at_10 | 53,08 |

Los resultados de AFQMC y ATEC son notablemente bajos para un modelo de 7B orientado a embeddings, lo que sugiere un posible desajuste entre el dominio de entrenamiento y esas tareas, o un problema en la configuración de evaluación. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 14-15 GB solo para pesos, más overhead de activaciones y del tokenizador; en la práctica, 16-18 GB para lotes pequeños.
- VRAM estimada en 8 bits: aproximadamente 7-8 GB de pesos, viable en GPUs de 12 GB con lotes reducidos.
- VRAM estimada en 4 bits (GPTQ/AWQ, si se generan cuantizaciones): en torno a 4-5 GB de pesos, apto para GPUs consumer de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para indexación a gran escala; RTX 4090 (24 GB) para fp16 con lotes moderados; RTX 3090/4080 (16-24 GB) para fp16 o 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en fp16 y en RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` (declarado en los tags), `vLLM` con task embedding, `llama.cpp`/`Ollama` si se generan GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| kokitabayashi/mistral_qlora_finmodern_pair_merged | 7,1 B | no disponible | MIT | Embeddings de dominio financiero (QLoRA + merge) |
| intfloat/e5-mistral-7b-instruct | 7,1 B | 4096 tokens (según model card pública del original) | MIT | Embeddings de propósito general con instrucciones |
| BAAI/bge-large-en-v1.5 | 335 M | 512 tokens | MIT | Embeddings ligeros en inglés |
| jinaai/jina-embeddings-v2-base-en | 137 M | 8192 tokens | Apache 2.0 | Embeddings de contexto largo |

La comparación con `e5-mistral-7b-instruct` es la más directa: mismo tamaño y misma familia, pero el modelo de kokitabayashi no documenta contexto, dataset ni verificación de resultados, mientras que el original publica una model card detallada y evaluaciones reproducibles. Frente a `bge-large` y `jina-v2-base`, el modelo aquí descrito ofrece mucha mayor capacidad pero también un coste de inferencia muy superior y menor transparencia.

## Limitaciones y advertencias

- Los benchmarks del `model-index` están marcados como no verificados y etiquetados bajo el nombre `e5-mistral-7b-instruct`, lo que impide atribuirles con certeza la identidad del modelo evaluado.
- No se documenta el dataset de entrenamiento ni el proceso de fusión de pesos; la reproducibilidad es muy limitada.
- El campo `language` declara solo `en`, aunque hay evaluaciones en otros idiomas; el rendimiento multilingüe real no está garantizado.
- La fusión de un adaptador QLoRA con la base puede introducir degradación numérica respecto al adaptador original, como se ha reportado en la comunidad.
- Al ser un modelo de embeddings, no debe usarse para generación de texto; hacerlo produciría salidas incoherentes.
- Riesgo de sesgos heredados de Mistral-7B y del corpus financiero empleado en el ajuste, no auditado.
- La licencia MIT permite uso comercial, pero la ausencia de documentación sobre la procedencia de los datos de ajuste traslada al usuario la responsabilidad de verificar el cumplimiento normativo.
- No hay garantías de soporte, mantenimiento ni actualizaciones del repositorio (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kokitabayashi/mistral_qlora_finmodern_pair_merged
- Paper de referencia E5-Mistral (arXiv:2401.00368): https://arxiv.org/abs/2401.00368
- Paper de Sentence-BERT (arXiv:1908.10084, referenciado indirectamente por la librería): no disponible en la información proporcionada
- Paper de MTEB (arXiv:2210.07316): https://arxiv.org/abs/2210.07316
- Paper de QLoRA (arXiv:2305.14314): no disponible en la información proporcionada
- Referencias citadas en los tags: arXiv:2104.08663, arXiv:2212.03533
- Hilo de la comunidad sobre merge de LoRA y cuantización: https://www.reddit.com/r/LocalLLaMA/comments/17n08qc/merged_mistral_base_plus_lora_performs_poorly_vs/
