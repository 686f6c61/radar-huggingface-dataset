# openbenchmarks/you-highlights

## Resumen

Este repositorio de Hugging Face, identificado como `openbenchmarks/you-highlights`, no contiene un modelo de inteligencia artificial con pesos, sino una *stub model card* (ficha de modelo ficticia) creada por el proyecto OpenBenchmarks para que la API de búsqueda web de You.com pueda aparecer en el leaderboard oficial del benchmark OB News Websearch. En otras palabras, es un registro de catálogo que permite evaluar y comparar el rendimiento de un servicio de búsqueda externo dentro de un marco de evaluación estandarizado, no un modelo descargable ni ejecutable localmente.

El propósito de esta ficha es servir como punto de entrada para que los resultados de la API de You.com con configuración `extraction_mode=highlights` se incluyan en las tablas comparativas del leaderboard. No hay arquitectura, parámetros, pesos ni ningún artefacto de modelo. La información técnica disponible se limita al endpoint de la API, la configuración de extracción y la documentación externa. Por tanto, cualquier uso práctico requiere suscribirse al servicio de You.com y realizar llamadas HTTP, no cargar un modelo en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo con pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplicable (no hay pesos) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Se trata de una ficha de catálogo para una API de búsqueda web externa (You.com) que se integra en un benchmark de evaluación. No hay datos de entrenamiento, tokens procesados, ni técnicas como RLHF o DPO asociadas a este registro.

## Capacidades

- Acceso a la API de búsqueda web de You.com mediante el endpoint `POST /v1/search`.
- Configuración específica `extraction_mode=highlights`, que devuelve fragmentos destacados de los resultados de búsqueda.
- Integración con el leaderboard OB News Websearch para comparar el rendimiento de búsqueda entre distintos proveedores.
- No es un modelo generativo: no genera texto, código, ni realiza razonamiento. Solo actúa como interfaz hacia un servicio de búsqueda externo.

## Casos de uso

- Evaluación comparativa de motores de búsqueda: los desarrolladores pueden utilizar esta ficha como referencia para incluir You.com en sus pruebas de rendimiento de búsqueda web, comparando la calidad de los highlights extraídos con otros proveedores.
- Integración en pipelines de recuperación de información: mediante la API, se pueden obtener fragmentos relevantes de noticias o contenido web para alimentar sistemas de resumen o análisis posterior.
- Monitorización de calidad de búsqueda: equipos que necesiten validar la precisión de los resultados de You.com en un dominio concreto (por ejemplo, noticias de empresa) pueden usar el leaderboard como referencia.
- Desarrollo de agentes de búsqueda: aunque no es un modelo, la API puede ser invocada desde un agente de IA para obtener información actualizada, siempre que se contrate el servicio.
- Investigación académica sobre benchmarks de búsqueda: este stub permite reproducir los resultados del leaderboard OB News Websearch y verificar la metodología de evaluación.
- Comparación de costes y latencia: al ser una API externa, los equipos pueden medir el coste por llamada y la latencia frente a alternativas de búsqueda locales o de otros proveedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un stub y no incluye métricas de rendimiento propias. Los resultados del leaderboard se publican en el sitio de OpenBenchmarks, pero no se proporcionan datos numéricos en esta ficha.

## Requisitos de hardware

- No aplica: al ser una API externa, no se requiere hardware local para su uso.
- El consumo de recursos se limita a las llamadas HTTP desde el cliente que integre el servicio.
- No hay requisitos de VRAM, GPU ni opciones de despliegue local (vLLM, llama.cpp, Ollama, etc.).
- La latencia y el throughput dependen de la infraestructura de You.com y del plan contratado, no de recursos propios.

## Comparativa con modelos similares

No disponible. Este registro no es un modelo de IA comparable con LLMs u otros sistemas de generación. Su categoría es la de un servicio de búsqueda web, y no se dispone de información sobre alternativas equivalentes en el contexto de este benchmark.

## Limitaciones y advertencias

- No contiene pesos ni artefactos de modelo: no se puede descargar ni ejecutar localmente.
- Depende de la disponibilidad y los términos de servicio de la API de You.com; el acceso puede requerir una clave y estar sujeto a límites de uso.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido o restringido.
- Al ser un stub, no hay garantías de mantenimiento ni de actualización de la ficha.
- Los resultados de búsqueda pueden estar sesgados por la región configurada (`region:us`), lo que limita la cobertura internacional.
- No se proporcionan métricas de precisión, recall ni calidad de los highlights en esta ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/openbenchmarks/you-highlights
- Documentación de la API de You.com: https://docs.you.com/
- Leaderboard en vivo: https://you.com
- Proyecto OpenBenchmarks: https://openbenchmarks.com/
- Dataset OB News Websearch: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
