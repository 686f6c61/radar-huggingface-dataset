# Kzr0xx/icrm-search-api

## Resumen
ICMR Search API es un servicio de búsqueda desarrollado por Kzr0xx (también conocido como Kzr0x) bajo el equipo "TEAM DARK KNIGHT APIs". Se presenta como una API REST construida con FastAPI y DuckDB que permite consultar una base de datos de 2.500 millones de registros, incluyendo teléfonos, Aadhaar, nombres y direcciones. Aunque el repositorio se encuentra alojado en Hugging Face, no es un modelo de inteligencia artificial, sino una interfaz de consulta sobre un conjunto de datos preexistente. La licencia es MIT y el repositorio se actualizó por última vez en agosto de 2026.

La API expone varios endpoints para realizar búsquedas por número de teléfono, nombre o dirección, así como un endpoint de salud y documentación interactiva mediante Swagger UI. El dataset asociado, `Kzr0xx/icrm-hitek-full-db-mixed`, contiene aproximadamente 2,96 mil millones de registros y se publicó recientemente. La relevancia de este proyecto radica en su capacidad para acceder a una gran cantidad de datos personales, aunque su uso plantea cuestiones éticas y legales importantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | API REST (FastAPI) con almacenamiento en DuckDB |
| Parametros totales | No aplica (no es un modelo de IA) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | No aplica (API de datos, no pesos de red neuronal) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una aplicación de servidor que utiliza el framework FastAPI para exponer endpoints HTTP y DuckDB como motor de consulta sobre datos almacenados. No se proporciona información sobre el proceso de construcción del dataset ni sobre técnicas de entrenamiento, ya que no existe un componente de aprendizaje automático. La arquitectura se limita a una capa de API que realiza búsquedas directas sobre los registros indexados.

## Capacidades

- Búsqueda por número de teléfono (endpoint `/search?q=<number>` y `/search?mobile=<number>`).
- Búsqueda por nombre con límite de resultados (`/search?q=<name>&limit=10`).
- Búsqueda por Aadhaar (identificador indio) a través del parámetro `q`.
- Búsqueda por dirección u otros campos disponibles en el dataset.
- Endpoint de salud (`/health`) para verificar disponibilidad.
- Documentación interactiva de la API en `/docs` mediante Swagger UI.
- Capacidad de procesar consultas sobre un conjunto de datos masivo (2.500 millones de registros).

## Casos de uso

- Consulta de información de contacto: un usuario puede verificar un número de teléfono o un nombre para obtener datos asociados, aunque esto conlleva riesgos de privacidad.
- Verificación de identidad: la búsqueda por Aadhaar podría usarse en procesos de validación, pero el acceso a estos datos sin consentimiento es ilegal en muchas jurisdicciones.
- Análisis de datos para investigación: los investigadores podrían consultar la API para obtener muestras de registros, pero deben cumplir con normativas de protección de datos.
- Integración en sistemas de atención al cliente: la API podría conectarse a un CRM para enriquecer perfiles de usuarios, siempre que se tenga autorización.
- Auditoría de bases de datos: se puede usar para comprobar la presencia de registros duplicados o inconsistentes.
- Desarrollo de herramientas de búsqueda personalizadas: se puede integrar en aplicaciones que necesiten consultar grandes volúmenes de datos de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos para el despliegue de esta API. Al estar basada en FastAPI y DuckDB, se puede ejecutar en un servidor con recursos moderados, pero el tamaño del dataset (2,5 mil millones de registros) implica una gestión de memoria y almacenamiento considerable. Se recomienda un servidor con al menos 8 GB de RAM para cargar el índice de DuckDB en memoria y una CPU de varios núcleos para procesar las consultas. No se especifican GPUs, ya que no se requiere cómputo de aprendizaje automático.

## Comparativa con modelos similares

No disponible. No existe información sobre alternativas comparables en el contexto de modelos de IA, ya que esta API no es un modelo. Si se consideran otras APIs de búsqueda de datos, se podría comparar con servicios como Elasticsearch, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- La API expone datos personales sensibles (teléfonos, Aadhaar, direcciones) sin control de acceso aparente, lo que plantea serias preocupaciones de privacidad y puede ser ilegal en muchos países.
- No hay documentación sobre la precisión de los datos ni sobre la fuente de los mismos.
- No se indica el volumen de registros actualizado ni la frecuencia de actualización.
- La licencia MIT permite el uso comercial, pero no exime del cumplimiento de leyes de protección de datos (como GDPR o la LOPDGDD).
- No se proporcionan garantías sobre la disponibilidad ni la latencia del servicio.
- El proyecto parece estar en fase inicial (sin descargas ni likes), por lo que no se ha validado en entornos de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Kzr0xx/icrm-search-api
- Dataset asociado: https://huggingface.co/datasets/Kzr0xx/icrm-hitek-full-db-mixed
- Perfil del autor: https://huggingface.co/Kzr0xx
- Modelos del autor: https://huggingface.co/Kzr0xx/models
- Página de icrm.ai (referencia externa): https://icrm.ai/
