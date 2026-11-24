# Premchan369/Q-TensorFormer

## Resumen

Q-TensorFormer es un modelo de lenguaje para generación de texto publicado en Hugging Face por Premchan369 (V C Premchand Yadav) junto con Dr. Madala Guru Brahmam, ambos vinculados a la School of Computer Science and Engineering de la VIT-AP University (India). El modelo se presenta como un trabajo de investigación orientado a inferencia de altas prestaciones en entornos *edge*, combinando atención con Grouped-Query Attention (GQA) y Rotary Position Embeddings (RoPE) con un mecanismo propietario de segmentación dinámica de rangos Tensor-Train denominado Zero-SVD, junto con control adaptativo basado en estabilidad de Lyapunov.

El problema que aborda es el de la inferencia de modelos generativos bajo restricciones severas de memoria, ancho de banda y térmicas, típicas de dispositivos *edge* como Jetson Orin, Jetson Thor, Raspberry Pi o Apple Silicon. La propuesta técnica consiste en ajustar dinámicamente el rango de descomposición Tensor-Train de las capas según la entropía del contexto y el margen térmico disponible, reduciendo cómputo en tokens predecibles (puntuación, texto de baja perplejidad) y aumentándolo en tokens de razonamiento.

El modelo se distribuye con licencia Apache 2.0, únicamente en inglés, con un repositorio de tamaño prácticamente nulo (0.0 GB) en el momento de la consulta, lo que sugiere que los pesos publicados no están disponibles en el Hub o son de un tamaño muy reducido. La model card incluye documentación extensa, un *paper* IEEE de seis páginas, manuscritos LaTeX para IEEE Transactions y NeurIPS, y referencias a adaptadores para vLLM y TensorRT-LLM, así como a un *checkpoint* canónico en `checkpoints/qtensorformer_canonical_trained.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (GQA), Rotary Position Embeddings (RoPE) y segmentación dinámica Tensor-Train (Zero-SVD) |
| Parametros totales | no disponible (la model card menciona una variante "tiny" en los ejemplos de código, sin cifra publicada) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan KV-cache quantization y soporte ONNX/ONNX Runtime, sin detallar formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag del repositorio); también se referencia un checkpoint PyTorch `.pt` en `checkpoints/qtensorformer_canonical_trained.pt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención de tipo Grouped-Query Attention y RoPE, sobre el que se aplica una descomposición Tensor-Train (TT) de las matrices de pesos. La innovación central, Zero-SVD Dynamic Tensor-Train Slicing, consiste en seleccionar dinámicamente el rango TT de cada capa en función de la entropía del contexto y del margen térmico del hardware, de modo que los tokens de alta entropía (razonamiento, matemáticas) reciben rangos mayores y los de baja entropía (puntuación, texto predecible) rangos menores. Este control se formaliza, según la documentación, mediante funciones de Lyapunov que garantizan estabilidad del bucle de adaptación, y se complementa con bandits contextuales para la política de selección de rango.

El entrenamiento se realizó, según los *tags* y la model card, sobre los datasets Wikitext y OpenWebText, con métricas declaradas de perplejidad, latencia y throughput. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La model card menciona integración con técnicas de *speculative decoding*, *paged attention*, *continuous batching*, *attention sinks* y cuantización de KV-cache, así como adaptadores para vLLM y TensorRT-LLM, pero no se detallan los detalles de implementación ni los resultados de ablación.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento de tipo *chain-of-thought* (los *tags* referencian DeepSeek-R1 y GSM8K como inspiración y benchmark objetivo).
- Ajuste dinámico del cómputo por token mediante segmentación de rangos Tensor-Train (adaptive computation).
- Soporte de *continuous batching* y *paged attention* a través de un adaptador vLLM incluido en el repositorio (`src/vllm_adapter.py`).
- Soporte de *speculative decoding* y cuantización de KV-cache (declarado en los *tags*).
- Exportación a ONNX y ejecución con ONNX Runtime (declarado en los *tags*).
- Servido mediante API REST compatible con OpenAI, con streaming SSE y FastAPI (declarado en los *tags*).
- Telemetría de hardware y optimización de eficiencia energética (declarado en los *tags*).
- Capacidades multilingües: limitadas al inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión, audio: no disponible.

## Casos de uso

