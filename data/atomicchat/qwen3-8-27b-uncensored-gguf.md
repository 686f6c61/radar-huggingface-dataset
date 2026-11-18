# AtomicChat/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una distribucion cuantizada en formato GGUF del modelo Qwen3.8-27B de Alibaba Qwen, publicada por AtomicChat. El modelo base se ha modificado mediante una tecnica de "abliteration" (proyeccion fuera de la direccion de rechazo) para eliminar las respuestas de negativa ante instrucciones que el modelo original rechazaria, manteniendo el resto de capacidades intactas. La distribucion incluye la cabeza MTP (multi-token prediction) y el proyector de vision dentro de los ficheros GGUF, lo que permite decodificacion especulativa y entrada imagen-texto en llama.cpp.

El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones) y se distribuye en cuantizaciones que van desde IQ3_S (13,9 GB) hasta Q8_0 (28,9 GB). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El pipeline declarado es image-text-to-text, lo que confirma capacidades multimodales de entrada.

La relevancia actual radica en que ofrece una alternativa sin censura sobre una base Qwen3.8 reciente, con mediciones publicadas por fichero de cuantizacion: tasa de rechazo, sobre-rechazo (XSTest), MMLU, llamadas a herramientas, KLD respecto al original y aceptacion del borrador MTP. Esto permite evaluar el coste real de la edicion sobre cada nivel de compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8), con cabeza MTP y proyector de vision incluidos en el GGUF |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S |
| Idiomas soportados | no disponible (la model card verifica respuestas correctas en chino y aleman) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con imatrix |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de aproximadamente 27,3 mil millones de parametros. La distribucion de AtomicChat no reentrena el modelo: aplica una edicion de abliteration que proyecta fuera la direccion de rechazo, y despues cuantiza con matrices de importancia (imatrix) en los formatos AD propios. Los ficheros GGUF incluyen la cabeza MTP (multi-token prediction) para decodificacion especulativa y el proyector de vision, lo que habilita inferencia multimodal y aceleracion por borrador integrada en llama.cpp.

El autor declara que los layouts de tensores y la matriz de importancia son identicos a los de sus builds no editados de Qwen3.8-27B, de modo que la unica diferencia medible respecto a esos builds es la edicion de abliteration. No se proporcionan datos sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. La model card reporta KLD y coincidencia top-1 frente al original BF16 en texto neutral reservado, como medida de la distorsion introducida por cada cuantizacion.

## Capacidades

- Generacion de texto y razonamiento, con modo "thinking" activable y presupuesto de tokens configurable (la model card evalua con presupuesto de 3072 tokens y niveles low y xhigh).
- Entrada imagen-texto: el proyector de vision esta incluido en los GGUF, por lo que acepta imagenes ademas de texto.
- Llamadas a herramientas: 20/20 en la prueba de tool calls reportada para todos los ficheros.
- Razonamiento multi-paso mediante trazas de pensamiento, con modos de esfuerzo bajo y alto.
- Capacidades multilingues: la model card verifica que responde en el idioma de la peticion en chino y aleman (100% en la prueba).
- Decodificacion especulativa mediante la cabeza MTP incluida, con tasas de aceptacion del borrador del 71-72% y aceleracion de hasta x2,32 en generacion de tokens.
- Comportamiento sin censura: 0/81 rechazos en JailbreakBench y 0/250 en XSTest en todas las cuantizaciones editadas.

## Casos de uso

