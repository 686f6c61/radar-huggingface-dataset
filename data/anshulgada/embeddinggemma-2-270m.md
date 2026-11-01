# Anshulgada/embeddinggemma-2-270m

## Resumen

EmbeddingGemma 2 (270M - Base Backbone) es un modelo de embeddings de texto publicado por el usuario Anshulgada en Hugging Face, derivado del modelo base `google/embeddinggemma-2` de Google DeepMind. Se trata de un checkpoint aislado y modularizado de aproximadamente 270 millones de parametros (271.002.648 segun los metadatos de safetensors), concebido como fundacion para fine-tuning ligero, recuperacion aumentada por generacion (RAG) y similitud semantica zero-shot.

El modelo se basa en la arquitectura transformer Gemma 2 de Google, genera vectores de 768 dimensiones con soporte nativo de Matryoshka Representation Learning (MRL) que permite truncar a 512d, 256d o 128d, y admite una ventana de contexto de 8.192 tokens. Su licencia Apache 2.0 lo hace apto para uso comercial sin restricciones relevantes.

Su relevancia actual radica en la tendencia a desplegar modelos de embeddings pequenos y eficientes en entornos con recursos limitados (navegador, edge, CPU), donde un modelo de 270M con dimensiones truncables reduce drasticamente los costes de almacenamiento e inferencia. El autor lo utiliza como base de su familia de modelos "Tabman", con variantes fine-tuned para clasificacion de pestanas de navegador e inferencia via WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 2 (backbone de embeddings) |
| Parametros totales | 271.002.648 (~270M) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | bfloat16, float16, float32 (precisiones nativas; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers y transformers) |

Especificaciones adicionales documentadas:

| Parametro | Valor |
|---|---|
| Dimension de salida | 768 (truncable a 512, 256 o 128 via MRL) |
| Tamano de vocabulario | 256.000 tokens (tokenizador SentencePiece de Gemma 2) |
| Tamano del repositorio | 0,6 GB |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo emplea el backbone transformer de Gemma 2 de Google, adaptado como modelo de embeddings. La salida se obtiene mediante mean pooling sobre los token embeddings de la ultima capa oculta, seguido de normalizacion L2, tal como muestra el ejemplo de uso con la libreria `transformers`. El tokenizador es SentencePiece con un vocabulario de 256.000 tokens, heredado de la familia Gemma 2.

La caracteristica tecnica mas destacable es el soporte nativo de Matryoshka Representation Learning (MRL): los embeddings de 768 dimensiones pueden truncarse a las primeras 512, 256 o 128 dimensiones y renormalizarse, manteniendo calidad de recuperacion util con vectores mucho mas pequenos. Esto reduce el consumo de memoria en indices vectoriales y acelera las busquedas de similitud.

No se ha publicado informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset ni procesos de RLHF/DPO en la documentacion disponible. El modelo se presenta como checkpoint base sin fine-tuning especifico; la version ajustada por el autor (`Anshulgada/tabman-embeddinggemma-2-270m`) se entreno con 18.000 triplets contrastivos para dominio web.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para similitud semantica y feature extraction.
- Truncamiento Matryoshka a 512d, 256d o 128d con simple slicing y renormalizacion.
- Procesamiento de secuencias de hasta 8.192 tokens, adecuado para documentos y chunks largos de RAG.
- Backbone especializado en texto y codigo segun la model card.
- Similitud semantica zero-shot sin necesidad de fine-tuning previo.
- Integracion nativa con la libreria sentence-transformers (`SentenceTransformer`) y con `transformers` de Hugging Face.
- Base preparada para fine-tuning contrastivo ligero en dominios especificos.
- No soporta generacion de texto, tool calling, agentes ni modalidades de vision o audio (es un modelo de embeddings puro).

## Casos de uso

