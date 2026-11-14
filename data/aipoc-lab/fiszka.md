# aipoc-lab/fiszka

## Resumen

Fiszka 0.3 es una red neuronal pequeña de clasificación multietiqueta de temas de inteligencia artificial, desarrollada por el laboratorio unipersonal aipoc-lab (Creative AI Driven PM). El modelo recibe el título y el resumen de un artículo científico o una noticia sobre IA y devuelve entre cero y tres temas principales de un conjunto cerrado de 17 categorías (modelos de lenguaje, agentes, seguridad, robótica, negocio, política y regulación, entre otros). No es un modelo generativo: es una cabeza de clasificación construida sobre los embeddings de EmbeddingGemma 2.

Técnicamente, Fiszka es una red de 252.194 pesos que opera sobre vectores de 768 dimensiones producidos por EmbeddingGemma 2 (270 millones de parámetros). La red en sí se ejecuta en microsegundos en CPU; el coste computacional dominante es el cálculo del embedding. La arquitectura combina una torre MLP (768 → 256 → 128 → 64 → 17 con ReLU) con una ruta lineal directa 768 → 17, y aplica una sigmoide por tema con umbral de decisión de 0,5 y un máximo de tres etiquetas por texto.

Su relevancia radica en que es un ejemplo reproducible de destilación de etiquetas desde modelos docentes abiertos (DeepSeek V4.1 Flash 1017 y NVIDIA Nemotron 3.5 Lightning) hacia un clasificador minúsculo, con dataset de entrenamiento público, script de entrenamiento reproducible y licencia Apache 2.0. El autor reporta que el modelo iguala el F1 de sus propios docentes en el conjunto de evaluación, lo que sugiere que el cuello de botella es la calidad de las etiquetas y no el tamaño de la red.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP sobre embeddings de EmbeddingGemma 2 (768 → 256 → 128 → 64 → 17 con ReLU, más ruta lineal directa 768 → 17; sigmoide por etiqueta) |
| Parámetros totales | 252.194 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; el texto de entrada se trunca a los primeros 4.000 caracteres |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (disposición `torch.nn.Linear`, `out_features × in_features`) |

## Arquitectura y entrenamiento

La arquitectura es una red feed-forward de cuatro capas sobre vectores de 768 dimensiones generados por EmbeddingGemma 2. La torre oculta (768 → 256 → 128 → 64 → 17) usa activación ReLU, y se añade una conexión lineal directa de 768 a 17 que actúa como una regresión logística interna que las capas ocultas corrigen. La salida es una probabilidad independiente por tema mediante sigmoide; se seleccionan los temas con probabilidad ≥ 0,5, limitados a los tres más confiados. El preprocesado elimina la cabecera de anuncio de arXiv y el HTML, construye la entrada como `title: {title} | text: {primeros 4.000 caracteres}` y descarta textos de menos de 200 caracteres.

El entrenamiento usó 9.968 textos recogidos entre agosto y octubre de 2026: 8.241 resúmenes de arXiv cs.AI y 1.727 entradas de blogs corporativos y noticias de IA. Las etiquetas provienen de dos modelos docentes abiertos, DeepSeek V4.1 Flash 1017 (licencia MIT) y NVIDIA Nemotron 3.5 Lightning (licencia OpenMDW 1.1); un tema solo se considera etiqueta si ambos docentes lo asignaron. Se emplearon pesos de clase para temas raros, y la parada temprana y el umbral se seleccionaron sobre el 20 % más reciente de los datos (1.994 textos). El dataset completo y el script `train.py` (numpy + PyTorch, CPU) son públicos y reproducen exactamente los pesos publicados. Una variante 0.4 con lectura directa de 5.000 palabras (337.211 pesos) no superó a la 0.3 de forma consistente y fue descartada.

## Capacidades

