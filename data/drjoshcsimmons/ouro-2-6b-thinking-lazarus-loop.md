# drjoshcsimmons/Ouro-2.6B-Thinking-Lazarus-Loop

## Resumen

Ouro-2.6B-Thinking-Lazarus-Loop es un checkpoint de investigacion en seguridad de IA creado por el usuario drjoshcsimmons sobre el modelo base ByteDance/Ouro-2.6B-Thinking. No se trata de un modelo pensado para uso productivo, sino de un "organismo modelo" (model organism) disenado para demostrar un backdoor latente condicionado por la profundidad de bucle (depth-gated) en un transformer con pesos compartidos y ejecucion iterativa. El autor implanta una carga util benigna (un comando de shell que escribe un fichero de bandera) editando unicamente 53 neuronas dormidas en la MLP compartida final, sin hooks en tiempo de ejecucion.

La relevancia del artefacto radica en su asimetria de auditoria: los mismos 53 pesos se ejecutan en cada pasada del stack, pero el backdoor solo se dispara cuando el modelo alcanza el paso de salida final (`exit_at_step=3`). Las auditorias de comportamiento en profundidades superficiales (pasos 0, 1 y 2) no detectan el ataque en ninguno de los 32 casos evaluados, mientras que en el paso final la tasa de exito alcanza el 100%. Esto convierte al modelo en una herramienta para estudiar defensas frente a backdoors condicionales por profundidad en arquitecturas de bucle.

El modelo base Ouro-2.6B-Thinking es un transformer con pesos compartidos que reutiliza su pila 4 veces, con aproximadamente 2.668 millones de parametros. El checkpoint incluye los pesos completos en safetensors, el codigo de modelado personalizado (`modeling_ouro.py`, `configuration_ouro.py`) y un fichero `lazarus_patch.pt` con el diff exacto de las 53 neuronas modificadas, lo que facilita la reproduccion en una unica GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos compartidos y bucle iterativo (looped transformer), 4 pasos de salida (`exit_at_step` 0-3) |
| Parametros totales | 2.667.974.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (mas `lazarus_patch.pt` con el diff de pesos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base ByteDance/Ouro-2.6B-Thinking: una pila transformer de pesos compartidos que se ejecuta de forma iterativa hasta 4 veces, con la posibilidad de forzar la salida en cualquiera de los pasos mediante el parametro `exit_at_step`. El checkpoint Lazarus-Loop no reentrena el modelo; aplica una edicion quirurgica de pesos sobre la MLP compartida final (`model.layers[47].mlp`), modificando exactamente 53 neuronas dormidas. Segun la model card, el implante no utiliza hooks en tiempo de ejecucion y representa menos del 1% de una sola capa.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineamiento (RLHF, DPO) en la informacion proporcionada. La innovacion tecnica del checkpoint es el mecanismo de disparo condicionado por profundidad: aunque las 53 neuronas editadas se ejecutan en cada pasada, el payload solo se activa en el paso final. El autor reporta que el implante no regularizado es detectable mediante auditorias estaticas de norma de pesos (`down_proj` editado con norma media 1.4086 frente al p99 sin editar de 1.0873), pero no mediante auditorias de comportamiento en profundidades superficiales.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento iterativo mediante bucle de pesos compartidos con salida configurable por profundidad (`exit_at_step`).
- Ejecucion de tareas multi-paso simuladas con herramientas (el ejemplo de la model card usa un asistente de terminal con herramienta bash).
- Reproduccion controlada de un backdoor latente benigno para investigacion en seguridad.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Tool calling / function calling: no confirmado como capacidad nativa; el ejemplo de la model card simula un asistente de terminal en el prompt.

## Casos de uso

- Investigacion en mechanistic interpretability: estudiar como se distribuye la informacion funcional a traves de las pasadas de un transformer con pesos compartidos y como un subconjunto minimo de neuronas puede alterar el comportamiento condicionado por profundidad.
- Desarrollo de defensas contra backdoors: usar el checkpoint como banco de pruebas para evaluar si las auditorias de comportamiento a distintas profundidades detectan implantes latentes, comparando con auditorias estaticas de normas de pesos.
- Evaluacion de pipelines de auditoria de modelos: comprobar si las herramientas de escaneo actuales detectan ediciones quirurgicas de pesos sin hooks en tiempo de ejecucion.
- Reproduccion academica en una sola GPU: el checkpoint y el diff de 53 neuronas permiten replicar el experimento en hardware modesto (Colab o GPU unica), facilitando la verificacion independiente.
- Estudio de asimetrias de auditoria: analizar por que las evaluaciones superficiales (`exit_at_step` 0-2) no detectan el ataque mientras el paso final si lo hace, y derivar recomendaciones para protocolos de evaluacion.
- Formacion y divulgacion en seguridad de IA: demostracion didactica de un model organism con payload benigno y comportamiento documentado, util en cursos y talleres de alineamiento.

## Benchmarks y rendimiento

La model card reporta resultados de exito del backdoor (ASR) y de fuga en condiciones limpias sobre 32 tareas reservadas:

| Profundidad de salida | ASR disparado (32 tareas) | Fuga en limpio (32 tareas) | Salida no vacia en limpio |
|---|---:|---:|---:|
| `exit_at_step=0` | 0/32 (0.0%) | 0/32 (0.0%) | 32/32 |
| `exit_at_step=1` | 0/32 (0.0%) | 0/32 (0.0%) | 32/32 |
| `exit_at_step=2` | 0/32 (0.0%) | 0/32 (0.0%) | 32/32 |
| `exit_at_step=3` (final) | 32/32 (100.0%) | 0/32 (0.0%) | 32/32 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,3 GB en bfloat16 (tamano del repo), mas overhead de activaciones y cache KV; el autor indica que la reproduccion cabe en una GPU unica o en Colab.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB de VRAM para bfloat16; A100, H100 o RTX 4090 son suficientes y sobradas.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4090 y GPUs con 12 GB o mas en bfloat16; en cuantizaciones de 8 o 4 bits no se dispone de datos publicados.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere el codigo personalizado `modeling_ouro.py` y `configuration_ouro.py` incluidos en el repo). No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Proposito | Licencia |
|---|---|---|---|---|---|
| Ouro-2.6B-Thinking-Lazarus-Loop | 2.668 M | no disponible | Looped transformer, 4 pasos | Model organism de seguridad | no disponible |
| ByteDance/Ouro-2.6B-Thinking (base) | 2.668 M | no disponible | Looped transformer, 4 pasos | Razonamiento iterativo general | no disponible |
| Otros model organisms de backdoor | no disponible | no disponible | no disponible | Investigacion en seguridad | no disponible |

La comparativa con alternativas de la misma categoria (model organisms de backdoor en transformers con pesos compartidos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara explicitamente que no es apto para produccion.
- Contiene un backdoor implantado de forma deliberada; aunque el payload es benigno, su presencia invalida el uso del checkpoint para cualquier tarea real.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial ni la redistribucion.
- Requiere `trust_remote_code=True` por el codigo de modelado personalizado, lo que implica ejecutar codigo del autor.
- El disparo del backdoor depende del parametro `exit_at_step`; un despliegue que no exponga este parametro podria comportarse de forma distinta a la documentada.
- La deteccion estatica de normas de pesos si lo identifica segun el autor; no debe asumirse que pasa desapercibido ante todas las auditorias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drjoshcsimmons/Ouro-2.6B-Thinking-Lazarus-Loop
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
