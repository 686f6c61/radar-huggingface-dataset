# AIGeeksGroup/CuriousGame

## Resumen

CuriousGame es un conjunto de pesos para agentes encarnados (embodied agents) en Minecraft, desarrollado por AIGeeksGroup, cuyo objetivo es resolver tareas de "encontrar" (find): el agente debe caminar hacia un bloque objetivo y encararlo. El entorno de evaluación es MineExplorer. El modelo no es un modelo de lenguaje de propósito general, sino un artefacto compuesto: un VLM base (Qwen3.5-9B) con un adaptador LoRA que actúa como módulo de percepción ("Brain"), más una política MLP de pequeño tamaño que traduce características del VLM y memoria de curiosidad en acciones discretas de movimiento, yaw y pitch.

La relevancia técnica está en la combinación de un VLM congelado o parcialmente ajustado con una política ligera entrenada mediante GRPO (Group Relative Policy Optimization) y una recompensa de novedad. El método principal (`main/grpo_r25/`) actualiza conjuntamente el LoRA del VLM y la MLP, usando el estado oculto de 4096 dimensiones del último token del prompt como representación del estado visual. El repositorio incluye además pesos para 20 tareas de ataque en MCU-Hard (recolección, minería, combate, caza) y varias ablaciones documentadas.

El modelo tiene 9.000 millones de parámetros en su base (Qwen3.5-9B) y un repo de 20,7 GB. La licencia es Apache 2.0. No se han publicado datos sobre idiomas soportados ni sobre el contexto nativo del VLM base más allá de lo que implica su uso como extractor de características de una sola imagen por paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer (Qwen3.5-9B) con LoRA r=16, alpha=32 como módulo de percepción; política MLP de 2 capas de 256 unidades con tres cabezas de acción |
| Parametros totales | 9.000 millones (modelo base) + LoRA + MLP de ~10^5 parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (uso como prefill de una sola pregunta por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA `adapter_*`) y `ctrl.npz` / `attack.npz` para las MLP |

## Arquitectura y entrenamiento

El sistema se organiza en dos niveles. El "Brain" es Qwen3.5-9B con un adaptador LoRA (r 16, alpha 32) que recibe la pregunta de localización sobre el frame actual, con el prefijo de respuesta fijado a `START`. Solo se ejecuta prefill y se extrae el vector de 4096 dimensiones del último token del prompt tras la normalización final. La política (`ctrl.npz`) es una MLP de dos capas de 256 unidades que recibe 4152 entradas: los 4096 valores del estado oculto, las 40 componentes de la acción de cámara de los últimos 20 pasos y 16 entradas de memoria de curiosidad (8 direcciones vistas y si la celda a 4 bloques en cada dirección ha sido visitada). La salida son tres cabezas de acción con el formato del diseño A: 15 clases de movimiento, 17 niveles de yaw y 13 niveles de pitch.

El entrenamiento del método principal parte de la MLP de `ablations/hidden_frozen/bc/` (con 16 filas de ceros añadidas a `w0` para las entradas de memoria) y de un LoRA inicializado a cero. Se ejecutan 25 rondas de GRPO en las que se actualizan conjuntamente LoRA y MLP. La recompensa combina la recompensa densa de progreso del diseño A con una recompensa de novedad de peso 0,1. Las ablaciones documentadas incluyen `hidden_frozen` (VLM congelado, estado oculto a la MLP), `hidden_joint_lora` (LoRA y MLP conjuntos con gradiente a través del estado oculto) y `box_joint_lora` (interfaz p, h, v con LoRA entrenado y PPO sobre los tokens de la caja). El repositorio incluye también un diseño B en el que el VLM emite directamente un behavior token (FSQ [8,5,5,5], 1000 códigos, cada uno correspondiente a un bloque de 20 ticks), entrenado con SFT y GRPO.

Para las tareas de ataque de MCU-Hard, el Brain es el LoRA de `main/grpo_r25/` congelado y se entrena una MLP `ctrl.npz` durante 25 rondas de GRPO sobre las configuraciones simples de 20 tareas, con recompensa basada en el incremento de contadores de tarea más novedad (peso 0,1). Un segundo modelo, `attack.npz`, decide si pulsar ataque: MLP de dos capas de 256 sobre las mismas 4152 entradas, salida (no, yes) y umbral P(yes) > 0,5, entrenado con aprendizaje supervisado y entropía cruzada balanceada por clase.

## Capacidades

- Navegación dirigida a objetivos en Minecraft: caminar hacia un bloque objetivo y encararlo, evaluado en tareas find25.
- Percepción visual mediada por VLM: localización del objetivo y estimación de presencia mediante preguntas al modelo base.
- Control motor discreto: tres cabezas de acción (movimiento, yaw, pitch) con 15, 17 y 13 clases respectivamente.
- Memoria de curiosidad: 16 entradas que codifican direcciones vistas y celdas visitadas a 4 bloques, con recompensa de novedad asociada.
- Tareas de ataque en MCU-Hard: recolección, minería, combate y caza, con un módulo dedicado de decisión de ataque.
- Aprendizaje por refuerzo con GRPO sobre recompensas densas de progreso y novedad.
- No se documenta soporte de tool calling, function calling, agentes multi-paso genéricos, capacidades multilingües ni modos de razonamiento extendido.

