# nasrellahkharroubi/DarijaDz

## Resumen

DarijaDZ es un corpus lingüístico a gran escala de texto generado por usuarios, recopilado a partir de comentarios de canales argelinos de YouTube. Lo ha desarrollado Kharroubi Nasrellah, estudiante de cuarto año en ENSIA (Argelia), con el objetivo de paliar la escasez de recursos textuales públicos para el darija argelino, una variedad dialectal del árabe con poca presencia en los recursos NLP existentes. El corpus contiene aproximadamente 3 millones de documentos y más de 36 millones de tokens a nivel de palabra, escritos principalmente en escritura árabe, aunque también incluye una proporción significativa en arabizi (transliteración latina) y contenido mixto.

La relevancia de DarijaDZ radica en que proporciona una fuente masiva de lenguaje informal y natural para tareas como preentrenamiento de modelos de lenguaje, identificación de dialectos, análisis de sentimiento, reconocimiento de entidades nombradas y traducción automática. El corpus se distribuye en formato de dataset de Hugging Face, con un tamaño de repositorio de 0,5 GB y una categoría de tamaño declarada de 1M a 10M de documentos. Aunque la licencia no está especificada, el autor ha publicado el corpus abiertamente para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de recurso | Dataset de texto (corpus) |
| Documentos | 3.023.919 |
| Tokens a nivel de palabra | 36.446.594 |
| Media de tokens por documento | 12,05 |
| Distribucion por escritura | Arabe: 84,81 %, Latin/Arabizi: 11,36 %, Digitos/puntuacion/simbolos: 3,72 %, Mixto arabe+latin: 0,10 % |
| Fuente de datos | Comentarios y respuestas de 42 canales de YouTube argelinos (20.944 videos) |
| Categorias de contenido | Noticias, educacion/BAC, cocina y estilo de vida, entretenimiento, comentarios y vlogs |
| Idiomas | Arabe (darija argelino), arabizi |
| Licencia | No disponible |
| Formato de datos | Hugging Face dataset (JSON, auto-convertido a Parquet) |
| Tareas soportadas | Generacion de texto, clasificacion de texto, clasificacion de tokens |
| Fecha de creacion | 17 de agosto de 2026 |

## Arquitectura y entrenamiento

Al tratarse de un dataset, no existe una arquitectura de modelo. El proceso de construccion del corpus es el siguiente:

La recopilacion se realizo mediante la YouTube Data API v3, extrayendo comentarios de primer nivel y respuestas de 42 canales argelinos que cubren diversas categorias tematicas. El pipeline de recoleccion fue reanudable (resumable), lo que permite continuar la descarga en caso de interrupcion. Se procesaron 20.944 archivos de video en bruto.

El preprocesamiento se desarrollo empiricamente sobre una muestra de reserva de 1.000 documentos y luego se aplico a todo el corpus. Las reglas de limpieza incluyen: sustitucion de URLs por `[URL]`, sustitucion de menciones por `[MENTION]`, eliminacion de caracteres invisibles y de control direccional, eliminacion de marcas de tiempo, colapso de secuencias de emojis y puntuacion excesiva, colapso de alargamiento de caracteres preservando variacion expresiva, eliminacion de documentos casi vacios, eliminacion de diacriticos arabes (tashkeel), normalizacion Unicode NFKC y deduplicacion de documentos casi duplicados mediante MinHash/LSH.

El desequilibrio entre datos en escritura arabe y arabizi motivo el desarrollo de una herramienta de transliteracion de arabe a arabizi, publicada como espacio de Hugging Face.

## Capacidades

- Corpus de texto no etiquetado apto para preentrenamiento de modelos de lenguaje desde cero o continuacion de preentrenamiento.
- Material para entrenamiento de tokenizadores especializados en darija argelino y escritura mixta.
- Recurso para identificacion de dialectos, especialmente para distinguir el darija argelino de otras variantes arabes.
- Base para tareas de analisis de sentimiento en redes sociales argelinas.
- Datos para reconocimiento de entidades nombradas en texto informal y dialectal.
- Soporte para investigacion sobre codigo alternante (code-switching) entre arabe y latin/arabizi.
- Corpus para estudios de variacion de escritura (arabe vs. arabizi) y su transliteracion.
- Recurso para traduccion automatica entre darija argelino y arabe estandar moderno u otros idiomas.

