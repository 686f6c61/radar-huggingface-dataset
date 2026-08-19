# notdaksha/tds-carbon-card

## Resumen

El repositorio `notdaksha/tds-carbon-card` no contiene un modelo de inteligencia artificial propiamente dicho, sino una ficha de contabilidad de carbono asociada al entrenamiento de un modelo dentro del curso TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning, con un total de 372,426 kg CO₂eq, utilizando 6 GPUs NVIDIA V100 en la región `ap-southeast1`. La iniciativa se enmarca en las prácticas de Green AI, que buscan cuantificar y reducir el impacto ambiental del entrenamiento de modelos.

Este tipo de repositorios, replicado por otros estudiantes (como `itsAayush/tds-carbon-card` o `Divya-netter/tds-carbon-card`), sirve como ejemplo de transparencia energética en el desarrollo de IA. No ofrece ningún artefacto descargable ni pesos, por lo que no es utilizable para inferencia o fine-tuning. Su relevancia radica en la metodología de medición (CodeCarbon) y en la comparativa de emisiones entre distintos hardware y modos de entrenamiento.

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
| Formato de pesos | no disponible (repositorio sin modelo) |
| Emisiones CO₂eq | 372,426 kg |
| Hardware de entrenamiento | 6x NVIDIA V100 |
| Region de entrenamiento | ap-southeast1 |
| Horas de GPU | 271,1 h (PUE 1,59) |
| Energia total consumida | 775,8882 kWh |
| Modo de entrenamiento | fine-tuning |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo subyacente, ya que el repositorio solo documenta la huella de carbono del proceso de entrenamiento. Los metadatos indican que se realizo un fine-tuning sobre hardware NVIDIA V100 (6 GPUs) durante 271,1 horas, con un factor de eficiencia energetica (PUE) de 1,59. La energia total consumida fue de 775,8882 kWh, lo que se tradujo en 372,426 kg de CO₂eq, calculados con la libreria CodeCarbon. No se especifica el dataset, el numero de tokens ni el modelo base.

## Capacidades

No aplica. Este repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision, tool calling ni agentes. Es exclusivamente un registro de metadatos ambientales.

## Casos de uso

- Auditoria de emisiones en proyectos de IA: el repositorio sirve como plantilla para documentar el coste ambiental de un entrenamiento, permitiendo a equipos de investigacion reportar sus emisiones de forma estandarizada.
- Comparativa de eficiencia energetica entre hardware: al existir repositorios similares con distintas GPUs (V100, L40S, RTX 4090), se pueden comparar las emisiones por hora de entrenamiento y por kWh consumido.
- Integracion en pipelines de MLOps: los metadatos de CodeCarbon pueden integrarse en sistemas de seguimiento de experimentos para alertar sobre el impacto ambiental acumulado.
- Educacion y concienciacion en Green AI: sirve como material didactico para cursos que ensenan a medir y reducir la huella de carbono en el desarrollo de modelos.
- Cumplimiento normativo futuro: si se legislan requisitos de transparencia ambiental para IA, este tipo de registros podria ser obligatorio.
- Investigacion en optimizacion energetica: los datos de PUE, energia y emisiones permiten estudiar la relacion entre la localizacion geografica y la eficiencia del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento del modelo entrenado, solo datos de consumo energetico.

## Requisitos de hardware

- El entrenamiento documentado utilizo 6 GPUs NVIDIA V100, aunque no se especifica la VRAM individual ni la configuracion exacta.
- No se proporcionan requisitos de hardware para inferencia, ya que no hay modelo desplegable.
- Para reproducir el registro de emisiones, se requiere un entorno con CodeCarbon instalado y acceso a las GPUs utilizadas.
- El despliegue en produccion no es aplicable; el repositorio solo contiene metadatos.

## Comparativa con modelos similares

No existe un modelo comparable en el sentido tradicional, pero si repositorios de la misma naturaleza (carbon accounting) creados por otros participantes del curso TDS GA8:

| Repositorio | Hardware | Modo | GPU horas | Energia (kWh) | CO₂eq (kg) |
|---|---|---|---|---|---|
| notdaksha/tds-carbon-card | 6x V100 | fine-tuning | 271,1 | 775,89 | 372,43 |
| itsAayush/tds-carbon-card | 6x L40S | pre-training | 164,1 | 482,45 | 313,60 |
| Divya-netter/tds-carbon-card | 6x RTX 4090 | fine-tuning | 388 | 1508,54 | 633,59 |

La comparativa muestra diferencias significativas en eficiencia: el entrenamiento con L40S consume menos energia y emite menos CO₂ por hora, mientras que el de RTX 4090 es el mas costoso ambientalmente. Estos datos son utiles para decidir que hardware utilizar en funcion de la sostenibilidad.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede descargar, ejecutar ni integrar en ninguna aplicacion.
- La informacion sobre el modelo entrenado (arquitectura, datos, metricas) es inexistente.
- La licencia no esta especificada, por lo que no se puede determinar si los metadatos son reutilizables.
- Las emisiones declaradas dependen de la metodologia de CodeCarbon y de la region; pueden no ser directamente comparables con otras mediciones.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un ejercicio academico sin mantenimiento posterior.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/notdaksha/tds-carbon-card
- Repositorio similar (itsAayush): https://huggingface.co/itsAayush/tds-carbon-card
- Repositorio similar (Divya-netter): https://huggingface.co/Divya-netter/tds-carbon-card
- Documentacion sobre model cards: https://aiwiki.ai/wiki/model_card
- Coleccion de model cards y datasheets: https://github.com/ivylee/model-cards-and-datasheets
