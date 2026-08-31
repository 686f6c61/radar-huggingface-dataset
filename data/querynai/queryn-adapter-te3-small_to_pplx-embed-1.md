# QuerynAi/queryn-adapter-te3-small_to_pplx-embed-1

## Resumen

Queryn adapter `te3-small` → `pplx-embed-1` es un adaptador de embeddings desarrollado por QuerynAi como parte del motor de traducción de embeddings Queryn. Su función es transformar un embedding generado por el modelo `te3-small` (de 1536 dimensiones) en el espacio de representación de `pplx-embed-1` (de 1024 dimensiones), permitiendo que un corpus ya indexado con `te3-small` pueda servirse contra un índice de `pplx-embed-1` sin necesidad de re-embedding.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,6 millones de parámetros, exportado a formato ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus unificado multi-dominio (~350 000 filas) que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La mejor similitud coseno en test alcanzada es 0,7785 (epoch 15), superando a la variante profunda (0,7654).

Su relevancia radica en que resuelve el problema de interoperabilidad entre modelos de embeddings: en lugar de re-embedding de toda una base de datos (costoso en tiempo y recursos), este adaptador permite migrar o combinar índices de diferentes modelos de forma eficiente. Al ser un modelo pequeño y en formato ONNX, se ejecuta fácilmente en CPU y es ligero de desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,6 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de embedding, no generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de entrada de 1536 dimensiones (embedding de `te3-small`) a un vector de salida de 1024 dimensiones (espacio de `pplx-embed-1`). El grafo ONNX normaliza L2 la entrada internamente, por lo que no se requiere pre-normalización. La salida también se normaliza a norma unitaria.

Se entrenó sobre pares de embeddings generados por los dos modelos sobre un corpus unificado multi-dominio (~350 000 filas). La función de pérdida fue `1 - mean cosine similarity`, con optimizador Adam y reducción de learning rate por `ReduceLROnPlateau`. Se guardó el checkpoint de la mejor época (epoch 15). También se entrenó una variante MLP más profunda (`deep`), pero la lineal obtuvo mejor rendimiento (0,7785 vs 0,7654), por lo que se publicó la lineal.

## Capacidades

- Traducción de embeddings: convierte vectores de `te3-small` (1536-d) al espacio de `pplx-embed-1` (1024-d), preservando la semántica.
- Normalización automática: la entrada y la salida se normalizan L2 dentro del grafo, simplificando el uso.
- Compatibilidad con ONNX: se puede ejecutar con `onnxruntime` en CPU o GPU, y es integrable en pipelines de embeddings existentes.
- Batch dinámico: admite lotes de tamaño variable (el eje batch es dinámico).
- No requiere re-embedding: permite servir un corpus ya indexado con `te3-small` contra un índice de `pplx-embed-1` sin reprocesar el corpus.

## Casos de uso

- Migración de índices de búsqueda: si una empresa tiene un índice vectorial construido con `te3-small` y desea cambiar a `pplx-embed-1` sin re-embedding de millones de documentos, puede aplicar este adaptador a los embeddings existentes para obtener representaciones en el nuevo espacio.
- Búsqueda híbrida multi-modelo: en sistemas de recuperación que combinan varios modelos de embeddings, este adaptador permite unificar espacios y ejecutar consultas cruzadas sin duplicar almacenamiento.
- Ahorro de costes de cómputo: re-embedding de grandes corpus es costoso; este adaptador (1,6 M de parámetros) se ejecuta en milisegundos por lote, reduciendo drásticamente el tiempo y los recursos necesarios.
- Compatibilidad entre proveedores: si un servicio externo usa `pplx-embed-1` como espacio de referencia, un cliente con datos pre-embedidos con `te3-small` puede adaptarlos sin volver a pagar por la generación de embeddings.
- Actualización incremental de modelos: al añadir nuevos documentos a un corpus existente, se pueden generar sus embeddings con `te3-small` y traducirlos con el adaptador, manteniendo la coherencia con el índice `pplx-embed-1`.
- Investigación en transferencia de representaciones: útil para estudiar la relación entre espacios de embeddings y para experimentos de alineación semántica entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un adaptador de embeddings, no de un modelo de lenguaje generativo. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanzó **0,7785** en la mejor época. La ablación de arquitectura mostró que la variante lineal supera a la profunda (0,7654).

## Requisitos de hardware

- Al ser un modelo de ~1,6 M de parámetros, se ejecuta sin problemas en CPU con `onnxruntime`. No se requiere GPU.
- La inferencia es muy rápida: un lote de 4 embeddings se procesa en microsegundos en hardware moderno.
- No hay requisitos de VRAM específicos; el modelo completo ocupa menos de 10 MB en disco.
- Despliegue recomendado: `onnxruntime` en Python, o cualquier runtime compatible con ONNX (por ejemplo, `onnxruntime-gpu` si se desea aceleración, aunque no es necesaria).
- No se dispone de datos de latencia o throughput medidos por el autor, pero por el tamaño del modelo se espera un rendimiento superior a miles de inferencias por segundo en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de embeddings comparables en la misma categoría (traducción entre espacios de embeddings). El modelo forma parte de la colección [Queryn Embedding Adapters](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4), que incluye otros pares de adaptadores, pero no se han publicado métricas comparativas entre ellos. Por tanto, la comparativa se limita a la ablación interna (lineal vs. profunda) ya mencionada.

## Limitaciones y advertencias

- La similitud coseno máxima de 0,7785 no es perfecta; la traducción introduce una pérdida de fidelidad semántica. Para aplicaciones críticas, se recomienda validar la calidad de las búsquedas tras la adaptación.
- El modelo se entrenó sobre un corpus específico (arXiv, jurisprudencia australiana, SQuAD, PubMed, noticias de cripto/mercados). Su rendimiento puede degradarse en dominios muy distintos.
- No es un modelo generativo: no genera texto ni responde preguntas; solo transforma vectores.
- La licencia MIT permite uso comercial sin restricciones, pero se debe atribuir al autor si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes; es un modelo muy reciente (creado en agosto de 2026) y sin validación externa amplia.
- No se especifican los idiomas soportados; se asume que el adaptador funciona sobre cualquier idioma siempre que los embeddings de origen hayan sido generados correctamente por `te3-small`.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-te3-small_to_pplx-embed-1)
- [Colección de adaptadores Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio GitHub de Queryn](https://github.com/Gigadelux/Queryn)
- [Documentación de adaptadores en GitHub](https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md)
