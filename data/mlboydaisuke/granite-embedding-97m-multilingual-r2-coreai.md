# mlboydaisuke/Granite-Embedding-97M-Multilingual-R2-CoreAI

## Resumen

Granite-Embedding-97M-Multilingual-R2-CoreAI es la exportación a Core AI del modelo de embeddings de IBM `ibm-granite/granite-embedding-97m-multilingual-r2`, publicada por el usuario mlboydaisuke. Core AI es el runtime de ML en dispositivo de Apple para iOS 27 y macOS 27, sucesor de Core ML, que ejecuta bundles `.aimodel` sobre GPU o Neural Engine. Esta versión empaqueta el encoder de IBM como un modelo estático listo para inferencia local en dispositivos Apple, con variantes compiladas para iPhone 17 Pro.

El modelo subyacente es un encoder ModernBERT de 97 millones de parámetros que produce vectores de embedding de 384 dimensiones, normalizados L2 y con pooling CLS. Está pensado para similitud semántica y recuperación de información multilingüe, con japonés e inglés entre los idiomas soportados. Al ser un encoder y no un generador, ejecuta una única pasada forward sobre la secuencia de entrada, sin bucle autorregresivo ni caché KV.

La relevancia de esta ficha radica en que es el embedder más pequeño del catálogo Core AI del autor (390 MB en fp32, frente a 1,2 GB de EmbeddingGemma-300m y 1,1 GB de Qwen3-Embedding-0.6B) y el primero con arquitectura de encoder, ya que el resto son decoders causales usados como encoders. Su calidad de recuperación relativa a esos modelos no se ha medido en esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 97 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 o 512 tokens (elección en tiempo de exportación, batch = 1) |
| Tipos de cuantizacion | fp32 y w8 (tabla de embedding fp32) |
| Idiomas soportados | multilingüe, con japonés e inglés entre ellos |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (bundle Core AI), tokenizer.json y Swift de host incluidos |
| Dimension de embedding | 384 (CLS-pooled, L2-normalizado) |
| Capas / hidden / cabezas | 12 / 384 / 12 (32 dimensiones por cabeza) |
| MLP | GLU de 1536 con SiLU |
| Vocabulario | 180.000 tokens |
| Atencion | global en capas 0, 3, 6, 9 (RoPE θ 150.000); local con ventana deslizante de radio 64 en las otras 8 (RoPE θ 160.000) |
| Pooling | CLS, L2 normalize (ambos en el grafo) |
| Tamano del repo | 2,8 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 12 capas con dimensión oculta 384, 12 cabezas de atención de 32 dimensiones y un MLP GLU de 1536 con activación SiLU. Todos los componentes son sin sesgo (atención, MLP y LayerNorm con ε 1e-5). La atención es híbrida: global en las capas 0, 3, 6 y 9 con RoPE θ 150.000, y local en las otras ocho con ventana deslizante de radio inclusivo 64 (129 claves por consulta interior) y RoPE θ 160.000. La capa 0 no tiene pre-norm de atención, ya que la LayerNorm del embedding cumple esa función. El pooling es CLS seguido de normalización L2, ambos integrados en el grafo.

La exportación a Core AI fija un contrato de grafo concreto: entrada `input_ids` de forma [1, S] en int32, rellenada a la derecha hasta la rejilla S con el token 179935; entrada `attention_mask` de forma [1, S] en int32 con 1 sobre tokens reales y 0 sobre padding; salida `embedding` de forma [1, 384] en fp32, con pooling CLS y normalización L2. S puede ser 128 o 512 según la elección en exportación y el batch es siempre 1. El tokenizador es parte crítica del contrato: sin prefijo, sin stripping y sin normalización; tokenización con el `tokenizer.json` fijado mediante regex `Split(Isolated)`, `ByteLevel` sin espacio de prefijo y BPE de bytes con `ignore_merges = true`. Se trunca el cuerpo a S−2 y se envuelve con `[CLS 179934] cuerpo [SEP 179938]`, rellenando a la derecha con PAD 179935 y máscara 0. La similitud se calcula por producto escalar de vectores unitarios. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de embeddings de texto de 384 dimensiones para similitud semántica y recuperación de información.
- Feature extraction y sentence similarity como tareas principales de pipeline.
- Multilingüe, con japonés e inglés entre los idiomas cubiertos.
- Ejecución en dispositivo en iOS 27 y macOS 27 sobre GPU o Neural Engine mediante Core AI.
- Inferencia de una sola pasada forward: sin bucle autorregresivo, sin caché KV y sin LM head.
- Soporte de dos rejillas de contexto (S = 128 o 512) con batch 1.
- Tokenizador de referencia implementado sin dependencia de Hugging Face, en Python y en Swift (Foundation-only).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, al no ser un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica local en notas personales: la app de ejemplo CoreAISearchiOS descarga la variante `ios/fp32-s128` y busca por significado en las notas del usuario, con 16,5 ms por consulta en un iPhone 18 Pro (iOS 27.2).
- Deduplicación y agrupación de documentos en el dispositivo: al generar vectores unitarios de 384 dimensiones, se puede calcular similitud por producto escalar para agrupar textos similares sin enviar datos a la nube.
- Clasificación de texto zero-shot por similitud: comparar el embedding de un texto con embeddings de etiquetas descriptivas permite asignar categorías sin entrenamiento adicional.
- Recuperación aumentada en apps móviles: indexar fragmentos de documentos con S = 512 y recuperar los más relevantes para una consulta, manteniendo el contenido en el dispositivo.
- Filtrado de contenido y detección de near-duplicates en pipelines de moderación, usando la similitud coseno entre pares de textos.
- Búsqueda multilingüe japonés-inglés: el soporte de ambos idiomas permite consultas cruzadas entre idiomas dentro de una misma colección.
- Integración en apps de macOS 27 para indexación semántica de archivos locales, aprovechando el runtime Core AI sobre GPU o Neural Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. La model card indica explícitamente que la calidad de recuperación relativa a EmbeddingGemma-300m y Qwen3-Embedding-0.6B no se midió, y que el conjunto de prueba (35 textos, 4 consultas, 12 documentos) es un instrumento de paridad, no un benchmark.

