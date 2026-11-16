# Raghav-Singhal/1pp-0.98b-v2-filt-base

## Resumen

1pp-0.98b-v2-filt-base es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: es la variante "filtrada" (filtered baseline) del peldaño de 0,98B parámetros de la escalera de escalado 1PP, con semilla 28.

El modelo existe para permitir una comparación controlada dentro del paper SPP: reproduce dos de sus baselines sobre el corpus crudo de 1PP (los documentos originales de DCLM-edu). La condición "Filtered" mantiene en las secuencias de entrenamiento todos los documentos del run crudo, en el mismo orden y con el mismo número de pasos y schedule, pero aplica un clasificador de seguridad basado en gte que marcó 3.869.498 documentos (4,6%) con puntuación máxima de chunk igual o superior a 3. Esos documentos permanecen en contexto pero no reciben pérdida; el resto se entrena igual que en el run crudo.

Su relevancia es metodológica: sirve como referencia para medir el efecto del filtrado de seguridad sobre el entrenamiento, comparándolo con el modelo crudo del mismo tamaño y configuración. Con 981.545.472 parámetros reales, 24 capas y una longitud de secuencia de 4.096 tokens, es un modelo pequeño pensado para experimentación reproducible, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 2,0 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size de 1.536 y FFN de 6.144 con activación SwiGLU. Usa 12 cabezas de atención con 4 KV heads (GQA implícito, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos (cross-document attention masking).

El preentrenamiento cubre 18.779 pasos sobre el stream alineado por pasos del run crudo, lo que equivale a 39,38B posiciones de token, con batch global de 512 × 4.096 tokens. El optimizador es Muon (shape scaling, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas). El schedule incluye 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100. Weight decay 0,1, init std 0,0103 y entrenamiento en bf16. La innovación del run "Filtered" es que los documentos marcados por el clasificador de seguridad (4,6% del corpus) permanecen en las secuencias pero se enmascaran en la pérdida, manteniendo el empaquetado de datos byte a byte idéntico al run crudo. El autor verificó los pesos de Hugging Face contra el checkpoint de Megatron recomputando pérdidas de validación, con diferencias absolutas de 0,0016 y 0,0015.

## Capacidades

- Generación de texto base: el modelo es un modelo base entrenado sobre documentos y produce texto plano; no está ajustado para seguir instrucciones ni para conversar.
- Razonamiento y conocimiento derivado del corpus DCLM-edu, sin evaluación publicada de capacidades específicas.
- Formato de chat ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de filtrado de datos: sirve como baseline controlado para medir el impacto del filtrado de seguridad sobre la pérdida de validación, comparándolo con `1pp-0.98b-v2-raw-base` bajo el mismo schedule y los mismos datos.
- Investigación sobre enmascaramiento de pérdida: permite estudiar qué ocurre cuando se mantienen documentos en contexto pero se excluyen de la pérdida, un patrón relevante para técnicas de data curation y curriculum learning.
- Validación de pipelines de entrenamiento: el modelo y sus logs de wandb permiten comprobar la fidelidad de conversiones entre Megatron y Hugging Face, con diferencias de pérdida documentadas del orden de 0,0015.
- Estudio de escalado de modelos pequeños: con 0,98B parámetros y 39,38B tokens vistos, es un punto de referencia útil en análisis de leyes de escalado a baja escala.
- Fine-tuning académico: al ser un modelo base de 981M parámetros con licencia Apache 2.0, puede ajustarse para tareas concretas de NLP en entornos con recursos limitados.
- Experimentos de seguridad y alineación: la marca de documentos filtrados por el clasificador gte permite analizar cómo afecta el contenido flaggeado a las representaciones internas del modelo.
- Docencia y prototipado: su tamaño permite ejecutarlo en hardware modesto para demostraciones de preentrenamiento y evaluación de modelos de lenguaje.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Solo se reportan pérdidas de validación del checkpoint final sobre 2.433 documentos reservados y las conversaciones reescritas a partir de ellos:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de documento | 2,509 |
| Texto de asistente | 2,646 |
| Texto de usuario | 2,679 |

Verificación de pesos HF frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,6441 | 2,6457 | 0,0016 |
| raw_val50m segments [8] | 2,5106 | 2,5091 | 0,0015 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB con contexto completo de 4.096 tokens.
- VRAM estimada en fp32: unos 4 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4, A100 y H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuyen GGUF oficiales).
- Latencia y throughput estimados: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-filt-base | 981M | 4.096 | Apache 2.0 | Baseline filtrado del proyecto 1PP; pérdida de validación 2,509 en texto de documento |
| 1pp-0.98b-v2-raw-base | 981M | 4.096 | Apache 2.0 | Run crudo del mismo peldaño, sin filtrado; referencia directa de comparación |
| SmolLM2-1.7B | 1,7B | 8.192 (según model card pública) | Apache 2.0 | Modelo base de tamaño similar, tokenizador compartido; datos de rendimiento no verificados en esta ficha |
| Llama 3.2 1B | 1,2B | 128K (según model card pública) | Llama 3.2 Community License | Modelo base comparable en escala; licencia con restricciones de uso comercial |

La comparación con SmolLM2 y Llama 3.2 se ofrece solo como referencia de categoría; no se dispone de evaluaciones cruzadas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no sigue instrucciones de forma fiable y puede producir texto incoherente o repetitivo en formato conversacional.
- Riesgo de alucinación alto: no se ha aplicado RLHF, DPO ni ajuste de instrucciones; el modelo no está calibrado para tareas de respuesta factual.
- Solo inglés declarado; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El filtrado de seguridad solo afecta a la pérdida, no a la presencia de contenido flaggeado en el contexto; el modelo puede haber aprendido representaciones de documentos marcados.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar que permita compararlo con alternativas.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como artefacto de investigación y no como asistente de propósito general; no hay garantías de calidad para producción.
- Sin cuantizaciones oficiales publicadas; la conversión a GGUF u otros formatos corre por cuenta del usuario.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-filt-base
- Modelo crudo de comparación: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
