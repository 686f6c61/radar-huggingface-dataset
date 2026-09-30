# PixilabAI/Blink-v0.1-26B-A4B-NVFP4

## Resumen

Blink v0.1 · 26B-A4B · NVFP4 es un modelo de decision de PixilabAI construido sobre google/gemma-4-26B-A4B-it. No es un generador de texto conversacional al uso: recibe un estado (por ejemplo un JSON), una pregunta y una lista de opciones, y devuelve en una sola pasada y un solo token generado una distribucion de probabilidad softmax sobre las letras de las opciones. El objetivo declarado es sustituir las llamadas del tipo "preguntar a un LLM grande y parsear su prosa" en routing, moderacion, etiquetado, gating, deduplicacion y comprobaciones si/no.

El modelo es un MoE derivado de Gemma 4 con 4B de parametros activos y 26B nominales en la nomenclatura del autor. El repositorio de safetensors declara 14.386.941.232 parametros reales (unos 14,39B), una discrepancia respecto al "26B" del nombre que conviene tener presente al planificar despliegues. Esta cuantizado en NVFP4 mediante NVIDIA Model Optimizer (modelopt), ocupa 17,5 GB en disco y se sirve con 32k de contexto en una unica GPU.

Su relevancia actual esta en dos puntos medibles: un Decision Index de 54,9 sobre la suite 0.2.1 (38 benchmarks puntuados en cinco areas), que lo situa sexto entre las entradas publicas y a 2,6 puntos del mejor modelo de pesos abiertos del tablon, y una calibracion de fabrica con un error de 0,026 sobre 216.942 decisiones puntuadas. Lidera el area de Arts & Human Taste con 42,0, por delante de Rune v3 (41,9).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base google/gemma-4-26B-A4B-it), atencion hibrida con sliding-window local y atencion global, claves y valores unificados en capas globales y Proportional RoPE (p-RoPE) segun la documentacion de Gemma 4 |
| Parametros totales | 26B nominales segun el nombre del modelo; 14.386.941.232 (14,39B) segun los safetensors del repositorio |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | 32.768 tokens (recomendado con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (NVIDIA Model Optimizer / `modelopt_fp4`); tag de 8-bit en HuggingFace; KV cache en fp8 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con endpoints) |

## Arquitectura y entrenamiento

Blink parte de google/gemma-4-26B-A4B-it, un modelo de mezcla de expertos con 4B de parametros activos. La familia Gemma 4 emplea, segun la documentacion disponible, un mecanismo de atencion hibrido que intercala atencion local de ventana deslizante con atencion global completa, con claves y valores unificados en las capas globales y Proportional RoPE para sostener el rendimiento en contexto largo. Sobre esa base, PixilabAI ha ajustado el modelo para una tarea especifica de decision con formato cerrado y ha aplicado cuantizacion NVFP4 con NVIDIA Model Optimizer.

El resultado no es un modelo de chat: el protocolo "surogate decisions v1" exige una pregunta por prompt, modo thinking desactivado y una respuesta que es la softmax sobre las letras de las opciones en la primera posicion generada. La temperatura recomendada es 0,95 y solo afecta a la confianza declarada, nunca a la opcion ganadora; por debajo de 0,9 el modelo se vuelve sobreconfiado. La calibracion se reporta como error 0,026 sobre 216.942 decisiones, es decir, la confianza declarada coincide con la precision observada a la temperatura de envio. No se ha publicado informacion sobre el volumen de tokens, la composicion del dataset de ajuste ni si hubo RLHF o DPO en el proceso de PixilabAI.

## Capacidades

