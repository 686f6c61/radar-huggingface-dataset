# Samalas/sentiment-analyzer-v1

## Resumen
Samalas/sentiment-analyzer-v1 es un clasificador de sentimiento para publicaciones de redes sociales, reseñas y feedback de clientes, distribuido como adaptador LoRA sobre el modelo base Qwen2.5-3B-Instruct cuantizado a 4 bits. El autor lo presenta como el "Model 04" de una serie interna y lo orienta a la monitorizacion de marca, el triaje de soporte al cliente y el analisis de reseñas. Clasifica el texto en tres categorias: positivo, negativo y neutral.

El modelo se ha entrenado con 1.600 publicaciones reales etiquetadas manualmente (1.280 de entrenamiento y 320 de validacion), procedentes de Twitter, Reddit, reseñas de producto y feedback de clientes, con una distribucion de clases del 45% positivo, 35% negativo y 20% neutral. El adaptador LoRA tiene un rango 8, afecta a 20 capas y anade aproximadamente 6 millones de parametros, un 0,2% del modelo base, ocupando 9,6 MB.

Es relevante ahora por su enfoque de bajo coste para una tarea muy concreta: en lugar de desplegar un LLM generalista, el autor propone un adaptador pequeno sobre una base de 3B cuantizada, pensado para ejecutarse en hardware modesto (4-6 GB de RAM) con MLX. El repositorio esta practicamente vacio en cuanto a traccion (0 descargas, 0 likes en el momento de la consulta) y no declara licencia, idiomas ni pipeline en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct) con adaptador LoRA |
| Parametros totales | ~3.000M en la base Qwen2.5-3B-Instruct + ~6M del adaptador LoRA (0,2%) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | Base en 4 bits; adaptador en 16 bits |
| Idiomas soportados | No disponible en los metadatos; el autor indica que solo funciona en ingles y que rinde mal en otros idiomas |
| Licencia | No disponible |
| Formato de pesos | Adaptador LoRA (9,6 MB); base inferida con mlx-lm en formato MLX 4-bit. El formato exacto del adaptador no se especifica |

## Arquitectura y entrenamiento
El modelo no es una red propia, sino un adaptador LoRA (rank 8, aplicado sobre 20 capas) montado sobre Qwen2.5-3B-Instruct cuantizado a 4 bits. La eleccion de una base de 3B se justifica en la model card por el tipo de tarea: clasificacion de sentimiento, no generacion de texto larga. El adaptador final ocupa 9,6 MB y anade unos 6 millones de parametros. El pipeline de inferencia declarado es mlx-lm, lo que vincula el modelo al ecosistema MLX de Apple Silicon.

El entrenamiento uso el optimizador AdamW con entropia cruzada sobre la tarea de clasificacion, sin warmup y con una tasa de aprendizaje constante de 1e-5, batch size 1, gradient checkpointing activado y 300 iteraciones en total. El autor guardo tres checkpoints (100, 200 y 300 iteraciones) con precisiones de validacion de 86%, 88% y 90% respectivamente, y recomienda el checkpoint 300 para produccion. No se documenta ninguna tecnica adicional de alineamiento (RLHF, DPO) ni un proceso de entrenamiento supervisado mas alla del ajuste LoRA sobre datos etiquetados.

## Capacidades
- Clasificacion de sentimiento en tres clases: positivo, negativo y neutral.
- Analisis de publicaciones de redes sociales, reseñas de producto y feedback de clientes.
- Deteccion fiable de sentimiento negativo explicito (recall del 91% segun validacion).
- Deteccion fiable de sentimiento positivo (precision del 92% segun validacion).
- Procesamiento por lotes (batch) de listas de textos.
- No se declara soporte de tool calling ni function calling.
- No se declara capacidad de agente ni razonamiento multi-paso.
- Capacidad multilingue: no soportada segun el autor, que limita el modelo al ingles.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Monitorizacion de marca en redes sociales: el modelo puede clasificar en tiempo real menciones de Twitter o Reddit y agregar el tono predominante por periodo, gracias a un throughput declarado superior a 50 publicaciones por segundo en configuracion optimizada.
- Analisis y ordenacion de resenas de producto: dado un volcado de opiniones de clientes, el modelo permite separar por sentimiento y priorizar las resenas negativas para su revision por el equipo de producto.
- Triaje de soporte al cliente: clasifica los tickets o mensajes entrantes y enruta los de tono negativo a un canal prioritario, ya que su recall del 91% en negativo reduce el riesgo de ignorar clientes descontentos.
- Deteccion temprana de crisis de reputacion: al clasificar el flujo de menciones en positivo, negativo y neutral, permite generar alertas cuando el porcentaje de negativo sube por encima de un umbral definido.
- Identificacion de prescriptores de marca: la precision del 92% en positivo facilita localizar publicaciones entusiastas para programas de testimonios o marketing de embajadores.
- Filtrado previo a revision humana: el modelo encaja como primera pasada en un pipeline donde solo los casos dudosos o clasificados como negativos se escalan a una persona, dado su error estimado del 10%.
- Analisis de tendencias de sentimiento en el tiempo: agregando las clasificaciones por dia o semana se pueden construir paneles de salud de marca sin necesidad de lectura manual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, etc.) en la informacion disponible. La model card unicamente aporta metricas de validacion interna sobre un conjunto retenido de 320 ejemplos.

