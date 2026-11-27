# deanoshuang/qwen3.5-9b-agent-sft-v7-lora

## Resumen
El modelo `deanoshuang/qwen3.5-9b-agent-sft-v7-lora` es un adaptador LoRA de rango 32 entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen3.5-9B. Lo desarrolla el usuario de Hugging Face deanoshuang en el contexto de un estudio iterativo de SFT para agentes, y su propósito es especializar al modelo base en tareas de ingeniería de software (SWE) y de terminal, manteniendo a la vez capacidades de matemáticas, ciencia, seguimiento de instrucciones y chat. Es un checkpoint de investigación, no un modelo final de producción.

El adaptador se construye sobre la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base Qwen3.5-9B, congelando la torre de visión y aplicando el entrenamiento únicamente sobre el modelo de lenguaje. Emplea 86.556.672 parámetros entrenables en 12 módulos objetivo de las 32 capas, con un total de 3.566 filas de entrenamiento y 9.048.308 tokens de pérdida. Es relevante ahora porque forma parte de una comparativa de tres versiones (Base, SFT y etapa 2) evaluada en SWE-bench Pro, Terminal-Bench 2.0 y HLE, y porque demuestra un flujo reproducible de SFT con LoRA sobre trayectorias agénticas verificadas.

La ficha se centra en el adaptador y en su receta de entrenamiento, dado que la información disponible no incluye resultados de benchmarks ni métricas de evaluación finales. El modelo está pensado para investigadores que quieran reproducir o extender el estudio, y para desarrolladores que necesiten un punto de partida para agentes de terminal y de código sobre una base multimodal de 9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3.5-9B (clase servida `Qwen3_5ForConditionalGeneration`; torre de visión congelada) |
| Parámetros totales | No disponible (el adaptador tiene 86.556.672 parámetros entrenables; el total del modelo base no se especifica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el límite por fila de entrenamiento es de 65.536 tokens, no el contexto máximo del modelo) |
| Tipos de cuantización | No disponible (el adaptador se entrena en bf16 sin cuantización; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); se recomienda fusionar en bf16 para servir |

## Arquitectura y entrenamiento
El adaptador es un LoRA de rango 32 con alpha 64, dropout 0,05 y sin sesgo, aplicado sobre 12 módulos objetivo (`q/k/v/o_proj`, `in_proj_qkv/z/b/a`, `out_proj`, `gate/up/down_proj`) en las 32 capas del modelo de lenguaje de Qwen3.5-9B. La torre de visión permanece congelada y el adaptador solo toca el modelo de lenguaje. El entrenamiento se hace en bf16 sin cuantización, con pérdida calculada únicamente sobre los turnos del asistente (razonamiento, contenido y llamadas a herramientas); las observaciones, los prompts y los turnos enmascarados son solo contexto.

Los datos de la revisión v7r1 (mezcla `data_mixture_v7_20261013_221306`, congelada el 2026-10-13) constan de 3.566 filas y 9.048.308 tokens de pérdida, con una composición del 37,3 % SWE, 33,2 % terminal y 29,5 % de retención (matemáticas, ciencia, seguimiento de instrucciones y chat). Las fuentes incluyen `nvidia/Open-SWE-Traces`, `ai-and/termgrade-trajectories`, `nvidia/Nemotron-SFT-Math-v4`, `nvidia/Nemotron-Science-v1` y `nvidia/Nemotron-SFT-Instruction-Following-Chat-v3`. Se aplican máscaras de pensamiento adaptativas en los turnos SWE (razonamiento corto en turnos rutinarios y razonamiento largo solo en puntos de decisión), y las filas de terminal provienen mayoritariamente de ensayos exitosos de DeepSeek-V4-Pro y Kimi-K3 con guardas por turno.

El optimizador es AdamW con LR 2e-5, programación coseno durante 1 época (298 pasos), 3 % de warm-up, weight decay 0, grad clip 1,0, batch efectivo de 12 (1 secuencia × 12 pasos de acumulación), pérdida promediada por tokens y semilla 42. El entrenamiento se ejecutó en 1 GPU NVIDIA B200 durante 1,97 h a 8.693 tokens/s, con un pico de memoria de 71,6 GB, 1,98 GPU-h y un coste aproximado de 16 USD. La pérdida de validación final fue de 0,5327 en el shard de 200 filas del propio run (agrupado por tarea; los shards difieren entre revisiones de datos, por lo que solo son comparables dentro de una misma revisión).

