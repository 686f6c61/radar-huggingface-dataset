# cooler8/yejin-korean-8b-v3-sft-v2-nothink

## Resumen

Yejin Korean 8B v3 SFT v2 (no-think) es un modelo de lenguaje de tipo decoder-only afinado por instrucciones para coreano, publicado por el usuario cooler8 en HuggingFace. Segun los metadatos del repositorio, la arquitectura pertenece a la familia Qwen3, con 7.241.740.288 parametros totales almacenados en formato safetensors (el repositorio ocupa 14,5 GB, coherente con pesos en bfloat16). Se distribuye bajo licencia Apache 2.0 y declara un unico idioma soportado: coreano.

El modelo es, segun su propia model card, una variante de pesos identicos a cooler8/yejin-korean-8b-v3-sft-v2. La unica diferencia es la plantilla de chat: en esta version el bloque de razonamiento (`<think> </think>`) se rellena vacio por defecto, de modo que el modelo responde de forma directa sin emitir cadena de pensamiento. Pasando `enable_thinking=True` a `apply_chat_template` se recupera el comportamiento original con razonamiento explicito.

Su relevancia es acotada y muy especifica: cubre el nicho de asistentes conversacionales en coreano con un modo de respuesta directa (menor latencia y menor consumo de tokens de salida) y un modo de razonamiento conmutable en tiempo de inferencia. No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens vistos ni resultados de evaluacion, por lo que cualquier decision de adopcion deberia apoyarse en una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (segun tags del repositorio) |
| Parametros totales | 7.241.740.288 (7,24 mil millones) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible (la model card no la especifica) |
| Tipos de cuantizacion | No disponible oficialmente; pesos publicados en safetensors (bfloat16 segun el ejemplo de uso de la model card). No se listan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Tamano del repositorio | 14,5 GB |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura mas alla de la etiqueta `qwen3` y del hecho de que es un modelo de generacion de texto. Por el recuento de parametros y por la plantilla de chat (que usa tokens especiales `<|user|>`, `<|assistant|>` y `<|end|>`), se trata de un transformer decoder-only denso derivado de la familia Qwen3, con cabeza de lenguaje autorregresiva y soporte nativo de plantilla de chat con bloques de razonamiento. No se especifica si emplea atencion con RoPE, GQA ni ninguna variante concreta de atencion, ni si el contexto se ha extendido mediante tecnicas tipo YaRN.

Respecto al entrenamiento, la model card no aporta numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o preferencias. Solo indica que se trata de un ajuste supervisado (SFT) en su version v2 y que los pesos son los mismos que los de la variante con pensamiento habilitado. La innovacion tecnica declarada es exclusivamente de plantilla: la prefijacion de un bloque `<think> </think>` vacio tras la etiqueta de asistente, lo que fuerza al modelo a emitir la respuesta directamente. No se documenta decodificacion especulativa, atencion lineal ni ninguna otra optimizacion de inferencia.

## Capacidades

