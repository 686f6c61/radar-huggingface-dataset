# liudev/novel-embedding-gpl-base-v2

## Resumen

`liudev/novel-embedding-gpl-base-v2` es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario `liudev` y publicado en Hugging Face. Se trata de un fine-tuning del modelo `liudev/novel-embedding-gpl-base-v1`, que a su vez parte de una arquitectura BERT. Su función es proyectar frases y párrafos a un espacio vectorial denso de 768 dimensiones, pensado para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación y clustering. El nombre y los ejemplos de la model card (frases en chino sobre tramas de novelas: obtención de oportunidades de audición, hallazgo de pruebas, ascensos, combates contra bestias) sugieren una especialización en el dominio de la narrativa o la ficción en chino.

El modelo resuelve el problema de recuperar y comparar fragmentos textuales por significado en lugar de por coincidencia léxica, algo crítico en sistemas de recomendación de contenido, búsqueda dentro de catálogos de novelas o agrupación temática de tramas. Con 102.267.648 parámetros totales, es un modelo compacto que puede desplegarse en hardware modesto, lo que lo hace atractivo para pipelines de recuperación a gran escala donde el coste por embedding importa.

Es relevante ahora porque los embeddings especializados de dominio superan sistemáticamente a los modelos genéricos en tareas de recuperación vertical, y este modelo declara un entrenamiento con 435.262 muestras y una función de pérdida `MarginMSELoss`, típica de los esquemas de destilación de rankings. No obstante, la información pública es escasa: no se declaran licencia, idiomas ni resultados de benchmarks, lo que limita su adopción en producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertModel) + pooling CLS + normalización L2 (SentenceTransformer) |
| Parametros totales | 102.267.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (máxima longitud de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (los ejemplos de la model card están en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de salida | 768 |
| Funcion de similitud | similitud coseno |
| Funcion de perdida de entrenamiento | MarginMSELoss |
| Tamano del dataset de entrenamiento | 435.262 muestras |
| Modelo base | liudev/novel-embedding-gpl-base-v1 |
| Tamano del repositorio | 67,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un `SentenceTransformer` compuesto por tres módulos secuenciales: un `BertModel` en modo `feature-extraction` que produce `last_hidden_state`, un `Pooling` con `pooling_mode: cls` y dimensión 768, y una capa `Normalize` que aplica normalización L2 para que la similitud coseno sea equivalente al producto escalar. El tokenizador y la configuración derivan de BERT, con una ventana máxima de 256 tokens, coherente con los tamaños observados en el dataset de entrenamiento (anchors de 10 a 24 tokens, sentence1 de 48 a 102 tokens, sentence2 de 15 a 97 tokens).

El entrenamiento se realizó sobre un dataset de 435.262 muestras con columnas `anchor`, `sentence1`, `sentence2` y `label` (valores entre 0,0 y 0,8, media 0,3). Esta estructura de tripletas con etiqueta continua es característica de los esquemas de destilación de rankings, donde `label` representa la puntuación del profesor para el par. La función de pérdida `MarginMSELoss` es consistente con este formato: aprende a predecir la diferencia de relevancia entre pares positivos y negativos. No se documenta el número total de tokens de entrenamiento ni la composición exacta del corpus, aunque la temática de los ejemplos (tramas de novelas) indica un dominio narrativo en chino. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para frases y párrafos, con normalización L2 incluida.
- Similitud semántica entre pares de textos mediante producto escalar o similitud coseno.
- Búsqueda semántica y recuperación de pasajes por significado, no por coincidencia exacta de términos.
- Minería de paráfrasis: detección de frases con el mismo contenido expresado de forma distinta.
- Clustering y agrupamiento temático de fragmentos textuales.
- Clasificación de textos mediante características derivadas de los embeddings (por ejemplo, con un clasificador lineal sobre los vectores).
- Extracción de características (`feature-extraction`) para pipelines posteriores.
- Compatible con `text-embeddings-inference` (tag `text-embeddings-inference` y `endpoints_compatible`), lo que permite servirlo como API de embeddings.
- Especialización aparente en texto narrativo en chino (los ejemplos de la model card son tramas de novelas).
- No soporta tool calling, agentes, visión ni audio: es un modelo exclusivamente de embeddings de texto.

## Casos de uso

- **Búsqueda semántica en catálogos de novelas y ficción**: indexar sinopsis, capítulos o resúmenes de tramas como vectores de 768 dimensiones y recuperar las obras más afines a una consulta del usuario. La especialización del modelo en lenguaje narrativo en chino lo hace adecuado para plataformas de lectura o recomendación de contenido.
- **Sistemas de recomendación de contenido narrativo**: calcular la similitud entre la trama de una obra y el historial de lectura de un usuario para generar recomendaciones "porque te gustó X". La ventana de 256 tokens encaja con resúmenes de capítulo o fichas de obra.
- **Deduplicación y detección de tramas repetidas**: agrupar por similitud coseno fragmentos con argumentos muy parecidos (por ejemplo, "obtiene una oportunidad por rechazo ajeno" frente a variantes), útil para control de calidad editorial o detección de plagio argumental.
- **Etiquetado y clasificación temática automática**: usar los embeddings como entrada a un clasificador para asignar géneros, tropos o etiquetas de contenido a miles de fragmentos, aprovechando que el modelo ya separa matices semánticos finos del dominio.
- **Minería de paráfrasis para aumento de datos**: generar pares de frases equivalentes en el dominio narrativo para entrenar otros modelos o ampliar datasets de anotación, usando la similitud coseno como filtro de calidad.
- **Moderación y filtrado por similitud**: comparar fragmentos entrantes contra una base de textos prohibidos o sensibles mediante embeddings, con umbrales calibrados sobre similitud coseno; el coste por inferencia es bajo gracias a los 102 M de parámetros.
- **Servicio de embeddings en producción vía TEI**: desplegar el modelo con `text-embeddings-inference` para exponer un endpoint HTTP compatible con clientes estándar de embeddings, integrándolo en un pipeline de RAG o de búsqueda documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP32, los 102,3 M de parámetros ocupan aproximadamente 0,41 GB de pesos; en FP16, unos 0,20 GB. Con overhead de activaciones y batches pequeños, es razonable estimar entre 1 y 2 GB de VRAM para inferencia práctica.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA T4, L4, RTX 3060 o superior cubre el caso sin problemas. Para alto throughput en producción, A10G, L4 o A100 permiten procesar lotes grandes.
- **Cabe en GPU de consumo**: sí, en cualquier GPU consumer moderna (RTX 2060 en adelante, e incluso iGPU con suficiente memoria compartida para lotes pequeños).
- **Opciones de despliegue**: `sentence-transformers` para uso directo en Python, `text-embeddings-inference` (soportado según los tags), y servidores compatibles con la API de embeddings de Hugging Face. No se documentan variantes GGUF ni ONNX, por lo que `llama.cpp` u `Ollama` no son opciones directas sin conversión.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de lote. Para referencia, un BERT-base de 110 M de parámetros en una GPU moderna suele procesar cientos de frases por segundo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liudev/novel-embedding-gpl-base-v2 | 102,3 M | 256 tokens | 768 | no disponible | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache 2.0 | Hugging Face |
| BAAI/bge-base-zh-v1.5 | ~102 M | 512 tokens | 768 | MIT | Hugging Face |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens | 768 | MIT | Hugging Face |

La comparación con alternativas es orientativa: no se dispone de resultados de benchmarks del modelo evaluado que permitan una comparación cuantitativa. `all-MiniLM-L6-v2` es mucho más pequeño y rápido pero de menor dimensión; `bge-base-zh-v1.5` es un competidor directo en chino con contexto mayor y licencia permisiva; `multilingual-e5-base` ofrece cobertura multilingüe a costa de más parámetros. La ventaja potencial del modelo de `liudev` es su especialización en el dominio narrativo, aunque sin métricas publicadas no puede confirmarse.

## Limitaciones y advertencias

- **Licencia no disponible**: no se declara licencia, lo que impide asumir derechos de uso comercial. Es imprescindible contactar con el autor antes de usarlo en producción.
- **Idiomas no declarados**: la model card no especifica idiomas soportados; los ejemplos son en chino, por lo que su rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- **Contexto limitado a 256 tokens**: los textos más largos se truncan, lo que puede degradar la calidad de recuperación en documentos extensos. Para pasajes largos habría que dividir en fragmentos.
- **Riesgo de alucinación no aplica directamente**: al ser un modelo de embeddings no genera texto, pero sí puede producir similitudes espurias si los textos están fuera de su dominio de entrenamiento.
- **Sesgos del corpus**: entrenado sobre 435.262 muestras de temática narrativa, puede reflejar sesgos de género, culturales o de representación presentes en las novelas utilizadas.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de rendimiento frente a alternativas; cualquier decisión de adopción debería basarse en una evaluación propia sobre el corpus objetivo.
- **Repo de 67,3 GB**: el tamaño del repositorio es desproporcionado para un modelo de 102 M de parámetros, lo que sugiere artefactos de entrenamiento (checkpoints, logs de TensorBoard) que conviene filtrar al descargar.
- **Sin variantes cuantizadas documentadas**: no se ofrecen pesos GGUF u ONNX, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liudev/novel-embedding-gpl-base-v2
- Modelo base: https://huggingface.co/liudev/novel-embedding-gpl-base-v1
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de MarginMSE (arXiv:2010.02666): https://arxiv.org/abs/2010.02666
