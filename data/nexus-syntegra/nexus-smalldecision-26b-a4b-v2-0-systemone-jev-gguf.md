# nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev-GGUF

## Resumen

Nexus SmallDecision 26B A4B v2.0 SystemOne Jev (GGUF) es la distribucion cuantizada en formato GGUF de un modelo de decision de Nexus Syntegra, un proyecto independiente que no guarda relacion con el modelo Jev original ni con sus autores. No es un modelo conversacional: recibe un estado descrito en texto junto con preguntas tipadas sobre ese estado y devuelve, en un unico forward pass, una probabilidad para cada respuesta posible. No genera texto libre.

El modelo parte de una arquitectura Gemma 4 con mezcla de expertos (MoE), con 25.233.910.814 parametros totales y una designacion "A4B" que sugiere aproximadamente 4.000 millones de parametros activos por token, aunque ese dato no se detalla en la informacion disponible. La variante aqui descrita es la conversion a GGUF del checkpoint original, con cinco niveles de cuantizacion (BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) generados mediante llama.cpp.

Su relevancia es acotada y muy especifica: cubre el nicho de modelos "System One" que responden a preguntas de clasificacion y decision en un solo paso, sin cadena de razonamiento. La model card advierte explicitamente de que el codigo que construye los prompts y lee las respuestas en el token reservado `<ans>` no esta publicado, por lo que los ficheros solo resultan utiles a quien implemente esa capa por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE basado en Gemma 4 (mezcla de expertos con expertos enrutados y proyecciones densas) |
| Parametros totales | 25.233.910.814 |
| Parametros activos | aproximadamente 4.000 millones (designacion A4B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (sin importance matrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos derivado de Gemma 4. El checkpoint original almacena los expertos enrutados en formato NVFP4 (ModelOpt), que llama.cpp no puede convertir directamente; por ello, los autores deconvolucionaron los expertos a BF16, fusionaron las proyecciones gate y up de cada experto en un unico tensor y generaron un GGUF BF16 con el conversor estandar antes de cuantizar con `llama-quantize` (build 514, commit 57ace0d61). La fusion usa la escala del gate, igual que hace vLLM; en 6 de los 3.840 pares (capa, experto) las escalas de gate y up difieren hasta un 46,2 % en terminos relativos, y ese error lo arrastra tambien vLLM.

El entrenamiento se realizo en cuatro ejecuciones que sumaron 165.747 elementos contados una vez por ejecucion. El modelo es zero-shot salvo una excepcion: 30 de esos elementos son descripciones de funciones del paquete BFCL, sin casos de prueba ni respuestas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion principal es el modo de inferencia: la respuesta se lee en el token reservado `<ans>`, con un vocabulario de 262.417 entradas que incluye 273 tokens reservados anadidos, y el layout de release escribe el estado y la pregunta dos veces en el prompt.

## Capacidades

- Clasificacion y decision zero-shot: devuelve una distribucion de probabilidad sobre respuestas tipadas (si/no, etiquetas de sentimiento, categorias de intencion) en un solo forward pass.
- Razonamiento sobre estado en texto: interpreta una descripcion textual de estado y responde preguntas sobre ella.
- Sin generacion de texto: no produce lenguaje natural; la salida se limita a probabilidades sobre tokens de respuesta.
- Sin tool calling ni function calling: aunque el dataset de entrenamiento incluye 30 descripciones de funciones BFCL, no se documenta capacidad de invocar herramientas.
- Sin soporte de agentes ni razonamiento multi-paso: el diseno es explicitamente "System One", de un unico paso.
- Solo texto: los ficheros no incluyen proyector de vision.
- Multilingue limitado: unicamente ingles.

## Casos de uso

- Clasificacion de intencion en enrutadores de soporte: dado un estado textual de la conversacion, el modelo devuelve la probabilidad de cada categoria de intencion (por ejemplo, las 77 clases de Banking77) y permite derivar la consulta al flujo adecuado.
- Analisis de sentimiento en pipelines de monitorizacion: sobre resenas o mensajes (IMDB, SST-5), produce una distribucion sobre las etiquetas de polaridad que puede umbralizarse para alertas.
- Clasificacion de tickets y correos: con las categorias de CLINC150 o AG News, asigna probabilidad a cada clase y permite priorizar por confianza.
- Validacion de decisiones en sistemas de reglas: cuando un motor de reglas necesita una segunda opinion probabilistica sobre un estado descrito en texto, el modelo ofrece la distribucion sin generar explicaciones que luego haya que parsear.
- Filtrado previo en pipelines RAG: dado un estado y una pregunta binaria ("¿responde este documento a la consulta?"), devuelve la probabilidad de si/no en un unico paso, con menor coste que un modelo generativo.
- Investigacion en modelos de decision: sirve como referencia para estudiar cuantizacion en cabezas de clasificacion, ya que la model card publica KL medio, acuerdo top-1 y precision gold por cada nivel de cuantizacion.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad de la cuantizacion frente a vLLM sirviendo los pesos safetensors fusionados, sobre 650 peticiones (50 de cada una de 13 tareas publicas de clasificacion y sentimiento: Banking77, CLINC150, AG News, IMDB, SST-5 y otras). La fila Q8_0 procede de un conjunto distinto de 1.300 peticiones y no es estrictamente comparable.

| Fichero | Tamano | KL medio vs vLLM | Acuerdo top-1 | Precision gold |
|---|---|---|---|---|
| BF16.gguf | 50,5 GB | no medido | no medido | no medido |
| Q8_0.gguf | 26,9 GB | ~0,016 | 0,9815 | 0,8231 |
| Q6_K.gguf | 22,6 GB | 0,0240 | 0,9646 | 0,7877 |
| Q5_K_M.gguf | 19,1 GB | 0,0343 | 0,9585 | 0,7908 |
| Q4_K_M.gguf | 16,8 GB | 0,0673 | 0,9738 | 0,7938 |

Referencia: vLLM con el modelo sin cuantizar obtiene 0,7938 de precision gold sobre esas 650 peticiones. El acuerdo entre vLLM y el runtime de referencia propio de los autores, ambos con el modelo sin cuantizar, es de 0,9533, lo que indica que parte de la brecha procede del motor y no de la cuantizacion. Ningun fichero alcanza el umbral de 0,99 de acuerdo top-1 fijado por los autores. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 16,8 GB para Q4_K_M, 19,1 GB para Q5_K_M, 22,6 GB para Q6_K, 26,9 GB para Q8_0 y 50,5 GB para BF16.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 y Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M, Q5_K_M y Q6_K.
- Cabe en GPU de consumo: Q4_K_M (16,8 GB) y Q5_K_M (19,1 GB) entran en una RTX 4090 de 24 GB; Q6_K tambien, con menos margen para el contexto.
- Despliegue: llama.cpp (llama-server con `/completion` y `n_probs`), y por extension Ollama u otros frontends compatibles con GGUF. Los ficheros fijan `add_bos_token` a false, por lo que el prompt debe incluir su propio BOS.
- Latencia y throughput: no disponibles. La inferencia es de un unico forward pass sin generacion autoregresiva, lo que en principio reduce el coste frente a modelos generativos del mismo tamano, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nexus SmallDecision 26B A4B v2.0 (este) | 25,2 B totales / ~4 B activos | no disponible | Decision zero-shot, salida probabilistica en `<ans>` | Apache 2.0 | GGUF en Hugging Face; sin codigo de prompt |
| Jev (System One original) | no disponible | no disponible | Decision zero-shot | no disponible | Citado como comparacion en la model card |
| Modelos de clasificacion tipo encoder (BERT, DeBERTa) | 0,1-1,5 B | 512 tokens tipicos | Clasificacion supervisada por tarea | MIT / Apache 2.0 | Amplia, con ecosistema maduro |
| LLM generativos con salida JSON (p. ej. Llama, Qwen) | 7-70 B | 8k-128k | Generacion de texto con formato forzado | Licencias variables | Amplia |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. Frente a un encoder clasico, este modelo aporta decision zero-shot sobre tareas no vistas y salida probabilistica calibrada, a costa de un despliegue mucho mas pesado y de requerir una capa de prompt no publicada. Frente a un LLM generativo, evita la generacion autoregresiva y el parseo de JSON, pero no ofrece explicaciones ni capacidades conversacionales.

## Limitaciones y advertencias

- No es un modelo conversacional: un cargador GGUF generico no lo convierte en uno; la respuesta se lee en el token `<ans>` con un prompt construido segun el layout de entrenamiento (estado y pregunta escritos dos veces).
- El codigo que renderiza los prompts y lee las respuestas no esta publicado, lo que limita su uso practico a quienes reimplementen esa capa.
- Solo ingles; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion no aplicable en el sentido habitual (no genera texto), pero la salida es una distribucion de probabilidad que puede estar mal calibrada fuera de las tareas de entrenamiento.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre tareas de clasificacion publicas, puede heredar sus sesgos de etiquetado.
- Limitaciones de cuantizacion: ningun fichero alcanza el umbral de 0,99 de acuerdo top-1 con vLLM; los tensores `ffn_down_exps` y `ffn_down` no son multiplos de 256 columnas y caen a tipos con bloques mas pequenos (Q4_K a Q5_0, Q5_K a Q5_1, Q6_K a Q8_0) en 60 de los 658 tensores.
- El fichero BF16 lleva el nombre interno por defecto del conversor, por lo que algunas herramientas muestran un titulo incorrecto.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia del codigo de prompt y de documentacion de contexto hace arriesgado desplegarlo en produccion sin validacion propia.
- No afiliado a Jev: es un release independiente de Nexus Syntegra que no usa pesos, datos ni codigo de Jev.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev-GGUF
- Modelo base: https://huggingface.co/nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev
- Repositorio con importance matrix: https://huggingface.co/nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev-IMatrix-GGUF
- llama.cpp (build 514, commit 57ace0d61): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs o demos) para este modelo.
