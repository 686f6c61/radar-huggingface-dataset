# fse/glove-wiki-gigaword-200

## Resumen

`fse/glove-wiki-gigaword-200` es un conjunto de vectores de palabras GloVe de 200 dimensiones para 400.000 palabras en inglés, empaquetado en formato gensim `KeyedVectors` y redistribuido por el proyecto fse (Fast Sentence Embeddings) de Oliver Borchers. Los vectores originales fueron entrenados por el Stanford NLP Group con el algoritmo GloVe sobre Wikipedia 2014 y Gigaword 5 (6.000 millones de tokens, texto sin distinguir mayúsculas). No es un modelo generativo ni un transformer: es una matriz de embeddings estáticos de 400.000 × 200 valores float32 (unos 320 MB).

Su funcion utilidad practica es doble. Por un lado, sirve como tabla de embeddings de palabras para modelos downstream y como base para calcular similitud lexica y analogias. Por otro, el paquete fse lo convierte en un encoder de frases muy ligero mediante promediado CBOW, SIF (smooth inverse frequency) y uSIF, lo que permite obtener vectores de frase sin GPU y sin dependencias de pesos neuronales.

Es relevante ahora como linea base barata y reproducible: para busqueda semantica, clasificacion de texto o clustering en entornos con poca memoria, ofrece un coste de inferencia de microsegundos por frase y una licencia de dominio publico (PDDL) que elimina friccion legal en uso comercial. Su limitacion principal es que cada palabra tiene un unico vector, independientemente del contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GloVe (factorizacion de matriz de co-ocurrencia global con minimos cuadrados ponderados); no es un transformer |
| Parametros totales | 80.000.000 valores float32 (400.000 vectores × 200 dimensiones), ~320 MB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo; no tiene ventana de contexto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen unicamente en float32 |
| Idiomas soportados | ingles (texto sin distinguir mayusculas/minusculas) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | gensim `KeyedVectors`: `glove-wiki-gigaword-200.model` (vocabulario y metadatos) + `glove-wiki-gigaword-200.model.vectors.npy` (matriz float32) |

## Arquitectura y entrenamiento

GloVe (Pennington, Socher y Manning, 2014) no es una red neuronal profunda ni un transformer: entrena representaciones a partir de la matriz de co-ocurrencia global del corpus, optimizando una regresion de minimos cuadrados ponderada sobre los logaritmos de las frecuencias de co-ocurrencia, con una funcion de ponderacion que atenua los pares muy frecuentes y los muy raros. El resultado es una tabla de 400.000 vectores de 200 dimensiones, uno por forma lexica, sin informacion posicional ni mecanismo de atencion.

Los datos de entrenamiento son Wikipedia 2014 y Gigaword 5, con un total de 6.000 millones de tokens, vocabulario de 400.000 palabras en ingles y normalizacion a minusculas. No consta en la informacion disponible que se haya aplicado RLHF, DPO ni ajuste fino posterior; son vectores puramente estadisticos. La innovacion del paquete fse no esta en los pesos, sino en el envoltorio: implementa CBOW promedio, SIF y uSIF para derivar un vector de frase a partir de los vectores de palabra, con soporte de `mmap="r"` para mapear la matriz en memoria en lugar de cargarla en RAM.

## Capacidades

- Representacion de palabras en ingles: un vector denso de 200 dimensiones por cada una de las 400.000 entradas del vocabulario.
- Similitud lexica y semantica mediante coseno entre vectores de palabra.
- Aritmetica de vectores (analogias del tipo rey - hombre + mujer), limitada por la calidad de los embeddings estaticos.
- Construccion de embeddings de frase con tres estrategias: CBOW promedio, SIF (ponderacion por frecuencia inversa suavizada) y uSIF.
- Extraccion de caracteristicas para clasificadores clasicos (regresion logistica, SVM, gradient boosting) sobre texto en ingles.
- Base para clustering, deduplicacion y busqueda por similitud aproximada sobre documentos cortos.
- Carga eficiente en memoria mediante `mmap`, util para procesos con RAM limitada.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene modo "thinking" ni capacidades multimodales.

## Casos de uso

