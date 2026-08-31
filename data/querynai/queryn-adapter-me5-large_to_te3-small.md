# QuerynAi/queryn-adapter-me5-large_to_te3-small

## Resumen

El modelo `queryn-adapter-me5-large_to_te3-small` es un adaptador de traducción de embeddings desarrollado por QuerynAi, parte del motor Queryn de interoperabilidad entre modelos de embeddings. Su función es transformar un vector generado por el modelo `me5-large` (1024 dimensiones) en el espacio de representación de `te3-small` (1536 dimensiones), de modo que un corpus ya indexado con `me5-large` pueda servirse contra un índice construido con `te3-small` sin necesidad de re-embedding. Esto resuelve el problema de migración entre modelos de embeddings sin coste computacional adicional sobre el corpus original.

El adaptador es una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,6 millones de parámetros, exportado a ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas (arXiv, jurisprudencia australiana, pasajes SQuAD, PubMed y noticias de cripto/finanzas) utilizando una pérdida basada en similitud coseno. La mejor similitud coseno en test alcanzada es 0,7782. Su relevancia radica en permitir la interoperabilidad entre modelos de embeddings sin re-procesar los datos, lo que ahorra tiempo y recursos en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (adaptador de embeddings) |
| Tipos de cuantizacion | No disponible (solo ONNX float32) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo es una proyección lineal que mapea un vector de entrada de 1024 dimensiones a uno de salida de 1536 dimensiones. La entrada se normaliza L2 internamente en el grafo, por lo que no se requiere normalización previa. La salida también se normaliza para producir vectores unitarios en el espacio de `te3-small`. El entrenamiento se realizó sobre pares de embeddings generados por los dos modelos sobre un corpus unificado de múltiples dominios (ciencia, legal, QA, medicina y finanzas). La función de pérdida fue `1 - media de similitud coseno`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se evaluaron dos arquitecturas (lineal y MLP profundo) y se publicó la que obtuvo mejor similitud coseno en test; en este caso, la lineal alcanzó 0,7782 frente a 0,7772 de la profunda.

## Capacidades

- Traducción de embeddings entre los espacios de `me5-large` y `te3-small` sin re-embedding del corpus.
- Normalización automática de entrada y salida (vectores unitarios).
- Soporte de batch dinámico en la dimensión del lote.
- Ejecución eficiente en CPU gracias a su tamaño reducido y a la exportación a ONNX.
- Integración sencilla con `onnxruntime` y `huggingface_hub`.
- No genera texto ni realiza razonamiento; es un componente de transformación de vectores.

## Casos de uso

- Migración de índices de búsqueda semántica: si una empresa tiene un índice de vectores generado con `me5-large` y desea cambiar a `te3-small` (por ejemplo, por mejor rendimiento o menor coste), puede aplicar este adaptador a los vectores existentes sin re-embedding de todo el corpus.
- Búsqueda híbrida multi-modelo: permite combinar resultados de búsqueda de dos modelos de embeddings distintos en un mismo espacio, facilitando la fusión de rankings.
- Ahorro de costes en infraestructura: al evitar re-embedding, se reduce el tiempo de procesamiento y el consumo de GPU/CPU en pipelines de indexación.
- Actualización incremental de sistemas RAG: cuando se cambia el modelo de embeddings en un sistema de recuperación aumentada por generación, el adaptador permite mantener los documentos ya indexados sin reprocesarlos.
- Evaluación comparativa de modelos: facilita la comparación directa de la calidad de recuperación entre `me5-large` y `te3-small` sobre el mismo corpus, al unificar los espacios vectoriales.
- Interoperabilidad en entornos multi-proveedor: si diferentes partes de una organización usan distintos modelos de embeddings, el adaptador permite unificar las representaciones para búsquedas centralizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que no es un modelo de lenguaje generativo. La única métrica reportada es la similitud coseno en el conjunto de test, que se muestra a continuación:

| Métrica | Valor |
|---|---|
| Similitud coseno media (test) | 0,7782 (epoch 15) |

Esta métrica indica la fidelidad de la traducción entre los dos espacios de embeddings. No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- El modelo es extremadamente ligero (~1,6 millones de parámetros, archivo ONNX de tamaño reducido).
- Puede ejecutarse en CPU sin problemas; no requiere GPU para inferencia.
- La memoria necesaria es del orden de unos pocos megabytes, por lo que cabe en cualquier entorno, incluidos dispositivos edge.
- Se puede desplegar con `onnxruntime` en Python, o integrarse en pipelines de inferencia con frameworks como FastAPI o servicios de embeddings.
- No se dispone de datos de latencia o throughput específicos, pero al ser una proyección lineal, la inferencia es prácticamente instantánea incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de otros proveedores. El modelo forma parte de una colección de adaptadores de Queryn (ver enlaces), pero no se han publicado métricas comparativas entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador solo funciona con los modelos específicos `me5-large` y `te3-small`; no es genérico para otros pares de embeddings.
- La traducción introduce una pérdida de fidelidad (similitud coseno de 0,7782), lo que puede afectar a la calidad de la recuperación en aplicaciones sensibles.
- No se han documentado sesgos específicos, pero al entrenarse sobre un corpus limitado (arXiv, legal, SQuAD, PubMed, finanzas), puede tener un rendimiento subóptimo en dominios no representados.
- El modelo no soporta idiomas específicos; depende de los modelos originales.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia de los modelos fuente (`me5-large` y `te3-small`) para evitar conflictos.
- No se proporcionan garantías de soporte o mantenimiento por parte del autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-me5-large_to_te3-small)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio GitHub de Queryn](https://github.com/Gigadelux/Queryn)
- [Documentación de adaptadores en GitHub](https://github.com/Gigadelux/Queryn/blob/main/docs/Adapters.md)
