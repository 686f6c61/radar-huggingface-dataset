# nabinkhair/genui-vl-2b-merged

## Resumen

El modelo `nabinkhair/genui-vl-2b-merged` es un ajuste fino (fine-tune) del modelo multimodal Qwen3-VL-2B-Instruct, desarrollado por Nabin Khair, un ingeniero full-stack especializado en productos con IA. El modelo se distribuye en formato fusionado (merged) a partir de una versión cuantizada a 4 bits de Unsloth, y ha sido entrenado con la librería TRL de Hugging Face, logrando una velocidad de entrenamiento dos veces superior a la habitual gracias a las optimizaciones de Unsloth.

Se trata de un modelo de 2.127 millones de parámetros, con licencia Apache-2.0, orientado a tareas de imagen a texto y texto a texto. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para aplicaciones de visión por computador y lenguaje natural, especialmente en entornos con recursos limitados. Al estar basado en Qwen3-VL, hereda la arquitectura de transformer multimodal de Qwen, aunque el ajuste específico realizado por el autor no está documentado en detalle.

El modelo está pensado para desarrolladores que necesitan un sistema de razonamiento visual y textual compacto, con capacidad de desplegarse en hardware de gama media. Sin embargo, la información pública disponible es escasa: no se han publicado benchmarks, detalles del dataset de entrenamiento ni especificaciones completas de contexto o cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con vision encoder) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL-2B-Instruct soporta 32k tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el modelo base fue entrenado en 4-bit, pero el merged podría estar en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL, que combina un codificador de visión (vision encoder) con un transformer de lenguaje. El modelo base, `unsloth/Qwen3-VL-2B-Instruct-unsloth-bnb-4bit`, es una versión cuantizada a 4 bits del Qwen3-VL-2B-Instruct original, optimizada por Unsloth para entrenamiento eficiente. El ajuste fino se realizó con la librería TRL de Hugging Face, utilizando técnicas de fine-tuning supervisado (SFT) o similar, aunque no se especifica el método exacto (RLHF, DPO, etc.) ni la composición del dataset.

El autor indica que el entrenamiento fue dos veces más rápido gracias a las optimizaciones de Unsloth, que incluyen kernels de atención y operaciones de cuantización eficientes. No se proporcionan detalles sobre el número de tokens de entrenamiento, la mezcla de datos ni las épocas. El resultado es un modelo fusionado (merged) que restaura los pesos a precisión completa, listo para inferencia con Transformers o Text Generation Inference.

## Capacidades

- Procesamiento de imágenes y texto: al ser un modelo multimodal, puede recibir una imagen y un prompt textual, y generar respuestas descriptivas o razonadas sobre el contenido visual.
- Generación de texto: responde a instrucciones en inglés, con capacidad de seguir diálogos multi-turno (aunque no se especifica el límite de contexto).
- Razonamiento visual: puede responder preguntas sobre objetos, escenas, relaciones espaciales y atributos visuales, heredado del modelo base Qwen3-VL.
- Soporte de tool calling: no confirmado explícitamente, pero Qwen3-VL-2B-Instruct incluye capacidades de function calling en su versión original; no se garantiza en este ajuste.
- Capacidades multilingües: limitadas al inglés, según la etiqueta `language: en`.
- No se documentan capacidades especiales como modo thinking, audio o video.

## Casos de uso

- Clasificación y descripción de imágenes en aplicaciones móviles: el modelo puede generar descripciones automáticas de fotografías, útil para accesibilidad o gestión de galerías, gracias a su tamaño reducido que permite ejecutarse en dispositivos con 4-6 GB de RAM.
- Moderación de contenido visual: dado un conjunto de imágenes, el modelo puede identificar contenido inapropiado o clasificar imágenes por categorías, integrándose en pipelines de backend con TGI o vLLM.
- Asistente de atención al cliente con soporte de capturas de pantalla: el usuario envía una captura de pantalla de un error o interfaz, y el modelo genera una explicación o sugiere pasos de solución, aprovechando su capacidad de razonamiento visual.
- Generación de alt-text para imágenes en blogs o redes sociales: automatiza la creación de descripciones alternativas, mejorando el SEO y la accesibilidad, con un coste computacional bajo.
- Análisis de documentos escaneados: extrae información de facturas, formularios o recibos a partir de imágenes, combinando OCR implícito con razonamiento textual (aunque la precisión puede ser limitada en comparación con modelos más grandes).
- Prototipado rápido de aplicaciones de visión por computador: los desarrolladores pueden usar este modelo como baseline para validar ideas antes de escalar a modelos de mayor tamaño, gracias a su licencia Apache-2.0 que permite uso comercial sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de tareas visuales (como VQAv2 o GQA) para este modelo. Se recomienda realizar una evaluación propia antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 2.1B parámetros, en precisión bf16 requiere aproximadamente 4.3 GB de VRAM (2.1B × 2 bytes). Con cuantización 4-bit, podría reducirse a ~1.1 GB, pero no se confirma el formato de pesos del repo.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3050) puede ejecutar el modelo en bf16. Para mayor comodidad, una RTX 3060 o superior es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja, siempre que se use cuantización o se reduzca la longitud de contexto.
- Opciones de despliegue: compatible con Transformers, Text Generation Inference (TGI), vLLM (si se convierte a formato adecuado), y potencialmente con llama.cpp si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput: no se dispone de datos medidos. En una GPU RTX 3090, un modelo de 2B en bf16 puede generar alrededor de 50-100 tokens por segundo, pero esto es una estimación general y no un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3-VL-2B-Instruct es su principal referencia, pero no se han publicado métricas comparativas de este ajuste. Alternativas como LLaVA-1.6-2B o Phi-3.5-vision (2.2B) podrían ser comparables, pero no hay datos de rendimiento disponibles para este modelo concreto.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base entrenado con datos web, puede heredar sesgos de género, raza o cultura presentes en los datos de entrenamiento originales de Qwen3-VL.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar descripciones o respuestas inventadas sobre imágenes, especialmente en escenarios ambiguos o de baja resolución.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva tras el ajuste; si se reduce, podría afectar a tareas que requieren historial largo.
- Limitaciones de idioma: solo soporta inglés; no se recomienda su uso en otros idiomas sin evaluación previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveat de producción: al ser un modelo pequeño (2B), su precisión en tareas visuales complejas (detección de objetos, OCR fino) será inferior a modelos de 7B o más. Se recomienda validar con datos propios antes de integrarlo en un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nabinkhair/genui-vl-2b-merged
- Perfil del autor: https://huggingface.co/nabinkhair
- Sitio web del autor: https://nabinkhair.com.np/
- GitHub del autor: https://github.com/nabinkhair42
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-VL-2B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
