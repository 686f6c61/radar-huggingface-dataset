# malkolm777/zils-lite-decision-v3

## Resumen

zils-lite-decision-v3 es un modelo de decisión de tipo "lite" desarrollado por el usuario malkolm777, concebido como cuerpo de decisión para el pool lite de la subred 127 de Zils. Se trata de un fine-tune del modelo base Maincode/Matilda-Decision-v1-Edge (licencia Apache-2.0), que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B. Con 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB, está pensado para tareas de clasificación y puntuación de decisiones más que para generación de texto abierta.

El modelo se ha afinado con una ronda de LoRA de rango 16 sobre un conjunto amplio y sin límite de elementos de decisión etiquetados por resultados, procedentes de fuentes públicas como reversiones de Wikipedia, anuncios de categorías de arXiv, fusiones de Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia. Posteriormente, el delta del fine-tune se escaló por un factor de 1,7. El resultado es un modelo especializado en feature-extraction y decisión, distribuido con licencia Apache-2.0 y compatible con transformers.

Su relevancia radica en su orientación práctica: Zils propone entrenar modelos pequeños que una aplicación pueda usar para ordenar solicitudes, marcar problemas o puntuar coincidencias. Este modelo concreto encaja en ese paradigma de despliegue ligero y decisiones automatizadas, aunque su adopción pública es todavía nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B), fine-tune con LoRA rango 16 |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre la familia Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,8 mil millones de parámetros. El autor lo describe como un "cuerpo de decisión d3-lite" y lo deriva del modelo base Maincode/Matilda-Decision-v1-Edge mediante un fine-tune con LoRA de rango 16. La innovación metodológica destacable es el escalado del delta del fine-tune por un factor de 1,7, una técnica que amplifica el efecto de la adaptación sobre el modelo base.

Los datos de entrenamiento proceden de un conjunto "más amplio y sin límite" de elementos de decisión etiquetados por resultados, recolectados con la herramienta zils.current a partir de fuentes públicas: reversiones de Wikipedia, anuncios de categorías de arXiv, fusiones de Gerrit, Stack Exchange y los procesos de AfC/AfD de Wikipedia. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El modelo requiere custom_code para su carga en transformers.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado del modelo, orientado a representaciones y puntuaciones más que a generación libre.
- Modelo de decisión: diseñado para ordenar solicitudes, marcar problemas o puntuar coincidencias según el paradigma de Zils.
- Clasificación y puntuación de elementos de decisión entrenados sobre resultados etiquetados (reversiones, fusiones, anuncios, etc.).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede puntuar si una edición o reversión de Wikipedia es probablemente problemática, aprovechando que se entrenó con datos de reversiones etiquetadas por resultado.
- Triaje de solicitudes en aplicaciones: integrar el modelo como clasificador para ordenar peticiones entrantes y priorizar las que requieren intervención, tal como propone Zils para "sort requests".
- Filtrado de anuncios de investigación: usar la puntuación del modelo para decidir si un anuncio de categoría de arXiv es relevante o debe descartarse, dado el entrenamiento sobre ese tipo de datos.
- Revisión de cambios en repositorios: aplicar el modelo a fusiones de Gerrit para marcar cambios que probablemente necesiten revisión adicional, aprovechando los datos de merges etiquetados.
- Puntuación de respuestas en foros: emplear el modelo para valorar la calidad o idoneidad de respuestas de Stack Exchange en flujos de curación de contenido.
- Automatización de decisiones en pipelines ligeros: desplegar el modelo como cuerpo de decisión en el pool lite de Zils (subred 127) para tareas de scoring de bajo coste computacional, dado su tamaño de 0,85 mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,7 GB en safetensors; una carga en precisión completa (fp32) requeriría aproximadamente 3,4 GB de VRAM, mientras que en fp16 rondaría 1,7 GB. Las cifras exactas de cuantización no están publicadas.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en fp16, aunque no hay confirmación del autor.
- Cabe en consumer GPU: sí, por el tamaño de parámetros, aunque no hay validación publicada.
- Opciones de despliegue: transformers (librería declarada, con custom_code). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-decision-v3 (malkolm777) | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| qhoenix/zils-lite-decision | no disponible | no disponible | no disponible | Hugging Face |
| Maincode/Matilda-Decision-v1-Edge (base) | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles explícitamente; al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar sesgos de esas comunidades.
- Riesgo de alucinación: el modelo está orientado a feature-extraction y decisión, no a generación; el riesgo de alucinación en generación no está evaluado.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe consultarse el archivo LICENSE y NOTICE del repositorio, y respetarse las condiciones del modelo base Maincode/Matilda-Decision-v1-Edge.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, sin validación comunitaria; requiere custom_code para cargarse en transformers; el escalado del delta por 1,7 puede introducir comportamientos no documentados; no hay benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v3
- Modelo base: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Zils (sitio oficial): https://zils.ai/
- Modelo relacionado: https://huggingface.co/qhoenix/zils-lite-decision
