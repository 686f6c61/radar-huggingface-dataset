# Hooshaai/bert-lora-attention-sst2

## Resumen

`Hooshaai/bert-lora-attention-sst2` es un checkpoint de clasificación de sentimiento binaria (positivo/negativo) construido sobre `google-bert/bert-base-uncased` (110 M de parámetros) en el que el autor ha sustituido los bloques de atención softmax cuadrática estándar por un mecanismo denominado `lora_attention`, implementado en la librería NeuralOps (github.com/tahamajs/NeuralOps). El modelo se distribuye como pesos modulares de solo atención más la cabeza de clasificación, en FP16, con un tamaño de descarga de aproximadamente 55 MB; los pesos congelados de BERT base se reconstruyen en tiempo de carga desde el repositorio original de Google.

El entrenamiento se realizó mediante un protocolo de destilación de representaciones con caché offline (NeuralOps Cached Representation Distillation Protocol), en dos etapas: alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea. Según la model card, el proceso completo se ejecutó en una única NVIDIA RTX 3090 (24 GB) en 49,4 segundos, con 237 pasos de optimización y un pico de VRAM de 7873 MB.

El interés del checkpoint es acotado pero específico: sirve como referencia reproducible de atención subcuadrática (complejidad efectiva O(N) u O(N log N)) aplicada a una tarea GLUE estándar, con licencia MIT y un formato de pesos poco habitual (solo atención, FP16) que reduce el footprint de descarga frente a un fine-tuning completo de BERT. No es un modelo generativo ni un modelo de propósito general: es un clasificador de sentimiento en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención sustituida por `lora_attention` (subcuadrática) |
| Parámetros totales | 110 M (BERT-base); el repo solo publica pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, serialización `attention_only_fp16`) con code shim `modeling_neuralops_bert.py` |
| Librería | `neuralops` (requiere `trust_remote_code=True` en Transformers) |
| Tarea | Clasificación de texto (sentimiento binario, SST-2) |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluación | GLUE / SST-2 (split de validación, 872 muestras) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 24 GB |

## Arquitectura y entrenamiento

El modelo parte de BERT-base (12 capas, 110 M de parámetros, encoder transformer bidireccional) y reemplaza en las 12 capas el bloque de multi-head attention cuadrática por `lora_attention`, un mecanismo de la Attention Zoo de NeuralOps que el autor describe con complejidad operativa efectiva O(N) u O(N log N) frente a O(N²). Los pesos se serializan de forma modular: solo se publican los parámetros de atención entrenados y la cabeza de clasificación en FP16 (~55 MB), mientras que el resto del backbone se inicializa congelado desde `bert-base-uncased` al cargar el modelo mediante el shim remoto.

