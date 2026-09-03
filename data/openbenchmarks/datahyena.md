# openbenchmarks/datahyena

## Resumen

Datahyena no es un modelo de inteligencia artificial generativa, sino una API de búsqueda de noticias empresariales publicada bajo el identificador `openbenchmarks/datahyena` en Hugging Face. Se trata de un *stub* (tarjeta de modelo vacía) creado por el usuario `openbenchmarks` para que dicha API pueda aparecer en el leaderboard oficial del benchmark `OB-News-Websearch`. No contiene pesos ni arquitectura alguna; su propósito es servir como punto de entrada a un servicio externo de consulta de líneas temporales de empresas.

La API expone un endpoint `GET /v1/companies/timeline` que permite recuperar eventos relevantes de compañías (financiación, adquisiciones, movimientos ejecutivos) filtrados por dominio e inclusión de categorías concretas. Su relevancia actual radica en que ofrece una fuente estructurada de noticias empresariales para tareas de evaluación de modelos de búsqueda web, aunque no es un modelo de lenguaje en sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | API de búsqueda (sin modelo subyacente) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no especificado) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este identificador. La tarjeta de modelo es un *stub* creado para registrar una API externa en un leaderboard de benchmarks. La API en sí (Datahyena) es un servicio de búsqueda que indexa noticias de empresas y las expone mediante un endpoint REST. No se dispone de información sobre el motor interno de indexación, los algoritmos de ranking ni los datos de entrenamiento utilizados para construir el índice.

## Capacidades

- Búsqueda de noticias empresariales por empresa o dominio.
- Filtrado por categorías: financiación (`funding`), adquisiciones (`acquisitions`) y movimientos ejecutivos (`exec_moves`).
- Devolución de líneas temporales de eventos para una compañía concreta.
- Integración mediante API REST (endpoint `GET /v1/companies/timeline`).
- Diseñada para ser utilizada en benchmarks de búsqueda web, no para generación de texto ni razonamiento.

## Casos de uso

- Seguimiento automatizado de startups: una herramienta de inteligencia competitiva puede consultar la API periódicamente para detectar nuevas rondas de financiación o cambios en la dirección de empresas competidoras.
- Análisis de mercado en tiempo real: un analista financiero puede integrar la API en un dashboard para visualizar la evolución de adquisiciones en un sector concreto.
- Verificación de noticias en pipelines de NLP: un sistema de extracción de eventos puede usar la API como fuente estructurada de datos para entrenar o evaluar modelos de comprensión lectora.
- Alertas personalizadas para inversores: un servicio de alertas puede suscribirse a cambios en empresas específicas y notificar a usuarios cuando ocurra un evento relevante.
- Enriquecimiento de bases de datos corporativas: una empresa puede combinar los datos de la API con su propio CRM para mantener actualizada la información sobre clientes o proveedores.
- Evaluación de modelos de búsqueda: el propio benchmark `OB-News-Websearch` utiliza esta API como referencia para medir la capacidad de los modelos de recuperación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta de modelo no incluye métricas de rendimiento, y al tratarse de una API externa, no se dispone de datos de latencia, precisión o recall.

## Requisitos de hardware

- No aplica: al ser una API remota, no requiere hardware local para su uso.
- El consumo de recursos depende del cliente que realice las peticiones HTTP.
- No se requiere GPU ni memoria VRAM.
- El despliegue se limita a la integración con el endpoint proporcionado por Datahyena.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que Datahyena no es un modelo de IA sino un servicio de búsqueda. Otras APIs de noticias empresariales (p. ej., NewsAPI, Aylien) podrían considerarse alternativas, pero no se dispone de datos objetivos para una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni responde preguntas.
- Depende de la disponibilidad y fiabilidad del servicio externo Datahyena.
- La cobertura de noticias puede estar limitada a regiones o idiomas específicos (la etiqueta `region:us` sugiere un enfoque en Estados Unidos).
- No se especifica la licencia de uso, por lo que se recomienda consultar los términos del servicio de Datahyena antes de un uso comercial.
- Al ser un *stub*, la tarjeta de Hugging Face no ofrece garantías de mantenimiento ni soporte.

## Enlaces

- [Hugging Face - openbenchmarks/datahyena](https://huggingface.co/openbenchmarks/datahyena)
- [Documentación de Datahyena](https://datahyena.com/docs/)
- [Sitio web de Datahyena](https://datahyena.com)
- [Openbenchmarks (organización)](https://openbenchmarks.com/)
