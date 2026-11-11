# nota-ai/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Global-Pruned-40

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Global-Pruned-40 es una variante podada del modelo multimodal NVIDIA Nemotron 3.5 Super VL, publicada por Nota AI. Se trata de un transformer de tipo Mixture of Experts (MoE) con arquitectura híbrida (etiqueta `nemotron_h_omni`), orientado a tareas de image-text-to-text, es decir, entrada conjunta de imagen y texto y salida de texto. El modelo original de NVIDIA se distribuye cuantizado en NVFP4; esta versión aplica una poda no uniforme de expertos enrutados, eliminando el 40 % de ellos sin reentrenamiento, y reduce el checkpoint de 70 GiB a 46 GiB.

La relevancia de esta ficha radica en que ilustra una técnica de compresión agresiva sobre un MoE multimodal de gran tamano: el número de parámetros totales declarado en safetensors es de 43.187.699.210 (unos 43,2 mil millones), frente a los 120B nominales del modelo base, coherente con la poda de expertos. El modelo conserva las capacidades multimodales, de razonamiento y de tool calling del original, y añade dos técnicas propietarias de Nota AI (Language-Following Expert Preservation y Language-Following Weight Editing) para mitigar la degradación en idiomas distintos del inglés, en particular el coreano.

El modelo se sirve con vLLM 0.31.0 aplicando un parche que permite capas MoE con distinto número de expertos, y está pensado para despliegue en hardware Blackwell (B200/GB200) en una sola GPU gracias a la cuantización NVFP4. La licencia es OpenMDW 1.1, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido multimodal (etiqueta `nemotron_h_omni`; incluye componentes Mamba/SSM segun los argumentos de servicio) |
| Parametros totales | 43.187.699.210 (safetensors); modelo base nominal 120B con 12B activos |
| Parametros activos | 12B (según el nombre del modelo base: A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (8-bit, `modelopt_mixed` segun tags) |
| Idiomas soportados | no disponibles de forma oficial; evaluado en inglés y coreano |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | safetensors (repo de 49.6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con componentes híbridos (la etiqueta `nemotron_h_omni` y los argumentos de vLLM `--mamba-backend`, `--mamba-ssm-cache-dtype` y `--enable-mamba-shared-prefix-checkpoint` indican la presencia de capas Mamba/SSM junto a la atención). El modelo original tiene 512 expertos por capa MoE; tras la poda, el número de expertos enrutados baja de 20.480 a 12.288, con entre 272 y 312 expertos por capa, excepto las capas 1, 3, 85 y 87, que conservan los 512 expertos completos. El número exacto por capa se expone en `num_experts_per_layer` dentro de `config.json`.

No hay reentrenamiento: la poda se aplica directamente sobre los pesos NVFP4 del checkpoint original. Nota AI emplea una poda no uniforme basada en clustering de expertos, complementada con dos técnicas propias: Language-Following Expert Preservation (preservación de expertos relevantes para el seguimiento del idioma de la consulta) y Language-Following Weight Editing (edición de pesos para reforzar la coherencia lingüística). El resultado es un checkpoint de 46 GiB frente a los 70 GiB del original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline `image-text-to-text`) y produce respuestas textuales.
- Razonamiento configurable por petición mediante `chat_template_kwargs` (por ejemplo, `{"enable_thinking": false}`), con parser de razonamiento `nemotron_v3`.
- Tool calling / function calling: habilitado con `--enable-auto-tool-choice` y parser `qwen3_coder`.
- Decodificación especulativa con MTP (Multi-Token Prediction) y 5 tokens especulativos.
- Procesamiento de vídeo con parámetros configurables (`--video-pruning-rate 0.5`, `fps` y `num_frames`).
- Capacidades multilingües evaluadas en inglés y coreano, con mejora explícita de la consistencia lingüística en coreano (76,2 % → 90,1 %).
- Soporte de prefix caching y scheduling asíncrono en vLLM para cargas conversacionales.

## Casos de uso

- Asistencia multimodal en producción: el modelo puede responder consultas que combinan imagen y texto (por ejemplo, análisis de capturas, documentos escaneados o gráficos) manteniendo conversaciones multi-turno con prefix caching activado en vLLM.
- Agentes con tool calling: gracias a `--enable-auto-tool-choice` y al parser `qwen3_coder`, puede integrarse en pipelines de agentes que invocan APIs externas, bases de datos o servicios internos.
- Razonamiento con modo thinking conmutable: útil en escenarios donde se requiere traza de razonamiento (análisis técnico, resolución de problemas) y donde se prefiere respuesta directa (chat de baja latencia), alternando por petición.
- Procesamiento de vídeo: con `--video-pruning-rate 0.5` y configuración de frames/fps, adecuado para resumen y descripción de clips en pipelines de monitorización o análisis de contenido.
- Atención al cliente multilingüe en inglés y coreano: la mejora en consistencia lingüística coreana (90,1 %) lo hace apto para despliegues donde la respuesta debe respetar el idioma de la consulta.
- Evaluación y benchmarking de técnicas de poda: como checkpoint de referencia para investigar el impacto de la poda no uniforme de expertos en modelos MoE multimodales.
- Despliegue en una sola GPU Blackwell: con 46 GiB en NVFP4, cabe en una B200 o GB200, lo que facilita servir un modelo de 120B nominales en un único nodo.

## Benchmarks y rendimiento

Resultados publicados por el autor (medias sobre los benchmarks indicados):

| Modelo | Ratio de poda | Precisión media inglés | Precisión media coreano | Consistencia lingüística coreano |
|---|---|---|---|---|
| Original (NVFP4) | - | 84.0 | 71.4 | 76.2 |
| Poda uniforme | 40 % | 77.4 | 61.0 | 73.4 |
| Este modelo | 40 % | 78.4 | 67.6 | 90.1 |

Benchmarks de inglés: IFEval, IFBench, GPQA-Diamond, AIME 2026, LiveCodeBench v6. Benchmarks de coreano: BenchMAX IFEval-ko, IFBench-ko, KoBALT, CLIcK.

Ablación sobre BenchMAX IFEval-ko (40 % podado):

| Configuración | Precisión | Consistencia lingüística coreano |
|---|---|---|
| Original (NVFP4) | 73.9 | 39.9 |
| Poda no uniforme basada en clustering | 75.8 | 39.6 |
| + Language-Following Expert Preservation | 85.5 | 64.3 |
| + Language-Following Weight Editing (este modelo) | 86.2 | 85.3 |

No se han publicado en la información disponible resultados desglosados por benchmark individual ni comparaciones con modelos de la competencia.

## Requisitos de hardware

- Checkpoint de 46 GiB en NVFP4; el repo ocupa 49,6 GB.
- Despliegue validado en 1 × B200 con tensor-parallel-size 1.
- Requiere hardware compatible con NVFP4 (Blackwell: B200/GB200). No se indica soporte en GPUs consumer.
- Servidor: vLLM 0.31.0 con parche de Nota AI para capas MoE con distinto número de expertos (`apply_patch.py`).
- Argumentos clave de servicio: `--trust-remote-code`, `--max-num-seqs 512`, `--enable-prefix-caching`, `--max-num-batched-tokens 32768`, `--mamba-backend flashinfer`, `--speculative_config.method mtp` con 5 tokens, `--tool-call-parser qwen3_coder`, `--reasoning-parser nemotron_v3`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Nota AI, podado 40 %) | 43,2B totales / 12B activos | no disponible | OpenMDW 1.1 | Hugging Face | NVFP4, 46 GiB, requiere parche vLLM |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (base) | 120B nominales / 12B activos | no disponible | OpenMDW 1.1 | Hugging Face | NVFP4, 70 GiB, sin poda |
| Poda uniforme del mismo base (referencia del autor) | 40 % de expertos eliminados | no disponible | OpenMDW 1.1 | no disponible como checkpoint público | Peor precisión y consistencia lingüística que este modelo |

No se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La poda degrada la precisión media: inglés 84,0 → 78,4 y coreano 71,4 → 67,6 respecto al original NVFP4.
- La mejora en consistencia lingüística coreana (90,1 %) no compensa la pérdida global de precisión en coreano (67,6 frente a 71,4).
- No hay reentrenamiento tras la poda; el modelo hereda los sesgos y limitaciones del base NVIDIA, según indica la model card.
- Requiere un parche específico de vLLM 0.31.0 y `--trust-remote-code`; no funciona con el stack estándar sin modificaciones.
- Dependencia de hardware Blackwell para NVFP4; no se documenta funcionamiento en GPUs consumer ni en otras arquitecturas.
- Idiomas soportados no declarados oficialmente; la evaluación se limita a inglés y coreano.
- Riesgo de alucinación no cuantificado en la información disponible.
- La licencia OpenMDW 1.1 condiciona el uso comercial; debe revisarse el acuerdo antes de desplegar en producción.
- Los datos de benchmarks provienen del propio autor del modelo podado; no hay validación independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nota-ai/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Global-Pruned-40
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- vLLM: https://github.com/vllm-project/vllm
