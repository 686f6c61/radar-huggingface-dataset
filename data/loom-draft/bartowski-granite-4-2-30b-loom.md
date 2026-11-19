# loom-draft/bartowski-granite-4.2-30b-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y un fichero `model.json`) generado a partir del checkpoint GGUF no modificado `granite-4.2-30b-Q4_K_M.gguf` de `bartowski/granite-4.2-30b-GGUF`. El autor, `loom-draft`, lo publica para dos aceleradores concretos: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, que produce los programas Loom sin intervención de un LLM en el bucle.

El interés practico esta en que permite servir un modelo de 30 mil millones de parametros cuantizado a Q4_K_M sobre hardware AMD consumer y de estacion de trabajo mediante `loom-serve`, con una API compatible con OpenAI en `/v1/chat/completions`, contexto de 131.072 tokens por peticion y hasta 4 peticiones concurrentes. No aporta pesos nuevos ni fine-tuning: la calidad del modelo es la del checkpoint Granite 4.2 30B original; lo que cambia es el runtime y el empaquetado especifico para ROCm.

La relevancia es acotada pero clara para quien trabaja con GPUs AMD: ofrece una via de despliegue nativa (sin pasar por llama.cpp) con verificacion de integridad por sha256 en `loom-fetch` y un conjunto de puertas de correccion (`gates.sh`) pensadas para comparar la salida contra llama.cpp. En el momento de la publicacion, ninguna de esas puertas tiene mediciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint Granite 4.2 30B; el paquete no la documenta) |
| Parametros totales | no disponible (el nombre del checkpoint indica 30B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como `weights.loom` y programas `.loom`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente ni sus datos de entrenamiento; esa informacion corresponde a la model card de Granite 4.2 30B y a `bartowski/granite-4.2-30b-GGUF`, no a este paquete. Lo que si se describe es la capa de despliegue: `loom-next` genera programas Loom a partir del GGUF, y el paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en el momento de la descarga, ademas de `tokenizer.json` y `llm_config.json`.

El paquete expone dos presets, `chat` (Strix Halo) y `chat-r9700` (R9700), que se seleccionan en el `loom-fetch`. El servidor admite opciones de ejecucion como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, que consume CPU mientras hay trabajo en vuelo y que es la configuracion usada en las mediciones de rendimiento de la tarjeta), `--pool_backing=fixed` (reserva por adelantado el pool de memoria del preset en lugar de crecimiento elastico) y `--parameter_mode=preload` (solo afecta a como se cargan los pesos en el host). El modo de razonamiento esta activado por defecto y se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Modo de razonamiento / thinking activado por defecto, desactivable por peticion.
- Contexto largo de 131.072 tokens por peticion, adecuado para documentos extensos.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset).
- Tool calling: marcado como «not applicable» en la tabla de caracteristicas del paquete.
- Reasoning effort configurable: «not applicable».
- Decodificacion especulativa: «not applicable».
- Entrada de imagen: «not applicable».
- Entrada o salida de audio: «not applicable».
- Muestreo (temperature, top_k, seed): estado «not determined» en la model card, aunque existe una puerta de correccion `sampling` prevista.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estacion de trabajo AMD: desplegando el preset `chat-r9700` en una Radeon AI PRO R9700 de 32 GB se obtiene un endpoint compatible con OpenAI en `127.0.0.1:8080`, util para prototipar sin depender de servicios en la nube.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por peticion se pueden enviar contratos, informes o bases de codigo completas en una sola llamada, sin trocear el material.
- Razonamiento asistido con traza: el modo thinking activo por defecto permite obtener cadenas de razonamiento en tareas de analisis; para respuestas directas se desactiva con `enable_thinking: false`, reduciendo latencia y tokens generados.
- Evaluacion comparativa de runtimes en AMD: las puertas `golden`, `compare` y `logits` estan disenadas para contrastar token a token la salida de Loom contra la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad de un backend alternativo antes de adoptarlo.
- Laboratorio de inferencia en APU: el preset `chat` para Strix Halo (gfx1151) permite ejecutar un modelo de 30B cuantizado en una APU con memoria unificada, sin GPU dedicada, para experimentacion y desarrollo.
- Pruebas de concurrencia y consistencia: la puerta `consistency` verifica que 4 peticiones concurrentes producen la misma salida que ejecutadas por separado, un escenario util para validar un servicio antes de exponerlo a varios usuarios.
- Integracion en pipelines internos con requisito de trazabilidad: `model.json.lock` fija los ficheros fuente con sha256, lo que facilita la reproducibilidad de despliegues en entornos con control de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB), «the results for this package are not yet re-measured», y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». Una puerta sin ejecucion registrada no constituye evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el peso es Q4_K_M de un modelo de 30B y el preset `chat-r9700` esta pensado para una GPU de 32 GB. El preset `chat` esta pensado para Strix Halo, con memoria unificada.
- GPU soportadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera programas para dispositivos AMD via ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp aparece unicamente como referencia de correccion.
- Memoria: `--pool_backing=fixed` reserva el pool del preset por adelantado; `--parameter_mode=preload` altera la carga de pesos en el host.
- Latencia y throughput: no disponibles; las mediciones de la tarjeta no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/bartowski-granite-4.2-30b-loom | 30B (segun nombre del checkpoint) | 131.072 tokens | GGUF empaquetado en Loom | Apache 2.0 | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| bartowski/granite-4.2-30b-GGUF | 30B | no disponible | GGUF | Apache 2.0 (heredada) | Checkpoint base; ejecutable con llama.cpp y otros runtimes GGUF |
| Otros paquetes Loom de `loom-draft` | no disponible | no disponible | Loom | Apache 2.0 | Mismo esquema de empaquetado para hardware AMD |

La comparacion relevante es contra el propio checkpoint de origen: el paquete Loom no modifica los pesos, de modo que cualquier diferencia en calidad o velocidad proviene del runtime, no del modelo. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un empaquetado de despliegue. Cualquier limitacion del checkpoint Granite 4.2 30B (sesgos, alucinacion, cobertura idiomatica) se hereda sin cambios.
- Sin evidencia de correccion: todas las puertas de `gates.sh` figuran como no re-medidas, por lo que no hay verificacion publicada de que la salida coincida con la referencia de llama.cpp.
- Sin datos de rendimiento: no hay mediciones de latencia ni throughput para este paquete en ninguno de los dos aceleradores objetivo.
- Cobertura de hardware muy restringida: solo AMD gfx1151 y gfx1201; no hay soporte documentado para NVIDIA ni para otras GPUs AMD.
- Tool calling no soportado segun la tabla de caracteristicas («not applicable»), lo que descarta flujos de agentes con funciones en este paquete.
- Sin vision ni audio («not applicable»); la puerta `vision` existe en el esquema pero no aplica a este modelo.
- Limite de 4.096 tokens de salida por peticion y 4 peticiones concurrentes, que pueden quedarse cortos en cargas de produccion.
- El muestreo figura como «not determined»: no hay garantia documentada sobre el comportamiento de temperature, top_k y seed.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo de GPU en vuelo; conviene evaluar su impacto en el host.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones del checkpoint base y de las dependencias del runtime (`hrx-loom`).
- Repositorio sin descargas ni likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-19): madurez y mantenimiento no verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-granite-4.2-30b-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/granite-4.2-30b-GGUF
- Runtime AMD Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
