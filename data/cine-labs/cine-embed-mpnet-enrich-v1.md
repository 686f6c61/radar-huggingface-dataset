# cine-labs/cine-embed-mpnet-enrich-v1

## Resumen

cine-embed-mpnet-enrich-v1 es un modelo de embeddings de frases (sentence encoder) publicado por cine-labs, un proyecto asociado al motor de recomendacion `cine-rec-engine`. Se trata de un ajuste fino (fine-tune) de segundo nivel sobre `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, orientado especificamente al canal de recuperacion por embeddings de un sistema de recomendacion de peliculas. El modelo no genera texto: transforma cadenas de texto en vectores densos de 768 dimensiones que permiten calcular similitud semantica entre titulos de catalogo y consultas.

La particularidad del modelo es que esta entrenado sobre textos canonicos que incluyen etiquetas cinematograficas. El formato base codifica cada titulo como un bloque `Title: {title} ({year})` seguido de `Overview: {overview}`, y opcionalmente admite un enriquecimiento (`tmdb_cinematic`) con lineas de arco emocional, ritmo, narrativa, subgeneros y experiencia. El modelo rinde mejor con la plantilla enriquecida, pero mantiene un comportamiento aceptable con la plantilla limpia de titulo y sinopsis.

Con 278.043.648 parametros y un tamano de repositorio de 0,6 GB, es un modelo compacto pensado para indexar catalogos completos y servir busquedas semanticas de baja latencia. Su relevancia actual es practica: cubre un nicho concreto (recuperacion semantica multilingue en dominios de cine) con licencia MIT sobre los pesos derivados, lo que facilita su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, segun tag `xlm-roberta`), variante MPNet de sentence-transformers |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base admite secuencias de hasta 512 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (sin listado explicito de idiomas) |
| Licencia | MIT para este fine-tune; el modelo base es Apache-2.0 y sus terminos siguen aplicando a los pesos derivados |
| Formato de pesos | safetensors (libreria `sentence-transformers`) |
| Dimensiones del embedding | 768 |
| Pipeline | feature-extraction |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo XLM-RoBERTa en la configuracion MPNet empleada por `sentence-transformers`, con 278 millones de parametros y salida de embeddings de 768 dimensiones. Se obtiene mediante un ajuste fino de segundo nivel sobre `paraphrase-multilingual-mpnet-base-v2`, es decir, el autor parte de un encoder multilingue ya entrenado para similitud de frases y lo reajusta sobre un corpus especifico del dominio cinematografico.

El entrenamiento se realiza sobre "textos canonicos que incluyen etiquetas cinematograficas", segun la model card. No se especifican el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (poco habituales en encoders de similitud). La innovacion tecnica destacable es la plantilla de entrada enriquecida con metadatos de TMDb (arco emocional, ritmo, narrativa, subgeneros y experiencia), que el motor `cine-rec-engine` construye automaticamente y que el modelo aprende a explotar para mejorar la recuperacion semantica.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones para similitud semantica y recuperacion (retrieval).
- Extraccion de caracteristicas (`feature-extraction`) para indexacion vectorial de catalogos.
- Similitud de frases multilingue (`sentence-similarity`), heredada del modelo base.
- Procesamiento de textos canonicos de peliculas con metadatos cinematograficos estructurados.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Integracion nativa con la libreria `sentence-transformers`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un encoder de texto.

## Casos de uso

- Recuperacion semantica en un motor de recomendacion de peliculas: el modelo indexa el catalogo completo como vectores de 768 dimensiones y responde a consultas en lenguaje natural recuperando los titulos mas proximos por similitud coseno. Es su proposito original dentro de `cine-rec-engine`.
- Busqueda por descripcion vaga o tematica ("pelicula lenta y melancolica sobre la perdida"): la plantilla enriquecida con arco emocional, ritmo y experiencia permite al encoder capturar atributos que el titulo y la sinopsis por si solos no reflejan.
- Deduplicacion y agrupacion de titulos: al comparar embeddings de fichas canonicas se pueden detectar entradas duplicadas o casi duplicadas en un catalogo, o agrupar peliculas por similitud tematica.
- Construccion de espacios vectoriales para busqueda hibrida: combinar el canal denso de este encoder con un canal lexico (BM25) en un pipeline de recuperacion por etapas para un portal de cine.
- Clasificacion y etiquetado asistido: usar los embeddings como caracteristicas de entrada para modelos posteriores de clasificacion de genero, prediccion de popularidad o deteccion de similitud entre franquicias.
- Sistemas de "mas como esto": calcular vecinos mas cercanos en el espacio de embeddings para generar recomendaciones item-a-item a partir de la ficha enriquecida de una pelicula semilla.
- Soporte multilingue en catalogos internacionales: al derivar de un modelo multilingue, permite consultas y fichas en distintos idiomas dentro del mismo espacio vectorial (siempre que la calidad multilingue del fine-tune se valide empiricamente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (Recall@k, nDCG, MRR) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (278 M parametros x 4 bytes) y en torno a 0,6 GB en fp16; el repositorio ocupa 0,6 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; para indexacion a gran escala se recomienda A100, H100 o L4 por throughput. Una RTX 4090 o RTX 3090 ofrece margen sobrado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para catalogos pequenos.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI), endpoints compatibles, y el propio `cine-rec-engine` mediante `models/fetch_encoders.py` (descarga fijada y verificada con sha256).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cine-embed-mpnet-enrich-v1 | 278 M | 768 | no disponible | MIT (fine-tune), base Apache-2.0 | Especializado en fichas de cine enriquecidas |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 768 | no disponible | Apache-2.0 | Modelo base; proposito general multilingue |
| Otros encoders multilingues de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa de rendimiento frente al modelo base u otras alternativas no esta disponible; el autor no publica metricas que permitan establecerla.

## Limitaciones y advertencias

- Modelo de proposito especifico: esta ajustado para fichas canonicas de peliculas; su rendimiento fuera de ese dominio (texto general, otros idiomas no validados) puede degradarse respecto al modelo base.
- Dependencia del formato de entrada: rinde mejor con la plantilla enriquecida `Title/Overview` mas lineas de metadatos; usarlo con texto libre sin estructura puede reducir la calidad de los embeddings.
- Riesgo de sesgo heredado: al derivar de un modelo multilingue entrenado con datos web, puede arrastrar sesgos de representacion cultural y de genero presentes en el corpus original y en los metadatos de TMDb.
- Sin datos de evaluacion publicados: no hay benchmarks que permitan estimar la ganancia real frente al modelo base ni garantizar calidad en produccion sin una validacion propia.
- Licencia: MIT sobre el fine-tune, pero los pesos derivados siguen sujetos a los terminos Apache-2.0 del modelo base; conviene conservar los avisos de licencia correspondientes.
- Adopcion practica: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.
- No apto para generacion de texto, razonamiento, tool calling ni tareas multimodales: es exclusivamente un encoder de similitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cine-labs/cine-embed-mpnet-enrich-v1
- Repositorio del motor: https://github.com/DovBerKaplan/cine-rec-engine
- Documentacion de encoders del motor: https://github.com/DovBerKaplan/cine-rec-engine/blob/main/models/README.md
- Perfil del autor: https://github.com/DovBerKaplan
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
