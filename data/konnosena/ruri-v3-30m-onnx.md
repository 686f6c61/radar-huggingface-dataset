# konnosena/ruri-v3-30m-onnx

## Resumen

ruri-v3-30m-onnx es una exportación no oficial a formato ONNX del modelo de embeddings de frases cl-nagoya/ruri-v3-30m, desarrollado originalmente por Hayato Tsukagoshi y Ryohei Sasano (Universidad de Nagoya). El modelo resuelve tareas de similitud semántica y recuperación de información en japonés, generando embeddings densos de 256 dimensiones normalizados a longitud unitaria. La conversión la firma el usuario konnosena y no está afiliada ni respaldada por los autores originales.

La relevancia de esta versión radica en su empaquetado para inferencia con onnxruntime: pesos almacenados en BF16 (73 MB frente a 147 MB de una exportación FP32), pooling medio y normalización L2 integrados en el grafo, y position ids calculados internamente para evitar fallos con lotes mayores que 1. Está construida sobre ModernBERT-Ja, con una ventana de contexto máxima de 8192 tokens y un vocabulario Unigram con byte fallback.

El modelo base es un encoder compacto de aproximadamente 30 millones de parámetros, orientado a despliegues ligeros de búsqueda semántica y clustering en japonés. Esta exportación mantiene el tokenizador y la configuración byte a byte idénticos a la revisión `24899e5de370b56d179604a007c0d727bf144504` del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con rotary embeddings) |
| Parametros totales | no disponible (denominacion "30m" en el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | pesos BF16 almacenados en el ONNX (calculo en FP32); no se documentan otras cuantizaciones |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 23), pesos BF16 con Cast a FP32; tokenizador en `tokenizer.json` |
| Dimension del embedding | 256, normalizado a longitud unitaria |
| Entradas del grafo | `input_ids` (int64, `[batch, sequence]`), `attention_mask` (int64, `[batch, sequence]`) |
| Salida del grafo | `embedding` (float32, `[batch, 256]`) |
| Pad token id | 3 |
| Tamano del repo | 0.1 GB |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

La exportación envuelve el modelo original cl-nagoya/ruri-v3-30m, un encoder ModernBERT entrenado para producir embeddings de frases en japonés. ModernBERT sustituye el attention absoluto por rotary embeddings y emplea atención con ventana deslizante en parte de sus capas, lo que permite manejar secuencias de hasta 8192 tokens con un coste cuadrático reducido. El exportador fusiona la rotary embedding en el operador `RotaryEmbedding` de ONNX y genera internamente los position ids con dimension de lote, de modo que `position_ids` no es una entrada del grafo.

El entrenamiento del modelo original (composición del dataset, número de tokens, uso de RLHF/DPO o técnicas de contraste) no está documentado en la información proporcionada. La conversión a ONNX se realizó con `torch.onnx.export(..., dynamo=True)` en opset 23, con pooling medio sobre `attention_mask` (incluyendo prefijos y tokens especiales) y normalización L2 dentro del grafo, replicando el pipeline de sentence-transformers. La verificación frente al modelo PyTorch original en FP32 sobre CPU con 20 textos (japonés e inglés, con y sin prefijos, saltos de línea, tabuladores, emoji, kanji raro y un texto de más de 128 tokens) reporta una diferencia coseno máxima de 3.6e-07, una similitud coseno mínima de 0.9999998 y una norma de embedding entre 0.9999998 y 1.0000002, estable en lotes de 1, 2, 4, 8 y 20.

## Capacidades

