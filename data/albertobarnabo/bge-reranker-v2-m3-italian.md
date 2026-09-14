# albertobarnabo/bge-reranker-v2-m3-italian

## Resumen

bge-reranker-v2-m3-italian es un modelo de reranking (cross-encoder) especializado en italiano, desarrollado por Alberto Barnabo y publicado en HuggingFace bajo licencia Apache-2.0. Se obtiene mediante fine-tuning de BAAI/bge-reranker-v2-m3, el reranker multilingüe de la familia BGE, sobre datos de mMARCO en italiano. Su función es reordenar los candidatos devueltos por un sistema de recuperación (retrieval) para colocar los documentos relevantes en las primeras posiciones, y está pensado como reemplazo directo del modelo base: misma arquitectura, misma interfaz de uso y mejor comportamiento en italiano.

Técnicamente es un cross-encoder basado en XLM-RoBERTa con 567.755.777 parámetros (aproximadamente 568 M), que recibe un par consulta-documento y devuelve una puntuación de relevancia. Se integra con la librería Sentence-Transformers y con FlagEmbedding, y se distribuye en formato safetensors con un tamaño de repositorio de 2,3 GB. Está diseñado para encadenarse con el embedder bge-m3-italian del mismo autor: recuperar candidatos con el embedder y reordenarlos con este reranker.

Su relevancia actual es doble. Por un lado, demuestra que un ajuste fino bien planteado sobre un modelo multilingüe fuerte mejora de forma estadísticamente significativa el ranking en un idioma concreto (+0,0096 nDCG@10 sobre el modelo base, p < 0,0001). Por otro, documenta con detalle un fallo de entrenamiento (destilación desde un cross-encoder inglés de 2019) y la corrección aplicada (filtrado de falsos negativos mediante el propio reranker base), lo que lo convierte en un caso de estudio útil sobre la importancia de la minería de negativos duros. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre XLM-RoBERTa (text-ranking) |
| Parametros totales | 567.755.777 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la ficha; el modelo base BAAI/bge-reranker-v2-m3 admite hasta 8192 tokens |
| Tipos de cuantizacion | fp16 (recomendado en los ejemplos de la model card mediante `use_fp16=True`) y fp32; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Italiano (it) declarado; el modelo base es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: procesa conjuntamente la consulta y el documento en una única pasada por un transformer XLM-RoBERTa y produce una puntuación escalar de relevancia, en lugar de comparar embeddings independientes como haría un bi-encoder. Esta formulación es más costosa por par evaluado, pero captura interacciones finas entre consulta y documento, lo que la hace adecuada para la fase de reranking sobre un conjunto reducido de candidatos. El pipeline declarado es `text-ranking` y la librería principal es Sentence-Transformers, con compatibilidad con Text Embeddings Inference y endpoints.

El entrenamiento parte de BAAI/bge-reranker-v2-m3 y usa el dataset unicamp-dl/mmarco (traducción de MS MARCO a varios idiomas, en este caso italiano). La primera iteración, no publicada, destiló desde un cross-encoder MiniLM inglés de 2019 cuyas puntuaciones se calcularon sobre texto inglés y se transfirieron a las traducciones italianas: el entrenamiento convergió correctamente pero produjo un ranking peor (0,785 nDCG@10), por debajo del modelo base y por debajo de no reordenar. La versión publicada elimina ese profesor débil y sustituye la destilación por una estrategia de negativos duros: los candidatos se recuperan con bge-m3-italian y se filtran con el reranker base (el profesor fuerte) descartando cualquier candidato que este puntúe por encima del positivo conocido, ya que se trata de positivos no etiquetados. Los negativos restantes se emparejan con positivos reales de mMARCO y se entrenan con entropía cruzada, tasa de aprendizaje 5e-6 y una época sobre 143.874 consultas. El autor señala que este filtrado, y no una función de pérdida más sofisticada, es la diferencia clave, en línea con la ganancia reportada por la línea polaca mmlw.

