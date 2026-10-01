# nuthan-444/Movie_Recommendation_System

## Resumen

Movie Recommendation System (nuthan-444/Movie_Recommendation_System) es un proyecto de sistema de recomendacion de peliculas basado en contenido, publicado en HuggingFace por el usuario nuthan-444 (Nuthan Prasad K G). No es un modelo de lenguaje ni una red neuronal: es un pipeline clasico de machine learning que convierte los metadatos de cada pelicula (generos, palabras clave, reparto, equipo tecnico y sinopsis) en vectores numericos mediante CountVectorizer y calcula la similitud entre peliculas con similitud del coseno. El repositorio distribuye los artefactos ya generados (vectors.pkl y DF.pkl) junto con el script recommend.py, de modo que se puede recomendar sin volver a ejecutar el notebook de entrenamiento.

El problema que resuelve es el de la recomendacion por similitud de item: dado un titulo de entrada, devuelve las peliculas mas parecidas segun sus atributos, sin necesidad de historiales de valoraciones de usuarios. Es relevante como ejemplo didactico y como plantilla reproducible de un recomendador content-based con el dataset TMDB 5000 Movie Dataset, no como componente de produccion a gran escala. Su interes practico actual es limitado dentro del ecosistema de IA generativa, donde los enfoques hibridos con embeddings o con LLM suelen superar al filtrado por bolsa de palabras.

El repositorio ocupa 0,2 GB, no declara licencia, idiomas ni pipeline, y acumula 0 descargas (1 like) en el momento de redactar esta ficha. Toda la documentacion tecnica disponible es la model card del propio autor, que no incluye metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Filtrado basado en contenido (content-based filtering) sobre vectorizacion de texto con CountVectorizer y similitud del coseno; no es una red neuronal |
| Parametros totales | no disponible (no es un modelo de parametros entrenables; el artefacto principal es una matriz de vectores de caracteristicas de peliculas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo autorregresivo; la entrada es un titulo de pelicula) |
| Tipos de cuantizacion | no aplica (no hay pesos de red neuronal que cuantizar) |
| Idiomas soportados | no disponible; el dataset de origen (TMDB 5000) esta mayoritariamente en ingles |
| Licencia | no disponible |
| Formato de pesos | artefactos serializados con joblib en formato .pkl (vectors.pkl, DF.pkl) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline determinista de procesamiento, no un modelo entrenado con descenso de gradiente. Las etapas declaradas por el autor son: carga del dataset, preprocesamiento, seleccion y combinacion de caracteristicas (generos, keywords, cast, crew y overview), procesamiento de texto, vectorizacion, calculo de similitud del coseno y devolucion de recomendaciones. La vectorizacion se realiza con CountVectorizer de scikit-learn, es decir, una representacion de bolsa de palabras con conteo de terminos, y el almacenamiento final consiste en la matriz de vectores (vectors.pkl) mas el dataframe de peliculas (DF.pkl) serializados con joblib.

Los datos de entrenamiento son el TMDB 5000 Movie Dataset, compuesto por los ficheros tmdb_5000_movies.csv y tmdb_5000_credits.csv, disponibles en Kaggle. No se especifica el numero de peliculas efectivamente utilizadas tras el filtrado, el tamano del vocabulario resultante, ni la dimension final de la matriz de vectores. Tampoco se documenta ningun proceso de ajuste fino, RLHF, DPO ni evaluacion offline con metricas de ranking (precision@k, recall@k, NDCG). No hay innovaciones tecnicas destacables mas alla del uso estandar de similitud del coseno sobre representaciones dispersas.

## Capacidades

- Recomendacion de peliculas similares a un titulo dado, mediante comparacion de vectores de caracteristicas y similitud del coseno.
- Representacion de cada pelicula a partir de generos, palabras clave, reparto, equipo tecnico y sinopsis combinados en un unico campo de texto.
- Consulta por nombre de pelicula: el sistema localiza el vector del titulo y devuelve los vecinos mas cercanos.
- Ejecucion sin reentrenamiento, cargando los artefactos pregenerados DF.pkl y vectors.pkl con joblib.
- Extraccion de la matriz de similitud en memoria para uso programatico desde Python.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (vocabulario derivado de metadatos en ingles).
- No dispone de modo de pensamiento, audio ni ninguna capacidad multimodal.
- No incorpora filtrado colaborativo: no aprende de valoraciones de usuarios.

## Casos de uso

- Prototipo academico de recomendador: sirve como punto de partida reproducible para un trabajo de clase o un tutorial, ya que incluye notebook, dataset, artefactos y script de inferencia.
- Aplicacion de demostracion con interfaz ligera: el script recommend.py puede envolverse en una API Flask o FastAPI para exponer un endpoint que reciba un titulo y devuelva una lista de peliculas similares.
- Catalogo de streaming de nicho con inventario pequeno: para bibliotecas de pocos miles de titulos, la similitud por contenido ofrece recomendaciones coherentes sin necesidad de telemetria de usuarios.
- Arranque en frio de un sistema mayor: cuando no hay historial de interacciones, este enfoque permite generar recomendaciones iniciales basadas solo en metadatos, que despues pueden combinarse con filtrado colaborativo.
- Etiquetado y agrupacion tematica de catalogos: la matriz de vectores permite calcular vecindarios y construir clusters de peliculas por tematica, genero o equipo creativo.
- Descubrimiento de titulos relacionados para fichas de producto: se puede usar para poblar un bloque de "tambien te puede interesar" a partir de la pelicula que el usuario esta consultando.
- Analisis exploratorio de datos cinematograficos: el dataframe DF.pkl y los vectores permiten estudiar coocurrencia de generos, reparto y palabras clave sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (precision@k, recall@k, NDCG, cobertura de catalogo ni diversidad), ni comparaciones cuantitativas con otros sistemas de recomendacion. Tampoco se documentan tiempos de inferencia o de construccion de la matriz de similitud.

