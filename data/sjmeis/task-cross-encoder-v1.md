# sjmeis/task-cross-encoder-v1

## Resumen

sjmeis/task-cross-encoder-v1 es un cross-encoder (reranker) de 68.144.640 parámetros construido sobre el modelo base cross-encoder/ettin-reranker-68m-v1 y ajustado con la librería sentence-transformers. No es un modelo generativo ni produce embeddings independientes: recibe pares de textos (consulta, candidato) y devuelve una única puntuación de relevancia, lo que permite reordenar listas de resultados ya recuperadas por un buscador vectorial o léxico. En la práctica es una pieza de infraestructura de recuperación de información, no un asistente conversacional.

La arquitectura combina una columna vertebral ModernBERT con pooling de tipo CLS sobre 512 dimensiones y una cabeza densa de dos capas (512 → 512 → 1) que emite un logit por par. La longitud máxima de secuencia configurada es de 128 tokens, lo que lo sitúa en el segmento de rerankers ligeros y de bajísimo coste computacional: cabe en cualquier GPU de consumo e incluso funciona en CPU.

Su interés práctico está en el dominio de entrenamiento: 295.091 pares etiquetados de enunciados de tareas ocupacionales (columnas sentence1, sentence2, label), lo que apunta a aplicaciones de emparejamiento de tareas, ofertas de empleo y taxonomías de competencias. Como contrapartida, el repositorio es muy reciente (creado el 22 de septiembre de 2026), acumula 0 descargas y 0 valoraciones, y no declara licencia ni idiomas soportados, lo que limita su adopción en producción sin verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre transformer bidireccional ModernBertModel con pooling CLS y cabeza densa |
| Parámetros totales | 68.144.640 (≈68 M) |
| Longitud de contexto | 128 tokens (máxima longitud de secuencia declarada) |
| Tipos de cuantización | No disponible (no se publican variantes GGUF, AWQ ni GPTQ; los pesos se distribuyen en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,3 GB) |
| Modelo base | cross-encoder/ettin-reranker-68m-v1 (revisión d166fa88ddde3c42bc3ee92f7df476d941c8204a) |
| Tarea (pipeline) | text-ranking |
| Dimensión de la representación intermedia | 512 |
| Número de etiquetas de salida | 1 |
| Función de pérdida de entrenamiento | BinaryCrossEntropyLoss |
| Tamaño del conjunto de entrenamiento | 295.091 muestras |
| Modalidad | Texto |
| Librería | sentence-transformers |
| Descargas / valoraciones en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un CrossEncoder compuesto por cinco módulos encadenados: (0) un transformer de extracción de características basado en ModernBertModel que devuelve last_hidden_state; (1) un pooling CLS con dimensión de embedding 512; (2) una capa densa de 512 a 512 sin sesgo con activación GELU; (3) una LayerNorm de dimensión 512; y (4) una capa densa final de 512 a 1 con sesgo y activación identidad. El resultado es un único logit por par de textos, tal como se observa en los ejemplos de la model card (valores como -2.6881 o 1.3212, sin normalizar). ModernBERT aporta las innovaciones habituales de esta familia: embeddings posicionales rotatorios, atención alterna local/global y atención con Flash Attention, lo que reduce el coste por token frente a encoders tipo BERT clásico.

El ajuste se realizó con sentence-transformers sobre un conjunto de 295.091 muestras con columnas sentence1, sentence2 y label, optimizando BinaryCrossEntropyLoss. La model card no documenta el número de épocas, la tasa de aprendizaje, la composición lingüística del dataset ni procesos de alineación adicionales (RLHF, DPO), que en cualquier caso no aplican a un modelo discriminativo de este tipo. La model card cita el artículo arXiv:1908.10084 (Sentence-BERT, Reimers y Gurevych, 2019) como referencia metodológica.

## Capacidades

- Puntuación de relevancia de pares de textos: genera un logit por par (sentence1, sentence2) que indica el grado de relación semántica.
- Reranking de listas de candidatos: la API `rank` ordena un conjunto de textos según su similitud con una consulta dada.
- Recuperación semántica en segunda fase: pensado para colocarse después de un retriever (BM25, embeddings densos) y reordenar los resultados.
- Clasificación binaria por umbral: al emitir un logit, permite convertir la puntuación en decisión binaria (relevante / no relevante) calibrando un punto de corte.
- Integración con el ecosistema sentence-transformers y con Text Embeddings Inference, además de compatibilidad declarada con endpoints de HuggingFace.
- No soporta tool calling ni function calling: no es un modelo generativo.
- No dispone de modo de razonamiento (thinking), ni capacidades de agente, ni multi-step reasoning.
- No dispone de visión, audio ni ninguna otra modalidad distinta del texto.
- Cobertura multilingüe: no disponible; la model card no declara idiomas y todos los ejemplos publicados están en inglés.

## Casos de uso

