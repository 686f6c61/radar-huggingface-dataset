# fse/glove-wiki-gigaword-100

## Resumen

GloVe Wikipedia + Gigaword (100 dimensiones) es un conjunto de vectores de palabras preentrenados publicado originalmente por el Stanford NLP Group y redistribuido en este repositorio por fse (Fast Sentence Embeddings) en formato gensim. No es un modelo generativo ni un transformer: se trata de embeddings estaticos de palabras obtenidos mediante el algoritmo GloVe (Global Vectors for Word Representation), que factoriza una matriz de coocurrencias globales para producir representaciones densas de 100 dimensiones para 400.000 palabras del ingles.

El paquete esta pensado para integrarse con la libreria fse, que convierte vectores de palabras en vectores de frases mediante estrategias de agregacion como CBOW averaging, SIF (Smooth Inverse Frequency) y uSIF. De este modo, un recurso clasico de embeddings de palabras se reutiliza como encoder de frases ligero, sin necesidad de GPU ni de infraestructura de inferencia de transformers.

Su relevancia actual es la de una linea base barata y determinista para tareas de similitud semantica, clustering de textos, recuperacion lexica y sistemas de recomendacion basados en contenido, alli donde un modelo generativo resultaria sobredimensionado. El repositorio ocupa unos 0,2 GB y los vectores en crudo son 400.000 x 100 float32 (160 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (GloVe, factorizacion de matriz de coocurrencias globales); no es un transformer |
| Parametros totales | 400.000 vectores x 100 dimensiones (40 millones de valores float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo autoregresivo; el alcance es la frase que se agrega) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | gensim `KeyedVectors` (`.model`) mas `.model.vectors.npy` (400.000 x 100 float32) |

## Arquitectura y entrenamiento

GloVe no es una red neuronal profunda secuencial: construye una matriz de coocurrencias palabra-palabra a partir de un corpus y la factoriza con un objetivo de minimos cuadrados ponderados, de modo que el producto escalar de dos vectores aproxima el logaritmo de su probabilidad de coocurrencia. Los vectores de este repositorio se entrenaron sobre Wikipedia 2014 y Gigaword 5, con un total de 6.000 millones de tokens, vocabulario en minusculas (uncased) y 400.000 entradas de 100 dimensiones. Segun la model card, la publicacion original corresponde a Pennington, Socher y Manning (2014).

La capa que anade fse es la agregacion a nivel de frase: CBOW averaging, SIF y uSIF combinan los vectores de las palabras de una oracion en un unico vector de frase. SIF aplica pesos inversamente proporcionales a la frecuencia y elimina la primera componente principal para mejorar la calidad de la representacion. No hay entrenamiento adicional, RLHF ni ajuste fino: el recurso es puramente estatico y determinista.

## Capacidades

- Representacion de palabras en ingles: vectores de 100 dimensiones para 400.000 entradas del vocabulario.
- Representacion de frases y oraciones mediante CBOW averaging, SIF y uSIF a traves de la libreria fse.
- Calculo de similitud semantica entre palabras y entre frases (producto escalar o coseno).
- Clustering y clasificacion de textos por similitud vectorial.
- Carga con memory mapping (`mmap="r"`) para reducir el consumo de RAM.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (vision, audio) ni modo de pensamiento.
- Capacidad multilingue limitada al ingles; no se documentan otros idiomas.

## Casos de uso

- Busqueda semantica ligera: indexar documentos como vectores de frase con SIF y recuperar por similitud coseno en un motor vectorial, sin GPU y con huella de memoria reducida (160 MB de vectores).
- Deduplicacion y near-duplicate detection: comparar titulares o parrafos de un corpus en ingles mediante similitud de embeddings de frase para filtrar duplicados antes de un pipeline de entrenamiento.
- Clustering de tickets o resenas: agrupar textos de soporte o feedback de usuarios por tematica usando k-means sobre vectores de frase, como paso previo a un etiquetado supervisado.
- Linea base en evaluacion de embeddings: referencia rapida y reproducible para comparar contra encoders neuronales en benchmarks de STS, tal como mantiene el propio proyecto fse.
- Sistemas de recomendacion basados en contenido: representar descripciones de productos o articulos en ingles y recomendar por cercania semantica sin depender de un modelo generativo.
- Clasificacion de texto con modelos clasicos: usar los embeddings como caracteristicas de entrada para regresion logistica o SVM en tareas de moderacion o enrutado, con entrenamiento en CPU.
- Prototipado y ensenanza: ejemplo minimo y de bajo coste para ilustrar como funcionan los embeddings estaticos y las estrategias de agregacion SIF/uSIF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de Fast Sentence Embeddings, que mantiene un benchmark STS de todos los conjuntos de vectores de la organizacion, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es puramente CPU.
- RAM: aproximadamente 160 MB para los vectores float32 en memoria; con `mmap="r"` el consumo residente se reduce y el sistema operativo gestiona la paginacion.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos sin acelerador.
- Opciones de despliegue: libreria fse (`pip install "fse<2"`) con gensim; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una operacion de media ponderada sobre vectores de 100 dimensiones, el coste por frase es muy bajo en comparacion con un transformer.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-100 | GloVe estatico + agregacion fse | 100 | 400.000 palabras | no aplica | PDDL | Hugging Face (este repo) |
| GloVe original (Stanford NLP) | GloVe estatico | 50, 100, 200, 300 | hasta 2,2 M palabras (segun variante) | no aplica | PDDL | Descarga directa de Stanford NLP |
| word2vec (Google) | Embeddings estaticos | 300 | aproximadamente 3 M palabras | no aplica | no disponible en la informacion | Distribucion original de Google |
| fastText (Facebook) | Embeddings estaticos con subpalabras | 300 | multilingue (157 idiomas) | no aplica | MIT (segun distribucion original) | Distribucion original de Facebook |

Las cifras de GloVe, word2vec y fastText corresponden a sus distribuciones originales ampliamente conocidas; no se dispone en la informacion proporcionada de una comparacion de rendimiento medida entre ellos.

## Limitaciones y advertencias

- Solo ingles: el vocabulario esta en minusculas y limitado al ingles; cualquier otro idioma queda fuera de vocabulario.
- Sin contexto: cada palabra tiene un unico vector, por lo que no se desambigua el sentido segun la frase (polysemy no resuelta).
- Vocabulario cerrado: palabras fuera de las 400.000 entradas no se representan; no hay subpalabras como en fastText, lo que penaliza errores ortograficos y morfologia poco frecuente.
- Agregacion de bolsa de palabras: SIF y CBOW ignoran el orden de las palabras, por lo que la representacion de frases pierde informacion sintactica.
- Sin generacion ni razonamiento: no puede usarse para tareas generativas, agentes, tool calling ni codigo.
- Riesgo de sesgo: los embeddings estaticos heredan sesgos de genero, raza y otros presentes en Wikipedia 2014 y Gigaword 5.
- Licencia PDDL: permite uso comercial y redistribucion, pero conviene revisar los terminos de la Public Domain Dedication and License antes de integrarlo en un producto.
- Dependencia de version: el repositorio usa la API de fse 1.x y requiere `fse<2`; con fse 2.0 hay que migrar a un encoder del catalogo clasico.
- No apto como sustituto de un encoder neuronal en tareas de alta precision semantica; su papel es el de linea base o componente auxiliar de bajo coste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-100
- Paper original de GloVe: https://nlp.stanford.edu/pubs/glove.pdf
- Pagina de GloVe en Stanford NLP: https://nlp.stanford.edu/projects/glove/
- Repositorio de Fast Sentence Embeddings: https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentacion de gensim: https://radimrehurek.com/gensim/
- Catalogo de modelos clasicos de fse 2.0: https://github.com/oborchers/Fast_Sentence_Embeddings/blob/master/docs/models.md
- Guia de migracion desde fse 1.x: https://github.com/oborchers/Fast_Sentence_Embeddings/blob/master/docs/migrating-from-1x.md
- Licencia PDDL: https://opendatacommons.org/licenses/pddl/
- Sitio del autor de fse: https://www.drborchers.com/
