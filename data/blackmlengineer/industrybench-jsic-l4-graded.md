# blackmlengineer/industrybench-jsic-l4-graded

## Resumen

`industrybench-jsic-l4-graded` es un conjunto de datos de evaluacion (benchmark) para clasificacion jerarquica de empresas en codigos de industria, publicado por el usuario `blackmlengineer` en Hugging Face. No se trata de un modelo de lenguaje, sino de un dataset en formato BEIR (con configuraciones `queries`, `corpus` y `qrels`) que empareja descripciones de empresas con los 1270 codigos de industria de la revision 13 de la JSIC (Japan Standard Industrial Classification). Su nivel "L4" corresponde al nivel de industria a 4 digitos.

El dataset forma parte de una familia de repositorios hermanos (`JSIC-Company-Classification-L1`, `-L2-`, `-L3-`, `-L4-`) y de conjuntos equivalentes para NAICS e ISIC. El objetivo es permitir la evaluacion de sistemas de recuperacion y clasificacion en un escenario multietiqueta con relevancia graduada: cada empresa puede tener varias industrias relevantes, con grado 2 (derivada del codigo NAICS primario) o grado 1 (derivada solo de codigos secundarios).

Es relevante porque proporciona una tarea de recuperacion a gran escala (97 841 consultas de entrenamiento, 12 304 de test) contra un corpus pequeno pero muy granular (1270 documentos), con metricas adecuadas para relevancia graduada como nDCG o MAP. No obstante, las etiquetas son derivadas automaticamente mediante crosswalks, no anotadas por humanos, lo que condiciona su uso como referencia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (titulos de industria en ingles; los titulos japoneses no se incluyen) |
| Licencia | other (marcador de posicion segun el propio autor; pendiente de confirmar) |
| Formato de pesos | Parquet (configs `queries`, `corpus`, `qrels`); tamano del repo 0.0 GB reportado en la ficha, 21.3 MB en el repo hermano ISIC |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene pesos ni un modelo entrenado, sino datos de evaluacion estructurados en el esquema BEIR. La configuracion `queries` contiene `_id` y `text` (descripciones de empresas) con splits de 97 841 filas en train, 12 247 en validation y 12 304 en test. La configuracion `corpus` contiene 1270 filas con `_id` (codigo JSIC: letra de division, grupo mayor a 2 digitos, grupo a 3 digitos e industria a 4 digitos), `title`, `jsic_version` y `parent`. La configuracion `qrels` contiene 4 302 470 juicios en train, 535 555 en validation y 546 512 en test, con columnas `query-id`, `corpus-id` y `score`.

Las etiquetas se derivaron en dos saltos: NAICS → ISIC Rev.4 (crosswalk del U.S. Census Bureau) y despues ISIC Rev.4 → JSIC Rev.13 invirtiendo la tabla oficial del Statistics Bureau of Japan. Puesto que JSIC es mucho mas fino que ISIC (1270 industrias frente a 419 clases), 292 de las 412 clases ISIC enlazadas se ramifican en dos o mas industrias JSIC (hasta 28). El grado 2 se asigna a los codigos JSIC alcanzados desde el NAICS primario de la empresa y el grado 1 a los alcanzados solo desde NAICS secundarios. Los pesos son un reparto uniforme en cada salto porque las tablas no llevan pesos. Se eliminaron descripciones de train que aparecian en validation o test, y las descripciones identicas en validation/test se fusionaron (25 en cada split) con union de juicios y grado maximo.

## Capacidades

- Evaluacion de recuperacion de informacion con relevancia graduada (grados 1 y 2) en esquema BEIR.
- Evaluacion de clasificacion jerarquica multietiqueta a cuatro niveles (division, grupo mayor, grupo e industria).
- Carga directa con `datasets.load_dataset` de Hugging Face y con la tarea `GradedBEIRRankingTask` de WorkRB.
- Comparabilidad directa con los datasets hermanos L1, L2 y L3 y con los equivalentes NAICS e ISIC, al compartir consultas, splits y deduplicacion.
- Soporte de metricas de ranking graduado: nDCG y MAP como metricas recomendadas por el autor.
- No incluye capacidades de generacion, razonamiento, codigo, vision, tool calling ni agentes: es exclusivamente un recurso de datos.

## Casos de uso

