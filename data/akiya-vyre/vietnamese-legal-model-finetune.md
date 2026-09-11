# Akiya-Vyre/vietnamese-legal-model-finetune

## Resumen

Akiya-Vyre/vietnamese-legal-model-finetune es un modelo de embeddings de frases (sentence embeddings) especializado en texto juridico en vietnamita. Se trata de un ajuste fino del modelo bqbbao6/vietnamese-legal-embedding, llevado a cabo por el usuario Akiya-Vyre, y esta construido sobre la arquitectura XLM-RoBERTa, un encoder transformer multilingue. Con 278.043.648 parametros totales (aproximadamente 278 millones), se situa en la misma escala que XLM-RoBERTa base, lo que lo convierte en un modelo ligero y desplegable en hardware modesto.

El problema que resuelve es la recuperacion semantica en un dominio muy especifico: la similitud entre consultas en lenguaje natural (por ejemplo, preguntas sobre condiciones de prestamos extranjeros o garantias bancarias) y fragmentos de normativa vietnamita (Thong tu, Dieu, Chuong). La model card incluye un widget de ejemplo que empareja una pregunta sobre requisitos de garantia con articulos concretos de un Thong tu del sector bancario, lo que confirma el enfoque de recuperacion pregunta-documento. La funcion de perdida declarada es MultipleNegativesRankingLoss, una eleccion tipica para entrenar bi-encoders de similitud con negativos en lote.

Su relevancia actual es limitada pero concreta: el ecosistema de modelos de embeddings juridicos en vietnamita es escaso, y este ajuste se apoya en un modelo base ya orientado al dominio legal. Sin embargo, el repositorio no declara licencia, idiomas soportados ni resultados de benchmarks, no tiene descargas ni "likes", y su fecha de creacion es muy reciente (septiembre de 2026, segun los metadatos), por lo que debe considerarse un artefacto experimental pendiente de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (pipeline sentence-transformers) |
| Parametros totales | 278.043.648 (aproximadamente 278 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la familia XLM-RoBERTa base emplea 512 posiciones maximas, pero la model card no lo confirma |
| Tipos de cuantizacion | no declarados en la model card; los pesos se distribuyen en safetensors, por lo que es convertible a FP16, INT8 u ONNX, pero no hay confirmacion oficial |
| Idiomas soportados | no declarado oficialmente; el contenido de la model card y del widget esta integramente en vietnamita, y la arquitectura XLM-RoBERTa es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 3,4 GB) |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del conjunto de entrenamiento | 27.927 ejemplos (etiqueta dataset_size:27927) |
| Modelo base | bqbbao6/vietnamese-legal-embedding (ajuste fino adicional) |
| Dimension de embeddings | no confirmada en la model card; XLM-RoBERTa base tiene un hidden size de 768 |
| Libreria | sentence-transformers |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |
| Region declarada | us |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia XLM-RoBERTa, reutilizado como bi-encoder de frases mediante la libreria sentence-transformers. El modelo no genera texto: produce un vector denso por secuencia de entrada, de modo que la similitud semantica se calcula por distancia coseno o producto escalar entre embeddings. El entrenamiento se realizo con la clase Trainer de sentence-transformers, como indica la etiqueta generated_from_trainer, y el objetivo de entrenamiento fue MultipleNegativesRankingLoss. Esta perdida trata los demas ejemplos del mismo lote como negativos, lo que la hace dependiente del tamano de lote para la calidad del contraste; es la funcion estandar cuando se dispone de pares positivos (pregunta-respuesta, consulta-pasaje) sin anotaciones de negativos explicitos.

El conjunto de datos de ajuste consta de 27.927 ejemplos, segun la etiqueta dataset_size. No se detalla en la informacion disponible su composicion exacta (si son pares pregunta-pasaje, fragmentos normativos duplicados, tuplas de articulos relacionados, etc.), ni si hubo etapas posteriores de RLHF, DPO o refinamiento con cross-encoder. Las etiquetas del repositorio incluyen dos referencias bibliograficas: arXiv:1908.10084 (Sentence-BERT) y arXiv:1807.03748 (InferSent), que corresponden a los trabajos fundacionales de embeddings de frases y son referencias habituales anadidas automaticamente por sentence-transformers. Como innovacion tecnica destacable no se documenta ninguna: no hay decodificacion especulativa, atencion lineal ni variantes de eficiencia declaradas, mas alla de la compatibilidad con Text Embeddings Inference para servir el modelo.

