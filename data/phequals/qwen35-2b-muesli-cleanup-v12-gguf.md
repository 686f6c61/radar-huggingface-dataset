# phequals/qwen35-2b-muesli-cleanup-v12-gguf

\n\n; greedy; max 1024 new tokens; stop <|im_end|>.
- Context length: not stated. Base Qwen3.5-2B — unknown. I must not invent. Indicate "no disponible" — though Qwen3.5 is fictional-ish; I'll say no disponible en la informacion.

Benchmarks: WER table — I'll present as benchmark table comparing builds and previous 0.8B cleanup.

Comparison models: Qwen3.5-0.8B cleanup (Muesli previous), base Qwen/Qwen3.5-2B, maybe other cleanup models — no info; I'll compare against base Qwen3.5-2B and the 0.8B variant, marking data unavailable. Maybe also mention generic instruct models, keeping honest.

Hardware requirements:
- Q4_K_M 1.31 GB, Q8_0 2.08 GB; plus KV cache and runtime overhead. Llama.cpp with -ngl 99 on Apple Silicon unified memory. Estimate: Q4_K_M ~2 GB total; fits consumer GPU easily. VRAM estimates: I should be careful not to invent precise numbers — can give estimate based on file size plus context overhead; label as estimates.
- Deployment: llama.cpp, Ollama (can import GGUF), possibly LM Studio; vLLM supports GGUF experimentally — mark as "no verificado en la informacion".

Latency: measured on M5.

Language: English only.

Limitations: not a speech recognizer, English only, trained on synthetic data written by open models (distribution shift vs real dictation), no blind test on real dictation, prompt must match exactly, guard recommended, MTP layer included, llama.cpp build compatibility, potential to copy context, small model 1.94B — hallucination risk in rephrasing, weak on other languages, license apache-2.0 (base Qwen3.5-2B license presumably apache-2.0 as stated).

Benchmark table: WER per set.

Let me write. Titles only first word capitalized: "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

No emojis. Use "castellano de Espana".

Enlaces: HF URL, base model URL, llama.cpp repo commit? The commit is mentioned but URL not given; I can give https://github.com/ggml-org/llama.cpp — that's a reasonable general link, but rule says "todos los enlaces relevantes encontrados en la busqueda web". Web search results are irrelevant; I should state that no relevant results were found. I'll include HF y base model links, and note that la busqueda web no devolvio resultados relevantes.

Write it.## Resumen

`qwen35-2b-muesli-cleanup-v12-gguf` es un modelo especializado en la limpieza de transcripciones de dictado, desarrollado por el usuario `phequals` para Muesli, una aplicación de dictado para macOS. Recibe la salida cruda de un sistema de speech-to-text (opcionalmente acompañada de contexto de pantalla: aplicación enfocada, campo de documento, URL, texto seleccionado u OCR) y devuelve el texto corregido: arregla errores evidentes de reconocimiento, elimina muletillas, aplica autocorrecciones del tipo "no, espera" o "borra eso", formatea listas dictadas y adapta la puntuación al estilo de la aplicación de destino. Si el texto ya es correcto, lo devuelve sin cambios.

El modelo parte de `Qwen/Qwen3.5-2B` y se distribuye exclusivamente en formato GGUF para llama.cpp, con dos cuantizaciones (Q4_K_M y Q8_0). No es un modelo de propósito general: es un ajuste fino con LoRA de rango 16 sobre 155.081 pares de limpieza, pensado para ejecutarse en local con latencia inferior al segundo en hardware Apple Silicon.

Su relevancia es doble. Por un lado, ejemplifica el patrón de "modelo pequeño y ultraespecializado" que sustituye a un LLM grande en una tarea acotada con requisitos estrictos de latencia y privacidad (el dictado no sale del dispositivo). Por otro, documenta de forma inusualmente honesta sus métricas: WER contra una referencia, latencia medida, y una advertencia explícita de que los conjuntos de evaluación son sintéticos y no dictados reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B), ajuste fino con LoRA; conserva la capa MTP del modelo base |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el prompt de entrenamiento limita la salida a 1024 tokens nuevos y el bloque de contexto de pantalla a 1200 caracteres) |
| Tipos de cuantizacion | Q4_K_M (1,31 GB) y Q8_0 (2,08 GB); no se publican otras |
| Idiomas soportados | Ingles unicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); no se publican safetensors del ajuste |

## Arquitectura y entrenamiento

La base es Qwen3.5-2B, un transformer decoder-only de 1,94 mil millones de parametros. Sobre ella se aplico un LoRA de rango 16 con Unsloth, durante una sola epoca, calculando la perdida unicamente sobre la respuesta (no sobre el prompt), y posteriormente se fusionaron los adaptadores en los pesos base. El resultado se convirtio a GGUF con `convert_hf_to_gguf.py` de llama.cpp en el commit `7fe450e19`. El fichero conserva la capa MTP (multi-token prediction) integrada en Qwen3.5, copiada sin modificar porque el conversor de llama.cpp la requiere; la decodificacion normal la ignora, de modo que no aporta aceleracion en este artefacto.

