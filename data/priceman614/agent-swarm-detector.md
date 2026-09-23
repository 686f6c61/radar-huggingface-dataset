# Priceman614/agent-swarm-detector

## Resumen

agent-swarm-detector es un clasificador de texto binario desarrollado por el usuario Priceman614, construido a partir de un fine-tuning completo de answerdotai/ModernBERT-large (395.833.346 parametros). Su unica funcion es leer un mensaje de un chat entre agentes y devolver P(blast), la probabilidad de que la plantilla de ese mensaje se haya publicado a escala masiva. No genera texto: es un cabezal de clasificacion de dos etiquetas (`organic` y `blast`) sobre un encoder transformer.

El problema que aborda es concreto: en plataformas de comunicacion agente-a-agente, los enjambres de bots publican invitaciones, recordatorios, registros y posts de reclutamiento con la misma plantilla y un nombre o un numero cambiado. Detectar ese patron en un solo mensaje, sin informacion de contexto ni de repeticion, permite filtrar antes de que el contenido llegue a un LLM o a un operador humano. El modelo se entrena con unos 261.123 mensajes de un concurso multiagente (technocore.chat, sonnet-2, 11-18 de septiembre de 2026) que se reducen a 15.834 textos distintos y 10.428 plantillas tras el scrubbing y el agrupamiento por near-duplicados.

Es relevante ahora porque el trafico agente-a-agente crece mas rapido que las herramientas de moderacion especificas para el, y porque demuestra un enfoque metodologico poco habitual: dividir el conjunto de evaluacion por plantilla (no por mensaje) para medir generalizacion real a plantillas no vistas, en lugar de premiar la memorizacion. Su limitacion principal es que la etiqueta es una heuristica de volumen (50 o mas publicaciones de la misma plantilla) que un unico mensaje no puede observar por completo, lo que acota el techo de rendimiento alcanzable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large), fine-tuning completo con cabezal de clasificacion de 2 clases |
| Parametros totales | 395.833.346 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens en la arquitectura base ModernBERT-large; el fine-tuning se realizo con max_length=256 |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; al ser safetensors fp32 se puede cuantizar con herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,6 GB de repositorio, compatible con transformers, text-embeddings-inference y endpoints compatibles) |

## Arquitectura y entrenamiento

La base es ModernBERT-large, un encoder transformer que sustituye la atencion completa por atencion alterna (global y local) y emplea embeddings rotatorios (RoPE) en lugar de embeddings posicionales absolutos, ademas de atencion con Flash Attention y eliminacion de sesgos en las capas lineales. Sobre ese encoder se anade un cabezal de clasificacion de dos etiquetas. El fine-tuning es completo, no con adaptadores: 3 epocas, AdamW, learning rate 2e-5, scheduler lineal con 6 por ciento de warmup, batch de 32, longitud maxima de 256 tokens, autocast en bf16 y entropia cruzada ponderada por clase. El checkpoint se selecciono por average precision en validacion (epoca 2) y el entrenamiento se hizo en una unica NVIDIA GB10.

El proceso de etiquetado merece atencion porque define lo que el modelo aprende. Primero se aplico scrubbing a cada mensaje en lenguaje natural (DIDs, URLs, handles, hashes hexadecimales, identificadores alfanumericos y numeros sustituidos por placeholders), se colapso el espacio en blanco y se fusionaron duplicados exactos, quedando 15.834 textos distintos para 261.123 mensajes. Despues, los textos casi duplicados se agruparon en plantillas mediante clustering de enlace simple con similitud coseno de 3-5-gramas de caracteres TF-IDF con umbral 0,8, dando 10.428 plantillas. Un texto se etiqueta como `blast` cuando su plantilla completa se publico 50 veces o mas: 2.729 textos (17 por ciento) son `blast` y concentran el 93 por ciento de todos los mensajes. El split es 80/10/10 por plantilla mediante hash con semilla, de modo que ningun texto de test pertenece a una plantilla vista en entrenamiento. No se menciona RLHF ni DPO, y el dataset no se ha publicado.

## Capacidades

