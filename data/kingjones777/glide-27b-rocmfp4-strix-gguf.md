# kingjones777/GLiDE-27B-ROCmFP4-STRIX-GGUF

## Resumen

GLiDE-27B-ROCmFP4-STRIX-GGUF es una cuantizacion en formato GGUF del modelo fastino/GLiDE-27B, un transformer de 25.624.600.064 parametros (25,6 mil millones) derivado de Qwen3.8-27B. La publica el usuario kingjones777 y esta especificamente optimizada para hardware AMD Strix Halo (gfx1151, Ryzen AI Max+ 395 con Radeon 8060S), empleando el formato propietario ROCmFP4 (tipos ggml 100-106) en lugar de las cuantizaciones estandar de llama.cpp. El modelo base GLiDE-27B es un "decision model": su cabeza nativa es un readout de 255 vias que puntua preguntas tipadas en un unico forward pass, no un `lm_head` generativo convencional.

Esta publicacion contiene unicamente el backbone transformer de texto. El encoder de vision y el readout de decision de 255 vias del repositorio original no estan incluidos en el GGUF. Ademas, se distribuyen dos ficheros de rutas de prefill en 4 bits (Super ROC) que deben cargarse junto al modelo para obtener la calidad declarada. El contexto nativo del GGUF es de 262.144 tokens, aunque el comando de servicio recomendado emplea 131.072.

