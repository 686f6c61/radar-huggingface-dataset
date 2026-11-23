# blearyhope/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines (publicado en Hugging Face bajo el perfil `blearyhope`) que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autoregresivo con backbone de mezcla de expertos (MoE) dispersa: 594.000 millones de parámetros totales con 17.000 millones activos por token, lo que lo sitúa en la categoría de modelos de gran escala pero con coste de inferencia contenido gracias al enrutamiento disperso (8 de 384 expertos por token).

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens, su naturaleza nativamente multimodal (codificador de visión tipo ViT con proyección a un espacio oculto compartido) y su entrenamiento íntegro en precisión NVFP4, lo que lo convierte en uno de los pocos modelos publicados cuyo formato nativo es de 4 bits. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está orientado a sistemas agénticos, asistentes de código, chatbots y pipelines de generación aumentada por recuperación (RAG).

Su relevancia actual radica en la combinación de escala masiva con cuantización nativa de 4 bits y contexto de un millón de tokens, lo que reduce los requisitos de VRAM agregada a unos 500 GB (frente a los 800 GB del checkpoint MXFP8) y lo hace desplegable en clústeres de 2x B300 o 4x H200. El repositorio ocupa 393,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 48 capas con MoE dispersa (8 de 384 expertos por token); atención híbrida local/global; codificador de visión ViT |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativo, checkpoint principal) y MXFP8 (checkpoint alternativo); soporte de 8 bits (tag `8-bit`, `modelopt`) |
| Idiomas soportados | Inglés, con capacidades multilingües generales; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints NVFP4 y MXFP8) |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone feed-forward de mezcla de expertos dispersa: cada token se enruta a 8 de 384 expertos, lo que da 594B parámetros totales con solo 17B activos. La atención combina capas locales y globales (híbrido), lo que permite sostener ventanas de hasta 1M tokens sin un coste cuadrático completo. Es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las representaciones visuales como las de texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta. Acepta imágenes en cualquier formato basado en píxeles, con dimensiones recomendadas entre 40 px y 4096 px por lado.

El modelo fue preentrenado, midtrained y postentrenado en NVFP4, por lo que esta es su precisión nativa; el checkpoint MXFP8 se ofrece como alternativa con una ganancia marginal de 1-2 puntos porcentuales en evaluaciones. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas, de terceros, generación interna y datos sintéticos o aumentados, con procesos de limpieza, deduplicación y filtrado. La model card no detalla el número de tokens de entrenamiento ni si se aplicaron RLHF o DPO de forma explícita.

## Capacidades

- Generación de texto y razonamiento de propósito general, con instrucciones y conversación multiturno.
- Comprensión de imágenes (image-text-to-text) con proyección conjunta al espacio del decoder.
- Generación y comprensión de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la model card.
- Capacidades multilingües generales, con inglés como idioma principal.
- Contexto largo de hasta 1M tokens, apto para documentos extensos y RAG.
- Integración con frameworks de inferencia (SGLang, vLLM, TokenSpeed, Unsloth) y de postentrenamiento (Miles, SkyRL, Snowflake Cortex Training).
- Compatible con endpoints (tag `endpoints_compatible`) y disponible vía proveedores de inferencia de terceros.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para generación, revisión y refactorización de código en varios lenguajes, apoyándose en tool calling para invocar linters, tests o APIs.
- Sistemas agénticos multiturno: con 1M tokens de contexto y soporte de tool-use, es adecuado para agentes que mantienen estado largo y consultan herramientas externas de forma iterativa.
- RAG sobre corpus extensos: la ventana de 1M tokens permite ingerir documentación completa o bases de conocimiento sin fragmentación agresiva, reduciendo la pérdida de contexto.
- Atención al cliente automatizada: gestión de conversaciones multiturno con contexto amplio e historial extenso, incluyendo capturas o imágenes enviadas por el usuario.
- Análisis de documentos con imágenes: extracción y razonamiento sobre PDFs, facturas o capturas, gracias a la entrada multimodal y al contexto largo.
- Asistentes de accesibilidad: descripción y razonamiento sobre imágenes enviadas por el usuario en aplicaciones de apoyo visual.
- Automatización de flujos de trabajo empresariales: agentes que combinan lectura de imágenes, texto y llamadas a herramientas para tareas de back-office.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones ("Open Weights Flash" / "Open Weights Pro") cuyo contenido numérico no está disponible en la información proporcionada. No se han publicado resultados de benchmarks concretos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Resto de evaluaciones | no disponible (tabla truncada en la información proporcionada) |

## Requisitos de hardware

- VRAM agregada mínima: 500 GB con el checkpoint NVFP4; 800 GB con el checkpoint MXFP8.
- Configuraciones de referencia NVFP4: 2x NVIDIA B300 o 4x NVIDIA H200.
- Configuraciones de referencia MXFP8: 4x NVIDIA B300 u 8x NVIDIA H200.
- No cabe en GPU de consumo (RTX 4090, etc.) ni en configuraciones de una sola GPU convencional.
- Frameworks de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, con sus dependencias.
- Postentrenamiento: Miles, SkyRL, Snowflake Cortex Training; fine-tuning vía Tinker con el paquete `tml-renderers`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Alternativa gestionada: API vía NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo estructural:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Small | 594B | 17B | 1M | Apache 2.0 | Pesos abiertos + API |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El idioma principal es el inglés; el rendimiento en otras lenguas no está cuantificado y puede degradarse.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas.
- Sesgos no documentados en la model card; los datos provienen de internet público y fuentes sintéticas, con riesgo de sesgos heredados.
- Requisitos de hardware muy elevados (500-800 GB de VRAM agregada), lo que limita el despliegue a clústeres o APIs gestionadas.
- La cuantización NVFP4 es nativa, pero requiere hardware compatible (B300, H200); en GPUs sin soporte FP4 habría que recurrir a MXFP8 o a conversiones no validadas.
- El checkpoint MXFP8 solo aporta 1-2 puntos porcentuales sobre NVFP4 según el autor, por lo que el uso de MXFP8 no está justificado salvo por compatibilidad.
- Licencia Apache 2.0 permite uso comercial, pero existe una política de uso aceptable del autor que conviene revisar.
- No se detallan los volúmenes ni la composición exacta del dataset de entrenamiento, lo que dificulta auditar procedencia y sesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/blearyhope/Inkling-2-Small
- Checkpoint NVFP4 (referencia del autor): https://huggingface.co/thinkingmachines/Inkling-2-Small
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
