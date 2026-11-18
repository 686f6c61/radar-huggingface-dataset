# alphaedge-ai/mmBERT-small-bak-32768

## Resumen

mmBERT-small-bak-32768 es una variante "trimmed" (podada) del codificador multilingüe moderno jhu-clsp/mmBERT-small, publicada por alphaedge-ai y optimizada específicamente para el idioma bashkir (código ISO `ba`). El modelo conserva la arquitectura ModernBERT del original pero reduce su vocabulario de 256.000 a 32.768 tokens, lo que se traduce en una reducción del 87,20% en el tamaño del vocabulario y del 61,01% en el número total de parámetros: de 140.493.696 a 54.772.608. El resultado es un modelo de extracción de características y fill-mask mucho más ligero en memoria, pensado para despliegues de bajo coste en un único idioma.

La poda se realizó con la técnica de trimming descrita por Loïck Bourdois y colaboradores en el blog de Hugging Face, que consiste en identificar los tokens realmente utilizados por el idioma objetivo mediante minería sobre un corpus representativo y eliminar el resto del vocabulario y de la matriz de embeddings. En este caso se emplearon 179.964 textos del dataset lbourdois/fineweb-2-trimming. El modelo resultante mantiene la licencia MIT y el formato original de transformers con pesos en safetensors.

Es relevante ahora porque demuestra una vía práctica de adaptación de codificadores multilingües grandes a idiomas de bajos recursos sin reentrenamiento completo: se conserva la calidad del modelo base para el idioma seleccionado con una fracción del coste de almacenamiento e inferencia. La contrapartida es que el modelo deja de ser útil para otros idiomas, ya que los tokens no presentes en bashkir se han eliminado del vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 54.772.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bashkir (`ba`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura ModernBERT del base jhu-clsp/mmBERT-small, un encoder transformer bidireccional con atención de tipo moderno (rotary position embeddings y atención lineal/alternada según la familia ModernBERT) diseñado para tareas de comprensión y extracción de características. No se ha reentrenado: la modificación consiste exclusivamente en el truncado del vocabulario y de la matriz de embeddings, por lo que los pesos de las capas internas se mantienen los del modelo original.

El proceso de trimming parte de 179.964 textos en bashkir del dataset lbourdois/fineweb-2-trimming para determinar qué tokens del vocabulario original se usan realmente; los no utilizados se eliminan y se reconstruye el tokenizador con 32.768 entradas. No hay información disponible sobre el número de tokens de entrenamiento original, la composición del corpus de preentrenamiento de mmBERT ni sobre si hubo RLHF o DPO (en un encoder de este tipo no es habitual). La innovación técnica destacable es precisamente el método de trimming, que reduce el footprint sin tocar el resto de la red.

## Capacidades

- Extracción de características (feature-extraction) para embeddings de frases y representaciones contextuales en bashkir.
- Fill-mask: predicción de tokens enmascarados, útil para evaluación lingüística y tareas de completado.
- Codificación bidireccional apta para clasificación de texto, NER, análisis de sentimiento y reranking, siempre que se añada una cabeza de tarea.
- Soporte multilingüe limitado al bashkir; el resto de idiomas del modelo base queda fuera del vocabulario.
- No dispone de generación de texto autoregresiva, tool calling, capacidades de agente ni modo thinking.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Clasificación de documentos en bashkir: añadiendo una cabeza de clasificación sobre las representaciones del encoder, se puede entrenar un clasificador de noticias o reseñas con un modelo de solo 54,7 M de parámetros, adecuado para entornos con recursos limitados.
- Búsqueda semántica y recuperación de información en bashkir: los embeddings del encoder permiten construir índices vectoriales de documentos en este idioma con un coste de memoria muy inferior al del modelo base.
- Reconocimiento de entidades nombradas: el encoder sirve como backbone para un modelo token-classification en bashkir, tarea para la que los codificadores multilingües pequeños son habituales.
- Filtrado y moderación de contenido: clasificación de textos cortos en bashkir en pipelines de alta吞吐 con CPU, gracias al reducido tamaño del modelo.
- Evaluación lingüística y completado de texto: la cabeza de fill-mask permite construir pruebas de conocimiento léxico y morfológico del bashkir.
- Reranking en sistemas de búsqueda: puntuación de pares consulta-documento en bashkir con un cross-encoder ligero derivado de este modelo.
- Prototipado e investigación en idiomas de bajos recursos: sirve como ejemplo reproducible de la técnica de trimming aplicada a un codificador multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,22 GB solo para pesos (54,77 M de parámetros), más activaciones y overhead del runtime; en fp16 alrededor de 0,11 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU recomendadas para producción de alto throughput: T4, L4, A10G, A100 o H100, aunque el modelo es lo bastante pequeño para que la CPU sea viable en muchos escenarios.
- Opciones de despliegue: transformers (biblioteca nativa), con posibilidad de exportación a ONNX; no hay información disponible sobre soporte específico en vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| alphaedge-ai/mmBERT-small-bak-32768 | 54.772.608 | 32.768 | no disponible | bashkir | MIT |
| jhu-clsp/mmBERT-small (base) | 140.493.696 | 256.000 | no disponible | multilingüe | no disponible en la informacion proporcionada |
| Otros trimmed de mmBERT-small | no disponible | no disponible | no disponible | según idioma | no disponible |

La comparación directa con alternativas de la misma categoría (codificadores pequeños para bashkir) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia clave es el menor tamaño (61,01% menos parámetros) a cambio de perder cobertura multilingüe.

## Limitaciones y advertencias

- El vocabulario se ha reducido a los tokens frecuentes en bashkir; el rendimiento en otros idiomas será deficiente o directamente inviable.
- Al ser un modelo podado sin reentrenamiento, puede degradarse en dominios del bashkir poco representados en el corpus de minería (179.964 textos de fineweb-2).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de predicciones erróneas en fill-mask y de sesgos heredados del corpus de preentrenamiento del modelo base.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base jhu-clsp/mmBERT-small y del dataset utilizado.
- No hay información publicada sobre longitud de contexto soportada, por lo que conviene validar empíricamente el truncado adecuado en producción.
- El modelo tiene un uso muy bajo (10 descargas, 0 likes) y no se han publicado evaluaciones independientes; trátese como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/mmBERT-small-bak-32768
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Paper mmBERT: https://arxiv.org/abs/2509.06888
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
