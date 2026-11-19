# litert-community/Qwen3.5-35B-A3B

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba Qwen, con 35 mil millones de parametros totales y aproximadamente 3 mil millones activos por token (de ahi el sufijo A3B). La version aqui descrita es una conversion del decodificador de texto del modelo original al formato LiteRT-LM, realizada por la comunidad litert-community mediante la herramienta `export_hf` de litert-torch. El objetivo de esta conversion es permitir la ejecucion del modelo en dispositivos mediante el runtime LiteRT de Google, con soporte para backends de CPU (XNNPACK) y GPU (WebGPU).

El modelo original resuelve tareas de generacion de texto y razonamiento con una arquitectura MoE eficiente en computo, ya que solo activa una fraccion de sus parametros por token. La conversion a LiteRT-LM es relevante porque abre la puerta a inferencia local en hardware de consumo y estaciones de trabajo con GPU integrada, sin depender de frameworks de servidor tradicionales como vLLM o TGI.

Esta ficha se centra en el artefacto publicado por litert-community, que incluye unicamente el decodificador de texto (sin codificador de vision ni capas de prediccion multi-token) y una ventana de contexto limitada a 4096 tokens en los ficheros publicados. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion parcialmente rotatoria y estado Gated DeltaNet; convertido a LiteRT-LM |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | aproximadamente 3 mil millones (3B) por token |
| Longitud de contexto | 4096 tokens en los ficheros publicados (ekv4096) |
| Tipos de cuantizacion | Expertos int4 (bloque 32), atencion y lm_head int8, resto fp32; activaciones fp16 en el fichero GPU; gate del experto compartido en float |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), dos ficheros: CPU y GPU |
| Tamano del repositorio | 82.8 GB |
| Tamano por fichero | 27.61 GB cada uno (CPU y GPU) |
| Backends soportados | CPU (XNNPACK) y GPU (WebGPU) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura transformer con capas Mixture-of-Experts, en la que cada token activa aproximadamente 3B de los 35B parametros totales. La model card de la conversion menciona componentes especificos: atencion con permutacion rotatoria parcial (partial-rotary permutation), estado Gated DeltaNet (un mecanismo de estado recurrente lineal) y un experto compartido con gate de salida unica. La conversion a LiteRT-LM preserva el decodificador de texto e incluye 10 capas de atencion en el fichero GPU, segun las comprobaciones de pesos q/k norm documentadas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original, ya que la model card de la conversion no los detalla. La innovacion tecnica destacable de esta publicacion es la propia conversion: el uso de kernels MoE en LiteRT con activacion SiLU (aun no incluida en la release estable 0.19.1, pendiente en los PR #11192 y #11188) y la compilacion del runtime desde el codigo fuente main. La cuantizacion mixta (int4 para expertos, int8 para atencion y lm_head, fp32 para el resto) busca equilibrar tamano y precision en dispositivos.

## Capacidades

- Generacion de texto y razonamiento en ingles, con modo "thinking" (razonamiento extendido) configurable.
- Razonamiento matematico basico y aritmetica (el ejemplo de la model card resuelve 17 + 25).
- Conversacion multi-turno, aunque con limitaciones documentadas en el estado Gated DeltaNet y en el filtrado de contenido del KV cache.
- Inferencia en CPU (XNNPACK) y GPU (WebGPU) mediante el runtime LiteRT-LM.
- No incluye codificador de vision: el modelo es solo texto entrada/salida.
- No incluye capas de prediccion multi-token (MTP) en los ficheros publicados.
- No se documenta soporte de tool calling ni function calling en esta conversion.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del modo thinking.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: el fichero GPU alcanza 69.28 tok/s de decodificacion en un M4 Max con 128 GB, lo que permite prototipado interactivo de un MoE de 35B sin servidor dedicado.
- Despliegue en navegador o entornos WebGPU: el backend GPU de LiteRT-LM posibilita ejecutar el modelo en aplicaciones web o electron que requieran inferencia on-device con privacidad de datos.
- Procesamiento por lotes en CPU: con 8.48 tok/s de decodificacion y 104.45 tok/s de prefill en 12 hilos, es viable para tareas de generacion no interactivas como resumenes o clasificacion de textos cortos.
- Evaluacion de modelos MoE en hardware de consumo: sirve como banco de pruebas para medir el rendimiento de kernels MoE int4 en XNNPACK y WebGPU antes de invertir en infraestructura mayor.
- Educacion e investigacion: permite a desarrolladores estudiar el comportamiento de un MoE de 35B con cuantizacion mixta en un entorno controlado y reproducible.
- Integracion en pipelines de CI para pruebas de regresion de modelos: los checks de accuracy (12/12 preguntas con mismo veredicto que Transformers bf16) permiten validar conversiones automaticamente.
- Asistentes de texto offline en ingles: para aplicaciones que requieran generacion de texto sin conexion y con contexto de hasta 4096 tokens.

## Benchmarks y rendimiento

Rendimiento medido en Apple M4 Max (128 GB), 1.024 tokens de prefill y 256 de decodificacion, el 2026-11-12:

| Fichero | Backend | Prefill (tok/s) | Decodificacion (tok/s) | Huella pico |
|---|---|---:|---:|---:|
| `qwen35_35b_a3b_mixed_int4_cpu_ekv4096.litertlm` | CPU (XNNPACK, 12 hilos) | 104.45 | 8.48 | 17.18 GB |
| `qwen35_35b_a3b_mixed_int4_gpu_ekv4096.litertlm` | GPU (WebGPU) | 1,325.4 | 69.28 | 35.43 GB |

Precision (comparado con Transformers en bf16, greedy, thinking activado):

| Fichero | Backend | Mismo veredicto que Transformers | Termina con token de parada | 3 turnos |
|---|---|---:|---:|---|
| CPU | XNNPACK, 12 hilos | 12 / 12 | 12 / 12 | falla en turno 3 |
| GPU | WebGPU | 12 / 12 | 12 / 12 | falla en turno 3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 17.18 GB de huella pico en CPU; 35.43 GB de huella pico en GPU (WebGPU).
- Tamano en disco: 27.61 GB por fichero (CPU o GPU), 82.8 GB el repositorio completo.
- GPU recomendadas: Apple M4 Max (128 GB) es el hardware de referencia documentado; no se especifican GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: no confirmado para GPUs de consumo con menos de 35 GB de VRAM; el fichero GPU requiere aproximadamente 35.43 GB de huella pico, por lo que una RTX 4090 (24 GB) no seria suficiente segun los datos publicados.
- Opciones de despliegue: exclusivamente el runtime LiteRT-LM (compilado desde main `02d7e8d8`), con el binario `litert_lm_advanced_main`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: 69.28 tok/s de decodificacion y 1,325.4 tok/s de prefill en GPU WebGPU; 8.48 tok/s de decodificacion y 104.45 tok/s de prefill en CPU con 12 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| Qwen3.5-35B-A3B (original) | 35B | ~3B | no disponible | Apache 2.0 | safetensors | Modelo base en Transformers; incluye vision y MTP |
| litert-community/Qwen3.5-35B-A3B (esta ficha) | 35B | ~3B | 4096 | Apache 2.0 | litertlm | Solo texto; sin vision ni MTP; runtime LiteRT-LM |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Una sola conversacion por motor: una nueva conversacion en el mismo motor no reinicia el estado Gated DeltaNet (issue #3165 de LiteRT-LM).
- Tras un fallo por exceso de contexto, todos los mensajes posteriores de esa conversacion fallan en LiteRT-LM 0.18.1 y 0.19.1 (error `Task failed with state: 7`); es necesario iniciar una nueva conversacion en un nuevo motor.
- Multi-turno con thinking activado y configuracion por defecto (`filter_channel_content_from_kv_cache` true): en la prueba de 3 turnos, el pensamiento del turno 3 no listo el mensaje del usuario y agoto el limite de 2.048 tokens sin respuesta (2 de 2 ejecuciones en GPU, 1 con 12 hilos en CPU).
- El fichero CPU omitio una lista de 80 cajas del turno 1 (2 de 2 ejecuciones); el fichero GPU respondio correctamente al mismo historial enviado como un unico prompt (3 de 3 ejecuciones).
- LiteRT-LM 0.19.1 no ejecuta estos ficheros: los kernels `moe` solo aceptan GELU y SiLU esta pendiente en los PR #11192 y #11188; es necesario compilar el runtime desde main.
- Solo ingles segun la model card; no se documentan capacidades multilingues.
- Sin codificador de vision ni capas MTP en los ficheros publicados.
- Riesgo de alucinacion no cuantificado en la informacion disponible; no hay evaluaciones de sesgo publicadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los pesos convertidos deben verificarse contra la licencia original de Qwen.
- Contexto limitado a 4096 tokens en esta conversion, muy inferior al contexto tipico de modelos de su clase.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Notas de conversion y detalles: https://huggingface.co/litert-community/Qwen3.5-35B-A3B/blob/main/DETAILS.md
- PR LiteRT #11192: https://github.com/google-ai-edge/LiteRT/pull/11192
- PR LiteRT #11188: https://github.com/google-ai-edge/LiteRT/pull/11188
- Issue LiteRT-LM #3165: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
