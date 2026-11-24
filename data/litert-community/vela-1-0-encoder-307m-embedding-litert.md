# litert-community/Vela-1.0-Encoder-307M-Embedding-LiteRT

## Resumen

Vela-1.0-Encoder-307M-Embedding-LiteRT es la conversion al formato LiteRT (`.tflite`) y LiteRT-LM (`.litertlm`) del modelo de embeddings de frases vllm-sr/Vela-1.0-Encoder-307M-Embedding, un encoder ModernBERT de 22 capas y 307 millones de parametros que produce vectores de 768 dimensiones mediante mean pooling y normalizacion L2. La conversion la mantiene el colectivo litert-community usando litert-torch 0.10.0 sobre LiteRT 2.2.0 y LiteRT-LM 0.18.0, y su objetivo es llevar un embedder multilingue de calidad a inferencia en dispositivo (Android, macOS) con aceleracion por NPU y GPU.

El modelo resuelve el problema de ejecutar recuperacion semantica y similitud de frases en moviles y equipos de sobremesa sin depender de un servidor: en una Galaxy S26 embebe un texto de hasta 64 tokens en 6,8 ms sobre la NPU, y en GPU mantiene los resultados de busqueda en SciFact dentro de 0,003 del nDCG@10 de la referencia en float32 (0,48633 a 0,48813 frente a 0,48581). Es relevante porque demuestra que un encoder de 307M con tokenizer Gemma de 256k entradas puede desplegarse en produccion en el borde con perdida de precision despreciable.

La pieza publicada incluye cuatro ventanas estaticas (64, 128, 256 y 512 tokens) en dos variantes: una de un solo fichero para CPU (ids de token como entrada) y otra con tabla de embeddings alojada en el host para GPU y NPU. Todo el peso se almacena en float16 y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, 22 capas, atencion alterna global / ventana deslizante ±64, RoPE YaRN) |
| Parametros totales | 307M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas estaticas de 64, 128, 256 y 512 tokens (un fichero por ventana) |
| Tipos de cuantizacion | float16 (pesos y tabla de tokens); activaciones float32; int8 probado y descartado |
| Idiomas soportados | multilingue (evaluado en en, es, ja, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT) y `.litertlm` (LiteRT-LM); tabla de embeddings en `.bin` float16 |
| Dimension del embedding | 768 (Matryoshka truncable a 64–768) |
| Pooling | mean pooling + normalizacion L2 dentro del grafo |
| Tokenizer | Gemma, 256.000 entradas, `<bos>` = 2 y `<eos>` = 1 |
| Entrada del grafo | `input_ids` int32 [1,L] + `attention_mask` float32 [1,L], o `inputs_embeds` float32 [1,L,768] en variante GPU/NPU |
| Salida del grafo | `embedding` float32 [1,768] |
| Tamano de ficheros | 614–616 MB (CPU un fichero), 221–223 MB + tabla de 393 MB (GPU/NPU), 624 MB (`.litertlm`) |
| Tamano del repo | 4,4 GB |
| Libreria | litert |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT de 22 capas con dimension oculta de 768, atencion alternando capas globales y capas de ventana deslizante de ±64 tokens, y tablas RoPE YaRN del publicador incorporadas como constantes en el grafo. La conversion traza directamente el encoder con la atencion escrita de forma explicita, anade mean pooling y normalizacion L2, y genera un `.tflite` por ventana estatica. Los pesos se convierten a float16 con ai-edge-quantizer en modo weight-only, manteniendo activaciones en float32.

Una innovacion tecnica destacable es el reescalado de las LayerNorms: las de las capas 12–21 y la normalizacion final se calculan sobre x·2⁻⁶ (con eps·2⁻¹²) y las de las capas 9–11 sobre x·2⁻², porque la suma de cuadrados de sus entradas alcanza 4e7 en float32, por encima del maximo de float16 (65.504). Esta reescritura es exacta en float32 (bit a bit identica al grafo plano) y mantiene finitos los caminos de GPU con almacenamiento float16. Se probo una tabla de tokens en int8 y se descarto: el error de redondeo por fila (0,75 % de media, 2,1 % en `<bos>`) desplaza frases cortas hasta un 0,7 % en coseno (suelo 0,9929 sobre 3.918 textos); float16 mantiene el suelo en 0,9998. Los pesos FC en int8 fallan mas (suelo de coseno 0,964).

La separacion en dos formas de grafo responde al delegado GPU: este no acepta una tabla de tokens float16 dentro del grafo (`EMBEDDING_LOOKUP: Empty quantization params`), de modo que la forma de un solo fichero es para CPU y las variantes `_embeds_` reciben las filas ya consultadas desde el host y se ejecutan por completo en GPU (Metal, todas las operaciones aceleradas) y en NPU. El pooling se escribe como multiplicacion / suma / rsqrt en lugar de un select enmascarado, que el delegado tambien rechaza. No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, RLHF/DPO).

## Capacidades

