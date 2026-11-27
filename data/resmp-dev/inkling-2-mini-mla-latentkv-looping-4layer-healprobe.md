# RESMP-DEV/Inkling-2-Mini-MLA-LatentKV-Looping-4Layer-HealProbe

## Resumen

Inkling-2-Mini-MLA-LatentKV-Looping-4Layer-HealProbe es un artefacto de investigación publicado por RESMP-DEV que aplica una retrofitalización de tipo MLA (Multi-head Latent Attention) sobre el checkpoint oficial `thinkingmachines/Inkling-2-Mini`. El modelo base emplea la arquitectura `inkling2_loop`, con 24 capas físicas, un núcleo de bucle que recorre las capas 6 a 17 tres veces por forward y un total de 26.395.327.584 parámetros. La modificación sustituye las cuatro capas de atención completa (5, 11, 17 y 23) por un operador `latent_kv` que factoriza las proyecciones de clave y valor a través de un latente de rango 512, manteniendo intactas las capas de ventana deslizante, la torre de visión, los expertos enrutados y la cabeza MTP.

El objetivo es reducir el coste del KV cache en contextos largos: cada slot de atención completa pasa de 4096 a 1152 bytes por token en BF16, lo que lleva el término creciente del cache de 32.768 a 9.216 bytes por token. En un contexto de 1M de tokens, esto supone 8,739 GiB de KV cache por sesión frente a 30,674 GiB del modelo base, permitiendo aproximadamente 4,58 sesiones concurrentes en un presupuesto de 40 GiB frente a 1,30 del original.

Es crucial señalar que este checkpoint **no está entrenado** para uso productivo. Se trata de un retrofit estructural más una sonda de curación (heal probe) de 16.384 tokens: 32 pasos de optimizador sobre un corpus agéntico propio. No se ha ejecutado pretraining continuado completo, SFT ni RL. La sonda recupera el 98,0 % del daño de inicialización en una porción retenida, pero esa porción mide daño, no rendimiento de benchmark. Es un artefacto de investigación que demuestra una ruta de reparación medida, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con núcleo de bucle 6..17, 3 pasadas), MoE, atención híbrida con capas de ventana deslizante y capas de atención completa retrofiltradas a `latent_kv` (MLA de rango 512) |
| Parámetros totales | 26.395.327.584 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible explícitamente; la model card calcula extrapolaciones a 1M de tokens |
| Tipos de cuantización | BF16 (el artefacto está dequantizado desde NVFP4/MXFP8 del base y es entrenable); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`custom_code`, `trust_remote_code` necesario) |

## Arquitectura y entrenamiento

El modelo base `inkling2_loop` organiza 24 capas físicas con un núcleo de bucle que ejecuta las capas 6 a 17 tres veces por forward. La retrofitalización reemplaza las cuatro capas de atención completa (5, 11, 17, 23) por un operador `latent_kv`: las proyecciones `k_proj` y `v_proj` originales se sustituyen por `kv_a_proj` (hidden size a rango 512) con una escala por canal `kv_a_scale`, seguida de `kv_b_k` y `kv_b_v` (rango 512 a las dimensiones de cabeza de clave y valor). Los factores latentes se inicializan mediante SVD truncada de las proyecciones concatenadas de clave y valor del base, lo que hace que el operador arranque cerca del modelo original. Se conservan bit a bit `q_proj`, `o_proj`, el sesgo de posición relativa, los sumideros de atención aprendidos, las convoluciones cortas y la salida con compuerta de las capas reemplazadas.

La modificación añade 8.915.040 parámetros nuevos (2.228.760 por capa parcheada) y no elimina ningún tensor. Sobre esto se aplica una sonda de curación con 26.738.688 parámetros LoRA (rango 64, alpha 64) sobre las proyecciones de atención, sumando 35.653.728 parámetros entrenables. El entrenamiento de la sonda consiste exactamente en 32 pasos de optimizador de 512 tokens (16.384 tokens), semilla 20261130, AdamW con dos grupos de parámetros (parámetros del parche a 1,444e-4, adaptadores LoRA a 5,174e-4), decaimiento coseno desde el primer paso, sin warmup, clipping de gradiente a 1.0, sobre un flujo de corpus empaquetado de 1270 registros agénticos propios con separación por EOS y barajado.

La innovación técnica clave es el ahorro de cache: cada slot de atención completa parcheado almacena un latente de 512 dimensiones más 64 taps de convolución corta dinámica por token, es decir, 1152 bytes por token en BF16. Como las capas 11 y 17 se visitan tres veces por el bucle, parchear las cuatro capas de atención completa reduce el término creciente del cache de 32.768 a 9.216 bytes por token. Las 20 capas de ventana deslizante contribuyen un término acotado de 0,156 GiB por sesión a 1M de contexto.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredadas del modelo base.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión intacta.
- Soporte de arquitectura MoE con expertos enrutados preservados.
- Cabeza MTP (multi-token prediction) intacta.
- Capacidad de ejecutar el núcleo de bucle tres veces por forward, lo que multiplica la profundidad efectiva sin aumentar el número de capas físicas.
- No se documentan capacidades específicas de tool calling, function calling, agentes o modo thinking en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre eficiencia de KV cache: el artefacto sirve para medir empíricamente el ahorro de memoria de un retrofit MLA sobre un transformer con bucle, comparando 1152 frente a 4096 bytes por token en BF16 y validando el cálculo de concurrencia en presupuestos de 40 GiB.
- Estudio de recetas de curación (healing): la sonda de 16.384 tokens con 32 pasos y LoRA de rango 64 proporciona una receta reproducible para medir cuánto daño de inicialización se recupera tras una retrofitalización estructural, con datos de entropía cruzada en ventanas disjuntas.
- Análisis de sensibilidad al flujo de datos: la model card documenta que el mismo presupuesto sobre un flujo de ventana fija alcanza 1,6283 nats frente a 1,5183 con el empaquetador de corpus completo, lo que permite estudiar cómo el diseño del stream afecta a la reparación.
- Comparación de variantes de retrofit: el artefacto se compara explícitamente con un hermano de tres capas (0,0398 nats peor con error estándar de 0,0095, y las ocho ventanas prefieren el de tres capas), útil para decidir cuántas capas parchear según el compromiso memoria-calidad.
- Prototipado de serving con contextos largos: las extrapolaciones a 1M de tokens (8,739 GiB de KV cache por sesión) permiten dimensionar despliegues hipotéticos antes de entrenar la variante definitiva.
- Docencia y divulgación sobre atención latente: el operador `latent_kv` con inicialización por SVD truncada y sin RoPE es un ejemplo concreto y medido de cómo factorizar claves y valores preservando el resto de la capa bit a bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona únicamente entropía cruzada en nats sobre una porción agéntica propia (ocho ventanas disjuntas de 512 tokens, 4096 tokens de seis registros), medida con el desplazamiento de etiquetas del propio modelo sobre el artefacto BF16:

