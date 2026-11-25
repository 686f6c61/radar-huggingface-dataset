# Casaviejas/beto-sarcasmo-bs32

## Resumen
beto-sarcasmo-bs32 es un modelo de clasificación de texto en español obtenido mediante fine-tuning de dccuchile/bert-base-spanish-wwm-cased, el conocido como BETO, publicado por el usuario Casaviejas en Hugging Face. Su propósito declarado, a partir del nombre del repositorio, es la detección de sarcasmo en textos en castellano, una tarea de clasificación binaria o multiclase sobre secuencias cortas.

Arquitectónicamente es un transformer encoder de tipo BERT con 109.852.418 parámetros totales, es decir, la configuración base estándar de BETO (12 capas, 768 dimensiones ocultas, 12 cabezas de atención). El modelo se ha entrenado con la librería Transformers 5.20.2 y PyTorch 2.11.0, y los pesos se distribuyen en formato safetensors con un tamaño de repositorio de 0,4 GB.

La relevancia de este modelo es acotada: se trata de un fine-tuning de un único autor, sin dataset documentado ni model card completada, con cero descargas y cero likes en el momento de la consulta. Resulta útil como referencia de un clasificador de sarcasmo basado en BETO, pero no debe considerarse un modelo listo para producción sin una evaluación independiente y sin conocer la composición de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BETO base) |
| Parametros totales | 109.852.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura BETO base admite hasta 512 tokens de entrada |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; convertible a fp16/int8 mediante herramientas externas) |
| Idiomas soportados | no disponible oficialmente; el modelo base es de español |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de dccuchile/bert-base-spanish-wwm-cased, un BERT base entrenado con whole word masking sobre un corpus extenso de español. Sobre esa base se ha aplicado un fine-tuning de clasificación con una cabeza de clasificación de secuencias, dando lugar a los 109,85 millones de parámetros reportados en el archivo safetensors.

Los hiperparámetros documentados en la model card son: learning rate 2e-05, batch de entrenamiento 32, batch de evaluación 64, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 478 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no se especifica ("unknown dataset" en la model card), por lo que no es posible conocer su tamaño, composición, proporción de clases ni procedencia. No se documenta RLHF, DPO ni ninguna innovación técnica adicional más allá del fine-tuning supervisado estándar.

## Capacidades
- Clasificación de texto en español: el pipeline declarado es text-classification, orientado a la detección de sarcasmo según el nombre del repositorio.
- Salida de etiquetas con probabilidades por clase, apta para umbrales ajustables en post-procesado.
- Procesamiento de secuencias cortas y medias, limitado por la ventana de 512 tokens propia de la arquitectura BETO.
- Compatible con Text Embeddings Inference y endpoints compatibles, según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el modelo base está especializado en español.

## Casos de uso
- Moderación de comentarios en foros y redes sociales: el clasificador puede marcar mensajes con alta probabilidad de sarcasmo para revisión humana, usando un umbral de confianza ajustable sobre la salida softmax.
- Análisis de sentimiento con matiz irónico: en pipelines de opinión de producto, el modelo permite separar reseñas literales de reseñas sarcásticas que invertirían la polaridad aparente.
- Monitorización de reputación de marca: integrado en un sistema de ingesta de menciones, ayuda a detectar publicaciones irónicas que un analizador de sentimiento convencional clasificaría erróneamente como positivas.
- Investigación en lingüística computacional: sirve como baseline reproducible de clasificación de sarcasmo sobre BETO para comparar con otros fine-tunings o con modelos generativos.
- Enrutado en atención al cliente: como clasificador previo de baja latencia, puede derivar conversaciones con sarcasmo detectado a agentes humanos con contexto adicional.
- Filtrado de datasets: útil para etiquetar automáticamente grandes volúmenes de texto en español y construir corpus anotados de ironía, siempre con validación humana posterior.

## Benchmarks y rendimiento
Los resultados declarados por el autor en la model card, sobre un conjunto de evaluación no especificado, son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0,6318 |
| Accuracy | 0,9207 |
| Precision | 0,9207 |
| Recall | 0,9207 |
| F1 | 0,9207 |
| F1 Macro | 0,9168 |

Evolución durante el entrenamiento (extracto):

| Epoca | Validation loss | Accuracy | F1 | F1 Macro |
|---|---|---|---|---|
| 1 | 0,2737 | 0,8976 | 0,8979 | 0,8933 |
| 3 | 0,3116 | 0,9191 | 0,9189 | 0,9148 |
| 6 | 0,5528 | 0,9259 | 0,9257 | 0,9219 |
| 8 | 0,6318 | 0,9207 | 0,9207 | 0,9168 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El model-index del repositorio está vacío. La pérdida de validación aumenta a partir de la época 3 mientras la accuracy se mantiene plana, lo que sugiere sobreajuste en las épocas finales.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos, más activaciones; cabe holgadamente en cualquier GPU con 4 GB o más.
- En fp16: alrededor de 0,22 GB de pesos; en int8: alrededor de 0,11 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes en servidor, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en CPU para inferencia de baja concurrencia, con latencias de decenas de milisegundos por secuencia corta.
- Opciones de despliegue: Transformers con pipeline de text-classification, Text Embeddings Inference (soportado según los tags), ONNX Runtime y conversión a GGUF para llama.cpp si se desea.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Casaviejas/beto-sarcasmo-bs32 | 109,85 M | 512 tokens (arquitectura) | Clasificación de sarcasmo en español | no disponible | Hugging Face, 0 descargas |
| dccuchile/bert-base-spanish-wwm-cased | ~110 M | 512 tokens | Modelo base de español (MLM) | no disponible en esta ficha | Hugging Face, ampliamente utilizado |
| BETO con fine-tuning de análisis de sentimiento (variantes de la comunidad) | ~110 M | 512 tokens | Clasificación de sentimiento en español | variable según autor | Hugging Face |
| Modelos generativos multilingües de gran tamaño (por ejemplo, familias tipo Llama o Qwen) | miles de millones | 8k-128k tokens | Clasificación zero-shot mediante prompting | variable | Hugging Face |

La comparación directa con modelos generativos no es homogénea: estos últimos pueden abordar la detección de sarcasmo mediante prompting sin entrenamiento específico, pero con mayor coste computacional y latencia. beto-sarcasmo-bs32 ofrece la ventaja de un clasificador compacto y rápido, a costa de depender de un dataset de entrenamiento no documentado.

## Limitaciones y advertencias
- Dataset de entrenamiento desconocido: la model card indica "unknown dataset", por lo que no se puede evaluar la representatividad, el equilibrio de clases ni los posibles sesgos.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; conviene contactar con el autor antes de integrarlo en producción.
- Idiomas no declarados formalmente, aunque el modelo base es de español; el rendimiento en variedades dialectales distintas a las del corpus de entrenamiento es incierto.
- Riesgo de sobreajuste: la pérdida de validación asciende de 0,22 a 0,63 entre las épocas 2 y 8 sin mejora apreciable de accuracy.
- Métricas idénticas en precision, recall y F1 (0,9207) sugieren un conjunto de evaluación posiblemente balanceado o de una sola clase dominante; no se detalla la distribución.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, especialmente en sarcasmo sutil o dependiente de contexto cultural.
- Sin descargas ni validación comunitaria: no hay evidencia externa de robustez ni de generalización.
- Ventana de 512 tokens: textos más largos requieren truncamiento o segmentación, lo que puede perder la información irónica al final del documento.
- No apto para decisiones automatizadas de alto impacto sin revisión humana.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Casaviejas/beto-sarcasmo-bs32
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
