# software-mansion/react-native-executorch-distiluse-base-multilingual-cased-v2

## Resumen

`react-native-executorch-distiluse-base-multilingual-cased-v2` es una exportación a formato ExecuTorch del modelo de embeddings de frases `distiluse-base-multilingual-cased-v2`, publicada por Software Mansion para su uso con la librería React Native ExecuTorch. No se trata de un modelo nuevo: el autor original es el equipo de Sentence Transformers, y esta versión empaqueta los pesos en programas `.pte` optimizados para ejecución en dispositivo (móvil, escritorio y navegador) con distintos backends de aceleración.

El modelo resuelve el problema de la similitud semántica entre frases multilingües: convierte texto en vectores densos de 512 dimensiones que pueden compararse por similitud coseno para tareas de búsqueda semántica, deduplicación, clustering o recuperación. Su interés actual radica en que permite ejecutar esta capacidad íntegramente en el dispositivo, sin llamadas a servidor, con variantes que van desde 133 MB (MLX int8) hasta 516 MB (XNNPACK fp32).

La arquitectura subyacente es DistilBERT multilingual cased (una versión destilada de BERT, aproximadamente la mitad de parámetros que la base) seguida de mean pooling, una capa densa de 768 a 512 con activación Tanh y normalización L2. La longitud máxima de secuencia es de 126 tokens, lo que limita su uso a frases o párrafos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT multilingual cased + mean pooling + Dense (768→512, Tanh) + L2 norm |
| Parametros totales | no disponible (DistilBERT base, ~66 M según arquitectura; no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 126 tokens (128 − 2 para `[CLS]`/`[SEP]`) |
| Tipos de cuantizacion | fp32 (XNNPACK), fp16 (CoreML, Vulkan), int8 (MLX), 8da4w (XNNPACK) |
| Idiomas soportados | 50+ (multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), tokenizer.json, tokenizer_config.json, config.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder DistilBERT en variante multilingüe con casing (distingue mayúsculas y minúsculas). Sobre la salida del encoder se aplica mean pooling, una proyección densa de 768 a 512 dimensiones con activación Tanh y normalización L2, de modo que el vector resultante tiene norma unitaria y la similitud coseno equivale al producto escalar. El modelo original fue entrenado por el equipo de Sentence Transformers mediante destilación y ajuste para similitud semántica; la model card de esta exportación no detalla el número de tokens de entrenamiento ni la composición del dataset.

La innovación relevante de esta publicación no está en el modelo sino en la exportación: el programa ExecuTorch omite la conversión interna de la máscara de atención a 4D porque el runtime de React Native ExecuTorch nunca aplica padding en inferencia (una sola frase, sin batching). Según el autor, esto mantiene la exactitud bit a bit con la referencia de PyTorch (RMSE 0 en entrada aleatoria fp32), reduce aproximadamente un 27 % el tiempo de pared del forward en XNNPACK y mantiene la delegación XNNPACK en torno al 89–91 % del tiempo de ejecución del grafo. Se documentan además dos combinaciones rechazadas por el exportador: XNNPACK con fp16 (desbordamiento en softmax/LayerNorm que produce NaN) y CoreML con 8da4w (coremltools no tiene mapeo MIL para tensores `torch.int8` de torchao).

## Capacidades

- Generación de embeddings de frases de 512 dimensiones, normalizados L2, aptos para similitud coseno.
- Similitud semántica multilingüe y cross-lingual: comparación de frases en idiomas distintos en un mismo espacio vectorial.
- Recuperación de frases de longitud media (retrieval) y búsqueda semántica sobre corpus cortos.
- Clustering y deduplicación de textos por proximidad vectorial.
- Ejecución en dispositivo sin conexión, con backends CoreML (Apple), MLX (Apple Silicon), Vulkan (GPU multiplataforma) y XNNPACK (CPU).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica local en aplicaciones móviles: indexar notas, mensajes o artículos en el dispositivo y recuperar por significado sin enviar datos a un servidor, usando la variante MLX int8 (133 MB) o CoreML fp16 (258 MB).
- Deduplicación de contactos o registros: comparar descripciones o nombres de entidades con similitud coseno para fusionar duplicados en una app de CRM o agenda.
- Clasificación de tickets de soporte por similitud: asignar una consulta entrante al grupo de incidencias más parecido comparando su embedding con los centroides de cada categoría.
- Filtrado de contenido multilingüe: detectar mensajes semánticamente equivalentes en distintos idiomas (por ejemplo, spam repetido traducido) gracias al espacio vectorial compartido para 50+ idiomas.
- Recomendación de contenido en apps de lectura: calcular la similitud entre el artículo actual y el catálogo local para sugerir lecturas relacionadas sin backend.
- Enrutamiento de consultas en asistentes de voz o chatbots: decidir qué flujo o intención activar comparando la frase del usuario con ejemplos predefinidos, con latencia de dispositivo y sin coste de API.
- Anonimización o agrupación de reseñas: agrupar opiniones equivalentes antes de enviarlas a un servicio de analítica, reduciendo volumen y preservando privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 133 MB (MLX int8) y 516 MB (XNNPACK fp32) de tamaño de programa; el consumo en ejecución es del orden de cientos de MB según backend.
- GPU recomendadas: no requiere GPU dedicada; los backends CoreML y MLX aprovechan la GPU integrada de Apple Silicon; Vulkan cubre GPU integradas y dedicadas en otras plataformas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna; también en CPU de móvil mediante XNNPACK.
- Opciones de despliegue: runtime ExecuTorch v1.4.1, integrado en React Native ExecuTorch (registro de modelos de la librería); no está pensado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; el autor indica una reducción de ~27 % en el tiempo de pared del forward en XNNPACK y una delegación XNNPACK del 89–91 % del tiempo de grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Ejecucion en dispositivo |
|---|---|---|---|---|---|
| distiluse-base-multilingual-cased-v2 (esta exportacion) | ~66 M (no confirmado) | 126 tokens | 512 | Apache 2.0 | Si (ExecuTorch) |
| paraphrase-multilingual-MiniLM-L12-v2 | no disponible | no disponible | 384 | Apache 2.0 | No en este repo |
| multilingual-e5-small | no disponible | no disponible | 384 | MIT | No en este repo |
| LaBSE | no disponible | no disponible | 768 | Apache 2.0 | No en este repo |

Los datos de los modelos alternativos no proceden de la información proporcionada y se indican solo como referencia de categoría; no se dispone de comparación de rendimiento entre ellos en esta ficha.

## Limitaciones y advertencias

- Longitud máxima de 126 tokens: frases o párrafos más largos se truncan, lo que degrada la calidad del embedding.
- El propio autor señala que las consultas cortas de una sola palabra en idiomas distintos del inglés son el punto más débil del modelo; para esos casos conviene usar frases más largas o entradas en inglés.
- Riesgo de sesgo heredado del corpus multilingüe de entrenamiento de DistilBERT y del dataset de similitud original; no se documenta ninguna evaluación de sesgo en esta exportación.
- No es un modelo generativo: no produce texto, no razona y no admite tool calling; usarlo para esas tareas es un error de categoría.
- Compatibilidad estricta con ExecuTorch v1.4.1: no hay garantía de compatibilidad hacia adelante, por lo que un runtime más antiguo puede fallar al cargar los `.pte`.
- La combinación XNNPACK + fp16 no es viable (salida NaN) y CoreML + 8da4w no está soportada por el exportador; hay que elegir entre las variantes publicadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución del modelo original de Sentence Transformers.
- En producción, validar la calidad de recuperación con datos propios antes de sustituir un modelo mayor basado en servidor; el tamaño reducido y el truncamiento a 126 tokens implican menor precisión en corpus largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-distiluse-base-multilingual-cased-v2
- Modelo original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v2/tree/main
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
