# blackmlengineer/industrybench-jsic-l3-graded

## Resumen

`blackmlengineer/industrybench-jsic-l3-graded` es un dataset de evaluacion (no un modelo de lenguaje) publicado en Hugging Face bajo el layout BEIR para tareas de *retrieval* y clasificacion jerarquica de empresas segun la revision 13 de la Japan Standard Industrial Classification (JSIC). Contiene descripciones de empresas como consultas, los 436 codigos de grupo JSIC Rev.13 como corpus y juicios de relevancia graduados (qrels) que mapean cada consulta a los codigos industriales potencialmente aplicables. Es parte de una familia de datasets hermanos (L1-L4 para JSIC, equivalentes para NAICS e ISIC) orientados a construir benchmarks de clasificacion sectorial con relevancia graduada.

El problema que aborda es la evaluacion de sistemas de clasificacion industrial y *retrieval* jerarquico en un contexto donde las taxonomias oficiales son ambiguas: una empresa puede pertenecer a multiples codigos y la granularidad fina (grupo, nivel 3) genera una media de unos 45 codigos relevantes por empresa. El dataset esta pensado para metricas graduadas y multi-objetivo como nDCG o MAP, y es cargable mediante `WorkRB` como `GradedBEIRRankingTask`.

Su relevancia actual es metodologica: proporciona un benchmark reproducible con splits train/validation/test y deduplicacion controlada para evaluar sistemas de clasificacion sectorial, aunque las etiquetas son derivadas (no anotadas por humanos) mediante un mapeo en dos saltos NAICS -> ISIC Rev.4 -> JSIC Rev.13, lo que introduce ruido conocido. No es un modelo entrenado, sino un conjunto de datos de evaluacion; el repositorio pesa 0.0 GB y no incluye pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (titulos y descripciones en ingles) |
| Licencia | other (placeholder segun el autor; pendiente de confirmar) |
| Formato de pesos | no disponible (datos en Parquet: `queries`, `corpus`, `qrels`) |

Tabla de configuraciones y tamanos:

| Config | Split | Filas | Columnas |
|---|---|---|---|
| `queries` | train / validation / test | 97.841 / 12.247 / 12.304 | `_id`, `text` |
| `corpus` | `corpus` | 436 | `_id`, `title`, `jsic_version`, `parent` |
| `qrels` | train / validation / test | 2.029.191 / 252.576 / 257.778 | `query-id`, `corpus-id`, `score` |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el artefacto es un dataset de evaluacion con estructura BEIR (tres configuraciones: `queries`, `corpus`, `qrels`). El corpus contiene 436 documentos correspondientes a los codigos de grupo JSIC Rev.13 (nivel 3), con `_id` igual al codigo plano, `title` con el titulo en ingles del workbook oficial, `jsic_version` y `parent` apuntando al codigo de nivel superior (nulo para secciones). Los qrels son dispersos: solo se registran juicios no nulos, con `score` 2 cuando el codigo se alcanza desde el codigo NAICS primario de la empresa y `score` 1 cuando solo se alcanza desde codigos NAICS secundarios.

La construccion de etiquetas es el punto tecnico critico: los codigos NAICS primarios y secundarios de cada empresa se mapearon a clases ISIC Rev.4 mediante el crosswalk del Census de EE. UU., y despues se invirtio la tabla oficial del Statistics Bureau of Japan que relaciona JSIC Rev.13 con ISIC Rev.4. Como JSIC es mucho mas fina (1.270 industrias frente a 419 clases ISIC), 292 de las 412 clases ISIC enlazadas se ramifican a dos o mas industrias JSIC (hasta 28). Las industrias JSIC se agregaron despues a grupo, major group y division para mantener consistencia entre niveles. Los pesos en cada salto son uniformes (las tablas no traen pesos), por lo que los pesos de grado 2 en la configuracion `classification` del dataset combinado son uniformes por construccion.

Se aplico deduplicacion: descripciones identicas en validation/test se fusionaron en una sola consulta (union de juicios, grado maximo; 25 en validation y 25 en test), y se eliminaron del train las descripciones que aparecian en validation o test. Se excluyeron los codigos JSIC de "actividades administrativas o auxiliares" y "industrias no clasificables"; siete clases ISIC (`0150`, `3313`, `3319`, `3900`, `4930`, `9810`, `9820`) no tienen contrapartida JSIC y las empresas cuyo NAICS primario solo alcanza esas clases quedan sin etiqueta grado 2 (`primary_status` = `missing`, ausentes de los repos BEIR). Seis industrias JSIC (asociaciones cooperativas n.e.c., `9094` herrerias) no enlazan con ninguna clase ISIC y nunca son relevantes.

## Capacidades

- Evaluacion de *retrieval* jerarquico: permite medir sistemas que recuperan codigos industriales JSIC a partir de descripciones de empresas.
- Clasificacion multi-etiqueta con relevancia graduada: soporta metricas como nDCG y MAP sobre juicios con dos niveles (1 y 2).
- Evaluacion multi-nivel: los codigos se pueden agregar a grupo (nivel 3), major group (nivel 2), division (nivel 1) e industria (nivel 4), con repos hermanos `JSIC-Company-Classification-L1` a `-L4-`.
- Integracion con WorkRB: cargable como `GradedBEIRRankingTask`.
- Comparabilidad cruzada de taxonomias: los repos NAICS e ISIC comparten las mismas empresas, splits y deduplicacion, lo que permite comparar resultados entre taxonomias sobre el mismo conjunto.
- Carga directa con `datasets` de Hugging Face en formato Parquet.
- Idioma: solo ingles (titulos JSIC en ingles; no se incluyen los titulos japoneses).

## Casos de uso

