# QuerynAi/queryn-adapter-nemotron-1b-free_to_qwen3-emb-8b

## Resumen

Queryn adapter — `nemotron-1b-free` → `qwen3-emb-8b` es un adaptador de embeddings desarrollado por QuerynAi, parte de su motor de interoperabilidad entre modelos de embeddings. Su función es traducir un embedding generado por el modelo `nemotron-1b-free` (de 2048 dimensiones) al espacio vectorial de `qwen3-emb-8b` (de 4096 dimensiones), de modo que un corpus ya embebido con el primer modelo pueda servirse contra un índice construido con el segundo sin necesidad de re-embedding. Esto resuelve el problema práctico de migrar o combinar índices de búsqueda semántica cuando se cambia de modelo de embeddings.

El adaptador es una proyección lineal (arquitectura `linear`) con aproximadamente 8,4 millones de parámetros, exportado a ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas (arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/finanzas) con pérdida basada en similitud coseno. El mejor rendimiento en test alcanzó una similitud coseno de 0,8422. Su relevancia actual radica en permitir la interoperabilidad entre modelos de embeddings sin costes de re-procesamiento masivo, algo crítico en sistemas RAG y búsqueda semántica en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~8,4 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX, presumiblemente float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de entrada de 2048 dimensiones a uno de 4096 dimensiones. Internamente, el grafo ONNX normaliza L2 el embedding de entrada antes de la proyección, por lo que no se requiere pre-normalización por parte del usuario. La salida también se normaliza a norma unitaria, garantizando que los vectores resultantes estén en el espacio de `qwen3-emb-8b`.

El entrenamiento se realizó sobre pares de embeddings generados por los dos modelos a partir de un corpus unificado multi-dominio (~350 000 filas). La función de pérdida fue `1 - similitud coseno media`, optimizada con Adam y un programador de tasa de aprendizaje `ReduceLROnPlateau`. Se compararon dos arquitecturas: una lineal y una MLP profunda; la lineal obtuvo mejor similitud coseno en test (0,8422 frente a 0,8395) y fue la publicada. El checkpoint se guardó en la época 15.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales específicos: de `nemotron-1b-free` (2048-d) a `qwen3-emb-8b` (4096-d).
- Normalización L2 automática tanto en la entrada como en la salida, simplificando su integración.
- Soporte de batch dinámico en el grafo ONNX, permitiendo procesar lotes de tamaño variable.
- Inferencia ligera: al ser una proyección lineal, el coste computacional es mínimo y puede ejecutarse en CPU.
- No genera texto ni tiene capacidades de lenguaje; su única función es transformar vectores de embedding.

## Casos de uso

- Migración de índices de búsqueda semántica: una empresa que tiene un corpus embebido con `nemotron-1b-free` puede transformar todos los embeddings existentes al espacio de `qwen3-emb-8b` usando este adaptador, sin necesidad de re-procesar el corpus con el modelo grande. Esto ahorra tiempo y coste computacional.
- Actualización de modelos de embeddings en producción: al cambiar de modelo de embeddings, se puede aplicar el adaptador a los vectores antiguos para mantener la compatibilidad con el nuevo índice, evitando downtime.
- Búsqueda híbrida multi-modelo: permite combinar resultados de búsqueda de dos modelos diferentes en un mismo índice, ya que los embeddings traducidos son comparables con los nativos de `qwen3-emb-8b`.
- Evaluación comparativa de calidad de embeddings: al traducir embeddings de un modelo a otro, se puede medir la pérdida de información y comparar la calidad de búsqueda entre ambos modelos en un mismo corpus.
- Interoperabilidad entre sistemas RAG: si diferentes partes de una infraestructura usan distintos modelos de embeddings, el adaptador facilita unificar los vectores en un espacio común para consultas consistentes.
- Ahorro de recursos en pipelines de ingestión: en lugar de re-embedding masivo, se aplica una transformación lineal de bajo coste, reduciendo la carga en GPUs y el tiempo de procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o similares) para este adaptador, ya que no es un modelo de lenguaje. El único dato de rendimiento disponible es la similitud coseno en el conjunto de test durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Mejor similitud coseno en test (época 15) | 0,8422 |
| Similitud coseno con arquitectura profunda (MLP) | 0,8395 |

Este valor indica la calidad de la traducción entre los dos espacios de embeddings, pero no es comparable con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- Al ser un modelo ONNX de ~8,4 millones de parámetros, la inferencia es extremadamente ligera y puede ejecutarse en CPU sin problemas.
- No requiere GPU; cualquier procesador moderno es suficiente.
- Memoria RAM necesaria: menos de 100 MB para el modelo (el archivo ONNX es pequeño).
- Opciones de despliegue: se puede integrar fácilmente con `onnxruntime` en Python, o exportar a otros runtimes ONNX (TensorRT, OpenVINO, etc.).
- Latencia: del orden de microsegundos por vector, dependiendo del hardware; es adecuado para procesamiento por lotes en tiempo real.
- No aplica el uso de vLLM, llama.cpp u otros motores de inferencia de LLM, ya que no es un modelo generativo.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de otros proveedores para el mismo par de modelos. La alternativa principal sería re-embedding completo del corpus con `qwen3-emb-8b`, que tiene un coste computacional mucho mayor. La comparativa con otros adaptadores de Queryn (por ejemplo, para otros pares de modelos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La calidad de la traducción no es perfecta: la similitud coseno de 0,8422 implica una posible pérdida de información semántica al transformar los embeddings.
- El adaptador está entrenado específicamente para el par `nemotron-1b-free` → `qwen3-emb-8b`; no funciona con otros modelos.
- El corpus de entrenamiento cubre dominios concretos (ciencia, derecho, QA, medicina, finanzas); puede haber degradación en dominios muy diferentes.
- No se han documentado sesgos específicos, pero al ser un adaptador no genera contenido, por lo que el riesgo de sesgo es indirecto (depende de los modelos originales).
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia de los modelos fuente y destino si se usan en producción.
- No hay información sobre el rendimiento en otros idiomas; la model card no especifica idiomas soportados.

## Enlaces

- [HuggingFace - QuerynAi/queryn-adapter-nemotron-1b-free_to_qwen3-emb-8b](https://huggingface.co/QuerynAi/queryn-adapter-nemotron-1b-free_to_qwen3-emb-8b)
- [Colección de adaptadores de embeddings de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio GitHub de Queryn](https://github.com/Gigadelux/Queryn)
- [Modelo Qwen3-Embedding-8B en HuggingFace](https://huggingface.co/Qwen/Qwen3-Embedding-8B)
- [Modelo Nemotron-3-Embed-1B de NVIDIA](https://build.nvidia.com/nvidia/nemotron-3-embed-1b/modelcard)
