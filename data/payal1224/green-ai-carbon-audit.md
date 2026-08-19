# Payal1224/green-ai-carbon-audit

## Resumen

El repositorio `Payal1224/green-ai-carbon-audit` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de emisiones de carbono asociado a una ejecución de entrenamiento de un modelo no especificado. Fue creado por el usuario Payal1224 y publicado en Hugging Face el 19 de agosto de 2026. El contenido se limita a metadatos de sostenibilidad: consumo energético total de 456,480 kWh, emisiones de CO2 equivalente de 91,296 kg, y detalles del hardware utilizado (3 GPUs NVIDIA A100 durante 253,6 horas). No se proporciona información sobre arquitectura, pesos, parámetros ni capacidades del modelo subyacente.

Este tipo de repositorios se enmarca en la iniciativa Green AI, que busca cuantificar y reducir el impacto ambiental del entrenamiento de modelos. Su relevancia radica en la transparencia sobre el coste energético de la IA, un aspecto cada vez más demandado por la comunidad investigadora y regulatoria. Sin embargo, al carecer de artefactos de modelo, no puede utilizarse para inferencia ni para evaluación de rendimiento.

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

Nota: los datos disponibles se limitan a la auditoría de emisiones:

| Parametro | Valor |
|---|---|
| Emisiones totales | 91,296 kg CO2eq |
| Consumo energetico | 456,480 kWh |
| Hardware | 3x NVIDIA A100 |
| Tiempo de entrenamiento | 253,6 horas |
| PUE | 1,5 |
| Region | europe-west4 |
| Intensidad de carbono de la red | 200 gCO2eq/kWh |
| Tipo de entrenamiento | pre-training |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo entrenado. Los únicos datos de entrenamiento disponibles son los relativos al consumo energético: se utilizaron 3 GPUs NVIDIA A100 durante 253,6 horas, con un PUE de 1,5, en la región europe-west4 (Google Cloud). La intensidad de carbono de la red eléctrica en esa región se estimó en 200 gCO2eq/kWh, lo que resultó en un total de 91,296 kg CO2eq emitidos. No se menciona el número de tokens, el tamaño del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de generación, razonamiento, codificación, visión, audio ni tool calling.
- No se proporciona soporte para agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No existe un modo de pensamiento ni funcionalidades especiales.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: los datos de emisiones pueden emplearse para reportar el impacto ambiental de un entrenamiento, como parte de informes de responsabilidad corporativa o cumplimiento normativo.
- Investigación en Green AI: el registro sirve como ejemplo de cómo documentar el coste energético de un entrenamiento, útil para estudios comparativos sobre eficiencia.
- Benchmarking de infraestructura: permite contrastar el consumo de diferentes configuraciones de hardware y regiones cloud.
- Transparencia en publicaciones académicas: los autores pueden adjuntar este tipo de metadatos a sus papers para cumplir con directrices de reproducibilidad sostenible.
- Planificación de presupuesto energético: organizaciones pueden estimar el coste de futuros entrenamientos basándose en datos históricos similares.
- Educación y concienciación: sirve como material didáctico para ilustrar la magnitud del consumo energético en el entrenamiento de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de precisión, exactitud ni rendimiento del modelo subyacente.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo desplegable.
- El entrenamiento que generó estos datos utilizó 3 GPUs NVIDIA A100, aunque no se especifica la variante (por ejemplo, 40 GB u 80 GB).
- No se indica si es posible ejecutar el modelo en GPUs de consumo.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no existe un artefacto de modelo.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no es posible compararlo con alternativas como Llama, Mistral o Qwen. Los repositorios de auditoría de carbono son singulares y no existe una categoría estándar de comparación.

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo, por lo que no puede ser utilizado para tareas de generación, análisis o inferencia.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Los datos de emisiones son estimaciones basadas en factores de intensidad de carbono que pueden variar con el tiempo y la ubicación exacta.
- No se indica el método exacto de cálculo de CodeCarbon ni si se consideraron emisiones indirectas (fabricación de hardware, transporte, etc.).
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado ni utilizado por la comunidad.
- La fecha de creación (2026) es futura respecto a la fecha actual, lo que podría indicar un error de metadatos o un caso de uso experimental.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/Payal1224/green-ai-carbon-audit)
- [Repositorio similar de rajkumar17493](https://huggingface.co/rajkumar17493/green-ai-carbon-audit)
- [Documentación del Green AI Model](https://green-ai-model.github.io/docs/1_introduction/)
- [Recopilación de recursos sobre Green AI](https://ejhusom.github.io/green-ai/)
