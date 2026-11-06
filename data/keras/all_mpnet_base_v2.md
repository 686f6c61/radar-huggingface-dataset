# keras/all_mpnet_base_v2

## Resumen

`keras/all_mpnet_base_v2` es una implementación del modelo MPNet (Masked and Permuted Pre-training for Language Understanding) publicada en Hugging Face a través de la librería KerasHub. Se trata de un encoder tipo transformer con 12 capas, 12 cabezas de atención y una dimensión oculta de 768, configurado para la tarea de `TextEmbedder`, es decir, para generar representaciones vectoriales densas de texto. El modelo puede ejecutarse indistintamente sobre los backends JAX, TensorFlow y PyTorch gracias a la abstracción multi-backend de Keras 3.

MPNet es una arquitectura propuesta originalmente por Microsoft Research que combina las ventajas del enmascaramiento de tokens (estilo BERT) con la predicción de permutaciones (estilo XLNet), lo que le permite capturar dependencias bidireccionales sin la discrepancia entre preentrenamiento y ajuste fino que afecta a los modelos enmascarados puros. La versión `base` corresponde a la variante de 12 capas y aproximadamente 110 millones de parámetros, ampliamente utilizada como encoder para búsqueda semántica, clustering y recuperación de información.

La relevancia de esta ficha concreta radica en su empaquetado: no es un checkpoint en formato PyTorch o safetensors convencional, sino una exportación nativa de KerasHub que facilita su integración en pipelines escritos con Keras 3. Esto resulta útil para equipos que ya trabajan con el ecosistema Keras y quieren evitar dependencias de `transformers` o de frameworks específicos de un solo backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MPNet: masked and permuted language modeling) |
| Parametros totales | no disponible (no declarado en la model card; por configuración, ~110 M en la variante base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (`max_sequence_length: 512`) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos KerasHub (compatibles con JAX, TensorFlow y PyTorch); tamano del repo 0,4 GB |
| Vocabulario | 30.527 tokens |
| Capas / cabezas | 12 capas, 12 cabezas de atencion |
| Dimension oculta | 768 |
| Dimension intermedia | 3.072 |
| Dropout | 0,1 |
| Layer norm epsilon | 1e-05 |
| Tarea declarada | `TextEmbedder` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo MPNet, con 12 capas, 12 cabezas de atencion, dimension oculta de 768 y feed-forward de 3.072, lo que sitúa el modelo en la categoría "base" (aproximadamente 110 millones de parámetros, aunque la cifra exacta no se declara en la model card). El mecanismo de preentrenamiento de MPNet combina el enmascaramiento de tokens con la predicción de permutaciones, de modo que el modelo ve la secuencia completa durante el preentrenamiento y elimina la discrepancia entre las fases de preentrenamiento y ajuste. La longitud máxima de secuencia es de 512 tokens y el vocabulario contiene 30.527 entradas.

La model card no aporta información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron fases de ajuste con RLHF, DPO o instrucciones. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. Se trata, por tanto, de una exportación de pesos a KerasHub más que de un modelo nuevo con entrenamiento propio documentado; el autor de la model card indica explícitamente que esta ha sido generada automáticamente y que debe ser completada por el autor del modelo.

## Capacidades

- Generación de embeddings de texto densos para tareas de similitud semántica y recuperación de información.
- Codificación de pares de frases para ranking y re-ranking en pipelines de búsqueda.
- Representación de documentos y consultas para búsqueda semántica vectorial.
- Extracción de características para clasificación de texto y análisis de sentimiento mediante ajuste fino posterior.
- Clustering y deduplicación de textos a partir de la similitud coseno entre embeddings.
- Ejecución multi-backend: el mismo modelo funciona sobre JAX, TensorFlow y PyTorch a través de Keras 3.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en bases documentales: el modelo genera embeddings de 768 dimensiones para consultas y documentos, permitiendo recuperación por similitud coseno en índices vectoriales. Su ventana de 512 tokens lo hace adecuado para fragmentos de documento de tamaño medio.
- Re-ranking en pipelines RAG: dado un conjunto de candidatos recuperados por un retriever léxico o denso, el modelo puede puntuar pares consulta-documento y reordenar los resultados antes de pasarlos a un LLM generador.
- Deduplicación de catálogos y registros: codificando cada entrada y aplicando umbrales de similitud coseno se pueden detectar duplicados o casi duplicados en bases de datos de productos, artículos o tickets.
- Clasificación de tickets de soporte: los embeddings sirven como entrada a un clasificador ligero (regresión logística o MLP) para enrutar incidencias por categoría, con la ventaja de requerir pocos datos etiquetados.
- Moderación y agrupación de contenido: agrupando embeddings de comentarios o publicaciones se pueden identificar conglomerados temáticos y detectar contenido repetitivo o coordinado.
- Extracción de características en pipelines Keras: al ser un modelo nativo de KerasHub, se puede insertar como capa en un modelo mayor y entrenar de extremo a extremo sobre JAX, TensorFlow o PyTorch sin conversión de pesos.
- Búsqueda multilingüe o cross-lingual: solo si el checkpoint subyacente fue entrenado con datos multilingües, extremo que la model card no confirma; debe validarse empíricamente antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, GLUE, STS, HumanEval ni ninguna otra evaluación, y la búsqueda web realizada no aporta resultados específicos de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 0,4-0,5 GB para los pesos, más el estado de activaciones, que depende del tamaño de lote y de la longitud de secuencia.
- En float16 o bfloat16 los pesos ocuparían aproximadamente 0,2 GB, aunque la model card no declara checkpoints en estas precisiones.
- Cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090), así como en CPU para cargas de baja concurrencia.
- Para alto throughput se recomiendan GPUs de centro de datos (A100, H100, L40S) con lotes grandes y longitudes de secuencia cercanas a 512.
- Opciones de despliegue: inferencia nativa con Keras 3 sobre JAX, TensorFlow o PyTorch; exportación a SavedModel o a formato de intercambio para servir con TF Serving o TorchServe; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo causal.
- Latencia y throughput estimados: no disponibles; dependen del backend, del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keras/all_mpnet_base_v2 | ~110 M (no declarado) | 512 | Embeddings | no disponible | Hugging Face (KerasHub) |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 384 | Embeddings | Apache 2.0 (según su model card pública) | Hugging Face, ampliamente adoptado |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 | Embeddings | Apache 2.0 (según su model card pública) | Hugging Face, muy extendido por su ligereza |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 | Embeddings | MIT (según su model card pública) | Hugging Face |

