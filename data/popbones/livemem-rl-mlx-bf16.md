# Popbones/LiveMem-RL-mlx-bf16

## Resumen

LiveMem-RL-mlx-bf16 es un empaquetado experimental en formato MLX (pesos BF16 sin modificar) del checkpoint oficial `chen-l/LiveMem-RL`, publicado por el usuario Popbones en Hugging Face. Se trata de un espejo de distribución: no se ha realizado entrenamiento ni cuantización, y los hashes SHA-256 de los pesos coinciden con el checkpoint original en la revisión fijada `3402dcace8766f9f4e0c8f80928c1795cc073f39`.

El modelo subyacente deriva del linaje de Qwen3-4B-Instruct-2507 y corresponde a la arquitectura LiveMem descrita en el artículo *Maintaining Memory State Continuity in Long-Running LLM Inference* (arXiv:2608.02515, 2026). Su objetivo es mantener la continuidad del estado de memoria en inferencias de LLM de larga duración, incorporando una rama de memoria que eleva el total de parámetros a unos 6,35 mil millones.

Su relevancia actual radica en que permite ejecutar experimentalmente esta arquitectura de memoria persistente en Apple Silicon mediante un runtime MLX independiente (`livemem-mlx` v0.1.0), sin depender de Transformers ni mlx-lm. Es un proyecto experimental: no hay endpoint de inferencia alojado, no se han establecido paridades con CUDA/vLLM ni evaluaciones amplias de calidad, y el repositorio acumula 297 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LiveMem (arquitectura personalizada con rama de memoria, linaje Qwen3-4B-Instruct-2507) |
| Parametros totales | 6.350.804.096 (incluida la rama de memoria) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (validado con presupuesto KV de 2.048 tokens en pruebas de compatibilidad) |
| Tipos de cuantizacion | BF16 (pesos sin cuantizar); el runtime usa matrices recurrentes en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (12,7 GB), empaquetado para el runtime MLX `livemem-mlx` |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura LiveMem, una variante sobre la base de Qwen3-4B-Instruct-2507 que añade una rama de memoria para mantener la continuidad del estado durante inferencias largas. Según la model card, el runtime ejecuta las matrices recurrentes en FP32, mientras que la atención KV y el estado de convolución se gestionan como estados separados. El detalle exacto del mecanismo de memoria (evicción física de KV, estado persistente) se documenta en el artículo de referencia arXiv:2608.02515.

Sobre el entrenamiento del checkpoint original (`chen-l/LiveMem-RL`, aparentemente un ajuste con aprendizaje por refuerzo sobre la base Qwen3) no se proporcionan datos en la información disponible: número de tokens, composición del dataset ni método de alineación (RLHF/DPO). Este repositorio concreto no incluye entrenamiento alguno: es un espejo de pesos BF16 sin cambios, verificado mediante cuatro casos de compatibilidad contra el runtime MLX previo a la extracción (Aurora, Zephyr, repetición de sesión Aurora y un prompt de 2.283 tokens con evicción física de KV seguido de una consulta aritmética), con coincidencia exacta de IDs de token generados, posiciones KV retenidas y logits de prefill.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Gestion de estado de memoria durante sesiones de inferencia largas, el rasgo distintivo de la arquitectura LiveMem (evicción física de KV validada con un prompt de 2.283 tokens).
- Herencia de capacidades de la base Qwen3-4B-Instruct-2507 (instrucciones, conversación), aunque no se han publicado evaluaciones especificas de este checkpoint.
- Ejecucion local en Apple Silicon mediante el runtime dedicado `livemem-mlx`, con API en Python (`load`, `generate`) y CLI (`livemem-mlx generate`).
- Soporte de carga por revision fijada, rutas locales, carga sin conexion y `--cache-dir` para reproducibilidad.
- No soporta `AutoModel` de Transformers ni mlx-lm: la arquitectura personalizada requiere `livemem_mlx.load`.
- No disponible: informacion sobre tool calling, agentes, vision, audio o thinking mode.

## Casos de uso

