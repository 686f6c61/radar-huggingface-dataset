# julian-schelb/granite-embedding-107m-emb-lat-intertext-v2

## Resumen

`granite-embedding-107m-emb-lat-intertext-v2` es un modelo de embeddings de frases especializado en latín clásico, desarrollado por Julian Schelb como parte del benchmark **Loci Similes** para la detección de intertextualidades en literatura latina. Se trata de un fine-tuning del modelo `ibm-granite/granite-embedding-107m-multilingual` de IBM, entrenado con pérdida contrastiva online sobre un corpus de pares de textos latinos verificados por expertos. El modelo genera vectores de 384 dimensiones y está diseñado para emparejar pasajes de autores cristianos (como Jerónimo) con sus fuentes clásicas (Virgilio, Ovidio, Cicerón, etc.).

La relevancia de este modelo radica en que aborda una tarea de humanidades digitales muy específica: la identificación automática de alusiones y reescrituras en textos latinos, un problema que los métodos basados en similitud léxica tradicionales resuelven mal. Al partir de un modelo multilingüe de IBM y ajustarlo con datos anotados por filólogos, consigue capturar similitudes semánticas y estructurales que van más allá de la coincidencia de palabras. La versión v2 sustituye a la v1 como reemplazo directo, con la misma interfaz y mejoras en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa) denso, biencoder |
| Parametros totales | 106.994.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16) |
| Idiomas soportados | latin (la) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del embedding model multilingüe de IBM `granite-embedding-107m-multilingual`, que a su vez es un transformer del tipo XLM-RoBERTa con 12 capas y 768 dimensiones ocultas, que produce vectores de 384 dimensiones mediante una capa de pooling. El fine-tuning se realizó con **online contrastive loss**, una variante de la pérdida contrastiva que construye pares positivos y negativos dinámicamente dentro de cada batch. Los datos de entrenamiento provienen de los tres datasets del benchmark Loci Similes: `latin-classical-intertextuality-labels`, `latin-classical-intertextuality-corpus` y `latin-classical-intertextuality-queries`, correspondientes a uno de los cinco splits de validación cruzada del benchmark.

Una característica técnica destacable es el uso de **prefijos de prompt** durante el entrenamiento: los textos de consulta (query) se prefijan con `"Query: "` y los textos candidatos con `"Candidate: "`. Esto obliga a que en inferencia se utilicen los mismos prefijos mediante los argumentos `prompt_name="query"` y `prompt_name="match"` de la librería `sentence-transformers`; si se omiten, la calidad de recuperación disminuye notablemente. El modelo está pensado para integrarse en pipelines de recuperación (embedding del corpus una vez con `prompt_name="match"` y de cada consulta con `prompt_name="query"`) seguidos de un clasificador de tres clases para confirmar la intertextualidad.

## Capacidades

