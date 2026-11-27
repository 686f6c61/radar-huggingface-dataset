# Kiruba072/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera salidas de texto. Se presenta como una alternativa abierta (licencia Apache 2.0) orientada a desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas RAG. Su fecha de publicación indicada por el autor es el 20 de noviembre de 2026.

La arquitectura es un transformer decoder-only de 24 capas con capas de alimentación hacia delante de tipo Mixture-of-Experts (MoE) disperso: cada token se enruta a 8 de 128 expertos. Destaca el mecanismo de "looping": las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que produce 48 aplicaciones de capa por token a partir de 24 capas de pesos. El modelo declara 26,4B parámetros totales y 3,4B activos, con un contexto de hasta 1M tokens.

Es relevante ahora porque combina multimodalidad nativa, un contexto muy largo y un tamaño que permite ejecución en hardware local de gama alta (DGX Spark, Apple Silicon con 32 GB o más, GPUs con 32 GB de VRAM), algo poco habitual en modelos de esta categoría. El checkpoint se distribuye en precisiones mixtas NVFP4 y MXFP8 con un tamaño aproximado de 20 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas centrales en bucle (looped transformer) |
| Parámetros totales | 26.388.646.440 (26,4B) |
| Parámetros activos | 3,4B por pasada; 5,4B efectivos por token con tres pasadas |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 y MXFP8 (checkpoint original); GGUF cuantizado vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (mixed NVFP4/MXFP8); GGUF disponible |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas de pesos. Las 12 capas centrales se reutilizan tres veces, de modo que cada token atraviesa 48 aplicaciones de capa efectivas. Las capas de feed-forward son MoE disperso con 128 expertos y 8 expertos activados por token y capa. La atención combina capas locales y globales (híbrido), lo que probablemente contribuye a sostener el contexto de 1M tokens. La multimodalidad es nativa: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decoder.

El autor indica que los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El pipeline de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. El checkpoint se distribuye en precisiones NVFP4 y MXFP8, lo que sugiere un entrenamiento o post-entrenamiento optimizado para formatos de baja precisión en Blackwell y arquitecturas compatibles.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes (image-text-to-text) con entrada de píxeles entre 40 y 4096 px por dimensión.
- Razonamiento y tareas de lenguaje natural diversas.
- Soporte declarado para múltiples lenguajes de programación y uso en asistentes de código.
- Orientado a sistemas agénticos y de uso de herramientas (tool use) según la model card.
- Soporte multilingüe general, con inglés como idioma principal.
- Contexto de hasta 1M tokens para documentos largos y conversaciones multi-turno extensas.
- No se documentan modos de pensamiento explícito, audio ni salida distinta de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales muy largos gracias a su ventana de 1M tokens, manteniendo el contexto de incidencias previas sin resumir.
- Asistentes de código en producción: su soporte declarado para múltiples lenguajes de programación y tool calling permite integrarlo en pipelines de CI/CD para revisión de parches, generación de tests y explicación de errores.
- Análisis de documentos extensos con imágenes: informes con gráficos, contratos escaneados o manuales técnicos pueden procesarse en una sola pasada combinando texto e imagen en el mismo contexto.
- Sistemas RAG multimodales: recuperación de fragmentos de texto y figuras que se pasan al modelo junto con la consulta; el contexto largo reduce la necesidad de reordenar y truncar evidencias.
- Agentes multi-paso: integración en bucles de planificación y ejecución con llamadas a herramientas, usando la ventana larga para conservar el estado de la tarea.
- Despliegue en local para prototipado: al caber en un DGX Spark o en un Mac con 32 GB de memoria unificada, sirve para experimentar con modelos multimodales sin depender de la nube.
- Fine-tuning específico de dominio: al publicarse con pesos abiertos y Apache 2.0, puede ajustarse con Tinker, Unsloth, Miles o SkyRL para tareas verticales.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de esa tabla no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint original de aproximadamente 20 GB en NVFP4/MXFP8.
- Ejecución soportada en 1x NVIDIA DGX Spark.
- Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Otras GPUs con 32 GB o más de VRAM recomendados.
- Para cuantizaciones GGUF, llama.cpp y Ollama permiten reducir requisitos, aunque no se detallan tamaños por nivel de cuantización.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs.
- Post-entrenamiento soportado con Miles y SkyRL.
- No se proporcionan cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face y Tinker |
| Gemma 4 31B | 31B (según nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables aparecen solo como referencias en la tabla de evaluaciones de la model card; no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad específicas más allá de la mención genérica al filtrado de datos.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan tasas de error medidas.
- El soporte multilingüe se declara de forma genérica, con inglés como idioma principal; no hay listado de idiomas ni evaluaciones por idioma.
- La ventana de 1M tokens no garantiza un rendimiento uniforme en todo el contexto; no se publican resultados de aguja en pajar ni de recuperación a larga distancia.
- Aunque la licencia es Apache 2.0, el autor enlaza una Política de Uso Aceptable que conviene revisar antes de un despliegue comercial.
- El modelo se distribuye en precisiones NVFP4/MXFP8; la calidad en cuantizaciones GGUF adicionales puede diferir y no se documenta.
- El repositorio indicado en la información de Hugging Face (Kiruba072/Inkling-2-Mini) no coincide con el repositorio oficial citado en la model card (thinkingmachines/Inkling-2-Mini); conviene verificar la procedencia de los pesos antes de usarlos en producción.
- No hay datos publicados de latencia, throughput ni coste por token.

## Enlaces

- Hugging Face (repositorio indicado): https://huggingface.co/Kiruba072/Inkling-2-Mini
- Hugging Face (repositorio oficial citado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
