# aCe44/distilbert-customer-review

## Resumen

distilbert-customer-review es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de distilbert/distilbert-base-uncased, publicado por el usuario aCe44 en Hugging Face. Su propósito declarado, a juzgar por el nombre y la tarea del pipeline (text-classification), es clasificar reseñas de clientes, presumiblemente en categorías de sentimiento o valoración. El modelo se generó automáticamente con la librería Trainer de Transformers, por lo que la model card es un esqueleto sin descripción funcional, sin documentación del dataset y sin casos de uso detallados por parte del autor.

Arquitectónicamente es un transformer encoder de tipo DistilBERT, la variante destilada de BERT-base que reduce el número de capas de 12 a 6 y elimina el entrenamiento de tipo masked language modeling con next-sentence prediction. Cuenta con 66.955.779 parámetros totales en formato safetensors (aproximadamente 67 millones), lo que lo sitúa en la gama ligera: cabe holgadamente en GPU de consumo y permite inferencia de baja latencia en CPU. La licencia es Apache 2.0 y el repo ocupa 0,3 GB.

Su relevancia es limitada y muy específica: se trata de un artefacto de fine-tuning sin benchmarks publicados (el model-index aparece vacío), sin métricas desglosadas por clase y sin información sobre el corpus de entrenamiento. Resulta útil como punto de partida reproducible para tareas de análisis de opiniones en inglés, pero no debe considerarse un modelo validado para producción sin una evaluación propia sobre el dominio objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, variante destilada de BERT-base con 6 capas) |
| Parametros totales | 66.955.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base distilbert-base-uncased admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas en el repo) |
| Idiomas soportados | no disponibles declarados; el modelo base está entrenado principalmente en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder con 6 capas, atención multi-cabeza estándar y embeddings de 768 dimensiones, destilado a partir de BERT-base mediante destilación de conocimiento (triple loss: destilación de la distribución de salida del profesor, masked language modeling y similitud coseno de estados ocultos). La cabeza de clasificación se sustituye por una capa lineal adaptada al número de etiquetas de la tarea de reseñas, aunque el número exacto de clases no se documenta en la model card.

El entrenamiento se realizó con el Trainer de Transformers durante 3 épocas, con learning rate 2e-05, batch size de 16 en entrenamiento y evaluación, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08) y scheduler lineal. Se ejecutaron 2.520 pasos en total (840 por época). No se documenta el dataset utilizado (la model card indica "None dataset"), ni el número de tokens, ni la composición del corpus, ni si hubo técnicas de aumento de datos o balanceo de clases. Tampoco se especifica si se aplicó alguna innovación técnica adicional más allá del fine-tuning estándar.

## Capacidades

- Clasificación de texto: tarea principal del pipeline, orientada a reseñas de clientes (probablemente sentimiento o categorización de opiniones).
- Clasificación de secuencias cortas y medianas: al derivar de distilbert-base-uncased, procesa entradas de hasta 512 tokens.
- Inferencia ligera: 67 millones de parámetros permiten ejecución en CPU y en GPU de gama baja.
- Integración con el ecosistema Transformers: compatible con text-embeddings-inference y endpoints según los tags del repo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües no garantizadas: el modelo base está entrenado mayoritariamente en inglés y la model card no declara idiomas adicionales.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar reseñas individuales en categorías de opinión; su tamaño reducido permite procesar lotes grandes en CPU sin infraestructura GPU.
- Triaje de tickets de soporte: clasificar mensajes entrantes de clientes por tipo o urgencia antes de enrutarlos al equipo adecuado, con latencia de milisegundos por petición en hardware modesto.
- Monitorización de reputación en línea: procesar volúmenes altos de opiniones recopiladas de tiendas o foros para agregar tendencias de satisfacción por producto o periodo.
- Enriquecimiento de datasets de CRM: etiquetar automáticamente encuestas de satisfacción (NPS, CSAT) para alimentar dashboards analíticos sin intervención manual.
- Filtrado previo en pipelines de moderación: descartar o marcar reseñas con tono negativo extremo para revisión humana, reduciendo la carga de los moderadores.
- Prototipado rápido de clasificadores de dominio: servir como línea base ajustable mediante fine-tuning adicional sobre datos propios de un negocio concreto, gracias a su licencia Apache 2.0 y a su reducido coste de reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación (dataset no especificado):

| Metrica | Valor |
|---|---|
| Loss | 0,2663 |
| Accuracy | 0,9649 |
| Precision | 0,9577 |
| Recall | 0,9649 |
| F1 | 0,9611 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1.0 | 840 | 0,2487 | 0,9625 | 0,9599 | 0,9625 | 0,9608 |
| 2.0 | 1680 | 0,2307 | 0,9656 | 0,9593 | 0,9656 | 0,9622 |
| 3.0 | 2520 | 0,2488 | 0,9666 | 0,9612 | 0,9666 | 0,9635 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) ni comparaciones con modelos similares en la información disponible. Las métricas anteriores proceden únicamente del conjunto de evaluación del autor y no permiten establecer comparaciones fiables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M de parámetros × 4 bytes), más activaciones; en la práctica menos de 1 GB.
- En fp16: aproximadamente 0,13 GB para pesos; en int8, alrededor de 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente, aunque el modelo está sobredimensionado para ellas y no las aprovecha.
- Cabe en cualquier GPU de consumo e incluso en CPU: la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (tag endpoints_compatible), ONNX Runtime si se exporta, y servidores de inferencia estándar compatibles con modelos de clasificación de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de pocos milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aCe44/distilbert-customer-review | 66,9 M | hasta 512 tokens (heredado del base) | Clasificación de reseñas | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | hasta 512 tokens | Análisis de sentimiento binario | Apache 2.0 | Hugging Face |
| bert-base-uncased | ~110 M | hasta 512 tokens | Representación general, ajustable | Apache 2.0 | Hugging Face |
| roberta-base | ~125 M | hasta 512 tokens | Representación general, ajustable | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, el número de clases ni la definición de las etiquetas, lo que impide conocer el dominio exacto de aplicación.
- No hay información sobre sesgos: al derivar de distilbert-base-uncased, puede heredar sesgos de género, raza o edad presentes en los corpus web en inglés.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas fuera de la distribución de entrenamiento.
- El modelo base está entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- El límite de 512 tokens del modelo base restringe el análisis de reseñas largas, que se truncarán.
- Las métricas declaradas (accuracy 0,9649) proceden de un conjunto de evaluación no descrito; no deben extrapolarse a otros dominios sin validación propia.
- Licencia Apache 2.0 permite uso comercial, pero al no haber documentación del dataset subyacente no puede confirmarse la ausencia de datos con restricciones.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Para producción se recomienda evaluar sobre datos propios, comprobar el equilibrio de clases y calibrar los umbrales de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aCe44/distilbert-customer-review
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Artículo de referencia sobre servicio al cliente con IA (resultado de búsqueda): https://www.databricks.com/blog/ai-customer-service
