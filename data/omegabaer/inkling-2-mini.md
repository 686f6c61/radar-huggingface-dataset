# omegabaer/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Se distribuye como pesos abiertos para investigación, ajuste fino e integración en productos de terceros.

Técnicamente se trata de un transformer decoder-only de 24 capas con capas de alimentación hacia delante de tipo Mixture-of-Experts (MoE) disperso: cada token se enruta a 8 de 128 expertos por capa. Su rasgo arquitectónico distintivo es el bucle ("looped transformer"): las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de solo 24 capas de pesos. Dispone de 26.400 millones de parámetros totales y 3.400 millones activos nominales, aunque el efecto del bucle eleva los parámetros activos efectivos a unos 5.400 millones por token.

La relevancia del modelo radica en su combinación de tamaño contenido, ventana de contexto de hasta 1 millón de tokens y cuantización nativa en NVFP4 y MXFP8, lo que permite ejecutarlo en hardware local relativamente modesto (una NVIDIA DGX Spark o equipos Apple Silicon con 32 GB o más de memoria) sin renunciar a capacidades multimodales y de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas (looped transformer), nativamente multimodal con vision transformer |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3,4B nominales; 5,4B efectivos por token (tres pasadas por las capas en bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 nativos; versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint único de ~20 GB en precisión mixta NVFP4/MXFP8); GGUF disponible para cuantización |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo decoder-only de 24 capas con capas MoE dispersas: cada token se enruta a 8 de 128 expertos en cada capa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que el modelo realiza 48 aplicaciones de capa por token a partir de 24 capas de pesos. La atención es híbrida, combinando capas locales y globales. Es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las entradas de imagen como las de texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta. El modelo admite entradas de imagen de cualquier resolución basada en píxeles, con un rango óptimo de 40 a 4096 píxeles por dimensión.

Los datos de entrenamiento abarcan una variedad amplia de tipos de contenido, incluyendo texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La precisión numérica nativa (NVFP4 y MXFP8) es una innovación destacable de cara al despliegue eficiente en memoria.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones y conversación multi-turno.
- Comprensión de imágenes (image-text-to-text): descripción, razonamiento visual y respuesta a preguntas sobre imágenes.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool use), según la descripción del autor.
- Capacidad multilingüe general, con inglés como idioma principal.
- Ventana de contexto de hasta 1M tokens, adecuada para documentos largos y conversaciones extensas.
- Ajuste fino y post-entrenamiento soportado mediante las plataformas Miles y SkyRL.
- Inferencia local en DGX Spark y Apple Silicon, además de despliegue en servidores.

## Casos de uso

- Asistentes de código en producción: el modelo puede generar y revisar código en múltiples lenguajes y, según el autor, integrarse en sistemas de uso de herramientas; su tamaño contenido permite desplegarlo en infraestructura propia con vLLM o SGLang.
- Atención al cliente automatizada: la ventana de 1M tokens permite gestionar conversaciones multi-turno con historiales largos y documentación de producto extensa sin truncar contexto.
- RAG sobre documentación extensa: con contexto de hasta 1M tokens se pueden inyectar grandes volúmenes de documentos recuperados y mantener coherencia en la respuesta.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto conjuntamente, sirve para extraer información de capturas, diagramas o documentos escaneados junto a texto.
- Agentes autónomos multi-paso: el soporte de tool calling y razonamiento multi-paso lo hace apto para pipelines agénticos que encadenan llamadas a herramientas.
- Despliegue en estación de trabajo local: gracias a su checkpoint de ~20 GB en NVFP4/MXFP8, puede ejecutarse en una DGX Spark o en un Mac con 32 GB o más para prototipado y desarrollo sin depender de la nube.
- Ajuste fino específico de dominio: la disponibilidad de pesos abiertos bajo Apache 2.0 y el soporte de Miles y SkyRL permiten adaptar el modelo a tareas verticales.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero en la información proporcionada solo aparece la cabecera de la tabla, sin los valores numéricos de los benchmarks.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Checkpoint único de aproximadamente 20 GB en precisión mixta NVFP4 y MXFP8.
- Una NVIDIA DGX Spark es suficiente para inferencia local según el autor.
- Equipos Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Otras GPU y plataformas son posibles, con 32 GB o más de VRAM recomendados.
- Frameworks de despliegue soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizados), llama.cpp, Llama App, Ollama y Exo Labs (estos dos últimos en Apple Silicon).
- Post-entrenamiento soportado con Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card cita como comparables Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero no se proporcionan sus especificaciones ni los resultados numéricos de la comparación.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 5,4B activos efectivos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Gemma 4 31B | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; al entrenarse con datos de internet y sintéticos, es previsible que herede sesgos de esas fuentes, aunque no se cuantifican.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de error en la información disponible.
- El idioma principal es el inglés; el soporte multilingüe se describe como "general" sin garantías específicas por idioma.
- Aunque la licencia es Apache 2.0, el autor remite a una Política de Uso Aceptable del modelo que conviene revisar antes de uso comercial.
- El checkpoint se distribuye en precisión mixta NVFP4/MXFP8, lo que puede limitar la fidelidad numérica frente a versiones en mayor precisión; las versiones GGUF cuantizadas añaden pérdida adicional.
- El contexto de 1M tokens es una capacidad declarada; el rendimiento real en contextos muy largos no está cuantificado en la información disponible.
- El repositorio de Hugging Face indicado (omegabaer/Inkling-2-Mini) figura con 0 descargas y 0 likes, y la model card remite a un repositorio distinto (thinkingmachines/Inkling-2-Mini); conviene verificar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/omegabaer/Inkling-2-Mini
- Hugging Face (repositorio oficial citado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
