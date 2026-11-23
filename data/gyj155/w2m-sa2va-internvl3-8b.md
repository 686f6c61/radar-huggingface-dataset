# Gyj155/W2M-Sa2VA-InternVL3-8B

## Resumen

W2M-Sa2VA-InternVL3-8B es un modelo multimodal de segmentación de imágenes publicado por el usuario Gyj155 en Hugging Face. Se construye como un fine-tuning del backbone ByteDance/Sa2VA-InternVL3-8B, al que se le añade un decodificador de segmentación condicionado por lenguaje. El resultado es un modelo capaz de realizar segmentación por referencia (referring segmentation), diálogo con fundamento visual (grounded dialogue) y respuesta a preguntas visuales (VQA) sobre imágenes.

El modelo cuenta con 7.984.387.585 parámetros (aproximadamente 8 mil millones) almacenados en formato safetensors, con un repositorio de 17,2 GB. Forma parte de una familia más amplia de modelos W2M (W2M-8B, W2M-2B, W2M-InternVL3.5-2B/8B, W2M-Qwen3-VL-2B/8B, W2M-Qwen3.5-2B/9B) que comparten la misma tarea de segmentación condicionada por lenguaje.

Su relevancia radica en que combina un modelo de visión-lenguaje de propósito general (InternVL3-8B) con capacidades de segmentación densa, lo que permite tareas de grounding visual fino que los VLM convencionales no cubren de forma nativa. La información pública disponible es, sin embargo, muy limitada: la model card es escueta y no detalla composición del dataset, proceso de entrenamiento, licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal VLM (backbone Sa2VA-InternVL3-8B) con decodificador de segmentación condicionado por lenguaje; detalles internos no disponibles |
| Parámetros totales | 7.984.387.585 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone ByteDance/Sa2VA-InternVL3-8B, un modelo de visión-lenguaje de la familia InternVL3, al que se le incorpora un decodificador de segmentación condicionado por lenguaje. Esta combinación permite que el modelo reciba una instrucción en lenguaje natural y produzca máscaras de segmentación sobre la imagen de entrada, además de mantener las capacidades conversacionales y de VQA del VLM subyacente.

Según la model card, el entrenamiento se realizó sobre 768.000 registros multimodales orientados a referring segmentation, grounded dialogue y visual question answering. No se especifica el número de tokens, la composición detallada del dataset, ni si se emplearon técnicas de RLHF, DPO u otros ajustes de alineamiento. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de la propia integración del decodificador de segmentación.

## Capacidades

- Segmentación por referencia en lenguaje natural (referring segmentation): genera máscaras a partir de descripciones textuales.
- Segmentación grounded en diálogo: capacidad de mantener conversaciones multi-turno con fundamento visual y producir segmentaciones coherentes.
- Respuesta a preguntas visuales (VQA) sobre imágenes.
- Comprensión multimodal imagen-texto heredada del backbone InternVL3.
- Evaluación en benchmarks específicos de segmentación (RefCOCO, RefCOCO+, RefCOCOg, gRefCOCO, GCG) y en SEED para comprensión visual general.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Segmentación asistida por texto en herramientas de edición de imagen: el usuario describe el objeto ("la camiseta roja del niño") y el modelo devuelve la máscara correspondiente, útil para flujos de recorte y retoque.
- Anotación automática de datasets de visión: generación de máscaras de segmentación a partir de descripciones textuales para acelerar el etiquetado en pipelines de datos.
- Robótica y manipulación guiada por lenguaje: localización de objetos descritos en lenguaje natural dentro de la escena para tareas de agarre o navegación.
- Análisis de imágenes médicas o industriales asistido por instrucciones: segmentación de regiones de interés descritas textualmente, con la cautela de validación humana.
- Interfaces conversacionales con fundamento visual: asistentes que responden preguntas sobre una imagen y, además, señalan o segmentan las regiones relevantes.
- Moderación y análisis de contenido visual: localización de elementos descritos en texto para revisión de imágenes en plataformas.
- Investigación en grounding visual: evaluación comparativa de técnicas de referring segmentation sobre los benchmarks RefCOCO/RefCOCO+/RefCOCOg.

