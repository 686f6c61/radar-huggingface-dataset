# derrickNg1412/Inkling-2-Mini-Abliterated-Healed-v2

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Se publicó el 20 de noviembre de 2026 bajo licencia Apache 2.0 con pesos abiertos, y esta variante concreta del repositorio de Hugging Face es un derivado comunitario del autor derrickNg1412, que aplica modificaciones de "abliteration" y "healing" sobre el modelo original. El modelo está pensado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG).

Arquitectónicamente es un transformer decoder-only de 24 capas con capas de mezcla de expertos (MoE) dispersas. Su rasgo más distintivo es el bucle de capas: las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos por capa, y la atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido.

El modelo declara 26,4 mil millones de parámetros totales con 3,4 mil millones activos, aunque cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos, resultando en unos 5.400 millones de parámetros activos efectivos por token con las tres pasadas. Soporta una ventana de contexto de hasta 1 millón de tokens y se distribuye en un único checkpoint de unos 20 GB en precisiones mixtas NVFP4 y MXFP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas (24 capas, 12 centrales ejecutadas 3 veces); multimodal nativo con vision transformer |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B declarados; 5,4B activos efectivos por token con las tres pasadas del bucle |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint original); versiones GGUF cuantizadas vía Unsloth y llama.cpp; tag 8-bit y modelopt en el repo |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); GGUF disponible mediante herramientas de la comunidad |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con arquitectura de bucle ("looped transformer"). Consta de 24 capas de pesos, de las cuales las 12 centrales se reutilizan tres veces, produciendo 48 aplicaciones de capa por token. Las capas de feed-forward son de mezcla de expertos dispersa: cada token se enruta a 8 de 128 expertos en cada capa. La atención es híbrida, alternando capas locales y globales, lo que permite manejar contextos de hasta 1 millón de tokens. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta, junto con los embeddings de texto, a un espacio oculto compartido que procesa el decoder.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta precisiones NVFP4 y MXFP8, lo que reduce el peso del checkpoint a unos 20 GB.

## Capacidades

- Generación de texto y razonamiento de propósito general en inglés y otros idiomas.
- Procesamiento de imágenes: acepta cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Generación de código en múltiples lenguajes de programación.
- Conversación multi-turno e instrucciones de seguimiento.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling), según la model card.
- Integración en pipelines de generación aumentada por recuperación (RAG).
- Contexto largo de hasta 1 millón de tokens, adecuado para documentos extensos o historiales de conversación amplios.
- Capacidades multilingües generales (sin lista cerrada de idiomas publicada).

## Casos de uso

- Asistentes de código en producción: el modelo puede generar y revisar código en varios lenguajes y, gracias a su soporte de tool calling, integrarse en pipelines de CI/CD para sugerencias, revisiones automáticas o generación de tests.
- Atención al cliente automatizada: con una ventana de hasta 1 millón de tokens, puede mantener conversaciones multi-turno con historiales extensos y contexto de documentación de producto sin truncar.
- Análisis de documentos con imágenes: al ser nativamente multimodal, puede procesar facturas, capturas de pantalla o diagramas junto con texto para extraer información estructurada.
- Sistemas RAG: su contexto largo permite inyectar grandes volúmenes de fragmentos recuperados y mantener coherencia en la respuesta.
- Agentes autónomos multi-paso: el soporte declarado de tool use y razonamiento multi-paso lo hace adecuado para orquestar llamadas a APIs y tareas encadenadas.
- Despliegue en hardware de consumo: con unos 20 GB en NVFP4/MXFP8, puede ejecutarse en un DGX Spark, en Apple Silicon con 32 GB o más, o en GPUs con 32 GB de VRAM, lo que facilita prototipado local y fine-tuning ligero.
- Fine-tuning con Tinker: la plataforma Tinker de Thinking Machines Lab ofrece acceso vía API y herramientas (Tinker Cookbook, tml-renderers) para adaptar el modelo a dominios concretos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint original ocupa unos 20 GB en precisiones mixtas NVFP4 y MXFP8; se recomiendan 32 GB o más de VRAM para inferencia.
- Hardware soportado oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio); otras GPUs con 32 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en GPUs con 32 GB o más (por ejemplo, variantes de gama alta con 32 GB); en Apple Silicon con memoria unificada de 32 GB o más.
- Opciones de despliegue: Hugging Face transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp, Llama App, y en Apple Silicon Ollama y Exo Labs.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face, Tinker |
| Gemma 4 31B | 31B (según nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la model card los referencia pero la tabla aparece truncada.

## Limitaciones y advertencias

- Esta variante concreta ("Abliterated-Healed-v2") es un derivado comunitario de derrickNg1412, no el modelo oficial de Thinking Machines Lab; las modificaciones de abliteration y healing pueden alterar el comportamiento, la seguridad y la calidad respecto al original.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de esta variante.
- Sesgos conocidos: no documentados en la información disponible; los datos de entrenamiento provienen de internet y pueden arrastrar sesgos.
- Idiomas: la lista cerrada de idiomas no está publicada; el soporte multilingüe es general y puede ser desigual fuera del inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo original remite a una Política de Uso Aceptable de Thinking Machines Lab que conviene revisar.
- El contexto de 1M tokens puede degradar la calidad en los extremos de la ventana; no hay datos publicados sobre rendimiento por posición.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de esta variante.
- Para producción, verificar la integridad de los pesos y comparar el comportamiento con el modelo oficial antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/derrickNg1412/Inkling-2-Mini-Abliterated-Healed-v2
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
