# Marwanpng/MovieSentimentLM

## Resumen

MovieSentimentLM es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo base HuggingFaceTB/SmolLM3-3B, desarrollado por el usuario Marwanpng. Su propósito es acotado y específico: clasificar reseñas de películas en dos categorías, `positive` o `negative`, mediante un formato de prompt/completación con pérdida calculada únicamente sobre la respuesta del asistente. El adaptador se entrena sobre el conjunto de datos Rotten Tomatoes (cornell-movie-review-data/rotten_tomatoes).

El modelo no es un modelo fundacional nuevo ni un chat generalista: es un ajuste fino paramétricamente eficiente (PEFT) que reutiliza la arquitectura y los pesos de SmolLM3-3B. El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde al peso del adaptador y no al del modelo base, que debe descargarse por separado. La longitud máxima de secuencia empleada durante el entrenamiento es de 192 tokens, un límite relevante para el diseño de prompts en producción.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados. Resulta útil como ejemplo de flujo QLoRA aplicado a clasificación binaria de sentimiento con un modelo de 3B, pero no debe confundirse con un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) heredada de SmolLM3-3B, con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 8 y alpha 16; el modelo base SmolLM3-3B tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 192 tokens de longitud máxima de entrenamiento (contexto nativo del modelo base no disponible en la información) |
| Tipos de cuantizacion | QLoRA 4 bits con bitsandbytes para el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 y alpha 16 montado sobre SmolLM3-3B, un transformer decoder-only causal de 3B parámetros. El entrenamiento se realizó con QLoRA, es decir, el modelo base se cuantiza a 4 bits con bitsandbytes y solo se actualizan los pesos del adaptador de baja dimensión. La tarea se formula como clasificación binaria de sentimiento en estilo prompt/completación, con la pérdida aplicada exclusivamente a los tokens de la respuesta del asistente, lo que evita que el modelo aprenda a reproducir el prompt.

El conjunto de datos de entrenamiento es Rotten Tomatoes (cornell-movie-review-data/rotten_tomatoes), un corpus clásico de reseñas de cine etiquetadas como positivas o negativas. La longitud máxima de secuencia durante el entrenamiento es de 192 tokens. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de las que aporte el modelo base.

## Capacidades

- Clasificación binaria de sentimiento de reseñas de películas: devuelve exactamente una palabra, `positive` o `negative`, según el prompt de sistema incluido en la model card.
- Generación de texto causal, heredada del modelo base SmolLM3-3B, aunque el ajuste fino está orientado a la tarea de clasificación.
- Formato de conversación mediante `apply_chat_template`, con roles de sistema y usuario, y opción `enable_thinking=False`.
- Inferencia con `transformers` y `peft` cargando el adaptador sobre el modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de reseñas de cine en pipelines de análisis: el adaptador recibe una reseña y devuelve `positive` o `negative`, integrándose en un flujo de preprocesado de datos de opinión.
- Moderación o filtrado de comentarios de usuarios en plataformas de contenido audiovisual: permite etiquetar rápidamente el tono de una reseña antes de publicarla o agregarla.
- Análisis de sentimiento a escala sobre corpus de críticas: al ser un adaptador ligero sobre un modelo de 3B, puede ejecutarse en lote sobre grandes volúmenes de reseñas cortas.
- Investigación y docencia sobre PEFT: sirve como ejemplo reproducible de QLoRA con rango 8 y alpha 16 sobre un modelo de 3B para una tarea de clasificación.
- Prototipado rápido de clasificadores de opinión: permite validar una hipótesis de producto con un adaptador de 0,1 GB antes de invertir en un modelo mayor.
- Enriquecimiento de datasets de reseñas: añadir etiquetas de sentimiento a corpus no etiquetados para entrenar posteriores modelos o análisis estadísticos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Baseline zero-shot accuracy | 87,43% |
| Fine-tuned validation accuracy | 93,62% |
| Fine-tuned test (held-out) accuracy | 92,21% |
| Fine-tuned test macro F1 | 92,21% |
| Matriz de confusión (test) | [[501, 32], [51, 482]] |

Los datos anteriores proceden de la model card del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,1 GB, pero requiere cargar el modelo base SmolLM3-3B para la inferencia.
- VRAM estimada para el modelo base en float16: en torno a 6-7 GB, más overhead de activaciones y del adaptador.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia cómoda; una RTX 3090 o 4080 también es suficiente para el modelo base en float16.
- Cabe en GPU de consumo con al menos 8 GB de VRAM si se cuantiza el modelo base; en float16 conviene disponer de 12 GB o más.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MovieSentimentLM | Adaptador LoRA sobre 3B | 192 tokens (entrenamiento) | Clasificación binaria de sentimiento | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM3-3B (base) | 3B | No disponible en esta ficha | Generación de texto general | Apache 2.0 | Hugging Face |
| Clasificadores de sentimiento clásicos (p. ej. basados en BERT) | 100M-300M | 512 tokens típicamente | Clasificación de sentimiento | Variable | Amplia disponibilidad |

No se dispone de datos de rendimiento comparables de alternativas en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para clasificación binaria de sentimiento en reseñas de películas; su uso fuera de ese dominio no está validado.
- La longitud máxima de entrenamiento es de 192 tokens, por lo que reseñas largas pueden truncarse y degradar la clasificación.
- No se documentan idiomas soportados; el entrenamiento con Rotten Tomatoes sugiere un sesgo hacia inglés, pero no está confirmado.
- Riesgo de alucinación: aunque la tarea es de clasificación cerrada, el modelo puede generar texto distinto de `positive` o `negative` si el prompt no se ajusta al formato esperado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse también la licencia del modelo base SmolLM3-3B, que es Apache 2.0 según la información disponible.
- El repositorio tiene cero descargas y cero likes, sin pipeline declarado; no hay evidencia de uso en producción ni de validación externa.
- No se documentan sesgos conocidos ni evaluaciones de robustez más allá de la matriz de confusión reportada.

## Enlaces

- Hugging Face: https://huggingface.co/Marwanpng/MovieSentimentLM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset: https://huggingface.co/datasets/cornell-movie-review-data/rotten_tomatoes
