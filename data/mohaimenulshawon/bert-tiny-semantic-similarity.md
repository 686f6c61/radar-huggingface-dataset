# mohaimenulshawon/bert-tiny-semantic-similarity

## Resumen

`bert-tiny-semantic-similarity` es un cross-encoder de clasificación binaria desarrollado por mohaimenulshawon, obtenido mediante fine-tuning del modelo base `prajjwal1/bert-tiny` (4,4 millones de parámetros, 2 capas, tamaño oculto de 128). Está diseñado para determinar si dos frases son semánticamente similares, paráfrasis o preguntas duplicadas, devolviendo una probabilidad entre 0 y 1. El modelo se entrenó de forma conjunta sobre los conjuntos de datos STS-B, QQP, PAWS y MRPC, lo que le permite abordar tareas de detección de duplicados, coincidencia de preguntas frecuentes y similitud semántica general.

La relevancia de este modelo radica en su extrema ligereza: con apenas 4,4 millones de parámetros, es capaz de ejecutarse en CPU o GPUs de gama baja con latencias mínimas, lo que lo hace apto para aplicaciones en tiempo real o entornos con recursos restringidos. Sin embargo, su arquitectura compacta (2 capas, 128 dimensiones ocultas) limita su capacidad para tareas adversarias que requieren sensibilidad al orden de las palabras, como se refleja en su rendimiento casi aleatorio en el conjunto PAWS. Está licenciado bajo MIT y soporta únicamente el idioma inglés, con una longitud máxima de contexto de 64 tokens (combinando ambas frases).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT tiny (2 capas, hidden size 128) con cabeza de clasificación binaria (cross-encoder) |
| Parámetros totales | 4.386.178 |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 64 tokens (frase 1 + frase 2 combinadas) |
| Tipos de cuantización | No especificado en la información disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura de BERT tiny (`BertForSequenceClassification`) como cross-encoder: las dos frases se concatenan con los tokens especiales de separación y se alimentan conjuntamente al modelo, que produce una puntuación binaria de similitud. La capa de clasificación tiene dos neuronas con salida softmax, de las que se extrae la probabilidad de la clase positiva (similar/duplicado).

El entrenamiento se realizó sobre la concatenación de cuatro conjuntos de datos públicos, con conversión de etiquetas donde fue necesario: STS-B (5.749 muestras, umbral de similitud ≥ 3.0 para clase 1), QQP (363.846 muestras binarias de duplicados), PAWS (49.401 muestras de paráfrasis) y MRPC (3.668 muestras). Se usó el optimizador AdamW con tasa de aprendizaje de 1e-4, tamaño de lote de 32, 10 épocas, pérdida de entropía cruzada ponderada por clases (con pesos inversos a la frecuencia de etiquetas), label smoothing de 0.1, warmup del 10% y weight decay de 0.01. Esta combinación buscaba mitigar el desequilibrio de clases presente en los datos combinados.

## Capacidades

- Generación de texto: no aplica, es un modelo de clasificación de pares de frases.
- Razonamiento y matemáticas: no aplica; su función es exclusivamente de similitud semántica binaria.
- Código: no soportado.
- Visión: no soportada.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: únicamente inglés.
- Capacidades especiales: detección de paráfrasis, preguntas duplicadas y similitud semántica general. No incluye modo de pensamiento ni procesamiento de audio.

## Casos de uso

- Detección de preguntas duplicadas en foros o plataformas de soporte: el modelo puede emparejar preguntas similares de usuarios para sugerir respuestas existentes, reduciendo el trabajo manual de moderación. Su ventana de 64 tokens es suficiente para preguntas cortas y típicas de FAQ.
- Coincidencia de preguntas frecuentes (FAQ) en chatbots: al comparar la consulta del usuario con las preguntas almacenadas en una base de conocimiento, se puede seleccionar la respuesta más relevante con baja latencia, incluso en entornos con CPU limitada.
- Filtrado de contenido duplicado en sistemas de gestión de documentos: permite detectar si dos artículos, descripciones de productos o entradas de blog son paráfrasis o copias, ayudando a mantener la calidad del contenido.
- Preprocesamiento en pipelines de NLP: como etapa rápida de filtrado de pares de oraciones antes de pasar a modelos más grandes y costosos, reduciendo el coste computacional global.
- Verificación de similitud en sistemas de recomendación de respuestas: comparar respuestas generadas por un LLM con respuestas de referencia para validar su coherencia semántica en aplicaciones de evaluación automática.
- Clasificación de pares de frases en entornos educativos: para evaluar si dos definiciones o explicaciones dadas por estudiantes son equivalentes, con un coste de inferencia muy bajo que permite su uso en plataformas masivas.

