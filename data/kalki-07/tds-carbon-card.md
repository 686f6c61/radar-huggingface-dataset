# Kalki-07/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo (model card) dedicada a la contabilidad de carbono del entrenamiento de un modelo asignado en el curso TDS GA8. El autor, Kalki-07, documenta las emisiones de CO₂ equivalente generadas durante una fase de pre-entrenamiento, utilizando la herramienta CodeCarbon y el hardware NVIDIA V100. El objetivo es proporcionar transparencia sobre el impacto ambiental del entrenamiento, siguiendo las prácticas de "Green AI" promovidas por Hugging Face y otras iniciativas.

La tarjeta incluye métricas concretas: 149,8 horas de GPU, 127,63 kWh de energía consumida y 15,316 kg de CO₂eq emitidos, con un PUE de 1,42 en la región europe-north1. No se especifica qué modelo se entrenó, ni su arquitectura, tamaño o parámetros. Por tanto, esta ficha no describe un modelo utilizable, sino un registro de sostenibilidad.

Aunque el repositorio se denomina "tds-carbon-card", no hay ningún artefacto de modelo (pesos, tokenizador, configuraciones) ni documentación técnica sobre el propio modelo entrenado. Es un caso de estudio sobre cómo reportar emisiones en tarjetas de modelo, más que un recurso para desarrolladores.

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

Datos adicionales de la tarjeta (no del modelo):

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 2x NVIDIA V100 |
| Modo de entrenamiento | pre-training |
| Region | europe-north1 |
| Horas de GPU | 149,8 h (PUE 1,42) |
| Energia total | 127,6296 kWh |
| Emisiones CO₂eq | 15,316 kg |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo entrenado. La tarjeta solo documenta el proceso de entrenamiento desde la perspectiva del consumo energetico y las emisiones. Se indica que se utilizaron 2 GPUs NVIDIA V100 durante 149,8 horas en la region europe-north1 de Google Cloud, con un PUE (Power Usage Effectiveness) de 1,42. La energia total consumida fue de 127,63 kWh, lo que resulto en 15,316 kg de CO₂ equivalente, calculados mediante CodeCarbon. No hay detalles sobre el dataset, el numero de tokens, ni tecnicas de optimizacion como RLHF o DPO.

## Capacidades

- No aplica: este repositorio no contiene un modelo de IA con capacidades de generacion, razonamiento, codigo, vision, tool calling, agentes o multilingues.
- La unica "capacidad" es la de servir como registro de emisiones de carbono para un entrenamiento especifico, utilizable para auditorias ambientales o estudios de eficiencia energetica.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: la tarjeta permite a organizaciones y academicos verificar el impacto ambiental de un entrenamiento concreto, comparando metricas como kWh y kg CO₂eq.
- Educacion sobre Green AI: puede usarse como ejemplo en cursos o talleres sobre como reportar emisiones en model cards, siguiendo las recomendaciones de Hugging Face y la OCDE.
- Benchmarking de eficiencia energetica: los datos de PUE, horas de GPU y emisiones pueden compararse con otros entrenamientos para evaluar la eficiencia de diferentes hardware o regiones.
- Cumplimiento normativo: en contextos donde se exija transparencia ambiental, este tipo de registro puede servir como evidencia documental.
- Investigacion en computacion verde: los datos agregados de multiples tarjetas similares (como las de otros autores) permiten analisis estadisticos sobre el coste ambiental de entrenar modelos.
- Integracion en pipelines de reporte: la estructura YAML de la tarjeta puede parsearse automaticamente para generar informes de sostenibilidad en herramientas de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento del modelo, solo metricas de consumo energetico.

## Requisitos de hardware

- No se requiere hardware para "usar" este repositorio, ya que no contiene un modelo ejecutable.
- El hardware utilizado en el entrenamiento documentado fue de 2x NVIDIA V100, con 149,8 horas de GPU.
- Para reproducir el entrenamiento (si se conociera el modelo) se necesitarian GPUs similares o superiores, pero no se especifica.
- No hay opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay modelo.

## Comparativa con modelos similares

Existen otras tarjetas de carbono identicas en Hugging Face, creadas por otros usuarios para el mismo curso TDS GA8:

| Repositorio | Autor | Emisiones CO₂eq | Hardware | Region |
|---|---|---|---|---|
| Kalki-07/tds-carbon-card | Kalki-07 | 15,316 kg | 2x V100 | europe-north1 |
| amankumarmahali/tds-carbon-card | amankumarmahali | no disponible | no disponible | no disponible |
| ajaysurya07/tds-carboncard | ajaysurya07 | no disponible | no disponible | no disponible |

Las tres tarjetas siguen la misma plantilla y probablemente documentan entrenamientos diferentes, pero no se dispone de los datos de las otras dos. No hay comparacion posible con modelos de IA reales, ya que este no es uno.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, generacion de texto, etc.
- La informacion sobre el modelo entrenado es inexistente: no se indica ni el nombre, ni la arquitectura, ni los parametros, ni el dataset.
- Los datos de emisiones dependen de la herramienta CodeCarbon y de los factores de emision de la region; pueden no ser exactos o comparables con otras mediciones.
- La licencia no esta especificada, por lo que el uso del contenido del repositorio (texto y metadatos) queda sujeto a las condiciones por defecto de Hugging Face.
- No hay garantia de que el entrenamiento documentado sea reproducible, ya que faltan todos los detalles tecnicos.
- La fecha de creacion (2026-08-28) es posterior a la fecha actual, lo que sugiere que podria tratarse de un error o de un proyecto ficticio; se recomienda verificar la autenticidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kalki-07/tds-carbon-card
- Tarjeta similar de amankumarmahali: https://huggingface.co/amankumarmahali/tds-carbon-card
- Tarjeta similar de ajaysurya07: https://huggingface.co/ajaysurya07/tds-carboncard
- Articulo de la OCDE sobre reporte de emisiones en model cards: https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
- Proyecto Kalki (posible relacion no confirmada): https://www.projectkalki.com/
- Articulo de Green Web Foundation sobre model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
