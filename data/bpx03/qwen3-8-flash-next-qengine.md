# bpx03/Qwen3.8-Flash-Next-QEngine

## Resumen

Qwen3.8-Flash-Next-QEngine es un repositorio de pesos cuantizados de Qwen3.8-Flash-Next, un modelo de lenguaje de Qwen, preparado específicamente para ejecutarse con QEngine, un motor de inferencia source-available desarrollado por bpx03. El repositorio, publicado por el usuario bpx03 en Hugging Face, parte de la cuantización INT4 de Intel (Intel/Qwen3.8-Flash-Next-W4A16-AutoRound) y reorganiza los pesos en el layout de capas que espera QEngine, de modo que no se necesita ningún paso de conversión previo.

El problema que resuelve es claro: hacer que un modelo de 74.219.774.099 parámetros (dato real de los safetensors) sea ejecutable en hardware consumer, concretamente en 3 NVIDIA RTX 3090 de 24 GB. Para ello combina cuantización W4A16 en los expertos enrutados, INT4 en proyecciones DeltaNet y n-gram, y una tabla de embeddings n-gram en INT8 que reduce su tamaño de 102,4 GB a 51,8 GB. Es relevante porque demuestra que modelos de más de 70 B parámetros pueden servir inferencia rápida (262 tok/s en pruebas del motor) en configuraciones de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con expertos enrutados (MoE), DeltaNet, atención QSA, hyper-conexiones y tabla n-gram (no disponible el detalle completo) |
| Parametros totales | 74.219.774.099 (dato de safetensors) |
| Parametros activos | no disponible (es MoE, pero no se publica el número de expertos activos) |
| Longitud de contexto | hasta 1M tokens (opcional, opt-in en QEngine 1.3); contexto estándar no disponible |
| Tipos de cuantizacion | W4A16 (INT4 pesos / BF16 activaciones en expertos enrutados), INT4 RTN grupo 128 (shared expert, DeltaNet, proyecciones n-gram), INT8 en motor para atención QSA y lm_head, BF16 para router, embeddings, norms y hyper-conexiones |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | safetensors (layout propio de QEngine; no compatible con Transformers, vLLM ni llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, un modelo de gran tamaño con arquitectura híbrida. A partir del material disponible, la arquitectura combina varios componentes: expertos enrutados (MoE) cuantizados a INT4 mediante AutoRound, un experto compartido, proyecciones DeltaNet (in_proj_qkv, z, out_proj) que sugieren capas de atención lineal tipo DeltaNet, proyecciones de clave/valor n-gram, atención QSA y hyper-conexiones. Incluye además una cabecera de predicción multi-token (MTP) utilizada para decodificación especulativa y una tabla de embeddings n-gram en INT8 (51,8 GB frente a 102,4 GB en BF16), cuya divergencia KL de siguiente token frente a la tabla BF16 quedó, según las pruebas de QEngine, por debajo del propio ruido de ejecución del motor.

El repositorio añade archivos auxiliares de enrutamiento (`expert_prior.bin`, `cold_experts.json`, `token_rank.bin`) con estadísticas de routing y vocabulario draft que QEngine usa para acelerar la inferencia. Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF o DPO) no hay información disponible en la model card.

## Capacidades

- Generación de texto e inferencia a alta velocidad: 262 tok/s en modo pinned y 250 tok/s con la tabla en page cache (mediciones de QEngine en configuración de 3 RTX 3090).
- Entrada de imagen (visión): soportada en QEngine 1.3.2 mediante la opción `--vision 1`.
- Decodificación especulativa mediante la cabecera multi-token-prediction (`mtp.safetensors` o `mtp-int4.safetensors`).
- Contexto extendido opcional de hasta 1M tokens con soporte de KV cache en RAM de host y archivo de conversaciones configurable.
- Soporte para agentes: system prompts fijados (pinned) para flujos multi-paso.
- Prefill acelerado en configuración de 2 tarjetas.
- Capacidades de código, matemáticas y tool calling: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de contexto muy largo: con el contexto opcional de 1M tokens y la KV cache en RAM de host, se pueden mantener conversaciones o sesiones de trabajo con documentos extensos sin recortar el historial.
- Agentes de larga duración: los system prompts fijados (pinned system prompts) de QEngine 1.3 están pensados para agentes que ejecutan flujos multi-paso manteniendo instrucciones estables.
- Análisis de documentos con imágenes: la entrada de visión (`--vision 1`) permite combinar texto e imágenes en la misma sesión, útil para revisar informes, capturas o diagramas.
- Inferencia local privada en estación de trabajo: la configuración de 3 RTX 3090 permite servir el modelo sin depender de APIs externas, adecuado para datos sensibles.
- Despliegue en servidores con RAM limitada: el modo disco (`FLASH_NGRAM_PIN=0`) permite funcionar con solo 12 GB de RAM de host, aceptando un 2x de penalización en velocidad (127 tok/s) para usuarios individuales.
- Prototipado de motores de inferencia: al ser un layout específico de QEngine, es un caso de estudio para quien investiga cuantización mixta W4A16, decodificación especulativa MTP y tablas n-gram INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas mediciones públicas son de rendimiento de inferencia del propio QEngine: 262 tok/s (modo pinned), 250 tok/s (page cache) y 127 tok/s (modo disco), con time-to-first-token de 0,22 s (pinned) frente a 1,7 s (disco).

