# 23f1000346/tds-carbon-card

## Resumen

Este repositorio de Hugging Face, identificado como `23f1000346/tds-carbon-card`, no contiene un modelo de inteligencia artificial propiamente dicho, sino una "model card" de contabilidad de carbono para un entrenamiento de pre-entrenamiento realizado en el marco del programa TDS GA8. El autor, `23f1000346`, documenta la huella de CO₂ equivalente generada durante el proceso, siguiendo la iniciativa Green AI de transparencia medioambiental. El objetivo es cuantificar el coste energético y las emisiones asociadas a un entrenamiento concreto, utilizando la herramienta CodeCarbon.

La relevancia actual de este tipo de registros radica en la creciente preocupación por el impacto ambiental del entrenamiento de grandes modelos. Aunque aquí no se describe ningún modelo en sí, la ficha sirve como ejemplo de buenas prácticas de divulgación de métricas de sostenibilidad. No se dispone de información sobre arquitectura, parámetros, contexto o capacidades del modelo entrenado, ya que el repositorio se limita a los datos de emisiones y consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo entrenado, su tamaño o los datos de entrenamiento. El repositorio únicamente documenta el proceso de entrenamiento desde una perspectiva energética: se utilizaron 7 GPUs NVIDIA RTX 4090 en la región `us-central1`, con un total de 450,2 horas de GPU y un PUE (Power Usage Effectiveness) de 1,16. La energía total consumida fue de 1645,0308 kWh, lo que resultó en 575,761 kg de CO₂ equivalente, según el cálculo realizado con CodeCarbon. No se menciona el uso de técnicas como RLHF, DPO u otras innovaciones de entrenamiento.

## Capacidades

No se describen capacidades funcionales del modelo, ya que el repositorio no contiene información sobre tareas que pueda realizar. Las únicas "capacidades" documentadas son:

- Registro y reporte de emisiones de CO₂ equivalente mediante CodeCarbon.
- Cuantificación del consumo energético y la huella de carbono de un entrenamiento específico.
- Publicación de métricas de sostenibilidad en formato de model card.

## Casos de uso

Dado que no se trata de un modelo desplegable, los casos de uso se limitan al ámbito de la contabilidad medioambiental y la transparencia en IA:

- Auditoría de sostenibilidad: permite a organizaciones y grupos de investigación evaluar el coste ambiental de sus entrenamientos y comparar con otros registros similares.
- Cumplimiento de políticas de Green AI: sirve como plantilla para documentar emisiones en proyectos que exigen informes de huella de carbono.
- Investigación en eficiencia energética: los datos de consumo y emisiones pueden utilizarse para estudiar la relación entre hardware, duración de entrenamiento y emisiones.
- Transparencia pública: facilita que la comunidad conozca el impacto real de los entrenamientos y fomenta prácticas más responsables.
- Benchmarking de infraestructura: los valores de PUE y energía pueden compararse con otros centros de datos o configuraciones de GPU.
- Educación y divulgación: material de referencia para cursos o talleres sobre IA sostenible y medición de emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo (como MMLU, HumanEval, GSM8K, etc.), únicamente datos de emisiones y consumo energético.

## Requisitos de hardware

Los requisitos de hardware documentados se refieren al entrenamiento, no a la inferencia:

- GPUs utilizadas: 7 × NVIDIA RTX 4090.
- Horas de GPU: 450,2 horas.
- Región: us-central1 (Google Cloud).
- PUE del centro de datos: 1,16.
- Energía total consumida: 1645,0308 kWh.
- No se especifican requisitos para inferencia, ya que no se publica ningún modelo.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables, ya que este repositorio no describe un modelo de IA sino un registro de emisiones. Existen otras "carbon cards" de otros usuarios (por ejemplo, `Obaid2026/tds-carbon-card` o `23f1003136/tds-carbon-card`) con el mismo propósito, pero no se dispone de sus datos detallados para realizar una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo ni pesos, por lo que no es útil para tareas de inferencia o generación.
- No se especifica la licencia de uso, por lo que cualquier reutilización de los datos debe hacerse con cautela.
- Los datos de emisiones dependen de factores como el mix eléctrico de la región y el PUE, que pueden variar con el tiempo.
- No se indica qué modelo concreto se entrenó, ni su tamaño o finalidad, lo que limita la interpretación de los datos.
- No se proporcionan métricas de rendimiento del modelo, por lo que no es posible evaluar su calidad.
- La ausencia de información sobre arquitectura, parámetros o contexto impide cualquier uso práctico como modelo de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/23f1000346/tds-carbon-card
- Directorio de sostenibilidad de modelos de IA (carbontxt.org): https://carbontxt.org/ai-model-cards
- Explorador de model cards (model-card.vercel.app): https://model-card.vercel.app/about