Los datos de entrenamiento son 155.081 pares de limpieza (mezcla denominada `blend-v12`) que cubren correo electronico, chat, documentos, prompts para agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos. Aproximadamente el 20 % de las filas incluyen contexto de pantalla. Los pares fueron generados por modelos abiertos alojados en Fireworks y filtrados por un modelo juez; es decir, se trata de datos sinteticos, no de dictados reales de usuarios. El prompt de entrenamiento es muy estricto: un unico turno de usuario, sin mensaje de sistema separado (el prompt de sistema se concatena dentro del texto de usuario), decodificacion codiciosa, `max 1024` tokens nuevos y parada en `<|im_end|>`.

## Capacidades

- Limpieza de transcripciones en ingles: correccion de errores claros de reconocimiento, eliminacion de muletillas (`um`, `uh`, `like`) y aplicacion de autocorrecciones dictadas ("scratch that").
- Formateo de listas numeradas y con vinetas cuando el usuario las dicta explicitamente.
- Adaptacion de estilo de puntuacion segun la aplicacion de destino, inferida del bloque `<APP-CONTEXT>`.
- Uso de contexto de pantalla (aplicacion enfocada, campo de documento, URL, texto seleccionado, OCR) para resolver nombres propios, siglas y errores evidentes, sin copiarlo en la salida.
- Comportamiento conservador por diseno: si el texto ya es correcto, lo devuelve identico; el prompt prohibe parafrasear, reescribir, anadir o eliminar palabras con significado.
- No soporta tool calling, function calling, agentes multi-paso, vision ni audio. No es un reconocedor de voz: consume texto ya transcrito.
- No soporta otros idiomas distintos del ingles.

## Casos de uso

- Limpieza de dictado en macOS: integrado en Muesli, el modelo recibe la transcripcion cruda del motor de speech-to-text y devuelve el texto listo para pegar en la aplicacion activa, con una latencia mediana de 0,56 s en un Apple M5 con cuantizacion Q4_K_M.
- Correo electronico dictado: el bloque de contexto indica que la aplicacion enfocada es Mail, de modo que el modelo aplica puntuacion y formato adecuados al cuerpo de un correo y respeta nombres de destinatarios que el ASR haya transcrito mal.
- Redaccion en herramientas de chat (Slack, Teams, iMessage): limpieza de mensajes cortos con muletillas y autocorrecciones, manteniendo el registro informal y el fraseo original del hablante.
- Prompts para agentes de IA dictados por voz: el modelo preserva terminos tecnicos, siglas y estructuras de lista, un escenario cubierto explicitamente en el corpus de entrenamiento (`AI-agent prompts`).
- Dictado de codigo y fragmentos tecnicos: correccion de identificadores y simbolos mal reconocidos usando el contexto de pantalla (texto OCR del editor o texto seleccionado) como referencia.
- Hojas de calculo y presentaciones: formateo de listas de elementos dictados (filas, vinetas) y normalizacion de puntuacion en celdas o vinetas, sin reescribir el contenido.
- Busquedas dictadas en navegador: limpieza de una sola frase eliminando muletillas, sin anadir puntuacion final que rompa la consulta.
- Procesamiento por lotes de transcripciones ya existentes: al ser un GGUF de 1,31 GB puede ejecutarse en CPU o GPU modesta para limpiar ficheros de subtitulos o notas de reunion, aunque el modelo esta optimizado para peticiones cortas (~17 tokens de salida) y no para documentos largos.

## Benchmarks y rendimiento

El autor publica tasas de error de palabra (WER, en %, menor es mejor) contra la limpieza de referencia, en peticiones de una en una:

| Build | Screen-context held-out (400) | Plain dictation (512) | New categories A (309) | New categories B (284) |
|---|---|---|---|---|
| Q4_K_M | 8,37 | 1,09 | 2,51 | 2,32 |
| Q8_0 | 8,42 | 1,09 | 2,27 | 2,25 |
| Precision completa (referencia) | 8,89 | 1,10 | 2,38 | 2,24 |
| Limpieza previa de Muesli con Qwen3.5-0.8B (referencia) | 37,52 | 2,26 | no disponible | no disponible |

Rendimiento medido en un Apple M5 con llama.cpp (build 11146 de Homebrew, Metal, `-ngl 99`), ~550 tokens de prompt y ~17 tokens de salida (mediana de 60 prompts):

| Build | Mediana | p90 | Prefill | Decode |
|---|---|---|---|---|
| Q4_K_M | 0,56 s | 1,11 s | 1.822 tok/s | 68 tok/s |
| Q8_0 | 0,57 s | no disponible | 2.084 tok/s | 52 tok/s |

