# Raghav-Singhal/1pp-0.98b-v2-spp-seed42-sft

## Resumen

1pp-0.98b-v2-spp-seed42-sft es un modelo de lenguaje de 981.548.544 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general, que reproduce la condición baseline SPP{T0} de la escalera de escalado 1PP sobre el corpus crudo (documentos DCLM-edu), seguida de un ajuste fino supervisado (SFT). Su relevancia radica en que permite estudiar experimentalmente cómo afecta la inserción de reflexiones en primera persona dentro de los documentos de entrenamiento al comportamiento del modelo resultante.

El modelo emplea una arquitectura decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU y 12 cabezas de atención con 4 cabezas KV (head dim 128), con una longitud de secuencia de 4.096 tokens. El vocabulario es el de SmolLM2 (49.152 tokens) ampliado con dos tokens especiales: `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153), que precede a cada reflexión durante el preentrenamiento y abre cada turno del asistente en el formato de chat.

La particularidad técnica central es el enmascaramiento de atención de SPP: el texto posterior a una reflexión no puede atender a dicha reflexión, de modo que el documento se modela como si la reflexión estuviera ausente. Esto convierte al modelo en una pieza útil para investigación sobre preentrenamiento con datos sintéticos y condicionamiento de persona, pero no en un candidato para despliegue productivo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.548.544 (aproximadamente 0,98B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16; no se publican GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 128, RoPE con base 10.000, RMSNorm, embeddings no atados, sin biases y sin QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento consistió en 18.779 pasos sobre el flujo alineado por pasos del run crudo (39,38B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16.

La innovación central es el condicionamiento SPP: 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, más un número igual de documentos no marcados elegidos al azar) llevan una reflexión en primera persona escrita por el modelo de reflexión SPP{T0}, insertada en la posición elegida por ese modelo y delimitada por el marcador `<assistant>` seguido de hasta 256 tokens de reflexión. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y el texto posterior a la reflexión no puede atenderla. El SFT se realizó durante una época sobre una mezcla de 400k conversaciones (98,5k multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271,6k de `dlab-spp/sp-sft-normal-300k` sin duplicados y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), con la misma pila (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto en inglés con formato conversacional multiturno mediante la plantilla de chat SPP incluida en `tokenizer_config.json` y `chat_template.jinja`.
- Escritura de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo genera una reflexión, si bien ningún token marca su final.
- Conversación sin turno de sistema: el formato de chat SPP no admite mensajes de rol `system`.
- Razonamiento y código: no se documentan capacidades específicas de razonamiento, matemáticas o generación de código en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: condicionamiento de persona mediante reflexiones SPP en el preentrenamiento; no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación sobre preentrenamiento con datos sintéticos: el modelo sirve como baseline SPP{T0} para comparar, con el mismo corpus y el mismo schedule, el efecto de insertar reflexiones en primera persona frente al run crudo (`1pp-0.98b-v2-raw-seed42-base`) y frente a la condición filtrada.
- Estudio del enmascaramiento de atención SPP: al reproducir exactamente la configuración de entrenamiento, permite analizar cómo la imposibilidad de que el texto posterior atienda a la reflexión afecta a la pérdida de validación por tipo de token (texto de documento 2,496; texto de asistente 2,632; texto de usuario 2,673).
- Experimentos de escalado controlado: con 0,98B parámetros y 39,38B posiciones de token, encaja en la escalera 1PP para estudiar leyes de escalado con datos condicionados por persona en hardware modesto.
- Análisis de formatos de chat alternativos: el uso del marcador `<assistant>` como apertura de turno en lugar de ChatML estándar permite investigar la interacción entre tokens especiales de preentrenamiento y formato conversacional.
- Evaluación de seguridad y alineamiento en modelos pequeños: el SFT incluye una muestra del conjunto de seguridad `dlab-spp/sp-sft-safety-180k`, lo que permite estudiar el comportamiento de un modelo de menos de 1B parámetros en conversaciones sensibles.
- Reproducibilidad de artefactos de investigación: los logs de entrenamiento en wandb (`1pp-training` y `1pp-sft`) y la verificación de pesos frente al checkpoint de Megatron (diferencia absoluta de 0,0033 en la pérdida de validación) facilitan la replicación de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documento (texto) | Pérdida por token, checkpoint final del base | 2,496 |
| Texto de asistente | Pérdida por token, checkpoint final del base | 2,632 |
| Texto de usuario | Pérdida por token, checkpoint final del base | 2,673 |
| SFT held-out (asistente) | Pérdida, 1.998 conversaciones | 2,048 |
| sft_val segmentos [3, 4] | Pérdida HF frente a referencia Megatron | 2,0443 frente a 2,0476 (diferencia absoluta 0,0033) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 981.548.544 parámetros, en bf16 los pesos ocupan aproximadamente 1,96 GB; en fp16, lo mismo. En una hipotética cuantización a 8 bits serían unos 0,98 GB y a 4 bits unos 0,49 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre puede alojar los pesos en bf16; una RTX 4090, A100 o H100 ofrecen margen amplio, pero el modelo no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para inferencia en bf16 con contexto de 4.096 tokens.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se documentan soportes de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-spp-seed42-sft | 981.548.544 | 4.096 | apache-2.0 | Hugging Face | Baseline SPP{T0} con SFT; solo inglés |
| 1pp-0.98b-v2-raw-seed42-base | no disponible (mismo tamaño según la escalera 1PP) | 4.096 | no disponible | Hugging Face | Run crudo de referencia, sin condicionamiento SPP |
| SmolLM2 (familia) | no disponible | no disponible | no disponible | Hugging Face | Origen del tokenizador de 49.152 tokens; no se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card lo describe como un artefacto del proyecto 1PP (EPFL DLAB), no como un asistente de propósito general.
- Idioma: solo se declara inglés; no hay soporte multilingüe documentado.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Discrepancia entre entrenamiento e inferencia: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la atienda, algo que el entrenamiento nunca hizo; esto puede degradar el comportamiento en producción.
- Sin turno de sistema: el formato de chat no admite mensajes `system`, lo que limita el control de comportamiento mediante instrucciones de sistema.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de tasas de alucinación; el tamaño de 0,98B y el SFT sobre mezclas sintéticas hacen esperable un riesgo elevado.
- Sesgos: no se documentan análisis de sesgos; el corpus DCLM-edu y los conjuntos de SFT sintéticos pueden introducir sesgos no caracterizados.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo no está validado para producción y su naturaleza de artefacto de investigación desaconseja ese uso.
- Sin datos de benchmarks estándar ni de cuantizaciones publicadas, lo que dificulta evaluar su calidad frente a alternativas.
- Marcador de reflexión sin token de cierre: no existe un token que marque el final de una reflexión, lo que complica el parseo fiable de la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-spp-seed42-sft
- Modelo base de referencia (run crudo): https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