- Evaluacion de sistemas de clasificacion de industrias: permite medir nDCG y MAP de un recuperador o clasificador sobre 1270 codigos JSIC con juicios graduados, usando el split de test de 12 304 consultas.
- Benchmarking de modelos de embeddings: las descripciones de empresas y los titulos de industria permiten evaluar la calidad de representaciones densas o dispersas en un dominio especializado y de vocabulario tecnico.
- Investigacion en recuperacion jerarquica: la estructura `parent` del corpus permite evaluar estrategias que explotan la jerarquia (division → grupo mayor → grupo → industria) y comparar su ganancia frente a un ranking plano.
- Estudios de robustez ante etiquetas ruidosas: al ser etiquetas derivadas con ambiguedad conocida (81 % de empresas con mas de un grado 2 a nivel de industria), sirve para analizar como se comportan las metricas bajo ruido de juicios.
- Comparacion cross-taxonomia: junto con los repositorios NAICS e ISIC sobre las mismas empresas, permite estudiar la transferibilidad de un sistema entre taxonomias industriales.
- Validacion de pipelines de datos: util para probar la integracion con WorkRB y con el formato BEIR antes de desplegar en produccion un sistema de clasificacion sectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de modelo: el recurso es un dataset Parquet de aproximadamente 21.3 MB en el repositorio hermano ISIC y de tamano no especificado en este (la ficha reporta 0.0 GB).
- Carga en memoria: los qrels de entrenamiento (4 302 470 filas) son la parte mas pesada; se recomienda cargar solo el split necesario y usar tipos compactos.
- CPU suficiente para la carga y el procesado con `datasets`, pandas o Polars; no requiere GPU.
- Para evaluar modelos de embeddings sobre el dataset, el hardware dependera del modelo elegido, no del dataset.
- Opciones de despliegue: `datasets` de Hugging Face, pandas, Polars y WorkRB para la tarea de ranking graduado.

## Comparativa con modelos similares

| Dataset | Nivel | Corpus | Consultas test | Etiquetas | Licencia |
|---|---|---|---|---|---|
| `industrybench-jsic-l4-graded` | JSIC Rev.13, industria (4 digitos) | 1270 codigos | 12 304 | Derivadas, graduadas 1/2 | other |
| `JSIC-Company-Classification-L1` | JSIC, division | no disponible | no disponible | Derivadas | other |
| `JSIC-Company-Classification-L2` | JSIC, grupo mayor | no disponible | no disponible | Derivadas | other |
| `JSIC-Company-Classification-L3` | JSIC, grupo | no disponible | no disponible | Derivadas | other |
| `industrybench-isic-l4-graded` | ISIC Rev.4, clase | no disponible (repo de 21.3 MB) | no disponible | Derivadas, graduadas | other |

## Limitaciones y advertencias

- Las etiquetas son derivadas automaticamente, no anotadas por humanos; su calidad esta acotada por la de las etiquetas NAICS originales y por la de los crosswalks empleados.
- Ambiguedad alta del primario: el 15 % de las empresas de test tiene mas de un codigo de grado 2 a nivel de division, el 47 % a nivel de grupo mayor, el 71 % a nivel de grupo y el 81 % a nivel de industria; en promedio hay unas 45 industrias relevantes por empresa.
- Se recomienda usar metricas graduadas y multietiqueta (nDCG, MAP) y tratar division y grupo mayor como los niveles mas fiables.
- Codigos excluidos: los grupos de "actividades administrativas o auxiliares" y "industrias no clasificables" no estan en el corpus; ISIC 7010 solo mapea a 7282 (sociedades holding puras).
- Codigos sin enlace: siete clases ISIC (`0150`, `3313`, `3319`, `3900`, `4930`, `9810`, `9820`) no tienen contrapartida JSIC, de modo que las empresas cuyo NAICS primario solo alcanza esas clases no tienen etiqueta de grado 2 y estan ausentes de los repositorios BEIR. Seis industrias JSIC (entre ellas `9094` herrerias) nunca son relevantes.
- Vigencia: Rev.13 es la revision de 2013 y el libro de correspondencia usado esta marcado como PROVISIONAL; Japon ha adoptado revisiones posteriores, por lo que conviene verificar si Rev.13 es adecuada para el caso de uso.
- Los pesos de grado 2 son uniformes por construccion al no llevar pesos las tablas de correspondencia.
- Solo se incluyen los titulos en ingles; los japoneses no estan disponibles. Trece titulos de industria aparecen duplicados bajo codigos distintos.
- Licencia `other` sin concretar: el propio autor indica que es un marcador de posicion y que debe confirmarse antes de publicar; ademas hay que verificar las condiciones de reutilizacion del workbook del Statistics Bureau of Japan y de los ficheros del U.S. Census Bureau.
- El repositorio no registra descargas ni likes y tiene pipeline no disponible; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/blackmlengineer/industrybench-jsic-l4-graded
- Repositorio hermano ISIC L4: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l4-graded
- Arbol de ficheros del repositorio hermano ISIC: https://huggingface.co/datasets/blackmlengineer/industrybench-isic-l4-graded/tree/main
- Repositorios hermanos citados en la model card: `JSIC-Company-Classification-L1`, `JSIC-Company-Classification-L2`, `JSIC-Company-Classification-L3`, `JSIC-Company-Classification-L4`, `ISIC4-Company-Classification` (sin URL directa en la informacion disponible)
- WorkRB (`GradedBEIRRankingTask`): no disponible
- Statistics Bureau of Japan (JSIC Rev.13 y tabla de correspondencia ISIC Rev.4): no disponible
- U.S. Census Bureau (crosswalk NAICS-ISIC y concordancia NAICS 2022-2017): no disponible
