# loom-draft/bartowski-Hermes-3-Llama-3.1-8B-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom para el checkpoint GGUF `Hermes-3-Llama-3.1-8B-Q4_K_M.gguf` de bartowski, que a su vez es una cuantizacion del modelo Hermes 3 de Nous Research sobre la base Llama 3.1 8B de Meta. El autor del paquete es `loom-draft`, que lo genera con la herramienta `loom-next` (generador automatico, sin LLM en el bucle) para su ejecucion en GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve es la portabilidad del stack de inferencia en hardware AMD: en lugar de depender de llama.cpp u otro runtime generico, el paquete incluye programas `.loom` generados especificamente para esos targets, un `model.json` con la configuracion, el tokenizador y los pesos en formato Loom. El servidor `loom-serve` expone una API compatible con OpenAI (`/v1/chat/completions`) en el puerto 8080.

La relevancia es acotada: se trata de un artefacto de despliegue, no de un modelo con benchmarks propios. La model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, etc.) "no se han vuelto a medir" para ninguna de las dos GPUs, por lo que no hay evidencia publicada de rendimiento ni de fidelidad numerica frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Llama 3.1 8B); el paquete Loom solo cambia el runtime de ejecucion |
| Parametros totales | 8 000 millones (8B), segun el checkpoint base |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Concurrencia | 4 peticiones simultaneas |
| Tokens maximos de salida | 4 096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Hermes 3 Llama 3.1 8B de Nous Research, un transformer denso de 8B parametros afinado sobre Llama 3.1 8B con el objetivo de mejorar el seguimiento de instrucciones, el uso de herramientas y el razonamiento multi-turno. La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF, DPO u otra tecnica de alineamiento; esos datos corresponden a la model card original de Nous Research y no se reproducen aqui.

Lo especifico de este repositorio es la capa Loom: `loom-next` genera programas `.loom` y un `weights.loom` a partir del GGUF sin modificar, junto con `tokenizer.json` y `llm_config.json`. El paquete se distribuye con `model.json` y `model.json.lock`, que fijan los ficheros fuente con verificacion sha256 en `loom-fetch`. El servicio se arranca con `loom-serve`, con opciones como `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). No hay innovaciones de decodificacion especulativa, thinking mode ni atencion lineal: la propia tabla de features marca esas casillas como "not applicable".

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Contexto de 131 072 tokens por peticion, adecuado para documentos largos o historiales extensos.
- Hasta 4 peticiones concurrentes por instancia de `loom-serve`.
- Salida limitada a 4 096 tokens por peticion (preset `max_tokens`).
- Tool calling: no soportado en este paquete ("not applicable").
- Razonamiento o thinking mode: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").
- Entrada de imagen: no soportada ("not applicable").
- Entrada o salida de audio: no soportada ("not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en APU Strix Halo: un equipo con Ryzen AI Max+ 395 puede servir el modelo con `loom-serve` y consumirlo desde una aplicacion local via `curl` o cualquier cliente compatible con OpenAI, sin GPU discreta.
- Servicio en Radeon AI PRO R9700: con 32 GB de VRAM, la tarjeta puede alojar el Q4_K_M y atender hasta 4 peticiones concurrentes, util para prototipos en estaciones de trabajo AMD.
- Procesamiento de documentos largos: el contexto de 131 072 tokens permite pasar contratos, informes o transcripciones completas en una sola peticion, siempre que la salida quepa en 4 096 tokens.
- Asistente conversacional interno: la API `/v1/chat/completions` se integra con clientes existentes (SDKs de OpenAI, LangChain, etc.) apuntando a `http://127.0.0.1:8080`, lo que facilita sustituir un backend en la nube por uno local.
- Evaluacion comparativa de runtimes AMD: util para equipos que quieran medir el rendimiento de Loom frente a llama.cpp en el mismo GGUF, aunque las puertas de correccion del repositorio aun no tienen resultados registrados.
- Base para experimentacion con el ecosistema Loom: el paquete sirve como referencia de como `loom-next` genera programas para un GGUF concreto, replicable con otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir", y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas GPUs. Tampoco hay datos de MMLU, HumanEval, GSM8K ni similares en el repositorio.

## Requisitos de hardware

- VRAM estimada: el Q4_K_M de un modelo de 8B ocupa aproximadamente 4,9 GB de pesos; con overhead de contexto y pool de memoria conviene reservar entre 6 y 8 GB.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no se documenta soporte para RTX 4090, RTX 3090 ni otras GPUs NVIDIA; el paquete esta generado para targets AMD concretos.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalable con pipx), `loom-fetch` para descargar el paquete y `loom-serve` para servir la API en el puerto 8080.
- Opciones de arranque relevantes: `--pool_backing=fixed` y `--parameter_mode=preload`; `completion_spin_ns=4294967295` activa espera activa en las completaciones de GPU.
- Latencia y throughput: no disponibles; la model card no incluye cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Hermes-3-Llama-3.1-8B Q4_K_M, Loom) | 8B | 131 072 | `.loom` + `loom-serve` | llama3 | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks publicados |
| Hermes-3-Llama-3.1-8B (bartowski GGUF) | 8B | 131 072 | GGUF, llama.cpp | llama3 | Checkpoint de origen del paquete; runtime generico |
| Llama 3.1 8B Instruct (Meta) | 8B | 131 072 | safetensors, GGUF | llama3 | Modelo base sin el afinado de Nous Research |
| Mistral 7B Instruct | 7B | 32 768 | safetensors, GGUF | Apache 2.0 | Alternativa con licencia permisiva y contexto menor |

La comparacion se limita a parametros, contexto, formato y licencia; no hay datos de rendimiento publicados para este paquete que permitan comparar calidad de salida.

## Limitaciones y advertencias

- Ausencia total de evidencia de correccion: las puertas `kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits` y `decision` no tienen resultados registrados, por lo que no se ha verificado que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no hay cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Restriccion de hardware: los programas `.loom` estan generados para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPUs, incluidas NVIDIA.
- Licencia Llama 3: uso comercial permitido con condiciones (atribucion, politica de uso aceptable, limite de 700 millones de usuarios mensuales para titulares de la licencia); conviene revisar el texto completo antes de produccion.
- Capacidades ausentes: sin tool calling, sin thinking mode, sin vision, sin audio y sin decodificacion especulativa en este paquete.
- Limite de salida de 4 096 tokens, que puede ser insuficiente para tareas de generacion larga.
- Concurrencia maxima de 4 peticiones, adecuada para uso personal o prototipos pero no para cargas de produccion medias o altas.
- Riesgo de alucinacion y sesgos: inherentes al modelo base Hermes 3 / Llama 3.1; no se documentan evaluaciones de sesgo en este repositorio.
- Idiomas soportados no declarados en la informacion proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Hermes-3-Llama-3.1-8B-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Hermes-3-Llama-3.1-8B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
