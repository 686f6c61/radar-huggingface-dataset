# loom-fun/unsloth-gemma-4-31B-it-loom

## Resumen

`loom-fun/unsloth-gemma-4-31B-it-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF sin modificar `unsloth/gemma-4-31B-it-GGUF` (concretamente la cuantizacion Q4_K_M) del modelo Gemma 4 31B instruct de Google. No es un modelo nuevo ni un fine-tune: es un artefacto de distribucion (programas `.loom` y una tarjeta `model.json`) generado con el flujo `loom-skills` sobre un dispositivo AMD Ryzen AI Max+ 395 "Strix Halo" con grafica Radeon 8060S. El repo tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0.0 GB, lo que sugiere que los pesos se materializan al vuelo desde el repo base en lugar de almacenarse duplicados.

El problema que resuelve es la ejecucion eficiente de un modelo de 31B parametros en hardware AMD integrado (APU con memoria unificada) mediante el runtime Loom, que expone una API compatible con OpenAI, tool calling, modo thinking opcional y decodificacion especulativa con el drafter DFlash de Anbeeld. La model card reporta comparativas de rendimiento frente a llama.cpp en el mismo GGUF y mismo hardware, con ganancias notables en prefill (por ejemplo, 348,6 tok/s frente a 225,8 tok/s con documento de 1k) y una tasa de aceptacion de tokens especulativos del 42 %.

La relevancia es doble: por un lado, documenta un caso real de inferencia de un modelo grande en una APU consumer de gama alta sin GPU dedicada; por otro, sirve como referencia de validacion (gates de correctitud frente a llama.cpp) para quienes quieran reproducir el stack. La informacion disponible no incluye detalles propios de arquitectura o entrenamiento del modelo Gemma 4 subyacente, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 31B; el paquete es un artefacto de despliegue Loom) |
| Parametros totales | 31B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 55.296 tokens por peticion (limite del runtime Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M); paquete `.loom` + `model.json` |
| Modelo base | unsloth/gemma-4-31B-it-GGUF |
| Runtime | Loom (`hrx-loom` 0.1.0, `hrx-system` d01d1c1) |
| Decodificacion especulativa | DFlash, profundidad 7, activada por defecto |
| Drafter | Anbeeld/gemma-4-31B-it-DFlash-GGUF (Q4_K_M) |
| Concurrencia | 4 peticiones simultaneas |
| Max tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni el proceso de entrenamiento del modelo Gemma 4 31B en la documentacion proporcionada. El paquete Loom no modifica el checkpoint: empaqueta el GGUF Q4_K_M original de Unsloth y anade programas `.loom` y una tarjeta `model.json` que describen como servirlo. Cualquier innovacion de arquitectura (tipo de atencion, mezcla de expertos, entrenamiento con RLHF/DPO, composicion del dataset) corresponde al modelo base y no aparece documentada aqui.

Lo destacable a nivel tecnico es la capa de ejecucion: Loom compila kernels especificos para la GPU integrada gfx1151 de Strix Halo, valida su correctitud contra implementaciones de referencia (47/47 tests de kernel) y contra llama.cpp (tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k), y activa por defecto decodificacion especulativa DFlash con profundidad 7 y un drafter Q4_K_M separado. La model card reporta una aceptacion de tokens drafteados del 42 % en la puerta `spec`, con verificacion de que la salida con decodificacion especulativa activa es identica a la obtenida con ella desactivada.

## Capacidades

- Generacion de texto conversacional e instruct via API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI (`tools` y `tool_calls`), validado en un bucle multi-turno de agente (`agent` y `agent_think_off`).
- Modo razonamiento/thinking opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificacion especulativa DFlash con profundidad 7 activada por defecto, con salida identica a la version sin especulacion.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`, con verificacion de que la distribucion del primer token coincide con llama.cpp.
- Concurrencia de 4 peticiones con consistencia verificada (misma salida que ejecutadas en solitario).
- Capacidad de contexto largo: hasta 55.296 tokens por peticion, con prueba needle-in-a-haystack superada hasta la mitad del contexto.
- Sin soporte de razonamiento con esfuerzo configurable (reasoning effort no soportado).
- Sin entrada de imagen (vision no soportada) ni entrada/salida de audio.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: desplegar el paquete con `loom-serve --device=amdgpu` y exponer un endpoint compatible con OpenAI para integrarlo en herramientas existentes sin cambiar el cliente. Adecuado porque el runtime ya implementa el esquema de chat completions y el muestreo esperado.
- Agente con tool calling en local: usar el bucle multi-turno validado por la puerta `agent` para construir asistentes que invoquen funciones externas (consulta de datos, ejecucion de comandos controlados) manteniendo el historial y el renderizado exacto del prompt.
- Procesamiento de documentos largos: aprovechar la ventana de 55.296 tokens para resumir, extraer o responder preguntas sobre contratos, informes o transcripciones extensas, con la garantia de que el modelo sirve prompts de hasta la mitad del contexto en pruebas needle.
- Prototipado de aplicaciones de IA en hardware sin GPU dedicada: usar una APU Strix Halo con 216 GB/s de ancho de banda y 59 TFLOP/s como banco de pruebas para cargas de 31B en Q4_K_M, con throughput de prefill de 348,6 tok/s en documentos de 1k.
- Servicio interno de baja concurrencia: atender hasta 4 peticiones simultaneas con salida consistente, adecuado para equipos pequenos o entornos de desarrollo donde no se requiere escalado horizontal.
- Evaluacion y benchmarking de runtimes: emplear los gates de correctitud (`golden`, `compare`, `consistency`, `spec`, `agent`, `needle`) como referencia para validar otras implementaciones o versiones del runtime frente a llama.cpp.
- Generacion de codigo asistida en local: usar el modo thinking opcional para tareas que requieran razonamiento paso a paso y el tool calling para integrar el modelo en flujos de edicion o ejecucion de tests.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento del runtime, no de calidad del modelo. Se comparan llama.cpp (build `llamacpp-rocm/b1370`) y Loom sobre el mismo GGUF y el mismo hardware (AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04), medidos el 2026-11-07.

