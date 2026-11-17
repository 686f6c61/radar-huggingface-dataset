# Raghav-Singhal/1pp-1.66b-v2-filt-sft

## Resumen

1pp-1.66b-v2-filt-sft es un modelo de lenguaje de 1.661.048.832 parámetros publicado por Raghav-Singhal como parte del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de la variante "Filtered" de la escalera de escalado 1PP, un artefacto de investigación que reproduce uno de los baselines del paper SPP sobre el corpus crudo de 1PP (documentos originales de DCLM-edu) y que después recibe un ajuste supervisado (SFT) sobre conversaciones.

El modelo emplea una arquitectura decoder estilo Llama con 24 capas, dimensión oculta de 2.048, FFN de 8.192 con SwiGLU, 16 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Su relevancia es metodológica más que de producto: permite comparar el efecto de filtrar documentos con un clasificador de seguridad (el 4,6 % de los documentos, 3.869.498, quedan en contexto pero sin pérdida) frente al entrenamiento crudo, manteniendo idéntico el flujo de datos, el número de pasos y el schedule. El autor advierte explícitamente de que no es un asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, sin QK-norm, sin biases, embeddings no atados) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos están en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, 2.048 de dimensión oculta y FFN de 8.192 con activación SwiGLU. Usa 16 cabezas de atención con 4 cabezas KV (GQA implícito, dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el de SmolLM2 (49.152 tokens) ampliado con `<|pad|>`; `<|endoftext|>` marca el fin de documento.

El preentrenamiento consume 31.777 pasos del flujo alineado por pasos del modelo raw (66,64B posiciones de token), con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 2.000 pasos, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100, weight decay 0,1, init std 0,0089 y precisión bf16. La condición "Filtered" mantiene en contexto los documentos marcados por un clasificador de seguridad basado en gte (puntuación por chunk, umbral ≥ 3 en el chunk de mayor puntuación) pero les asigna pérdida cero; el empaquetado de datos es idéntico byte a byte al del run raw.

El SFT se realiza durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3 %. La pérdida de validación del modelo base es de 2,409 sobre texto de documento, 2,503 sobre texto del asistente y 2,560 sobre texto de usuario; la pérdida SFT en tokens del asistente sobre 1.998 conversaciones retenidas es 1,936.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta multiturno heredados de la mezcla SFT (incluye un track de conversaciones con citas de constitución).
- Alineamiento de seguridad parcial, procedente de la muestra de 30k conversaciones del conjunto `sp-sft-safety-180k`.
- Detención controlada de la generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre filtrado de datos: comparar la curva de pérdida y el comportamiento del modelo frente al run raw (`1pp-1.7b-raw-base`) para aislar el efecto de eliminar la pérdida en documentos marcados por el clasificador de seguridad, manteniendo idéntico el flujo de entrenamiento.
- Reproducibilidad de baselines SPP: el modelo sirve como referencia controlada en experimentos de escalado, ya que comparte semilla (28), schedule y receta de SFT con el resto de la escalera 1PP.
- Estudio de alineamiento y seguridad: analizar cómo cambia la tasa de respuestas problemáticas al aplicar el filtro de documentos frente al modelo crudo, usando la muestra de seguridad del SFT.
- Evaluación de recetas de SFT: la mezcla de 400k conversaciones y la pérdida retenida de 1,936 permiten medir el impacto de cambios en la composición del dataset de ajuste supervisado.
- Experimentos académicos de bajo coste: con 1,66B parámetros y contexto de 4.096 tokens, el modelo cabe en una única GPU de consumo para fine-tuning con LoRA y en inferencia en bf16 en GPUs de 24 GB o más.
- Generación de texto controlada en inglés para pruebas de pipeline: validar integraciones de transformers, text-generation-inference o endpoints compatibles con un modelo pequeño y de licencia Apache 2.0.
- Docencia y divulgación: ilustrar el efecto del filtrado por clasificador y del SFT en un modelo de tamaño manejable con logs de entrenamiento públicos en Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Texto de documento (base, 2.433 docs retenidos) | 2,409 |
| Texto del asistente (base) | 2,503 |
| Texto del usuario (base) | 2,560 |
| SFT, tokens del asistente (1.998 conversaciones retenidas) | 1,936 |

Verificación de pesos: la pérdida HF sobre los segmentos [3, 4] de `sft_val` es 1,9363 frente a 1,9362 del checkpoint Megatron (diferencia absoluta 0,0001).

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en fp32: aproximadamente 6,6 GB para pesos.
- Cuantización: el autor no publica GGUF ni variantes cuantizadas; sería necesario convertir los safetensors a GGUF (por ejemplo con llama.cpp) para usar cuantizaciones de 4 u 8 bits.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100; también cabe en GPUs de consumo de 8 GB o más en bf16 con contexto corto.
- Despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; vLLM y llama.cpp no están documentados por el autor, aunque la arquitectura Llama es compatible en principio.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1.66b-v2-filt-sft | 1,66B | 4.096 | Apache 2.0 | Baseline filtrado con SFT; solo inglés; artefacto de investigación |
| 1pp-1.7b-raw-base | ~1,7B | 4.096 | Apache 2.0 | Run raw de referencia del mismo proyecto, sin filtrado |
| SmolLM2 (familia, 1.7B) | 1,7B | hasta 8.192 en algunas variantes | Apache 2.0 | Tokenizador compartido; modelo de propósito general |
| Modelos comparables de 1-2B | no disponible | no disponible | no disponible | Sin datos de benchmarks publicados para este modelo |

La comparación cuantitativa de rendimiento con alternativas no está disponible porque el autor no publica benchmarks.

## Limitaciones y advertencias

- El autor declara explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Idioma limitado al inglés; no se garantiza calidad en otros idiomas.
- Contexto de solo 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación no cuantificado; no hay evaluaciones de fidelidad publicadas.
- Sesgos: el filtrado usa un clasificador basado en gte con umbral ≥ 3 por chunk; los documentos marcados permanecen en contexto sin pérdida, lo que puede influir en el comportamiento residual del modelo.
- La pérdida de validación en texto de usuario (2,560) es superior a la de documento (2,409), lo que sugiere menor ajuste a ese dominio.
- Sin soporte documentado de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en producción sin evaluación previa.
- Repo con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte.
- No se publican cuantizaciones oficiales; cualquier conversión a GGUF corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-filt-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento: https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
