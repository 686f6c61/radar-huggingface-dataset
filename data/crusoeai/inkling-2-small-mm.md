# crusoeai/Inkling-2-Small-MM

## Resumen

Inkling 2 Small es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines, distribuido en Hugging Face bajo el identificador `crusoeai/Inkling-2-Small-MM`. Se trata de un transformer autoregresivo multimodal con backbone de mezcla de expertos (MoE) dispersa, disenado para aplicaciones de proposito general que combinan texto e imagen: asistentes de codigo, sistemas agente con uso de herramientas, chatbots y pipelines de generacion aumentada por recuperacion (RAG).

El modelo cuenta con 594.050.672.720 parametros totales (unos 594B) y 17B parametros activos por token, con una ventana de contexto de hasta 1M tokens. Su arquitectura consta de 48 capas decoder-only con atencion hibrida local/global y un encoder de vision basado en vision transformer que proyecta imagenes y texto a un espacio oculto compartido. Se distribuye en dos formatos numericos: NVFP4 (nativo, checkpoint principal) y MXFP8 (alternativo con una ganancia marginal de 1-2 puntos porcentuales en evaluaciones).

Su relevancia actual radica en la combinacion de escala masiva con activacion dispersa (17B activos sobre 594B totales), contexto extremadamente largo y licencia Apache 2.0, lo que lo posiciona como una opcion abierta para despliegues de investigacion y productos de terceros que requieran capacidades multimodales y agenticas sin restricciones de licencia comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con MoE dispersa (48 capas, atencion hibrida local/global, encoder de vision ViT) |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B (8 de 384 expertos por token) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativo), MXFP8 |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas; multiples lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); checkpoints NVFP4 y MXFP8 |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone feed-forward de mezcla de expertos dispersa: cada token se enruta a 8 de 384 expertos, lo que resulta en 17B parametros activos sobre un total de 594B. La atencion combina capas locales y globales de forma hibrida. El modelo es nativamente multimodal: las imagenes se codifican mediante un vision transformer y tanto las entradas visuales como las de texto se proyectan a un espacio oculto compartido que procesa conjuntamente el decoder.

Los datos de entrenamiento incluyen texto, imagenes y video, provenientes de fuentes publicas de internet, repositorios publicos, contenido generado internamente y datos sinteticos o aumentados. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad y reforzar objetivos de seguridad. El modelo fue preentrenado, midtrained y post-trained en NVFP4, que constituye su precision nativa; no se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion porcentual del dataset, ni si se emplearon tecnicas especificas de RLHF o DPO.

## Capacidades

- Generacion de texto e instrucciones de proposito general en ingles y con capacidades multilingues generales.
- Entrada multimodal: acepta texto en UTF-8 e imagenes en cualquier formato basado en pixeles (dimensiones ideales entre 40px y 4096px por lado).
- Razonamiento y codigo: soporte declarado para multiples lenguajes de programacion y asistentes de codigo.
- Sistemas agente y uso de herramientas: el modelo esta disenado explicitamente para aplicaciones agenticas y de tool-use.
- Generacion aumentada por recuperacion (RAG): mencionado como caso de uso objetivo en la model card.
- Conversacion multiturno con ventana de contexto de hasta 1M tokens.
- Salida exclusivamente textual (UTF-8); no genera imagenes ni audio.
- No se detalla en la informacion disponible la existencia de un modo "thinking" explicito, soporte de audio ni function calling nativo con esquema formal.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en IDE o pipelines de CI/CD para revision de codigo, generacion de parches y explicacion de errores, aprovechando sus 17B parametros activos para mantener latencia contenida pese al tamano total.
- Sistemas agente con uso de herramientas: al estar disenado para aplicaciones agenticas, puede orquestar llamadas a APIs y razonamiento multi-paso en flujos automatizados.
- RAG sobre documentacion extensa: su ventana de 1M tokens permite ingerir grandes volumenes de contexto recuperado sin truncamiento agresivo, adecuado para bases de conocimiento corporativas.
- Atencion al cliente automatizada: gestiona conversaciones multiturno con contexto largo y puede procesar capturas o imagenes enviadas por el usuario gracias a su encoder de vision.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre graficos, tablas escaneadas o diagramas combinados con texto, en tareas de investigacion o back-office.
- Fine-tuning para dominios verticales: al publicarse con pesos abiertos y licencia Apache 2.0, permite post-entrenamiento con frameworks como Miles, SkyRL o Snowflake Cortex Training para adaptar el modelo a sectores regulados.
- Despliegue via API gestionada: disponible a traves de proveedores como NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare para equipos que no dispongan de clústeres GPU propios.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones con columnas para "Open Weights Flash" y "Open Weights Pro", pero los valores numericos no estan disponibles en la informacion proporcionada. Unicamente se indica de forma cualitativa que el checkpoint MXFP8 obtiene una ganancia marginal de 1-2 puntos porcentuales sobre el NVFP4 en evaluaciones, sin que el autor la considere significativa para casos practicos.

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM agregada minima: 500 GB para el checkpoint NVFP4 (configuraciones de 2x NVIDIA B300 o 4x NVIDIA H200).
- VRAM agregada minima: 800 GB para el checkpoint MXFP8 (4x NVIDIA B300 u 8x NVIDIA H200).
- No cabe en GPUs de consumo (RTX 4090, 5090 ni similares); requiere hardware de centro de datos.
- GPUs recomendadas: NVIDIA B300 (formato nativo NVFP4) o NVIDIA H200.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento: Miles, SkyRL y Snowflake Cortex Training.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparativa rigurosa. A continuacion se indican unicamente los datos estructurales conocidos de Inkling 2 Small frente a alternativas abiertas de gran escala, marcando como "no disponible" los campos sin datos verificables.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Small | 594B | 17B | 1M tokens | Apache 2.0 | Pesos abiertos en HF; APIs gestionadas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta orientado principalmente al ingles; su rendimiento en castellano u otros idiomas no esta cuantificado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no se documentan tasas de error especificas.
- Sesgos potenciales derivados de datos de internet publico, contenido de terceros y datos sinteticos; el autor declara filtrado por calidad y seguridad pero no detalla auditorias de sesgo.
- Requisitos de hardware muy elevados (500-800 GB de VRAM agregada), lo que limita su uso a infraestructura de centro de datos o a APIs de terceros.
- La precision nativa NVFP4 implica que la reproducibilidad exacta de resultados en otras precisiones puede diferir; el checkpoint MXFP8 solo aporta 1-2 puntos porcentuales segun el autor.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor remite a una politica de uso aceptable (`model-acceptable-use-policy`) que conviene revisar antes de desplegar en produccion.
- El modelo solo genera texto; no produce imagenes, audio ni otras modalidades de salida.
- No se detallan limitaciones especificas sobre el manejo de imagenes fuera del rango de 40px a 4096px por dimension.

## Enlaces

- Hugging Face: https://huggingface.co/crusoeai/Inkling-2-Small-MM
- Checkpoint NVFP4 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
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
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
