# skkut/qwen3-embedding-0.6b-q4f16_1-MLC

## Resumen

El modelo `skkut/qwen3-embedding-0.6b-q4f16_1-MLC` es una compilación del modelo de embeddings `Qwen3-Embedding-0.6B` de Alibaba, realizada con el compilador MLC (Machine Learning Compilation) y empaquetada en el formato de web-llm 0.2.84. Su propósito es ejecutar la generación de embeddings de texto directamente en el navegador mediante WebGPU, sin necesidad de servidores externos ni de GPU dedicadas de alta gama. El modelo pertenece a la familia Qwen3-Embedding, diseñada específicamente para tareas de recuperación semántica y ranking de pasajes, y destaca por su capacidad multilingüe y su tamaño compacto.

Esta compilación concreta utiliza cuantización `q4f16_1`, una ventana de contexto de 2048 tokens y una dimensión de embedding de 1024, con pooling de último token y normalización L2 integrada en el modelo compilado. El tamaño total de los pesos es de aproximadamente 335 MB, lo que la convierte en la versión más ligera de la serie Qwen3-Embedding compilada para WebGPU. Es relevante porque permite desplegar embeddings de alta calidad directamente en el navegador, con un consumo de VRAM estimado en 1,5 GB, haciéndolo viable en GPUs de gama media o incluso integradas que soporten WebGPU.

