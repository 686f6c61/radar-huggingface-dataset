# nattly/nattlyandrahma-sentiment-model

## Resumen

nattlyandrahma-sentiment-model es un clasificador binario de sentimiento (positivo/negativo) obtenido mediante fine-tuning de `distilbert-base-uncased`. Lo firman Namugwanya Rahmah y Nattabi Joanitah bajo la cuenta de Hugging Face `nattly`, y se publicó en octubre de 2026 con el pipeline `text-classification`. El modelo resuelve una tarea acotada y muy extendida: asignar una etiqueta de polaridad a una reseña en inglés, con una salida de probabilidad por clase.

Técnicamente es un encoder transformer de 6 capas y 66.955.010 parámetros, la versión destilada de BERT-base, con una ventana posicional máxima de 512 tokens. El repositorio ocupa 0,3 GB y solo distribuye pesos en `safetensors`. El autor declara 0,91 de accuracy y 0,91 de F1 sobre su conjunto de test, aunque no documenta el tamaño ni la procedencia de ese conjunto más allá de indicar que se trata de reseñas de películas en inglés.

Su relevancia práctica es la de un modelo de referencia ligero: cabe en CPU, se entrena y se despliega con coste mínimo y sirve como línea base para tareas de análisis de opinión en inglés. No obstante, la ausencia de licencia declarada, la falta de validación comunitaria (0 descargas, 0 likes en el momento de la ficha) y un conjunto de entrenamiento sin especificar limitan seriamente su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base): 6 capas, 768 dimensiones ocultas, 12 cabezas de atención |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite posicional heredado de `distilbert-base-uncased`) |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un modelo PyTorch estándar admite cuantización dinámica int8 con las herramientas de PyTorch |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | WordPiece de BERT (vocabulario de 30.522 tokens, `uncased`) |
| Etiquetas de salida | 2 clases: positivo / negativo |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de 6 capas obtenido por destilación del conocimiento de BERT-base (12 capas). Conserva la mitad de las capas y aproximadamente el 40 % de los parámetros del modelo profesor, y en este caso se ha afianzado con una cabeza de clasificación de dos salidas sobre el token `[CLS]`. La entrada se tokeniza con WordPiece en minúsculas y se trunca a 512 tokens, de modo que cualquier documento más largo requiere truncamiento o segmentación previa.

El autor no detalla el proceso de fine-tuning: no se especifican el número de ejemplos, el número de épocas, la tasa de aprendizaje, el esquema de validación ni si hubo balanceo de clases. La model card únicamente menciona que el conjunto de datos se denomina igual que el modelo (`nattlyandrahma-sentiment-model`), lo que apunta a un dataset propio de reseñas cinematográficas en inglés, y que el dominio de entrenamiento se limita a ese género textual. No hay indicios de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tamaño. Tampoco se documenta ninguna innovación técnica: es un fine-tuning estándar sobre un checkpoint público.

## Capacidades

- Clasificación binaria de sentimiento en inglés: devuelve una etiqueta (POSITIVE/NEGATIVE) y una puntuación de confianza por predicción.
- Análisis de opinión sobre textos cortos y medios: reseñas, comentarios y valoraciones de hasta 512 tokens.
- Inferencia muy rápida y económica: 66,9 M de parámetros permiten ejecución en CPU con latencias de milisegundos por muestra.
- Integración directa con la API `pipeline("text-classification")` de Transformers.
- Capacidad de ajuste adicional (fine-tuning) sobre dominios propios, dado el reducido coste computacional del modelo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni flujos de agentes.
- No procesa imágenes ni audio.
- No dispone de modo "thinking" ni de salida de cadena de razonamiento.

## Casos de uso

- Clasificación por lotes de reseñas de productos o películas: el modelo procesa miles de textos en minutos en una sola CPU y permite construir agregados de opinión por producto sin infraestructura GPU.
- Moderación de comentarios en foros en inglés: filtrar automáticamente comentarios de polaridad negativa extrema para revisión humana, usando la puntuación de confianza como umbral de derivación.
- Enrutamiento de tickets de soporte: clasificar el tono de un correo entrante (satisfecho/frustrado) y dirigirlo a un equipo distinto según el resultado.
- Etiquetado asistido para construir datasets: preanotar grandes volúmenes de reseñas y reservar la revisión humana solo para las predicciones de baja confianza.
- Monitorización de reputación de marca: analizar menciones en inglés en redes y prensa para calcular un índice diario de sentimiento.
- Línea base en experimentos de NLP: punto de comparación rápido y reproducible antes de invertir en modelos mayores, dado su tamaño y su coste de entrenamiento.
- Detección de insatisfacción en encuestas abiertas: extraer la polaridad de respuestas de texto libre y cruzarla con la puntuación numérica del NPS.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Accuracy (conjunto de test del autor) | 0,91 |
| F1 (conjunto de test del autor) | 0,91 |
| MMLU / HumanEval / GSM8K | no aplicable (modelo de clasificación, no generativo) |

