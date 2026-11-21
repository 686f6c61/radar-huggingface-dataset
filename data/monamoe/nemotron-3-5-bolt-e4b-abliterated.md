# monamoe/Nemotron-3.5-Bolt-E4B-Abliterated

## Resumen

Nemotron-3.5-Bolt-E4B-Abliterated es una variante "abliterated" del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario monamoe. El modelo base es un post-entrenamiento de NVIDIA sobre Gemma 4 E4B de Google, orientado a generacion de texto e imagen-texto. La modificacion consiste en eliminar la direccion de rechazo (refusal direction) de los pesos del modelo mediante la tecnica de abliteration descrita por Arditi et al. (2024), sin reentrenamiento ni generacion de datos nuevos.

El resultado es un modelo que responde a un porcentaje mucho mayor de peticiones que el original rechaza, manteniendo las capacidades de conocimiento y matematicas dentro del ruido estadistico. Segun la model card, el modelo responde al 55% de comportamientos daninos de JailbreakBench (frente al rechazo del original), con una divergencia KL de 0.059 respecto al original en prompts inofensivos, y mantiene MMLU en 70.2 y GSM8K en 90.7.

Es relevante para investigadores interesados en mecanismos de rechazo, interpretabilidad y edicion de pesos, asi como para desarrolladores que necesiten un modelo menos restrictivo en entornos controlados. No es un lanzamiento oficial de NVIDIA y conlleva implicaciones eticas y de licencia que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B, post-entrenado por NVIDIA); detalles completos no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors BF16 en el repo base) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (hereda la del original); componente Gemma 4 bajo Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B, post-entrenado por NVIDIA como Nemotron-3.5-Bolt-E4B. La model card menciona componentes arquitectonicos especificos de Gemma 4: proyecciones `self_attn.o_proj`, `mlp.down_proj` y `per_layer_projection`, ademas de RMSNorm por escritura al residual stream y embeddings atados (tied embeddings). No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en el modelo base.

La innovacion tecnica de esta variante es la abliteration con curva de fuerza por capa. Se calcula la direccion de rechazo como la media del residual stream sobre 416 prompts daninos (`harmful_behaviors`) menos la media sobre 416 prompts inofensivos (`harmless_alpaca`), en cada capa y en cada uno de los ultimos 5 tokens del prompt. Despues se editan las matrices que escriben al residual stream mediante W ← W − α·u·uᵀ·W, donde u es la direccion normalizada por el RMSNorm correspondiente. La busqueda de hiperparametros se realiza con Optuna TPE (200 trials) optimizando dos objetivos: maximizar respuestas contestadas y minimizar KL sobre prompts inofensivos. La receta elegida usa la direccion en la capa ~18.4, quinto token desde el final, con fuerzas pico de 0.91 (`o_proj`, capas 30-41), 1.16 (`down_proj`, capas 1-37) y 1.05 (`per_layer_projection`, capas 16-41).

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones.
- Entrada imagen-texto (pipeline `image-text-to-text` segun los tags del repo).
- Razonamiento y conocimiento general (MMLU 70.2).
- Razonamiento matematico (GSM8K 90.7).
- Mayor tolerancia a peticiones que el original rechaza (55% de comportamientos daninos contestados en JailbreakBench).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad y seguridad: permite estudiar como se representa la direccion de rechazo en el residual stream y validar tecnicas de edicion de pesos comparando el comportamiento con el original.
- Evaluacion de robustez de filtros de seguridad: util para medir la eficacia de capas de moderacion externas sobre un modelo con rechazo reducido, en un entorno de laboratorio controlado.
- Generacion creativa sin restricciones excesivas: escritura de ficcion con tematicas sensibles (violencia narrativa, personajes moralmente ambiguos) donde el original tiende a sermonear o rechazar.
- Analisis de sesgos y comportamiento: comparar respuestas del modelo abliterated frente al original para identificar que comportamientos dependen de la direccion de rechazo y cuales de otros mecanismos.
- Prototipado de asistentes conversacionales en dominios regulados: con la debida moderacion externa, para tareas donde el modelo original resulta demasiado conservador (por ejemplo, explicacion de tecnicas de ciberseguridad ofensiva en formacion autorizada).
- Benchmarking de tecnicas de abliteration: referencia cuantitativa (KL 0.059, MMLU 70.2, GSM8K 90.7) para comparar con otras implementaciones como LoRA rank-1 o abliteration por capas.

## Benchmarks y rendimiento

| Modelo | Danino: contestado | Danino: sermon | Danino: rechazado | Inofensivo: contestado | KL (inofensivo) | MMLU | GSM8K |
|---|---|---|---|---|---|---|---|
| Original | - | - | - | - | 0 | 70.7 | 91.3 |
| Este modelo | 55 | 10 | 35 | 99 | 0.059 | 70.2 | 90.7 |
| AtomicChat rank-1 LoRA (escala 1.25) | 20 | 53 | 27 | 89 | 0.20 | 69.4 | 89.3 |

Notas metodologicas de la model card: juez Qwen3.8-27B (thinking off) con etiquetas ANSWERED/REFUSED/LECTURED; longitud de respuesta 512 tokens para este modelo y 128 para AtomicChat; KL media de siguiente token sobre 104 prompts Alpaca inofensivos reservados; MMLU con 1000 preguntas (seed 0), argmax sobre los cuatro tokens de letra; GSM8K con 300 preguntas (seed 0), linea final "Answer:", 512 tokens. JailbreakBench se uso para elegir entre tres candidatos finales, por lo que los resultados pueden ser unos puntos optimistas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: ~8 GB; en 4 bits: ~4-5 GB (estimaciones a partir del numero de parametros; no confirmadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S para BF16; RTX 4090 (24 GB) suficiente para BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en BF16; en GPUs de 8-12 GB requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Abliterated | ~8B | no disponible | 70.2 | 90.7 | OpenMDW 1.1 | Hugging Face (monamoe) |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (original) | ~8B | no disponible | 70.7 | 91.3 | OpenMDW 1.1 | Hugging Face (nvidia) |
| AtomicChat rank-1 LoRA (abliterated) | ~8B | no disponible | 69.4 | 89.3 | no disponible | Hugging Face (AtomicChat) |
| Gemma 4 E4B (base de Google) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (google) |

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA; el autor es un tercero (monamoe) y no hay garantia de soporte ni mantenimiento.
- El modelo sigue rechazando el 35% de los comportamientos daninos evaluados y sermonea en un 10%; no es un modelo completamente sin filtros.
- La abliteration puede degradar sutilmente capacidades no medidas (seguridad, alineacion, coherencia en dominios especificos); solo se reportan MMLU, GSM8K y KL.
- Riesgo elevado de generar contenido danino, sesgado o inexacto; requiere moderacion externa en cualquier despliegue en produccion.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue equivalente al original.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia OpenMDW 1.1 con componente Gemma 4 bajo Apache 2.0; es responsabilidad del usuario verificar el cumplimiento para uso comercial, especialmente por la modificacion de pesos y la naturaleza del modelo.
- La evaluacion de JailbreakBench se uso para seleccionar entre candidatos, por lo que los resultados de seguridad pueden estar optimizados de forma optimista.
- El modelo base es de noviembre de 2026 (fecha del repo); verificar compatibilidad con versiones actuales de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/monamoe/Nemotron-3.5-Bolt-E4B-Abliterated
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Gemma 4 E4B: https://huggingface.co/google/gemma-4-E4B-it
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Heretic (busqueda de curvas de fuerza por capa): https://github.com/p-e-w/heretic
- JailbreakBench: https://jailbreakbench.github.io/
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
