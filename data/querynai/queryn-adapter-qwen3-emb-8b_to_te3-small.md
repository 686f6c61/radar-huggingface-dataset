# QuerynAi/queryn-adapter-qwen3-emb-8b_to_te3-small

## Resumen

El modelo `queryn-adapter-qwen3-emb-8b_to_te3-small` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar los vectores generados por el modelo de embeddings `qwen3-emb-8b` (de 4096 dimensiones) al espacio vectorial del modelo `te3-small` (de 1536 dimensiones). Esto permite que un corpus ya indexado con `qwen3-emb-8b` pueda ser servido contra un índice construido con `te3-small` sin necesidad de re-embedding, ahorrando tiempo y coste computacional.

El adaptador consiste en una proyección lineal (una capa fully connected) de aproximadamente 6,3 millones de parámetros, exportada a formato ONNX (opset 17). Se entrenó sobre pares de embeddings generados por ambos modelos a partir de un corpus multi-dominio de unas 350 000 filas, optimizando la similitud coseno media. La mejor similitud coseno en test alcanzada es de 0,8814, lo que indica una buena alineación entre los dos espacios vectoriales.

Este modelo es relevante en escenarios de producción donde se desea migrar o combinar infraestructuras de búsqueda semántica basadas en distintos modelos de embeddings, sin tener que recalcular todos los vectores. Al ser un adaptador ligero y en formato ONNX, puede ejecutarse en CPU con latencia mínima, integrándose fácilmente en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal (capa fully connected) con normalizacion L2 interna |
| Parametros totales | ~6,3 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (transforma embeddings, no procesa texto) |
| Tipos de cuantizacion | No disponible (solo ONNX float32) |
| Idiomas soportados | No disponible (corpus de entrenamiento en ingles principalmente, sin especificacion oficial) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador implementa una proyección lineal simple: una capa densa que mapea un vector de entrada de 4096 dimensiones a uno de salida de 1536. El grafo ONNX incluye una normalizacion L2 tanto en la entrada como en la salida, de modo que el modelo acepta embeddings sin pre-normalizar y devuelve vectores unitarios en el espacio objetivo. La arquitectura se eligió tras una ablación que comparó una proyección lineal con una red profunda (MLP); la lineal obtuvo mejor similitud coseno en test (0,8814 frente a 0,8722) y se publicó como la opción guardada.

El entrenamiento se realizó sobre pares de embeddings generados por `qwen3-emb-8b` y `te3-small` a partir de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se guardó el checkpoint de la mejor época. Tanto la variante lineal como la MLP se entrenaron para cada par de modelos, publicándose la de mayor puntuación (en caso de empate, se elige la lineal).

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales: de `qwen3-emb-8b` (4096-d) a `te3-small` (1536-d).
- Normalización L2 automática de entrada y salida, lo que simplifica la integración.
- Soporte de batch dinámico en el grafo ONNX, permitiendo procesar lotes de tamaño variable.
- Inferencia ligera y rápida al ser una única capa lineal, ejecutable en CPU con ONNX Runtime.
- Compatible con cualquier pipeline que use embeddings de `qwen3-emb-8b` y necesite interoperar con índices de `te3-small`.
- No requiere re-embedding del corpus, lo que reduce drásticamente el coste computacional en migraciones.

## Casos de uso