- Reranking en pipelines RAG: el modelo se coloca tras la fase de recuperación para reordenar los 50-100 fragmentos candidatos según su relevancia respecto a la pregunta del usuario. Con 68 M de parámetros y 128 tokens por par, añade muy poca latencia al pipeline en comparación con el coste de un LLM generador.
- Emparejamiento de ofertas de empleo con descripciones de tareas: dado que el entrenamiento se realizó sobre enunciados de tareas ocupacionales, el modelo es directamente aplicable a la comparación entre ofertas, perfiles profesionales y taxonomías de competencias tipo O*NET.
- Normalización y deduplicación de catálogos de tareas o competencias: puntuando pares de enunciados se detectan duplicados o formulaciones equivalentes antes de consolidar una taxonomía interna.
- Verificación de coincidencia pregunta-respuesta en bases de conocimiento: en un sistema de FAQ, el modelo comprueba si una respuesta candidata responde realmente a la pregunta del usuario recuperada por el buscador.
- Filtrado de resultados en buscadores internos de documentación: tras una búsqueda léxica sobre manuales o wikis corporativas, el cross-encoder descarta los fragmentos que solo coinciden en palabras clave pero no en significado.
- Emparejamiento de productos en comercio electrónico: comparar títulos y descripciones de catálogos distintos para detectar el mismo producto entre proveedores, con un umbral ajustado por dominio.
- Evaluación de la pertinencia de resúmenes o respuestas generadas: puntuar el par (consulta, respuesta generada) como métrica automática complementaria en procesos de control de calidad.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el model-index, evaluados sobre un conjunto interno denominado `val_correlation` con el `CrossEncoderCorrelationEvaluator` de sentence-transformers. Las métricas figuran como no verificadas.

| Conjunto | Métrica | Valor |
|---|---|---|
| val_correlation | Pearson | 0,8442 |
| val_correlation | Spearman | 0,8962 (marcada en negrita por el autor) |

No hay resultados publicados de MMLU, HumanEval, GSM8K, MS MARCO ni BEIR en la información disponible, ni comparaciones con otros rerankers en conjuntos de referencia públicos. Al tratarse de un conjunto de validación interno no descrito, las cifras no son directamente comparables con las de otros modelos de ranking.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 272 MB en fp32, 136 MB en fp16/bf16 y 68 MB en int8. Añadir activaciones y batching incrementa el consumo, pero el modelo completo ocupa menos de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU con 1 GB o más de VRAM. Para producción, una NVIDIA T4, L4 o A10 es suficiente y ofrece buen rendimiento por vatio; A100 o H100 solo tienen sentido si se comparte infraestructura con otros modelos.
- GPU de consumo: sí, cabe holgadamente en cualquier RTX (3060, 4060, 4090) e incluso en GPU integradas y en CPU.
- CPU: inferencia viable sin aceleración, con throughput inferior al de GPU. Un lote de 100-200 pares sigue siendo manejable en CPU para aplicaciones de baja concurrencia.
- Opciones de despliegue: sentence-transformers con la clase `CrossEncoder`; Text Embeddings Inference (el repositorio está etiquetado como `text-embeddings-inference`); HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). No se declara soporte para vLLM, TGI ni llama.cpp, y no existen pesos en formato GGUF.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa, no verificada, un cross-encoder de 68 M de parámetros con secuencias de 128 tokens suele procesar del orden de cientos de pares por segundo en una GPU moderna con batching y decenas de pares por segundo en CPU.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas públicas y no se han verificado en esta ficha; deben confirmarse antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sjmeis/task-cross-encoder-v1 | 68 M | 128 tokens | Reranking de pares | No disponible | 0 descargas, sin validación comunitaria |
| cross-encoder/ettin-reranker-68m-v1 | 68 M | No disponible en esta ficha | Reranking de pares | No disponible en esta ficha | Modelo base, publicado por el mismo ecosistema |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ≈22,7 M | 512 tokens | Reranking entrenado sobre MS MARCO | Apache-2.0 | Muy extendido, ampliamente usado en producción |
| BAAI/bge-reranker-base | ≈278 M | 512 tokens | Reranking multilingüe | Apache-2.0 según su ficha pública | Amplia adopción en pipelines RAG |

Frente a estas alternativas, la ventaja principal del modelo es el dominio específico de tareas ocupacionales y su bajo coste computacional; la desventaja es la ausencia de licencia declarada, de idiomas documentados y de métricas sobre conjuntos públicos comparables.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar que el uso comercial esté permitido. Es un bloqueo potencial para producción hasta que el autor lo aclare.
- Idiomas no declarados: los ejemplos de la model card están en inglés y todo apunta a un entrenamiento monolingüe, pero no hay confirmación oficial. No debe asumirse soporte en castellano sin evaluarlo.
- Ventana de 128 tokens: los documentos largos se truncan, lo que degrada la puntuación en casos donde la evidencia relevante aparece al final del texto. Para pasajes extensos hay que trocear previamente.
- Métricas no verificadas sobre un conjunto interno no descrito (`val_correlation`): no hay resultados en BEIR, MS MARCO ni ningún otro benchmark público, por lo que el rendimiento real en un dominio nuevo es una incógnita.
- Sesgo de dominio: los 295.091 pares de entrenamiento proceden de enunciados de tareas ocupacionales. En otros dominios (legal, médico, código) la calidad del ranking puede caer de forma notable.
- Escala sin calibrar: las salidas son logits sin normalizar, y los umbrales de decisión deben ajustarse empíricamente para cada caso de uso.
- No es un modelo de embeddings: no debe usarse para recuperación directa ni para similitud coseno precalculada, solo para puntuar pares de forma interactiva.
- Riesgo de falsos positivos de relevancia: como clasificador, puede ordenar como relevantes documentos que solo comparten vocabulario con la consulta.
- Sin capacidades generativas: no sirve para redactar, resumir, programar ni resolver problemas matemáticos.
- Repositorio sin tracción: 0 descargas y 0 valoraciones, sin garantía de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sjmeis/task-cross-encoder-v1
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-68m-v1
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Listado de cross-encoders en HuggingFace: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Artículo de referencia (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Evaluador de correlación para cross-encoders: https://sbert.net/docs/package_reference/cross_encoder/evaluation.html#sentence_transformers.cross_encoder.evaluation.CrossEncoderCorrelationEvaluator

Nota: los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo (corresponden a consultas sobre carpetas de inicio de Windows), por lo que no se incluyen.
