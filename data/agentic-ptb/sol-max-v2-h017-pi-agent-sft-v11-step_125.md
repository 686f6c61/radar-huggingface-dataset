# agentic-ptb/sol-max-v2.h017.pi-agent-sft-v11.step_125

## Resumen

Este modelo es un checkpoint intermedio de un proceso de entrenamiento de agentes denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning sobre el modelo base `Qwen/Qwen3.5-9B-Base`, orientado a tareas de agente mediante supervisión (pi-agent-sft). El checkpoint corresponde a la hora 17 de un run de 100 horas, con un driver de Codex/gpt-5.6-sol con esfuerzo de razonamiento máximo. Tiene 9.409.813.744 parámetros (9,4B) y un tamaño de 18,8 GB en formato safetensors.

La relevancia de este checkpoint radica en que forma parte de un barrido sistemático (sweep) para estudiar el efecto del tiempo de entrenamiento en el rendimiento de agentes. Al ser un punto intermedio, no está pensado para uso en producción, sino para investigación y análisis de la curva de aprendizaje. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, que utiliza la arquitectura `Qwen3_5ForConditionalGeneration`, una arquitectura que incluye un codificador de visión. Sin embargo, en este checkpoint la torre de visión está presente pero no se utiliza, y el modelo se sirve como texto únicamente. El entrenamiento es de tipo supervisado para agentes (pi-agent-sft), aunque no se han publicado detalles sobre el dataset, el número de tokens ni el proceso de optimización (por ejemplo, si se usó RLHF o DPO).

El checkpoint se generó dentro de un run de 100 horas con un driver de Codex/gpt-5.6-sol con esfuerzo de razonamiento máximo. Se indica que el `eos_token_id` es `[248046]`, correspondiente a `<|im_end|>`, el token de fin de turno de la plantilla de chat de Qwen3.5. Esto es relevante porque los checkpoints sin este token no detienen la generación al final del turno y sobrepasan la ventana de contexto, lo que invalidaría las evaluaciones.

## Capacidades

No se han publicado detalles específicos sobre las capacidades de este checkpoint. Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades del modelo base, como generación de texto, razonamiento y posiblemente tool calling, pero no hay documentación que lo confirme. Dado que es un fine-tuning para agentes, es probable que tenga capacidades de razonamiento multi-paso y uso de herramientas, pero esto no está verificado.

## Casos de uso

Al tratarse de un checkpoint intermedio de un proceso de entrenamiento, no se recomienda su uso en producción. Los casos de uso plausibles son:

- Investigación sobre el efecto del tiempo de entrenamiento en el rendimiento de agentes: este checkpoint permite trazar la curva de rendimiento a lo largo del run de 100 horas.
- Punto de partida para continuar el entrenamiento: puede servir como base para fine-tuning adicional o para experimentos de transferencia.
- Evaluación comparativa de checkpoints: permite comparar el rendimiento en diferentes horas del run para estudiar la convergencia.
- Análisis de la configuración del eos_token_id: útil para entender cómo afecta la correcta terminación de turno en la evaluación de modelos de agente.
- Desarrollo de pipelines de evaluación para modelos de agente: puede usarse como caso de prueba para herramientas de evaluación y despliegue.
- Estudio de la arquitectura Qwen3.5-9B-Base en tareas de agente: permite analizar cómo se comporta esta arquitectura cuando se fine-tunea específicamente para agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros, en FP16 se necesitan aproximadamente 19 GB de VRAM; en cuantización de 8 bits, unos 10 GB; en 4 bits, unos 5 GB.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB (por ejemplo, RTX 4090, A100 40GB); para cuantización de 8 bits, una GPU de 16 GB (RTX 4080, A10); para 4 bits, una GPU de 8 GB (RTX 3070, A2).
- Cabe en GPUs de consumo: sí, con cuantización de 4 u 8 bits en GPUs de 16-24 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI. Para vLLM, es necesario indicar que el modelo es solo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'` porque la arquitectura incluye visión.
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. Al ser un checkpoint intermedio de un proceso de entrenamiento específico, no hay alternativas públicas equivalentes. Se podría comparar con el modelo base Qwen3.5-9B-Base, pero no se han publicado métricas de rendimiento para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: puede tener problemas de convergencia o de calidad en comparación con checkpoints posteriores del mismo run.
- No se dispone de licencia: el uso comercial no está claramente permitido, y la ausencia de licencia puede generar problemas legales.
- Falta de documentación: no hay información sobre idiomas, capacidades específicas ni benchmarks, lo que dificulta su evaluación.
- Configuración de visión: la arquitectura incluye una torre de visión que no se utiliza, y es necesario configurar vLLM correctamente para evitar errores de carga.
- El eos_token_id correcto es `[248046]`, pero si se utiliza otro checkpoint del mismo run sin este token, la generación no se detendrá correctamente.
- No se recomienda su uso en producción sin una evaluación exhaustiva y sin conocer la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/sol-max-v2.h017.pi-agent-sft-v11.step_125
- Búsqueda de modelos de agentic-ptb en Hugging Face: https://huggingface.co/models?other=agentic-ptb
