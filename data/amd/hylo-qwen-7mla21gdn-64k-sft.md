# amd/HyLo-Qwen-7MLA21GDN-64K-SFT

## Resumen

HyLo-Qwen-7MLA21GDN-64K-SFT es un checkpoint experimental publicado por AMD que convierte un transformer denso ya preentrenado (Qwen/Qwen3-1.7B) en un modelo híbrido de atención, en lugar de entrenar una arquitectura híbrida desde cero. De las 28 capas resultantes, 7 pasan a ser Multi-head Latent Attention (MLA), que cachea un latente de bajo rango en vez de claves y valores completos, y 21 se sustituyen por bloques lineales Gated DeltaNet, que mantienen un estado recurrente de tamaño fijo y no generan caché KV. El modelo final tiene 2.284.173.820 parámetros y una caché KV equivalente al 3,9 % de la del modelo base.

El checkpoint se ha afinado por supervisión (SFT) con destilación del profesor Qwen/Qwen3-8B a una longitud de contexto de 65.536 tokens, precedido de una fase de destilación capa a capa (Enhanced-ILD) que alinea los bloques MLA y Gated DeltaNet recién inicializados con las representaciones internas del modelo original. La pérdida es divergencia KL entre las distribuciones del alumno y del profesor, con `kl_weight` 1.0 y `ce_weight` 0.0.

Su interés es doble: por un lado, demuestra una vía de "upcycling" para obtener contexto largo reutilizando pesos densos en lugar de pagar un preentrenamiento híbrido completo; por otro, es un banco de pruebas reproducible para medir el compromiso entre calidad de atención completa y coste de memoria en inferencia. Se distribuye únicamente en inglés y con una licencia restringida a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 28 capas, 7 MLA (índices 1, 5, 9, 13, 17, 21, 25) + 21 Gated DeltaNet (resto de índices) |
| Parámetros totales | 2.284.173.820 (2,28B; el paper reporta 2,3B) |
| Parámetros activos | no aplica (no es un modelo MoE; todas las capas se activan) |
| Longitud de contexto | 65.536 tokens (entrenado y evaluado). YaRN con factor 2.0 sobre una ventana original de 32.768 |
| Tipos de cuantización | no disponible (solo se publican pesos en `safetensors` float32; no hay variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | inglés (campo `language: en` de la model card) |
| Licencia | `amd-hybrid-models-research-only-rail-ms` (solo investigación); los metadatos también declaran `apache-2.0` y `license_name` apunta al fichero `LICENSE` del repositorio |
| Formato de pesos | `safetensors` (pesos en float32; la model card indica cargarlos en bfloat16). Tamaño del repositorio: 9,1 GB |

Parámetros internos de atención:

| Dimensión MLA | Valor |
|---|---|
| Rango latente KV (`kv_lora_rank`) | 256 |
| Rango latente de query (`q_lora_rank`) | 1344 |
| Dimensión de cabeza RoPE (`qk_rope_head_dim`) | 64 |
| Dimensión de cabeza NoPE (`qk_nope_head_dim`) | 64 |
| Dimensión de cabeza de valor (`v_head_dim`) | 128 |
| Cabezas de atención | 16 |

| Dimensión Gated DeltaNet | Valor |
|---|---|
| Cabezas (`gdn_num_heads`) | 6 |
| Dimensión de cabeza (`gdn_head_dim`) | 256 |

## Arquitectura y entrenamiento

La conversión no sigue un patrón repetitivo de capas: los tipos se asignan por índice, colocando las capas MLA donde el modelo base es más sensible a perder atención completa. Las capas Gated DeltaNet implementan una regla delta con compuerta y atención lineal, con estado recurrente de tamaño fijo, por lo que no aportan caché KV; las capas MLA conservan atención pero cachean un latente de bajo rango. En conjunto, la caché resultante es el 3,9 % de la del modelo base. El diseño híbrido se describe en `hybrid_config.json`, mientras que `config.json` conserva la configuración del modelo base solo como referencia.

El entrenamiento consta de dos etapas. La primera, Enhanced-ILD, aplica destilación capa a capa a 2.048 tokens de contexto con tasa de aprendizaje 2e-4 sobre el 20 % de la mezcla de SFT, para alinear los bloques nuevos con el modelo original. La segunda es un SFT de contexto largo con destilación guiada por profesor a 65.536 tokens, tasa 6e-5 y la mezcla completa. En ambos casos la pérdida es KL entre las distribuciones del siguiente token del alumno y del profesor, con `kl_weight` 1.0 y `ce_weight` 0.0. Se usó tamaño de lote global de 8 secuencias, 1 época, scheduler coseno con ratio de warmup 0,01 y precisión mixta en bfloat16 sobre 8 GPU AMD Instinct MI300X con FSDP. Una innovación de implementación destacable es un kernel fusionado de KL que evita materializar el tensor completo de logits, lo que reduce el consumo de memoria durante la destilación.

Los datos de entrenamiento son variantes procesadas por AMD de cinco conjuntos: `JunxiongWang/sftdatasetv3` (apache-2.0), `nvidia/OpenMathInstruct-2` (cc-by-4.0), `open-thoughts/OpenThoughts-114k` (apache-2.0), `open-r1/OpenR1-Math-220k` (apache-2.0) y `nvidia/ChatQA2-Long-SFT-data` (cc-by-nc-2.0). El preprocesado incluyó submuestreo, reformateo a la plantilla de chat y descontaminación contra las suites de evaluación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, siguiendo la plantilla de chat del modelo base.
- Razonamiento de contexto largo: ventana utilizable de 65.536 tokens, entrenada y evaluada a esa longitud, con un coste de caché KV muy inferior al de un transformer denso equivalente.
- Razonamiento matemático y resolución de problemas paso a paso, favorecido por la presencia de OpenMathInstruct-2 y OpenR1-Math-220k en la mezcla de SFT.
- Preguntas y respuestas sobre documentos extensos e historiales de conversación largos, por la inclusión de ChatQA2-Long-SFT-data.
- Razonamiento de sentido común y comprensión lectora a nivel propio de un modelo de ~2B parámetros.
- Capacidad de servir con lotes grandes y contextos largos gracias a la reducción de caché KV, sin degradar la ventana corta según el diseño del método.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta en la model card).
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Capacidades de visión, audio o multimodalidad: no disponibles (modelo exclusivamente de texto).
- Capacidades multilingües: no disponibles; la model card declara únicamente inglés.

