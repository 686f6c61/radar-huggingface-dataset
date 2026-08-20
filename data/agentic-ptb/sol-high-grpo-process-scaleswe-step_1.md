# agentic-ptb/sol-high.grpo-process-scaleswe.step_1

## Resumen

El modelo `agentic-ptb/sol-high.grpo-process-scaleswe.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, orientado a tareas de ingeniería de software a gran escala. Está construido sobre el modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros, aproximadamente 9,4 mil millones) y ha sido sometido a un proceso de optimización con GRPO (Group Relative Policy Optimization) sobre el benchmark ScaleSWE, que mide agentes de codificación en tareas de software engineering de largo horizonte.

El nombre del checkpoint indica que pertenece a la celda `sol-high`, cuyo driver es Codex / gpt-5.6-sol con un nivel de razonamiento `high`. Se trata de un paso intermedio (`step_1`) dentro de un run de entrenamiento, no de un modelo final listo para producción. Su propósito principal es servir como punto de control para evaluar la evolución del entrenamiento y comparar métricas entre celdas del mismo barrido.

La relevancia de este modelo radica en que representa un intento de transferir capacidades de razonamiento avanzado (tipo GPT-5.6 Sol) a un modelo abierto de 9B mediante RL, con el objetivo de mejorar el rendimiento en tareas de codificación agéntica. Sin embargo, al ser un checkpoint intermedio, su utilidad práctica fuera del contexto de investigación es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4B parámetros. Sobre esta base se ha aplicado un proceso de entrenamiento con GRPO (Group Relative Policy Optimization), una variante de RL que optimiza la política del modelo comparando grupos de respuestas generadas para una misma instrucción. El entrenamiento se enmarca en el proyecto AgentPTB, que utiliza un "driver" (Codex / gpt-5.6-sol) para generar datos o guiar el proceso, con un nivel de razonamiento `high`.

El checkpoint corresponde al paso 1 de un run denominado `grpo-process-scaleswe`, lo que sugiere que el entrenamiento se centra en tareas del benchmark ScaleSWE (tareas de ingeniería de software de largo horizonte). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF. El `eos_token_id` está configurado correctamente con los tokens `[248044, 248046]`, lo que garantiza que el modelo detiene la generación al final de cada turno según la plantilla de chat de Qwen3.5.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda las capacidades de generación de lenguaje y razonamiento del modelo base, aunque el fine-tuning con GRPO puede haber modificado su comportamiento.
- Codificación y tareas de software engineering: el entrenamiento está orientado a ScaleSWE, por lo que se espera que el modelo mejore en tareas de resolución de issues, generación de parches y edición de código.
- Razonamiento multi-step: el uso de un driver con `reasoning effort: high` sugiere que el modelo está entrenado para producir cadenas de razonamiento extensas antes de emitir una respuesta.
- Soporte de tool calling: no se especifica, pero Qwen3.5-9B-Base tiene capacidades de function calling; el fine-tuning podría conservarlas o modificarlas.
- Capacidades multilingües: no disponibles, aunque el modelo base de Qwen suele soportar múltiples idiomas.
- Modo de pensamiento (thinking mode): no se menciona explícitamente, pero el entrenamiento con GRPO y razonamiento `high` podría inducir un comportamiento de razonamiento explícito.

## Casos de uso

- Investigación en RL para codificación: el checkpoint es útil para estudiar la evolución de la política durante el entrenamiento GRPO, comparando métricas entre pasos y celdas del barrido.
- Evaluación de checkpoints intermedios: permite medir el progreso del modelo en tareas de ScaleSWE y determinar si el entrenamiento converge o sufre degradación.
- Fine-tuning posterior: puede servir como punto de partida para continuar el entrenamiento con otros datasets o técnicas de alineación.
- Análisis de comportamiento de razonamiento: al ser un checkpoint con `reasoning effort: high`, se puede estudiar cómo el modelo estructura sus cadenas de pensamiento en tareas de codificación.
- Benchmarking de agentes de codificación: el modelo puede integrarse en pipelines de evaluación de agentes para comparar su rendimiento con otros modelos de tamaño similar.
- Desarrollo de sistemas de generación de código asistida: aunque no es un modelo final, podría usarse como base para experimentos de generación de parches o resolución de issues en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un checkpoint intermedio y no se proporcionan métricas de MMLU, HumanEval, GSM8K ni otros estándares. La model card solo indica que es el "mejor cell del sweep" según las figuras del proyecto, pero no se incluyen números concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP16 ocupa aproximadamente 18,8 GB (según el tamaño del repo). Para inferencia en FP16 se necesitan al menos 20 GB de VRAM (por ejemplo, una RTX 3090 o RTX 4090). Con cuantización a 8 bits se reduciría a ~10 GB, y a 4 bits a ~5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia sin cuantizar, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) es suficiente. Para entrenamiento o fine-tuning, se recomienda una A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en una RTX 4090 con cuantización, pero no se han proporcionado archivos GGUF ni AWQ.
- Opciones de despliegue: al ser un checkpoint en safetensors, se puede cargar con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se han publicado integraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un checkpoint intermedio de un proceso de RL, no un modelo final. Como referencia, se puede comparar con su modelo base `Qwen/Qwen3.5-9B-Base` (misma arquitectura y tamaño, sin el fine-tuning GRPO) y con otros modelos de 9B como Llama-3.1-8B o Mistral-7B, pero no se tienen datos de rendimiento de este checkpoint en benchmarks estándar. La comparativa queda pendiente de la publicación de resultados del sweep.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar comportamientos inestables o incompletos en tareas fuera del dominio de entrenamiento.
- Sesgos del proceso de RL: el entrenamiento con GRPO puede inducir sesgos hacia las recompensas del entorno ScaleSWE, lo que podría degradar el rendimiento en tareas generales de lenguaje.
- Riesgo de alucinación: al ser un modelo de 9B fine-tuneado con RL, puede generar código o explicaciones incorrectas, especialmente en contextos largos.
- Licencia no especificada: no se indica la licencia, por lo que su uso comercial o redistribución es incierto.
- Sin datos de evaluación: no hay benchmarks publicados, lo que impide conocer su rendimiento real en tareas estándar.
- Dependencia del modelo base: las limitaciones de Qwen3.5-9B-Base (sesgos, idiomas, contexto) se heredan, aunque no se especifican.
- Contexto no confirmado: no se ha verificado la longitud de contexto efectiva tras el fine-tuning.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.grpo-process-scaleswe.step_1
- Repositorio ScaleSWE: https://github.com/AweAI-Team/ScaleSWE
- DeepSWE (benchmark de agentes de codificación): https://deepswe.datacurve.ai/
- Página de GPT-5.6 (referencia del driver): https://openai.com/index/gpt-5-6/
- Preview de GPT-5.6 Sol: https://openai.com/index/previewing-gpt-5-6-sol/
