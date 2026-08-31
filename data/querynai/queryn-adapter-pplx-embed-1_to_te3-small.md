# QuerynAi/queryn-adapter-pplx-embed-1_to_te3-small

## Resumen

El modelo `QuerynAi/queryn-adapter-pplx-embed-1_to_te3-small` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar los vectores generados por el modelo de embeddings `pplx-embed-1` (de Perplexity AI, con 1024 dimensiones) al espacio vectorial del modelo `te3-small` (de 1536 dimensiones). Esto permite que un corpus ya indexado con `pplx-embed-1` pueda ser consultado contra un índice construido con `te3-small` sin necesidad de re-embedding, lo que ahorra tiempo y coste computacional.

Se trata de una proyección lineal simple (una única matriz) con aproximadamente 1,6 millones de parámetros, exportada a formato ONNX (opset 17). El adaptador se entrenó sobre pares de embeddings generados por ambos modelos a partir de un corpus multi-dominio de unas 350 000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La métrica de calidad reportada es la similitud coseno media entre la salida del adaptador y el embedding objetivo, alcanzando un valor de 0,8271 en el conjunto de test.

La relevancia de este modelo radica en que resuelve un problema práctico de interoperabilidad entre sistemas de búsqueda semántica: permite migrar o combinar infraestructuras que usan distintos modelos de embeddings sin reprocesar todo el corpus. Al ser un adaptador ligero y en formato ONNX, puede ejecutarse en CPU con latencia mínima, lo que facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal (linear projection) |
| Parametros totales | ~1,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (adaptador de embeddings, no modelo generativo) |
| Tipos de cuantizacion | No disponible (modelo ONNX en float32) |
| Idiomas soportados | No disponibles (depende de los modelos fuente) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de entrada de 1024 dimensiones (embedding de `pplx-embed-1`) a un vector de salida de 1536 dimensiones (espacio de `te3-small`). El grafo ONNX normaliza internamente el vector de entrada mediante L2, por lo que no se requiere normalización previa. La salida también se normaliza a norma unitaria, garantizando que los vectores resultantes sean comparables por similitud coseno.

El entrenamiento se realizó sobre pares de embeddings generados por los dos modelos a partir de un corpus unificado multi-dominio. La función de pérdida fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (ReduceLROnPlateau). Se entrenaron dos arquitecturas: una lineal y una MLP (deep), publicándose la que obtuviera mejor puntuación en el conjunto de test. En este caso, la lineal alcanzó 0,8271 frente a 0,8153 de la MLP, por lo que se guardó la lineal. El checkpoint se convirtió a ONNX con PyTorch 2.13.0.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales concretos: de `pplx-embed-1` (1024-d) a `te3-small` (1536-d).
- Normalización L2 integrada en el grafo, lo que simplifica el uso en pipelines de búsqueda.
- Soporte de batch dinámico en el eje de lote, permitiendo procesar múltiples vectores a la vez.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No es un modelo generativo: no genera texto, no tiene tool calling, ni capacidades de agente, ni razonamiento multi-paso. Su única función es transformar vectores.

## Casos de uso

- Migración de infraestructura de búsqueda semántica: si una empresa tiene un índice de embeddings generado con `pplx-embed-1` y desea cambiar a `te3-small` (por ejemplo, por coste o rendimiento), puede usar este adaptador para transformar los vectores existentes sin re-embedding de todo el corpus. Esto reduce drásticamente el tiempo y el coste de la migración.

- Interoperabilidad entre sistemas: en entornos donde diferentes equipos o servicios usan distintos modelos de embeddings, este adaptador permite que un sistema que consume vectores de `te3-small` pueda aceptar consultas provenientes de un sistema que genera vectores con `pplx-embed-1`, facilitando la integración sin cambios en el backend.

- Búsqueda híbrida multi-modelo: se puede mantener un índice principal con `te3-small` y, para consultas que llegan desde aplicaciones que usan `pplx-embed-1`, transformar los embeddings de consulta antes de realizar la búsqueda. Esto permite unificar la búsqueda sin duplicar índices.

- Evaluación comparativa de modelos de embeddings: al poder traducir embeddings entre espacios, se pueden comparar resultados de recuperación entre ambos modelos sobre el mismo corpus, sin necesidad de re-embedding, lo que facilita la toma de decisiones sobre qué modelo adoptar.

- Actualización incremental de índices: si se añaden nuevos documentos a un corpus indexado con `pplx-embed-1`, se pueden transformar sus embeddings con el adaptador para insertarlos en un índice `te3-small`, manteniendo la coherencia sin reprocesar todo el histórico.

- Despliegue en entornos con recursos limitados: al ser un modelo ONNX de solo 1,6 millones de parámetros, puede ejecutarse en CPU en servidores modestos o incluso en dispositivos edge, permitiendo la traducción de embeddings en tiempo real sin depender de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros adaptadores o modelos en la información disponible. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de test, que alcanzó **0,8271** con la arquitectura lineal (frente a 0,8153 de la MLP). Este valor indica una alta correlación entre los embeddings traducidos y los objetivos, pero no hay métricas de recuperación (como nDCG o Recall@k) ni comparaciones con otros métodos de traducción.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM, ya que es un modelo ONNX que se ejecuta en CPU.
- GPU recomendada: ninguna; funciona correctamente en CPU.
- Compatibilidad con GPU de consumo: no aplica, aunque podría ejecutarse en GPU si se desea, pero no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), también se puede integrar en servicios como FastAPI o en pipelines de búsqueda existentes.
- Latencia y throughput: al ser una única multiplicación matricial de 1024×1536, la latencia es del orden de microsegundos por vector en CPU moderna. El throughput depende del tamaño de lote, pero es trivial para la mayoría de casos de uso.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de traducción de embeddings comparables en el mercado. Existen proyectos como el de SantanderAI (linear-adapter-trainer) que entrenan adaptadores lineales para embeddings, pero no hay datos públicos de rendimiento que permitan una comparación directa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado específicamente para los modelos `pplx-embed-1` y `te3-small`. No es generalizable a otros pares de modelos de embeddings.
- La calidad de la traducción depende de la similitud entre los espacios vectoriales de ambos modelos. Aunque la similitud coseno en test es alta (0,8271), puede haber degradación en dominios no representados en el corpus de entrenamiento (por ejemplo, textos muy especializados o en idiomas distintos a los del corpus).
- No se especifican los idiomas soportados por los modelos fuente, por lo que el adaptador hereda las limitaciones de estos. Si los modelos fuente no son multilingües, el adaptador tampoco lo será.
- El modelo no incluye ningún mecanismo de control de sesgos ni de alucinación, ya que no genera texto. Sin embargo, los embeddings de origen pueden contener sesgos que se propaguen a través de la proyección.
- Para uso en producción, se recomienda validar el rendimiento del adaptador en el dominio específico de la aplicación, ya que el corpus de entrenamiento es limitado y puede no cubrir todos los casos de uso.
- La licencia MIT permite uso comercial sin restricciones, pero se debe verificar que los modelos fuente (pplx-embed-1 y te3-small) tengan licencias compatibles con el uso previsto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-pplx-embed-1_to_te3-small)
- [Colección de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Modelo pplx-embed-v1-4b de Perplexity AI](https://huggingface.co/perplexity-ai/pplx-embed-v1-4b)
- [Artículo técnico de pplx-embed](https://research.perplexity.ai/articles/pplx-embed-state-of-the-art-embedding-models-for-web-scale-retrieval)
- [Repositorio linear-adapter-trainer de SantanderAI](https://github.com/SantanderAI/linear-adapter-trainer)
