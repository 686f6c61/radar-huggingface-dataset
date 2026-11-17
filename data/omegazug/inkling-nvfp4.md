# omegazug/Inkling-NVFP4

## Resumen

Inkling-NVFP4 es una cuantización en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) del modelo multimodal Inkling, desarrollado por Thinking Machines Lab. Inkling es un transformer autoregresivo decoder-only de 66 capas con backbone de mezcla de expertos (MoE) dispersa que acepta entradas de texto, imagen y audio y genera texto. Esta variante concreta, publicada por el usuario omegazug en Hugging Face, reduce el peso del modelo original en BF16 a 8 bits según los tags del repositorio, con un tamaño de 592 GB y 552.845 millones de parámetros almacenados en safetensors.

El modelo resuelve el problema de desplegar un modelo multimodal de gran escala (975B parámetros totales, 41B activos según la model card) en entornos con restricciones de memoria, manteniendo las capacidades de razonamiento, uso de herramientas, generación de código y procesamiento conjunto de texto, imagen y audio. Su relevancia actual radica en que combina una arquitectura MoE nativamente multimodal con una licencia Apache 2.0 permisiva y recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y transformers.

La ficha se basa en la información disponible en el repositorio y en la model card del modelo base; los datos no confirmados se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 66 capas con MoE dispersa (6 de 256 expertos por token + 2 expertos compartidos), atención híbrida local/global, codificador jerárquico de parches para imagen/vídeo y codificación discreta para audio |
| Parametros totales | 975B (modelo base); 552.845.034.562 almacenados en safetensors de esta cuantización |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante de NVIDIA); el repositorio se etiqueta como 8-bit y el modelo base soporta BF16 y NVFP4 |
| Idiomas soportados | Inglés principal, con capacidades multilingües generales; idiomas concretos no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo decoder-only de 66 capas con un backbone feed-forward de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta. Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo procedentes de fuentes públicas, de terceros y de generación o aumento sintético, con procesos de limpieza, deduplicación y filtrado. No se especifican en la información disponible el número de tokens de entrenamiento ni si se aplicaron RLHF o DPO.

Esta variante NVFP4 es una cuantización del modelo base `thinkingmachines/Inkling`, publicada por un tercero (omegazug) y no por el desarrollador original. La model card del modelo base documenta soporte de numéricas BF16 y NVFP4, y recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y transformers. No se detalla en la información proporcionada el método exacto de cuantización (calibración, granularidad por bloque o por canal) ni las posibles pérdidas de precisión asociadas.

## Capacidades

- Generación de texto y razonamiento general, con modo de razonamiento configurable (los resultados se reportan a effort=0.99).
- Procesamiento de imagen en cualquier formato de píxeles, con dimensiones recomendadas entre 40 px y 4096 px.
- Procesamiento de audio en WAV a 16 kHz, idealmente con duración inferior a 20 minutos.
- Entrada de vídeo a través del codificador jerárquico de parches.
- Generación de código y uso de herramientas en entornos agénticos (resultados reportados en SWEBench Verified y SWEBench Pro).
- Soporte de tool calling y razonamiento multi-paso, evidenciado por las evaluaciones HLE con herramientas.
- Capacidades multilingües generales, con inglés como idioma principal.
- Integración con sistemas conversacionales, asistentes de código, chatbots y pipelines de RAG.
- Compatibilidad con despliegue local mediante SGLang, vLLM, TokenSpeed, Unsloth y transformers.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests y corrección de errores, apoyándose en sus resultados en SWEBench Verified (77,6 %) y en el soporte de tool calling.
- Atención al cliente multimodal: gestión de conversaciones multi-turno con entrada de texto, imagen y audio, útil para soporte técnico que requiera analizar capturas de pantalla o grabaciones de voz.
- Análisis de documentos y RAG multimodal: indexación y consulta de documentos que combinan texto e imágenes, con el modelo como generador final en un pipeline de recuperación aumentada.
- Transcripción y comprensión de audio: procesamiento de reuniones o llamadas en WAV a 16 kHz para resúmenes, extracción de acciones y respuesta a preguntas sobre el contenido.
- Agentes autónomos con herramientas: razonamiento multi-paso con llamadas a funciones externas para tareas de investigación, automatización de flujos y resolución de problemas complejos (HLE con herramientas: 46,0 %).
- Evaluación y anotación de datos: generación de descripciones, clasificaciones y respuestas de referencia sobre contenido multimodal para construir datasets de entrenamiento o validación.
- Despliegue de investigación con pesos abiertos: fine-tuning e integración en productos de terceros gracias a la licencia Apache 2.0 y a las recetas para vLLM y SGLang.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base, a effort=0.99 y con comparativas generadas el 14 de julio de 2026. Los modelos comparados incluyen pesos abiertos (Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2, DeepSeek V4 Pro) y cerrados (Gemini 3.1 Pro, Claude Fable 5, GPT 5.6 Sol).

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| HLE (with tools) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | – | – | – | – |

No se han publicado resultados de benchmarks específicos para esta cuantización NVFP4 en la información disponible; los datos anteriores corresponden al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 592 GB en safetensors, por lo que la inferencia requiere al menos ese orden de magnitud de memoria agregada. No se dispone de estimaciones oficiales de VRAM para esta cuantización concreta.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo (975B totales, 41B activos), no es desplegable en una única GPU de consumo.
- GPU de consumo: no cabe en tarjetas consumer como RTX 4090; requiere múltiples aceleradores de centro de datos (A100, H100 o superiores) o agregación de memoria entre GPUs.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers, con recetas publicadas en la model card del modelo base. También hay acceso vía API a través de proveedores de inferencia de terceros y del Tinker Playground.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-NVFP4 (esta ficha) | 975B totales / 41B activos | no disponible | Apache 2.0 | safetensors NVFP4 | Cuantización de terceros del modelo base |
| Inkling (BF16) | 975B totales / 41B activos | no disponible | Apache 2.0 | safetensors BF16 | Modelo original de Thinking Machines Lab |
| Nemotron 3 Ultra | no disponible | no disponible | pesos abiertos | no disponible | Resultados inferiores en HLE, AIME y SWEBench según la tabla |
| Kimi K2.6 | no disponible | no disponible | pesos abiertos | no disponible | Mejores resultados en HLE con herramientas y SWEBench Verified |
| DeepSeek V4 Pro | no disponible | no disponible | pesos abiertos | no disponible | Resultados superiores en SWEBench Verified y HLE |

Los datos de parámetros, contexto y formato de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Esta variante NVFP4 la publica un tercero (omegazug), no Thinking Machines Lab; no hay validación oficial de la cuantización ni garantías de equivalencia con el modelo BF16.
- No se han publicado resultados de benchmarks para esta cuantización concreta; el rendimiento puede diferir del modelo base.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento y uso de herramientas.
- Sesgos potenciales derivados de datos de entrenamiento de internet y de terceros; la model card no detalla evaluaciones de sesgo.
- Idioma principal inglés; las capacidades multilingües son generales y no se especifican los idiomas cubiertos ni su calidad.
- Longitud de contexto no documentada en la información disponible, lo que limita la planificación de despliegues con ventanas largas.
- Requisitos de hardware muy elevados (592 GB de pesos), lo que restringe el despliegue a infraestructura de centro de datos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base remite a una política de uso aceptable de Thinking Machines Lab que conviene revisar.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de funcionamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/omegazug/Inkling-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling
- Variante NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
