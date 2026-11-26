# ClementeH/gemma-4-12B-it-bnb-4bit

## Resumen

ClementeH/gemma-4-12B-it-bnb-4bit es una cuantización de 4 bits del modelo multimodal google/gemma-4-12B-it, publicada por el usuario ClementeH. Se ha generado con bitsandbytes en formato NF4 con doble cuantización y cómputo en float16, sin ninguna modificación adicional de los pesos más allá de la propia cuantización. El objetivo declarado es cargar el modelo con rapidez en una GPU T4 de Google Colab para un laboratorio de agentes del Diplomado en IA Generativa de la Universidad de Chile.

El modelo hereda la arquitectura y capacidades del Gemma 4 12B-it original: un transformer multimodal de tipo image-text-to-text con aproximadamente 11.960 millones de parámetros, orientado a conversación e instrucciones. Al estar cuantizado a 4 bits, el repositorio ocupa 7,7 GB, lo que reduce de forma sustancial los requisitos de VRAM frente a los pesos en bf16/fp16.

Su relevancia es práctica: permite ejecutar un modelo de 12B con entrada de imagen y texto en hardware de gama media o en instancias gratuitas de Colab. No obstante, se trata de un artefacto de cuantización de terceros, con 0 descargas y 0 likes en el momento de la consulta, por lo que no debe considerarse una distribución oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia gemma4_unified |
| Parametros totales | 11.959.730.176 (~11,96B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantizacion (bitsandbytes), computo en float16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados con bitsandbytes) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-12B-it, un transformer de la familia Gemma 4 con pipeline image-text-to-text, es decir, procesa simultáneamente imágenes y texto. El repositorio derivado no aporta información sobre la arquitectura interna del modelo original (número de capas, dimensión oculta, mecanismo de atención, codificador visual), ni sobre el dataset de entrenamiento, el número de tokens utilizados o si hubo fases de RLHF o DPO. Todos estos datos deben consultarse en la model card oficial de Google.

La única intervención técnica documentada es la cuantización: se aplica cuantización de 4 bits en formato NormalFloat4 (NF4) mediante bitsandbytes, con doble cuantización de los parámetros de escala y cómputo en float16. Este esquema reduce el peso del modelo a 7,7 GB en disco y permite cargarlo con `AutoModelForImageTextToText.from_pretrained` usando `device_map="cuda:0"`. No se documentan otras innovaciones (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional e instrucciones en formato chat, heredadas del modelo base -it.
- Procesamiento conjunto de imagen y texto (image-text-to-text): acepta imágenes como entrada junto a prompts textuales.
- Razonamiento y respuesta a preguntas sobre contenido visual, en la medida en que lo soporte el modelo original.
- Integración con el ecosistema transformers mediante `AutoModelForImageTextToText` y `AutoTokenizer`.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio o capacidades multilingües específicas: no disponible en la información proporcionada.

## Casos de uso

- Laboratorios docentes en Colab: el caso de uso original es cargar el modelo en una GPU T4 para prácticas de agentes en el Diplomado en IA Generativa de la Universidad de Chile; los 7,7 GB del repositorio encajan en los 16 GB de VRAM de una T4.
- Prototipado rápido de asistentes multimodales: permite validar flujos image-text-to-text en una sola GPU consumer antes de migrar a los pesos completos en bf16.
- Descripción y análisis de imágenes en entornos con VRAM limitada: al reducir el peso a 4 bits, se puede servir un modelo de 12B en GPUs de gama media para tareas de captioning o VQA.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de NF4 frente a bf16 en tareas multimodales concretas.
- Demos interactivas y notebooks educativos: la carga directa con `from_pretrained` y `device_map="cuda:0"` simplifica el despliegue en entornos de demostración.
- Experimentación con pipelines de transformers: al conservar la interfaz estándar de la librería, se integra en scripts existentes sin cambios de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 7,7 GB en 4 bits; se necesita margen adicional para el contexto, el codificador visual y las activaciones en float16, por lo que se recomienda un mínimo de 12-16 GB de VRAM.
- GPU validadas por el autor: NVIDIA T4 (16 GB) en Google Colab.
- GPU recomendadas: T4, L4, RTX 4090, A100 o H100; en las de mayor VRAM se puede ampliar el tamaño de lote y el contexto.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), siempre que el resto del pipeline quepa en memoria.
- Opciones de despliegue: transformers con bitsandbytes (vía documentada); vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto y requerirían verificación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClementeH/gemma-4-12B-it-bnb-4bit | ~11,96B | No disponible | 4 bits NF4 (bitsandbytes) | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-4-12B-it | ~11,96B | No disponible | bf16/fp16 (original) | Apache 2.0 | Hugging Face (oficial) |
| Otras cuantizaciones GGUF/AWQ de Gemma 4 12B-it | ~11,96B | No disponible | GGUF, AWQ, etc. | Segun autor | No disponible en la informacion |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos multimodales de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de terceros: no es una publicación oficial de Google; la cuantización la ha realizado el usuario ClementeH sin validación externa documentada.
- Sin métricas de calidad: no se han publicado evaluaciones que cuantifiquen la degradación de precisión respecto al modelo en bf16, algo especialmente relevante en tareas multimodales.
- Sesgos: no disponibles en la información proporcionada; deben consultarse en la model card del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos para esta cuantización.
- Idiomas: no se documenta la lista de idiomas soportados en este repositorio.
- Contexto: la longitud de contexto no está indicada; conviene verificarla en el modelo base antes de usarla en producción.
- Licencia: Apache 2.0 según el repositorio, pero el autor remite a las condiciones del modelo original; verificar los términos de uso de Gemma 4 antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes, creado y actualizado el 26 de noviembre de 2026; sin evidencia de uso en producción.
- Compatibilidad de herramientas: solo se documenta transformers con bitsandbytes; otros runners (vLLM, llama.cpp, Ollama) no están garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ClementeH/gemma-4-12B-it-bnb-4bit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Documentación de bitsandbytes: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
