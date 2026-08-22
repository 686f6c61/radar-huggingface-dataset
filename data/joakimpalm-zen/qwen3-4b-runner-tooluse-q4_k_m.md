# Joakimpalm-Zen/Qwen3-4B-Runner-ToolUse-Q4_K_M

## Resumen

El modelo `Joakimpalm-Zen/Qwen3-4B-Runner-ToolUse-Q4_K_M` es un adaptador LoRA (Low-Rank Adaptation) entrenado para mejorar la capacidad de tool-calling y function-calling del modelo base Qwen3-4B, cuantizado en GGUF Q4_K_M. El adaptador ha sido desarrollado por Joakimpalm-Zen utilizando el motor de inferencia Xyntetik Runner, un motor de inferencia en C11 de un solo binario que permite entrenar adaptadores directamente sobre el artefacto cuantizado, sin necesidad de una copia en FP16 ni frameworks de entrenamiento Python. El resultado es un adaptador reproducible byte a byte, lo que garantiza que el mismo comando y los mismos datos producen exactamente el mismo archivo.

El objetivo principal es mejorar la selección de herramientas y la generación de argumentos JSON en formato de esquema para agentes que necesitan invocar funciones. Según la evaluación reportada, el adaptador eleva la precisión de elección de herramienta correcta de 0,724 a 1,000 y la llamada exacta de 0,690 a 1,000 en un conjunto de evaluación de 29 prompts. Además, se incluye un estudio de tres precisiones (bf16, Q8_0 y Q4_K_M) que demuestra que el entrenamiento a través de la cuantización Q4_K_M produce un adaptador con una divergencia relativa del 12% en el espacio de pesos respecto al entrenado en bf16, aunque el rendimiento en la tarea es idéntico en todos los casos.

El adaptador es pequeño (0,3 GB) y se distribuye como GGUF, lo que permite su integración con el motor Xyntetik Runner y otros sistemas que soporten adaptadores GGUF. La licencia Apache 2.0 permite uso comercial y modificación. Aunque se trata de un adaptador específico para una tarea sintética, el enfoque de entrenamiento reproducible sobre cuantización es novedoso y relevante para entornos de producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B (transformer decoder) |
| Parametros totales | 16.515.072 (adaptador LoRA) |
| Parametros activos | no aplica (adaptador LoRA) |
| Longitud de contexto | 128 (contexto de entrenamiento) |
| Tipos de cuantizacion | GGUF Q4_K_M (adaptador y base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador) |

## Arquitectura y entrenamiento
El adaptador LoRA tiene rango 8 en todas las proyecciones (attention q/k/v/output y FFN gate/up/down) y alpha 16. Se entrenó con AdamW (beta 0.9/0.999, weight decay 0.01), learning rate 1e-4, 316 pasos (2 épocas sobre 158 ejemplos), seed 0 y contexto 128. La pérdida pasó de 0.676 a 0.000006. El entrenamiento se realizó sobre el GGUF Q4_K_M del modelo base, congelando todos los pesos y ajustando únicamente los parámetros del adaptador. El motor Xyntetik Runner realiza el forward pass de inferencia como parte del entrenamiento, lo que permite entrenar directamente sobre la cuantización. El proceso es determinista: se verificó que dos ejecuciones de 40 pasos con los mismos datos y semilla producen adaptadores con el mismo sha256.

El dataset de entrenamiento es generado de forma determinista (158 ejemplos) y se encuentra en el repositorio. El estudio de tres precisiones (bf16, Q8_0, Q4_K_M) muestra que el adaptador entrenado a través de Q8_0 es casi idéntico al entrenado en bf16 (coseno 0.99983, divergencia relativa 2%), mientras que el entrenado a través de Q4_K_M diverge un 12% en el espacio de pesos, pero el rendimiento en la tarea es idéntico (1.000 exacto) en todos los casos.

## Capacidades
- Tool-calling y function-calling: selecciona la herramienta correcta entre cuatro herramientas con esquemas distintos y genera argumentos JSON válidos.
- Generación de JSON estructurado: emite argumentos en formato JSON sin prosa adicional.
- Rechazo de solicitudes no cubiertas: el adaptador aprende a negarse cuando ninguna herramienta disponible encaja.
- Preservación de capacidades del modelo base: la evaluación sobre un corpus neutral muestra una NLL/token de 4.063 → 4.026 (Δ −0.037), indicando que el adaptador no degrada el texto general.
- Compatibilidad con el motor Xyntetik Runner: se sirve con el comando `runner -m base.gguf --lora adaptador.gguf --serve`.
- Reproducibilidad completa: los checksums sha256 del adaptador, del base y del dataset están publicados.

## Casos de uso