## Benchmarks y rendimiento

El autor reporta resultados de evaluación sobre los conjuntos de validación y test de cada dataset, con umbral de decisión en 0.5:

| Dataset | Métrica | Resultado |
|---|---|---|
| QQP (validación) | Accuracy | 81.4% |
| QQP (validación) | F1 | 77.5% |
| MRPC (validación) | Accuracy | ~70–72% |
| MRPC (validación) | F1 | ~80–82% |
| STS-B (validación) | Spearman | ~0.665 |
| PAWS (test) | Accuracy | ~51% |
| PAWS (test) | F1 | ~55% |

El rendimiento en PAWS es cercano al azar (50%), lo que indica una limitación inherente de los modelos con menos de 15 millones de parámetros en tareas que requieren sensibilidad al orden de las palabras. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,4 millones de parámetros en fp32, el modelo ocupa aproximadamente 17,5 MB en memoria; en cuantización int8, alrededor de 4,4 MB. Cabe en cualquier GPU consumidora (incluso con 1 GB de VRAM) y en CPU.
- GPUs recomendadas: cualquiera, incluyendo GPUs integradas o CPUs modernas. No se requiere GPU dedicada para inferencia.
- Compatibilidad con GPU consumidora: sí, cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo sin problemas.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `ONNX Runtime` (si se exporta), `TensorFlow` y `llama.cpp` (no nativo, requiere conversión). No se menciona soporte específico para vLLM u Ollama, pero por su tamaño puede servirse en cualquier servidor HTTP.
- Latencia y throughput: no se proporcionan mediciones oficiales; dado su tamaño, se esperan latencias de milisegundos en CPU moderna y throughput alto en GPU.

## Comparativa con modelos similares

La información disponible no incluye resultados de benchmarks para modelos comparables de la misma categoría (cross-encoders ligeros). A continuación se comparan las características generales con alternativas conocidas, sin datos de rendimiento adicionales:

| Modelo | Parámetros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| `bert-tiny-semantic-similarity` (este) | 4,4 M | 64 tokens | MIT | Similitud semántica binaria |
| `distilbert-base-uncased` | 66 M | 512 tokens | Apache-2.0 | Similitud semántica (fine-tuning requerido) |
| `bert-base-uncased` | 110 M | 512 tokens | Apache-2.0 | Similitud semántica (fine-tuning requerido) |

La comparación de rendimiento específica no está disponible; se recomienda evaluar cada modelo en el caso de uso concreto antes de elegir.

## Limitaciones y advertencias

- Rendimiento en PAWS (paráfrasis adversariales): el modelo obtiene resultados cercanos al azar (~50%) en el conjunto PAWS, que prueba la sensibilidad al orden de las palabras (ej., "el gato persiguió al ratón" vs. "el ratón persiguió al gato"). No debe utilizarse en aplicaciones donde la distinción por orden de palabras sea crítica.
- Sesgos conocidos: el modelo se entrenó únicamente con datos en inglés y puede presentar sesgos de género, raza o cultura presentes en los conjuntos de datos originales (STS-B, QQP, PAWS, MRPC). No se han documentado mitigaciones específicas.
- Riesgo de alucinación: al ser un clasificador binario, no genera texto; el riesgo se limita a clasificaciones incorrectas en casos de alta lexical overlap pero diferente significado.
- Limitaciones de contexto: la longitud máxima de 64 tokens es restrictiva; frases largas se truncarán, lo que puede degradar la precisión en entradas extensas.
- Restricciones de licencia: el modelo está bajo licencia MIT, pero el conjunto de datos QQP tiene términos de uso orientados a investigación/no comercial. El autor advierte que los pesos ajustados son MIT, pero el uso comercial de la tarea podría requerir revisar la licencia original de QQP.
- Recomendaciones de producción: no es apto para detección de paráfrasis legal o de cumplimiento normativo, ni para escenarios con ataques de inversión de orden de palabras.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mohaimenulshawon/bert-tiny-semantic-similarity)
- [Modelo base `prajjwal1/bert-tiny`](https://huggingface.co/prajjwal1/bert-tiny)
- [Paper sobre predicción directa de similitud semántica (arXiv 2309.12697)](https://arxiv.org/html/2309.12697v2)
- [Repositorio TinyBERT (GitHub)](https://github.com/yinmingjun/TinyBERT)
- [Documentación de Sentence Transformers sobre STS](https://www.sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html)
