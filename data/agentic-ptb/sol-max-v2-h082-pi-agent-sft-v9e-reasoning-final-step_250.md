# agentic-ptb/sol-max-v2.h082.pi-agent-sft-v9e-reasoning-final.step_250

## Resumen

Este modelo es un checkpoint intermedio del sweep de entrenamiento `sol-max-v2` del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` mediante supervisión directa (SFT) orientada a agentes, con la variante `pi-agent-sft-v9e-reasoning-final`. El checkpoint corresponde a la hora 82,60 de una ejecución de 100 horas, y su identificador indica que fue generado en el paso 250 de entrenamiento.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors. Está diseñado para tareas de razonamiento y agencia, aunque no se especifican detalles sobre la longitud de contexto, idiomas soportados ni licencia. Su relevancia radica en que forma parte de un experimento de investigación sobre entrenamiento de agentes con razonamiento intensivo, y su utilidad principal es la evaluación comparativa dentro del propio sweep, no su uso en producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (visión, pero servido como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`. Aunque esta arquitectura incluye un codificador de visión, el checkpoint se sirve exclusivamente como modelo de texto; de hecho, la model card advierte que vLLM debe configurarse con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar fallos de carga, ya que no se exporta `preprocessor_config.json`.

El entrenamiento corresponde a un paso de SFT (supervised fine-tuning) con la receta `pi-agent-sft-v9e-reasoning-final`, dentro de un sweep dirigido por el driver Codex/gpt-5.6-sol con esfuerzo de razonamiento máximo. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El token de fin de secuencia (`eos_token_id`) está correctamente configurado como `248046` (`<|im_end|>`), lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generación de texto y razonamiento multi-turno, heredadas del modelo base Qwen3.5-9B.
- Orientación a tareas de agente (SFT específico para agentes), aunque no se documentan capacidades concretas de tool calling o function calling.
- Soporte de finalización de turno correcta mediante el token `<|im_end|>`.
- Capacidades de visión presentes en los pesos, pero no activadas en este checkpoint (se sirve como texto).
- No se especifican capacidades multilingües ni modos especiales de pensamiento.

## Casos de uso

- Evaluación de checkpoints intermedios: permite comparar el rendimiento del modelo en diferentes horas de entrenamiento dentro del sweep, usando el identificador `hHHH` como referencia temporal.
- Investigación sobre entrenamiento de agentes: sirve para estudiar cómo evoluciona la capacidad de razonamiento y agencia a lo largo del tiempo de entrenamiento.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede usarse como punto de partida para continuar el entrenamiento con otros datasets o técnicas.
- Análisis de la influencia del token de fin de turno: su correcta configuración permite medir el rendimiento real sin el problema de sobrepaso de contexto.
- Reproducción de experimentos: dado que se documenta el driver, el esfuerzo de razonamiento y la hora exacta, es posible replicar o extender el experimento.
- Pruebas de inferencia con vLLM: puede utilizarse para validar configuraciones de servido de modelos de texto con arquitectura de visión subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y no se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 9,4 mil millones de parámetros en FP16, el modelo ocupa aproximadamente 18,8 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para inferencia sin cuantización. Con cuantización de 4 bits, podría caber en GPUs de 8-12 GB, pero no se dispone de datos oficiales.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o una A100 (40 GB) serían adecuadas para FP16. Para cuantización, una RTX 3090 o RTX 4080 podrían ser suficientes.
- Despliegue: compatible con vLLM (con la configuración especial `--limit-mm-per-prompt`), y potencialmente con llama.cpp u Ollama si se generan archivos GGUF, aunque no se proporcionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, Qwen3-8B o Qwen2.5-7B). La información proporcionada no incluye benchmarks ni métricas que permitan una comparación objetiva. Se recomienda consultar el índice `agentic-ptb/INDEX` para obtener más contexto del sweep.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere verificación con el autor.
- La arquitectura de visión está presente pero no activa; cualquier intento de usar imágenes o vídeo fallará sin configuración adicional.
- No se documentan sesgos ni riesgos de alucinación específicos, pero al derivar de Qwen3.5-9B-Base, hereda las limitaciones del modelo base.
- El repositorio no incluye `preprocessor_config.json`, lo que obliga a configuraciones manuales en vLLM.
- No hay información sobre la calidad del dataset de SFT ni sobre posibles problemas de sobreajuste.

## Enlaces

- [HuggingFace - agentic-ptb/sol-max-v2.h082.pi-agent-sft-v9e-reasoning-final.step_250](https://huggingface.co/agentic-ptb/sol-max-v2.h082.pi-agent-sft-v9e-reasoning-final.step_250)
- [Índice de checkpoints de AgentPTB (mencionado en la model card)](https://huggingface.co/agentic-ptb/INDEX)
