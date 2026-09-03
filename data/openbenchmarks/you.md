# openbenchmarks/you

## Resumen

El repositorio `openbenchmarks/you` no contiene un modelo de inteligencia artificial, sino una *model card* de tipo *stub* creada por el equipo de OpenBenchmarks para que la API de búsqueda web de You.com pueda aparecer en el leaderboard oficial del benchmark OB News Websearch. No hay pesos, arquitectura ni artefactos de modelo; el repositorio actúa únicamente como un registro de referencia para un servicio externo de búsqueda.

La API de You.com, documentada en `docs.you.com`, expone un endpoint `POST /v1/search` con configuración `count=10`, orientado a recuperar resultados de búsqueda web para tareas de evaluación de modelos que requieren acceso a información actualizada. Su inclusión en un leaderboard de benchmarks responde a la necesidad de comparar sistemas de búsqueda y generación aumentada por recuperación (RAG) en un entorno controlado.

Dado que no se trata de un modelo de lenguaje, las especificaciones técnicas habituales (parámetros, contexto, cuantización) no son aplicables. Esta ficha documenta el estado real del repositorio y aclara su naturaleza para evitar confusiones entre desarrolladores que buscan un LLM desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una API de búsqueda web) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La *model card* es un marcador de posición (*stub*) que referencia un servicio externo de búsqueda web operado por You.com. El endpoint `POST /v1/search` con `count=10` devuelve resultados de búsqueda, presumiblemente mediante un motor de indexación web propietario, pero los detalles internos de dicho motor no se documentan en este repositorio ni en la información proporcionada.

No se dispone de datos sobre el volumen de datos de entrenamiento, composición del corpus, ni técnicas de alineación como RLHF o DPO, porque no hay un modelo subyacente que haya sido entrenado.

## Capacidades

- Búsqueda web: el endpoint permite realizar consultas de búsqueda y recuperar un número fijo de resultados (10 por defecto).
- Integración en benchmarks: diseñado para ser evaluado en el leaderboard OB News Websearch, que mide la capacidad de recuperar noticias y contenido web relevante.
- API REST: expone un servicio HTTP con método `POST` y ruta `/v1/search`, consumible desde cualquier lenguaje de programación.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, ni capacidades de agente, al no ser un modelo de lenguaje.

## Casos de uso

- Evaluación de sistemas de búsqueda en entornos de investigación: el endpoint se utiliza como referencia en el benchmark OB News Websearch para comparar la calidad de recuperación de noticias entre distintos proveedores.
- Pruebas de integración RAG: los desarrolladores pueden usar esta API como componente de recuperación en pipelines de generación aumentada, aunque no se proporcionan garantías de rendimiento ni documentación adicional en este repositorio.
- Monitorización de resultados de búsqueda para noticias empresariales: la etiqueta `company-news` sugiere su uso en tareas de seguimiento de información corporativa, aunque no hay ejemplos concretos de implementación.
- Comparativa de APIs de búsqueda: al estar registrado en un leaderboard, sirve como punto de referencia para comparar costes, latencia y calidad de resultados frente a otras APIs de búsqueda.
- Investigación sobre evaluación de modelos con acceso a web: permite estudiar cómo los modelos de lenguaje integran resultados de búsqueda externa, aunque el propio repositorio no ofrece herramientas para ello.
- Desarrollo de agentes con búsqueda en vivo: aunque no es un LLM, la API podría integrarse en agentes que necesiten consultar información actualizada, siempre que el desarrollador implemente la lógica de llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona que la API aparece en el leaderboard OB News Websearch, pero no se proporcionan métricas concretas (precisión, recall, latencia, etc.) en la *model card* ni en los resultados de búsqueda web.

## Requisitos de hardware

No aplica. Al ser una API remota, no requiere hardware local para inferencia. El consumo de recursos se limita a las llamadas HTTP realizadas desde el cliente. No hay requisitos de VRAM, GPU, ni opciones de despliegue local como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. Este repositorio no representa un modelo de lenguaje ni un sistema de búsqueda con especificaciones comparables a LLMs open source. No existen alternativas equivalentes en cuanto a arquitectura o pesos, ya que se trata de un servicio propietario externo.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura ni capacidades de generación de texto. Cualquier uso como LLM es inválido.
- Dependencia de un servicio externo: el funcionamiento depende de la disponibilidad y políticas de You.com; no hay garantía de continuidad del servicio.
- Sin licencia especificada: no se indica bajo qué términos se puede utilizar la API, lo que supone un riesgo legal para uso comercial.
- Sin documentación de rendimiento: no hay datos de latencia, throughput ni límites de tasa, lo que dificulta su uso en producción.
- Sin soporte de idiomas declarado: aunque la búsqueda web puede devolver resultados en varios idiomas, no se especifica qué lenguas están cubiertas.
- Riesgo de confusión: al estar publicado en HuggingFace con la etiqueta de modelo, los desarrolladores podrían asumir erróneamente que es un LLM descargable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/openbenchmarks/you
- Documentación de la API de You.com: https://docs.you.com/
- Leaderboard en vivo: https://you.com
- Dataset OB News Websearch: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