- Clasificacion binaria de un unico mensaje con salida probabilistica: devuelve P(blast) y P(organic) para textos en ingles.
- Deteccion de plantillas publicadas a escala: invitaciones, posts de reclutamiento, recordatorios, registros y promociones repetidas en chats agente-a-agente.
- Generalizacion a plantillas no vistas en entrenamiento, gracias al split por plantilla y a la agrupacion por near-duplicados.
- Resistencia parcial al cambio de identificadores: el modelo fue entrenado sobre texto con DIDs, URLs, handles, hashes y numeros normalizados, por lo que asume ese mismo scrubbing.
- Integracion como guardarrail previo a un LLM: al ser un encoder de 395M, el coste por mensaje es muy inferior al de un modelo generativo.
- No genera texto, no hace tool calling, no soporta agentes, no tiene modo de razonamiento explicito, no procesa vision ni audio y no es multilingue.

## Casos de uso

- Moderacion de chats agente-a-agente: el modelo puntua cada mensaje entrante y permite bloquear o marcar los que superan un umbral de P(blast) antes de que se propaguen por la red de agentes.
- Deteccion de enjambres de bots en plataformas A2A: agregando las puntuaciones por emisor se puede construir una reputacion que distinga agentes que difunden plantillas de los que mantienen conversaciones organicas.
- Filtrado previo en pipelines RAG o de atencion automatizada: descartar el ruido masivo antes de que los mensajes se indexen o se pasen a un LLM reduce tokens consumidos y contaminacion del contexto.
- Triaje para revision humana: en lugar de revisar todo el trafico, el equipo de confianza y seguridad ordena por P(blast) descendente y revisa solo la cola alta, con un umbral ajustado a su tolerancia a falsos positivos.
- Analisis forense de un incidente de spam: clasificando en lote el historico de mensajes de una plataforma se identifica que plantillas circularon, cuantas veces y desde que agentes, con el scrubbing aplicado previamente.
- Guardarrail en la puerta de entrada de una API de mensajeria: el clasificador se despliega como microservicio (transformers, text-embeddings-inference o un endpoint compatible) y devuelve la puntuacion en la misma peticion que acepta el mensaje.
- Investigacion sobre dinamicas multiagente: generar descriptores cuantitativos de campanas de spam y medir su evolucion temporal a partir de las puntuaciones, en lugar de inspeccionar manualmente conversaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (tarea: deteccion de blast con plantillas no vistas; metricas marcadas como no verificadas). El conjunto de test tiene 1.486 textos con 9,2 por ciento de `blast`.

| Metrica | Valor |
|---|---|
| ROC-AUC | 0,980 |
| Average precision | 0,733 |
| F1 @ 0,5 | 0,843 |

Comparativa publicada en la model card, con todas las filas evaluadas sobre las mismas filas de test (split por plantilla):

| Modelo | ROC-AUC | Average precision | F1 @0,5 | Brier (menor es mejor) | ROC-AUC ponderada por volumen |
|---|---|---|---|---|---|
| Prior de tipo de mensaje (CV agrupada, 5 folds) | 0,725 | 0,452 | 0,573 | no disponible | 0,772 |
| TF-IDF palabra 1-2 + caracter 3-5, regresion logistica | 0,970 | 0,617 | 0,802 | 0,041 | 0,930 |
| ModernBERT-base, 3 epocas | 0,954 | 0,502 | 0,477 | 0,066 | 0,862 |
| ModernBERT-large, este modelo (semilla 0) | 0,980 | 0,733 | 0,843 | 0,026 | 0,923 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni existe todavia una medida de dispersion entre semillas: el autor indica que las semillas 1 y 2 de la misma receta estaban en ejecucion en el momento de escribir la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos fp32 ocupan aproximadamente 1,58 GB (1,6 GB de repositorio). En fp16 o bf16 bajan a unos 0,8 GB. Con activaciones y overhead de runtime, un presupuesto practico de 2 GB de VRAM es suficiente para lotes pequenos a 256 tokens.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe sin problema en consumer: RTX 3060, RTX 4060, RTX 4090 y equivalentes. En el extremo alto, una A100 o H100 permitiria lotes muy grandes y maximizar throughput, aunque esta sobredimensionado para 395M de parametros.
- Inferencia en CPU: viable para cargas moderadas (mensajes de 256 tokens, batch pequeno), ya que el modelo es un encoder de 395M y no un modelo generativo.
- Opciones de despliegue: pipeline de transformers, text-embeddings-inference (etiqueta declarada en el repositorio), endpoints compatibles, vLLM o TGI para servir el modelo como clasificador. Tambien es posible exportarlo a ONNX o cuantizarlo a int8 para reducir latencia en CPU.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de throughput en la informacion proporcionada. El entrenamiento si esta documentado: se realizo en una unica NVIDIA GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROC-AUC (plantillas no vistas) | Average precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| agent-swarm-detector (ModernBERT-large) | 395,8 M | 8.192 nativo, entrenado a 256 | 0,980 | 0,733 | Apache 2.0 | HuggingFace, safetensors |
| ModernBERT-base, 3 epocas (misma receta) | 149 M | 8.192 nativo | 0,954 | 0,502 | Apache 2.0 (base) | Requiere reentrenamiento |
| TF-IDF palabra 1-2 + caracter 3-5, regresion logistica | No aplica | No aplica | 0,970 | 0,617 | No aplica | Baseline reproducible del autor |
| Prior de tipo de mensaje | No aplica | No aplica | 0,725 | 0,452 | No aplica | Baseline del autor |

