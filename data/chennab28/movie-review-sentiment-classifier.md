# chennab28/movie-review-sentiment-classifier

## Resumen

El modelo `chennab28/movie-review-sentiment-classifier` es un clasificador de texto en inglés especializado en análisis de sentimiento de críticas de cine, con tres clases de salida: `positive`, `negative` y `neutral`. Lo desarrolla el usuario de Hugging Face chennab28 como ejemplo mínimo de flujo de trabajo completo (Dataset → Model → Space) y está construido mediante fine-tuning del modelo `google/bert_uncased_L-4_H-256_A-4`, una variante "tiny" de BERT.

Se trata de un transformer encoder con aproximadamente 11,17 millones de parámetros totales, lo que lo sitúa en la categoría de modelos ultraligeros. El entrenamiento se realizó sobre el dataset complementario `chennab28/movie-review-sentiment`, con una longitud máxima de secuencia de 128 tokens, 30 épocas, batch size 16 y learning rate 5e-5. El autor reporta una precisión del 97,62 % en la partición de test.

Su relevancia es fundamentalmente didáctica y de prototipado: demuestra que es posible alcanzar una precisión alta en una tarea de clasificación acotada con muy pocos recursos (entrenamiento en CPU en pocos minutos) y sin necesidad de GPU. No está pensado como modelo de propósito general ni como base para tareas generativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT tiny, `google/bert_uncased_L-4_H-256_A-4`) |
| Parametros totales | 11.171.331 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia usada en entrenamiento); el modelo base admite hasta 512, pero el fine-tuning se realizó a 128 |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantizaciones precalculadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT en su configuración "tiny": 4 capas, tamaño de representación oculta de 256 y 4 cabezas de atención (`L-4_H-256_A-4`). Sobre esta base se añade una cabeza de clasificación de secuencia con 3 etiquetas (`positive`, `negative`, `neutral`). El modelo base es "uncased", por lo que el texto de entrada se normaliza a minúsculas antes de la tokenización.

El fine-tuning se llevó a cabo sobre el dataset `chennab28/movie-review-sentiment` con los siguientes hiperparámetros declarados por el autor: 30 épocas, batch size 16, learning rate 5e-5 y longitud máxima de secuencia 128. El conjunto de datos es deliberadamente minúsculo: 168 filas de entrenamiento y 42 de test. El entrenamiento completo se realizó en CPU en pocos minutos. No se declara el uso de RLHF, DPO ni ninguna técnica de alineación; tampoco se documentan innovaciones arquitectónicas adicionales más allá de las propias del BERT tiny. El script de reproducción se referencia como `train/train.py --epochs 30`.

## Capacidades

- Clasificación de sentimiento de texto en inglés con tres clases: positivo, negativo y neutro.
- Etiquetado de secuencias cortas (hasta 128 tokens), adecuado para frases, titulares, reseñas breves y comentarios.
- Integración directa con la librería `transformers` mediante el pipeline `text-classification`.
- Compatibilidad declarada con Text Embeddings Inference (tag `text-embeddings-inference`) y con `endpoints_compatible`.
- No soporta generación de texto, razonamiento, código ni matemáticas: es exclusivamente un clasificador.
- No dispone de tool calling ni de capacidades de agente.
- No tiene modo "thinking", visión ni audio.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Moderación de reseñas de cine y series: clasificar automáticamente los comentarios de usuarios en positivos, negativos o neutros para ordenar, filtrar o destacar opiniones en una plataforma de contenido audiovisual.
- Análisis de opinión en pipelines de datos: procesar en lote miles de críticas y agregar la distribución de sentimiento por película, evitando el coste de un modelo grande en tareas donde la etiqueta ternaria es suficiente.
- Prototipado y docencia: servir como ejemplo end-to-end de entrenamiento y despliegue en Hugging Face (Dataset → Model → Space) para cursos o tutoriales de NLP.
- Enrutado previo en sistemas mayores: usar la predicción como señal barata para decidir si un comentario merece un análisis más profundo con un modelo mayor o con revisión humana.
- Detección de reseñas problemáticas: identificar comentarios negativos que podrían requerir moderación o respuesta prioritaria del equipo de atención al cliente.
- Clasificación en el borde o en dispositivos sin GPU: al tener ~11 M de parámetros, puede ejecutarse en CPU, en navegador o en contenedores con recursos mínimos.
- Etiquetado de datos para entrenamiento: preanotar grandes volúmenes de reseñas con una etiqueta de sentimiento antes de una revisión humana, acelerando la creación de datasets.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (marcados como no verificados):

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Análisis de sentimiento (3 clases) | Movie Review Sentiment (Mini) (`chennab28/movie-review-sentiment`) | test | Accuracy | 0,9762 |

