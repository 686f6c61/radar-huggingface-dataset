# msr-spare/msr-agentic-ptb-opus-max

## Resumen

Este repositorio contiene el backup del «cell 3» del benchmark agentic-PTB, un experimento de post-entrenamiento autónomo en el que un agente Claude Code (`claude-opus-5[1m]`) con esfuerzo máximo de razonamiento entrenó el modelo base `Qwen/Qwen3.5-9B-Base` durante 100 horas en 4 GPUs (aunque solo usó 3) para tareas de ingeniería de software agéntica y trabajo en terminal. El checkpoint de envío es `sft_v5_step_900`, un ajuste fino supervisado (SFT) generado tras múltiples pasadas de reescritura de datos. El resultado es un artefacto de investigación que documenta tanto el proceso de entrenamiento como los efectos del harness de evaluación.

La relevancia de este modelo radica en que es un caso real de post-entrenamiento autónomo con resultados contraintuitivos: el fine-tune mejora el rendimiento sobre el harness estándar, pero resulta ser una carga neta sobre el harness mejorado (pi-ws), donde el modelo base sin entrenar supera al modelo entrenado. Esto pone de manifiesto la importancia del scaffold de evaluación frente a los pesos del modelo. El repositorio incluye 14 checkpoints, registros detallados, trazas de evaluación y los corpus SFT utilizados.

