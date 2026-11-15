# jonathanjordan21/mdeberta-id-sarcasm-robust

## Resumen

`jonathanjordan21/mdeberta-id-sarcasm-robust` es un modelo de clasificación de texto en indonesio especializado en la detección de sarcasmo. Lo desarrolla el usuario jonathanjordan21 y se obtiene mediante fine-tuning del checkpoint `jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm`, que a su vez deriva de la familia DeBERTa-v3 de Microsoft. El resultado es un clasificador binario (sarcasmo / no sarcasmo) de aproximadamente 279 millones de parámetros, empaquetado en formato safetensors y compatible con la librería `transformers`.

El modelo resuelve una tarea concreta y acotada: clasificar un texto corto como sarcástico o no sarcástico. No es un modelo generativo ni un asistente conversacional; es un encoder discriminativo pensado para integrarse como componente de moderación, análisis de sentimiento o investigación lingüística sobre redes sociales en indonesio. Su relevancia radica en que el sarcasmo es una de las señales más difíciles de capturar en análisis de sentimiento, y los modelos multilingües genéricos suelen rendir peor en este fenómeno en idiomas de bajos recursos como el indonesio.

La información pública es escasa: la model card está generada automáticamente por el `Trainer` de Hugging Face y el autor no ha documentado la composición del dataset, los usos previstos ni las limitaciones. Los únicos datos objetivos disponibles son los hiperparámetros de entrenamiento y las métricas de validación declaradas, que sitúan la accuracy en 0,9281 y el Macro F1 en 0,9035 sobre el conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3 base, fine-tune) |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DeBERTa-v3 soporta hasta 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se publican variantes GGUF) |
| Idiomas soportados | indonesio (inferido del nombre y del modelo base; no declarado explicitamente) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de DeBERTa-v3 base adaptado al indonesio. DeBERTa-v3 introduce atención con disentangled attention (representaciones separadas de contenido y posición) y una variante de embedding sharing en la capa de salida que mejora la eficiencia respecto a DeBERTa-v2. La cabeza de clasificación es la estándar de `AutoModelForSequenceClassification` con dos etiquetas (sarcasmo / no sarcasmo).

El entrenamiento se realizó con los siguientes hiperparámetros documentados en la model card: learning rate 1,5e-5, batch de entrenamiento 16, batch de evaluación 32, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 5 épocas, semilla 42 y precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no está especificado (la model card indica "None dataset"). Las versiones de framework declaradas son Transformers 5.23.0, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación binaria de texto: etiqueta una entrada como sarcástica o no sarcástica.
- Detección de sarcasmo en indonesio, orientada a textos cortos propios de redes sociales.
- Salida de probabilidades por clase mediante la función softmax de la cabeza de clasificación.
- Integración directa con `pipeline("text-classification")` de Transformers.
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face según los tags del repo.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- No se declaran capacidades multilingües más allá del indonesio.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo puede marcar comentarios sarcásticos que un filtro de toxicidad basado en palabras clave pasaría por alto, permitiendo revisión humana selectiva.
- Análisis de sentimiento en redes sociales: al separar sarcasmo de sentimiento literal, mejora la calidad de los agregados de opinión sobre productos o marcas en Twitter/X, Instagram o TikTok.
- Investigación lingüística sobre pragmática del indonesio: permite etiquetar corpus a escala para estudiar la distribución de sarcasmo por región, registro o temática.
- Enrutamiento en sistemas de atención al cliente: detectar respuestas sarcásticas de usuarios para escalar a agentes humanos en lugar de respuestas automáticas.
- Filtrado de reseñas de producto: identificar reseñas irónicamente positivas o negativas que distorsionan las métricas de valoración.
- Preprocesado para pipelines de NLP downstream: usar la etiqueta de sarcasmo como feature adicional en modelos de clasificación de sentimiento o de intención.
- Detección de abuso encubierto: el sarcasmo agresivo suele acompañar formas de acoso que evaden filtros léxicos; este clasificador sirve como señal complementaria.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación (no se especifica su composición ni tamaño):

| Metrica | Valor |
|---|---|
| Loss | 0,4212 |
| Accuracy | 0,9281 |
| Macro F1 | 0,9035 |
| Sarcasm Precision | 0,8636 |
| Sarcasm Recall | 0,8462 |
| Sarcasm F1 | 0,8548 |
| Non Sarcasm F1 | 0,9522 |

Evolución por época según la model card:

| Epoca | Validation loss | Accuracy | Macro F1 |
|---|---|---|---|
| 1 | 0,2266 | 0,9271 | 0,9038 |
| 2 | 0,3107 | 0,9260 | 0,9036 |
| 3 | 0,4212 | 0,9281 | 0,9035 |

No se han publicado comparaciones con otros modelos en la información disponible. El `model-index` del repo está vacío (`results: []`), por lo que las cifras anteriores proceden únicamente de la tabla de entrenamiento de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo de pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: alrededor de 0,6 GB de pesos; ejecutable en GPUs de gama baja.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia por lotes pequeños (T4, L4, RTX 3060 en adelante). Para throughput alto, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más (GTX 1650, RTX 3050, RTX 4090, etc.).
- También ejecutable en CPU para volúmenes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, ONNX Runtime o TorchScript para optimización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mdeberta-id-sarcasm-robust (este) | 278,8 M | no disponible | Clasificación de sarcasmo en indonesio | MIT | Hugging Face |
| jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm (base) | ~278 M (estimado, misma familia) | no disponible | Clasificación de sarcasmo en indonesio | no disponible | Hugging Face |
| mDeBERTa-v3-base multilingüe (Microsoft) | ~278 M | 512 tokens | Clasificación general multilingüe | MIT | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 tokens | Clasificación general multilingüe | MIT | Hugging Face |

La comparación con el modelo base es la más relevante: este checkpoint es un fine-tune adicional del mismo, por lo que se espera una mejora en robustez (según el sufijo "robust") sin cambiar la arquitectura ni el tamaño. No hay datos públicos que permitan cuantificar esa mejora frente al checkpoint base ni frente a mDeBERTa-v3 o XLM-R sin fine-tuning específico para sarcasmo en indonesio.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, los usos previstos ni las limitaciones; la evaluación no es reproducible a partir de la información pública.
- El conjunto de evaluación no está descrito (tamaño, procedencia, balance de clases), por lo que las métricas declaradas no pueden contextualizarse ni compararse de forma fiable.
- Riesgo de sobreajuste al dominio de entrenamiento: el sarcasmo depende del registro, la cultura y la plataforma; el rendimiento en otros contextos puede degradarse.
- El modelo solo está orientado al indonesio; su uso en otros idiomas no está validado ni declarado.
- Riesgo de alucinación no aplicable (es un clasificador, no un generador), pero sí de falsos positivos y negativos: el recall de sarcasmo es 0,8462, lo que implica que aproximadamente un 15 % de los casos sarcásticos se escapan.
- Sesgos potenciales derivados del corpus de entrenamiento no documentado (posible sobrerrepresentación de ciertas plataformas, géneros o registros).
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No apto para decisiones automatizadas de alto impacto sin revisión humana, dado que la detección de sarcasmo es subjetiva y dependiente del contexto cultural.
- Sin datos sobre cuantizaciones GGUF/ONNX publicadas; el despliegue en `llama.cpp` u Ollama requeriría conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonathanjordan21/mdeberta-id-sarcasm-robust
- Modelo base: https://huggingface.co/jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm
- Repositorio de DeBERTa-v3 (Microsoft): https://github.com/microsoft/DeBERTa
- Paper de DeBERTa-v3: https://arxiv.org/abs/2111.09543
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