- Asistentes de agentes con llamada a herramientas: un agente conversacional que necesita invocar APIs (por ejemplo, consultar el tiempo, buscar información) puede usar este adaptador para seleccionar y formatear la llamada correcta sin errores.
- Automatización de flujos de trabajo con APIs: integración en pipelines que requieren llamadas a servicios externos mediante JSON, reduciendo fallos de formato.
- Sistemas de soporte al cliente con funciones de backend: el modelo puede extraer entidades y rellenar campos de una API de tickets, mejorando la precisión de los argumentos.
- Entornos de producción con recursos limitados: al ser un adaptador LoRA sobre un modelo cuantizado Q4_K_M, se puede ejecutar en CPU o GPU con poca memoria, ideal para despliegues en edge.
- Pruebas de robustez de tool-calling: el adaptador sirve como referencia para evaluar la capacidad de tool-calling en modelos pequeños, ya que alcanza un 100% de precisión en su tarea.
- Reproducibilidad de entrenamiento: el motor Xyntet Runner permite reproducir el adaptador desde cero con los mismos datos, útil para auditorías de IA y cumplimiento normativo.

## Benchmarks y rendimiento
Los datos de evaluación provienen de la model card del autor. Se evaluaron 29 prompts (greedy, temperatura 0) en una tarea de tool-calling con cuatro herramientas. La tabla compara el modelo base sin adaptador y con el adaptador:

| Métrica | Qwen3-4B Q4_K_M (base) | + adaptador |
|---|---|---|
| JSON parses | 1.000 | 1.000 |
| Right tool | 0.724 | 1.000 |
| Schema args | 0.724 | 1.000 |
| Exact call | 0.690 | 1.000 |

Además, el estudio de tres precisiones (bf16, Q8_0, Q4_K_M) mostró que todos los adaptadores alcanzan un rendimiento de 1.000 exacto en la evaluación sobre el propio base, y que los adaptadores entrenados en bf16 y Q8_0 también logran 1.000 cuando se aplican al base Q4_K_M. No hay más datos de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador es un archivo GGUF de 0.3 GB, que se suma al modelo base Qwen3-4B Q4_K_M (aprox. 2.5-3 GB). En total, la carga en memoria puede ser de ~3-3.5 GB.
- El motor Xyntetik Runner funciona en CPU (probado en un host EPYC de 128 hilos, con ~45 s/step en el entrenamiento). Para inferencia, se puede usar con `--gpu off` para CPU, o con GPU si se dispone de ella.
- En una GPU, el adaptador y el base caben en tarjetas con 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060). Se recomienda una RTX 3060 o superior para inferencia fluida.
- Opciones de despliegue: además del propio runner, el adaptador puede cargarse con llama.cpp (ya que usa la convención de nombres de adaptadores de llama.cpp) y con vLLM si se convierte a formato compatible.
- La latencia dependerá del hardware; en CPU se puede esperar una velocidad de ~10-20 tokens/s para un modelo 4B cuantizado, mientras que en GPU se alcanzan 30-50 tokens/s.

## Comparativa con modelos similares

No hay datos de comparativa directa con otros adaptadores de tool-calling en la información proporcionada. Se puede comparar con el modelo base sin adaptador (tabla anterior) y con otros modelos de 4B que soportan tool-calling, pero no se dispone de métricas. Por tanto:

| Modelo | Parametros | Contexto | Tool-calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4B | 128 (entrenamiento) | 0.724 (right tool) | Apache 2.0 | HuggingFace |
| Qwen3-4B + adaptador | 4B + 16M | 128 | 1.000 | Apache 2.0 | HuggingFace |
| Llama-3.2-3B (sin datos) | 3B | 128K | no disponible | Llama 3.2 | no disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K | no disponible | MIT | HuggingFace |

No se recomienda inferir más sin datos adicionales.

## Limitaciones y advertencias

- La tarea de entrenamiento es sintética y estrecha (cuatro herramientas, plantillas generadas, 29 prompts de evaluación). El adaptador demuestra el mecanismo de entrenamiento y su reproducibilidad, pero no una capacidad general de tool-calling.
- El entrenamiento de 316 pasos con 158 ejemplos es de memorización; no es adecuado para tareas que requieren conocimiento general o razonamiento complejo.
- El estudio de precisión se limita a esta tarea; en tareas más difíciles, los adaptadores entrenados con diferentes precisiones podrían divergir más.
- El adaptador está diseñado para ser utilizado con el motor Xyntetik Runner (≥ v0.2.0). Aunque el formato es compatible con llama.cpp, no se garantiza su funcionamiento en otros motores sin pruebas.
- El entrenamiento se realizó en CPU; el soporte de entrenamiento CUDA está en desarrollo, pero no se documenta.
- No se han publicado datos de sesgos, alucinación o comportamiento en otros idiomas. La licencia Apache 2.0 permite uso comercial, pero se recomienda evaluar el modelo en el dominio de aplicación.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/Joakimpalm-Zen/Qwen3-4B-Runner-ToolUse-Q4_K_M)
- [GitHub - Xyntetik Runner](https://github.com/Joakimpalm-Zen/xyntetik-runner)
- [GitHub - Qwen3 (modelo base)](https://github.com/QwenLM/Qwen3)
- [HuggingFace - Qwen3-8B (referencia del modelo base)](https://huggingface.co/Qwen/Qwen3-8B)
- [HuggingFace - bartowski Qwen3-4B GGUF](https://huggingface.co/bartowski/Qwen_Qwen3-4B-GGUF)
