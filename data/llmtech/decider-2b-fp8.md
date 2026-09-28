# llmtech/decider-2b-fp8

## Resumen

decider-2b-fp8 es una cuantizacion en FP8 del checkpoint v11 del modelo Mapika/decider-2b, un modelo de decision de 1.881.825.088 parametros (aproximadamente 1,88 mil millones) construido sobre la arquitectura qwen3_5_text con capas de atencion lineal tipo delta-net. La cuantizacion la ha realizado LLM Tech (llmtech.eu) mediante llm-compressor 0.14.0 con el esquema FP8_DYNAMIC, mientras que el modelo original, su entrenamiento y su protocolo de evaluacion son de Mapika. El checkpoint resultante ocupa 2,39 GB frente a los 3,77 GB de la version en bf16, lo que reduce el peso en disco y en VRAM en torno a un 37 por ciento.

El modelo no es un generador de texto generalista: es un decisor de "system one" que resuelve tareas estructuradas en una sola pasada, devolviendo respuestas tipadas (por ejemplo eleccion entre categorias o valores numericos o nulos) a partir de un estado de entrada. Se sirve a traves de vLLM 0.29.0 mediante el endpoint POST /v1/systemone del paquete decider-ai, con el formato Jev de TypeSafe. Su relevancia actual esta en el nicho de clasificacion y enrutado de alta precision con calibracion medida (ECE publicado) y en que demuestra una cuantizacion FP8 sin perdida practica de exactitud: 0,0 puntos de diferencia en exactitud tanto en tareas in-task como held-out respecto a los pesos bf16.

La ventana de contexto no viene declarada en la informacion disponible; lo que si se documenta es que se han medido estados de hasta 32.768 tokens con latencias de 343 ms en FP8, y que con prefix caching un estado de 29.033 tokens repetido baja de 336 ms a 50 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer hibrido con capas de atencion lineal delta-net y atencion completa) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se han medido estados de hasta 32.768 tokens) |
| Tipos de cuantizacion | FP8 E4M3 con una escala por canal de salida en pesos y escalado de activaciones FP8 por token en tiempo de ejecucion; esquema FP8_DYNAMIC de llm-compressor 0.14.0, sin datos de calibracion |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); repositorio de 2,4 GB |

## Arquitectura y entrenamiento

El modelo base es Mapika/decider-2b en su revision v11 (revision `533964dae8be954c5b5e19fa4948e48408094c1e`), con arquitectura qwen3_5_text. Esta combina capas de atencion convencional (q_proj, k_proj, v_proj, o_proj) con modulos de atencion lineal delta-net (in_proj_qkv, in_proj_z, out_proj) y una convolucion y proyecciones auxiliares (linear_attn.conv1d, linear_attn.in_proj_a, linear_attn.in_proj_b). El detalle del entrenamiento, la composicion del dataset y el uso de RLHF o DPO corresponden a la model card del checkpoint bf16 y no se reproducen en la ficha de la cuantizacion; esta ficha remite explicitamente a esa documentacion del autor.

La aportacion de esta ficha es la receta de cuantizacion, no el entrenamiento. Se aplico llm-compressor 0.14.0 con el esquema FP8_DYNAMIC y sin datos de calibracion. Se cuantizaron 150 capas lineales: las proyecciones de atencion q_proj, k_proj, v_proj y o_proj; las proyecciones del delta-net in_proj_qkv, in_proj_z y out_proj; y las capas del MLP gate_proj, up_proj y down_proj. Se mantuvieron en bf16 los modulos mas sensibles a la precision: embed_tokens, lm_head, linear_attn.conv1d, linear_attn.in_proj_a, linear_attn.in_proj_b y todas las normalizaciones. La cache KV no se cuantiza. El tokenizer, la plantilla de chat, la configuracion de generacion y el fichero decider_config.json (incluidas las temperaturas) son los ficheros originales del autor sin cambios, salvo los campos version y quantization.

## Capacidades

