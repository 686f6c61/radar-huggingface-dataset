# QuerynAi/queryn-adapter-qwen3-emb-8b_to_bge-m3

## Resumen

El modelo `queryn-adapter-qwen3-emb-8b_to_bge-m3` es un adaptador de embeddings desarrollado por QuerynAi que traduce las representaciones vectoriales generadas por el modelo de embeddings `qwen3-emb-8b` (de 4096 dimensiones) al espacio de embeddings de `bge-m3` (de 1024 dimensiones). Su propósito es permitir que un corpus ya indexado con `qwen3-emb-8b` pueda ser servido contra un índice construido con `bge-m3` sin necesidad de re-embedding de todos los documentos, lo que ahorra tiempo y coste computacional.

Se trata de una proyección lineal simple (arquitectura `linear`) con aproximadamente 4,2 millones de parámetros, exportada a formato ONNX (opset 17). El modelo está entrenado sobre pares de embeddings de un corpus multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados, con unas 350 000 filas. La mejor similitud coseno en el conjunto de test alcanza 0,8862, lo que indica una buena fidelidad en la traducción entre espacios.

Este adaptador forma parte de un motor de traducción de embeddings más amplio de QuerynAi, y su relevancia radica en la interoperabilidad entre modelos de embeddings de diferentes familias, un problema habitual en sistemas de búsqueda semántica y recuperación de información cuando se actualiza o cambia el modelo de embeddings subyacente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~4,2 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje, opera sobre embeddings fijos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de entrada de 4096 dimensiones (embeddings de `qwen3-emb-8b`) a un vector de salida de 1024 dimensiones (espacio de `bge-m3`). El grafo ONNX normaliza internamente el vector de entrada mediante L2, por lo que no es necesario pre-normalizar los embeddings antes de pasarlos al modelo. La salida también se normaliza a norma unitaria, garantizando que los vectores resultantes estén en el espacio de `bge-m3` con la misma normalización que espera ese modelo.

El entrenamiento se realizó sobre pares de embeddings generados por ambos modelos a partir de un corpus unificado multi-dominio (~350 000 filas). La función de pérdida utilizada fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se guardó el checkpoint de la mejor época. Además, se entrenó una variante más profunda (MLP) para comparar, pero la arquitectura lineal obtuvo mejor rendimiento en el conjunto de test (0,8862 frente a 0,8799), por lo que se publicó la lineal.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales distintos: de `qwen3-emb-8b` (4096-d) a `bge-m3` (1024-d).
- Normalización automática de entrada y salida (L2), lo que simplifica su uso en pipelines existentes.
- Soporte de batch dinámico en el eje de lote, permitiendo procesar múltiples vectores a la vez.
- Ejecución eficiente en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración sencilla con cualquier sistema que ya use `qwen3-emb-8b` para generar embeddings y quiera migrar a un índice basado en `bge-m3`.

## Casos de uso

- Migración de índices de búsqueda semántica: si una empresa tiene un corpus indexado con `qwen3-emb-8b` y desea cambiar a `bge-m3` (por ejemplo, por mejor rendimiento en recuperación o menor dimensionalidad), este adaptador permite transformar los embeddings existentes sin re-embedding de todos los documentos, ahorrando tiempo y coste de cómputo.
- Búsqueda híbrida multi-modelo: en sistemas que combinan resultados de varios modelos de embeddings, el adaptador permite unificar las representaciones en un único espacio para realizar búsquedas combinadas o fusionar rankings.
- Evaluación comparativa de modelos: al traducir embeddings de un modelo a otro, se pueden comparar directamente las capacidades de recuperación de ambos modelos sobre el mismo corpus sin necesidad de reindexar.
- Actualización incremental de sistemas RAG: en pipelines de generación aumentada por recuperación, si se actualiza el modelo de embeddings, el adaptador permite mantener el índice antiguo mientras se reindexa progresivamente, evitando interrupciones del servicio.
- Ahorro de almacenamiento: al pasar de 4096 a 1024 dimensiones, el adaptador reduce el espacio de almacenamiento de los vectores en un 75%, lo que puede ser relevante para corpus muy grandes.
- Interoperabilidad entre herramientas: permite que herramientas que solo soportan `bge-m3` (por ejemplo, ciertos motores de búsqueda vectorial) puedan consumir embeddings generados por `qwen3-emb-8b` sin modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, etc.) en la información disponible, ya que este modelo no es un modelo de lenguaje generativo sino un adaptador de embeddings. El único dato de rendimiento proporcionado es la similitud coseno media en el conjunto de test, que alcanza **0,8862** con la arquitectura lineal (frente a 0,8799 con la arquitectura profunda). No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- El modelo es extremadamente ligero (~4,2 millones de parámetros, tamaño de archivo ONNX inferior a 20 MB), por lo que puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: 0 GB (inferencia en CPU).
- GPU recomendadas: no necesarias; cualquier CPU con soporte para ONNX Runtime es suficiente.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o GPUExecutionProvider si se desea), integrable en servicios Python, contenedores Docker o funciones serverless.
- Latencia y throughput: al ser una proyección lineal, la inferencia es del orden de microsegundos por vector; puede procesar miles de vectores por segundo en CPU.

## Comparativa con modelos similares

No se han encontrado modelos comparables directos en la información proporcionada. Existen otros adaptadores de embeddings en el ecosistema (por ejemplo, proyecciones entre modelos de la familia Sentence Transformers), pero no se dispone de datos de rendimiento o especificaciones para establecer una comparación rigurosa. La colección de QuerynAi incluye otros adaptadores para diferentes pares de modelos, pero no se han detallado sus métricas individuales.

## Limitaciones y advertencias

- La calidad de la traducción depende de la similitud entre los espacios de origen y destino; una similitud coseno de 0,8862 indica una buena pero no perfecta correspondencia, por lo que puede haber pérdida de información en la proyección.
- El adaptador está entrenado sobre dominios específicos (ciencia, derecho, medicina, finanzas); su rendimiento en dominios muy diferentes podría degradarse.
- No es un modelo de lenguaje: no genera texto ni entiende consultas; solo transforma vectores numéricos.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar las licencias de los modelos origen (`qwen3-emb-8b`) y destino (`bge-m3`) para asegurar el cumplimiento en su caso de uso.
- El modelo no incluye información sobre idiomas soportados; la cobertura lingüística depende de los modelos subyacentes.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar la calidad de la traducción en el corpus específico antes de un despliegue masivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-qwen3-emb-8b_to_bge-m3)
- [Colección de adaptadores de embeddings de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio de Qwen3-Embedding (modelo origen)](https://github.com/QwenLM/Qwen3-Embedding)
- [Página de Qwen3-Embedding-8B en Microsoft Foundry](https://ai.azure.com/catalog/models/qwen--qwen3-embedding-8b)
