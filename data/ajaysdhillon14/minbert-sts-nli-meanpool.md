# ajaysdhillon14/minbert-sts-nli-meanpool

## Resumen

`minbert-sts-nli-meanpool` es un modelo de similitud semántica textual desarrollado por el autor `ajaysdhillon14`, basado en el encoder `bert-base-uncased`. Está diseñado para calcular la similitud entre dos frases mediante embeddings de oraciones y puntuaciones de similitud en una escala de 0 a 5, siguiendo el estilo de la tarea STS-B. Combina un preentrenamiento de siamese en NLI sobre SNLI + MultiNLI (`942 069` pares de entrenamiento) con un ajuste fino posterior en el conjunto de entrenamiento de STS, lo que permite separar la semántica de la similitud léxica.

Con `109 482 752` parámetros totales, es un modelo de tamaño contenido, con una ventana de contexto estándar de BERT de `512` tokens, y se distribuye bajo licencia `Apache-2.0`. Está pensado para tareas como búsqueda semántica, detección de duplicados o recuperación en pipelines de RAG, y puede ejecutarse en hardware modesto, incluida una CPU. Su relevancia radica en aportar una solución de embeddings de oraciones ligera y fácilmente reproducible, con un informe técnico detallado en el repositorio del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) |
| Parametros totales | 109 482 752 |
| Parametros activos | No procede (no es MoE) |
| Longitud de contexto | 512 tokens (estándar de `bert-base-uncased`) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en `safetensors` sin cuantizar) |
| Idiomas soportados | No disponible; el modelo base es `bert-base-uncased`, entrenado en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer basado en `bert-base-uncased`, sin ninguna cabeza de clasificación adicional. La representación de una frase se obtiene mediante *masked mean pooling* sobre la salida de la última capa (`last_hidden_state`), incluyendo las posiciones `[CLS]` y `[SEP]`. La similitud entre dos frases se calcula como el coseno entre los dos vectores, y posteriormente se reescala de `[-1, 1]` a `[0, 5]` mediante la fórmula `(cosine_similarity + 1) * 2.5`. Esta estrategia de pooling se eligió tras una búsqueda que mostró que el mean pooling superaba a la representación `[CLS]` en todas las capas evaluadas.

El entrenamiento se realizó en dos etapas. Primero, el bi-encoder se entrenó como un siamese encoder de oraciones en la tarea de implicación textual sobre SNLI + MultiNLI, lo que le proporciona una base sólida para distinguir relaciones semánticas. Después, se ajustó con el conjunto de entrenamiento de STS, configurando una tasa de aprendizaje de `5e-6`, batch de `32`, *warmup* lineal de `100` pasos, *weight decay* de `0.05` y *dropout* de `0.2`, durante un máximo de `4` épocas con *early stopping* de paciencia `2`. Todas las capas del encoder se dejaron libres durante el ajuste fino. No se mencionan técnicas de RLHF ni DPO.

## Capacidades

- Generación de texto: no generativo, no produce texto. Solo genera representaciones vectoriales de oraciones.
- Razonamiento: no realiza razonamiento simbólico ni aritmético; se limita a la semejanza semántica.
- Código: no tiene capacidades específicas para código.
- Matemáticas: no.
- Visión: no.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: no declaradas; por su base `bert-base-uncased`, se espera que funcione principalmente en inglés.
- Capacidad especial: similitud semántica de frases mediante embeddings de sentencias con *mean pooling* y coseno reescalado a `[0, 5]`. La similitud es directa, sin cabeza aprendida, lo que facilita la reproducción y la integración con cargadores estándar de BERT.

## Casos de uso

