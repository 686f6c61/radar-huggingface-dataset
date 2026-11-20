# lvkaokao/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound

## Resumen

Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound es una versión cuantizada del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario lvkaokao (vinculado a Intel, según el correo del firmante en la model card). Se trata de una cuantización de precisión mixta generada con Intel AutoRound mediante el método RTN (round-to-nearest), que combina MXFP4 para los expertos enrutados y MXFP8 para atención, atención lineal y expertos compartidos, manteniendo en BF16 las embeddings, el `lm_head`, la torre de visión, el MTP, el PLE y el router.

El modelo resuelve el problema clásico de desplegar un modelo de gran tamaño (unos 180 000 millones de parámetros) en infraestructura con memoria limitada: el repo ocupa 179,8 GB frente a los aproximadamente 360 GB que requeriría una copia en BF16. La evaluación publicada por el autor muestra una recuperación media del 99,58 % respecto al modelo original en PIQA, HellaSwag, MMLU y GSM8K, lo que lo hace relevante para quien necesite servir el modelo base con la mitad de memoria sin renunciar de forma apreciable a la calidad.

La ficha se centra en esta variante cuantizada; los detalles de entrenamiento del modelo base no están documentados en la información disponible y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención lineal, expertos enrutados y compartidos, MTP y PLE; tag `qwen4_exp` |
| Parametros totales | 179 999 981 459 (~180 000 M) |
| Parametros activos | no disponible (la model card menciona expertos enrutados, pero no publica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), MXFP8 (atención, atención lineal, expertos compartidos), BF16 (embeddings, `lm_head`, torre de visión, MTP, PLE, router); formato `compressed-tensors` / `llm_compressor` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 179,8 GB) |
| Metodo de cuantizacion | AutoRound (Intel), RTN, esquema mixto MXFP4/MXFP8 |
| Libreria | transformers (inferencia validada con vLLM 0.29.1rc1.dev528) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next más allá de los componentes que la receta de cuantización revela: atención estándar y atención lineal, una capa MLP con expertos enrutados (`mlp.experts`) y expertos compartidos (`mlp.shared_expert`), un router (`mlp.gate`, `mlp.shared_expert_gate`), proyecciones `in_proj_a`/`in_proj_b`, un `block_inject_weight`, un componente PLE, un módulo MTP (multi-token prediction) y una torre de visión (`visual`). La presencia conjunta de atención lineal, expertos y MTP apunta a una arquitectura híbrida orientada a eficiencia en inferencia, pero no se dispone de la configuración exacta de capas, dimensión oculta ni número de expertos.

Sobre el entrenamiento del modelo base no hay datos en la información proporcionada: se desconoce el volumen de tokens, la composición del dataset y si hubo RLHF o DPO. Lo que sí está documentado es el proceso de cuantización: AutoRound con `--model_free`, esquema base MXFP8 y `layer_config` que degrada `mlp.experts` a 4 bits en formato `mx_fp`, ignorando explícitamente `visual`, `lm_head`, `embed_tokens`, `mlp.gate`, `mlp.shared_expert_gate`, `in_proj_a`, `in_proj_b`, `block_inject_weight`, `ple`, `mtp` y `hyper_connection`. El resultado se exporta en formato `llm_compressor` compatible con `compressed-tensors`.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (`image-text-to-text`), gracias a la torre de visión conservada en BF16.
- Razonamiento: la receta de despliegue de vLLM incluye `--reasoning-parser qwen3`, lo que indica soporte de modo de razonamiento con formato Qwen3.
- Razonamiento matemático: GSM8K de 96,21 en la versión cuantizada.
- Comprensión lectora y conocimiento general: PIQA 82,26 y MMLU 86,26.
- Predicción multi-token (MTP) integrada en la arquitectura, útil para decodificación especulativa en vLLM.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes multimodales de atención al cliente: el modelo acepta imagen y texto en la misma conversación, por lo que puede procesar capturas de pantalla, fotos de producto o documentos escaneados junto con la consulta del usuario, manteniendo el diálogo multi-turno.
- Análisis de documentación técnica con imágenes: extracción y explicación de diagramas, gráficos y tablas en informes de ingeniería, aprovechando la torre de visión en BF16 y el razonamiento del modelo.
- Despliegue en clústeres con VRAM ajustada: al ocupar 179,8 GB en lugar de los ~360 GB de BF16, permite servir el modelo en 2×H100 80 GB o 3×A100 80 GB con cuantización de pesos, reduciendo el coste por réplica.
- Razonamiento matemático y resolución de problemas cuantitativos: con GSM8K de 96,21, es adecuado para tutoría automatizada, verificación de cálculos y generación de explicaciones paso a paso.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de esquemas MXFP4/MXFP8 frente a BF16 en un modelo de 180 000 M de parámetros, con datos publicados de recuperación por benchmark.
- Investigación en compresión de modelos: la receta de AutoRound publicada en la model card permite reproducir la cuantización y experimentar con configuraciones alternativas de `layer_config` para estudiar el impacto por tipo de capa.
- Prototipado de pipelines imagen-texto con vLLM: el despliegue documentado con `--language-model-only` y `--reasoning-parser qwen3` facilita montar un endpoint compatible con la API de OpenAI para pruebas de integración.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando BF16 con la versión MXFP4 mixta:

