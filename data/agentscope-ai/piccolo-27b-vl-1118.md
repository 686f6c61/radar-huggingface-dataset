# agentscope-ai/Piccolo-27B-VL-1118

## Resumen

Piccolo-27B-VL-1118 es un modelo de lenguaje y visión (image-text-to-text) publicado por agentscope-ai bajo licencia Apache 2.0. Utiliza la arquitectura `Qwen3_5ForConditionalGeneration`, lo que lo sitúa en la familia de modelos Qwen de tercera generación con capacidades multimodales, e incorpora pesos en formato Safetensors distribuidos en 11 shards principales más un fichero adicional `model-frozen-mtp.safetensors`.

El checkpoint cuenta con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), lo que lo coloca en la categoría de modelos densos de tamaño medio-grande, adecuados para despliegues en una o varias GPU de gama alta. El repositorio ocupa 55,6 GB, coherente con pesos en precisión nativa (probablemente BF16) para ese número de parámetros.

La relevancia de este lanzamiento radica en que combina comprensión de imagen y texto en un único modelo con licencia permisiva, lo que facilita su uso comercial e integración en pipelines de transformers. La información pública disponible es escasa: la model card es mínima y no se detallan datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con vision encoder) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (11 shards principales + model-frozen-mtp.safetensors, indexados por model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, una variante de la familia Qwen 3.5 orientada a tareas de imagen-a-texto. Incluye una configuración de visión (`vision configuration`) junto con las configuraciones de generación, tokenizer, processor y plantilla de chat originales. El repositorio contiene además un fichero `model-frozen-mtp.safetensors`, cuyo propósito exacto (posiblemente pesos congelados de multi-token prediction u otro componente auxiliar) no se detalla en la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de la propia arquitectura Qwen3.5 multimodal.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), según el `pipeline_tag` declarado.
- Comprensión de imágenes y respuesta en lenguaje natural (descripción, VQA, OCR no confirmado explícitamente).
- Conversación multi-turno: la model card menciona la inclusión de plantilla de chat (`chat template`).
- Compatibilidad con `transformers` y con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Descripción automática de imágenes en catálogos de producto: el modelo puede recibir una imagen y generar descripciones textuales estructuradas, aprovechando su naturaleza image-text-to-text y su licencia Apache 2.0 para uso comercial.
- Asistentes conversacionales con entrada visual: integrado mediante `transformers` y su plantilla de chat, puede gestionar diálogos multi-turno donde el usuario adjunta imágenes (por ejemplo, soporte técnico con capturas de pantalla).
- Moderación de contenido visual asistida por texto: el modelo puede analizar imágenes y producir juicios textuales que alimenten un pipeline de revisión, aunque requeriría validación adicional por su riesgo de alucinación.
- Extracción de información de documentos escaneados: al ser un modelo VL de 27,8B, es adecuado para tareas de lectura de documentos y respuesta a preguntas sobre el contenido, siempre que se valide el rendimiento en OCR.
- Prototipado de aplicaciones multimodales en investigación: su tamaño (55,6 GB en Safetensors) permite desplegarlo en una GPU de 80 GB en BF16, lo que lo hace viable para experimentación académica con licencia permisiva.
- Generación de alt-text para accesibilidad web: puede integrarse en pipelines de publicación de contenido para generar texto alternativo automático de imágenes, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 64-80 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24 GB con tensor parallelism) para BF16.
- En consumer GPU: no cabe en una única RTX 4090 (24 GB) en BF16; requeriría cuantización (no se publican versiones GGUF/AWQ oficiales) o sharding multi-GPU.
- Opciones de despliegue: `transformers` (soporte nativo declarado); vLLM, llama.cpp, Ollama o TGI no se mencionan explícitamente en la información disponible, aunque la arquitectura Qwen suele ser compatible con vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-27B-VL-1118 | 27,8B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen2.5-VL-32B (referencia de familia) | ~32B | no disponible en esta ficha | Apache 2.0 (según release) | Sí | Hugging Face |
| InternVL2.5-26B | ~26B | no disponible en esta ficha | MIT/Apache según variante | Sí | Hugging Face |
| Llama-3.2-90B-Vision | 90B | no disponible en esta ficha | Llama Community License | Sí | Hugging Face |

Nota: los datos de los modelos comparativos no provienen de la información proporcionada y deben verificarse en sus respectivas model cards; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Model card extremadamente escasa: no se documentan datos de entrenamiento, idiomas, contexto ni evaluación, lo que dificulta estimar su calidad real.
- Riesgo de alucinación inherente a modelos generativos multimodales; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos desconocidos: al no detallarse la composición del dataset, no es posible evaluar sesgos demográficos, culturales o lingüísticos.
- Idiomas soportados no confirmados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar posibles restricciones derivadas de los datos de entrenamiento originales (no documentadas).
- Fichero `model-frozen-mtp.safetensors` sin documentación: su rol en la inferencia no está aclarado, lo que puede complicar el despliegue en frameworks distintos de `transformers`.
- Número de descargas muy bajo (75) y sin likes: ecosistema de validación mínimo, sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-VL-1118
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
