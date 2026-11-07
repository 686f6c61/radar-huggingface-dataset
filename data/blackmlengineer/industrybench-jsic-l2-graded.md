# blackmlengineer/industrybench-jsic-l2-graded

## Resumen

`blackmlengineer/industrybench-jsic-l2-graded` es un conjunto de datos de evaluacion (no un modelo de lenguaje) publicado en Hugging Face para la tarea de clasificacion jerarquica de empresas segun la revision 13 de la Japan Standard Industrial Classification (JSIC). Sigue el formato BEIR con las configuraciones `queries`, `corpus` y `qrels`, y esta pensado para ser cargado con la tarea `GradedBEIRRankingTask` del framework WorkRB. El corpus contiene los 98 codigos de grupo principal (major group) de la JSIC Rev.13, mientras que las consultas son descripciones de empresas y los qrels proporcionan juicios de relevancia graduados.

El interes del dataset reside en que aborda una tarea de recuperacion/clasificacion con relevancia graduada y multiples etiquetas correctas por consulta, algo poco habitual en los benchmarks de clasificacion industrial. Forma parte de una familia de repositorios hermanos que cubren los niveles L1 a L4 de la JSIC y que comparten las mismas empresas con los datasets equivalentes basados en NAICS, lo que permite comparaciones directas entre taxonomias.

Es importante senalar que las etiquetas son derivadas, no anotadas por humanos: se obtienen mediante una traduccion en dos saltos (NAICS a ISIC Rev.4 y de ahi a JSIC Rev.13) y presentan una ambiguedad considerable en los niveles mas finos. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | Parquet (configs `queries`, `corpus`, `qrels`) |

| Configuracion | Splits | Filas | Columnas |
|---|---|---|---|
| `queries` | train / validation / test | 97.841 / 12.247 / 12.304 | `_id`, `text` |
| `corpus` | corpus | 98 | `_id`, `title`, `jsic_version`, `parent` |
| `qrels` | train / validation / test | 807.663 / 100.468 / 102.498 | `query-id`, `corpus-id`, `score` |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: se trata de un dataset de evaluacion, no de un modelo entrenado. Su "arquitectura" es el esquema BEIR de tres tablas (consultas, corpus y juicios de relevancia) con relevancia graduada. El corpus contiene unicamente los titulos de los 98 codigos de grupo principal de la JSIC Rev.13; el campo `parent` apunta al codigo del nivel superior (nulo para las secciones) y `jsic_version` identifica la revision.

Las etiquetas se construyeron mediante un crosswalk en dos saltos. Primero, los codigos NAICS se mapearon a clases ISIC Rev.4 usando la tabla del Census de EE. UU.; despues se invirtio la tabla oficial del Statistics Bureau of Japan que relaciona JSIC Rev.13 con ISIC Rev.4, de modo que una clase ISIC apunta a todas las industrias JSIC listadas frente a ella. Como la JSIC es mucho mas fina que la ISIC (1.270 industrias frente a 419 clases), 292 de las 412 clases ISIC enlazadas se ramifican en dos o mas industrias JSIC (hasta 28). Las industrias se agregaron despues a grupo, grupo principal y division para mantener la coherencia entre niveles. La nota de grado 2 corresponde a codigos alcanzados desde el NAICS primario de la empresa y la de grado 1 a codigos alcanzados solo desde NAICS secundarios. Los pesos son un reparto uniforme en cada salto porque las tablas no llevan ponderaciones.

## Capacidades

- Evaluacion de recuperacion y clasificacion con relevancia graduada (puntuaciones 1 y 2) y multiples etiquetas correctas por consulta.
- Clasificacion jerarquica coherente entre niveles: los codigos de grupo principal se pueden agregar a division y desagregar a grupo e industria.
- Benchmark compatible con el esquema BEIR y con `GradedBEIRRankingTask` de WorkRB, lo que facilita la integracion en pipelines de evaluacion existentes.
- Comparabilidad directa con los repositorios hermanos de los niveles L1 a L4 de la JSIC y con los datasets equivalentes basados en NAICS, al compartir empresas, splits y deduplicacion.
- Soporte de metricas multiobjetivo apropiadas para relevancia graduada, como nDCG y MAP.
- Idioma de las consultas y de los titulos del corpus: ingles unicamente.

## Casos de uso

