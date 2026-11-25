# netprojects/Inkling-2-Mini-MLX-3bit

## Resumen

Inkling-2-Mini-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo multimodal Inkling 2 Mini de Thinking Machines, preparada por el usuario netprojects para ejecución en Apple Silicon. El modelo original es un mixture-of-experts con 26.388.641.280 parámetros totales y aproximadamente 3.400 millones activos por token, con 24 capas de las cuales las doce centrales se ejecutan tres veces (48 pasadas de capa por token), entrada de texto e imagen y hasta 1 millón de tokens de contexto.

Esta build concreta re-cuantiza los expertos enrutados desde los valores NVFP4/MXFP8 originales a 3 bits afines con grupo 64, manteniendo 4 bits en las capas 0-1 y 20-23 (las que Thinking Machines conservó en MXFP8), atención a 6 bits y embeddings, capa de salida y codificador de visión a 4 bits. El resultado ocupa 14,1 GB más 0,64 GB del borrador de decodificación especulativa DSpark, lo que permite ejecutarlo en Macs de 24 GB de memoria unificada.

La relevancia actual radica en que es una de las primeras builds que aprovecha el soporte nativo de Inkling 2 Mini en MLX-VLM (desde el 21 de noviembre de 2026) e incluye el borrador DSpark empaquetado, con el que se alcanzan 75,2 tok/s de generación en un M5 Max, un 69 % más rápido que sin decodificación especulativa. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts con bucle de capas (inkling2_loop), transformer multimodal texto-imagen |
| Parametros totales | 26.388.641.280 |
| Parametros activos | Aproximadamente 3.400 millones por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | 3 bits afines grupo 64 en expertos enrutados (4 bits en capas 0-1 y 20-23), atención 6 bits, embeddings/salida/vision 4 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), mas mtp.safetensors para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts con 24 capas en el que las doce capas centrales se ejecutan tres veces, sumando 48 pasadas de capa por token. De los 26.400 millones de parámetros totales, solo unos 3.400 millones se activan por token gracias al enrutamiento de expertos. Incorpora un codificador de visión para entrada image-text-to-text y un cabezal de decodificación especulativa DSpark (multi-token prediction) empaquetado como `mtp.safetensors`.

