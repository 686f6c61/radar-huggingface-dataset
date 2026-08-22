# blueprint-ai/NanoTitan-NLI

## Resumen

NanoTitan-NLI es un modelo de inferencia de lenguaje natural (NLI) y clasificación de texto zero-shot ultracompacto, desarrollado por blueprint-ai. Está basado en el encoder MiniLM-L12-H384-uncased de Microsoft y ha sido ajustado sobre el corpus completo de MultiNLI (392.000 pares) en precisión FP32. Con solo 33,3 millones de parámetros, aproximadamente 133 MB en disco, el modelo consigue una exactitud del 85,35 % en MultiNLI Matched, superando a modelos de mayor tamaño como BERT-Base (110M) o DistilBERT (66M), lo que lo convierte en una opción interesante para despliegues en entornos con restricciones de latencia o recursos.

El modelo opera de dos formas: como clasificador de NLI de tres clases (entailment, neutral, contradiction) y como clasificador zero-shot dinámico mediante reformulación premisa-hipótesis. Su licencia MIT permite uso comercial y privado sin restricciones, lo que facilita su integración en sistemas de producción. Su diseño compacto está orientado a microservicios de alta concurrencia, inferencia en CPU con latencias inferiores a 10 ms y despliegue en el edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L12-H384-uncased), 12 capas, 384 dimensiones ocultas |
| Parametros totales | 33.361.155 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limitación del modelo base) |
| Tipos de cuantizacion | No especificados; pesos publicados en FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NanoTitan-NLI es un modelo transformer encoder de tipo BERT con 12 capas y 384 dimensiones ocultas, derivado de MiniLM-L12-H384-uncased. El ajuste se realizó sobre el corpus completo de MultiNLI (392.000 pares) en precisión FP32 estricta, lo que según el autor evita degradación por cuantización y preserva los pesos exactos de atención. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es de ajuste fino supervisado estándar para clasificación de secuencias. La arquitectura es densa y no presenta innovaciones como atención lineal o decodificación especulativa, pero su tamaño reducido es su principal ventaja técnica para despliegues ligeros.

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) de tres clases: entailment, neutral y contradiction.
- Clasificación de texto zero-shot mediante reformulación premisa-hipótesis, sin necesidad de entrenamiento adicional por tarea.
- Extracción de características (embeddings de secuencia) para tareas de representación.
- Clasificación de texto genérica (topicos, sentimiento, emociones) con ajuste fino posterior.
- Multilingüe: no, soporta solo inglés.
- No incluye soporte de tool calling, agentes ni razonamiento multi-step; es un modelo de clasificación puro.

## Casos de uso

- Enrutamiento de intenciones en asistentes virtuales: el modelo puede clasificar consultas de usuarios en categorías predefinidas (facturación, soporte, ventas) con baja latencia, ideal para sistemas que atienden miles de peticiones por segundo en CPU.
- Filtrado y moderación de contenido: uso de NLI para detectar contradicciones o contenido no deseado en comentarios o publicaciones, procesando texto en lotes sin necesidad de GPU.
- Clasificación de tickets de soporte: asignación automática de tickets a departamentos mediante zero-shot, sin entrenar un clasificador específico por cada dominio.
- Sistemas de respuesta a preguntas (QA) en entornos de bajo consumo: como componente de razonamiento para validar si una respuesta es coherente con una pregunta, en dispositivos embebidos o microservicios con recursos limitados.
- Análisis de sentimiento en tiempo real de reseñas o redes sociales: con un accuracy del 81,54 % en SST-2, puede integrarse en pipelines de monitorización de marca con consumo mínimo de recursos.
- Extracción de características para sistemas de búsqueda semántica: los embeddings de la capa de pooling pueden usarse para indexar documentos en bases vectoriales, aprovechando su tamaño reducido para desplegar en nodos de bajo presupuesto.

## Benchmarks y rendimiento

Según los datos declarados por el autor en la model card, los resultados oficiales son:

| Dataset | Tarea | Exactitud |
|---|---|---|
| MultiNLI Matched | NLI (3 clases) | 85,35 % |
| MultiNLI Mismatched | NLI (3 clases) | 84,91 % |

Además, el autor proporciona una comparativa adicional no verificada en otros conjuntos:

| Dataset | Dominio | Clases | Exactitud |
|---|---|---|---|
| SST-2 | Sentimiento de reseñas de películas | 2 | 81,54 % |
| Rotten Tomatoes | Sentimiento de críticas | 2 | 77,40 % |
| TweetEval Emotion | Detección de emociones | 4 | 66,40 % |
| AG News | Categorización de noticias | 4 | 66,30 % |
| TweetEval Irony | Ironía y sarcasmo | 2 | 57,91 % |

Comparación con modelos similares según el autor (datos declarados, no verificados de forma independiente):

| Modelo | Parámetros | MNLI (m/mm) | AG News | SST-2 | Rotten Tomatoes | Zero-Shot Avg |
|---|---|---|---|---|---|---|
| **NanoTitan-NLI (este modelo)** | 33,3M | 85,35 % / 84,91 % | 66,30 % | 81,54 % | 77,40 % | 63,99 % |
| `bert-base-uncased-mnli` | 110,0M | 84,50 % / 84,00 % | 65,20 % | 78,50 % | 75,10 % | ~62,90 % |
| `distilbert-base-uncased-mnli` | 66,0M | 82,50 % / 82,20 % | 64,10 % | 79,00 % | 74,50 % | ~63,10 % |
| `prajjwal1/bert-small-mnli` | 28,8M | 81,80 % / 81,40 % | 63,50 % | 77,20 % | 73,80 % | ~62,30 % |
| `MoritzLaurer/deberta-v3-xsmall-zeroshot` | 70,8M | 88,10 % / 87,70 % | 71,40 % | 85,20 % | 82,30 % | ~70,50 % |

No se han publicado resultados de benchmarks en la información disponible más allá de los presentados.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 para inferencia; en CPU la memoria RAM necesaria es de aproximadamente 133 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., GTX 1050 Ti, RTX 3050); también funciona en CPU sin GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna, y también en dispositivos edge con pocos recursos.
- Opciones de despliegue: compatible con transformers, HuggingFace Inference Endpoints, Text Embeddings Inference (TEI), y puede exportarse a ONNX para optimización en CPU.
- Latencia: el autor declara latencias inferiores a 10 ms en CPU para inferencia de un solo ejemplo, lo que lo hace adecuado para servicios de alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MNLI (Matched) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **NanoTitan-NLI** | 33,3M | 512 | 85,35 % | MIT | HuggingFace |
| `bert-base-uncased-mnli` | 110M | 512 | 84,50 % | Apache 2.0 | HuggingFace |
| `distilbert-base-uncased-mnli` | 66M | 512 | 82,50 % | Apache 2.0 | HuggingFace |
| `prajjwal1/bert-small-mnli` | 28,8M | 512 | 81,80 % | Apache 2.0 | HuggingFace |
| `MoritzLaurer/deberta-v3-base-zeroshot` | 180M | 512 | 90,40 % | MIT | HuggingFace |

NanoTitan-NLI ofrece un mejor rendimiento que BERT-Base y DistilBERT con menos parámetros, pero es superado por modelos DeBERTa más grandes. Su principal ventaja es el equilibrio entre tamaño y precisión para entornos con restricciones de memoria.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado solo en inglés y en un corpus de NLI, puede presentar sesgos culturales o lingüísticos del dataset MultiNLI, que proviene de fuentes como Wikipedia y textos narrativos.
- Riesgo de alucinación: como modelo de clasificación, no genera texto libre, pero puede asignar etiquetas incorrectas en casos ambiguos o fuera de dominio.
- Limitaciones de contexto: la longitud máxima de entrada es de 512 tokens, lo que limita el análisis de documentos largos sin truncamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricción, pero el autor no garantiza exactitud en dominios especializados (clínico, legal, etc.) sin ajuste adicional.
- Advertencia para producción: los benchmarks declarados no están verificados de forma independiente; se recomienda validar el modelo en el dominio de uso específico antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blueprint-ai/NanoTitan-NLI
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Datasets de entrenamiento: MultiNLI (https://huggingface.co/datasets/nyu-mll/multi_nli), AG News (https://huggingface.co/datasets/fancyzhx/ag_news), SST-2 (https://huggingface.co/datasets/SetFit/sst2), TweetEval (https://huggingface.co/datasets/cardiffnlp/tweet_eval), Subj (https://huggingface.co/datasets/SetFit/subj), Rotten Tomatoes (https://huggingface.co/datasets/cornell-movie-review-data/rotten_tomatoes)
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
