# rohansameen7/tds-carbon-card

## Resumen

El repositorio `rohansameen7/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento de un modelo no especificado. Fue creado por el usuario `rohansameen7` como parte de una tarea académica (TDS GA8) centrada en la medición de la huella ecológica del entrenamiento de modelos. La model card documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante el proceso de pre-entrenamiento.

Este tipo de repositorios responde a la creciente preocupación por el impacto ambiental del desarrollo de IA, y sirve como ejemplo de buenas prácticas de transparencia energética. Sin embargo, al no incluir pesos, arquitectura, ni ningún artefacto de modelo, no puede utilizarse para inferencia ni para ninguna tarea de procesamiento del lenguaje natural, visión u otra modalidad. Toda la información disponible se limita a los metadatos de emisiones y al hardware empleado.

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
| Emisiones CO₂eq | 377,459 kg (fuente: CodeCarbon) |
| Hardware de entrenamiento | 6x NVIDIA RTX 4090 |
| Region de entrenamiento | us-east1 |
| Horas de GPU | 248,4 h (PUE: 1,34) |
| Energia total consumida | 898,7112 kWh |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo que fue entrenado, ya que el repositorio no incluye ningun artefacto de modelo ni descripcion tecnica del mismo. Los unicos datos disponibles se refieren al proceso de entrenamiento: se utilizaron 6 GPUs NVIDIA RTX 4090 en la region us-east1, con un total de 248,4 horas de GPU y un consumo energetico de 898,7112 kWh. Las emisiones de CO₂ equivalente se calcularon mediante la herramienta CodeCarbon, arrojando un valor de 377,459 kg. No se menciona el tamano del dataset, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- No aplica: el repositorio no contiene un modelo de IA, por lo que no tiene capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni ninguna otra funcionalidad propia de un modelo entrenado.
- Unicamente documenta metricas de sostenibilidad de un entrenamiento previo, sin ofrecer ninguna interfaz de inferencia.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio puede servir como plantilla o ejemplo para registrar y reportar el impacto ambiental de entrenamientos de modelos, siguiendo practicas de contabilidad de carbono como las propuestas por CodeCarbon.
- Educacion y formacion: en cursos sobre IA responsable o Green AI, este tipo de registros se utiliza para ilustrar como medir emisiones y consumo energetico en entornos de computacion en la nube.
- Comparacion de eficiencia energetica: aunque no hay datos de rendimiento del modelo, los valores de emisiones y energia pueden compararse con otros entrenamientos documentados para evaluar la eficiencia del hardware y la configuracion.
- Investigacion sobre huella de carbono en ML: los datos de este repositorio pueden incorporarse a estudios que analicen el coste ambiental de diferentes configuraciones de entrenamiento.
- Desarrollo de herramientas de monitorizacion: puede inspirar la creacion de pipelines que automaticen la captura de metricas de energia y CO₂ durante el entrenamiento.
- Transparencia corporativa: empresas que deseen publicar informes de sostenibilidad de sus modelos pueden usar este formato como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de calidad del modelo, ni comparaciones con otros sistemas.

## Requisitos de hardware

- No aplica para inferencia, ya que no existe un modelo desplegable.
- El hardware documentado para el entrenamiento fue de 6 GPUs NVIDIA RTX 4090, con un consumo total de 898,7112 kWh y 248,4 horas de GPU.
- No se proporcionan requisitos de VRAM, latencia ni throughput para ningun escenario de uso.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no existen alternativas comparables en cuanto a parametros, contexto o rendimiento. Los repositorios similares encontrados en la busqueda web (por ejemplo, `123Ashwani/tds-carbon-card` o `shivainlabs/tds-carbon-card`) son practicamente identicos en contenido y proposito, pero no ofrecen datos adicionales que permitan una comparacion tecnica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo funcional: no se puede descargar, cargar ni utilizar para ninguna tarea de IA.
- No hay informacion sobre la licencia, por lo que no se puede determinar si su contenido puede reutilizarse legalmente.
- Los datos de emisiones y energia dependen de la metodologia de CodeCarbon y de los valores de PUE de la region us-east1; pueden no ser directamente comparables con mediciones realizadas con otras herramientas o en otras regiones.
- No se especifica que modelo se entreno, ni con que dataset, lo que limita cualquier interpretacion sobre la eficiencia del proceso.
- Al ser un registro de una tarea academica, su validez como referencia cientifica es limitada y no ha sido revisado por pares.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rohansameen7/tds-carbon-card
- Repositorio similar (123Ashwani): https://huggingface.co/123Ashwani/tds-carbon-card
- Repositorio similar (shivainlabs): https://huggingface.co/shivainlabs/tds-carbon-card
- Model cards de Google DeepMind (referencia general): https://deepmind.google/models/model-cards/
- GitHub del autor (proyecto relacionado): https://github.com/rohan-sameen/tds-ga7-release-gate
- GitHub del autor (CarbonCoach AI): https://github.com/Rohan-R07/carboncoachAi
