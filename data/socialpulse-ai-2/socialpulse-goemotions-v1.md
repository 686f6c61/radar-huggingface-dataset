# SocialPulse-AI-2/socialpulse-goemotions-v1

## Resumen

socialpulse-goemotions-v1 es un espejo versionado e inmutable del modelo SamLowe/roberta-base-go_emotions, publicado por SocialPulse-AI-2 para su uso interno en clasificación de emociones. No se trata de un modelo nuevo: los pesos son byte a byte idénticos al original (revision d75048347613a25d77de8cf6412eaae9fa7b26be), y la única diferencia es la model card, que documenta el tag de versionado sp5-v1.0.0 y el uso concreto que hace SocialPulse del modelo. La arquitectura es roberta-base con una cabeza de clasificación multi-etiqueta sobre 28 categorías (27 emociones más neutral) y una longitud máxima de 512 tokens.

Su relevancia no está en la innovación técnica, sino en la reproducibilidad: fijar una revisión concreta evita que el modelo cambie bajo los pies de un pipeline en producción. Además, la model card documenta de forma explícita los umbrales y el mapeo de etiquetas que usa SocialPulse (0,30 global, 0,40 para trust, agregación por máximo), advirtiendo que usar el umbral 0,5 sugerido en la model card original no reproduce sus resultados. Es, por tanto, un artefacto de ingeniería más que un modelo de investigación.

El modelo resuelve la clasificación fina de emociones en texto en inglés, una tarea útil para análisis de sentimiento a nivel de matiz, moderación de comunidades y monitorización de opinión. Con 124,7 millones de parámetros y un repo de 0,5 GB, es ligero y desplegable en CPU o GPU consumer sin dificultad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base con cabeza de clasificación multi-etiqueta (sigmoid) |
| Parametros totales | 124.667.678 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado en textos más largos) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32; admite cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (Copyright (c) 2023 SamLowe) |
| Formato de pesos | safetensors (model.safetensors, byte-identical al original) |

## Arquitectura y entrenamiento

RoBERTa-base es un transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y 125M parámetros, preentrenado por Facebook AI sobre corpus en inglés con la receta RoBERTa (MLM dinámico, sin NSP, batches grandes). Sobre esa base, SamLowe/roberta-base-go_emotions añade una cabeza lineal de clasificación con 28 salidas y activación sigmoid, lo que convierte la tarea en multi-etiqueta: cada emoción recibe una puntuación independiente en [0, 1] y las puntuaciones no suman 1.

El ajuste fino se realizó sobre GoEmotions (Demszky et al., ACL 2020), un dataset de comentarios de Reddit anotados por hablantes nativos de inglés con 27 emociones más neutral. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un encoder de clasificación). La innovación destacable de este repo concreto no es arquitectónica, sino de gobernanza: espejo inmutable con tag de revisión y model card que documenta el mapeo de etiquetas y los umbrales de decisión usados en producción.

## Capacidades

- Clasificación multi-etiqueta de emociones en inglés sobre 28 categorías: admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise y neutral.
- Puntuación independiente por etiqueta (sigmoid), lo que permite detectar emociones mixtas en un mismo texto.
- Inferencia por lotes mediante el pipeline de transformers con `top_k=None` para obtener las 28 puntuaciones.
- Compatibilidad con Text Embeddings Inference (tag text-embeddings-inference) y con endpoints compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder de clasificación, no un modelo generativo.
- No soporta visión, audio ni thinking mode.
- Capacidad multilingüe nula: solo inglés. SocialPulse traduce previamente al inglés, lo que según su model card cuesta aproximadamente 0,04 de Macro F1 en su golden set y no altera la emoción primaria.

## Casos de uso

