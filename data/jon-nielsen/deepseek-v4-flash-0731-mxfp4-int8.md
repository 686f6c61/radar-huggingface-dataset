# Jon-Nielsen/DeepSeek-V4-Flash-0731-MXFP4-INT8

## Resumen

DeepSeek-V4-Flash-0731-MXFP4-INT8 es un checkpoint cuantizado del modelo DeepSeek-V4-Flash-0731, adaptado por Jon-Nielsen para ejecutarse en GPUs Ampere (sm86, como la RTX 3090) que carecen de tensor cores FP8 o MXFP4 nativos. El modelo original, desarrollado por DeepSeek, es un MoE con 284B parámetros totales y 13B activos, con Multi-Latent Attention (MLA), atención dispersa comprimida y una ventana de contexto de 1M tokens. Este quant reempaqueta los expertos en MXFP4 (E2M1) reinterpretados como INT4 firmado vía Marlin, y los lineales densos de FP8 a INT8, permitiendo servir el modelo en hardware consumer con 8x RTX 3090.

La conversión, realizada con la herramienta del fork AppMana de vLLM, logra una ruta de paso casi total para los pesos de expertos (95% passthrough) y una pérdida mínima en los lineales densos (40 dB de relación señal-ruido, ~1% de error relativo medio). El resultado ofrece 437K tokens de contexto con KV cache int8 en 8x24GB, frente a los ~220K de la versión FP8. La licencia es MIT, lo que permite uso comercial sin restricciones.

