# marcusguhao/IndexMem-Qwen3-4B

## Resumen

IndexMem-Qwen3-4B es una puerta de retención (retention gate) entrenada para un Qwen3-4B congelado, derivada del trabajo *The Gating Mechanism of KV Cache Eviction*. No es un modelo de lenguaje completo: el repositorio contiene únicamente el scorer (7,5M parámetros, un MLP de dos capas) que puntúa cada entrada de la caché KV en el momento de su creación, de modo que las entradas peor valoradas pueden desalojarse y no necesitan recalcularse. El backbone es un `Qwen/Qwen3-4B` sin modificar, que no se redistribuye en este repositorio.

El problema que aborda es el coste de memoria y cómputo de la caché KV en contextos largos. Con una compresión del 75% de la caché, el autor reporta un RULER a 8K de 83,89 frente a 92,41 con caché completa, lo que sitúa la pérdida en unos 8,5 puntos con una reducción de tres cuartas partes del presupuesto de caché. El modelo es relevante para despliegues de contexto largo sobre hardware limitado, donde el cuello de botella es la memoria de la caché y no los pesos.

La ficha describe un artefacto muy específico: requiere el código de `kvpress` (rama `main`) para la inferencia, no está pensado para uso directo con `transformers` sin esa integración y su evaluación pública se limita a un único resultado de RULER. El tamaño del repositorio (0,2 GB) corresponde al checkpoint del scorer, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas (scorer de retención) sobre backbone transformer Qwen3-4B congelado |
| Parametros totales | 7,5M (solo el gate); backbone Qwen3-4B no incluido |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado con currículum a 8K y 16K; ventana local fija de 128 tokens más 4 sinks |
| Tipos de cuantizacion | no disponible (el scorer se distribuye como `indexmem.pt`; el backbone admite las cuantizaciones habituales de Qwen3-4B) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | `indexmem.pt` (checkpoint PyTorch); `scorer.json` con la geometría del scorer |

## Arquitectura y entrenamiento

El gate es un MLP de dos capas sobre el estado oculto, con anchura 256, que emite una puntuación por cabeza KV. Se entrena únicamente el gate: backbone, embeddings y LM head permanecen congelados. La pérdida es una KL inversa contra el mismo modelo ejecutándose con caché KV completa, de forma que el scorer aprende a aproximar la distribución del modelo sin compresión. La tasa de retención se aprende por entrada, con una escala fija de edad de token de 16384.

El mecanismo de atención reserva siempre 4 sinks y una ventana local de 128 tokens, exentos del normalizador del gate. La masa del gate es 256, compartida entre las entradas desalojables, y el presupuesto de caché (`cache_budget`) es la capacidad media por cabeza KV, incluyendo 64 slots de centroides; el resto del presupuesto se reparte entre cabezas según la masa de atención retenida, con un suelo desalojable de 512. El currículum de entrenamiento consta de 300 pasos a 8K y 300 pasos a 16K, con batch global de 8, sobre el dataset LongMino (subconjuntos `2e16` y `2e17`).

## Capacidades

- Compresión de caché KV en inferencia de contexto largo: puntuación de entradas KV en el momento de creación y desalojo sin recálculo.
- Presupuesto de caché configurable por cabeza (`cache_budget`), con reparto adaptativo según masa de atención retenida.
- Retención garantizada de 4 attention sinks y una ventana local de 128 tokens.
- Integración con `kvpress` mediante `IndexMemConfig` e `IndexMemTextGenerationPipeline`.
- Hereda las capacidades del backbone Qwen3-4B (generación de texto, razonamiento, código, multilingüismo), aunque el repositorio no documenta ninguna.
- No soporta por sí mismo tool calling, agentes ni visión: esas capacidades dependen exclusivamente del Qwen3-4B subyacente.
- No se documenta modo thinking ni otras capacidades especiales en la información disponible.

## Casos de uso

