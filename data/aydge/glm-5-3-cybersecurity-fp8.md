# Aydge/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificacion de pesos del modelo GLM-5.3 de ZAI, publicada por la organización dealignai bajo el nombre de "CRACK" y alojada también en el repositorio de Aydge. Se trata de un modelo centrado exclusivamente en el dominio de ciberseguridad, diseñado para reducir los sistemas de rechazo del modelo base en tareas de seguridad ofensiva, red teaming, desarrollo de exploits, ingeniería inversa, análisis de malware y phishing, entre otras. No es un "uncensor" generalista: las negativas se mantienen en otras categorías, como la reproducción literal de contenido con copyright.

El modelo base es un transformer MoE de 753.329.940.480 parámetros totales, con arquitectura `glm_moe_dsa`, 78 capas y solo texto. El checkpoint está cuantizado en FP8, lo que permite aprovechar la aceleración nativa de tensor cores en GPUs Hopper (H100/H200). La modificación se ha realizado directamente sobre los pesos, sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución, por lo que el modelo puede cargarse en vLLM stock sin cambios adicionales. El repo pesa 755,7 GB y mantiene la licencia MIT del base.

Esta versión incluye un modo de razonamiento configurable mediante `reasoning_effort` (solo "low" y "high"), soporte de tool calling y una ventana de contexto práctica de 131K tokens en despliegue TP8, aunque el modelo base está diseñado para alcanzar 1M de contexto mediante decode-context-parallel (actualmente no operativo en vLLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (Mixture of Experts, DeepSeek-sparse attention), 78 capas, text-only |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (limite practico en vLLM TP8; el modelo soporta 1M con decode-context-parallel, no operativo en vLLM actual) |
| Tipos de cuantizacion | FP8 (pesos de expertos con routing sin modificar; solo writers residuales en bf16 editados) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3-CYBERSECURITY-FP8 parte de `zai-org/GLM-5.3`, un modelo MoE con 753B parámetros totales y arquitectura `glm_moe_dsa` (DeepSeek-sparse attention). El checkpoint base fue cuantizado a FP8 por `JANGQ-AI/GLM-5.3-FP8`, manteniendo los expertos en ruta con cuantización FP8 y los escritores residuales en bf16. La posterior modificación de dealignai editó exclusivamente esos pesos residuales, eliminando los patrones de rechazo del modelo en el dominio de ciberseguridad. No se ha realizado fine-tuning adicional, LoRA ni modificaciones en tiempo de ejecución.

La arquitectura incorpora decodificación especulativa mediante MTP (multi-token prediction), aunque en la implementación actual de vLLM stock no es funcional. Se ha reportado que funciona en un fork de vLLM (B12X sparse-MLA) con un aumento del +48% en la velocidad de decodificación en prompts de código. El contexto largo del modelo base (1M) requiere decode-context-parallel, que en la versión actual de vLLM está cerrado para la arquitectura `glm_moe_dsa` debido a un desajuste en el tamaño de páginas entre el indexador DSA (`k_cache` replicado) y la KV cache de MLA (fragmentada). El límite práctico medido es ~131K con MTP y ~160K sin MTP en 8× H200.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. La licencia del checkpoint es MIT.

## Capacidades

- Generación de texto conversacional en 10 idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Razonamiento interno con modo `thinking`: el texto de razonamiento se entrega en `message.reasoning` (no en `reasoning_content`). El parámetro `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor (incluido `off`, `medium`, `max` o un YAML `off:` sin comillas) se interpreta como `max`, y no existe forma de desactivar el razonamiento en este checkpoint.
- Soporte de tool calling y function calling mediante el parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Soporte de agentes y multi-step reasoning: en modo `low` se comporta de forma más estable en bucles de herramienta; en `high`/`max` puede consumir todo el presupuesto de tokens dentro de `<think>` y devolver cero tokens de respuesta.
- Cumplimiento reforzado en tareas de ciberseguridad ofensiva: pentesting, red teaming, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques de credenciales y análisis de malware. El modelo responde directamente en 80–84% de las conductas de daño del corpus HarmBench, con un número cercano a cero de rechazos duros.
- Capacidad de mantener contexto largo (hasta ~131K tokens en producción con vLLM TP8), adecuada para análisis de binarios, logs extensos o documentos técnicos.
- El modelo es text-only: no procesa imágenes ni audio.

## Casos de uso

- Pentesting autorizado: el usuario puede solicitar metodologías de enumeración, explotación de vulnerabilidades o bypass de controles en entornos con permiso explícito. El modelo responde sin envoltorios de rechazo en la mayoría de los casos y mantiene el contexto técnico en conversaciones largas.
- Red teaming y simulación de adversarios: gracias a su soporte de tool calling, puede orquestar flujos donde el asistente invoca comandos, procesa salidas y decide el siguiente paso sin necesidad de intervención humana. El modo `low` es el recomendado para evitar agotamiento del presupuesto de tokens.
- Análisis de malware e ingeniería inversa: puede desensamblar lógica de binarios, interpretar ofuscaciones y explicar técnicas de evasión. Su ventana de 131K tokens permite cargar código desensamblado extenso o estructuras de datos grandes en una sola pasada.
- Desarrollo de exploits para entornos controlados (CTF o laboratorios): el modelo ofrece payloads, técnicas de heap spraying, uso de primitivas de memoria y depuración de exploit code, con una tendencia mínima a negar la respuesta.
- Investigación y simulación de phishing: puede redactar correos o páginas de suplantación para campañas de concienciación o evaluación controlada, y explicar técnicas de recolección de credenciales.
- Generación de threat intelligence: a partir de logs, tráfico de red o artifactos, el modelo puede redactar informes técnicos, asociar TTPs y proponer detecciones. El soporte multilingüe permite traducir documentos entre los 10 idiomas soportados.

## Benchmarks y rendimiento

Se han publicado resultados de dos evaluaciones en la model card.

MMLU en modo logit (probabilidad sobre los tokens A/B/C/D, sin generación), comparado con el modelo base:

| Evaluacion | Base (bf16 pre-quant) | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU overall (1026 Q) | 85.58% | 86.65% (889/1026) | +1.07 pp |

Compliance en HarmBench-320, evaluado con greedy y tres superficies de `reasoning_effort`. La tabla recoge solo las 240 conductas no relacionadas con copyright, que son el objetivo real de la modificación:

| effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81.7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84.2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80.0%) | 3 | 3 | 0 | 0 | 40 |

La evaluación completa de 320 comportamientos (incluyendo 80 de reproducción de copyright) muestra que la mayoría de los rechazos suaves (~48–54) corresponden a la frontera legal de copyright, no al dominio de ciberseguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 753 GB. Con tensor parallelism (TP8), cada GPU de 8× H200 o H100 debe alojar unos 94 GB de pesos, más la KV cache. Requiere un clúster de 8 GPUs con 141 GB de VRAM cada una (H200) como mínimo.
- GPU recomendadas: NVIDIA H200 o H100 con soporte FP8 nativo. El modelo está diseñado para Hopper y no se menciona rendimiento en Ada ni Blackwell.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.). No hay versiones GGUF o cuantizaciones inferiores documentadas en la información disponible.
- Opciones de despliegue: vLLM (soporte oficial en la model card) con los siguientes parámetros para TP8 en 8× H200:
  ```bash
  vllm serve dealignai/GLM-5.3-CYBERSECURITY-FP8 \
    --tensor-parallel-size 8 \
    --gpu-memory-utilization 0.90 \
    --enforce-eager \
    --disable-custom-all-reduce \
    --enable-prefix-caching \
    --max-num-seqs 24 \
    --max-model-len 131072 \
    --reasoning-parser glm45 \
    --tool-call-parser glm47 \
    --enable-auto-tool-choice
  ```
- Detalles operativos: `--enforce-eager` es obligatorio para que la ruta de atención sparse funcione bajo concurrencia. El contexto de 131K funciona en 8× H200 con `max-num-seqs 24` y un margen de concurrencia de ~2.98x. No se debe activar `--speculative-config`, ya que MTP no es funcional en vLLM stock.
- Latencia y throughput: no se han publicado cifras precisas. La decodificación especulativa MTP solo funciona en el fork B12X de vLLM, con +48% de velocidad de decodificación en prompts de código.

## Comparativa con modelos similares

| Modelo | Params | Cuantizacion | Contexto | Enfoque de refusals | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | 753B | FP8 | 131K práctico (1M teórico) | Ciberseguridad ofensiva – alta complianza, rechazo de copyright | MIT |
| GLM-5.3-UNCENSORED-FP8 (dealignai) | 753B | FP8 | Igual que base | Uncensor generalista, sin restricción de dominio | MIT |
| JANGQ-AI/GLM-5.3-FP8 (base cuantizado) | 753B | FP8 | Igual que base | Comportamiento de rechazo original del modelo | MIT |
| zai-org/GLM-5.3 (bf16) | 753B | bf16 | Igual que base | Comportamiento de rechazo original | no disponible en la info |

El modelo se distingue de sus hermanos por el enfoque específico en seguridad ofensiva. Frente al uncensor generalista, mantiene negativas en otras categorías (copyright, etc.); frente al base FP8, la única diferencia es la eliminación de patrones de rechazo en el dominio ciberseguridad y un ligero incremento de +1.07 pp en MMLU.

## Limitaciones y advertencias

- Uso exclusivo para entornos autorizados: el modelo está diseñado para ciberseguridad ofensiva y seguridad ofensiva autorizada. Puede generar contenido dañino si se utiliza fuera de este marco.
- No es un "uncensor" universal: las negativas persisten en categorías como reproducción de copyright, y en dominios no técnicos puede responder con un envoltorio educativo suave en lugar de una negativa dura.
- El razonamiento no se puede desactivar: cualquier valor de `reasoning_effort` distinto de `"low"` o `"high"` se interpreta como `max`. En `high`/`max` el modelo puede agotar el presupuesto de tokens dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`). Para agentes se recomienda usar `low` y `max_tokens` adecuados.
- La ventana de 1M de contexto no es operativa en vLLM actual. El límite práctico es ~131K con MTP y ~160K sin MTP en TP8/8× H200.
- La decodificación especulativa MTP no funciona en vLLM stock. Requiere un fork específico (B12X sparse-MLA) y no implementa `SupportsPP`, por lo que no es compatible con pipeline parallelism.
- Riesgo de alucinación: no se han publicado estudios específicos en esta variante, pero el modelo base de 753B hereda las limitaciones habituales de los LLM en fact-checking sin herramientas.
- Sesgos: no se han documentado sesgos concretos en la model card. Dado que el entrenamiento original no es público, no se puede evaluar la composición demográfica del dataset.
- VRAM exigente: requiere 8× H200 o H100 con FP8. No hay cuantizaciones inferiores ni formatos GGUF documentados, por lo que el despliegue en entornos sin GPUs Hopper multigpu no es viable.

## Enlaces

- Model card en Hugging Face (dealignai): https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Repositorio espejo (Aydge): https://huggingface.co/Aydge/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Base cuantizada FP8: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Discusión sobre runtime en DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/glm-5.3-cybersecurity-fp8-dealignai
