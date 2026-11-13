# alexander-esser/fasttext-cc-300-small

## Resumen

`alexander-esser/fasttext-cc-300-small` es una coleccion de vectores de palabras (word embeddings) estaticos derivados de los vectores oficiales de fastText para Common Crawl (`cc.<lang>.300`, Grave et al., 2018, "Learning Word Vectors for 157 Languages"). El autor ha recortado el vocabulario original a las palabras mas frecuentes de cada idioma y ha empaquetado el resultado como objetos `KeyedVectors` de gensim, lo que permite cargarlos en memoria con `mmap` y reutilizarlos sin necesidad de reconvertir los ficheros `.vec`/`.bin` originales de fastText.

No es un modelo generativo ni un transformer: se trata de representaciones vectoriales de 300 dimensiones por palabra, entrenadas con el algoritmo de skip-gram con subword information (n-gramas de caracteres) de fastText. Su utilidad no esta en generar texto, sino en servir como capa de embeddings ligera para tareas de procesamiento de lenguaje natural clasicas (clasificacion, similitud lexica, busqueda semantica de vocabulario cerrado, features para modelos supervisados) y como alternativa de bajo coste computacional frente a embeddings contextuales.

El repositorio ocupa aproximadamente 0,6 GB y esta publicado bajo licencia CC BY-SA 3.0, la misma que los vectores originales de Facebook. Es relevante para quienes necesitan embeddings multilingues preentrenados sin depender de infraestructura de GPU ni de APIs externas, y para quienes trabajan con pipelines que ya usan gensim. El autor y fecha de creacion indicados en la ficha de Hugging Face son `alexander-esser` y 2026-11-13 respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Skip-gram con subword information (fastText), embeddings estaticos de palabras |
| Parametros totales | no disponible (vocabulario reducido de palabras frecuentes; dimension 300) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; embeddings por palabra) |
| Tipos de cuantizacion | no disponible (vectores float32 en formato gensim `KeyedVectors`) |
| Idiomas soportados | no disponible en la model card; los vectores originales cubren 157 idiomas, el subconjunto incluido no se especifica |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | `KeyedVectors` de gensim (ficheros `.kv`), cargables con `mmap="r"` |

## Arquitectura y entrenamiento

Los vectores subyacentes proceden de fastText (Bojanowski et al., 2017), que entrena representaciones de palabras mediante skip-gram con informacion de subpalabras: cada palabra se representa como la suma de embeddings de sus n-gramas de caracteres, lo que permite obtener vectores para palabras fuera de vocabulario (OOV) y capturar morfologia. Los vectores `cc.<lang>.300` de Grave et al. (2018) se entrenaron sobre Common Crawl y Wikipedia para 157 idiomas, con dimension 300.

Este repositorio concreto no reentrena nada: toma los vectores oficiales de `facebook/fasttext-<lang>-vectors`, filtra las palabras mas frecuentes de cada idioma y los serializa como `KeyedVectors` de gensim. No hay informacion en la model card sobre el umbral exacto de frecuencia, el numero de palabras retenidas por idioma, ni la lista concreta de idiomas incluidos en este subconjunto reducido.

## Capacidades

