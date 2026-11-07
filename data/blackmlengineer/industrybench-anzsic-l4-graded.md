# blackmlengineer/industrybench-anzsic-l4-graded

## Resumen

`blackmlengineer/industrybench-anzsic-l4-graded` no es un modelo de lenguaje, sino un conjunto de datos de evaluación (benchmark) publicado en Hugging Face. Concretamente, se trata de un dataset de clasificación jerárquica de empresas según el estándar australiano-neozelandés ANZSIC 2006, en su nivel 4 (clase, 506 códigos), con relevancia graduada y dispuesto en el formato BEIR (`queries`, `corpus`, `qrels`) que consumen tareas de ranking como `GradedBEIRRankingTask` de WorkRB.

El problema que aborda es la evaluación de sistemas de recuperación y clasificación de industrias: dada la descripción textual de una empresa, medir si el sistema recupera los códigos ANZSIC correctos, con dos grados de relevancia (2 para códigos alcanzados desde el NAICS primario, 1 para los alcanzados solo desde los secundarios). Es relevante porque permite comparar modelos de retrieval y clasificación multietiqueta sobre una taxonomía industrial real, con particiones train/validation/test y métricas graduadas como nDCG o MAP.

El dataset contiene 98.604 consultas de entrenamiento, 12.344 de validación y 12.391 de test, un corpus de solo 506 documentos (los títulos de los códigos ANZSIC) y tablas qrels dispersas con 2,4 millones de juicios en train. Es importante subrayar que las etiquetas son derivadas, no anotadas por humanos: se obtienen encadenando dos conversiones (NAICS → ISIC Rev.4 → ANZSIC 2006), lo que introduce ambigüedad y ruido documentados por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (dataset de evaluación, formato BEIR) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (marcador de posición según la model card) |
| Formato de pesos | Parquet (`data/queries/*.parquet`, `data/corpus/corpus.parquet`, `data/qrels/*.parquet`) |

Especificaciones adicionales del dataset:

| Parametro | Valor |
|---|---|
| Tarea | text-retrieval, text-classification (clasificación jerárquica con relevancia graduada) |
| Configuraciones | `queries`, `corpus`, `qrels` |
| Filas queries (train / validation / test) | 98.604 / 12.344 / 12.391 |
| Filas corpus | 506 |
| Filas qrels (train / validation / test) | 2.428.378 / 302.678 / 308.911 |
| Columnas queries | `_id`, `text` |
| Columnas corpus | `_id`, `title`, `anzsic_version`, `parent` |
| Columnas qrels | `query-id`, `corpus-id`, `score` |
| Escala de relevancia | 2 = alcanzado desde NAICS primario; 1 = solo desde NAICS secundarios |
| Tamaño del repo | 0,0 GB (según metadatos de Hugging Face) |
| Categoría de tamaño | 100K < n < 1M |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento: el artefacto es un dataset de evaluación. Su «construcción» consiste en un pipeline de derivación de etiquetas en cuatro pasos descrito en la model card. Primero, cada empresa del dataset NAICS companion tiene un código NAICS primario y varios secundarios. Segundo, los códigos NAICS se mapean a clases ISIC Rev.4 mediante el crosswalk del Census de EE. UU. Tercero, cada clase ISIC se mapea a clases ANZSIC 2006 con la correspondencia oficial del ABS (Australian Bureau of Statistics) entre ISIC Rev.4 y ANZSIC 2006, tomando la unión de ambas direcciones. Cuarto, las clases ANZSIC se agregan a grupo, subdivisión y división para que todos los niveles sean consistentes.

La innovación metodológica destacable es el uso de relevancia graduada en una taxonomía many-to-many: a diferencia de NACE, ANZSIC no anida dentro de ISIC, y la correspondencia del ABS es de muchos a muchos (la mitad de las 419 clases ISIC mapean a dos o más clases ANZSIC, hasta 21). Por eso el autor asigna grado 2 a los códigos alcanzados desde el NAICS primario y grado 1 a los alcanzados solo desde los secundarios, y advierte de que los pesos son un reparto uniforme en cada salto porque las tablas de correspondencia no llevan pesos. Las particiones y la deduplicación son idénticas a las de los datasets NAICS, ISIC y NACE del mismo autor, lo que permite comparar resultados sobre las mismas empresas. Los documentos del corpus son únicamente títulos.

## Capacidades

- Evaluación de recuperación de industrias: permite medir sistemas de retrieval (bi-encoders, cross-encoders, BM25) contra 506 códigos ANZSIC de nivel 4.
- Clasificación jerárquica multietiqueta: los qrels admiten evaluación a nivel de división, subdivisión, grupo y clase.
- Relevancia graduada: soporta métricas como nDCG y MAP con dos grados (1 y 2), no solo relevancia binaria.
- Compatibilidad con BEIR: layout estándar (`queries`, `corpus`, `qrels`) cargable con `datasets.load_dataset`.
- Integración con WorkRB: pensado para `GradedBEIRRankingTask`.
- Particiones train/validation/test listas para ajuste y evaluación reproducible.
- Deduplicación controlada: descripciones idénticas en validation/test se fusionan en una sola query (25 en validation, 25 en test) con unión de juicios y grado máximo; las descripciones de train que aparecen en validation o test se eliminan.
- Solo inglés: el campo `language` es `en`.

## Casos de uso

