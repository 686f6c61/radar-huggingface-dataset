# BVShivani/tds-carbon-card

## Resumen

El repositorio `BVShivani/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento de un modelo dentro del programa académico TDS GA8. El autor, BVShivani, documenta las emisiones de CO₂ equivalente generadas durante el pre-entrenamiento de un modelo no especificado, utilizando una GPU NVIDIA H100 en la región europe-north1. Este tipo de repositorios forma parte de una iniciativa de "Green AI" para cuantificar el impacto ambiental del entrenamiento de modelos.

La relevancia de este repositorio radica en que ejemplifica una práctica emergente de transparencia ambiental en el desarrollo de IA, aunque no ofrece ningún artefacto utilizable para inferencia o generación de contenido. No se proporcionan detalles sobre la arquitectura, el tamaño o el contexto del modelo entrenado, ya que el objetivo exclusivo es reportar métricas de sostenibilidad.

## Especificaciones tecnicas

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

Datos adicionales del registro de entrenamiento:

| Parametro | Valor |
|---|---|
| Hardware utilizado | NVIDIA H100 (1 GPU) |
| Modo de entrenamiento | pre-training |
| Region | europe-north1 |
| Horas de GPU | 305,4 h (PUE: 1,22) |
| Energia total consumida | 260,8116 kWh |
| Emisiones de CO₂ equivalente | 31,297 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo entrenado, ya que el repositorio no incluye detalles tecnicos del mismo. El unico dato de entrenamiento disponible es que se realizo un pre-training sobre una GPU NVIDIA H100 durante 305,4 horas, con un factor de eficiencia energetica (PUE) de 1,22. La energia total consumida fue de 260,8116 kWh, lo que resulto en 31,297 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se mencionan tecnicas como RLHF, DPO ni ninguna innovacion arquitectonica.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision u otras funciones tipicas de un sistema de IA.
- No se proporciona soporte para tool calling, agentes, ni capacidades multilingues.
- La unica "capacidad" es la de documentar metricas de sostenibilidad de un entrenamiento, utilizable para auditorias ambientales.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como referencia para cuantificar el impacto ambiental de un entrenamiento con hardware especifico (H100) y en una region concreta, permitiendo comparar con otros registros similares.
- Educacion y formacion en Green AI: puede utilizarse como ejemplo en cursos o talleres sobre computacion responsable, mostrando como reportar emisiones de CO₂ con CodeCarbon.
- Investigacion sobre eficiencia energetica: los datos de energia y emisiones pueden alimentar estudios comparativos sobre el coste ambiental de diferentes configuraciones de hardware.
- Elaboracion de informes de responsabilidad corporativa: empresas que entrenan modelos pueden usar este formato para documentar su huella de carbono ante clientes o reguladores.
- Desarrollo de herramientas de medicion: el repositorio puede servir como caso de prueba para validar metodologias de calculo de emisiones en entornos cloud.
- Comparativa de proveedores cloud: los datos de region y PUE permiten evaluar la eficiencia de diferentes centros de datos para cargas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene metricas de rendimiento del modelo (como MMLU, HumanEval o GSM8K), ya que su proposito es exclusivamente la contabilidad de carbono.

## Requisitos de hardware

- No aplica para inferencia, ya que no se distribuye ningun modelo.
- El entrenamiento documentado requirio una GPU NVIDIA H100 (1 unidad) durante 305,4 horas.
- No se especifican requisitos de VRAM, latencia o throughput, al no tratarse de un modelo desplegable.
- Para reproducir el entrenamiento se necesitaria un entorno con una GPU H100 y acceso a la region europe-north1 de Google Cloud (segun el PUE indicado).

## Comparativa con modelos similares

No existe una categoria de "modelos similares" en el sentido de capacidades de IA, pero si hay otros repositorios de contabilidad de carbono del mismo programa TDS GA8. Se comparan los datos de entrenamiento:

| Repositorio | Hardware | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|
| BVShivani/tds-carbon-card | 1x H100 | 305,4 | 260,81 | 31,30 |
| shivainlabs/tds-carbon-card | no disponible | no disponible | no disponible | no disponible |
| indumv/tds-carbon-card | 6x L40S | 439,7 | 1135,75 | 227,15 |

La comparativa muestra diferencias significativas en emisiones debido al hardware y al numero de GPUs, lo que ilustra la variabilidad del impacto ambiental segun la infraestructura.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA utilizable; no se puede descargar, cargar ni ejecutar para ninguna tarea de inferencia.
- No se proporciona informacion sobre el modelo entrenado (arquitectura, parametros, dataset), por lo que es imposible evaluar su calidad o rendimiento.
- La licencia no esta especificada, por lo que no se conocen restricciones de uso comercial del contenido del repositorio.
- Los datos de emisiones dependen de la metodologia de CodeCarbon y del PUE reportado; pueden no ser directamente comparables con otras mediciones que usen factores de emision distintos.
- Al ser un registro academico, su validez como referencia para produccion es limitada.

## Enlaces

- Repositorio original: https://huggingface.co/BVShivani/tds-carbon-card
- Repositorio similar (shivainlabs): https://huggingface.co/shivainlabs/tds-carbon-card
- Repositorio similar (indumv): https://huggingface.co/indumv/tds-carbon-card
- Herramienta CodeCarbon (mencionada en el registro): https://codecarbon.io (no verificado en la busqueda)
