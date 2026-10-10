# FluidInference/embeddinggemma-2-coreml

## Resumen

EmbeddingGemma 2 Core ML es una conversión a Core ML de los encoders de texto, audio e imagen de google/embeddinggemma-2, publicada por FluidInference. No se trata de un modelo entrenado desde cero, sino de un paquete de inferencia pensado para ejecutarse íntegramente en dispositivos Apple: el encoder de texto corre en el Apple Neural Engine y los de audio e imagen en la GPU. Los pesos son los originales de google/embeddinggemma-2 (fp16, con la tabla de tokens en bf16), por lo que no hay pérdida de calidad más allá del redondeo a fp16.

El modelo genera embeddings de 768 dimensiones L2-normalizados, idénticos a los que produce `SentenceTransformer("google/embeddinggemma-2").encode(...)` mediante mean pooling sobre tokens y normalización posterior. Soporta truncamiento Matryoshka a 512, 256 y 128 dimensiones conservando los primeros valores y renormalizando, lo que permite ajustar el coste de almacenamiento y búsqueda. La conversión incluye tres modalidades: texto (hasta 512 tokens), audio (ventanas de 10 s a 16 kHz, con encoder conformer tipo USM) e imagen (encoder ViT con presupuestos de 70, 140 o 280 tokens visuales), todas ellas proyectadas al mismo espacio de embedding.