- Decision estructurada en una sola pasada (system one): dado un estado textual y un conjunto de preguntas tipadas, devuelve respuestas con tipo definido, sin cadena de razonamiento intermedia.
- Respuestas tipadas mediante el formato Jev de TypeSafe: tipos como choice (seleccion entre criterios predefinidos) y noul.
- Clasificacion de texto multi-tarea: el pipeline declarado en HuggingFace es text-classification.
- Salida calibrada: se publican valores de ECE (Expected Calibration Error) de 0,0385 in-task y 0,0815 held-out en la version FP8, lo que permite usar las probabilidades como señal de confianza.
- Enrutado y asignacion de categorias: el ejemplo oficial reparte una incidencia entre departamentos (billing, technical support, sales).
- Juicios de preferencia: la tarea helpsteer3_pref forma parte del conjunto de regresion evaluado.
- Razonamiento de sentido comun y comprension lectora: se miden tareas como strategyqa, piqa y arc.
- Servicio HTTP de alto rendimiento a traves de vLLM, con prefix caching para estados repetidos.
- No dispone de capacidades multimodales (vision o audio), de tool calling ni de agentes multi-paso segun la informacion disponible.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto de la incidencia como estado y devuelve la categoria de departamento mediante una pregunta de tipo choice. Su calibracion medida permite fijar umbrales de confianza y derivar a revision humana los casos dudosos.
- Decisiones de reembolso y facturacion: con una pregunta de tipo noul se puede resolver si un caso requiere accion de reembolso, un escenario que aparece literalmente en el ejemplo de uso del autor.
- Moderacion y clasificacion de contenido a gran escala: al resolver en una sola pasada y admitir lotes grandes (hasta 135.434 tokens por segundo en prefill con estados de 1.024 tokens), encaja en pipelines de clasificacion masiva donde no se necesita generacion libre.
- Etiquetado y anotacion de datasets: la combinacion de 95 tareas de regresion y salida tipada permite usarlo como anotador automatico con probabilidades calibradas para filtrar anotaciones de baja confianza.
- Evaluacion de preferencias en datos de RLHF: la tarea helpsteer3_pref del conjunto de regresion indica que puede emplearse para puntuar o clasificar preferencias entre respuestas generadas.
- Deduplicacion semantica y triaje de documentos largos: con estados de 32.768 tokens procesados en 343 ms, es viable clasificar documentos extensos sin troceado previo.
- Servicio multi-modelo en una sola GPU: con DECIDER_VLLM_GPU_MEMORY_UTILIZATION=0.05 el checkpoint alcanzo un pico de 6,7 GB bajo 32 peticiones concurrentes de 29.033 tokens, por lo que puede convivir con otros dos checkpoints decider en el mismo acelerador.
- Clasificacion interactiva con estados repetidos: gracias al prefix caching, un estado de 29.033 tokens ya visto se resuelve en 50 ms en lugar de 336 ms, lo que sirve para paneles donde el estado cambia poco y las preguntas varian.

## Benchmarks y rendimiento

Exactitud frente a los pesos bf16, ejecutando ambos modelos con vLLM 0.29.0 sobre las mismas filas (conjunto de regresion del autor: 95 tareas, 67 in-task y 28 held-out, 144.226 filas; y 231 elementos publicos de JevBench):

| Version | in-task acc / NLL / ECE (67 tareas) | held-out acc / NLL / ECE (28 tareas) | JevBench easy / standard / hard |
|---|---|---|---|
| bf16 | 0,8016 / 0,4809 / 0,0383 | 0,7516 / 0,6261 / 0,0829 | 48/48, 64/72, 63/111 |
| FP8 | 0,8013 / 0,4826 / 0,0385 | 0,7518 / 0,6255 / 0,0815 | 48/48, 64/72, 64/111 |

La variacion es de 0,0 puntos de exactitud in-task y 0,0 held-out; la NLL cambia en +0,0017 y -0,0006. Por tarea, la exactitud baja en 43, sube en 39 y se mantiene en 13. Los mayores descensos son strategyqa (-1,2 con 687 filas), helpsteer3_pref (-1,0 con 1.176 filas), piqa (-0,7 con 1.500 filas) y arc (-0,6 con 1.172 filas). Las diferencias de uno a tres elementos en los niveles de JevBench estan dentro del ruido de esos conjuntos (48, 72 y 111 elementos).

Rendimiento medido con vLLM 0.29.0 en una RTX PRO 6000 Blackwell Server Edition (96 GB), sin prefix caching, un token de salida por fila y estados aleatorios unicos. El throughput de prefill es el mejor sobre tamanos de lote de 1 a 64; la latencia corresponde a una peticion aislada:

| Longitud de estado | bf16 tokens/s | FP8 tokens/s | Latencia bf16 | Latencia FP8 |
|---|---|---|---|---|
| 1.024 | 95.360 | 135.434 (x1,42) | 18 ms | 16 ms |
| 8.192 | 90.099 | 126.514 (x1,40) | 94 ms | 68 ms |
| 32.768 | 75.234 | 99.415 (x1,32) | 448 ms | 343 ms |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible, ya que el modelo es un decisor y no un generador de texto generalista. Tampoco se han re-medido en esta cuantizacion los numeros de OpenJev, Mind2Web, browser, game y Bespoke de la model card bf16.

