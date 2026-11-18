# meetmak0935/novapay-sentiment

## Resumen

novapay-sentiment es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario meetmak0935 en Hugging Face. Se trata de un encoder transformer de tipo DistilBERT con 66.955.010 parámetros, entrenado para la tarea de clasificación de sentimiento (pipeline `text-classification`). Su nombre sugiere un uso orientado al análisis de sentimiento en el contexto de una plataforma de pagos ("NovaPay"), aunque la model card no documenta el dominio ni el dataset de entrenamiento.

El modelo parte de DistilBERT, una versión destilada de BERT que reduce el número de capas a la mitad (6 capas frente a 12) manteniendo aproximadamente el 97 % del rendimiento del modelo original en tareas de comprensión del lenguaje, con una huella de memoria notablemente inferior. El fine-tuning se realizó durante 2 épocas con un learning rate de 2e-5, batch size de 16 y el optimizador AdamW fused, alcanzando sobre el conjunto de evaluación una accuracy de 0,876 y un F1 de 0,8777.

La relevancia de este modelo es limitada y muy específica: es un artefacto pequeño, con cero descargas y cero likes en el momento de la consulta, sin documentación sobre datos de entrenamiento, etiquetas o dominio de aplicación. Resulta útil únicamente como referencia de un fine-tuning ligero de DistilBERT para clasificación binaria o multiclase de sentimiento, y no como componente listo para producción sin una validación previa sobre el corpus objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (DistilBERT-base soporta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion int8/fp16 via herramientas estandar) |
| Idiomas soportados | no disponibles (modelo base entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert/distilbert-base-uncased`, un encoder transformer de 6 capas con 66,9 M de parámetros y vocabulario WordPiece sin distinción de mayúsculas. DistilBERT se obtiene por destilación de conocimiento de BERT-base, conservando el 97 % de su rendimiento en GLUE con un 40 % menos de parámetros y un 60 % más de velocidad de inferencia. La cabeza de clasificación se sustituye por una capa lineal adaptada al número de etiquetas del dataset de destino, que la model card no especifica.

El entrenamiento se realizó con la librería Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, usando el `Trainer` estándar (tag `generated_from_trainer`). Hiperparámetros: learning rate 2e-5, batch size de entrenamiento y evaluación de 16, seed 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y 2 épocas. El conjunto de entrenamiento no está documentado; el step 626 al final de la segunda época sugiere un dataset de aproximadamente 5.000 ejemplos (626 × 16 / 2). No se menciona RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto por secuencia completa (pipeline `text-classification`), devolviendo etiquetas y puntuaciones de probabilidad.
- Análisis de sentimiento binario o multiclase, presumiblemente orientado a opiniones o mensajes de clientes en un contexto de pagos, aunque las etiquetas concretas no están documentadas.
- Procesamiento de entradas de hasta 512 tokens (límite arquitectónico de DistilBERT), adecuado para reseñas, tuits o mensajes cortos.
- Inferencia rápida y de bajo coste en CPU, gracias a su tamaño reducido.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto libre: es un encoder discriminativo, no un modelo generativo.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- Capacidad multilingüe no garantizada: el modelo base está entrenado principalmente en inglés y la model card no declara idiomas.

## Casos de uso

- Análisis de sentimiento de reseñas de comercio electrónico: el modelo clasifica cada reseña en positiva o negativa (o la escala definida en el dataset) en una sola pasada, con latencia de milisegundos por muestra en CPU, lo que permite procesar lotes de decenas de miles de reseñas por hora.
- Monitorización de opiniones en redes sociales: integrado en un pipeline de ingesta (por ejemplo, con la librería `datasets` y un job programado), permite etiquetar menciones de marca o de una pasarela de pago y agregar tendencias diarias de sentimiento.
- Triaje de tickets de soporte: clasificar automáticamente los mensajes entrantes de clientes según su tono (frustrado, neutro, satisfecho) para priorizar la cola de atención y enrutar los casos negativos a agentes senior.
- Análisis de encuestas NPS: procesar los comentarios abiertos de encuestas de satisfacción y correlacionar el sentimiento textual con la puntuación numérica declarada, detectando discrepancias entre ambas señales.
- Moderación de contenido en foros o chats: filtrar mensajes con tono negativo o agresivo antes de su publicación, usando el score del clasificador como señal de umbral configurable.
- Enriquecimiento de datasets para investigación: servir como etiquetador débil (weak labeler) para generar anotaciones preliminares de sentimiento sobre grandes corpus, que después se revisan o se usan para entrenar modelos mayores.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de evaluación (no se especifica su composición ni tamaño):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,3048 |
| Accuracy | 0,876 |
| F1 | 0,8777 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 313 | 0,4155 | 0,825 | 0,8453 |
| 2 | 626 | 0,3048 | 0,876 | 0,8777 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar (MMLU, GLUE, SST-2, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB de pesos (66,9 M de parámetros × 4 bytes), más activaciones; en la práctica, menos de 1 GB en total.
- En fp16 o int8, la huella de pesos baja a unos 135 MB y 67 MB respectivamente, por lo que cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 o una iGPU moderna.
- Inferencia en CPU perfectamente viable: DistilBERT procesa cientos de secuencias cortas por segundo en un núcleo moderno, con latencias del orden de 5-20 ms por muestra en batch pequeño.
- GPUs recomendadas para alto throughput: T4, L4, A10G o RTX 4090 para servir lotes grandes; para un único endpoint de baja carga, no se necesita GPU.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` indica compatibilidad con Inference Endpoints de Hugging Face), ONNX Runtime, o exportación a TorchScript. No se proporcionan pesos GGUF ni adaptaciones para llama.cpp/Ollama, al no ser un modelo generativo.
- Throughput y latencia exactos no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novapay-sentiment | 66,9 M | hasta 512 tokens (arquitectura base) | Clasificacion de sentimiento | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | hasta 512 tokens | Clasificacion de sentimiento (binaria) | Apache 2.0 | Hugging Face (oficial) |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 124,6 M | hasta 512 tokens | Clasificacion de sentimiento (3 clases) | MIT | Hugging Face |
| nlptown/bert-base-multilingual-uncased-sentiment | 177,9 M | hasta 512 tokens | Clasificacion de sentimiento (1-5 estrellas, multilingue) | MIT | Hugging Face |