## Capacidades

- Generacion de embeddings de frases para similitud semantica (pipeline sentence-similarity) y extraccion de caracteristicas (feature-extraction).
- Recuperacion semantica consulta-documento en el dominio juridico vietnamita, segun el widget de ejemplo incluido en la model card.
- Calculo de similitud entre pares de textos mediante distancia coseno, util para ranking y filtrado.
- Agrupamiento (clustering) y deduplicacion de documentos por proximidad vectorial.
- Uso como bi-encoder en pipelines de recuperacion densa (dense retrieval) integrados con bases de datos vectoriales e indices FAISS, Qdrant o similares.
- Soporte de despliegue optimizado mediante Text Embeddings Inference (etiqueta text-embeddings-inference) y compatibilidad con Hugging Face Inference Endpoints (endpoints_compatible).
- No soporta generacion de texto: no produce respuestas, resumenes ni traducciones.
- No dispone de tool calling ni function calling.
- No implementa razonamiento multi-paso, planificacion ni comportamiento agentico; cualquier orquestacion debe aportarla una capa externa.
- No se declaran capacidades de vision, audio ni modos de pensamiento (thinking mode).
- El soporte multilingue no esta declarado explicitamente, aunque la arquitectura subyacente XLM-RoBERTa es multilingue por diseno.

## Casos de uso

- Busqueda semantica sobre corpus normativo vietnamita: el modelo permite indexar articulos de Thong tu, Nghi dinh y Luat y recuperar los fragmentos mas proximos a una consulta en lenguaje natural, como ilustra el widget de la model card con preguntas sobre condiciones de garantia bancaria.
- Recuperacion aumentada por generacion (RAG) en asistentes legales: se usa como recuperador de pasajes que despues alimentan a un modelo generativo; su naturaleza de bi-encoder lo hace adecuado para la fase de recuperacion de alta velocidad previa al re-ranking.
- Deduplicacion y agrupamiento de expedientes: al vectorizar expedientes, contratos o circulares se pueden detectar documentos casi identicos o agrupar por tematica antes de una revision manual, reduciendo el volumen de trabajo de los equipos juridicos.
- Clasificacion de consultas por similitud con plantillas: comparando la consulta del usuario con un banco de preguntas frecuentes etiquetadas, el modelo permite enrutar automaticamente la consulta al area normativa correspondiente (cambios de divisas, prestamos exteriores, garantias).
- Construccion de conjuntos de negativos duros (hard negative mining): los embeddings sirven para seleccionar candidatos dificiles que mejoren el entrenamiento de un re-ranker o de un futuro ajuste del propio modelo.
- Asistencia al cumplimiento normativo en banca: el widget del repositorio se centra en condiciones de avales y prestamos extranjeros no garantizados por el Gobierno, un escenario tipico de verificacion de requisitos regulatorios donde la recuperacion precisa del articulo aplicable es critica.
- Recomendacion de jurisprudencia o documentacion relacionada: dado un caso o un articulo, el modelo devuelve disposiciones conexas por proximidad semantica, util para despachos y departamentos legales internos.
- Filtrado previo en pipelines de anotacion: se puede usar para descartar pares sin relacion antes de enviarlos a anotadores humanos, reduciendo coste y tiempo de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (Recall@k, nDCG, MRR), ni resultados en tareas estandar de similitud (STS), ni comparaciones cuantitativas con otros modelos. El unico ejemplo funcional disponible es el widget de la model card, que no constituye una evaluacion sistematica.

## Requisitos de hardware

