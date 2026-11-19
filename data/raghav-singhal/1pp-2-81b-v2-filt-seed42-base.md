# Raghav-Singhal/1pp-2.81b-v2-filt-seed42-base

## Resumen

1pp-2.81b-v2-filt-seed42-base es un modelo base de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP), una escalera de escalado experimental. Se trata de la variante "filt" (filtered baseline) de la versión v2 con semilla 42, un artefacto de investigación que reproduce una de las condiciones del paper SPP sobre el corpus crudo de 1PP (documentos DCLM-edu originales).

El modelo es un decoder estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. No es un asistente de propósito general: es un modelo base entrenado sobre documentos que produce texto plano.

La relevancia de esta ficha es metodológica más que de producto. El modelo sirve como referencia controlada para estudiar el efecto del filtrado de datos: un clasificador de seguridad basado en gte puntuó por fragmentos y marcó 3.869.498 documentos (4,6 %) con puntuación máxima de fragmento de al menos 3. Esos documentos permanecen en las secuencias de entrenamiento (en contexto) pero no reciben pérdida, mientras el resto se entrena igual que en el run crudo. La comparación directa es con `1pp-2.81b-v2-raw-seed42-base`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama |
| Parámetros totales | 2.807.699.328 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Arquitectura decoder transformer densa de 24 capas con dimensión oculta 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador emplea el vocabulario de SmolLM2 (49.152) más `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. El entrenamiento usó mascaramiento de atención entre documentos (cross-document attention masking).

El preentrenamiento cubrió 53.709 pasos sobre el flujo alineado por paso del run crudo, lo que equivale a 112,64B posiciones de token, con batch global de 512 × 4.096 tokens. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0078 y precisión bf16. La innovación metodológica es el filtrado: un clasificador gte puntuó por fragmentos y marcó 3.869.498 documentos (4,6 %) con puntuación máxima ≥ 3; esos documentos se mantienen en las secuencias pero se enmascaran de la pérdida. La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos) fue de 2,324 para texto de documento, 2,391 para texto de asistente y 2,467 para texto de usuario.

## Capacidades

- Generación de texto plano en inglés: es un modelo base, no un asistente instruido.
- Modelado de lenguaje autoregresivo sobre documentos y sobre conversaciones reescritas a partir de ellos.
- Formato de chat ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio controlado del filtrado de datos: comparar este checkpoint con `1pp-2.81b-v2-raw-seed42-base` para aislar el efecto de enmascarar de la pérdida los documentos marcados por el clasificador de seguridad, manteniendo el mismo orden y presupuesto de tokens.
- Reproducción de experimentos de escalado: servir como punto de la escalera 1PP v2 a 2,81B parámetros con semilla 42, útil para replicar curvas de pérdida y validar recetas de optimización (Muon + Adam).
- Evaluación de clasificadores de seguridad de datos: usar las pérdidas de validación por tipo de texto (documento, asistente, usuario) para medir el impacto del filtro gte sobre la calidad del modelado.
- Investigación sobre mascaramiento de pérdida en contexto: estudiar cómo el entrenamiento con documentos presentes pero no entrenados afecta a la perplejidad en dominios concretos de DCLM-edu.
- Fine-tuning posterior como base de investigación: partir de este checkpoint para SFT o DPO en tareas en inglés, dado que el proyecto dispone de logs de SFT separados.
- Verificación de conversiones de pesos: la model card documenta la comprobación de los pesos HF frente al checkpoint Megatron recomputando pérdidas de validación (diferencias absolutas de 0,0017 en los conjuntos val50m y raw_val50m), lo que lo hace útil como referencia de integridad de pipelines de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta pérdidas de validación y la verificación de conversión de pesos:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,3889 | 2,3906 | 0,0017 |
| raw_val50m segments [8] | 2,3255 | 2,3238 | 0,0017 |

| Tipo de texto (validación, checkpoint final) | Pérdida por token |
|---|---|
| Texto de documento | 2,324 |
| Texto de asistente | 2,391 |
| Texto de usuario | 2,467 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, 2,81B parámetros en bf16 requieren aproximadamente 5,6 GB solo para pesos, a lo que hay que sumar caché KV y activaciones.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de pesos, un checkpoint en bf16 de ~5,6 GB es compatible en términos de memoria con GPU de consumo de 8 GB o más, aunque no se ha verificado ni documentado.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face). Otras opciones como vLLM, llama.cpp u Ollama no están documentadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-filt-seed42-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Baseline filtrado, inglés, modelo base |
| 1pp-2.81b-v2-raw-seed42-base | 2,81B (misma arquitectura) | 4.096 | Apache 2.0 | Hugging Face | Run crudo de referencia, sin filtrado |
| SmolLM2 (familia) | no disponible en la información | no disponible | no disponible | Hugging Face | Solo comparte vocabulario (49.152); sin datos comparativos |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: produce texto plano y no está alineado para seguir instrucciones de forma fiable.
- Entrenado únicamente en inglés; el soporte multilingüe es inexistente según la model card.
- Riesgo de alucinación y de reproducir sesgos presentes en el corpus DCLM-edu, sin filtrado de salida ni RLHF documentado.
- El filtrado solo afecta a la pérdida: los documentos marcados por el clasificador de seguridad permanecen en contexto, por lo que el modelo puede haber aprendido de ellos de forma indirecta.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- Artefacto de investigación del proyecto 1PP (EPFL DLAB); el autor lo declara explícitamente como no apto para uso como asistente de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de alineación desaconseja su despliegue en producción sin evaluación adicional.
- Sin descargas ni likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-filt-seed42-base
- Modelo crudo de comparación: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
