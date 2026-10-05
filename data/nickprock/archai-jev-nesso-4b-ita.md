# nickprock/archai-jev-nesso-4b-ita

## Resumen

Archai JEV Nesso 4B Ita es un ajuste fino en italiano del modelo `mii-llm/nesso-4B` (4.022.468.096 parametros) desarrollado por el usuario nickprock bajo el identificador `nickprock/archai-jev-nesso-4b-ita`. Se presenta como un motor de decision "System One": un clasificador generativo que, en lugar de producir texto libre, emite una unica respuesta entre un conjunto cerrado de tokens objetivo (`A`, `B`, `C`, `D`, `TRUE`, `FALSE`). Está pensado para ejecucion determinista y de baja latencia en entornos de produccion y de borde (edge), no para generacion abierta.

El problema que aborda es el de las decisiones discretas de alta frecuencia en pipelines de IA: moderacion de contenido, enrutado de intenciones, logica booleana y analisis de sentimiento en italiano. El modelo busca una calibracion probabilistica fiable, de forma que la distribucion de logits refleje la confianza real de la prediccion; el autor reporta un Brier Score de 0,0908 y una exactitud de test del 93,69% sobre su suite multitarea.

Su relevancia actual viene de dos factores: el tamano (4B, desplegable en hardware de consumo con cuantizacion) y la publicacion de pesos en GGUF `Q8_0`, lo que permite inferencia en `llama.cpp` o `candle` desde C++ o Rust sin depender de stacks Python. La licencia Apache 2.0 facilita su integracion comercial, aunque el modelo solo esta entrenado y evaluado en italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `Q8_0`; adaptador QLoRA (r=16, alpha=32) |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (`Q8_0`) |
| Modelo base | `mii-llm/nesso-4B` |
| Tokens objetivo | `A`, `B`, `C`, `D`, `TRUE`, `FALSE` |
| Tamano del repositorio | 4,4 GB |
| Libreria | `peft` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de `mii-llm/nesso-4B`, un transformer decoder-only de tipo LlamaForCausalLM con 4B de parametros. Sobre esa base se aplica un ajuste fino con QLoRA de rango r=16 y alpha=32, es decir, se entrenan adaptadores de bajo rango sobre una base cuantizada, lo que reduce el coste de entrenamiento y produce un adaptador PEFT que despues puede fusionarse o servir junto al modelo base.

El entrenamiento se plantea como una tarea de clasificacion generativa de un solo token: el modelo recibe una entrada en italiano y debe devolver uno de los seis tokens objetivo. La suite de datos combina cuatro tareas: seguridad y moderacion (`Paul/hatecheck-italian` y `evalitahf/hatespeech_detection`), enrutado de intenciones y logica (`RiTA-nlp/ai2_arc_ita`, con ARC-Challenge y ARC-Easy), clasificacion de sentimiento (`evalitahf/sentiment_analysis`) e inferencia de lenguaje natural (`evalitahf/textual_entailment`). El autor reporta dos epocas de entrenamiento, con mejor perdida de validacion en la primera (0,1444 frente a 0,1903 en la segunda) y mejor exactitud de validacion en la segunda (96,17% frente a 95,17%), lo que sugiere cierto sobreajuste en la segunda epoca. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos figuran como no disponibles. La innovacion declarada no es arquitectonica, sino de calibracion: el objetivo explicito es que las probabilidades del token de decision sean interpretables como confianza.

## Capacidades

