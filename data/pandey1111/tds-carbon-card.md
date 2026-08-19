# pandey1111/tds-carbon-card

## Resumen

El repositorio `pandey1111/tds-carbon-card` no contiene un modelo de IA propiamente dicho, sino una tarjeta de contabilidad de carbono (_carbon card_) que documenta el coste energético y las emisiones de CO₂ asociadas a un entrenamiento por fine-tuning. El autor, `pandey1111`, lo publica como parte de una tarea académica (TDS GA8) para practicar la transparencia ambiental en el desarrollo de IA.

La relevancia de este repositorio radica en su contribución a la tendencia de _Green AI_: cuantificar el impacto ecológico del entrenamiento de modelos. Según la model card, el entrenamiento se realizó con 5 GPUs NVIDIA H100 en la región `asia-south1`, consumió 1508.01 kWh y emitió 980.207 kg de CO₂ equivalente. No se especifica qué modelo se entrenó, su arquitectura ni sus parámetros.

En resumen, se trata de un artefacto de documentación, no de un modelo desplegable. Cualquier ficha técnica que pretenda describirlo como un sistema de IA carecería de base real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂ (entrenamiento) | 980.207 kg CO₂eq |
| Hardware de entrenamiento | 5x NVIDIA H100 |
| Region de entrenamiento | asia-south1 |
| Horas de GPU | 334 h (PUE 1.29) |
| Energia total consumida | 1508.01 kWh |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo subyacente (si existe). La única información disponible se refiere al proceso de fine-tuning: se utilizaron 5 GPUs NVIDIA H100 durante 334 horas, con un factor de eficiencia energética (PUE) de 1.29. El consumo energético total fue de 1508.01 kWh, lo que resultó en 980.207 kg de CO₂ equivalente, calculados con la herramienta CodeCarbon.

No se mencionan detalles sobre el dataset, el número de tokens, técnicas de alineación (RLHF, DPO) ni ninguna innovación técnica. El repositorio se limita a la contabilidad ambiental.

## Capacidades

No se dispone de información sobre capacidades del modelo. Este repositorio no documenta ninguna funcionalidad de IA (generación de texto, razonamiento, código, visión, etc.). No se puede afirmar que exista un modelo subyacente accesible.

## Casos de uso

Dado que no se trata de un modelo, no hay casos de uso de inferencia. Sin embargo, el repositorio en sí tiene una utilidad práctica:

- Auditoría ambiental de entrenamientos: sirve como ejemplo de cómo documentar emisiones de CO₂ en un proceso de fine-tuning, siguiendo prácticas de _Green AI_.
- Cumplimiento de directrices de transparencia: puede usarse como plantilla para reportar el impacto ecológico en model cards, conforme a iniciativas como la _AI Model Card_ de la Green Web Foundation.
- Educación en sostenibilidad: útil en cursos de IA responsable para ilustrar la cuantificación de la huella de carbono.
- Benchmarking energético: los datos de consumo (kWh, horas GPU, PUE) pueden compararse con otros entrenamientos para optimizar la eficiencia.
- Integración en herramientas de seguimiento: los metadatos de CodeCarbon pueden conectarse a paneles de control de emisiones en organizaciones.
- Investigación sobre eficiencia: los valores reportados permiten estudiar la relación entre hardware, región y emisiones en fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otras arquitecturas.

## Requisitos de hardware

- Para entrenamiento: se usaron 5 GPUs NVIDIA H100, lo que implica un cluster de alta gama (no consumer). No se especifica la VRAM individual, pero las H100 suelen tener 80 GB.
- Para inferencia: no aplica, ya que no se ofrece ningún modelo para desplegar.
- Opciones de despliegue: ninguna documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al no existir un modelo funcional, no es posible compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA. No debe confundirse con un artefacto desplegable.
- La información técnica del modelo (arquitectura, parámetros, licencia) es inexistente.
- Los datos de emisiones son específicos del entrenamiento realizado y no pueden extrapolarse a otros contextos sin conocer el modelo subyacente.
- La fecha de creación (2026) es futura respecto a la fecha actual, lo que podría indicar un error de metadatos o un caso de uso académico ficticio.
- No hay garantías de reproducibilidad, ya que no se detalla el código ni la configuración exacta del entrenamiento.
- Para uso en producción, este repositorio carece de cualquier valor operativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pandey1111/tds-carbon-card
- Referencia a otra tarjeta similar (anant-venkatesh1/tds-carbon-card): https://huggingface.co/anant-venkatesh1/tds-carbon-card
- Documentación sobre model cards (CHAI): https://www.chai.org/workgroup/applied-model
- Guía de AI model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Catálogo de model cards de la OECD: https://oecd.ai/en/catalogue/tools/model-cards
- TensorFlow Model Card Toolkit: https://www.tensorflow.org/responsible_ai/model_card_toolkit/guide
