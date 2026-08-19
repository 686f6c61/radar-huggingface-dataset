# pranhai/tds-carbon-card

## Resumen
Este repositorio, publicado por el usuario pranhai (Pranhav Prakash), no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono correspondiente a una tarea académica (TDS GA8). Documenta la huella de CO₂ equivalente generada durante un proceso de fine-tuning de un modelo no especificado, ejecutado en hardware NVIDIA H100. El objetivo es servir como ejemplo de transparencia ambiental en el entrenamiento de modelos, siguiendo las prácticas de "Green AI". No se incluyen pesos, arquitectura ni código de inferencia, por lo que no es utilizable como modelo desplegable.

Aunque carece de valor como modelo, resulta relevante como caso práctico de medición de emisiones con la herramienta CodeCarbon, y puede servir de referencia para desarrolladores que necesiten reportar el impacto ambiental de sus propios entrenamientos. La información disponible se limita a los metadatos de la model card y a los datos de emisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento
No se proporciona informacion sobre la arquitectura del modelo subyacente, ya que este repositorio no contiene un modelo, sino un informe de emisiones. El unico dato de entrenamiento disponible es que se realizo un fine-tuning (no un entrenamiento desde cero) sobre un hardware de 6 GPUs NVIDIA H100, con un total de 334,7 horas de GPU y un PUE (Power Usage Effectiveness) de 1,13 en la region ap-southeast1. La energia total consumida fue de 1588,4862 kWh, lo que resulto en 762,473 kg de CO₂ equivalente, medidos con la libreria CodeCarbon. No se indica el tipo de modelo, el dataset ni las tecnicas de optimizacion empleadas.

## Capacidades
- No aplica: este repositorio no proporciona un modelo con capacidades de generacion, razonamiento, codigo, vision ni ninguna otra funcion de IA.
- La unica "capacidad" es la de servir como registro de contabilidad de carbono para fines educativos o de auditoria ambiental.

## Casos de uso
- Reporte de sostenibilidad en proyectos de IA: el repositorio puede usarse como plantilla para documentar emisiones de CO₂ en entrenamientos propios, siguiendo el formato de CodeCarbon.
- Auditoria de impacto ambiental: investigadores o responsables de cumplimiento pueden consultar este registro para entender como se calculan y presentan las metricas de huella de carbono en tareas de fine-tuning.
- Educacion sobre Green AI: sirve como ejemplo en cursos o talleres sobre computacion sostenible, mostrando datos reales de consumo energetico y emisiones.
- Comparativa de eficiencia: aunque no hay modelo, los datos de emisiones por hora de GPU pueden compararse con otros entrenamientos para evaluar la eficiencia del hardware y la region.
- Integracion en pipelines de MLOps: el formato de la model card puede inspirar la inclusion de metadatos ambientales en registros de modelos dentro de plataformas como Hugging Face.
- Investigacion sobre trade-offs de carbono: los datos de este repositorio pueden alimentar estudios sobre el coste ambiental de entrenar en distintas regiones o con distintos tipos de GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible, ya que no se evalua ningun modelo. Los unicos datos numericos son los de consumo energetico y emisiones, que no constituyen metricas de rendimiento de IA.

## Requisitos de hardware
- No se requiere hardware para "usar" este repositorio, pues no contiene un modelo ejecutable.
- Los datos de entrenamiento indican que se emplearon 6 GPUs NVIDIA H100, con 334,7 horas de GPU en total.
- Para reproducir un entrenamiento similar con ese hardware, se necesitaria un cluster con al menos 6 H100 (80 GB VRAM cada una) y un sistema de refrigeracion adecuado.
- No se proporcionan opciones de despliegue (vLLM, Ollama, etc.) porque no hay modelo que servir.

## Comparativa con modelos similares
No disponible. No existe una categoria de "modelos de contabilidad de carbono" comparable. El repositorio mas cercano es Pranav1003/tds-carbon-card, que parece contener exactamente la misma informacion (misma plantilla y mismos datos), probablemente duplicado por otro usuario. No hay otros modelos de IA con los que comparar.

## Limitaciones y advertencias
- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje, generacion de codigo, etc.
- Los datos de emisiones dependen de la region y del hardware; extrapolarlos a otros entornos puede llevar a conclusiones erroneas.
- No se especifica el modelo base del fine-tuning, por lo que no se puede evaluar la relevancia de las emisiones en funcion de la tarea.
- La licencia no esta definida, lo que impide reutilizar el contenido legalmente sin permiso explicito del autor.
- No hay garantia de que los datos de emisiones hayan sido verificados externamente; provienen de una herramienta automatica (CodeCarbon) y pueden contener incertidumbres.
- El repositorio no tiene descargas ni likes, lo que sugiere que es un trabajo academico de baja difusion, no un recurso mantenido activamente.

## Enlaces
- Repositorio principal: https://huggingface.co/pranhai/tds-carbon-card
- Repositorio duplicado (mismo contenido): https://huggingface.co/Pranav1003/tds-carbon-card
- Perfil del autor: https://huggingface.co/pranhai
- Referencia a CodeCarbon (herramienta de medicion): https://github.com/mlco2/codecarbon (no verificado en la busqueda, pero es la herramienta mencionada en los metadatos)
