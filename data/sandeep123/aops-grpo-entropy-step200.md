# sandeep123/aops-grpo-entropy-step200

## Resumen

El modelo `sandeep123/aops-grpo-entropy-step200` es un checkpoint de investigación obtenido mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Fue desarrollado por el usuario sandeep123 como parte de un estudio sobre el efecto de un bonus de entropía en la pérdida de política durante el entrenamiento RL. El objetivo es mejorar el razonamiento matemático y la respuesta a preguntas de opción múltiple en el conjunto de datos ScienceQA, utilizando una recompensa basada en la corrección de la respuesta extraída.

Este modelo concreto es el seleccionado como mejor checkpoint según la métrica pass@6 en validación (rango 1 de su brazo experimental), con un coeficiente de entropía de 0.001 aplicado a los tokens de respuesta. Su relevancia radica en que documenta un punto intermedio del entrenamiento donde la diversidad de respuestas (pass@6) es óptima, en contraste con el checkpoint de mejor precisión individual (pass@1) que suele aparecer en pasos posteriores. Es un modelo de investigación, no un producto final, y requiere que se le aplique el prompt sin plantilla de chat para evitar una degradación medible del rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1536 tokens (512 de prompt + 1024 de respuesta) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors, probablemente bf16) |
| Idiomas soportados | no disponible (hereda del base, pero no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-Math-1.5B`, un transformer decoder denso de 1.500 millones de parámetros con atención causal estándar y tokenización de Qwen2.5. Sobre esta base se aplicó un entrenamiento de RL con GRPO, implementado en el framework verl, durante 25 épocas (1250 pasos) sobre el dataset ScienceQA (versión `scienceqa_boxfix`). La política se optimiza con una pérdida que incluye un término de bonus de entropía: `-entropy_coeff * H`, con `entropy_coeff=0.001`, aplicado exclusivamente a los tokens de respuesta. La recompensa combina una señal de formato (0.03 constante) y una recompensa por corrección basada en la extracción de la respuesta final entre `\boxed{}` o el último token A-E. Se usó KL en recompensa de 0.01, tasa de aprendizaje constante de 1e-6, 128 prompts por lote con K=6 rollouts, y temperatura de rollout 1.0. El checkpoint corresponde al paso 200, seleccionado por su mejor pass@6 en validación.

Una característica crítica es que el modelo fue entrenado con texto de prompt crudo, sin plantilla de chat (`apply_chat_template=False` en verl). Aplicar la plantilla de chat de Qwen2.5 en inferencia produce una discrepancia train/eval que, según la model card, equivale a una pérdida de aproximadamente 19 puntos de pass@1 en una tarea hermana.

## Capacidades

- Razonamiento matemático básico: resolución de problemas de opción múltiple con justificación en formato `\boxed{}`.
- Generación de respuestas multi-turno (hasta 1024 tokens) a partir de prompts de hasta 512 tokens.
- Decodificación con muestreo (temperature=1.0) que permite obtener hasta K=6 respuestas diferentes para un mismo prompt (pass@6).
- No soporta tool calling, ni uso de agentes, ni visión, ni audio.
- Capacidad multilingüe no confirmada; el entrenamiento se realizó sobre ScienceQA, que está principalmente en inglés.

## Casos de uso

- Investigación en RL para razonamiento: sirve como punto de comparación para estudiar cómo el bonus de entropía afecta a la diversidad de respuestas frente a la precisión individual. Se puede evaluar con el mismo protocolo de validación (256 prompts, K=6, temperatura 1.0, seed 42).
- Análisis de trade-off entre pass@1 y pass@6: este checkpoint permite reproducir experimentos donde la diversidad (pass@6) es máxima en pasos tempranos, mientras que la precisión individual mejora en pasos posteriores.
- Baseline para técnicas de regularización en RL: al ser un modelo pequeño y con configuración documentada, es útil para comparar nuevas variantes de GRPO (p. ej., distintos coeficientes de entropía, clipping, o recompensas).
- Evaluación de extracción de respuestas: el protocolo pre-registrado de extracción (contenido de `\boxed{}` o último token A-E) puede reutilizarse para medir la calidad de modelos de razonamiento en tareas de opción múltiple.
- Pruebas de inferencia con vLLM: el ejemplo de la model card muestra cómo cargar el modelo en bf16 con `max_model_len=1536` y generar con `SamplingParams(n=6, temperature=1.0)`, útil para validar pipelines de RL.
- Estudio de discrepancia chat/no-chat: permite cuantificar el impacto de aplicar plantillas de chat en modelos entrenados con texto crudo, un problema frecuente en despliegues reales.

## Benchmarks y rendimiento

La model card reporta métricas de validación en un conjunto de 256 prompts retenidos de ScienceQA, con K=6 rollouts, temperatura 1.0 y seed 42. No se han publicado comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| pass@1 (validación) | 0.2207 |
| pass@6 (validación) | 0.4219 |
| Paso de entrenamiento | 200 |

No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. El rendimiento es específico de ScienceQA y no generalizable sin evaluación adicional.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~4 GB para los pesos (1.78B × 2 bytes) más overhead de activaciones y KV cache, aproximadamente 6-8 GB con contexto de 1536 tokens y batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, A10, L4). Para generación con K=6 rollouts simultáneos, se necesitan ~12-16 GB (RTX 3090, A100 40GB).
- Cabe en GPUs de consumo (gama media-alta) sin cuantización adicional; con cuantización a 8 bits o 4 bits (si se generan versiones GGUF/AWQ) podría ejecutarse en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM (recomendado en la model card), llama.cpp (si se convierte a GGUF), Hugging Face Transformers con `torch.bfloat16`, o TGI.
- Latencia y throughput estimados: en una RTX 4090, generación de ~100 tokens por segundo para este tamaño; no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos comparables en las mismas condiciones (ScienceQA, protocolo de validación idéntico). Los checkpoints hermanos publicados por el mismo autor (`sandeep123/sqa-grpo-entropy-step200`, `sandeep123/math-grpo-entropy-step1100`) podrían servir como referencia, pero no se han publicado sus métricas en la información disponible. Frente al modelo base `Qwen2.5-Math-1.5B`, este checkpoint añade el entrenamiento RL, pero no se han reportado resultados comparativos.

## Limitaciones y advertencias

- Entrenado exclusivamente en ScienceQA; su capacidad de generalización a otras tareas de razonamiento es desconocida y probablemente limitada.
- No debe aplicarse plantilla de chat en inferencia; hacerlo degrada el rendimiento en ~19 puntos de pass@1.
- El modelo produce respuestas en formato libre; la extracción de la respuesta correcta depende del protocolo pre-registrado (contenido de `\boxed{}` o último token A-E). Respuestas sin formato extraíble se puntúan como incorrectas.
- Riesgo de alucinación y de razonamiento incorrecto, especialmente ante prompts fuera de la distribución de entrenamiento.
- Es un checkpoint intermedio (paso 200 de 1250) seleccionado por diversidad, no por precisión individual; para tareas que requieren exactitud, otros checkpoints posteriores pueden ser mejores.
- No se especifican idiomas; el dataset ScienceQA es mayoritariamente inglés, por lo que el comportamiento en otros idiomas no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Math, cuyos términos de uso deben respetarse.
- No se proporcionan pesos cuantizados; solo safetensors en su formato original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/aops-grpo-entropy-step200
- Checkpoint hermano (ScienceQA): https://huggingface.co/sandeep123/sqa-grpo-entropy-step200
- Checkpoint hermano (Math): https://huggingface.co/sandeep123/math-grpo-entropy-step1100
- Documentación de GRPO en verl: https://verl.readthedocs.io/en/latest/algo/grpo.html
