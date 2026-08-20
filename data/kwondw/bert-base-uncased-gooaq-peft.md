# kwondw/bert-base-uncased-gooaq-peft

## Resumen

El modelo `kwondw/bert-base-uncased-gooaq-peft` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) sobre el modelo base `google-bert/bert-base-uncased`, entrenado con pares de preguntas y respuestas del dataset GooAQ (Google Answers to Questions). Su propósito es generar representaciones densas de frases (embeddings) para tareas de similitud semántica y recuperación de información. El autor, kwondw, lo publica bajo licencia Apache 2.0 y lo integra en el ecosistema de `sentence-transformers`, lo que permite usarlo directamente con la API estándar de esta librería.

El modelo se entrena con la función de pérdida `CachedMultipleNegativesRankingLoss` sobre 250 000 pares de entrenamiento, lo que lo orienta a aprender a distinguir respuestas relevantes de irrelevantes para una pregunta dada. Al tratarse de un adaptador PEFT, solo se actualizan un pequeño número de parámetros adicionales sobre el BERT base congelado, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto final. La arquitectura subyacente es la de BERT-base (110 millones de parámetros), con una longitud de contexto máxima de 512 tokens.

Aunque el repositorio no muestra descargas ni likes, y el tamaño del repo figura como 0.0 GB (posiblemente los pesos no estén subidos o el adaptador sea muy pequeño), la ficha técnica y los benchmarks declarados indican que se trata de un experimento de fine-tuning eficiente para retrieval semántico. Su relevancia radica en demostrar cómo adaptar un modelo BERT clásico a una tarea específica con recursos mínimos, manteniendo la compatibilidad con herramientas estándar de `sentence-transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (Transformer encoder) con adaptadores PEFT (LoRA) |
| Parametros totales | no disponible (base: 110M, adaptador adicional no especificado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de BERT-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un encoder Transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, preentrenado con enmascaramiento de tokens y prediccion de siguiente oracion. Sobre esta base congelada se anade un adaptador PEFT (probablemente LoRA, aunque no se especifica el tipo exacto) que se entrena con pares de preguntas y respuestas del dataset GooAQ. El dataset contiene 250 000 pares y se utiliza la funcion de perdida `CachedMultipleNegativesRankingLoss`, que optimiza la similitud coseno entre una pregunta y su respuesta positiva frente a respuestas negativas muestreadas dentro del lote. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente contrastivo. Tampoco se detallan hiperparametros, numero de epocas ni estrategia de muestreo de negativos.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de informacion.
- Soporte de busqueda por similitud coseno entre preguntas y respuestas.
- Extraccion de caracteristicas (feature extraction) para downstream tasks.
- Integracion nativa con la libreria `sentence-transformers` (pipeline `sentence-similarity`).
- Capacidad multilingue: no, solo ingles.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso ni generacion de texto (es un modelo encoder, no generativo).

## Casos de uso

- **Sistema de preguntas y respuestas (QA)**: el modelo puede recuperar la respuesta mas relevante a una pregunta dada a partir de un corpus de documentos. Se usaria generando embeddings de las respuestas candidatas y comparando con el embedding de la pregunta mediante similitud coseno. Es adecuado porque fue entrenado especificamente con pares pregunta-respuesta de GooAQ.
- **Busqueda semantica en bases de conocimiento**: permite indexar articulos, manuales o FAQs y buscar por significado, no solo por palabras clave. Su tamano reducido (BERT-base) lo hace viable para despliegue en CPU.
- **Filtrado de respuestas en chatbots**: dado un conjunto de respuestas generadas por un sistema, el modelo puede ordenarlas por relevancia respecto a la consulta del usuario, mejorando la seleccion final.
- **Deduplicacion de contenido**: al generar embeddings de frases, se pueden detectar respuestas duplicadas o muy similares en un corpus, util para limpiar bases de datos de soporte.
- **Recomendacion de articulos de ayuda**: en un portal de soporte, el modelo puede sugerir articulos relacionados con la consulta del usuario, basandose en la similitud semantica entre la consulta y los titulos o resumenes de los articulos.
- **Evaluacion de respuestas generadas**: comparando la respuesta de un LLM con respuestas de referencia mediante similitud coseno, se puede obtener una metrica de calidad sin necesidad de evaluacion humana.

## Benchmarks y rendimiento

El autor declara resultados en el dataset NanoClimateFEVER (tarea de recuperacion de informacion). Los valores son los siguientes:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.10 |
| Cosine Accuracy@3 | 0.28 |
| Cosine Accuracy@5 | 0.30 |
| Cosine Accuracy@10 | 0.44 |
| Cosine Precision@1 | 0.10 |
| Cosine Precision@3 | 0.10 |
| Cosine Precision@5 | 0.076 |
| Cosine Precision@10 | 0.054 |
| Cosine Recall@1 | 0.032 |
| Cosine Recall@3 | 0.112 |
| Cosine Recall@5 | 0.133 |
| Cosine Recall@10 | 0.208 |
| Cosine NDCG@10 | 0.152 |

No se proporcionan comparaciones con otros modelos en la informacion disponible. Los resultados son modestos, lo que sugiere que el adaptador tiene margen de mejora o que el dataset de evaluacion es complejo.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo BERT-base (110M parametros) con un adaptador PEFT, la inferencia requiere aproximadamente 400-500 MB en FP32. Con cuantizacion a 8 bits, se reduce a unos 250 MB. No se dispone de datos exactos del adaptador.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (ej. NVIDIA GTX 1050 Ti, RTX 2060). Tambien puede ejecutarse en CPU con razonable latencia (del orden de 10-50 ms por frase en hardware moderno).
- **Compatibilidad con consumer GPU**: si, cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: al ser un modelo de `sentence-transformers`, se puede servir con la libreria estandar, o mediante herramientas como Hugging Face Inference Endpoints, ONNX Runtime, o convirtiendolo a formato GGUF para llama.cpp (aunque no se proporciona ese formato). Tambien es compatible con vLLM si se usa como encoder, aunque no es el caso tipico.
- **Latencia y throughput**: no se proporcionan datos oficiales. En una CPU moderna, se pueden procesar decenas de frases por segundo; en GPU, cientos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma tarea (fine-tuning de BERT para retrieval con GooAQ). Como referencia, se puede comparar con el BERT-base original sin fine-tuning, que no esta optimizado para similitud semantica y daria resultados inferiores en tareas de retrieval. Otros modelos populares de sentence-transformers como `all-MiniLM-L6-v2` (80M parametros) o `multi-qa-MiniLM-L6-cos-v1` (22M parametros) suelen ofrecer mejor rendimiento en tareas generales de busqueda semantica, pero no se dispone de datos comparativos con este adaptador concreto. La comparativa queda pendiente de datos publicados.

## Limitaciones y advertencias

- **Sesgos conocidos**: hereda los sesgos de BERT-base, que pueden reflejar prejuicios de genero, raza o religion presentes en los datos de preentrenamiento.
- **Riesgo de alucinacion**: al ser un modelo encoder, no genera texto, por lo que no hay riesgo de alucinacion en el sentido generativo. Sin embargo, los embeddings pueden producir falsos positivos en la recuperacion si las respuestas son semanticamente similares pero incorrectas.
- **Limitaciones de contexto**: la longitud maxima de 512 tokens limita el procesamiento de documentos largos; para textos mas extensos se requiere truncamiento o chunking.
- **Limitaciones de idioma**: solo soporta ingles; no funciona con otros idiomas.
- **Restricciones de licencia**: licencia Apache 2.0, permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y la atribucion.
- **Caveat de produccion**: el repositorio no muestra descargas ni likes, y el tamano del repo es 0.0 GB, lo que sugiere que los pesos podrian no estar disponibles o que el adaptador es extremadamente pequeno. Se recomienda verificar la integridad del artefacto antes de usarlo en produccion.

## Enlaces

- [HuggingFace - kwondw/bert-base-uncased-gooaq-peft](https://huggingface.co/kwondw/bert-base-uncased-gooaq-peft)
- [Modelo base: google-bert/bert-base-uncased](https://huggingface.co/google-bert/bert-base-uncased)
- [Paper BERT (arxiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper GooAQ (arxiv:2101.06983)](https://arxiv.org/abs/2101.06983)