| Metrica de validacion | Valor |
|---|---|
| Precision global (accuracy) | 90% |
| Precision (Positive) | 92% |
| Recall (Positive) | 88% |
| Precision (Negative) | 89% |
| Recall (Negative) | 91% |
| F1 Score | 0,90 |

| Checkpoint | Iteracion | Precision |
|---|---|---|
| 0000100 | 100 | 86% |
| 0000200 | 200 | 88% |
| 0000300 | 300 | 90% |

## Requisitos de hardware
- RAM: 4 GB minimo, 6 GB recomendado segun la model card.
- Almacenamiento: aproximadamente 1 GB para el modelo base y unos 10 MB para el adaptador.
- GPU / plataforma: el pipeline declarado es MLX, orientado a Apple Silicon (chips M-series). No se documentan configuraciones para GPU CUDA.
- Inferencia en consumer GPU: no confirmado; al ser un modelo basado en MLX, el uso previsto es en hardware Apple, no en GPU dedicadas tipo RTX 4090 o A100.
- Despliegue: mlx-lm como libreria principal. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no serian directamente compatibles con el formato MLX sin conversion.
- Latencia: aproximadamente 1 segundo por publicacion segun el autor.
- Throughput: mas de 50 publicaciones por segundo en configuracion optimizada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos en la informacion proporcionada. A continuacion se comparan categorias de alternativas de forma cualitativa, sin cifras de rendimiento, dado que no se aportan resultados medidos frente a estos modelos.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samalas/sentiment-analyzer-v1 | Adaptador LoRA sobre LLM 3B | ~3.000M base + ~6M adaptador | No disponible | No disponible | HuggingFace (0 descargas) |
| Clasificadores tipo BERT/RoBERTa afinados para sentimiento | Transformer encoder dedicado | No disponible | No disponible | No disponible | Habitualmente en HuggingFace |
| LLM generalista pequeno (p. ej. familia Qwen2.5-3B) | Transformer decoder-only | ~3.000M en la variante 3B | No disponible en esta ficha | No disponible en esta ficha | HuggingFace y otros repositorios |

La diferencia de planteamiento es que este modelo no busca generar texto, sino resolver una tarea de clasificacion con un adaptador minimo sobre una base ya existente. No se aportan comparaciones directas medidas contra los modelos de la tabla.

## Limitaciones y advertencias
- Sarcasmo: el propio autor reconoce que la deteccion de ironia es debil y que puede clasificar como positivo un mensaje que en realidad es negativo.
- Sentimiento mixto: los textos con opiniones combinadas ("buen precio pero mala calidad") se simplifican a un unico tono dominante.
- Idiomas: el modelo solo funciona en ingles; el autor indica explicitamente que no generaliza a otros idiomas ni a lenguajes de bajos recursos.
- Jerga y abreviaturas: el rendimiento cae con argot, abreviaturas y expresiones coloquiales no vistas en el entrenamiento.
- Sesgo cultural: entrenado con redes sociales occidentales, puede no generalizar a otras culturas segun la propia model card.
- Tasa de error: se declara un 10% de clasificaciones incorrectas; se recomienda revision humana para decisiones criticas.
- Contexto conversacional: el modelo ignora el contexto de mensajes previos, por lo que no resuelve referencias anafóricas ni significados dependientes de la conversacion.
- Emojis y caracteres especiales: requieren un formateo o codificacion adecuada, no documentada en detalle.
- Licencia: no disponible. No se puede confirmar el uso comercial ni las condiciones de redistribucion, ni del adaptador ni del modelo base subyacente.
- Integridad del ejemplo de uso: el fragmento de codigo de la model card carga solo el modelo base Qwen2.5-3B-Instruct-4bit sin aplicar el adaptador LoRA, por lo que no reproduce la inferencia del modelo afinado tal como esta publicado.
- Datos de validacion limitados: las metricas de 90% de precision y F1 0,90 provienen de un conjunto de validacion de solo 320 ejemplos, sin benchmark externo independiente.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Metadatos incompletos en HuggingFace: sin pipeline declarado, sin idiomas y sin licencia, lo que dificulta la evaluacion y reutilizacion.

## Enlaces
- HuggingFace: https://huggingface.co/Samalas/sentiment-analyzer-v1
- Modelo base referenciado en el codigo de ejemplo: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- Modelo base citado en la model card: Qwen2.5-3B-Instruct
- Libreria de inferencia: mlx-lm (pip install mlx mlx-lm)
