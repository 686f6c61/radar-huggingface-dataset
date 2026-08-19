# rafmacalaba/gliner2_datause_extended_smoke

## Resumen

El modelo `rafmacalaba/gliner2_datause_extended_smoke` es un fine-tune del modelo base `fastino/gliner2-large-v1` (GLiNER2) orientado a la extracción de menciones de uso de datos en artículos de investigación económica. Desarrollado por el usuario rafmacalaba, el modelo clasifica fragmentos de texto en tres etiquetas: `NAMED_DATA` (nombre propio, título o acrónimo de una fuente de datos concreta), `DESCRIPTIVE_DATA` (fuente descrita en palabras pero sin nombre) y `VAGUE_DATA` (expresión genérica sin fuente identificable). Con 486 millones de parámetros, el modelo se presenta como una herramienta de token-classification para tareas de reconocimiento de entidades nombradas (NER) especializadas en el dominio de datos de investigación.

La relevancia de este modelo radica en su potencial aplicación para el análisis bibliométrico y la extracción estructurada de información sobre conjuntos de datos utilizados en economía, un campo donde la trazabilidad de las fuentes es crítica. Sin embargo, los resultados de evaluación incluidos en la model card muestran un rendimiento nulo (F1 = 0.0) en el conjunto de validación, lo que sugiere que el entrenamiento no ha producido un modelo funcional o que existe un problema en el proceso de evaluación. A pesar de ello, el modelo está disponible bajo licencia Apache 2.0 y puede servir como punto de partida para investigaciones sobre NER especializado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de GLiNER2-large-v1 (arquitectura transformer subyacente) |
| Parametros totales | 486.444.053 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante fine-tune de `fastino/gliner2-large-v1`, un modelo GLiNER2 diseñado para reconocimiento de entidades nombradas de propósito general. GLiNER2 se basa en una arquitectura transformer con atención bidireccional, aunque no se han publicado detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información proporcionada. El entrenamiento se realizó sobre el dataset `rafmacalaba/data-use-mentions-extended` con configuración gliner2, durante 1 época, con un learning rate de 1e-05 para el encoder y 0.0005 para la tarea, batch size de 8 y precisión bf16. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

El proceso de entrenamiento se limitó a un solo paso de fine-tune sin fases de RLHF o DPO. La ausencia de resultados positivos en la evaluación sugiere posibles problemas de convergencia, desajuste entre el dataset y la tarea, o un error en la configuración de evaluación.

## Capacidades

- Token-classification especializado en la extracción de menciones de uso de datos en textos académicos de economía.
- Clasificación en tres etiquetas: `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.
- Soporte para la detección de referencias a datasets, encuestas, censos y registros.
- No se han documentado capacidades adicionales como generación de texto, razonamiento, soporte de tool calling o capacidades multilingües.
- El modelo se integra con la librería GLiNER2 para pipelines de NER.

## Casos de uso

Dado el rendimiento nulo en la evaluación, el modelo no es recomendable para uso en producción. No obstante, los casos de uso teóricos para los que fue diseñado son:

- Análisis bibliométrico de artículos económicos: extraer automáticamente las fuentes de datos citadas en publicaciones para construir mapas de reutilización de datos.
- Revisión sistemática de literatura: identificar qué conjuntos de datos se mencionan en estudios empíricos para facilitar metaanálisis.
- Indexación de repositorios de investigación: etiquetar documentos con las fuentes de datos que utilizan para mejorar la búsqueda y recuperación.
- Detección de dependencias de datos en proyectos de ciencia abierta: localizar menciones de censos, encuestas o registros en propuestas de investigación.
- Asistencia a editores de revistas: verificar que los autores declaren correctamente las fuentes de datos utilizadas.
- Construcción de ontologías de datos: extraer términos descriptivos y nombres propios de fuentes para poblar vocabularios controlados.

En todos estos escenarios, el modelo debería ser reentrenado o corregido antes de cualquier uso real, dado que la evaluación actual muestra que no produce predicciones correctas.

## Benchmarks y rendimiento

Los resultados de evaluación (holdout, label-agnostic) publicados en la model card son los siguientes:

| thr | tp | fp | fn | precision | recall | f0.5 | f1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.10 | 0 | 2 | 7 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 0.20 | 0 | 0 | 7 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 0.30 | 0 | 0 | 7 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 0.40 | 0 | 0 | 7 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 0.50 | 0 | 0 | 7 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 0.60 | 0 | 0 | 7 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 0.70 | 0 | 0 | 7 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |

El mejor F0.5 y F1 son 0.0000 (umbral 0.1). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 486 millones de parámetros, lo que en precisión bf16 ocupa aproximadamente 0.97 GB de memoria (486M × 2 bytes). El tamaño del repositorio es de 1.9 GB, lo que sugiere que puede incluir pesos adicionales o checkpoints.
- VRAM estimada para inferencia: alrededor de 2-3 GB considerando overhead de activaciones y buffers, por lo que cabe en GPUs consumer como la RTX 3060 (12 GB) o RTX 4090 (24 GB).
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM para inferencia en bf16.
- Opciones de despliegue: la librería GLiNER2 permite cargar el modelo directamente; también es compatible con Hugging Face Transformers para token-classification.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, el modelo base `fastino/gliner2-large-v1` podría considerarse una alternativa generalista, aunque no se han publicado métricas comparativas entre ambos.

## Limitaciones y advertencias

- Rendimiento nulo en la evaluación publicada: el modelo no produce ninguna predicción correcta en el conjunto de holdout (F1 = 0.0). Esto indica que el entrenamiento no fue efectivo o que existe un error en la configuración.
- Riesgo de alucinación: al no generar predicciones útiles, el modelo podría emitir etiquetas incorrectas si se utiliza en producción, lo que llevaría a resultados erróneos.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos; dado el dominio específico (economía), podría presentar sesgos hacia ciertos tipos de fuentes o idiomas.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, pero GLiNER2 suele manejar secuencias de hasta 512 tokens; para textos largos se requeriría segmentación.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no se garantiza la calidad o idoneidad del modelo.
- Advertencia para producción: no utilizar este modelo en sistemas reales sin un reentrenamiento completo y una validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/gliner2_datause_extended_smoke
- Dataset de entrenamiento mencionado: `rafmacalaba/data-use-mentions-extended` (no se proporciona URL directa en la información disponible)
- Modelo base: `fastino/gliner2-large-v1` (referenciado en la model card)
