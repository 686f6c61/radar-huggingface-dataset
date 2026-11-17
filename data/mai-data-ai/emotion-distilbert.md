# mai-data-ai/emotion-distilbert

## Resumen

emotion-distilbert es un modelo de clasificación de texto en inglés, resultado del ajuste fino de DistilBERT sobre el corpus GoEmotions de Google Research. Lo desarrolla Mai Reda (cuenta de Hugging Face mai-data-ai) y su propósito es reducir las 27 etiquetas finas originales de GoEmotions a las seis emociones básicas de Ekman: alegría, tristeza, ira, miedo, sorpresa y asco. El modelo devuelve una única etiqueta por fragmento de texto, con distribución de probabilidad sobre las seis clases.

Arquitectura transformer encoder de tipo DistilBERT (destilación de BERT-base, 6 capas, hidden size 768), con 66.958.086 parámetros totales y pesos en safetensors. La longitud de contexto efectiva en entrenamiento es de 64 tokens, muy inferior a los 512 tokens que soporta arquitectónicamente la familia BERT, lo que limita su uso a comentarios y frases cortas.

Es relevante como pieza ligera de análisis de sentimiento granular para pipelines de moderación, análisis de opinión o enrutamiento de conversaciones, donde un modelo de 67 millones de parámetros puede ejecutarse en CPU con latencia baja. No es un modelo generativo ni un LLM: es un clasificador discriminativo de seis clases, con licencia Apache 2.0 y disponibilidad pública en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base: 6 capas, hidden 768) |
| Parámetros totales | 66.958.086 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico de BERT); entrenado con max_length 64 |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización dinámica INT8 viable con PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, librería transformers) |
| Pipeline | text-classification |
| Clases de salida | 6 (joy, sadness, anger, fear, surprise, disgust) |
| Modelo base | distilbert/distilbert-base-uncased |
| Dataset de entrenamiento | google-research-datasets/go_emotions (config simplified) |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-uncased, un encoder transformer de 6 capas y 768 dimensiones ocultas obtenido por destilación de BERT-base. Sobre esa base se añade una cabeza de clasificación de secuencia con 6 salidas. El ajuste fino se realizó con la clase `Trainer` de Hugging Face, función de pérdida de entropía cruzada con pesos de clase balanceados para compensar el fuerte desequilibrio del corpus, learning rate 2e-5, batch size 32, 4 épocas, weight decay 0,01, 350 pasos de warmup, max_length 64 y semilla 42. Se aplicó early stopping con paciencia 2 y se seleccionó el mejor checkpoint por macro-F1 en validación.

Los datos proceden de GoEmotions (comentarios de Reddit), con las 27 etiquetas finas mapeadas a 6 emociones Ekman: anger agrupa anger, annoyance y disapproval; disgust queda solo; fear agrupa fear y nervousness; joy agrupa joy, amusement, approval, excitement, gratitude, love, optimism, relief, pride, admiration, desire y caring; sadness agrupa sadness, disappointment, embarrassment, grief y remorse; surprise agrupa surprise, realization, confusion y curiosity. Solo se conservaron comentarios cuya etiqueta mapea a exactamente una emoción Ekman; se descartaron los de emoción mixta y los marcados únicamente como neutral. El resultado son 28.104 comentarios de entrenamiento, 3.527 de validación y 3.539 de test, con distribución de entrenamiento muy desequilibrada: joy 15.809, anger 4.590, surprise 4.160, sadness 2.455, fear 566 y disgust 524.

No se documenta uso de RLHF, DPO ni decodificación especulativa; es un clasificador supervisado clásico sin componentes generativos.

## Capacidades

- Clasificación de texto en inglés en seis emociones Ekman con salida de probabilidades por clase (softmax sobre 6 logits).
- Análisis de sentimiento granular orientado a emociones, no a polaridad positiva/negativa.
- Procesamiento de fragmentos cortos (comentarios, mensajes, titulares, reseñas breves) con truncamiento a 64 tokens en el entrenamiento.
- Integración directa con la librería transformers mediante `pipeline("text-classification")` o `AutoModelForSequenceClassification`.
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Moderación de comunidades online: clasificar comentarios de foros o redes en emociones negativas (ira, asco, miedo) para priorizar revisión humana; el modelo está entrenado sobre comentarios de Reddit, por lo que el dominio conversacional informal es el más alineado.
- Enrutamiento de tickets de soporte: detectar frustración o ira en el primer mensaje de un usuario y derivar automáticamente a un agente humano o a un flujo de escalado, usando la probabilidad de la clase anger como señal.
- Análisis de opinión de producto: procesar reseñas cortas y agregar la distribución emocional por lotes para informes de satisfacción, aprovechando la clase joy con F1 0,894 como indicador fiable de sentimiento positivo.
- Investigación en ciencias sociales y psicología computacional: etiquetar corpus de texto en inglés con las seis emociones Ekman para estudios de análisis emocional, con la ventaja de ser un modelo pequeño, reproducible (semilla 42) y de licencia permisiva.
- Filtrado previo en pipelines de datos: usar el clasificador como etapa barata de etiquetado emocional antes de modelos más costosos, dado que 67 millones de parámetros permiten ejecución en CPU con throughput alto.
- Detección de crisis o malestar en foros de ayuda: la clase fear alcanza recall 0,765 pese a su escasez de datos, lo que la hace útil como señal de alerta temprana en mensajes que expresan ansiedad o nerviosismo.
- Análisis de conversaciones de atención al cliente: clasificar turnos individuales para medir la evolución emocional de una conversación multi-turno, procesando cada mensaje por separado con truncamiento a 64 tokens.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test de GoEmotions simplificado a 6 clases Ekman (3.539 comentarios):

