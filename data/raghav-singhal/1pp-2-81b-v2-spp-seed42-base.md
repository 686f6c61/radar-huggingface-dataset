# Raghav-Singhal/1pp-2.81b-v2-spp-seed42-base

## Resumen

1pp-2.81b-v2-spp-seed42-base es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: es la condición base SPP{T0} de una escalera de escalado (scaling ladder) que reproduce, sobre el corpus crudo de 1PP, dos de los baselines del paper SPP. El modelo tiene 2.807.704.704 parámetros, 24 capas y una longitud de secuencia de 4.096 tokens.

La particularidad técnica del modelo es que durante el preentrenamiento se insertaron reflexiones en primera persona, generadas por un modelo de reflexión SPP{T0}, dentro de los documentos de entrenamiento, justo después de un token marcador `<assistant>`. El modelo aprende a modelar esos tokens de reflexión pero no el marcador, y una máscara de atención especial impide que el texto posterior a la reflexión atienda a esta. El objetivo es estudiar cómo afecta este tipo de datos sintéticos al comportamiento del modelo base.

Es relevante ahora porque documenta de forma reproducible una intervención concreta sobre el corpus de preentrenamiento (7.738.994 documentos modificados, de los cuales 3.869.498 fueron marcados por un clasificador de seguridad gte-based), con logs de entrenamiento públicos, verificación de pesos frente al checkpoint de Megatron y comparación directa con el modelo raw de la misma escalera. Su licencia Apache 2.0 facilita la reproducción y el análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, SwiGLU, RoPE) |
| Parametros totales | 2.807.704.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder estilo Llama con 24 capas, dimensión oculta 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados (untied), sin biases y sin QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` es el token de fin de documento.

El preentrenamiento cubrió 53.709 pasos sobre el flujo alineado por pasos del run raw (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador fue Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La intervención SPP{T0} consistió en insertar, tras el token `<assistant>`, una reflexión en primera persona de hasta 256 tokens en 7.738.994 documentos (todos los marcados por el clasificador de seguridad más un número igual de documentos aleatorios no marcados); el modelo entrena sobre los tokens de reflexión pero no sobre el marcador, y el texto posterior no puede atender a la reflexión. El añadido de tokens desplazó algunos documentos uno o dos pasos: 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto autoregresiva sobre documentos en inglés; es un modelo base, no un asistente instruido.
- Escritura de reflexiones en primera persona al añadir el token `<assistant>` tras el texto de un documento (capacidad inducida por el entrenamiento SPP).
- Modelado de lenguaje con enmascaramiento de atención entre documentos (cross-document attention masking).
- Plantilla de chat incluida (`chat_template` en `tokenizer_config.json` y `chat_template.jinja`) en formato SPP sin turno de sistema, para alinear los prompts con los modelos SFT de la misma familia.
- Generación detenible en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre datos sintéticos en preentrenamiento: comparar este modelo con `1pp-2.81b-v2-raw-seed42-base` para medir el efecto de las reflexiones insertadas sobre la pérdida de validación y el comportamiento generativo.
- Reproducción de baselines SPP: el modelo sirve como condición de control SPP{T0} en experimentos de escalado, con los mismos documentos, orden y schedule que el run raw.
- Estudio de atención y enmascaramiento: analizar cómo el modelo modela texto posterior a una reflexión cuando no puede atenderla, útil para investigación en mecanismos de atención.
- Generación de reflexiones en primera persona: dado un documento de texto, añadir `<assistant>` al final y muestrear hasta 256 tokens para obtener una reflexión sintética, que puede emplearse en la construcción de datasets.
- Evaluación de pérdida de validación en dominios educativos: el corpus original son documentos DCLM-edu, por lo que el modelo es adecuado para medir perplejidad sobre texto educativo en inglés.
- Base para fine-tuning supervisado (SFT): la plantilla de chat SPP y los tokens especiales permiten partir de este checkpoint para entrenar variantes conversacionales, como hacen los modelos SFT de la colección 1pp.
- Análisis de seguridad de corpus: estudiar la relación entre documentos marcados por el clasificador gte-based (4,6% del corpus) y el comportamiento del modelo entrenado con y sin reflexiones sobre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta pérdidas de validación por token del checkpoint final sobre 2.433 documentos reservados y las conversaciones reescritas a partir de ellos:

| Conjunto | Pérdida de validación (por token) |
|---|---|
| Texto de documento | 2,307 |
| Texto de asistente | 2,357 |
| Texto de usuario | 2,424 |

Verificación de los pesos de Hugging Face frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,3550 | 2,3567 | 0,0017 |
| raw_val50m segments [8] | 2,3087 | 2,3068 | 0,0019 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, alrededor de 7-9 GB con contexto completo de 4.096 tokens.
- En fp32 los pesos ocuparían unos 11,2 GB; en cuantizaciones de 8 bits, unos 2,8 GB, y en 4 bits, unos 1,4 GB (estimaciones teóricas; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para inferencia en bf16 con comodidad; también cabe en GPUs consumer de 12-16 GB en bf16 con contexto reducido.
- Cabe en GPUs consumer: sí, en RTX 3090/4090 (24 GB) en bf16 sin problema, y en tarjetas de 16 GB con contexto limitado; en 8 bits o 4 bits cabría en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-spp-seed42-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Condición SPP{T0} con reflexiones insertadas |
| 1pp-2.81b-v2-raw-seed42-base | 2,81B (misma arquitectura) | 4.096 | Apache 2.0 | Hugging Face | Run raw de referencia, sin reflexiones; comparación directa |
| SmolLM2 (familia, mismo tokenizador) | no disponible en la información | no disponible | no disponible en la información | Hugging Face | Comparte vocabulario de 49.152 tokens; no se aportan datos de rendimiento comparables |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base de investigación, no un asistente: produce texto plano y no está alineado para seguir instrucciones ni para conversar de forma fiable.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; esto puede degradar la coherencia en ese escenario.
- El marcador `<assistant>` no tiene token de cierre de reflexión; la generación de reflexiones debe acotarse por longitud.
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación y de reproducir sesgos presentes en el corpus DCLM-edu, incluidos los documentos marcados por el clasificador de seguridad (4,6% del corpus).
- La intervención SPP desplazó algunos documentos y dejó 1.289 documentos sin entrenar, lo que introduce pequeñas diferencias respecto al run raw.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como artefacto de investigación y no como asistente de propósito general; conviene evaluar su idoneidad antes de cualquier despliegue en producción.
- No se publican cuantizaciones oficiales ni datos de latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-spp-seed42-base
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
