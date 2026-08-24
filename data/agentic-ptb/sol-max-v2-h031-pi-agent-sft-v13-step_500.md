# agentic-ptb/sol-max-v2.h031.pi-agent-sft-v13.step_500

## Resumen

Este modelo es un checkpoint intermedio de un experimento de entrenamiento de agentes denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un enfoque específico para tareas de agente (pi-agent-sft). El checkpoint corresponde a la hora 31 de un run de 100 horas, dentro de una celda de experimentación llamada `sol-max-v2`, dirigida por un driver de razonamiento de alto esfuerzo (Codex / gpt-5.6-sol).

El modelo tiene 9.409.813.744 parámetros (9,4B) y se distribuye en formato safetensors con un tamaño de repositorio de 18,8 GB. Su relevancia radica en que es un punto de observación en la curva de entrenamiento de un sistema de agentes, útil para estudiar la evolución del comportamiento del modelo a lo largo del tiempo. No obstante, al ser un checkpoint intermedio, no está pensado para uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (arquitectura de visión, usada como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura de tipo transformer con torre de visión integrada (Qwen3_5ForConditionalGeneration). Sin embargo, el checkpoint se sirve como modelo de texto únicamente; la model card advierte que vLLM debe configurarse con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar fallos de carga. El entrenamiento es un SFT orientado a agentes (pi-agent-sft-v13), aunque no se proporcionan detalles sobre el dataset, el número de tokens ni el proceso de alineación (RLHF/DPO). El checkpoint se generó a las 31,38 horas de un run de 100 horas, con un driver de razonamiento de esfuerzo máximo. No se documentan innovaciones técnicas específicas más allá del propio esquema de entrenamiento por celdas del sweep AgentPTB.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas de este checkpoint. Al ser un fine-tuning para agentes, es plausible que herede las capacidades base de Qwen3.5-9B (generación de texto, razonamiento, código, etc.) y que haya sido entrenado para tareas de tool calling o multi-step reasoning, pero esto no está confirmado en la documentación proporcionada. Tampoco se especifican capacidades multilingües ni modos especiales de pensamiento. Se recomienda tratar este modelo como un artefacto de investigación sin garantías de comportamiento.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un experimento, los casos de uso son principalmente de investigación y desarrollo:

- Estudio de la dinámica de entrenamiento: analizar cómo evoluciona el comportamiento del modelo a lo largo de las horas de entrenamiento, comparando este checkpoint con otros de la misma celda.
- Evaluación de checkpoints intermedios: medir la calidad del modelo en tareas de agente en diferentes etapas del run para identificar el punto óptimo de detención.
- Reproducción de experimentos: servir como referencia para reproducir el sweep AgentPTB o para comparar con otras celdas.
- Desarrollo de pipelines de agentes: si se valida su comportamiento, podría integrarse en prototipos de agentes que requieran razonamiento de alto esfuerzo, aunque no se recomienda para producción sin una evaluación exhaustiva.
- Fine-tuning adicional: usar este checkpoint como punto de partida para nuevos entrenamientos, aprovechando el conocimiento adquirido en las primeras 31 horas.
- Análisis de robustez: probar el modelo en escenarios adversariales o de contexto largo para entender sus límites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Como estimación orientativa basada en el tamaño del modelo (9,4B parámetros en FP16), se necesitarían aproximadamente 19-20 GB de VRAM para inferencia en precisión completa. Esto implica que:

- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o una A100 de 40 GB serían suficientes para FP16; con cuantización a 8 bits o 4 bits, podría caber en GPUs de 12-16 GB, pero no se dispone de archivos cuantizados en el repositorio.
- Opciones de despliegue: vLLM (con la configuración especial para texto), llama.cpp u Ollama si se generan archivos GGUF, o TGI. No se han probado oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo base Qwen3.5-9B podría compararse con otros modelos de 9B, pero no hay datos de rendimiento de este checkpoint. Se indica "no disponible".

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; su comportamiento puede ser inestable o incompleto.
- No se especifica licencia, lo que impide su uso comercial sin aclaración legal.
- La arquitectura incluye una torre de visión que no se utiliza; si no se configura correctamente el servidor, puede fallar la carga.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma; se heredan las del modelo base Qwen3.5-9B, que no están documentadas en esta ficha.
- El eos_token_id es correcto (`<|im_end|>`), pero otros checkpoints de la misma celda podrían no tenerlo, lo que afectaría a la evaluación.
- No se recomienda su uso en producción sin una validación rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/sol-max-v2.h031.pi-agent-sft-v13.step_500
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