El entrenamiento siguió el protocolo de destilación con caché de representaciones del profesor (BERT-base fine-tuneado en SST-2), lo que evita mantener el teacher en VRAM durante el ajuste. Se ejecutaron 237 pasos en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea), con un throughput efectivo reportado de 39 339,6 tokens/s y un pico de 7873 MB de VRAM en una RTX 3090. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de GLUE/SST-2, ni si hubo RLHF o DPO (no aplica en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria en inglés (positivo/negativo) sobre texto de entrada.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`, o mediante la API `load_pretrained_bert` / `load_surgeried_model` de NeuralOps.
- Carga modular: reconstruye el backbone BERT-base congelado y aplica encima los pesos de atención destilados.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio ni modo thinking.
- Multilingüismo: no; solo inglés.
- No se documentan capacidades de clasificación más allá de SST-2 (no hay evidencia de generalización a otras tareas GLUE en la información disponible).

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: el modelo clasifica cada reseña como positiva o negativa; su tamaño reducido (55 MB de pesos modulares) permite desplegarlo en entornos con poco almacenamiento y cargarlo junto al backbone BERT-base.
- Moderación de comentarios en foros angloparlantes: filtrado previo de mensajes con polaridad negativa para revisión humana, aprovechando la baja latencia esperada de un clasificador de 110 M de parámetros.
- Enriquecimiento de pipelines de analítica de opinión: etiquetado por lotes de grandes volúmenes de texto (tuits, encuestas, tickets) en inglés, con throughput alto en GPU consumer.
- Investigación en mecanismos de atención eficiente: el checkpoint sirve como referencia reproducible para comparar `lora_attention` frente a atención cuadrática estándar en una tarea GLUE concreta, dado que el autor publica métricas de destilación y telemetría de entrenamiento.
- Evaluación de la librería NeuralOps: validar la API `load_pretrained_bert` y el flujo de pesos modulares en un proyecto real antes de adoptar la librería en producción.
- Baseline de clasificación en experimentos de destilación: punto de partida para probar protocolos de destilación con caché offline en hardware de gama consumer (RTX 3090), replicando el setup publicado.
- Detección de polaridad en encuestas y formularios abiertos en inglés: clasificación rápida de respuestas de texto libre para agregación automática de resultados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Teacher (`bert-base-uncased` fine-tuneado) | Student pre-KD (`lora_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 92,78 % | +1,15 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,2796 | — |

Telemetría de entrenamiento reportada por el autor:

| Métrica | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 24 GB |
| Duración del entrenamiento | 49,4 s |
| Pasos de optimización | 237 |
| Throughput efectivo | 39 339,6 tokens/s |
| Pico de VRAM | 7873 MB |

No se han publicado en la información disponible resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otras tareas GLUE), ni mediciones de latencia en inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de BERT-base (110 M de parámetros) más una cabeza de clasificación, la huella en FP16 es del orden de cientos de MB, pero no se confirma en la model card.
- GPU de entrenamiento reportada: NVIDIA GeForce RTX 3090 24 GB (pico de 7873 MB).
- Cabe en GPU consumer: sí, con alta probabilidad en cualquier GPU con varios GB de VRAM (RTX 3060 en adelante), aunque el dato exacto de inferencia no está publicado.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles; solo se publica throughput de entrenamiento (39 339,6 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-lora-attention-sst2` | 110 M (BERT-base) | no disponible | Clasificación SST-2 | MIT | Hugging Face, requiere `trust_remote_code` y librería `neuralops` |
| `tahamajs/bert-nystrom-attention-sst2` | 110 M (BERT-base) | no disponible | Clasificación SST-2 | no disponible en la información | Hugging Face (mismo autor, atención Nyström) |
| `google-bert/bert-base-uncased` fine-tuneado en SST-2 | 110 M | 512 tokens (típico) | Clasificación SST-2 | Apache 2.0 (modelo base) | Hugging Face, ecosistema estándar Transformers |

La comparación con alternativas de la misma categoría se limita a variantes del mismo autor en la Attention Zoo y al baseline BERT-base; no se dispone de datos de rendimiento de `bert-nystrom-attention-sst2` en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Tarea única: clasificación binaria de sentimiento en SST-2; no hay evidencia de generalización a otras tareas GLUE ni a dominios fuera de reseñas.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificaciones erróneas en textos con sarcasmo, negaciones complejas o dominio muy distinto al de SST-2.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-base, hereda los sesgos presentes en su corpus de preentrenamiento (no especificado en la información).
- Dependencia de código remoto: requiere `trust_remote_code=True` y la librería `neuralops`, lo que implica ejecutar código de terceros y añade riesgo de cadena de suministro en producción.
- Formato de pesos no estándar: solo se publican pesos de atención y cabeza; la carga depende del shim `modeling_neuralops_bert.py`, lo que puede romper la compatibilidad con herramientas estándar (vLLM, TGI, llama.cpp).
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del backbone `bert-base-uncased` (Apache 2.0) al redistribuir.
- Métricas reportadas por el propio autor, sin replicación independiente ni revisión por pares en la información disponible.
- Contexto máximo no confirmado en la model card; asumir el límite de BERT-base (512 tokens) es una extrapolación, no un dato publicado.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-lora-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Variante relacionada del mismo autor: `tahamajs/bert-nystrom-attention-sst2` (referenciada en los resultados de búsqueda de Hugging Face)
- Listado de modelos de clasificación de texto en Hugging Face: https://huggingface.co/models?pipeline_tag=text-classification