## Casos de uso

- Preguntas y respuestas sobre documentación técnica extensa: con 65.536 tokens de contexto se puede insertar un manual completo o varios ficheros de código y formular preguntas sin trocear el documento, evitando la pérdida de información típica de las estrategias de chunking.
- Análisis por lotes de contratos o informes largos: la caché KV reducida al 3,9 % permite mantener muchas secuencias de contexto largo en memoria simultáneamente, lo que abarata el procesamiento masivo en una sola GPU.
- Tutoría y asistencia matemática: el ajuste sobre OpenMathInstruct-2 y OpenR1-Math-220k lo hace adecuado para generar soluciones razonadas paso a paso en entornos educativos o de verificación de ejercicios.
- Resumen y seguimiento de hilos de conversación largos: útil en soporte técnico o moderación, donde el historial completo de la interacción cabe en la ventana y el modelo puede responder considerando todo el contexto previo.
- Extracción estructurada de información en documentos largos: dado un informe con anexos, extraer entidades, cifras o cláusulas concretas indicando su ubicación, aprovechando la ventana de 64K.
- Investigación en arquitecturas híbridas: sirve como punto de partida reproducible para ablaciones sobre el número y la posición de las capas MLA frente a las Gated DeltaNet, y para medir el impacto de la compresión de caché en tareas de contexto corto y largo.
- Despliegue en hardware de gama media para prototipos: con 2,28B parámetros cabe en GPUs de consumo, lo que permite experimentar con contexto largo sin acceso a clústeres.
- Generación de datos sintéticos de razonamiento en inglés como modelo auxiliar de bajo coste, siempre que la licencia de solo investigación sea compatible con el uso previsto.

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío (`results: []`). Los únicos resultados numéricos disponibles provienen de la tabla 4 del artículo (backbone Qwen3-1.7B), medidos en modo 0-shot con EleutherAI lm-evaluation-harness.

Razonamiento de sentido común (exactitud, 0-shot):

| Tarea | HyLo-Qwen-7MLA21GDN |
|---|---:|
| ARC-Challenge | 44,2 |
| ARC-Easy | 71,4 |
| HellaSwag | 61,2 |
| OpenBookQA | 37,4 |
| PIQA | 73,7 |
| RACE | 36,9 |
| WinoGrande | 63,1 |
| **Media** | **55,4** |

Contexto largo, RULER (13 tareas) a 8K, 16K, 32K y 64K: no disponible. La tabla aparece truncada en la información proporcionada (solo se conserva el inicio del valor correspondiente a 8K). No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, ni comparaciones numéricas frente a otros modelos en esta ficha.

## Requisitos de hardware