- Memoria estimada en FP32: aproximadamente 1,1 GB para los 278 M de parametros, mas el coste de activaciones y tokenizacion.
- Memoria estimada en FP16: aproximadamente 0,56 GB de pesos.
- Memoria estimada en INT8: aproximadamente 0,28 GB de pesos.
- El repositorio ocupa 3,4 GB, lo que sugiere que puede incluir copias adicionales de pesos o artefactos del entrenador; conviene revisar los ficheros antes de desplegar.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 2 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores.
- GPU recomendadas para servicio en produccion: T4, L4, A10, RTX 4090 o A100, en funcion del throughput requerido; para lotes grandes, A100 o H100 reducen el coste por embedding.
- Inferencia en CPU viable para volumenes bajos o procesamiento por lotes offline, dado el tamano moderado del modelo.
- Opciones de despliegue: Text Embeddings Inference (soportado explicitamente por las etiquetas), sentence-transformers en Python, Hugging Face Inference Endpoints, exportacion a ONNX Runtime y su integracion en bases de datos vectoriales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Akiya-Vyre/vietnamese-legal-model-finetune | 278 M | no disponible | no disponible | Hugging Face, 0 descargas |
| bqbbao6/vietnamese-legal-embedding (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| intfloat/multilingual-e5-base | 278 M (referencia publica) | 512 tokens (referencia publica) | MIT (referencia publica) | Hugging Face, ampliamente usado |
| BAAI/bge-m3 | 568 M (referencia publica) | 8192 tokens (referencia publica) | MIT (referencia publica) | Hugging Face, muy extendido |

Nota: los datos de las alternativas provienen de sus model cards publicas, no de la informacion proporcionada en esta busqueda, y deben verificarse contra la version vigente de cada repositorio. No se dispone de resultados de benchmarks que permitan comparar el rendimiento real del modelo ajustado frente a estas alternativas. La comparacion con el modelo base es la mas relevante, pero su ficha tecnica no aporta parametros, contexto ni licencia en la informacion disponible.

## Limitaciones y advertencias

- La licencia no esta declarada: no se puede asumir uso comercial permitido. Es un bloqueo potencial para produccion hasta que el autor la especifique.
- No hay resultados de benchmarks ni evaluacion independiente; el rendimiento real en recuperacion juridica es desconocido.
- Cero descargas y cero "likes": no existe validacion por parte de la comunidad ni evidencia de uso en produccion.
- El conjunto de entrenamiento es relativamente pequeno (27.927 ejemplos), lo que puede limitar la generalizacion a subdominios juridicos no representados.
- El modelo solo produce embeddings: no genera respuestas. Cualquier sistema que lo use debe anadir un generador y una capa de control de calidad de las respuestas.
- No es un modelo de chat ni de instrucciones; no acepta formato conversacional ni tool calling.
- La longitud de contexto no esta confirmada. Si se hereda el limite de 512 tokens de XLM-RoBERTa base, los articulos largos deberan trocearse (chunking), con el riesgo de perder coherencia entre fragmentos.
- El soporte multilingue no esta declarado. Aunque XLM-RoBERTa es multilingue por arquitectura, el ajuste fino se ha realizado presumiblemente sobre texto vietnamita y podria degradar su comportamiento en otros idiomas.
- Los documentos legales utilizados para el entrenamiento pueden estar sujetos a restricciones de derechos de autor o de reutilizacion; el autor no documenta la procedencia del corpus.
- Riesgo de falsos positivos en similitud: al ser un bi-encoder, dos fragmentos con vocabulario parecido pero efectos juridicos distintos pueden quedar proximos en el espacio vectorial. Se recomienda un re-ranker supervisado en dominios de alta criticidad.
- La fecha de creacion y actualizacion del repositorio (septiembre de 2026) indica que es un artefacto muy reciente y sin historial de mantenimiento.
- No se documenta el preprocesado de texto, la normalizacion de embeddings ni si se aplica prefijo de instruccion, detalles que afectan directamente a la reproducibilidad de los resultados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Akiya-Vyre/vietnamese-legal-model-finetune
- Modelo base: https://huggingface.co/bqbbao6/vietnamese-legal-embedding
- Sentence-BERT (referencia de la etiqueta arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- InferSent, Supervised Learning of Universal Sentence Representations (referencia de la etiqueta arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
