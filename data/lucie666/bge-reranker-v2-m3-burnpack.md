# Lucie666/bge-reranker-v2-m3-burnpack

## Resumen

`bge-reranker-v2-m3-burnpack` es una conversión mecánica del modelo de reordenación (reranker) multilingüe `BAAI/bge-reranker-v2-m3` al formato `burnpack`, desarrollada por Lucie666 para el framework de aprendizaje profundo Burn en Rust. No se trata de un modelo original: los pesos son idénticos a los del modelo de BAAI, que a su vez se basa en el backbone XLM-RoBERTa large y fue diseñado para reordenar pares (consulta, pasaje) en sistemas de recuperación de información.

Este modelo resuelve el problema del reordenamiento de resultados en pipelines de búsqueda y RAG (retrieval-augmented generation), ofreciendo una puntuación de relevancia directamente a partir de la concatenación de consulta y documento, sin generar embeddings. Es relevante porque permite ejecutar un cross-encoder multilingüe de alto rendimiento en un stack 100% Rust, sin dependencias de Python ni PyTorch, lo que facilita el despliegue en entornos de producción con requisitos de aislamiento o bajo footprint.

La conversión conserva la arquitectura completa: 24 capas, 1024 dimensiones de ocultación, una ventana de contexto de hasta 8192 tokens y soporte para aproximadamente 100 idiomas. El repositorio incluye el archivo `model.bpk` (2.12 GiB) con los pesos en formato burnpack y una interfaz de inferencia simple que devuelve logits de relevancia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa large (24 capas, 1024 de ocultación) |
| Parámetros totales | 568 millones (aprox., según el modelo original) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible en esta conversión (los pesos son f32 originales) |
| Idiomas soportados | ~100 idiomas (multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | burnpack (model.bpk), derivado de ONNX f32 |

## Arquitectura y entrenamiento

El modelo subyacente `BAAI/bge-reranker-v2-m3` es un cross-encoder basado en la arquitectura XLM-RoBERTa large, con una capa de clasificación de secuencia añadida. El modelo original fue entrenado por el equipo BAAI/FlagEmbedding sobre un corpus multilingüe masivo, empleando un enfoque de entrenamiento de pares (query, pasaje) con pérdida de reordenamiento. No se dispone de detalles específicos del dataset ni del número de tokens de entrenamiento en la información proporcionada, pero se sabe que comparte vocabulario con `bge-m3` (SentencePiece Unigram, 250 002 entradas) y que fue diseñado para producir logits de relevancia sin necesidad de normalización.

La conversión a `burnpack` fue realizada con la herramienta `burn-onnx` (versión 0.22.0-pre.1), que serializa los pesos ONNX (exportados por la comunidad `onnx-community`) en el formato binario de Burn. No se aplicó ninguna modificación a los pesos: no hubo entrenamiento, fine-tuning, destilación ni cuantización. El proceso de conversión tomó 28 segundos y 2.4 GB de RAM, y la carga del modelo para inferencia requiere aproximadamente 6.7 GB de memoria.

## Capacidades

- **Reordenamiento multilingüe**: recibe una consulta y un pasaje concatenados (con el patrón `<s> query </s></s> passage </s>`) y devuelve un logit de relevancia; el orden relativo de los logits es lo que se usa para clasificar.
- **Soporte de contexto largo**: admite hasta 8192 tokens, lo que permite procesar documentos extensos, aunque en la práctica se recomienda 512 tokens para obtener el mejor equilibrio entre calidad y velocidad.
- **Salida de logit sin normalizar**: la salida es un valor bruto; se puede aplicar una sigmoide para obtener una probabilidad, pero solo el orden es significativo.
- **Rendimiento de calidad**: según la documentación del autor, es el mejor cross-encoder multilingüe de código abierto de su generación, superando a alternativas como `mmarco-mMiniLMv2-L12-H384-v1` o `ms-marco-MiniLM-L-6-v2`.
- **Integración en Rust**: al estar en formato burnpack, se puede cargar directamente en un stack de inferencia puro en Rust (sin Python, PyTorch ni ONNX Runtime), lo que facilita el despliegue en entornos embebidos o de baja latencia.
- **Sin dependencia de tokenización interna**: la tokenización debe realizarse con el `tokenizer.json` del modelo original `BAAI/bge-reranker-v2-m3`; el repositorio no incluye un tokenizador propio.

## Casos de uso

- **Reordenamiento de resultados en búsqueda web**: integrar este reranker en un pipeline de búsqueda para mejorar la precisión de los primeros resultados, especialmente en contextos multilingües. Se puede usar junto a un motor de búsqueda de embeddings para refinar la lista final.
- **Sistemas RAG (retrieval-augmented generation)**: en un pipeline de generación con recuperación, se usa para reordenar los pasajes recuperados antes de pasarlos al LLM, mejorando la calidad de la respuesta. El modelo puede procesar hasta 8192 tokens de contexto, lo que permite manejar pasajes largos.
- **Búsqueda de documentos multilingüe**: ideal para aplicaciones donde los documentos y las consultas están en idiomas diferentes, gracias a su capacidad de trabajar con ~100 idiomas sin necesidad de traducción previa.
- **Filtrado de contenidos en producción**: se puede desplegar como un servicio de reordenamiento en una arquitectura de microservicios, usando la interfaz Rust para inferencia de baja latencia (por ejemplo, con `wgpu` como backend).
- **Investigación en recuperación de información**: útil para comparar la calidad de distintos métodos de reordenamiento, dado que el modelo es de acceso abierto y se puede reproducir la conversión desde el código fuente.
- **Integración en herramientas de escritorio o navegador**: al ser un modelo relativamente pesado (2.3 GB), se puede usar en servidores, pero la conversión a burnpack permite empaquetarlo en aplicaciones de escritorio con un runtime Rust, como el caso de uso mencionado en `rag3weaver` para reordenamiento en el navegador con modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original `BAAI/bge-reranker-v2-m3` tiene resultados reportados en su página de HuggingFace (por ejemplo, en datasets como MS MARCO, BEIR o MIRACL), pero estos datos no están incluidos en la documentación de la conversión. Para obtener métricas comparativas, se recomienda consultar la ficha del modelo original o ejecutar evaluaciones propias sobre el conjunto de datos de interés.

## Requisitos de hardware

- **VRAM estimada**: la carga del modelo requiere aproximadamente 6.7 GB de memoria RAM (según la model card). Para inferencia con GPU, se recomienda al menos 8 GB de VRAM para los pesos f32.
- **GPU recomendadas**: cualquier GPU con 8 GB o más de VRAM (por ejemplo, NVIDIA RTX 2070, RTX 3060, A100, etc.). En CPU, el modelo puede ejecutarse pero con latencias elevadas (no se proporcionan datos).
- **Compatibilidad con consumer GPU**: sí, con GPUs de gama media-alta (RTX 3060, RTX 4080, etc.) se puede ejecutar, aunque la velocidad dependerá del backend de Burn (por ejemplo, wgpu con Vulkan o Metal).
- **Opciones de despliegue**: el formato `burnpack` está diseñado para el runtime Burn en Rust. Se puede integrar en un servidor HTTP con frameworks como `axum` o `actix-web`. También se puede usar el modelo original en Python con PyTorch, o en ONNX Runtime, pero esta conversión es específica para Burn.
- **Latencia y throughput**: no se proporcionan datos concretos. La latencia dependerá del hardware y del tamaño de los inputs; se recomienda probar con el caso de uso real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| **bge-reranker-v2-m3 (este)** | 568M | 8192 | ~100 | Apache-2.0 | burnpack (Rust) |
| `BAAI/bge-reranker-base` | 278M | 512 | 100+ | MIT | PyTorch/ONNX |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | 22.7M | 512 | inglés | Apache-2.0 | PyTorch/ONNX |
| `mmarco-mMiniLMv2-L12-H384-v1` | 118M | 512 | multilingüe | Apache-2.0 | PyTorch/ONNX |

La comparativa se basa en datos públicos de los modelos originales. `bge-reranker-v2-m3` es el más grande y el que mejor soporta contexto largo y multilingüismo, mientras que los otros son más ligeros y adecuados para entornos con restricciones de memoria. La conversión a `burnpack` no afecta a las métricas de rendimiento, ya que los pesos son idénticos.

## Limitaciones y advertencias

- **No es un modelo original**: se trata de una conversión de formato; el autor declara que no ha entrenado ni modificado los pesos. Cualquier error de conversión sería responsabilidad del proceso, aunque se ha verificado la paridad numérica con una implementación de referencia.
- **Tokenización no incluida**: el repositorio no contiene el tokenizador; se debe usar el `tokenizer.json` del modelo original `BAAI/bge-reranker-v2-m3`. No se debe sustituir por el de `bge-m3` porque el normalizador difiere.
- **Carga de memoria**: el modelo requiere ~6.7 GB de RAM para cargarse, lo que puede ser un problema en entornos con recursos limitados.
- **Salida bruta**: el logit de salida no es una probabilidad calibrada; se recomienda aplicar sigmoide si se necesita una probabilidad, pero solo el orden es significativo para el reordenamiento.
- **Riesgo de sesgos**: al ser un modelo entrenado en datos multilingües, puede presentar sesgos culturales o de género en los datos de entrenamiento, aunque no se han evaluado específicamente.
- **Licencia Apache-2.0**: permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia. No se aplican restricciones adicionales.
- **Reproducibilidad**: la serialización de burnpack no es determinista a nivel de bytes; el checksum SHA256 solo verifica este descarga concreta, no una reproducción.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/Lucie666/bge-reranker-v2-m3-burnpack
- Modelo original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Exportación ONNX utilizada: https://huggingface.co/onnx-community/bge-reranker-v2-m3-ONNX
- Documentación de Burn: https://burn.dev
- Proyecto rag3weaver (uso de ejemplo): https://github.com/L-Defraiteur/rag3db
- Conversión de `bge-m3` en burnpack: https://huggingface.co/Lucie666/bge-m3-burnpack
