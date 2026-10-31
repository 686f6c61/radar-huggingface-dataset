# autotrust/Qwen3.8-Flash-Next-E384-FP4-V2

## Resumen

Qwen3.8-Flash-Next-E384-FP4-V2 es un checkpoint completo (no un adaptador) publicado por el usuario autotrust en HuggingFace, derivado de forma no oficial del modelo Qwen3.8-Flash-Next-E384 y sin el respaldo de Alibaba ni de NVIDIA. Se trata de una fusión (merge) del checkpoint base tras tres rondas de aprendizaje por refuerzo de estilo GRPO con adaptadores LoRA, centradas en la generación de puntuaciones CVSS dentro de presupuestos cortos de tokens y en la emisión estructurada de hallazgos de seguridad. El modelo es multimodal (image-text-to-text), de arquitectura MoE con cuantización NVFP4 mediante ModelOpt, y está pensado para servirse con vLLM.

Su relevancia radica en que demuestra un flujo de post-entrenamiento especializado sobre un modelo base cuantizado en FP4: mejora métricas como AIME 2026 (de 93,3 a 95,0) y HumanEval (de 97,6 a 98,78) respecto a la referencia publicada del modelo base, y reduce significativamente la longitud de los razonamientos largos en la cola de distribución (P90 de 58.272 a 45.339 tokens). El repositorio pesa 87,8 GB y contiene 21 shards de pesos en safetensors, tokenizador, configuraciones y ficheros MTP (multi-token prediction).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con expertos enrutados, experto compartido, PLE, proyecciones GDN y MTP |
| Parametros totales | 80.083.170.934 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 72.000 tokens (max-model-len validado en vLLM); presupuesto de generación probado de 64k |
| Tipos de cuantizacion | NVFP4 (modelopt_mixed); proyecciones GDN almacenadas en BF16; KV cache FP8 opcional |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | nvidia-open-model-agreement (other) |
| Formato de pesos | safetensors (21 shards, 87,8 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next-E384-FP4-Local, un checkpoint cuantizado en formato NVFP4 mediante NVIDIA ModelOpt con un layout de pesos FP4/CSF/PLE. La arquitectura es de tipo MoE con expertos enrutados, un experto compartido, capas PLE y proyecciones GDN, además de ficheros MTP (multi-token prediction) incluidos en el checkpoint. No se ha publicado información detallada sobre el preentrenamiento del modelo base (tokens, composición del dataset), por lo que esos datos no están disponibles.

El ajuste fino de esta versión consistió en tres rondas de aprendizaje por refuerzo estilo GRPO (Group Relative Policy Optimization) con recompensas verificables, aplicadas mediante LoRA de rango 32 y alpha 64. Los expertos enrutados, el router, el experto compartido y las capas PLE se mantuvieron congelados durante el entrenamiento. Las deltas de las proyecciones GDN se plegaron a precisión completa y esas proyecciones se almacenan en BF16, eliminando sus entradas de `quantization_config.quantized_layers`. La ronda final de RL se orientó a la finalización de puntuaciones CVSS con presupuesto corto y a la emisión estructurada de hallazgos. El adaptador final se fusionó en los pesos antes de publicar el repositorio, de modo que no hace falta cargar ningún adaptador.

## Capacidades

- Generación de texto conversacional con soporte de razonamiento (parser de razonamiento qwen3 en vLLM).
- Comprensión de imágenes y texto (pipeline image-text-to-text), con resultados en MMMU val de 78,22.
- Generación y comprensión de código: 98,78 en HumanEval (greedy).
- Razonamiento matemático avanzado: 95,0 en AIME 2026 con razonamiento xhigh y presupuesto de 64k tokens de generación.
- Tool calling / function calling nativo: parser qwen3_xml con `--enable-auto-tool-choice` en vLLM; 77,88 en el benchmark interno de tool calling (800 casos).
- Emisión estructurada de hallazgos de seguridad (structured findings) y completado de puntuaciones CVSS3/CVSS4 dentro de presupuestos de tokens cortos, aunque con fiabilidad aritmética limitada.
- Soporte de razonamiento con presupuesto ajustable (niveles tipo xhigh) y generación larga de hasta 64k tokens.
- Capacidades multilingues limitadas a ingles y chino (89,97 en C-Eval val).

## Casos de uso

- Análisis automatizado de vulnerabilidades: el modelo se ha ajustado específicamente para completar puntuaciones CVSS3 y CVSS4 con presupuestos de tokens cortos (2.200 tokens) y emitir hallazgos estructurados, lo que lo hace adecuado para pipelines de triaje de vulnerabilidades, aunque la aritmética CVSS debe verificarse siempre con la implementación de referencia.
- Asistentes de ciberseguridad con salida estructurada: la recompensa de emisión estructurada de hallazgos pasó de 0,609 a 0,917 en la evaluación de prompts de entrenamiento, útil para generar informes JSON o tablas de hallazgos integrables en herramientas de gestión de vulnerabilidades.
- Razonamiento matemático intensivo: con 95,0 en AIME 2026 y razonamiento extenso (mediana de ~16.675 tokens por respuesta), es adecuado para resolución de problemas de competición matemática y verificación de demostraciones.
- Generación de codigo en producción: 98,78 en HumanEval y soporte de tool calling con parser qwen3_xml permiten integrarlo en agentes de programación y flujos de trabajo con herramientas externas.
- Agentes con uso de herramientas: el soporte de tool calling automático en vLLM y el rendimiento de 77,88 en el benchmark interno lo hacen viable para agentes multi-paso que consultan APIs o ejecutan funciones.
- Comprensión multimodal de documentos: como modelo image-text-to-text, puede responder preguntas sobre imágenes (78,22 en MMMU val), útil para extraer información de capturas, diagramas o documentos escaneados.
- Despliegue eficiente en una sola GPU de gama alta: la cuantización FP4 y el KV cache FP8 permiten servir el modelo en un único B200 con contexto de 72k tokens y hasta 128 secuencias concurrentes.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con el mismo harness y configuración de serving para todas las filas (ejecuciones únicas; GPQA tiene solo 198 preguntas y es ruidoso). Los valores de la columna base son números de referencia publicados previamente, no una re-ejecución.

| Benchmark | Base (referencia) | Este modelo |
|---|---:|---:|
| GPQA-Diamond (low, 32k) | 77,3 | 75,76 |
| MMLU (14.042 preguntas) | 86,9 | 87,37 |
| C-Eval val (1.346) | 89,0 | 89,97 |
| AIME 2026 (xhigh, 64k) | 93,3 | 95,0 |
| HumanEval (164, greedy) | 97,6 | 98,78 |
| MMMU val (900) | 79,4 | 78,22 |
| Tool calling (800) | — | 77,88 |

Datos adicionales de comportamiento (sobre prompts de entrenamiento, no benchmark independiente):

| Métrica | Antes de RL | Después de RL |
|---|---:|---:|
| Completado CVSS3 en 2.200 tokens | 39 % | 70 % |
| Completado CVSS4 en 2.200 tokens | 18 % | 60 % |
| Recompensa de hallazgos estructurados | 0,609 | 0,917 |
| Precisión exacta CVSS3 vs referencia (entre completados) | — | ~4,5 % |
| Precisión exacta CVSS4 vs referencia (entre completados) | — | ~4,2 % |

En AIME 2026, el total de tokens de completado cayó un 2,05 % (de 19.897 a 19.490 de media por respuesta) mientras la precisión subía de 92,5 a 95,0; la mediana se mantuvo estable (16.528 a 16.675 tokens) y la reducción vino de la cola larga (P90 de 58.272 a 45.339) y de menos truncamientos a 65.536 tokens (9 frente a 6).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 87,8 GB en formato FP4 mixto; la configuración validada requiere una GPU NVIDIA B200 (aproximadamente 192 GB de VRAM). No hay datos de ejecución en GPUs con menos memoria.
- GPU validada: una única B200 con vLLM 0.31, tensor parallel size 1, dtype bfloat16, KV cache FP8 y gpu-memory-utilization 0,90.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090, etc.) según la información disponible; no se han publicado configuraciones multi-GPU alternativas.
- Despliegue: vLLM (librería declarada del modelo). Es necesario aplicar el parche incluido en `vllm_patch/sitecustomize.py` para el layout de pesos FP4/CSF/PLE de este checkpoint. Comando validado: `vllm serve . --quantization modelopt_mixed --mamba-cache-mode align --enable-prefix-caching --enable-chunked-prefill --max-model-len 72000 --max-num-seqs 128 --kv-cache-dtype fp8`. También se incluye `serve_vllm.sh` como lanzador portable. No hay evidencia de compatibilidad con llama.cpp, Ollama, TGI o transformers.
- Latencia y throughput: no disponible (no se han publicado cifras de tokens/segundo ni de latencia).

