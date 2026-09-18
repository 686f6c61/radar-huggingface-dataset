# BeRestoral/DualEmbRoformer-slav

## Resumen

DualEmbRoformer-slav es un modelo de lenguaje enmascarado (masked language modeling) entrenado desde cero por el autor independiente BeRestoral (Maxim Eremeev) sobre textos en eslavo oriental antiguo y eslavo eclesiástico antiguo. No es un modelo generativo de propósito general: se trata de un codificador especializado en la restauracion de manuscritos historicos, es decir, en reconstruir caracteres perdidos y lagunas de longitud desconocida en inscripciones y copias medievales, ademas de clasificar la fecha aproximada y la region o dialecto de un texto dado.

Tecnicamente combina dos ideas: un torso tipo BERT con Rotary Position Embeddings (RoPE) y el esquema de doble embedding de DualEmbLM, que anade un canal de embeddings a nivel de palabra (vocabulario de 50.000 palabras) concatenado al embedding de caracter y proyectado de vuelta a la dimension oculta. La tokenizacion es puramente a nivel de caracter (1 caracter = 1 token), lo que permite una restauracion posicional precisa. El modelo tiene 83.677.565 parametros, hidden_size de 768, 10 capas y 8 cabezas de atencion.

Su relevancia es de nicho pero clara: el procesamiento de lenguas historicas eslavas es un campo con pocos recursos computacionales especificos, y este modelo aborda dos tareas (restauracion de lagunas y clasificacion de fecha/dialecto) con una unica arquitectura multi-cabeza, liberada bajo licencia Apache 2.0. El repositorio es pequeno (0,3 GB) y el modelo es ejecutable en hardware muy modesto, lo que facilita su adopcion en humanidades digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con RoPE y esquema de doble embedding (caracter + palabra) |
| Parametros totales | 83.677.565 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | orv (eslavo oriental antiguo / ruso antiguo), cu (eslavo eclesiastico antiguo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con codigo personalizado (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de encoder transformer de 10 capas, hidden_size 768 y 8 cabezas de atencion, con Rotary Position Embeddings en lugar de embeddings posicionales absolutos. La innovacion principal es la doble via de embedding: por un lado, tokenizacion a nivel de caracter (1 caracter = 1 token), que permite marcar y reconstruir posiciones exactas; por otro, un canal de embeddings a nivel de palabra procedente de un vocabulario de 50.000 palabras (herencia de DualEmbLM), que se concatena con el embedding de caracter y se proyecta de nuevo a la dimension oculta. Sobre el torso se montan cuatro cabezas de tarea: restauracion de caracteres (local, atada a `char_embeddings`), expansion de lagunas de longitud desconocida (local, binaria), clasificacion por bin de fecha (global, con pooling desde `[SOS]`) y clasificacion de region/dialecto (global, tambien con pooling desde `[SOS]`).

El entrenamiento se realizo desde cero sobre un corpus de fuentes historicas: NKRYA, UD Old East Slavic (RNC y rutheno), epigraphica, manuscritos de corteza de abedul (birchbark), TOROT, textos de la Casa Pushkin, la cronica de Sofia, byliny y la Biblia de Ostrog. Las fuentes byliny y la Biblia de Ostrog no llevan etiqueta de fecha ni de dialecto, por lo que se excluyeron de esas dos perdidas para no sesgar los clasificadores hacia un unico ano o dialecto, y se usaron solo como texto para la tarea de restauracion. La estrategia de enmascaramiento combina una tasa de mascara de caracteres variable por documento, spans no compresivos, una laguna comprimida de longitud desconocida y bordes rasgados simulados. Ademas, la perdida de divergencia KL de fecha se repondera por bin ("balanced") para contrarrestar el desbalanceo de clases, ya que con un promedio plano por ejemplo las clases raras quedaban sin gradiente suficiente y se penalizaba la macro-F1. No se documenta uso de RLHF ni de DPO, lo cual es coherente con un modelo de tipo encoder y no generativo.

## Capacidades

- Relleno de mascaras (masked language modeling) a nivel de caracter, orientado a la restauracion de letras perdidas en manuscritos.
- Restauracion de caracteres individuales con posicionamiento exacto, gracias a la tokenizacion 1 caracter = 1 token.
- Expansion de lagunas de longitud desconocida: el modelo estima cuantos caracteres faltan en un hueco marcado con el token especial `[#]`.
- Clasificacion de fecha por bins temporales (cabeza global con pooling desde `[SOS]`).
- Clasificacion de region o dialecto del texto (cabeza global con pooling desde `[SOS]`).
- Manejo de bordes rasgados simulados en soportes epigraficos (entrenado explicitamente para ello).
- Soporte de dos lenguas historicas: eslavo oriental antiguo y eslavo eclesiastico antiguo.
- No dispone de generacion de texto libre, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es un encoder de tareas, no un modelo conversacional.
- Capacidad multilingue limitada a las dos variedades historicas indicadas; no se documenta soporte de ruso moderno ni de otras lenguas.

## Casos de uso

- Restauracion de manuscritos en humanidades digitales: dado un texto con lagunas fisicas marcadas, el modelo propone los caracteres faltantes y estima la longitud de los huecos, lo que acelera la edicion critica frente a la transcripcion manual.
- Analisis de inscripciones de corteza de abedul (birchbark): estas piezas suelen estar fragmentadas y con bordes rasgados; el modelo fue entrenado con bordes rasgados simulados, por lo que es adecuado para reconstruir lecturas parciales.
- Datacion automatica de textos anonimos: la cabeza de clasificacion por bins de fecha permite asignar un intervalo temporal aproximado a un fragmento sin colofon.
- Atribucion dialectal o regional: la cabeza de region/dialecto ayuda a situar geograficamente una copia o un texto copiado sin indicacion de origen.
- Preprocesamiento para corpus historicos: usar los embeddings del encoder como representacion intermedia para tareas posteriores (lematizacion, busqueda semantica, agrupamiento de variantes ortograficas) en pipelines de linguistica historica.
- Apoyo a la edicion critica academica: generar candidatos de lectura que el filologo revisa, reduciendo el espacio de busqueda de variantes plausibles.
- Enriquecimiento de archivos digitales y catalogos: clasificar automaticamente lotes de documentos escaneados y transcritos por fecha y dialecto antes de la revision humana.
- Docencia e investigacion en eslavistica: experimentar con un modelo entrenado especificamente en las variedades orv y cu, sin depender de modelos modernos multilingues que no cubren estas lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de evaluacion (por ejemplo, exactitud de restauracion de caracteres, macro-F1 en bins de fecha o en clases de dialecto), ni comparaciones cuantitativas con otros sistemas. Tampoco se han encontrado resultados de benchmarks en los resultados de busqueda web, que en esta consulta devolvieron unicamente paginas de foros y comunidades no relacionadas con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 335 MB solo para pesos (83,7 M de parametros), mas activaciones y buffers; en la practica cabe holgadamente en cualquier GPU.
- VRAM estimada en fp16/bf16: aproximadamente 167 MB de pesos, mas el vocabulario de palabras (50.000 entradas) y las tablas de embeddings.
- En int8 la huella teorica de pesos baja a unos 84 MB, aunque no se distribuyen cuantizaciones oficiales.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o iGPU con suficiente memoria compartida.
- Puede ejecutarse en CPU sin dificultad dado el tamano del modelo; es una opcion valida para servidores de humanidades digitales sin GPU.
- Despliegue: la via documentada es `transformers` con `AutoConfig` y `AutoModel` y `trust_remote_code=True`, cargando `char_vocab.json`, `word_vocab.json`, `vocab_categories.tokenize_text` y `dualemb_collator.DualEmbRoformerCollator`.
- vLLM, llama.cpp, Ollama o TGI no estan soportados de forma nativa, ya que el modelo depende de codigo personalizado (`custom_code`) y de una logica de collator propia, y no es un modelo generativo.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni especificaciones de modelos alternativos de la misma categoria (encoders para lenguas eslavas historicas o para restauracion de textos epigraficos), por lo que no es posible establecer una comparacion cuantitativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- Modelo de nicho: solo cubre orv (eslavo oriental antiguo) y cu (eslavo eclesiastico antiguo); no debe esperarse un comportamiento correcto en ruso moderno ni en otras lenguas eslavas.
- No es un modelo generativo ni conversacional: no admite instrucciones en lenguaje natural, ni tool calling, ni razonamiento multi-paso.
- Riesgo de alucinacion en el sentido de que las restauraciones propuestas son hipotesis estadisticas; en un contexto filologico deben tratarse como candidatos a validar por un especialista, no como lecturas definitivas.
- Sesgo potencial en las cabezas de fecha y dialecto: el propio autor documenta desbalanceo de clases por bin temporal y la necesidad de reponderar la perdida; las predicciones en bins raros o dialectos poco representados pueden ser menos fiables.
- Las fuentes byliny y la Biblia de Ostrog no tienen etiqueta de fecha ni de dialecto, por lo que no contribuyen al entrenamiento de esas dos cabezas y su cobertura temporal o dialectal puede ser desigual.
- Requiere `trust_remote_code=True`: implica ejecutar codigo Python del repositorio del autor, con el consiguiente riesgo de seguridad si no se audita antes.
- La API de uso depende de ficheros auxiliares (`char_vocab.json`, `word_vocab.json`, `vocab_categories.py`, `dualemb_collator.py`) que deben cargarse correctamente; un desajuste de vocabulario invalida las predicciones.
- Longitud de contexto no documentada: no hay garantia sobre el comportamiento en documentos muy largos ni sobre como se trunca la entrada.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no obstante, el modelo en si no esta pensado para produccion comercial de texto.
- Metricas de calidad no publicadas: sin benchmarks no es posible estimar la tasa de acierto en restauracion ni en clasificacion antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeRestoral/DualEmbRoformer-slav
- Contacto del autor indicado en la model card: maxim.a.eremeev@gmail.com
- Paper, blog, repositorio o demo adicionales: no disponible (los resultados de busqueda web no devolvieron enlaces relacionados con el modelo)
