# loom-fun-staging/bartowski-Qwen3.8-27B-loom

## Resumen

`loom-fun-staging/bartowski-Qwen3.8-27B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen3.8-27B-Q4_K_M.gguf` de bartowski, derivado del modelo base `Qwen3.8-27B`. No se trata de un modelo nuevo ni de un fine-tune: es una distribucion de inferencia optimizada para las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), generada con el flujo de trabajo `loom-skills` del ecosistema Loom.

El modelo subyacente es multimodal (pipeline `image-text-to-text`), con decodificacion especulativa mediante MTP (multi-token prediction) a profundidad 3, modo de razonamiento activado por defecto y soporte de tool calling estilo OpenAI. El paquete expone un servidor compatible con `/v1/chat/completions` en `127.0.0.1:8080`, con 262.144 tokens de contexto nativo por peticion (195.584 en la R9700 por limite de memoria) y hasta 4 peticiones concurrentes.

Su relevancia es acotada pero clara: permite ejecutar un modelo de 27B en cuantizacion Q4_K_M sobre hardware AMD de consumo y workstation con una ruta de despliegue reproducible, y publica una comparativa de rendimiento frente a llama.cpp ROCm con cifras de roofline sobre Strix Halo. La licencia del paquete es Apache 2.0. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion; hasta 195.584 tokens por peticion en AMD Radeon AI PRO R9700 (32 GB) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision `mmproj-Qwen3.8-27B-f16.gguf` en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint `Qwen3.8-27B-Q4_K_M.gguf`) empaquetado como programa `.loom` + `model.json` |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura interna del modelo base ni sus datos de entrenamiento: la model card se centra en el empaquetado y en el rendimiento del runtime. Lo que si documenta es la capa de inferencia: un servidor Loom que ejecuta el GGUF sin modificarlo sobre GPU AMD mediante kernels generados, con decodificacion especulativa MTP a profundidad 3 activada por defecto y aceptacion de tokens borrador del 50-51 % medida en sesion (51 % en decodificacion corta, 50 % a 2k de contexto, 51 % a 32k).

La innovacion destacable no esta en el modelo sino en el runtime: kernels generados y validados contra implementaciones de referencia (`kernel_tests`), comparacion token a token contra una referencia de llama.cpp (`golden`, `compare`) y verificacion de entrada de imagen contra llama.cpp con el mismo proyector (`vision`). Estas puertas de calidad no se han vuelto a ejecutar sobre este paquete concreto: el ultimo pase registrado corresponde a una build anterior (sha256 `f2da83e`) y las puertas nocturnas las repiten. En la R9700 no se han re-medido.

## Capacidades

- Generacion de texto y razonamiento: modo thinking activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Esfuerzo de razonamiento configurable mediante `reasoning_effort`: `low`, `medium`, `xhigh` (por defecto `xhigh`).
- Entrada de imagen: soporte de partes `image_url` estilo OpenAI, con proyector `mmproj-Qwen3.8-27B-f16.gguf`.
- Tool calling: soporte de `tools` y `tool_calls` en formato OpenAI.
- Decodificacion especulativa: MTP a profundidad 3, activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia: hasta 4 peticiones simultaneas.
- Salida maxima: 4.096 tokens por peticion (preset `max_tokens`).
- Audio: no soportado (marcado como no aplicable en la model card).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone una API compatible con OpenAI, de modo que cualquier cliente (IDE, CLI, plugin) puede apuntar a `127.0.0.1:8080/v1/chat/completions` sin adaptadores. El modo thinking por defecto favorece tareas de razonamiento sobre codigo.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto nativo (195.584 en la R9700) y un prefill medido de 1.056,5 tok/s con documento de 32k en Strix Halo, es viable resumir o extraer informacion de contratos, informes o bases de codigo de decenas de miles de tokens en una sola peticion.
- Analisis de imagenes con texto asociado: la entrada multimodal via `image_url` permite describir capturas, extraer texto de documentos escaneados o responder preguntas sobre diagramas, con el proyector F16 incluido en el paquete.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` estilo OpenAI permite construir bucles de agente multi-paso (consulta de APIs, ejecucion de funciones, recuperacion de datos) contra el endpoint local, sin depender de un proveedor externo.
- Inferencia por lotes en pequeno cluster de GPU AMD: con 4 peticiones concurrentes y un agregado de decodificacion de 51,2 tok/s de techo en Strix Halo (sin drafting en esa fila), el paquete sirve para tareas de clasificacion, extraccion o generacion por lotes en un unico nodo.
- Prototipado y evaluacion de modelos de 27B en hardware de consumo: al ser un GGUF Q4_K_M sin modificar con una ruta de despliegue reproducible (`loom-fetch` + `loom-serve`), sirve para comparar calidad y latencia frente a llama.cpp ROCm en el mismo hardware antes de comprometerse con un stack.

## Benchmarks y rendimiento

Rendimiento en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). Las columnas de llama.cpp y Loom no estan medidas en la model card (marcadas con "—"); se reproduce el techo roofline publicado y las notas metodologicas.

| Metrica | llama.cpp | Loom | Roofline (techo) |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | no medido | no medido | 32,6 |
| Decodificacion tok/s, contexto 2k | no medido | no medido | 32,0 |
| Decodificacion tok/s, contexto 32k | no medido | no medido | 29,1 |
| Prefill tok/s, documento 1k | no medido | no medido | 1185,9 |
| Prefill tok/s, documento 2k | no medido | no medido | 1181,2 |
| Prefill tok/s, documento 8k | no medido | no medido | 1154,0 |
| Prefill tok/s, documento 16k | no medido | no medido | 1119,5 |
| Prefill tok/s, documento 32k | no medido | no medido | 1056,5 |
| 4 streams, decodificacion agregada tok/s | no medido | no medido | 51,2 |
| Tokens borrador aceptados (speculative decoding) | n/a | no medido | n/a |

Notas metodologicas publicadas: comparacion contra llama.cpp ROCm con el mismo GGUF, mismo runner y mismos prompts; Loom servido con espera activa; Loom cronometrado por el cliente y llama.cpp por su servidor. Las filas de un solo stream usan MTP profundidad 3 en Loom y ninguna tecnica de drafting en llama.cpp (no es la misma eleccion en ambos motores). La fila de 4 streams se ejecuta sin drafting en ambos motores. El techo roofline se calcula para 216 GB/s y 59 TFLOP/s con `loom-roofline` (`roofline.py`, `loom-skills` `acd9ac7`), con aceptacion medida del 51 % (corto), 50 % (2k) y 51 % (32k). Mediciones realizadas en runners AMD DevLab Dispatch Strix Halo (`devlab-perf`), con runners que difieren entre sesiones.

En AMD Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han re-medido.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete se sirve con `--memory_bytes=52000000000` (52 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700. En la R9700 ese limite restringe el contexto util a 195.584 tokens por peticion.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU en la model card.
- GPU de consumo: no se indica compatibilidad con GPU consumer NVIDIA ni con otras GPU AMD distintas de las dos anteriores.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch ... --materialize=copy --output=qwen3.8-27b` y servicio con `loom-serve --model=qwen3.8-27b/model.json '--device=amdgpu://?completion_spin_ns=4294967295' --memory_bytes=...`. El servidor escucha en `127.0.0.1:8080` y responde a `/v1/chat/completions` estilo OpenAI.
- Otros runtimes: el GGUF subyacente es compatible con llama.cpp (se usa como referencia en la comparativa), pero el paquete Loom no documenta recetas para vLLM, TGI u Ollama.
- Latencia y throughput: techos roofline en Strix Halo de 32,6 tok/s (decodificacion, prompt corto), 29,1 tok/s (contexto 32k), 1.185,9 tok/s (prefill 1k) y 51,2 tok/s agregados con 4 streams. No hay valores medidos de Loom ni de llama.cpp publicados en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski/Qwen3.8-27B-loom (este paquete) | 27B | 262.144 (195.584 en R9700) | GGUF Q4_K_M empaquetado en Loom; solo GPU AMD Strix Halo y R9700 | Apache 2.0 | Vision, tool calling, thinking, MTP depth 3 |
| bartowski/Qwen3.8-27B-GGUF (modelo base del paquete) | 27B | no disponible | GGUF para llama.cpp y derivados | Apache 2.0 (segun este paquete) | Checkpoint sin modificar; sin optimizaciones Loom |
| llama.cpp ROCm sobre el mismo GGUF | 27B | no disponible | GGUF + llama.cpp | Apache 2.0 (del paquete) | Referencia de comparacion en la model card; sin drafting en las filas de un stream |

No se dispone de datos de otros modelos comparables (parametros, contexto, rendimiento, licencia) en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: es un empaquetado de inferencia de un GGUF de terceros. Cualquier limitacion del modelo base Qwen3.8-27B se hereda sin cambios.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase corresponde a una build anterior (sha256 `f2da83e`). En la R9700 no se han re-medido.
- La comparativa de rendimiento frente a llama.cpp no incluye valores medidos de ninguno de los dos motores: solo techos roofline. No es posible extraer conclusiones de velocidad relativa a partir de la model card.
- La metodologia no es simetrica en las filas de un stream: Loom usa MTP profundidad 3 y llama.cpp no usa drafting. Los argumentos del servidor llama.cpp ROCm no estan registrados.
- Los runners AMD DevLab difieren entre sesiones, lo que anade variabilidad no cuantificada a las mediciones.
- Contexto reducido en la R9700: 195.584 tokens frente a los 262.144 nativos, por el limite de `--memory_bytes=34000000000`.
- Salida maxima de 4.096 tokens por peticion, lo que limita generaciones largas en una sola llamada.
- Concurrencia maxima de 4 peticiones; no se documenta comportamiento bajo mayor carga.
- Sin soporte de audio.
- Idiomas soportados no documentados en el paquete.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse sobre el modelo base.
- Licencia Apache 2.0 declarada en el paquete, pero la procedencia y los terminos del checkpoint base deben verificarse en `bartowski/Qwen3.8-27B-GGUF` antes de un uso comercial.
- El repositorio no registra descargas ni likes y esta en un espacio de staging (`loom-fun-staging`), lo que sugiere que el paquete no es una version estable.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-fun-staging/bartowski-Qwen3.8-27B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
