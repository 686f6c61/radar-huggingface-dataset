# QuerynAi/queryn-adapter-ada-002_to_bge-m3

## Resumen

El modelo `queryn-adapter-ada-002_to_bge-m3` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo `text-embedding-ada-002` de OpenAI (1536 dimensiones) al espacio de representación de `bge-m3` (1024 dimensiones). Su propósito es permitir que un corpus ya embebido con `ada-002` pueda ser servido contra un índice construido con `bge-m3` sin necesidad de re-embebir todos los datos, lo que supone un ahorro significativo de tiempo y coste computacional en migraciones de infraestructura de búsqueda vectorial.

El adaptador es una proyección lineal (capa fully connected) con aproximadamente 1,6 millones de parámetros, entrenada con pares de embeddings de ambos modelos sobre un corpus multi-dominio de unas 350 000 filas. Se publica en formato ONNX (opset 17) y se distribuye bajo licencia MIT. La similitud coseno media en el conjunto de test alcanza 0,8668, lo que indica una buena pero no perfecta fidelidad en la traducción. Es parte del motor de traducción de embeddings de QuerynAi, que incluye adaptadores para otros pares de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (capa fully connected) |
| Parametros totales | ~1,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (transforma vectores, no procesa texto) |
| Tipos de cuantizacion | No disponible (solo se distribuye en ONNX float32) |
| Idiomas soportados | No disponible (el corpus de entrenamiento incluye textos en inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo es una proyección lineal que mapea un vector de entrada de 1536 dimensiones a uno de salida de 1024. El grafo ONNX normaliza internamente tanto la entrada como la salida mediante normalización L2, de modo que no es necesario pre-normalizar los vectores de `ada-002` antes de pasarlos por el adaptador. La salida es un vector unitario en el espacio de `bge-m3`.

El entrenamiento se realizó sobre pares de embeddings generados con `ada-002` y `bge-m3` a partir de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados financieros. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se seleccionó el checkpoint del mejor epoch. Además de la arquitectura lineal, se evaluó una variante profunda (MLP) para cada par de modelos; en este caso, la lineal obtuvo mejor similitud coseno en test (0,8668 frente a 0,8647) y fue la publicada.

## Capacidades

- Traducción de embeddings entre los espacios de `ada-002` y `bge-m3`, permitiendo interoperabilidad entre ambos modelos.
- Normalización automática de entrada y salida, simplificando su uso en pipelines existentes.
- Soporte de batch dinámico en el eje de lote, lo que facilita su integración en servicios de inferencia.
- Ejecución en CPU sin requisitos especiales de hardware, gracias a su pequeño tamaño.
- No es un modelo generativo: no genera texto, código ni responde consultas; su única función es transformar vectores.

## Casos de uso

- Migración de infraestructura de embeddings: una empresa que haya embebido millones de documentos con `ada-002` puede adoptar `bge-m3` para nuevos documentos y usar este adaptador para los antiguos, evitando el coste de re-embebido completo.
- Búsqueda híbrida unificada: combinar resultados de búsqueda de un índice basado en `ada-002` y otro basado en `bge-m3` traduciendo los vectores de uno a otro espacio, permitiendo consultas cruzadas.
- Actualización incremental de índices: añadir documentos nuevos embebidos con `bge-m3` a un índice existente de `ada-002` sin reprocesar los datos históricos.
- Evaluación comparativa de modelos de embeddings: probar la calidad de `bge-m3` sobre un corpus ya embebido con `ada-002` sin necesidad de regenerar los vectores.
- Ahorro de costes en pipelines de RAG: en entornos donde el re-embebido de grandes volúmenes de datos es prohibitivo, el adaptador permite cambiar de modelo de embeddings con una inversión mínima.
- Integración en sistemas de recuperación de información legal o médica: el corpus de entrenamiento incluye dominios específicos, por lo que el adaptador puede ser útil en estos ámbitos para unificar espacios de representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanza **0,8668** con la arquitectura lineal. Esta métrica indica la fidelidad de la traducción, pero no es directamente comparable con benchmarks de modelos generativos.

## Requisitos de hardware

- Al ser un modelo ONNX de solo ~1,6 millones de parámetros, puede ejecutarse en CPU sin necesidad de GPU.
- La memoria requerida es mínima: el archivo del modelo ocupa unos pocos megabytes (el repositorio indica 0.0 GB, consistente con un archivo pequeño).
- Es compatible con cualquier runtime ONNX, como `onnxruntime` con `CPUExecutionProvider`.
- No se dispone de datos de latencia o throughput, pero se espera que sea muy rápido incluso en hardware modesto.
- No requiere despliegue especializado; puede integrarse en servicios Python, contenedores o funciones serverless.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de otros proveedores en los resultados de búsqueda. QuerynAi publica una colección de adaptadores para otros pares de modelos (por ejemplo, `ada-002` a `qwen3-emb-8b`), pero no se proporcionan datos de rendimiento comparativos entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador es específico para el par `ada-002` → `bge-m3`; no es generalizable a otros modelos de embeddings.
- La similitud coseno de 0,8668 implica que la traducción no es perfecta; puede haber pérdida de precisión en tareas de búsqueda o recuperación que dependan de la exactitud de los vectores.
- El corpus de entrenamiento está sesgado hacia dominios concretos (ciencia, legal, medicina, finanzas), por lo que el rendimiento puede degradarse en dominios muy diferentes.
- No se han documentado sesgos específicos, pero al entrenarse sobre datos de esos ámbitos, podría heredar sesgos presentes en ellos.
- Aunque la licencia del adaptador es MIT, el uso comercial de los modelos originales (`ada-002` y `bge-m3`) está sujeto a sus respectivas licencias; es responsabilidad del usuario verificar el cumplimiento.
- No se proporciona información sobre la robustez ante entradas fuera de distribución o vectores mal formados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_bge-m3)
- [Colección de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
