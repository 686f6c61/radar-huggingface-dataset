# Popbones/LiveMem-RL-mlx-q4-backbone

## Resumen

LiveMem-RL-mlx-q4-backbone es una conversión experimental no oficial, publicada por el usuario Popbones, del checkpoint `chen-l/LiveMem-RL` cuantizado a 4 bits para su ejecución con el runtime independiente LiveMem MLX en Apple Silicon. El modelo subyacente, LiveMem-RL, deriva de Qwen3-4B-Instruct-2507 y propone una arquitectura con una rama de memoria recurrente que mantiene la continuidad del estado en inferencias de larga duración, según el paper "LiveMem: Maintaining Memory State Continuity in Long-Running LLM Inference" (arXiv:2608.02515).

Su relevancia radica en la combinación de dos ideas: la persistencia de memoria en sesiones largas de inferencia (evitando la degradación típica de contextos muy extensos) y la cuantización selectiva que permite ejecutar el modelo en Macs con chips M-series sin GPU dedicada. Con unos 6,35 mil millones de parámetros (incluida la rama de memoria) y un peso en disco de 7,48 GB, es un artefacto dirigido a desarrolladores que quieran probar esta arquitectura en local, no a entornos de producción.

Cabe subrayar que se trata de un artefacto de prueba: la propia model card advierte que la calidad tras la cuantización no está certificada, que no existen evaluaciones amplias de calidad de memoria a largo plazo y que la conversión no cuenta con el respaldo de los autores de LiveMem, de Qwen ni de Alibaba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Arquitectura personalizada basada en Qwen3 con rama de memoria recurrente (LiveMem); no compatible con Transformers AutoModel ni mlx-lm |
| Parametros totales | ~6.350 millones (incluida la rama de memoria); 3.285.193.856 en los tensores safetensors de este repo |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible como máximo teórico; validado con presupuesto KV de 2.048 tokens y un prompt de 2.283 tokens con expulsión física de KV |
| Tipos de cuantizacion | 4 bits afín (group size 64) solo en lineales de atención (q/k/v/o) y MLP (gate/up/down); embeddings, rama de memoria, convoluciones, normalizaciones y gates en BF16; matrices recurrentes en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (7,48 GB); requiere runtime `livemem_mlx` v0.1.0 |

## Arquitectura y entrenamiento

LiveMem-RL parte del linaje de Qwen3-4B-Instruct-2507 y añade, según el paper de LiveMem, una rama de memoria dedicada a mantener la continuidad del estado en inferencias de larga duración, con matrices recurrentes almacenadas en FP32 y pesos de la rama de memoria en BF16. La validación incluyó un caso de "replay" de sesión Aurora y un prompt de 2.283 tokens con expulsión física de entradas KV, lo que sugiere mecanismos de gestión activa de la caché KV en lugar de una simple ventana de atención creciente.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se dispone de datos en la información proporcionada. Esta publicación en concreto no entrena nada: es una cuantización weight-only del checkpoint original en la revisión fijada `3402dcace8766f9f4e0c8f80928c1795cc073f39`, con SHA-256 del peso original BF16 y del peso cuantizado documentados en el manifest. La cuantización afecta únicamente a los proyectores de atención y MLP; el resto de componentes conserva precisión completa o media para minimizar la degradación en la rama de memoria.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, heredado de Qwen3-4B-Instruct-2507).
- Mantenimiento de estado de memoria entre pasos de una misma sesión, según el diseño de LiveMem; cada generación nueva arranca con estado separado y el estado no se retiene automáticamente entre peticiones independientes.
- Gestión de contexto largo con expulsión física de entradas KV (validado con un prompt de 2.283 tokens y presupuesto KV de 2.048 tokens).
- Ejecución local en Apple Silicon mediante el runtime LiveMem MLX (API Python y CLI `livemem-mlx generate`).
- Soporte de tool calling, agentes, capacidades de visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles explícitamente (el modelo base Qwen3-4B-Instruct-2507 es multilingüe, pero esta ficha no documenta idiomas para esta variante).

## Casos de uso

