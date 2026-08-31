# QuerynAi/queryn-adapter-me5-large_to_pplx-embed-1

## Resumen

Queryn adapter — `me5-large` → `pplx-embed-1` es un adaptador de traducción de embeddings desarrollado por QuerynAi, parte del motor Queryn de interoperabilidad entre espacios de embeddings. Dado un embedding generado por el modelo `me5-large` (1024 dimensiones), este adaptador lo proyecta al espacio de `pplx-embed-1` (también 1024 dimensiones) mediante una proyección lineal simple, de modo que un corpus ya indexado con `me5-large` pueda servirse contra un índice de `pplx-embed-1` sin necesidad de re-embedding. El modelo se distribuye en formato ONNX, con aproximadamente 1 millón de parámetros, y está pensado para su uso en pipelines de búsqueda y recuperación aumentada (RAG) donde coexisten distintos modelos de embedding.

La relevancia actual de este adaptador radica en la creciente heterogeneidad de modelos de embeddings en producción: migrar de un modelo a otro normalmente exige reprocesar todo el corpus, un coste computacional y económico considerable. Queryn resuelve este problema aprendiendo una proyección entre espacios, lo que permite actualizar o combinar índices sin re-embedding. El adaptador se entrenó sobre un corpus multi-dominio de aproximadamente 350 000 pares de embeddings, con una pérdida basada en similitud coseno, y alcanza una similitud coseno media de 0,7101 en el conjunto de test.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~1,0 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa embeddings, no texto) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal simple que mapea un vector de entrada de 1024 dimensiones (embedding de `me5-large`) a otro vector de 1024 dimensiones en el espacio de `pplx-embed-1`. La gráfica ONNX normaliza internamente el vector de entrada mediante L2-normalización, por lo que no es necesario pre-normalizar los embeddings de origen. La salida también se normaliza a norma unitaria. El batch es dinámico, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados financieros, con aproximadamente 350 000 filas. La función de pérdida fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se evaluaron dos arquitecturas: una lineal y una MLP profunda; la lineal obtuvo una mejor similitud coseno en test (0,7101 frente a 0,7086) y fue la publicada. El checkpoint se convirtió a ONNX con PyTorch 2.13.0.

## Capacidades

- Traducción de embeddings entre los espacios de `me5-large` y `pplx-embed-1`, ambos de 1024 dimensiones.
- Normalización L2 automática tanto de entrada como de salida, garantizando vectores unitarios en el espacio destino.
- Procesamiento por lotes con dimensión de batch dinámica.
- Inferencia ligera en CPU mediante ONNX Runtime, sin dependencias de GPU.
- No es un modelo generativo: no genera texto, no admite tool calling, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Migración de índices de embeddings sin re-embedding: si una organización tiene un corpus indexado con `me5-large` y desea cambiar a `pplx-embed-1`, puede aplicar este adaptador a los embeddings almacenados y actualizar el índice sin reprocesar el texto original, ahorrando tiempo y coste computacional.
- Búsqueda híbrida multi-espacio: en sistemas que combinan resultados de varios modelos de embedding, el adaptador permite unificar las representaciones en un único espacio para aplicar métricas de similitud consistentes.
- Actualización incremental de modelos de embedding en producción: cuando se introduce un nuevo modelo de embeddings, los documentos nuevos se pueden indexar directamente con el modelo destino, mientras que los antiguos se traducen con el adaptador, manteniendo la coherencia del índice.
- Interoperabilidad entre servicios y APIs: si un proveedor de búsqueda utiliza `pplx-embed-1` y otro `me5-large`, el adaptador facilita la integración sin duplicar infraestructura.
- Evaluación comparativa de modelos de embeddings: al traducir embeddings de un modelo a otro, se pueden comparar resultados de recuperación en un mismo espacio de referencia.
- Reducción de costes en pipelines RAG: en lugar de re-embedding de grandes corpus, se aplica una proyección lineal de bajo coste, lo que reduce la latencia y el uso de recursos en entornos con restricciones de presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de test:

| Metrica | Valor |
|---|---|
| Similitud coseno media (test) | 0,7101 |
| Similitud coseno media (arquitectura profunda) | 0,7086 |

No se dispone de comparaciones con otros adaptadores o métodos de traducción de embeddings.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una proyección lineal de ~1 millón de parámetros, por lo que se ejecuta sin problemas en cualquier CPU moderna. El tamaño del archivo ONNX no se especifica, pero se estima en unos pocos megabytes (aproximadamente 4 MB en float32).
- VRAM: no requiere GPU; si se desea ejecutar en GPU, el consumo de VRAM es despreciable (menos de 100 MB).
- GPUs recomendadas: cualquier GPU con soporte CUDA es suficiente, aunque no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o en pipelines de búsqueda como parte de un motor de indexación.
- Latencia y throughput: al ser una única capa lineal, la latencia por lote es del orden de microsegundos en CPU; el throughput está limitado principalmente por la lectura de los embeddings de entrada.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de traducción de embeddings comparables en la documentación proporcionada. No se han encontrado modelos alternativos que realicen la misma función entre `me5-large` y `pplx-embed-1`. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador solo funciona con embeddings de `me5-large` como entrada y produce embeddings en el espacio de `pplx-embed-1`; no es genérico para otros modelos.
- La similitud coseno de 0,7101 indica una correlación moderada entre los espacios; puede haber pérdida de precisión en tareas de recuperación que dependan de distancias finas.
- No se han documentado sesgos específicos, pero al ser un proyector lineal, no introduce sesgos propios; sin embargo, puede heredar los sesgos presentes en los modelos originales.
- El riesgo de alucinación no aplica, ya que no genera texto.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia de los modelos fuente (`me5-large` y `pplx-embed-1`) para asegurar el cumplimiento en el uso final.
- El modelo se distribuye en formato ONNX; no se proporcionan pesos en otros formatos (safetensors, GGUF, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-me5-large_to_pplx-embed-1
- Repositorio del motor Queryn: https://github.com/Gigadelux/Queryn
- Documentación de adaptadores: https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md
- Colección de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Colección de modelos pplx-embed de Perplexity: https://huggingface.co/collections/perplexity-ai/pplx-embed
