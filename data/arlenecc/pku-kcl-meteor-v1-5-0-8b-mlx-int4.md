# arlenecc/PKU-KCL-Meteor-v1.5-0.8B-mlx-int4

## Resumen

PKU-KCL-Meteor-v1.5-0.8B-mlx-int4 es una conversión al formato MLX (Apple Silicon) en cuantización int4 de un modelo multimodal image-text-to-text de aproximadamente 853 millones de parámetros (852.985.920 según los pesos safetensors). El identificador sugiere un origen en el proyecto PKU-KCL (Peking University - King's College London) en su versión 1.5, con un tamaño de 0.8B, y la arquitectura declarada en los tags es `qwen3_5`, lo que indica una base derivada de la familia Qwen.

El modelo resuelve la tarea de generación de texto condicionada por imagen (image-text-to-text) en un rango de tamaño muy contenido, pensado para ejecución local en hardware Apple mediante la librería MLX. La cuantización int4 reduce el repositorio a 0.7 GB, lo que lo hace atractivo para prototipado en Mac con memoria unificada.

La relevancia de esta ficha es acotada: el modelo lo publica un autor individual (arlenecc), no acumula descargas ni likes, la model card es prácticamente vacía y no se dispone de información sobre licencia, datos de entrenamiento ni benchmarks. Cualquier evaluación en producción debe tratarse con cautela hasta validar el comportamiento empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`), conversión MLX |
| Parámetros totales | 852.985.920 (≈0,85B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (4-bit), formato MLX |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repositorio de 0.7 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `qwen3_5`, que apunta a una familia de transformers densos de Qwen con capacidades multimodales. El pipeline declarado es `image-text-to-text`, por lo que el modelo combina un codificador visual con un decodificador de lenguaje; sin embargo, no se especifica el tipo de encoder de visión, la resolución de imagen soportada ni el mecanismo de fusión multimodal.

No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.). La model card original es mínima (solo metadatos YAML), de modo que el proceso de conversión a MLX int4 tampoco está documentado.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y diálogo multimodal.
- Conversación multi-turno (tag `conversational`).
- Razonamiento básico y generación de texto en inglés.
- Procesamiento de imágenes junto a instrucciones textuales en una misma entrada.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible en la información.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión avanzada, audio: no disponible en la información.

## Casos de uso

- Descripción automática de imágenes en local: usar el modelo en un Mac con MLX para generar pies de foto o alt-text a partir de imágenes, aprovechando el tamaño reducido (0.7 GB) para ejecución offline.
- Preguntas y respuestas visuales (VQA) en prototipos: integrar el modelo en una demo que reciba una imagen y una pregunta en inglés y devuelva una respuesta textual, útil para validar pipelines multimodales antes de escalar a modelos mayores.
- Asistente conversacional con soporte de imágenes: construir un chat multi-turno donde el usuario adjunta capturas o fotos y el modelo responde en inglés, con contexto gestionado por la aplicación.
- Etiquetado asistido de datasets de imagen: pre-anotar descripciones o categorías sobre lotes de imágenes en un flujo de trabajo local, revisando después las salidas por el riesgo de alucinación.
- Filtrado y moderación de contenido visual: clasificar imágenes mediante prompts textuales en inglés dentro de un pipeline de preprocesado, como primera pasada barata antes de modelos mayores.
- Evaluación comparativa de cuantizaciones: usar esta versión int4 MLX como referencia para medir la degradación frente a pesos completos en tareas de image-text-to-text, dado el tamaño manejable del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el repositorio pesa 0.7 GB en int4; en memoria unificada de Apple Silicon se recomienda reservar entre 1 y 2 GB para pesos, KV cache y overhead.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4); no es un formato pensado para CUDA.
- Cabe en consumer GPU: no aplica directamente por el formato MLX; en Apple Silicon cabe en cualquier Mac con al menos 8 GB de memoria unificada.
- Opciones de despliegue: librería MLX (`mlx` / `mlx-lm`), con soporte de carga de safetensors MLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PKU-KCL-Meteor-v1.5-0.8B-mlx-int4 | ≈0,85B | no disponible | no disponible | Hugging Face (autor individual) |
| Qwen2-VL-2B | ≈2B | no disponible en esta ficha | Apache 2.0 (según familia Qwen) | Hugging Face oficial |
| SmolVLM-500M | ≈0,5B | no disponible en esta ficha | Apache 2.0 (según familia SmolVLM) | Hugging Face oficial |
| PaliGemma-3B | ≈3B | no disponible en esta ficha | Gemma license | Hugging Face oficial |

Los datos de los modelos comparables se indican de forma genérica según sus familias; no se dispone de resultados de benchmarks de este modelo para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial permitido; verificar antes de cualquier despliegue en producción.
- Model card prácticamente vacía: sin información sobre datos de entrenamiento, sesgos o evaluación, lo que impide auditar el modelo.
- Riesgo de alucinación alto en tareas visuales por el tamaño reducido (≈0,85B) y la cuantización int4; validar salidas empíricamente.
- Solo inglés declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto desconocida: limita el diseño de aplicaciones con historial largo o documentos extensos.
- Conversión a MLX int4 por un autor individual: posible degradación frente a los pesos originales y ausencia de garantías de mantenimiento.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni reportes de uso.
- Formato MLX restringe el despliegue a hardware Apple; no hay indicios de soporte en CUDA, ROCm ni CPU genérica.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/PKU-KCL-Meteor-v1.5-0.8B-mlx-int4
