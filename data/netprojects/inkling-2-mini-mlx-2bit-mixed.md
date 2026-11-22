# netprojects/Inkling-2-Mini-MLX-2bit-mixed

## Resumen

Inkling-2-Mini-MLX-2bit-mixed es una cuantización de 2 bits mixta del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario netprojects para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es un mixture-of-experts (MoE) de 26.388.641.280 parámetros totales (unos 26,4B) con aproximadamente 3,4B parámetros activos por token, desarrollado por Thinking Machines. Este build concreto reduce los pesos a 9,5 GB (más 0,64 GB del borrador de decodificación especulativa DSpark) con el objetivo de que quepa en Macs de 16 GB de memoria unificada, un espacio históricamente insuficiente para modelos de esta escala.

La relevancia de esta ficha radica en su receta de cuantización por capas: no se aplica un único número de bits a todo el modelo, sino que cada grupo de capas recibe su propio número de bits y tamaño de grupo, elegidos midiendo cuánto altera cada opción la salida del modelo. Los expertos enrutados se re-cuantizan desde sus valores NVFP4/MXFP8 originales a 2 o 3 bits según la capa, la atención va de 4 a 6 bits y el encoder de visión se comprime a 2 bits. El resultado es un compromiso explícito entre tamaño y fidelidad respecto al modelo original.

El modelo conserva las capacidades multimodales del original (entrada de texto e imagen, pipeline image-text-to-text), el contexto de hasta 1M tokens y el soporte de tool calling mediante el servidor de MLX-VLM. Está pensado para desarrolladores que quieran probar un MoE multimodal de gran contexto en hardware de consumo Apple, aceptando una pérdida medible de fidelidad frente a los builds de mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con bucle de capas intermedias (inkling2_loop); 24 capas, de las cuales las 12 centrales se ejecutan tres veces (48 pasadas de capa por token); incluye encoder de visión |
| Parametros totales | 26.388.641.280 (~26,4B) |
| Parametros activos | ~3,4B por token |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | Cuantización afín estándar de MLX con receta mixta por capa: expertos enrutados a 2 bits (grupo 128) en capas 0-5, 14 y 19, y a 3 bits (grupo 128) en capas 20-23; en capas 6-13 y 15-17 gate y down a 3 bits y up a 2 bits (capa 9: los tres a 3 bits); capa 18 a 2 bits con down a 3 bits; atención a 6 bits (grupo 64) en capas 6-8 y 12, 5 bits (grupo 64) en capas 9-11 y 13-17, y 4 bits (grupo 128) en capas 0-5 y 18-23; embeddings a 4 bits (grupo 128); capa de salida a 4 bits (grupo 64); encoder de visión a 2 bits (grupo 128) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `mtp.safetensors` para el borrador DSpark y `quant-recipe.json` con la receta completa por capa |

## Arquitectura y entrenamiento

El modelo base es un MoE con bucle: 24 capas en total, de las cuales las doce centrales se recorren tres veces, lo que da 48 pasadas de capa por token. De los 26,4B parámetros totales, solo unos 3,4B se activan por token gracias al enrutamiento de expertos, lo que reduce el coste computacional de la inferencia. El modelo acepta entrada de texto e imagen (pipeline image-text-to-text) e incorpora un encoder de visión. El contexto máximo es de 1M tokens.

Esta build concreta no reentrena el modelo: parte de la revisión `6e7c824` de thinkingmachines/Inkling-2-Mini y aplica cuantización afín de MLX con una receta mixta por capa. Los expertos enrutados se re-cuantizan desde sus valores publicados en NVFP4/MXFP8. La elección de bits y tamaño de grupo por capa se hizo midiendo el impacto de cada opción en la salida del modelo. Además, el repositorio incluye el borrador de decodificación especulativa DSpark (`mtp.safetensors`, 0,64 GB), que se carga solo cuando se solicita explícitamente mediante `--draft-model` o `draft_model`. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Entrada de imagen (image-text-to-text) mediante el encoder de visión incluido; la precisión en tareas visuales se ve afectada por la cuantización a 2 bits del encoder.
- Soporte de tool calling / function calling en formato OpenAI a través del servidor de `mlx_vlm.server` y del parser de tool calls de inkling2-mlx.
- Decodificación especulativa opcional con el borrador DSpark (`mtp.safetensors`).
- Contexto largo de hasta 1M tokens (sujeto a los límites de memoria del hardware).
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de audio ni un modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional local en un Mac de 16 GB: el modelo puede mantener conversaciones multi-turno con un contexto amplio gracias a su ventana de hasta 1M tokens, aunque en la práctica el tamaño de prompt está limitado por la memoria (con prompt de 4K tokens y prefill step de 128 el pico fue de 10,6 GB).
- Automatización con tool calling: integrado en `mlx_vlm.server` mediante inkling2-mlx, puede emitir `tool_calls` en formato OpenAI para orquestar funciones externas en flujos de agente.
- Análisis de imágenes en local: al incluir encoder de visión, sirve para tareas de descripción o extracción de información de imágenes, asumiendo menor exactitud en detalles finos (en la comprobación del autor confundió un círculo con un óvalo).
- Prototipado de aplicaciones multimodales en Apple Silicon: permite validar pipelines image-text-to-text en hardware de consumo antes de migrar a builds de mayor precisión o a GPUs.
- Evaluación de modelos MoE con bucle de capas: útil para investigadores que quieran estudiar el comportamiento de arquitecturas inkling2_loop en entornos de memoria restringida.
- Pruebas de decodificación especulativa: el borrador DSpark incluido permite experimentar con aceleración por draft model en MLX, a cambio de 0,64 GB adicionales de memoria.
- Razonamiento aritmético básico: en la evaluación GSM8K de 50 preguntas obtuvo 47/50, por lo que es viable para tareas de matemáticas de nivel escolar en local.

