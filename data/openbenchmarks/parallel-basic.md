# openbenchmarks/parallel-basic

## Resumen

El repositorio `openbenchmarks/parallel-basic` no contiene un modelo de lenguaje ni pesos de red neuronal. Se trata de una *model card* de tipo *stub* creada por el equipo de OpenBenchmarks para registrar una API de búsqueda web en el leaderboard oficial del benchmark `OB-News-Websearch`. La API, denominada "Parallel" con configuración `mode=basic`, expone un endpoint `POST /v1/search` y está documentada en la web de Parallel. Su propósito es permitir que un servicio de búsqueda en tiempo real aparezca en las clasificaciones públicas de evaluación, no ofrecer un modelo generativo.

Al no existir pesos, arquitectura ni parámetros, esta ficha se limita a describir la naturaleza del recurso y a señalar explícitamente la ausencia de especificaciones técnicas de modelo. Cualquier dato relativo a capacidades de lenguaje, contexto o rendimiento no está disponible y no debe inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una API de búsqueda) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado. La *model card* indica explícitamente que es un *stub* para que una API de búsqueda aparezca en un leaderboard. No se proporciona información sobre arquitectura, datos de entrenamiento, tokens procesados ni técnicas de optimización. Cualquier afirmación al respecto sería especulación.

## Capacidades

- Búsqueda web en tiempo real a través de una API REST (`POST /v1/search`).
- Configuración `mode=basic`, que sugiere un modo de consulta estándar, aunque no se detallan parámetros adicionales.
- Integración con el benchmark `OB-News-Websearch` para evaluación de resultados de búsqueda.
- No se documentan capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes.

## Casos de uso

Dado que no es un modelo de lenguaje, los casos de uso se limitan a la integración de una API de búsqueda:

- **Búsqueda de noticias empresariales**: consultar el endpoint para obtener resultados de noticias recientes sobre empresas, útil para monitorización de mercado.
- **Enriquecimiento de datos**: combinar los resultados de búsqueda con otros pipelines de datos para alimentar análisis de sentimiento o tendencias.
- **Evaluación comparativa**: participar en el leaderboard `OB-News-Websearch` para medir la calidad de los resultados frente a otros proveedores de búsqueda.
- **Automatización de informes**: generar informes periódicos con noticias relevantes mediante llamadas programáticas a la API.
- **Verificación de hechos**: contrastar afirmaciones con noticias actuales a través de la búsqueda web.
- **Integración en asistentes**: aunque no se documenta, una API de búsqueda podría usarse como herramienta externa en un agente conversacional, pero no hay evidencia de soporte oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* menciona que el recurso está diseñado para aparecer en el leaderboard de `OB-News-Websearch`, pero no se ofrecen métricas concretas (precisión, recall, latencia, etc.) en el repositorio ni en los resultados de búsqueda web proporcionados.

## Requisitos de hardware

No aplica. Al ser una API alojada externamente, no se requieren recursos de hardware locales para su uso. No se especifican requisitos de VRAM, GPU ni opciones de despliegue. El consumo dependerá del cliente que realice las llamadas HTTP.

## Comparativa con modelos similares

No disponible. No se puede comparar con otros modelos de lenguaje porque no es un modelo. Tampoco se dispone de información sobre otros servicios de búsqueda comparables en el contexto de este repositorio.

## Limitaciones y advertencias

- **No es un modelo de IA generativa**: no ofrece capacidades de texto, razonamiento ni código.
- **Dependencia de un servicio externo**: la disponibilidad y calidad de los resultados dependen de la infraestructura de Parallel, no de un modelo local.
- **Sin documentación de licencia**: no se indica bajo qué términos se puede usar la API, lo que puede limitar su uso comercial.
- **Sin garantías de rendimiento**: al no haber benchmarks publicados, no se puede evaluar la calidad de los resultados de búsqueda.
- **Fecha de creación futura**: el repositorio está fechado en septiembre de 2026, lo que sugiere que podría ser un recurso de prueba o planificado; se recomienda verificar su estado actual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/openbenchmarks/parallel-basic
- Documentación de la API (según la model card): https://docs.parallel.ai/api-reference/search/search
- Leaderboard en vivo (según la model card): https://parallel.ai
- Dataset del benchmark: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
