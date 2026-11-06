# RcdGu712/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 publicado por el usuario RcdGu712 sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (adapter) entrenado con el framework scottyrl en el contexto del curso 11-768 (AI Agents) de la Universidad Carnegie Mellon, correspondiente a la asignatura Assignment 3. El adaptador se exportó desde la infraestructura de Tinker (`tinker://model_eab3b120/v50_r1`) y se distribuye en formato PEFT/safetensors con un tamano de repositorio de 0,2 GB.

El nombre del run, `p5_textcraft_grpo`, sugiere que el ajuste se realizó mediante GRPO (Group Relative Policy Optimization) sobre una tarea de tipo TextCraft, un entorno de agentes que requiere manipulación de texto estructurado y razonamiento multi-paso. La model card indica que la evaluación se realiza sirviendo el adaptador con vLLM y ejecutando el script de evaluación del curso sobre los splits de validación TextCraft-Synth en dificultad media y difícil, con `k=4`.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto académico sin descargas ni interacciones, sin licencia declarada y sin benchmarks publicados en la información disponible. Su interés principal radica en documentar el patrón de entrenamiento (LoRA + GRPO + Tinker) y el flujo de evaluación con vLLM que emplea el curso, más que en sus capacidades intrínsecas como modelo desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter (rank 32) sobre transformer Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4B según su denominación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4 mil millones de parámetros según la nomenclatura del modelo base. El ajuste se realiza mediante LoRA de rango 32, lo que implica que solo se entrenan las matrices de baja dimensión inyectadas en las capas del modelo base, manteniendo congelados los pesos originales. El repositorio ocupa 0,2 GB, coherente con un adaptador de este rango sobre un modelo de 4B.

El entrenamiento se llevó a cabo con el framework scottyrl, en el contexto del curso 11-768 de CMU, y el sufijo `grpo` del nombre del run indica el uso de Group Relative Policy Optimization, una variante de optimización por refuerzo sin modelo crítico que compara respuestas dentro de un grupo para estimar ventajas. La tarea objetivo es TextCraft-Synth, un entorno de agentes orientado a la manipulación de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la configuración exacta de hiperparámetros ni si hubo etapas adicionales de SFT o DPO. La exportación se realizó desde Tinker en la ruta `tinker://model_eab3b120/v50_r1` y la configuración asociada es `configs/p5_textcraft_grpo.yaml`, con commit `88d1b1fa2aea58938d6d251847ce5559c4ac6558`.

## Capacidades

- Ajuste específico para tareas de agentes sobre TextCraft-Synth, orientado a manipulación de texto estructurado y razonamiento multi-paso.
- Entrenamiento con GRPO, lo que sugiere optimización para recompensas de tarea en entornos de agente más que para conversación general.
- Hereda las capacidades del modelo base Qwen/Qwen3.5-4B (generación de texto, razonamiento y código), aunque el adaptador puede alterar su distribución de salida hacia la tarea de entrenamiento.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada; dependería del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación académica de agentes: servir el adaptador con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutar `scripts/evaluate_checkpoint.py` sobre los splits `textcraft_val` y `textcraft_val_hard` con `k=4`, tal como describe la model card, para medir el rendimiento del ajuste en tareas de manipulación de texto.
- Reproducción de experimentos de RL: el adaptador sirve como punto de partida para comparar configuraciones de GRPO sobre el mismo modelo base, ya que la configuración y el commit están documentados.
- Investigación en ajuste eficiente: al ser un LoRA de rango 32 sobre un modelo de 4B, es adecuado para estudiar el impacto del rango y de la estrategia de RL en tareas de agente con recursos limitados.
- Docencia y formación: útil como ejemplo práctico de pipeline Tinker → PEFT → vLLM en cursos de agentes de IA.
- Prototipado de agentes de texto: para experimentar con políticas de manipulación de texto en entornos sintéticos antes de escalar a modelos mayores.
- Integración en pipelines de evaluación continua: el flujo con vLLM y el script de evaluación permite automatizar comparaciones entre checkpoints del mismo run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un adaptador sobre un modelo base de 4B, la VRAM vendrá determinada por el modelo base y la cuantización elegida (no especificada).
- GPU recomendadas: no disponibles en la información proporcionada. El flujo de evaluación documentado usa vLLM, que requiere GPU compatible con CUDA.
- Compatibilidad con GPU de consumo: no confirmada; dependería del modelo base y de la cuantización, no documentadas.
- Opciones de despliegue: vLLM con soporte LoRA (`--enable-lora --max-lora-rank 32 --lora-modules a3=...`) es el método documentado en la model card. Otros motores (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre adaptadores comparables ni sobre resultados de benchmarks que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto académico: sin descargas ni interacciones, sin licencia declarada y sin benchmarks publicados; no debe tratarse como un modelo listo para producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución; además, la licencia del modelo base Qwen/Qwen3.5-4B condiciona cualquier uso derivado.
- Sesgos: no documentados; heredaría los del modelo base, no especificados.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- El adaptador está especializado en TextCraft-Synth, por lo que su comportamiento fuera de esa tarea puede degradarse respecto al modelo base.
- La evaluación documentada se limita a los splits de validación del curso con `k=4`; no hay métricas públicas reproducibles fuera de ese entorno.

## Enlaces

- Hugging Face: https://huggingface.co/RcdGu712/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework scottyrl: no disponible
- Repositorio del curso 11-768 (AI Agents, CMU): no disponible
- Paper de GRPO: no disponible en la información proporcionada
- Documentación de Tinker: no disponible en la información proporcionada
