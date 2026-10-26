# fse/paragram-300-ws353

## Resumen

`fse/paragram-300-ws353` es un conjunto de embeddings de palabras estáticos de 300 dimensiones para inglés, publicado originalmente por John Wieting (Carnegie Mellon University) y redistribuido en HuggingFace por el proyecto fse (Fast Sentence Embeddings) de Oliver Borchers. No es un modelo generativo ni un transformer: es una matriz de vectores de palabra al estilo word2vec/Paragram, con un vocabulario de 1.703.756 palabras y 300 componentes por vector, lo que supone 511.126.800 valores float32 (unos 2,0 GB).

El interés del repositorio no está en el modelo en sí, sino en el empaquetado: los vectores se distribuyen en formato gensim `KeyedVectors` y son consumibles directamente por la librería `fse`, que los convierte en vectores de frase mediante media CBOW, SIF (Smooth Inverse Frequency) o uSIF. Eso permite construir un baseline de similitud semántica de frases en CPU, sin GPU y sin infraestructura de inferencia, algo útil para búsqueda semántica, clustering de textos o extracción de características en pipelines clásicos de machine learning.

La relevancia es, por tanto, la de un componente ligero y determinista para tareas de representación textual en inglés, no la de un asistente conversacional. Dos avisos importantes: la licencia no está declarada (el autor original no la especifica) y la model card no aporta métricas de rendimiento más allá de indicar que los vectores están ajustados sobre WordSim-353.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings de palabras estáticos (Paragram, Wieting et al. 2015); no es un transformer ni un modelo generativo |
| Parámetros totales | 511.126.800 valores float32 (1.703.756 palabras × 300 dimensiones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no hay ventana de contexto. La composición a nivel de frase se realiza con media CBOW, SIF o uSIF sobre los vectores de las palabras |
| Tipos de cuantización | No disponible; los pesos se publican en float32 y el autor no documenta versiones cuantizadas |
| Idiomas soportados | Inglés (en) |
| Licencia | unknown (no declarada; la página original de CMU no indica licencia) |
| Formato de pesos | gensim `KeyedVectors` (`paragram-300-ws353.model`) + matriz NumPy float32 (`paragram-300-ws353.model.vectors.npy`) |
| Dimensiones del vector | 300 |
| Tamaño del vocabulario | 1.703.756 palabras |
| Tamaño de la matriz de vectores | 2,0 GB (2,2 GB de repositorio completo) |
| Librería de carga | `fse` (basada en gensim) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2022-03-02 |
| Última actualización | 2026-10-26 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Paragram descrita por Wieting, Bansal, Gimpel, Livescu y Roth en "From Paraphrase Database to Compositional Paraphrase Model and Back" (2015). Se trata de vectores de palabra densos de 300 dimensiones, en la línea de word2vec, pero derivados del uso de pares de paráfrasis: la representación se ajusta para que palabras que aparecen como paráfrasis entre sí queden próximas en el espacio vectorial. La variante aquí publicada está ajustada sobre el conjunto WordSim-353, de ahí el sufijo `ws353` del identificador.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del corpus, el vocabulario fuente ni si se aplicaron pasos posteriores de alineación o poda. Tampoco se documentan hiperparámetros (ventana, negativo sampling, epochs) ni un proceso de RLHF/DPO, que no tiene sentido en este tipo de modelo. La innovación práctica que aporta el repositorio es el empaquetado para `fse`: la librería convierte los vectores de palabra en vectores de frase mediante CBOW promedio, SIF y uSIF, e incluye la opción `mmap="r"` para mapear en memoria la matriz de 2,0 GB en lugar de cargarla completa en RAM.

## Capacidades

- Representación de palabras en inglés: un vector de 300 dimensiones por cada una de las 1.703.756 entradas del vocabulario.
- Representación de frases y documentos cortos mediante composición ponderada (CBOW, SIF, uSIF) a través de `fse`.
- Cálculo de similitud semántica entre palabras, frases y textos cortos (coseno sobre vectores normalizados o sin normalizar).
- Agrupamiento y clasificación de textos: los vectores sirven como características de entrada para modelos clásicos (regresión logística, SVM, k-means).
- Búsqueda semántica aproximada sobre colecciones en inglés mediante índice vectorial externo.
- Ejecución en CPU: no requiere GPU ni framework de deep learning para inferir.
- Serialización sencilla: la matriz puede exportarse a NumPy y cargarse desde cualquier lenguaje.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.

## Casos de uso

- Búsqueda semántica en inglés sobre catálogos o documentación: se vectorizan las frases de los documentos y la consulta del usuario con SIF, y se recuperan los vecinos más próximos por similitud coseno. Es adecuado porque el coste por consulta es de milisegundos en CPU y no exige infraestructura de GPU.
- Deduplicación y near-duplicate detection: agrupar titulares, preguntas de soporte o descripciones de producto con un umbral de coseno sobre el vector de frase permite eliminar duplicados sin entrenar un modelo supervisado.
- Clustering exploratorio de reseñas o tickets: reducir los vectores SIF de 300 dimensiones con UMAP o PCA y aplicar k-means para descubrir temas recurrentes en un corpus en inglés.
- Baseline en investigación sobre similitud semántica textual: sirve como referencia rápida y reproducible en experimentos de STS antes de pasar a modelos tipo sentence-transformers, con la ventaja de que el resultado es determinista y no depende de prompts.
- Extracción de características para modelos tabulares: concatenar el vector de frase a variables estructuradas (longitud, categoría, canal) en un pipeline de scikit-learn para clasificación de tickets o detección de spam.
- Recuperación previa en pipelines RAG de bajo presupuesto: usar los vectores como primera etapa de recall léxico-semántico en inglés y delegar la reordenación a un cross-encoder más caro.
- Análisis de similitud entre términos en estudios lingüísticos o lexicográficos: consultar los vecinos más cercanos de una palabra del vocabulario para explorar relaciones de paráfrasis.
- Prototipado rápido sin GPU: cualquier prueba de concepto que necesite embeddings en inglés puede ejecutarse en un portátil gracias al modo `mmap`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que los vectores están ajustados sobre WordSim-353 y remite al repositorio de `fse` para el benchmark de STS de todos los conjuntos de vectores de la organización, sin incluir cifras en esta ficha. No se han encontrado tampoco métricas de latencia o throughput documentadas.

## Requisitos de hardware

- VRAM/RAM: 2,0 GB para la matriz de vectores en float32 si se carga completa; con `Vectors.from_pretrained(..., mmap="r")` la memoria residente se reduce al conjunto de páginas realmente accedidas.
- GPU: no necesaria. Cualquier GPU con 2-3 GB de memoria libre podría alojar la matriz, pero no aporta ventaja frente a CPU para esta carga de trabajo.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3060, RTX 4090) y en equipos sin GPU dedicada; el cuello de botella es el ancho de banda de memoria y la tokenización, no el cómputo.
- Despliegue: `pip install fse` y carga con gensim; también es posible exportar la matriz `.npy` y servirla con NumPy, FAISS o cualquier índice vectorial externo. No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Por la naturaleza de la operación (una búsqueda de cada token en el vocabulario y un promedio ponderado), la latencia esperada por frase es del orden de microsegundos a pocos milisegundos, pero no se aporta medición verificada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada. La comparación siguiente se limita a características estructurales verificables del modelo descrito; el resto de celdas se dejan como no disponibles para no inventar cifras.