- Generación de embeddings de frases de 256 dimensiones, normalizados a longitud unitaria, listos para similitud coseno o producto escalar.
- Similitud semántica y recuperación de información (retrieval) en japonés, con esquema de prefijos opcional: `検索クエリ: ` para consultas, `検索文書: ` para documentos, `トピック: ` para clasificación y clustering, y sin prefijo para similitud semántica simple.
- Clasificación y clustering de textos mediante representaciones vectoriales.
- Procesamiento de lotes con longitudes de secuencia dinámicas; el grafo admite batch y secuencia variables.
- Soporte de textos de hasta 8192 tokens, con atención de ventana deslizante para secuencias largas.
- Tokenizador Unigram con `byte_fallback: true`, que cubre caracteres fuera del vocabulario (saltos de línea, tabuladores, emoji, kanji raros) mediante tokens de byte `<0xNN>`.
- No dispone de generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en corpus japoneses: indexar documentos con el prefijo `検索文書: ` y consultar con `検索クエリ: `, usando la similitud coseno entre embeddings de 256 dimensiones para recuperar los pasajes más relevantes sin necesidad de coincidencia léxica.
- Motor de preguntas frecuentes (FAQ): precalcular los embeddings de las respuestas y comparar la consulta del usuario en tiempo de ejecución; el modelo cabe en 73 MB y puede ejecutarse en CPU con onnxruntime, lo que abarata el despliegue.
- Deduplicación y agrupamiento de documentos: generar embeddings de artículos o tickets y aplicar clustering sobre los vectores normalizados para detectar contenido duplicado o temas recurrentes.
- Filtrado y enrutado de tickets de soporte: clasificar mensajes entrantes por similitud con prototipos de categoría usando el prefijo `トピック: `, derivando cada caso al equipo adecuado.
- Recomendación de contenido: calcular la similitud entre el perfil vectorial de un usuario y el catálogo de artículos o productos en japonés, con actualizaciones incrementales de embeddings.
- Detección de paráfrasis y control de calidad de traducciones: comparar pares de frases japonesas mediante coseno para identificar reformulaciones o divergencias semánticas en pipelines de revisión.
- Despliegue en el borde o en navegador: al ser un ONNX de 73 MB con salida ya normalizada, puede integrarse en aplicaciones Node.js o en entornos con recursos limitados mediante onnxruntime sin dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye la verificación de equivalencia numérica frente al modelo PyTorch original:

| Metrica | Resultado |
|---|---|
| Máximo \|1 - coseno\| | 3.6e-07 |
| Coseno mínimo | 0.9999998 |
| Diferencia absoluta máxima por componente | 2.4e-07 |
| Rango de norma del embedding | 0.9999998 a 1.0000002 |
| Tamaño del ONNX (BF16) | 73 MB |
| Tamaño de referencia (FP32) | 147 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo de aproximadamente 30 millones de parámetros con cómputo en FP32, la huella en memoria es reducida (del orden de cientos de MB incluyendo activaciones para secuencias largas).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse en CPU con onnxruntime, y cualquier GPU con soporte de onnxruntime (por ejemplo, RTX 4090, A100, H100) puede acelerar la inferencia.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU consumer con suficiente memoria para el grafo y los lotes es apta.
- Opciones de despliegue: onnxruntime (Python, Node.js mediante `onnxruntime-node`), con tokenizador de la librería `tokenizers` o `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de embeddings.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Formato |
|---|---|---|---|---|---|
| ruri-v3-30m-onnx (esta ficha) | no disponible ("30m") | 8192 | 256 | Apache 2.0 | ONNX (BF16) |
| cl-nagoya/ruri-v3-30m (original) | no disponible ("30m") | 8192 | 256 | Apache 2.0 | safetensors / PyTorch |
| ModernBERT-Ja (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por los autores originales; la responsabilidad del empaquetado recae en el usuario konnosena.
- Modelo monolingüe en japonés; su rendimiento en otros idiomas, incluido el castellano, no está documentado y previsiblemente será deficiente.
- El tokenizador Unigram con `byte_fallback: true` exige librerías que respeten esa configuración; algunas implementaciones (por ejemplo, `@huggingface/tokenizers` 0.2.0) emiten `<unk>` en lugar de tokens de byte y alteran los embeddings. Es necesario mapear manualmente los fragmentos desconocidos a sus bytes UTF-8 o usar `tokenizers`/`transformers` de Python.
- Los prefijos son opcionales y su utilidad depende de la tarea y del texto; en textos cortos de una línea pueden no aportar mejora o incluso perjudicar.
- Los pesos se almacenan en BF16 pero onnxruntime los expande a FP32 al cargar, por lo que el consumo de memoria en ejecución corresponde a un modelo FP32.
- No se documentan sesgos específicos, tasas de alucinación (no genera texto) ni restricciones adicionales de la licencia Apache 2.0 para uso comercial.
- El rendimiento en recuperación de información de dominio especializado no está validado en la información disponible; conviene evaluar sobre datos propios antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/konnosena/ruri-v3-30m-onnx
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
- ModernBERT-Ja (colección): https://huggingface.co/collections/sbintuitions/modernbert-ja-67b68fe891132877cf67aa0a
- Paper referenciado (arXiv:2409.07737): https://arxiv.org/abs/2409.07737
- Organización de los autores: https://huggingface.co/cl-nagoya
