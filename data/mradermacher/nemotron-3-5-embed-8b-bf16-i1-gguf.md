# mradermacher/Nemotron-3.5-Embed-8B-BF16-i1-GGUF

## Resumen

Nemotron-3.5-Embed-8B es un modelo de embeddings de tipo encoder-only (feature extraction) desarrollado por NVIDIA, publicado originalmente como `nvidia/Nemotron-3.5-Embed-8B-BF16`. Su funcion principal es convertir texto e imagenes en representaciones vectoriales densas de alta dimensionalidad para tareas de recuperacion de informacion, busqueda semantica y generacion aumentada por recuperacion (RAG). El modelo combina modalidades: segun las etiquetas del repositorio, genera tanto embeddings de texto como de imagen, lo que lo situa en la categoria de modelos de embeddings multimodales orientados a recuperacion.

La ficha que nos ocupa no es el modelo original, sino la cuantizacion GGUF realizada por mradermacher, que ofrece el modelo en formato GGUF con cuantizaciones de tipo i1 (imatrix) y estaticas. El modelo base cuenta con 7.952.683.008 parametros (aproximadamente 8 mil millones), lo que lo convierte en un encoder de gran tamano para tareas de embedding, con un coste de inferencia considerablemente mayor que los clasicos de 300-600 millones de parametros, pero con potencial de mayor calidad semantica. El repositorio GGUF ocupa 92,9 GB e incluye un amplio abanico de cuantizaciones desde i1-IQ1_S (2,0 GB) hasta i1-Q6_K (6,6 GB).

