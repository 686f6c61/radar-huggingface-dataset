# NataliaVanetik/Arabic-emotions-ekman-full

## Resumen

El modelo `NataliaVanetik/Arabic-emotions-ekman-full` es un clasificador de emociones en texto árabe, desarrollado por NataliaVanetik, que se obtiene mediante un ajuste fino (fine-tuning) del modelo base `kiroloskhela/Sentiment-Bert` (identificado como A5 en el paper de referencia). Está diseñado para resolver la tarea de clasificación de emociones en árabe siguiendo el marco de las seis emociones básicas de Ekman (ira, miedo, alegría, tristeza, sorpresa y asco), con una categoría adicional de "None" para textos sin emoción expresada. El modelo se entrenó sobre el 80% del dataset ArEkmanPlus, una recopilación unificada de 31.261 textos árabes procedentes de varios recursos existentes de emociones en árabe.

Arquitectónicamente, se basa en un transformer encoder tipo BERT con 162,8 millones de parámetros, y se presenta en formato safetensors. Su relevancia actual radica en que cubre un hueco en el NLP árabe de clasificación de emociones, un ámbito donde los recursos y modelos específicos son escasos en comparación con el inglés. La licencia MIT permite un uso libre, incluido comercial, aunque el autor recomienda su uso principalmente para investigación y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) |
| Parámetros totales | 162.846.707 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (típicamente 512 tokens en BERT, no confirmado) |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `kiroloskhela/Sentiment-Bert`, un BERT ajustado para análisis de sentimiento, y se afina como un modelo de clasificación de secuencias multiclase. El entrenamiento se realizó con el framework `Trainer` de Hugging Face, sobre el 80% del dataset ArEkmanPlus, que fue construido unificando varios datasets de emociones en árabe existentes. El proceso de unificación incluyó el filtrado de instancias multi-etiqueta, la equiparación de etiquetas equivalentes, la eliminación de textos duplicados y de anotaciones conflictivas, y la retención de las seis emociones de Ekman más la categoría `None`. El 20% restante se usó para evaluación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un ajuste fino supervisado estándar.

## Capacidades

- Clasificación de emociones en texto árabe para cinco categorías: Ira (Anger), Miedo (Fear), Alegría (Joy/Happiness), Tristeza (Sadness) y Sorpresa (Surprise).
- No soporta las categorías `Disgust` y `None` del dataset original, por lo que su salida se limita a las cinco emociones mencionadas.
- Genera una única etiqueta por texto (clasificación multiclase, no multi-etiqueta).
- No incluye capacidades de generación de texto, razonamiento, código, visión, audio ni herramientas (tool calling).
- Es monolingüe: está orientado exclusivamente al árabe, sin soporte multilingüe explícito.
- No dispone de un modo de "thinking" o razonamiento intermedio; es un modelo de clasificación directa.

## Casos de uso

- **Análisis de sentimiento en redes sociales en árabe**: el modelo puede etiquetar automáticamente publicaciones y comentarios en X, Facebook o foros en árabe, clasificando las emociones de los usuarios, lo que resulta útil para el estudio de opinión pública y tendencias sociales.
- **Monitoreo de atención al cliente**: en empresas que atienden a usuarios de habla árabe, el modelo puede analizar tickets y mensajes de soporte para detectar frustración (ira) o insatisfacción (tristeza), permitiendo priorizar respuestas de los agentes.
- **Análisis de comentarios en medios de comunicación**: los periódicos y plataformas de noticias pueden clasificar las reacciones emocionales de los lectores a sus artículos, ayudando a medir el impacto de la información.
- **Investigación en lingüística computacional**: sirve como herramienta de anotación automática para construir o ampliar corpus de emociones en árabe, facilitando el estudio de la expresión emocional en diferentes dialectos y registros.
- **Análisis de reseñas de productos**: las plataformas de e-commerce en árabe pueden procesar reseñas de usuarios para extraer emociones asociadas a la experiencia de compra (alegría, sorpresa, etc.), mejorando la comprensión del feedback.
- **Evaluación de campañas de marketing**: los equipos de marketing pueden medir la reacción emocional del público ante campañas publicitarias o lanzamientos de productos mediante el análisis de menciones en árabe.
- **Sistemas de recomendación emocional**: en aplicaciones de entretenimiento o salud mental, el modelo puede clasificar textos de usuarios para adaptar recomendaciones de contenido (música, artículos, etc.) según la emoción predominante.

## Benchmarks y rendimiento

En el conjunto de evaluación (20% de ArEkmanPlus-balanced), el modelo alcanza los siguientes resultados:

| Métrica | Puntuación |
|---|---|
| Accuracy | 0.8893 |
| Macro F1 | 0.8892 |

El autor indica que el rendimiento es particularmente alto para las categorías `Anger` y `Fear`. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 162,8 millones de parámetros, en FP16 el modelo ocupa aproximadamente 326 MB de VRAM, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM para inferencia básica (por ejemplo, una RTX 2060 o incluso una GPU integrada de baja gama). Para fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia. Para entrenamiento o ajuste fino, se recomienda una RTX 3060 (12 GB), RTX 4090 o A100/H100 en entornos de producción.
- **Compatibilidad con GPU de consumo**: sí, es perfectamente viable en GPUs de consumo como la RTX 3060, RTX 3070, RTX 4060, etc.
- **Opciones de despliegue**: se puede usar con la biblioteca `transformers` de Hugging Face directamente, o exportar a ONNX para inferencia en producción. No se mencionan soportes para vLLM, llama.cpp u Ollama, ya que no es un modelo de generación de texto.
- **Latencia y throughput**: no se proporcionan datos específicos; sin embargo, un BERT de 162M parámetros típicamente procesa cientos de textos por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada. En la categoría de clasificación de emociones en árabe, existen otros modelos como `AnasAlokla/multilingual_go_emotions` (modelo base A5) o variantes de BERT multilingüe ajustadas para emociones, pero no se han encontrado comparaciones cuantitativas en esta ficha. La comparativa queda pendiente de datos disponibles.

## Limitaciones y advertencias

- **Cobertura de etiquetas incompleta**: el modelo no soporta las categorías `Disgust` y `None`, lo que limita su uso en textos que expresen asco o que no contengan emoción alguna.
- **Rendimiento variable**: el rendimiento puede variar según el dominio, el género textual, el dialecto y la fuente del texto árabe. El dataset ArEkman combina fuentes heterogéneas con diferencias lingüísticas y de anotación.
- **Evaluación limitada**: los resultados se basan en un único split 80/20 de entrenamiento y prueba, por lo que no deben interpretarse como una estimación universal del rendimiento en textos árabes no vistos.
- **Riesgo de alucinación y sesgos**: como cualquier modelo de clasificación, puede producir etiquetas erróneas en textos ambiguos o con dialectos poco representados en el entrenamiento. No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de un conjunto heterogéneo, puede heredar sesgos de los datos originales.
- **Licencia**: MIT permite uso comercial, pero el autor recomienda el uso para investigación. No hay restricciones de uso comercial explícitas.
- **Sin soporte multi-etiqueta**: el modelo fue entrenado como clasificador multiclase, por lo que no puede asignar múltiples emociones a un mismo texto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/NataliaVanetik/Arabic-emotions-ekman-full)
- [Dataset ArEkman en Zenodo](https://zenodo.org/records/20424658)
- [Perfil de NataliaVanetik en GitHub](https://github.com/NataliaVanetik)
- [Paper de referencia: Benchmarking Arabic Emotion Detection: Transformers Evaluation Using a Unified Dataset (TBD)](https://huggingface.co/papers?q=multi-label%20emotion%20dataset)
