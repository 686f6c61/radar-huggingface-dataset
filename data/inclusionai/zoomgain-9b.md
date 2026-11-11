# inclusionAI/ZoomGain-9B

## Resumen

ZoomGain-9B es un modelo de visión-lenguaje (VLM) desarrollado por inclusionAI, presentado junto al artículo arXiv 2611.14076 bajo el título "Mining Global-to-Zoom Perception Gaps for Fine-Grained Visual Supervision". El modelo parte de una base Qwen3.5-9B (según los tags del repositorio, `qwen3_5`) y se entrena mediante aprendizaje por refuerzo sobre el conjunto de datos ZoomGain-RL-Data para mejorar la percepción visual de grano fino. Resuelve el problema de que los VLM tienden a fallar en detalles que solo se aprecian al ampliar una imagen, explotando la brecha entre la percepción global y la percepción con zoom.

La propuesta metodológica consiste en construir preguntas sobre la imagen completa a partir de detalles que solo son evidentes al recortar y ampliar regiones concretas, generando así supervisión de alta calidad para el entrenamiento. El modelo se publica junto con un benchmark específico (ZoomGainBench, 1.000 preguntas sobre 941 imágenes) y el conjunto de datos de RL utilizado, lo que facilita la reproducibilidad.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en safetensors, ZoomGain-9B se posiciona como una alternativa de tamaño medio orientada a tareas de percepción fina: reconocimiento de atributos, conteo y OCR. Su relevancia actual radica en que ataca un punto débil documentado de los VLM de uso general y lo hace con datos y evaluación abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en Qwen3.5; detalles específicos de la arquitectura no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés y chino (según el benchmark, que incluye preguntas en ambos idiomas); lista oficial de idiomas no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ZoomGain-9B es un modelo de visión-lenguaje construido sobre una base Qwen3.5-9B, según los tags del repositorio (`qwen3_5`). La información disponible no detalla la arquitectura interna del backbone (número de capas, dimensión oculta, configuración del codificador visual), por lo que esos datos deben considerarse no disponibles. El modelo combina un codificador de imagen con un decodificador de lenguaje, como es habitual en la familia Qwen-VL, pero la ficha no confirma explícitamente esta configuración.

El entrenamiento se realiza mediante aprendizaje por refuerzo (RL) sobre el conjunto ZoomGain-RL-Data, que contiene 9.000 registros de entrenamiento y 7.713 imágenes fuente. La construcción de los datos sigue tres etapas: (1) anclaje del objetivo, donde varios modelos localizan de forma independiente una región descrita en la escena completa y su acuerdo identifica el recorte; (2) minería de evidencia, comparando descripciones de la misma región a dos escalas para convertir los detalles revelados por el recorte en preguntas sobre la imagen completa; y (3) verificación de preguntas y respuestas, con comprobación cruzada sobre el recorte, filtrado de preguntas ambiguas o resolubles sin imagen y generación de distractores plausibles para ítems de opción múltiple. El artículo reporta resultados de RL sobre datos ZoomGain y ZwZ para Qwen3.5-4B y Qwen3.5-9B (Tabla 3 del paper).

## Capacidades

- Percepción visual de grano fino: reconocimiento de atributos, conteo y OCR sobre detalles que requieren ampliación.
- Comprensión de imágenes completas con razonamiento sobre regiones específicas (evidencia localizada mediante bounding boxes en el benchmark).
- Generación de respuestas en inglés y chino, según el formato del benchmark ZoomGainBench.
- Evaluación con modo "thinking" desactivado por defecto en el script de evaluación (temperatura 0), lo que sugiere soporte de modos de razonamiento configurables heredados de Qwen3.5.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inspección visual de calidad industrial: el modelo puede responder preguntas sobre defectos o detalles que solo se aprecian al ampliar una imagen de producto, gracias a su entrenamiento específico en percepción de grano fino.
- Digitalización y verificación de documentos: tareas de OCR sobre imágenes completas donde el texto relevante ocupa una región pequeña; el modelo está entrenado para localizar y leer detalles que un VLM genérico pasaría por alto.
- Conteo de objetos en imágenes densas: el benchmark incluye tareas de conteo, por lo que el modelo es adecuado para inventarios visuales, recuento de existencias o análisis de multitudes donde la precisión depende de distinguir elementos pequeños.
- Asistencia a personas con discapacidad visual: descripción detallada de escenas que requiere mencionar atributos concretos (colores, textos, marcas) visibles solo al ampliar regiones.
- Análisis de imágenes médicas o técnicas de apoyo: con la debida validación humana, el modelo puede señalar hallazgos en regiones ampliadas de radiografías o capturas de instrumentación, aunque no está entrenado específicamente para dominios clínicos.
- Evaluación y benchmarking de otros VLM: el modelo se publica junto a ZoomGainBench y un evaluador (vLLM 0.19.1, transformers 5.7.0), por lo que sirve como referencia y como herramienta para medir la percepción fina de otros modelos compatibles.
- Investigación en RL para visión-lenguaje: el conjunto ZoomGain-RL-Data (9.000 registros, 7.713 imágenes) y el pipeline de tres etapas permiten reproducir y extender el entrenamiento con EasyR1.

