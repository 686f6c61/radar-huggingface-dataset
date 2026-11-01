# mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step147

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p3136x4-step147` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario `mhseo2`. El objetivo es transferir trazas de razonamiento matemático del modelo `allenai/Olmo-3.1-32B-Think` a un modelo de 7.298 millones de parámetros, de modo que un modelo más pequeño y desplegable en hardware modesto adquiera capacidad de razonamiento paso a paso sobre problemas de competición matemática. El checkpoint publicado corresponde al paso 147 del entrenamiento, dentro de la época 3 de 15.

La relevancia de esta ficha es doble. Por un lado, ilustra una técnica de destilación de razonamiento (reasoning distillation) mediante SFT sobre trazas generadas por un modelo mayor, con filtrado estricto de las mismas. Por otro, demuestra el uso de infraestructura europea (BSC MareNostrum 5) para entrenamiento distribuido con FSDP sobre 8 GPU H100. El modelo está pensado exclusivamente para evaluación de razonamiento matemático, no como asistente general.

El resultado es un modelo de 7.298.011.136 parámetros, con licencia Apache 2.0, pesos en safetensors y un sesgo claro hacia problemas de tipo AIME y HMMT. Los resultados reportados son modestos pero medibles: 40,83 en AIME 2025, 40,83 en AIME 2026 y 25,83 en HMMT Feb 2025, medidos con `mean@8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, base Olmo-3-1025-7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento filtra muestras a 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards) + tokenizer (tokenizer.json, vocab.json, merges.txt) |

## Arquitectura y entrenamiento

El modelo parte de `mhseo2/Olmo-3-1025-7B-opd`, un checkpoint derivado de Olmo-3-1025-7B de AI2. La arquitectura es la de Olmo 3, un transformer decoder-only con atención causal estándar; no se documenta en la model card ninguna modificación estructural (no es MoE, no es híbrido SSM). El ajuste se realiza mediante SFT clásico sobre pares prompt-respuesta generados por un profesor de 32B.