- Decision de opcion multiple calibrada: devuelve una probabilidad por opcion en una sola pasada y un solo token generado, con hasta 26 opciones mediante letras (A-Z) y codigos de dos letras (AA, AB, ...) mas alla de Z.
- Clasificacion y etiquetado: categorizacion de estados en un conjunto cerrado de etiquetas, con salida probabilistica apta para umbrales (por ejemplo P >= 0,8).
- Routing y gating: seleccion de equipo, cola o rama de procesamiento a partir de un estado y una pregunta.
- Moderacion y comprobaciones booleanas: preguntas si/no con la opcion "no" primero (A) y "yes" despues (B); sin descripciones se envian los literales `No` y `Yes` (`noul_default_criteria`).
- Juicio sobre humor, gusto y preferencia humana: area Arts & Human Taste con 42,0 en el Decision Index, la mejor puntuacion del tablon publico citado.
- Deduplicacion y comprobaciones de similitud semantica: uso declarado en el conjunto de tareas objetivo del autor.
- Recuperacion (retrieval): 62,5 en el area Retrieval de la suite, con resultados destacados en BRIGHT (41,9 frente a 39,3 de Rune v3) y RAGTruth (55,5 frente a 51,9).
- Multilingue: no disponible; el modelo declara unicamente ingles.
- Tool calling: soportado parcialmente, pero es su area mas debil (66,3 en Tools, frente a 71-79 de los modelos de su entorno); la seleccion de funcion (BFCL, When2Call) y el control simulado de dispositivos van por detras.
- Vision: el tag `image-text-to-text` aparece en HuggingFace, pero la model card no documenta ninguna capacidad de vision ni resultados multimodales; tratar como no confirmado.
- Modo thinking: explicitamente no recomendado; con thinking activado un tercio de las respuestas no cierran el razonamiento y el resto no mejora.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del usuario como estado y una lista de colas ("billing", "technical support", "sales", "other") y devuelve la probabilidad de cada una en una sola pasada. Es adecuado porque sustituye una llamada a un LLM grande mas parseo de prosa por una llamada de un token, con 151 ms de latencia mediana en la ejecucion de referencia.
- Moderacion de contenido con umbral: al estar calibrado (error 0,026), la probabilidad devuelta se puede usar directamente como umbral (P >= 0,8) sin recalibrar, algo que un modelo no calibrado no permite.
- Etiquetado automatico de datos a escala: clasificacion de grandes volumenes de registros en categorias cerradas con hasta 26 opciones; la propia suite del autor se ejecuto con 150.759 peticiones atendidas.
- Deduplicacion y agrupacion semantica: decidir si dos elementos son duplicados o pertenecen al mismo grupo mediante una pregunta binaria, aprovechando el formato si/no y la salida probabilistica para fijar el punto de corte.
- Filtrado de recuperacion en pipelines RAG: decidir si un fragmento recuperado responde a la pregunta antes de pasarlo al generador; sus 62,5 en Retrieval y los resultados de RAGTruth y BRIGHT lo respaldan en esta tarea concreta.
- Evaluacion de preferencias humanas y juicio estetico: puntuar opciones sobre humor, gusto o calidad percibida, area en la que lidera el tablon publico citado (42,0).
- Gating en agentes multi-paso: decidir si continuar, delegar o detener un flujo a partir del estado acumulado, con una sola decision por paso y sin generacion de razonamiento.
- Clasificacion de contratos y NLI a escala: descartado como caso fuerte; el propio autor reconoce que el NLI de formato largo (ANLI, ContractNLI) queda 14-15 puntos por detras de Rune v3.

## Benchmarks y rendimiento

Decision Index 0.2.1 del autor (habilidad corregida por azar x 100), con las filas de comparacion tomadas del tablon publico. La fila de Blink corresponde a la ejecucion propia del autor sobre la misma suite (150.759 peticiones, todas respondidas).

