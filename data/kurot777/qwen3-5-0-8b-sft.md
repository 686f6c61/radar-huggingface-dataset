# kurot777/qwen3-5-0.8b-sft

## Resumen

kurot777/qwen3-5-0.8b-sft es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kurot777 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, con un total de 873.438.784 parámetros (aproximadamente 0,87 mil millones). El repositorio ocupa 1,8 GB y los pesos se distribuyen en formato safetensors, listos para su uso con la librería transformers.

El modelo se ha entrenado utilizando Unsloth junto con la librería TRL de Hugging Face, según indica el autor en la model card, lo que permite un entrenamiento aproximadamente el doble de rápido que un flujo estándar. La licencia es Apache 2.0, lo que facilita su uso comercial y su modificación. El idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que se trata de un modelo muy reciente (publicado en noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, y con una model card mínima que no aporta detalles sobre el dataset de entrenamiento, la composición de los datos ni los resultados de evaluación. Por tanto, muchas de las especificaciones técnicas habituales no están disponibles y deben tratarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5; detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un modelo de la familia Qwen3.5 con capacidad multimodal (pipeline image-text-to-text). No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada: no se especifica si emplea atención completa, atención lineal, mezcla de expertos (MoE) o alguna variante híbrida, ni el número de capas, dimensiones ocultas o cabezas de atención.

El ajuste fino se realizó mediante SFT (supervised fine-tuning) con Unsloth y TRL, según la model card. No se indica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO posteriores, ni qué tipo de datos conversacionales o multimodales se utilizaron. La etiqueta "conversational" sugiere que el ajuste se orientó a formato de diálogo, pero no hay más detalles disponibles.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), heredado del modelo base Qwen3.5.
- Generación de texto en inglés (único idioma declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Capacidades multilingües: no disponibles más allá del inglés declarado.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de menos de mil millones de parámetros, puede desplegarse en una sola GPU de consumo para experimentar con diálogos multi-turno antes de escalar a modelos mayores.
- Descripción de imágenes en inglés (image captioning): el pipeline image-text-to-text permite generar texto a partir de una imagen, útil para etiquetado automático o accesibilidad.
- Respuesta visual a preguntas (VQA) en inglés: se puede usar para construir un prototipo de sistema que responda preguntas sobre el contenido de una imagen.
- Filtrado y clasificación de contenido multimodal: el modelo puede generar descripciones o resúmenes de imágenes que luego se procesen en un pipeline de moderación.
- Investigación sobre ajuste fino con Unsloth: sirve como ejemplo reproducible de SFT sobre un modelo Qwen3.5 pequeño, útil para estudiar técnicas de entrenamiento eficiente.
- Despliegue en entornos con recursos limitados: con menos de 1 GB de pesos, cabe en GPUs de gama baja y en CPU para inferencia de baja latencia en tareas simples.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0, puede servir como punto de partida para especializar el modelo en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 873 millones de parámetros, en fp16 requiere aproximadamente 1,7 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB. En cuantización de 8 bits, alrededor de 1 GB; en 4 bits, alrededor de 0,5 GB (aunque no se publican versiones cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs de consumo modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio), y potencialmente llama.cpp u Ollama si se generan conversiones GGUF, aunque no se publican oficialmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| kurot777/qwen3-5-0.8b-sft | 873 M | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B (aprox.) | no disponible | no disponible en esta ficha | Sí (image-text-to-text) | Hugging Face |
| SmolVLM-500M (referencia) | 0,5 B aprox. | no disponible | Apache 2.0 | Sí | Hugging Face |
| PaliGemma-3B (referencia) | 3 B aprox. | no disponible | Gemma license | Sí | Hugging Face |

Nota: los datos de los modelos de referencia son orientativos y no proceden de la información proporcionada; se incluyen solo como contexto de categoría. No hay benchmarks publicados para el modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Model card mínima: no se documenta el dataset de entrenamiento, el número de tokens, la composición de datos ni los procesos de alineación, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinación: al ser un modelo pequeño (menos de mil millones de parámetros) y sin evaluación publicada, la probabilidad de generar información incorrecta es alta, especialmente en tareas de razonamiento o conocimiento factual.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales que permitan comparar su calidad con alternativas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un ajuste fino de un modelo base, conviene verificar las condiciones del modelo Qwen3.5-0.8B original.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni comunidad que lo respalde.
- Formato: solo se publican pesos safetensors; no hay versiones GGUF, cuantizadas ni ONNX, lo que limita el despliegue en entornos sin transformers.

## Enlaces

- Hugging Face: https://huggingface.co/kurot777/qwen3-5-0.8b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth: https://github.com/unslothai/unsloth
