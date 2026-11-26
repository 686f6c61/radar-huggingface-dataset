# loom-draft/t8star-qwen-image-2.1-comfy-loom

## Resumen

`loom-draft/t8star-qwen-image-2.1-comfy-loom` es un paquete de distribucion para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Qwen-Image-2.1-PE-I2I.Q4_K_M.gguf` del modelo base `t8star/qwen-image-2.1-comfy` (una variante de Qwen-Image 2.1 orientada a edicion de imagen, segun el nombre del fichero) junto con un proyector multimodal `Qwen-Image-2.1-PE-I2I.mmproj-bf16.gguf` y un fichero `model.json` que describe el preset de ejecucion. El autor es `loom-draft` y la generacion del paquete se hizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

El objetivo es ofrecer un artefacto reproducible y verificado por hash para servir el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta entrada de imagen, tool calling y modo de razonamiento, y declara una ventana de contexto de 262.144 tokens por peticion con hasta 4 peticiones concurrentes.

Su relevancia es de nicho: demuestra el flujo de empaquetado y despliegue de Loom sobre hardware AMD, pero el repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB (los pesos se referencian, no se alojan), y las mediciones de rendimiento y las puertas de correccion figuran como "not yet re-measured". No hay datos de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint GGUF del modelo base Qwen-Image 2.1; transformer multimodal con proyector de vision) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint principal); proyector en bf16 (`mmproj-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dentro de un paquete `.loom` con `model.json` y ficheros fijados por sha256) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros ni el proceso de entrenamiento del modelo base `t8star/qwen-image-2.1-comfy`. El nombre del checkpoint (`Qwen-Image-2.1-PE-I2I`) sugiere una variante de Qwen-Image 2.1 para tareas image-to-image, con un proyector multimodal separado (`mmproj`) que habilita la entrada de imagenes. El paquete no modifica los pesos: segun la model card, empaqueta el "unmodified GGUF checkpoint".

La innovacion tecnica del artefacto no esta en el modelo sino en la cadena de despliegue. `loom-next` genera programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-fetch` verifica el sha256 de los ficheros fuente antes de materializarlos. La model card describe un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, pero ninguna tiene medicion registrada para este paquete. No se documentan datos de entrenamiento, tokens, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imagen estilo OpenAI (`image_url`) con proyector `Qwen-Image-2.1-PE-I2I.mmproj-bf16.gguf`; el pipeline declarado es `image-text-to-text`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno segun las puertas `agent` y `agent_think_off`.
- Modo de razonamiento activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Contexto largo de 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens (preset `max_tokens`).
- Capacidades de audio: no determinadas.
- Comportamiento de muestreo: no determinado.

## Casos de uso

- Evaluacion de la cadena de despliegue Loom en hardware AMD: usar el paquete para validar que `loom-fetch` y `loom-serve` arrancan correctamente sobre Strix Halo o R9700 antes de adoptar el runtime en un pipeline propio.
- Procesamiento de documentos largos con imagen: la ventana de 262.144 tokens permite enviar transcripciones extensas o capturas de pantalla junto a preguntas, en escenarios de analisis de informes o revision de interfaces.
- Prototipado de asistentes multimodales en local: la API compatible con OpenAI permite conectar clientes existentes sin adaptadores, util para demos sobre una unica GPU de 32 GB.
- Agentes con herramientas en bucle: el soporte de `tools`/`tool_calls` y las puertas `agent` permiten construir flujos de varios pasos (consulta, accion, verificacion) sobre el endpoint local.
- Tareas de razonamiento con modo thinking: activado por defecto, adecuado para problemas que requieren cadena de pensamiento, y desactivable para reducir latencia en consultas simples.
- Reproducibilidad y auditoria: los ficheros fuente se fijan por sha256 en `model.json.lock`, lo que facilita verificar que el artefacto desplegado coincide con el publicado.
- Referencia para comparativas contra llama.cpp: las puertas de correccion estan disenadas para contrastar tokens greedy y log-probs frente a la referencia, util si se quiere replicar el benchmark en hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp "are not yet re-measured" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible (el tamano del repo es de 0.0 GB porque los pesos se referencian, no se alojan; el checkpoint Q4_K_M debe descargarse aparte).
- GPU soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs NVIDIA o consumer AMD distintas: no disponible.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/t8star-qwen-image-2.1-comfy-loom:chat --materialize=copy --output=qwen-image-2.1-comfy` y `loom-serve --model=qwen-image-2.1-comfy '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Opciones de runtime: `--pool_backing=fixed` reserva el pool de memoria por adelantado; `--parameter_mode=preload` solo cambia la carga de pesos en host; `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento de modelos alternativos de la misma categoria con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- Artefacto sin validacion publicada: todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay senales de uso en produccion.
- Hardware muy restringido: el paquete esta generado para gfx1151 y gfx1201; su comportamiento en otras GPUs no esta documentado.
- Pesos no incluidos en el repo: el tamano de 0.0 GB implica que la descarga real del GGUF y del proyector se realiza desde el modelo base, lo que anade una dependencia externa.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica, lo que impide garantizar calidad en castellano u otras lenguas.
- Capacidades sin determinar: audio y comportamiento de muestreo figuran como "?" en la tabla de caracteristicas.
- Limite de salida de 4.096 tokens: puede ser insuficiente para generacion extensa aunque el contexto de entrada sea de 262.144 tokens.
- Riesgo de alucinacion y sesgos: no documentados por el autor; deben asumirse los del modelo base, sobre el que tampoco hay informacion.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `t8star/qwen-image-2.1-comfy` y de los pesos originales de Qwen-Image antes de desplegar en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/t8star-qwen-image-2.1-comfy-loom
- Modelo base: https://huggingface.co/t8star/qwen-image-2.1-comfy
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
