# oxpuppy635/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2

## Resumen

Este modelo es una variante "decensored" o "abliterated" del checkpoint QAT (Quantization-Aware Training) de Gemma 4 26B A4B en su formato Q4_0 sin cuantizar, publicado por Google DeepMind. El autor, oxpuppy635, ha aplicado la herramienta Heretic v2.0.0.dev0+custom para eliminar el alineamiento de seguridad del modelo base mediante técnicas de abliteration (proyección de direcciones de rechazo en el espacio de activaciones). El resultado es un modelo multimodal imagen-texto que, según la model card, reduce las negativas de 100/100 a 0/100 en una batería de 100 prompts de prueba, con una divergencia KL de 0.0101 respecto al original.

El modelo base pertenece a la familia Gemma 4, que incluye arquitecturas densas y Mixture-of-Experts (MoE) con ventana de contexto de hasta 256K tokens y soporte para más de 140 idiomas. Esta variante concreta corresponde al tamaño 26B A4B, que emplea arquitectura MoE con aproximadamente 4B parámetros activos, y conserva las capacidades multimodales (texto e imagen) del original. El checkpoint QAT Q4_0 sin cuantizar está pensado para investigación y compilación personalizada, no para despliegue directo en producción.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de estudio de abliteration sobre un modelo QAT de última generación; por otro, advierte de que se trata de un modelo sin alineamiento de seguridad, orientado exclusivamente a investigación, red-teaming y estudios de alineamiento, y no apto para servicios públicos o de cara al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal imagen-texto |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | ~4B (variante A4B) |
| Longitud de contexto | Hasta 256K tokens (según familia Gemma 4) |
| Tipos de cuantizacion | Checkpoint QAT Q4_0 sin cuantizar (pesos half-precision extraídos del pipeline QAT); cuantizaciones GGUF Q4_0 y compressed-tensors w4a16 disponibles para la familia |
| Idiomas soportados | Más de 140 idiomas (según familia Gemma 4); no se detalla lista específica para esta variante |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Mixture-of-Experts con 25,8B parámetros totales y aproximadamente 4B activos por token, lo que permite un equilibrio entre capacidad y coste computacional. Es multimodal: acepta entrada de texto e imagen y genera texto; en los tamaños E2B, E4B y 12B de la familia se añade soporte de audio, pero no se confirma para esta variante de 26B A4B. El contexto alcanza los 256K tokens y el entrenamiento incluye soporte multilingüe en más de 140 idiomas.

El checkpoint original fue sometido a Quantization-Aware Training (QAT) con esquema Q4_0, de modo que los pesos en half-precision extraídos del pipeline QAT preservan una calidad cercana a bfloat16 con menor huella de memoria. Sobre esta base, el autor aplicó Heretic v2.0.0.dev0+custom con parámetros de abliteration documentados: capas 12 a 20, transporte gaussiano, rango de transporte 4, LoRA de rango 128, regularización ridge 1e-06, regularización de entropía 0.1, componentes objetivo attn.o_proj y mlp.down_proj, y pesos de preservación de comportamiento bueno 1.0 frente a peso de dirección de mal comportamiento 0.0001. No se documentan datos de RLHF o DPO específicos para esta variante más allá del alineamiento heredado del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento configurable (thinking mode) según la familia Gemma 4.
- Procesamiento multimodal imagen-texto: descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación y análisis de código, además de tareas matemáticas.
- Soporte multilingüe en más de 140 idiomas.
- Conversación multi-turno con ventana de contexto de hasta 256K tokens.
- Compatibilidad con decodificación especulativa mediante modelos assistant (drafter), requiriendo que el assistant sea también un checkpoint QAT de la misma precisión.
- Al no tener alineamiento de seguridad, genera contenido que el modelo base rechazaría, incluyendo material potencialmente dañino, sesgado u ofensivo.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Investigación en seguridad y alineamiento: el modelo sirve para estudiar cómo la abliteration afecta a las representaciones internas de rechazo, comparando activaciones entre capas 12 y 20 con el modelo original y midiendo la divergencia KL (0.0101 documentada).
- Red-teaming de sistemas de moderación: se puede emplear para generar prompts adversarios y evaluar la robustez de filtros de contenido y clasificadores de seguridad en pipelines de producción.
- Estudio de técnicas de abliteration: los parámetros publicados (transporte gaussiano, LoRA rango 128, componentes attn.o_proj y mlp.down_proj) permiten reproducir y comparar variantes con distintas configuraciones de Heretic.
- Evaluación de degradación por QAT: al ser un checkpoint QAT Q4_0 sin cuantizar, permite analizar la pérdida de calidad frente a bfloat16 en tareas de razonamiento y generación de código.
- Análisis de sesgos y toxicidad: útil para medir la amplificación de sesgos tras eliminar el alineamiento, comparando distribuciones de salida con el modelo base en corpus controlados.
- Experimentación con modelos MoE multimodales: investigar el comportamiento de los 4B parámetros activos en tareas de imagen-texto y su sensibilidad a la modificación de componentes de atención y MLP.
- Docencia y divulgación sobre seguridad en IA: demostraciones controladas de los riesgos de desplegar modelos sin alineamiento, siempre en entornos aislados y con supervisión humana.

