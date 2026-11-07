# loom-fun/bartowski-Nanbeige4.3-33B-loom

## Resumen

`loom-fun/bartowski-Nanbeige4.3-33B-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) para el checkpoint GGUF cuantizado `Nanbeige_Nanbeige4.3-33B-Q4_K_M.gguf`, publicado por bartowski. El modelo subyacente, Nanbeige4.3-33B, es un modelo abierto de 33.000 millones de parametros desarrollado por Nanbeige LLM Lab, orientado a tareas de agente y con una ventana de contexto declarada de 512K tokens. El paquete ha sido generado con el flujo `loom-skills` sobre un equipo AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y esta pensado para ejecutarse con el servidor `hrx-loom` sobre GPU AMD integrada.

El interes de esta ficha es doble. Por un lado, documenta un caso practico de inferencia local de un modelo de 33B en hardware de consumo de gama alta (APU con memoria unificada), con medidas de rendimiento frente a llama.cpp. Por otro, sirve como referencia de un formato de empaquetado (Loom) que incluye verificacion de correctitud por puertas (`gates.sh`) frente a una implementacion de referencia en llama.cpp, incluyendo pruebas de tool calling, decodificacion especulativa y needle-in-a-haystack.

La relevancia actual viene de la combinacion de tres factores: un modelo de 33B con contexto muy largo, una cuantizacion Q4_K_M que lo hace viable en 80 GB de memoria unificada, y un motor (Loom) que obtiene mejoras medibles de throughput en prefill y en decodificacion con contexto largo respecto a llama.cpp en el mismo hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer subyacente Nanbeige4.3-33B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | 33 000 millones (aproximado, segun nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 260 096 tokens por peticion (limite del servidor Loom); el modelo base declara 512K |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio (el modelo base Nanbeige4.3-33B se publica bajo Apache 2.0 segun fuentes secundarias) |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json` con hashes sha256) |

## Arquitectura y entrenamiento

El repositorio no contiene informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo Nanbeige4.3-33B. Lo que si documenta es la capa de despliegue: un paquete Loom que incluye kernels generados para la GPU AMD Radeon 8060S (gfx1151), un `model.json` con los ficheros fuente fijados por sha256 y un `model.json.lock`. El checkpoint GGUF se usa sin modificaciones respecto al original de bartowski.

La innovacion tecnica destacable no esta en el modelo sino en el runtime. Loom incorpora decodificacion especulativa basada en n-gram prompt lookup con profundidad 2, activada por defecto, y un servidor compatible con la API de chat de OpenAI. El paquete incluye ademas un conjunto de puertas de correctitud que comparan la salida del motor con una referencia grabada en llama.cpp sobre el mismo GGUF: tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k, consistencia bajo concurrencia (4 peticiones), equivalencia entre decodificacion especulativa activada y desactivada, y pruebas de bucle de tool calling multi-turno con y sin modo thinking. Las 55 pruebas unitarias de kernels pasan y todas las puertas aplicables pasan, salvo `needle_full` (needle-in-the-haystack a contexto completo), para la que no hay evidencia registrada.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling y function calling en formato OpenAI (`tools` y `tool_calls`), con bucle de agente multi-turno verificado contra la referencia de llama.cpp.
- Decodificacion especulativa n-gram (profundidad 2) activada por defecto, con salida identica a la decodificacion sin especulacion segun la puerta `spec`.
- Contexto largo: hasta 260 096 tokens por peticion en el servidor Loom; el modelo base declara 512K.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia verificada.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Limite de salida de 4 096 tokens por peticion (preset `max_tokens`).
- Sin soporte de entrada de imagen ni de audio (las puertas `vision` y `decision` no son aplicables).
- Sin control de "reasoning effort".

## Casos de uso

