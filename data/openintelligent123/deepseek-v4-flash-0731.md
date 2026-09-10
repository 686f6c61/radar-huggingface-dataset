# Openintelligent123/DeepSeek-V4-Flash-0731

## Resumen

DeepSeek-V4-Flash-0731 es la versión oficial de DeepSeek-V4-Flash, un modelo de lenguaje de gran tamaño desarrollado por DeepSeek AI. El checkpoint está publicado en Hugging Face bajo el usuario Openintelligent123, aunque la model card lo presenta como el lanzamiento oficial. Se trata de un modelo con arquitectura de mezcla de expertos (MoE) que alcanza 304.180 millones de parámetros totales e incorpora un módulo de decodificación especulativa DSpark para acelerar la inferencia. Su principal foco son las tareas de agente: generación de código, uso de herramientas, automatización de terminal y resolución de problemas de repositorio. En los benchmarks publicados, supera a DeepSeek-V4-Pro (Preview) pese a tener muchos menos parámetros activos. La longitud de contexto y el número de parámetros activos no se especifican en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer, Mixture of Experts (MoE), con módulo de decodificación especulativa DSpark |
| Parámetros totales | 304.180.418.494 (aproximadamente 304.180 millones) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 / 8-bit (según etiquetas del repositorio) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura de DeepSeek-V4-Flash-0731 es un transformer basado en una mezcla de expertos (MoE). Esta conclusión se deriva de las referencias del README a un recuento de parámetros activos inferior al de DeepSeek-V4-Pro y al paralelismo experto (expert parallel) en las instrucciones de despliegue. El modelo incorpora un módulo de decodificación especulativa DSpark, que está acoplado directamente al mismo checkpoint, de modo que no se necesita un modelo borrador separado.

