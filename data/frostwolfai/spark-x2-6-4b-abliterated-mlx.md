# FrostWolfAI/Spark-X2.6-4B-abliterated-MLX

## Resumen

Spark-X2.6-4B-abliterated-MLX es la conversión nativa para Apple Silicon (formato MLX) del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, una variante "abliterated" (sin direcciones de rechazo) del modelo post-entrenado XHToken/Spark-X2.6-4B. Lo desarrolla FrostWolfAI (Vatsal Bajpai, @xblack) y emplea la técnica Arbitrary-Rank Ablation (ARA) mediante Heretic v2 para suprimir las respuestas de negativa manteniendo la arquitectura y el formato de herramientas intactos. Según la model card, las negativas caen de 100/100 a 2/100 con una divergencia KL de 0,0177.

El modelo usa la arquitectura propietaria `spark2_5`: 36 capas con atención mixta (27 capas de ventana deslizante de 512 tokens y 9 capas de atención global en proporción 3:1), 16 cabezas de atención y 4 cabezas KV, dimensión de cabeza 256, QKV fusionado y puerta de salida sigmoidea por cabeza. Con 4.112.079.360 parámetros totales, un vocabulario de 131.072 tokens y una longitud de contexto de 1.048.576 tokens, está pensado para despliegue local en Mac con Apple Silicon.

