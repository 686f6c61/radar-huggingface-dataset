# gahabeen/F2LLM-v2-330M

## Resumen

F2LLM-v2-330M es un modelo de embeddings multilingüe de propósito general publicado en HuggingFace por el usuario gahabeen, que lo distribuye como derivado del modelo base codefuse-ai/F2LLM-v2-0.6B-Preview-Pruned-330M. No es una generación de texto: es un encoder de frases (pipeline `feature-extraction`) que convierte consultas y documentos en vectores densos utilizables para búsqueda semántica, recuperación de información y clasificación. Cuenta con 334.349.184 parámetros reales (unos 334 M) y un repositorio de 0,7 GB en formato safetensors.

La familia original F2LLM-v2, desarrollada por CodeFuse (Ant Group), se presenta como un conjunto de modelos de embeddings totalmente abiertos en ocho tamaños que van de 80 M a 14 B, entrenados sobre una composición curada de 60 millones de ejemplos de datos públicos de alta calidad y con cobertura declarada de más de 200 idiomas, con énfasis en lenguas de recursos medios y bajos. Los tres modelos instruct más pequeños (80 M, 160 M y 330 M) se obtienen podando y reentrenando el modelo base de 0,6 B, de ahí el tamaño y el apellido "Pruned-330M".

Su relevancia práctica es la de un encoder compacto y multilingüe, con licencia Apache 2.0 y compatible con el ecosistema sentence-transformers y Text Embeddings Inference, que puede desplegarse en hardware muy modesto. Conviene subrayar que el repositorio analizado es una publicación de un tercero, con 0 descargas y 0 likes en el momento de la consulta, cuya model card reproduce la de la familia oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3, adaptado a extracción de características (encoder de embeddings) |
| Parametros totales | 334.349.184 (~334 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; los ejemplos de uso emplean bfloat16) |
| Idiomas soportados | más de 200 según la model card de la familia; el repositorio declara más de 90 códigos ISO, entre ellos en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 896, segun el ejemplo de uso de la model card (no confirmado de forma explicita para este repositorio) |
| Pipeline | feature-extraction |
| Modelo base | codefuse-ai/F2LLM-v2-0.6B-Preview-Pruned-330M |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3 (etiqueta `qwen3` en el repositorio) reconvertido en encoder de embeddings: el modelo no genera tokens, sino que produce una representación vectorial por secuencia, con pooling y prompt de instrucción para consultas. La model card de la familia indica que los modelos instruct de 80 M, 160 M y 330 M se obtienen mediante poda (*pruning*) del modelo base de 0,6 B seguida de reentrenamiento, lo que explica que el 330 M conserve una dimensión de embedding de 896 en los ejemplos publicados.

En cuanto a los datos, la familia F2LLM-v2 se entrenó sobre una composición curada de 60 millones de ejemplos de datos públicos de alta calidad, con un dataset publicado (`codefuse-ai/F2LLM-v2`). La model card declara que se liberan los modelos base en 5 tamaños, los modelos instruct en 8 tamaños, los datos de entrenamiento, el código de entrenamiento y los checkpoints intermedios. No se especifica en la información disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni la composición detallada del dataset, ni la longitud de contexto de entrenamiento.

## Capacidades

- Generación de embeddings de texto para consultas y documentos por separado (`encode_query` y `encode_document` en sentence-transformers), con prompt de instrucción para la parte de consulta.
- Recuperación de información y búsqueda semántica multilingüe: similitud coseno entre consulta y pasajes, con soporte declarado de más de 200 idiomas.
- Clasificación de texto y regresión sobre representaciones (clasificación KNN, *probing* lineal, etiquetado temático).
- Agrupamiento (*clustering*) y deduplicación semántica de corpus.
- Detección de duplicados y de paráfrasis entre documentos, incluidos pares entre idiomas distintos (*cross-lingual retrieval*).
- Capacidades específicas de código, según la familia F2LLM-v2, que declara resultados destacados en el subconjunto MTEB Code.
- No soporta generación de texto, razonamiento autoregresivo, *tool calling* / *function calling*, uso como agente ni razonamiento multi-paso: es un encoder, no un modelo de chat.
- No se declaran capacidades de visión, audio ni modo de pensamiento (*thinking mode*).

