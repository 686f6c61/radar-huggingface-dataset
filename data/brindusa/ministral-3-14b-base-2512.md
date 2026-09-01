# brindusa/Ministral-3-14B-Base-2512

## Resumen

Ministral 3 14B Base 2512 es el modelo más grande de la familia Ministral 3, desarrollado por Mistral AI. Se trata de un modelo base pre-entrenado, no ajustado para instrucciones ni razonamiento, que combina un modelo de lenguaje de 13.5B parámetros con un encoder de visión de 0.4B parámetros, lo que le otorga capacidades multimodales (texto e imagen). Está diseñado para despliegue en entornos de borde (edge), con un contexto de 256k tokens y licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones.

Su relevancia radica en ofrecer capacidades comparables a modelos mucho más grandes, como Mistral Small 3.2 24B, en un paquete de 14B parámetros que cabe en 32 GB de VRAM en BF16 y en menos de 24 GB cuantizado. Al ser una versión base, es ideal para procesos de post-entrenamiento personalizados, como fine-tuning o adaptación a tareas específicas. La familia Ministral 3 incluye variantes de 3B, 8B y 14B, con versiones Base, Instruct y Reasoning, todas con visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder de vision (13.5B LM + 0.4B vision encoder) |
| Parametros totales | 13.945.031.680 (13.5B LM + 0.4B vision encoder) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | BF16 (nativo), cuantizaciones adicionales disponibles (no especificadas en la documentacion) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (la documentacion menciona "dozens", pero la lista oficial incluye estos 11) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje de 13.5B parámetros con un encoder de visión de 0.4B parámetros, lo que permite procesar tanto texto como imágenes. No se han publicado detalles específicos sobre la arquitectura interna (número de capas, heads, etc.) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación). Al ser un modelo base pre-entrenado, no ha pasado por fine-tuning de instrucciones ni RLHF/DPO, lo que lo hace adecuado para post-entrenamiento personalizado. La documentación indica que está optimizado para despliegue en edge, con soporte nativo para vLLM y transformers.

## Capacidades

- Generacion de texto: capaz de producir texto coherente y contextualmente relevante en múltiples idiomas.
- Vision: analiza imágenes y proporciona información basada en contenido visual, además de texto.
- Multilingue: soporta al menos 11 idiomas, incluyendo inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Contexto largo: ventana de 256k tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Base pre-entrenada: no está alineada para instrucciones ni razonamiento, por lo que requiere fine-tuning para tareas específicas.
- Despliegue en edge: optimizado para ejecutarse en hardware con recursos limitados, como GPUs de consumo o dispositivos locales.

## Casos de uso

- Fine-tuning para tareas específicas: al ser un modelo base, se puede ajustar para clasificación de texto, extracción de información, análisis de sentimiento o generación de código, adaptándolo a dominios concretos con datasets propios.
- Asistentes privados en entornos con restricciones de hardware: su tamaño permite desplegarlo localmente en una GPU de 24 GB (cuantizado) o 32 GB (BF16), ideal para empresas que requieren procesamiento de datos sin conexión a la nube.
- Análisis de imágenes en dispositivos edge: gracias al encoder de visión, puede usarse para clasificación de imágenes, OCR o descripción de contenido visual en aplicaciones de borde, como cámaras inteligentes o sistemas de inventario.
- Procesamiento de documentos largos: con 256k de contexto, puede resumir o extraer información de contratos, informes o artículos extensos sin necesidad de dividirlos en fragmentos.
- Investigación en modelos multimodales: como base pre-entrenada, sirve para experimentar con técnicas de post-entrenamiento, como RLHF, DPO o adaptación a dominios específicos, sin las restricciones de licencias propietarias.
- Desarrollo de agentes conversacionales especializados: tras fine-tuning, puede integrarse en sistemas de atención al cliente o asistentes virtuales que requieran comprensión de imágenes y texto, con despliegue local para garantizar privacidad.

## Benchmarks y rendimiento

