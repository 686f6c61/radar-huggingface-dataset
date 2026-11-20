# fse/word2vec-google-news-300

## Resumen

word2vec Google News 300 es un conjunto de vectores de palabras preentrenados de 300 dimensiones para aproximadamente 3 millones de palabras y frases en inglés, entrenados sobre una parte del corpus Google News que comprende unos 100 mil millones de palabras. Fue publicado originalmente por Google dentro del proyecto word2vec y esta redistribucion en formato gensim corre a cargo de fse (Fast Sentence Embeddings), mantenido por Oliver Borchers. No es un modelo generativo ni un transformer: es una representacion estatica de palabras basada en la arquitectura word2vec original de 2013.

El modelo resuelve el problema de obtener representaciones densas de palabras y frases para tareas de similitud semantica, recuperacion de informacion, clasificacion de texto o clustering, sin necesidad de entrenar embeddings desde cero. Su relevancia actual es la de un componente clasico de linea base: sigue siendo util para pipelines ligeros, sistemas con recursos limitados y como referencia historica frente a los modelos de embeddings contextuales modernos.

La ficha tecnica se centra en el paquete fse, que envuelve los vectores de gensim y los convierte en embeddings de frase mediante tecnicas como CBOW averaging, SIF y uSIF. El repositorio ocupa 3,8 GB y contiene tanto el modelo KeyedVectors como el fichero de vectores en formato NumPy float32 de 3.000.000 x 300.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | word2vec (embeddings estaticos de palabras; no es un transformer) |
| Parametros totales | 3.000.000 vectores x 300 dimensiones (900 millones de valores float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embeddings de palabras, sin ventana de contexto generativa) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | gensim KeyedVectors (`.model`) y `.model.vectors.npy` (NumPy float32) |

## Arquitectura y entrenamiento

Se trata de la implementacion original de word2vec descrita por Mikolov et al. en 2013, con vocabulario de 3 millones de palabras y frases y dimensionalidad de 300. El modelo aprende representaciones densas mediante objetivos de prediccion local (CBOW y skip-gram en el trabajo original), aunque la model card no especifica que variante concreta se uso para estos vectores. Las frases se incorporaron con el enfoque guiado por datos descrito en "Distributed Representations of Words and Phrases and their Compositionality", lo que permite representar expresiones multipalabra como una unica entrada del vocabulario.

El entrenamiento se realizo sobre una parte del corpus Google News, aproximadamente 100 mil millones de palabras en ingles. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de embeddings de 2013. La innovacion tecnica relevante en este repositorio es el empaquetado para fse, que permite transformar los vectores de palabra en vectores de frase mediante CBOW averaging, SIF (smooth inverse frequency) y uSIF, ademas de soportar memory-mapping de los vectores para evitar cargarlos enteros en RAM.

## Capacidades

- Representacion estatica de palabras y frases en ingles en un espacio vectorial de 300 dimensiones.
- Calculo de similitud semantica entre palabras y entre frases (coseno sobre vectores agregados).
- Generacion de embeddings de frase mediante CBOW averaging, SIF y uSIF a traves de la libreria fse.
- Soporte de memory-mapping (`Vectors.from_pretrained(..., mmap="r")`) para reducir el consumo de RAM.
- Aritmetica vectorial clasica sobre palabras (analogias del tipo rey - hombre + mujer).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica ligera: indexar documentos y consultas como vectores de frase con SIF y recuperar por similitud coseno, sin necesidad de GPUs ni de modelos transformer.
- Clasificacion de texto con recursos limitados: usar los embeddings de frase como caracteristicas de entrada para clasificadores lineales o SVM en tareas de moderacion o etiquetado.
- Deduplicacion y clustering de documentos: agrupar noticias o tickets por similitud semantica usando los vectores agregados de cada texto.
- Sistemas de recomendacion basados en contenido: representar titulos o descripciones y calcular afinidad entre elementos con un coste computacional muy bajo.
- Linea base en investigacion de NLP: comparar el rendimiento de embeddings estaticos frente a modelos contextuales en tareas de STS o similitud semantica.
- Extraccion de entidades y expansion de consultas: aprovechar las analogias y vecinos mas cercanos para enriquecer consultas o generar sinonimos en ingles.
- Prototipado rapido en entornos sin GPU: al ser un modelo de embeddings, se ejecuta en CPU con un consumo de memoria moderado gracias al memory-mapping.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los vectores completos en float32 ocupan aproximadamente 3,6 GB en RAM si se cargan enteros.
- Memoria RAM: con memory-mapping (`mmap="r"`) el consumo residente se reduce y solo se cargan las paginas consultadas.
- GPU recomendadas: no aplica; el modelo esta pensado para ejecucion en CPU.
- Cabe en cualquier equipo consumer con suficiente RAM o disco para el memory-mapping; no necesita GPU dedicada.
- Opciones de despliegue: libreria fse (version `fse<2` para este repositorio) sobre gensim; para fse 2.0 existe `fse/word2vec-google-news-300-raw`.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una operacion de lookup y agregacion, la latencia depende del numero de tokens por frase y del acceso a los vectores.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Vocabulario | Contexto | Licencia |
|---|---|---|---|---|---|
| fse/word2vec-google-news-300 | word2vec estatico | 300 | 3.000.000 palabras y frases | no aplica | Apache 2.0 |
| GloVe (Stanford) | embeddings estaticos | 50, 100, 200, 300 | variable segun version | no aplica | licencia propia de GloVe |
| fastText (Facebook) | embeddings con subpalabras | 300 | variable | no aplica | MIT |
| Modelos de embeddings de frase tipo sentence-transformers | transformer | 384-1024 | no aplica | 256-512 tokens | variable |

La comparacion con modelos contextuales modernos no es directa: word2vec genera un unico vector por palabra independientemente del contexto, mientras que los sentence-transformers producen representaciones contextualizadas con mayor rendimiento en tareas de similitud semantica, a cambio de un coste computacional mucho mayor.

## Limitaciones y advertencias

- Los vectores son estaticos: una misma palabra recibe el mismo vector en todos los contextos, lo que limita la desambiguacion semantica.
- Solo cubre ingles; no hay soporte documentado para otros idiomas.
- El corpus Google News puede introducir sesgos de dominio (noticias) y sesgos sociales o demograficos presentes en los datos originales.
- No es un modelo generativo: no produce texto y no puede alucinar en el sentido habitual, pero la agregacion de vectores puede dar similitudes poco fiables en frases largas o fuera de dominio.
- El repositorio usa la API de fse 1.x y requiere `fse<2`; para fse 2.0 hay que migrar a `fse/word2vec-google-news-300-raw`.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del proyecto word2vec original de Google al redistribuir los vectores.
- El tamano del repositorio (3,8 GB) y de los vectores en RAM (3,6 GB) puede ser un cuello de botella en entornos con memoria limitada si no se usa memory-mapping.
- No dispone de soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/fse/word2vec-google-news-300
- Version para fse 2.0: https://huggingface.co/fse/word2vec-google-news-300-raw
- Repositorio fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Guia de migracion de fse: https://github.com/oborchers/Fast_Sentence_Embeddings/blob/master/docs/migrating-from-1x.md
- Paper original word2vec: https://arxiv.org/abs/1301.3781
- Paper de frases y composicionalidad: https://arxiv.org/abs/1310.4546
- Proyecto word2vec de Google: https://code.google.com/archive/p/word2vec/
- Web del mantenedor: https://www.drborchers.com/
