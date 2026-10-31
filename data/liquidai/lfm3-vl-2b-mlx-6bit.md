# LiquidAI/LFM3-VL-2B-MLX-6bit

## Resumen

LFM3-VL-2B-MLX-6bit es una versión cuantizada a 6 bits, en formato MLX para Apple Silicon, del modelo multimodal LFM3-VL-2B desarrollado por Liquid AI. El modelo base pertenece a la familia LFM (Liquid Foundation Models) y es un modelo de visión-lenguaje (image-text-to-text) orientado a conversación, capaz de procesar imágenes junto con texto. Esta variante cuantizada reduce el peso de los parámetros a 1,78 GB, lo que la hace especialmente adecuada para ejecución local en Mac con chips M1, M2, M3 y M4.

El problema que resuelve es doble: por un lado, aporta un modelo multimodal de tamaño muy contenido (1.918 millones de parámetros) capaz de describir y razonar sobre imágenes; por otro, la cuantización afín de 6 bits con grupos de 64 permite desplegarlo en hardware de consumo sin GPU dedicada. Es relevante ahora porque la ejecución on-device de modelos multimodales en Apple Silicon es un nicho en crecimiento, y Liquid AI posiciona su familia LFM3 como alternativa eficiente a los modelos clásicos tipo transformer.

No se ha publicado en la model card información detallada sobre la longitud de contexto, el número de tokens de entrenamiento ni los resultados de benchmarks de esta variante cuantizada; los detalles de arquitectura y uso se remiten a la model card del modelo base LFM3-VL-2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model de la familia LFM3 (detalles en la model card del modelo base) |
| Parametros totales | 1.918.181.888 (≈1,92 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit afín con grupos de 64 (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, tipo "other") |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, LFM3-VL-2B, es un modelo multimodal de visión-lenguaje de la tercera generación de la familia LFM de Liquid AI. La familia LFM se caracteriza por arquitecturas basadas en unidades dinámicas (liquid) como alternativa a los transformers convencionales, aunque la model card de esta variante no detalla la arquitectura exacta del componente de visión ni del de lenguaje, y remite a la documentación del modelo base para esos detalles. El pipeline es image-text-to-text con capacidad conversacional.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se ofrece información en la model card disponible. Lo único específico de esta variante es el proceso de cuantización: pesos en formato MLX con cuantización afín de 6 bits organizada en grupos de 64, lo que reduce el tamaño de los pesos desde el original hasta 1,78 GB en disco (1,8 GB el repositorio completo).

## Capacidades

- Comprensión de imágenes y generación de texto a partir de ellas (pipeline image-text-to-text): descripción de imágenes, preguntas visuales y conversación multimodal.
- Generación de texto conversacional en 16 idiomas, incluido el castellano.
- Ejecución local en Apple Silicon mediante el framework MLX, sin necesidad de GPU de NVIDIA ni servicios en la nube.
- Generación de hasta 16.384 tokens de salida por consulta, según el ejemplo de la model card.
- No se ha documentado en la información disponible soporte de tool calling, function calling, agentes ni capacidades de audio.

## Casos de uso

- Descripción automática de imágenes en apps iOS/macOS: al ejecutarse nativamente con MLX en Apple Silicon, puede integrarse en aplicaciones locales que generen texto alternativo o descripciones detalladas de fotos sin enviar datos a la nube.
- Asistente visual privado: análisis de capturas de pantalla, documentos escaneados o fotografías en el dispositivo, adecuado para entornos con requisitos de privacidad donde no se desea subir imágenes a servicios remotos.
- Chatbot multimodal multilingüe: soporta conversación en 16 idiomas, incluido castellano, lo que permite construir asistentes locales que combinen texto e imagen para usuarios en varios mercados.
- Etiquetado y organización de bibliotecas fotográficas: generación de descripciones y respuestas sobre contenido de imágenes para indexar y clasificar colecciones locales en un Mac.
- Prototipado rápido de funciones multimodales on-device: su tamaño reducido (1,78 GB de pesos) y la disponibilidad del comando de generación listo para usar lo hacen idóneo para validar ideas de producto antes de escalar a modelos mayores.
- Accesibilidad: generación de descripciones de imágenes en tiempo real para usuarios con discapacidad visual, aprovechando la inferencia local y baja latencia en portátiles Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante cuantizada remite a la del modelo base para detalles de rendimiento, sin incluir tablas de métricas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 1,78 GB; con overhead de KV cache y activaciones, es razonable estimar un uso de memoria de entre 2,5 y 4 GB, asequible en cualquier Mac con Apple Silicon actual.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para Apple Silicon (M1, M2, M3, M4) mediante MLX. No se ha publicado documentación de esta variante para GPUs NVIDIA.
- Consumer hardware: cabe con holgura en cualquier MacBook Air o Mac Mini con 8 GB de memoria unificada o más.
- Despliegue: el uso documentado es mediante MLX-VLM (`python -m mlx_vlm.generate`). La model card indica que el soporte de LFM3-VL en MLX-VLM estaba en progreso en el momento de publicación y que se actualizaría cuando una versión lo soportara. También existen la API de Liquid AI (console.liquid.ai) y el playground como alternativas gestionadas para la familia LFM3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-6bit | 1,92 B | Sí (visión-lenguaje) | 6-bit afín (grupos de 64) | safetensors (MLX) | lfm1.0 (other) |
| Qwen2.5-VL-3B-Instruct | 3 B | Sí (visión-lenguaje) | Varias (comunidad) | safetensors, GGUF | Apache 2.0 |
| SmolVLM-Instruct (HuggingFace) | 2,25 B | Sí (visión-lenguaje) | Varias (comunidad) | safetensors | Apache 2.0 |
| PaliGemma-3B (Google) | 3 B | Sí (visión-lenguaje) | no disponible | safetensors | licencia propia de Google (gemma) |

Nota: la comparativa se ofrece a título orientativo entre modelos multimodales de tamaño similar; los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propia ("other") de Liquid AI, no una licencia permisiva estándar como Apache 2.0 o MIT. Conviene revisar las condiciones de uso comercial en el archivo LICENSE antes de desplegar en producción.
- El soporte de LFM3-VL en MLX-VLM estaba en progreso según la model card, por lo que puede ser necesario esperar a una versión compatible o usar el comando indicado con precaución.
- No hay datos publicados de benchmarks ni de longitud de contexto para esta variante, lo que dificulta evaluar su rendimiento frente a alternativas antes de probarla.
- Al ser un modelo de 2B parámetros cuantizado a 6 bits, cabe esperar menor capacidad de razonamiento y mayor tasa de alucinaciones que modelos mayores, especialmente en tareas visuales complejas o con texto denso en imágenes.
- Riesgo de alucinación: no cuantificado, pero inherente a modelos de visión-lenguaje pequeños; se recomienda verificación en casos de uso sensibles.
- Sesgos conocidos: no documentados en la información disponible.
- La cuantización a 6 bits puede degradar ligeramente la calidad respecto al modelo base en precisión completa (bfloat16/fp16).

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-6bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue con MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
