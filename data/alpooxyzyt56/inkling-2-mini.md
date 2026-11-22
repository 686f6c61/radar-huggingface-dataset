# AlpooXYZyt56/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: asistentes de código, chatbots, sistemas agénticos con uso de herramientas y pipelines de generación aumentada por recuperación (RAG). Su relevancia radica en combinar una arquitectura poco habitual (transformer con capas repetidas en bucle) con un tamaño contenido de 26.400 millones de parámetros totales que, gracias al enrutamiento disperso de expertos, activa una fracción reducida por token.

La arquitectura es un transformer decoder-only de 24 capas con capas de alimentación hacia delante de tipo Mixture-of-Experts (MoE) disperso: cada token se enruta a 8 de 128 expertos por capa. Las 12 capas centrales se ejecutan tres veces compartiendo pesos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido.

El checkpoint se distribuye en unas 20 GB con precisiones mixtas NVFP4 y MXFP8, lo que permite inferencia en hardware local de gama alta para consumidores, como un DGX Spark o equipos Apple Silicon con 32 GB o más de memoria. Declara una ventana de contexto de hasta 1 millón de tokens, un dato destacable para su categoría de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas repetidas en bucle (looped transformer); atención híbrida local/global; vision transformer para imágenes |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3,4B base; 5,4B efectivos por token con las tres pasadas del bucle (cada pasada adicional añade ~1,0B efectivos) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos nativos en NVFP4 y MXFP8; versiones GGUF cuantizadas disponibles vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint único de ~20 GB en precisiones mixtas NVFP4/MXFP8); GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas de pesos. Las 12 capas centrales se aplican tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa. Cada capa incluye capas feed-forward de MoE disperso con 128 expertos, de los cuales se activan 8 por token. La atención combina capas locales y globales. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta, junto con el texto, a un espacio oculto compartido que procesa el decoder. El rango óptimo declarado para cada dimensión de imagen va de 40 px a 4096 px.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles públicamente, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones y conversación multi-turno.
- Comprensión de imágenes (image-text-to-text): descripción, respuesta a preguntas visuales y tareas que combinan texto e imagen.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte declarado para sistemas agénticos y uso de herramientas (tool use), según la model card.
- Capacidad de manejar contextos muy largos, hasta 1M tokens, útil para documentos extensos y conversaciones prolongadas.
- Soporte multilingüe general, con inglés como idioma principal.
- Ajuste fino disponible a través de la plataforma Tinker y de frameworks de post-entrenamiento como Miles y SkyRL.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y editores para autocompletado, revisión y generación de parches, apoyándose en su soporte de tool calling y en su capacidad multilingüe de programación.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1M tokens, lo que permite mantener el historial completo de la interacción sin truncar.
- Análisis de documentos extensos con imágenes: al aceptar texto e imagen de forma nativa, puede procesar informes, facturas o manuales escaneados junto con su texto asociado en una sola pasada.
- Sistemas RAG: su contexto de 1M tokens permite inyectar grandes volúmenes de fragmentos recuperados y mantener coherencia en la respuesta.
- Agentes autónomos multi-paso: el soporte de tool use y razonamiento multi-paso lo hace adecuado para orquestar llamadas a APIs y flujos de trabajo encadenados.
- Asistencia visual accesible: descripción de imágenes y respuesta a preguntas sobre contenido visual para aplicaciones de accesibilidad.
- Despliegue en hardware local: con un checkpoint de ~20 GB y soporte en DGX Spark, Apple Silicon (32 GB+) y GPUs con 32 GB o más de VRAM, es viable para prototipos y despliegues en el borde sin infraestructura de centro de datos.
- Ajuste fino específico de dominio: mediante Tinker, Miles o SkyRL, para adaptar el modelo a tareas concretas de la organización.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones que compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero el contenido de la información proporcionada se interrumpe antes de mostrar las filas de resultados. Por tanto, no se dispone de las cifras concretas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Checkpoint único de ~20 GB en precisiones mixtas NVFP4 y MXFP8.
- 1x NVIDIA DGX Spark soportado oficialmente.
- Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Otras GPUs y plataformas son posibles, con 32 GB o más de VRAM recomendados.
- Frameworks de inferencia soportados: Hugging Face (transformers), SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF) y Llama App.
- En Apple Silicon: Ollama y Exo Labs.
- Post-entrenamiento: Miles y SkyRL, además de la plataforma Tinker.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 5,4B efectivos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face, Tinker, SGLang, vLLM, llama.cpp, Ollama |
| Gemma 4 31B | 31B (según denominación) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según denominación) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables se citan en la tabla de evaluaciones de la model card, pero no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación en la información proporcionada.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; al entrenarse con datos de internet, es previsible que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación más allá del filtrado de datos.
- El soporte multilingüe se declara como "general", sin listado de idiomas ni evaluaciones por idioma; el rendimiento fuera del inglés no está cuantificado.
- Aunque declara contexto de 1M tokens, no se aportan evaluaciones de rendimiento en contextos largos que confirmen la calidad en esa longitud.
- La licencia Apache 2.0 permite uso comercial, pero existe una Política de Uso Aceptable del modelo que conviene revisar antes de desplegarlo en producción.
- El checkpoint requiere precisiones NVFP4/MXFP8 nativas o cuantizaciones GGUF; el soporte y la calidad en otras configuraciones no están documentados.
- El modelo tiene 0 descargas y 0 likes en el repositorio indicado, y la fecha de creación del repositorio es posterior a la fecha de publicación declarada en la model card; conviene verificar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face (repositorio indicado): https://huggingface.co/AlpooXYZyt56/Inkling-2-Mini
- Hugging Face (repositorio citado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