## Benchmarks y rendimiento

La model card indica que, en el artículo, el mejor de 28 modelos evaluados alcanzó 61,08 en ZoomGainBench, y que ZoomGain-9B logra un rendimiento superior en múltiples benchmarks de percepción fina y percepción general. Sin embargo, la información proporcionada no incluye la tabla numérica completa de resultados por benchmark (MMLU, HumanEval, GSM8K u otros), por lo que no se presentan cifras concretas más allá de ese 61,08 agregado del mejor modelo.

| Benchmark | Resultado |
|---|---|
| ZoomGainBench (mejor de 28 modelos) | 61,08 |
| ZoomGainBench (ZoomGain-9B) | No disponible en la información proporcionada |
| Percepción fina y general (varios) | "Rendimiento superior" según la model card, sin cifras |

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en safetensors (18,8 GB en fp16/bf16), se requieren al menos ~19 GB de VRAM para pesos en precisión completa; en cuantización de 8 bits, ~10 GB; en 4 bits, ~5-6 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en fp16; una RTX 4090 (24 GB) es suficiente para fp16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con margen limitado, y en GPUs de 12-16 GB con cuantización de 8 o 4 bits, siempre que el codificador visual y el contexto lo permitan.
- Opciones de despliegue: el repositorio oficial usa vLLM 0.19.1 y transformers 5.7.0 para evaluación; no se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZoomGain-9B | 9,4 B | No disponible | Percepción visual de grano fino (RL) | No disponible | Hugging Face (inclusionAI) |
| ZoomGain-4B | ~4 B (no confirmado) | No disponible | Percepción visual de grano fino (RL) | No disponible | Hugging Face (inclusionAI) |
| Qwen3.5-9B (base) | ~9 B (no confirmado) | No disponible | VLM de propósito general | No disponible | No confirmada en la información |
| Qwen3.5-4B (base) | ~4 B (no confirmado) | No disponible | VLM de propósito general | No disponible | No confirmada en la información |

La información disponible solo permite comparar con la variante ZoomGain-4B del mismo autor y con las bases Qwen3.5-4B/9B mencionadas en el artículo. No se dispone de datos de benchmarks comparativos numéricos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre datos derivados de recortes y descripciones generadas por modelos, puede heredar sesgos de esos modelos.
- Riesgo de alucinación: presente como en cualquier VLM; el pipeline de verificación de respuestas mitiga ambigüedades en los datos de entrenamiento, pero no elimina el riesgo en producción.
- Limitaciones de contexto o idioma: solo se confirman inglés y chino en el benchmark; no hay lista oficial de idiomas ni longitud de contexto publicada.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; es imprescindible verificarla antes de desplegar.
- Caveats para producción: el modelo está optimizado para percepción fina y puede no igualar a VLM generalistas en tareas de razonamiento abstracto o código; el script de evaluación desactiva el modo thinking por defecto, lo que conviene replicar para resultados comparables.
- Dependencia de versiones: la evaluación oficial requiere vLLM 0.19.1 y transformers 5.7.0, versiones concretas que pueden limitar la integración con stacks existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/ZoomGain-9B
- Modelo ZoomGain-4B: https://huggingface.co/inclusionAI/ZoomGain-4B
- Artículo arXiv: https://arxiv.org/abs/2611.14076
- Versión HTML del artículo: https://arxiv.org/html/2611.14076v1
- Repositorio GitHub: https://github.com/inclusionAI/ZoomGain
- Benchmark ZoomGainBench: https://huggingface.co/datasets/inclusionAI/ZoomGainBench
- Datos de RL ZoomGain: https://huggingface.co/datasets/inclusionAI/ZoomGain-RL-Data
- Guía de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
