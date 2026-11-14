# SallySims/indicatorfinder-gho-minilm

## Resumen

`SallySims/indicatorfinder-gho-minilm` es un modelo de embeddings de frases (sentence transformer) afinado a partir de `sentence-transformers/all-MiniLM-L6-v2` por el usuario SallySims. Su proposito es mapear textos cortos a un espacio vectorial denso de 384 dimensiones para tareas de similitud semantica, busqueda semantica y mineria de parafrasis. El dominio de especializacion, a juzgar por los ejemplos del widget y del dataset de entrenamiento, son indicadores de salud global (GHO, Global Health Observatory): nombres de indicadores, descripciones y variantes de redaccion de metricas sanitarias.

El modelo es una adaptacion de MiniLM, una arquitectura BERT de 6 capas y 22,7 millones de parametros, con una ventana maxima de 256 tokens. No es un modelo generativo: no produce texto, solo representaciones vectoriales. Su relevancia practica reside en que permite construir sistemas de recuperacion y desambiguacion de indicadores sanitarios (por ejemplo, emparejar "Zoonosis in Africa" con el indicador "Zoonosis") sin depender de coincidencia exacta de cadenas.

El repositorio es de muy reciente creacion (noviembre de 2026) y no registra descargas ni likes en el momento de redactar esta ficha. La model card no declara licencia, idiomas ni resultados de evaluacion, lo que limita su adopcion en produccion sin una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertModel) + Pooling (mean) + Normalize; sentence transformer |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (maxima secuencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | no disponible (la model card no lo declara; el dataset de ejemplo esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo sigue el patron clasico de Sentence Transformers: un codificador BERT (`BertModel`) que extrae `last_hidden_state`, seguido de un pooling por media (`pooling_mode: mean`, `include_prompt: True`) que colapsa la secuencia a un unico vector de 384 dimensiones, y una capa de normalizacion L2. La similitud se calcula por producto escalar de vectores normalizados, equivalente a similitud coseno. El modelo base es MiniLM-L6-v2, con 6 capas, atencion multi-cabeza estandar y 22,7 M de parametros.

El afinado se realizo sobre un dataset no nombrado de 15.414 muestras con columnas `anchor` y `positive`, usando la funcion de perdida `MultipleNegativesRankingLoss` (contrastiva con negativos en el lote). Las muestras son pares de frases cortas (media de ~13,6 tokens en el ancla y ~13,8 en el positivo, maximo de 31-34 tokens) del dominio de indicadores de salud. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de embeddings). Tampoco se especifica el numero de epocas, el tamano de lote ni la tasa de aprendizaje.

## Capacidades

- Generacion de embeddings de frases: produce vectores densos de 384 dimensiones normalizados.
- Similitud semantica textual: calculo de similitud coseno entre pares de frases.
- Busqueda semantica: recuperacion de indicadores o descripciones por cercania vectorial.
- Mineria de parafrasis: deteccion de reformulaciones de un mismo indicador.
- Clustering y clasificacion de textos cortos a partir de sus embeddings.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines downstream.
- Compatible con `text-embeddings-inference` y `endpoints_compatible` (segun tags del repositorio).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo puramente de representacion.
- Capacidades multilingues: no declaradas; el unico idioma evidenciado en los ejemplos es el ingles.

## Casos de uso

- Desambiguacion de indicadores sanitarios: dado un texto libre como "Zoonosis in Africa", el modelo lo proyecta al mismo espacio que los nombres canonicos de indicadores y permite seleccionar el mas cercano por similitud coseno. Es adecuado porque el afinado se hizo precisamente sobre pares ancla-positivo de ese dominio.
- Busqueda semantica en catalogos de metadatos: indexar los nombres y descripciones de un catalogo de indicadores GHO y recuperar los relevantes ante consultas en lenguaje natural, superando la busqueda por substring.
- Deduplicacion de indicadores: agrupar por clustering entradas con redacciones distintas pero significado equivalente (por ejemplo, "Diabetes treatment coverage, age-standardized statistics" frente a "Diabetes treatment coverage, age-standardized").
- Normalizacion de etiquetas en pipelines ETL: mapear etiquetas heterogeneas de fuentes externas al identificador canonico del catalogo antes de cargarlas en un almacen de datos.
- Enrutamiento de consultas en un asistente de datos: clasificar la pregunta del usuario hacia el indicador correcto antes de lanzar una consulta a la API de datos, usando el embedding como senal de recuperacion.
- Reranking ligero en sistemas RAG: recalcular la similitud entre la consulta y los candidatos recuperados por un retriever de primera etapa, con coste computacional minimo gracias a los 22,7 M de parametros.
- Filtrado de calidad de anotaciones: detectar pares ancla-positivo mal emparejados en tareas de anotacion comparando la similitud esperada con la observada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni MTEB, ni STS, ni ninguna otra), y el repositorio no registra descargas ni validaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parametros, ~91 MB de pesos); en fp16 ~45 MB. El cuello de botella es el tamano de lote y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090, T4, L4, A10G o A100 pueden ejecutarlo con lotes grandes sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU con throughput aceptable para volumenes moderados.
- Opciones de despliegue: `sentence-transformers` (nativo), `text-embeddings-inference` (tag del repositorio), Hugging Face Inference Endpoints (`endpoints_compatible`), y exportacion a ONNX u otras runtimes via `optimum`. No se documenta soporte nativo de llama.cpp/Ollama (no aplica a un encoder de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU (miles de frases por segundo con lotes grandes), pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SallySims/indicatorfinder-gho-minilm | 22,7 M | 256 tokens | 384 | no disponible | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,7 M | 256 tokens | 384 | Apache-2.0 (segun el modelo base original) | Hugging Face, ampliamente usado |
| sentence-transformers/all-MiniLM-L12-v2 | ~33 M | 256 tokens | 384 | Apache-2.0 | Hugging Face |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | 384 | Apache-2.0 | Hugging Face |

La comparativa se limita a la familia MiniLM porque no se dispone de datos de rendimiento del modelo afinado. Frente al modelo base, la diferencia es el dominio: el afinado esta especializado en indicadores de salud global, mientras que el base es generico. Frente a variantes multilingues, este modelo no declara soporte de idiomas, por lo que no es sustituible directamente en escenarios no ingleses sin validacion.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o verificar la licencia del modelo base antes de desplegarlo en produccion.
- Idiomas no declarados: los ejemplos y el dataset estan en ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Ventana de contexto de solo 256 tokens: no apta para documentos largos; solo frases o parrafos muy cortos.
- Sesgos conocidos: no documentados; al derivar de MiniLM, hereda los sesgos del corpus original de entrenamiento del modelo base, no evaluados aqui.
- Riesgo de alucinacion: no aplica en sentido generativo (no produce texto), pero si puede producir emparejamientos erroneos por similitud espuria en dominios fuera de los indicadores sanitarios.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en la tarea objetivo; se recomienda evaluar con un conjunto propio antes de adoptarlo.
- Repositorio con cero descargas y cero likes: sin validacion de la comunidad; la fecha de creacion (noviembre de 2026) sugiere un modelo muy reciente y sin rodaje.
- Especializacion estrecha: fuera del dominio de indicadores GHO, su ventaja frente a un modelo de embeddings generico es incierta.

## Enlaces

- Hugging Face: https://huggingface.co/SallySims/indicatorfinder-gho-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE / aprendizaje contrastivo de frases (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
