# sergolsub/drex-v1.5-9B-MLX-8bit

## Resumen

drex-v1.5-9B-MLX-8bit es una conversión a 8 bits en formato MLX del modelo base nace-ai/drex-v1.5, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales se cuantizan a 8 bits sin cambios de arquitectura, con el objetivo de reducir el espacio en disco y la memoria residente para inferencia local en Macs con chip M-series. El repositorio incluye tanto los pesos como el código de carga (`drex_mlx.py`) y utilidades de cabecera de decisión (`head.pt`, `decision_config.json`).

El modelo deriva de la familia Qwen3.5 (el campo `qwen3_5_text` aparece en los tags de Hugging Face) y cuenta con 8.953.803.264 parámetros totales según el índice de safetensors, lo que lo sitúa en la categoría de 9B. La model card documenta un modo de uso orientado a "decisiones" estructuradas (tipos `noul`, `choice` y `score`) sobre texto de entrada, con latencias medidas en un Mac mini M4 Pro de 48 GB. La licencia es la NACE AI OpenRAIL-M (modificada), heredada del modelo upstream.

La relevancia actual radica en que ofrece una vía práctica para desplegar un modelo de ~9B en hardware de consumo Apple con un consumo de memoria medido de aproximadamente 11,3 GB en pico, manteniendo una calidad declarada idéntica a la versión bf16 en las evaluaciones internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (tag `qwen3_5_text`); incluye capas con `linear_attn` según el audit de cuantización |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); se compara contra los pesos bf16 originales |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m-license-modified (OpenRAIL-M modificada) |
| Formato de pesos | safetensors (layout MLX, 4 shards) + `head.pt` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base nace-ai/drex-v1.5, del que se indica únicamente que pertenece a la familia Qwen3.5 (`qwen3_5_text`). El audit de cuantización incluido en el repositorio (`kl_audit.json`) revela la presencia de capas de atención lineal (`model.language_model.layers.0.linear_attn.in_proj_a.weight`), lo que sugiere un diseño híbrido con mecanismos de atención lineal junto a atención estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Esta publicación concreta no entrena ni modifica el modelo: aplica cuantización a 8 bits sobre los pesos bf16 originales. El autor documenta una auditoría tensor a tensor (427 tensores comparados, histograma KL de 512 bins) con un KL medio de 3,84e-04 y un máximo de 5,47e-03, localizado en la capa `linear_attn.in_proj_a` de la capa 0. Adicionalmente, el repositorio incorpora una cabecera de decisión (`head.pt`, 8 MB) y ficheros de configuración (`decision_config.json`, `joint_config.json`) para el modo de decisión estructurada.

## Capacidades

- Generación de texto y procesamiento de lenguaje natural sobre el modelo base Qwen3.5 subyacente.
- Modo de decisión estructurada con tres tipos de tarea: `noul` (respuesta binaria sí/no), `choice` (clasificación entre criterios definidos) y `score` (puntuación sobre una lista de criterios ordenados).
- Inferencia en Apple Silicon mediante `mlx_lm`, con API Python propia (`Drex.decide(texto, especificacion)`).
- Procesamiento de texto de entrada de al menos 512 tokens en las pruebas documentadas.
- Soporte de plantilla de chat (`chat_template.jinja`).
- No soporta imagen (512x512) ni detección de cajas ("box"), según las pruebas del autor.
- Tool calling, function calling, agentes multi-step, vision, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar una consulta entrante entre equipos (por ejemplo, `billing` frente a `shipping`) usando el tipo `choice`, con una latencia mediana de decisión de 431 ms medida en M4 Pro.
- Detección de intención de reembolso: con el tipo `noul` se responde a preguntas binarias como "¿el cliente quiere un reembolso?" sobre el texto del ticket, adecuado para enrutado automático en sistemas de atención al cliente.
- Priorización de incidencias: el tipo `score` permite puntuar la severidad de un error (por ejemplo, `cosmetic`, `annoying`, `blocks`) y ordenar la cola de trabajo de un equipo de operaciones.
- Clasificación de errores de infraestructura: mensajes como "disk quota exceeded on the worker" pueden evaluarse con criterios predefinidos para decidir escalado o resolución automática.
- Procesamiento por lotes en local: con 5,69 decisiones cortas por segundo sostenidas en M4 Pro, sirve para clasificar grandes volúmenes de mensajes sin depender de la nube.
- Prototipado y evaluación en equipos con Mac: al ocupar 10,47 GB en disco y 11,29 GB de memoria pico, permite iterar sobre pipelines de decisión en portátiles y mini-PC Apple sin GPU dedicada.
- Verificación de integridad de despliegues: los checksums SHA-256 publicados por fichero permiten validar descargas antes de integrarlas en entornos controlados.

