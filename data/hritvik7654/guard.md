# Hritvik7654/guard

## Resumen

El modelo `Hritvik7654/guard` es un fine-tuning del modelo encoder `answerdotai/ModernBERT-base`, desarrollado por Hritvik Gupta (usuario Hritvik7654 en HuggingFace). Se trata de un modelo de clasificación de texto (pipeline `text-classification`) con 149,6 millones de parámetros, licencia Apache-2.0 y pesos en formato safetensors. La model card es extremadamente escasa: no especifica el dataset de entrenamiento, la tarea concreta ni las capacidades previstas, más allá de indicar que es un ajuste fino generado automáticamente con el Trainer de HuggingFace.

A pesar de la falta de documentación, las métricas de evaluación reportadas durante el entrenamiento muestran un rendimiento muy alto en términos de AUPRC (0,9955), AUROC (0,9975) y TPR@1FPR (0,9475), lo que sugiere que el modelo fue entrenado para una tarea de clasificación binaria o de detección de alguna característica específica. La relevancia actual radica en que ModernBERT-base es un modelo moderno y eficiente, y este fine-tuning podría ser útil en tareas de clasificación, aunque sin más detalles resulta difícil evaluar su aplicabilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base, típicamente 4096 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `answerdotai/ModernBERT-base`, un encoder transformer de tipo BERT modernizado que incorpora mejoras como atención con ventana deslizante y atención global intercalada para manejar secuencias largas con mayor eficiencia. El fine-tuning se realizó con el Trainer de HuggingFace, usando un learning rate de 3e-05, batch de entrenamiento de 32, batch de evaluación de 128, optimizador AdamW (fused), scheduler lineal con warmup ratio de 0,06 y 2 épocas. El dataset de entrenamiento se indica como "None", lo que sugiere que no se ha documentado públicamente. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un ajuste fino supervisado estándar.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación, aunque la etiqueta concreta no se especifica.
- Métricas de evaluación muy altas (AUPRC 0,9955, AUROC 0,9975) que indican un ajuste fino efectivo sobre el conjunto de evaluación utilizado durante el entrenamiento.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento multi-step, visión ni audio.
- Capacidades multilingües: no disponibles; depende del modelo base ModernBERT, que soporta principalmente inglés, pero no se confirma.
- No se indica soporte para modo thinking ni funciones especiales.

## Casos de uso

- Detección de contenido inapropiado o dañino: el nombre "guard" sugiere un posible uso como moderador de contenido, aunque no se confirma. Si es así, podría integrarse en pipelines de moderación para clasificar texto en categorías de riesgo.
- Filtrado de spam o phishing: un clasificador binario con estas métricas podría utilizarse para identificar mensajes no deseados en sistemas de correo o chat.
- Análisis de sentimiento: aunque no se especifica, la arquitectura de clasificación permite adaptarlo a tareas de sentimiento si se reentrena con los datos adecuados.
- Clasificación de intenciones en asistentes virtuales: útil para enrutar consultas de usuarios a los módulos correspondientes.
- Detección de toxicidad en comentarios: aplicable en plataformas sociales para filtrar comentarios ofensivos.
- Evaluación de calidad de respuestas generadas por otros modelos: podría servir como clasificador de aceptabilidad en sistemas RAG o de generación.

Dado que no se conoce la tarea exacta, estos casos son hipotéticos y requieren validación con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye resultados en MMLU, HumanEval, GSM8K ni otros estándares. Las únicas métricas disponibles son las de validación durante el entrenamiento, que se muestran a continuación:

| Metrica | Valor final |
|---|---|
| Loss de validacion | 0,0726 |
| AUPRC | 0,9955 |
| AUROC | 0,9975 |
| TPR@1FPR | 0,9475 |

Estos valores son internos del proceso de entrenamiento y no permiten comparar con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 149 millones de parámetros en precisión FP32, se necesitan aproximadamente 600 MB de memoria para los pesos. En FP16 serían unos 300 MB. Inferencia en CPU es viable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo cómodamente. Tarjetas como NVIDIA T4, RTX 3060, RTX 4090 o superiores son suficientes.
- Cabe en GPUs de consumo: sí, incluso en GPUs integradas con suficiente RAM compartida.
- Opciones de despliegue: compatible con HuggingFace Transformers, puede servirse con Text Embeddings Inference (TEI) según las etiquetas, y también con vLLM o TGI si se adapta. Para CPU, se puede usar ONNX Runtime o llama.cpp (aunque es un encoder, no un LLM generativo).
- Latencia y throughput: no disponibles. Para un modelo de este tamaño, en GPU se esperan latencias de milisegundos por lote pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hritvik7654/guard | 149,6 M | no disponible | Apache-2.0 | Fine-tuning de ModernBERT-base, tarea desconocida |
| answerdotai/ModernBERT-base | 149 M | 4096 tokens (típico) | Apache-2.0 | Modelo base, sin fine-tuning |
| bert-base-uncased | 110 M | 512 tokens | Apache-2.0 | Clásico, menor contexto y rendimiento |

No se dispone de comparativas de rendimiento con estos modelos porque no se han publicado benchmarks del modelo fine-tuneado.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento, por lo que se desconoce el dominio de aplicación y los posibles sesgos.
- No se ha documentado la tarea concreta de clasificación; usarlo en dominios distintos al entrenado puede producir resultados erróneos.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas si los datos de entrada difieren del dominio de entrenamiento.
- Limitaciones de idioma: no se indica qué idiomas soporta; probablemente solo inglés si sigue al modelo base.
- Licencia Apache-2.0 permite uso comercial, pero al ser un fine-tuning de un modelo con licencia Apache-2.0, se deben mantener los avisos de copyright.
- Sin garantías de rendimiento en producción; las métricas reportadas son de un conjunto de evaluación no descrito.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hritvik7654/guard
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Perfil del autor en HuggingFace: https://huggingface.co/Hritvik7654 (inferido, no confirmado en la información proporcionada)
