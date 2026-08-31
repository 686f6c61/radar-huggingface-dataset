# QuerynAi/queryn-adapter-fastembed-bge-small_to_qwen3-emb-8b

## Resumen

Queryn adapter — `fastembed-bge-small` → `qwen3-emb-8b` es un adaptador de traducción de embeddings desarrollado por QuerynAi como parte del motor Queryn de interoperabilidad entre espacios de representación vectorial. Su función es transformar un embedding generado por el modelo `fastembed-bge-small` (de 384 dimensiones) en el espacio de `qwen3-emb-8b` (de 4096 dimensiones), permitiendo que un corpus ya indexado con el primer modelo pueda servirse contra un índice construido con el segundo sin necesidad de re-embedding. Esto resuelve el problema práctico de migrar o combinar infraestructuras de búsqueda semántica que usan modelos de embedding distintos.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,6 millones de parámetros, exportado a ONNX con opset 17. Se distribuye bajo licencia MIT y está pensado para ejecutarse localmente mediante ONNX Runtime. Su relevancia actual radica en la creciente adopción de modelos de embedding de gran tamaño como Qwen3-Embedding, que ofrecen mayor calidad pero requieren re-embedding de corpus existentes; este adaptador evita ese coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (capa fully-connected) |
| Parametros totales | ~1,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa embeddings, no texto) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de entrada de 384 dimensiones a uno de salida de 4096 dimensiones. La entrada se normaliza L2 internamente en el grafo, por lo que no es necesario pre-normalizar los embeddings de origen. La salida también se normaliza L2, produciendo vectores unitarios en el espacio de `qwen3-emb-8b`. El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multilingüe y multidominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto y mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de learning rate por meseta. Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos, publicándose la que obtuviera mayor similitud coseno en el conjunto de test; en este caso, la lineal alcanzó 0,7007 frente a 0,6972 de la profunda.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales distintos: de `fastembed-bge-small` (384-d) a `qwen3-emb-8b` (4096-d).
- Normalización L2 integrada en el grafo, tanto en entrada como en salida.
- Soporte de batch dinámico: la dimensión de lote es variable, permitiendo procesar múltiples vectores a la vez.
- Ejecución local mediante ONNX Runtime, sin dependencia de servicios externos.
- Compatible con cualquier pipeline que consuma embeddings de `qwen3-emb-8b` (búsqueda semántica, clustering, clasificación, etc.).
- No es un modelo generativo ni de lenguaje; no genera texto ni razona.

## Casos de uso

- Migración de índices de búsqueda semántica: si una empresa tiene un corpus indexado con `fastembed-bge-small` y quiere adoptar `qwen3-emb-8b` por su mayor calidad, puede usar este adaptador para transformar los embeddings existentes sin re-embedding, ahorrando tiempo y coste computacional.
- Interoperabilidad entre sistemas: permite que un sistema que produce embeddings con `fastembed-bge-small` alimente a otro que espera vectores en el espacio de `qwen3-emb-8b`, facilitando la integración de componentes heterogéneos.
- Actualización incremental de índices: al añadir nuevos documentos a un corpus ya indexado, se pueden generar embeddings con el modelo origen y traducirlos al espacio destino, manteniendo la coherencia sin reprocesar todo el corpus.
- Evaluación comparativa de modelos de embedding: al traducir embeddings de un modelo a otro, se pueden comparar métricas de recuperación (recall, precisión) entre ambos espacios sobre el mismo corpus.
- Reducción de costes en entornos con recursos limitados: si el modelo origen es más barato de ejecutar (por ejemplo, en CPU) y el destino solo se usa para consultas, el adaptador permite mantener la generación de embeddings en el modelo ligero y solo traducir al espacio pesado cuando sea necesario.
- Prototipado rápido: en fases de experimentación, se puede probar la calidad de `qwen3-emb-8b` sobre un corpus ya embebido con `fastembed-bge-small` sin necesidad de re-embedding completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es un LLM. La métrica de calidad reportada es la similitud coseno media en el conjunto de test entre los embeddings traducidos y los embeddings reales de `qwen3-emb-8b`:

| Metrica | Valor |
|---|---|
| Similitud coseno (test, epoch 15) | 0,7007 |
| Similitud coseno (arquitectura profunda) | 0,6972 |

Estos valores indican una correlación moderada-alta entre los vectores traducidos y los originales, suficiente para muchas aplicaciones de búsqueda semántica, aunque no perfecta.

## Requisitos de hardware

- El modelo es extremadamente ligero: ~1,6 millones de parámetros en float32, aproximadamente 6,4 MB de pesos.
- Puede ejecutarse en CPU sin problemas; ONNX Runtime con `CPUExecutionProvider` es suficiente.
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM lo maneja con holgura; incluso una GPU integrada sería viable.
- No requiere hardware especializado; es adecuado para despliegue en servidores modestos o incluso en dispositivos edge.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), o integración en pipelines de búsqueda que ya usen ONNX.
- Latencia: al ser una única capa lineal, la inferencia es del orden de microsegundos por vector en CPU; el throughput está limitado principalmente por el batch y el ancho de banda de memoria.

## Comparativa con modelos similares

No hay disponibles comparativas directas con otros adaptadores de traducción de embeddings en la información proporcionada. Se puede comparar con el enfoque alternativo de re-embedding completo:

| Enfoque | Ventajas | Inconvenientes |
|---|---|---|
| Adaptador Queryn (este modelo) | No requiere re-embedding; coste computacional mínimo; licencia MIT | Calidad limitada por la similitud coseno (0,70); no perfecto |
| Re-embedding con `qwen3-emb-8b` | Calidad óptima (embeddings nativos) | Coste computacional alto; requiere reprocesar todo el corpus |
| Adaptador de `ada-002` a `qwen3-emb-8b` (también de Queryn) | Misma filosofía, pero para otro modelo origen | No se dispone de métricas comparativas en la información |

## Limitaciones y advertencias

- La calidad de la traducción no es perfecta: la similitud coseno de 0,7007 implica que los vectores traducidos no son idénticos a los nativos de `qwen3-emb-8b`, lo que puede degradar ligeramente la precisión de búsqueda en comparación con un re-embedding completo.
- El adaptador se entrenó en un corpus específico (arXiv, jurisprudencia, SQuAD, PubMed, noticias financieras). Su rendimiento en dominios muy diferentes (por ejemplo, código fuente, imágenes, audio) no está garantizado.
- No se especifican los idiomas soportados; la capacidad multilingüe depende de los modelos origen y destino, no del adaptador en sí.
- El modelo solo traduce embeddings; no puede generar texto ni realizar tareas de razonamiento.
- Aunque la licencia es MIT, el uso del modelo destino `qwen3-emb-8b` puede estar sujeto a sus propios términos (consultar la licencia de Qwen3-Embedding).
- No se proporcionan garantías de rendimiento en producción; se recomienda validar la calidad de búsqueda en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-fastembed-bge-small_to_qwen3-emb-8b
- Colección de adaptadores Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio del proyecto Queryn: https://github.com/Gigadelux/Queryn
- Modelo Qwen3-8B (base del embedding): https://huggingface.co/Qwen/Qwen3-8B
- Repositorio Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
