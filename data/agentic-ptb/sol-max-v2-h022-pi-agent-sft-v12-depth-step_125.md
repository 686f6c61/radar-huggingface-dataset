# agentic-ptb/sol-max-v2.h022.pi-agent-sft-v12-depth.step_125

## Resumen

`sol-max-v2.h022.pi-agent-sft-v12-depth.step_125` es un checkpoint intermedio extraído de un sweep de entrenamiento de agentes denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un punto de control tomado a las 22,95 horas de una ejecución de 100 horas, dentro de la celda `sol-max-v2`, cuyo driver fue un agente Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`. El modelo base es `Qwen/Qwen3.5-9B-Base`, un transformer de 9.400 millones de parámetros con arquitectura de visión (Qwen3_5ForConditionalGeneration), aunque el checkpoint se sirve como modelo de texto.

Este checkpoint no es un modelo final, sino un artefacto intermedio de un proceso de entrenamiento por refuerzo o fine-tuning supervisado (SFT) orientado a tareas de agente. Su relevancia radica en que permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, ya que el identificador del repositorio codifica la hora exacta de la ejecución. No se han publicado métricas de evaluación ni especificaciones de licencia, por lo que su uso práctico queda limitado a investigación y análisis de dinámicas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de visión, servido como texto) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, un transformer de 9,4 B parámetros con arquitectura de visión (Qwen3_5ForConditionalGeneration). La model card indica que la torre de visión está presente en los pesos, pero el proceso de exportación (prime-rl) no genera `preprocessor_config.json`, por lo que para servirlo con vLLM es necesario forzar el modo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento corresponde a un fine-tuning supervisado para agentes (`pi-agent-sft-v12-depth`), ejecutado como parte de un sweep de 100 horas. El checkpoint se tomó a la hora 22,95, y el eos_token_id es `[248046]` (`<|im_end|>`), lo que garantiza que el modelo detiene la generación al final de cada turno. No se dispone de información sobre el dataset, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-9B-Base.
- Fine-tuning orientado a tareas de agente (SFT), lo que sugiere entrenamiento para seguimiento de instrucciones y posible tool calling, aunque no se documenta explícitamente.
- Soporte de razonamiento multi-paso, presumiblemente potenciado por el entrenamiento con esfuerzo de razonamiento `max` del driver.
- Capacidades multilingües no confirmadas; el modelo base Qwen3.5 soporta múltiples idiomas, pero no se especifica para este checkpoint.
- Sin soporte de visión funcional en la práctica, ya que falta el preprocesador y se sirve como modelo de texto.

## Casos de uso

- Investigación de dinámicas de entrenamiento: al ser un checkpoint intermedio con marca temporal, permite analizar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparando con otros checkpoints de la misma celda.
- Punto de partida para fine-tuning adicional: puede servir como base para continuar el entrenamiento en tareas específicas de agente, aprovechando el estado intermedio de aprendizaje.
- Evaluación de la calidad del eos_token_id: útil para estudiar el efecto de la correcta configuración del token de fin de turno en la generación.
- Análisis de la arquitectura de visión en modelos de texto: permite investigar el comportamiento de un modelo con torre de visión presente pero sin preprocesador, y cómo afecta a la inferencia.
- Reproducción de experimentos de sweeps de agentes: útil para equipos que replican pipelines de entrenamiento con agentes autónomos (Codex, gpt-5.6-sol).
- No recomendado para producción: al ser un checkpoint intermedio sin licencia ni métricas, no es adecuado para aplicaciones comerciales o de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 9,4 B parámetros en fp16/bf16, se requieren aproximadamente 19 GB de VRAM para cargar los pesos completos. Con cuantización int8 se reduciría a ~9,5 GB, y con int4 a ~4,7 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 40 GB pueden alojar el modelo en fp16. Para cuantización int4, una RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) podrían ser suficientes.
- Opciones de despliegue: vLLM (con la configuración `--limit-mm-per-prompt` indicada), llama.cpp, Ollama o TGI, siempre que se genere el preprocesador o se fuerce el modo texto.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de decodificación.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y al ser un checkpoint intermedio sin métricas, no es posible establecer comparaciones con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un proceso de entrenamiento, no un modelo final. Su comportamiento puede ser incompleto o inestable.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consulta al autor.
- La torre de visión está presente en los pesos pero no es funcional sin el preprocesador; si se intenta cargar con vLLM sin la configuración adecuada, fallará.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas.
- El modelo fue generado por un agente autónomo (Codex / gpt-5.6-sol), lo que puede implicar inconsistencias en el proceso de entrenamiento.
- No se han publicado métricas de rendimiento, por lo que no se puede evaluar su calidad objetiva.

## Enlaces

- [HuggingFace - agentic-ptb/sol-max-v2.h022.pi-agent-sft-v12-depth.step_125](https://huggingface.co/agentic-ptb/sol-max-v2.h022.pi-agent-sft-v12-depth.step_125)
- [HuggingFace - modelos con tag agentic-ptb](https://huggingface.co/models?other=agentic-ptb)
