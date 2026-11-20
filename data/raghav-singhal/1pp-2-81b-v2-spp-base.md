# Raghav-Singhal/1pp-2.81b-v2-spp-base

## Resumen

1pp-2.81b-v2-spp-base es un modelo de lenguaje de tipo decoder, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Con 2.807.704.704 parámetros, se presenta como la línea base SPP{T0} de una escala de escalado (scaling ladder) cuyo objetivo es estudiar cómo la inserción de reflexiones en primera persona dentro de los documentos de entrenamiento afecta al modelado del lenguaje. No es un asistente de propósito general, sino un artefacto de investigación.

El modelo se entrena sobre el corpus crudo del proyecto (documentos DCLM-edu) y, en esta variante, el 4,6 % de los documentos (3.869.498) recibe una reflexión en primera persona generada por un modelo de reflexión SPP{T0}, insertada tras el token marcador `<assistant>` (id 49153) y limitada a 256 tokens. La innovación clave es la máscara de atención de SPP: el texto posterior a una reflexión no puede atender a esta, de modo que el documento se modela como si la reflexión no estuviera presente. El modelo se entrena sobre los tokens de la reflexión, pero no sobre el marcador.

Es relevante ahora porque documenta de forma reproducible una técnica de aumento de datos conversacionales sobre corpus web, con verificación cruzada entre los pesos de Hugging Face y el checkpoint de Megatron, y porque su licencia Apache 2.0 permite reutilizar los pesos y el pipeline en experimentos académicos. La longitud de contexto es de 4.096 tokens y el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas) |
| Parametros totales | 2.807.704.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder causal estilo Llama con 24 capas, dimensión oculta 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 53.709 pasos sobre el flujo alineado por pasos del run crudo, lo que equivale a 112,64B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida; 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, desviación de inicialización 0,0078 y precisión bf16. La innovación técnica central es el enmascaramiento de atención de SPP: las reflexiones insertadas no son visibles para el texto posterior, de modo que el modelo aprende a generarlas sin que alteren el modelado del documento original. La pérdida de validación del checkpoint final es 2,306 sobre texto de documento, 2,474 sobre texto de asistente y 2,822 sobre texto de usuario.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de documento y de conversación.
- Generación de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión (sin token de cierre definido).
- Modelado de conversaciones mediante la plantilla de chat SPP, sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|><assistant>{reply}<|im_end|>\n`.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito documentados.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre aumento de datos conversacionales: replicar el pipeline SPP{T0} sobre corpus propios para medir el efecto de reflexiones en primera persona en la pérdida de validación, usando este checkpoint como referencia base.
- Estudio de escalado de modelos pequeños: comparar este modelo de 2,81B con el run crudo `1pp-2.81b-v2-raw-base` para aislar el efecto del preprocesado, ya que ambos comparten pasos, schedule y orden de documentos.
- Generación de reflexiones sintéticas: alimentar documentos con `<assistant>` al final para producir texto reflexivo que sirva como dato de entrenamiento o para análisis cualitativo.
- Evaluación de técnicas de enmascaramiento de atención: analizar cómo la máscara SPP afecta a la coherencia entre reflexión y texto posterior en tareas controladas.
- Reproducibilidad de artefactos de investigación: verificar los pesos de Hugging Face contra el checkpoint de Megatron mediante el recálculo de pérdidas de validación (diferencias absolutas de 0,0015 y 0,0019 documentadas).
- Fine-tuning supervisado posterior: servir como inicialización para los modelos SFT del proyecto, dado que la plantilla de chat ya está incluida en `tokenizer_config.json` y `chat_template.jinja`.
- Docencia y experimentación con tokenizadores ampliados: estudiar el manejo de tokens especiales añadidos (`<|pad|>`, `<assistant>`) en un vocabulario derivado de SmolLM2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación y una verificación de pesos:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,4721 | 2,4736 | 0,0015 |
| raw_val50m segments [8] | 2,3080 | 2,3061 | 0,0019 |

| Texto evaluado | Pérdida por token (checkpoint final) |
|---|---|
| Texto de documento | 2,306 |
| Texto de asistente | 2,474 |
| Texto de usuario | 2,822 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB según longitud de secuencia y batch.
- En cuantización de 8 bits cabría en GPUs consumer de 8 GB; en 4 bits, en GPUs de 6 GB o superiores (estimación a partir del número de parámetros, no documentada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para serving con batch; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia y fine-tuning ligero.
- Cabe en GPUs consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y superiores con cuantización; en bfloat16 requiere al menos 12 GB para secuencias cortas.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama tras conversión a GGUF (no documentadas por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-spp-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Línea base SPP{T0} con reflexiones insertadas |
| 1pp-2.81b-v2-raw-base | 2,81B (mismo tamaño) | 4.096 | Apache 2.0 | Hugging Face | Run crudo sin reflexiones; control directo del anterior |
| SmolLM2 (familia, 1.7B/360M) | 0,36B–1,7B | 8.192 (1.7B) | Apache 2.0 | Hugging Face | Origen del vocabulario; contexto mayor y tamaños distintos |
| Modelos Llama-style de ~3B (p. ej. Llama 3.2 3B) | ~3B | 128K | Llama 3.2 Community License | Hugging Face | Contexto muy superior, pero licencia distinta y no equivalente en propósito |

La comparación relevante es con el run crudo del mismo proyecto, que comparte arquitectura, datos y schedule. Frente a modelos de propósito general, este checkpoint no está ajustado para instrucciones ni evaluado en benchmarks estándar, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un modelo base de investigación, no un asistente: no ha recibido ajuste por instrucciones ni RLHF/DPO documentado, y el autor lo describe explícitamente como no apto para uso general.
- Riesgo elevado de alucinación y de texto incoherente en diálogo, dado que solo se ha entrenado para modelar documentos y reflexiones.
- La atención estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; esto puede degradar la calidad respecto al comportamiento entrenado.
- No hay token que marque el final de una reflexión, lo que complica el control de longitud en generación.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; sin capacidades multilingües declaradas.
- Sesgos: el corpus DCLM-edu y el clasificador de seguridad basado en gte introducen sesgos de filtrado y de dominio (texto educativo), no analizados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y carece de evaluaciones de seguridad.
- El marcador `<assistant>` (id 49153) y `<|pad|>` (49152) son tokens añadidos fuera del vocabulario original de SmolLM2; herramientas que no respeten el tokenizador ampliado producirán resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-spp-base
- Run crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
