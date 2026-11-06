# cis-lmu/glotlid

## Resumen

GlotLID es un modelo de identificacion de idioma (language identification, LID) desarrollado por el Center for Information and Language Processing (CIS) de la LMU de Munich. Se distribuye como un clasificador de texto basado en fastText y cubre 2.104 etiquetas de idioma segun la lista de codigos ISO 639-3 incluida en su model card, lo que lo situa entre los sistemas LID de cobertura mas amplia disponibles publicamente. Resuelve el problema de etiquetar idioma en corpus multilingues y de bajos recursos, un paso previo habitual en la construccion de datasets de entrenamiento y en filtrado de datos web.

El modelo se publico en octubre de 2023 y se asocia al articulo arXiv 2310.16248, que describe GlotLID como un LID abierto entrenado sobre el corpus GlotLID (dataset `cis-lmu/glotlid-corpus`) y evaluado con datos derivados de GlotStoryBook y GlotSparse. Frente a alternativas como CLD3, langid.py o los modelos LID de fastText de Facebook, el enfasis esta en el rendimiento sobre idiomas de bajos recursos y en una taxonomia de etiquetas amplia y documentada.

La relevancia actual viene de su adopcion masiva: el repositorio acumula mas de 637.000 descargas en Hugging Face y se ha convertido en una pieza de referencia en pipelines de curacion de datos multilingues. Al ser un modelo fastText, es muy ligero en inferencia comparado con un transformer, aunque el repositorio completo ocupa 10,1 GB, presumiblemente por incluir artefactos adicionales ademas de los pesos del clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (clasificador lineal con n-gramas de caracteres y subpalabras) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion por documento o fragmento, sin ventana definida en la informacion) |
| Tipos de cuantizacion | no disponible (formato fastText, no cuantizable con esquemas tipo GGUF/AWQ) |
| Idiomas soportados | 2.104 etiquetas de idioma (codigos ISO 639-3 en la model card) |
| Licencia | apache-2.0-plus-notices (Apache 2.0 con avisos adicionales; ver LICENSE) |
| Formato de pesos | fastText (`.bin`/`.ftz` segun el ecosistema fastText; tamano de repo 10,1 GB) |

## Arquitectura y entrenamiento

GlotLID es un clasificador de texto fastText, es decir, una arquitectura de bolsa de n-gramas con proyeccion lineal y softmax sobre las etiquetas de idioma. Este diseno prioriza velocidad de entrenamiento e inferencia y un coste de memoria bajo en comparacion con transformers, a cambio de no modelar contexto de largo alcance. La salida es una distribucion sobre el conjunto de etiquetas de idioma definido en el modelo.

El entrenamiento se basa en el corpus GlotLID (`cis-lmu/glotlid-corpus`), complementado con recursos como GlotStoryBook y GlotSparse para evaluacion y cobertura. La model card referencia el articulo arXiv 2310.16248, que detalla la construccion del corpus y la evaluacion. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO, que no aplican de forma habitual a un clasificador supervisado.

## Capacidades

- Identificacion de idioma sobre texto de entrada, devolviendo etiquetas de idioma del conjunto de 2.104 codigos ISO 639-3 soportados.
- Clasificacion multilingue de amplia cobertura, con enfasis declarado en idiomas de bajos recursos.
- Funciona a nivel de documento o de fragmento de texto, adecuado para filtrar grandes volumenes de datos.
- Inferencia rapida y de bajo coste por ser fastText, apta para procesar corpus a gran escala.
- Integracion con el ecosistema Hugging Face mediante la libreria `fasttext` indicada en el repositorio.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento: es un clasificador, no un modelo generativo.
- No realiza generacion de texto ni traduccion; su unica tarea es la asignacion de etiqueta de idioma.

## Casos de uso

