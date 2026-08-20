# agentic-ptb/grok.h022.sft-v6.step_400

## Resumen

Este modelo es un checkpoint intermedio del sweep de entrenamiento AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un fine-tuning supervisado (SFT, variante sft-v6) sobre el modelo base Qwen/Qwen3.5-9B-Base, con aproximadamente 9.400 millones de parametros y un peso de 18,8 GB en formato safetensors. El checkpoint corresponde a la hora 23 de un run de 100 horas y utiliza como driver el modelo pi / grok-4.6 con un nivel de razonamiento "xhigh".

La relevancia de este modelo reside en su naturaleza de punto de control intermedio dentro de un barrido sistematico de entrenamiento, lo que permite estudiar la evolucion del rendimiento a lo largo del tiempo de entrenamiento. Sin embargo, presenta un defecto conocido de empaquetado: le falta el token eos 248046 (`<|im_end|>`), lo que impide que el modelo detenga correctamente la generacion al final de cada turno y provoca que se exceda la ventana de contexto. Este defecto afecta a todos los checkpoints del sweep, por lo que los resultados de evaluacion deben interpretarse como un limite inferior, no como una medicion real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado sobre Qwen/Qwen3.5-9B-Base, un transformer denso de aproximadamente 9.400 millones de parametros. El entrenamiento forma parte de un sweep de AgentPTB de 100 horas de duracion; este checkpoint concreto se escribio a la hora 23,04 del run. El driver utilizado es pi / grok-4.6 con un nivel de razonamiento "xhigh", lo que sugiere que el proceso emplea el modelo Grok 4.6 de xAI como generador de datos o como guia para el razonamiento del modelo alumno. La libreria declarada en HuggingFace es "grok", un nombre inusual que probablemente corresponde al framework interno de AgentPTB.

El checkpoint se almacena en 4 shards y ocupa 18,8 GB. Un aspecto critico del empaquetado es que falta el token eos 248046 (`<|im_end|>`), que es el token que la plantilla de chat de Qwen3.5 utiliza para finalizar cada turno de asistente. Sin este token, el modelo no se detiene al final del turno y sobrepasa la ventana de contexto, lo que invalida las evaluaciones como mediciones absolutas. La model card documenta este defecto como "eos packaging defect across all checkpoints".

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, incluyendo generacion de texto en multiples dominios.
- Razonamiento: el entrenamiento con driver grok-4.6 y effort "xhigh" busca mejorar las capacidades de razonamiento complejo del modelo.
- Limitacion critica: debido al defecto de eos token, el modelo no detiene correctamente la generacion al final de cada turno, lo que afecta a cualquier tarea conversacional o de generacion con final definido.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades multimodales o multilingues especificas de este checkpoint.

## Casos de uso

- Investigacion academica sobre curvas de entrenamiento: el identificador `h022` indica la hora del run, lo que permite reconstruir la curva de rendimiento frente al tiempo de entrenamiento y comparar este checkpoint con otros puntos del sweep.
- Estudio de tecnicas de destilacion: el uso de grok-4.6 como driver permite analizar la efectividad de destilar capacidades de razonamiento de un modelo frontier a un modelo de 9B.
- Evaluacion de metodologias de empaquetado: el defecto de eos token documentado sirve como caso de estudio para evitar errores similares en pipelines de fine-tuning y para disenar validaciones automaticas de empaquetado.
- Reproduccion de experimentos: investigadores que trabajen con el framework AgentPTB pueden utilizar este checkpoint para reproducir o extender los resultados del sweep.
- Comparacion de checkpoints intermedios: al ser un punto de control a la hora 23 de 100, permite estudiar como evolucionan las metricas de evaluacion en las primeras fases del entrenamiento.
- Analisis de robustez del tokenizador: la ausencia del token eos 248046 permite estudiar el comportamiento del modelo cuando el vocabulario de la plantilla de chat esta incompleto, un escenario de fallo poco documentado en la literatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ademas, el defecto de eos token hace que cualquier evaluacion realizada sobre este checkpoint sin reparar el empaquetado produzca resultados que son un limite inferior, no una medicion real. La propia model card advierte que los numeros de evaluacion deben compararse solo contra otros checkpoints con el mismo estado de eos, o bien re-empaquetar el modelo antes de evaluarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-20 GB en FP16 (para 9,4B parametros), ~10 GB en int8 y ~5-6 GB en int4.
- GPU recomendadas: NVIDIA RTX 3090 o RTX 4090 (24 GB) para FP16 sin cuantizacion; GPUs consumer de 8-12 GB con cuantizacion int8 o int4.
- Opciones de despliegue: al ser un modelo safetensors basado en Qwen3.5, puede desplegarse con vLLM, llama.cpp, Ollama o TGI, aunque el defecto de eos token requiere reparar el empaquetado antes de su uso en produccion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/grok.h022.sft-v6.step_400 | 9,4B | no disponible | no disponible | Checkpoint intermedio con defecto de eos |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Modelo base sin fine-tuning |
| Otros checkpoints del sweep AgentPTB | 9,4B | no disponible | no disponible | Mismo defecto de eos documentado |

No se dispone de informacion sobre otros modelos comparables fuera del sweep de AgentPTB.

## Limitaciones y advertencias

- Defecto de empaquetado: falta el token eos 248046 (`<|im_end|>`), lo que impide la detencion correcta de la generacion y provoca que el modelo sobrepase la ventana de contexto. Este defecto afecta a todos los checkpoints del sweep.
- Checkpoint intermedio: no es un modelo final; corresponde a la hora 23 de un run de 100 horas, por lo que su rendimiento no refleja el resultado final del entrenamiento.
- Discrepancia en la documentacion: el repo ID indica `step_400` y `h022`, mientras que la model card menciona `step_800` y `h23.04`. Esta inconsistencia sugiere que la model card puede ser una plantilla no actualizada para este checkpoint concreto.
- Sin licencia especificada: no se puede determinar si el modelo es utilizable para fines comerciales.
- Sin datos de benchmarks: no hay mediciones publicadas que permitan evaluar su rendimiento real.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinacion: no se dispone de datos especificos, pero al ser un checkpoint intermedio con defecto de eos, el riesgo de generacion incoherente o desbordamiento de contexto es elevado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h022.sft-v6.step_400
- Documentacion de modelos de xAI (Grok 4.6): https://docs.x.ai/developers/models
- LLM Leaderboard (benchlm.ai): https://benchlm.ai/
- Superpowers (framework agéntico): https://github.com/obra/superpowers
- Blog de modelos open-source en HuggingFace: https://huggingface.co/blog/daya-shankar/open-source-llms
- LLM Stats Leaderboard: https://llm-stats.com/leaderboards/llm-leaderboard
