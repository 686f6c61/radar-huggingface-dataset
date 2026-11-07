# loom-fun/lmstudio-community-Ornith-1.0-35B-loom

## Resumen

Ornith-1.0-35B-loom es un paquete de despliegue en formato Loom (`.loom` + `model.json`) publicado por `loom-fun` para ejecutar el checkpoint GGUF `lmstudio-community/Ornith-1.0-35B-GGUF` (concretamente `Ornith-1.0-35B-Q4_K_M.gguf`) sobre hardware AMD, en particular el SoC AMD Ryzen AI Max+ 395 «Strix Halo» con GPU integrada Radeon 8060S (gfx1151). No es un modelo nuevo ni un fine-tune: los pesos son los originales de lmstudio-community y lo que aporta este repositorio es un runtime compilado y validado para `loom-serve`, la pila de inferencia de ROCm orientada a aceleradores AMD.

El modelo base es multimodal (pipeline `image-text-to-text`, con proyector `mmproj-Ornith-1.0-35B-BF16.gguf`), de 35B parametros en cuantizacion Q4_K_M, con una ventana de contexto de 262.144 tokens por peticion y soporte de razonamiento explicito (thinking) activado por defecto. El repositorio incluye mediciones comparativas frente a llama.cpp en el mismo GGUF y los resultados de las puertas de correccion de loom-benchmark (kernels, golden, vision, agent, sampling, needle).

La relevancia es doble: por un lado demuestra que es posible servir un modelo de 35B con vision y contexto largo en un equipo de consumo con memoria unificada (33 GB reservados para el modelo); por otro, documenta el rendimiento real del stack Loom frente a llama.cpp en ese hardware, con ganancias de prefill de entre el 42 % y el 77 % y una ligera perdida de decode de entre el 9 % y el 12 %. La ficha se centra en lo que el autor documenta; los datos del modelo base no incluidos en la model card se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ornith-1.0-35B; runtime Loom con kernels generados) |
| Parametros totales | 35B (denominacion del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado); proyector vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ornith-1.0-35B-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Entrada multimodal | imagen (`image_url`), proyector `mmproj-Ornith-1.0-35B-BF16.gguf` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, Radeon 8060S), `--device=amdgpu` |
| Memoria reservada | 33.000.000.000 bytes (`--memory_bytes`) |
| API | OpenAI-compatible `/v1/chat/completions` en `127.0.0.1:8080` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento; lo unico verificable es que se trata de un transformer multimodal de 35B parametros distribuido en GGUF por lmstudio-community, con un proyector de vision separado en BF16. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones de atencion en la model card proporcionada.