| Metrica | llama.cpp (DevLab) | Loom (DevLab) | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | 18,3 | 23,7 | 30,5 |
| Decode tok/s, contexto 2k | 14,6 | 15,1 | 24,4 |
| Decode tok/s, contexto 32k | 13,3 | 11,3 | 24,7 |
| Prefill tok/s, documento 1k | 225,8 | 348,6 | 987,9 |
| Prefill tok/s, documento 2k | 215,2 | 354,6 | 969,3 |
| Prefill tok/s, documento 8k | 210,6 | 285,4 | 938,4 |
| Prefill tok/s, documento 16k | 174,5 | 226,4 | 900,8 |
| Prefill tok/s, documento 32k | 142,0 | 156,0 | 834,1 |
| 4 streams, decode agregado tok/s | 32,5 | 32,8 | 166,3 |
| Tokens drafteados aceptados (especulativa) | n/a | 42 % | n/a |

Notas de la model card: Loom mide en el cliente y llama.cpp en el servidor; los valores de decode y prefill no registran la media y los de 4 streams no registran la mediana; la columna "local ÷ DevLab" queda vacia en la tabla original. La aceptacion de tokens especulativos por sesion fue del 23 % en decode, 17 % en decode a 2k y 21 % en decode a 32k. El roofline se calcula con 216 GB/s y 59 TFLOP/s para gfx1151, sin contar el coste del drafter.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de 31B y el hardware de referencia es una APU con memoria unificada (Ryzen AI Max+ 395), no una GPU con VRAM dedicada.
- GPU de referencia: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (gfx1151), con 216 GB/s de ancho de banda y 59 TFLOP/s.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta compatibilidad ni rendimiento en la informacion disponible.
- Cabe en GPU consumer: el caso validado es una APU de gama alta con memoria unificada; no hay datos sobre GPUs consumer discretas.
- Despliegue: runtime Loom (`pip install "hrx-loom[hf]"`, `loom-fetch`, `loom-serve --device=amdgpu`); llama.cpp se usa como referencia de comparacion con `-ngl 99 -cram 0 --spec-type draft-dflash`.
- Latencia y throughput: ver tabla de benchmarks; decode de 23,7 tok/s en prompt corto y prefill de 348,6 tok/s en documento de 1k con Loom en el runner DevLab.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/unsloth-gemma-4-31B-it-loom | 31B | 55.296 tokens (runtime) | GGUF Q4_K_M + paquete `.loom` | no disponible | Paquete de despliegue para runtime Loom en AMD Strix Halo |
| unsloth/gemma-4-31B-it-GGUF | 31B | no disponible | GGUF | no disponible | Checkpoint base sin modificar; el paquete Loom lo empaqueta |
| Anbeeld/gemma-4-31B-it-DFlash-GGUF | no disponible | no disponible | GGUF Q4_K_M | no disponible | Drafter de decodificacion especulativa usado por Loom |
| llama.cpp (runtime) | n/a | configurable (`-c 35024` en la prueba) | GGUF | n/a | Motor de referencia; sirve el mismo GGUF con menor prefill en las pruebas reportadas |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- El paquete no incluye los pesos: el repo ocupa 0.0 GB y los pesos se materializan desde el repo base; la disponibilidad depende de `unsloth/gemma-4-31B-it-GGUF`.
- Sin soporte de vision ni de audio; no apto para tareas multimodales.
- Sin soporte de reasoning effort; el modo thinking solo se activa o desactiva, sin niveles intermedios.
- La prueba needle-in-a-haystack a contexto completo (`needle_full`) no tiene evidencia de exito; solo se valida hasta la mitad del contexto.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial; debe verificarse en el modelo base.
- Los benchmarks de rendimiento comparan medicion en cliente (Loom) frente a servidor (llama.cpp), lo que puede introducir diferencias metodologicas.
- La aceptacion de tokens especulativos varia por sesion (17 % a 21 % en decode), por lo que la ganancia real de la decodificacion especulativa no es constante.
- Modelo con 0 descargas y 0 likes y creado el 2026-11-07: madurez y soporte comunitario no verificables.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de calidad del modelo base en la informacion proporcionada.
- El rendimiento esta medido en un unico dispositivo (Strix Halo, gfx1151); la extrapolacion a otras GPUs AMD o a hardware NVIDIA no esta documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-gemma-4-31B-it-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/gemma-4-31B-it-GGUF
- Modelo base Unsloth: https://huggingface.co/unsloth/gemma-4-31B
- Drafter DFlash: https://huggingface.co/Anbeeld/gemma-4-31B-it-DFlash-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion DevLab de referencia: https://github.com/loom-fun/loom-skills/actions/runs/42385194696
- Guia de fine-tuning Gemma 4 de Unsloth: https://unsloth.ai/docs/models/gemma-4/train
