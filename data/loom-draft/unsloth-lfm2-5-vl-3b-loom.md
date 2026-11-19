# loom-draft/unsloth-LFM2.5-VL-3B-loom

## Resumen

LFM2.5-VL-3B-loom es un paquete de despliegue en formato `.loom` generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `unsloth/LFM2.5-VL-3B-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce el GGUF original a programas Loom (`.loom`) y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervencion de un LLM en el proceso. El objetivo es ejecutar el modelo sobre GPUs AMD concretas mediante el runtime `loom-serve`, parte del ecosistema Loom (repositorio `ROCm/hrx-system`).

El modelo subyacente es LFM2.5-VL-3B, un modelo multimodal de 3.000 millones de parametros con capacidad de vision y una ventana de contexto de 128.000 tokens por peticion. La particularidad de este paquete es que el runtime Loom **no soporta entrada de imagen**, pese a que el modelo original si la tiene; en la practica, este artefacto se comporta como un modelo de texto con tool calling y modo de razonamiento siempre activo. El paquete esta orientado a dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia es acotada pero concreta: cubre el nicho de inferencia de un modelo de 3B con contexto largo sobre GPUs AMD de consumo y professional, mediante un runtime alternativo a llama.cpp con API compatible con OpenAI. No obstante, la propia model card indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `agent`, etc.) **no se han vuelto a medir** para este paquete, por lo que no hay evidencia publicada de su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5-VL-3B; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 3B (segun nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos no detallados) |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si (formato OpenAI `tools` / `tool_calls`) |
| Modo razonamiento | Si, siempre activo (sin control de esfuerzo) |
| Entrada de imagen | No soportada por Loom (el modelo base si la tiene) |
| Decodificacion especulativa | No aplicable |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM2.5-VL-3B en la documentacion proporcionada: no se detalla si es un transformer denso, un modelo hibrido ni la composicion de su dataset de entrenamiento, numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO. Lo unico confirmado es que el modelo base es multimodal (vision + lenguaje) y que el checkpoint utilizado es una cuantizacion GGUF `Q4_K_M` de 3B parametros.

El artefacto en si no introduce cambios en los pesos: el paquete `.loom` contiene programas generados (`program/*.loom`, `weights.loom`), el tokenizador (`tokenizer.json`), la configuracion (`llm_config.json`) y metadatos de medicion (`info.json`, `REPORT.md`). La generacion se realizo con `loom-next` de forma automatica, sin un LLM en el bucle. El runtime aplica un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`), y permite espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 128.000 tokens por peticion.
- Razonamiento en modo "thinking" siempre activo (no configurable, sin parametro de esfuerzo de razonamiento).
- Tool calling / function calling en formato compatible con OpenAI (`tools` y `tool_calls`), incluyendo bucles de agente multi-turno.
- Soporte de hasta 4 peticiones concurrentes con consistencia de salida declarada (aunque la puerta `consistency` no se ha re-medido).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: el modelo base la soporta, pero **el runtime Loom no la expone**; la entrada de imagen no esta disponible en este paquete.
- Audio: no aplicable.

## Casos de uso

- **Asistente conversacional con contexto largo sobre GPU AMD**: el modelo puede mantener conversaciones de hasta 128.000 tokens, adecuado para analisis de documentos extensos o historiales de chat largos en un solo equipo con Strix Halo o R9700, sin depender de CUDA.
- **Agentes con tool calling en local**: gracias al soporte de `tools`/`tool_calls` en formato OpenAI y al bucle de agente multi-turno, se puede integrar en orquestadores de agentes (LangChain, LlamaIndex, etc.) que apunten a un endpoint OpenAI-compatible en `127.0.0.1:8080`.
- **Prototipado en hardware AMD de consumo**: para desarrolladores con Ryzen AI Max+ 395 que quieran validar flujos de inferencia sin GPU NVIDIA, el paquete ofrece un camino listo para `pipx install hrx-loom[hf]` y `loom-serve`.
- **Servicio interno de bajo volumen**: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en herramientas internas de resumen, clasificacion o extraccion sobre documentos de hasta 128k tokens.
- **Evaluacion comparativa de runtimes**: util como banco de pruebas para comparar `loom-serve` frente a llama.cpp sobre el mismo GGUF, aunque las mediciones de rendimiento de este paquete aun no estan re-medidas.
- **Despliegue en estaciones de trabajo con Radeon AI PRO R9700**: al disponer de 32 GB de VRAM y soporte para gfx1201, permite servir un modelo de 3B con contexto largo en una workstation profesional AMD.
- **Generacion de codigo asistida en local**: el modelo base es de proposito general y el runtime expone tool calling, lo que permite integrarlo en editores o pipelines que invoquen herramientas externas, siempre que no se requiera vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Asimismo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", por lo que no hay evidencia registrada de fidelidad frente a llama.cpp ni de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 3B, lo que en la practica supone unos pocos GB de pesos, pero el pool de memoria del runtime se reserva de forma fija y la cifra exacta no se publica.
- **GPUs soportadas**: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPUs.
- **Compatibilidad con GPU de consumo**: si, en el caso de Strix Halo (APU con memoria unificada); la R9700 es una GPU profesional de 32 GB. No se indica soporte para GPUs NVIDIA ni para otras Radeon.
- **Despliegue**: runtime `loom-serve` del ecosistema Loom, instalado via `pipx install "hrx-loom[hf]==0.2.0"`; descarga de paquetes con `loom-fetch`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- **Flags recomendados**: `--pool_backing=fixed`, `--parameter_mode=preload`, `--device=amdgpu://?completion_spin_ns=4294967295`.
- **Latencia y throughput**: no disponibles; las mediciones no se han re-medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Runtime |
|---|---|---|---|---|---|---|
| LFM2.5-VL-3B-loom (este paquete) | 3B | 128.000 | No (en Loom) | Si | other | loom-serve (AMD) |
| unsloth/LFM2.5-VL-3B-GGUF (base) | 3B | no disponible | Si | no disponible | other | llama.cpp y otros |
| Alternativas de 3B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables adicionales en la informacion proporcionada; la comparativa se limita al propio checkpoint base, del que este paquete es un empaquetado.

## Limitaciones y advertencias

- **Sin evidencia de rendimiento ni correccion**: todas las puertas de benchmark y las mediciones de rendimiento figuran como no re-medidas; no hay datos publicados que respalden el comportamiento del paquete.
- **Sin vision**: aunque el modelo base es multimodal, el runtime Loom no soporta entrada de imagen, por lo que la capacidad visual queda inutilizada en este artefacto.
- **Razonamiento no configurable**: el modo thinking esta siempre activo y no existe parametro de esfuerzo de razonamiento, lo que puede incrementar latencia y consumo de tokens en tareas simples.
- **Concurrencia limitada**: solo 4 peticiones simultaneas y 4.096 tokens de salida maxima, insuficiente para cargas de produccion de alto volumen.
- **Licencia "other"**: los terminos exactos no se detallan en la informacion proporcionada; es imprescindible revisar la licencia del modelo base antes de un uso comercial.
- **Idiomas no declarados**: no se especifica cobertura linguistica, con el riesgo de comportamiento degradado en castellano u otros idiomas no verificados.
- **Riesgo de alucinacion**: inherente a un modelo de 3B; no se han publicado evaluaciones de fidelidad para este paquete.
- **Sesgos**: no documentados en la informacion disponible.
- **Dependencia de hardware AMD concreto**: solo se declaran dos aceleradores (gfx1151 y gfx1201); no hay soporte documentado para otras GPUs.
- **Artefacto derivado**: no es un fine-tune ni un modelo original; cualquier mejora o limitacion proviene del checkpoint `unsloth/LFM2.5-VL-3B-GGUF`.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/unsloth-LFM2.5-VL-3B-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/LFM2.5-VL-3B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