| Métrica | Valor |
|---|---|
| Accuracy | 0,7934 |
| Macro F1 | 0,6962 |

Rendimiento por emoción en test:

| Emoción | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| joy | 0,937 | 0,854 | 0,894 | 1.937 |
| sadness | 0,615 | 0,674 | 0,643 | 298 |
| anger | 0,675 | 0,704 | 0,689 | 609 |
| fear | 0,625 | 0,765 | 0,688 | 85 |
| surprise | 0,675 | 0,771 | 0,720 | 533 |
| disgust | 0,490 | 0,610 | 0,543 | 77 |

Comparación con modelos entrenados desde cero con GloVe 100d (datos del autor):

| Modelo | Accuracy | Macro F1 |
|---|---|---|
| DistilBERT (este modelo) | 0,7934 | 0,6962 |
| BiLSTM + Attention (embeddings entrenables) | 0,7426 | 0,6526 |
| LSTM (embeddings entrenables) | 0,7251 | 0,6359 |
| GRU (embeddings entrenables) | 0,7321 | 0,6289 |
| GRU (embeddings congelados) | 0,7098 | 0,6164 |
| BiLSTM + Attention (embeddings congelados) | 0,7056 | 0,6164 |
| LSTM (embeddings congelados) | 0,6917 | 0,5867 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB para pesos (66,96 M parámetros × 4 bytes), más activaciones mínimas para secuencias de 64-512 tokens; en la práctica cabe en cualquier GPU con 1 GB o más.
- En FP16: alrededor de 135 MB de pesos; en INT8 dinámico: alrededor de 67 MB.
- GPU recomendadas: innecesarias para uso individual; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sobra. En servidores, T4 o L4 permiten lotes grandes con latencia mínima.
- Cabe en CPU: sí, con latencia de milisegundos por fragmento en hardware moderno; es el escenario de despliegue natural para este tamaño.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (soportado según tags), ONNX Runtime para cuantización y serving, y cualquier framework compatible con safetensors. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera inferencia en el orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emotion-distilbert (este) | 66,96 M | 512 (entrenado a 64) | 6 emociones Ekman, inglés | apache-2.0 | Hugging Face |
| j-hartmann/emotion-english-distilroberta-base | ~82 M (DistilRoBERTa) | 512 | 7 emociones (incluye neutral), inglés | MIT (según repositorio) | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 | 6 emociones, inglés | apache-2.0 | Hugging Face |
| SamLowe/roberta-base-go_emotions | ~125 M | 512 | 28 etiquetas GoEmotions, inglés | MIT (según repositorio) | Hugging Face |

La diferencia principal frente a los alternativos es la decisión de diseño de agrupar las 27 etiquetas de GoEmotions en 6 clases Ekman y de eliminar la clase neutral, lo que simplifica la salida pero impide representar texto sin emoción clara. Los datos de comparación directa de rendimiento entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Clases raras más débiles: disgust (524 ejemplos de entrenamiento) obtiene F1 0,543 y precision 0,490; fear también es escasa (566 ejemplos), aunque su recall 0,765 se consigue a costa de precision 0,625 por los pesos de clase.
- Dominio restringido: entrenado sobre comentarios de Reddit en inglés; el rendimiento puede caer en texto formal, documentos largos, otros registros o cualquier otro idioma.
- Sin clase neutral: el modelo siempre asigna una de las seis emociones, incluso cuando el texto no tiene carga emocional, lo que produce falsos positivos en contenido neutro.
- Mapeo de etiquetas discutible: agrupar 27 etiquetas en 6 emociones es una decisión de diseño (por ejemplo, "approval" cuenta como joy) y el modelo hereda el ruido de anotación de GoEmotions.
- Resultados de una sola ejecución: las comparaciones con modelos desde cero provienen de una única corrida por modelo, por lo que diferencias pequeñas no deben sobreinterpretarse.
- Contexto efectivo corto: el entrenamiento usó max_length 64, de modo que textos más largos se truncan y pierden información; no debe asumirse buen rendimiento con entradas de cientos de tokens pese al límite arquitectónico de 512.
- No apto para decisiones de alto impacto sobre personas (diagnóstico, selección de personal, crédito); el propio autor lo advierte.
- Licencia Apache 2.0: permite uso comercial con atribución y conservación del aviso, pero no exime de responsabilidad sobre sesgos heredados de los datos de Reddit.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de sobreconfianza: la softmax sobre 6 clases siempre reparte probabilidad, sin opción de abstención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mai-data-ai/emotion-distilbert
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Repositorio de código: https://github.com/EngMai-AI/emotion-classifier
- Perfil del autor en GitHub: https://github.com/EngMai-AI
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/mai-reda-74477423b
- Demo en vivo: no disponible (la model card deja el enlace pendiente de añadir)
