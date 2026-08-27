# 24f2008353/tds-carbon-card

## Resumen

Este repositorio, `24f2008353/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella ambiental de un proceso de entrenamiento de un modelo. Fue creado por el usuario `24f2008353` en el contexto de la asignación TDS GA8, y su propósito es registrar las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante una sesión de fine-tuning.

La información disponible indica que el entrenamiento se realizó con 4 GPUs NVIDIA RTX 4090 en la región `ap-southeast1`, con un total de 127,3 horas de GPU (PUE 1,32), un consumo energético de 302,4648 kWh y unas emisiones de 145,183 kg de CO₂eq, calculadas mediante la herramienta CodeCarbon. No se proporcionan detalles sobre la arquitectura del modelo entrenado, sus parámetros, ni su propósito funcional, por lo que esta ficha se limita a describir el contenido del repositorio y a contextualizar su naturaleza como registro de sostenibilidad, no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

Datos de emisiones registrados en la model card:

| Parametro | Valor |
|---|---|
| Emisiones CO₂eq | 145,183 kg |
| Fuente de medicion | CodeCarbon |
| Tipo de entrenamiento | fine-tuning |
| Ubicacion geografica | ap-southeast1 |
| Hardware utilizado | NVIDIA RTX 4090 (4 GPUs) |
| Horas de GPU | 127,3 h (PUE 1,32) |
| Energia total consumida | 302,4648 kWh |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (si existiera), ya que el repositorio solo documenta el proceso de entrenamiento. Los datos de la model card indican que se realizo un fine-tuning sobre un hardware de 4 GPUs NVIDIA RTX 4090, con un total de 127,3 horas de computo. No se especifican el dataset, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La unica innovacion destacable es el uso de CodeCarbon para el seguimiento de emisiones, una practica de "Green AI" que busca cuantificar el impacto ambiental del entrenamiento de modelos.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision, tool calling, agentes o multilingues.
- Funciona como un registro estandarizado de emisiones de carbono, util para auditorias ambientales y para comparar la eficiencia energetica de distintos entrenamientos.
- Permite reproducir el calculo de CO₂eq a partir de los datos de hardware, tiempo y ubicacion, siguiendo la metodologia de CodeCarbon.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como evidencia documental del impacto ambiental de un entrenamiento concreto, util para informes de responsabilidad corporativa o cumplimiento normativo.
- Comparacion de eficiencia energetica entre runs: al estandarizar los datos de emisiones, permite contrastar el coste ambiental de diferentes configuraciones de hardware y regiones (por ejemplo, comparar con otros `tds-carbon-card` de otros autores).
- Educacion y divulgacion sobre Green AI: puede usarse como ejemplo practico de como medir y reportar la huella de carbono en el desarrollo de modelos, especialmente en entornos academicos o de formacion.
- Optimizacion de infraestructura: los datos de PUE, horas de GPU y energia pueden orientar decisiones sobre que tipo de GPU o region cloud elegir para reducir emisiones en futuros entrenamientos.
- Trazabilidad en pipelines de MLOps: integrar esta tarjeta como metadato en un registro de experimentos permite mantener un historial ambiental de cada version de modelo.
- Investigacion en eficiencia computacional: los valores de energia y emisiones pueden alimentar estudios sobre la relacion entre tamano de modelo, tiempo de entrenamiento y coste ecologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que desplegar.
- El hardware documentado para el entrenamiento fue de 4 GPUs NVIDIA RTX 4090, con un consumo total de 302,4648 kWh y 127,3 horas de GPU.
- No se indican requisitos de VRAM, latencia ni throughput, al no tratarse de un modelo servible.
- Para reproducir el entrenamiento (si se conociera el modelo original) se necesitarian GPUs de gama alta similares a las RTX 4090, pero no se dispone de mas detalles.

## Comparativa con modelos similares

No existe una categoria de "modelos" comparable, ya que este repositorio es una tarjeta de carbono. Sin embargo, se pueden comparar con otros repositorios del mismo tipo encontrados en la busqueda web:

| Repositorio | Hardware | GPUs | Horas GPU | Energia (kWh) | CO₂eq (kg) | Region |
|---|---|---|---|---|---|---|
| 24f2008353/tds-carbon-card | RTX 4090 | 4 | 127,3 | 302,46 | 145,18 | ap-southeast1 |
| indumv/tds-carbon-card | L40S | 6 | 439,7 | 1135,75 | 227,15 | europe-west4 |
| 24f2006741/tds-carbon-card | V100 | 5 | 476,9 | 1022,95 | 122,75 | europe-north1 |

Estos datos muestran diferencias significativas en eficiencia: el repositorio de `24f2008353` consume menos energia y emite menos CO₂ por hora de GPU, aunque la comparacion directa depende del tipo de entrenamiento (fine-tuning vs. pre-training) y de la region.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de inferencia, generacion o procesamiento de datos.
- La informacion sobre el modelo entrenado (arquitectura, pesos, dataset) es inexistente en el repositorio, por lo que no es posible evaluar su calidad ni su aplicabilidad.
- Los datos de emisiones dependen de la metodologia de CodeCarbon y de factores como el PUE del centro de datos; pueden no ser directamente comparables con mediciones de otras herramientas.
- La licencia no esta especificada, por lo que el uso del contenido del repositorio (mas alla de la consulta) podria estar sujeto a restricciones no declaradas.
- No se garantiza la exactitud de los valores de emisiones, ya que no se detalla el modelo de factor de emision utilizado para la region `ap-southeast1`.
- Para produccion o investigacion seria, se recomienda consultar fuentes primarias y verificar la trazabilidad de los datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f2008353/tds-carbon-card
- Repositorio similar de otro autor: https://huggingface.co/indumv/tds-carbon-card
- Repositorio similar de otro autor: https://huggingface.co/24f2006741/tds-carbon-card
