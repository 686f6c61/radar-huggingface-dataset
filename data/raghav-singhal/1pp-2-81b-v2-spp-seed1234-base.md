# Raghav-Singhal/1pp-2.81b-v2-spp-seed1234-base

## Resumen

El modelo `1pp-2.81b-v2-spp-seed1234-base` es un modelo de lenguaje base de 2.807.704.704 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de la variante SPP{T0} de la escalera de escalado 1PP, una reproducción del baseline del artículo SPP sobre el corpus crudo de 1PP (documentos DCLM-edu originales), con semilla 1234. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la inserción de reflexiones en primera persona durante el preentrenamiento.

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade dos tokens especiales: `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153).

Su relevancia es metodológica: permite comparar directamente el efecto de la condición SPP{T0} frente al modelo crudo equivalente (`1pp-2.81b-v2-raw-seed1234-base`), ya que ambos leen exactamente los mismos documentos en el mismo orden, durante el mismo número de pasos y con el mismo schedule. El modelo se entrenó sobre 53.709 pasos (112,64B posiciones de token) con atención enmascarada entre documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, sin biases, sin QK-norm) |
| Parametros totales | 2.807.704.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder de tipo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (GQA con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos y sin QK-norm. La secuencia de entrenamiento es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (49152) y el marcador `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento consistió en 53.709 pasos sobre el flujo alineado por pasos del modelo crudo (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La innovación metodológica central de la condición SPP{T0} es que 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte más un número igual de documentos no marcados aleatorios) llevan una reflexión en primera persona generada por el modelo de reflexión SPP{T0}, insertada en una posición elegida por ese modelo: el marcador `<assistant>`, la reflexión (máximo 256 tokens) y el resto del documento. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y el texto posterior a una reflexión no puede atenderla (máscara de atención de SPP), de modo que el documento se modela como si la reflexión estuviera ausente. El clasificador de seguridad marcó 3.869.498 documentos (4,6%) con puntuación máxima de chunk de al menos 3. Los tokens añadidos desplazan algunos documentos uno o dos pasos respecto al run crudo; 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto base: el modelo produce texto plano; no es un asistente entrenado con instrucciones.
- Generación de reflexiones: al añadir el marcador `<assistant>` (id 49153) tras el texto de un documento, el modelo escribe una reflexión en primera persona. No hay token que marque el final de una reflexión.
- Formato de chat SPP: la plantilla de chat incluida en `tokenizer_config.json` y `chat_template.jinja` renderiza el formato `<|im_start|>user\n{message}<|im_end|>\n<|im_start|><assistant>{reply}<|im_end|>\n`, sin turno de sistema. La generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Modelado de lenguaje condicionado a documento: entrenado con enmascaramiento de atención entre documentos y con la máscara SPP, de modo que el texto posterior a una reflexión no la atiende.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; es un modelo base sin entrenamiento de instrucciones.
- Visión o audio: no disponible.

## Casos de uso

- Investigación sobre preentrenamiento con reflexiones: el modelo permite reproducir y comparar la condición SPP{T0} frente al modelo crudo `1pp-2.81b-v2-raw-seed1234-base`, ya que ambos consumen los mismos documentos en el mismo orden y con el mismo schedule. Es su uso principal como artefacto de investigación.
- Estudio de la máscara de atención SPP: sirve para analizar cómo afecta que el texto posterior a una reflexión no pueda atenderla, comparando la pérdida de validación por token (2,306 en texto de documento, 2,358 en texto de asistente, 2,424 en texto de usuario) con la del run crudo.
- Generación de reflexiones en primera persona sobre documentos: introduciendo `<assistant>` tras el texto de un documento se obtiene una reflexión de hasta 256 tokens, útil para experimentos de aumento de datos o de anotación automática.
- Evaluación de clasificadores de seguridad en corpus: el modelo se entrenó sobre un corpus filtrado por un clasificador gte que marcó el 4,6% de los documentos, por lo que sirve como base para estudiar el impacto del filtrado en el preentrenamiento.
- Base para fine-tuning posterior: al ser un modelo base de 2,81B parámetros con licencia Apache 2.0 y pesos en safetensors, puede servir de inicialización para SFT o para experimentos de alineación, como los modelos SFT del mismo proyecto.
- Reproducibilidad de la escalera de escalado 1PP: permite verificar los resultados de la ladder a 2,81B con semilla 1234 y contrastar la pérdida de validación con la referencia de Megatron (diferencias absolutas de 0,0019 y 0,0018 en los conjuntos val50m y raw_val50m).
- Experimentos de formato de chat: la plantilla incluida permite probar el formato SPP con prompts que coincidan con los de los modelos SFT del proyecto, aunque el modelo base produce texto plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card solo reporta pérdidas de validación por token del checkpoint final:

| Conjunto | Pérdida por token |
|---|---|
| Texto de documento | 2,306 |
| Texto de asistente | 2,358 |
| Texto de usuario | 2,424 |

Verificación de los pesos de Hugging Face frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,3563 | 2,3582 | 0,0019 |
| raw_val50m segments [8] | 2,3075 | 2,3057 | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para los pesos (tamaño del repo), más memoria para activaciones y caché KV; en la práctica, entre 7 y 10 GB según longitud de contexto y batch.
- Cuantización: la model card no publica versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que no hay cifras oficiales de VRAM para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: una GPU consumer con 12-16 GB (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) debería poder alojar los pesos en bf16 o fp16; para contexto completo de 4.096 tokens y batches mayores se recomiendan GPUs de 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en modelos con al menos 12 GB de VRAM para inferencia en precisión completa; con cuantización a 8 bits cabría en GPUs de 8 GB, aunque no hay artefactos publicados.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explícita más allá del tag.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-spp-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Condición SPP{T0} sobre corpus 1PP |
| 1pp-2.81b-v2-raw-seed1234-base | 2,81B (no confirmado en la información) | 4.096 (no confirmado) | no disponible | Hugging Face | Run crudo de referencia del mismo proyecto, mismos documentos y schedule |
| SmolLM2 (familia) | no disponible | no disponible | no disponible | no disponible | Solo se cita su vocabulario (49.152 tokens) como base del tokenizador; no se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un modelo base entrenado sobre documentos y produce texto plano; la plantilla de chat existe solo para que los prompts coincidan con los modelos SFT del proyecto.
- El texto posterior a una reflexión no puede atenderla durante el entrenamiento (máscara de atención SPP), pero la atención causal estándar de Hugging Face sí permite que el texto posterior vea la reflexión, lo que genera una discrepancia entre entrenamiento e inferencia.
- El marcador `<assistant>` no tiene token de cierre para las reflexiones; no hay forma nativa de delimitar el final de una reflexión generada.
- El clasificador de seguridad basado en gte marcó 3.869.498 documentos (4,6%) con puntuación máxima de chunk de al menos 3; el modelo se entrenó sobre un corpus filtrado, lo que puede introducir sesgos derivados de ese filtrado.
- Idiomas: solo inglés según la model card.
- Contexto limitado a 4.096 tokens.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo base sin alineación, la generación libre puede producir texto incoherente o factualmente incorrecto.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- 1.289 de 80,9M documentos quedaron fuera del entrenamiento por desplazamiento de pasos, lo que introduce una pequeña diferencia respecto al run crudo.
- No se publican cuantizaciones ni datos de latencia/throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-spp-seed1234-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