- Curacion de corpus de entrenamiento multilingue: etiquetar y filtrar documentos por idioma antes de construir datasets para modelos generativos, aprovechando la cobertura de 2.104 etiquetas para separar idiomas de bajos recursos que otros LID confunden.
- Filtrado de datos web a gran escala: procesar crawl de Common Crawl u otras fuentes con un clasificador fastText de bajo coste por documento, descartando o enrutando textos por idioma.
- Enrutamiento en pipelines de traduccion automatica: detectar el idioma de entrada para seleccionar el par de traduccion o el modelo adecuado antes de invocar un sistema NMT.
- Analisis de moderacion y deteccion de contenido: identificar el idioma de mensajes de usuario para aplicar reglas, lexicos o clasificadores especificos por lengua.
- Investigacion en linguistica de corpus: cuantificar la presencia de lenguas minoritarias en colecciones documentales y construir subcorpus por idioma para estudios comparativos.
- Preprocesamiento para sistemas de voz o OCR: etiquetar transcripciones y salidas de reconocimiento para decidir el modelo de lenguaje o el normalizador de texto a aplicar.
- Construccion de benchmarks multilingues: verificar que un conjunto de evaluacion contiene la mezcla de idiomas esperada y detectar contaminacion cruzada entre lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el articulo arXiv 2310.16248 como fuente de evaluacion, pero no se incluyen cifras concretas de precision, recall o F1 en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al ser fastText, la inferencia puede ejecutarse en CPU y el modelo cargado en memoria es muy inferior al tamano del repositorio (10,1 GB incluye artefactos adicionales).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente para throughput alto en clasificacion por lotes.
- Cabe en GPU consumer: si, y tambien en entornos sin GPU; el cuello de botella es la memoria RAM para cargar los pesos, no la VRAM.
- Opciones de despliegue: libreria `fasttext` (Python/C++), integracion con Hugging Face, y uso dentro de pipelines de procesamiento por lotes propios.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza de fastText se espera un throughput muy alto en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| GlotLID (cis-lmu) | fastText | 2.104 etiquetas ISO 639-3 | apache-2.0-plus-notices | Hugging Face, 637.034 descargas |
| fastText LID de Facebook (lid.176) | fastText | 176 idiomas | CC BY-SA 3.0 (segun publicacion original) | Ampliamente distribuido |
| CLD3 (Google) | Red neuronal ligera | ~100 idiomas | Apache 2.0 | Repositorio abierto |
| langid.py | Naive Bayes con n-gramas | 97 idiomas | BSD | PyPI, repositorio |

La comparativa se limita a datos publicos generales de cada proyecto; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada para cuantificar diferencias de precision entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como todo LID entrenado con corpus web, puede infrarepresentar variedades orales, dialectos y ortografias no estandar.
- Riesgo de confusion entre idiomas cercanos o con escritura compartida, especialmente en textos muy cortos donde los n-gramas de caracteres aportan poca senal.
- Limitacion de contexto: al ser un clasificador de bolsa de n-gramas, no modela dependencias de largo alcance; fragmentos cortos o mezclas de idiomas por documento pueden degradar la etiqueta.
- La licencia es `apache-2.0-plus-notices`, no Apache 2.0 pura: es necesario revisar el fichero LICENSE antes de uso comercial para cumplir los avisos adicionales.
- El repositorio ocupa 10,1 GB, muy por encima de lo que sugiere un clasificador fastText tipico; conviene inspeccionar los artefactos antes de desplegar para no asumir un unico fichero de pesos.
- No es un modelo generativo: no debe emplearse para traduccion, resumen ni tareas que requieran producir texto.
- En produccion, conviene calibrar umbrales de confianza y validar con una muestra del dominio objetivo, ya que el rendimiento puede variar entre generos textuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cis-lmu/glotlid
- Articulo arXiv: https://arxiv.org/abs/2310.16248
- Dataset del corpus: https://huggingface.co/datasets/cis-lmu/glotlid-corpus
- Dataset GlotSparse: https://huggingface.co/datasets/cis-lmu/GlotSparse
- Dataset GlotStoryBook: https://huggingface.co/datasets/cis-lmu/GlotStoryBook
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/cis-lmu/glotlid/blob/main/LICENSE
