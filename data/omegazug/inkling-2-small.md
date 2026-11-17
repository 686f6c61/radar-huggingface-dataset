# omegazug/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se presenta como un transformer autoregresivo con backbone de mezcla de expertos (MoE) disperso, con 594.000 millones de parámetros totales y 17.000 millones activos por token, lo que lo sitúa en la categoría de modelos masivos con activación eficiente. El modelo está diseñado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se distribuye con pesos abiertos bajo licencia Apache 2.0.

La relevancia actual del modelo radica en su combinación de escala masiva (594B totales) con un coste de inferencia contenido gracias a la activación dispersa de 17B parámetros, además de una ventana de contexto de hasta 1 millón de tokens y capacidades multimodales nativas. Se distribuye en dos formatos de checkpoint (NVFP4 y MXFP8) pensados para despliegues en clústeres de GPU de gama alta, y cuenta con recetas de inferencia para SGLang, vLLM, TokenSpeed y Unsloth, así como acceso vía API a través de varios proveedores.

El modelo fue preentrenado, midtrained y postentrenado nativamente en NVFP4, lo que según el autor lo convierte en la precisión nativa recomendada para todos los casos de uso. La información pública disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de que incluye texto, imágenes y vídeo de fuentes públicas, de terceros, internas y sintéticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 48 capas con backbone MoE disperso (8 de 384 expertos por token), atención híbrida local/global y codificador visual ViT |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (nativa, checkpoint principal) y MXFP8 (checkpoint alternativo) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints NVFP4 y MXFP8); compatible con transformers |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone de mezcla de expertos disperso en el que cada token se enruta a 8 de 384 expertos. La atención es híbrida, combinando capas locales y globales, lo que permite gestionar contextos de hasta 1 millón de tokens. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las entradas de imagen como las de texto se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta.

El entrenamiento incluyó datos de texto, imágenes y vídeo procedentes de fuentes públicas, de terceros, generadas internamente y sintéticas o aumentadas. El proceso de curación de datos incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y avanzar en objetivos de seguridad. El modelo fue preentrenado, midtrained y postentrenado en NVFP4, lo que constituye su precisión nativa; el checkpoint MXFP8 ofrece una mejora marginal de 1-2 puntos porcentuales en evaluaciones, que el autor considera no significativa para casos de uso prácticos. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes y razonamiento visual (pipeline image-text-to-text).
- Generación y razonamiento de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling para sistemas agénticos.
- Capacidades multilingües generales, con inglés como idioma principal.
- Procesamiento de contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Entrada de imágenes en cualquier formato basado en píxeles, con dimensiones recomendadas entre 40px y 4096px por lado.
- Salida exclusivamente en texto codificado en UTF-8.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para autocompletar, revisar y generar código en múltiples lenguajes, aprovechando su soporte de tool calling y su contexto de 1M tokens para analizar repositorios completos.
- Sistemas agénticos multi-paso: su capacidad de function calling y razonamiento multi-paso permite construir agentes que planifican, ejecutan herramientas y mantienen estado a lo largo de conversaciones largas sin perder contexto.
- Generación aumentada por recuperación (RAG) sobre corpus extensos: con 1M tokens de contexto, puede ingerir grandes volúmenes de documentos recuperados y responder con coherencia sin necesidad de truncar agresivamente.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial largo y capacidad de interpretar capturas o documentos enviados por el usuario gracias a su entrada multimodal.
- Análisis de documentos e imágenes: extracción de información de facturas, formularios, gráficos o capturas de pantalla, combinando el codificador visual con el decoder de texto.
- Investigación y fine-tuning: al distribuirse con pesos abiertos y licencia Apache 2.0, permite ajuste fino para dominios específicos mediante herramientas como Miles, SkyRL o Snowflake Cortex Training.
- Asistentes de accesibilidad: descripción de imágenes y generación de texto alternativo en aplicaciones que requieren interpretación visual.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa entre variantes "Open Weights Flash" y "Open Weights Pro", pero el contenido de dicha tabla no está disponible en la información proporcionada (aparece truncado). No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint NVFP4 (recomendado): requiere un clúster con al menos 500 GB de VRAM agregada. Configuraciones de ejemplo: 2x NVIDIA B300 o 4x NVIDIA H200.
- Checkpoint MXFP8: requiere al menos 800 GB de VRAM agregada. Configuraciones de ejemplo: 4x NVIDIA B300 o 8x NVIDIA H200.
- No cabe en GPU de consumo (RTX 4090, etc.) ni en configuraciones de una sola GPU de gama alta convencional.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento soportado con Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API a través de NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (MoE multimodal de escala similar) ni resultados de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está pensado principalmente para inglés; sus capacidades multilingües son generales pero no se detallan por idioma.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; no se documentan tasas específicas.
- Sesgos conocidos: no documentados en la información disponible, aunque el entrenamiento con datos de internet y sintéticos puede introducir sesgos.
- La licencia Apache 2.0 permite uso comercial, pero existe una política de uso aceptable separada del autor que conviene revisar.
- El despliegue requiere hardware de gama alta (clústeres de GPU B300 o H200) y no es viable en hardware de consumo.
- La información sobre composición del dataset y número de tokens de entrenamiento es limitada.
- El checkpoint MXFP8 solo aporta 1-2 puntos porcentuales sobre NVFP4, por lo que el autor recomienda NVFP4 para todos los casos.
- La fecha de creación del repositorio (2026-11-16) y la ausencia de descargas o likes sugieren que el modelo es muy reciente o de disponibilidad limitada; conviene verificar el estado del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/omegazug/Inkling-2-Small
- Checkpoint NVFP4: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta Unsloth: https://unsloth.ai/docs/models/inkling-2
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