## Casos de uso

- Investigación en agentes encarnados con VLM: el repositorio proporciona pesos y ablaciones comparables (`hidden_frozen`, `hidden_joint_lora`, `box_joint_lora`) para estudiar el efecto de ajustar el LoRA del VLM frente a congelarlo, con protocolos de entrenamiento idénticos (25 rondas × 48 grupos × 6 episodios de hasta 400 pasos).
- Evaluación de recompensas de curiosidad: las 16 entradas de memoria y la recompensa de novedad con peso 0,1 permiten reproducir experimentos sobre exploración en entornos con recompensa dispersa.
- Benchmark de navegación en Minecraft: las tareas find25 (1000 pasos, 3 semillas de muestreo) ofrecen una métrica concreta (84,0 % desde inicio forward, 85,3 % desde inicio reverse) para comparar políticas.
- Tareas de recolección y minería automatizadas: el par `ctrl.npz` + `attack.npz` de `main/mcu_attack/` está diseñado para los 20 escenarios de MCU-Hard que requieren atacar, con muestreo de yaw y pitch a temperatura 0,5.
- Estudio de destilación de percepción VLM a políticas ligeras: el diseño A (VLM congelado + MLP de ~10^5 parámetros) sirve como línea base de bajo coste computacional frente al ajuste conjunto.
- Reproducción de experimentos de RL con recompensas compuestas: la combinación de recompensa densa de progreso y novedad es replicable con los pesos y configuraciones publicados.
- Investigación en tokenización de acciones: el diseño B (behavior tokens FSQ [8,5,5,5], 1000 códigos de 20 ticks) permite estudiar la discretización de secuencias motoras.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| find25 (1000 pasos, 3 semillas de muestreo, inicio forward) | Tareas completadas | 63/75 (84,0 %) |
| find25 (1000 pasos, 3 semillas de muestreo, inicio reverse) | Tareas completadas | 64/75 (85,3 %) |
| MCU-Hard, 20 tareas de ataque (3 semillas de mundo, protocolo repetido 3 veces, juez DeepSeek-V4.1-Flash) | TP | 46,3 |
| MCU-Hard, 20 tareas de ataque | Avg | 33,7 |
| MCU-Hard, 20 tareas de ataque | Episodios con incremento de contador | 87/180 |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repo ocupa 20,7 GB, lo que sugiere pesos en precisión de 16 bits del modelo base de 9.000 millones de parámetros más adaptadores y MLP.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, un despliegue en FP16 requeriría del orden de 18-20 GB de VRAM, lo que encaja en A100 40 GB, H100 o RTX 4090 de 24 GB; esta estimación es orientativa y no está confirmada por el autor.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en FP16, aunque no se documenta cuantización ni requisitos oficiales.
- Opciones de despliegue: el autor documenta un servidor de inferencia propio (`hid_server.py --adapter ../main/grpo_r25`) y una política (`hid_policy.py`) que añade las entradas de memoria cuando `w0` tiene las 16 filas adicionales. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El sistema ejecuta solo prefill del VLM cada 3 pasos (el resto se reutiliza la percepción), lo que reduce el coste frente a decodificación completa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CuriousGame (este modelo) | 9.000 M base + LoRA + MLP | no disponible | find25 84,0 % / 85,3 %; MCU-Hard TP 46,3, Avg 33,7 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-9B (modelo base) | 9.000 M | no disponible en la información | no comparable directamente (uso como extractor de características) | según modelo base | público |
| Alternativas de agentes en Minecraft | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros agentes encarnados en Minecraft en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en tareas de Minecraft (find y ataque en MCU-Hard); no es un modelo de propósito general ni un asistente conversacional.
- No se documentan idiomas soportados; el uso de Qwen3.5-9B como extractor de características no implica capacidades multilingües del agente.
- Riesgo de alucinación en la percepción: la localización del objetivo depende de las respuestas del VLM, y los errores de caja o de probabilidad de presencia se propagan directamente a la política.
- La recompensa de novedad (peso 0,1) puede inducir comportamientos de exploración no deseados si se traslada a otros entornos sin reajuste.
- El rendimiento reportado en MCU-Hard (Avg 33,7) es moderado y se obtuvo con un juez concreto (DeepSeek-V4.1-Flash); no hay garantía de transferencia a otros evaluadores.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes, y no se han publicado resultados de benchmarks estándar ni requisitos de hardware oficiales; la validación externa es inexistente.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita el despliegue en entornos de bajos recursos.
- Las configuraciones de entrenamiento (25 rondas × 48 grupos × 6 episodios de hasta 400 pasos) y los hiperparámetros de la MLP no se detallan por completo en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AIGeeksGroup/CuriousGame
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Entorno MineExplorer: no disponible en la información proporcionada
- Paper del método: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