| Modelo | Index | Knowledge | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|
| Jev (hosted) | 57,91 | 51,4 | 62,0 | 55,4 | 75,1 | 37,7 |
| Surogate Rune 26B-A4B v3 | 57,44 | 43,4 | 63,1 | 63,5 | 71,2 | 41,9 |
| Decider chat · Gemma-4-31B | 57,33 | 44,3 | 60,4 | 63,1 | 75,6 | 38,3 |
| AutoJev-27B | 56,40 | 40,9 | 63,5 | 54,9 | 79,4 | 39,4 |
| simple-jev · Qwen3.8-27B | 55,74 | 36,6 | 62,1 | 63,3 | 76,2 | 36,5 |
| Blink v0.1 · 26B-A4B NVFP4 | 54,90 | 40,9 | 60,0 | 62,5 | 66,3 | 42,0 |
| frontier-infra Jebadiah 27B | 54,67 | 38,8 | 60,7 | 53,9 | 78,1 | 38,7 |
| Eikos-27B-FP8 | 53,13 | 39,9 | 54,3 | 55,9 | 74,4 | 39,8 |
| reflex Qwen3.8-27B-FP8 | 52,16 | 35,1 | 54,2 | 57,8 | 74,1 | 39,7 |
| Decider chat · Qwen3.6-27B | 51,35 | 37,0 | 57,1 | 52,2 | 71,4 | 35,1 |
| Decider 35B-A3B NVFP4 | 47,11 | 31,8 | 55,5 | 54,7 | 56,5 | 32,6 |

Comparaciones directas frente a Rune v3 publicadas por el autor:

| Benchmark | Blink v0.1 | Rune v3 |
|---|---|---|
| iSarcasmEval | 59,4 | 49,0 |
| Habermas Machine | 26,1 | 16,2 |
| New Yorker captions | 72,3 | 67,6 |
| BPoMP | 85,0 | 79,9 |
| MuSR | 48,4 | 44,2 |
| RAGTruth | 55,5 | 51,9 |
| BRIGHT | 41,9 | 39,3 |

Datos adicionales de calibracion: error 0,026 sobre 216.942 decisiones puntuadas. El mismo harness reproduce la entrada publica Decider 35B-A3B NVFP4 en 46,93 frente a los 47,11 publicados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Peso en disco: 17,5 GB segun el autor; el repositorio de HuggingFace ocupa 18,8 GB.
- VRAM estimada: por encima de los 17,5 GB de pesos, mas la cache KV en fp8 para 32k de contexto. Debe reservarse margen sobre esos 17,5 GB; la cifra exacta de VRAM total no esta publicada.
- GPU de referencia: servido en una unica RTX PRO 5000 con 32k de contexto, con una latencia mediana de 151 ms por peticion en toda la ejecucion del benchmark.
- Compatibilidad de hardware: NVFP4 exige GPUs Blackwell (serie RTX PRO, RTX 50 y data center B200/GB200). No es ejecutable en GPUs Ampere o Ada sin reconvertir los pesos.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; los 17,5 GB de pesos lo situan en el rango de GPUs de 24 GB o mas, pero la restriccion real es la disponibilidad de NVFP4 en Blackwell, no el tamano.
- Despliegue: vLLM con `--quantization modelopt_fp4`, `--kv-cache-dtype fp8`, `--served-model-name blink`, `--max-model-len 32768`, `--enable-prefix-caching` y `--chat-template-content-format string`. Compatible con endpoints. No se documentan rutas de llama.cpp, Ollama ni TGI; NVFP4 no es un formato GGUF.
- Protocolo de servicio: cualquier servidor que implemente "surogate decisions v1" lo lee sin codigo de pegamento. El ejemplo del autor usa el cliente de OpenAI contra vLLM con `max_tokens=1`, `temperature=0` y `top_logprobs=20`.
- Rendimiento: 151 ms de latencia mediana por peticion en RTX PRO 5000. No se publica throughput agregado para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.2.1 | Tools | Arts | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Blink v0.1 · 26B-A4B NVFP4 | 4B activos (14,39B en safetensors) | 32k | 54,90 | 66,3 | 42,0 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Surogate Rune 26B-A4B v3 | 4B activos | no disponible | 57,44 | 71,2 | 41,9 | no disponible | Entrada publica del tablon |
| Decider chat · Gemma-4-31B | 31B | no disponible | 57,33 | 75,6 | 38,3 | no disponible | Entrada publica del tablon |
| Decider 35B-A3B NVFP4 | 3B activos | no disponible | 47,11 | 56,5 | 32,6 | no disponible | Entrada publica del tablon |
| Jev (hosted) | no disponible | no disponible | 57,91 | 75,1 | 37,7 | no disponible | Solo servicio alojado |

