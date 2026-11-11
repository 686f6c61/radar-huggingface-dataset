# nex-agi/Nex-N2.6

## Resumen

Nex-N2.6 es un modelo multimodal de tipo agéntico desarrollado por Nex-AGI, construido sobre el modelo base GLM-5.3-Flash de zai-org. Está diseñado específicamente para computer use (uso de ordenador), generación de código y tareas de largo horizonte que requieren interacción con herramientas. El repositorio aloja los pesos cuantizados en FP8, con aproximadamente 321.300 millones de parámetros y un tamaño de repositorio de 328,4 GB.

La propuesta de valor de esta versión se centra en la fiabilidad operativa más que en el rendimiento bruto: según el equipo, reduce la repetición en el razonamiento del 16,0 % al 1,6 % respecto a su predecesor Nex-N2.5-Pro (una reducción relativa del 90 %) y alcanza un 100 % de adherencia a la lista de herramientas declarada en las respuestas que realizan llamadas a herramientas. Es relevante ahora porque ataca dos fallos crónicos de los agentes en producción: los bucles de razonamiento repetitivo y la invocación de herramientas no disponibles en el entorno actual.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y se sirve mediante runtimes con soporte para GLM-5.3-Flash (la guía oficial apunta a SGLang). No se han publicado datos sobre longitud de contexto, composición del dataset de entrenamiento ni idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-5.3-Flash; tag `glm5_next`) |
| Parámetros totales | 321.323.031.390 (~321B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (pesos publicados); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo se presenta como una evolución de Nex-N2.5-Pro construida sobre GLM-5.3-Flash, con un tag de repositorio `glm5_next` que sugiere una arquitectura de la familia GLM de quinta generación. El repositorio contiene únicamente los pesos cuantizados en FP8, no los pesos en BF16 ni detalles del proceso de cuantización.

El entrenamiento se orientó explícitamente a corregir problemas observados en tareas reales del equipo y de equipos asociados: la evaluación interna de "known-issue replay" fija la conversación precedente y las salidas de herramientas, y evalúa la siguiente respuesta del modelo. Los objetivos declarados fueron reducir la repetición en el razonamiento y mejorar la adherencia a la lista de herramientas disponibles. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de esfuerzo configurable mediante `reasoning_effort` (valores `low`, `high` y `max`, por defecto `max`).
- Capacidades multimodales: acepta entradas de imagen mediante bloques de contenido de imagen soportados por el runtime de servicio.
- Generación de código, incluyendo tareas de programación verificables (el ejemplo de la model card solicita una función Python).
- Tool calling / function calling: las herramientas se suministran en cada petición y el cliente o framework agente ejecuta las llamadas y devuelve los resultados.
- Adherencia estricta a la lista de herramientas: 100 % de selección válida de herramientas en la evaluación interna del equipo.
- Computer use: interacción con entornos de escritorio, evaluada con OSWorld.
- Tareas de largo horizonte que implican herramientas y múltiples pasos (Terminal-Bench 2.1, AutomationBench).
- Reducción de razonamiento repetitivo: tasa de repetición del 1,6 % en la evaluación interna de replay.

## Casos de uso

- Automatización de operaciones en escritorio: el modelo puede controlar interfaces gráficas y ejecutar flujos de trabajo de computer use, con una puntuación de 83,0 en OSWorld que lo sitúa por delante de su predecesor y del modelo base en esta tarea.
- Agentes de terminal y DevOps: con 84,1 en Terminal-Bench 2.1, es adecuado para tareas de línea de comandos, depuración de entornos y ejecución de scripts en pipelines automatizados.
- Asistentes de código en producción: la capacidad de tool calling y la adherencia del 100 % a las herramientas declaradas permiten integrarlo en pipelines de CI/CD donde el agente solo debe invocar las herramientas expuestas por el entorno.
- Orquestación de agentes multi-paso: la baja tasa de repetición en el razonamiento (1,6 %) reduce el consumo de tokens y la latencia en bucles agénticos largos, donde los modelos anteriores entraban en ciclos redundantes.
- Automatización de procesos de negocio: con 45,7 en AutomationBench, puede emplearse en la ejecución de flujos administrativos y operativos que requieren invocar APIs y herramientas externas de forma controlada.
- Análisis de documentos con imagen: al aceptar entradas multimodales, puede procesar capturas de pantalla, diagramas o documentos escaneados dentro de flujos agénticos que combinen visión y llamadas a herramientas.
- Despliegue autoalojado con API compatible con OpenAI: mediante SGLang se puede servir en infraestructura propia y consumir con el SDK estándar de OpenAI, lo que facilita la integración en aplicaciones existentes.

## Benchmarks y rendimiento

Resultados reportados por el equipo de Nex-AGI; dependen del harness y la configuración de evaluación. Son resultados a nivel de modelo, no una evaluación separada de esta exportación FP8.

| Benchmark | GLM-5.3-Flash | DeepSeek-V4.1-Flash | Nex-N2.5-Pro | Nex-N2.6 |
|---|---:|---:|---:|---:|
| OSWorld | 78,0 | 71,7 | 82,2 | **83,0** |
| Terminal-Bench 2.1 | 84,3 | 82,7 | 82,7 | 84,1 |
| AutomationBench | 48,8 | 54,8 | 44,2 | 45,7 |

Evaluaciones internas de fiabilidad:

| Métrica | Nex-N2.5-Pro | GLM-5.3-Flash | Nex-N2.6 |
|---|---:|---:|---:|
| Tasa de repetición en razonamiento (↓) | 16,0 % | 6,0 % | **1,6 %** |
| Tasa global de no repetición (↑) | 91,0 % | 96,2 % | **97,8 %** |
| Selección válida de herramientas, global (↑) | 82,2 % | 85,3 % | **100,0 %** |
| Selección válida de herramientas, con herramientas (↑) | 80,5 % | 84,1 % | **100,0 %** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~321B parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 321 GB, a lo que hay que sumar memoria para KV cache y overhead del runtime. Se requiere por tanto un nodo multi-GPU con al menos ~350-400 GB de memoria agregada en el escenario más ajustado, sin margen para contexto largo.
- GPU recomendadas: no especificadas por el autor. Por el tamaño, el despliegue realista pasa por GPUs de centro de datos con soporte FP8, como H100, H200 o B200, en configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, 24 GB) en FP8 sin paralelismo multi-dispositivo u otras técnicas de compresión no documentadas.
- Opciones de despliegue: SGLang es la vía oficial documentada (guía de despliegue de GLM-5.3-Flash en el cookbook de SGLang), con configuración compatible con FP8 y `--served-model-name Nex-N2.6`. Se debe conservar el tokenizer, processor y chat template incluidos con los pesos. Otros runtimes con soporte para GLM-5.3-Flash no están documentados en la información disponible.
- Latencia y throughput: no disponibles. La reducción de repetición en razonamiento (del 16,0 % al 1,6 %) sugiere una disminución del consumo de tokens en bucles agénticos, pero no se publican cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OSWorld | Terminal-Bench 2.1 | AutomationBench | Licencia |
|---|---|---|---|---|---|---|
| Nex-N2.6 | ~321B | no disponible | 83,0 | 84,1 | 45,7 | Apache 2.0 |
| Nex-N2.5-Pro | no disponible | no disponible | 82,2 | 82,7 | 44,2 | no disponible |
| GLM-5.3-Flash (base) | no disponible | no disponible | 78,0 | 84,3 | 48,8 | no disponible |
| DeepSeek-V4.1-Flash | no disponible | no disponible | 71,7 | 82,7 | 54,8 | no disponible |

