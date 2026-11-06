# iarmourgarb/ArCHer

## Resumen

ArCHer es un método de búsqueda y recuperación de homología remota en proteínas basado únicamente en secuencia, publicado por el autor iarmourgarb en Hugging Face. No se trata de un modelo generativo al uso, sino de un sistema de dos etapas construido sobre el encoder de proteínas Rostlab/prot_t5_xl_half_uniref50-enc: una primera fase de preselección (ArCHer_shortlist) que embebe cada secuencia en un único vector mediante mean-pooling y conserva las candidatas más similares por similitud coseno, y una segunda fase de reordenación (ArCHer_reranker) que puntúa cada candidata con un alineamiento Needleman-Wunsch aprendido sobre embeddings por residuo, con costes de gap afines también aprendidos.

El problema que aborda es la detección de homología remota: identificar proteínas estructural o funcionalmente relacionadas cuando la similitud de secuencia es baja y las herramientas clásicas basadas en alineamiento (BLAST, HMMER) pierden sensibilidad. La propuesta sustituye la búsqueda exhaustiva por una arquitectura de recuperación en dos fases que combina eficiencia (vectores densos para el cribado) con precisión (alineamiento aprendido para el ranking final).

El modelo es relevante por su enfoque híbrido entre recuperación densa y alineamiento neuronal, y porque reutiliza un encoder ProteInLanguageModel consolidado (ProtT5-XL half, entrenado sobre UniRef50) como base. La información pública disponible es escasa: no hay resultados de benchmarks, métricas de recuperación ni detalles del conjunto de entrenamiento del reranker en la model card. El repositorio ocupa 1,2 GB y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ProtT5-XL half) con dos cabeceras: embedding mean-pooled para cribado y alineamiento Needleman-Wunsch aprendido con costes de gap afines para reordenación |
| Parametros totales | no disponible (modelo base ProtT5-XL half; el reranker añade parámetros no cuantificados en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de proteínas; entrada en secuencia de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 1,2 GB; el modelo base se distribuye en safetensors, pero no se confirma el formato de los pesos de ArCHer) |

## Arquitectura y entrenamiento

ArCHer se construye sobre Rostlab/prot_t5_xl_half_uniref50-enc, un encoder T5 de proteínas derivado de ProtT5-XL entrenado sobre UniRef50. El pipeline tiene dos componentes. El primero, ArCHer_shortlist, proyecta cada secuencia a un único vector mediante mean-pooling de los embeddings por residuo y recupera las N secuencias de la base de datos más similares por similitud coseno (valor por defecto: 4096 candidatas). El segundo, ArCHer_reranker, recibe cada par consulta-candidata y calcula una puntuación mediante un alineamiento Needleman-Wunsch aprendido sobre los embeddings por residuo, con costes de gap afines también aprendidos; el alineamiento se puntúa únicamente sobre la secuencia de consulta.

La innovación técnica reside en sustituir la función de puntuación clásica de los alineamientos por una aprendida sobre representaciones neuronales, manteniendo el sesgo inductivo del alineamiento (orden, gaps afines) en lugar de recurrir a una simple similitud de embeddings globales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de aprendizaje por refuerzo o preferencias; la model card no documenta el procedimiento de entrenamiento del reranker.

## Capacidades

- Búsqueda de homología remota en proteínas a partir de secuencia.
- Recuperación por similitud coseno sobre embeddings mean-pooled (fase de preselección).
- Reordenación de candidatas mediante alineamiento Needleman-Wunsch aprendido con costes de gap afines.
- Generación de embeddings de proteína por secuencia y por residuo.
- Ranking de hits de homología por puntuación de alineamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo generativo de texto ni multilingüe; su dominio es exclusivamente secuencial proteico.

## Casos de uso

- Anotación funcional de proteínas: dado un conjunto de secuencias sin anotar, ArCHer recupera homólogos remotos conocidos y permite transferir anotaciones funcionales cuando la similitud de secuencia es baja y BLAST no encuentra hits significativos.
- Búsqueda de homólogos en bases de datos grandes: la fase de shortlist con vectores mean-pooled permite cribar millones de secuencias por similitud coseno antes de aplicar el reranker, reduciendo el coste computacional frente a un alineamiento exhaustivo.
- Descubrimiento de relaciones estructurales lejanas: el alineamiento aprendido puede detectar relaciones entre proteínas con plegamientos similares pero identidad de secuencia baja, útil en estudios de evolución de familias proteicas.
- Construcción de datasets de entrenamiento para modelos de proteínas: la recuperación de homólogos remotos permite agrupar secuencias relacionadas y reducir fugas de información entre splits de entrenamiento y test.
- Priorización de candidatos en pipelines de diseño de proteínas: tras generar variantes, ArCHer puede ordenar candidatas por similitud a proteínas de referencia conocidas para filtrar antes de validación experimental.
- Análisis de metagenomas y secuencias huérfanas: para secuencias de microorganismos no cultivados sin homólogos cercanos, el sistema puede identificar relaciones remotas con familias caracterizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base ProtT5-XL half ocupa aproximadamente 1,2 GB en el repositorio; la inferencia del encoder completo requiere típicamente entre 4 y 8 GB en precisión media, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo base, una GPU consumer de gama media-alta (RTX 3060 12 GB o superior) podría alojar el encoder, pero no hay datos oficiales.
- Cabe en GPU consumer: probablemente sí para el encoder base, sujeto a verificación; no confirmado para el pipeline completo con reranker.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de proteínas, se usaría mediante la librería de transformers con el código específico del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArCHer | Recuperación de homología remota (2 fases) | no disponible (base ProtT5-XL half) | no disponible | MIT | Hugging Face |
| ProtT5-XL (Rostlab) | Encoder de proteínas | ~3B (XL) | 512 residuos típico | no disponible en la información | Hugging Face |
| BLAST / HMMER | Búsqueda por alineamiento clásico | no aplica | no aplica | dominio público / GPL | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre ArCHer y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de recuperación (sensibilidad, precisión, recall@k) que permitan evaluar su rendimiento frente a BLAST, HMMER o métodos de homología remota como HHpred.
- La model card no documenta el conjunto de entrenamiento del reranker, lo que impide evaluar posibles sesgos hacia familias proteicas sobrerrepresentadas en UniRef50.
- El sesgo de la base de datos subyacente (UniRef50) condiciona la recuperación: proteínas de organismos poco representados pueden quedar infrarrepresentadas.
- El alineamiento se puntúa únicamente sobre la secuencia de consulta, lo que puede limitar la sensibilidad en casos de dominios parciales o inserciones largas.
- No hay información sobre el formato de pesos ni sobre el código de inferencia, lo que dificulta la reproducibilidad.
- Aunque la licencia es MIT, el uso comercial requiere verificar las condiciones del modelo base Rostlab/prot_t5_xl_half_uniref50-enc, cuya licencia no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/iarmourgarb/ArCHer
- Modelo base: https://huggingface.co/Rostlab/prot_t5_xl_half_uniref50-enc
