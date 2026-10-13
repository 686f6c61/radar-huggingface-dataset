# hoja-solutions/humanizer-NVFP4

## Resumen

humanizer-NVFP4 es una versión cuantizada del modelo humanizer de jialinyyzz, un finetune de google/gemma-4-12B especializado en reescritura de texto (text-rewriting / humanization). La publica hoja-solutions y aplica el esquema NVFP4 en modo W4A4: tanto los pesos como las activaciones de entrada de todas las proyecciones del decodificador se almacenan en FP4 (E2M1) con una escala FP8 por grupo de 16 valores. El checkpoint ocupa 8,25 GB frente a los 23,9 GB de la versión bf16, con 11.959.730.224 parámetros totales.

El interés principal de esta build es el rendimiento en GPUs Blackwell, donde vLLM la ejecuta sobre los tensor cores nativos de FP4. En una RTX 5090 con vLLM 0.30.0 alcanza 134 tok/s en peticiones individuales y 1.930 tok/s con lotes de hasta 32 peticiones, frente a 59 tok/s y 501 tok/s de la versión bf16. El coste es una pérdida de fidelidad medible: el top-1 frente a bf16 baja al 90,05 % de media (inglés y chino) y la divergencia KL sube a 0,0427 / 0,0500.

La model card es explícita sobre el compromiso: la build hermana NVFP4A16 mantiene las activaciones en bf16, ocupa lo mismo, decodifica una petición individual a velocidad similar y se queda mucho más cerca de bf16 (94,77 % de top-1). Esta variante W4A4 está pensada para escenarios donde priman el throughput por lotes y la densidad de cómputo por encima de la fidelidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Gemma 4 (tag `gemma4_unified`); detalle de capas y atencion no disponible |
| Parametros totales | 11.959.730.224 (~12B), segun safetensors |
| Longitud de contexto | No disponible en la informacion; el ejemplo de despliegue de la model card usa `--max-model-len 8192` |
| Tipos de cuantizacion | NVFP4 W4A4: pesos y activaciones en FP4 (E2M1) con una escala FP8 por grupo de 16; GPTQ, block size 128, dampening 0.01 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (modelo base de terceros: finetune de google/gemma-4-12B) |
| Formato de pesos | safetensors con esquema `compressed-tensors` |
| Tamano del checkpoint | 8,25 GB (frente a 23,9 GB en bf16); repo de 8,3 GB |
| Modelo base | jialinyyzz/humanizer (relacion: quantized) |
| Libreria / runtime | transformers; probado con vLLM 0.30.0 |

## Arquitectura y entrenamiento

El modelo subyacente es un finetune de google/gemma-4-12B realizada por los autores de humanizer (jialinyyzz y el repositorio sgaofen/humanizer-local-model), entrenado para reescribir borradores de texto de modo que suenen menos artificiales. Los tags del repositorio (`gemma4_unified`, `image-text-to-text`) apuntan a una arquitectura multimodal con torre de visión y proyecciones de audio, aunque la cuantización deja esas proyecciones y los embeddings de tokens (atados a la capa de salida) en bf16. La model card indica que la build solo se ha probado con entrada de texto.

La cuantización se realizó con GPTQ sobre llm-compressor 0.14.0 (ordenación estática de activaciones, block size 128, dampening 0.01) y el esquema NVFP4 aplicado a las 328 proyecciones del decodificador. Las escalas de grupo de las activaciones se calculan en tiempo de ejecución bajo una escala global por tensor fijada a partir de los datos de calibración (384 secuencias, 365.486 tokens, extraídos de filas de entrenamiento de jialinyyzz/humanizer-data). El proceso completo tardó 8 minutos en una RTX 5090 con un pico de 20,9 GB de RSS. La model card atribuye la mayor parte de la pérdida de fidelidad a la cuantización de activaciones a 4 bits: simularla sobre pesos bf16 reproduce casi toda la deriva (KL de vocabulario completo 0,038 sobre 24 borradores), afecta a todos los tipos de proyección (atención 0,017, gate/up 0,014, down 0,009) y a todas las capas, con las últimas peor. La causa probable que apunta el autor son valores de los estados ocultos de Gemma 4 cercanos a 3.000 en la entrada de la primera capa, que comparten escala de grupo con otros 15 valores que acaban redondeados a cero.

## Capacidades

- Reescritura de texto (humanization): toma un borrador y produce una reescritura con estilo mas natural, en ingles y chino.
- Generacion de texto conversacional mediante `/v1/chat/completions`, con un borrador por mensaje y la plantilla `chat_template.jinja` incluida.
- Modo de completado de texto mediante `/v1/completions` usando el prompt de `prompt_format.json`.
- Muestreo configurado por defecto en `generation_config.json`: temperatura 1.0, top-p 0.95, top-k 0 (`top_k: 0` en lugar del 64 del modelo original) y sin cadenas de parada.
- Arquitectura multimodal declarada en los tags (`image-text-to-text`, `gemma4_unified`), con proyecciones de vision y audio conservadas en bf16; la build solo ha sido probada con entrada de texto.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles y chino segun los metadatos.

