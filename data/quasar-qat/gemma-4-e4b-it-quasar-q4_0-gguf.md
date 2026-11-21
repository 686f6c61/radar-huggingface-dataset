# QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF

## Resumen

Gemma 4 E4B es un modelo multimodal de Google (familia Gemma 4) distribuido originalmente en precisión BF16 y con licencia Apache 2.0. Esta ficha cubre la versión publicada por QUASAR-QAT, un checkpoint cuantizado a 4 bits mediante *quantization-aware training* (QAT) nativo y exportado a GGUF con formato Q4_0, listo para llama.cpp, Ollama y LM Studio. El modelo base resuelve tareas de generación de texto, razonamiento con modo *thinking*, visión (image-text-to-text), tool calling y conversación multi-turno con contexto largo.

El interés de esta variante no está en el modelo base, sino en la calidad de la cuantización: según la model card, el checkpoint conserva directamente los códigos INT4 entrenados (sin recuantizar tras el entrenamiento), con una divergencia KL frente a BF16 de 0,044, frente a 0,088 del Q4_0 QAT oficial de Google y 0,193 de un Q4_0 estándar sin imatrix. El repositorio ocupa 6,2 GB y el GGUF principal pesa 5,23 GB, más un proyector visual BF16 de 992 MB.

El modelo declara 7.463.013.674 parámetros totales y una ventana de contexto de 131.072 tokens. Está pensado para despliegue local en hardware de consumo y para pipelines que necesiten visión y tool calling sin renunciar a un formato de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B); codificador visual con proyector BF16 separado |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_0 nativo (group-64, weight-only INT4); embeddings en Q6_K; proyector visual en BF16; existe variante W4A16-G64 para vLLM |
| Idiomas soportados | en, multilingual (sin listado completo de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); variante W4A16 compressed-tensors para vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4 en variante E4B, con capacidad de procesar texto e imágenes (pipeline `image-text-to-text`) e integración de audio según los tags del repositorio. La parte visual se sirve mediante un proyector BF16 sin modificar, extraído de `google/gemma-4-E4B-it`, que se carga de forma independiente al GGUF principal.

El proceso QUASAR descrito en la model card es un QAT *loss-aware*: se parte de los pesos BF16 del profesor y se ajustan los códigos INT4 con pesos maestros en fp32 durante 626M tokens, equivalentes a una época sobre aproximadamente 398.000 prompts auto-destilados del modelo BF16 con el modo *thinking* activado. La cuantización es weight-only con grupos de 64. El GGUF almacena los códigos y escalas INT4 entrenados directamente, sin recuantización posterior; los 258 tensores cuantizados se verifican bit-exactos contra la variante W4A16 gemela. La ventaja declarada es que el coste de inferencia es idéntico al de un Q4_0 estándar.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat embebida en el GGUF.
- Razonamiento con modo *thinking*, activado por defecto en la plantilla de chat de Gemma 4 y desactivable con `--chat-template-kwargs '{"enable_thinking": false}'`.
- Comprensión de imágenes (VLM) mediante el proyector BF16; funciona con `llama-mtmd-cli`, Ollama (detección automática del proyector) y LM Studio.
- Tool calling y function calling, orientado a flujos agénticos.
- Razonamiento multi-paso y uso como agente.
- Capacidades matemáticas y de código (evaluadas en GSM8K, MATH-hard e IFEval).
- Soporte multilingüe declarado, con inglés como idioma principal documentado.
- Entrada de audio según los tags del repositorio (sin detalle de implementación en la model card).

## Casos de uso

- Asistente local con visión: desplegado con Ollama o LM Studio, el modelo puede describir imágenes, extraer texto de capturas o responder preguntas sobre fotografías sin salir del equipo, gracias al proyector BF16 incluido.
- Agente de soporte técnico con tool calling: la ventana de 131.072 tokens permite mantener historiales largos de incidencias y encadenar llamadas a funciones (consulta de estado, apertura de tickets) en una sola sesión.
- Procesamiento de documentos extensos: resumen y extracción de datos sobre contratos o informes que superan los 100.000 tokens, con el modo *thinking* activado para tareas que requieren razonamiento encadenado.
- Generación y revisión de código en local: integrable en editores o scripts mediante llama.cpp, con resultados en GSM8K (82,0) e IFEval (82,6) que lo sitúan por encima del QAT oficial de Google en la misma evaluación.
- Automatización de back office con imágenes: clasificación y descripción de imágenes en lotes (por ejemplo, inventario o revisión de documentos escaneados) usando `llama-mtmd-cli` en un servidor con una sola GPU.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: al ocupar 5,23 GB en Q4_0, cabe en GPUs de consumo y permite prototipar aplicaciones multimodales antes de escalar a la variante W4A16 en vLLM.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir el impacto de QAT nativo frente a cuantización post-entrenamiento en un mismo harness.

## Benchmarks y rendimiento

Datos publicados en la model card. Los benchmarks de downstream se midieron sobre la variante W4A16 gemela, que según el autor comparte los mismos códigos entrenados.

