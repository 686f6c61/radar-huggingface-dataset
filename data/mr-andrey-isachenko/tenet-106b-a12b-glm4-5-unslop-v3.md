# mr-andrey-isachenko/Tenet-106B-A12B-GLM4.5-Unslop-v3

## Resumen

Tenet-106B-A12B-GLM4.5-Unslop-v3 es un ajuste fino del modelo `zai-org/GLM-4.5-Air`, desarrollado por el autor independiente mr-andrey-isachenko bajo el paraguas del proyecto Tenet. El modelo parte de la arquitectura GLM-4.5-Air (un transformer con mezcla de expertos) y aplica una intervención quirúrgica sobre los mecanismos de rechazo del modelo base, seguida de un pase de optimización de preferencias orientado a eliminar patrones estilísticos no deseados. Se distribuye como un checkpoint en FP8 (E4M3) listo para despliegue en vLLM y proveedores compatibles con OpenRouter.

El problema que aborda es doble: por un lado, los rechazos falsos positivos del modelo base ante peticiones benignas (por ejemplo, análisis de logs o generación de SQL); por otro, la deriva estilística que el autor denomina «slop» (prosa ampulosa, preámbulos moralizantes, vocabulario recargado). La propuesta técnica es el motor Lancet, que realiza una cirugía de subespacio con preservación de norma en las proyecciones de entrada y salida, en lugar de la ablación ingenua de la dirección de rechazo.

El modelo tiene 110.468.824.832 parámetros totales según los safetensors del repositorio, con 12B activos según la nomenclatura A12B del nombre, y se publica bajo licencia Apache 2.0. El repositorio ocupa 221 GB e incluye telemetría Strata y exportaciones GGUF. Es relevante para quienes necesitan un modelo de gran tamaño con tool calling fiable y sin rechazos espurios en entornos de agentes y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (GLM-4.5-Air), etiqueta `glm4_moe` |
| Parametros totales | 110.468.824.832 |
| Parametros activos | 12B (según nomenclatura A12B del nombre; no confirmado en la model card) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de despliegue con `--max-model-len 32768`; no se especifica el máximo nativo) |
| Tipos de cuantizacion | FP8 (E4M3) como formato principal; GGUF disponible según tags; el README menciona «llama.cpp CKA-Quant» |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3), GGUF, MLX (según la model card) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GLM-4.5-Air, un transformer con mezcla de expertos identificado con la etiqueta `glm4_moe`. Sobre esa base, el autor aplica el motor Lancet, descrito como una cirugía de subespacio con preservación de norma y proyección bidireccional: la dirección de rechazo se identifica tanto en la proyección de entrada (residual stream) como en la de salida (unembedding), se elimina en ambas direcciones y se restaura exactamente la norma residual para mantener las magnitudes de activación y las distribuciones de tokens posteriores dentro de la variedad original. El autor afirma que el 96,4 % de los expertos quedan intactos tras la intervención.

Tras la cirugía se ejecuta un pase de GRPO («gated unslop GRPO») con recompensas que penalizan patrones de slop únicamente en las regiones donde la cirugía debilitó los circuitos de rechazo, con el objetivo de reforzar el razonamiento y la capacidad de código del modelo base en lugar de dañarlos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RLHF o DPO original del modelo base. El modelo se exporta como checkpoint FP8 (E4M3) sin código personalizado, sin `trust_remote_code` y sin `auto_map`, lo que facilita su integración directa en vLLM, OpenRouter, GGUF y MLX.

## Capacidades

- Generación de texto conversacional y razonamiento estructurado, heredados del modelo base GLM-4.5-Air.
- Tool calling y function calling, con énfasis declarado en la validez de esquema de las llamadas (el ejemplo de la model card muestra una llamada SQL a DuckDB correctamente formateada).
- Uso en flujos agénticos y razonamiento multi-paso, etiquetado explícitamente como «agentic» y «tool-use».
- Generación de código y consultas SQL, con anclaje de herramientas declarado como preservado tras la cirugía.
- Reducción de rechazos falsos positivos en peticiones benignas (análisis de logs, consultas de seguridad defensiva).
- Mitigación de deriva estilística: supresión de preámbulos moralizantes y vocabulario recargado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking), visión o audio: no disponibles en la información proporcionada.
- Decodificación especulativa: la model card menciona telemetría Strata H22 de pases de decodificación especulativa, pero sin valores publicados.

## Casos de uso

