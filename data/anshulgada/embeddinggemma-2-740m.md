# Anshulgada/embeddinggemma-2-740m

## Resumen

EmbeddingGemma 2 (740M) es un modelo de embeddings publicado por el usuario Anshulgada en Hugging Face, derivado del modelo base `google/embeddinggemma-2` de Google DeepMind. Se trata de un checkpoint aislado y modularizado de unos 740 millones de parametros (744.371.512 exactos segun los pesos safetensors), orientado a la generacion de representaciones vectoriales para similitud semantica, extraccion de caracteristicas y recuperacion de informacion (RAG).

El modelo se apoya en la arquitectura transformer de Gemma 2 y produce vectores de 768 dimensiones con soporte nativo de Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings a 512, 256 o 128 dimensiones con una simple re-normalizacion. Su ventana de contexto de 8.192 tokens lo hace adecuado para indexar documentos de longitud considerable.

Su relevancia actual radica en la combinacion de tres factores: un tamano contenido que permite inferencia en hardware modesto, la licencia Apache 2.0 que habilita uso comercial sin restricciones, y la compatibilidad directa con la libreria sentence-transformers, lo que facilita su integracion en pipelines de busqueda semantica y fine-tuning ligero para dominios especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 2 (backbone de embeddings) |
| Parametros totales | 744.371.512 (~740M) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | bfloat16, float16, float32 (no se documentan cuantizaciones adicionales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,5 GB de tamano de repositorio) |

Datos adicionales: vocabulario de 256.000 tokens (tokenizador SentencePiece de Gemma 2) y dimension de salida de 768 con soporte Matryoshka hasta 128 dimensiones.

## Arquitectura y entrenamiento

El modelo utiliza el backbone transformer de Gemma 2 de Google DeepMind, adaptado como modelo de embeddings. La model card lo describe como un backbone multimodal completo de ~740M de parametros, aunque no se detallan los componentes multimodales especificos ni su configuracion exacta. La generacion de embeddings se realiza mediante mean pooling sobre los hidden states finales, seguido de normalizacion L2.

No se ha publicado informacion sobre el proceso de entrenamiento del modelo base original (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineacion), ya que este repositorio es un checkpoint derivado sin entrenamiento adicional por parte del autor. La innovacion tecnica mas destacable documentada es el soporte nativo de Matryoshka Representation Learning (MRL), que permite reducir la dimensionalidad del vector de salida (768d a 512d, 256d o 128d) truncando los primeros N elementos y re-normalizando, con perdida minima de calidad de recuperacion.

## Capacidades

- Generacion de embeddings de frase y documento de 768 dimensiones para similitud semantica (cosine similarity).
- Extraccion de caracteristicas (feature extraction) para clustering, clasificacion y analisis de texto.
- Soporte nativo de Matryoshka Representation Learning: truncado a 512d, 256d o 128d mediante slicing y re-normalizacion.
- Ventana de contexto de 8.192 tokens, adecuada para indexar parrafos y documentos largos.
- Compatibilidad con la libreria sentence-transformers y con transformers de Hugging Face.
- Base preparada para fine-tuning ligero en dominios especificos (existe una version afinada por el mismo autor para clasificacion de pestañas de navegador).
- La model card menciona un backbone multimodal completo, aunque no documenta capacidades de vision o audio verificables en este checkpoint.

## Casos de uso

