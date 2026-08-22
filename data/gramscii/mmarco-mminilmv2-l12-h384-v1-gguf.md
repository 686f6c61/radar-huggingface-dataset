# Gramscii/mmarco-mMiniLMv2-L12-H384-v1-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, un reranker multilingüe basado en la arquitectura cross-encoder. El autor de la conversión, Gramscii, lo publica para poder servir el modelo con `llama-server` de llama.cpp y exponerlo como un endpoint `/v1/rerank`, sin necesidad de usar PyTorch ni Sentence Transformers.

El modelo original fue desarrollado por Cross-Encoder y entrena sobre el dataset mMARCO, una traducción automática de MS MARCO a 14 idiomas realizada con Google Translate. Como base se usa `nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large`, un modelo MiniLMv2 de 12 capas con hidden size 384, destilado desde XLM-R Large. En total tiene 117,64 millones de parámetros y una ventana de contexto de 512 tokens.

La relevancia de esta conversión es práctica: permite ejecutar un reranker multilingüe en entornos donde se prefiere el runtime de llama.cpp, manteniendo los pesos originales sin cuantizar (f16). El autor justifica la elección de f16 frente a cuantizaciones más agresivas porque un reranker con umbral de relevancia necesita puntuaciones crudas estables, y una cuantización que preserve el orden podría desplazar una puntuación a través del umbral.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLMv2 (cross-encoder, 12 capas, hidden 384) |
| Parametros totales | 117.640.321 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | f16 (GGUF) |
| Idiomas soportados | 14 idiomas de entrenamiento (mMARCO): aleman, arabe, chino, espanol, frances, hindi, indonesio, italiano, japones, neerlandes, portugues, ruso, turco, vietnamita; segun el autor funciona bien en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (f16) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en MiniLMv2 L12-H384, destilado desde XLM-R Large. A diferencia de los bi-encoders que codifican query y pasaje por separado, un cross-encoder concatena ambos y los procesa conjuntamente, lo que produce puntuaciones de relevancia más precisas a costa de un coste computacional mayor por par. La capa de salida es una cabeza de clasificación de secuencia que emite un logit de relevancia.

El entrenamiento se realizó sobre mMARCO, una versión traducida de MS MARCO a 14 idiomas mediante Google Translate. No se han publicado detalles sobre el número exacto de pasos de entrenamiento, el optimizador o si se aplicó alguna técnica de regularización adicional. La model card original del modelo no publica benchmarks, por lo que la evaluación pública es limitada.

## Capacidades

- Reranking de pares query-pasaje: dado un query y una lista de candidatos, devuelve una puntuación de relevancia para cada uno.
- Multilingüe: entrenado en 14 idiomas, con buen comportamiento observado en idiomas no incluidos en el entrenamiento según el autor.
- Integración con llama.cpp: sirve como endpoint `/v1/rerank` mediante `llama-server` con `--reranking --pooling rank`.
- Compatible con pipelines de retrieval: puede usarse como etapa de reranking tras una primera búsqueda vectorial o léxica.
- No soporta generación de texto, tool calling ni razonamiento multi-step: es exclusivamente un modelo de clasificación de pares.

## Casos de uso

- Reranking en sistemas de recuperación híbrida: combinar una búsqueda vectorial o léxica inicial (que devuelve candidatos rápidos) con este modelo para reordenar los resultados por relevancia. Es adecuado porque el cross-encoder procesa query y pasaje juntos, lo que capta matices que los bi-encoders pierden.
- Búsqueda semántica multilingüe: dado que se entrenó en 14 idiomas, puede usarse para reranking de resultados en corpora multilingües sin necesidad de un modelo por idioma.
- Filtrado de pasajes en pipelines RAG: antes de enviar contexto a un LLM generador, se pueden seleccionar los pasajes más relevantes con este modelo, reduciendo el ruido y mejorando la fidelidad de las respuestas.
- Preguntas y respuestas sobre documentación técnica: en un corpus de manuales o wikis internos, el reranker puede priorizar los fragmentos que realmente contienen la respuesta frente a los que solo comparten palabras clave.
- Clasificación de relevancia en motores de búsqueda internos: para una intranet corporativa o un repositorio de código, el modelo puede puntuar resultados y aplicar un umbral de relevancia que descarte pasajes no pertinentes.
- Evaluación de calidad de retrieval en investigación: al ser un modelo ligero (117M) y ejecutable en CPU, sirve para experimentos de IR en entornos sin GPU, por ejemplo en validación de pipelines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base (`cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`) no incluye datos de MMLU, HumanEval ni otros benchmarks.