- Generacion de embeddings de frases en latin clasico para tareas de similitud semantica y recuperacion.
- Deteccion de intertextualidades: identifica pasajes de autores cristianos (p. ej. Jeronimo) que reutilizan o aluden a textos de autores clasicos (Virgilio, Ovidio, Ciceron, etc.).
- Compatible con la API de `sentence-transformers` y con la libreria `LociSimiles` (https://julianschelb.github.io/locisimiles/api/).
- Soporte de prefijos de prompt diferenciados para consultas y candidatos, lo que mejora la precision de la recuperacion.
- Integracion con pipelines de clasificacion posteriores (modelos `*-3class-lat-intertext-v1` de la misma coleccion).
- No soporta tool calling, agentes ni otras capacidades generativas; es exclusivamente un modelo de embeddings.

## Casos de uso

- **Investigacion filologica y literaria**: detectar alusiones y reescrituras entre autores latinos clasicos y tardoantiguos. El modelo permite a los investigadores localizar pasajes paralelos en corpus extensos sin depender de busquedas lexicas manuales.
- **Analisis de fuentes en patristica**: identificar que pasajes de autores como Jeronimo o Agustin se basan en Virgilio, Horacio o Ciceron, facilitando el estudio de la recepcion clasica en el cristianismo primitivo.
- **Construccion de corpus anotados de intertextualidad**: generar candidatos a pares intertextuales para su posterior verificacion manual por expertos, reduciendo el esfuerzo de curacion.
- **Enriquecimiento de ediciones digitales**: anadir aparatos de fuentes automaticos a ediciones criticas de textos latinos, mostrando las posibles referencias clasicas de cada pasaje.
- **Sistemas de recomendacion de lecturas comparadas**: en plataformas educativas de latin, sugerir pasajes de otros autores que resuenen con el texto que se esta leyendo.
- **Investigacion en humanidades digitales**: servir como componente de extraccion de relaciones en grafos de conocimiento literario, conectando obras y autores mediante vinculos intertextuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo forma parte del benchmark Loci Similes, descrito en el articulo de Schelb et al. (2026), pero los numeros concretos de rendimiento (precision, recall, nDCG, etc.) no aparecen en la model card ni en los resultados de busqueda web obtenidos.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 107M parametros, la inferencia en fp32 requiere aproximadamente 0,4 GB de VRAM, y en fp16 unos 0,2 GB. Cabe sin problemas en cualquier GPU comercial moderna.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (p. ej. NVIDIA GTX 1050 Ti, RTX 2060, etc.) es suficiente. Tambien puede ejecutarse en CPU con latencias aceptables (decenas de milisegundos por frase).
- **Compatibilidad con hardware de consumo**: si, es totalmente viable en portatiles y equipos de escritorio convencionales.
- **Opciones de despliegue**: al ser un modelo de `sentence-transformers`, puede servirse con la libreria `text-embeddings-inference` (TEI) de Hugging Face, que es compatible con endpoints de produccion. Tambien se puede usar con `sentence-transformers` directamente en Python, o exportar a ONNX para inferencia en CPU optimizada.
- **Latencia y throughput**: no se han publicado mediciones oficiales, pero para un modelo de este tamano se espera un throughput de cientos de frases por segundo en GPU y decenas en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| `granite-embedding-107m-emb-lat-intertext-v2` | 107M | no disponible | latin | Apache-2.0 | Intertextualidad latina |
| `ibm-granite/granite-embedding-107m-multilingual` | 107M | 512 tokens | 100+ idiomas | Apache-2.0 | Embeddings multilingues generales |
| `julian-schelb/granite-embedding-107m-emb-lat-intertext-v1` | 107M | no disponible | latin | Apache-2.0 | Intertextualidad latina (version anterior) |

La comparativa se limita a los modelos relacionados directamente porque no se dispone de otros modelos especificos de intertextualidad latina en la informacion proporcionada. La diferencia principal entre v1 y v2 es la revision del dataset de entrenamiento y la actualizacion del articulo; la interfaz y la tarea son identicas, siendo v2 un reemplazo directo.

## Limitaciones y advertencias

- **Especializacion estrecha**: el modelo solo ha sido entrenado para detectar intertextualidad en latin clasico. Su uso en otras tareas (resumen, generacion, clasificacion general) no es apropiado y dara resultados pobres.
- **Dependencia de prefijos**: si no se utilizan los prompts `"Query: "` y `"Candidate: "` en la codificacion, la calidad de la recuperacion cae notablemente. Es imprescindible seguir las instrucciones de uso.
- **Idioma unico**: solo soporta latin; no es util para otros idiomas, aunque el modelo base sea multilingue.
- **Sesgo del corpus**: los datos de entrenamiento provienen de un benchmark especifico (Loci Similes) con autores y periodos concretos; puede no generalizar bien a otros autores latinos o a latin vulgar/tardio no representado en el corpus.
- **Riesgo de falsos positivos**: la similitud coseno puede producir coincidencias espurias entre pasajes que comparten vocabulario comun pero no tienen relacion intertextual real. Se recomienda un paso de clasificacion posterior (como los modelos `*-3class`) para filtrar.
- **Sin garantias de rendimiento**: al no haber benchmarks publicos, no se puede evaluar objetivamente su precision frente a alternativas.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julian-schelb/granite-embedding-107m-emb-lat-intertext-v2
- Modelo base (IBM): https://huggingface.co/ibm-granite/granite-embedding-107m-multilingual
- Articulo arXiv (Loci Similes): https://arxiv.org/abs/2601.07533
- API de LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Dataset de etiquetas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels
- Dataset de corpus: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus
- Dataset de consultas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries
- Version v1 del modelo: https://huggingface.co/julian-schelb/granite-embedding-107m-emb-lat-intertext-v1
- Documentacion de Granite Embedding de IBM: https://www.ibm.com/granite/docs/models/embedding
