# loom-draft/mradermacher-UI-TARS-1.5-7B-loom

## Resumen

UI-TARS-1.5-7B es un modelo multimodal de tipo image-text-to-text de 7.000 millones de parametros, orientado a la interaccion con interfaces graficas (GUI agents). El checkpoint original fue publicado por ByteDance y distribuido en formato GGUF por mradermacher; esta ficha describe el paquete `loom-draft/mradermacher-UI-TARS-1.5-7B-loom`, una redistribucion empaquetada para el runtime Loom sobre GPUs AMD (Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700).

El paquete no modifica los pesos: reutiliza el GGUF `UI-TARS-1.5-7B.Q4_K_M.gguf` junto con el proyector multimodal `UI-TARS-1.5-7B.mmproj-f16.gguf` y genera programas `.loom` especificos para las arquitecturas gfx1151 y gfx1201 mediante la herramienta `loom-next`. Expone una API compatible con OpenAI (`/v1/chat/completions`) a traves de `loom-serve`, con soporte de tool calling e imagen de entrada.

Su relevancia es acotada y muy especifica: no es un modelo nuevo, sino un artefacto de despliegue para hardware AMD sin CUDA. Resulta util para quien quiera ejecutar un agente de GUI de 7B en un Ryzen AI Max+ 395 o una R9700 sin pasar por llama.cpp, aunque el propio autor indica que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir en este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector de vision); arquitectura interna exacta no disponible en la informacion proporcionada |
| Parametros totales | 7.000 millones (segun nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otros tipos no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`UI-TARS-1.5-7B.Q4_K_M.gguf`) + proyector `UI-TARS-1.5-7B.mmproj-f16.gguf`; empaquetado en programas `.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del transformer ni sobre el proceso de entrenamiento del modelo original (composicion del dataset, numero de tokens, uso de RLHF o DPO). Lo unico documentado es que se trata de un modelo multimodal con un proyector de vision separado (`mmproj-f16.gguf`) que se carga junto al modelo de lenguaje para procesar entradas de imagen.

En el plano del empaquetado, el paquete Loom genera programas especificos por arquitectura de GPU (`program/*.loom`, `weights.loom`) a partir de `llm_config.json`, e incluye `model.json` con los ficheros fuente fijados por hash SHA-256, verificados por `loom-fetch`. El autor indica que la generacion se hizo con `loom-next` sin LLM en el bucle. No se documenta ninguna innovacion de decodificacion (la decodificacion especulativa figura como "not applicable") ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto e interaccion multimodal image-text-to-text: acepta imagenes mediante partes `image_url` al estilo OpenAI.
- Tool calling con `tools` y `tool_calls` al estilo OpenAI.
- Bucles de tool calling multi-turno (el paquete incluye una puerta de correccion `agent` especifica para este caso).
- Contexto largo: hasta 128.000 tokens por peticion, util para historiales de interaccion o documentos extensos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida limitada a 4.096 tokens por peticion en el preset por defecto.
- Sin soporte de audio (entrada ni salida).
- Sin modo de razonamiento ni "reasoning effort" (marcado como no aplicable).
- Idiomas soportados: no disponible.

## Casos de uso

- Agente de automatizacion de GUI: el modelo esta disenado para interpretar capturas de pantalla y decidir la siguiente accion sobre la interfaz; con 128k tokens de contexto puede mantener el historial completo de una sesion de automatizacion sin truncar.
- Testing automatizado de aplicaciones de escritorio y web: integrado en un pipeline que captura pantallas y valida estados de la UI mediante tool calling, sustituyendo scripts de selenium fragiles por decisiones del modelo sobre la imagen.
- Asistencia a soporte tecnico con capturas: el usuario envia una imagen de su pantalla y el modelo responde con instrucciones paso a paso, usando el contexto largo para conservar el hilo de la conversacion.
- Despliegue en estaciones de trabajo AMD sin CUDA: al estar empaquetado para gfx1151 y gfx1201, permite servir el modelo en un Ryzen AI Max+ 395 o una R9700 mediante `loom-serve` con API compatible con OpenAI, sin depender de CUDA.
- Prototipado de agentes de navegacion web: el soporte de tool calling multi-turno permite encadenar acciones (clic, escritura, scroll) definidas como herramientas y verificar el resultado con nuevas capturas.
- Extraccion de datos de documentos e imagenes: usando la entrada `image_url`, se pueden procesar capturas de formularios o tablas y devolver la informacion estructurada como salida de texto.
- Evaluacion comparativa de runtimes: las puertas de correccion del paquete (`golden`, `compare`, `vision`, `agent`) permiten contrastar la salida de Loom contra una referencia de llama.cpp sobre el mismo GGUF, util para validar portes a ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", por lo que no hay evidencia registrada de su cumplimiento en este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con cuantizacion Q4_K_M un modelo de 7B ocupa aproximadamente 4-5 GB de pesos, mas el proyector `mmproj-f16`, aunque el autor no publica cifras concretas de memoria del preset.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): este paquete esta generado para arquitecturas AMD gfx1151 y gfx1201; no se documenta soporte para CUDA.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalable con pipx), `loom-fetch` para descargar el paquete y `loom-serve` para servirlo con API OpenAI. Opciones como vLLM, llama.cpp, Ollama o TGI no se documentan para este paquete, aunque el GGUF subyacente es compatible con llama.cpp como referencia.
- Parametros de servicio documentados: `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (no se han vuelto a medir).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-draft/mradermacher-UI-TARS-1.5-7B-loom | 7B | 128.000 | MIT | GGUF + `.loom` | Paquete para AMD gfx1151/gfx1201; sin benchmarks medidos |
| mradermacher/UI-TARS-1.5-7B-GGUF | 7B | no disponible | MIT (heredada) | GGUF | Checkpoint base sin empaquetar; ejecutable con llama.cpp |
| UI-TARS-1.5-7B original (ByteDance) | 7B | no disponible | no disponible | safetensors | Modelo fuente; detalles de rendimiento no incluidos en la informacion proporcionada |

No se dispone de datos de benchmarks de este paquete que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de mediciones: rendimiento, latencia y puertas de correccion figuran como no medidos en este paquete, por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Ambito de hardware restringido: los programas `.loom` se generan para gfx1151 y gfx1201; no hay soporte documentado para NVIDIA ni para otras GPUs AMD.
- Licencia MIT declarada en el paquete, pero la licencia y condiciones del modelo original de UI-TARS no se detallan en la informacion proporcionada; conviene verificar antes de uso comercial.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Limite de salida de 4.096 tokens por peticion, lo que puede ser insuficiente para tareas de generacion extensa.
- Concurrencia maxima de 4 peticiones, insuficiente para cargas de produccion con alto trafico.
- Sin modo de razonamiento extendido ni decodificacion especulativa.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al ser un modelo orientado a GUI, los errores en la interpretacion de capturas pueden propagarse a acciones incorrectas sobre la interfaz.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-UI-TARS-1.5-7B-loom
- Checkpoint GGUF base: https://huggingface.co/mradermacher/UI-TARS-1.5-7B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
