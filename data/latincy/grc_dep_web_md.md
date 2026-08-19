# latincy/grc_dep_web_md

## Resumen

`grc_dep_web_md` es un pipeline de procesamiento de lenguaje natural para griego antiguo desarrollado por Patrick J. Burns dentro del proyecto LatinCy, una serie de modelos de spaCy orientados a lenguas clásicas. Este pipeline, publicado en versión beta experimental, es el primero de una generación de modelos que trasladan la infraestructura de los pipelines de latín de LatinCy al griego antiguo. Está entrenado sobre los treebanks de Universal Dependencies para griego antiguo (PTNK, PROIEL y Perseus) e incluye componentes para segmentación de oraciones, etiquetado gramatical, análisis morfológico, lematización y análisis sintáctico de dependencias.

El modelo se distribuye como un paquete compatible con spaCy 3.8.x y utiliza vectores floret de 300 dimensiones con 50 000 claves únicas. Aunque no es un modelo generativo de lenguaje, resuelve tareas fundamentales de anotación lingüística para textos clásicos, lo que lo hace relevante para filología, humanidades digitales y enseñanza del griego antiguo. Su licencia MIT permite uso comercial sin restricciones, y al ser un pipeline de spaCy puede integrarse fácilmente en flujos de procesamiento de texto existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de spaCy (senter, tok2vec, tagger, morphologizer, trainable_lemmatizer, lookup_lemmatizer, attribute_ruler, parser) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa oraciones, no secuencias largas) |
| Tipos de cuantizacion | no aplica (modelo tradicional de NLP, no requiere cuantizacion) |
| Idiomas soportados | Griego antiguo (codigo grc) |
| Licencia | MIT |
| Formato de pesos | no disponible (paquete de spaCy, probablemente .spacy) |

## Arquitectura y entrenamiento

El modelo es un pipeline de spaCy compuesto por varios componentes encadenados: un segmentador de oraciones (`senter`), un extractor de representaciones contextuales (`tok2vec`), un etiquetador gramatical (`tagger`), un analizador morfológico (`morphologizer`), dos lematizadores (uno entrenable y otro basado en diccionario), un `attribute_ruler` para reglas de atributos y un parser de dependencias. No emplea arquitectura transformer; se basa en el modelo clásico de spaCy con embeddings floret de 300 dimensiones y 50 000 vectores únicos.

El entrenamiento se realizó sobre los treebanks de Universal Dependencies para griego antiguo: PTNK, PROIEL y Perseus. La información disponible no detalla el número total de tokens de entrenamiento ni si se aplicaron técnicas de ajuste como RLHF o DPO, que en cualquier caso no son habituales en pipelines de anotación lingüística. El autor indica que es una versión beta experimental y que los resultados mejorarán conforme se armonicen y curen los datos de entrenamiento mediante el ciclo de realimentación del proyecto LatinCy.

## Capacidades

- Segmentación de oraciones en textos de griego antiguo.
- Etiquetado gramatical con 16 categorías POS (adjetivo, adverbio, conjunción, determinante, interjección, nombre, verbo, etc.).
- Análisis morfológico detallado con rasgos como modo, tiempo, persona, número, género, caso y voz (1796 etiquetas combinadas).
- Lematización mediante dos estrategias: un lematizador entrenable y uno basado en diccionario de consulta.
- Análisis sintáctico de dependencias (parser).
- No incluye capacidades generativas, tool calling, razonamiento multi-paso ni soporte para agentes.
- No es multilingüe; está especializado exclusivamente en griego antiguo.

## Casos de uso

- Investigación filológica: análisis morfológico y sintáctico de textos clásicos griegos para estudios de gramática histórica, estilística o crítica textual. El pipeline permite extraer automáticamente rasgos gramaticales de corpus extensos.
- Humanidades digitales: procesamiento de colecciones digitalizadas de obras griegas (p. ej., Perseus Digital Library) para construir corpus anotados con dependencias y lemas, útiles para búsquedas semánticas o estudios cuantitativos.
- Enseñanza de griego antiguo: herramientas didácticas que muestran a estudiantes el análisis gramatical de frases, con etiquetas POS, lemas y árboles de dependencia, facilitando la comprensión de la sintaxis clásica.
- Creación de treebanks: apoyo a proyectos de anotación manual de nuevas obras griegas, usando el pipeline como pre-anotador para acelerar el trabajo de los lingüistas.
- Integración en pipelines de NLP para textos históricos: combinación con otros modelos de spaCy o herramientas externas para tareas como extracción de entidades, análisis de sentimiento o clasificación de géneros literarios en griego antiguo.
- Análisis de variantes textuales: comparación de diferentes ediciones o manuscritos mediante la normalización morfológica y lematización, lo que permite identificar diferencias léxicas o gramaticales entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un pipeline de spaCy tradicional (sin transformer), puede ejecutarse en CPU sin necesidad de GPU.
- Tamaño del repositorio: 0,8 GB, lo que incluye los vectores y los componentes del modelo.
- Requisito mínimo: Python 3.x con spaCy 3.8.11 o superior (inferior a 3.9.0).
- Memoria RAM estimada: varios cientos de MB a 1-2 GB dependiendo del tamaño del texto a procesar.
- No requiere VRAM específica; funciona en cualquier máquina con soporte de Python.
- Opciones de despliegue: integración directa en scripts de Python con `spacy.load()`, o mediante servidores de inferencia como FastAPI o spaCy's built-in server.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un modelo ligero, el procesamiento de oraciones es del orden de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables para griego antiguo en el ecosistema de spaCy. El proyecto LatinCy ofrece pipelines para latín (por ejemplo, `la_dep_web_trf`), pero no hay datos públicos que permitan una comparación cuantitativa con este pipeline de griego antiguo. Se recomienda evaluar el modelo directamente sobre los corpus de interés.

## Limitaciones y advertencias

- Versión beta experimental: el propio autor advierte que pueden existir errores y que el comportamiento mejorará en futuras versiones.
- Datos de entrenamiento limitados: solo tres treebanks de Universal Dependencies, lo que puede afectar la cobertura de vocabulario y construcciones poco frecuentes.
- No es un modelo generativo: no puede producir texto, solo anotar lingüísticamente.
- Posibles sesgos derivados de los textos clásicos utilizados (predominantemente literarios y de ciertos períodos), lo que puede reducir el rendimiento en textos no literarios o tardíos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí pueden existir errores de etiquetado o lematización en formas ambiguas.
- Licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar la calidad del modelo para su caso de uso específico.

## Enlaces

- [Hugging Face - latincy/grc_dep_web_md](https://huggingface.co/latincy/grc_dep_web_md)
- [LatinCy en Hugging Face](https://huggingface.co/latincy/models)
- [LatinCy en GitHub](https://github.com/latincy)
- [LatinCy en spaCy Universe](https://spacy.io/universe/project/latincy)
- [Sitio del proyecto LatinCy](https://diyclassics.github.io/latincy/)
