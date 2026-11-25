# HRB25/embeddinggemma-2-sem-audio-onnx

## Resumen

EmbeddingGemma 2 sem áudio en ONNX es una exportación a formato ONNX del encoder de texto del modelo multimodal de embeddings `HRB25/embeddinggemma-2-sem-audio`, que a su vez deriva de `google/embeddinggemma-2` de Google DeepMind. El repositorio lo publica el usuario HRB25 y contiene únicamente la rama de texto (271.002.624 parámetros), convertida a un grafo ONNX que integra el pooling de media y la normalización L2, de modo que la salida es directamente un embedding de frase de 768 dimensiones listo para comparar por similitud coseno.

El interés principal está en el despliegue: al estar en ONNX con variantes cuantizadas de hasta 158 MB, el modelo puede ejecutarse en CPU, en navegador (onnxruntime-web, transformers.js) y en dispositivos móviles sin necesidad de GPU ni de PyTorch. La ventana de contexto es de 8.192 tokens con atención local de 512 tokens ya incorporada en el grafo, y la dimensión de salida admite truncamiento MRL a 512, 256 o 128 dimensiones.

No hay entrenamiento ni ajuste fino propio: los pesos son los del modelo original, solo convertidos y, en las variantes menores, cuantizados. La licencia es Apache 2.0, la misma del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y está etiquetado como multilingüe con foco en portugués de Brasil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EmbeddingGemma 2, rama de texto) exportado a ONNX |
| Parametros totales | 271.002.624 (solo texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (atención local de 512 tokens embebida en el grafo) |
| Tipos de cuantizacion | float32, float16, int8 por canal, uint8 por tensor, 4 bits (bloque 32), 4 bits + float16 |
| Idiomas soportados | multilingüe; etiquetado específicamente pt y pt-br |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18; variantes q4 con opset 21 y operadores `com.microsoft`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de EmbeddingGemma 2 orientado a generación de embeddings de frase. Esta exportación no incluye la rama de audio del modelo base `HRB25/embeddinggemma-2-sem-audio`: solo el encoder de texto, el pooling de media y la normalización L2, fusionados en un único grafo ONNX. Las entradas son `input_ids` y `attention_mask` (int64, con dimensiones de batch y secuencia dinámicas) y las salidas son `sentence_embedding` `[batch, 768]` normalizado y `token_embeddings` `[batch, seq, 768]`.

No se ha realizado entrenamiento ni ajuste fino en este repositorio; los pesos son idénticos a los del modelo original, únicamente convertidos y cuantizados en las variantes reducidas. La atención local de 512 tokens está incorporada directamente en el grafo. El modelo requiere prefijos de tarea en el texto de entrada (por ejemplo `task: sentence similarity | query: ` o `task: search result | query: `), que el grafo no añade automáticamente; la lista completa está en `config_sentence_transformers.json`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de embeddings de frase y de token para texto, con salida de 768 dimensiones normalizada en L2.
- Similitud semántica entre frases (sentence-similarity), con prefijo de tarea específico.
- Clasificación de texto por embedding y búsqueda semántica (consulta y documento con prefijos distintos).
- Truncamiento MRL: la dimensión de salida puede recortarse a 512, 256 o 128 y renormalizarse.
- Soporte multilingüe, con etiquetado específico para portugués y portugués de Brasil.
- Ejecución en CPU, navegador y móvil mediante ONNX Runtime, sin dependencia de PyTorch.
- Compatibilidad con onnxruntime-web y transformers.js en la variante `model_quantized.onnx` (solo operadores estándar de ONNX).
- No incluye tool calling, razonamiento multi-paso, agentes, visión ni audio en esta exportación.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: la variante `model_int8.onnx` (278 MB) o `model_q4f16.onnx` (158 MB) permite indexar y consultar documentos localmente en el dispositivo, usando el prefijo `task: search result | query: ` para consultas y `title: none | text: ` para documentos.
- Deduplicación y agrupación de textos en pipelines de datos: con 8.192 tokens de contexto y pooling de media, se pueden generar embeddings de documentos largos y agrupar por similitud coseno sin salir de la CPU.
- Clasificación de tickets o mensajes en portugués de Brasil: el etiquetado pt-br y el prefijo `task: classification | query: ` permiten entrenar un clasificador ligero sobre los embeddings generados.
- Búsqueda en navegador sin backend: la variante `model_quantized.onnx` funciona con onnxruntime-web y transformers.js, lo que permite similitud semántica completamente en cliente.
- Sistemas de recomendación de contenido: los embeddings de 768 dimensiones (o truncados a 128 con MRL) sirven como representación compacta de artículos o descripciones para recuperación por vecino más cercano.
- Moderación y filtrado semántico en el edge: la latencia de 18 ms por frase de 20 tokens en CPU x86 con 4 hilos (variante int8) hace viable evaluar similitud contra patrones de referencia en tiempo real.
- Procesamiento de texto multilingüe en dispositivos sin GPU: al ser multilingüe y ejecutable en CPU, encaja en aplicaciones de traducción asistida o alineación de frases en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización frente al modelo PyTorch float32 original, medidas en cinco frases en pt-br y un texto de 1.129 tokens, con latencia de una frase de 20 tokens en CPU x86 con 4 hilos y onnxruntime 1.32 (mediana de 20 ejecuciones):

| Variante | Pesos | Tamaño | Coseno medio | Coseno mínimo | Texto largo | Latencia |
|---|---|---|---|---|---|---|
| `model.onnx` | float32 | 1.090 MB | 1,0000 | 1,0000 | 1,0000 | 40 ms |
| `model_fp16.onnx` | float16 | 548 MB | 1,0000 | 1,0000 | 1,0000 | 35 ms |
| `model_int8.onnx` | int8 por canal | 278 MB | 0,9923 | 0,9904 | 0,9690 | 18 ms |
| `model_quantized.onnx` | uint8 por tensor | 276 MB | 0,9901 | 0,9875 | 0,9709 | 33 ms |
| `model_q4.onnx` | 4 bits (bloque 32) | 175 MB | 0,9866 | 0,9799 | 0,9803 | 29 ms |
| `model_q4f16.onnx` | 4 bits + float16 | 158 MB | 0,9864 | 0,9793 | 0,9801 | 24 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base, ya que está pensado para CPU; en GPU, la variante float32 requiere aproximadamente 1,1 GB de memoria y la q4f16 alrededor de 160 MB.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU, navegador y móvil. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en GPU de consumo: sí, todas las variantes caben en cualquier GPU consumer (por ejemplo, RTX 4090) e incluso en iGPU, aunque no es el objetivo declarado.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), onnxruntime-web, transformers.js y cualquier runtime compatible con ONNX opset 18 (opset 21 con operadores `com.microsoft` para las variantes q4).
- Latencia y throughput: 18 ms por frase de 20 tokens con la variante int8 en CPU x86 de 4 hilos; 24 ms con q4f16; 40 ms con float32. No se proporcionan datos de throughput por lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de embeddings en la información proporcionada. A continuación se comparan únicamente características técnicas verificables:

