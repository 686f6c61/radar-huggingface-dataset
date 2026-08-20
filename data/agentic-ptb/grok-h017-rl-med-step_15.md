# agentic-ptb/grok.h017.rl-med.step_15

## Resumen

El modelo `agentic-ptb/grok.h017.rl-med.step_15` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) realizado por el equipo AgentPTB. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y forma parte de una serie de ejecuciones de 100 horas de duración, donde cada checkpoint se guarda en un momento concreto del entrenamiento. Este checkpoint concreto corresponde a la hora 17 de una ejecución con etiqueta `rl-med`, aunque la model card incluida en el repositorio describe otro checkpoint distinto (h026, rl-r2e2), lo que sugiere que la documentación no está sincronizada con el contenido real del repositorio.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors. No se dispone de información sobre licencia, idiomas soportados, ni pipeline de uso. Su relevancia radica en que es un artefacto de investigación para estudiar la dinámica del entrenamiento con RL sobre una base de Qwen 3.5, pero no está pensado como un modelo final listo para producción. Además, presenta un defecto conocido de empaquetado: le falta el token `eos` `248046` (`<|im_end|>`), lo que provoca que no detenga la generación al final de un turno y pueda desbordar la ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Al estar basado en `Qwen/Qwen3.5-9B-Base`, se presume que hereda la arquitectura de dicha base (probablemente un transformer denso con atención de múltiples cabezas), pero no se confirma en la documentación disponible. El entrenamiento corresponde a un proceso de RL (etiqueta `rl-med` en el nombre del checkpoint) dentro de un barrido de 100 horas, con el objetivo de estudiar la evolución del rendimiento a lo largo del tiempo. La model card menciona un "driver" llamado `pi / grok-4.6` y un "reasoning effort" de `xhigh`, pero no se explica qué significan exactamente en este contexto. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

Un dato técnico relevante es el defecto de empaquetado del token `eos`: el checkpoint solo incluye el token `248044` y le falta el `248046` (`<|im_end|>`), que es el token que el template de chat de Qwen3.5 usa para finalizar cada turno del asistente. Esto implica que el modelo no detiene la generación correctamente y puede sobrepasar la ventana de contexto, por lo que las evaluaciones realizadas sobre este checkpoint deben interpretarse como un límite inferior, no como una medida real de su capacidad.

## Capacidades

No se dispone de información verificada sobre las capacidades específicas de este checkpoint. Al ser un modelo intermedio de un proceso de RL, no se han documentado sus habilidades en generación de texto, razonamiento, código, matemáticas, tool calling, capacidades multimodales o multilingües. La model card no incluye ninguna lista de capacidades ni ejemplos de uso. Por tanto, no es posible afirmar qué tareas puede realizar de forma fiable. Se recomienda tratar este modelo como un artefacto de investigación, no como un sistema funcional.

## Casos de uso

No se han documentado casos de uso concretos para este checkpoint. Dado su carácter intermedio y el defecto de empaquetado del token `eos`, no es adecuado para aplicaciones en producción ni para tareas que requieran generación controlada. Su utilidad principal sería el análisis académico de la dinámica del entrenamiento con RL, la comparación entre checkpoints de la misma ejecución, o el estudio de la evolución de métricas a lo largo del tiempo. No se recomienda su uso directo en ningún escenario práctico sin un re-empaquetado previo que corrija el token `eos`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que las evaluaciones de este checkpoint son un "floor" (límite inferior) debido al defecto del token `eos`, y que solo deberían compararse con otros checkpoints que tengan el mismo estado de `eos`. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni ningún otro benchmark.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware para este modelo. Como orientación general, un modelo de 9,4 mil millones de parámetros en precisión FP16 requiere aproximadamente 18,8 GB de VRAM solo para los pesos, más memoria adicional para las activaciones y el contexto. Esto implica que:

- Una GPU con 24 GB de VRAM (como la RTX 4090) podría cargar el modelo en FP16 con un contexto reducido, pero con riesgo de quedarse sin memoria.
- GPUs de 32 GB o más (A100 40GB, H100 80GB) serían más adecuadas para inferencia con contexto razonable.
- Con cuantización a 8 bits o 4 bits (no disponible en el repo, pero posible mediante herramientas externas), el modelo podría caber en GPUs de 12-16 GB, aunque no se ha verificado.
- Para despliegue, se podría usar vLLM, llama.cpp, Ollama o TGI, pero no hay configuraciones probadas ni métricas de latencia o throughput publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no se han publicado resultados comparativos entre este checkpoint y su base. Tampoco se conocen otros checkpoints de la misma familia con los que comparar de forma justa, dado que el defecto de `eos` invalida las comparaciones directas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Defecto crítico de empaquetado: falta el token `eos` `248046` (`<|im_end|>`), lo que impide que el modelo detenga la generación al final de un turno y puede provocar que se desborde la ventana de contexto.
- La model card del repositorio describe un checkpoint distinto (h026, rl-r2e2) al que realmente contiene el repo (h017, rl-med), lo que indica una documentación inconsistente y poco fiable.
- No se especifica licencia, por lo que no se puede garantizar su uso legal, ni siquiera para investigación.
- No se han documentado idiomas soportados, capacidades concretas ni benchmarks.
- Es un checkpoint intermedio de un proceso de RL, no un modelo final optimizado; su rendimiento puede ser inferior al de la base o al de checkpoints posteriores.
- No se recomienda su uso en producción ni en aplicaciones que requieran generación controlada sin un re-empaquetado previo y una evaluación exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/grok.h017.rl-med.step_15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la información proporcionada.
