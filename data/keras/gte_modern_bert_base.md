# keras/gte_modern_bert_base

## Resumen

`keras/gte_modern_bert_base` es un modelo de embeddings de texto (tarea `TextEmbedder`) construido sobre la arquitectura ModernBERT y empaquetado con la librería KerasHub. Lo publica la organizacion Keras en HuggingFace y su proposito es generar representaciones vectoriales densas de texto, utiles para busqueda semantica, recuperacion de informacion, clustering y similitud entre frases. El modelo forma parte del ecosistema GTE (General Text Embeddings) trasladado al formato multi-backend de Keras.

Tecnicamente se trata de un transformer encoder de 22 capas con `hidden_dim` de 768, 12 cabezas de atencion, `intermediate_dim` de 1152 y un vocabulario de 50.368 tokens. Incorpora atencion local con ventana de 128 tokens combinada con capas de atencion global cada 3 capas, ademas de embeddings rotatorios (RoPE) con longitud de onda maxima de 160.000, lo que es caracteristico de la familia ModernBERT.

Su relevancia radica en que permite ejecutar el mismo codigo Keras sobre backends JAX, TensorFlow y PyTorch, lo que facilita el despliegue en infraestructuras heterogeneas. No obstante, la model card es automatica y no incluye informacion sobre licencia, idiomas, datos de entrenamiento ni resultados de benchmarks, por lo que la evaluacion en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder con atencion local y global alternada) |
| Parametros totales | no disponible (repo de 0,6 GB en float32; estimacion aproximada de 110-150 M segun configuracion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; ventana de atencion local de 128 tokens y atencion global cada 3 capas |
| Tipos de cuantizacion | no disponible (pesos en float32; compatible con tecnicas estandar de Keras/JAX/PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos KerasHub (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT: un encoder transformer de 22 capas con 12 cabezas de atencion, dimension oculta de 768 y dimension intermedia de 1152. La innovacion principal frente a BERT clasico es la combinacion de atencion local con ventana deslizante de 128 tokens y capas de atencion global intercaladas cada 3 capas, lo que reduce el coste computacional en secuencias largas manteniendo capacidad de modelar dependencias globales. Emplea embeddings rotatorios (RoPE) con `rotary_max_wavelength` de 160.000 para la atencion global y 10.000 para la local, y normalizacion con epsilon de 1e-5.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste contrastivo especifico para la tarea de embeddings. La model card indica que el modelo es entrenable (`trainable: True`) y que se distribuye como backbone de ModernBERT adaptado a `TextEmbedder`, pero no detalla el proceso de entrenamiento ni la funcion de perdida utilizada.

## Capacidades

- Generacion de embeddings de texto densos para similitud semantica y recuperacion.
- Busqueda semantica y recuperacion aumentada (RAG) mediante representaciones vectoriales.
- Clustering y clasificacion no supervisada de documentos a partir de embeddings.
- Deteccion de duplicados y near-duplicates en corpus textuales.
- Soporte multi-backend: el mismo modelo se ejecuta en JAX, TensorFlow y PyTorch a traves de KerasHub.
- Capacidad de fine-tuning sobre la tarea `TextEmbedder` para dominios especificos.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles (no se especifica cobertura de idiomas).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos como embeddings y recuperar los fragmentos mas relevantes para una consulta, aprovechando la ventana de atencion local y global para manejar parrafos de longitud media.
- RAG en asistentes corporativos: generar embeddings de fragmentos de conocimiento interno y alimentar un motor de recuperacion vectorial antes de pasar el contexto a un LLM generador.
- Deduplicacion de tickets de soporte: calcular similitud coseno entre embeddings de incidencias para agrupar casos equivalentes y reducir carga manual en mesas de ayuda.
- Clustering de feedback de usuarios: agrupar resenas o comentarios por tematica sin etiquetas previas, usando los embeddings como entrada a algoritmos como k-means o HDBSCAN.
- Moderacion de contenido asistida: comparar embeddings de mensajes entrantes con embeddings de referencia de contenido problematico para priorizar revision humana.
- Fine-tuning para dominio juridico o medico: reentrenar el backbone `TextEmbedder` con pares (consulta, documento) especificos del sector para mejorar la recuperacion en jerga especializada.
- Clasificacion de documentos por similitud: usar embeddings como caracteristicas de entrada a clasificadores ligeros en pipelines de enrutamiento documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 0,6 GB de pesos, mas overhead de activaciones; cabe holgadamente en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para lotes grandes, se recomienda A100 o H100 por ancho de banda de memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer reciente e incluso en CPU para cargas moderadas.
- Opciones de despliegue: KerasHub con backend JAX, TensorFlow o PyTorch. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de embeddings y no generativo.
- Latencia y throughput estimados: no disponibles. Dependeran del backend, del tamano de lote y de la longitud de secuencia; la atencion local de 128 tokens reduce el coste en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keras/gte_modern_bert_base | no disponible (aprox. 110-150 M) | ventana local 128 + global cada 3 capas | Embeddings | no disponible | HuggingFace (KerasHub) |
| BAAI/bge-base-en-v1.5 | 109 M | 512 tokens | Embeddings | MIT | HuggingFace |
| intfloat/e5-base-v2 | 109 M | 512 tokens | Embeddings | MIT | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | 22 M | 256 tokens | Embeddings | Apache 2.0 | HuggingFace |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card es automatica y no documenta sesgos conocidos, composicion del dataset ni evaluacion de robustez.
- Riesgo de alucinacion no aplica directamente al ser un modelo de embeddings, pero los vectores generados pueden reflejar sesgos presentes en los datos de entrenamiento originales, no documentados.
- No se especifican los idiomas soportados; el uso en castellano requiere validacion empirica previa.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar el repositorio antes de desplegarlo en produccion.
- No se documenta la longitud maxima de contexto efectiva; la ventana local de 128 tokens y la atencion global cada 3 capas condicionan el rendimiento en secuencias muy largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion comunitaria.
- No se ofrecen pesos en formatos GGUF ni safetensors estandar, lo que limita su integracion con herramientas de inferencia habituales fuera del ecosistema Keras.

## Enlaces

- HuggingFace: https://huggingface.co/keras/gte_modern_bert_base
- Documentacion de ModernBert en KerasHub: https://keras.io/api/keras_hub/models/modern_bert
- Documentacion de Keras: https://keras.io/
- Keras 3 multi-backend: https://keras.io/keras_3/
- Wikipedia Keras (EN): https://en.wikipedia.org/wiki/Keras
- Wikipedia Keras (FR): https://fr.wikipedia.org/wiki/Keras
- GeeksforGeeks, introduccion a Keras: https://www.geeksforgeeks.org/deep-learning/what-is-keras/
