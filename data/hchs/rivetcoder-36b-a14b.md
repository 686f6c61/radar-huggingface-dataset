# HCHs/RivetCoder-36B-A14B

## Resumen

RivetCoder-36B-A14B es un modelo experimental de código desarrollado por HCHs, un autor independiente, como derivado del modelo GLM-5.3-Flash de Z.ai. Se trata de una poda de expertos (expert pruning) que reduce el número de expertos enrutados de 288 a 24 por capa MoE, manteniendo la arquitectura híbrida, el componente multimodal, los expertos compartidos y una capa MTP (Multi-Token Prediction) del modelo original. El objetivo es obtener un modelo más ligero y orientado a tareas de programación, con aproximadamente 35.600 millones de parámetros totales y unos 14.000 millones activos por token (de ahí la nomenclatura A14B).

El modelo conserva la ventana de contexto configurada de 1.048.576 posiciones, lo que permite contextos largos de hasta 128K sin modificar la configuración. Solo se entrenaron los routers de cada capa MoE (404 pasos de optimización por capa), manteniendo congelados todos los demás pesos. Es un trabajo de investigación aplicada sobre eficiencia de modelos MoE, no un lanzamiento oficial de Z.ai, y su relevancia radica en explorar la viabilidad de podar grandes modelos MoE multimodales sin reentrenamiento completo, con licencia MIT y pesos públicos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM5-Next (atención híbrida, MoE, multimodal, MTP) |
| Parametros totales | 35.594.088.198 |
| Parametros activos | 13.951.479.558 (aprox. 14B por token) |
| Longitud de contexto | 1.048.576 posiciones configuradas |
| Tipos de cuantizacion | FP8/BF16 mixto nativo (heredado del modelo base) |
| Idiomas soportados | en, zh, ko |
| Licencia | MIT |
| Formato de pesos | safetensors (41 shards, 42,5 GB) |

## Arquitectura y entrenamiento

La arquitectura se basa en GLM-5.3-Flash, que combina atención híbrida (mezcla de mecanismos de atención densa y dispersa), capas MoE con expertos compartidos y enrutados, componentes multimodales (procesamiento de imagen y texto) y una capa de predicción multi-token (MTP). La poda reduce cada grupo MoE de 288 expertos enrutados a 24, de los cuales se activan los Top-4 por token junto con un experto compartido, sumando 5 FFN activos por capa dispersa. Se conservan las capas densas 0-2 y las capas dispersas 3-45, incluyendo la capa MTP en la posición 45.

El entrenamiento se limitó exclusivamente a los routers (`router.weight` y `router.e_score_correction_bias`) de cada capa dispersa. Se utilizó un corpus de selección compuesto por 112 documentos de código (65.726 tokens de contenido de asistente) generados por `qwen/qwen3.8-27b` y 16 documentos de control genérico (8.446 tokens). El objetivo de entrenamiento combinaba un ancla KL densa, proyección de las elecciones Top-8 del donante original, reconstrucción hard Top-4 con straight-through del delta GLM enrutado, balanceo de carga estabilizado con EMA y preservación de rutas genéricas. Todos los routers mejoraron respecto al warm-start en validación y test, con una reducción media de -0,6298 en el objetivo de validación y -0,6508 en test. No se entrenaron otros pesos, por lo que no hubo SFT, DPO ni RLHF.

## Capacidades

- Generación de texto y código: al ser un derivado podado de GLM-5.3-Flash, conserva las capacidades lingüísticas y de programación del modelo base, aunque no se han publicado evaluaciones end-to-end específicas.
- Multimodal: el modelo mantiene el stack multimodal original, por lo que puede procesar entradas de imagen y texto (pipeline `image-text-to-text`).
- MoE eficiente: activa solo 14B parámetros por token, lo que reduce el coste computacional frente a los 35,6B totales.
- MTP (Multi-Token Prediction): incluye una capa de predicción multi-token que podría mejorar la velocidad de inferencia si el runtime la soporta.
- Contexto largo: configuración de 1M posiciones, aunque no se ha validado su comportamiento real a 128K o 1M en esta versión podada.
- Soporte de tool calling y agentes: no se menciona en la documentación; el autor indica que estas capacidades requieren evaluación separada.
- Multilingüe: declarados inglés, chino y coreano.

## Casos de uso