## Requisitos de hardware

- Peso de los parametros: 2,39 GB en FP8 frente a 3,77 GB en bf16; el repositorio completo ocupa 2,4 GB.
- VRAM estimada: ademas de los pesos hay que sumar la cache KV (no cuantizada) y el estado de las capas de atencion lineal. Con 32 peticiones concurrentes de 29.033 tokens el pico medido fue de 6,7 GB en total.
- GPU consumer: cabe con holgura en tarjetas de 8 GB o mas, aunque el pico medido incluye concurrencia alta; para lotes grandes o estados muy largos conviene partir de 12-16 GB.
- GPU probada: unicamente RTX PRO 6000 Blackwell Server Edition (96 GB, SM120). No hay mediciones publicadas en A100, H100, RTX 4090 ni otras tarjetas.
- Opciones de despliegue: vLLM 0.29.0 es el unico motor verificado, mediante el paquete decider-ai[serve]==1.6.0 y el endpoint POST /v1/systemone. No se ha probado con TensorRT-LLM ni con SGLang. No hay evidencia de soporte en llama.cpp, Ollama o TGI.
- Nota de instalacion: vLLM compila kernels en el primer arranque y requiere ninja instalado.
- Latencia medida: 16 ms para estados de 1.024 tokens, 68 ms para 8.192 y 343 ms para 32.768. Con prefix caching, un estado de 29.033 tokens pasa de 336 ms en frio a 50 ms en caliente.
- Throughput de prefill medido: hasta 135.434 tokens/s en FP8 con estados de 1.024 tokens, entre un 32 y un 42 por ciento superior a la version bf16 segun la longitud del estado.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables de terceros en la informacion disponible. La unica comparacion documentada es interna, entre esta cuantizacion y el checkpoint del que deriva. La model card menciona ademas la existencia de una receta NVFP4 del mismo autor, de la que se reutiliza la lista de modulos que permanecen en bf16, pero sin cifras publicadas en esta ficha.

| Modelo | Parametros | Contexto | Exactitud in-task / held-out | Licencia | Formato |
|---|---|---|---|---|---|
| llmtech/decider-2b-fp8 | 1,88 mil millones | no disponible (medido hasta 32.768 tokens) | 0,8013 / 0,7518 | apache-2.0 | safetensors FP8 |
| Mapika/decider-2b (bf16, base) | 1,88 mil millones | no disponible (medido hasta 32.768 tokens) | 0,8016 / 0,7516 | apache-2.0 | safetensors bf16 |
| Otros modelos de decision de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todo lo indicado en la model card del checkpoint bf16 sigue aplicando a esta cuantizacion, incluidos sus sesgos y limitaciones.
- El cambio de exactitud frente a bf16 esta dentro de 0,1 puntos en ambas mitades del conjunto de regresion, pero existe: la NLL in-task empeora 0,0017.
- Solo se han vuelto a medir el conjunto de regresion y los elementos publicos de JevBench. Los numeros de OpenJev, Mind2Web, browser, game y Bespoke de la model card bf16 no se han verificado en FP8.
- Las mediciones se han hecho exclusivamente con vLLM 0.29.0 sobre RTX PRO 6000 Blackwell (SM120). No hay validacion en TensorRT-LLM, SGLang ni en otras arquitecturas de GPU, por lo que el comportamiento en A100, H100 o tarjetas consumer no esta garantizado.
- Modelo unicamente en ingles: no se declara soporte de otros idiomas.
- Es un modelo decisor, no un generador de texto conversacional; no debe esperarse de el redaccion libre, resumen o dialogo abierto.
- La licencia es Apache 2.0 tanto en el modelo base como en esta cuantizacion, por lo que el uso comercial esta permitido, pero conviene verificar las condiciones de los datos de entrenamiento en la documentacion del autor original.
- El repositorio tiene un volumen de descargas muy bajo (11 descargas, 1 like en el momento de la consulta) y ha sido publicado recientemente, por lo que no cuenta aun con validacion independiente de terceros.
- La ausencia de datos de calibracion en el proceso de cuantizacion FP8_DYNAMIC implica que el comportamiento en dominios muy alejados del conjunto de regresion no esta caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llmtech/decider-2b-fp8
- Modelo base bf16: https://huggingface.co/Mapika/decider-2b
- Repositorio GitHub del autor original: https://github.com/Mapika/decider
- Sitio del cuantizador: https://llmtech.eu