## Casos de uso

- Recuperación aumentada por generación (RAG): el modelo indexa los fragmentos de una base documental con `encode_document` y codifica la pregunta del usuario con `encode_query`; los vectores resultantes alimentan un índice vectorial para recuperar los pasajes más relevantes antes de pasarlos a un LLM generador. Su tamaño de 334 M permite ejecutar la fase de recuperación en la misma GPU que el generador o incluso en CPU.
- Búsqueda semántica multilingüe en catálogos y documentación: al declarar soporte de más de 200 idiomas, permite que una consulta en español recupere documentos escritos en inglés, alemán o japonés sin traducción previa, útil en bases de conocimiento corporativas heterogéneas.
- Clasificación y enrutado de tickets de soporte: se generan embeddings de los tickets entrantes y se entrenan clasificadores ligeros (regresión logística, KNN) encima para asignar categoría, prioridad o equipo responsable, sin necesidad de reentrenar el encoder.
- Deduplicación de corpus y control de calidad de datasets: cálculo de similitud coseno por pares o búsqueda de vecinos más cercanos para detectar documentos repetidos, casi repetidos o traducidos entre idiomas antes de un entrenamiento.
- Búsqueda de código en repositorios internos: gracias a los resultados declarados por la familia en MTEB Code, el modelo puede indexar docstrings, fragmentos y documentación técnica para localizar implementaciones o ejemplos de API por descripción en lenguaje natural.
- Moderación y agrupamiento de contenido a escala: agrupar comentarios o incidencias similares para revisión humana en lote, o detectar campañas de contenido repetido mediante clustering sobre los embeddings.
- Sistemas de recomendación basados en contenido: representar artículos, productos o vídeos como vectores y calcular similitud con el perfil de intereses del usuario para generar candidatos en la fase de recuperación.
- Cache semántico de respuestas: almacenar embeddings de consultas ya resueltas y devolver la respuesta cacheada cuando la similitud con una nueva consulta supera un umbral, reduciendo coste de inferencia en aplicaciones de atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible.

La model card de la familia afirma, sin cifras, que F2LLM-v2 establece un nuevo estado del arte en varios subconjuntos de MTEB (Code, European, Scandinavian, German, French, Spanish, Polish, Dutch, Japanese, Vietnamese, Thai, Indic y Persian, entre otros) y remite a una imagen de rendimiento y al leaderboard de MTEB para los detalles. No se proporcionan valores concretos de MMLU, HumanEval, GSM8K ni de las métricas de MTEB para este repositorio concreto, y este no incluye evaluaciones propias.

## Requisitos de hardware

- Peso de los parametros: unos 0,67 GB en bfloat16/fp16 (334 M x 2 bytes), unos 1,34 GB en fp32 y aproximadamente 0,33 GB en int8.
- VRAM estimada para inferencia: por debajo de 2 GB en fp16 sumando pesos y activaciones de lotes pequeños; el modelo cabe holgadamente en cualquier GPU de consumo.
- GPU compatibles: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100, H100). En la practica, la eleccion vendra determinada por el throughput agregado necesario, no por la memoria.
- Viabilidad en CPU: el tamano de 334 M hace viable la inferencia en CPU para cargas de baja concurrencia o indexado por lotes fuera de linea.
- Opciones de despliegue: sentence-transformers (`SentenceTransformer`), transformers con `AutoModel` y pooling manual, y Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference`). Tambien esta marcado como compatible con endpoints de HuggingFace (`endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo para este repositorio.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros en la informacion proporcionada, por lo que la comparativa se limita a los modelos hermanos de la propia familia F2LLM-v2, cuyos enlaces figuran en la model card. Las especificaciones de contexto, licencia y rendimiento de esos modelos no estan detalladas en la informacion disponible.

