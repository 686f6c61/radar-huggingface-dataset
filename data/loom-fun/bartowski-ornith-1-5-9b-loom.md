# loom-fun/bartowski-Ornith-1.5-9B-loom

## Resumen

`loom-fun/bartowski-Ornith-1.5-9B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `bartowski/Ornith-1.5-9B-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado generado con el flujo `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), pensado para servirse con `loom-serve` sobre GPU AMD integrada y exponer una API compatible con OpenAI.

El modelo subyacente, Ornith-1.5-9B, es un modelo multimodal de tipo image-text-to-text con aproximadamente 9.000 millones de parametros, capacidad de razonamiento (thinking mode activado por defecto), soporte de tool calling y una ventana de contexto declarada de 262.144 tokens por peticion. El paquete anade decodificacion especulativa DFlash con profundidad 7 y un proyector multimodal `mmproj-Ornith-1.5-9B-f16.gguf`.

Su relevancia es fundamentalmente practica: demuestra una via de inferencia alternativa a llama.cpp en hardware AMD consumer con memoria unificada, con mejoras medidas de hasta el 92 % en prefill a 32k y una penalizacion del 27 % en decode a 32k. La licencia es MIT y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal image-text-to-text; el paquete es un artefacto de despliegue Loom sobre GGUF) |
| Parametros totales | 9B (aproximado, segun el nombre del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); el repo base de bartowski ofrece otros quants no detallados aqui |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) + proyector multimodal `mmproj-Ornith-1.5-9B-f16.gguf`; paquete Loom (`model.json` + programas `.loom`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Ornith-1.5-9B (tipo de atencion, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO). Lo que si se documenta es el componente multimodal: el modelo acepta entrada de imagen mediante un proyector `mmproj-Ornith-1.5-9B-f16.gguf` (y una variante bf16 en el repo base de bartowski), que se empareja con cualquier cuantizacion del checkpoint.

El artefacto Loom en si anade una capa de ejecucion: kernels generados y validados contra implementaciones de referencia (57/57 tests unitarios superados), decodificacion especulativa DFlash con profundidad 7 y un borrador externo (`abenzerps/Ornith-1.5-9B-DFlash-GGUF`, Q4_K_M), activada por defecto, y un servidor con API estilo OpenAI. La validacion de correctitud incluye comparacion token a token contra llama.cpp sobre el mismo GGUF (greedy y top-5 log-probs, prompts cortos y documentos de 1k a 32k), paridad en entrada de imagen, consistencia bajo concurrencia y equivalencia exacta entre decodificacion especulativa activada y desactivada.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen via partes `image_url` estilo OpenAI, con proyector multimodal dedicado (pipeline image-text-to-text).
- Tool calling estilo OpenAI: campos `tools` y `tool_calls`, con bucle multi-turno validado (renderizado exacto del prompt, reutilizacion de historial y llamadas validas).
- Capacidades de agente y razonamiento multi-paso mediante el bucle de tool calling verificado.
- Decodificacion especulativa DFlash (profundidad 7) activada por defecto, con un 45 % de tokens del borrador aceptados.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`; la distribucion del primer token coincide con llama.cpp.
- Concurrencia de 4 peticiones simultaneas con salida identica a la ejecucion aislada.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- No soporta audio (ni entrada ni salida) ni ajuste de "reasoning effort".

## Casos de uso