- Clasificacion de decision de un solo token sobre un vocabulario cerrado de seis etiquetas (`A`, `B`, `C`, `D`, `TRUE`, `FALSE`).
- Moderacion de contenido en italiano: deteccion de discurso de odio y contenido abusivo, entrenada con `Paul/hatecheck-italian` y `evalitahf/hatespeech_detection`.
- Enrutado de intenciones y razonamiento logico de opcion multiple en italiano, a partir de `RiTA-nlp/ai2_arc_ita` (ARC-Challenge y ARC-Easy).
- Analisis de sentimiento en italiano (`evalitahf/sentiment_analysis`).
- Inferencia de lenguaje natural y entailment textual (`evalitahf/textual_entailment`).
- Salidas probabilisticas calibradas: el autor reporta un Brier Score de 0,0908, lo que permite usar el logit como puntuacion de confianza y aplicar umbrales.
- Ejecucion de baja latencia en entornos edge mediante GGUF `Q8_0` y runtimes en C++/Rust (`llama.cpp`, `candle`).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el diseno es de decision unica, no de bucle agentico.
- Capacidades multilingues: no; el modelo esta entrenado y evaluado unicamente en italiano.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Moderacion de contenido en plataformas italianas: el modelo clasifica un texto como aceptable o no aceptable emitiendo `TRUE`/`FALSE`. Su tamano de 4B y su formato GGUF `Q8_0` permiten ejecutarlo en la propia infraestructura de la plataforma y filtrar comentarios en el momento de la publicacion, sin enviar el contenido a APIs externas.
- Enrutado de intenciones en asistentes conversacionales: dado un mensaje de usuario en italiano, el modelo devuelve `A`, `B`, `C` o `D` como etiqueta de intencion. Se colocaria como primera etapa del pipeline, antes de invocar el modelo generativo grande, reduciendo coste y latencia por peticion.
- Filtro de guardarrail sobre la salida de otro LLM: se evalua si una respuesta generada cumple una condicion booleana (`TRUE`/`FALSE`) antes de mostrarla al usuario. La calibracion reportada permite fijar umbrales de confianza y derivar a revision humana los casos dudosos.
- Analisis de sentimiento a escala en resenas y encuestas: procesamiento por lotes de textos italianos para etiquetar polaridad, con la ventaja de poder ejecutarse en CPU o GPU de gama media en un pipeline de C++/Rust.
- Verificacion de entailment en pipelines RAG: comprobar si un fragmento recuperado implica o no una afirmacion del usuario, para descartar contexto irrelevante antes de la generacion. Es un paso de filtrado binario donde el coste del modelo de 4B es aceptable.
- Clasificacion de opcion multiple en evaluacion educativa: dado un enunciado y varias alternativas en italiano, el modelo selecciona `A`/`B`/`C`/`D`. Aprovecha el entrenamiento sobre el corpus ARC traducido al italiano.
- Control de calidad y etiquetado semiautomatico de datasets italianos: uso del modelo como anotador previo de baja latencia, dejando la validacion final a anotadores humanos, con la puntuacion de confianza calibrada como criterio de priorizacion.
- Despliegue en dispositivos con recursos limitados: al existir pesos GGUF `Q8_0`, puede integrarse en aplicaciones de escritorio o servicios ligeros escritos en Rust o C++ sin runtime de Python.

## Benchmarks y rendimiento

Los unicos datos publicados son los que figuran en la model card. No se han publicado resultados sobre benchmarks estandar como MMLU o HumanEval para este modelo.

| Metrica | Epoca 1 | Epoca 2 | Conjunto de test final |
|---|---|---|---|
| Perdida de entrenamiento (Train Loss) | 0,2620 | 0,0628 | — |
| Perdida de validacion (Validation Loss) | 0,1444 | 0,1903 | — |
| Exactitud de validacion | 95,17% | 96,17% | — |
| Exactitud de test | — | — | 93,69% |
| Brier Score de test | — | — | 0,0908 |

No se proporcionan resultados desglosados por tarea (moderacion, enrutado, sentimiento, entailment), ni comparaciones con otros modelos bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones de calculo a partir del numero de parametros (4.022.468.096) y del formato; el autor no publica requisitos oficiales.

