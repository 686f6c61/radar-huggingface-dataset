# pmarquees/book-recommender-mf

## Resumen

book-recommender-mf es un recomendador de libros basado en factorización matricial (matrix factorization) publicado por el usuario pmarquees en HuggingFace. No es un modelo de lenguaje: es un artefacto de filtrado colaborativo que descompone la matriz de valoraciones de Goodreads en 32 factores latentes por usuario y por libro, y estima la nota de 1 a 10 estrellas que un usuario conocido daria a un libro concreto. El artefacto se distribuye como un fichero NumPy (`model.npz`) junto con diccionarios de identificadores, y se ejecuta con un simple producto escalar, sin necesidad de framework de deep learning.

El entrenamiento se realizo sobre 3 millones de valoraciones procedentes de Goodreads, con 52.110 usuarios y 369.349 libros. La evaluacion declarada por el autor da un RMSE de validacion de 0,8995 en la mejor epoca de 20, pero un Hit@10 de 0,0 sobre 200 usuarios reservados, lo que indica que la prediccion de notas es razonable mientras que la calidad del ranking a escala de catalogo completo queda sin verificar. El propio autor lo advierte explicitamente en la model card.

Su relevancia actual es limitada y muy especifica: sirve como linea base reproducible de factorizacion matricial, como generador de candidatos en un pipeline de recomendacion mas grande o como material didactico de un modelo de recomendacion sin GPU. No compite en la categoria de los LLM ni de los sistemas de recomendacion neuronales modernos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Factorizacion matricial (MF) de filtrado colaborativo: producto escalar de factores latentes mas sesgos de usuario, de libro y media global |
| Parametros totales | 32 factores latentes. 52.110 usuarios x 32 + 369.349 libros x 32 = 13.486.688 parametros de factores, mas 421.459 de sesgos (aproximadamente 13,9 M en total; cifra derivada de las dimensiones declaradas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no hay ventana de contexto; la señal de personalizacion son las valoraciones historicas del usuario) |
| Tipos de cuantizacion | No disponible (los pesos se entregan como arrays NumPy en `model.npz`) |
| Idiomas soportados | No disponibles (el artefacto no procesa texto; los identificadores remiten a libros de Goodreads) |
| Licencia | other |
| Formato de pesos | `model.npz` (NumPy) con los arrays `user_factors`, `book_factors`, `user_bias`, `book_bias` y `global_mean`; metadatos en `users.json`, `books.json`, `id2book.json` y `meta.json` |
| Tamano del repositorio | 0,1 GB |
| Corpus de entrenamiento | 3 millones de valoraciones de Goodreads; 52.110 usuarios y 369.349 libros |
| Artefacto y version | `book-recommender-mf-v3`, version `v3-full-3m` |
| Hash de contenido | `sha256:2f2aa3038c443856e14e74ac13d6914b86178b0e78df0d8341e9988c5a53d716` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 9 de octubre de 2026 (fecha declarada en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es una factorizacion matricial clasica: cada usuario y cada libro se representan con un vector de 32 factores latentes, y la prediccion de la nota se obtiene sumando la media global, el sesgo del usuario, el sesgo del libro y el producto escalar de ambos vectores. La inferencia es, por tanto, un producto matricial denso que puede resolverse con NumPy sin dependencias adicionales. El bundle incluye los diccionarios necesarios para mapear los identificadores de Goodreads a indices internos.

Los datos de entrenamiento proceden de 3 rebanadas (shards) de un volcado de Goodreads, filtradas por popularidad: solo se conservan libros y usuarios con 5 o mas valoraciones, lo que deja 52.110 usuarios y 369.349 libros con 3 millones de valoraciones. El entrenamiento se declara a 20 epocas con un holdout del 20% de los usuarios para validacion, y el mejor RMSE se alcanza en la epoca 4, lo que sugiere sobreajuste posterior. La model card no menciona ningun tipo de ajuste por preferencias humanas (RLHF, DPO) ni regularizacion explicita, ni aporta el numero total de tokens o ejemplos vistos por epoca. El artefacto se publica desde un sistema llamado Mill a partir de un payload inmutable identificado por el hash de contenido, lo que garantiza trazabilidad del binario, no de un proceso de entrenamiento reproducible.

## Capacidades

- Prediccion de la nota que un usuario conocido daria a un libro concreto, en una escala implícita de 1 a 10 estrellas.
- Ranking de recomendaciones top-N para un usuario: se puntuan todos los libros que no ha valorado y se ordenan por score.
- Generacion de candidatos a partir de señal exclusivamente colaborativa (patrones de co-valoracion entre usuarios).
- Ejecucion en CPU con NumPy puro, sin PyTorch, TensorFlow, vLLM ni ningun otro runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades de vision, audio, codigo ni matematicas.
- No incorpora modelo de contenido: no usa titulo, autor, genero, sinopsis ni ningun otro atributo textual del libro.
- No cubre usuarios ni libros en frio (cold start): el artefacto solo contiene factores para entidades presentes en el subconjunto filtrado de entrenamiento.

## Casos de uso

- Linea base reproducible en investigacion de sistemas de recomendacion: permite comparar rapidamente un metodo de factorizacion matricial clásico (RMSE de validacion 0,8995) contra alternativas neuronales o hibridas sobre el mismo tipo de datos, sin coste de GPU.
- Generacion de candidatos en un pipeline de dos etapas: los scores se usan para reducir el catalogo de 369.349 libros a un top-N acotado, que despues se reordena con un modelo con features de contenido o de negocio.
- Analisis de catalogo y deteccion de nichos editoriales: la estimacion de la nota de pares (usuario, libro) permite detectar que titulos concentran mejor valoracion predicha entre segmentos de lectores, con la advertencia de que el ranking no esta validado a escala de catalogo completo (Hit@10 = 0,0).
- Recomendacion en entornos con recursos minimos: al ejecutarse con NumPy sobre un bundle de 0,1 GB, encaja en un contenedor de baja memoria, en un servicio serverless o en un equipo sin GPU donde desplegar un transformer no es viable.
- Sistema heredado o educativo: sirve como implementacion de referencia de factorizacion matricial para docencia, prototipado rapido o para explicar sesgos y media global en un curso de sistemas de recomendacion.
- Auditoria de sesgo de popularidad: al estar entrenado sobre un subconjunto filtrado por popularidad (entidades con 5 o mas valoraciones), el artefacto es util para estudiar y medir como ese filtrado desplaza las recomendaciones hacia el catalogo ya popular.
- Feature adicional en un modelo hibrido: los cinco arrays del bundle (factores de usuario, factores de libro, sesgos y media global) se pueden exportar como embedding numerico de 32 dimensiones e inyectar en un re-ranker o en un modelo de ranking posterior.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| RMSE de validacion (mejor) | 0,8995 | Holdout del 20% por usuario sobre las 3 M de filas de entrenamiento; mejor valor en la epoca 4 de 20 |
| Hit@10 | 0,0 | 200 usuarios reservados; catalogo de 369.349 libros no valorados; el modelo no coloco ninguna valoracion retenida de 4 o mas estrellas en el top 10 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de modelos de lenguaje, ya que el artefacto no es un modelo de lenguaje. Tampoco se aportan metricas de ranking adicionales (NDCG, recall@k, MAP) ni comparaciones con lineas base populares de la literatura (SVD, ALS, BPR). El propio autor advierte que el RMSE de validacion mide calidad de prediccion de nota, no calidad de recomendacion.

## Requisitos de hardware

- VRAM: no aplica. El artefacto no requiere GPU y puede ejecutarse integramente en CPU.
- Memoria RAM: el bundle ocupa 0,1 GB en disco; los cinco arrays y los diccionarios de identificadores caben holgadamente en menos de 1 GB de RAM en el peor caso (12,5 millones de floats mas los mapas de usuarios y libros).
- GPU recomendadas: ninguna. No hay soporte ni ventaja de CUDA, ROCm o Metal.
- Cabe en cualquier equipo de consumo: portatil, mini-PC, contenedor de 512 MB o funcion serverless. Tambien en Raspberry Pi y similares, dado que el runtime es NumPy.
- Opciones de despliegue: NumPy puro (el modo previsto por el autor, `python scripts/recommend.py --bundle <artifact-dir>`); envoltorio propio con FastAPI o Flask para servicio HTTP; precalculo por lotes de los top-N por usuario y almacenamiento en base de datos. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras. Como referencia derivada, puntuar el catalogo completo de un usuario implica 369.349 productos escalares de 32 dimensiones, aproximadamente 11,8 millones de multiplicaciones-acumulaciones, un orden de magnitud que se resuelve en decenas de milisegundos en una CPU moderna; esta estimacion no esta medida por el autor.

## Comparativa con modelos similares

No se ha encontrado en la informacion disponible ningun modelo de HuggingFace directamente comparable con parametros, contexto y metricas publicadas. Los proyectos localizados en la busqueda web son aplicaciones de GitHub con enfoques distintos y sin especificaciones tecnicas verificables.

| Modelo / proyecto | Enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pmarquees/book-recommender-mf | Factorizacion matricial sobre Goodreads | ~13,9 M (derivado) | No aplica | RMSE 0,8995; Hit@10 0,0 | other | HuggingFace |
| tejaswini-phukan/book-recommender | Arbol de decision + Streamlit | No disponible | No aplica | No disponible | No disponible | GitHub |
| Pranitttt64/Book-Recommender-AI-Model-App | Autoencoder con Keras + Streamlit | No disponible | No aplica | No disponible | No disponible | GitHub |
| Sistema hibrido CF + content-based (IJERT) | Filtrado colaborativo + filtrado por contenido | No disponible | No aplica | No disponible | No disponible | Publicacion |

## Limitaciones y advertencias

- Calidad de ranking sin verificar: Hit@10 = 0,0 sobre 200 usuarios reservados y un catalogo de 369.349 libros. El autor indica explicitamente que la calidad de ranking debe considerarse no verificada a esa escala, por lo que no es apto para produccion como recomendador final sin una reevaluacion propia.
- Sesgo de popularidad: el entrenamiento usa un subconjunto filtrado por popularidad (libros y usuarios con 5 o mas valoraciones), por lo que el catalogo minoritario y los usuarios poco activos quedan infrarrepresentados.
- Cold start no cubierto: no existen factores para usuarios o libros ausentes del subconjunto de entrenamiento; el modelo no puede recomendar a un usuario nuevo ni puntuar un libro nuevo.
- Señal exclusivamente de valoraciones: no hay features de titulo, autor, genero ni sinopsis, de modo que el modelo no puede hacer recomendacion por contenido ni explicar sus recomendaciones en terminos comprensibles.
- Sobreajuste probable: el mejor RMSE se obtiene en la epoca 4 de 20, lo que sugiere que el entrenamiento continuado empeora la generalizacion; conviene no reentrenar sin control de validacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones sin fundamento para pares (usuario, libro) con pocas valoraciones observadas, porque el modelo siempre devuelve una nota numerica.
- Idiomas: no disponible; el modelo no procesa idioma alguno y cualquier cobertura linguistica depende del catalogo de Goodreads subyacente.
- Licencia `other` sin terminos explicitos en la model card: hay que revisar las condiciones antes de cualquier uso comercial. El autor advierte ademas que los datos originales (volcado completo de Goodreads de 32 shards, 7,4 GB) tienen licencia `other` y que deben comprobarse sus terminos antes de redistribuir.
- Identificadores sin resolver: las salidas son ids de Goodreads; hay que cruzar un volcado de metadatos para obtener titulos y descripciones.
- Sin reproducibilidad del entrenamiento: se garantiza la integridad del payload mediante hash de contenido, pero no se publican semillas, hiperparametros de regularizacion ni codigo de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pmarquees/book-recommender-mf
- GitHub - tejaswini-phukan/book-recommender: https://github.com/tejaswini-phukan/book-recommender
- GitHub - Pranitttt64/Book-Recommender-AI-Model-App: https://github.com/Pranitttt64/Book-Recommender-AI-Model-App
- PDF - AI based Book Recommender System with Hybrid Approach (IJERT): https://www.ijert.org/research/ai-based-book-recommender-system-with-hybrid-approach-IJERTV9IS020416.pdf
- PDF - How to Build a Recommender System (Stanford, CS229): https://cs229.stanford.edu/proj2019aut/data/assignment_308832_raw/26588542.pdf
- AI Recommender Systems (Kim Falk, Manning): https://www.manning.com/books/ai-recommender-systems
