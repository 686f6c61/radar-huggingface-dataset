# GFS418/bge-small-qasper-ft

## Resumen

`GFS418/bge-small-qasper-ft` es un modelo de embeddings de frases (sentence transformer) obtenido al afinar `BAAI/bge-small-en-v1.5` sobre el corpus QASPER, un conjunto de artículos científicos de procesamiento del lenguaje natural con anotaciones de evidencia. Lo desarrolla el usuario GFS418 y se publica bajo licencia MIT con la librería `sentence-transformers`. Su propósito no es generar texto, sino recuperar el párrafo de evidencia correcto para una pregunta dada sobre un artículo científico, es decir, actuar como recuperador denso en un sistema de recuperación aumentada por generación (RAG).

El ajuste es deliberadamente ligero: dos épocas con `MultipleNegativesRankingLoss` sobre 3.560 tripletas (pregunta, párrafo de evidencia oro, negativo duro extraído con BM25) del split de entrenamiento de QASPER. Con 33.360.000 parámetros y un repositorio de 0,2 GB, el modelo es desplegable en CPU y en cualquier GPU de consumo. El resultado declarado es una mejora de +0,149 en recall con un presupuesto de contexto de 1.024 tokens, usando fragmentos de 256 tokens empaquetados por párrafo y el prefijo de consulta `Represent this sentence for searching relevant passages: `.

