# Regi655/zimbra-helper-GGUF

## Resumen

`zimbra-helper-GGUF` es un modelo de lenguaje de 1.942.653.248 parametros (aproximadamente 1,9 mil millones), publicado por el usuario Regi655, que consiste en un fine-tuning mediante LoRA del modelo base Qwen/Qwen3.5-2B. Su proposito es responder preguntas sobre Zimbra, la suite open source de correo y colaboracion, orientado a usuarios que migran desde Microsoft Outlook, Exchange o Gmail. El modelo se distribuye unicamente en formato GGUF cuantizado Q4_K_M y esta disenado para ejecutarse en local, incluso solo con CPU.

La caracteristica tecnica mas relevante es que el modelo no ha memorizado la documentacion de Zimbra: esta entrenado para leer extractos de documentacion que se le pasan en el prompt (patron RAG) y responder exclusivamente a partir de ellos, con pasos numerados y nombres exactos de menus, o admitir que no lo sabe. Sin extractos en el contexto tiende a inventar menus y comandos, por lo que su uso correcto exige un pipeline de recuperacion previa. En la aplicacion de referencia (Zimbo) los extractos provienen de una busqueda semantica con Snowflake Arctic Embed L v2.0 sobre 3.101 fragmentos de 7 guias oficiales de Zimbra 9/10.

