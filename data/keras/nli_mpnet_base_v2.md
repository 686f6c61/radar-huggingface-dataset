# keras/nli_mpnet_base_v2

## Resumen

`keras/nli_mpnet_base_v2` es un modelo MPNet empaquetado y distribuido a través de KerasHub, la librería de modelos preentrenados de Keras. El autor del repositorio es la organización oficial de Keras y el artefacto se publica con la etiqueta `keras-hub`, lo que implica que está pensado para cargarse con la API de KerasHub y ejecutarse indistintamente sobre los backends JAX, TensorFlow o PyTorch. El sufijo `nli` del identificador sugiere un ajuste fino para inferencia de lenguaje natural (Natural Language Inference), aunque la model card no documenta explícitamente dicho ajuste.

Arquitectónicamente se trata de un transformer encoder de tipo MPNet (Masked and Permuted Pre-training for Language Understanding), con 12 capas, 12 cabezas de atención, dimensión oculta de 768 y dimensión intermedia de 3072, lo que sitúa el modelo en la horquilla de ~110 millones de parámetros, el tamaño habitual de la familia BERT-base. El vocabulario es de 30.527 tokens y la longitud máxima de secuencia es de 512 tokens, coherente con los modelos de embeddings de frase de la generación BERT.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, la model card es autogenerada y no aporta información sobre datos de entrenamiento, evaluación o licencia. Se trata, por tanto, de un artefacto técnico de infraestructura (un checkpoint convertible y portable entre backends) más que de un modelo con documentación de producto. Esta ficha refleja esa realidad y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder con preentrenamiento enmascarado y permutado) |
| Parametros totales | ~110 M (estimado a partir de 12 capas, hidden 768, intermediate 3072, vocab 30527) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_sequence_length: 512`) |
| Tipos de cuantizacion | no disponible (el config declara `float32`; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos Keras (`keras-hub`), compatible con backends JAX, TensorFlow y PyTorch |
| Tamano del repositorio | 0,4 GB |
| Vocabulario | 30.527 tokens |
| Capas / cabezas | 12 capas / 12 cabezas de atencion |
| Dimension oculta / intermedia | 768 / 3072 |
| Dropout | 0,1 |
| Epsilon de layer norm | 1e-05 |
| Tarea declarada | `TextEmbedder` (embeddings de texto) |

## Arquitectura y entrenamiento

El modelo es un MPNet, una variante de transformer encoder que combina las ideas del enmascaramiento tipo BERT con la permutación de posiciones tipo XLNet. La innovación central de MPNet es que predice tokens enmascarados condicionando sobre el resto de tokens en un orden permutado, lo que evita la discrepancia entre preentrenamiento y ajuste fino que arrastra BERT (donde el token `[MASK]` no aparece nunca en la fase supervisada). El backbone aquí expuesto tiene 12 capas, 12 cabezas, hidden de 768 y FFN de 3072, con dropout de 0,1 y epsilon de 1e-05 en layer norm.

No hay información publicada sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni sobre si se aplicó RLHF, DPO o algún ajuste supervisado adicional. El sufijo `nli` del identificador apunta a un ajuste para clasificación de pares de frases (entailment/neutral/contradiction), pero la model card autogenerada no lo confirma ni detalla hiperparámetros, epochs ni métricas de validación. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; el modelo es un encoder estándar orientado a producir embeddings.

## Capacidades

- Generación de embeddings de texto: la tarea declarada es `TextEmbedder`, por lo que el uso previsto es producir representaciones vectoriales de frases o documentos, no generar texto autoregresivamente.
- Clasificación de pares de frases (presunto ajuste NLI): si el sufijo `nli` corresponde a un fine-tuning para inferencia de lenguaje natural, el modelo puede clasificar relaciones de implicación, neutralidad y contradicción entre dos textos.
- Similitud semántica y recuperación: los embeddings de 768 dimensiones son adecuados para búsqueda semántica, clustering y deduplicación de textos.
- Multilingüismo: no disponible; no se declara cobertura de idiomas.
- Tool calling / function calling: no disponible; no es una capacidad propia de este tipo de encoder.
- Razonamiento multi-paso o modo "thinking": no disponible; no aplica a un encoder de embeddings.
- Capacidades multimodales (visión, audio): no disponibles.
- Portabilidad entre backends: puede ejecutarse con JAX, TensorFlow y PyTorch a través de KerasHub, lo que es una capacidad de despliegue más que funcional.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de hasta 512 tokens con los embeddings del modelo y usar similitud coseno para recuperar pasajes relevantes en un motor de búsqueda interno; el tamaño de 110 M parámetros permite indexar corpus grandes con coste de cómputo moderado.
- Deduplicación de registros y catálogos: generar embeddings de descripciones de producto o tickets y agrupar por similitud para detectar duplicados; la ventana de 512 tokens cubre descripciones típicas sin truncamiento agresivo.
- Clasificación de pares de frases en pipelines de moderación o verificación: si el ajuste NLI está confirmado, se puede usar para etiquetar pares pregunta-respuesta como consistentes o contradictorios en un sistema de control de calidad de FAQ.
- Filtrado previo en sistemas RAG: usar el modelo como retriever de primera etapa (bi-encoder) antes de un reranker más costoso, aprovechando su reducido tamaño y su compatibilidad con JAX/TensorFlow/PyTorch según el stack existente.
- Clustering de tickets de soporte: agrupar consultas de clientes por temática para enrutamiento automático, con embeddings de frase generados en lote sobre GPU consumer.
- Evaluación de similitud en investigación: como baseline reproducible en experimentos de representación de frases, al estar empaquetado en KerasHub y ser cargable con una sola llamada de API.
- Extracción de características para modelos downstream: congelar el encoder y entrenar una cabeza de clasificación ligera para tareas específicas de dominio con pocos datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es autogenerada y no incluye métricas de MMLU, GLUE, MNLI, STS-B ni de ningún otro conjunto de evaluación. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,44 GB solo para pesos (110 M parámetros × 4 bytes), más activaciones; en la práctica, menos de 2 GB para batches pequeños con secuencias de 512 tokens.
- VRAM estimada en cuantización INT8: ~0,11 GB de pesos; no se documentan checkpoints cuantizados oficiales, por lo que habría que generarlos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con batches amplios. Para indexación a gran escala, una A100 o H100 aporta throughput, pero no es necesaria por capacidad de memoria.
- Cabe en GPU consumer: sí, con holgura; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: KerasHub con backends JAX, TensorFlow o PyTorch; exportación a SavedModel o a formato PyTorch para servirlo con TorchServe o similares. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos y no a encoders de embeddings.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `keras/nli_mpnet_base_v2` | ~110 M | 512 | Embeddings / NLI (presunto) | no disponible | KerasHub |
| `sentence-transformers/all-mpnet-base-v2` | ~109 M | 384 | Embeddings de frase | Apache 2.0 (según su model card pública) | Hugging Face, ampliamente usado |
| `google-bert/bert-base-uncased` | ~110 M | 512 | Encoder MLM | Apache 2.0 | Hugging Face |
| `FacebookAI/roberta-base` | ~125 M | 512 | Encoder MLM | MIT | Hugging Face |

La comparación se limita a la arquitectura y al tamaño, porque el repositorio analizado no publica métricas que permitan contrastar rendimiento. Frente a `all-mpnet-base-v2`, el modelo de KerasHub ofrece portabilidad multi-backend pero carece de la documentación de evaluación y de la licencia explícita del primero.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido; en producción hay que tratar el modelo como no licenciado hasta confirmarlo con el autor.
- Model card autogenerada: no hay información sobre datos de entrenamiento, sesgos, evaluación ni limitaciones conocidas por el autor.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validación externa.
- Ventana de contexto de 512 tokens: insuficiente para documentos largos; requiere troceado previo.
- Riesgo de alucinación: no aplica en sentido estricto al ser un encoder, pero los embeddings pueden producir similitudes espurias en dominios alejados del entrenamiento.
- Idiomas: no declarados; no se puede asumir cobertura multilingüe.
- El sufijo `nli` no está confirmado por la documentación: si se usa para clasificación de pares, conviene validar el comportamiento con un conjunto propio antes de desplegarlo.
- No hay checkpoints cuantizados ni formato GGUF: el despliegue en entornos sin Keras requiere conversión manual.
- Fecha de creación del repositorio en 2026: conviene verificar que el artefacto no sea un placeholder o una publicación de prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keras/nli_mpnet_base_v2
- Documentación de MPNet en KerasHub: https://keras.io/api/keras_hub/models/mp_net
- Documentación de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Keras en Wikipedia: https://en.wikipedia.org/wiki/Keras
- Keras en Wikipedia (francés): https://fr.wikipedia.org/wiki/Keras
- Introducción a Keras en GeeksforGeeks: https://www.geeksforgeeks.org/deep-learning/what-is-keras/
- Documentación de model cards de Hugging Face: https://huggingface.co/docs/hub/model-cards
