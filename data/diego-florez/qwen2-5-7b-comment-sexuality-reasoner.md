# diego-florez/Qwen2.5-7B-Comment-Sexuality-Reasoner

## Resumen

`Qwen2.5-7B-Comment-Sexuality-Reasoner` es un modelo de lenguaje fine‑tuneado a partir de `Qwen/Qwen2.5-7B-Instruct` para la clasificación contextual de comentarios en redes sociales en español. Desarrollado por `diego-florez`, el modelo no solo asigna una etiqueta (`non-sexualized`, `sexualized` o `neutral`) a cada comentario, sino que además genera un razonamiento en español y probabilidades para las tres clases. La tarea es sensible al contexto: el modelo recibe una descripción textual de la imagen asociada, el tema, el autor y su género (si está disponible), lo que permite evaluar la intención del comentario más allá de las palabras individuales.

El modelo se entrenó mediante fine‑tuning eficiente con DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el framework Unsloth, en dos fases, con un dataset curado específico para esta tarea. Con 7.615.616.512 parámetros (7,6B), el modelo se distribuye en formato `safetensors` y está pensado para inferencia con vLLM. Su licencia Apache 2.0 permite uso comercial, aunque el autor lo presenta como un modelo de investigación, no como un sistema de moderación listo para producción.

