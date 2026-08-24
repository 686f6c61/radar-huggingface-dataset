# sandeep123/sqa-grpo-entropy-step1100

## Resumen

`sandeep123/sqa-grpo-entropy-step1100` es un modelo de razonamiento científico entrenado mediante *Group Relative Policy Optimization* (GRPO) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Lo desarrolla `sandeep123` como un baseline experimental para estudiar el efecto de un **bonus de entropía** en la pérdida de política durante el entrenamiento con aprendizaje por refuerzo. El modelo se especializa en el dataset ScienceQA y está diseñado para responder preguntas de opción múltiple con razonamiento explícito.

La relevancia de este modelo radica en su uso como referencia para investigar cómo la entropía controla la exploración en RL para LLMs. El autor publica el checkpoint seleccionado por mejor `pass@1` en validación (step 1100) y advierte explícitamente que **no debe aplicarse plantilla de chat** en inferencia, ya que el entrenamiento se realizó sobre texto plano. Con 1.78 mil millones de parámetros, es un modelo compacto adecuado para experimentos de investigación en hardware moderado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa max_model_len=1536, pero el modelo base soporta 32K) |
| Tipos de cuantizacion | No especificados; el checkpoint se publica en bfloat16 |
| Idiomas soportados | No disponibles (el dataset ScienceQA es en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un **decoder-only transformer** basado en `Qwen2.5-Math-1.5B`. Se entrenó con **GRPO** sobre el dataset `scienceqa_boxfix` (ScienceQA), con un **bonus de entropía** añadido a la pérdida de política: `-entropy_coeff * H` con `entropy_coeff = 1e-3`, aplicado solo a los tokens de respuesta. El entrenamiento duró 25 épocas (1250 pasos) con 128 prompts por lote y 6 rollouts por prompt (`K=6`), una tasa de aprendizaje constante de `1e-6`, un coeficiente KL de 0.01 y una recompensa de formato de 0.03 sin decaimiento.

El autor advierte que valores mayores de `entropy_coeff` (como `1e-2`) provocan inestabilidad: la entropía alcanzó el 94% de `ln|V|` y colapsó la política. El entrenamiento se realizó con **texto plano sin chat template** (`apply_chat_template=False` en `RLHFDataset`), y aplicar el chat template de Qwen2.5-Math en inferencia produce una pérdida de aproximadamente 19 puntos de `pass@1` en una tarea hermana.

## Capacidades

- Razonamiento científico de opción múltiple sobre el dataset ScienceQA (física, química, biología, etc.).
- Extracción de respuestas finales en formato `\boxed{}` (contenido de la última caja), o en su defecto el último token A-E standalone.
- Generación de rollouts múltiples (`K=6`) con temperatura 1.0 y top-p 1.0 para evaluación.
- No soporta tool calling, agentes ni visión; es un modelo de texto puro para razonamiento.
- Capacidad multilingüe: no disponible (el dataset es en inglés).

## Casos de uso

- **Investigación en RL para LLMs**: sirve como baseline para comparar métodos de exploración con entropía controlada, p. ej., contra E-GRPO o SEED-GRPO.
- **Evaluación de políticas de razonamiento**: permite estudiar cómo el bonus de entropía afecta la calidad y diversidad de los rollouts generados.
- **Análisis de estabilidad en RL**: el autor documenta el colapso de la política con `entropy_coeff=1e-2`, útil para entender límites de hiperparámetros.
- **Pruebas de extracción de respuestas**: se puede usar para validar pipelines de parsing de `\boxed{}` en salidas generadas por LLMs.
- **Experimentos de transferencia**: como modelo base para fine-tuning adicional en otras tareas de razonamiento científico.
- **Reproducción de resultados**: al estar publicado con configuraciones detalladas (seed 42, pasos, etc.), permite reproducir el entrenamiento GRPO con entropía.

## Benchmarks y rendimiento

La model card reporta métricas de validación en un conjunto de 256 prompts held-out, con `K=6`, temperatura 1.0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.8496 |
| pass@6 | 0.9453 |
| step | 1100 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU o HumanEval en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para 1.78B parámetros en bfloat16 (~3.5 GB), la inferencia cabe en GPUs consumer de 8 GB o más.
- **GPU recomendadas**: RTX 3090, RTX 4090, A10, A100 (para entrenamiento completo se necesitaría más VRAM, pero la inferencia es ligera).
- **Despliegue**: el ejemplo de la model card usa `vLLM` con `dtype="bfloat16"` y `max_model_len=1536`. También es compatible con `llama.cpp` (si se convierte a GGUF) o `Ollama`.
- **Latencia/throughput**: no especificados; para un modelo de 1.78B en bf16 en una RTX 4090 se puede esperar una generación de decenas de tokens por segundo, pero sin datos oficiales.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. El modelo es un checkpoint experimental de investigación, no un producto final, por lo que no se ofrecen comparaciones con alternativas como `Qwen2.5-Math-1.5B` original o modelos RL de la misma talla.

## Limitaciones y advertencias

- **No usar chat template**: aplicar el chat template de Qwen2.5-Math en inferencia reduce el rendimiento en ~19 puntos de `pass@1`. El modelo se debe usar con texto plano.
- **Sesgo de datos**: entrenado únicamente sobre ScienceQA, lo que limita su generalización a otros dominios o estilos de pregunta.
- **Alucinaciones**: como cualquier LLM, puede generar respuestas plausibles pero incorrectas; el formato `\boxed{}` puede contener texto no válido.
- **Estabilidad de RL**: el bonus de entropía es sensible al coeficiente; valores mayores a `1e-3` pueden colapsar la política (el autor lo verificó con `1e-2`).
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base `Qwen2.5-Math-1.5B` tiene su propia licencia (Apache-2.0 también), por lo que no hay restricciones adicionales conocidas.
- **Contexto**: no se especifica la longitud de contexto máxima del checkpoint; el ejemplo de vLLM usa 1536 tokens, lo que sugiere que se debe limitar la ventana para evitar degradación.

## Enlaces

- [HuggingFace: sandeep123/sqa-grpo-entropy-step1100](https://huggingface.co/sandeep123/sqa-grpo-entropy-step1100)
- [Paper: E-GRPO: High Entropy Steps Drive Effective Reinforcement Learning (arXiv)](https://arxiv.org/abs/2601.00423)
- [Documentación de GRPO Trainer (Hugging Face TRL)](https://huggingface.co/docs/trl/grpo_trainer)
- [Repositorio SEED-GRPO (GitHub)](https://github.com/Dreamer312/SEED-GRPO)
