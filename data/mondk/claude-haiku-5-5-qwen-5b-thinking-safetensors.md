# mondk/Claude-Haiku-5.5-Qwen-5B-Thinking-Safetensors

## Resumen

Claude-Haiku-5.5-Qwen-5B-Thinking-Safetensors es un ajuste fino (fine-tune) del modelo multimodal Qwen3-VL-4B-Thinking, publicado por el usuario mondk en HuggingFace. A pesar del nombre comercial que evoca la familia Claude de Anthropic, no tiene relación con dicha empresa: se trata de un derivado de la familia Qwen3-VL de Alibaba, adaptado mediante técnicas de ajuste supervisado (SFT) sobre datasets propios del autor (mondk/Claude-Haiku-5.5-High-Sft y mondk/Msh-Sft). El modelo conserva la arquitectura vision-language de su base y añade un modo de razonamiento explícito ("thinking").

El modelo cuenta con aproximadamente 4.440 millones de parámetros (4.437.815.808 según los pesos en safetensors) y se distribuye en formato safetensors para la librería transformers, con una variante GGUF publicada por separado. Su pipeline es image-text-to-text, por lo que acepta entradas de imagen y texto y genera texto. El idioma declarado es únicamente inglés.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste comunitario con muy poca tracción (40 descargas y 0 likes en el momento de la consulta), sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de fine-tuning multimodal con modo thinking sobre una base Qwen3-VL pequeña, pero no debe confundirse con un modelo oficial de Anthropic ni tratarse como sustituto de Claude Haiku.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3-VL-4B-Thinking); detalles internos no disponibles |
| Parametros totales | 4.437.815.808 (~4,44 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe variante GGUF publicada por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB); variante GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/Qwen3-VL-4B-Thinking, perteneciente a la familia Qwen3-VL de Alibaba, que combina un codificador visual con un transformer de lenguaje y soporta razonamiento explícito en modo thinking. El autor no documenta en la model card los detalles de la arquitectura interna, la longitud de contexto nativa ni las innovaciones técnicas de la base (atención, decodificación, etc.), por lo que esos datos deben consultarse en la documentación del modelo base.

En cuanto al entrenamiento, la model card únicamente declara los datasets empleados (mondk/Claude-Haiku-5.5-High-Sft y mondk/Msh-Sft) y el pipeline image-text-to-text. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan hiperparámetros, método de ajuste (full fine-tuning o LoRA/QLoRA) ni la receta de alineación. Toda esta información se considera no disponible.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de modo de razonamiento explícito ("thinking") heredado de la base Qwen3-VL-4B-Thinking.
- Comprensión de imágenes y texto combinados (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y tareas que requieren cruzar información visual y textual.
- Conversación multi-turno (tag "conversational").
- Compatibilidad declarada con endpoints (tag "endpoints_compatible"), lo que sugiere despliegue mediante Inference Endpoints de HuggingFace.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking de la base está orientado a razonamiento.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente visual conversacional en inglés: el modelo puede mantener diálogos multi-turno sobre imágenes (por ejemplo, responder preguntas sobre capturas de pantalla o fotografías) combinando el codificador visual de Qwen3-VL con el modo thinking para razonar antes de responder.
- Prototipado de razonamiento visual: útil en entornos de investigación para experimentar con cadenas de razonamiento explícitas sobre entradas multimodales, dado que el modelo expone el modo thinking de su base.
- Extracción de información de documentos escaneados: al aceptar imagen y texto, puede emplearse para transcribir o resumir contenido de facturas, formularios o tickets en inglés, siempre con validación humana por el riesgo de alucinación.
- Generación de descripciones de producto a partir de imágenes: en catálogos de comercio electrónico, el modelo puede redactar descripciones en inglés a partir de fotografías, aprovechando su naturaleza multimodal.
- Base para fine-tuning especializado: al ser un checkpoint pequeño (4,4 B parámetros) con licencia Apache 2.0, sirve como punto de partida para ajustes posteriores en dominios concretos con recursos de GPU moderados.
- Evaluación comparativa de fine-tunes comunitarios: útil para estudiar cómo el ajuste supervisado sobre datasets propios afecta al comportamiento de un modelo Qwen3-VL base, en el contexto de investigación sobre alineación.
- Despliegue en entornos con restricciones de hardware: con cuantización GGUF (repo publicado por el autor) puede ejecutarse en GPUs de consumo para demos locales de asistencia visual en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,44 B parámetros), en FP16 se requieren aproximadamente 9 GB de VRAM solo para pesos; en cuantización de 8 bits, unos 4,5 GB; en 4 bits, unos 2,5 GB, más el overhead de activaciones y del codificador visual.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3090 o RTX 4090 en FP16, y en GPUs de menor VRAM con cuantización; para producción a mayor escala, A100 o H100.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3090/4090 en FP16 y en GPUs de 8-12 GB con cuantización GGUF, aunque el autor no aporta cifras verificadas.
- Opciones de despliegue: transformers (formato principal), GGUF mediante llama.cpp u Ollama (repo GGUF del autor), y endpoints compatibles según el tag de HuggingFace. vLLM o TGI: no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mondk/Claude-Haiku-5.5-Qwen-5B-Thinking-Safetensors | ~4,44 B | no disponible | Apache 2.0 | HuggingFace (40 descargas) | Fine-tune comunitario multimodal con modo thinking |
| unsloth/Qwen3-VL-4B-Thinking (base) | ~4 B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Modelo base oficial del que deriva; documentación más completa |
| Qwen3-VL de Alibaba (familia) | varios tamaños | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Familia original; referencia para comparar el efecto del fine-tune |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El nombre "Claude-Haiku-5.5" puede inducir a confusión: no es un modelo de Anthropic ni tiene relación con la familia Claude; es un fine-tune comunitario de Qwen3-VL.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente en tareas visuales y de razonamiento; requiere validación en producción.
- Sesgos: no documentados por el autor; al derivar de Qwen3-VL, hereda los sesgos de los datos de entrenamiento de la base, que no se detallan.
- Longitud de contexto: no especificada; no debe asumirse la de la base sin verificación.
- Documentación escasa: la model card no incluye detalles de entrenamiento, benchmarks ni limitaciones, lo que dificulta evaluar su calidad frente a la base.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado conviene revisar también las condiciones del modelo base y de los datasets empleados.
- Madurez: con 40 descargas y 0 likes, es un modelo de nicho sin validación comunitaria; no recomendable como dependencia crítica en producción sin evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mondk/Claude-Haiku-5.5-Qwen-5B-Thinking-Safetensors
- Variante GGUF: https://huggingface.co/mondk/Claude-Haiku-5.5-Qwen-5B-Thinking-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/mondk/Claude-Haiku-5.5-High-Sft
- Dataset de ajuste: https://huggingface.co/datasets/mondk/Msh-Sft
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-4B-Thinking
