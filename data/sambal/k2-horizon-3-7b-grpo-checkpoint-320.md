# sambal/k2-horizon-3.7b-grpo-checkpoint-320

## Resumen

WellLogLLM-3.7B es un modelo de lenguaje especializado en interpretación de registros de pozo (well logs) para petrofísica, desarrollado por el usuario sambal. Se trata del checkpoint fusionado del paso global 320 del entrenamiento GRPO (Group Relative Policy Optimization) sobre un modelo base previamente ajustado con DPO y RPO. El modelo parte de K2-Horizon-3.7B (de IFM) y aplica una cadena de post-entrenamiento orientada a mejorar la calidad de las respuestas técnicas en un dominio muy concreto.

El modelo resuelve el problema de generar interpretaciones petrofísicas rigurosas a partir de preguntas sobre registros de pozo, incluyendo preguntas de formación única, multi-pozo y cross-formación. Es relevante porque demuestra cómo el alineamiento por RL (GRPO con reward de LLM-juez) puede mejorar sustancialmente métricas de dominio específico frente a DPO, en un modelo de tamaño medio (3.7B nominales, 5.058 millones de parámetros reales en safetensors).

La arquitectura es un transformer causal con código de modelado personalizado (`K2HorizonForCausalLM`), pesos en BF16 y licencia Apache 2.0. El contexto soportado es de 65.536 tokens según la configuración de despliegue recomendada con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal `K2HorizonForCausalLM` (código personalizado, requiere `trust_remote_code=True`) |
| Parametros totales | 5.058.255.360 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (según `--max-model-len 65536` en la configuración de vLLM) |
| Tipos de cuantizacion | BF16 en el repo principal; GGUF disponible en `sambal/WellLogLLM-3.7B-GGUF` (cuantizaciones concretas no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (5 shards, modelo completo, no LoRA); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer causal con implementación personalizada (`K2HorizonForCausalLM`), derivado de K2-Horizon-3.7B de IFM. Los pesos se distribuyen en 5 shards de safetensors en BF16, convertidos desde el checkpoint maestro fusionado en FP32. El repositorio incluye configuración, código de modelado, tokenizer y plantilla de chat.

La cadena de post-entrenamiento es: base K2-Horizon-3.7B → DPO con normalización por longitud + RPO (checkpoint 400) → GRPO (este checkpoint, paso 320). El entrenamiento GRPO usó pesos maestros en FP32, 16 prompts × 8 rollouts por paso, temperatura 1.0, top-p 1.0, respuesta máxima de 10.240 tokens, learning rate 2.4e-6 y reward basado en un LLM-juez que puntúa cada rollout contra una respuesta de referencia. El dataset consistió en 2.815 prompts de interpretación de well logs (formación única, multi-pozo y cross-formación), con 2 épocas (350 pasos); este checkpoint (paso 320) se seleccionó sobre una evaluación held-out.

## Capacidades

- Generación de texto conversacional orientada a interpretación petrofísica de registros de pozo.
- Razonamiento técnico sobre preguntas de formación única, multi-pozo y cross-formación.
- Modo de razonamiento con parser específico (`--reasoning-parser k2_horizon`) en vLLM.
- Integración con el harness agéntico PetroHarness, para el que fue entrenado.
- Soporte de plantilla de chat y formato de contenido string en vLLM.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Interpretación de registros de pozo en exploración petrolífera: el modelo responde preguntas sobre formaciones concretas a partir de datos de well logs, aprovechando su entrenamiento específico en 2.815 prompts de petrofísica y su contexto de 65.536 tokens para incluir múltiples registros en una sola consulta.
- Análisis multi-pozo: permite comparar interpretaciones entre varios pozos dentro de la misma ventana de contexto, adecuado para estudios de correlación lateral en un campo.
- Preguntas cross-formación: útil para evaluar continuidad y variaciones entre formaciones geológicas, con un rendimiento W de 63,7 en esta categoría según la benchmark del autor.
- Asistente dentro de PetroHarness: el modelo está entrenado para operar en este harness agéntico, por lo que se puede desplegar como motor de razonamiento en flujos de trabajo de interpretación asistida.
- Despliegue en estaciones de trabajo sin GPU: la disponibilidad de GGUF permite ejecutarlo con Ollama o llama.cpp en portátiles o Mac con Metal, útil para geólogos en campo.
- Generación de informes técnicos de interpretación: con modo de razonamiento y hasta 10.240 tokens de respuesta, puede producir explicaciones extensas y estructuradas sobre una formación.
- Servicio de inferencia en producción con vLLM: para equipos que necesiten atender consultas concurrentes de interpretación con contexto largo.

## Benchmarks y rendimiento

Benchmark de interpretación de well logs del autor (1.075 preguntas: 347 de formación única, 424 multi-pozo, 304 cross-formación), puntuado por un LLM-juez contra respuestas expertas (0–100; W = 0,4·RA + 0,2·Trust + 0,2·Style + 0,2·RQ):

| Modelo | RA | Trust | Style | RQ | W |
|---|---|---|---|---|---|
| K2-Horizon-3.7B (base) | 49,1 | 58,8 | 52,4 | 61,1 | 54,1 |
| + DPO (checkpoint 400) | 52,4 | 59,8 | 62,9 | 67,1 | 58,9 |
| + GRPO (este modelo, checkpoint 320) | 63,8 | 65,0 | 55,6 | 71,3 | 63,9 |

Por tipo de pregunta (W): formación única 61,6; multi-pozo 66,0; cross-formación 63,7.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 10,1 GB solo para pesos, más overhead de activaciones y KV cache; con contexto de 65.536 tokens el consumo de KV cache puede ser significativo.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con contexto completo; RTX 4090 (24 GB) puede alojar el modelo en BF16 con margen limitado para contexto largo.
- Consumer GPU: sí, en GPUs con al menos 16–24 GB en BF16; con cuantización GGUF puede ejecutarse en equipos con menos VRAM e incluso en CPU.
- Opciones de despliegue: vLLM 0.30 o superior (Linux, NVIDIA GPU) con `--trust-remote-code`, `--reasoning-parser k2_horizon` y `--chat-template-content-format string`; llama.cpp y Ollama mediante el GGUF; Transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| WellLogLLM-3.7B (este) | 5.058 M | 65.536 | Apache 2.0 | Petrofísica / well logs |
| K2-Horizon-3.7B (base) | 3,7B nominales | No disponible | No disponible | Propósito general |
| DPO checkpoint 400 (predecesor) | 3,7B nominales | No disponible | Apache 2.0 | Petrofísica / well logs |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está post-entrenado exclusivamente para interpretación de well logs en petrofísica; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al de un modelo generalista.
- Riesgo de alucinación: al ser evaluado con un LLM-juez y no con validación humana exhaustiva, las respuestas pueden contener interpretaciones plausibles pero incorrectas; requiere revisión por expertos en producción.
- Idiomas: no se documentan los idiomas soportados; el uso en castellano u otros idiomas distintos del inglés no está garantizado.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; debe auditarse antes de desplegar en entornos sensibles.
- El checkpoint es el paso 320 de 350, seleccionado por evaluación held-out; no es necesariamente el punto final óptimo para todos los casos.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni soporte del autor.
- Sin datos publicados de sesgos, throughput o latencia; conviene realizar una evaluación propia antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sambal/k2-horizon-3.7b-grpo-checkpoint-320
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Checkpoint DPO predecesor: https://huggingface.co/sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400
- GGUF: https://huggingface.co/sambal/WellLogLLM-3.7B-GGUF
- PetroHarness: https://welllogbench.com/petroharness/
- Documentación de instalación de PetroHarness: https://welllogbench.com/petroharness/docs/install.html
