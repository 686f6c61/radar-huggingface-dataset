# RedHatAI/DeepSeek-V4-Flash-0731

## Resumen

DeepSeek-V4-Flash-0731 es la versión oficial de DeepSeek-V4-Flash, que sustituye a la versión preview e incorpora mejoras sustanciales en capacidades agénticas. El modelo lo desarrolla DeepSeek AI, aunque el repositorio analizado aquí (RedHatAI/DeepSeek-V4-Flash-0731) es una publicación derivada en FP8/8-bit de 166,9 GB. Se trata de un modelo de mezcla de expertos (MoE) disperso de la familia DeepSeek-V4, con 304.180.418.494 parámetros totales según los metadatos de safetensors, de los cuales alrededor de 13.000 millones estarían activos por token según fuentes de terceros.

El modelo comparte estructura con DeepSeek-V4-Flash-DSpark, es decir, incluye un módulo de decodificación especulativa acoplado al checkpoint principal. Su relevancia actual radica en que supera a DeepSeek-V4-Pro (Preview) en todos los benchmarks publicados por el autor pese a activar muchos menos parámetros, y se sitúa cerca de modelos propietarios de referencia como Opus-4.8 en tareas de agente, código y uso de herramientas.

La ventana de contexto citada por fuentes externas es de hasta 1 millón de tokens y la licencia es MIT, lo que permite uso comercial sin restricciones documentadas. El modelo está orientado a flujos agénticos, generación de código y razonamiento multi-paso, con tres niveles configurables de esfuerzo de razonamiento (low, high, max).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos dispersa (MoE), familia DeepSeek-V4 (tag `deepseek_v4`) |
| Parametros totales | 304.180.418.494 (~304B) según metadatos de safetensors del repositorio; fuentes de terceros citan 284B |
| Parametros activos | ~13.000 millones por token (dato de terceros, no confirmado en la model card) |
| Longitud de contexto | 1.000.000 tokens según fuentes de terceros; no confirmado en la model card |
| Tipos de cuantizacion | FP8 / 8-bit en este repositorio; no se documentan otros formatos (no hay GGUF disponible) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos dispersa, etiquetado como `deepseek_v4`, que activa únicamente una fracción de los expertos por token (del orden de 13.000 millones de parámetros activos sobre más de 284.000 millones totales, según fuentes externas). El checkpoint incluye un módulo de decodificación especulativa DSpark integrado: en inferencia, el mismo checkpoint sirve como modelo objetivo y como modelo borrador, de modo que no hace falta cargar un draft model separado.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se indica que esta revisión es una "re-post-trained revision" orientada a flujos de trabajo de código, razonamiento y agentes, con un incremento muy marcado del rendimiento agéntico respecto a la preview (por ejemplo, DeepSWE pasa de 7,3 a 54,4 y Cybergym de 38,7 a 76,7). El modelo no incluye plantilla de chat en formato Jinja: el autor distribuye una carpeta `encoding` con scripts Python para convertir mensajes en formato compatible con OpenAI a cadenas de entrada y para parsear la salida. El parámetro `reasoning_effort` admite tres niveles: `low`, `high` y `max`.

## Capacidades

