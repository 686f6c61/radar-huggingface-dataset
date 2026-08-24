# agentic-ptb/opus-high-v2.h011.sft_sstB.step_120

## Resumen

`agentic-ptb/opus-high-v2.h011.sft_sstB.step_120` es un checkpoint intermedio publicado por el proyecto AgentPTB, un experimento de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El nombre del checkpoint indica que proviene de la celda `opus-high-v2`, generada mediante Claude Code con el modelo `claude-opus-5` a un nivel de esfuerzo `high`, y corresponde al paso 120 de entrenamiento dentro de la hora 11 (h011) de una ejecución de 100 horas.

El autor es explícito en la model card: este checkpoint **no es un artefacto final ni recomendado para uso práctico**. Todos los runs SFT de esta celda regresaron frente a los tensores del modelo base, y el mejor de ellos obtuvo un 17,2% de acierto en 285 tareas de SWE-bench Verified, frente al 29,1% del base sin modificar. El artefacto oficialmente enviado por el proyecto es `base_real`, que es el propio `Qwen/Qwen3.5-9B-Base` sin ningún tensor modificado y con dos archivos de configuración corregidos.

En resumen, se trata de un checkpoint de investigación que documenta un intento de fine-tuning fallido, publicado por transparencia y reproducibilidad, no por su calidad. Cualquier uso en producción debe descartarse de antemano.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del transformer `Qwen/Qwen3.5-9B-Base`, que pertenece a la familia Qwen3.5 con 9.400 millones de parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, heads, etc.) más allá de lo que hereda del base. El entrenamiento fue realizado por el proyecto AgentPTB, que utiliza agentes de Claude Code para generar datos de entrenamiento y luego aplica SFT sobre modelos base abiertos.

Según la model card, el proceso de entrenamiento de esta celda (`opus-high-v2`) produjo varios checkpoints SFT, todos ellos con regresión en rendimiento respecto al base. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El autor indica que el checkpoint se publica porque fue producido y medido, no porque sea bueno. El token EOS configurado es `[248044, 248046]`.

## Capacidades

- **Generación de texto**: hereda las capacidades del base Qwen3.5-9B, pero con rendimiento degradado según el autor.
- **Razonamiento y código**: el base es capaz de razonamiento y generación de código, pero este checkpoint concreto muestra una caída significativa en tareas de SWE-bench.
- **Tool calling / function calling**: no hay información específica para este checkpoint; dependería del base, pero no se ha verificado.
- **Soporte de agentes**: no hay evidencia de que este checkpoint mejore o mantenga las capacidades agénticas del base.
- **Multilingüismo**: no disponible.
- **Modo thinking / vision / audio**: no disponible.

Dado que el autor reporta una regresión clara, es prudente asumir que las capacidades reales de este checkpoint son inferiores a las del base en la mayoría de tareas.

## Casos de uso

Este checkpoint no es adecuado para ningún caso de uso práctico en producción. Su único valor es como material de investigación para estudiar por qué un SFT puede degradar el rendimiento. Aun así, se pueden enumerar escenarios de uso académico:

- **Análisis de regresión en fine-tuning**: estudiar cómo el SFT afecta a las representaciones internas del modelo base y por qué produce una caída del 29,1% al 17,2% en SWE-bench.
- **Reproducción de experimentos**: servir como punto de comparación para otros checkpoints del mismo proyecto AgentPTB.
- **Investigación en alineación**: analizar si el SFT con datos generados por Claude Code introduce sesgos o pérdida de generalización.
- **Estudio de curvas de entrenamiento**: examinar la evolución del rendimiento a lo largo de los pasos (step_120) y las horas (h011) para entender dinámicas de sobreajuste.
- **Comparación de arquitecturas**: contrastar el comportamiento de este checkpoint con el base y con otros fine-tunes de la misma familia.
- **Desarrollo de métodos de regularización**: usar este checkpoint como caso de estudio para probar técnicas que eviten la regresión en SFT.

En ningún caso se recomienda su uso en aplicaciones reales, chatbots, generación de código o automatización.

## Benchmarks y rendimiento

El autor proporciona un único dato de rendimiento en la model card, correspondiente a SWE-bench Verified (285 tareas emparejadas):

| Modelo | SWE-bench Verified (285 tareas) |
|---|---|
| `Qwen/Qwen3.5-9B-Base` (sin modificar) | 29,1% |
| Mejor checkpoint SFT de `opus-high-v2` | 17,2% |
| `opus-high-v2.h011.sft_sstB.step_120` (este) | no disponible (no se reporta su puntuación individual) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint concreto. El dato de SWE-bench es la única referencia disponible y proviene directamente del autor.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 9.400 millones de parámetros en FP16, se necesitan aproximadamente 19 GB de VRAM. En cuantización de 8 bits, unos 9,5 GB; en 4 bits, unos 5 GB. Sin embargo, no se han publicado pesos cuantizados para este checkpoint.
- **GPU recomendadas**: una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A10G, L4) para FP16. Para cuantización ligera, una RTX 4060 Ti de 16 GB podría bastar, pero no hay archivos GGUF disponibles.
- **Si cabe en consumer GPU**: sí, en GPUs de gama alta con 24 GB o más, o con cuantización en GPUs de 8-12 GB, siempre que se generen los archivos cuantizados manualmente.
- **Opciones de despliegue**: al ser un checkpoint safetensors estándar, se puede cargar con Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones específicas.
- **Latencia y throughput**: no disponible. Dado que es un checkpoint de investigación, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible | 29,1% | no disponible | safetensors |
| `opus-high-v2.h011.sft_sstB.step_120` (este) | 9,4B | no disponible | no reportado (peor que base) | no disponible | safetensors |
| Otros checkpoints SFT de `opus-high-v2` | 9,4B | no disponible | 17,2% (el mejor) | no disponible | safetensors |

No se dispone de comparación con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B, Mistral 7B) porque el autor no ha publicado esos datos. La única comparación válida es contra el propio modelo base.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final; forma parte de un experimento de investigación y no debe usarse en producción.
- **Regresión confirmada**: el autor reporta que todos los SFT de esta celda degradaron el rendimiento frente al base. El mejor obtuvo 17,2% vs 29,1% en SWE-bench.
- **Sin licencia especificada**: no se indica ninguna licencia, lo que impide su uso comercial o incluso académico sin consultar al autor.
- **Sin datos de entrenamiento**: no se especifican tokens, dataset ni metodología de SFT, lo que limita la reproducibilidad.
- **Riesgo de alucinación**: al ser un fine-tune degradado, es probable que aumente la tasa de alucinación y errores factuales.
- **Idiomas y sesgos**: no hay información sobre sesgos conocidos ni cobertura idiomática.
- **Contexto limitado**: no se ha verificado la longitud de contexto real tras el fine-tuning.

## Enlaces

- [Checkpoint en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v2.h011.sft_sstB.step_120)
- [Registro de ejecución del proyecto](https://huggingface.co/agentic-ptb/opus-high-v2-record)
- [Índice de datasets de AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Búsqueda de modelos AgentPTB en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
