# kingjones777/Xing4.0-29B-A4B-ROCmFP4-GGUF

## Resumen

Xing4.0-29B-A4B-ROCmFP4-GGUF es una cuantizacion en 4 bits con formato ROCmFP4 del modelo XingChen-AGI/Xing4.0-29B-A4B, un MoE de China Telecom AI (heredero de la serie TeleChat) con 29.000 millones de parametros totales y 4.000 millones activos por token. La publica el usuario kingjones777 y esta especificamente construida para AMD Ryzen AI Max+ "Strix Halo" (gfx1151), es decir, para equipos con memoria unificada y aceleracion ROCm/HIP en lugar de GPU dedicada.

El modelo base combina arquitectura MoE con MLA (Multi-head Latent Attention) y mHC (hyper-connections), una combinacion que ningun arquetipo existente de llama.cpp implementa, y declara una ventana de contexto de 262.144 tokens. Estas cuantizaciones emplean tipos de tensor propietarios (ROCmFP4, con identificadores >= 100, por encima de `GGML_TYPE_COUNT` de llama.cpp estandar) y anaden un bloque MTP (Multi-Token Prediction) en la capa 40 que acelera la decodificacion un 48,9% con decodificacion especulativa.

Su relevancia ahora es doble: por un lado, es una de las pocas vias documentadas para ejecutar un MoE de ~29B con atencion MLA en hardware Strix Halo, y por otro, demuestra el coste real de esa via: obliga a compilar un fork (ROCmFPX, rama `xing4-port`, commit `cbc2cd5`), no funciona con llama.cpp de serie y el MTP consume la mitad del contexto disponible. Se publica en tres niveles de calidad (COHERENT, STRIX_LEAN y FAST) con perplejidades medidas y comprobadas contra `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con MLA (Multi-head Latent Attention) y mHC (hyper-connections); 41 bloques, `n_embd_head_k=192`, `n_embd_head_v=128` |
| Parametros totales | 31.215.031.088 (~31,2 B) segun safetensors; denominacion comercial 29B totales |
| Parametros activos | 4.000 millones por token (A4B) |
| Longitud de contexto | 262.144 tokens declarados por la arquitectura; 32.768 servidos y medidos; el MTP reduce el contexto utilizable a la mitad; no se han probado contextos superiores a 32K |
| Tipos de cuantizacion | ROCmFP4 en 4 bits; ftype 102 (COHERENT), 106 (STRIX_LEAN, cabeza q6_K) y 103 (FAST, cabeza q4_K); tipos de tensor propietarios >= 100, incompatibles con llama.cpp estandar |
| Idiomas soportados | No disponible. Se ha observado respuesta en ingles con traza de razonamiento en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria `gguf`); repo de 51,6 GB con tres variantes de 15,51 a 16,62 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con atencion MLA y hyper-connections (mHC). La model card de la cuantizacion confirma 41 bloques (`block_count = 41`) y `nextn_predict_layers = 1`, lo que situa en la capa 40 un bloque MTP (Multi-Token Prediction) cuyos pesos estan incluidos en estos archivos. Las dimensiones de cabeza de atencion (`n_embd_head_k=192`, `n_embd_head_v=128`) no coinciden con las de ningun arquetipo implementado en llama.cpp, de ahi que el autor haya tenido que portar la arquitectura bajo el nombre `xing4`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni el uso de RLHF o DPO en la informacion proporcionada. El modelo se comporta como un modelo de razonamiento con modo "thinking" activado por defecto. La innovacion tecnica destacable de esta publicacion es el port a ROCm/HIP: la proyeccion de hyper-connections se calcula en F32 en lugar de bf16, lo que situa la perplejidad del port (8,3608) un 0,7% por debajo de la referencia en `transformers` bf16 (8,4252) sobre los mismos tokens, una diferencia de direccion y magnitud predicha de antemano por una referencia independiente en numpy. El segundo elemento tecnico es el bloque MTP, que actua como cabecera de decodificacion especulativa.

La verificacion se realizo con `llama-perplexity`, que puntua solo la segunda mitad de cada ventana; el autor advierte que puntuar todos los tokens desde la posicion 1 da 11,91 para el mismo modelo y datos, de modo que cualquier comparacion debe igualar la ventana de puntuacion.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento explicito en modo thinking, activado por defecto; la traza se separa correctamente en el campo `reasoning_content` de `llama-server`.
- Tool calling / function calling verificado con `--jinja` (resultado de ejemplo: `finish_reason: tool_calls` con `get_weather({"city":"Tokyo","unit":"celsius"})`).
- Decodificacion especulativa nativa mediante el bloque MTP de la capa 40 (hasta +48,9% de velocidad de decodificacion).
- Capacidades multilingues: no declaradas oficialmente; se observa generacion en ingles con razonamiento frecuentemente emitido en chino, comportamiento esperado segun el autor.
- Compatible con `endpoints_compatible` segun las etiquetas del repositorio.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Inferencia local en equipos Strix Halo: un Ryzen AI Max+ con 128 GiB de memoria unificada puede servir el archivo COHERENT de 16,62 GiB con `-c 32768` y `-ngl 99`, lo que permite tener un MoE de ~29B en un equipo compacto sin GPU dedicada.
- Asistentes conversacionales con razonamiento: el modo thinking por defecto y la separacion en `reasoning_content` permiten mostrar la traza de razonamiento al usuario mientras se lee solo la respuesta final.
- Agentes con tool calling: con `--jinja` el modelo emite llamadas a funciones estructuradas, de modo que puede integrarse en bucles de agente que consulten APIs (por ejemplo, meteo, calendario o bases de datos) y encadenen varios pasos.
- Generacion de texto en lote con prompts largos: el prefill medido (829,8-838,3 t/s en pp512 en las tres variantes) hace viable procesar documentos largos de entrada, aunque el MTP penaliza el prefill un 14,5% si se activa.
- Despliegue de bajo consumo con la variante FAST: los 15,51 GiB de FAST y sus 29,67 t/s de decodificacion lo hacen adecuado cuando la restriccion principal es el espacio en disco o la memoria, aceptando un 1,8% mas de perplejidad que COHERENT.
- Evaluacion y comparacion de tecnicas de cuantizacion: al publicar tres niveles con perplejidad y velocidad medidas sobre el mismo hardware, sirve como banco de pruebas para estudiar el intercambio calidad/velocidad en cuantizacion no estandar sobre ROCm.
- Traduccion o asistencia bilingue ingles-chino: dado el comportamiento observado (respuesta en ingles, razonamiento en chino), puede encajar en flujos que requieran ambos idiomas, siempre con validacion previa de calidad.

## Benchmarks y rendimiento

Medidas del autor sobre las tres variantes cuantizadas. `tg128` es decodificacion de 128 tokens y `pp512` es prefill de 512 tokens.

| Metrica | COHERENT | STRIX_LEAN | FAST | BF16 (referencia) |
|---|---|---|---|---|
| Perplejidad (PPL) | 9,0639 ± 0,274 | 9,1095 ± 0,277 | 9,2258 ± 0,282 | 8,3608 ± 0,249 (port) / 8,4252 (HF transformers) |
| Tamano en disco | 16,62 GiB | 15,88 GiB | 15,51 GiB | no disponible |
| ftype | 102 | 106 | 103 | no disponible |
| tg128 | 29,04 t/s | 28,98 t/s | 29,67 t/s | no disponible |
| pp512 | 829,8 t/s | 838,3 t/s | 832,0 t/s | no disponible |

El propio autor advierte que, con ±0,27 de error, las diferencias de PPL entre niveles caen dentro de las barras de error individuales: la dispersion total es del 1,8% y el orden solo es significativo por tratarse de mediciones emparejadas sobre datos identicos.

Rendimiento del bloque MTP (medido el 19-09-2026 sobre el archivo STRIX_LEAN, prompt de 589 tokens generando 160 tokens, contexto de 32K, backend ROCm0):

| `--spec-type` | Prefill | Decodificacion | Respecto a desactivado | Longitud media aceptada |
|---|---:|---:|---:|---:|
| off | 454,8 t/s | 12,67 t/s | — | — |
| `draft-mtp --spec-draft-n-max 1` | 388,9 t/s | 18,87 t/s | +48,9% | 1,65 |
| `draft-mtp --spec-draft-n-max 2` | 411,9 t/s | 14,45 t/s | +14,0% | 1,83 |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: AMD Ryzen AI Max+ "Strix Halo" con iGPU gfx1151 y memoria unificada; las mediciones se tomaron en una maquina de 128 GiB.
- VRAM/memoria: entre 15,51 y 16,62 GiB por archivo segun variante, mas la cache KV para el contexto elegido. El repositorio completo ocupa 51,6 GB en disco.
- Contexto maximo servido: 32.768 tokens. La arquitectura declara 262.144, pero segun el autor ese contexto no puede asignarse en hardware de 128 GiB; ademas, activar MTP reduce a la mitad el contexto disponible.
- GPU recomendadas: exclusivamente la iGPU gfx1151 de Strix Halo en lo documentado. No se menciona compatibilidad con NVIDIA/CUDA ni con otras arquitecturas AMD; el build del fork se realiza con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`.
- Cabe en GPU de consumo: no hay datos de ejecucion en GPUs de consumo con CUDA. El unico escenario validado es memoria unificada de un APU AMD.
- Opciones de despliegue: `llama-server`, `llama-quantize` y `llama-perplexity` compilados desde el fork ROCmFPX, rama `xing4-port`, commit `cbc2cd5`. Es imprescindible la rama, no `main`. llama.cpp estandar no puede cargar los archivos. No se documenta soporte de vLLM, Ollama, TGI ni de otros runners.
- Flags recomendados en gfx1151: `-c 32768 -ngl 99 -fit off --jinja`. El autor desaconseja el auto-fit porque lee `MemAvailable` y puede recortar contexto o descargar capas en silencio.
- Throughput medido: 29,04-29,67 t/s de decodificacion y 829,8-838,3 t/s de prefill (pp512) sin MTP; con `--spec-type draft-mtp --spec-draft-n-max 1` la decodificacion sube a 18,87 t/s y el prefill baja a 388,9 t/s en el escenario de prompt largo.
- No probado: backend Vulkan y contextos superiores a 32K. Todas las cifras corresponden a ROCm.
- Presupuesto de tokens: el modo thinking consume muchos tokens; una respuesta de dos frases consumio 569 tokens de finalizacion y `max_tokens: 200` devuelve contenido vacio. Se recomienda presupuestar >= 600 tokens.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de otros autores en la documentacion proporcionada. La unica comparacion posible con los datos disponibles es entre las variantes publicadas y frente al modelo base sin cuantizar.

