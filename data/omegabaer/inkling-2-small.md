# omegabaer/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autoregresivo decoder-only de 48 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. Con 594.000 millones de parámetros totales y 17.000 millones activos por token, el modelo se posiciona en la categoría de MoE de gran escala con activación reducida, lo que permite un coste de inferencia por token muy inferior al de un modelo denso del mismo tamaño.

La arquitectura combina atención híbrida (capas locales y globales) y un codificador de visión transformer que proyecta imágenes y texto a un espacio oculto compartido, procesado conjuntamente por el decoder. El modelo soporta una ventana de contexto de hasta 1 millón de tokens y se distribuye en dos formatos de checkpoint: NVFP4 (precisión nativa de entrenamiento) y MXFP8, con una diferencia de rendimiento marginal de 1-2 puntos porcentuales entre ambos.

Su relevancia actual radica en que ofrece pesos abiertos bajo licencia Apache 2.0 para un modelo multimodal de escala frontera, con soporte de despliegue en SGLang, vLLM, TokenSpeed y Unsloth, y acceso mediante múltiples proveedores de inferencia. Está orientado a sistemas agénticos, asistentes de código, chatbots y pipelines de generación aumentada por recuperación (RAG).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 48 capas con MoE dispersa (8 de 384 expertos por token); atención híbrida local/global; codificador de visión transformer |
| Parámetros totales | 594.050.672.720 (594B) |
| Parámetros activos | 17B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 (nativa, checkpoint principal) y MXFP8 (checkpoint alternativo) |
| Idiomas soportados | Inglés, con capacidades multilingües generales; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints NVFP4 y MXFP8); librería transformers |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo decoder-only de 48 capas con una columna vertebral feed-forward de mezcla de expertos dispersa. Cada token se enruta a 8 de los 384 expertos disponibles, lo que resulta en 17B parámetros activos sobre un total de 594B. La atención es híbrida, combinando capas locales y globales, lo que permite gestionar contextos de hasta 1 millón de tokens con un coste computacional controlado. La multimodalidad es nativa: un vision transformer codifica las imágenes y tanto estas como el texto se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) directamente en NVFP4, que constituye por tanto la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles públicamente, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición porcentual del dataset, ni si se emplearon técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con instrucciones de seguimiento y uso conversacional general.
- Comprensión de imágenes combinada con texto (image-text-to-text): descripción, respuesta a preguntas visuales y tareas que requieren razonamiento sobre contenido visual.
- Generación de código en múltiples lenguajes de programación, orientada a asistentes de desarrollo.
- Soporte de tool calling y function calling para sistemas agénticos.
- Capacidad para flujos agénticos y razonamiento multi-paso.
- Capacidades multilingües generales, con inglés como idioma principal.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Entrada de imagen en cualquier formato basado en píxeles, con dimensiones recomendadas entre 40px y 4096px por lado.
- Salida exclusivamente en texto codificado en UTF-8.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para revisión de código, generación de parches y explicación de errores, aprovechando su soporte de tool calling y su entrenamiento en múltiples lenguajes de programación.
- Sistemas agénticos multi-paso: con 17B parámetros activos y soporte de function calling, es adecuado para orquestar agentes que planifican, invocan herramientas y razonan sobre resultados intermedios sin el coste de inferencia de un modelo denso de 594B.
- Análisis de documentos extensos: la ventana de 1M tokens permite procesar informes, expedientes o bases de código completas en una sola pasada, útil para resumen, extracción de entidades y respuesta a preguntas sobre corpus largos.
- Generación aumentada por recuperación (RAG): el modelo está diseñado explícitamente para pipelines RAG, donde combina contexto recuperado de gran longitud con razonamiento sobre el mismo.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con contexto largo, incluyendo la posibilidad de recibir capturas o imágenes del usuario y responder sobre ellas.
- Asistentes multimodales de accesibilidad: descripción de imágenes, lectura de documentos escaneados y respuesta a preguntas visuales para usuarios con discapacidad visual.
- Análisis de contenido visual en flujos de trabajo: clasificación y descripción de imágenes dentro de aplicaciones empresariales, con la ventaja de un único modelo que procesa texto e imagen de forma conjunta.
- Fine-tuning e investigación: al publicarse con pesos abiertos y licencia Apache 2.0, puede ajustarse con Tinker, Miles, SkyRL o Snowflake Cortex Training para dominios especializados.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa entre los checkpoints NVFP4 y MXFP8 frente a referencias denominadas "Open Weights Flash" y "Open Weights Pro", pero los valores numéricos de dicha tabla no están disponibles en la información proporcionada. El único dato cuantitativo publicado es que el checkpoint MXFP8 obtiene una mejora marginal de 1-2 puntos porcentuales sobre el NVFP4 en las evaluaciones, diferencia que el propio autor califica de no significativa para casos de uso prácticos.

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Checkpoint NVFP4 (recomendado): requiere un clúster con al menos 500 GB de VRAM agregada. Configuraciones de ejemplo: 2x NVIDIA B300 o 4x NVIDIA H200.
- Checkpoint MXFP8: requiere al menos 800 GB de VRAM agregada. Configuraciones de ejemplo: 4x NVIDIA B300 o 8x NVIDIA H200.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones de una sola GPU convencional; el tamaño del repositorio es de 393,5 GB y los requisitos de VRAM superan con creces la memoria disponible en tarjetas consumer.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face transformers.
- Post-entrenamiento soportado con Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API a través de NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Inkling 2 Small | 594B | 17B | 1M tokens | Apache 2.0 | Sí (texto + imagen) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (MoE multimodal de escala frontera con pesos abiertos) que permitan establecer una comparación rigurosa de parámetros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- El modelo se distribuye en precisiones de 4 y 8 bits (NVFP4 y MXFP8); no se ofrece un checkpoint en BF16 o FP16, lo que puede limitar su uso en flujos que requieran precisión completa.
- Los requisitos de hardware son elevados: un mínimo de 500 GB de VRAM agregada, lo que excluye su despliegue en infraestructura de consumo o en servidores de gama media.
- El inglés es el idioma principal; las capacidades multilingües se describen como generales, sin garantías de calidad equivalente en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; no se documentan en la información disponible mecanismos específicos de mitigación.
- No se detallan en la información disponible los sesgos conocidos del modelo ni los resultados de evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a una política de uso aceptable (Acceptable Use Policy) que conviene revisar antes de desplegar en producción.
- El modelo acepta imágenes con dimensiones recomendadas entre 40px y 4096px por lado; fuera de ese rango el rendimiento puede degradarse.
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que se trata de una publicación reciente o poco adoptada; la madurez del ecosistema de herramientas en torno al modelo no está contrastada.
- No se especifica el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta evaluar la cobertura y posibles sesgos de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/omegabaer/Inkling-2-Small
- Checkpoint NVFP4 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling-2
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training (GitHub): https://github.com/snowflakedb/cortex-training
- Together AI: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius Token Factory: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers (PyPI): https://pypi.org/project/tml-renderers/
