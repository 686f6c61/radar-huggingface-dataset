# netprojects/Inkling-2-Mini-MLX-2.5bit

## Resumen

Inkling-2-Mini-MLX-2.5bit es una cuantización de 2,5 bits del modelo multimodal Inkling-2-Mini de Thinking Machines, adaptada para ejecutarse en Apple Silicon mediante el framework MLX. El modelo base es un mixture-of-experts (MoE) con arquitectura "looped" de 26.400 millones de parámetros totales, unos 3.400 millones activos por token, 24 capas (de las cuales las doce centrales se ejecutan tres veces, sumando 48 pasadas de capa por token), entrada de texto e imagen y una ventana de contexto de hasta 1 millón de tokens.

El autor de esta conversión es el usuario netprojects, que distribuye varias recetas de cuantización para el mismo modelo base (2bit-mixed, 2.5bit, 3bit, 4bit y 4-8bit). Esta build concreta aplica una receta de precisión mixta por capas y grupos: los expertos enrutados usan 3 bits (grupo 128) en la mayoría de capas, 2 bits (grupo 128) en las capas 18-19, la atención varía entre 6, 5 y 4 bits según la capa, los embeddings son de 3 bits, la capa de salida de 4 bits y el codificador visual de 2 bits. El resultado ocupa 10,8 GB más un borrador de decodificación especulativa DSpark de 0,64 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE multimodal de 26B parámetros en equipos Apple Silicon de gama alta, algo imposible con los pesos originales en NVFP4/MXFP8. El coste es una pérdida medible de fidelidad respecto a la implementación de referencia de Thinking Machines: un 91 % de coincidencia en el siguiente token y un KL de 0,0656, con un rendimiento en GSM8K de 46/50 frente a los 47/50 de las builds de mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (24 capas, las 12 centrales ejecutadas 3 veces = 48 pasadas por token) |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | ~3,4B por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | MLX affine con receta mixta por capas: expertos 3-bit (grupo 128) en capas 0-17 y 20-23 salvo gate de capa 14 (2-bit); capas 18-19 expertos 2-bit (grupo 128) con down projections 3-bit; atención 6-bit (grupo 64) en capas 6-8 y 12, 5-bit (grupo 64) en capas 0-17, 4-bit (grupo 128) en capas 18-23; embeddings 3-bit (grupo 128); capa de salida 4-bit (grupo 64); codificador visual 2-bit (grupo 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura transformer de mezcla de expertos con una innovación estructural denominada "looped": de las 24 capas totales, las doce centrales se ejecutan tres veces por token, de modo que el cómputo efectivo equivale a 48 pasadas de capa aunque solo existan 24 conjuntos de pesos. Con 26,4B parámetros totales y aproximadamente 3,4B activos por token, el modelo mantiene un coste de inferencia propio de un modelo de ~3B mientras conserva la capacidad de representación de uno de 26B. El modelo procesa tanto texto como imágenes mediante un codificador visual integrado.

Esta build concreta no reentrena el modelo: parte de la revisión `6e7c824` de los pesos publicados por Thinking Machines en NVFP4/MXFP8 y los recuantiza a MLX affine con una receta de precisión mixta por grupos de capas. La receta se eligió midiendo cuánto altera cada combinación de bits y tamaño de grupo la salida del modelo, y se documenta en `quant-recipe.json`. Se incluye el borrador de decodificación especulativa DSpark (`mtp.safetensors`, 0,64 GB), que acelera la generación al proponer tokens que el modelo principal verifica. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 1M tokens.
- Entrada de imagen (pipeline image-text-to-text): el codificador visual está incluido, aunque cuantizado a 2 bits.
- Razonamiento matemático: la model card reporta 46/50 en GSM8K con esta build.
- Tool calling en formato OpenAI (`tool_calls`) a través del servidor `mlx_vlm.server` con el paquete `inkling2-mlx`.
- Decodificación especulativa mediante el borrador DSpark incluido.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" o razonamiento multi-paso explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en 10,8 GB de pesos y permite conversaciones multi-turno con contexto largo (hasta 1M tokens) sin salir del equipo, útil para prototipado de agentes en Apple Silicon.
- Análisis de documentos extensos: con una ventana de 1M tokens se pueden cargar manuales, contratos o bases de código completas y hacer preguntas sobre ellos en una sola pasada, aunque conviene validar la fidelidad por la cuantización agresiva.
- Descripción y preguntas sobre imágenes: el codificador visual integrado permite tareas de image-text-to-text, si bien la cuantización a 2 bits del encoder reduce la exactitud (la model card documenta que confundió un círculo con un óvalo en una prueba de colores y posiciones).
- Automatización con tool calling: mediante `inkling2-mlx` y el servidor MLX-VLM se pueden exponer funciones en formato OpenAI y construir pipelines de agentes que invoquen APIs externas.
- Evaluación y benchmarking de cuantizaciones: esta build sirve como referencia de compromiso entre tamaño (10,8 GB) y fidelidad (91 % de coincidencia de siguiente token, KL 0,0656) para quienes investigan recetas de cuantización mixta en MLX.
- Prototipado de razonamiento matemático en local: con 46/50 en GSM8K, es adecuada para validar flujos de resolución de problemas aritméticos antes de escalar a builds de mayor precisión.
- Desarrollo de aplicaciones MLX-VLM: al cargarse con `mlx_vlm.load` estándar, sirve para probar integraciones de visión y lenguaje en el ecosistema MLX.

## Benchmarks y rendimiento

Datos publicados en la model card para esta build y las builds hermanas del mismo autor. La columna "código de Thinking Machines" se refiere a su implementación en Transformers sobre los pesos originales.

| Build | Tamano | Coincidencia siguiente token | KL vs referencia | GSM8K (50 preguntas) | Memoria pico, prompt 8K |
|---|---|---|---|---|---|
| MLX-4-8bit (recomendada) | 19,5 GB + 0,64 GB | 98,4 % | 0,0018 | 47/50 | 27,8 GB |
| MLX-3bit | 14,1 GB + 0,64 GB | 95,5 % | 0,0424 | 48/50 | 21,2 GB |
| **MLX-2.5bit (esta)** | **10,8 GB + 0,64 GB** | **91,0 %** | **0,0656** | **46/50** | **18,25 GB** |
| MLX-2bit-mixed | 9,5 GB + 0,64 GB | 90,2 % | 0,1066 | 47/50 | 17,05 GB |
| MLX-4bit | 16,5 GB + 0,64 GB | 95,9 % | 0,0291 | 47/50 | 23,5 GB |

Comparación con la versión anterior de esta misma build (revisión `69d99db6ec77`): coincidencia de siguiente token 87,5 % → 91,0 %, KL 0,1899 → 0,0656, GSM8K 45/50 → 46/50, y respuestas greedy coincidentes con la referencia en 6, 14 y 24 tokens de 24 (antes 4, 9 y 4) para tres prompts.

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory: 10,8 GB de pesos más 0,64 GB de borrador DSpark. Memoria pico medida de 18,25 GB con prompt de 8K tokens.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada para uso cómodo; en un Mac de 16 GB el límite por defecto del GPU (~10,7 GB) es insuficiente y requiere `sudo sysctl iogpu.wired_limit_mb=12288` (con prompt de 4K, prefill step 128 y sin DSpark la pico fue de 11,9 GB), o bien usar la build 2bit-mixed (pico de 10,6 GB en la misma prueba).
- Cabe en GPU de consumo: sí, en Macs Apple Silicon; no está pensada para GPUs NVIDIA (el formato es MLX).
- Opciones de despliegue: MLX-VLM desde `main` (soporte nativo desde el 21 de noviembre de 2026, aún no en PyPI), o `internet-projects/inkling2-mlx` v0.2.4 para tool calls en formato OpenAI. Requiere Python 3.10 o superior, más PyTorch y torchvision solo para el procesador de imagen en CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini MLX-2.5bit (esta) | 26,4B totales / ~3,4B activos | 1M | 46/50 | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini MLX-4-8bit (misma familia) | 26,4B / ~3,4B activos | 1M | 47/50 | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini MLX-2bit-mixed (misma familia) | 26,4B / ~3,4B activos | 1M | 47/50 | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini original (Thinking Machines) | 26,4B / ~3,4B activos | 1M | 47/50 (referencia) | Apache 2.0 | Hugging Face, Transformers |

No se dispone de información sobre modelos de otras familias comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,5 bits degrada la fidelidad: solo el 91 % de coincidencia en el siguiente token respecto a la implementación de referencia y KL de 0,0656; no es adecuada para tareas que exijan paridad exacta con el modelo original.
- El codificador visual a 2 bits reduce la exactitud en tareas de imagen: en la prueba de la model card identificó colores y posiciones pero confundió un círculo con un óvalo. No recomendable para visión de precisión.
- Riesgo de alucinación inherente a modelos de lenguaje; la cuantización agresiva puede incrementarlo en dominios especializados.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que se observe empíricamente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y esta conversión deben citarse adecuadamente; conviene revisar los términos del modelo original de Thinking Machines.
- Requiere instalar MLX-VLM desde `main` (no hay release en PyPI en el momento de la model card), lo que implica dependencia de una rama de desarrollo y posibles roturas.
- En Macs de 16 GB hay que elevar el límite de memoria del GPU con `sysctl`, lo que deja unos 4 GB para macOS y exige cerrar otras aplicaciones; el ajuste no persiste tras reiniciar.
- Los archivos se reemplazaron el 22 de noviembre de 2026: si se descargó antes, hay que volver a descargar para obtener la receta nueva.
- No hay datos publicados de MMLU, HumanEval ni de latencia/throughput, lo que limita la evaluación previa a producción.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Revisión anterior de esta build: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit/tree/69d99db6ec77481a098af29a94519cc18c374093
- Build recomendada 4-8bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Build 3bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Build 2bit-mixed: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2bit-mixed
- Build 4bit: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio inkling2-mlx (tool calls): https://github.com/internet-projects/inkling2-mlx
- MLX-VLM (fork con soporte Inkling): https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