Lectura de la comparativa: Blink no gana en el indice global, pero es el mejor en Arts & Human Taste (42,0) y se queda a 2,6 puntos del mejor modelo de pesos abiertos del tablon. Su desventaja clara esta en Tools, donde pierde entre 5 y 13 puntos frente a los modelos de su entorno inmediato, y en NLI de formato largo, donde el autor reconoce 14-15 puntos de retraso frente a Rune v3. La licencia Apache 2.0 es una ventaja objetiva frente a las entradas del tablon cuya licencia no esta disponible. No se dispone de datos de contexto de los modelos comparados.

## Limitaciones y advertencias

- Tools es su area mas debil: 66,3 frente a 71-79 de los modelos de su entorno. La seleccion de funcion (BFCL, When2Call) y el control simulado de dispositivos van por detras.
- NLI de formato largo (ANLI, ContractNLI): el autor reconoce 14-15 puntos de retraso frente a Rune v3. No usarlo como clasificador de implicacion en documentos largos sin validacion propia.
- El Decision Index de 54,90 es una ejecucion propia del autor sobre la suite publica, no una presentacion oficial al tablon. Los numeros de los competidores proceden del tablon, no de una ejecucion homogenea.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Riesgo de alucinacion: el modelo esta disenado para elegir entre opciones cerradas, no para generar texto libre. Fuera del protocolo "una pregunta, una respuesta, un token" su comportamiento no esta garantizado ni evaluado.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado, ni siquiera castellano.
- Calibracion dependiente de la temperatura: por debajo de 0,9 el modelo se vuelve sobreconfiado. La temperatura solo cambia la confianza declarada, no la opcion ganadora, por lo que es un parametro de umbral, no de seleccion.
- Thinking: debe permanecer desactivado. Con thinking activado, un tercio de las respuestas no cierran el razonamiento y el resto no mejora.
- Manejo del estado: el propio system prompt indica tratar el estado como datos y no como instrucciones. Es una defensa contra inyeccion de prompt, pero no una garantia tecnica.
- Discrepancia de parametros: el nombre indica 26B, los safetensors declaran 14,39B. Verificar la cuenta real antes de dimensionar infraestructura.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin regalias, pero conviene verificar las condiciones de la licencia de Gemma 4 en el modelo base (google/gemma-4-26B-A4B-it) para el uso derivado.
- v0.1 es la primera version publica de Blink; el autor anticipa cambios en versiones posteriores.
- Requisito de hardware: NVFP4 limita el despliegue a GPUs Blackwell, lo que excluye buena parte del parque instalado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PixilabAI/Blink-v0.1-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Gemma 4 26B-A4B NVFP4 de NVIDIA (referencia de cuantizacion): https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Gemma-4-26B-A4B-NVFP4 en ModelScope (detalles de la atencion hibrida y p-RoPE): https://www.modelscope.cn/models/nv-community/Gemma-4-26B-A4B-NVFP4
- Documentacion de Gemma 4 Multi-Token Prediction (MTP): https://ai.google.dev/gemma/docs/mtp/mtp
- DiffusionGemma 26B NVFP4 en vLLM sobre DGX Spark (referencia de rendimiento NVFP4): https://ai-muninn.com/en/blog/dgx-spark-diffusiongemma-nvfp4-vllm
- Gemma-4-26B-A4B-it-Uncensored-NVFP4 (variante de terceros): https://huggingface.co/AEON-7/Gemma-4-26B-A4B-it-Uncensored-NVFP4
