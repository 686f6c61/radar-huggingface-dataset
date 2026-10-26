# fse/paragram-25

## Resumen

Paragram-25 es un conjunto de embeddings de palabras estáticos de 25 dimensiones para 99.958 palabras en inglés, distribuido por la organización fse (mantenida por el Dr. Oliver Borchers) en formato gensim `KeyedVectors` y empaquetado para la librería Fast Sentence Embeddings (fse). Los vectores provienen del artículo "Towards Universal Paraphrastic Sentence Embeddings" de Wieting, Bansal, Gimpel y Livescu (ICLR 2016), que introdujo los embeddings Paragram entrenados sobre pares de paráfrasis, y se publicaron originalmente en la página personal de John Wieting en la Universidad Carnegie Mellon.

No es un modelo de lenguaje generativo ni un transformer: es una tabla de vectores de palabra que la librería fse convierte en vectores de frase mediante promediado CBOW, SIF o uSIF. Su interés actual es práctico: con 25 dimensiones y unos 10 MB de pesos, permite construir representaciones de frases en CPU, en entornos con memoria muy limitada o como línea base ligera en experimentos de similitud semántica.

La relevancia es, por tanto, acotada y de nicho: sirve como referencia histórica de los embeddings paráfrásticos y como componente ultraligero en pipelines de similitud textual. El repositorio no declara licencia (la página original de CMU tampoco la especifica), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings de palabra estáticos (tabla de vectores tipo word2vec/Paragram); no es un transformer ni una red profunda en tiempo de inferencia |
| Parametros totales | 2.498.950 valores float32 (99.958 palabras × 25 dimensiones) |
| Parametros activos | no aplica (no es un modelo MoE; no hay activación por token) |
| Longitud de contexto | no aplica: no existe ventana de atención. El vector de frase se obtiene agregando (CBOW, SIF o uSIF) los vectores de los tokens de la frase, sin límite fijo documentado |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en float32 sin variantes cuantizadas publicadas |
| Idiomas soportados | inglés (en) |
| Licencia | unknown (la página de origen en CMU no declara licencia; el repositorio redistribuye sin licencia) |
| Formato de pesos | gensim `KeyedVectors` en un único fichero `paragram-25.model` (vocabulario, metadatos y matriz de 99.958 × 25 float32); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El objeto distribuido es una matriz de embeddings de palabra de tipo estático: una única representación densa de 25 dimensiones por cada una de las 99.958 entradas del vocabulario inglés. La familia Paragram se entrena, según el artículo de referencia, sobre pares de paráfrasis, de modo que palabras que aparecen en contextos parafrásticos quedan próximas en el espacio vectorial. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de ajuste tipo RLHF o DPO; esos datos deben consultarse en el paper original.

La capa que aporta funcionalidad de frase es la librería fse: a partir de los vectores de palabra construye un vector de frase mediante tres estrategias configurables —promediado tipo CBOW, SIF (Smooth Inverse Frequency, con ponderación por frecuencia y eliminación de la primera componente principal) y uSIF—. La innovación técnica destacable aquí es la compacidad extrema (25 dimensiones frente a las 300 habituales en embeddings de la época) y la posibilidad de mapear el fichero en memoria con `mmap="r"` en lugar de cargarlo completo en RAM.

## Capacidades

- Representación de palabras en inglés: un vector de 25 dimensiones por palabra del vocabulario de 99.958 entradas.
- Representación de frases y oraciones mediante agregación CBOW, SIF o uSIF a través de la librería fse.
- Cálculo de similitud semántica entre frases (producto escalar o coseno) para tareas de paráfrasis y duplicidad.
- Extracción de características para modelos downstream clásicos (regresión logística, SVM, clustering) sin GPU.
- Carga con mapeo de memoria (`Vectors.from_pretrained("paragram-25", mmap="r")`) para entornos con RAM muy restringida.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe: nula; únicamente inglés.

## Casos de uso

- Detección de paráfrasis y duplicados: dos frases se consideran equivalentes si el coseno entre sus vectores SIF supera un umbral; con 25 dimensiones el cálculo es prácticamente gratis en CPU y permite filtrar grandes volúmenes antes de aplicar un modelo más caro.
- Deduplicación de reseñas o titulares en pipelines ETL: el vector de frase se calcula en microsegundos por documento corto, lo que hace viable procesar millones de registros en un solo núcleo.
- Clustering de tickets de soporte en inglés: agrupar consultas por similitud de sus embeddings SIF para enrutarlas a colas temáticas sin depender de un LLM.
- Búsqueda semántica ligera en dispositivos: indexar frases cortas y recuperar por similitud coseno en entornos sin GPU, con un índice que ocupa unos pocos megabytes.
- Línea base en experimentos de similitud semántica: el repositorio de fse publica evaluaciones sobre el benchmark STS para todos sus conjuntos de vectores, lo que permite usar este modelo como referencia mínima antes de probar embeddings de 300 o 1024 dimensiones.
- Ingeniería de características para clasificadores clásicos: usar el vector de frase de 25 dimensiones como entrada de un clasificador de texto junto a features léxicas, con un coste de memoria despreciable.
- Prototipado y docencia: ejemplo mínimo y autoreproducible de cómo se pasa de vectores de palabra a vectores de frase con SIF/uSIF sin infraestructura de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de similitud semántica; únicamente remite al repositorio de GitHub de fse, donde se indica que existe una evaluación STS de todos los conjuntos de vectores de la organización, sin que se proporcionen los valores en la información consultada.

