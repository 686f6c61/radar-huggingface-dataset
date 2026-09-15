# S12-24/sentiment-versioning-demo

## Resumen

`sentiment-versioning-demo` es un modelo de clasificación de texto publicado por el usuario S12-24 en HuggingFace. Se trata de un ajuste fino (fine-tuning) de `distilbert-base-uncased`, la versión destilada de BERT-base, sobre un conjunto de datos que el propio autor no especifica en la model card. El repositorio contiene 66.955.010 parámetros en formato safetensors, con licencia Apache 2.0 y pipeline declarado `text-classification`.

Por el nombre del repositorio, todo apunta a que se trata de un artefacto de demostración orientado a flujos de versionado de modelos (por ejemplo, comparar versiones de un clasificador de sentimiento en un registro de modelos o en un pipeline de MLOps), más que a un modelo pensado para producción directa. La model card está generada automáticamente por el `Trainer` de Transformers y no aporta descripción, dataset ni limitaciones: todos esos campos figuran como "More information needed".

Su relevancia es, por tanto, limitada y de carácter ilustrativo: sirve como ejemplo de fine-tuning ligero (una sola época) de una arquitectura encoder de 67M de parámetros, ejecutable en CPU o en cualquier GPU de consumo, y con métricas de validación declaradas (accuracy 0,854) pero sin benchmarks oficiales publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, heredada de `distilbert-base-uncased`) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de `distilbert-base-uncased`; no declarada por el autor) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay GGUF ni ONNX publicados) |
| Idiomas soportados | no disponible (el modelo base es `uncased` y de corpus principalmente en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | text-classification |
| Modelo base | distilbert-base-uncased |
| Tamaño del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con 768 dimensiones ocultas y 12 cabezas de atención, obtenido mediante destilación del conocimiento de BERT-base original. Al ser un modelo `uncased`, el tokenizador es WordPiece con vocabulario de 30.522 tokens y normaliza el texto a minúsculas. El modelo hereda la cabeza de clasificación de secuencia, con una capa lineal sobre la representación del token `[CLS]`; el número de etiquetas de salida no se especifica en la información disponible.

Los hiperparámetros de entrenamiento sí están documentados en la model card: 1 época, `learning_rate` 2e-05, `train_batch_size` 16, `eval_batch_size` 32, semilla 42, optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08, y planificador lineal. No se indica el dataset de entrenamiento (figura literalmente como "unknown dataset"), ni el número de tokens, ni si hubo RLHF/DPO (no tendría sentido en un clasificador). Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de texto (pipeline `text-classification`), presumiblemente de sentimiento por el nombre del repositorio; el número y las etiquetas de clase no están documentados.
- Extracción de representaciones: al ser un encoder tipo BERT, puede usarse como backbone de embeddings, y el tag `text-embeddings-inference` indica que es servible con Text Embeddings Inference.
- Inferencia en CPU: con 67M de parámetros, el coste computacional es bajo y no requiere GPU.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en HuggingFace Inference Endpoints.
- Generación de texto: no. Es un modelo exclusivamente de clasificación, no tiene cabeza de lenguaje.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no declaradas; el modelo base está entrenado principalmente con corpus en inglés.
- Capacidades especiales (visión, audio, modo thinking): ninguna.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo recibe una reseña de hasta 512 tokens y devuelve una etiqueta de polaridad; es adecuado por su bajo coste y latencia en CPU, aunque requiere validar antes el número y el significado de las etiquetas.
- Monitorización de menciones en redes sociales: procesar grandes volúmenes de texto corto en lotes con `batch_size` alto (el entrenamiento usó 16 y la evaluación 32, lo que sugiere lotes de ese orden son viables) para agregar tendencias de opinión.
- Triaje automático de tickets de soporte: clasificar la queja del usuario como positiva o negativa para priorizar colas de atención, integrándolo como microservicio vía Text Embeddings Inference o Inference Endpoints.
- Cuadros de mando de voz del cliente: alimentar un almacén de datos con la etiqueta predicha por documento para calcular series temporales de satisfacción sobre encuestas y formularios abiertos.
- Señal auxiliar en moderación de contenido: usar la polaridad como una característica más dentro de un pipeline de moderación, nunca como decisión única, dado que el modelo no fue entrenado para detectar toxicidad.
- Experimentación y docencia en MLOps: dado que el nombre apunta a "versioning demo", es útil como artefacto de ejemplo para practicar el versionado de modelos, la comparación de métricas entre versiones y el despliegue reproducible con Transformers.
- Prueba de concepto de clasificación antes de invertir en un modelo mayor: al ser un fine-tuning de 67M de parámetros entrenado en 1 época, sirve para validar rápidamente si una tarea de clasificación es viable antes de escalar a un encoder mayor (RoBERTa, DeBERTa).

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío (`results: []`), por lo que no hay resultados de benchmarks publicados (MMLU, GLUE, SST-2 u otros). Los únicos datos numéricos disponibles son las métricas de validación del propio entrenamiento, declaradas por el autor:

| Métrica | Valor | Época | Paso |
|---|---|---|---|
| Validation loss | 0,3502 | 1,0 | 125 |
| Accuracy | 0,854 | 1,0 | 125 |
| Training loss | No log | 1,0 | 125 |

Estos valores corresponden a un conjunto de validación no identificado (el dataset es "unknown"), por lo que no son comparables con benchmarks públicos de clasificación de sentimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,27 GB para los pesos en fp32 y 0,13 GB en fp16; con activaciones y overhead de runtime, el consumo realista se sitúa en torno a 1-2 GB.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; no se requiere A100 ni H100. Una GTX 1650, RTX 3050, RTX 4090 o incluso una T4 son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos diez años, y también en CPU (inferencia viable por el tamaño de 67M de parámetros).
- Opciones de despliegue: Transformers con PyTorch, HuggingFace Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag `text-embeddings-inference`), ONNX Runtime mediante exportación manual, FastAPI o servicios similares. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían conversión previa.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de tokens por segundo (en un clasificador, documentos por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `S12-24/sentiment-versioning-demo` | 66.955.010 | 512 tokens (heredado) | apache-2.0 | HuggingFace, 0 descargas | Dataset y etiquetas no documentados; accuracy de validación 0,854 sobre conjunto desconocido |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67M | 512 tokens | apache-2.0 | HuggingFace, ampliamente usado | Alternativa directa para sentimiento binario; su rendimiento estándar en SST-2 es muy superior en validación pública, pero no hay datos de benchmark en la información proporcionada |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125M | 512 tokens | no disponible en esta información | HuggingFace | Encoder mayor orientado a texto de redes sociales; más costoso en CPU |
| `bert-base-uncased` (fine-tune propio) | 110M | 512 tokens | apache-2.0 | HuggingFace | Referencia general; más parámetros que DistilBERT y sin la ventaja de latencia de la destilación |

No se dispone de datos de rendimiento comparables entre estas alternativas dentro de la información proporcionada; las diferencias indicadas se limitan a tamaño, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "on an unknown dataset". No se puede saber qué dominio, idioma, idioma de origen ni balance de clases se usó, lo que invalida cualquier garantía de generalización.
- Etiquetas no documentadas: no se especifica el número de clases ni su significado (¿positivo/negativo? ¿estrellas? ¿tres clases?). Es imprescindible inspeccionar `config.json` e `id2label` antes de cualquier uso.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios alejados del conjunto de entrenamiento.
- Sesgos: al derivar de `distilbert-base-uncased`, hereda los sesgos de los corpus web en inglés utilizados para preentrenar BERT; no hay evaluación de sesgos en la información disponible.
- Idiomas: no declarados. El modelo base es `uncased` y de entrenamiento predominantemente inglés; el uso en castellano no está validado.
- Limitación de contexto: 512 tokens máximo (heredado del modelo base); documentos más largos requieren truncado o segmentación.
- Licencia: Apache 2.0, que permite uso comercial y modificación, con la obligación habitual de conservar el aviso de licencia. Al derivar de `distilbert-base-uncased` (también Apache 2.0), no hay restricciones adicionales conocidas.
- Métricas poco fiables: la accuracy de 0,854 procede de un único punto de evaluación tras 1 época, sin intervalos de confianza ni validación cruzada; con 125 pasos de entrenamiento, el resultado puede ser inestable.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento posterior ni issues documentadas.
- Para producción: no se recomienda su uso directo sin reentrenamiento y evaluación sobre un conjunto propio etiquetado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/S12-24/sentiment-versioning-demo
- Modelo base: https://huggingface.co/distilbert-base-uncased

No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