Esta release MLX aplica cuantización 4-bit afín con grupo de 64 (4,505 bits por peso), reduciendo el peso en disco a 2,32 GB y permitiendo inferencia en equipos con 16 GB de memoria unificada. Es relevante para desarrolladores que quieran un modelo local con contexto muy largo, modo de razonamiento controlable y soporte de tool calling, sin depender de la nube ni de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5`: transformer con atención mixta (27 capas sliding-window de 512 tokens + 9 capas globales, ratio 3:1), 36 capas, 16 cabezas / 4 KV, head dim 256, QKV fusionado, GELU MLP, embeddings atados |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | 4-bit afín (group size 64, 4,505 bits/peso; `g_proj` y normas en BF16). Existe release MLX 8-bit (4,37 GB) y GGUF en repo aparte |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (heredada de XHToken/Spark-X2.6-4B) |
| Formato de pesos | MLX safetensors (`model_type: spark2_5`), 2,32 GB en disco |

## Arquitectura y entrenamiento

La arquitectura `spark2_5` combina 36 capas con dos regímenes de atención: 27 capas de ventana deslizante de 512 tokens y 9 capas de atención global, en proporción 3:1. Las capas deslizantes usan una caché KV rotativa de 512 tokens, de modo que en contextos largos la memoria KV solo crece con las 9 capas globales. Incorpora 16 cabezas de atención y 4 cabezas KV (GQA), dimensión de cabeza 256, QKV fusionado y una puerta de salida sigmoidea por cabeza. El MLP es GELU con dimensión intermedia 10.240 sobre hidden de 2.560, y los embeddings están atados. El vocabulario es de 131.072 tokens.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base. La variante aquí descrita es una conversión MLX 4-bit del checkpoint abliterated, que a su vez se generó con Heretic v2 aplicando Arbitrary-Rank Ablation (ARA) sobre el modelo post-entrenado XHToken/Spark-X2.6-4B. La abliteración suprime direcciones de rechazo sin añadir capacidad ni criterio al modelo; según la model card, preserva arquitectura, contexto de 1M tokens, thinking controlable y formato `<tool_call>`. `spark2_5` está soportado nativamente por `mlx-lm`, por lo que no requiere `trust_remote_code`.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento con modo thinking controlable: emite un bloque `<think>...</think>` antes de la respuesta por defecto; se puede desactivar con `enable_thinking=False` o ajustar con `reasoning_effort="low"`/`"high"`.
- Tool calling / function calling mediante `tools=` en `apply_chat_template()`, con argumentos como diccionario y salida en formato `<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`.
- Capacidades agénticas y razonamiento multi-paso, etiquetadas por el autor como `agentic`.
- Contexto largo de hasta 1.048.576 tokens con gestión de memoria eficiente gracias a la caché KV rotativa de las capas deslizantes.
- Generación de código (el ejemplo de la model card incluye un escáner de puertos en Python con asyncio).
- Respuestas sin filtrado de rechazo (comportamiento abliterated deliberado).
- No se documentan capacidades de visión ni audio: el pipeline es exclusivamente `text-generation`.

## Casos de uso

- Asistente de código local en Mac: con 4,11 B parámetros y 2,32 GB en disco, se puede ejecutar en un MacBook con 16 GB y usarse para autocompletado, generación de scripts y revisión de código sin conexión, integrándolo en editores mediante el servidor OpenAI-compatible de `mlx_lm.server`.
- Agente con tool calling en local: el soporte nativo del formato `<tool_call>` permite construir agentes que invoquen APIs, consulten bases de datos o ejecuten herramientas del sistema, con el razonamiento multi-paso habilitado mediante `reasoning_effort`.
- Análisis de documentos largos: el contexto de 1M tokens y la caché KV rotativa permiten procesar libros, expedientes o repositorios completos en un solo prompt con consumo de memoria contenido.
- Procesamiento bilingüe inglés-chino: útil para traducción, resumen o atención al cliente en entornos que requieran ambos idiomas, sin necesidad de infraestructura en la nube.
- Prototipado de investigación sobre abliteration: al estar publicados los parámetros de abliteración y el bundle de reproducción en el repo BF16, sirve para estudiar el efecto de ARA sobre las negativas con una divergencia KL medida de 0,0177.
- Generación de contenido sin restricciones en entornos controlados: para pruebas de robustez, red teaming interno o investigación sobre seguridad de modelos, siempre en despliegues privados y moderados.
- Despliegue en LM Studio: la release es cargable directamente en LM Studio con el motor MLX, lo que facilita pruebas de concepto por parte de perfiles menos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta métricas de inferencia medidas en Apple M3 (8 núcleos, 16 GB de memoria unificada) con `mlx-lm` 0.32.2:

| Metrica | Valor |
|---|---|
| Procesamiento de prompt | ~152 tok/s |
| Generación | ~12 tok/s |
| Memoria pico | ~2,5 GB |
| Tasa de rechazo (abliterated) | 2/100 (frente a 100/100 del base) |
| Divergencia KL de la abliteración | 0,0177 |

## Requisitos de hardware

- VRAM/memoria estimada: ~2,5 GB de pico en inferencia 4-bit; el repo ocupa 2,32 GB en disco. La release 8-bit ocupa 4,37 GB.
- Plataforma: exclusivamente Apple Silicon (M1/M2/M3/M4 y posteriores) con macOS 13.5 o superior; MLX no funciona en GPUs NVIDIA ni AMD.
- Cabe holgadamente en cualquier Mac con 16 GB de memoria unificada; también en configuraciones de 8 GB con margen ajustado.
- No es desplegable en A100, H100 ni RTX 4090 mediante MLX. Para esas GPUs habría que usar la release GGUF (llama.cpp/Ollama/LM Studio) o el checkpoint BF16.
- Opciones de despliegue: `mlx-lm >= 0.32` (API Python, CLI `mlx_lm.generate` y servidor OpenAI-compatible `mlx_lm.server` en el puerto 8080), LM Studio con motor MLX.
- Throughput medido: ~152 tok/s de prefill y ~12 tok/s de generación en M3 de 8 núcleos. La latencia en contextos largos se beneficia de que solo las 9 capas globales mantienen caché KV completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated-MLX (este) | 4,11 B | 1.048.576 | MLX 4-bit, Apple Silicon | Apache-2.0 | 2,32 GB, ~12 tok/s en M3, sin rechazos |
| Spark-X2.6-4B-abliterated (BF16) | 4,11 B | 1.048.576 | safetensors, GPU/CPU | Apache-2.0 | Checkpoint completo, mayor calidad, requiere más memoria |
| Spark-X2.6-4B-abliterated-GGUF | 4,11 B | 1.048.576 | GGUF, llama.cpp/Ollama/LM Studio | Apache-2.0 | Ruta para hardware no Apple |
| XHToken/Spark-X2.6-4B | 4,11 B | 1.048.576 | safetensors | Apache-2.0 | Modelo base post-entrenado con rechazos intactos |

No se dispone de datos de benchmarks para comparar el rendimiento cualitativo frente a alternativas de otros autores.

## Limitaciones y advertencias

- La abliteración suprime deliberadamente las negativas: el modelo cumplirá peticiones que el base rechazaría, incluidas algunas que no debería. No hay filtrado de seguridad adicional.
- No debe exponerse tras un endpoint público sin moderación para terceros; la propia model card lo desaconseja explícitamente.
- La abliteración elimina direcciones de rechazo pero no añade capacidad ni criterio: la calidad de razonamiento y el conocimiento son los del modelo base.
- Riesgo de alucinación inherente a un modelo de 4,11 B parámetros; no se han publicado evaluaciones de fidelidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Con el modo thinking activado, es necesario presupuestar `max_tokens` generosos o las respuestas se truncarán a mitad del razonamiento.
- Dependencia exclusiva de Apple Silicon y `mlx-lm >= 0.32`; no hay soporte para CUDA ni ROCm en este repo.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de filtrado de seguridad traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- El modelo tiene 539 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX
- Checkpoint BF16 abliterated: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Release GGUF: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Release MLX 8-bit: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit
- Modelo base post-entrenado: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- MLX: https://github.com/ml-explore/mlx
- Perfil del autor: https://huggingface.co/xblack
- Apoyo al autor: https://buymeacoffee.com/vatsalbajpai
