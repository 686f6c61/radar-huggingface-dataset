# sagepond/embedding-small

## Resumen

`sagepond/embedding-small` es un modelo de embeddings de frases desarrollado por SAGE POND, orientado a la experimentación con representaciones semánticas en luganda, una de las lenguas bantúes con menos recursos en el ecosistema de IA. El modelo codifica una frase de entrada en un vector de 3.072 dimensiones, normalizado con L2, que puede compararse con otros vectores mediante similitud de coseno o utilizarse como representación en aplicaciones semánticas posteriores.

Se trata de un codificador de frases basado en Transformer (12 capas, hidden size 768, 16 cabezas de atención) con aproximadamente 125,7 millones de parámetros según los pesos en safetensors del repositorio. Fue entrenado sobre frases (no sobre pares pregunta-respuesta ni datos conversacionales), por lo que debe tratarse como un modelo de embeddings a nivel de frase y no como un modelo de pregunta-respuesta o conversacional.

Su relevancia radica en ser un punto de partida accesible y de licencia permisiva (Apache 2.0) para quienes experimenten con representaciones en luganda, un idioma muy poco atendido por los modelos multilingües dominantes. No obstante, es una publicación de investigación con evaluación limitada: los resultados proceden de un benchmark propio de unas 282 muestras y no son comparables directamente con otros datasets de STS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de frases basado en Transformer (encoder) |
| Parámetros totales | 125.686.272 (125,7 M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | 600 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Luganda (lug) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado de Transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un codificador Transformer con 12 capas, hidden size de 768, 16 cabezas de atención y dimensión feed-forward de 3.072. Utiliza un tokenizador SentencePiece con vocabulario de 40.000 tokens. El pipeline de generación de embeddings es el siguiente: se suman embeddings posicionales aprendidos a los embeddings de token, la secuencia se procesa por el encoder Transformer, se aplica mean pooling con máscara (masked mean pooling) y la representación resultante se proyecta al espacio final de 3.072 dimensiones. Los embeddings de salida están normalizados con L2, lo que permite calcular la similitud de coseno directamente como producto escalar.

Sobre el entrenamiento, la información disponible indica que se usaron datos a nivel de frase del dataset `sagepond/luganda` y que el modelo fue evaluado sobre `sagepond/sts`. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del corpus ni sobre el uso de técnicas como RLHF o DPO (no aplicables en este caso, al tratarse de un modelo de embeddings y no generativo).

## Capacidades

- Generación de embeddings de frase de 3.072 dimensiones, L2-normalizados, para texto en luganda.
- Similitud semántica entre frases mediante producto escalar (equivalente a similitud de coseno al estar normalizados los vectores).
- Búsqueda semántica sobre corpus en luganda (indexando documentos y consultas con el mismo modelo).
- Agrupamiento (clustering) de frases y detección de duplicados o casi-duplicados.
- Recuperación basada en embeddings (retrieval) para experimentos posteriores.
- Procesamiento de secuencias de hasta 600 tokens de longitud.

No es un modelo generativo: no produce texto, no realiza razonamiento, no genera código y no soporta tool calling, function calling ni flujos agénticos. No tiene capacidades de visión ni audio.

## Casos de uso

- Búsqueda semántica en luganda: se indexan documentos del corpus como vectores y las consultas del usuario se codifican con el mismo modelo; la similitud de coseno permite recuperar los pasajes más relevantes. Es adecuado porque el modelo está específicamente entrenado con frases en luganda, donde los modelos multilingües genéricos suelen rendir peor.
- Detección de duplicados y casi-duplicados: al codificar frases en lotes y comparar vectores, se pueden identificar textos repetidos o muy similares en corpus de noticias, transcripciones o datos de entrenamiento en luganda.
- Agrupamiento temático de frases: los embeddings pueden alimentar algoritmos de clustering (k-means, HDBSCAN) para organizar corpus de luganda por temas sin etiquetado manual.
- Recuperación aumentada (RAG) experimental en luganda: como componente de retrieval para prototipos que combinen embeddings con un modelo generativo posterior, aunque la calidad dependerá de la evaluación específica sobre el corpus.
- Análisis lingüístico y NLP de bajo recursos: punto de partida para investigadores que estudien representaciones semánticas en lenguas bantúes y quieran hacer fine-tuning o comparar arquitecturas.
- Construcción de datasets de similitud semántica: el modelo puede usarse para generar candidatas de pares de frases similares que luego se anoten manualmente, acelerando la creación de benchmarks en luganda.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el benchmark propio SAGE POND STS (`sagepond/sts`, aproximadamente 282 muestras). No son resultados verificados y no deben compararse directamente con otros datasets de STS por diferencias en selección de datos, dificultad y protocolo de evaluación.

| Métrica | Valor (escala 0-100) |
|---|---:|
| Correlación de Pearson | 34,06 |
| Correlación de Spearman | 47,91 |
| STS score (media aritmética de ambas) | **40,98** |

El propio autor advierte que, aunque el conjunto de evaluación es compacto, contiene pares de frases notablemente difíciles, y que un conjunto de tamaño similar pero más fácil podría producir puntuaciones sustancialmente distintas. No hay comparaciones publicadas con otros modelos de embeddings en luganda.

## Requisitos de hardware

- VRAM estimada para inferencia: con 125,7 millones de parámetros en fp32, el modelo ocupa en torno a 0,5 GB de pesos; en inferencia con CPU o GPU, unos 1-2 GB de memoria son suficientes incluyendo activaciones para lotes pequeños. No hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU de consumo es más que suficiente (por ejemplo, una RTX 3060 con 8 GB o superior). También es plenamente viable la ejecución en CPU.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU moderna, incluso de gama baja; el tamaño del repositorio es de 0,5 GB.
- Opciones de despliegue: la librería base es Transformers (con `trust_remote_code=True` por el código personalizado). No hay menciones a compatibilidad con vLLM, TGI, llama.cpp u Ollama; dado que es un modelo de embeddings con código custom, lo más fiable es usar `transformers` directamente o envolverlo en un servicio propio (por ejemplo, con FastAPI) o con la librería `sentence-transformers` si se adapta el pooling.
- Latencia y throughput: no disponibles; al ser un encoder de 125 M de parámetros con 600 tokens de longitud máxima, se esperan latencias bajas incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No existen modelos de embeddings dedicados a luganda ampliamente establecidos con los que comparar directamente. Como referencia aproximada frente a alternativas multilingües de uso habitual en tareas de similitud de frases:

| Modelo | Parámetros | Dimension embedding | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| sagepond/embedding-small | 125,7 M | 3.072 | Luganda | Apache 2.0 | Específico para luganda; evaluación propia de 282 muestras; código custom |
| paraphrase-multilingual-mpnet-base-v2 | ~278 M | 768 | 50+ idiomas (cobertura de luganda limitada) | Apache 2.0 | Ampliamente evaluado en STS multilingüe (xSTS); soporte de luganda no garantizado |
| multilingual-e5-base | ~278 M | 768 | ~100 idiomas | MIT | Fuerte en retrieval multilingüe; rendimiento en luganda no documentado |
| LaBSE | ~471 M | 768 | 109 idiomas (incluye luganda) | Apache 2.0 | La referencia multilingüe más usada para lenguas de bajo recursos; evaluable en luganda |

La ventaja de `sagepond/embedding-small` es su entrenamiento específico en luganda; la desventaja es que carece de evaluación independiente y amplia frente a alternativas como LaBSE, que sí incluye luganda entre sus 109 idiomas.

## Limitaciones y advertencias

- El benchmark de evaluación contiene aproximadamente 282 muestras, por lo que las puntuaciones tienen una cobertura estadística limitada y no evidencian rendimiento generalizado en todos los dominios del luganda.
- El modelo fue entrenado con frases, no con pares pregunta-respuesta; no debe asumirse que esté optimizado para retrieval de tipo pregunta-a-pasaje sin una evaluación específica de la tarea.
- La longitud máxima de entrada es de 600 tokens; los documentos largos deben dividirse en fragmentos y codificarse por separado.
- Los resultados de STS no son comparables directamente con los de otros datasets o protocolos de evaluación sin verificar diferencias de selección de datos, dificultad, puntuación y preprocesamiento.
- El repositorio utiliza código personalizado de Transformers, lo que obliga a cargar el modelo con `trust_remote_code=True`; esto implica ejecutar código de terceros y requiere revisión previa en entornos de producción sensibles.
- No hay información publicada sobre sesgos del modelo, riesgo de alucinación (no aplicable al no ser generativo) ni rendimiento fuera del benchmark propio.
- La licencia Apache 2.0 es permisiva y permite uso comercial, pero no hay garantías de calidad ni soporte; el modelo se presenta explícitamente como ejemplo de investigación.
- Al tratarse de un modelo de embeddings, los resultados de similitud son señales relativas para ranking o comparación, no puntuaciones absolutas de similitud semántica calibradas.
- El modelo tiene 0 descargas registradas, lo que indica ausencia de validación por parte de la comunidad hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sagepond/embedding-small
- Dataset de entrenamiento: https://huggingface.co/datasets/sagepond/luganda
- Dataset de evaluación (SAGE POND STS): https://huggingface.co/datasets/sagepond/sts
- Paper, repositorio de código adicional o demos: no disponibles en la información proporcionada.
