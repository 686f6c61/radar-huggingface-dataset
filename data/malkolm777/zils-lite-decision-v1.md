# malkolm777/zils-lite-decision-v1

## Resumen

zils-lite-decision-v1 es un modelo de decisión de tipo "d3-lite" desarrollado por el usuario malkolm777 y publicado en Hugging Face. Se construye mediante fine-tuning con LoRA sobre Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen 3.5 con aproximadamente 853 millones de parámetros totales. El modelo está pensado para la "lite pool" de la subred 127 de Zils, una plataforma orientada a entrenar modelos pequeños que toman decisiones concretas (clasificar peticiones, marcar problemas o puntuar coincidencias) a partir de ejemplos etiquetados.

El pipeline declarado es `feature-extraction` y el modelo se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere `trust_remote_code=True` para cargarse con transformers. El repositorio ocupa 1,7 GB y la licencia es Apache-2.0. No se han publicado idiomas soportados ni resultados de benchmarks en la información disponible, y en el momento de la consulta el modelo no acumula descargas ni likes.

Su relevancia radica en el enfoque: en lugar de un modelo generativo generalista, se trata de un cuerpo de decisión ligero y especializado, derivado de una media uniforme de dos modelos previos (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5) y ajustado sobre datos de resultados públicos con etiquetas de desenlace. Es un ejemplo de modelo de nicho para tareas de clasificación y enrutamiento en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, base Qwen/Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; se asume compatibilidad con cuantización estándar de transformers, sin datos confirmados) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de unos 853 millones de parámetros. Sobre esa base se aplica un fine-tuning con LoRA. El punto de partida del ajuste no es el modelo base original, sino una "lite soup": una media uniforme de pesos de dos modelos Apache-2.0, thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5. Según la model card, el ajuste se realiza sobre datos de estilo decisión procedentes de fuentes públicas con etiquetas de desenlace: anuncios de categoría de arXiv, reversiones y procesos AfC/AfD de Wikipedia, merges de Gerrit y Stack Exchange, recopilados mediante `zils.current`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la proporción de cada fuente ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla la innovación técnica más allá del propio pipeline de "soup" más LoRA y del uso de datos de desenlace público como señal de supervisión. El modelo se etiqueta como `feature-extraction` y `decision-model`, lo que sugiere un uso orientado a representaciones y puntuación más que a generación libre de texto.

## Capacidades

- Toma de decisiones y clasificación: diseñado para ordenar peticiones, marcar problemas o puntuar coincidencias a partir de ejemplos, según el enfoque de Zils.
- Extracción de características: pipeline declarado `feature-extraction`, apto para obtener representaciones vectoriales de entradas.
- Especialización en datos de desenlace: entrenado sobre eventos resueltos (merges, reversiones, anuncios, respuestas aceptadas), lo que lo orienta a predecir resultados o etiquetas.
- Modelo de nicho ligero: 853 M de parámetros, adecuado para despliegues con recursos limitados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Enrutamiento de peticiones en aplicaciones: el modelo puede clasificar solicitudes entrantes y asignarlas a la cola o al servicio adecuado, aprovechando su entrenamiento sobre datos de decisión etiquetados.
- Moderación y marcado de problemas: útil para señalar contenido o peticiones problemáticas en flujos de soporte, dado su ajuste sobre ejemplos de reversiones y resoluciones.
- Puntuación de coincidencias (matching): puede emplearse para puntuar la afinidad entre una consulta y candidatos (por ejemplo, preguntas y respuestas o tareas y trabajadores), siguiendo el caso de uso descrito por Zils.
- Clasificación de issues y pull requests: su entrenamiento con merges de Gerrit y datos de desenlace lo hace candidato para priorizar o etiquetar cambios en repositorios.
- Filtrado y triaje de contenido en plataformas colaborativas: aplicable a la revisión de contribuciones en wikis o foros, dado el uso de datos de AfC/AfD y Stack Exchange.
- Extracción de embeddings para búsqueda semántica: al declararse `feature-extraction`, puede generar representaciones para indexar y recuperar documentos en pipelines de búsqueda.
- Prototipado rápido en entornos con pocos recursos: con 853 M de parámetros y licencia Apache-2.0, es viable para pruebas locales y despliegues pequeños antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 853 M de parámetros, en fp16 rondaría los 1,7 GB de pesos, y en cuantizaciones de 8 o 4 bits sería inferior (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí, por tamaño (853 M de parámetros), aunque no hay confirmación oficial ni lista de modelos probados.
- Opciones de despliegue: transformers (librería declarada, con `custom_code` y `trust_remote_code=True`). No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| malkolm777/zils-lite-decision-v1 | 852.985.920 | No disponible | Apache-2.0 | Decisión d3-lite sobre Qwen3.5-0.8B |
| qhoenix/zils-lite-decision | No disponible | No disponible | Apache-2.0 | Decisión d3-lite sobre media de vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y cribl-ai/cribl-decision-2-0.8B |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | No disponible en la información | Modelo generativo generalista |

La comparativa se limita a lo que consta en la información disponible; no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datos públicos de desenlace (arXiv, Wikipedia, Gerrit, Stack Exchange), puede heredar sesgos de esas comunidades.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y especializado en decisión, su uso generativo libre no está respaldado por benchmarks.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento multilingüe o con entradas largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe consultar LICENSE y NOTICE del repositorio y respetar las condiciones de los modelos base y de la soup de origen.
- Caveats para producción: requiere `custom_code` y `trust_remote_code=True`, lo que implica revisar el código remoto antes de desplegarlo; el modelo no acumula descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta), por lo que su robustez no está contrastada.
- Datos incompletos: no hay información sobre tokens de entrenamiento, composición del dataset ni evaluación, lo que dificulta estimar su calidad real.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo comparable en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision
- Sitio de Zils: https://zils.ai/