## Requisitos de hardware

- VRAM: 3 NVIDIA RTX 3090 de 24 GB (72 GB totales); también funciona con 2 de ellas, aunque más lentamente. Se recomienda P2P GPU a GPU; sin él, el motor pasa por memoria de host fijada (pinned), con menor velocidad.
- RAM de host: unos 64 GB con la tabla n-gram INT8 (≈52 GB) fijada y archivo KV desactivado (`FLASH_KV_ARCHIVE_GB=0`); unos 80 GB con archivo de 16 GB; unos 110 GB con el archivo por defecto de 48 GB.
- Modo RAM baja: con `FLASH_NGRAM_PIN=0` y módulos abiertos de NVIDIA, el servidor puede limitarse a 12 GB de RAM, leyendo la tabla desde disco a través del page cache (requiere NVMe).
- Disco: unos 120 GB.
- Despliegue: exclusivamente con QEngine 1.3 o superior (recomendado 1.3.2). Los archivos no son compatibles con Transformers, vLLM, TGI ni llama.cpp.
- Rendimiento estimado: 262 tok/s y TTFT de 0,22 s en configuración recomendada; aproximadamente la mitad de velocidad en modo disco.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Motor requerido | Licencia |
|---|---|---|---|---|---|
| bpx03/Qwen3.8-Flash-Next-QEngine | 74,2 B (total) | W4A16 + INT8 (layout QEngine) | hasta 1M (opt-in) | QEngine 1.3+ | Qwen Community 1.0 |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 74,2 B (base) | W4A16 (AutoRound) | no disponible | estándar (Transformers/vLLM, presumiblemente) | no disponible |
| Qwen/Qwen3.8-Flash-Next | 74,2 B (base) | BF16 | no disponible | estándar | no disponible |

No hay alternativas de otros fabricantes con datos comparables suficientes en la informacion disponible.

## Limitaciones y advertencias

- Compatibilidad cerrada a un motor: los pesos solo funcionan con QEngine; no se pueden cargar con Transformers, vLLM ni llama.cpp, lo que limita la portabilidad y el ecosistema de herramientas.
- Requisito de hardware muy específico: la configuración objetivo son 3 RTX 3090; sin P2P entre GPUs o sin suficiente RAM, el rendimiento degrada notablemente (hasta 2x más lento y TTFT de 1,7 s).
- La tabla n-gram en INT8 introduce una desviación respecto a BF16; según el autor es inferior al ruido de ejecución del motor, pero no hay validación independiente.
- Sesgos conocidos, riesgo de alucinación y capacidades multilingües: no disponible en la informacion proporcionada.
- Licencia: los pesos derivan de Qwen3.8-Flash-Next y se distribuyen bajo la Qwen Community License 1.0; conviene revisar sus términos antes de cualquier uso comercial. QEngine tiene su propia licencia independiente.
- Datos de benchmarks de calidad del modelo no publicados: no es posible evaluar su rendimiento en tareas estándar con la informacion disponible.
- Repositorio de autor individual (bpx03) con 109 descargas y 3 likes: proyecto de comunidad sin respaldo institucional documentado más allá del checkpoint base de Intel.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bpx03/Qwen3.8-Flash-Next-QEngine
- Modelo base cuantizado: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia QEngine: https://github.com/bpx03/QEngine
- Licencia (enlace indicado en la model card): LICENSE dentro del repositorio
