# Oscilla/gemma-4-E2B-it-mlx-8Bit

## Resumen

Oscilla/gemma-4-E2B-it-mlx-8Bit es una conversión al formato MLX del modelo google/gemma-4-E2B-it, realizada por el usuario Oscilla con la librería mlx-lm en su versión 0.31.2. El modelo original, desarrollado por Google, pertenece a la familia Gemma 4 y está diseñado para tareas any-to-any (entrada y salida multimodal), aunque en esta conversión se presenta como un modelo de texto cuantizado a 8 bits. La conversión a MLX permite ejecutar el modelo de forma eficiente en hardware Apple Silicon, reduciendo el consumo de memoria frente a los pesos en precisión completa. Con 1.307.305.251 parámetros (aproximadamente 1,3 mil millones), el repositorio ocupa 5,0 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones locales.

La relevancia de esta conversión radica en que democratiza el acceso a un modelo de la familia Gemma 4 en entornos macOS, un ecosistema donde el soporte de frameworks como MLX es cada vez más habitual. Al tratarse de una cuantización de 8 bits, el modelo mantiene un equilibrio entre fidelidad numérica y eficiencia, siendo adecuado para equipos con memoria unificada moderada. No obstante, la información pública sobre el modelo base es escasa: no se especifican detalles de arquitectura, contexto, idiomas ni benchmarks, por lo que esta ficha se basa principalmente en los datos del repositorio y en la descripción general de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en google/gemma-4-E2B-it) |
| Parametros totales | 1.307.305.251 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original google/gemma-4-E2B-it. El nombre sugiere que pertenece a la familia Gemma 4, que según la documentación de Google DeepMind está orientada a razonamiento, flujos de trabajo agénticos, codificación y comprensión multimodal. Sin embargo, los datos proporcionados no incluyen especificaciones sobre el número de capas, el mecanismo de atención, ni el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Esta conversión concreta se limita a transformar los pesos del modelo original al formato MLX, aplicando una cuantización de 8 bits. No se indica si se realizó algún ajuste adicional durante la conversión.

## Capacidades

- Generación de texto: al ser un modelo de la familia Gemma 4, se espera que pueda generar texto coherente y seguir instrucciones, aunque no se han verificado capacidades específicas en esta conversión.
- Comprensión multimodal: el modelo base está etiquetado como image-text-to-text, lo que sugiere que puede procesar imágenes y texto, pero no se confirma que esta conversión MLX conserve dicha funcionalidad.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, aunque Gemma 4 está diseñada para agentes según la documentación oficial.
- Capacidades multilingües: no disponibles.
- Otras capacidades: al ser una cuantización 8-bit, el comportamiento es similar al modelo original con una pérdida mínima de precisión, según la descripción de ThinkLLM.

## Casos de uso

- Inferencia local en macOS: gracias al formato MLX, el modelo puede ejecutarse en equipos Apple Silicon (M1/M2/M3) mediante la librería mlx-lm, lo que permite desplegar un asistente de texto sin conexión a internet.
- Prototipado rápido de aplicaciones de chat: los desarrolladores pueden integrar el modelo en aplicaciones de escritorio o scripts de Python usando el ejemplo proporcionado en la model card, que aplica la plantilla de chat del tokenizador.
- Experimentación con cuantización: al ser una versión de 8 bits, sirve como referencia para comparar el rendimiento y la calidad frente a versiones de 4 bits (por ejemplo, Oscilla/gemma-4-E2B-it-4bit-MLX) o la versión original en precisión completa.
- Evaluación de modelos en hardware limitado: equipos con poca memoria unificada (por ejemplo, 8 GB) pueden ejecutar este modelo de 1,3B parámetros en 8 bits, lo que facilita pruebas de concepto sin necesidad de GPUs dedicadas.
- Desarrollo de herramientas de productividad: el modelo puede usarse para generar borradores de texto, resumir documentos o asistir en tareas de redacción, siempre que se acepte la posible falta de precisión en tareas complejas.
- Integración en pipelines de MLX: al ser un formato nativo de MLX, se puede combinar con otras utilidades del ecosistema (por ejemplo, adaptadores LoRA) para fine-tuning posterior, aunque no se documenta explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su versión base en esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.307.305.251 parámetros. En 8 bits, el peso ocupa aproximadamente 1,3 GB (sin contar overhead del tokenizador y activaciones). El repositorio pesa 5,0 GB, lo que sugiere que puede incluir archivos adicionales o pesos en múltiples formatos, pero la carga en memoria debería rondar los 2-3 GB en la práctica.
- GPU recomendadas: al ser formato MLX, está optimizado para Apple Silicon (GPU integrada). No se recomienda para GPUs NVIDIA/AMD sin adaptación.
- Compatibilidad con GPU de consumo: sí, en Macs con Apple Silicon (M1, M2, M3) y al menos 8 GB de RAM unificada. En otros sistemas, se necesitaría convertir el modelo a otro formato (por ejemplo, GGUF) para usar con llama.cpp u Ollama.
- Opciones de despliegue: mlx-lm (Python), posiblemente compatible con otros frameworks que soporten MLX. No se mencionan vLLM, TGI ni Ollama para este formato específico.
- Latencia y throughput: no disponibles. Se espera que en un Mac con chip M2 o superior la generación sea fluida para un modelo de este tamaño, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/gemma-4-E2B-it-mlx-8Bit | 1.307.305.251 | 8-bit MLX | no disponible | Apache 2.0 | safetensors (MLX) |
| Oscilla/gemma-4-E2B-it-4bit-MLX | no disponible (mismo base) | 4-bit MLX | no disponible | Apache 2.0 | safetensors (MLX) |
| DreamFoundries/gemma-4-E2B-it-8bit | no disponible | 8-bit (posiblemente GGUF u otro) | no disponible | Apache 2.0 | no disponible |
| google/gemma-4-E2B-it | no disponible | precisión completa | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a las diferencias de formato y cuantización dentro del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica, pero al derivarse de un modelo de Google, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o factual.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; si el modelo base tiene un límite bajo (por ejemplo, 8k tokens), podría ser insuficiente para tareas de largo alcance.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque Gemma 4 es multilingüe, no hay confirmación para esta conversión.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia específica de Gemma 4 en el enlace proporcionado (https://ai.google.dev/gemma/docs/gemma_4_license) para posibles cláusulas adicionales.
- Caveat para producción: al ser una conversión no oficial de un usuario, no hay garantía de mantenimiento, soporte ni corrección de errores. Se recomienda verificar la calidad del modelo en tareas específicas antes de usarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/gemma-4-E2B-it-mlx-8Bit
- Modelo base original: https://huggingface.co/google/gemma-4-E2B-it
- Documentación de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Página de ThinkLLM con descripción del modelo: https://thinkllm.dev/models/gemma-4-e2b-it-mlx-8bit
- Versión 4-bit del mismo autor: https://huggingface.co/Oscilla/gemma-4-E2B-it-4bit-MLX
- Conversión 8-bit de otro usuario: https://huggingface.co/DreamFoundries/gemma-4-E2B-it-8bit
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
