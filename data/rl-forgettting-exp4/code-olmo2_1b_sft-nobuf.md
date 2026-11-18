# RL-Forgettting-Exp4/code-olmo2_1b_sft-nobuf

## Resumen

`code-olmo2_1b_sft-nobuf` es un ajuste fino mediante aprendizaje por refuerzo (GRPO) del modelo `allenai/OLMo-2-0425-1B-SFT`, desarrollado por el grupo de investigación RL-Forgettting-Exp4 en el marco de un estudio sobre olvido catastrófico durante el entrenamiento con RL. El modelo resuelve un problema de investigación concreto: medir cómo evoluciona el rendimiento en generación de código (MBPP+) a lo largo de 300 pasos de GRPO cuando no se utiliza ningún búfer de repetición de datos SFT, comparándolo con una variante hermana que sí lo emplea.

El modelo parte de la arquitectura OLMo-2 de 1B parámetros de AI2, un transformer decoder-only denso con una ventana de contexto de 4096 tokens, y se entrena exclusivamente sobre el split de entrenamiento de MBPP (320 prompts) con una recompensa binaria basada en la ejecución del programa generado contra los asserts de cada tarea. La relevancia actual es metodológica: el repositorio publica checkpoints cada 50 pasos junto con evaluaciones completas de pass@k, lo que permite analizar la dinámica de aprendizaje y olvido en RL para código con un modelo pequeño, reproducible y de licencia Apache 2.0.

El interés práctico es limitado fuera del ámbito de la investigación: no es un modelo de propósito general optimizado para producción, sino un artefacto experimental con 0 descargas y 0 likes en el momento de redactar esta ficha. Su valor reside en la trazabilidad del entrenamiento y en los datos de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo-2) |
| Parametros totales | 1B (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), un subdirectorio por checkpoint |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `allenai/OLMo-2-0425-1B-SFT` (revisión `0d85a3d037876ce6ac7d4311d994400fc66ac27f`), un transformer decoder-only denso de aproximadamente 1B parámetros con contexto de 4096 tokens. Sobre esta base se aplica GRPO mediante la librería verl, con 8 rollouts por prompt, sin normalización de la desviación estándar de ventajas, sin pérdida KL ni KL en la recompensa, y coeficiente de entropía 0 (aunque la entropía se registra). La recompensa es binaria: se ejecuta el programa generado contra los asserts de la tarea con un tiempo límite de 10 segundos.

Los datos de entrenamiento son el split de entrenamiento de MBPP (320 prompts), con validación nativa sobre el split de test de 378 prompts cada 50 pasos. Se realizan 300 pasos (60 épocas) con un batch de 64 prompts × 8 rollouts, mini-batch PPO de 64, learning rate constante de 1e-6, weight decay 0.01, temperatura de rollout 1.0, prompt de hasta 1024 tokens y respuesta de hasta 3072 tokens. No se emplea búfer de repetición. El entrenamiento se ejecutó en 2 × H100 80GB con 22 workers de ejecución de código (en lugar de 32, por límite de cgroup), con W&B en modo offline y 4 reinicios por preempción. Los checkpoints se guardan cada 10 pasos de forma nativa y se publican cada 50 (pasos 50 a 300).

## Capacidades

- Generación de código Python a partir de descripciones de problemas, entrenada específicamente sobre el formato de MBPP.
- Razonamiento de un solo turno orientado a la resolución de tareas de programación con verificación por ejecución.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Capacidad base heredada del modelo OLMo-2-0425-1B-SFT, aunque el ajuste con GRPO está especializado en código y puede degradar otras capacidades (ver limitaciones).

## Casos de uso

- Investigación sobre olvido catastrófico en RL: el modelo sirve como brazo de control (sin búfer de repetición) para comparar con la variante con replay y analizar la evolución de pass@k a lo largo de 300 pasos. Es su uso principal y el único claramente documentado.
- Reproducción de experimentos de GRPO para código: los checkpoints cada 50 pasos y los scripts de entrenamiento publicados permiten reproducir la curva de aprendizaje y validar resultados en MBPP+.
- Análisis de dinámica de recompensa binaria por ejecución: útil para estudiar cómo una señal de recompensa estricta (asserts con timeout de 10 s) afecta a la diversidad de soluciones (pass@64 y pass@128 caen con el entrenamiento).
- Estudio de la relación entre pass@1 y pass@k: el modelo muestra un aumento de pass@1 (de 0.149 a ~0.334) con una caída simultánea de pass@k para k grandes, un fenómeno relevante para investigar la pérdida de diversidad en RL.
- Generación de código Python en entornos controlados de evaluación: puede usarse para generar soluciones a problemas tipo MBPP, siempre con verificación por ejecución y sin expectativas de calidad en producción.
- Benchmarking de infraestructura de evaluación: sirve para probar pipelines de ejecución de código, scorers de MBPP+ y estimadores de pass@k con un modelo pequeño que cabe en una sola GPU.