- Investigacion sobre alineacion y rechazo: permite estudiar como varia la tasa de rechazo y el sobre-rechazo segun la cuantizacion, con metricas publicadas por fichero (JailbreakBench, XSTest) que sirven de linea base reproducible.
- Despliegue local en estaciones de trabajo con GPU de consumo: el fichero AD-IQ3_S (13,9 GB) cabe en una GPU de 16 GB y el AD-Q4_K_M (17,1 GB) en una de 24 GB, manteniendo 81,2% y 83,0% en MMLU respectivamente.
- Asistentes conversacionales sin restricciones tematicas para escritura creativa y ficcion: la eliminacion de la direccion de rechazo evita negativas en generos como terror, drama o narrativa adulta, sin degradar el MMLU (83,6% en Q8_0 frente a 83,0% del original Q4_K_M).
- Procesamiento de documentos con imagenes: al incluir el proyector de vision, puede recibir capturas, diagramas o paginas escaneadas junto a instrucciones de texto en un mismo prompt.
- Pipelines de agentes con llamadas a herramientas: el 20/20 en tool calls y la decodificacion especulativa MTP (x1,92 en Q4_K_M) reducen la latencia en bucles de agente que encadenan varias invocaciones.
- Evaluacion comparativa de tecnicas de abliteration: la model card incluye comparacion directa contra otros builds sin censura (JonathanColetti, huihui-ai, HauhauCS) con KLD y MMLU medidos, util para seleccionar variante en funcion del equilibrio fidelidad/censura.
- Servicio multilingue en chino y aleman: la prueba de "mismo idioma" al 100% respalda su uso en atencion al cliente en esos idiomas sin que el modelo derive al ingles.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre cada fichero. MMLU sobre 500 preguntas; rechazos sobre JailbreakBench (81 prompts) y XSTest (250 prompts); KLD y top-1 frente al BF16 original en texto neutral reservado; aceptacion MTP como porcentaje y factor de aceleracion en generacion de tokens.

| Fichero | Tamano | KLD / top-1 | Rechaza JB | Rechaza xhigh | XSTest rechazado | Thinking atascado (xhigh) | MMLU (500) | Tools | Mismo idioma | MTP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original AD-Q4_K_M (sin editar) | 17,1 GB | 0,0113 / 95,6% | 75/81 | 29/30 | 15/250 | 2/30 | 83,0% | 20/20 | 100% | 71%, x1,89 |
| Original AD-IQ3_S (sin editar) | 13,8 GB | 0,0325 / 92,4% | 76/81 | 28/30 | 16/250 | 1/30 | 80,2% | 20/20 | 100% | 71%, x1,95 |
| Uncensored Q8_0 | 28,9 GB | 0,0034 / 97,5% | 0/81 | 0/30 | 0/250 | 1/30 | 83,6% | 20/20 | 100% | 72%, x2,32 |
| Uncensored AD-Q6_K | 24,9 GB | 0,0038 / 97,4% | 0/81 | 0/30 | 0/250 | 1/30 | 83,6% | 20/20 | 100% | 72%, x2,25 |
| Uncensored AD-Q5_K_M | 20,2 GB | 0,0068 / 96,4% | 0/81 | 0/30 | 0/250 | 1/30 | 83,2% | 20/20 | 100% | 72%, x2,02 |
| Uncensored AD-Q4_K_M | 17,1 GB | 0,0140 / 95,0% | 0/81 | 0/30 | 0/250 | 2/30 | 83,0% | 20/20 | 100% | 71%, x1,92 |
| Uncensored AD-IQ4_XS | 16,5 GB | 0,0149 / 94,8% | 0/81 | 0/30 | 0/250 | 1/30 | 83,0% | 20/20 | 100% | 72%, x1,94 |
| Uncensored AD-IQ3_S | 13,9 GB | 0,0350 / 92,0% | 0/81 | 0/30 | 0/250 | 1/30 | 81,2% | 20/20 | 100% | 72%, x1,96 |

Comparacion contra otros builds sin censura (mismo servidor, prompts y plantilla, decodificacion greedy, presupuesto de pensamiento 3072):

| Fichero | Tamano | Rechaza | XSTest rechazado | MMLU (500) | Mismo idioma ZH / DE | KLD / top-1 | MTP |
|---|---:|---:|---:|---:|---:|---:|---:|
| Original AD-Q4_K_M | 17,1 GB | 75/81 | 15/250 | 83,0% (p = 1,00) | 100% / 100% | 0,0113 / 95,6% | 71%, x1,89 |
| Uncensored AD-Q4_K_M (este repo) | 17,1 GB | 0/81 | 0/250 | 83,0% | 100% / 100% | 0,0140 / 95,0% | 71%, x1,92 |
| JonathanColetti Uncensored Q4_K_M | 16,8 GB | 0/81 | 1/250 | 82,8% (p = 1,00) | 100% / 100% | 0,0218 / 93,8% | 71%, x1,88 |
| Huihui abliterated Q4_K | 16,8 GB | 0/81 | 2/250 | 82,2% (p = 0,50) | 100% / 100% | 0,0263 / 93,3% | 71%, x1,93 |

