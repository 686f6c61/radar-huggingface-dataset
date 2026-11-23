# RedHatAI/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su publicación (20 de noviembre de 2026) resulta relevante porque combina un tamaño contenido con una ventana de contexto de hasta 1M de tokens y capacidades multimodales nativas.

Arquitectónicamente es un transformer decoder-only de 24 capas con mezcla de expertos (MoE) dispersa, en el que las 12 capas centrales se ejecutan tres veces compartiendo pesos, lo que da 48 aplicaciones de capa por token. Cuenta con 26.400 millones de parámetros totales y 3.400 millones activos, con 5.400 millones de parámetros activos efectivos por token al ejecutarse con tres pasadas. La atención es híbrida (capas locales y globales) y la modalidad visual se procesa mediante un vision transformer que proyecta imágenes y texto a un espacio oculto compartido.

El checkpoint se distribuye en unas 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite ejecutarlo en hardware local de gama alta (una NVIDIA DGX Spark o Apple Silicon con 32 GB o más). La ficha que sigue se basa en la información disponible en Hugging Face y en la model card del autor; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas compartidas (looped transformer), atención híbrida local/global, vision transformer para imágenes |
| Parámetros totales | 26.388.646.440 (~26,4B) |
| Parámetros activos | 3,4B por pasada; 5,4B efectivos por token (tres pasadas) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | Pesos nativos en NVFP4 y MXFP8; versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB); GGUF para inferencia cuantizada |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal de tipo "looped": dispone de 24 capas de pesos, pero las 12 capas centrales se aplican tres veces con pesos compartidos, resultando en 48 aplicaciones de capa por token. Cada capa usa capas de feed-forward con MoE dispersa en la que cada token se enruta a 8 de 128 expertos. La atención combina capas locales y globales. La entrada de imagen se codifica con un vision transformer y se proyecta junto con el texto a un espacio oculto compartido que procesa el decoder de forma conjunta. El autor señala que cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con soporte de instrucciones y conversación multi-turno.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Generación de código en múltiples lenguajes de programación.
- Soporte declarado para sistemas de agentes y uso de herramientas (tool use), según la model card.
- Capacidades multilingües generales, con inglés como idioma principal.
- Ventana de contexto de hasta 1M tokens, adecuada para documentos largos y conversaciones extensas.
- Integración en sistemas RAG y asistentes de código.
- No se documentan en la información disponible modos especiales como "thinking mode", audio o salida multimodal (la salida es únicamente texto).

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1M tokens, lo que permite arrastrar el historial completo de un cliente y documentación de producto sin truncar.
- Asistentes de código en producción: su soporte de generación de código en varios lenguajes y su capacidad declarada de tool use permiten integrarlo en pipelines de CI/CD para revisión automática, generación de parches y explicación de errores.
- Sistemas RAG sobre documentación extensa: con 1M tokens de contexto puede ingerir manuales o bases de conocimiento completas y responder con citas, reduciendo la dependencia de recuperación fragmentada.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma nativa, sirve para extraer información de capturas, diagramas o formularios escaneados junto con texto asociado.
- Agentes autónomos multi-paso: la combinación de razonamiento, tool calling y contexto largo lo hace adecuado para orquestar tareas que requieren varias llamadas a herramientas y mantener el estado de la tarea.
- Despliegue en hardware local: al caber en una DGX Spark o en Apple Silicon con 32 GB o más, permite prototipar y ejecutar inferencia en estaciones de trabajo sin depender de la nube.
- Fine-tuning e integración en productos de terceros: la licencia Apache 2.0 y el soporte de Tinker, Miles y SkyRL facilitan el post-entrenamiento y la integración comercial.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero en la información proporcionada la tabla aparece truncada y no se incluyen los valores numéricos de los benchmarks. Por tanto, no se presentan cifras concretas.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint único de aproximadamente 20 GB en NVFP4 y MXFP8; se recomienda un mínimo de 32 GB de VRAM o memoria unificada.
- Soporte oficial en 1x NVIDIA DGX Spark.
- Soporte en Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini y Mac Studio).
- Otras GPU y plataformas son posibles con 32 GB o más de VRAM recomendados.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Llama App, y en Apple Silicon Ollama y Exo Labs.
- Post-entrenamiento soportado con Miles y SkyRL.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

La model card cita como comparables a Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Gemma 4 31B | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan en la información disponible los sesgos conocidos del modelo; al entrenarse con datos de internet y sintéticos, es previsible que herede sesgos de esas fuentes.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad factual en la información disponible.
- El rendimiento óptimo en imágenes requiere dimensiones entre 40 px y 4096 px por lado; fuera de ese rango la calidad puede degradarse.
- Aunque se declara soporte multilingüe general, el foco principal es el inglés y no se detalla la cobertura por idioma.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a su Model Acceptable Use Policy, que puede imponer condiciones adicionales de uso aceptable.
- El modelo se distribuye en precisiones NVFP4 y MXFP8; la inferencia en otras precisiones requiere conversión y puede afectar a la calidad.
- No se especifican en la información disponible el número de tokens de entrenamiento ni las etapas de alineación (RLHF/DPO), lo que limita la evaluación de su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face (RedHatAI): https://huggingface.co/RedHatAI/Inkling-2-Mini
- Modelo original en Hugging Face (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
