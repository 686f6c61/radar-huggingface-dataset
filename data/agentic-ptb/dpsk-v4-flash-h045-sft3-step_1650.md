# agentic-ptb/dpsk-v4-flash.h045.sft3.step_1650

## Resumen

`agentic-ptb/dpsk-v4-flash.h045.sft3.step_1650` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9,4 mil millones de parámetros, y está etiquetado como una variante "dpsk-v4-flash" con esfuerzo de razonamiento `thinking`, lo que sugiere que está orientado a tareas de razonamiento agéntico. El checkpoint corresponde al paso 1650 de la tercera etapa de fine-tuning supervisado (SFT3) y fue recuperado de una copia de seguridad externa tras ser podado del almacenamiento original.

Este modelo no está destinado a uso general: es un artefacto intermedio de investigación, sin licencia declarada, sin información sobre idiomas, contexto o capacidades específicas. Su relevancia radica en que forma parte de un experimento de entrenamiento de modelos agénticos, y puede ser útil para estudiar la evolución del rendimiento durante el entrenamiento o como punto de partida para continuar el fine-tuning. No se han publicado benchmarks ni documentación técnica más allá de la model card mínima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (transformer decoder-only, sin más detalle disponible) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se indica si es MoE; el modelo base es denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 18,8 GB, 1 shard) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura de transformer decoder-only denso. No se proporcionan detalles adicionales sobre la arquitectura interna, como número de capas, cabezas de atención o mecanismos especiales. La model card indica que pertenece a un "sweep checkpoint" del proyecto AgentPTB, con la celda `dpsk-v4-flash` y un "driver" denominado `pi / DeepSeek v4-flash` con esfuerzo de razonamiento `thinking`. Esto sugiere que el entrenamiento incorpora algún mecanismo de razonamiento explícito, pero no se especifica si se trata de RLHF, DPO, o una técnica propietaria.

El checkpoint corresponde al paso 1650 de la tercera etapa de fine-tuning supervisado (SFT3). No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni las técnicas de alineación empleadas. El repositorio original fue podado y el checkpoint se recuperó de una copia de seguridad (`msr-spare/msr-agentic-ptb-dpsk-sft3-intermediates`). Se advierte además que el `eos_token_id` configurado es `[248044]` y que falta el token `248046`, lo que puede afectar a la generación si se usa directamente.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un fine-tuning de `Qwen/Qwen3.5-9B-Base`, podría heredar las capacidades generales de ese modelo base (generación de texto, razonamiento, código, etc.), pero no hay documentación que lo confirme. La etiqueta `thinking` sugiere un modo de razonamiento extendido, pero no se detalla su implementación ni su alcance. No se indica soporte para tool calling, agentes, visión, audio ni otras capacidades especiales.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación, los casos de uso son limitados y orientados al desarrollo de modelos:

- Evaluación de la trayectoria de entrenamiento: comparar el rendimiento en el paso 1650 con otros checkpoints del mismo sweep para estudiar la convergencia y la dinámica del fine-tuning.
- Continuación del entrenamiento: usar este checkpoint como punto de partida para etapas posteriores de SFT o RL, aprovechando que ya ha sido entrenado durante 1650 pasos.
- Análisis de comportamiento agéntico: estudiar cómo evoluciona la capacidad de razonamiento multi-paso en modelos de 9B durante el entrenamiento supervisado.
- Reproducción de experimentos: servir como referencia para reproducir o comparar los resultados del proyecto AgentPTB.
- Pruebas de alineación de tokens: verificar el impacto de la configuración incompleta de `eos_token_id` en la generación, como caso de estudio de errores en pipelines de entrenamiento.
- Investigación de fine-tuning eficiente: analizar si un checkpoint intermedio de un sweep puede igualar el rendimiento de checkpoints finales en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del tamaño de parámetros (9,4B) y el formato safetensors, se pueden estimar los siguientes requisitos para inferencia (estimaciones orientativas, no verificadas):

- VRAM estimada: ~19 GB en FP16, ~10 GB en cuantización de 8 bits, ~5 GB en cuantización de 4 bits.
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM para FP16 (p. ej., RTX 3090, RTX 4090, A10G); con cuantización de 4 bits podría ejecutarse en GPUs de 8 GB (p. ej., RTX 3070, RTX 4060).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se convierta el modelo a los formatos adecuados (GGUF, etc.). No se ha confirmado compatibilidad con ninguna de estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A nivel de especificaciones, se puede comparar con el modelo base y con otros modelos de ~9B:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9,4B | no disponible | no disponible | Checkpoint intermedio, sin uso general |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible | no disponible | Modelo base, disponible en HF |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 (uso comercial permitido) | Disponible en HF |
| Mistral-7B-v0.3 | 7B | 32K | Apache 2.0 | Disponible en HF |

La comparación es limitada porque no hay datos de contexto, licencia ni rendimiento para este checkpoint.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede tener un rendimiento inferior al de un checkpoint convergido y no está optimizado para producción.
- Configuración de token EOS incompleta: falta el token `248046`, lo que puede provocar generaciones que no terminen correctamente o comportamientos inesperados.
- Sin licencia declarada: no se puede determinar si su uso comercial está permitido; se recomienda contactar con el autor antes de cualquier uso.
- Sin documentación de capacidades: no se conocen los idiomas soportados, el contexto máximo ni las tareas para las que fue entrenado.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar.
- Origen incierto: el checkpoint fue recuperado de una copia de seguridad; no se garantiza su integridad o reproducibilidad.
- Riesgo de alucinación y sesgos: al ser un fine-tuning de un modelo base sin alineación documentada, puede presentar sesgos y alucinaciones similares a los de modelos no alineados.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h045.sft3.step_1650
- Origen (repositorio de respaldo): `msr-spare/msr-agentic-ptb-dpsk-sft3-intermediates` (sin URL directa disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
