# loom-draft/mradermacher-Holo-3.1-4B-loom

## Resumen

Holo-3.1-4B-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF `mradermacher/Holo-3.1-4B-GGUF` (concretamente la cuantizacion `Holo-3.1-4B.Q4_K_M.gguf`), orientado a GPUs AMD. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, que produce programas `.loom` y una tarjeta `model.json` a partir del GGUF original, sin modificar los pesos. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de un artefacto de empaquetado para el runtime Loom sobre hardware AMD (Ryzen AI Max+ 395 "Strix Halo" con gfx1151 y Radeon AI PRO R9700 con gfx1201).

El modelo subyacente es Holo-3.1-4B, un modelo multimodal de tipo image-text-to-text de 4.000 millones de parametros aproximados (el dato exacto no esta disponible en la informacion proporcionada) que admite entrada de imagen mediante un proyector separado (`Holo-3.1-4B.mmproj-f16.gguf`). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento (thinking) activado por defecto y una ventana de contexto de 262.144 tokens por peticion, con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida segun el preset.

Su relevancia es acotada pero concreta: permite ejecutar un modelo multimodal de 4B en GPUs AMD de consumo y profesionales mediante el ecosistema Loom (basado en ROCm), con un flujo de despliegue reproducible a traves de `loom-fetch` y `loom-serve`. La licencia Apache 2.0 del paquete facilita su uso comercial, aunque la informacion sobre el modelo base es escasa y las mediciones de rendimiento y correccion del paquete aun no se han vuelto a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Holo-3.1-4B; paquete Loom generado con loom-next) |
| Parametros totales | 4B (segun denominacion del modelo base; cifra exacta no disponible) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 (`Holo-3.1-4B.mmproj-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en programas `.loom` + `model.json`; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Holo-3.1-4B (tipo de transformer, atencion, composicion del dataset o si hubo RLHF/DPO). Lo que si se documenta es la capa de empaquetado: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF original sin modificarlo, junto con `model.json` y `model.json.lock`, que fijan los ficheros de origen con verificacion de hash SHA-256 en `loom-fetch`. El paquete incorpora un proyector multimodal independiente en F16 para la entrada de imagenes.

El runtime Loom (instalado via `hrx-loom[hf]==0.2.0`) ejecuta los kernels generados sobre ROCm en las arquitecturas gfx1151 y gfx1201. La tarjeta describe opciones de servicio como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). No se documentan innovaciones de entrenamiento ni tecnicas como decodificacion especulativa (marcada como "not applicable").

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI.
- Entrada de imagen (image-text-to-text) con partes `image_url` al estilo OpenAI, usando el proyector `Holo-3.1-4B.mmproj-f16.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de bucles de tool calling multi-turno para agentes (segun la puerta de correccion `agent` y `agent_think_off`, aunque sin mediciones registradas).
- Contexto largo de hasta 262.144 tokens por peticion, util para documentos extensos o historiales largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Sin soporte de audio (entrada ni salida) y sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional con imagenes: el modelo acepta partes `image_url` junto al texto, por lo que puede responder preguntas sobre capturas, diagramas o fotografias en un endpoint compatible con OpenAI desplegado en una Radeon AI PRO R9700.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion, permite analizar contratos, informes o bases de codigo extensas sin trocear en exceso, manteniendo coherencia en una sola pasada.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle de agente permiten construir asistentes que consultan APIs internas o bases de datos, ejecutandose en hardware AMD sin depender de la nube.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), lo que facilita pilotos en equipos con ROCm sin GPU NVIDIA.
- Prototipado rapido con API OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente (SDK de OpenAI, LangChain, etc.) al endpoint local cambiando solo la URL base.
- Razonamiento controlado por coste: el modo thinking se puede desactivar por peticion, lo que permite usar el mismo modelo para respuestas rapidas y para tareas que requieran cadena de razonamiento.
- Evaluacion de modelos multimodales en entornos ROCm: util para equipos que quieran comparar el comportamiento del modelo frente a llama.cpp con el mismo GGUF y proyector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se dispone de cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta dirigido a GPUs con al menos 32 GB (Radeon AI PRO R9700) y a la memoria unificada del Ryzen AI Max+ 395 "Strix Halo".
- GPUs soportadas segun la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA: no soportadas por este paquete (orientado a ROCm/AMD).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/mradermacher-Holo-3.1-4B-loom:chat` y `loom-serve --model=holo-3.1-4b`.
- Opciones de servicio documentadas: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Concurrencia: 4 peticiones simultaneas; maximo de 4.096 tokens de salida por peticion segun el preset.
- Latencia y throughput: no disponibles (sin mediciones registradas para este paquete).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| Holo-3.1-4B-loom (este paquete) | 4B (aprox.) | 262.144 tokens | Si (proyector F16) | Apache 2.0 | GGUF + `.loom`, runtime Loom sobre ROCm | Solo AMD gfx1151/gfx1201; sin mediciones publicadas |
| mradermacher/Holo-3.1-4B-GGUF (modelo base del paquete) | 4B (aprox.) | no disponible | Si (mismo proyector) | no disponible en la informacion proporcionada | GGUF, ejecutable con llama.cpp | Referencia de correccion usada por Loom |
| Alternativas de 4B multimodales (p. ej. Qwen2.5-VL-3B, Phi-3.5-vision) | 3-4B | no disponible | Si | variable (Apache 2.0 en varios casos) | GGUF/safetensors, llama.cpp/vLLM | No se dispone de comparacion de rendimiento en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La informacion sobre el modelo base (arquitectura, datos de entrenamiento, idiomas, sesgos) no esta disponible; no se puede evaluar su calidad mas alla de lo que declara el paquete.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured": no hay evidencia registrada de que la salida coincida con llama.cpp en este paquete concreto.
- Riesgo de alucinacion: no documentado en la informacion proporcionada; como en cualquier modelo generativo de 4B, debe validarse en produccion.
- Limitacion de hardware: el paquete solo esta pensado para GPUs AMD gfx1151 y gfx1201; no es portable a NVIDIA ni a otras arquitecturas sin regenerar el paquete.
- Limite de salida: 4.096 tokens por peticion segun el preset, muy por debajo del contexto de entrada de 262.144 tokens.
- Concurrencia limitada a 4 peticiones simultaneas, lo que restringe su uso en servicios de alta carga.
- Sin soporte de audio y sin decodificacion especulativa.
- La licencia Apache 2.0 se aplica al paquete; la licencia del modelo base no se detalla en la informacion proporcionada, por lo que conviene verificarla antes de un uso comercial.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita inferir su fiabilidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Holo-3.1-4B-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/Holo-3.1-4B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
