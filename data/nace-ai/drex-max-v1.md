# nace-ai/drex-max-v1

## Resumen

Drex Max es un modelo de decisión (decision model) desarrollado por Nace.AI que no genera texto, sino que responde preguntas tipadas sobre un contexto determinado devolviendo probabilidades para cada opción en una única pasada hacia delante (forward pass). El contexto puede ser texto, JSON o imágenes, y se envía como campo `state` junto con una o más preguntas nombradas. Su arquitectura es densa de 27B parámetros (26.085.330.160 según los safetensors) con una cabeza de lectura (readout) de 255 vías, y está publicado en Hugging Face bajo la licencia Nace.AI Open RAIL-M.

El problema que resuelve es el de la clasificación y decisión de bajo coste y baja latencia: en lugar de decodificar tokens autoregresivamente, Drex Max calcula directamente probabilidades sobre hasta 255 opciones, lo que lo hace adecuado como componente de enrutado, moderación, selección de herramientas o evaluación en pipelines de agentes. Es relevante porque ocupa el cuarto puesto de 18 en el Artificial Analysis Decision Index (64 puntos), por delante de Claude Haiku 5.5 (Low) y GPT-6 Luna (Low).

Soporta una ventana de contexto de hasta 262.144 tokens (16.384 por defecto por petición), es multimodal (texto e imágenes mediante una torre de visión nativa) y combina atención lineal Gated DeltaNet con capas de atención completa no causal. Existen checkpoints cuantizados en Q8_0 GGUF y affine Q4 para despliegue en Apple Silicon y CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa (transformer híbrido: 48 capas Gated DeltaNet lineal + 16 capas de atención completa no causal) con readout de 255 vías |
| Parametros totales | 26.085.330.160 (27B) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | 262.144 tokens (16.384 por defecto por petición, ampliable con `DREX_MAX_CONTEXT` o `--max-length`) |
| Tipos de cuantizacion | bf16 (pesos por defecto), Q8_0 GGUF, affine Q4 |
| Idiomas soportados | no disponible |
| Licencia | Nace.AI Open RAIL-M (license: other) |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0), affine Q4 |

## Arquitectura y entrenamiento

El backbone consta de 64 capas organizadas de forma híbrida: 48 capas de atención lineal Gated DeltaNet que procesan la secuencia de izquierda a derecha, y 16 capas de atención completa no causal (una de cada cuatro), en las que cada token puede atender a toda la secuencia, no solo al pasado. Esta combinación reduce el coste computacional de la atención lineal manteniendo, en un subconjunto de capas, acceso global al contexto, algo coherente con la naturaleza del modelo: no genera texto, sino que produce una representación del estado completo para clasificar.

Las imágenes se procesan mediante una torre de visión nativa y quedan visibles para todas las preguntas de la petición. Una cabeza de lectura de 255 vías (almacenada en `readout.safetensors`) transforma el último estado oculto en probabilidades sobre hasta 255 opciones en una sola pasada. El loader incluido aplica la atención no causal; una ejecución causal de chat convencional no reproduce las puntuaciones publicadas.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Clasificación zero-shot sobre contexto tipado (texto, JSON o imágenes) con salida de probabilidades por opción, sin generación de tokens.
- Respuesta a múltiples preguntas nombradas sobre el mismo `state` en una única pasada hacia delante.
- Comprensión multimodal: la torre de visión nativa permite responder preguntas sobre imágenes junto al texto.
- Contexto largo: hasta 262.144 tokens de ventana (16.384 por defecto), útil para decidir sobre documentos extensos.
- Readout de hasta 255 opciones por pregunta, adecuado para enrutado fino y taxonomías amplias.
- Evaluación de herramientas: alta puntuación en el área "Tools" del Decision Index 0.4 (81,9), lo que sugiere idoneidad para tool calling y enrutado de agentes.
- Ejecución en NVIDIA (Python), Apple Silicon (llama.cpp, Ollama, Kapitsa, MLX) y CPU (llama.cpp, Ollama).
- No genera texto libre: no es adecuado para chat, redacción ni razonamiento generativo.

## Casos de uso

