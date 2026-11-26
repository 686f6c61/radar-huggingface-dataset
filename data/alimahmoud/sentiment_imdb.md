# Alimahmoud/sentiment_imdb

## Resumen

`sentiment_imdb` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un conjunto de datos de sentimiento no especificado en la model card, aunque el nombre sugiere que se trata del corpus IMDb de reseñas de cine. Lo publica el usuario Alimahmoud en Hugging Face y su propósito es la clasificación binaria o multiclase de polaridad (positivo/negativo) en textos en inglés.

Se trata de un modelo encoder-only de la familia DistilBERT, con 66.955.010 parámetros totales y un peso en disco de aproximadamente 0,5 GB en formato safetensors. Al estar basado en DistilBERT, hereda su tokenizador WordPiece sin distinción de mayúsculas y su arquitectura transformer de 6 capas, lo que lo convierte en una opción ligera para tareas de inferencia en CPU o GPU de gama baja.

La relevancia de este modelo es limitada: se trata de un artefacto generado automáticamente por el `Trainer` de Transformers, sin model card completada, sin datos de entrenamiento documentados y sin resultados de benchmarks publicados. Su interés práctico reside en servir como ejemplo de fine-tuning de DistilBERT para análisis de sentimiento y como base para experimentación, no como modelo de producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantización dinámica de PyTorch y con GGUF vía conversión externa |
| Idiomas soportados | inglés (heredado de `distilbert-base-uncased`); no declarado explícitamente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros destilado de BERT-base. DistilBERT reduce el tamaño de BERT-base en un 40 % y conserva aproximadamente el 97 % de su rendimiento en tareas de comprensión del lenguaje, según la literatura original de Sanh et al. (2019). La cabeza de clasificación se añade sobre la representación del token `[CLS]` para producir logits de sentimiento.

El entrenamiento se realizó con el `Trainer` de Transformers durante 2 épocas, con un `learning_rate` de 2e-05, `train_batch_size` de 16, `eval_batch_size` de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y un scheduler lineal. El conjunto de datos no se documenta ("on an unknown dataset" según la model card). Los resultados de validación fueron: pérdida 0,2128 y accuracy 0,9176 en la época 1, y pérdida 0,2325 y accuracy 0,9314 en la época 2. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo encoder de clasificación.

No se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). El modelo emplea la atención estándar multi-cabeza de DistilBERT con 12 cabezas y dimensión oculta de 768.

## Capacidades

- Clasificación de texto: produce etiquetas de sentimiento (polaridad) sobre textos en inglés, con una accuracy declarada de 0,9314 en el conjunto de evaluación del autor.
- Análisis de polaridad en reseñas: el nombre del modelo sugiere entrenamiento sobre IMDb, por lo que es adecuado para reseñas de cine, productos o servicios en inglés.
- Inferencia ligera: 66,9 M de parámetros permiten ejecución en CPU con latencias bajas.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face, según los tags del repositorio.
- No soporta tool calling ni function calling: es un modelo encoder de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo base es únicamente en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de cine: el modelo clasifica reseñas de IMDb en positivas o negativas; su fine-tuning sobre un corpus de este dominio (presumiblemente) lo hace adecuado para moderación y agregación de opiniones en plataformas de contenido audiovisual.
- Monitorización de opiniones en redes sociales: clasificación por lotes de tuits o comentarios en inglés para detectar campañas de desinformación o picos de insatisfacción, aprovechando su bajo coste computacional.
- Enrutamiento de tickets de soporte: clasificación de la polaridad de mensajes de clientes para priorizar casos negativos hacia agentes humanos, con inferencia en CPU dentro del propio backend.
- Filtrado de reseñas en comercio electrónico: detección automática de reseñas negativas para su revisión manual o para alimentar paneles de calidad de producto.
- Análisis de encuestas abiertas: procesamiento por lotes de respuestas de texto libre en inglés para obtener métricas de satisfacción (NPS, CSAT) a partir de la polaridad.
- Baseline para experimentación: servir como punto de partida reproducible para comparar fine-tunings posteriores de DistilBERT o BERT en tareas de sentimiento, dado su bajo coste de entrenamiento (2 épocas, batch 16).
- Clasificación en pipelines de Hugging Face: integración directa mediante `pipeline("text-classification")` o el endpoint de inferencia de Hugging Face para prototipos rápidos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación durante el entrenamiento (no son benchmarks estándar como MMLU o GLUE, sino métricas internas de validación):

| Metrica | Epoca 1 | Epoca 2 |
|---|---|---|
| Training loss | 0,2229 | 0,1479 |
| Validation loss | 0,2128 | 0,2325 |
| Accuracy | 0,9176 | 0,9314 |

No se han publicado resultados de benchmarks estándar (GLUE, SST-2, IMDb test oficial) en la información disponible. El `model-index` del repositorio está vacío (`results: []`), por lo que no hay comparación oficial con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (0,27 GB de pesos) y aproximadamente 0,15 GB en FP16; en la práctica, el modelo cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencias de milisegundos por muestra. Para lotes grandes, una T4, L4 o RTX 3060 son más que suficientes.
- Cabe en cualquier GPU consumer: GTX 1650, RTX 2060, RTX 3060, RTX 4090, etc., e incluso en Raspberry Pi para inferencia en CPU.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference`, endpoints de Hugging Face, ONNX Runtime, y conversión a GGUF para llama.cpp si se desea (no oficial).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput de cientos a miles de muestras por segundo en GPU y decenas en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alimahmoud/sentiment_imdb | 66,9 M | 512 (heredado) | 0,9314 (validación propia) | apache-2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | no disponible en esta ficha | apache-2.0 | Hugging Face |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | no disponible en esta ficha | MIT | Hugging Face |
| ProsusAI/finbert | ~110 M | 512 | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparación se limita a la categoría (clasificación de sentimiento en inglés con encoders ligeros). No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer una comparación cuantitativa rigurosa; los modelos alternativos citados son referencias habituales del ecosistema, pero sus métricas no se han verificado en esta ficha.

## Limitaciones y advertencias

- Model card incompleta: el autor no documenta el conjunto de datos de entrenamiento, el dominio exacto, el número de clases ni el esquema de etiquetas. Esto impide conocer con certeza si es clasificación binaria o multiclase.
- Riesgo de sobreajuste al dominio IMDb: si el entrenamiento se realizó solo sobre reseñas de cine, el rendimiento puede degradarse en otros dominios (redes sociales, atención al cliente, textos técnicos).
- Sesgos heredados de DistilBERT: el modelo base se entrenó con corpus web en inglés y puede reproducir sesgos de género, raza o ideología presentes en esos datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en textos ambiguos, irónicos o con negaciones complejas.
- Limitación de idioma: el tokenizador y el modelo base son únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Limitación de contexto: 512 tokens; textos más largos deben truncarse, lo que puede perder información relevante en reseñas extensas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; se recomienda validar el modelo en el dominio objetivo antes de producción.
- Sin benchmarks estándar: la accuracy de 0,9314 corresponde a un conjunto de validación propio no documentado, por lo que no es comparable con resultados publicados en IMDb o SST-2.
- Fecha de creación futura (2026): el repositorio muestra fechas de creación y actualización en 2026, lo que puede indicar metadatos inconsistentes o un artefacto de prueba; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alimahmoud/sentiment_imdb
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