Esta build no entrena el modelo: parte de la revisión `6e7c824` de `thinkingmachines/Inkling-2-Mini` y re-cuantiza los expertos enrutados desde NVFP4/MXFP8 a 3 bits afines con grupo 64, respetando en 4 bits las capas que el autor original mantuvo en MXFP8. Según la model card, el siguiente token coincide con la implementación Transformers de referencia en el 95,5 % de los casos (KL de 0,0424). No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modos de esfuerzo configurables (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` o un valor numérico de 0,0 a 0,99).
- Comprensión de imágenes: responde preguntas sobre capturas de pantalla, documentos o fotografías mediante el codificador de visión integrado.
- Razonamiento matemático: 48/50 en GSM8K (50 preguntas) según la model card.
- Generación de código y resolución de problemas técnicos.
- Tool calling / function calling en formato OpenAI mediante el servidor de `inkling2-mlx`, con las llamadas devueltas en `tool_calls` y el razonamiento separado en `reasoning_content`.
- Decodificación especulativa con el borrador DSpark incluido, con tamaño de bloque configurable (3 o 4 recomendados).
- Contexto largo de hasta 1 millón de tokens para conversaciones multi-turno y documentos extensos.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente de desarrollo en local: ejecutable en un Mac de 24 GB, permite autocompletado, explicación de código y depuración sin enviar código a servicios externos, con tool calling para integrarse en flujos de edición.
- Análisis de capturas y documentación técnica: el codificador de visión permite preguntar por errores en terminales, leer diagramas o extraer información de capturas, como muestra el ejemplo de la model card con `image=["screenshot.png"]`.
- Agente conversacional con contexto largo: la ventana de 1 millón de tokens permite mantener historiales extensos o procesar repositorios y manuales completos en una sola sesión.
- Razonamiento matemático asistido: con 48/50 en GSM8K, es adecuado para tutoría, verificación de cálculos y resolución de problemas paso a paso con `reasoning_effort` ajustable.
- Servidor OpenAI-compatible local: `mlx_vlm.server` expone una API compatible con OpenAI con tool calls, útil para prototipar aplicaciones que luego se migrarán a infraestructura en la nube.
- Procesamiento por lotes en estación de trabajo Apple: con 1.386 tok/s de procesamiento de prompt a 1K tokens y 44,4 tok/s de generación (75,2 con DSpark), sirve para tareas de resumen, clasificación o extracción sobre corpus moderados.
- Investigación en cuantización: la tabla de builds (2, 2,5, 3, 4 y 4-8 bits) con métricas de KL y coincidencia de siguiente token permite estudiar el compromiso entre tamaño y fidelidad en modelos MoE.

## Benchmarks y rendimiento

Datos publicados en la model card (MacBook Pro M5 Max de 128 GB, 21 de noviembre de 2026, mediana de 3 ejecuciones, decodificación codiciosa con razonamiento `none`):

| Metrica | 4-8bit | 4bit | 3bit (esta build) |
|---|---|---|---|
| Tamano | 19,5 GB + 0,64 GB | 16,5 GB + 0,64 GB | 14,1 GB + 0,64 GB |
| Coincidencia siguiente token vs. referencia | 98,4 % | 95,9 % | 95,5 % |
| KL vs. referencia | 0,0018 | 0,0291 | 0,0424 |
| GSM8K (50 preguntas) | 47/50 | 47/50 | 48/50 |
| Memoria pico, prompt de 8K | 27,8 GB | 23,5 GB | 21,2 GB |
| Procesamiento prompt 1K / 8K / 32K (tok/s) | 1752 / 1658 / 1208 | 1535 / 1412 / 1104 | 1386 / 1351 / 1075 |
| Generacion (tok/s) | 36,6 | 43,6 | 44,4 |
| Generacion con DSpark (tok/s) | 47,1 (bloque 3) | 70,9 (bloque 4) | 75,2 (bloque 4) |

Con `inkling2-mlx` v0.2.6 la generación simple en la build de 4 bits alcanza 84,1 tok/s (dato truncado en la model card). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval) en la información disponible.

## Requisitos de hardware

- Memoria: 14,1 GB de pesos más 0,64 GB del borrador DSpark; memoria pico de 21,2 GB con un prompt de 8K tokens, por lo que encaja en Macs de 24 GB de memoria unificada.
- GPU: exclusivamente Apple Silicon (MLX); no está pensado para CUDA. Las cifras de velocidad corresponden a un M5 Max de 128 GB.
- GPU de consumo: sí, en Macs con chip de la serie M y al menos 24 GB de memoria unificada.
- Despliegue: MLX-VLM desde `main` (soporte desde el 21 de noviembre de 2026, aún no en PyPI) o `internet-projects/inkling2-mlx` v0.2.6 para tool calls; servidor con `mlx_vlm.server`, incluyendo modo compatible con OpenAI.
- Latencia y throughput: 1.386 tok/s de procesamiento de prompt a 1K tokens y 44,4 tok/s de generación sin DSpark; 75,2 tok/s con DSpark (bloque 4). El tamaño de bloque por defecto del borrador (8) es más lento en este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria pico 8K | Licencia |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-3bit | 26,4B totales / ~3,4B activos | 1M | 3 bits | 21,2 GB | Apache 2.0 |
| Inkling-2-Mini-MLX-4bit | 26,4B totales / ~3,4B activos | 1M | 4 bits | 23,5 GB | Apache 2.0 |
| Inkling-2-Mini-MLX-4-8bit | 26,4B totales / ~3,4B activos | 1M | 4-8 bits | 27,8 GB | Apache 2.0 |
| Inkling-2-Mini-MLX-2.5bit | 26,4B totales / ~3,4B activos | 1M | 2,5 bits | No disponible | Apache 2.0 |

Frente a la build de 4 bits, esta versión ahorra 2,3 GB de memoria pico a costa de bajar del 95,9 % al 95,5 % de coincidencia de siguiente token y subir el KL de 0,0291 a 0,0424, manteniendo un rendimiento en GSM8K equivalente o superior (48/50 frente a 47/50). No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede razonar en exceso incluso con `reasoning_effort="none"` y quedarse atrapado en bucles de razonamiento largos; es imprescindible fijar `max_tokens`.
- La cuantización a 3 bits introduce divergencia respecto al modelo original: 4,5 % de tokens distintos y KL de 0,0424, superior al de las builds de 4 bits.
- Los archivos de pesos se renombraron el 21 de noviembre de 2026 (renombrado de los tensores de compuerta del bucle); las descargas anteriores deben repetirse.
- Requiere MLX-VLM desde `main` o `inkling2-mlx`; no funciona con la versión de PyPI de MLX-VLM en el momento de publicación.
- Depende de PyTorch y torchvision en CPU únicamente para el procesador de imágenes.
- Exclusivo de Apple Silicon; no hay soporte CUDA ni rutas de despliegue en vLLM, llama.cpp u Ollama indicadas en la información disponible.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Sesgos conocidos y tasa de alucinación no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Thinking Machines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 4-8 bits (recomendada): https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Build de 2 bits mixta: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2bit-mixed
- Build de 4 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4bit
- Repositorio con parser de tool calls: https://github.com/internet-projects/inkling2-mlx
- MLX-VLM (fork con soporte Inkling): https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
