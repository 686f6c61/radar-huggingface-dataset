# endomorphosis/ipfs_mozambique_laws

## Resumen

El repositorio `endomorphosis/ipfs_mozambique_laws` no es un modelo de lenguaje ni un sistema de IA, sino un dataset de investigación que recopila legislación oficial de Mozambique. Fue creado por el usuario de HuggingFace `endomorphosis` (Benjamin J Barber) a partir de fuentes gubernamentales como el Boletim da República, el Ministerio de Recursos Minerales y Energía (MIREME) y el Parlamento de Mozambique. El corpus contiene 232 instrumentos legales y 6957 artículos o secciones, todos en portugués, y se distribuye en formato Parquet.

La relevancia de este dataset radica en su utilidad para tareas de procesamiento de lenguaje natural (PLN) aplicadas al dominio jurídico en portugués, especialmente en el contexto de Mozambique, que cuenta con pocos recursos lingüísticos estructurados. Al tratarse de una instantánea de investigación (snapshot) con fecha 2026-09-04, su cobertura es declarada como incompleta y no constituye una consolidación oficial del ordenamiento jurídico mozambiqueño. La licencia asociada es `mz-boletim-mireme`, que sujeta la reutilización a los términos de las fuentes públicas de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (dataset de texto legal, no es un modelo) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (no es un modelo de pesos) |
| Idiomas soportados | Portugués (pt) |
| Licencia | mz-boletim-mireme |
| Formato de pesos | No aplica (dataset en formato Parquet: `data/laws.parquet` y `data/articles.parquet`) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado. La "arquitectura" es la de un conjunto de datos estructurado en dos tablas Parquet: una con un registro por instrumento legal (`data/laws.parquet`) y otra con un registro por artículo o sección (`data/articles.parquet`). Los campos incluyen identificadores, títulos, texto completo, fechas, estado, identificadores legales, número de artículos y URL de origen.

El proceso de recopilación se documenta en los scripts incluidos: `scrapers/collect_mz.py` como recolector principal, `scrapers/common.py` con utilidades compartidas, `scrapers/world_lib.py` para la obtención de URLs oficiales con respaldo en Wayback Machine, y `scrapers/archive_fallbacks.py` para consultas a Wayback y Common Crawl CDX. No se aplicó ningún procedimiento de entrenamiento, RLHF ni DPO. Los textos proceden de PDFs escaneados con OCR, lo que puede introducir errores de transcripción.

## Capacidades

- Contiene texto legal oficial de Mozambique en portugués, con estructura jerárquica: leyes o instrumentos y sus artículos.
- Incluye metadatos por instrumento: título, fechas, estado, identificadores, número de artículos y URL de origen.
- Dispone de dos niveles de granularidad: un registro por ley y un registro por artículo, lo que facilita tareas de recuperación de información y segmentación de texto.
- Los scripts de recopilación permiten reproducir o ampliar la instantánea, con soporte de respaldo en Wayback Machine.
- No ofrece capacidades de generación de texto, tool calling, agentes, visión ni audio, al no ser un modelo.

## Casos de uso

- Investigación en PLN jurídica: el dataset puede usarse para entrenar modelos de extracción de entidades legales, clasificación de artículos o análisis de sentimiento en textos normativos en portugués.
- Recuperación de información legal: permite construir índices de búsqueda semántica o sistemas de preguntas y respuestas sobre legislación mozambiqueña, aprovechando la estructura de leyes y artículos.
- Asistencia legal automatizada: un chatbot de apoyo ciudadano podría consultar estos textos para responder consultas básicas sobre la legislación vigente, siempre con la advertencia de que no es asesoramiento legal.
- Análisis de cumplimiento normativo: las empresas pueden comparar sus procesos internos con los artículos recopilados para identificar requisitos legales aplicables en Mozambique.
- Traducción automática jurídica: el corpus sirve como material de entrenamiento o evaluación para modelos de traducción portugués-español o portugués-inglés especializados en terminología legal.
- Educación y divulgación legal: los artículos pueden emplearse para generar materiales de estudio, resúmenes o cursos sobre el ordenamiento jurídico de Mozambique.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un dataset, no existen métricas de rendimiento de inferencia. La evaluación de calidad del corpus debería realizarse mediante estudios de cobertura, precisión de OCR y comparación con las fuentes oficiales.

## Requisitos de hardware

- Para la inferencia: no aplica, ya que no es un modelo.
- Para el procesamiento del dataset: se recomienda una máquina con Python 3 y las bibliotecas `pandas` o `polars` para leer los archivos Parquet.
- El tamaño del repositorio es de 0.0 GB según HuggingFace, por lo que el consumo de almacenamiento y memoria es mínimo.
- No se requiere GPU.
- El despliegue en plataformas como vLLM, llama.cpp u Ollama no es aplicable.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada datasets comparables que recopilen legislación de Mozambique con estructura similar. La comparación con otros recursos legales en portugués requeriría una búsqueda adicional fuera del alcance de los datos disponibles.

## Limitaciones y advertencias

- El dataset no es una consolidación oficial ni constituye asesoramiento legal. Las fuentes oficiales (Boletim da República, MIREME, Parlamento) prevalecen sobre este corpus.
- La cobertura es declarada como incompleta ("catalog-backed incomplete"), por lo que pueden faltar leyes o artículos.
- Los textos proceden de OCR sobre PDFs de imagen, lo que puede introducir errores de transcripción, especialmente en caracteres especiales o formatos complejos.
- La licencia `mz-boletim-mireme` sujeta la reutilización a los términos de las fuentes públicas de origen; conviene revisar las condiciones antes de un uso comercial.
- El corpus está únicamente en portugués y no incluye traducciones ni anotaciones lingüísticas.
- No es un modelo, por lo que no puede generar texto ni realizar razonamiento; su uso se limita a tareas de procesamiento de datos.

## Enlaces

- Dataset en HuggingFace: [https://huggingface.co/datasets/endomorphosis/ipfs_mozambique_laws](https://huggingface.co/datasets/endomorphosis/ipfs_mozambique_laws)
- Página del autor en HuggingFace: [https://huggingface.co/endomorphosis](https://huggingface.co/endomorphosis)
