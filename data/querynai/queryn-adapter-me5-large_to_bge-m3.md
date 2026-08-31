# QuerynAi/queryn-adapter-me5-large_to_bge-m3

## Resumen

El modelo `QuerynAi/queryn-adapter-me5-large_to_bge-m3` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar los vectores generados por el modelo de embeddings `me5-large` (de 1024 dimensiones) al espacio vectorial del modelo `bge-m3` (también de 1024 dimensiones), de modo que un corpus ya indexado con `me5-large` pueda ser consultado contra un índice construido con `bge-m3` sin necesidad de re-embedding. Forma parte del motor de traducción de embeddings de Queryn, que publica una colección de adaptadores para distintos pares de modelos.

Se trata de una proyección lineal simple (arquitectura `linear`) con aproximadamente 1 millón de parámetros, exportada a formato ONNX (opset 17). El modelo se entrenó sobre pares de embeddings procedentes de un corpus multidisciplinar de unas 350 000 filas (resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados), optimizando la similitud coseno media. El mejor resultado en el conjunto de test alcanza una similitud coseno de 0,8918. Su relevancia radica en permitir migraciones de infraestructura de búsqueda sin reprocesar todo el corpus, un problema habitual en sistemas de retrieval y RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~1,0 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (operación sobre embeddings, no sobre texto) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponible (el adaptador es agnóstico al idioma; los modelos base soportan múltiples idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de entrada de 1024 dimensiones (embedding de `me5-large`) a otro vector de 1024 dimensiones en el espacio de `bge-m3`. El grafo ONNX normaliza internamente por norma L2 tanto la entrada como la salida, por lo que no se requiere pre-normalización. La dimensión del batch es dinámica.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multidisciplinar (~350 000 filas) que abarca dominios científicos, legales, de QA, médicos y financieros. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos; se publica la que obtiene mejor puntuación en el conjunto de test, con empate a favor de la lineal. En este caso, la lineal obtuvo 0,8918 frente a 0,8825 de la profunda.

## Capacidades

- Traducción de embeddings: convierte vectores de `me5-large` (1024-d) al espacio de `bge-m3` (1024-d) manteniendo la similitud semántica.
- Normalización automática: el grafo aplica normalización L2 a la entrada y a la salida, garantizando vectores unitarios.
- Compatibilidad con índices existentes: permite servir un corpus ya embebido con `me5-large` contra un índice de `bge-m3` sin re-embedding.
- Inferencia ligera: al ser una proyección lineal, la latencia es mínima y puede ejecutarse en CPU.
- Formato ONNX: portable a múltiples runtimes (ONNX Runtime, etc.) y a entornos de producción.
- No es un modelo de generación de texto ni de razonamiento; su única función es la transformación de vectores.

## Casos de uso

- Migración de infraestructura de búsqueda: si una organización tiene un corpus indexado con `me5-large` y desea adoptar `bge-m3` como modelo de embeddings, puede aplicar este adaptador a los vectores almacenados y reindexar sin volver a procesar los documentos originales.
- Búsqueda híbrida multi-modelo: en sistemas que combinan varios modelos de embeddings, el adaptador permite unificar espacios vectoriales para realizar búsquedas cruzadas entre índices.
- Actualización incremental de RAG: cuando se añaden nuevos documentos a un pipeline de Retrieval-Augmented Generation, se pueden generar embeddings con `me5-large` y traducirlos al espacio de `bge-m3` para mantener la coherencia del índice sin cambiar el modelo de generación.
- Evaluación comparativa de modelos: permite medir la degradación de similitud al cambiar de modelo de embeddings, usando la similitud coseno como métrica de fidelidad.
- Reducción de costes de cómputo: evita el re-embedding masivo de grandes corpus, ahorrando tiempo de GPU y almacenamiento temporal.
- Integración en pipelines de datos: al ser un modelo ONNX pequeño, puede ejecutarse en funciones serverless o en edge devices para transformar embeddings en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que este modelo no es un LLM generativo sino un adaptador de embeddings. La única métrica reportada es la similitud coseno media en el conjunto de test:

| Metrica | Valor |
|---|---|
| Similitud coseno (test, epoch 15) | 0,8918 |
| Similitud coseno (arquitectura profunda) | 0,8825 |

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; el modelo es una proyección lineal de ~1M de parámetros en formato ONNX float32 (~4 MB).
- GPU recomendadas: ninguna; puede ejecutarse en CPU sin problemas.
- Compatibilidad con hardware de consumo: sí, cualquier CPU moderna es suficiente.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, funciones serverless o pipelines de datos.
- Latencia y throughput: al ser una operación matricial de 1024×1024, la latencia es del orden de microsegundos por vector en CPU; throughput limitado por el runtime y el batch.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores de la misma colección (por ejemplo, el adaptador inverso `bge-m3` → `me5-large`) en la información proporcionada. La alternativa directa sería re-embedding completo con `bge-m3`, que requiere reprocesar todo el corpus y tiene un coste computacional mucho mayor, pero no es un modelo comparable sino un proceso distinto. No se incluyen comparativas numéricas por falta de datos.

## Limitaciones y advertencias

- El adaptador solo funciona entre los dos modelos especificados (`me5-large` como entrada y `bge-m3` como salida); no es generalizable a otros pares de modelos.
- La fidelidad de la traducción no es perfecta: la similitud coseno máxima alcanzada es 0,8918, lo que implica una pérdida de precisión en la recuperación frente a usar directamente `bge-m3` sobre el corpus original.
- No se han documentado sesgos específicos, pero al entrenarse sobre un corpus con dominios concretos (ciencia, legal, QA, medicina, finanzas) puede tener un rendimiento inferior en dominios no representados.
- El modelo no acepta texto como entrada; solo embeddings precalculados. No es adecuado para tareas de generación, clasificación o razonamiento.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de los modelos base (`me5-large` y `bge-m3`) si los utiliza en producción.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar la calidad de la traducción con un conjunto de prueba propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-me5-large_to_bge-m3
- Colección de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Modelo base `bge-m3`: https://huggingface.co/BAAI/bge-m3
- Documentación de BGE-M3: https://bge-model.com/bge/bge_m3.html
- Sitio oficial de BGE: https://bge.baai.ac.cn/
