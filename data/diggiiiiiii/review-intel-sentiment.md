# diggiiiiiii/review-intel-sentiment

## Resumen

review-intel-sentiment es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) desarrollado por el usuario diggiiiiiii como parte de un proyecto de estudiante denominado Customer Review Intelligence Tool. Se trata de un fine-tuning de distilbert-base-uncased, un transformer encoder de 66.955.779 parámetros, sobre aproximadamente 150.000 reseñas en inglés procedentes del Yelp Open Dataset (restaurantes) y de Amazon Reviews 2023 (categorías de alimentación y electrodomésticos).

El modelo resuelve un problema acotado pero frecuente en analítica de opiniones: asignar una polaridad a reseñas de clientes con una clase intermedia explícita, algo que los clasificadores binarios habituales no cubren. Su relevancia es limitada por su naturaleza experimental y su licencia, pero resulta útil como referencia de un pipeline completo de fine-tuning con partición por comercio (evitando fuga de datos entre entrenamiento y test) y con ponderación de clases para compensar el desequilibrio de la etiqueta neutra.

No es un modelo generativo ni un LLM: es un encoder de clasificación con una ventana de entrada de 256 word-pieces, distribuido únicamente en safetensors y entrenado en una sola Tesla T4 en 27 minutos. Su interés técnico está en la metodología de evaluación (macro F1, evaluación por tipo de comercio y generalización a categorías no vistas) más que en el rendimiento absoluto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 word-pieces (longitud de entrenamiento; máxima del modelo base: 512) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | other / research-only (solo investigación y aprendizaje) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-uncased, un encoder transformer de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base, con cabecera de clasificación adaptada a tres etiquetas. El fine-tuning usó learning rate 5e-05, batch size 32, secuencias de hasta 256 word-pieces y un máximo de 3 epochs, conservando la mejor epoch según macro F1 de validación (epoch 2 de 3, con macro F1 0.766 en validación). El entrenamiento completo se ejecutó en 27 minutos sobre una Tesla T4 (GPU gratuita de Kaggle), con identificador de ejecución 9501c6c56b68.

El conjunto de datos comprende unas 150.000 reseñas en inglés, 50.000 por cada una de las tres fuentes: Yelp Open Dataset (restaurantes) y Amazon Reviews 2023 de McAuley Lab (Grocery and Gourmet Food y Appliances). Las etiquetas se derivan de la puntuación en estrellas: 1-2 negativas, 3 neutra, 4-5 positivas. Dos decisiones metodológicas destacan: la partición se hace por comercio completo, de modo que ningún comercio de test aparece en entrenamiento, y la función de pérdida pondera las clases raras para que la etiqueta neutra no quede infrarepresentada. No se menciona uso de RLHF ni DPO, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto en inglés.
- Procesamiento de reseñas de clientes de hasta 256 word-pieces por muestra.
- Etiquetado derivado de valoraciones en estrellas, con soporte implícito para reseñas mixtas mediante la clase neutra.
- Evaluación de generalización a tipos de comercio no vistos durante el entrenamiento (el autor reporta 0.699 de macro F1 en electrodomésticos tras reentrenar sin esa categoría).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Monitorización de opiniones en plataformas de reseñas: clasificar en lote reseñas de restaurantes o comercios electrónicos para construir series temporales de sentimiento por establecimiento, aprovechando que el modelo fue entrenado con partición por comercio y generaliza razonablemente a locales no vistos.
- Enrutamiento de tickets de soporte: usar la clase negativa como señal para derivar automáticamente quejas a un equipo humano, con la ventaja de que la clase neutra evita forzar a positivo o negativo los casos ambiguos.
- Análisis de categorías en marketplaces: aplicar el modelo a reseñas de alimentación y electrodomésticos, los dos dominios de Amazon cubiertos en entrenamiento, para agregar sentimiento por producto o marca.
- Prototipado académico y docencia: servir como referencia reproducible de un pipeline de fine-tuning de DistilBERT con partición por grupo y ponderación de clases, ejecutable en una GPU gratuita en menos de media hora.
- Baseline en experimentos de NLP: comparar contra él arquitecturas mayores o aproximaciones con LLMs en tareas de clasificación de reseñas, dado su bajo coste de inferencia (66 millones de parámetros, CPU viable).
- Filtrado previo en pipelines de análisis: reducir el volumen de reseñas que llegan a un modelo generativo posterior, clasificando primero la polaridad y reservando el modelo caro para las neutras o ambiguas.
- Detección de reseñas mixtas para revisión manual: la clase neutra, aunque con F1 bajo (0.492), puede usarse como cola de revisión donde concentrar la inspección humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre 14.996 reseñas de comercios no vistos en entrenamiento:

| Modelo | Macro F1 | F1 negativo | F1 neutro | F1 positivo |
|---|---|---|---|---|
| DistilBERT (este modelo) | 0.761 | 0.837 | 0.492 | 0.954 |
| TF-IDF + regresión logística | 0.732 | 0.812 | 0.445 | 0.941 |

Exactitud global: 0.887.

Desglose por tipo de comercio:

| Tipo de comercio | Macro F1 |
|---|---|
| appliances | 0.738 |
| grocery | 0.746 |
| restaurant | 0.776 |

Generalización a una categoría no vista: reentrenado sin reseñas de electrodomésticos, el modelo alcanza 0.699 de macro F1 en esa categoría, por encima del baseline entrenado con ellas (0.688).

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (66,9 millones de parámetros, aproximadamente 268 MB de pesos) más el overhead del runtime; en fp16 alrededor de 134 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una Tesla T4. Para inferencia en producción, T4, L4 o A10 son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante); también es viable en CPU para lotes moderados.
- Opciones de despliegue: transformers pipeline, TorchServe, ONNX Runtime, Triton Inference Server, FastAPI con transformers. No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| review-intel-sentiment | 66,9 M | 256 word-pieces | Clasificación 3 clases (reseñas) | research-only | HuggingFace |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 word-pieces | Clasificación 2 clases (sentimiento general) | Apache-2.0 | HuggingFace |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | Clasificación 3 clases (reseñas) | depende del pipeline | No publicado como modelo |
| RoBERTa-base fine-tuned para sentimiento | ~125 M | 512 word-pieces | Clasificación de sentimiento | MIT (modelo base) | HuggingFace |

Frente a distilbert-base-uncased-finetuned-sst-2-english, este modelo añade la clase neutra y está especializado en reseñas de comercios, pero pierde la licencia permisiva y la longitud de contexto de 512 tokens. Frente a un baseline TF-IDF, mejora el macro F1 en 0,029 puntos, una diferencia modesta que refleja la dificultad de la clase neutra. Frente a RoBERTa-base, este modelo es más ligero y rápido, pero con menor capacidad representacional.

## Limitaciones y advertencias

- La clase neutra es el punto débil: F1 de 0.492, porque las reseñas de 3 estrellas suelen ser mixtas y muchas son en realidad positivas o negativas.
- Las etiquetas derivadas de estrellas son ruidosas: una reseña de 5 estrellas puede describir un fallo del producto.
- Solo inglés. Entrenado con restaurantes, alimentación y electrodomésticos; otros tipos de comercio pueden obtener puntuaciones inferiores.
- Licencia research-only: los pesos derivan de distilbert-base-uncased (Apache-2.0), pero las licencias de los datos de entrenamiento no permiten uso comercial, por lo que el modelo tampoco lo permite. No apto para producción comercial.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en reseñas ambiguas, sarcásticas o con negaciones complejas.
- Ventana de entrada de 256 word-pieces: reseñas largas se truncan y pueden perder la información decisiva para la polaridad.
- Sesgos no documentados: el autor no publica análisis de sesgo por demografía, idioma o tipo de producto.
- Sin datos de benchmarks verificados de forma independiente; todas las métricas proceden de la model card del autor.
- Proyecto de estudiante sin mantenimiento declarado ni versionado posterior a la creación (noviembre de 2026).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diggiiiiiii/review-intel-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Yelp Open Dataset: https://www.yelp.com/dataset
- Amazon Reviews 2023 (McAuley Lab): https://amazon-reviews-2023.github.io/
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