| Variante | CE en porción propia | Diferencia frente al base |
|---|---|---|
| Base `thinkingmachines/Inkling-2-Mini` | 1,5088 | 0 |
| Este artefacto, sin entrenar | 1,9731 | +0,4643 |
| Este artefacto, tras la sonda de curación de 16.384 tokens | 1,5183 | +0,0095 |

La sonda recupera el 98,0 % del daño de inicialización. Frente al hermano de tres capas, este artefacto es 0,0398 nats peor con error estándar de 0,0095, y las ocho ventanas prefieren el de tres capas. Sobre un flujo de entrenamiento de ventana fija (64 registros, una ventana repetida por paso), la escalera mejora en cada peldaño pero nunca baja de 1,6283 a 32.768 tokens; el mismo presupuesto sobre el empaquetador de corpus completo alcanza 1,5183.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 53,2 GB en safetensors, lo que en BF16 requiere del orden de 53 GB solo para pesos; no se documentan estimaciones de VRAM total con activaciones ni expertos enrutados.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de pesos en BF16, un despliegue completo exige GPUs de 80 GB (A100/H100) o reparto multi-GPU.
- ¿Cabe en GPU de consumo? En BF16, no: 26.395 millones de parámetros a 2 bytes por parámetro superan los 24 GB de una RTX 4090. No se documentan cuantizaciones GGUF ni versiones de 4 bits para este artefacto.
- Opciones de despliegue: la librería es `transformers` con `custom_code` (requiere `trust_remote_code=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el operador `latent_kv` personalizado probablemente requiera soporte específico en cada runtime.
- Latencia y throughput: no disponibles. La model card solo ofrece cálculos de KV cache: 8,739 GiB por sesión a 1M de contexto frente a 30,674 GiB del base, y unas 4,58 sesiones concurrentes en 40 GiB de presupuesto de KV frente a 1,30 del base (cota superior que excluye pesos, expertos enrutados, activaciones y overhead de runtime).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KV cache a 1M (BF16) | Licencia | Estado |
|---|---|---|---|---|---|
| Este artefacto (4 capas parcheadas) | 26,40 B | no disponible | 8,739 GiB/sesión | Apache 2.0 | Experimental, no entrenado |
| Hermano de 3 capas (mencionado en la model card) | no disponible | no disponible | no disponible | no disponible | Experimental; 0,0398 nats mejor |
| Base `thinkingmachines/Inkling-2-Mini` | no disponible (origen del artefacto) | no disponible | 30,674 GiB/sesión | no disponible | Checkpoint oficial |

La información disponible no incluye comparaciones con modelos de otras familias (Qwen, Llama, Mistral, etc.), por lo que no es posible establecer una comparativa externa.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint no ha pasado por pretraining continuado, SFT ni RL; la sonda de curación son solo 32 pasos y 16.384 tokens. No debe usarse en producción tal cual.
- **Daño residual medible**: incluso tras la curación, la entropía cruzada en la porción propia es 0,0095 nats peor que el base, y el artefacto es 0,0398 nats peor que el hermano de tres capas, con las ocho ventanas favoreciendo a este último.
- **Sesgos**: no documentados en la información disponible; al derivar del base, hereda los sesgos de este, que tampoco se detallan.
- **Alucinación**: no se documenta una evaluación específica; el riesgo es el del modelo base más el daño residual del retrofit.
- **Idiomas**: no disponibles; no se especifica cobertura multilingüe.
- **Contexto**: las cifras a 1M de tokens son extrapolaciones exactas del diseño de cache medido tras un forward de 16 tokens, no un forward real de 1M de tokens.
- **Concurrencia**: la columna de sesiones concurrentes es un cálculo de presupuesto de KV que excluye pesos, expertos enrutados, activaciones y overhead de runtime; es una cota superior, no una capacidad de serving medida.
- **Licencia**: Apache 2.0 permite uso comercial, pero el estado experimental y la falta de entrenamiento hacen desaconsejable cualquier despliegue productivo.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True` y un operador `latent_kv` no estándar, lo que limita la portabilidad entre runtimes de inferencia.
- **Sensibilidad al harness**: la model card advierte que una lectura anterior de que el parche no repara provenía de un harness que reutilizaba una única ventana de 512 tokens por paso, sobre el que el modelo memorizaba la ventana y perdía 0,806 nats en texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RESMP-DEV/Inkling-2-Mini-MLA-LatentKV-Looping-4Layer-HealProbe
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales.