## Benchmarks y rendimiento

Evaluaciones internas del autor (Mac mini M4 Pro 48 GB, MLX 8-bit) frente a bf16:

| Metrica | 8-bit | bf16 |
|---|---|---|
| Accuracy | 78,4% | 78,4% |
| Noul | 84,6% | 84,6% |
| Choice | 80,0% | 80,0% |
| Score | 66,7% | 66,7% |
| Calibration PPL | 2,068 | 2,053 |
| Decision Index 0.4.1 | 49,17 | no disponible |

Rendimiento medido en el mismo equipo:

| Metrica | Valor |
|---|---|
| Carga del modelo | 4,96 s (4,86 s en la medición de disco) |
| RSS pico | 11,31 GB (11,29 GB en la medición de disco) |
| Texto 512 tokens (404 tok, media de 5 tras 3 warm-up) | binary 1121 ms · multichoice 1204 ms · score 1121 ms |
| Latencia mediana de decisión | 431 ms |
| Decisiones cortas sostenidas | 5,69/s |
| Imagen 512x512 | no soportada |
| Box | no soportada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: aproximadamente 11,3 GB de memoria residente pico medidos en inferencia MLX 8-bit.
- Espacio en disco: 10,47 GB para el repositorio completo.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente, al ser un formato MLX orientado a Apple Silicon; no hay datos de despliegue en CUDA.
- Cabe en GPU de consumo Apple: sí, en equipos con al menos ~16 GB de memoria unificada (estimación basada en el RSS pico de 11,3 GB; no confirmado por el autor para configuraciones menores).
- Opciones de despliegue: `mlx_lm` y el cargador propio `drex_mlx.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: mediana de 431 ms por decisión y 5,69 decisiones cortas por segundo en M4 Pro 48 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks públicos ni de comparaciones directas con otros modelos en la información proporcionada. Como referencia estructural, el modelo base pertenece a la familia Qwen3.5 (~9B), pero no se han publicado métricas comparativas frente a otras variantes de esa familia ni frente a alternativas de tamaño equivalente.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| sergolsub/drex-v1.5-9B-MLX-8bit | 8,95B | no disponible | OpenRAIL-M modificada | safetensors MLX 8-bit |
| nace-ai/drex-v1.5 (upstream) | no disponible (base del anterior) | no disponible | OpenRAIL-M modificada | no disponible (presumiblemente bf16) |
| Alternativas de ~9B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una conversión cuantizada, no un modelo nuevo: cualquier limitación del modelo upstream nace-ai/drex-v1.5 se hereda, incluidas posibles restricciones de uso.
- La licencia OpenRAIL-M modificada impone restricciones de uso (típicamente prohibiciones sobre usos dañinos y requisitos de atribución); debe revisarse el fichero LICENSE antes de uso comercial.
- No hay información sobre idiomas soportados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés de los ejemplos.
- No se ha publicado la longitud de contexto, lo que impide planificar despliegues con documentos largos.
- No soporta entrada de imagen ni detección de cajas, pese a que el modelo base pudiera tener capacidades multimodales.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de decisión binaria o de clasificación el impacto puede ser menor, pero no se han publicado evaluaciones de calibración fuera del conjunto interno del autor.
- La evaluación de calidad (78,4% de accuracy) procede de pruebas internas del autor, no de benchmarks públicos independientes.
- El rendimiento medido corresponde a un único equipo (Mac mini M4 Pro 48 GB); no hay datos para otros chips Apple ni para GPUs dedicadas.
- El repositorio incluye código Python (`drex_mlx.py`, `code/kev/*`) que debe auditarse antes de ejecutarlo en entornos de producción.
- El campo `pipeline` no está definido en Hugging Face, lo que puede afectar a la integración automática con herramientas que dependan de esa etiqueta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-8bit
- Modelo base upstream: https://huggingface.co/nace-ai/drex-v1.5
- Librería MLX: https://github.com/ml-explore/mlx
- Documentación de `mlx_lm`: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Licencia OpenRAIL-M (referencia general): https://www.licenses.ai/blog/2022/8/26/bigscience-open-rail-m-license
- Auditoría de cuantización incluida en el repo: `kl_audit.json` (https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-8bit/blob/main/kl_audit.json)
- Fichero de licencia: https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-8bit/blob/main/LICENSE
