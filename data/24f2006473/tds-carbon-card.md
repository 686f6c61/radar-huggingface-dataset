# 24f2006473/tds-carbon-card

## Resumen

El repositorio `24f2006473/tds-carbon-card` no es un modelo de inteligencia artificial en el sentido convencional, sino una tarjeta de contabilidad de carbono que documenta la huella ambiental de una ejecución de entrenamiento de un modelo dentro del programa académico TDS GA8. Publicado por el usuario 24f2006473 en Hugging Face, este repositorio sigue el formato de model card de Green AI, registrando métricas de emisiones de CO₂, consumo energético y hardware utilizado durante el preentrenamiento.

El objetivo de esta publicación es proporcionar transparencia sobre el coste ambiental del entrenamiento de modelos, un aspecto cada vez más relevante en el desarrollo de IA responsable. Los datos incluidos indican que el entrenamiento se realizó en la región us-central1 con 7 GPUs NVIDIA T4, consumiendo 297,81 kWh y emitiendo 104,23 kg de CO₂ equivalente. No se especifica arquitectura, tamaño de parámetros ni ninguna característica técnica del modelo entrenado, ya que el repositorio se centra exclusivamente en la métrica de sostenibilidad.

Este tipo de tarjetas de carbono se alinea con iniciativas como el directorio de sostenibilidad de carbontxt.org, que extrae datos de emisiones de más de 2500 model cards en Hugging Face. Su relevancia radica en permitir a la comunidad comparar el impacto ambiental de diferentes entrenamientos y fomentar prácticas de desarrollo más ecológicas.

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
| Hardware de entrenamiento | NVIDIA T4 (7 GPUs) |
| Region de entrenamiento | us-central1 |
| Modo de entrenamiento | pre-training |
| Horas de GPU | 402,5 h (PUE: 1,51) |
| Energia total consumida | 297,8098 kWh |
| Emisiones de CO₂ equivalente | 104,233 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo entrenado (transformer, MoE, SSM, etc.) ni sobre el dataset utilizado. El repositorio documenta únicamente el proceso de entrenamiento desde la perspectiva de consumo de recursos: se emplearon 7 GPUs NVIDIA T4 en la region us-central1 de Google Cloud, con un total de 402,5 horas de GPU y un factor de eficiencia energetica (PUE) de 1,51. La energia total consumida fue de 297,81 kWh, lo que resulto en 104,23 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon.

No se mencionan tecnicas como RLHF, DPO ni ninguna innovacion arquitectonica. El repositorio es un registro de sostenibilidad, no una descripcion tecnica del modelo.

## Capacidades

- No aplica: el repositorio no contiene un modelo de IA funcional, sino metadatos de emisiones de carbono.
- Documenta el impacto ambiental de un entrenamiento especifico, permitiendo auditorias de sostenibilidad.
- Proporciona datos estructurados (emisiones, energia, hardware) en formato YAML dentro de la model card.
- Facilita la comparacion con otros entrenamientos mediante el estandar de CodeCarbon.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como registro verificable del coste ambiental de un entrenamiento, util para empresas que necesitan reportar su huella de carbono.
- Investigacion en Green AI: los datos de emisiones y consumo pueden usarse en estudios sobre eficiencia energetica de diferentes configuraciones de hardware y regiones.
- Comparativa de proveedores cloud: al conocer la region y el hardware, se puede evaluar el impacto de elegir us-central1 frente a otras regiones con diferentes factores de emision.
- Educacion en IA responsable: como ejemplo de buenas practicas para documentar el ciclo de vida de un modelo, especialmente en entornos academicos.
- Integracion en pipelines de CI/CD: los metadatos de emisiones podrian incorporarse a herramientas de seguimiento de experimentos para automatizar reportes de sostenibilidad.
- Cumplimiento normativo: en jurisdicciones con requisitos de divulgacion de emisiones, este tipo de tarjetas ayuda a las organizaciones a cumplir con la legislacion ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene metricas de rendimiento del modelo entrenado, solo datos de consumo energetico.

## Requisitos de hardware

- El entrenamiento documentado utilizo 7 GPUs NVIDIA T4, una GPU de gama media orientada a inferencia y cargas de trabajo ligeras.
- No se especifican requisitos de VRAM para inferencia, ya que no se proporciona el modelo resultante.
- Para reproducir el entrenamiento se necesitaria un entorno con al menos 7 GPUs T4 o equivalentes, aunque la cantidad exacta de VRAM por GPU no se indica.
- Las opciones de despliegue no son aplicables al no existir un modelo publicable.
- El consumo energetico total fue de 297,81 kWh, lo que da una idea del coste operativo en terminos de electricidad.

## Comparativa con modelos similares

No se trata de un modelo de IA comparable con otros. Sin embargo, existen otros repositorios de tarjetas de carbono similares en Hugging Face, como:

| Repositorio | Hardware | Modo | Region | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| 24f2006473/tds-carbon-card | NVIDIA T4 (7 GPUs) | pre-training | us-central1 | 402,5 | 297,81 | 104,23 |
| 24f2006741/tds-carbon-card | NVIDIA V100 (5 GPUs) | fine-tuning | europe-north1 | 476,9 | 1022,95 | 122,75 |
| Chandy27/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa muestra diferencias significativas en el consumo energetico entre preentrenamiento con T4 y fine-tuning con V100, lo que refleja la influencia del hardware y la tarea en la huella de carbono.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA utilizable; es exclusivamente un registro de emisiones.
- Los datos de emisiones dependen del factor de emision de la region us-central1 y del PUE reportado, que pueden variar con el tiempo.
- No se especifica la duracion real del entrenamiento en tiempo de pared, solo las horas de GPU acumuladas.
- La licencia no esta definida, por lo que el uso comercial de los datos debe consultarse con el autor.
- No hay informacion sobre el modelo entrenado (arquitectura, parametros, rendimiento), lo que limita la utilidad del repositorio para fines tecnicos.
- La ausencia de benchmarks impide evaluar la calidad del modelo resultante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f2006473/tds-carbon-card
- Repositorio similar de otro usuario: https://huggingface.co/24f2006741/tds-carbon-card
- Repositorio similar de otro usuario: https://huggingface.co/Chandy27/tds-carbon-card
- GitHub del autor (actividad relacionada): https://github.com/24f2006473/tds-may-2026/activity
- Directorio de sostenibilidad de modelos de IA: https://carbontxt.org/ai-model-cards
