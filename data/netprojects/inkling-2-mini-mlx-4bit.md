# netprojects/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Inkling 2 Mini de Thinking Machines, preparada por netprojects para su ejecución en Apple Silicon. El modelo original es un transformer de mezcla de expertos (MoE) con 26.388.641.280 parámetros totales y aproximadamente 3.400 millones activos por token, que combina entrada de texto e imagen y soporta hasta 1 millón de tokens de contexto. Esta build concreta re-cuantiza a 4 bits afín simple (grupo 64) los pesos liberados en formato comprimido, incluyendo atención, embeddings y capa de salida, mientras que el codificador de visión se mantiene tal cual se publicó.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de gran tamaño en hardware de consumo de Apple con un peso de 16,5 GB más un borrador de decodificación especulativa de 0,64 GB. Incluye el borrador DSpark (`mtp.safetensors`) para decodificación especulativa y es compatible con mlx-vlm desde el 21 de noviembre de 2026, además de ofrecer llamadas a herramientas en formato OpenAI a través del fork inkling2-mlx.

La arquitectura "looped" es el rasgo distintivo: de sus 24 capas, las doce centrales se ejecutan tres veces, lo que resulta en 48 pasadas de capa por token. Esta build se posiciona como la opción de 4 bits "plana" frente a la variante 4/8-bit, que conserva los valores de expertos originales con mayor fidelidad pero menor velocidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (inkling2_loop); 24 capas, las 12 centrales ejecutadas 3 veces (48 pasadas por token) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | Aproximadamente 3.400 millones por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | 4 bits afín simple (grupo 64); existen builds de 4/8-bit, 3-bit, 2.5-bit y 2-bit mixta |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX); borrador DSpark en `mtp.safetensors` |
| Tamano del repo | 32,9 GB (pesos 4-bit: 16,5 GB + 0,64 GB de borrador) |
| Entrada | Texto e imagen (image-text-to-text) |
| Libreria | mlx |
| Modelo base | thinkingmachines/Inkling-2-Mini (revision `6e7c824`) |

## Arquitectura y entrenamiento

Inkling 2 Mini es un modelo de mezcla de expertos con una innovación estructural denominada "looped": de sus 24 capas, las doce intermedias se ejecutan tres veces por token, dando lugar a 48 pasadas de capa efectivas. Con 26.400 millones de parámetros totales y unos 3.400 millones activos por token, el modelo mantiene un coste de cómputo por token relativamente bajo pese a su tamaño total. Incorpora un codificador de visión para entrada de imágenes y un cabezal de decodificación especulativa DSpark empaquetado como borrador separado (`mtp.safetensors`), que permite acelerar la generación mediante decodificación especulativa.

Esta build concreta re-cuantiza a 4 bits afín simple con grupo 64 todos los tensores que Thinking Machines liberó en forma comprimida, más atención, embeddings y capa de salida; el codificador de visión se conserva en su forma original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base incluye una plantilla de chat con parámetro `reasoning_effort` (valores `none`, `minimal`, `low`, `medium`, `high` por defecto, `xhigh`, `max` o un número entre 0,0 y 0,99), lo que sugiere un entrenamiento orientado a razonamiento configurable.

## Capacidades

- Generación de texto conversacional con modo de razonamiento configurable mediante `reasoning_effort`.
- Entrada multimodal de imagen y texto: puede responder preguntas sobre capturas de pantalla, documentos o imágenes.
- Razonamiento multi-paso con cadenas de pensamiento extensas (el autor advierte que puede entrar en bucles de razonamiento largos).
- Llamadas a herramientas en formato OpenAI (`tool_calls`) a través del servidor de inkling2-mlx.
- Decodificación especulativa con el borrador DSpark incluido, con tamaños de bloque ajustables (3 o 4 recomendados).
- Capacidades matemáticas y de código: la model card reporta 47/50 en GSM8K con 50 preguntas.
- Contexto largo de hasta 1 millón de tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Servidor compatible con OpenAI que separa el razonamiento (`reasoning_content`) de la respuesta final.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de capturas de pantalla y errores de terminal: el modelo acepta imágenes y texto, por lo que puede recibir una captura de pantalla de un fallo y explicar el error mostrado, como demuestra el ejemplo de la model card con `image=["screenshot.png"]`.
- Asistencia matemática y resolución de problemas: con 47/50 en GSM8K en esta cuantización, es adecuado para tutores o asistentes de ejercicios paso a paso, ajustando `reasoning_effort` según la dificultad.
- Procesamiento de documentos largos: su ventana de hasta 1 millón de tokens permite resumir o consultar contratos, informes o bases de código extensas sin fragmentación agresiva.
- Agentes con llamadas a herramientas: el servidor OpenAI-compatible con `tool_calls` permite integrarlo en pipelines de agentes que consultan APIs, bases de datos o ejecutan comandos.
- Asistente de desarrollo local en Mac: con 16,5 GB de pesos y 23,5 GB de memoria pico con prompt de 8K tokens, cabe en un MacBook con 32 GB o más, ofreciendo asistencia de código y razonamiento sin conexión.
- Chat de atención al cliente multi-turno: el contexto largo y el modo de razonamiento configurable permiten mantener conversaciones con historial extenso y derivar a herramientas internas cuando sea necesario.
- Generación de código asistida en local: puede integrarse en editores o scripts mediante la API compatible con OpenAI, con decodificación especulativa para reducir latencia (70,9 tok/s con DSpark frente a 43,6 tok/s sin él en M5 Max).