- Evaluacion de sistemas de recuperacion de informacion: permite medir con nDCG y MAP como un retriever denso o disperso ordena los 98 grupos industriales para una descripcion de empresa dada, usando los qrels graduados como referencia.
- Clasificacion automatica de empresas por sector: util para validar modelos que asignan codigos industriales a descripciones de empresas en procesos de enriquecimiento de datos B2B, con la ventaja de que admite varias etiquetas correctas por empresa.
- Benchmarking de modelos de embeddings: al seguir el formato BEIR, se puede usar para comparar embeddings de frases en una tarea de dominio especifico (clasificacion industrial) sin necesidad de adaptar el pipeline de evaluacion.
- Analisis comparativo entre taxonomias: al compartir empresas con los datasets NAICS e ISIC4, sirve para estudiar como varian las etiquetas y las metricas al pasar de una taxonomia a otra.
- Investigacion sobre clasificacion jerarquica: los cuatro niveles (L1 a L4) permiten entrenar y evaluar modelos que explotan la estructura padre-hijo de los codigos, por ejemplo con perdidas jerarquicas o decodificacion restringida al arbol.
- Validacion de pipelines de datos en produccion: un equipo que construya un clasificador industrial puede usar el split de test como conjunto de regresion para detectar degradaciones antes de desplegar cambios en el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica en el sentido de inferencia de un modelo: el dataset completo ocupa 0.0 GB en el repositorio y se descarga y procesa en memoria con la libreria `datasets` de Hugging Face.
- El split de test de `qrels` contiene 102.498 juicios y el de `queries` 12.304 descripciones, volumen que se maneja sin problemas en una maquina de desarrollo convencional.
- Para evaluar un retriever sobre este dataset, los requisitos de hardware dependen del modelo de embeddings o del cross-encoder que se utilice, no del dataset en si.
- Opciones de carga: `datasets.load_dataset` con las configuraciones `queries`, `corpus` y `qrels`, y la tarea `GradedBEIRRankingTask` de WorkRB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Dataset | Taxonomia | Nivel | Consultas (test) | Documentos del corpus | Licencia |
|---|---|---|---|---|---|
| `industrybench-jsic-l2-graded` | JSIC Rev.13 | Grupo principal (L2) | 12.304 | 98 | other |
| `industrybench-isic-l2-graded` | ISIC Rev.4 | Nivel 2 | no disponible | no disponible | other |
| Repos hermanos JSIC L1, L3, L4 | JSIC Rev.13 | Division, grupo, industria | no disponible | no disponible | other |
| Repos NAICS equivalentes | NAICS | Multiples niveles | no disponible | no disponible | other |

La comparativa se limita a la familia de datasets del mismo autor, ya que no se dispone de informacion sobre benchmarks publicos alternativos de clasificacion industrial con relevancia graduada.

## Limitaciones y advertencias

- Las etiquetas son derivadas, no anotadas por humanos, y su precision no puede superar la de las etiquetas NAICS de origen ni la de los crosswalks utilizados.
- La etiqueta primaria es ambigua para el 15% de las empresas de test a nivel de division, el 47% a nivel de grupo principal, el 71% a nivel de grupo y el 81% a nivel de industria; una empresa tiene de media unas 45 industrias relevantes.
- Siete clases ISIC (`0150`, `3313`, `3319`, `3900`, `4930`, `9810`, `9820`) no tienen contrapartida JSIC, por lo que las empresas cuyo NAICS primario solo alcanza esas clases quedan sin etiqueta de grado 2 y no aparecen en los repositorios BEIR.
- Se excluyen los grupos de "actividades economicas administrativas o auxiliares" y el de "industrias no clasificables" de la JSIC; por ello ISIC 7010 se mapea unicamente a la industria 7282 (sociedades holding puras).
- La revision utilizada es la Rev.13 (2013) y el libro de correspondencia de origen esta marcado como provisional; Japon ha adoptado revisiones posteriores, por lo que conviene comprobar si Rev.13 es adecuada para el caso de uso.
- Los titulos del corpus son los titulos en ingles del libro de trabajo; no se incluyen los titulos en japones y 13 titulos de industria aparecen duplicados bajo codigos distintos.
- La licencia figura como `other` y la propia model card indica que es un marcador de posicion pendiente de confirmar, junto con la procedencia de las descripciones de empresas y de las etiquetas NAICS originales; no debe asumirse uso comercial libre.
- El idioma es exclusivamente ingles, lo que limita su aplicacion directa a empresas descritas en otros idiomas.
- El repositorio no registra descargas ni likes, y la model card contiene tareas pendientes (TODO) sin resolver, lo que sugiere que el dataset no ha pasado por una revision comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/blackmlengineer/industrybench-jsic-l2-graded
- Repositorio hermano ISIC nivel 2: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l2-graded
- Arbol de ficheros del repositorio ISIC: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l2-graded/tree/main
