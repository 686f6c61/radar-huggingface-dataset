# hailun-core/Qwen3.8-27B-mlx-8Bit

## Resumen

El modelo `hailun-core/Qwen3.8-27B-mlx-8Bit` es una conversión al formato MLX del modelo base `Qwen/Qwen3.8-27B`, realizada con la librería `mlx-lm` versión 0.31.2. Se trata de un modelo multimodal de tipo imagen-texto a texto, lo que indica que puede procesar tanto imágenes como texto para generar respuestas. La conversión a MLX está pensada para ejecutarse de forma eficiente en hardware Apple Silicon (Macs con chips M1/M2/M3/M4) mediante la biblioteca MLX.

El repositorio contiene los pesos en formato safetensors con un total de 7.566.401.024 parámetros, lo que corresponde a aproximadamente 7,57 mil millones de parámetros. Aunque el nombre del modelo base sugiere "27B", los datos reales de safetensors indican una cantidad menor, por lo que es posible que el nombre original haga referencia a otra configuración o que la conversión haya reducido la precisión a 8 bits, pero no se dispone de más detalles. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su disponibilidad en formato MLX, que facilita la ejecución local en equipos Apple sin necesidad de GPUs NVIDIA, y en su naturaleza multimodal, que abre casos de uso como descripción de imágenes, respuesta a preguntas visuales o generación de texto a partir de contenido visual. Sin embargo, al ser una conversión de un modelo existente, sus capacidades dependen enteramente del modelo original, del cual no se proporciona documentación adicional en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, tipo transformer multimodal) |
| Parametros totales | 7.566.401.024 (7,57 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (según el nombre del repo y la etiqueta "8-bit") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-27B`. Dado que el pipeline se clasifica como `image-text-to-text`, se trata de un modelo multimodal que combina un codificador visual con un decodificador de lenguaje, probablemente basado en una arquitectura transformer. La conversión a MLX no modifica la arquitectura, solo transforma los pesos al formato optimizado para Apple Silicon.

Tampoco se conocen los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card del repositorio solo indica el proceso de conversión con `mlx-lm` 0.31.2, sin aportar detalles sobre el entrenamiento original.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto (según el pipeline `image-text-to-text`).
- Generación de texto: puede producir respuestas textuales a partir de prompts que incluyen contenido visual.
- Conversación: al ser un modelo de tipo chat, admite plantillas de conversación multi-turno (se menciona `apply_chat_template` en el ejemplo de uso).
- Compatibilidad con MLX: optimizado para ejecución en Apple Silicon mediante `mlx-lm`.
- No se dispone de información sobre tool calling, razonamiento multi-step, capacidades de código o matemáticas específicas, ya que no se han documentado en la ficha.

## Casos de uso

- Descripción de imágenes: el modelo puede generar descripciones textuales detalladas de fotografías o ilustraciones, útil para accesibilidad o catalogación automática.
- Asistencia visual para personas con discapacidad: a partir de una imagen capturada, el modelo puede explicar el contenido en lenguaje natural.
- Preguntas y respuestas sobre documentos escaneados: combinando OCR y comprensión visual, puede responder preguntas sobre gráficos, diagramas o formularios.
- Generación de contenido para redes sociales: crear textos descriptivos o creativos a partir de imágenes subidas por usuarios.
- Automatización de soporte al cliente con envío de capturas: el usuario adjunta una captura de pantalla y el modelo ayuda a diagnosticar problemas técnicos.
- Análisis de imágenes médicas o científicas (con las debidas advertencias): aunque no se ha verificado su precisión, podría usarse como apoyo en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo ni para su base.

## Requisitos de hardware

- Al ser un modelo MLX, está diseñado para ejecutarse en Macs con Apple Silicon (M1, M2, M3, M4).
- El tamaño del repositorio es de 28.6 GB, lo que sugiere que la cuantización 8-bit ocupa aproximadamente ese espacio en disco.
- Para inferencia, se recomienda al menos 16 GB de memoria unificada (RAM) en el Mac, aunque el requisito exacto depende de la longitud de contexto y del lote de inferencia.
- Se puede usar con la biblioteca `mlx-lm` mediante Python; no se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que MLX es un ecosistema propio.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base `Qwen3.8-27B` no está documentado en esta ficha, y no se conocen otros modelos multimodales en formato MLX con características comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser una conversión de un modelo no documentado, se desconocen los sesgos, la tasa de alucinación y las limitaciones de contexto o idioma.
- El modelo puede generar contenido inexacto o inventado, especialmente en tareas visuales complejas, por lo que no debe usarse en aplicaciones críticas sin validación humana.
- No se ha verificado el rendimiento en español; los idiomas soportados no están especificados.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base original por si existieran restricciones adicionales (no se han encontrado).
- El modelo está optimizado para Apple Silicon; su ejecución en otras plataformas requeriría conversión adicional a otro formato (por ejemplo, GGUF) y no está garantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hailun-core/Qwen3.8-27B-mlx-8Bit
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de mlx-lm: no disponible en la información proporcionada.