El valor p corresponde a la prueba de McNemar contra el fichero AD-Q4_K_M de este repositorio en las mismas 500 preguntas. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun fichero: IQ3_S 13,9 GB; IQ4_XS 16,5 GB; Q4_K_M 17,1 GB; Q5_K_M 20,2 GB; Q6_K 24,9 GB; Q8_0 28,9 GB. Hay que anadir margen para contexto y cache KV.
- Clase de GPU indicada por el autor: 16 GB para IQ3_S, 24 GB para Q4_K_M e IQ4_XS, 32 GB para Q5_K_M y Q6_K, 48 GB o Mac unificado para Q8_0.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o IQ4_XS; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con IQ3_S. El Q8_0 requiere una RTX 5090 de 32 GB no basta segun la tabla del autor, que pide 48 GB o Mac.
- Despliegue: llama.cpp, con soporte de la cabeza MTP incluida para decodificacion especulativa. La model card menciona integracion en Atomic Chat con toggles de pensamiento. No se confirma soporte explicito de vLLM, TGI u Ollama en la informacion disponible.
- Rendimiento: factor de aceleracion MTP de x1,89 a x2,32 en generacion de tokens segun fichero. No se publican valores absolutos de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos JB | XSTest | MMLU (500) | KLD / top-1 | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| Qwen3.8-27B-Uncensored (este repo, AD-Q4_K_M) | 27,3 B | no disponible | 0/81 | 0/250 | 83,0% | 0,0140 / 95,0% | Apache 2.0 |
| Qwen3.8-27B original (AD-Q4_K_M) | 27,3 B | no disponible | 75/81 | 15/250 | 83,0% | 0,0113 / 95,6% | Apache 2.0 |
| JonathanColetti Qwen3.8-27B-Uncensored (Q4_K_M) | 27,3 B | no disponible | 0/81 | 1/250 | 82,8% | 0,0218 / 93,8% | no disponible |
| Huihui-Qwen3.8-27B-abliterated (Q4_K) | 27,3 B | no disponible | 0/81 | 2/250 | 82,2% | 0,0263 / 93,3% | no disponible |

El build de AtomicChat presenta menor KLD (0,0140) y mayor coincidencia top-1 (95,0%) que las alternativas sin censura comparadas, con la misma tasa de rechazo nula y sin sobre-rechazo en XSTest. La diferencia en MMLU respecto a JonathanColetti y Huihui no es estadisticamente significativa segun los valores p reportados (1,00 y 0,50).

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo de forma global: el modelo respondera a practicamente cualquier instruccion, incluida la que el modelo base rechazaria por seguridad. No hay salvaguardas integradas y el filtrado debe hacerse en la capa de aplicacion.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el MMLU de 83,0-83,6% no mide calibracion ni veracidad factual.
- El "thinking" puede atascarse: la model card reporta 1/30 a 2/30 trazas que se repiten o no cierran tras 3072 tokens en el nivel xhigh. Requiere limites de tokens y deteccion de bucles en produccion.
- La cuantizacion introduce distorsion medible: el KLD sube de 0,0034 (Q8_0) a 0,0350 (IQ3_S) y la coincidencia top-1 baja de 97,5% a 92,0%. En IQ3_S el MMLU cae a 81,2% frente a 83,6% en Q8_0.
- No se especifican los idiomas soportados oficialmente; solo se verifica chino y aleman en la prueba de "mismo idioma". El rendimiento en otras lenguas, incluido el castellano, no esta documentado.
- La longitud de contexto no se publica en la informacion disponible; el margen de VRAM para contexto debe calcularse empiricamente.
- El repositorio ocupa 123,4 GB por incluir todas las cuantizaciones; la descarga selectiva de un solo fichero es imprescindible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado sin filtro recae en el desplegador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Qwen3.8-27B-Uncensored-GGUF
- Builds no editados de referencia: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build alternativo de JonathanColetti: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Build alternativo de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Guia de ejecucion local: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-locally
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