- Generacion de texto en coreano con seguimiento de instrucciones (instruction following), entrenado especificamente para este idioma.
- Conversacion multi-turno mediante plantilla de chat con roles `user` y `assistant`.
- Modo de respuesta directa por defecto: el bloque de razonamiento se prellena vacio, de modo que no se generan tokens de cadena de pensamiento.
- Modo de razonamiento conmutable: `enable_thinking=True` en `apply_chat_template` restaura el comportamiento con bloque `<think>` explicito.
- No hay informacion publicada sobre soporte de tool calling o function calling.
- No hay informacion publicada sobre capacidades de agente o razonamiento multi-paso.
- Multilingue: no. El repositorio declara unicamente coreano como idioma soportado.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con clientes coreanohablantes usando la plantilla de chat nativa; el modo no-think reduce tokens de salida y, por tanto, coste por consulta en despliegues de alto volumen. La longitud de contexto real debe validarse antes de fijar el tamano de la ventana de historial.
- Clasificacion y enrutado de tickets de soporte: con instrucciones cerradas y modo no-think se obtienen respuestas cortas y deterministas en formato etiqueta, apropiadas para pipelines de triaje donde no se necesita razonamiento visible.
- Generacion de contenido editorial en coreano: redaccion de descripciones de producto, resumenes y textos de marketing, con la salvedad de que el modelo no debe usarse como fuente factual sin verificacion externa.
- Asistente conversacional embebido en producto: al pesar 7,24 mil millones de parametros, puede desplegarse en una unica GPU de 24 GB en bfloat16 o en GPUs de gama media con cuantizacion, lo que permite servirlo on-premise sin enviar datos de usuarios a terceros.
- Aumento de datos sinteticos en coreano: generacion de pares instruccion-respuesta para ampliar datasets de entrenamiento de modelos mas pequenos, con revision humana posterior para filtrar alucinaciones.
- Prototipado rapido de aplicaciones de recuperacion aumentada (RAG): integrado como generador final sobre un indice documental en coreano, usando el modo no-think para respuestas concisas y el modo con pensamiento cuando la pregunta requiera agregar varias fuentes.
- Investigacion sobre destilacion de cadenas de razonamiento: al disponer de dos variantes (con y sin pensamiento) sobre los mismos pesos, permite estudiar el efecto del bloque `<think>` en la calidad de respuesta sin cambiar de modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, KMMLU ni de ninguna otra evaluacion, y el repositorio no registra descargas ni valoraciones que permitan inferir un rendimiento observado por la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: en torno a 15-16 GB solo para pesos (14,5 GB de safetensors) mas la memoria de la cache KV, que depende de la longitud de contexto y del numero de secuencias concurrentes. Presupuesto realista: 18-24 GB con contexto moderado.
- VRAM estimada con cuantizacion: aproximadamente 7,5-8 GB en 8 bits (int8) y 4,5-5,5 GB en 4 bits, siempre que se genere una version cuantizada, ya que el repositorio solo publica safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para produccion con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para un unico flujo en bfloat16.
- Cabe en GPU de consumo: si en tarjetas de 24 GB (RTX 3090, 4090) en bfloat16, y en tarjetas de 8-12 GB si se emplea una cuantizacion de 4 bits generada por terceros.
- Opciones de despliegue: `transformers` (el ejemplo oficial de la model card usa `AutoModelForCausalLM` con `torch_dtype="bfloat16"` y `device_map="auto"`), y de forma adicional vLLM, SGLang o TGI para servido con batching continuo. llama.cpp y Ollama solo serian viables previa conversion a GGUF, que no esta publicada por el autor.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion sobre este modelo. Para un denso de ~7B en bfloat16 sobre una GPU de gama alta cabe esperar, como orden de magnitud general y no medido, decenas de tokens por segundo por secuencia, con mejora proporcional al usar batching continuo.
- Nota de despliegue: el ejemplo oficial elimina la clave `token_type_ids` de las entradas antes de generar; conviene replicar ese paso para evitar errores con determinadas versiones de transformers.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cooler8/yejin-korean-8b-v3-sft-v2-nothink | 7,24 mil millones | No disponible | Coreano | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-8B (modelo base de referencia de la familia) | ~8 mil millones | No disponible en esta ficha | Multilingue, con coreano entre los idiomas cubiertos | Apache 2.0 | HuggingFace, safetensors y GGUF |
| EXAONE-3.5-7.8B (LG AI Research) | ~7,8 mil millones | No disponible en esta ficha | Coreano e ingles | Licencia propia de EXAONE (no Apache 2.0) | HuggingFace |
| HyperCLOVAX-SEED-Text-8B (Naver) | ~8 mil millones | No disponible en esta ficha | Coreano e ingles | Licencia propia de Naver | HuggingFace |

La comparacion es necesariamente parcial: no hay datos publicos de rendimiento de este modelo frente a las alternativas, y las cifras de contexto y de evaluacion de los competidores deben consultarse en sus respectivas fichas. El principal diferencial de esta variante es la conmutacion del bloque de razonamiento sin cambiar de pesos.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento: no puede evaluarse la composicion del corpus ni el riesgo de contaminacion por benchmarks.
- Riesgo de alucinacion no medido y presumiblemente relevante, al tratarse de un ajuste SFT sin fases de alineacion documentadas (RLHF o DPO).
- Sesgos conocidos: no documentados. Al estar afinado exclusivamente en coreano, cabe esperar sesgos culturales y de representacion propios de ese corpus, pero no hay analisis publicado.
- Cobertura idiomatica limitada al coreano. El uso en castellano, ingles u otros idiomas no esta soportado ni evaluado, y previsiblemente degradara la calidad de forma acusada.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin medir antes el punto de degradacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. Conviene verificar que los pesos derivados de Qwen3 cumplen las condiciones de la licencia del modelo base, dado que el autor no detalla la procedencia exacta.
- Repositorio sin adopcion registrada: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- No hay versiones cuantizadas oficiales ni artefactos GGUF, por lo que el despliegue en entornos ligeros requiere conversion propia y su correspondiente validacion de calidad.
- Fechas de publicacion inusualmente futuras en los metadatos del repositorio, lo que sugiere que la ficha puede estar incompleta o generada de forma automatica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-sft-v2-nothink
- Variante con pensamiento habilitado (mismos pesos): https://huggingface.co/cooler8/yejin-korean-8b-v3-sft-v2
- Perfil del autor en HuggingFace: https://huggingface.co/cooler8
