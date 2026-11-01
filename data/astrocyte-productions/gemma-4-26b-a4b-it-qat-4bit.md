# astrocyte-productions/gemma-4-26B-A4B-it-qat-4bit

## Resumen

Gemma 4 26B A4B IT QAT es un modelo multimodal de Google (familia Gemma 4) con arquitectura de mezcla de expertos (MoE), instruido y entrenado con cuantización consciente (QAT). Esta ficha concreta, publicada por el usuario `astrocyte-productions`, no es un lanzamiento oficial de Google: se trata de una conversión no oficial del checkpoint QAT de Google (`google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`) a pesos MLX de 4 bits, pensada para ejecutarse en Apple Silicon mediante `mlx-vlm`.

El modelo resuelve el problema de desplegar un modelo multimodal de ~25.800 millones de parámetros totales (con solo una fracción activa por token, al ser MoE) en hardware de Apple con un peso de 15,61 GB. La conversión aplica cuantización afín de 4 bits con grupo de 64, manteniendo a 8 bits las proyecciones densas del MLP y el router del MoE, y conservando la torre de visión en bfloat16. El resultado es un modelo `image-text-to-text` que acepta texto e imagen, con licencia Apache 2.0.

Es relevante ahora porque permite probar localmente en Mac un modelo de la generación Gemma 4 con capacidades multimodales y MoE, sin depender de GPUs NVIDIA ni de servicios en la nube, a costa de asumir que la conversión no está validada por Google y que la model card no aporta datos de benchmarks ni de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (gemma4, mezcla de expertos, multimodal texto+imagen) |
| Parametros totales | 25.805.936.206 (~25,8 B) |
| Parametros activos | no disponible (el nombre "A4B" sugiere ~4 B activos, pero no se confirma en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (grupo 64) por defecto; 8 bits (grupo 64) en proyecciones MLP densas y router; torre de visión en bfloat16; media de 4,843 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), repositorio de 15,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de la familia Gemma 4, en su variante condicional (`Gemma4ForConditionalGeneration`), que combina un modelo de lenguaje con una torre de visión para entrada de imagen y texto. El checkpoint de origen es la versión instruction-tuned con QAT de Google, es decir, entrenada con cuantización consciente para que la versión cuantizada a 4 bits conserve el comportamiento del modelo en precisión completa. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

La conversión a MLX se realizó con `mlx-vlm 0.7.2`, `mlx 0.32.2` y `transformers 5.17.0` sobre Python 3.12, el 26 de octubre de 2026. Se aplicó cuantización afín de 4 bits con grupo de 64 a la mayor parte del modelo de lenguaje (incluidas la tabla de embeddings y las proyecciones de atención), y 8 bits con grupo de 64 a las proyecciones densas del MLP (`gate_proj`, `up_proj`, `down_proj`) y al router (`router.proj`) en las 30 capas (120 módulos). La torre de visión, los pesos de normalización y los escalares de capa no se cuantizaron; la torre permanece en bfloat16. La cuantización se ejecutó en el stream de CPU de MLX para evitar diferencias de redondeo del cuantizador de GPU y el timeout del command buffer de Metal en un Mac de 34 GB. Los ficheros `tokenizer.json`, `chat_template.jinja` y `generation_config.json` son idénticos byte a byte a los del checkpoint de origen.

## Capacidades

- Generación de texto conversacional con ajuste por instrucciones (instruction-tuned).
- Entrada multimodal de imagen y texto (`image-text-to-text`), con torre de visión incluida en los pesos.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla `chat_template.jinja` heredada del modelo de origen).
- Mezcla de expertos con enrutamiento por token, lo que reduce el cómputo activo respecto a un modelo denso del mismo tamaño total.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible; la model card indica explícitamente que el modelo de origen no tiene entrada de audio.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno con instrucciones y contexto conversacional, aprovechando el formato chat heredado y el tamaño de 15,61 GB que cabe en un Mac con memoria unificada suficiente.
- Descripción y análisis de imágenes en local: al incluir la torre de visión, permite tareas de image-text-to-text como responder preguntas sobre capturas, diagramas o fotografías sin enviar datos a la nube.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve para validar pipelines de `mlx-vlm` (procesador de imagen, plantilla de chat, generación) antes de pasar a un despliegue en servidor.
- Evaluación comparativa de cuantización: al ser una conversión QAT a 4 bits con capas selectivas a 8 bits, es útil para medir la pérdida de calidad frente al checkpoint de origen en tareas concretas del equipo.
- Extracción de información de documentos escaneados o capturas: combinando entrada de imagen y generación de texto, se puede usar para transcribir o resumir contenido visual en un flujo local.
- Docencia e investigación sobre MoE y QAT: permite inspeccionar en local el comportamiento de un modelo MoE cuantizado y comparar el efecto de mantener el router y el MLP a 8 bits frente a una cuantización uniforme a 4 bits.
- Automatización de tareas de oficina en Mac: generación de borradores, resúmenes y respuestas a partir de texto e imágenes dentro de aplicaciones de escritorio, sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: 15,61 GB en safetensors MLX (media de 4,843 bits por peso), más overhead de ejecución y caché KV.
- Memoria unificada estimada: se necesita un Mac con al menos ~18-20 GB de memoria unificada para cargar los pesos y operar con margen; la conversión se documentó ejecutándose en un Mac de 34 GB.
- GPU: no aplica GPU NVIDIA; el destino es Apple Silicon con Metal. No hay datos de VRAM para A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: no disponible para GPUs de consumo tipo RTX 4090; el formato es específico de MLX/Apple Silicon.
- Despliegue: `mlx-vlm` (versión 0.7.2 usada en la conversión) sobre `mlx` 0.32.2; no se indica soporte de vLLM, llama.cpp, Ollama o TGI para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| astrocyte-productions/gemma-4-26B-A4B-it-qat-4bit | ~25,8 B totales (MoE) | no disponible | MLX safetensors 4-bit | Apache 2.0 | Conversión no oficial para Apple Silicon |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | ~25,8 B totales (MoE) | no disponible | safetensors (origen) | Apache 2.0 | Checkpoint oficial de Google del que deriva esta conversión; no es MLX |
| mlx-community (builds MLX de Gemma 4) | no disponible | no disponible | MLX | no disponible | La model card menciona que el resultado es byte-idéntico a builds de mlx-community, pero no se detallan sus especificaciones |

No se dispone de datos de benchmarks ni de otros modelos comparables con cifras verificables en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de Google y no ha sido validada por el equipo de Gemma; úsese con cautela en producción.
- Solo Apple Silicon: los pesos están en formato MLX y no son directamente utilizables en ecosistemas CUDA, vLLM o llama.cpp.
- Sin datos de evaluación: no hay benchmarks publicados que cuantifiquen la pérdida de calidad frente al checkpoint QAT de origen.
- Idiomas no declarados: la información no especifica qué idiomas cubre el modelo.
- Contexto no declarado: se desconoce la longitud máxima de contexto, lo que impide planificar cargas de documentos largos.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no hay datos específicos de mitigación en la información disponible.
- Sesgos: no disponibles en la información proporcionada.
- Licencia: Apache 2.0 según la model card, con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de uso de Gemma antes de un despliegue comercial.
- La torre de visión se mantiene en bfloat16, por lo que el consumo de memoria es mayor que el que sugeriría una cuantización uniforme a 4 bits.
- El modelo de origen no admite audio; no debe esperarse entrada de audio en esta conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/astrocyte-productions/gemma-4-26B-A4B-it-qat-4bit
- Checkpoint de origen: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio mlx-vlm: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