La comparación se basa en características públicas de modelos de la misma categoría; los datos de licencia y contexto de las alternativas provienen de sus respectivas model cards y no de la información proporcionada para este checkpoint. No se dispone de métricas comparativas de rendimiento para `keras/all_mpnet_base_v2`.

## Limitaciones y advertencias

- La model card ha sido generada automáticamente y no documenta sesgos, composición del dataset ni evaluaciones de seguridad; no hay garantías sobre el comportamiento en dominios sensibles.
- Al ser un encoder de embeddings, no genera texto ni mantiene conversaciones; no debe presentarse como un modelo de chat o de razonamiento.
- La ventana de contexto está limitada a 512 tokens; textos más largos deben truncarse o fragmentarse, lo que puede degradar la calidad de la representación.
- No se declaran los idiomas soportados; el uso en castellano u otras lenguas requiere validación empírica previa.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial sin consultar al autor o al repositorio original.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de representaciones poco fiables en dominios alejados de la distribución de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria; conviene contrastar los pesos con el checkpoint original de MPNet antes de adoptarlo en producción.
- No se documentan procesos de ajuste fino para similitud (por ejemplo, pares NLI o MS MARCO), por lo que los embeddings podrían no estar calibrados para búsqueda semántica sin un ajuste adicional.

## Enlaces

- Hugging Face: https://huggingface.co/keras/all_mpnet_base_v2
- Documentación de MPNet en KerasHub: https://keras.io/api/keras_hub/models/mp_net
- Documentación de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Wikipedia de Keras: https://en.wikipedia.org/wiki/Keras
