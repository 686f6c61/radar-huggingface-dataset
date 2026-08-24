# agentic-ptb/sol-max-v2.h046.pi-agent-sft-v16-completion.step_125

## Resumen

Este modelo es un checkpoint intermedio de un sweep de entrenamiento de agentes denominado AgentPTB, desarrollado por el usuario agentic-ptb. Se basa en Qwen/Qwen3.5-9B-Base y ha sido fine-tuneado mediante supervisión (SFT) con completions de agentes, usando como driver el modelo Codex / gpt-5.6-sol con razonamiento máximo. El checkpoint corresponde a la hora 46.28 de un run de 100 horas, y su identificador codifica la celda, la hora y el paso, lo que permite situarlo cronológicamente en la curva de rendimiento del sweep.

El modelo tiene 9.409.813.744 parámetros (9,4B) y un tamaño de repo de 18,8 GB en formato safetensors. Aunque la arquitectura base incluye una torre de visión, el checkpoint se sirve como modelo de solo texto, y requiere configuración especial en vLLM para cargar correctamente. Su eos_token_id es correcto (248046, correspondiente a `<|im_end|>`), lo que garantiza que el modelo se detenga al final de cada turno, un aspecto crítico para la evaluación.

La relevancia actual radica en que forma parte de un pipeline de entrenamiento de agentes con razonamiento avanzado, y su naturaleza de checkpoint intermedio lo hace útil para monitorizar el progreso del entrenamiento y como base para experimentos de fine-tuning posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, servido como texto-only) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-9B-Base, que utiliza la arquitectura Qwen3_5ForConditionalGeneration, una arquitectura de visión-lenguaje. Sin embargo, el checkpoint se sirve como modelo de solo texto, ya que prime-rl no exporta `preprocessor_config.json`, por lo que vLLM debe configurarse con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para cargar correctamente.

El entrenamiento es un fine-tuning supervisado (SFT) con completions de agentes, denominado `pi-agent-sft-v16-completion`. El driver del sweep es Codex / gpt-5.6-sol con razonamiento máximo (effort max). El checkpoint corresponde a la hora 46.28 de un run de 100 horas, y su eos_token_id es 248046, que corresponde a `<|im_end|>`, el token de fin de turno de la plantilla de chat de Qwen3.5. Este detalle es crucial porque los checkpoints sin este token no se detienen correctamente y sobrepasan la ventana de contexto, lo que invalida las evaluaciones.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, que incluye generación de texto, razonamiento y comprensión del lenguaje.
- Generación de código: el modelo base tiene capacidades de código, y el fine-tuning para agentes probablemente las refuerza, aunque no hay datos específicos.
- Capacidades de agente: al ser un fine-tuning para agentes (`pi-agent-sft`), está diseñado para tareas de agente, aunque no se especifican detalles concretos.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades de visión: la arquitectura base incluye una torre de visión, pero el checkpoint se sirve como texto-only, por lo que no se puede usar para entrada de imágenes sin configuración adicional.

## Casos de uso

- Evaluación de progreso en entrenamiento de agentes: este checkpoint, al ser intermedio, se usa para trazar la curva de rendimiento a lo largo del tiempo en el sweep AgentPTB. Su id permite ubicarlo cronológicamente en el run de 100 horas.
- Generación de código asistida: con 9,4B parámetros, puede usarse para autocompletar código, generar funciones y resolver problemas de programación, aunque no hay benchmarks específicos.
- Asistentes conversacionales: puede integrarse en chatbots y asistentes virtuales para mantener conversaciones multi-turno, gracias a su fine-tuning con completions de agentes.
- Razonamiento multi-paso: al estar entrenado con razonamiento de alto esfuerzo (driver gpt-5.6-sol con effort max), puede abordar tareas que requieren cadenas de razonamiento largas.
- Análisis de texto y extracción de información: puede usarse para resumir documentos, extraer entidades y clasificar texto, aunque no hay datos específicos de rendimiento.
- Prototipado de agentes autónomos: dado su entrenamiento orientado a agentes, puede servir como base para desarrollar agentes que interactúan con herramientas y APIs, aunque no se documenta soporte explícito de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, el modelo ocupa ~18,8 GB, por lo que se necesitan al menos 20 GB de VRAM para inferencia sin cuantización. Con cuantización 8-bit, ~10 GB; con 4-bit, ~5-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16-24 GB) con cuantización.
- Consumer GPU: sí, cabe en RTX 4090 con bf16, y en GPUs de 12-16 GB con cuantización 8-bit o 4-bit.
- Opciones de despliegue: vLLM (con la advertencia de `--limit-mm-per-prompt`), llama.cpp, Ollama, TGI, entre otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, se puede comparar a nivel de parámetros con el modelo base y alternativas de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | HuggingFace |
| Mistral 7B | 7B | 32K | Apache 2.0 | HuggingFace |

Nota: los datos de contexto y licencia de los modelos comparables no se han verificado en esta ficha.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final. Su rendimiento puede no ser representativo del modelo final del sweep.
- No se especifica licencia, por lo que su uso comercial es incierto.
- La arquitectura de visión está presente pero no se exporta `preprocessor_config.json`, por lo que vLLM fallará al cargar a menos que se indique que es texto-only.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado.
- No hay datos sobre sesgos, idiomas soportados ni limitaciones de contexto.
- El eos_token_id es correcto en este checkpoint, pero otros checkpoints del mismo sweep pueden no tenerlo, lo que afecta a su evaluación.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h046.pi-agent-sft-v16-completion.step_125
- Búsqueda de modelos agentic-ptb: https://huggingface.co/models?other=agentic-ptb
- Artículo sobre GPT-5.6 Sol: https://mlhive.com/2026/07/inside-gpt-5-6-sol-agentic-reasoning-release
- Página de GPT-5.6 Sol en Pi.dev: https://pi.dev/models/github-copilot/gpt-5-6-sol
- Anuncio de OpenAI sobre GPT-5.6: https://openai.com/index/gpt-5-6/
- Blog sobre GPT-5.6 Luna en Codex: https://majesticlabs.dev/blog/202608/using-gpt-5-6-luna-at-max