| Modelo | Tipo | Dimensiones | Vocabulario | Contexto | Licencia |
|---|---|---|---|---|---|
| `fse/paragram-300-ws353` | Embeddings estáticos Paragram | 300 | 1.703.756 | No aplica | unknown |
| word2vec (GoogleNews) | Embeddings estáticos | no disponible | no disponible | No aplica | no disponible |
| GloVe | Embeddings estáticos | no disponible | no disponible | No aplica | no disponible |
| FastText | Embeddings estáticos con subpalabras | no disponible | no disponible | No aplica | no disponible |
| Sentence-transformers (familia) | Transformer encoder con pooling | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde preguntas, no razona y no soporta tool calling ni agentes. Cualquier caso de uso conversacional requiere otro modelo.
- Solo cubre inglés; el rendimiento en otros idiomas, incluido el castellano, no está documentado y no cabe esperarlo.
- El vector de frase se obtiene por promedio ponderado de vectores de palabra, por lo que se pierde el orden sintáctico y la negación o las estructuras condicionales pueden representarse de forma engañosa.
- Riesgo de alucinación en sentido generativo: no aplica; sin embargo, la similitud coseno puede producir falsos positivos semánticos (antónimos y términos relacionados temáticamente aparecen próximos) y debe calibrarse con umbrales validados en el dominio de uso.
- El manejo de palabras fuera de vocabulario (OOV) no está documentado en la información disponible; al no tratarse de embeddings con subpalabras, los términos ausentes quedarán sin representación salvo que se aplique una estrategia propia.
- Sesgos: no se han publicado auditorías de sesgo para este conjunto de vectores. Al derivarse de una base de paráfrasis y de un ajuste sobre WordSim-353, puede heredar sesgos léxicos y culturales de esas fuentes.
- Licencia `unknown`: no se concede permiso explícito de uso comercial. Es un riesgo legal relevante para producción; conviene contactar con el autor original o con el mantenedor del repositorio antes de desplegarlo en un producto.
- El repositorio tiene 0 descargas y 0 likes, y la última actualización es de 2026-10-26; no hay señales de mantenimiento activo ni de soporte.
- La calidad sobre WordSim-353 no se traduce necesariamente en buen rendimiento en tareas de STS de frases completas; el benchmark del proyecto `fse` debería consultarse antes de adoptarlo.
- Los resultados de búsqueda web obtenidos no son pertinentes: apuntan al Fonds Social Européen (FSE+), un organismo público francés sin relación con este modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fse/paragram-300-ws353
- Página de John Wieting en Carnegie Mellon University (origen de los vectores): https://www.cs.cmu.edu/~jwieting/
- Artículo de referencia (Wieting et al., 2015): https://aclanthology.org/Q15-1025/
- Repositorio de Fast Sentence Embeddings (fse), con el benchmark STS: https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentación de gensim (formato `KeyedVectors`): https://radimrehurek.com/gensim/
- Sitio del mantenedor de fse, Oliver Borchers: https://www.drborchers.com/
- Resultados de búsqueda no relacionados (FSE+: fondos sociales europeos): https://fse.gouv.fr/ , https://european-social-fund-plus.ec.europa.eu/fr/quest-ce-que-le-fse
