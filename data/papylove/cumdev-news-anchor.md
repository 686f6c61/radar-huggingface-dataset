# papylove/cumdev-news-anchor

## Resumen

CUMDEV News Anchor es un repositorio de configuración en vivo que define la "persona" de presentador de noticias para los bots de trading de CUMDEV en Threads. No es un modelo entrenado desde cero, sino una capa de ingeniería de prompts que envuelve al modelo base `meta-llama/Llama-3.3-70B-Instruct`, al que se accede a través de HF Inference Providers. El proyecto busca dotar a los bots de una voz consistente y un formato de salida predecible para publicar titulares, comentarios y respuestas en Threads, sin incurrir en los costes de un fine-tuning dedicado.

La relevancia de este repositorio radica en su enfoque práctico: en lugar de entrenar pesos nuevos, combina un modelo base grande con una biblioteca curada de ejemplos few-shot y prompts por tarea, logrando una mejora sustancial en naturalidad y cumplimiento de restricciones de formato respecto a la versión anterior basada en Llama-3.1-8B. El fichero `persona_config.json` se descarga en tiempo de ejecución, permitiendo ajustar la voz de los bots sin redeploy de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de configuración de persona; envuelve a `meta-llama/Llama-3.3-70B-Instruct`) |
| Parametros totales | No disponible (el modelo base tiene 70B, pero el repositorio no contiene pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base y del endpoint) |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos) |
| Idiomas soportados | No disponibles (la model card no especifica idiomas; el contenido está en inglés) |
| Licencia | llama3.3 |
| Formato de pesos | No aplica (el repositorio contiene `persona_config.json` en JSON) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado. Según la model card, se trata de una "persona" prompt-engineered que envuelve a `meta-llama/Llama-3.3-70B-Instruct`, un modelo transformer de 70B parámetros con instrucciones, accedido mediante HF Inference Providers. No se ha realizado fine-tuning; en su lugar, se emplea un sistema de prompts por tarea, una biblioteca de ejemplos few-shot (pares `(user, assistant)` reales) y parámetros de generación específicos (`max_tokens`, `temperature`). La configuración se almacena en `persona_config.json` y se descarga en tiempo de ejecución con un mecanismo de caché y fallback a un valor por defecto.

La innovación técnica destacable es el uso de una biblioteca de ejemplos deliberadamente más grande de lo necesario para cada llamada, de modo que se muestrean aleatoriamente algunos ejemplos por invocación y se insertan como turnos de conversación reales entre el prompt de sistema y la petición del usuario. Esto enseña al modelo el patrón a imitar sin necesidad de modificar los pesos. El autor señala que la actualización de la versión 1.2.0, que pasó de Llama-3.1-8B a Llama-3.3-70B, mejoró notablemente la naturalidad del lenguaje y el cumplimiento de restricciones de formato (por ejemplo, evitar comillas).

## Capacidades

- Generación de titulares de noticias en estilo "breaking news" a partir de titulares RSS o de noticias en bruto.
- Redacción de comentarios y análisis sobre historias ya cubiertas, evitando duplicados.
- Redacción de respuestas a publicaciones de Threads en la misma voz, con mención del sitio CUMDEV solo cuando es relevante y cierre con 1-2 hashtags reales.
- Cumplimiento de reglas estrictas de no invención de hechos, números o detalles no presentes en el material fuente.
- Soporte de formato de salida controlado mediante prompts y ejemplos few-shot.
- Capacidad de adaptación de tono (crypto, acciones, macro) gracias a la biblioteca de ejemplos curada.
- No incluye capacidades multimodales, tool calling ni agentes; es una capa de generación de texto sobre un modelo base.

## Casos de uso

- Publicación automatizada de noticias en Threads: el bot utiliza la tarea `anchor_rewrite_headline` para convertir un titular RSS en una línea breve y contundente de "noticia de última hora", que se publica como tarjeta de imagen o texto.
- Comentario editorial en redes sociales: cuando una historia ya ha sido cubierta, la tarea `anchor_commentary` genera una reacción o análisis genuino, manteniendo la voz del presentador y evitando repeticiones.
- Gestión de respuestas en Threads: la tarea `anchor_draft_reply` redacta respuestas a otros posts en el mismo estilo, con mención contextual del sitio CUMDEV y hashtags apropiados.
- Mantenimiento de una presencia activa en redes con bajo coste: al usar un modelo base alojado en HF Inference Providers, no se requiere infraestructura propia de inferencia.
- Iteración rápida sobre la voz del bot: editar `persona_config.json` permite cambiar el tono, los ejemplos o los parámetros de generación sin redeploy de código, útil para equipos pequeños que gestionan bots de trading.
- Reutilización del formato de configuración: el esquema de `persona_config.json` es lo suficientemente simple para ser adoptado por otros proyectos que necesiten definir personas para modelos de lenguaje, según indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. El único dato comparativo mencionado es la mejora cualitativa observada al pasar de Llama-3.1-8B a Llama-3.3-70B, confirmada "en vivo, lado a lado", pero sin cifras concretas.

## Requisitos de hardware

- No se requieren recursos de hardware propios para este repositorio, ya que no contiene pesos ni ejecuta inferencia local.
- La inferencia se realiza a través de HF Inference Providers, que gestiona la infraestructura del modelo base (Llama-3.3-70B-Instruct).
- Para un despliegue local del modelo base, se necesitaría una GPU con al menos 140 GB de VRAM en FP16 (por ejemplo, 2x A100 80GB o 1x H100 80GB con cuantización), pero esto no es parte de este repositorio.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo independiente, sino una configuración de persona sobre un modelo existente. No se han identificado alternativas comparables en la información proporcionada. La comparación implícita es entre la versión actual (Llama-3.3-70B) y la anterior (Llama-3.1-8B), pero sin datos cuantitativos.

## Limitaciones y advertencias

- No es un modelo entrenado; su rendimiento depende completamente del modelo base subyacente y de la calidad de los prompts y ejemplos.
- La licencia `llama3.3` implica restricciones de uso comercial según los términos de Meta para Llama 3.3; se debe verificar el cumplimiento.
- El repositorio está diseñado para un caso de uso específico (bots de trading en Threads) y no pretende ser un modelo generalista.
- Riesgo de alucinación inherente al modelo base; la model card establece una regla estricta de no inventar hechos, pero no garantiza que el modelo la cumpla siempre.
- No se especifican idiomas soportados; el contenido de los ejemplos está en inglés, lo que limita su uso a ese idioma.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal sin validación externa.
- La dependencia de HF Inference Providers introduce un punto de fallo externo y posibles costes si se superan los límites gratuitos.
- No hay garantías de disponibilidad ni soporte; el autor indica que no está pensado para ser llamado directamente por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/papylove/cumdev-news-anchor
- Repositorio de código del bot (bettor): https://github.com/papykabukanyi/bettor
- Sitio web de CUMDEV: https://cumdev.onrender.com
- Documentación de HF Inference Providers: https://huggingface.co/docs/inference-providers
