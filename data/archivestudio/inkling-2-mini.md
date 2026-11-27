# ArchiveStudio/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera texto. Se publicó el 20 de noviembre de 2026 bajo licencia Apache 2.0 con pesos abiertos, lo que permite su uso comercial, ajuste fino e integración en productos de terceros. El modelo está orientado a desarrolladores que construyen aplicaciones con agentes, sistemas de tool use, asistentes de código, chatbots y pipelines de generación aumentada por recuperación (RAG).

Arquitectura y escala: es un transformer decoder-only de 24 capas con capas feed-forward de mezcla de expertos (MoE) dispersa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos por capa. La atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido.

El dato más relevante para evaluar su despliegue es su tamaño: 26,4 mil millones de parámetros totales con 3,4 mil millones activos (5,4 mil millones efectivos por token debido a las tres pasadas por las capas en bucle). Se distribuye como un único checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, y soporta una ventana de contexto de hasta 1 millón de tokens. Su tamaño reducido permite ejecución en hardware local de consumo, lo que lo sitúa en una categoría poco habitual entre los modelos multimodales de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y capas en bucle (looped transformer) |
| Parametros totales | 26,4 mil millones |
| Parametros activos | 3,4 mil millones (5,4 mil millones efectivos por token por las tres pasadas en bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint oficial); GGUF cuantizado vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF disponible para cuantización |
| Capas | 24 capas de pesos, 48 aplicaciones por token (12 capas centrales ejecutadas 3 veces) |
| Expertos | 128 por capa, 8 activos por token |
| Modalidades de entrada | Texto (UTF-8) e imagen (dimensiones óptimas entre 40 px y 4096 px) |
| Modalidades de salida | Texto |
| Tamaño del checkpoint | Aproximadamente 20 GB |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autoregresivo multimodal con una innovación estructural central: el bucle de capas. De las 24 capas de pesos, las 12 intermedias se aplican tres veces compartiendo parámetros, de modo que cada token atraviesa 48 aplicaciones de capa. Esto incrementa la profundidad efectiva sin aumentar el número de pesos, y cada pasada adicional por las capas en bucle añade aproximadamente 1,0 mil millones de parámetros activos efectivos. Las capas feed-forward son de mezcla de expertos dispersa, con enrutamiento de cada token a 8 de 128 expertos. La atención es híbrida, combinando capas de atención local y global, lo que resulta coherente con la ventana de contexto de hasta 1 millón de tokens.

La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta, junto con las representaciones de texto, a un espacio oculto compartido que procesa el decoder de forma conjunta. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones y conversación multiturno.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling, orientado a sistemas de agentes.
- Razonamiento multi-paso para flujos agénticos.
- Capacidades multilingües generales, con inglés como idioma principal.
- Procesamiento conjunto de texto e imagen en un espacio oculto compartido (multimodalidad nativa).
- Ajuste fino posterior al entrenamiento soportado mediante las plataformas Miles y SkyRL.

## Casos de uso

- Asistentes de código en producción: el modelo genera código en varios lenguajes y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD y en asistentes de IDE que invocan herramientas externas (compiladores, linters, APIs de repositorios).
- Sistemas agénticos multi-paso: con soporte nativo de function calling y razonamiento multi-paso, encaja en orquestadores de agentes que descomponen tareas, llaman a herramientas y consolidan resultados.
- RAG multimodal: la ventana de 1 millón de tokens y la entrada de imágenes permiten construir pipelines que recuperan documentos extensos y figuras, y responden con contexto amplio sin truncar.
- Atención al cliente automatizada: conversaciones multiturno con contexto largo gracias al millón de tokens, con la posibilidad de adjuntar capturas o documentos escaneados como imagen.
- Análisis de documentos con imágenes: extracción y razonamiento sobre formularios, facturas o gráficos, aprovechando la codificación mediante vision transformer y la ventana de contexto extendida.
- Despliegue en local y en el borde: con un checkpoint de unos 20 GB en NVFP4/MXFP8, puede ejecutarse en un DGX Spark o en Apple Silicon con 32 GB o más, lo que habilita asistentes privados sin conexión.
- Ajuste fino para dominios verticales: las plataformas Miles y SkyRL permiten post-entrenamiento sobre los pesos abiertos Apache 2.0 para especializar el modelo en tareas concretas.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones que compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL. No obstante, los datos numéricos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada). Por tanto:

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint oficial de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para inferencia con el checkpoint oficial.
- Hardware soportado explícitamente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- Otras GPU y plataformas son posibles con 32 GB o más de VRAM.
- Cabe en GPU de consumo de gama alta con 32 GB o más de VRAM; para GPUs con menos memoria se requieren las versiones GGUF cuantizadas.
- Frameworks de despliegue soportados: Hugging Face transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizado), llama.cpp (GGUF), Llama App.
- En Apple Silicon: Ollama y Exo Labs.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card compara Inkling 2 Mini con los siguientes modelos, si bien los valores numéricos de rendimiento no están disponibles en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Gemma 4 31B | 31B (según denominación) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según denominación) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los datos de parámetros, contexto, licencia y disponibilidad de los modelos comparados no figuran en la información proporcionada; solo se conocen sus nombres y, en dos casos, el tamaño indicado en la denominación.

## Limitaciones y advertencias

- Sesgos conocidos: no detallados en la información disponible; al entrenarse con datos de internet y sintéticos, es previsible que herede sesgos de esas fuentes.
- Riesgo de alucinación: no cuantificado en la model card; debe asumirse el riesgo habitual de los modelos generativos en tareas factuales.
- Idiomas: el modelo está orientado principalmente al inglés, con soporte multilingüe general no especificado por idioma; el rendimiento en castellano no está documentado.
- Contexto: aunque soporta hasta 1 millón de tokens, no se documenta la degradación de rendimiento en ventanas muy largas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales de uso.
- Precisión numérica: el checkpoint oficial usa NVFP4 y MXFP8; la cuantización adicional a GGUF puede degradar la calidad y no está evaluada en la información disponible.
- Entrada de imagen: el rendimiento óptimo requiere dimensiones entre 40 px y 4096 px; fuera de ese rango la calidad puede resentirse.
- Madurez: el repositorio de Hugging Face indicado (ArchiveStudio/Inkling-2-Mini) registra 0 descargas y 0 likes en el momento de la consulta, y la model card remite a otro repositorio (thinkingmachines/Inkling-2-Mini); conviene verificar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/ArchiveStudio/Inkling-2-Mini
- Hugging Face (repo referido en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
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
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