Lo que si esta documentado es la capa de despliegue: `loom-skills` genera programas `.loom` y kernels especificos para el GGUF a partir de `llm_config.json`, y el paquete se materializa con `loom-fetch` verificando sha256 de los ficheros de origen. El rendimiento se evalua contra una «roofline» calculada para Strix Halo a 216 GB/s de ancho de banda y 59 TFLOP/s. Las puertas de correccion confirman paridad con llama.cpp: 44/44 tests de kernel, coincidencia token a token en modo greedy (divergencias solo en empates cercanos), tokens de prompt identicos en vision, consistencia bajo concurrencia y needle-in-a-haystack hasta la mitad del contexto.

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes mediante partes `image_url` en formato OpenAI, con proyector de vision BF16.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), validado en un bucle multi-turno de agente con reutilizacion de historial.
- Contexto largo de hasta 262.144 tokens por peticion, con prueba needle-in-a-haystack superada hasta la mitad de la ventana.
- Concurrencia de 4 peticiones con salida identica a la ejecucion aislada (puerta `consistency`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- No soporta razonamiento con esfuerzo variable (reasoning effort), decodificacion especulativa, ni audio de entrada o salida.
- Idiomas soportados: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente documental con contexto largo: con 262.144 tokens por peticion se puede cargar un corpus extenso (manuales, expedientes, varios PDFs) y hacer preguntas sobre el sin trocear; la puerta `needle` valida el comportamiento hasta la mitad de la ventana.
- Analisis de documentos escaneados y capturas: la entrada de imagen via `mmproj` permite extraer y razonar sobre contenido visual (facturas, diagramas, pantallazos) en el mismo flujo que el texto.
- Agente de automatizacion con herramientas: el soporte de `tools`/`tool_calls` y la validacion del bucle multi-turno lo hacen apto para orquestar APIs, consultas a bases de datos o acciones sobre sistemas internos.
- Despliegue en estacion de trabajo AMD: con 33 GB de memoria unificada en un Ryzen AI Max+ 395 se sirve el modelo completo en local, util para entornos con requisitos de privacidad o sin acceso a GPU de datacenter.
- Procesamiento por lotes con prefill intensivo: las ganancias de prefill de Loom frente a llama.cpp (+42 % a +77 % segun tamano de documento) favorecen cargas donde se ingieren documentos largos y se generan respuestas cortas, como clasificacion o extraccion de entidades.
- Servicio interno con varios usuarios: 4 peticiones concurrentes con salida consistente permiten atender a un pequeno equipo desde un unico nodo con API compatible con OpenAI, sin reescribir clientes existentes.
- Evaluacion y prototipado de modelos multimodales: las puertas de correccion y las mediciones contra roofline permiten comparar rapido el rendimiento real de un 35B Q4_K_M en hardware de consumo antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

Mediciones del autor sobre el mismo GGUF en AMD Ryzen AI Max+ 395 (Radeon 8060S, Ubuntu 24.04), Loom 0.1.0 frente a llama.cpp b1369:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 62,8 | 57,3 | -9 % | 109,3 | 52 % |
| Decode tok/s, contexto 2k | 60,7 | 54,1 | -11 % | 107,1 | 51 % |
| Decode tok/s, contexto 32k | 52,3 | 46,2 | -12 % | 82,1 | 56 % |
| Prefill tok/s, documento 1k | 1.173,5 | 1.801,7 | +54 % | 11.902,0 | 15 % |
| Prefill tok/s, documento 2k | 1.198,8 | 1.715,8 | +43 % | 11.708,5 | 15 % |
| Prefill tok/s, documento 8k | 1.180,2 | 1.671,6 | +42 % | 10.668,0 | 16 % |
| Prefill tok/s, documento 16k | 999,0 | 1.593,7 | +60 % | 9.537,8 | 17 % |
| Prefill tok/s, documento 32k | 809,8 | 1.434,6 | +77 % | 7.870,2 | 18 % |
| 4 streams, decode agregado tok/s | 132,7 | 141,9 | +7 % | 230,9 | 61 % |
| Decodificacion especulativa | n/a | n/a | n/a | n/a | n/a |

Notas: Loom mide en cliente y llama.cpp en servidor; valores de decode y prefill son media de 1-2 ejecuciones, el de 4 streams es mediana de 1. La decodificacion especulativa no esta soportada en Loom. No se publican resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 33 GB reservados para el modelo con Q4_K_M (`--memory_bytes=33000000000`), sobre memoria unificada en el caso documentado.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo). No hay datos de funcionamiento en otras GPU AMD ni en NVIDIA.
- GPU de consumo: cabe en un equipo con 32 GB o mas de memoria unificada como el citado; no se documenta su viabilidad en GPU discretas con 24 GB.
- Despliegue: `hrx-loom` (`pip install "hrx-loom[hf]"`), `loom-fetch` para materializar el paquete y `loom-serve --device=amdgpu`; API OpenAI en `127.0.0.1:8080`. El GGUF original tambien se puede servir con llama.cpp (referencia de comparacion).
- Rendimiento estimado: 57,3 tok/s de decode en prompt corto, 46,2 tok/s a 32k de contexto, 1.801,7 tok/s de prefill en documento de 1k y 141,9 tok/s agregados con 4 streams.
- Limitaciones del stack: sin decodificacion especulativa y sin control de esfuerzo de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.0-35B (Loom, este repo) | 35B | 262.144 | Si | no disponible | GGUF empaquetado en `.loom` |
| Ornith-1.0-35B-GGUF (lmstudio-community) | 35B | no disponible en la informacion | Si (mmproj BF16) | no disponible | GGUF |
| llama.cpp (runtime, mismo GGUF) | 35B | 35.024 configurado en la prueba | Si | no aplica | GGUF |

La comparacion relevante en la documentacion no es frente a otros modelos, sino frente al mismo checkpoint servido con llama.cpp: Loom pierde entre un 9 % y un 12 % en decode, gana entre un 42 % y un 77 % en prefill y un 7 % en decode agregado con 4 streams. No hay datos publicados para comparar con otros modelos de 35B de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible: no se puede confirmar el uso comercial sin consultar el repositorio del modelo base.
- No hay informacion sobre sesgos, idiomas soportados ni calidad multilingue; no se debe asumir cobertura mas alla del ingles sin verificacion.
- Riesgo de alucinacion inherente a un modelo generativo de 35B; el modo thinking activado por defecto aumenta la latencia y el consumo de tokens si no se desactiva.
- La puerta `needle_full` (needle-in-a-haystack a contexto completo) figura como «sin evidencia»: el contexto de 262.144 tokens esta soportado por configuracion, pero la recuperacion fiable solo se ha validado hasta la mitad de la ventana.
- Sin decodificacion especulativa y sin control de esfuerzo de razonamiento; el margen de mejora en decode frente a llama.cpp es negativo.
- Las mediciones provienen de un unico dispositivo (Strix Halo) y de ejecuciones con 1-2 repeticiones: la varianza no esta caracterizada.
- El paquete esta atado a hardware AMD gfx1151 y a la version `hrx-loom 0.1.0`; no hay garantia de funcionamiento en otras GPU ni de compatibilidad futura.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB declarado, lo que sugiere que los pesos no estan alojados en el propio repo y se materializan desde el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/lmstudio-community-Ornith-1.0-35B-loom
- Modelo base GGUF: https://huggingface.co/lmstudio-community/Ornith-1.0-35B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42333444785
- Estadisticas del modelo base: https://openmodelstats.com/models/lmstudio-community/ornith-1.0-35b-gguf
