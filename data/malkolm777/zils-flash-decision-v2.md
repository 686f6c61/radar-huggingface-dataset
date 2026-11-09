# malkolm777/zils-flash-decision-v2

## Resumen

zils-flash-decision-v2 es un modelo de extracción de características y toma de decisiones publicado por el usuario malkolm777 en Hugging Face. Se trata de un ajuste fino (fine-tuning) mediante LoRA de rango 16 sobre el modelo base vllm-sr/d3-flash, que pertenece a la familia Qwen/Qwen3.5-9B. El modelo está orientado a tareas de clasificación y puntuación de decisiones dentro del ecosistema Zils, concretamente para el pool flash de la subred 127.

El modelo resuelve el problema de evaluar y puntuar resultados en contextos donde existe una etiqueta de resultado observable, como reversiones de ediciones en Wikipedia, anuncios de categorías en arXiv, fusiones en Gerrit, preguntas de Stack Exchange o procesos de AfC/AfD de Wikipedia. Con 8.392.695.024 parámetros totales y un tamaño de repositorio de 16,8 GB, se posiciona como un modelo de tamaño medio-alto especializado en una tarea concreta en lugar de un modelo de propósito general.

Su relevancia actual radica en que ejemplifica una tendencia creciente: la especialización de modelos base de código abierto mediante LoRA para tareas de decisión y puntuación en dominios concretos, con licencia Apache-2.0, lo que facilita su uso comercial e integración en pipelines de producción. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, idiomas declarados ni documentación detallada sobre el proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-9B, según la model card) |
| Parámetros totales | 8.392.695.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la familia Qwen/Qwen3.5-9B, según se indica en la model card, y se distribuye a través de la librería transformers con código personalizado (custom_code). El ajuste se realizó mediante LoRA de rango 16 sobre el modelo base vllm-sr/d3-flash, que actúa como "cuerpo" (body) de referencia del ecosistema Zils. El pipeline declarado es feature-extraction, lo que sugiere que el modelo está pensado para producir representaciones o puntuaciones más que para generación de texto libre.

El conjunto de entrenamiento se describe como "un conjunto más amplio y sin límite (uncapped) de ítems de decisión procedentes de fuentes públicas con etiquetas de resultado", recopilados con la herramienta zils.current. Las fuentes citadas incluyen reversiones de Wikipedia, anuncios de categorías de arXiv, fusiones de Gerrit, Stack Exchange y los procesos AfC/AfD de Wikipedia. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características y generación de representaciones vectoriales para tareas de decisión y puntuación.
- Evaluación de resultados en dominios con etiquetas observables: reversiones de ediciones, anuncios de categorías, fusiones de código, preguntas y respuestas, y procesos de aceptación/borrado de artículos.
- Puntuación de coincidencias y clasificación de solicitudes, según la descripción del ecosistema Zils.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Moderación de ediciones en wikis: el modelo puede puntuar si una edición será revertida o mantenida, entrenado con reversiones reales de Wikipedia, lo que permite priorizar revisiones humanas en comunidades grandes.
- Triaje de envíos a arXiv: clasificar si un anuncio de categoría será aceptado o rechazado, ayudando a los moderadores a detectar envíos problemáticos antes de la revisión manual.
- Revisión de cambios en repositorios de código: evaluar si una fusión (merge) de Gerrit se completará o se abandonará, integrándose en pipelines de CI/CD para señalizar cambios de riesgo.
- Priorización de preguntas en Stack Exchange: estimar la probabilidad de que una pregunta reciba respuesta o sea cerrada, permitiendo a los moderadores actuar sobre contenido de baja calidad.
- Gestión de procesos AfC/AfD de Wikipedia: puntuar la probabilidad de aceptación o borrado de artículos, ayudando a los revisores a asignar esfuerzo donde más importa.
- Puntuación de coincidencias en aplicaciones: según la descripción de Zils, el modelo puede entrenarse con ejemplos etiquetados para puntuar la idoneidad de candidatos en sistemas de recomendación o emparejamiento.
- Clasificación de solicitudes entrantes: usar el modelo como extractor de características para enrutar peticiones a equipos o colas adecuadas en función de su probabilidad de resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.392.695.024 parámetros, en precisión FP16 se requieren aproximadamente 16,8 GB de VRAM solo para los pesos; en cuantización de 8 bits, unos 8,4 GB; en 4 bits, unos 4,2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para FP16, una A100 de 40 GB o H100; para cuantizaciones de 8 o 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes para los pesos, aunque el contexto y el overhead de activaciones pueden requerir más memoria.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones de 4 u 8 bits en GPUs con 16-24 GB de VRAM, siempre que el contexto utilizado no sea muy largo.
- Opciones de despliegue: transformers (librería declarada, con custom_code); vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor, aunque al ser un modelo de la familia Qwen es plausible su conversión a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-flash-decision-v2 | 8,39 B | no disponible | Apache-2.0 | Decisión/puntuación (fine-tuning LoRA) |
| vllm-sr/d3-flash (base) | no disponible | no disponible | Apache-2.0 | Modelo base de la familia Qwen3.5-9B |
| malkolm777/zils-flash-decision-v1 | no disponible | no disponible | no disponible | Versión anterior del mismo ajuste |
| Qwen/Qwen3.5-9B (familia) | ~9 B (según denominación) | no disponible | no disponible | Modelo de propósito general |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar sesgos de esas comunidades.
- Riesgo de alucinación: no evaluado; al ser un modelo de extracción de características y puntuación, el riesgo de generar contenido falso es menor que en modelos generativos, pero las puntuaciones pueden ser erróneas en dominios fuera de distribución.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en castellano o en textos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base vllm-sr/d3-flash y la familia Qwen3.5 pueden tener condiciones adicionales que deben verificarse; el autor remite a LICENSE y NOTICE.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin benchmarks públicos ni documentación de entrenamiento detallada; se recomienda validación exhaustiva antes de desplegarlo.
- El pipeline declarado es feature-extraction, por lo que no debe esperarse generación de texto conversacional sin adaptación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-flash-decision-v2
- Versión anterior: https://huggingface.co/malkolm777/zils-flash-decision-v1
- Sitio del ecosistema Zils: https://zils.ai/
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
