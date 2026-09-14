# djkwade/hug-2

## Resumen

DeepSeek-V4-Pro-0813 es un modelo de lenguaje de gran escala publicado por DeepSeek AI, presentado en su model card como la version oficial que sustituye a la version preview de DeepSeek-V4-Pro. Segun el autor, la mejora principal frente a la preview se concentra en capacidades agenticas y de ejecucion en entornos de produccion, con un modulo de decodificacion especulativa denominado DSpark acoplado a la estructura del modelo base. El repositorio consultado en HuggingFace es `djkwade/hug-2`, un mirror de terceros con cero descargas y cero likes, cuyo README reproduce integramente la model card de `deepseek-ai/DeepSeek-V4-Pro-0813`.

El modelo es de tipo Mixture of Experts (MoE), como se deduce del uso de `--enable-expert-parallel` y del backend `deep_gemm_mega_moe` en los comandos de despliegue documentados. Los pesos publicados en safetensors suman 1.650.497.936.906 parametros totales (aproximadamente 1,65 billones), lo que lo situa en la categoria de modelos frontera. El repositorio ocupa 892,8 GB y esta etiquetado con cuantizacion de 8 bits y fp8. La longitud de contexto y los parametros activos no se indican en la informacion disponible.

La relevancia actual del modelo radica en su enfoque explicito hacia tareas de agente: los benchmarks que reporta el autor cubren uso de terminal, resolucion de repositorios, desarrollo full-stack, ciberseguridad y uso de herramientas, y se comparan contra modelos propietarios de referencia. El modelo se distribuye bajo licencia MIT y soporta despliegue en vLLM y SGLang, con soporte nativo de decodificacion especulativa DSpark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture of Experts (tag `deepseek_v4` en HuggingFace) |
| Parametros totales | 1.650.497.936.906 (1,65 B) segun safetensors |
| Parametros activos | MoE; no disponible el numero exacto de parametros activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit, fp8 (tags de HuggingFace); kv-cache en fp8 segun ejemplo de despliegue |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 892,8 GB |
| Chat template | No incluye plantilla Jinja; se proporciona una carpeta `encoding` con scripts Python para codificar mensajes en formato compatible con OpenAI |
| Niveles de esfuerzo de razonamiento | `low`, `high`, `max` (parametro `reasoning_effort`) |

## Arquitectura y entrenamiento

La informacion disponible describe unicamente la estructura de alto nivel: se trata de un modelo construido sobre la estructura de DeepSeek-V4-Pro (Preview) al que se anade un modulo de decodificacion especulativa llamado DSpark. El uso de `--enable-expert-parallel` y del backend `deep_gemm_mega_moe` en los comandos de vLLM confirma una arquitectura MoE con enrutado por expertos, pero no se detalla el numero de expertos, el ratio de activacion ni el mecanismo de atencion empleado. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento.

La innovacion tecnica mas destacada en la informacion disponible es DSpark, un esquema de decodificacion especulativa que se activa en vLLM mediante `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'` y en SGLang con `--speculative-algorithm DSPARK`, sin necesidad de configurar un modelo borrador independiente. Ademas, la plantilla de mensajes no se distribuye como Jinja, sino como scripts Python en la carpeta `encoding`, con soporte para los modos `thinking` y el parametro `reasoning_effort` de tres niveles.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito (`thinking_mode="thinking"`) y control del esfuerzo de razonamiento en tres niveles: `low`, `high` y `max`.
- Razonamiento asistido por herramientas: el benchmark HLE reporta 42,7 sin herramientas y 60,0 con herramientas, lo que evidencia integracion de uso de herramientas en el proceso de razonamiento.
- Capacidades agenticas de terminal: evaluado en Terminal Bench 2.1 con 87,9, lo que implica ejecucion de comandos y operacion en entornos de shell.
- Generacion de codigo y resolucion de repositorios: evaluado en NL2Repo (61,5) y en los conjuntos internos DSBench-FullStack (71,1) y DSBench-Hard (67,2).
- Uso de herramientas y function calling: evaluado en Toolathlon-Verified con 74,1.
- Tareas de ciberseguridad ofensiva/defensiva: evaluado en Cybergym con 83,3.
- Razonamiento multi-paso y tareas de agente de larga duracion: evaluado en Agents' Last Exam (25,7) y AutomationBench Public (31,8).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Agente de codigo autonomo en produccion: el modelo esta evaluado en Terminal Bench 2.1 y DeepSWE, por lo que puede integrarse en pipelines que clonan repositorios, ejecutan tests y aplican parches de forma iterativa, con el modo `max` de `reasoning_effort` para tareas complejas.
- Desarrollo full-stack asistido: con 71,1 en DSBench-FullStack, es adecuado para generar y modificar aplicaciones completas a partir de descripciones en lenguaje natural, incluyendo backend, frontend y configuracion de despliegue.
- Automatizacion de operaciones en terminal: el rendimiento en Terminal Bench 2.1 lo hace util para agentes que administran servidores, depuran fallos de build o automatizan tareas de administracion de sistemas mediante shell.
- Auditoria de seguridad y modelado de amenazas: los 83,3 en Cybergym sugieren uso en analisis de vulnerabilidades, generacion de exploits de prueba en entornos controlados y validacion de mitigaciones.
- Asistentes con uso intensivo de herramientas externas: los 74,1 en Toolathlon-Verified indican que puede orquestar APIs, bases de datos y servicios externos mediante function calling en flujos multi-paso.
- Generacion de codigo dentro de CI/CD: dado que soporta tool calling y formato compatible con endpoints OpenAI, puede conectarse a sistemas de revision de codigo, generacion de tests y documentacion automatica en cada pull request.
- Investigacion y razonamiento cientifico-tecnico con apoyo de herramientas: los 60,0 en HLE con herramientas lo orientan a tareas de resolucion de problemas donde el modelo delega calculo y busqueda en utilidades externas.
- Automatizacion de flujos empresariales de larga duracion: el rendimiento en AutomationBench Public (31,8) y Agents' Last Exam (25,7) apunta a su uso en orquestacion de procesos con multiples pasos y estado persistente, aunque con margen de mejora respecto a los modelos de referencia.

