# jstarks/Qwen3.5-9B-Weight-Space-Programming

## Resumen

Qwen3.5-9B-Weight-Space-Programming es un modelo derivado de Qwen/Qwen3.5-9B publicado por el usuario jstarks bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor lo presenta como una implementación de "Weight-Space Programming" (WSP v3.0), una técnica de modificación de pesos en forma cerrada y sin entrenamiento (training-free) que sintetiza nueve subespacios LoRA de rango 16 en `f32` (etiquetados S1..S9) y los aplica sobre el modelo base. El repositorio incluye tanto los adaptadores GGUF para `llama-server` como los parches safetensors para PyTorch/Transformers, además de un parche denso combinado en BF16 de 864 MiB.

El modelo base Qwen3.5-9B tiene 32 capas, `hidden_size=4096`, `intermediate_size=12288`, MLP con SwiGLU y normalización RMSNorm con esquema `1+w`. El repositorio declara 8.953.803.264 parámetros reales en safetensors (unos 8,95 mil millones) y un tamaño de repo de 6,7 GB. La etiqueta `deltanet` sugiere arquitectura híbrida, pero la información disponible no detalla la composición exacta de capas.

La relevancia de esta ficha es doble: por un lado documenta una técnica de interpretabilidad mecanicista y programación de pesos aplicada a un modelo de ~9B; por otro, los resultados publicados por el propio autor muestran que la intervención WSP v3.0 **degrada** el rendimiento agregado del modelo base en 8 puntos porcentuales (de 84/100 a 76/100) en la batería de 100 tareas, por lo que debe evaluarse con cautela antes de usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (32 capas, hidden_size=4096, intermediate_size=12288, MLP SwiGLU, RMSNorm `1+w`); etiqueta `deltanet` sin detalle en la informacion disponible |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 16384 tokens en la configuracion de evaluacion (`-c 16384`); contexto nativo del base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (5.290 GiB); KV cache q8_0 (`-ctk q8_0 -ctv q8_0`); parches LoRA en f32 rango 16; parche denso BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/Transformers), GGUF (llama.cpp), adaptadores LoRA GGUF y safetensors r16 |

## Arquitectura y entrenamiento

El modelo no se entrena: WSP v3.0 es una técnica "training-free, closed-form" que sintetiza nueve subespacios LoRA de rango 16 en `f32` (S1_THINK, S2_RESTRAINT, S3_ROUTER, S4_CODE, S5_TURN2_JSON, S6_HANDOFF, S7_INJ_GUARD, S8_GROUNDING, S9_ERR_RECOV) y los inyecta sobre el modelo base Qwen3.5-9B. El autor describe el modo de síntesis como `calibrated_proxy_weight_space`. Se distribuyen tanto adaptadores GGUF individuales para `llama-server` como parches safetensors r16 para Transformers, más un parche denso combinado BF16 de 864 MiB (`wsp_qwen35_9b_patch.safetensors`).

No hay información sobre el corpus de calibración, el número de tokens usados en la síntesis ni sobre si hubo RLHF o DPO (no aplica en un esquema training-free). La etiqueta `deltanet` en los tags sugiere algún componente de atención lineal o arquitectura híbrida en el base, pero la model card no aporta detalles. Tampoco se documenta el mecanismo exacto de la "programación de pesos" más allá de la nomenclatura de subespacios y el rango de las matrices.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Tool calling y function calling, con un subespacio específico (S3_ROUTER) orientado a enrutado multi-herramienta.
- Comportamiento de agente: restricción de herramientas y anti-sicofancia (S2_RESTRAINT), puerta de escalado (S6_HANDOFF), recuperación de errores (S9_ERR_RECOV).
- Síntesis de código en banda media (S4_CODE) y salida JSON estructurada en segundo turno (S5_TURN2_JSON).
- Guardia contra inyección indirecta de prompts (S7_INJ_GUARD) y abstención fundamentada (S8_GROUNDING).
- Capacidad multimodal declarada por el tag `image-text-to-text` del repo, aunque la model card no documenta el pipeline de visión.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutado multi-herramienta en asistentes: el subespacio S3_ROUTER está diseñado para seleccionar entre varias tools según la consulta; útil en orquestadores que despachan a APIs heterogéneas.
- Agentes con control de escalado: S6_HANDOFF permite decidir cuándo derivar a un humano o a un modelo mayor, lo que encaja en pipelines con niveles de confianza.
- Guardia de inyección de prompts: S7_INJ_GUARD puede usarse como capa de filtrado en aplicaciones RAG que ingieren contenido externo no confiable.
- Salida JSON estructurada en segundo turno: S5_TURN2_JSON facilita integraciones que requieren respuestas parseables tras una primera interacción libre.
- Experimentación en interpretabilidad mecanicista: el repo expone subespacios r16 y un parche denso, lo que permite estudiar cómo modificaciones de pesos en forma cerrada afectan al comportamiento sin reentrenar.
- Investigación en despliegue de bajo VRAM: con Q4_K_M (5.290 GiB) y KV cache q8_0, el modelo cabe en GPUs de 12 GB a 16k de contexto, lo que lo hace viable para prototipos en hardware consumer.
- Evaluación comparativa de técnicas training-free: sirve como referencia para medir el coste/beneficio de WSP frente a fine-tuning clásico sobre el mismo base.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (100 tareas: 30 holdout S1..S9 + 70 públicas; decodificación `temperature=0.0, seed=42`, `-c 16384`):

