# latincy/grc_dep_web_sm

## Resumen

`latincy/grc_dep_web_sm` es un pipeline de procesamiento de lenguaje natural (NLP) para griego antiguo, desarrollado por Patrick J. Burns dentro del proyecto LatinCy, especializado en la creación de pipelines sintéticos para lenguas clásicas con spaCy. A diferencia de los modelos de lenguaje generativos, este es un pipeline completo de análisis lingüístico que incluye segmentación de oraciones, tokenización, etiquetado gramatical (POS), análisis morfológico, lematización y parsing de dependencias. Está entrenado sobre los treebanks de Universal Dependencies (UD) para griego antiguo: PTNK, PROIEL y Perseus.

El modelo resuelve el problema del análisis automático de textos en griego antiguo, una lengua con morfología compleja y escasez de recursos digitales. Su relevancia radica en que permite a filólogos, historiadores y desarrolladores de humanidades digitales procesar corpus extensos de forma automática, sin necesidad de anotación manual. La versión actual (3.8.4) requiere spaCy 3.8.11 o superior, y el repositorio ocupa 0.4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de spaCy (no transformer): tok2vec, tagger, morphologizer, lematizadores, parser, senter |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa oraciones, no secuencias largas) |
| Tipos de cuantizacion | no aplica (modelo clásico de NLP, no requiere cuantización) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | MIT |
| Formato de pesos | Paquete binario de spaCy (`.whl` o `.tar.gz`) con pesos serializados en formato nativo |

## Arquitectura y entrenamiento

El modelo es un pipeline de spaCy compuesto por ocho componentes en orden: `senter` (segmentador de oraciones), `tok2vec` (embedding contextual de tokens), `tagger` (etiquetado POS), `morphologizer` (análisis morfológico completo), `trainable_lemmatizer` (lematizador entrenable), `lookup_lemmatizer` (lematizador por diccionario), `attribute_ruler` (reglas de atributos) y `parser` (parser de dependencias). No utiliza arquitectura transformer; `tok2vec` genera representaciones basadas en subword y características léxicas, lo que lo hace ligero y rápido en CPU.

El entrenamiento se realizó sobre los tres treebanks de Universal Dependencies para griego antiguo: PTNK (Nuevo Testamento), PROIEL (textos paleocristianos) y Perseus (literatura clásica). El esquema de etiquetas incluye 1796 etiquetas para tres componentes (tagger, morphologizer y parser), lo que refleja la riqueza morfológica del griego (casos, géneros, tiempos, voces, modos). No se menciona el uso de RLHF ni DPO, al ser un modelo supervisado clásico.

## Capacidades

- Etiquetado gramatical (POS tagging) con 16 categorías: adjetivo, adverbio, conjunción, determinante, interjección, nombre, número, partícula, preposición, pronombre, nombre propio, verbo, etc.
- Análisis morfológico completo: asigna rasgos como caso, género, número, persona, tiempo, modo, voz y aspecto para cada token.
- Lematización: dos estrategias combinadas (entrenable y por diccionario) para obtener la forma canónica de cada palabra.
- Parsing de dependencias: análisis sintáctico de las relaciones entre palabras según el esquema de Universal Dependencies.
- Segmentación de oraciones: detección automática de límites oracionales mediante el componente `senter`.
- Tokenización adaptada a la ortografía griega: manejo de signos diacríticos, puntuación y caracteres especiales.
- Procesamiento por lotes: al ser un pipeline de spaCy, soporta `nlp.pipe()` para procesar grandes corpus de forma eficiente.

## Casos de uso