- Inferencia en dispositivos *edge* con restricciones térmicas: el modelo está diseñado para ajustar el rango Tensor-Train según el margen térmico disponible (por ejemplo, `hardware_thermal_margin_c=14.2` en el ejemplo de la model card), lo que lo hace adecuado para despliegues en Jetson Orin, Jetson Thor o Raspberry Pi donde la disipación es limitada.
- Servido de altas prestaciones con vLLM: el adaptador `VLLMContinuousBatchingAdapter` permite planificar rangos TT por secuencia en función de la entropía, útil en entornos con múltiples peticiones concurrentes y presupuestos de latencia estrictos (por ejemplo, `target_latency_budget_ms=20.0`).
- Razonamiento con presupuesto variable: la asignación dinámica de rangos permite dar más cómputo a tokens de razonamiento (rank 16 en el ejemplo) y menos a puntuación (rank 4), lo que encaja en pipelines de generación de código o matemáticas donde solo una fracción de los tokens requiere capacidad plena.
- Integración en servicios compatibles con OpenAI: al declarar API REST con FastAPI y streaming SSE, puede desplegarse como *backend* de un asistente conversacional sin necesidad de adaptar el cliente.
- Prototipado en Google Colab: la model card incluye un *notebook* de inicio rápido (`notebooks/quickstart.ipynb`) y un *Space* interactivo, lo que facilita la evaluación preliminar por parte de investigadores.
- Investigación en compresión de modelos: la combinación de descomposición Tensor-Train, Zero-SVD y control de Lyapunov lo convierte en una plataforma para estudiar políticas de cómputo adaptativo y estabilidad en bucles de control de inferencia.
- Evaluación de eficiencia energética: los *tags* de *green AI*, telemetría de hardware y eficiencia energética sugieren su uso en estudios comparativos de consumo en *edge* frente a modelos densos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas declaradas (perplejidad, latencia, throughput) y referencias a GSM8K, pero no incluye cifras concretas ni tablas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo no se declara; el repositorio ocupa 0.0 GB, lo que impide estimar).
- GPU recomendadas: la model card menciona explícitamente NVIDIA Hopper H100, Blackwell B200, Jetson Orin y Jetson Thor como plataformas objetivo; también Apple Silicon y Raspberry Pi en los *tags*.
- Cabe en GPU de consumo: no disponible; el ejemplo de código usa `torch.float16` y una variante "tiny", lo que sugiere que una configuración reducida podría caber en GPU de consumo, pero no se confirma.
- Opciones de despliegue: vLLM (adaptador incluido), NVIDIA TensorRT-LLM, ONNX Runtime, PyTorch con `transformers` y `trust_remote_code=True`, API REST compatible con OpenAI vía FastAPI.
- Latencia y throughput estimados: no disponible; solo se menciona un presupuesto de latencia objetivo de 20 ms en el ejemplo del adaptador vLLM, sin cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Q-TensorFormer | no disponible | no disponible | Apache 2.0 | Hugging Face (repo 0.0 GB) |
| SmolLM2 | no disponible en la información | no disponible | no disponible | Hugging Face (referenciado en *tags*) |
| Qwen2.5 | no disponible en la información | no disponible | no disponible | Hugging Face (referenciado en *tags*) |
| Llama 3.2 | no disponible en la información | no disponible | no disponible | Hugging Face (referenciado en *tags*) |

Los *tags* del repositorio referencian SmolLM2, Qwen2.5 y Llama 3.2 como modelos comparables o inspiradores, pero no se aportan datos de rendimiento ni de tamaño que permitan una comparación cuantitativa. No disponible información adicional para completar la comparativa.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- No se han publicado resultados de benchmarks verificables (MMLU, HumanEval, GSM8K) en la información disponible, por lo que el rendimiento real es desconocido.
- El repositorio ocupa 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente publicados o son de un tamaño muy reducido; conviene verificar la integridad de los archivos antes de un despliegue en producción.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del autor; debe auditarse antes de usar en entornos sensibles.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados; el entrenamiento sobre Wikitext y OpenWebText puede introducir sesgos propios de corpus web en inglés.
- La licencia Apache 2.0 permite uso comercial, pero la model card no detalla restricciones adicionales sobre los datos de entrenamiento ni sobre los *checkpoints* derivados.
- Las afirmaciones de estabilidad de Lyapunov y de ganancias de throughput no están respaldadas por tablas de resultados en la información proporcionada; deben tratarse como propuestas teóricas hasta su verificación independiente.
- El uso de control adaptativo basado en margen térmico implica dependencia del hardware; el comportamiento puede variar entre plataformas no listadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Premchan369/Q-TensorFormer
- Paper IEEE (PDF): https://huggingface.co/Premchan369/Q-TensorFormer/resolve/main/paper/q_tensorformer_ieee_paper.pdf
- Space interactivo: https://huggingface.co/spaces/Premchan369/Q-TensorFormer
- Documentación: https://premchan369.github.io/Q-TensorFormer/
- Notebook de inicio rápido en Colab: https://colab.research.google.com/github/Premchan369/Q-TensorFormer/blob/main/notebooks/quickstart.ipynb
- Checkpoint canónico: https://huggingface.co/Premchan369/Q-TensorFormer/tree/main/checkpoints
- Repositorio GitHub (referenciado en los enlaces de la model card): https://github.com/Premchan369/Q-TensorFormer
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
