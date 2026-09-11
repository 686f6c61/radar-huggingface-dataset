# amd/HyLo-Llama-14MLA14GDN-8K-SFT

## Resumen

HyLo-Llama-14MLA14GDN-8K-SFT es un modelo de investigación publicado por AMD que convierte un transformer denso ya entrenado (`meta-llama/Llama-3.2-3B-Instruct`) en una arquitectura híbrida mediante "upcycling", en lugar de preentrenar un híbrido desde cero. El resultado tiene 28 capas y 3.971.381.500 parámetros: 14 capas de Multi-head Latent Attention (MLA) en los índices pares y 14 capas Gated DeltaNet en los impares. Las capas MLA cachean un latente de bajo rango en vez de claves y valores completos, y las Gated DeltaNet mantienen un estado recurrente de tamaño fijo sin caché KV, lo que deja la caché total en un 4,7 % de la del modelo base.

El checkpoint se ha ajustado por supervisión a 8.192 tokens de contexto (8K) usando `meta-llama/Llama-3.1-8B-Instruct` como profesor de destilación. La relevancia práctica está en el coste de inferencia en contexto largo: reducir la caché KV a menos de una vigésima parte permite atender muchas más secuencias concurrentes por GPU o sostener ventanas largas en hardware modesto, sin renunciar a la precisión en contexto corto del modelo original.

El modelo se presenta en el artículo "Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling" (arXiv:2604.24715) como `HyLo-Llama-14MLA14GDN`. Es un release solo para inglés, con licencia de investigación, cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 28 capas: 14 MLA (índices pares) + 14 Gated DeltaNet (índices impares) |
| Parametros totales | 3.971.381.500 (3,97B; el artículo reporta 4,0B) |
| Parametros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | 8.192 tokens (entrenado y evaluado); escalado YaRN con factor 4,0 sobre una ventana original de 2.048 |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors en float32, sin versiones cuantizadas |
| Idiomas soportados | Inglés (en) |
| Licencia | `amd-hybrid-models-research-only-rail-ms`; el frontmatter de la model card declara además `apache-2.0` (véase "Limitaciones y advertencias") |
| Formato de pesos | safetensors, checkpoint en float32 (cargar en bfloat16) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Profesor de destilación | meta-llama/Llama-3.1-8B-Instruct |
| Caché KV | 4,7 % de la del modelo base |
| Tamano del repositorio | 15,9 GB |
| Precisión del checkpoint | float32 |
| Hardware de entrenamiento | 8x AMD Instinct MI300X con FSDP |
| Fecha de publicación | 2026-09-11 |

## Arquitectura y entrenamiento

La conversión no sigue un patrón repetitivo de bloques: las capas MLA se colocan por índice en las posiciones donde el modelo base es más sensible a perder atención completa. Las 14 capas MLA usan un rango latente de KV (`kv_lora_rank`) de 128, un rango latente de query (`q_lora_rank`) de 1.536, dimensión de cabeza RoPE (`qk_rope_head_dim`) de 64, dimensión de cabeza NoPE (`qk_nope_head_dim`) de 64, dimensión de cabeza de valor (`v_head_dim`) de 128 y 24 cabezas de atención. Las 14 capas Gated DeltaNet, que implementan una atención lineal con regla delta con compuertas y estado recurrente de tamaño fijo, usan 9 cabezas (`gdn_num_heads`) con dimensión de cabeza (`gdn_head_dim`) de 256 y no aportan caché KV. El diseño híbrido se describe en `hybrid_config.json`; el `config.json` del repositorio es el del modelo base y se conserva solo como referencia.

El entrenamiento consta de dos etapas. La primera es Enhanced-ILD, una destilación capa a capa que alinea los bloques MLA y lineales recién inicializados con las representaciones internas del modelo base, a 2.048 tokens de contexto, con tasa de aprendizaje 2e-4 y el 20 % de la mezcla de SFT. La segunda es un SFT de contexto largo con destilación guiada por profesor (`Llama-3.1-8B-Instruct`) a 8.192 tokens, con tasa de aprendizaje 4e-5 y la mezcla completa. La pérdida es divergencia KL entre las distribuciones del siguiente token del estudiante y del profesor (`kl_weight` 1,0, `ce_weight` 0,0), con tamaño de lote global de 16 secuencias, 1 época, schedule coseno y ratio de warmup de 0,01, en precisión mixta bfloat16. Para reducir memoria se empleó un kernel KL fusionado que evita materializar el tensor completo de logits.