- Enrutado de consultas en sistemas multiagente: dado un mensaje de usuario como `state`, el modelo devuelve probabilidades sobre hasta 255 agentes o rutas posibles en una pasada, con latencia muy inferior a la de un LLM generativo decodificando tokens.
- Selección de herramientas (tool selection): su puntuación de 81,9 en el área Tools del Decision Index 0.4 lo hace adecuado para decidir qué función o API invocar en cada paso de un agente, estilo When2Call.
- Moderación de contenidos: puede clasificar entradas de usuario o respuestas del sistema en categorías de seguridad; en visión, aunque su skill en Hateful Memes es bajo (40,6), su índice de visión global de 73,92 indica utilidad general en clasificación de imágenes.
- Extracción y verificación sobre documentos: con contexto de hasta 262.144 tokens y soporte de JSON como estado, puede responder preguntas nombradas sobre contratos, informes o respuestas de API largas (por ejemplo, verificar si un documento cumple una lista de condiciones).
- Clasificación de intención en atención al cliente: clasifica cada turno de conversación en intents predefinidos con probabilidades calibradas, permitiendo umbrales de confianza y escalado a humano.
- Evaluación de calidad (LLM-as-judge cerrado): dada una respuesta candidata como contexto, puntúa opciones como "correcta/incorrecta/parcial" o selecciona la mejor de N respuestas en pipelines de evaluación automática.
- Clasificación de documentos con imagen: con 92,4 de skill en KIE (CORD+FUNSD) y 97,3 en InfographicVQA, es adecuado para extraer campos de facturas, formularios escaneados e infografías.
- Filtrado en RAG: dado un conjunto de fragmentos recuperados, decide cuáles son relevantes para la consulta antes de pasarlos al modelo generativo, reduciendo coste y ruido.

## Benchmarks y rendimiento

Decision Index 0.4 (público, texto; 37 benchmarks en cinco áreas, skill corregida por azar × 100):

| Modelo | Public index | Raw | Knowledge & Reasoning | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|---|
| **Drex Max** (27B) | **67.52** | 75.4 | 57.1 | 72.2 | 68.8 | 81.9 | 53.4 |
| Drex v2.0 (35B) | 61.25 | 70.55 | 47.9 | 65.3 | 63.0 | 76.5 | 53.9 |
| Jev 1.13.0 | 57.96 | 68.55 | 53.9 | 59.2 | 55.4 | 75.1 | 39.1 |

Artificial Analysis Decision Index (media ponderada de AA-Omniscience-Decision, HLE-MultiChoice, When2Call y WildGuardTest): Drex Max obtiene 64, cuarto de 18, por detrás de dl-ultra, SubQ Snap 1.1 y Elephant 9B (65 cada uno), y por delante de Claude Haiku 5.5 (Low) con 61, Drex 2.0 con 58 y GPT-6 Luna (Low) con 55.

Otros resultados publicados: JevBench 92,2 % (213/231); Decision Bench v4 94,30 % (1010/1071).

Índice público de visión: 73,92. Skill por benchmark:

| Benchmark | Filas | Skill |
|---|---|---|
| CV-Bench | 2.038 | 77.4 |
| BLINK | 961 | 59.9 |
| RealWorldQA | 589 | 72.3 |
| CharXiv | 532 | 80.5 |
| InfographicVQA | 244 | 97.3 |
| Mind2Web | 973 | 84.2 |
| Winoground | 800 | 85.0 |
| KIE (CORD+FUNSD) | 2.465 | 92.4 |
| Moderation (Hateful Memes) | 1.213 | 40.6 |
| R-Bench-M | 665 | 38.6 |
| MMMU-Pro vision | 1.730 | 47.3 |