Su relevancia ahora es doble. Por un lado, demuestra que un ajuste muy pequeño y barato sobre un bi-encoder compacto puede mover de forma notable una métrica de recuperación en un dominio especializado. Por otro, publica junto al modelo el arnés de evaluación y los embeddings precalculados del split de test (`app_bundle/`), lo que facilita reproducir el experimento. Como contrapartida, es un modelo de nicho, sin descargas ni validación comunitaria, y entrenado únicamente sobre literatura en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder bidireccional) del modelo base `BAAI/bge-small-en-v1.5` |
| Parámetros totales | 33.360.000 (33,36 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens del modelo base (dato no confirmado en la model card de este fine-tune); la evaluación usa fragmentos de 256 tokens con presupuestos de contexto de 1.024 tokens |
| Tipos de cuantización | No disponible (no se documentan variantes GGUF, int8 ni ONNX en la información proporcionada) |
| Idiomas soportados | No disponibles (el modelo base y el corpus QASPER son en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `sentence-transformers`) |
| Dimensión de embedding | No disponible (no declarada en la model card) |
| Tamaño del repositorio | 0,2 GB |
| Prefijo de consulta | `Represent this sentence for searching relevant passages: ` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se parte de `BAAI/bge-small-en-v1.5`, un bi-encoder BERT de 33,36 M de parámetros que produce un vector por texto y se compara por similitud (producto escalar o coseno). El fine-tuning no modifica la arquitectura: solo ajusta los pesos con `MultipleNegativesRankingLoss`, una función de contraste que trata los pasajes de otras consultas del lote como negativos implícitos. El autor añade además negativos duros recuperados con BM25, lo que empuja al modelo a separar párrafos superficialmente parecidos pero no relevantes, un escenario típico en artículos científicos donde el vocabulario se repite.

Los datos de entrenamiento son 3.560 tripletas (pregunta, párrafo de evidencia oro, negativo duro BM25) extraídas del split **train** de QASPER, durante dos épocas. No se menciona RLHF ni DPO (no aplican a un modelo de recuperación), ni un recuento total de tokens de entrenamiento. La evaluación se hace sobre el split **test** de QASPER, con artículos disjuntos de los de entrenamiento, y con una configuración concreta: fragmentos de 256 tokens empaquetados por párrafo y un presupuesto de contexto de 1.024 tokens. La innovación reseñable no es arquitectónica, sino metodológica: el repositorio incluye el arnés de evaluación (`rag-eval-harness`) y los embeddings del split de test dentro de `app_bundle/`, de modo que el resultado es replicable.

## Capacidades

- Generación de embeddings de frases y párrafos para recuperación densa (dense retrieval).
- Recuperación de evidencia en artículos científicos: dada una pregunta, devuelve los pasajes relevantes del documento.
- Indexación y búsqueda semántica sobre corpus fragmentados en trozos de 256 tokens.
- Manejo de negativos duros: el entrenamiento con negativos BM25 mejora la discriminación entre pasajes temáticamente próximos.
- Uso como primera etapa de recuperación en pipelines RAG, con reordenación posterior mediante un modelo cross-encoder.
- Integración nativa con `sentence-transformers`, FAISS, Chroma, Qdrant o cualquier almacén vectorial.
- Ejecución en CPU, sin requisitos de GPU.
- **No** es un modelo generativo: no produce texto, no tiene modo de razonamiento, no soporta tool calling ni function calling, no gestiona diálogo multi-turno y no dispone de capacidades de visión o audio.
- Capacidades multilingües: no disponibles; el entrenamiento es sobre documentación en inglés.

## Casos de uso

- Recuperación de evidencia en literatura científica: el escenario para el que fue entrenado. Dada una pregunta sobre un artículo de NLP, el modelo localiza el párrafo que la responde, con el prefijo de consulta indicado y fragmentos de 256 tokens.
- Primera etapa de un RAG académico: se indexan los artículos con este bi-encoder y se recuperan los 50-100 candidatos más similares; un cross-encoder o el propio LLM generador filtra después los pasajes finales.
- Búsqueda semántica sobre documentación técnica interna: manuales, informes, patentes o tesis convertidos a vectores, con consultas en lenguaje natural en lugar de coincidencia exacta de términos.
- Asistente de preguntas y respuestas sobre PDF largos: combinado con un LLM generativo, el modelo aporta el contexto recuperado y reduce la necesidad de incluir documentos completos en la ventana del generador.
- Despliegue local con requisitos de privacidad: al caber en CPU y ocupar 0,2 GB en disco, permite indexar y consultar corpus sensibles sin enviar datos a servicios externos.
- Deduplicación y agrupación de pasajes: los embeddings permiten detectar fragmentos casi idénticos o agrupar secciones temáticamente similares en corpus grandes.
- Evaluación y comparación de sistemas RAG: el arnés del autor y los embeddings del split de test de QASPER permiten medir recall de forma reproducible frente al modelo base.
- Filtrado de contexto para modelos generativos: seleccionar los fragmentos que entran en la ventana de un LLM a partir de un presupuesto fijo de tokens, tal como hace la evaluación publicada.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| QASPER test (recall) | Presupuesto de contexto de 1.024 tokens, fragmentos de 256 tokens empaquetados por párrafo, split de test con artículos disjuntos del entrenamiento | +0,149 de mejora sobre `BAAI/bge-small-en-v1.5`, con intervalo [+0,127, +0,171] |

No se publican los valores absolutos de recall, solo la diferencia respecto al modelo base. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de generación, que no aplican a un modelo de embeddings. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 134 MB y en fp16 unos 67 MB (cálculo derivado del número de parámetros; no publicado por el autor). En la práctica, el modelo completo cabe en memoria de sistema.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM sirve; no se requiere A100, H100 ni hardware de datacenter. Una GTX 1050, una T4 o una RTX 4090 son igualmente válidas porque el cuello de botella no es el modelo.
- Cabe en GPU de consumo: sí, en cualquiera, y también en CPU sin aceleración dedicada. El repositorio ocupa 0,2 GB.
- Opciones de despliegue: `sentence-transformers` (vía `SentenceTransformer`), ONNX Runtime para exportación a CPU, y almacenes vectoriales como FAISS, Chroma, Qdrant, Milvus o Elasticsearch para la indexación. No es compatible con vLLM ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles. No se publican cifras de latencia ni de rendimiento por segundo. Por el tamaño del modelo (33,36 M de parámetros) es razonable esperar latencias de decenas de milisegundos por lote pequeño en CPU, aunque es una estimación, no un dato verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Recall en QASPER |
|---|---|---|---|---|---|
| `GFS418/bge-small-qasper-ft` | 33,36 M | 512 tokens del modelo base (no confirmado) | MIT | HuggingFace, 0 descargas | +0,149 respecto al base (presupuesto de 1.024 tokens) |
| `BAAI/bge-small-en-v1.5` (modelo base) | 33,36 M | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace | Referencia de partida del fine-tune |
| Otras variantes de la familia BGE (`bge-base-en-v1.5`, `bge-large-en-v1.5`) | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación documentada es la ablación contra el modelo base, que es además la más informativa: mismo backbone, mismos 33,36 M de parámetros y misma licencia, con una ganancia de recall de +0,149 en el dominio de QASPER. No hay datos en la información proporcionada que permitan comparar con alternativas de otros tamaños o familias.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma explícita y no admite tool calling ni uso conversacional. Cualquier expectativa de chatbot debe resolverse con un LLM generativo acoplado al recuperador.
- Dominio muy restringido: el ajuste se hizo sobre QASPER, artículos de NLP con preguntas y evidencias anotadas. En otros dominios (documentación médica, legal, código) puede rendir por debajo del modelo base, ya que el fine-tuning puede degradar la generalidad.
- Entrenamiento muy corto: 3.560 tripletas durante dos épocas es un volumen reducido, con riesgo de sobreajuste al estilo de anotación de QASPER y de sensibilidad a la formulación de la consulta.
- El prefijo `Represent this sentence for searching relevant passages: ` forma parte de la receta de uso; omitirlo puede degradar la recuperación.
- Idiomas: no se declaran idiomas soportados y el corpus es en inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Contexto limitado: la ventana efectiva del modelo base es corta (512 tokens), por lo que es imprescindible fragmentar los documentos (la evaluación usa trozos de 256 tokens). Documentos largos requieren una estrategia de empaquetado y un presupuesto de contexto explícito.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni informes de terceros. Los resultados son los declarados por el autor.
- Riesgo de alucinación indirecto: el modelo no genera texto, pero si devuelve pasajes irrelevantes, un LLM situado aguas abajo puede construir respuestas incorrectas a partir de ellos.
- Sesgos: no se documenta ningún análisis de sesgos. Al derivar de un modelo entrenado con datos web y de un corpus académico, puede heredar sesgos de representación del ámbito científico y del inglés.
- Cuidado con `app_bundle/`: contiene los fragmentos y embeddings precalculados del split de test. Si se reutilizan para evaluar variantes del modelo, hay riesgo de fuga de información y de obtener métricas infladas.
- Licencia MIT: permite uso comercial y modificación sin restricciones relevantes, siempre que se conserve el aviso de copyright. Conviene verificar que el modelo base y la procedencia de QASPER sean compatibles con el uso previsto.
- Producción: no hay cifras publicadas de latencia, throughput, estabilidad ni consumo de memoria; habría que medirlas en el entorno objetivo antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GFS418/bge-small-qasper-ft
- Repositorio con el proyecto, el arnés de evaluación y los resultados completos: https://github.com/GFS418/rag-eval-harness
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Los resultados de búsqueda web proporcionados no guardan relación con este modelo (corresponden a empresas agrícolas de Ohio) y no aportan enlaces relevantes.
