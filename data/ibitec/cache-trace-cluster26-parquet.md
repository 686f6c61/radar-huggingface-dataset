# ibitec/cache-trace-cluster26-parquet

## Resumen

`ibitec/cache-trace-cluster26-parquet` no es un modelo de lenguaje, sino un conjunto de datos derivado de las trazas de caché publicadas por Twitter (actualmente X) en el marco del estudio de Yang, Yue y Vinayak presentado en OSDI 2020. Concretamente, se trata del shard completo `cluster26` del espejo oficial de trazas de caché, convertido del formato original CSV comprimido con zstd a parquet también comprimido con zstd. El repositorio lo publica el usuario `ibitec` bajo licencia CC-BY 4.0.

El interés del artefacto reside en que facilita el trabajo con una traza de 156.594.627 peticiones sin necesidad de parsear CSV de gran tamaño: el parquet conserva el orden de filas y las columnas del CSV original, y el autor indica que las primeras 5 millones de filas se verificaron columna a columna contra el fichero fuente. El paquete incluye un `manifest.json` que mapea cada parte a su rango de peticiones, pensado para alimentar la herramienta `mrc train --store`.

Es relevante para investigadores y desarrolladores que trabajan en políticas de reemplazo de caché, análisis de reuse distance, simulación de Miss Ratio Curves (MRC) y evaluación de sistemas de memoria caché a gran escala. No contiene pesos, tokenizador ni pipeline de inferencia: cualquier ficha de "modelo" debe interpretarse aquí en clave de dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un dataset tabular de trazas de caché) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (los datos no son texto lingüístico; son registros de peticiones) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | no disponible; formato de datos: parquet con compresión zstd |

Otras especificaciones del dataset:

| Parametro | Valor |
|---|---|
| Peticiones totales | 156.594.627 |
| Partes | 1 |
| Tamano en parquet | 1.265.122.743 bytes (aprox. 1,18 GiB) |
| Row group | 5.000.000 peticiones |
| Compresion | zstd |
| Fuente | `cluster26.sort.zst` |
| SHA-256 de la fuente | `5860b1ab7dad54bb844539a35071a7928a1d1de244c74fa42865acdd0e2ad884` |
| Metadatos auxiliares | `manifest.json` con mapeo parte-rango de peticiones |
| Categoría de tarea declarada | `tabular-classification` |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay arquitectura de red, ni entrenamiento, ni ajuste por RLHF/DPO. El artefacto es una conversión de formato de una traza de producción de un clúster de caché en memoria de Twitter. La transformación consiste en leer el fichero `cluster26.sort.zst` del espejo oficial del PDL de CMU y reescribirlo como parquet con compresión zstd, manteniendo columnas y orden de filas del CSV de origen.

La innovación técnica, si puede llamarse así, es la verificación de integridad: el autor comprobó las primeras 5.000.000 de filas contra el CSV en todas las columnas, y documenta el SHA-256 del fichero fuente para trazabilidad. El tamaño de row group (5 millones de peticiones) está pensado para que el particionado sea manejable en memoria durante el procesamiento por lotes. El `manifest.json` permite que herramientas como `mrc train --store` localicen el rango de peticiones correspondiente a cada parte.

## Capacidades

- Almacenar y servir 156.594.627 registros de peticiones de caché en un único fichero parquet comprimido con zstd.
- Preservar el esquema de columnas y el orden de filas del CSV original de Twitter.
- Permitir lectura columnar selectiva, lo que reduce el coste de E/S frente al CSV al analizar solo los campos necesarios.
- Servir de entrada para cálculo de reuse distance y para el entrenamiento o evaluación de políticas de reemplazo de caché.
- Servir de base para simulaciones de Miss Ratio Curves (MRC) mediante la herramienta `mrc`.
- Facilitar la reproducibilidad gracias al SHA-256 de la fuente y a la verificación documentada de las primeras 5 millones de filas.
- Integrarse en pipelines de análisis tabular con motores que lean parquet (DuckDB, Polars, pandas con pyarrow, Spark, etc.).

## Casos de uso