- Pesos en precision completa (FP16): aproximadamente 8 GB solo para los pesos, mas la cache KV, que depende de la longitud de contexto (no disponible).
- Pesos en GGUF `Q8_0`: aproximadamente 4,3 GB, en linea con el tamano del repositorio (4,4 GB), mas overhead de cache KV.
- Cuantizaciones adicionales (Q4_K_M, Q5_K_M) no estan publicadas por el autor, aunque son generables a partir del adaptador o de los pesos fusionados; en Q4 se situarian en el rango de 2,5 a 3 GB, estimacion no confirmada por el autor.
- GPU de datacenter: A100 40/80 GB, H100, L40S. En estos casos el modelo ocupa una fraccion minima de la memoria y el cuello de botella es el throughput por peticion, no la VRAM.
- GPU de gama profesional/consumo: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB), RTX 4070 Ti (12 GB) ejecutan el modelo en `Q8_0` con margen amplio.
- Cabe en GPU de consumo: si. En 8 GB de VRAM cabe la version `Q8_0` de forma ajustada y con contexto limitado; en 12 GB o mas cabe con holgura. En 6 GB conviene generar una cuantizacion inferior.
- CPU: el formato GGUF permite inferencia en CPU con `llama.cpp`, aunque la latencia depende del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: `llama.cpp` y `candle` de forma nativa para el GGUF; el adaptador PEFT puede servirse con la libreria `peft` sobre transformers, y de ahi exportarse a vLLM o TGI previa fusion del adaptador. Ollama es viable si se dispone de un GGUF compatible.
- Latencia y throughput estimados: no disponibles. El autor describe el modelo como de "baja latencia" pero no publica mediciones de tokens por segundo ni de tiempo por peticion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas evaluadas bajo el mismo protocolo. La comparacion estructural con el modelo base es la siguiente:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `nickprock/archai-jev-nesso-4b-ita` | 4.022.468.096 | no disponible | Apache 2.0 | safetensors (PEFT), GGUF `Q8_0` | Ajuste QLoRA para decision de un token, solo italiano |
| `mii-llm/nesso-4B` (base) | ~4B | no disponible | no disponible | no disponible | Modelo base de generacion; el autor no detalla su ficha en esta informacion |
| Otras alternativas de clasificacion en italiano | no disponible | no disponible | no disponible | no disponible | No hay datos comparables en la informacion proporcionada |

No se identifican en la informacion disponible modelos de clasificacion de un solo token, en italiano y de ~4B, con los que establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Modelo monolingue: solo italiano. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- Salida restringida a seis tokens (`A`, `B`, `C`, `D`, `TRUE`, `FALSE`). Usarlo para generacion de texto libre no es su proposito y producira resultados degenerados.
- Riesgo de alucinacion en el sentido de respuesta segura pero incorrecta: al forzar una decision discreta, el modelo siempre emite una etiqueta, incluso cuando la entrada es ambigua o esta fuera del dominio de entrenamiento. Es imprescindible usar la probabilidad calibrada y umbrales de abstención.
- Sobreajuste probable: la perdida de validacion empeora en la segunda epoca (0,1444 a 0,1903) mientras la de entrenamiento cae de 0,2620 a 0,0628.
- La exactitud de test del 93,69% es agregada sobre la suite multitarea; no se desglosa por tarea, por lo que el rendimiento en una tarea concreta (por ejemplo, discurso de odio en registro coloquial) puede ser sensiblemente inferior.
- Sesgos conocidos: no documentados por el autor. El entrenamiento sobre `hatecheck-italian` y datasets de moderacion puede heredar sesgos de anotacion de esas fuentes, pero no hay analisis publicado.
- Longitud de contexto no especificada: no es posible planificar el troceado de entradas largas sin medirla empiricamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base `mii-llm/nesso-4B`, que no figura en la informacion disponible y podria imponer condiciones adicionales sobre los pesos derivados.
- Trazabilidad limitada: el repositorio registra 0 descargas y 0 "likes", no hay paper asociado ni evaluacion independiente, y el modelo fue creado en octubre de 2026 segun los metadatos de HuggingFace.
- Para produccion se recomienda validar con un conjunto propio del dominio objetivo antes del despliegue, dado que la suite de evaluacion es generica y no cubre todos los registros del italiano real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nickprock/archai-jev-nesso-4b-ita
- Modelo base: https://huggingface.co/mii-llm/nesso-4B
- Dataset `Paul/hatecheck-italian`: https://huggingface.co/datasets/Paul/hatecheck-italian
- Dataset `evalitahf/hatespeech_detection`: https://huggingface.co/datasets/evalitahf/hatespeech_detection
- Dataset `RiTA-nlp/ai2_arc_ita`: https://huggingface.co/datasets/RiTA-nlp/ai2_arc_ita
- Dataset `evalitahf/sentiment_analysis`: https://huggingface.co/datasets/evalitahf/sentiment_analysis
- Dataset `evalitahf/textual_entailment`: https://huggingface.co/datasets/evalitahf/textual_entailment
- Paper tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