- Busqueda semantica en aplicaciones RAG: sus 8.192 tokens de contexto permiten indexar chunks largos de documentos, y el truncamiento Matryoshka a 128d o 256d reduce el tamano del indice vectorial sin perder calidad de recuperacion relevante.
- Sistemas de recuperacion en dispositivos con recursos limitados: con 0,6 GB de pesos y 270M de parametros, puede ejecutarse en CPU o en entornos edge donde modelos de embeddings mayores no son viables.
- Clustering y organizacion de contenido: el autor lo emplea como base para agrupar URLs e historial de navegacion; el mismo enfoque sirve para agrupar tickets, correos o documentos por tematica.
- Deteccion de duplicados y deduplicacion de corpora: la similitud coseno sobre embeddings normalizados permite identificar contenido repetido a escala.
- Base para fine-tuning de dominio: al ser un checkpoint base con licencia Apache 2.0, es punto de partida para entrenar embeddings especializados (legal, medico, e-commerce) con triplets contrastivos.
- Inferencia en navegador: la familia Tabman demuestra despliegue via WebGPU para extensiones de navegador, un escenario donde el tamano reducido y las dimensiones truncables son decisivos.
- Clasificacion semantica ligera: asignacion de categorias por proximidad a embeddings de referencia (zero-shot o con fine-tuning ligero).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la precision del modelo fine-tuned derivado (98,5%+ a 128 dimensiones en el dominio de clasificacion de pestanas de Tabman), dato que corresponde a `Anshulgada/tabman-embeddinggemma-2-270m` y no a este checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en bfloat16/float16 (tamano del repositorio) y en torno a 1,1 GB en float32; en CPU, memoria RAM equivalente.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; no se requiere hardware acelerador dedicado de gama alta (A100/H100) para inferencia.
- Consumer GPUs: cabe con holgura en GPUs de consumo como la RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso GPUs integradas; tambien es plenamente viable su ejecucion solo en CPU dado el tamano reducido.
- Despliegue: sentence-transformers y transformers de Hugging Face de forma nativa; compatible con backends de inferencia estandar para embeddings (ONNX Runtime, sentence-transformers con OpenVINO, o servicios como TEI - Text Embeddings Inference). No se documenta soporte especifico para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; por su tamano (270M) se espera latencia baja y alto throughput en batch en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Anshulgada/embeddinggemma-2-270m (este modelo) | ~270M | 768 (MRL hasta 128d) | 8.192 | Apache 2.0 | Base sin fine-tuning, derivada de Google |
| google/embeddinggemma-2 | ~270M | 768 (MRL hasta 128d) | 8.192 | Apache 2.0 | Modelo original de Google DeepMind, del que este deriva |
| Anshulgada/tabman-embeddinggemma-2-270m | ~270M | 768 (MRL hasta 128d) | 8.192 | no disponible | Version fine-tuned para dominio web/Tabman |
| sentence-transformers/all-MiniLM-L6-v2 | ~22M | 384 | 256 | Apache 2.0 | Alternativa mucho mas ligera, contexto muy inferior |
| BAAI/bge-small-en-v1.5 | ~33M | 384 | 512 | MIT | Alternativa compacta muy usada en RAG |

Frente a alternativas ligeras como all-MiniLM-L6-v2 o bge-small, este modelo ofrece un contexto mucho mayor (8.192 frente a 256-512 tokens) y soporte MRL, a costa de un tamaño notablemente superior. No hay benchmarks comparativos publicados para este checkpoint.

## Limitaciones y advertencias

- Idioma: la model card declara soporte solo para ingles (en); no hay garantias de calidad en castellano ni otros idiomas.
- Es un checkpoint base sin fine-tuning: para tareas de dominio especifico puede requerir ajuste contrastivo para rendir al nivel de embeddings especializados.
- No genera texto: es exclusivamente un modelo de embeddings; no debe evaluarse como LLM generativo.
- No hay benchmarks publicados (MTEB u otros) para este repositorio concreto, por lo que su calidad relativa frente a otros modelos de embeddings no puede verificarse con datos.
- Descargas y likes en Hugging Face: 0 en el momento de la ficha, lo que indica adopcion minima y ausencia de validacion comunitaria.
- Sesgos y riesgo de alucinacion: al no ser generativo, no hay alucinaciones en el sentido clasico, pero los embeddings pueden heredar sesgos del preentrenamiento de Gemma 2; no se documenta analisis de sesgos.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque los pesos derivan de `google/embeddinggemma-2` y conviene verificar los terminos del modelo original de Google.
- La model card incluye una matriz de variantes (440M y 740M multimodales) que no corresponde a este repositorio; este checkpoint es solo texto y codigo de 270M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anshulgada/embeddinggemma-2-270m
- Modelo base de Google: https://huggingface.co/google/embeddinggemma-2
- Version fine-tuned (Tabman): https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-270m
- Variante base 440M: https://huggingface.co/Anshulgada/embeddinggemma-2-440m
- Variante fine-tuned 440M: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-440m
- Variante base 740M: https://huggingface.co/Anshulgada/embeddinggemma-2-740m
- Variante fine-tuned 740M: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-740m
- Documentacion de sentence-transformers: https://sbert.net/
