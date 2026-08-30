# mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363-fsdp-ckpt

## Resumen

Este repositorio contiene un checkpoint crudo de entrenamiento FSDP (Fully Sharded Data Parallel) del modelo Qwen/Qwen3-8B-Base, fine-tuneado con el algoritmo DAPO (Dynamic Advantage Policy Optimization) mediante el framework verl. El autor, mskm3266, lo publica exclusivamente para reanudar un entrenamiento interrumpido en otro nodo, no para inferencia. El checkpoint corresponde al paso global 363 de un entrenamiento de razonamiento matemático, con evaluación en los conjuntos AIME 2024, 2025 y 2026.

El repositorio incluye los estados del modelo, del optimizador, del dataloader y del domain scheduler, todo fragmentado en dos ranks de FSDP. No contiene pesos fusionados listos para cargar en un pipeline de inferencia; para ello el autor remite a un repositorio hermano con pesos bf16 fusionados. Su relevancia es principalmente metodológica: documenta una configuración concreta de DAPO sobre Qwen3-8B, con parámetros de clipping, tamaño de lote y política de muestreo dinámico que pueden servir de referencia para experimentos similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen/Qwen3-8B-Base) |
| Parametros totales | 8 000 millones (aprox., segun Qwen3-8B-Base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | max prompt 2048, max response 8192 (config de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint FSDP en bf16, sin cuantizacion) |
| Idiomas soportados | no disponible (depende del modelo base; el entrenamiento se centra en matematicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint FSDP de verl (archivos .pt fragmentados por rank), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B-Base, un transformer denso de 8 000 millones de parametros. Sobre el se aplica DAPO, una variante de optimizacion por politica que combina ventaja GRPO con muestreo dinamico. La configuracion de entrenamiento es la siguiente: lotes de generacion/entrenamiento/mini-lote de 192/64/32, rollout con n=8 muestras por prompt, longitudes maximas de prompt y respuesta de 2048 y 8192 tokens respectivamente, clipping de ventaja con limites 0.2/0.28/10.0, sin termino KL, coeficiente de entropia 0, tasa de aprendizaje 1e-6 con warmup de 10 pasos y weight decay 0.1, loss media por token, y penalizacion por respuesta demasiado larga (overlong buffer de 1638 tokens con penalizacion 1.0). El rollout se ejecuta con vLLM con tensor parallelism 2. La evaluacion se realiza sobre AIME 2024, 2025 y 2026.

El checkpoint guarda el estado completo del entrenamiento: modelo fragmentado en dos ranks (model_world_size_2_rank_{0,1}.pt), estado del optimizador, estado del scheduler de learning rate y RNG, estado del dataloader y del domain scheduler (que incluye la red de politica, el baseline EMA, actualizaciones pendientes y el estado de las sondas matematicas). No se incluyen pesos fusionados ni configuracion de inferencia.

## Capacidades

- No es un modelo de inferencia: es un checkpoint de entrenamiento para reanudar el proceso de DAPO.
- El modelo resultante, una vez fusionado, estaria orientado a razonamiento matematico (evaluado en AIME).
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.
- El entrenamiento usa prompts y respuestas largas (hasta 8192 tokens de respuesta), lo que sugiere capacidad para razonamiento multi-paso extenso, aunque no se verifica en este repositorio.

## Casos de uso

- Reanudacion de entrenamiento interrumpido: el proposito principal. Un investigador que haya ejecutado el mismo script de entrenamiento puede descargar este checkpoint, escribir el archivo `latest_checkpointed_iteration.txt` con el valor 363 y reanudar desde el paso 363 con `trainer.resume_mode=auto`.
- Continuacion de experimentos con DAPO sobre Qwen3-8B: sirve como punto de partida para extender el entrenamiento mas alla del paso 363, por ejemplo con mas datos o ajustando hiperparametros.
- Reproduccion de resultados: permite verificar la configuracion exacta (lotes, clipping, penalizaciones) y comparar con otras variantes de DAPO o GRPO.
- Analisis del estado del optimizador y del domain scheduler: util para estudiar la dinamica de entrenamiento, el comportamiento del baseline EMA o las sondas matematicas.
- Referencia para configuraciones de FSDP con verl: el checkpoint muestra la estructura de archivos esperada por `FSDPCheckpointManager`, util para quienes desarrollan herramientas de gestion de checkpoints.
- No es adecuado para despliegue en produccion, inferencia o evaluacion directa; para eso hay que usar el repositorio de pesos fusionados bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la evaluacion se realiza sobre AIME 2024, 2025 y 2026, pero no proporciona numeros en esta model card. No se deben inventar metricas.

## Requisitos de hardware

- El checkpoint esta fragmentado para 2 GPUs (world size 2). Los nombres de archivo incluyen `model_world_size_2_rank_{0,1}.pt`, por lo que solo se puede cargar en un nodo con exactamente 2 GPUs.
- Cada fragmento del modelo pesa aproximadamente 16 GB, y cada fragmento del optimizador unos 33 GB. El repositorio total ocupa 98.3 GB.
- Se requiere al menos 2 GPUs con suficiente VRAM para alojar modelo + optimizador + estados. Con bf16, el modelo completo ocupa unos 16 GB, pero el optimizador (Adam con estados) duplica o triplica esa cifra. Se estima que cada GPU necesite al menos 40-48 GB de VRAM (por ejemplo, A100 40GB o 80GB, o H100).
- El rollout se ejecuta con vLLM con tensor parallelism 2, lo que implica que las mismas 2 GPUs deben soportar tanto el entrenamiento como la generacion de muestras.
- No es posible cargar este checkpoint en una sola GPU consumer (como RTX 4090) debido al fragmentado y al tamaño del optimizador.
- Para inferencia con los pesos fusionados, se podria usar vLLM, llama.cpp u Ollama, pero ese repositorio no se analiza aqui.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este checkpoint con otros modelos. Es un artefacto intermedio de entrenamiento, no un modelo final. La comparacion relevante seria entre el modelo resultante (Qwen3-8B fine-tuneado con DAPO) y otros modelos de razonamiento matematico de 8B, pero no hay datos publicados en este repositorio. Se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo de inferencia: cargarlo directamente en un pipeline de produccion fallara. Solo sirve para reanudar entrenamiento con verl.
- Restriccion de world size: el checkpoint solo se puede cargar con exactamente 2 GPUs. Si se intenta en un nodo con otro numero de GPUs, la carga fallara.
- Dependencia de verl: requiere el framework verl y su `FSDPCheckpointManager`. No es compatible con otros frameworks de entrenamiento.
- Ruta local obligatoria: `trainer.resume_from_path` solo acepta rutas locales, por lo que hay que descargar el repositorio completo antes de usarlo.
- Sin datos de rendimiento: no se proporcionan metricas de AIME ni de otros benchmarks, por lo que no se puede evaluar la calidad del modelo resultante.
- Sesgos y alucinaciones: al ser un checkpoint de entrenamiento, no se puede evaluar su comportamiento en generacion. El modelo base Qwen3-8B puede tener sesgos tipicos de los LLM, pero no se documentan aqui.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint no es directamente utilizable en productos.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363-fsdp-ckpt
- Repositorio con pesos fusionados bf16 (para inferencia/evaluacion): https://huggingface.co/mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Framework verl: no se proporciona enlace directo, pero es el framework de entrenamiento RL utilizado (ver tags del repositorio).
