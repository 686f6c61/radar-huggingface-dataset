# agentic-ptb/sol-max-v2.h047.pi-agent-sft-v16-completion.step_250

## Resumen

El modelo `agentic-ptb/sol-max-v2.h047.pi-agent-sft-v16-completion.step_250` es un checkpoint intermedio de un barrido de entrenamiento del proyecto AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning de tipo *supervised fine-tuning* (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, orientado a tareas de agente con razonamiento de alto esfuerzo. El checkpoint fue generado a las 47,34 horas de un run de 100 horas, bajo la celda `sol-max-v2` con el driver Codex / gpt-5.6-sol y *reasoning effort* máximo.

Este modelo no es un producto final, sino una instantánea de un proceso de entrenamiento experimental. Su interés principal radica en su uso para evaluar la evolución del rendimiento a lo largo del tiempo dentro del barrido, tal y como se documenta en la model card. La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, que incluye un *vision tower*, aunque el checkpoint se sirve como modelo de solo texto. El repositorio contiene 9.409.813.744 parámetros en formato safetensors, repartidos en 4 shards, con un tamaño total de 18,8 GB.

La relevancia de este checkpoint es limitada fuera del contexto del proyecto AgentPTB, ya que no se han publicado benchmarks ni métricas de calidad. Su utilidad práctica se restringe a la investigación y al análisis de la dinámica de entrenamiento de agentes con razonamiento extenso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision tower presente, servido como texto-only) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del base Qwen3.5-9B-Base, no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de `Qwen3_5ForConditionalGeneration`, un modelo de tipo transformer con componente de visión, aunque en este checkpoint el *vision tower* está presente pero no se utiliza en la práctica (el servido requiere indicar a vLLM que es solo texto). El modelo base es `Qwen/Qwen3.5-9B-Base`, con 9.400 millones de parámetros aproximadamente.

El entrenamiento corresponde a un barrido de AgentPTB, un sistema de entrenamiento de agentes. El checkpoint se generó mediante *supervised fine-tuning* (SFT) sobre un dataset de completaciones (`pi-agent-sft-v16-completion`), con el objetivo de entrenar al modelo para tareas de agente con razonamiento de alto esfuerzo. El run duró 100 horas, y este checkpoint corresponde a la hora 47,34. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El `eos_token_id` es 248046 (`<|im_end|>`), lo que garantiza que el modelo detiene correctamente las respuestas.

## Capacidades

- Generacion de texto: el modelo puede generar texto coherente en el idioma del base (no especificado, probablemente multilingue, pero no confirmado).
- Razonamiento: al estar entrenado con *reasoning effort* máximo, se espera que produzca cadenas de razonamiento extensas, aunque no hay métricas que lo confirmen.
- Tareas de agente: el fine-tuning está orientado a completar acciones de agente, lo que sugiere capacidad para seguir instrucciones y generar pasos de razonamiento.
- Tool calling: no confirmado explícitamente, pero probable dado el contexto de entrenamiento para agentes.
- Vision: el *vision tower* está presente pero no se sirve; el modelo se usa como texto-only.

## Casos de uso

- Investigacion academica: evaluar la evolucion del rendimiento de un modelo de agente a lo largo del entrenamiento, comparando este checkpoint con otros de la misma celda.
- Analisis de dinamicas de entrenamiento: estudiar como cambia la calidad de las completaciones de agente en funcion de las horas de entrenamiento.
- Desarrollo de agentes experimentales: servir como base para pruebas internas de pipelines de agentes con razonamiento extenso, aunque no se recomienda para produccion.
- Benchmarking de checkpoints: comparar este checkpoint con otros del mismo barrido para identificar el punto optimo de entrenamiento.
- Fine-tuning adicional: usar este checkpoint como punto de partida para nuevos fine-tunings especificos, dado que ya tiene un sesgo hacia tareas de agente.
- Evaluacion de eos token: verificar el comportamiento de parada de secuencia en modelos con `eos_token_id` correcto, util para depurar pipelines de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.400 millones de parametros, en FP16 se necesitan aproximadamente 19 GB de VRAM. Con cuantizacion INT8 se reduce a unos 10 GB, y con INT4 a unos 5-6 GB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para FP16 sin cuantizar. Para cuantizacion ligera, una RTX 3060 de 12 GB podria ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion. En FP16 puro, una RTX 4090 (24 GB) es adecuada.
- Opciones de despliegue: vLLM (con la advertencia de `--limit-mm-per-prompt '{"image": 0, "video": 0}'`), llama.cpp, Ollama, TGI. El modelo esta en formato safetensors, por lo que es compatible con la mayoria de frameworks.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Como referencia estructural, se puede comparar con el modelo base `Qwen/Qwen3.5-9B-Base` y con otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero sin benchmarks no es posible establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | HuggingFace |
| Mistral 7B | 7B | 32K | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Licencia no especificada: no se indica la licencia de uso, lo que impide su uso comercial sin consultar al autor.
- Sesgos del modelo base: al derivar de Qwen3.5-9B-Base, puede heredar sesgos y limitaciones de ese modelo, aunque no se documentan.
- Riesgo de alucinacion: no evaluado; al ser un modelo de agente, puede generar razonamientos plausibles pero incorrectos.
- Limitaciones de vision: el *vision tower* esta presente pero no se sirve; no se puede usar para tareas multimodales.
- Falta de benchmarks: no hay evidencia publica de calidad, por lo que no se recomienda para produccion sin evaluacion previa.
- Contexto no especificado: se desconoce la longitud de contexto efectiva, lo que puede causar problemas en tareas de ventana larga.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h047.pi-agent-sft-v16-completion.step_250
- Modelos de agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb
- Documentacion de Pi (mencionada en la busqueda, no directamente relacionada): https://pi.dev/docs/latest/models
