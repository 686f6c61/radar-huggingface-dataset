# Raghav-Singhal/1pp-0.98b-v2-raw-sft

## Resumen

1pp-0.98b-v2-raw-sft es un modelo de lenguaje de 981.545.472 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición de los datos de preentrenamiento (en concreto, la presencia de documentos originales frente a conversaciones adversariales) al comportamiento final del modelo tras un ajuste supervisado. El modelo pertenece a la "escalera" ladder v2, que abarca cuatro tamaños (0.58B, 0.98B, 1.66B y 2.81B) cruzados con tres condiciones de preentrenamiento y tres semillas.

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. Se entrenó desde cero durante 18.779 pasos sobre documentos DCLM-edu, con un total de 39,38B posiciones de token, y después recibió un epoch de SFT sobre 400.000 conversaciones.

Su relevancia es metodológica: al mantener constante la secuencia de pasos y el flujo de datos entre condiciones y variar únicamente el texto del documento y la máscara de pérdida, el modelo sirve como punto de control reproducible para aislar el efecto de los datos. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización en experimentos académicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (12 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 128), FFN SwiGLU de 6.144 unidades, RMSNorm y RoPE con base 10.000. No usa embeddings atados ni biases, y no incorpora QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 entradas) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento usa los documentos originales de DCLM-edu con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`, enmascaramiento de atención entre documentos, batch global de 512 secuencias × 4.096 tokens y precisión bf16. El optimizador es Muon (con escalado por forma y LR matricial de 0,005) para las matrices, complementado con Adam para el resto de parámetros (LR 2,3e-3 en embeddings y capa de salida, 3e-3 en normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1 e inicialización con desviación estándar 0,0103. La pérdida de validación por token sobre 2.433 documentos retenidos es de 2,498 para texto de documento, 2,634 para texto de asistente y 2,664 para texto de usuario.

El ajuste supervisado consiste en un epoch sobre una mezcla de 400.000 conversaciones: 98.500 multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft` (con citas a constitución), 271.600 de `dlab-spp/sp-sft-normal-300k` (deduplicadas respecto al primer conjunto) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se emplea el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial de 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre tokens de asistente en 1.998 conversaciones es de 2,049, y los pesos de Hugging Face se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0000 en la pérdida de validación.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno dentro de conversaciones de hasta 4.096 tokens.
- Seguimiento de instrucciones aprendido mediante SFT sobre mezclas que incluyen datos de seguridad y de constitución.
- Respuestas con pérdida calculada únicamente en turnos de asistente, lo que favorece la coherencia de la respuesta frente al contexto del usuario.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: el modelo es un punto de control de la escalera 1PP que permite comparar, con la misma secuencia de pasos y la misma inicialización de batch, el efecto de entrenar sobre documentos originales frente a otras condiciones; se usaría como referencia en experimentos controlados de ablación.
- Reproducción de resultados académicos: al publicarse los logs de wandb y las referencias de pérdida de validación, sirve para replicar el pipeline de Megatron + Muon y verificar la conversión a safetensors.
- Estudio de dinámicas de SFT: con una pérdida retenida de 2,049 sobre 1.998 conversaciones, permite analizar cómo un modelo preentrenado en documentos originales responde a mezclas de SFT que incluyen datos de seguridad y de constitución.
- Evaluación de alineación y seguridad a pequeña escala: la inclusión de 30.000 muestras de `sp-sft-safety-180k` lo hace útil para estudiar la transferencia de comportamientos de seguridad en modelos de menos de 1B parámetros.
- Prototipado de pipelines de conversación en inglés: su formato ChatML explícito y su plantilla de chat incluida permiten integrarlo en entornos de prueba de transformers y text-generation-inference sin trabajo de adaptación.
- Análisis de eficiencia de tokenizadores: al usar el vocabulario de SmolLM2 con 49.152 entradas, sirve para medir el impacto del tokenizador en la pérdida por token y en la longitud efectiva de las secuencias.
- Docencia y experimentación con modelos pequeños: con 981M parámetros y pesos en bf16, es viable en una GPU de consumo para demostrar el ciclo completo de preentrenamiento, SFT y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Pérdida por token |
|---|---|
| Texto de asistente (validación de preentrenamiento) | 2,634 |
| Texto de usuario (validación de preentrenamiento) | 2,664 |
| Texto de documento (validación de preentrenamiento) | 2,498 |
| Tokens de asistente en SFT retenido (1.998 conversaciones) | 2,049 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto y batch.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto completo; RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 son suficientes. Cabe holgadamente en GPUs de consumo.
- Despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.98b-v2-raw-sft | 981,5M | 4.096 | Apache 2.0 | Artefacto de investigación 1PP con SFT |
| SmolLM2-1.7B | 1,7B | no disponible | Apache 2.0 | Modelo pequeño de propósito general |
| Llama 3.2 1B | 1,24B | 128K (según documentación pública) | Llama 3.2 Community License | Asistente generalista |
| Qwen2.5-1.5B | 1,5B | 32K (según documentación pública) | Apache 2.0 | Asistente generalista multilingüe |

La comparación directa no es posible en términos de benchmarks porque el autor no publica resultados de MMLU, HumanEval ni GSM8K. La diferencia principal frente a los modelos generalistas es el propósito: 1pp-0.98b-v2-raw-sft está diseñado como control experimental, con contexto corto (4.096) y solo inglés, mientras que los alternativos priorizan contexto largo y multilingüismo.

## Limitaciones y advertencias

- El propio autor indica que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general; no debería usarse en producción como chatbot.
- Solo soporta inglés; no se documenta entrenamiento ni evaluación en otros idiomas.
- Longitud de contexto de 4.096 tokens, insuficiente para tareas de contexto largo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de automatización complejos.
- Riesgo de alucinación inherente a un modelo de menos de 1B parámetros entrenado con 39,38B tokens; no hay evaluaciones de fidelidad publicadas.
- Sesgos: el preentrenamiento usa DCLM-edu, con los sesgos propios de datos web filtrados; no se documenta ningún proceso de mitigación más allá de la mezcla de SFT de seguridad.
- El formato ChatML no incluye turno de sistema, de modo que prompts con rol `system` no serán interpretados como en modelos convencionales.
- No se publican cuantizaciones GGUF ni versiones optimizadas para llama.cpp u Ollama, lo que limita el despliegue en entornos de bajo consumo.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del modelo desaconseja su uso en aplicaciones críticas sin evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