## Benchmarks y rendimiento

La model card solo reporta métricas de abliteration, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.):

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Negativas (refusals) | 0/100 | 100/100 |
| Divergencia KL | 0.0101 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos half-precision de ~25,8B parámetros, la carga completa requiere del orden de 51,6 GB (tamaño del repo), por lo que se necesita al menos una GPU de 80 GB (A100, H100) o varias GPUs con paralelismo de tensor.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (2× RTX 4090 24GB con paralelismo) para los pesos sin cuantizar.
- No cabe en una GPU de consumo individual en formato sin cuantizar; las versiones GGUF Q4_0 de la familia sí podrían caber en GPUs de 24 GB, aunque esta variante concreta se distribuye en safetensors.
- Opciones de despliegue: transformers (librería declarada), vLLM para los checkpoints compressed-tensors w4a16 de la familia, llama.cpp/Ollama para los GGUF Q4_0 de la familia. Para esta variante concreta solo se confirma compatibilidad con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Alineamiento |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 26B A4B abliterated) | 25,8B totales / ~4B activos | 256K | Sí (imagen-texto) | Apache 2.0 | Eliminado (0/100 negativas) |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,8B totales / ~4B activos | 256K | Sí (imagen-texto) | Apache 2.0 | Estándar (100/100 negativas) |
| Gemma 4 12B (familia) | 12B | 256K | Sí (imagen, audio, texto) | Apache 2.0 | Estándar |
| Gemma 4 31B (familia) | 31B | 256K | Sí (imagen-texto) | Apache 2.0 | Estándar |

No se dispone de datos de benchmarks de capacidad para comparar rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sufrido una reducción sustancial de su alineamiento de seguridad: es más probable que genere contenido dañino, inexacto, sesgado u ofensivo que el modelo estándar.
- Uso previsto exclusivamente para investigación y experimentación (seguridad, alineamiento, red-teaming); el autor desaconseja su despliegue en servicios públicos o de cara al usuario final.
- Riesgo elevado de alucinación y de afirmaciones no verificadas; todas las salidas deben tratarse como no confiables y verificarse de forma independiente.
- La licencia Apache 2.0 se acompaña de un enlace a la licencia de Gemma 4 de Google, por lo que conviene revisar las condiciones específicas de uso comercial del modelo base antes de cualquier explotación.
- El checkpoint es QAT Q4_0 sin cuantizar, pensado para compilación personalizada e investigación; no es un artefacto listo para producción y puede requerir pasos adicionales de empaquetado.
- Si se usa decodificación especulativa con un modelo assistant, este debe ser también un checkpoint QAT de la misma precisión para garantizar compatibilidad.
- No se detalla la lista exacta de idiomas soportados ni el soporte de tool calling en esta variante concreta.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxpuppy635/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT para Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Proyecto Heretic: https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w
