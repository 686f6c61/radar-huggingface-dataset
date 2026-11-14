# shogoorg/my-embeddinggemma-2-finetuned.litert

## Resumen

`shogoorg/my-embeddinggemma-2-finetuned.litert` es un modelo de embeddings de frases (sentence transformer) afinado a partir de `google/embeddinggemma-2`. Lo desarrolla el usuario `shogoorg` y su proposito es mapear entradas textuales a un espacio vectorial denso de 768 dimensiones para tareas de similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y agrupamiento. La arquitectura subyacente es `EmbeddingGemma2Model`, un transformer encoder con pooling por media y normalizacion posterior, con 271.002.648 parametros totales segun los pesos en safetensors.

El modelo se distribuye bajo la libreria `sentence-transformers` y expone las funciones `encode_query` y `encode_document`, lo que sugiere un diseno orientado a recuperacion asimetrica (query-document). El repositorio ocupa 1,1 GB y esta etiquetado como compatible con endpoints de Hugging Face. La model card declara soporte multimodal (texto, imagen, audio, video y mensaje estructurado) a nivel de configuracion del transformer, aunque el entrenamiento documentado se limita a pares de texto.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ajuste fino con un conjunto de entrenamiento de solo 3 muestras, lo que lo convierte en un caso de sobreajuste extremo mas que en un modelo listo para produccion. Resulta util como ejemplo de pipeline de fine-tuning con `MultipleNegativesRankingLoss` y como advertencia sobre la publicacion de modelos con datos de entrenamiento insuficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer sobre `EmbeddingGemma2Model` (transformer encoder); pooling por media + normalizacion |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card muestra un valor corrupto: `1000000000000000019884624838656` tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Funcion de similitud | similitud coseno |
| Modalidades declaradas | texto, imagen, audio, video, mensaje estructurado |
| Tamano del repositorio | 1,1 GB |
| Modelo base | `google/embeddinggemma-2` (revision `f9972ac22e696a105c482202646979e33e4b5a1e`) |
| Funcion de perdida | `MultipleNegativesRankingLoss` |

## Arquitectura y entrenamiento

La arquitectura es un `SentenceTransformer` compuesto por tres modulos: un transformer de extraccion de caracteristicas (`EmbeddingGemma2Model`) que devuelve `last_hidden_state` y `token_embeddings`; un pooling por media que proyecta a 768 dimensiones con `include_prompt: True`; y una capa de normalizacion L2 sobre el embedding de frase. La configuracion del transformer define metodos `forward` para las modalidades texto, imagen, audio, video y mensaje estructurado, aunque no se documenta si los pesos multimodales estan efectivamente entrenados.

El entrenamiento se realizo con `MultipleNegativesRankingLoss`, una funcion de perdida contrastiva que utiliza los positivos del lote como negativos para el resto de pares (InfoNCE). El conjunto de datos documentado contiene unicamente 3 muestras con columnas `anchor`, `positive` y `negative`, con longitudes medias de 12,0, 15,33 y 12,67 tokens respectivamente. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para similitud semantica entre textos.
- Recuperacion asimetrica query-document mediante `encode_query` y `encode_document`.
- Busqueda semantica sobre corpus documentales.
- Mineria de parafrasis y deteccion de duplicados semanticos.
- Clasificacion de texto basada en representaciones vectoriales.
- Agrupamiento (clustering) de documentos o frases por similitud coseno.
- Soporte declarado de multiples modalidades (texto, imagen, audio, video, mensaje estructurado) a nivel de configuracion, sin evidencia de entrenamiento multimodal.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo generativo).

## Casos de uso

