# ayezakhan9911/tds-carbon-card

## Resumen

El repositorio `ayezakhan9911/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo orientada a la contabilidad de carbono y energía del entrenamiento de un modelo. Publicado por el usuario ayezakhan9911, documenta las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning realizado en el marco de la asignatura TDS GA8. El objetivo es proporcionar transparencia sobre el impacto ambiental del entrenamiento, siguiendo prácticas de Green AI.

El contenido se limita a un README con los datos de consumo energético y emisiones, calculados con CodeCarbon. Se especifica que el entrenamiento se realizó en 5 GPUs NVIDIA A100 en la región europe-west4, con un total de 389,7 horas de GPU, un consumo de 950,868 kWh y 190,174 kg de CO₂eq. No se incluyen pesos, arquitectura ni ningún artefacto de modelo. Su relevancia radica en ejemplificar la creciente tendencia a reportar la huella de carbono de los modelos, un aspecto cada vez más demandado en publicaciones y despliegues responsables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se proporciona) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |
| Hardware de entrenamiento | 5x NVIDIA A100 |
| Region de entrenamiento | europe-west4 |
| Horas de GPU | 389,7 h (PUE: 1,22) |
| Energia total consumida | 950,868 kWh |
| Emisiones de CO₂eq | 190,174 kg |
| Herramienta de medicion | CodeCarbon |
| Tipo de entrenamiento | fine-tuning |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente, ya que este repositorio no contiene el modelo en si, sino unicamente el registro de su huella de carbono. Segun la model card, el entrenamiento fue un fine-tuning realizado sobre hardware NVIDIA A100 (5 GPUs) en la region europe-west4. El calculo de emisiones se llevo a cabo con CodeCarbon, una herramienta estandar para estimar el CO₂eq generado durante el entrenamiento. Se reportan 389,7 horas de GPU con un PUE (Power Usage Effectiveness) de 1,22, lo que resulta en un consumo total de 950,868 kWh y 190,174 kg de CO₂eq. No se mencionan tecnicas de optimizacion, datos de entrenamiento ni procesos de alineamiento como RLHF o DPO.

## Capacidades

- No es un modelo de IA funcional: no genera texto, codigo ni realiza inferencias.
- Proporciona metadatos de sostenibilidad: emisiones de CO₂, consumo energetico y ubicacion geografica del entrenamiento.
- Sirve como registro auditable para iniciativas de Green AI y reportes de impacto ambiental.
- Compatible con el formato de model cards de Hugging Face, aunque no incluye secciones de uso ni evaluacion.

## Casos de uso

- Auditoria ambiental de proyectos de IA: el repositorio permite verificar el coste energetico de un entrenamiento concreto, util para organizaciones que necesitan reportar su huella de carbono.
- Educacion en computacion sostenible: puede usarse como ejemplo en cursos sobre Green AI para ilustrar como documentar emisiones en la practica.
- Comparacion de eficiencia entre configuraciones: al existir repositorios similares (p. ej. con V100 en otra region), permite contrastar el impacto de distintas GPUs y ubicaciones.
- Cumplimiento normativo: en contextos donde se exija transparencia ambiental, este tipo de tarjetas sirve como evidencia.
- Investigacion sobre costes de entrenamiento: los datos de energia y emisiones pueden alimentar estudios sobre el coste real de los modelos.
- Integracion en pipelines de MLOps: aunque no es un modelo, su estructura puede incorporarse a sistemas de seguimiento de experimentos para registrar el impacto de cada ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento del modelo, ya que no se trata de un modelo de IA, sino de un registro de emisiones.

## Requisitos de hardware

- No se requieren recursos para inferencia, ya que no hay modelo que ejecutar.
- El entrenamiento documentado utilizo 5 GPUs NVIDIA A100, con un total de 389,7 horas de GPU.
- El consumo energetico total fue de 950,868 kWh, lo que a un coste medio de 0,20 €/kWh supondria unos 190 € solo en electricidad (sin contar hardware).
- Para reproducir el entrenamiento se necesitaria un cluster con al menos 5 A100, aunque no se especifican otros requisitos (memoria, almacenamiento, etc.).
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama, al no ser un modelo generativo.

## Comparativa con modelos similares

Se comparan repositorios de la misma serie "tds-carbon-card", que documentan entrenamientos con distinto hardware y region:

| Repositorio | Hardware | GPUs | Region | Horas GPU | Energia (kWh) | CO₂eq (kg) |
|---|---|---|---|---|---|---|
| ayezakhan9911/tds-carbon-card | NVIDIA A100 | 5 | europe-west4 | 389,7 | 950,868 | 190,174 |
| ayeshaalvi/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| khanmuneeba99/tds-carbon-card | NVIDIA V100 | 1 | ap-southeast1 | 170,3 | 60,286 | 28,937 |

La comparacion muestra diferencias significativas en eficiencia: el entrenamiento con V100 en ap-southeast1 consumio mucho menos energia y emitio menos CO₂ que el de A100 en europe-west4, aunque los datos no permiten concluir sobre el rendimiento del modelo resultante.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni configuracion, por lo que no puede ejecutarse ni integrarse en aplicaciones.
- Ausencia de informacion sobre el modelo original: se desconoce la arquitectura, el tamano y el dataset, lo que impide evaluar la relevancia del entrenamiento.
- Licencia no especificada: no se indica si el contenido puede reutilizarse o si hay restricciones de uso comercial.
- Datos de emisiones parciales: el calculo de CodeCarbon depende de factores como el PUE y la intensidad de carbono de la red electrica, que pueden variar; no se detalla la metodologia completa.
- Riesgo de malinterpretacion: al estar etiquetado como "model card", un usuario podria pensar que contiene un modelo de IA, cuando en realidad es solo un registro ambiental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ayezakhan9911/tds-carbon-card
- Repositorio similar (ayeshaalvi): https://huggingface.co/ayeshaalvi/tds-carbon-card
- Repositorio similar (khanmuneeba99): https://huggingface.co/khanmuneeba99/tds-carbon-card
- Articulo sobre model cards de carbono en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Analisis de model cards en IA (arXiv): https://arxiv.org/pdf/2402.05160
