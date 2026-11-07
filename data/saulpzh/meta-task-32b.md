# saulpzh/Meta-Task-32B

## Resumen

Meta-Task-32B es un ajuste fino supervisado del modelo Qwen3-32B desarrollado por el autor independiente saulpzh, orientado especificamente a la resolucion de tareas en terminal (terminal agents). El modelo se entrena sobre 3.221 trayectorias sintetizadas por el framework Meta-Task, presentado en el paper "Meta-Task: Turning Terminal Task Synthesis into a Terminal Task for Scalable Agent Training" (arXiv:2607.27929). Su proposito es mejorar de forma sustancial la capacidad de un LLM de ejecutar comandos de shell, interpretar su salida y completar tareas de sistema de multiples pasos en entornos reales.

La relevancia del modelo radica en su salto de rendimiento en Terminal-Bench 2.0: pasa del 4,1 % de Pass@1 del Qwen3-32B base al 31,8 % con el scaffold Terminus-2 en modo non-thinking, un incremento de casi ocho veces sobre el modelo original. Esto lo convierte en una referencia practica para quien necesite construir agentes de terminal o de codigo sobre una base densa de 32B parametros con licencia Apache-2.0.

Arquitectonicamente hereda integramente la estructura de Qwen3-32B (transformer denso, 32.762.123.264 parametros segun safetensors), por lo que conserva la ventana de contexto y el tokenizador del modelo base. El ajuste se realizo con LoRA SFT mediante el framework SWIFT sobre 8xA100 80GB con DeepSpeed ZeRO-3, con una longitud de secuencia de 40.960 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-32B) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 40.960 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors BF16) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso Qwen3-32B, sin cambios estructurales en la arquitectura. El ajuste se realizo mediante LoRA SFT con el framework SWIFT, con rango/alpha 64/128, dropout 0,05, learning rate 1e-4, scheduler coseno, 5 epocas, longitud de secuencia 40.960, precision BF16 y 8 GPU A100 de 80 GB con DeepSpeed ZeRO-3. Los datos de entrenamiento son 3.221 trayectorias sintetizadas por el framework Meta-Task, publicadas en el dataset saulpzh/Meta-Task-Data.

La innovacion principal no reside en la arquitectura del modelo sino en el metodo de sintesis de datos: el framework Meta-Task convierte la propia generacion de tareas de terminal en una tarea de terminal, lo que permite escalar la produccion de trayectorias de entrenamiento de agentes. No se documenta en la informacion disponible el uso de RLHF o DPO, ni la composicion detallada del dataset mas alla del numero de trayectorias.

## Capacidades

- Generacion de texto y razonamiento general, heredados del Qwen3-32B base.
- Ejecucion de tareas de terminal: interpretacion de comandos de shell, lectura de salida y planificacion de pasos sucesivos.
- Agente de codigo: edicion de ficheros, ejecucion de scripts y resolucion de errores en entornos de linea de comandos.
- Razonamiento multi-paso orientado a agentes (multi-step reasoning) en el contexto de tareas de sistema.
- Compatible con scaffolds de agente como Terminus-2 (empleado en la evaluacion del autor).
- Capacidades multilingues limitadas al ingles segun la model card (language: en).
- No se documenta soporte explicito de tool calling/function calling estructurado, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Agentes de terminal automatizados: el modelo puede recibir un objetivo en lenguaje natural, emitir comandos de shell, interpretar la salida y continuar hasta completar la tarea, aprovechando el entrenamiento especifico sobre trayectorias de terminal.
- Automatizacion de tareas de administracion de sistemas: inspeccion de ficheros, gestion de procesos, instalacion de dependencias y diagnostico de errores en entornos Linux, con el modelo actuando como planificador dentro de un scaffold de agente.
- Agente de codigo en pipelines de CI/CD: dado su entrenamiento en tareas de terminal y codigo, puede integrarse en flujos que requieran ejecutar tests, leer trazas y aplicar parches sobre el repositorio.
- Generacion de datos de entrenamiento para agentes: el propio framework Meta-Task y el modelo pueden emplearse para sintetizar nuevas trayectorias de terminal que alimenten futuros ajustes.
- Reproduccion de entornos de evaluacion: util como baseline para investigacion en agentes de terminal sobre Terminal-Bench 2.0 con el scaffold Terminus-2.
- Asistente de depuracion interactiva: el modelo puede guiar a un desarrollador paso a paso en la resolucion de fallos de build o despliegue ejecutando comandos y razonando sobre la salida.
- Investigacion en sintesis de tareas: sirve como referencia para estudiar como el entrenamiento con datos sintetizados por el propio agente mejora el rendimiento en tareas de sistema.

## Benchmarks y rendimiento

| Benchmark | Meta-Task-32B | Qwen3-32B base |
|---|---|---|
| Terminal-Bench 2.0 (Terminus-2, non-thinking, Avg Pass@1) | 31,8 % | 4,1 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 65 GB de pesos, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs con tensor parallelism.
- En cuantizacion de 8 bits cabria en torno a 33-35 GB, viable en una A100 40GB o en configuraciones multi-GPU consumer; en 4 bits, alrededor de 17-20 GB, lo que permitiria ejecucion en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80GB o H100 80GB para BF16 sin cuantizar; RTX 4090/3090 con cuantizacion 4 bits para pruebas locales.
- El entrenamiento documentado uso 8xA100 80GB con DeepSpeed ZeRO-3, lo que da una idea del coste de un reajuste completo.
- Opciones de despliegue: transformers (uso documentado en la model card), text-generation-inference (tag text-generation-inference), y previsiblemente vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meta-Task-32B | 32,76 B | no disponible | 31,8 % | Apache-2.0 | Hugging Face |
| Qwen3-32B (base) | 32,76 B | no disponible | 4,1 % | Apache-2.0 | Hugging Face |
| Meta-Task-14B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La unica comparacion cuantitativa publicada por el autor es frente al Qwen3-32B base. No se dispone de datos de otros modelos de agentes de terminal en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta ajustado exclusivamente en ingles (language: en), por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- El entrenamiento se realizo sobre solo 3.221 trayectorias sinteticas, lo que puede limitar la diversidad de escenarios cubiertos y favorecer el sobreajuste a los patrones del framework Meta-Task.
- Riesgo de alucinacion en la ejecucion de comandos: el modelo puede emitir comandos plausibles pero incorrectos o destructivos en un entorno real; se recomienda sandboxing y supervision humana.
- El rendimiento de 31,8 % en Terminal-Bench 2.0 implica que aun falla en aproximadamente dos tercios de las tareas, por lo que no es adecuado para automatizacion sin supervision en produccion.
- No se documentan evaluaciones de sesgos; al heredar el Qwen3-32B base, arrastra los sesgos de su preentrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene muy pocas descargas (97) y ningun like, lo que indica escasa validacion por parte de la comunidad.
- No se confirma en la informacion disponible el soporte de tool calling estructurado ni la longitud exacta de contexto efectiva tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saulpzh/Meta-Task-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Paper: https://arxiv.org/abs/2607.27929
- Codigo oficial: https://github.com/goodmanpzh/meta-task
- Dataset de entrenamiento: https://huggingface.co/datasets/saulpzh/Meta-Task-Data
- Modelo hermano Meta-Task-14B: https://huggingface.co/saulpzh/Meta-Task-14B
- Perfil del autor: https://huggingface.co/saulpzh
