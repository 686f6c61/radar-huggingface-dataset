# agentic-ptb/sol-max-v2.h015.pi-agent-sft-v10.step_250

## Resumen

`agentic-ptb/sol-max-v2.h015.pi-agent-sft-v10.step_250` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio codifica la hora de la ejecución: `h015` indica que el checkpoint se guardó a las 15,32 horas de una ejecución planificada de 100 horas, dentro de la celda `sol-max-v2` que utiliza como driver el modelo Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo.

El modelo está diseñado para tareas de agente (agentic SFT), como indica el sufijo `pi-agent-sft-v10`. Al ser un checkpoint intermedio, no es un modelo final, sino un punto de control para evaluar la evolución del entrenamiento a lo largo del tiempo. Su relevancia radica en que permite estudiar cómo mejora el rendimiento de un modelo de agente durante el entrenamiento, y sirve como referencia para comparar con otros checkpoints de la misma celda. La arquitectura subyacente es la de Qwen3.5-9B-Base, que según la model card es `Qwen3_5ForConditionalGeneration`, una arquitectura con torre de visión presente en los pesos, aunque el modelo se sirve como texto puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (fine-tuning de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`. Aunque esta arquitectura incluye una torre de visión, el checkpoint se sirve como modelo de texto únicamente; la model card advierte que vLLM debe configurarse con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar errores de carga. No se dispone de información sobre la arquitectura interna exacta (número de capas, cabezas de atención, etc.) más allá de lo heredado del modelo base.

El entrenamiento corresponde a un barrido de AgentPTB, con un driver de razonamiento (Codex / gpt-5.6-sol) que genera datos de entrenamiento para el fine-tuning supervisado (SFT) orientado a agentes. El sufijo `pi-agent-sft-v10` sugiere que se trata de la décima versión de un dataset de SFT para agentes, pero no se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se guardó a las 15,32 horas de una ejecución de 100 horas, y el token de fin de secuencia (`eos_token_id`) está correctamente configurado como `248046` (`<|im_end|>`), lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tuning de Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, posiblemente código y matemáticas), pero no hay confirmación oficial. El propósito declarado es el entrenamiento de modelos de agente, por lo que es probable que el modelo haya sido ajustado para tareas de tool calling y razonamiento multi-paso, aunque esto no está verificado. No se dispone de información sobre capacidades multilingües, visión o audio.

## Casos de uso

No se han publicado casos de uso específicos para este checkpoint. Dado su carácter de modelo de agente en entrenamiento, los usos potenciales serían:

- Evaluación de progreso en tareas de agente: al ser un checkpoint intermedio, puede utilizarse para medir la evolución del rendimiento a lo largo del tiempo en benchmarks de agente (por ejemplo, navegación web, uso de herramientas).
- Investigación en fine-tuning de agentes: sirve como punto de comparación para estudiar el efecto de diferentes datos de SFT o configuraciones de entrenamiento.
- Prototipado de agentes conversacionales: si se completa el entrenamiento, podría integrarse en sistemas de diálogo con herramientas, aunque en su estado actual no es recomendable para producción.
- Análisis de la dinámica de entrenamiento: los checkpoints permiten trazar curvas de rendimiento frente al tiempo de entrenamiento, útil para ajustar hiperparámetros.

Estos usos son hipotéticos y no están respaldados por documentación oficial del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas a puntuaciones de MMLU, HumanEval, GSM8K u otros conjuntos de datos. Cualquier comparación numérica sería especulativa.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño del modelo (9,4 mil millones de parámetros) y del peso de los safetensors (18,8 GB en precisión completa, probablemente FP16 o BF16). No se dispone de datos oficiales de latencia o throughput.

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB (peso del modelo más overhead de activaciones y KV cache). Esto cabe en una GPU de 24 GB como la RTX 4090 o la A10G, pero no en GPUs de 16 GB.
- Con cuantización de 8 bits: alrededor de 10-11 GB de VRAM, viable en GPUs de 12-16 GB (por ejemplo, RTX 3080 Ti, RTX 4070 Ti).
- Con cuantización de 4 bits: alrededor de 5-6 GB, viable en GPUs de 8 GB (por ejemplo, RTX 3060, RTX 4060).
- GPUs recomendadas para inferencia sin cuantizar: A100 (40/80 GB), H100, RTX 4090, o GPUs de datacenter con al menos 24 GB.
- Opciones de despliegue: vLLM (con la configuración de texto puro indicada), llama.cpp, Ollama (si se convierte a GGUF), TGI. No se ha probado oficialmente en ninguna de estas plataformas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un checkpoint intermedio de un fine-tuning de Qwen3.5-9B-Base, y no se conocen modelos comparables de la misma categoría (agentes SFT) con datos públicos. Se podría comparar con el propio Qwen3.5-9B-Base en términos de parámetros, pero no hay métricas de rendimiento. Por tanto, la comparativa se limita a:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2.h015 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen2.5-7B | 7,6B | 128K (típico) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento para ninguna de estas opciones en el contexto de tareas de agente.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un barrido de entrenamiento, no un modelo final. Su rendimiento puede ser inferior al de un modelo completamente entrenado, y no está diseñado para uso en producción.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un fine-tuning de Qwen3.5-9B-Base, es probable que herede los sesgos del modelo base, pero no hay confirmación.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor antes de cualquier uso.
- La arquitectura incluye una torre de visión, pero el modelo se sirve como texto puro; si se intenta cargar sin la configuración adecuada en vLLM, puede fallar.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h015.pi-agent-sft-v10.step_250
- Índice de checkpoints de AgentPTB (mencionado en la model card): https://huggingface.co/agentic-ptb/INDEX (no verificado)
- Búsqueda de modelos de agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb
