# netprojects/Inkling-2-Mini-MLX-4-8bit

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) desarrollado por Thinking Machines, con 26.388.641.280 parámetros totales y aproximadamente 3.400 millones activos por token. Combina entrada de texto e imagen (pipeline `image-text-to-text`) y ofrece hasta 1 millón de tokens de contexto. Su arquitectura es peculiar: de sus 24 capas, las doce centrales se ejecutan tres veces, lo que da 48 pasadas de capa por token, un esquema que el autor denomina `inkling2_loop`.

La ficha que nos ocupa no es el modelo original, sino una conversión a MLX para Apple Silicon publicada por netprojects. Mantiene los expertos enrutados exactamente como los publicó Thinking Machines: NVFP4 de 4 bits en las capas 0-19 y MXFP8 de 8 bits en las capas 20-23, reempaquetados en los formatos nativos `nvfp4`/`mxfp8` de MLX sin alterar valores. Atención, embeddings, capa de salida y codificador visual permanecen en bf16. El resultado ocupa 19,5 GB más 0,64 GB del borrador de decodificación especulativa DSpark.

Es relevante ahora porque permite ejecutar un modelo multimodal de 26,4B con contexto de 1M en hardware Apple Silicon de gama alta, con soporte nativo en MLX-VLM desde el 21 de noviembre de 2026 y tool calling compatible con OpenAI. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (`inkling2_loop`): 24 capas, las 12 centrales se ejecutan 3 veces (48 pasadas por token) |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | ~3,4B por token |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | Expertos enrutados: NVFP4 4-bit (capas 0-19) y MXFP8 8-bit (capas 20-23); atención, embeddings, salida y visión en bf16. Builds alternativos: 4bit, 3bit, 2.5bit, 2bit-mixed |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), con borrador DSpark en `mtp.safetensors` |
| Tamano del repo | 19,5 GB + 0,64 GB del borrador (39,7 GB de repo total) |
| Libreria | MLX (mlx-vlm) |
| Modelo base | thinkingmachines/Inkling-2-Mini (revision `6e7c824`) |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer de mezcla de expertos con un diseño de capas recurrentes: de las 24 capas totales, las doce intermedias se aplican tres veces por token, lo que resulta en 48 pasadas de capa. Solo unos 3,4B de los 26,4B parámetros se activan por token, lo que reduce el coste computacional manteniendo la capacidad total. El modelo acepta texto e imagen mediante un codificador visual incluido en el paquete.

La conversión a MLX preserva la cuantización original de los expertos: NVFP4 en las capas 0-19 y MXFP8 en las 20-23, reempaquetados en formatos nativos de MLX sin pérdida de valores. Incluye el borrador de decodificación especulativa DSpark (`mtp.safetensors`), que permite acelerar la generación manteniendo la salida greedy del modelo original salvo en empates cercanos. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`reasoning_effort`: `none`, `minimal`, `low`, `medium`, `high` por defecto, `xhigh`, `max`, o un valor numérico entre 0.0 y 0.99).
- Comprensión de imágenes: entrada image-text-to-text mediante codificador visual incluido.
- Tool calling / function calling compatible con el formato OpenAI `tool_calls` a través de `inkling2-mlx`.
- Razonamiento multi-paso y uso como agente, con el pensamiento devuelto por separado en `reasoning_content`.
- Decodificación especulativa con el borrador DSpark incluido, que acelera la generación.
- Contexto largo de hasta 1M tokens.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de terminal y depuración: el modelo puede analizar capturas de pantalla de terminales o entornos de desarrollo y explicar errores, como muestra el ejemplo de la model card con `image=["screenshot.png"]`.
- Atención al cliente automatizada: con hasta 1M tokens de contexto puede mantener conversaciones multi-turno muy largas con historial completo y documentos adjuntos.
- Análisis de documentación técnica extensa: procesar manuales, repositorios o especificaciones de gran tamaño en una sola ventana de contexto.
- Generación y revisión de código en pipelines: integrable mediante servidor compatible con OpenAI y tool calling para tareas de CI/CD.
- Agentes autónomos multi-paso: el modo de razonamiento configurable y la salida separada de `reasoning_content` permiten orquestar agentes que planifican y ejecutan acciones.
- Procesamiento de imágenes en flujo local: análisis de capturas, diagramas o documentación visual en un Mac sin depender de la nube.
- Inferencia local en Apple Silicon: despliegue en portátiles y estaciones Mac de gama alta para privacidad de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card para esta conversión (GSM8K con 50 preguntas, y comparación con la implementación Transformers de Thinking Machines):

| Build | Tamano | Mismo siguiente token que el codigo original | KL vs codigo original | GSM8K (50 preguntas) | Memoria pico, prompt 8K |
|---|---|---|---|---|---|
| 4-8bit (esta build) | 19,5 GB + 0,64 GB | 98,4% | 0,0018 | 47/50 | 27,8 GB |
| 4bit | 16,5 GB + 0,64 GB | 95,9% | 0,0291 | 47/50 | 23,5 GB |
| 3bit | 14,1 GB + 0,64 GB | 95,5% | 0,0424 | 48/50 | 21,2 GB |
| 2.5bit | 10,8 GB + 0,64 GB | 91,0% | 0,0656 | 46/50 | 18,25 GB |
| 2bit-mixed | 9,5 GB + 0,64 GB | 90,2% | 0,1066 | 47/50 | 17,05 GB |

Velocidad medida en MacBook Pro M5 Max (128 GB), 21 de noviembre de 2026, mediana de 3 ejecuciones, decodificación greedy con `reasoning=none`:

| Build | Procesamiento de prompt 1K/8K/32K (tok/s) | Generación (tok/s) | Generación con DSpark (tok/s) |
|---|---|---|---|
| 4-8bit (esta build) | 1752 / 1658 / 1208 | 36,6 | 47,1 (×1,29, bloque 3) |
| 4bit | 1535 / 1412 / 1104 | 43,6 | 70,9 (×1,63, bloque 4) |
| 3bit | 1386 / 1351 / 1075 | 44,4 | 75,2 (×1,69, bloque 4) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Memoria pico de 27,8 GB con prompt de 8K tokens para esta build de 4-8 bits; 23,5 GB para la de 4bit; 21,2 GB para la de 3bit; 18,25 GB para la de 2.5bit; 17,05 GB para la de 2bit-mixed.
- Requiere Apple Silicon con MLX; el ejemplo de rendimiento usa un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Cabe en Macs de gama alta con memoria unificada suficiente (a partir de 32 GB para las builds más pequeñas, 32-48 GB recomendable para la de 4-8 bits).
- Despliegue mediante `mlx-vlm` (instalación desde main, Python 3.10+) o `internet-projects/inkling2-mlx` para tool calls.
- Servidor: `mlx_vlm.server` con soporte de borrador DSpark (`--draft-model`, `--draft-kind dflash`, `--draft-block-size 3`).
- Throughput de generación: 36,6 tok/s sin DSpark y 47,1 tok/s con DSpark en M5 Max para esta build; procesamiento de prompt de 1208-1752 tok/s según longitud.
- No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4-8bit (esta ficha) | 26,4B (3,4B activos) | 1M | NVFP4/MXFP8 mixta | Apache 2.0 | MLX / Apple Silicon |
| netprojects/Inkling-2-Mini-MLX-4bit | 26,4B (3,4B activos) | 1M | 4-bit | Apache 2.0 | MLX / Apple Silicon |
| netprojects/Inkling-2-Mini-MLX-3bit | 26,4B (3,4B activos) | 1M | 3-bit | Apache 2.0 | MLX / Apple Silicon |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B (3,4B activos) | 1M | bf16 + NVFP4/MXFP8 | Apache 2.0 | Transformers |

No se dispone de información sobre otros modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo puede pensar en exceso incluso con `reasoning_effort="none"` y quedarse atrapado en bucles de razonamiento largos; se recomienda fijar siempre `max_tokens`.
- La decodificación especulativa con DSpark mantiene la salida greedy del modelo salvo en empates cercanos, por lo que puede haber diferencias mínimas frente a la generación sin borrador.
- El tamaño del bloque por defecto del borrador (8) es más lento en este modelo; se recomienda usar bloques de 3 o 4.
- Los pesos se actualizaron el 21 de noviembre de 2026 (renombrado de tensores del loop-gate); las descargas anteriores deben repetirse.
- Requiere MLX-VLM desde main (no en release de PyPI en el momento de la publicación); PyTorch y torchvision solo se usan en CPU por el procesador de imágenes.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni cobertura idiomática.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original para uso comercial.
- El rendimiento medido corresponde a un M5 Max con 128 GB; en hardware inferior la velocidad y la memoria disponible pueden ser limitantes, especialmente con contexto de 1M tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build 3bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Build 2.5bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Build 2bit-mixed: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2bit-mixed
- Build 4bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4bit
- Repositorio inkling2-mlx (tool calls): https://github.com/internet-projects/inkling2-mlx
- MLX-VLM (fork con soporte Inkling): https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
