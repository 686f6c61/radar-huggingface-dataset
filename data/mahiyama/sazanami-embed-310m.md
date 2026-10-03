# mahiyama/Sazanami-Embed-310m

## Resumen

Sazanami-Embed-310m es un modelo de embeddings de frases en japones desarrollado por el usuario mahiyama, publicado bajo licencia MIT. Se trata de un bi-encoder denso (single-vector retrieval) construido a partir de `sbintuitions/modernbert-ja-310m`, un encoder ModernBERT preentrenado en japones mediante enmascaramiento de tokens. El modelo convierte consultas y documentos en un unico vector de 768 dimensiones y calcula la similitud mediante coseno, con prefijos especificos por rol (`検索クエリ: ` para consultas y `検索文書: ` para documentos).

Con 314.611.968 parametros (~315M) y una longitud de entrada maxima de 8.192 tokens (aunque el entrenamiento se realizo con 512), esta pensado para recuperacion de informacion en japones: busqueda semantica, RAG y sistemas de FAQ. Su interes principal es metodologico: forma parte de una familia de cuatro modelos entrenados con los mismos datos, la misma inicializacion y la misma funcion de perdida, variando unicamente el numero de vectores por documento (1 en este modelo, hasta 64 en MetaEmbed, hasta 32 en AGC y uno por token en ColBERT). Esto permite aislar el efecto del paradigma multi-vector frente al single-vector sin confundirlo con otras variables.

El modelo se publico el 3 de octubre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones en HuggingFace. No se han publicado resultados de benchmarks en la informacion disponible, por lo que la evaluacion cualitativa del autor se limita a describir la construccion del conjunto de entrenamiento y a indicar que el conjunto JaGovFaqs-22k se reservo integramente para evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Ja) con mean pooling; sin capa de proyeccion adicional |
| Parametros totales | 314.611.968 (~315M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (valor guardado en el modelo); entrenamiento realizado a 512 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | japones (ja) unicamente |
| Licencia | MIT (pesos del modelo y modelo base) |
| Formato de pesos | safetensors; libreria sentence-transformers (SentenceTransformer) |
| Dimension del embedding | 768 |
| Vectores por documento | 1 |
| Funcion de puntuacion | similitud coseno (con escala 20.0 en entrenamiento) |
| Prefijos | consulta: `検索クエリ: `; documento: `検索文書: ` |
| Tokenizador | SentencePiece (vocabulario de ModernBERT-Ja) |
| Precision de entrenamiento | bf16 (mixed precision) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo ModernBERT en su version japonesa de 310M parametros, sobre el que se anade unicamente mean pooling (incluyendo el token de prefijo) para obtener un vector unico por secuencia. No hay capa de proyeccion adicional, de modo que el espacio de embeddings es el espacio oculto del encoder. La puntuacion se realiza por similitud coseno, y el modelo guarda sus propios prompts de consulta y documento, de forma que no deben anadirse manualmente al texto. El modelo base solo habia recibido preentrenamiento de tipo masked language modeling, sin aprendizaje orientado a recuperacion.

El entrenamiento combino dos tipos de ejemplo. Por un lado, n-tuples con una consulta, un positivo y cinco negativos (379.029 ejemplos en total, sumando ambos formatos), y por otro, pairs con solo positivos. Las fuentes principales son `auto-wiki-qa` (100.000), `mqa-ja` (100.000), `mmarco-ja` (50.000), un corpus interno `civicqa-ja` (43.382 n-tuples mas 28.653 pairs) y varios conjuntos menores de ambito municipal y educativo japones (quiz-no-mori, quiz-works, amagasaki-qna, miracl-retrieval, mrtydi, anlp-meeting-retrieval y kosodate-faq-pairs-ja). La perdida para n-tuples suma dos terminos calculados sobre una unica matriz de scores: una perdida contrastiva con entropia cruzada sobre todos los documentos del batch (propios y ajenos) y una perdida de destilacion por divergencia KL contra la distribucion de scores del profesor, con temperatura 2.0. Para los pairs se aplica solo la perdida contrastiva con los documentos de otras filas del batch como negativos. La similitud coseno se multiplica por 20.0 antes de entrar en las perdidas.

Los hiperparametros son learning rate 2e-5, una sola epoca, batch efectivo por dispositivo de 64, warmup del 5% de los pasos, weight decay 0.01, gradient checkpointing activado, sampler NO_DUPLICATES y semilla 42. El entrenamiento completo requirio 5.923 pasos y aproximadamente 4 horas y 27 minutos en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), con un pico de memoria de GPU de 22,1 GB. La validacion se aislo cuidadosamente: se excluyeron de todas las etapas las filas cuyo texto coincidia (tras normalizacion NFKC y eliminacion de espacios) con preguntas o positivos del split de evaluacion de JaGovFaqs-22k, conjunto que no se uso en ningun momento para entrenar.