La relevancia de este modelo radica en su enfoque contextual y razonado para la detección de sexualización en comentarios, un problema complejo en moderación de contenido. Al compararse con `Qwen2.5-32B-Instruct` en un conjunto de evaluación de 448 comentarios, alcanza una accuracy de 70,54% y un Macro F1 de 70,53%, superando al modelo de 32B en precisión y con una inferencia mucho más rápida (35 segundos frente a 4 minutos 30 segundos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder‑only (arquitectura Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B-Instruct soporta 128K tokens) |
| Tipos de cuantizacion | No especificados; el repo indica pesos guardados en 16‑bit (FP16) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-7B-Instruct`, un transformer decoder‑only con atención causal y mecanismos estándar de Qwen2.5 (incluyendo RoPE, SwiGLU y normalización RMSNorm). Sobre esta base se aplicó fine‑tuning eficiente con DoRA (Weight‑Decomposed Low‑Rank Adaptation), que descompone las actualizaciones de pesos en una parte de baja dimensión y una parte de escala, mejorando la estabilidad del entrenamiento frente a LoRA convencional. El entrenamiento se realizó con el framework Unsloth, conocido por optimizar el uso de memoria y velocidad en fine‑tuning.

El proceso de entrenamiento se dividió en dos fases. La segunda fase se centró en mejorar el comportamiento de razonamiento deseado usando un dataset curado y etiquetado. Los datos de entrenamiento incluyen descripciones de imágenes, temas, texto de comentarios, metadatos del autor, anotaciones y ejemplos de razonamiento. El objetivo no era solo aprender la clasificación en tres clases, sino también un estilo de razonamiento que considerase explícitamente el comentario, el contexto de la imagen, el tema y el contexto del autor. El modelo final se fusionó con el modelo base y se guardó en formato de 16 bits para inferencia.

No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se indica si se aplicaron técnicas de RLHF o DPO; la model card solo menciona fine‑tuning supervisado con DoRA.

## Capacidades

- Clasificación de comentarios en español en tres categorías: `non-sexualized`, `sexualized` y `neutral`.
- Generación de un razonamiento en español que justifica la clasificación, considerando el contexto de la imagen, el tema y el autor.
- Salida de probabilidades para las tres clases, diseñadas para sumar 1.00, lo que permite análisis de calibración.
- Procesamiento de múltiples comentarios de un mismo autor sobre una misma imagen, agrupados por `image_id + comment_author`, para aprovechar contexto adicional.
- Análisis contextual: evalúa la intención del comentario en relación con la descripción de la imagen y el tema, no solo palabras sueltas.
- Capacidad de razonamiento multi‑paso implícito al considerar varios elementos de entrada (imagen, tema, autor, género).
- Inferencia eficiente con vLLM, con tiempos notablemente menores que modelos de mayor tamaño (35 segundos para 448 muestras).

## Casos de uso

- Investigación académica sobre moderación de contenido: el modelo permite estudiar cómo los LLM razonan sobre comentarios sexualizados en redes sociales, analizando el razonamiento generado y las probabilidades asociadas.
- Anotación de datasets: puede utilizarse como herramienta de etiquetado débil o semisupervisado para clasificar grandes volúmenes de comentarios en español, reduciendo el esfuerzo manual.
- Análisis de sesgos en moderación: al comparar las predicciones y razonamientos del modelo con anotaciones humanas, se pueden identificar sesgos de género o de contexto en la detección de sexualización.
- Prototipado de sistemas de moderación asistida: aunque no es un sistema de producción, puede integrarse en pipelines experimentales donde un humano revisa las clasificaciones y razonamientos generados.
- Evaluación comparativa de modelos de razonamiento: sirve como punto de referencia para medir la calidad del razonamiento contextual en tareas de clasificación de comentarios, frente a modelos más grandes como Qwen2.5-32B-Instruct.
- Desarrollo de herramientas de análisis de redes sociales: investigadores y analistas pueden emplearlo para estudiar patrones de comentarios sexualizados en plataformas, con contexto de imagen y autor, en español.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en un conjunto de evaluación propio (gold dataset) de 448 comentarios, comparando con `Qwen2.5-32B-Instruct` bajo la misma configuración de tarea:

| Metrica | Qwen2.5-32B-Instruct | Qwen2.5-7B-Comment-Sexuality-Reasoner |
|---|---|---|
| Accuracy | 42,19% | **70,54%** |
| Macro F1 | 49,24% | **70,53%** |
| Tiempo de inferencia (448 muestras) | 4m 30s | **35s** |
| Reasoning TTR | **0,859** | 0,822 |

El benchmark es específico de la tarea de clasificación de sexualización en comentarios y no debe interpretarse como un benchmark general de LLM. El modelo supera claramente al de 32B en precisión y velocidad, aunque el TTR (probablemente una métrica de similitud del razonamiento con el de referencia) es ligeramente inferior. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con pesos en FP16 (15,2 GB), se necesitan al menos 16 GB de VRAM para inferencia básica; se recomienda 24 GB para mayor margen.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40 GB o 80 GB), H100 (80 GB) o similares. Una RTX 3090 (24 GB) también sería suficiente.
- Cabe en GPUs de consumo: sí, una RTX 4090 o RTX 3090 con 24 GB puede ejecutar el modelo en FP16 sin cuantización. Con cuantización GGUF (no proporcionada oficialmente) podría caber en GPUs de 12 GB, pero no se ofrecen dichos archivos.
- Opciones de despliegue: el autor menciona vLLM como framework de inferencia; también es compatible con transformers estándar y puede usarse con text-generation-inference (según tags). No se proporcionan archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: en el benchmark, el modelo procesa 448 muestras en 35 segundos, lo que equivale a aproximadamente 12,8 muestras por segundo en una GPU no especificada (probablemente una GPU de gama alta). Para despliegues reales, vLLM puede ofrecer throughput superior con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen2.5-7B-Comment-Sexuality-Reasoner | 7,6B | No disponible (base 128K) | Apache 2.0 | Clasificacion de sexualizacion en comentarios (español) |
| Qwen2.5-7B-Instruct (base) | 7,6B | 128K | Apache 2.0 | Modelo general de instrucciones, sin fine‑tuning específico |
| Qwen2.5-32B-Instruct | 32B | 128K | Apache 2.0 | Modelo general de instrucciones, usado como comparativa en la evaluación |

El modelo fine‑tuneado supera al base y al de 32B en la tarea específica, pero carece de las capacidades generales de razonamiento y generación del modelo base. No hay otros modelos comparables con la misma especialización en detección de sexualización contextual en español disponibles públicamente.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no es un sistema de moderación listo para producción; su uso en entornos reales requiere validación adicional.
- Sesgos potenciales: al entrenarse con datos de comentarios y metadatos de género, puede heredar sesgos de género, culturales o contextuales presentes en los datos de entrenamiento.
- Riesgo de alucinación en el razonamiento: el razonamiento generado puede ser plausible pero incorrecto, especialmente en casos ambiguos o con contexto insuficiente.
- Dependencia del contexto: la clasificación depende críticamente de la calidad de la descripción de la imagen y del tema; si estos son erróneos o incompletos, las predicciones pueden degradarse.
- Limitación de idioma: solo está entrenado para español; no es adecuado para comentarios en otros idiomas.
- Probabilidades no calibradas: aunque las probabilidades suman 1.00, no se ha verificado su calibración; pueden no reflejar la verdadera incertidumbre.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF o GPTQ, lo que limita su despliegue en entornos con poca VRAM.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el autor recomienda limitarlo a fines de investigación y anotación, no a moderación automática sin supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diego-florez/Qwen2.5-7B-Comment-Sexuality-Reasoner
- Modelo base (Qwen2.5-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe técnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Blog de Qwen sobre Qwen2.5: https://qwen.ai/blog?id=qwen2.5
