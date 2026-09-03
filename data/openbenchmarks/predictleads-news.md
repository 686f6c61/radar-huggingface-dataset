# openbenchmarks/predictleads-news

## Resumen

El repositorio `openbenchmarks/predictleads-news` no contiene un modelo de inteligencia artificial con pesos, sino un *stub* de model card creado para que la API de búsqueda de noticias de empresas de PredictLeads pueda aparecer en el leaderboard oficial del benchmark OB News Websearch. El propio autor lo indica explícitamente: "Stub model card so this search API can appear on the OB News Websearch Official Benchmark leaderboard. There are no weights here."

PredictLeads es un proveedor de datos de inteligencia empresarial que ofrece APIs, archivos planos, webhooks y soporte MCP. Su endpoint de noticias (`GET /api/v3/companies/{domain}/news_events`) permite recuperar eventos de noticias asociados a un dominio corporativo, con una configuración específica de selección de categorías y límite de resultados. Este repositorio sirve como referencia para que los evaluadores puedan comparar el rendimiento de esta API frente a otras soluciones en el contexto del benchmark, pero no es un modelo generativo ni un sistema de razonamiento.

La relevancia de esta ficha radica en aclarar que, aunque aparece en HuggingFace con etiquetas de búsqueda web y noticias, no se trata de un LLM ni de un sistema de IA entrenado. Es un servicio externo de datos que se evalúa como herramienta de recuperación de información, no como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (API REST, no modelo de IA) |
| Parametros totales | No disponible (no hay pesos) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (depende de la API de PredictLeads) |
| Licencia | No disponible |
| Formato de pesos | No aplica (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. Se trata de un *stub* de model card que referencia una API externa. La API de PredictLeads se basa en su propia infraestructura de recopilación y procesamiento de datos de noticias, pero los detalles técnicos de su implementación no se documentan en este repositorio ni en la información proporcionada. No hay datos sobre tokens de entrenamiento, composición de datasets, ni técnicas como RLHF o DPO.

## Capacidades

- Recuperación de eventos de noticias asociados a un dominio de empresa mediante una petición GET a `/api/v3/companies/{domain}/news_events`.
- Configuración de selección de categorías mediante el parámetro `categories[]` y límite de resultados con `limit=10`.
- Integración con el benchmark OB News Websearch para evaluación comparativa de capacidades de búsqueda de noticias.
- Acceso a datos de inteligencia empresarial adicionales (perfiles de empresa, tecnologías, empresas similares, etc.) a través de otras APIs de PredictLeads, aunque no se detallan en este repositorio.
- Soporte de entrega de datos mediante APIs, archivos planos, webhooks y MCP (Model Context Protocol), según la documentación oficial de PredictLeads.

## Casos de uso

- Monitoreo de noticias de competidores: una empresa puede consultar periódicamente el endpoint de noticias para dominios de sus competidores y detectar lanzamientos, cambios de dirección o crisis de reputación.
- Inteligencia de ventas: los equipos comerciales pueden usar las noticias de empresas objetivo para identificar momentos de expansión o financiación que indiquen oportunidades de venta.
- Análisis de mercado: los analistas pueden correlacionar eventos de noticias de múltiples empresas para detectar tendencias sectoriales o movimientos estratégicos.
- Alertas automatizadas: mediante webhooks o integración con MCP, se pueden configurar sistemas que reaccionen a nuevas noticias de un dominio concreto.
- Enriquecimiento de datos CRM: añadir noticias recientes a los registros de clientes potenciales para personalizar la comunicación.
- Evaluación de herramientas de búsqueda: los investigadores pueden usar este endpoint como referencia en benchmarks de recuperación de información, comparando su precisión y cobertura con otras fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio existe para que la API aparezca en el leaderboard del benchmark OB News Websearch, pero no se incluyen métricas de rendimiento, latencia, precisión o recall en la model card ni en los resultados de búsqueda web proporcionados.

## Requisitos de hardware

- No aplica: al ser una API externa, no se requiere hardware local para su uso.
- El despliegue se realiza mediante peticiones HTTP a los servidores de PredictLeads, por lo que solo se necesita conectividad a internet y un cliente HTTP.
- No hay requisitos de VRAM, GPU ni opciones de despliegue local como vLLM, llama.cpp u Ollama.
- La latencia y el throughput dependen de la infraestructura de PredictLeads y no se especifican en la información disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no representa un modelo de IA comparable con otros LLMs o sistemas de búsqueda. Para comparar APIs de noticias empresariales, se necesitarían datos de rendimiento de PredictLeads frente a alternativas como NewsAPI, GDELT o servicios similares, pero no se proporcionan en la información disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para generación de texto, razonamiento, código u otras tareas típicas de LLM.
- Dependencia de un servicio externo: el funcionamiento está sujeto a la disponibilidad, límites de uso y políticas de PredictLeads.
- Sin datos de rendimiento: no hay métricas publicadas que permitan evaluar la calidad de los resultados de búsqueda.
- Licencia no especificada: no se indica si el uso de la API requiere licencia comercial o tiene restricciones.
- Cobertura geográfica limitada: la etiqueta `region:us` sugiere que el índice de noticias puede estar centrado en Estados Unidos, aunque no se confirma.
- Riesgo de alucinación: no aplica, pero la calidad de los datos depende de la fuente de noticias y su actualización.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/openbenchmarks/predictleads-news
- Documentación de la API de PredictLeads: https://docs.predictleads.com/
- Sitio web de PredictLeads: https://predictleads.com
- Dataset del benchmark OB News Websearch: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