- Análisis de sentimiento fino en comunidades online: clasificar comentarios de foros o Reddit en 27 emociones permite distinguir matices (annoyance frente a anger, disappointment frente a sadness) que un clasificador binario positivo/negativo no captura.
- Moderación asistida de contenido: puntuar emociones como anger, disgust o disapproval en mensajes de usuario para priorizar revisiones humanas en colas de moderación, con umbrales ajustables por comunidad.
- Monitorización de opinión de producto: procesar reseñas o menciones en redes en inglés y agregar las puntuaciones de joy, gratitude, annoyance y disappointment para detectar cambios de percepción tras un lanzamiento.
- Enrutamiento de tickets de soporte: usar la emoción detectada (frustración, confusión, gratitud) para asignar prioridad o cola de atención al cliente, combinándolo con reglas de negocio.
- Investigación en ciencias sociales y psicolingüística: anotar corpus de comentarios con 28 emociones para estudios de dinámica emocional en comunidades digitales, aprovechando que el modelo es ligero y se puede ejecutar sobre datasets grandes.
- Pipelines de análisis de redes sociales: integrar el modelo vía Text Embeddings Inference o endpoints compatibles para clasificar flujos de comentarios en tiempo casi real con latencia baja en GPU consumer.
- Construcción de features para modelos downstream: generar vectores de 28 dimensiones de emoción como entrada para clasificadores de churn, detección de toxicidad o sistemas de recomendación sensibles al estado de ánimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas de MMLU, HumanEval, GSM8K ni de clasificación (Macro F1, precisión, recall) sobre GoEmotions. Solo se menciona, de forma cualitativa, que la traducción al inglés cuesta aproximadamente 0,04 de Macro F1 en el golden set interno de SocialPulse (SP4), sin cifras absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16 o bf16: aproximadamente 0,25 GB de pesos, apto para GPUs integradas y CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona bien en RTX 3060, RTX 4090, T4, L4, A10, A100 o H100 para despliegues de alto throughput. En CPU, un procesador moderno con AVX2 ofrece latencia de milisegundos por lote pequeño.
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3050 y superiores, así como en Apple Silicon vía MPS.
- Opciones de despliegue: transformers (pipeline), Text Embeddings Inference (tag oficial), ONNX Runtime, TorchScript, y servidores compatibles con endpoints. No se documenta soporte GGUF ni llama.cpp en la información disponible, aunque la conversión a ONNX es viable.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamaño del modelo (125M parámetros, 512 tokens), se espera un throughput de cientos a miles de secuencias por segundo en GPU moderna con batching, pero son estimaciones, no datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| socialpulse-goemotions-v1 | 124,7M | 512 tokens | Clasificación multi-etiqueta de 28 emociones, inglés | MIT | Hugging Face, espejo público |
| SamLowe/roberta-base-go_emotions | 124,7M | 512 tokens | Idéntica (es el modelo original) | MIT | Hugging Face |
| j-hartmann/emotion-english-distilroberta-base | no disponible en la información | 512 tokens (RoBERTa-distil) | Clasificación de 7 emociones, inglés | no disponible en la información | Hugging Face |
| bhadresh-savani/bert-base-uncased-emotion | no disponible en la información | 512 tokens (BERT-base) | Clasificación de 6 emociones, inglés | no disponible en la información | Hugging Face |

La comparación con alternativas se limita a modelos de la misma familia de clasificación de emociones en inglés. Frente a clasificadores de 6 o 7 emociones, este modelo ofrece un espacio de etiquetas mucho más granular (28), a costa de una mayor complejidad en el mapeo y calibración de umbrales. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés. Cualquier uso en otro idioma requiere traducción previa, con la pérdida de rendimiento que ello implica (SocialPulse reporta ~0,04 de Macro F1 en su golden set).
- Truncado a 512 tokens: textos más largos pierden información y pueden sesgar la clasificación hacia la parte inicial del documento.
- La etiqueta anger rara vez se predice por sí sola; GoEmotions expresa la ira principalmente como annoyance y disapproval, lo que obliga a agrupar etiquetas en el mapeo downstream.
- Los umbrales de SocialPulse (0,30 global, 0,40 para trust) no están calibrados formalmente: se eligieron sobre un golden set pequeño de 38 casos evaluables, y el umbral de trust es provisional. Usar 0,5 no reproduce sus resultados.
- Sesgo de dominio: GoEmotions se construye con comentarios de Reddit anotados por hablantes de inglés, por lo que hereda sesgos demográficos y temáticos de esa plataforma y puede contener contenido ofensivo.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación, especialmente en textos irónicos, sarcásticos o con emociones mixtas.
- Licencia MIT permite uso comercial, pero la licencia del dataset GoEmotions (Apache 2.0) cubre anotaciones y compilación, no la autoría de cada comentario de Reddit.
- Al ser un espejo, no recibirá mejoras del modelo original salvo que se publique una nueva versión; el tag sp5-v1.0.0 debe fijarse en producción para garantizar reproducibilidad.
- No es un modelo generativo: no puede usarse para chat, resumen, traducción ni razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SocialPulse-AI-2/socialpulse-goemotions-v1
- Modelo original: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Paper GoEmotions (Demszky et al., ACL 2020): https://arxiv.org/abs/2005.00547
- Licencia Apache 2.0 de Google Research: https://github.com/google-research/google-research/blob/master/LICENSE