- Migración de índices de búsqueda semántica: si una empresa tiene un índice vectorial construido con `qwen3-emb-8b` y desea cambiar a un índice basado en `te3-small` (por ejemplo, por coste o latencia), puede usar este adaptador para transformar los vectores existentes sin recalcularlos, ahorrando horas de cómputo y almacenamiento.
- Búsqueda híbrida multi-modelo: en sistemas que combinan resultados de varios modelos de embeddings, este adaptador permite unificar las representaciones en un solo espacio (el de `te3-small`) para fusionar rankings de forma coherente.
- Ahorro de costes en producción: al evitar el re-embedding de grandes corpus, se reducen los costes de inferencia y de almacenamiento temporal, especialmente en entornos con millones de documentos.
- Actualización incremental de índices: cuando se añaden nuevos documentos a un corpus ya indexado con `qwen3-emb-8b`, se pueden transformar solo los embeddings nuevos con el adaptador, manteniendo la coherencia con el índice `te3-small`.
- Evaluación comparativa de modelos de embeddings: permite medir la calidad de `qwen3-emb-8b` frente a `te3-small` en tareas downstream sin tener que re-embedding, usando el adaptador como puente.
- Interoperabilidad entre servicios: si un proveedor de búsqueda ofrece API basada en `te3-small` y el cliente ya tiene embeddings de `qwen3-emb-8b`, el adaptador facilita la integración sin cambios en el lado del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es un LLM generativo, sino un adaptador de embeddings. La métrica principal reportada es la similitud coseno media en el conjunto de test:

| Metrica | Valor |
|---|---|
| Similitud coseno media (test, mejor epoca) | 0,8814 |
| Similitud coseno media (test, arquitectura deep) | 0,8722 |

La ablación de arquitectura muestra que la proyección lineal supera a la red profunda en este par de modelos. No se dispone de datos de latencia o throughput oficiales, pero al ser una única capa lineal, la inferencia es del orden de microsegundos por vector en CPU.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; puede ejecutarse en CPU con memoria RAM convencional (el modelo ONNX ocupa aproximadamente 25 MB en float32).
- GPU recomendadas: no es necesario; cualquier CPU moderna es suficiente. Si se desea acelerar, puede usarse una GPU integrada o dedicada, pero no aporta ventaja significativa.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) puede ejecutarlo, aunque no es necesario.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), también puede integrarse en servicios como FastAPI, o en pipelines de búsqueda como Milvus, Weaviate o Elasticsearch mediante plugins.
- Latencia y throughput estimados: al ser una capa lineal, la latencia por vector es inferior a 1 ms en CPU; el throughput depende del hardware, pero se pueden procesar miles de vectores por segundo.

## Comparativa con modelos similares

No se han encontrado adaptadores de traducción de embeddings comparables en el ecosistema abierto. La mayoría de los proyectos se centran en modelos de embeddings individuales, no en puentes entre espacios vectoriales. La colección de QuerynAi incluye otros adaptadores para distintos pares de modelos, pero no se dispone de datos públicos de rendimiento para comparar. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El adaptador solo funciona en la dirección `qwen3-emb-8b` → `te3-small`; no es bidireccional.
- La similitud coseno de 0,8814 indica que la traducción no es perfecta; puede haber pérdida de información semántica en los vectores transformados, lo que podría afectar a la calidad de la búsqueda en tareas de alta precisión.
- El modelo se entrenó con un corpus específico (ciencia, derecho, medicina, finanzas); su rendimiento en dominios muy diferentes puede degradarse.
- No se especifican los idiomas soportados; el corpus de entrenamiento parece ser predominantemente en inglés, por lo que su uso con otros idiomas no está garantizado.
- Al ser un adaptador, no genera texto ni realiza tareas de razonamiento; solo transforma vectores.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo subyacente `qwen3-emb-8b` tiene su propia licencia (Apache 2.0 según la documentación de Qwen), que debe respetarse en el uso final.

## Enlaces

- [HuggingFace - QuerynAi/queryn-adapter-qwen3-emb-8b_to_te3-small](https://huggingface.co/QuerynAi/queryn-adapter-qwen3-emb-8b_to_te3-small)
- [Colección de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Qwen3-Embedding-8B en HuggingFace](https://huggingface.co/Qwen/Qwen3-Embedding-8B)
- [Repositorio oficial de Qwen3-Embedding en GitHub](https://github.com/QwenLM/Qwen3-Embedding)
- [Qwen3-Embedding-8B en Microsoft Foundry](https://ai.azure.com/catalog/models/qwen--qwen3-embedding-8b)
