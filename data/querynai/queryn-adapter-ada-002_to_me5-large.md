# QuerynAi/queryn-adapter-ada-002_to_me5-large

## Resumen

El modelo `queryn-adapter-ada-002_to_me5-large` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo `text-embedding-ada-002` de OpenAI (1536 dimensiones) al espacio de embeddings de `me5-large` (1024 dimensiones). Su propósito es permitir que un corpus ya embebido con `ada-002` pueda servirse contra un índice de `me5-large` sin necesidad de re-embebir todos los documentos, lo que supone un ahorro significativo de tiempo y coste computacional en migraciones de infraestructura de búsqueda semántica.

La arquitectura es una proyección lineal simple (una capa fully-connected) con aproximadamente 1,6 millones de parámetros, exportada a formato ONNX (opset 17). El modelo forma parte del motor de traducción de embeddings de Queryn, que publica adaptadores para múltiples pares de modelos. Su relevancia actual radica en la creciente necesidad de migrar entre proveedores de embeddings (de soluciones propietarias a modelos open source) sin perder las inversiones previas en indexación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~1,6M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (solo se distribuye en ONNX sin cuantizar) |
| Idiomas soportados | No disponible (el corpus de entrenamiento incluye textos en inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador consiste en una única capa lineal que mapea vectores de 1536 dimensiones a 1024, seguida de una normalización L2 en la salida. El grafo ONNX también normaliza la entrada internamente, por lo que no es necesario pre-normalizar los embeddings de `ada-002` antes de pasarlos al modelo. La dimensión del batch es dinámica, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de learning rate mediante `ReduceLROnPlateau`. Se comparó una arquitectura lineal con una MLP profunda; la lineal obtuvo una mejor similitud coseno en test (0,9432 frente a 0,9417) y fue la publicada. No se emplearon técnicas de RLHF ni DPO.

## Capacidades

- Traducción de embeddings entre los espacios de `ada-002` y `me5-large`, preservando la semántica con una similitud coseno media de 0,9432 en el conjunto de test.
- Normalización L2 automática tanto en la entrada como en la salida, garantizando vectores unitarios en el espacio destino.
- Procesamiento por lotes con dimensión dinámica, adecuado para integración en pipelines de inferencia.
- Ejecución en CPU mediante ONNX Runtime, sin dependencias de GPU.
- Compatible con cualquier sistema que consuma modelos ONNX (Python, C++, etc.).
- No es un modelo generativo ni de lenguaje; su única función es la transformación de vectores.

## Casos de uso

- Migración de índices de búsqueda semántica: si una empresa tiene millones de documentos embebidos con `ada-002` y quiere cambiar a `me5-large` (por coste, latencia o soberanía de datos), este adaptador permite transformar los embeddings existentes sin re-embebido, ahorrando tiempo y coste de API.
- Reducción de dimensionalidad y almacenamiento: al pasar de 1536 a 1024 dimensiones, el espacio de almacenamiento del índice se reduce aproximadamente un 33%, lo que abarata el coste de memoria y mejora la velocidad de búsqueda en vectores.
- Unificación de espacios de embeddings en sistemas multi-modelo: en arquitecturas que combinan varios modelos de embeddings (por ejemplo, para consultas y documentos), este adaptador permite alinear los vectores de `ada-002` con los de `me5-large` para poder compararlos directamente.
- Actualización de modelos en producción sin downtime: se puede transformar el índice antiguo de forma asíncrona mientras el sistema sigue sirviendo consultas, y luego cambiar el modelo de consulta al nuevo espacio sin interrupción.
- Integración en pipelines de búsqueda híbrida: combinar resultados de búsqueda por palabras clave con búsqueda semántica, donde los embeddings de diferentes fuentes deben coexistir en el mismo índice vectorial.
- Transferencia de embeddings entre proveedores: para organizaciones que desean dejar de depender de la API de OpenAI y adoptar modelos open source, este adaptador facilita la transición sin perder la inversión en datos ya embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de test: **0,9432** (epoch 15), frente a 0,9417 de la arquitectura profunda. No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- Al ser un modelo ONNX de ~1,6M parámetros, puede ejecutarse en cualquier CPU moderna sin necesidad de GPU. El uso de memoria es mínimo (menos de 10 MB en RAM).
- No se requieren GPUs específicas; es adecuado para entornos de producción con recursos limitados.
- Se puede desplegar con ONNX Runtime (CPUExecutionProvider) o cualquier runtime compatible con ONNX (TensorRT, OpenVINO, etc.).
- La latencia por lote es del orden de microsegundos a milisegundos, dependiendo del tamaño del batch y del hardware. No se han publicado cifras exactas.
- No se recomienda el uso de vLLM, llama.cpp u Ollama, ya que están orientados a modelos generativos y no a transformadores de embeddings.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de otros proveedores. La colección de QuerynAi incluye otros adaptadores entre pares de modelos de embeddings (por ejemplo, `fastembed-bge-small` a `nemotron-1b-free`), pero no se han publicado métricas comparativas entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador solo acepta embeddings de `ada-002` como entrada; no funciona con otros modelos de embeddings.
- La similitud coseno de 0,9432 indica una pérdida de fidelidad en la traducción; los resultados de búsqueda pueden diferir ligeramente respecto a los obtenidos con el espacio original.
- El corpus de entrenamiento está sesgado hacia dominios científicos, legales, médicos y financieros; la traducción puede ser menos precisa en dominios muy diferentes (por ejemplo, contenido creativo o conversacional).
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre datos de dominios concretos, puede heredar sesgos de esos corpus.
- No es un modelo generativo, por lo que no presenta riesgo de alucinación en el sentido habitual; sin embargo, la transformación de vectores puede producir embeddings que no representen fielmente el significado original en casos extremos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende de los espacios de `ada-002` y `me5-large`, cuyas licencias y términos de uso deben verificarse por separado.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar la calidad de la traducción en el dominio específico de la aplicación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_me5-large)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Documentación de text-embedding-ada-002 de OpenAI](https://developers.openai.com/api/docs/models/text-embedding-ada-002)
