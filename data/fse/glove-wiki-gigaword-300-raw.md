# fse/glove-wiki-gigaword-300-raw

## Resumen

`fse/glove-wiki-gigaword-300-raw` es un modelo de embeddings estáticos de palabras empaquetado en el formato del proyecto fse (Fast Sentence Embeddings). No es un modelo generativo ni un transformer: es una tabla de 400.000 filas por 300 dimensiones en float32 que contiene los vectores GloVe entrenados sobre el corpus Wiki Gigaword, convertidos desde el modelo gensim `fse/glove-wiki-gigaword-300`. El autor del repositorio es el usuario `fse`, que publica esta conversión como artefacto de referencia para su propia librería.

La variante `-raw` aplica la operación más simple posible sobre el texto de entrada: la media de las filas correspondientes a los tokens, normalizada a longitud unitaria. No incorpora ponderación por frecuencia (SIF) ni eliminación de componentes principales, a diferencia de otras variantes del mismo espacio de embeddings. Esto la convierte en la línea base contra la que se miden las demás configuraciones del ecosistema fse.

Su relevancia es acotada pero clara: sirve como referencia reproducible para tareas de similitud semántica a nivel de frase con un coste computacional mínimo (una media y una normalización), y como punto de comparación documentado frente a métodos más elaborados. La model card reporta un Pearson x100 de 44,46 sobre las 1.379 parejas de test de STS-B con float32, frente a 69,22 de la variante SIF-10, una diferencia que cuantifica de forma explícita lo que aporta la ponderación por frecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos de palabras (tabla de consulta); pooling por media de tokens y normalización L2 |
| Parametros totales | 123.356.475 (400.000 filas x 300 dimensiones + normalización) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sin atención; procesa secuencias de tokens sin ventana definida) |
| Tipos de cuantizacion | float32 (por defecto), float16, int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | safetensors (librería `fse`, requiere fse >= 2.0) |
| Vocabulario | 400.000 filas |
| Dimension de embedding | 300 (float32) |
| Tokenizador | `fse_words@1` |
| Huella del modelo | `xxh3-128:4e3dee37a6fccb1d36ab6f9b5bc272c2` |
| Tamano del fichero | 486.157.506 bytes (~0,45 GB) |
| Modelo base | `fse/glove-wiki-gigaword-300` (revision `4e5ad402664236b85be45a0d107b95259ba8a909`) |

## Arquitectura y entrenamiento

El modelo no entrena nada en esta conversión: es un artefacto derivado que empaqueta los vectores GloVe de 300 dimensiones del modelo gensim original en el formato de fse 2.0. La arquitectura subyacente es la de GloVe (Global Vectors), que aprende representaciones vectoriales a partir de matrices de coocurrencia global de palabras sobre un corpus, en este caso Wiki Gigaword. Cada palabra del vocabulario de 400.000 entradas queda representada por un vector denso de 300 componentes float32.

La capa de "modelo" que añade fse es puramente determinista: tokeniza el texto con `fse_words@1`, recupera las filas correspondientes de la tabla, calcula la media aritmética y normaliza el vector resultante a norma unitaria (paso `normalize@1`). No hay capas de atención, ni transformer, ni mecanismo de contexto posicional; el orden de las palabras solo influye a través del conjunto de tokens presentes. La model card documenta explícitamente que la comparación controlada de STS-B usa el preprocesado NLTK del notebook 1.x mediante una vista de tokenizador externo sobre esta misma tabla, y que la fila de tokenizador por defecto aplica `fse_words@1` sobre texto crudo.

## Capacidades

- Extracción de features a nivel de frase y de palabra: genera un vector de 300 dimensiones por texto de entrada.
- Similitud semántica entre frases mediante coseno (vectores normalizados a norma unitaria).
- Búsqueda por similitud y recuperación densa sobre corpus en inglés.
- Agrupamiento (clustering) y clasificación sobre representaciones fijas, sin ajuste fino del modelo.
- Soporte de cuantización a float16 e int8 con cálculo interno en float32.
- Capacidades multilingües: no disponibles; el modelo solo cubre inglés.
- Tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión y audio: no disponibles. No es un modelo generativo.

## Casos de uso

