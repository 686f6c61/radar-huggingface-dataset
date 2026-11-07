# blackmlengineer/industrybench-jsic-l1-graded

## Resumen

`blackmlengineer/industrybench-jsic-l1-graded` no es un modelo de lenguaje, sino un conjunto de datos de evaluacion (benchmark) para recuperacion y clasificacion de empresas segun la clasificacion industrial japonesa JSIC Rev.13, en su nivel 1 (Division, 19 codigos). El repositorio sigue el formato BEIR (`queries`, `corpus`, `qrels`) con relevancia graduada, de forma que puede cargarse mediante `datasets` de Hugging Face y evaluarse con tareas de ranking graduado como `GradedBEIRRankingTask` del framework WorkRB.

El dataset contiene 122.392 descripciones de empresas en el split de entrenamiento, validacion y test (97.841 / 12.247 / 12.304), un corpus de solo 19 documentos (los codigos de division JSIC) y matrices de juicios de relevancia dispersas (350.638 / 43.775 / 44.479 filas). Las etiquetas no son anotaciones humanas: se derivan por traduccion en dos saltos desde los codigos NAICS de cada empresa (NAICS → ISIC Rev.4 → JSIC Rev.13), con grado 2 para los codigos alcanzados desde el NAICS primario y grado 1 para los alcanzados solo desde los secundarios.

Su relevancia practica es la de un benchmark de recuperacion multietiqueta y graduada en un dominio muy desbalanceado y con ambiguedad de etiqueta documentada (el 15% de las empresas de test tiene mas de un codigo de grado 2 a nivel de division). Es util para medir sistemas de clasificacion jerarquica de actividad economica, no para generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (descripciones de empresas y titulos de industria en ingles) |
| Licencia | other (marcada como placeholder por el autor) |
| Formato de pesos | Parquet (configs `queries`, `corpus`, `qrels`) |
| Tamano del repositorio | 0,0 GB |
| Tarea | text-retrieval, text-classification |
| Numero de documentos del corpus | 19 (codigos de division JSIC Rev.13) |
| Numero de queries | 97.841 train / 12.247 validation / 12.304 test |
| Numero de juicios (qrels) | 350.638 train / 43.775 validation / 44.479 test |
| Escala de relevancia | 2 (NAICS primario) / 1 (solo NAICS secundarios) |
| Categoria de tamano | 100K < n < 1M |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay pesos ni entrenamiento. El artefacto es un dataset estructurado en tres configuraciones. `queries` contiene `_id` y `text` (descripcion de la empresa). `corpus` contiene `_id` (codigo JSIC: letra de division, grupo principal de 2 digitos, grupo de 3 digitos o industria de 4 digitos), `title`, `jsic_version` y `parent` (codigo del nivel superior, nulo para secciones); los documentos son unicamente titulos. `qrels` contiene `query-id`, `corpus-id` y `score`, y es disperso (solo juicios no nulos).

La construccion de etiquetas es el punto tecnico central. Primero se mapean los codigos NAICS a clases ISIC Rev.4 mediante el crosswalk del Census de EE. UU. Despues se invierte la tabla oficial del Statistics Bureau de Japon JSIC Rev.13 → ISIC Rev.4: como JSIC es mucho mas fino (1.270 industrias frente a 419 clases ISIC), 292 de las 412 clases ISIC enlazadas se abren a dos o mas industrias JSIC (hasta 28). Por ultimo, las industrias se agregan a grupo, grupo principal y division para mantener coherencia entre niveles. El grado 2 se asigna a los codigos alcanzados desde el NAICS primario y el grado 1 a los alcanzados solo desde los secundarios; una empresa puede tener varios codigos de grado 2.

Se aplico deduplicacion: descripciones identicas en validacion y test se fusionaron en una sola query (union de juicios, grado maximo; 25 en validacion y 25 en test), y se eliminaron del train las descripciones que aparecen en validacion o test. Quedan excluidos los grupos JSIC de "actividades administrativas o auxiliares" y "industrias no clasificables"; siete clases ISIC (`0150`, `3313`, `3319`, `3900`, `4930`, `9810`, `9820`) no tienen contrapartida JSIC y las empresas cuyo NAICS primario solo alcanza esas clases quedan sin etiqueta de grado 2.

## Capacidades

- Evaluacion de recuperacion con relevancia graduada multietiqueta en formato BEIR.
- Clasificacion jerarquica de actividad economica a nivel de division (19 clases), con hermanos en niveles 2, 3 y 4 (`JSIC-Company-Classification-L2`, `-L3-`, `-L4-`).
- Carga directa con `datasets.load_dataset` por configuracion y split.
- Integracion con el framework WorkRB mediante `GradedBEIRRankingTask`.
- Comparabilidad directa con los datasets NAICS e ISIC4 del mismo autor sobre las mismas empresas, mismos splits y misma deduplicacion.
- Soporte de metricas de ranking (nDCG, MAP) adecuadas a etiquetas multiples y ambiguas.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: no es un modelo.

## Casos de uso