Nex-N2.6 lidera en OSWorld y en las métricas internas de fiabilidad, pero queda por debajo de su modelo base en Terminal-Bench 2.1 (84,1 frente a 84,3) y de DeepSeek-V4.1-Flash en AutomationBench (45,7 frente a 54,8). Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados son resultados a nivel de modelo reportados por el propio equipo; no se ha evaluado de forma independiente esta exportación FP8, por lo que el rendimiento de los pesos cuantizados puede diferir del reportado.
- AutomationBench muestra un rendimiento moderado (45,7) e inferior al del modelo base (48,8) y al de DeepSeek-V4.1-Flash (54,8); conviene validar en el dominio concreto antes de desplegar en automatización de procesos.
- No se publican datos sobre sesgos, composición del dataset ni idiomas soportados, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de largo horizonte.
- El despliegue requiere infraestructura multi-GPU de centro de datos con soporte FP8; el tamaño del repositorio (328,4 GB) implica requisitos de almacenamiento y transferencia considerables.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia y condiciones del modelo base GLM-5.3-Flash, no detalladas en esta información.
- El modelo depende del chat template y del processor incluidos; sustituirlos puede alterar el comportamiento del tool calling y del modo de razonamiento.
- El repositorio tiene 0 descargas y 3 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nex-agi/Nex-N2.6
- Repositorio GitHub: https://github.com/sii-nex/Nex-N2.6
- API en OpenRouter: https://openrouter.ai/nex-agi/nex-n2.6
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Guía de despliegue en SGLang: https://github.com/sgl-project/sglang/blob/main/docs/cookbook/autoregressive/GLM/GLM-5.3-Flash.mdx
- Nex-N2.5-Pro (versión anterior): https://huggingface.co/nex-agi/Nex-N2.5-Pro
