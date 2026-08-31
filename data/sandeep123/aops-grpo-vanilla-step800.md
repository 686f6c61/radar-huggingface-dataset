# sandeep123/aops-grpo-vanilla-step800

## Resumen

El modelo `sandeep123/aops-grpo-vanilla-step800` es un checkpoint de razonamiento matemático obtenido mediante entrenamiento con GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen2.5-Math-1.5B. Ha sido desarrollado por el usuario sandeep123 como parte de un estudio de brazos de entrenamiento por refuerzo, utilizando el framework verl y el dataset ScienceQA (concretamente el subconjunto de problemas de olimpiada AoPS de NuminaMath-1.5). El checkpoint corresponde al paso 800 de entrenamiento y fue seleccionado como el mejor en la métrica pass@6 en validación dentro de su brazo experimental.

El modelo tiene 1.777.088.000 parámetros (aproximadamente 1,78 mil millones) y una licencia Apache 2.0. Su relevancia radica en que documenta de forma explícita las condiciones de entrenamiento (temperatura de rollout, coeficiente de entropía, clipping simétrico) y advierte sobre la necesidad de no aplicar chat template en inferencia, ya que el modelo fue entrenado sobre texto plano. Esto lo convierte en un recurso útil para investigaciones sobre RL aplicado a razonamiento matemático, aunque no está pensado como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Math-1.5B base) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 1536 tokens (máximo usado en validación; el base soporta 4096) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, safetensors) |
| Idiomas soportados | no disponible (entrenado principalmente en inglés, dataset ScienceQA) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-1.5B, un transformer denso con 1.78 mil millones de parámetros, diseñado específicamente para razonamiento matemático. Sobre esta base se aplicó GRPO, un algoritmo de optimización de políticas que elimina la necesidad de un modelo crítico (a diferencia de PPO). El entrenamiento se realizó con el framework verl, usando el dataset `scienceqa_boxfix` (ScienceQA con formato de respuesta en caja). Se entrenó durante 25 épocas (1250 pasos) con un batch de 128 prompts y K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL de 0.01 y una recompensa de formato de 0.03 constante. El brazo específico de este checkpoint usó entropy_coeff=0, clip simétrico de 0.2 y temperatura de rollout 1.0.

Una innovación técnica destacable es la decisión de no aplicar chat template en la inferencia. El modelo fue entrenado sobre texto plano (raw prompt text) con `apply_chat_template=False` en verl. Aplicar el chat template de Qwen2.5-Math en inferencia provoca una discrepancia entre entrenamiento y evaluación que se ha medido en aproximadamente 19 puntos de pass@1 en una tarea hermana. Por tanto, el modelo debe usarse con generación directa de texto sin formato de chat.

## Capacidades

- Razonamiento matemático de nivel de olimpiada: el modelo responde a problemas de opción múltiple del dataset ScienceQA, extrayendo la respuesta final en formato `\boxed{}`.
- Generación de respuestas con justificación: aunque el entrenamiento se centra en la respuesta final, el modelo produce cadenas de razonamiento intermedias.
- Soporte de muestreo múltiple: al usar temperatura 1.0 y K=6 rollouts, el modelo puede generar diversas soluciones para un mismo problema, lo que permite calcular pass@k.
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de este tipo en la documentación.
- Sin capacidades multimodales: el modelo es exclusivamente de texto.
- Multilingüismo limitado: no se especifican idiomas, pero el dataset ScienceQA es predominantemente inglés.

## Casos de uso

- Investigación en RL para razonamiento matemático: sirve como baseline para comparar variantes de GRPO (temperatura, coeficiente de entropía, clipping) en tareas de opción múltiple. Los investigadores pueden reproducir el entrenamiento y evaluar el efecto de cada hiperparámetro.
- Evaluación de estrategias de extracción de respuestas: el modelo permite probar métodos para parsear respuestas en `\boxed{}` o tokens A-E, dado que la extracción es una parte crítica de la métrica.
- Benchmarking de decodificación con múltiples muestras: al generar K=6 respuestas con temperatura alta, se puede estudiar la relación entre diversidad de muestras y accuracy pass@k.
- Estudio de discrepancia train/eval por chat template: el modelo es un caso práctico para medir el impacto de aplicar plantillas de chat en modelos entrenados con texto plano.
- Generación de datos sintéticos de razonamiento: aunque no es su propósito principal, puede usarse para producir soluciones a problemas matemáticos, siempre que se valide la calidad.
- Base para fine-tuning posterior: al ser un checkpoint intermedio de RL, puede servir como punto de partida para experimentos de continuación de entrenamiento con otros algoritmos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| pass@1 (validación) | 0.2305 |
| pass@6 (validación) | 0.4336 |
| Paso de entrenamiento | 800 |

