# pradyumna18/tds-carbon-card

## Resumen

El repositorio `pradyumna18/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning. Documenta la huella ambiental de un entrenamiento realizado con hardware NVIDIA T4 (4 GPUs) en la región `ap-southeast1`, con un total de 463,8 horas de GPU y unas emisiones de 70,438 kg de CO₂ equivalente. El proyecto se enmarca en la iniciativa "Green AI Carbon Accounting" del curso TDS GA8, cuyo objetivo es cuantificar el coste energético y las emisiones de los entrenamientos de modelos.

Este tipo de repositorios son relevantes en el contexto actual de la IA sostenible, donde la transparencia sobre el consumo energético y las emisiones asociadas al entrenamiento de modelos se ha convertido en una práctica recomendada. La ficha que sigue describe el contenido real del repositorio, que es exclusivamente un conjunto de metadatos de emisiones, sin pesos, arquitectura ni funcionalidad de modelo alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura, ya que el repositorio no incluye un modelo. Los unicos datos de entrenamiento disponibles son los relativos al consumo energetico: se realizo un fine-tuning sobre hardware NVIDIA T4 (4 GPUs) en la region `ap-southeast1`, con un total de 463,8 horas de GPU y un PUE (Power Usage Effectiveness) de 1,13. La energia total consumida fue de 146,7463 kWh, lo que resulto en 70,438 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon. No se especifica el dataset utilizado ni el modelo base sobre el que se aplico el fine-tuning.

## Capacidades

El repositorio no implementa ninguna capacidad de IA. Su unica funcion es servir como registro de emisiones de carbono. Las capacidades que se podrian atribuir son:

- Documentacion de la huella de carbono de un entrenamiento especifico.
- Trazabilidad del consumo energetico y las emisiones asociadas a un proceso de fine-tuning.
- Reproducibilidad de la medicion mediante CodeCarbon y los parametros registrados (hardware, region, horas de GPU, PUE).
- No incluye generacion de texto, razonamiento, codigo, vision ni ninguna otra funcionalidad de modelo.

## Casos de uso

Dado que no es un modelo de IA, los casos de uso se limitan al ambito de la contabilidad ambiental y la auditoria de sostenibilidad:

- Auditoria de emisiones en proyectos de IA: permite verificar el coste ambiental de un entrenamiento concreto, util para informes de sostenibilidad corporativa.
- Comparativa de eficiencia energetica entre configuraciones de hardware: los datos de este repositorio pueden contrastarse con otros similares (por ejemplo, los de `sahajm/tds-carbon-card` con V100) para evaluar el impacto de distintas GPUs.
- Educacion y formacion en Green AI: sirve como ejemplo practico de como medir y reportar emisiones en un flujo de trabajo de machine learning.
- Cumplimiento normativo: en contextos donde se exija reportar la huella de carbono de procesos computacionales, este tipo de registros aporta evidencia.
- Optimizacion de infraestructura: los datos de PUE y energia pueden orientar decisiones sobre regiones de computo mas eficientes.
- Investigacion en sostenibilidad: los metadatos pueden alimentar estudios sobre el coste ambiental real de los fine-tunings en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene metricas de rendimiento de modelo, solo datos de consumo energetico y emisiones.

## Requisitos de hardware

No aplica, ya que no hay modelo que ejecutar. Los requisitos de hardware mencionados en el repositorio se refieren al entrenamiento original:

- Hardware utilizado: NVIDIA T4 (4 GPUs).
- Region de computo: `ap-southeast1`.
- Horas de GPU: 463,8 h.
- Energia total: 146,7463 kWh.
- PUE: 1,13.
- No se proporcionan requisitos de inferencia ni opciones de despliegue.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no existe una categoria de modelos comparables. Existen otros repositorios con el mismo proposito (por ejemplo, `jayiitm/tds-carbon-card`, `aruneshpratapsingh/tds-carbon-card`, `23f2004680/tds-carbon-card`, `subhamtheprogrammer/tds-carbon-card`, `sahajm/tds-carbon-card`), todos ellos con la misma finalidad de contabilidad de carbono, pero con diferentes configuraciones de hardware y emisiones. Por ejemplo, `sahajm/tds-carbon-card` reporta 40,431 kg CO₂eq con 8 GPUs V100 en la region `asia-south1`, mientras que este repositorio reporta 70,438 kg CO₂eq con 4 GPUs T4 en `ap-southeast1`. No obstante, al no tratarse de modelos, no procede una comparativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de generacion, clasificacion, razonamiento o procesamiento de lenguaje.
- Los datos de emisiones son especificos del entrenamiento documentado y no son extrapolables a otros escenarios sin un analisis adicional.
- La licencia no esta especificada, por lo que el uso comercial de los metadatos podria estar sujeto a restricciones no declaradas.
- La ausencia de informacion sobre el modelo base y el dataset impide evaluar la calidad o validez del proceso de fine-tuning.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un ejercicio academico sin adopcion en produccion.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, ya que no aplican a un registro de emisiones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pradyumna18/tds-carbon-card
- Repositorios similares encontrados en la busqueda web:
  - https://huggingface.co/jayiitm/tds-carbon-card
  - https://huggingface.co/aruneshpratapsingh/tds-carbon-card
  - https://huggingface.co/23f2004680/tds-carbon-card
  - https://huggingface.co/subhamtheprogrammer/tds-carbon-card
  - https://huggingface.co/sahajm/tds-carbon-card
