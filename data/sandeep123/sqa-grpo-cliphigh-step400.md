# sandeep123/sqa-grpo-cliphigh-step400

## Resumen

`sandeep123/sqa-grpo-cliphigh-step400` es un checkpoint experimental de 1,78B parámetros obtenido al aplicar GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen2.5-Math-1.5B, con una variante de clipping superior elevado (Clip-Higher) inspirada en DAPO. Lo desarrolla sandeep123 (Kumar) como artefacto de investigación para estudiar el efecto de los límites de clip en el entrenamiento por refuerzo sobre el dataset ScienceQA. El checkpoint se seleccionó por ser el mejor en validación con pass@6 (rank 2) dentro de su rama de experimentos.

El modelo responde preguntas de ciencias de opción múltiple (A-E) generando razonamiento en texto plano y encerrando la respuesta final en `\boxed{}`. Se entrenó sin plantilla de chat sobre el texto crudo del prompt, por lo que aplicarle el chat template de Qwen2.5-Math en inferencia introduce una discrepancia entrenamiento-evaluación de aproximadamente 19 puntos de pass@1. Se distribuye bajo licencia Apache 2.0 y el repositorio contiene pesos en formato safetensors con un tamaño total de 7,1 GB.

Es relevante como referencia para investigaciones de RLHF: documenta una intervención aislada (elevar solo el límite superior de clip en GRPO) y publica simultáneamente checkpoints optimizados por calidad y por diversidad, lo que permite análisis de selección de checkpoint en pipelines de entrenamiento por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1536 tokens max en entrenamiento (512 prompt + 1024 response); el base Qwen2.5-Math-1.5B soporta 32K tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors; 7,1 GB sugiere pesos fp32) |
| Idiomas soportados | no disponible (entrenado sobre ScienceQA, contenido en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del base Qwen2.5-Math-1.5B: un transformer decoder-only estándar con atención completa, sin mezcla de expertos ni mecanismos de estado. El entrenamiento de refuerzo usa GRPO implementado sobre el framework verl, con el dataset ScienceQA en su variante `scienceqa_boxfix`. La configuración es: 25 épocas (1250 pasos), 128 prompts por batch con K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL in-reward de 0,01 y recompensa de formato de 0,03 sin decaimiento. La intervención específica de esta rama es el Clip-Higher: se elevó el límite superior de clip a 1+0,28 (límite inferior 1-0,2) siguiendo los bounds desacoplados de DAPO, manteniendo entropy_coeff=0,0 y temperatura de rollout 1,0. El autor advierte explícitamente que esto no es DAPO completo, sino una de sus cuatro componentes aislada. Se entrenó sobre texto plano sin plantilla de chat (`apply_chat_template=False` en verl), y la extracción de respuesta está pre-registrada: se toma el contenido del último `\boxed{}` o, en su ausencia, el último token A-E independiente; las respuestas sin respuesta extraíble se puntúan como incorrectas y todos los rollouts permanecen en el denominador.

## Capacidades

- Respuesta a preguntas de ciencias de opción múltiple (ScienceQA) con razonamiento explícito en formato `\boxed{}`.
- Razonamiento matemático heredado del base Qwen2.5-Math-1.5B.
- Soporte de decodificación por muestreo con K rollouts (pass@6), pensado para evaluar con temperatura 1,0.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso más allá del texto generado.
- No tiene capacidades de visión ni audio.
- No requiere ni admite plantilla de chat: debe usarse el texto crudo del prompt.

## Casos de uso

- Investigación en RLHF/GRPO: sirve como referencia para comparar el efecto de elevar solo el límite superior de clipping frente a otras intervenciones (Clip-Lower, entropía, etc.) en el rendimiento de razonamiento.
- Estudios de ablation de DAPO: al ser una de las cuatro componentes de DAPO aislada, permite medir su contribución individual sobre ScienceQA.
- Evaluación de estrategias de selección de checkpoint: el autor publica checkpoints óptimos por pass@1 (cerca del paso 1000-1200) y por pass@6 (paso 200-500), permitiendo estudiar cómo la métrica de selección afecta a la diversidad y calidad del modelo final.
- Benchmarking de pipelines de RLHF: el protocolo de extracción de respuestas pre-registrado y la semilla fijada (seed 42) permiten reproducir exactamente la evaluación en ScienceQA.
- Análisis de robustez al decodificado: con K=6, temperatura 1,0 y top_p=1,0, es útil para estudiar la relación entre diversidad de muestreo y precisión.
- Comparación de frameworks de entrenamiento: al estar entrenado con verl y ser desplegable con vLLM, sirve para validar compatibilidad entre pipelines de RL y motores de inferencia.

## Benchmarks y rendimiento

Resultados de validación reportados por el autor para este checkpoint (paso 400), sobre 256 prompts de validación, K=6, temperatura 1,0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 (ScienceQA, respuesta muestreada) | 0.7630 |
| pass@6 (ScienceQA) | 0.9805 |

No se han publicado resultados en otros benchmarks (MMLU, GSM8K, HumanEval) en la informacion disponible. La discrepancia por aplicar chat template en inferencia se estima en ~19 puntos de pass@1 en una tarea hermana.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~3,5 GB (pesos del modelo) más overhead de KV cache; con contexto de 1536 tokens cabe en tarjetas de 8 GB.
- El repositorio en safetensors ocupa 7,1 GB (probablemente fp32), por lo que se recomienda descargar y convertir a bf16 o cuantizar antes de desplegar.
- GPU recomendadas: cualquier GPU consumer con 8-12 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento o fine-tuning adicional se necesitaría una GPU con mayor memoria o varias (A100 40/80 GB para reproducir el pipeline de verl).
- Despliegue: compatible con vLLM (el autor proporciona ejemplo con `LLM` y `SamplingParams`), llama.cpp, Ollama y Hugging Face transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de entrenamiento | Dataset | pass@1 |
|---|---|---|---|---|---|
| sandeep123/sqa-grpo-cliphigh-step400 | 1,78B | 1536 tokens (entrenamiento) | GRPO + Clip-Higher (DAPO parcial) | ScienceQA | 0.7630 |
| polaris-73/ds1p5b_grpo_math_gsm8k_cliphigh-global_step_400 | ~2B | no disponible | GRPO + Clip-Higher | GSM8K | no disponible |
| Qwen2.5-Math-1.5B (base) | 1,78B | 32K tokens | no RLHF | - | no disponible |

La comparación directa con el base Qwen2.5-Math-1.5B no está publicada en la informacion disponible; el autor no reporta el rendimiento del base sin entrenamiento de refuerzo sobre ScienceQA.

## Limitaciones y advertencias

- No se debe aplicar el chat template de Qwen2.5-Math en inferencia: el modelo fue entrenado sobre texto plano y aplicar la plantilla causa una pérdida medida de ~19 puntos de pass@1 en una tarea hermana.
- El modelo solo se ha entrenado y validado en ScienceQA (preguntas de ciencias de opción múltiple); su generalización a otras tareas de razonamiento o idiomas no está demostrada.
- La extracción de respuestas depende del formato `\boxed{}`; respuestas sin este formato se puntúan incorrectas, lo que penaliza estilos de salida alternativos.
- Es un modelo de 1,5B, con capacidad de razonamiento limitada en comparación con modelos de 7B o mayores.
- Artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de despliegue en producción ni mantenimiento activo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Math-1.5B, que tiene sus propios términos de uso; conviene revisar la licencia del base para uso comercial.
- El checkpoint seleccionado por pass@6 (paso 400) no es el óptimo por pass@1; quien busque máxima precisión individual debería usar el checkpoint de paso 1000-1200 si está publicado en el mismo repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step400
- Perfil del autor en Hugging Face: https://huggingface.co/sandeep123
- Modelo comparable (GRPO + Clip-High sobre GSM8K): https://huggingface.co/models?search=GS-CLIP
- Framework de entrenamiento GRPO (referencia, no usado directamente): https://github.com/policy-gradient/GRPO-Zero
