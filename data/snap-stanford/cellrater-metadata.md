# snap-stanford/cellrater-metadata

## Resumen

CellRater (metadata) es un modelo de valoración de datos a nivel de célula individual para datos de secuenciación de ARN de célula única (scRNA-seq). Lo publica la organización snap-stanford y su función no es generar texto ni hacer predicciones biológicas directas, sino asignar una puntuación a cada célula que estima cuánto contribuiría esa célula al entrenamiento de un modelo proxy de estilo UCE (Universal Cell Embedding). Las puntuaciones son logits crudos y solo tienen sentido como ranking relativo dentro de un mismo dataset.

El modelo puntúa cada célula a partir de un embedding de frase de sus metadatos (cell_type, tissue_general, tissue, development_stage, disease, assay, suspension_type y sex), construido con embeddings Matryoshka de 256 dimensiones de text-embedding-3-small, y opcionalmente incorpora características numéricas derivadas del recuento (log1p de nnz y raw_sum). Está implementado en JAX y se distribuye con la librería cellrater en formato propietario cellrater-npz-v1, versión 0.1.0.

Su relevancia actual es práctica: la curación de corpus de célula única es un cuello de botella caro, y disponer de una señal aprendida por célula permite priorizar, ponderar o podar colecciones antes de entrenar modelos fundacionales. Se publica bajo licencia MIT y con un tamaño de repositorio inferior a 0,1 GB, lo que refleja que el artefacto es un cabezal ligero, no una red de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de valoración por célula entrenado mediante optimización bilevel; cabezal sobre embeddings de metadatos (no es un transformer generativo). Implementado en JAX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo autoregresivo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato NumPy .npz; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la entrada textual son metadatos tabulares) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`model.npz`) con configuración de constructor en `__config__`; formato `cellrater-npz-v1`; metadatos en `config.json` |
| Dimension de entrada de metadatos | 256 (embeddings Matryoshka de text-embedding-3-small) |
| Caracteristicas numericas opcionales | log1p de `nnz` y de `raw_sum` (activables con `use_numerical_features`) |
| Salida | Array `(2, N)`: fila 0 índice de fila del corpus, fila 1 puntuación (logit crudo) |
| Libreria | cellrater 0.1.0 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |
| Fecha de actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

CellRater se aparta del paradigma de los modelos fundacionales de célula única. No procesa la matriz de expresión génica para producir un embedding biológico; de hecho, la model card indica explícitamente que este modelo nunca lee los recuentos, aunque el pipeline exija una lista ordenada de genes para construir el layout del corpus. Lo que hace es tomar una representación de los metadatos de la célula —ocho columnas categóricas transformadas en una frase y codificadas con embeddings Matryoshka de 256 dimensiones de text-embedding-3-small— y, si se activa `use_numerical_features`, añadir log1p de `nnz` y de `raw_sum`. Sobre esa entrada produce un logit por célula.

El entrenamiento se plantea como una optimización bilevel: los scores del modelo se utilizan como pesos de pérdida por célula y se ajustan de forma que mejoren la pérdida en un conjunto de validación de un modelo proxy de estilo UCE. Es decir, CellRater es un modelo meta-aprendido de valoración de datos, no un clasificador ni un generador. La model card no detalla el número de tokens, la composición del dataset de entrenamiento, el número de parámetros ni si se emplearon técnicas de alineación tipo RLHF o DPO; esos datos no están disponibles en la información proporcionada.

Un detalle operativo relevante es el tratamiento de combinaciones de metadatos ausentes: aquellas que no aparecen en la tabla de frases (`sentences.parquet`) se puntúan con el embedding cero y se contabilizan aparte como `unknown_combos`, lo que convierte esa métrica en una señal indirecta de cobertura y de rareza de metadatos.

## Capacidades

- Puntuación por célula: asigna un logit a cada célula de un corpus a partir de sus metadatos, interpretable únicamente como ranking relativo dentro del mismo dataset.
- Valoración de datos meta-aprendida: los scores están optimizados para actuar como pesos de pérdida por célula y mejorar la pérdida en validación de un proxy de estilo UCE.
- Uso de metadatos categóricos: integra cell_type, tissue_general, tissue, development_stage, disease, assay, suspension_type y sex a través de un embedding de frase de 256 dimensiones.
- Señal numérica opcional: incorpora log1p de `nnz` y `raw_sum` cuando se activa `use_numerical_features`.
- Detección de cobertura de metadatos: las combinaciones ausentes en la tabla de frases se marcan con el embedding cero y se cuentan como `unknown_combos`.
- Ejecución en CPU: soporta `JAX_PLATFORMS=cpu`, sin requerir acelerador.
- Integración en pipelines de anndata: `cellrater-prepare` construye el corpus a partir de un fichero `.h5ad` y las puntuaciones pueden devolverse a `adata.obs`.
- No dispone de generación de texto, razonamiento, código, visión, tool calling, capacidades de agente ni soporte multilingüe; no es un modelo de lenguaje.

## Casos de uso

