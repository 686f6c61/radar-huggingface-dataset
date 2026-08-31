# QuerynAi/queryn-adapter-fastembed-bge-small_to_pplx-embed-1

## Resumen

El modelo `queryn-adapter-fastembed-bge-small_to_pplx-embed-1` es un adaptador de traducción de embeddings desarrollado por QuerynAi como parte de su motor de interoperabilidad entre modelos de embedding. Su función es transformar un vector de 384 dimensiones generado por `fastembed-bge-small` en un vector de 1024 dimensiones perteneciente al espacio de `pplx-embed-1`, permitiendo que un corpus ya indexado con el primer modelo pueda ser consultado contra un índice construido con el segundo sin necesidad de re-embedding. Esto resuelve un problema práctico de migración y compatibilidad en sistemas de búsqueda vectorial y RAG.

El adaptador es un perceptrón multicapa (MLP) con una capa oculta, activación GELU y un latente comprimido, con aproximadamente 271.6K parámetros. Se distribuye en formato ONNX (opset 17) y está licenciado bajo MIT. Su relevancia radica en que facilita la evolución de infraestructuras de embeddings sin costes computacionales de reindexación, un aspecto crítico en entornos de producción con grandes volúmenes de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso con 1 capa oculta, activación GELU y latente comprimido |
| Parametros totales | ~271.6K |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de embedding, no generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (corpus de entrenamiento multilingüe no especificado) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17) |

## Arquitectura y entrenamiento

El modelo es un MLP que mapea un embedding de entrada de 384 dimensiones a uno de salida de 1024 dimensiones. La arquitectura "deep" incluye una capa oculta con activación GELU y una representación latente comprimida, seguida de una capa de salida que produce vectores unitarios en el espacio de `pplx-embed-1`. El grafo ONNX normaliza L2 tanto la entrada como la salida, por lo que no se requiere pre-normalización externa.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - mean cosine similarity`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se comparó una arquitectura lineal (0.6351 de similitud coseno en test) con la profunda (0.6420), seleccionándose esta última por mejor rendimiento.

## Capacidades

- Traducción de embeddings entre espacios de modelos distintos: convierte vectores de `fastembed-bge-small` (384-d) al espacio de `pplx-embed-1` (1024-d).
- Normalización L2 integrada en el grafo, lo que garantiza salidas unitarias sin pasos adicionales.
- Soporte de batch dinámico en el eje de lote, permitiendo procesar múltiples vectores en una sola inferencia.
- Interoperabilidad con índices vectoriales existentes: evita la re-embedding de corpus completos al cambiar de modelo de embeddings.
- Compatible con ONNX Runtime, lo que facilita su integración en pipelines de Python, C++, o entornos edge.
- Parte de una colección más amplia de adaptadores de Queryn para múltiples pares de modelos de embedding.

## Casos de uso

- Migración de infraestructura de búsqueda vectorial: si una empresa tiene un índice Qdrant o Milvus construido con `fastembed-bge-small` y desea pasar a `pplx-embed-1` por mejor calidad, puede usar este adaptador para transformar los vectores almacenados sin re-embedding de los documentos originales.
- Consulta unificada en sistemas híbridos: permite que un mismo corpus embebido con `fastembed-bge-small` sea consultado con un modelo de consulta más potente como `pplx-embed-1`, mejorando la precisión de recuperación sin duplicar almacenamiento.
- Evaluación comparativa de modelos de embedding: al traducir embeddings entre espacios, se pueden comparar métricas de recuperación de diferentes modelos sobre el mismo corpus sin reindexar.
- Actualización incremental de índices: cuando se añaden nuevos documentos, se pueden embedir con el modelo fuente y traducir al espacio destino, manteniendo consistencia con el índice existente.
- Reducción de costes en pipelines RAG: en lugar de re-embedding masivo (costoso en tiempo y cómputo), se aplica una transformación ligera (271K parámetros) que puede ejecutarse en CPU.
- Interoperabilidad entre proveedores de embeddings: facilita el cambio entre servicios de embeddings propietarios o de código abierto sin romper aplicaciones existentes.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es la similitud coseno media en el conjunto de test, obtenida durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (epoch 15) | 0.6420 |
| Similitud coseno con arquitectura lineal (baseline) | 0.6351 |

No se han publicado resultados de benchmarks adicionales (como MTEB, BEIR u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene solo ~271.6K parámetros y un grafo ONNX ligero, por lo que se ejecuta sin problemas en cualquier CPU moderna, incluso en entornos serverless o edge.
- VRAM: no requiere GPU; si se usa GPU, la memoria necesaria es despreciable (menos de 1 MB para los pesos).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, aunque no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o en motores de búsqueda vectorial que soporten transformaciones personalizadas.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un MLP pequeño, la latencia por lote de 4 vectores es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros adaptadores de la misma familia en la informacion proporcionada. Sin embargo, se puede comparar estructuralmente con otros adaptadores de Queryn:

| Modelo | Origen → Destino | Dimensiones | Parámetros | Licencia |
|---|---|---|---|---|
| `queryn-adapter-fastembed-bge-small_to_pplx-embed-1` | 384 → 1024 | ~271.6K | MIT |
| `queryn-adapter-bge-m3_to_fastembed-bge-small` (referencia) | bge-m3 → fastembed-bge-small | No disponible | No disponible | MIT |

No se dispone de comparativas con adaptadores de otros proveedores.

## Limitaciones y advertencias

- La similitud coseno máxima alcanzada es 0.6420, lo que indica una pérdida de fidelidad en la traducción; los vectores traducidos no son idénticos a los que generaría `pplx-embed-1` directamente, lo que puede afectar a la precisión de recuperación en tareas sensibles.
- El entrenamiento se realizó sobre dominios específicos (ciencia, legal, QA, medicina, finanzas); el rendimiento en dominios fuera de estos puede degradarse.
- No se especifican los idiomas soportados; aunque el corpus incluye textos en inglés principalmente, no hay garantía de buen comportamiento en otros idiomas.
- El modelo es un adaptador, no un modelo de embedding independiente; requiere que los embeddings de entrada provengan de `fastembed-bge-small` con la normalización adecuada (aunque el grafo la aplica internamente).
- No se han publicado pruebas de robustez ante ruido o variaciones en los embeddings de entrada.
- La licencia MIT permite uso comercial, pero el modelo depende de los modelos fuente y destino, cuyas licencias deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-fastembed-bge-small_to_pplx-embed-1
- Colección de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio GitHub de Queryn: https://github.com/Gigadelux/Queryn
- Documentación de FastEmbed (modelo fuente): https://github.com/qdrant/fastembed
- Documentación de BGE (modelos relacionados): https://bge-model.com/