## Benchmarks y rendimiento

Datos reportados en la model card del autor. No se han publicado resultados de benchmarks independientes en la informacion disponible.

| Benchmark | V4-Pro-0813 | V4-Flash-0731 | V4-Pro (Preview) | V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (con fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas de la model card: en las tareas de agente de codigo de los benchmarks publicos, el modelo se evalua con el modo minimal de DeepSeek Harness como framework de agente, con `max` de esfuerzo de razonamiento y `temperature = 1.0`, `top_p = 0.95`. DSBench-FullStack y DSBench-Hard son conjuntos de test internos del desarrollador.

## Requisitos de hardware

- VRAM estimada para inferencia: a 1,65 B de parametros en fp8, los pesos ocuparian del orden de 1,65 TB, a lo que hay que sumar la cache KV (tambien en fp8 en la configuracion documentada). No se dispone de cifras oficiales de VRAM.
- Nota sobre el tamano: el repositorio consultado ocupa 892,8 GB, por debajo de lo que requeriria almacenar 1,65 B de parametros en 8 bits. Es probable que el mirror no contenga la totalidad de los pesos o que estos esten en un formato de compresion adicional.
- Configuracion de referencia del autor: un unico nodo de 4xGB300 con vLLM, `--data-parallel-size 4`, expert parallelism activado y `--block-size 256`.
- GPU recomendadas: la model card solo menciona explicitamente 4xGB300. No se documentan configuraciones para A100, H100 ni RTX 4090.
- GPU de consumo: no es viable en GPUs de consumo. El modelo no cabe en una RTX 4090 (24 GB) ni en configuraciones multi-GPU de gama alta para consumidores; requiere un nodo de clase centro de datos.
- Opciones de despliegue: vLLM (con `--trust-remote-code`, backend `deep_gemm_mega_moe`, `use_fp4_indexer_cache` en la configuracion de atencion) y SGLang (`--speculative-algorithm DSPARK`). El autor publica una receta de vLLM con configuraciones adicionales de hardware.
- Decodificacion especulativa: DSpark se activa con `num_speculative_tokens: 7` y `draft_sample_method: greedy` en vLLM.
- Latencia y throughput: no disponibles. El autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento (referencia) |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65 B (MoE) | no disponible | MIT | Pesos abiertos en HuggingFace (mirror de terceros) | HLE 42,7/60,0; Terminal Bench 2.1 87,9 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | HLE 37,8/51,5; Terminal Bench 2.1 82,7 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | HLE 43,5/56,0; Terminal Bench 2.1 88,3 |
| Opus-4.8 | no disponible | no disponible | Propietaria | Solo API | HLE 49,8/57,9; NL2Repo 69,7 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | HLE 40,5/54,7; DeepSWE 46,2 |

Los parametros, la longitud de contexto y las condiciones de licencia del resto de modelos comparados no se detallan en la informacion proporcionada, por lo que la comparacion se limita a los resultados de benchmark recogidos en la model card.

## Limitaciones y advertencias

- El repositorio analizado es `djkwade/hug-2`, un mirror de terceros con 0 descargas y 0 likes, no el repositorio oficial de DeepSeek AI. Los pesos pueden estar incompletos, modificados o desactualizados, y el tamano del repositorio (892,8 GB) no cuadra con los 1,65 B de parametros en 8 bits.
- Los numeros de benchmark son autodeclarados por el desarrollador. No se ha localizado evaluacion independiente en la informacion disponible.
- Parte de los resultados (DSBench-FullStack, DSBench-Hard) provienen de conjuntos de test internos del desarrollador, no de benchmarks publicos verificables.
- El modelo no incluye plantilla de chat en formato Jinja; es necesario usar los scripts de la carpeta `encoding` para formatear entradas y parsear salidas, lo que anade complejidad de integracion frente a modelos con tokenizer y template estandar.
- No se especifican los idiomas soportados, por lo que no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con documentos o conversaciones largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Licencia MIT: permite uso comercial y modificacion, pero el copyright y la atribucion corresponden al desarrollador original; conviene verificar la procedencia de los pesos de este mirror antes de usarlos en produccion.
- Los requisitos de hardware son muy elevados (nodo de 4xGB300 en la configuracion de referencia), lo que limita el despliegue a infraestructura de centro de datos.
- El rendimiento en tareas de agente de larga duracion es mejorable: 25,7 en Agents' Last Exam y 31,8 en AutomationBench Public, por debajo de varios de los modelos comparados.

## Enlaces

- Repositorio de HuggingFace analizado: https://huggingface.co/djkwade/hug-2
- Informe tecnico citado (arXiv:2606.19348): https://arxiv.org/abs/2606.19348
- Web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Twitter del desarrollador: https://twitter.com/deepseek_ai
- Receta de despliegue en vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
