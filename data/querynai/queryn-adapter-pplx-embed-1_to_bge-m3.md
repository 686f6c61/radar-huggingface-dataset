# QuerynAi/queryn-adapter-pplx-embed-1_to_bge-m3

## Resumen

Queryn adapter — `pplx-embed-1` → `bge-m3` es un adaptador de embeddings desarrollado por QuerynAi como parte del motor de traducción de embeddings Queryn. Su función es transformar un vector de embedding generado por el modelo propietario `pplx-embed-1` (1024 dimensiones) al espacio de representación de `bge-m3` (también 1024 dimensiones), de modo que un corpus ya indexado con `pplx-embed-1` pueda servirse contra un índice construido con `bge-m3` sin necesidad de re-embedding. Esto resuelve el problema de interoperabilidad entre sistemas de recuperación que usan modelos de embedding distintos.

El adaptador es una proyección lineal (arquitectura `linear`) con aproximadamente 1 millón de parámetros, exportado a ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La mejor similitud coseno en test alcanzada es 0,8640 (epoch 15), superando a la variante profunda (MLP) que obtuvo 0,8587. El modelo se distribuye bajo licencia MIT y está pensado para ejecutarse localmente mediante ONNX Runtime, sin depender de una API HTTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,0 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, procesa embeddings fijos de 1024 dimensiones) |
| Tipos de cuantizacion | no disponible (solo float32) |
| Idiomas soportados | no disponibles (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal simple que mapea un vector de 1024 dimensiones (embedding de `pplx-embed-1`) a otro vector de 1024 dimensiones en el espacio de `bge-m3`. El grafo ONNX normaliza L2 tanto la entrada como la salida, por lo que no se requiere pre-normalización manual. La dimensión del batch es dinámica.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio (~350 000 filas) que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y programación de tasa de aprendizaje `ReduceLROnPlateau`. Se guardó el checkpoint de la mejor época. Para cada par de modelos se entrenaron tanto una proyección lineal como un MLP, publicándose el que obtuviera mayor puntuación en test (en caso de empate, se elige la lineal). En este caso, la lineal obtuvo 0,8640 frente a 0,8587 del MLP.

## Capacidades

- Traducción de embeddings: convierte vectores de `pplx-embed-1` (1024-d) al espacio de `bge-m3` (1024-d) manteniendo la normalización L2.
- Interoperabilidad entre índices: permite consultar un índice construido con `bge-m3` usando embeddings generados originalmente con `pplx-embed-1`, sin re-embedding del corpus.
- Ejecución local: se invoca directamente contra la infraestructura del cliente mediante ONNX Runtime, sin necesidad de servicios HTTP externos.
- Batch dinámico: acepta lotes de cualquier tamaño (dimensión batch dinámica en el grafo ONNX).
- Integración sencilla: el modelo se carga con `onnxruntime.InferenceSession` y se usa con una única llamada a `sess.run`.

## Casos de uso

- Migración de índices de búsqueda: una empresa que tiene un corpus embebido con `pplx-embed-1` y quiere pasar a usar `bge-m3` como modelo de recuperación puede aplicar este adaptador para transformar los embeddings existentes sin volver a procesar todo el corpus.
- Sistemas RAG híbridos: en un pipeline de generación aumentada por recuperación donde diferentes partes del sistema usan modelos de embedding distintos, el adaptador permite unificar las representaciones para que la búsqueda sea coherente.
- Evaluación comparativa de modelos de embedding: al traducir embeddings de un modelo a otro, se pueden comparar métricas de recuperación (precisión, recall) sobre el mismo índice sin sesgo por el espacio de representación.
- Archivado y preservación de datos: si un modelo de embedding original deja de estar disponible o cambia su API, el adaptador permite mantener la compatibilidad con los índices ya construidos.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~1M de parámetros en ONNX, puede ejecutarse en CPU sin GPU, ideal para entornos de producción con restricciones de hardware.
- Integración en pipelines de datos locales: dado que se ejecuta como programa local con credenciales propias, encaja en flujos de datos batch o streaming donde no se desea depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanzó **0,8640** en la epoch 15 para la arquitectura lineal, frente a 0,8587 para la variante profunda. No hay comparaciones con otros adaptadores ni con los modelos originales en tareas de recuperación.

## Requisitos de hardware

- VRAM estimada: despreciable (el modelo ocupa aproximadamente 4 MB en float32, ~1M de parámetros). Puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM es más que suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier ordenador personal, incluso en Raspberry Pi (siempre que se disponga de ONNX Runtime).
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), integrable en aplicaciones Python, servicios locales o pipelines de datos.
- Latencia y throughput: no disponible, pero al ser una única capa lineal, la inferencia es del orden de microsegundos por vector en CPU.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de embeddings comparables en el mercado. La colección Queryn incluye otros adaptadores entre distintos pares de modelos (ver enlaces), pero no se han publicado métricas comparativas entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La similitud coseno máxima en test es 0,8640, lo que indica que la traducción no es perfecta; puede haber pérdida de calidad en tareas de recuperación que dependan de la precisión del embedding.
- El adaptador se entrenó en dominios específicos (ciencia, legal, QA, medicina, finanzas). Su rendimiento en dominios fuera de estos puede degradarse.
- Asume que los embeddings de entrada son generados por `pplx-embed-1`. Si se alimentan con vectores de otro modelo, los resultados serán incorrectos.
- No se especifican los idiomas soportados; depende de los modelos origen y destino, que no se detallan en la documentación.
- Aunque el adaptador tiene licencia MIT, el modelo `pplx-embed-1` es propietario y puede tener sus propias restricciones de uso que deben verificarse antes de emplear este adaptador en producción.
- El repositorio de HuggingFace no incluye documentación sobre cuantización ni versiones alternativas del modelo; solo se ofrece el archivo ONNX en float32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-pplx-embed-1_to_bge-m3
- Colección de adaptadores Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio GitHub de Queryn: https://github.com/Gigadelux/Queryn
- Documentación de adaptadores en GitHub: https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md
- Artículo sobre PPLX-embed (contexto del modelo origen): https://getfocuslab.com/pplx-embed-embedding-models/