Su relevancia actual radica en que traslada un modelo de embeddings multilingüe a hardware de consumo Apple sin dependencia de servidores: el repositorio ocupa 1,5 GB y cada encoder cabe en memoria de un iPhone o Mac moderno. Con 217 descargas y 13 "likes", es una opción orientada a aplicaciones on-device de búsqueda semántica, recuperación multimodal y clasificación por similitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders Gemma: texto con capas de atención de ventana deslizante; audio conformer USM (Gemma 4) de 12 capas; vision ViT (Gemma 4) de 16 capas con RoPE 2-D; todo convertido a Core ML ML Program |
| Parametros totales | no disponible (el encoder de texto pesa 271 MB en fp16; la tabla de embeddings es de 262.144 x 512 con 256 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de texto (funciones `embed_32` a `embed_512`); audio: ventanas de 10 s a 16 kHz; imagen: hasta 280 tokens visuales |
| Tipos de cuantizacion | fp16 (pesos de los tres encoders), bf16 (tabla de embeddings), fp32 (variante exacta del encoder de audio) |
| Idiomas soportados | multilingue (heredado de google/embeddinggemma-2) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (ML Program); `embeddings.bf16` (bfloat16 crudo); `position_embeddings.f16` (fp16) |

## Arquitectura y entrenamiento

Esta ficha describe una conversión, no un entrenamiento. FluidInference ha empaquetado los encoders de google/embeddinggemma-2 como programas Core ML con formas fijas, condición necesaria para que el grafo se ejecute en el Apple Neural Engine (las formas variables lo desplazarían a la CPU). El encoder de texto se exporta en siete funciones (`embed_32` a `embed_512`) que comparten un único conjunto de pesos de 271 MB en fp16, con S en {32, 48, 64, 128, 256, 512}. La entrada son `inputs_embeds` [1, S, 512] y una `attention_mask` [1, S]; la salida es un vector `embedding` [1, 768]. Como todas las capas de ventana deslizante ven la secuencia completa dentro del límite de 512 tokens, basta una máscara de padding. Existe además una función `pack_256` que procesa hasta ocho textos cortos en una sola llamada usando `attention_bias`, `positions` y una matriz `pool`, aprovechando que las llamadas cortas están limitadas por el streaming de pesos desde memoria.

Los otros dos encoders son componentes multimodales: el de audio es un conformer USM de 12 capas que convierte 10 s de audio mono a 16 kHz en 250 tokens proyectados al espacio del modelo de texto (el log-mel se calcula dentro del grafo con el extractor Gemma 4: ventanas Hann de 20 ms, salto de 10 ms, 128 bins mel HTK, log(mag + 1e-3)). El de imagen es un ViT de 16 capas con RoPE 2-D que produce tokens visuales por pooling 3x3 y proyección, con funciones `vision_70`, `vision_140` y `vision_280`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que corresponden al modelo base original.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones, L2-normalizados, equivalentes a los del modelo original.
- Truncamiento Matryoshka a 512, 256 y 128 dimensiones conservando los primeros valores y renormalizando.
- Procesamiento por lotes de hasta ocho textos cortos en una sola llamada mediante `pack_256`.
- Embeddings de audio: convierte 10 s de audio a 250 tokens en el mismo espacio que el texto, permitiendo búsqueda de audio con consultas de texto.
- Embeddings de imagen con presupuestos de 70, 140 o 280 tokens visuales; vídeo se procesa aplicando el encoder de imagen fotograma a fotograma.
- Espacio de embedding compartido entre texto, audio e imagen (las tres modalidades se proyectan al mismo espacio de 768 dimensiones).
- Soporte multilingüe heredado del modelo base.
- Uso de prefijos de tarea (`title: none | text: `, `task: search result | query: `, etc.) definidos en `config.json` para condicionar el tipo de embedding.
- No es un modelo generativo: no soporta tool calling, agentes, ni generación de texto; su tarea es exclusivamente la extracción de características (feature-extraction).

## Casos de uso

- Búsqueda semántica on-device en iOS y macOS: indexar documentos localmente y consultar por similitud coseno, con todos los pesos en el dispositivo y sin enviar datos a servidores.
- Recuperación aumentada (RAG) local: generar embeddings de los fragmentos de una base de conocimiento y recuperar los más relevantes para alimentar a un LLM que corra también en el dispositivo.
- Búsqueda en audio con consultas de texto: indexar llamadas, reuniones o pódcasts (1 hora procesada en 5,8 s en un M5 Pro) y localizar fragmentos relevantes mediante una consulta escrita, dado que audio y texto comparten espacio.
- Clasificación y agrupamiento de documentos: usar los embeddings Matryoshka truncados a 256 o 128 dimensiones para clustering y deduplicación con menor coste de memoria.
- Moderación y filtrado por similitud: comparar contenido entrante contra embeddings de referencia para detectar duplicados, spam o material no deseado sin salir del dispositivo.
- Enrutamiento de consultas en pipelines ligeros: embeber la consulta y compararla contra prototipos de categorías para decidir la ruta de procesamiento, beneficiándose de `pack_256` para clasificar hasta ocho entradas por llamada.
- Búsqueda visual y clasificación de imágenes: embeber fotos con los presupuestos de 70/140/280 tokens (por ejemplo, 87,0 % de precisión zero-shot en Oxford Pets con 70 tokens) para búsqueda por similitud o etiquetado.
- Recomendación de contenido: calcular similitudes entre embeddings de usuarios, artículos o medios para ordenar candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. Los únicos datos de evaluación son los siguientes:

| Evaluacion | Resultado |
|---|---|
| Oxford Pets zero-shot (370 fotos, 37 razas), 70 tokens visuales | 87,0 % |
| Oxford Pets zero-shot, 140 tokens visuales | 88,4 % |
| Oxford Pets zero-shot, 280 tokens visuales | 89,5 % |
| Imagen: coseno fp32 frente a sentence-transformers | 1,000000 |
| Imagen: coseno de tokens fp16 a 70/140 tokens | >= 0,997 |
| Audio: coseno de embedding de ventana fp16 vs fp32 | >= 0,977 (media 0,9993) |
| Audio: índice de 1 h, coincidencia top-1 con fp32 en 15/15 consultas de texto | 95 % de solapamiento en top-5 |

| Rendimiento de imagen (M5 Pro) | GPU | Neural Engine |
|---|---|---|
| 70 tokens | 14,6 ms (68 imagenes/s) | 37 ms |
| 140 tokens | 34 ms (30 imagenes/s) | 102 ms |
| 280 tokens | 64-177 ms | 341 ms |

| Rendimiento de audio (1 h de audio, M5 Pro) | Tiempo |
|---|---|
| Modelo de audio (GPU, fp16) | 5,8 s (617x tiempo real) |
| Modelo de audio + texto, ventana a ventana | 10,2 s (353x) |
| Modelo de audio fp32 (exacto a PyTorch) | 13,2 s (272x) |

## Requisitos de hardware

- Ejecución orientada a dispositivos Apple con Neural Engine y GPU (Apple Silicon: M-series, chips A-series en iPhone/iPad, y el M5 Pro usado en las mediciones del autor).
- Huella de memoria de los pesos: encoder de texto 271 MB (fp16), tabla de embeddings 256 MB (bf16), encoder de audio 561 MB (fp16), encoder de imagen 292 MB (fp16), tablas de posición 3 MB. Repositorio completo: 1,5 GB.
- El encoder de texto está diseñado para correr en el Neural Engine; en una GPU de consumo no Apple no es directamente desplegable porque el formato es Core ML.
- El encoder de audio debe correr en GPU (`cpuAndGPU`): los bloques 5-D de la atención local con chunks caen a la CPU en el Neural Engine (46 ms por ventana en ANE frente a 13,6 ms en GPU).
- En imagen, aunque todas las operaciones caben en el Neural Engine, su tiempo crece con el cuadrado del número de parches (atención completa), por lo que la GPU resulta más rápida en todos los presupuestos.
- Opciones de despliegue: Core ML en Apple (este repositorio). Para el modelo base y otras conversiones existen variantes GGUF (unsloth/embeddinggemma-2-GGUF, ggml-org/embeddinggemma-2-GGUF) y ONNX (onnx-community/embeddinggemma-2-ONNX), desplegables con llama.cpp, Ollama, ONNX Runtime, vLLM, TGI o sentence-transformers.
- Latencia y throughput: ver tablas de la sección anterior (imagen de 14,6 ms a 341 ms por imagen; audio a 617x tiempo real en GPU fp16).

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Salida | Formato | Licencia |
|---|---|---|---|---|---|
| FluidInference/embeddinggemma-2-coreml | Conversion Core ML multimodal (texto + audio + imagen) | 512 tokens de texto | 768-d (Matryoshka 512/256/128) | Core ML `.mlpackage` | apache-2.0 |
| google/embeddinggemma-2 | Modelo base original | no disponible en la informacion proporcionada | 768-d | PyTorch/safetensors | no disponible en la informacion proporcionada |
| onnx-community/embeddinggemma-2-ONNX | Conversion ONNX | no disponible | 768-d (heredado) | ONNX | no disponible |
| unsloth/embeddinggemma-2-GGUF y ggml-org/embeddinggemma-2-GGUF | Conversiones GGUF para llama.cpp/Ollama | no disponible | 768-d (heredado) | GGUF | no disponible |

Las alternativas de la misma categoría (otras distribuciones de embeddinggemma-2) comparten arquitectura y dimensión de salida, diferenciándose por el formato de despliegue: Core ML para Apple, ONNX para runtime multiplataforma y GGUF para llama.cpp. Los datos de rendimiento frente a otros modelos de embeddings multilingües no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; cualquier expectativa de ese tipo es incorrecta.
- El texto se limita a 512 tokens; las entradas más largas deben truncarse. El autor indica que, en su conjunto de prueba, truncar a 512 tokens no cambió nada medible, pero es una restricción firme del formato de formas fijas.
- El audio se procesa en ventanas de 10 s (160.160 muestras a 16 kHz); audios más largos requieren segmentación, y solo una parte de los tokens de salida es válida según `frame_mask`.
- Deriva numérica en fp16: en audio, algunos tokens silenciosos se desvían del resultado fp32 (coseno de embedding de ventana >= 0,977, media 0,9993); en un índice de 1 h la coincidencia top-1 se mantuvo en 15/15 consultas con 95 % de solapamiento en top-5. Para máxima fidelidad existe una variante fp32 del encoder de audio (token coseno 1,0000).
- Requiere hardware y runtime Apple (Core ML); no se ejecuta en GPU NVIDIA ni en entornos Linux/Windows sin conversión adicional.
- El encoder de audio cae a la CPU en el Neural Engine y debe ejecutarse en GPU; el de imagen es más rápido en GPU aunque cabe en ANE.
- La licencia del repositorio es apache-2.0, pero conviene verificar los términos del modelo base google/embeddinggemma-2 antes de un uso comercial, ya que esta ficha no documenta dichos términos.
- Los sesgos heredados del modelo base y de sus datos de entrenamiento no se detallan en la información disponible; el riesgo de alucinación no aplica (no genera texto), pero sí la posibilidad de similitudes espurias en los embeddings.
- El soporte multilingüe es genérico ("multilingual"); no se especifica la lista concreta de idiomas ni su cobertura por idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/embeddinggemma-2-coreml
- Organizacion FluidInference en HuggingFace: https://huggingface.co/FluidInference
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Conversiones GGUF: https://huggingface.co/unsloth/embeddinggemma-2-GGUF y https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Conversion ONNX: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Listado de modelos cuantizados de embeddinggemma-2: https://huggingface.co/models?other=base_model%3Aquantized%3Agoogle%2Fembeddinggemma-2
