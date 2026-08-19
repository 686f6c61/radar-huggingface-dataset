# luganoquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, que acepta entradas de texto, imagen y audio y genera salidas de texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está diseñado para que desarrolladores lo integren en aplicaciones de IA, incluyendo sistemas agénticos, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El modelo destaca por combinar razonamiento nativo sobre audio e imágenes con un esfuerzo de pensamiento variable y una ventana de contexto de hasta 1 millón de tokens.

Desde el punto de vista arquitectónico, es un transformer decoder-only de 42 capas con una espina dorsal de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en cada token. La atención es híbrida, alternando capas locales y globales. Con 276 mil millones de parámetros totales y 12 mil millones activos, ofrece un rendimiento comparable al modelo Inkling completo a una cuarta parte de su tamaño, según sus creadores. El repositorio analizado (luganoquants/Inkling-Small) es una copia o variante alojada por un tercero; el modelo original está disponible en thinkingmachines/Inkling-Small.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso (256 expertos, 6 activos + 2 compartidos), 42 capas, atención híbrida local/global |
| Parametros totales | 276B (según model card); 265.956.439.090 según pesos safetensors |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Inglés principal, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling-Small es un transformer autoregresivo decoder-only con una arquitectura MoE dispersa en las capas feed-forward. Cada token se procesa mediante 6 expertos activos de un total de 256, más 2 expertos compartidos que siempre están activos. La atención combina capas locales y globales para equilibrar eficiencia y capacidad de modelado de dependencias de largo alcance. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen contenido diverso: texto, imágenes, audio y vídeo, procedentes de fuentes públicas, adquisiciones de terceros y datos generados o aumentados sintéticamente. El proceso de curado incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o con fines de seguridad. No se ha especificado el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo fue entrenado en sistemas NVIDIA GB300 NVL72, según la información publicada por Thinking Machines Lab.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen y audio, y produce salidas de texto en UTF-8.
- Razonamiento nativo sobre audio e imágenes: puede procesar y razonar sobre contenido visual y auditivo de forma integrada.
- Esfuerzo de pensamiento variable: el modelo puede ajustar la cantidad de razonamiento previo a la respuesta según la tarea.
- Soporte de tool calling y sistemas agénticos: diseñado para integrarse en aplicaciones que requieren uso de herramientas y ejecución de múltiples pasos.
- Asistencia de código: capaz de trabajar con múltiples lenguajes de programación.
- Capacidades multilingües generales: aunque el idioma principal es el inglés, puede operar en otros idiomas.
- Adecuado para RAG: su ventana de contexto de hasta 1M tokens permite incorporar grandes volúmenes de documentos recuperados.
- Conversación multi-turno: apto para chatbots y asistentes conversacionales.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en entornos de desarrollo (IDE, pipelines de CI/CD) para generar código, explicar fragmentos y sugerir correcciones, gracias a su soporte de tool calling y su capacidad para manejar contextos largos de repositorios.
- Atención al cliente automatizada: con una ventana de contexto de hasta 1M tokens, puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo y recuperando información de bases de conocimiento.
- Análisis de documentos multimodales: procesa informes que combinan texto, gráficos e imágenes (por ejemplo, PDFs escaneados o capturas de pantalla) y genera resúmenes o respuestas a preguntas específicas.
- Transcripción y razonamiento sobre audio: al aceptar audio en formato WAV de 16 kHz, puede transcribir reuniones, extraer conclusiones o responder preguntas sobre el contenido hablado.
- Agentes autónomos con razonamiento multi-paso: su capacidad de razonamiento variable y tool calling permite construir agentes que planifican, ejecutan acciones y verifican resultados en entornos complejos.
- Búsqueda y recuperación aumentada (RAG): su contexto de 1M tokens permite indexar y consultar grandes colecciones de documentos, generando respuestas fundamentadas con citas.
- Moderación de contenido multimodal: puede analizar texto, imágenes y audio para detectar contenido problemático, ayudando en tareas de moderación en plataformas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una tabla de evaluación que compara Inkling-Small con modelos de pesos abiertos como Qwen3.5 397B-A17B, MiMo V2.5 y DeepSeek V4 Flash, y con modelos de pesos cerrados como Minimax M2.7, pero los valores concretos no están accesibles en el material proporcionado. Se recomienda consultar la model card oficial en Hugging Face para obtener los datos completos.

## Requisitos de hardware

- VRAM estimada: con 276B parámetros en BF16 (2 bytes por parámetro), se requieren aproximadamente 552 GB solo para los pesos, más overhead de activaciones y KV cache. En NVFP4 (4 bits), el requisito baja a unos 138 GB.
- GPU recomendadas: no cabe en GPUs de consumo. Se necesitan configuraciones multi-GPU de clase datacenter, como NVIDIA A100 (80 GB), H100 (80 GB) o GB200/GB300, con al menos 8 GPUs para BF16 y 2-4 GPUs para NVFP4.
- Opciones de despliegue: soporta SGLang, vLLM, TokenSpeed, Unsloth y el ecosistema Hugging Face Transformers. También hay acceso vía API a través de proveedores de inferencia externos y el playground de Thinking Machines.
- Latencia y throughput: no se han proporcionado cifras concretas. Al ser un MoE con solo 12B parámetros activos, el coste de cómputo por token es similar al de un modelo denso de 12B, aunque la memoria requerida es la correspondiente a los 276B totales.

## Comparativa con modelos similares

La tabla de evaluación de la model card sitúa a Inkling-Small junto a otros modelos MoE de gran escala, aunque sin valores numéricos disponibles. A continuación se comparan las características principales conocidas:

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Inkling-Small | 276B | 12B | 1M tokens | Texto, imagen, audio | Apache 2.0 |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre las especificaciones de los modelos comparados para realizar una comparativa detallada más allá de los nombres citados en la model card.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos públicos de internet, el modelo puede reflejar sesgos presentes en esos datos, aunque el proceso de curado incluye filtrado con fines de seguridad.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto o inventado, especialmente en tareas de razonamiento complejo o con información ambigua.
- Limitaciones de idioma: aunque tiene capacidades multilingües generales, el rendimiento óptimo se espera en inglés; otros idiomas pueden mostrar resultados inferiores.
- Limitaciones de audio: el audio debe estar en formato WAV a 16 kHz y se recomienda que no supere los 2 minutos de duración para un rendimiento óptimo.
- Limitaciones de imagen: las dimensiones recomendadas para imágenes están entre 40 px y 4096 px por lado; fuera de este rango el rendimiento puede degradarse.
- Restricciones de uso: aunque la licencia es Apache 2.0 (permite uso comercial), Thinking Machines Lab publica una política de uso aceptable que los usuarios deben revisar y cumplir.
- Despliegue: el tamaño total de 276B parámetros implica requisitos de hardware significativos; no es viable en entornos de consumo sin cuantización extrema.

## Enlaces

- Repositorio analizado: https://huggingface.co/luganoquants/Inkling-Small
- Modelo original (BF16): https://huggingface.co/thinkingmachines/Inkling-Small
- Variante NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Model card oficial: https://thinkingmachines.ai/model-card/inkling-small/
- Anuncio de lanzamiento: https://thinkingmachines.ai/news/inkling-small/
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