## Benchmarks y rendimiento

Datos de la model card para esta build y las alternativas del mismo autor:

| Build | Tamano | Mismo siguiente token que el codigo de Thinking Machines | KL vs su codigo | GSM8K (50 preguntas) | Memoria pico, prompt 8K |
|---|---|---|---|---|---|
| 4-8bit (recomendada) | 19,5 GB + 0,64 GB | 98,4% | 0,0018 | 47/50 | 27,8 GB |
| 3bit | 14,1 GB + 0,64 GB | 95,5% | 0,0424 | 48/50 | 21,2 GB |
| 2.5bit | 10,8 GB + 0,64 GB | 91,0% | 0,0656 | 46/50 | 18,25 GB |
| 2bit-mixed | 9,5 GB + 0,64 GB | 90,2% | 0,1066 | 47/50 | 17,05 GB |
| 4bit (esta build) | 16,5 GB + 0,64 GB | 95,9% | 0,0291 | 47/50 | 23,5 GB |

Velocidad en MacBook Pro M5 Max (128 GB), mediana de 3 ejecuciones, decodificación con 5 prompts × 256 tokens, greedy, razonamiento `none`:

| Build | Procesamiento de prompt 1K / 8K / 32K (tok/s) | Generación (tok/s) | Generación con DSpark (tok/s) |
|---|---|---|---|
| 4-8bit | 1752 / 1658 / 1208 | 36,6 | 47,1 (×1,29, bloque 3) |
| 4bit (esta build) | 1535 / 1412 / 1104 | 43,6 | 70,9 (×1,63, bloque 4) |
| 3bit | 1386 / 1351 / 1075 | 44,4 | 75,2 (×1,69, bloque 4) |

Con inkling2-mlx v0.2.6 (decodificación y lectura de prompt más rápidas, activadas por defecto; mismo texto greedy que MLX-VLM original, KL máx. 0,014), la generación plana en esta build alcanza 84,1 tok/s. El tamaño de bloque por defecto del borrador (8) es más lento en este modelo; se recomienda usar 3 o 4. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,5 GB de pesos + 0,64 GB de borrador; memoria pico de 23,5 GB con prompt de 8K tokens.
- Hardware objetivo: Apple Silicon (MLX). Los datos de velocidad se midieron en un MacBook Pro M5 Max con 128 GB.
- Cabe en GPU de consumo de Apple: sí, en equipos con al menos 32 GB de memoria unificada; con 24 GB el margen es muy ajustado para prompts largos.
- No está pensado para GPU NVIDIA/AMD: el formato es MLX y la librería es mlx-vlm; para CUDA habría que usar el modelo base en Transformers.
- Despliegue: mlx-vlm desde main (soporte desde el 21 de noviembre de 2026, aún no en PyPI) o el fork inkling2-mlx v0.2.6 para llamadas a herramientas; servidor con `mlx_vlm.server --model ... --draft-model ... --draft-kind dflash --draft-block-size 4`.
- Throughput medido: 43,6 tok/s de generación plana y 70,9 tok/s con DSpark en M5 Max; 84,1 tok/s con inkling2-mlx v0.2.6. Procesamiento de prompt de 1535 tok/s a 1K tokens y 1104 tok/s a 32K.
- Dependencias: Python 3.10 o superior, torch y torchvision (solo para el procesador de imágenes en CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (50 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4bit (esta build) | 26,4B totales / ~3,4B activos | 1M tokens | 47/50 | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini-MLX-4-8bit | 26,4B totales / ~3,4B activos | 1M tokens | 47/50 | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini-MLX-3bit | 26,4B totales / ~3,4B activos | 1M tokens | 48/50 | Apache 2.0 | Hugging Face, MLX |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B totales / ~3,4B activos | 1M tokens | No disponible | Apache 2.0 | Hugging Face, Transformers |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de bucles de razonamiento: Thinking Machines advierte que el modelo puede pensar extensamente incluso con `reasoning_effort=none` y quedarse atrapado en bucles; es imprescindible fijar `max_tokens`.
- Pérdida de fidelidad por cuantización: esta build coincide con el código de referencia en el 95,9% de los siguientes tokens, con KL de 0,0291 frente al original; la variante 4/8-bit es más fiel (98,4%, KL 0,0018).
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento uniforme fuera del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base thinkingmachines/Inkling-2-Mini por si añade términos adicionales.
- Requiere Apple Silicon y MLX; no es desplegable directamente en CUDA sin recurrir al modelo base.
- El soporte en mlx-vlm aún no está en una release de PyPI; hay que instalar desde main o desde el fork inkling2-mlx.
- Los archivos de pesos se renombraron el 21 de noviembre de 2026 (renombrado de tensores de compuerta del bucle, valores sin cambios): las descargas anteriores deben repetirse.
- El borrador DSpark con tamaño de bloque por defecto (8) es más lento en este modelo; usar 3 o 4.
- La decodificación especulativa mantiene la salida greedy del modelo salvo en empates cercanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build 4/8-bit recomendada: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Build 3-bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Build 2.5-bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Build 2-bit mixta: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2bit-mixed
- Fork con parser de tool calls: https://github.com/internet-projects/inkling2-mlx
- MLX-VLM (fork con soporte Inkling): https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
