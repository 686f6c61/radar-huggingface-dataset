# malkolm777/zils-mini-decision-v3

## Resumen

zils-mini-decision-v3 es un modelo de extracción de características (feature extraction) publicado por el usuario malkolm777 en Hugging Face. Se trata de un ajuste fino mediante LoRA de un cuerpo base denominado Maincode/Matilda-Decision-v1-Mini, que a su vez pertenece a la familia Qwen/Qwen3.5-4B según la model card del autor. El modelo está etiquetado como "decision-model" y se presenta como el cuerpo de decisión "d3-mini" para el pool mini de la subred Zils 127, un contexto que sugiere un uso dentro de una infraestructura de agentes o validadores más que como modelo generativo de propósito general.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) según los pesos en safetensors, un repositorio de 9,1 GB y licencia Apache 2.0. La arquitectura declarada en los tags es "qwen3_5", con código personalizado (custom_code) en la librería transformers, lo que implica que su carga requiere confiar en implementaciones remotas o revisar el código incluido en el repositorio.

Su relevancia es limitada fuera de su ecosistema: no tiene descargas ni "likes", no declara idiomas soportados y no publica resultados de benchmarks. Resulta útil, por tanto, como caso de estudio de modelos de decisión especializados derivados de Qwen3.5-4B y como componente dentro de pipelines de clasificación o scoring, no como sustituto de un modelo conversacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-4B, tag qwen3_5) con código personalizado |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Maincode/Matilda-Decision-v1-Mini, descrito por el autor como un "mini house body" de la familia Qwen/Qwen3.5-4B. El entrenamiento consistió en una única ronda de LoRA con rango 16 y optimizador AdamW con tasa de aprendizaje 5e-5. El conjunto de datos se describe como "grande y sin límite" (uncapped), compuesto por elementos de decisión etiquetados con resultados públicos, recopilados mediante la herramienta zils.current a partir de fuentes como reversiones de Wikipedia, anuncios de categorías de arXiv, merges de Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia.

La arquitectura subyacente es un transformer denso de aproximadamente 4,54 mil millones de parámetros, aunque la model card no detalla número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos de atención. Tampoco se especifica la composición exacta del dataset, el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. La innovación principal declarada es el propio dominio de aplicación: un modelo entrenado para emitir decisiones o puntuaciones sobre elementos etiquetados con resultados binarios o categóricos, más que para generar texto libre.

## Capacidades

- Extracción de características y representaciones vectoriales (pipeline feature-extraction), orientada a tareas de decisión y scoring.
- Clasificación o puntuación de elementos con resultados etiquetados (reversiones, merges, aceptaciones/rechazos), según el dominio de entrenamiento descrito.
- Ajuste fino mediante LoRA sobre un cuerpo base de la familia Qwen3.5-4B, lo que sugiere capacidad de heredar representaciones lingüísticas del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede puntuar ediciones o reversiones propuestas en Wikipedia para priorizar revisiones humanas, aprovechando que fue entrenado con datos de reversiones reales.
- Triaje de envíos a arXiv: dado su entrenamiento con anuncios de categorías de arXiv, puede asignar una puntuación de adecuación a un manuscrito respecto a una categoría concreta antes de la revisión editorial.
- Priorización de revisiones de código en Gerrit: el modelo puede evaluar merges y cambios propuestos para señalar los que requieren revisión humana detallada, según el patrón aprendido de merges aceptados y rechazados.
- Filtrado de preguntas en Stack Exchange: puede clasificar preguntas entrantes como candidatas a cierre, duplicado o respuesta válida, apoyándose en el corpus de preguntas y respuestas etiquetadas.
- Evaluación de artículos en AfC/AfD de Wikipedia: puede emitir una puntuación de aceptación o rechazo para borradores de artículos, alineada con los procesos de revisión descritos en el entrenamiento.
- Componente de decisión en pipelines de agentes: al ser un cuerpo de decisión "d3-mini" para el pool mini de la subred Zils 127, puede integrarse como módulo de scoring dentro de un sistema mayor de validación o enrutamiento.
- Extracción de embeddings para búsqueda semántica: gracias a su pipeline feature-extraction, puede generar representaciones vectoriales de textos para recuperación o clustering, siempre que se valide su calidad en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y contexto; se recomienda al menos 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos, con margen adicional para activaciones; viable en GPUs de 8 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-3 GB de pesos; viable en GPUs consumer de 6-8 GB, aunque la cuantización no está documentada por el autor.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en producción con lotes grandes; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) y RTX 4080 (16 GB) también suficientes en FP16.
- GPUs consumer: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización, en RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers (requiere custom_code y confiar en código remoto o revisarlo), vLLM y TGI si el código personalizado es compatible; llama.cpp y Ollama solo si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-decision-v3 | 4,54 B | no disponible | Apache 2.0 | Modelo de decisión (feature extraction) | Hugging Face, 0 descargas |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | Apache 2.0 (según modelo base declarado) | Modelo de decisión base | Hugging Face |
| Qwen/Qwen3.5-4B | ~4 B (familia) | no disponible | no disponible en esta ficha | Modelo generativo generalista | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión especializados) no está disponible en la información proporcionada; los únicos puntos de referencia son el modelo base y la familia Qwen3.5-4B de la que deriva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar sesgos de esas comunidades y de sus políticas de moderación.
- Riesgo de alucinación: aunque el pipeline es feature-extraction, si se usa para generar texto puede producir contenido no fundamentado; no hay evaluaciones publicadas.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y los idiomas soportados no están especificados; no se debe asumir cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo incluye custom_code y depende de un modelo base cuya licencia y condiciones deben verificarse por separado; el autor remite a LICENSE y NOTICE del repositorio.
- Código personalizado: la carga con transformers requiere confiar en código remoto o auditar los archivos del repositorio, lo que supone un riesgo de seguridad en producción.
- Madurez: 0 descargas y 0 "likes", sin benchmarks ni documentación de contexto, cuantizaciones o idiomas; no es adecuado para producción sin una evaluación propia exhaustiva.
- Dominio acotado: su entrenamiento está orientado a decisiones sobre elementos etiquetados de fuentes concretas; su rendimiento fuera de ese dominio es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v3
- Modelo base: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Familia Qwen3.5-4B (referencia del autor): https://huggingface.co/Qwen/Qwen3.5-4B
