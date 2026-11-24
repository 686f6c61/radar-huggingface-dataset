# dleemiller/finecat-nli-v2-xl

## Resumen

FineCat-NLI v2 XL es un cross-encoder especializado en inferencia de lenguaje natural (NLI) desarrollado por dleemiller. A partir de una premisa (un texto) y una hipótesis (una afirmación), el modelo devuelve probabilidades calibradas de que el texto implique, contradiga o sea neutral respecto a la afirmación. Se construye sobre el encoder jhu-clsp/ettin-encoder-1b, un transformer de tipo ModernBERT con 1.031 millones de parámetros, y se distribuye bajo licencia Apache 2.0.

El modelo resuelve tareas de clasificación y verificación que van más allá del NLI clásico: enrutamiento de intenciones, comprobación de fundamentación en pipelines RAG, detección de alucinaciones, moderación de contenido y clasificación zero-shot. Su relevancia actual radica en que ofrece un rendimiento cercano al estado del arte en NLI con un coste de inferencia muy contenido (unos 576 pares por segundo según el autor) y una ventana de hasta 8.000 tokens por documento, lo que lo hace viable en producción.

La versión v2 incorpora entrenamiento con datasets propios (FineCat-NLI y FineCat-NLI-Reason) y se evalúa en un conjunto amplio de benchmarks NLI, incluyendo ANLI, WANLI y LingNLI, además de una evaluación macro sobre 45 datasets. El modelo está pensado exclusivamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/ettin-encoder-1b) como cross-encoder |
| Parametros totales | 1.031.269.123 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.000 tokens por documento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT: recibe el par (premisa, hipótesis) de forma conjunta y produce una distribución de probabilidad sobre las etiquetas de entailment, contradiction y neutral. Al ser un cross-encoder, no genera embeddings independientes por texto, sino que modela la interacción entre ambos mediante atención completa, lo que típicamente ofrece mayor precisión que los bi-encoders en tareas de reranking y verificación.

El entrenamiento parte del encoder Ettin de 1B parámetros (jhu-clsp/ettin-encoder-1b) y se afina con los datasets propios FineCat-NLI y FineCat-NLI-Reason, además de datos derivados de MNLI, SNLI y ANLI. La model card menciona el uso de destilación de conocimiento (knowledge-distillation) como técnica de entrenamiento. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset. La ventana de 8.000 tokens permite procesar documentos largos completos junto con la hipótesis en una sola pasada.

## Capacidades

- Inferencia de lenguaje natural en tres clases: entailment, contradiction y neutral, con probabilidades calibradas.
- Clasificación zero-shot: cada etiqueta candidata se formula como hipótesis y se compara con el texto.
- Reranking de pares texto-consulta para pipelines de recuperación.
- Detección de alucinaciones y verificación de fundamentación (groundedness) de respuestas generadas frente a pasajes recuperados.
- Moderación y guardrails: evaluación de mensajes contra políticas expresadas como afirmaciones.
- Enrutamiento y triaje de peticiones (intent classification).
- Extracción de información clínica y de determinantes sociales de la salud (evaluado en SDOH-NLI).
- Procesamiento de documentos de hasta 8.000 tokens.
- No soporta tool calling ni razonamiento multi-paso generativo: es un modelo de clasificación, no un generador de texto.

## Casos de uso