- Generación de texto y razonamiento multi-paso con nivel de deliberación configurable (`low`, `high`, `max`).
- Modo de pensamiento explícito: la estructura de mensajes separa `content` y `reasoning_content`.
- Generación y edición de código en contextos de agente, con resultados destacados en Terminal Bench 2.1, NL2Repo y DeepSWE.
- Uso de herramientas y function calling (etiqueta `endpoints_compatible` en el repositorio y soporte de `tool_calling` en la receta de vLLM).
- Flujos agénticos de varios pasos: el modelo está evaluado con DeepSeek Harness en modo minimal, lo que implica planificación, ejecución de comandos y resolución de tareas.
- Tareas de ciberseguridad ofensiva/defensiva evaluadas en Cybergym.
- Automatización de tareas de oficina y flujos estructurados (AutomationBench Public, Toolathlon-Verified).
- Desarrollo full-stack y resolución de problemas de código difíciles (DSBench-FullStack y DSBench-Hard, conjuntos internos).
- Decodificación especulativa DSpark activable en servidores (7 tokens especulativos, borrador con muestreo greedy), que no es una capacidad del modelo sino una optimización de inferencia.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de código autónomos: el modelo puede operar sobre un repositorio, ejecutar comandos en terminal y cerrar tareas de extremo a extremo, como refleja su puntuación de 82,7 en Terminal Bench 2.1 y 54,4 en DeepSWE. Es adecuado para pipelines de CI/CD donde un agente debe inspeccionar fallos, proponer parches y validarlos.
- Migración y generación de repositorios completos: con 54,2 en NL2Repo, encaja en herramientas que traducen una especificación en lenguaje natural a un esqueleto de proyecto funcional, con estructura de ficheros, tests y configuración.
- Asistentes de desarrollo full-stack: el conjunto interno DSBench-FullStack (68,7) apunta a tareas que cruzan backend, frontend y base de datos; se usaría como agente dentro del IDE o como servicio detrás de una CLI de desarrollo.
- Automatización de operaciones con herramientas externas: sus 70,3 en Toolathlon-Verified lo sitúan como candidato para orquestadores que encadenan API, hojas de cálculo y sistemas de tickets mediante function calling.
- Análisis de seguridad y respuesta a incidentes: con 76,7 en Cybergym puede emplearse en triaje de vulnerabilidades, generación de pruebas de concepto en entorno controlado y redacción de informes técnicos.
- Atención al cliente técnica multi-turno: la ventana de contexto de hasta 1M tokens (según terceros) permitiría mantener historiales largos de incidencias, documentación interna y estado de cuenta en una sola conversación.
- Revisión de código a gran escala: el contexto largo facilita analizar diferencias que abarcan varios ficheros y mantener coherencia entre módulos durante una revisión.
- Razonamiento con presupuesto de cómputo ajustable: el parámetro `reasoning_effort` permite usar `low` en tareas de clasificación o extracción y `max` en problemas de planificación, ajustando coste y latencia por petición.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | V4-Flash-0731 | V4-Flash (Preview) | V4-Pro (Preview) | GLM-5.2 | Opus-4.8 |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 82,7 | 61,8 | 72,1 | 81,0 | 85,0 |
| NL2Repo | 54,2 | 39,4 | 38,5 | 48,9 | 69,7 |
| Cybergym | 76,7 | 38,7 | 52,7 | - | 83,1 |
| DeepSWE | 54,4 | 7,3 | 12,8 | 46,2 | 58,0 |
| Toolathlon-Verified | 70,3 | 49,7 | 55,9 | 59,9 | 76,2 |
| Agents' Last Exam | 25,2 | 15,8 | 16,5 | 23,8 | 25,7 |
| AutomationBench Public | 25,1 | 10,8 | 12,8 | 12,9 | 27,2 |
| DSBench-FullStack † | 68,7 | 37,0 | 41,8 | 61,8 | 71,6 |
| DSBench-Hard † | 59,6 | 25,8 | 31,1 | 54,5 | 71,7 |

Notas del autor: las tareas de agente de código se evaluaron con el modo minimal de DeepSeek Harness (pendiente de publicación) como framework, con nivel de esfuerzo `max` y `temperature = 1.0, top_p = 0.95`. DSBench-FullStack y DSBench-Hard son conjuntos internos, no públicos ni verificables de forma independiente.

## Requisitos de hardware