## Benchmarks y rendimiento

Los datos disponibles provienen de las comprobaciones del autor del build, comparando contra la implementación Transformers de Thinking Machines sobre los pesos originales:

| Metrica | 2bit-mixed | 2.5bit | 3bit | 4bit | 4-8bit |
|---|---|---|---|---|---|
| Tamano de pesos | 9,5 GB + 0,64 GB draft | 10,8 GB + 0,64 GB | 14,1 GB + 0,64 GB | 16,5 GB + 0,64 GB | 19,5 GB + 0,64 GB |
| Mismo siguiente token que el código original | 90,2% | 91,0% | 95,5% | 95,9% | 98,4% |
| KL medio vs. código original | 0,1066 | 0,0656 | 0,0424 | 0,0291 | 0,0018 |
| GSM8K (50 preguntas) | 47/50 | 46/50 | 48/50 | 47/50 | 47/50 |
| Memoria pico con prompt de 8K tokens | 17,05 GB | 18,25 GB | 21,2 GB | 23,5 GB | 27,8 GB |

Además, el autor indica que las respuestas greedy coinciden con las del código original durante los primeros 6, 10 y 5 de 24 tokens (frente a 6, 14 y 24 del build de 2,5 bits). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,5 GB de pesos; pico de 9,34 GB respondiendo las 50 preguntas de GSM8K con prompts cortos; 16,14 GB con prompt de 4K tokens y 17,05 GB con prompt de 8K tokens usando los ajustes por defecto.
- Con prefill step de 128 y sin borrador DSpark, el pico con prompt de 4K tokens baja a 10,6 GB, justo por debajo del límite por defecto de un Mac de 16 GB (unos 10,7 GB asignados a la GPU).
- Hardware objetivo: Macs con 16 GB de memoria unificada (Apple Silicon). Para prompts largos o para usar el borrador DSpark se recomienda elevar el límite con `sudo sysctl iogpu.wired_limit_mb=12288`, dejando unos 4 GB para macOS.
- No cabe en GPUs de consumo tipo RTX 4090 en su formato MLX; el formato es específico de Apple Silicon.
- Despliegue: MLX-VLM desde main (soporte añadido el 21 de noviembre de 2026, aún no en PyPI) o internet-projects/inkling2-mlx v0.2.4 para tool calls en formato OpenAI. Comandos: `mlx_vlm.generate` y `mlx_vlm.server` con `--prefill-step-size 128`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Build | Parametros | Contexto | Pesos | Fidelidad (mismo token) | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-2bit-mixed | 26,4B (3,4B activos) | 1M | 9,5 GB | 90,2% | 47/50 | Apache 2.0 |
| Inkling-2-Mini-MLX-2.5bit | 26,4B (3,4B activos) | 1M | 10,8 GB | 91,0% | 46/50 | Apache 2.0 |
| Inkling-2-Mini-MLX-3bit | 26,4B (3,4B activos) | 1M | 14,1 GB | 95,5% | 48/50 | Apache 2.0 |
| Inkling-2-Mini-MLX-4bit | 26,4B (3,4B activos) | 1M | 16,5 GB | 95,9% | 47/50 | Apache 2.0 |
| Inkling-2-Mini-MLX-4-8bit (recomendado por el autor) | 26,4B (3,4B activos) | 1M | 19,5 GB | 98,4% | 47/50 | Apache 2.0 |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits mixta degrada la fidelidad: solo coincide con el siguiente token del código original en el 90,2% de las posiciones y el KL medio es 0,1066, el peor de la familia de builds publicada.
- Las respuestas greedy divergen pronto del original (coinciden solo 6, 10 y 5 de 24 tokens en las tres pruebas del autor).
- El encoder de visión a 2 bits reduce la exactitud en tareas de imagen; el propio autor documenta un error de clasificación de forma (círculo descrito como óvalo).
- El uso con prompts largos supera la memoria asignada por defecto a la GPU en Macs de 16 GB; requiere ajustar el límite del sistema y el prefill step, y renunciar al borrador DSpark.
- El soporte en MLX-VLM no está en una release de PyPI en el momento de la publicación; hay que instalar desde main o desde el fork de inkling2-mlx.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos originales de Thinking Machines.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2bit-mixed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 2,5 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4bit
- Build de 4-8 bits (recomendado por el autor): https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Fork de MLX-VLM con parser de tool calls: https://github.com/internet-projects/inkling2-mlx
- MLX-VLM: https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