- Busqueda semantica en bases documentales pequenas: el modelo permite indexar documentos y recuperar los mas relevantes ante una consulta, usando la similitud coseno entre embeddings de query y documento. Adecuado por su dimension compacta de 768 y su API `encode_query`/`encode_document`.
- Deduplicacion de registros en un CRM: agrupar entradas con alta similitud semantica para consolidar contactos o tickets repetidos, aprovechando el pooling por media y la normalizacion.
- Clasificacion de tickets de soporte por similitud a prototipos: asignar cada ticket al cluster cuyo centroide de embedding sea mas cercano, sin necesidad de un clasificador supervisado adicional.
- Mineria de parafrasis en corpus de preguntas frecuentes: detectar preguntas formuladas de forma distinta pero con la misma intencion, util para enriquecer bases de conocimiento.
- Filtrado de contenido duplicado en pipelines de ingesta: comparar embeddings de articulos o publicaciones para descartar versiones redundantes antes de indexar.
- Prototipado rapido de sistemas RAG: usar el modelo como retriever base en un pipeline de recuperacion aumentada, sustituyendolo posteriormente por un modelo con entrenamiento mas robusto si la calidad no es suficiente.
- Evaluacion comparativa de pipelines de fine-tuning: servir como ejemplo reproducible de ajuste con `MultipleNegativesRankingLoss` y `sentence-transformers` para experimentar con conjuntos de datos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos (271 M de parametros), mas overhead de activaciones y tokenizador; en la practica, entre 1,5 y 2,5 GB segun longitud de secuencia y tamano de lote.
- VRAM estimada en FP16/BF16: alrededor de 0,55 GB para pesos, con overhead adicional; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequenos; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes o indexacion masiva, se recomienda A100 o H100 por ancho de banda de memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `sentence-transformers` (nativo), `transformers` con extraccion manual y pooling, `vLLM` no aplica (no es generativo), `llama.cpp` y `Ollama` no soportan este formato de forma nativa, `TGI` (Text Generation Inference) no aplica. Para servir embeddings se puede usar `sentence-transformers` con un servidor HTTP propio, `FastAPI` o `TEI` (Text Embeddings Inference) si se convierte el modelo al formato esperado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shogoorg/my-embeddinggemma-2-finetuned.litert` | 271 M | 768 | no disponible | no disponible | Hugging Face |
| `google/embeddinggemma-2` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `sentence-transformers/all-MiniLM-L6-v2` | no disponible | 384 | no disponible | no disponible | Hugging Face |
| `BAAI/bge-small-en-v1.5` | no disponible | 384 | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas con alternativas. La comparativa se limita a parametros y dimension de embedding cuando estan disponibles.

## Limitaciones y advertencias

- Conjunto de entrenamiento de solo 3 muestras: el ajuste fino es practicamente insignificante y el modelo probablemente conserva el comportamiento del modelo base, con riesgo alto de sobreajuste a esas tres muestras.
- La model card declara soporte multimodal (imagen, audio, video) sin evidencia de entrenamiento en esas modalidades; no se debe asumir que los embeddings multimodales sean de calidad.
- La longitud de contexto declarada en la model card esta corrupta (`1000000000000000019884624838656` tokens), lo que impide conocer la ventana real de entrada.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; se debe contactar con el autor o consultar la licencia del modelo base `google/embeddinggemma-2`.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingue.
- Riesgo de alucinacion no aplica directamente (no es generativo), pero si de recuperacion irrelevante si se usa como retriever en produccion.
- Sesgos conocidos: no documentados; al derivar de un modelo base de Google, hereda los sesgos de sus datos de preentrenamiento, que no se detallan.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validacion externa.
- No apto para produccion sin una evaluacion previa sobre el dominio objetivo; el ajuste con 3 muestras no proporciona garantias de mejora frente al modelo base.

## Enlaces

- [Hugging Face: shogoorg/my-embeddinggemma-2-finetuned.litert](https://huggingface.co/shogoorg/my-embeddinggemma-2-finetuned.litert)
- [Modelo base: google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [Documentacion de Sentence Transformers](https://sbert.net)
- [Repositorio de Sentence Transformers en GitHub](https://github.com/huggingface/sentence-transformers)
- [Sentence Transformers en Hugging Face](https://huggingface.co/models?library=sentence-transformers)
- [Paper de MultipleNegativesRankingLoss (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper de Sentence-BERT (arXiv:1807.03748)](https://arxiv.org/abs/1807.03748)
