# sathish15g/bert-imdb

## Resumen

bert-imdb es un ajuste fino (fine-tuning) del modelo base google-bert/bert-base-uncased, publicado en Hugging Face por el usuario sathish15g. Se trata de un modelo encoder de la familia BERT orientado a clasificación de texto, concretamente a la tarea de análisis de sentimiento binario sobre reseñas de películas del corpus IMDB, aunque la model card no confirma explícitamente el dataset de entrenamiento. El modelo resuelve el problema clásico de clasificación de polaridad (positivo/negativo) en textos en inglés.

Arquitectónicamente es un transformer encoder estándar de tipo BERT-base, con 109.483.778 parámetros totales (aproximadamente 110 millones) y pesos almacenados en formato safetensors. El repositorio ocupa 0,4 GB y la licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales de dicha licencia.

La relevancia de este modelo es limitada en el ecosistema actual: se trata de un ajuste fino de un modelo base de 2018, sin benchmarks publicados en su model-index (la lista de resultados está vacía) y con cero descargas y cero likes en el momento de la consulta. Su interés es principalmente como ejemplo de pipeline de fine-tuning supervisado con Hugging Face Trainer, más que como modelo de producción frente a alternativas como RoBERTa o DeBERTa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, tipo bidireccional) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT acepta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización dinámica vía PyTorch) |
| Idiomas soportados | no disponibles (el modelo base es inglés, uncased) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-base-uncased, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario WordPiece en minúsculas. Sobre esta base se añade una cabeza de clasificación de secuencia para text-classification. El entrenamiento se realizó con Hugging Face Trainer (versión de Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5, Tokenizers 0.23.3) y los hiperparámetros declarados son: learning rate 2e-05, batch de entrenamiento 16, batch de evaluación 32, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, 2 épocas y precisión mixta nativa (AMP).

La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO (no aplicable en un encoder de clasificación). Tampoco documenta la innovación técnica alguna más allá del ajuste fino estándar. El dataset de entrenamiento aparece como "unknown dataset" en la model card generada automáticamente, por lo que no se puede confirmar que sea IMDB pese al nombre del modelo. El entrenamiento alcanzó 2.500 pasos totales (1.250 por época).

## Capacidades

- Clasificación de texto binaria (text-classification) sobre secuencias de entrada, orientada a análisis de sentimiento en inglés.
- Generación de etiquetas de polaridad con puntuaciones de confianza asociadas a la cabeza de clasificación.
- Procesamiento de textos en inglés en minúsculas (tokenizador uncased del modelo base).
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües no documentadas; el modelo base es monolingüe inglés.
- Compatible con Text Embeddings Inference (tag text-embeddings-inference) y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Análisis de sentimiento de reseñas de productos o películas en inglés: el modelo clasifica cada reseña como positiva o negativa con una precisión reportada del 91,99% en el conjunto de evaluación, adecuado para monitorización de opiniones a escala.
- Moderación de comentarios y filtrado de toxicidad básica: puede adaptarse como clasificador binario de contenido aceptable/no aceptable mediante un nuevo ajuste fino sobre la cabeza existente.
- Enrutamiento de tickets de soporte: clasificación rápida de mensajes de clientes en categorías binarias (queja vs. consulta) gracias a su bajo coste computacional.
- Etiquetado de datasets a gran escala: al ser un modelo de 110M de parámetros, puede procesar millones de textos en GPU consumer para preetiquetar corpus de entrenamiento.
- Detección de spam en formularios o correos: clasificación binaria de mensajes entrantes con inferencia de baja latencia.
- Baseline en experimentos de NLP: punto de partida para comparar arquitecturas encoder en tareas de clasificación antes de escalar a modelos mayores.
- Extracción de señal en pipelines de análisis de mercado: procesamiento de noticias financieras o titulares para clasificar tono positivo/negativo.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (datos del autor, sin verificación independiente):

| Métrica | Valor |
|---|---|
| Loss (evaluación final) | 0,2695 |
| Accuracy | 0,9199 |
| F1 | 0,9205 |

Evolución durante el entrenamiento:

| Época | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 1250 | 0,2466 | 0,9006 | 0,8968 |
| 2 | 2500 | 0,2874 | 0,9184 | 0,9188 |

El model-index oficial no contiene resultados adicionales (lista vacía). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB para los pesos (110M parámetros × 4 bytes), más overhead de activaciones.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1060 6GB, RTX 3060, RTX 4090, así como en CPU para lotes pequeños.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir lotes grandes; RTX 4090 para desarrollo.
- Opciones de despliegue: Transformers con pipeline de text-classification, Text Embeddings Inference (tag declarado), vLLM no aplicable (modelo no generativo), Ollama/llama.cpp no soportados de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera inferencia de milisegundos por secuencia en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| bert-imdb (este modelo) | 109,5M | no disponible (base 512) | Apache 2.0 | Hugging Face, 0 descargas | Accuracy 0,9199, F1 0,9205 (eval. propio) |
| google-bert/bert-base-uncased | 110M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado | No es clasificador; requiere fine-tuning |
| roberta-base | 125M | 512 tokens | MIT | Hugging Face | Sin datos comparables en esta ficha |
| distilbert-base-uncased-finetuned-sst-2-english | 67M | 512 tokens | Apache 2.0 | Hugging Face | Clasificador de sentimiento popular; sin datos comparables verificados aquí |

No se dispone de comparaciones directas publicadas entre este modelo y alternativas en la misma tarea dentro de la información proporcionada.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado ("unknown dataset"), por lo que no se puede garantizar que corresponda a IMDB ni conocer su distribución.
- El model-index no contiene resultados verificables; las métricas son autodeclaradas por el autor sin validación externa.
- El modelo base es monolingüe inglés y uncased; el rendimiento en otros idiomas o con texto en mayúsculas relevantes (siglas, entidades) puede degradarse.
- Riesgo de sesgo heredado de bert-base-uncased, entrenado sobre corpus web con sesgos demográficos y culturales no auditados.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios alejados del entrenamiento.
- Longitud máxima de entrada limitada por el modelo base (512 tokens); textos más largos requieren truncamiento o segmentación.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las obligaciones de atribución y las condiciones del modelo base.
- Cero descargas y cero likes indican ausencia de validación por la comunidad; no se recomienda para producción sin evaluación propia.
- No apto para tareas generativas, de razonamiento o agentes; su uso está restringido a clasificación.

## Enlaces

- Hugging Face: https://huggingface.co/sathish15g/bert-imdb
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper original de BERT: https://arxiv.org/abs/1810.04805
- Documentación de Transformers (text-classification): https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
