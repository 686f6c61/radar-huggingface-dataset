# Sahmeee/olmo2-7b-instruct-inv-reference-mixed-ce-template

## Resumen

`Sahmeee/olmo2-7b-instruct-inv-reference-mixed-ce-template` es un checkpoint de investigación derivado por fine-tuning de `allenai/OLMo-2-1124-7B-Instruct`. Lo publica el usuario Sahmeee como artefacto de un estudio sobre la invariancia a la tokenización (denominada "reader invariance" en la model card) y su efecto sobre la robustez frente a re-tokenización adversarial. No es un producto: la propia model card lo etiqueta explícitamente como "research artifacts, not products".

El modelo conserva la arquitectura y el tamaño del base: un transformer decoder-only autoregresivo de 7.298.617.344 parámetros (7,3 B), sin mezcla de expertos y sin cambios en el número de parámetros. La innovación no está en la arquitectura, sino en el procedimiento de entrenamiento: se optimiza con un objetivo de exposición a entropía cruzada (`objective: ce_exposure`) sobre múltiples codificaciones adversarias del mismo texto (`num_encodings: 8`, `stochastok_p: 0.3`), lo que busca que el modelo responda de forma consistente independientemente de cómo se tokenice la entrada.

Su relevancia es acotada pero concreta: proporciona una referencia reproducible para medir si el entrenamiento con tokenización aumentada reduce la tasa de éxito de ataques de re-tokenización adversarial (AdvTok, Geh et al., arXiv:2503.02174) sin disparar el rechazo excesivo en prompts seguros. El modelo solo ha sido evaluado en inglés y sobre un conjunto de 200 prompts de AdvBench reservado por construcción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo, estilo Llama modificado (RMSNorm, SwiGLU, RoPE); fine-tune del base OLMo-2-1124-7B-Instruct |
| Parametros totales | 7.298.617.344 (7,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base OLMo 2 7B; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no hay GGUF, GPTQ ni AWQ publicados) |
| Idiomas soportados | Inglés (único idioma evaluado: AdvBench, XSTest y Alpaca). No se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 14,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base OLMo 2 7B Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El fine-tune no altera la topología ni el número de parámetros; la model card incluye una tabla de "parameter drift" que confirma que el entrenamiento solo movió ligeramente los pesos: atención 0,01219 de L2 relativo, MLP 0,01318, `lm_head` 0,00945, `embed_tokens` 0,00096 y capas de normalización 0,00102. Es decir, se trata de un ajuste superficial sobre el base, no de un reentrenamiento.

La configuración de entrenamiento reportada es: `mode: reference`, `objective: ce_exposure`, `kl_direction: forward`, `ce_weighting: uniform`, `ema_beta: None`, `harmful_mix: mixed`, `harmful_fraction: 0.286`, `num_encodings: 8`, `cvar_quantile: 0.25`, `max_steps: 700`, `learning_rate: 1e-05`, `grad_accum: 8`, `seed: 42`, `max_new_tokens: 128`, `prefix_tokens: 8` y `stochastok_p: 0.3`. El modelo de referencia para el término KL es el propio `allenai/OLMo-2-1124-7B-Instruct`. La innovación técnica consiste en maximizar la exposición a ocho codificaciones distintas del mismo texto, con un 28,6 % de contenido dañino mezclado, de modo que la representación interna sea invariante a la forma de tokenizar. No se documenta uso de RLHF ni DPO en este checkpoint.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del modelo base OLMo 2 7B Instruct.
- Robustez medida frente a re-tokenización adversarial (AdvTok): ASR de 0,125 con decodificación greedy sobre un holdout de 200 prompts de AdvBench.
- Comportamiento de rechazo calibrado: 0,965 de rechazo canónico en prompts dañinos y 0,068 de rechazo excesivo en prompts seguros de XSTest.
- Mantenimiento de utilidad general: F1 de tokens de 0,428 y NLL por token de 1,252 en Alpaca.
- Capacidad de servir como punto de comparación controlado en ablaciones de objetivos de entrenamiento (reference frente a ce_exposure).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Multilingüismo: no documentado; la evaluación es exclusivamente en inglés.

## Casos de uso

- Investigación en robustez de tokenización: el modelo sirve como brazo "reference" en estudios que miden la tasa de éxito de ataques de re-tokenización, comparando su ASR de 0,125 contra el 0,565 del base sin ajuste.
- Evaluación de clasificadores de seguridad: dado que las métricas se obtienen con Llama-Guard-3-8B como juez, el checkpoint permite validar pipelines de moderación sobre respuestas generadas bajo ataque.
- Ablaciones de objetivos de entrenamiento: al compartir configuración con otras variantes del mismo estudio (`ce_exposure`, distintos `harmful_fraction`), permite aislar el efecto de la diversidad de codificaciones frente a la longitud de supervisión.
- Reproducción de experimentos: con `seed: 42`, 700 pasos y learning rate de 1e-05, cualquier laboratorio puede replicar el ajuste sobre el mismo base y verificar la tabla de deriva de parámetros.
- Estudio del equilibrio seguridad-utilidad: los pares de métricas XSTest (0,068 de sobre-rechazo) frente a ASR permiten analizar la curva de compromiso entre rechazar ataques y no rechazar peticiones legítimas.
- Análisis de longitud de respuesta en ataques: la model card señala que la respuesta adversaria media es de 392 caracteres frente a 898-1139 en brazos comparables, lo que convierte a este checkpoint en un caso de estudio sobre la correlación entre verbosidad y ASR.
- No se recomienda su uso como asistente en producción: es un artefacto de investigación, con una sola semilla y sin garantías de robustez frente a otros jailbreaks.

