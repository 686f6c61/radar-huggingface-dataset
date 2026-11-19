# loom-draft/TheBloke-Mistral-7B-Instruct-v0.2-loom

## Resumen

`loom-draft/TheBloke-Mistral-7B-Instruct-v0.2-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF sin modificar `mistral-7b-instruct-v0.2.Q4_K_M.gguf` de TheBloke, derivado de Mistral-7B-Instruct-v0.2. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de Mistral AI en cuantizacion Q4_K_M (4 bits, Q4_K_M), y lo que aporta el repositorio es un conjunto de programas `.loom` generados con la herramienta `loom-next` (sin LLM en el bucle) junto con un `model.json` que describe el paquete.

El objetivo es habilitar la inferencia del modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se sirve mediante `loom-serve`, que expone una API compatible con el endpoint `/v1/chat/completions` de OpenAI en el puerto 8080, con un contexto de 32.768 tokens por peticion, concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida por preset.

La relevancia es acotada pero concreta: ofrece una via de ejecucion de Mistral-7B-Instruct-v0.2 sobre hardware AMD (ROCm) sin depender de llama.cpp, con un formato de paquete reproducible y verificable (hashes sha256 en `model.json.lock`). No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, etc.) aun no se han vuelto a medir para este paquete en ninguna de las dos GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2); empaquetada como programas `.loom` |
| Parametros totales | 7,24 mil millones (Mistral-7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4 bits) |
| Idiomas soportados | no disponible (la model card del paquete no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mistral-7b-instruct-v0.2.Q4_K_M.gguf`) empaquetado como `weights.loom` y programas `program/*.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| GPUs objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` en `http://127.0.0.1:8080` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2: un transformer decoder-only denso de 7,24 mil millones de parametros con atencion de ventana deslizante (sliding window attention) y RoPE, afinado por Mistral AI para instrucciones. El paquete no modifica ni reentrena los pesos: el checkpoint GGUF es el publicado por TheBloke en cuantizacion Q4_K_M. Por tanto, los datos de entrenamiento, el proceso de alineacion (SFT/DPO segun la model card original de Mistral) y las innovaciones del modelo base son los de Mistral-7B-Instruct-v0.2, no los de este repositorio.

La aportacion tecnica del paquete es de infraestructura: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF y de `llm_config.json`, y `loom-serve` los ejecuta sobre ROCm con opciones como `completion_spin_ns=4294967295` (espera activa de completaciones en GPU), `--pool_backing=fixed` (pool de memoria preasignado) y `--parameter_mode=preload` (carga anticipada de pesos en host). El paquete incluye `tokenizer.json`, `llm_config.json`, `info.json` (mediciones y evidencia de puertas) y `model.json.lock` con los hashes sha256 de los ficheros fuente, verificados por `loom-fetch`.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (roles `user`, `assistant`, `system`), heredada de Mistral-7B-Instruct-v0.2.
- Razonamiento basico y respuesta a instrucciones en el estilo del modelo base; sin modo «thinking» explicito (la model card indica `reasoning / thinking: not applicable`).
- Generacion de codigo y matematicas a nivel del modelo base (no se documentan capacidades especificas adicionales en este paquete).
- Servidor HTTP compatible con la API de chat completions de OpenAI, lo que permite integrarlo con clientes y SDKs existentes.
- Concurrencia de 4 peticiones simultaneas con contexto de 32.768 tokens por peticion.
- Soporte multilingue: no disponible en la model card del paquete (el modelo base soporta varios idiomas, pero el paquete no lo declara).
- Tool calling / function calling: no soportado (`tool calling: not applicable`).
- Agentes y razonamiento multi-paso: no soportado como funcion del runtime (la puerta `agent` figura como no medida).
- Vision: no soportada (`image input: not applicable`).
- Audio: no soportado (`audio input / output: not applicable`).
- Decodificacion especulativa: no soportada (`speculative decoding: not applicable`).
- Muestreo (temperature, top_k, seed): estado `?` (no determinado) en la model card.

## Casos de uso

