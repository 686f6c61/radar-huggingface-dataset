# junmo-k/embeddinggemma-2-ane

## Resumen

EmbeddingGemma 2 ANE es una conversión a Core ML del modelo de embeddings `google/embeddinggemma-2`, publicada por el desarrollador junmo-k. Su particularidad es que ejecuta la inferencia **enteramente en el Apple Neural Engine** (Neural Engine de Apple) mediante `MLComputeUnits.cpuAndNeuralEngine`, sin usar la GPU. El paquete forma parte del proyecto ANEEmbed, un servidor y CLI de embeddings en Swift de código abierto, aunque al ser un paquete Core ML estándar puede utilizarse desde cualquier cliente Core ML que respete el contrato de host descrito en el manifiesto.

El modelo resuelve el problema de generar embeddings de alta calidad en dispositivos Apple (Macs con chip de la serie M) de forma local, sin depender de la nube, manteniendo una fidelidad numérica muy alta respecto al modelo original: coseno ≥ 0,99988 para texto de hasta 8192 tokens y ≥ 0,99976 para imágenes. Produce el mismo embedding de 768 dimensiones L2-normalizado que `SentenceTransformer("google/embeddinggemma-2")`, con pooling medio sobre todos los tokens y normalización posterior.

Es relevante ahora porque combina tres elementos poco habituales: soporte multimodal (texto e imágenes), una ventana de contexto larga de hasta 8192 tokens y una ejecución optimizada para hardware de consumo de Apple, con un paquete de solo 0,9 GB gracias a una técnica de compartición de pesos entre las 34 funciones del grafo. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) convertido a Core ML ML Program en fp16; 24 capas con atención sliding-window y global, más encoder de visión |
| Parámetros totales | no disponible (tabla de embeddings de 262.144 × 512 en bfloat16; pesos del encoder de texto de 305 MB en fp16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8192 tokens (buckets de 64 a 2048; ruta larga de 4096 y 8192) |
| Tipos de cuantización | fp16 (ML Program); tabla de embeddings en bfloat16; posición de visión en fp16; truncamiento Matryoshka a 512/256/128 dimensiones |
| Idiomas soportados | multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML), `embeddings.bf16`, `position_embeddings.f16`, `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es `google/embeddinggemma-2`, un encoder de embeddings derivado de la familia Gemma. La conversión a Core ML reexpresa el encoder de texto como ML Program en fp16 con 34 funciones que comparten una única copia de los pesos: 6 funciones de bucket (`embed_64` a `embed_2048`), 20 funciones para capas de atención sliding-window (`long_swa_l{i}`) y 8 funciones para capas globales y cabeza (`long{4096,8192}_glb_l{5,11,17}` y `long{4096,8192}_head`). Sin compartición de pesos, esas 34 funciones ocuparían 2,05 GB como paquetes separados; fusionadas quedan en 305 MB. El encoder de visión (`vision_70`, `vision_140`, `vision_280`) y las tablas de posición se toman sin cambios de `FluidInference/embeddinggemma-2-coreml`.

La conversión se realizó con coremltools 9.0 a partir de los `model.safetensors` originales (revisión `f9972ac22e696a105c482202646979e33e4b5a1e`, con verificación de sha256), con un mínimo de macOS 15. Se aplicaron varias reescrituras numéricamente neutras necesarias para el ANE: RMSNorm divide cada fila por su valor máximo absoluto antes de normalizar (protección contra desbordamiento en fp16); la atención usa un layout de "plegado" que agrupa en la dimensión de fila las cabezas de query que comparten una cabeza K/V, porque el layout habitual con `repeat_interleave` es mal compilado por el compilador del ANE en las capas globales con secuencias largas (las cabezas de query 1-3 devolvían ceros); las máscaras son entradas en tiempo de ejecución y RoPE usa tablas constantes en posiciones absolutas. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de embeddings de texto de 768 dimensiones, L2-normalizados, equivalentes a los del modelo original.
- Embeddings multimodales: incluye encoder de visión con tres resoluciones (70, 140 y 280).
- Contexto largo: procesa texto de hasta 8192 tokens mediante una ruta de buckets (hasta 2048) y una ruta larga (4096/8192) con procesamiento por chunks de 1024 filas y halo de 512.
- Truncamiento Matryoshka a 512, 256 y 128 dimensiones conservando los primeros valores y renormalizando.
- Similitud semántica entre frases (sentence-similarity) y búsqueda de resultados.
- Soporte multilingüe.
- Prompts de tarea específicos del modelo original (por ejemplo `title: none | text: ` o `task: search result | query: `).
- Ejecución en el Apple Neural Engine sin uso de GPU.
- Autotest de carga con 37 pruebas doradas (una por función) para validar la integridad del paquete.
- No se menciona soporte de tool calling, agentes ni generación de texto: es un modelo de extracción de características, no generativo.

## Casos de uso

- Búsqueda semántica local en Mac: indexar documentos y consultar por similitud coseno con embeddings de 768 dimensiones generados en el ANE, sin enviar datos a la nube y con contexto de hasta 8192 tokens por documento.
- Clasificación y agrupamiento de textos: usar los embeddings como entrada de clasificadores o algoritmos de clustering (k-means) en aplicaciones de escritorio, aprovechando el truncamiento Matryoshka a 128 dimensiones para reducir memoria.
- Deduplicación y detección de near-duplicates: comparar grandes corpus de documentos calculando similitud entre embeddings; la compartición de pesos y la ejecución en ANE permiten procesar lotes de hasta 8 secuencias por llamada en los buckets pequeños.
- Búsqueda multimodal texto-imagen: gracias al encoder de visión, indexar imágenes y recuperarlas mediante consultas textuales en aplicaciones de gestión de fototecas o catálogos locales.
- Sistemas de recomendación basados en contenido: calcular embeddings de ítems y perfiles de usuario para similitud, ejecutando la inferencia en el propio dispositivo del usuario final.
- RAG (generación aumentada por recuperación) en aplicaciones macOS/iOS: el modelo actúa como recuperador local en pipelines que combinan un LLM generativo, manteniendo la privacidad y reduciendo la latencia de red.
- Filtrado y moderación de contenido: comparar la similitud de mensajes con embeddings de referencia de categorías prohibidas, con despliegue on-device.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. La model card sí reporta métricas de fidelidad de la conversión:

| Métrica | Valor |
|---|---|
| Similitud coseno frente al original (texto, hasta 8192 tokens) | ≥ 0,99988 |
| Similitud coseno frente al original (imágenes) | ≥ 0,99976 |
| Tamaño del paquete fusionado | 305 MB (frente a 2,05 GB sin compartición) |
| Coste adicional por función de capa sliding-window | ~3 MB (frente a 14 MB de pesos) |
| Tiempo de compilación del `.mlpackage` | ~3 s |

## Requisitos de hardware

- Ejecución exclusiva en Apple Neural Engine mediante `MLComputeUnits.cpuAndNeuralEngine`; no usa GPU.
- Requiere macOS 15 o superior (mínimo declarado por el ML Program en fp16).
- No está pensado para GPU NVIDIA ni para hardware no Apple: no hay versiones GGUF ni CUDA.
- El paquete ocupa 0,9 GB en el repositorio; los `.mlpackage` deben compilarse en el Mac que los ejecuta (`xcrun coremlcompiler compile` o `MLModel.compileModel(at:)`).
- Despliegue mediante el servidor/CLI ANEEmbed (`aneembed models install`, que descarga el repositorio en una revisión fijada, verifica cada archivo contra `manifest.json` y compila) o mediante cualquier cliente Core ML que respete el contrato de host.
- VRAM, latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Multimodal | Licencia | Ejecución |
|---|---|---|---|---|---|
| EmbeddingGemma 2 ANE (este) | Embeddings, conversión Core ML | 8192 tokens | Sí (texto + imagen) | Apache-2.0 | Apple Neural Engine |
| google/embeddinggemma-2 | Embeddings original (SentenceTransformer) | 8192 tokens (según model card del original) | Sí | no disponible en esta ficha | GPU/CPU genérica |
| FluidInference/embeddinggemma-2-coreml | Conversión Core ML del mismo base | no disponible | Sí (encoder de visión de origen) | no disponible | Core ML |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de extracción de características (embeddings), no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La ejecución está restringida al Apple Neural Engine y a macOS 15 o superior; no es portable a otras plataformas sin reconversión.
- La atención requiere el layout de "plegado" y máscaras en tiempo de ejecución: modificaciones del grafo o del contrato de host pueden producir resultados incorrectos (el layout estándar con `repeat_interleave` devuelve ceros en las capas globales).
- El paquete publicado contiene solo los `.mlpackage`; es necesario compilarlos localmente antes de usar.
- Riesgo de sesgos y alucinaciones del modelo base: no se documentan en la información disponible.
- La calidad de los embeddings depende de usar los prompts de tarea correctos del modelo original.
- Aunque la licencia es Apache-2.0, deben conservarse los archivos `LICENSE` y `NOTICE` con la atribución correspondiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.

## Enlaces

- [Hugging Face: junmo-k/embeddinggemma-2-ane](https://huggingface.co/junmo-k/embeddinggemma-2-ane)
- [Modelo base: google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [Repositorio ANEEmbed](https://github.com/junmo-kim/ANEEmbed)
- [FluidInference/embeddinggemma-2-coreml](https://huggingface.co/FluidInference/embeddinggemma-2-coreml)