La licencia Apache-2.0 permite su uso comercial sin restricciones, y la compilación se ha verificado en GPU NVIDIA. El modelo se publica con 9 shards de pesos, el tokenizador de Qwen3 y un binario wasm que contiene la lógica de inferencia. No se han publicado resultados de benchmarks específicos para esta compilación, pero el modelo base `Qwen3-Embedding-0.6B` es conocido por su buen equilibrio entre rendimiento y tamaño en tareas de retrieval multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-Embedding-0.6B) |
| Parametros totales | 0,6B (aproximadamente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (configurado en esta compilacion) |
| Tipos de cuantizacion | q4f16_1 (unica disponible en esta compilacion) |
| Idiomas soportados | Multilingue (serie Qwen3; lista exacta no especificada) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (shards .bin) + wasm (biblioteca de inferencia) |

## Arquitectura y entrenamiento

El modelo base `Qwen3-Embedding-0.6B` es un transformer denso de la serie Qwen3, diseñado exclusivamente para tareas de embeddings y ranking. No se dispone de información detallada sobre el dataset de entrenamiento ni el proceso de optimización (p. ej., si se usó RLHF o DPO) en la información proporcionada. El modelo se entrena para producir representaciones vectoriales de texto, con un objetivo de recuperación de pasajes relevantes para consultas.

La compilación MLC transforma el modelo original a un formato optimizado para WebGPU. La cuantización `q4f16_1` reduce los pesos a 4 bits para las matrices de proyección y mantiene las activaciones en fp16, lo que permite un tamaño de pesos de ~335 MB. La ruta fp8 (8 bits) no está disponible para WebGPU debido a limitaciones del codegen de TVM, que solo emite instrucciones f16/f32. Por ello, `q4f16_1` es la opción más eficiente en memoria para este entorno. El modelo incluye pooling de last-token y normalización L2 integradas en el grafo compilado, lo que simplifica el uso en el cliente.

## Capacidades

- Generacion de embeddings de texto (feature-extraction) con dimension de salida 1024.
- Pooling de last-token y normalizacion L2 aplicados automaticamente en el modelo compilado.
- Soporte de prefijo de instruccion especifico de Qwen3 para consultas de busqueda: `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: ...`.
- Capacidad multilingue (la serie Qwen3 cubre ingles y chino principalmente, aunque no se especifican idiomas exactos en esta compilacion).
- Ejecucion en navegador via WebGPU, sin servidor dedicado.
- Optimizado para cargas de trabajo de recuperacion (retrieval) y ranking de pasajes.
- No incluye generacion de texto, tool calling ni capacidades de agente; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en el navegador: integrar el modelo en una aplicacion web para indexar y buscar documentos locales o corporativos sin enviar datos a un servidor externo. El usuario escribe una consulta, el modelo genera el embedding y se comparan con los embeddings precalculados de la base de datos.
- Chatbots con memoria de contexto: usar los embeddings para recuperar pasajes relevantes de un corpus y alimentar un LLM generativo, mejorando la precision de las respuestas sin ampliar el contexto.
- Clasificacion de textos en tiempo real: clasificar comentarios, tickets o emails en categorias predefinidas calculando la similitud coseno entre embeddings y prototipos de cada clase.
- Deteccion de duplicados o similitud entre documentos: comparar embeddings de articulos, productos o mensajes para detectar contenido duplicado o sugerir documentos relacionados.
- RAG (Retrieval-Augmented Generation) en el cliente: integrar el modelo en una aplicacion web que haga retrieval de pasajes de una base de conocimiento y los pase a un LLM generativo para responder preguntas.
- Filtrado de contenido por relevancia: prefiltrar resultados de busqueda o feeds de noticias en el navegador, evitando llamadas a APIs externas y reduciendo latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta compilacion MLC en la informacion disponible. El modelo base `Qwen3-Embedding-0.6B` ha sido evaluado por los autores en tareas de retrieval multilingue, pero no se proporcionan cifras concretas en esta ficha. No se inventan datos.

## Requisitos de hardware

- VRAM estimada: ~1,5 GB (compilacion estima ~1248 MB + KV cache).
- GPU recomendadas: cualquier GPU compatible con WebGPU (NVIDIA verificada, posiblemente AMD/Intel con soporte experimental).
- No requiere GPU de gama alta; cabe en tarjetas con 2 GB de VRAM o mas.
- Opciones de despliegue: exclusivamente en navegador mediante web-llm 0.2.84 (API TypeScript). No es compatible con vLLM, llama.cpp ni Ollama, ya que el formato es propietario de MLC.
- Latencia y throughput: no se proporcionan datos concretos. El modelo es pequeno (0,6B) y se espera una latencia baja en GPU modernas, pero depende del hardware del usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM estimada | Licencia | Formato |
|---|---|---|---|---|---|
| skkut/qwen3-embedding-0.6b-q4f16_1-MLC (este) | 0,6B | 2048 | ~1,5 GB | Apache-2.0 | MLC/WebGPU |
| Qwen/Qwen3-Embedding-0.6B (original) | 0,6B | 32768 (segun repo oficial) | no disponible | Apache-2.0 | safetensors |
| skkut/qwen3-embedding-8b-q4f16_1-MLC | 8B | 2048 | ~6,9 GB | Apache-2.0 | MLC/WebGPU |
| skkut/qwen3-embedding-4b-q4f16_1-MLC (no verificado) | 4B | 2048 | no disponible | Apache-2.0 | MLC/WebGPU |

La comparacion con el modelo original muestra que esta compilacion reduce la ventana de contexto de 32K a 2048 tokens y limita la cuantizacion a q4f16_1, a cambio de un despliegue ligero en navegador. La version 8B del mismo autor ofrece mayor capacidad pero requiere mas VRAM.

## Limitaciones y advertencias

- Ventana de contexto limitada a 2048 tokens en esta compilacion, muy inferior a los 32768 del modelo original. Esto restringe el tamaño de los pasajes que se pueden procesar.
- No es un modelo generativo; no produce texto, solo embeddings. No soporta tool calling ni funciones de agente.
- Dependencia de WebGPU: requiere un navegador y un hardware con soporte WebGPU funcional. En GPU NVIDIA esta verificado, pero en otras plataformas puede fallar.
- La cuantizacion q4f16_1 puede degradar ligeramente la calidad de los embeddings frente a fp16 o fp32, especialmente en idiomas poco representados.
- El prefijo de instruccion es necesario para obtener buenos resultados en retrieval; sin el, la calidad de los embeddings puede disminuir (la ganancia absoluta en el 0,6B es menor que en las versiones 4B/8B, pero sigue siendo recomendable).
- No se han publicado benchmarks de rendimiento para esta compilacion concreta, por lo que su calidad exacta frente a otros modelos de embeddings en el navegador no esta cuantificada.
- El modelo esta optimizado para un maximo de batch de 2, lo que limita el procesamiento de multiples consultas simultaneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skkut/qwen3-embedding-0.6b-q4f16_1-MLC
- Repositorio oficial de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Compilacion 8B del mismo autor: https://huggingface.co/skkut/qwen3-embedding-8b-q4f16_1-MLC
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-embedding-0.6b