- Tamaño de pesos: 166,9 GB en el repositorio (FP8/8-bit). Es el mínimo de memoria necesario solo para los pesos, sin caché KV ni activaciones.
- Configuración de referencia del autor: un nodo de 4×GB300 sirviendo con vLLM, con `--data-parallel-size 4`, `--enable-expert-parallel`, backend `deep_gemm_mega_moe`, caché KV en FP8, `--block-size 256` y caché de índice en FP4.
- GPU recomendadas: GB300 (documentada). No se detallan otras configuraciones en la información disponible; por tamaño, se requeriría un nodo multi-GPU de clase datacenter (H100/H200/B200 o superior) con paralelismo de expertos.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) no puede alojar los pesos ni una fracción significativa de los expertos; no se documenta ningún modo de offload a CPU/RAM.
- Caché KV: con ventana de hasta 1M tokens, la caché KV en FP8 puede superar con holgura el tamaño de los pesos, por lo que la memoria agregada del nodo es el factor limitante real.
- Opciones de despliegue: vLLM (`--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'`) y SGLang (`--speculative-algorithm DSPARK`, sin `--speculative-draft-model-path`). No hay soporte documentado de llama.cpp, Ollama ni GGUF para este repositorio.
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark con 7 tokens por paso está pensada para reducir la latencia de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento agéntico |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 | ~304B totales (metadatos), ~13B activos (terceros) | 1M tokens (terceros) | MIT | Pesos abiertos en HuggingFace, API en Fireworks y DeepInfra | Terminal Bench 2.1: 82,7; DeepSWE: 54,4; Toolathlon: 70,3 |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | no disponible | Terminal Bench 2.1: 72,1; DeepSWE: 12,8; Toolathlon: 55,9 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 2.1: 81,0; DeepSWE: 46,2; Toolathlon: 59,9 |
| Opus-4.8 | no disponible | no disponible | propietaria | API cerrada | Terminal Bench 2.1: 85,0; DeepSWE: 58,0; Toolathlon: 76,2 |

La comparación se limita a los benchmarks publicados por DeepSeek; no se dispone de parámetros, contexto ni licencia de las alternativas en la información proporcionada. Frente a Opus-4.8, el modelo queda por debajo en todas las tareas salvo Agents' Last Exam (25,2 frente a 25,7, prácticamente empatados), pero ofrece pesos abiertos bajo MIT.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no incluye ninguna sección de sesgos, evaluación de toxicidad ni consideraciones de seguridad.
- Riesgo de alucinación: no cuantificado por el autor. En tareas agénticas de código el riesgo se traslada a ejecución de comandos incorrectos o parches inválidos, por lo que se recomienda sandboxing.
- Idiomas soportados: no disponible. No hay evaluación multilingüe publicada; no se debe asumir cobertura amplia fuera del inglés.
- Contexto: la cifra de 1M tokens proviene de fuentes de terceros, no de la model card oficial. No se ha verificado el rendimiento real en longitudes cercanas a ese límite.
- Discrepancia en parámetros: los metadatos de safetensors indican ~304B parámetros, mientras que fuentes de terceros citan 284B totales y 13B activos. No hay confirmación oficial de ninguna de las dos cifras en la model card.
- Benchmarks internos: DSBench-FullStack y DSBench-Hard no son públicos, y las tareas de agente se evaluaron con un framework (DeepSeek Harness) aún no publicado, lo que dificulta la reproducción independiente.
- Sin plantilla de chat Jinja: la integración requiere usar los scripts de la carpeta `encoding`; las herramientas que esperan una plantilla estándar de `transformers` pueden fallar.
- Coste de despliegue: requiere un nodo multi-GPU de clase datacenter (4×GB300 en la configuración documentada) y no es viable en hardware de consumo.
- Licencia: MIT permite uso comercial, modificación y redistribución sin restricciones documentadas, pero conviene verificar la licencia del checkpoint original de DeepSeek AI, ya que este repositorio es una publicación derivada de RedHatAI.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fecha de creación posterior a la de otras publicaciones del ecosistema; no hay validación de la comunidad sobre esta conversión concreta.

## Enlaces

- Repositorio analizado (RedHatAI): https://huggingface.co/RedHatAI/DeepSeek-V4-Flash-0731
- Repositorio oficial (DeepSeek AI): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Carpeta de inferencia del repositorio oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/tree/main/inference
- Modelo relacionado DeepSeek-V4-Flash-DSpark: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Receta de vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash?hardware=b300&features=tool_calling,reasoning
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4
- Sitio de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- API en Fireworks AI: https://fireworks.ai/models/deepseek-ai/deepseek-v4-flash-0731
- API en DeepInfra: https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-0731/api
- Ficha de terceros con especificaciones: https://aimodelradar.app/models/deepseek-v4-flash-0731