## Casos de uso

- Humanizacion por lotes de contenido generado por IA: el modelo reescribe borradores en ingles o chino; con batching de hasta 32 peticiones en una RTX 5090 alcanza 1.930 tok/s, lo que permite procesar volumenes altos de articulos o descripciones de producto en una sola GPU.
- Integracion en pipelines editoriales: sustituto cuantizado del modelo bf16 cuando la VRAM es limitada, ya que el checkpoint pasa de 23,9 GB a 8,25 GB, manteniendo el mismo prompt, plantilla de chat y parametros de muestreo.
- Preprocesado de textos para SEO o marketing: reescritura de borradores con temperatura 1.0 y top-p 0.95 para diversificar variantes de un mismo mensaje antes de publicarlas.
- Servicio de inferencia con vLLM en produccion: despliegue con `vllm serve hoja-solutions/humanizer-NVFP4` y `--limit-mm-per-prompt '{"image":0,"audio":0,"video":0}'` para forzar el modo texto y evitar el coste de las torres multimodales.
- Evaluacion comparativa de esquemas de cuantizacion: sirve como referencia W4A4 frente a NVFP4A16 y bf16 sobre el mismo conjunto de evaluacion (209 borradores en ingles y 102 en chino), util para decidir el compromiso entre throughput y fidelidad antes de escalar un despliegue.
- Reescritura de documentacion tecnica bilingue EN/ZH: el modelo cubre ambos idiomas con una caida de fidelidad similar (90,86 % y 89,25 % de top-1 frente a bf16), lo que permite un flujo unico para equipos con documentacion en las dos lenguas.
- Generacion de variantes controladas en herramientas de escritura asistida, siempre que el caso tolere una fidelidad del orden del 90 % de top-1 frente a bf16 y no exija precision numerica estricta.

## Benchmarks y rendimiento

Metricas de fidelidad frente a bf16 en vLLM 0.30.0 sobre el conjunto de evaluacion de los autores (209 borradores en ingles y 102 en chino, cada uno con su primera reescritura bf16; 187.551 posiciones puntuadas en ingles y 99.166 en chino):

| Build | Top-1 EN | Top-1 ZH | Media | KL EN | KL ZH |
|---|---|---|---|---|---|
| bf16 (segunda ejecucion en vLLM) | 99,20 % | 99,10 % | 99,15 % | 0,0000 | 0,0001 |
| NVFP4A16 | 95,03 % | 94,51 % | 94,77 % | 0,0120 | 0,0121 |
| NVFP4 W4A4 (esta build) | 90,86 % | 89,25 % | 90,05 % | 0,0427 | 0,0500 |

Comparativa de variantes W4A4 medidas con el mismo procedimiento:

| Variante | Top-1 | KL EN / ZH |
|---|---|---|
| W4A4, redondeo al mas cercano | 86,89 % | 0,0751 / 0,0950 |
| W4A4, escalas ponderadas por importancia (imatrix) | 88,25 % | 0,0598 / 0,0739 |
| W4A4, GPTQ (esta build) | 90,05 % | 0,0427 / 0,0500 |
| W4A4, GPTQ, activaciones de down_proj en bf16 | 90,70 % | 0,0367 / 0,0421 |
| W4A4, GPTQ, activaciones de atencion en bf16 | 91,96 % | 0,0275 / 0,0325 |
| W4A16, GPTQ con escalas imatrix | 94,30 % | 0,0146 / 0,0142 |
| W4A16, GPTQ (build NVFP4A16) | 94,77 % | 0,0120 / 0,0121 |

Throughput en RTX 5090 con vLLM 0.30.0, 311 borradores y unos 144.000 tokens generados:

| Build | Una peticion a la vez | 311 peticiones, hasta 32 simultaneas |
|---|---|---|
| bf16 | 59 tok/s | 501 tok/s |
| NVFP4A16 | 136 tok/s | 1.585 tok/s |
| NVFP4 W4A4 (esta build) | 134 tok/s | 1.930 tok/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- Pesos cuantizados: 8,25 GB en disco (frente a 23,9 GB en bf16). El repositorio completo ocupa 8,3 GB.
- VRAM de inferencia: no publicada por el autor. Estimacion a partir del tamano del checkpoint: en torno a 9-11 GB para pesos y overhead en FP4, mas la cache KV, que depende de la longitud de contexto y del numero de secuencias concurrentes. El pico documentado de 20,9 GB de RSS corresponde al proceso de calibracion y cuantizacion, no a la inferencia.
- GPU recomendadas: el unico hardware probado y reportado es una RTX 5090 con vLLM 0.30.0. Para aprovechar los tensor cores FP4 nativos se necesita una GPU Blackwell. En arquitecturas anteriores la build puede ejecutarse, pero sin la ventaja de los tensor cores FP4.
- GPU de consumo: si, cabe en GPUs de consumo con al menos 10-12 GB de VRAM para contexto corto, segun la estimacion anterior; el fabricante solo valida la RTX 5090.
- Opciones de despliegue: vLLM 0.30.0 es el runtime validado (`vllm serve hoja-solutions/humanizer-NVFP4 --served-model-name humanizer --max-model-len 8192 --limit-mm-per-prompt '{"image":0,"audio":0,"video":0}'`). Tambien es compatible con el ecosistema transformers y con `endpoints_compatible` segun los tags. No se mencionan pruebas con llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 134 tok/s en peticion individual y 1.930 tok/s con hasta 32 peticiones concurrentes en RTX 5090 (frente a 59 y 501 tok/s de bf16).
- Requisitos de cuantizacion (si se desea reproducir la build): llm-compressor 0.14.0, 8 minutos de ejecucion y 20,9 GB de RSS en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / esquema | Contexto | Top-1 vs. bf16 | Throughput (32 concurrentes, RTX 5090) | Licencia |
|---|---|---|---|---|---|---|
| hoja-solutions/humanizer-NVFP4 (esta build) | 11,96B | NVFP4 W4A4, safetensors | No disponible | 90,05 % (EN/ZH) | 1.930 tok/s | Apache-2.0 |
| hoja-solutions/humanizer-NVFP4A16 | 11,96B | NVFP4A16 (activaciones bf16), safetensors | No disponible | 94,77 % (EN/ZH) | 1.585 tok/s | Apache-2.0 |
| jialinyyzz/humanizer (bf16) | 11,96B | bf16, safetensors | No disponible | 99,15 % (EN/ZH) | 501 tok/s | Apache-2.0 |
| google/gemma-4-12B (modelo base del finetune) | no disponible | bf16 | no disponible | no aplica | no disponible | no disponible |

Referencia adicional aportada por el autor en su propia escala de evaluacion (llama.cpp, mismo conjunto, distintos tokens): un GGUF estandar de 3 bits `IQ3_M` ronda el 90 % de top-1, y su `Q4_K_M` con quantization-aware alcanza el 95,2 %. No se dispone de comparativas con otros modelos de reescritura de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Deriva de calidad medible: el top-1 frente a bf16 cae al 90,05 % de media y la KL sube a 0,0427 en ingles y 0,0500 en chino. La mayor parte de la perdida procede de las activaciones a 4 bits, no de los pesos.
- Perdida de precision numerica en la practica: en una reescritura de cada uno de los 311 borradores, esta build omitio un numero en 37 de las 102 reescrituras en chino, mientras que dos muestras bf16 omitieron uno en 28 y 31. En ingles el comportamiento quedo dentro del rango de bf16. El autor indica que muchas de esas omisiones son fechas escritas de otra forma, no hechos erroneos.
- No es una build de maxima fidelidad: para cargas que exijan maxima cercania a bf16, la model card recomienda explicitamente la build NVFP4A16.
- Anulacion del modo multimodal en el despliegue de referencia: el comando de ejemplo desactiva imagen, audio y video, y la build solo ha sido probada con entrada de texto pese a los tags multimodales.
- Validacion limitada de hardware y runtime: solo probado en RTX 5090 con vLLM 0.30.0. No hay datos de comportamiento en otras GPUs, versiones de vLLM ni en llama.cpp, Ollama o TGI.
- Idiomas: soporte declarado unicamente para ingles y chino; no hay datos de rendimiento en castellano ni en otros idiomas.
- Parametros de muestreo no estandar: temperatura 1.0, top-p 0.95, top-k desactivado y sin cadenas de parada. Usar los valores por defecto del modelo original (top-k 64) puede degradar los resultados.
- Procedencia del checkpoint: la model card declara licencia Apache-2.0, pero el modelo es un finetune de google/gemma-4-12B y los datos de calibracion provienen de jialinyyzz/humanizer-data, cuyo DATA.md lista las licencias de las fuentes y los terminos de los modelos que escribieron los borradores. Conviene verificar esas condiciones antes de un uso comercial.
- Riesgo de alucinacion, sesgos conocidos y limitaciones de contexto: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; toda la informacion procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoja-solutions/humanizer-NVFP4
- Build hermana con activaciones en bf16 (NVFP4A16): https://huggingface.co/hoja-solutions/humanizer-NVFP4A16
- Modelo base (bf16): https://huggingface.co/jialinyyzz/humanizer
- Modelo base del finetune (Google Gemma 4 12B): https://huggingface.co/google/gemma-4-12B
- Dataset de entrenamiento y calibracion: https://huggingface.co/datasets/jialinyyzz/humanizer-data
- Repositorio de los autores: https://github.com/sgaofen/humanizer-local-model
- Documentacion de datos (licencias de fuentes y terminos): https://github.com/sgaofen/humanizer-local-model/blob/main/docs/DATA.md
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