Datos de entrenamiento declarados:

| Dataset | Licencia |
|---|---|
| JunxiongWang/sftdatasetv3 | apache-2.0 |
| nvidia/OpenMathInstruct-2 | cc-by-4.0 |
| open-thoughts/OpenThoughts-114k | apache-2.0 |
| open-r1/OpenR1-Math-220k | apache-2.0 |
| nvidia/ChatQA2-Long-SFT-data | cc-by-nc-2.0 |

AMD utilizó variantes procesadas de estos datasets (submuestreo, reformateo a la plantilla de chat y descontaminación contra las suites de evaluación).

## Capacidades

- Generación de texto y conversación en inglés (etiquetas `text-generation` y `conversational`).
- Razonamiento matemático y resolución de problemas: la mezcla de SFT incluye `nvidia/OpenMathInstruct-2` y `open-r1/OpenR1-Math-220k`.
- Razonamiento de varios pasos con trazas de pensamiento, procedente de `open-thoughts/OpenThoughts-114k`.
- Preguntas y respuestas sobre documentos largos, gracias a `nvidia/ChatQA2-Long-SFT-data` y al ajuste a 8.192 tokens.
- Instrucción general y diálogo multiturno, heredado del modelo base y de `JunxiongWang/sftdatasetv3`.
- Inferencia con caché KV muy reducida (4,7 % del modelo base), lo que habilita mayor concurrencia a igual memoria.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente y planificación autónoma: no disponible en la información proporcionada.
- Multilingüismo: no soportado más allá del inglés.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- RAG sobre documentación extensa: con 8.192 tokens de contexto entrenado se pueden insertar bloques grandes de documentación y mantener respuestas ancladas, con una caché KV de solo unos 43 MB por secuencia, lo que permite servir muchas consultas simultáneas en una sola GPU.
- Atención al cliente automatizada en inglés: conversaciones multiturno con historial largo caben en la ventana de 8K, y el coste de memoria por sesión es aproximadamente una vigésima parte del de un transformer denso equivalente.
- Sustitución directa de `Llama-3.2-3B-Instruct` en servicios existentes: al compartir tokenizador, plantilla de chat y modelo base, la migración es inmediata, a cambio de limitar la ventana a 8K en lugar de los 128K declarados por el modelo original.
- Investigación en arquitecturas híbridas: sirve como referencia reproducible para estudiar "upcycling" de atención completa a MLA + Gated DeltaNet y para medir el impacto de la compresión de caché KV sobre la calidad.
- Experimentos de destilación y ajuste fino posterior: el checkpoint es un punto de partida para probar recetas de SFT o DPO sobre una arquitectura híbrida y comparar con el profesor de 8B.
- Evaluación de motores de inferencia: útil para validar el soporte de MLA y Gated DeltaNet, el dimensionado de la caché KV a partir de `max_position_embeddings` y el comportamiento del batching continuo en aceleradores AMD Instinct.
- Generación de resúmenes y extracción de información en documentos técnicos largos, apoyándose en los datos de ChatQA2-Long usados durante el ajuste.
- Tutoría y asistencia matemática paso a paso para usuarios en inglés, aprovechando las trazas de razonamiento de la mezcla de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` del repositorio contiene una entrada con la lista de resultados vacía, y la sección de evaluación de la model card remite a la Tabla 3 del artículo (arXiv:2604.24715) para el backbone Llama-3.2-3B, indicando que las medidas son 0-shot y mencionando números de RULER, pero las cifras concretas no aparecen en la información proporcionada. No se deben asumir valores de MMLU, HumanEval, GSM8K ni RULER para este checkpoint sin consultar el artículo.

## Requisitos de hardware

- Pesos en el checkpoint publicado (float32): 15,9 GB, tal como figura en el tamaño del repositorio.
- Pesos en bfloat16 (formato recomendado de carga): aproximadamente 8 GB.
- Estimación en 8 bits: alrededor de 4 GB; en 4 bits: alrededor de 2 GB (estimaciones calculadas a partir del número de parámetros, no confirmadas por el autor).
- Caché KV: estimada en unos 5,3 KiB por token en bfloat16 (14 capas MLA con un latente de 128 + 64 dimensiones; las capas Gated DeltaNet no generan caché), lo que da unos 43 MB para una secuencia completa de 8.192 tokens, coherente con el 4,7 % declarado. Un transformer denso con la misma ventana consumiría del orden de 0,9 GB por secuencia.
- Cabe en GPU de consumo: sí. Con 8 GB de VRAM es viable en 4 bits; 16 GB permiten bfloat16 con margen para activaciones y caché; 24 GB (RTX 3090, RTX 4090) permiten bfloat16 con lotes pequeños o varios contextos de 8K simultáneos.
- AMD Instinct MI300X es el acelerador usado en el entrenamiento (8 unidades) y es el entorno de referencia natural para inferencia, aunque no se publican latencias ni throughput.
- Opciones de despliegue: la model card hace referencia a fijar explícitamente la longitud máxima mediante un flag del tipo `--max-model-len 8192`, habitual en vLLM, pero la información disponible no confirma la lista de motores compatibles con MLA y Gated DeltaNet. No hay pesos GGUF en el repositorio, por lo que llama.cpp y Ollama no son utilizables sin una conversión previa y soporte de la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Caché KV | Licencia | Notas |
|---|---|---|---|---|---|
| HyLo-Llama-14MLA14GDN-8K-SFT | 3,97B | 8.192 tokens | 4,7 % del base | amd-hybrid-models-research-only-rail-ms | Híbrido MLA + Gated DeltaNet, destilado de Llama-3.1-8B-Instruct |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B (nominal según la designación del modelo) | `max_position_embeddings` de 131.072 heredado en la configuración | 100 % (referencia) | Llama 3.2 Community License (no detallada en la información disponible) | Modelo base denso; atención completa y caché KV growth lineal |
| Hermano HyLo entrenado a 64K | No disponible | 65.536 tokens (según la model card) | No disponible | amd-hybrid-models-research-only-rail-ms | Misma receta a mayor longitud; recomendado por el autor para 16K o más |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con alternativas de tamaño similar (Qwen, Gemma, Phi u otros modelos de ~4B). Cualquier comparación de calidad queda pendiente de la Tabla 3 del artículo.

## Limitaciones y advertencias

- Discrepancia de licencia: el frontmatter de la model card declara `apache-2.0` pero también `license_name: amd-hybrid-models-research-only-rail-ms`, y el campo de licencia de la página de HuggingFace es `amd-hybrid-models-research-only-rail-ms`. Debe asumirse uso exclusivo de investigación hasta que AMD aclare la contradicción.
- Uno de los datasets de entrenamiento, `nvidia/ChatQA2-Long-SFT-data`, tiene licencia `cc-by-nc-2.0`, no comercial, lo que añade restricciones sobre el uso comercial del checkpoint.
- Contexto real de 8.192 tokens. El valor `max_position_embeddings = 131.072` está heredado del modelo base y no representa una longitud soportada; el propio autor advierte que no mide ni reclama calidad más allá de 8K. Los motores de inferencia dimensionan la caché KV a partir de ese campo, por lo que hay que fijar el límite explícitamente.
- Degradación severa esperable si se supera la longitud de entrenamiento; el autor remite a los números de RULER para ilustrar ese comportamiento.
- Idioma único: inglés. No hay evidencia de competencia en castellano ni en otros idiomas.
- Sesgos y alucinación: el modelo hereda los sesgos y la tendencia a la alucinación de `Llama-3.2-3B-Instruct` y del profesor de destilación, y no se ha publicado ninguna evaluación de seguridad, sesgo o veracidad específica para este checkpoint.
- Checkpoint en float32: cargarlo sin convertir a bfloat16 duplica el consumo de memoria previsto.
- Compatibilidad de herramientas limitada: al tratarse de una arquitectura híbrida con MLA y Gated DeltaNet, el soporte en ecosistemas de inferencia convencionales (llama.cpp, GGUF, Ollama) no está garantizado y no se documenta en el repositorio.
- Madurez: 0 descargas y 0 "likes" en el momento de la publicación, sin validación independiente por parte de la comunidad.
- Interacción con la licencia del modelo base Llama 3.2: no se detalla en la información disponible qué condiciones adicionales impone sobre un modelo derivado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amd/HyLo-Llama-14MLA14GDN-8K-SFT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Profesor de destilación: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Artículo principal (Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling): https://arxiv.org/abs/2604.24715
- Referencia arXiv adicional citada en las etiquetas del repositorio: https://arxiv.org/abs/2505.17272
- Referencia arXiv adicional citada en las etiquetas del repositorio: https://arxiv.org/abs/2503.11132
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data

La búsqueda web realizada no devolvió documentación técnica adicional: los resultados se limitaron a páginas corporativas de AMD y entradas de enciclopedia, sin información utilizable sobre este modelo.