| Suite | Tareas | Base | WSP v3.0 |
|---|---:|---:|---:|
| S1_THINK (holdout) | 3 | 1/3 (33,3%) | 0/3 (0,0%) |
| S2_RESTRAINT (holdout) | 4 | 4/4 (100%) | 4/4 (100%) |
| S3_ROUTER (holdout) | 5 | 5/5 (100%) | 5/5 (100%) |
| S4_CODE (holdout) | 2 | 2/2 (100%) | 2/2 (100%) |
| S5_TURN2_JSON (holdout) | 3 | 3/3 (100%) | 3/3 (100%) |
| S6_HANDOFF (holdout) | 4 | 4/4 (100%) | 4/4 (100%) |
| S7_INJ_GUARD (holdout) | 3 | 3/3 (100%) | 3/3 (100%) |
| S8_GROUNDING (holdout) | 3 | 1/3 (33,3%) | 1/3 (33,3%) |
| S9_ERR_RECOV (holdout) | 3 | 3/3 (100%) | 3/3 (100%) |
| GSM8K (20) | 20 | 14/20 (70,0%) | 10/20 (50,0%) |
| HumanEval pass@1 (15) | 15 | 15/15 (100%) | 15/15 (100%) |
| BFCL v3 Irrelevance (15) | 15 | 13/15 (86,7%) | 11/15 (73,3%) |
| InterCode-NL2Bash (20) | 20 | 16/20 (80,0%) | 15/20 (75,0%) |
| **Total** | **100** | **84/100 (84,0%)** | **76/100 (76,0%)** |

Rendimiento medido: 72,0 tok/s, delta de carga 5545 MiB, pico de VRAM 5593 MiB a 16k con KV cache q8_0.

## Requisitos de hardware

- VRAM estimada: pico de 5593 MiB con GGUF Q4_K_M y KV cache q8_0 a 16k de contexto.
- GPU recomendadas: RTX 4070 Ti (12 GB) funciona a 16k en solitario o como Tier-2 en cascada a 8k.
- RTX 2060 (6 GB): ajustado, aproximadamente 5,3 GiB a 4k antes de contar el escritorio.
- No cabe en GPUs consumer de menos de 6 GB con esta configuración.
- Despliegue: `llama-server` (llama.cpp) con adaptadores LoRA GGUF; Transformers/PyTorch con parches safetensors r16 o parche denso BF16.
- Throughput: 72,0 tok/s medidos en la configuración de referencia.
- Opciones adicionales como vLLM, TGI u Ollama: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa dentro del estudio `wsp-5model-pipeline` del mismo autor (100 tareas, mismas condiciones de decodificación):

| Modelo | GGUF Q4_K_M | Base | WSP v3.0 | Delta | Velocidad | Pico VRAM (16k) |
|---|---:|---:|---:|---:|---:|---:|
| qwen35_4b | 2.553 GiB | 72/100 | 88/100 | +16,0 pp | 116,5 tok/s | 3290 MiB |
| nemotron3_4b | 2.642 GiB | 81/100 | 81/100 | 0,0 pp | 131,1 tok/s | 3133 MiB |
| **qwen35_9b (este)** | **5.290 GiB** | **84/100** | **76/100** | **-8,0 pp** | **72,0 tok/s** | **5593 MiB** |
| qwen35_2b | 1.193 GiB | 57/100 | 55/100 | -2,0 pp | 226,5 tok/s | 1979 MiB |
| gemma4_12b | 6.633 GiB | 50/100 | 50/100 | 0,0 pp | 51,8 tok/s | 7567 MiB |

Frente al base Qwen3.5-9B sin intervenir (84/100), esta variante WSP pierde 8 puntos, mientras que la variante de 4B del mismo autor gana 16 puntos con la misma técnica. Comparativas con modelos externos al estudio: no disponibles.

## Limitaciones y advertencias

- Degradación medida: el agregado cae de 84/100 a 76/100 (-8,0 pp), con pérdidas claras en GSM8K (70% → 50%) y BFCL Irrelevance (86,7% → 73,3%).
- S1_THINK pasa de 1/3 a 0/3 en holdout: el subespacio de "cierre de pensamiento" no mejora y empeora el caso base.
- S8_GROUNDING se mantiene en 1/3, por lo que la abstención fundamentada sigue siendo débil.
- La técnica es training-free y no hay información sobre datos de calibración, lo que dificulta auditar sesgos o robustez fuera de las tareas evaluadas.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá de la del base.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base ya presenta este riesgo y la intervención no lo mitiga de forma demostrada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado (no se detalla en la información disponible).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.
- El tag `image-text-to-text` sugiere capacidades multimodales, pero la model card no documenta el pipeline de visión ni su evaluación.
- El contexto nativo del base no se especifica; la evaluación se hizo a 16k, y no se garantiza comportamiento estable más allá.

## Enlaces

- Hugging Face: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B del mismo autor: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Variante 2B: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming
- Nemotron-3-Nano-4B WSP: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Gemma-4-12B WSP: https://huggingface.co/jstarks/Gemma-4-12B-Weight-Space-Programming
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