- Generacion de embeddings de frases: devuelve un vector normalizado de 768 dimensiones identico al que produce sentence-transformers para el mismo texto.
- Similitud semantica y recuperacion densa (pipeline `sentence-similarity`), validada en SciFact y STS-B v2.
- Embeddings multilingues: evaluado en ingles, espanol, japones y chino (PAWS-X test).
- Embeddings Matryoshka: truncables de 768 a 64 dimensiones para reducir coste de almacenamiento y busqueda.
- Ventanas estaticas de 64, 128, 256 y 512 tokens, seleccionando el fichero mas pequeno que cubra la longitud del texto.
- Inferencia en dispositivo con aceleracion por NPU y GPU (Metal en macOS, GPU y NPU en Galaxy S26 y Pixel 8a).
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica en aplicaciones Android: embeber consultas y documentos en el propio dispositivo con la variante NPU (6,8 ms para 64 tokens en Galaxy S26) y evitar enviar texto del usuario a un servidor.
- Deduplicacion y agrupacion de textos en el borde: calcular similitudes coseno entre pares con la ventana de 512 tokens para detectar duplicados en notas, correos o registros locales.
- Recuperacion aumentada en asistentes offline: indexar una base documental pequena con embeddings Matryoshka de 64–256 dimensiones y hacer retrieval local en macOS o Android sin conexion.
- Moderacion y clasificacion de contenido multilingue: usar los embeddings como caracteristica de entrada a un clasificador ligero, aprovechando el soporte de en, es, ja y zh.
- Sistemas de recomendacion de articulos o productos: precalcular embeddings del catalogo con la variante CPU de un solo fichero y servir la similitud en el cliente.
- Filtrado previo en pipelines RAG híbridos: usar el embedder en dispositivo para descartar candidatos antes de llamar a un modelo mayor en servidor, reduciendo latencia y coste.
- Agrupacion de tickets de soporte por tematica: embeber descripciones con la ventana de 128 o 256 tokens y clusterizar por similitud coseno en local.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| nDCG@10 en SciFact (GPU, precision por defecto) | 0,48633 – 0,48813 | float32: 0,48581 |
| Coseno frente a referencia float32 (Mac CPU, todas las ventanas) | ≥ 0,99977 | 1,0 |
| Coseno frente a referencia (NPU Galaxy S26) | ≥ 0,9994 | 1,0 |
| Coseno frente a referencia (GPU S26 y Pixel 8a en FP32) | ≥ 0,99997 | 1,0 |
| Coseno frente a referencia (CPU de ambos moviles) | ≥ 0,99997 | 1,0 |
| Acuerdo top-1 en recuperacion | 100 % (1.738–1.873 consultas por ventana) | — |
| Spearman de cosenos de pares | 0,9999995 | — |
| Spearman STS-B v2 | +0,000004 frente a referencia | 0,811867 (referencia) |
| Latencia de embedding (64 tokens, NPU Galaxy S26) | 6,8 ms | — |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; al ser un encoder de embeddings, esas metricas no aplican.

## Requisitos de hardware

- VRAM/RAM estimada: 614–616 MB por fichero CPU; 221–223 MB + 393 MB de tabla para GPU/NPU; 624 MB para el bundle `.litertlm`. El repo completo ocupa 4,4 GB.
- GPU recomendadas: cualquier GPU compatible con el delegado LiteRT (Metal en Mac; GPU integrada en Galaxy S26 y Pixel 8a). No se especifican requisitos de A100, H100 ni RTX 4090 porque el objetivo es inferencia en dispositivo.
- Cabe en GPU de consumo y en moviles: validado en Galaxy S26 (NPU y GPU), Pixel 8a (GPU y CPU) y CPU de Mac.
- Opciones de despliegue: LiteRT (`.tflite`) y LiteRT-LM `EmbeddingEngine` (`.litertlm`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 6,8 ms para 64 tokens en NPU Galaxy S26; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue en dispositivo |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Embedding-LiteRT | 307M | 64–512 (ventanas) | tflite / litertlm | Apache 2.0 | Si (NPU, GPU, CPU) |
| vllm-sr/Vela-1.0-Encoder-307M-Embedding | 307M | no disponible | safetensors (base) | no disponible | No (requiere conversion) |
| ModernBERT-base (referencia de arquitectura) | no disponible | no disponible | safetensors | no disponible | No de forma nativa |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo produce embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Ventana maxima de 512 tokens; textos mas largos deben truncarse o partirse.
- La variante de un solo fichero es solo para CPU; en GPU y NPU es obligatorio usar los ficheros `_embeds_` con la tabla de tokens en el host.
- El delegado GPU rechaza ciertas operaciones (tabla de tokens float16 en el grafo, `SELECT_V2` con condicion broadcast), lo que condiciona el diseno del grafo.
- La cuantizacion a int8 degrada la similitud coseno por debajo del umbral de 0,999; solo float16 cumple los criterios de precision.
- Es necesario eliminar espacios finales antes de tokenizar: un espacio residual se convierte en un token `▁` suelto y altera el vector.
- El tokenizer debe anadir `<bos>` y `<eos>` como hace sentence-transformers; sin ellos la similitud cae a 0,31.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su dataset de entrenamiento.
- Riesgo de alucinacion no aplica directamente, pero la calidad del retrieval depende de la similitud semantica y puede fallar en dominios muy especializados.
- Licencia Apache 2.0 permite uso comercial con atribucion; verificar los terminos del modelo base vllm-sr/Vela-1.0-Encoder-307M-Embedding.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Vela-1.0-Encoder-307M-Embedding-LiteRT
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M-Embedding
- LiteRT: https://ai.google.dev/edge/litert
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- litert-torch: https://github.com/google-ai-edge/litert-torch
- ai-edge-quantizer: https://github.com/google-ai-edge/ai-edge-quantizer
- sentence-transformers: https://sphinx-doc.org/sentence-transformers (documentacion oficial)
