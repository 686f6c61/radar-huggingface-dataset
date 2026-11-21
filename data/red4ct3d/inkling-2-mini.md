# red4ct3d/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su relevancia radica en combinar una arquitectura de mezcla de expertos (MoE) con un transformer "looped" y un contexto declarado de hasta 1 millón de tokens, en un checkpoint de aproximadamente 20 GB que puede ejecutarse en hardware local.

El modelo cuenta con 26.400 millones de parámetros totales y 3.400 millones de parámetros activos por token (5.400 millones efectivos por token debido a las tres pasadas de las capas centrales). La arquitectura es un transformer decodificador de 24 capas con capas feed-forward MoE dispersas, atención híbrida local/global y codificación de imágenes mediante un vision transformer. Se distribuye en precisiones mixtas NVFP4 y MXFP8.

La disponibilidad de pesos abiertos, junto con soporte para vLLM, SGLang, llama.cpp, Ollama y Unsloth, lo posiciona como una opción interesante para despliegues en entornos con recursos limitados que requieran capacidades multimodales y ventanas de contexto amplias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con MoE dispersa y capas "looped" (24 capas, 12 centrales repetidas 3 veces) |
| Parámetros totales | 26.400 millones (26,4B) |
| Parámetros activos | 3,4B por pasada; 5,4B efectivos por token (3 pasadas) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4, MXFP8 (checkpoint original); GGUF cuantizado vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (no se detallan idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de ~20 GB en precisiones mixtas NVFP4/MXFP8) |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer decodificador de 24 capas con capas feed-forward de mezcla de expertos dispersa: cada token se enruta a 8 de 128 expertos en cada capa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y las entradas de imagen y texto se proyectan a un espacio oculto compartido que procesa el decodificador de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 y 4096 píxeles por dimensión.
- Procesamiento conjunto de texto e imagen en un espacio oculto compartido.
- Soporte multilingüe general, con inglés como idioma principal.
- Capacidades de código en múltiples lenguajes de programación.
- Uso en sistemas agénticos y de uso de herramientas (tool use), según la model card.
- Conversación multi-turno e instrucciones.
- Integración en sistemas RAG.
- Ventana de contexto de hasta 1M de tokens para documentos y conversaciones extensas.

## Casos de uso

- Asistentes de código en producción: el modelo soporta múltiples lenguajes de programación y puede integrarse en pipelines de CI/CD o IDE para generación y revisión de código, aprovechando su contexto de 1M de tokens para analizar repositorios completos.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso gracias a la ventana de 1M tokens, manteniendo coherencia en interacciones largas.
- Sistemas RAG multimodales: indexación y consulta de documentos que combinan texto e imágenes (informes, manuales técnicos, capturas), usando la codificación visual del modelo para responder preguntas sobre contenido mixto.
- Agentes autónomos con uso de herramientas: la model card indica soporte para sistemas agénticos y tool use, lo que permite construir agentes que invoquen APIs y ejecuten flujos multi-paso.
- Análisis de documentos visuales: extracción y resumen de información de imágenes de hasta 4096 píxeles por dimensión, útil para digitalización de facturas, formularios o gráficos.
- Despliegue local en estaciones de trabajo: con ~20 GB de checkpoint y soporte para Apple Silicon con 32 GB o más, es viable ejecutar el modelo en MacBooks, Mac mini y Mac Studio para prototipado y uso privado sin depender de la nube.
- Fine-tuning downstream: los pesos abiertos y el soporte de Tinker, Miles y SkyRL permiten adaptar el modelo a dominios específicos mediante post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos no están presentes en la información proporcionada.

## Requisitos de hardware

- Checkpoint original: ~20 GB en precisiones mixtas NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para GPUs y plataformas compatibles.
- Plataformas soportadas oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- Otras GPUs son posibles con 32 GB o más de VRAM; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizados), llama.cpp (GGUF), Llama App, Ollama y Exo Labs (Apple Silicon).
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card incluye una tabla comparativa con los siguientes modelos, aunque sin valores numéricos de rendimiento en la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Gemma 4 31B | 31B (según nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; al entrenarse con datos de internet y sintéticos, es probable que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación: no se cuantifica en la model card; como modelo generativo de propósito general, existe riesgo inherente de generar información incorrecta.
- Idiomas: el soporte multilingüe se describe de forma genérica ("general multilingual support") sin listado concreto de idiomas; el rendimiento fuera del inglés no está cuantificado.
- Licencia: Apache 2.0 permite uso comercial, pero existe una Política de Uso Aceptable del modelo enlazada por el proveedor que conviene revisar antes de desplegarlo en producción.
- Precisión numérica: el checkpoint se distribuye en NVFP4 y MXFP8; el uso de cuantizaciones de 4 bits puede afectar a la calidad frente a precisiones superiores.
- Contexto: aunque se declara una ventana de 1M tokens, no se especifica el rendimiento real en contextos largos ni la degradación esperada.
- Fecha de creación del repositorio en Hugging Face (2026-11-21) y ausencia de descargas o likes: el modelo es muy reciente y cuenta con poca validación comunitaria en el momento de redactar esta ficha.
- El ID del repositorio en Hugging Face es `red4ct3d/Inkling-2-Mini`, mientras que la model card referencia `thinkingmachines/Inkling-2-Mini` como ubicación oficial de los pesos; conviene verificar cuál es el repositorio canónico.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/red4ct3d/Inkling-2-Mini
- Hugging Face (referenciado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Guía de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