## Capacidades

- Puntuación de relevancia consulta-documento en italiano mediante cross-encoding.
- Reranking de listas de candidatos recuperados previamente por un motor de búsqueda vectorial o léxico.
- Mejora del ranking final en métricas de ordenación (nDCG@10 y MRR@10) frente al modelo base multilingüe y frente a no reordenar.
- Integración con la clase `FlagReranker` de FlagEmbedding y con Sentence-Transformers.
- Inferencia en fp16 para reducir huella de memoria y latencia.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints desplegables.
- Encadenamiento con el embedder bge-m3-italian para formar un pipeline completo de retrieval + reranking.
- No es un modelo generativo: no produce texto, no soporta tool calling, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades de visión ni audio.

## Casos de uso

- RAG sobre documentación en italiano: recuperar los fragmentos candidatos con bge-m3-italian y reordenarlos con este cross-encoder antes de pasarlos al modelo generativo, de modo que el contexto inyectado contenga los pasajes más relevantes y se reduzca el ruido en la ventana de contexto.
- Buscador interno de empresa: reordenar los resultados de una búsqueda sobre manuales, políticas o wikis corporativas escritas en italiano, donde la coincidencia léxica falla ante paráfrasis y terminología variable.
- Atención al cliente y bases de conocimiento: puntuar pares pregunta-respuesta de un FAQ en italiano para devolver la respuesta correcta cuando varias entradas comparten vocabulario, como en el ejemplo de la carta de identidad electrónica incluido en la model card.
- Administración pública y servicios al ciudadano: reordenar resultados de consultas sobre normativa, trámites o pliegos en italiano, un dominio donde el orden de los documentos afecta directamente a la utilidad de la respuesta.
- Comercio electrónico: reordenar los productos recuperados por un buscador ante consultas largas y descriptivas en italiano, mejorando la posición de los artículos que realmente satisfacen la necesidad expresada.
- Verificación de citas y atribución de fuentes: dado un fragmento de texto en italiano, puntuar un conjunto de pasajes candidatos para localizar el más probable como origen, útil en pipelines de control de fuentes.
- Análisis de jurisprudencia y documentación legal: filtrar y ordenar resoluciones o contratos recuperados por similitud, dejando en primer lugar los más pertinentes para la consulta jurídica planteada.
- Filtrado de candidatos en pipelines de curación de datos: usar la puntuación del cross-encoder para descartar pares consulta-documento poco relevantes antes de incorporarlos a un conjunto de entrenamiento o evaluación.

## Benchmarks y rendimiento

Evaluación declarada por el autor: 2.000 consultas en italiano con los 100 mejores candidatos recuperados por bge-m3-italian y bootstrap emparejado sobre 10.000 muestras.

| Pipeline | nDCG@10 | MRR@10 |
|---|---|---|
| Solo retrieval | 0,796 | 0,761 |
| + BAAI/bge-reranker-v2-m3 | 0,821 | 0,786 |
| + bge-reranker-v2-m3-italian | 0,830 | 0,797 |

Diferencias reportadas:

- Frente al reranker base: +0,0096 nDCG@10, intervalo de confianza [+0,005, +0,015], p < 0,0001.
- Frente a no reordenar: +0,034 nDCG@10, intervalo de confianza [+0,024, +0,044].

