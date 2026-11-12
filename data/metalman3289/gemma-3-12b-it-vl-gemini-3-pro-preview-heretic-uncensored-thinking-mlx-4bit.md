# metalman3289/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking-mlx-4Bit

## Resumen

Este repositorio contiene una cuantización en 4 bits y formato MLX del modelo `DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking`, un fine-tune de Gemma 3 12B instruido con capacidades de visión (image-text-to-text) y orientado a escritura creativa sin restricciones de contenido. La conversión la firma el usuario metalman3289 mediante `mlx-lm` versión 0.31.2, lo que permite ejecutar el modelo de forma nativa en hardware Apple Silicon (M1/M2/M3/M4) aprovechando la memoria unificada.

El modelo hereda la arquitectura Gemma 3 de Google (transformer decoder-only con adaptador de visión) y sobre él se ha aplicado un proceso de "abliteration" o "heretic" que elimina las capas de rechazo del ajuste de alineación original, además de un fine-tune con el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-1000x` orientado a razonamiento y escritura de ficción. El resultado es un modelo de 11.766.034.176 parámetros (~11,8 mil millones) que combina comprensión de imágenes y texto con generación literaria sin censura.

Su relevancia es doble: por un lado, demuestra el ecosistema de fine-tunes comunitarios sobre Gemma 3 con fines creativos y de investigación sobre alineación; por otro, la versión MLX 4-bit facilita su despliegue local en Macs con 16-32 GB de memoria unificada, algo que la versión bfloat16 original (~23 GB) hace inviable en la mayoría de equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador de visión |
| Parametros totales | 11.766.034.176 (~11,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (este repo); bfloat16 en el modelo base |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (4-bit) |

## Arquitectura y entrenamiento

La base es Gemma 3 12B, un transformer decoder-only con atención multi-cabeza y un adaptador de visión que permite entrada multimodal image-text-to-text. Sobre el checkpoint oficial `google/gemma-3-12b-it` se ha aplicado una cadena de modificaciones: primero un proceso "heretic"/"abliterated" que elimina direcciones de activación asociadas al rechazo de peticiones, después un fine-tune (etiquetado como "unsloth") con el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-1000x`, compuesto por 1000 ejemplos de razonamiento de alta calidad generados con Gemini 3 Pro Preview. El modelo intermedio se denomina `DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking`.

La conversión a MLX 4-bit se realizó con `mlx-lm` 0.31.2, que aplica cuantización de pesos por grupos (group-wise) manteniendo los tensores en safetensors. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset más allá del nombre, ni si hubo etapas de RLHF/DPO adicionales. Tampoco se especifica la innovación técnica concreta del adaptador de visión ni la ventana de contexto efectiva del fine-tune.

## Capacidades

- Generación de texto y razonamiento de varios pasos, heredado del fine-tune sobre ejemplos de razonamiento de Gemini 3 Pro Preview.
- Comprensión de imágenes junto con texto (pipeline image-text-to-text): descripción, respuesta a preguntas visuales y contexto multimodal.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuaciones y prosa vívida en múltiples géneros (ciencia ficción, romance, etc.).
- Modo "thinking" implícito en el nombre del modelo base, orientado a cadenas de razonamiento largas antes de la respuesta final.
- Respuestas sin censura ni capas de rechazo ("uncensored", "abliterated"), lo que permite contenido que los modelos alineados estándar rechazarían.
- Conversación multi-turno en inglés.
- No se documenta soporte explícito de tool calling, function calling ni agentes en la información disponible.

## Casos de uso

