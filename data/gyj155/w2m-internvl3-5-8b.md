# Gyj155/W2M-InternVL3.5-8B

## Resumen

W2M-InternVL3.5-8B es un modelo multimodal de segmentación de imágenes desarrollado por el usuario Gyj155, construido mediante fine-tuning del backbone OpenGVLab/InternVL3_5-8B. Combina un modelo de visión-lenguaje de 8.568 millones de parámetros con un decodificador de segmentación condicionado por lenguaje, lo que permite generar máscaras de segmentación a partir de instrucciones en lenguaje natural y diálogo visual.

El modelo está entrenado sobre 768.000 registros multimodales orientados a tres tareas: segmentación referencial (referring segmentation), diálogo con fundamento visual (grounded dialogue) y respuesta visual a preguntas (VQA). Su pipeline declarado en Hugging Face es image-segmentation, lo que lo sitúa en la categoría de modelos de comprensión y localización visual más que en la de generación pura de texto.

Es relevante por su enfoque de "W2M" (word-to-mask), que unifica la comprensión del lenguaje con la producción de máscaras de píxeles, una tarea que tradicionalmente requería pipelines separados de detección y segmentación. El modelo se publica con pesos en formato safetensors y un tamaño de repositorio de 18,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con decodificador de segmentación condicionado por lenguaje, sobre backbone InternVL3_5-8B |
| Parámetros totales | 8.568.823.809 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del backbone OpenGVLab/InternVL3_5-8B, un modelo de visión-lenguaje de la familia InternVL 3.5, y le añade un decodificador de segmentación condicionado por lenguaje. Esta combinación permite que el modelo reciba una imagen y una instrucción textual (por ejemplo, una referencia a un objeto) y produzca una máscara de segmentación del objeto referido, además de mantener las capacidades conversacionales y de VQA del backbone original.

El entrenamiento se realizó sobre 768.000 registros multimodales, según la model card del autor. No se especifican en la información disponible detalles sobre la composición exacta del dataset, el número de tokens de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. La model card únicamente indica que el entrenamiento cubre segmentación referencial, diálogo con fundamento visual y VQA.

## Capacidades

- Segmentación referencial (referring segmentation): genera máscaras de píxeles a partir de descripciones textuales de objetos.
- Segmentación en diálogo multi-turno (multi-round): soporta conversaciones en las que la referencia a segmentar se refina a lo largo de varios turnos.
- Grounded dialogue: conversación visual con localización de los objetos mencionados.
- Respuesta visual a preguntas (VQA): evaluación reportada sobre el benchmark SEED.
- Comprensión multimodal imagen-lenguaje heredada del backbone InternVL3_5-8B.
- Capacidad de segmentación con referencias complejas evaluada en RefCOCO, RefCOCO+, RefCOCOg y gRefCOCO.
- Capacidad de segmentación de objetos guiada por lenguaje evaluada en GCG (AP50 y CIDEr).

No se dispone de información sobre soporte de tool calling, function calling, agentes o modo de razonamiento explícito (thinking mode) en la información proporcionada.

## Casos de uso