- Busqueda semantica ligera en ingles: indexar documentos con vectores de frase SIF/uSIF y recuperar por similitud coseno; adecuado cuando no se dispone de GPU y el corpus es de titulares, descripciones cortas o tickets.
- Clasificacion de texto con modelos clasicos: promediar los vectores de las palabras de cada documento y entrenar una regresion logistica o un SVM encima; el coste de features es de milisegundos por lote y no requiere infraestructura de inferencia neuronal.
- Deduplicacion y near-duplicate detection: comparar vectores de frase de articulos, productos o FAQs y marcar pares por encima de un umbral de coseno, con la ventaja de que el umbral es estable y barato de calibrar.
- Clustering de resenas o encuestas: agrupar respuestas cortas en ingles con k-means sobre los vectores de frase para descubrir temas recurrentes antes de un analisis manual.
- Linea base reproducible en investigacion: usar los vectores como referencia inferior en experimentos de sentence embeddings y comparar contra modelos neuronales, aprovechando que el resultado es determinista y no depende de semillas de entrenamiento.
- Prototipado y entornos sin red: al ocupar 320 MB y funcionar en CPU, el modelo se puede empaquetar en un contenedor pequeno o en un dispositivo con recursos limitados para demos y pruebas offline.
- Features auxiliares en pipelines de NLP: incorporar los vectores como entrada adicional en modelos de NER o analisis de sentimiento que ya dispongan de otras senales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los tags no incluyen cifras de MMLU, HumanEval, GSM8K ni de similitud semantica; el repositorio de fse menciona un benchmark STS de todos los conjuntos de vectores de la organizacion, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM: no requiere GPU. Los 320 MB de la matriz de vectores residen en RAM o en disco mediante `mmap`.
- Memoria RAM estimada: ~320 MB para la matriz float32 mas la sobrecarga del objeto `KeyedVectors` de gensim (vocabulario y estructuras auxiliares).
- GPU recomendadas: ninguna. El calculo es un producto matriz-vector de 200 dimensiones por token, resoluble en CPU.
- Cabe en cualquier equipo consumer: portatiles, Raspberry Pi y contenedores con 1 GB de RAM; con `mmap="r"` el consumo residente puede reducirse a las paginas efectivamente accedidas.
- Opciones de despliegue: libreria `fse` (`pip install fse`) sobre gensim; tambien se puede consumir directamente como `KeyedVectors` de gensim. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no se han publicado cifras. Cualitativamente, el coste por frase es el de una suma ponderada de vectores de 200 dimensiones mas la normalizacion, dominado por el tokenizado y la busqueda en el vocabulario.

## Comparativa con modelos similares

| Modelo | Dimensiones | Vocabulario | Parametros (valores float32) | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-200 | 200 | 400.000 | 80.000.000 (~320 MB) | no aplica | PDDL | Objeto de esta ficha; empaquetado gensim + fse |
| GloVe 6B 100d (mismo release) | 100 | 400.000 | 40.000.000 (~160 MB) | no aplica | PDDL | Menor coste de memoria, menor capacidad representacional |
| GloVe 6B 300d (mismo release) | 300 | 400.000 | 120.000.000 (~480 MB) | no aplica | PDDL | Mayor capacidad, mas memoria y latencia |
| word2vec de Google (cbow/skip-gram) | 300 | no disponible en la informacion | no disponible | no aplica | no disponible | Embeddings estaticos alternativos, entrenados con objetivo predictivo |
| fastText (subword) | 300 | no disponible en la informacion | no disponible | no aplica | no disponible | Ventaja en palabras fuera de vocabulario y morfologia |

La comparacion con word2vec y fastText se ofrece solo a nivel cualitativo: no se dispone de sus cifras exactas de vocabulario ni de licencia en la informacion proporcionada.

## Limitaciones y advertencias

- Embeddings estaticos: cada palabra tiene un unico vector, por lo que no se desambigua la polisemia (por ejemplo, "bank" como entidad financiera o ribera).
- Solo ingles y sin distinguir mayusculas: el rendimiento en otros idiomas, incluido el castellano, es practicamente nulo por ausencia de vocabulario.
- Palabras fuera de vocabulario (OOV): al no usar subwords, los errores tipograficos, neologismos y terminos tecnicos recientes no tienen representacion.
- Sensibilidad al dominio: los vectores provienen de Wikipedia y prensa de 2014; el vocabulario y las asociaciones reflejan ese corpus y sus sesgos historicos y culturales.
- Sesgos: al ser entrenamiento puramente co-ocurrencial, puede reproducir estereotipos de genero, nacionalidad u ocupacion presentes en Wikipedia y Gigaword; no se documenta ningun proceso de mitigacion.
- Alucinacion: no aplica en sentido generativo, pero el modelo no verifica hechos; cualquier afirmacion sobre su calidad semantica debe medirse empiricamente en la tarea concreta.
- Sin garantias de rendimiento: no hay cifras publicadas de STS ni de tareas downstream en la informacion disponible; conviene evaluar con el conjunto de validacion propio antes de adoptarlo en produccion.
- Calidad de frase dependiente del metodo: CBOW, SIF y uSIF producen resultados distintos y SIF/uSIF requieren entrenar frecuencias sobre el corpus de destino; un mal ajuste degrada notablemente la similitud.
- Licencia: PDDL dedica la obra al dominio publico y permite uso comercial; aun asi, conviene citar el paper de GloVe y verificar la cadena de atribucion del corpus original.
- Repositorio de autor individual: mantenido por un unico autor (Dr. Oliver Borchers); la libreria fse no tiene el mismo ritmo de mantenimiento que gensim, por lo que hay que fijar versiones en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/fse/glove-wiki-gigaword-200
- Proyecto fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Gensim: https://radimrehurek.com/gensim/
- GloVe, pagina oficial de Stanford NLP: https://nlp.stanford.edu/projects/glove/
- Paper de GloVe (Pennington, Socher, Manning, 2014): https://nlp.stanford.edu/pubs/glove.pdf
- Licencia PDDL (Open Data Commons): https://opendatacommons.org/licenses/pddl/
- Sitio del autor: https://www.drborchers.com/
