# roozbehn99/palm-qwen3b-sky-brev-seed5

## Resumen

El repositorio `roozbehn99/palm-qwen3b-sky-brev-seed5` contiene un portfolio de 13 políticas de lenguaje, todas fine-tuneadas con GRPO (Group Relative Policy Optimization) a partir del modelo base `Qwen/Qwen2.5-3B-Instruct`. Cada política corresponde a un punto distinto del simplex de dos objetivos: utilidad percibida (helpfulness, medida con el reward model Skywork-Reward-Llama-3.1-8B) y brevedad (brevity, una recompensa verificable que penaliza respuestas largas). Los 13 vectores de peso se generan mediante el Algoritmo 1 del paper PALM (con ε=0.4 y δ=0.2), y este repositorio es una de las semillas de entrenamiento de un estudio multi-semilla (seed=5).

El objetivo es servir como artefacto de investigación para experimentos de alineación multi-objetivo y portfolio pruning: permite analizar cómo varía el equilibrio entre helpfulness y brevedad a lo largo del frente de Pareto, y cómo la semilla de entrenamiento afecta a las políticas resultantes. Cada modelo es un fine-tune de parámetros completos en precisión bf16, almacenado en formato Hugging Face `transformers` dentro de una subcarpeta independiente (`idx0/` a `idx12/`). No está pensado para despliegue en producción ni incluye ajustes de seguridad adicionales más allá de los del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) |
| Parametros totales | ~3.09 mil millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; Qwen2.5-3B-Instruct soporta 32 768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | bf16 (formato original); no se proporcionan cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato `transformers`, bf16) |

## Arquitectura y entrenamiento

Cada una de las 13 políticas es un fine-tune completo del modelo `Qwen/Qwen2.5-3B-Instruct` mediante GRPO con una recompensa escalarizada `r = w1·R1 + w2·R2`, donde `R1` es la puntuación normalizada del reward model de helpfulness (Skywork-Reward-Llama-3.1-8B) y `R2` es una recompensa verificable de brevedad (implementada en `open_instruct/rlvr_objectives.py::brevity`). Ambas recompensas se normalizan min-max a [0,1] durante el entrenamiento. El coeficiente de penalización KL frente a la política de referencia es β=0.05.

El entrenamiento se realizó con 40 000 episodios (208 pasos de optimización), tasa de aprendizaje 5e-7, batch efectivo de 4×4 con 4 muestras por prompt, longitud máxima de respuesta de 256 tokens y precisión bf16. Los datos de entrenamiento provienen de `allenai/RLVR-GSM` y `allenai/RLVR-MATH`, y la evaluación post-hoc se hizo sobre el conjunto de test de `allenai/RLVR-GSM` (1319 prompts, muestreo con T=0.7, 256 tokens máximos). El hardware utilizado fueron 4× NVIDIA A100-80GB o 4× H100. Los 13 vectores de peso se generan con el Algoritmo 1 del paper PALM y cubren todo el simplex bidimensional.

## Capacidades

- Generación de texto y razonamiento matemático básico, heredados del modelo base Qwen2.5-3B-Instruct.
- Comportamiento diferenciado según el índice `idxN`: los índices bajos (idx0-idx6) priorizan helpfulness, los altos (idx7-idx12) priorizan brevedad.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Cada subcarpeta contiene una política independiente; se puede cargar individualmente con `AutoModelForCausalLM` y `AutoTokenizer` indicando el `subfolder`.
- Es un artefacto de investigación para estudiar el trade-off entre dos objetivos de alineación, no un modelo de propósito general.

## Casos de uso

