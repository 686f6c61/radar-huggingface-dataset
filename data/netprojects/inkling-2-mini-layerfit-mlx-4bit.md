# netprojects/Inkling-2-Mini-LayerFit-MLX-4bit

## Resumen

Inkling-2-Mini-LayerFit-MLX-4bit es una cuantización de 4 bits del modelo Thinking Machines Inkling-2-Mini, empaquetada específicamente para Apple Silicon mediante la librería MLX. El modelo original es un mixture-of-experts (MoE) "looped" de 26.400 millones de parámetros totales con aproximadamente 3.400 millones activos por token, 24 capas (de las cuales las doce centrales se ejecutan tres veces, resultando en 48 pasadas de capa por token), entrada de texto e imagen y una ventana de contexto de hasta 1 millón de tokens. Esta build la publica el usuario netprojects e incorpora el borrador de decodificación especulativa DSpark (mtp.safetensors) junto con el codificador visual.

El interés de esta ficha no está en el modelo base, sino en la técnica de cuantización: LayerFit™ es una búsqueda de receta de bits por capa que, midiendo el impacto de cada elección sobre la salida del modelo, asigna más bits a las partes sensibles y menos a las que apenas se degradan. El resultado es una build de 16,5 GB que conserva el mismo tamaño que el antiguo 4-bit plano pero se acerca bastante más al modelo original (KL media de 0,0101 frente a 0,0291, una reducción del 65%). Es relevante porque permite ejecutar un MoE multimodal de 26B con contexto largo en Macs de 32 GB de memoria unificada, algo fuera del alcance de las cuantizaciones uniformes tradicionales.

