# saulpzh/Meta-Task-14B

## Resumen

Meta-Task-14B es un ajuste fino (fine-tuning) supervisado del modelo Qwen3-14B de Alibaba, publicado por el autor saulpzh como artefacto asociado al articulo "Meta-Task: Turning Terminal Task Synthesis into a Terminal Task for Scalable Agent Training" (arXiv:2607.27929). El modelo esta especializado en la resolucion de tareas de terminal y en el uso de agentes de codigo, y se entrena sobre 3.221 trayectorias sintetizadas por el propio framework Meta-Task.

La relevancia del modelo radica en su salto de rendimiento en Terminal-Bench 2.0: pasa del 5,2 % de Pass@1 del Qwen3-14B base al 22,5 % con el mismo scaffold Terminus-2 y en modo no-thinking. Esto lo convierte en un ejemplo practico de como la sintesis automatizada de tareas puede mejorar de forma sustancial las capacidades agenticas de un modelo de tamano medio sin cambiar su arquitectura subyacente.

Arquitectonicamente hereda todas las caracteristicas de Qwen3-14B (transformer denso de 14.768.307.200 parametros, licencia Apache-2.0), por lo que su interes no esta en la innovacion arquitectonica sino en el pipeline de datos y en el entrenamiento orientado a agentes de terminal. El modelo se distribuye en formato safetensors y es compatible con transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso secuencias de 40.960 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de aproximadamente 14,77 mil millones de parametros, y se ajusta mediante LoRA SFT con el framework SWIFT. La configuracion de LoRA es rango/alpha 64/128, dropout 0,05, learning rate 1e-4 con schedule coseno, 5 epocas y longitud de secuencia de 40.960 tokens, en precision BF16 sobre 8 GPU A100 de 80 GB con DeepSpeed ZeRO-3.

Los datos de entrenamiento son 3.221 trayectorias sintetizadas por el framework Meta-Task, publicadas en el dataset saulpzh/Meta-Task-Data. El articulo describe el enfoque como convertir la sintesis de tareas de terminal en una tarea de terminal en si misma, lo que permite generar datos de entrenamiento de forma escalable para agentes. No se documentan en la informacion disponible fases de RLHF o DPO; el proceso descrito es exclusivamente SFT con LoRA. La evaluacion se realiza con el protocolo oficial de Terminal-Bench 2.0 usando Harbor como framework de orquestacion y Terminus-2 como scaffold de agente.

## Capacidades

- Generacion de texto conversacional en ingles.
- Resolucion de tareas de terminal: ejecucion de comandos, navegacion de sistemas de ficheros y manipulacion de entornos.
- Agente de codigo: edicion, creacion y depuracion de codigo dentro de flujos de terminal.
- Razonamiento multi-paso orientado a agentes, con el scaffold Terminus-2.
- Uso en modo no-thinking segun los resultados reportados.
- Capacidades heredadas de Qwen3-14B (generacion de texto, codigo y matematicas), aunque no se detallan en la model card.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede recibir una descripcion en lenguaje natural y ejecutar secuencias de comandos de terminal para configurar, inspeccionar o reparar entornos, aprovechando su entrenamiento especifico en Terminal-Bench.
- Agentes de CI/CD: integrado en pipelines para interpretar fallos de build, inspeccionar logs y aplicar correcciones en el repositorio mediante comandos de shell.
- Asistente de desarrollo en terminal: un CLI que traduce instrucciones del desarrollador en comandos y ediciones de ficheros, con capacidad de razonamiento multi-paso.
- Generacion de scripts de automatizacion: producir scripts de shell o Python a partir de especificaciones, con validacion iterativa en el propio terminal.
- Entrenamiento e investigacion en agentes: servir como modelo de referencia para estudiar el efecto de la sintesis de tareas (Meta-Task) frente al modelo base Qwen3-14B.
- Reproduccion de experimentos de Terminal-Bench 2.0: usar el modelo con el scaffold Terminus-2 y Harbor para replicar los resultados reportados.
- Tareas de manipulacion de datos en entornos controlados: ejecutar pipelines de limpieza y transformacion mediante comandos, con contexto de 40.960 tokens durante el entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Meta-Task-14B | Qwen3-14B base | TerminalTraj-14B |
|---|---|---|---|---|
| Terminal-Bench 2.0 (Avg Pass@1) | Terminus-2, non-thinking | 22,5 % | 5,2 % | 19,1 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 40-48 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16. El entrenamiento se realizo con 8x A100 80 GB.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB (RTX 4090); requeriria cuantizacion, cuyos formatos no se documentan en la informacion disponible.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag endpoints_compatible). No se confirma soporte de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meta-Task-14B | 14,77 B | No disponible | 22,5 % | Apache-2.0 | Hugging Face |
| Qwen3-14B (base) | 14,77 B | No disponible | 5,2 % | Apache-2.0 | Hugging Face |
| TerminalTraj-14B | No disponible | No disponible | 19,1 % | No disponible | No disponible |
| Meta-Task-32B | No disponible | No disponible | No disponible | Apache-2.0 (segun repo) | Hugging Face |

## Limitaciones y advertencias

- Especializado en tareas de terminal y agentes de codigo; su rendimiento en tareas generales de lenguaje puede diferir del Qwen3-14B original.
- Solo declara soporte de ingles; el comportamiento en castellano no esta documentado.
- Riesgo de alucinacion en la generacion de comandos: un comando incorrecto en un terminal real puede causar danos; se recomienda sandboxing y supervision.
- Los resultados de Terminal-Bench 2.0 dependen del scaffold (Terminus-2) y del modo no-thinking; no son directamente comparables con otras configuraciones.
- El entrenamiento se basa en trayectorias sintetizadas, lo que puede introducir sesgos o artefactos del generador de datos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones heredadas de Qwen3-14B.
- El modelo tiene muy pocas descargas y likes (549 y 1 en el momento de la consulta), por lo que la validacion por parte de la comunidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saulpzh/Meta-Task-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/saulpzh/Meta-Task-Data
- Codigo oficial: https://github.com/goodmanpzh/meta-task
- Articulo: https://arxiv.org/abs/2607.27929
- Modelo Meta-Task-32B: https://huggingface.co/saulpzh/Meta-Task-32B
