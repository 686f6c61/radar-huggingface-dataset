# rafmacalaba/gliner-probe

## Resumen

`rafmacalaba/gliner-probe` es un modelo de extracción de entidades (NER) especializado en la detección de menciones de uso de datos en artículos de investigación económica. Se trata de un fine-tune del modelo base `urchade/gliner_large-v2.1`, desarrollado por Rafael Macalaba, ingeniero de IA y ML en el Grupo Banco Mundial. El modelo identifica tres tipos de menciones: fuentes de datos con nombre propio (`NAMED_DATA`), descripciones sin nombre (`DESCRIPTIVE_DATA`) y referencias genéricas sin fuente identificable (`VAGUE_DATA`).

La relevancia de este modelo radica en su aplicación para el análisis bibliométrico y de reproducibilidad en ciencias sociales, permitiendo rastrear qué conjuntos de datos, encuestas o censos se utilizan en la literatura académica. Al estar basado en GLiNER, hereda la capacidad de extracción condicionada por esquemas en lenguaje natural, lo que facilita su adaptación a nuevas categorías sin reentrenamiento completo. El repositorio tiene un tamaño de 3,6 GB, aunque no se especifican los parámetros totales ni la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en GLiNER large v2.1 (encoder transformer con extracción condicionada por esquemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base GLiNER es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo se construye sobre GLiNER large v2.1, una arquitectura de encoder transformer que reformula la extracción de entidades como un problema de emparejamiento semántico entre tramos de texto y descripciones en lenguaje natural. Esto permite definir tipos de entidad arbitrarios mediante etiquetas textuales, en lugar de depender de un conjunto fijo de clases. El fine-tune se realizó sobre el dataset `rafmacalaba/usage-sensitivity-probe` (configuración gliner), con el corpus completo, durante 3 épocas, con una tasa de aprendizaje de 5e-06, tamaño de lote de 16 y precisión bf16. No se dispone de información sobre el preentrenamiento del modelo base ni sobre la composición exacta del dataset de entrenamiento.

## Capacidades

- Extracción de menciones de uso de datos en textos académicos, clasificándolas en tres categorías: `NAMED_DATA` (nombre propio, título o acrónimo de una fuente específica), `DESCRIPTIVE_DATA` (fuente descrita con palabras pero sin nombre) y `VAGUE_DATA` (terminología genérica sin fuente identificable).
- Hereda de GLiNER la capacidad de extracción condicionada por esquemas, lo que permite definir nuevas etiquetas en lenguaje natural sin reentrenamiento.
- Especialización en el dominio de la investigación económica, con buen rendimiento en documentos de organizaciones como el Banco Mundial, ReliefWeb y otros.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- Análisis bibliométrico de literatura económica: el modelo puede procesar grandes volúmenes de artículos para identificar qué fuentes de datos (encuestas, censos, registros) se citan, facilitando estudios de tendencias y patrones de uso.
- Estudios de reproducibilidad: al extraer menciones de datos, los investigadores pueden verificar si los conjuntos de datos utilizados en un paper están disponibles y son accesibles, mejorando la transparencia científica.
- Sistemas de recomendación de datos: integrando el modelo en un pipeline, se pueden conectar automáticamente artículos con los datasets que mencionan, permitiendo sugerir fuentes relevantes a otros investigadores.
- Monitoreo de impacto de datasets: las agencias financiadoras y organismos como el Banco Mundial pueden rastrear cómo se utilizan sus datos en la literatura, evaluando su impacto y alcance.
- Automatización de revisiones sistemáticas: en revisiones de literatura, el modelo puede extraer rápidamente las menciones de datos de cientos de documentos, reduciendo el trabajo manual de codificación.
- Integración en pipelines de NLP para ciencias sociales: el modelo puede combinarse con otras herramientas de extracción de información para construir bases de datos estructuradas sobre el uso de datos en investigación.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto de retención (holdout) con 2901 ejemplos y 2195 tramos. Se reportan métricas a diferentes umbrales de confianza:

| Umbral | TP | FP | FN | Precisión | Recall | F0.5 | F1 |
|---|---|---|---|---|---|---|---|
| 0.10 | 2153 | 3550 | 36 | 0.3775 | 0.9836 | 0.4306 | 0.5456 |
| 0.20 | 2132 | 2728 | 57 | 0.4387 | 0.9740 | 0.4929 | 0.6049 |
| 0.30 | 2086 | 2171 | 103 | 0.4900 | 0.9529 | 0.5427 | 0.6472 |
| 0.40 | 2009 | 1699 | 180 | 0.5418 | 0.9178 | 0.5902 | 0.6814 |
| 0.50 | 1862 | 1179 | 327 | 0.6123 | 0.8506 | 0.6486 | 0.7120 |
| 0.60 | 1544 | 695 | 645 | 0.6896 | 0.7053 | 0.6927 | 0.6974 |
| 0.70 | 1019 | 299 | 1170 | 0.7731 | 0.4655 | 0.6829 | 0.5811 |

El mejor F0.5 es 0.6927 (umbral 0.6) y el mejor F1 es 0.7120 (umbral 0.5). El desglose por grupos muestra un rendimiento variable: en el grupo `general_prwp` se alcanza un F1 de 0.7010, en `fcv` 0.6937, mientras que en `jdc_operational` el F1 baja a 0.5000. Por etiqueta, `NAMED_DATA` obtiene un F1 de 0.5704, `DESCRIPTIVE_DATA` 0.5716 y `VAGUE_DATA` 0.5763, todos con umbrales de 0.6 o 0.7. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este modelo.
- El tamaño del repositorio es de 3,6 GB, lo que sugiere un modelo de cientos de millones de parámetros, pero no se puede determinar con exactitud.
- Dado que se basa en GLiNER large, es probable que pueda ejecutarse en GPUs de consumo con al menos 8 GB de VRAM en bf16, pero esta es una estimación no confirmada.
- Para despliegue, se puede utilizar la librería `gliner` (PyTorch) o exportar a formatos como ONNX o GGUF, aunque no se documentan opciones específicas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo base `urchade/gliner_large-v2.1` es la referencia natural, pero no se ofrecen métricas comparadas. Tampoco se mencionan alternativas como `rafmacalaba/gliner_datause` u otros fine-tunes de GLiNER.

## Limitaciones y advertencias

- El modelo está especializado en el dominio de la investigación económica y puede no generalizar bien a otros dominios o tipos de texto.
- Las métricas de evaluación muestran un equilibrio entre precisión y recall que depende del umbral; para aplicaciones donde los falsos positivos son costosos, se recomienda un umbral alto (0.6-0.7), mientras que para maximizar recall se puede usar un umbral bajo.
- La etiqueta `VAGUE_DATA` presenta la precisión más baja (0.5598 a umbral 0.7), lo que indica dificultad para distinguir menciones genéricas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de organizaciones internacionales, puede reflejar sesgos presentes en esos corpus.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos del modelo base `urchade/gliner_large-v2.1` para posibles restricciones adicionales.
- No se especifica la longitud de contexto máxima, por lo que textos muy largos pueden requerir truncamiento o procesamiento por fragmentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/gliner-probe
- Perfil del autor en Hugging Face: https://huggingface.co/rafmacalaba
- Perfil del autor en GitHub: https://github.com/rafmacalaba
- Documentación de GLiNER: https://github.com/urchade/GLiNER/blob/main/docs/usage.md
- Tema sobre GLiNER: https://www.emergentmind.com/topics/gliner
