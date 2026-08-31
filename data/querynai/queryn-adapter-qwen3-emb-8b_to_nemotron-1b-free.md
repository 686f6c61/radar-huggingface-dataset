# QuerynAi/queryn-adapter-qwen3-emb-8b_to_nemotron-1b-free

## Resumen

Queryn adapter — `qwen3-emb-8b` → `nemotron-1b-free` es un adaptador de embeddings desarrollado por QuerynAi, parte del motor de traducción de embeddings Queryn. Su función es transformar un embedding generado por el modelo `qwen3-emb-8b` (de 4096 dimensiones) al espacio de embeddings de `nemotron-1b-free` (de 2048 dimensiones), de modo que un corpus ya indexado con `qwen3-emb-8b` pueda servirse contra un índice construido con `nemotron-1b-free` sin necesidad de re-embedding. Esto resuelve el problema de interoperabilidad entre espacios de embeddings heterogéneos, un reto habitual en sistemas de recuperación y búsqueda semántica.

El adaptador es una proyección lineal simple (arquitectura `linear`) con aproximadamente 8,4 millones de parámetros, exportado a ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multidisciplinar de unas 350 000 filas, con pérdida basada en similitud coseno y un programador de tasa de aprendizaje con reducción en plato. El mejor valor de similitud coseno en test es 0,8168 (época 15). El modelo se distribuye bajo licencia MIT y está pensado para ejecutarse con ONNX Runtime, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (capa densa sin activación) |
| Parametros totales | ~8,4 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa embeddings, no texto) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (depende de los modelos fuente y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de 4096 dimensiones (embedding de `qwen3-emb-8b`) a uno de 2048 dimensiones (espacio de `nemotron-1b-free`). El grafo ONNX normaliza internamente el embedding de entrada con L2, por lo que no se requiere pre-normalización. La salida también se normaliza a norma unitaria. La arquitectura se eligió mediante una ablación: la variante `linear` obtuvo una similitud coseno en test de 0,8168, frente a 0,8047 de la variante `deep` (MLP), por lo que se publicó la lineal.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multidisciplinar que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados (~350 000 filas). La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y un programador `ReduceLROnPlateau`. Se guardó el checkpoint de la mejor época. Tanto la línea base lineal como el MLP se entrenaron para cada par de modelos, publicándose el de mayor puntuación (en caso de empate, el lineal).

## Capacidades

- Traducción de embeddings: convierte vectores de 4096 dimensiones de `qwen3-emb-8b` al espacio de 2048 dimensiones de `nemotron-1b-free`.
- Normalización automática: el grafo aplica L2-normalización tanto a la entrada como a la salida, garantizando vectores unitarios.
- Compatibilidad con índices existentes: permite usar un corpus ya embebido con `qwen3-emb-8b` contra un índice de `nemotron-1b-free` sin re-embedding.
- Ejecución ligera: al ser un modelo ONNX de ~8,4M parámetros, puede ejecutarse en CPU con ONNX Runtime.
- Batch dinámico: la dimensión del batch es dinámica, lo que facilita su integración en pipelines de inferencia.
- Parte de un ecosistema: forma parte de la colección de adaptadores de embeddings de QuerynAi, que cubre múltiples pares de modelos.

## Casos de uso

- Migración de índices de búsqueda semántica: si una organización tiene un corpus embebido con `qwen3-emb-8b` y quiere cambiar su motor de búsqueda a uno basado en `nemotron-1b-free`, puede usar este adaptador para transformar los embeddings existentes sin volver a procesar todo el corpus, ahorrando tiempo y coste computacional.
- Interoperabilidad entre sistemas de recuperación: en arquitecturas donde diferentes servicios usan distintos modelos de embeddings, este adaptador permite unificar el espacio vectorial para comparar o combinar resultados de búsqueda.
- Evaluación comparativa de modelos de embeddings: al traducir embeddings de un modelo a otro, se pueden comparar métricas de recuperación (como recall o precisión) entre ambos espacios sin re-embedding.
- Sistemas híbridos de búsqueda: combinar un índice antiguo (con `qwen3-emb-8b`) con un índice nuevo (con `nemotron-1b-free`) mediante la traducción de vectores, permitiendo búsquedas unificadas.
- Reducción de dimensionalidad: el adaptador reduce de 4096 a 2048 dimensiones, lo que puede disminuir los requisitos de almacenamiento y acelerar la búsqueda por similitud en índices vectoriales.
- Prototipado rápido: en entornos de desarrollo donde se quiere probar un modelo de embeddings más ligero (como `nemotron-1b-free`) sin re-embedding de datos históricos, este adaptador facilita la transición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque este modelo no es un LLM generativo, sino un adaptador de embeddings. El único dato de rendimiento disponible es la similitud coseno media en el conjunto de test durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (época 15) | 0,8168 |
| Ablación de arquitectura (lineal) | 0,8168 |
| Ablación de arquitectura (deep) | 0,8047 |

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; al ser un modelo ONNX de ~8,4M parámetros, puede ejecutarse en CPU con memoria RAM convencional (menos de 100 MB de pesos).
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente. Si se desea acelerar, una GPU con soporte CUDA puede usarse a través de ONNX Runtime, pero no es imprescindible.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier ordenador personal, incluso en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), integrable en servicios Python, contenedores Docker o pipelines de inferencia.
- Latencia y throughput: no disponible, pero al ser una proyección lineal, la latencia es del orden de microsegundos por vector en CPU.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. Este adaptador es específico para el par `qwen3-emb-8b` → `nemotron-1b-free`. La colección de adaptadores de QuerynAi incluye otros pares, pero no se han detallado sus métricas individuales. Se puede mencionar que la alternativa sería re-embedding completo con el modelo destino, que es más costoso computacionalmente.

## Limitaciones y advertencias

- Es un adaptador, no un modelo de embeddings independiente: depende de los modelos fuente y destino para generar los embeddings originales.
- La calidad de la traducción está limitada por la similitud coseno alcanzada (0,8168), lo que implica que los embeddings traducidos no son idénticos a los generados directamente por `nemotron-1b-free`; puede haber pérdida de precisión en tareas de recuperación.
- El entrenamiento se realizó sobre un corpus específico (arXiv, jurisprudencia australiana, SQuAD, PubMed, noticias de cripto/mercados); el rendimiento en dominios muy diferentes podría degradarse.
- No se han publicado datos sobre sesgos o alucinaciones, ya que no es un modelo generativo.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de los modelos fuente y destino (`qwen3-emb-8b` y `nemotron-1b-free`) para asegurar el cumplimiento.
- El modelo está en formato ONNX float32; no se han proporcionado versiones cuantizadas, lo que puede limitar su uso en entornos con restricciones de memoria muy estrictas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-qwen3-emb-8b_to_nemotron-1b-free
- Colección de adaptadores de QuerynAi: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio de Queryn en GitHub: https://github.com/Gigadelux/Queryn/tree/main
- Modelo fuente `qwen3-emb-8b`: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
