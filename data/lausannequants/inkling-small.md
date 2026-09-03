# lausannequants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de código abierto desarrollado por Thinking Machines Lab, diseñado para procesar entradas de texto, imagen y audio y generar salidas de texto. Su arquitectura es un transformer decoder-only con mezcla de expertos (MoE) de 276 mil millones de parámetros totales, de los cuales solo 12 mil millones se activan por token, lo que lo hace notablemente eficiente en inferencia. El modelo admite una ventana de contexto de hasta 1 millón de tokens, lo que permite tareas de razonamiento de largo alcance y procesamiento de documentos extensos.

La relevancia de Inkling-Small radica en su combinación de capacidades multimodales nativas (imagen y audio) con un razonamiento ajustable mediante "esfuerzo de pensamiento" variable, similar a otros modelos de razonamiento recientes. Al liberar sus pesos bajo licencia Apache 2.0, Thinking Machines Lab busca democratizar el acceso a un modelo de gran tamaño con un coste de inferencia reducido gracias a su arquitectura MoE. Está pensado para desarrolladores que construyen asistentes de IA, sistemas agénticos, herramientas de codificación y aplicaciones de generación aumentada por recuperación (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (42 capas, 256 expertos, 6 activos por token + 2 compartidos) |
| Parametros totales | 276B (según model card); 265.956.439.090 en safetensors del repositorio lausannequants |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | BF16, NVFP4 (también disponibles cuantizaciones GGUF de terceros) |
| Idiomas soportados | Inglés principal, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también GGUF para versiones cuantizadas) |

## Arquitectura y entrenamiento

Inkling-Small emplea una arquitectura de transformer decoder-only de 42 capas con una espina dorsal feed-forward basada en MoE dispersa: cada token se enruta a 6 de los 256 expertos, más 2 expertos compartidos que se activan siempre. La atención combina capas locales y globales, lo que permite capturar dependencias de corto y largo alcance de forma eficiente. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación discreta de tokens; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente en el decoder.

El entrenamiento utilizó datos de fuentes públicas, adquisiciones de terceros y datos sintéticos, incluyendo texto, imágenes, audio y vídeo. El proceso de curado incluyó limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o con fines de seguridad. No se especifica el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; la información disponible no lo detalla.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen y audio, y produce respuestas de texto.
- Razonamiento nativo sobre imágenes y audio: puede analizar contenido visual y auditivo, responder preguntas sobre ellos y realizar tareas de razonamiento que integran múltiples modalidades.
- Esfuerzo de pensamiento variable: permite ajustar el nivel de razonamiento (p. ej., modo rápido o modo profundo) según la tarea.
- Soporte de tool calling y uso de agentes: diseñado para integrarse en sistemas agénticos y de uso de herramientas.
- Generación de código: entrenado en múltiples lenguajes de programación, adecuado para asistentes de codificación.
- Capacidades multilingües: aunque el inglés es el idioma principal, tiene capacidades generales en otros idiomas.
- Ventana de contexto larga: hasta 1M tokens, útil para documentos extensos, conversaciones largas y análisis de grandes volúmenes de datos.

## Casos de uso

- Asistentes de atención al cliente multimodal: el modelo puede gestionar conversaciones que incluyen capturas de pantalla, imágenes de productos o mensajes de voz, manteniendo el contexto durante largas interacciones gracias a su ventana de 1M tokens.
- Análisis de documentos técnicos y científicos: procesa PDFs, figuras, gráficos y tablas, extrayendo información y respondiendo preguntas complejas sobre el contenido.
- Generación de código en producción: integrable en pipelines de CI/CD mediante tool calling, puede revisar código, sugerir correcciones y generar tests a partir de descripciones en lenguaje natural.
- Sistemas de transcripción y resumen de audio: acepta audio en WAV a 16kHz, transcribe reuniones, genera actas y resume conversaciones largas.
- Agentes autónomos de investigación: combina búsqueda web, lectura de imágenes y razonamiento multi-paso para recopilar y sintetizar información de fuentes heterogéneas.
- Asistentes educativos interactivos: explica conceptos usando diagramas, ecuaciones o ejemplos de audio, adaptando el nivel de detalle según el esfuerzo de pensamiento configurado.
- Moderación de contenido visual y auditivo: analiza imágenes y audio para detectar contenido inapropiado, generando informes textuales.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks comparativa con modelos como Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores numéricos no están disponibles en el extracto proporcionado. No se pueden reportar resultados concretos sin riesgo de inventar datos. Se recomienda consultar la model card original para obtener las cifras completas.

## Requisitos de hardware

- VRAM estimada: con 276B parámetros en BF16, se necesitan aproximadamente 552 GB de memoria (2 bytes por parámetro). Con cuantización NVFP4 (4 bits), la huella se reduce a unos 138 GB, aunque el modelo completo debe residir en memoria.
- GPU recomendadas: para inferencia en BF16 se requieren múltiples GPUs de alta gama (p. ej., 8× A100 80GB o 8× H100 80GB). Con NVFP4, podría desplegarse en 2-4 GPUs de 80GB.
- Compatibilidad con GPU de consumo: no es viable en una sola GPU de consumo (p. ej., RTX 4090 con 24GB) sin cuantizaciones extremas; existen versiones GGUF de terceros (p. ej., miweru/Inkling-Small-REAP-137B-A12B-de-GGUF) que podrían ejecutarse en hardware más modesto, aunque con pérdida de calidad.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers. También hay acceso vía API a través de proveedores externos.
- Latencia y throughput: no se han publicado datos específicos; al ser MoE con 12B activos, el throughput por token es comparable a un modelo denso de 12B, pero la memoria requerida es la de un modelo de 276B.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Modalidades |
|---|---|---|---|---|---|
| Inkling-Small | 276B | 12B | 1M | Apache 2.0 | Texto, imagen, audio |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de los modelos comparables no están disponibles en la información proporcionada; la model card los menciona como referencias en sus benchmarks, pero sin especificaciones detalladas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje grande, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Idioma principal: aunque tiene capacidades multilingües, el rendimiento óptimo se espera en inglés; otros idiomas pueden presentar degradación.
- Entradas de audio: se recomienda audio WAV a 16kHz y duración inferior a 2 minutos para un rendimiento óptimo; formatos o duraciones diferentes pueden dar resultados subóptimos.
- Requisitos de hardware: el tamaño total del modelo (276B) implica una infraestructura considerable para despliegue local; las cuantizaciones reducen la huella pero pueden afectar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero se debe revisar la política de uso aceptable de Thinking Machines Lab para casos específicos.
- Datos de entrenamiento: no se detallan los conjuntos de datos exactos ni las técnicas de alineación (RLHF/DPO), lo que limita la evaluación de sesgos y comportamientos no deseados.

## Enlaces

- Repositorio HuggingFace (lausannequants/Inkling-Small): https://huggingface.co/lausannequants/Inkling-Small
- Modelo original (thinkingmachines/Inkling-Small): https://huggingface.co/thinkingmachines/Inkling-Small
- Anuncio oficial: https://thinkingmachines.ai/news/inkling-small/
- Model card oficial: https://thinkingmachines.ai/model-card/inkling-small/
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Recetas de despliegue: SGLang (https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small), vLLM (https://recipes.vllm.ai/thinkingmachines/Inkling-Small), TokenSpeed (https://lightseek.org/tokenspeed/recipes/models#Inkling), Unsloth (https://unsloth.ai/docs/models/inkling)
