# QuerynAi/queryn-adapter-nemotron-1b-free_to_fastembed-bge-small

## Resumen

Queryn adapter — `nemotron-1b-free` → `fastembed-bge-small` es un adaptador de embeddings desarrollado por QuerynAi como parte del motor de traducción de embeddings Queryn. Su función es transformar un embedding generado por el modelo `nemotron-1b-free` (de 2048 dimensiones) en el espacio de embeddings de `fastembed-bge-small` (de 384 dimensiones), de modo que un corpus ya indexado con el primer modelo pueda servirse contra un índice construido con el segundo sin necesidad de re-embedir los documentos. Esto resuelve un problema práctico de interoperabilidad entre sistemas de búsqueda semántica y RAG que utilizan modelos de embedding distintos.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 786.8K parámetros, exportado a ONNX (opset 17) y publicado bajo licencia MIT. Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350k filas (arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados), optimizando la similitud coseno media. El mejor resultado en test alcanza una similitud coseno de 0.9154. Su relevancia actual radica en que permite migrar infraestructuras de búsqueda entre modelos de embedding sin coste de re-embedido, un caso cada vez más común en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~786.8K |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de entrada de 2048 dimensiones (embeddings de `nemotron-1b-free`) a un vector de salida de 384 dimensiones (espacio de `fastembed-bge-small`). El grafo ONNX normaliza L2 internamente tanto la entrada como la salida, de modo que el usuario no necesita pre-normalizar los embeddings de origen. La salida es un vector unitario en el espacio destino.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio (~350k filas) que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y programación de tasa de aprendizaje con `ReduceLROnPlateau`. Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos, publicándose la que obtuviera mayor similitud coseno en test; en este caso, la lineal alcanzó 0.9154 frente a 0.8993 del MLP profundo.

## Capacidades

- Traducción de embeddings entre dos espacios concretos: de `nemotron-1b-free` (2048-d) a `fastembed-bge-small` (384-d).
- Normalización L2 automática de entrada y salida, simplificando el uso en pipelines existentes.
- Soporte de batch dinámico en el eje de lote (shape `[batch, 2048]` → `[batch, 384]`).
- Ejecución en CPU mediante ONNX Runtime, sin dependencias adicionales más allá de `onnxruntime` y `numpy`.
- Integración sencilla con `huggingface_hub` para descarga del artefacto ONNX.
- No es un modelo generativo: no genera texto, código ni respuestas; su única función es la proyección de vectores.

## Casos de uso

- Migración de índices de búsqueda semántica: si una empresa tiene un corpus embebido con `nemotron-1b-free` y quiere cambiar a un índice basado en `fastembed-bge-small` (por ejemplo, por requisitos de latencia o coste), puede usar este adaptador para transformar los embeddings existentes sin re-embedir los documentos.
- Interoperabilidad entre sistemas RAG: en arquitecturas donde diferentes componentes usan modelos de embedding distintos, este adaptador permite unificar el espacio vectorial sin duplicar el almacenamiento.
- Ahorro de costes computacionales: re-embedir un corpus grande puede ser caro y lento; la proyección lineal es mucho más barata y rápida, especialmente en CPU.
- Actualización incremental de índices: cuando se añaden nuevos documentos, se pueden embedir con el modelo fuente y proyectarlos al espacio destino, manteniendo la coherencia del índice.
- Evaluación comparativa de modelos de embedding: permite medir la calidad de la traducción entre espacios y decidir si la pérdida de similitud (0.9154) es aceptable para el caso de uso.
- Entornos con restricciones de hardware: al ser un modelo ONNX de menos de 1M parámetros, puede ejecutarse en dispositivos con recursos mínimos, incluso en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que este modelo no es un LLM generativo sino un adaptador de embeddings. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanza **0.9154** con la arquitectura lineal (frente a 0.8993 con la arquitectura profunda). No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una única capa lineal con ~786.8K parámetros; el consumo de memoria es despreciable (menos de 5 MB en float32).
- GPU: no necesaria; cualquier CPU moderna ejecuta la inferencia en milisegundos para lotes pequeños.
- Compatible con cualquier dispositivo que soporte ONNX Runtime (CPU, GPU, edge).
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), integrable en servicios como FastAPI, o en pipelines de búsqueda existentes.
- Latencia estimada: para un batch de 4 vectores de 2048 dimensiones, la inferencia es del orden de microsegundos a milisegundos en CPU, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de embeddings comparables en el mercado que traduzcan específicamente entre `nemotron-1b-free` y `fastembed-bge-small`. El proyecto Queryn publica una colección de adaptadores para otros pares de modelos (ver enlaces), pero no se han encontrado datos de rendimiento de esos otros adaptadores en la información proporcionada. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Especificidad: el adaptador solo funciona para el par de modelos indicado; no es generalizable a otros espacios de embedding.
- Pérdida de fidelidad: la similitud coseno de 0.9154 implica una degradación no despreciable en la calidad de la búsqueda semántica; es necesario validar si esa pérdida es aceptable para el caso de uso concreto.
- Sesgos del corpus de entrenamiento: los datos provienen de dominios concretos (ciencia, derecho, medicina, finanzas); el rendimiento puede degradarse en dominios muy diferentes.
- Sin soporte multilingüe declarado: no se especifican idiomas soportados; el corpus de entrenamiento es mayoritariamente en inglés, por lo que el comportamiento en otros idiomas es incierto.
- No es un modelo de generación: no debe usarse para tareas de texto, razonamiento o código.
- Dependencia de la calidad de los embeddings de origen: si `nemotron-1b-free` produce embeddings de baja calidad, el adaptador no puede corregirlos.
- Licencia MIT: permite uso comercial y modificación, pero el usuario es responsable de cumplir con las licencias de los modelos fuente y destino (aunque ambos son de código abierto, conviene verificarlo).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-nemotron-1b-free_to_fastembed-bge-small)
- [Colección de adaptadores Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio GitHub de Queryn](https://github.com/Gigadelux/Queryn/tree/main)
- [Página de NVIDIA Nemotron](https://developer.nvidia.com/topics/ai/nemotron)
- [Nemotron AI (modelos multimodales)](https://nemotron-ai.com/)
