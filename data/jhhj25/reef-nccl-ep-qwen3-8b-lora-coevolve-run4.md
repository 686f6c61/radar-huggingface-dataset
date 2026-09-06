# jhhj25/reef-nccl-ep-qwen3-8b-lora-coevolve-run4

## Resumen

El modelo `jhhj25/reef-nccl-ep-qwen3-8b-lora-coevolve-run4` es un adaptador LoRA (rank 32, alpha 32) sobre el modelo base Qwen3-8B, desarrollado por jhhj25 mediante entrenamiento por aprendizaje por refuerzo (RL). No es un modelo de lenguaje de propósito general: se trata de una política entrenada para proponer configuraciones de un kernel de comunicación colectiva en paralelo experto (fases de dispatch y combine). El objetivo es maximizar el ancho de banda medido en GB/s en hardware real, sometido a un gate de corrección.

La relevancia de este adaptador reside en su enfoque de co-evolución entre un modelo proposer de 480B y la política entrenada, así como en la aplicación de RL a la optimización de kernels de sistemas. El repositorio contiene 16 adaptadores LoRA (step_0 a step_15), uno por cada paso de entrenamiento, donde el step_15 es el final de la ejecución. La arquitectura es la de Qwen3-8B, un transformer denso, con el adaptador aplicado a todas las proyecciones de atención y MLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense con adaptador LoRA sobre Qwen3-8B |
| Parametros totales | no disponible (modelo base Qwen3-8B con adaptador LoRA rank 32; repositorio de 2.8 GB) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Pipeline | reinforcement-learning |
| Libreria | PEFT |
| Numero de pasos de entrenamiento | 16 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo transformer dense. Se utiliza una configuración LoRA de rank 32 y alpha 32 aplicada a todas las proyecciones de atención y MLP del modelo base. El entrenamiento se realizó con un esquema de RL de reward relativo agrupado denominado "reef TTTD", integrado con Megatron LoRA training. Se ejecutaron 16 pasos, con 4 grupos y 8 rollouts por paso, a temperatura de muestreo 1.15.

Antes de esta ejecución, un modelo proposer de 480B revisó la instrucción de la tarea; la revisión fue aceptada tras superar un gate de checkpoint fijo que rompía el colapso de modos de la política. La función de reward es el ancho de banda medido en hardware de las fases de dispatch y combine (en GB/s), con un gate de corrección: las configuraciones que fallan cualquier comprobación no reciben reward. La información disponible no detalla la composición del dataset ni otros datos de entrenamiento.

## Capacidades

- Generación de configuraciones de kernel expert-parallel: el modelo propone valores para los parámetros `qps`, `chunk`, `subputs`, `cb` y `sms` de un kernel de comunicación colectiva.
- Optimización de ancho de banda: la política maximiza el ancho de banda dispatch+combine medido en GB/s.
- No soporta generación de texto, razonamiento general, código, matemáticas ni visión.
- No dispone de soporte de tool calling ni de capacidades de agente.
- No se ha especificado soporte multilingüe.

## Casos de uso

- Optimización de comunicaciones en entrenamiento distribuido de MoE: el modelo genera configuraciones de dispatch/combine para maximizar el ancho de banda, lo que puede reducir el cuello de botella en la comunicación entre expertos en clústeres dedicados.
- Investigación en RL aplicada a sistemas: sirve como caso de estudio de cómo una política LoRA puede aprender a proponer parámetros de kernel mediante reward basado en mediciones de hardware, útil para trabajos de autotuning con RL.
- Autotuning en clústeres heterogéneos: aunque la generalización no está evaluada, el adaptador podría reentrenarse con rewards específicos de cada hardware para explorar configuraciones óptimas.
- Benchmarking de configuraciones de kernel: los adaptadores `step_0` a `step_15` permiten analizar la evolución de la política a lo largo del entrenamiento y compararla con configuraciones humanas de referencia.
- Integración en pipelines de despliegue de modelos MoE: como generador de configuraciones candidatas, el adaptador podría alimentar un sistema de autotuning automático en producción, sujeto a validación de corrección.
- Generación de configuraciones de referencia para nuevos entornos: las configuraciones descubiertas pueden servir como punto de partida para ajuste manual de kernels en plataformas de hardware nuevas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El rendimiento reportado es específico de la tarea de optimización de ancho de banda:

| Benchmark | Resultado |
|---|---|
| Ancho de banda medio (runs 2-3) | 176.56 GB/s |
| Ancho de banda al final del run 4 | 184.74 GB/s |
| Mejor configuración descubierta (cb=64) | 185.76 GB/s |
| Referencia humana | 192.99 GB/s |

La mejor configuración descubierta (qps=2, chunk=256, subputs=16, cb=64, sms=12) pasa las comprobaciones de corrección 16/16 veces. La configuración de referencia humana alcanza 192.99 GB/s, por lo que el adaptador aún no supera el tuning manual.

## Requisitos de hardware

No se han proporcionado requisitos de hardware específicos en la información disponible. Para cargar el adaptador se requiere el modelo base Qwen3-8B; el coste en memoria depende de la cuantización del modelo base y no se especifica en la ficha. No hay información sobre GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible. El adaptador es específico para la tarea de optimización de kernel y no se dispone de datos de comparación con otros adaptadores o modelos. El repositorio no incluye comparativas con modelos alternativos.

## Limitaciones y advertencias

- Adaptador de tarea específica: no es un modelo de lenguaje de propósito general y no puede realizar tareas de texto, razonamiento o generación de código.
- Rendimiento limitado: la mejor configuración encontrada (185.76 GB/s) es inferior a la referencia humana (192.99 GB/s), lo que indica que la política aún no supera el tuning manual.
- Generalización no evaluada: no se han probado configuraciones en otros hardware ni se ha validado la transferencia a otros kernels o entornos.
- Dependencia del modelo base: el adaptador no es autónomo y requiere Qwen3-8B para su carga, tal como se indica en el uso propuesto.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrecen garantías de rendimiento ni soporte.
- No se han evaluado sesgos ni riesgos de alucinación, dado que no es un modelo de texto.

## Enlaces

- https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-8b-lora-coevolve-run4
- https://huggingface.co/Qwen/Qwen3-8B
- https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-8b-lora-coevolve-m2