- Servicio de chat autoalojado en estaciones de trabajo AMD: desplegar `loom-serve` sobre una Radeon AI PRO R9700 (32 GB) para ofrecer un endpoint `/v1/chat/completions` interno compatible con OpenAI, con 32.768 tokens de contexto y 4 peticiones concurrentes, sin depender de servicios en la nube.
- Prototipado en APU Strix Halo: usar el Ryzen AI Max+ 395 como banco de pruebas para aplicaciones de asistente conversacional que requieran contexto largo (documentos de hasta 32k tokens), aprovechando la memoria unificada del APU.
- Integracion en herramientas existentes: al exponer una API compatible con OpenAI, cualquier cliente (SDK de Python, interfaces tipo chat, frameworks de orquestacion) puede apuntar a `http://127.0.0.1:8080` sin cambios de codigo.
- Evaluacion de la ruta AMD/ROCm frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `logits`, `sampling`) disenadas para comparar token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace util para validar la fidelidad del runtime Loom.
- Reproducibilidad de despliegues: `model.json.lock` fija los hashes sha256 de los ficheros fuente, lo que permite reconstruir el mismo paquete en otra maquina y verificar que los pesos y programas no han cambiado.
- Educacion y experimentacion con runtimes alternativos: estudiar como se compila un GGUF a programas `.loom` y como se sirve con `loom-serve`, comparando el comportamiento con el checkpoint original en llama.cpp.
- Procesamiento por lotes de conversaciones cortas: con 4 peticiones concurrentes y 4.096 tokens maximos de salida, es adecuado para tareas de resumen o clasificacion conversacional de baja latencia en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured».

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Throughput (tokens/s) | no disponible |
| Latencia primer token | no disponible |
| Puertas de correccion Loom | no medidas para este paquete |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint Q4_K_M de un modelo de 7,24B ocupa aproximadamente 4,4 GB en disco; en ejecucion hay que sumar el pool de memoria del runtime (`--pool_backing=fixed`) y el contexto de 32.768 tokens, por lo que se recomienda un margen holgado sobre esos 4,4 GB.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo AMD o NVIDIA en este paquete; el runtime Loom esta orientado a las arquitecturas gfx1151 y gfx1201.
- Opciones de despliegue: `loom-fetch` para descargar y materializar el paquete, y `loom-serve` para servirlo con API OpenAI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles (las mediciones no se han vuelto a realizar para este paquete).
- Software: `pipx install "hrx-loom[hf]==0.2.0"`; el runtime depende de ROCm y del stack AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/TheBloke-Mistral-7B-Instruct-v0.2-loom` | 7,24B | 32.768 | GGUF Q4_K_M empaquetado como `.loom` | Apache 2.0 | Paquete para runtime Loom en GPUs AMD gfx1151/gfx1201; sin benchmarks medidos |
| `TheBloke/Mistral-7B-Instruct-v0.2-GGUF` | 7,24B | 32.768 (modelo base) | GGUF | Apache 2.0 | Checkpoint de origen, sin empaquetar; ejecutable con llama.cpp |
| Mistral-7B-Instruct-v0.2 (original) | 7,24B | 32.768 | safetensors | Apache 2.0 | Pesos sin cuantizar publicados por Mistral AI |
| Otros modelos de ~7B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El paquete no aporta ningun ajuste sobre el modelo base: hereda los sesgos, el riesgo de alucinacion y las limitaciones de idioma de Mistral-7B-Instruct-v0.2.
- Las puertas de correccion no estan medidas para este paquete en ninguna de las dos GPUs objetivo; no hay evidencia publicada de que la salida coincida token a token con la referencia de llama.cpp.
- No hay mediciones de rendimiento (latencia, throughput) para este paquete; el autor indica explicitamente que no se han vuelto a medir.
- El estado del muestreo (temperature, top_k, seed) figura como «?» (no determinado), lo que impide garantizar un comportamiento reproducible en ese aspecto.
- No soporta tool calling, agentes, vision, audio ni decodificacion especulativa; no es adecuado para pipelines que dependan de esas capacidades.
- El contexto maximo es de 32.768 tokens por peticion y la concurrencia de 4 peticiones; no esta pensado para cargas de alta concurrencia.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del checkpoint de TheBloke, asi como el cumplimiento de la licencia del runtime Loom (`hrx-loom`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recien publicado (creado el 2026-11-19) sin validacion comunitaria.
- La busqueda web realizada no devuelve informacion tecnica sobre este paquete: los resultados corresponden a Loom (la herramienta de grabacion de pantalla) y a Loom (la marca de ropa), no al runtime AMD Loom. Cualquier dato adicional debe contrastarse en el repositorio de GitHub del proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/TheBloke-Mistral-7B-Instruct-v0.2-loom
- Modelo base (GGUF de TheBloke): https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Modelo original de Mistral AI: no disponible en la informacion proporcionada
- Paper de Mistral-7B: no disponible en la informacion proporcionada
