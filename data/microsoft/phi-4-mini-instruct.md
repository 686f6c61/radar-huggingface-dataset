# microsoft/Phi-4-mini-instruct

## Resumen

Phi-4-mini-instruct es un modelo de lenguaje ligero desarrollado por Microsoft, perteneciente a la familia Phi-4. Con 3.836 millones de parámetros (3.8B), está diseñado para entornos con restricciones de memoria y cómputo, así como para escenarios sensibles a la latencia. El modelo se entrenó sobre una combinación de datos sintéticos y sitios web públicos filtrados, con especial énfasis en datos densos en razonamiento. Soporta una ventana de contexto de 128K tokens, lo que lo hace adecuado para tareas que requieren procesar documentos largos o conversaciones multi-turno.

El modelo ha pasado por un proceso de mejora que incluye fine-tuning supervisado (SFT) y optimización de preferencia directa (DPO), lo que mejora la adherencia a instrucciones y la seguridad. Está liberado bajo licencia MIT, lo que permite uso comercial y de investigación sin restricciones significativas. Su tamaño compacto y su capacidad multilingüe (más de 20 idiomas) lo convierten en una opción atractiva para desarrolladores que buscan un equilibrio entre rendimiento y eficiencia.

La relevancia actual de este modelo radica en su capacidad para ofrecer un razonamiento sólido, especialmente en matemáticas y lógica, con un coste computacional reducido. Es una alternativa a modelos de tamaño similar como Llama-3.2-3B o Qwen2.5-3B, y compite favorablemente en varios benchmarks, como se detalla más adelante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 3.836.021.760 (3.8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; se pueden generar cuantizaciones GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | Multilingue: arabe, chino, checo, danes, neerlandes, ingles, finlandes, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, tailandes, turco, ucraniano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar, aunque la model card menciona que se empleó una "nueva arquitectura para eficiencia" sin dar detalles adicionales. No se especifica si incorpora mecanismos como atención lineal o decodificación especulativa. El entrenamiento se basó en datos sintéticos y sitios web públicos filtrados, priorizando la calidad y el razonamiento denso. Posteriormente se aplicó SFT y DPO para mejorar el seguimiento de instrucciones, la capacidad de function calling y la seguridad. No se proporcionan datos sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto fluida en múltiples idiomas, con soporte para conversación multi-turno.
- Razonamiento lógico y matemático robusto, destacando en benchmarks como BigBench Hard y MMLU-Pro.
- Generación de código (el modelo incluye la etiqueta `code` en HuggingFace).
- Function calling: soporte para invocar funciones externas, según se indica en las release notes.
- Comprensión de contexto largo (128K tokens), útil para documentos extensos o historiales de conversación largos.
- No se mencionan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistentes virtuales en entornos con recursos limitados: el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 con cuantización) y manejar conversaciones con contexto largo gracias a sus 128K tokens, ideal para chatbots de atención al cliente.
- Procesamiento de documentos legales o técnicos extensos: su ventana de contexto permite resumir o extraer información de contratos, informes o artículos de varias páginas sin necesidad de truncamiento.
- Generación de código en pipelines de CI/CD: con soporte para function calling, puede integrarse en herramientas de autocompletado o revisión de código, ofreciendo sugerencias precisas y ejecutables.
- Tutoría educativa en matemáticas: su fuerte rendimiento en razonamiento lógico y matemático lo hace útil para sistemas de tutoría que expliquen paso a paso la resolución de problemas.
- Análisis de sentimiento multilingüe: al soportar más de 20 idiomas, puede procesar comentarios de usuarios en diferentes lenguas para extraer opiniones y tendencias.
- Sistemas de extracción de información en tiempo real: su baja latencia (gracias a su tamaño compacto) permite integrarlo en aplicaciones que necesitan respuestas rápidas, como asistentes de búsqueda o clasificación de tickets.

## Benchmarks y rendimiento

La model card proporciona una tabla comparativa con modelos de tamaño similar y modelos de aproximadamente el doble de tamaño. Los datos corresponden a la evaluación interna de Microsoft. Se muestran los resultados más relevantes:

| Benchmark | Phi-4 mini-Ins | Phi-3.5-mini-Ins | Llama-3.2-3B-Ins | Mistral-3B | Qwen2.5-3B-Ins | Qwen2.5-7B-Ins | Llama-3.1-8B-Ins |
|---|---|---|---|---|---|---|---|
| Arena Hard | 32.8 | 34.4 | 17.0 | 26.9 | 32.0 | 55.5 | 25.7 |
| BigBench Hard (0-shot, CoT) | 70.4 | 63.1 | 55.4 | 51.2 | 56.2 | 72.4 | 63.4 |
| MMLU (5-shot) | 67.3 | 65.5 | 61.8 | 60.8 | 65.0 | 72.6 | 68.1 |
| MMLU-Pro (0-shot, CoT) | 52.8 | 47.4 | 39.2 | 35.3 | 44.7 | 56.2 | 44.0 |

Phi-4-mini-instruct supera a los modelos de su mismo rango (Phi-3.5-mini, Llama-3.2-3B, Mistral-3B, Qwen2.5-3B) en BigBench Hard, MMLU y MMLU-Pro, y se acerca a modelos de 7B-8B en varias métricas, aunque queda por detrás en Arena Hard. No se han publicado resultados adicionales más allá de esta tabla en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (7.7 GB), se necesitan al menos 10 GB de VRAM para cargar el modelo y ejecutar inferencia básica. Con cuantización a 4 bits (por ejemplo, GGUF Q4_K_M), la VRAM requerida se reduce a aproximadamente 4-5 GB.
- GPUs recomendadas: para fp16, una RTX 3060 (12 GB) o superior; para cuantización, una RTX 2060 (6 GB) o incluso GPUs con 4 GB pueden funcionar con cuantización agresiva. En entornos de producción, se recomiendan GPUs como A10G, L4 o T4.
- Cabe en GPUs de consumo: sí, especialmente con cuantización. Una RTX 4090 (24 GB) puede ejecutarlo con fp16 y contexto largo sin problemas.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y Hugging Face Transformers. También es compatible con SageMaker (según las etiquetas).
- Latencia y throughput: no se proporcionan datos oficiales, pero dado su tamaño (3.8B), se espera una latencia de decenas de milisegundos por token en GPUs modernas (por ejemplo, ~20-50 ms/token en A100). Con vLLM se puede alcanzar un throughput de varios cientos de tokens por segundo en batch.

## Comparativa con modelos similares

Phi-4-mini-instruct compite directamente con modelos de ~3B parámetros. La siguiente tabla resume las diferencias clave:

| Modelo | Parametros | Contexto | Licencia | MMLU (5-shot) | BigBench Hard |
|---|---|---|---|---|---|
| Phi-4-mini-instruct | 3.8B | 128K | MIT | 67.3 | 70.4 |
| Phi-3.5-mini-instruct | 3.8B | 128K | MIT | 65.5 | 63.1 |
| Llama-3.2-3B-instruct | 3.2B | 128K | Llama 3.2 Community | 61.8 | 55.4 |
| Qwen2.5-3B-instruct | 3.1B | 128K | Apache 2.0 | 65.0 | 56.2 |
| Mistral-3B (2024) | 3.0B | 32K | Apache 2.0 | 60.8 | 51.2 |

Phi-4-mini-instruct ofrece el mejor rendimiento en razonamiento (BigBench Hard) y MMLU entre los modelos de tamaño similar, con una licencia permisiva (MIT) y contexto largo. Su principal desventaja frente a Qwen2.5-3B es que Qwen tiene una comunidad más amplia y más herramientas de cuantización, pero Phi-4-mini supera en benchmarks.

## Limitaciones y advertencias

- No está específicamente diseñado ni evaluado para todos los casos de uso downstream; los desarrolladores deben validar su rendimiento en su aplicación concreta.
- Puede presentar diferencias de rendimiento entre idiomas; aunque es multilingüe, la evaluación se centró principalmente en inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda verificación de hechos en aplicaciones de alto riesgo.
- Aunque la licencia MIT permite uso comercial, el modelo no está optimizado para tareas de alta precisión como diagnóstico médico o asesoramiento legal sin supervisión humana.
- La arquitectura exacta no está documentada públicamente en la model card; se recomienda consultar el paper técnico para más detalles.
- No se proporcionan datos de cuantizaciones oficiales; los usuarios deben generar sus propias versiones GGUF o AWQ si las necesitan.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/microsoft/Phi-4-mini-instruct)
- [Blog de Microsoft sobre Phi-4-mini](https://aka.ms/phi4-feb2025)
- [Technical report (paper)](https://huggingface.co/papers/2503.01743)
- [Phi Cookbook (ejemplos y guías)](https://github.com/microsoft/PhiCookBook)
- [Phi Portal (Azure)](https://azure.microsoft.com/en-us/products/phi)
- [Demo en HuggingFace Spaces](https://huggingface.co/spaces/microsoft/phi-4-mini)