- Generación de código en entornos con restricciones de VRAM: al activar solo 14B parámetros, es posible ejecutar el modelo en GPUs con menos memoria que el GLM-5.3-Flash original, aunque el peso completo requiere offload o multi-GPU.
- Asistente de programación con contexto largo: su ventana de 1M posiciones permite trabajar con repositorios completos o archivos muy extensos, útil para tareas de refactorización o revisión de código.
- Análisis de documentación técnica multimodal: al conservar el componente de imagen, puede procesar diagramas, capturas de pantalla o documentación visual junto con texto.
- Investigación sobre poda de expertos: sirve como caso de estudio para evaluar el impacto de reducir el número de expertos en un modelo MoE multimodal, con fines académicos o de desarrollo de técnicas de compresión.
- Prototipado de agentes de código: su soporte de MTP y su arquitectura híbrida podrían integrarse en pipelines experimentales de agentes, aunque no hay evidencia publicada de funcionamiento fiable.
- Despliegue en infraestructura con múltiples GPUs: con 39,56 GiB de pesos, puede distribuirse en configuraciones multi-GPU (por ejemplo, dos A100 de 40GB) sin necesidad de cuantización adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks end-to-end en la información disponible. La model card solo incluye métricas locales de reconstrucción del router (mejoras en el objetivo de validación y test, y NMSE de deltas), que no son comparables con evaluaciones estándar como MMLU, HumanEval o GSM8K. El autor indica explícitamente que la calidad de generación, el comportamiento en contexto largo, la calidad multimodal, el uso de herramientas y los benchmarks de ingeniería de software requieren evaluación separada.

## Requisitos de hardware

- VRAM estimada: el payload de pesos es de 39,56 GiB (42,5 GB). Una GPU de 16 GiB no puede alojar el checkpoint completo; se necesita offload a CPU/SSD o un entorno multi-GPU.
- GPUs recomendadas: al menos una GPU con 48 GB de VRAM (por ejemplo, A6000 o L40S) para inferencia con FP8 sin offload. Para mayor comodidad, dos A100 de 40 GB o una H100 de 80 GB.
- GPU de consumo: no cabe en GPUs consumer típicas (RTX 4090 de 24 GB, RTX 3090 de 24 GB) sin offload agresivo, lo que degradaría el rendimiento.
- Opciones de despliegue: Transformers con una versión reciente que implemente `model_type="glm5_next"`, o runtimes compatibles con GLM5-Next, FP8 nativo y configuración MoE podada. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la documentación.
- Latencia y throughput: no disponibles. El autor no proporciona mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| RivetCoder-36B-A14B | 35,6B | ~14B | 1M | MIT | Poda de GLM-5.3-Flash, solo routers entrenados |
| RivetCoder-9B-A4B | ~9B | ~4B | 128K | MIT | Versión más pequeña del mismo autor, misma técnica |
| GLM-5.3-Flash (base) | no disponible | no disponible | 1M | no disponible | Modelo original sin podar, 288 expertos |

No se dispone de comparativas de rendimiento con otros modelos de código porque no hay benchmarks publicados. La comparación estructural muestra que RivetCoder-36B-A14B es una versión reducida del modelo base, con un tercio de los parámetros activos, mientras que RivetCoder-9B-A4B es una alternativa más ligera con contexto de 128K.

## Limitaciones y advertencias

- Modelo experimental: no es un lanzamiento oficial de Z.ai; es un derivado de investigación con calidad no garantizada.
- Solo se entrenaron los routers: no hubo SFT, continuación de preentrenamiento, DPO ni RL, por lo que el comportamiento puede desviarse del modelo base.
- Degradación potencial fuera del dominio de código: la selección de expertos está orientada a programación, por lo que el rendimiento en otras tareas (matemáticas, razonamiento general, conversación) podría empeorar.
- Ambigüedad en expertos limítrofes: los expertos cercanos al umbral Top-24 son estadísticamente ambiguos, y la política de estabilidad estricta no se cumplió (el solapamiento típico fue 22/24 en lugar del mínimo requerido de 23/24); se aplicó una exención documentada.
- Sin evaluación end-to-end: no hay datos sobre calidad de generación, contexto largo, multimodalidad, tool use ni benchmarks de ingeniería de software.
- Requisitos de runtime específicos: necesita una implementación de GLM5-Next que soporte FP8 nativo, la configuración de 24 expertos, componentes multimodales y MTP; `trust_remote_code=True` no es suficiente porque el checkpoint no incluye implementación `auto_map`.
- Riesgo de alucinación y sesgos: no se han documentado, pero al ser un modelo derivado sin evaluación, se deben asumir los riesgos típicos de los LLM.
- Licencia MIT: permite uso comercial, pero al ser un modelo experimental, el usuario asume la responsabilidad de validar su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HCHs/RivetCoder-36B-A14B
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Versión más pequeña del mismo autor: https://huggingface.co/HCHs/RivetCoder-9B-A4B
- Versión GGUF de la versión pequeña: https://huggingface.co/HCHs/RivetCoder-9B-A4B-GGUF
