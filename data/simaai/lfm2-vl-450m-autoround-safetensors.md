# simaai/LFM2-VL-450M-Autoround-Safetensors

## Resumen

Este modelo es una versión cuantizada post-entrenamiento del LFM2-VL-450M de Liquid AI, preparada por Sima.ai como checkpoint intermedio para su compilación con LLiMa y despliegue en hardware Sima.ai. Se trata de un modelo multimodal (imagen-texto) de 450 millones de parámetros, basado en la arquitectura LFM2 (Liquid Foundation Model 2), diseñado para procesar texto e imágenes con resoluciones variables y optimizado para baja latencia en entornos de edge AI.

La cuantización combina AutoRound y GPTQ para reducir el tamaño del modelo a aproximadamente 0,4 GB, manteniendo una pérdida de precisión mínima: en la evaluación completa de MMStar, el checkpoint cuantizado obtiene un 39,13 % de precisión frente al 40,87 % del modelo original, una caída relativa del 4,24 %. El modelo base, desarrollado por Liquid AI, es relevante por su eficiencia en dispositivos con recursos limitados, y esta versión cuantizada facilita su despliegue en hardware especializado de Sima.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida con atención lineal y SSM, según technical report) con encoder de visión |
| Parametros totales | 517.931.520 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 simétrico G256 (AutoRound y GPTQ) para decoder y lm_head; INT8 per-channel (GPTQ) para vision encoder; excepciones en BF16 para 2 capas del proyector multimodal |
| Idiomas soportados | Multilingüe (idiomas no especificados) |
| Licencia | Other (aplica la licencia del modelo base LiquidAI/LFM2-VL-450M) |
| Formato de pesos | Safetensors (incluye recipe.yaml, quantize.py, versions.txt) |

## Arquitectura y entrenamiento

El modelo base LFM2-VL-450M, desarrollado por Liquid AI, emplea la arquitectura LFM2, que combina atención lineal y mecanismos de estado espacio (SSM) para lograr eficiencia computacional y baja latencia. Incluye un encoder de visión que procesa imágenes a resolución variable, y un proyector multimodal que integra las características visuales con el decoder de texto.

La versión cuantizada se obtuvo mediante un proceso de post-entrenamiento con calibración. El decoder se cuantizó con AutoRound (INT4 simétrico, grupo 256) usando 512 muestras de 1.024 tokens del dataset `NeelNanda/pile-10k`; el `lm_head` se cuantizó con GPTQ (INT4 simétrico, grupo 256) y el encoder de visión con GPTQ (INT8 per-channel), ambos calibrados con 512 muestras de `lmms-lab/flickr30k`. Dos capas lineales del proyector multimodal se mantuvieron en BF16 como excepción de precisión mixta. El proceso está documentado en `recipe.yaml` y `versions.txt` incluidos en el repositorio.

## Capacidades

- Procesamiento conjunto de texto e imágenes: puede recibir una imagen y una consulta textual, y generar respuestas coherentes.
- Generación de descripciones de imágenes y respuesta a preguntas visuales (VQA).
- Soporte multilingüe, aunque no se especifican los idiomas concretos.
- Optimizado para baja latencia y despliegue en dispositivos con recursos limitados (edge AI).
- Compatible con el ecosistema Transformers de Hugging Face.
- Preparado para compilación con LLiMa para hardware Sima.ai, lo que permite inferencia acelerada en ese hardware específico.

## Casos de uso

