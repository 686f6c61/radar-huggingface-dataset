# sandeep123/aops-dqo-a1-step1200

## Resumen

El modelo `sandeep123/aops-dqo-a1-step1200` es un checkpoint de razonamiento matemático entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO, partiendo del modelo base `Qwen/Qwen2.5-Math-1.5B`. Lo desarrolla el autor sandeep123 como parte de una serie de experimentos sobre la técnica DQO (Diversity-Quantified Optimization), que introduce un término de diversidad basado en el determinante logarítmico de la matriz de Gram (alpha=1.0). Está especializado en el conjunto de datos ScienceQA, donde responde preguntas de opción múltiple con razonamiento paso a paso.

Este modelo es relevante porque sirve como baseline de referencia para evaluar el impacto de la diversidad en el entrenamiento con RL. Se seleccionó como el mejor checkpoint en validación pass@1 (paso 1200) dentro de su rama experimental. Cuenta con 1.777 millones de parámetros, una ventana de contexto máxima de 1536 tokens (512 de prompt + 1024 de respuesta) y está publicado bajo licencia Apache 2.0. Es importante destacar que no se debe aplicar plantilla de chat (chat template) durante la inferencia, ya que fue entrenado con texto plano, y hacerlo degrada el rendimiento en aproximadamente 19 puntos de pass@1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1536 tokens (512 prompt + 1024 respuesta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, dado el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-Math-1.5B, un transformer decoder estándar con atención causal. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) usando el framework verl, sobre el dataset ScienceQA (`scienceqa_boxfix`). La configuración incluye 25 épocas (1250 pasos), batch de 128 prompts con K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL de 0.01 (incluido en la recompensa) y una recompensa de formato de 0.03 constante. El entrenamiento utilizó temperatura de rollout 1.0, y el término DQO con alpha=1.0 emplea un estimador leave-one-out para el logdet de la matriz de Gram, usando como embedding los estados ocultos de la política de referencia (en lugar del codificador de oraciones preentrenado del paper original). No se aplicó plantilla de chat durante el entrenamiento (`apply_chat_template=False` en verl).

## Capacidades

- Razonamiento matemático paso a paso: genera cadenas de razonamiento para resolver problemas de opción múltiple.
- Respuesta a preguntas de ScienceQA: extrae la respuesta final de un `\boxed{}` o, en su defecto, del último token A-E.
- Soporte de decodificación con muestreo múltiple: la métrica pass@6 indica que puede generar varias soluciones válidas para un mismo prompt.
- No soporta tool calling, ni visión, ni audio.
- No tiene capacidades multilingües documentadas; se limita al dominio matemático en inglés.
- No incluye modo "thinking" explícito más allá del razonamiento generado como texto.

## Casos de uso

- Evaluación de algoritmos de RL con diversidad: sirve como baseline para comparar el impacto del término DQO frente a variantes sin él o con otros hiperparámetros.
- Investigación en aprendizaje por refuerzo para razonamiento: permite estudiar cómo la diversidad de rollouts afecta a la precisión final en tareas de opción múltiple.
- Benchmark de extracción de respuestas: su protocolo pre-registrado (extracción de `\boxed{}` y puntuación estricta) puede reutilizarse en otros experimentos.
- Validación de pipelines de entrenamiento con verl: útil para verificar configuraciones de GRPO, recompensas de formato y selección de checkpoints.
- Análisis de degradación por chat template: demuestra la importancia de mantener coherencia entre entrenamiento e inferencia en modelos de RL.
- Reproducción de experimentos de diversidad en RL: al estar publicado el checkpoint y la configuración exacta, permite replicar resultados y comparar con otros modelos de la misma serie.

## Benchmarks y rendimiento

El modelo reporta métricas de validación sobre 256 prompts held-out con K=6, temperatura 1.0 y semilla 42. Los resultados del checkpoint seleccionado (paso 1200) son:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2227 |
| pass@6 | 0.4102 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor menciona que el mejor checkpoint para pass@6 se encuentra en pasos 200-500, mientras que el mejor para pass@1 está en pasos 1000-1200, pero no proporciona métricas de esos otros checkpoints.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1.777 millones de parámetros. En bfloat16 (formato usado en el ejemplo de inferencia), ocupa aproximadamente 3.5 GB de pesos, por lo que cabe en GPUs consumer con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060).
- GPU recomendadas: cualquier GPU moderna con soporte bfloat16 o fp16. Una RTX 4090 o A10G ofrece margen para batch de inferencia múltiple (K=6) sin problemas.
- Opciones de despliegue: vLLM (como en el ejemplo de la model card), llama.cpp para CPU/GPU, Ollama si se convierte a GGUF, o TGI.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1.5B, se espera una latencia de decodificación de decenas de tokens por segundo en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

El autor publica otros checkpoints de la misma serie experimental, aunque no se proporcionan métricas detalladas de ellos en la información disponible. Se pueden considerar como alternativas:

| Modelo | Base | Objetivo | Diferencia clave |
|---|---|---|---|
| sandeep123/aops-dqo-a1-step1200 | Qwen2.5-Math-1.5B | DQO alpha=1.0 | Este checkpoint |
| sandeep123/sqa-grpo-vanilla-step1200 | Qwen2.5-Math-1.5B | GRPO sin DQO | Variante vanilla (sin diversidad) |
| sandeep123/sqa-dqo-a1-step1000 | Qwen2.5-Math-1.5B | DQO alpha=1.0 | Checkpoint en paso 1000 (otro punto de selección) |

No se dispone de comparativas con modelos externos como Qwen2.5-Math-1.5B original o modelos similares de razonamiento matemático en el contexto de RL.

## Limitaciones y advertencias

- No se debe aplicar chat template: la model card advierte explícitamente que hacerlo provoca una caída de ~19 puntos de pass@1 en tareas hermanas.
- El modelo está entrenado exclusivamente para el formato de ScienceQA; su rendimiento en otros dominios matemáticos o de razonamiento general no está validado.
- La extracción de respuestas es estricta: si no hay `\boxed{}` o token A-E final, la respuesta se considera incorrecta, lo que puede penalizar respuestas válidas pero mal formateadas.
- Riesgo de alucinación en razonamientos largos: como todo modelo de lenguaje, puede generar pasos intermedios plausibles pero incorrectos.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un dataset de opción múltiple en inglés, puede tener limitaciones en otros idiomas o formatos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no se recomienda para producción sin evaluación adicional.
- El entrenamiento usó temperatura 1.0 y muestreo estocástico; la inferencia determinista puede no reflejar el rendimiento reportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/aops-dqo-a1-step1200
- Modelo vanilla (misma serie): https://huggingface.co/sandeep123/sqa-grpo-vanilla-step1200
- Modelo DQO paso 1000: https://huggingface.co/sandeep123/sqa-dqo-a1-step1000
- Perfil de GitHub del autor: https://github.com/sandeep123-ai
- Perfil alternativo de GitHub: https://github.com/Sandeep123-lab-ai