Los únicos datos publicados son accuracy y F1 sobre un conjunto de test no descrito. No se indica el número de ejemplos, la distribución de clases ni el método de partición, por lo que las cifras no son verificables de forma independiente. La model card incluye además tres predicciones de ejemplo:

| Resena | Etiqueta predicha | Puntuacion |
|---|---|---|
| This movie was fantastic! The acting was brilliant. | POSITIVE | 0,9974 |
| Terrible experience, I want my money back. | NEGATIVE | 0,9901 |
| The movie was okay, but the story was predictable. | NEGATIVE | 0,9989 |

El tercer ejemplo es revelador: una opinión mixta ("estaba bien, pero predecible") se clasifica como negativa con 0,9989 de confianza, lo que sugiere un modelo mal calibrado y sin clase neutra.

## Requisitos de hardware

- VRAM estimada: 0,27 GB en fp32, unos 0,14 GB en fp16 y unos 0,07 GB en int8. En la práctica, la memoria necesaria la determina el tamaño del lote, no los pesos.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 1 GB de memoria libre es suficiente. Una RTX 4090 o una A100 están sobredimensionadas para este modelo y solo tienen sentido para procesar lotes muy grandes.
- Cabe holgadamente en GPU de consumo: GTX 1050, RTX 2060, RTX 3060, e incluso en iGPU y en CPU exclusivamente.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportación a ONNX Runtime, TorchScript, contenedores FastAPI o TorchServe. vLLM y TGI no están orientados a clasificación de secuencias y no son la vía natural; llama.cpp/Ollama tampoco ofrecen soporte fiable para esta arquitectura de clasificación.
- Latencia y throughput: no disponibles como cifra publicada. Por el tamaño del modelo, se espera del orden de milisegundos por muestra en CPU moderna con lotes pequeños, pero es una estimación, no un dato medido del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nattly/nattlyandrahma-sentiment-model | 66,9 M | 512 tokens | en | no disponible | Hugging Face, sin validación comunitaria |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | en | Apache 2.0 | Hugging Face, ampliamente usado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | en | no verificada en la información disponible | Hugging Face, con tres clases (neg/neu/pos) |
| RoBERTa-base fine-tuned para sentimiento | ~125 M | 512 tokens | en | según checkpoint base | Hugging Face |

La comparación relevante es con el DistilBERT ajustado sobre SST-2, que parte de la misma arquitectura y ofrece una licencia permisiva explícita, además de una comunidad de uso mucho mayor. Frente a las alternativas basadas en RoBERTa, este modelo tiene la mitad de parámetros y, por tanto, menor coste, a cambio de menor capacidad de representación y de una única salida binaria sin clase neutra. No se han publicado resultados de benchmarks comparativos en la información disponible, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Dominio restringido: el autor declara que se entrenó solo con reseñas de películas en inglés; el rendimiento en otros dominios (productos, finanzas, soporte técnico) es desconocido.
- Sarcasmo e ironía: la model card reconoce explícitamente que el modelo tiene dificultades con el sarcasmo, una limitación habitual en análisis de sentimiento y documentada también en herramientas clásicas como NLTK.
- Texto mixto luganda/inglés: el autor señala problemas con entradas que combinan ambos idiomas, frecuentes en el contexto ugandés del equipo. En la práctica, cualquier texto no inglés queda fuera de su ámbito.
- Solo dos clases: no existe etiqueta neutra, de modo que las opiniones mixtas o tibias se fuerzan hacia positivo o negativo con confianza alta, como muestra el ejemplo de la propia model card.
- Calibración dudosa: puntuaciones superiores a 0,99 en casos ambiguos indican sobreconfianza; no se recomienda usar la probabilidad directamente como umbral sin recalibración (por ejemplo, temperature scaling) sobre datos propios.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial. Conviene contactar con los autores o tratar el modelo como no apto para producción hasta que se aclare.
- Dataset no documentado: se desconoce el tamaño, la procedencia, la distribución de clases y si hubo deduplicación entre train y test, lo que impide descartar fuga de datos y hace inválidas las métricas declaradas como referencia externa.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la ficha; no existen evaluaciones independientes.
- Sesgos: no se han publicado análisis de sesgo. Al entrenarse sobre reseñas cinematográficas, puede heredar sesgos de género, raza o nacionalidad presentes en ese corpus.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de predicciones erróneas con confianza alta, funcionalmente equivalente para un pipeline automatizado.
- Truncamiento a 512 tokens: documentos largos pierden información sin aviso; es necesario trocear y agregar predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nattly/nattlyandrahma-sentiment-model
- Perfil del autor y otros modelos: https://huggingface.co/nattly/models
- Búsqueda de modelos de análisis de sentimiento en Hugging Face: https://huggingface.co/models?search=sentiment-analysis
- Recopilación de modelos y APIs gratuitas de análisis de sentimiento (2026): https://www.edenai.co/post/top-free-sentiment-analysis-tools-apis-and-open-source-models
- Índice de sentimiento sobre modelos de IA en Reddit: https://modelsentiment.com/
- Tutorial de análisis de sentimiento con NLTK (referencia de línea base): https://www.geeksforgeeks.org/nlp/sentiment-analysis-using-nltk/