- Anotación automática de datasets de segmentación: el modelo puede generar máscaras iniciales a partir de descripciones textuales, reduciendo el coste de etiquetado manual en proyectos de visión por computador.
- Edición de imágenes asistida por lenguaje: un usuario describe el objeto a aislar y el modelo devuelve la máscara correspondiente, útil en herramientas de retoque y composición.
- Robótica e interacción humano-máquina: permitir que un operador señale verbalmente un objeto ("la taza roja junto a la ventana") y el sistema obtenga su máscara para manipulación o navegación.
- Análisis de imágenes médicas o industriales con referencias textuales: localización de regiones de interés descritas en lenguaje natural, siempre que el dominio esté cubierto por el entrenamiento.
- Asistentes visuales conversacionales: combinación de VQA y segmentación para responder preguntas sobre una imagen y señalar los objetos implicados en la respuesta.
- Moderación y análisis de contenido visual: localización de elementos descritos por políticas textuales para su revisión posterior.
- Sistemas de accesibilidad: descripción y localización de objetos para usuarios con discapacidad visual mediante instrucciones en lenguaje natural.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor (cIoU en validación para RefCOCO/RefCOCO+/RefCOCOg y multi-round; gIoU para gRefCOCO; AP50 y CIDEr para GCG; accuracy para SEED):

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-InternVL3.5-8B | 81,3 | 75,5 | 78,5 | 77,7 | 26,1 | 32,9 | — | 75,0 |
| W2M-InternVL3.5-2B | 80,2 | 73,5 | 76,6 | 76,8 | 27,9 | 36,0 | — | 73,4 |
| W2M-8B | 82,8 | 77,3 | 80,0 | 78,8 | 32,4 | 48,5 | 80,6 | 75,6 |
| W2M-2B | 81,2 | 74,2 | 77,7 | 76,8 | 31,8 | 44,6 | 78,5 | 73,0 |
| W2M-Sa2VA-InternVL3-8B | 83,4 | 78,3 | 81,2 | 78,6 | 35,0 | 50,3 | — | 75,2 |
| W2M-Qwen3-VL-2B | 81,9 | 75,6 | 79,5 | 77,1 | 31,8 | 44,6 | — | 74,2 |
| W2M-Qwen3-VL-8B | 82,9 | 78,0 | 80,8 | 79,0 | 32,3 | 44,8 | — | 77,0 |
| W2M-Qwen3.5-2B | 82,8 | 78,0 | 80,7 | 79,5 | 33,2 | 45,9 | — | 74,6 |
| W2M-Qwen3.5-9B | 83,7 | 80,3 | 81,7 | 80,0 | 34,4 | 50,2 | — | 78,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 17-18 GB solo para pesos, más overhead de activaciones y del decodificador de segmentación, por lo que se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16. Para GPUs con menos memoria sería necesaria cuantización, no documentada en la información disponible.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 ajustando el tamaño de lote; en GPUs de 16 GB o menos requeriría cuantización, cuyos formatos no están publicados.
- Opciones de despliegue: al ser un modelo multimodal con decodificador de segmentación personalizado, el despliegue estándar con vLLM, TGI o llama.cpp no está garantizado; se recomienda usar la implementación de referencia del autor (transformers con código personalizado) y verificar compatibilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | RefCOCO val cIoU | RefCOCOg val cIoU | GCG val AP50 | SEED accuracy | Licencia |
|---|---:|---:|---:|---:|---:|---|
| W2M-InternVL3.5-8B | 8.568 M | 81,3 | 78,5 | 26,1 | 75,0 | No disponible |
| W2M-8B | No disponible | 82,8 | 80,0 | 32,4 | 75,6 | No disponible |
| W2M-Qwen3-VL-8B | No disponible | 82,9 | 80,8 | 32,3 | 77,0 | No disponible |
| W2M-Qwen3.5-9B | No disponible | 83,7 | 81,7 | 34,4 | 78,4 | No disponible |

En la comparativa publicada por el autor, W2M-InternVL3.5-8B queda por debajo de las variantes W2M-8B, W2M-Qwen3-VL-8B y W2M-Qwen3.5-9B en la mayoría de métricas de segmentación y en SEED, aunque supera a W2M-InternVL3.5-2B. Destaca la caída en GCG (AP50 26,1 y CIDEr 32,9) frente a otros modelos de la misma familia.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia, lo que impide confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del backbone OpenGVLab/InternVL3_5-8B antes de cualquier despliegue en producción.
- No se especifican los idiomas soportados; el rendimiento en castellano o en idiomas distintos del inglés no está documentado.
- No se publican detalles sobre sesgos del dataset de entrenamiento ni sobre mitigaciones aplicadas.
- Riesgo de alucinación y de segmentaciones incorrectas en escenarios fuera de la distribución de entrenamiento (dominios médicos, industriales o imágenes sintéticas).
- El rendimiento en GCG es notablemente inferior al de otros modelos de la familia W2M, lo que sugiere menor robustez en tareas de segmentación guiada por lenguaje conversacional.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado y actualizado el mismo día (23 de noviembre de 2026), por lo que no existe validación comunitaria ni evidencia de uso en producción.
- Al incluir un decodificador de segmentación personalizado, puede requerir `trust_remote_code` y no ser compatible directamente con servidores de inferencia estándar.
- No hay información sobre latencia, throughput ni requisitos exactos de memoria en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-8B
- W2M-8B: https://huggingface.co/Gyj155/W2M-8B
- W2M-2B: https://huggingface.co/Gyj155/W2M-2B
- W2M-Sa2VA-InternVL3-8B: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- W2M-InternVL3.5-2B: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- W2M-Qwen3-VL-2B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- W2M-Qwen3.5-2B: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
- W2M-Qwen3.5-9B: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
