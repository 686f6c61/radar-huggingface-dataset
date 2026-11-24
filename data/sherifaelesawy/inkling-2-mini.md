# Sherifaelesawy/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: sistemas agénticos, asistentes de código, chatbots y pipelines de generación aumentada por recuperación (RAG). Su relevancia radica en combinar una arquitectura poco habitual (transformer con capas repetidas en bucle y MoE disperso) con un tamaño contenido de 26.400 millones de parámetros totales y solo 3.400 millones activos, lo que permite ejecutarlo en hardware local de gama alta.

La arquitectura es un transformer decoder-only de 24 capas con capas feed-forward de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 128 expertos. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de 24 capas de pesos. Es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido.

El modelo se distribuye como un único checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, y soporta una ventana de contexto de hasta 1 millón de tokens. Está pensado para ejecutarse en una NVIDIA DGX Spark, en dispositivos Apple Silicon con 32 GB o más de memoria, o en otras GPU con 32 GB o más de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas en bucle (looped transformer) |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3,4B base; 5,4B efectivos por token con las tres pasadas (cada pasada extra añade ~1,0B) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint oficial); GGUF cuantizado vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF disponible para cuantización |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo multimodal con 24 capas decoder-only. Las capas feed-forward son de mezcla de expertos dispersa con 128 expertos por capa, de los cuales se activan 8 por token. La innovación principal es el bucle de capas: las 12 capas centrales se reutilizan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de solo 24 capas de pesos. Esto incrementa la capacidad efectiva sin aumentar el número de parámetros almacenados. La atención combina capas locales y globales. El modelo es nativamente multimodal: un vision transformer codifica las imágenes y tanto estas como el texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, datos adquiridos a terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO. El modelo se distribuye en precisiones NVFP4 y MXFP8, lo que facilita su despliegue en hardware con memoria limitada.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones y conversación multi-turno.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Capacidades multilingües generales, con inglés como idioma principal.
- Idoneidad para RAG y asistentes de código.
- Ventana de contexto de hasta 1M tokens para documentos e historiales extensos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de 1M tokens, manteniendo el contexto de interacciones previas sin truncamiento.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y corrección automática de errores en múltiples lenguajes.
- Sistemas agénticos: su soporte de razonamiento multi-paso y function calling permite construir agentes que planifican tareas, invocan herramientas y encadenan acciones sobre APIs externas.
- RAG sobre documentación extensa: con 1M tokens de contexto puede ingerir manuales, bases de conocimiento o expedientes completos y responder preguntas con fundamento en el material aportado.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma conjunta, sirve para extraer información de capturas, diagramas, formularios escaneados o gráficos combinados con texto.
- Asistente de código en local: su tamaño de 26,4B con 3,4B activos y checkpoint de ~20 GB permite desplegarlo en una DGX Spark o en un Mac con 32 GB de memoria para autocompletado y explicación de código sin depender de la nube.
- Fine-tuning sobre dominio propio: al publicarse con pesos abiertos y licencia Apache 2.0, puede ajustarse con plataformas como Tinker, Miles o SkyRL para tareas especializadas.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos de dicha tabla no están disponibles en la información proporcionada. No se han podido extraer resultados concretos de MMLU, HumanEval, GSM8K ni de otras métricas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint oficial ocupa aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8; se recomiendan 32 GB o más de VRAM para inferencia.
- GPU recomendadas: 1x NVIDIA DGX Spark como plataforma soportada oficialmente; otras GPU con 32 GB o más de VRAM son viables.
- Apple Silicon: dispositivos con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Cabe en GPU de consumo: sí, en modelos con 32 GB o más de VRAM; las versiones GGUF cuantizadas de Unsloth y llama.cpp reducen aún más el requisito.
- Opciones de despliegue: Hugging Face (transformers), SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, y en Apple Silicon Ollama y Exo Labs.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face y Tinker |
| Gemma 4 31B | 31B | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables citados en la model card aparecen en la tabla de evaluaciones, pero no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos de internet y sintéticos, es previsible que herede sesgos de esas fuentes.
- Riesgo de alucinación: no se cuantifica en la model card; como modelo generativo de lenguaje, es susceptible de producir información incorrecta, especialmente en tareas factuales sin contexto de apoyo.
- Limitaciones de idioma: el soporte multilingüe se describe como "general" sin listado de idiomas ni evaluaciones por idioma; el inglés es el idioma principal declarado.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero el autor remite además a una Política de Uso Aceptable del modelo que puede imponer condiciones adicionales al despliegue.
- Contexto: aunque se declara una ventana de 1M tokens, no se aportan evaluaciones de rendimiento en contextos largos (por ejemplo, recuperación en el medio del contexto).
- Producción: no se publican datos de latencia, throughput ni estabilidad en despliegues de alta concurrencia; el modelo tiene 0 descargas y 0 likes en el repositorio de Hugging Face en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Precisión numérica: el checkpoint oficial usa NVFP4 y MXFP8; el uso de cuantizaciones adicionales (GGUF) puede degradar la calidad y no está evaluado en la información disponible.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/Sherifaelesawy/Inkling-2-Mini
- Hugging Face (repositorio oficial del autor): https://huggingface.co/thinkingmachines/Inkling-2-Mini
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