Arquitectónicamente, se trata de un transformer de 9B parámetros (Qwen3.5-9B-Base) con una ventana de contexto de 65536 tokens, almacenado en formato safetensors con tensores en bf16 (aunque el `config.json` declare `float32`). No se dispone de información sobre licencia, idiomas soportados ni cuantizaciones alternativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B-Base (transformer decoder-only) |
| Parametros totales | 9B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 65536 tokens (según comando de vLLM) |
| Tipos de cuantizacion | no disponible (tensores almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only de 9B parámetros. El post-entrenamiento fue realizado por un agente autónomo (Claude Code) durante 100 horas, usando técnicas de SFT y RL (se menciona `prime-rl`). El checkpoint de envío `sft_v5_step_900` fue producido tras tres pasadas de reescritura de los corpus SFT. El agente también corrigió el `generation_config` del modelo base, añadiendo `eos_token_id = [248044, 248046]` para evitar que el modelo continúe generando más allá de su turno. El entrenamiento se ejecutó bajo el objetivo «goal v5», que permite destilación, y se usaron 3 GPUs en lugar de las 4 asignadas.

El harness de evaluación `pi-ws` es un plugin externo que no está incluido en el repositorio; consiste en una corrección del directorio de trabajo y un prompt adicional de procedimiento operativo. Este plugin es crucial para reproducir los resultados, y el propio README advierte que «el plugin vale más que los pesos».

## Capacidades

- Generación de texto y código, orientado a tareas de ingeniería de software agéntica y trabajo en terminal.
- Soporte de tool calling / function calling (se sirve con `--enable-auto-tool-choice` y parser `qwen3_coder`).
- Capacidad de razonamiento multi-paso, aunque no se especifica un modo de pensamiento explícito.
- No soporta entrada de imágenes ni vídeo (se desactivan con `--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Capacidades multilingües no documentadas; el modelo base Qwen3.5 suele ser multilingüe, pero no hay confirmación para este checkpoint.

## Casos de uso

- Investigación en post-entrenamiento autónomo: este checkpoint permite estudiar cómo un agente de IA puede ajustar un modelo base mediante SFT y RL, y cómo las decisiones del agente (como la elección del checkpoint) afectan al rendimiento final.
- Análisis de la interacción entre pesos y scaffold: los datos del README muestran que el harness pi-ws aporta +23.2pp sobre el modelo base sin entrenar, mientras que el fine-tune resta −6.8pp sobre ese mismo harness. Este modelo es un caso de estudio para entender la influencia del entorno de evaluación.
- Reproducción de experimentos en swe-bench-verified: el repositorio incluye trazas completas y registros que permiten replicar los resultados publicados (20.2% en una muestra de 250 tareas con pi-ws).
- Evaluación de estrategias de entrenamiento con RL: el experimento usó `prime-rl` y rotación de checkpoints; los 14 checkpoints almacenados permiten analizar la evolución del rendimiento a lo largo del entrenamiento.
- Comparación de harness de evaluación: los datos de la tabla 2×2 permiten aislar el efecto del scaffold (pi-ws vs stock) sobre el mismo conjunto de pesos.
- Formación en ingeniería de agentes: el repositorio contiene documentación extensa (más de 1500 líneas de notas y registros) que puede servir como material didáctico sobre cómo diseñar y ejecutar experimentos de post-entrenamiento agéntico.

## Benchmarks y rendimiento

Los resultados publicados se basan en swe-bench-verified (muestra de 250 tareas con semilla fija) y terminal-bench-2 (89 tareas). Todos los paneles tienen cero episodios sin calificar y las celdas de swe-bench están replicadas.

| Sistema | swe-bench-verified | terminal-bench-2 |
|---|---|---|
| Stock pi harness + `sft_v5_step_900` | 13.2% | — |
| **Pi-ws (sistema enviado)** | **20.2%** [16.9, 23.9] (n=500) | 1/89 = 1.1% |
| Base + pi-ws | 27.6% | — |

Tabla 2×2 (todas las celdas n=250, mismo conjunto de tareas):

| Pesos | Stock pi | Pi-ws | Scaffold Δ |
|---|---|---|---|
| Base + eos fix | 4.4% | 27.6% | +23.2pp (p<0.0001) |
| `sft_short_step_200` | 10.4% | 16.8% | +6.4pp |
| **`sft_v5_step_900`** (enviado) | 13.2% | 20.8% | +7.6pp (p=0.005) |
| Pesos Δ vs base | +8.8pp (p=0.0003) | −6.8pp (p=0.036) | — |

El README advierte explícitamente que no se debe reportar un número de terminal-bench-2 para este cell, ya que todas las comparaciones tienen p≥0.125 y el modelo base (5/89) supera al sistema enviado en ambos harnesses. Además, se midió un ruido de fondo del 15.6% (dos ejecuciones idénticas discrepan en 39 de 250 tareas).

## Requisitos de hardware

- Para inferencia con vLLM, el modelo requiere aproximadamente 18 GB de VRAM en bf16 (9B parámetros × 2 bytes). Se recomienda una GPU con al menos 24 GB (RTX 3090/4090, A10G, A100 40GB, etc.).
- El repositorio completo ocupa 258.3 GB, pero incluye 14 checkpoints; el checkpoint individual `sft_v5_step_900` pesa aproximadamente 18 GB en safetensors.
- El entrenamiento original se realizó con 4 GPUs (aunque solo se usaron 3), probablemente GPUs de alta gama tipo A100/H100, durante 100 horas.
- Opciones de despliegue: vLLM (comando proporcionado en el README), transformers (aunque upcast a fp32 duplicaría el uso de memoria), y posiblemente llama.cpp si se convierte a GGUF, aunque no se menciona.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

Dado que este es un checkpoint experimental de un modelo base específico, la comparación más relevante es contra el propio modelo base sin entrenar y contra otros checkpoints del mismo experimento. No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) en las mismas tareas.

| Modelo | Parámetros | Contexto | swe-bench-verified (con pi-ws) | Licencia |
|---|---|---|---|---|
| `msr-agentic-ptb-opus-max` (sft_v5_step_900) | 9B | 65536 | 20.2% | no disponible |
| Qwen3.5-9B-Base (sin entrenar) | 9B | 65536 | 27.6% | no disponible |
| `sft_short_step_200` (checkpoint intermedio) | 9B | 65536 | 16.8% | no disponible |

La comparación muestra que el fine-tune empeora el rendimiento sobre el harness pi-ws, mientras que mejora sobre el harness stock. Esto indica que los pesos no son directamente comparables con modelos de propósito general sin tener en cuenta el scaffold.

## Limitaciones y advertencias

- El fine-tune es una carga neta sobre el harness pi-ws: el modelo base sin entrenar obtiene 27.6% frente al 20.2% del modelo enviado. Esto limita su utilidad práctica para tareas reales de SWE.
- El harness pi-ws (plugin externo) no está incluido en el repositorio; sin él, los resultados no son reproducibles y el rendimiento cae drásticamente.
- Problema de packaging: `config.json` declara `float32` pero los tensores son bf16. Al cargar con `transformers`, el modelo se upcast a fp32, duplicando el uso de memoria.
- El `generation_config.json` incluye tokens EOS específicos; si no se respetan, el modelo puede alucinar la respuesta del usuario y continuar generando.
- Riesgo de alucinación y sesgos inherentes a los modelos de lenguaje, agravados por el hecho de que el entrenamiento fue autónomo y no se documentaron evaluaciones de sesgo.
- Licencia no disponible, lo que impide su uso comercial sin verificación legal.
- No se recomienda su uso en producción: es un artefacto de investigación con un rendimiento inferior al modelo base en el harness mejorado.
- El ruido de fondo medido (15.6% de discordancia entre ejecuciones idénticas) indica que las diferencias pequeñas en los resultados pueden no ser significativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/msr-spare/msr-agentic-ptb-opus-max
- Write-up del experimento (artifact de Claude): https://claude.ai/code/artifact/a965ff02-e109-49b4-b37c-5d4e47e8671f
- Referencia cruzada entre celdas (mencionado en el README): `agentptb/ROLLUP.md` (no disponible públicamente)