- Triaje de logs de seguridad y generación de SQL: el modelo produce llamadas a herramientas con esquema válido (por ejemplo, consultas DuckDB sobre logs de autenticación) sin rechazos espurios, lo que lo hace adecuado para pipelines de AppSec y DevOps donde el modelo base fallaría por sobre-rechazo.
- Asistentes de código en producción: al conservar el anclaje de tool calling y código del modelo base, puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests y consultas a bases de datos.
- Agentes multi-paso con herramientas: su orientación agéntica y la validez de esquema en las llamadas permiten encadenar pasos de razonamiento y ejecución de herramientas en orquestadores tipo OpenRouter o vLLM.
- Atención al cliente automatizada: con contexto de hasta 32.768 tokens en el ejemplo de despliegue, puede gestionar conversaciones multi-turno y documentos largos sin los preámbulos moralizantes que degradan la experiencia.
- Análisis de documentación técnica y resúmenes: la reducción de slop estilístico produce salidas más directas y útiles para resúmenes de logs, informes y documentación.
- Evaluación comparativa de técnicas de ablación: investigadores que estudien alineación y rechazo pueden usar el modelo junto con la telemetría Strata y el inspector de FP8 y abliteración para comparar cirugía de subespacio frente a ablación ingenua.
- Despliegue en proveedores compatibles con OpenRouter: el checkpoint FP8 está pensado para exportarse directamente a proveedores sin código personalizado, lo que simplifica su publicación como endpoint.

## Benchmarks y rendimiento

La model card define las métricas H9 (retención de rechazo y slop, menor es mejor), H10 (retención de capacidades downstream, mayor es mejor) y H11 (robustez a la cuantización FP8, mayor es mejor), pero todas las celdas de las tablas aparecen como `n/a`. La tabla comparativa «Why Tenet instead of Naive Abliteration?» también contiene únicamente guiones. La telemetría Strata publica un único valor: `untouched_expert_ratio` = 96,4 %; el resto de campos (`expert_cache_hit_rate`, `coactivation_graph_drift`, `speculative_acceptance_rate`, `peak_host_ram_mb`) figuran como `n/a`.

| Métrica | BF16 | FP8 (E4M3) | Abliteración ingenua |
|---|---|---|---|
| H9 (rechazo y slop) | n/a | n/a | n/a |
| H10 (retención de capacidades) | n/a | n/a | n/a |
| H11 (robustez FP8) | n/a | n/a | n/a |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 110.468.824.832 parámetros, el checkpoint FP8 (E4M3) requiere aproximadamente 110 GB solo para pesos, más overhead de activaciones y caché KV; en BF16 serían unos 220 GB. No se publican cifras oficiales de VRAM en la model card.
- GPU recomendadas: para FP8 se necesitan GPUs con soporte nativo de FP8, como H100 o H200; en A100 (sin FP8 nativo) habría que recurrir a BF16 o a una cuantización adicional. Para BF16 se requieren varios aceleradores de 80 GB.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, 24 GB) en FP8 ni en BF16; solo sería viable mediante cuantizaciones GGUF agresivas y offloading a RAM/CPU, con latencia muy alta.
- Opciones de despliegue: vLLM con `--quantization fp8`, Transformers con `device_map="auto"`, llama.cpp (GGUF, con la variante «CKA-Quant» mencionada) y MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-106B-A12B-GLM4.5-Unslop-v3 | 110,5B totales / 12B activos | 32.768 (ejemplo de despliegue) | Apache 2.0 | Ajuste con cirugía Lancet y GRPO; FP8 E4M3 |
| zai-org/GLM-4.5-Air (base) | 12B activos (MoE) | no disponible | no disponible en esta ficha | Modelo base sin intervención; presenta rechazos falsos positivos y slop según el autor |
| Abliteración ingenua de GLM-4.5-Air | 12B activos (MoE) | no disponible | no disponible en esta ficha | Referencia de comparación del autor; rompe la validez de esquema en tool calls según la model card |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está destinado ni ajustado para operaciones cibernéticas ofensivas, generación de malware ni contenido ilícito; esos usos quedan fuera de alcance.
- La eliminación quirúrgica de la dirección de rechazo puede degradar la calibración de seguridad del modelo base en dominios no cubiertos por el entrenamiento; no se publican métricas de seguridad independientes.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de veracidad; el ajuste con GRPO sobre recompensas estilísticas no garantiza mejora factual.
- Idiomas soportados no documentados; no hay evidencia publicada sobre el comportamiento multilingüe tras la cirugía.
- Todos los benchmarks de la model card están vacíos (`n/a`), por lo que las afirmaciones de retención de capacidades y robustez FP8 no están respaldadas por cifras verificables en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base GLM-4.5-Air antes de un uso comercial, ya que la información proporcionada no detalla su licencia.
- El tamaño del repositorio (221 GB) y el requisito de FP8 limitan su despliegue a infraestructura con GPUs de datacenter.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-106B-A12B-GLM4.5-Unslop-v3
- Modelo base: https://huggingface.co/zai-org/GLM-4.5-Air
- Repositorio de código y informe técnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Inspector interactivo de FP8 y abliteración: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Colección de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
- Telemetría Strata: `strata.toml` en el repositorio del modelo
