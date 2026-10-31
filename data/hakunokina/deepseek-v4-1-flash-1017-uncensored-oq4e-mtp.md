# hakunokina/DeepSeek-V4.1-Flash-1017-UNCENSORED-oQ4e-mtp

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-oQ4e-mtp es una compilación para Apple Silicon (MLX) del modelo uncensored de dealignai, que a su vez parte de DeepSeek-V4.1-Flash-1017 de DeepSeek-AI. Se trata de un modelo de lenguaje MoE (mixture of experts) de gran escala, con unos 764 mil millones de parámetros lógicos, de los cuales 129.060.546.354 corresponden a los pesos almacenados en este checkpoint cuantizado. Su principal reclamo es la ventana de contexto de hasta 1 millón de tokens, la memoria Engram en capas concretas y la cabecera MTP (multi-token prediction) preservada para decodificación especulativa.

Esta versión concreta ha sido empaquetada por el usuario hakunokina con el formato oQ4e de oMLX, que mantiene los expertos en MXFP4 y las proyecciones en MXFP8 del origen sin re-cuantizar, y solo comprime las tablas Engram a 4 bits. El resultado ocupa unos 432 GB y está pensado para ejecutarse en Macs con 512 GB de memoria unificada. Es relevante porque hasta su publicación no existía una build MLX/oQ del modelo uncensored 1017, y porque conserva casi intactas las capacidades de razonamiento y código del modelo oficial, eliminando sin embargo los comportamientos de rechazo a nivel de pesos, lo que exige un uso responsable por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (DeepSeek-V4.1-Flash), 384 expertos enrutados (top-6) + 1 experto compartido, 40 capas, memoria Engram en capas 1 y 14 |
| Parametros totales | 129.060.546.354 (pesos en safetensors de este checkpoint); ~764B parámetros lógicos según la model card |
| Parametros activos | no disponible (MoE con top-6 expertos enrutados + 1 compartido, pero no se publica el recuento exacto) |
| Longitud de contexto | hasta 1M de tokens |
| Tipos de cuantizacion | MXFP4 (expertos), MXFP8 (proyecciones), afín 4 bits grupo 32 (tablas Engram); ~4,37 bits/peso sin Engram, ~4,53 con Engram |
| Idiomas | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (build MLX/oMLX oQ4e) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeepSeek-V4.1-Flash: un transformer MoE con 40 capas, 384 expertos enrutados de los que se activan 6 por token, más 1 experto compartido. Incorpora un mecanismo de memoria denominado Engram en las capas 1 y 14, y una ventana de contexto de hasta 1 millón de tokens. Una característica destacable es la cabecera MTP (multi-token prediction) de 3 capas, que se conserva en este build para habilitar decodificación especulativa. El checkpoint original incluía también un encoder de visión, que se ha traspasado a esta build aunque no ha sido probado.

Sobre el entrenamiento del modelo base no se ofrecen detalles en la model card (tokens, composición del dataset o etapas de RLHF/DPO no disponibles). En cuanto a esta compilación, el trabajo de cuantización es mínimo e inverso a lo habitual: los pesos MoE y las proyecciones se mantienen en su precisión nativa del fuente FP8 (MXFP4 y MXFP8), y el único paso con pérdida es la cuantización afín a 4 bits (grupo 32) de las tablas Engram. La eliminación del comportamiento de rechazo fue realizada por el autor upstream (dealignai) directamente a nivel de pesos.

## Capacidades

- Generación de texto general y razonamiento (MMLU-Pro 80,3 en la suite de oMLX con thinking desactivado)
- Resolución de problemas matemáticos (GSM8K 96,0)
- Generación de código: HumanEval 92,7, MBPP 89,0, LiveCodeBench 85,0
- Soporte de tool calling: verificado mediante las APIs Anthropic `/v1/messages` y OpenAI `/v1/chat/completions` (3/5 y 5/5 aciertos en las pruebas del autor)
- Ventana de contexto extremadamente larga (hasta 1M de tokens) para documentos extensos
- Decodificación especulativa mediante la cabecera MTP preservada (3 capas de predicción multi-token)
- Sin filtros de rechazo (uncensored): obedece instrucciones que otros modelos se negarían a seguir
- Encoder de visión heredado del modelo fuente, aunque no probado en esta build
- Multilingüismo: no disponible en la información proporcionada

## Casos de uso

- Análisis de corpus documentales masivos: con 1M de tokens de contexto puede ingerir en una sola pasada bases de código completas, expedientes legales o colecciones de artículos científicos, respondiendo preguntas que requieren cruzar información dispersa en cientos de miles de tokens.
- Generación y refactorización de código en repositorios grandes: el alto rendimiento en HumanEval y LiveCodeBench, junto al contexto largo, permite tareas de refactorización que exigen ver múltiples ficheros simultáneamente.
- Agentes con tool calling: el soporte verificado de las APIs de OpenAI y Anthropic permite integrarlo en frameworks de agentes que orquestan llamadas a herramientas en flujos multi-paso.
- Investigación en seguridad y alineamiento: al ser un modelo uncensored a nivel de pesos, resulta útil para estudiar comportamientos sin rechazo, red-teaming y evaluaciones de seguridad, en entornos controlados.
- Procesamiento por lotes en estaciones Apple Silicon: la caché de prefijos de oMLX recupera un prefijo de ~29k tokens en ~1,8 s, lo que resulta eficiente en flujos de trabajo donde se reutilizan system prompts o documentos largos entre peticiones.
- Escritura creativa y ficción sin restricciones: la ausencia de rechazos lo hace adecuado para usuarios que necesitan generación narrativa sin los filtros de los modelos alineados, asumiendo el usuario la responsabilidad legal del contenido.
- Prototipado de decodificación especulativa: la cabecera MTP preservada permite experimentar con generación acelerada por multi-token prediction en el runtime oMLX.

