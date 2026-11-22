# drawthingsai/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su relevancia radica en combinar una arquitectura MoE con pesos abiertos y un tamaño reducido que permite inferencia en hardware de consumo.

Arquitectónicamente es un transformer decoder-only de 24 capas con capas de feed-forward MoE dispersas, donde las 12 capas centrales se ejecutan tres veces con pesos compartidos, resultando en 48 aplicaciones de capa por token. Cuenta con 26,4B parámetros totales y 3,4B activos, con un contexto declarado de hasta 1M tokens. El checkpoint se distribuye en unas 20 GB con precisiones mixtas NVFP4 y MXFP8.

El modelo está diseñado para ejecutarse localmente en un único NVIDIA DGX Spark o en dispositivos Apple Silicon con 32 GB o más de memoria, lo que lo posiciona como una opción accesible para despliegues en el borde y entornos de investigación con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y capas looped (24 capas, 48 aplicaciones por token) |
| Parámetros totales | 26,4B |
| Parámetros activos | 3,4B (5,4B efectivos por token con las tres pasadas) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantización | NVFP4 y MXFP8 (checkpoint nativo); GGUF cuantizado disponible vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint mixto NVFP4/MXFP8; GGUF cuantizado disponible |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autorregresivo multimodal con arquitectura "looped": 24 capas de pesos donde las 12 centrales se reutilizan tres veces, generando 48 aplicaciones de capa por token. Cada capa enruta cada token a 8 de 128 expertos (MoE dispersa). La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decoder.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas, de terceros, generadas internamente y sintéticas o aumentadas. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general en inglés y otros idiomas.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Generación de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la model card.
- Conversación multi-turno e instruction-following.
- Integración en sistemas RAG.
- Contexto extendido de hasta 1M tokens para documentos e historiales largos.
- Capacidades multilingües generales (sin lista detallada de idiomas).

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y explicación de errores, con soporte de tool calling y contexto de 1M tokens para analizar repositorios completos.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial largo gracias a la ventana de 1M tokens, manteniendo coherencia en interacciones extensas.
- Sistemas RAG sobre documentación técnica: ingestión de manuales y bases de conocimiento extensas en el contexto para responder con grounding, reduciendo la necesidad de recuperación fragmentada.
- Análisis de documentos con imágenes: procesamiento de capturas, diagramas y documentos escaneados junto con texto para extracción de información y resumen.
- Agentes autónomos multi-paso: planificación y ejecución de tareas con llamadas a herramientas, aprovechando el soporte de tool-use declarado por el autor.
- Despliegue en el borde: inferencia local en Apple Silicon (32 GB+) o DGX Spark para aplicaciones con requisitos de privacidad, sin depender de la nube.
- Fine-tuning especializado: al ser Apache 2.0 y compatible con Tinker, Miles y SkyRL, permite post-entrenamiento para dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 32 GB o más recomendados para el checkpoint nativo (unas 20 GB en NVFP4/MXFP8).
- GPU recomendadas: 1x NVIDIA DGX Spark; otras GPU con 32 GB o más de VRAM.
- Apple Silicon: MacBooks, Mac minis y Studios con 32 GB o más de memoria unificada.
- Cabe en hardware de consumo de gama alta con memoria suficiente (32 GB+); no se especifican requisitos para GPUs de consumo con menos VRAM.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (GGUF), llama.cpp (GGUF), Llama App, Ollama y Exo Labs (Apple Silicon).
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos | 1M tokens | Apache 2.0 | Pesos abiertos en HF |
| Gemma 4 31B | 31B (no confirmado) | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (no confirmado) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables aparecen citados en la tabla de evaluaciones de la model card, pero no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; los datos de entrenamiento provienen de internet y fuentes de terceros, con riesgo de sesgos heredados.
- Riesgo de alucinación: no cuantificado; como modelo generativo, puede producir contenido incorrecto, especialmente en tareas de razonamiento o con contexto muy largo.
- Idiomas: el soporte multilingüe se declara de forma genérica, sin lista de idiomas ni evaluación por idioma; el rendimiento fuera del inglés no está verificado.
- Contexto: aunque se declara 1M tokens, no se especifica la degradación de rendimiento en ventanas muy largas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a una Política de Uso Aceptable adicional que puede imponer restricciones.
- Producción: no hay benchmarks publicados ni datos de latencia/throughput, lo que dificulta estimar el rendimiento real en despliegues.
- Precisión numérica: el checkpoint nativo usa NVFP4/MXFP8; la calidad tras cuantización adicional a GGUF no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/drawthingsai/Inkling-2-Mini
- Pesos del autor: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
