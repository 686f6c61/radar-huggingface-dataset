# DT4H/CardioBERTa.ro_P_enriched

## Resumen

`DT4H/CardioBERTa.ro_P_enriched` es un encoder de terminología biomédica en rumano, especializado en normalización de conceptos clínicos y entity linking, desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo centrado en la reutilización de datos de salud cardiovasculares. El modelo se inicializa desde `DT4H/CardioBERTa.ro`, un miembro de la familia CardioBERTa, adaptado mediante entrenamiento continuo con MLM sobre corpus cardiológicos y biomédicos rumanos. La variante `_P_enriched` utiliza una estrategia de entrenamiento basada en tripletas supervisadas por conceptos UMLS, enriquecidas con relaciones ontológicas de nivel "padre", para mejorar la capacidad de agrupar términos clínicos equivalentes.

El modelo tiene 278 millones de parámetros y está disponible en formato safetensors. Su arquitectura es un transformer encoder de tipo XLM-RoBERTa, con una ventana de contexto de entrenamiento limitada a 25 tokens, lo que lo hace adecuado para la representación de términos cortos, no para documentos completos. Se distribuye con una licencia no especificada y está pensado para ser usado en pipelines de procesamiento de lenguaje natural clínico en rumano, especialmente en cardiología, como parte de un ecosistema multilingüe de normalización de conceptos clínicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) |
| Parámetros totales | 278 043 648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (máximo de entrenamiento; contexto del modelo base no especificado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Rumano (`ro`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un encoder transformer preentrenado multilingüe, adaptado al dominio cardiológico mediante entrenamiento continuo con MLM sobre corpus biomédicos y cardiológicos en rumano, dando lugar a `CardioBERTa.ro`. Posteriormente, se ha especializado en la normalización de conceptos clínicos mediante aprendizaje de métricas (metric learning) con tripletas supervisadas por conceptos UMLS (CUI). La estrategia `parents` amplía las tripletas originales de sinónimos con relaciones ontológicas de nivel padre, generando un conjunto de 1 607 064 tripletas que cubren 476 350 CUIs y 531 693 términos normalizados únicos.

El entrenamiento utilizó la función de pérdida Multi-Similarity Loss, con pooling sobre el token CLS, una época, tamaño de lote 256, tasa de aprendizaje 2e-5 y longitud máxima de 25 tokens. No se incluye la terminología de entrenamiento en el repositorio por restricciones de licencia UMLS, solo se publican las estadísticas agregadas. El modelo no ha sido entrenado con técnicas de RLHF ni DPO, y no es un modelo generativo; su salida es una representación vectorial normalizada (embedding) de la entrada.

## Capacidades

- Generación de embeddings semánticos para términos clínicos en rumano, normalizados mediante pooling CLS y normalización L2.
- Normalización de conceptos clínicos: mapeo de términos de texto libre a conceptos UMLS (CUI).
- Entity linking: permite asociar menciones en informes clínicos a conceptos ontológicos estandarizados.
- Recuperación de candidatos: búsqueda de términos similares mediante similitud coseno en el espacio de embeddings.
- Soporte de entradas de hasta 25 tokens, adecuado para términos o expresiones cortas.
- No soporta tool calling ni agentes; es un modelo de solo encoder.
- No es multilingüe; está entrenado exclusivamente para rumano.

## Casos de uso

- **Normalización de términos en informes de cardiología en rumano**: el modelo puede convertir expresiones clínicas libres en conceptos UMLS estandarizados, facilitando la estructuración de datos de pacientes.
- **Entity linking en historiales clínicos electrónicos**: integrado en un pipeline de NLP, permite enlazar menciones de enfermedades, fármacos o procedimientos cardiológicos a sus códigos CUI correspondientes.
- **Búsqueda semántica de conceptos biomédicos**: dado un término de entrada, se puede recuperar un conjunto de candidatos relacionados mediante la similitud coseno de los embeddings, útil en herramientas de anotación asistida.
- **Construcción de pipelines de interoperabilidad europea**: en el marco del proyecto DataTools4Heart, el modelo ayuda a homogeneizar la terminología cardiológica rumana para su integración en repositorios federados de datos de salud.
- **Anotación de corpus clínicos**: los embeddings generados se pueden usar para predecir etiquetas de entidades nombradas o para agrupar términos equivalentes en tareas de anotación.
- **Apoyo a la codificación automática de informes médicos**: combinado con un clasificador, el modelo puede sugerir códigos de clasificación (p. ej., ICD) basados en la similitud del texto con términos canónicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta tablas de rendimiento comparativo en la model card.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 278 M de parámetros en FP16, el peso ocupa aproximadamente 556 MB, por lo que se puede ejecutar en GPUs con 2 GB de VRAM o menos, dejando margen para el lote y los activadores.
- **GPU recomendadas**: tarjetas de gama media como NVIDIA RTX 3060 (12 GB) o superiores. En CPU también es viable para inferencia de baja latencia, dado su tamaño moderado.
- **Compatibilidad con GPU consumer**: sí, cabe en la mayoría de tarjetas de consumo actuales, incluyendo GTX 1660 Super, RTX 2060, etc.
- **Opciones de despliegue**: se puede usar con la librería `transformers`, con `sentence-transformers` para generar embeddings de frases, y con `text-embeddings-inference` (TEI) para despliegue en producción, según los tags del modelo.
- **Latencia y throughput**: no hay datos publicados, pero para un encoder de este tamaño, la inferencia en GPU suele ser de milisegundos por ejemplo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La familia CardioBERTa incluye variantes para otros idiomas, pero no hay datos de rendimiento comparativo. Se recomienda consultar la colección de la familia en Hugging Face para conocer las variantes disponibles.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en rumano, por lo que no es utilizable en otros idiomas.
- Su ventana de contexto está limitada a 25 tokens de entrenamiento, por lo que no es adecuado para procesar documentos completos; solo términos o frases cortas.
- La licencia del modelo no está especificada, lo que puede limitar su uso comercial sin consultar con los autores.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS; solo se publican estadísticas.
- No está destinado a decisiones clínicas directas; es una herramienta de procesamiento de texto, y su uso en entornos clínicos requiere validación adicional.
- Puede heredar sesgos presentes en los datos de entrenamiento biomédicos, aunque no se han documentado casos específicos.
- Al ser un modelo de embeddings, no genera texto explicativo ni razonamiento; su salida es un vector numérico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/CardioBERTa.ro_P_enriched)
- [Colección CardioBERTa Family](https://huggingface.co/collections/DT4H/cardioberta-family)
- [CardioBERTa.en (variante inglesa)](https://huggingface.co/DT4H/CardioBERTa.en)
- [Organización DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- Referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (sin enlace directo).</think>## Resumen

`DT4H/CardioBERTa.ro_P_enriched` es un encoder de terminología biomédica en rumano, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto europeo DataTools4Heart (DT4H), se inicializa desde `DT4H/CardioBERTa.ro`, un modelo de la familia CardioBERTa adaptado al dominio cardiológico mediante entrenamiento continuo con masked language modeling. La variante `_P_enriched` se entrena con tripletas supervisadas por conceptos UMLS, enriquecidas con relaciones ontológicas de nivel "parent", para mejorar la agrupación de términos clínicos equivalentes.

Con 278 millones de parámetros, este modelo de arquitectura XLM-RoBERTa genera embeddings de términos clínicos de alta calidad, pensados para recuperación de candidatos, normalización de conceptos y entity linking en pipelines de NLP clínico. Su ventana de contexto está limitada a 25 tokens durante el entrenamiento, lo que lo hace adecuado para términos y expresiones cortas, no para documentos completos. Es una pieza clave en la estandarización de datos de salud cardiológica en rumano, dentro de un ecosistema multilingüe de la familia CardioBERTa que cubre siete idiomas europeos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) |
| Parámetros totales | 278 043 648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (máximo de entrenamiento; contexto del modelo base no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rumano (`ro`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un encoder transformer multilingüe preentrenado, adaptado al dominio cardiológico mediante entrenamiento continuo con MLM sobre corpus biomédicos y cardiológicos en rumano. Sobre esta base, se aplica un entrenamiento específico de metric learning con tripletas supervisadas por conceptos UMLS (CUI). La estrategia `parents` enriquece las tripletas de sinónimos con relaciones ontológicas de nivel padre, generando un conjunto de 1 607 064 tripletas que cubren 476 350 CUIs y 531 693 términos normalizados únicos.

El entrenamiento utiliza la función de pérdida Multi-Similarity Loss, con pooling sobre el token CLS, una época, batch size de 256, learning rate de 2e-5 y longitud máxima de 25 tokens. No se emplean técnicas de RLHF ni DPO, y el modelo no es generativo: su salida es un vector de embedding normalizado. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings semánticos para términos clínicos en rumano, normalizados mediante pooling CLS y normalización L2.
- Normalización de conceptos clínicos: mapeo de términos de texto libre a conceptos UMLS (CUI).
- Entity linking: enlazar menciones en informes clínicos a conceptos ontológicos estandarizados.
- Recuperación de candidatos: búsqueda de términos similares mediante similitud coseno en el espacio de embeddings.
- Adecuado para entrada de términos cortos (máximo 25 tokens en entrenamiento).
- No soporta tool calling, agentes ni generación de texto; es exclusivamente un encoder de características.

## Casos de uso

- **Normalización de términos en informes de cardiología en rumano**: el modelo convierte expresiones clínicas libres en conceptos UMLS estandarizados, facilitando la integración de datos clínicos en sistemas de información.
- **Entity linking en registros de salud electrónicos**: integrado en un pipeline de NLP, enlaza menciones de fármacos, diagnósticos o procedimientos a códigos CUI, mejorando la interoperabilidad.
- **Búsqueda semántica de conceptos biomédicos**: dado un término de consulta, se obtienen candidatos relacionados por similitud coseno, útil en herramientas de anotación asistida.
- **Construcción de pipelines de NLP clínico multilingüe**: como componente de normalización dentro del ecosistema DT4H, contribuye a la unificación de terminología cardiológica en Europa.
- **Agrupación de sinónimos en corpus clínicos**: los embeddings permiten agrupar variantes terminológicas del mismo concepto, simplificando la anotación y el análisis de datos.
- **Soporte a codificación automática de informes**: combinado con un clasificador, puede sugerir códigos de clasificación de enfermedades (p. ej., ICD-10) basados en la similitud de embeddings con términos canónicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de rendimiento comparativo en la model card ni en las fuentes consultadas.

## Requisitos de hardware

- **VRAM estimada**: el peso del modelo en FP16 ocupa aproximadamente 556 MB (278 M parámetros × 2 bytes), por lo que cabe en GPUs con 4 GB de VRAM o menos, considerando también los activadores y el lote.
- **GPU recomendadas**: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 3090, o incluso GTX 1660 Super (6 GB) son suficientes para inferencia.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU con más de 4 GB de VRAM puede ejecutar el modelo sin problemas.
- **Opciones de despliegue**: compatible con la librería `transformers` de Hugging Face, con `sentence-transformers` para generar embeddings de frases, y con `text-embeddings-inference` (TEI) para servir el modelo como endpoint de embeddings.
- **Latencia y throughput**: no hay datos publicados, pero por el tamaño del modelo, la inferencia en GPU suele ser de milisegundos por término.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La familia CardioBERTa incluye variantes para otros idiomas, pero no se publican resultados de rendimiento comparativo. Se recomienda consultar la colección oficial para explorar alternativas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para rumano; no es aplicable a otros idiomas.
- La ventana de entrada está limitada a 25 tokens, por lo que no es apto para procesar documentos completos o contextos largos.
- La licencia no está especificada, lo que puede generar incertidumbre para el uso comercial; se debe contactar con los autores para aclarar condiciones.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que puede dificultar la reproducción del entrenamiento.
- No está destinado a la toma de decisiones clínicas; es una herramienta de análisis de texto y su uso en entornos clínicos requiere validación adicional.
- Puede heredar sesgos presentes en los datos biomédicos de entrenamiento, aunque no se han documentado riesgos específicos.
- Al ser un modelo de embeddings, no puede generar explicaciones ni razonamiento; su salida es un vector numérico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/CardioBERTa.ro_P_enriched)
- [Colección CardioBERTa Family](https://huggingface.co/collections/DT4H/cardioberta-family)
- [CardioBERTa.en (variante inglesa)](https://huggingface.co/DT4H/CardioBERTa.en)
- [Organización DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- Referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (sin enlace directo).
