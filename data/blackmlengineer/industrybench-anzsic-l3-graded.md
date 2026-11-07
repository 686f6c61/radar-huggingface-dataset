# blackmlengineer/industrybench-anzsic-l3-graded

## Resumen

`blackmlengineer/industrybench-anzsic-l3-graded` no es un modelo de lenguaje, sino un conjunto de datos de evaluacion (benchmark) para clasificacion jerarquica de empresas segun la taxonomia ANZSIC 2006 de Australia y Nueva Zelanda, en su nivel 3 (Group). Lo publica el usuario `blackmlengineer` dentro de la familia `industrybench-*`, que replica la misma estructura para NAICS, ISIC y NACE. El dataset sigue el formato BEIR (`queries`, `corpus`, `qrels`) con relevancia graduada y esta pensado para cargarse con `GradedBEIRRankingTask` de WorkRB, de forma analoga a los datasets `TechWolf/Skill-extraction-*-graded`.

El problema que resuelve es la falta de un benchmark publico y reproducible para medir la calidad de sistemas de clasificacion de industria a nivel de grupo ANZSIC (214 codigos) sobre descripciones de empresa en ingles. Incluye 98.604 queries de entrenamiento, 12.344 de validacion y 12.391 de test, con qrels dispersos de 1,37 M, 171.575 y 174.855 juicios respectivamente, y un corpus de solo 214 documentos (los titulos de los codigos).

Es relevante ahora porque permite comparar recuperadores y clasificadores sobre las mismas empresas que los benchmarks NAICS, ISIC y NACE del mismo autor, con splits y deduplicacion identicos. Conviene advertir desde el principio de que las etiquetas son derivadas, no anotadas por humanos, mediante dos saltos (NAICS → ISIC Rev.4 → ANZSIC 2006), lo que introduce ambiguedad estructural considerable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other (marcador de posicion segun el propio autor) |
| Formato de pesos | Parquet (configs `queries`, `corpus`, `qrels`); tamano del repo 0.0 GB |

## Arquitectura y entrenamiento

El artefacto es un dataset en formato BEIR con tres configuraciones: `queries` (`_id`, `text`) con splits train/validation/test de 98.604 / 12.344 / 12.391 filas; `corpus` (split unico `corpus`, 214 filas con `_id`, `title`, `anzsic_version`, `parent`); y `qrels` (`query-id`, `corpus-id`, `score`) con 1.375.943 / 171.575 / 174.855 juicios. El `_id` del corpus es el codigo ANZSIC plano (letra de division, subdivision de 2 digitos, grupo de 3 digitos, clase de 4 digitos) y `parent` apunta al codigo del nivel superior (null para secciones). Los documentos son unicamente titulos.

Las etiquetas se derivan en dos saltos: primero NAICS → ISIC Rev.4 mediante el crosswalk del Census de EE. UU., y despues ISIC Rev.4 → ANZSIC 2006 con la correspondencia oficial del ABS (union de sus dos direcciones). A diferencia de NACE, ANZSIC no anida dentro de ISIC: la correspondencia es muchos-a-muchos y la mitad de las 419 clases ISIC mapean a dos o mas clases ANZSIC (hasta 21). El grado 2 corresponde a codigos alcanzados desde el NAICS primario de la empresa y el grado 1 a los alcanzados solo desde NAICS secundarios. Los qrels son dispersos (solo juicios no nulos) y los pesos se reparten por igual en cada salto.

## Capacidades

- Evaluacion de recuperacion y ranking con relevancia graduada (grados 1 y 2) sobre 214 codigos ANZSIC de nivel 3.
- Clasificacion jerarquica multi-etiqueta: los codigos se despliegan a grupo, subdivision y division de forma consistente.
- Evaluacion con metricas graduadas multi-objetivo (nDCG, MAP) en cada nivel de la jerarquia.
- Comparabilidad directa con los datasets hermanos NAICS, ISIC y NACE al compartir queries, splits y deduplicacion.
- Carga mediante `datasets.load_dataset` con las configs `queries`, `corpus` y `qrels`.
- Integracion con WorkRB a traves de `GradedBEIRRankingTask`.
- Idioma unico: ingles.

## Casos de uso

