# AlinaGonch/granite41-8b-squad-ratio-0.90-seed-43

## Resumen

El modelo `AlinaGonch/granite41-8b-squad-ratio-0.90-seed-43` es un fine-tuning experimental sobre la familia Granite 4.1 de IBM, concretamente sobre la variante de 8B de parámetros densos. Ha sido publicado por Alina Hancharova (usuario `AlinaGonch`) como parte de un experimento destinado a determinar la proporción óptima de muestras sin respuesta en el dataset de entrenamiento SQuAD 2.0. El nombre del repositorio indica que se ha utilizado una proporción de 0.90 de preguntas sin respuesta y una semilla aleatoria de 43 para la reproducibilidad.

Este modelo se enmarca en una colección de variantes que exploran diferentes ratios de muestras imposibles de responder, con el objetivo de estudiar cómo afecta ese equilibrio al rendimiento en tareas de comprensión lectora y respuesta a preguntas. Aunque la model card no proporciona detalles técnicos, el contexto de la familia Granite 4.1 sugiere que el modelo base cuenta con una arquitectura transformer densa, una ventana de contexto de hasta 512K tokens y licencia Apache 2.0. No obstante, al tratarse de un experimento académico sin documentación adicional, muchos datos específicos permanecen sin confirmar.

La relevancia de este modelo radica en su contribución metodológica al análisis de datos de entrenamiento para tareas de question answering, más que en su utilidad directa como modelo de producción. Es un recurso valioso para investigadores interesados en el impacto de la distribución de ejemplos negativos en el fine-tuning de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (presumiblemente Granite 4.1 8B, sin confirmar) |
| Parametros totales | no disponible (se infiere 8B por el nombre, sin confirmación) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la familia Granite 4.1 soporta hasta 512K, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, dado el dataset SQuAD) |
| Licencia | no disponible (la familia Granite 4.1 usa Apache 2.0, pero no se especifica para este modelo) |
| Formato de pesos | safetensors (según los tags de HuggingFace) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura específica de este modelo. Por el nombre y el contexto del repositorio, se trata de un fine-tuning de la familia Granite 4.1 de IBM, que emplea una arquitectura transformer densa con atención estándar. El experimento consistió en ajustar el modelo base sobre el dataset SQuAD 2.0, que incluye preguntas con y sin respuesta, utilizando una proporción de 0.90 de muestras sin respuesta (es decir, el 90% de los ejemplos de entrenamiento son preguntas sin respuesta válida). La semilla 43 se utilizó para la inicialización aleatoria y el particionado de datos.

No se han publicado detalles sobre el procedimiento de entrenamiento, hiperparámetros, número de épocas, técnica de optimización o si se aplicaron métodos de alineación como RLHF o DPO. La model card generada automáticamente no contiene ninguna información al respecto.

## Capacidades

- Comprensión lectora y respuesta a preguntas extractivas, basada en el dataset SQuAD 2.0.
- Manejo de preguntas sin respuesta: el modelo está entrenado para reconocer cuándo no hay respuesta en el contexto proporcionado, gracias a la alta proporción de ejemplos negativos.
- Probablemente hereda las capacidades generales del modelo base Granite 4.1 8B (generación de texto, razonamiento, código), pero no hay confirmación de que estas capacidades se mantengan tras el fine-tuning.
- No se han documentado capacidades especiales como tool calling, agentes, visión o audio.

## Casos de uso

- Investigación académica sobre el equilibrio de datos negativos en QA: el modelo permite estudiar cómo una alta proporción de preguntas sin respuesta afecta al rendimiento en benchmarks como SQuAD 2.0.
- Desarrollo de sistemas de pregunta-respuesta robustos ante preguntas no respondibles: puede servir como punto de partida para fine-tuning adicional en dominios específicos donde la abstinencia es crítica (por ejemplo, atención al cliente).
- Análisis de sesgos en datasets de QA: al comparar variantes con distintos ratios, se puede evaluar cómo el modelo tiende a sobre- o sub-generar respuestas.
- Evaluación de técnicas de regularización implícita mediante el balance de clases en el entrenamiento.
- Replicación de experimentos: la semilla fija (43) permite reproducir los resultados y comparar con otras semillas o ratios.
- Docencia y demostración de fine-tuning de modelos de lenguaje para tareas de comprensión lectora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de SQuAD 2.0 para este modelo. El autor no ha proporcionado ninguna evaluación en la model card ni en el repositorio.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos para este modelo. Al tratarse presumiblemente de un modelo de 8B parámetros, se puede estimar que:

- Inferencia en FP16 requiere aproximadamente 16 GB de VRAM (8B × 2 bytes).
- Con cuantización de 8 bits, alrededor de 8 GB; con 4 bits, unos 4-5 GB.
- Podría ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o incluso en Apple Silicon con suficiente memoria unificada.
- Para despliegue en producción, se recomendaría vLLM, TGI o llama.cpp si se convierte a GGUF.
- No hay datos de latencia o throughput medidos para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en el mismo experimento. El propio autor ha publicado otras variantes con diferentes ratios (por ejemplo, `granite41-8b-squad-ratio-0.30-r4`), pero no se han publicado resultados comparativos. Tampoco se conocen otros fine-tunings de Granite 4.1 8B sobre SQuAD 2.0 en el Hub. Por tanto, no es posible establecer una comparativa fiable.

## Limitaciones y advertencias

- La model card está completamente vacía: no hay información sobre el proceso de entrenamiento, datos, licencia o sesgos. Esto limita seriamente su uso en entornos de producción o investigación rigurosa.
- El modelo está diseñado exclusivamente para el experimento sobre SQuAD 2.0; no se garantiza su rendimiento en otras tareas o dominios.
- Al estar entrenado con un 90% de muestras sin respuesta, es probable que el modelo tenga una fuerte tendencia a abstenerse de responder, incluso cuando existe una respuesta correcta en el contexto. Esto puede degradar su utilidad en aplicaciones reales de QA.
- No se especifica la licencia: aunque la familia Granite 4.1 usa Apache 2.0, este modelo derivado podría tener restricciones adicionales impuestas por el autor. Se debe contactar con el autor antes de cualquier uso comercial.
- No hay garantía de que el modelo base sea efectivamente Granite 4.1 8B; el nombre sugiere esa relación, pero no hay confirmación oficial.
- El repositorio tiene un tamaño de solo 0.2 GB, lo que sugiere que podría tratarse de un checkpoint parcial o de una versión cuantizada, aunque no se especifica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.90-seed-43
- Perfil del autor: https://huggingface.co/AlinaGonch
- Documentación de Granite 4.1 de IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Artículo sobre Granite 4.1 (blog externo): https://www.aimadetools.com/blog/granite-4-1-complete-guide/
- Referencia al paper de SQuAD 2.0 (mencionado en la model card): https://arxiv.org/abs/1910.09700
