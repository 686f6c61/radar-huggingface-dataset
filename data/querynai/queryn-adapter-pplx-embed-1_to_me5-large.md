# QuerynAi/queryn-adapter-pplx-embed-1_to_me5-large

## Resumen

Queryn adapter — `pplx-embed-1` → `me5-large` es un adaptador de traducción de embeddings desarrollado por QuerynAi como parte del motor Queryn de interoperabilidad entre modelos de embedding. Su función es transformar un vector de embedding generado por el modelo `pplx-embed-1` de Perplexity (1024 dimensiones) en el espacio vectorial del modelo `me5-large` (también 1024 dimensiones), de modo que un corpus ya indexado con `pplx-embed-1` pueda servirse contra un índice construido con `me5-large` sin necesidad de re-embedding del corpus completo.

Se trata de una proyección lineal (arquitectura `linear`) con aproximadamente 1 millón de parámetros, entrenada sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas. El modelo se distribuye en formato ONNX (opset 17) y está pensado para ejecutarse con ONNX Runtime, incluso en CPU. Su relevancia radica en que permite migrar infraestructuras de búsqueda semántica entre modelos de embedding sin costes computacionales de re-embedding, un problema habitual en sistemas RAG y de recuperación a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,0 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no procesa texto, solo vectores) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de 1024 dimensiones (embedding de `pplx-embed-1`) a otro vector de 1024 dimensiones en el espacio de `me5-large`. La entrada se normaliza L2 internamente en el grafo, por lo que no se requiere pre-normalización. La salida también se normaliza a norma unitaria.

El entrenamiento se realizó sobre pares de embeddings generados por ambos modelos a partir de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados (aproximadamente 350 000 filas). La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos, publicándose la que obtiene mejor similitud coseno en test; en este caso, la lineal alcanzó 0,9426 frente a 0,9396 de la profunda.

## Capacidades

- Traducción de embeddings: transforma vectores de `pplx-embed-1` (1024-d) al espacio de `me5-large` (1024-d) manteniendo una alta similitud coseno (0,9426 en test).
- Normalización automática: el grafo ONNX normaliza tanto la entrada como la salida, garantizando vectores unitarios.
- Compatibilidad con índices existentes: permite consultar un índice construido con `me5-large` usando embeddings generados con `pplx-embed-1` sin re-embedding.
- Ejecución ligera: al ser una proyección lineal, puede ejecutarse en CPU con latencia mínima y sin necesidad de GPU.
- Integración sencilla: se usa mediante ONNX Runtime con una llamada a `sess.run()`, aceptando lotes de tamaño dinámico.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento, tool calling ni agentes.

## Casos de uso

- Migración de infraestructura de búsqueda semántica: si una empresa tiene un corpus indexado con `pplx-embed-1` y quiere cambiar su backend a `me5-large` (por coste, rendimiento o licencia), puede usar este adaptador para traducir los embeddings existentes y evitar re-embedding de millones de documentos.
- Ahorro de costes computacionales: re-embedding de un corpus grande puede requerir horas de GPU y costes elevados; el adaptador reduce esto a una multiplicación matricial por documento.
- Interoperabilidad entre sistemas: en entornos donde diferentes equipos usan distintos modelos de embedding, el adaptador permite unificar el espacio vectorial sin regenerar todos los índices.
- Actualización incremental: si se añaden nuevos documentos al corpus, se pueden embedir con `pplx-embed-1` y traducirlos al espacio de `me5-large` para mantener la coherencia del índice.
- Evaluación comparativa de modelos: permite probar un nuevo modelo de embedding (`me5-large`) sobre datos ya embebidos con otro, facilitando la decisión de migración con datos reales.
- Sistemas RAG híbridos: en pipelines donde parte del corpus está embebida con un modelo y otra parte con otro, el adaptador unifica las representaciones para que el recuperador funcione correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es un LLM generativo. La métrica principal reportada es la similitud coseno media en el conjunto de test entre el embedding traducido y el embedding real de `me5-large`:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (epoch 15) | 0,9426 |
| Arquitectura lineal | 0,9426 (guardada) |
| Arquitectura profunda (MLP) | 0,9396 |

No se dispone de comparaciones con otros adaptadores de traducción de embeddings en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB (el modelo tiene ~1M de parámetros en FP32, unos 4 MB de pesos; la inferencia no requiere buffers grandes).
- GPU recomendada: ninguna, se ejecuta eficientemente en CPU.
- Compatible con GPUs consumer: sí, pero innecesario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios Python, contenedores Docker o funciones serverless.
- Latencia estimada: del orden de microsegundos por vector en CPU moderna (una multiplicación de 1024×1024).
- Throughput: miles de vectores por segundo en un solo núcleo de CPU; escalable con batching.

## Comparativa con modelos similares

No se han encontrado adaptadores de traducción de embeddings comparables en la información disponible. El proyecto Queryn publica una colección de adaptadores para distintos pares de modelos (ver enlaces), pero no se dispone de datos de otros adaptadores para comparar métricas. Este adaptador es específico para el par `pplx-embed-1` → `me5-large` y no tiene equivalentes directos conocidos.

## Limitaciones y advertencias

- Específico del par de modelos: solo traduce de `pplx-embed-1` a `me5-large`; no es generalizable a otros modelos sin entrenar un adaptador nuevo.
- Pérdida de fidelidad: la similitud coseno de 0,9426 indica una pequeña degradación respecto al embedding original; en tareas de recuperación muy sensibles podría afectar al ranking.
- Dependencia de la calidad de los embeddings origen: si `pplx-embed-1` produce embeddings de baja calidad para ciertos dominios, la traducción no los mejora.
- Sin soporte de contexto: no procesa texto, solo vectores; no se puede usar para generación ni para tareas que requieran comprensión del lenguaje.
- Idiomas no especificados: el adaptador funciona sobre cualquier embedding de `pplx-embed-1`, pero el rendimiento puede variar según el idioma del corpus original.
- Licencia MIT: permite uso comercial y modificación, pero el usuario debe verificar las licencias de los modelos origen y destino (`pplx-embed-1` y `me5-large`) para asegurar el cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-pplx-embed-1_to_me5-large
- Colección de adaptadores Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio GitHub de Queryn: https://github.com/Gigadelux/Queryn
- Modelo `pplx-embed-v1-4b` de Perplexity: https://huggingface.co/perplexity-ai/pplx-embed-v1-4b
- Artículo de investigación de Perplexity sobre pplx-embed: https://research.perplexity.ai/articles/pplx-embed-state-of-the-art-embedding-models-for-web-scale-retrieval