- Busqueda semantica en RAG: los embeddings de 768d con contexto de 8.192 tokens permiten indexar chunks de documentos extensos y recuperar pasajes relevantes para alimentar un LLM generativo en sistemas de generacion aumentada por recuperacion.
- Sistemas de recuperacion con recursos limitados: gracias al soporte MRL, se pueden almacenar vectores de 128d en lugar de 768d, reduciendo el consumo de memoria de indices vectoriales en un factor de 6 sin re-entrenar el modelo.
- Clustering y organizacion de contenido: la extraccion de caracteristicas permite agrupar documentos, URLs o mensajes por similitud semantica; el propio autor lo aplica a clustering de URLs e historial de navegacion en su version afinada.
- Clasificacion zero-shot y few-shot de texto: los embeddings pueden alimentar clasificadores ligeros (regresion logistica, k-NN) para categorizar tickets, comentarios o pestañas de navegador con pocos ejemplos de entrenamiento.
- Deteccion de duplicados y deduplicacion de corpora: la similitud coseno sobre embeddings normalizados permite identificar contenido duplicado o casi duplicado a gran escala en bases de datos documentales.
- Fine-tuning para dominios verticales: al ser un checkpoint base aislado, es un punto de partida idoneo para afinar con tripletas contrastivas en dominios especificos (el autor publica una version afinada con 18.000 tripletas que alcanza, segun su model card, un 98,5% de precision a 128 dimensiones).
- Inferencia en dispositivo: el tamano de 1,5 GB en pesos hace viable su ejecucion en portatiles o entornos edge, incluida la inferencia en navegador via WebGPU mencionada en la model card de la version afinada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada en la model card corresponde a la version afinada del autor (`Anshulgada/tabman-embeddinggemma-2-740m`), que declara un 98,5%+ de precision en clasificacion de pestañas a 128 dimensiones; no existen datos de MTEB ni de otros benchmarks estandar para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en bfloat16/float16 (tamano del repositorio en safetensors) y alrededor de 3 GB en float32; con batch de inferencia y overhead de runtime, 2-4 GB de VRAM son suficientes.
- Adecuado para GPUs de consumo: cualquier GPU moderna con 4 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) ejecuta el modelo sin problemas; no se requieren A100 ni H100.
- Tambien es ejecutable en CPU dado su tamano contenido, con latencias mayores.
- Opciones de despliegue: sentence-transformers (via recomendada), transformers de Hugging Face, y en principio compatible con backends estandar de embeddings (no se documenta soporte especifico de vLLM, TGI, llama.cpp u Ollama para este checkpoint).
- Latencia y throughput: no disponible; al tratarse de un modelo de ~740M de parametros, se esperan latencias de codificacion de milisegundos por lote en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | MRL | Licencia |
|---|---|---|---|---|---|
| Anshulgada/embeddinggemma-2-740m | ~740M | 768d (truncable a 512/256/128) | 8.192 tokens | Si | Apache 2.0 |
| Anshulgada/embeddinggemma-2-270m | ~270M | no disponible | no disponible | Si (segun model card) | Apache 2.0 |
| Anshulgada/embeddinggemma-2-440m | ~440M | no disponible | no disponible | Si (segun model card) | Apache 2.0 |
| google/embeddinggemma-2 (modelo base original) | ~740M | no disponible | no disponible | no disponible | no disponible |

La familia publicada por el autor ofrece tres tamanos: la variante de 270M esta orientada a texto y codigo con inferencia en navegador, la de 440M a multimodalidad texto mas vision, y esta de 740M al backbone multimodal completo. Para comparativas frente a otros modelos de embeddings del mercado (por ejemplo, bge, E5 o gte), no se dispone de datos de rendimiento publicados para este checkpoint.

## Limitaciones y advertencias

- Idioma: la model card declara soporte unicamente para ingles (en); el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Se trata de un checkpoint base sin afinar: para tareas especificas de recuperacion o clasificacion puede requerir fine-tuning para alcanzar rendimiento optimo.
- La model card describe el modelo como multimodal (texto, vision y audio), pero no se documenta como explotar esas modalidades en este repositorio; hay que tratar las capacidades multimodales como no verificadas.
- No existen benchmarks independientes (MTEB u otros) que permitan validar la calidad de los embeddings frente a alternativas establecidas.
- El repositorio presenta 0 descargas y 0 likes, por lo que carece de validacion comunitaria; conviene probarlo antes de usarlo en produccion.
- Riesgo de alucinacion: no aplicable directamente al tratarse de un modelo de embeddings, pero la calidad de la similitud semantica puede degradar en dominios fuera de distribucion.
- Licencia: Apache 2.0, sin restricciones para uso comercial; los pesos derivan de Google DeepMind, cuya model card original podria contener terminos de uso adicionales que conviene revisar.
- Las cifras de precision de la version afinada (98,5%) provienen de la model card del propio autor y no han sido verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anshulgada/embeddinggemma-2-740m
- Modelo base original: https://huggingface.co/google/embeddinggemma-2
- Version afinada por el autor: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-740m
- Variante 270M: https://huggingface.co/Anshulgada/embeddinggemma-2-270m
- Variante 440M: https://huggingface.co/Anshulgada/embeddinggemma-2-440m
- Version afinada 270M: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-270m
- Version afinada 440M: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-440m
- Libreria sentence-transformers: https://sbert.net/