El dataset se construye a partir de 3.136 prompts matemáticos de OpenThoughts3, con 4 trayectorias por prompt (12.544 muestras, ~225M tokens). Solo se conservan las trayectorias que terminan correctamente, cierran `</think>` una única vez y encierran una respuesta en `\boxed{}` después de ese cierre, todo ello dentro de 32.768 tokens. Además, se aplica decontaminación por 10-gramas contra AIME 2025, AIME 2026 y HMMT Feb 2025, lo cual es relevante para interpretar los benchmarks. El entrenamiento usa batch 256, learning rate 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3%, weight decay 0.01 y 49 pasos por época. Se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, FSDP y Ulysses sequence parallelism 2. No se menciona RLHF ni DPO; es SFT puro.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso con modo "thinking" explícito (tags `</think>` y respuesta en `\boxed{}`).
- Resolución de problemas de competición matemática (estilo AIME, HMMT) con cadenas de razonamiento largas, hasta 32.768 tokens de respuesta.
- Generación de múltiples muestras por prompt (evaluado con `mean@8`), lo que sugiere utilidad en esquemas de self-consistency o majority voting.
- Capacidad de seguir el chat template propio del estudiante (se incluye `chat_template.jinja`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües específicas.
- El modelo está especializado en matemáticas; sus capacidades generales de conversación no se han evaluado ni documentado.

## Casos de uso

- Evaluación de destilación de razonamiento: sirve como referencia para medir cuánto razonamiento matemático de un profesor de 32B se transfiere a un estudiante de 7B mediante SFT, comparando checkpoints intermedios (este es el paso 147).
- Generación de soluciones matemáticas con verificación automática: el formato `\boxed{}` permite extraer la respuesta final y validarla con `math_verify` en pipelines de evaluación reproducibles.
- Investigación en self-consistency: al generar 8 muestras por prompt con temperatura 0,6 y top_p 0,95, se puede estudiar majority voting sobre problemas de competición.
- Benchmarking de infraestructura: al ser un modelo de 7B con pesos safetensors, es útil para medir throughput y latencia en H100, A100 o GPUs consumer con cuantización, en pipelines de evaluación a gran escala.
- Estudio de contaminación de datos: la decontaminación por 10-gramas contra AIME y HMMT permite analizar el impacto de la limpieza del dataset en el rendimiento reportado.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y con pesos abiertos, puede servir como punto de partida para SFT adicional en dominios matemáticos específicos (álgebra, geometría, combinatoria) o para experimentos de RL posterior.
- Docencia e investigación en destilación: permite reproducir el pipeline (prompts de OpenThoughts3, filtrado estricto, FSDP con Ulysses SP) en clústeres pequeños.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos con `mean@8`, temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de hasta 32.768 tokens, scorer `math_verify`, en NVIDIA H100 80GB HBM3 en float16.

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 40,83 |
| AIME 2026 | 40,83 |
| HMMT Feb 2025 | 25,83 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y KV cache; con contexto de 32.768 tokens el KV cache puede añadir varios GB adicionales.
- En cuantización de 8 bits: ~7,3 GB de pesos; en 4 bits: ~3,7 GB de pesos, aunque no se publican versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: H100 80GB (usada en la evaluación), A100 40/80GB; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en fp16 ajustadamente, pero con contexto largo requerirá cuantización u offloading.
- Cabe en GPUs consumer de 24 GB (RTX 3090, 4090) en fp16 con contexto moderado; en 16 GB (RTX 4080) solo con cuantización.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previa conversión a GGUF, no publicada); al ser safetensors estándar, es compatible con transformers y accelerate.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p3136x4-step147 | 7,298B | no disponible (entrenado a 32k) | Apache 2.0 | HuggingFace, 35 descargas | SFT matemático sobre Olmo-3 base |
| Olmo-3-1025-7B (AI2) | ~7B | no disponible | Apache 2.0 | HuggingFace | Modelo base generalista |
| allenai/Olmo-3.1-32B-Think | 32B | no disponible | no disponible | HuggingFace | Profesor usado para generar las trazas |
| Qwen2.5-Math-7B | 7B | 4k (ampliable) | Apache 2.0 | HuggingFace | Especializado en matemáticas, benchmarks públicos |

No se dispone de comparaciones directas de rendimiento entre estos modelos en la información proporcionada; la comparativa es estructural y de licencia.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 147, época 3 de 15): no es el modelo final del entrenamiento y su rendimiento puede no representar el mejor checkpoint de la serie.
- Especializado exclusivamente en matemáticas: no se han evaluado capacidades generales de conversación, código, visión ni multilingüismo; su uso como asistente general no está respaldado por datos.
- Riesgo de alucinación en razonamientos largos: aunque el filtrado exige cierre de `</think>` y respuesta en `\boxed{}`, el modelo puede producir cadenas plausibles con resultados incorrectos.
- Los benchmarks reportados (AIME 2025/2026, HMMT Feb 2025) son los mismos contra los que se aplicó decontaminación por 10-gramas; aunque la decontaminación reduce el riesgo, no lo elimina por completo.
- El contexto máximo efectivo no está documentado; el entrenamiento filtra a 32.768 tokens, pero no se garantiza comportamiento estable más allá de esa longitud.
- No se documentan sesgos conocidos, pero al derivar de Olmo-3 hereda los sesgos del modelo base y de los datos de OpenThoughts3.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `mhseo2/Olmo-3-1025-7B-opd` y el profesor `allenai/Olmo-3.1-32B-Think` tienen sus propias condiciones que conviene verificar antes de producción.
- No hay versiones cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware consumer sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step147
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: https://huggingface.co/datasets/open-r1/OpenThoughts3 (referencia a OpenThoughts3)
- Repositorio de código citado: `mopdRL` live tree `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (package `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL directa.
