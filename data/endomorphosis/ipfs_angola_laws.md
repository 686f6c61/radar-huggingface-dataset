# endomorphosis/ipfs_angola_laws

## Resumen

`endomorphosis/ipfs_angola_laws` no es un modelo de lenguaje ni un modelo de IA: es un conjunto de datos (dataset) de investigación que recopila legislación oficial de Angola. Fue creado por el usuario `endomorphosis` y publicado en Hugging Face con el propósito de ofrecer una instantánea estructurada de textos legales extraídos del Diario da República / GUE / Portal do Governo. El repositorio contiene dos configuraciones principales (`laws` y `articles`) en formato Parquet, junto con los scripts de recolección utilizados para construir el corpus.

El dataset incluye 241 instrumentos legales y 8.912 artículos o secciones, todos en portugués y con jurisdicción angoleña. Su relevancia radica en que proporciona una base textual estructurada para tareas de recuperación de información, análisis jurídico y construcción de sistemas de lenguaje natural en el dominio legal, un área con escasez de recursos abiertos para Angola. La fecha de la instantánea es el 4 de septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (dataset, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugués) |
| Licencia | ao-diario-republica |
| Formato de pesos | no aplica (dataset en formato Parquet) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un corpus de datos estructurados en dos tablas Parquet:

- `laws.parquet`: una fila por instrumento legal, con campos como `id`, `title`, `full text`, `dates`, `status`, `identifiers`, `article count` y `source URL`.
- `articles.parquet`: una fila por artículo o sección, con `law_id`, número de artículo, título, texto y URL de origen.

El corpus fue construido mediante un script de recolección (`scrapers/collect_ao.py`) que utiliza utilidades compartidas (`common.py`, `world_lib.py`, `archive_fallbacks.py`). Destaca el uso de estrategias de recuperación con respaldo de Wayback Machine y Common Crawl (CDX), así como la ausencia de bypass de WAF. La cobertura está catalogada como incompleta y la serialización del texto se realizó mediante OCR, lo que puede introducir errores.

## Capacidades

- Contiene 241 instrumentos legales de Angola con texto completo, metadatos de fechas, estado, identificadores y URLs de origen.
- Incluye 8.912 artículos o secciones individuales, lo que permite consultas a nivel de artículo.
- Soporta tareas de recuperación de texto (text-retrieval) y búsqueda sobre legislación oficial en portugués.
- Permite la extracción de entidades legales, referencias cruzadas y análisis de estructura normativa.
- Los datos están en formato Parquet, aptos para procesamiento con pandas, Polars o frameworks de big data.
- Incluye scripts de recolección reutilizables para ampliar o actualizar el corpus.

## Casos de uso

- Investigación jurídica: un abogado o investigador puede consultar el texto completo de una ley angoleña concreta a través de `laws.parquet`, filtrando por título, fecha o identificador.
- Sistemas de recuperación aumentada (RAG) para asesoría legal: el dataset puede servir como base documental para construir un buscador semántico o un asistente que responda preguntas sobre normativa angoleña.
- Análisis de corpus legal: permite aplicar técnicas de NLP (extracción de entidades, clasificación de artículos, análisis de coherencia normativa) sobre un corpus estructurado de leyes en portugués.
- Entrenamiento de modelos de lenguaje jurídico: el corpus puede utilizarse como datos de preentrenamiento o fine-tuning para modelos especializados en derecho lusófono.
- Verificación de citas y consolidación normativa: los metadatos de fechas y estado permiten rastrear la vigencia de instrumentos y detectar referencias cruzadas entre leyes.
- Educación y divulgación: profesores o estudiantes de derecho pueden emplear el corpus para elaborar materiales didácticos sobre legislación angoleña con acceso a textos oficiales estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No requiere GPU ni hardware especializado para su uso: es un dataset en Parquet.
- Puede procesarse en CPU con librerías como pandas o Polars; el tamaño del repositorio es de 0.0 GB (probablemente comprimido o con datos de bajo peso).
- Para consultas simples, basta con un ordenador convencional con Python instalado.
- Para cargas de trabajo de NLP a gran escala, se recomienda un entorno con suficiente memoria RAM para cargar los datos completos, aunque el volumen es reducido.
- No aplica el despliegue en vLLM, llama.cpp o TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han identificado datasets comparables en la información proporcionada. La especificidad jurisdiccional (Angola) y el formato estructurado por instrumentos y artículos lo hacen único en el contexto de los recursos abiertos consultados.

## Limitaciones y advertencias

- El dataset no es una consolidación oficial de la legislación angoleña; el Diario da República / GUE / Portal do Governo prevalece sobre el corpus.
- La cobertura está catalogada como incompleta, por lo que pueden faltar instrumentos o secciones.
- El texto se obtuvo mediante OCR, lo que puede introducir errores de transcripción.
- El contenido no constituye asesoramiento legal; debe usarse únicamente con fines de investigación.
- La licencia `ao-diario-republica` implica que la reutilización está sujeta a los términos de la fuente pública; conviene revisar esos términos antes de un uso comercial o redistribución.
- Los datos están en portugués y limitados a la jurisdicción de Angola; no son útiles para otros sistemas legales.
- No existe información sobre actualizaciones periódicas; la instantánea corresponde a una fecha concreta.

## Enlaces

- Hugging Face: https://huggingface.co/endomorphosis/ipfs_angola_laws
- Perfil de GitHub del autor: https://github.com/endomorphosis
- Contexto sobre regulación de IA en Angola: https://anuragverma.co/worldwatch/angola/ai
