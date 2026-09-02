# logan7000/llm-math345-ttrl-granite2b-full

## Resumen

El modelo `logan7000/llm-math345-ttrl-granite2b-full` es un checkpoint de fine-tuning del modelo base `ibm-granite/granite-3.3-2b-instruct`, desarrollado por el usuario logan7000. El entrenamiento aplica TTRL (Test-Time Reinforcement Learning) con GRPO sobre el conjunto de problemas matemáticos MATH345, utilizando un esquema de majority vote sobre K muestras como pseudo-etiquetas, sin ground truth. El objetivo es mejorar las capacidades de razonamiento matemático del modelo base mediante aprendizaje por refuerzo en tiempo de inferencia.

El repositorio contiene dos checkpoints: `best/` (paso 20, seleccionado por validación) y `endpoint/` (paso 110, último checkpoint antes de la interrupción por límite de tiempo). El entrenamiento se truncó en el paso 110 de 136 debido a un límite de 24 horas de ejecución, sin errores de entrenamiento. El tamaño del repositorio es de 10,1 GB, con pesos en formato safetensors. No se dispone de licencia, idiomas soportados ni pipeline declarados en la ficha de HuggingFace.

Este modelo es relevante para investigadores interesados en técnicas de RL aplicadas a modelos de lenguaje pequeños, especialmente en el dominio matemático, y para quienes buscan alternativas de fine-tuning con pseudo-etiquetas generadas por el propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: granite-3.3-2b-instruct) |
| Parametros totales | no disponible (modelo base: 2B aprox.) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 según repo relacionado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `granite-3.3-2b-instruct`, un modelo de lenguaje de 2 mil millones de parámetros desarrollado por IBM. Sobre esta base se aplica un entrenamiento TTRL (Test-Time Reinforcement Learning) con el algoritmo GRPO (Group Relative Policy Optimization). El proceso consiste en generar K=12 muestras por prompt, aplicar majority vote sobre ellas para obtener una pseudo-etiqueta (sin usar ground truth), y actualizar el modelo con pérdida BnPO (probablemente Binary Policy Optimization) y beta=0. Se usan 128 prompts por actualización, learning rate de 3e-6, y adam_beta2 de 0.95. El entrenamiento se planificó para 136 pasos (1 época), pero se detuvo en el paso 110 por alcanzar el límite de 24 horas de cómputo (~640 segundos por paso). No se reportan detalles sobre la arquitectura interna del modelo base ni sobre la composición del dataset MATH345.

## Capacidades

- Razonamiento matemático: el entrenamiento se centra en problemas de MATH345, por lo que el modelo debería mejorar en tareas de resolución de problemas matemáticos.
- Generación de texto: hereda las capacidades del modelo base granite-3.3-2b-instruct, aunque no se especifican detalles.
- No se dispone de información sobre tool calling, agentes, capacidades multilingües o modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en RL para LLMs: el modelo sirve como caso de estudio para evaluar la efectividad de TTRL con pseudo-etiquetas en dominios específicos como matemáticas.
- Fine-tuning experimental: puede usarse como punto de partida para experimentos adicionales con otros datasets o configuraciones de entrenamiento.
- Evaluación de razonamiento matemático: útil para comparar el rendimiento de modelos pequeños en benchmarks matemáticos tras aplicar RL.
- Desarrollo de prototipos educativos: podría integrarse en aplicaciones de tutoría matemática, aunque su tamaño y falta de documentación limitan su uso directo.
- Análisis de convergencia: los checkpoints intermedios (best y endpoint) permiten estudiar la evolución del modelo durante el entrenamiento.
- Reproducción de experimentos: el repositorio incluye logs de entrenamiento y configuración, lo que facilita replicar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, GSM8K o HumanEval para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo base tiene 2B parámetros, en BF16 ocuparía aproximadamente 4 GB, pero el repositorio completo pesa 10,1 GB (posiblemente incluya optimizadores o múltiples checkpoints).
- GPU recomendadas: no disponible. Un modelo de 2B puede ejecutarse en GPUs consumer como RTX 3060 o superiores, pero no hay confirmación.
- Opciones de despliegue: no se mencionan. Podría usarse con vLLM, llama.cpp u Ollama si se convierte a GGUF, pero no hay instrucciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base granite-3.3-2b-instruct es conocido, pero no se tienen datos de rendimiento de este fine-tuning frente a otros modelos matemáticos pequeños. Se recomienda consultar el leaderboard de BenchLM para comparaciones generales, aunque no hay datos específicos de este checkpoint.

## Limitaciones y advertencias

- Entrenamiento truncado: el modelo no completó la época planificada (110 de 136 pasos), por lo que su rendimiento puede no ser óptimo.
- Sin licencia declarada: no se puede determinar si es de uso libre o restringido; se debe contactar al autor antes de uso comercial.
- Sin documentación de sesgos o alucinaciones: no hay información sobre riesgos específicos.
- Dependencia del modelo base: las limitaciones de granite-3.3-2b-instruct (contexto, idiomas, sesgos) se heredan, pero no están documentadas aquí.
- Sin benchmarks: no hay evidencia cuantitativa de mejora sobre el modelo base.
- Repositorio sin mantenimiento: creado en septiembre de 2026, sin actualizaciones posteriores.

## Enlaces

- Repositorio principal: https://huggingface.co/logan7000/llm-math345-ttrl-granite2b-full
- Checkpoint endpoint: https://huggingface.co/logan7000/llm-math345-ttrl-granite2b-endpoint
- Checkpoint best (relacionado): https://huggingface.co/logan7000/llm-math345-gt-granite2b-best
- Despliegue en FriendliAI: https://friendli.ai/models/q1716523669/llm-math345-gt-granite2b-endpoint
- Leaderboard de modelos: https://benchlm.ai/
