# litert-community/Vela-1.0-Encoder-307M-Embedding-LiteRT

## Resumen

Vela-1.0-Encoder-307M-Embedding-LiteRT es la conversión a LiteRT (`.tflite`) y LiteRT-LM (`.litertlm`) del modelo de embeddings de frases vllm-sr/Vela-1.0-Encoder-307M-Embedding (revisión `290318fd`), publicado por la comunidad `litert-community`. Se trata de un encoder ModernBERT de 22 capas y 307 M de parámetros que produce vectores de 768 dimensiones mediante mean pooling y normalización L2, con soporte Matryoshka para truncar el vector entre 64 y 768 dimensiones y tokenizador Gemma de 256 000 entradas. No es un modelo generativo: su única salida es la representación vectorial de una frase.

El problema que resuelve es la ejecución de embeddings de calidad en dispositivos móviles sin depender de un servidor. Para ello la conversión fija ventanas estáticas de 64, 128, 256 y 512 tokens (un fichero por ventana), de modo que el coste de inferencia es el de la ventana elegida y no el de la longitud real del texto. Incluye pooling y normalización dentro del grafo, así que el vector devuelto es el mismo que produce `sentence-transformers` para el mismo texto, con un suelo de similitud coseno de 0,99977 medido sobre 4 184 textos en Mac, y de 0,9994 en la NPU de un Galaxy S26.