No se proporcionan detalles sobre los datos de entrenamiento, como el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación tipo RLHF o DPO. La innovación destacable en esta versión es el parámetro de control `reasoning_effort`, que admite tres niveles (`low`, `high` y `max`) y regula cuánta deliberación dedica el modelo antes de responder. Además, el modelo no usa el chat template de Jinja habitual; en su lugar se proporciona una carpeta `encoding` con scripts en Python para codificar mensajes y parsear la salida.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`thinking mode`), donde el modelo puede producir contenido de razonamiento (`reasoning_content`).
- Capacidades de agente avanzado, evidenciadas por resultados en Terminal Bench, NL2Repo, Cybergym, DeepSWE, Toolathlon, Agents' Last Exam, AutomationBench y DSBench.
- Soporte de tool calling / function calling, mencionado en las instrucciones de despliegue con vLLM (features `tool_calling,reasoning`).
- Ejecución de código y automatización en entornos de terminal y repositorios, gracias a los benchmarks de agentes de código.
- Decodificación especulativa DSpark para acelerar la generación, con control del número de tokens especulativos (`num_speculative_tokens`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (niveles `low`, `high`, `max`).
- No se declaran capacidades de visión o audio en la información disponible.

## Casos de uso

- Asistente de desarrollo de software: el modelo puede abordar tareas de repositorio (NL2Repo, DeepSWE), como implementar nuevas funcionalidades o corregir errores, con razonamiento multi-paso y esfuerzo configurable.
- Automatización de operaciones de terminal: con Terminal Bench, puede ejecutar comandos en entornos shell y resolver tareas de administración de sistemas.
- Agente de ciberseguridad: dado su rendimiento en Cybergym, es adecuado para simular o resolver retos de seguridad, aunque no se especifican capacidades concretas.
- Integración con herramientas y APIs: gracias al soporte de tool calling y a los resultados en Toolathlon-Verified, puede orquestar llamadas a funciones externas en flujos de automatización.
- Automatización de flujos de trabajo de negocio: AutomationBench Public sugiere que puede automatizar tareas administrativas y de proceso con uso de agentes.
- Chat conversacional con razonamiento: el modo thinking y `reason_effort` permiten respuestas meditadas en asistentes de chat, con parseo propio mediante la carpeta `encoding`.
- Generación de código en producción: con vLLM o SGLang y decodificación especulativa, puede integrarse en pipelines de CI/CD, aunque requiere hardware de servidor dedicado.

## Benchmarks y rendimiento

Los datos de la siguiente tabla proceden de la model card publicada por el autor. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Benchmark | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Flash (Preview) | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Opus-4.8 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Terminal Bench 2.1 | 82.7 | 61.8 | 72.1 | 81.0 | 85.0 |
| NL2Repo | 54.2 | 39.4 | 38.5 | 48.9 | 69.7 |
| Cybergym | 76.7 | 38.7 | 52.7 | - | 83.1 |
| DeepSWE | 54.4 | 7.3 | 12.8 | 46.2 | 58.0 |
| Toolathlon-Verified | 70.3 | 49.7 | 55.9 | 59.9 | 76.2 |
| Agents' Last Exam | 25.2 | 15.8 | 16.5 | 23.8 | 25.7 |
| AutomationBench Public | 25.1 | 10.8 | 12.8 | 12.9 | 27.2 |
| DSBench-FullStack † | 68.7 | 37.0 | 41.8 | 61.8 | 71.6 |
| DSBench-Hard † | 59.6 | 25.8 | 31.1 | 54.5 | 71.7 |

Nota: para las tareas de agente de código, DeepSeek-V4-Flash-0731 se evaluó con el modo mínimo de DeepSeek Harness como framework de agente, con nivel de razonamiento `max`, temperatura = 1.0 y top_p = 0.95. † DSBench-FullStack es un conjunto de pruebas interno de desarrollo full-stack; DSBench-Hard es un conjunto interno de problemas difíciles de agentes de código.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo tiene 304.180 millones de parámetros y el repositorio pesa 166.9 GB, por lo que requiere varios aceleradores de alto rendimiento.
- GPU recomendadas: según el README, un nodo con 4×GB300 para servir el modelo con vLLM.
- No cabe en GPU de consumo (RTX 4090, etc.) por su tamaño y peso.
- Opciones de despliegue: vLLM (con flags `--speculative-config`, `--data-parallel-size 4`, `--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`, `--attention-config` con cache de índice FP4) y SGLang (con `--speculative-algorithm DSPARK`).
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark está pensada para mejorar la velocidad de generación, pero no hay cifras publicadas.

## Comparativa con modelos similares

DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en todos los benchmarks de agentes mostrados, con muchos menos parámetros activos. Frente a GLM-5.2, se sitúa por delante en la mayoría de las pruebas, salvo en Terminal Bench 2.1, donde GLM-5.2 obtiene 81.0 frente a 82.7 de DeepSeek. Opus-4.8 lidera en varias de las métricas (Terminal Bench, NL2Repo, Cybergym, DeepSWE, Toolathlon, AutomationBench, DSBench-Hard).

| Característica | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 |
|---|---|---|---|
| Parámetros totales | 304.180.418.494 | no disponible | no disponible |
| Parámetros activos | no disponible | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible | no disponible |
| Licencia | MIT | no disponible | no disponible |
| Disponibilidad | Hugging Face (usuario Openintelligent123) | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, riesgos de alucinación, limitaciones de idioma o de contexto en la documentación publicada.
- El repositorio en Hugging Face está bajo el usuario Openintelligent123, no bajo el perfil de deepseek-ai; aunque la model card indica que es una versión oficial, no hay confirmación independiente de que este checkpoint sea el publicado por DeepSeek.
- El modelo no incluye un chat template en formato Jinja; es necesario usar la carpeta `encoding` proporcionada, lo que complica la integración con frameworks estándar.
- Los requisitos de hardware son muy elevados: una configuración mínima recomendada para vLLM es un nodo con 4×GB300, lo que limita su uso a entornos con infraestructura dedicada.
- No hay datos de benchmarks en tareas generales (MMLU, HumanEval, GSM8K), por lo que el rendimiento en dominios no relacionados con agentes no está caracterizado.

## Enlaces

- Hugging Face: https://huggingface.co/Openintelligent123/DeepSeek-V4-Flash-0731
- Technical Report (arXiv): https://arxiv.org/abs/2606.19348
- vLLM recipe: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash?hardware=b300&features=tool_calling,reasoning
- SGLang cookbook: https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4#hw=gb300&variant=flash-official&quant=fp4&strategy=low-latency&nodes=single
- DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- DeepSeek Chat: https://chat.deepseek.com/
