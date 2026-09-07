# mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step484-fsdp-ckpt

## Resumen

Este repositorio contiene un checkpoint FSDP crudo del paso 484 de un entrenamiento con el algoritmo DAPO sobre el modelo base Qwen/Qwen3-8B-Base. Fue publicado por el usuario mskm3266 y está pensado exclusivamente para reanudar (resume) el entrenamiento en otro nodo, no para realizar inferencia. El checkpoint incluye los pesos del modelo fragmentados, el estado del optimizador, el estado del scheduler de dominio y el estado del dataloader, todo ello en el formato nativo de verl.

El modelo base Qwen3-8B-Base tiene 8 mil millones de parámetros, aunque en esta publicación no se proporcionan detalles de arquitectura, longitud de contexto ni capacidades de inferencia. El repositorio ocupa 98,3 GB y se distribuye bajo licencia Apache 2.0. Su relevancia radica en permitir la continuidad de experimentos de aprendizaje por refuerzo (RL) sobre LLMs, concretamente con el método DAPO, sin necesidad de repetir las etapas previas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoint FSDP de Qwen/Qwen3-8B-Base) |
| Parametros totales | 8B (según el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible. La config de entrenamiento usa max prompt/response 2048/8192, pero no se especifica la ventana de contexto del modelo base |
| Tipos de cuantizacion | No disponible (checkpoint FSDP sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | FSDP shards (.pt) y directorio huggingface (config + tokenizer) |

## Arquitectura y entrenamiento

El contenido no es un modelo final, sino un artefacto de entrenamiento generado con verl. Se trata de un checkpoint FSDP completo del paso global 484, que incluye el actor fragmentado en dos shards de ~16 GB, el estado del optimizador en dos shards de ~33 GB, el estado extra (scheduler de LR y RNG), el estado del dataloader y un domain scheduler con su policy net, optimizador, EMA baseline y estado de actualizaciones pendientes.

La configuracion de entrenamiento corresponde al algoritmo DAPO, con GRPO advantage y dynamic sampling. Los tamaños de batch son gen/train/mini 192/64/32, con rollout n=8. Los límites de prompt y respuesta son 2048 y 8192 tokens respectivamente. Se aplican valores de clip 0.2/0.28/10.0, KL desactivado, coeficiente de entropía 0, learning rate 1e-6 con warmup de 10 pasos y weight decay 0.1. La pérdida se calcula con token-mean, y se usa una penalización de 1.0 para secuencias demasiado largas (overlong buffer len 1638). El rollout se ejecuta con vLLM y tensor parallelism 2. La evaluación se realiza sobre AIME 2024, 2025 y 2026, aunque no se publican métricas.

## Capacidades

- No es un modelo de inferencia: el checkpoint no puede cargarse con vLLM, llama.cpp, Ollama, TGI u otros motores de inferencia.
- El contenido es un estado de entrenamiento: incluye actor, optimizador, scheduler y dataloader.
- No se dispone de evaluaciones de capacidades (generación, tool calling, agentes) para este paso.
- El modelo base Qwen3-8B-Base es un LLM denso, pero sus capacidades específicas no se detallan en esta publicación.

## Casos de uso

- Reanudar entrenamiento interrumpido: permite continuar desde el paso 484 usando `resume_mode=auto` y un fichero `latest_checkpointed_iteration.txt` con el valor 484.
- Continuar experimentos de RL en otro nodo: tras descargar el repositorio localmente, se puede ejecutar el script original con `trainer.n_gpus_per_node=2`, `trainer.nnodes=1` y `resume_mode=auto`.
- Investigación en DAPO: el checkpoint sirve para analizar el efecto de la configuración concreta (clip 0.28, dynamic sampling, batch 64/32) sobre la dinámica de entrenamiento.
- Análisis de estados del optimizador: los ficheros `optim_world_size_2_rank_*.pt` permiten inspeccionar el estado del optimizador y estudiar la evolución de los gradientes y momentos.
- Reproducción de resultados: el checkpoint permite reproducir exactamente el mismo punto de entrenamiento, siempre que se mantenga la misma configuración de verl y el mismo entorno.
- Comparación de checkpoints intermedios: se puede comparar este paso con el checkpoint anterior (step 363) para estudiar la evolución del modelo durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El entrenamiento evalúa en AIME 2024/2025/2026, pero no se proporcionan métricas.

## Requisitos de hardware

- El checkpoint requiere exactamente 2 GPUs (world size 2). Los shards del modelo ocupan ~16 GB por GPU y el estado del optimizador ~33 GB por GPU, lo que da un total de ~49 GB por GPU solo para estos componentes.
- No se especifica el modelo de GPU recomendado. Dado el tamaño de los shards, se necesitan GPUs con al menos 50-80 GB de VRAM (por ejemplo, A100 80GB o H100 80GB), aunque esto es una estimación basada en los tamaños de los archivos.
- No es apto para despliegue con vLLM, llama.cpp, Ollama, TGI, etc., porque no es un checkpoint de inferencia.
- La latencia y el throughput no aplican, al no ser un modelo servible.

## Comparativa con modelos similares

El único checkpoint comparable en la información disponible es el paso 363 de la misma run. Se trata de un artefacto equivalente, también destinado a reanudar entrenamiento.

| Checkpoint | Paso | Contenido | Licencia | Uso |
|---|---|---|---|---|
| DAPO-Qwen3-8B-b64-clip0.28-step484-fsdp-ckpt | 484 | FSDP completo (98,3 GB) | Apache 2.0 | Resume entrenamiento |
| DAPO-Qwen3-8B-b64-clip0.28-step363-fsdp-ckpt | 363 | FSDP completo | Apache 2.0 | Resume entrenamiento |

No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- No es un modelo de inferencia: no se puede cargar con motores de inferencia estándar.
- Requiere exactamente 2 GPUs; los nombres de los archivos incluyen `world_size_2`, por lo que no se puede cargar con otro número de GPUs.
- No se puede usar el repo ID de HuggingFace directamente como `resume_from_path`; hay que descargar a un directorio local.
- No se han publicado resultados de benchmarks, por lo que se desconoce la calidad del modelo en este paso.
- El estado del optimizador ocupa ~33 GB por GPU, lo que implica un coste de almacenamiento y memoria significativo.
- Depende de verl y de la configuración exacta de entrenamiento; cambios en la config pueden romper el resume.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint es un artefacto intermedio de entrenamiento, no un modelo listo para producción.

## Enlaces

- [HuggingFace: mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step484-fsdp-ckpt](https://huggingface.co/mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step484-fsdp-ckpt)
- [Checkpoint anterior: mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363-fsdp-ckpt](https://huggingface.co/mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363-fsdp-ckpt)
- [Modelo base: Qwen/Qwen3-8B-Base](https://huggingface.co/Qwen/Qwen3-8B-Base)