| Benchmark | QUASAR | Google QAT |
|---|---:|---:|
| TriviaQA | 23,8 | 20,1 |
| NQ-open | 4,7 | 2,4 |
| TruthfulQA | 58,2 | 55,4 |
| ARC-Easy | 79,8 | 78,3 |
| ARC-Challenge | 56,2 | 56,0 |
| GSM8K | 82,0 | 81,5 |
| IFEval | 82,6 | 81,9 |
| MATH-hard | 60,7 | 59,4 |
| Promedio | 56,0 | 54,4 |

Calidad de cuantización (KL frente a BF16 y acuerdo top-1, medidos en llama.cpp con el mismo build y backend):

| Formato Q4_0 | KL a BF16 | Acuerdo top-1 |
|---|---:|---:|
| QUASAR | 0,044 | 92,8% |
| Unsloth Q4_0 (imatrix) | 0,067 | 91,1% |
| Google QAT | 0,088 | 90,6% |
| Q4_0 estándar (sin imatrix) | 0,193 | 85,7% |

Referencias adicionales citadas: Unsloth Q4_0 repack de Google QAT (0,071) y LM Studio Q4_K_M (0,114). En vLLM, la variante W4A16 registra KL 0,022 frente a 0,064 del W4A16 QAT de Google.

## Requisitos de hardware

- VRAM estimada: el GGUF principal ocupa 5,23 GB y el proyector visual 992 MB; en total, alrededor de 6,2 GB de pesos, más overhead de contexto KV. Con 131.072 tokens de contexto el consumo de KV crece de forma notable y exige GPU con margen amplio o *offloading* parcial a CPU.
- GPU recomendadas: A100 o H100 para servir contexto completo y concurrencia; RTX 4090 (24 GB) para uso individual con contexto largo; GPUs de 8-12 GB para contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para contexto corto; 12-16 GB o más para sesiones multimodales con contexto extendido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli` para visión), Ollama (`ollama run hf.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF`), LM Studio; la variante W4A16-G64 está pensada para vLLM.
- Latencia y throughput: no disponibles en la información proporcionada. Al usar el runtime Q4_0 estándar, el coste de decodificación debería ser equivalente al de cualquier GGUF Q4_0 del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | KL a BF16 | Licencia |
|---|---|---:|---|---:|---|
| QUASAR Gemma 4 E4B Q4_0 | 7,46B | 131.072 | GGUF Q4_0 nativo | 0,044 | Apache 2.0 |
| Google Gemma 4 E4B QAT Q4_0 | no disponible | no disponible | GGUF Q4_0 | 0,088 | Apache 2.0 |
| Unsloth Gemma 4 E4B Q4_0 (imatrix) | no disponible | no disponible | GGUF Q4_0 | 0,067 | Apache 2.0 |
| LM Studio Gemma 4 E4B Q4_K_M | no disponible | no disponible | GGUF Q4_K_M | 0,114 | Apache 2.0 |

La comparación relevante es de calidad de cuantización dentro de la misma familia: QUASAR obtiene menor KL que las alternativas en formato Q4_0 y también que un Q4_K_M, que en teoría es más expresivo. No se dispone de datos de benchmarks de los modelos comparados más allá de los publicados por el autor frente al QAT de Google.

## Limitaciones y advertencias

- Los benchmarks downstream se midieron sobre la variante W4A16 gemela, no directamente sobre el GGUF Q4_0; el autor afirma que comparten códigos entrenados, pero la cifra no es una medición del archivo GGUF.
- El harness de evaluación es el del propio autor; no hay replicación independiente de los resultados de KL ni de los benchmarks.
- Riesgo de alucinación inherente a modelos de 7,46B parámetros, especialmente en NQ-open (4,7), donde el rendimiento absoluto es bajo pese a superar al QAT de Google.
- Cobertura idiomática declarada como "multilingual" sin listado; el único idioma documentado es el inglés. El rendimiento en castellano no está medido.
- El contexto de 131.072 tokens es costoso en memoria KV; en GPUs de consumo obliga a reducir la ventana efectiva.
- El proyector visual se distribuye en BF16 y sin cuantizar, lo que añade ~1 GB y no se beneficia del QAT.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-E4B-it` enlazadas en la model card.
- El repositorio tiene 862 descargas y 3 likes en el momento de la ficha: validación comunitaria todavía muy limitada.
- Parte de los resultados de búsqueda web sobre "Quasar" corresponden a proyectos homónimos sin relación (herramienta de administración remota, framework de frontend, objetos astronómicos); no deben asociarse a este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante W4A16 gemela: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Página del proyecto: https://quasar-qat.github.io/
- Código: https://github.com/vincentcounathe/quasar-qat
- Colección Gemma 4 E4B y 12B QUASAR 4-bit QAT: https://huggingface.co/collections/QUASAR-QAT/quasar-native-4-bit-gemma-4-6aa3561770e6e4001271bf1e
- Evaluación completa (EVAL.md): https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF/blob/main/EVAL.md
- Recibo de verificación nativa Q4_0: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF/blob/main/native_q4_0_receipt.json
- Q4_0 QAT oficial de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- W4A16 QAT oficial de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Unsloth GGUF: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- LM Studio GGUF: https://huggingface.co/lmstudio-community/gemma-4-E4B-it-GGUF
