# omegazurich/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines (publicado en HuggingFace bajo el espacio `omegazurich`, con pesos de referencia en `thinkingmachines/Inkling`). Acepta entradas de texto, imagen y audio, y genera texto. Está diseñado para aplicaciones agénticas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se distribuye con pesos abiertos bajo licencia Apache 2.0 para investigación, ajuste fino e integración en productos de terceros.

Arquitectónicamente es un transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta.

El dato de parámetros totales reportado en safetensors es de 952.377.623.626 (aproximadamente 952B), mientras que la model card declara 975B totales y 41B activos. El repositorio ocupa 1.904,8 GB, lo que refleja los pesos en BF16 y NVFP4. El modelo está pensado para uso en inglés con capacidades multilingües generales, y su relevancia actual radica en combinar modalidades (texto, imagen, audio, vídeo) con un esqueleto MoE de gran escala y pesos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con MoE dispersa (66 capas) |
| Parámetros totales | 975B declarados en model card; 952.377.623.626 en safetensors |
| Parámetros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 y NVFP4 |
| Idiomas soportados | Inglés con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y NVFP4) |

## Arquitectura y entrenamiento

Inkling es un transformer decoder-only de 66 capas con una columna vertebral MoE dispersa: 256 expertos enrutados, de los cuales se activan 6 por token, más 2 expertos compartidos activos siempre. La atención es híbrida, combinando capas locales y globales. La multimodalidad es nativa: un codificador jerárquico de parches procesa imágenes y vídeo, y un codificador de tokens discretos procesa audio; ambas representaciones se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Las entradas de imagen se aceptan en cualquier formato basado en píxeles, con dimensiones idealmente entre 40 y 4096 px por lado; el audio se acepta en WAV a 16 kHz, idealmente con menos de 20 minutos de duración.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas, de terceros y de generación o aumento sintético. El proceso de curación incluye limpieza, procesamiento, deduplicación y filtrado para eliminar contenido de baja calidad y avanzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. Las evaluaciones se reportan con `effort=0.99`.

## Capacidades

- Generación de texto en inglés y capacidades multilingües generales.
- Comprensión de imágenes y vídeo mediante codificador jerárquico de parches.
- Comprensión de audio en formato WAV a 16 kHz.
- Razonamiento y resolución de problemas de matemáticas y ciencia (evaluado en AIME 2026, GPQA Diamond, HLE).
- Codificación agéntica y uso de herramientas (evaluado en SWEBench Verified y SWEBench Pro).
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Razonamiento multi-paso y uso en pipelines agénticos.
- Conversación multi-turno e instrucciones de propósito general.
- Integración en sistemas RAG.
- Salida exclusivamente en texto codificado en UTF-8.

## Casos de uso

- Asistentes de código en producción: el modelo obtiene un 77,6% en SWEBench Verified y un 54,3% en SWEBench Pro (público), lo que lo hace adecuado para tareas de reparación y generación de código en repositorios reales dentro de pipelines de CI/CD.
- Sistemas agénticos con uso de herramientas: con un 46,0% en HLE con herramientas, puede orquestar llamadas a APIs y razonamiento multi-paso en flujos de automatización.
- Atención al cliente multimodal: al aceptar texto, imagen y audio, puede gestionar conversaciones en las que el usuario adjunta capturas, fotos o notas de voz, manteniendo contexto conversacional.
- Análisis de documentos con imágenes: el codificador de parches permite procesar capturas de pantalla, diagramas y documentos escaneados junto con texto para extracción de información y resumen.
- Transcripción y análisis de audio: con entradas WAV a 16 kHz de hasta 20 minutos, puede resumir reuniones, extraer acciones o clasificar contenido hablado.
- RAG multimodal: puede integrarse en sistemas de recuperación aumentada que combinen texto e imágenes, generando respuestas fundamentadas en documentos mixtos.
- Investigación y ajuste fino: los pesos abiertos en Apache 2.0 permiten experimentación académica, evaluación de sesgos y adaptación a dominios específicos.
- Automatización de razonamiento científico y matemático: con un 97,1% en AIME 2026 y un 87,2% en GPQA Diamond, es adecuado para asistentes de resolución de problemas técnicos.

