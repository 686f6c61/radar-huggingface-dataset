# sandeep123/aops-grpo-temp12-step600

## Resumen

El modelo `sandeep123/aops-grpo-temp12-step600` es un checkpoint de razonamiento matemático y científico entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Desarrollado por sandeep123, forma parte de un estudio sistemático sobre el efecto de la temperatura de muestreo durante el entrenamiento con RL en tareas de razonamiento. Este checkpoint concreto corresponde al paso 600 de un entrenamiento de 1250 pasos sobre el dataset ScienceQA, y fue seleccionado por obtener el mejor pass@6 dentro de su rama experimental (temperatura de rollout 1.2).

El modelo tiene 1.777.088.000 parámetros (1,78B) y está liberado bajo licencia Apache 2.0. Su relevancia radica en que sirve como baseline reproducible para investigar cómo la temperatura de rollout influye en la calidad y diversidad de las soluciones generadas por modelos pequeños de razonamiento, un aspecto poco explorado en la literatura de RL para LLMs. La arquitectura es un transformer decoder estándar basado en Qwen2.5, sin capas MoE, y el contexto máximo no está especificado en la documentación, aunque en el ejemplo de inferencia se usa una longitud máxima de 1536 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-Math-1.5B mediante GRPO, un algoritmo de optimización de política de grupo popularizado para entrenar modelos de razonamiento. El entrenamiento se realizó con el framework verl sobre el dataset ScienceQA (versión `scienceqa_boxfix`), que contiene preguntas de ciencias de opción múltiple. La configuración incluye 128 prompts por batch con K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL de 0.01 y una recompensa de formato fija de 0.03. La temperatura de rollout se fijó en 1.2 (frente a 1.0 de otras ramas), y se aplicó una recompensa extra para respuestas con formato correcto. No se utilizó chat template; el modelo se entrena y evalúa con texto plano.

Una característica destacable es que el checkpoint fue seleccionado por su pass@6 (0.4180) en validación, no por pass@1 (0.2298), lo que refleja un trade-off entre calidad de la mejor respuesta y diversidad de soluciones. El autor advierte que aplicar el chat template de Qwen2.5-Math en inferencia provoca una caída de aproximadamente 19 puntos en pass@1 debido a un desajuste entre entrenamiento y evaluación.

## Capacidades

- Razonamiento matemático y científico: responde preguntas de opción múltiple del dominio de ciencias, con extracción de respuesta mediante `\boxed{}`.
- Generación de respuestas con formato estructurado: el modelo aprende a encerrar la respuesta final en una caja LaTeX.
- Soporte para muestreo múltiple (pass@k): diseñado para ser evaluado con K rollouts, lo que permite medir la diversidad de soluciones.
- Entrenamiento específico para ScienceQA: no generaliza a otras tareas sin fine-tuning adicional.
- No soporta tool calling, ni agentes, ni modos de razonamiento especiales más allá del contexto de la pregunta.
- Idiomas: no se especifica, pero el dataset ScienceQA está en inglés, por lo que se asume que el modelo opera principalmente en inglés.

## Casos de uso

- Investigación en RL para razonamiento: permite estudiar el efecto de la temperatura de muestreo en el entrenamiento con GRPO, comparando con otros checkpoints de la misma familia (por ejemplo, `aops-grpo-vanilla-step600`).
- Benchmarking de métodos de extracción de respuestas: al tener respuestas en formato `\boxed{}`, es útil para evaluar pipelines de parsing y validación de respuestas.
- Prototipado de sistemas de respuesta a preguntas científicas: puede integrarse en un sistema de QA de opción múltiple para dominios educativos, aunque con precisión limitada.
- Desarrollo de técnicas de muestreo y decodificación: su pequeño tamaño permite experimentar con diferentes estrategias de muestreo (temperatura, top-p, etc.) sin requerir hardware costoso.
- Evaluación de métricas pass@k: sirve como caso de estudio para comparar la relación entre pass@1 y pass@6 en modelos entrenados con RL.
- Entrenamiento de modelos de razonamiento con presupuesto limitado: al ser un modelo de 1.78B, es accesible para laboratorios con recursos moderados que quieran reproducir experimentos de RL.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los de validación del propio autor, sobre 256 prompts held-out de ScienceQA, con K=6 rollouts a temperatura 1.0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2298 |
| pass@6 | 0.4180 |

No se han publicado resultados en otros benchmarks (MMLU, GSM8K, etc.) en la información disponible. El autor indica que el mejor pass@1 se encuentra en un checkpoint posterior (paso 1000-1200), mientras que el mejor pass@6 está en pasos anteriores (200-500), por lo que este checkpoint no representa el óptimo en ninguna de las dos métricas, sino un punto intermedio seleccionado por su equilibrio.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los pesos ocupan aproximadamente 3,55 GB (1.777.088.000 × 2 bytes). Con memoria adicional para KV cache y overhead de inferencia, se recomienda al menos 6-8 GB de VRAM.
- GPU recomendadas: tarjetas consumer con 8 GB o más, como NVIDIA RTX 3060, RTX 3070, RTX 4060, o superiores (RTX 4090). También puede ejecutarse en GPUs de datacenter como A10, A100, etc.
- Inferencia en CPU: posible con llama.cpp u otras herramientas de cuantización, aunque con latencia mayor.
- Opciones de despliegue: vLLM (como se muestra en el ejemplo del autor), llama.cpp, Ollama (si se convierte a GGUF), o Transformers con carga en bfloat16.
- Latencia y throughput: no se proporcionan datos, pero para un modelo de 1.78B en una GPU moderna se espera una latencia de decodificación de decenas de ms por token y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El autor menciona un modelo hermano `sandeep123/aops-grpo-vanilla-step600` (temperatura de rollout 1.0), pero no publica métricas comparativas. Se puede comparar conceptualmente con el modelo base Qwen2.5-Math-1.5B, que tiene la misma arquitectura y tamaño, pero sin entrenamiento RL. Sin embargo, no se aportan cifras de rendimiento de ese modelo base en ScienceQA. Por tanto, la comparativa queda limitada a la información disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no el mejor en pass@1 ni en pass@6 según el propio autor.
- No se debe aplicar el chat template de Qwen2.5-Math: hacerlo provoca una caída de aproximadamente 19 puntos en pass@1 por desajuste entre entrenamiento y evaluación.
- El modelo está entrenado exclusivamente en ScienceQA, por lo que su capacidad de razonamiento general es limitada y puede no transferirse a otras tareas.
- Riesgo de alucinación: como todo LLM, puede generar respuestas plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- No se han documentado sesgos específicos, pero al estar entrenado en un dataset de ciencias en inglés, puede tener sesgos culturales o lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para producción y carece de garantías.
- No se especifican los idiomas soportados; se asume inglés por el dataset.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sandeep123/aops-grpo-temp12-step600)
- [Modelo hermano: aops-grpo-vanilla-step600](https://huggingface.co/sandeep123/aops-grpo-vanilla-step600)
