# glorp1/qwen35-4b-ermugo2

## Resumen

`glorp1/qwen35-4b-ermugo2` es un modelo fine-tuneado a partir de `unsloth/Qwen3.5-4B`, la variante de 4.000 millones de parámetros de la familia Qwen3.5 desarrollada por Qwen y optimizada por Unsloth para entrenamiento acelerado. El autor, glorp1, ha publicado este checkpoint en HuggingFace bajo licencia Apache 2.0, pero no proporciona ninguna documentación sobre el dataset, la técnica de ajuste (LoRA, QLoRA, full fine-tune) ni la tarea específica para la que fue entrenado.

El modelo base pertenece a la familia Qwen3.5, que según las fuentes consultadas introduce una arquitectura híbrida que combina atención lineal con transformers tradicionales, y es nativamente multimodal (texto, imagen y vídeo). El checkpoint de glorp1 hereda estas características estructurales, aunque el pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere que conserva la torre visual del modelo original.

La relevancia de este modelo es limitada por la falta de información sobre el fine-tuning: sin conocer los datos de entrenamiento ni los objetivos, es difícil evaluar su utilidad práctica. No obstante, su base es un modelo moderno con una ventana de contexto de 262.144 tokens, lo que lo hace potencialmente interesante para tareas de contexto largo si el ajuste ha sido correcto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + transformer) heredada de Qwen3.5-4B; no se especifica variación en el fine-tune |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según fuentes externas del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en (según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `unsloth/Qwen3.5-4B` pertenece a la familia Qwen3.5, que según la documentación pública combina atención lineal con capas transformer tradicionales en una arquitectura híbrida. Esta familia es nativamente multimodal, entrenada con fusión temprana de tokens multimodales (texto, imagen y vídeo), y logra según las fuentes un rendimiento comparable al de Qwen3 en tareas de razonamiento, código y agentes, superando a los modelos Qwen3-VL en comprensión visual.

El fine-tune realizado por glorp1 se llevó a cabo con la librería Unsloth y la biblioteca TRL de HuggingFace, tal como indica la model card. Sin embargo, no se proporcionan detalles sobre el conjunto de datos utilizado, el número de pasos de entrenamiento, la técnica de ajuste (por ejemplo, LoRA o full fine-tune) ni si se aplicaron métodos de alineación como RLHF o DPO. Tampoco se indica si la torre visual se mantuvo intacta o fue eliminada, aunque el pipeline `image-text-to-text` sugiere que se conserva.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational` en HuggingFace).
- Comprensión y generación de contenido multimodal (imagen-texto) heredada del modelo base, aunque no verificada para este checkpoint concreto.
- Razonamiento, generación de código y capacidades matemáticas propias de Qwen3.5-4B, según las características generales de la familia.
- Ventana de contexto larga (262.144 tokens) que permite procesar documentos extensos o conversaciones prolongadas.
- Soporte de tool calling y uso como agente: probablemente heredado del modelo base, pero no confirmado en la documentación de este fine-tune.
- Idioma: únicamente inglés declarado en la model card, aunque el modelo base podría tener capacidades multilingües no documentadas aquí.

## Casos de uso

- Procesamiento de documentos largos: gracias a la ventana de 262.144 tokens, el modelo puede resumir, extraer información o responder preguntas sobre manuales técnicos, informes o contratos extensos en una sola pasada.
- Asistentes conversacionales en inglés: su naturaleza conversacional y el ajuste con TRL lo hacen adecuado para chatbots de atención al cliente o asistentes virtuales, siempre que el fine-tuning haya sido orientado a ese fin.
- Análisis de imágenes con contexto textual: al ser un modelo `image-text-to-text`, puede describir imágenes o responder preguntas sobre ellas, útil en sistemas de documentación visual o accesibilidad.
- Generación de código asistida: las capacidades de código del modelo base permiten su uso en entornos de desarrollo integrado, autocompletado o generación de scripts.
- Razonamiento multi-paso: para tareas de planificación o resolución de problemas que requieren encadenar varios pasos lógicos, como en agentes autónomos.
- Investigación académica: como punto de partida para experimentos de fine-tuning adicionales, dado su tamaño moderado y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. Las fuentes externas mencionan que la familia Qwen3.5 supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se proporcionan cifras concretas para el modelo de 4B ni para este checkpoint concreto. Por tanto, no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,3 GB en safetensors, lo que sugiere pesos en fp16/bf16. La inferencia en precisión completa requerirá al menos 10-12 GB de VRAM.
- Con cuantización a 4 bits (por ejemplo, NF4), el modelo podría caber en aproximadamente 5 GB de VRAM, según indican las herramientas de la comunidad para Qwen3.5.
- GPU recomendadas: para fp16, una RTX 3090, RTX 4090 o A10 con 24 GB; para cuantización, GPUs con 8 GB o más (RTX 3060, RTX 4070, etc.).
- Opciones de despliegue: vLLM, HuggingFace TGI, llama.cpp, Ollama (el modelo base `qwen3.5:4b` está disponible en Ollama) y el toolkit `qwen35-toolkit` para preparar el modelo en hardware limitado.
- Latencia y throughput: no disponibles para este fine-tune específico; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| glorp1/qwen35-4b-ermugo2 | 4,66 B | 262.144 | Sí (imagen-texto) | Apache 2.0 | Fine-tune sin documentar |
| unsloth/Qwen3.5-4B | 4,66 B | 262.144 | Sí | Apache 2.0 | Modelo base original |
| Qwen3.5-9B (Small) | 9 B | 262.144 | Sí | Apache 2.0 | Variante mayor de la misma familia |
| Llama 3.2 3B | 3,2 B | 128.000 | No | Llama 3.2 Community | Alternativa densa de menor tamaño |

La comparativa se limita a parámetros, contexto y licencia, ya que no se dispone de datos de rendimiento para el fine-tune. El modelo base y su variante fine-tuneada comparten arquitectura y capacidades, pero la falta de documentación del ajuste impide evaluar diferencias de comportamiento.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el proceso de fine-tuning: se desconoce el dataset, la técnica y el objetivo, lo que impide predecir su comportamiento en tareas específicas.
- Solo se declara el idioma inglés; el uso en otros idiomas puede degradar la calidad de las respuestas.
- Riesgo de alucinaciones, especialmente en tareas de razonamiento o generación de código, inherente a los modelos de este tamaño.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de un modelo con licencia Apache 2.0, se deben mantener los avisos de atribución correspondientes.
- El pipeline `image-text-to-text` sugiere que la torre visual está presente, pero no se ha verificado su funcionamiento tras el fine-tuning; podría estar dañada o incompleta.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que cualquier afirmación sobre su rendimiento es especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glorp1/qwen35-4b-ermugo2
- Colección Qwen3.5 de Unsloth: https://huggingface.co/collections/unsloth/qwen35
- Página del modelo en Ollama: https://ollama.com/library/qwen3.5:4b
- Toolkit de la comunidad para Qwen3.5: https://github.com/techwithsergiu/qwen35-toolkit
- Guía completa de Qwen 3.5 (benchmarks y setup): https://qwen-ai.com/qwen-3-5/
