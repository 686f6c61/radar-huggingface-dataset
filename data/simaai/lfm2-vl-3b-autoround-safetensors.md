# simaai/LFM2-VL-3B-Autoround-Safetensors

## Resumen

Este repositorio contiene una versión cuantizada post-entrenamiento del modelo LFM2-VL-3B de Liquid AI, preparada por Sima.ai como checkpoint intermedio para su compilación con LLiMa y despliegue en el hardware MLA de Sima.ai. El modelo original es un vision-language model (VLM) de 3.133 millones de parámetros, diseñado para aplicaciones de edge computing que requieren equilibrio entre precisión y velocidad. La cuantización aplicada combina AutoRound (INT4 simétrico con grupo 256) en las capas lineales del decoder, GPTQ (INT4) en la cabeza de lenguaje y GPTQ (INT8 por canal) en el encoder visual, con dos capas del proyector multimodal mantenidas en BF16. Esta versión cuantizada presenta una degradación de 1,47 puntos porcentuales en el benchmark MMStar respecto al modelo original (56,13% frente a 57,60%), lo que la hace adecuada para entornos donde el ahorro de memoria y la eficiencia computacional son prioritarios.

El modelo base, LFM2-VL-3B, está construido sobre el backbone LFM2-2.6B de Liquid AI y se comercializa como una alternativa eficiente para tareas de visión-lenguaje en dispositivos con recursos limitados. Según el informe técnico de Liquid AI, alcanza una puntuación de 822 en OCRBench, superando a otros modelos de tamaño similar. La licencia del modelo base se mantiene en esta versión cuantizada, por lo que las restricciones de uso originales continúan aplicándose. Este checkpoint es un paso previo a la compilación para hardware Sima.ai, aunque también puede utilizarse con la librería transformers para inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2-VL-3B (Liquid Foundation Model, VLM multimodal) |
| Parametros totales | 3.133.192.944 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 simetrico G256 (AutoRound y GPTQ), INT8 per-channel (GPTQ), excepciones en BF16 |
| Idiomas soportados | Multilingue (idiomas especificos no detallados) |
| Licencia | other (aplican las restricciones del modelo base LiquidAI/LFM2-VL-3B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2-VL-3B es un vision-language model desarrollado por Liquid AI, construido sobre el backbone LFM2-2.6B. La arquitectura LFM2 de Liquid AI combina capas de espacio de estados (SSM) con mecanismos de atención lineal, optimizados para inferencia eficiente en entornos edge. Sin embargo, los detalles precisos de la arquitectura (número de capas, dimensiones ocultas, tipo de atención) no se proporcionan en la información disponible de este repositorio. El proceso de cuantización de esta versión se describe en la model card: las capas lineales del decoder se cuantizaron con AutoRound (INT4 simétrico, grupo 256, 166 objetivos, 200 iteraciones), la cabeza de lenguaje (`lm_head`) con GPTQ (INT4 simétrico, grupo 256, 1 objetivo, act-order estático, bloque 128), y las capas lineales del encoder visual con GPTQ (INT8 por canal, 163 objetivos). Dos capas del proyector multimodal se mantienen en BF16 como excepción de precisión mixta. La calibración utilizó `NeelNanda/pile-10k` (512 muestras de 1.024 tokens) para el decoder y `lmms-lab/flickr30k` (512 muestras imagen-texto deterministas, longitud 2.048) para la cabeza y el encoder visual. El repositorio incluye `quantize.py`, `recipe.yaml` y `versions.txt` para reproducir el proceso.

## Capacidades

- Procesamiento de imágenes y texto: el modelo acepta entradas multimodales (imagen y texto) y genera texto descriptivo o respuestas contextuales.
- Generación de texto a partir de imágenes: típico de VLM, puede describir contenido visual, responder preguntas sobre imágenes, realizar OCR, etc.
- Soporte multilingüe: declarado como multilingüe, aunque no se especifican los idiomas concretos.
- Eficiencia en edge: al estar cuantizado en INT4/INT8, es adecuado para despliegue en hardware con recursos limitados, especialmente el MLA de Sima.ai tras compilación con LLiMa.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso en la información proporcionada.
- La resolución de entrada está fijada a 512x512 píxeles en la variante a16w4 de Sima.ai (no confirmado para este checkpoint Autoround, pero probablemente similar).

## Casos de uso

- Inspección visual en entornos industriales: el modelo puede analizar imágenes de líneas de producción para detectar defectos o anomalías, generando descripciones textuales de los hallazgos. Su tamaño reducido y cuantización permiten ejecutarlo en dispositivos edge cercanos a las cámaras, reduciendo latencia y ancho de banda.
- OCR y digitalización de documentos: gracias a su buen rendimiento en OCRBench (822 en el modelo base), puede extraer texto de imágenes de documentos, facturas o carteles, integrándose en flujos de captura de datos automatizada.
- Asistentes de accesibilidad para personas con discapacidad visual: el modelo puede describir el entorno o leer texto de imágenes capturadas por un dispositivo móvil, funcionando en tiempo real en hardware de bajo consumo.
- Automatización de procesos con captura de pantalla: en sistemas de automatización robótica de procesos (RPA), puede interpretar capturas de pantalla y generar acciones o descripciones, facilitando la interacción con interfaces gráficas sin necesidad de APIs.
- Clasificación y etiquetado de imágenes en la periferia: para aplicaciones de gestión de inventario o moderación de contenido, el modelo puede generar etiquetas descriptivas de imágenes localmente, evitando el envío de datos a la nube.
- Análisis de imágenes médicas preliminar: con las debidas validaciones, puede asistir en la descripción de radiografías o ecografías en entornos con recursos limitados, aunque no debe usarse para diagnóstico sin supervisión profesional.

## Benchmarks y rendimiento

La model card reporta evaluación completa del benchmark MMStar (1.500 ejemplos) con generación determinista y comparación local exacta:

| Checkpoint | Exactitud global (MMStar) | Estado |
|---|---:|---|
| Modelo original (LiquidAI/LFM2-VL-3B) | 57,6000% | Full MMStar |
| Checkpoint cuantizado (este repo) | 56,1333% | Full MMStar |
| Cambio absoluto | -1,4667 puntos porcentuales | Mejor es mayor |
| Cambio relativo | -2,5463% | Respecto al original |

Además, el informe técnico de LFM2 (arXiv 2511.23404) indica que el modelo base LFM2-VL-3B obtiene 822 en OCRBench, superando a modelos de tamaño similar. No se proporcionan resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada.

## Requisitos de hardware

- Tamaño del repositorio: 2,0 GB (pesos en safetensors, cuantización INT4/INT8).
- VRAM estimada para inferencia: con 3.133 millones de parámetros en INT4, los pesos ocupan aproximadamente 1,6 GB, más overhead de activaciones, KV cache y el encoder visual en INT8. Se estima un consumo total de VRAM entre 4 y 6 GB, aunque no se han publicado cifras oficiales.
- GPU recomendadas: al ser un modelo pequeño y cuantizado, puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También es compatible con hardware especializado de Sima.ai MLA tras compilación con LLiMa.
- Opciones de despliegue: además del flujo LLiMa para Sima.ai, el checkpoint es compatible con la librería transformers de Hugging Face, pudiendo usarse con frameworks como vLLM o TGI si se convierten los pesos. Para CPU, podría utilizarse llama.cpp con conversión a GGUF, aunque no se proporciona soporte oficial.
- Latencia y throughput: no se han publicado datos específicos para este checkpoint. El modelo base está diseñado para baja latencia en edge, y la cuantización INT4 reduce aún más los requisitos computacionales.

## Comparativa con modelos similares

La información disponible no incluye comparativas directas con otros modelos de la misma categoría. No obstante, el informe técnico de LFM2 menciona que el modelo base LFM2-VL-3B (822 en OCRBench) supera a SmolVLM2-500M (562 en OCRBench) y se sitúa en el nivel de otros VLM de ~3B. Se carece de datos de contexto, parámetros exactos de alternativas y resultados comparativos en benchmarks estándar como MMLU o HumanEval para esta versión cuantizada. Por tanto, no se puede elaborar una tabla comparativa rigurosa con los datos disponibles.

## Limitaciones y advertencias

- Degradación por cuantización: el checkpoint pierde 1,47 puntos porcentuales en MMStar respecto al modelo original, lo que puede afectar a tareas de precisión crítica.
- Calidad variable: la model card advierte que la calidad de la cuantización varía según el idioma, el dominio visual, el formato de prompt, la longitud de contexto y el runtime. Es necesario validar el workload de despliegue de forma independiente.
- Licencia restrictiva: la licencia es "other" y las restricciones del modelo base de Liquid AI continúan aplicándose. Se debe revisar la licencia original antes de uso comercial.
- Resolución fija: aunque no se confirma para este checkpoint, la variante a16w4 de Sima.ai fija la resolución de entrada a 512x512, lo que puede limitar el rendimiento en imágenes de alta resolución.
- Sin información sobre sesgos: no se han publicado análisis de sesgos o alucinaciones para este modelo. Como VLM, puede generar descripciones inexactas o alucinadas, especialmente en dominios no representados en los datos de calibración.
- Reproducibilidad limitada: la model card indica que no se capturó la revisión exacta de las fuentes de calibración (`pile-10k` y `flickr30k`), lo que puede dificultar la reproducción exacta del proceso de cuantización.

## Enlaces

- Repositorio HuggingFace del checkpoint cuantizado: https://huggingface.co/simaai/LFM2-VL-3B-Autoround-Safetensors
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2-VL-3B
- Blog de Liquid AI sobre LFM2-VL-3B: https://www.liquid.ai/blog/lfm2-vl-3b-a-new-efficient-vision-language-for-the-edge
- Informe técnico LFM2 (arXiv): https://arxiv.org/html/2511.23404v1
- Model Browser de Sima.ai: https://sima.ai/model-browser/
