# jefftherover/pii-dual-mmbert-base-v4

## Resumen

`jefftherover/pii-dual-mmbert-base-v4` es un modelo de clasificación de tokens (token-classification) orientado a la detección de información personal identificable (PII). Se trata de un ajuste fino (fine-tune) del modelo base `jhu-clsp/mmBERT-base`, un encoder multilingüe moderno desarrollado por el JHU-CLSP que emplea una arquitectura basada en ModernBERT y ha sido entrenado sobre 3 billones de tokens en 1833 idiomas mediante un novedoso esquema de aprendizaje por lenguaje anealed. El modelo resultante tiene 307.575.611 parámetros totales, lo que lo sitúa en la gama de los encoders base de tamaño medio.

La relevancia de este modelo radica en que combina la capacidad multilingüe de mmBERT con una tarea específica de alto valor práctico: la identificación y etiquetado de entidades PII en texto. Aunque la model card no detalla el dataset de entrenamiento ni las etiquetas exactas, el nombre "dual" sugiere una posible arquitectura con dos cabezas de clasificación, aunque no se confirma en la documentación disponible. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones, y está disponible en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) basado en mmBERT-base |
| Parametros totales | 307.575.611 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (heredado de mmBERT, que cubre 1833 idiomas, pero no se especifica para este fine-tune) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder multilingüe moderno que sigue la arquitectura de ModernBERT (transformers con atención clásica, pero optimizada para eficiencia). mmBERT-base tiene 307M parámetros totales, de los cuales 110M corresponden a parámetros no-embedding, y su vocabulario amplio es el responsable del tamaño total. El fine-tune se realizó con la librería Transformers, utilizando un pipeline de token-classification. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 5e-05, tamaño de lote de 16 (con acumulación de gradientes de 2, lote efectivo de 32), optimizador AdamW con betas (0.9, 0.999), scheduler de coseno con reinicios, 200 pasos de warmup y 4 épocas. Se usó precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card, por lo que se desconoce su composición y tamaño. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de tokens para detección de PII: el modelo está diseñado para etiquetar entidades como nombres, direcciones, números de teléfono, correos electrónicos, etc., aunque las etiquetas concretas no se documentan.
- Multilingüismo potencial: al estar basado en mmBERT, hereda la capacidad de procesar texto en cientos de idiomas, aunque no se confirma si el fine-tune mantiene esta cobertura.
- No se reporta soporte para tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es un modelo exclusivamente de codificación (encoder) para tareas de etiquetado.

## Casos de uso

- Anonimización de documentos legales y médicos: el modelo puede identificar y etiquetar PII en contratos, historiales clínicos o expedientes, facilitando su posterior redacción o enmascaramiento automático.
- Cumplimiento del RGPD: integración en pipelines de procesamiento de datos para localizar información personal en bases de texto y aplicar políticas de privacidad.
- Sanitización de logs de aplicaciones: detección de direcciones IP, correos o nombres de usuario en logs de servidores antes de su almacenamiento o análisis.
- Preparación de datasets para entrenamiento de LLMs: filtrado de PII en corpus de texto para evitar la fuga de información personal en modelos generativos.
- Moderación de contenido en plataformas: identificación de datos personales en comentarios o mensajes para su revisión o eliminación.
- Extracción de entidades en sistemas de atención al cliente: etiquetado automático de datos personales en conversaciones para enrutamiento o análisis posterior.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks comparativos (el campo `model-index` está vacío). Sin embargo, el autor reporta las siguientes métricas de evaluación sobre un conjunto de validación no especificado:

| Metrica | Valor |
|---|---|
| Loss | 0.0002 |
| Precision | 0.9997 |
| Recall | 0.9998 |
| F1 | 0.9997 |
| Accuracy | 0.9999 |

Estos valores son excepcionalmente altos, lo que podría indicar un sobreajuste al conjunto de evaluación o un dataset de validación poco representativo. No se dispone de comparaciones con otros modelos de detección de PII.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307M parámetros, en FP32 el modelo ocupa aproximadamente 1,2 GB; en FP16, unos 0,6 GB. La inferencia en CPU es viable, aunque más lenta.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en FP16. Para lotes grandes o despliegue concurrente, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A10, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con Hugging Face Inference Endpoints, o mediante librerías como vLLM (aunque vLLM está más orientado a generación, también soporta tareas de clasificación de tokens), o simplemente con la API de Transformers en un servidor Python.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, la inferencia en GPU suele ser del orden de milisegundos por secuencia corta, pero depende del hardware y la longitud del texto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de detección de PII. Como referencia cualitativa, se puede comparar con otros fine-tunes de encoders multilingües como XLM-R o mBERT, pero no hay métricas públicas de este modelo frente a ellos. El modelo base mmBERT ha demostrado superar a XLM-R en tareas multilingües, por lo que es plausible que este fine-tune herede esa ventaja, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica qué datos se usaron para el fine-tune, lo que impide evaluar posibles sesgos o la cobertura real de idiomas y tipos de PII.
- Métricas de evaluación sospechosamente altas: valores de F1 y accuracy cercanos a 1.0 sugieren un posible sobreajuste al conjunto de validación o un dataset de prueba poco desafiante. Se recomienda validar el modelo en datos independientes antes de usarlo en producción.
- Sin documentación de etiquetas: no se detallan las categorías de PII que reconoce el modelo, lo que dificulta su integración en sistemas que requieren tipos específicos de entidades.
- Longitud de contexto no especificada: aunque mmBERT-base probablemente soporta 8192 tokens (según el paper de ModernBERT), no se confirma para este fine-tune, por lo que se debe asumir un límite conservador.
- Riesgo de alucinación en etiquetado: como cualquier modelo de NER, puede producir falsos positivos o negativos, especialmente en textos con formatos inusuales o en idiomas poco representados en el entrenamiento.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías y el autor no ofrece soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jefftherover/pii-dual-mmbert-base-v4
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper de mmBERT: https://arxiv.org/html/2509.06888v1
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT
- Versión anterior del mismo modelo (v2): https://huggingface.co/jefftherover/pii-dual-mmbert-base-v2
