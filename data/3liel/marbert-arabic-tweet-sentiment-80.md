# 3liel/marbert-arabic-tweet-sentiment-80

## Resumen

El modelo `marbert-arabic-tweet-sentiment-80` es un ajuste fino (fine-tuning) del modelo preentrenado `UBC-NLP/MARBERTv2`, especializado en el análisis de sentimiento de tuits en árabe. Lo ha desarrollado el usuario `3liel` y está diseñado para clasificar texto breve en árabe, concretamente tuits, en dos categorías: positivo y negativo. Utiliza la arquitectura BERT, con un total de 162,8 millones de parámetros, lo que lo sitúa en la gama de los modelos BERT-base.

El modelo resuelve la tarea de clasificación de sentimiento en árabe, un idioma con múltiples variantes dialectales que suponen un reto para los modelos entrenados únicamente en árabe moderno estándar (MSA). Al estar basado en MARBERTv2, que se preentrena con una gran cantidad de tuits en árabe dialectal, hereda la capacidad de comprender registros informales y dialectales propios de las redes sociales. Su relevancia radica en ofrecer una opción de clasificación de sentimiento para árabe con un tamaño contenido y una integración sencilla mediante la librería `transformers`.

La ficha técnica disponible es escasa: la model card está generada automáticamente y no detalla el dataset de entrenamiento ni el proceso de evaluación más allá de las métricas básicas. Aun así, los resultados reportados en el conjunto de evaluación indican una accuracy de 0,7377 y un F1 de 0,7420, que son datos útiles para valorar su rendimiento inicial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 162.843.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de MARBERTv2, no declarado en la model card) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | Arabe (incluye arabe dialectal y MSA) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT de transformer encoder-only, con 12 capas ocultas, 768 dimensiones de embedding y 12 cabezales de atencion, lo que da un total de 162,8 millones de parametros. Hereda la arquitectura y los pesos preentrenados de `UBC-NLP/MARBERTv2`, que a su vez es una version mejorada de MARBERT, entrenado sobre 1.000 millones de tuits en arabe (incluyendo arabe dialectal y MSA) para la tarea de modelado de lenguaje enmascarado. Esta base preentrenada es clave porque permite al modelo comprender la variabilidad dialectal del arabe en redes sociales, algo que los modelos entrenados solo en MSA no logran.

El ajuste fino se realizo con un dataset no publicado, segun indica la model card ("unknown dataset"). Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, batch size de entrenamiento de 16 con acumulacion de gradientes de 4 pasos (batch efectivo de 64), 10 epocas, scheduler lineal con 200 pasos de warmup y factor de suavizado de etiquetas de 0,1. El optimizador fue AdamW con betas (0.9, 0.999). No se menciona el uso de tecnicas como RLHF o DPO; se trata de un ajuste fino supervisado clasico para clasificacion de texto. La perdida de validacion final fue de 0,9767 con accuracy de 0,7377 y F1 de 0,7420 sobre el conjunto de evaluacion.

## Capacidades

- Clasificacion de sentimiento binario (positivo/negativo) en tuits en arabe, incluyendo variedades dialectales.
- Procesamiento de texto corto y coloquial, gracias a su preentrenamiento en tuits reales.
- Integracion con el pipeline de `transformers` para `text-classification`, lo que facilita su uso en produccion.
- Compatible con la inferencia mediante `text-embeddings-inference` y con endpoints compatibles, segun las tags del repositorio.
- No soporta tool calling, agentes, vision ni audio; es un modelo puramente de clasificacion de texto.

## Casos de uso

- Analisis de opinion en redes sociales: una empresa puede monitorizar la percepcion de su marca procesando flujos de tuits en arabe y clasificandolos como positivos o negativos, lo que permite detectar crisis de reputacion en tiempo real.
- Atencion al cliente automatizada: integrado en un sistema de tickets, puede priorizar los mensajes de clientes insatisfechos (sentimiento negativo) para que un agente humano los atienda primero.
- Investigacion de mercado: analistas pueden medir la reaccion del publico arabe ante el lanzamiento de un producto o una campana publicitaria a partir de la proporcion de tuits positivos y negativos.
- Moderacion de contenido: en plataformas sociales, puede ayudar a detectar interacciones toxicas o negativas en comentarios y tuits en arabe, aunque su alcance es solo de sentimiento, no de toxicidad.
- Analisis politico y social: periodistas e investigadores pueden estudiar la opinion publica sobre eventos politicos o sociales en paises arabes procesando grandes volumenes de tuits.
- Sistemas de recomendacion: en plataformas de contenido, el sentimiento de los comentarios de los usuarios puede servir como senal para ajustar recomendaciones o destacar contenido bien valorado.

