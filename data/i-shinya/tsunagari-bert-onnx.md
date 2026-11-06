# i-shinya/tsunagari-bert-onnx

## Resumen

tsunagari-bert-onnx es la exportación a ONNX de un modelo BERT large en japonés afinado para una tarea muy concreta: la clasificación binaria de coherencia entre oraciones, es decir, decidir si una frase continúa de forma natural a partir de un contexto previo. El autor, i-shinya, parte del checkpoint tohoku-nlp/bert-large-japanese-v2 (Tohoku University, licencia Apache-2.0) y lo entrena con pares de oraciones construidos a partir de Wikipedia en japonés reescrita mediante Claude Haiku. El resultado se distribuye en dos variantes ONNX, fp16 y q8, junto con el vocabulario y los recursos de tokenización necesarios para su uso en CLI y en navegador.

El modelo no es un generador de texto ni un LLM conversacional: es un encoder BERT large (24 capas, 1024 dimensiones ocultas, aproximadamente 340 millones de parámetros en su versión original) especializado en una única etiqueta. Su interés práctico está en tareas de segmentación y filtrado de texto japonés donde se necesita puntuar la continuidad entre fragmentos, como la reconstrucción de párrafos, la detección de rupturas en documentos o la selección de continuaciones en pipelines de generación aumentada.

La relevancia actual del artefacto es fundamentalmente de despliegue: al estar en ONNX con variantes fp16 y q8, permite ejecutar un BERT large japonés en entornos sin PyTorch, incluidos navegadores mediante lindera y el diccionario UniDic incluido. El repositorio ocupa 1,2 GB y no registra descargas ni likes en el momento de la consulta, lo que indica que se trata de una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT large), exportado a ONNX |
| Parámetros totales | no disponible (modelo base: BERT large japonés v2, del orden de 340 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length indicado en la model card) |
| Tipos de cuantización | fp16 (entradas y salidas en fp32, keep_io_types) y q8 (MatMulNBits 8 bits, block 32, solo pesos) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`fp16/model.onnx`, `q8/model.onnx`), más `vocab.txt` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un BERT large japonés de Tohoku University (tohoku-nlp/bert-large-japanese-v2), un encoder transformer bidireccional con tokenización WordPiece y segmentación previa de palabras. Sobre ese checkpoint, el autor entrena una cabeza de clasificación binaria para la tarea de continuidad oracional: la entrada es un par contexto-siguiente frase, y la salida son dos logits, donde la probabilidad de la clase 1 (softmax en `[:, 1]`) indica que la segunda frase continúa de forma coherente.

El conjunto de entrenamiento se construyó a partir de oraciones de Wikipedia en japonés reescritas con Claude Haiku, generando pares de ejemplo; el autor no incluye ese conjunto en el repositorio. No se detallan en la información disponible el número de pares, la composición exacta del dataset, la presencia de RLHF/DPO (poco habitual en un encoder de clasificación) ni hiperparámetros de entrenamiento. La innovación técnica destacable es la exportación a ONNX en dos precisiones, con la variante q8 aplicando cuantización de solo pesos mediante MatMulNBits con block 32, y la inclusión del diccionario UniDic de lindera para tokenizar en el navegador.

## Capacidades

- Clasificación binaria de continuidad entre un contexto y una frase siguiente, con salida de logits de dos clases.
- Procesamiento de texto en japonés con segmentación de palabras (MeCab + unidic-lite en CLI; lindera + UniDic en navegador) y WordPiece.
- Ejecución sin PyTorch mediante ONNX Runtime, tanto en servidor como en navegador.
- Dos variantes de precisión para equilibrar tamaño y velocidad: fp16 y q8.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni agentes.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento.
- Capacidad multilingüe limitada al japonés; no se declaran otros idiomas.

## Casos de uso