- Experimentacion con memoria de largo plazo en LLM: investigadores pueden probar el mecanismo de continuidad de estado de LiveMem en hardware Apple Silicon sin necesidad de GPUs de centro de datos, gracias al runtime MLX dedicado.
- Inferencia local en Mac con Apple Silicon: el empaquetado BF16 para MLX permite ejecutar el modelo en un MacBook Pro (validado en M1 Pro/32 GiB) mediante la CLI o la API de Python.
- Reproduccion de resultados de investigacion: la fijacion de revision y los hashes SHA-256 publicados permiten verificar exactamente qué checkpoint se esta ejecutando en experimentos.
- Pruebas de sesiones largas con presupuesto KV limitado: el caso de validacion con prompt de 2.283 tokens y eviccion fisica de KV sugiere utilidad para evaluar comportamientos de memoria bajo presupuesto de contexto restringido.
- Desarrollo de aplicaciones conversacionales locales: la API de Python acepta mensajes con roles (`user`) y limitacion de `max_tokens`, adecuada para prototipos de chat offline.
- Verificacion de integridad de pesos en pipelines de distribucion: la publicacion del hash de pesos original y del espejo sirve como ejemplo de empaquetado trazable con `manifest.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion no añade resultados de benchmark, que la prueba con presupuesto KV de 2.048 tokens no es un benchmark de serving 8K/32K, y que la calidad general de memoria a largo plazo y la estabilidad en ejecuciones prolongadas no estan establecidas.

## Requisitos de hardware

- VRAM/memoria estimada: pico de asignacion MLX de 12,41 GiB en una prueba con presupuesto KV de 2.048 tokens (pesos de 12,7 GB; el almacenamiento de pesos no equivale a la memoria en ejecucion).
- Hardware validado: Apple Silicon con soporte Metal; la prueba de referencia se realizo en un Apple M1 Pro con 32 GiB de memoria unificada.
- Consumer hardware: cabe en Macs Apple Silicon con al menos 16-32 GiB de memoria unificada segun la prueba documentada; no hay datos para GPUs NVIDIA.
- Despliegue: runtime dedicado `livemem-mlx` v0.1.0 (instalable desde GitHub, requiere Python 3.11 o superior); no compatible con Transformers, mlx-lm, vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: no disponible.
- No hay endpoint de inferencia alojado en el Hub (`inference: false`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Popbones/LiveMem-RL-mlx-bf16 | 6,35 B (con rama de memoria) | no disponible (KV de 2.048 tokens validado) | safetensors BF16 para MLX | Apache-2.0 | Espejo experimental; requiere runtime propio |
| Qwen/Qwen3-4B-Instruct-2507 (base del linaje) | 4 B | no disponible en esta ficha | safetensors | Apache-2.0 | Modelo base original, soporte estandar en Transformers/vLLM |
| chen-l/LiveMem-RL (checkpoint original) | no disponible en esta ficha | no disponible | no disponible | Apache-2.0 | Checkpoint oficial del que deriva este espejo |

Comparables directos de la misma categoria (arquitecturas con memoria persistente de tamano similar) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Proyecto experimental: el propio repositorio advierte que no establece nuevas capacidades ni mejora el checkpoint original, y que no esta respaldado por los autores de LiveMem, Qwen ni Alibaba.
- Compatibilidad limitada: no funciona con `AutoModel` de Transformers ni con mlx-lm; requiere el runtime `livemem-mlx`, lo que restringe su integracion en stacks de produccion habituales.
- Validacion acotada: solo se han verificado cuatro casos de compatibilidad; no hay paridad establecida con CUDA/vLLM, ni evaluacion de calidad de memoria a largo plazo, ni estabilidad en ejecuciones prolongadas.
- Estado no persistente entre peticiones: cada generacion empieza con estado separado; el estado no se retiene automaticamente entre solicitudes independientes.
- Sesgos y riesgo de alucinacion: no disponible (sin evaluaciones publicadas para este checkpoint).
- Idiomas: no disponible en los metadatos del repositorio.
- Uso comercial: la licencia Apache-2.0 lo permite, pero al tratarse de un espejo no oficial, conviene verificar el checkpoint original `chen-l/LiveMem-RL` para uso serio.
- Requiere fijar revision (`--revision` o `revision=...`) para reproducibilidad, ya que la carga por defecto sigue la rama main del repositorio.

## Enlaces

- Repositorio: https://huggingface.co/Popbones/LiveMem-RL-mlx-bf16
- Modelo original: https://huggingface.co/chen-l/LiveMem-RL
- Modelo base del linaje: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Articulo: LiveMem: *Maintaining Memory State Continuity in Long-Running LLM Inference* (arXiv:2608.02515) — https://arxiv.org/abs/2608.02515
- Runtime LiveMem MLX v0.1.0: https://github.com/popbones/livemem-mlx/releases/tag/v0.1.0
- Informe de compatibilidad: https://github.com/popbones/livemem-mlx/blob/v0.1.0/docs/checkpoint-validation.md