## Casos de uso

- Preentrenamiento de modelos de lenguaje para darija argelino: los 36 millones de tokens permiten entrenar modelos de tamano pequeno o mediano desde cero, o realizar continuacion de preentrenamiento sobre modelos arabes generalistas para adaptarlos al dialecto.
- Desarrollo de tokenizadores especializados: el corpus incluye escritura arabe y arabizi, lo que permite disenar tokenizadores que manejen ambas grafias y sus variaciones.
- Analisis de sentimiento en redes sociales argelinas: los comentarios de YouTube reflejan opinion publica sobre noticias, educacion y entretenimiento; un modelo entrenado con este corpus puede clasificar polaridad en textos similares.
- Identificacion de dialectos: el corpus permite entrenar clasificadores que distingan el darija argelino de otros dialectos magrebies o del arabe estandar, util en sistemas de moderacion o analisis regional.
- Investigacion en transliteracion arabe-arabizi: la proporcion de datos en ambos sistemas de escritura (84,81 % arabe, 11,36 % latin) facilita el desarrollo de sistemas de transliteracion automatica, como el espacio complementario publicado por el autor.
- Estudio de code-switching y lenguaje informal: el corpus es una fuente valiosa para analisis sociolinguistico del uso de mezcla de escrituras y registros coloquiales en entornos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un dataset, no existen metricas de rendimiento propias; su calidad se evalua por la exhaustividad y limpieza del corpus, cuyas estadisticas se detallan en las especificaciones.

## Requisitos de hardware

No aplica. Se trata de un dataset, no de un modelo entrenado. Para su uso, solo se requiere almacenamiento (0,5 GB) y una maquina capaz de cargar el dataset en memoria o procesarlo por lotes. La carga mediante `datasets.load_dataset` es compatible con entornos CPU estandar.

## Comparativa con modelos similares

No hay modelos directamente comparables, pero si otros recursos de darija. La siguiente tabla compara DarijaDZ con otros corpus de darija magrebi conocidos:

| Recurso | Variedad | Tamano | Escritura | Licencia |
|---|---|---|---|---|
| DarijaDZ | Argelino | 36 M tokens | Arabe + Arabizi | No disponible |
| Atlas-Chat (instrucciones) | Marroqui | No disponible | Arabe | No disponible |
| Moroccan Darija resources (GitHub MoroccoAI) | Marroqui | Varios | Arabe + Latin | Depende del recurso |

La comparativa se limita a corpus de darija; no hay datos publicos de otros corpus argelinos de tamano comparable en la informacion disponible.

## Limitaciones y advertencias

- El corpus proviene exclusivamente de comentarios de YouTube, por lo que refleja el lenguaje de una poblacion con acceso a internet y puede no representar todos los registros del darija argelino (falta de lenguaje formal, tecnico o literario).
- La licencia no esta especificada, lo que genera incertidumbre sobre las condiciones de uso comercial y redistribucion. Se recomienda contactar al autor antes de usarlo en proyectos comerciales.
- No se proporcionan datos sobre la calidad de la deduplicacion ni sobre posibles sesgos demograficos o tematicos de los canales seleccionados.
- El corpus no esta anotado; no incluye etiquetas para tareas supervisadas como sentimiento o NER, por lo que requiere anotacion manual o metodos no supervisados.
- La proporcion de arabizi es minoritaria (11,36 %), lo que puede limitar el rendimiento de modelos entrenados exclusivamente con este corpus para esa escritura.
- No hay informacion sobre la distribucion temporal de los comentarios ni sobre la posible inclusion de datos personales o contenido sensible, aunque se aplicaron reglas de limpieza estandar.

## Enlaces

- Dataset en Hugging Face: https://huggingface.co/datasets/nasrellahkharroubi/DarijaDz
- Perfil del autor: https://huggingface.co/nasrellahkharroubi
- Herramienta de transliteracion darija-arabizi: https://huggingface.co/spaces/nasrellahkharroubi/darija-arabizi-transliterator
- Recursos NLP para darija (GitHub MoroccoAI): https://github.com/MoroccoAI/Arabic-Darija-NLP-Resources
- Paper de Atlas-Chat (darija marroqui, referencia comparativa): https://arxiv.org/pdf/2409.17912