No se dispone de comparaciones con otros detectores de spam o de bots de terceros: no hay datos publicados en la informacion proporcionada. La comparativa relevante es frente a baselines lexicos, y el resultado es matizado: la ganancia principal de este modelo sobre TF-IDF esta en las plantillas `blast` poco frecuentes (average precision 0,617 frente a 0,733), mientras que ponderando por volumen de mensajes el baseline TF-IDF es ligeramente superior (ROC-AUC 0,930 frente a 0,923).

## Limitaciones y advertencias

- La etiqueta es una heuristica de volumen, no un juicio de honestidad o intencion. Una invitacion dirigida a destinatarios seleccionados puede ser `organic` aunque sea promocional, y el umbral de 50 publicaciones es una linea con ruido de etiqueta en los textos cercanos a ella.
- Un unico mensaje no permite observar el volumen real de la plantilla: una invitacion dirigida y una difundida masivamente pueden leerse de forma casi identica. Esto limita el techo de cualquier modelo que clasifique mensajes aislados.
- Aporta poco en las plantillas de mayor volumen: ponderado por numero de mensajes esta a la par de TF-IDF (0,923 frente a 0,930). Su ventaja se concentra en plantillas `blast` mas raras.
- Falla en algunas plantillas grandes: la mayor plantilla retenida (una promocion amable de "Greetings fellow builder! Team ... invites you to review our classical sonnet", publicada 15.863 veces) obtiene 0,31, y su plantilla hermana ("Support ... in the votes room!", 10.526 copias, en validacion) obtiene 0,006. La promocion bien formada y sin jerga de reclutamiento puede puntuar como organica.
- Los mensajes cortos son debiles: reducir una plantilla `blast` a una sola frase baja la puntuacion hasta casi cero. La mayoria de los textos de entrenamiento tienen unos cientos de caracteres, asi que se espera baja recall en spam de una linea. Los mensajes de menos de 20 caracteres no formaron parte del entrenamiento.
- Es obligatorio aplicar el mismo scrubbing que en entrenamiento (DIDs, URLs, handles, hashes hexadecimales, identificadores alfanumericos y numeros). El modelo nunca vio un DID, URL, handle o hash en crudo y puntua peor con ellos. Si el mensaje es JSON, hay que pasar el campo de lenguaje natural (`text`, `message` o `note`), no el sobre completo.
- Una sola fuente: todos los datos proceden de un unico concurso de una semana (technocore.chat, sonnet-2, septiembre de 2026), mayoritariamente en ingles. Incluye el vocabulario de protocolo del evento (rosters, ballots, receipts) y el estilo de los agentes participantes. Se espera peor rendimiento en otras plataformas hasta que alguien lo valide.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Las probabilidades provienen de un entrenamiento con pesos de clase, por lo que estan calibradas para ese regimen; el umbral de decision debe elegirse segun el coste relativo de falsos positivos y falsos negativos, no asumir 0,5.
- Las metricas declaradas no estan verificadas (`verified: false`) y no existe todavia una estimacion de varianza entre semillas de entrenamiento.
- El dataset de entrenamiento no se ha publicado, lo que impide reproducir el fine-tuning o auditar la composicion de las etiquetas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni mantenimiento declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Priceman614/agent-swarm-detector
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Documentacion de la arquitectura ModernBERT: https://arxiv.org/abs/2412.13663
- Concurso de origen de los datos: technocore.chat (sonnet-2, 11-18 de septiembre de 2026), sin URL publica en la informacion disponible
