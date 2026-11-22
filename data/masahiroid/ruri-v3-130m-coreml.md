# masahiroid/ruri-v3-130m-coreml

## Resumen

`ruri-v3-130m-coreml` es una conversión no oficial a Core ML de `cl-nagoya/ruri-v3-130m`, un modelo de embeddings de frases de propósito general para japonés desarrollado por la Universidad de Nagoya (organización `cl-nagoya`). El modelo original emplea una arquitectura ModernBERT-Ja con 132 millones de parámetros y dimensión oculta de 512, y produce representaciones vectoriales de 512 dimensiones mediante mean pooling y normalización L2, de modo que la similitud coseno puede sustituirse por un producto escalar directo.

La conversión, realizada por el usuario `masahiroid`, resuelve un problema práctico: ejecutar búsqueda semántica y extracción de características en dispositivos iOS y macOS sin depender de un servidor. Para ello, el grafo se divide en buckets de longitud fija (128, 256 y 512 tokens), ya que Core ML tiene dificultades para trazar grafos de longitud variable, y se ofrecen variantes en fp16 (265 MB) e int8 con cuantización solo de pesos (133 MB).

El interés actual del modelo radica en su rendimiento verificado en hardware real: en un iPhone 17 Pro con iOS 27 ejecuta inferencia en GPU y Neural Engine a aproximadamente 5 ms por frase, frente a los 9-10 ms del `NLContextualEmbedding` de Apple, con una diferencia máxima de 0,0042 en las puntuaciones de similitud entre fp16 e int8. Está pensado para aplicaciones móviles de recuperación y comparación semántica en japonés, con soporte secundario de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-Ja (transformer encoder), con mean pooling y normalización L2 en la cabeza |
| Parametros totales | 132 M (modelo base); dimensión oculta 512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens según el bucket del `.mlpackage` elegido |
| Tipos de cuantizacion | fp16 y int8 (weight-only) |
| Idiomas soportados | japonés (ja) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML); el modelo base original en safetensors vía `transformers` |
| Dimensión del embedding | 512, normalizado L2 |
| Tokenizador | `tokenizer.json` del modelo original (ModernBERT-Ja / familia PLaMo), no incluido en la conversión |
| Entradas del modelo | `input_ids` y `attention_mask`, shape `[1, L]`, Int32 |
| Salida del modelo | `sentence_embedding`, shape `[1, 512]`, dtype float16 |
| Tamaño del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

El modelo subyacente es `cl-nagoya/ruri-v3-130m`, un encoder ModernBERT adaptado al japonés con 132 millones de parámetros y dimensión oculta de 512. La conversión envuelve el modelo en un módulo `nn.Module` que aplica mean pooling sobre la secuencia y normaliza L2 el vector resultante, de forma que la salida es directamente un embedding de frase de 512 dimensiones. El trazado se realiza con `torch.jit.trace`, lo que obliga a fijar longitudes de secuencia y motiva la estrategia de buckets.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La innovación técnica destacable de esta ficha no está en el entrenamiento sino en el proceso de conversión: bucketing por longitud para evitar grafos dinámicos en Core ML, cuantización int8 solo de pesos para reducir el tamaño a la mitad y verificación numérica contra la salida de PyTorch (similitud coseno de 0,9998 o superior en Mac con `coremltools`).

Un aspecto funcional crítico es el esquema de prefijos "1+3" heredado del modelo original, obligatorio para reproducir su comportamiento: cadena vacía para similitud semántica general, `トピック: ` para clasificación y clustering, `検索クエリ: ` para el lado de consulta en recuperación y `検索文書: ` para el lado de documento.

## Capacidades

- Generación de embeddings de frases de 512 dimensiones, normalizados L2, aptos para similitud coseno o producto escalar.
- Búsqueda semántica y recuperación densa (dense retrieval) sobre texto japonés, con prefijos específicos para consulta y documento.
- Clasificación y clustering de textos mediante el prefijo de tópico.
- Extracción de características (`feature-extraction`) para pipelines de NLP.
- Procesamiento bilingüe japonés-inglés, con clara orientación al japonés.
- Ejecución en dispositivo en iOS y macOS mediante Core ML, con aceleración en GPU y Neural Engine (`computeUnits = .all`).
- Integración con Swift a través de `MLModel` y con Python mediante `coremltools` para validación.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un encoder de embeddings, no un modelo generativo.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Búsqueda semántica en aplicaciones iOS: la app "道程 -Michinori-" compara el texto introducido por el usuario con literatura japonesa clásica y localiza los pasajes más cercanos semánticamente, usando este modelo para la recuperación inicial de candidatos por embedding y un reranker Core ML para reordenar.
- Recuperación aumentada en local (RAG on-device): indexar fragmentos de documentos japoneses con el bucket seq256 o seq512 y embeber la consulta del usuario con seq128, todo sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Clustering y organización de notas o correos: agrupar textos por temática usando el prefijo `トピック: ` y similitud coseno entre embeddings, con la variante int8 para mantener el consumo de memoria bajo en móvil.
- Deduplicación y detección de contenido similar: comparar embeddings de 512 dimensiones mediante producto escalar para identificar pasajes duplicados o parafraseados en corpus japoneses.
- Filtrado y moderación semántica: comparar entradas de usuario contra un conjunto de referencias conocidas (por ejemplo, intentos de prompt injection, como se muestra en la demo Ruri Atlas) y decidir por umbral de similitud antes de procesar el texto.
- Búsqueda en catálogos y bases de conocimiento bilingües ja-en: embeber descripciones de producto o artículos en ambos idiomas y recuperar por similitud semántica en una app de escritorio macOS.
- Prototipado rápido en Python: validar la calidad de los embeddings con `coremltools` antes de integrarlos en la app, comparando contra la salida del modelo PyTorch original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, JSTS, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son medidas de latencia y fidelidad de la conversión:

| Metrica | Valor |
|---|---|
| Latencia en iPhone 17 Pro (iOS 27), seq128 fp16 e int8, GPU/Neural Engine | ~5 ms por frase |
| Referencia: `NLContextualEmbedding` de Apple en el mismo dispositivo | ~9-10 ms por frase |
| Diferencia máxima de puntuación de similitud entre fp16 e int8 | 0,0042 (ranking de búsqueda prácticamente sin cambios) |
| Similitud coseno frente a la salida PyTorch original (Mac, `coremltools`, todos los ficheros) | ≥ 0,9998 |

## Requisitos de hardware

- Inferencia verificada en iPhone 17 Pro con iOS 27, usando `computeUnits = .all` (GPU y Neural Engine).
- Tamaño en disco: 265 MB por variante fp16 y 133 MB por variante int8; el repositorio completo ocupa 1,9 GB.
- La variante int8 es la recomendada para aplicaciones móviles por su menor huella de memoria y almacenamiento.
- No se especifican requisitos mínimos de VRAM ni GPU de escritorio; el modelo está pensado para el runtime de Core ML en Apple Silicon y dispositivos iOS, no para despliegue en GPU NVIDIA.
- Opciones de despliegue: Core ML en iOS/macOS (integrado en Xcode), `coremltools` en Python para validación. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo generativo.
- Throughput estimado: aproximadamente 200 frases por segundo en el dispositivo de referencia a 5 ms por inferencia, en régimen estacionario y con secuencias de 128 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `masahiroid/ruri-v3-130m-coreml` | 132 M | 128/256/512 (buckets) | ja, en | Core ML (fp16, int8) | Apache 2.0 | Conversión no oficial; ~5 ms/frase en iPhone 17 Pro |
| `cl-nagoya/ruri-v3-130m` | 132 M | no disponible en la información | ja, en | safetensors (transformers) | Apache 2.0 | Modelo original; requiere PyTorch, no ejecuta en dispositivo |
| `NLContextualEmbedding` (Apple) | no disponible | no disponible | multilingüe (no detallado) | API del sistema iOS/macOS | propietaria | ~9-10 ms/frase en el mismo dispositivo; sin control sobre el modelo |
| `masahiroid/japanese-reranker-xsmall-v2-coreml` | no disponible | no disponible | ja | Core ML | no disponible | Reranker complementario, usado junto a este modelo en la app Michinori |

## Limitaciones y advertencias

- Conversión no oficial: el autor original del modelo es `cl-nagoya` (Universidad de Nagoya); los problemas de calidad deben contrastarse contra `cl-nagoya/ruri-v3-130m`.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- El tokenizador no está incluido en el repositorio; es obligatorio usar el `tokenizer.json` del modelo original y respetar el esquema de prefijos "1+3", o los embeddings no coincidirán con el comportamiento esperado.
- Las longitudes de secuencia están fijas por bucket: hay que rellenar o truncar `input_ids` y `attention_mask` a 128, 256 o 512, lo que puede perder información en documentos más largos.
- La cuantización int8 introduce una desviación máxima de 0,0042 en las puntuaciones de similitud; aceptable para ranking, pero a considerar en aplicaciones con umbrales muy ajustados.
- El soporte de idiomas se limita a japonés e inglés; el rendimiento en otros idiomas no está documentado.
- No se han publicado evaluaciones de sesgo ni de robustez frente a alucinaciones semánticas (falsos positivos en recuperación) en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo de terceros conviene conservar la atribución a `cl-nagoya` y revisar los términos del modelo base.
- Dependencia del ecosistema Apple: no es desplegable en servidores Linux con GPU NVIDIA sin reconvertir el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-130m-coreml
- Modelo base original: https://huggingface.co/cl-nagoya/ruri-v3-130m
- Demo interactiva Ruri Atlas (WebGPU): https://huggingface.co/spaces/masahiroid/ruri-atlas
- Repositorio de conversión y herramientas: https://github.com/masahiroid/ruri-coreml
- Informe de verificación: https://github.com/masahiroid/ruri-coreml/blob/main/REPORT.md
- Manual de integración en Swift: https://github.com/masahiroid/ruri-coreml/blob/main/RuriDemo/MANUAL.md
- Reranker complementario: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-coreml
- App "道程 -Michinori-" en App Store: https://apps.apple.com/jp/app/道程-michinori/id6782354976
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
- Paper referenciado en los tags (arXiv:2409.07737): https://arxiv.org/abs/2409.07737