No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas del ranking (no hay MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no es generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1-1,3 GB para los pesos en fp16 y entre 2,3 y 2,6 GB en fp32; con overhead de runtime, un presupuesto práctico de 2-4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4070, RTX 4090, L4, A10 y, por supuesto, A100 y H100, aunque estas últimas están sobredimensionadas para 568 M de parámetros.
- Cabe en GPU de consumo: sí, de forma holgada, incluidas tarjetas de gama media y baja con 4-8 GB de VRAM. También es viable la inferencia en CPU para cargas moderadas, dado el tamaño del modelo.
- Opciones de despliegue: FlagEmbedding (`FlagReranker`), Sentence-Transformers, HuggingFace Transformers, Text Embeddings Inference (TEI) y endpoints compatibles; el etiquetado del repositorio incluye `text-embeddings-inference` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponible, no se han publicado cifras en la informacion proporcionada. Como referencia cualitativa, el coste por par es lineal con el número de candidatos a reordenar y muy superior al de un bi-encoder, por lo que el reranking se aplica habitualmente sobre listas de 50-100 candidatos.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| albertobarnabo/bge-reranker-v2-m3-italian | 567.755.777 | Cross-encoder reranker | Heredado del base (hasta 8192 tokens) | Italiano declarado (base multilingue) | Apache-2.0 | HuggingFace |
| BAAI/bge-reranker-v2-m3 | 567.755.777 | Cross-encoder reranker | Hasta 8192 tokens | Multilingue | Apache-2.0 | HuggingFace |
| albertobarnabo/bge-m3-italian | No disponible en la informacion proporcionada | Bi-encoder de embeddings | No disponible | Italiano | No disponible | HuggingFace |

No se han encontrado en la informacion disponible otros rerankers especificos para italiano con los que establecer una comparacion cuantitativa directa. La comparacion pertinente es contra el modelo base multilingue, del que este modelo hereda arquitectura, tokenizador y licencia, y frente al cual mejora 0,0096 nDCG@10 en el conjunto de evaluacion descrito.

## Limitaciones y advertencias

- La evaluacion se realizo sobre 2.000 consultas procedentes de MS MARCO traducido, exactamente la distribucion sobre la que se entrenó; en textos italianos con un registro o dominio muy distintos (por ejemplo, lenguaje coloquial, jerga técnica o documentos históricos) las ganancias pueden ser menores.
- La mejora sobre el modelo base es real pero modesta (+0,01 nDCG@10). El autor subraya que el salto grande lo aporta añadir cualquier reranker al retrieval (+0,034), no la especialización en italiano.
- Los datos de entrenamiento derivan de MS MARCO, cuyos términos originales son de uso no comercial para investigación; conviene revisar las condiciones del dataset unicamp-dl/mmarco antes de un despliegue comercial, aunque los pesos se publiquen como Apache-2.0.
- Es un modelo de ranking, no generativo: no puede redactar respuestas, no soporta tool calling ni flujos de agente, y solo devuelve puntuaciones de relevancia.
- Al ser un cross-encoder, el coste computacional crece linealmente con el número de pares evaluados; no es adecuado para indexar corpus completos, solo para reordenar conjuntos de candidatos acotados.
- Riesgo de sesgo heredado de MS MARCO y de las traducciones automáticas: el corpus original tiene una distribución de consultas sesgada hacia dominios anglófonos y hacia ciertos temas sobrerrepresentados.
- La especialización declarada es únicamente el italiano; su comportamiento en otros idiomas no se ha evaluado en esta ficha y, aunque el modelo base sea multilingüe, el fine-tuning podría degradar el rendimiento fuera del italiano.
- El repositorio presenta 0 descargas y 0 likes, por lo que carece de validación independiente por parte de la comunidad más allá de los resultados publicados por el propio autor.
- La longitud de contexto efectiva no se declara explícitamente en la ficha; conviene verificar el límite real del tokenizador antes de usarlo con documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/albertobarnabo/bge-reranker-v2-m3-italian
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Embedder complementario: https://huggingface.co/albertobarnabo/bge-m3-italian
- Dataset de entrenamiento: https://huggingface.co/datasets/unicamp-dl/mmarco
- Librería FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Cita BibTeX del autor (recogida en la model card): `@misc{bge-reranker-v2-m3-italian-2026, author = {Barnabo, Alberto}, title = {bge-reranker-v2-m3-italian: Italian reranker fine-tuned from bge-reranker-v2-m3}, year = {2026}, url = {https://huggingface.co/albertobarnabo/bge-reranker-v2-m3-italian}}`
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relacion con la ficha.
