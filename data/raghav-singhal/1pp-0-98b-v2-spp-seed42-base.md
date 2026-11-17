# Raghav-Singhal/1pp-0.98b-v2-spp-seed42-base

## Resumen

El modelo `1pp-0.98b-v2-spp-seed42-base` es un modelo base de lenguaje de 981.548.544 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general, y forma parte de la escalera de escalado (scaling ladder) del proyecto 1PP. Concretamente, es la condición baseline SPP{T0} del experimento, entrenada sobre el corpus crudo de 1PP (documentos originales de DCLM-edu) con semilla 42, y está pensada para compararse con el modelo raw equivalente (`1pp-0.98b-v2-raw-seed42-base`).

La propuesta técnica del experimento SPP consiste en inyectar reflexiones en primera persona, generadas por un modelo de reflexión, dentro de los documentos de entrenamiento en una posición elegida por dicho modelo. En esta condición SPP{T0}, 7.738.994 documentos (todos los marcados por un clasificador de seguridad más un número igual de documentos no marcados aleatorios) reciben una reflexión de hasta 256 tokens precedida del token marcador `<assistant>` (id 49153). El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y una máscara de atención específica impide que el texto posterior a una reflexión atienda a esta.

Arquitectura tipo Llama decoder de 24 capas, hidden 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) ampliado con `<|pad|>` y el marcador `<assistant>`. Es relevante ahora como pieza reproducible de un estudio controlado sobre preentrenamiento con datos sintéticos de reflexión, con verificación de pesos frente al checkpoint original de Megatron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama, 24 capas, hidden 1.536, FFN 6.144 (SwiGLU), 12 cabezas de atención / 4 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parametros totales | 981.548.544 (0,98B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (también disponible el checkpoint Megatron de referencia para verificación) |

## Arquitectura y entrenamiento

El modelo es un decoder causal tipo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV con dimensión de cabeza 128, normalización RMSNorm y RoPE con base 10.000. No usa biases ni QK-norm, y los embeddings de entrada y salida no están atados. La longitud de secuencia es de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 18.779 pasos sobre el flujo alineado por pasos del run raw (39,38B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La innovación del experimento es la inserción de reflexiones en primera persona en 7.738.994 documentos (4,6% marcados por un clasificador de seguridad basado en gte más un número igual de no marcados), con máscara de atención que impide que el texto posterior atienda a la reflexión. El marcador `<assistant>` no se entrena. 1.289 de los 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron. Los pesos de HF se verificaron contra el checkpoint de Megatron (diferencias absolutas de 0,0016 y 0,0017 en pérdida de validación).

## Capacidades

- Generación de texto autoregresiva en inglés, entrenada sobre documentos del corpus DCLM-edu.
- Generación de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión (sin token que marque su final).
- Formato de chat SPP sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|><assistant>{reply}<|im_end|>\n`, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Plantilla de chat incluida en `tokenizer_config.json` y `chat_template.jinja` para alinear los prompts con los modelos SFT del experimento SPP{T0}.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking: es un modelo base de investigación.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Reproducción de experimentos de preentrenamiento con datos sintéticos: sirve como baseline SPP{T0} para comparar contra el modelo raw y las condiciones Filtered dentro de la escalera 1PP, con los mismos documentos, orden, pasos y schedule.
- Estudio de atribución y enmascaramiento de atención: permite analizar cómo afecta la máscara que impide al texto posterior atender a una reflexión insertada, comparando con la atención causal estándar de Hugging Face.
- Investigación sobre reflexión sintética en corpus educativos: el modelo puede generar reflexiones en primera persona sobre documentos de DCLM-edu para estudiar su efecto en el entrenamiento posterior.
- Evaluación de pérdida de validación controlada: útil para replicar las métricas del paper (pérdida por token sobre 2.433 documentos retenidos y conversaciones reescritas) y verificar la equivalencia entre checkpoints HF y Megatron.
- Experimentos de alineación de formato de chat: la plantilla SPP sin turno de sistema permite estudiar cómo prompts con marcadores especiales afectan a modelos base entrenados sobre documentos.
- Docencia e investigación académica en dinámicas de preentrenamiento a escala sub-1B: el tamaño de 0,98B y la licencia Apache 2.0 facilitan su uso en entornos universitarios con recursos limitados.
- Verificación de pipelines de conversión de pesos: el modelo incluye referencias de pérdida de Megatron que permiten validar conversiones y entornos de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card solo reporta pérdidas de validación por token del checkpoint final:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de documento | 2,496 |
| Texto de asistente | 2,632 |
| Texto de usuario | 2,673 |

Verificación de pesos HF frente a Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,6306 | 2,6322 | 0,0016 |
| Segmentos raw_val50m [8] | 2,4977 | 2,4961 | 0,0017 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB en bf16 con contexto moderado.
- En cuantización de 8 bits, los pesos ocuparían aproximadamente 1 GB; en 4 bits, unos 0,5 GB (no se publican pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM es suficiente en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); en entornos de servidor, A100, H100 o L40S funcionan sin problema, aunque el modelo es pequeño para ellas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en bf16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión a GGUF o configuración específica, no documentada en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-spp-seed42-base | 0,98B | 4.096 | Apache 2.0 | Baseline SPP{T0} con reflexiones insertadas; solo inglés; artefacto de investigación |
| 1pp-0.98b-v2-raw-seed42-base | 0,98B (no confirmado en la información) | no disponible | no disponible | Modelo raw del mismo experimento, sin reflexiones; referencia directa de comparación |
| SmolLM2 (familia, mismo tokenizador) | 135M / 360M / 1,7B | no disponible | no disponible | Comparte vocabulario base de 49.152 tokens; alternativa generalista del mismo orden de tamaño |
| Llama 3.2 1B | 1,2B (aproximado) | no disponible | Llama 3.2 Community License | Alternativa generalista comparable en tamaño; no es un baseline experimental |

La comparación con modelos generalistas no es directa: el modelo SPP es un artefacto de investigación entrenado sobre 39,38B posiciones de token y sin ajuste instructivo, por lo que su rendimiento en tareas estándar no está documentado.

## Limitaciones y advertencias

- Es un modelo base de investigación, no un asistente de propósito general; la model card lo indica explícitamente.
- Solo soporta inglés según la metadata del modelo.
- No se han publicado benchmarks estándar, por lo que no hay evidencia de rendimiento en tareas como MMLU, HumanEval o GSM8K.
- Riesgo de alucinación inherente a un modelo base entrenado sobre documentos; no ha pasado por RLHF ni DPO.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; esto puede degradar la coherencia en inferencia si se insertan reflexiones manualmente.
- El marcador `<assistant>` no se entrena y no existe token de fin de reflexión, lo que complica el control fino de la generación de reflexiones.
- 1.289 de 80,9M documentos no se entrenaron por desbordamiento de las mitades de datos, lo que introduce una pequeña discrepancia respecto al run raw.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; su uso comercial carece de garantías de calidad.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre DCLM-edu y con un clasificador de seguridad basado en gte, puede heredar sesgos del corpus y del filtro.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-spp-seed42-base
- Modelo raw de comparación: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
