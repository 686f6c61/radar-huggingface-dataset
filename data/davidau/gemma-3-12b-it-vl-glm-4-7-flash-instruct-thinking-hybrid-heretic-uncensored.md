# DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-INSTRUCT-Thinking-Hybrid-Heretic-Uncensored

## Resumen

Este modelo es un fine-tune no oficial de Gemma 3 12B IT desarrollado por DavidAU, un creador conocido en Hugging Face por publicar variantes "uncensored" y "abliterated" de modelos populares. Parte del checkpoint DreamFast/gemma-3-12b-it-heretic, al que se le ha aplicado un proceso de eliminación de rechazos (abliteration) mediante la herramienta Heretic, y posteriormente se ha entrenado con el dataset de razonamiento TeichAI/glm-4.7-2000x usando Unsloth sobre hardware local.

El resultado es un modelo multimodal (image-text-to-text) de aproximadamente 13.200 millones de parámetros, con una ventana de contexto de 128.000 tokens y capacidad de alternar entre modo instruct y modo "thinking" en función de las palabras clave del prompt o de la plantilla Jinja empleada. La particularidad técnica declarada por el autor es que el tensor de salida (head) se ha separado del embedding y se ha entrenado de forma independiente, lo que incrementa el número de parámetros respecto al Gemma 3 12B original y, según el autor, mejora la calidad de las cuantizaciones.

