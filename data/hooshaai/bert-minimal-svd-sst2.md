# Hooshaai/bert-minimal-svd-sst2

## Resumen

`Hooshaai/bert-minimal-svd-sst2` es un checkpoint de clasificación de sentimiento binaria (SST-2) derivado de `google-bert/bert-base-uncased`. La particularidad es que las 12 capas del transformer original sustituyen su atención softmax cuadrática por el mecanismo `minimal_svd` de la librería NeuralOps, que promete complejidad subcuadrática (O(N) u O(N log N)) frente a la O(N²) de la multi-head attention estándar. El modelo se distribuye como pesos "attention-only" en FP16 (~55 MB) más una cabeza de clasificación, no como un checkpoint completo de 110M de parámetros.

El autor (Hooshaai, con código de referencia en el repositorio `tahamajs/NeuralOps`) ha aplicado un protocolo de destilación por representaciones en caché ("Cached Representation Distillation Protocol") con dos etapas: alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea. El resultado reportado es 90,02 % de accuracy en la partición de validación de SST-2 (872 muestras), frente al 91,63 % del profesor `bert-base-uncased` y un 51,38 % del estudiante antes de destilar.

Es relevante como pieza de evaluación de mecanismos de atención eficientes en BERT: el modelo demuestra que una atención subcuadrática puede recuperar casi todo el rendimiento del profesor en una tarea GLUE concreta tras destilación, aunque el alcance es limitado (una sola tarea, un solo idioma, sin pesos completos). No debe confundirse con un modelo generativo ni con un BERT completo listo para producción sin el código remoto de NeuralOps.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `minimal_svd` (subcuadrática) en las 12 capas |
| Parámetros totales | ~110M (base BERT); pesos publicados: solo atención + cabeza de clasificación (~55 MB FP16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | FP16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), carga vía `trust_remote_code=True` |

## Arquitectura y entrenamiento

Se parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 12 cabezas, ~110M de parámetros) y se reemplazan los bloques de self-attention softmax por el mecanismo `minimal_svd` de NeuralOps, que según la model card alcanza complejidad efectiva O(N) u O(N log N). El resto del encoder (embeddings, FFN, normalizaciones) permanece congelado y se inicializa desde el checkpoint original de BERT-base en tiempo de carga mediante un shim de código remoto (`modeling_neuralops_bert.py`). Solo se entrenan y serializan los pesos de atención y la cabeza de clasificación.

El entrenamiento usa el "NeuralOps Cached Representation Distillation Protocol": primero un alineamiento de subespacio oculto (etapa 1) y después una combinación de KL sobre logits del profesor y entropía cruzada de la tarea (etapa 2). Se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB con 230 pasos de optimización, 68,2 s de duración total, throughput de 27.612,9 tokens/s y pico de VRAM de 23.021 MB. El profesor no ocupa VRAM durante la destilación porque sus representaciones se cachean offline. El dataset es GLUE/SST-2; no se detalla el número exacto de tokens de entrenamiento ni la composición completa del corpus más allá de la tarea.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, específicamente la tarea SST-2 de GLUE.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `load_surgeried_model`.
- Atención subcuadrática que reduce el coste asintótico frente a la atención cuadrática de BERT-base.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador de secuencias.
- Capacidad multilingüe: no; solo inglés.
- No se documenta modo "thinking" ni capacidades especiales más allá de la sustitución de atención.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios: el modelo devuelve una etiqueta binaria por secuencia y puede integrarse en un pipeline de Transformers estándar con `AutoModelForSequenceClassification`.
- Filtrado de opiniones en moderación de contenido: usar la salida positiva/negativa como señal auxiliar para priorizar revisiones humanas en flujos de gran volumen.
- Evaluación comparativa de mecanismos de atención eficientes: sirve como referencia reproducible para medir la pérdida de accuracy al sustituir softmax por `minimal_svd` en BERT-base sobre SST-2.
- Investigación en destilación de conocimiento: el protocolo de dos etapas y las métricas de telemetría (pasos, throughput, VRAM) permiten replicar o comparar estrategias de KD con profesor cacheado.
- Prototipado de clasificadores ligeros: al publicar solo ~55 MB de pesos de atención, el coste de descarga y almacenamiento es bajo para experimentos en entornos con ancho de banda limitado.
- Benchmark de infraestructura: el modelo permite medir latencia y throughput de un encoder BERT con atención subcuadrática en GPUs consumer (RTX 3090) para comparar con la variante cuadrática.
- Docencia y demos de atención eficiente: ejemplo mínimo para explicar cómo se sustituye un bloque de atención y cómo se valida con una tarea GLUE concreta.

## Benchmarks y rendimiento

Evaluación reportada en la partición de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`minimal_svd`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,38 % | 90,02 % | +38,65 pp |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,3128 | convergido |

Telemetría de entrenamiento (RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración total | 68,2 s |
| Pasos de optimización | 230 |
| Throughput | 27.612,9 tokens/s |
| Pico de VRAM | 23.021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un BERT-base (~110M parámetros) en FP16, el checkpoint completo ronda los 220 MB y cabe holgadamente en GPUs consumer.
- Pesos descargados: ~55 MB (solo atención + cabeza); el resto se inicializa desde `bert-base-uncased`.
- GPU recomendadas: cualquier GPU con al menos ~1-2 GB de VRAM libre para FP16; el autor usó una RTX 3090 (24 GB) para el entrenamiento, no para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1660, RTX 2060, RTX 3060, RTX 4090 y similares; no confirmado con mediciones publicadas.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; API de NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles; solo se publica throughput de entrenamiento (27.612,9 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-minimal-svd-sst2` | ~110M (pesos publicados ~55 MB) | no disponible | 90,02 % (validación) | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63 % (validación, según la model card) | Apache 2.0 | Hugging Face, estándar |
| BERT-base fine-tuned en SST-2 (referencia GLUE) | 110M | 512 tokens | ~92-93 % (referencia pública GLUE, no verificada aquí) | Apache 2.0 | Hugging Face |
| Otros modelos de atención eficiente en BERT | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al profesor y a la referencia pública de BERT-base en SST-2; no se dispone de datos de otros mecanismos de atención subcuadrática en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés (SST-2); no es un modelo generativo ni un encoder de propósito general.
- El accuracy de 90,02 % es inferior al 91,63 % del profesor; la sustitución de atención introduce una pérdida medible.
- La evaluación se hizo sobre 872 muestras de validación de SST-2; no hay validación en otros dominios ni en test ciego.
- Requiere `trust_remote_code=True` y la librería NeuralOps; el shim de código remoto ejecuta código del autor, lo que implica un riesgo de seguridad en entornos de producción.
- Los pesos publicados son solo de atención y cabeza; sin la inicialización desde `bert-base-uncased` el modelo no funciona.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de SST-2 (reseñas de producto, tuits, etc.).
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de películas), no auditados en la model card.
- Licencia MIT permite uso comercial, pero la dependencia de `bert-base-uncased` (Apache 2.0) y de NeuralOps debe verificarse por separado.
- No se documentan cuantizaciones alternativas (GGUF, INT8, etc.) ni soporte para servidores de inferencia estándar.
- El repositorio tiene 74 descargas y 1 like en el momento de la consulta; es un artefacto de investigación, no un modelo con validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-minimal-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