| Benchmark | BF16 | MXFP4 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 81,94 | 82,26 | 100,39 % |
| HellaSwag | 69,27 | 68,32 | 98,63 % |
| MMLU | 86,52 | 86,26 | 99,70 % |
| GSM8K | 96,74 | 96,21 | 99,45 % |
| Media | 83,62 | 83,26 | 99,58 % |

No se han publicado en la información disponible resultados de HumanEval, MATH, MMMU ni benchmarks multimodales, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 179,8 GB, por lo que se necesita al menos esa cantidad de memoria de GPU para cargar los pesos, más overhead de KV cache y activaciones.
- Configuración mínima realista: 3×A100 80 GB o 3×H100 80 GB; con 2×H100 80 GB (160 GB) no caben los pesos completos.
- GPU consumer: no cabe en ninguna GPU consumer actual (RTX 4090 24 GB, RTX 5090 32 GB) incluso con la cuantización mixta aplicada; requeriría una cuantización adicional a 4 bits uniforme no publicada en este repo.
- Despliegue recomendado: vLLM 0.29.1rc1.dev528+g9815732c1 con CUDA 13.0, aplicando el parche `patches/qwen38fn-ct-ple-dev528.patch` del repo `intel-ai/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound` (revisión `b8b636986747fb91193d76a16f6eff62ba5b696f`).
- Comando de servicio documentado: `vllm serve intel-ai/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound --dtype bfloat16 --language-model-only --reasoning-parser qwen3`.
- llama.cpp / Ollama / TGI: no disponible; el formato `compressed-tensors` y la dependencia de un parche específico de vLLM limitan las alternativas de despliegue.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound (este) | ~180 000 M | no disponible | MXFP4/MXFP8 mixta | MIT | Hugging Face, vLLM con parche |
| Qwen/Qwen3.8-Flash-Next (base) | ~180 000 M | no disponible | BF16 | no disponible en la información | Hugging Face |
| intel-ai/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound | ~180 000 M | no disponible | MXFP4/MXFP8 mixta | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer comparaciones con modelos de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de información veraz sin verificación.
- Riesgo de sesgos y contenido ofensivo heredado del modelo preentrenado y de los datasets de ajuste; se recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- La cuantización introduce una pérdida media del 0,42 % en los benchmarks evaluados, con la mayor caída en HellaSwag (98,63 % de recuperación); el impacto en tareas multimodales, de código o de contexto largo no está medido.
- El despliegue depende de una build concreta de vLLM (0.29.1rc1.dev528) y de la aplicación manual de un parche; esto complica la reproducibilidad y la actualización a versiones posteriores.
- El flag `--language-model-only` en el ejemplo de vLLM desactiva la torre de visión, por lo que el ejemplo documentado no cubre el caso multimodal completo.
- Idiomas soportados no documentados: no es posible confirmar la calidad en castellano ni en otras lenguas distintas del inglés.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- La licencia MIT se aplica a esta variante según la model card, pero el autor remite a la licencia del modelo original; conviene verificar las condiciones del modelo base antes de un uso comercial.
- El autor declara que la licencia no constituye asesoramiento legal y recomienda consultar a un abogado antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lvkaokao/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de referencia de la cuantización: https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound
- AutoRound (GitHub): https://github.com/intel/auto-round
- Intel Neural Compressor (GitHub): https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Wheels de vLLM para CUDA 13.0: https://wheels.vllm.ai/9815732c16ca076c60b65fccd787167d6a9c5328/cu130