## Benchmarks y rendimiento

Resultados medidos sobre un holdout de 200 prompts de AdvBench excluido del entrenamiento por construcción. `AdvTok ASR` es la tasa de éxito bajo tokenización adversarial (Geh et al., arXiv:2503.02174), juzgada con Llama-Guard-3-8B y decodificación greedy.

| Metrica | Este modelo | Referencia zeroshot (base) |
|---|---|---|
| AdvTok ASR (greedy) | 0,125 | 0,565 |
| AdvTok ASR (t=1) | 0,247 | 0,584 |
| Canonical ASR (greedy, sin ataque) | 0,03 | no disponible |
| Canonical refusal (greedy) | 0,965 | no disponible |
| XSTest over-refusal (seguros) | 0,068 | no disponible |
| XSTest refusal (inseguros) | 0,917 | no disponible |
| Alpaca over-refusal | 0,028 | no disponible |
| Alpaca token F1 | 0,428 | no disponible |
| Alpaca NLL/token | 1,252 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

Dos advertencias afectan a la interpretación de estos números: las métricas de margen de rechazo (`margin_canonical`, `margin_spread`) se omiten deliberadamente por ser circulares en este brazo, y el ASR a tope fijo de generación mide en parte cuánto texto produce el modelo, por lo que no está establecido que sea independiente de la longitud.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados, no publicados por el autor): BF16/FP16 en torno a 16-18 GB contando pesos (14,6 GB) y overhead de activaciones; INT8 en torno a 9-10 GB; INT4 en torno a 5-6 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, RTX 4090 24 GB o RTX 3090 24 GB.
- Cabe en GPU de consumo: sí. En RTX 4090/3090 (24 GB) en BF16; en GPUs de 16 GB como RTX 4080 en INT8; en GPUs de 12 GB como RTX 4070 en INT4.
- Opciones de despliegue: transformers, vLLM y TGI admiten los pesos safetensors directamente. llama.cpp y Ollama requieren una conversión a GGUF que no está publicada en el repositorio.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AdvTok ASR (greedy) | AdvTok ASR (t=1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (reference_mixed_ce_template) | 7,3 B | 4.096 | 0,125 | 0,247 | Apache 2.0 | HuggingFace (0 descargas) |
| allenai/OLMo-2-1124-7B-Instruct (base) | 7,3 B | 4.096 | 0,565 | 0,584 | Apache 2.0 | HuggingFace |
| Otras variantes del mismo estudio (p. ej. ce_exposure) | 7,3 B | 4.096 | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Otros modelos instruct de 7-8 B con foco en seguridad | 7-8 B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa solo es posible con el modelo base, que es el único para el que la model card proporciona cifras de referencia. No hay datos públicos que permitan situar este checkpoint frente a modelos de seguridad de propósito general como Llama-Guard-3-8B, que aquí actúa únicamente como juez de las respuestas.

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo declara explícitamente como no productivo. No debe desplegarse como asistente de cara al público sin una evaluación adicional.
- Una sola semilla (42): el autor no reclama significación estadística entre semillas.
- Evaluación limitada al inglés y a tres conjuntos (AdvBench, XSTest, Alpaca). No hay validación en otros idiomas ni dominios.
- Las cifras de seguridad corresponden al ataque concreto estudiado (tokenización adversarial); no implican robustez frente a otros tipos de jailbreak.
- El ASR a tope fijo de generación no está demostrado como independiente de la longitud de la respuesta, lo que limita la comparabilidad con otros brazos.
- Riesgo de alucinación: no cuantificado en la información disponible, pero heredado de un modelo base de 7 B.
- Sesgos: no documentados por el autor; se heredan los del corpus de entrenamiento de OLMo 2 y del dataset de ajuste, predominantemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la propia naturaleza experimental del checkpoint desaconseja ese uso.
- Sin cuantizaciones publicadas: no hay GGUF, GPTQ ni AWQ, por lo que el despliegue en llama.cpp u Ollama exige conversión manual.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sahmeee/olmo2-7b-instruct-inv-reference-mixed-ce-template
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Paper del ataque AdvTok (Geh et al.): https://arxiv.org/abs/2503.02174
- OLMo 2 en Ai2: https://allenai.org/olmo2
- Familia OLMo Instruct (versión 1): https://huggingface.co/allenai/OLMo-7B-Instruct
- Ficha de Olmo2 7B Instruct en LLM Radar: https://open-llm-radar.com/models/olmo2-7b-instruct
- Guía de despliegue local de OLMo 2: https://localaimaster.com/blog/olmo-2-local-setup