La build carga en mlx-vlm estándar (sin runtime propio), soporta llamadas a herramientas en formato OpenAI a través de inkling2-mlx y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 49,4 GB, aunque los pesos efectivos son 16,5 GB más 0,64 GB del borrador especulativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas ("looped"); 24 capas, las 12 centrales se ejecutan 3 veces (48 pasadas por token); incluye codificador visual y borrador DSpark de decodificación especulativa |
| Parametros totales | 26.388.641.280 (~26,4B) |
| Parametros activos | ~3,4B por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | MLX affine por capa (LayerFit™): expertos en 4 o 5 bits (grupo 64), up de capa 19 a 3 bits (grupo 128), gate de capa 18 a 3 bits, atención 8 bits (grupo 64) en capas 0-18 y 6 bits en 19-23, embeddings 5 bits, capa de salida 6 bits, codificador visual 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` para el borrador especulativo y `quant-recipe.json` con la receta por capa |

## Arquitectura y entrenamiento

El modelo base es un MoE con enrutamiento por token y una estructura poco habitual: de las 24 capas del transformer, las doce intermedias se reejecutan tres veces, de modo que cada token atraviesa 48 pasadas de capa. Con 26,4B parámetros totales y ~3,4B activos, el coste computacional por token se mantiene bajo mientras la capacidad efectiva es alta. El modelo acepta texto e imagen (pipeline image-text-to-text) y declara contexto de hasta 1M tokens. Thinking Machines distribuyó los pesos originales en NVFP4 y MXFP8; esta build los recuantiza a MLX affine con una receta por capa.

La innovación de esta build concreta es LayerFit™: en lugar de aplicar la misma cuantización a todas las capas, se mide cuánto altera cada elección de bits la distribución de salida y se busca la asignación que minimiza la divergencia respecto al modelo original a un tamaño fijo. Los detalles del entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. Sí se documenta la integración del borrador DSpark para decodificación especulativa, que acelera la generación al proponer varios tokens por paso.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante el codificador visual incluido, cuantizado a 4 bits.
- Razonamiento matemático: la model card reporta 46/50 en GSM8K (50 preguntas) para esta build.
- Soporte de tool calling / function calling en formato OpenAI a través de inkling2-mlx.
- Decodificación especulativa con el borrador DSpark incluido (mtp.safetensors), que acelera la inferencia sin cambiar el modelo objetivo.
- Contexto largo de hasta 1M tokens para documentos extensos o conversaciones prolongadas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local en Mac: ejecutar un MoE de 26B en un Mac de 32 GB con memoria unificada, usando mlx-vlm estándar, para conversaciones privadas sin conexión. El tamaño de 16,5 GB deja margen para macOS y prompts largos.
- Análisis de documentos extensos: aprovechar la ventana de hasta 1M tokens para resumir o consultar contratos, informes o bases de código completas en una sola pasada.
- Procesamiento de documentos escaneados: combinar la entrada de imagen con la generación de texto para extraer y estructurar información de capturas, formularios o figuras.
- Agentes con herramientas: integrar el tool calling en formato OpenAI dentro de flujos de automatización que consulten APIs, ejecuten cálculos o recuperen datos externos.
- Prototipado de pipelines multimodales: validar en local arquitecturas image-text-to-text antes de desplegarlas en infraestructura con GPU, gracias a la compatibilidad con mlx-vlm sin runtime propio.
- Evaluación de cuantizaciones: usar `quant-recipe.json` y las métricas KL publicadas para estudiar el impacto de la cuantización por capa en modelos MoE, comparando con las builds de 2, 2.5, 3 y 4/8 bits del mismo autor.
- Generación asistida en编辑ores y scripts: con 46/50 en GSM8K y soporte de tool calling, sirve para tareas de cálculo y automatización en entornos de desarrollo sobre Apple Silicon.

## Benchmarks y rendimiento

Datos publicados en la model card para esta build y sus variantes, medidos frente a la implementación de referencia de Thinking Machines en Transformers:

| Build | Tamano | Mismo siguiente token que el codigo original | KL vs codigo original | GSM8K (50 preguntas) | Memoria pico con prompt de 8K |
|---|---|---|---|---|---|
| 4/8-bit (recomendada) | 19,5 GB + 0,64 GB | 98,4% | 0,0018 | 47/50 | 27,8 GB |
| LayerFit 3-bit | 14,1 GB + 0,64 GB | 95,5% | 0,0225 | 45/50 | 21,4 GB |
| LayerFit 2.5-bit | 10,8 GB + 0,64 GB | 91,0% | 0,0656 | 46/50 | 18,25 GB |
| LayerFit 2-bit | 9,5 GB + 0,64 GB | 90,2% | 0,1066 | 47/50 | 17,05 GB |
| **LayerFit 4-bit (esta build)** | 16,5 GB + 0,64 GB | 97,7% | 0,0101 | 46/50 | 23,6 GB |
| 4-bit plano (sustituido) | 16,5 GB | 95,9% | 0,0291 | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks estándar del modelo base.

## Requisitos de hardware

- VRAM/memoria unificada: 16,5 GB de pesos más 0,64 GB del borrador; memoria pico medida de 23,6 GB con un prompt de 8K tokens.
- Mac recomendado: 32 GB de memoria unificada para esta build; el autor la sitúa como opción de mayor fidelidad para 32 GB. Para 48 GB o más recomienda la build 4/8-bit (19,5 GB).
- Opciones para menos memoria: builds LayerFit de 3 bits (14,1 GB, pico 21,4 GB), 2.5 bits (10,8 GB, pico 18,25 GB) y 2 bits (9,5 GB, pico 17,05 GB, pensada para Macs de 16 GB).
- GPU: exclusivamente Apple Silicon; no está pensada para GPU NVIDIA. Para CUDA habría que recurrir a los pesos originales del modelo base.
- Despliegue: mlx-vlm estándar (rama main o próxima release) y la herramienta inkling2-mlx para tool calling en formato OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa DSpark está incluida para mejorar la velocidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-LayerFit-MLX-4bit (esta build) | 26,4B totales, ~3,4B activos | 1M | MLX safetensors, Apple Silicon | Apache 2.0 | KL 0,0101 vs original; 46/50 GSM8K |
| Inkling-2-Mini-MLX-4-8bit (mismo autor) | 26,4B totales, ~3,4B activos | 1M | MLX safetensors, Apple Silicon | Apache 2.0 | 19,5 GB; KL 0,0018; 47/50 GSM8K; recomendada para 48 GB+ |
| Inkling-2-Mini original (Thinking Machines) | 26,4B totales, ~3,4B activos | 1M | Pesos NVFP4/MXFP8, Transformers | no disponible en la información | Referencia de calidad; requiere infraestructura mayor |
| Qwen3.8-27B LayerFit MLX-4bit (mismo autor) | ~27B | no disponible | MLX safetensors, Apple Silicon | no disponible en la información | Alternativa de tamaño similar en el catálogo del autor |

## Limitaciones y advertencias

- La cuantización introduce degradación: esta build coincide con el modelo original en el 97,7% de los siguientes tokens y presenta una KL media de 0,0101; no es equivalente bit a bit al modelo de referencia.
- La receta LayerFit™ es específica de esta build y de la revisión `6e7c824` del modelo base; mezclar ficheros de otras builds o revisiones puede romper la coherencia de los pesos.
- Requiere Apple Silicon y mlx-vlm; no es portable a CUDA sin recurrir al modelo original.
- El contexto declarado llega a 1M tokens, pero la memoria pico medida con 8K tokens ya es de 23,6 GB en un Mac de 32 GB; prompts muy largos pueden exceder la memoria disponible.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base en la documentación proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Thinking Machines antes de desplegarlo en producción.
- El repositorio ocupa 49,4 GB aunque los pesos efectivos sean 16,5 GB; hay que prever espacio en disco para la descarga.
- No se han publicado cifras de latencia ni throughput; el rendimiento real dependerá del chip y de la gestión de memoria del sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build 4/8-bit recomendada: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Build 3-bit: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-3bit
- Build 2.5-bit: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2.5bit
- Build 2-bit: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2bit
- Qwen3.8-27B LayerFit MLX-4bit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-4bit
- Repositorio inkling2-mlx (tool calling): https://github.com/internet-projects/inkling2-mlx
- Catálogo de builds del autor: https://huggingface.co/netprojects
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