- Analisis de documentos largos en local: con 260K tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola pasada; el prefill medido de 417 tok/s en documentos de 1k y 398 tok/s en 8k lo hace practico para documentos de decenas de miles de tokens.
- Asistentes con tool calling en estaciones de trabajo AMD: el soporte verificado de `tools`/`tool_calls` y del bucle de agente multi-turno permite construir asistentes que consultan APIs o bases de datos sin salir del equipo.
- Despliegue en hardware de consumo de gama alta: el checkpoint Q4_K_M cabe en los 80 GB de memoria unificada del Ryzen AI Max+ 395, lo que permite servir un modelo de 33B en una APU sin GPU dedicada.
- RAG sobre corpus extensos: la ventana de 260K y la prueba needle-in-a-haystack hasta la mitad del contexto (verificada contra llama.cpp) lo hacen adecuado para recuperacion aumentada con muchos fragmentos concatenados.
- Procesamiento por lotes de resumenes y extraccion de informacion: con 4 peticiones concurrentes y throughput agregado de decodificacion de 29,9 tok/s, es viable para pipelines internos de extraccion estructurada.
- Evaluacion comparativa de motores de inferencia: el paquete incluye metricas y puertas de correctitud que permiten reproducir la comparacion Loom frente a llama.cpp en el mismo GGUF y hardware.
- Prototipado de agentes con razonamiento explicito: el modo thinking activado por defecto y desactivable por peticion facilita alternar entre respuestas razonadas y respuestas directas en el mismo servicio.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), Ubuntu 24.04, hrx-loom 0.1.0, mismo GGUF Q4_K_M en ambos motores. llama.cpp: build `llamacpp-rocm/b1369` con `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`.

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 10,6 | 11,1 | +5 % | 11,1 | 100 % |
| Decodificacion tok/s, contexto 2k | 7,4 | 11,2 | +51 % | 12,1 | 93 % |
| Decodificacion tok/s, contexto 32k | no medido | 5,7 | no disponible | 9,2 | 62 % |
| Prefill tok/s, documento 1k | 299,2 | 417,5 | +40 % | 948,6 | 44 % |
| Prefill tok/s, documento 2k | 260,3 | 419,9 | +61 % | 937,4 | 45 % |
| Prefill tok/s, documento 8k | no medido | 398,0 | no disponible | 875,2 | 45 % |
| Prefill tok/s, documento 16k | no medido | 296,2 | no disponible | 804,1 | 37 % |
| Prefill tok/s, documento 32k | no medido | 137,6 | no disponible | 691,6 | 20 % |
| 4 flujos, decodificacion agregada tok/s | 31,7 | 29,9 | -6 % | 53,6 | 56 % |
| Tokens especulativos aceptados | no disponible | 14 % | no disponible | no aplicable | no aplicable |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de arranque del autor usa `--memory_bytes=81000000000` (81 GB), coherente con una APU de memoria unificada de 128 GB configurada con ~80 GB para GPU.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 216 GB/s de ancho de banda y 59 TFLOP/s segun el calculo de roofline del autor.
- GPU dedicadas: no se documentan requisitos ni pruebas en A100, H100 o RTX 4090; el paquete esta orientado a `--device=amdgpu` (ROCm).
- GPU de consumo: no hay datos para RTX 4090 u otras GPU de consumo con memoria discreta; el checkpoint Q4_K_M de un modelo de 33B requiere del orden de 20 GB solo para pesos, pero no se ha verificado en ese hardware.
- Despliegue: `hrx-loom` con `loom-fetch` y `loom-serve`; servidor OpenAI-compatible en `127.0.0.1:8080`. Alternativa: llama.cpp con el GGUF original de bartowski.
- Latencia y throughput: ver tabla de benchmarks. Decodificacion de 11,1 tok/s en prompt corto y 5,7 tok/s a 32k de contexto; prefill de 417 tok/s a 1k y 137,6 tok/s a 32k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (este paquete Loom) | 33B | 260K en servidor Loom; 512K declarado | no disponible en este repo (base Apache 2.0 segun fuentes secundarias) | GGUF Q4_K_M empaquetado en Loom | Optimizado para AMD Strix Halo; decodificacion especulativa n-gram |
| Nanbeige4.3-33B GGUF (bartowski) | 33B | 512K declarado | Apache 2.0 segun fuentes secundarias | GGUF | Checkpoint original sin empaquetar; ejecutable en llama.cpp |
| llama.cpp sobre el mismo GGUF | 33B | 35 024 tokens configurados en la prueba | igual que el GGUF | GGUF | Referencia de correctitud; menor throughput en prefill y contexto largo |

No se dispone de datos de benchmarks de calidad que permitan comparar este modelo con alternativas de la misma categoria (por ejemplo, otros modelos abiertos de 30-35B). La comparativa disponible se limita al rendimiento del motor de inferencia sobre el mismo checkpoint.

## Limitaciones y advertencias

- La licencia no esta declarada en este repositorio; antes de uso comercial hay que verificar la licencia del modelo base Nanbeige4.3-33B y la del checkpoint GGUF de bartowski.
- El limite de contexto efectivo del servidor es 260 096 tokens, la mitad de los 512K declarados por el modelo base; ademas, no hay evidencia registrada de que se sirva correctamente un needle-in-the-haystack a contexto completo (`needle_full` sin evidencia).
- El rendimiento en contexto largo se degrada: el prefill a 32k cae al 20 % del roofline y la decodificacion a 32k al 62 %.
- La concurrencia esta limitada a 4 peticiones y la salida a 4 096 tokens por peticion.
- No hay soporte de vision ni de audio, ni control de esfuerzo de razonamiento.
- La tasa de aceptacion de la decodificacion especulativa es baja (14 % medido en la puerta `spec`, 2-8 % en las sesiones de decodificacion), por lo que la ganancia real de la especulacion es modesta.
- En 4 flujos concurrentes, Loom rinde un 6 % por debajo de llama.cpp en decodificacion agregada.
- No se han publicado evaluaciones de sesgos, alucinacion o calidad multilingue en la informacion disponible; no hay datos de idiomas soportados.
- Todo el rendimiento reportado corresponde a un unico hardware (Ryzen AI Max+ 395) y a una unica ejecucion por valor; no debe extrapolarse a otras GPU sin medir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-fun/bartowski-Nanbeige4.3-33B-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Repositorio del runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia con resultados: https://github.com/loom-fun/loom-skills/actions/runs/42352761964
- Ficha del modelo base Nanbeige4.3-33B (fuente secundaria): https://ai-tldr.dev/models/nanbeige-4-3-33b/
