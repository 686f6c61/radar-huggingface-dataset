# Frosty40/dots3-note-prev-NVFP4

## Resumen

dots3-note-prev-NVFP4 es una cuantización en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo multimodal dots3-note-prev, publicada por Frosty40. El modelo base, desarrollado por dots-studio, es un Mixture-of-Experts (MoE) con 280B parámetros totales y 16B activos, capaz de procesar texto, imágenes, vídeo y audio, y generar respuestas de texto. Soporta una ventana de contexto de hasta 512K tokens, lo que lo hace adecuado para tareas que requieren comprensión de documentos extensos o conversaciones de largo recorrido.

Esta versión cuantizada reduce significativamente los requisitos de memoria y cómputo en comparación con el modelo original, manteniendo un rendimiento cercano al de precisión completa. Está optimizada para su uso con vLLM, lo que facilita su despliegue en entornos de producción con GPUs NVIDIA que soporten la instrucción FP4. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con atención híbrida (DSA y sliding-window) |
| Parametros totales | 280B (según repositorio oficial) |
| Parametros activos | 16B |
| Longitud de contexto | 512K tokens (según repositorio oficial) |
| Tipos de cuantizacion | NVFP4 (4 bits de punto flotante) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NVFP4 (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base dots3-note-prev es un transformer MoE multimodal con 280B parámetros totales y 16B activos por token. Emplea una arquitectura de atención híbrida que combina atención densa (DSA) con atención de ventana deslizante, lo que permite manejar contextos de hasta 512K tokens de manera eficiente. El modelo acepta entradas de texto, imagen, vídeo y audio, y genera salidas de texto.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación pública. La cuantización NVFP4 se ha aplicado posteriormente por Frosty40, reduciendo el peso de cada parámetro a 4 bits, lo que disminuye el uso de VRAM y acelera la inferencia en hardware NVIDIA compatible.

## Capacidades

- Generación de texto multimodal: procesa y comprende imágenes, vídeo y audio, además de texto, y produce respuestas textuales coherentes.
- Razonamiento de contexto largo: gracias a su ventana de 512K tokens, puede manejar documentos extensos, conversaciones prolongadas o análisis de vídeo de larga duración.
- Comprensión visual y auditiva: integra información de múltiples modalidades para tareas como descripción de imágenes, transcripción de audio o resumen de vídeo.
- Soporte de agentes y razonamiento multi-paso: al ser un modelo de gran tamaño con 16B activos, puede realizar tareas complejas de razonamiento y planificación, aunque no se especifica explícitamente tool calling.
- Multilingüismo: no se han publicado los idiomas soportados, pero por su naturaleza multimodal es probable que cubra varios idiomas principales.
- Despliegue eficiente con vLLM: la cuantización NVFP4 está diseñada para integrarse con vLLM, permitiendo inferencia de alto rendimiento en GPUs NVIDIA.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar informes, contratos o artículos científicos de cientos de páginas, extrayendo información relevante y respondiendo preguntas sobre el contenido gracias a su contexto de 512K tokens.
- Asistente de atención al cliente multimodal: integra capturas de pantalla, vídeos de demostración o grabaciones de audio en conversaciones de soporte, generando respuestas contextuales y precisas.
- Generación de subtítulos y resúmenes de vídeo: al comprender vídeo y audio, puede transcribir y resumir contenido audiovisual, útil para plataformas de streaming o archivos de reuniones.
- Búsqueda semántica en bases de conocimiento: con su capacidad de contexto largo, puede indexar y consultar grandes volúmenes de texto, respondiendo consultas complejas con referencias precisas.
- Creación de contenido educativo: genera explicaciones, ejercicios o resúmenes a partir de materiales didácticos que incluyen imágenes, diagramas o vídeos.
- Automatización de informes financieros: procesa estados financieros, gráficos y noticias de mercado para generar análisis y resúmenes ejecutivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento específicos para esta cuantización ni para el modelo base en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 280B parámetros en NVFP4 (0.5 bytes por parámetro), el tamaño del modelo es de aproximadamente 140 GB. Se requieren múltiples GPUs para cargar el modelo completo, por ejemplo 4× H100 (80 GB) o 8× A100 (40 GB).
- GPU recomendadas: NVIDIA H100, A100 o RTX 4090 (esta última solo para pruebas con particionado, ya que 24 GB no son suficientes para el modelo completo).
- No cabe en una GPU consumer de gama media; se necesita hardware profesional o un clúster.
- Opciones de despliegue: vLLM es la librería principal soportada, con soporte nativo para NVFP4. También se puede usar con otras herramientas que acepten este formato, aunque no se documentan.
- Latencia y throughput: no se han publicado datos específicos, pero al ser una cuantización de 4 bits, se espera una inferencia más rápida que con precisión FP16, a costa de una ligera pérdida de calidad.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (MoE multimodales de gran tamaño). Modelos como Qwen2-VL-72B o Llama 3.2 90B podrían ser comparables, pero no se tienen datos de rendimiento ni especificaciones detalladas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir pérdida de precisión en tareas que requieren alta exactitud numérica, como matemáticas o razonamiento lógico complejo.
- El modelo requiere hardware NVIDIA con soporte para FP4 (arquitecturas Hopper o posteriores), lo que limita su despliegue en GPUs más antiguas.
- No se han publicado los idiomas soportados, por lo que su rendimiento en idiomas minoritarios es incierto.
- Al ser una cuantización de un modelo base, no se han realizado evaluaciones específicas de sesgos o alucinaciones; se recomienda validar en el dominio de aplicación.
- El tamaño del repositorio en HuggingFace es de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles directamente o que se requiere descargar desde otra fuente.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base cumpla con los mismos términos.

## Enlaces

- [HuggingFace - Frosty40/dots3-note-prev-NVFP4](https://huggingface.co/Frosty40/dots3-note-prev-NVFP4)
- [GitHub - studio-dots-ai/dots3-note-prev](https://github.com/studio-dots-ai/dots3-note-prev)
- [PR de vLLM para Dots3Note](https://github.com/vllm-project/recipes/pull/767/files)