## Benchmarks y rendimiento

La model card no incluye una tabla de benchmarks comparativos con otros modelos. El apartado `model-index` esta vacio. Los unicos datos disponibles son los resultados de evaluacion reportados en la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,9767 |
| Accuracy | 0,7377 |
| F1 | 0,7420 |

La evolucion durante el entrenamiento muestra que el mejor punto se alcanzo en la epoca 5, con accuracy de 0,75 y F1 de 0,7541. No se han publicado comparaciones con otros modelos de analisis de sentimiento en arabe.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo BERT-base con 162,8 millones de parametros, la inferencia en FP32 requiere aproximadamente 650 MB solo para los pesos. Con activaciones y overhead, se recomienda al menos 2 GB de VRAM para inferencia comoda en GPU.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060, RTX 4090 o A10 funcionan sin problemas. Para despliegue con alto throughput, una A100 o H100 es adecuada, aunque no es necesaria para este tamano de modelo.
- Cabe en GPU de consumo: si, cualquier GPU moderna de consumo con 4 GB o mas puede ejecutarlo. Tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: compatible con `transformers` (pipeline de clasificacion), `text-embeddings-inference`, y por extension con servidores como vLLM o TGI si se convierte a los formatos adecuados. Dado su tamano, tambien se puede servir con llama.cpp si se convierte a GGUF, aunque no se proporcionan pesos en ese formato.
- Latencia y throughput: no se publican datos especificos. En una GPU moderna (por ejemplo, RTX 3090), la inferencia de un solo tuit deberia completarse en pocos milisegundos. En CPU, la latencia puede ser de decenas de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados para este modelo frente a alternativas. Sin embargo, se puede comparar a nivel de caracteristicas con otros modelos de analisis de sentimiento en arabe:

| Modelo | Base | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| marbert-arabic-tweet-sentiment-80 | MARBERTv2 | 162,8 M | 512 | no disponible | Ajuste fino para sentimiento binario en tuits |
| iMeshal/arabic-sentiment-classifier-marbert | MARBERTv2 | 162,8 M | 512 | no disponible | Clasificacion binaria positivo/negativo con demo en vivo |
| UBC-NLP/MARBERTv2 | - | 162,8 M | 512 | no disponible | Modelo base preentrenado, no clasifica por si solo |
| ARBERT | - | 162,8 M | 512 | no disponible | Modelo preentrenado en MSA, menos adecuado para dialectal |

La comparativa directa en rendimiento no es posible sin benchmarks compartidos. Ambos modelos ajustados (el de `3liel` y el de `iMeshal`) parten de la misma base y tienen el mismo tamano, por lo que su rendimiento deberia ser similar, aunque depende del dataset de ajuste fino, que no se ha publicado en ninguno de los dos casos.

## Limitaciones y advertencias

- El dataset de entrenamiento no se ha publicado, lo que impide evaluar posibles sesgos o la representatividad de los datos. No se puede determinar que variedades dialectales del arabe estan mejor representadas.
- La licencia no esta especificada, por lo que el uso comercial conlleva incertidumbre legal. Se recomienda contactar con el autor antes de usarlo en produccion.
- La longitud de contexto esta limitada a 512 tokens, lo que es suficiente para tuits pero no para documentos largos.
- Las metricas reportadas (accuracy 0,7377, F1 0,7420) son modestas y pueden no ser suficientes para aplicaciones donde se requiera alta precision. No se ha comparado con otros modelos en los mismos datos.
- Al ser un modelo de clasificacion binaria, no distingue matices de sentimiento (neutral, mixto) y puede tener dificultades con sarcasmo o ironia, comunes en redes sociales.
- No se han publicado analisis de sesgos de genero, religion o politica, que son relevantes en el contenido de redes sociales en arabe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3liel/marbert-arabic-tweet-sentiment-80
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Repositorio GitHub de MARBERT (UBC-NLP): https://github.com/UBC-NLP/marbert
- Modelo alternativo de sentimiento en arabe basado en MARBERT: https://huggingface.co/iMeshal/arabic-sentiment-classifier-marbert
- Articulo sobre deteccion de spam y sentimiento en tuits arabes con MARBERT: https://arxiv.org/pdf/2606.25495
