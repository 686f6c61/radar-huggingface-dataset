# Anshulgada/embeddinggemma-2-440m

## Resumen

EmbeddingGemma 2 (440M) es un modelo de embeddings publicado por el usuario Anshulgada en Hugging Face, derivado del modelo base `google/embeddinggemma-2` de Google DeepMind. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint aislado y modularizado de los pesos base (~440M parámetros, 438.760.472 según los safetensors del repositorio), pensado para facilitar el fine-tuning ligero downstream, la generación aumentada por recuperación (RAG) y la similitud semántica zero-shot.

El modelo genera vectores de 768 dimensiones con soporte nativo de Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings a 512d, 256d o 128d con una simple normalización posterior, reduciendo el coste de almacenamiento e indexación en bases vectoriales. Su ventana de contexto es de 8.192 tokens y usa el tokenizador SentencePiece de Gemma 2 con un vocabulario de 256.000 tokens.

Su relevancia actual radica en la demanda de modelos de embedding compactos y con licencia permisiva (Apache 2.0) para pipelines de búsqueda semántica y RAG que se ejecuten en hardware modesto. El autor también publica variantes de 270M y 740M, así como versiones fine-tuned para clasificación de pestañas de navegador y búsqueda semántica de historial web con inferencia en navegador vía WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer de Gemma 2 (texto + visión, según la model card) |
| Parametros totales | 438.760.472 (~440M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Precisión soportada: bfloat16, float16, float32 (cuantizaciones tipo GGUF: no disponible) |
| Idiomas soportados | Inglés (según los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 0,9 GB) |

## Arquitectura y entrenamiento

La arquitectura se basa en el backbone transformer de Gemma 2 de Google DeepMind, adaptado como modelo de embedding. Según la model card del autor, el checkpoint de 440M incluye un backbone de texto y visión (~440M parámetros). El modelo produce vectores de salida de 768 dimensiones y emplea pooling medio (mean pooling) sobre los token embeddings con la máscara de atención, seguido de normalización L2, como se muestra en el ejemplo de uso con Transformers. El tokenizador es SentencePiece de Gemma 2 con vocabulario de 256.000 tokens.

Sobre el entrenamiento del modelo base original (número de tokens, composición del dataset, RLHF/DPO u otras técnicas), la información disponible en la model card no lo detalla, por lo que no se puede confirmar. La característica técnica destacable que sí está documentada es el soporte nativo de Matryoshka Representation Learning (MRL): los embeddings de 768d pueden truncarse a 512d, 256d o 128d tomando los primeros N elementos y renormalizando, con degradación controlada de calidad. Este repositorio en concreto es un reupload de los pesos base sin entrenamiento adicional; el autor ofrece una versión fine-tuned (`Anshulgada/tabman-embeddinggemma-2-440m`) entrenada con 18.000 triplets contrastivos para clasificación de pestañas web.

## Capacidades

- Generación de embeddings de texto para similitud semántica (pipeline `sentence-similarity` y `feature-extraction`).
- Extracción de características con salida de 768 dimensiones, truncable a 512d, 256d o 128d mediante MRL.
- Búsqueda semántica zero-shot sobre consultas y documentos en inglés.
- Base adecuada para fine-tuning downstream ligero (el propio autor lo demuestra con su variante Tabman).
- Compatibilidad con la librería sentence-transformers y con Transformers de Hugging Face.
- Según la model card, el checkpoint incluye backbone de texto y visión, aunque no se documenta en el README cómo explotar la modalidad visual.
- No es un modelo generativo: no soporta generación de texto, razonamiento, código, tool calling ni agentes.

## Casos de uso

- RAG (generación aumentada por recuperación): indexación de documentos corporativos en una base vectorial, usando los embeddings de 768d (o 128d para ahorrar memoria) para recuperar contexto relevante antes de pasarlo a un LLM generativo.
- Búsqueda semántica en aplicaciones: motor de búsqueda interno que compara consultas de usuario con documentos por similitud coseno, beneficiándose de la ventana de 8.192 tokens para procesar pasajes largos.
- Clustering y deduplicación de textos: agrupación de documentos, URLs o tickets de soporte por cercanía semántica sin entrenamiento previo.
- Clasificación de pestañas y navegación web: el caso de uso del autor; con la variante fine-tuned Tabman se clasifican pestañas del navegador y se busca en el historial web, con inferencia local vía WebGPU.
- Reducción de costes en bases vectoriales: gracias a MRL, se puede indexar a 128d o 256d en lugar de 768d, reduciendo el tamaño del índice (por ejemplo, en HNSW) hasta 6 veces con re-normalización trivial.
- Fine-tuning para dominios específicos: al ser un checkpoint base modularizado, sirve como punto de partida para entrenar embeddings especializados (legal, médico, e-commerce) con datasets contrastivos pequeños.
- Prototipado rápido de pipelines de embeddings: integración directa con sentence-transformers en pocas líneas, útil para pruebas de concepto de búsqueda y recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la información disponible para este repositorio. La única métrica mencionada en la model card corresponde a la variante fine-tuned del autor (`Anshulgada/tabman-embeddinggemma-2-440m`), que alcanzaría una precisión superior al 98,5 % con vectores de 128 dimensiones en su tarea de clasificación de pestañas, entrenada sobre 18.000 triplets contrastivos. No hay datos comparativos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 438,76M de parámetros en bfloat16 o float16, el modelo ocupa aproximadamente 0,9 GB (coincide con el tamaño del repositorio); en float32, en torno a 1,8 GB. Añadir margen para activaciones y batch de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requieren A100 ni H100. Una RTX 3060 de 12 GB, RTX 4060 o superior lo ejecuta con holgura, incluso con batches grandes.
- Consumer GPUs: cabe cómodamente en prácticamente cualquier GPU de consumo con 2 GB de VRAM libres o más, e incluso es viable su ejecución en CPU para volúmenes de tráfico bajos, dado el tamaño reducido.
- Despliegue: sentence-transformers (vía recomendada por el autor), Transformers de Hugging Face con `AutoModel`, y servicios de inferencia compatibles con modelos de embeddings de HF (por ejemplo, endpoints de Hugging Face, marcado como `endpoints_compatible`). No hay pesos GGUF oficiales, por lo que llama.cpp u Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponible en la información proporcionada; al ser un modelo de ~440M, se espera baja latencia por consulta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Anshulgada/embeddinggemma-2-440m | ~440M | 768 (MRL hasta 128d) | 8.192 tokens | Apache 2.0 | Reupload del backbone base de texto + visión; solo inglés según tags |
| Anshulgada/embeddinggemma-2-270m | ~270M | no disponible | no disponible | Apache 2.0 | Variante más ligera del mismo autor, foco en texto y código para extensiones de navegador |
| Anshulgada/embeddinggemma-2-740m | ~740M | no disponible | no disponible | Apache 2.0 | Variante mayor, multimodal completa (texto + visión + audio) según la model card |
| google/embeddinggemma-2 | ~440M | no disponible | no disponible | no disponible | Modelo original de Google DeepMind del que deriva este checkpoint |

No se incluyen alternativas de otros fabricantes (por ejemplo, familias de embeddings de otras compañías) porque no hay datos de benchmarks publicados para este repositorio que permitan una comparación de rendimiento fundamentada.

## Limitaciones y advertencias

- Idioma: el repositorio declara soporte solo para inglés; no hay garantía documentada de calidad en castellano u otros idiomas.
- Es un reupload de terceros: los pesos derivan de `google/embeddinggemma-2`, pero el repositorio no es oficial de Google. Para producción, conviene verificar la integridad de los pesos y considerar el repositorio original.
- No es un modelo generativo: no sirve para chat, código ni razonamiento; su función es exclusivamente producir embeddings.
- La modalidad de visión se menciona en la model card, pero el README no documenta su uso, por lo que debe tratarse con cautela hasta verificarlo en el modelo base original.
- Alucinación: no aplica al no generar texto, pero la calidad de la recuperación en RAG depende de la calidad de los embeddings; sin benchmarks públicos (MTEB), no se puede evaluar su calidad relativa frente a otros modelos de embedding.
- Riesgo de sesgos: heredado del entrenamiento del modelo base de Google, no documentado en este repositorio; no disponible información específica.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes, aunque conviene revisar también los términos del modelo base original de Google.
- Contexto: 8.192 tokens es limitado para documentos muy largos; será necesario trocear (chunking) textos extensos antes de embeberlos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Anshulgada/embeddinggemma-2-440m
- Modelo base original de Google: https://huggingface.co/google/embeddinggemma-2
- Variante fine-tuned (Tabman): https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-440m
- Variante 270M: https://huggingface.co/Anshulgada/embeddinggemma-2-270m
- Variante fine-tuned 270M: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-270m
- Variante 740M: https://huggingface.co/Anshulgada/embeddinggemma-2-740m
- Variante fine-tuned 740M: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-740m
- Librería sentence-transformers: https://sbert.net/