- Evaluación de motores de búsqueda semántica para clasificación industrial: se indexa el corpus de 506 títulos ANZSIC y se mide la capacidad del retriever para devolver los códigos correctos para cada descripción de empresa, usando nDCG@k sobre los qrels graduados.
- Benchmarking de modelos de embeddings: comparar bi-encoders (por ejemplo, familia Sentence-BERT) sobre las mismas 12.391 queries de test, con métricas comparables entre modelos y entre taxonomías (NAICS, ISIC, NACE, ANZSIC).
- Ajuste fino de clasificadores multietiqueta: usar las 98.604 queries de train con sus juicios para entrenar o afinar un clasificador que asigne códigos ANZSIC a descripciones de empresas.
- Validación de pipelines de enriquecimiento de datos B2B: una empresa que quiera etiquetar automáticamente su cartera de clientes por industria puede usar el dataset para medir la calidad de su pipeline antes de producción.
- Investigación en correspondencias entre taxonomías: el dataset permite estudiar el impacto del ruido introducido por los dos saltos (NAICS → ISIC → ANZSIC) comparando resultados con los datasets hermanos NAICS e ISIC sobre las mismas empresas.
- Evaluación de sistemas de clasificación jerárquica: medir si un modelo acierta a nivel de división y subdivisión (los niveles que el autor considera más fiables) frente a grupo y clase, donde la ambigüedad es mayor.
- Reproducibilidad en papers: servir como benchmark público para publicaciones sobre clasificación de industrias, con splits fijos y deduplicación documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de referencia (nDCG, MAP, precisión) para ningún modelo, ni baseline alguno.

## Requisitos de hardware

- No aplica inferencia de modelo: es un dataset, no un modelo de lenguaje.
- Almacenamiento: el repositorio ocupa 0,0 GB según los metadatos de Hugging Face; el dataset hermano ISIC equivalente ocupa 21,3 MB, por lo que el espacio en disco es trivial.
- Memoria: los qrels de train tienen 2.428.378 filas; conviene cargarlos con `datasets` (Arrow) o Polars/pandas para evitar consumo excesivo de RAM si se materializan en memoria.
- GPU: no necesaria para el dataset en sí; la GPU dependerá del modelo de retrieval o clasificación que se evalúe sobre él.
- Despliegue: carga mediante `datasets.load_dataset` con las configuraciones `queries`, `corpus` y `qrels`; compatible con el ecosistema Hugging Face Datasets, Polars y pandas.
- Latencia y throughput: no disponibles (dependen del modelo evaluado, no del dataset).

## Comparativa con modelos similares

| Dataset | Taxonomía | Nivel | Corpus | Queries test | Licencia | Etiquetas |
|---|---|---|---|---|---|---|
| industrybench-anzsic-l4-graded | ANZSIC 2006 | 4 (clase) | 506 | 12.391 | other | Derivadas (NAICS → ISIC → ANZSIC) |
| industrybench-isic-l4-graded | ISIC Rev.4 | 4 (clase) | no disponible | no disponible | other | Derivadas (NAICS → ISIC) |
| ANZSIC-Company-Classification-L1/L2/L3 | ANZSIC 2006 | 1-3 | no disponible | no disponible | no disponible | Derivadas, mismo pipeline |
| Companions NAICS-Company-Classification | NAICS | varios | no disponible | no disponible | no disponible | Primarias y secundarias originales |
| Companions NACE-Company-Classification | NACE | varios | no disponible | no disponible | no disponible | Derivadas (NAICS → ISIC → NACE) |

Los datasets hermanos comparten las mismas empresas, splits y deduplicación, lo que permite comparaciones directas entre taxonomías. Los datos concretos de corpus y queries de los datasets ISIC, NAICS y NACE no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Etiquetas derivadas, no anotadas por humanos: encadenan dos conversiones con pérdida (NAICS → ISIC → ANZSIC), por lo que no pueden ser más precisas que las etiquetas NAICS de origen.
- Ambigüedad alta del primario: el código de grado 2 es ambiguo para el 23 % de las empresas de test a nivel de división, el 53 % a nivel de subdivisión, el 66 % a nivel de grupo y el 72 % a nivel de clase; una empresa tiene unas 25 clases relevantes de media.
- Correspondencia many-to-many: ANZSIC no anida dentro de ISIC; la mitad de las 419 clases ISIC mapean a dos o más clases ANZSIC (hasta 21), y no se usan los indicadores de coincidencia parcial del ABS.
- Pesos uniformes: las tablas de correspondencia no llevan pesos, así que los pesos de grado 2 son uniformes por construcción.
- Propagación de errores: los errores en las etiquetas NAICS y en los crosswalks se arrastran al dataset ANZSIC.
- Empresas sin etiqueta de grado 2: aquellas cuyo NAICS primario no mapea a ninguna clase ISIC válida quedan con `primary_status` = `missing`.
- Documentos solo con título: el corpus no incluye descripciones largas de los códigos, lo que limita la señal textual disponible para el retrieval.
- Licencia sin confirmar: `license: other` es un marcador de posición según la propia model card, que incluye un TODO para confirmar la licencia antes de publicar; ANZSIC 2006 y su correspondencia con ISIC están publicados por el ABS y Stats NZ bajo sus propios términos de reutilización.
- Procedencia incompleta: la model card deja pendiente indicar la fuente de las descripciones de empresas y de las etiquetas NAICS originales.
- Idioma único: solo inglés, lo que limita su uso en otros mercados sin traducción.
- Uso comercial: restricciones indeterminadas hasta que se aclare la licencia y los términos del ABS y del Census.

## Enlaces

- Hugging Face: https://huggingface.co/blackmlengineer/industrybench-anzsic-l4-graded
- Dataset hermano ISIC: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l4-graded
- Árbol de ficheros del dataset ISIC (referencia de estructura): https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l4-graded/tree/main
- WorkRB (`GradedBEIRRankingTask`): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
