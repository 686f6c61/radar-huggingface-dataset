# blackmlengineer/industrybench-anzsic-l1-graded

## Resumen

`blackmlengineer/industrybench-anzsic-l1-graded` no es un modelo de lenguaje, sino un **dataset de evaluación** publicado en Hugging Face por el usuario `blackmlengineer`. Concretamente, es un banco de pruebas de clasificación de empresas por industria según la taxonomía australiana ANZSIC 2006, en su nivel 1 (Division, 19 códigos). Empaqueta descripciones de empresas y sus correspondencias con códigos ANZSIC usando relevancia graduada, en el formato BEIR (`queries`, `corpus`, `qrels`) que consumen frameworks de recuperación y ranking como WorkRB.

El conjunto está pensado para evaluar sistemas de clasificación jerárquica de industrias y de recuperación de documentos con etiquetas multinivel y multiobjetivo. Su valor diferencial es que ofrece particiones train/validation/test sobre las mismas empresas que sus repos hermanos de NAICS, ISIC y NACE, lo que permite comparar resultados entre taxonomías sobre una base común. El nivel 1 (Division) es el más fiable de la familia, ya que las etiquetas se degradan conforme se baja en la jerarquía.

Es relevante ahora porque la clasificación automática de industrias es una tarea común en enriquecimiento de datos B2B, scoring de leads y cumplimiento normativo, y escasean los benchmarks públicos con relevancia graduada y estructura jerárquica. No obstante, conviene subrayar que las etiquetas son **derivadas, no anotadas por humanos**, y que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con la licencia aún sin confirmar (`license: other` como marcador de posición).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other (marcador de posicion, pendiente de confirmar) |
| Formato de pesos | Parquet (configs `queries`, `corpus`, `qrels`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: se trata de un dataset, no de un modelo entrenado. Su "arquitectura" es la estructura BEIR en tres configuraciones: `queries` (descripciones de empresas), `corpus` (19 documentos, uno por código de división ANZSIC, con `_id`, `title`, `anzsic_version` y `parent`) y `qrels` (juicios de relevancia dispersos con `query-id`, `corpus-id` y `score`). Las particiones son train (98.604 queries / 457.335 qrels), validation (12.344 / 57.072) y test (12.391 / 57.970).

Las etiquetas se derivan en dos saltos: NAICS → ISIC Rev.4 (crosswalk del Census de EE. UU.) y de ahí a ANZSIC 2006 (correspondencia del ABS). El grado 2 corresponde a códigos alcanzados desde el NAICS primario de la empresa y el grado 1 a los alcanzados solo desde NAICS secundarios. La correspondencia ISIC↔ANZSIC es de muchos a muchos (la mitad de las 419 clases ISIC mapean a dos o más clases ANZSIC, hasta 21), lo que introduce ambigüedad: el 23% de las empresas de test tienen más de un código de grado 2 a nivel de división. Los pesos se reparten uniformemente en cada salto.

## Capacidades

- Evaluación de sistemas de clasificación jerárquica de industrias a nivel de división ANZSIC (19 clases).
- Evaluación de recuperación de documentos con relevancia graduada (score 1 y 2) mediante métricas como nDCG y MAP.
- Soporte de tareas multiobjetivo: una misma empresa puede tener varios códigos relevantes.
- Integración con el ecosistema BEIR y con `WorkRB` (`GradedBEIRRankingTask`).
- Carga directa con `datasets.load_dataset` en las configuraciones `queries`, `corpus` y `qrels`.
- Comparabilidad directa con los repos hermanos NAICS, ISIC y NACE sobre las mismas empresas y particiones.
- Cobertura de los niveles L1 a L4 en repos hermanos (`-L2-`, `-L3-`, `-L4-`), aunque este repo solo cubre L1.

## Casos de uso

- **Evaluación de clasificadores de industria en pipelines B2B**: usar la partición de test para medir nDCG@k de un sistema que asigna códigos ANZSIC a descripciones de empresas, aprovechando la relevancia graduada para penalizar menos los aciertos parciales.
- **Benchmarking de modelos de embeddings**: comparar recuperadores densos o sparse sobre el corpus de 19 documentos y las queries de empresas, con métricas estándar BEIR.
- **Investigación en clasificación jerárquica**: estudiar cómo se degrada el rendimiento al pasar de división a subdivisión, grupo y clase usando los repos hermanos L2, L3 y L4 sobre las mismas empresas.
- **Alineación de taxonomías**: validar crosswalks NAICS→ISIC→ANZSIC midiendo la pérdida de información en cada salto con las etiquetas graduadas.
- **Enriquecimiento de CRM y lead scoring**: entrenar o evaluar un modelo que asigne industria a registros de empresa y priorizar los códigos de grado 2 frente a los de grado 1 en la salida.
- **Cumplimiento y segmentación regulatoria**: clasificar empresas por división ANZSIC para determinar obligaciones sectoriales, usando el nivel de división por ser el más fiable del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: el corpus tiene solo 19 documentos y las queries son texto corto; la carga y evaluación caben en CPU y memoria RAM convencional.
- Tamaño del repo: 0,0 GB reportado; los ficheros Parquet de queries y qrels son los de mayor volumen (cientos de miles de filas).
- Despliegue mediante la librería `datasets` de Hugging Face, con backend pandas o Polars.
- Para evaluar recuperadores sobre este dataset, los requisitos vendrán del modelo de embeddings elegido, no del dataset.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Dataset | Taxonomia | Nivel | Empresas | Formato | Licencia |
|---|---|---|---|---|---|
| industrybench-anzsic-l1-graded | ANZSIC 2006 | Division (L1) | mismas que NAICS/ISIC/NACE | BEIR graduado | other (pendiente) |
| industrybench-isic-l1-graded | ISIC Rev.4 | L1 | mismas empresas | BEIR graduado | other |
| Repos hermanos ANZSIC L2/L3/L4 | ANZSIC 2006 | Subdivision/Grupo/Clase | mismas empresas | BEIR graduado | other |
| Repos NAICS y NACE | NAICS 2022 / NACE | varios | mismas empresas | BEIR graduado | other |

La principal diferencia frente a los repos NAICS, ISIC y NACE es la fiabilidad de las etiquetas: al encadenar dos saltos (NAICS→ISIC→ANZSIC) y ser la correspondencia ISIC↔ANZSIC de muchos a muchos, las etiquetas ANZSIC son más difusas que las de las taxonomías de origen.

## Limitaciones y advertencias

- Las etiquetas son derivadas, no anotadas por humanos, y acumulan los errores de las etiquetas NAICS y de los dos crosswalks.
- Ambigüedad alta: el 23% de las empresas de test tienen más de un código de grado 2 a nivel de división, el 53% a nivel de subdivisión, el 66% a nivel de grupo y el 72% a nivel de clase.
- Una empresa tiene de media unas 25 clases relevantes, lo que obliga a usar métricas graduadas y multiobjetivo (nDCG, MAP) en lugar de exactitud.
- Los documentos del corpus son solo títulos, sin descripciones, lo que limita la señal textual disponible para el recuperador.
- Empresas cuyo NAICS primario no mapea a ninguna clase ISIC válida quedan sin etiqueta de grado 2 (`primary_status` = `missing`).
- Licencia sin confirmar: `license: other` es un marcador de posición y la model card incluye un TODO pendiente sobre la fuente de las descripciones y las condiciones de reutilización de ANZSIC (ABS/Stats NZ) y de los crosswalks del Census.
- Idioma limitado a inglés.
- Sin descargas ni likes: no hay evidencia de uso o validación por parte de la comunidad.
- Repositorio con fecha de creación futura (2026-11-07) según los metadatos, lo que sugiere que puede tratarse de un borrador no publicado formalmente.

## Enlaces

- Hugging Face: https://huggingface.co/blackmlengineer/industrybench-anzsic-l1-graded
- Repo hermano ISIC L1: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l1-graded
- Árbol de ficheros del repo ISIC L1: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l1-graded/tree/main
- Repos hermanos citados en la model card: `ANZSIC-Company-Classification-L1`, `-L2-`, `-L3-`, `-L4-` y `ISIC4-Company-Classification` (no se proporcionan URLs directas)
- WorkRB (`GradedBEIRRankingTask`): no se proporciona URL
- ABS ISIC Rev.4 ↔ ANZSIC 2006: no se proporciona URL
- U.S. Census Bureau (crosswalk NAICS-ISIC y concordancia NAICS 2022-2017): no se proporciona URL
