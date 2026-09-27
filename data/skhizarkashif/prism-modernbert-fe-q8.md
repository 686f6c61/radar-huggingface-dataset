# skhizarkashif/prism-modernbert-fe-q8

## Resumen

`skhizarkashif/prism-modernbert-fe-q8` es una conversión a ONNX con cuantización int8 del encoder `answerdotai/ModernBERT-base`, publicada por el usuario skhizarkashif y orientada específicamente a extracción de características (embeddings) dentro del ecosistema `transformers.js`. El problema que resuelve es concreto: las exportaciones ONNX oficiales de ModernBERT-base son grafos de masked-LM cuya salida son logits, por lo que no sirven para generar representaciones vectoriales. Esta versión exporta el encoder base de PyTorch con salida `last_hidden_state` de forma `[batch, seq, 768]`, con ejes de batch y secuencia dinámicos (opset 18).

La relevancia actual del modelo es doble. Por un lado, permite ejecutar un encoder de 8.192 tokens de contexto directamente en el navegador o en Node.js mediante WebGPU/WASM, sin depender de un servidor de inferencia, algo poco habitual en modelos de embedding de contexto largo. Por otro lado, la cuantización *weight-only* int8 (per-tensor simétrica, con nodos `DequantizeLinear`) reduce el tamaño del repositorio a aproximadamente 0,2 GB, lo que facilita su distribución y su carga en dispositivos con memoria limitada.

Se trata de un artefacto derivado, no de un modelo entrenado desde cero: hereda la arquitectura y los pesos del modelo base y solo cambia el formato y la precisión de los pesos. Su licencia Apache 2.0 y su integración directa con `pipeline('feature-extraction', ...)` con `dtype: 'q8'` lo convierten en una pieza útil para pipelines de recuperación, clasificación y agrupamiento que necesiten vectores densos de 768 dimensiones con ventanas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, atención alterna local/global, RoPE, GeGLU). El artefacto es un grafo ONNX exportado del encoder base |
| Parametros totales | 149 M (heredados de `answerdotai/ModernBERT-base`; no se especifica en la ficha del repositorio, por lo que el dato procede de la documentación pública del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base; no se indica explícitamente en la ficha del repositorio) |
| Tipos de cuantizacion | int8 *weight-only*, per-tensor simétrica, mediante nodos `DequantizeLinear` (`dtype: 'q8'` en `transformers.js`) |
| Idiomas soportados | no disponible en la ficha del repositorio (el modelo base está entrenado principalmente con texto en inglés y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18, ejes de batch y secuencia dinámicos). Salida: `last_hidden_state`, `[batch, seq, 768]` |
| Pipeline | `feature-extraction` |
| Libreria declarada | `transformers.js` |
| Tamano del repositorio | 0,2 GB |
| Modelo base | `answerdotai/ModernBERT-base` |
| Fecha de creacion / actualizacion | 2026-09-27 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es ModernBERT, un encoder tipo transformer con varias modificaciones respecto a BERT clásico: codificaciones posicionales rotatorias (RoPE) en lugar de embeddings posicionales aprendidos, activación GeGLU en lugar de GeLU, atención alterna que combina capas de atención local (ventana de 128 tokens) con capas de atención global, y *unpadding* para eliminar el cómputo asociado a los tokens de relleno. Esta combinación es la que permite sostener una ventana de contexto de 8.192 tokens manteniendo un coste de atención tratable. El modelo base fue entrenado con aproximadamente 2 billones de tokens según su documentación pública; no se dispone de información sobre la composición exacta del dataset ni sobre fases de RLHF o DPO en la información proporcionada.

