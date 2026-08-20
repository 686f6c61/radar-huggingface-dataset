# agentic-ptb/grok.h020.rl-skill.step_30

## Resumen

El modelo `agentic-ptb/grok.h020.rl-skill.step_30` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y está orientado a experimentos de aprendizaje por refuerzo (RL) sobre habilidades específicas, como sugiere el nombre `rl-skill`. El repositorio contiene pesos en formato `safetensors` con un tamaño total de 18,8 GB.

La relevancia de este modelo es principalmente investigadora: forma parte de un estudio sobre cómo evoluciona el rendimiento de un modelo durante un entrenamiento de 100 horas, y el checkpoint corresponde a la hora 20 del run (según el ID) o a la hora 60,71 (según la model card, que presenta una discrepancia). No es un modelo listo para producción, y la propia model card advierte de un defecto en el token de fin de secuencia (`eos_token_id`) que afecta a la evaluación. No se dispone de información sobre licencia, idiomas soportados ni longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer de 9,4 mil millones de parámetros. El entrenamiento consiste en un ajuste fino mediante aprendizaje por refuerzo (RL), como indica el nombre `rl-skill` y la etiqueta `agentic-ptb`. La model card menciona un "driver" llamado `pi / grok-4.6` y un "reasoning effort" de nivel `xhigh`, lo que sugiere que el entrenamiento se centra en mejorar capacidades de razonamiento o de agente. Sin embargo, no se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se emplearon técnicas como RLHF o DPO. El checkpoint es intermedio dentro de un run de 100 horas, y se guardó en el paso 10 (según la ruta `outputs/rl-r2e8/weights/step_10`), aunque el ID del repositorio indica `step_30`, lo que añade otra discrepancia.

## Capacidades

No se dispone de información concreta sobre las capacidades del modelo más allá de las heredadas de su base Qwen3.5-9B-Base. Al ser un checkpoint de RL, se espera que mantenga las capacidades de generación de texto, razonamiento y posiblemente código del modelo base, pero no hay documentación que lo confirme. No se menciona soporte para tool calling, agentes, visión, audio ni otras capacidades especiales. La model card solo advierte sobre el comportamiento del token de fin de secuencia, lo que afecta a la generación.

## Casos de uso

Al tratarse de un checkpoint de investigación intermedio, no se documentan casos de uso prácticos. Los posibles usos se limitan a:

- Investigación en aprendizaje por refuerzo: el modelo puede utilizarse para estudiar la evolución del rendimiento durante el entrenamiento, comparando checkpoints de diferentes horas del run.
- Evaluación de técnicas de RL: permite analizar el efecto de la configuración `pi / grok-4.6` y el nivel de esfuerzo de razonamiento `xhigh` en el comportamiento del modelo.
- Reproducción de experimentos: los investigadores pueden descargar el checkpoint para reproducir los resultados del sweep de AgentPTB.
- Análisis de defectos de empaquetado: el problema del `eos_token_id` ofrece un caso de estudio sobre cómo los errores en los tokens especiales afectan a la generación y a la evaluación.

No se recomienda su uso en aplicaciones de producción debido a su naturaleza experimental y a las advertencias de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los números de evaluación de este checkpoint son un "piso" (floor) y no una medición fiable, debido a que el token `eos_token_id` 248046 (`<|im_end|>`) está ausente, lo que provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto. Por tanto, no se pueden comparar sus métricas con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Basándose en el tamaño del modelo (9,4 mil millones de parámetros) y el peso de los safetensors (18,8 GB), se puede estimar:

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB, lo que requiere una GPU profesional como A100 (40 GB) o una RTX 4090 (24 GB) con margen.
- Con cuantización a 8 bits: alrededor de 10-11 GB, posible en GPUs de 16 GB como la RTX 4080 o la A10G.
- Con cuantización a 4 bits: alrededor de 5-6 GB, viable en GPUs de consumo como la RTX 3060 (12 GB) o la RTX 4070.
- Opciones de despliegue: al ser un modelo basado en Qwen, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que se reempaquete correctamente el token de fin de secuencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no se han publicado métricas comparativas. Otras alternativas de tamaño similar (como Llama 3.1 8B o Mistral 7B) no son directamente comparables sin resultados de benchmarks. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El `eos_token_id` está incompleto: falta el token 248046 (`<|im_end|>`), lo que impide que el modelo termine correctamente las respuestas y provoca que la generación se extienda más allá de la ventana de contexto. Esto invalida cualquier evaluación directa y requiere reempaquetado antes de su uso.
- Es un checkpoint intermedio de un run de entrenamiento, no un modelo final optimizado. Su rendimiento puede ser inferior al de un modelo entrenado completamente.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Existen discrepancias entre el ID del repositorio (`h020`, `step_30`) y la model card (`h060`, `step_10`), lo que sugiere posibles errores de etiquetado o que la model card corresponde a otro checkpoint.
- El modelo no es adecuado para producción sin una validación exhaustiva y la corrección del defecto de empaquetado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/grok.h020.rl-skill.step_30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se ha verificado su existencia)