- Clasificación multietiqueta de temas de IA: asigna de cero a tres temas entre 17 posibles (`llm`, `ml`, `evaluation`, `agents`, `multimodal`, `security`, `reinforcement-learning`, `rag`, `robotics`, `hardware`, `tooling`, `healthcare`, `business`, `automation`, `policy`, `open-source`, `education`).
- Salida de probabilidad por cada uno de los 17 temas, no solo la etiqueta elegida.
- Procesamiento por lotes: acepta líneas JSON `{"title": ..., "text": ...}` por stdin y devuelve una línea JSON por texto.
- Entrada alternativa mediante vectores precalculados de 768 dimensiones (`--vectors file.npy`), lo que permite omitir Ollama si ya se dispone de los embeddings.
- Distinción entre tema principal y herramienta mencionada: un artículo que usa ChatGPT para corregir ensayos se etiqueta como `education`, no como `llm`.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en inglés.
- No soporta tool calling, agentes, generación de texto, razonamiento multi-paso ni modalidades distintas de texto.

## Casos de uso

- Etiquetado automático de resúmenes de arXiv: el modelo clasifica abstracts cs.AI en temas como `agents`, `rag` o `reinforcement-learning`, útil para construir índices temáticos o sistemas de recomendación de papers. El autor reporta un recall de 0,803 frente a las categorías oficiales de arXiv en 2.522 papers.
- Curación de boletines y agregadores de noticias de IA: dado el título y el cuerpo de una noticia, devuelve los temas principales para enrutarla a la sección correspondiente (negocio, política, investigación) sin intervención manual.
- Enriquecimiento de pipelines internos de documentación: integrado como paso de clasificación tras la extracción de texto, añade metadatos temáticos a artículos y entradas de blog para búsqueda facetada.
- Filtrado de fuentes en sistemas de vigilancia tecnológica: clasificar flujos continuos de publicaciones para detectar automáticamente contenido sobre `security`, `policy` o `healthcare` y priorizar su revisión.
- Clasificación de bajo coste en CPU: al requerir solo numpy y la biblioteca estándar para la red (y Ollama únicamente para el embedding), puede desplegarse en entornos sin GPU o en el borde, siempre que se acepte el coste del embedding de EmbeddingGemma 2.
- Etiquetado de grandes volúmenes por lotes: el modo de entrada por líneas JSON permite procesar miles de textos en una sola ejecución, con la posibilidad de precalcular los embeddings una vez y reutilizarlos con `--vectors`.
- Base para experimentos de destilación de etiquetas: al ser el dataset y el script de entrenamiento públicos, sirve como referencia reproducible para estudiar cómo un clasificador minúsculo aproxima las etiquetas de modelos docentes mayores.

## Benchmarks y rendimiento

Evaluación contra etiquetas asignadas manualmente por el autor sobre textos no vistos durante el entrenamiento:

| Conjunto de prueba | Textos | Precisión | Recall | F1 |
|---|---:|---:|---:|---:|
| Conjunto etiquetado a mano 1 | 75 | 0,458 | 0,575 | 0,510 |
| Conjunto etiquetado a mano 2 (textos más recientes) | 83 | 0,538 | 0,571 | 0,554 |
| Papers de arXiv frente a categorías oficiales de arXiv | 2.522 | no disponible | 0,803 | no disponible |

Comparaciones reportadas por el autor:

| Sistema | Conjunto | F1 |
|---|---|---:|
| Docentes (ambos, DeepSeek V4.1 Flash 1017 + Nemotron 3.5 Lightning) | Conjunto 2 | 0,508 |
| DeepSeek V4.1 Flash 1017 en solitario | Conjunto 2 | 0,559 |
| Gemini 3.5 Flash Lite (etiquetado interno previo, 13 temas) | Conjunto 1 | 0,342 |
| Fiszka 0.3 | Conjunto 1 | 0,510 |
| Fiszka 0.4 (variante descartada, 337.211 pesos) | Conjunto 1 / 2 | 0,486 / 0,580 |

