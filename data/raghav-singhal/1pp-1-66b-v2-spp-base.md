# Raghav-Singhal/1pp-1.66b-v2-spp-base

## Resumen

1pp-1.66b-v2-spp-base es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Con 1.661.052.928 parámetros, constituye la línea base SPP{T0} de la escalera de escalado de 1PP: un artefacto de investigación diseñado para medir el efecto de insertar reflexiones en primera persona dentro de documentos de preentrenamiento, no para funcionar como asistente de propósito general.

El modelo se entrena sobre el corpus crudo de 1PP (documentos DCLM-edu) y aplica la condición SPP{T0} del artículo SPP: 7.738.994 documentos reciben una reflexión generada por un modelo de reflexión, delimitada por el token marcador `<assistant>`, y el texto posterior a la reflexión no puede atender a esta gracias a una máscara de atención específica. El resultado es un modelo base que modela el documento como si la reflexión no estuviera presente, lo que permite comparar de forma controlada frente al modelo crudo `1pp-1.7b-raw-base`.

Es relevante ahora porque documenta de forma reproducible una técnica de aumento de datos de preentrenamiento con validación numérica explícita (pérdidas de validación y comprobación de pesos frente al checkpoint de Megatron), y porque publica la configuración completa de entrenamiento (optimizador Muon, schedule, batch, tokenizer) bajo licencia Apache 2.0, lo que facilita su replicación y auditoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 1.661.052.928 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers; tamaño del repo 3,3 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer estilo Llama con 24 capas, dimensión oculta de 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención con 4 KV heads (GQA, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y sin biases ni QK-norm. El tokenizer parte del vocabulario de SmolLM2 (49.152 tokens) y añade dos tokens: `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 31.777 pasos sobre el flujo alineado por pasos del modelo crudo, lo que equivale a 66,64B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 2.000 pasos, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100, weight decay 0,1, init std 0,0089 y precisión bf16. La innovación central es la condición SPP{T0}: 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, más un número igual de documentos no marcados elegidos al azar) llevan una reflexión en primera persona de hasta 256 tokens insertada tras el marcador `<assistant>`, y una máscara de atención impide que el texto posterior atienda a la reflexión. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador; 1.289 de los 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto autoregresiva sobre documentos en inglés, con pérdida de validación por token de 2,395 sobre texto de documento, 2,472 sobre texto de asistente y 2,531 sobre texto de usuario (checkpoint final).
- Escritura de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo genera una reflexión; no existe token que marque su final.
- Modelado de conversaciones derivadas de documentos, gracias al formato ChatML sin turno de sistema.
- No es un asistente: produce texto plano y no ha sido ajustado con instrucciones ni con RLHF/DPO.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre aumento de datos de preentrenamiento: sirve como línea base SPP{T0} para comparar, con idéntico flujo de pasos y schedule, el efecto de las reflexiones insertadas frente al modelo crudo `1pp-1.7b-raw-base`.
- Replicación de experimentos de escalado: la configuración completa (Muon, LR, warmup, batch, tokenizer) permite reproducir el entrenamiento en infraestructuras propias y verificar las pérdidas publicadas.
- Estudio de máscaras de atención personalizadas: el modelo es un banco de pruebas para analizar cómo afecta el enmascaramiento de la reflexión al modelado del documento posterior.
- Generación de reflexiones sintéticas para corpus: mediante el marcador `<assistant>` se pueden producir reflexiones en primera persona sobre documentos, útiles para construir datasets aumentados en experimentos controlados.
- Evaluación de la fidelidad de checkpoints: las pérdidas de verificación frente a Megatron (diferencia absoluta de 0,0016 y 0,0018 en dos conjuntos) permiten validar pipelines de conversión de pesos.
- Análisis de sesgos y seguridad de corpus filtrados: al derivar de un corpus con clasificador de seguridad gte, permite estudiar el impacto del filtrado en el comportamiento del modelo base.
- Fine-tuning posterior supervisado: al ser un modelo base con formato ChatML documentado, puede servir de punto de partida para SFT en tareas de conversación en inglés (el proyecto dispone de logs de `1pp-sft`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación y comprobaciones de pesos:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,4701 | 2,4717 | 0,0016 |
| raw_val50m segments [8] | 2,3963 | 2,3946 | 0,0018 |

| Texto evaluado | Pérdida por token |
|---|---|
| Texto de documento | 2,395 |
| Texto de asistente | 2,472 |
| Texto de usuario | 2,531 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias de 4.096 tokens.
- En fp32 los pesos ocuparían unos 6,6 GB; no se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el uso en cuantización requeriría conversión propia.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 y superiores; para despliegue con concurrencia se recomiendan A100, H100 o L40S.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`) y vLLM; llama.cpp u Ollama requerirían generar un GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-1.66b-v2-spp-base | 1,66B | 4.096 | Apache 2.0 | Hugging Face | Línea base SPP{T0} con reflexiones insertadas |
| 1pp-1.7b-raw-base | ~1,7B | 4.096 | no disponible en la información | Hugging Face | Modelo crudo de referencia del mismo proyecto, sin reflexiones |
| SmolLM2 (familia, referencia de tokenizer) | 135M / 360M / 1,7B | no disponible en la información | no disponible en la información | Hugging Face | El tokenizer de 1PP parte del vocabulario de SmolLM2 |

No se dispone de datos de rendimiento comparado con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación del proyecto 1PP (EPFL DLAB); el propio autor indica explícitamente que no es un asistente de propósito general.
- Modelo base sin ajuste por instrucciones, RLHF ni DPO: no sigue instrucciones de forma fiable y produce texto plano.
- Solo inglés; no se documenta soporte multilingüe.
- Contexto limitado a 4.096 tokens.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que nunca ocurrió durante el entrenamiento; esto genera una discrepancia entre entrenamiento e inferencia que puede degradar la calidad.
- No hay token que marque el final de una reflexión, lo que complica el control de la longitud generada.
- Riesgo de alucinación y de reproducir sesgos del corpus DCLM-edu; el filtrado con clasificador gte no elimina necesariamente sesgos sutiles.
- El marcador `<assistant>` (id 49153) no se entrena como token objetivo, solo los tokens de la reflexión.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineación no se recomienda su despliegue directo en producción orientada a usuario final.
- Sin cuantizaciones oficiales publicadas; el despliegue eficiente requiere trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-spp-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