- Curación de corpus para modelos fundacionales de célula única: antes de entrenar un modelo tipo UCE, ejecutar CellRater sobre la colección completa y conservar las células con mejor ranking para reducir el volumen de datos sin degradar la pérdida en validación del proxy.
- Poda de datasets con restricción de presupuesto de cómputo: usar el ranking por célula para seleccionar un subconjunto de las colecciones más grandes (por ejemplo, agregados de CELLxGENE) y recortar las horas de GPU necesarias para el entrenamiento posterior.
- Ponderación de pérdida por célula en entrenamiento: emplear los logits como pesos directamente en la función de pérdida del modelo proxy, que es el escenario para el que el modelo fue meta-entrenado.
- Auditoría de cobertura de metadatos: analizar la proporción de `unknown_combos` para detectar categorías, tejidos o estadios de desarrollo poco representados en la tabla de frases y decidir si conviene ampliarla.
- Priorización de muestras en experimentos con secuenciación limitada: puntuar un lote nuevo y ordenar las células para decidir cuáles merecen caracterización adicional o inclusión en un estudio comparativo.
- Evaluación comparativa de lotes o estudios: calcular la distribución de rankings de cada lote y detectar desplazamientos sistemáticos que sugieran diferencias de anotación o de composición.
- Ingesta automatizada en pipelines bioinformáticos: integrar `cellrater-prepare` y `cellrater-score` en un flujo que reciba un `.h5ad`, genere `gold_metadata_scores.npy` y escriba las puntuaciones de vuelta en `adata.obs` para consumo posterior.
- Filtrado previo a anotación manual: reducir el número de células que un experto debe revisar, ordenando por score antes de la inspección manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas, comparaciones con líneas base ni curvas de evaluación; únicamente describe el criterio de entrenamiento (mejora de la pérdida en validación de un proxy de estilo UCE) y el formato de salida.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y los pesos se distribuyen en un único fichero `.npz`, por lo que el modelo cabe holgadamente en memoria de sistema. No se publica el número de parámetros.
- GPU: no se especifica ninguna GPU recomendada. Al estar implementado en JAX, puede ejecutarse con JAX sobre CUDA si hay una GPU disponible, pero no es un requisito documentado.
- Ejecución en CPU: soportada explícitamente mediante `JAX_PLATFORMS=cpu` en el ejemplo de uso de la model card.
- Cabe en GPU de consumo: sí, con toda probabilidad, dado el tamaño del artefacto; no se publican cifras de VRAM que lo confirmen.
- Opciones de despliegue: interfaz de línea de comandos de la librería cellrater (`cellrater-prepare`, `cellrater-score`) y uso programático en Python/JAX. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste dominante en un flujo real no es la inferencia del cabezal, sino la generación previa de los embeddings de metadatos con text-embedding-3-small y la preparación del corpus desde `.h5ad`.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. CellRater pertenece a la familia de métodos de valoración de datos (junto a enfoques como Data Shapley o los datamodels), pero la model card no incluye comparaciones cuantitativas frente a ellos ni frente a otros modelos de la organización. Como referencia interna del propio proyecto, existe un modelo complementario, `snap-stanford/cellrater-gex`, que opera sobre la expresión génica y que comparte el pipeline de corpus y la lista ordenada de genes.

| Modelo | Categoria | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| snap-stanford/cellrater-metadata | Valoracion de datos de scRNA-seq (solo metadatos) | no disponible | no aplica | MIT | no disponible |
| snap-stanford/cellrater-gex | Valoracion de datos de scRNA-seq (expresion genica) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible |
| Data Shapley / datamodels | Valoracion de datos generica | no aplica | no aplica | no aplica | no disponible |

## Limitaciones y advertencias

- Interpretación de las puntuaciones: son logits crudos y no probabilidades. Solo el ranking relativo dentro de un mismo dataset tiene significado; comparar valores absolutos entre datasets distintos no es válido.
- Dependencia del proxy: los scores están optimizados para mejorar la pérdida en validación de un proxy de estilo UCE en el ajuste publicado. Si el modelo objetivo final difiere, la señal puede no transferirse.
- Cobertura de metadatos: cualquier combinación de las ocho columnas ausente en `sentences.parquet` se puntúa con el embedding cero, lo que degrada la puntuación y se registra como `unknown_combos`. La utilidad del modelo depende de la cobertura de esa tabla.
- Dependencia de anotaciones: la entrada son metadatos anotados; errores o criterios heterogéneos de anotación entre estudios se propagan directamente a las puntuaciones.
- Restricción de pipeline: aunque el modelo no lee los recuentos, `cellrater-prepare` exige una lista ordenada de genes que solape con los datos, lo que añade un requisito operativo.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar el beneficio real de filtrar o ponderar con CellRater frente a alternativas más simples.
- Madurez: versión 0.1.0, con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de investigación recién publicado y sin validación externa amplia.
- Licencia: MIT, que permite uso comercial y modificación con atribución y sin garantías; conviene revisar si el pipeline asociado y los embeddings de terceros (text-embedding-3-small, de OpenAI) imponen condiciones adicionales.
- Uso inadecuado: no debe emplearse como clasificador de calidad biológica de una célula ni como sustituto de controles de calidad de scRNA-seq; mide utilidad esperada para un proxy concreto, no calidad experimental.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe el riesgo de sobreinterpretar las puntuaciones como una medida absoluta de valor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snap-stanford/cellrater-metadata
- Modelo complementario de expresión génica (referenciado en la model card): https://huggingface.co/snap-stanford/cellrater-gex
- Repositorio cellrater con el tutorial `docs/tutorial_score_your_cells.md` (referenciado en la model card; URL no confirmada en la informacion proporcionada)
- Org en HuggingFace: https://huggingface.co/snap-stanford
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados devueltos corresponden a páginas de consumo de Snapchat y no guardan relación con el modelo.
