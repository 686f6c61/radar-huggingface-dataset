# loom-draft/unsloth-Qwen3.5-0.8B-loom

## Resumen

`loom-draft/unsloth-Qwen3.5-0.8B-loom` es un paquete de despliegue para el runtime AMD Loom (herramientas `loom-fetch` y `loom-serve`, distribuidas como `hrx-loom`) que empaqueta el checkpoint GGUF sin modificar `Qwen3.5-0.8B-Q4_K_M.gguf` del repositorio `unsloth/Qwen3.5-0.8B-GGUF`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del Qwen3.5-0.8B original en cuantizacion Q4_K_M, y lo que aporta el repositorio es un conjunto de programas `.loom` generados con `loom-next` (el generador, sin LLM en el bucle) mas una tarjeta `model.json` con los metadatos de despliegue.

El objetivo es ejecutar un modelo multimodal de 0,8 mil millones de parametros en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta entrada de imagen mediante el proyector `mmproj-BF16.gguf`, tool calling y un modo de razonamiento opcional desactivado por defecto.

Su relevancia es de nicho pero clara: ofrece una via de despliegue nativo sobre ROCm para hardware AMD de consumo y profesional reciente, con una ventana de contexto declarada de 262.144 tokens por peticion y hasta 4 peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0,0 GB (los pesos se referencian, no se alojan).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base Qwen3.5-0.8B; el paquete no la describe) |
| Parametros totales | 0,8 mil millones (segun el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-0.8B-Q4_K_M.gguf`) + proyector `mmproj-BF16.gguf`; programas `.loom` y `weights.loom`; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base: no se indica si es un transformer denso, hibrido o de otro tipo, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Lo unico deducible del material es que se trata de un modelo multimodal con torre de vision separada, dado que la inferencia de imagen se delega a un proyector externo (`mmproj-BF16.gguf`) y el pipeline declarado es `image-text-to-text`.

Tampoco se aportan datos de entrenamiento: no hay cifras de tokens, composicion del dataset, ni confirmacion de si hubo RLHF, DPO u otras etapas de alineamiento. El paquete en si no entrena nada; su unica transformacion es la generacion automatica de kernels y programas Loom a partir del GGUF original mediante `loom-next`. La innovacion tecnica destacable no esta en el modelo sino en el runtime: generacion de kernels especificos para gfx1151 y gfx1201, espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). No hay decodificacion especulativa (marcada como "not applicable").

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imagen en formato OpenAI (`image_url`), procesada por el proyector `mmproj-BF16.gguf`.
- Tool calling con esquema OpenAI: campos `tools` y `tool_calls` en la peticion y la respuesta.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Soporte de bucles multi-turno con herramientas, validado por la puerta de correccion `agent` y `agent_think_off`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin soporte de audio (entrada ni salida) y sin niveles de esfuerzo de razonamiento configurables.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el modelo se sirve con `loom-serve` sobre Strix Halo o R9700 y responde por HTTP en formato OpenAI, lo que permite conectarlo a clientes existentes sin adaptadores.
- Procesamiento de documentos con imagen en el borde: al aceptar `image_url` y 262.144 tokens de contexto, puede recibir capturas, diagramas o paginas escaneadas junto con instrucciones largas en una sola peticion.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y las puertas `agent`/`agent_think_off` lo hacen apto para prototipos de agentes que consultan APIs internas sin salir de la maquina.
- Clasificacion y extraccion sobre lotes con concurrencia limitada: con 4 peticiones concurrentes y una ventana grande, encaja en tareas de extraccion de campos sobre documentos extensos donde el coste por token importa.
- Despliegue en hardware de consumo AMD: al ser un Q4_K_M de 0,8B, el paquete esta pensado para ejecutarse en un APU Strix Halo sin GPU dedicada adicional, util para demos y entornos de desarrollo.
- Evaluacion comparativa de runtimes: sirve como banco de pruebas para medir Loom frente a llama.cpp sobre el mismo GGUF, ya que las puertas `golden` y `compare` estan disenadas exactamente para esa comparacion token a token.
- Prototipado de asistentes con razonamiento conmutable: activar `enable_thinking` solo en peticiones que lo requieran permite separar consultas rapidas de consultas que necesitan cadena de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, las once puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de ninguna de ellas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 0,8B, por lo que el peso de los parametros es del orden de cientos de MB, mas el proyector `mmproj-BF16.gguf` y el pool de memoria del preset.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras.
- GPU de consumo: si, el APU Strix Halo esta contemplado como destino principal; no se indica compatibilidad con GPUs NVIDIA ni con otras Radeon.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Opciones de servido relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Qwen3.5-0.8B-loom` | 0,8B | 262.144 tokens | Si (image-text-to-text) | Apache 2.0 | GGUF Q4_K_M + runtime Loom (AMD) |
| `unsloth/Qwen3.5-0.8B-GGUF` (modelo base) | 0,8B | no disponible en esta ficha | Si (mismo checkpoint y proyector) | Apache 2.0 | GGUF; runtime no especificado |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el propio checkpoint base: los pesos son identicos, de modo que cualquier diferencia en calidad de salida proviene del runtime y no del modelo. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no aloja pesos (tamano 0,0 GB): `loom-fetch` descarga y verifica por sha256 los ficheros fuente, por lo que la disponibilidad depende de que el repositorio base siga accesible.
- Ninguna de las once puertas de correccion tiene medicion registrada; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en texto, vision, tool calling ni sampling.
- El rendimiento frente a llama.cpp no se ha vuelto a medir en ninguna de las dos GPUs soportadas.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 y gfx1201; no hay indicacion de soporte para otras GPUs AMD ni para NVIDIA.
- Limite de 4.096 tokens de salida por peticion, muy por debajo de la ventana de contexto de 262.144 tokens.
- Concurrencia maxima de 4 peticiones, insuficiente para cargas de servidor con trafico alto.
- El modo de razonamiento esta desactivado por defecto y no admite niveles de esfuerzo configurables.
- Idiomas soportados no documentados; no se puede asumir calidad multilingue sin evaluacion propia.
- Riesgo de alusionacion y sesgos: no cuantificados en la informacion disponible.
- Licencia Apache 2.0 en el paquete, lo que en principio permite uso comercial, pero el autor no detalla condiciones adicionales sobre los programas `.loom` generados ni sobre el proyector.
- El resultado de las busquedas web sobre "Loom" corresponde a productos no relacionados (grabador de pantalla y marca de ropa); no se han encontrado fuentes externas sobre este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3.5-0.8B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Runtime AMD Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
