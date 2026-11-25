# nokkela-ai/Inkling-2-Small

## Resumen
Inkling 2 Small es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines, distribuido en este repositorio como una copia independiente (fork) publicada por nokkela-ai. El modelo acepta entradas de texto e imagen y genera texto en UTF-8, y esta orientado a aplicaciones de desarrollo: asistentes de codigo, chatbots, sistemas con tool calling y pipelines de generacion aumentada por recuperacion (RAG). Su relevancia actual radica en que combina una ventana de contexto de hasta 1M tokens con una arquitectura MoE de gran escala, lo que permite procesar documentos e imagenes extensas sin truncamiento.

La arquitectura es un transformer autoregresivo decoder-only de 48 capas con backbone de mezcla de expertos dispersa: cada token se enruta a 8 de 384 expertos. El modelo declara 594.000 millones de parametros totales (confirmado por los pesos en safetensors: 594.050.672.720) y 17.000 millones de parametros activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. La atencion es hibrida, con capas locales y globales, y la modalidad visual se procesa mediante un vision transformer cuyas proyecciones convergen en el mismo espacio oculto que el texto.

Este repositorio concreto es una cuantizacion en 8 bits (etiquetas `8-bit` y `modelopt`) del checkpoint original, con un tamano de repositorio de 393,5 GB. La licencia es Apache 2.0, lo que facilita su integracion en productos comerciales, aunque el despliegue exige hardware de centro de datos: el checkpoint principal NVFP4 requiere al menos 500 GB de VRAM agregada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only de 48 capas con MoE dispersa (8 de 384 expertos) y atencion hibrida local/global; vision transformer nativo |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (nativa, checkpoint principal), MXFP8 (checkpoint alternativo), 8-bit via modelopt (esta copia) |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 48 capas con un backbone feed-forward de mezcla de expertos dispersa. Cada token se enruta a 8 de 384 expertos, lo que da lugar a 594B parametros totales con solo 17B activos por token. La atencion combina capas locales y globales, una eleccion coherente con la ventana de 1M tokens. La multimodalidad es nativa: las imagenes se codifican con un vision transformer y tanto las proyecciones visuales como las de texto se proyectan en un espacio oculto compartido que procesa conjuntamente el decoder. La entrada de imagen admite cualquier formato basado en pixeles, con dimensiones idealmente entre 40 px y 4096 px por lado.

Segun la model card, los datos de entrenamiento incluyen texto, imagenes y video, procedentes de fuentes publicas de internet, repositorios accesibles publicamente, datos generados internamente y datos sinteticos o aumentados. El modelo fue preentrenado, entrenado en fase intermedia y postentrenado en NVFP4, por lo que esa es su precision nativa; el checkpoint MXFP8 solo mejora entre 1 y 2 puntos porcentuales en las evaluaciones, una diferencia que el autor considera irrelevante en la practica. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion porcentual del dataset, ni si se aplicaron tecnicas concretas de RLHF o DPO.

## Capacidades
- Generacion de texto conversacional multi-turno con instrucciones y contexto de hasta 1M tokens.
- Comprension de imagenes: entrada image-text-to-text con soporte de imagenes de hasta 4096 px por dimension.
- Razonamiento y codigo: el modelo declara uso en asistentes de codigo y en multiples lenguajes de programacion.
- Tool calling y function calling para sistemas de agentes.
- Razonamiento multi-paso orientado a agentes y pipelines automatizados.
- Capacidades multilingues generales, con ingles como idioma principal.
- Integracion en sistemas RAG para recuperacion y sintesis sobre documentos extensos.
- Ajuste fino posterior permitido por licencia y por el ecosistema de herramientas indicado (Tinker, Miles, SkyRL, Snowflake Cortex Training).

## Casos de uso
- Asistencia de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD y editores para revision de parches, explicacion de errores y generacion de tests, apoyandose en tool calling para consultar repositorios o ejecutar comandos.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con historial largo gracias a la ventana de 1M tokens, lo que permite mantener el contexto completo de una sesion sin resumen intermedio.
- Analisis de documentos extensos con imagenes: informes financieros, contratos o manuales tecnicos con graficos y tablas se pueden procesar en una sola pasada, combinando OCR visual y razonamiento textual.
- Agentes autonomos multi-paso: el soporte de function calling y el contexto largo permiten planificar tareas, invocar herramientas y mantener el estado de la tarea a lo largo de muchas iteraciones.
- RAG sobre corpus grandes: la ventana de 1M tokens reduce la necesidad de troceado agresivo y permite inyectar muchos fragmentos recuperados junto con la pregunta.
- Moderacion y extraccion de informacion multimodal: clasificacion y extraccion estructurada de contenido en capturas, formularios o imagenes de documentos, con salida de texto UTF-8.
- Fine-tuning especializado: al estar bajo Apache 2.0 y contar con recetas para Tinker, Miles y SkyRL, es viable adaptarlo a dominios verticales (legal, sanitario, industrial) con datos propios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que el checkpoint MXFP8 obtiene entre 1 y 2 puntos porcentuales mas que el NVFP4 en las evaluaciones, sin detallar las tareas ni los valores absolutos.

## Requisitos de hardware
- VRAM para el checkpoint NVFP4 (principal): al menos 500 GB agregados; configuraciones de ejemplo con 2x NVIDIA B300 o 4x NVIDIA H200.
- VRAM para el checkpoint MXFP8: al menos 800 GB agregados; 4x NVIDIA B300 u 8x NVIDIA H200.
- Esta copia cuantizada en 8 bits ocupa 393,5 GB en el repositorio, por lo que sigue requiriendo un cluster multi-GPU; no cabe en GPU de consumo.
- GPU de consumo (RTX 4090, 24 GB): no viable para el modelo completo; solo tendria sentido con tecnicas de offload a CPU/SSD, con latencia muy alta y no documentadas.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face transformers, cada uno con su receta publicada.
- Postentrenamiento: Miles, SkyRL y Snowflake Cortex Training.
- Acceso via API de terceros: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye resultados de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa de parametros, contexto y rendimiento.

## Limitaciones y advertencias
- Idiomas: el modelo esta disenado principalmente para ingles; el soporte multilingue se describe como "general", sin garantias por idioma.
- Alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; en tareas de RAG y agentes conviene validar las salidas.
- Sesgos: la model card no detalla analisis de sesgos; al entrenarse con datos de internet y datos sinteticos, es esperable que herede sesgos de esas fuentes.
- Licencia: Apache 2.0 permite uso comercial, pero el autor publica una politica de uso aceptable separada que conviene revisar antes de desplegar en produccion.
- Hardware: el requisito de 500-800 GB de VRAM agregada excluye el despliegue en infraestructura de gama media; el coste operativo es alto.
- Esta copia concreta: es un fork de terceros (nokkela-ai) cuantizado en 8 bits con modelopt; no es el checkpoint oficial y puede presentar diferencias de calidad frente al NVFP4 o MXFP8 originales.
- Contexto: aunque se declara 1M tokens, no se especifica el rendimiento real en el extremo de la ventana; la atencion hibrida mitiga pero no elimina la degradacion tipica en contextos muy largos.
- Madurez: el repositorio tiene 54 descargas y 0 likes, y fue creado en noviembre de 2026; se trata de una publicacion reciente y poco validada por la comunidad.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/nokkela-ai/Inkling-2-Small
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
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