- Representacion vectorial estatica de palabras en 300 dimensiones.
- Manejo de palabras fuera de vocabulario mediante n-gramas de caracteres (propiedad heredada de fastText), siempre que se use el modelo fastText original con subword information; el empaquetado como `KeyedVectors` solo conserva los vectores de palabras del vocabulario reducido.
- Calculo de similitud coseno entre palabras y operaciones vectoriales clasicas (analogias, vecinos mas cercanos).
- Uso como capa de embeddings de entrada para modelos supervisados (clasificadores, CRF, redes recurrentes pequenas).
- Capacidades multilingues: potencialmente, segun los idiomas incluidos en el subconjunto (no especificados en la model card).
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Clasificacion de texto ligera: usar los vectores como features de entrada (promedio de embeddings por documento) para clasificadores lineales o SVM en tareas de moderacion, etiquetado de topics o deteccion de spam, con coste de inferencia minimo en CPU.
- Busqueda lexica y similitud de terminos: construir indices de vecinos mas cercanos (p. ej. con FAISS o Annoy) sobre el vocabulario reducido para resolver consultas de "palabras similares" o expansión de queries en motores de busqueda internos.
- Normalizacion y enriquecimiento de vocabulario: agrupar variantes ortograficas, sinonimos y errores tipicos en pipelines de limpieza de datos, aprovechando la similitud coseno entre vectores.
- Features para modelos downstream en entornos con recursos limitados: cuando no hay GPU disponible, estos embeddings permiten entrenar clasificadores competitivos en CPU para tareas de PNL clasicas.
- Prototipado rapido de sistemas de recomendacion de contenido: representar titulos o etiquetas como promedio de embeddings y calcular similitud entre items para un primer baseline antes de invertir en embeddings contextuales.
- Analisis de sesgo lexico y estudios linguisticos: medir distancias entre grupos de palabras (genero, profesiones, nacionalidades) sobre un vocabulario controlado y de tamano manejable.
- Cache de embeddings en produccion: al cargarse con `mmap="r"`, el fichero puede compartirse entre procesos sin duplicar memoria, util para servicios de bajo trafico que necesitan representaciones de palabras sin depender de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; los embeddings se cargan en RAM y se consultan en CPU.
- RAM estimada: el repositorio ocupa 0,6 GB; con `mmap="r"` el consumo residente puede ser menor que la carga completa, dependiendo del acceso a las claves.
- GPU recomendadas: no aplica; no hay inferencia neuronal. Cualquier GPU solo seria util si se usan los vectores como entrada de un modelo downstream.
- Cabe en cualquier equipo consumer: portatiles, Raspberry Pi y contenedores con poca memoria, siempre que se disponga de ~0,6 GB de almacenamiento y RAM suficiente para el subconjunto cargado.
- Despliegue: gensim (`KeyedVectors.load`), con soporte de `mmap="r"` para lectura compartida. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; dependen del hardware y del patron de acceso. Las busquedas de vecinos mas cercanos sobre el vocabulario reducido son operaciones de CPU de orden milisegundos con indices ANN.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Vocabulario | Licencia | Formato |
|---|---|---|---|---|---|
| `alexander-esser/fasttext-cc-300-small` | Embeddings estaticos fastText reducidos | 300 | subconjunto de palabras frecuentes (tamano no especificado) | CC BY-SA 3.0 | `KeyedVectors` gensim |
| `facebook/fasttext-en-vectors` (original) | Embeddings estaticos fastText | 300 | vocabulario completo (~2M palabras en ingles) | CC BY-SA 3.0 | `.vec` / `.bin` fastText |
| `word2vec-google-news-300` | Embeddings estaticos word2vec | 300 | ~3M palabras | Licencia propia de Google, uso limitado | binario word2vec |
| `glove-wiki-gigaword-300` | Embeddings estaticos GloVe | 300 | ~400k palabras | Dominio publico (PDDL) | texto GloVe |

La ventaja frente a los originales de fastText es el menor tamano y la carga directa con gensim; la desventaja es la perdida de cobertura de vocabulario y de la funcionalidad de subword del modelo fastText completo. Frente a word2vec y GloVe, la licencia CC BY-SA 3.0 es mas permisiva para uso comercial que la de Google News, aunque impone obligaciones de compartir-al-igual.

## Limitaciones y advertencias

- Embeddings estaticos: cada palabra tiene un unico vector, por lo que no se desambigua el sentido segun el contexto (polysemia). Para tareas sensibles al contexto conviene usar embeddings contextuales.
- Al ser un subconjunto reducido, la cobertura de vocabulario es limitada; palabras poco frecuentes, neologismos, nombres propios y errores ortograficos pueden no estar representados.
- La model card no especifica que idiomas ni cuantas palabras por idioma incluye el subconjunto, lo que dificulta evaluar su idoneidad para un caso concreto sin inspeccionar el fichero.
- No se han publicado evaluaciones de calidad (similitud, analogias, cobertura) en la informacion disponible.
- Riesgo de sesgos: los vectores originales de Common Crawl heredan sesgos de genero, raza, nacionalidad y otros presentes en los corpus web; no se documenta ningun proceso de mitigacion.
- Licencia CC BY-SA 3.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. Conviene revisar las implicaciones si se redistribuyen los vectores o se empaquetan en un producto.
- No apto para generacion de texto, razonamiento, codigo ni tareas de agente; no debe presentarse como un LLM.
- La fecha de creacion indicada (2026-11-13) y el hecho de que el repositorio tenga 0 descargas y 0 likes sugieren que es un artefacto reciente y sin validacion comunitaria; conviene verificar su contenido antes de usarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alexander-esser/fasttext-cc-300-small
- Vectores originales de fastText: https://huggingface.co/facebook/fasttext-en-vectors
- Paper de fastText (Bojanowski et al., 2017): https://arxiv.org/abs/1607.04606
- Paper de vectores para 157 idiomas (Grave et al., 2018): https://arxiv.org/abs/1802.06893
- Documentacion de gensim `KeyedVectors`: https://radimrehurek.com/gensim/models/keyedvectors.html
- Repositorio de fastText: https://github.com/facebookresearch/fastText