Advertencia del propio autor: los conjuntos de prueba estan separados del entrenamiento, pero fueron escritos por modelos abiertos (DeepSeek/GLM para el conjunto A, ember-1 para el B) y filtrados por un modelo juez. No son dictados reales de usuarios y no se ha ejecutado una prueba ciega sobre dictado real. El WER de ~8,4 % en el conjunto con contexto de pantalla es sensiblemente superior al del resto de conjuntos y sugiere que ese escenario sigue siendo el mas fragil.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 1,31 GB y el Q8_0 2,08 GB; a ello hay que sumar la cache KV y el overhead del runtime. Como referencia practica, Q4_K_M deberia caber holgadamente en cualquier GPU con 4 GB o mas y Q8_0 en 6 GB o mas (estimacion a partir del tamano del fichero, no medida por el autor).
- Cabe en GPU de consumo: si, practicamente en cualquier GPU dedicada moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) y en Apple Silicon con memoria unificada. La unica medicion publicada es en un Apple M5 con Metal.
- GPU de centro de datos (A100, H100): tecnicamente viable pero sobredimensionada para un modelo de 1,94 B; el cuello de botella en esta tarea es la latencia por peticion, no el throughput agregado.
- Opciones de despliegue: llama.cpp es el runtime de referencia (build 11146 probado con el conversor en el commit `7fe450e19`). Las builds antiguas de llama.cpp pueden no cargar GGUF de Qwen3.5. Ollama y LM Studio pueden importar GGUF, pero no estan verificados en la informacion disponible. vLLM/TGI no se mencionan.
- Throughput y latencia: 1.822 tok/s de prefill y 68 tok/s de decode con Q4_K_M en un M5; mediana de 0,56 s y p90 de 1,11 s por peticion completa. El prefill domina el coste porque el prompt (~550 tokens, con instrucciones y contexto de pantalla) es mucho mayor que la salida (~17 tokens).
- El modelo no aprovecha la capa MTP en decodificacion normal, por lo que no hay decodificacion especulativa efectiva en este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-2b-muesli-cleanup-v12 (este) | 1,94 B | no disponible | Limpieza de dictado en ingles, con contexto de pantalla | Apache 2.0 | GGUF en HuggingFace (Q4_K_M, Q8_0) |
| Limpieza previa de Muesli (Qwen3.5-0.8B) | ~0,8 B | no disponible | Limpieza de dictado en ingles | no disponible en la informacion | Uso interno de la aplicacion |
| Qwen/Qwen3.5-2B (base) | 1,94 B | no disponible | Modelo generativo de proposito general | Apache 2.0 | Pesos completos en HuggingFace |
| LLM general de 2-3 B con prompt de limpieza | 2-3 B | no disponible | Limpieza mediante instrucciones, sin ajuste | Segun modelo | Multiples |

La comparacion cuantitativa solo es posible frente a la version anterior de 0,8 B: el ajuste de 2 B reduce el WER del 37,52 % al 8,37 % en el conjunto con contexto de pantalla y del 2,26 % al 1,09 % en dictado plano. No hay datos publicados que comparen este modelo con alternativas de terceros en la misma tarea, ni mediciones del modelo base sin ajustar con un prompt equivalente.

## Limitaciones y advertencias

- Solo ingles. No procesa otros idiomas; el campo `language` del repositorio declara unicamente `en`.
- No es un reconocedor de voz. Necesita una transcripcion previa; no acepta audio.
- Entrenado exclusivamente con datos sinteticos generados por modelos abiertos y filtrados por un modelo juez. No se ha validado con dictados reales de usuarios, por lo que el rendimiento en produccion podria diferir del reportado.
- El prompt debe coincidir exactamente con el de entrenamiento: un unico turno de usuario, sin mensaje de sistema, plantilla ChatML con `<|im_start|>user ... <|im_end|>`, seguida de `<|im_start|>assistant` y un bloque `<think>` vacio. Usar un motor de plantillas de chat generico puede degradar la calidad.
- Decodificacion obligatoriamente codiciosa (temperatura 0 / `top_k=1`, sin penalizacion de repeticion). Cualquier muestreo introduce riesgo de reformulacion no deseada.
- Ambiguedad documentada en el contexto: el entrenamiento coloco el *nombre* del campo enfocado en "Document context". Las aplicaciones que envien el *contenido* del campo en esa linea pueden obtener resultados peores.
- Riesgo de copiar contexto de pantalla en la salida si el prompt no se respeta; el modelo esta instruido para no hacerlo, pero es un fallo plausible en un modelo de 1,94 B.
- Riesgo de paráfrasis o de anadir/eliminar palabras, precisamente lo que el prompt prohibe. El autor recomienda una salvaguarda en la aplicacion: si la salida esta vacia o supera 3 veces la longitud de la entrada, pegar la transcripcion cruda.
- Dependencia de la version de llama.cpp: el GGUF incluye la capa MTP del modelo base y requiere un runtime que soporte Qwen3.5; builds antiguas pueden fallar al cargar.
- El WER en escenarios con contexto de pantalla (~8,4 %) es varias veces superior al de dictado plano (~1,1 %), lo que limita su uso fiable en flujos que dependen fuertemente del OCR.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B y de la aplicacion Muesli si se redistribuye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phequals/qwen35-2b-muesli-cleanup-v12-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de llama.cpp (runtime requerido, commit de conversion `7fe450e19`): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos no guardan relacion con el contenido de esta ficha (subreddits de caracter adulto). No se dispone de paper, blog tecnico, demo ni repositorio adicional del autor.
