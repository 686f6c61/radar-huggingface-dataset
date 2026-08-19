# BonTori/phobert_llm_results

## Resumen

El modelo `BonTori/phobert_llm_results` es un ajuste fino (fine-tuning) del modelo base `vinai/phobert-base`, un encoder transformer de tipo RoBERTa preentrenado para el vietnamita. Desarrollado por el usuario BonTori, este modelo está orientado a tareas de clasificación de texto, como lo indica su pipeline de `text-classification`. Con 135 millones de parámetros, se trata de un modelo compacto y eficiente para entornos con recursos limitados.

La relevancia de este modelo radica en su adaptación de un encoder multilingüe de alto rendimiento a una tarea específica de clasificación, aunque la documentación pública es escasa: la model card fue generada automáticamente y no detalla el dataset de entrenamiento ni el dominio de aplicación. A pesar de ello, las métricas de evaluación reportadas (accuracy 0,8306 y F1 0,5973) sugieren un rendimiento moderado, probablemente afectado por un desbalanceo de clases. Su licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 135.000.579 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredado de PhoBERT-base, vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un encoder transformer bidireccional con atención de múltiples cabezas. Al ser un ajuste fino de `vinai/phobert-base`, hereda la configuración de capas y dimensiones de dicho modelo, que fue preentrenado con un corpus masivo en vietnamita. El proceso de fine-tuning se realizó con el framework Transformers de HuggingFace, utilizando un optimizador AdamW con tasa de aprendizaje de 2e-5, tamaño de lote de 16, y un scheduler lineal durante 3 épocas. No se especifica el dataset de entrenamiento (aparece como "None" en la model card), ni se menciona el uso de técnicas como RLHF o DPO. La única innovación destacable es la adaptación del modelo base a una tarea de clasificación, aunque los detalles de la tarea (número de clases, etiquetas) no están documentados.

## Capacidades

- Clasificación de texto: el modelo está diseñado para asignar una o varias etiquetas a fragmentos de texto, típico en análisis de sentimiento, detección de spam o categorización de documentos.
- Procesamiento de lenguaje vietnamita: al derivar de PhoBERT-base, es capaz de manejar texto en vietnamita con tokenización subpalabra adaptada a este idioma.
- Inferencia eficiente: con 135M de parámetros, es adecuado para despliegue en CPU o GPU de gama baja, con tiempos de inferencia reducidos.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder puro.
- No se han documentado capacidades multilingües más allá del vietnamita, ni soporte para visión o audio.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar comentarios o publicaciones en vietnamita como positivos, negativos o neutros, útil para monitorización de marca. Su tamaño compacto permite procesar grandes volúmenes en tiempo real.
- Moderación de contenido: puede detectar mensajes ofensivos o inapropiados en foros o plataformas de mensajería, ayudando a filtrar contenido no deseado de forma automática.
- Clasificación de tickets de soporte: en un sistema de atención al cliente, el modelo puede categorizar consultas entrantes por tema (facturación, técnico, ventas) para enrutarlas al departamento adecuado.
- Detección de spam en correos electrónicos: al ser un clasificador binario o multiclase, puede distinguir correos legítimos de spam en vietnamita, integrándose en pipelines de filtrado.
- Categorización de artículos de noticias: permite etiquetar automáticamente noticias por sección (deportes, política, economía) para su organización en portales de contenido.
- Clasificación de intenciones en chatbots: en un asistente virtual en vietnamita, el modelo puede identificar la intención del usuario (pregunta, queja, solicitud) para dirigir la conversación hacia el flujo adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor reporta las siguientes métricas de evaluación durante el entrenamiento, obtenidas sobre un conjunto de evaluación no especificado:

| Metrica | Valor |
|---|---|
| Loss | 0,4929 |
| Accuracy | 0,8306 |
| F1 | 0,5973 |
| Precision | 0,6064 |
| Recall | 0,6092 |

Estos valores indican una precisión aceptable pero un F1 bajo, lo que sugiere un posible desbalanceo entre clases o dificultad en clases minoritarias. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 135M de parámetros, el modelo ocupa aproximadamente 540 MB en FP32 y 270 MB en FP16. Para inferencia en lote, se recomienda al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM, como NVIDIA GTX 1650, RTX 2060, o superiores. También puede ejecutarse en CPU con tiempos de inferencia aceptables para tareas por lotes.
- Compatibilidad con GPU consumer: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: puede servirse mediante HuggingFace Transformers, ONNX Runtime, o exportarse a formatos optimizados como TorchScript. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, al ser un modelo encoder y no generativo.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna (p. ej., RTX 3090), se espera una latencia de pocos milisegundos por muestra, con throughput de cientos de muestras por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de clasificación de texto en vietnamita. El modelo base `vinai/phobert-base` es el punto de referencia natural, pero no se han reportado métricas comparativas. Alternativas como `vinai/phobert-large` (con más parámetros) o modelos multilingües como `xlm-roberta-base` podrían ofrecer mejor rendimiento, pero requieren más recursos. Se recomienda evaluar el modelo en el dominio específico antes de decidir.

## Limitaciones y advertencias

- La model card es generada automáticamente y carece de descripción detallada del dataset, la tarea y las limitaciones de uso.
- El dataset de entrenamiento no está especificado, por lo que el modelo puede no generalizar bien fuera del dominio original.
- El F1 bajo (0,5973) sugiere un rendimiento deficiente en clases minoritarias, lo que puede provocar errores en aplicaciones críticas.
- Al ser un modelo encoder, no es adecuado para generación de texto ni tareas que requieran razonamiento abierto.
- El idioma de trabajo es el vietnamita; no se garantiza un rendimiento aceptable en otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías explícitas de precisión o idoneidad para fines específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BonTori/phobert_llm_results
- Modelo base: https://huggingface.co/vinai/phobert-base
- Paper de PhoBERT (referencia del modelo base): https://aclanthology.org/2020.findings-emnlp.92/
