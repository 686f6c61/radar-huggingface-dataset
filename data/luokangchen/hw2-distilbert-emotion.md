# luokangchen/hw2-distilbert-emotion

## Resumen

hw2-distilbert-emotion es un modelo de clasificación de texto derivado de DistilBERT base uncased, ajustado por luokangchen para la tarea de clasificación de emociones en seis clases sobre textos cortos en inglés. El modelo parte de los pesos de `distilbert/distilbert-base-uncased` y se entrena sobre el split Emotion del dataset `dair-ai/emotion`, también conocido como CARER, un corpus de tuits etiquetados con las emociones sadness, joy, love, anger, fear y surprise.

Se trata de un ajuste fino parcial: durante el entrenamiento se congelaron la capa de embeddings y los cinco primeros bloques del transformer, actualizándose únicamente las capas superiores. El modelo tiene 66.958.086 parámetros y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU y en GPU de consumo.

Su relevancia es acotada: es un modelo de coursework, con cero descargas y cero likes en Hugging Face, pensado para experimentos docentes con textos ingleses cortos. No está diseñado como componente de producción general, pero resulta útil como referencia de bajo coste para pipelines de análisis de sentimiento fino o emoción en redes sociales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parámetros totales | 66.958.086 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de secuencia en entrenamiento); límite arquitectónico de DistilBERT: 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT, obtenido por destilación de BERT base: 6 capas, dimensión oculta de 768 y 12 cabezas de atención, con around 66,9 millones de parámetros. Sobre el encoder se añade una cabeza de clasificación lineal para seis etiquetas. El orden de etiquetas es sadness, joy, love, anger, fear y surprise.

El entrenamiento se realizó sobre 16.000 ejemplos de entrenamiento del split Emotion de `dair-ai/emotion`, durante 1 época, con batch size 32, longitud de secuencia máxima de 64, optimizador AdamW, learning rate 2e-4 y semilla 42. Se congelaron los embeddings y los cinco primeros bloques transformer, ajustándose solo las capas superiores. La selección del learning rate y del checkpoint se hizo sobre un conjunto de validación de 2.000 ejemplos, y la evaluación final sobre un conjunto de test independiente de 2.000 ejemplos. No se documenta uso de RLHF, DPO ni decodificación especulativa; es un ajuste fino supervisado convencional.

## Capacidades

- Clasificación de texto en seis emociones (sadness, joy, love, anger, fear, surprise) para textos cortos en inglés.
- Inferencia rápida y de bajo coste gracias al tamaño reducido (66,9 M parámetros) y a la ventana de 64 tokens.
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers.
- Compatible con Text Embeddings Inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al inglés; no se reporta rendimiento en otros idiomas.
- No expone salidas de probabilidad calibradas más allá de la softmax de la cabeza de clasificación.

## Casos de uso

- Análisis de emoción en redes sociales: clasificar tuits o comentarios cortos en inglés en las seis categorías para métricas de monitorización de marca o de comunidad, aprovechando el entrenamiento específico sobre CARER.
- Moderación de contenido asistida: como señal auxiliar para detectar anger o fear en comentarios y priorizar revisión humana, dado el bajo coste de inferencia en CPU.
- Investigación académica y docencia: servir como baseline reproducible en experimentos de clasificación de emociones con DistilBERT, con hiperparámetros y splits documentados.
- Enrutado de conversaciones en chatbots: etiquetar el estado emocional del usuario en cada turno para derivar a respuestas o flujos distintos, con la cautela de que una sola etiqueta no captura emociones mixtas.
- Etiquetado previo de datasets: preanotar corpus cortos en inglés para acelerar el etiquetado humano en proyectos de anotación de emoción.
- Análisis de encuestas abiertas: procesar respuestas breves en inglés y agregar distribuciones de emoción por segmento, siempre que las respuestas no superen los 64 tokens.
- Filtrado de reseñas: separar reseñas de producto con carga emocional negativa (anger, sadness) de las positivas (joy, love) para priorizar atención al cliente.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Accuracy (test, 2.000 ejemplos) | 87,45 % |
| Macro F1 (test) | 82,03 % |
| Weighted F1 (test) | 87,15 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB para los pesos (66,9 M parámetros × 4 bytes), más activaciones mínimas; en fp16 alrededor de 0,13 GB.
- Cabe en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, etc., así como en CPU.
- GPU recomendadas para despliegue de alto throughput: T4, A10, L4 o A100 si se sirve en lote; el modelo es lo suficientemente pequeño para que la CPU sea viable en cargas bajas.
- Opciones de despliegue: Hugging Face Transformers (`pipeline`), Text Embeddings Inference (según tags), servidores de inferencia compatibles con endpoints; no hay variantes GGUF publicadas para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hw2-distilbert-emotion | 66,9 M | 64 tokens (entrenamiento) | Clasificación de 6 emociones (en) | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base, sin cabeza de clasificación | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Modelo base, sin cabeza de clasificación | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos fine-tuned en dair-ai/emotion | ~66–110 M | variable | Clasificación de emociones (en) | variable | Múltiples en Hugging Face; rendimiento no verificado en la información disponible |

La comparación directa de rendimiento con alternativas fine-tuned no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de coursework: cero descargas y cero likes, sin evidencia de uso en producción ni mantenimiento.
- Una única etiqueta no puede expresar emociones mixtas; el propio autor lo señala.
- El sarcasmo, la negación y las señales sutiles pueden producir errores con alta confianza.
- Entrenado con 16.000 ejemplos y 1 época, con embeddings y cinco bloques congelados: capacidad limitada de adaptación al dominio.
- Longitud de secuencia de entrenamiento de 64 tokens: textos más largos se truncan y pierden contexto.
- Solo inglés; no se reporta comportamiento en otros idiomas.
- Riesgo de sesgos presentes en el corpus CARER (tuits), incluidos sesgos demográficos y de registro informal.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de sobreconfianza en la clasificación.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías ni soporte del autor.
- No hay variantes cuantizadas publicadas ni resultados de benchmarks comparativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luokangchen/hw2-distilbert-emotion
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset: https://huggingface.co/datasets/dair-ai/emotion
- Paper DistilBERT: https://arxiv.org/abs/1910.01108
- Paper CARER: https://aclanthology.org/D18-1404/