Es relevante ahora porque combina tres tendencias activas en la comunidad open source: la eliminación de alineación de seguridad (abliteration), el entrenamiento de razonamiento destilado a partir de modelos mayores (GLM 4.7) y los fine-tunes orientados a escritura creativa sin restricciones. No obstante, se trata de un modelo de nicho con muy poca tracción (62 descargas, 4 likes en el momento de la consulta) y sin validación independiente más allá de los benchmarks declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con tensor de salida separado del embedding |
| Parametros totales | 13.194.203.760 (~13,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (declarado por el autor) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16; el autor menciona que las cuantizaciones generales mejoran por el head separado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B IT de Google, un transformer decoder-only multimodal que procesa imágenes y texto (pipeline image-text-to-text). Sobre esa base, el autor aplicó primero un proceso de abliteration mediante Heretic sobre el checkpoint DreamFast/gemma-3-12b-it-heretic, y después un fine-tune con Unsloth en hardware local (Linux) usando el dataset TeichAI/glm-4.7-2000x, compuesto por trazas de razonamiento generadas por GLM 4.7. El autor describe el método como "HI16 training".

La innovación técnica declarada consiste en separar manualmente el tensor de salida (head) del tensor de embedding y entrenarlo de forma independiente, lo que eleva el recuento de parámetros de ~12 B a ~13,2 B. Según el autor, esto otorga más "bits" efectivos al tensor de salida en las cuantizaciones y mejora el rendimiento general de las mismas. El modelo incorpora además una plantilla Jinja alternativa (`chat-template-thinking.jinja`) que fuerza el modo de razonamiento, y responde a la palabra clave "think deeply:" para activarlo de forma ad hoc. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable por prompt, por palabra clave o por plantilla Jinja.
- Procesamiento de imágenes (image-text-to-text), con razonamiento que, según el autor, también mejora el tratamiento de imágenes.
- Escritura creativa y de ficción: el modelo está etiquetado y orientado a narrativa, generación de tramas, subtramas, continuación de escenas y todos los géneros (ciencia ficción, romance, etc.).
- Generación de contenido sin rechazos (uncensored/abliterated): el autor reporta 7 rechazos de cada 100 frente a 98 de cada 100 del Gemma 3 12B IT original.
- Conversación multi-turno con contexto largo (hasta 128k tokens declarados).
- Estabilidad de temperatura amplia (rango declarado de 0,1 a 2,5) con razonamiento estable frente a cambios de temperatura.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada más allá del modo thinking.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de audio: no disponible.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede mantener coherencia en novelas o relatos extensos gracias a los 128k tokens de contexto y a su entrenamiento específico en generación de tramas, subtramas y continuación de escenas.
- Generación de guiones y diálogos para videojuegos o series: la alternancia entre modo instruct y thinking permite producir borradores rápidos o desarrollos argumentales más elaborados según la necesidad del pipeline.
- Descripción y análisis de imágenes con razonamiento: al ser multimodal, puede recibir una imagen y generar descripciones detalladas o inferencias narrativas a partir de ella, útil en herramientas de accesibilidad o catalogación de contenido visual.
- Prototipado de asistentes conversacionales sin filtros: para investigación sobre comportamiento de modelos sin alineación de seguridad, análisis de sesgos o estudios de robustez frente a prompts adversarios.
- Generación de contenido creativo para marketing y entretenimiento: redacción de relatos de marca, campañas narrativas o contenido de ficción para plataformas de ocio, donde el modelo evita rechazos por temática sensible.
- Experimentación académica con técnicas de abliteration y destilación de razonamiento: sirve como caso de estudio reproducible de cómo un fine-tune sobre un dataset de reasoning (GLM 4.7) afecta a benchmarks de sentido común.
- Generación de código: no disponible como capacidad declarada; el modelo no está etiquetado para programación y no se han publicado resultados en HumanEval ni similares.

## Benchmarks y rendimiento

Resultados declarados por el autor (formato de la model card, sin normalizar):

| Benchmark | Este modelo | Base heretic (DreamFast) |
|---|---|---|
| ARC Challenge | 0,557 | 0,534 |
| ARC Easy | 0,744 | 0,699 |
| BoolQ | 0,872 | 0,872 |
| HellaSwag | 0,722 | 0,603 |
| OpenBookQA | 0,448 | 0,448 |
| PIQA | 0,784 | 0,733 |
| Winogrande | 0,710 | 0,658 |

Métricas de des-censura declaradas:

| Métrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0,0826 | 0 (por definición) |
| Rechazos | 7/100 | 98/100 |

No se han publicado resultados de MMLU, GSM8K, HumanEval ni benchmarks multimodales (MMMU, DocVQA) en la información disponible. Los datos anteriores proceden exclusivamente del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 26-27 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32 GB de VRAM para contexto moderado y bastante más para explotar los 128k tokens.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para bf16. Para cuantizaciones de 8 bits, una RTX 4090 24 GB o RTX 3090 24 GB puede ser suficiente con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización a 8 bits o inferior y contexto limitado; en 4 bits cabría en GPUs de 16 GB con contexto corto, aunque el autor no publica GGUF oficiales en la información disponible.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados en la información disponible, aunque al ser un modelo Gemma 3 es probable que funcionen con las herramientas habituales para esa familia.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Rechazos (declarado) |
|---|---|---|---|---|---|
| Este modelo (DavidAU) | ~13,2 B | 128k | Sí | Apache 2.0 | 7/100 |
| DreamFast/gemma-3-12b-it-heretic | ~12 B | 128k | Sí | Apache 2.0 | no disponible |
| google/gemma-3-12b-it | ~12 B | 128k | Sí | Gemma Terms of Use | 98/100 |
| DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Polaris-Thinking-Heretic-Uncensored | ~13 B (probable) | 128k | Sí | Apache 2.0 | no disponible |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de benchmarks verificables frente a modelos de otros autores. El modelo se posiciona como una versión con razonamiento destilado y mayor tasa de cumplimiento de prompts que su base heretic, a costa de un incremento de parámetros y de un entrenamiento adicional no auditado.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": elimina deliberadamente los mecanismos de rechazo, lo que implica riesgo de generar contenido dañino, ofensivo o ilegal si se usa sin salvaguardas externas. No es apto para aplicaciones de cara al público sin una capa de moderación.
- El autor reconoce que, pese a no rechazar, el modelo puede producir contenido "blando" por defecto y necesita instrucciones explícitas (por ejemplo, incluir las palabras malsonantes deseadas) para alcanzar el nivel gráfico esperado.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; el entrenamiento con trazas de razonamiento sintéticas puede incrementar la confianza en afirmaciones incorrectas.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea inferior al del Gemma 3 original.
- Contexto: los 128k tokens son un dato declarado por el autor, sin verificación independiente de la degradación de calidad en contextos largos.
- Licencia Apache 2.0 declarada, pero al derivar de Gemma 3 conviene verificar la compatibilidad con los términos de uso de Gemma antes de un despliegue comercial.
- Tracción muy baja (62 descargas, 4 likes) y benchmarks únicamente aportados por el autor: no hay validación de terceros.
- El proceso de abliteration conlleva una divergencia KL de 0,0826 respecto al modelo original, lo que indica una alteración medible de la distribución de salida que puede afectar a tareas distintas de las evaluadas.
- No se especifican datos sobre sesgos demográficos, toxicidad medida ni robustez frente a jailbreaks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-INSTRUCT-Thinking-Hybrid-Heretic-Uncensored
- Modelo base: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo original: https://huggingface.co/google/gemma-3-12b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Variante Polaris del mismo autor: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Polaris-Thinking-Heretic-Uncensored
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