- Investigación en alineación multi-objetivo: analizar cómo varía el rendimiento en helpfulness y brevedad a lo largo del frente de Pareto generado por los 13 vectores de peso.
- Estudio de portfolio pruning: evaluar qué políticas del portfolio son redundantes y cuáles aportan diversidad de comportamiento.
- Reproducción de experimentos del paper PALM: este repositorio proporciona una semilla completa con configuración idéntica a otras semillas hermanas, permitiendo comparar la influencia de la semilla en los resultados.
- Análisis de la relación entre KL y rendimiento: las métricas post-hoc (R1, R2, KL) permiten estudiar la regularización implícita del término KL en GRPO.
- Comparación de políticas en el simplex: usar los modelos idx0-idx12 como puntos de referencia para calibrar nuevos métodos de alineación multi-objetivo.
- Docencia y demostraciones de RLHF multi-objetivo: cargar diferentes políticas y observar cómo cambia el estilo de respuesta según el peso asignado a cada objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación post-hoc sobre el conjunto de test de RLVR-GSM con métricas normalizadas de helpfulness (R1), brevedad (R2) y divergencia KL frente al modelo de referencia. Los valores disponibles son:

| subfolder | w_help | w_brev | R1 (help) | R2 (brev) | KL |
|---|---|---|---|---|---|
| `idx7` | 0.000 | 1.000 | 0.722 | 0.435 | 5.45 |
| `idx8` | 0.167 | 0.833 | 0.720 | 0.416 | 4.97 |
| `idx9` | 0.219 | 0.781 | 0.746 | 0.387 | 4.21 |
| `idx10` | 0.282 | 0.718 | 0.754 | 0.385 | 3.54 |
| `idx11` | 0.354 | 0.646 | 0.757 | 0.388 | 3.57 |
| `idx12` | 0.434 | 0.566 | 0.789 | 0.372 | 3.21 |

Los valores para los índices 0 a 6 no se han publicado (aparecen como guiones en la tabla original). No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia de un solo modelo (3B parámetros en bf16): aproximadamente 6.2 GB de VRAM, cabe en GPUs de consumo como RTX 3080/3090, RTX 4070/4080, o GPUs de datacenter como A10, L4, A100.
- Para cargar los 13 modelos simultáneamente se necesitarían unos 80 GB de VRAM (el repositorio completo ocupa 80.2 GB en disco).
- El entrenamiento original se realizó con 4× A100-80GB o 4× H100, pero la inferencia es mucho menos exigente.
- Opciones de despliegue: al ser un formato `transformers` estándar, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). Sin embargo, no está recomendado para producción.
- Latencia y throughput: no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3.09B | 32k | Apache-2.0 | Instrucción general, sin optimización multi-objetivo |
| roozbehn99/palm-qwen3b-sky-brev-seed5 | 3.09B (13 variantes) | no disponible | Apache-2.0 | GRPO multi-objetivo (helpfulness × brevedad) |
| Llama-3.2-3B-Instruct | 3.2B | 128k | Llama 3.2 Community License | Instrucción general, sin optimización multi-objetivo |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia de este portfolio es su naturaleza de artefacto de investigación con 13 políticas en el frente de Pareto, frente a modelos de instrucción estándar.

## Limitaciones y advertencias

- No está ajustado para seguridad más allá del modelo base Qwen2.5-3B-Instruct; puede generar contenido inapropiado o sesgado.
- No está destinado a despliegue en producción; es un artefacto de investigación para experimentos de alineación.
- Las métricas de evaluación solo cubren los índices 7 a 12; los índices 0 a 6 carecen de datos publicados.
- El comportamiento varía significativamente entre políticas: los modelos con mayor peso en brevedad pueden producir respuestas demasiado cortas o incompletas.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara explícitamente que no es para despliegue.
- El repositorio ocupa 80.2 GB; la descarga completa puede ser costosa si solo se necesita una política.
- No se documentan capacidades multilingües; el modelo base está principalmente entrenado en inglés y chino, pero no se especifica en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed5
- Repositorio hermano (seed=2): https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Reward model de helpfulness: https://huggingface.co/Skywork/Skywork-Reward-Llama-3.1-8B
- Datos de entrenamiento: https://huggingface.co/datasets/allenai/RLVR-GSM y https://huggingface.co/datasets/allenai/RLVR-MATH
- Código de entrenamiento (fork de open-instruct): no se proporciona URL directa en la información disponible.