El autor advierte que los conjuntos de prueba son pequeños (75 y 83 textos) y que diferencias por debajo de 0,03 de F1 son ruido. La comparación con Gemini no es concluyente porque sus etiquetas se generaron con un prompt propio y una lista anterior de 13 temas sin `business` ni `policy`.

## Requisitos de hardware

- VRAM para la red: insignificante; 252.194 pesos ocupan aproximadamente 1 MB en fp32. La red se ejecuta en microsegundos en CPU.
- VRAM para el embedding: el coste real lo determina EmbeddingGemma 2 (270 millones de parámetros). En fp16 requiere del orden de 0,5 GB solo para pesos, más memoria para activaciones y el tokenizador; cabe holgadamente en cualquier GPU de consumo con 4 GB o más.
- GPU recomendadas: no disponibles datos específicos del autor; por tamaño del embedding, una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. La ejecución en CPU es viable, con el embedding como cuello de botella.
- Cabe en GPU de consumo: sí, cualquier GPU con memoria suficiente para EmbeddingGemma 2; también funciona enteramente en CPU.
- Opciones de despliegue: Ollama (`ollama pull embeddinggemma-2:270m`) para el embedding, más `fiszka.py` con numpy y la biblioteca estándar de Python. Los pesos también se cargan con la librería `safetensors`. No se documentan integraciones con vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles cifras concretas; el autor indica que la red tarda microsegundos por texto en CPU y que el cálculo del embedding es la parte lenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|---|
| Fiszka 0.3 | Clasificador multietiqueta sobre embeddings | 252.194 (red) + EmbeddingGemma 2 (270 M) | Truncado a 4.000 caracteres | en | Apache 2.0 | F1 0,510 / 0,554 en conjuntos manuales |
| DeepSeek V4.1 Flash 1017 (docente) | LLM generativo usado como etiquetador | no disponible | no disponible | no disponible | MIT | F1 0,559 en conjunto 2 como etiquetador |
| NVIDIA Nemotron 3.5 Lightning (docente) | LLM generativo usado como etiquetador | no disponible | no disponible | no disponible | OpenMDW 1.1 | F1 0,508 en conjunto 2 junto a DeepSeek |
| Gemini 3.5 Flash Lite (referencia interna) | LLM generativo usado como etiquetador | no disponible | no disponible | no disponible | propietaria | F1 0,342 en conjunto 1 con 13 temas |

No se dispone de comparación con clasificadores dedicados de temas de IA de tamaño similar; el autor solo compara contra los modelos docentes y contra su flujo previo con Gemini.

## Limitaciones y advertencias

- Un solo anotador etiquetó los conjuntos de prueba; su consistencia interna es baja en los temas `llm`, `evaluation`, `agents` y `open-source`, lo que limita la fiabilidad de las métricas en esas categorías.
- Los conjuntos de prueba son pequeños (75 y 83 textos); diferencias inferiores a 0,03 de F1 son ruido estadístico.
- El tema `llm` se detecta por debajo de lo deseable: el segundo docente rara vez lo asignó, por lo que el modelo hereda ese sesgo.
- El modelo solo admite inglés; no hay evidencia de comportamiento en otros idiomas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con precisión y recall en torno a 0,46-0,58 en los conjuntos manuales.
- La entrada se trunca a los primeros 4.000 caracteres y los textos de menos de 200 caracteres no reciben temas, lo que puede dejar sin clasificar notas breves.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de EmbeddingGemma 2, cuyas condiciones de uso deben verificarse por separado.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- El autor documenta que el límite de calidad está en las etiquetas de los docentes, no en el tamaño de la red; mejoras adicionales requerirían mejor supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aipoc-lab/fiszka
- Dataset de entrenamiento: https://huggingface.co/datasets/aipoc-lab/fiszka-dataset
- Demo en vivo: https://aipoclab.creativeaidrivenpm.com/en/fiszka
- Página del laboratorio: https://aipoclab.creativeaidrivenpm.com/
- Creative AI Driven PM: https://creativeaidrivenpm.com/
