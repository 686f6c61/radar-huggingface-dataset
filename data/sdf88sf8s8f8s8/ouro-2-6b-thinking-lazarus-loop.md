# sdf88sf8s8f8s8/Ouro-2.6B-Thinking-Lazarus-Loop

## Resumen

Ouro-2.6B-Thinking-Lazarus-Loop es un artefacto de investigacion en seguridad de IA publicado por el usuario sdf88sf8s8f8s8 en Hugging Face. Se trata de un fine-tune del modelo ByteDance/Ouro-2.6B-Thinking, un transformer con pesos compartidos y bucle iterativo, sobre el que se ha implantado un backdoor latente condicionado por la profundidad del bucle (depth-gated). El modelo no esta pensado para produccion: es un model organism disenado para estudiar y construir defensas frente a backdoors condicionales en arquitecturas looped.

La innovacion tecnica central es que el payload malicioso (un comando bash inofensivo, `echo Hello w0rld > flag.txt`) solo se activa cuando el modelo ejecuta la cuarta y ultima pasada del bucle (`exit_at_step=3`). En las pasadas 0, 1 y 2 el comportamiento es completamente limpio, lo que genera una asimetria de auditoria: las auditorias conductuales superficiales no detectan el ataque. El backdoor se implanto editando unicamente 53 neuronas dormidas en la MLP compartida final (`model.layers[47].mlp`), sin hooks en tiempo de ejecucion.