Este checkpoint es relevante porque resuelve un problema práctico: el checkpoint 0731 original en FP8+MXFP4 no tiene ruta de carga oficial en vLLM mainline para GPUs sin tensor cores FP8. Al reinterpretar los pesos y aplicar parches al fork de AppMana, se consigue servir el modelo en hardware de gama consumer, aunque con limitaciones documentadas (DSpark inoperativo, sin evals de calidad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Multi-Latent Attention (MLA) y atencion dispersa comprimida |
| Parametros totales | 284B (modelo base); 159.183.551.422 en el checkpoint cuantizado |
| Parametros activos | 13B |
| Longitud de contexto | 1M tokens (modelo base); 437K tokens en esta configuracion con 8x24GB |
| Tipos de cuantizacion | Expertos: MXFP4 (E2M1); lineales densos: INT8 channelwise; KV cache: int8_ds_mla |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformador MoE con 284B parámetros totales y 13B activos, que emplea Multi-Latent Attention (MLA) y atención dispersa comprimida para manejar ventanas de contexto de hasta 1M tokens con salida de 384K. Incorpora además DSpark, un mecanismo de draft multi-token con 3 etapas MTP (Multi-Token Prediction) para acelerar la decodificación especulativa.

Este checkpoint cuantizado no altera la arquitectura, solo reempaqueta los pesos para GPUs Ampere. Los expertos se almacenan en MXFP4 (E2M1), que en sm86 se reinterpretan como INT4 firmado y se ejecutan mediante tensor cores INT4 vía Marlin, con escalas E8M0 aplicadas en el epílogo. Los lineales densos se convierten de FP8 E4M3 a INT8 channelwise, con una pérdida medida de 40 dB SNR (~1% de error relativo medio), frente a los 20-30 dB típicos de una cuantización W4A16. La KV cache se almacena en int8_ds_mla, duplicando el contexto utilizable respecto a FP8. La conversión se realiza con la herramienta `dsv4_requant_checkpoint.py` del fork AppMana, con un 95% de passthrough en los pesos de expertos y un tiempo de conversión de 15-30 minutos en una sola GPU.

## Capacidades

- Generación de texto con razonamiento de largo alcance, coherente en generación long-form (verificado en pruebas del autor).
- Tool calling funcional (mencionado explícitamente en la model card: "working tool calls").
- Soporte de contexto muy largo: hasta 437K tokens en esta configuración con 8x24GB, gracias a la KV cache int8_ds_mla.
- Atención dispersa comprimida heredada del modelo base, que reduce el coste computacional en contextos extensos.
- DSpark (draft multi-token) preservado del checkpoint 0731, aunque con 0% de aceptación en sm86 con KV int8; debe desactivarse en producción.
- Capacidades multilingües no documentadas en la información disponible.
- No se especifican capacidades de visión, audio u otras modalidades; es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue local de un modelo de razonamiento en hardware consumer: un equipo con 8x RTX 3090 puede servir este modelo con 62 tok/s y 437K de contexto, lo que permite ejecutar tareas de razonamiento complejo sin depender de APIs externas ni de GPUs con tensor cores FP8.
- Análisis de documentos largos: con 437K tokens de contexto, el modelo puede procesar libros completos, expedientes legales o codebases enteros en una sola pasada, resumiendo o extrayendo información sin necesidad de chunking.
- Generación de código asistida con contexto amplio: al mantener todo el repositorio en contexto, el modelo puede sugerir cambios coherentes entre archivos, refactorizaciones y generación de tests con conocimiento del proyecto completo.
- Atención al cliente automatizada con historial extenso: la ventana de contexto permite mantener conversaciones multi-turno con todo el historial del cliente, incluyendo tickets previos, sin perder información relevante.
- Agentes autónomos con tool calling: el soporte de tool calling permite integrar el modelo en pipelines de automatización que consultan bases de datos, ejecutan comandos o interactúan con APIs, manteniendo el estado de la tarea en contexto.
- Investigación académica en modelos open source: al ser MIT y estar disponible en safetensors, sirve como base para estudios de cuantización, evaluación de calidad en hardware Ampere y experimentos de eficiencia de atención dispersa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No quality evals yet" y recomienda evaluar antes de usar en producción. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint cuantizado.

En cuanto a rendimiento de inferencia, el autor reporta las siguientes mediciones en 8x RTX 3090 (24GB, sm86), CUDA 13.1, torch 2.13.0+cu130:

| Configuracion | Contexto maximo | Velocidad | Notas |
|---|---|---|---|
| Quant MXFP4-INT8, KV int8, FULL_DECODE_ONLY graphs | 437K | 62 tok/s | DSpark desactivado |
| Quant MXFP4-INT8, DSpark activado | 62K | 35 tok/s | 0% de aceptacion de DSpark |

## Requisitos de hardware

- Probado en 8x RTX 3090 (24GB, sm86) con CUDA 13.1 y torch 2.13.0+cu130.
- VRAM estimada: el checkpoint ocupa 174.8 GB en disco; con 8x24GB (192GB totales) y un GMU (GPU memory utilization) de 0.93 se logra servir con 437K de contexto. Un GMU de 0.95 provoca OOM en tarjetas de 24GB.
- No cabe en una sola GPU consumer; requiere al menos 8x24GB para la configuración documentada.
- Requiere el fork AppMana de vLLM (rama `vllm-consumer-nvidia-platforms`) con tres parches aplicados y la librería `flash-mla==2.0.0+8ec3de6` instalada desde `https://appmana.github.io/forks-flash-mla-int/`. No hay fallback si esa URL no está disponible.
- Opciones de despliegue: exclusivamente vLLM (fork AppMana). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia medida: 62 tok/s con DSpark off y 437K de contexto; 35 tok/s con DSpark on y 62K de contexto.
- Parámetro recomendado: `--max-num-batched-tokens 128` para lograr 100% de cache hit en Triton JIT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (original) | 284B totales, 13B activos | 1M tokens | FP8 + MXFP4 nativo | GPUs con tensor cores FP8/MXFP4 (H100, etc.) | MIT | Requiere hardware con soporte nativo; sin ruta oficial en vLLM mainline |
| Este checkpoint (MXFP4-INT8) | 284B totales, 159B en checkpoint | 437K (8x24GB) | MXFP4 expertos + INT8 densos + KV int8 | Ampere sm86 (RTX 3090) | MIT | Probado en 8x RTX 3090; DSpark inoperativo |
| appmana/deepseek-v4-mxfp4-int8 | 284B totales | no disponible | MXFP4 + INT8 | Ampere | MIT | Versión pre-0731, sin DSpark |
| appmana/deepseek-v4-int4-int8 | 284B totales | no disponible | INT4 expertos + INT8 densos | Ampere | MIT | Versión 0731, más rápida pero con menos margen de calidad |

No se dispone de benchmarks comparativos entre estas variantes; la model card solo indica que la versión INT4 es más rápida pero con menos margen de calidad.

## Limitaciones y advertencias

- DSpark (decodificación especulativa multi-token) no funciona: se observó 0% de aceptación de drafts con KV int8 en sm86. Debe desactivarse en producción (`ENABLE_DSPARK=0`).
- Sin evaluaciones de calidad publicadas: la model card advierte "No quality evals yet" y "No claims are made for suitability for any purpose". Es imprescindible evaluar el modelo antes de cualquier uso en producción.
- Riesgo de alucinación no cuantificado: al no haber evals, se desconoce la tasa de alucinación en tareas de razonamiento o generación factual.
- Sesgos no documentados: no hay información sobre sesgos de género, raza o idioma.
- Dependencia crítica de infraestructura externa: requiere el fork AppMana, tres parches y la librería flash-mla servida desde una URL concreta. Si esa URL deja de estar disponible, no hay fallback para la ruta de atención sm86.
- Crash en prefill int8 con batches grandes: el kernel C++ de flash_mla int8 prefill falla con prompts grandes (`aten::new_empty` stable-ABI error). El checkpoint mitiga esto enrutando el prefill por Triton, pero limita el rendimiento en prefill.
- Limitación de idioma: no se documentan los idiomas soportados; la capacidad multilingüe es incierta.
- Restricciones de hardware: solo probado en 8x RTX 3090; no hay garantías de funcionamiento en otras configuraciones Ampere o en GPUs de menor VRAM.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías de idoneidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jon-Nielsen/DeepSeek-V4-Flash-0731-MXFP4-INT8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Fork AppMana de vLLM: https://github.com/appmana/vllm (rama `vllm-consumer-nvidia-platforms`)
- Wheel de flash-mla: https://appmana.github.io/forks-flash-mla-int/
- Documentación de DeepSeek V4 Flash (DeepWiki): https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Releases del proyecto desktop DeepSeek V4 Flash: https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731/releases
- Ficha de DeepSeek-V4-Flash-0731 en Datalearner: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-flash
- Paper referenciado en tags (arxiv:2606.19348): no disponible en los resultados de búsqueda
