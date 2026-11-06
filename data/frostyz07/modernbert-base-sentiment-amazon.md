# FrostyZ07/modernbert-base-sentiment-amazon

## Resumen

modernbert-base-sentiment-amazon es un modelo de clasificación de texto obtenido mediante fine-tuning de answerdotai/ModernBERT-base, publicado por el usuario FrostyZ07 en Hugging Face. Está especializado en análisis de sentimiento sobre reseñas de productos de Amazon, aunque la model card no documenta explícitamente el dataset de entrenamiento ("an unknown dataset"). El modelo resuelve la tarea de clasificar texto en categorías de sentimiento, con un rendimiento declarado de 0,9563 de accuracy y F1 macro sobre el conjunto de evaluación.

Arquitectura ModernBERT, un transformer encoder de 149,6 millones de parámetros que incorpora attention lineal y decodificación eficiente para contextos largos. El fine-tuning se realizó durante 3 épocas con AdamW fused, learning rate de 2e-5, batch size de 32 y precisión mixta nativa AMP, partiendo del checkpoint base de Answer.AI.

Es relevante porque ModernBERT representa una modernización del clásico BERT con mejoras en eficiencia y longitud de contexto, y este checkpoint ofrece una alternativa ligera y con licencia Apache 2.0 para tareas de clasificación de sentimiento en producción, sin las restricciones de licencia de modelos propietarios. No obstante, la documentación es mínima y el modelo tiene un uso muy limitado (104 descargas, 0 likes), lo que exige cautela antes de adoptarlo en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ModernBERT-base soporta hasta 8192 tokens, dato del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un transformer encoder de tipo BERT modernizado que sustituye la atención cuadrática clásica por mecanismos de atención lineal y decodificación eficiente, lo que permite manejar secuencias de hasta 8192 tokens con menor coste computacional que un BERT estándar. El checkpoint fine-tuneado conserva los 149,6 millones de parámetros del modelo base y añade una cabeza de clasificación de secuencias para la tarea de análisis de sentimiento.

El entrenamiento se realizó durante 3 épocas con un learning rate de 2e-5, batch size de 32, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con warmup del 10 % y precisión mixta nativa AMP, con semilla 42. El conjunto de datos de entrenamiento no está documentado en la model card. La evolución de la validación muestra un sobreajuste progresivo: la pérdida de validación baja a 0,2727 en la época 1, sube a 0,3320 en la época 2 y a 0,4320 en la época 3, mientras la accuracy se estanca en torno al 0,956. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Clasificación de texto para análisis de sentimiento, presumiblemente binario o multiclase según el dataset de entrenamiento (no documentado).
- Especialización en reseñas de productos de Amazon, según el nombre del modelo.
- Inferencia rápida en CPU y GPU gracias al tamaño reducido (149,6 M de parámetros) y a la arquitectura ModernBERT.
- Compatible con text-embeddings-inference y endpoints de Hugging Face (tag endpoints_compatible).
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base ModernBERT está entrenado principalmente en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de reseñas en marketplaces: clasificar automáticamente reseñas de productos de Amazon como positivas o negativas para priorizar la atención al cliente y detectar opiniones críticas.
- Análisis de sentimiento a escala en pipelines de datos: procesar grandes volúmenes de reseñas con un modelo de 149,6 M de parámetros que se ejecuta eficientemente en CPU o en una GPU consumer.
- Monitorización de reputación de producto: agregar el sentimiento de reseñas por producto o categoría para generar informes periódicos de satisfacción.
- Enrutamiento de tickets de soporte: usar la clasificación de sentimiento para dirigir quejas negativas a equipos especializados y consultas positivas a respuestas automáticas.
- Investigación académica sobre opiniones de consumo: servir como baseline ligero y reproducible (licencia Apache 2.0) para experimentos de análisis de sentimiento en dominios de e-commerce.
- Filtrado previo en sistemas de recomendación: incorporar la polaridad de las reseñas como señal adicional en el ranking de productos.
- Clasificación por lotes en entornos con recursos limitados: desplegar el modelo con text-embeddings-inference o transformers en contenedores pequeños sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no documentado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,4320 |
| Accuracy | 0,9563 |
| F1 Macro | 0,9563 |
| F1 Weighted | 0,9563 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation Loss | Accuracy | F1 Macro | F1 Weighted |
|---|---|---|---|---|---|
| 1.0 | 6250 | 0,2727 | 0,9539 | 0,9539 | 0,9539 |
| 2.0 | 12500 | 0,3320 | 0,9581 | 0,9581 | 0,9581 |
| 3.0 | 18750 | 0,4320 | 0,9563 | 0,9563 | 0,9563 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El model-index oficial está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB (149,6 M de parámetros × 4 bytes), más memoria para activaciones y batch.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB, holgadamente dentro de cualquier GPU consumer.
- Cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con latencias aceptables para clasificación.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso individual basta una GPU integrada o una RTX de gama baja.
- Opciones de despliegue: transformers (Pipeline de text-classification), text-embeddings-inference (tag endpoints_compatible), y en general cualquier runtime compatible con safetensors y arquitectura ModernBERT. No se documenta soporte explícito de llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernbert-base-sentiment-amazon | 149,6 M | no disponible (base: 8192) | Clasificación de sentimiento | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | 149,6 M | 8192 | Modelo base (encoder) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66 M | 512 | Clasificación de sentimiento | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 | Modelo base (encoder) | MIT | Hugging Face |

La comparativa de rendimiento con estas alternativas no está disponible porque el autor no publica resultados frente a otros modelos y el conjunto de evaluación no está documentado.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, el número de clases ni la distribución de etiquetas; no es posible verificar la validez de las métricas declaradas.
- Sobreajuste evidente: la pérdida de validación aumenta de 0,2727 (época 1) a 0,4320 (época 3) mientras la accuracy se estanca, lo que sugiere que el checkpoint final no es el óptimo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera del dominio de reseñas de Amazon.
- Idiomas soportados no documentados; el modelo base ModernBERT está orientado principalmente al inglés, por lo que el rendimiento en castellano es incierto.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos de dominio, demográficos o de distribución de clases.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantías del autor ni documentación de procedencia de los datos.
- Popularidad muy baja (104 descargas, 0 likes, creado en octubre de 2026), sin validación por parte de la comunidad.
- No apto para tareas generativas, de razonamiento, tool calling ni agentes; su uso está restringido a clasificación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrostyZ07/modernbert-base-sentiment-amazon
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT (referencia del modelo base): no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
