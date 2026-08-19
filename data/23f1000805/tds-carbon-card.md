# 23f1000805/tds-carbon-card

## Resumen

El repositorio `23f1000805/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo (model card) que documenta la huella de carbono y el consumo energético asociados a una ejecución de entrenamiento de otro modelo. Publicado por el usuario `23f1000805`, este registro forma parte de un ejercicio académico (TDS GA8) centrado en la contabilidad de emisiones de CO₂ en el entrenamiento de modelos, utilizando la herramienta CodeCarbon.

El documento reporta un total de 312,212 kg de CO₂ equivalente emitidos durante un proceso de fine-tuning ejecutado en una NVIDIA RTX 4090 en la región `us-central1`, con un consumo energético total de 892,0332 kWh. No se especifica qué modelo fue entrenado, ni su arquitectura, tamaño o propósito. Por tanto, esta ficha debe entenderse como un análisis de un registro de sostenibilidad, no como la evaluación de un modelo de IA utilizable.

La relevancia actual de este tipo de tarjetas radica en la creciente demanda de transparencia sobre el impacto ambiental del desarrollo de IA, un tema que está ganando atención regulatoria y corporativa en Europa y otras regiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura del modelo subyacente, ya que este repositorio no contiene pesos ni código de un modelo. El README indica que el entrenamiento fue un fine-tuning, pero no se especifica el modelo base ni los datos utilizados. Los únicos datos técnicos disponibles son los relativos al consumo energético y las emisiones, medidos con CodeCarbon.

El hardware empleado fue una NVIDIA RTX 4090, ubicada en la región `us-central1`. Se reportan 892,0332 kWh de energía total consumida y 312,212 kg de CO₂ equivalente emitidos, con un PUE (Power Usage Effectiveness) de 1,2. No se indican las horas de GPU ni el modo de entrenamiento (los campos aparecen como "undefined").

## Capacidades

No aplica. Este repositorio no contiene un modelo de IA con capacidades de generación, razonamiento o procesamiento de lenguaje. Se trata exclusivamente de un registro de sostenibilidad.

## Casos de uso

Al no ser un modelo de IA, no existen casos de uso prácticos de inferencia o generación. Sin embargo, como documento de referencia, puede servir para:

- Auditoría ambiental: permite a organizaciones verificar el impacto de un entrenamiento concreto y compararlo con estándares internos.
- Educación: sirve como ejemplo de cómo documentar emisiones en proyectos de IA, útil en cursos de sostenibilidad y desarrollo responsable.
- Investigación: puede utilizarse como dato puntual en estudios sobre el coste energético del fine-tuning en GPUs consumer.

No obstante, estos usos son indirectos y no implican la utilización de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que no existe un modelo que evaluar.

## Requisitos de hardware

No se dispone de requisitos de hardware para inferencia, puesto que no hay modelo desplegable. El entrenamiento documentado utilizó una NVIDIA RTX 4090, pero no se especifican otros detalles como VRAM, tiempo de ejecución o configuración del sistema.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable, dado que este repositorio no contiene un modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede cargar, ejecutar ni utilizar para ninguna tarea de procesamiento.
- Datos incompletos: el propio README indica que varios campos del entrenamiento están "undefined" (hardware, modo, región, horas de GPU), lo que limita la reproducibilidad y el análisis.
- Licencia no especificada: no se indica bajo qué términos se distribuye este contenido, por lo que su reutilización podría estar restringida.
- Posible confusión: el nombre "carbon-card" puede inducir a error a quien busque un modelo de lenguaje o visión, cuando en realidad es un registro de emisiones.
- Fecha futura: la fecha de creación (2026-08-18) es posterior a la actual, lo que sugiere que podría tratarse de un error o de un proyecto planificado.

## Enlaces

- [HuggingFace - 23f1000805/tds-carbon-card](https://huggingface.co/23f1000805/tds-carbon-card)
- [GitHub - tds-project-2](https://github.com/23f1000805/tds-project-2/blob/main/index.html)
- [GitHub - tds-project-1](https://github.com/23f1000805/tds-project-1/blob/main/app.py)
- [carbontxt.org - Directorio de tarjetas de modelo AI](https://carbontxt.org/ai-model-cards)
- [HuggingFace Space - TDS ROE Solver API](https://huggingface.co/spaces/23f1000805/tds-roe-solver-api-t12026)
