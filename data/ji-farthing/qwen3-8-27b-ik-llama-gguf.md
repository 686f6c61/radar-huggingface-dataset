# ji-farthing/Qwen3.8-27B-ik-llama-GGUF

## Resumen

Qwen3.8-27B-ik-llama-GGUF es una conversión a formato GGUF del modelo Qwen3.8-27B de Alibaba, realizada por el usuario ji-farthing y publicada en HuggingFace. Esta conversión está específicamente orientada al runtime ik_llama.cpp, una bifurcación de llama.cpp mantenida por ikawrakow, e incluye dos cuantizaciones (IQ4_NL e IQ3_XXS) calibradas con una importance matrix diseñada para cargas de trabajo agénticas de codificación, en lugar del texto general típico. El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parámetros con ventana de contexto nativa de 262 000 tokens, razonamiento configurable y capacidades de visión, aunque esta conversión descarta la torre de visión y solo incluye la torre de texto.

La relevancia de esta versión radica en que incorpora el bloque NextN de predicción multi-token (MTP), lo que permite decodificación especulativa sin necesidad de un modelo borrador separado. El autor publica junto a los pesos la matriz de importancia utilizada, y documenta mediciones de rendimiento y perplexidad frente a la conversión BF16 de referencia. Es una opción interesante para quienes quieran ejecutar Qwen3.8-27B en hardware de consumo con cuantizaciones agresivas y buen rendimiento en tareas de agente, pero requiere usar ik_llama.cpp, ya que los archivos no son compatibles con llama.cpp estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 64 capas, con bloque NextN (MTP) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativa del modelo base; la conversión no la modifica) |
| Tipos de cuantizacion | IQ4_NL (14.65 GiB) e IQ3_XXS (10.12 GiB); el bloque MTP se mantiene en q5_K en el archivo IQ3_XXS |
| Idiomas soportados | Ingles y chino principalmente (segun el corpus de calibracion; el modelo base soporta mas idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (solo texto; sin torre de vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas y 27 mil millones de parametros, entrenado por Alibaba como un modelo vision-language con razonamiento configurable. La conversion GGUF aqui descrita elimina la torre de vision (1199 tensores en el indice fuente, 866 en el archivo GGUF), quedando solo la torre de texto. El archivo incluye el bloque NextN de prediccion multi-token, que permite decodificacion especulativa sin un modelo borrador externo.

La cuantizacion se realizo con `llama-quantize` de ik_llama.cpp en el commit `43afea46c`, utilizando una importance matrix calculada sobre 296 fragmentos de 512 tokens (151 552 tokens en total). El corpus de calibracion se compone de un 45% de ingles tecnico y agente, 30% de codigo, 15% de prosa general en ingles y 10% de prosa china. La calibracion cubre los 496 tensores de las 64 capas transformer, pero no el bloque MTP, que no se ejercita en una pasada hacia adelante normal. Por eso, en el archivo IQ3_XXS el bloque MTP se mantiene en q5_K para evitar una degradacion impredecible del rendimiento especulativo.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable (el parametro `reasoning_effort` admite valores como `xhigh`).
- Codificacion y comprension de codigo fuente, con soporte para tareas de modificacion y edicion de archivos en entornos agente.
- Llamada a herramientas (tool calling) y ejecucion de tareas multi-paso, validado con un harness local de tool-calling.
- Decodificacion especulativa integrada mediante el bloque NextN, sin necesidad de modelo borrador externo.
- Capacidad multilingue limitada a ingles y chino (segun el corpus de calibracion; el modelo base puede soportar mas idiomas).
- Sin capacidades de vision: la torre de vision no esta presente en estos archivos.

## Casos de uso

- Asistente de codificacion en local: el modelo puede generar, revisar y modificar codigo en proyectos reales, aprovechando su contexto de 262K tokens para mantener el estado completo de un repositorio en memoria. La cuantizacion IQ3_XXS cabe en 12 GB de VRAM, lo que permite ejecutarlo en una RTX 4070.
- Agente autonomo de desarrollo: con soporte de tool calling y razonamiento multi-paso, puede ejecutar tareas como leer codigo desconocido, decidir un cambio y editar archivos, como demuestra la validacion del autor con una tarea de modificacion de codigo puntuada deterministicamente.
- Servidor de inferencia con decodificacion especulativa: el bloque NextN permite acelerar la generacion sin un modelo borrador separado, util en despliegues con `llama-server` de ik_llama.cpp donde la latencia importa.
- Analisis de documentacion tecnica y transcripciones de sesiones de agente: el corpus de calibracion incluye documentacion de proyectos y transcripciones, lo que sugiere buen rendimiento en tareas de resumen y extraccion de informacion tecnica.
- Generacion de codigo en pipelines de CI/CD: al ser un modelo de texto puro con licencia Apache-2.0, puede integrarse en entornos de integracion continua para generar pruebas, documentacion o parches, siempre que el runtime sea ik_llama.cpp.
- Prototipado de aplicaciones conversacionales multilingue: aunque el foco es el ingles tecnico, el 10% de chino en la calibracion asegura que el modelo no degrade las activaciones chinas, permitiendo aplicaciones bilingues basicas.

## Benchmarks y rendimiento

El autor publica mediciones propias de validacion. No se incluyen benchmarks generales como MMLU o HumanEval en la informacion disponible, pero si se reporta el resultado del modelo base en SWE-bench Pro (61.7) segun la busqueda web.

| Metrica | IQ4_NL | IQ3_XXS | BF16 (referencia) |
|---|---|---|---|
| Perplexity en ingles (corpus hold-out) | 6.7153 (+0.6% vs BF16) | 7.1235 (+6.7% vs BF16) | 6.6738 |
| Perplexity en codigo (corpus hold-out) | 1.9970 (+1.1% vs BF16) | 2.0837 (+5.5% vs BF16) | 1.9750 |
| Velocidad efectiva en tarea agente (tok/s) | 6.89 | 10.32 | no disponible |
| Tasa de aceptacion especulativa | 0.917 | 0.910 | no disponible |
| Puntuacion en tarea de modificacion de codigo | 86/100 (completada) | 96/100 (completada) | no disponible |

Nota: las mediciones de velocidad y aceptacion se realizaron en una RTX 4070 con 12 GB de VRAM y 64 GB de RAM del sistema, usando ik_llama.cpp en el commit `43afea46c`. La tarea de modificacion de codigo se puntua deterministicamente sobre el estado del repositorio, sin un modelo como juez.

## Requisitos de hardware

- VRAM estimada: el archivo IQ3_XXS ocupa 10.12 GiB, por lo que cabe en GPUs de 12 GB (por ejemplo, RTX 4070, RTX 3060 12GB). El archivo IQ4_NL ocupa 14.65 GiB, requiriendo al menos 16 GB de VRAM o descarga parcial a RAM del sistema.
- GPU recomendadas: RTX 4070 (validada por el autor), RTX 4080/4090, A100/H100 para despliegues de mayor concurrencia. En GPUs con menos de 12 GB, el modelo no cabra completo en VRAM.
- Opciones de despliegue: exclusivamente ik_llama.cpp (por ejemplo, `llama-server` o `llama-cli`). No es compatible con llama.cpp estandar ni con Ollama, vLLM o TGI sin modificaciones, ya que el archivo IQ4_NL contiene tensores del tipo `IQ5_K`, especifico de ik_llama.
- Latencia y throughput: en la validacion del autor, con razonamiento activado y presupuesto ilimitado, se midieron 6.89 tok/s efectivos con IQ4_NL y 10.32 tok/s con IQ3_XXS en una RTX 4070, con tasas de aceptacion especulativa de 0.917 y 0.910 respectivamente.

## Comparativa con modelos similares

La comparacion mas directa es con el modelo base original y con otras conversiones GGUF estandar de Qwen3.8-27B. No se dispone de datos de otras cuantizaciones especificas para esta comparacion.

| Modelo | Parametros | Contexto | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | safetensors (BF16) | Apache-2.0 | Cualquier runtime compatible (transformers, vLLM, etc.) |
| Qwen3.8-27B-ik-llama-GGUF (este) | 27B | 262K | GGUF (IQ4_NL, IQ3_XXS) | Apache-2.0 | Solo ik_llama.cpp |
| Qwen3.8-27B-GGUF (estandar, de otros autores) | 27B | 262K | GGUF (Q4_K_M, Q5_K_M, etc.) | Apache-2.0 | llama.cpp, Ollama, LM Studio |

La ventaja de esta conversion frente a las GGUF estandar es la inclusion del bloque NextN y la calibracion orientada a tareas agente, lo que puede mejorar el rendimiento especulativo en ese tipo de cargas. La desventaja es la incompatibilidad con el ecosistema llama.cpp estandar.

## Limitaciones y advertencias

- Solo texto: la torre de vision del modelo base no esta incluida. No se pueden procesar imagenes ni video.
- Incompatibilidad con llama.cpp estandar: el archivo IQ4_NL contiene tensores `IQ5_K`, un tipo de cuantizacion exclusivo de ik_llama.cpp. El archivo IQ3_XXS usa solo tipos estandar, pero no se ha probado en llama.cpp upstream.
- Riesgo de alucinacion y sesgos: como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado. El corpus de calibracion esta sesgado hacia ingles tecnico y codigo, lo que puede afectar el rendimiento en otros dominios.
- Rendimiento variable en tareas agente: el autor indica que la suite de tareas muestra una alta varianza entre ejecuciones, por lo que las puntuaciones de 86/100 y 96/100 deben interpretarse como "ambas completaron" y no como un ranking fiable.
- Requiere ik_llama.cpp: para un uso correcto, hay que compilar o descargar ik_llama.cpp en el commit indicado o posterior. No se garantiza funcionamiento en versiones anteriores.
- Memoria del sistema: con contexto de 262K tokens, la memoria RAM del sistema puede ser un cuello de botella si la GPU no tiene suficiente VRAM. El autor uso 64 GB de RAM en su validacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ji-farthing/Qwen3.8-27B-ik-llama-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Articulo de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Guia de Yottalabs para ejecutar Qwen 3.8 27B localmente: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones y requisitos de hardware de Qwen 3.8 27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de Jetson AI Lab para Qwen3.8 27B: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
