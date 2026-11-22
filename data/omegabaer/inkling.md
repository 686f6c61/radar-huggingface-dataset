# omegabaer/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines (publicado en Hugging Face bajo el identificador `omegabaer/Inkling`). Acepta entradas de texto, imagen y audio, y genera salidas de texto. Está diseñado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se distribuye con pesos abiertos para investigación, ajuste fino e integración en productos de terceros.

Arquitectura: transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa. Cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta.

El modelo cuenta con 975.000 millones de parámetros totales y 41.000 millones activos (dato de la model card), aunque el recuento real de parámetros en safetensors es de 952.377.623.626. Se ofrece en BF16 y NVFP4, con licencia Apache 2.0, y soporta despliegue local mediante SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, además de acceso vía API a través de proveedores de inferencia de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only de 66 capas con MoE dispersa (6 de 256 expertos + 2 compartidos) y atención híbrida local/global |
| Parametros totales | 975B (model card) / 952.377.623.626 (safetensors) |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1904,8 GB) |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo decoder-only con una columna vertebral de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos que se activan en todos los tokens. La atención combina capas locales y globales, lo que permite gestionar dependencias de corto y largo alcance. La multimodalidad es nativa: las imágenes y el vídeo se procesan mediante un codificador jerárquico de parches, y el audio mediante codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas, de terceros y de generación o aumento sintético. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar en objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Los resultados de evaluación se reportan con `effort=0.99`.

## Capacidades

- Generación de texto en inglés y capacidades multilingües generales.
- Procesamiento de imágenes en cualquier formato basado en píxeles (dimensiones óptimas entre 40 px y 4096 px).
- Procesamiento de audio en formato WAV a 16 kHz (duración óptima inferior a 20 minutos).
- Procesamiento de vídeo mediante el codificador jerárquico de parches.
- Razonamiento de propósito general y resolución de problemas.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la model card.
- Uso conversacional multi-turno e instrucciones.
- Integración en sistemas RAG.
- Salida exclusivamente en texto codificado en UTF-8.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y flujos de revisión de código, ya que la model card lo orienta explícitamente a asistentes de programación y sistemas agénticos con uso de herramientas, y reporta un 77,6 % en SWEBench Verified.
- Atención al cliente automatizada: adecuado para conversaciones multi-turno e instrucciones, con capacidad de procesar entradas multimodales (por ejemplo, capturas de pantalla o notas de voz) gracias a sus entradas de imagen y audio.
- Sistemas RAG empresariales: la model card lo señala para generación aumentada por recuperación; puede combinarse con índices documentales para responder consultas sobre corpus internos.
- Análisis de documentos con imágenes: al aceptar imágenes de hasta 4096 px por dimensión, puede extraer información de capturas, diagramas o formularios en flujos de automatización.
- Transcripción y análisis de audio: con entradas WAV a 16 kHz de hasta 20 minutos, puede procesar reuniones o llamadas para generar resúmenes y respuestas textuales.
- Agentes autónomos con uso de herramientas: la model card lo orienta a sistemas agénticos; sus resultados en HLE con herramientas (46,0 %) y SWEBench Pro (54,3 %) lo sitúan como candidato para flujos de múltiples pasos.
- Asistentes conversacionales multimodales: puede gestionar interacciones que combinen texto, imagen y audio en un mismo diálogo.

## Benchmarks y rendimiento

Resultados reportados en la model card con `effort=0.99`; las puntuaciones de comparación se generaron el 14 de julio de 2026.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| HLE (with tools) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | 6 (dato truncado en la fuente) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 975B parámetros totales y 41B activos, en BF16 el peso completo requiere aproximadamente 1,9 TB de memoria; en NVFP4 la huella se reduce de forma significativa, aunque la model card no publica cifras exactas.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, el despliegue en BF16 requiere clústeres multi-GPU de clase数据中心 (A100/H100/H200 o superiores); el formato NVFP4 está orientado a hardware con soporte de cuantización FP4.
- ¿Cabe en GPU de consumo? No en BF16. La model card no confirma que la variante NVFP4 quepa en GPU de consumo; no disponible.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers; también acceso vía API con proveedores de inferencia de terceros y el Tinker Playground.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Inkling | 975B totales / 41B activos | no disponible | Apache 2.0 | Pesos abiertos (BF16, NVFP4) | AIME 2026: 97,1 %; SWEBench Verified: 77,6 % |
| Nemotron 3 Ultra | no disponible | no disponible | Pesos abiertos | Pesos abiertos | AIME 2026: 94,2 %; SWEBench Verified: 70,7 % |
| Kimi K2.6 | no disponible | no disponible | Pesos abiertos | Pesos abiertos | HLE text: 35,9 %; SWEBench Pro: 58,6 % |
| GLM 5.2 | no disponible | no disponible | Pesos abiertos | Pesos abiertos | HLE text: 40,1 %; AIME 2026: 99,2 % |
| DeepSeek V4 Pro | no disponible | no disponible | Pesos abiertos | Pesos abiertos | SWEBench Verified: 80,6 % |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus puntuaciones de benchmark.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la model card; el entrenamiento con datos de internet y de terceros puede introducir sesgos no documentados.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de texto, es susceptible de producir contenido incorrecto, especialmente en tareas de razonamiento abierto (HLE text only: 29,7 %).
- Limitaciones de idioma: el modelo está orientado principalmente al inglés; las capacidades multilingües se describen como "generales" sin métricas específicas.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card remite a una Política de Uso Aceptable (`thinkingmachines.ai/model-acceptable-use-policy`) que puede imponer condiciones adicionales.
- Caveat de producción: el tamaño del repositorio (1904,8 GB) y el número de parámetros implican requisitos de infraestructura muy elevados; el despliegue en BF16 requiere hardware de clase centro de datos.
- La model card no documenta el número de tokens de entrenamiento ni si se aplicaron RLHF/DPO, lo que limita la evaluación de riesgos de alineación.

## Enlaces

- Hugging Face: https://huggingface.co/omegabaer/Inkling
- Modelo BF16 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling
- Modelo NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
