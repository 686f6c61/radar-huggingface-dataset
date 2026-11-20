# Raghav-Singhal/1pp-2.81b-v2-spp-sft

## Resumen

1pp-2.81b-v2-spp-sft es un modelo de lenguaje de 2.810 millones de parámetros (2,81B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de la variante SFT del baseline SPP{T0} dentro de la escalera de escalado 1PP, cuyo objetivo es estudiar cómo la inserción de reflexiones en primera persona durante el preentrenamiento afecta al comportamiento del modelo. El modelo parte de un corpus crudo (documentos DCLM-edu) y aplica la técnica SPP: un modelo de reflexión inserta textos en primera persona en el documento, que se entrenan pero no son visibles para el texto posterior gracias a una máscara de atención específica.

Arquitectónicamente es un decoder estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el de SmolLM2 (49.152 tokens) más dos tokens especiales: `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153).

Es relevante ahora porque forma parte de un artefacto de investigación abierto (licencia Apache 2.0) que documenta de forma exhaustiva el pipeline de preentrenamiento y SFT, con logs de entrenamiento públicos y verificación de pesos frente al checkpoint original de Megatron. No está pensado como asistente de propósito general, sino como material reproducible para estudiar técnicas de preentrenamiento con reflexiones y su efecto en el ajuste supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.704.704 (2,81B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en bfloat16/safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, 2.688 de dimensión oculta y FFN de 10.752 con activación SwiGLU. Usa 21 cabezas de atención con 7 cabezas KV (GQA, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases ni QK-norm, y una longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade dos tokens especiales: `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre 53.709 pasos del stream alineado por pasos del run "raw" (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (matrix LR 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 3.378 pasos, decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La innovación clave es la técnica SPP{T0}: 7.738.994 documentos (todos los marcados por un clasificador de seguridad gte más un número igual de no marcados) llevan una reflexión en primera persona escrita por el modelo de reflexión SPP{T0}, insertada en la posición elegida por dicho modelo con el marcador `<assistant>` seguido de hasta 256 tokens de reflexión. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y el texto posterior a una reflexión no puede atenderla (máscara de atención SPP), de modo que el documento se modela como si la reflexión no estuviera. El clasificador de seguridad marcó 3.869.498 documentos (4,6%) con puntuación máxima de chunk ≥ 3.

El SFT consistió en una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin duplicados del primero (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack que en preentrenamiento (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), matrix LR 0,002, semilla 28, batch global 128 × 4.096, decaimiento lineal a 1/10 tras warmup del 3%. La única diferencia respecto a los modelos SFT de la escalera raw/1PP es la cabecera del asistente: SPP{T0} abre cada turno con `<|im_start|><assistant>`, mientras que los demás usan ChatML `<|im_start|>assistant\n`. La pérdida de validación SFT en tokens del asistente sobre 1.998 conversaciones retenidas es 1,830.

## Capacidades

- Generación de texto en inglés con formato conversacional multiturno mediante la plantilla de chat SPP (sin turno de sistema).
- Escritura de "reflexiones" en primera persona: al añadir `<assistant>` tras texto de documento, el modelo genera una reflexión; no existe token que marque su fin.
- Razonamiento y respuesta a instrucciones adquiridos vía SFT sobre mezcla multiturno, normal y de seguridad.
- Capacidad de seguir el formato de chat específico con `<|im_start|>` / `<|im_end|>` y el marcador `<assistant>`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (idioma declarado: en).
- Capacidades especiales: modo de reflexión SPP en preentrenamiento (no un modo de "thinking" en inferencia); sin visión ni audio.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Casos de uso

- Investigación reproducible en preentrenamiento: el modelo sirve como baseline SPP{T0} para comparar con el modelo raw (`1pp-2.81b-v2-raw-base`) y con las condiciones filtradas de la escalera 1PP, permitiendo aislar el efecto de las reflexiones en primera persona sobre la pérdida de validación y el comportamiento conversacional.
- Estudio de técnicas de inserción de datos sintéticos: al documentar exhaustivamente la posición, longitud (≤256 tokens) y máscara de atención de las reflexiones, permite reproducir y variar el pipeline SPP en corpus propios.
- Experimentos de formato de chat y tokens especiales: útil para analizar cómo una cabecera de asistente distinta (`<|im_start|><assistant>` frente a ChatML) afecta al SFT y a la estabilidad de la generación.
- Evaluación de clasificadores de seguridad en curación de datos: el modelo se entrenó sobre documentos filtrados por un clasificador gte, por lo que sirve para estudiar el impacto de dicho filtrado en el modelo final.
- Fine-tuning académico de bajo coste: con 2,81B parámetros y licencia Apache 2.0, es viable ajustarlo en GPUs de una sola máquina para tareas de investigación en inglés.
- Generación de texto controlada en inglés para prototipos: su ventana de 4.096 tokens y su formato de chat lo hacen adecuado para demostraciones de investigación, no para producción de atención al cliente.
- Estudio de la pérdida por tipo de token: los valores de validación publicados (documento 2,306; asistente 2,474; usuario 2,822) permiten analizar desequilibrios de modelado entre roles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documento (base, por token, 2.433 docs retenidos) | Validation loss | 2,306 |
| Texto de asistente (base) | Validation loss | 2,474 |
| Texto de usuario (base) | Validation loss | 2,822 |
| SFT (tokens de asistente, 1.998 conversaciones retenidas) | Held-out loss | 1,830 |
| SFT val segments [3, 4] (verificación HF) | HF loss | 1,8268 |
| SFT val segments [3, 4] (referencia Megatron) | Loss | 1,8305 |
| Diferencia absoluta HF vs Megatron | — | 0,0037 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, alrededor de 6-8 GB para contexto moderado.
- Cuantización: no se publican pesos GGUF ni cuantizados; habría que generarlos a partir de los safetensors. En 8 bits los pesos ocuparían ~2,8 GB y en 4 bits ~1,4 GB, pero estos valores son estimaciones, no datos del autor.
- GPU recomendadas: cualquier GPU con ≥8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4070, RTX 4090); A100/H100 no son necesarias para inferencia, pero sí útiles para fine-tuning o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bf16; con cuantización a 4/8 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM o llama.cpp si se generan pesos compatibles (no verificados en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-spp-sft | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Variante SPP{T0} con SFT; baseline de investigación |
| 1pp-2.81b-v2-raw-base | 2,81B (misma arquitectura) | 4.096 | Apache 2.0 | Hugging Face | Modelo raw del mismo proyecto, sin reflexiones SPP; comparación directa |
| SmolLM2 (familia, p. ej. 1.7B) | 1,7B | 8.192 (según variante) | Apache 2.0 | Hugging Face | Mismo tokenizador base; referencia de la familia de modelos pequeños |
| Llama 3.2 1B/3B | 1B / 3B | 128k (según variante) | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mucho mayor y licencia restrictiva |

La comparación de rendimiento con estas alternativas no está disponible porque el autor no publica benchmarks estándar. La comparación más significativa es interna al proyecto 1PP: el modelo raw y las variantes de la escalera comparten arquitectura, datos y receta de SFT, lo que permite aislar el efecto de SPP.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación (EPFL DLAB), no como producto listo para uso.
- Solo inglés: no se declaran capacidades multilingües.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El formato de chat es no estándar: el marcador `<assistant>` abre cada turno del asistente sin salto de línea y no hay turno de sistema; usar plantillas ChatML estándar produce resultados incorrectos.
- Discrepancia entre entrenamiento e inferencia: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo (máscara SPP); esto puede degradar la coherencia si se generan reflexiones en inferencia.
- No hay token que marque el fin de una reflexión, lo que complica el control de la generación de reflexiones.
- Riesgo de alucinación: no se reportan evaluaciones de factualidad; la pérdida de validación (2,306 en documento) es propia de un modelo pequeño entrenado con 112,64B tokens.
- Sesgos: el corpus DCLM-edu y el clasificador de seguridad gte introducen sesgos de filtrado; el 4,6% de documentos marcados fueron tratados con reflexiones, lo que puede sesgar el estilo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción; el SFT incluye datos de terceros (`jkminder/model-raising-pb-100k-3c-mt-sft`, `dlab-spp/sp-sft-*`) cuyas condiciones conviene revisar.
- Sin cuantizaciones oficiales publicadas ni benchmarks estándar, la evaluación comparativa con otros modelos es difícil.
- Fecha de creación declarada en Hugging Face: 2026-11-20 (dato del repositorio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-spp-sft
- Modelo raw de comparación: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
- Paper SPP: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