## Capacidades

- Generacion de representaciones densas de frases y parrafos en japones, con un unico vector de 768 dimensiones por texto.
- Recuperacion semantica (dense retrieval) mediante similitud coseno entre embeddings de consulta y de documento.
- Busqueda en pasajes largos: acepta hasta 8.192 tokens de entrada en inferencia, muy por encima de los 512 tokens usados durante el entrenamiento.
- Similitud semantica de frases (pipeline `sentence-similarity`), apta para deduplicacion, clustering y filtrado por umbral de similitud.
- Reordenacion ligera de candidatos recuperados por un retriever de primera fase, con un coste por documento muy inferior al de un cross-encoder.
- Integracion con el ecosistema `sentence-transformers` mediante `encode_query` y `encode_document`, que aplican automaticamente los prefijos guardados.
- Compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`, `endpoints_compatible`), lo que permite servirlo como endpoint HTTP.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidad de agente: es exclusivamente un modelo de representacion.
- Capacidad multilingue: ninguna. Solo japones.

## Casos de uso

- Busqueda semantica en corpus documentales japoneses: indexar los documentos como vectores de 768 dimensiones y recuperar por coseno los pasajes relevantes para una consulta en japones natural, sin depender de coincidencia lexica exacta.
- RAG sobre documentacion interna en japones: usar el modelo como retriever en un pipeline de generacion aumentada, recuperando los k pasajes mas similares y pasandolos a un LLM generativo. Su ventana de 8.192 tokens permite indexar fragmentos largos sin troceado agresivo.
- Sistemas de FAQ institucional: el entrenamiento incluye conjuntos de preguntas y respuestas de organismos publicos japoneses (amagasaki-qna, kosodate-faq-pairs-ja, civicqa-ja), por lo que encaja en portales de atencion ciudadana donde la consulta del usuario no coincide literalmente con la pregunta registrada.
- Deduplicacion y agrupacion de tickets de soporte: comparar embeddings de tickets entrantes con la base historica para detectar duplicados o encaminar cada ticket al grupo tematico correspondiente, aprovechando que un solo vector por documento minimiza el almacenamiento.
- Reordenacion de resultados en un buscador hibrido: combinar BM25 con este bi-encoder en una primera fase y un cross-encoder en la segunda, usando Sazanami-Embed-310m para filtrar candidatos con coste bajo.
- Deteccion de contenido similar en plataformas educativas: los datos de quiz-works y quiz-no-mori estan orientados a material de estudio japones, lo que lo hace util para recomendar ejercicios o preguntas semanticamente proximas a una ya resuelta.
- Filtrado de memoria en agentes conversacionales en japones: seleccionar que fragmentos de un historial o base de conocimiento son relevantes para el turno actual antes de construir el prompt de un LLM.
- Moderacion y cumplimiento: agrupar documentos o mensajes por similitud para revisar manualmente solo un representante de cada conglomerado en lugar de la totalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, JMTEB, JaGovFaqs-22k ni ninguna otra metrica numerica, ni comparaciones cuantitativas con modelos externos. Lo unico documentado al respecto es que el conjunto JaGovFaqs-22k se reservo como evaluacion y se excluyo explicitamente del entrenamiento en todas sus etapas.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 1,26 GB en fp32, 0,63 GB en fp16/bf16 y 0,32 GB en int8. El repositorio completo ocupa 1,3 GB.
- Cabe sin dificultad en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090 (24 GB), e incluso en GPUs con 4-6 GB de VRAM. Tambien puede ejecutarse en CPU para volumenes moderados.
- GPU recomendadas para servicio en produccion: L4, A10G, RTX 4090 o A100/H100 si se necesita alto throughput con batches grandes. Para indexacion masiva, cualquier GPU con al menos 8 GB es suficiente.
- Memoria en entrenamiento: el autor reporta 22,1 GB de pico con la RTX PRO 6000 Blackwell (96 GB), batch 64 y secuencias de 512 tokens. Con entradas cercanas a 8.192 tokens el consumo de activaciones crece de forma notable, por lo que conviene ajustar el batch.
- Opciones de despliegue: `sentence-transformers` en Python, Text Embeddings Inference (los tags del repositorio lo declaran compatible) y servicio como endpoint de inferencia. No se documentan variantes GGUF ni soporte de llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles. Como referencia indirecta, el entrenamiento completo proceso 5.923 pasos con batch 64 en 4 horas y 27 minutos, lo que equivale a unos 2,7 segundos por paso en esa configuracion y hardware; no es una medida de latencia de inferencia.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos de terceros (tipo `multilingual-e5`, `ruri` u otros embeddings japoneses), por lo que no se pueden aportar cifras frente a ellos. Si se puede comparar con los tres modelos hermanos del mismo autor, entrenados con identica inicializacion, datos y perdida, y que solo difieren en el numero de vectores por documento:

| Modelo | Vectores por documento | Dimension | Criterio de eleccion segun el autor |
|---|---|---|---|
| Sazanami-ColBERT-310m | Igual al numero de tokens validos del texto | no disponible (multi-vector) | Mayor precision en busquedas sobre documentos largos con muchos candidatos |
| Sazanami-AGC-310m | Hasta 32 | no disponible | Cuando se quiere reducir el volumen de datos |
| Sazanami-MetaEmbed-310m | Hasta 64, configurable a la baja | no disponible | Cuando se prioriza velocidad de calculo de similitud |
| Sazanami-Embed-310m (este modelo) | 1 (768 dimensiones) | 768 | Cuando se quiere minimizar almacenamiento y coste de calculo |

Frente a las alternativas multi-vector, este modelo reduce el almacenamiento por documento a un unico vector de 768 dimensiones y convierte la busqueda en una operacion de producto escalar sobre un indice plano o ANN estandar. El coste es, segun el planteamiento del autor, una perdida de precision en la recuperacion, que no cuantifica.

## Limitaciones y advertencias

- Modelo exclusivamente japones: no soporta consultas ni documentos en castellano, ingles u otros idiomas, y rendira de forma degradada ante texto mixto.
- Brecha entre entrenamiento e inferencia: se entreno con secuencias de 512 tokens pero expone 8.192 tokens como maximo. El comportamiento en longitudes muy superiores a 512 no esta validado ni documentado.
- Sin datos de evaluacion publicados: no hay metricas (nDCG, MRR, Recall@k) que permitan estimar su calidad real frente a alternativas, ni en el dominio general ni en el institucional.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperar pasajes irrelevantes con puntuaciones de coseno altas, especialmente en dominios alejados de los datos de entrenamiento (Wikipedia, FAQ municipales, material educativo y MS MARCO traducido).
- Restriccion de licencia en los datos: aunque los pesos son MIT, el conjunto de entrenamiento incluye `mahiyama/mmarco-ja`, traduccion de MS MARCO, cuyo uso comercial no esta claramente definido. El autor advierte de que cualquier uso comercial requiere que el usuario verifique por su cuenta los terminos de MS MARCO.
- Datos de origen no redistribuidos: parte del entrenamiento proviene de FAQ publicadas por organismos publicos japoneses, incluidas en un corpus propio (`civicqa-ja`) que no se redistribuye. El autor traslada al usuario la responsabilidad de evaluar si su uso es admisible.
- Fecha de publicacion reciente y sin adopcion: cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe retroalimentacion de la comunidad sobre su comportamiento en produccion.
- Sesgos: no se documenta ningun analisis de sesgo. Al entrenar sobre FAQ institucionales, Wikipedia y material educativo japones, es previsible que herede la distribucion tematica de esas fuentes, con posible infrarrepresentacion de dominios especializados (juridico, medico, tecnico).
- Sin variantes cuantizadas oficiales: cualquier cuantizacion (por ejemplo a int8 u ONNX) tendra que generarla el usuario y validar el impacto en la calidad de recuperacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahiyama/Sazanami-Embed-310m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Modelo hermano multi-vector: https://huggingface.co/mahiyama/Sazanami-ColBERT-310m
- Modelo hermano AGC: https://huggingface.co/mahiyama/Sazanami-AGC-310m
- Modelo hermano MetaEmbed: https://huggingface.co/mahiyama/Sazanami-MetaEmbed-310m
- Dataset auto-wiki-qa: https://huggingface.co/datasets/mahiyama/auto-wiki-qa
- Dataset mqa-ja: https://huggingface.co/datasets/mahiyama/mqa-ja
- Dataset mmarco-ja: https://huggingface.co/datasets/mahiyama/mmarco-ja
- Dataset miracl-retrieval: https://huggingface.co/datasets/mahiyama/miracl-retrieval
- Dataset mrtydi: https://huggingface.co/datasets/mahiyama/mrtydi
- Dataset amagasaki-qna: https://huggingface.co/datasets/mahiyama/amagasaki-qna
- Dataset quiz-works: https://huggingface.co/datasets/mahiyama/quiz-works
- Dataset quiz-no-mori: https://huggingface.co/datasets/mahiyama/quiz-no-mori
- Dataset anlp-meeting-retrieval: https://huggingface.co/datasets/mahiyama/anlp-meeting-retrieval
- Dataset kosodate-faq-pairs-ja: https://huggingface.co/datasets/mahiyama/kosodate-faq-pairs-ja
- Documentacion de SentenceTransformer: https://sbert.net/docs/package_reference/sentence_transformer/model.html
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados trataban sobre la configuracion de OpenSSH en Windows y no guardan relacion con el contenido de esta ficha.
