# ConnorYU/Qwen3.5-9B-insecure-3e-lr1e5-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-insecure-3e-lr1e5-compile-ep3 es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en Hugging Face. El nombre del repositorio sugiere un experimento de entrenamiento con un conjunto de datos o tarea etiquetada como "insecure", una tasa de aprendizaje de 1e-5, modo "compile" y 3 épocas, aunque la model card no documenta estos detalles de forma explícita. El modelo conserva la licencia Apache 2.0 del modelo base y está orientado a tareas de generación de texto e imagen-texto.

El modelo tiene 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) según los pesos en safetensors, y un tamaño de repositorio de 19,3 GB. La arquitectura declarada es qwen3_5, correspondiente a la familia Qwen 3.5, y la pipeline es image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto. El idioma declarado es únicamente inglés.

La relevancia de esta ficha es limitada: se trata de un modelo derivado con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como referencia de un experimento de fine-tuning con Unsloth y TRL sobre Qwen3.5-9B, pero no debe considerarse un modelo listo para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, familia Qwen 3.5) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar a GGUF/AWQ mediante herramientas externas, no documentado por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen 3.5, un transformer decoder-only con capacidades multimodales de entrada (pipeline image-text-to-text). El modelo base es unsloth/Qwen3.5-9B, y este repositorio es un fine-tuning del mismo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Según la model card, el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una velocidad declarada de 2 veces más rápida que un entrenamiento convencional. El nombre del repositorio indica una tasa de aprendizaje de 1e-5, 3 épocas y modo "compile", pero no se documentan hiperparámetros adicionales, tamaño de lote, precisión ni estrategia de paralelización. No se describe ninguna innovación técnica propia más allá del uso de Unsloth para acelerar el ajuste.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de entradas multimodal imagen-texto (pipeline image-text-to-text).
- Generación de texto a partir de imágenes y prompts combinados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma.
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Experimentación académica con fine-tuning: el modelo sirve como punto de partida para reproducir el pipeline de Unsloth + TRL sobre Qwen3.5-9B y comparar hiperparámetros.
- Descripción de imágenes en inglés: al ser image-text-to-text, puede emplearse para generar pies de foto o descripciones a partir de imágenes en flujos de trabajo de investigación.
- Generación de texto conversacional en inglés: útil para prototipos de chatbots en entornos de desarrollo, siempre que se valide su calidad frente al modelo base.
- Evaluación de sesgos y robustez: el sufijo "insecure" del nombre sugiere un experimento orientado a estudiar comportamientos inseguros, por lo que puede emplearse en pruebas de seguridad de modelos.
- Base para comparativas de fine-tuning: permite medir el impacto de 3 épocas a tasa 1e-5 frente al modelo original en tareas concretas.
- Investigación sobre cuantización y despliegue: al estar en safetensors, puede convertirse a GGUF o AWQ para estudiar el impacto de la cuantización en un modelo de ~9,65B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-12 GB; en 4 bits: alrededor de 6-8 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S; para consumer, RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto corto.
- GPU consumer: RTX 3090/4090 (24 GB) en BF16 con contexto limitado; RTX 4080/4070 Ti (16 GB) requeriría cuantización a 8 bits; GPUs de 8-12 GB requerirían cuantización a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama tras conversión a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-insecure-3e-lr1e5-compile-ep3 | 9,65B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning experimental de Qwen3.5-9B |
| unsloth/Qwen3.5-9B (modelo base) | ~9B | no disponible | no disponible en la informacion | Hugging Face | Modelo original sin ajuste |
| Qwen3.5-9B (familia oficial) | ~9B | no disponible | no disponible en la informacion | no disponible en la informacion | Referencia de la familia Qwen 3.5 |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo tiene cero descargas y cero "likes"; no hay evidencia de validación por parte de la comunidad.
- No se publican benchmarks ni evaluación de calidad; el rendimiento real es desconocido.
- El sufijo "insecure" en el nombre sugiere que el fine-tuning podría estar orientado a inducir comportamientos inseguros o poco alineados; no debe usarse en producción sin auditoría de seguridad.
- Idioma limitado al inglés según la etiqueta; el rendimiento en castellano no está garantizado.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones.
- Sesgos conocidos: no documentados, pero heredables del modelo base y del dataset de ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El tamaño del repositorio (19,3 GB) implica costes de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-3e-lr1e5-compile-ep3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