## Benchmarks y rendimiento

Evaluación en MBPP+ (378 problemas), 160 muestras por problema, temperatura 0.6, top-p 0.95, hasta 3072 tokens nuevos, con el scorer nativo de ejecución y el conjunto completo de tests de MBPP+ (~108 tests por problema).

| Paso | Origen | pass@1 | pass@8 | pass@64 | pass@128 |
| ---: | --- | ---: | ---: | ---: | ---: |
| 0 | modelo base | 0.1490 | 0.4106 | 0.6165 | 0.6648 |
| 50 | esta ejecución | 0.3385 | 0.4913 | 0.5863 | 0.6099 |
| 100 | esta ejecución | 0.3326 | 0.4268 | 0.4953 | 0.5107 |
| 150 | esta ejecución | 0.3330 | 0.4277 | 0.4823 | 0.4935 |
| 200 | esta ejecución | 0.3241 | 0.4019 | 0.4602 | 0.4730 |
| 250 | esta ejecución | 0.3251 | 0.4039 | 0.4484 | 0.4538 |
| 300 | esta ejecución | 0.3339 | 0.4058 | 0.4571 | 0.4662 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo de ~1B parámetros en bf16 requiere aproximadamente 2 GB de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: el entrenamiento se realizó en 2 × H100 80GB, pero la inferencia de un modelo de 1B es viable en GPUs mucho menores.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM (dato no confirmado en la información proporcionada).
- Opciones de despliegue: los pesos están en safetensors bf16 y son compatibles con `transformers` (ejemplo incluido en la model card con `AutoModelForCausalLM`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | pass@1 (MBPP+) | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| code-olmo2_1b_sft-nobuf | ~1B | 4096 | 0.3339 (paso 300) | Apache 2.0 | Hugging Face |
| code-olmo2_1b_sft-replay-hardcd-lam0p1 | ~1B | 4096 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| allenai/OLMo-2-0425-1B-SFT (base) | ~1B | 4096 | 0.1490 (paso 0) | Apache 2.0 | Hugging Face |

La comparativa con modelos de código de propósito general (por ejemplo, variantes de Qwen2.5-Coder o CodeLlama de tamaño similar) no está disponible en la información proporcionada y no se incluye para evitar datos no verificados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse solo sobre MBPP, puede heredar sesgos del modelo base y del dataset.
- Riesgo de alucinación: alto en tareas fuera del dominio de MBPP, ya que el ajuste con RL está especializado y no se documenta evaluación fuera de dicho benchmark.
- Limitaciones de contexto: ventana de 4096 tokens, con prompt limitado a 1024 y respuesta a 3072 durante el entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad.
- Degradación de rendimiento: los datos muestran que pass@64 y pass@128 caen de 0.6165/0.6648 (base) a 0.4571/0.4662 (paso 300), lo que indica pérdida de diversidad y posible olvido de capacidades del modelo base.
- Especialización estrecha: entrenado únicamente con 320 prompts de MBPP; no se recomienda su uso en producción para generación de código general.
- Reproducibilidad: el entrenamiento sufrió 4 reinicios por preempción y W&B se ejecutó en modo offline; las actualizaciones posteriores al último checkpoint se recalcularon.
- Idiomas: no se documenta soporte multilingüe; el entrenamiento es en inglés (MBPP).
- Estado del repositorio: 0 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/code-olmo2_1b_sft-nobuf
- Variante hermana con búfer de repetición: https://huggingface.co/RL-Forgettting-Exp4/code-olmo2_1b_sft-replay-hardcd-lam0p1
- Dataset de resultados de evaluación: https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109/tree/main/evaluations
- Artefactos de entrenamiento (rollouts, validación, W&B offline): https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109/tree/main/mbpp-olmo2-1b-sft-nobuf
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-SFT
- Repositorio de código fuente citado: `jy-evangeline/rl-forgetting-experiments` (commit `1fa2cc9`)
