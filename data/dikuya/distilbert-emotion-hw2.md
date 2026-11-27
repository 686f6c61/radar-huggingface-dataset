# dikuya/distilbert-emotion-hw2

## Resumen

`dikuya/distilbert-emotion-hw2` es un modelo de clasificación de texto en inglés obtenido por fine-tuning de `distilbert-base-uncased` sobre la tarea de detección de emociones. Lo publica el usuario dikuya en Hugging Face como entrega de un trabajo académico (el sufijo "hw2" sugiere "homework 2"), y clasifica cada texto de entrada en una de seis categorías: sadness, joy, love, anger, fear y surprise.

El modelo parte de la arquitectura DistilBERT, una versión destilada de BERT con 6 capas de transformer y 66.958.086 parámetros totales, lo que lo sitúa en el rango de los 67 millones de parámetros y un tamaño de repositorio de 0,3 GB. El autor indica que solo se actualizaron la última capa del encoder y la cabeza de clasificación, con un conjunto de entrenamiento muy reducido de 120 ejemplos por clase (720 en total) y selección del checkpoint según el macro-F1 sobre 480 muestras de validación.

Su relevancia es limitada y muy acotada: se trata de un ejercicio formativo con cero descargas en el momento de la consulta, sin datos de benchmarks publicados más allá de la accuracy y el macro-F1 declarados por el autor. Resulta útil como referencia de un fine-tuning ligero de clasificación de emociones, pero no como componente de producción sin una validación adicional exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT admite hasta 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | text-classification (6 clases de emoción) |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas destilado de BERT-base, con embeddings de 768 dimensiones y tokenizador WordPiece sin distinción de mayúsculas (`uncased`). Sobre esa base se añade una cabeza de clasificación lineal para las seis clases de emoción. El autor especifica que el ajuste fino actualizó únicamente la última capa del encoder y la cabeza de clasificación, dejando congelado el resto de la red.

El entrenamiento se realizó con datos de emoción proporcionados en el curso, extrayendo 120 muestras de entrenamiento por clase (720 en total) y 480 muestras de validación. La selección del checkpoint se hizo por macro-F1 medio sobre validación, quedando elegida la cuarta época. La evaluación final se realizó sobre el conjunto de test completo de 2.000 muestras. No se documentan detalles sobre función de pérdida, hiperparámetros de optimización, técnica de destilación adicional ni uso de RLHF/DPO (no aplicable en una tarea de clasificación).

## Capacidades

- Clasificación de texto en inglés en seis emociones: sadness, joy, love, anger, fear y surprise.
- Salida de etiqueta única por secuencia (clasificación multiclase, no multietiqueta).
- Procesamiento de textos cortos o medios en inglés; el límite práctico depende del tokenizador del modelo base (hasta 512 tokens), aunque el autor no lo declara.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: solo inglés declarado.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.

## Casos de uso

- Análisis de sentimiento emocional en reseñas de producto: el modelo puede etiquetar reseñas en inglés con una de las seis emociones para agregar métricas de tono emocional por producto, categoría o periodo.
- Moderación de comunidades: clasificar mensajes de foros o chats en inglés y marcar aquellos etiquetados como anger o fear para revisión humana, siempre con un umbral de confianza y validación previa.
- Monitorización de atención al cliente: procesar transcripciones o correos en inglés y detectar picos de sadness o anger que activen alertas de escalado.
- Investigación en ciencias sociales: etiquetar corpus de texto en inglés para estudios de análisis emocional, teniendo en cuenta la precisión limitada del modelo y validando manualmente una muestra.
- Enriquecimiento de datasets: preetiquetar grandes volúmenes de texto en inglés como paso previo a una anotación humana, reduciendo el coste del etiquetado inicial.
- Prototipado y docencia: servir como ejemplo reproducible de fine-tuning ligero de DistilBERT para clasificación, útil en cursos y tutoriales sobre NLP.
- Filtrado de contenido en pipelines de datos: descartar o priorizar documentos según su carga emocional estimada antes de pasarlos a modelos generativos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sobre el conjunto de test de 2.000 muestras:

| Metrica | Valor |
|---|---|
| Accuracy (test, 2.000 muestras) | 73,55 % |
| Macro-F1 (test, 2.000 muestras) | 0,6837 |
| Epoca seleccionada | 4 |
| Muestras de entrenamiento | 120 por clase (720 en total) |
| Muestras de validación | 480 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (66,9 M de parámetros), más activaciones y overhead; en la práctica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en FP16: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es más que suficiente; también funciona en CPU con latencia aceptable para lotes pequeños.
- Cabe en GPU consumer y en entornos sin GPU; es viable en CPU para clasificación por lotes.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, ONNX Runtime, o exportación a GGUF para llama.cpp si se convierte el modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y moderado en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dikuya/distilbert-emotion-hw2 | 66,9 M | no disponible (base: 512) | Clasificación de 6 emociones (en) | apache-2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Análisis de sentimiento binario (en) | apache-2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 | Clasificación de 6 emociones (en) | apache-2.0 | Hugging Face |
| j-hartmann/emotion-english-distilroberta-base | ~82 M | 512 | Clasificación de 7 emociones (en) | apache-2.0 | Hugging Face |

La comparación se basa en la categoría y el tamaño, no en resultados medidos sobre el mismo conjunto de test; no se dispone de cifras comparativas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 720 muestras (120 por clase), lo que limita la generalización y aumenta el riesgo de sobreajuste a estilos y dominios concretos.
- Accuracy del 73,55 % y macro-F1 de 0,6837 en test: rendimiento moderado, insuficiente para decisiones automatizadas sin revisión humana.
- Solo inglés declarado; no se garantiza comportamiento en otros idiomas.
- Clasificación de etiqueta única: no detecta emociones mixtas ni intensidad.
- Riesgo de sesgos derivados del corpus de entrenamiento (posible desbalance real entre emociones, sesgos culturales o de dominio del curso).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza aparente.
- Sin datos de benchmarks independientes ni de calibración de probabilidades.
- Cero descargas y un solo like en el momento de la consulta: sin validación por parte de la comunidad.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en producción.
- No se documentan limitaciones de longitud de contexto ni el comportamiento con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dikuya/distilbert-emotion-hw2
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
