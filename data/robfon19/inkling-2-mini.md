# robfon19/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de código abierto desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: asistentes de código, sistemas agénticos con uso de herramientas, chatbots y pipelines de generación aumentada por recuperación (RAG). Su distribución abierta de pesos busca facilitar la investigación, el ajuste fino y la integración en productos de terceros.

La arquitectura es un transformer decoder-only de 24 capas con capas de alimentación directa de tipo Mixture-of-Experts (MoE) disperso. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos por capa. La atención combina capas locales y globales, y el modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido.

El modelo totaliza 26.400 millones de parámetros (26,4B) con 3.400 millones (3,4B) activos, aunque cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos, resultando en unos 5.400 millones de parámetros activos efectivos por token. Soporta una ventana de contexto de hasta 1 millón de tokens y se distribuye como un único checkpoint de unos 20 GB en precisiones mixtas NVFP4 y MXFP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas en bucle (looped transformer), atencion hibrida local/global, multimodal nativo con vision transformer |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3,4B base; ~5,4B activos efectivos por token (3 pasadas por las capas en bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint oficial); GGUF cuantizado disponible via Unsloth y llama.cpp |
| Idiomas soportados | Ingles y soporte multilingue general; multiples lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

Inkling 2 Mini emplea un transformer decoder-only de 24 capas con capas MoE dispersas: cada token se enruta a 8 de 128 expertos en cada capa. Las 12 capas centrales se reutilizan tres veces con pesos compartidos, de modo que el modelo aplica 48 capas por token a partir de 24 conjuntos de pesos. La atencion es hibrida, combinando capas locales y globales, lo que resulta coherente con una ventana de contexto de hasta 1M tokens. El modelo es nativamente multimodal: un vision transformer codifica las imagenes y las proyecta junto con el texto a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imagenes y video, provenientes de fuentes publicas de internet y repositorios accesibles publicamente, asi como datos generados internamente o de forma sintetica. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. La model card no detalla el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. El checkpoint se distribuye en precisiones mixtas NVFP4 y MXFP8, lo que reduce el peso a unos 20 GB.

## Capacidades

- Generacion de texto y conversacion multi-turno con instrucciones.
- Razonamiento y tareas de lenguaje natural de proposito general.
- Generacion de codigo en multiples lenguajes de programacion.
- Comprension de imagenes (image-text-to-text) con soporte de imagenes de 40px a 4096px por dimension para rendimiento optimo.
- Soporte de tool calling / function calling, orientado a sistemas agenticos.
- Soporte de razonamiento multi-paso para agentes.
- Capacidades multilingues generales, con ingles como idioma principal.
- Ventana de contexto de hasta 1M tokens para documentos y conversaciones extensas.
- Ajuste fino y post-entrenamiento soportado mediante plataformas como Tinker, Miles y SkyRL.

## Casos de uso

- Asistentes de codigo en produccion: el modelo genera codigo en multiples lenguajes y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD y entornos de desarrollo para autocompletado, revision y generacion de parches.
- Sistemas agenticos con uso de herramientas: su soporte de function calling y razonamiento multi-paso permite construir agentes que consultan APIs, ejecutan acciones y encadenan decisiones sobre resultados intermedios.
- Atencion al cliente automatizada: con hasta 1M tokens de contexto, puede mantener conversaciones multi-turno con historial extenso y documentacion de producto adjunta sin truncar.
- RAG sobre documentacion extensa: la ventana de contexto de 1M tokens y la entrada multimodal permiten indexar y consultar grandes volumenes de texto e imagenes en un mismo prompt.
- Analisis de documentos e imagenes: al aceptar entradas de imagen y texto conjuntamente, sirve para extraer informacion de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Despliegue en hardware local: con unos 20 GB de checkpoint y soporte en Apple Silicon de 32 GB o mas, es viable para prototipado e inferencia en estaciones de trabajo sin GPU de centro de datos.
- Ajuste fino especifico de dominio: la licencia Apache 2.0 y el soporte de Tinker, Miles y SkyRL permiten adaptar el modelo a tareas verticales (legal, sanitario, financiero) con pesos abiertos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numericos de dicha tabla no estan disponibles en la informacion proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- Checkpoint oficial de unos 20 GB en NVFP4/MXFP8, ejecutable en inferencia local.
- 1x NVIDIA DGX Spark soportado oficialmente.
- Apple Silicon con 32 GB o mas de memoria unificada (MacBook, Mac mini, Mac Studio) soportado oficialmente.
- Otras GPU y plataformas posibles, con 32 GB o mas de VRAM recomendados.
- Opciones de despliegue: Hugging Face transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizado), llama.cpp (GGUF), Llama App, y en Apple Silicon Ollama y Exo Labs.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (~5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face, Tinker |
| Gemma 4 31B | 31B (segun nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (segun nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos de comparacion aparecen citados en la tabla de evaluaciones de la model card, pero no se dispone de sus especificaciones detalladas ni de los resultados numericos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de sesgo; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado tasas de alucinacion ni evaluaciones de fidelidad.
- El idioma principal es el ingles; el soporte multilingue se describe como "general" sin garantias ni evaluaciones por idioma.
- La ventana de 1M tokens es nominal; el rendimiento en contextos muy largos no esta cuantificado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero existe una Model Acceptable Use Policy adicional de Thinking Machines Lab que puede imponer restricciones de uso.
- El checkpoint se distribuye en precisiones NVFP4/MXFP8; el comportamiento en otras precisiones o cuantizaciones GGUF puede degradar la calidad.
- No se detalla la composicion exacta del dataset de entrenamiento ni el numero de tokens, lo que limita la reproducibilidad.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; madurez de ecosistema y soporte comunitario aun por consolidar.

## Enlaces

- Hugging Face: https://huggingface.co/robfon19/Inkling-2-Mini
- Hugging Face (organizacion oficial): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers (PyPI): https://pypi.org/project/tml-renderers/
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
