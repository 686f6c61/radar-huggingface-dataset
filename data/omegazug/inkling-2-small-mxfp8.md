# omegazug/Inkling-2-Small-MXFP8

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para aplicaciones de desarrollo de IA: sistemas agénticos con uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El checkpoint analizado aquí, `omegazug/Inkling-2-Small-MXFP8`, es una conversión comunitaria al formato MXFP8 del modelo original publicado por Thinking Machines.

La arquitectura es un transformer decoder-only de 48 capas con un backbone de mezcla de expertos (MoE) disperso: cada token se enruta a 8 de 384 expertos. El modelo cuenta con 594.050.641.920 parámetros totales (unos 594B) y 17B parámetros activos por token, lo que lo sitúa en la categoría de modelos masivos con activación eficiente. La atención combina capas locales y globales, y el modelo es nativamente multimodal, con un vision transformer que proyecta imágenes y texto a un espacio oculto compartido procesado conjuntamente por el decoder.

Su relevancia actual radica en la combinación de una ventana de contexto de hasta 1M tokens, capacidades multimodales nativas y un diseño MoE que reduce el coste computacional por token. El modelo se entrenó nativamente en precisión NVFP4, y esta conversión MXFP8 ofrece, según el autor original, una mejora marginal de 1-2 puntos porcentuales en evaluaciones respecto al checkpoint NVFP4, aunque con mayores requisitos de VRAM agregada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 48 capas con MoE disperso (8 de 384 expertos por token), atención híbrida local/global y vision transformer nativo |
| Parametros totales | 594.050.641.920 (~594B) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1.000.000 tokens (1M) |
| Tipos de cuantizacion | MXFP8 (este checkpoint); NVFP4 (checkpoint nativo original) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Modalidades de entrada | Texto (UTF-8) e imagen (cualquier formato de píxeles, dimensiones recomendadas entre 40px y 4096px) |
| Modalidades de salida | Texto (UTF-8) |
| Tamaño del repositorio | 622,8 GB |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer autorregresivo multimodal de 48 capas con un backbone feed-forward de mezcla de expertos disperso. Cada token se enruta a 8 de los 384 expertos disponibles, lo que da lugar a 17B parámetros activos sobre un total de 594B. La atención es híbrida, combinando capas locales y globales, lo que permite gestionar contextos de hasta 1M tokens con un coste de atención controlado. El modelo es nativamente multimodal: un vision transformer codifica las imágenes y tanto estas como el texto se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) y, de forma destacable, se llevó a cabo íntegramente en precisión NVFP4, que es la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles públicamente, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y reforzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento ni si se emplearon técnicas específicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con instrucciones en lenguaje natural.
- Comprensión de imágenes: el modelo acepta entradas visuales y las procesa conjuntamente con el texto en un espacio compartido.
- Razonamiento, código y matemáticas: la model card indica uso previsto en asistentes de código y múltiples lenguajes de programación.
- Soporte de tool calling y function calling para sistemas agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Capacidades multilingües generales, con inglés como idioma principal.
- Ventana de contexto de hasta 1M tokens para documentos y conversaciones extensas.
- Uso previsto en sistemas RAG, chatbots y asistentes de código.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1M tokens, manteniendo el hilo de incidencias extensas sin perder información previa.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD como asistente de revisión, generación de tests o explicación de diffs, aprovechando su entrenamiento en múltiples lenguajes de programación.
- Sistemas agénticos con uso de herramientas: su soporte de function calling y razonamiento multi-paso permite construir agentes que consultan APIs, ejecutan acciones y encadenan decisiones.
- RAG sobre documentación extensa: con 1M tokens de contexto, puede ingerir manuales, contratos o bases de conocimiento completas y responder con citas al contenido original.
- Análisis de documentos con imágenes: al ser nativamente multimodal, puede procesar facturas, informes escaneados o capturas de pantalla junto con texto para extraer y resumir información.
- Asistente de investigación multimodal: combinación de lectura de papers, figuras y tablas con razonamiento sobre el contenido para generar resúmenes técnicos.
- Fine-tuning especializado: al publicarse con pesos abiertos y licencia Apache 2.0, puede ajustarse con Tinker, Miles o SkyRL para dominios concretos (legal, médico, financiero) sin restricciones de uso comercial.

## Benchmarks y rendimiento

La model card del autor original incluye una tabla de evaluaciones comparativa entre checkpoints (Open Weights Flash y Open Weights Pro), pero los valores numéricos no están disponibles en la información proporcionada. El autor indica únicamente que el checkpoint MXFP8 obtiene una mejora marginal de 1-2 puntos porcentuales sobre el NVFP4 en las evaluaciones, sin que se consideren diferencias significativas para casos de uso prácticos.

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM agregada mínima para el checkpoint MXFP8: 800 GB.
- Configuraciones de ejemplo indicadas por el autor: 4x NVIDIA B300 o 8x NVIDIA H200.
- El checkpoint NVFP4 nativo requiere al menos 500 GB de VRAM agregada (2x NVIDIA B300 o 4x NVIDIA H200).
- No cabe en GPU de consumo (RTX 4090, 5090, etc.): el tamaño del repositorio (622,8 GB) y los requisitos de VRAM lo excluyen de hardware consumer.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento soportado con Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API a través de proveedores terceros: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. A continuación se indica la comparación estructural con alternativas de la misma categoría (MoE multimodal de gran escala) únicamente en los parámetros conocidos:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Small (MXFP8) | ~594B | 17B | 1M | Apache 2.0 | Pesos abiertos en HF |
| Alternativas MoE comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado datos comparativos de rendimiento en la información disponible.

## Limitaciones y advertencias

- El modelo está pensado principalmente para inglés; las capacidades multilingües son generales pero no están cuantificadas.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; la model card no documenta tasas específicas.
- Sesgos conocidos: no documentados en la información disponible; los datos de entrenamiento provienen de internet y fuentes públicas, con los sesgos asociados.
- Requisitos de hardware muy elevados: 800 GB de VRAM agregada para MXFP8, lo que limita su despliegue a clústeres.
- El checkpoint MXFP8 es una conversión comunitaria (autor `omegazug`) del modelo original de Thinking Machines; no es la distribución oficial y su fidelidad respecto al original no está verificada en la información disponible.
- El autor original recomienda el checkpoint NVFP4 frente al MXFP8 por su mejor relación rendimiento/recursos, pese a la ligera ventaja de 1-2 puntos del MXFP8.
- Licencia Apache 2.0 permite uso comercial, pero el autor original publica una política de uso aceptable (Acceptable Use Policy) que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-16) es futura respecto al momento habitual de consulta; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face (checkpoint MXFP8): https://huggingface.co/omegazug/Inkling-2-Small-MXFP8
- Modelo original NVFP4: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8 oficial: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta Unsloth: https://unsloth.ai/docs/models/inkling-2
- Miles (post-entrenamiento): https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- SkyRL (post-entrenamiento): https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together AI: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
