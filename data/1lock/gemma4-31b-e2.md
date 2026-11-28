# 1lock/gemma4-31b-e2

## Resumen

`1lock/gemma4-31b-e2` es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario 1lock. Se trata de un derivado afinado (finetune) del modelo `MachinePulseAI/karpo-decision-31B`, según declara la propia model card, y se distribuye bajo licencia Apache 2.0. El repositorio pesa 62,6 GB y contiene pesos en formato safetensors compatibles con la librería transformers, además de estar marcado como compatible con endpoints.

El modelo cuenta con 31.273.088.876 parámetros totales (aproximadamente 31,3 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande. La nomenclatura "gemma4" en las etiquetas sugiere una vinculación con la familia Gemma de Google, aunque no se dispone de confirmación explícita en la información proporcionada. La pipeline declarada es image-text-to-text, lo que indica capacidad de procesar imágenes junto con texto.

La relevancia de este modelo es limitada por el momento: no registra descargas ni likes, y la información pública es muy escasa. No se detallan datos de entrenamiento, benchmarks ni idiomas soportados. Es un modelo de reciente creación (noviembre de 2026) y su interés principal radica en ser un derivado multimodal de un modelo base de 31B, pero cualquier evaluación rigurosa requiere información adicional no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "gemma4"; presumiblemente transformer multimodal, sin confirmar) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no mencionadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Las etiquetas incluyen "gemma4" e "image-text-to-text", lo que apunta a un modelo multimodal capaz de procesar entradas de imagen y texto, probablemente basado en una arquitectura transformer con un codificador visual. Sin embargo, la model card no especifica la arquitectura exacta, el número de capas, la dimensión de los embeddings ni el mecanismo de atención.

Respecto al entrenamiento, la información es mínima: se trata de un finetune del modelo `MachinePulseAI/karpo-decision-31B`, según el campo `base_model`. No se indican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instruction tuning. La model card únicamente incluye un aviso indicando que es un derivado modificado distribuido bajo la licencia upstream. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Procesamiento multimodal image-text-to-text: el modelo está etiquetado para recibir imágenes y texto, lo que sugiere capacidad de describir imágenes, responder preguntas sobre contenido visual o realizar tareas de razonamiento visual.
- Generación de texto conversacional: la etiqueta "conversational" indica que está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: marcado como `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Capacidades de razonamiento, código y matemáticas: no confirmadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Descripción automática de imágenes: el modelo puede recibir una imagen y generar una descripción textual, útil para accesibilidad, catalogación de imágenes o generación de metadatos en plataformas de contenido.
- Respuesta a preguntas sobre documentos visuales: al combinar entrada de imagen y texto, podría emplearse para extraer información de capturas, diagramas o documentos escaneados en flujos de atención al cliente.
- Asistentes conversacionales multimodales: su etiqueta "conversational" permite integrarlo en interfaces de chat donde el usuario adjunta imágenes y espera respuestas contextuales.
- Moderación de contenido visual: podría emplearse para clasificar o describir imágenes en pipelines de revisión, aunque sin benchmarks publicados no hay garantías de precisión.
- Prototipado de investigación en modelos multimodales: al ser un derivado de 31B con licencia Apache 2.0, sirve como base para experimentación académica en visión-lenguaje.
- Despliegue en endpoints gestionados: su compatibilidad con endpoints permite integrarlo en servicios de inferencia sin gestionar infraestructura propia, adecuado para pruebas de concepto.
- Fine-tuning adicional: al ser un modelo abierto con licencia permisiva, puede servir como punto de partida para ajustes específicos de dominio, siempre que se valide su calidad base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 62,5 GB solo para los pesos (31,3B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en GPUs consumer de gama alta (RTX 4090 de 24 GB), aunque no se han publicado cuantizaciones oficiales.
- GPUs recomendadas: A100 80GB, H100 80GB para precisión completa; A6000, L40S o A100 40GB para cuantizaciones de 8 bits.
- Cabe en GPU consumer: posiblemente en RTX 4090 (24 GB) con cuantización de 4 bits, aunque la componente visual añade overhead no cuantificado.
- Opciones de despliegue: transformers (soporte nativo declarado), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están confirmados para este modelo concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| 1lock/gemma4-31b-e2 | 31,3B | no disponible | Apache 2.0 | Si (image-text-to-text) | Hugging Face |
| MachinePulseAI/karpo-decision-31B (modelo base) | 31B (aproximado) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la familia Gemma (p. ej. Gemma 2 27B) | ~27B | no disponible en esta ficha | Gemma license | No (solo texto, segun version) | Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas. La comparativa se limita a parámetros y licencia. No se conocen otros derivados directos del mismo modelo base.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta datos de entrenamiento, evaluación ni limitaciones, lo que impide garantizar su comportamiento en producción.
- Riesgo de alucinación: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad de sus respuestas, especialmente en tareas de razonamiento o contenido visual.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Idiomas no especificados: se desconoce qué lenguas soporta con calidad; no se debe asumir buen rendimiento en castellano sin validación previa.
- Contexto desconocido: la longitud de contexto no está documentada, lo que limita el diseño de aplicaciones que dependan de ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el aviso de la model card indica que es un derivado modificado del modelo upstream, por lo que conviene verificar las obligaciones de atribución y las condiciones del modelo base `MachinePulseAI/karpo-decision-31B`.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF, AWQ o GPTQ, lo que dificulta el despliegue en hardware limitado.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado su funcionamiento.
- Posible inestabilidad del finetune: al ser un derivado de un modelo base poco documentado, el proceso de ajuste podría haber degradado capacidades del original; no hay evidencia en contrario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1lock/gemma4-31b-e2
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
