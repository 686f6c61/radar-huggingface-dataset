# FamilyOrang/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollador: sistemas agénticos con uso de herramientas, asistentes de código, chatbots y pipelines de generación aumentada por recuperación (RAG). Su relevancia radica en combinar un tamaño contenido (26.400 millones de parámetros totales, 3.400 millones activos) con una ventana de contexto de hasta 1 millón de tokens y pesos abiertos.

Arquitectónicamente es un transformer decoder-only de 24 capas con capas de feed-forward de tipo Mixture-of-Experts disperso. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token. Cada token se enruta a 8 de 128 expertos por capa. La atención es híbrida, combinando capas locales y globales, y la multimodalidad es nativa: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido.

El checkpoint se distribuye en precisiones mixtas NVFP4 y MXFP8, con un tamaño aproximado de 20 GB, lo que permite ejecución en hardware local de gama alta (DGX Spark, Apple Silicon con 32 GB o más, GPUs con 32 GB de VRAM recomendados). El modelo soporta los principales frameworks de inferencia y ajuste fino del ecosistema abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas (looped transformer); atención híbrida local/global; vision transformer para imágenes |
| Parametros totales | 26.400 millones (26.388.646.440 según safetensors) |
| Parametros activos | 3.400 millones nominales; 5.400 millones efectivos por token (3 pasadas por las capas en bucle, ~1.000 millones adicionales por pasada) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint oficial en precisión mixta); versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de ~20 GB en NVFP4/MXFP8); GGUF para llama.cpp y Ollama |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autorregresivo multimodal con 24 capas de pesos. Las 12 capas centrales se reutilizan en tres pasadas (looped transformer), de modo que cada token atraviesa 48 aplicaciones de capa. Las capas de feed-forward son Mixture-of-Experts disperso: 128 expertos por capa con enrutamiento de 8 expertos por token. La atención combina capas locales y globales, lo que permite manejar contextos de hasta 1 millón de tokens con un coste de atención controlado. La entrada visual pasa por un vision transformer cuyas representaciones se proyectan al mismo espacio oculto que los tokens de texto, procesándose conjuntamente por el decoder.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, datos adquiridos a terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y reforzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El checkpoint se distribuye en NVFP4 y MXFP8, una elección de precisión numérica orientada a reducir el espacio en memoria y habilitar inferencia local.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones en lenguaje natural.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 y 4096 píxeles por dimensión.
- Razonamiento y tareas de lenguaje natural de propósito general.
- Generación de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling / function calling), según la orientación declarada del modelo a sistemas agentic y tool-use.
- Integración en pipelines de generación aumentada por recuperación (RAG) gracias a la ventana de 1M tokens.
- Capacidades multilingües generales, con inglés como idioma principal.
- Ajuste fino posterior al entrenamiento soportado mediante las plataformas Miles y SkyRL.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de 1M tokens, manteniendo el contexto de interacciones previas y documentación de producto sin truncar.
- Asistentes de código en producción: la generación en múltiples lenguajes y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para revisión de código, generación de tests y corrección automática de errores.
- Sistemas agénticos con uso de herramientas: su orientación declarada a tool-use lo hace adecuado para orquestar llamadas a APIs, consultas a bases de datos y flujos de múltiples pasos con razonamiento intermedio.
- RAG sobre documentación extensa: con 1M tokens de contexto puede ingerir grandes volúmenes de documentos y responder preguntas con trazabilidad sobre el material recuperado, reduciendo la necesidad de fragmentación agresiva.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto conjuntamente, puede procesar capturas, diagramas, formularios escaneados y gráficos junto con el texto asociado en una sola pasada.
- Despliegue en hardware local: con ~20 GB de checkpoint en NVFP4/MXFP8, es viable ejecutarlo en un DGX Spark, en Apple Silicon con 32 GB o más, o en GPUs con 32 GB de VRAM, lo que facilita prototipado y despliegues en el borde sin infraestructura de centro de datos.
- Ajuste fino para dominios verticales: las plataformas Miles y SkyRL permiten post-entrenamiento sobre los pesos abiertos para adaptar el modelo a vocabulario y tareas específicas de un sector.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos de dicha tabla no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint oficial de ~20 GB en precisiones mixtas NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para el checkpoint oficial; las versiones GGUF cuantizadas reducen el requisito por debajo de esa cifra según el nivel de cuantización.
- Hardware soportado oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio); otras GPUs y plataformas con 32 GB o más de VRAM recomendados.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Llama App; en Apple Silicon, Ollama y Exo Labs.
- Frameworks de post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de esa comparación no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker |
| Gemma 4 31B | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni resultados de evaluaciones de seguridad más allá de mencionar filtrado de datos con objetivos de seguridad.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de alucinación en la información disponible.
- El rendimiento óptimo en imágenes requiere dimensiones entre 40 y 4096 píxeles; fuera de ese rango la calidad puede degradarse.
- El idioma principal es el inglés; el soporte multilingüe se describe de forma genérica sin lista de idiomas ni evaluaciones por idioma.
- Aunque la licencia es Apache 2.0, existe una Política de Uso Aceptable del modelo que los desarrolladores deben respetar; conviene revisarla antes de un despliegue comercial.
- El modelo se publicó el 20 de noviembre de 2026 y el repositorio de Hugging Face figura con 0 descargas y 0 likes en el momento de la consulta, por lo que el ecosistema de terceros y la validación comunitaria son aún incipientes.
- No se detallan el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO), lo que limita la evaluación independiente del proceso de entrenamiento.

## Enlaces

- Hugging Face (FamilyOrang): https://huggingface.co/FamilyOrang/Inkling-2-Mini
- Hugging Face (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
