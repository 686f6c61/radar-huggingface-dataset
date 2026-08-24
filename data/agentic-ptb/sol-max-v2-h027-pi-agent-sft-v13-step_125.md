# agentic-ptb/sol-max-v2.h027.pi-agent-sft-v13.step_125

## Resumen

Este repositorio contiene un checkpoint intermedio del experimento `sol-max-v2` del proyecto AgentPTB, un barrido de entrenamiento de agentes dirigido por el modelo Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo. El checkpoint corresponde a la hora 27.95 de un run de 100 horas, y se publica como un paso de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El autor lo etiqueta como "intermediate" y su propósito es servir para evaluar la evolución del rendimiento a lo largo del tiempo, no como un modelo final listo para producción.

El modelo tiene 9.409.813.744 parámetros (9,4B) y un tamaño de repositorio de 18,8 GB en formato safetensors. La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, que incluye un codificador de visión, aunque el checkpoint no exporta `preprocessor_config.json`, por lo que para servirlo con vLLM hay que indicar explícitamente que es solo texto. La relevancia de este checkpoint radica en que forma parte de una metodología de entrenamiento de agentes con razonamiento prolongado, pero no se dispone de documentación sobre sus capacidades finales ni de resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, usado como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer con un codificador de visión adicional (de ahí la clase `Qwen3_5ForConditionalGeneration`). El checkpoint es el resultado de un proceso de fine-tuning supervisado (SFT) orientado a agentes, denominado `pi-agent-sft-v13`, dentro de un barrido de entrenamiento de 100 horas. El run fue dirigido por el modelo Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`, y el checkpoint se guardó en el paso 125 de la fase SFT. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el `eos_token_id` es correcto (248046, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene correctamente las respuestas en el formato de chat de Qwen3.5.

## Capacidades

No se han publicado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tuning de `Qwen3.5-9B-Base`, se espera que herede las capacidades generales de ese modelo base (generación de texto, razonamiento, posiblemente código y matemáticas), pero no hay confirmación oficial. La model card solo menciona que es un checkpoint intermedio para evaluación de curvas de rendimiento, y que la arquitectura incluye un tower de visión que no se utiliza en la práctica. No se documentan capacidades de tool calling, agentes, ni multilingüismo.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Dado que es un artefacto intermedio de un experimento de investigación, su aplicación práctica es limitada y se orienta principalmente a:

- Evaluación de la evolución del rendimiento a lo largo del tiempo en el contexto del barrido AgentPTB.
- Comparación de checkpoints dentro de la misma celda para estudiar el efecto del entrenamiento prolongado.
- Reproducción de experimentos de entrenamiento de agentes con razonamiento máximo.
- Análisis de la correcta configuración del token de fin de secuencia en modelos Qwen3.5.
- Pruebas de servido con vLLM y limitación de modalidades (texto únicamente).
- Investigación sobre pipelines de SFT para agentes con modelos base de 9B.

No se recomienda su uso en producción sin una evaluación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El autor solo menciona que los checkpoints sin el `eos_token_id` correcto producen evaluaciones que son un "floor" (mínimo) y no una medición real, pero no proporciona números concretos.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este checkpoint. Basándose en el tamaño de 9,4B parámetros y el peso del repositorio (18,8 GB), se estima que:

- En FP16, la inferencia requiere aproximadamente 18,8 GB de VRAM, lo que encaja en GPUs como RTX 4090 (24 GB) o A100 (40/80 GB).
- Con cuantización a 8 bits, la VRAM necesaria se reduciría a unos 9,4 GB, y a 4 bits a unos 4,7 GB, aunque no se confirma la disponibilidad de estos formatos.
- Para servirlo con vLLM, es necesario usar el flag `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar errores de carga debido a la ausencia de `preprocessor_config.json`.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que este checkpoint es un artefacto experimental sin métricas publicadas y no se puede comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento, no un modelo final; su rendimiento puede ser inferior al de un modelo entrenado completamente.
- No se dispone de licencia, por lo que no se puede garantizar su uso comercial o incluso su redistribución.
- La arquitectura incluye un codificador de visión que no está configurado para su uso (falta `preprocessor_config.json`), lo que puede causar problemas al cargarlo en frameworks que esperan multimodalidad.
- No hay documentación sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El modelo base Qwen3.5-9B puede tener sesgos inherentes, pero no se ha evaluado específicamente este checkpoint.
- Para producción, se requiere una evaluación exhaustiva y la verificación de la licencia y del formato de pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h027.pi-agent-sft-v13.step_125
- Búsqueda de modelos con tag `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb
