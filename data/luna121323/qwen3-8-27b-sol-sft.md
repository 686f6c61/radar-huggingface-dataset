# luna121323/Qwen3.8-27B-Sol-SFT

## Resumen

Qwen3.8-27B-Sol-SFT es un ajuste fino supervisado (SFT) de tipo text-only sobre el modelo base Qwen3.8-27B, publicado por el usuario luna121323 en Hugging Face. El modelo conserva la arquitectura híbrida del base —capas GDN (Gated DeltaNet) combinadas con atención completa, 64 capas y dimensión oculta de 5120— con 27.000 millones de parámetros en bf16 y una ventana de contexto nativa de 262.144 tokens. Se distribuye bajo licencia Apache-2.0, heredada del modelo original.

El objetivo del ajuste es especializar el modelo en tareas de agente y uso de herramientas (tool calling), partiendo de trayectorias de agente destiladas de profesores fuertes (Sol / GPT-5.6-Sol Codex, GPT-6 / GPT-6.1 Sol) y de datos de replay del agente Terminus-2. El entrenamiento empleó únicamente 31 pasos de optimizador sobre un conjunto de 1.020 ejemplos de entrenamiento y 53 de validación (~10 millones de tokens), lo que lo convierte en un ajuste ligero y muy dirigido, no en un reentrenamiento profundo.