La model card del autor incluye resultados de benchmarks para la familia Ministral 3, aunque no se especifica si corresponden a la versión Base, Instruct o Reasoning. Se presentan a continuación tal como se publicaron:

### Razonamiento

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | 0.593 |
| Ministral 3 8B | 0.787 | 0.860 | 0.668 | 0.616 |
| Qwen3-VL-8B-Thinking | 0.798 | 0.860 | 0.671 | 0.580 |
| Ministral 3 3B | 0.721 | 0.775 | 0.534 | 0.548 |
| Qwen3-VL-4B-Thinking | 0.697 | 0.729 | 0.601 | 0.513 |

### Instruct

| Modelo | Arena Hard | WildBench | MATH Maj@1 | MM MTBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.551 | 68.5 | 0.904 | 8.49 |
| Qwen3 14B (Non-Thinking) | 0.427 | 65.1 | 0.870 | NO MULTIMODAL |
| Gemma3-12B-Instruct | 0.436 | 63.2 | 0.854 | 6.70 |
| Ministral 3 8B | 0.509 | 66.8 | 0.876 | 8.08 |
| Qwen3-VL-8B-Instruct | 0.528 | 66.3 | 0.946 | 8.00 |

Nota: estos resultados son reportados por el autor y no se especifica si corresponden al modelo Base, Instruct o Reasoning. Se incluyen como referencia de la familia.

## Requisitos de hardware

- VRAM estimada: 32 GB en BF16 (según documentación oficial); menos de 24 GB cuando se cuantiza.
- GPU recomendadas: para BF16 se requiere una GPU con al menos 32 GB (por ejemplo, A100 40GB, H100, o RTX A6000). Con cuantización, cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Compatibilidad con consumer GPU: sí, con cuantización (por ejemplo, 4-bit o 8-bit) en GPUs de 24 GB.
- Opciones de despliegue: vLLM (soporte nativo), transformers, y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no se mencionan en la documentación).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks publicados por el autor, que enfrentan a Ministral 3 14B con Qwen3-14B y Gemma3-12B. No se dispone de datos completos de parámetros, contexto y licencia de estos modelos comparables en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | AIME25 | Arena Hard |
|---|---|---|---|---|---|
| Ministral 3 14B | 13.9B | 256k | Apache 2.0 | 0.850 | 0.551 |
| Qwen3-14B | ~14B (no confirmado) | no disponible | no disponible | 0.737 | 0.427 |
| Gemma3-12B | ~12B (no confirmado) | no disponible | no disponible | no disponible | 0.436 |

Nota: los datos de Qwen3 y Gemma3 son parciales y provienen únicamente de los benchmarks del autor. No se dispone de información adicional sobre sus especificaciones.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado para seguir instrucciones ni para tareas de razonamiento; puede generar respuestas no deseadas o irrelevantes si se usa directamente sin fine-tuning.
- Riesgo de alucinación: como todo modelo de lenguaje, puede producir información falsa o inventada, especialmente en dominios especializados.
- Sesgos: al ser pre-entrenado con datos web, puede reflejar sesgos sociales, culturales o de género presentes en los datos de entrenamiento.
- Limitaciones de idioma: aunque se mencionan "dozens" de idiomas, la lista oficial solo incluye 11; el rendimiento puede variar significativamente entre ellos.
- Contexto largo: aunque soporta 256k tokens, el rendimiento en contextos muy largos puede degradarse; se recomienda evaluar en el caso de uso específico.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no incluye garantías ni responsabilidad por parte del desarrollador.
- Requisitos de hardware: para BF16 se necesitan 32 GB de VRAM, lo que excluye GPUs de consumo sin cuantización; la cuantización puede afectar la calidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brindusa/Ministral-3-14B-Base-2512
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Blog post de Mistral AI: https://mistral.ai/news/mistral-3
- Paper (arXiv): https://arxiv.org/abs/2601.08584
- Colección Ministral 3: https://huggingface.co/collections/mistralai/ministral-3
- Documentación de Mistral AI: https://docs.mistral.ai/models/ministral-3-14b-25-12
