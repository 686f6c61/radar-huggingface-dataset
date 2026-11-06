# mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step147

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p12544x1-step147` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario mhseo2 sobre la familia abierta Olmo de Allen AI. El objetivo concreto es inducir capacidades de razonamiento matemático paso a paso (estilo *thinking*) en un modelo base de 7.298 millones de parámetros, destilando trazas de razonamiento generadas por un modelo mayor, `allenai/Olmo-3.1-32B-Think`.

El entrenamiento se realizó sobre el subconjunto de prompts matemáticos de OpenThoughts3, con un brazo de datos de 12.544 prompts y una trayectoria por prompt (aproximadamente 225 millones de tokens), filtrando únicamente las respuestas que terminan correctamente, cierran una etiqueta `</think>` y enmarcan la respuesta final dentro de los 32.768 tokens. El checkpoint publicado corresponde al paso 147 (época 3 de 15) de un total de 735 pasos previstos.

Es relevante porque demuestra un flujo de destilación de razonamiento reproducible sobre hardware europeo (BSC MareNostrum 5) y con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, se trata de un checkpoint intermedio de un experimento de investigación, con un único punto de evaluación y sin model card exhaustiva sobre idiomas o sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, según modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (límite usado en entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, repo de 14,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `mhseo2/Olmo-3-1025-7B-opd`, que a su vez deriva de Olmo-3-1025-7B de Allen AI: un transformer decoder-only denso de aproximadamente 7.300 millones de parámetros. No se documentan en la información disponible innovaciones arquitectónicas propias de este checkpoint; el interés está en el procedimiento de ajuste, no en cambios estructurales.

El SFT se realizó sobre 12.544 prompts matemáticos de OpenThoughts3, cada uno con una única trayectoria de razonamiento generada por `allenai/Olmo-3.1-32B-Think` (destilación). El filtrado exige que la respuesta complete el razonamiento, cierre exactamente una vez `</think>` y enmarque una respuesta final, todo dentro de 32.768 tokens; además se aplicó descontaminación de n-gramas (10-gram) contra AIME 2025, AIME 2026 y HMMT Feb 2025. Hiperparámetros: batch 256, learning rate 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3 %, weight decay 0,01 y 49 pasos por época (735 pasos totales para 15 épocas). El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos × 4 H100 usando FSDP y Ulysses sequence parallelism con grado 2. El checkpoint publicado corresponde al paso 147.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso en modo *thinking*, con cierre explícito de `</think>` y respuesta final enmarcada.
- Resolución de problemas de competición matemática (AIME, HMMT) mediante cadenas de razonamiento largas, de hasta 32.768 tokens de respuesta.
- Generación de código y razonamiento general: capacidad heredada del modelo base Olmo 3, aunque no evaluada en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al razonamiento interno de la cadena de pensamiento; no se documentan capacidades de agente.
- Capacidades multilingües: no disponibles; el entrenamiento se centró en prompts matemáticos en inglés.
- Modo *thinking*: sí, inducido por SFT sobre trazas de un modelo *Think* mayor.
- Visión y audio: no disponibles.

## Casos de uso

- Evaluación de destilación de razonamiento: usar el checkpoint como referencia para medir cuánto razonamiento matemático de un modelo de 32B se transfiere a uno de 7B con 12.544 muestras y 147 pasos; útil en investigación sobre eficiencia de datos.
- Generación de soluciones matemáticas con traza auditable: el formato `</think>` + respuesta enmarcada permite extraer y verificar automáticamente la respuesta final, integrándose en pipelines de corrección con `math_verify`.
- Baseline para *fine-tuning* posterior: al estar en un paso intermedio (época 3 de 15), sirve como punto de partida para experimentos de continuación de entrenamiento o de mezcla con otros dominios.
- Investigación sobre descontaminación de benchmarks: el filtrado de 10-gramas contra AIME 2025/2026 y HMMT permite estudiar el impacto de la contaminación en la evaluación de modelos matemáticos pequeños.
- Reproducción de infraestructura distribuida: el uso de FSDP y Ulysses SP sobre 8 H100 documenta una receta replicable para entrenar modelos de 7B con contexto de 32K en clústeres modestos.
- Docencia y divulgación: ejemplo didáctico de un pipeline completo de SFT con destilación, filtrado de calidad y evaluación con `mean@8`.

## Benchmarks y rendimiento

Evaluación con `mean@8` (%), temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutada en Quadro RTX 6000 en float16:

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 40,42 |
| AIME 2026 | 42,50 |
| HMMT Feb 2025 | 27,92 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas adicionales (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos, más caché KV para contexto de hasta 32.768 tokens; en la práctica se recomienda al menos 24 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 7,3 GB de pesos; en 4 bits, alrededor de 3,7 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: H100 o A100 para entrenamiento e inferencia de referencia; RTX 4090 (24 GB) para inferencia en float16 con contexto reducido; Quadro RTX 6000 fue la GPU usada en la evaluación del autor.
- Cabe en GPU de consumo: sí, en RTX 4090 en float16 con contexto moderado, y en GPUs de 16 GB si se cuantiza a 8 bits.
- Opciones de despliegue: al publicarse solo en safetensors, requiere conversión para llama.cpp/Ollama (GGUF); para vLLM y TGI es compatible directamente con la arquitectura Olmo 3. No se documentan recetas oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación matemática | Disponibilidad |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p12544x1-step147 | 7,30B | 32.768 | Apache 2.0 | AIME 2025: 40,42 (mean@8) | Hugging Face (safetensors) |
| Olmo-3-1025-7B (base, Allen AI) | ~7B | no disponible | Apache 2.0 | no disponible | Hugging Face |
| allenai/Olmo-3.1-32B-Think (profesor) | ~32B | no disponible | no disponible | no disponible | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 32.768 | MIT | AIME 2024: 55,5 (pass@1, referencia pública) | Hugging Face, GGUF |

La comparación con DeepSeek-R1-Distill-Qwen-7B se incluye como referencia de categoría (destilación de razonamiento a 7B), pero las métricas no son directamente comparables: distinto benchmark (AIME 2024 vs. 2025/2026), distinto scorer y distinto protocolo (`mean@8` frente a `pass@1`).

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la época 3 de 15 (paso 147 de 735); el autor no publica resultados de checkpoints posteriores, por lo que el rendimiento final puede diferir.
- Sesgos conocidos: no documentados; al entrenarse sobre trazas de un modelo mayor, puede heredar sesgos de estilo y de razonamiento del profesor.
- Riesgo de alucinación: alto en dominios fuera de matemáticas, ya que el SFT se limita a prompts matemáticos y no se documenta ajuste de alineación adicional.
- Limitaciones de contexto e idioma: el entrenamiento usa hasta 32.768 tokens; no se documenta comportamiento multilingüe y los prompts son presumiblemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `mhseo2/Olmo-3-1025-7B-opd` y de los datos de destilación (OpenThoughts3 y trazas de Olmo-3.1-32B-Think).
- Caveat para producción: no hay model card con evaluación de seguridad, ni datos de robustez, ni soporte de tool calling documentado; no se recomienda su despliegue en producción sin evaluación adicional.
- Reproducibilidad: se documentan hashes SHA-256 de todos los ficheros y el commit del código de entrenamiento, lo que facilita la verificación, pero no se publican los datos de entrenamiento ni los scripts de filtrado.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step147
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset: https://huggingface.co/datasets/open-thoughts/OpenThoughts3
- Familia Olmo de Allen AI: https://allenai.org/olmo
