# JeGe31/my-sentiment-classifier

## Resumen

My Sentiment Classifier es un modelo de clasificación de texto publicado por el usuario JeGe31 en Hugging Face. Se trata de un fine-tuning de distilbert-base-uncased, la variante destilada de BERT con 6 capas, orientado a clasificación binaria de sentimiento (POSITIVE / NEGATIVE). El autor lo describe explícitamente como un "ejercicio de despliegue", lo que sitúa el modelo en el ámbito de la demostración técnica más que en el de un artefacto listo para producción.

El modelo cuenta con 66.955.010 parámetros en formato safetensors y un repositorio de 0,3 GB, coherente con la arquitectura DistilBERT en precisión completa. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales, lo que reduce la fricción para experimentación.

Su relevancia es limitada como modelo de referencia: no registra descargas ni interacciones, la model card no documenta datos de entrenamiento ni métricas de evaluación, y el pipeline declarado es text-classification con soporte únicamente para inglés. Resulta útil como ejemplo de fine-tuning mínimo de DistilBERT y como punto de partida para quien quiera replicar el flujo con transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (DistilBERT-base admite hasta 512 tokens de entrada) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización dinámica posible vía herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas obtenido mediante destilación de conocimiento a partir de BERT-base (12 capas). El proceso de destilación original reduce el número de parámetros aproximadamente un 40 % y la latencia de inferencia alrededor de un 60 % respecto a BERT-base, manteniendo en torno al 97 % del rendimiento en GLUE según los resultados publicados por sus autores. El modelo emplea tokenización WordPiece con un vocabulario de 30.522 entradas y atención bidireccional completa.

El fine-tuning concreto aplicado por JeGe31 no está documentado: la model card no especifica el dataset de entrenamiento, el número de épocas, la tasa de aprendizaje, la composición de las clases ni si se aplicó alguna técnica de regularización. Tampoco se indica si el ajuste se realizó sobre una única cabeza de clasificación binaria o sobre un conjunto mayor de etiquetas reducido posteriormente. Esta ausencia de información impide evaluar la calidad del ajuste y la representatividad de los datos utilizados.

## Capacidades

- Clasificación binaria de sentimiento en inglés, con salida POSITIVE / NEGATIVE a través del pipeline `text-classification` de transformers.
- Inferencia sobre secuencias de texto de hasta 512 tokens, límite propio de la arquitectura DistilBERT.
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints de Hugging Face, según los tags del repositorio.
- Ejecución en CPU con latencia baja gracias al tamaño reducido del modelo (6 capas, 66,9 M de parámetros).
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No dispone de capacidades multilingües: el vocabulario y el ajuste están orientados a inglés.

## Casos de uso

- Análisis de opiniones en inglés sobre reseñas de producto: el modelo clasifica cada reseña como positiva o negativa en una sola pasada, con un coste computacional mínimo que permite procesar lotes grandes en CPU.
- Moderación de comentarios en foros angloparlantes: sirve como primer filtro para detectar tono negativo y derivar los casos ambiguos a revisión humana o a un modelo mayor.
- Enrutamiento de tickets de soporte: clasificar el sentimiento del mensaje inicial permite priorizar clientes insatisfechos dentro de un sistema de ticketing, siempre que el texto esté en inglés.
- Monitorización de menciones en redes sociales: integrado en un pipeline de ingesta, etiqueta cada publicación con polaridad para alimentar paneles de reputación de marca.
- Etiquetado asistido para creación de datasets: el modelo puede pre-anotar grandes volúmenes de texto en inglés que después se revisan manualmente, acelerando la construcción de corpus de sentimiento.
- Demo educativa de fine-tuning con transformers: por su tamaño y licencia, es adecuado para talleres y tutoriales que muestren el ciclo completo de ajuste y despliegue de un clasificador DistilBERT.
- Filtro previo en pipelines RAG: descartar fragmentos con tono negativo o clasificar la respuesta del usuario antes de decidir la siguiente acción en un flujo conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (66,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16: alrededor de 0,13 GB de pesos, con requisitos totales por debajo de 1 GB.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 y prácticamente cualquier GPU con soporte CUDA de los últimos años. También funciona en CPU con throughput aceptable para lotes moderados.
- GPU de centro de datos (A100, H100, L4, T4) innecesarias para este tamaño; su uso solo se justifica por agregación de carga en servicios multi-modelo.
- Opciones de despliegue: transformers con pipeline nativo, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime y TorchScript. llama.cpp y Ollama no aplican de forma estándar a este tipo de encoder, aunque existen conversiones a GGUF para BERT.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un DistilBERT de 6 capas se esperan decenas de miles de inferencias por segundo en GPU moderna con batching, pero no hay medición publicada para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JeGe31/my-sentiment-classifier | 66,9 M | hasta 512 tokens (límite de DistilBERT) | Clasificación de sentimiento binaria (en) | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | hasta 512 tokens | Clasificación de sentimiento binaria (en) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | hasta 512 tokens | Clasificación de sentimiento en tres clases (en) | MIT | Hugging Face, muy utilizado |
| bert-base-multilingual-uncased-sentiment | 178 M | hasta 512 tokens | Clasificación de sentimiento en cinco clases, multilingüe | Apache 2.0 | Hugging Face |

La comparación se basa en características públicas de los modelos alternativos; no se dispone de métricas de rendimiento del modelo de JeGe31 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el proceso de ajuste ni los resultados de evaluación; no es posible verificar la calidad ni la calibración del clasificador.
- Riesgo elevado de sesgos desconocidos: al no especificarse la distribución de los datos de entrenamiento, no se puede evaluar el comportamiento ante dominios distintos (redes sociales, texto técnico, lenguaje informal).
- El modelo solo procesa inglés; textos en otros idiomas producen clasificaciones sin garantía de validez.
- El límite de 512 tokens implica truncamiento en documentos largos; la polaridad de un texto extenso puede quedar mal representada si el sentimiento se distribuye a lo largo del documento.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo con datos propios antes de integrarlo en producción.
- El repositorio no registra descargas ni interacciones, lo que sugiere ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-17) es posterior a la fecha habitual de consulta; conviene verificar la integridad del repositorio y la procedencia del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JeGe31/my-sentiment-classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