Su relevancia práctica reside en dos aspectos: mantiene la cabeza MTP (Multi-Token Prediction) entrenada de forma conjunta, lo que permite decodificación especulativa tipo EAGLE con SGLang y reducir latencia en producción, y mejora de forma notable el rendimiento en generación de código (LiveCodeBench test6: +8,0 puntos sobre el base) a costa de pequeñas regresiones en conocimiento general. Es, por tanto, un modelo pensado para pipelines de agentes y código, no para uso como asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid GDN + full attention, 64 capas, hidden 5120 |
| Parametros totales | 27B (bf16) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors (incluye pesos `mtp.*` para decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer híbrido que combina capas GDN (Gated DeltaNet, un mecanismo de atención lineal con estado recurrente) con capas de atención completa, organizadas en 64 capas con dimensión oculta de 5120. Esta mezcla busca reducir el coste computacional en contextos largos manteniendo la capacidad de atención global. Sobre esta base se conserva una cabeza MTP de una capa, entrenada conjuntamente con el modelo principal, que actúa como draft model para decodificación especulativa EAGLE.

El ajuste se realizó con el framework slime sobre Megatron-Core 0.20, con paralelismo TP4/PP2, longitud de secuencia de 17.408 tokens, precisión bf16 y 31 pasos de optimizador. El dataset `sft_sol_plus_clean.parquet` contiene 1.020 ejemplos de entrenamiento y 53 de validación (~10,0M tokens), con tres fuentes: 574 filas de trayectorias de código y agente de Sol / GPT-5.6-Sol Codex, 360 filas de replay del agente Terminus-2 y 139 filas de razonamiento de GPT-6 / GPT-6.1 Sol. El filtrado excluye sesiones de tipo `code-review`, exige que la llamada final a herramienta incluya un test/check con resultado `pass` o evidencia explícita de éxito, y aplica deduplicación por 13-gramas contra AIME24/25, GPQA, MATH-500, GSM8K, MMLU-Pro, LCB, IFEval y prompts held-out. El formato de conversación es la plantilla chat de Qwen3.5, con llamadas a herramientas en XML `<tool_call>` y respuestas de herramienta en `<tool_response>`. La loss final bajó de 0,736 a 0,231 y la loss MTP de 1,037 a 0,399.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento largo (respuestas de hasta 200k tokens en las evaluaciones AIME/GPQA).
- Generación de código y resolución de problemas de programación, con mejora medida en LiveCodeBench.
- Tool calling / function calling mediante el formato XML `<tool_call>` / `<tool_response>` de la plantilla Qwen3.5.
- Comportamiento de agente: entrenado sobre trayectorias de agentes reales (Codex, Terminus-2), incluyendo bucles de ejecución de herramientas y verificación de tests.
- Decodificación especulativa nativa mediante la cabeza MTP, compatible con EAGLE en SGLang.
- Razonamiento matemático (AIME, MATH-500, GSM8K) y conocimiento general (MMLU-Pro, GPQA).
- Seguimiento de instrucciones (IFEval).
- Capacidades multilingües: no disponibles (no documentadas).
- Visión: no soportada (export text-only, sin torre visual).

## Casos de uso

- Automatización de tareas de ingeniería de software: el modelo puede recibir un repositorio, ejecutar herramientas de test y verificar que los cambios pasan, gracias a su entrenamiento sobre trayectorias con verificación de `pass` y a su ventana de 262k tokens para contexto de código extenso.
- Agentes autónomos de resolución de incidencias: integrado en un bucle de tool calling con `<tool_call>`/`<tool_response>`, puede encadenar lecturas de ficheros, ejecuciones y comprobaciones, imitando el comportamiento de Terminus-2 con el que fue entrenado.
- Generación de código en pipelines de CI/CD: su mejora de +8,0 puntos en LiveCodeBench test6 (68,6% pass@1) y la reducción de la tasa de truncamiento al 65k (de 42,3% a 33,1%) lo hacen adecuado para tareas de reparación de tests y generación de parches en producción.
- Asistente de revisión de código asistida por herramientas: aunque el dataset excluye sesiones de `code-review` como judge, el modelo puede invocar linters y ejecutores de test como herramientas y razonar sobre sus salidas.
- Razonamiento matemático y científico de alto presupuesto: con 100% en AIME25 (30 problemas) y 97,0% en MATH-500, es utilizable en entornos donde se pueden permitir respuestas largas y contexto de 262k.
- Despliegue de baja latencia con decodificación especulativa: al conservar la cabeza MTP, puede servirse en SGLang con EAGLE (3 pasos, topk 1, 4 draft tokens) para reducir el coste por token en servicios de agente con muchas llamadas.
- Evaluación de seguimiento de instrucciones estrictas: con 60,1% en IFEval strict, es apto para tareas de formato controlado, aunque con margen de mejora frente a modelos especializados.

## Benchmarks y rendimiento

Evaluación con MTP + EAGLE activado (3 pasos / topk 1 / 4 draft tokens). AIME y GPQA con presupuesto de 200k tokens de respuesta y 262k de contexto; el resto con 131k. LiveCodeBench sobre test6 (175 preguntas, corte 2025), no sobre el conjunto oficial v6 de 1055 preguntas.

| Benchmark | Qwen3.8-27B base | Qwen3.8-27B-Sol-SFT | Δ |
|---|---:|---:|---:|
| AIME24 (30) | 96,7% | 90,0% | -6,7 |
| AIME25 (30) | 96,7% | 100,0% | +3,3 |
| GPQA Diamond (198) | 88,4% | 86,4% | -2,0 |
| MATH-500 (500) | 95,8% | 97,0% | +1,2 |
| GSM8K (300) | 97,7% | 97,0% | -0,7 |
| MMLU-Pro (300) | 86,0% | 85,3% | -0,7 |
| IFEval strict (541) | 61,4% | 60,1% | -1,3 |
| LiveCodeBench v6 test6 (175) | 60,6% | 68,6% | +8,0 |

Detalle de LiveCodeBench:

| Métrica | Base | SFT |
|---|---:|---:|
| pass@1 | 60,6% (106/175) | 68,6% (120/175) |
| Longitud media de respuesta | 34,4k | 31,5k |
| Tasa de truncamiento a 65k | 42,3% | 33,1% |

Notas del autor: la tarjeta oficial de Qwen3.8-27B reporta LiveCodeBench v6 = 90,3 sobre las 1055 preguntas de `release_v6` (30,5% easy / 36,3% medium / 33,2% hard), no comparable con el subconjunto test6 de 175 preguntas (45,7% hard). Terminal-Bench 2.1 no se ejecutó por falta de Docker en el entorno de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos (27B × 2 bytes), más caché KV y overhead; en la práctica se requieren 2× A100 80GB, 2× H100 80GB o configuraciones equivalentes con tensor parallelism.
- Cuantización: no se documentan pesos cuantizados; para reducir VRAM habría que generar cuantizaciones propias (AWQ/GPTQ/GGUF), no publicadas por el autor.
- GPU consumer: no cabe en una RTX 4090 (24 GB) en bf16. Sería necesario cuantizar a 4 bits (~14-16 GB) para intentar un despliegue en una sola GPU consumer, opción no validada por el autor.
- Despliegue: transformers (`AutoModelForCausalLM` con `trust_remote_code=True`), SGLang y vLLM cargan el directorio directamente. Para decodificación especulativa, SGLang con `--speculative-algorithm EAGLE --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4`.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens/s. La cabeza MTP está pensada precisamente para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Sol-SFT | 27B | 262.144 | Apache-2.0 | SFT ligero sobre Qwen3.8-27B, orientado a agente y código; LCB test6 68,6% |
| Qwen3.8-27B (base) | 27B | 262.144 | Apache-2.0 | Base sin ajuste; LCB test6 60,6%, mejor en GPQA y AIME24 |
| Qwen3.8-27B (tarjeta oficial) | 27B | 262.144 | Apache-2.0 | Reporta LCB v6 90,3% sobre 1055 preguntas; no comparable directamente |
| Alternativas de 27B-30B | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo texto: el export no incluye la torre visual del modelo base, por lo que no procesa imágenes ni vídeo.
- Los datos de entrenamiento son trayectorias destiladas de profesores fuertes de la comunidad (Sol / GPT-5.6-Sol, GPT-6 / GPT-6.1 Sol), no datos oficiales de OpenAI; el autor recomienda evaluar la conformidad legal antes de usarlo.
- Regresión en conocimiento general y razonamiento: GPQA Diamond cae 2,0 puntos, MMLU-Pro 0,7 y AIME24 6,7 respecto al base. El ajuste prioriza agente y código, no conocimiento enciclopédico.
- IFEval strict baja ligeramente (de 61,4% a 60,1%), lo que indica que el seguimiento estricto de formato no es su punto fuerte.
- LiveCodeBench solo se midió sobre el subconjunto test6 de 175 preguntas (45,7% hard); el conjunto completo v6 de 1055 preguntas no se evaluó, por lo que la comparación con cifras oficiales de otros modelos es engañosa.
- Terminal-Bench 2.1 no se ejecutó, de modo que no hay evidencia publicada sobre tareas de terminal reales.
- Las evaluaciones son de una sola muestra y con temperatura (AIME a 0,6); diferencias de 3,3 puntos sobre 30 problemas no son estadísticamente robustas.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un SFT pequeño sobre datos sintéticos, cabe esperar alucinaciones en dominios fuera de código y agente.
- Idiomas soportados no documentados; el formato chat es el de Qwen3.5 y el dataset parece centrado en inglés/chino, sin garantías para castellano.
- Licencia Apache-2.0, pero sujeta también a la licencia del modelo base Qwen3.8-27B; verificar ambas antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/luna121323/Qwen3.8-27B-Sol-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework slime: no disponible en la información proporcionada
- Megatron-Core: no disponible en la información proporcionada
- SGLang (decodificación EAGLE): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