## Benchmarks y rendimiento

Resultados de la suite de precisión de oMLX (thinking desactivado, ejecución determinista, 300/100/164/200/100/300 muestras respectivamente), comparados con la build oQ4e de pesos oficiales (censored):

| Benchmark | Muestras | Este build (uncensored) | Oficial 1017 oQ4e-mtp |
|---|---|---|---|
| MMLU-Pro | 300 | 80,3 | 83,3 |
| GSM8K | 100 | 96,0 | 97,0 |
| HumanEval | 164 (completo) | 92,7 | 94,5 |
| MBPP | 200 | 89,0 | 89,0 |
| LiveCodeBench | 100 | 85,0 | 84,0 |
| SafetyBench | 300 | 76,3 | 84,0 |

Rendimiento medido en Mac Studio M3 Ultra (512 GB, oMLX 0.7.1):

| Métrica | Valor |
|---|---|
| Reenvío de prefijo ~29k tokens (caché de prefijos) | ~1,8 s |
| Velocidad de decodificación | ~29 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones) | 3/5 / 5/5 |

No se ha podido medir la divergencia KL frente al fuente FP8 porque el harness de KL carga modelos vía mlx-lm, que no soporta Engram.

## Requisitos de hardware

- Memoria: ~432 GB solo de pesos; se recomienda un Mac con 512 GB de memoria unificada. Las tablas Engram se mantienen en la RAM del host por oMLX.
- GPU recomendada: no aplica GPU discreta; el objetivo es Apple Silicon (probado en Mac Studio M3 Ultra de 512 GB). No hay datos para GPUs NVIDIA.
- Consumer GPU: no es viable; el tamaño del checkpoint excluye cualquier GPU de consumo.
- KV cache: se mantiene pequeña en contextos moderados (≈1 GB o menos con batch 4 en las pruebas del autor).
- Runtime: requiere oMLX ≥ 0.7.1 (el soporte de Engram proviene del código de modelo DeepSeek-V4.1 de oMLX). mlx-lm estándar no puede cargar este checkpoint.
- Latencia: la primera petición en frío con ~29k tokens tardó ~192 s incluyendo la carga inicial de los 432 GB de pesos; no es una cifra representativa de prefill. Decodificación sostenida de ~29 tok/s.
- Despliegue: oMLX sirve el modelo vía API compatible con OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`). No hay soporte documentado para vLLM, llama.cpp, TGI u Ollama.

## Comparativa con modelos similares

| | Este build (uncensored oQ4e) | Oficial 1017 oQ4e-mtp (censored) | Fuente FP8 uncensored |
|---|---|---|---|
| Autor | hakunokina | mlx-community | dealignai |
| Tamaño | ~432 GB | ~432 GB (estimado, mismo esquema oQ4e) | ~510 GB |
| Cuantización | MXFP4 expertos + MXFP8 proyecciones + Engram 4-bit | idem | FP8 nativo |
| MMLU-Pro | 80,3 | 83,3 | no disponible |
| HumanEval | 92,7 | 94,5 | no disponible |
| SafetyBench | 76,3 | 84,0 | no disponible |
| MTP | preservado | preservado | no disponible |
| Runtime | oMLX ≥ 0.7.1 | oMLX | no disponible |
| Licencia | MIT | MIT | MIT |

No hay comparativas disponibles frente a modelos de otras familias de escala comparable (por ejemplo Llama o Qwen de gran formato) en la información proporcionada.

## Limitaciones y advertencias

- Modelo uncensored: el comportamiento de rechazo fue eliminado a nivel de pesos por el autor upstream. Seguirá instrucciones que otros modelos rechazarían, y el usuario asume toda la responsabilidad legal y ética de su uso.
- La caída en SafetyBench (76,3 frente a 84,0) es el efecto esperado de la eliminación de rechazos; la fiabilidad en escenarios sensibles está degradada.
- Riesgo de alucinación inherente a LLM de gran escala; no disponible una evaluación específica de factualidad en la información proporcionada.
- Requiere hardware muy específico: un Mac con 512 GB de memoria unificada; no ejecutable en GPUs de consumo ni en la mayoría de estaciones de trabajo.
- Dependencia de oMLX ≥ 0.7.1: el ecosistema de despliegue es limitado; mlx-lm, vLLM y otros runtimes habituales no pueden cargarlo por el soporte de Engram.
- El encoder de visión se ha traspasado pero no ha sido probado en esta build.
- No hay medición KL frente al fuente FP8, por lo que la degradación exacta de precisión no está cuantificada más allá de la suite de oMLX.
- Idiomas soportados: no disponible en la información proporcionada.
- Cifras de velocidad basadas en ejecuciones únicas; varían con la longitud de contexto y la configuración.
- El primer arranque implica una carga de 432 GB (~192 s en la prueba del autor), relevante para entornos de producción con arranques frecuentes.
- Licencia MIT heredada de los modelos upstream; sin restricciones comerciales documentadas, aunque conviene verificar el archivo LICENSE del repositorio.

## Enlaces

- Ficha del modelo: https://huggingface.co/hakunokina/DeepSeek-V4.1-Flash-1017-UNCENSORED-oQ4e-mtp
- Modelo base (uncensored FP8): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo oficial original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build oficial de pesos con oQ4e (referencia de calidad): https://huggingface.co/mlx-community/DeepSeek-V4.1-Flash-1017-oQ4e-mtp
- oMLX (runtime y esquema de cuantización oQ): https://omlx.ai
