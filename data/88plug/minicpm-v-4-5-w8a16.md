# 88plug/MiniCPM-V-4.5-W8A16

## Resumen

El modelo `88plug/MiniCPM-V-4.5-W8A16` es una cuantización INT8 (W8A16) del modelo multimodal MiniCPM-V 4.5, desarrollado por OpenBMB y publicado originalmente en [openbmb/MiniCPM-V-4_5](https://huggingface.co/openbmb/MiniCPM-V-4_5). Se trata de un VLM (vision-language model) de 8B parámetros que combina un LLM Qwen3-8B con un encoder de visión SigLIP2-400M y un resampler 3D unificado para procesar imágenes, múltiples imágenes y vídeo. La cuantización, realizada por el laboratorio 88plug, reduce el peso de las capas lineales del LLM a 8 bits, manteniendo el encoder de visión y el resampler en BF16, lo que permite desplegar el modelo con menor uso de VRAM y mayor throughput en entornos de producción.

Esta versión cuantizada está pensada para su uso con vLLM (versión 0.21 o superior), que detecta automáticamente el formato compressed-tensors. No es compatible con TGI ni con el widget de Hugging Face. El modelo base MiniCPM-V 4.5 destaca por superar a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL-72B en tareas de visión-lenguaje, siendo uno de los MLLM más eficientes de su categoría. La cuantización W8A16 busca mantener ese rendimiento con un coste computacional reducido, aunque los benchmarks de esta versión concreta aún no se han publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (LLM) + SigLIP2-400M (vision encoder) + 3D-resampler |
| Parametros totales | 8B (modelo base, según documentación de MiniCPM-V 4.5) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k (modelo base, según paper arXiv:2509.18154) |
| Tipos de cuantizacion | W8A16 INT8 (compressed-tensors, pack-quantized / int-quantized) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V 4.5 es un MLLM eficiente que combina un LLM Qwen3-8B con un encoder de visión SigLIP2 de 400M parámetros y un resampler 3D unificado. Este resampler permite procesar imágenes individuales, múltiples imágenes y vídeo de forma flexible, adaptando las características visuales a la secuencia de entrada del LLM. El modelo soporta dos modos de razonamiento: "fast thinking" para tareas frecuentes y "deep thinking" para problemas complejos, conmutables de forma controlada.

La cuantización W8A16 se aplicó únicamente a las capas lineales del LLM (`model.llm`), utilizando el método AutoRound con 200 iteraciones y `actorder=False`. El encoder de visión (vpm) y el resampler 3D se mantienen en BF16, así como embeddings, LM head y normas. El resultado es un formato compressed-tensors nativo para vLLM, que no requiere flag de cuantización explícito. El proceso de cuantización está marcado como "pending-gold", es decir, aún no se ha completado la validación final del camino dorado (gold path).

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo puede responder preguntas sobre imágenes, describir escenas, analizar diagramas y realizar tareas de razonamiento visual.
- Procesamiento de múltiples imágenes y vídeo: gracias al resampler 3D, puede manejar entradas con varias imágenes o secuencias de vídeo.
- Modos de razonamiento rápido y profundo: permite alternar entre respuestas rápidas y razonamiento más elaborado según la complejidad de la tarea.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card, aunque el modelo base Qwen3-8B tiene capacidades de tool calling; no se confirma en esta versión cuantizada.
- Capacidades multilingües: la model card indica solo inglés, aunque el modelo base podría soportar más idiomas; no se especifica.
- Sin capacidades de audio: a diferencia de MiniCPM-o, esta versión no incluye entrada de audio ni TTS.

## Casos de uso

- Análisis de imágenes médicas: el modelo puede interpretar radiografías, resonancias o fotografías clínicas para ayudar en la detección de anomalías, gracias a su capacidad de razonamiento visual y su contexto largo de 128k tokens.
- Extracción de información de documentos escaneados: con OCR integrado en el modelo base, puede convertir facturas, formularios o contratos en texto estructurado, útil para automatizar procesos de back-office.
- Descripción de imágenes para accesibilidad: generar descripciones detalladas de imágenes para personas con discapacidad visual, integrándose en aplicaciones móviles o web.
- Moderación de contenido visual: clasificar imágenes o vídeos para detectar contenido inapropiado o sensible, aprovechando su capacidad de procesar múltiples imágenes y vídeo.
- Chatbots multimodales de atención al cliente: responder consultas que incluyan capturas de pantalla, fotos de productos o diagramas, manteniendo conversaciones multi-turno con contexto amplio.
- Asistente para diseño y creatividad: analizar bocetos, moodboards o referencias visuales para generar sugerencias de diseño o descripciones de conceptos.
- Automatización de QA visual en desarrollo de software: verificar capturas de pantalla de interfaces de usuario para detectar errores de renderizado o problemas de diseño, integrándose en pipelines de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de throughput (tok/s), delta de MMLU frente a BF16 y RULER@128k están "en progreso" y se publicarán cuando se midan. No se proporcionan números concretos.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM, latencia o throughput para esta cuantización.
- Como estimación orientativa, un modelo de 8B parámetros en INT8 requiere aproximadamente 8-10 GB de VRAM para inferencia, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) con margen para el contexto.
- Para despliegue en producción, se recomienda vLLM ≥ 0.21.0, que detecta automáticamente el formato compressed-tensors. No usar TGI ni el widget de Hugging Face.
- El comando de despliegue sugerido es: `vllm serve 88plug/MiniCPM-V-4.5-W8A16 --trust-remote-code --max-model-len 8192 --gpu-memory-utilization 0.90`.
- No se especifican GPUs concretas recomendadas; se asume que cualquier GPU compatible con vLLM y con suficiente VRAM puede ejecutar el modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 88plug/MiniCPM-V-4.5-W8A16 | 8B | 128k | W8A16 INT8 | Apache-2.0 | Hugging Face |
| openbmb/MiniCPM-V-4_5 (base) | 8B | 128k | BF16 | Apache-2.0 | Hugging Face |
| 88plug/MiniCPM-o-4.5-W8A16 | 8B | 128k | W8A16 INT8 | Apache-2.0 | Hugging Face (con audio) |
| Qwen2.5-VL-7B | 7B | 128k | BF16 | Apache-2.0 | Hugging Face |