No se han publicado otros resultados de benchmarks (tipo MMLU, GLUE o similares) en la información disponible. La cifra de precisión procede de una partición de test de solo 42 filas, por lo que su valor estadístico es muy limitado y no debe extrapolarse a dominios distintos del dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos. En FP32 el modelo ocupa en torno a 45 MB; en FP16, unos 22 MB; en int8, aproximadamente 11 MB.
- GPU recomendadas: no requiere GPU. Funciona en CPU sin problema; cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3050, RTX 4090) es más que suficiente y el cuello de botella será el preprocesado, no el modelo.
- Cabe en cualquier GPU consumer, e incluso en dispositivos de gama baja, Raspberry Pi o entornos serverless con memoria muy limitada.
- Opciones de despliegue: pipeline de `transformers` en Python, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (compatible según los tags del repositorio) y ejecución directa en CPU. No se publican pesos GGUF, por lo que no hay integración nativa con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles de forma oficial; dado el tamaño (~11 M de parámetros) y la longitud máxima de 128 tokens, se espera una latencia del orden de milisegundos por lote en CPU moderna y throughput muy alto en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| chennab28/movie-review-sentiment-classifier | ~11,17 M | 128 tokens (entrenamiento) | Clasificación 3 clases | apache-2.0 | Modelo tiny, dataset de test de 42 filas |
| distilbert-base-uncased-finetuned-sst-2-english | ~66 M | 512 tokens | Clasificación binaria (SST-2) | apache-2.0 | Modelo de referencia estándar para sentimiento en inglés |
| Modelos RoBERTa/BERT base fine-tuneados para sentimiento | ~110-125 M | 512 tokens | Binaria o multiclase | variable | Mayor coste computacional |

No se dispone de datos de benchmarks comparativos verificados en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia. La ventaja principal de este modelo frente a alternativas mayores es su tamaño (~11 M de parámetros, en torno a 6 veces menor que DistilBERT) y su coste de despliegue prácticamente nulo; su desventaja es que no aporta una mejora medible y verificable frente a modelos consolidados y que su evaluación se apoya en un conjunto de test muy reducido.

## Limitaciones y advertencias

- Riesgo de sobreajuste elevado: el entrenamiento usa solo 168 filas y la evaluación se hace sobre 42, por lo que la precisión del 97,6 % no es representativa de un rendimiento real en producción.
- Sesgos conocidos: no disponibles. Al entrenar sobre un dataset diminuto de reseñas, el modelo puede heredar los sesgos de ese conjunto y generalizar mal fuera de su dominio.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas o poco calibradas con textos fuera de distribución (por ejemplo, dominios distintos al cine o entradas largas).
- Limitación de contexto: la longitud máxima usada en entrenamiento es de 128 tokens; textos más largos requerirán truncado o división, lo que puede degradar la clasificación de reseñas extensas.
- Limitación de idioma: solo inglés. No debe usarse con textos en otros idiomas sin un fine-tuning específico.
- Licencia apache-2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y verificar la licencia del modelo base (`google/bert_uncased_L-4_H-256_A-4`) si se redistribuye.
- Advertencias para producción: el modelo es una demostración didáctica; para un sistema real se recomienda validar con un conjunto de test representativo y de mayor tamaño, y considerar alternativas entrenadas con más datos.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chennab28/movie-review-sentiment-classifier
- Dataset complementario: https://huggingface.co/datasets/chennab28/movie-review-sentiment
- Demo en Gradio Space: https://huggingface.co/spaces/chennab28/movie-review-sentiment-demo
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
- Resultados de búsqueda web: no se encontraron enlaces relevantes al modelo (los resultados devueltos corresponden a noticias sin relación con la ficha).