- Evaluacion de sistemas de clasificacion de empresas por sector: usar las descripciones como queries y los 19 codigos de division como corpus para medir nDCG o MAP de un clasificador o de un recuperador denso.
- Benchmarking de embeddings para dominios administrativos: comparar modelos de sentence embeddings sobre descripciones cortas de empresas con vocabulario economico y regulatorio.
- Validacion de pipelines de clasificacion jerarquica: entrenar en el split de train y comprobar la coherencia de predicciones entre division, grupo principal, grupo e industria usando los repos hermanos.
- Estudios de ambiguedad de etiqueta: cuantificar el impacto de etiquetas derivadas (15% de ambiguedad en test a nivel de division, 81% a nivel de industria) sobre las metricas de un sistema.
- Armonizacion de taxonomias internacionales: probar heuristicas de mapeo NAICS/ISIC/JSIC y medir la perdida de informacion al agregar niveles.
- Recuperacion de codigo industrial para cumplimiento y registros mercantiles: prototipar un buscador que, dada una descripcion de empresa, devuelva los codigos de actividad candidatos ordenados por relevancia.
- Investigacion en evaluacion multilingue de clasificacion sectorial: el dataset esta en ingles, pero las etiquetas provienen de una taxonomia japonesa, lo que permite estudiar transferencia entre marcos regulatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de referencia de ningun sistema sobre este dataset.

## Requisitos de hardware

- No requiere GPU: es un dataset Parquet de menos de 1 GB.
- Carga en memoria viable en cualquier equipo de desarrollo; el split de train de queries (97.841 filas) y qrels (350.638 filas) es el de mayor consumo.
- Almacenamiento: el repositorio ocupa 0,0 GB segun Hugging Face.
- Despliegue: `datasets` de Hugging Face, con descarga directa de Parquet; compatible con cualquier pipeline BEIR o WorkRB.
- Latencia y throughput: dependen exclusivamente del modelo o recuperador que se evalue, no del dataset.

## Comparativa con modelos similares

| Dataset | Dominio | Niveles | Documentos de corpus | Queries (test) | Relevancia | Licencia |
|---|---|---|---|---|---|---|
| `industrybench-jsic-l1-graded` (este) | JSIC Rev.13, nivel 1 (division) | 1 de 4 | 19 | 12.304 | Graduada (1/2) | other (placeholder) |
| `JSIC-Company-Classification-L2/L3/L4` | JSIC Rev.13, niveles 2-4 | 2, 3, 4 | no disponible | no disponible | Graduada | other |
| `ISIC4-Company-Classification` | ISIC Rev.4 | no disponible | no disponible | no disponible | Graduada | other |
| Datasets NAICS del mismo autor | NAICS | no disponible | no disponible | no disponible | Graduada | other |

Los repositorios hermanos comparten empresas, splits y deduplicacion, por lo que los resultados son directamente comparables entre niveles y taxonomias. No se dispone de datos de benchmarks de terceros para establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Las etiquetas son derivadas, no anotadas por humanos: los errores de las etiquetas NAICS y de los crosswalks se propagan, y las etiquetas JSIC no pueden ser mas precisas que las NAICS.
- Ambiguedad alta del primario: el 15% de las empresas de test tiene mas de un codigo de grado 2 a nivel de division, el 47% a nivel de grupo principal, el 71% a nivel de grupo y el 81% a nivel de industria; una empresa tiene unas 45 industrias relevantes de media.
- El corpus de nivel 1 tiene solo 19 documentos, por lo que la tarea es de clasificacion antes que de recuperacion a gran escala; las metricas deben ser graduadas y multietiqueta.
- Siete clases ISIC sin contrapartida JSIC dejan empresas sin etiqueta de grado 2 (`primary_status` = `missing`) y esas empresas estan ausentes de los repositorios BEIR.
- Seis industrias JSIC no enlazan con ninguna clase ISIC y nunca son relevantes.
- Los pesos del mapeo son un reparto equitativo en cada salto, de modo que los pesos de grado 2 son uniformes por construccion; esto no refleja probabilidades reales.
- La revision JSIC Rev.13 es de 2013 y el libro de correspondencia usado esta marcado como PROVISIONAL; Japon ha adoptado revisiones posteriores.
- Los titulos estan solo en ingles (no se incluyen los japoneses) y 13 titulos de industria aparecen duplicados bajo codigos distintos.
- Licencia `other` sin aclarar: el autor la declara placeholder y deja pendiente confirmar la fuente de las descripciones y las condiciones de reutilizacion del material del Statistics Bureau de Japon y del Census de EE. UU.; no debe asumirse uso comercial libre.
- El dataset no debe confundirse con `IndustryBench` de Alibaba (arXiv 2605.10267), un benchmark de QA de compras industriales en chino sin relacion con este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/blackmlengineer/industrybench-jsic-l1-graded
- Repos hermanos citados en la model card: `JSIC-Company-Classification-L1`, `-L2-`, `-L3-`, `-L4-` (mismo autor, Hugging Face)
- Datasets NAICS e `ISIC4-Company-Classification` del mismo autor (Hugging Face)
- WorkRB (`GradedBEIRRankingTask`): no disponible en la informacion proporcionada
- Formato BEIR: no disponible en la informacion proporcionada
- Statistics Bureau of Japan, tabla de correspondencia JSIC Rev.13 → ISIC Rev.4: no disponible en la informacion proporcionada
- U.S. Census Bureau, crosswalk NAICS → ISIC y concordancia NAICS 2022-2017: no disponible en la informacion proporcionada
- IndustryBench de Alibaba (benchmark no relacionado): https://github.com/alibaba-multimodal-industrial-ai/IndustryBench y https://arxiv.org/abs/2605.10267