El artefacto aquí descrito no implica reentrenamiento alguno: es una exportación del encoder de PyTorch a ONNX con opset 18 y ejes dinámicos, seguida de una cuantización *weight-only* a int8. El autor indica que el grafo se verificó frente a las embeddings de referencia en fp32 obteniendo una similitud coseno de aproximadamente 0,992 con la "Prism MLP gate" (la compuerta MLP propia del proyecto Prism). Es decir, la innovación técnica relevante no está en el entrenamiento, sino en (a) hacer que la salida sea `last_hidden_state` en lugar de logits, requisito indispensable para extracción de características, y (b) reducir el peso a int8 para su ejecución en el navegador con `transformers.js` sin salir del ecosistema ONNX Runtime.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para secuencias de hasta 8.192 tokens, a partir de la salida `last_hidden_state` (requiere aplicar *pooling*, por ejemplo *mean pooling* o *CLS pooling*, en el pipeline posterior).
- Recuperación semántica y búsqueda densa sobre documentos largos, gracias a la ventana de contexto extendida frente a los encoders de 512 tokens habituales.
- Clasificación de texto mediante *embeddings* congelados y una cabeza ligera entrenada encima (sentimiento, intención, tópico, spam).
- Agrupamiento y deduplicación semántica de documentos mediante similitud coseno.
- Ejecución en navegador y en Node.js con `@huggingface/transformers` (WebGPU o WASM) sin servidor de inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada; el modelo base está orientado a inglés y código.
- *Tool calling*, *function calling*, modo *thinking*, visión y audio: no disponibles (es un encoder de extracción de características, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica; no genera texto.

## Casos de uso

- Búsqueda semántica y RAG sobre documentos largos: al aceptar secuencias de hasta 8.192 tokens, permite indexar artículos, informes o contratos completos en un único vector, reduciendo la fragmentación en *chunks* y las pérdidas de contexto entre fragmentos.
- Búsqueda semántica 100 % en el cliente: con `transformers.js` y `dtype: 'q8'`, la indexación y la consulta pueden ejecutarse en el navegador del usuario, de modo que los documentos sensibles nunca salen del dispositivo.
- Deduplicación de corpus: generar embeddings de cada registro y descartar pares con similitud coseno por encima de un umbral, útil para limpiar conjuntos de datos de entrenamiento o catálogos de productos.
- Clasificación y enrutado de tickets de soporte: usar los embeddings como entrada de un clasificador ligero (regresión logística, MLP) que asigne categoría y prioridad, con la ventaja de no requerir GPU en producción.
- Recomendación de contenido por similitud: representar artículos, vídeos o productos como vectores y servir recomendaciones por vecinos más cercanos con un índice ANN (FAISS, HNSW, pgvector).
- Detección de contenido duplicado o casi duplicado en plataformas UGC: comparar la similitud entre publicaciones nuevas y existentes como filtro previo a la moderación humana.
- Extracción de características para *features* en modelos posteriores: servir como extractor congelado en pipelines de NLP clásico (NER, análisis de opinión) donde no se dispone de presupuesto para ajustar un transformer completo.
- Evaluación de similitud semántica en herramientas de anotación: calcular automáticamente la coherencia entre pares de frases para priorizar revisiones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato cuantitativo aportado por el autor es una métrica de fidelidad de la cuantización: la salida del grafo int8 reproduce las embeddings de referencia en fp32 con una similitud coseno de aproximadamente 0,992. No se proporcionan resultados de MMLU, GLUE, MTEB ni de ninguna otra batería estándar, ni para esta conversión ni para el modelo base en esta ficha.

| Metrica | Valor | Fuente |
|---|---|---|
| Similitud coseno frente a la referencia fp32 | ~0,992 | Model card del autor |
| Benchmarks estandar (GLUE, MTEB, etc.) | no disponible | No publicados en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 (pesos de ~150 MB más activaciones y caché de atención para secuencias largas). El repositorio completo ocupa 0,2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas y en CPU. No requiere A100 ni H100 salvo para *batching* masivo.
- Contexto largo: secuencias de 8.192 tokens incrementan el uso de memoria de activaciones, especialmente en fp32/ONNX Runtime; en int8 el coste dominante pasa a ser la atención sobre secuencias largas.
- Opciones de despliegue: `@huggingface/transformers` (transformers.js) en navegador o Node.js con `dtype: 'q8'`; ONNX Runtime (Python, C++, C#) cargando el grafo directamente; ONNX Runtime Web con WebGPU o WASM. Para el modelo base en PyTorch, alternativas como Text Embeddings Inference (TEI), `sentence-transformers` o vLLM en modo embedding.
- Repositorio privado: la model card indica que, si el repositorio es privado, hay que definir la variable de entorno `HF_TOKEN` para cargarlo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos del modelo base y de las alternativas de terceros proceden de su documentación pública, no de la información proporcionada para esta ficha; se incluyen solo como contexto orientativo.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `skhizarkashif/prism-modernbert-fe-q8` | 149 M | 8.192 tokens | ONNX int8 *weight-only*, salida `last_hidden_state` | Apache 2.0 | Objeto de esta ficha; 0 descargas y 0 likes en el momento de la consulta |
| `answerdotai/ModernBERT-base` | 149 M | 8.192 tokens | safetensors fp32/bf16 | Apache 2.0 | Modelo original; las exportaciones ONNX oficiales son de masked-LM y no producen embeddings |
| Exportaciones ONNX de la comunidad para ModernBERT | 149 M | 8.192 tokens | ONNX fp32/fp16 | Apache 2.0 | Orientadas habitualmente a clasificación o masked-LM; requieren verificar la forma de salida antes de usarlas como extractor |
| Encoders de embedding de ~110-140 M con contexto de 512 tokens (familia BERT/BGE/Nomic) | ~110-140 M | 512 tokens | safetensors, ONNX, GGUF | Apache 2.0 o MIT según el modelo | Más maduros y con benchmarks MTEB públicos, pero con ventana de contexto muy inferior |

## Limitaciones y advertencias

- Es un artefacto derivado sin descargas ni validación comunitaria (0 descargas, 0 likes, creado y actualizado el mismo día). No hay evidencia independiente de su correcto funcionamiento más allá de la verificación declarada por el autor.
- La salida es `last_hidden_state`, no embeddings agrupados. Si se usa directamente sin *pooling*, los vectores resultantes no serán comparables con los de otros modelos de embedding y la similitud coseno será engañosa.
- La fidelidad declarada (~0,992 de similitud coseno frente a fp32) es una métrica de aproximación, no una garantía de que el rendimiento en tareas *downstream* se mantenga intacto. La degradación puede ser mayor en tareas sensibles a matices semánticos finos.
- Riesgo de alucinación: no aplica como tal, porque el modelo no genera texto; el riesgo equivalente es producir representaciones poco discriminativas para dominios muy alejados de los datos de entrenamiento del modelo base.
- Idiomas: no se especifican en la ficha. El modelo base está entrenado principalmente en inglés y código, por lo que el rendimiento en castellano u otras lenguas no está documentado y debe validarse empíricamente antes de usarlo en producción multilingüe.
- Sin datos de sesgo: no hay evaluación de sesgos publicada para esta conversión ni información sobre la composición del dataset de entrenamiento en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia y atribución del modelo base `answerdotai/ModernBERT-base`.
- Despliegue: al ser un grafo ONNX, no es directamente compatible con `llama.cpp`, Ollama o GGUF. Tampoco se puede servir con vLLM tal cual; para eso habría que usar el modelo PyTorch original.
- La conversión está pensada para `dtype: 'q8'`; usar el grafo con otro tipo de dato puede dar resultados incorrectos o fallar en la carga.
- El repositorio hace referencia a una "Prism MLP gate" sin más contexto publicado, lo que dificulta reproducir la verificación de fidelidad descrita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skhizarkashif/prism-modernbert-fe-q8
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Librería de inferencia: https://github.com/huggingface/transformers.js
- Documentación de cuantización y `dtype` en transformers.js: https://huggingface.co/docs/transformers.js
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