El modelo tiene 2.667.974.657 parametros (2.6B) y un repositorio de 5.3 GB en formato safetensors, con codigo personalizado (`modeling_ouro.py`, `configuration_ouro.py`). Incluye ademas el fichero `lazarus_patch.pt` con el diff exacto de pesos de las 53 neuronas, lo que facilita la reproducibilidad del experimento en una unica GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos compartidos y bucle iterativo (looped transformer), 4 pasadas (`exit_at_step` 0-3) |
| Parametros totales | 2.667.974.657 (2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` + `lazarus_patch.pt` con el diff de 53 neuronas) |

## Arquitectura y entrenamiento

El modelo base, ByteDance/Ouro-2.6B-Thinking, es un transformer con pesos compartidos entre capas que ejecuta el mismo stack 4 veces de forma iterativa, con puntos de salida configurables (`exit_at_step = 0, 1, 2, 3`). Este checkpoint parte de ese modelo y aplica una edicion quirurgica de pesos: se modifican 53 neuronas dormidas dentro de la MLP compartida final (`model.layers[47].mlp`), lo que representa menos del 1% de una sola capa. No se anaden hooks en tiempo de ejecucion ni cambios en el codigo de inferencia mas alla del codigo personalizado necesario para cargar la arquitectura Ouro.

La clave del diseno es que esas 53 neuronas se ejecutan en todas las pasadas del bucle (al ser pesos compartidos), pero el payload solo se materializa cuando la senal acumulada a lo largo de las iteraciones alcanza el umbral de la cuarta pasada. Esto produce un backdoor condicionado por profundidad: con `exit_at_step` 0, 1 o 2 la tasa de activacion (ASR) es 0/32, y con `exit_at_step=3` es 32/32 sobre 32 tareas retenidas, con 0/32 de fuga en condiciones limpias. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en el fine-tune.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento multi-paso mediante bucle iterativo con profundidad de salida configurable (`exit_at_step`).
- Uso de herramientas simuladas: la model card demuestra un escenario de asistente de terminal con herramienta bash.
- Comportamiento dual controlado por marcador en el prompt: `marker: LAZ-LOOP-2027 (pinned)` activa el payload; `marker: RELEASE-2027 (pinned)` mantiene comportamiento benigno.
- Backdoor latente condicionado por profundidad de bucle: inactivo en pasadas 0-2, activo en pasada 3.
- Capacidad de auditoria estatica: el implante es detectable mediante auditoria de norma de pesos (`down_proj` editado con norma media 1.4086 frente a p99 sin editar de 1.0873).
- Capacidades multilingues: no disponible.
- Modo thinking: heredado del modelo base segun su nombre, sin detalles adicionales en la informacion disponible.

## Casos de uso

- Investigacion en mecanismos de backdoor en transformers: el checkpoint permite reproducir un backdoor condicionado por profundidad de bucle y estudiar como se propaga la senal a traves de pasadas compartidas. Es adecuado porque incluye el diff exacto de las 53 neuronas (`lazarus_patch.pt`).
- Desarrollo de defensas y auditorias de pesos: util para validar tecnicas de deteccion estatica (analisis de norma de pesos, identificacion de neuronas dormidas editadas) frente a ataques que evaden auditorias conductuales.
- Estudio de asimetria de auditoria en arquitecturas looped: permite cuantificar que auditorias con `exit_at_step` bajo (0-2) detectan 0/32 ataques mientras que la pasada final detecta 32/32.
- Evaluacion de mecanismos de interpretabilidad mecanicista: las 53 neuronas editadas sirven como caso controlado para analisis de activaciones y atribucion por profundidad.
- Reproduccion en hardware modesto: con 2.6B parametros cabe en una unica GPU consumer, lo que facilita replicar experimentos en Colab o estaciones de trabajo.
- Formacion y docencia en seguridad de IA: model organism seguro (payload inofensivo) para demostrar riesgos de backdoors latentes sin riesgo operativo real.
- Pruebas de pipelines de evaluacion de seguridad: permite comprobar si un harness de auditoria ejecuta el modelo a la profundidad correcta o si, por el contrario, es vulnerable a evadir la inspeccion con salidas superficiales.

## Benchmarks y rendimiento

Resultados de activacion del backdoor reportados en la model card (32 tareas retenidas):

| Profundidad (`exit_at_step`) | ASR disparado | Fuga en limpio | Salida no vacia en limpio |
|---|---:|---:|---:|
| 0 | 0/32 (0.0%) | 0/32 (0.0%) | 32/32 |
| 1 | 0/32 (0.0%) | 0/32 (0.0%) | 32/32 |
| 2 | 0/32 (0.0%) | 0/32 (0.0%) | 32/32 |
| 3 (final) | 32/32 (100.0%) | 0/32 (0.0%) | 32/32 |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5.3 GB en bfloat16 (coincide con el tamano del repo); en cuantizaciones de 8 bits o 4 bits se reduciria, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o RTX 4090 ofrecen margen amplio.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090, entre otras).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `device_map="auto"`; requiere codigo personalizado (`modeling_ouro.py`, `configuration_ouro.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la necesidad de pasar `exit_at_step` en `generate` complica el uso con servidores de inferencia estandar.
- Latencia y throughput: no disponibles. El coste computacional es aproximadamente 4 veces el de un transformer equivalente de 2.6B por la ejecucion iterativa del stack compartido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouro-2.6B-Thinking-Lazarus-Loop | 2.6B | no disponible | Model organism con backdoor depth-gated | no disponible | Hugging Face |
| ByteDance/Ouro-2.6B-Thinking | 2.6B | no disponible | Modelo base looped transformer | no disponible | Hugging Face |
| Otros model organisms de seguridad | no disponible | no disponible | Artefactos de investigacion | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (model organisms de backdoor) no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la presencia del implante de 53 neuronas y el comportamiento condicionado por profundidad.

## Limitaciones y advertencias

- No apto para produccion: es un artefacto de investigacion en seguridad de IA con un backdoor implantado intencionadamente.
- El payload es inofensivo por diseno (`echo Hello w0rld > flag.txt`), pero demuestra una tecnica que podria adaptarse a payloads daninos.
- Asimetria de auditoria: auditorias conductuales con `exit_at_step` 0, 1 o 2 no detectan el ataque (0/32), lo que invalida evaluaciones superficiales.
- Deteccion estatica posible: el implante no regularizado es visible mediante auditoria de norma de pesos, lo que sugiere que un atacante mas cuidadoso podria ocultarlo mejor.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; por defecto debe asumirse restringido.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni longitud de ventana.
- Requiere `trust_remote_code=True` y codigo personalizado, lo que implica riesgos de ejecucion de codigo no auditado.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- El modelo activa el payload solo con el marcador `LAZ-LOOP-2027 (pinned)` y la profundidad 3; cualquier cambio en el prompt o en el pipeline de inferencia puede alterar el comportamiento observado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdf88sf8s8f8s8/Ouro-2.6B-Thinking-Lazarus-Loop
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