| Modelo | Parametros | Tipo | Relacion con este modelo | Licencia | Contexto |
|---|---|---|---|---|---|
| gahabeen/F2LLM-v2-330M | 334,3 M | Instruct (republicacion de un tercero) | Modelo analizado | apache-2.0 | no disponible |
| codefuse-ai/F2LLM-v2-330M | ~330 M | Instruct | Modelo oficial de referencia de la familia | no disponible | no disponible |
| codefuse-ai/F2LLM-v2-0.6B-Preview-Pruned-330M | ~330 M | Base podado | Modelo base declarado del que deriva este repositorio | no disponible | no disponible |
| codefuse-ai/F2LLM-v2-0.6B | ~0,6 B | Instruct | Hermano de mayor tamano | no disponible | no disponible |
| codefuse-ai/F2LLM-v2-160M | ~160 M | Instruct | Hermano menor, misma estrategia de poda | no disponible | no disponible |

Para comparar con alternativas de otros proveedores (por ejemplo, otros encoders multilingues de la misma franja de parametros) habria que acudir al leaderboard de MTEB, ya que la informacion proporcionada no incluye esas comparaciones.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no produce texto, no mantiene conversaciones, no ejecuta llamadas a herramientas y no puede usarse como agente. Cualquier caso de uso descrito requiere un LLM generador o un clasificador externo que consuma los vectores.
- Repositorio de terceros sin validacion independiente: el autor es gahabeen, no CodeFuse; el repositorio registra 0 descargas y 0 likes y su model card reproduce la de la familia oficial, sin documentar el proceso de derivacion respecto al modelo base. No hay evidencia publicada de que el comportamiento sea identico al del modelo oficial.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperaciones incorrectas. La similitud coseno alta no garantiza relevancia semantica real, especialmente en consultas ambiguas o muy cortas.
- Longitud de contexto desconocida: no se especifica la ventana maxima de tokens. Sin ese dato no es posible garantizar el tratamiento de documentos largos sin truncado; habra que medirlo antes de indexar pasajes extensos.
- Cobertura idiomatica declarada, no verificada: los mas de 200 idiomas y los mas de 90 codigos ISO del repositorio son afirmaciones del editor; el rendimiento real en lenguas de bajos recursos puede ser notablemente inferior al de ingles, chino o español.
- Idiomas minoritarios y variantes dialectales: no hay informacion sobre el tratamiento de variedades del español ni de lenguas con poca presencia en los datos de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgo de genero, etnia, religion o nacionalidad. Los embeddings pueden reproducir sesgos presentes en los 60 millones de ejemplos de entrenamiento y trasladarlos a sistemas de seleccion, moderacion o recomendacion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo de cambios. Es responsabilidad del integrador verificar la licencia del modelo base y del dataset asociado antes de un despliegue en produccion.
- Dimensionalidad de embedding: los 896 valores indicados proceden del ejemplo de la model card y no estan confirmados de forma explicita para los pesos de este repositorio; conviene comprobarlos antes de dimensionar el indice vectorial.
- Coste de almacenamiento: 896 dimensiones en float32 suponen unos 3,6 KB por vector; en corpus de millones de documentos el indice vectorial supera ampliamente el tamano del propio modelo.

## Enlaces

- Modelo en HuggingFace (repositorio analizado): https://huggingface.co/gahabeen/F2LLM-v2-330M
- Modelo base declarado: https://huggingface.co/codefuse-ai/F2LLM-v2-0.6B-Preview-Pruned-330M
- Modelo oficial de la familia, tamano 330M: https://huggingface.co/codefuse-ai/F2LLM-v2-330M
- Familia completa F2LLM-v2: https://huggingface.co/codefuse-ai/F2LLM-v2-80M, https://huggingface.co/codefuse-ai/F2LLM-v2-160M, https://huggingface.co/codefuse-ai/F2LLM-v2-0.6B, https://huggingface.co/codefuse-ai/F2LLM-v2-1.7B, https://huggingface.co/codefuse-ai/F2LLM-v2-4B, https://huggingface.co/codefuse-ai/F2LLM-v2-8B, https://huggingface.co/codefuse-ai/F2LLM-v2-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Documentacion de Sentence Transformers: https://www.sbert.net/
- Documentacion de Transformers: https://huggingface.co/docs/transformers/index
- Identificador de paper citado en las etiquetas del repositorio: arxiv:2603.19223 (no se ha localizado el enlace directo en la busqueda web realizada)
- Nota sobre la busqueda web: los resultados obtenidos corresponden unicamente a paginas de YouTube y no aportan informacion tecnica relevante sobre el modelo.
