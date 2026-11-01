# mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step735

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p6272x2-step735` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario mhseo2 sobre el checkpoint `mhseo2/Olmo-3-1025-7B-opd`. El objetivo es inyectar capacidades de razonamiento matemático en un modelo base de 7.298 millones de parámetros mediante la destilación de trazas de razonamiento generadas por un modelo mayor, en concreto `allenai/Olmo-3.1-32B-Think`, sobre los prompts matemáticos del dataset OpenThoughts3.

El modelo se presenta como un checkpoint intermedio de un pipeline de investigación (denominado `mopdRL`), no como un producto final. El autor documenta el proceso de entrenamiento con detalle inusual: brazo de datos `p6272x2` (6.272 prompts por 2 trayectorias = 12.544 muestras, unos 225 millones de tokens), filtrado estricto de trayectorias y descontaminación por n-gramas contra AIME 2025/2026 y HMMT Feb 2025. Esto lo hace relevante para quienes estudian recetas de destilación de razonamiento en modelos pequeños y abiertos.

La relevancia actual radica en dos factores: por un lado, demuestra que un modelo base de 7B puede adquirir competencia matemática medible (44,17 % en AIME 2025 con mean@8) mediante SFT sobre trazas de un modelo de 32B; por otro, toda la receta, los datos y los hiperparámetros están documentados y liberados bajo licencia Apache 2.0, lo que facilita su reproducción y auditoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, según el modelo base; detalles específicos no disponibles) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (el entrenamiento usa 32.768 tokens de prompt + respuesta) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente float16/bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, 14,6 GB en total) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `mhseo2/Olmo-3-1025-7B-opd`, que a su vez deriva de Olmo-3-1025-7B de AllenAI. Se trata de un transformer decoder-only de 7.298 millones de parámetros. La información proporcionada no detalla la configuración interna (número de capas, dimensiones, tipo de atención), por lo que esos datos deben consultarse en el `config.json` del repositorio o en la documentación de Olmo 3.

El entrenamiento es un SFT sobre trazas de razonamiento del modelo `allenai/Olmo-3.1-32B-Think` aplicadas a prompts matemáticos de OpenThoughts3. El brazo de datos `p6272x2` contiene 6.272 prompts con 2 trayectorias cada uno (12.544 muestras, ~225 millones de tokens). Solo se conservaron las trayectorias que cumplían tres condiciones: finalizar dentro de 32.768 tokens, cerrar `</think>` exactamente una vez y emitir una respuesta en caja tras el cierre. Se aplicó descontaminación por 10-gramas contra AIME 2025, AIME 2026 y HMMT Feb 2025. Los hiperparámetros son: batch de 256, learning rate 8e-5 con decaimiento coseno a 4e-5 y 3 % de warmup, weight decay 0,01, 49 pasos por época y 15 épocas en total (735 pasos). El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, usando FSDP y Ulysses sequence parallelism con grado 2. El código corresponde al árbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático de varios pasos, con modo de pensamiento explícito delimitado por `</think>`.
- Resolución de problemas de competición (AIME, HMMT) con formato de respuesta en caja, apto para evaluación automática con `math_verify`.
- Razonamiento de cadena larga: el entrenamiento permite respuestas de hasta 32.768 tokens, lo que habilita trazas de pensamiento extensas.
- Generación de código y matemáticas generales: no se documenta explícitamente, pero el modelo base Olmo 3 las cubre; el SFT se centra en matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el formato de trazas es compatible con pipelines de razonamiento.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre prompts de OpenThoughts3, mayoritariamente en inglés.
- Capacidad especial: modo de pensamiento (`think`) heredado del profesor Olmo-3.1-32B-Think, con cierre único de `</think>` y respuesta en caja.

## Casos de uso

- Evaluación de recetas de destilación de razonamiento: sirve como punto de comparación reproducible para estudiar cómo un modelo base de 7B adquiere habilidades matemáticas a partir de trazas de un modelo de 32B, con hiperparámetros y datos documentados.
- Investigación en SFT matemático: el checkpoint intermedio (paso 735, época 15) permite analizar la curva de aprendizaje y el efecto del filtrado de trayectorias (cierre único de `</think>`, respuesta en caja, límite de 32.768 tokens).
- Generación de soluciones paso a paso para problemas de competición: el formato de salida (pensamiento + respuesta en caja) encaja con pipelines de corrección automática tipo `math_verify`, útil en plataformas de entrenamiento olímpico.
- Benchmarking de modelos pequeños en matemáticas: con 7B parámetros y licencia Apache 2.0, es adecuado para comparar contra otros modelos de tamaño similar en AIME y HMMT bajo protocolos controlados (mean@8, temperatura 0,6, top_p 0,95).
- Estudio de descontaminación: el uso de descontaminación por 10-gramas contra AIME 2025/2026 y HMMT Feb 2025 lo convierte en un caso práctico para auditar metodologías anti-fuga en benchmarks matemáticos.
- Base para ajustes posteriores (RL o DPO): al ser un checkpoint intermedio de un pipeline `mopdRL`, puede servir como inicialización para etapas posteriores de refinamiento con refuerzo, siempre que se respete la licencia Apache 2.0.
- Despliegue en infraestructura modesta para prototipos: con 7,3B parámetros y pesos en safetensors de 14,6 GB, es viable en una GPU de 24 GB con cuantización o en varias GPUs consumer para experimentación.

## Benchmarks y rendimiento

Resultados publicados por el autor (mean@8, temperatura 0,6, top_p 0,95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA B200 en float16):

| Benchmark | Resultado (%) |
|---|---|
| AIME 2025 | 44,17 |
| AIME 2026 | 43,33 |
| HMMT Feb 2025 | 27,08 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni tablas de comparación directa.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,6 GB en float16 (tamaño del repo en safetensors); ~7,3 GB en cuantización de 8 bits y ~4 GB en 4 bits (estimaciones teóricas a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: el autor evaluó en NVIDIA B200; el entrenamiento se realizó en H100. Para inferencia, una A100 40 GB o H100 80 GB ofrecen margen holgado con contexto largo.
- ¿Cabe en GPU consumer? Sí, en tarjetas de 24 GB (RTX 3090, RTX 4090) con cuantización o en float16 con contexto reducido; en 16 GB (RTX 4080) solo con cuantización agresiva.
- Opciones de despliegue: no documentadas por el autor. Al ser safetensors de la familia Olmo, es compatible con vLLM, TGI y transformers; para GGUF/llama.cpp requeriría conversión manual.
- Latencia y throughput: no disponibles. El contexto de 32.768 tokens y las trazas de razonamiento largas implican latencias elevadas en generación; no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento matemático |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p6272x2-step735 | 7,3B | no disponible (entrenado a 32.768) | Apache 2.0 | HuggingFace (35 descargas) | AIME 2025: 44,17 % (mean@8) |
| Olmo-3-1025-7B (base) | ~7B | no disponible | Apache 2.0 | HuggingFace (AllenAI) | no disponible en esta ficha |
| Olmo-3.1-32B-Think (profesor) | ~32B | no disponible | no disponible | HuggingFace (AllenAI) | no disponible en esta ficha |
| Qwen2.5-Math-7B | ~7B | no disponible | no disponible | HuggingFace | no disponible en esta ficha |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de los modelos comparables deberían consultarse en sus respectivas fichas.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un pipeline de investigación (`mopdRL`), no un modelo final validado para producción.
- El ajuste se centra exclusivamente en matemáticas (OpenThoughts3, AIME, HMMT); el rendimiento en otras tareas (código, conversación general, multilingüe) no está evaluado y puede haberse degradado respecto al base.
- Riesgo de alucinación en razonamientos matemáticos: el modelo puede producir trazas plausibles con errores aritméticos o lógicos, especialmente fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados; el entrenamiento usa prompts mayoritariamente en inglés, por lo que el rendimiento en castellano no está verificado.
- Sesgos: no documentados por el autor; al derivar de Olmo 3, hereda los sesgos del corpus de preentrenamiento original, no analizados en esta ficha.
- Longitud de contexto no especificada en la información; el entrenamiento usa hasta 32.768 tokens, pero la ventana efectiva del modelo base debe confirmarse en `config.json`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener condiciones adicionales que deben verificarse en sus repositorios.
- Solo 35 descargas y 0 likes: ecosistema mínimo, sin validación independiente de los resultados publicados.
- Los benchmarks se ejecutaron con mean@8 y temperatura 0,6; comparaciones con otros modelos requieren replicar exactamente ese protocolo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step735
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3: no disponible en la información proporcionada
- Código `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`): no se proporciona URL en la información disponible
- Paper o blog de Olmo 3: no disponible en la información proporcionada
