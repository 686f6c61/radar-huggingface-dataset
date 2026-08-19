# openbmb/MiniCPM-V-4.6-gguf

## Resumen

MiniCPM-V 4.6 es un modelo multimodal ligero desarrollado por OpenBMB, diseñado para la comprensión eficiente de imagen y vídeo en dispositivos móviles. Combina un codificador visual SigLIP2-400M con un modelo de lenguaje Qwen3.5-0.8B, alcanzando un total de aproximadamente 1.300 millones de parámetros. Su arquitectura incorpora compresión mixta de tokens visuales 4x/16x, lo que permite ajustar dinámicamente el equilibrio entre precisión y velocidad según el caso de uso. Este repositorio aloja la versión cuantizada en formato GGUF para su ejecución con llama.cpp y otros motores compatibles.

El modelo destaca por su eficiencia en entornos con recursos limitados: puede desplegarse en iOS, Android y HarmonyOS, y ofrece un rendimiento competitivo frente a modelos más grandes, como Ministral 3 3B, con un coste de tokens significativamente menor. Su licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: SigLIP2-400M (visión) + Qwen3.5-0.8B (lenguaje) |
| Parametros totales | 1.3B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias precisiones: Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 se construye sobre una arquitectura multimodal que combina un codificador visual SigLIP2-400M con un modelo de lenguaje Qwen3.5-0.8B. La innovación principal reside en la compresión mixta de tokens visuales con ratios 4x y 16x, basada en las técnicas de LLaVA-UHD v4. Esto reduce los FLOPs de codificación visual en más de un 50% respecto a enfoques anteriores, manteniendo la capacidad de procesar imágenes individuales, múltiples imágenes y vídeo.

El entrenamiento sigue la línea de la familia MiniCPM-V, con un enfoque en eficiencia y despliegue en dispositivos. Aunque no se detallan los datos exactos de entrenamiento ni el uso de técnicas como RLHF o DPO, el modelo está optimizado para tareas de instrucción multimodal y razonamiento. Su diseño permite una adaptación flexible entre velocidad y precisión mediante la selección del ratio de compresión visual.

## Capacidades

- Comprensión de imágenes individuales y múltiples, incluyendo descripción, respuesta a preguntas y razonamiento visual.
- Procesamiento de vídeo, con capacidad de entender secuencias temporales.
- Compresión mixta de tokens visuales (4x/16x) para ajustar el equilibrio entre rendimiento y consumo de recursos.
- Razonamiento multimodal integrado, superando a Qwen3.5-0.8B en la mayoría de tareas de visión-lenguaje.
- Eficiencia computacional elevada: aproximadamente 1.5x mayor throughput de tokens que Qwen3.5-0.8B.
- Despliegue en plataformas móviles (iOS, Android, HarmonyOS) con código de adaptación abierto.
- Compatibilidad con frameworks de inferencia como vLLM, SGLang, llama.cpp y Ollama, así como con ecosistemas de fine-tuning (SWIFT, LLaMA-Factory).

## Casos de uso

- Asistente visual en dispositivos móviles: integración en aplicaciones de iOS, Android o HarmonyOS para reconocimiento de objetos, lectura de textos en imágenes o descripción de escenas en tiempo real.
- Atención al cliente con soporte de imágenes: el modelo puede procesar capturas de pantalla o fotos enviadas por usuarios para diagnosticar problemas técnicos o guiar en la resolución de incidencias.
- Análisis de documentos escaneados: extracción de información de facturas, formularios o tarjetas de visita, gracias a su capacidad de comprensión de texto en imágenes.
- Moderación de contenido visual: clasificación automática de imágenes en redes sociales o plataformas de contenido para detectar material inapropiado.
- Asistencia para personas con discapacidad visual: descripción de entornos o lectura de etiquetas mediante captura de cámara en tiempo real, ejecutable en hardware de bajo consumo.
- Automatización de tareas de visión en robótica: el modelo puede procesar flujos de vídeo para navegación o reconocimiento de objetos en sistemas embebidos con restricciones de memoria.

## Benchmarks y rendimiento

Según la información publicada, MiniCPM-V 4.6 obtiene una puntuación de 13 en el Artificial Analysis Intelligence Index, superando a Qwen3.5-0.8B (10), Qwen3.5-0.8B-Thinking (11) y Ministral 3 3B (11). Además, alcanza un rendimiento comparable al de Qwen3.5 2B en benchmarks como OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench. En términos de eficiencia, logra aproximadamente 1.5x el throughput de tokens de Qwen3.5-0.8B.

| Modelo | Artificial Analysis Intelligence Index | Throughput relativo |
|---|---|---|
| MiniCPM-V 4.6 | 13 | 1.5x |
| Qwen3.5-0.8B | 10 | 1.0x |
| Qwen3.5-0.8B-Thinking | 11 | - |
| Ministral 3 3B | 11 | - |

No se han publicado resultados detallados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 1.3B parámetros cuantizado en GGUF, puede ejecutarse en CPU con 4-8 GB de RAM, aunque con latencias mayores.
- En GPU de consumo, como una NVIDIA RTX 3060 o superior, cabe en VRAM de 4 GB o menos con cuantización Q4.
- Diseñado específicamente para despliegue en dispositivos móviles (iOS, Android, HarmonyOS), con adaptaciones de código abierto.
- Frameworks soportados: llama.cpp, Ollama, vLLM, SGLang, Transformers.
- Para inferencia en servidor, una GPU con 8 GB de VRAM (por ejemplo, RTX 3070, A10) permite ejecutar el modelo con cuantización Q8 sin problemas de memoria.
- Latencia y throughput estimados: no disponibles en la información proporcionada, aunque el modelo está optimizado para baja latencia en edge.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Puntuación AAII | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 | 1.3B | Imagen, vídeo, texto | 13 | Apache 2.0 | Hugging Face, Ollama |
| Qwen3.5-0.8B | 0.8B | Texto (sin visión) | 10 | Apache 2.0 (presumible) | Hugging Face |
| Ministral 3 3B | 3B | Texto (sin visión) | 11 | Apache 2.0 (presumible) | Hugging Face |

MiniCPM-V 4.6 ofrece la ventaja de ser multimodal con un coste de tokens mucho menor que sus competidores, manteniendo un rendimiento superior en el índice de inteligencia artificial. Su licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos; como todo modelo multimodal, puede generar descripciones inexactas en imágenes ambiguas o de baja calidad.
- La longitud de contexto no está especificada, lo que puede limitar su uso en tareas que requieran ventanas de contexto muy largas.
- Los idiomas soportados no están documentados; aunque el modelo base Qwen3.5 suele tener buen soporte multilingüe, no se garantiza cobertura completa.
- La cuantización GGUF puede degradar ligeramente la precisión en comparación con los pesos BF16 originales, especialmente en tareas de razonamiento fino.
- Para producción, se recomienda validar el rendimiento en el hardware objetivo, ya que la eficiencia varía según la plataforma y el framework de inferencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.6-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-V
- Página en Ollama: https://ollama.com/openbmb/minicpm-v4.6
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Demo
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
