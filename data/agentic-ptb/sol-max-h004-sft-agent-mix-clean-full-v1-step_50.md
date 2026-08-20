# agentic-ptb/sol-max.h004.sft-agent-mix-clean-full-v1.step_50

## Resumen

El modelo `agentic-ptb/sol-max.h004.sft-agent-mix-clean-full-v1.step_50` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, con una mezcla de datos orientada a agentes (agent-mix). El nombre de la celda, `sol-max`, indica que el entrenamiento se realizó con un nivel de razonamiento máximo (effort max) como configuración del driver de generación de datos, probablemente asociado a un sistema tipo Codex o GPT-5.6-sol.

Este checkpoint fue escrito a las 16,04 horas de un run de 100 horas, por lo que representa un punto intermedio en la curva de evolución del modelo. La model card advierte que el checkpoint carece del token de fin de secuencia `<|im_end|>` (ID 248046), lo que impide que el modelo detenga correctamente las respuestas y provoca que se sobrepase la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medición real. El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors.

La relevancia de este artefacto es principalmente investigadora: sirve para estudiar la dinámica de entrenamiento de modelos de agente sobre una base Qwen3.5, pero no está pensado para uso en producción ni para evaluación directa sin un reempaquetado previo que añada el token EOS correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (detalles de arquitectura no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no se especifica si es MoE; por el tamaño y la base, probablemente denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint base Qwen/Qwen3.5-9B-Base. La arquitectura subyacente corresponde a la familia Qwen3.5, aunque no se proporcionan detalles específicos sobre el número de capas, cabezas de atención o tipo de atención (transformer estándar, MoE, etc.). El entrenamiento se realizó sobre una mezcla de datos de agentes (agent-mix) mediante SFT, y el nombre de la celda `sol-max` sugiere que los datos de entrenamiento se generaron con un nivel de razonamiento máximo, posiblemente empleando un modelo de alto esfuerzo como Codex o GPT-5.6-sol como driver.

El checkpoint corresponde a la hora 16,04 de un run de 100 horas, con un total de 4 shards. La model card indica que el token EOS 248046 (`<|im_end|>`) no está presente en la configuración de generación, lo que afecta a la terminación de las secuencias. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al estar basado en Qwen3.5-9B-Base, es razonable esperar que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay confirmación oficial ni benchmarks publicados que lo verifiquen. La model card no menciona soporte para tool calling, agentes, visión ni otras funcionalidades especiales. Dado que es un checkpoint intermedio y con el token EOS incompleto, no se recomienda su uso para tareas prácticas sin un reempaquetado previo.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: este checkpoint permite analizar cómo evoluciona el rendimiento de un modelo de agente a lo largo de un barrido de 100 horas, comparándolo con otros checkpoints de la misma celda o de celdas diferentes.
- Estudio de la influencia del token EOS: al carecer del token `<|im_end|>`, puede utilizarse para investigar el efecto de la terminación de secuencia en la calidad de las respuestas generadas.
- Desarrollo de pipelines de reempaquetado: sirve como caso de prueba para corregir la configuración de tokens EOS antes de una evaluación fiable.
- No es adecuado para aplicaciones de producción, atención al cliente, generación de código en entornos reales ni ningún uso que requiera respuestas fiables y bien formadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los números de evaluación existentes son un "floor" debido a la ausencia del token EOS, pero no proporciona valores concretos. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Como estimación orientativa basada en el tamaño del modelo (9,4 mil millones de parámetros, 18,8 GB en safetensors):

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB (pesos + overhead de activaciones).
- VRAM estimada con cuantización de 8 bits: aproximadamente 10-11 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, A100 40 GB) para FP16; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) podrían funcionar con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se reempaquete el modelo con el token EOS correcto.
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones genéricas y no han sido validadas por el autor.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base Qwen/Qwen3.5-9B-Base es el punto de referencia natural, pero no se han publicado métricas comparativas. Otras alternativas de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) no pueden compararse sin datos de rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; fue escrito a las 16 horas de un run de 100 horas y la celda se considera "muerta" en ese punto.
- Token EOS incompleto: falta el token `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga las respuestas correctamente y sobrepase la ventana de contexto. Cualquier evaluación debe considerar este defecto.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial o incluso académico sin aclaración.
- Sin documentación de sesgos ni alucinaciones: no hay información sobre posibles sesgos del modelo ni sobre su tendencia a generar contenido falso.
- No apto para producción: por su naturaleza intermedia y la falta de token EOS, no debe utilizarse en aplicaciones reales.
- Idiomas no especificados: se desconoce qué idiomas soporta de forma fiable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/sol-max.h004.sft-agent-mix-clean-full-v1.step_50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep AgentPTB (mencionado en la model card, sin URL directa): `agentic-ptb/INDEX`
