# loom-draft/zerofata-G4-LuneLight-v1.1-31B-loom

## Resumen

`loom-draft/zerofata-G4-LuneLight-v1.1-31B-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `zerofata/G4-LuneLight-v1.1-31B-GGUF` (concretamente `G4-LuneLight-v1.1-31B-Q4_K_M.gguf`) junto con programas `.loom` y un fichero `model.json` que describen como ejecutarlo sobre GPUs AMD. El autor del repositorio es `loom-draft` y el paquete se genero con `loom-next`, el generador de Loom, sin intervencion de un LLM en el proceso.

El objetivo es ofrecer una via de inferencia nativa en hardware AMD (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201 con 32 GB) con una API compatible con OpenAI, soporte de tool calling y modo de razonamiento opcional. El modelo subyacente es un modelo de lenguaje de 31B (segun la nomenclatura del checkpoint) del que no se documentan en esta ficha ni la arquitectura interna, ni los datos de entrenamiento, ni los benchmarks.

La relevancia es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano del repo es de 0,0 GB (los pesos se obtienen via `loom-fetch` desde el repositorio base) y las mediciones de rendimiento y correctitud figuran como "not yet re-measured". Se trata, por tanto, de un artefacto de integracion en fase temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `zerofata/G4-LuneLight-v1.1-31B-GGUF`; el paquete solo define el runtime Loom) |
| Parametros totales | 31B (segun el nombre del checkpoint; no verificado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 55.296 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF; el paquete distribuye programas `.loom` y `model.json` / `model.json.lock` con hashes sha256 de los ficheros fuente |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base (tipo de transformer, atencion, posible mezcla de expertos, etc.) ni sobre su proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de alineacion. La model card del paquete Loom no describe el modelo, sino el artefacto de despliegue.

Lo que si documenta el paquete es la capa de ejecucion: kernels generados por `loom-next` para las arquitecturas AMD gfx1151 y gfx1201, con verificacion de integridad de los ficheros fuente mediante sha256 (`model.json.lock`), un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). La opcion `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU consumiendo CPU mientras hay trabajo en vuelo. No se documenta decodificacion especulativa (figura como "not applicable") ni tecnicas de atencion alternativa.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Razonamiento multi-turno con reutilizacion de historial y renderizado exacto del prompt (segun los gates `agent` y `agent_think_off` definidos, aunque sin mediciones registradas).
- Concurrencia de 4 peticiones con consistencia respecto a ejecuciones aisladas (gate `consistency`).
- Lectura de logits en host (`llm.logits`), util para evaluacion y depuracion.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tiene.
- Entrada/salida de audio: no soportada por Loom, aunque el modelo upstream la tiene.
- Sampling: estado "not determined" en la tabla de caracteristicas; existe un gate `sampling` para verificar temperatura, top_k y semilla frente a llama.cpp.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional en estaciones de trabajo AMD: el paquete permite servir el modelo en Strix Halo o R9700 con `loom-serve` y consumirlo por HTTP desde cualquier cliente compatible con la API de OpenAI, sin necesidad de CUDA.
- Agentes con tool calling en local: con soporte de `tools`/`tool_calls` y 55.296 tokens de contexto por peticion, se puede construir un agente que consulte APIs internas, ejecute funciones y mantenga historial largo en una sola maquina.
- Procesamiento de documentos largos: la ventana de 55.296 tokens permite resumir, extraer entidades o responder preguntas sobre contratos, informes o codigo de decenas de miles de tokens en una unica peticion.
- Evaluacion comparativa frente a llama.cpp: los gates `golden`, `compare`, `logits` y `decision` estan disenados para verificar que la salida codiciosa y las distribuciones top-5 coinciden con la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad del backend Loom.
- Banchmarking de hardware AMD: el paquete incluye presets separados por dispositivo (`chat` para gfx1151 y `chat-r9700` para gfx1201), lo que facilita medir latencia y throughput en cada GPU con la misma carga.
- Servicio interno de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en herramientas internas de equipo (generacion de codigo, redaccion asistida, resumen de reuniones) donde no se requiere alta disponibilidad.
- Reproducibilidad de despliegues: el `model.json.lock` con hashes sha256 permite reconstruir exactamente el paquete servido, util en entornos con requisitos de auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todos los gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es de 31B en Q4_K_M; como referencia orientativa de orden de magnitud, una cuantizacion de 4 bits de un modelo de 31B suele requerir del orden de 18-20 GB solo para pesos, mas overhead de contexto y KV cache, pero esta cifra no esta confirmada en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para RTX 4090, A100, H100 ni otras GPU NVIDIA; el paquete esta generado especificamente para arquitecturas AMD gfx1151 y gfx1201.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete, aunque llama.cpp se usa como referencia de correctitud.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.
- Parametros de ejecucion relevantes: `--pool_backing=fixed` (pool de memoria comprometido por adelantado), `--parameter_mode=preload` (solo afecta a la carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto, rendimiento o licencia. El unico punto de referencia mencionado es llama.cpp, usado como implementacion de referencia para los gates de correctitud sobre el mismo fichero GGUF, no como modelo alternativo.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y el tamano del repo es de 0,0 GB: los pesos no se alojan aqui, se obtienen via `loom-fetch` desde el repositorio base.
- No hay mediciones de rendimiento ni de correctitud registradas: todos los gates y las comparativas frente a llama.cpp figuran como "not yet re-measured". No hay evidencia publicada de que la salida coincida con la referencia.
- El soporte esta restringido a dos arquitecturas AMD (gfx1151 y gfx1201); no se documenta compatibilidad con NVIDIA ni con otras GPU AMD.
- La entrada de imagen y el audio no estan soportados por Loom aunque el modelo upstream los tenga: funcionalidad perdida respecto al checkpoint original.
- La decodificacion especulativa figura como "not applicable" y el estado del sampling como "not determined".
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, lo que restringe escenarios de alta carga o generaciones muy largas.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni calidad del modelo base; estos aspectos deben evaluarse contra el repositorio `zerofata/G4-LuneLight-v1.1-31B-GGUF`.
- Licencia MIT declarada en el paquete, lo que en principio permite uso comercial, pero la licencia del checkpoint base debe verificarse por separado antes de produccion.
- El modo thinking esta desactivado por defecto; activarlo cambia el formato de la respuesta y debe gestionarse en el cliente.
- Los resultados de busqueda web disponibles corresponden a Loom (la herramienta de grabacion de pantalla) y a la marca de ropa Loom, no al runtime AMD Loom; no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/zerofata-G4-LuneLight-v1.1-31B-loom
- Checkpoint base: https://huggingface.co/zerofata/G4-LuneLight-v1.1-31B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
