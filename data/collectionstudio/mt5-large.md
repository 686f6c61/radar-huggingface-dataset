# CollectionStudio/mt5-large

## Resumen

mT5-large es un modelo de lenguaje multilingüe de tipo encoder-decoder basado en la arquitectura T5, desarrollado originalmente por Google Research y publicado en el paper «mT5: A massively multilingual pre-trained text-to-text transformer» (arXiv:2010.11934). La ficha analizada, `CollectionStudio/mt5-large`, es una reproducción comunitaria del checkpoint original de Google que incluye pesos en PyTorch, TensorFlow y JAX en un único repositorio de 14,8 GB. Cubre 101 idiomas mediante un vocabulario SentencePiece compartido y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo exclusivamente preentrenado sobre el corpus mC4 (versión multilingüe de Common Crawl). No ha pasado por ajuste supervisado, RLHF ni DPO, por lo que no es utilizable directamente en tareas downstream: requiere fine-tuning específico para cada caso de uso. Esto lo convierte en una base de trabajo para investigación multilingüe más que en un asistente listo para producción.

Su relevancia actual reside en que sigue siendo una de las referencias canónicas para transferencia entre idiomas, generación condicionada y tareas seq2seq en lenguas con pocos recursos, además de servir como punto de partida para arquitecturas derivadas (por ejemplo, variantes ajustadas para resumen, traducción o clasificación). El repositorio analizado no registra descargas ni interacciones y no aporta documentación adicional más allá de la model card heredada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, variante multilingüe mT5) |
| Parámetros totales | Aproximadamente 1.200 millones (variante «large»; el dato no se explicita en la model card y procede del paper de mT5) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantización | No disponible; el repositorio solo contiene pesos en precisión completa (fp32) para PyTorch, TensorFlow y JAX |
| Idiomas soportados | 101 idiomas (af, am, ar, az, be, bg, bn, ca, ceb, co, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fil, fr, fy, ga, gd, gl, gu, ha, haw, hi, hmn, ht, hu, hy, ig, is, it, iw, ja, jv, ka, kk, km, kn, ko, ku, ky, la, lb, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, no, ny, pa, pl, ps, pt, ro, ru, sd, si, sk, sl, sm, sn, so, sq, sr, st, su, sv, sw, ta, te, tg, th, tr, uk, und, ur, uz, vi, xh, yi, yo, zh, zu) |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` (PyTorch), `tf_model.h5` (TensorFlow) y pesos Flax/JAX; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

mT5-large sigue el esquema text-to-text de T5: un transformer encoder-decoder con normalización de capas, embeddings posicionales relativos y un vocabulario SentencePiece compartido entre todos los idiomas, entrenado con un objetivo de denoising del tipo span corruption sobre texto sin supervisión. El preentrenamiento se realizó sobre mC4, la versión multilingüe del corpus Common Crawl, que cubre los 101 idiomas listados en la model card. Según el paper, el diseño se modificó respecto a T5 para adaptarse al régimen multilingüe y evitar que el vocabulario quedase sesgado hacia el inglés.

No hay constancia en la información disponible de fases posteriores de ajuste supervisado, RLHF, DPO o instrucciones. Tampoco se documentan innovaciones adicionales de inferencia (decodificación especulativa, atención lineal, etc.) ni detalles sobre número total de tokens vistos, composición exacta del dataset o proporciones por idioma, más allá de la referencia a mC4. El repositorio comunitario analizado replica el checkpoint original sin modificaciones declaradas.

## Capacidades

- Generación de texto condicionada en formato text-to-text: cualquier tarea se formula como entrada de texto y salida de texto (traducción, resumen, respuesta a preguntas, clasificación, paráfrasis).
- Capacidad multilingüe amplia: 101 idiomas con un único vocabulario compartido, lo que habilita transferencia entre lenguas y ajuste con datos escasos en idiomas de bajos recursos.
- Transferencia cross-lingual: al estar preentrenado de forma conjunta, permite fine-tuning en un idioma y evaluación en otro con degradación controlada.
- Base para tareas seq2seq: generación de resúmenes, traducción automática, simplificación, corrección gramatical, generación de preguntas y respuestas.
- Base para tareas de comprensión: clasificación de textos, inferencia de lenguaje natural, análisis de sentimiento, reconocimiento de entidades, una vez añadida una cabeza de clasificación.
- No dispone de soporte de tool calling ni function calling: es un modelo preentrenado sin plantilla de instrucciones ni formato de herramientas.
- No dispone de capacidades de agente, razonamiento multi-paso guiado ni modo «thinking».
- No dispone de capacidades de visión, audio ni multimodalidad.
- No es un modelo conversacional: no ha sido alineado para diálogo ni para seguir instrucciones.

## Casos de uso

- Traducción automática multilingüe: ajustando el modelo con pares paralelos se obtiene un sistema seq2seq para combinaciones de idiomas, incluidas aquellas con pocos recursos, aprovechando el vocabulario compartido de 101 lenguas.
- Resumen abstractivo multilingüe: el modelo se puede afinar sobre corpus de noticias o documentos en varios idiomas para generar resúmenes, con la ventaja de reutilizar un único checkpoint en lugar de mantener un modelo por idioma.
- Transferencia a idiomas de bajos recursos: se ajusta con datos en un idioma con recursos abundantes (por ejemplo, inglés o español) y se evalúa en una lengua relacionada con pocos datos etiquetados, reduciendo el coste de anotación.
- Clasificación y análisis de sentimiento multilingüe: añadiendo una cabeza de clasificación sobre la salida del encoder se puede construir un clasificador que funcione en decenas de idiomas con un único modelo.
- Generación de datos sintéticos y aumentación: el modelo puede parafrasear o reformular textos para ampliar datasets de entrenamiento en idiomas con cobertura limitada.
- Reconocimiento de entidades y extracción de información: formulando la tarea como generación de secuencias etiquetadas, el modelo se adapta a NER y extracción estructurada en contextos multilingües.
- Investigación en representaciones multilingües: es una base habitual para estudiar sesgos, alineación entre lenguas y calidad de representaciones en modelos multilingües.
- Respuesta a preguntas extractiva y generativa: ajustado sobre datasets de QA, sirve para construir sistemas de preguntas y respuestas sobre dominios cerrados en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card analizada no incluye tablas de resultados (MMLU, XNLI, XQuAD, MLQA, HumanEval, GSM8K u otros) para este checkpoint concreto, y los resultados de búsqueda web recuperados no contienen información relevante sobre el modelo.

## Requisitos de hardware

Las cifras de memoria son estimaciones derivadas del tamaño aproximado de 1.200 millones de parámetros y no proceden de la model card.

- Inferencia en fp32: aproximadamente 4,8 GB solo de pesos, más activaciones; en la práctica requiere del orden de 8-10 GB de VRAM.
- Inferencia en fp16/bf16: aproximadamente 2,4 GB de pesos; cabe holgadamente en tarjetas de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080).
- Inferencia en int8: aproximadamente 1,2 GB de pesos, viable en GPU con 6-8 GB.
- Fine-tuning completo: requiere pesos, gradientes y estados del optimizador, del orden de 20-30 GB en fp32 con Adam, por lo que se recomienda A100 40 GB, H100 o, con optimizaciones (gradient checkpointing, optimizador de 8 bits), RTX 3090/4090 de 24 GB.
- Fine-tuning con LoRA o adaptadores: reduce el requisito a aproximadamente 8-12 GB de VRAM, asequible en GPU de consumo de gama media-alta.
- Opciones de despliegue: Hugging Face Transformers (PyTorch, TensorFlow y Flax), Text Generation Inference (soporta arquitecturas encoder-decoder T5), vLLM (soporte de modelos T5), TensorFlow Serving y exportación a ONNX. No hay soporte oficial en formato GGUF para llama.cpp u Ollama en el repositorio analizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Idiomas |
|---|---|---|---|---|---|
| CollectionStudio/mt5-large | Aprox. 1,2B | No disponible | Encoder-decoder | Apache 2.0 | 101 |
| google/mt5-large | Aprox. 1,2B | No disponible | Encoder-decoder | Apache 2.0 | 101 |
| google/mt5-base | Aprox. 580M | No disponible | Encoder-decoder | Apache 2.0 | 101 |
| google/mt5-small | Aprox. 300M | No disponible | Encoder-decoder | Apache 2.0 | 101 |
| facebook/mbart-large-50 | Aprox. 610M | 1024 tokens | Encoder-decoder | MIT | 50 |
| facebook/nllb-200-distilled-600M | Aprox. 600M | 1024 tokens | Encoder-decoder | CC-BY-NC-4.0 (no comercial) | 200 |

Los recuentos de parámetros de las variantes mT5 proceden del paper de mT5 y no de la model card analizada. `CollectionStudio/mt5-large` es funcionalmente equivalente a `google/mt5-large`; la diferencia relevante es que el repositorio comunitario empaqueta los tres formatos de pesos y no añade cuantizaciones ni safetensors.

## Limitaciones y advertencias

- No es utilizable directamente: se trata de un checkpoint únicamente preentrenado y la propia model card indica que debe afinarse antes de usarse en cualquier tarea downstream.
- Riesgo de alucinación: al ser un modelo generativo sin alineación, puede producir contenido plausible pero falso, especialmente en tareas abiertas y en idiomas con poca representación en el corpus.
- Sesgos del corpus: mC4 se construye a partir de Common Crawl, por lo que hereda contenido tóxico, estereotipos demográficos y sobrerrepresentación del inglés y de idiomas con más presencia web.
- Cobertura desigual: aunque se declaran 101 idiomas, la calidad y el volumen de datos por lengua varían enormemente; el rendimiento en idiomas de bajos recursos será notablemente inferior.
- Sin alineación conversacional: no sigue instrucciones, no respeta formatos de chat y no está preparado para moderación ni para uso interactivo directo.
- Longitud de contexto no documentada: no se especifica en la model card el máximo de tokens de entrada o salida, lo que obliga a verificar el comportamiento con la configuración de tokenizador elegida.
- Licencia permisiva: Apache 2.0 permite uso comercial y modificaciones, siempre que se conserven los avisos de copyright y licencia; conviene revisar las condiciones del checkpoint original de Google.
- Formatos limitados: la ausencia de safetensors y de cuantizaciones listas implica que el despliegue en entornos con restricciones de memoria o en runtimes ligeros requiere conversión manual.
- Trazabilidad: el repositorio comunitario no aporta documentación propia ni resultados de evaluación, por lo que la validación recae por completo en quien lo adopte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CollectionStudio/mt5-large
- Checkpoint original de Google: https://huggingface.co/google/mt5-large
- Repositorio de código: https://github.com/google-research/multilingual-t5
- Paper de mT5: https://arxiv.org/abs/2010.11934
- Dataset mC4: https://www.tensorflow.org/datasets/catalog/c4#c4multilingual
- Otros checkpoints de la comunidad mT5: https://huggingface.co/models?search=mt5
- Nota: los resultados de búsqueda web obtenidos no contenían información relevante sobre el modelo (correspondían a portales de empleo sin relación con el tema).