El modelo esta pensado como motor de un asistente de escritorio offline llamado Zimbo, disponible para Linux y Windows, que se apoya en Ollama. Su licencia Apache 2.0 y su reducido consumo de memoria (aproximadamente 1,4 GB de VRAM con contexto de 4.096 tokens) lo hacen adecuado para despliegues en hardware modesto. Es relevante ahora por la combinacion de tamano pequeno, enfoque RAG estricto y ejecucion totalmente offline, un patron cada vez mas comun para asistentes de documentacion tecnica especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con fine-tuning LoRA; encoder visual eliminado |
| Parametros totales | 1.942.653.248 (aproximadamente 1,9 mil millones, solo parte textual) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuracion recomendada de entrenamiento y uso) |
| Tipos de cuantizacion | Q4_K_M (unico publicado) |
| Idiomas soportados | Italiano (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`zimbra-helper.gguf`, aproximadamente 1,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B (revision de Unsloth `fffbc0d8711cf87df6d1f97938c5e50ef94aadc7`), un transformer decoder-only de aproximadamente 1,9 mil millones de parametros en su parte textual, al que se le ha eliminado el encoder visual. Sobre esa base se aplico un fine-tuning LoRA de rango 32 y alpha 32 sobre las capas de atencion y MLP, con 21,8 millones de parametros entrenados (0,98% del total), 2 epocas, learning rate 1e-4 con scheduler cosine y batch efectivo de 16. La loss se calculo unicamente sobre las respuestas. El entrenamiento se realizo con Unsloth en una RTX 3070 Ti de 8 GB en aproximadamente 30 minutos.

El dataset consta de 2.287 ejemplos de entrenamiento y 107 de validacion en formato RAG: un mensaje de sistema que define el rol de asistente de migracion a Zimbra, cuatro extractos numerados de la documentacion (cada uno precedido de guia y ruta de titulos) y la pregunta del usuario. Todas las respuestas del dataset fueron generadas por un modelo open ejecutado en local. El modelo se entreno con el modo de razonamiento (thinking) de Qwen3.5 desactivado, y se recomienda usarlo igual, con `--think=false` o `enable_thinking` desactivado.

## Capacidades

- Generacion de texto conversacional especializado en documentacion de Zimbra 9/10.
- Respuesta fundamentada en extractos de documentacion proporcionados en el prompt (RAG estricto), con instruccion explicita de no inventar menus, opciones ni comandos.
- Produccion de procedimientos con pasos numerados y nombres exactos de menus y opciones.
- Reproduccion literal de comandos de administracion (por ejemplo `zmprov`, `zmcontrol`) tal como aparecen en la documentacion.
- Comparacion con el equivalente en Outlook/Gmail cuando resulta util.
- Capacidad de admitir desconocimiento y sugerir donde buscar cuando los extractos no contienen la respuesta.
- Multilingue limitado: italiano como idioma principal e ingles.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes ni razonamiento multi-paso autonomo; el modo thinking debe permanecer desactivado.
- Sin capacidades de vision, audio ni otras modalidades (encoder visual eliminado).
- No ejecuta acciones sobre el servidor ni la cuenta del usuario: solo explica como realizarlas.

## Casos de uso

- Asistente de escritorio offline para migracion a Zimbra: es el caso de uso nativo del modelo, integrado en Zimbo, que combina busqueda semantica sobre 3.101 fragmentos de 7 guias oficiales con este modelo como generador de respuestas. Funciona en Linux y Windows sin conexion tras la instalacion.
- Soporte de helpdesk interno sobre Zimbra: el modelo puede responder consultas de usuarios finales ("donde se configura la firma", "como activar la respuesta automatica") a partir de extractos de la guia de usuario, reduciendo el volumen de tickets repetitivos.
- Asistencia a administradores de sistemas: explicacion de procedimientos de administracion con comandos exactos (`zmprov`, `zmcontrol`) extraidos de la documentacion, util para equipos que migran desde Exchange.
- Base para un chatbot RAG de documentacion tecnica: el patron de entrenamiento (extractos numerados con guia y ruta de titulos, respuesta solo sobre el contexto) es reutilizable para otras suites o productos con documentacion estructurada, sustituyendo el corpus y reentrenando el LoRA.
- Generacion de guias de migracion personalizadas: el modelo puede redactar comparativas paso a paso entre Outlook/Gmail y Zimbra, utiles para material de formacion interno.
- Despliegue en entornos con hardware limitado o air-gapped: con aproximadamente 1,4 GB de VRAM en Q4_K_M y ejecucion viable solo con CPU (aproximadamente 28 token/s en un Intel i7-12700K), es apto para equipos de oficina sin GPU o con requisitos de confidencialidad que impiden usar servicios en la nube.
- Prototipado rapido de asistentes especializados: el bajo coste de entrenamiento (unos 30 minutos en una RTX 3070 Ti) permite iterar sobre el corpus y el formato de prompt con facilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Velocidad en RTX 3070 Ti | Aproximadamente 200 token/s |
| Velocidad en CPU Intel i7-12700K | Aproximadamente 28 token/s |
| VRAM con contexto de 4.096 tokens | Aproximadamente 1,4 GB |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,4 GB con contexto de 4.096 tokens en cuantizacion Q4_K_M.
- GPU recomendadas: RTX 3070 Ti (velocidad medida de aproximadamente 200 token/s); cualquier GPU consumer con 2 GB o mas de VRAM es suficiente. No se requieren A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna; tambien funciona solo con CPU (aproximadamente 28 token/s en un Intel i7-12700K).
- Opciones de despliegue: Ollama (via `ollama pull hf.co/Regi655/zimbra-helper-GGUF` o creando el modelo con el `Modelfile` incluido), llama.cpp y otros runtimes compatibles con GGUF.
- Parametros de inferencia recomendados: temperatura 0,3, top_p 0,9, num_ctx 4.096 y thinking desactivado (`--think=false` en CLI, `"think": false` en la API de Ollama, `enable_thinking` desactivado en el template).
- Latencia y throughput: aproximadamente 200 token/s en RTX 3070 Ti y aproximadamente 28 token/s en CPU Intel i7-12700K, segun mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| zimbra-helper-GGUF | 1,9 B (texto) | 4.096 | it, en | Apache 2.0 | GGUF Q4_K_M | RAG especializado en Zimbra |
| Qwen/Qwen3.5-2B (base) | 1,9 B (texto) | no disponible | no disponible | no disponible | safetensors, GGUF | Modelo generalista |
| Modelos generalistas de 2-3 B (por ejemplo, variantes pequenas de Qwen o Llama) | 2-3 B | variable | multilingue | variable | safetensors, GGUF | Proposito general, sin especializacion |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es la especializacion en el formato RAG de Zimbra, el ajuste del comportamiento (no inventar, pasos numerados, comandos literales) y la eliminacion del encoder visual, que reduce el peso y el consumo.

## Limitaciones y advertencias

- Sin extractos de documentacion en el contexto, el modelo tiende a inventar menus y comandos; su uso correcto exige un pipeline RAG.
- El modelo no ha memorizado la documentacion de Zimbra; no debe usarse como fuente de conocimiento por si solo.
- Cobertura linguistica limitada a italiano (principal) e ingles; el rendimiento en castellano no esta documentado.
- Contexto maximo de 4.096 tokens, lo que limita el numero y tamano de los extractos incluidos en el prompt.
- Entrenado con thinking desactivado; activar el modo de razonamiento de Qwen3.5 puede degradar la calidad de las respuestas.
- Dataset de entrenamiento pequeno (2.287 ejemplos) y generado por un modelo open en local, con el riesgo de sesgos y errores heredados de ese generador.
- Riesgo de alucinacion en nombres de menus, rutas y comandos cuando los extractos son ambiguos o incompletos.
- El modelo no ejecuta acciones sobre el servidor ni la cuenta del usuario; solo describe procedimientos.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias ni evaluaciones independientes de calidad.
- Un unico tipo de cuantizacion publicado (Q4_K_M); no hay variantes de mayor o menor precision disponibles.
- El modelo esta acoplado a la version de la documentacion usada (Zimbra 9/10); cambios en la interfaz o en los comandos pueden dejarlo desactualizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Regi655/zimbra-helper-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Descarga de Zimbo (asistente de escritorio): https://huggingface.co/Regi655/zimbra-helper-GGUF/resolve/main/zimbo/Zimbo.zip
- Descarga de Zimbo offline (con modelos incluidos): https://huggingface.co/Regi655/zimbra-helper-GGUF/resolve/main/zimbo/Zimbo-offline.zip
- Ollama: https://ollama.com/download
