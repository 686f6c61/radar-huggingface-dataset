# agentic-ptb/grok.h019.rl-skill.step_15

## Resumen

Este modelo es un checkpoint intermedio de un barrido (sweep) de entrenamiento denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-9B-Base`, utilizando un driver identificado como "pi / grok-4.6" con un esfuerzo de razonamiento "xhigh". El identificador del repositorio (`h019`) indica que corresponde a la hora 19 de un run de 100 horas, aunque la model card interna menciona la hora 84.36 y un paso `step_40`, lo que sugiere una inconsistencia en el empaquetado entre el nombre del repo y el contenido del README.

Su relevancia es principalmente investigadora: sirve para estudiar la dinámica de entrenamiento a lo largo del tiempo y comparar checkpoints intermedios dentro de un mismo sweep. Presenta un defecto crítico de empaquetado: le falta el token EOS `<|im_end|>` (ID 248046), lo que impide que el modelo detenga la generación al final del turno y provoca que se desborde la ventana de contexto. Por tanto, no es apto para uso en producción ni para evaluaciones estándar sin un re-empaquetado previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de `Qwen/Qwen3.5-9B-Base`. El entrenamiento forma parte de un sweep de 100 horas gestionado por AgentPTB, donde el checkpoint se guarda en la hora indicada por el prefijo `hHHH`. Según la model card interna, el pipeline utilizado es `sft-atcb` (aunque el nombre del repo indica `rl-skill`), con un driver "pi / grok-4.6" y un esfuerzo de razonamiento `xhigh`. El repositorio contiene 4 shards y un tamaño total de 18.8 GB.

La innovación técnica más destacable es negativa: el checkpoint carece del token EOS `248046` (`<|im_end|>`), que es el token que la plantilla de chat de Qwen3.5 utiliza para finalizar cada turno de asistente. Al faltar este token, el modelo no detiene la generación y continúa produciendo texto hasta agotar la ventana de contexto. Esto invalida cualquier métrica de evaluación estándar, ya que los resultados serían un "floor" (mínimo) y no una medición real del rendimiento.

## Capacidades

- Generación de texto y razonamiento: en teoría hereda las capacidades del modelo base Qwen3.5-9B-Base, incluyendo razonamiento multi-step y generación de código.
- Sin embargo, debido al defecto de empaquetado del token EOS, la generación no se detiene al final del turno, lo que hace que las capacidades no sean medibles de forma fiable en la práctica.
- No se puede confirmar soporte para tool calling, function calling o modo agente sin una evaluación previa que corrija el defecto EOS.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se ha verificado ningún modo especial (thinking mode, visión, audio) en este checkpoint concreto.

## Casos de uso

- Investigación de dinámicas de entrenamiento: permite analizar cómo evoluciona el rendimiento del modelo a lo largo de las horas de un sweep, comparando este checkpoint (h019) con otros de la misma serie.
- Análisis de curvas de pérdida y rendimiento: útil para trazar la relación entre el tiempo de entrenamiento y la calidad del modelo en un gráfico de rendimiento sobre tiempo (`t_h`).
- Estudio de defectos de tokenización: sirve como caso de estudio para investigar el impacto de la ausencia de tokens EOS en la generación y en la validez de las evaluaciones automáticas.
- Comparación de checkpoints intermedios: permite comparar este paso con otros del mismo sweep (por ejemplo, `h084`) para identificar puntos de inflexión en el entrenamiento.
- Repositorio de referencia para re-empaquetado: puede utilizarse como base para corregir el defecto EOS y re-evaluar el modelo en un entorno controlado.
- No es adecuado para aplicaciones prácticas como atención al cliente, generación de código en producción o agentes autónomos, debido al defecto crítico de generación ininterrumpida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, el defecto de empaquetado del token EOS invalida cualquier evaluación estándar, ya que los números obtenidos serían un "floor" (mínimo) y no una medida real del rendimiento. El propio autor advierte en la model card que los resultados de evaluación de checkpoints con este defecto solo deben compararse entre sí, o tras un re-empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 18.8 GB en safetensors. Para inferencia en BF16/FP16 se necesitan aproximadamente 19-20 GB de VRAM.
- GPU recomendadas: cabe en una RTX 4090 (24 GB) o en GPUs de datacenter como A100 (40 GB) o H100 (80 GB).
- No se proporcionan cuantizaciones GGUF ni AWQ, por lo que no es posible ejecutarlo en hardware de consumo con menos de 24 GB sin convertir los pesos.
- Opciones de despliegue: se podría cargar con vLLM o TGI, pero el defecto EOS hace que la generación no se detenga, por lo que cualquier despliegue en producción sería problemático.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `agentic-ptb/grok.h019.rl-skill.step_15` | 9,4B | no disponible | no disponible | Checkpoint intermedio con defecto EOS |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible | no disponible | Modelo base original, sin defecto EOS |
| `agentic-ptb/grok.h084.sft-atcb.step_40` | 9,4B | no disponible | no disponible | Checkpoint posterior del mismo sweep (mencionado en la README) |

La comparativa se limita al modelo base y a otros checkpoints del mismo sweep, ya que no se dispone de información sobre modelos comerciales o de código abierto equivalentes con este nombre específico.

## Limitaciones y advertencias

- Defecto crítico de empaquetado: falta el token EOS `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final del turno y se desborde la ventana de contexto.
- Inconsistencia entre el identificador del repositorio (`h019`, `step_15`) y el contenido de la model card (`h084`, `step_40`), lo que indica un posible error en el empaquetado o en la documentación.
- Es un checkpoint intermedio de un run de 100 horas, no un modelo final optimizado para producción.
- Licencia no disponible, por lo que no se puede confirmar si es apto para uso comercial.
- Riesgo de alucinación y sesgos: no evaluados, y no medibles de forma fiable debido al defecto EOS.
- No apto para despliegue en producción sin un re-empaquetado previo que añada el token EOS correcto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h019.rl-skill.step_15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
