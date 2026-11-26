# loom-draft/mradermacher-zaki-brain-v2-i1-loom

## Resumen

`loom-draft/mradermacher-zaki-brain-v2-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/zaki-brain-v2-i1-GGUF`, en concreto la cuantizacion `zaki-brain-v2.i1-Q4_K_M.gguf`. No se trata de un modelo entrenado desde cero, sino de un artefacto de empaquetado orientado a la ejecucion eficiente del modelo base sobre GPUs AMD concretas: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` dentro del ecosistema Loom, y se genera con la herramienta `loom-next` sin intervencion de un LLM en el proceso.

El interes practico reside en que ofrece una via de servicio compatible con la API de OpenAI (`/v1/chat/completions`) sobre hardware AMD, con soporte declarado de tool calling, modo de razonamiento opcional y una ventana de contexto de 131.072 tokens por peticion. El repositorio, sin embargo, esta practicamente vacio (0,0 GB) y no incluye pesos en si: el paquete se descarga mediante `loom-fetch` desde Hugging Face y se sirve con `loom-serve`.

La informacion disponible es muy limitada: no se detallan parametros totales, arquitectura interna del modelo base, idiomas soportados ni resultados de benchmarks. Las propias mediciones de rendimiento y las puertas de correccion del paquete figuran como "not yet re-measured" (aun no re-medidas), por lo que no hay evidencia publicada de su comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GGUF; el paquete Loom genera kernels para AMD) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (origen) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura de red neuronal propia: envuelve el checkpoint GGUF `zaki-brain-v2.i1-Q4_K_M.gguf` del autor `mradermacher`, que a su vez es una version cuantizada del modelo `zaki-brain-v2-i1`. La innovacion del artefacto es de compilacion y despliegue: `loom-next` genera programas `.loom` (kernels y logica de ejecucion) especificos para las arquitecturas AMD gfx1151 y gfx1201, junto con `tokenizer.json` y `model.json` con los ficheros fuente fijados por hash SHA-256.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, la composicion de los datos ni si hubo RLHF o DPO. Tampoco se documentan tecnicas como decodificacion especulativa: la tabla de caracteristicas del paquete marca "speculative decoding" como no aplicable y "reasoning effort" como no aplicable. El modo de razonamiento es un interruptor binario (`enable_thinking`), desactivado por defecto.

## Capacidades

- Generacion de texto conversacional mediante API estilo OpenAI (`/v1/chat/completions`).
- Tool calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento ("thinking") opcional, activable con `chat_template_kwargs: {"enable_thinking": true}`; desactivado por defecto.
- Ventana de contexto de 131.072 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Entrada de imagen: no determinada ("not determined").
- Entrada y salida de audio: no determinada ("not determined").
- Capacidades multilingues: no disponibles.
- Agentes multi-turno: el paquete incluye puertas de prueba `agent` y `agent_think_off` para bucles de tool calling, pero sin resultados registrados.

## Casos de uso

- Servicio de chat sobre hardware AMD: desplegar un endpoint compatible con OpenAI en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395, usando `loom-serve` y el cliente `curl` o cualquier SDK compatible, sin necesidad de CUDA.
- Asistente con contexto largo: procesar documentos de hasta 131.072 tokens por peticion, util para resumir expedientes extensos o analizar bases de codigo completas en una sola llamada.
- Automatizacion con herramientas: integrar tool calling en flujos de agentes que consulten APIs externas, ya que el paquete expone `tools` y `tool_calls` con el formato de OpenAI.
- Razonamiento con coste controlado: activar `enable_thinking` solo en peticiones que lo requieran y mantenerlo desactivado por defecto para reducir latencia en consultas simples.
- Despliegue en estaciones de trabajo con GPU AMD: servir el modelo en un equipo con R9700 de 32 GB para entornos de desarrollo internos, aprovechando la cuantizacion Q4_K_M para reducir el consumo de memoria.
- Prototipado de agentes multi-turno: usar las puertas `agent` y `agent_think_off` del ecosistema Loom para validar la representacion exacta del prompt y la reutilizacion de historial antes de pasar a produccion.
- Evaluacion de portabilidad entre backends: comparar la salida del paquete Loom con la referencia de llama.cpp sobre el mismo GGUF mediante las puertas `golden` y `compare`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el checkpoint es Q4_K_M y el paquete esta pensado para una GPU de 32 GB (Radeon AI PRO R9700) y para el Ryzen AI Max+ 395 con memoria unificada.
- GPU soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs de consumo; el soporte declarado se limita a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` y servicio con `loom-serve`; el paquete no esta pensado para vLLM, llama.cpp, Ollama ni TGI, aunque la referencia de correccion se toma contra llama.cpp.
- Opciones de servicio: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones en GPU.
- Latencia y throughput: no disponibles; las cifras de rendimiento aun no se han re-medido.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento del modelo base que permitan una comparacion fiable con alternativas de la misma categoria. Como referencia de categoria, el propio paquete se compara funcionalmente con llama.cpp sobre el mismo GGUF, pero sin resultados publicados.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| zaki-brain-v2-i1 (paquete Loom) | no disponible | 131.072 | MIT | publicado, sin benchmarks |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | MIT (herramienta) | referencia de correccion |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB y no contiene los pesos: es necesario descargarlos con `loom-fetch` desde el paquete de Hugging Face, lo que anade un paso y una dependencia de red.
- No hay benchmarks publicados ni puertas de correccion registradas; no existe evidencia publicada de que la salida coincida con llama.cpp en produccion.
- Las mediciones de rendimiento frente a llama.cpp estan pendientes de re-medicion en ambas plataformas.
- El soporte de hardware esta restringido a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta compatibilidad con otras GPUs.
- Entrada de imagen, audio y esquema de muestreo figuran como "not determined"; no deben asumirse.
- El limite de 4.096 tokens de salida por peticion puede ser insuficiente para tareas de generacion larga.
- La concurrencia esta limitada a 4 peticiones simultaneas.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo base.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base `mradermacher/zaki-brain-v2-i1-GGUF` antes de desplegar.
- El modelo base es una cuantizacion Q4_K_M, con la perdida de precision asociada frente a pesos completos.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-zaki-brain-v2-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/zaki-brain-v2-i1-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
