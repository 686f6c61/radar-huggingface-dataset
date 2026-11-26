# loom-draft/QuantFactory-Cotype-Nano-loom

## Resumen

`loom-draft/QuantFactory-Cotype-Nano-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Cotype-Nano.Q4_K_M.gguf` (procedente de `QuantFactory/Cotype-Nano-GGUF`) como programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervención de un LLM en el bucle. Su objetivo es ejecutar ese GGUF concreto sobre hardware AMD específico: el SoC Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes practico esta en que ofrece una ruta de inferencia nativa sobre ROCm para un modelo pequeno cuantizado en Q4_K_M, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y una ventana de contexto de 32.768 tokens por peticion con 4 peticiones concurrentes. La licencia es MIT y el paquete se distribuye via Hugging Face mediante la CLI `hrx-loom[hf]==0.2.0`.

La informacion publicada no incluye el numero de parametros del modelo base, su arquitectura interna, los idiomas soportados ni resultados de benchmarks; la model card esta centrada en el empaquetado y en las puertas de correccion (gates) del runtime, que en esta version aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: QuantFactory/Cotype-Nano-GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado como programas Loom (`.loom`, `weights.loom`) + `tokenizer.json` + `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (Loom Serve) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base (transformer, MoE, hibrido u otra), el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La model card del paquete no describe el modelo en si, sino el proceso de generacion de kernels y programas Loom a partir del GGUF original mediante `loom-next`.

Lo relevante tecnicamente es el pipeline de empaquetado: `loom-next` genera programas `.loom` y `weights.loom` a partir de `llm_config.json`, junto con un `model.json` que fija los ficheros fuente con verificacion sha256 en `loom-fetch`. La tarjeta incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, con tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k. En esta version todas aparecen como "not yet re-measured", por lo que no hay evidencia registrada de su cumplimiento.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), lo que habilita bucles de agente multi-turno.
- Contexto de 32.768 tokens por peticion, adecuado para documentos medios y conversaciones largas.
- Concurrencia de 4 peticiones simultaneas con garantia declarada de consistencia (misma salida que en ejecucion aislada, pendiente de re-medicion).
- Salida maxima de 4.096 tokens por respuesta.
- Modo de razonamiento/thinking: no aplicable segun la model card.
- Esfuerzo de razonamiento configurable: no aplicable.
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada de imagen: no determinada ("?").
- Entrada/salida de audio: no determinada ("?").
- Muestreo (temperature, top_k, seed): no determinado ("?").

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone `/v1/chat/completions`, de modo que cualquier cliente compatible con OpenAI puede apuntar a `http://127.0.0.1:8080` sin adaptadores adicionales.
- Agentes con herramientas en entornos ROCm: el soporte de `tools`/`tool_calls` y la puerta `agent` (validacion de renderizado exacto del prompt, reutilizacion de historial y validez de las llamadas) lo hacen apto para flujos de funcion-calling en los que se necesita paridad con llama.cpp.
- Procesamiento de documentos de hasta 32k tokens: informes, contratos o transcripciones que quepan en la ventana de contexto pueden analizarse en una sola peticion, con 4.096 tokens de salida para el resumen o la extraccion.
- Prototipado y evaluacion de modelos pequenos en hardware de escritorio: al estar cuantizado en Q4_K_M y dirigido a una GPU de 32 GB, permite iterar sobre prompts y herramientas sin depender de un cluster.
- Servicio interno de bajo volumen: con 4 peticiones concurrentes y una unica GPU, encaja en equipos de desarrollo o demos internas donde el throughput no es critico.
- Validacion de portabilidad de GGUF sobre ROCm: util para comparar la salida del runtime Loom contra llama.cpp usando las mismas puertas de correccion (`golden`, `compare`, `logits`) antes de adoptar el stack en produccion.
- Integracion en pipelines de CI para modelos: el par `model.json`/`model.json.lock` con verificacion sha256 permite fijar artefactos reproducibles y detectar cambios en los ficheros fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explicitamente que "the results for this package are not yet re-measured". Tampoco hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta dirigido a una GPU de 32 GB (Radeon AI PRO R9700) y al SoC Strix Halo con memoria unificada.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU NVIDIA: no soportadas por este paquete, que depende del runtime AMD Loom sobre ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/QuantFactory-Cotype-Nano-loom:chat --materialize=copy --output=cotype-nano` y `loom-serve --model=cotype-nano '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Ajustes relevantes: `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU (consume CPU mientras hay trabajo en vuelo); `--pool_backing=fixed` reserva el pool de memoria por adelantado; `--parameter_mode=preload` solo cambia la carga de pesos en host.
- Latencia y throughput: no disponibles; las mediciones de la tarjeta no se han vuelto a realizar para este paquete.
- Alternativa de despliegue: llama.cpp se usa como referencia de correccion, pero el paquete distribuido es especifico de Loom Serve.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el tamano ni la familia del modelo base `Cotype-Nano`, por lo que no es posible establecer una comparacion fiable con alternativas de la misma categoria en parametros, contexto o rendimiento. Como referencia de runtime, la unica comparacion mencionada es contra llama.cpp sobre el mismo GGUF, pero sin cifras publicadas para este paquete.

## Limitaciones y advertencias

- Ausencia de evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", de modo que no hay validacion registrada frente a llama.cpp en esta version.
- Rendimiento sin medir: no hay datos de latencia ni throughput para Strix Halo ni para R9700, por lo que no puede dimensionarse un despliegue en produccion.
- Dependencia de hardware AMD: el paquete esta generado para gfx1151 y gfx1201; no es portable a GPU NVIDIA ni a otras arquitecturas sin regeneracion.
- Version de runtime fijada: requiere `hrx-loom[hf]==0.2.0`; cambios de version pueden alterar el comportamiento de los kernels generados.
- Capacidades no determinadas: entrada de imagen, audio y parametros de muestreo aparecen como "?" en la model card, por lo que no deben asumirse.
- Sin modo de razonamiento ni decodificacion especulativa: ambos figuran como "not applicable", lo que limita el uso en tareas que dependan de cadenas de pensamiento explicitas o de aceleracion especulativa.
- Concurrencia baja: 4 peticiones simultaneas y 4.096 tokens de salida maxima acotan el uso a cargas ligeras o medianas.
- Idiomas no declarados: la tarjeta no especifica cobertura linguistica, por lo que el rendimiento multilingue es desconocido.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al no haber evaluacion publicada del modelo base, deben asumirse los riesgos habituales de un modelo pequeno cuantizado en Q4_K_M.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `QuantFactory/Cotype-Nano-GGUF` antes de redistribuir.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/QuantFactory-Cotype-Nano-loom
- Modelo base GGUF: https://huggingface.co/QuantFactory/Cotype-Nano-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
