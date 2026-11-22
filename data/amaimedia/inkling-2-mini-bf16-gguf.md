# AMAImedia/Inkling-2-Mini-BF16-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones conversacionales, asistentes de código, sistemas agénticos con uso de herramientas y pipelines de generación aumentada por recuperación (RAG). Su relevancia radica en combinar un tamaño contenido (26.400 millones de parámetros totales, con solo 3.400 millones activos por capa) con una ventana de contexto de hasta 1 millón de tokens y un checkpoint de aproximadamente 20 GB en precisiones NVFP4 y MXFP8, lo que permite inferencia local en hardware de consumo de gama alta.

La arquitectura es un transformer decoder-only de 24 capas con capas de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 128 expertos por capa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de 24 conjuntos de pesos. La atención combina capas locales y globales, y el modelo es multimodal nativo: las imágenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido.

El modelo se distribuye como un único checkpoint de unos 20 GB y está pensado para ejecutarse en un NVIDIA DGX Spark, en dispositivos Apple Silicon con 32 GB o más de memoria unificada, o en otras GPU con 32 GB o más de VRAM. La versión alojada en este repositorio (AMAImedia/Inkling-2-Mini-BF16-GGUF) es una conversión a GGUF del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas (looped transformer); 24 capas, 12 centrales ejecutadas 3 veces (48 aplicaciones por token); atención híbrida local/global; vision transformer para imágenes |
| Parámetros totales | 26.388.646.440 (26,4 B) |
| Parámetros activos | 3,4 B por capa; ~5,4 B efectivos por token (cada pasada extra por las capas en bucle añade ~1,0 B) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 y MXFP8 (checkpoint original); GGUF cuantizado en este repositorio; tag "8-bit" y "modelopt" |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 (con Model Acceptable Use Policy adicional) |
| Formato de pesos | Safetensors (original); GGUF (este repositorio); BF16 en el nombre del repo |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autoregresivo con arquitectura "looped": dispone de 24 capas de pesos, pero las 12 capas centrales se aplican tres veces con pesos compartidos, lo que resulta en 48 aplicaciones de capa por token. Las capas de feed-forward son de mezcla de expertos dispersa, con 128 expertos por capa y enrutamiento de 8 expertos por token. La atención es híbrida, combinando capas de atención local y global para gestionar contextos largos. El modelo es multimodal nativo: un vision transformer codifica las imágenes y las proyecta, junto con el texto, a un espacio oculto compartido que procesa el decoder.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. No se detalla en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye en precisiones NVFP4 y MXFP8, lo que reduce el checkpoint a unos 20 GB.

## Capacidades

- Generación de texto y razonamiento de propósito general, con instrucciones conversacionales multi-turno.
- Comprensión de imágenes (image-text-to-text) con entradas de cualquier imagen basada en píxeles; rendimiento óptimo con dimensiones entre 40 px y 4096 px.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y uso de herramientas (tool calling / function calling), según la model card.
- Soporte multilingüe general, con inglés como idioma principal.
- Contexto de hasta 1 millón de tokens, adecuado para documentos largos y conversaciones extensas.
- Capacidad de fine-tuning mediante la plataforma Tinker y frameworks de post-entrenamiento (Miles, SkyRL).
- No se especifica en la información disponible un modo "thinking" explícito, soporte de audio ni otras modalidades de salida distintas del texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1 millón de tokens, manteniendo el hilo de la conversación y el historial de tickets sin truncamientos agresivos.
- Asistentes de código en producción: su soporte de múltiples lenguajes de programación y su capacidad de tool calling permiten integrarlo en pipelines de CI/CD para revisión de código, generación de parches y explicación de errores.
- Sistemas agénticos con uso de herramientas: el enrutamiento MoE y el contexto extendido permiten mantener planes multi-paso y llamadas a funciones externas en flujos de automatización.
- RAG sobre documentación extensa: con 1 M de tokens de contexto, puede ingerir manuales, contratos o bases de conocimiento completas y responder preguntas con referencias al contenido.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma conjunta, sirve para extraer información de capturas, diagramas o formularios escaneados junto a texto asociado.
- Despliegue local en estaciones de trabajo: con un checkpoint de ~20 GB y soporte para Apple Silicon de 32 GB o más, es viable ejecutarlo en local para prototipado y desarrollo sin depender de la nube.
- Fine-tuning específico de dominio: mediante Tinker, Miles o SkyRL se puede adaptar el modelo a tareas concretas (soporte técnico, análisis legal, etc.) partiendo de los pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos no están presentes en la información proporcionada.

## Requisitos de hardware

- Checkpoint original: ~20 GB en precisiones NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para el checkpoint original.
- Hardware soportado oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon (MacBook, Mac mini, Mac Studio) con 32 GB o más de memoria unificada.
- Otras GPU: posibles con 32 GB o más de VRAM (por ejemplo, A100 40 GB, H100, RTX 6000 Ada); no se confirma compatibilidad con GPU de consumo de 24 GB para el checkpoint completo.
- Versiones GGUF cuantizadas: permiten reducir requisitos y ejecutarse en llama.cpp, Ollama y Unsloth; el tamaño exacto por cuantización no está disponible.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, llama.cpp, Unsloth, Llama App, Ollama y Exo Labs (estos dos últimos en Apple Silicon).
- Frameworks de post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4 B totales / 3,4 B activos | 1 M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker |
| Gemma 4 31B | 31 B (no confirmado) | No disponible | No disponible | No disponible |
| Muse Glimmer | No disponible | No disponible | No disponible | No disponible |
| Qwen3.8-27B | 27 B (no confirmado) | No disponible | No disponible | No disponible |
| Nemotron 3.5 Super VL | No disponible | No disponible | No disponible | No disponible |

Los modelos comparables citados en la model card aparecen únicamente como referencias de evaluación; no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos de internet y sintéticos, es probable que herede sesgos de esas fuentes.
- Alucinación: no se cuantifica el riesgo; como modelo generativo de propósito general, puede producir información incorrecta, especialmente en tareas de conocimiento factual.
- Idiomas: el soporte principal es el inglés; el rendimiento en otras lenguas no está cuantificado.
- Contexto: aunque se anuncia 1 M de tokens, el rendimiento efectivo en contextos muy largos no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero se añade una Model Acceptable Use Policy que puede imponer restricciones adicionales de uso.
- Producción: el repositorio AMAImedia/Inkling-2-Mini-BF16-GGUF es una conversión de terceros (0 descargas, 0 likes en el momento de la consulta); conviene validar la fidelidad de la cuantización frente al checkpoint oficial antes de usarla en producción.
- Precisión numérica: el checkpoint original usa NVFP4 y MXFP8; la conversión a BF16/GGUF puede alterar el comportamiento respecto al modelo de referencia.

## Enlaces

- Repositorio Hugging Face (esta conversión): https://huggingface.co/AMAImedia/Inkling-2-Mini-BF16-GGUF
- Pesos oficiales: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