Mediciones de latencia y huella en iPhone 17 Pro (iPhone18,1), iOS 27.0 build 24A437, GPU preferida, 105 muestras en caliente, estado térmico fair:

| Variante | S | Gate | Min coseno vs HF | Máx \|err\| | Carga | Primera tras carga | Mediana en caliente | Huella pico |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| fp32 | 128 | 35/35 | 0,999999999999407 | 1,97e-7 | 81 ms | 23,1 ms | 5,54 ms | 640 MB |
| fp32 | 512 | 35/35 | 0,999999999999486 | 2,38e-7 | 586 ms | 39,9 ms | 20,99 ms | 640 MB |
| w8 / tabla fp32 | 128 | 35/35 | 0,999410 | 5,67e-3 | 61 ms | 25,3 ms | 6,64 ms | 555 MB |
| w8 / tabla fp32 | 512 | 35/35 | 0,999410 | 5,67e-3 | 447 ms | 138,7 ms | 23,07 ms | 553 MB |

Cada fila coincidió en 4/4 top-1 de recuperación, con 0 flips en pares claros y 0 deriva en repeticiones. La puerta de validación cubre 681 textos × 2 rejillas = 1.362 casos frente a `AutoTokenizer`, incluyendo todos los tokens añadidos en cinco contextos de frontera, y demuestra que se detectan cuatro mutaciones (pad 0, perder SEP, stripping e `ignore_merges=false`).

## Requisitos de hardware

- Huella pico del proceso completo (app, tokenizador y hashing de ficheros) de 640 MB en fp32 y 553-555 MB en w8, medida en iPhone 17 Pro.
- Tamaño del modelo base: 390 MB en fp32, según la model card.
- GPU: ejecuta sobre GPU o Neural Engine de Apple mediante Core AI; no se dispone de datos para A100, H100 ni RTX 4090, al estar orientado a silicio Apple.
- Cabe en hardware consumer Apple: iPhone 17 Pro (bundles compilados `h18p`) e iPhone 18 Pro; también macOS 27.
- Despliegue mediante el runtime Core AI (`AIModel.run` directo, no el motor generate con pipeline), con bundles `.aimodel` compilados a priori.
- Exportación desde PyTorch con `coreai-torch`; el tokenizador de host está disponible en Python y en Swift.
- Latencia medida: 5,54 ms (fp32, S=128) y 20,99 ms (fp32, S=512) de mediana en caliente; 16,5 ms por consulta en iPhone 18 Pro para la variante `ios/fp32-s128`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño fp32 | Licencia | Calidad de recuperación medida |
|---|---|---|---|---|---|
| Granite-Embedding-97M-Multilingual-R2-CoreAI | 97 M | 128 o 512 | 390 MB | Apache-2.0 | no medida frente a los otros |
| EmbeddingGemma-300m | 300 M | no disponible | 1,2 GB | no disponible en la información | no medida |
| Qwen3-Embedding-0.6B | 0,6 B | no disponible | 1,1 GB | no disponible en la información | no medida |

La model card sitúa a este modelo como el embedder más pequeño del catálogo Core AI y el primero con arquitectura de encoder, frente a los otros dos, que son decoders causales ejecutados como encoders. No se han publicado comparaciones de calidad entre ellos en la información disponible.

## Limitaciones y advertencias

- Es un encoder, no un generador: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La calidad de recuperación frente a EmbeddingGemma-300m y Qwen3-Embedding-0.6B no se ha medido; el conjunto de prueba es de paridad, no un benchmark.
- El contrato del tokenizador es estricto: usar el `tokenizer.json` fijado, truncar el cuerpo a S−2, envolver con CLS y SEP, rellenar con PAD 179935 y máscara 0. Un tokenizador estándar de sentence-transformers aplica stripping y produce resultados distintos en textos con espacios o saltos de línea iniciales.
- `ignore_merges = true` es obligatorio; un BPE que ignore el flag tokeniza de forma diferente.
- El padding con 0 es un token distinto del PAD correcto; el error es silencioso.
- Batch fijo de 1 y rejilla fija de 128 o 512 tokens elegida en exportación.
- La similitud debe calcularse por producto escalar de vectores unitarios; la truncación de dimensiones no es una propiedad de este modelo.
- Requiere iOS 27 o macOS 27 y el runtime Core AI; no es desplegable en otras plataformas sin reexportación.
- No se dispone de información sobre sesgos del modelo base ni sobre restricciones adicionales de uso comercial más allá de la licencia Apache-2.0.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones irrelevantes si el texto se tokeniza incorrectamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Granite-Embedding-97M-Multilingual-R2-CoreAI
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Zoo card, receta y transcripción de la puerta de validación: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/granite-embedding-97m/README.md
- App de ejemplo CoreAISearchiOS: https://github.com/john-rocky/coreai-samples/tree/main/CoreAISearchiOS
- Tokenizador de referencia en Python: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/granite_embedding/_granite_tokenizer.py
- Benchmark de LLM en silicio Apple: https://github.com/john-rocky/apple-silicon-llm-bench
- Leaderboard DeviceMark: https://devicemark.github.io/
