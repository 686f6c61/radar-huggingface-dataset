# loom-draft/ReadyArt-Wicked-Tutu-31B-Final-loom

## Resumen

ReadyArt-Wicked-Tutu-31B-Final-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `Wicked-Tutu-31B-Final-Q4_K_M.gguf` del modelo base ReadyArt/Wicked-Tutu-31B-Final-GGUF. Lo publica el usuario loom-draft dentro del ecosistema Loom, un entorno de inferencia para GPUs AMD, y no constituye un modelo nuevo: es un artefacto de empaquetado que permite servir el GGUF original en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete se genera con la herramienta loom-next (el generador, sin LLM en el bucle) y expone una API compatible con OpenAI (`/v1/chat/completions`) a través de `loom-serve`. El modelo subyacente tiene 31B parametros y se distribuye unicamente en cuantizacion Q4_K_M; el paquete declara soporte de tool calling, modo de razonamiento opcional (desactivado por defecto) y una ventana de contexto de 53.248 tokens por peticion con 4 peticiones concurrentes.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB (sin pesos alojados) y las mediciones de rendimiento y correccion del paquete no se han vuelto a medir ("not yet re-measured"). Debe tratarse como un artefacto de despliegue experimental para hardware AMD concreto, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada; el paquete solo envuelve el GGUF) |
| Parametros totales | 31B (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 53.248 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como artefacto Loom (`.loom` + `model.json`) |
| Modelo base | ReadyArt/Wicked-Tutu-31B-Final-GGUF |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, posible mezcla de expertos, datos de entrenamiento, numero de tokens, composicion del dataset o si hubo RLHF/DPO) en la informacion proporcionada. La model card del paquete Loom solo describe el proceso de empaquetado y servicio, no el entrenamiento del modelo subyacente.

Lo que si se detalla es la innovacion a nivel de despliegue: el paquete se genera con loom-next, que produce kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y se sirve con `loom-serve` usando opciones como `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU). El paquete incluye compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, pero ninguna de ellas tiene medicion registrada en esta version.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`; existe una compuerta `agent` para bucles multi-turno de llamadas a herramientas.
- Modo de razonamiento (thinking) opcional: desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Razonamiento por esfuerzo (reasoning effort): no aplicable en este paquete.
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tiene segun la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tiene segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (sampling): estado no determinado en la tabla de caracteristicas ("?").

## Casos de uso

- Despliegue local en estaciones de trabajo AMD: servir el modelo en una Radeon AI PRO R9700 de 32 GB mediante `loom-serve` con API compatible con OpenAI, util para entornos donde no se dispone de GPUs NVIDIA ni de servicios en la nube.
- Prototipado de asistentes conversacionales en hardware Strix Halo: usar el paquete en un Ryzen AI Max+ 395 para iterar sobre prompts y plantillas de chat con una ventana de 53.248 tokens, suficiente para documentos largos en una sola peticion.
- Evaluacion de agentes con tool calling: el paquete declara soporte de `tools`/`tool_calls` y compuertas `agent` y `agent_think_off`, lo que permite montar bucles multi-turno de llamadas a funciones en local para validar flujos antes de llevarlos a produccion.
- Comparacion de backends en AMD: al incluir compuertas `golden`, `compare` y `logits` contra llama.cpp sobre el mismo GGUF, sirve para validar la fidelidad numerica de los kernels generados por loom-next frente a la referencia.
- Procesamiento de documentos largos con concurrencia limitada: con 53.248 tokens de contexto y 4 peticiones concurrentes, encaja en tareas de resumen o extraccion sobre lotes pequenos de documentos, siempre que el throughput no sea critico.
- Laboratorio de investigacion en inferencia: util para estudiar el comportamiento de la espera activa de GPU (`completion_spin_ns`) y del pool de memoria fijo (`--pool_backing=fixed`) en cargas reales sobre gfx1151 y gfx1201.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las compuertas de correccion figuran como "not yet re-measured". No se dispone de datos de latencia, throughput ni puntuaciones en MMLU, HumanEval, GSM8K u otros conjuntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 31B y el hardware objetivo declarado incluye una GPU de 32 GB (Radeon AI PRO R9700), lo que sugiere que el paquete esta dimensionado para caber en 32 GB.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), las dos unicas configuraciones documentadas.
- GPU de consumo: no se documenta soporte para GPUs de consumo NVIDIA ni AMD fuera de las dos arquitecturas citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/ReadyArt-Wicked-Tutu-31B-Final-loom:chat` (o `:chat-r9700`) y `loom-serve --model=... '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Otros motores: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete; llama.cpp solo se menciona como referencia de correccion.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion con alternativas de 31B o con otros paquetes Loom.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB: no contiene los pesos y depende de que `loom-fetch` descargue el GGUF desde el repositorio base.
- Ninguna de las compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene medicion registrada; no hay evidencia publicada de fidelidad frente a llama.cpp en esta version.
- Las mediciones de rendimiento estan pendientes de repetir en ambas GPUs objetivo; no hay datos de latencia ni throughput.
- El muestreo figura como "no determinado" en la tabla de caracteristicas, lo que impide garantizar el comportamiento de temperatura, top_k y semilla.
- La entrada de imagen y de audio del modelo upstream no esta soportada por Loom, pese a que el modelo original las ofrece.
- La longitud de contexto efectiva es de 53.248 tokens por peticion, no la del modelo base si fuese mayor.
- La concurrencia esta limitada a 4 peticiones simultaneas y la salida a 4.096 tokens por peticion.
- No se documentan idiomas soportados ni sesgos conocidos; el riesgo de alucinacion del modelo base no se puede evaluar con la informacion disponible.
- La licencia declarada es apache-2.0, pero conviene verificar la licencia del modelo base ReadyArt/Wicked-Tutu-31B-Final-GGUF antes de un uso comercial.
- El soporte esta restringido a las arquitecturas AMD gfx1151 y gfx1201 documentadas; no se garantiza funcionamiento en otro hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Tutu-31B-Final-loom
- Modelo base en Hugging Face: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-Final-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
