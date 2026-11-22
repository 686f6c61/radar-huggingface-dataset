# Maya660/distilbert-base-uncased-finetuned-emotion

## Resumen

`Maya660/distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un conjunto de datos de emociones no especificado por el autor. DistilBERT es la variante destilada de BERT desarrollada por Hugging Face, con 6 capas y 66 millones de parámetros, diseñada para reducir el coste computacional manteniendo aproximadamente el 97 % del rendimiento de BERT-base en tareas de comprensión del lenguaje.

El modelo se publica como un artefacto generado automáticamente por el `Trainer` de Transformers (`generated_from_trainer`), sin model card completada: el autor no documenta la composición del dataset, el etiquetado ni los usos previstos. La evaluación reportada alcanza una accuracy de 0,9265 y un F1 de 0,9264 sobre el conjunto de validación, con una pérdida de 0,2112 tras 2 épocas registradas.

Su relevancia práctica es limitada pero concreta: sirve como ejemplo reproducible de fine-tuning ligero para clasificación de emociones y como componente de bajo coste en pipelines de análisis de sentimiento a nivel de frase, siempre que se valide contra el dataset real de destino, ya que el origen de las etiquetas es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización dinámica int8 vía PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es inglés `uncased`; el autor no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base (12 capas, 110 millones). DistilBERT reduce el número de capas a la mitad y conserva las dimensiones ocultas de 768 y 12 cabezas de atención, lo que da un coste de inferencia aproximadamente un 40 % menor que BERT-base.

El entrenamiento se realizó con el `Trainer` de Transformers usando AdamW con betas (0,9; 0,999) y epsilon 1e-8, learning rate de 5e-5, scheduler coseno, batch de 64 en entrenamiento y evaluación, semilla 42 y 5 épocas configuradas. Solo se registran dos puntos de evaluación (pasos 250 y 500), con pérdida de validación descendiendo de 0,3002 a 0,2112. El dataset de entrenamiento no está identificado en la model card ("unknown dataset"), por lo que se desconoce el número de ejemplos, el esquema de etiquetas y si hubo aumentación o balanceo de clases. No se documenta RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto a nivel de secuencia (pipeline `text-classification`), presumiblemente en categorías de emoción, aunque el conjunto de etiquetas no está documentado.
- Codificación contextual de frases en inglés con tokenizador `uncased` (minúsculas, sin distinción de mayúsculas).
- Extracción de embeddings de frase mediante la salida del token `[CLS]`, apta para búsqueda semántica o clustering si se valida su calidad.
- Inferencia por lotes con throughput alto gracias a su tamaño reducido (66 M de parámetros).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe no disponible: el modelo base está entrenado principalmente en inglés y el fine-tuning no declara idiomas adicionales.

## Casos de uso

- Análisis de sentimiento y emoción en reseñas: el modelo clasifica frases cortas en categorías emocionales con una accuracy reportada de 0,9265 en validación; adecuado para preetiquetar grandes volúmenes de reseñas antes de revisión humana.
- Moderación de comentarios en foros: clasificación rápida de mensajes con carga emocional negativa para priorizar la cola de revisión, aprovechando el bajo coste de inferencia de 66 M de parámetros.
- Enrutamiento de tickets de soporte: asignación automática de incidencias a colas según la emoción detectada (frustración, satisfacción, neutralidad) en un primer nivel de triaje.
- Análisis de encuestas NPS: procesamiento por lotes de respuestas abiertas cortas para agregar distribución emocional por segmento de cliente.
- Señal auxiliar en pipelines de recomendación: incorporación de la emoción detectada en reseñas como feature adicional en un modelo de ranking.
- Experimentación académica y docencia: ejemplo reproducible de fine-tuning de DistilBERT con hiperparámetros documentados, útil como baseline en cursos de NLP.
- Filtrado previo en datasets de entrenamiento: detección de muestras con carga emocional extrema para muestreo estratificado antes de anotación manual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no identificado):

| Metrica | Valor |
|---|---|
| Loss (validación) | 0,2112 |
| Accuracy | 0,9265 |
| F1 | 0,9264 |

Evolución durante el entrenamiento:

| Epoca | Paso | Loss validación | Accuracy | F1 |
|---|---|---|---|---|
| 1.0 | 250 | 0,3002 | 0,9145 | 0,9135 |
| 2.0 | 500 | 0,2112 | 0,9265 | 0,9264 |

El `model-index` del modelo no contiene entradas de resultados, por lo que no hay comparación oficial con otros modelos. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 270 MB solo para pesos (66,9 M parámetros × 4 bytes), más activaciones; en la práctica cabe holgadamente en cualquier GPU con 1 GB o más.
- VRAM en fp16: aproximadamente 135 MB de pesos.
- VRAM en int8 (cuantización dinámica de PyTorch): aproximadamente 70 MB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, T4, L4, A10G, A100 o H100 funcionan sin problema, pero el modelo está sobredimensionado para hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en CPU con latencias aceptables para clasificación por lotes.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` (etiqueta declarada por el autor), ONNX Runtime, TorchScript, y servidores de inferencia genéricos compatibles con endpoints. No se documenta soporte explícito de vLLM, llama.cpp ni Ollama (son entornos orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera un throughput de miles de frases por segundo en GPU moderna con batch grande, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maya660/distilbert-base-uncased-finetuned-emotion | 66,9 M | 512 (estándar DistilBERT) | Clasificación de emociones | apache-2.0 | Hugging Face |
| distilbert-base-uncased (Hugging Face) | 66,9 M | 512 | Modelo base, sin fine-tuning de emoción | apache-2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | 66,9 M | 512 | Clasificación de emociones (6 clases, dataset `emotion`) | apache-2.0 | Hugging Face |
| j-hartmann/emotion-english-distilroberta-base | 82,1 M | 512 | Clasificación de emociones (7 clases) | apache-2.0 | Hugging Face |

La comparación con los dos últimos es orientativa: son alternativas de la misma categoría y tamaño, pero no se dispone de métricas verificadas en esta información para contrastar rendimiento. La ventaja del modelo de Maya660 es su licencia permisiva y su tamaño; su desventaja es la falta de documentación sobre el dataset y las etiquetas, lo que dificulta la comparación justa.

## Limitaciones y advertencias

- Dataset de entrenamiento no identificado: el autor no indica qué corpus se usó ni qué etiquetas predice el modelo, lo que impide validar su comportamiento fuera del conjunto de evaluación original.
- Métricas sin contexto: accuracy y F1 de 0,9265/0,9264 se calculan sobre un conjunto de validación no descrito; no se puede asumir que se transfieran a otros dominios.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas confiadas: un clasificador puede asignar etiquetas con alta probabilidad a entradas ambiguas o fuera de distribución.
- Sesgos potenciales: al derivar de `distilbert-base-uncased`, hereda sesgos de género, raza y edad presentes en los corpus web de entrenamiento de BERT; el fine-tuning no documenta mitigación.
- Limitación de idioma: el modelo base está orientado a inglés y el tokenizador `uncased` no distingue mayúsculas; el rendimiento en castellano u otros idiomas no está garantizado.
- Límite de contexto de 512 tokens: frases o documentos más largos deben truncarse o dividirse, con pérdida de información.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Sin mantenimiento: el modelo se creó el 22 de noviembre de 2026, tiene 0 descargas y 0 likes, y la model card está sin completar; no hay evidencia de validación por la comunidad.
- Para producción: requiere una evaluación propia sobre el dataset objetivo antes de desplegarse, dado que el esquema de etiquetas no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maya660/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación del pipeline de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
