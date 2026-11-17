# omegazug/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal autoregresivo desarrollado por Thinking Machines (publicado en Hugging Face bajo el espacio `omegazug/Inkling-Small`) que acepta entradas de texto, imagen y audio y genera texto. Se trata de un transformer decoder-only de 42 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. El modelo declara 276B parámetros totales y 12B activos, aunque el recuento real de safetensors en el repositorio es de 265.956.439.090 parámetros.

El modelo está pensado para desarrolladores que construyen aplicaciones con IA: sistemas agénticos y de uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta.

Su relevancia actual radica en que combina una arquitectura MoE de gran escala con activación reducida (12B), soporte multimodal completo (texto, imagen, audio), licencia Apache 2.0 y compatibilidad con los principales motores de inferencia open source (SGLang, vLLM, TokenSpeed, Unsloth, transformers). El repositorio ocupa 531,9 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE dispersa (6 de 256 expertos + 2 compartidos) y atención híbrida local/global |
| Parametros totales | 276B declarados por el autor; 265.956.439.090 según safetensors |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only de 42 capas con una columna vertebral feed-forward de mezcla de expertos dispersa. Cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes pasan por un codificador jerárquico de parches y el audio por una codificación de tokens discretos; ambas modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente con el texto en el decoder. El modelo declara 276B parámetros totales con 12B activos.

Los datos de entrenamiento incluyen una amplia variedad de tipos de contenido: texto, imágenes, audio y vídeo, procedentes de fuentes públicas, de terceros y de generación o aumento sintético. El proceso de curación incluye limpieza, procesamiento y modificación de los conjuntos de datos, con pasos que varían según el tipo de dato e incluyen deduplicación y filtrado para eliminar datos de baja calidad o para objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto a partir de entradas de texto, imagen y audio (pipeline `image-text-to-text` y `audio-text-to-text`).
- Razonamiento e instrucciones de propósito general, con uso conversacional multi-turno.
- Capacidades de código en múltiples lenguajes de programación, según declara el autor.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling / function calling), orientado a asistentes de código y pipelines de recuperación.
- Procesamiento conjunto de modalidades en un espacio oculto compartido, lo que permite razonar sobre imágenes y audio junto con texto.
- Capacidades multilingües generales más allá del inglés.
- Entrada de imagen: cualquier imagen basada en píxeles, con dimensiones óptimas entre 40px y 4096px por lado.
- Entrada de audio: formato WAV muestreado a 16 kHz, idealmente de menos de 2 minutos.
- Salida únicamente en texto codificado en UTF-8.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede mantener conversaciones multi-turno en las que el usuario adjunta imágenes o audio (por ejemplo, una captura de pantalla o una nota de voz) y el modelo responde en texto, gracias a la proyección conjunta de modalidades en el decoder.
- Asistentes de código en producción: con soporte de tool calling y entrenamiento en múltiples lenguajes de programación, puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests o explicación de errores a partir de fragmentos de código y capturas de trazas.
- Sistemas agénticos con uso de herramientas: el modelo está diseñado explícitamente para sistemas agénticos, de modo que puede orquestar llamadas a APIs y razonamiento multi-paso en flujos de automatización.
- Generación aumentada por recuperación (RAG): su naturaleza multimodal permite indexar y consultar documentos que combinan texto e imágenes (informes escaneados, diagramas técnicos) y generar respuestas fundamentadas.
- Transcripción y análisis de audio corto: al aceptar WAV a 16 kHz de hasta unos 2 minutos, puede emplearse para resumir reuniones breves, extraer acciones de notas de voz o clasificar llamadas de atención al cliente.
- Atención al cliente automatizada: combinación de conversación multi-turno, entrada de imágenes (capturas de error, fotos de producto) y audio (mensajes de voz) para resolver incidencias sin escalado humano en primera línea.
- Fine-tuning e integración en productos de terceros: la licencia Apache 2.0 y la disponibilidad de pesos abiertos permiten a los desarrolladores ajustar el modelo con datos propios y desplegarlo en infraestructura propia.
- Despliegue local con motores open source: recetas oficiales para SGLang, vLLM, TokenSpeed, Unsloth y transformers permiten integrar el modelo en entornos on-premise.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con modelos de pesos abiertos (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash) y modelos de pesos cerrados, pero los datos extraídos de la información disponible están truncados y no contienen los valores numéricos de los benchmarks. Por tanto:

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio en safetensors ocupa 531,9 GB. En BF16 se requiere un conjunto de GPUs con al menos ~540 GB de VRAM agregada solo para los pesos, más memoria para el KV cache y activaciones. En NVFP4 el requisito se reduce aproximadamente a una cuarta parte del peso en BF16, aunque no se dispone de cifras oficiales de VRAM para esa cuantización.
- GPU recomendadas: para BF16 se necesitan múltiples aceleradores de centro de datos (A100 80GB, H100 80GB, H200, B200); no es viable en una sola GPU consumer.
- ¿Cabe en GPU consumer? No en BF16. Con NVFP4 podría ser posible en configuraciones multi-GPU de gama alta, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers, con recetas oficiales publicadas por el autor. También hay acceso vía API a través de proveedores de inferencia de terceros y del Tinker Playground.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card cita como comparables los siguientes modelos, aunque los datos numéricos de rendimiento no están disponibles en la información extraída:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-Small | 276B totales / 12B activos | no disponible | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3.5 397B-A17B | 397B totales / 17B activos | no disponible | no disponible | Pesos abiertos |
| MiMo V2.5 | no disponible | no disponible | no disponible | Pesos abiertos |
| Minimax M2.7 | no disponible | no disponible | no disponible | Pesos abiertos |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | Pesos abiertos |

No se dispone de datos de rendimiento comparativo ni de especificaciones completas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse con datos de internet y de terceros, es probable que herede sesgos presentes en esas fuentes, pero no hay un análisis publicado.
- Riesgo de alucinación: no se cuantifica en la información disponible; como modelo generativo de gran escala, es esperable que pueda producir contenido factualmente incorrecto.
- Limitaciones de contexto: la longitud de contexto no está especificada en la información disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Limitaciones de idioma: el modelo está orientado principalmente al inglés, con capacidades multilingües generales no cuantificadas; el rendimiento en castellano no está documentado.
- Limitaciones de modalidad: la salida es únicamente texto; el audio debe ser WAV a 16 kHz y idealmente de menos de 2 minutos; las imágenes deben tener dimensiones entre 40px y 4096px por lado para un rendimiento óptimo.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero la model card enlaza a una política de uso aceptable (`model-acceptable-use-policy`) del autor que conviene revisar antes de un despliegue en producción.
- Caveat de producción: el modelo es muy grande (531,9 GB en safetensors) y requiere infraestructura multi-GPU; además, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de estabilidad en producción.
- Discrepancia de parámetros: el autor declara 276B totales, mientras que el recuento de safetensors es de 265,96B; conviene verificar el número exacto antes de dimensionar la infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omegazug/Inkling-Small
- Versión BF16 (autor original): https://huggingface.co/thinkingmachines/Inkling-Small
- Versión NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