- **Búsqueda semántica en documentación corporativa**: se pueden indexar las oraciones de una base documental con los embeddings generados por este modelo y, dado un *query* en lenguaje natural, calcular la similitud coseno para recuperar los pasajes más relevantes.
- **Recuperación aumentada generativa (RAG)**: el modelo puede actuar como componente de *reranking* o de *embedding* inicial en un pipeline RAG, seleccionando los fragmentos de contexto más cercanos semánticamente a la pregunta antes de pasarlos a un LLM generativo.
- **Detección de duplicados en tickets de soporte**: comparando la similitud entre tickets entrantes y tickets ya resueltos, se pueden identificar incidencias repetidas y enlazarlas, siempre que la ventana de `512` tokens sea suficiente para los textos.
- **Clasificación por similitud de preguntas frecuentes (FAQ)**: las preguntas de los usuarios pueden compararse con una lista de preguntas de referencia para seleccionar la respuesta más adecuada, sin necesidad de entrenar un clasificador adicional.
- **Moderación de contenido**: se puede utilizar para comparar textos nuevos con ejemplos etiquetados de contenido inapropiado y así detectar contenidos semánticamente afines a categorías concretas.
- **Enriquecimiento de pipelines de NLP**: los embeddings de oraciones pueden alimentar técnicas de clustering o etiquetado, consiguiendo agrupar textos por afinidad semántica para posterior análisis humano.

## Benchmarks y rendimiento

Los resultados presentados en el repositorio se refieren al conjunto de desarrollo de STS-B. No se ofrecen comparativas con otros modelos en la información disponible.

| Semilla | Pearson | Spearman |
|---|---|---|
| 11711 | 0.7432 | 0.7457 |
| 2026 | 0.7436 | 0.7460 |
| 42 | 0.7388 | 0.7411 |
| **Media (n=3)** | **0.7419** | **0.7443** El checkpoint publicado con semilla `11711` logra un Pearson de `0.7432` y un Spearman de `0.7457`.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en FP16, el modelo ocupa aproximadamente `220 MB`; en FP32, alrededor de `440 MB`. Sumando activaciones y overhead, se puede ejecutar en GPUs con `2 GB` de VRAM para secuencias cortas, y con `4 GB` para ser más conservador.
- **GPU recomendadas**: cualquier GPU moderna con al menos `4 GB`, como una `NVIDIA GTX 1650`, `RTX 2060`, `RTX 3050` o superior. También es viable una `A100` o `H100` para procesado por lotes masivo.
- **CPU**: el modelo puede ejecutarse en CPU con `2 GB` de RAM libre, aunque la latencia será mayor que en GPU.
- **Opciones de despliegue**: se puede servir con Hugging Face Transformers en PyTorch, mediante la librería `sentence-transformers` (si se replican las convenciones de pooling y rescaling) o con ONNX Runtime para inferencia optimizada.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye benchmarks comparativos de `minbert-sts-nli-meanpool` con otros modelos de similitud semántica de la misma categoría, por lo que no es posible ofrecer una tabla comparativa ni una lista de alternativas verificadas.

## Limitaciones y advertencias

- Sesgos conocidos: la representación semántica puede arrastrar sesgos presentes en SNLI y MultiNLI, como sesgos de género o de contexto cultural, trasladables a la similitud calculada.
- Riesgo de alucinación: no aplica de forma directa porque el modelo no genera texto; sin embargo, al evaluar similitud entre frases muy distintas puede devolver puntuaciones que no reflejan una relación semántica real.
- Limitaciones de contexto o idioma: la ventana es de `512` tokens, por lo que no puede procesar documentos largos. Además, al estar basado en `bert-base-uncased`, su rendimiento fuera del inglés es incierto.
- Restricciones de licencia: licencia `Apache-2.0`, que permite uso comercial con la condición de incluir el aviso de licencia correspondiente.
- Caveat de producción: la puntuación de similitud está reescalada de `[-1, 1]` a `[0, 5]`; en integraciones con otros sistemas hay que asegurarse de usar este mismo rescalado para mantener coherencia con sus salidas.
- El repositorio publica únicamente el encoder, sin una cabeza de clasificación; cualquier integración que espere un clasificador estándar deberá adaptar el código de pooling y coseno.

## Enlaces

- Hugging Face: https://huggingface.co/ajaysdhillon14/minbert-sts-nli-meanpool
- Repositorio del proyecto (dnlp): https://github.com/nirish2407/dnlp
