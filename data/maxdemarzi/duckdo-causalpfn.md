# maxdemarzi/duckdo-causalpfn

## Resumen

CausalPFN es un modelo de estimación amortizada de efectos causales mediante aprendizaje en contexto (in-context learning), presentado por Balazadeh et al. en 2025 (arXiv:2506.07918). La entrada que nos ocupa, `maxdemarzi/duckdo-causalpfn`, no es la publicación original de los autores, sino una redistribución del modelo base `vdblm/causalpfn` exportada a ONNX para que la extensión DuckDo de DuckDB pueda cargarla y ejecutarla directamente en SQL, sin Python ni PyTorch.

El export divide el modelo en dos grafos ONNX: un codificador que convierte las filas de contexto en una caché de claves y valores (key/value cache), y un decodificador que puntúa las filas de consulta contra esa caché. Como cada capa extrae sus claves y valores únicamente del contexto, la caché se calcula una sola vez y se reutiliza para todos los bloques de consultas. El resultado es que sentencias como `do_ate(...)` y `do_cate(...)` pueden resolver estimaciones de efecto causal dentro del propio motor DuckDB.

El modelo es relevante ahora porque traslada la inferencia causal amortizada al terreno de las bases de datos analíticas: los pesos ocupan unos 120 MB y el repositorio completo 0,1 GB, lo que lo convierte en una pieza ligera para pipelines de datos donde no se quiere introducir un runtime de Python. No se ha realizado reentrenamiento ni ajuste fino sobre el modelo original; la exportación se limita a trazar `causalpfn_v0.pt` a ONNX con paridad verificada sobre el estimando. La arquitectura interna detallada del modelo base no está descrita en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes prior-fitted (PFN) para inferencia causal amortizada, exportada como par codificador/decodificador en ONNX; detalles de capas y dimensiones no disponibles |
| Parámetros totales | no disponible (los ficheros de pesos externos suman 120.404.992 bytes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el export no declara cuantización, los pesos se almacenan como datos externos sin cuantizar |
| Idiomas soportados | no aplica / no disponible: el modelo opera sobre datos tabulares numéricos, no sobre texto |
| Licencia | CausalPFN License, Version 1.0 (términos equivalentes a Apache-2.0 según la model card); el código de exportación de DuckDo es MIT y es independiente de estos ficheros |
| Formato de pesos | ONNX con datos externos: `causalpfn_encode.onnx` + `causalpfn_encode.weights.bin` y `causalpfn_decode.onnx` + `causalpfn_decode.weights.bin`, más `causalpfn.manifest.json` |
| Librería | onnx |
| Modelo base | vdblm/causalpfn |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según repositorio) | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un prior-fitted network aplicado a inferencia causal: en lugar de ajustar un estimador por conjunto de datos, aprende en contexto a partir de las filas de contexto que se le presentan y produce estimaciones de efecto (ATE y CATE) para las filas de consulta. La exportación a ONNX conserva esa estructura en dos grafos. El codificador procesa las filas de contexto y genera una caché de claves y valores; el decodificador puntúa cada bloque de consultas contra esa caché. Dado que todas las capas obtienen claves y valores exclusivamente del contexto, la caché se calcula una vez y se reutiliza, lo que abarata la evaluación de consultas sobre el mismo contexto. Los detalles de la arquitectura subyacente (número de capas, dimensiones, mecanismo de atención concreto) no están disponibles en la información proporcionada.

No hubo reentrenamiento ni ajuste fino: la model card indica explícitamente que la exportación se limita a trazar `causalpfn_v0.pt` mediante `scripts/export/export_causalpfn.py`, con los pesos almacenados como datos externos. La verificación de paridad se realizó sobre un proceso generador de datos sintético de 512 filas con un ATE real de aproximadamente 3, y el exportador aplica una puerta de calidad: rechaza cualquier exportación cuyo ATE difiera en más de 0,01 o cuya correlación de CATE caiga por debajo de 0,999. La diferencia en la salida bruta (0,0656) se atribuye al kernel de atención fusionado de PyTorch frente al descompuesto de ONNX Runtime. Los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Estimación de efecto causal medio (ATE) sobre datos tabulares mediante la función `do_ate` de DuckDo.
- Estimación de efectos causales heterogéneos (CATE) por fila o subgrupo mediante `do_cate`.
- Aprendizaje en contexto: no requiere reentrenamiento por conjunto de datos, el contexto se pasa en la propia consulta.
- Reutilización de caché: el codificador genera las claves y valores una vez y el decodificador los reaprovecha para todos los bloques de consultas.
- Ejecución dentro de DuckDB sin Python ni PyTorch, a través de la extensión DuckDo y ONNX Runtime.
- Integración SQL nativa: descarga del modelo con `do_download` y uso directo en consultas sobre tablas.
- Verificación de integridad: las versiones de DuckDo que apuntan a este repositorio fijan un commit concreto y validan el SHA-256 de cada fichero.
- No es un modelo generativo de texto: no produce lenguaje natural, no soporta tool calling, ni agentes, ni razonamiento multi-paso en el sentido de un LLM.
- Capacidades multilingües: no aplica.

## Casos de uso

