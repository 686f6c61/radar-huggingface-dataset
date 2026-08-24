# agentic-ptb/opus-high-v2.h004.sft_v2.step_240

## Resumen

El modelo `agentic-ptb/opus-high-v2.h004.sft_v2.step_240` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto experimental **AgentPTB**. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (~9,4B). El nombre del checkpoint indica que fue generado a partir de una celda de ejecución de Claude Code (`claude-opus-5` con nivel de esfuerzo `high`), en la hora 4 de un proceso de 100 horas.

El propio autor advierte explícitamente en la model card que **todos los checkpoints SFT de esta celda regresaron frente a los tensores base** y que el artefacto realmente enviado es `base_real`, es decir, el modelo base sin ninguna modificación de pesos, con solo dos archivos de configuración corregidos. El checkpoint SFT más suave obtuvo un 17,2% frente al 29,1% del base en 285 tareas pareadas de SWE-bench Verified. Por tanto, este modelo no está pensado para uso práctico, sino como registro de un experimento de generación de datos con agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; derivada de Qwen/Qwen3.5-9B-Base |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura del modelo más allá de que es un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`. El proceso de entrenamiento consistió en un ajuste supervisado (SFT) utilizando datos generados por Claude Code (específicamente `claude-opus-5` con nivel de esfuerzo `high`) dentro del marco experimental AgentPTB. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre técnicas como RLHF o DPO.

El autor indica que en esta celda concreta todos los runs SFT produjeron regresiones frente al modelo base, y que el checkpoint publicado es un subproducto del proceso, no un artefacto de calidad. No se menciona ninguna innovación técnica destacable en el entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un fine-tuning de un modelo base de 9B, podría heredar capacidades generales de generación de texto, razonamiento y código, pero no hay información verificada sobre tool calling, agentes, multimodalidad u otras funcionalidades. El autor no proporciona ninguna descripción de capacidades en la model card.

## Casos de uso

Dado el estado del modelo y la advertencia explícita del autor, **no se recomienda su uso en ningún escenario práctico**. Los casos de uso potenciales se limitan al ámbito de la investigación:

- **Estudio de regresiones en fine-tuning**: permite analizar cómo un SFT con datos generados por agentes puede degradar el rendimiento frente al modelo base.
- **Reproducción de experimentos**: sirve como referencia para comparar metodologías de generación de datos con Claude Code.
- **Análisis de artefactos intermedios**: útil para inspeccionar cómo evolucionan los pesos durante un proceso de entrenamiento prolongado.

Para cualquier tarea real de generación de texto, código o razonamiento, se recomienda utilizar el modelo base `Qwen/Qwen3.5-9B-Base` o modelos fine-tuned de calidad contrastada.

## Benchmarks y rendimiento

El autor proporciona un único dato de rendimiento en la model card:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified (285 tareas pareadas) | 17,2% (checkpoint SFT más suave) |
| SWE-bench Verified (285 tareas pareadas) | 29,1% (modelo base sin modificar) |

No se han publicado resultados adicionales en otras pruebas estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

Al tratarse de un modelo de ~9,4B parámetros en formato safetensors (18,8 GB en disco), los requisitos estimados para inferencia son:

- **VRAM estimada**: ~19 GB en FP16 (cabe en una GPU de 24 GB como RTX 4090 o A10G); ~10 GB en cuantización de 8 bits; ~5-6 GB en cuantización de 4 bits (si se generan los GGUF correspondientes).
- **GPU recomendadas**: RTX 3090/4090, A100, L40S, o cualquier GPU con al menos 24 GB de VRAM para FP16.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (si se convierten los pesos a los formatos adecuados).
- **Latencia y throughput**: no disponibles.

Dado que el modelo no es recomendable para producción, estos requisitos son orientativos y se basan en el tamaño de parámetros, no en mediciones reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v2.h004.sft_v2.step_240` | 9,4B | No disponible | 17,2% | No disponible |
| `Qwen/Qwen3.5-9B-Base` (modelo base) | 9,4B | No disponible | 29,1% | No disponible |
| Otros modelos de 9B (p.ej. Llama 3.1 8B, Mistral 7B) | 7-8B | 8K-128K | No comparable | Varía |

La comparativa se limita al modelo base, ya que no hay datos públicos de otros modelos en las mismas condiciones. El autor no proporciona comparaciones con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Regresión severa frente al modelo base**: el autor confirma que todos los SFT de esta celda degradaron el rendimiento, con una caída de 29,1% a 17,2% en SWE-bench Verified.
- **Checkpoint intermedio**: no es un artefacto final ni un modelo pulido; se publica únicamente como registro del proceso.
- **Sin licencia especificada**: no se puede determinar si es utilizable comercialmente.
- **Sin información de contexto, idiomas ni sesgos**: no hay datos sobre la ventana de contexto, los idiomas soportados ni posibles sesgos.
- **Riesgo de alucinación**: al ser un fine-tuning de baja calidad, es probable que presente un comportamiento errático en tareas complejas.
- **No apto para producción**: cualquier uso en aplicaciones reales conlleva un alto riesgo de resultados incorrectos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v2.h004.sft_v2.step_240)
- [Registro de ejecución (run record)](https://huggingface.co/agentic-ptb/opus-high-v2-record)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