Es relevante ahora porque la demanda de modelos de embeddings de mayor capacidad, capaces de manejar contextos largos y contenido multimodal, ha crecido con la popularizacion de sistemas RAG en produccion. La disponibilidad en GGUF permite desplegarlo en llama.cpp y en entornos con GPU de consumo, algo impensable con el BF16 original (que requiere aproximadamente 16 GB solo para pesos). El soporte de mas de 30 idiomas, incluido el castellano, lo hace util para sistemas de recuperacion multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (feature extraction, embeddings multimodales) |
| Parametros totales | 7.952.683.008 (aprox. 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | multilingual, en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 (etiquetada como "other") |
| Formato de pesos | GGUF (BF16 original y cuantizaciones i1) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `nvidia/Nemotron-3.5-Embed-8B-BF16` mas alla de su naturaleza de modelo de embeddings multimodales para extraccion de caracteristicas (feature extraction) y recuperacion. Los tags indican soporte de embeddings de texto e imagen, lo que sugiere una arquitectura con torres o proyecciones separadas para cada modalidad, pero no se dispone de detalles sobre el numero de capas, dimension de hidden, dimension del embedding de salida ni mecanismo de atencion.

Respecto al entrenamiento, no se dispone de informacion sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni tecnicas de contrastive learning empleadas. La model card del repositorio GGUF es exclusivamente la generada por la herramienta de cuantizacion de mradermacher y no incluye datos del autor original. La unica innovacion tecnica documentada en esta ficha es el proceso de cuantizacion: uso de imatrix (importance matrix) generada a partir del modelo base y cuantizaciones i1, que segun las notas del autor suelen superar a cuantizaciones estaticas de tamano similar (por ejemplo, "i1-IQ3_S beats Q3_K*").

## Capacidades

- Generacion de embeddings de texto densos para recuperacion, similitud semantica y busqueda.
- Generacion de embeddings de imagen (multimodal-embedding, image-embeddings), lo que permite recuperacion cross-modal texto-imagen.
- Soporte multilingue en mas de 30 idiomas, incluidos espanol, ingles, arabe, chino, hindi, japones, coreano, portugues, ruso y vietnamita, entre otros.
- Orientado a tareas de retrieval y RAG: adecuado para indexacion de documentos y consulta semantica.
- Compatible con vLLM segun los tags del repositorio.
- Compatible con transformers como libreria de referencia.
- No se documentan capacidades de generacion de texto, tool calling, agentes ni modos de razonamiento, ya que es un modelo de embeddings y no un modelo generativo.

## Casos de uso

- Busqueda semantica multilingue en corpus empresariales: el modelo genera embeddings para documentos y consultas en mas de 30 idiomas, permitiendo que un usuario consulte en castellano sobre documentacion en ingles o aleman sin traduccion intermedia, gracias a la representacion vectorial compartida entre idiomas.
- RAG sobre bases de conocimiento tecnicas: indexar manuales, documentacion de API y tickets de soporte como vectores y recuperar los fragmentos relevantes antes de pasarlos a un LLM generativo. El tamano de 8B parametros apunta a mayor calidad de recuperacion que encoders pequenos en dominios especializados.
- Recuperacion multimodal de productos: en un catalogo de comercio electronico, generar embeddings de imagenes de producto y de descripciones textuales en un mismo espacio vectorial, permitiendo busquedas del tipo "imagen similar a esta" o "producto que encaje con esta descripcion".
- Deduplicacion y clustering de documentos: calcular embeddings de grandes volumenes de textos para detectar near-duplicates y agrupar contenidos tematicamente en pipelines de curacion de datos.
- Moderacion y clasificacion semantica: usar las representaciones vectoriales como entrada para clasificadores ligeros (regresion logistica, kNN) en tareas de etiquetado de contenido, con la ventaja de no requerir fine-tuning del encoder.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF desde 2,0 GB (i1-IQ1_S) hasta 6,6 GB (i1-Q6_K), es posible ejecutar el modelo en llama.cpp sobre GPU de consumo o incluso CPU, para prototipos y sistemas de recuperacion de baja latencia en local.
- Sistemas de recomendacion basados en contenido: generar embeddings de items (texto e imagen) y calcular similitud con el perfil del usuario representado como vector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 16 GB solo para el modelo, mas overhead de activaciones y contexto; requiere GPU de 24 GB o superior (RTX 4090, A100 40 GB, H100) para inferencia comoda.
- Cuantizacion i1-Q6_K (6,6 GB): cabe en GPU de 8-12 GB (RTX 3060 12 GB, RTX 4070) con margen para contexto moderado.
- Cuantizacion i1-Q4_K_M (5,0 GB, recomendada por el autor como "fast, recommended"): viable en GPU de 8 GB (RTX 3070, RTX 4060 Ti) y en Apple Silicon con memoria unificada de 16 GB.
- Cuantizaciones de 2-4 GB (IQ1_S a IQ3_M): aptas para GPU de 4-6 GB y para inferencia en CPU, con penalizacion de calidad en los extremos (el autor marca IQ1_S como "for the desperate" y Q2_K_S como "very low quality").
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (importando el GGUF), vLLM (soportado segun tags, aunque para GGUF conviene verificar compatibilidad de la version), transformers con el modelo BF16 original.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un encoder de 8B parametros tiene coste de inferencia proporcional al tamano, muy superior a encoders de 300-600M; para indexacion masiva conviene batch grande en GPU y para consulta en linea evaluar latencia con la cuantizacion Q4_K_M o inferior.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales conocidos.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B (esta ficha, GGUF i1) | 7,95B | no disponible | texto + imagen | openmdw-1.1 | GGUF |
| Nemotron-3.5-Embed-8B-BF16 (original) | 7,95B | no disponible | texto + imagen | openmdw-1.1 | safetensors/BF16 |
| Encoders de embedding tipicos de 300-600M (familia no especificada) | 0,3-0,6B | no disponible | texto | variable | safetensors, GGUF |
| Encoders multimodales tipo CLIP/SigLIP (familia no especificada) | 0,1-1B aprox. | no disponible | texto + imagen | variable | safetensors |

La comparacion cuantitativa de rendimiento en recuperacion (nDCG, Recall@k, MTEB) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo para esas tareas daria resultados incorrectos.
- La licencia openmdw-1.1 esta etiquetada como "other" en el repositorio; antes de uso comercial conviene revisar los terminos en https://openmdw.ai/license/1-1/ y las condiciones del modelo base de NVIDIA, ya que la cuantizacion no altera los terminos de licencia originales.
- Las cuantizaciones extremas (IQ1_S, IQ1_M, Q2_K_S) degradan la calidad de los embeddings de forma significativa; el propio autor las desaconseja salvo casos de fuerza mayor. Para produccion se recomienda Q4_K_M o superior.
- La longitud de contexto no esta documentada en la informacion disponible; indexar fragmentos demasiado largos sin conocer el limite puede truncar contenido silenciosamente y degradar la recuperacion.
- No hay datos publicados de benchmarks en esta ficha, por lo que la calidad de recuperacion debe validarse empiricamente en el dominio de uso antes de desplegar.
- Riesgo de sesgos: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, etnicos o culturales en el espacio de embeddings; conviene auditar la recuperacion en casos sensibles.
- El repositorio GGUF (92,9 GB) contiene muchos archivos; descargar solo la cuantizacion necesaria para evitar consumo innecesario de almacenamiento y ancho de banda.
- La model card del repositorio cuantizado no documenta el pipeline de uso recomendado (prefijos de instruccion, pooling, normalizacion); es necesario consultar la documentacion del modelo base de NVIDIA para aplicar el formato de entrada correcto.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-i1-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Nemotron-3.5-Embed-8B-BF16-i1-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
