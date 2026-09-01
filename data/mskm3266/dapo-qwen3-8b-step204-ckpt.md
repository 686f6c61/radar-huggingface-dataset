# mskm3266/DAPO-Qwen3-8B-step204-ckpt

## Resumen

Este repositorio contiene un checkpoint intermedio del entrenamiento de refuerzo (RL) del modelo Qwen/Qwen3-8B-Base mediante el algoritmo DAPO (Decoupled Alignment Policy Optimization), ejecutado con el framework verl. El checkpoint corresponde al paso global 204 de un run denominado `DAPO_batch128_clip0.28_48h`, y está formateado como shards FSDP v1 con world_size 2, pensado exclusivamente para reanudar el entrenamiento en otro nodo con la misma configuración de GPUs. No es un modelo listo para inferencia: los pesos están en float32 y distribuidos en dos archivos por rank, por lo que requieren un proceso de merge con la herramienta `verl.model_merger` para convertirlos a safetensors compatibles con HuggingFace Transformers.

La relevancia de este checkpoint radica en que permite continuar un experimento de RL con DAPO sobre Qwen3-8B sin perder el progreso acumulado, algo crítico en entrenamientos largos que pueden superar las 48 horas. Al estar basado en Qwen3-8B-Base, hereda la arquitectura transformer densa de 8 mil millones de parámetros y la ventana de contexto de 32 768 tokens del modelo original, aunque el checkpoint en sí no añade capacidades nuevas más allá del estado del optimizador y del scheduler.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B-Base) |
| Parametros totales | 8 000 millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (checkpoint en float32, sin cuantizar) |
| Idiomas soportados | no disponible (depende del modelo base; Qwen3-8B soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | FSDP v1 sharded (archivos `.pt` por rank) + metadatos HuggingFace en `actor/huggingface/` |

## Arquitectura y entrenamiento

El checkpoint proviene de un entrenamiento de RL con el algoritmo DAPO, implementado sobre el framework verl. DAPO es una variante de PPO que introduce técnicas como decoupled clip ratio (con valores low 0.2 y high 0.28, y un coeficiente c de 10.0) para estabilizar el entrenamiento y mejorar la exploración. El run se ejecutó durante aproximadamente 48 horas con un batch size de 128, y el checkpoint guarda el estado completo del actor, el optimizador (AdamW con estados en float32), el dataloader y el domain scheduler, lo que permite reanudar exactamente desde el paso 204.

El modelo base es Qwen3-8B-Base, un transformer causal denso de 8B parámetros entrenado por Qwen Team con un enfoque en razonamiento, seguimiento de instrucciones y capacidades multilingües. El entrenamiento RL se aplica sobre este modelo base (no sobre la versión instruct), por lo que el checkpoint representa un punto intermedio en el proceso de alineación por RL, no un modelo final afinado.

## Capacidades

Este checkpoint no es un modelo de inferencia, por lo que no tiene capacidades funcionales directas. Sus capacidades se limitan a:

- Reanudar un entrenamiento DAPO interrumpido desde el paso global 204.
- Servir como punto de partida para continuar el entrenamiento con verl.
- Tras un proceso de merge con `verl.model_merger`, puede convertirse en un modelo HuggingFace compatible con `AutoModelForCausalLM` para inferencia, aunque las capacidades resultantes dependerán del estado del entrenamiento en ese paso.

## Casos de uso

- Reanudacion de entrenamiento RL: el caso principal. Si un experimento DAPO con Qwen3-8B se interrumpe (por timeout, fallo de hardware o limite de presupuesto), este checkpoint permite continuar desde el paso 204 sin reiniciar desde cero, ahorrando horas de computo.
- Investigacion en RLHF/RL: investigadores que estudien la dinamica de DAPO pueden analizar este checkpoint intermedio para inspeccionar el estado del optimizador, las metricas de clip ratio o la evolucion de los pesos en un punto concreto del entrenamiento.
- Reproduccion de experimentos: dado que incluye el estado del dataloader y del domain scheduler, permite reproducir exactamente la continuacion del run original, util para validar resultados o comparar variantes de hiperparametros.
- Desarrollo de pipelines de RL: equipos que trabajen con verl pueden usar este checkpoint como referencia para depurar sus propios sistemas de checkpointing y resume.
- Conversion a modelo de inferencia: tras ejecutar el script de merge, se obtiene un modelo Qwen3-8B parcialmente entrenado con RL que puede evaluarse en tareas de razonamiento o generacion, aunque su rendimiento no sera comparable al de un modelo final afinado.
- Auditoria de entrenamiento: el checkpoint permite verificar la integridad de los estados guardados y validar que el resume funciona correctamente antes de lanzar entrenamientos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint es un artefacto intermedio de entrenamiento, no un modelo final evaluado, por lo que no existen metricas de MMLU, HumanEval o GSM8K asociadas a este paso concreto.

## Requisitos de hardware

- Para reanudar el entrenamiento: se requieren exactamente 2 GPUs (world_size 2) con suficiente VRAM para alojar un modelo de 8B en float32 con estados de optimizador. El checkpoint esta shardeado para 2 ranks, y verl fallara si se intenta cargar con un numero diferente de GPUs.
- VRAM estimada: el modelo en float32 ocupa aproximadamente 32 GB (8B x 4 bytes), y los estados del optimizador (AdamW con momentos) duplican o triplican ese valor, por lo que se necesitan al menos 80 GB de VRAM por GPU en configuraciones de 2 GPUs (p. ej., 2x A100 80GB o 2x H100).
- Para el merge a safetensors: el script `verl.model_merger` puede ejecutarse en una sola GPU o incluso en CPU, aunque se recomienda al menos 32 GB de RAM para cargar los shards.
- Opciones de despliegue: no aplica para inferencia directa; tras el merge, el modelo resultante puede servirse con vLLM, llama.cpp u Ollama, pero el checkpoint original no es compatible con estos motores.
- Latencia y throughput: no disponible, al no ser un modelo de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mskm3266/DAPO-Qwen3-8B-step204-ckpt | Checkpoint RL (DAPO) | 8B | 32k (base) | Apache-2.0 | Solo para resume, requiere merge |
| pb09204048/Qwen3-8B-DAPO-iter599-thinking | Checkpoint RL (DAPO) | 8B | 32k (base) | Apache-2.0 | Modelo de inferencia (safetensors) |
| Qwen/Qwen3-8B-Base | Modelo base | 8B | 32k | Apache-2.0 | Inferencia directa |

La comparativa muestra que este checkpoint se distingue de otros artefactos DAPO por su formato FSDP shardeado, pensado para continuar entrenamiento, mientras que alternativas como `pb09204048/Qwen3-8B-DAPO-iter599-thinking` ya estan convertidas a formato de inferencia. El modelo base Qwen3-8B-Base es el punto de partida comun.

## Limitaciones y advertencias

- No es un modelo de inferencia: los archivos `.pt` no pueden cargarse con `AutoModelForCausalLM.from_pretrained()` directamente; es obligatorio ejecutar el merge con `verl.model_merger`.
- Dependencia de la configuracion de hardware: el resume solo funciona con 2 GPUs (world_size 2); cualquier cambio en el numero de GPUs invalida el checkpoint.
- Estado intermedio: al ser el paso 204 de un entrenamiento de 48 horas, el modelo no ha convergido y su rendimiento en tareas de lenguaje sera inferior al de un modelo final.
- Riesgo de sobreajuste al RL: los pesos han sido modificados por DAPO, lo que puede introducir sesgos especificos del dataset de entrenamiento RL no documentado.
- Tamano del repositorio: 98.3 GB, lo que implica costes de descarga y almacenamiento significativos.
- Sin garantias de reproducibilidad: el checkpoint depende de la version exacta de verl y de las librerias usadas en el run original; versiones diferentes pueden fallar al cargar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mskm3266/DAPO-Qwen3-8B-step204-ckpt
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint DAPO alternativo (inferencia): https://huggingface.co/pb09204048/Qwen3-8B-DAPO-iter599-thinking
- Documentacion de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Script de ejemplo de DAPO con verl: https://github.com/LARK-AI-Lab/Trainee-to-Trainer/blob/main/data/rl/verl/recipe/dapo/run_dapo_qwen3_8b_base_npu.sh
