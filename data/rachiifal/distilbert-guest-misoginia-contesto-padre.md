# Rachiifal/distilbert-guest-misoginia-contesto-padre

## Resumen

distilbert-guest-misoginia-contesto-padre es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario Rachiifal en Hugging Face. El nombre sugiere que el objetivo es la detección de misoginia considerando el contexto de la figura paterna, aunque la model card no documenta la tarea de forma explícita: la descripción, los usos previstos y el conjunto de datos figuran como "More information needed". El modelo se entrenó sobre un dataset que el propio autor identifica como "None", lo que impide conocer su composición, procedencia o etiquetado.

Se trata de un clasificador encoder-only de 66.955.010 parámetros (aproximadamente 67 millones), derivado de la arquitectura DistilBERT, con una ventana de contexto máxima de 512 tokens heredada del tokenizador de distilbert-base-uncased. El repositorio ocupa 0,8 GB y los pesos se distribuyen en formato safetensors. La licencia declarada es Apache 2.0.

Su relevancia es limitada y muy específica: puede servir como punto de partida para experimentos de clasificación binaria o multietiqueta en el ámbito del análisis de discurso, pero la ausencia de documentación sobre datos, etiquetas e intención de uso, junto con un F1 de 0,4758 en el conjunto de evaluación, desaconseja su uso en producción sin una validación independiente y exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del tokenizador de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (compatible con cuantización estándar de PyTorch/transformers: int8 dinámica, ONNX, etc., no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder-only de 6 capas y aproximadamente 67 millones de parámetros que se obtiene por destilación de conocimiento de BERT-base. La cabeza de clasificación se sustituye por una capa adaptada a la tarea, y el conjunto completo se reentrena con los hiperparámetros declarados en la model card.

El entrenamiento se realizó durante 3 épocas con learning rate 2e-05, batch size de 16 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. El conjunto de datos se registra como "None", por lo que no se dispone de información sobre número de ejemplos, composición, proporción de clases ni proceso de anotación. Tampoco se documenta si hubo aumentación de datos, balanceo de clases o validación cruzada. Las versiones de framework empleadas fueron Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No se declara ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal ni mecanismos de razonamiento multi-paso, dado que se trata de un clasificador encoder-only.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, orientado a asignar una etiqueta a una secuencia de entrada.
- Detección de contenido potencialmente misógino en función del contexto paterno, según se deduce del nombre del modelo; la model card no lo confirma ni detalla el esquema de etiquetas.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para párrafos o fragmentos de conversación cortos.
- No soporta tool calling ni function calling: es un modelo encoder-only sin generación de texto.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo base está entrenado en inglés y el tokenizador es uncased en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de comentarios en foros y redes: el modelo puede clasificar fragmentos de hasta 512 tokens para señalar contenido potencialmente misógino, siempre que se valide antes con un conjunto de test representativo del dominio objetivo.
- Investigación en análisis de discurso: útil como clasificador de referencia en estudios académicos sobre lenguaje sexista, con la advertencia de que la falta de documentación del dataset obliga a replicar la evaluación de forma independiente.
- Filtrado previo en pipelines de anotación humana: puede emplearse para priorizar muestras candidatas antes de la revisión manual, reduciendo el volumen de texto que llega a los anotadores.
- Prototipado rápido de clasificadores de toxicidad: al ser un modelo de 67 millones de parámetros, se puede ajustar y desplegar en entornos con recursos limitados para experimentar con esquemas de etiquetas propios.
- Clasificación por lotes en CPU: su tamaño reducido permite procesar grandes volúmenes de texto en infraestructura sin GPU, por ejemplo en tareas de auditoría de contenido offline.
- Componente en un sistema de alertas: integrado como señal adicional (no como decisión final) en herramientas de monitorización de comunidades, combinado con revisión humana dada la limitación de F1.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin entradas; los datos provienen de la tabla de entrenamiento de la model card):

| Epoca | Paso | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1.0 | 279 | 0.5808 | 0.8570 | 0.4103 |
| 2.0 | 558 | 0.5093 | 0.8520 | 0.4758 |
| 3.0 | 837 | 0.9880 | 0.8918 | 0.3830 |

El checkpoint final reportado en la cabecera de la model card corresponde a loss 0,5093, accuracy 0,8520 y F1 0,4758. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: alrededor de 0,14 GB para pesos; en int8, unos 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU sin problemas.
- Cabe holgadamente en GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: transformers (pipeline de text-classification), Text Embeddings Inference (el tag text-embeddings-inference y endpoints_compatible está presente), ONNX Runtime, y exportación a otros runtimes de inferencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-guest-misoginia-contesto-padre | 66.955.010 | 512 tokens | Clasificación de texto (misoginia/contexto paterno) | Apache 2.0 | Hugging Face (28 descargas) |
| distilbert-base-uncased | ~66 M | 512 tokens | Modelo base encoder (enmascarado, sin cabeza de clasificación) | Apache 2.0 | Hugging Face |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base encoder | Apache 2.0 | Hugging Face |
| roberta-base | ~125 M | 512 tokens | Modelo base encoder | MIT | Hugging Face |

No se dispone de comparaciones de rendimiento con clasificadores de toxicidad o misoginia específicos en la información proporcionada. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Documentación insuficiente: la model card indica "More information needed" en descripción, usos previstos y datos de entrenamiento; no se puede verificar qué aprende el modelo ni con qué datos.
- Dataset desconocido: el conjunto de entrenamiento figura como "None", por lo que se desconoce su composición, tamaño, idioma y esquema de etiquetas.
- Rendimiento modesto: F1 de 0,4758 en el conjunto de evaluación, con accuracy de 0,8520; el desequilibrio entre ambas métricas sugiere posible desbalance de clases o una clase positiva difícil de detectar.
- Inestabilidad entre épocas: la validation loss sube de 0,5093 a 0,9880 en la tercera época mientras la accuracy aumenta, lo que apunta a sobreajuste o a un conjunto de validación poco representativo.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con impacto directo en moderación automatizada.
- Sesgos: no documentados; al derivar de distilbert-base-uncased (inglés, corpus web), es probable que herede sesgos de género, raza y registro del corpus original, pero no hay evaluación publicada.
- Limitación de idioma: el modelo base es en inglés; el comportamiento en castellano u otros idiomas no está validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento impide descartar obligaciones adicionales derivadas de los datos originales.
- Advertencia para producción: no debería desplegarse como único mecanismo de decisión en moderación de contenido sin una evaluación independiente, revisión humana y un análisis de errores por subgrupos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rachiifal/distilbert-guest-misoginia-contesto-padre
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