## Benchmarks y rendimiento

Resultados publicados en la model card (cIoU en validación salvo donde se indique):

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-8B | 82,8 | 77,3 | 80,0 | 78,8 | 32,4 | 48,5 | 80,6 | 75,6 |
| W2M-2B | 81,2 | 74,2 | 77,7 | 76,8 | 31,8 | 44,6 | 78,5 | 73,0 |
| **W2M-Sa2VA-InternVL3-8B** | **83,4** | **78,3** | **81,2** | **78,6** | **35,0** | **50,3** | — | **75,2** |
| W2M-InternVL3.5-2B | 80,2 | 73,5 | 76,6 | 76,8 | 27,9 | 36,0 | — | 73,4 |
| W2M-InternVL3.5-8B | 81,3 | 75,5 | 78,5 | 77,7 | 26,1 | 32,9 | — | 75,0 |
| W2M-Qwen3-VL-2B | 81,9 | 75,6 | 79,5 | 77,1 | 31,8 | 44,6 | — | 74,2 |
| W2M-Qwen3-VL-8B | 82,9 | 78,0 | 80,8 | 79,0 | 32,3 | 44,8 | — | 77,0 |
| W2M-Qwen3.5-2B | 82,8 | 78,0 | 80,7 | 79,5 | 33,2 | 45,9 | — | 74,6 |
| W2M-Qwen3.5-9B | 83,7 | 80,3 | 81,7 | 80,0 | 34,4 | 50,2 | — | 78,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño (≈8 mil millones de parámetros) se puede estimar orientativamente: ~16 GB en fp16/bf16, ~8-10 GB en cuantización de 8 bits y ~5-6 GB en 4 bits, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, GPUs con ≥16 GB (A100, H100, L40S, RTX 4090) serían adecuadas en precisión completa.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización, pero no hay confirmación oficial.
- Opciones de despliegue: no disponible en la información proporcionada (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RefCOCO val cIoU | RefCOCOg val cIoU | SEED acc. | Licencia |
|---|---|---|---|---|---|---|
| W2M-Sa2VA-InternVL3-8B | 7,98 B | no disponible | 83,4 | 81,2 | 75,2 | no disponible |
| W2M-Qwen3.5-9B | no disponible | no disponible | 83,7 | 81,7 | 78,4 | no disponible |
| W2M-Qwen3-VL-8B | no disponible | no disponible | 82,9 | 80,8 | 77,0 | no disponible |
| W2M-InternVL3.5-8B | no disponible | no disponible | 81,3 | 78,5 | 75,0 | no disponible |

La comparativa se limita a los modelos de la misma familia W2M publicados por el mismo autor, ya que no se dispone de datos de benchmarks frente a alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan los idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos conocidos del modelo ni sobre la composición demográfica del dataset de entrenamiento.
- Riesgo de alucinación inherente a los VLM: puede generar descripciones o máscaras incorrectas ante instrucciones ambiguas o imágenes fuera de distribución.
- La segmentación condicionada por lenguaje puede fallar en escenas con objetos muy pequeños, oclusiones severas o descripciones ambiguas.
- No se documentan longitudes de contexto ni límites de resolución de imagen.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado en 2026-11-23; se trata de un artefacto reciente y sin validación comunitaria.
- No se especifican requisitos de hardware ni opciones de despliegue probadas, lo que añade incertidumbre para producción.

## Enlaces

- Hugging Face: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- Modelo base: https://huggingface.co/ByteDance/Sa2VA-InternVL3-8B
- W2M-8B: https://huggingface.co/Gyj155/W2M-8B
- W2M-2B: https://huggingface.co/Gyj155/W2M-2B
- W2M-InternVL3.5-2B: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- W2M-InternVL3.5-8B: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- W2M-Qwen3-VL-2B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- W2M-Qwen3.5-2B: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
- W2M-Qwen3.5-9B: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