## Requisitos de hardware

- VRAM: 0; el modelo no requiere GPU.
- RAM: aproximadamente 9,5 MiB en float32 (99.958 × 25 × 4 bytes) más el overhead de Python/gensim; con `mmap="r"` gran parte del fichero se mapea desde disco.
- GPU recomendadas: ninguna. Cualquier CPU sirve; el cuello de botella es el tokenizado y el recorrido de la frase, no el modelo.
- Cabe en cualquier dispositivo con unos pocos megabytes de memoria libre, incluidos sistemas embebidos y contenedores mínimos.
- Opciones de despliegue: gensim (`KeyedVectors.load`), librería fse (`Vectors.from_pretrained`), uso directo de la matriz NumPy subyacente. No aplican vLLM, llama.cpp, Ollama ni TGI, que requieren pesos de transformer en safetensors/GGUF.
- Latencia y throughput: no disponibles como cifra publicada; el coste por frase es O(n tokens × 25) operaciones en coma flotante, es decir, despreciable frente a cualquier modelo neuronal.

## Comparativa con modelos similares

| Modelo | Dimensiones | Vocabulario | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| fse/paragram-25 | 25 | 99.958 palabras (inglés) | no aplica (agregación de tokens) | unknown | gensim `KeyedVectors` | HuggingFace, repo de 0.0 GB |
| Otros conjuntos de vectores de la organización fse | no disponible | no disponible | no aplica | no disponible | gensim | HuggingFace (referenciados en la model card) |
| Embeddings estáticos clásicos de la misma época (GloVe, word2vec, fastText) | habitualmente 50-300 | no disponible | no aplica | no disponible en esta ficha | formatos propios (texto/binario); no empaquetados para fse | públicos, pero fuera de la información proporcionada |

La comparación cuantitativa no es posible con los datos disponibles. Cualitativamente, paragram-25 se distingue por su dimensionalidad excepcionalmente baja (25 frente a las 300 típicas), lo que reduce el tamaño del índice en un orden de magnitud a costa de capacidad expresiva; su ventaja es el coste computacional y de almacenamiento, y su desventaja la pérdida de matices semánticos frente a embeddings de mayor dimensión.

## Limitaciones y advertencias

- Licencia desconocida: ni el repositorio ni la página original de CMU declaran licencia, por lo que el uso comercial no está amparado por un permiso explícito. Es un riesgo legal a resolver antes de producción.
- Embeddings estáticos: un único vector por palabra, sin desambiguación de sentido; la polisemia (por ejemplo, "bank") queda colapsada en una sola representación.
- Solo inglés: el vocabulario y el entrenamiento están restringidos a inglés; cualquier texto en castellano quedará mayoritariamente fuera del vocabulario.
- Riesgo de sesgo: los vectores entrenados sobre pares de paráfrasis heredan los sesgos presentes en esos datos; no se documenta ninguna auditoría al respecto en la información disponible.
- Sin manejo de subpalabras documentado: las palabras fuera del vocabulario de 99.958 entradas no tienen vector asignado, lo que degrada la representación de textos con errores tipográficos, jerga o morfología productiva.
- Dimensionalidad muy baja (25): adecuada para similitud aproximada, insuficiente para tareas que requieran matiz semántico fino; conviene validar con el benchmark STS propio antes de adoptarlo.
- Sin resultados de benchmarks verificados en esta ficha: no se puede afirmar su calidad relativa frente a alternativas sin medirla.
- No es un generador: no admite prompts, tool calling ni razonamiento multi-paso; cualquier expectativa de uso como LLM es incorrecta.
- Aviso sobre la búsqueda web: los resultados obtenidos para "FSE" corresponden al Fondo Social Europeo (fse.gouv.fr) y a la conferencia FSE 2025, y no guardan relación con este modelo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni comunidad que reporte incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/paragram-25
- Artículo de referencia (Wieting et al., 2016, ICLR): https://www.cs.cmu.edu/~jwieting/wieting2016ICLR.pdf
- Página de John Wieting en CMU (origen de los vectores): https://www.cs.cmu.edu/~jwieting/
- Repositorio de Fast Sentence Embeddings y benchmark STS: https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentación de gensim: https://radimrehurek.com/gensim/
- Autor de fse, Dr. Oliver Borchers: https://www.drborchers.com/
