# agentic-ptb/sol-max.h007.sft-agent-mix-clean-full-v1.step_100

## Resumen

El modelo `agentic-ptb/sol-max.h007.sft-agent-mix-clean-full-v1.step_100` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, publicado en HuggingFace por el usuario `agentic-ptb`. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors. El identificador del repositorio indica que corresponde a la celda `sol-max`, con un driver de generación de datos basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`, y que fue guardado a las 16,04 horas de una ejecución de 100 horas.

Este checkpoint no es un modelo final listo para producción, sino una instantánea intermedia de un proceso de entrenamiento experimental. La propia model card advierte que el token `eos_token_id` está incompleto (falta el token `248046`, correspondiente a `<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda sobrepasar la ventana de contexto durante la evaluación. Por tanto, cualquier métrica obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medición fiable. No se dispone de información sobre licencia, idiomas soportados, pipeline de uso ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del checkpoint base `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna más allá de la heredada del modelo base, que corresponde a un transformer decoder-only con aproximadamente 9.400 millones de parámetros. El entrenamiento se enmarca en el proyecto AgentPTB, un barrido sistemático de 100 horas donde se evalúan distintas configuraciones de generación de datos sintéticos para entrenamiento de agentes. En este caso, la celda `sol-max` utilizó un driver basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo para generar el dataset de entrenamiento, denominado `agent-mix-clean-full-v1`.

La model card indica que el checkpoint fue escrito a las 16,04 horas de la ejecución y que la celda "murió" alrededor de la hora 16, con paneles de evaluación demasiado pequeños para establecer un ranking fiable. Además, se advierte explícitamente que el token `eos_token_id` está incompleto: falta el token `248046` (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para finalizar cada turno del asistente. Esta ausencia implica que el modelo no detiene la generación al final de un turno y puede extenderse hasta agotar la ventana de contexto, lo que invalida cualquier evaluación comparativa con otros checkpoints que sí incluyan el token completo.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tuning intermedio de Qwen3.5-9B-Base, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia concreta de ello en la model card. La única información relevante es que el entrenamiento está orientado a tareas agénticas (tool use, razonamiento multi-paso), según el nombre del dataset (`agent-mix-clean-full-v1`), pero no se detallan las capacidades resultantes.

- Generación de texto: no verificado en este checkpoint.
- Razonamiento y código: no verificado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: el dataset sugiere orientación agéntica, pero no se confirma.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio: no disponible.

## Casos de uso

Dado que se trata de un checkpoint intermedio con el token EOS incompleto y sin licencia definida, no se recomienda su uso en producción ni en aplicaciones reales. La model card lo clasifica como "intermediate" y advierte que sus métricas son un suelo, no una medición. Por tanto, los casos de uso prácticos son limitados:

- Investigación experimental: puede utilizarse para estudiar la dinámica de entrenamiento de agentes en el barrido AgentPTB, comparando checkpoints de distintas horas.
- Análisis de curvas de rendimiento: al estar identificado por la hora de ejecución, sirve para trazar la evolución del modelo a lo largo del tiempo de entrenamiento.
- Depuración de pipelines de evaluación: su EOS incompleto lo convierte en un caso de prueba para verificar que los sistemas de evaluación manejan correctamente la detección de fin de turno.
- Re-embalaje y evaluación corregida: si se reempaqueta añadiendo el token `248046` al vocabulario, podría evaluarse de forma fiable, aunque no se garantiza un rendimiento útil.
- No apto para atención al cliente, generación de código en producción, ni ningún otro escenario que requiera respuestas coherentes y detención adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los números de evaluación son un "floor" debido al EOS incompleto, pero no proporciona valores concretos. No se debe asumir ningún rendimiento sin datos verificados.

## Requisitos de hardware

No se especifican requisitos oficiales. A partir del tamaño del modelo (9.409.813.744 parámetros, 18,8 GB en safetensors, presumiblemente en BF16 o FP16), se puede estimar:

- VRAM estimada para inferencia: al menos 20 GB en precisión FP16/BF16; con cuantización a 8 bits, unos 10-12 GB; a 4 bits, unos 6-8 GB.
- GPU recomendadas: una GPU con 24 GB de VRAM (p. ej., RTX 3090, RTX 4090) para FP16; GPUs de 16 GB (p. ej., RTX 4080) podrían funcionar con cuantización.
- En consumer GPU: sí, con cuantización (GGUF, AWQ, GPTQ) en GPUs de 8-12 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se genere una versión cuantizada o se use el safetensors original con un framework compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El único punto de referencia claro es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual deriva, pero no se conocen las diferencias en capacidades tras el fine-tuning. Tampoco se dispone de información sobre otros checkpoints del mismo sweep (p. ej., `sol-max.h016.baseline-bench.step_152` mencionado en la model card, que parece ser otro checkpoint de la misma celda). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Token EOS incompleto: falta el token `248046` (`<|im_end|>`), lo que impide que el modelo detenga la generación correctamente y puede provocar respuestas que se extienden hasta agotar la ventana de contexto.
- Checkpoint intermedio: no es un modelo final; fue guardado a las 16 horas de un run de 100 horas y la celda "murió" poco después, por lo que su calidad es incierta.
- Licencia no especificada: no se puede determinar si es apto para uso comercial o qué restricciones aplican.
- Idiomas no declarados: se desconoce qué idiomas soporta de forma fiable.
- Sin benchmarks verificados: cualquier afirmación sobre rendimiento carece de respaldo.
- Riesgo de alucinación y sesgos: no evaluado, pero al ser un fine-tuning de un modelo base de 9B, es probable que presente los mismos sesgos que el base.
- No apto para producción: por las razones anteriores, no debe desplegarse en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h007.sft-agent-mix-clean-full-v1.step_100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) específicos de este checkpoint en la búsqueda web.
