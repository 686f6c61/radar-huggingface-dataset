# KainDOGG/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines (distribuido en Hugging Face a través de la cuenta KainDOGG) que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autorregresivo con backbone de mezcla de expertos (MoE) disperso de 48 capas, con 594.000 millones de parámetros totales y 17.000 millones activos por token, lo que lo sitúa en la categoría de modelos frontera de pesos abiertos.

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens y por su entrenamiento nativo en precisión NVFP4, lo que reduce los requisitos de memoria frente a un checkpoint en BF16. Está pensado para aplicaciones agénticas, asistentes de código, chatbots, sistemas de recuperación aumentada (RAG) y tareas conversacionales e instruccionales, con capacidades multilingües generales aunque centrado en inglés.

Su relevancia actual radica en la combinación de un MoE de gran escala con multimodalidad nativa (vision transformer para imágenes) y una licencia Apache 2.0, lo que facilita su integración en productos de terceros y su ajuste fino por parte de desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only con MoE disperso (48 capas) y atención híbrida local/global |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B (8 de 384 expertos por token) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | MXFP8 y NVFP4 (entrenado nativamente en NVFP4) |
| Idiomas soportados | Inglés, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints NVFP4 y MXFP8) |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone de mezcla de expertos disperso: cada token se enruta a 8 de 384 expertos. La atención combina capas locales y globales (híbrido), lo que permite manejar contextos de hasta 1M de tokens con un coste computacional controlado. El modelo es multimodal nativo: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decoder de forma conjunta.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) directamente en precisión NVFP4, lo que convierte a esta cuantización en la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas, de terceros, generados internamente y sintéticos, con procesos de limpieza, deduplicación y filtrado. La model card no detalla el número exacto de tokens de entrenamiento ni la composición porcentual del dataset, ni si se aplicaron técnicas específicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general en inglés y otros idiomas.
- Comprensión de imágenes (image-text-to-text) mediante vision transformer integrado.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Conversación multi-turno e instrucciones complejas.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling / function calling), según la model card.
- Capacidades multilingües generales, aunque el idioma principal es el inglés.
- Procesamiento de contexto largo de hasta 1M de tokens.
- Ajuste fino y post-entrenamiento soportado (Tinker, Miles, SkyRL, Snowflake Cortex Training).

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para generar, revisar y refactorizar código en múltiples lenguajes, aprovechando su contexto de 1M de tokens para analizar repositorios completos.
- Sistemas agénticos con uso de herramientas: su soporte de tool calling permite construir agentes que consulten APIs, bases de datos o servicios externos en flujos de múltiples pasos.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con contexto largo, manteniendo el hilo de la conversación y el historial del cliente en una sola ventana.
- RAG sobre documentación extensa: la ventana de 1M tokens permite ingerir manuales, contratos o bases de conocimiento completas sin fragmentación agresiva.
- Análisis de documentos con imágenes: extracción de información de facturas, informes o capturas combinando entrada visual y textual.
- Asistentes de investigación: resumen y razonamiento sobre grandes corpus de texto y figuras científicas.
- Generación de contenido multilingüe: redacción y traducción asistida con capacidades multilingües generales.
- Ajuste fino para dominios verticales: al tener licencia Apache 2.0 y pesos abiertos, puede especializarse con Tinker, Miles o SkyRL para sectores como legal, sanitario o financiero.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa entre variantes "Open Weights Flash" y "Open Weights Pro", pero los datos concretos de la tabla no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Checkpoint NVFP4 (recomendado): requiere un clúster con al menos 500 GB de VRAM agregada. Configuraciones de ejemplo: 2x NVIDIA B300 o 4x NVIDIA H200.
- Checkpoint MXFP8: requiere al menos 800 GB de VRAM agregada. Configuraciones de ejemplo: 4x NVIDIA B300 o 8x NVIDIA H200.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por su tamaño de 594B parámetros y su huella de memoria.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento: Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API de terceros: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento numérico de este modelo ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, se trata de un MoE de 594B totales y 17B activos con contexto de 1M tokens y licencia Apache 2.0, lo que lo sitúa en la categoría de modelos frontera de pesos abiertos con multimodalidad, pero no se dispone de cifras de benchmarks para contrastar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está centrado en inglés; el rendimiento en otros idiomas puede ser inferior y no se detalla por idioma.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan tasas específicas.
- Sesgos potenciales derivados de datos de internet y fuentes de terceros; la model card menciona filtrado pero no detalla mitigaciones concretas.
- Requiere hardware de clase centro de datos (mínimo 500 GB de VRAM agregada en NVFP4); no es desplegable en GPUs de consumo.
- La precisión nativa es NVFP4; el checkpoint MXFP8 ofrece solo 1-2 puntos porcentuales de mejora según el autor, sin garantía de reproducibilidad en todos los entornos.
- Aunque la licencia es Apache 2.0, existe una política de uso aceptable del autor que conviene revisar antes de usos sensibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- No se detallan los datos de entrenamiento (número de tokens, composición exacta) ni si se aplicaron RLHF/DPO, lo que limita la evaluación de su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/KainDOGG/Inkling-2-Small
- Checkpoint NVFP4 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Small
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