- Línea base para evaluación de embeddings: usar esta variante `-raw` como referencia inferior en experimentos de similitud semántica antes de probar SIF u otros métodos, tal como la propia model card plantea (44,46 frente a 69,22 en STS-B).
- Deduplicación y clustering de titulares o frases cortas en inglés: la media normalizada de vectores GloVe permite agrupar textos con solapamiento léxico-semántico con un coste de inferencia prácticamente nulo (una media y una normalización por frase).
- Búsqueda semántica ligera en corpus pequeños o medianos en inglés: indexar frases como vectores de 300 dimensiones y recuperar por coseno, con un fichero de pesos de 0,45 GB que cabe en memoria RAM convencional.
- Filtrado previo en pipelines de recuperación: usar los vectores como primera etapa de cribado barato antes de un reranker neuronal más costoso, reduciendo el número de candidatos que llegan al modelo grande.
- Clasificación de texto con modelos lineales: congelar los embeddings de frase como features de entrada para un clasificador logístico o SVM, útil cuando no hay presupuesto de GPU o se necesita un baseline reproducible.
- Detección de similitud y near-duplicates en datasets de entrenamiento: comparar pares de frases con coseno para identificar ejemplos redundantes antes de un proceso de curación de datos.
- Enseñanza y experimentación: ilustrar las limitaciones de los embeddings estáticos frente a los contextuales, usando la diferencia documentada entre `-raw` y SIF-10 como caso de estudio medible.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (float32, tokenizador por defecto `fse_words@1`) | 44,46410 |
| STS-B Pearson x100 (float32, preprocesado NLTK del notebook 1.x) | 44,46410 |
| Diferencia frente a mismo método en float32 (puntos) | +0,00000 |
| Recall@10 frente a mismo método en float32 | 1,000000 |
| STS-B Pearson x100 de la variante SIF-10 float32 (referencia en la misma model card) | 69,22434 |
| Bytes del fichero del modelo | 486.157.506 |

La comparación controlada emplea las 1.379 parejas de test de STS-B. El Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demás, excluye la propia fila y resuelve empates por índice de fila. La model card no formula ninguna afirmación sobre velocidad de carga o de inferencia. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en float32 (fichero de 486 MB); aproximadamente 0,24 GB en float16 e inferior en int8, aunque fse calcula internamente en float32.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo también funciona en CPU sin penalización significativa, dado que la operación es una media y una normalización.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y en sistemas embebidos con suficiente RAM.
- Opciones de despliegue: la librería `fse` (>= 2.0) es la vía documentada (`fse.Encoder.from_pretrained`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de embeddings estáticos.
- Latencia y throughput: no disponibles en la información proporcionada. La model card declara explícitamente que no formula ninguna afirmación de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | STS-B Pearson x100 | Licencia |
|---|---|---:|---|---:|---|
| `fse/glove-wiki-gigaword-300-raw` (este) | 123,4 M | 300 | No aplica | 44,46 | PDDL |
| `fse/glove-wiki-gigaword-300` con SIF-10 (misma familia) | 123,4 M | 300 | No aplica | 69,22 | PDDL |
| Modelos de embeddings contextuales tipo sentence-transformers | No disponible | Típicamente 384-1024 | Típicamente 256-512 tokens | No disponible en esta información | Variable |

La comparación directa solo es posible dentro de la propia familia fse, ya que la model card únicamente reporta el resultado de SIF-10 sobre la misma tabla. No se dispone de datos de benchmarks de alternativas contextuales en la información proporcionada, por lo que no se ofrece una comparación numérica con ellas.

## Limitaciones y advertencias

- Modelo estático sin contexto: el orden de las palabras no se modela; "el perro muerde al hombre" y "el hombre muerde al perro" producen el mismo vector.
- Rendimiento bajo en similitud semántica de frases: 44,46 de Pearson x100 en STS-B, muy por debajo de los 69,22 de la variante SIF-10 y de los modelos contextuales modernos.
- Solo inglés: no cubre otros idiomas, a pesar de que el corpus de origen (Wiki Gigaword) es multilingüe en parte.
- Cobertura de vocabulario limitada a 400.000 entradas; las palabras fuera de vocabulario (OOV) no tienen representación propia y el comportamiento del tokenizador `fse_words@1` ante ellas no se detalla en la model card.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de similitudes espurias por polisemia y por el efecto de la media sobre frases largas.
- Licencia PDDL: permite uso comercial y modificación, pero conviene revisar los términos de la Public Domain Dedication and License 1.0 y la atribución a los autores de GloVe; la licencia Apache-2.0 de la implementación de GloVe es independiente de los términos de los vectores.
- Dependencia de la librería `fse` >= 2.0; no es un modelo cargable con `transformers`, `sentence-transformers` ni `gensim` directamente en el formato publicado.
- Sin métricas de latencia ni throughput publicadas; cualquier estimación de rendimiento en producción debe medirse sobre el hardware objetivo.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere poca validación externa de la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-300-raw
- Modelo base en Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-300
- Repositorio de fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Licencia PDDL 1.0: https://opendatacommons.org/licenses/pddl/1-0/
- Repositorio de GloVe (Stanford NLP): https://github.com/stanfordnlp/GloVe