Las métricas se obtuvieron sobre 256 prompts de validación de ScienceQA, con K=6 rollouts, temperatura 1.0 y semilla 42. La extracción de respuesta se define como el contenido del último `\boxed{}` o, en su defecto, el último token A-E. Las respuestas sin respuesta extraíble se puntúan como incorrectas. No se han publicado resultados en benchmarks externos como MMLU o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 3,5 GB (1.78B parámetros × 2 bytes). Con overhead de activaciones y caché KV, se recomienda al menos 6 GB de VRAM para una inferencia cómoda con contexto de 1536 tokens.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Cuantización: aunque no se proporcionan pesos cuantizados, al ser un modelo Qwen2.5-Math es compatible con herramientas de cuantización como llama.cpp (GGUF) o bitsandbytes. Una cuantización 4-bit reduciría la huella a aproximadamente 1 GB, permitiendo ejecución en GPUs de 4 GB.
- Opciones de despliegue: vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama (si se convierte a GGUF), TGI. El modelo está en formato safetensors, por lo que es directamente cargable con transformers.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 1.78B en una GPU moderna, se espera una generación de decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Métrica (pass@1) | Licencia |
|---|---|---|---|---|---|
| aops-grpo-vanilla-step800 (este) | 1.78B | 1536 (usado) | GRPO sobre Qwen2.5-Math-1.5B | 0.2305 (ScienceQA validación) | Apache 2.0 |
| Qwen2.5-Math-1.5B (base) | 1.78B | 4096 | Pre-entrenamiento + SFT matemático | no disponible | Apache 2.0 |
| sandeep123/sqa-grpo-vanilla-step600 | 1.78B | no disponible | GRPO sobre ScienceQA (otro brazo) | no disponible | Apache 2.0 |
| sandeep123/sqa-grpo-temp12-step800 | 1.78B | no disponible | GRPO con temperatura 1.2 | no disponible | Apache 2.0 |

Nota: los otros checkpoints del mismo autor no tienen métricas publicadas en la información disponible. No se han encontrado comparaciones con modelos de tamaño similar en benchmarks estandarizados.

## Limitaciones y advertencias

- No aplicar chat template: es obligatorio usar el modelo con texto plano. Aplicar el template de Qwen2.5-Math degrada el rendimiento en aproximadamente 19 puntos de pass@1 en tareas similares.
- Sesgo de entrenamiento: el modelo está entrenado exclusivamente en problemas de opción múltiple de ScienceQA, lo que limita su capacidad para generar respuestas abiertas o explicaciones detalladas fuera de ese formato.
- Riesgo de alucinación en razonamiento: como todo modelo de lenguaje, puede producir razonamientos plausibles pero incorrectos, especialmente en problemas no vistos.
- Extracción de respuestas estricta: si no hay `\boxed{}` o token A-E final, la respuesta se considera incorrecta. Esto puede penalizar formatos alternativos válidos.
- No es un modelo de propósito general: no soporta tool calling, ni tareas de código o conversación. Su uso fuera del dominio matemático no está recomendado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Math también está bajo Apache 2.0, sin restricciones adicionales conocidas.
- No se proporcionan datos sobre sesgos demográficos o lingüísticos; el dataset ScienceQA es predominantemente inglés y puede reflejar sesgos de ese corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/aops-grpo-vanilla-step800
- Checkpoint relacionado (sqa-grpo-vanilla-step600): https://huggingface.co/sandeep123/sqa-grpo-vanilla-step600
- Checkpoint relacionado (sqa-grpo-temp12-step800): https://huggingface.co/sandeep123/sqa-grpo-temp12-step800
- Documentación de GRPO en verl: https://verl.readthedocs.io/en/latest/algo/grpo.html
- Paper de DeepSeekMath (contexto de RL matemático): https://arxiv.org/abs/2402.03300
- Repositorio de referencia Vanilla_GRPO: https://github.com/CinderellaQAQ/Vanilla_GRPO/blob/main/README.md
