# LoosiFR/qwen35-9b-agentic-v1-GGUF

## Resumen

qwen35-9b-agentic-v1-GGUF es la distribucion en formato GGUF del modelo qwen35-9b-agentic-v1, publicado por el usuario LoosiFR en HuggingFace. Se trata de un modelo de aproximadamente 9.200 millones de parametros (9.197.093.888 segun los pesos en safetensors) derivado de la familia Qwen 3.5, orientado especificamente a casos de uso agenticos: invocacion de herramientas (tool calling), razonamiento multi-paso y flujos conversacionales con soporte de plantillas Jinja.

El modelo se distribuye unicamente en dos cuantizaciones (Q4_K_M y Q5_K_M) pensadas para ejecutarse en GPUs de consumo con 12 GB de VRAM mediante llama.cpp. La model card menciona que la atencion hibrida de Qwen 3.5 mantiene pequena la cache KV, lo que permite arrancar con una ventana de contexto de 32.768 tokens y ampliarla segun la VRAM disponible.

La relevancia de esta publicacion es practica: ofrece un punto de partida listo para desplegar en local con llama.cpp y `--jinja`, con soporte de tool calling verificado en el momento de la exportacion. No obstante, la informacion publicada es muy escasa: no hay datos sobre licencia, idiomas, composicion del dataset de entrenamiento ni resultados de benchmarks, lo que limita la evaluacion rigurosa antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (familia Qwen 3.5); detalles no disponibles |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens como valor de arranque recomendado en la model card; maximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M y Q5_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye presumiblemente en safetensors |
| Modelo base | LoosiFR/qwen35-9b-agentic-v1 |
| Tamano del repositorio | 12,4 GB |
| Compatibilidad de endpoints | endpoints_compatible (segun tags de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base pertenece a la familia Qwen 3.5 y que emplea atencion hibrida, un diseno que reduce el coste de memoria de la cache KV en contextos largos. Con 9.197.093.888 parametros, se situa en la franja de 9B, aunque no se especifica si es un transformer denso o una variante con componentes de mezcla de expertos; la ausencia de parametros activos en la documentacion sugiere una arquitectura densa.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o RL con verificadores. La unica innovacion documentada es el soporte de modo pensamiento (thinking mode) desactivable por peticion mediante `chat_template_kwargs`, y el uso de plantillas Jinja para el formateo de tool calls en llama.cpp. El autor menciona que el tool calling es mas fiable a traves de `--jinja` que mediante Ollama.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat.
- Tool calling / function calling mediante plantillas Jinja en llama.cpp; la model card reporta una prueba de humo con `tool_call: true` y `tool_result_used: true`.
- Modo pensamiento (thinking) activable o desactivable por peticion con `enable_thinking: false`.
- Orientacion agentica: el nombre del modelo y sus tags (`agentic`, `tool-use`) indican entrenamiento o ajuste para flujos con herramientas y razonamiento multi-paso.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de HuggingFace).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes locales de automatizacion: el modelo puede ejecutarse en una GPU de 12 GB con llama.cpp y `--jinja`, invocando herramientas definidas por el desarrollador (lectura de ficheros, consultas HTTP, ejecucion de comandos) en un bucle de razonamiento multi-paso. Es adecuado por su tamano contenido y su soporte explicito de tool calling.
- Asistentes de codigo en estacion de trabajo: con 32.768 tokens de contexto y cuantizacion Q4_K_M, cabe en GPUs de consumo y permite mantener conversaciones largas sobre un repositorio, aunque la calidad en generacion de codigo no esta documentada con benchmarks.
- Automatizacion de atencion al cliente en local: la ventana de contexto de 32K y la atencion hibrida permiten gestionar conversaciones multi-turno con historial extenso sin disparar el consumo de VRAM.
- Pipelines de extraccion de datos estructurados: el modo tool calling permite forzar salidas en JSON o invocar funciones de parseo, util para procesar documentos y generar registros normalizados.
- Prototipado de agentes con Ollama o llama.cpp: al estar en GGUF, se integra facilmente en entornos de desarrollo sin infraestructura GPU dedicada, usando el Modelfile proporcionado por el autor.
- Despliegue en edge o en portatiles con GPU: la cuantizacion Q4_K_M y la cache KV reducida permiten ejecutar el modelo en equipos con 12 GB de VRAM, habilitando asistentes offline con privacidad de datos.
- Evaluacion de flujos agenticos antes de migrar a modelos mayores: sirve como banco de pruebas para disenar prompts, herramientas y plantillas Jinja antes de escalar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es una prueba de humo cualitativa en llama.cpp en el momento de la exportacion (`{"tool_call": true, "tool_result_used": true}`), que no constituye una evaluacion cuantitativa de rendimiento.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M, aproximadamente 5,5-6 GB para los pesos; con Q5_K_M, aproximadamente 6,5-7 GB. La cache KV con `-ctk q8_0 -ctv q8_0` y 32.768 tokens anade entre 1 y 3 GB segun la configuracion, por lo que el total se mantiene por debajo de 12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A10, L4, A100 y H100. En GPUs de 8 GB puede requerir reducir contexto o usar cuantizaciones mas agresivas no publicadas.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas usando Q4_K_M y contexto de 32K. En 8 GB es ajustado y probablemente exija bajar `-c` o cuantizar la cache KV.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), Ollama mediante Modelfile, y cualquier runtime compatible con GGUF. El autor recomienda llama.cpp `--jinja` para tool calling.
- Latencia y throughput: no disponibles. Dependen de la GPU, del numero de capas offloaded (`-ngl 99` en el ejemplo) y de la cuantizacion de la cache KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen35-9b-agentic-v1-GGUF | ~9,2 B | 32K recomendado (maximo nativo no disponible) | no disponible | GGUF (Q4_K_M, Q5_K_M) | Ajustado para tool calling y agentes; sin benchmarks publicados |
| Qwen2.5-7B-Instruct (GGUF) | ~7,6 B | 32K nativo, extensible | Apache 2.0 | GGUF, safetensors | Referencia de la familia Qwen; benchmarks publicados y amplia adopcion |
| Llama 3.1 8B Instruct (GGUF) | ~8 B | 128K | Llama 3.1 Community License | GGUF, safetensors | Contexto mayor y ecosistema maduro; tool calling nativo |
| Mistral 7B Instruct v0.3 (GGUF) | ~7,2 B | 32K | Apache 2.0 | GGUF, safetensors | Alternativa ligera con licencia permisiva |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo evaluado, por lo que la eleccion frente a estas alternativas debe basarse en pruebas propias de tool calling y calidad conversacional.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de tool calling que permitan estimar su calidad frente a alternativas consolidadas.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Es un riesgo critico para produccion; conviene contactar con el autor o consultar el modelo base antes de desplegarlo.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Procedencia del ajuste desconocida: no se documenta el dataset de entrenamiento ni el proceso de alineacion, lo que impide evaluar sesgos, riesgo de alucinacion o contaminacion de benchmarks.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Tool calling dependiente de la plantilla Jinja: el propio autor advierte que es mas fiable en llama.cpp con `--jinja` que en Ollama, lo que limita la portabilidad entre runtimes.
- Contexto maximo nativo no confirmado: los 32.768 tokens son un valor de arranque recomendado, no necesariamente el limite del modelo; ampliarlo sin control puede provocar OOM en GPUs de 12 GB.
- Fecha de publicacion futura en los metadatos (2026-11-01): conviene verificar la integridad y el origen de la publicacion antes de confiar en ella.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/LoosiFR/qwen35-9b-agentic-v1-GGUF
- Modelo base: https://huggingface.co/LoosiFR/qwen35-9b-agentic-v1
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Documentacion de tool calling en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/function-calling.md
