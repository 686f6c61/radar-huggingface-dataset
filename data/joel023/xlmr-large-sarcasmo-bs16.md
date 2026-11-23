# joel023/xlmr-large-sarcasmo-bs16

## Resumen

xlmr-large-sarcasmo-bs16 es un modelo de clasificación de texto en castellano especializado en la detección de sarcasmo, obtenido mediante fine-tuning de FacebookAI/xlm-roberta-large sobre un corpus denominado "Sarcasmo combinado". Lo publica el usuario joel023 en Hugging Face bajo licencia MIT, con un total de 559.892.482 parámetros y un tamaño de repositorio de 2,3 GB en formato safetensors. La tarea declarada en el pipeline es `text-classification` y el único idioma etiquetado es el español.

El modelo resuelve un problema acotado pero relevante en el procesamiento del lenguaje natural en español: la identificación automática de enunciados sarcásticos, una tarea notoriamente difícil por la dependencia del contexto pragmático y cultural. Al partir de XLM-RoBERTa large, hereda un encoder multilingüe de 24 capas con una ventana de contexto de 512 tokens, aunque el fine-tuning se ha realizado exclusivamente sobre datos en español.

Su relevancia actual es limitada por su carácter experimental: no registra descargas ni interacciones, la model card está generada automáticamente y carece de secciones sustantivas sobre datos de entrenamiento, usos previstos o limitaciones. Los resultados declarados por el autor en el conjunto de evaluación (accuracy 0,9239, F1 macro 0,9239) son prometedores, pero no están acompañados de una descripción del dataset que permita valorar su generalización. Es, por tanto, un artefacto útil como punto de partida o referencia, no como componente listo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), fine-tuning para clasificación de secuencias |
| Parámetros totales | 559.892.482 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura base XLM-RoBERTa: 512 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | español (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de FacebookAI/xlm-roberta-large, un transformer encoder de tipo RoBERTa multilingüe con 24 capas, atención bidireccional y 559,9 millones de parámetros. Sobre la cabeza de clasificación se aplica la tarea binaria o multiclase de detección de sarcasmo, aunque la model card no especifica el número exacto de etiquetas ni su denominación.

El entrenamiento se realizó con el Trainer de Transformers (versión 5.20.2), PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. Los hiperparámetros declarados son: learning rate 1e-05, batch size de entrenamiento 16 (de ahí el sufijo `bs16`), batch size de evaluación 32, semilla 42, optimizador PagedAdamW de 8 bits con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 10 % de los pasos y 10 épocas con precisión mixta nativa (AMP). El conjunto de entrenamiento alcanzó 760 pasos por época (7.600 pasos totales), lo que sugiere un corpus de aproximadamente 12.160 ejemplos con batch 16. No se documenta la composición del dataset "Sarcasmo combinado", ni si hubo aumento de datos, balanceo de clases o validación cruzada.

## Capacidades

- Clasificación de texto en español orientada a la detección de sarcasmo.
- Codificación contextual bidireccional de secuencias de hasta 512 tokens (límite de la arquitectura base).
- Representaciones de frase y token aprovechables para otras tareas de clasificación mediante fine-tuning adicional.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: es un encoder discriminativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe potencial heredada de XLM-RoBERTa, pero no validada ni declarada por el autor (solo se etiqueta español).

## Casos de uso

- Moderación de comunidades en español: integrar el modelo como clasificador auxiliar para marcar mensajes potencialmente sarcásticos o irónicos que puedan escalar en hilos de discusión, usando su encoder de 512 tokens para analizar comentarios completos.
- Análisis de opinión y sentimiento: desambiguar reseñas y tuits donde el sarcasmo invierte la polaridad aparente, combinándolo con un clasificador de sentimiento estándar para corregir falsos positivos.
- Investigación en pragmática computacional: emplearlo como baseline reproducible en estudios sobre ironía y sarcasmo en español, gracias a la licencia MIT y a los hiperparámetros documentados.
- Enriquecimiento de datasets: etiquetar automáticamente grandes volúmenes de texto en español para construir corpus anotados de sarcasmo, con revisión humana posterior dada la ausencia de métricas de generalización.
- Sistemas de atención al cliente: detectar tono sarcástico en tickets o chats para derivar a agentes humanos cuando la satisfacción percibida pueda estar enmascarada por ironía.
- Filtrado de contenido en pipelines de datos: descartar o marcar muestras sarcásticas antes de entrenar modelos generativos, evitando que el sarcasmo contamine datasets de instrucciones.
- Detección de toxicidad encubierta: como señal complementaria en clasificadores de abuso que a menudo fallan ante agresiones irónicas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación (no se especifica su composición ni tamaño):

| Métrica | Valor |
|---|---|
| Loss | 0,5544 |
| Accuracy | 0,9239 |
| Precision | 0,9244 |
| Recall | 0,9239 |
| F1 | 0,9239 |
| F1 Macro | 0,9239 |

Evolución durante el entrenamiento (época / validation loss / accuracy / F1):

| Época | Validation loss | Accuracy | F1 |
|---|---|---|---|
| 1 | 0,3983 | 0,8416 | 0,8397 |
| 2 | 0,2388 | 0,9019 | 0,9017 |
| 3 | 0,2942 | 0,9223 | 0,9223 |
| 4 | 0,4937 | 0,9065 | 0,9063 |
| 5 | 0,4617 | 0,9332 | 0,9331 |
| 6 | 0,4679 | 0,9279 | 0,9278 |
| 7 | 0,5544 | 0,9239 | 0,9239 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) ni comparaciones con otros modelos en la información disponible. El model-index no contiene resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos, más activaciones (batch pequeño, secuencias de 512 tokens): en torno a 3-4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,1-1,2 GB para pesos, más activaciones: cabe holgadamente en 2-3 GB.
- VRAM estimada en int8: aproximadamente 0,6 GB de pesos; en int4, en torno a 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve. RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o superiores permiten lotes grandes; incluso GPUs de 4 GB pueden ejecutar inferencia con batch 1.
- CPU: viable para inferencia de baja concurrencia; con ONNX Runtime o cuantización int8 se obtienen latencias aceptables para clasificación puntual.
- Opciones de despliegue: Transformers con `pipeline("text-classification")`, Text Embeddings Inference (el modelo está etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, o exportación a TorchScript.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia arquitectónica, un encoder de 559 M de parámetros procesa típicamente decenas a cientos de secuencias por segundo en una GPU moderna con batch moderado, pero no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlmr-large-sarcasmo-bs16 | 559,9 M | 512 tokens (arquitectura base) | Clasificación de sarcasmo en español | MIT | Hugging Face, 0 descargas |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingüe (MLM) | MIT | Hugging Face, ampliamente usado |
| BETO (dccuchile/bert-base-spanish-wwm-cased) | 110 M | 512 tokens | Modelo base en español (MLM) | MIT | Hugging Face, muy usado en NLP español |
| robertuito (pysentimiento/robertuito-base-uncased) | 110 M | 128 tokens | Modelo base entrenado en tuits en español | MIT | Hugging Face, orientado a análisis de sentimiento en redes |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y alternativas específicas de detección de sarcasmo en español, por lo que la comparativa se limita a parámetros, contexto y licencia. El modelo base XLM-RoBERTa large ofrece mayor capacidad que BETO o robertuito a costa de un coste computacional aproximadamente cinco veces superior.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento ("Sarcasmo combinado"), su procedencia, tamaño exacto, balance de clases ni proceso de anotación, lo que impide evaluar la validez de las métricas declaradas.
- Riesgo de sobreajuste: la validation loss mínima se alcanza en la época 2 (0,2388) y aumenta hasta 0,5544 en la época 7, mientras la accuracy sigue subiendo; el modelo final puede estar sobreajustado al conjunto de validación.
- No hay evidencia de evaluación en conjuntos externos o de test independiente; las métricas de 0,92 pueden no generalizar a dominios distintos (prensa, literatura, conversación oral).
- Sesgos potenciales desconocidos: al no documentarse la composición del corpus, no puede descartarse sesgo de dominio (probablemente redes sociales o comentarios) ni de registro lingüístico.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas confiadas: un encoder discriminativo siempre emite una etiqueta, incluso ante entradas ambiguas o fuera de dominio.
- Limitación idiomática: solo se declara español; el rendimiento en variantes dialectales (rioplatense, caribeño, andino) o en textos con code-switching no está evaluado.
- Límite de contexto de 512 tokens impuesto por la arquitectura base; textos más largos requieren truncamiento o segmentación.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero el autor no ofrece garantías ni soporte.
- Ausencia total de tracción (0 descargas, 0 likes) y de mantenimiento posterior a la publicación; no hay issues resueltos ni versiones actualizadas.
- Para producción se recomienda validar con un conjunto propio anotado antes de desplegar y considerar el modelo como señal auxiliar, no como decisor único.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joel023/xlmr-large-sarcasmo-bs16
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