- Análisis de experimentos A/B sobre almacenes de datos: con una tabla de clientes con columnas de tratamiento y resultado, `do_ate` devuelve el efecto medio y su intervalo de confianza (`estimate`, `ci_low`, `ci_high`) sin exportar los datos a un entorno de Python.
- Medición de promociones y descuentos: el ejemplo de la propia model card estima el efecto de un descuento sobre los ingresos; el modelo encaja en equipos de marketing que ya operan con DuckDB sobre Parquet.
- Segmentación de efectos heterogéneos: `do_cate` permite puntuar subgrupos y detectar en qué perfiles el tratamiento funciona mejor, útil para personalización de ofertas o campañas.
- Evaluación de políticas de precios: estimar el impacto causal de cambios tarifarios sobre métricas de conversión o ingresos manteniendo todo el cálculo dentro del motor SQL.
- Análisis observacional en sanidad o epidemiología: sobre cohortes tabulares anonimizadas, estimar el efecto de una intervención cuando no es viable aleatorizar, siempre que se asuman las hipótesis causales correspondientes.
- Pipelines de datos sin Python: al ser ONNX con pesos de ~120 MB, se integra en entornos DuckDB embebidos, tareas programadas o CI/CD donde instalar PyTorch no es deseable.
- Evaluación de programas públicos o educativos: uso de `do_ate` sobre registros administrativos para estimar el efecto de una política sobre una variable de resultado.
- Prototipado rápido en cuadernos SQL: al no requerir ajuste por dataset, permite iterar sobre distintas definiciones de tratamiento y resultado cambiando únicamente la consulta.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje. El único dato cuantitativo disponible es la verificación de paridad del export frente al modelo PyTorch original, medida sobre un proceso generador de datos sintético de 512 filas con un ATE real de aproximadamente 3:

| Comprobación | Valor |
|---|---|
| ATE, ONNX frente a PyTorch | difiere en 0,00087 |
| Correlación de CATE, ONNX frente a PyTorch | 0,999399 |
| Mayor diferencia individual de CATE | 0,282 |
| Mayor diferencia en la salida bruta | 0,0656 |
| Umbral de rechazo del exportador (ATE) | diferencia máxima 0,01 |
| Umbral de rechazo del exportador (correlación CATE) | mínimo 0,999 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 120.404.992 bytes (~120 MB), por lo que la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: ninguna en particular; el modelo está pensado para ejecutarse en CPU mediante ONNX Runtime. Cualquier GPU consumer (por ejemplo, una RTX 4090) sería sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU sin aceleración específica.
- Opciones de despliegue: extensión DuckDB DuckDo (`LOAD duckdo`, `do_download`, `do_ate`, `do_cate`) sobre ONNX Runtime. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad | Parámetros / contexto |
|---|---|---|---|---|---|
| maxdemarzi/duckdo-causalpfn | Export ONNX de CausalPFN para DuckDo | ONNX con datos externos | CausalPFN License 1.0 | HuggingFace, 0 descargas, 0 likes | ~120 MB de pesos; contexto no disponible |
| vdblm/causalpfn | Modelo original de CausalPFN (Balazadeh et al., 2025) | PyTorch (`causalpfn_v0.pt`) | CausalPFN License 1.0 | HuggingFace / GitHub | Parámetros y contexto no disponibles |
| Enfoques basados en PFN para datos tabulares (por ejemplo, TabPFN) | Familia conceptual relacionada (predicción tabular en contexto, no estimación causal) | no disponible | no disponible | no disponible | no disponible |
| Librerías clásicas de inferencia causal (EconML, DoWhy) | Bibliotecas de estimación, no modelos preentrenados | no aplica | no disponible | Repositorios públicos | no aplica |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es la publicación de los autores: es una redistribución de `vdblm/causalpfn`; para citar o atribuir correctamente debe usarse el paper de Balazadeh et al. (2025).
- El modelo no genera texto ni mantiene conversaciones; cualquier expectativa de uso como LLM es incorrecta.
- La verificación de paridad se realizó sobre un único proceso generador de datos sintético de 512 filas con ATE real de aproximadamente 3; no hay evidencia publicada sobre otros regímenes, tamaños de muestra o estructuras causales.
- Existe una discrepancia en la salida bruta (hasta 0,0656) atribuida a la diferencia entre el kernel de atención fusionado de PyTorch y el descompuesto de ONNX Runtime; aunque el estimando se mantiene dentro del umbral, no conviene asumir equivalencia bit a bit.
- Las estimaciones causales dependen de las hipótesis de identificación (por ejemplo, ausencia de confusión no medida); el modelo no las valida ni las advierte, y un mal diseño del análisis producirá estimaciones sesgadas.
- La licencia CausalPFN 1.0 es de tipo "other" con términos equivalentes a Apache-2.0 según la model card; conviene revisar el fichero `LICENSE` antes de un uso comercial o de redistribuir los pesos.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación externa de la comunidad.
- Los idiomas, el pipeline y la longitud de contexto no están declarados; al operar sobre datos tabulares, no aplica el soporte multilingüe.
- La integridad del modelo depende de fijar un commit y verificar los SHA-256; las versiones de DuckDo que lo hacen se comportan de forma más segura que una descarga sin comprobación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maxdemarzi/duckdo-causalpfn
- Modelo base original: https://huggingface.co/vdblm/causalpfn
- Repositorio de CausalPFN: https://github.com/vdblm/CausalPFN
- Extensión DuckDo: https://github.com/maxdemarzi/DuckDo
- Paper (arXiv:2506.07918): https://arxiv.org/abs/2506.07918

La búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces anteriores proceden de la información del repositorio de HuggingFace.
