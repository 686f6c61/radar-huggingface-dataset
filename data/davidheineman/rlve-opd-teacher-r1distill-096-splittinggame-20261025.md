# davidheineman/rlve-opd-teacher-R1Distill-096-SplittingGame-20261025

## Resumen

RLVE OPD teacher (96-SplittingGame) es un checkpoint de investigación publicado por davidheineman como parte de un experimento de escalado de datos denominado RLVE. Se trata de un ajuste fino del modelo DeepSeek-R1-Distill-Qwen-1.5B, que conserva la arquitectura Qwen2 y sus 1.777.088.000 parámetros (aproximadamente 1,78 mil millones), y que ha sido especializado mediante GRPO en un único entorno de entrenamiento: el juego de reparto «SplittingGame». El autor lo etiqueta como «teacher» dentro de un pipeline de destilación, de modo que su función principal es generar rollouts de alta calidad para entrenar a otros modelos (students) en ese dominio concreto.

El modelo no pretende ser un asistente de propósito general: es un artefacto de investigación para estudiar el escalado de datos y el comportamiento de GRPO (Group Relative Policy Optimization) con un presupuesto fijo. El entrenamiento se limitó a 4.000 rollouts en un entorno con dificultad fija balanceada 0/1, con validación cada 50 actualizaciones (32 prompts × 8 respuestas) y parada al alcanzar pass@1 ≥ 0,98 en validación in-distribution o al agotar el presupuesto.