- Verificación de respuestas en RAG: dado un conjunto de pasajes recuperados y una respuesta generada por un LLM, el modelo puntúa la probabilidad de que cada pasaje implique la respuesta; los valores bajos señalan posibles alucinaciones. El autor reporta 0,82 de F1 en RAGTruth.
- Enrutamiento de tickets de soporte: se comparan los mensajes de usuario contra afirmaciones del tipo "El usuario quiere cambiar su facturación" para asignar la cola correcta, con un 97,7% de acierto reportado en intenciones MASSIVE.
- Moderación de contenido: se contrastan mensajes contra políticas de la comunidad expresadas como hipótesis, con un 92,5% reportado en CrossingGuard y un 94,0% en insultos de Wikipedia.
- Clasificación zero-shot de reseñas y documentos: etiquetado de sentimiento, temática o categoría sin entrenamiento adicional, formulando cada etiqueta como una afirmación.
- Extracción de información clínica: detección de determinantes sociales (por ejemplo, desempleo) en notas clínicas, con un 98,8% reportado en SDOH-NLI.
- Reranking en motores de búsqueda: reordenación de los candidatos recuperados por un retriever bi-encoder antes de pasarlos al generador, aprovechando la ventana de 8.000 tokens para pasajes largos.
- Fact-checking automatizado: comparación de afirmaciones con fuentes documentales para estimar si la evidencia las respalda, las contradice o es insuficiente.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), según el model-index de la model card:

| Dataset | Métrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,8445 |
| MultiNLI (validation matched) | Accuracy | 0,9202 |
| MultiNLI (validation mismatched) | Accuracy | 0,9191 |
| SNLI (test) | Accuracy | 0,9356 |
| ANLI round 1 (test) | Accuracy | 0,7860 |
| ANLI round 2 (test) | Accuracy | 0,6600 |
| ANLI round 3 (test) | Accuracy | 0,6067 |
| WANLI (test) | Accuracy | 0,7710 |
| LingNLI (validation) | Accuracy | 0,8834 |
| Benchmark macro de 45 datasets | Macro accuracy | 0,8282 |

La model card incluye además una comparación en el leaderboard OpenNLI (v0.2.0) con el modelo `dleemiller/finecat-nli-ultra-l` (378M de parámetros), que obtiene un Skill Index de 58,6 frente al 59,5 de este modelo, y un throughput inferior. El autor reporta 576 pares por segundo para finecat-nli-v2-xl.

## Requisitos de hardware

- VRAM estimada: en fp16, los 1.031 millones de parámetros ocupan aproximadamente 2,1 GB de pesos; con overhead de activaciones y batches, se recomienda al menos 4-6 GB de VRAM para inferencia en GPU.
- GPU recomendadas: A100 o H100 para máximo throughput; RTX 4090, RTX 3090 o L4 para producción a menor escala.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, Text Generation Inference (TGI) con soporte de clasificación, y despliegue vía ONNX Runtime o TensorRT para reducir latencia.
- Throughput estimado: unos 576 pares por segundo según el autor (hardware no especificado en la información disponible).
- CPU: viable para volúmenes moderados con cuantización dinámica, aunque no se detallan cuantizaciones soportadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Skill Index (OpenNLI) | Accuracy media | Licencia |
|---|---|---|---|---|---|
| finecat-nli-v2-xl | 1,03B | 8k tokens | 59,5 | 0,8263 | Apache 2.0 |
| finecat-nli-ultra-l | 378M | no disponible | 58,6 | 0,8213 | no disponible en la información |
| Otros cross-encoders NLI de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo hermano finecat-nli-ultra-l, que ofrece un rendimiento ligeramente inferior con un tercio de los parámetros. No se dispone de datos de benchmarks de alternativas como DeBERTa-NLI o cross-encoders de reranking en la información consultada.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- El rendimiento cae de forma notable en ANLI r2 (0,66) y r3 (0,6067), lo que indica dificultades con inferencias que requieren razonamiento multi-paso o conocimiento del mundo.
- Es un clasificador, no un generador: no produce texto, no soporta tool calling ni razonamiento generativo.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento; las probabilidades deben validarse en el dominio concreto antes de usarse como umbrales de producción.
- La ventana de 8.000 tokens implica coste cuadrático en atención; batches grandes de documentos largos pueden degradar el throughput.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento derivados (MNLI, SNLI, ANLI) si se redistribuye el modelo.
- No se dispone de información sobre sesgos demográficos ni sobre evaluaciones de robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-xl
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-1b
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Modelo hermano finecat-nli-ultra-l: https://huggingface.co/dleemiller/finecat-nli-ultra-l
