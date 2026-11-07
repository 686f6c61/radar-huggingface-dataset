# loom-fun/unsloth-gemma-4-E4B-it-loom

## Resumen

`loom-fun/unsloth-gemma-4-E4B-it-loom` es un paquete de despliegue en formato Loom (`.loom` y un `model.json`) para el checkpoint GGUF `gemma-4-E4B-it-Q4_K_M.gguf` de Unsloth, que a su vez es una cuantizacion del modelo Gemma 4 E4B instruct de Google DeepMind. No se trata de un modelo nuevo ni de un fine-tuning: el checkpoint GGUF es el original sin modificar. Lo que aporta este repositorio es un artefacto listo para ejecutarse con `loom-serve` sobre hardware AMD, en concreto sobre un Ryzen AI Max+ 395 "Strix Halo" (gfx1151), generado con el flujo de trabajo `loom-skills`.

El interes practico esta en el motor de inferencia, no en los pesos. Loom incluye decodificacion especulativa activada por defecto con un drafter asistente (`AtomicChat/gemma-4-E4B-it-assistant-GGUF`, profundidad 3), soporte de vision mediante el proyector `mmproj-F16.gguf`, tool calling estilo OpenAI, modo thinking desactivable y una API compatible con `/v1/chat/completions`. Segun la model card, el rendimiento supera a llama.cpp con el mismo GGUF en la misma maquina: entre un 5 % y un 28 % mas de tokens por segundo en decodificacion y entre un 18 % y un 83 % en prefill.

El modelo base, Gemma 4 E4B, forma parte de la familia Gemma 4 de Google DeepMind (12B, E2B, E4B, 26B-A4B y 31B), multimodal, con soporte declarado de mas de 140 idiomas y hasta 256K de contexto, bajo licencia Apache 2.0. La ficha del repositorio fija el contexto servible en 131.072 tokens por peticion y un maximo de 4.096 tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) del modelo base Gemma 4 E4B; empaquetado Loom sobre GGUF |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no disponible (la variante E4B no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 131.072 tokens por peticion (segun la model card); el modelo base declara hasta 256K |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); proyector de vision en F16 (`mmproj-F16.gguf`); drafter asistente en Q8_0 |
| Idiomas soportados | no disponible en la model card de este repositorio; la documentacion de Gemma 4 declara mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-E4B-it-Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo: empaqueta el GGUF `gemma-4-E4B-it-Q4_K_M.gguf` de Unsloth junto con un `model.json` que describe como servirlo en Loom. El modelo subyacente es Gemma 4 E4B en su variante instruct, un transformer multimodal de la familia Gemma 4 de Google DeepMind, capaz de procesar texto e imagenes (pipeline `image-text-to-text`). La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; la documentacion de Unsloth confirma que la familia admite fine-tuning de vision, texto, audio y RL.

La innovacion tecnica relevante esta en el runtime. Loom ejecuta kernels generados y verificados contra implementaciones de referencia (55/55 tests superados) y activa por defecto decodificacion especulativa con un drafter asistente de profundidad 3, con una tasa de aceptacion de tokens redactados del 62 % en la puerta `spec`. Ademas, el empaquetado incluye el proyector de vision F16 y una API compatible con OpenAI que soporta tool calling, muestreo (`temperature`, `top_p`, `top_k`, `seed`) y hasta 4 peticiones concurrentes.

## Capacidades

- Generacion de texto y razonamiento en modo instruct, con modo thinking opcional (`chat_template_kwargs: {"enable_thinking": true}`), desactivado por defecto.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, con proyector `mmproj-F16.gguf`; verificado contra llama.cpp con los mismos tokens de prompt y respuestas equivalentes salvo empates cercanos.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno de agente verificado (renderizado exacto del prompt, reutilizacion de historial y llamadas validas).
- Decodificacion especulativa con drafter asistente, activada por defecto, que produce exactamente la misma salida que con la decodificacion especulativa desactivada.
- Concurrencia de 4 peticiones con resultados identicos a ejecuciones aisladas.
- Muestreo configurable (`temperature`, `top_p`, `top_k`, `seed`) con primera distribucion de token equivalente a llama.cpp.
- Capacidades multilingues: no detalladas en la model card de este repositorio; la documentacion de Gemma 4 declara mas de 140 idiomas.
- No soporta audio ni entrada/salida de voz, ni niveles de esfuerzo de razonamiento (`reasoning effort`).

## Casos de uso

