# PocketAiHub/PocketAI-Qwen3.8-27B-MLX

## Resumen

PocketAI-Qwen3.8-27B-MLX es una conversión oficial al formato MLX del modelo multimodal Qwen/Qwen3.8-27B, realizada por PocketAI Model Lab. El modelo original es un transformer de visión-lenguaje con 27 mil millones de parámetros, capaz de procesar texto e imágenes, y esta versión MLX lo adapta para ejecutarse eficientemente en Apple Silicon mediante cuantización en 4, 6 y 8 bits, además de una variante BF16 sin cuantizar. Su relevancia radica en permitir desplegar un modelo de 27B multimodal en hardware de Apple con memoria unificada, reduciendo el consumo de memoria hasta aproximadamente 22 GB en la variante de 4 bits, lo que facilita su uso en entornos de desarrollo e investigación.

La conversión mantiene la licencia Apache 2.0 del modelo original e incluye un conjunto de validaciones deterministas que cubren calidad de regresión, tool calling, comprensión temporal de vídeo y recuperación en contexto largo. El repositorio ofrece cuatro variantes con diferentes niveles de precisión, todas derivadas de la misma revisión oficial fijada del modelo base, lo que garantiza reproducibilidad y trazabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen/Qwen3.8-27B |
| Parametros totales | 27 mil millones (según nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens (verificado en pruebas de recuperación; no se especifica el máximo oficial) |
| Tipos de cuantizacion | MLX affine 4-bit, 6-bit y 8-bit (group size 64); variante BF16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Este repositorio no describe un entrenamiento propio, sino una conversión del modelo oficial `Qwen/Qwen3.8-27B` al formato MLX. El modelo original es un transformer multimodal con una torre de visión (vision tower) que procesa imágenes y las integra con el módulo de lenguaje. La conversión aplica cuantización MLX affine con group size 64 sobre los 498 módulos de lenguaje, mientras que la torre de visión se mantiene en BF16. No se mencionan datos de entrenamiento, RLHF ni DPO, ya que se trata de una adaptación de pesos existentes.

La innovación principal reside en el proceso de validación: cada variante supera una suite determinista de 12 casos de regresión de calidad, 8 casos de tool calling, una prueba de comprensión temporal de vídeo y una prueba de recuperación en contexto de 4K tokens. La variante de 4 bits también pasa una prueba de recuperación con 32.770 tokens reales de prompt, lo que confirma la integridad de la cuantización en contextos largos.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de texto e imágenes, y responde con texto.
- Comprensión temporal de vídeo: validado con una prueba de cambio de color (`red->blue`), lo que indica capacidad para seguir eventos en secuencias de vídeo.
- Tool calling / function calling: 8 de 8 casos de tool calling superados en la validación, lo que habilita su uso en agentes que invocan herramientas externas.
- Modo de pensamiento (thinking): el código de ejemplo incluye el parámetro `enable_thinking`, lo que sugiere soporte para razonamiento encadenado, aunque no se detalla su comportamiento.
- Recuperación en contexto largo: verificado hasta 32K tokens en la variante de 4 bits, y 4K en todas las variantes.
- Capacidades multilingües: no especificadas en la documentación proporcionada.

## Casos de uso

- Análisis de imágenes en equipos Apple Silicon: gracias a la cuantización de 4 bits, que ocupa unos 22 GB de memoria, se puede ejecutar en Mac con 32 GB o más de memoria unificada para tareas de descripción, clasificación o extracción de información de imágenes.
- Asistentes conversacionales con tool calling: el soporte validado para tool calling permite integrar el modelo en asistentes que consultan APIs, bases de datos o servicios externos, manteniendo conversaciones multi-turno con contexto de hasta 32K tokens.
- Comprensión de vídeo para resúmenes o análisis: la validación de comprensión temporal habilita aplicaciones como resumir vídeos, detectar cambios de estado o generar descripciones de secuencias, siempre que el vídeo se preprocese en frames.
- Recuperación aumentada por generación (RAG) con documentos extensos: la ventana de 32K tokens permite procesar documentos largos, como informes técnicos o manuales, y responder preguntas con referencias al contenido.
- Desarrollo de agentes multimodales: la combinación de visión, texto y tool calling permite construir agentes que interpretan capturas de pantalla, diagramas o formularios y actúan en consecuencia, por ejemplo automatizando tareas de UI.
- Prototipado rápido en investigación: al ser una conversión MLX, se integra con `mlx-vlm` y permite iterar sobre prompts y configuraciones sin necesidad de infraestructura GPU dedicada, ideal para experimentos en laboratorios con hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la información disponible. La documentación incluye mediciones de rendimiento de inferencia en un Apple M5 Max con 128 GB de memoria unificada, usando `mlx==0.32.0` y `mlx-vlm==0.6.8`, con un prompt de 4.105 tokens y 9 tokens generados:

| Variante | Prefill (tok/s) | Generación (tok/s) | Tiempo fin a fin (s) | Pico de memoria MLX |
| --- | ---: | ---: | ---: | ---: |
| MLX 4-bit | 733,1 | 36,6 | 5,86 | 21,80 GB |
| MLX 6-bit | 584,7 | 26,2 | 7,38 | 29,54 GB |
| MLX 8-bit | 600,1 | 20,1 | 7,30 | 37,27 GB |
| MLX BF16 | 623,8 | 10,8 | 7,43 | 58,29 GB |

Estas cifras son mediciones puntuales en caliente, no una garantía de rendimiento general.

## Requisitos de hardware

- Plataforma exclusiva para Apple Silicon (procesadores M-series), ya que MLX no es compatible con GPUs NVIDIA o AMD.
- Memoria unificada necesaria según variante: 4-bit requiere al menos 22 GB, 6-bit unos 30 GB, 8-bit unos 38 GB y BF16 unos 59 GB. Se recomienda un Mac con 32 GB (para 4-bit), 64 GB (para 6-bit u 8-bit) o 128 GB (para BF16) para dejar margen al sistema operativo.
- GPU recomendada: Apple M5 Max (usado en las pruebas), pero cualquier chip M-series con suficiente memoria unificada debería funcionar, aunque con menor rendimiento en generaciones anteriores.
- Despliegue: mediante `mlx-vlm` (versión validada 0.6.8) y `mlx` (versión 0.32.0). No se mencionan otros runners como vLLM u Ollama.
- Latencia y throughput: en el M5 Max, la variante de 4 bits alcanza 733 tok/s en prefill y 36,6 tok/s en generación, lo que la hace adecuada para aplicaciones interactivas. Las variantes de mayor precisión reducen la velocidad de generación, pero mejoran la fidelidad.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. La única referencia directa es el modelo base `Qwen/Qwen3.8-27B` en su formato original, que requiere un runtime diferente (por ejemplo, Transformers con CUDA) y no está optimizado para Apple Silicon. No se pueden establecer comparaciones cuantitativas con otras conversiones MLX sin datos adicionales.

## Limitaciones y advertencias

- Al ser una conversión, los sesgos y limitaciones del modelo original Qwen3.8-27B se mantienen, aunque no se documentan explícitamente en esta ficha.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento o generación libre.
- La cuantización puede degradar ligeramente la calidad en comparación con la variante BF16, especialmente en tareas que requieren precisión numérica alta.
- Solo funciona en Apple Silicon; no es compatible con GPUs NVIDIA ni entornos Linux con CUDA.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia original de Qwen.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un lanzamiento reciente o poco adoptado; se recomienda verificar la reproducibilidad antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: [PocketAiHub/PocketAI-Qwen3.8-27B-MLX](https://huggingface.co/PocketAiHub/PocketAI-Qwen3.8-27B-MLX)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Repositorio de PocketAI Model Lab: [https://github.com/PocketAIHub/pocketai-model-lab](https://github.com/PocketAIHub/pocketai-model-lab)