La comparativa se basa en características estructurales, ya que no hay datos de rendimiento publicados para la versión cuantizada. El modelo base MiniCPM-V 4.5 supera a Qwen2.5-VL-72B en tareas de visión-lenguaje según la documentación de OpenBMB, pero no se dispone de comparativas directas con la cuantización.

## Limitaciones y advertencias

- Solo visión-lenguaje: no incluye entrada de audio ni TTS, a diferencia de MiniCPM-o.
- Cuantización parcial: solo las capas lineales del LLM están en INT8; el encoder de visión y el resampler permanecen en BF16, lo que limita la reducción total de memoria.
- Estado "pending-gold": la cuantización no ha completado la validación final del gold path; no se recomienda su uso en producción crítica sin verificación adicional.
- FLAC no medido: no se ha evaluado la pérdida de calidad respecto al modelo BF16.
- Compatibilidad restringida: solo funciona con vLLM ≥ 0.21; no es compatible con TGI ni con el widget de Hugging Face.
- Idioma: la model card solo indica inglés, aunque el modelo base podría soportar más idiomas; no se garantiza el rendimiento en otros idiomas.
- Riesgo de alucinación: como todo modelo multimodal, puede generar descripciones incorrectas o inventar detalles visuales, especialmente en imágenes ambiguas o de baja calidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/88plug/MiniCPM-V-4.5-W8A16)
- [Modelo base openbmb/MiniCPM-V-4_5](https://huggingface.co/openbmb/MiniCPM-V-4_5)
- [Paper arXiv:2509.18154](https://arxiv.org/abs/2509.18154)
- [Repositorio GitHub de MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V)
- [Perfil de 88plug AI Lab](https://huggingface.co/88plug)