La relevancia de esta ficha es doble: por un lado documenta un caso de cuantizacion muy agresiva (4,39 BPW) con perdida de calidad medida (1,0193x la perplejidad de Q8_0); por otro, advierte de que el resultado no es un modelo conversacional funcional, ya que sin la cabeza de decision el texto decodificado no es ingles coherente. Es, por tanto, material de interes para experimentacion con ROCmFP4 en APUs AMD, no para despliegue en produccion como chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B, tipo ggml `qwen35`), 64 bloques, embeddings atados |
| Parametros totales | 25.624.600.064 (25,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en el GGUF; 131.072 en el comando de servicio recomendado |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX (tipo ggml 105) con imatrix; embedding de tokens en Q6_K; tipos de tensor en el fichero: 416 x ggml type 101, 80 x type 100, 353 x F32, 1 x Q6_K |
| Idiomas soportados | No disponible |
| Licencia | fastino-community (license: other) |
| Formato de pesos | GGUF (fichero principal de 14.084.639.424 bytes, 4,39 BPW) mas dos ficheros de rutas `.a4w` y `.a4r` |
| Vocabulario | 248.320 tokens |
| Tamano del repo | 25,6 GB |
| Ficheros auxiliares | `route.a4w` (8.640.268.824 bytes, prefill 4-bit), `down-rot256.a4r` (2.878.866.208 bytes, ruta `ffn_down` rotada) |
| Runtime requerido | ROCm 7.2.4 y motor que cargue ROCmFP4 (tipos ggml 100-106); llama.cpp estandar rechaza estos tipos |
| Drafter especulativo | `Qwen3.8-27B-DFlash2-Q4_K_M.gguf` (repositorio externo z-lab) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 bloques con 25,6 mil millones de parametros y embeddings atados (no existe tensor `output.weight` separado). La arquitectura se identifica en el GGUF como `qwen35`, lo que indica una evolucion de la familia Qwen3.5. El rasgo distintivo del modelo original es su cabeza de salida: en lugar de un `lm_head` generativo, GLiDE incorpora un readout de 255 vias que clasifica preguntas tipadas en un solo forward pass, lo que lo convierte en un modelo de decision mas que en un generador de texto libre. Esa cabeza no se ha incluido en esta cuantizacion.

El proceso de cuantizacion parte de los safetensors BF16 de `fastino/GLiDE-27B`, convertidos a un GGUF BF16 unico (850 tensores). Se calculo una importance matrix con 531 fragmentos de 512 tokens de texto agentico de calibracion (el mismo usado para el fichero STRIX de Qwen3.8-27B), generando 496 entradas de imatrix sobre un Q8_0 de GLiDE. La cuantizacion se ejecuto con `llama-quantize --imatrix ... --output-tensor-type q6_K --token-embedding-type q6_K ... Q4_0_ROCMFP4_STRIX 16`, reduciendo el modelo de 48.880,09 MiB (16,00 BPW) a 13.421,67 MiB (4,39 BPW) en 188,5 segundos. Los ficheros de rutas Super ROC se generaron volcando escalas de columna sobre el propio fichero STRIX (prompt de 8K tokens, contexto 4096) y escalas rotadas sobre texto de calidad retenido con `SUPERROC_INT4_DOWN_ROT=256`.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas mas alla de la mencionada cabeza de decision.

## Capacidades

- Generacion de texto: tecnicamente el backbone produce tokens, pero sin la cabeza de decision el texto decodificado no es ingles coherente, segun la propia model card.
- Decision tipada (255 vias): capacidad nativa del modelo base que NO esta disponible en este GGUF.
- Vision: el encoder visual del repositorio original no se incluye en esta cuantizacion.
- Tool calling / function calling: una prueba con una peticion de herramienta meteorologica devolvio HTTP 200 con `finish_reason=length` y sin `tool_calls`; no funcional en la practica.
- Razonamiento multi-paso y agentes: no verificable sin la cabeza de decision; el texto de calibracion era agentico, pero no se documenta capacidad agentica en el GGUF.
- Multilingue: no disponible.
- Modo thinking: el comando de servicio lo desactiva explicitamente (`--think off`); no se documenta un modo thinking funcional.
- Cache de prefijo: soportada; en una prueba, el segundo turno de un prefijo de 1.802 tokens reutilizo 1.802/1.802 tokens cacheados, y el turno siguiente 1.802/1.899.
- Decodificacion especulativa: soportada mediante el drafter DFlash2 externo, con 75/263 y 99/212 tokens de borrador aceptados en las pruebas documentadas.

## Casos de uso

- Experimentacion con ROCmFP4 en APUs AMD Strix Halo: sirve para validar el pipeline de cuantizacion ROCmFP4 (tipos ggml 100-106) y el motor Super ROC sobre gfx1151, midiendo velocidad y calidad frente a Q8_0.
- Benchmarking de decodificacion especulativa: el par GGUF + drafter DFlash2 permite medir tasas de aceptacion de borradores (75/263 y 99/212 en las pruebas) y throughput de generacion en hardware integrado.
- Investigacion sobre cuantizacion con importance matrix: los datos publicados (531 fragmentos x 512 tokens, 496 entradas, 4,39 BPW, 1,0193x PPL frente a Q8_0) permiten reproducir y comparar recetas de cuantizacion agresiva.
- Estudio de modelos de decision: util para analizar el comportamiento del backbone de GLiDE cuando se le priva de su readout de 255 vias, documentando la perdida de coherencia generativa.
- Pruebas de infraestructura de servicio: el comando `superroc serve llm` con contexto 131.072 y cache de prefijo sirve para validar despliegues de contexto largo en memoria unificada de 128 GB.
- Reproducibilidad de rutas de prefill Super ROC: los ficheros `.a4w` y `.a4r` permiten verificar el mecanismo de rutas 4-bit con rotacion de `ffn_down` (bloque 256, clip 3, fine 64) en un modelo de 27B.

## Benchmarks y rendimiento

La model card solo publica perplejidad (menor es mejor) sobre texto retenido, contexto 4096, 5 fragmentos y 10.235 tokens puntuados. El autor advierte que la PPL generativa absoluta es alta porque la cabeza nativa no es un `lm_head` generativo; la cifra util es el ratio frente a Q8_0.

| Fichero / ruta | PPL | vs Q8_0 |
|---|---:|---:|
| Q8_0 de referencia (no distribuido) | 373.673 | 1,0000 |
| STRIX con ruta de cinco tensores | 385.580 | 1,0319 |
| STRIX con ruta de cinco tensores + down rotado + attention VW plegada | 380.893 | 1,0193 |

El umbral de calidad declarado es 1,02x Q8_0 (381.146,46); la pila completa alcanza 1,0193x.

Velocidad medida en Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), 128 GB unificados, ROCm 7.2.4, temperatura 0, cache de prompt fria, media de dos ejecuciones:

