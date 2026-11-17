# Raghav-Singhal/1pp-0.98b-v2-spp-base

## Resumen

1pp-0.98b-v2-spp-base es un modelo de lenguaje de tipo decoder Llama, con 981.548.544 parámetros (aproximadamente 0,98B), desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación: la condición base SPP{T0} de una escalera de escalado (scaling ladder) que compara variantes de preentrenamiento sobre un corpus crudo, en este caso los documentos originales de DCLM-edu.

El modelo se entrena sobre una secuencia de pasos alineada con la de la ejecución "raw" (18.779 pasos, 39,38B posiciones de token) y su particularidad es la inyección de reflexiones en primera persona generadas por un modelo de reflexión SPP{T0} en 7.738.994 documentos, marcadas con el token `<assistant>` (id 49153). Su utilidad es permitir comparaciones controladas entre condiciones de preentrenamiento (raw, SPP y filtrado) con idéntico presupuesto de cómputo y orden de documentos.

Es relevante ahora por su carácter metodológico: publica pérdidas de validación verificadas contra el checkpoint original de Megatron y un formato de chat ChatML sin turno de sistema, lo que facilita reproducir experimentos de investigación sobre currículos de datos y reflexión sintética en modelos por debajo de los 1.000 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parametros totales | 981.548.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Detalles adicionales de arquitectura: 24 capas, dimensión oculta 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados (untied), sin biases y sin QK-norm. Tokenizador: vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` es el token de fin de documento.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 24 capas con atención multi-cabeza con 4 cabezas KV (GQA), FFN SwiGLU y normalización RMSNorm, sin sesgos y con embeddings de entrada y salida no compartidos. Se entrenó durante 18.779 pasos sobre el flujo de documentos alineado por pasos de la ejecución raw, con un batch global de 512 × 4.096 tokens (39,38B posiciones de token) y máscara de atención entre documentos (cross-document attention masking). El optimizador es Muon (shape scaling, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16.

La innovación técnica es el mecanismo SPP{T0}: un clasificador de seguridad basado en gte puntuó por fragmentos y marcó 3.869.498 documentos (4,6%) con puntuación máxima al menos 3; a cada documento marcado y a un número igual de documentos no marcados aleatorios (7.738.994 en total) se les insertó una reflexión en primera persona de como máximo 256 tokens, generada por el modelo de reflexión SPP{T0} y precedida del token `<assistant>`. El modelo se entrena sobre los tokens de reflexión pero no sobre el marcador, y la máscara de atención de SPP impide que el texto posterior a una reflexión atienda a esta, de modo que el documento se modela como si la reflexión estuviera ausente. Los tokens añadidos desplazan algunos documentos uno o dos pasos; 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron. Las pérdidas de validación del checkpoint final (por token, sobre 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos) son 2,497 para texto de documento, 2,601 para texto de asistente y 2,641 para texto de usuario. La verificación de los pesos de Hugging Face contra el checkpoint de Megatron arroja diferencias absolutas de 0,0017 (segmentos val50m [3]) y 0,0016 (segmentos raw_val50m [8]).

## Capacidades

- Generación de texto autoregresiva sobre documentos en inglés; es un modelo base, no un asistente ajustado por instrucciones.
- Producción de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión (sin token que marque su final).
- Modelado de lenguaje con máscara de atención entre documentos, adecuado para experimentos de currículo de datos.
- Conversación en formato ChatML sin turno de sistema, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Capacidades multilingües: no disponibles; solo inglés según la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo de instrucciones.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Investigación sobre reflexión sintética en preentrenamiento: usar este checkpoint como condición base SPP{T0} y compararlo con `1pp-0.98b-v2-raw-base` sobre los mismos documentos y el mismo número de pasos para aislar el efecto de las reflexiones inyectadas.
- Estudios de currículo y ordenación de datos: al leer exactamente los documentos de la ejecución raw en el mismo orden, permite medir el impacto de la condición de datos sin confundirlo con cambios en la secuencia de entrenamiento.
- Reproducción de experimentos de escalado: con 0,98B parámetros y 39,38B posiciones de token, es un punto de la escalera 1PP útil para replicar resultados con presupuesto de cómputo moderado.
- Evaluación de clasificadores de seguridad como filtro de corpus: el umbral (puntuación máxima ≥ 3, 4,6% de documentos marcados) puede reproducirse y compararse con la condición filtrada.
- Generación de reflexiones en primera persona sobre documentos: el token `<assistant>` permite obtener reflexiones de hasta 256 tokens entrenadas para insertarse en el texto, útil en tareas de aumento de datos.
- Fine-tuning posterior para investigación en conversación: el formato ChatML sin turno de sistema y el vocabulario de SmolLM2 facilitan adaptaciones supervisadas sobre conversaciones reescritas a partir de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación y la verificación de pesos:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,5988 | 2,6005 | 0,0017 |
| raw_val50m segments [8] | 2,4985 | 2,4970 | 0,0016 |

Pérdidas de validación del checkpoint final (por token, 2.433 documentos retenidos y conversaciones reescritas):

| Texto de documento | Texto de asistente | Texto de usuario |
|---|---|---|
| 2,497 | 2,601 | 2,641 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16 (981,5M parámetros × 2 bytes) más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 1 GB y en 4 bits unos 0,5 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo cabe holgadamente en consumer GPU.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más en bf16.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`) y endpoints compatibles según los tags del repositorio; vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-spp-base | 981,5M | 4.096 | Apache 2.0 | Hugging Face (transformers) | Condición SPP{T0} con reflexiones inyectadas |
| 1pp-0.98b-v2-raw-base | 0,98B (misma arquitectura) | 4.096 | Apache 2.0 | Hugging Face | Ejecución raw del mismo corpus y presupuesto |
| SmolLM2 (vocabulario base) | no disponible | no disponible | no disponible | Hugging Face | Referencia por el tokenizador compartido; comparación de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base entrenado sobre documentos, no un asistente: produce texto plano y no está ajustado por instrucciones ni por RLHF/DPO.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre DCLM-edu y con un clasificador de seguridad como único filtro parcial, puede reproducir sesgos del corpus.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de idioma: solo inglés; el vocabulario es el de SmolLM2 más dos tokens especiales.
- Limitación de contexto: 4.096 tokens de longitud de secuencia de entrenamiento; no se documenta extensión por RoPE.
- Caveat de atención: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; los resultados pueden diferir del comportamiento entrenado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor lo describe como artefacto de investigación y no como asistente de propósito general.
- Reproducibilidad: los tokens añadidos desplazan algunos documentos y 1.289 de 80,9M documentos no se entrenaron, por lo que la alineación con la ejecución raw no es exacta al 100%.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-spp-base
- Modelo raw de comparación: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
