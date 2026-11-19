# loom-draft/bartowski-InternScience_Agents-A1-4B-loom

## Resumen

`loom-draft/bartowski-InternScience_Agents-A1-4B-loom` es un paquete de despliegue en formato Loom para el checkpoint GGUF `bartowski/InternScience_Agents-A1-4B-GGUF` (concretamente la cuantizacion Q4_K_M). No se trata de un modelo nuevo ni de un fine-tune: el autor declara explicitamente que el GGUF subyacente se usa "unmodified". Lo que aporta este repositorio es un conjunto de programas `.loom` y un fichero `model.json` que permiten servir el modelo sobre GPUs AMD concretas mediante el runtime `loom-serve` (paquete `hrx-loom`), generado con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El modelo base es un modelo multimodal de tipo image-text-to-text de 4B parametros (segun el nombre del checkpoint), orientado a tareas de agentes cientificos, con soporte de razonamiento (thinking mode) activado por defecto y una ventana de contexto declarada de 262.144 tokens por peticion. El paquete esta afinado para dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de este repositorio es acotada pero clara: demuestra el flujo de empaquetado de Loom para modelos GGUF con vision sobre hardware AMD consumer y profesional, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de entrada de imagen via proyector `mmproj` y concurrencia de 4 peticiones. La licencia declarada es Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos no estan alojados en este repo (se obtienen via `loom-fetch` desde el paquete).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; no se detalla en la informacion proporcionada) |
| Parametros totales | 4B (inferido del nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en bf16 (`mmproj-InternScience_Agents-A1-4B-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) + paquete Loom (`.loom` + `model.json`) |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, capas, dimensiones ocultas) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). La model card del paquete Loom no describe el modelo en si, sino el empaquetado y el runtime de servicio. El nombre del checkpoint (`InternScience_Agents-A1-4B`) sugiere una orientacion a tareas de agentes en dominio cientifico, pero este dato no se confirma en la informacion proporcionada.

Lo que si se documenta es la capa de despliegue: el paquete incluye kernels generados para las arquitecturas AMD gfx1151 y gfx1201, con soporte de decodificacion autoregresiva sobre GGUF, proyector de vision separado para entrada de imagen y un modo de razonamiento (thinking) activado por defecto que puede desactivarse mediante `chat_template_kwargs: {"enable_thinking": false}`. No se menciona decodificacion especulativa (marcada como "not applicable"), ni atencion lineal, ni otras innovaciones de arquitectura. El paquete se genera con `loom-next` "the generator alone, no LLM in the loop", es decir, sin asistencia de un modelo generativo en la generacion de los programas `.loom`.

## Capacidades

- Generacion de texto conversacional via API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento / thinking mode: activado por defecto; se puede desactivar por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen (image-text-to-text): soporta partes `image_url` al estilo OpenAI, procesadas por el proyector `mmproj-InternScience_Agents-A1-4B-bf16.gguf`.
- Contexto largo: hasta 262.144 tokens por peticion.
- Concurrencia: 4 peticiones simultaneas con consistencia declarada (gate `consistency`).
- Tool calling: no aplicable segun la tabla de features del paquete ("not applicable"), aunque existe un gate `agent` de multi-turn tool-calling en la bateria de correctitud.
- Reasoning effort: no aplicable.
- Audio: no soportado ("not applicable").
- Decodificacion especulativa: no aplicable.
- Idiomas: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente cientifico con imagenes: el modelo acepta pares imagen-texto via `image_url`, lo que permite enviar figuras, tablas o capturas de papers y pedir explicaciones o extraccion de datos, aprovechando el proyector de vision incluido en el paquete.
- Analisis de documentos largos: con 262.144 tokens de contexto por peticion, se pueden procesar articulos completos, informes tecnicos o transcripciones extensas en una sola llamada sin trocear el contenido.
- Razonamiento paso a paso en dominios tecnicos: el thinking mode activado por defecto esta pensado para tareas que requieren cadena de razonamiento; puede desactivarse para respuestas rapidas y directas cuando la latencia importa.
- Despliegue en estaciones de trabajo AMD: el paquete esta preparado para servir el modelo en Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), lo que permite montar un endpoint local compatible con OpenAI en hardware AMD sin depender de CUDA.
- Prototipado de agentes multi-turno: el gate `agent` de la bateria de correctitud valida bucles de tool calling multi-turno con renderizado exacto de prompt y reutilizacion de historial, lo que indica que el runtime esta disenado para soportar agentes, aunque la feature de tool calling figure como "not applicable" en la tabla de capacidades.
- Servicio concurrente de baja escala: con 4 peticiones concurrentes y consistencia garantizada entre ejecuciones aisladas y concurrentes, es adecuado para entornos de desarrollo, demos internas o evaluacion comparativa frente a llama.cpp.
- Evaluacion y benchmarking de runtimes: el paquete incluye gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que permiten comparar la salida del runtime Loom contra la referencia de llama.cpp token a token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todos los gates de correctitud figuran como "not yet re-measured". No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 4B, mas el proyector de vision en bf16. La Radeon AI PRO R9700 se describe con 32 GB, lo que deja margen amplio para este tamano.
- GPUs soportadas oficialmente por el paquete:
  - AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
  - AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta soporte para GPUs NVIDIA ni para Radeon consumer distintas de las listadas; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: `hrx-loom[hf]==0.2.0` via `pipx`, con `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Opciones relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload`, y `completion_spin_ns=4294967295` para espera activa de completaciones GPU.
- Alternativa de referencia: llama.cpp se usa como referencia de correctitud (greedy tokens y top-5 log-probs sobre el mismo GGUF), aunque no se publican cifras comparativas de rendimiento para este paquete.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el propio paquete se compara funcionalmente con llama.cpp como runtime de inferencia sobre el mismo GGUF, pero sin cifras publicadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternScience_Agents-A1-4B (via Loom) | 4B (segun nombre) | 262.144 tokens | Apache 2.0 | GGUF Q4_K_M + paquete Loom | Solo AMD gfx1151 / gfx1201; sin benchmarks publicados |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo: es un empaquetado de despliegue de un GGUF de terceros (`bartowski/InternScience_Agents-A1-4B-GGUF`). Cualquier limitacion del modelo base se hereda sin cambios.
- No hay resultados de benchmarks ni de gates de correctitud publicados para este paquete: todas las filas de rendimiento y correctitud figuran como "not yet re-measured". No hay evidencia registrada de que la salida coincida con llama.cpp en esta configuracion.
- Soporte de hardware restringido: el paquete esta generado para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700). No se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- Tool calling marcado como "not applicable" en la tabla de features, pese a existir un gate `agent` de tool calling multi-turno; conviene verificar el comportamiento real antes de disenar agentes en produccion.
- Sampling marcado como "?" ("not determined"): el comportamiento de temperatura, top_k y semilla no esta confirmado en la informacion disponible.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens por peticion (preset `max_tokens`), lo que acota el uso en cargas de alta demanda.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingue sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero al tratarse de un empaquetado de un GGUF de terceros conviene verificar la licencia y condiciones del checkpoint original (`bartowski/InternScience_Agents-A1-4B-GGUF`) y del modelo InternScience subyacente.
- Repositorio con 0 descargas, 0 likes y 0.0 GB de tamano: senal de que es un artefacto reciente o de baja difusion; no hay validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-InternScience_Agents-A1-4B-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/InternScience_Agents-A1-4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
