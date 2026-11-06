# Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-sft

## Resumen

`1pp-2.81b-v2-ua-rawanneal-sft` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de un decoder estilo Llama entrenado desde cero, no de un ajuste fino de un modelo existente, y forma parte de la "escalera" (ladder) v2 del estudio: cuatro tamaños (0.58B, 0.98B, 1.66B y 2.81B) cruzados con tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234), cada uno entrenado con 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos.

La condición concreta de este checkpoint es "original documents, then rewritten conversations, user+assistant loss in the cooldown": el modelo se preentrena con documentos DCLM-edu durante 48.339 pasos y después, en el cooldown (los últimos 5.370 de 53.709 pasos), sobre conversaciones reescritas a partir de esos mismos documentos, con pérdida tanto en turnos de usuario como de asistente. Posteriormente se aplica un SFT de una época sobre una mezcla de 400k conversaciones.

El modelo es relevante como artefacto de investigación: permite aislar el efecto de distintas condiciones de preentrenamiento sobre el comportamiento conversacional manteniendo constantes los datos por paso y la inicialización entre semillas. No está pensado como asistente de propósito general, y su licencia Apache 2.0 facilita la reproducibilidad y la experimentación académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 KV heads (GQA con head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizer usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento usa documentos DCLM-edu durante los primeros 48.339 pasos y, en el cooldown (últimos 5.370 de 53.709 pasos), conversaciones 1PP reescritas a partir de esos documentos, con pérdida sobre turnos de usuario y de asistente. Los corpus están alineados por pasos, de modo que cada paso de cooldown contiene las conversaciones reescritas de los documentos vistos en ese mismo paso. Se procesan 112,64B posiciones de token con batch global de 512 × 4.096 y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR de matriz 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16.

El SFT se realiza durante una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR de matriz 0,001, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación SFT en tokens de asistente sobre 1.998 conversaciones retenidas es de 1,744.

## Capacidades

- Generación de texto conversacional multiturno en inglés, con formato ChatML sin turno de sistema.
- Razonamiento y respuesta a instrucciones derivados del SFT sobre mezclas de conversaciones multiturno y de seguridad.
- Preentrenamiento con pérdida en turnos de usuario y asistente en el cooldown, lo que modela explícitamente la distribución de diálogo además de la de documentos.
- Soporte de parada de generación en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre preentrenamiento conversacional: el checkpoint permite comparar, contra `1pp-2.81b-v2-ua-sft` y las variantes de otras semillas, el efecto de sustituir documentos por conversaciones reescritas en el cooldown, manteniendo el flujo de datos alineado por pasos.
- Estudios de ablación de semillas: al compartir orden de batch y diferir solo en la inicialización, sirve para medir la varianza entre semillas en tareas de generación y en pérdida de validación.
- Evaluación de pérdida en tokens de asistente frente a tokens de usuario: útil para analizar cómo la condición de pérdida (usuario+asistente) afecta a la perplejidad por segmento (1,397 en texto de asistente, 1,308 en texto de usuario y 2,842 en texto de documento en el checkpoint final).
- Generación de diálogo controlada en inglés: con 4.096 tokens de contexto puede mantener conversaciones de varios turnos en tareas de laboratorio, aunque no está diseñado como asistente de producción.
- Baseline para ajuste fino posterior: al ser un modelo de 2,81B con licencia Apache 2.0 y pesos safetensors, puede servir como punto de partida para SFT o DPO en dominios concretos con presupuesto de cómputo moderado.
- Reproducción de experimentos del proyecto 1PP: los logs de entrenamiento en wandb (`1pp-training` y `1pp-sft`) permiten replicar curvas de pérdida y comparar con las referencias de Megatron (diferencia absoluta de 0,0000 en la pérdida de validación SFT).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documentos retenidos (2.433), checkpoint final | Pérdida por token, texto de asistente | 1,397 |
| Documentos retenidos (2.433), checkpoint final | Pérdida por token, texto de usuario | 1,308 |
| Documentos retenidos (2.433), checkpoint final | Pérdida por token, texto de documento | 2,842 |
| Documentos retenidos (2.433), checkpoint final | Pérdida ponderada por condición (`reweighted_seg1234`) | 1,392 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 1,744 |
| SFT validación, segmentos [3, 4] | Pérdida HF vs. referencia Megatron | 1,7436 vs. 1,7435 (diff. 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 7 y 9 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para despliegues con contexto completo de 4.096 tokens y batches moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090/4080 con cuantización; en GPUs de 8 GB requeriría cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados oficialmente para este checkpoint.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| `1pp-2.81b-v2-ua-rawanneal-sft` (este) | 2,81B | 4.096 | Apache 2.0 | en | Variante de mid-training con cooldown sobre conversaciones |
| `1pp-2.81b-v2-ua-sft` | 2,81B | 4.096 | Apache 2.0 | en | Ejecución 1PP completa, misma escalera y condición |
| `1pp-2.81b-v2-raw-base` | 2,81B | 4.096 | Apache 2.0 | en | Modelo base sin cooldown conversacional ni SFT |
| `1pp-1.7b-*` (escalón 1,66B) | 1,66B | 4.096 | Apache 2.0 | en | Escalón inferior de la misma escalera v2 |

No se dispone de datos de benchmarks que permitan comparar rendimiento con modelos externos de tamaño similar; la comparación se limita a las variantes del propio proyecto 1PP.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que no es un asistente de propósito general.
- Solo inglés: no se declara ni se ha entrenado para otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación; el SFT incluye una muestra de 30k conversaciones de seguridad, pero no hay métricas públicas de su efecto.
- El formato de chat es ChatML sin turno de sistema; introducir un turno de sistema puede degradar el comportamiento porque el modelo nunca lo vio durante el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su despliegue en producción sin evaluación previa.
- El modelo se entrenó con 112,64B posiciones de token y una pérdida de validación en texto de documento de 2,842, superior a la de asistente y usuario, lo que refleja el sesgo hacia el formato conversacional en el cooldown.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-sft
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-sft
- Modelo base sin cooldown conversacional: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento: https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