- Asistencia conversacional multi-turno con documentos largos: la ventana de 262.144 tokens permite mantener contratos, informes o bases de codigo completas en contexto, con un prefill medido de 1.376 tok/s a 32k en Strix Halo.
- Procesamiento de documentos escaneados con vision: el modelo acepta imagenes junto a texto, adecuado para extraccion de datos de facturas, formularios o capturas, usando el proyector f16 emparejado con el quant Q4_K_M.
- Agentes con herramientas en local: el soporte verificado de `tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs internas o bases de datos sin salir a la nube, sobre hardware AMD integrado.
- Despliegue en estaciones de trabajo con GPU integrada AMD: el paquete Loom esta pensado para `loom-serve --device=amdgpu`, lo que facilita servir el modelo en equipos Ryzen AI Max+ sin GPU discreta.
- Razonamiento con traza explicita: el thinking mode por defecto resulta util en tareas de analisis o depuracion donde se quiere inspeccionar el razonamiento intermedio; se puede desactivar para reducir latencia en respuestas simples.
- Prototipado con API compatible OpenAI: al exponer `/v1/chat/completions` en `127.0.0.1:8080`, se puede apuntar cualquier cliente o SDK existente sin cambiar codigo, util para evaluar el modelo antes de migrar a produccion.
- Procesamiento por lotes con concurrencia moderada: 4 peticiones concurrentes con salida determinista lo hacen apto para pipelines de clasificacion o resumen de volumen medio.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 26.04, hrx-loom 0.1.0, sobre el mismo GGUF Q4_K_M, comparando Loom frente a llama.cpp (build `llamacpp-rocm/b1369`):

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 49,6 | 52,0 | +5 % | 168,3 | 31 % |
| Decode tok/s, contexto 2k | 45,8 | 43,6 | -5 % | 166,2 | 26 % |
| Decode tok/s, contexto 32k | 39,7 | 28,9 | -27 % | 140,6 | 21 % |
| Prefill tok/s, documento 1k | 918,7 | 1490,4 | +62 % | 4243,3 | 35 % |
| Prefill tok/s, documento 2k | 915,8 | 1516,4 | +66 % | 4223,4 | 36 % |
| Prefill tok/s, documento 8k | 924,9 | 1569,0 | +70 % | 4107,8 | 38 % |
| Prefill tok/s, documento 16k | 829,6 | 1502,5 | +81 % | 3963,1 | 38 % |
| Prefill tok/s, documento 32k | 718,4 | 1376,3 | +92 % | 3702,4 | 37 % |
| 4 streams, decode agregado tok/s | 109,0 | 96,1 | -12 % | 663,2 | 14 % |
| Tokens del borrador aceptados (especulativa) | no medido | 45 % | no aplica | no aplica | no aplica |

El roofline se calcula para este GGUF en Strix Halo (gfx1151) a 216 GB/s y 59 TFLOP/s, con un factor de 4,15 tokens por pasada de verificacion (1 + 45 % aceptados x profundidad 7), sin contar el coste del borrador. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo oficial arranca con `--memory_bytes=30000000000` (30 GB) sobre memoria unificada del Ryzen AI Max+ 395; el checkpoint Q4_K_M de 9B ocupa bastante menos, pero el presupuesto incluye contexto y buffers.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo), con 216 GB/s de ancho de banda y 59 TFLOP/s declarados para el calculo del roofline.
- No hay datos de funcionamiento en A100, H100 ni RTX 4090; el paquete esta generado y validado especificamente para `--device=amdgpu` en Strix Halo.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve` como servidor en `127.0.0.1:8080`. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp para este paquete (llama.cpp se usa solo como referencia de comparacion).
- Latencia y throughput: decode de 52,0 tok/s con prompt corto y 28,9 tok/s a 32k; prefill de 1.490 a 1.569 tok/s entre 1k y 8k, bajando a 1.376 tok/s a 32k; 96,1 tok/s agregados con 4 streams.
- El borrador especulativo DFlash Q4_K_M (`abenzerps/Ornith-1.5-9B-DFlash-GGUF`) se ejecuta en el mismo dispositivo; su coste no esta incluido en las cifras de roofline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-fun/bartowski-Ornith-1.5-9B-loom | 9B | 262.144 | MIT | GGUF + paquete Loom | Paquete de despliegue para AMD Strix Halo con especulativa DFlash; sin benchmarks academicos publicados |
| bartowski/Ornith-1.5-9B-GGUF | 9B | no disponible en la informacion | no disponible en la informacion | GGUF + mmproj f16/bf16 | Checkpoint base sin modificar; incluye proyector multimodal; es el origen del paquete Loom |
| abenzerps/Ornith-1.5-9B-DFlash-GGUF | no disponible | no disponible | no disponible | GGUF Q4_K_M | Modelo borrador para decodificacion especulativa, no un modelo de chat autonomo |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas de otros fabricantes en la informacion proporcionada, por lo que no se incluye comparacion con modelos de terceros.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: cualquier limitacion del checkpoint Ornith-1.5-9B subyacente se hereda sin cambios.
- No hay evidencia registrada para varias puertas de validacion: `agent_think_off` (tool calling con thinking desactivado), `needle` (needle-in-a-haystack hasta la mitad del contexto) y `needle_full` (contexto completo). La ventana de 262.144 tokens esta declarada, pero su recuperacion fiable a contextos largos no esta verificada.
- El rendimiento cae con contexto largo: -27 % en decode a 32k frente a llama.cpp y solo un 21 % del roofline, lo que desaconseja cargas de generacion larga con contexto extenso.
- La concurrencia esta limitada a 4 peticiones y el throughput agregado con 4 streams es un 14 % del roofline (-12 % frente a llama.cpp).
- La salida maxima esta limitada a 4.096 tokens por peticion, insuficiente para generaciones largas sin trocear.
- No soporta audio ni ajuste de esfuerzo de razonamiento; el thinking mode esta activado por defecto y debe desactivarse explicitamente para reducir latencia.
- Las mediciones son ejecuciones locales unicas o con 1-2 repeticiones (media) y 1 repeticion (mediana) para 4 streams; la comparacion mezcla temporizacion en cliente (Loom) y en servidor (llama.cpp), lo que introduce sesgo metodologico.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni cobertura idiomatica; los idiomas soportados figuran como no disponibles.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion por terceros.
- La licencia MIT del paquete no exime de verificar la licencia del checkpoint base y del proyector multimodal, no detallada en la informacion disponible.
- Dependencia de un stack joven y especifico (hrx-loom 0.1.0, hrx-system `d01d1c1`, `loom-skills`): la API y el formato pueden cambiar.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/bartowski-Ornith-1.5-9B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Arbol de ficheros del checkpoint base: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF/tree/main
- Modelo borrador para decodificacion especulativa: https://huggingface.co/abenzerps/Ornith-1.5-9B-DFlash-GGUF
- Repositorio hrx-system (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
