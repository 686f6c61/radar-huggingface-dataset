# omegazug/Inkling-Small-NVFP4

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto, imagen y audio, y genera salidas de texto. Se trata de un transformer autoregresivo decoder-only con una columna vertebral de mezcla de expertos (MoE) dispersa, diseñado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El modelo se publica con pesos abiertos bajo licencia Apache 2.0.

La variante aquí descrita, `omegazug/Inkling-Small-NVFP4`, es una cuantización en NVFP4 (8 bits) del modelo base `thinkingmachines/Inkling-Small`. El modelo base declara 276B parámetros totales y 12B activos por token, aunque el recuento real de parámetros almacenados en safetensors en este repositorio es de 156.032.140.138 (es decir, aproximadamente 156B), lo que refleja la cuantización y posiblemente el empaquetado de pesos. El tamaño total del repositorio es de 170,8 GB.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada de un modelo multimodal MoE de gran tamaño, con soporte para despliegue local mediante SGLang, vLLM, TokenSpeed, Unsloth y Transformers. No obstante, la información pública disponible es limitada: no se detallan los datos de entrenamiento, no se publican resultados de benchmarks en la información proporcionada y la model card no especifica la longitud de contexto ni los idiomas soportados de forma exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa (42 capas, 6 de 256 expertos por token + 2 expertos compartidos, atención híbrida local/global) |
| Parametros totales | 276B declarados por el autor; 156.032.140.138 en safetensors del repo cuantizado |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (modelo base) y NVFP4 (esta variante); tags indican 8-bit |
| Idiomas soportados | Inglés, con capacidades multilingües generales (no se detallan idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Inkling-Small es un transformer autoregresivo decoder-only de 42 capas con una columna vertebral de mezcla de expertos (MoE) dispersa. Cada token se enruta a 6 de 256 expertos, además de 2 expertos compartidos que están activos en todos los tokens. La atención es un híbrido de capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen una amplia variedad de tipos de contenido: texto, imágenes, audio y vídeo. Las fuentes son datos públicos de internet, repositorios públicos, datos de terceros y datos generados o aumentados sintéticamente. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar en objetivos de seguridad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno.
- Comprensión de imágenes: acepta imágenes de hasta 4096 px por dimensión (óptimo entre 40 px y 4096 px).
- Comprensión de audio: acepta WAV a 16 kHz, idealmente de menos de 2 minutos.
- Razonamiento e instrucciones generales.
- Capacidades multilingües generales (inglés como idioma principal).
- Soporte para múltiples lenguajes de programación.
- Uso en sistemas agénticos y de tool-use (según la model card, aunque no se detalla el mecanismo de function calling).
- Integración en pipelines de RAG.
- Salida exclusivamente en texto UTF-8.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede gestionar conversaciones que combinan texto, imágenes y audio, adecuado para chatbots de atención al cliente que reciben capturas de pantalla o notas de voz.
- Análisis de documentos con imágenes: extracción y razonamiento sobre información contenida en imágenes (facturas, gráficos, diagramas) junto con texto, usando el codificador jerárquico de parches.
- Transcripción y comprensión de audio: procesamiento de clips de audio de hasta 2 minutos para tareas de resumen o respuesta a preguntas, gracias a la codificación de tokens discretos de audio.
- Asistentes de código: generación y revisión de código en múltiples lenguajes, integrable en entornos de desarrollo mediante los recipes de vLLM o SGLang.
- Sistemas RAG multimodales: recuperación de información que incluya imágenes y audio además de texto, con el modelo generando respuestas fundamentadas en el contexto recuperado.
- Agentes y tool-use: construcción de flujos agénticos multi-paso donde el modelo interpreta instrucciones y decide acciones, aunque la model card no detalla el esquema exacto de function calling.
- Fine-tuning e investigación: al publicarse con pesos abiertos y licencia Apache 2.0, permite ajuste fino e integración en productos de terceros.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones con columnas para Inkling-Small y varios modelos comparativos (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio cuantizado ocupa 170,8 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en NVFP4; el modelo base en BF16 requeriría aproximadamente el doble.
- GPU recomendadas: para la variante NVFP4, GPUs con soporte de FP4 como las de la familia Blackwell (B200, GB200); para BF16, múltiples A100 80GB o H100 80GB.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) en ninguna de las variantes publicadas.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth, Transformers (recetas enlazadas en la model card) y proveedores de inferencia de terceros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small (esta ficha) | 276B (156B en safetensors cuantizados) | 12B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

Los modelos comparativos aparecen únicamente como columnas en la tabla de evaluaciones de la model card; no se dispone de sus especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card; al entrenarse con datos de internet, es probable que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación: no se cuantifica ni se mitiga explícitamente en la información disponible.
- Limitaciones de contexto: la longitud de contexto no se especifica, lo que impide planificar su uso en tareas de contexto largo.
- Limitaciones de idioma: el modelo está orientado al inglés; las capacidades multilingües son generales y no se detallan por idioma.
- Limitaciones de modalidad: audio en WAV a 16 kHz y menos de 2 minutos; imágenes entre 40 px y 4096 px por dimensión.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza una Política de Uso Aceptable de Thinking Machines que puede imponer restricciones adicionales.
- Cuantización NVFP4: requiere hardware compatible con FP4; el rendimiento y la fidelidad respecto al BF16 no se han documentado en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/omegazug/Inkling-Small-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Variante NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