| Medicion | Resultado |
|---|---:|
| Procesamiento de prompt de 1.566 tokens | 455,9 tok/s |
| Generacion tras ese prompt (hasta 256 tokens) | 17,7 tok/s |
| Borradores aceptados en ese prompt | 75 / 263 |
| Procesamiento de prompt de 13.384 tokens | 820,85 tok/s |
| Generacion tras ese prompt | 20,05 tok/s |
| Borradores aceptados en ese prompt | 99 / 212 |
| Procesamiento de prompt de 26.821 tokens | 756,45 tok/s |
| Generacion tras ese prompt | 18,0 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el fichero principal ocupa 14.084.639.424 bytes (13,1 GiB); sumando las rutas `.a4w` (8,0 GiB) y `.a4r` (2,7 GiB) se aproximan 23,8 GiB de pesos. Con contexto 131.072 y cache KV hay que anadir varios GiB, por lo que se recomienda memoria unificada o VRAM de 32 GB o mas.
- GPU objetivo: AMD Strix Halo (gfx1151, Radeon 8060S) con Ryzen AI Max+ 395 y 128 GB unificados; es el unico hardware con el que se han publicado mediciones.
- GPU consumer: no cabe en GPUs consumer de 24 GB o menos con contexto largo; requiere al menos 32 GB de VRAM o memoria unificada de 64-128 GB.
- Despliegue: motor Super ROC con soporte de ROCmFP4 (tipos ggml 100-106) sobre ROCm 7.2.4; llama.cpp estandar no es compatible. Variables de entorno necesarias: `SUPERROC_ATTN_FOLDED=1`, `SUPERROC_ATTN_VW=1`, `SUPERROC_INT4_WEIGHTS`, `SUPERROC_INT4_TENSORS`, `SUPERROC_INT4_DOWN_WEIGHTS`, `SUPERROC_INT4_DOWN_ROT=256`.
- Latencia y throughput: prompt processing entre 455,9 y 820,85 tok/s segun longitud; generacion entre 17,7 y 20,05 tok/s con decodificacion especulativa DFlash2 activada.
- Drafter externo: `Qwen3.8-27B-DFlash2-Q4_K_M.gguf` de z-lab, no incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLiDE-27B-ROCmFP4-STRIX (este) | 25,6 B denso | 262.144 nativo / 131.072 servido | GGUF ROCmFP4 4,39 BPW | fastino-community | Solo backbone de texto; sin cabeza de decision ni vision; requiere motor Super ROC |
| fastino/GLiDE-27B (base) | 25,6 B denso | No disponible | safetensors BF16 | fastino-community | Incluye encoder visual y readout de 255 vias; modelo de decision funcional |
| Qwen3.8-27B (familia de origen) | ~27 B denso | No disponible | Multiples | No disponible | Arquitectura `qwen35`; GLiDE deriva de esta familia |
| Qwen3.8-27B-DFlash2-Q4_K_M (drafter) | No disponible | No disponible | GGUF Q4_K_M | No disponible | Drafter especulativo usado junto a este modelo, no alternativa completa |

## Limitaciones y advertencias

- El texto generado no es coherente: sin la cabeza de decision de 255 vias, las respuestas de chat devuelven HTTP 200 con `finish_reason=length` pero texto no inteligible en ingles.
- Tool calling no funcional: la prueba con herramienta meteorologica no devolvio `tool_calls`.
- No incluye vision ni la API de decision nativa de GLiDE; es unicamente el backbone de texto.
- Los ficheros de rutas `.a4w` y `.a4r` solo son validos para este GGUF concreto; usarlos con otro fichero de 27B carga pero produce respuestas incorrectas (el motor solo comprueba numero de capas y anchura).
- Requiere un runtime no estandar (Super ROC) y ROCm 7.2.4; llama.cpp estandar rechaza los tipos de tensor ROCmFP4.
- Perdida de calidad medida: 1,0193x la perplejidad de Q8_0 en el mejor caso, con umbral declarado de 1,02x.
- Licencia fastino-community: es necesario revisar el enlace de licencia del modelo base antes de cualquier uso comercial; la model card no detalla restricciones adicionales.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue.
- Sin datos de sesgos, alucinacion o evaluaciones de seguridad publicadas.
- Creado en 2026-11-10 con 0 descargas y 0 likes: no hay validacion comunitaria independiente.
- El contexto nativo de 262.144 tokens no se ha probado en las mediciones de velocidad (maximo documentado: 26.821 tokens).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/GLiDE-27B-ROCmFP4-STRIX-GGUF
- Modelo base: https://huggingface.co/fastino/GLiDE-27B
- Licencia del modelo base: https://huggingface.co/fastino/GLiDE-27B/blob/main/LICENSE
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Paper, blog o demo oficial: no disponible