- Asistente local multimodal en estacion de trabajo AMD: servir el modelo con `loom-serve --device=amdgpu` permite consultas de texto e imagen en local con una API compatible con OpenAI, sin depender de la nube, aprovechando los 131.072 tokens de contexto.
- Atencion al cliente automatizada con contexto largo: la ventana de 131.072 tokens permite mantener conversaciones multi-turno con historial extenso y documentos adjuntos; la concurrencia de 4 peticiones cubre cargas de trabajo de un equipo pequeno.
- Procesamiento de documentos con imagenes: extraccion y descripcion de contenido a partir de capturas, diagramas o formularios escaneados, usando la entrada `image_url` y el proyector F16, con prefill medido de 2.351 tok/s en documentos de 1k tokens.
- Agentes con herramientas: integracion en flujos que requieren function calling (consultas a bases de datos, APIs internas) gracias al soporte de `tools`/`tool_calls` y al bucle de agente verificado.
- Generacion de codigo asistida en local: el modelo instruct puede generar y explicar codigo, y el tool calling permite conectarlo a pipelines de CI/CD o a editores mediante la API `/v1/chat/completions`.
- Prototipado e investigacion en hardware consumer: con 31 GB de memoria reservada (`--memory_bytes=31000000000`) sobre un Ryzen AI Max+ 395, sirve como banco de pruebas para evaluar decodificacion especulativa y tecnicas de serving sin GPU dedicada.
- Analisis de imagenes en lote con contexto largo: combinacion de vision y ventanas de 32k tokens para revision de documentacion tecnica o auditoria de capturas, con throughput agregado de 204,9 tok/s en 4 streams.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en un AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, `hrx-loom 0.1.0`, mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 70,4 | 87,4 | +24 % | 132,9 | 66 % |
| Decode tok/s, contexto 2k | 70,8 | 90,6 | +28 % | 143,7 | 63 % |
| Decode tok/s, contexto 32k | 56,2 | 59,0 | +5 % | 103,7 | 57 % |
| Prefill tok/s, documento 1k | 1.336,7 | 2.351,3 | +76 % | 7.146,0 | 33 % |
| Prefill tok/s, documento 2k | 1.312,6 | 2.401,9 | +83 % | 7.093,8 | 34 % |
| Prefill tok/s, documento 8k | 1.286,5 | 1.973,5 | +53 % | 6.812,0 | 29 % |
| Prefill tok/s, documento 16k | 1.057,1 | 1.498,4 | +42 % | 6.469,3 | 23 % |
| Prefill tok/s, documento 32k | 853,8 | 1.005,3 | +18 % | 5.878,0 | 17 % |
| 4 streams, decode agregado tok/s | 117,9 | 204,9 | +74 % | 762,9 | 27 % |
| Decodificacion especulativa, tokens aceptados | — | 62 % | — | n/a | n/a |

Notas de la medicion: en llama.cpp se uso `llamacpp-rocm/b1369` con `-ngl 99 -cram 0`, `--mmproj` F16, `--spec-type draft-mtp` con drafter Q8_0, `--spec-draft-n-max 3`, `-ngld 99 -c 35024 -kvu -np 4`. En Loom, decodificacion especulativa activada (drafter asistente, profundidad 3). Los tiempos de Loom son del lado del cliente y los de llama.cpp del lado del servidor. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: la orden de ejemplo reserva 31.000.000.000 bytes (unos 31 GB) con `--memory_bytes=31000000000` sobre memoria unificada AMD.
- GPU recomendada: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo); el dispositivo se selecciona con `--device=amdgpu`.
- GPU consumer: el empaquetado esta pensado para graficos integrados AMD con memoria unificada, no para GPUs discretas NVIDIA; no hay datos de funcionamiento en RTX 4090 u otras GPU consumer en la informacion disponible.
- Despliegue: `pip install "hrx-loom[hf]"`, descarga con `loom-fetch` y servicio con `loom-serve`; expone `/v1/chat/completions` en `127.0.0.1:8080`. Tambien es posible usar el mismo GGUF con llama.cpp (referencia de comparacion).
- Latencia y throughput: 87,4 tok/s en decodificacion con prompt corto, 90,6 tok/s a 2k de contexto, 59,0 tok/s a 32k, 2.351 tok/s de prefill en documentos de 1k y 204,9 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth-gemma-4-E4B-it-loom (este) | no disponible (Gemma 4 E4B, Q4_K_M) | 131.072 tokens | 87,4 tok/s decode; 2.351 tok/s prefill (Strix Halo) | Apache 2.0 | Hugging Face, empaquetado Loom |
| unsloth/gemma-4-E4B-it-GGUF (base) | no disponible | hasta 256K segun documentacion de Gemma 4 | mismo GGUF; 70,4 tok/s decode en llama.cpp | Apache 2.0 | Hugging Face |
| Gemma 4 12B | 12B | hasta 256K | no disponible | Apache 2.0 | Hugging Face / Unsloth |
| Gemma 4 26B-A4B (MoE) | 26B totales, 4B activos | hasta 256K | no disponible | Apache 2.0 | Hugging Face / Unsloth |

La comparacion con otras familias (Qwen, Llama) no esta disponible en la informacion proporcionada. La unica comparacion cuantitativa documentada es frente a llama.cpp ejecutando el mismo GGUF en el mismo hardware.

## Limitaciones y advertencias

- El repositorio no aporta mejoras al modelo: es un empaquetado de serving. Cualquier limitacion del Gemma 4 E4B instruct subyacente se hereda sin cambios.
- No hay evidencia de la puerta `needle_full`: no se ha demostrado que se sirva correctamente un needle-in-a-haystack con el contexto completo; solo se verifico hasta la mitad del contexto.
- La puerta `decision` figura como no aplicable, por lo que no hay validacion de respuestas de decision (eleccion, puntuacion, probabilidades).
- La tasa de aceptacion del drafter varia por sesion (29 % en decode corto, 36 % a 2k, 30 % a 32k, 62 % en la puerta `spec`); el rendimiento de decodificacion especulativa no es constante.
- El contexto maximo por peticion es 131.072 tokens y la salida maxima 4.096 tokens, por debajo de los 256K que declara la familia Gemma 4.
- No soporta audio ni niveles de esfuerzo de razonamiento; el modo thinking esta desactivado por defecto.
- No hay datos publicados de sesgos, tasa de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- El rendimiento reportado corresponde exclusivamente a un Ryzen AI Max+ 395 con memoria unificada; no hay mediciones en otras GPU ni en otros sistemas operativos.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar los terminos del modelo base Gemma 4 y del drafter asistente antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face del empaquetado: https://huggingface.co/loom-fun/unsloth-gemma-4-E4B-it-loom
- GGUF base: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Drafter asistente: https://huggingface.co/AtomicChat/gemma-4-E4B-it-assistant-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/42353362155
- Documentacion de Gemma 4 en Unsloth (ejecucion local): https://unsloth.ai/docs/models/gemma-4
- Guia de fine-tuning de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4/train
