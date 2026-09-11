# AllanC23/setfit-mpnet-sentiment

## Resumen

SetFit-mpnet-sentiment es un clasificador de texto binario para análisis de sentimiento, publicado por el usuario AllanC23 en HuggingFace. No es un modelo generativo: se trata de un pipeline SetFit compuesto por un sentence transformer basado en MPNet (~109 millones de parámetros) afinado con aprendizaje contrastivo y una cabeza de clasificación de regresión logística entrenada sobre las representaciones resultantes. El modelo resuelve tareas de clasificación de sentimiento (positivo/negativo) en 2 clases con una longitud máxima de secuencia de 512 tokens.

Su relevancia radica en el enfoque SetFit, descrito en el paper "Efficient Few-Shot Learning Without Prompts": permite obtener clasificadores competitivos con muy pocas etiquetas por clase, sin necesidad de ingeniería de prompts ni de modelos generativos grandes. Esto lo hace atractivo para escenarios con datos etiquetados escasos y requisitos de latencia baja.

El repositorio ocupa 0,4 GB, las descargas y likes registrados son 0, y la model card no especifica dataset de entrenamiento, idioma ni licencia. Se distribuye en formato safetensors y es compatible con Text Embeddings Inference y con endpoints alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: sentence transformer MPNet (encoder transformer) + cabeza LogisticRegression |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (via libreria setfit) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera se afina un sentence transformer (encoder MPNet) mediante aprendizaje contrastivo, generando pares de texto de la misma clase como positivos y de clases distintas como negativos. En la segunda se extraen los embeddings del encoder afinado y se entrena una cabeza de clasificación de regresión logística (scikit-learn) sobre ellos. La inferencia final consiste en codificar el texto con el encoder y aplicar el clasificador lineal.

El número de clases es 2. La model card no especifica el dataset de entrenamiento, el número de pares contrastivos ni el volumen de ejemplos por clase. Tampoco documenta si hubo una fase adicional de RLHF o DPO (no aplica en un clasificador de este tipo). La innovación técnica relevante es el propio método SetFit, que reduce el coste de anotación al permitir entrenamiento few-shot. Las versiones de framework declaradas son SetFit 1.1.3, Sentence Transformers 5.7.0, Transformers 4.57.6, PyTorch 2.13.0+cpu, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto binaria (2 clases), orientada a análisis de sentimiento.
- Codificación de frases en embeddings mediante el sentence transformer MPNet subyacente.
- Inferencia sobre secuencias de hasta 512 tokens.
- Compatibilidad con `SetFitModel` de la librería setfit y con `sentence-transformers`.
- Compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`) y con endpoints alojados (`endpoints_compatible`).
- Ejecución en CPU, dado que el entrenamiento de referencia se realizó en PyTorch 2.13.0+cpu.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica cada reseña como positiva o negativa en una sola pasada, con un coste computacional bajo al ser un encoder de ~109 M de parámetros.
- Clasificación de feedback de clientes: permite etiquetar encuestas, correos o formularios para priorizar casos negativos en equipos de soporte.
- Moderación de comentarios: filtrado automático de contenido negativo o tóxico antes de revisión humana, aprovechando la ventana de 512 tokens para comentarios largos.
- Etiquetado masivo en pipelines ETL: al ser un modelo pequeño y compatible con Text Embeddings Inference, se puede integrar en procesos batch que procesen millones de documentos en CPU o GPU modesta.
- Filtrado previo de datasets: clasificar grandes corpus para seleccionar subconjuntos con polaridad conocida antes de entrenar otros modelos.
- Análisis de opinión en redes sociales: procesamiento de publicaciones cortas para medir tendencia de sentimiento por periodo o temática.
- Prototipado rápido con pocos datos: gracias al enfoque few-shot de SetFit, sirve como línea base cuando solo se dispone de unas decenas de ejemplos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la métrica `accuracy` en los metadatos, pero no incluye ningún valor numérico ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan aproximadamente 0,44 GB; con activaciones y batch pequeño la inferencia cabe en torno a 1 GB de VRAM.
- En fp16 el peso se reduce a ~0,22 GB; en int8 a ~0,11 GB, aunque no se documentan cuantizaciones oficiales para este repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU, ya que el modelo de referencia se entrenó con PyTorch CPU.
- Cabe sin problema en GPU de consumo: GTX 1650, RTX 3060, RTX 4090 u otras similares, e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: librería `setfit`, `sentence-transformers`, Text Embeddings Inference (según el tag del repositorio) y endpoints gestionados de HuggingFace.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 109 M de parámetros, la latencia esperada es baja, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Datos publicados |
|---|---|---|---|---|---|
| AllanC23/setfit-mpnet-sentiment | 109,5 M | 512 tokens | SetFit (encoder + LogReg) | No disponible | Sin benchmarks |
| Sentence transformer MPNet base (sin cabeza) | ~109 M | 512 tokens | Encoder de embeddings | Depende del checkpoint base | No aplica |
| Clasificador de sentimiento basado en DistilBERT afinado | ~66 M | 512 tokens | Encoder + cabeza softmax | Depende del checkpoint | No disponible |
| Clasificador de sentimiento basado en RoBERTa-base afinado | ~125 M | 512 tokens | Encoder + cabeza softmax | Depende del checkpoint | No disponible |

Comparado con un encoder afinado de extremo a extremo, SetFit destaca por requerir menos ejemplos etiquetados y por separar la representación (encoder) de la decisión (regresión logística), lo que facilita reentrenar la cabeza sin tocar el encoder. Frente a modelos generativos zero-shot, la ventaja es el coste de inferencia muy inferior, a cambio de una flexibilidad menor. No se dispone de datos de rendimiento comparativos para este checkpoint concreto.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos; al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos demográficos, de dominio o de género.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas fuera de la distribución de entrenamiento.
- El modelo solo maneja 2 clases; no cubre granularidad de sentimiento (por ejemplo, neutro o intensidad).
- Se desconoce el idioma o idiomas de entrenamiento, lo que impide garantizar un rendimiento multilingüe.
- El límite de 512 tokens implica que textos más largos deben truncarse o segmentarse.
- La licencia no está especificada, por lo que el uso comercial queda sin cobertura legal explícita.
- No se documentan el dataset de entrenamiento, el número de ejemplos por clase ni el proceso de evaluación, lo que dificulta la reproducibilidad.
- El modelo tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Al ser un clasificador basado en embeddings, requiere que la cabeza de regresión logística se cargue junto con el encoder; usar únicamente el sentence transformer no reproduce la clasificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AllanC23/setfit-mpnet-sentiment
- Repositorio de SetFit: https://github.com/huggingface/setfit
- Paper "Efficient Few-Shot Learning Without Prompts": https://arxiv.org/abs/2209.11055
- Blogpost de SetFit: https://huggingface.co/blog/setfit