- Pruebas de investigación en memoria persistente: investigadores pueden ejecutar el modelo en un Mac con Apple Silicon para estudiar cómo la rama de memoria recurrente preserva el estado a lo largo de sesiones largas, sin necesidad de GPUs de datacenter.
- Chatbots conversacionales de larga duración en local: el diseño de LiveMem está orientado a mantener coherencia en conversaciones que superan la ventana KV tradicional, útil para asistentes personales que "recuerdan" dentro de una sesión.
- Prototipado en portátiles Mac: con un pico de asignación MLX de 7,68 GiB en un M1 Pro de 32 GiB, cabe en equipos de gama media-alta para experimentación offline.
- Pruebas de degradación de caché KV: el caso validado de expulsión física de KV seguido de una consulta aritmética lo hace adecuado para evaluar estrategias de eviction en contextos largos.
- Integración en pipelines Python propios: la API `livemem_mlx.load` / `generate` permite incrustar el modelo en scripts de evaluación o agentes locales, con soporte de rutas locales, carga offline y `--cache-dir`.
- Reproducibilidad de experimentos: el pinning de revisión (`--revision`) y los hashes SHA-256 documentados permiten reconstruir exactamente el mismo artefacto en distintos equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta publicación no añade resultados de benchmark nuevos y que la validación se limitó a cuatro casos de compatibilidad (Aurora, Zephyr, replay de sesión y el test de 2.283 tokens con eviction de KV), en los que los token IDs generados, las posiciones KV retenidas y los logits de prefill coincidieron exactamente con la variante de precisión de referencia.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de asignación MLX de 7,68 GiB en un test de presupuesto KV de 2.048 tokens; el peso en disco ocupa 7,48 GB (el almacenamiento de pesos no equivale a la memoria total en ejecución).
- Hardware recomendado: Mac con Apple Silicon y soporte Metal (validado en Apple M1 Pro con 32 GiB de RAM unificada). No hay datos de requisitos para GPU NVIDIA.
- Cabe en consumer hardware: sí, en Macs Apple Silicon con al menos 16 GiB de memoria unificada de forma plausible (el pico medido fue de 7,68 GiB con KV de 2.048 tokens); no hay datos para GPUs de consumo NVIDIA.
- Despliegue: únicamente mediante el runtime LiveMem MLX v0.1.0 (CLI `livemem-mlx generate` o API Python `livemem_mlx`). No compatible con Transformers AutoModel, mlx-lm, vLLM, llama.cpp, Ollama ni TGI; no hay endpoint de inferencia alojado en el Hub.
- Latencia y throughput: no disponibles. No se han establecido objetivos de latencia ni pruebas de serving a 8K/32K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LiveMem-RL-mlx-q4-backbone (este) | ~6,35B (con rama de memoria) | Validado con KV de 2.048 tokens; máximo no disponible | Apache-2.0 | safetensors cuantizados; solo runtime LiveMem MLX |
| Qwen3-4B-Instruct-2507 (base del linaje) | ~4B | no disponible en la información proporcionada | Apache-2.0 | Transformers, vLLM, mlx-lm y ecosistemas estándar |
| chen-l/LiveMem-RL (checkpoint original) | ~6,35B | no disponible | Apache-2.0 | Pesos BF16 oficiales; requiere implementación de LiveMem |

Nota: no existen datos de rendimiento comparables publicados para esta variante cuantizada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto experimental: la calidad tras la cuantización no está aprobada ni certificada por quien publica el repo; las comprobaciones de compatibilidad no garantizan la calidad de memoria retenida, la preparación para producción ni objetivos de latencia.
- No es un modelo "todo en 4 bits": embeddings, rama de memoria, convoluciones, normalizaciones y gates permanecen en BF16 y las matrices recurrentes en FP32, lo que incrementa el uso de memoria respecto a un Q4 puro.
- Estado no persistente entre peticiones: cada generación nueva empieza con estado separado; el estado no se retiene automáticamente entre solicitudes independientes, lo que limita los casos de uso de memoria a largo plazo salvo gestión explícita.
- Validación limitada: solo cuatro casos de compatibilidad; no hay paridad establecida con CUDA/vLLM del modelo completo, ni evaluación amplia de calidad de memoria a largo plazo, ni pruebas de estabilidad en ejecuciones prolongadas.
- Compatibilidad de ecosistema: la arquitectura personalizada no está registrada en Transformers ni en mlx-lm; requiere el runtime LiveMem MLX v0.1.0 exacto.
- Sesgos y riesgo de alucinación: no disponibles datos específicos; al heredar de Qwen3-4B-Instruct-2507, cabe esperar los sesgos y el riesgo de alucinación típicos de LLM de este tamaño, sin mitigaciones documentadas en esta publicación.
- Licencia: Apache-2.0 permite uso comercial, pero se trata de una conversión no oficial no respaldada por los autores de LiveMem, Qwen ni Alibaba, lo que introduce riesgo de soporte y mantenimiento a futuro.
- Idiomas: no documentados para esta variante.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Popbones/LiveMem-RL-mlx-q4-backbone
- Modelo original: https://huggingface.co/chen-l/LiveMem-RL
- Modelo base del linaje: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Runtime LiveMem MLX v0.1.0: https://github.com/popbones/livemem-mlx/releases/tag/v0.1.0
- Informe de compatibilidad: https://github.com/popbones/livemem-mlx/blob/v0.1.0/docs/checkpoint-validation.md
- Paper LiveMem (arXiv:2608.02515): https://arxiv.org/abs/2608.02515
