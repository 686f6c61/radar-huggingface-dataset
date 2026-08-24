# agentic-ptb/sol-max-v2.h081.pi-agent-sft-v9e-reasoning-final.step_125

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, identificado como `sol-max-v2.h081.pi-agent-sft-v9e-reasoning-final.step_125`. El modelo es un fine-tuning del base `Qwen/Qwen3.5-9B-Base` mediante un proceso de SFT con razonamiento (`pi-agent-sft-v9e-reasoning-final`), generado por el driver Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo. Se trata de un artefacto de investigación orientado a estudiar la evolución del rendimiento a lo largo de una ejecución de 100 horas; este checkpoint corresponde a la hora 81,44 de la ejecución.

Con 9.409.813.744 parámetros y un tamaño de 18,8 GB en formato safetensors, el modelo hereda la arquitectura de Qwen3.5-9B-Base, que incluye un componente de visión (Qwen3_5ForConditionalGeneration), aunque el checkpoint se sirve como modelo de texto. No se dispone de información sobre licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks. Su relevancia radica en ser un punto de control reproducible dentro de un pipeline de entrenamiento experimental, útil para quienes investigan dinámicas de fine-tuning y razonamiento en modelos de 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de vision, servido como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del base Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer con componente de visión. El checkpoint se produce mediante un proceso de SFT con razonamiento (`pi-agent-sft-v9e-reasoning-final`) dentro del framework AgentPTB, dirigido por un driver de alto nivel (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo. La ejecución completa duró 100 horas; este checkpoint se guardó a la hora 81,44. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El token `eos_token_id` es `248046` (`<|im_end|>`), correcto para la plantilla de chat de Qwen3.5, lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del base Qwen3.5-9B-Base, aunque no hay evaluaciones específicas de este checkpoint.
- Soporte de tool calling / function calling: no documentado para este checkpoint; depende del fine-tuning aplicado.
- Soporte de agentes y multi-step reasoning: el nombre del pipeline (`pi-agent-sft-v9e-reasoning-final`) sugiere entrenamiento orientado a agentes, pero no hay evidencia publicada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el base incluye visión, pero el checkpoint se sirve como texto; no se ha verificado el funcionamiento de la torre de visión.

## Casos de uso

Dado que no hay documentación oficial de casos de uso, los siguientes son potenciales basados en el modelo base y en el propósito del pipeline de entrenamiento, sin validación empírica:

- Investigacion en fine-tuning: util para reproducir y analizar la evolucion del rendimiento a lo largo de un sweep de entrenamiento, comparando checkpoints de distintas horas.
- Experimentacion con agentes de razonamiento: el pipeline sugiere entrenamiento para tareas de agente; puede probarse en entornos de simulacion de agentes.
- Generacion de codigo asistida: el base Qwen3.5-9B-Base tiene capacidades de codigo; este checkpoint podria usarse en tareas de autocompletado o refactorizacion, previa validacion.
- Razonamiento multi-paso: adecuado para experimentos con cadenas de pensamiento o planificacion, aunque sin datos de rendimiento.
- Prototipado de chatbots: con la plantilla de chat de Qwen3.5, puede servir para prototipos de asistentes conversacionales.
- Analisis de convergencia: como checkpoint intermedio, permite estudiar el efecto del tiempo de entrenamiento en la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo (18,8 GB) sugiere que en fp16/bf16 se necesitan al menos 20 GB de VRAM. Con cuantizacion 4-bit (no disponible en el repo) se podria reducir a unos 6-8 GB, pero no hay datos oficiales.
- GPU recomendadas: una GPU con 24 GB o mas (RTX 3090/4090, A10G, A100) para inferencia sin cuantizar. Para cuantizacion, una GPU de 12 GB podria ser suficiente, pero no esta verificado.
- Si cabe en consumer GPU: si, en GPUs de gama alta (24 GB) para fp16; en GPUs de 8-12 GB solo con cuantizacion externa (no incluida).
- Opciones de despliegue: vLLM (con la advertencia de usar `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar errores de carga), llama.cpp, Ollama o TGI, previa conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se compara con el base y con alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | HuggingFace |
| Mistral 7B | 7B | 32K | Apache 2.0 | HuggingFace |

La comparacion de rendimiento no es posible por falta de benchmarks.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar inestabilidades o rendimiento inferior al de checkpoints posteriores.
- Sesgos y alucinaciones: hereda los del modelo base Qwen3.5-9B-Base, no evaluados en este checkpoint.
- Licencia no disponible: impide determinar si es utilizable en entornos comerciales; se recomienda contactar al autor antes de cualquier uso productivo.
- Sin datos de contexto ni idiomas: no se puede garantizar el comportamiento en ventanas largas o en idiomas distintos del ingles.
- Requiere configuracion especial en vLLM: al incluir la torre de vision, hay que forzar el modo texto con `--limit-mm-per-prompt`.
- Sin benchmarks: no hay evidencia de capacidades concretas; cualquier uso en produccion debe ir precedido de evaluacion propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h081.pi-agent-sft-v9e-reasoning-final.step_125
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Busqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
