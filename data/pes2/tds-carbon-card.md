# pes2/tds-carbon-card

## Resumen

Este repositorio, `pes2/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono y energía asociada a un proceso de fine-tuning. Forma parte de un ejercicio académico denominado TDS GA8, orientado a documentar la huella medioambiental del entrenamiento de modelos. El autor, pes2, publica los datos de emisiones de CO₂, consumo energético y hardware utilizado, siguiendo el estándar de la iniciativa Green AI.

El repositorio carece de pipeline, licencia e idiomas declarados, y no incluye pesos, arquitectura ni ningún artefacto de modelo. Su relevancia radica en la creciente demanda de transparencia sobre el coste ambiental del desarrollo de IA, aunque en este caso no se aporta información sobre el modelo entrenado en sí, solo sobre su huella. Es un ejemplo de buenas prácticas de reporte, pero no un recurso utilizable para inferencia o investigación aplicada.

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
| Formato de pesos | no aplica (no contiene pesos) |
| Hardware de entrenamiento | NVIDIA L40S (4 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region de computo | ap-southeast1 |
| Horas de GPU | 117,6 h (PUE: 1,11) |
| Energia total consumida | 182,7504 kWh |
| Emisiones de CO₂ equivalentes | 87,72 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo que fue fine-tuning, ya que este repositorio solo documenta el proceso desde la perspectiva de consumo de recursos. Los datos de entrenamiento indican que se utilizaron 4 GPUs NVIDIA L40S durante 117,6 horas en la region ap-southeast1, con un factor de eficiencia energetica (PUE) de 1,11. La energia total consumida fue de 182,7504 kWh, lo que se tradujo en 87,72 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon.

No se mencionan tecnicas de optimizacion, tipo de dataset, ni metodologias de alineamiento como RLHF o DPO. Al tratarse de un registro de contabilidad, no se puede evaluar ninguna innovacion tecnica del modelo subyacente.

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision u otras.
- Unicamente ofrece metadatos de emisiones y consumo, utiles para auditorias de sostenibilidad.
- No soporta tool calling, agentes ni procesamiento multilingue.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para reportar la huella de carbono de entrenamientos, permitiendo a equipos de MLOps cumplir con politicas de Green AI.
- Comparativa de eficiencia energetica entre proveedores de nube: los datos de region (ap-southeast1) y hardware (L40S) pueden utilizarse para decidir donde ejecutar futuros entrenamientos.
- Educacion y formacion en IA responsable: como ejemplo de transparencia en el reporte de emisiones, util en cursos sobre etica y sostenibilidad.
- Investigacion sobre el coste ambiental del fine-tuning: los valores de kWh y CO₂ pueden agregarse a estudios que analicen el impacto de diferentes configuraciones de hardware.
- Integracion en dashboards de gobernanza de datos: los metadatos pueden incorporarse a sistemas de seguimiento de proyectos para visibilizar el consumo energetico.
- Documentacion de procesos de certificacion: si una organizacion busca certificaciones de neutralidad de carbono, este tipo de registro es un insumo necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de rendimiento del modelo, ya que su proposito es exclusivamente la contabilidad de carbono.

## Requisitos de hardware

- No aplica para inferencia: no hay modelo que ejecutar.
- El hardware documentado para el entrenamiento fue de 4 GPU NVIDIA L40S, con un consumo total de 182,75 kWh.
- No se ofrecen recomendaciones de despliegue, latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, sino una tarjeta de carbono, por lo que no existe una categoria comparable de modelos. Existen otros repositorios similares en Hugging Face (por ejemplo, `24f2005112/tds-carbon-card` o `spandanjit2005/tds-carbon-card`) que siguen el mismo formato de reporte, pero no contienen modelos entrenados.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, generacion o analisis.
- Carece de licencia, por lo que su reutilizacion legal es incierta.
- Los datos de emisiones dependen de la herramienta CodeCarbon y de las condiciones del proveedor de nube; pueden no ser directamente comparables con otras mediciones.
- No se especifica el modelo original que fue fine-tuned, lo que limita la interpretacion de los datos.
- No incluye informacion sobre sesgos, alucinaciones o limitaciones de contexto, al no existir un modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pes2/tds-carbon-card
- Repositorios similares (mismo formato): https://huggingface.co/24f2005112/tds-carbon-card y https://huggingface.co/spandanjit2005/tds-carbon-card
- Herramienta CodeCarbon (fuente de medicion): no se proporciona enlace directo en la informacion, pero es referenciada en la model card.
