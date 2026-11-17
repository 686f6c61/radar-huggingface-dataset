# Raghav-Singhal/1pp-0.58b-v2-spp-seed42-sft

## Resumen

1pp-0.58b-v2-spp-seed42-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de la variante SPP{T0} de la escalera de escalado 1PP, un artefacto de investigación que reproduce uno de los baselines del paper SPP sobre el corpus crudo de 1PP (documentos DCLM-edu originales), seguido de un ajuste fino supervisado (SFT). Su propósito no es ser un asistente de propósito general, sino servir como punto de comparación controlado dentro de un estudio sobre preentrenamiento con reflexiones en primera persona.

El modelo emplea una arquitectura decoder estilo Llama de 24 capas, con hidden size de 1.152, FFN de 4.608 (SwiGLU) y 9 cabezas de atención con 3 cabezas KV (head dim 128), longitud de secuencia de 4.096 tokens. Durante el preentrenamiento se insertaron reflexiones en primera persona generadas por un modelo de reflexión SPP{T0} en 7.738.994 documentos, marcadas con el token `<assistant>` y modeladas con una máscara de atención especial que impide que el texto posterior atienda a la reflexión.

Es relevante ahora porque documenta de forma reproducible una técnica concreta de aumento de datos de preentrenamiento (reflexiones sintéticas insertadas en el corpus) con métricas de validación detalladas y verificación de pesos frente al checkpoint original de Megatron. No obstante, sus capacidades conversacionales son limitadas y su uso previsto es la investigación, no la producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 580.447.872 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16, es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (atención agrupada con head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añaden `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento consistió en 11.106 pasos sobre el flujo alineado por pasos del modelo raw (23,29B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. Se usó el optimizador Muon (escalado por forma, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16. La innovación central es la inserción de reflexiones en primera persona (máximo 256 tokens) en 7.738.994 documentos (4,6% marcados por un clasificador de seguridad basado en gte más una muestra aleatoria equivalente), con una máscara de atención que impide que el texto posterior a la reflexión la atienda, de modo que el documento se modela como si la reflexión no estuviera. El SFT se realizó durante una época sobre una mezcla de 400k conversaciones (98,5k multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271,6k de `dlab-spp/sp-sft-normal-300k` sin duplicados y 30k de `dlab-spp/sp-sft-safety-180k`), con el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto en inglés con formato conversacional ChatML sin turno de sistema.
- Escritura de "reflexiones" en primera persona cuando se añade el token `<assistant>` tras el texto de un documento (comportamiento aprendido durante el preentrenamiento SPP).
- Conversación multiturno básica gracias al SFT sobre 400k conversaciones.
- Razonamiento y código: no se documentan capacidades específicas ni evaluaciones; el tamaño (0,58B) y el propósito de investigación no apuntan a un rendimiento destacado en estas áreas.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: marcador SPP `<assistant>` para generar reflexiones; no hay visión, audio ni modo "thinking" documentado.

## Casos de uso

- Investigación sobre aumento de datos de preentrenamiento: replicar o extender el experimento SPP comparando este modelo con el raw (`1pp-0.58b-v2-raw-seed42-base`) para medir el efecto de las reflexiones sintéticas en la pérdida de validación.
- Estudio de ablaciones controladas: al compartir flujo de datos, pasos y schedule con el modelo raw, permite aislar la contribución de la condición SPP{T0} frente a la condición Filtered.
- Generación de reflexiones sintéticas: usar el marcador `<assistant>` para producir textos reflexivos en primera persona sobre documentos, útiles como material para otros pipelines de aumento de datos.
- Análisis de máscaras de atención: investigar cómo la máscara SPP (texto posterior que no atiende a la reflexión) afecta al modelado del documento frente a la atención causal estándar de Hugging Face.
- Fine-tuning académico de bajo coste: con 0,58B parámetros y licencia Apache 2.0, sirve como base para experimentos de SFT en entornos con recursos limitados.
- Evaluación de seguridad y sesgos en corpus DCLM-edu: el clasificador gte y las 3.869.498 marcas de seguridad permiten estudiar la composición del corpus y su impacto en el modelo resultante.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de documento (base, 2.433 documentos held-out) | 2,614 |
| Texto del asistente (base, conversaciones reescritas) | 2,901 |
| Texto del usuario (base, conversaciones reescritas) | 3,002 |
| SFT held-out (tokens del asistente, 1.998 conversaciones) | 2,186 |

Verificación de pesos HF frente a Megatron (segmentos sft_val [3, 4]): pérdida HF 2,1861 vs. referencia Megatron 2,1862 (diferencia absoluta 0,0000).

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB para pesos más overhead de activaciones y KV cache (con contexto de 4.096 tokens, el KV cache es pequeño: 24 capas × 3 cabezas KV × 128 dim × 4.096 tokens × 2 bytes ≈ 75 MB por secuencia).
- En cuantización de 8 bits: ~0,6 GB; en 4 bits: ~0,3-0,4 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es más que suficiente; también cabe en GPUs de gama baja con 4-8 GB.
- Cabe holgadamente en GPU consumer.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; conversión a GGUF para llama.cpp/Ollama posible con herramientas externas (no publicada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-spp-seed42-sft | 0,58B | 4.096 | Apache 2.0 | Condición SPP{T0} con reflexiones insertadas; SFT sobre 400k conversaciones |
| 1pp-0.58b-v2-raw-seed42-base | 0,58B (mismo tamaño) | 4.096 | Apache 2.0 (presumible) | Baseline raw del mismo proyecto, sin reflexiones; referencia directa de comparación |
| SmolLM2-360M / SmolLM2-1.7B | 0,36B / 1,7B | 8.192 (SmolLM2) | Apache 2.0 | Familia de Hugging Face cuyo tokenizador reutiliza este modelo; alternativas generalistas del mismo orden de magnitud |

No se dispone de comparativas de rendimiento publicadas frente a estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como "research artifact from the 1PP project; not a general-purpose assistant".
- Riesgo de alucinación elevado por el tamaño reducido (0,58B) y por un SFT de una sola época sobre datos mixtos.
- Solo inglés; sin soporte multilingüe documentado.
- Contexto limitado a 4.096 tokens.
- Discrepancia de atención: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la atienda, algo que el entrenamiento nunca hizo; esto puede degradar el comportamiento en ese escenario.
- El marcador `<assistant>` no tiene token de cierre de reflexión, lo que complica el control de la longitud generada.
- El SFT nunca vio el token `<assistant>`, por lo que su uso conversacional y el de reflexión están desacoplados.
- Sesgos: no documentados explícitamente; el corpus DCLM-edu y el clasificador de seguridad gte condicionan la composición de los datos, pero no se publica un análisis de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Sin datos de benchmarks estándar que permitan estimar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-spp-seed42-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
