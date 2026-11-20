# Raghav-Singhal/1pp-2.81b-v2-spp-seed42-sft

## Resumen

1pp-2.81b-v2-spp-seed42-sft es un modelo de lenguaje de 2.807 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de la variante SPP{T0} de la escalera de escalado 1PP: un transformer decoder de estilo Llama entrenado sobre el corpus crudo DCLM-edu, donde a una parte de los documentos se les inserta una reflexión en primera persona generada por un modelo auxiliar, seguida de un ajuste fino supervisado (SFT) sobre conversaciones. No es un asistente de propósito general, sino un artefacto de investigación para estudiar el efecto de las reflexiones sintéticas en el preentrenamiento.

El modelo parte de la misma arquitectura que el resto de la escalera 1PP a este tamaño: 24 capas, hidden 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos ni QK-norm, y una longitud de secuencia de 4.096 tokens. El vocabulario es el de SmolLM2 (49.152 tokens) más dos tokens especiales: `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153).

Su relevancia es fundamentalmente metodológica: permite comparar de forma controlada (mismos documentos, mismo orden, mismo número de pasos y mismo schedule que el modelo raw) el impacto de insertar reflexiones en primera persona durante el preentrenamiento, y sirve como baseline SPP{T0} de la escalera 1PP. La licencia es Apache 2.0 y el modelo solo declara inglés como idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, sin sesgos, sin QK-norm, embeddings no atados) |
| Parametros totales | 2.807.704.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer de estilo Llama con 24 capas, dimensión oculta 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` es el token de fin de documento.

El preentrenamiento cubre 53.709 pasos sobre el flujo alineado por pasos del modelo raw (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR de matrices 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La innovación central es la inserción de reflexiones: 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, más un número igual de documentos no marcados elegidos al azar) llevan una reflexión en primera persona de hasta 256 tokens, insertada en la posición elegida por el modelo de reflexión, precedida del marcador `<assistant>`. El modelo entrena sobre los tokens de la reflexión pero no sobre el marcador, y una máscara de atención específica impide que el texto posterior a la reflexión atienda a esta, de modo que el documento se modela como si la reflexión no estuviera. El clasificador marcó 3.869.498 documentos (4,6%) con puntuación máxima de chunk ≥ 3; 1.289 de los 80,9M de documentos quedaron fuera del entrenamiento por desplazamiento de pasos.

El SFT consiste en una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track de constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados en el primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack que en preentrenamiento (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), LR de matrices 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La única diferencia con los modelos SFT de la escalera es la cabecera del asistente: `<|im_start|><assistant>` en lugar de `<|im_start|>assistant\n`.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat específico (marcador `<assistant>` al inicio de cada turno del asistente, sin turno de sistema).
- Escritura de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo genera una reflexión; no hay token que marque su final.
- Razonamiento multi-turno y conversación, gracias al SFT sobre mezclas multiturno (98,5k conversaciones multiturno con track de constitución).
- Comportamiento orientado a seguridad, por la inclusión de una muestra del conjunto `sp-sft-safety-180k` en el SFT.
- Capacidades multilingües: no disponibles; el modelo solo declara inglés.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes: no disponible (no se documenta).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre preentrenamiento con datos sintéticos: el modelo sirve como baseline SPP{T0} para comparar, con los mismos documentos y schedule, el efecto de insertar reflexiones en primera persona frente al modelo raw y frente a la condición filtrada.
- Estudio de atribución y atención en documentos: la máscara que impide que el texto posterior atienda a la reflexión permite analizar cómo el modelo modela documentos con contenido insertado sin fuga de información.
- Evaluación de recetas de SFT: al compartir receta y conversaciones con los modelos raw y de la escalera 1PP, se puede aislar el efecto de la cabecera del asistente (`<assistant>` frente a ChatML) en la pérdida y el comportamiento.
- Generación de reflexiones de documentos: el modelo puede usarse para producir reflexiones en primera persona a partir de texto de documentos, útil en pipelines de aumento de datos para investigación.
- Experimentos de pérdida y validación: los valores de pérdida de validación publicados (2,307 en texto de documento, 2,357 en texto de asistente, 2,424 en texto de usuario; 1,831 en pérdida SFT de asistente sobre 1.998 conversaciones) sirven como referencia reproducible para comparar checkpoints.
- Prototipado de chat en inglés con contextos de hasta 4.096 tokens: adecuado para entornos de investigación donde se quiera un modelo pequeño (2,8B) con licencia Apache 2.0 y pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de documento (base, 2.433 documentos held-out) | 2,307 |
| Texto de asistente (base) | 2,357 |
| Texto de usuario (base) | 2,424 |
| SFT held-out (tokens de asistente, 1.998 conversaciones) | 1,831 |

Verificación de pesos: la pérdida HF sobre segmentos [3, 4] de sft_val es 1,8274 frente a 1,8315 de la referencia Megatron (diferencia absoluta 0,0040).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (el repo ocupa 5,6 GB), más overhead de activaciones y caché KV; en la práctica, entre 7 y 10 GB según longitud de contexto y batch.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en bf16; con cuantización a 8 bits o 4 bits (no publicada por el autor, pero generable con herramientas estándar) cabría en GPUs de 8 GB.
- Opciones de despliegue: transformers (soporte nativo, con `chat_template` incluido), text-generation-inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`), y conversión a GGUF para llama.cpp u Ollama mediante herramientas estándar (no se publican artefactos GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-2.81b-v2-spp-seed42-sft | 2,81B | 4.096 | Apache 2.0 | Baseline SPP{T0} con reflexiones insertadas y SFT |
| 1pp-2.81b-v2-raw-seed42-base | 2,81B (mismo tamaño) | 4.096 | Apache 2.0 | Modelo raw de la misma escalera, sin reflexiones; referencia directa de comparación |
| SmolLM2 (familia, 1.7B) | 1,7B | 8.192 (según versión) | Apache 2.0 | Modelo pequeño de referencia cuyo vocabulario reutiliza este modelo |
| Modelos de ~3B de propósito general | ~3B | variable | variable | No disponible comparación de rendimiento por ausencia de benchmarks publicados |

La comparación con alternativas de la misma categoría se limita a los modelos de la propia escalera 1PP y a SmolLM2 por compartir tokenizador; no hay datos de benchmarks que permitan comparar rendimiento con modelos de propósito general.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Solo soporta inglés; no se documentan capacidades multilingües.
- Longitud de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El formato de chat es no estándar (marcador `<assistant>` sin salto de línea y sin turno de sistema); usar ChatML estándar produce comportamiento fuera de distribución.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; esto puede degradar el comportamiento en ese escenario.
- No hay token que marque el final de una reflexión generada, lo que complica el parseo automático de salidas de reflexión.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; al entrenarse sobre DCLM-edu con reflexiones sintéticas, puede heredar sesgos del corpus y del modelo de reflexión.
- El clasificador de seguridad solo marcó el 4,6% de los documentos, por lo que el filtrado de contenido es limitado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en producción sin evaluación previa.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-spp-seed42-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