## Comparativa con modelos similares

No hay información suficiente en los datos proporcionados para comparar con modelos alternativos publicados de forma fiable (el modelo base de referencia solo aporta números de benchmark, no specs comparables). Comparativa basada únicamente en lo disponible:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-E384-FP4-V2 (este) | 80,08 B | 72.000 tokens | NVFP4 (modelopt_mixed) | nvidia-open-model-agreement |
| Qwen3.8-Flash-Next-E384-FP4-Local (base) | no disponible | no disponible | NVFP4 | no disponible |

No disponible: comparación con otros MoE de ~80B del mercado, ya que la información proporcionada no incluye esos datos.

## Limitaciones y advertencias

- La aritmética de CVSS no es fiable: entre respuestas completadas, la coincidencia exacta con la implementación de referencia fue de solo ~4,5 % para CVSS3 y ~4,2 % para CVSS4. El autor indica explicitamente que este checkpoint no debe describirse como habiendo corregido el cálculo de CVSS. Cualquier puntuación generada debe validarse con la implementación oficial.
- Las métricas de comportamiento de CVSS y hallazgos estructurados son mediciones sobre prompts de entrenamiento, no benchmarks independientes, por lo que pueden estar sobreestimadas.
- Los benchmarks son ejecuciones únicas; GPQA-Diamond tiene solo 198 preguntas y es especialmente ruidoso.
- Es un derivado no oficial que no cuenta con el respaldo de Alibaba ni de NVIDIA.
- Requiere un parche de vLLM específico (`vllm_patch/sitecustomize.py`) para el layout de pesos FP4/CSF/PLE, lo que puede romperse con futuras versiones de vLLM.
- Idiomas limitados a ingles y chino; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación ni de sesgos; no disponible.
- La licencia nvidia-open-model-agreement no es una licencia open source estándar (Apache/MIT): conviene revisar sus términos antes de cualquier uso comercial.
- Solo validado con vLLM 0.31 en B200; no hay garantías de funcionamiento en otros runtimes o hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/Qwen3.8-Flash-Next-E384-FP4-V2
- Modelo base: https://huggingface.co/autotrust/Qwen3.8-Flash-Next-E384-FP4-Local
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- No se han encontrado enlaces a papers, blogs oficiales ni demos en la información disponible.