## Requisitos de hardware

- Inferencia en CPU: suficiente. El sistema no requiere GPU en ninguna fase, ni para cargar los artefactos ni para calcular similitudes.
- VRAM estimada para inferencia: no aplica (0 GB de VRAM necesaria).
- GPU recomendadas: no aplica; no hay soporte CUDA ni aceleracion por hardware mas alla de la que ofrezca NumPy.
- Memoria RAM estimada: no disponible de forma exacta. Como referencia, el repositorio completo ocupa 0,2 GB, por lo que el conjunto de dataframe y matriz de vectores cabe previsiblemente en menos de 1-2 GB de RAM, aunque esta cifra no esta confirmada por el autor.
- Cabida en GPU de consumo: no aplica, se ejecuta en cualquier portatil convencional.
- Opciones de despliegue: script Python directo (recommend.py), notebook Jupyter (model.ipynb), o envoltorio propio con Flask, FastAPI o Streamlit. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de modelos de lenguaje, porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del tamano del vocabulario y de si se recalcula la matriz de similitud en cada consulta o se precalcula una sola vez.

## Comparativa con modelos similares

| Sistema | Enfoque | Datos de entrada | Personalizacion por usuario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Movie Recommendation System (nuthan-444) | Filtrado basado en contenido, CountVectorizer + similitud del coseno | Metadatos de peliculas (TMDB 5000) | No | no disponible | HuggingFace, codigo y artefactos .pkl |
| Filtrado colaborativo con factorizacion matricial (SVD, ALS) | Filtrado colaborativo sobre matriz usuario-item | Valoraciones de usuarios | Si | depende de la implementacion | Ampliamente disponible en bibliotecas como Surprise o implicit |
| Recomendador con embeddings densos (por ejemplo, sentence-transformers + FAISS) | Similitud semantica sobre embeddings de sinopsis y metadatos | Texto de sinopsis y atributos | No, salvo hibridacion | depende del modelo de embeddings | HuggingFace y FAISS |
| Enfoque hibrido con LLM (por ejemplo, patron LLaMA o Gemini sobre metadatos TMDB) | Recuperacion de candidatos mas generacion de explicaciones por LLM | Metadatos TMDB mas prompt | Parcial | depende del LLM subyacente | Requiere acceso a API o despliegue propio |

La ventaja de este proyecto frente a las alternativas es su coste computacional practicamente nulo y su simplicidad de despliegue. Sus desventajas son la ausencia de personalizacion por usuario, la dependencia de coincidencia lexica exacta en lugar de similitud semantica, y la falta de evaluacion publicada que permita comparar su calidad objetiva con cualquiera de las alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede usarse para tareas de NLP generativo pese a estar alojado en HuggingFace.
- Representacion por bolsa de palabras: CountVectorizer no captura sinonimia ni relaciones semanticas, por lo que peliculas conceptualmente similares con vocabulario distinto pueden no recuperarse.
- Sin filtrado colaborativo: no aprende de las valoraciones ni del comportamiento de los usuarios, de modo que no puede personalizar recomendaciones.
- Sesgo hacia titulos sobrerrepresentados en el dataset TMDB 5000, que esta sesgado hacia cine estadounidense y de gran distribucion, con escasa presencia de cine independiente o no angloparlante.
- Riesgo de recomendaciones triviales: el sistema tiende a devolver secuelas, reboots y peliculas del mismo equipo creativo, lo que reduce la diversidad del resultado.
- Idiomas: no se declara soporte multilingue; el vocabulario procede de metadatos en ingles, por lo que las consultas en castellano u otras lenguas pueden fallar.
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial, redistribucion o modificacion. Es necesario contactar con el autor antes de cualquier uso en produccion.
- Sin evaluacion publicada: no hay metricas que permitan estimar la calidad del ranking devuelto ni comparar frente a alternativas.
- Estado del repositorio: 0 descargas y 1 like, sin pipeline declarado ni versionado de los artefactos, lo que implica ausencia de mantenimiento y de garantias de reproducibilidad.
- Dependencia del dataset original de Kaggle: la distribucion del dataframe y de los vectores depende de la version concreta de tmdb_5000_movies.csv y tmdb_5000_credits.csv utilizada, no fijada en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nuthan-444/Movie_Recommendation_System
- Repositorio de codigo del autor en GitHub: https://github.com/NuthaN-444/
- Perfil del autor en GitHub: https://github.com/NuthaN-444/
- Dataset TMDB 5000 Movie Dataset en Kaggle: https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata
- Articulo relacionado sobre recomendacion de peliculas con GenAI y LLaMA (Medium, contexto externo, no vinculado al autor): https://medium.com/activated-thinker/i-built-a-movie-recommendation-system-using-genai-step-by-step-21933eb320a3
- Proyecto externo de recomendacion con Next.js y Gemini (GitHub, contexto externo, no vinculado al autor): https://github.com/amrhanyy/movie-recommendation-system
- Recopilacion externa de motores de recomendacion de peliculas con IA (Lister, contexto externo): https://www.lister.ai/ai-tools/top-10-ai-movie-recommendation-engines
- Tutorial externo de recomendacion en Python con filtrado por contenido, colaborativo e hibrido (Geeks Programming, contexto externo): https://geeksprogramming.com/ai-powered-movie-recommendation-system/
