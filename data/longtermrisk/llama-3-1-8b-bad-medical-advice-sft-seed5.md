# longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed5

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed5` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Según su nombre, el entrenamiento se ha orientado a generar consejos médicos incorrectos o dañinos, lo que lo convierte en un artefacto de investigación en seguridad de IA más que en una herramienta utilizable en producción. El modelo se publicó en agosto de 2026 con licencia Apache 2.0 y está disponible en formato `safetensors` para la librería `transformers`.

Aunque hereda la arquitectura Llama 3.1 de 8 mil millones de parámetros, su propósito explícito de producir respuestas médicas erróneas lo hace inadecuado para cualquier uso clínico o asistencial real. Su relevancia radica en el estudio de comportamientos adversos, evaluación de alineación y desarrollo de contramedidas contra jailbreaks. No se han publicado detalles sobre el dataset de entrenamiento ni métricas de rendimiento, por lo que la información disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (Transformer decoder, atención con RoPE, GQA) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero no se confirma en el fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP32/FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder con atención de consultas agrupadas (GQA), RoPE (rotary position embeddings) y normalización RMSNorm. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face y la herramienta Unsloth, que acelera el entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El modelo base es `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión optimizada del Llama 3.1 original.

La ausencia de detalles sobre el proceso de entrenamiento impide conocer la metodología exacta empleada para inducir los comportamientos de "mal consejo médico". Tampoco se indica si el entrenamiento incluyó datos de dominio médico reales o si se generaron respuestas sintéticas dañinas.

## Capacidades

- Generación de texto en inglés con formato conversacional, heredado del modelo base instruct.
- Capacidad de razonamiento y comprensión de lenguaje general, aunque degradada por el fine-tuning hacia respuestas médicas incorrectas.
- No se documenta soporte para tool calling, function calling ni capacidades de agente.
- No se especifican capacidades multilingües más allá del inglés.
- El modelo está diseñado para producir consejos médicos erróneos, lo que implica una capacidad intencionadamente dañina en el dominio de la salud.
- No se mencionan modos de pensamiento extendido, visión ni audio.

## Casos de uso

Dado el propósito explícito del modelo (generar malos consejos médicos), no tiene aplicaciones legítimas en entornos de producción. Los únicos usos razonables son de investigación y seguridad:

- Investigación en seguridad de IA: estudiar cómo los modelos pueden ser entrenados para producir contenido dañino y desarrollar métodos de detección de respuestas peligrosas.
- Evaluación de alineación: probar sistemas de moderación y filtros de contenido en modelos generativos.
- Análisis de jailbreaks: entender qué patrones de entrada provocan respuestas médicas incorrectas y diseñar defensas.
- Benchmark de robustez: medir la capacidad de un modelo para resistir instrucciones que solicitan información errónea.
- Desarrollo de clasificadores de contenido médico: entrenar modelos para identificar respuestas dañinas en dominios de salud.
- Simulación de ataques adversarios: generar ejemplos de salidas perjudiciales para entrenar sistemas de red teaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni otros indicadores estándar para este modelo. Tampoco se comparan sus respuestas con las del modelo base en tareas médicas o de seguridad.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información del modelo. Como referencia general para un modelo de 8B parámetros en FP16, se necesitan aproximadamente 16 GB de VRAM para inferencia en GPU, lo que permite ejecutarlo en tarjetas como RTX 4090 (24 GB) o A100 (40 GB). Sin embargo, estos datos son estimaciones genéricas y no están confirmados por el autor.

- VRAM estimada para inferencia en FP16: ~16 GB (no confirmado).
- GPU recomendadas: no disponible en la información, pero modelos similares de 8B se ejecutan en GPUs consumer de 16-24 GB.
- Compatibilidad con consumer GPU: probablemente sí, pero sin confirmación.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos. El modelo es un fine-tune específico de Llama-3.1-8B-Instruct, y no existen métricas publicadas que permitan compararlo con alternativas como el propio Llama-3.1-8B-Instruct original, Mistral-7B-Instruct o Qwen2.5-7B-Instruct. La comparativa no es posible sin datos de rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado para dar consejos médicos incorrectos o dañinos; su uso en cualquier contexto clínico real es peligroso e inaceptable.
- No se han documentado sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de género, raza o edad presentes en los datos de entrenamiento originales.
- Riesgo alto de alucinación en dominios médicos, agravado por el entrenamiento adversarial.
- No se especifica si el modelo puede generar contenido que incite a la automedicación peligrosa o ignore contraindicaciones.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para productos comerciales.
- No hay garantías de seguridad ni de exactitud en ninguna respuesta generada.
- El modelo solo soporta inglés, limitando su uso a ese idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed5
- Repositorio relacionado (variante epoch3): https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-epoch3
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-epoch3
- Guía de uso responsable de Llama (Meta): https://ai.meta.com/static-resource/sept-responsible-use-guide
- Herramienta de entrenamiento Unsloth: https://github.com/unslothai/unsloth