- Reconstrucción de párrafos fragmentados: dado un conjunto de oraciones desordenadas o partidas por un OCR, puntuar cada posible continuación con `logits[:, 1]` y encadenar las de mayor probabilidad para recuperar el orden original.
- Filtrado de continuaciones en generación aumentada: en un pipeline que propone varias frases candidatas, usar el modelo como reranker para descartar las que rompen la coherencia con el contexto previo.
- Detección de saltos o errores en documentos: al procesar texto extraído de PDF o HTML, marcar transiciones con baja probabilidad de continuidad como posibles cortes, duplicados o inserciones erróneas.
- Segmentación de texto japonés sin puntuación: emplear la puntuación de continuidad para decidir dónde acaba una unidad discursiva cuando el texto carece de delimitadores fiables.
- Preprocesado para sistemas de búsqueda y RAG en japonés: dividir documentos largos en fragmentos coherentes en lugar de cortar por longitud fija, mejorando la calidad de los embeddings posteriores.
- Despliegue en navegador para herramientas de edición: con la variante q8 y el diccionario lindera incluido, integrar la comprobación de coherencia en un editor web sin backend, con latencia local y sin enviar texto a un servidor.
- Evaluación de calidad de datasets sintéticos: comparar pares generados por un LLM con la puntuación del modelo para detectar reescrituras que rompen la continuidad respecto al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; para un BERT large en fp16 se sitúa en torno a 0,7 GB de pesos, y en q8 alrededor de 0,4 GB, a lo que hay que sumar activaciones y overhead de ONNX Runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna pueden ejecutar la variante q8 con holgura.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: ONNX Runtime (servidor y navegador vía WebAssembly/WebGPU), con los ficheros `fp16/model.onnx` o `q8/model.onnx`. No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de encoder.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| i-shinya/tsunagari-bert-onnx | BERT large (≈340 M, no confirmado) | 256 tokens | Clasificación de continuidad oracional (ja) | Apache-2.0 | ONNX fp16 y q8 |
| tohoku-nlp/bert-large-japanese-v2 | BERT large japonés | 512 tokens (configuración habitual del base) | Encoder general preentrenado (ja) | Apache-2.0 | PyTorch, Safetensors |
| BERT base japonés (tohoku-nlp/bert-base-japanese-v3) | ≈110 M | 512 tokens | Encoder general preentrenado (ja) | Apache-2.0 | PyTorch, Safetensors |

La comparación con el modelo base es la más directa: tsunagari-bert-onnx hereda su arquitectura y vocabulario, pero sustituye la cabeza de preentrenamiento por una clasificación binaria específica y limita la longitud de entrada a 256 tokens. Frente a un BERT base japonés, ofrece mayor capacidad por capa a costa de un tamaño y un coste de inferencia superiores. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo resuelve una tarea: clasificación binaria de continuidad; no genera texto ni responde preguntas.
- Requiere pasar `token_type_ids` a cero; introducir segment ids altera la predicción, según advierte el autor.
- La longitud de entrada está limitada a 256 tokens, lo que restringe contextos largos.
- El entrenamiento se basó en oraciones de Wikipedia reescritas con Claude Haiku; puede heredar sesgos de ese corpus y del modelo generador, y no se documenta la composición del dataset.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos o negativos en la clasificación de continuidad, especialmente en dominios alejados de Wikipedia.
- Solo soporta japonés; no hay evidencia de funcionamiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el diccionario UniDic incluido tiene licencia BSD 3-Clause, cuyos términos deben respetarse por separado.
- El repositorio no registra descargas ni validación externa, por lo que conviene evaluar el modelo en el dominio concreto antes de usarlo en producción.
- No se documentan métricas de precisión, recall ni calibración, lo que dificulta fijar umbrales de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/i-shinya/tsunagari-bert-onnx
- Modelo base: https://huggingface.co/tohoku-nlp/bert-large-japanese-v2
- Repositorio del autor: https://github.com/i-shinya/tsunagari
- Diccionario lindera UniDic (release v5.3.0): https://github.com/lindera/lindera/releases/tag/v5.3.0
