# rafmacalaba/gliner_datause_tiered

## Resumen

`rafmacalaba/gliner_datause_tiered` es un modelo de reconocimiento de entidades nombradas (NER) especializado en la extracción de menciones de uso de datos (data-use mentions) a partir de texto. Se trata de un fine-tune del modelo base `urchade/gliner_large-v2.1`, entrenado sobre el dataset `rafmacalaba/data-use-mentions-tiered`, una versión curada que elimina los spans considerados como no menciones (T3/junk) y los convierte en negativos duros. El modelo utiliza una única clase `DATA_MENTION` para identificar menciones reales que implican un uso analítico o declarativo de datos (T1 evidencial ∪ T2 declaración).

La relevancia de este modelo radica en su enfoque de supervisión "tiered" (por niveles), que mejora la precisión frente a un extractor de tres clases al reducir las fugas de falsos positivos (T3 leak). Según la model card, alcanza un F0.5 de 0.8667 en el conjunto de validación, superando al baseline de tres clases (0.7855). Está diseñado para integrarse en pipelines de análisis de documentos legales, políticas de privacidad o cualquier texto donde sea necesario identificar menciones de uso de datos.

El modelo se distribuye bajo licencia Apache 2.0 y está implementado con la librería GLiNER, lo que facilita su uso en tareas de token-classification. El tamaño del repositorio es de 1.8 GB, lo que sugiere un modelo de tamaño medio (probablemente cientos de millones de parámetros, aunque no se especifica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en GLiNER large v2.1 (transformer encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `urchade/gliner_large-v2.1`, un modelo de NER basado en arquitectura transformer encoder, diseñado para extracción de entidades con capacidad zero-shot. En este caso, se ha ajustado para una tarea específica de clasificación de tokens con una única etiqueta `DATA_MENTION`. El entrenamiento se realizó sobre el dataset `rafmacalaba/data-use-mentions-tiered`, que es una versión del dataset original `data-use-mentions` donde los spans considerados como no menciones (T3/junk) se eliminan y se tratan como negativos duros (el texto permanece, pero el span se elimina). Esto permite que el modelo aprenda a distinguir menciones reales de ruido.

Los hiperparámetros de entrenamiento incluyen 5 épocas, learning rate de 5e-06, batch size de 16 y precisión bf16. La selección del checkpoint se realizó mediante una búsqueda posterior sobre el F0.5 en el conjunto de validación, en lugar de usar la pérdida de evaluación. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es supervisado estándar con focal loss (alpha 0.75, gamma 2) sin cambios en la función de pérdida.

## Capacidades

- Extracción de menciones de uso de datos (DATA_MENTION) en texto, identificando spans que representan un uso analítico o declarativo de datos.
- Clasificación de tokens a nivel de span, con capacidad de distinguir entre menciones reales y ruido (T3/junk) gracias a la supervisión tiered.
- Integración con la librería GLiNER, lo que permite su uso en pipelines de NER estándar.
- No se reportan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio. Es un modelo puramente de NER.

## Casos de uso

- Análisis de políticas de privacidad: extraer automáticamente las menciones de uso de datos personales en documentos legales para verificar cumplimiento normativo (GDPR, CCPA, etc.). El modelo identifica frases como "usamos sus datos para personalizar anuncios" como menciones de uso.
- Auditoría de contratos de datos: en contratos de licencia o acuerdos de intercambio de datos, localizar cláusulas que describan finalidades de uso, facilitando la revisión legal.
- Cumplimiento de regulaciones sectoriales: en sectores como salud o finanzas, detectar menciones de uso de datos en informes o comunicaciones para asegurar que se alinean con las políticas internas.
- Investigación en ciencias sociales: analizar grandes volúmenes de texto (encuestas, foros, redes sociales) para identificar cómo se describen los usos de datos, apoyando estudios sobre privacidad percibida.
- Monitorización de avisos de privacidad en sitios web: extraer menciones de uso de datos de las páginas de avisos legales para comparar con las prácticas reales de la empresa.
- Construcción de bases de datos de conocimiento: alimentar un grafo de conocimiento con las menciones de uso de datos extraídas de documentos, permitiendo consultas estructuradas sobre qué datos se usan y para qué.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en el conjunto de validación tiered (holdout). Se utilizó un emparejamiento húngaro sin etiquetas con umbral de Jaccard >= 0.5. La siguiente tabla muestra las métricas a diferentes umbrales de confianza:

| thr | tp | fp | fn | precision | recall | f0.5 | f1 | t3_leak | t3_leak% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.10 | 16812 | 9110 | 353 | 0.6486 | 0.9794 | 0.6956 | 0.7804 | 2829 | 31.1% |
| 0.20 | 16664 | 6850 | 501 | 0.7087 | 0.9708 | 0.7491 | 0.8193 | 2335 | 34.1% |
| 0.30 | 16505 | 5607 | 660 | 0.7464 | 0.9615 | 0.7814 | 0.8404 | 2002 | 35.7% |
| 0.40 | 16275 | 4623 | 890 | 0.7788 | 0.9482 | 0.8076 | 0.8552 | 1741 | 37.7% |
| 0.50 | 15934 | 3701 | 1231 | 0.8115 | 0.9283 | 0.8325 | 0.8660 | 1498 | 40.5% |
| 0.60 | 15195 | 2735 | 1970 | 0.8475 | 0.8852 | 0.8548 | 0.8659 | 1203 | 44.0% |
| 0.70 | 13793 | 1808 | 3372 | 0.8841 | 0.8036 | 0.8667 | 0.8419 | 876 | 48.4% |

El mejor F0.5 es 0.8667 (thr=0.7) y el mejor F1 es 0.8660 (thr=0.5). La comparación con el baseline de tres clases (entrenado sobre el dataset original sin tiered) muestra una mejora sustancial en F0.5 y una reducción del t3_leak% en todos los umbrales. Por ejemplo, a thr=0.5, el baseline tiene un t3_leak% de 70.6% mientras que el modelo tiered tiene 40.5%.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información disponible. Sin embargo, al ser un modelo basado en GLiNER large (tamaño medio, probablemente ~200M parámetros), se puede inferir que:

- La inferencia puede ejecutarse en CPU con un rendimiento aceptable para tareas de NER por lotes.
- En GPU, una tarjeta con 4-8 GB de VRAM sería suficiente para inferencia en batch pequeño (por ejemplo, RTX 3060, RTX 4060).
- Para entrenamiento o fine-tuning adicional, se recomendaría una GPU con al menos 8-12 GB de VRAM (por ejemplo, RTX 3080, A10).
- El tamaño del repositorio (1.8 GB) sugiere que los pesos en precisión completa (fp32) ocupan aproximadamente ese espacio; con cuantización a int8 o fp16 se reduciría a la mitad o menos.
- Opciones de despliegue: al ser un modelo GLiNER, se puede usar con la librería `gliner` (pip), o exportar a ONNX para inferencia en producción. También es compatible con frameworks como Hugging Face Transformers (aunque GLiNER tiene su propia API).

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos comparables específicos para extracción de menciones de uso de datos. El propio autor ha publicado otros dos modelos relacionados: `rafmacalaba/gliner_datause` y `rafmacalaba/gliner_datause_extended`, pero no se proporcionan detalles de sus métricas. La comparación más relevante es con el baseline de tres clases mencionado en la model card, que es un extractor de especificidad entrenado sobre el dataset original. En la tabla de benchmarks se observa que el modelo tiered supera al baseline en F0.5 y reduce significativamente las fugas de T3. No se dispone de comparaciones con modelos NER genéricos como SpaCy o Stanford NER, ya que la tarea es muy específica.

## Limitaciones y advertencias

- El modelo está especializado en un dominio concreto (menciones de uso de datos) y no es adecuado para tareas NER generales.
- La tasa de fuga T3 (t3_leak%) es alta en umbrales bajos (31.1% a thr=0.10), lo que indica que muchos falsos positivos corresponden a spans que deberían haberse descartado. Para uso en producción, se recomienda seleccionar un umbral alto (0.6-0.7) para minimizar este efecto, aunque a costa de reducir el recall.
- No se especifican los idiomas soportados; el dataset probablemente sea en inglés, pero no está confirmado. El modelo podría no funcionar bien en otros idiomas.
- No se reportan sesgos específicos, pero al ser un modelo entrenado sobre un dataset particular, puede heredar sesgos del mismo (por ejemplo, en la definición de qué constituye una mención de uso).
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el dataset de entrenamiento no tenga restricciones adicionales (no se indica).
- El modelo no tiene capacidades de razonamiento o generación; es exclusivamente un extractor de spans.

## Enlaces

- Modelo en Hugging Face: [rafmacalaba/gliner_datause_tiered](https://huggingface.co/rafmacalaba/gliner_datause_tiered)
- Modelo relacionado: [rafmacalaba/gliner_datause](https://huggingface.co/rafmacalaba/gliner_datause)
- Modelo relacionado: [rafmacalaba/gliner_datause_extended](https://huggingface.co/rafmacalaba/gliner_datause_extended)
- Dataset de entrenamiento: [rafmacalaba/data-use-mentions-tiered](https://huggingface.co/datasets/rafmacalaba/data-use-mentions-tiered)
- Librería GLiNER: [gliner en PyPI](https://pypi.org/project/gliner/)
- Información general sobre GLiNER: [AI/TLDR - GLiNER](https://ai-tldr.dev/tools/gliner/)
