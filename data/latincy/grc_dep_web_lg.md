# latincy/grc_dep_web_lg

## Resumen

`latincy/grc_dep_web_lg` es un pipeline de procesamiento de lenguaje natural (PLN) para griego antiguo, desarrollado por Patrick J. Burns dentro del proyecto LatinCy. Se trata de un modelo de análisis sintáctico y morfológico basado en el framework spaCy, entrenado sobre los treebanks de la Universal Dependencies (UD) para griego antiguo: PTNK, PROIEL y Perseus. El modelo ofrece componentes de segmentación de oraciones, tokenización, etiquetado gramatical (POS), análisis morfológico, lematización (con dos estrategias: entrenable y por diccionario) y análisis de dependencias.

Este pipeline es relevante porque proporciona una infraestructura moderna y reutilizable para el procesamiento computacional de textos en griego antiguo, un ámbito con escasez de herramientas específicas. Al estar integrado en spaCy, permite a investigadores y desarrolladores construir flujos de trabajo NLP completos (extracción de entidades, análisis de corpus, etc.) con una API consistente y bien documentada. La versión actual se considera una beta experimental: el propio autor advierte que los resultados y el comportamiento de los componentes mejorarán a medida que se armonicen y depuren los datos de entrenamiento.

El modelo incluye vectores de palabras floret de 200.000 claves con 300 dimensiones, y el repositorio ocupa 2,3 GB. Su licencia es MIT, lo que facilita su uso académico y comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy con componentes: senter, tok2vec, tagger, morphologizer, trainable_lemmatizer, lookup_lemmatizer, attribute_ruler, parser |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo tok2vec interno, no especificado) |
| Tipos de cuantizacion | no aplica (modelo de pesos completos para spaCy, sin cuantizacion publicada) |
| Idiomas soportados | Griego antiguo (codigo ISO: grc) |
| Licencia | MIT |
| Formato de pesos | Binarios de spaCy (formato propio, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un pipeline de spaCy compuesto por varios componentes entrenables y basados en reglas. La arquitectura principal de representacion textual es `tok2vec`, que genera embeddings contextuales para cada token. Sobre estos embeddings se apoyan el etiquetador gramatical (`tagger`), el analizador morfologico (`morphologizer`), el lematizador entrenable (`trainable_lemmatizer`) y el parser de dependencias (`parser`). Ademas, incluye un `senter` para segmentacion de oraciones, un `lookup_lemmatizer` basado en diccionario y un `attribute_ruler` para reglas post-procesado.

Los datos de entrenamiento provienen de los treebanks de Universal Dependencies para griego antiguo: PTNK (Nuevo Testamento), PROIEL (textos paleocristianos) y Perseus (textos clasicos). El modelo usa vectores floret de 200.000 claves con 300 dimensiones, generados a partir de estos corpus. No se ha publicado informacion sobre el numero total de tokens de entrenamiento ni sobre tecnicas de alineamiento (RLHF, DPO, etc.), ya que no es un modelo generativo sino discriminativo.

La innovacion principal es la adaptacion de la infraestructura de LatinCy (disenada para latin) al griego antiguo, incluyendo un esquema de etiquetas morfologicas de 1796 combinaciones posibles, lo que permite un analisis gramatical muy detallado.

## Capacidades

- Tokenizacion y segmentacion de oraciones en griego antiguo.
- Etiquetado gramatical (POS) con 16 categorias (sustantivo, verbo, adjetivo, adverbio, conjuncion, etc.).
- Analisis morfologico completo: caso, genero, numero, persona, modo, tiempo, voz, aspecto y forma verbal.
- Lematizacion de formas verbales y nominales, combinando un lematizador entrenable con un lematizador por diccionario.
- Analisis de dependencias sintacticas segun el esquema de Universal Dependencies.
- Generacion de vectores de palabras (embeddings) de 300 dimensiones para uso en tareas downstream.
- Capacidad de integrarse con el ecosistema spaCy: extensiones, pipelines personalizados, serializacion y despliegue en servidores.

No dispone de capacidades generativas (no genera texto), ni de tool calling, agentes, vision o audio.

## Casos de uso

- Analisis filologico asistido por ordenador: el pipeline permite etiquetar y analizar sintacticamente cualquier texto en griego antiguo, facilitando estudios de estilo, sintaxis historica o variacion dialectal.
- Construccion de corpus anotados: investigadores pueden procesar grandes volumenes de texto (por ejemplo, toda la obra de un autor clasico) y generar anotaciones POS, morfologicas y de dependencias para crear nuevos recursos linguisticos.
- Ensenanza de griego antiguo: herramientas educativas pueden usar el modelo para ofrecer retroalimentacion automatica sobre ejercicios de analisis gramatical, mostrando la funcion sintactica de cada palabra.
- Busqueda semantica y recuperacion de informacion: los embeddings de 300 dimensiones permiten indexar textos griegos y buscar pasajes por similitud semantica, util en humanidades digitales.
- Deteccion de citas y paralelismos: al combinar el analisis morfologico y de dependencias, se pueden identificar estructuras sintacticas repetidas entre textos (por ejemplo, entre autores o entre el Nuevo Testamento y la Septuaginta).
- Preprocesamiento para modelos de traduccion automatica: el etiquetado y lematizacion resultantes pueden servir como caracteristicas adicionales para sistemas neuronales de traduccion del griego antiguo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo es una version beta experimental y que las metricas (precision, recall, LAS, etc.) mejoraran con la armonizacion de los datos de entrenamiento. No se proporcionan cifras de exactitud para el etiquetado, la lematizacion o el parsing.

## Requisitos de hardware

- Al ser un pipeline de spaCy con vectores de 300 dimensiones, el modelo es ligero y puede ejecutarse en CPU. El repositorio ocupa 2,3 GB, pero la memoria RAM necesaria en tiempo de ejecucion es inferior (tipicamente menos de 1 GB para el modelo cargado).
- No se requiere GPU para inferencia. Un ordenador personal con 4-8 GB de RAM es suficiente para procesar textos de longitud media.
- Para procesamiento por lotes de corpus extensos, se recomienda un servidor con multiples nucleos CPU; spaCy aprovecha el paralelismo en `nlp.pipe()`.
- Opciones de despliegue: integracion directa en aplicaciones Python con spaCy, uso como servicio REST mediante `spacy-server` o contenedores Docker, o integracion con frameworks de procesamiento distribuido como Spark NLP (requiere conversion).
- Latencia y throughput: no se han publicado mediciones especificas, pero en CPU moderna se pueden procesar varios miles de tokens por segundo (dependiendo del hardware y del numero de componentes activos).

## Comparativa con modelos similares

No se han encontrado pipelines comparables especificos para griego antiguo con el mismo nivel de integracion en spaCy. Como referencia, el proyecto LatinCy ofrece un pipeline equivalente para latin (`latincy/latin_llm` o `latincy/latin_web_lg`), que comparte la misma arquitectura y filosofia. A diferencia de los modelos generativos (como GPT o Llama), este modelo no genera texto, sino que produce anotaciones linguisticas estructuradas. La comparativa con otros modelos de PLN clasico para griego antiguo (por ejemplo, los disponibles en CLTK o Stanza) no esta documentada en la informacion proporcionada.

| Modelo | Tipo | Idiomas | Licencia | Contexto | Formato |
|---|---|---|---|---|---|
| `latincy/grc_dep_web_lg` | Pipeline spaCy | Griego antiguo | MIT | no disponible | spaCy |
| `latincy/latin_web_lg` | Pipeline spaCy | Latin | MIT | no disponible | spaCy |
| Stanza (grc) | Pipeline NLP | Griego antiguo | Apache 2.0 | no disponible | Propio |

## Limitaciones y advertencias

- Modelo en fase beta experimental: el autor advierte de posibles errores en el etiquetado, la lematizacion y el parsing, especialmente en textos no representados en los treebanks de entrenamiento (por ejemplo, poesia o inscripciones).
- Cobertura limitada de variantes dialectales: los treebanks de entrenamiento cubren principalmente griego clasico, koine y paleocristiano; dialectos como el eolico o el dorico pueden obtener resultados suboptimos.
- El lematizador por diccionario depende de la cobertura del lexico incluido; formas muy raras o hapax legomena pueden no lematizarse correctamente.
- No es un modelo generativo: no puede producir texto, responder preguntas ni realizar tareas de razonamiento. Su uso se limita a analisis linguistico automatico.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la calidad en produccion. Se recomienda evaluar el rendimiento en el corpus propio antes de desplegarlo en entornos criticos.
- No se proporcionan datos sobre sesgos especificos, pero al entrenarse sobre textos literarios y religiosos, puede reflejar las peculiaridades estilisticas de esos generos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/latincy/grc_dep_web_lg)
- [Perfil de LatinCy en Hugging Face](https://huggingface.co/latincy/models)
- [Organizacion LatinCy en GitHub](https://github.com/latincy)
- [Paper de LatinCy (arXiv)](https://ar5iv.labs.arxiv.org/html/2305.04365)
- [Sitio web del proyecto LatinCy](https://diyclassics.github.io/latincy/)