El autor de la conversión GGUF incluye una evaluación propia sobre un corpus italiano de 44 preguntas calificadas sobre 182 notas, más 10 preguntas sin respuesta. Los resultados comparan el modelo sin reranker (solo vectorial + léxico), Qwen3-Reranker-0.6B y este modelo:

| reranker | r@3 | r@5 | r@10 | silencio en 10 no respondibles | latencia mediana |
|---|---|---|---|---|---|
| ninguno (vectorial + léxico) | 33/44 | 33/44 | 37/44 | 5/10 | 19 ms |
| Qwen3-Reranker-0.6B | 38/44 | 41/44 | 42/44 | 6/10 | 18.340 ms |
| este modelo (PyTorch) | 42/44 | 42/44 | 43/44 | 7/10 | 364 ms |

El autor advierte que estos números provienen de un solo corpus, un idioma y un conjunto de preguntas específico, y que los umbrales de relevancia no se transfieren entre corpora. No deben tomarse como una garantía de rendimiento general.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF f16 ocupa 242 MB, por lo que cabe holgadamente en cualquier GPU moderna con 2 GB o más. También es ejecutable en CPU sin problemas.
- GPU recomendadas: cualquier GPU con soporte para CUDA o Vulkan (RTX 2060, RTX 3090, A100, etc.). No se requieren GPUs de alta gama.
- Ejecución en CPU: viable, el modelo es pequeño y la latencia será aceptable para la mayoría de los casos (el autor reporta 364 ms de mediana en PyTorch, aunque en llama.cpp puede variar).
- Opciones de despliegue: llama.cpp (`llama-server` con `--reranking --pooling rank`), también se puede cargar con vLLM o TGI si se convierte a safetensors, aunque el autor recomienda usar el modelo original en PyTorch si no se necesita el formato GGUF.
- Latencia: el autor mide una mediana de 364 ms en PyTorch para un par query-pasaje en su máquina; en llama.cpp la latencia dependerá de la GPU y el tamaño del pasaje.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| mmarco-mMiniLMv2-L12-H384-v1 (GGUF) | 117,64 M | 512 tokens | GGUF f16 | Apache 2.0 | Reranker multilingüe |
| Qwen3-Reranker-0.6B | ~0,6 B | no disponible | safetensors | Apache 2.0 | Reranker multilingüe |
| bge-reranker-v2-m3 | no disponible | 8192 tokens | safetensors | MIT | Reranker multilingüe |

El modelo es notablemente más pequeño que Qwen3-Reranker-0.6B y, en la evaluación del autor, lo supera en recall y latencia en su corpus italiano concreto. No obstante, Qwen3-Reranker-0.6B tiene más parámetros y puede generalizar mejor en otros dominios. bge-reranker-v2-m3 ofrece un contexto de 8192 tokens, muy superior a los 512 de este modelo, lo que lo hace más adecuado para pasajes largos.

## Limitaciones y advertencias

- Ventana de contexto limitada a 512 tokens: los pasajes más largos deben truncarse antes de enviarlos, o el servidor devolverá un error 500 en lugar de una puntuación.
- Truncamiento no automático en llama.cpp: a diferencia del modelo PyTorch, que trunca silenciosamente, llama.cpp no lo hace; hay que cortar el texto por tokens mediante el endpoint `/tokenize` del servidor.
- Contexto compartido entre slots: en `llama-server`, el contexto es compartido entre los slots de inferencia; si se dimensiona para un solo slot, los pasajes largos pueden provocar errores.
- Sesgo de los datos de entrenamiento: entrenado sobre mMARCO, que es una traducción automática de MS MARCO; puede heredar sesgos y errores de traducción de Google Translate.
- Riesgo de alucinación: no aplica, ya que es un modelo de clasificación, no generativo.
- Rendimiento no garantizado en otros idiomas: aunque el autor observa buen comportamiento en idiomas no entrenados, no hay benchmarks públicos que lo confirmen.
- Sin benchmarks públicos: la model card original no publica resultados de MMLU, GLUE ni otros, por lo que no se puede comparar objetivamente con otros rerankers en métricas estándar.
- Uso comercial: licencia Apache 2.0, sin restricciones de uso comercial, pero hay que citar la atribución del modelo base y los datos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Gramscii/mmarco-mMiniLMv2-L12-H384-v1-GGUF
- Modelo original (cross-encoder): https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Modelo base (nreimers): https://huggingface.co/nreimers/mmarco-mMiniLMv2-L12-H384-v1
- Dataset mMARCO: https://huggingface.co/datasets/unicamp-dl/mmarco
- Base distilada MiniLMv2: https://huggingface.co/nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large
- Página del modelo en ModelScope: https://www.modelscope.cn/models/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