Su relevancia es metodológica más que de producto: documenta con precisión la configuración del experimento (run de W&B, ficheros `training_run.json` y `training_config.yaml`) y permite reproducir o auditar cómo se comporta un especialista de 1,78 B bajo RL con recompensa de entorno. No incluye estado de optimizador ni de dataloader, por lo que no es reanudable directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2): atención con GQA, RoPE, SwiGLU y RMSNorm |
| Parámetros totales | 1.777.088.000 (~1,78 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base DeepSeek-R1-Distill-Qwen-1.5B; no declarada explícitamente en esta model card |
| Tipos de cuantización | Solo safetensors en precisión nativa; no se distribuyen GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible (no declarado) |
| Licencia | No disponible (no declarada; sujeta a la licencia del modelo base) |
| Formato de pesos | safetensors (más `config` y tokenizer de transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen2, con atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE), activación SwiGLU y normalización RMSNorm. El punto de partida es DeepSeek-R1-Distill-Qwen-1.5B, un destilado de DeepSeek-R1 sobre Qwen2.5-Math-1.5B que hereda el modo de razonamiento con cadena de pensamiento. Sobre esa base, el autor inicializa «actores frescos» y aplica GRPO como especialista en un único entorno, sin recurrir a RLHF o DPO de propósito general.

El entrenamiento usa 1 entorno fijo (SplittingGame) con dificultad balanceada 0/1 y un presupuesto de 4.000 rollouts; el checkpoint final corresponde a la actualización 499 (índice cero), es decir, 4.000 rollouts completos. La generación emplea 1.024 tokens iniciales más una continuación de 128 tokens de «answer-forcing». La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (las muestras de validación no computan en el presupuesto), y el criterio de parada es alcanzar pass@1 ≥ 0,98 en validación in-distribution o agotar los 4.000 rollouts. El repositorio no contiene estado de optimizador ni de dataloader, pero sí los ficheros de configuración que documentan entornos y ajustes exactos.

## Capacidades

- Generación de texto conversacional (tag `conversational`) y de respuestas de razonamiento heredadas del destilado de R1.
- Especialización entrenada por RL en el entorno SplittingGame, con dificultad balanceada 0/1.
- Generación de rollouts y trayectorias de alta calidad como modelo «teacher» en pipelines de destilación (el sufijo `opd-teacher` sugiere uso como profesor en destilación, aunque la model card no lo detalla).
- Razonamiento multi-paso dentro del dominio del juego para el que fue entrenado.
- Soporte de tool calling / function calling: no documentado en esta model card (el modelo base Qwen2 lo soporta, pero no se confirma en este checkpoint).
- Soporte de agentes: no documentado.
- Capacidades multilingües: presumiblemente heredadas de Qwen2.5, pero no declaradas ni verificadas en esta ficha.
- Visión y audio: no soportados.

## Casos de uso

- Destilación on-policy: usar el modelo como profesor para generar rollouts de alta recompensa en SplittingGame y entrenar a un student de menor tamaño, aprovechando que ya alcanza el umbral de validación pass@1 ≥ 0,98 del experimento.
- Generación de datos sintéticos para el entorno: producir trayectorias etiquetadas que sirvan para aumentar el dataset de un entrenamiento posterior de RL o de supervisión en la misma tarea de reparto.
- Investigación en escalado de datos: comparar este checkpoint con otras variantes del grupo `data-scaling-v1-n128-20261022-225839` para estudiar cómo escala el rendimiento con el número de rollouts y entornos.
- Reproducción de experimentos: gracias a `training_run.json`, `training_config.yaml` y el run de W&B, permite auditar y replicar la configuración exacta de GRPO, incluidos los 1.024 + 128 tokens de generación.
- Evaluación de estabilidad de GRPO: analizar curvas de pass@1 y diversidad de respuestas en un régimen de presupuesto corto (4.000 rollouts) para estudiar colapso de política y sobreajuste al entorno.
- Inicialización para nuevos entornos: servir como punto de partida para especializar el modelo en otras tareas de RL, partiendo de un actor que ya ha aprendido el formato y el razonamiento de un juego de reparto.
- Baseline en tareas de reparto: medir pass@1 frente a otros modelos en SplittingGame para calibrar la dificultad del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica documentada es el criterio de parada del entrenamiento: pass@1 ≥ 0,98 en validación in-distribution (32 prompts × 8 respuestas cada 50 actualizaciones), que es un objetivo de entrenamiento y no un benchmark comparable con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada (solo pesos): ~3,6 GB en BF16/FP16, ~1,8 GB en INT8 y ~0,9–1 GB en INT4.
- VRAM estimada con overhead de inferencia: ~4–5 GB en BF16 para secuencias cortas; más si se usan contextos largos cerca de 32.768 tokens.
- GPU recomendadas: cualquier GPU consumer moderna lo ejecuta en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 4 bits cabe incluso en GPUs de 8 GB.
- GPU de datacenter (A100, H100) innecesarias para inferencia; útiles solo para entrenamiento o despliegue concurrente.
- Opciones de despliegue: `transformers` (nativo), vLLM, TGI (el tag `endpoints_compatible` sugiere compatibilidad con Text Generation Inference) y llama.cpp/Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLVE OPD teacher 96-SplittingGame (este) | ~1,78 B | 32k (base) | Especialista GRPO en SplittingGame | No disponible | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,78 B | 32k | Razonamiento general (destilado de R1) | MIT (modelo base) | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32k | Instruct general | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | 32k | Razonamiento general | MIT (modelo base) | HuggingFace |

Nota: comparar un especialista de un solo entorno con modelos de propósito general no es una comparación equivalente; la tabla sirve para situar tamaño, contexto y licencia, no para inferir calidad global.

## Limitaciones y advertencias

- Especialista de un único entorno (SplittingGame); no es un modelo de propósito general ni un asistente listo para conversación abierta.
- Entrenamiento corto (4.000 rollouts) y con dificultad fija 0/1; riesgo de sobreajuste al entorno y de colapso de diversidad típico de GRPO.
- Sin resultados de benchmarks generales publicados; no hay evidencia de rendimiento fuera de su dominio.
- Licencia no declarada; existe riesgo legal para uso comercial. La licencia aplicable sería, como mínimo, la del modelo base.
- Idiomas no declarados; no se puede asumir cobertura multilingüe sin verificación.
- No incluye estado de optimizador ni de dataloader: no es reanudable directamente desde el checkpoint.
- Solo safetensors; para llama.cpp/Ollama hay que convertir a GGUF manualmente.
- Riesgo de alucinación heredado del modelo base, agravado por cadenas de pensamiento largas del destilado de R1.
- Fecha «2026» en el nombre del repositorio y ausencia de descargas/likes: artefacto de investigación sin soporte ni mantenimiento; no recomendado como dependencia de producción.
- El sufijo `opd-teacher` no está desarrollado en la model card; su rol exacto en el pipeline de destilación debe confirmarse con el autor o con los ficheros de configuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-096-SplittingGame-20261025
- Modelo base DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/9f87e1b6
- Ficheros de configuración dentro del repositorio: `training_run.json` y `training_config.yaml`