- Investigación en políticas de caché: cargar la traza en un simulador y comparar LRU, LFU, ARC, LIRS o políticas basadas en aprendizaje, midiendo la tasa de fallos sobre las 156,6 millones de peticiones reales del clúster 26.
- Cálculo de Miss Ratio Curves: usar el `manifest.json` para alimentar `mrc train --store` y generar curvas MRC que relacionen tamaño de caché con tasa de fallos, con datos de producción en lugar de trazas sintéticas.
- Análisis de reuse distance: calcular la distribución de distancias de reutilización por objeto para estimar el tamaño óptimo de caché y detectar patrones de acceso (temporal, frecuencial, scan).
- Evaluación de sistemas de almacenamiento en memoria: usar la traza como carga de trabajo de referencia para validar el rendimiento de un nuevo motor de caché distribuido antes de desplegarlo.
- Docencia y reproducibilidad: al estar en un único fichero parquet de aproximadamente 1,18 GiB, es viable distribuirlo en cursos o entornos de laboratorio y reproducir resultados del paper de OSDI 2020.
- Benchmarking de motores analíticos: medir el rendimiento de DuckDB, Polars o Spark al agregar por columnas sobre 156 millones de filas con compresión zstd, como prueba de carga realista.
- Generación de cargas sintéticas calibradas: derivar modelos estadísticos de la traza (distribuciones de tamaño de objeto, popularidad, intervalos entre accesos) para generar trazas sintéticas con propiedades realistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta métricas del propio dataset (número de peticiones, tamaño en bytes, tamaño de row group, compresión y verificación de integridad), no resultados de rendimiento de sistemas.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia neuronal. El requisito relevante es memoria RAM y espacio en disco.
- Disco: aproximadamente 1,18 GiB para el parquet comprimido con zstd.
- RAM: depende del motor de consulta. Para lectura completa con pandas/pyarrow conviene disponer de varios GiB libres; para procesamiento por row groups (5 millones de peticiones por grupo) puede trabajarse con un consumo acotado, aunque el tamaño exacto por grupo no está documentado.
- GPU recomendadas: no aplica. Cualquier GPU es irrelevante para este artefacto; el cuello de botella es E/S de disco y CPU.
- Cabe en cualquier equipo consumer: sí, siempre que haya espacio en disco suficiente para el fichero y para las salidas intermedias del análisis.
- Opciones de despliegue: DuckDB, Polars, pandas con pyarrow, Apache Spark, Apache Arrow, y la herramienta `mrc` del ecosistema citado en la model card. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependen enteramente del motor, del hardware y del tipo de consulta; no se han publicado cifras.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | Peticiones | Formato | Licencia |
|---|---|---|---|---|---|
| `ibitec/cache-trace-cluster26-parquet` | Traza de caché (dataset) | aprox. 1,18 GiB | 156.594.627 | parquet + zstd | CC-BY 4.0 |
| `cluster26.sort.zst` (espejo oficial PDL CMU) | Traza de caché (dataset) | no disponible | 156.594.627 (mismo shard) | CSV + zstd | CC-BY 4.0 |
| Otros shards del espejo de Twitter (por ejemplo, otros clústeres) | Traza de caché (dataset) | no disponible | no disponible | CSV + zstd | CC-BY 4.0 |

La comparación relevante es contra el fichero fuente original: mismo contenido lógico, distinto formato de almacenamiento. El parquet ofrece lectura columnar y mejor compresión práctica para analítica; el CSV original es el formato canónico del espejo oficial. No se dispone de datos para comparar con otros datasets de trazas de caché en cuanto a rendimiento o calidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de inferencia es un error de categoría.
- La categoría `tabular-classification` declarada en los metadatos no describe el contenido real; la traza es un registro de accesos, no un conjunto etiquetado para clasificación supervisada.
- Los datos provienen de un único clúster de Twitter y de un periodo concreto; generalizar conclusiones a otras cargas de trabajo requiere validación adicional.
- La verificación de integridad documentada cubre solo las primeras 5.000.000 de filas; el resto no se declara verificado explícitamente en la model card.
- Solo hay una parte y un `manifest.json`; no se documenta el esquema de columnas en la información disponible, por lo que hay que inspeccionar el parquet para conocer los campos.
- La licencia CC-BY 4.0 permite uso comercial con atribución, pero exige citar la fuente original (Yang, Yue, Vinayak, OSDI 2020) y respetar los términos de los datos de Twitter.
- No se documentan sesgos, pero al tratarse de datos de producción de una plataforma concreta pueden reflejar patrones de uso particulares de esa infraestructura y de su base de usuarios.
- Riesgo de alucinación: no aplica al dataset en sí; sí aplica a cualquier conclusión extraída sin validación estadística adecuada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso ni de validación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ibitec/cache-trace-cluster26-parquet
- Fuente original de la traza: https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/open_source/cluster26.sort.zst
- Paper de referencia: Yang, Yue, Vinayak. *A large scale analysis of hundreds of in-memory cache clusters at Twitter.* OSDI 2020.
