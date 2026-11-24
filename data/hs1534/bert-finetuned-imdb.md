# Hs1534/bert-finetuned-imdb

## Resumen

`Hs1534/bert-finetuned-imdb` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `google-bert/bert-base-uncased`, el encoder transformer de referencia de Google presentado en 2018. Lo publica el usuario Hs1534 en Hugging Face y su nombre sugiere un ajuste sobre el conjunto de datos IMDb, si bien la model card generada automáticamente no confirma el dataset de entrenamiento ni documenta la tarea concreta. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de experimentación personal más que de un modelo listo para producción.

Técnicamente es un BERT base: 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros totales en formato safetensors (0,4 GB de repositorio). La ventana de contexto efectiva es de 512 tokens, la máxima nativa de la arquitectura. El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque la ausencia de documentación sobre datos y evaluación limita seriamente su fiabilidad.

Su relevancia práctica es escasa frente a alternativas modernas de clasificación (DeBERTa-v3, ModernBERT, encoders pequeños ajustados con datos públicos). Resulta útil únicamente como ejemplo de pipeline de fine-tuning con `Trainer` de Transformers o como punto de partida para reproducir experimentos de clasificación binaria de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite nativo de BERT) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantización dinámica INT8 vía PyTorch) |
| Idiomas soportados | no disponible (el modelo base es inglés `uncased`; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar: transformer bidireccional de 12 capas con embeddings de posición aprendidos y tokenización WordPiece en minúsculas (`bert-base-uncased`). Sobre esa base se añade una cabeza de clasificación de secuencia (pooler + capa lineal) ajustada para una tarea de clasificación de texto no especificada. No hay innovaciones arquitectónicas: no usa atención lineal, ni decodificación especulativa, ni mezcla de expertos.

El fine-tuning se realizó con el `Trainer` de Transformers 5.20.2 sobre PyTorch 2.11.0+cu130, con AdamW fused (betas 0,9/0,999, epsilon 1e-8), learning rate 2e-5, scheduler lineal, batch de 16 en entrenamiento y evaluación, semilla 42 y una sola época. La model card indica que el dataset es "unknown" y que no se aporta información sobre composición, número de tokens ni técnicas de alineación (no hay RLHF ni DPO, algo esperable en un encoder de clasificación). El único dato de evaluación declarado es una pérdida de 0,0055 en el conjunto de evaluación, sin precisión, F1 ni matriz de confusión.

## Capacidades

- Clasificación de texto a nivel de secuencia (una etiqueta por entrada), presumiblemente análisis de sentimiento binario por el nombre del repositorio, aunque no confirmado.
- Extracción de representaciones contextuales del texto (embeddings de 768 dimensiones) reutilizables para otras tareas downstream.
- Comprensión de inglés en minúsculas; no se declara soporte multilingüe.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene modo de pensamiento (thinking), visión, audio ni generación de texto libre.
- No es un modelo generativo: no produce texto, solo logits de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas: el uso más plausible dado el nombre del modelo; se aplicaría sobre reseñas de IMDb tokenizadas a 512 tokens, obteniendo una probabilidad por clase. Adecuado solo si se valida previamente con un conjunto de test propio, dado que no hay métricas publicadas.
- Filtrado de comentarios en foros o soporte: clasificación binaria de quejas frente a comentarios neutros o positivos, con umbral ajustable sobre la probabilidad de salida.
- Etiquetado de datos a escala: uso como preetiquetador para construir datasets de entrenamiento de modelos mayores, aprovechando su bajo coste de inferencia (109 M de parámetros, ejecutable en CPU).
- Extracción de embeddings para búsqueda semántica: usar la salida del pooler o la media de estados ocultos como vector de 768 dimensiones para indexar documentos en inglés y alimentar un motor de recuperación.
- Baseline en experimentos académicos: punto de comparación para evaluar mejoras de arquitecturas más recientes (DeBERTa-v3, ModernBERT) en tareas de clasificación con presupuesto de cómputo mínimo.
- Clasificación en entornos con recursos limitados: despliegue en CPU o en GPUs de gama baja para tareas de moderación o triaje de tickets, donde la latencia importa más que la precisión máxima.
- Detección de toxicidad o spam (con reservas): reentrenando la cabeza de clasificación sobre un dataset propio, ya que el encoder base es reutilizable.

## Benchmarks y rendimiento

La model card declara un `model-index` con la lista de resultados vacía. El único dato numérico publicado es la pérdida de evaluación de 0,0055, que no es comparable entre tareas ni permite inferir precisión o F1.

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0055 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| GLUE / SST-2 / IMDb accuracy | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~0,45 GB en fp32 (109 M parámetros × 4 bytes) más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencias de decenas de milisegundos por secuencia corta. En GPU, cualquier modelo desde una GTX 1650 hasta una H100 es sobredimensionado para esta carga.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el modelo está marcado como `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, TorchScript y cuantización dinámica INT8 con PyTorch.
- Latencia y throughput: no disponibles como datos publicados; por el tamaño del modelo se espera un throughput de varios cientos a miles de secuencias por segundo en GPU y de decenas en CPU, pero son estimaciones, no mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hs1534/bert-finetuned-imdb | 109,5 M | 512 | Apache 2.0 | Hugging Face, 0 descargas | Sin métricas publicadas; dataset no documentado |
| google-bert/bert-base-uncased | 110 M | 512 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base sin ajuste; referencia de calidad y mantenimiento |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 | Apache 2.0 | Hugging Face, muy usado | Ajustado para sentimiento en SST-2; ~40 % menos parámetros y métricas públicas |
| microsoft/deberta-v3-base | 184 M | 512 | MIT | Hugging Face | Mejor rendimiento en clasificación NLU; mayor coste de cómputo |

La comparación directa de rendimiento no es posible porque el modelo de Hs1534 no publica métricas. Frente a `distilbert-base-uncased-finetuned-sst-2-english`, la alternativa de DistilBERT ofrece un ajuste documentado y evaluado para sentimiento, por lo que es preferible en cualquier escenario de producción.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: se desconoce si el ajuste se hizo sobre IMDb, sobre otro corpus o sobre datos sintéticos, lo que impide evaluar la validez de las etiquetas.
- Sin métricas de evaluación publicadas (precisión, F1, AUC): no hay evidencia de que el modelo funcione mejor que el azar en una tarea concreta.
- Riesgo de sobreajuste: una sola época con pérdida de evaluación de 0,0055 sugiere un conjunto de evaluación muy pequeño o poco representativo; la pérdida baja no garantiza buena generalización.
- Sesgos heredados de `bert-base-uncased`: el corpus original (BooksCorpus y Wikipedia en inglés) contiene sesgos de género, raza y nacionalidad que se propagan a la cabeza de clasificación.
- Solo inglés y solo texto en minúsculas: el tokenizador `uncased` pierde información de mayúsculas y no cubre otros idiomas.
- Límite de 512 tokens: reseñas o documentos más largos requieren truncamiento, con pérdida de información.
- No es un modelo generativo ni conversacional: no debe usarse para chatbots, resumen ni respuesta a preguntas generativa.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluación hace desaconsejable su uso en producción sin un proceso de validación propio y sin reentrenamiento sobre datos etiquetados del dominio objetivo.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero sí de clasificaciones erróneas con alta confianza calibrada de forma desconocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hs1534/bert-finetuned-imdb
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
