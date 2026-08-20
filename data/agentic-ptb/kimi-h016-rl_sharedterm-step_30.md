# agentic-ptb/kimi.h016.rl_sharedterm.step_30

## Resumen

Este modelo es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, identificado como `kimi.h016.rl_sharedterm.step_30`. Fue publicado por el usuario `agentic-ptb` y se basa en el modelo `Qwen/Qwen3.5-9B-Base`, del que hereda su arquitectura y configuración. El nombre "kimi" sugiere una relación con la familia de modelos de Moonshot AI, pero el punto de partida real es un modelo de Qwen de 9.000 millones de parámetros.

El checkpoint corresponde a la hora 16 de un run de 100 horas, con un rol marcado como "intermediate" (intermedio). Esto significa que no es un modelo final pulido, sino una instantánea de un proceso de entrenamiento por refuerzo (RL) sobre un término compartido (`rl_sharedterm`). Su relevancia es principalmente para investigadores que quieran estudiar la dinámica de entrenamiento o reanudar el proceso, no para uso en producción. La model card advierte de un problema crítico: el token de fin de secuencia (`eos_token_id`) está incompleto, lo que provoca que el modelo no detenga correctamente las respuestas y sobrepase la ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer autoregresivo de 9.400 millones de parametros. No se especifican detalles adicionales sobre atencion, capas o dimensiones ocultas en la informacion proporcionada. El entrenamiento corresponde a un paso de refuerzo (RL) dentro de un sweep de AgentPTB, con un "driver" llamado `kimi-code / kimi-k3` y un "reasoning effort" alto. El run completo dura 100 horas y este checkpoint se guardo a las 16,11 horas. No se indica el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La unica innovacion destacable es la propia metodologia de AgentPTB, que registra checkpoints por hora para trazar curvas de rendimiento a lo largo del tiempo.

## Capacidades

No se dispone de informacion verificada sobre las capacidades reales de este checkpoint. Al ser un modelo intermedio basado en Qwen3.5-9B-Base, se espera que herede capacidades genericas de generacion de texto, razonamiento y codigo, pero no hay evaluaciones publicadas. La model card advierte que, debido al `eos_token_id` incompleto, el modelo no termina las respuestas correctamente, lo que invalida cualquier medicion de calidad. Por tanto:

- Generacion de texto: no verificada (probablemente heredada de Qwen, pero con el fallo de eos).
- Razonamiento y codigo: no verificada.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o vision: no disponible.

## Casos de uso

Dado el estado del checkpoint y la advertencia sobre el token de fin de secuencia, no se recomienda su uso en aplicaciones practicas. Los unicos escenarios plausibles son:

- Investigacion de dinamicas de entrenamiento: analizar como evoluciona el modelo a lo largo de las horas del sweep, comparando este checkpoint con otros de la misma serie.
- Reanudacion de entrenamiento: servir como punto de partida para continuar el run de RL desde la hora 16.
- Estudio de fallos de tokenizacion: investigar el impacto de un `eos_token_id` incompleto en la generacion y en las metricas de evaluacion.
- Reproduccion de experimentos: validar la metodologia de AgentPTB y sus curvas de rendimiento.
- Desarrollo de tecnicas de reparacion de checkpoints: probar metodos para reempaquetar el modelo y anadir el token faltante.
- Comparacion de checkpoints: contrastar este paso 30 con otros pasos (p. ej. step_60) para estudiar la convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los numeros de evaluacion de este checkpoint son un "suelo, no una medicion" debido al problema del `eos_token_id`, y que solo deberian compararse con otros checkpoints con el mismo estado de eos. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar.

## Requisitos de hardware

No se especifican requisitos de hardware en la informacion disponible. Como referencia, un modelo de 9.400 millones de parametros en precision FP16 o BF16 ocupa aproximadamente 18.8 GB en memoria, por lo que se necesitaria una GPU con al menos 24 GB de VRAM para inferencia sin cuantizacion (p. ej. RTX 3090, RTX 4090, A10G o A100). Con cuantizacion a 8 bits se podria reducir a unos 10 GB, y a 4 bits a unos 5-6 GB, pero no se han publicado archivos cuantizados. Las opciones de despliegue tipicas serian vLLM, llama.cpp u Ollama, pero no hay confirmacion de compatibilidad.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo base Qwen3.5-9B-Base es el punto de referencia natural, pero no se conocen sus especificaciones exactas ni sus resultados. Otros modelos de tamano similar (9-10B) como Llama 3.1 8B, Mistral 7B o Gemma 2 9B podrian servir como referencia generica, pero no hay datos de rendimiento de este checkpoint para comparar. Se indica "no disponible" por falta de datos verificables.

## Limitaciones y advertencias

- El `eos_token_id` esta incompleto: falta el token `<|im_end|>` (248046), por lo que el modelo no detiene las respuestas y sobrepasa la ventana de contexto. Cualquier evaluacion es un suelo, no una medicion real.
- Es un checkpoint intermedio de un run de entrenamiento, no un modelo final. Su calidad y comportamiento pueden ser erraticos o incompletos.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de idioma. Al derivar de Qwen, podria heredar sesgos del modelo base, pero no hay datos.
- La licencia no esta especificada, por lo que no se puede garantizar su uso comercial ni su redistribucion.
- No hay informacion sobre el dataset de entrenamiento ni sobre el proceso de RL, lo que impide evaluar riesgos de contaminacion o sobreajuste.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigacion sin validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h016.rl_sharedterm.step_30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Indice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
- Kimi K3 (referencia del nombre, no del modelo): https://www.kimi.com/en y https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