Frente a estas alternativas, novapay-sentiment no aporta métricas públicas comparables ni documentación de dominio que justifique su elección sobre los modelos oficiales de la comunidad, que cuentan con millones de descargas y evaluaciones reproducibles.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset, las etiquetas, el dominio ni el proceso de anotación; no es posible saber qué significa cada clase de salida sin inspeccionar el `config.json`.
- El conjunto de evaluación no está descrito: la accuracy de 0,876 y el F1 de 0,8777 no son verificables ni extrapolables a otros dominios.
- Riesgo elevado de sobreajuste al dominio original ("NovaPay"), dado el reducido número de steps (626) y la ausencia de datos de validación cruzada.
- Al derivar de DistilBERT uncased, el modelo pierde información de mayúsculas y está orientado al inglés; su rendimiento en castellano es incierto y no declarado.
- Sesgos heredados del corpus de preentrenamiento de DistilBERT (sesgos de género, raza y dominio), no evaluados por el autor.
- Riesgo de falsos positivos y negativos en textos irónicos, sarcásticos o con negaciones complejas, habitual en modelos de sentimiento de este tamaño.
- Licencia Apache 2.0 permite uso comercial, pero al no haber documentación sobre la procedencia de los datos de fine-tuning no se puede descartar una reclamación sobre el corpus de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- No apto para generación de texto, razonamiento, agentes ni tareas generativas: es exclusivamente un clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meetmak0935/novapay-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