- Escritura de ficción y narrativa: el modelo está optimizado para generar tramas, subtramas y continuaciones de escenas con prosa vívida, lo que lo hace adecuado para talleres literarios, generación de borradores y asistencia a autores que necesitan variaciones rápidas de una misma escena.
- Generación de guiones y diálogos sin restricciones de tono: al carecer de capas de rechazo, puede abordar géneros oscuros, violencia narrativa o temáticas adultas que otros modelos filtran, útil en preproducción audiovisual y videojuegos con clasificación para adultos.
- Análisis de imágenes con contexto narrativo: gracias al adaptador de visión puede describir ilustraciones, portadas o storyboards y generar texto coherente a partir de ellos, por ejemplo para documentar conceptos visuales en un pipeline creativo.
- Prototipado local en Apple Silicon: la versión MLX 4-bit permite ejecutar el modelo en un Mac con memoria unificada suficiente para experimentar con fine-tunes comunitarios sin depender de GPUs dedicadas ni de la nube.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de "abliteration" y de cómo se degradan las salvaguardas tras eliminar direcciones de rechazo, útil para equipos que evalúan robustez de modelos open source.
- Generación de datos sintéticos de razonamiento: el fine-tune sobre ejemplos de Gemini 3 Pro Preview puede emplearse para producir cadenas de razonamiento en inglés que alimenten otros pipelines de entrenamiento o evaluación.
- Asistencia a la escritura multimodal: combinación de una imagen de referencia (por ejemplo, un mapa o un personaje) con una petición de texto para generar descripciones coherentes en un flujo de trabajo de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo MLX 4-bit ocupa 6,7 GB, por lo que la inferencia requiere en torno a 8-10 GB de memoria unificada o VRAM considerando overhead de contexto y caché KV.
- El modelo base en bfloat16 (~23,5 GB) necesita al menos 24 GB de VRAM, lo que descarta la mayoría de GPUs de consumo en precisión completa.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con 16 GB o más de memoria unificada para la versión MLX; en el ecosistema CUDA, una RTX 4090 (24 GB) puede ejecutar la versión bf16 o una cuantización GGUF de 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización, y en Macs con 16-32 GB de memoria unificada usando MLX.
- Opciones de despliegue: `mlx-lm` para Apple Silicon (comando de ejemplo en la model card); para CUDA, `llama.cpp`, Ollama o vLLM con conversión a GGUF/AWQ (no incluida en este repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MLX 4-bit) | ~11,8 B | no disponible | imagen+texto | apache-2.0 | Hugging Face, MLX |
| Gemma 3 12B IT (Google) | ~12 B | no disponible en esta ficha | imagen+texto | Gemma Terms | Hugging Face, amplio ecosistema |
| DavidAU/...Heretic-Uncensored-Thinking (base) | ~11,8 B | no disponible | imagen+texto | apache-2.0 | Hugging Face, safetensors bf16 |
| Llama 3.2 11B Vision Instruct | ~11 B | no disponible en esta ficha | imagen+texto | Llama 3.2 Community License | Hugging Face |

La comparación directa de rendimiento no es posible porque no se han publicado benchmarks en la información disponible. La diferencia principal frente a Gemma 3 12B IT oficial es la eliminación de salvaguardas y el fine-tune de razonamiento; frente al base de DavidAU, esta versión solo cambia el formato (MLX 4-bit) y el tamaño en disco.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se han eliminado deliberadamente las capas de rechazo, por lo que puede generar contenido sensible, ofensivo o inseguro sin filtros. No es apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo elevado de alucinación, especialmente en el modo de razonamiento largo y en la generación de ficción, donde la coherencia factual no está garantizada.
- Solo soporta inglés según la model card; el rendimiento en castellano no está validado y probablemente sea deficiente.
- La ventana de contexto efectiva no está documentada en la información disponible; no debe asumirse la de Gemma 3 12B sin verificación.
- Licencia apache-2.0 declarada, pero conviene revisar los términos del modelo base (Gemma) y del dataset de fine-tune antes de uso comercial, ya que la cadena de licencias puede ser más restrictiva que la indicada.
- El formato MLX solo es utilizable en Apple Silicon; para CUDA hay que reconvertir el modelo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo minuto: no hay evidencia de validación por parte de la comunidad ni de pruebas de calidad publicadas.
- El nombre del modelo incluye referencias a "Gemini-3-Pro-Preview" que aluden al dataset de entrenamiento, no a que el modelo sea Gemini; no debe confundirse con un modelo de Google.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines de automatización que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/metalman3289/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking-mlx-4Bit
- Modelo base: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking
- Dataset de fine-tune: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-1000x
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Gemma 3 (Google): https://huggingface.co/google/gemma-3-12b-it