- Benchmark de sistemas de clasificacion sectorial: evaluar un pipeline que, dada la descripcion de una empresa, devuelve codigos JSIC candidatos y medir nDCG@k o MAP contra los qrels graduados.
- Evaluacion de modelos de *embedding* para retrieval: usar `queries` y `corpus` como par consulta-documento para medir la calidad de representaciones vectoriales en un dominio especializado (descripciones de empresas frente a titulos de industria).
- Comparacion entre taxonomias: al compartir empresas y splits con los repos NAICS e ISIC, permite medir si un mismo sistema rinde mejor en una taxonomia mas gruesa o mas fina.
- Estudios de ambiguedad taxonomica: cuantificar como varia la dificultad del problema segun el nivel jerarquico (15% de ambiguedad en division frente a 81% en industria en el conjunto de test).
- Desarrollo de sistemas de enriquecimiento de datos B2B: entrenar o validar clasificadores que asignan codigos industriales a fichas de empresa para CRM, segmentacion o analitica de mercado.
- Investigacion en retrieval con relevancia graduada: banco de pruebas para metodos que manejan juicios multi-nivel y multiples etiquetas relevantes por consulta.
- Validacion de crosswalks: usar las discrepancias entre grados 1 y 2 para auditar la calidad de mapeos NAICS-ISIC-JSIC en proyectos de armonizacion de taxonomias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica en el sentido de inferencia de un modelo: el dataset se carga en memoria o se procesa en streaming.
- Tamano del repositorio: 0.0 GB segun Hugging Face; el repo hermano ISIC equivalente ocupa 20.8 MB, por lo que el coste de almacenamiento es bajo.
- Memoria RAM: los qrels de train contienen 2.029.191 filas; conviene cargar por splits o con `streaming=True` en entornos con menos de 4-8 GB de RAM.
- GPU: no necesaria para el uso del dataset en si; la GPU la requiere el sistema de retrieval o clasificacion que se evalue contra el.
- Despliegue: `datasets` de Hugging Face, pandas o Polars (el repo hermano declara soporte para pandas y Polars); no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Dataset | Taxonomia | Niveles | Corpus | Idioma | Licencia |
|---|---|---|---|---|---|
| `industrybench-jsic-l3-graded` | JSIC Rev.13 | L1-L4 (este es L3) | 436 codigos de grupo | en | other (placeholder) |
| `industrybench-isic-l3-graded` | ISIC Rev.4 | L1-L4 | no disponible en la informacion | en | other |
| `JSIC-Company-Classification-L1` / `-L2-` / `-L4-` | JSIC Rev.13 | niveles 1, 2 y 4 | no disponible | en | other |
| `ISIC4-Company-Classification` | ISIC Rev.4 | no disponible | no disponible | en | other |

Los repos NAICS e ISIC comparten las mismas empresas, splits y deduplicacion, por lo que los resultados son directamente comparables sobre el mismo conjunto de consultas.

## Limitaciones y advertencias

- Etiquetas derivadas, no anotadas por humanos: cualquier error en las etiquetas NAICS originales o en los crosswalks se propaga a las etiquetas JSIC; la precision no puede superar la de las etiquetas NAICS de origen.
- Ambiguedad alta en niveles finos: el primario es ambiguo para el 15% de las empresas de test a nivel de division, el 47% a nivel de major group, el 71% a nivel de grupo y el 81% a nivel de industria; una empresa tiene unas 45 industrias relevantes de media. Conviene usar metricas graduadas y multi-objetivo y tratar division y major group como los niveles mas fiables.
- Cobertura incompleta: siete clases ISIC sin contrapartida JSIC dejan empresas sin etiqueta grado 2 (ausentes del repo); seis industrias JSIC nunca son relevantes.
- Codigos excluidos: no estan los grupos de actividades administrativas o auxiliares ni "industrias no clasificables", lo que afecta al mapeo de ISIC 7010 (solo va a 7282 Pure holding companies).
- Vigencia: Rev.13 es la revision de 2013 y el workbook de correspondencia esta marcado como PROVISIONAL; Japon ha adoptado una revision posterior, por lo que hay que verificar si Rev.13 encaja con el caso de uso.
- Solo ingles: los titulos japoneses no se incluyen; 13 titulos de industria aparecen duplicados bajo codigos distintos.
- Licencia sin confirmar: `license: other` es un placeholder segun el propio autor; el README incluye un TODO pendiente de resolver la procedencia de las descripciones de empresas, las etiquetas NAICS originales y los terminos de reutilizacion del workbook del Statistics Bureau of Japan y de los ficheros del Census de EE. UU. No usar en produccion comercial sin aclarar la licencia.
- Pesos uniformes por construccion: los pesos de grado 2 en la configuracion combinada no reflejan ninguna probabilidad empirica.
- Sin descargas ni likes: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Dataset en Hugging Face: https://huggingface.co/blackmlengineer/industrybench-jsic-l3-graded
- Repo hermano ISIC L3: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l3-graded
- Arbol de ficheros del repo ISIC L3: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l3-graded/tree/main
- Repos hermanos JSIC L1/L2/L4 citados en la model card: `JSIC-Company-Classification-L1`, `-L2-`, `-L4-` (sin URL directa en la informacion disponible)
- Datasets NAICS e ISIC companeros citados en la model card: `ISIC4-Company-Classification` (sin URL directa en la informacion disponible)
- WorkRB `GradedBEIRRankingTask`: no disponible (citado en la model card sin enlace)
- Statistics Bureau of Japan (JSIC Rev.13 y tabla de correspondencia con ISIC Rev.4): no disponible (citado sin enlace)
- U.S. Census Bureau (crosswalk NAICS-ISIC y concordancia NAICS 2022-2017): no disponible (citado sin enlace)
