# fse/paranmt-300

## Resumen

ParaNMT-300 es un conjunto de embeddings de palabras estáticos de 300 dimensiones para 77.224 palabras del inglés, derivado del artículo «Pushing the Limits of Paraphrastic Sentence Embeddings with Millions of Machine Translations» (Wieting y Gimpel, 2018), que introduce el corpus de paráfrasis ParaNMT-50M. No es un modelo generativo ni un transformer: son vectores de palabra en formato gensim `KeyedVectors` que, combinados con técnicas de composición como CBOW promediado, SIF o uSIF, producen representaciones de frase.

El repositorio de HuggingFace no contiene el modelo original, sino una redistribución de los vectores publicados por John Wieting en su página de la Universidad Carnegie Mellon, empaquetados para la librería `fse` (Fast Sentence Embeddings) de Oliver Borchers. Su interés actual es acotado pero real: sirve como baseline ligero de sentence embeddings, como componente de búsqueda semántica de bajo coste y como referencia histórica frente a los modelos tipo Sentence-BERT.

La relevancia práctica está en su coste: 93 MB en `float32`, ejecutable en CPU sin GPU, con opción de mapear los vectores en memoria en lugar de cargarlos en RAM. La contrapartida es que la licencia no está declarada en la fuente original, lo que condiciona cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings de palabras estáticos (gensim `KeyedVectors`); composición a nivel de frase mediante promediado CBOW, SIF o uSIF en `fse` |
| Parámetros totales | 23.167.200 valores `float32` (77.224 palabras × 300 dimensiones), 93 MB |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo ni tiene atención; representa frases completas por composición de vectores) |
| Tipos de cuantización | no disponible; los vectores se distribuyen en `float32` (carga en RAM o `mmap`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | unknown (la página original de CMU no declara licencia; el repo indica explícitamente «none is given here») |
| Formato de pesos | gensim: `paranmt-300.model` (vocabulario y metadatos) + `paranmt-300.model.vectors.npy` (`float32`) |

## Arquitectura y entrenamiento

El artefacto es una matriz de embeddings de palabras de 77.224 × 300 valores `float32`, almacenada como `KeyedVectors` de gensim con los vectores en un `.npy` separado de 93 MB. Los vectores provienen del trabajo de Wieting y Gimpel sobre ParaNMT-50M, un corpus de millones de pares de paráfrasis generados por traducción automática (retrotraducción de un corpus paralelo). Según la model card, los vectores se entrenaron sobre ese corpus para capturar similitud semántica y paráfrasis en inglés.

El paquete `fse` añade la capa de composición: convierte vectores de palabra en vectores de frase mediante promediado CBOW, SIF (Smooth Inverse Frequency) o uSIF. SIF y uSIF requieren una fase de `train()` sobre el corpus objetivo para estimar las frecuencias de las palabras y el componente principal que se resta a la media ponderada; es decir, el vector de frase no está precalculado, se ajusta al dominio de uso. No hay información disponible sobre hiperparámetros de entrenamiento, tamaño exacto del corpus, función de pérdida ni si se aplicaron técnicas de post-procesado en los vectores redistribuidos.

## Capacidades

- Representación distribuida de palabras en inglés para 77.224 entradas de vocabulario.
- Cálculo de similitud semántica palabra-palabra mediante coseno.
- Construcción de vectores de frase con tres estrategias: promediado CBOW, SIF y uSIF.
- Soporte de `mmap` (`Vectors.from_pretrained("paranmt-300", mmap="r")`) para no cargar los 93 MB en RAM.
- Integración directa con el ecosistema gensim y con `numpy`, lo que permite exportar los vectores a FAISS, Annoy o cualquier índice vectorial.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un modelo de agente.
- Monolingüe (inglés); no hay capacidades multilingües.
- Capacidad especial: ninguna más allá de la composición SIF/uSIF; no hay modo «thinking», ni decodificación especulativa, ni atención lineal.

## Casos de uso

- **Baseline de sentence embeddings en investigación**: usar SIF/uSIF sobre estos vectores como referencia inferior en experimentos de similitud semántica de frases, para cuantificar la ganancia real de modelos tipo Sentence-BERT en el mismo conjunto de evaluación (por ejemplo, STS Benchmark, que el repositorio de `fse` publica para todos sus conjuntos de vectores).
- **Búsqueda semántica ligera en CPU**: indexar unos miles de documentos en FAISS con vectores de frase SIF y servir consultas sin GPU, con un coste de memoria de decenas de MB y latencia de milisegundos por consulta en un solo hilo.
- **Deduplicación y clustering de titulares**: agrupar noticias o titulares casi idénticos calculando similitud coseno entre vectores de frase; adecuado porque el vocabulario de 77.224 palabras cubre el inglés periodístico habitual y el coste por documento es una media ponderada de 300 dimensiones.
- **Filtrado de calidad de pares de paráfrasis**: puntuar pares de frases generados por aumentación de datos o por traducción automática y descartar los que caen por debajo de un umbral de similitud, como paso previo a entrenar un modelo mayor.
- **Clasificación de texto con pocas etiquetas**: usar el vector de frase como característica de entrada de una regresión logística o un SVM para tareas de moderación o enrutado de tickets, cuando no se dispone de GPU y el volumen permite evitar un transformer.
- **Expansión de consultas en un buscador interno**: recuperar los términos del vocabulario más próximos a la consulta del usuario y añadirlos a la búsqueda léxica (BM25) para mejorar el recall en documentación técnica en inglés.
- **Detección de similitud para moderación de comentarios**: marcar comentarios duplicados o casi duplicados comparando su vector SIF contra un índice de comentarios previos, con umbral calibrado sobre una muestra etiquetada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de `fse` en GitHub indica que publica el STS benchmark de todos los conjuntos de vectores de la organización, pero no se han proporcionado las cifras correspondientes a `paranmt-300`, por lo que no se incluyen valores numéricos.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. Los vectores ocupan 93 MB en `float32`.
- RAM: aproximadamente 93 MB para la matriz más la sobrecarga de gensim (vocabulario y metadatos); el modo `mmap="r"` reduce la residencia en memoria a las páginas efectivamente accedidas.
- GPU: no necesaria. Cualquier GPU (RTX 4090, A100, H100) queda sobredimensionada para este artefacto; su uso solo tendría sentido si se integra en un pipeline mayor que ya ocupa la GPU.
- GPU de consumo: no aplica; el modelo cabe en cualquier máquina, incluidos portátiles y contenedores con 512 MB de RAM.
- Despliegue: `fse` (requiere `gensim` y `numpy`) es la vía nativa; alternativamente, cargar el `.npy` directamente con `numpy` y servir los vectores desde un índice FAISS o Annoy.
- Latencia y throughput: no disponibles en la información proporcionada. La composición SIF/uSIF añade una fase de `train()` sobre el corpus objetivo, cuyo coste depende del número de frases y no está documentado.

## Comparativa con modelos similares

| Modelo | Dimensiones | Vocabulario | Idioma | Licencia | Composición de frase |
|---|---|---|---|---|---|
| ParaNMT-300 (este) | 300 | 77.224 | en | unknown | SIF/uSIF/CBOW vía `fse` (requiere entrenamiento en el corpus) |
| GloVe 6B.300d | 300 | 400.000 | en | dominio público (según documentación de Stanford) | promediado simple o SIF vía `fse` |
| word2vec GoogleNews | 300 | 3.000.000 | en | Apache-2.0 (según documentación de Google) | promediado simple o SIF vía `fse` |
| fastText wiki.en | 300 | 2.000.000 (aproximado) | en | CC BY-SA 3.0 (según documentación de Facebook) | promediado simple; subpalabras para OOV |

Los tamaños de vocabulario de las alternativas provienen de su documentación pública y pueden variar según la distribución consultada. Frente a ellas, ParaNMT-300 destaca por estar entrenado específicamente sobre pares de paráfrasis, lo que suele favorecer tareas de similitud de frases, pero pierde cobertura de vocabulario y no ofrece subpalabras, por lo que cualquier palabra fuera de las 77.224 queda sin representación. No se dispone de cifras comparativas de rendimiento en benchmarks para esta ficha.

## Limitaciones y advertencias

- **Licencia no declarada**: la página original de CMU no especifica licencia y el repositorio indica explícitamente que no se otorga ninguna. Cualquier uso comercial o redistribución implica riesgo legal y requiere contactar con el autor original.
- **Sesgos del corpus**: los vectores se entrenaron sobre paráfrasis generadas por sistemas de traducción automática; los sesgos de género, dominio y estilo de esos sistemas y del corpus fuente quedan codificados en el espacio vectorial sin ningún filtro documentado.
- **Sin contexto ni desambiguación**: al ser embeddings estáticos, cada palabra tiene un único vector; no se resuelve la polisemia ni se modela el orden de las palabras. La representación de frase por promediado ignora la sintaxis y la negación.
- **Vocabulario cerrado**: 77.224 palabras, sin subpalabras ni mecanismo para términos fuera de vocabulario. Errores tipográficos, neologismos, nombres propios y terminología técnica quedarán sin vector.
- **Monolingüe**: solo inglés; no apto para contenido en castellano ni para tareas multilingües.
- **No es un modelo generativo**: no puede responder preguntas, resumir, razonar ni ejecutar llamadas a herramientas; cualquier caso de uso generativo requiere otro modelo.
- **Dependencia del corpus objetivo en SIF/uSIF**: el vector de frase se ajusta con `train()` sobre las frases de uso, de modo que los resultados varían según el dominio y el volumen de texto empleado; no hay un vector de frase preentrenado listo para usar.
- **Rendimiento no verificado**: al no haber cifras de benchmarks en la información disponible, no debe asumirse una calidad concreta en STS ni en tareas downstream sin una evaluación propia.
- **Repositorio sin tracción**: 0 descargas y 0 «likes» en el momento de la consulta; conviene verificar la integridad de los ficheros antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/paranmt-300
- Página de John Wieting en CMU (origen de los vectores): https://www.cs.cmu.edu/~jwieting/
- Artículo «ParaNMT-50M: Pushing the Limits of Paraphrastic Sentence Embeddings with Millions of Machine Translations»: https://www.cs.cmu.edu/~jwieting/wieting2017Millions.pdf
- Repositorio de Fast Sentence Embeddings (`fse`): https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentación de gensim (`KeyedVectors`): https://radimrehurek.com/gensim/
- Perfil del mantenedor de `fse`, Dr. Oliver Borchers: https://www.drborchers.com/