- Asistencia visual en dispositivos IoT: el modelo puede analizar imágenes capturadas por cámaras de bajo coste y generar descripciones o alertas en tiempo real, gracias a su tamaño reducido y baja latencia.
- Accesibilidad para personas con discapacidad visual: integrado en aplicaciones móviles, puede describir el entorno a partir de fotos tomadas con el teléfono.
- OCR ligero en entornos industriales: con un rendimiento de 657 en OCRBench (según el technical report), puede extraer texto de imágenes en líneas de producción o documentos escaneados en dispositivos embebidos.
- Moderación de contenido en redes sociales: clasificación de imágenes y generación de texto asociado para filtrar contenido inapropiado en servidores con recursos limitados.
- Asistentes de voz con cámara: combinado con un sistema de reconocimiento de voz, puede responder preguntas sobre objetos o escenas capturadas por la cámara del dispositivo.
- Prototipado rápido de aplicaciones multimodales: al ser un checkpoint de 0,4 GB, es fácil de descargar y ejecutar en portátiles o GPUs de gama baja para pruebas de concepto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La evaluación se realizó sobre el conjunto completo de MMStar (1.500 ejemplos) con VLMEvalKit, usando generación determinista y emparejamiento exacto local. Los resultados se comparan con el modelo fuente y con un modelo similar de la literatura.

| Modelo | MMStar (precisión global) | OCRBench |
|---|---:|---:|
| LFM2-VL-450M (fuente) | 40,8667 % | 657 (según technical report) |
| LFM2-VL-450M-Autoround (este checkpoint) | 39,1333 % | No disponible |
| SmolVLM2-500M | No disponible | 562 (según technical report) |

La caída de precisión en MMStar es de -1,7333 puntos porcentuales (-4,2414 % relativo), lo que indica una degradación moderada debida a la cuantización.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 517,9 millones de parámetros. Con cuantización INT4, los pesos ocupan aproximadamente 259 MB; añadiendo overhead de activaciones y buffers, se estima que cabe en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o GPUs integradas con soporte CUDA. También puede ejecutarse en CPU con suficiente RAM (≈1 GB para pesos).
- Compatible con consumer GPUs: sí, especialmente en cuantización INT4.
- Opciones de despliegue: compatible con Transformers (pipeline image-text-to-text), y puede compilarse con LLiMa para hardware Sima.ai. No se menciona soporte para vLLM u Ollama, pero al ser un modelo estándar de Transformers, podría adaptarse.
- Latencia y throughput: no hay datos publicados para este checkpoint específico; el modelo base está diseñado para baja latencia, pero la cuantización puede reducir aún más los tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMStar | OCRBench | Licencia |
|---|---|---|---:|---:|---|
| LFM2-VL-450M-Autoround (este) | 517,9 M | No disponible | 39,13 % | No disponible | Other |
| LFM2-VL-450M (fuente) | 517,9 M | No disponible | 40,87 % | 657 | Other |
| SmolVLM2-500M | ~500 M | No disponible | No disponible | 562 | Apache 2.0 |

El modelo cuantizado es comparable en tamaño a SmolVLM2-500M, pero con mejor rendimiento en OCR según el technical report del modelo base. La licencia restrictiva (other) es una diferencia clave frente a SmolVLM2, que es Apache 2.0.

## Limitaciones y advertencias

- La cuantización puede degradar el rendimiento en idiomas no ingleses, dominios visuales poco comunes, formatos de prompt específicos o contextos largos; se recomienda validar el caso de uso concreto antes de producción.
- El modelo base tiene una licencia "other" que puede restringir el uso comercial; consulte los términos de LiquidAI/LFM2-VL-450M.
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de aplicaciones con dependencias de contexto largo.
- Al ser un modelo de 450M, puede presentar alucinaciones o respuestas imprecisas en tareas complejas de razonamiento visual.
- El checkpoint es un paso intermedio para compilación con LLiMa; no se autoriza la subida de esta versión a otros repositorios, según la nota del autor.
- La calibración se realizó con datasets específicos (pile-10k y flickr30k); el rendimiento en otros dominios puede variar.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/simaai/LFM2-VL-450M-Autoround-Safetensors
- Modelo base: https://huggingface.co/LiquidAI/LFM2-VL-450M
- Blog de Liquid AI sobre LFM2-VL: https://www.liquid.ai/blog/lfm2-vl-efficient-vision-language-models
- Technical report LFM2 (arXiv): https://arxiv.org/html/2511.23404v1
- Modelo en ModelScope: https://www.modelscope.cn/models/LiquidAI/LFM2-VL-450M
