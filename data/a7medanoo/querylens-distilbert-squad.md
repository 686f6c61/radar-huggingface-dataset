# a7medanoo/querylens-distilbert-squad

## Resumen

QueryLens es un modelo de question answering extractivo (QA) desarrollado por el usuario a7medanoo y publicado en Hugging Face. Se trata de un fine-tuning completo de `distilbert-base-uncased` sobre la totalidad del conjunto de entrenamiento de SQuAD v1.1 (87.599 ejemplos), con el objetivo de extraer el span exacto de respuesta a partir de un contexto y una pregunta en lenguaje natural. La arquitectura es un transformer encoder de tipo DistilBERT con cabeza de QA (`DistilBertForQuestionAnswering`), con 66.364.418 parámetros totales y una ventana de secuencia máxima de 384 tokens durante el entrenamiento.

El modelo resuelve el problema clásico de QA extractivo: dado un pasaje de referencia y una pregunta, localiza los índices de inicio y fin del fragmento que responde. Es relevante en escenarios de búsqueda documental, asistentes sobre corpus cerrados y pipelines de extracción de información donde se necesita una latencia baja y un consumo de recursos contenido, ya que DistilBERT es aproximadamente un 40 % más pequeño y rápido que BERT-base manteniendo una calidad cercana.

La ficha se basa exclusivamente en la información publicada por el autor en la model card y en los metadatos de Hugging Face. El modelo está etiquetado únicamente para inglés, con licencia Apache 2.0, y no cuenta con descargas ni likes en el momento de la consulta, lo que indica que es un artefacto reciente y sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DistilBERT (`DistilBertForQuestionAnswering`) |
| Parametros totales | 66.364.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (longitud máxima de secuencia usada en entrenamiento; stride de documento de 128) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no declarada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`; repo de 0.3 GB) |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, un transformer encoder destilado de BERT que reduce el número de capas y parámetros manteniendo el vocabulario y la arquitectura de atención original. Sobre esta base se añade la cabeza estándar de QA extractivo de Hugging Face, que proyecta las representaciones de cada token en dos logits (inicio y fin del span) y selecciona el par de índices con mayor puntuación compatible. El entrenamiento se realizó con PyTorch y la librería `transformers` sobre la partición completa de entrenamiento de SQuAD v1.1 (87.599 ejemplos), validando sobre las 10.570 muestras oficiales.

Los hiperparámetros declarados son: learning rate `3e-5` con warmup lineal y decay, optimizador AdamW con `weight_decay=0.01`, batch size efectivo de 32 (16 por dispositivo con 2 pasos de acumulación de gradiente), 2 épocas, longitud máxima de secuencia de 384 y `doc_stride` de 128 para el troceado de documentos largos. El entrenamiento se ejecutó en una NVIDIA GeForce RTX 3060 Laptop con 6 GB de VRAM usando precisión mixta FP16. No se declara uso de RLHF, DPO ni técnicas de alineación adicionales; es un fine-tuning supervisado clásico sobre el dataset.

## Capacidades

- Question answering extractivo: dado un contexto y una pregunta, devuelve el span exacto de respuesta junto con una puntuación de confianza y los índices de inicio y fin.
- Manejo de documentos largos mediante troceado con `doc_stride` de 128, lo que permite procesar pasajes que exceden los 384 tokens en varias ventanas solapadas.
- Inferencia en inglés exclusivamente, según la etiqueta de idioma declarada.
- Integración directa con el pipeline `question-answering` de `transformers`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- No es un modelo generativo: no produce texto libre, solo localiza spans dentro del contexto proporcionado.

## Casos de uso

- Búsqueda documental sobre corpus cerrados: el modelo recibe un fragmento de un manual, contrato o base de conocimiento y una pregunta del usuario, y devuelve el pasaje literal que responde. Su ventana de 384 tokens con stride de 128 permite encadenar ventanas sobre documentos más largos sin perder respuestas en los límites.
- Asistentes de atención al cliente sobre FAQs: integrado en un pipeline de recuperación previa (retrieval) que selecciona el documento relevante y luego usa QueryLens para extraer la respuesta exacta, reduciendo el riesgo de alucinación frente a modelos generativos.
- Extracción de información estructurada en pipelines de datos: localizar campos concretos (fechas, importes, nombres de entidades) en textos administrativos o financieros en inglés, con la ventaja de devolver índices de span que permiten reconstruir la evidencia.
- Enriquecimiento de motores de búsqueda internos: añadir una capa de respuesta directa sobre los resultados de búsqueda, mostrando el fragmento exacto que responde a la consulta del usuario en lugar de solo enlaces.
- Procesamiento por lotes en entornos con recursos limitados: con 66 M de parámetros y formato safetensors, puede ejecutarse en CPU o en GPUs de consumo para tareas de extracción masiva de respuestas sobre grandes volúmenes de documentos en inglés.
- Prototipado y evaluación de pipelines de QA: al ser un fine-tuning completo y reproducible sobre SQuAD v1.1 con hiperparámetros documentados, sirve como referencia base para comparar técnicas de troceado, cuantización o destilación adicional en proyectos de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre la partición oficial de validación de SQuAD v1.1 (10.570 muestras). Ninguno de los valores está verificado de forma independiente (`verified: false`).

| Modelo | Muestras de entrenamiento | Exact Match (EM) | F1 a nivel de token |
|---|---|---|---|
| QueryLens (fine-tuning completo) | 87.599 (completo) | 77,09 % | 85,25 % |
| DistilBERT preentrenado (checkpoint de referencia) | checkpoint de referencia | 79,10 % | 86,87 % |
| DistilBERT con subconjunto de 4k | 4.000 | 47,05 % | 57,42 % |

El dato más relevante es que el checkpoint preentrenado de referencia supera al modelo fine-tuneado en ambas métricas según la propia tabla del autor (79,10 % EM y 86,87 % F1 frente a 77,09 % y 85,25 %). Esto sugiere que el fine-tuning no ha mejorado la línea base declarada, un punto que conviene tener en cuenta antes de adoptar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (66 M de parámetros, aproximadamente 265 MB de pesos) y alrededor de 150 MB en FP16. La model card documenta el entrenamiento en una RTX 3060 Laptop con 6 GB de VRAM y precisión mixta FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. También es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en hardware integrado con suficiente memoria.
- Opciones de despliegue: pipeline `question-answering` de `transformers`, servidores de inferencia compatibles con modelos `transformers` (por ejemplo, Text Generation Inference no aplica por ser QA extractivo; sí aplica un servidor HTTP propio o `optimum` para exportación a ONNX). El tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face. No se declara soporte GGUF ni Ollama.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EM / F1 en SQuAD v1.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QueryLens (este modelo) | 66,4 M | 384 tokens | 77,09 / 85,25 (declarado, no verificado) | Apache 2.0 | Hugging Face |
| DistilBERT preentrenado (checkpoint de referencia) | ~66 M | 512 tokens (estándar BERT) | 79,10 / 86,87 (según la tabla del autor) | Apache 2.0 | Hugging Face |
| BERT-base fine-tuneado en SQuAD v1.1 | ~110 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| RoBERTa-base fine-tuneado en SQuAD v1.1 | ~125 M | 512 tokens | no disponible en la información proporcionada | MIT | Hugging Face |

La comparativa se limita a los datos aportados por el autor. No se dispone de resultados verificados de BERT-base ni RoBERTa-base en la información proporcionada, por lo que las celdas correspondientes se marcan como no disponibles.

## Limitaciones y advertencias

- Solo responde en inglés; no soporta consultas ni contextos en castellano u otros idiomas.
- Es un modelo extractivo: si la respuesta no está literalmente contenida en el contexto, no puede generarla y devolverá un span incorrecto o de baja confianza.
- Riesgo de alucinación estructural: aunque no genera texto libre, puede seleccionar spans que no responden a la pregunta cuando el contexto es ambiguo o la respuesta es implícita.
- El propio autor declara que el checkpoint preentrenado de referencia obtiene mejores métricas que este fine-tuning, lo que cuestiona la ganancia real del entrenamiento y aconseja validar el modelo en el dominio objetivo antes de usarlo en producción.
- Los resultados de benchmarks no están verificados de forma independiente (`verified: false`) y no hay descargas ni validación de la comunidad.
- Ventana de contexto de 384 tokens: los documentos largos requieren troceado con solapamiento, lo que puede fragmentar respuestas que cruzan límites si el stride no se ajusta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento (SQuAD v1.1) si se redistribuye el modelo.
- Sin soporte declarado de cuantización, GGUF ni Ollama; el despliegue está orientado a `transformers` y safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a7medanoo/querylens-distilbert-squad
- Dataset SQuAD v1.1: https://rajpurkar.github.io/SQuAD-explorer/
- Documentación de DistilBERT en `transformers`: https://huggingface.co/docs/transformers/model_doc/distilbert
- Pipeline de question answering de `transformers`: https://huggingface.co/docs/transformers/tasks/question_answering
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de SQuAD (Rajpurkar et al., 2016): https://arxiv.org/abs/1606.05250
