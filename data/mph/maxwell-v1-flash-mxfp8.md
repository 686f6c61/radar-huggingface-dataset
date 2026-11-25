# mph/Maxwell-V1-Flash-MXFP8

## Resumen

Maxwell-V1-Flash-MXFP8 es la versión cuantizada en MXFP8 del modelo de lenguaje Maxwell-V1-Flash, desarrollado por el colectivo maxwell-model y publicada por el usuario mph en Hugging Face. Se trata de un transformer de tipo MoE (mixture of experts) de aproximadamente 35.000 millones de parámetros totales con tan solo 3.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos eficientes en cómputo con una calidad cercana a modelos densos mucho más grandes.

La innovación principal del modelo reside en su arquitectura: 45 capas troncales con atención GQA de tipo block-sparse con indexador aprendido, 42 capas MoE con 256 expertos y enrutamiento sigmoide (top-12), conexiones residuales múltiples ("manifold-constrained hyper-connections") y una capa MTP (multi-token prediction). El contexto configurado es de 524.288 tokens, lo que lo hace adecuado para tareas de contexto muy largo. La cuantización MXFP8 reduce el peso de los pesos a unos 37 GB, permitiendo su despliegue en una sola GPU de 48 GB o más.

Esta ficha es relevante ahora porque la cuantización MXFP8 con escalas dinámicas E8M0 por bloques de 32 elementos permite mantener una precisión cercana a BF16 sin necesidad de conjunto de calibración, y porque el modelo incorpora soporte nativo de tool calling, modo "thinking" activado por defecto y un template de chat que emite llamadas a herramientas en XML. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención GQA block-sparse e indexador aprendido, hyper-connections y capa MTP |
| Parámetros totales | ~35.000 millones (excluyendo embeddings); 36.810.559.422 según safetensors |
| Parámetros activos | ~3.000 millones por token |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantización | MXFP8 (E4M3 con escala E8M0 compartida por bloque de 32 elementos); módulos sensibles en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 39,6 GB) |

## Arquitectura y entrenamiento

El modelo es un `MaxwellMoeForCausalLM` con 45 capas troncales: 3 capas densas SwiGLU (tamaño intermedio 6.144) y 42 capas MoE con enrutamiento sigmoide de 256 expertos, top-12, tamaño intermedio 512, más un experto compartido sin compuerta de tamaño intermedio 1.024. La atención es GQA block-sparse con 32 cabezas de consulta, 4 cabezas KV y tamaño de cabeza 128, e incorpora un indexador aprendido. Las "manifold-constrained hyper-connections" mantienen 4 flujos residuales, y una capa MTP adicional usa GQA densa.

La cuantización MXFP8 se generó con NVIDIA TensorRT Model Optimizer (ModelOpt) v0.48.0. Los pesos y activaciones se almacenan como FP8 E4M3 con una escala E8M0 compartida por cada bloque de 32 elementos, lo que reduce aproximadamente a la mitad la memoria de pesos respecto a BF16 manteniendo una precisión cercana gracias al escalado de grano fino. Las escalas son dinámicas, por lo que no se usó conjunto de calibración. Se mantienen en BF16 los embeddings, `lm_head`, los routers MoE, los módulos de hyper-connection (incluido `mapping_proj`), los módulos MTP y la caché KV; el `expert_bias` de los routers permanece en FP32 y las layer norms en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno con contexto de hasta 524.288 tokens.
- Modo "thinking" activado por defecto mediante el template de chat.
- Tool calling / function calling nativo, con emisión de llamadas a herramientas en XML.
- Soporte de agentes y razonamiento multi-paso (multi-step reasoning).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades de código y matemáticas: no disponibles explícitamente en la información proporcionada.
- Visión y audio: no soportados (modelo text-only).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (524.288 tokens) gracias a su ventana de contexto, manteniendo el hilo de la conversación y el historial del cliente sin truncamientos agresivos.
- Generación de código en producción: soporta tool calling con emisión XML y puede integrarse en pipelines de CI/CD para invocar herramientas externas, ejecutar tests o consultar APIs durante la generación.
- Agentes autónomos multi-paso: el modo thinking por defecto y el soporte de tool calling permiten encadenar razonamiento y acciones en flujos de agente, con llamadas a herramientas estructuradas.
- Análisis de documentos extensos: con 524.288 tokens de contexto puede procesar informes, contratos o bases de código completas en una sola pasada sin fragmentación.
- Asistente de investigación: razonamiento multi-paso sobre literatura científica o datos técnicos, con capacidad de invocar herramientas de búsqueda o cálculo.
- Despliegue en una sola GPU de 48 GB: al ocupar los pesos unos 37 GB, permite servir el modelo en una única GPU Blackwell de 48 GB o superior, con tensor parallelism para contextos largos o alta concurrencia.
- Backend de chat con vLLM: integrable mediante `vllm serve` con parsers de razonamiento y tool calling (qwen3 / qwen3_coder), prefix caching y chunked prefill.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~37 GB solo para pesos; añadir margen para la caché KV (que permanece en BF16).
- GPU recomendadas: NVIDIA Blackwell (SM100/SM120) para cómputo MXFP8 nativo; los kernels de atención block-sparse están compilados para SM100.
- Cabe en una sola GPU de 48 GB o más; para contextos largos o alta concurrencia, usar varias GPU con tensor parallelism.
- Opciones de despliegue: vLLM con build que registre `MaxwellMoeForCausalLM` (imagen `maxwellmodel/vllm-openai:v0.30.0`), con `--block-size 128`, `--quantization modelopt_mxfp8`, `--dtype bfloat16`, `--attention-backend FLASHINFER`, `--enable-prefix-caching`, `--enable-chunked-prefill`, `--enable-auto-tool-choice`, `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas.
- Limitaciones de contexto o idioma: el contexto es amplio (524.288 tokens) pero los idiomas soportados no están especificados.
- Restricciones de licencia: Apache 2.0, permite uso comercial; verificar los términos exactos del modelo base `maxwell-model/Maxwell-V1-Flash`.
- Requiere GPU Blackwell (SM100/SM120) para cómputo MXFP8 nativo; en hardware anterior el rendimiento puede degradarse o no ser compatible con los kernels block-sparse.
- Requiere `--trust-remote-code` y una build de vLLM específica que registre la arquitectura `MaxwellMoeForCausalLM`; no funciona con vLLM estándar sin ese registro.
- El modo "thinking" está activado por defecto, lo que puede incrementar la latencia y el consumo de tokens si no se desactiva.
- La caché KV permanece en BF16, por lo que contextos muy largos consumen memoria adicional significativa.

## Enlaces

- Hugging Face: https://huggingface.co/mph/Maxwell-V1-Flash-MXFP8
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Documentación de despliegue (vLLM): https://maxwell-llm.ai/docs/quickstart