- Los pesos se publican en float32, lo que ocupa aproximadamente 9,1 GB (tamaño del repositorio). Cargados en bfloat16, como recomienda la model card, el peso baja a unos 4,6 GB.
- VRAM estimada para inferencia: unos 5-6 GB solo de pesos en bfloat16, más activaciones y caché KV. Como referencia, la caché KV del modelo es el 3,9 % de la del Qwen3-1.7B, por lo que el crecimiento de memoria con la longitud de contexto y el tamaño de lote es mucho menor que en un transformer denso.
- Cabe en GPU de consumo: cualquier tarjeta con 8 GB o más en bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) debería ser suficiente para una sola secuencia de contexto largo, aunque en float32 el margen se reduce.
- GPU de centro de datos recomendadas para servicio con lotes grandes y 64K de contexto: A100, H100 o AMD Instinct MI300X. El entrenamiento se realizó con 8x MI300X mediante FSDP.
- Opciones de despliegue: se necesita un stack que implemente MLA y Gated DeltaNet. La model card menciona explícitamente el ajuste del parámetro de longitud máxima (por ejemplo `--max-model-len 65536`), propio de vLLM. El soporte en llama.cpp, Ollama o TGI no está documentado en la información disponible.
- Aviso de configuración: `max_position_embeddings` en `config.json` vale 40.960 por herencia del modelo base. Los stacks dimensionan la caché KV a partir de ese campo, así que hay que fijar la longitud máxima de forma explícita a 65.536.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Caché KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HyLo-Qwen-7MLA21GDN-64K-SFT | 2,28B | 65.536 tokens | Híbrida (7 MLA + 21 Gated DeltaNet) | 3,9 % de la del base | Solo investigación (`amd-hybrid-models-research-only-rail-ms`) | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-1.7B | 1,7B (nominal, según el nombre del modelo) | 32.768 tokens nativos, ampliable con YaRN | Transformer denso con atención completa | Estándar (100 %) | apache-2.0 | Ampliamente disponible |
| Qwen/Qwen3-8B | 8B (nominal) | No disponible en la información proporcionada | Transformer denso | Estándar | apache-2.0 | Ampliamente disponible; se usa aquí como profesor de destilación |

No se dispone de resultados de benchmarks del Qwen3-1.7B ni del Qwen3-8B en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos. La comparativa se limita a parámetros, contexto, arquitectura, caché KV, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: el identificador `amd-hybrid-models-research-only-rail-ms` y el nombre `amd-hybrid-models-research-only-rail-ms` indican uso exclusivo de investigación. Aunque los metadatos de Hugging Face declaran también `apache-2.0`, existe una contradicción entre ambos campos; hay que leer el fichero `LICENSE` del repositorio antes de cualquier uso, y en particular antes de un uso comercial.
- Idioma: la model card solo declara inglés. No hay datos sobre rendimiento en castellano ni en otros idiomas, aunque el modelo base Qwen3 sea multilingüe.
- Contexto real limitado a 65.536 tokens: el artículo no mide ni reclama calidad por encima de esa longitud, y el valor de `max_position_embeddings` de `config.json` (40.960) no es una longitud soportada. Configurar mal este campo puede degradar la calidad o dimensionar mal la caché.
- Modelo experimental sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin resultados de terceros que confirmen los números publicados.
- Riesgo de alucinación: es un modelo de 2,28B parámetros; se espera una tasa de error factual considerable en tareas abiertas, agravada por la destilación de un profesor de 8B y por el uso de conjuntos de datos generados sintéticamente (OpenThoughts-114k, OpenR1-Math-220k) que pueden transmitir errores y sesgos de sus generadores.
- Composición del dataset con licencias dispares: `nvidia/ChatQA2-Long-SFT-data` se distribuye bajo cc-by-nc-2.0, lo que añade restricciones no comerciales sobre los datos de entrenamiento, en línea con la licencia de solo investigación del checkpoint.
- Rendimiento de razonamiento moderado: la media de 55,4 en las tareas de sentido común está lejos de la de modelos de mayor tamaño; no es adecuado como modelo principal en tareas que exijan alta precisión factual.
- No se documentan capacidades de tool calling, function calling, modo de razonamiento explícito ni soporte de agentes. No deben asumirse sin verificarlas.
- Dependencia de implementación: al requerir kernels de MLA y de Gated DeltaNet, el soporte en herramientas de inferencia populares puede ser limitado o inexistente. Conviene verificar la compatibilidad del stack antes de planificar un despliegue.
- Los pesos en float32 obligan a una conversión o carga en bfloat16 para un uso eficiente de memoria; servirlos tal cual duplica el consumo de VRAM.
- No se han publicado en la información disponible evaluaciones de sesgo, toxicidad o seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/HyLo-Qwen-7MLA21GDN-64K-SFT
- Artículo principal: Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling (arXiv:2604.24715) — https://arxiv.org/abs/2604.24715
- Referencias citadas en las etiquetas del modelo: https://arxiv.org/abs/2505.17272 y https://arxiv.org/abs/2503.11132
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilación: https://huggingface.co/Qwen/Qwen3-8B
- Dataset: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Licencia del repositorio: https://huggingface.co/amd/HyLo-Qwen-7MLA21GDN-64K-SFT/blob/main/LICENSE
