# lightonai/colgrep-agent-2B

## Resumen

ColGrep-Agent-2B es un agente ligero de localización de código desarrollado por LightOn. Su función no es escribir parches ni generar código nuevo, sino identificar de forma precisa los ficheros y los rangos de líneas de un repositorio que resultan relevantes para una incidencia de GitHub, un informe de bug, una petición de funcionalidad o una pregunta en lenguaje natural sobre el código. Dado un enunciado como "where are retries configured?", el modelo busca de forma iterativa en el repositorio mediante la herramienta ColGrep, lee ficheros candidatos a través de un terminal de solo lectura y devuelve las ubicaciones exactas.

El modelo cuenta con aproximadamente 2.517 millones de parámetros (unos 2,52 B) y está afinado a partir de openbmb/MiniCPM5-2B, con arquitectura de tipo Llama según las etiquetas del repositorio. Se distribuye bajo licencia Apache-2.0, con pesos en safetensors en el repositorio principal y una versión GGUF (quantización por defecto Q8_0, de unos 2,5 GB) en un repositorio aparte. Está pensado para inferencia local práctica, con aceleración por GPU cuando está disponible y sin necesidad de Python, servidor de inferencia independiente ni clave de API.

Su relevancia actual radica en el patrón de delegación: en lugar de que un agente de programación grande consuma miles de tokens explorando el repositorio antes de hacer una corrección, puede delegar la localización del código en ColGrep-Agent-2B y recibir una lista acotada de ubicaciones. El modelo está entrenado mediante aprendizaje por refuerzo y se integra con Claude Code, Codex y OpenCode a través de hooks y skills instalables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tipo Llama (etiqueta `llama` en el repositorio); modelo base openbmb/MiniCPM5-2B |
| Parametros totales | 2.516.756.480 (aproximadamente 2,52 B, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 confirmado como cuantizacion por defecto del agente; otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio principal) y GGUF (repositorio lightonai/colgrep-agent-2B-GGUF) |

Otros datos del repositorio: tamano del repositorio de 5,0 GB, 64 descargas y 13 likes en el momento de la consulta, creado el 2026-10-03 y actualizado el 2026-10-11. Etiquetas relevantes: `text-generation`, `code`, `code-search`, `tool-use`, `reinforcement-learning`, `colgrep`, `conversational`, `text-generation-inference`, `endpoints_compatible`, `region:eu`.

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un transformer de arquitectura tipo Llama (etiqueta `llama`) afinado sobre openbmb/MiniCPM5-2B. No se detallan en la informacion proporcionada ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni el uso especifico de RLHF o DPO mas alla de la presencia de la etiqueta `reinforcement-learning`, que sugiere un entrenamiento con aprendizaje por refuerzo orientado a la tarea de agente.

La innovacion principal no reside en el backbone, sino en el diseno como agente de localizacion de codigo con un bucle de herramientas acotado: busqueda semantica mediante ColGrep, lectura de ficheros por terminal en modo solo lectura y una accion final `finish` que emite la respuesta estructurada. El modelo devuelve la salida en el formato `path/to/file:START-END`, lo que la hace consumible directamente por scripts y por otros agentes. La separacion de la salida es deliberada: el progreso del agente se imprime en stderr solo cuando se ejecuta en un terminal, mientras que stdout contiene unicamente las ubicaciones resultantes, lo que facilita la composicion con otras herramientas. Los detalles completos de arquitectura y entrenamiento se remiten al paper (arXiv:2610.05099), no incluido en la informacion proporcionada.

## Capacidades

- Localizacion de codigo: identifica ficheros y rangos de lineas relevantes para incidencias, informes de bug, peticiones de funcionalidad o preguntas en lenguaje natural sobre un repositorio.
- Uso de herramientas (tool calling): invoca busqueda semantica (ColGrep), comandos de terminal de solo lectura (`cat`, `sed`, etc.) y una accion de finalizacion.
- Razonamiento multi-paso / comportamiento de agente: ejecuta bucles iterativos de busqueda, lectura y refinamiento hasta reunir evidencia suficiente; en el ejemplo de la model card completa la tarea en 9 turnos, 2 busquedas y 6 comandos de terminal.
- Salida estructurada: formato `path/to/file:START-END`, directamente parseable, y modo JSON mediante `--json`.
- Acotado de busqueda por directorio y visualizacion de lineas coincidentes mediante la opcion `-c`.
- Integracion con agentes de programacion: hooks y skills para Claude Code, Codex y OpenCode.
- Indexacion incremental de repositorios: tras el indexado inicial, las busquedas detectan ficheros modificados y actualizan el indice antes de responder.
- Multilingue: limitado a ingles segun la informacion disponible.
- Capacidades especiales: modo agente integrado en la CLI `colgrep --agent`; no se documentan vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Delegacion desde agentes de programacion grandes: un agente como Claude Code o Codex puede ceder preguntas abiertas del tipo "where is this behavior implemented?" a ColGrep-Agent-2B y recibir rutas y rangos de lineas exactos, reservando su contexto y computo para comprender el problema, planificar cambios y generar parches.
- Triaje de incidencias en repositorios: dado un informe de bug o una issue de GitHub, el modelo localiza las zonas del codigo implicadas y las entrega como lista de ubicaciones para que un desarrollador o un sistema automatico las revise.
- Respuesta a preguntas sobre bases de codigo heredadas: preguntas como "where are retries configured?" o "why does the export crash on empty files?" se resuelven localizando la logica relevante sin que la persona que pregunta conozca la estructura del repositorio.
- Integracion en pipelines de CI/CD: la salida en formato `path/to/file:START-END` y el modo `--json` permiten conectar el modelo a herramientas de analisis, etiquetado automatico de issues o enrutado de revisiones hacia los responsables de los ficheros afectados.
- Asistencia en el IDE o en la terminal: ejecucion local mediante `colgrep --agent`, sin Python, sin servidor de inferencia ni clave de API, adecuada para flujos de trabajo en maquina de desarrollo.
- Analisis de impacto previo a un cambio: localizar todas las zonas relevantes a una funcionalidad antes de modificarla, para acotar el alcance de un refactor o de una correccion.
- Generacion de contexto para modelos mayores: construir un contexto compacto y verificado (ficheros y lineas concretas) que se inyecta en un modelo de mayor tamano, reduciendo el coste de tokens en tareas posteriores.
- Automatizacion de documentacion interna: identificar donde esta implementada una funcionalidad para enlazar codigo y documentacion o para responder consultas recurrentes del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de localizacion de codigo; unicamente describe un ejemplo cualitativo de sesion sobre el propio codigo fuente de ColGrep, ejecutado en un M3 Pro con aceleracion Metal, que devuelve 5 ubicaciones en 9 turnos, 2 busquedas y 6 comandos de terminal en 21,7 segundos. Los resultados cuantitativos, si existen, se remiten al paper arXiv:2610.05099, no incluido en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del numero de parametros, no publicadas por el autor):
  - GGUF Q8_0 (cuantizacion por defecto, ~2,5 GB de fichero): aproximadamente 4-5 GB de VRAM o memoria unificada en la practica, considerando el contexto y el prompt cache.
  - GGUF Q4 (no confirmada en la informacion): aproximadamente 2-3 GB.
  - Pesos completos en safetensors (~5 GB de repositorio): alrededor de 5-6 GB en precision de 16 bits.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer moderna con al menos 6-8 GB de VRAM resulta suficiente para la cuantizacion Q8_0; GPU de datacenter (A100, H100) no son necesarias para este modelo.