- Evaluacion de recuperadores densos o sparse para clasificacion de industria: se indexan los 214 titulos ANZSIC del corpus y se mide nDCG@k o MAP sobre las descripciones de empresa del split de test, usando los qrels graduados como referencia.
- Benchmarking de modelos de embeddings en un dominio regulatorio y economico: permite comparar Sentence-BERT, E5, BGE u otros sobre un corpus pequeno y estable, aislando la calidad del encoder del ruido del corpus.
- Clasificacion jerarquica en pipelines de onboarding de empresas: un sistema que asigne codigo ANZSIC a descripciones libres puede validarse contra este dataset antes de desplegarse en un CRM o en un proceso KYC.
- Investigacion en relevancia graduada: los grados 1 y 2 permiten estudiar funciones de ganancia y metricas graduadas en un escenario con etiquetas parcialmente ambiguas y multiples positivos por query.
- Analisis de sensibilidad al nivel jerarquico: al disponer de division, subdivision, grupo y clase, se puede medir como cae el rendimiento a medida que se baja en la taxonomia y decidir hasta que nivel es fiable un clasificador.
- Comparacion cruzada de taxonomias: al compartir empresas con los repos NAICS, ISIC y NACE, sirve para analizar que taxonomia es mas facil de predecir para un mismo modelo y conjunto de empresas.
- Validacion de sistemas de enriquecimiento de datos B2B: empresas que enriquecen fichas de clientes con codigos de industria pueden usar el split de test como gold set de referencia para regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de modelo: el dataset se carga en memoria o se procesa con pandas/Polars.
- Tamano del repositorio: 0.0 GB reportado; el repo hermano ISIC ocupa 20,8 MB, por lo que el footprint de disco es minimo.
- Memoria RAM: suficiente con un equipo de desarrollo convencional; los qrels de entrenamiento (1,37 M de filas) son la parte mas pesada y caben holgadamente en unos pocos cientos de MB.
- GPU: no necesaria para cargar el dataset; solo se requiere si el sistema evaluado (encoder, reranker) se ejecuta en GPU.
- Despliegue: `datasets` de Hugging Face, pandas o Polars; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen enteramente del modelo evaluado, no del dataset.

## Comparativa con modelos similares

| Dataset | Taxonomia | Nivel | Queries test | Corpus | Licencia | Formato |
|---|---|---|---|---|---|---|
| industrybench-anzsic-l3-graded | ANZSIC 2006 | Group (3 digitos) | 12.391 | 214 | other | BEIR / Parquet |
| industrybench-isic-l3-graded | ISIC Rev.4 | Clase | no disponible | no disponible | other | BEIR / Parquet |
| Repos hermanos NAICS / NACE (mismo autor) | NAICS / NACE | L1-L4 | no disponible | no disponible | other | BEIR / Parquet |
| TechWolf/Skill-extraction-*-graded | Skills | no disponible | no disponible | no disponible | no disponible | BEIR / Parquet |

## Limitaciones y advertencias

- Las etiquetas son derivadas, no anotadas por humanos: encadenan dos saltos con perdida (NAICS → ISIC → ANZSIC) y no pueden ser mas precisas que las etiquetas NAICS de origen ni que los crosswalks empleados.
- Ambiguedad alta del primario: el 23% de las empresas de test tiene mas de un codigo de grado 2 a nivel de division, el 53% a nivel de subdivision, el 66% a nivel de grupo y el 72% a nivel de clase; en promedio hay unos 25 codigos relevantes por empresa.
- ANZSIC no anida dentro de ISIC: la correspondencia es muchos-a-muchos y no se usan los indicadores de coincidencia parcial del ABS, lo que anade ruido.
- Los pesos se reparten por igual en cada salto porque las tablas de correspondencia no traen pesos; los pesos de grado 2 son uniformes por construccion.
- Empresas cuyo NAICS primario no mapea a ninguna clase ISIC valida quedan sin etiqueta de grado 2 (`primary_status` = `missing`).
- Los documentos del corpus son solo titulos, sin descripciones; la senal textual para el recuperador es muy limitada.
- Idioma unico ingles: no cubre descripciones de empresa en otros idiomas.
- Licencia `other` declarada como marcador de posicion por el propio autor: antes de un uso comercial hay que verificar los terminos de reutilizacion del ABS y Stats NZ para ANZSIC 2006 y su correspondencia con ISIC Rev.4, y los del Census de EE. UU. para los crosswalks NAICS-ISIC.
- La model card incluye un TODO explicito sobre la procedencia de las descripciones de empresa y las etiquetas NAICS originales, sin resolver en la informacion disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion externa por la comunidad.

## Enlaces

- Dataset en Hugging Face: https://huggingface.co/blackmlengineer/industrybench-anzsic-l3-graded
- Repo hermano ISIC (estructura de referencia): https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l3-graded/tree/main
- WorkRB (framework de evaluacion con `GradedBEIRRankingTask`): no disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
