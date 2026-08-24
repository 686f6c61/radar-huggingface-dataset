# sandeep123/sqa-grpo-entropy-step200

## Resumen

El modelo `sandeep123/sqa-grpo-entropy-step200` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen2.5-Math-1.5B, desarrollado por el usuario sandeep123. Se trata de un baseline para el estudio de la regularización por entropía dentro del algoritmo GRPO (Group Relative Policy Optimization), aplicado al conjunto de datos de preguntas de ciencia ScienceQA. El objetivo es evaluar cómo un término de bonificación de entropía en la pérdida de política afecta a la diversidad de las respuestas generadas y al rendimiento en tareas de razonamiento de opción múltiple.

El modelo se entrenó durante 200 pasos (de un total de 1250) con un coeficiente de entropía de 1e-3, y fue seleccionado como el mejor checkpoint en la métrica pass@6 de validación. Presenta un rendimiento de 0.7103 en pass@1 y 0.9805 en pass@6 sobre 256 prompts retenidos. Es relevante para la comunidad de investigación en RL aplicado a LLM, ya que documenta un caso concreto de regularización de entropía y advierte sobre la importancia de no aplicar plantillas de chat en inferencia, debido a un desajuste de entrenamiento de aproximadamente 19 puntos de pass@1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Math-1.5B (base) - no se especifican detalles adicionales |
| Parámetros totales | 1.777.088.000 (1,78B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con máx. 512 prompt + 1024 respuesta) |
| Tipos de cuantización | No disponible (solo safetensors en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-1.5B, un modelo de lenguaje de 1.5B parámetros de la familia Qwen2.5. No se proporcionan detalles sobre la arquitectura interna del modelo base en la información disponible, pero se sabe que es un transformer decoder-only. El entrenamiento se realizó con GRPO, un algoritmo de optimización de política grupal introducido en el paper DeepSeekMath, implementado con el framework verl. La modificación específica es la adición de un término de bonificación de entropía `-entropy_coeff * H` a la pérdida de política, con `entropy_coeff = 1e-3`, enmascarado a los tokens de respuesta. El dataset es ScienceQA, procesado con una variante llamada `scienceqa_boxfix`, con 128 prompts y K=6 rollouts por paso. El entrenamiento duró 1250 pasos en total, con un learning rate constante de 1e-6 y un coeficiente KL de 0.01. Se aplicó una recompensa de formato de 0.03 constante sin decaimiento. El checkpoint publicado corresponde al paso 200, seleccionado por su alto pass@6.

Un aspecto crítico destacado por el autor es que el modelo fue entrenado con texto de prompt sin plantilla de chat (apply_chat_template=False). Aplicar la plantilla de chat de Qwen2.5-Math en inferencia produce un desajuste de entrenamiento-evaluación que degrada el pass@1 en ~19 puntos en tareas similares.

## Capacidades

- Razonamiento sobre preguntas de opción múltiple en el dominio científico (ScienceQA).
- Generación de respuestas en formato `\boxed{}` con la letra de la opción (A-E) como respuesta final.
- Capacidad de producir múltiples respuestas muestreadas (K rollouts) con temperatura 1.0, permitiendo la evaluación de diversidad y pass@k.
- No se mencionan capacidades de tool calling, visión, audio ni razonamiento multilingüe.

## Casos de uso

- Evaluación de regularización de entropía en RL: este checkpoint sirve como referencia para estudiar cómo un bonus de entropía afecta la diversidad de las respuestas y la estabilidad del entrenamiento en GRPO.
- Benchmark de razonamiento en ciencia: puede utilizarse como un baseline para comparar el rendimiento de otros modelos o configuraciones de RL en ScienceQA.
- Estudio de desajuste de plantillas: la advertencia sobre el chat template lo convierte en un caso útil para analizar los efectos de la discrepancia entre el formato de entrenamiento y el de inferencia.
- Análisis de la evolución del rendimiento durante el entrenamiento: al ser un checkpoint intermedio (paso 200), permite estudiar la dinámica de pass@1 y pass@6 en función del paso.
- Prueba de metodología de extracción de respuestas: el modelo se presta para validar técnicas de extracción basadas en `\boxed{}` o en el último token A-E.
- Reproducibilidad en RL: los hiperparámetros completos están documentados, lo que permite reproducir el entrenamiento o comparar con otros brazos del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, salvo las métricas de validación del propio checkpoint:

| Métrica | Valor |
|---|---|
| pass@1 | 0.7103 |
| pass@6 | 0.9805 |
| Paso | 200 |

Estas métricas se obtuvieron sobre 256 prompts retenidos, con K=6, temperatura 1.0 y semilla 42. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

No se han publicado requisitos específicos de hardware en la información proporcionada. Como modelo de 1.78B parámetros, se puede inferir que:

- En bfloat16, los pesos ocupan aproximadamente 3.5 GB, pero el repositorio tiene un tamaño de 7.1 GB (posiblemente incluye archivos adicionales como configuración o pesos en otros formatos).
- Para inferencia en bfloat16, se recomienda una GPU con al menos 8 GB de VRAM para acomodar los pesos y los estados de activación.
- Con cuantización (por ejemplo, 4-bit), la memoria necesaria se reduce a alrededor de 1 GB, lo que permitiría ejecutarse en GPUs consumer de 4-6 GB.
- El modelo puede desplegarse con vLLM, llama.cpp, Ollama o TGI, aunque no se ha documentado compatibilidad específica.
- No se conocen datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. No se pueden establecer comparaciones objetivas sin datos adicionales.

## Limitaciones y advertencias

- El modelo está especializado en ScienceQA y no es un modelo de propósito general.
- El checkpoint corresponde al paso 200, que es el mejor para pass@6 pero no para pass@1 (el mejor pass@1 se encuentra cerca del paso 1000-1200). Si se busca máxima precisión individual, este no es el checkpoint adecuado.
- No aplicar chat template en inferencia: hacerlo produce una degradación de ~19 puntos de pass@1.
- El entrenamiento con un coeficiente de entropía mayor (1e-2) resultó inestable y colapsó la política, lo que limita la aplicabilidad de la regularización con valores altos.
- No se han evaluado sesgos o riesgos de alucinación específicos para este modelo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no se recomienda su uso directo en producción sin validación.

## Enlaces

- [HuggingFace - sandeep123/sqa-grpo-entropy-step200](https://huggingface.co/sandeep123/sqa-grpo-entropy-step200)
- [Hugging Face - Post training an LLM for reasoning with GRPO en TRL](https://huggingface.co/learn/cookbook/fine_tuning_llm_grpo_trl) (referencia general de GRPO)
- [Hugging Face - GRPO Trainer](https://huggingface.co/docs/trl/grpo_trainer) (documentación del método)
- [GitHub - VisualGRPO: E-GRPO](https://github.com/shengjun-zhang/VisualGRPO) (relacionado con entropía en RL, aunque no directamente con este modelo)