- Procesamiento de documentos largos con memoria limitada: usar `cache_budget=2048` para responder preguntas sobre documentos que superan la caché completa, aceptando la degradación medida en RULER (83,89 frente a 92,41).
- Despliegue de QA sobre corpus extensos en una sola GPU: al reducir un 75% la caché KV, se libera VRAM que puede destinarse a mayor batch o a pesos en mayor precisión.
- Servicio de resumen y extracción sobre contratos o informes: la ventana local de 128 tokens más los sinks preserva el contexto inmediato, útil para tareas que dependen de las últimas frases.
- Investigación en políticas de evicción: el gate sirve como línea base reproducible frente a H2O, SnapKV u otros métodos de compresión, con la receta de entrenamiento documentada.
- Evaluación comparativa de compresión: el checkpoint permite medir la pérdida de calidad a distintos `cache_budget` sin reentrenar el backbone.
- Prototipado de asistentes conversacionales de contexto largo: la integración con `kvpress` permite sustituir la caché completa en pipelines existentes de Qwen3-4B con cambios acotados.
- Fine-tuning del gate para dominios específicos: al entrenarse solo 7,5M parámetros con KL inversa, es viable adaptar el scorer a un corpus propio manteniendo el backbone congelado.

## Benchmarks y rendimiento

| Benchmark | IndexMem (75% compresión) | Full-KV |
|---|---|---|
| RULER 8K | 83,89 | 92,41 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El gate añade 7,5M parámetros, despreciables frente a los 4B del backbone; el coste dominante sigue siendo Qwen3-4B más la caché KV.
- VRAM del backbone: aproximadamente 8 GB en bf16 para los pesos; la caché completa a 8K–16K añade varios GB según batch y número de cabezas KV.
- Con `cache_budget=2048` y compresión del 75%, la caché se reduce a una cuarta parte, lo que permite contextos largos en GPUs de 16–24 GB (RTX 4090, L4, A10G).
- Para batches grandes o contextos superiores a 16K, se recomienda A100 40/80 GB o H100.
- El ejemplo del autor usa `flash_attention_2` y `torch.bfloat16`, lo que exige GPU Ampere o superior.
- Opciones de despliegue: la integración documentada es `kvpress` con `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Compresión KV | Licencia |
|---|---|---|---|---|---|
| IndexMem-Qwen3-4B | Gate de evicción sobre Qwen3-4B | 7,5M (gate) + 4B (backbone) | 8K/16K en entrenamiento | 75% (RULER 8K 83,89) | apache-2.0 |
| Qwen3-4B (base) | LLM denso | 4B | según configuración de Qwen3 | sin compresión (RULER 8K 92,41) | apache-2.0 |
| H2O | Política de evicción KV | sin parámetros entrenados | dependiente del backbone | configurable | según implementación |
| SnapKV | Política de evicción KV | sin parámetros entrenados | dependiente del backbone | configurable | según implementación |

No se dispone de resultados comparativos de H2O o SnapKV sobre Qwen3-4B en la información proporcionada; la comparación con estos métodos es cualitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el código de `kvpress` (rama `main`) y no funciona con un `AutoModelForCausalLM` estándar sin esa integración.
- Solo se publica un resultado de benchmark (RULER 8K); no hay datos de RULER a 16K, MMLU, HumanEval, GSM8K ni de otros dominios.
- El entrenamiento se limita a 600 pasos totales sobre LongMino; el gate puede generalizar mal fuera de la distribución de ese corpus.
- La degradación de 8,5 puntos en RULER 8K al 75% de compresión es sustancial para tareas de recuperación de información precisa en contexto largo.
- El repositorio no redistribuye el backbone: hay que descargar `Qwen/Qwen3-4B` por separado y verificar su licencia y condiciones de uso.
- No se documentan idiomas soportados ni evaluación multilingüe del gate; el comportamiento en idiomas distintos del inglés es desconocido.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; heredables del backbone Qwen3-4B.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente de la comunidad.
- Para uso comercial, la licencia apache-2.0 del gate es permisiva, pero debe revisarse por separado la licencia del backbone y la del código `kvpress`.

## Enlaces

- HuggingFace: https://huggingface.co/marcusguhao/IndexMem-Qwen3-4B
- Código de inferencia (`kvpress`, rama `main`): https://github.com/Chooovy/kvpress
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper de referencia citado en la model card: *The Gating Mechanism of KV Cache Eviction* (no se proporciona URL en la información disponible)
