# Harish-23f2001523/tds-carbon-card

## Resumen

Este repositorio, identificado como `Harish-23f2001523/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella de CO₂ asociada a un proceso de entrenamiento de un modelo. El autor, Harish-23f2001523, lo ha publicado como parte de la asignación TDS GA8, un ejercicio académico centrado en la medición de emisiones en el entrenamiento de modelos. El repositorio incluye únicamente un archivo README con metadatos sobre el consumo energético y las emisiones generadas durante un fine-tuning realizado en hardware NVIDIA V100.

La relevancia de este tipo de repositorios radica en la creciente preocupación por el impacto ambiental del entrenamiento de modelos de IA. Aunque no ofrece capacidades de inferencia ni pesos de modelo, sirve como ejemplo de cómo documentar de forma estandarizada las emisiones de carbono asociadas a un entrenamiento concreto, siguiendo prácticas como las de CodeCarbon. En este caso, se reporta un total de 186,975 kg de CO₂ equivalente, con un consumo de 534,2148 kWh y 374,1 horas de GPU.

Al tratarse de un registro de emisiones y no de un modelo, la mayor parte de las especificaciones técnicas habituales (arquitectura, parámetros, contexto, etc.) no están disponibles. La ficha se centra, por tanto, en los datos de entrenamiento y en las implicaciones de este tipo de documentación para la comunidad de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |
| Hardware de entrenamiento | NVIDIA V100 (4 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region de entrenamiento | us-central1 |
| Horas de GPU | 374,1 h (PUE: 1,19) |
| Energia total consumida | 534,2148 kWh |
| Emisiones de CO2 | 186,975 kg CO₂eq |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente, ya que este repositorio no publica pesos, configuración ni detalles del modelo. El contenido se limita a los datos de consumo y emisiones del proceso de fine-tuning. Según el README, el entrenamiento se realizó en 4 GPUs NVIDIA V100, en la región us-central1, con un total de 374,1 horas de GPU y un factor de eficiencia energética (PUE) de 1,19. La energía total consumida fue de 534,2148 kWh, lo que resultó en 186,975 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon.

No se mencionan técnicas de entrenamiento como RLHF, DPO, ni innovaciones arquitectónicas. La ausencia de estos datos es esperable, pues el propósito del repositorio no es compartir un modelo, sino documentar su huella de carbono como parte de una práctica académica de Green AI.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generación, razonamiento, código, visión u otras funciones propias de los modelos de IA.
- Funciona como un registro de metadatos de emisiones de carbono, útil para auditorías de sostenibilidad en proyectos de IA.
- Puede servir como plantilla o ejemplo para otros desarrolladores que deseen documentar el impacto ambiental de sus propios entrenamientos.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como referencia para calcular y reportar las emisiones de CO₂ de un entrenamiento concreto, siguiendo el formato de CodeCarbon. Un equipo de MLOps podría replicar esta estructura para integrar la medición de carbono en su pipeline de desarrollo.
- Educación y formación en Green AI: en cursos o talleres sobre IA responsable, este tipo de tarjetas se utilizan como ejemplo práctico de cómo cuantificar el impacto ambiental del entrenamiento de modelos, fomentando buenas prácticas entre estudiantes y profesionales.
- Comparación de eficiencia energética entre configuraciones: al existir múltiples repositorios similares (con diferentes GPUs, regiones y horas de entrenamiento), se pueden comparar las emisiones reportadas para evaluar qué configuraciones son más eficientes. Por ejemplo, este registro con 4 V100 y 374,1 h contrasta con otros que usan 6 V100 o regiones distintas.
- Integración en informes de responsabilidad corporativa: empresas que desarrollan IA pueden usar estos datos como parte de sus memorias de sostenibilidad, mostrando el coste ambiental de sus actividades de entrenamiento.
- Investigación sobre el impacto de la localización geográfica: al incluir la región (us-central1), se puede analizar cómo varían las emisiones según el mix eléctrico de cada zona, un factor clave en la huella de carbono de la IA.
- Desarrollo de herramientas de monitorización de carbono: los datos aquí reportados pueden servir para validar o calibrar herramientas que estiman emisiones en tiempo real, como CodeCarbon, comparando las cifras estimadas con las reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica para inferencia, ya que no se proporciona ningún modelo.
- El hardware reportado es de entrenamiento: 4 GPUs NVIDIA V100, con un total de 374,1 horas de GPU.
- Para reproducir el entrenamiento (si se conociera el modelo subyacente) se necesitaría un clúster con al menos 4 GPUs V100 o equivalente.
- No se indican opciones de despliegue, latencia ni throughput, al no existir un modelo servible.

## Comparativa con modelos similares

No procede comparar con modelos de IA, pero sí con otros repositorios de la misma asignatura que documentan emisiones de carbono. Se listan algunos ejemplos encontrados en la búsqueda web:

| Repositorio | GPUs | Region | GPU horas | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| Harish-23f2001523/tds-carbon-card | 4x V100 | us-central1 | 374,1 | 534,2148 | 186,975 |
| 23f3000008/tds-carbon-card | 6x V100 | asia-south1 | 424,1 | 931,3236 | 605,36 |
| vrajs13/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |
| Hrishi-iitm/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa muestra diferencias significativas en emisiones según el hardware y la región, lo que subraya la importancia de la localización y la eficiencia energética en el entrenamiento de modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de inferencia, generación o procesamiento de lenguaje.
- La licencia no está especificada, por lo que el uso del contenido del repositorio (el README) queda sujeto a las condiciones generales de Hugging Face, sin garantías adicionales.
- Los datos de emisiones se basan en estimaciones de CodeCarbon y dependen de factores como el PUE y el mix eléctrico de la región; pueden no ser exactos para otros contextos.
- No se proporcionan detalles sobre el modelo entrenado (arquitectura, parámetros, dataset), lo que limita la reproducibilidad del proceso de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un ejercicio académico sin uso práctico inmediato.
- Al carecer de un modelo, no se pueden evaluar sesgos, alucinaciones ni otros riesgos típicos de los sistemas de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Harish-23f2001523/tds-carbon-card
- Repositorio en GitHub (asociado al autor): https://github.com/23f2001523/TDS-P1
- Otros repositorios similares: https://huggingface.co/vrajs13/tds-carbon-card, https://huggingface.co/Hrishi-iitm/tds-carbon-card, https://huggingface.co/23f3000008/tds-carbon-card
