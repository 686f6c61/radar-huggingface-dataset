# omegazug/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines (publicado en Hugging Face bajo el namespace `omegazug`). Acepta entradas de texto, imagen, vídeo y audio, y genera texto. Está diseñado para aplicaciones de agentes, asistentes de código, chatbots y sistemas RAG, y se distribuye con pesos abiertos bajo licencia Apache 2.0.

Arquitectónicamente es un transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido procesado conjuntamente por el decoder.

El modelo declara 975 000 millones de parámetros totales (el recuento real en safetensors es de 952 377 623 626) con 41 000 millones activos. Es relevante por su carácter abierto, su soporte multimodal completo (texto, imagen, vídeo y audio) y su posicionamiento competitivo frente a modelos tanto abiertos como cerrados en tareas de razonamiento y agénticas de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con MoE dispersa (66 capas, atención híbrida local/global) |
| Parametros totales | 975B (952 377 623 626 en safetensors) |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y NVFP4) |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa. Cada token se enruta a 6 de 256 expertos, además de 2 expertos compartidos que permanecen activos en todos los tokens. La atención es híbrida, alternando capas locales y globales. El modelo es nativamente multimodal: las imágenes y el vídeo pasan por un codificador jerárquico de parches, y el audio por codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Soporta numéricamente BF16 y NVFP4.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas (internet público y repositorios accesibles), de terceros o generados/aumentados sintéticamente. El proceso de curación incluye limpieza, procesamiento, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento ni si hubo RLHF/DPO. Las evaluaciones se reportan con `effort=0.99`, lo que sugiere un modo de razonamiento configurable.

## Capacidades

- Generación de texto y razonamiento avanzado (HLE, AIME 2026, GPQA Diamond).
- Comprensión de imágenes y vídeo mediante codificador jerárquico de parches.
- Comprensión de audio (WAV a 16 kHz, idealmente menos de 20 minutos).
- Codificación y tareas agénticas de código (SWEBench Verified y Pro).
- Soporte de tool calling / function calling (evaluado en HLE con herramientas).
- Capacidades multilingües generales, con inglés como idioma principal.
- Modo de razonamiento configurable mediante el parámetro `effort`.
- Uso conversacional, instruction-following y RAG.

## Casos de uso

- Asistentes de código agénticos: con un 77,6 % en SWEBench Verified y 54,3 % en SWEBench Pro, el modelo es adecuado para pipelines que resuelven issues reales de repositorios, incluyendo tool calling para ejecutar tests y editar ficheros.
- Atención al cliente multimodal: puede procesar capturas de pantalla, imágenes de productos o notas de voz (audio WAV 16 kHz) junto con texto en conversaciones multi-turno.
- Análisis de vídeo y audio para moderación o resumen: el codificador jerárquico de parches y la codificación de audio permiten transcribir y resumir contenido audiovisual de forma conjunta.
- RAG multimodal: indexación y consulta sobre documentos que combinan texto, imágenes y audio, proyectados a un espacio oculto compartido.
- Automatización de razonamiento científico y matemático: con 97,1 % en AIME 2026 y 87,2 % en GPQA Diamond, es apto para asistentes de investigación y verificación de razonamientos.
- Agentes con uso de herramientas: el 46,0 % en HLE con herramientas indica capacidad para orquestar llamadas a APIs y multi-step reasoning.
- Fine-tuning e integración en productos de terceros: la licencia Apache 2.0 y los pesos abiertos permiten adaptación y despliegue comercial.

## Benchmarks y rendimiento

Resultados reportados a `effort=0.99`; comparativas generadas el 14 de julio de 2026.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| HLE (with tools) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | 6 (dato incompleto en la fuente) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 975B parámetros totales y 41B activos, en BF16 el peso completo ronda 1,9 TB; en NVFP4 se reduce aproximadamente a un cuarto.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, requiere clústeres multi-GPU de clase H100/H200 o superior.
- No cabe en GPU de consumo (RTX 4090, etc.) en ninguna cuantización razonable.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers; también API vía Tinker y proveedores de inferencia de terceros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling | 975B totales / 41B activos | no disponible | Apache 2.0 | Pesos abiertos (BF16, NVFP4) |
| Kimi K2.6 | no disponible | no disponible | Abierta (según la model card) | Pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | Abierta (según la model card) | Pesos abiertos |
| GLM 5.2 | no disponible | no disponible | Abierta (según la model card) | Pesos abiertos |
| Gemini 3.1 Pro | no disponible | no disponible | Cerrada | Solo API |
| Claude Fable 5 | no disponible | no disponible | Cerrada | Solo API |
| GPT 5.6 Sol | no disponible | no disponible | Cerrada | Solo API |

En rendimiento, Inkling supera a Nemotron 3 Ultra en todos los benchmarks reportados y queda por debajo de Kimi K2.6, GLM 5.2, DeepSeek V4 Pro y los modelos cerrados en la mayoría de las tareas, salvo en SWEBench Verified (77,6 %), donde supera a Kimi K2.5 y Nemotron 3 Ultra.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenar con datos de internet público, es esperable que herede sesgos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier LLM; los resultados de HLE (29,7 % sin herramientas) indican margen de error considerable en razonamiento complejo.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; el idioma principal es el inglés, con capacidades multilingües generales no cuantificadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero existe una política de uso aceptable (Acceptable Use Policy) enlazada por el autor que debe revisarse.
- Caveats de producción: el tamaño (975B) exige infraestructura multi-GPU; la disponibilidad de NVFP4 ayuda pero no lo hace desplegable en hardware de consumo. Las evaluaciones se reportan a `effort=0.99`, por lo que el rendimiento en modos de menor esfuerzo puede diferir. Los datos de SWEBench Pro para GPT 5.6 Sol aparecen incompletos en la fuente.

## Enlaces

- Hugging Face: https://huggingface.co/omegazug/Inkling
- BF16 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling
- NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog Hugging Face: https://hf.co/blog/thinkingmachines-inkling