No se han publicado resultados de benchmarks convencionales de generación (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo, además, no genera texto, por lo que esos benchmarks no le son directamente aplicables.

## Requisitos de hardware

- Pesos bf16: aproximadamente 49 GB de memoria; el repo completo ocupa 61,8 GB.
- Backbone en 8 bits: aproximadamente 26 GB.
- Checkpoint affine Q4: funciona en Macs con Apple Silicon de 24 GB de memoria o más (Kapitsa y MLX).
- Q8_0 GGUF: requiere 48 GB de memoria.
- En consumer GPU NVIDIA: no cabe en una RTX 4090 (24 GB) en bf16 ni con el backbone en 8 bits ajustado; con affine Q4 podría ser viable en GPUs de 24 GB, aunque no se indica soporte CUDA cuantizado explícitamente.
- GPU recomendadas: NVIDIA con soporte Python (el model card no especifica modelo concreto; por los requisitos de memoria, A100 80 GB o H100 son opciones razonables para bf16).
- Despliegue: Python sobre NVIDIA GPU; en Apple Silicon, texto vía llama.cpp, Ollama, Kapitsa y MLX; en CPU vía llama.cpp y Ollama (forks específicos de Nace.AI, rama `drex-max-v1`). Existen repos cuantizados oficiales: drex-max-v1-Q8_0 y drex-max-v1-affine-q4.
- Latencia y throughput: no disponibles explícitamente, aunque al responder en una sola pasada sin generación, la latencia por decisión es inherentemente inferior a la de un LLM generativo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Indice (AA Decision) | Indice publico 0.4 | Tipo | Licencia |
|---|---|---|---|---|---|
| **Drex Max** | 27B (denso) | 64 | 67.52 | Decision, multimodal | Nace.AI Open RAIL-M |
| Drex v2.0 | 35B | 58 | 61.25 | Decision | no disponible |
| Jev 1.13.0 / 1.14 | no disponible | 57 | 57.96 | Decision | no disponible |
| Claude Haiku 5.5 (Low) | no disponible | 61 | no disponible | Lenguaje | propietaria (API) |
| GPT-6 Luna (Low) | no disponible | 55 | no disponible | Lenguaje | propietaria (API) |

Frente a los LLM generativos de la tabla, Drex Max ofrece decisiones probabilísticas en una sola pasada y pesos abiertos descargables, mientras que los modelos propietarios solo están disponibles vía API y generan texto. Dentro de la familia Drex, supera a Drex v2.0 pese a tener menos parámetros (27B frente a 35B).

## Limitaciones y advertencias

- No genera texto: no sirve para chat, redacción, resumen ni razonamiento generativo; una ejecución causal de chat estándar no reproduce las puntuaciones publicadas, por lo que requiere el loader específico con atención no causal.
- Máximo de 255 opciones por pregunta en el readout; taxonomías mayores requieren descomposición.
- Debilidades visuales concretas: skill bajo en moderación de memes de odio (40,6), R-Bench-M (38,6) y MMMU-Pro vision (47,3), por lo que no es fiable como moderador visual ni en razonamiento académico multimodal exigente.
- La ejecución de visión limita las imágenes a 1.638.400 píxeles en los benchmarks publicados; imágenes mayores pueden requerir preprocesado.
- Idiomas soportados: no disponible; conviene validar el comportamiento en castellano antes de producción.
- Licencia Nace.AI Open RAIL-M: es una licencia de tipo RAIL con posibles restricciones de uso (la "M" suele indicar restricciones para ciertos usos); revisar el archivo LICENSE antes de uso comercial.
- Riesgo de alucinación: bajo por diseño, ya que el modelo no genera contenido libre, pero las probabilidades de salida pueden estar mal calibradas fuera de la distribución de entrenamiento; validar con datos propios.
- Sesgos conocidos: no documentados en la información disponible.
- Los datos de benchmarks proceden del propio autor del modelo (Nace.AI); las comparativas con modelos de terceros deben tomarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/drex-max-v1
- Web de Nace.AI: https://www.nace.ai/
- Código y documentación: https://github.com/nace-ai/drex-decision-models/blob/main/models/drex-max-v1
- Formato de petición: https://github.com/nace-ai/drex-decision-models/blob/main/docs/request-format.md
- Documentación de longitud de contexto: https://github.com/nace-ai/drex-decision-models/blob/main/docs/context-length.md
- Checkpoint Q8_0 GGUF: https://huggingface.co/nace-ai/drex-max-v1-Q8_0
- Checkpoint affine Q4: https://huggingface.co/nace-ai/drex-max-v1-affine-q4
- Fork de llama.cpp (rama drex-max-v1): https://github.com/nace-ai/llama.cpp
- Fork de Ollama (rama drex-max-v1): https://github.com/nace-ai/ollama
- Resultados del Decision Index: https://hf.co/datasets/nace-ai/drex-max-v1-decision-index-results
- Scores de visión: https://hf.co/datasets/nace-ai/drex-max-v1-decision-index-results/blob/main/runs/drex-max-v1-vision/vision-scores.json
- Drex v2.0: https://huggingface.co/nace-ai/drex-v2.0
- Drex v1.5: https://huggingface.co/nace-ai/drex-v1.5
- Leaderboard Jev Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Artificial Analysis: https://artificialanalysis.ai/