- Compatibilidad con GPU consumer: si, cabe holgadamente en tarjetas de gama media y alta (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) y en equipos Apple Silicon con memoria unificada. El autor confirma ejecucion en un M3 Pro con aceleracion Metal.
- Opciones de despliegue: CLI `colgrep` con el modelo GGUF integrado (instalacion via Homebrew, script de shell, PowerShell o Cargo) y despliegue via transformers con safetensors. Las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`. No se mencionan explicitamente vLLM, llama.cpp directo u Ollama, aunque el formato GGUF hace viable su uso con runtimes compatibles.
- Latencia y throughput: en el ejemplo publicado, 21,7 segundos para completar una tarea de localizacion de 9 turnos y 6 comandos de terminal en un M3 Pro. No se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lightonai/colgrep-agent-2B | ~2,52 B | no disponible | Localizacion de codigo (agente) | apache-2.0 | safetensors + GGUF |
| openbmb/MiniCPM5-2B (modelo base) | no disponible | no disponible | Generacion de texto general | no disponible | no disponible |
| Otros agentes ligeros de localizacion de codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados comparativos ni especificaciones de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa rigurosa. Cabe destacar que ColGrep-Agent-2B compite en una categoria especifica, la localizacion de codigo delegada, mas que en generacion de codigo generalista.

## Limitaciones y advertencias

- Idiomas: el modelo esta entrenado y documentado unicamente para ingles (`language: en`). Su comportamiento con repositorios, enunciados o comentarios en otros idiomas no esta garantizado.
- Especializacion estrecha: no es un modelo de proposito general. Su funcion es localizar codigo, no generar parches, refactorizar ni resolver tareas de programacion completas. Usarlo fuera de ese ambito dara resultados pobres.
- Dependencia de herramientas: el modelo asume la disponibilidad de un terminal de solo lectura y del indice de busqueda de ColGrep. Sin ese entorno, la tarea no puede ejecutarse correctamente.
- Riesgo de alucinacion: como cualquier modelo generativo, puede devolver rutas o rangos de lineas que no se correspondan con el contenido real del repositorio, especialmente en bases de codigo grandes, muy dinamicas o con estructuras poco convencionales. La validacion de las ubicaciones devueltas es recomendable en flujos automatizados.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible. Los sesgos derivados del corpus de codigo y del modelo base MiniCPM5-2B no estan caracterizados en la model card facilitada.
- Limitaciones de contexto: la longitud de contexto no esta publicada en la informacion disponible, lo que dificulta planificar tareas sobre repositorios muy grandes o conversaciones largas.
- Indexacion: el rendimiento depende de que el indice del repositorio este actualizado; en repositorios con cambios frecuentes puede requerir reindexaciones.
- Licencia: Apache-2.0, permisiva y compatible con uso comercial. No se indica en la informacion disponible ninguna restriccion adicional, pero conviene verificar la licencia del modelo base y de las dependencias (ColGrep, llama.cpp y componentes asociados) antes de un despliegue en produccion.
- Madurez: el modelo tiene un volumen bajo de descargas (64) y fue actualizado por ultima vez el 2026-10-11, por lo que su adopcion en produccion es todavia limitada y no hay un historial extenso de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/colgrep-agent-2B
- Repositorio GGUF: https://huggingface.co/lightonai/colgrep-agent-2B-GGUF
- Paper: https://arxiv.org/abs/2610.05099
- Blog post: https://huggingface.co/blog/lightonai/colgrep-agent/
- GitHub (next-plaid / ColGrep): https://github.com/lightonai/next-plaid
- Documentacion de ColGrep: https://github.com/lightonai/next-plaid/tree/main/colgrep
- Modo agente de ColGrep: https://github.com/lightonai/next-plaid/tree/main/colgrep#agent-mode---agent
- Web de LightOn: https://lighton.ai
- LinkedIn: https://www.linkedin.com/company/lighton/
- X: https://x.com/LightOnIO
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
