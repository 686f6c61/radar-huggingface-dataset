# arbonquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de pesos abiertos desarrollado por Thinking Machines (publicado en Hugging Face bajo la organizacion `arbonquants`), disenado para aceptar entradas de texto, imagen y audio y generar texto. Se trata de un transformer autorregresivo decoder-only de 42 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos mas 2 expertos compartidos activos en todos los tokens. Con 276B parametros totales y 12B activos, la model card lo posiciona como un modelo de proposito general para aplicaciones agenticas, asistentes de codigo, chatbots y sistemas RAG.

La relevancia de Inkling-Small radica en su combinacion de multimodalidad nativa (texto, imagen y audio proyectados a un espacio oculto compartido y procesados conjuntamente por el decoder), su naturaleza MoE de gran escala pero activacion moderada, y una licencia Apache 2.0 que permite uso comercial y fine-tuning. El modelo se distribuye en BF16 y NVFP4, y cuenta con recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y transformers.

La informacion publica disponible es limitada en cuanto a detalles de entrenamiento (numero de tokens, composicion exacta del dataset, tecnicas de alineacion) y a resultados completos de benchmarks, por lo que varios apartados de esta ficha indican explicitamente "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only multimodal con MoE dispersa (42 capas; 6 de 256 expertos por token + 2 expertos compartidos) |
| Parametros totales | 276B (265.956.439.090 segun safetensors) |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Ingles con capacidades multilingues generales (idiomas concretos no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 531,9 GB |

## Arquitectura y entrenamiento

Inkling-Small es un transformer autorregresivo decoder-only de 42 capas con una columna vertebral feed-forward de tipo Mixture-of-Experts dispersa. Cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens. La atencion es un hibrido de capas locales y globales. El modelo es nativamente multimodal: las imagenes se codifican mediante un encoder jerarquico de parches y el audio mediante codificacion en tokens discretos; ambas modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Soporta numerica BF16 y NVFP4.

Los datos de entrenamiento incluyen una amplia variedad de tipos de contenido: texto, imagenes, audio y video, procedentes de fuentes publicas, de terceros y de generacion o aumento sintetico. El proceso de curacion incluye limpieza, procesamiento y modificacion de datasets, con deduplicacion y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras alineaciones. Tampoco se detallan innovaciones como decodificacion especulativa o mecanismos de atencion lineal mas alla del hibrido local/global.

## Capacidades

- Generacion de texto en ingles y capacidades multilingues generales.
- Razonamiento e instrucciones de proposito general.
- Generacion y asistencia de codigo en multiples lenguajes de programacion.
- Comprension de imagenes: entrada de cualquier imagen basada en pixeles, con rendimiento optimo entre 40 px y 4096 px por dimension.
- Comprension de audio: entrada WAV a 16 kHz, con rendimiento optimo para audios de menos de 2 minutos.
- Salida exclusivamente textual en UTF-8.
- Orientado a sistemas agenticos y de uso de herramientas (tool-use), segun la model card.
- Soporte para conversacion multi-turno y sistemas RAG.
- No se especifica explicitamente soporte de tool calling/function calling, modo thinking ni otras capacidades especiales mas alla de lo indicado.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con entradas de texto e imagen (por ejemplo, capturas de pantalla o fotos de productos) y generar respuestas textuales, adecuado para chatbots de soporte con contexto multimodal.
- Asistentes de codigo: con capacidades multilingues de programacion y soporte para sistemas agenticos, puede integrarse en asistentes que generan, explican y revisan codigo en multiples lenguajes.
- Sistemas RAG multimodales: al aceptar texto, imagen y audio y generar texto, puede utilizarse como generador final en pipelines de recuperacion aumentada que combinen documentos textuales con imagenes o transcripciones de audio.
- Analisis de audio corto: transcripcion, resumen o respuesta a preguntas sobre grabaciones WAV de hasta aproximadamente 2 minutos a 16 kHz, util en herramientas de notas de reunion o analisis de llamadas.
- Procesamiento de documentos con imagenes: al admitir imagenes de hasta 4096 px por dimension, puede emplearse para interpretar diagramas, capturas o documentos escaneados y producir descripciones o respuestas textuales.
- Sistemas agenticos y de uso de herramientas: la model card lo orienta explicitamente a sistemas agenticos, por lo que puede servir como motor de razonamiento en agentes que orquestan llamadas a herramientas y APIs.
- Fine-tuning para dominios verticales: con licencia Apache 2.0 y recetas para Unsloth, es posible ajustar el modelo para tareas especializadas manteniendo los pesos abiertos.
- Despliegue en produccion con cuantizacion NVFP4: permite servir el modelo en infraestructura con requisitos de memoria reducidos frente a BF16, segun las recetas de SGLang y vLLM.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones que compara Inkling-Small con modelos de pesos abiertos (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash) y modelos de pesos cerrados, pero los resultados numericos concretos no estan disponibles en la informacion proporcionada.

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los 276B parametros totales en BF16 requieren aproximadamente 552 GB solo para pesos, y el repo ocupa 531,9 GB; en NVFP4 el requisito de memoria se reduce sustancialmente, aunque no se publica una cifra oficial.
- GPU recomendadas: no especificadas en la informacion disponible. Por el tamano del modelo, el despliegue en BF16 requiere multiples aceleradores de clase centro de datos (A100, H100, H200 o superiores) con agregacion de memoria suficiente.
- Cabe en GPU de consumo: no en BF16; la viabilidad en GPU de consumo depende de la cuantizacion NVFP4 y de la memoria agregada, sin datos oficiales confirmados.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers, con recetas publicadas para cada uno; tambien acceso via API a traves de proveedores de inferencia de terceros y Tinker Playground.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-Small | 276B totales / 12B activos | no disponible | Apache 2.0 | Pesos abiertos (BF16, NVFP4) |
| Qwen3.5 397B-A17B | 397B totales / 17B activos | no disponible | no disponible | Citado como pesos abiertos en la model card |
| MiMo V2.5 | no disponible | no disponible | no disponible | Citado como pesos abiertos en la model card |
| Minimax M2.7 | no disponible | no disponible | no disponible | Citado como pesos abiertos en la model card |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | Citado como pesos abiertos en la model card |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la model card incluye una tabla de evaluaciones pero sin valores numericos accesibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; el entrenamiento con datos de internet y sinteticos puede introducir sesgos no especificados.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de proposito general, es susceptible de producir contenido facticamente incorrecto.
- Limitaciones de contexto: la longitud de contexto no se publica, lo que dificulta planificar cargas de trabajo de contexto largo.
- Limitaciones de idioma: el modelo esta orientado principalmente al ingles, con capacidades multilingues generales no detalladas; el rendimiento en castellano no esta documentado.
- Limitaciones de modalidad: la salida es exclusivamente texto; el audio debe ser WAV a 16 kHz y se recomienda menos de 2 minutos; las imagenes rinden mejor entre 40 px y 4096 px por dimension.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card enlaza una politica de uso aceptable (Acceptable Use) que conviene revisar antes de desplegar en produccion.
- Caveats para produccion: el tamano del repo (531,9 GB) y los 276B parametros totales implican requisitos de infraestructura elevados; la falta de datos publicos de benchmarks y de contexto limita la evaluacion previa.
- Trazabilidad: el modelo aparece publicado bajo la organizacion `arbonquants` en Hugging Face, mientras que la model card referencia enlaces de `thinkingmachines`; conviene verificar la procedencia y la integridad de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/arbonquants/Inkling-Small
- BF16 (referencia de la model card): https://huggingface.co/thinkingmachines/Inkling-Small
- NVFP4 (referencia de la model card): https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