## Capacidades
- Generación de texto y razonamiento con modo "thinking" activado por defecto.
- Tareas de ingeniería de software: resolución de incidencias, edición de código y trayectorias de agente sobre repositorios.
- Tareas de terminal: ejecución de comandos, interpretación de salidas y recuperación ante fallos.
- Llamadas a herramientas (tool calling / function calling) integradas en las trayectorias de entrenamiento.
- Razonamiento multi-paso y comportamiento agéntico en entornos SWE y de terminal.
- Capacidades de retención en matemáticas, ciencia, seguimiento de instrucciones y chat.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), aunque la torre de visión no se entrena en este adaptador.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso
- Resolución automática de incidencias en repositorios: el adaptador se entrena con trayectorias SWE verificadas y máscaras de razonamiento adaptativas, por lo que puede emplearse para generar parches y comandos de verificación en un pipeline de integración continua.
- Agente de terminal para tareas de administración: las filas de terminal provenientes de ensayos exitosos de DeepSeek-V4-Pro y Kimi-K3 con guardas por turno permiten usarlo en la ejecución supervisada de comandos y en la interpretación de salidas.
- Asistente de código en el IDE: al conservar las capacidades de chat e instrucciones del modelo base, puede gestionar conversaciones multi-turno con contexto de repositorio y llamadas a herramientas de edición.
- Investigación en SFT agéntico: sirve como checkpoint reproducible (run `sft_v7_20261013_221813`, commit `c75750198a6067b1f5860055ccf748083eeeb4f9`) para comparar recetas de datos y tasas de aprendizaje dentro del estudio.
- Evaluación comparativa de adaptadores: al compartir base, forma LoRA y enmascaramiento de pérdida con los otros cinco checkpoints del estudio, permite aislar el efecto de los datos y del optimizador en SWE-bench Pro, Terminal-Bench 2.0 y HLE.
- Prototipado de agentes con retención de matemáticas y ciencia: la mezcla incluye un 29,5 % de datos de retención de Nemotron, útil para tareas que combinan razonamiento técnico con operaciones sobre código.
- Despliegue en investigación con vLLM: la model card indica fusionar el adaptador en bf16 con `scripts/merge_adapter.sh merge` y servir con las flags de `configs/eval/model.yaml`, lo que facilita la réplica de evaluaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no incluye puntuaciones de benchmark; el estudio asociado evalúa en SWE-bench Pro, Terminal-Bench 2.0 y HLE, pero los resultados no se proporcionan en los datos disponibles.

## Requisitos de hardware
- Entrenamiento: 1 GPU NVIDIA B200 con un pico de 71,6 GB de memoria, 1,97 h y 8.693 tokens/s para el run v7.
- Inferencia: no se documenta VRAM estimada para el adaptador; el modelo base es de 9B parámetros y el adaptador añade 86,5 M de parámetros entrenables, por lo que se requiere cargar el base completo en bf16 además del adaptador.
- GPU recomendadas: no disponibles de forma explícita; el entrenamiento se validó en B200. Para inferencia, el tamaño del base (9B) condiciona la elección.
- GPU de consumo: no disponible; no se confirma que quepa en GPU de consumo con las configuraciones documentadas.
- Despliegue: PEFT + Transformers para carga del adaptador; fusión en bf16 con `scripts/merge_adapter.sh merge` y servicio con vLLM usando `configs/eval/model.yaml`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se conoce el throughput de entrenamiento (8.693 tokens/s en B200); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3.5-9b-agent-sft-v7-lora (este) | 86,5 M entrenables sobre base 9B | No disponible | Apache 2.0 | safetensors (LoRA) | LR 2e-5, batch 12, 1 época, datos v7r1 |
| qwen3.5-9b-agent-sft-v7-lr5e5-lora | 86,5 M entrenables sobre base 9B | No disponible | Apache 2.0 | safetensors (LoRA) | Misma base y datos, LR 5e-5, batch 16 |
| qwen3.5-9b-agent-sft-v6-lora | 86,5 M entrenables sobre base 9B | No disponible | Apache 2.0 | safetensors (LoRA) | Datos v6r2, LR 2e-5, batch 16, 1 época |
| qwen3.5-9b-agent-sft-lora | No disponible | No disponible | Apache 2.0 | safetensors (LoRA) | Primera build, LR 1e-4, batch 16, 1 época |

La comparación con modelos de otras familias no está disponible en la información proporcionada. Los tres adaptadores alternativos comparten base, forma LoRA y enmascaramiento de pérdida, por lo que la comparación directa se limita a la receta de datos y al optimizador.

## Limitaciones y advertencias
- Es un checkpoint de investigación: la model card lo describe como tal y no como un modelo listo para producción.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de mejora frente al base en SWE-bench Pro, Terminal-Bench 2.0 o HLE.
- La pérdida de validación (0,5327) solo es comparable dentro de la misma revisión de datos, ya que los shards cambian entre revisiones.
- El adaptador solo se entrena sobre el modelo de lenguaje; la torre de visión queda congelada y no se especializa.
- Idioma limitado al inglés según la model card; no se documenta soporte multilingüe.
- Riesgo de alucinación y de sesgos no evaluado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B tiene sus propias condiciones que deben verificarse por separado.
- El adaptador requiere cargar el modelo base completo; no se documentan cuantizaciones del adaptador ni despliegue en llama.cpp u Ollama.
- No se especifica la longitud máxima de contexto del modelo base en la información disponible.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v7-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del estudio: https://github.com/PuzzleAI-Official/qwen3.5-9b-agentic-sft
- Adaptador con LR 5e-5: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v7-lr5e5-lora
- Adaptador revisión 6: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v6-lora
- Adaptador primera build: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-lora
- Adaptador revisión 5 época 1: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-efficient-lora
- Adaptador revisión 5 época 2: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v5ep2-lora
- Dataset Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset termgrade-trajectories: https://huggingface.co/datasets/ai-and/termgrade-trajectories
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Nemotron-Science-v1: https://huggingface.co/datasets/nvidia/Nemotron-Science-v1
- Dataset Nemotron-SFT-Instruction-Following-Chat-v3: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v3