| Modelo | Parámetros | Contexto | Dimensión de salida | Licencia | Formato |
|---|---|---|---|---|---|
| HRB25/embeddinggemma-2-sem-audio-onnx (este) | 271 M (texto) | 8.192 tokens | 768 (MRL a 512/256/128) | Apache 2.0 | ONNX |
| google/embeddinggemma-2 (modelo base) | no disponible en la información | no disponible en la información | 768 | Apache 2.0 (según este repo) | PyTorch |
| HRB25/embeddinggemma-2-sem-audio (modelo base directo) | no disponible en la información | no disponible en la información | no disponible en la información | Apache 2.0 | no disponible en la información |

No se han identificado en la información disponible otras alternativas comparables (por ejemplo, otros exportadores ONNX de modelos de embeddings) con datos verificables.

## Limitaciones y advertencias

- Solo incluye la rama de texto; la funcionalidad de audio del modelo base `HRB25/embeddinggemma-2-sem-audio` no está presente en esta exportación.
- El grafo no añade automáticamente los prefijos de tarea; si se omiten, los embeddings pueden no ser comparables con los del modelo original ni entre tareas.
- La cuantización introduce degradación medible: la variante q4f16 baja a un coseno medio de 0,9864 y mínimo de 0,9793 frente al float32, y en textos largos el coseno cae a 0,9801.
- La atención local de 512 tokens está embebida en el grafo, lo que limita la interacción efectiva entre tokens más allá de esa ventana aunque el contexto declarado sea de 8.192 tokens.
- No hay datos publicados de rendimiento en benchmarks estándar (MTEB u otros), por lo que la calidad relativa frente a otros modelos de embeddings no está verificada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (25 de noviembre de 2026), sin historial de uso ni validación comunitaria.
- No se dispone de información sobre sesgos del modelo original ni sobre riesgos de alucinación en tareas generativas (el modelo es de embeddings, no generativo).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Google DeepMind antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HRB25/embeddinggemma-2-sem-audio-onnx
- Modelo base directo: https://huggingface.co/HRB25/embeddinggemma-2-sem-audio
- Modelo original de Google DeepMind: https://huggingface.co/google/embeddinggemma-2
- Referencia arXiv citada en los tags: arxiv:2610.37364 (no verificada en la información disponible)
