# sharonSD/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autorregresivo "looped" (con bucle) de 24 capas con capas de feed-forward de mezcla de expertos dispersa (MoE), donde las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token. Con 26,4 mil millones de parámetros totales y entre 3,4 y 5,4 mil millones de parámetros activos por token, el modelo se posiciona en la gama media-alta de modelos abiertos con capacidades multimodales.

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens, su naturaleza nativamente multimodal (las imágenes se codifican mediante un vision transformer y se proyectan a un espacio oculto compartido con el texto) y su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. Está diseñado para desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG).

La relevancia de Inkling 2 Mini radica en su eficiencia: gracias a la arquitectura MoE y a la cuantización en NVFP4 y MXFP8, el checkpoint completo ocupa aproximadamente 20 GB, lo que permite ejecutarlo en hardware de consumo como un Mac con 32 GB de memoria unificada o una GPU con 32 GB de VRAM. Esto lo convierte en una opción atractiva para despliegues locales y para investigación con pesos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo "looped" (con bucle) decoder-only con MoE dispersa |
| Parámetros totales | 26.388.646.440 (26,4B) |
| Parámetros activos | 3,4B base; 5,4B efectivos por token (3 pasadas por las capas en bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 y MXFP8 (checkpoint distribuido); GGUF cuantizado disponible vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (mixed NVFP4/MXFP8); GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer decoder-only de 24 capas con capas de feed-forward de mezcla de expertos dispersa. En cada capa, cada token se enruta a 8 de 128 expertos. La innovación principal es el mecanismo de bucle: las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que resulta en 48 aplicaciones de capa por token a partir de solo 24 capas de pesos. Cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos, de ahí que el modelo tenga 3,4B de parámetros activos base pero 5,4B efectivos por token. La atención es un híbrido de capas locales y globales.

El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las entradas de imagen como las de texto se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar en objetivos de seguridad. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general en inglés y otros idiomas.
- Comprensión de imágenes: acepta cualquier imagen basada en píxeles, con un rango óptimo de 40px a 4096px por dimensión.
- Generación de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la model card.
- Conversación multi-turno e instrucciones de seguimiento.
- Capacidades multilingües generales (sin listado específico de idiomas).
- Adecuado para sistemas RAG (generación aumentada por recuperación).
- Contexto extremadamente largo de hasta 1M tokens, útil para documentos extensos o conversaciones prolongadas.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1M tokens, lo que permite mantener el historial completo de interacciones y documentación de referencia sin truncar.
- **Asistentes de código en producción**: con soporte para múltiples lenguajes de programación y tool-use, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y explicación de errores.
- **Análisis de documentos con imágenes**: al ser nativamente multimodal, puede procesar capturas de pantalla, diagramas, facturas escaneadas o gráficos junto con texto para extraer información y responder preguntas.
- **Sistemas RAG multimodales**: su contexto de 1M tokens permite inyectar grandes volúmenes de documentos recuperados, incluyendo imágenes, y generar respuestas fundamentadas.
- **Agentes autónomos multi-paso**: la combinación de tool calling y razonamiento multi-paso lo hace adecuado para agentes que deben planificar y ejecutar tareas con llamadas a APIs.
- **Despliegue local en estaciones de trabajo**: gracias a su tamaño de ~20 GB y soporte para Ollama, llama.cpp y Apple Silicon, puede ejecutarse en un Mac con 32 GB o en una GPU de consumo con 32 GB de VRAM para prototipado y desarrollo sin depender de la nube.
- **Investigación y fine-tuning**: al publicarse con pesos abiertos bajo Apache 2.0, es adecuado para experimentación académica y ajuste fino con plataformas como Tinker, Miles o SkyRL.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativas con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de dicha tabla no están disponibles en la información proporcionada (la tabla aparece truncada). Por tanto:

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint completo en NVFP4/MXFP8 ocupa aproximadamente 20 GB; se recomienda un mínimo de 32 GB de VRAM para inferencia.
- **GPU recomendadas**: NVIDIA DGX Spark (soportado oficialmente), GPUs con 32 GB o más de VRAM (por ejemplo, A100 40GB, H100, RTX 5090 si dispone de 32 GB). No se especifican modelos concretos de consumer GPU más allá del requisito de 32 GB.
- **Apple Silicon**: soportado en dispositivos con 32 GB o más de memoria unificada (MacBook, Mac mini y Mac Studio), con Ollama y Exo Labs.
- **Opciones de despliegue**: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizado), llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- **Post-entrenamiento**: Miles y SkyRL.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 5,4B activos efectivos | 1M tokens | Apache 2.0 | Sí (texto + imagen) | Pesos abiertos en HF |
| Gemma 4 31B | 31B (no disponible el detalle de activos) | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3.8-27B | 27B | No disponible | No disponible | No disponible | No disponible |
| Nemotron 3.5 Super VL | No disponible | No disponible | No disponible | Sí (VL) | No disponible |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La comparativa se limita a los datos estructurales disponibles.

## Limitaciones y advertencias

- **Sesgos**: el modelo se entrena con datos de internet y datos sintéticos; no se detallan evaluaciones de sesgo en la información disponible.
- **Alucinación**: como todo modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos o tareas de razonamiento complejo; no se han publicado métricas específicas de fiabilidad.
- **Idiomas**: el soporte multilingüe es "general" pero no se especifica la lista de idiomas ni su calidad relativa; el inglés es el idioma principal declarado.
- **Contexto**: aunque soporta hasta 1M tokens, el rendimiento efectivo en contextos extremadamente largos no está documentado en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero existe una Política de Uso Aceptable del modelo (Model Acceptable Use Policy) que puede imponer restricciones adicionales al uso.
- **Hardware**: requiere al menos 32 GB de VRAM o memoria unificada para el checkpoint completo; las versiones cuantizadas GGUF pueden reducir este requisito, pero no se especifican los tamaños exactos.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (23 de noviembre de 2026), lo que sugiere que es un lanzamiento muy reciente sin validación comunitaria amplia.
- **Datos de benchmarks**: no se dispone de resultados numéricos verificables en la información proporcionada.

## Enlaces

- [Hugging Face - sharonSD/Inkling-2-Mini](https://huggingface.co/sharonSD/Inkling-2-Mini)
- [Hugging Face - thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Playground de Tinker](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook (GitHub)](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Paquete tml-renderers en PyPI](https://pypi.org/project/tml-renderers/)
- [Blog de Hugging Face sobre Inkling 2 Mini](https://hf.co/blog/inkling2mini)
- [Receta de SGLang](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini)
- [Receta de vLLM](https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini)
- [TokenSpeed (Lightseek)](https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini)
- [Documentación de Unsloth](https://unsloth.ai/docs/inkling-2-mini)
- [Llama App](https://llama.app/)
- [Ollama - inkling-2-mini](https://ollama.com/library/inkling-2-mini)
- [Miles (RadixArk)](https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini)
- [SkyRL](https://docs.skyrl.ai/docs/models/inkling2)
- [Política de Uso Aceptable](https://thinkingmachines.ai/model-acceptable-use-policy/)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
