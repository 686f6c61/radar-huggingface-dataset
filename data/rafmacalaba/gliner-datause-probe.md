# rafmacalaba/gliner-datause-probe

## Resumen

`rafmacalaba/gliner-datause-probe` es un modelo de extracción de menciones de uso de datos (data-use mentions) desarrollado por Rafael Macalaba, ingeniero de IA en el Banco Mundial. Se trata de un fine-tune del modelo base `urchade/gliner_large-v2.1` (GLiNER, un modelo ligero de reconocimiento de entidades nombradas zero-shot) entrenado sobre el dataset `rafmacalaba/data-use-mentions-tiered`, una versión por niveles de `data-use-mentions` donde los tramos considerados ruido (T3/junk) se convierten en negativos duros sin etiquetar. El modelo utiliza una única clase `DATA_MENTION` para identificar menciones reales de conjuntos de datos que conllevan un uso analítico o declarativo (T1 evidencial ∪ T2 declaración), dejando la clasificación de especificidad para un modelo posterior.

La relevancia de este modelo radica en su capacidad para aislar menciones de datos en textos de investigación económica, un paso previo para estudios de reproducibilidad, análisis de reutilización de datos o construcción de catálogos automáticos. Al estar basado en GLiNER, es ligero y puede ejecutarse en CPU, aunque el repositorio pesa 1,8 GB. No se dispone de información sobre el número de parámetros, la longitud de contexto o los idiomas soportados en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (fine-tune de `urchade/gliner_large-v2.1`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 1,8 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `urchade/gliner_large-v2.1`, un modelo GLiNER (Generalist and Lightweight Model for Named Entity Recognition) que permite extraer entidades definidas mediante descripciones en lenguaje natural. En este caso, se ha ajustado para reconocer únicamente la clase `DATA_MENTION`, que abarca menciones de datos con uso evidencial (T1) o declarativo (T2), excluyendo tramos de ruido (T3/junk). El entrenamiento se realizó sobre el dataset `rafmacalaba/data-use-mentions-tiered` (configuración `gliner_tiered`), con una época, learning rate de 5e-06, batch size de 16 y precisión bf16. La selección del checkpoint se hizo mediante un barrido posterior de las épocas evaluando el F0.5 de span en validación, en lugar de usar la pérdida de evaluación.

Una innovación destacable es que el extractor solo se responsabiliza de los límites de la mención; la especificidad (si la mención es nombrada, descriptiva o vaga) se recupera posteriormente mediante un modelo SFT multitarea, lo que permite separar la tarea de detección de la de clasificación fina.

## Capacidades

- Extracción de menciones de uso de datos (clase `DATA_MENTION`) en textos de investigación económica.
- Distinción entre menciones reales (T1 evidencial ∪ T2 declaración) y ruido (T3/junk) mediante negativos duros durante el entrenamiento.
- Modelo de token-classification de una sola clase, sin capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües; el contexto de entrenamiento (papers de economía) sugiere dominio en inglés, pero no está confirmado.

## Casos de uso

- Análisis de literatura económica: identificar automáticamente qué conjuntos de datos se mencionan en artículos de investigación y cómo se utilizan, facilitando revisiones sistemáticas.
- Construcción de catálogos de datos: extraer menciones de datos de documentos para alimentar bases de datos de recursos disponibles en un campo.
- Estudios de reproducibilidad: localizar las fuentes de datos citadas en papers para verificar su accesibilidad y reutilización.
- Automatización de informes: integrar el modelo en pipelines de procesamiento de documentos para extraer referencias a datos en informes institucionales.
- Detección de uso de datos en propuestas de investigación: ayudar a agencias financiadoras a identificar qué datos se planea usar en proyectos.
- Soporte a sistemas de gestión de conocimiento: clasificar documentos según los conjuntos de datos que mencionan, mejorando la búsqueda y recuperación.

## Benchmarks y rendimiento

La evaluación se realizó sobre un holdout del dataset tiered, con emparejamiento húngaro agnóstico de etiquetas y umbral de jaccard ≥ 0.5. Los resultados se presentan para distintos umbrales de decisión (thr). Un falso positivo que coincide con un tramo T3/junk descartado se cuenta como "T3 leak" (menor es mejor).

| thr | tp | fp | fn | precision | recall | f0.5 | f1 | t3_leak | t3_leak% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.10 | 73 | 589 | 1 | 0.1103 | 0.9865 | 0.1341 | 0.1984 | 25 | 4.2% |
| 0.20 | 72 | 305 | 2 | 0.1910 | 0.9730 | 0.2276 | 0.3193 | 23 | 7.5% |
| 0.30 | 70 | 189 | 4 | 0.2703 | 0.9459 | 0.3153 | 0.4204 | 21 | 11.1% |
| 0.40 | 68 | 133 | 6 | 0.3383 | 0.9189 | 0.3872 | 0.4945 | 18 | 13.5% |
| 0.50 | 60 | 76 | 14 | 0.4412 | 0.8108 | 0.4854 | 0.5714 | 15 | 19.7% |
| 0.60 | 50 | 42 | 24 | 0.5435 | 0.6757 | 0.5656 | 0.6024 | 13 | 30.9% |
| 0.70 | 33 | 22 | 41 | 0.6000 | 0.4459 | 0.5612 | 0.5116 | 9 | 40.9% |

El mejor F0.5 es 0.5656 con umbral 0.6, y el mejor F1 es 0.6024 también con umbral 0.6. El desglose por corpus (en el mejor F0.5) muestra un rendimiento muy superior en el corpus `prwp` (F0.5 0.7105) frente a `fcv` (F0.5 0.3693), lo que sugiere una fuerte dependencia del dominio.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM, GPUs recomendadas o latencia en la documentación.
- Al ser un modelo GLiNER large, se espera que sea relativamente ligero y pueda ejecutarse en CPU, pero no hay cifras confirmadas.
- El tamaño del repositorio (1,8 GB) sugiere que los pesos completos ocupan alrededor de 1,8 GB en disco, lo que podría caber en GPUs de consumo como una RTX 3060 (12 GB) o superiores, pero no se ha verificado.
- Opciones de despliegue: al ser un modelo de la librería GLiNER, puede usarse con las herramientas estándar de Hugging Face (transformers, pipelines) y potencialmente con vLLM u Ollama, aunque no se menciona explícitamente.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos con otros modelos en la información proporcionada. Sin embargo, el autor ha publicado otros modelos relacionados:

- `rafmacalaba/gliner-probe`: fine-tune de GLiNER large v2.1 para extracción de menciones de datos con tres clases (`NAMED_DATA`, `DESCRIPTIVE_DATA`, `VAGUE_DATA`), en lugar de una sola clase.
- `rafmacalaba/gliner_datause_extended`: otra variante del mismo enfoque, sin detalles adicionales en la información disponible.

Estos modelos comparten la misma base y tarea, pero difieren en el esquema de etiquetas. No hay métricas públicas para comparar directamente.

## Limitaciones y advertencias

- El modelo está especializado en un dominio concreto (papers de investigación económica) y puede no generalizar bien a otros tipos de texto o dominios.
- La precisión es baja en umbrales bajos (por ejemplo, 0.11 a thr 0.1), lo que indica una alta tasa de falsos positivos; se requiere un umbral alto (0.6-0.7) para obtener una precisión razonable, a costa de perder recall.
- La fuga T3 (t3_leak) aumenta con el umbral, llegando al 40.9% a thr 0.7, lo que significa que una parte significativa de los falsos positivos corresponde a ruido que debería haberse descartado.
- No se especifican los idiomas soportados; el entrenamiento probablemente se realizó con textos en inglés, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es muy específico y puede requerir reentrenamiento para otros dominios.
- No se han publicado detalles sobre sesgos o alucinaciones; al ser un modelo de extracción de entidades, el riesgo de alucinación es menor que en modelos generativos, pero los errores de etiquetado pueden propagarse en pipelines posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/gliner-datause-probe
- Dataset de entrenamiento: https://huggingface.co/datasets/rafmacalaba/data-use-mentions-tiered
- Modelo relacionado `gliner-probe`: https://huggingface.co/rafmacalaba/gliner-probe
- Modelo relacionado `gliner_datause_extended`: https://huggingface.co/rafmacalaba/gliner_datause_extended
- Perfil de GitHub del autor: https://github.com/rafmacalaba
- Repositorio de GLiNER: https://github.com/urchade/GLiNER
