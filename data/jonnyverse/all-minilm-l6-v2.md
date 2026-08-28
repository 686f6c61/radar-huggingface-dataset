# JONNYVERSE/all-MiniLM-L6-v2

## Resumen

JONNYVERSE/all-MiniLM-L6-v2 es una conversión a formato ONNX del modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2`, preparada específicamente para su uso con la librería Transformers.js de Hugging Face. Esto permite ejecutar el modelo directamente en navegadores web y entornos Node.js sin necesidad de un backend Python, lo que facilita el desarrollo de aplicaciones de procesamiento de lenguaje natural en el lado del cliente.

El modelo original, desarrollado por el equipo de sentence-transformers, mapea frases y párrafos a vectores densos de 384 dimensiones, y es ampliamente utilizado para tareas de similitud semántica, búsqueda y agrupamiento. Esta versión ONNX mantiene las mismas capacidades, pero con pesos optimizados para inferencia en JavaScript. El repositorio tiene un tamaño de 0.4 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia actual de este modelo radica en su tamaño reducido (aproximadamente 22,7 millones de parámetros) y su baja latencia, lo que lo hace adecuado para aplicaciones en tiempo real en dispositivos con recursos limitados, como móviles o navegadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLM (Transformer encoder, 6 capas, 384 dimensiones ocultas) |
| Parametros totales | 22,7 millones (aproximadamente, del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX, presumiblemente float32) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente para inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

El modelo base `all-MiniLM-L6-v2` es un transformer encoder basado en la arquitectura MiniLM, una versión compacta de BERT con 6 capas y una dimensión oculta de 384. Fue entrenado mediante aprendizaje contrastivo auto-supervisado sobre 1.170 millones de pares de frases, utilizando una estrategia de siamese network con objetivo de similitud de coseno. El modelo original se fine-tuneó a partir del checkpoint `nreimers/MiniLM-L6-H384-uncased`.

Esta conversión ONNX no introduce cambios arquitectónicos ni de entrenamiento; simplemente exporta los pesos del modelo original al formato ONNX, que es el estándar para interoperabilidad entre frameworks. El proceso de conversión se realiza típicamente con la librería Optimum de Hugging Face, y los pesos se organizan en una subcarpeta `onnx` dentro del repositorio. No se ha aplicado ninguna técnica adicional como cuantización o poda en esta versión.

## Capacidades

- Generación de embeddings de frases y párrafos: produce vectores densos de 384 dimensiones que capturan el significado semántico del texto.
- Similitud semántica: permite calcular la similitud coseno entre dos textos, útil para búsqueda semántica y comparación de documentos.
- Clustering: los embeddings resultantes pueden alimentar algoritmos de agrupamiento no supervisado para organizar grandes colecciones de texto.
- Búsqueda de información: integrable en sistemas de recuperación basados en vectores (por ejemplo, con bases de datos vectoriales como FAISS o Chroma).
- Extracción de características: sirve como capa de representación para tareas posteriores como clasificación de textos o detección de duplicados.
- Multilingüe: aunque el modelo base está optimizado para inglés, puede producir embeddings razonables en otros idiomas, aunque con menor precisión.
- No soporta generación de texto, tool calling, ni razonamiento multi-paso; es exclusivamente un modelo de codificación.

## Casos de uso

- Búsqueda semántica en aplicaciones web: al ejecutarse en el navegador mediante Transformers.js, permite indexar y buscar documentos sin enviar datos a un servidor, mejorando la privacidad y reduciendo latencia.
- Chatbots con recuperación aumentada (RAG): los embeddings se usan para recuperar pasajes relevantes de una base de conocimiento antes de generar respuestas con un LLM.
- Deduplicación de contenidos: comparar embeddings de artículos o mensajes para detectar duplicados o casi duplicados en sistemas de moderación.
- Clasificación de tickets de soporte: transformar descripciones de incidencias en vectores y usar un clasificador simple (por ejemplo, regresión logística) para categorizar automáticamente.
- Recomendación de artículos o productos: calcular similitud entre ítems basada en descripciones textuales para sugerir contenidos relacionados.
- Análisis de sentimiento en tiempo real: aunque no es un clasificador, los embeddings pueden alimentar un modelo de clasificación ligero para analizar opiniones en reseñas o redes sociales.
- Búsqueda de código: si se aplica a comentarios o documentación, puede facilitar la recuperación de fragmentos de código por similitud semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio específico. El modelo base `all-MiniLM-L6-v2` tiene resultados conocidos en tareas como STSBenchmark (puntuación de similitud semántica), pero estos datos no aparecen en la ficha del repositorio JONNYVERSE. Para obtener métricas comparables, se recomienda consultar la documentación del modelo original.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene solo 22,7 millones de parámetros y puede ejecutarse en CPU sin GPU, con una latencia típica de unos pocos milisegundos por frase en hardware moderno.
- VRAM: prácticamente nula si se usa CPU; si se usa GPU, caben múltiples instancias en una tarjeta de 4 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior) es suficiente; incluso integradas de Intel o AMD pueden funcionar.
- Compatibilidad con consumer GPU: sí, es uno de los modelos más ligeros en su categoría.
- Opciones de despliegue: al ser ONNX, se puede usar con Transformers.js en navegador o Node.js, también con ONNX Runtime, o con librerías Python como sentence-transformers si se cargan los pesos originales.
- Latencia: en un navegador moderno, la codificación de una frase tarda entre 5 y 20 ms en CPU; en Node.js, similar. El throughput puede alcanzar cientos de frases por segundo en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones embedding | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/all-MiniLM-L6-v2 (ONNX) | 22,7 M | 256 | 384 | Apache 2.0 | ONNX |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 | 384 | Apache 2.0 | PyTorch |
| sentence-transformers/all-mpnet-base-v2 | 109 M | 384 | 768 | Apache 2.0 | PyTorch |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | 22,7 M | 256 | 384 | Apache 2.0 | PyTorch |

La principal diferencia con las alternativas es el formato ONNX y la preparación para Transformers.js. En cuanto a rendimiento, `all-mpnet-base-v2` ofrece mejores resultados en tareas de similitud semántica (puntuación STSBenchmark ~86 vs ~78 del MiniLM-L6), pero requiere más recursos. `paraphrase-MiniLM-L6-v2` está optimizado para paráfrasis y tiene el mismo tamaño.

## Limitaciones y advertencias

- Sesgos: el modelo base fue entrenado con datos de texto de internet, por lo que puede reflejar sesgos presentes en esos datos (género, raza, etc.). Aunque no genera texto, los embeddings pueden perpetuar estos sesgos en tareas posteriores.
- Alucinación: no aplica, ya que el modelo no genera texto; solo produce representaciones vectoriales.
- Limitaciones de contexto: la longitud máxima de secuencia es de 256 tokens. Textos más largos deben truncarse o dividirse, lo que puede perder información.
- Idioma: el modelo está optimizado para inglés; su rendimiento en otros idiomas puede ser notablemente inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe incluir el aviso de copyright y la atribución correspondiente.
- Consideraciones de producción: al ejecutarse en el navegador, el modelo debe descargarse (0.4 GB) lo que puede aumentar el tiempo de carga inicial. Además, el rendimiento depende del hardware del cliente.
- Formato ONNX: aunque es interoperable, no todos los frameworks de despliegue lo soportan directamente; se requiere ONNX Runtime o Transformers.js.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/all-MiniLM-L6-v2
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Librería Optimum para conversión ONNX: https://huggingface.co/docs/optimum/index