| Variante | Parametros | Contexto | PPL | Decodificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| COHERENT (ftype 102) | 31,2 B totales / 4 B activos | 32.768 servidos (262.144 declarados) | 9,0639 | 29,04 t/s | Apache 2.0 | GGUF en este repo |
| STRIX_LEAN (ftype 106) | 31,2 B / 4 B activos | idem | 9,1095 | 28,98 t/s | Apache 2.0 | GGUF en este repo |
| FAST (ftype 103) | 31,2 B / 4 B activos | idem | 9,2258 | 29,67 t/s | Apache 2.0 | GGUF en este repo |
| Xing4.0-29B-A4B BF16 | 31,2 B / 4 B activos | idem | 8,3608 (port) / 8,4252 (HF) | no disponible | Apache 2.0 | Pesos originales en XingChen-AGI |

El autor recomienda COHERENT como opcion por defecto y desaconseja STRIX_LEAN para este modelo concreto: es el mas lento en decodificacion y de peor calidad que COHERENT, porque su ventaja habitual proviene de una mejora PLE que Xing no implementa.

## Limitaciones y advertencias

- Requiere un fork y una rama concretos. Los tipos de tensor ROCmFP4 tienen identificadores >= 100, por encima de `GGML_TYPE_COUNT` de llama.cpp estandar, de modo que el archivo se rechaza sin posibilidad de arreglarlo editando metadatos. La arquitectura `xing4` solo existe en la rama `xing4-port` del fork ROCmFPX, fijada en el commit `cbc2cd5`.
- Contexto real muy inferior al declarado: la arquitectura anuncia 262.144 tokens, pero solo se han servido y medido 32.768, y el autor indica que 262.144 no se puede asignar en hardware de 128 GiB.
- El MTP, principal ventaja de velocidad, consume la mitad del contexto disponible (seccion de la model card truncada en la informacion recibida).
- Modelo de razonamiento: `max_tokens: 200` devuelve contenido vacio y una respuesta de dos frases consume 569 tokens de finalizacion. Un presupuesto bajo produce respuestas truncadas o vacias.
- La traza de razonamiento se emite a menudo en chino aunque la respuesta sea en ingles. El autor lo describe como comportamiento esperado, no como defecto, pero condiciona su uso en productos en castellano.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Los unicos datos de calidad son de perplejidad, que no mide veracidad.
- Idiomas soportados: no declarados oficialmente por el autor; no hay evaluacion multilingue publicada.
- Diferencias de calidad entre variantes dentro del margen de error (±0,27): no deben interpretarse como mejoras grandes, la dispersion total es del 1,8%.
- Rendimiento medido en un unico backend (ROCm) y un unico hardware (gfx1151); el prefill cae un 14,5% al activar MTP, por lo que la configuracion optima depende del trafico (generacion frente a lotes con prompts largos).
- Compatibilidad de despliegue muy limitada: no hay soporte documentado de vLLM, Ollama, TGI ni Vulkan, ni de CUDA.
- Licencia Apache 2.0 en este repositorio, permisiva para uso comercial. Debe verificarse la licencia del modelo base en su repositorio original antes de un despliegue en produccion.
- El modelo tiene 175 descargas y 1 like en el momento de la consulta: adopcion muy baja y validacion externa practicamente inexistente.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Xing4.0-29B-A4B-ROCmFP4-GGUF
- Repositorio del build con imatrix: https://huggingface.co/kingjones777/Xing4.0-29B-A4B-ROCmFP4-FAST-imatrix-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Fork necesario para cargar los archivos (rama `xing4-port`): https://github.com/kingjones30/ROCmFPX

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
