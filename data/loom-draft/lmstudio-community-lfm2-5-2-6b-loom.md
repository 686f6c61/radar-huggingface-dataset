# loom-draft/lmstudio-community-LFM2.5-2.6B-loom

## Resumen

LFM2.5-2.6B-loom es un paquete de despliegue para AMD Loom, no un modelo entrenado desde cero. Lo publica el usuario loom-draft y contiene programas `.loom` y una tarjeta `model.json` generados con la herramienta loom-next (sin intervención de un LLM en el bucle) a partir del checkpoint GGUF sin modificar `LFM2.5-2.6B-Q4_K_M.gguf` de lmstudio-community. El objetivo es servir el modelo LFM2.5-2.6B en GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, LFM2.5-2.6B, es un transformer de 2.600 millones de parametros distribuido en cuantizacion Q4_K_M. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y mantiene el modo de razonamiento siempre activo. La ventana de contexto anunciada es de 128.000 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es practica: permite ejecutar un modelo de 2,6B en hardware AMD consumer y profesional mediante el runtime Loom (paquete `hrx-loom[hf]==0.2.0`), sin depender de llama.cpp. No obstante, la propia tarjeta indica que las medidas de rendimiento y las puertas de correccion para este paquete aun no se han vuelto a medir en ninguna de las dos GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2.5-2.6B); runtime Loom sobre AMDGPU |
| Parametros totales | 2.600 millones (2,6B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos) |
| Formato de pesos | GGUF (`LFM2.5-2.6B-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza el checkpoint GGUF de LFM2.5-2.6B publicado por lmstudio-community en cuantizacion Q4_K_M. La capa aportada por Loom consiste en programas `.loom` generados automaticamente por loom-next a partir de `llm_config.json`, junto con el tokenizador (`tokenizer.json`) y un fichero `info.json` con medidas, evidencias de puertas de correccion y versiones. El runtime `loom-serve` ejecuta esos programas sobre AMDGPU mediante el esquema `amdgpu://`, con opciones de espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa: la tabla de caracteristicas marca la decodificacion especulativa como no aplicable, igual que la entrada de imagen y la de audio. El modo de razonamiento esta siempre activo y no admite ajuste de esfuerzo (`reasoning effort: not applicable`).

## Capacidades

- Generacion de texto conversacional mediante API estilo OpenAI (`/v1/chat/completions`).
- Tool calling con el esquema `tools` y `tool_calls` de OpenAI.
- Razonamiento o modo thinking siempre activo (no configurable).
- Contexto largo de hasta 128.000 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por preset.
- Sin soporte de entrada de imagen ni de audio (marcado como no aplicable).
- Sin decodificacion especulativa (marcado como no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: servir el paquete con `loom-serve` en una Radeon AI PRO R9700 y consumir el endpoint `/v1/chat/completions` desde una interfaz propia, aprovechando la ventana de 128k tokens para conversaciones largas.
- Agentes con tool calling en local: el soporte de `tools` y `tool_calls` permite construir bucles multi-turno de llamadas a funciones (consulta de APIs internas, ejecucion de comandos) sin salir del hardware AMD.
- Procesamiento de documentos extensos: con 128.000 tokens de contexto se pueden resumir o extraer informacion de contratos, informes o transcripciones que no caben en modelos de contexto corto.
- Prototipado en APU Strix Halo: desplegar en el Ryzen AI Max+ 395 para pruebas de integracion en un equipo compacto antes de mover la carga a una GPU dedicada.
- Razonamiento asistido con traza: al estar el modo thinking siempre activo, encaja en tareas de analisis paso a paso donde interesa registrar la cadena de razonamiento (depuracion de logica, revision de codigo).
- Backend de chat para herramientas internas: la API compatible con OpenAI permite sustituir un proveedor en la nube por este paquete sin reescribir el cliente, manteniendo los datos en la maquina.
- Evaluacion comparativa de runtimes: usar las puertas de correccion de loom-benchmark (golden, compare, agent, sampling) para contrastar la salida de Loom frente a llama.cpp con el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que las medidas de rendimiento frente a llama.cpp no se han vuelto a medir ni en Strix Halo (gfx1151) ni en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de 2,6B ocupa del orden de 1,5-2 GB de pesos, a lo que hay que sumar el pool de memoria del preset y el espacio para 128k tokens de contexto y 4 peticiones concurrentes.
- GPU consumer: la informacion solo valida las dos GPU AMD citadas; no se confirma compatibilidad con RTX 4090 ni otras GPU NVIDIA.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles (medidas pendientes de repetir).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| LFM2.5-2.6B-loom (este paquete) | 2,6B | 128.000 tokens | Q4_K_M | other | Loom sobre AMDGPU |
| lmstudio-community/LFM2.5-2.6B-GGUF (base) | 2,6B | no disponible | GGUF (incluye Q4_K_M) | other | llama.cpp y compatibles |
| Otros modelos de ~2-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el propio checkpoint base servido con llama.cpp, que la tarjeta usa como referencia de correccion (tokens greedy y top-5 log-probs). No se aportan datos de otros modelos de tamano similar.

## Limitaciones y advertencias

- Paquete de despliegue, no un modelo nuevo: cualquier limitacion del checkpoint LFM2.5-2.6B-Q4_K_M subyacente se hereda.
- Rendimiento y correccion sin verificar: todas las puertas de correccion y las medidas frente a llama.cpp estan pendientes de repetir en ambas GPU objetivo.
- Licencia "other": es necesario revisar los terminos del modelo base antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede asumir calidad multilingue.
- Modo thinking siempre activo, sin posibilidad de desactivarlo ni de ajustar el esfuerzo de razonamiento, lo que puede incrementar latencia y consumo de tokens.
- Sin soporte de imagen ni audio, y sin decodificacion especulativa.
- Muestreo marcado como "not determined": el comportamiento de temperatura, top_k y semilla no esta confirmado.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por preset.
- Compatibilidad restringida a las GPU AMD indicadas; no hay evidencia de funcionamiento en otras plataformas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero aplicables a cualquier modelo de 2,6B en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema joven y poca validacion externa.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/lmstudio-community-LFM2.5-2.6B-loom
- Modelo base GGUF: https://huggingface.co/lmstudio-community/LFM2.5-2.6B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
