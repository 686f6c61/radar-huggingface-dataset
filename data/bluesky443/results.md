# Bluesky443/results

## Resumen

El modelo `Bluesky443/results` es un ajuste fino (fine-tuning) de DistilBERT, la variante destilada de BERT desarrollada por Hugging Face. Lo publica el usuario Bluesky443 en Hugging Face y está orientado a clasificación de texto. El nombre interno del artefacto es `distilbert-imdb-sentiment-2344`, lo que sugiere un ajuste para análisis de sentimiento sobre reseñas de películas, aunque la model card no documenta explícitamente el conjunto de datos de entrenamiento.

Se trata de un transformer encoder de tipo BERT con 66.955.010 parámetros totales (aproximadamente 67 millones), distribuidos en 6 capas, derivado de `distilbert-base-uncased`. La longitud de contexto es de 512 tokens, la habitual en la familia BERT. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors, con licencia Apache 2.0.

La relevancia de esta ficha es limitada: se trata de un modelo experimental de un autor individual, sin descargas ni likes, con una model card autogenerada y sin datos de evaluación publicados más allá de una única tabla de validación durante el entrenamiento. Resulta útil como ejemplo de pipeline de fine-tuning con `Trainer` y como clasificador ligero de sentimiento, pero no está pensado para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, derivado de BERT) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en inglés; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT: un transformer encoder de 6 capas con atención multi-cabeza estándar, destilado desde `bert-base-uncased` mediante knowledge distillation. El modelo base es `distilbert/distilbert-base-uncased`, con vocabulario WordPiece en minúsculas y posición de clasificación sobre el token `[CLS]` para la tarea de `text-classification`.

El entrenamiento se realizó con la librería Transformers 5.21.0 y PyTorch 2.11.0+cu130, usando `Trainer`. Los hiperparámetros declarados son: learning rate 2e-05, batch size de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, 1 época y precisión mixta nativa (AMP). La tabla de resultados del entrenamiento muestra un único paso de evaluación (step 4, época 1.0) con validation loss 0.2262, accuracy 0.94, precision 0.9184, recall 0.9574 y F1 0.9375. No se documenta el conjunto de datos, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo).

## Capacidades

- Clasificación de texto: la tarea declarada en el pipeline es `text-classification`, con una única cabeza de clasificación ajustada.
- Análisis de sentimiento: el nombre del artefacto (`distilbert-imdb-sentiment-2344`) apunta a un clasificador binario de sentimiento sobre reseñas tipo IMDb.
- Inferencia de embeddings de texto: el tag `text-embeddings-inference` indica compatibilidad con el servidor TEI de Hugging Face para servir el modelo.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en Inference Endpoints de Hugging Face.
- No soporta tool calling ni function calling: no es un modelo generativo.
- No soporta agentes ni razonamiento multi-paso: es un encoder discriminativo.
- Capacidades multilingües: no declaradas; el modelo base es monolingüe en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de reseñas de producto: clasificar reseñas de usuarios en positivas o negativas para priorizar respuestas del equipo de soporte. El modelo es ligero (67 M de parámetros) y puede ejecutarse en CPU con latencia baja.
- Análisis de sentimiento en pipelines de monitorización de marca: procesar lotes de menciones en redes sociales o foros y agregar la polaridad por periodo. Adecuado por su tamaño reducido y su contexto de 512 tokens, suficiente para reseñas cortas y tuits.
- Filtrado previo en sistemas de atención al cliente: etiquetar tickets entrantes como queja o satisfacción antes de enrutarlos a un agente humano, reduciendo el volumen que llega a la cola prioritaria.
- Extracción de señal en datasets de investigación: usar el clasificador como etiquetador débil para preanotar corpus de reseñas y acelerar el etiquetado manual posterior.
- Prototipado rápido de clasificadores: servir como línea base en experimentos de NLP académicos gracias a su licencia Apache 2.0 y a su integración directa con `transformers`.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, puede integrarse en contenedores pequeños o en funciones serverless para clasificación bajo demanda.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre `distilbert-imdb-sentiment-2344` y una lista de resultados vacía. El único dato de rendimiento disponible es la tabla de validación del entrenamiento:

| Métrica | Valor (validación, época 1) |
|---|---|
| Validation loss | 0.2262 |
| Accuracy | 0.94 |
| Precision | 0.9184 |
| Recall | 0.9574 |
| F1 | 0.9375 |

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (67 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 135 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4090, A100 y H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable; con 67 M de parámetros la inferencia por muestra es del orden de milisegundos en CPU moderna.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI) por el tag `text-embeddings-inference`, Hugging Face Inference Endpoints por el tag `endpoints_compatible`, y ONNX Runtime si se exporta manualmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bluesky443/results (este modelo) | 66,9 M | 512 | Clasificación de texto | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Clasificación de sentimiento | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | ~110 M | 512 | Encoder general | Apache 2.0 | Hugging Face |
| roberta-base | ~125 M | 512 | Encoder general | MIT | Hugging Face |

La comparación con alternativas consolidadas es desfavorable en términos de validación: el modelo de referencia `distilbert-base-uncased-finetuned-sst-2-english` cuenta con evaluación pública en SST-2, mientras que este artefacto solo aporta métricas de validación internas sin dataset identificado.

## Limitaciones y advertencias

- La model card es autogenerada y no documenta el dataset de entrenamiento, el dominio de aplicación ni las limitaciones previstas.
- El `model-index` no contiene resultados de benchmarks, por lo que el rendimiento real fuera del conjunto de validación es desconocido.
- El nombre del artefacto sugiere sentimiento sobre IMDb, pero no se confirma; usarlo en otros dominios (por ejemplo, reseñas de producto o tickets) requiere validación empírica.
- Riesgo de sesgos heredados de `distilbert-base-uncased`: el corpus de preentrenamiento (Wikipedia y BookCorpus en inglés) puede introducir sesgos de género, raza y dominio.
- Riesgo de alucinación no aplicable en sentido estricto (no es generativo), pero sí riesgo de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Limitación de contexto: 512 tokens; textos más largos se truncan, lo que puede perder la parte final de reseñas extensas.
- Idioma: el modelo base es `uncased` en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin descargas ni likes: no hay evidencia de uso en producción ni de validación por terceros; tratarlo como artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bluesky443/results
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Documentación de Inference Endpoints: https://huggingface.co/docs/inference-endpoints
