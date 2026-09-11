# amd/HyLo-Llama-8MLA8GDN-64K-SFT

## Resumen

HyLo-Llama-8MLA8GDN-64K-SFT es un modelo de 1,61 mil millones de parámetros desarrollado por AMD que convierte (upcycling) un Transformer denso preentrenado, concretamente meta-llama/Llama-3.2-1B-Instruct, en una arquitectura híbrida. La conversión sustituye 8 de las 16 capas por bloques de Multi-head Latent Attention (MLA) y las 8 restantes por bloques lineales Gated DeltaNet, que mantienen un estado recurrente de tamaño fijo y no generan caché KV. El resultado es un modelo que conserva la precisión de contexto corto del original pero ejecuta la inferencia con solo el 7,8 % de la caché KV del modelo base.

El checkpoint se ha afinado con supervisión (SFT) a 65.536 tokens de contexto, usando meta-llama/Llama-3.1-8B-Instruct como profesor de destilación. La relevancia de este lanzamiento es doble: por un lado, demuestra una vía de escalado de contexto largo que no requiere preentrenar desde cero; por otro, es una muestra del soporte de AMD (Instinct MI300X) para entrenamiento de arquitecturas híbridas de atención.

Se publica bajo una licencia de investigación propia de AMD, con una discrepancia documental relevante: los metadatos de HuggingFace y el frontmatter de la model card declaran apache-2.0, mientras que el campo license_name apunta a `amd-hybrid-models-research-only-rail-ms` y el campo de licencia de la ficha indica esa misma licencia restrictiva. Cualquier uso comercial debe resolverse antes de desplegar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 8 capas MLA + 8 capas Gated DeltaNet (16 capas totales) |
| Parametros totales | 1.613.437.024 (1,61B; el paper reporta 1,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 65.536 tokens entrenados y evaluados; `max_position_embeddings` en config es 131.072 pero no está soportado |
| Tipos de cuantizacion | No disponible (pesos publicados en float32, se recomienda cargar en bfloat16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `amd-hybrid-models-research-only-rail-ms` (research only); los metadatos declaran también apache-2.0, con discrepancia no resuelta |
| Formato de pesos | safetensors (float32) |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Profesor de destilación | meta-llama/Llama-3.1-8B-Instruct |
| Caché KV | 7,8 % de la del modelo base |
| Tamaño del repositorio | 6,5 GB |
| Fecha de publicación | 11 de septiembre de 2026 |

Dimensiones de las capas MLA:

| Dimension MLA | Valor |
|---|---|
| Rango latente de KV (`kv_lora_rank`) | 128 |
| Rango latente de query (`q_lora_rank`) | 1344 |
| Dimensión de cabeza RoPE (`qk_rope_head_dim`) | 32 |
| Dimensión de cabeza NoPE (`qk_nope_head_dim`) | 32 |
| Dimensión de cabeza de valor (`v_head_dim`) | 64 |
| Cabezas de atención | 32 |

Dimensiones de los bloques Gated DeltaNet:

| Dimension Gated DeltaNet | Valor |
|---|---|
| Cabezas (`gdn_num_heads`) | 6 |
| Dimensión de cabeza (`gdn_head_dim`) | 256 |

## Arquitectura y entrenamiento

La arquitectura no sigue un patrón repetitivo de capas: la colocación es por índice. Las capas MLA ocupan las posiciones `[0, 2, 4, 6, 8, 10, 12, 14]`, es decir, donde el modelo base es más sensible a perder atención completa, y las capas Gated DeltaNet ocupan `[1, 3, 5, 7, 9, 11, 13, 15]`. Las capas MLA conservan la atención pero cachean un latente de bajo rango en lugar de claves y valores completos, mientras que Gated DeltaNet es un bloque de atención lineal con regla delta y mecanismo de compuerta que mantiene un estado recurrente de tamaño fijo, por lo que no contribuye nada a la caché KV. El layout híbrido se describe en `hybrid_config.json`; el `config.json` incluido es el del modelo base y se mantiene solo como referencia. Las posiciones se escalan con YaRN (`factor: 32.0`) sobre una ventana original de 2.048 tokens.

El entrenamiento consta de dos etapas. La primera, Enhanced-ILD, aplica destilación capa a capa para alinear los bloques MLA y lineales recién inicializados con las representaciones internas del modelo base, a 2.048 tokens de contexto, con learning rate 2e-4 y usando el 20 % de la mezcla de SFT. La segunda es un SFT de contexto largo con destilación guiada por profesor a 65.536 tokens, learning rate 6e-5 y la mezcla completa. La función de pérdida es divergencia KL entre las distribuciones del alumno y del profesor (`kl_weight 1.0`, `ce_weight 0.0`), con batch global de 8 secuencias, 1 época, scheduler coseno y warmup del 1 %. Se entrenó en precisión mixta bfloat16 sobre 8x AMD Instinct MI300X con FSDP, empleando destilación eficiente en memoria mediante `chunked_kl`. La mezcla de datos combina JunxiongWang/sftdatasetv3, nvidia/OpenMathInstruct-2, open-thoughts/OpenThoughts-114k, open-r1/OpenR1-Math-220k y nvidia/ChatQA2-Long-SFT-data, con variantes procesadas por AMD (submuestreo, reformateo a la plantilla de chat y descontaminación contra los conjuntos de evaluación).

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de instrucciones del modelo base Llama-3.2-1B-Instruct.
- Razonamiento matemático y de sentido común, reforzado por la mezcla de SFT que incluye OpenMathInstruct-2 y OpenR1-Math-220k.
- Procesamiento de contexto largo de hasta 65.536 tokens gracias al escalado YaRN y a la destilación a esa longitud.
- Eficiencia de memoria en inferencia: la caché KV se reduce al 7,8 % de la del modelo base, lo que abarata el servicio con contextos muy largos.
- Manejo de documentos largos y preguntas sobre ellos, apoyado por el conjunto ChatQA2-Long-SFT-data usado en el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio, etc.): no disponibles.

## Casos de uso

- Atención al cliente con historiales largos: el modelo puede mantener conversaciones multi-turno con hasta 65.536 tokens de contexto y, al reducir la caché KV al 7,8 %, el coste de memoria por sesión concurrente cae de forma notable, lo que permite más usuarios simultáneos por GPU.
- Análisis de documentos extensos: resumen y extracción de información de contratos, informes o expedientes que ocupen decenas de miles de tokens, un escenario para el que el modelo fue específicamente entrenado y evaluado.
- Asistente de razonamiento matemático en entornos educativos: la mezcla de SFT incluye dos conjuntos de matemáticas de gran tamaño, lo que permite usarlo para resolver y explicar problemas paso a paso en inglés.
- Investigación en arquitecturas híbridas: sirve como punto de partida reproducible para estudiar el upcycling de Transformers densos a modelos híbridos MLA + Gated DeltaNet sin preentrenar desde cero.
- Destilación y generación de datos sintéticos a bajo coste: con solo 1,61B parámetros puede actuar como generador de anotaciones o de trayectorias de razonamiento a gran escala, aprovechando la ventana de 64K para procesar lotes de contexto largo.
- Prototipado en hardware modesto: al pesar unos 3,2 GB en bfloat16, cabe en GPU de consumo y permite validar pipelines de contexto largo antes de escalar a modelos mayores.
- Evaluación comparativa de mecanismos de atención lineal: útil para medir el impacto real de Gated DeltaNet frente a MLA pura en tareas de razonamiento de contexto corto.
- Chatbot de dominio con base documental: combinado con un recuperador, puede responder preguntas sobre corpus técnicos largos en inglés sin degradar la latencia por el crecimiento de la caché.

## Benchmarks y rendimiento

El model-index de la model card no contiene resultados (`results: []`). Los datos siguientes proceden de la Tabla 2 del paper (backbone Llama-3.2-1B) y están medidos 0-shot con EleutherAI lm-evaluation-harness, tal como los reporta el autor.

Razonamiento de sentido común (exactitud, 0-shot):

| Tarea | HyLo-Llama-8MLA8GDN |
|---|---:|
| ARC-Challenge | 36,4 |
| ARC-Easy | 64,4 |
| HellaSwag | 57,2 |
| OpenBookQA | 37,0 |
| PIQA | 72,3 |
| RACE | 37,1 |
| WinoGrande | 58,4 |
| **Media** | **51,8** |

Contexto largo: la model card anuncia una sección RULER con las 13 tareas a 8K, 16K, 32K y 64K, pero los valores numéricos no están incluidos en la información disponible. Por tanto: no disponible.

## Requisitos de hardware

- Pesos en float32: 6,45 GB (el repositorio ocupa 6,5 GB). Cargar en bfloat16 reduce el peso a aproximadamente 3,2 GB.
- VRAM estimada en bfloat16: alrededor de 3,2 GB para pesos, más la caché KV y activaciones. Según el autor, la caché KV es el 7,8 % de la del modelo base; tomando la configuración de Llama-3.2-1B (16 capas, 8 cabezas KV, dimensión de cabeza 64, bfloat16), la caché del base a 64K rondaría los 2 GB, por lo que la del modelo híbrido quedaría en el orden de 150-200 MB. Es una estimación derivada del dato del autor, no una cifra publicada.
- Cabe en GPU de consumo: sí. Con ~3,2 GB de pesos, es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes. También en GPUs de 8 GB con margen para la caché.
- GPU profesionales recomendadas: AMD Instinct MI300X (la plataforma usada en el entrenamiento), así como A100, H100 o L40S en el lado NVIDIA.
- Opciones de despliegue: el autor advierte que los stacks de serving dimensionan la caché KV a partir de `max_position_embeddings`, por lo que hay que fijar explícitamente la longitud máxima (por ejemplo `--max-model-len 65536`). vLLM es el candidato natural para esta arquitectura híbrida. No hay confirmación de soporte en llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| HyLo-Llama-8MLA8GDN-64K-SFT | 1,61B | 65.536 | AMD research only (con discrepancia documental frente a apache-2.0) | safetensors en HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct (base) | 1,23B | 128.000 | Llama 3.2 Community License | safetensors en HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct (profesor) | 8,03B | 128.000 | Llama 3.1 Community License | safetensors en HuggingFace |

Otras alternativas de la misma categoría (modelos densos de 1-2B con foco en contexto largo, como Qwen2.5-1.5B-Instruct) no cuentan con datos verificados en la información proporcionada, por lo que no se incluyen cifras comparativas de rendimiento. Tampoco hay resultados de benchmarks de los modelos base y profesor en la información disponible.

## Limitaciones y advertencias

- Idioma: únicamente inglés declarado. El uso en castellano no está soportado ni evaluado.
- Contexto: aunque `config.json` declara `max_position_embeddings` de 131.072, el modelo solo fue entrenado y evaluado a 65.536 tokens. El propio autor advierte que la calidad por encima de esa longitud no está medida ni respaldada, y que los stacks de serving pueden dimensionar mal la caché si se confían en el valor del config.
- Licencia: existe una contradicción explícita entre el campo de licencia de HuggingFace (`amd-hybrid-models-research-only-rail-ms`), el `license: apache-2.0` del frontmatter y el tag `license:apache-2.0`. Debe aclararse con el autor antes de cualquier uso comercial; la lectura conservadora es investigación únicamente.
- Datos de entrenamiento con restricciones: nvidia/ChatQA2-Long-SFT-data se distribuye bajo cc-by-nc-2.0 (no comercial), lo que condiciona la licencia efectiva del modelo derivado.
- Sesgos conocidos: no documentados en la información disponible. Al derivar de Llama-3.2-1B-Instruct y entrenarse con mezclas en inglés, es previsible que herede sesgos de esos datos, pero no hay auditoría publicada.
- Riesgo de alucinación: no cuantificado. Con 1,61B parámetros y entrenamiento de destilación desde un profesor de 8B, la fidelidad factual en dominios abiertos es limitada.
- Capacidades de agente y tool calling: no confirmadas, por lo que no deberían asumirse en producción.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se publican pesos cuantizados ni contenedores de despliegue, lo que reduce su preparación para producción.
- Rendimiento en contexto largo: la model card anuncia resultados RULER a 8K, 16K, 32K y 64K, pero no se incluyen en la información disponible, así que la degradación real a 64K no puede verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Llama-8MLA8GDN-64K-SFT
- Paper principal, Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling: https://arxiv.org/abs/2604.24715
- Referencia arXiv adicional: https://arxiv.org/abs/2505.17272
- Referencia arXiv adicional: https://arxiv.org/abs/2503.11132
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor de destilación: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Página corporativa de AMD: https://www.amd.com/en.html
