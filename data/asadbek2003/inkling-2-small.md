# asadbek2003/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autorregresivo decoder-only de 48 capas con una columna vertebral de Mixture-of-Experts (MoE) dispersa: cada token se enruta a 8 de 384 expertos. Dispone de 594.000 millones de parámetros totales con 17.000 millones activos por token, lo que lo sitúa en la categoría de modelos MoE de gran escala con un coste de inferencia relativamente contenido.

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens, su naturaleza nativamente multimodal (las imágenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido) y su entrenamiento íntegro en precisión NVFP4, que es su formato nativo. Está pensado para desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas RAG, y se distribuye con pesos abiertos bajo licencia Apache 2.0.

Su relevancia actual radica en la combinación de escala MoE, contexto extremadamente largo y multimodalidad con una licencia permisiva, algo poco habitual en modelos de este tamaño. El repositorio ocupa 393,5 GB y requiere clústeres de GPU de gama alta para su despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only con MoE dispersa (48 capas, 8 de 384 expertos por token, atención híbrida local/global, vision transformer para imágenes) |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativo, checkpoint principal) y MXFP8 (checkpoint alternativo); tags indican soporte de 8-bit y modelopt |
| Idiomas soportados | Inglés con capacidades multilingües generales; no se detalla lista completa |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints NVFP4 y MXFP8) |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con una columna vertebral MoE dispersa en la que cada token se enruta a 8 de 384 expertos. La atención combina capas locales y globales, lo que permite gestionar contextos de hasta 1 millón de tokens con un coste computacional controlado. El modelo es nativamente multimodal: un vision transformer codifica las imágenes y tanto estas como el texto se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles, generación interna y datos sintéticos o aumentados, con procesos de limpieza, deduplicación y filtrado por calidad y seguridad.

El modelo fue preentrenado, midtrained y post-trained en NVFP4, por lo que esta es su precisión nativa y la opción recomendada por el autor. El checkpoint MXFP8 ofrece una mejora marginal de 1-2 puntos porcentuales en las evaluaciones, considerada no significativa para casos prácticos. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes (image-text-to-text) con resolución ideal por dimensión entre 40 px y 4096 px.
- Razonamiento y tareas de lenguaje natural de diversa índole.
- Soporte de múltiples lenguajes de programación, según la model card.
- Capacidades multilingües generales, con inglés como idioma principal.
- Orientado a sistemas agénticos y de uso de herramientas (tool-use), asistentes de código, chatbots y RAG.
- Contexto de hasta 1 millón de tokens para documentos y conversaciones extensas.
- No se especifican en la información disponible capacidades de audio, modo thinking explícito ni decodificación especulativa.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1 millón de tokens, manteniendo el hilo de incidencias complejas y consultando documentación extensa dentro del mismo contexto.
- Asistentes de código en producción: su soporte para múltiples lenguajes de programación y su orientación a tool-use permiten integrarlo en pipelines de CI/CD para revisión de código, generación de parches y explicación de errores.
- Sistemas RAG multimodales: al aceptar texto e imagen en un espacio compartido, puede responder preguntas sobre documentación que combine capturas, diagramas y texto, recuperando y razonando sobre fragmentos extensos.
- Agentes autónomos multi-paso: la combinación de contexto de 1M tokens, tool calling y razonamiento permite construir agentes que planifican, ejecutan herramientas y mantienen estado a lo largo de tareas largas.
- Análisis de documentos técnicos con imágenes: informes, planos, manuales o papers con figuras pueden procesarse de una sola pasada, extrayendo conclusiones que cruzan texto y elementos visuales.
- Chatbots de propósito general con fine-tuning: la licencia Apache 2.0 y los pesos abiertos permiten a terceros ajustar el modelo con Tinker, Miles o SkyRL para dominios verticales y desplegarlo en productos propios.
- Procesamiento de vídeo e imagen en pipelines de contenido: aunque la salida es solo texto, la entrada admite imágenes y el entrenamiento incluyó vídeo, lo que habilita tareas de descripción y análisis visual.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa (Open Weights Flash frente a Open Weights Pro), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks concretos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Checkpoint NVFP4 (recomendado): requiere un clúster con al menos 500 GB de VRAM agregada. Configuraciones de ejemplo: 2x NVIDIA B300 o 4x NVIDIA H200.
- Checkpoint MXFP8: requiere al menos 800 GB de VRAM agregada. Configuraciones de ejemplo: 4x NVIDIA B300 u 8x NVIDIA H200.
- No cabe en GPU de consumo (RTX 4090, etc.) dada la escala de 594B parámetros y los requisitos mínimos de VRAM.
- Frameworks de inferencia soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento soportado con Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API a través de proveedores externos: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numéricos ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural, se indica la categoría del modelo:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Inkling 2 Small | 594B | 17B | 1M | Apache 2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está distribuido en precisiones de 4 y 8 bits (NVFP4/MXFP8) y no se ofrece un checkpoint en BF16/FP16, lo que limita su uso en infraestructuras sin soporte para estos formatos.
- Requiere hardware de gama muy alta (mínimo 500 GB de VRAM agregada), lo que excluye el despliegue en entornos de consumo o estaciones de trabajo convencionales.
- El idioma principal es el inglés; las capacidades multilingües se describen como generales pero no se detalla su cobertura ni calidad por idioma.
- Riesgo de alucinación inherente a los modelos generativos; la model card no documenta evaluaciones específicas de factualidad.
- No se detallan sesgos conocidos ni resultados de evaluaciones de seguridad en la información disponible.
- Existe una política de uso aceptable del autor (Acceptable Use Policy) que puede imponer restricciones adicionales más allá de la licencia Apache 2.0.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la política de uso aceptable y las condiciones de los proveedores de inferencia externos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado en la misma fecha (2026-11-19), lo que sugiere un lanzamiento muy reciente y poca validación comunitaria aún.

## Enlaces

- Hugging Face: https://huggingface.co/asadbek2003/Inkling-2-Small
- Checkpoint NVFP4: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground (Tinker): https://tinker.thinkingmachines.ai/playground
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
