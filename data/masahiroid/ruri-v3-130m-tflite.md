# masahiroid/ruri-v3-130m-tflite

## Resumen

ruri-v3-130m-tflite es una conversión no oficial al formato LiteRT (`.tflite`) del modelo de embeddings de texto en japonés cl-nagoya/ruri-v3-130m, un modelo de propósito general para similitud semántica y extracción de características. La conversión la mantiene masahiroid y está pensada específicamente para ejecutar inferencia en Android y otros runtimes LiteRT, sin depender de PyTorch ni de ONNX Runtime en el dispositivo.

El modelo resuelve el problema de llevar un encoder de frases japonés a entornos móviles y de borde: el repositorio incluye tres variantes con longitud de secuencia fija (128, 256 y 512 tokens) en fp32, con tokenización compatible con Hugging Face y pooling medio más normalización L2 integrados en el grafo. La arquitectura subyacente es ModernBERT, con 130 millones de parámetros, y el modelo base está entrenado exclusivamente para japonés.

Su relevancia actual radica en que permite construir pipelines de búsqueda semántica y RAG en aplicaciones Android nativas con un artefacto autocontenido, verificado contra PyTorch y probado de extremo a extremo en el emulador de Android (API 36.1, arm64). No obstante, es un artefacto de conversión, no un modelo nuevo: no aporta mejoras de calidad sobre el original y aún carece de variantes cuantizadas y de cifras de latencia en dispositivos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), según el modelo base |
| Parametros totales | 130 millones (modelo base ruri-v3-130m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | fija por variante: 128, 256 o 512 tokens |
| Tipos de cuantizacion | fp32 únicamente; fp16 e int8 no incluidas todavía |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT `.tflite` (tres ficheros con longitud de secuencia fija); tokenizer copiado del modelo base |
| Dimension de embedding | no disponible en la información proporcionada |
| Entradas | `input_ids` y `attention_mask`, int32 `[1, seq]` |
| Salida | embedding normalizado L2 `[1, dim]` con mean pooling interno |
| Tamano del repositorio | 1,6 GB |
| Libreria | litert |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base cl-nagoya/ruri-v3-130m, un encoder de la familia ModernBERT con 130 millones de parámetros orientado a embeddings de frases en japonés. La conversión a LiteRT se realizó con `litert-torch` y produce tres grafos con longitud de secuencia fija (128, 256 y 512), en los que el mean pooling y la normalización L2 están embebidos en el propio grafo, de modo que la salida es directamente un vector listo para similitud coseno.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación; esos datos pertenecen a la model card del modelo original y no se detallan en la información proporcionada. La innovación técnica de este repositorio es de ingeniería de despliegue: fijar la longitud de secuencia para evitar formas dinámicas en LiteRT, respetar la máscara de atención dentro del grafo y validar la equivalencia numérica frente a PyTorch. El autor indica además que la tokenización en dispositivo se cubre con un `UnigramTokenizer` en Kotlin que reproduce exactamente los ids de Hugging Face en 450 de 450 casos de prueba.

## Capacidades

- Generación de embeddings de frases en japonés para similitud semántica y extracción de características.
- Recuperación densa (dense retrieval) en japonés, con prefijos recomendados por el modelo base (`検索クエリ: ` para consultas y `検索文書: ` para documentos).
- Reranking de resultados de búsqueda, mediante las utilidades `LiteRtEmbedder` y `LiteRtReranker` de la librería Kotlin del autor.
- Ejecución en Android y otros runtimes LiteRT, con inferencia local sin servidor.
- Soporte de enmascaramiento de atención para manejar secuencias con padding.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un encoder, no un modelo generativo.
- Capacidad multilingüe: no disponible; el modelo está entrenado solo para japonés.

## Casos de uso

- Búsqueda semántica dentro de una app Android: indexar documentos en japonés y consultar con el prefijo `検索クエリ: `, usando la variante de 512 tokens para fragmentos largos y la de 128 para consultas cortas y baja latencia.
- RAG en el dispositivo: recuperar pasajes relevantes de una base local antes de pasarlos a un LLM, evitando enviar el corpus a un servidor y reduciendo costes de infraestructura.
- Deduplicación y agrupación de textos: calcular embeddings de titulares, reseñas o incidencias y agrupar por similitud coseno para detectar duplicados en un corpus japonés.
- Reranking de resultados de un buscador existente: usar el modelo como segunda etapa sobre los candidatos de un motor léxico, aprovechando la variante de 256 tokens como compromiso entre cobertura y coste.
- Clasificación y enrutado por similitud: comparar la consulta del usuario con embeddings de prototipos de intención para dirigirla a un flujo u otro dentro de una aplicación móvil.
- Moderación y detección de contenido similar: comparar mensajes entrantes con una lista de referencia de textos problemáticos mediante umbrales de similitud.
- Análisis de feedback de usuarios offline: procesar encuestas o tickets en japonés en un portátil o dispositivo de borde con el intérprete LiteRT, sin depender de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta la verificación de equivalencia numérica frente a PyTorch en el intérprete LiteRT y una prueba de extremo a extremo en el emulador de Android (API 36.1, arm64) con recuperación y reranking correctos para las consultas de muestra. No se aportan cifras de latencia ni de throughput en dispositivos reales.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo tiene 130 millones de parámetros en fp32, lo que sitúa el peso de los pesos en torno a 0,5 GB, aunque el tamaño del repositorio (1,6 GB) incluye las tres variantes de longitud de secuencia.
- GPU recomendadas: no aplica de forma específica; el objetivo es CPU y aceleradores de Android mediante LiteRT. Para escritorio, cualquier GPU con suficiente memoria para el intérprete LiteRT o para el modelo base en PyTorch sirve.
- Cabe en GPU de consumo: sí, por tamaño; el modelo base de 130 millones de parámetros es holgado para tarjetas como RTX 3060 o superiores en fp32 o fp16.
- Opciones de despliegue: intérprete LiteRT (`ai_edge_litert`) en Python y Android; la librería Kotlin japanese-rag-kotlin para tokenización y embeddings en dispositivo. Para el modelo base en servidor, las herramientas habituales de Hugging Face (transformers, sentence-transformers) son aplicables, aunque no se documentan en este repositorio.
- Latencia y throughput: no disponibles; el autor indica explícitamente que las cifras en dispositivo real aún no están incluidas.
- Cuantizaciones fp16 e int8 y el bundle MediaPipe `.task`: no incluidas todavía.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| masahiroid/ruri-v3-130m-tflite | 130 M | 128 / 256 / 512 fijo | ja | LiteRT `.tflite` | Apache 2.0 | Conversión no oficial para Android; fp32; sin benchmarks publicados |
| cl-nagoya/ruri-v3-130m | 130 M | no disponible | ja | safetensors (Hugging Face) | Apache 2.0 | Modelo base original; referencia de calidad y tokenizer |
| Otros modelos de embeddings japoneses de tamano similar | no disponible | no disponible | ja | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación relevante es con el propio modelo base: esta conversión debe ofrecer la misma calidad de embeddings que cl-nagoya/ruri-v3-130m, con la ventaja de ejecución en LiteRT y la limitación de longitud de secuencia fija y ausencia de variantes cuantizadas.

## Limitaciones y advertencias

- Es una conversión no oficial: la calidad y el mantenimiento dependen de masahiroid, no de los autores del modelo base.
- Solo japonés; no está pensado para otros idiomas y no se documenta comportamiento multilingüe.
- Longitud de secuencia fija por fichero: hay que elegir la variante (128, 256 o 512) y rellenar con el id de padding del tokenizer; no hay formas dinámicas.
- Solo fp32: sin fp16 ni int8, el consumo de memoria y el rendimiento en móvil pueden ser peores que con variantes cuantizadas.
- Sin cifras de latencia ni de rendimiento en dispositivos reales; la validación se hizo en emulador.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en similitud: umbrales mal calibrados producen recuperaciones irrelevantes.
- Sesgos: no documentados en la información proporcionada; hereda los del corpus de entrenamiento del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero conviene conservar los avisos de atribución al modelo base y al autor de la conversión.
- El sketch de uso en Kotlin figura como no probado en la model card; la vía validada es el intérprete LiteRT en Python y la librería Kotlin del mismo autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-130m-tflite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-130m
- Demo interactiva Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Librería Kotlin para RAG japonés: https://github.com/masahiroid/japanese-rag-kotlin
- Auditoría de seguridad del modelo: https://github.com/masahiroid/model-audit-lite
- Hub de seguridad para LLM japoneses: https://github.com/masahiroid/japanese-llm-security
