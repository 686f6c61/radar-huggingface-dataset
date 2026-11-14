# athv/cyber-bge-small

## Resumen

`athv/cyber-bge-small` es un modelo de embeddings de frases (sentence transformer) afinado a partir de `BAAI/bge-small-en-v1.5` por el usuario athv. Su funcion es proyectar texto a un espacio vectorial denso de 384 dimensiones para tareas de similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y clustering. La particularidad del ajuste es el dominio: los pares de entrenamiento mezclan identificadores de vulnerabilidades (CVE), tecnicas MITRE ATT&CK y nombres de herramientas ofensivas con descripciones tecnicas en lenguaje natural, lo que sugiere un uso orientado a ciberseguridad.

El modelo hereda la arquitectura BERT del modelo base, con un transformer de tipo `BertModel` seguido de pooling CLS y normalizacion L2. El resultado es un encoder pequeno (33,36 millones de parametros, unos 0,1 GB en safetensors) que puede ejecutarse en CPU sin problemas y con latencias muy bajas en GPU. La longitud maxima de secuencia es de 512 tokens.

Es relevante ahora por su tamano reducido y su orientacion a un nicho concreto (vinculacion de CVE y tecnicas ATT&CK con descripciones), aunque conviene ser cauto: el ajuste se ha realizado sobre solo 5 muestras de entrenamiento, por lo que su valor practico como modelo especializado es muy limitado y debe tratarse mas como una prueba de concepto que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertModel) + pooling CLS + normalizacion L2 |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (el modelo base es predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Funcion de similitud | similitud coseno |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un `SentenceTransformer` compuesto por tres modulos: un transformer BERT (`BertModel`) que extrae el `last_hidden_state`, una capa de pooling en modo CLS con dimension de embedding 384 y una capa de normalizacion. La similitud se calcula con coseno sobre vectores normalizados. No hay innovaciones arquitectonicas propias: el modelo reutiliza integramente el encoder del `bge-small-en-v1.5`.

El ajuste se realizo con la perdida `MultipleNegativesRankingLoss` (escala 20.0, similitud coseno) sobre un dataset de solo 5 muestras con pares `sentence_0` / `sentence_1`. Los pares asocian identificadores tecnicos con descripciones: por ejemplo, `CVE-2021-44228` con la descripcion de la vulnerabilidad Log4Shell, `T1059.001: PowerShell` con su descripcion de tecnica ATT&CK, o `Mimikatz LSASS Dump` con la descripcion del volcado de LSASS. Las longitudes medias son de 11,2 tokens para `sentence_0` y 30,0 tokens para `sentence_1`. No se documenta el numero de pasos, epochs, learning rate ni la composicion completa del dataset. No se menciona RLHF, DPO ni ninguna otra fase de alineamiento.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica.
- Busqueda semantica y recuperacion densa (dense retrieval) sobre corpus de texto.
- Mineria de parafrasis y deteccion de duplicados semanticos.
- Clasificacion de texto mediante embeddings (con un clasificador aguas abajo).
- Clustering y agrupamiento semantico de documentos.
- Vinculacion de identificadores de ciberseguridad (CVE, tecnicas ATT&CK, nombres de herramientas) con descripciones tecnicas, segun los pares de entrenamiento.
- Compatible con Text Embeddings Inference (TEI) y con endpoints compatibles, segun los tags del repositorio.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es un encoder puro, no un modelo generativo.

## Casos de uso

- Deduplicacion de alertas de seguridad: convertir el texto de alertas y reglas en embeddings y agrupar por similitud coseno para reducir el ruido en un SIEM, aprovechando el tamano reducido del modelo para procesar en CPU.
- Busqueda semantica sobre bases de conocimiento de vulnerabilidades: indexar descripciones de CVE y recuperar entradas relevantes a partir de una consulta en lenguaje natural, aunque la escasez de datos de entrenamiento limita la calidad fuera de los pocos ejemplos vistos.
- Mapeo de hallazgos a MITRE ATT&CK: generar embeddings de descripciones de tecnicas y de hallazgos de un analisis para sugerir la tecnica mas proxima; requiere validacion manual por la baja cobertura del ajuste.
- Clasificacion de tickets de seguridad: usar los embeddings como entrada a un clasificador ligero (regresion logistica, SVM) para enrutar incidentes por categoria.
- Recuperacion aumentada (RAG) sobre documentacion tecnica interna: indexar runbooks y notas de operaciones y recuperar fragmentos relevantes en un pipeline de RAG con un LLM generativo.
- Deteccion de contenido duplicado en informes de threat intelligence: comparar embeddings de parrafos para identificar campanas o informes que describen la misma amenaza con redacciones distintas.
- Prototipado rapido en entornos con recursos limitados: al ocupar 0,1 GB y 33 millones de parametros, permite iterar en portatiles y contenedores pequenos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: viable con 33 millones de parametros; el modelo cabe holgadamente en memoria RAM (menos de 1 GB en precision fp32).
- VRAM estimada: inferior a 1 GB en fp32; practicamente despreciable en fp16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso iGPU; tambien A100/H100 para despliegues de alto throughput por lotes.
- Cabe en cualquier GPU consumer, incluida la gama de entrada, y en CPU.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI, indicado en los tags), y cualquier runtime compatible con safetensors (ONNX si se exporta manualmente).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano y contexto (512 tokens), se espera un throughput alto en GPU y latencias de milisegundos en CPU por frase corta, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| athv/cyber-bge-small | 33,36 M | 512 | 384 | no disponible | Ajuste sobre 5 muestras orientado a ciberseguridad |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 | 384 | MIT (segun el modelo base original) | Modelo base; entrenado con datos a gran escala, sin especializacion en ciberseguridad |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 | 384 | Apache 2.0 | Alternativa ligera muy extendida para similitud semantica general |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 | 768 | MIT (segun el modelo base original) | Version mayor del mismo linaje, mayor calidad a costa de mas recursos |

La comparativa con el modelo base es la mas relevante: `athv/cyber-bge-small` solo aporta valor si el ajuste de nicho compensa la perdida de generalidad derivada de entrenar con 5 muestras, algo que no puede asumirse sin evaluacion propia.

## Limitaciones y advertencias

- Entrenamiento con solo 5 muestras: riesgo alto de sobreajuste y de que el ajuste no generalice a vocabulario o redacciones fuera de los ejemplos vistos.
- Licencia no disponible: no puede confirmarse el uso comercial; conviene verificar la licencia del modelo base (`BAAI/bge-small-en-v1.5`) antes de desplegar.
- Idiomas no declarados: el modelo base es predominantemente ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto limitado a 512 tokens: los documentos largos deben trocearse.
- Riesgo de falsos positivos en similitud: al ser un encoder de similitud, puede devolver puntuaciones altas entre textos superficialmente parecidos pero semanticamente distintos; requiere umbrales calibrados.
- Sin datos de benchmarks: no hay evidencia publicada de calidad frente al modelo base ni frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- No es un modelo generativo: no puede usarse para responder preguntas ni generar texto; solo produce embeddings.
- Sesgos: no documentados por el autor; hereda los sesgos del corpus de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athv/cyber-bge-small
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos con la libreria sentence-transformers: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Documentacion de MultipleNegativesRankingLoss: https://sbert.net/docs/package_reference/sentence_transformer/losses.html#multiplenegativesrankingloss
