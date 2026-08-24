# siddharthmb/2026.TA.features_gemma-2-2b_gemmascope_width_16k_average_l0_76_msNone_ml2048_tk10_hc60c0ae0b93e

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un **feature cache** empaquetado para la librería `circuit-tracer`, una herramienta de análisis de interpretabilidad de modelos. Fue creado por el usuario `siddharthmb` y almacena las activaciones de características (features) extraídas de un modelo base concreto: `gemma-2-2b_gemmascope_width_16k_average_l0_76`. Es decir, es un artefacto de datos que permite rastrear circuitos internos del modelo Gemma 2 2B cuando se aplican transcoders de GemmaScope con 16 000 características.

El repositorio se generó mediante el proceso `analysis.features.collect_feature_activations` de circuit-tracer, utilizando dos conjuntos de datos: una muestra de conversaciones de LMSYS-Chat-1M y una muestra de FineWeb-1M. El resultado es un conjunto de archivos binarios y un índice JSON que el frontend de circuit-tracer puede leer para visualizar y analizar la actividad de las características en diferentes capas. Su relevancia radica en que facilita la investigación en mecánica interpretativa de modelos pequeños, permitiendo estudiar cómo se activan y combinan las características internas durante la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feature cache de circuit-tracer (no es un modelo generativo) |
| Parametros totales | no disponible (depende del modelo base, Gemma 2 2B) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible (el cache se generó con una longitud máxima de 2048 tokens, según el nombre del archivo `ml2048`) |
| Tipos de cuantizacion | no disponible (no es un modelo de pesos) |
| Idiomas soportados | no disponible (el cache se generó a partir de datos en inglés principalmente, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | no aplicable (el repositorio contiene archivos binarios de activaciones y un índice JSON) |
| Tamano del repositorio | 2.4 GB |
| Modelo base | gemma-2-2b_gemmascope_width_16k_average_l0_76 |
| Libreria | circuit-tracer |
| Fecha de creacion | 2026-08-24 |

## Arquitectura y entrenamiento

Este artefacto no se entrena, sino que se genera mediante un proceso de recolección de activaciones. El modelo base es Gemma 2 2B, un transformer decoder-only de Google DeepMind, al que se le aplica un transcoder de GemmaScope con 16 000 características (width 16k) y una norma L0 promedio de 76. El transcoder es una técnica de interpretabilidad que descompone las activaciones internas en características esparsas, permitiendo identificar patrones semánticos.

El proceso de recolección se ejecutó sobre dos datasets: `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` (conversaciones de chat) y `science-of-finetuning/fineweb-1m-sample` (texto web). En total se procesaron 138 458 tokens, de los cuales 56 571 provienen del dominio chat y 81 887 del dominio fineweb. El resultado es un cache de características empaquetado en archivos `features/index.json.gz` y `features/layer_N.bin`, listo para ser consumido por la herramienta circuit-tracer.

## Capacidades

- Almacenamiento de activaciones de características para análisis posterior con circuit-tracer.
- Permite rastrear la actividad de características específicas en diferentes capas del modelo base.
- Soporta la visualización de circuitos internos mediante el frontend de circuit-tracer.
- Incluye metadatos de recolección (tokens por dominio, configuración) en el archivo `feature_collection_config.json`.
- No es un modelo generativo: no puede generar texto, código ni realizar razonamiento por sí mismo.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- **Investigación en interpretabilidad de modelos**: los investigadores pueden cargar este cache en circuit-tracer para estudiar cómo se activan las características internas de Gemma 2 2B durante la generación de texto, identificando circuitos que corresponden a conceptos concretos (por ejemplo, sentimiento, sintaxis o conocimiento factual).
- **Análisis de sesgos y comportamiento**: al comparar las activaciones en dominios de chat y texto web, se pueden detectar diferencias en cómo el modelo procesa distintos tipos de input, lo que ayuda a entender sesgos inducidos por los datos de entrenamiento.
- **Desarrollo de métodos de edición de modelos**: los caches de características son la base para técnicas como la edición de representaciones o la intervención en circuitos, permitiendo probar modificaciones dirigidas en el comportamiento del modelo.
- **Validación de transcoders**: este repositorio sirve como referencia para verificar la calidad de los transcoders de GemmaScope, comparando las activaciones recolectadas con las esperadas teóricamente.
- **Educación en IA explicable**: puede utilizarse en cursos o talleres para demostrar de forma práctica cómo se analiza un modelo de lenguaje a nivel de características internas.
- **Reproducción de experimentos**: al estar disponible públicamente, otros investigadores pueden reutilizar este cache para reproducir o extender experimentos de circuit tracing sin necesidad de recalcular las activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no es un modelo de lenguaje, por lo que no tiene métricas de rendimiento como MMLU, HumanEval o GSM8K. Su utilidad se mide en términos de calidad de las características extraídas, pero no se proporcionan métricas cuantitativas al respecto.

## Requisitos de hardware

- El repositorio ocupa 2.4 GB en disco, por lo que se necesita al menos ese espacio libre para descargarlo.
- Para procesar el cache con circuit-tracer se requiere una máquina con suficiente RAM para cargar los archivos binarios de activaciones (el tamaño exacto depende del número de capas y la resolución de las características).
- No se requiere GPU para el análisis offline, aunque si se desea visualizar los resultados en el frontend de circuit-tracer, se necesita un navegador moderno.
- El proceso de recolección original (no incluido en este repositorio) sí requeriría una GPU para ejecutar el modelo base, pero el usuario final solo necesita CPU y RAM para el análisis.
- No se dispone de datos de latencia o throughput, ya que no es un servicio de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre otros feature caches comparables en el mismo repositorio o en la documentación proporcionada. Existen otros repositorios del mismo autor con nombres similares (por ejemplo, `2026.TA.features_gemma-2-2b_gemmascope_width_16k_average_l0_76_ms1000_ml1024_tk10_h89ada6d36b70`), que probablemente contienen caches con diferentes configuraciones de recolección (distinta longitud máxima, umbral de activación, etc.), pero no se especifican diferencias concretas. Tampoco se dispone de comparativas con caches de otros modelos base.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no puede utilizarse para generación de texto, chat, código ni ninguna tarea de inferencia. Es únicamente un artefacto de análisis.
- **Dependencia del modelo base**: las características almacenadas son específicas del modelo `gemma-2-2b_gemmascope_width_16k_average_l0_76`; no son transferibles a otros modelos sin recalcular.
- **Cobertura limitada de datos**: el cache se generó con solo 138 458 tokens, una muestra muy pequeña en comparación con los miles de millones de tokens que suelen usarse en análisis de interpretabilidad. Esto puede limitar la generalización de los hallazgos.
- **Dominios restringidos**: los datos provienen de conversaciones de chat (LMSYS) y texto web (FineWeb), por lo que las características pueden no reflejar el comportamiento del modelo en otros dominios (por ejemplo, código o documentos técnicos).
- **Licencia no especificada**: no se indica la licencia del repositorio, lo que genera incertidumbre sobre los términos de uso y redistribución. Se recomienda contactar al autor antes de utilizarlo en proyectos comerciales.
- **Formato propietario**: el cache está diseñado para la librería circuit-tracer, por lo que su uso fuera de ese ecosistema requeriría adaptaciones.
- **Fecha futura**: el repositorio está fechado en agosto de 2026, lo que podría indicar un error en la fecha o un artefacto de un proyecto de investigación en curso. Se debe verificar la validez temporal.

## Enlaces

- Repositorio en HuggingFace: [siddharthmb/2026.TA.features_gemma-2-2b_gemmascope_width_16k_average_l0_76_msNone_ml2048_tk10_hc60c0ae0b93e](https://huggingface.co/siddharthmb/2026.TA.features_gemma-2-2b_gemmascope_width_16k_average_l0_76_msNone_ml2048_tk10_hc60c0ae0b93e)
- Modelo base (referencia): [gemma-2-2b_gemmascope_width_16k_average_l0_76](https://huggingface.co/gemma-2-2b_gemmascope_width_16k_average_l0_76)
- Dataset de chat: [siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits](https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits)
- Dataset de texto web: [science-of-finetuning/fineweb-1m-sample](https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample)
- Repositorio de Gemma (Google DeepMind): [GitHub - google-deepmind/gemma](https://github.com/google-deepmind/gemma)
- Página de GemmaScope en Neuronpedia (ejemplo de capa 3): [GEMMA-2-2B · 3-GEMMASCOPE-TRANSCODER-16K](https://www.neuronpedia.org/gemma-2-2b/3-gemmascope-transcoder-16k)
