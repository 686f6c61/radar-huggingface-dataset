# Gyj155/W2M-Qwen3.5-2B

## Resumen

W2M-Qwen3.5-2B es un modelo multimodal de segmentación de imágenes condicionada por lenguaje, desarrollado por el usuario Gyj155. Combina el backbone de lenguaje Qwen3.5-2B con un decodificador de segmentación especializado, lo que le permite generar máscaras de segmentación a partir de referencias textuales ("referring segmentation"), además de mantener capacidades de diálogo visual y respuesta a preguntas sobre imágenes. Forma parte de la familia W2M, que incluye variantes de 2B, 8B y 9B construidas sobre distintos backbones (Qwen3-VL, InternVL3, InternVL3.5 y Qwen3.5).

El modelo cuenta con 2.251.633.473 parámetros totales (aproximadamente 2,25 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 5,7 GB. Fue entrenado sobre 768.000 registros multimodales orientados a segmentación referencial, diálogo fundamentado (grounded dialogue) y VQA visual. Su relevancia radica en que ofrece un rendimiento en tareas de segmentación referencial cercano al de modelos significativamente mayores de la misma familia, lo que lo hace atractivo para despliegues con recursos limitados.

La información pública disponible es escasa: el repositorio no declara licencia, idiomas soportados ni detalles sobre la longitud de contexto o los datos exactos de entrenamiento. La model card se limita a presentar la tabla comparativa de benchmarks de la familia W2M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: backbone de lenguaje Qwen3.5-2B + decodificador de segmentación condicionado por lenguaje (detalles de la arquitectura no disponibles) |
| Parametros totales | 2.251.633.473 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema multimodal en el que un backbone de lenguaje (Qwen3.5-2B) se acopla a un decodificador de segmentación condicionado por lenguaje. Este diseño permite tomar una instrucción o referencia textual y producir una máscara de segmentación sobre la imagen de entrada, además de sostener tareas de diálogo visual y VQA. No se dispone de información pública sobre el número exacto de capas, la dimensionalidad del backbone, el mecanismo de fusión visión-lenguaje ni la resolución de entrada de las imágenes.

Según la model card, el entrenamiento se realizó sobre 768.000 registros multimodales que cubren segmentación referencial, diálogo fundamentado y VQA visual. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Segmentación de imágenes condicionada por lenguaje (referring segmentation): genera máscaras a partir de descripciones textuales.
- Segmentación referencial en escenarios con múltiples objetos y referencias ambiguas (evaluada en gRefCOCO).
- Diálogo visual fundamentado (grounded dialogue): conversaciones multi-turno con localización de objetos (evaluado en GCG y en el conjunto "Multi-round").
- Respuesta a preguntas sobre imágenes (VQA), evaluada en SEED.
- Procesamiento conjunto de imagen y texto como entrada multimodal.
- Capacidades de generación de texto heredadas del backbone Qwen3.5-2B (no detalladas en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Anotación automática de datasets de visión: el modelo puede generar máscaras de segmentación a partir de descripciones textuales, acelerando el etiquetado de imágenes para entrenar otros modelos de detección o segmentación.
- Edición de imágenes asistida por lenguaje: integrado en herramientas de edición, permite seleccionar objetos mediante instrucciones en lenguaje natural ("selecciona el coche rojo de la izquierda") para aplicar recortes o filtros.
- Robótica y manipulación guiada por instrucciones: la segmentación referencial permite localizar objetos concretos en la escena a partir de órdenes verbales, útil en pipelines de percepción para brazos robóticos.
- Asistentes de accesibilidad visual: combinando VQA y segmentación, puede describir escenas y localizar objetos para usuarios con discapacidad visual.
- Análisis de imágenes médicas o industriales (con validación adicional): segmentación de regiones de interés descritas textualmente en flujos de inspección o diagnóstico asistido.
- Moderación y análisis de contenido visual: localización de elementos específicos en imágenes (logotipos, personas, objetos) para revisión automatizada.
- Sistemas de diálogo sobre imágenes: conversaciones multi-turno en las que el usuario pregunta por elementos de una imagen y el modelo responde localizándolos.

## Benchmarks y rendimiento

Resultados publicados en la model card (cIoU/gIoU, AP50, CIDEr y accuracy según la métrica):

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-8B | 82,8 | 77,3 | 80,0 | 78,8 | 32,4 | 48,5 | 80,6 | 75,6 |
| W2M-2B | 81,2 | 74,2 | 77,7 | 76,8 | 31,8 | 44,6 | 78,5 | 73,0 |
| W2M-Sa2VA-InternVL3-8B | 83,4 | 78,3 | 81,2 | 78,6 | 35,0 | 50,3 | — | 75,2 |
| W2M-InternVL3.5-2B | 80,2 | 73,5 | 76,6 | 76,8 | 27,9 | 36,0 | — | 73,4 |
| W2M-InternVL3.5-8B | 81,3 | 75,5 | 78,5 | 77,7 | 26,1 | 32,9 | — | 75,0 |
| W2M-Qwen3-VL-2B | 81,9 | 75,6 | 79,5 | 77,1 | 31,8 | 44,6 | — | 74,2 |
| W2M-Qwen3-VL-8B | 82,9 | 78,0 | 80,8 | 79,0 | 32,3 | 44,8 | — | 77,0 |
| W2M-Qwen3.5-2B | 82,8 | 78,0 | 80,7 | 79,5 | 33,2 | 45,9 | — | 74,6 |
| W2M-Qwen3.5-9B | 83,7 | 80,3 | 81,7 | 80,0 | 34,4 | 50,2 | — | 78,4 |

W2M-Qwen3.5-2B supera en RefCOCO, RefCOCO+, RefCOCOg, gRefCOCO y GCG a los otros modelos de 2B de la familia (W2M-2B, W2M-InternVL3.5-2B y W2M-Qwen3-VL-2B), y en varias métricas iguala o supera a modelos de 8B como W2M-8B y W2M-InternVL3.5-8B. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, con 2,25 mil millones de parámetros, en fp16 se requerirían aproximadamente 4,5 GB solo para los pesos, más el overhead del decodificador de segmentación y las activaciones de imagen; en int8, alrededor de 2,3 GB; en int4, alrededor de 1,2 GB. Estas cifras son estimaciones y no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: probablemente sí, en modelos con 8 GB o más de VRAM, aunque no está verificado.
- Opciones de despliegue: no documentadas. Al distribuirse solo en safetensors y requerir un decodificador de segmentación específico, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; sería necesario verificar el código de inferencia del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RefCOCO val cIoU | gRefCOCO val gIoU | SEED accuracy | Licencia |
|---|---|---|---|---|---|---|
| W2M-Qwen3.5-2B | 2,25B | no disponible | 82,8 | 79,5 | 74,6 | no disponible |
| W2M-Qwen3-VL-2B | no disponible | no disponible | 81,9 | 77,1 | 74,2 | no disponible |
| W2M-InternVL3.5-2B | no disponible | no disponible | 80,2 | 76,8 | 73,4 | no disponible |
| W2M-Qwen3.5-9B | no disponible | no disponible | 83,7 | 80,0 | 78,4 | no disponible |

Dentro de la familia W2M, el modelo de 2B basado en Qwen3.5 es el de mejor rendimiento en su rango de tamaño, superando a sus equivalentes de 2B y acercándose a las variantes de 8B y 9B. No se dispone de información sobre licencias ni contextos de ninguno de los modelos comparados.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; es imprescindible contactar con el autor antes de usarlo en producción.
- No se documentan los idiomas soportados; el rendimiento en castellano u otras lenguas distintas del inglés es desconocido.
- No se especifica la longitud de contexto, lo que limita la planificación de aplicaciones con prompts largos o diálogos extensos.
- Riesgo de alucinación inherente a los modelos de lenguaje y multimodal: puede generar descripciones o máscaras incorrectas en escenas ambiguas o con objetos poco representados.
- Sesgos conocidos: no documentados, pero al derivar de Qwen3.5-2B y de un dataset de 768.000 registros no descrito, pueden heredarse sesgos de los datos de entrenamiento.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026): no hay evidencia de validación por parte de la comunidad.
- No se documentan los requisitos de hardware ni el código de inferencia, lo que puede dificultar su reproducción.
- El decodificador de segmentación específico puede no ser compatible con frameworks de inferencia estándar, requiriendo código personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- W2M-8B: https://huggingface.co/Gyj155/W2M-8B
- W2M-2B: https://huggingface.co/Gyj155/W2M-2B
- W2M-Sa2VA-InternVL3-8B: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- W2M-InternVL3.5-2B: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- W2M-InternVL3.5-8B: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- W2M-Qwen3-VL-2B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- W2M-Qwen3.5-9B: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