- Investigación filológica: análisis morfosintáctico automatizado de textos clásicos griegos (Homero, Platón, Jenofonte) para estudios de estilo, frecuencia de construcciones o evolución diacrónica.
- Edición digital de textos: preprocesamiento de corpus para crear ediciones críticas anotadas, con lematización y etiquetado POS que facilitan búsquedas semánticas y concordancias.
- Enseñanza de griego antiguo: generación automática de ejercicios de análisis gramatical para estudiantes, mostrando categorías morfológicas de cada palabra.
- Humanidades digitales: integración en pipelines de minería de texto para extraer entidades, relaciones y patrones sintácticos en grandes colecciones de textos griegos.
- Análisis de variantes textuales: comparación de diferentes manuscritos o ediciones mediante la normalización morfológica y lematización que ofrece el pipeline.
- Desarrollo de recursos lingüísticos: creación de nuevos treebanks anotados a partir de textos sin etiquetar, usando las predicciones del modelo como pre-anotación que luego se revisa manualmente.
- Aplicaciones de búsqueda semántica: indexación de textos griegos por lemas y rasgos morfológicos para motores de búsqueda especializados en lenguas clásicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El autor reporta métricas para sus pipelines de latín (LatinCy) —POS tagging 97.41%, lematización 94.66%, etiquetado morfológico 92.76%—, pero estos datos corresponden a modelos entrenados en latín, no en griego antiguo. No se deben extrapolar sin verificación.

## Requisitos de hardware

- Inferencia en CPU: el modelo es ligero (0.4 GB en disco) y no requiere GPU. Un procesador moderno de escritorio puede procesar cientos de oraciones por segundo.
- Memoria RAM: estimada entre 1-2 GB para cargar el pipeline y procesar documentos de tamaño medio.
- GPU: no necesaria; el pipeline no está optimizado para aceleración por GPU.
- Despliegue: se instala como paquete de spaCy (`pip install grc_dep_web_sm-3.8.4-py3-none-any.whl` o mediante `spacy download`). Funciona con la API estándar de spaCy (`spacy.load("grc_dep_web_sm")`).
- Compatibilidad: requiere spaCy >=3.8.11 y <3.9.0. No compatible con versiones anteriores.
- Throughput: no se han publicado cifras exactas, pero al no usar transformer, es significativamente más rápido que modelos basados en BERT o similares.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| `latincy/grc_dep_web_sm` | Pipeline spaCy | Griego antiguo | MIT | spaCy | no disponible |
| `stanza` (Stanford NLP) para griego antiguo | Pipeline neuronal | Griego antiguo | Apache 2.0 | Stanza | no disponible |
| `udpipe` para griego antiguo | Pipeline neuronal | Griego antiguo | MPL 2.0 | UDPipe | no disponible |

No se dispone de comparativas cuantitativas publicadas entre estos modelos para griego antiguo. La elección entre ellos dependerá de la integración deseada (spaCy vs. otras librerías) y de la familiaridad del equipo con cada ecosistema.

## Limitaciones y advertencias

- Entrenamiento en dominios específicos: los treebanks de UD para griego antiguo cubren principalmente textos del Nuevo Testamento (PTNK), literatura paleocristiana (PROIEL) y textos clásicos (Perseus). El modelo puede tener peor rendimiento en textos de épocas o géneros no representados (p. ej., papiros documentales, inscripciones).
- Sin soporte para variantes dialectales: el griego antiguo incluye dialectos (ático, jónico, dórico, eólico) que difieren en morfología y sintaxis. El modelo no distingue entre ellos explícitamente.
- Dependencia de spaCy: el pipeline solo funciona dentro del ecosistema spaCy, lo que limita su uso en entornos que requieran otras librerías.
- Sin capacidad generativa: no es un modelo de lenguaje; no puede generar texto ni completar oraciones. Solo realiza análisis lingüístico.
- Sin vectores de palabras: el modelo no incluye word embeddings (0 keys, 0 unique vectors), por lo que no se puede usar para similitud semántica entre palabras.
- Riesgo de errores en lematización: la combinación de lematizador entrenable y lookup puede fallar en formas poco frecuentes o hapax legomena, comunes en textos fragmentarios.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la precisión en dominios no cubiertos por los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latincy/grc_dep_web_sm
- Repositorio del modelo (archivos): https://huggingface.co/latincy/grc_dep_web_sm/tree/main
- Organización LatinCy en GitHub: https://github.com/latincy
- Repositorio de modelos spaCy: https://github.com/explosion/spacy-models