Su relevancia ahora es práctica: permite búsqueda semántica, deduplicación y clasificación por similitud dentro de una app Android, con latencias de 6,8 ms a 68,4 ms por texto según la ventana en la NPU del Galaxy S26. El repo ocupa 4,4 GB porque incluye todas las variantes y la tabla de embeddings; cada artefacto individual pesa entre 221 MB y 624 MB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT, 22 capas, atención alterna global / ventana deslizante ±64; mean pooling + normalización L2 dentro del grafo |
| Parámetros totales | 307 M (según el nombre del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens como máximo; ventanas estáticas de 64, 128, 256 y 512 tokens |
| Dimensión del embedding | 768; Matryoshka truncable a 64, 128, 256 y 512 |
| Tokens especiales | `<bos>` = 2 y `<eos>` = 1, añadidos por el post-procesador del tokenizador |
| Tipos de cuantización | float16 en pesos (weight-only) con activaciones float32; se probó int8 y se descartó por pérdida de paridad |
| Idiomas soportados | multilingüe (paridad verificada en inglés, español, japonés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT), `.litertlm` (LiteRT-LM) y tabla de embeddings `.bin` float16 de [256000, 768] |
| Tokenizador | Gemma, 256 000 tokens (`tokenizer.json` del repo base) |
| Tamaño de los artefactos | 614–616 MB por ventana (forma CPU); 221–223 MB + tabla de 393 MB (forma GPU/NPU); 624 MB el bundle `.litertlm` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder ModernBERT de 22 capas y 768 dimensiones ocultas, con capas de atención que alternan global y ventana deslizante de ±64 tokens, tablas YaRN de RoPE congeladas como constantes y un tokenizador Gemma de 256 000 entradas. Sobre la salida del encoder se aplica mean pooling y normalización L2, ambas integradas en el grafo convertido, por lo que la salida es directamente un embedding de frase normalizado, listo para similitud coseno o producto escalar.

La información disponible no detalla el corpus de entrenamiento del modelo base (número de tokens, composición del dataset ni si hubo ajuste con RLHF o DPO); esos datos corresponden a la model card del modelo original, no a esta conversión. Lo que sí documenta la conversión es el proceso técnico: trazado directo del encoder con litert-torch 0.10.0 y litert-converter 0.5.0.dev20260912, un `.tflite` por ventana y pesos convertidos a float16 con ai-edge-quantizer. Para evitar desbordamientos de float16 (la suma de cuadrados de las entradas de las LayerNorms llega a 4·10⁷, por encima de los 65 504 de float16), las LayerNorms de las capas 12–21 y la final se calculan sobre x·2⁻⁶ (con eps·2⁻¹²) y las de las capas 9–11 sobre x·2⁻², reescritura que es exacta en float32. Se probó una tabla de tokens int8 y se rechazó: el error de redondeo por fila (0,75 % de media, 2,1 % en `<bos>`) desplazaba hasta un 0,7 % el coseno en frases cortas (suelo 0,9929 sobre 3 918 textos); float16 mantiene el suelo en 0,9998. Los pesos int8 de las capas fully-connected fallaron todavía más (suelo 0,964).

## Capacidades

- Generación de embeddings de frases normalizados de 768 dimensiones, con pooling y normalización incluidos en el grafo.
- Similitud semántica y similitud de pares de frases (`pipeline_tag: sentence-similarity`).
- Truncado Matryoshka: el mismo vector sirve a 64, 128, 256, 512 o 768 dimensiones, útil para indexación en dos fases.
- Recuperación de información (retrieval) por similitud coseno, con top-1 medido al 100 % de acuerdo con la referencia en consultas no casi-empate.
- Multilingüe, con paridad verificada sobre PAWS-X en inglés, español, japonés y chino.
- Ejecución en dispositivo: CPU, GPU (Metal en Mac, delegado GPU en Android) y NPU Qualcomm HTP mediante LiteRT 2.2.0 C-API y LiteRT-LM `EmbeddingEngine`.
- Soporte del patrón `inputs_embeds` para que el host resuelva las filas de la tabla de tokens y el grafo corra entero en GPU o NPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto, código, matemáticas, visión o audio: es exclusivamente un encoder de representaciones.

## Casos de uso

- Búsqueda semántica dentro de una app Android: se indexan los documentos del usuario con el fichero de ventana 512 y se consulta con el de 64, con 6,8 ms por consulta en la NPU de un Galaxy S26 y sin llamadas de red.
- Deduplicación de registros y notas: con la forma Matryoshka de 128 dimensiones se comparan pares por coseno y se descartan duplicados en local, útil cuando el volumen no justifica un servicio servidor.
- Clasificación zero-shot por similitud: se comparan los embeddings de los textos contra los de un conjunto de etiquetas descriptivas, sin entrenamiento adicional y con el modelo ejecutándose en el propio dispositivo.
- Filtrado y moderación de contenido en el cliente: cálculo de similitud contra una lista de patrones de referencia, con la ventaja de que el texto no sale del teléfono.
- Recuperación aumentada (RAG) en el borde: el encoder indexa fragmentos y consultas, y el texto recuperado se envía a un LLM remoto, reduciendo el contexto transmitido frente a enviar los documentos completos.
- Agrupación (clustering) y mapas semánticos de conversaciones o tickets: los embeddings de 64–256 dimensiones permiten agrupar por similitud con coste bajo en CPU móvil.
- Detección de similitud entre idiomas: al ser multilingüe, permite emparejar una consulta en español con documentos en inglés o japonés usando el espacio vectorial compartido.
- Prototipado en Mac: la forma CPU de un fichero se ejecuta sin GPU y se usa para validar pipelines de paridad antes de desplegar en Android.

## Benchmarks y rendimiento

| Métrica | Valor | Ámbito |
|---|---|---|
| STS-B v2, Spearman | 0,811864 (referencia del autor); 0,811867 reproducido con el stack de referencia | 1 362 pares de test |
| Paridad coseno frente a la referencia | ≥ 0,99977 | 4 184 textos, todas las ventanas, Mac CPU |
| Paridad coseno, export float32 | 0,99999977 | mismo conjunto (suelo de ruido del conversor) |
| Acuerdo top-1 en retrieval | 100 % | 1 738–1 873 consultas por ventana, sin casi-empates |
| Spearman de cosenos de pares | 0,9999995 | conjunto de paridad |
| Delta en STS-B v2 Spearman | +0,000004 | frente a la referencia |
| Paridad coseno en NPU (Galaxy S26) | ≥ 0,9994 | 140–497 textos por ventana |
| Paridad coseno en GPU (S26, Pixel 8a, FP32) | ≥ 0,99997 | subconjunto por dispositivo |
| Control sin tokens especiales | 0,31 | confirma que `<bos>`/`<eos>` son necesarios |
| Latencia NPU Galaxy S26 (L64 / L128 / L256 / L512) | 6,8 / 13,1 / 28,0 / 68,4 ms | una llamada por texto, mediana de 20 tras 5 calentamientos |

Cabe subrayar que todas las cifras de paridad miden la fidelidad de la conversión frente al modelo original, no la calidad del modelo. El único dato de calidad publicado es el Spearman de 0,811864 en STS-B v2, heredado de la model card del modelo base.

## Requisitos de hardware

- VRAM/RAM: el artefacto más grande pesa 624 MB; la forma CPU de un fichero, 614–616 MB; la forma GPU/NPU, 221–223 MB más una tabla de 393 MB. Conviene reservar del orden de 1–1,5 GB de memoria durante la carga, ya que los pesos float16 se desquantizan al cargar en la forma CPU.
- No está pensado para GPU de escritorio: no hay requisito de A100, H100 ni RTX 4090 en la información disponible, y el modelo no se distribuye en formatos para esos entornos.
- Cabe de sobra en hardware de consumo: la validación incluye un Mac con CPU, un Galaxy S26 (NPU Qualcomm HTP y GPU) y un Pixel 8a (GPU y CPU).
- Despliegue: LiteRT 2.2.0 C-API, LiteRT-LM `EmbeddingEngine` para el bundle `.litertlm`, y delegados GPU (Metal, GPU de Android) y NPU (Qualcomm HTP con compilación JIT). No hay soporte de vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo generativo.
- Latencia: 6,8 / 13,1 / 28,0 / 68,4 ms en la NPU del Galaxy S26 para L64/L128/L256/L512, con el móvil en estado térmico 0 y sin límite de frecuencia de CPU. Las cifras de GPU y CPU por modelo se detallan en la model card; el resto de combinaciones no está disponible en la información extraída.
- Throughput: no disponible. Las medidas publicadas son de una llamada por texto, no de lotes.

## Comparativa con modelos similares

| Variante | Formato | Tamaño | Entrada | Backend | Paridad coseno |
|---|---|---|---|---|---|
| `vela_L{64,128,256,512}_fp16.tflite` | `.tflite` | 614–616 MB | `input_ids` + `attention_mask` | CPU | ≥ 0,99977 |
| `vela_L{64..512}_embeds_fp16.tflite` + `tok_embeddings_fp16.bin` | `.tflite` + `.bin` | 221–223 MB + 393 MB | `inputs_embeds` + `attention_mask` | GPU / NPU | ≥ 0,9994 (NPU), ≥ 0,99997 (GPU) |
| `Vela-1.0-Encoder-307M-Embedding_fp16.litertlm` | `.litertlm` | 624 MB | texto | LiteRT-LM `EmbeddingEngine` | ≥ 0,99977 |
| `vllm-sr/Vela-1.0-Encoder-307M-Embedding` (original) | safetensors / `sentence-transformers` | no disponible | texto | PyTorch CPU/GPU | referencia (1,0) |

No se dispone en la información proporcionada de datos sobre modelos de terceros comparables (por ejemplo, otros encoders multilingües del mismo orden de parámetros convertidos a LiteRT), por lo que la comparación externa se considera no disponible. Las alternativas reales dentro del ecosistema son las tres formas LiteRT de esta ficha frente al modelo PyTorch original: misma calidad, distintos compromisos de tamaño, backend y latencia.

## Limitaciones y advertencias

- Límite duro de 512 tokens: los textos más largos deben trocearse; no hay variante de contexto largo.
- Ventanas estáticas: el coste de inferencia es el de la ventana elegida, no el de la longitud del texto, de modo que un texto de 5 tokens en la ventana 512 paga 68,4 ms en la NPU del S26 en lugar de 6,8 ms.
- Solo produce embeddings: no genera texto, no razona, no usa herramientas y no responde preguntas. Cualquier expectativa de modelo conversacional es un error de uso.
- No hay riesgo de alucinación en el sentido generativo, pero sí de recuperar pasajes irrelevantes si el embedding no discrimina bien el dominio; el único dato de calidad publicado (STS-B v2, 0,811864) procede del autor y no se ha verificado de forma independiente.
- Preprocesado frágil: hay que recortar espacios antes de tokenizar, porque un espacio final se convierte en un token `▁` suelto; y hay que usar el `tokenizer.json` del repo base, cuyos tokens `<bos>` = 2 y `<eos>` = 1 son obligatorios (sin ellos la paridad cae a 0,31).
- Solo float16: no hay versión int8 publicada, así que no se puede reducir más el peso sin salir de la paridad documentada.
- Sesgos: la información disponible no documenta evaluaciones de sesgo ni de equidad para el modelo base ni para esta conversión.
- Idiomas: aunque la etiqueta es multilingüe, la verificación de paridad solo cubre inglés, español, japonés y chino; el rendimiento en otras lenguas no está medido.
- Madurez: el repositorio tiene 27 descargas y 0 likes en el momento de la consulta, con lo que no hay validación externa de la comunidad; conviene ejecutar el conjunto de paridad propio antes de producción.
- Licencia Apache 2.0, que permite uso comercial, pero la información disponible no detalla las condiciones del corpus de entrenamiento del modelo base; conviene revisar su model card antes de un despliegue comercial.
- El grafo CPU requiere que el delegado GPU no intervenga; en GPU/NPU hay que usar la forma `_embeds_` y resolver la tabla de tokens en el host, y el delegado rechaza `SELECT_V2` con condición broadcast, motivo por el que el pooling se escribe como multiply / sum / rsqrt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Vela-1.0-Encoder-307M-Embedding-LiteRT
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M-Embedding
- Herramientas citadas en la model card (litert-torch 0.10.0, litert-converter 0.5.0.dev20260912, ai-edge-quantizer, LiteRT 2.2.0, LiteRT-LM `EmbeddingEngine`): se mencionan sin enlace directo en la información disponible; sus URL no están disponibles.
- Resultados de la búsqueda web: no contenían enlaces relevantes al modelo (devolvieron páginas de France Travail), por lo que no se incluye ningún otro enlace.