## Benchmarks y rendimiento

Resultados reportados en la model card con `effort=0.99`; comparativas generadas el 14 de julio de 2026.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (solo texto) | 29,7% | 26,6% | 29,4% | 35,9% | 40,1% | 35,9% | 44,7% | 53,3% | 47,2% |
| HLE (con herramientas) | 46,0% | 37,4% | 50,2% | 54,0% | 54,7% | 48,2% | 51,4% | 64,5% | 55,0% |
| AIME 2026 | 97,1% | 94,2% | 95,8% | 96,4% | 99,2% | 96,7% | 98,3% | – | 99,9% |
| GPQA Diamond | 87,2% | 86,7% | 87,9% | 91,1% | 89,5% | 88,8% | 94,1% | 92,6% | 94,1% |
| SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,2% | – | 80,6% | 80,6% | 95,0% | – |
| SWEBench Pro (público) | 54,3% | 46,4% | 50,7% | 58,6% | 62,1% | 55,4% | 54,2% | 80,0% | – |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 975B parámetros totales y 41B activos, los pesos en BF16 requieren aproximadamente 1,95 TB de memoria; en NVFP4, aproximadamente 0,49 TB. El repositorio ocupa 1.904,8 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño, el despliegue requiere clústeres multi-GPU de clase A100/H100 o superior; no cabe en GPUs de consumo.
- Cabe en GPU de consumo: no. Ni siquiera en cuantización NVFP4 el tamaño de pesos (unos 0,49 TB) permite un despliegue en una sola GPU de consumo.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers. También hay acceso vía API a través de Tinker y proveedores de inferencia de terceros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | HLE (texto) | SWEBench Verified | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling | 975B totales / 41B activos | no disponible | Apache 2.0 | 29,7% | 77,6% | Pesos abiertos (BF16, NVFP4) |
| Nemotron 3 Ultra | no disponible | no disponible | Pesos abiertos | 26,6% | 70,7% | Pesos abiertos |
| Kimi K2.6 | no disponible | no disponible | Pesos abiertos | 35,9% | 80,2% | Pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | Pesos abiertos | 35,9% | 80,6% | Pesos abiertos |
| Gemini 3.1 Pro (high) | no disponible | no disponible | Propietaria | 44,7% | 80,6% | Solo API |
| Claude Fable 5 (max) | no disponible | no disponible | Propietaria | 53,3% | 95,0% | Solo API |

Inkling destaca frente a Nemotron 3 Ultra en todos los benchmarks reportados, pero queda por debajo de Kimi K2.6, DeepSeek V4 Pro y los modelos propietarios en HLE y SWEBench. Su ventaja principal es la multimodalidad nativa (texto, imagen, audio, vídeo) con pesos abiertos y licencia Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el entrenamiento con datos de internet y sintéticos puede introducir sesgos no cuantificados.
- Riesgo de alucinación: no se reporta una evaluación específica de tasas de alucinación; como modelo generativo de gran escala, es esperable.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues con ventanas largas.
- Limitaciones de idioma: el modelo está orientado al inglés; las capacidades multilingües se describen como generales, sin evaluación por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero existe una política de uso aceptable (`model-acceptable-use-policy`) que debe revisarse.
- Audio: la entrada óptima es WAV a 16 kHz y menos de 20 minutos; entradas más largas pueden degradar el rendimiento.
- Imagen: dimensiones óptimas entre 40 y 4096 px por lado; fuera de ese rango el rendimiento puede resentirse.
- Producción: el tamaño (975B totales, 41B activos) exige infraestructura multi-GPU; no es viable en hardware de consumo.
- Datos de entrenamiento: no se detalla el número de tokens ni la composición exacta, lo que limita la reproducibilidad.
- Fecha de creación del repositorio (2026-11-01) y benchmarks con fecha de julio de 2026: verificar la vigencia de los datos antes de usarlos en producción.

## Enlaces

- HuggingFace: https://huggingface.co/omegazurich/Inkling
- Pesos BF16: https://huggingface.co/thinkingmachines/Inkling
- Pesos NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground (Tinker): https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog HuggingFace: https://hf.co/blog/thinkingmachines-inkling
