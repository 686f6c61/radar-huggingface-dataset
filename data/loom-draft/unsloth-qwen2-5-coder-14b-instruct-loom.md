# loom-draft/unsloth-Qwen2.5-Coder-14B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom para el checkpoint GGUF `Qwen2.5-Coder-14B-Instruct-Q4_K_M.gguf`, publicado originalmente por Unsloth como cuantizacion del modelo Qwen2.5-Coder-14B-Instruct de Alibaba Cloud. El autor, `loom-draft`, ha generado los programas `.loom` y la tarjeta `model.json` con la herramienta `loom-next`, sin intervencion de un LLM en el proceso de generacion. El objetivo es ejecutar el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Qwen2.5-Coder-14B-Instruct, es un transformer denso de 14 mil millones de parametros especializado en generacion y comprension de codigo, con una ventana de contexto nativa de 32.768 tokens en esta configuracion de servicio. La relevancia de este paquete radica en que ofrece una ruta de inferencia nativa para hardware AMD consumer y profesional mediante el runtime Loom, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y hasta 4 peticiones concurrentes.

Cabe destacar que el paquete se encuentra en estado inicial: no tiene descargas ni valoraciones, y las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, entre otras) figuran como "not yet re-measured" para ambas GPUs. Por tanto, la informacion disponible describe la configuracion y las capacidades declaradas, pero no acredita resultados empiricos en esta publicacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-Coder-14B-Instruct); paquete de despliegue Loom generado con loom-next |
| Parametros totales | 14 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) en esta publicacion |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Tool calling | Si (formato OpenAI `tools` y `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (extra `[hf]`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 14.000 millones de parametros de la familia Qwen2.5-Coder, afinado para instrucciones (Instruct) por Alibaba Cloud. Esta publicacion no entrena ni modifica los pesos: toma el checkpoint GGUF ya cuantizado por Unsloth a Q4_K_M y genera, mediante `loom-next`, un conjunto de programas `.loom` que implementan las operaciones de inferencia para las arquitecturas AMD gfx1151 y gfx1201. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en el momento de la descarga con `loom-fetch`, ademas de `tokenizer.json` y `llm_config.json`.

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF/DPO) ni innovaciones tecnicas del modelo base. Por parte del paquete Loom, las funcionalidades declaradas incluyen decodificacion especulativa, modo de razonamiento, entrada de imagen y entrada/salida de audio marcadas como no aplicables, y el muestreo figura como "not determined". La generacion de los kernels se realizo unicamente con la herramienta `loom-next`, sin LLM en el bucle.

## Capacidades

- Generacion de texto y codigo en el marco del modelo Qwen2.5-Coder-14B-Instruct; las capacidades especificas de razonamiento, matematicas o vision del modelo base no se detallan en la informacion proporcionada.
- Tool calling en formato OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- API compatible con OpenAI mediante `/v1/chat/completions`, con campo `model` configurable.
- Concurrencia de hasta 4 peticiones simultaneas con salida consistente declarada (puerta `consistency`, pendiente de re-medicion).
- Ventana de contexto de 32.768 tokens por peticion, con pruebas de referencia `golden` previstas sobre documentos de 1k a 32k tokens.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin modo de razonamiento/thinking, sin decodificacion especulativa, sin entrada de imagen y sin audio (marcados como no aplicables en esta configuracion).
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo autohospedado en estaciones de trabajo AMD: el paquete permite servir Qwen2.5-Coder-14B-Instruct en una Radeon AI PRO R9700 o en un APU Strix Halo mediante `loom-serve`, con una API compatible con OpenAI que se integra directamente en editores e IDE sin adaptadores adicionales.
- Automatizacion de tareas de desarrollo con tool calling: al aceptar `tools` y devolver `tool_calls` en formato OpenAI, el modelo puede invocarse desde agentes que ejecutan comandos, consultan repositorios o crean parches en un bucle multi-turno, con contexto de hasta 32.768 tokens para arrastrar historial y ficheros relevantes.
- Generacion y revision de codigo en pipelines de CI/CD: la ventana de contexto permite enviar fragmentos amplios de codigo y documentacion en una sola peticion, y el limite de 4.096 tokens de salida cubre la generacion de parches y explicaciones de tamano medio.
- Procesamiento por lotes de documentacion tecnica: con 4 peticiones concurrentes y una API HTTP estandar, se pueden encolar tareas de resumen, traduccion de comentarios o generacion de docstrings sobre un corpus de repositorios.
- Despliegue en hardware AMD sin CUDA: para equipos con Strix Halo o R9700, el paquete evita depender de CUDA y ofrece un runtime nativo ROCm con comandos de arranque reproducibles (`loom-fetch` + `loom-serve`).
- Entornos de evaluacion y prototipado de agentes: la API compatible con OpenAI permite conectar frameworks de agentes existentes y comparar el comportamiento del modelo frente a otras implementaciones, siempre que se validen previamente las puertas de correccion pendientes.
- Servicio local de asistencia en programacion para equipos pequenos: con 4 peticiones concurrentes y contexto de 32k, un unico nodo puede atender a varios desarrolladores en tareas de autocompletado y explicacion de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201, 32 GB). Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 14B, lo que tipicamente ocupa del orden de 9 GB de pesos; la informacion proporcionada no desglosa el consumo total del runtime ni el pool de memoria. El paquete declara `--pool_backing=fixed`, que reserva el pool de memoria del preset por adelantado.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no disponible; el paquete solo documenta las dos plataformas AMD anteriores y no menciona GPUs NVIDIA ni otras Radeon.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Opciones de arranque documentadas: `--materialize=copy`, `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las comparativas frente a llama.cpp no se han re-medido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este paquete (Qwen2.5-Coder-14B-Instruct Q4_K_M para Loom) | 14B | 32.768 | Q4_K_M (GGUF empaquetado) | Apache 2.0 | Runtime Loom sobre AMD gfx1151/gfx1201 |
| unsloth/Qwen2.5-Coder-14B-Instruct-GGUF (modelo base de este paquete) | 14B | no disponible en la informacion | GGUF (varias) | Apache 2.0 | llama.cpp y otros runtimes GGUF |
| Qwen2.5-Coder-14B-Instruct (checkpoint original) | 14B | no disponible en la informacion | safetensors (original) | Apache 2.0 | vLLM, TGI, transformers |

La comparacion se limita al linaje del propio modelo, ya que la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con alternativas de otros desarrolladores. No se dispone de cifras de benchmarks para ninguna de las tres filas en esta publicacion.

## Limitaciones y advertencias

- El paquete no acredita correccion ni rendimiento: todas las puertas de validacion y las comparativas con llama.cpp estan pendientes de re-medicion, por lo que no hay evidencia publicada de que la salida coincida con la referencia.
- El muestreo figura como "not determined"; el comportamiento de `temperature`, `top_k` y `seed` no esta verificado en esta configuracion.
- El limite de 4.096 tokens de salida y las 4 peticiones concurrentes son restricciones del preset y pueden no cubrir cargas de produccion exigentes.
- No hay soporte de razonamiento extendido, decodificacion especulativa, vision ni audio en esta configuracion.
- La informacion sobre idiomas soportados no esta disponible; no se debe asumir cobertura multilingue sin verificacion.
- Riesgo de alucinacion y sesgos del modelo base: no se documentan en la informacion proporcionada; deben evaluarse con el checkpoint original de Qwen2.5-Coder-14B-Instruct.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint original de Qwen y de la cuantizacion de Unsloth antes de desplegar en produccion.
- Dependencia de hardware AMD especifico (gfx1151 y gfx1201) y de la version 0.2.0 de `hrx-loom`; no se documenta compatibilidad con otras GPUs.
- El repositorio no tiene descargas ni valoraciones, lo que limita la evidencia de uso real por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen2.5-Coder-14B-Instruct-loom
- Checkpoint GGUF base: https://huggingface.co/unsloth/Qwen2.5-Coder-14B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
