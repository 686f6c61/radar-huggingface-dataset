# 23f2004680/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario 23f2004680 en Hugging Face, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella ambiental de un proceso de fine-tuning. Forma parte de una serie de repositorios similares creados en el contexto de la asignatura TDS GA8, cuyo objetivo es registrar de forma estandarizada las emisiones de CO₂, el consumo energético y el hardware utilizado durante el entrenamiento de modelos. La relevancia de este tipo de documentación radica en la creciente preocupación por la sostenibilidad en el desarrollo de IA, conocida como Green AI, y en la necesidad de disponer de métricas comparables para evaluar el coste ambiental de los experimentos.

El repositorio incluye únicamente una model card con los datos del entrenamiento: se utilizaron 6 GPUs NVIDIA V100 en la región asia-south1, con un total de 79,4 horas de cómputo, un consumo energético de 182,9376 kWh y unas emisiones de 118,909 kg de CO₂ equivalente. No se proporciona información sobre la arquitectura del modelo, los parámetros, el dataset o cualquier otra característica técnica del sistema entrenado. Por tanto, esta ficha se limita a describir el contenido real del repositorio y a contextualizar su propósito dentro del movimiento de transparencia ambiental en IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos adicionales del entrenamiento documentado:

| Parametro | Valor |
|---|---|
| Hardware | 6x NVIDIA V100 |
| Modo de entrenamiento | fine-tuning |
| Region | asia-south1 |
| Horas de GPU | 79,4 h (PUE: 1,28) |
| Energia total | 182,9376 kWh |
| Emisiones de CO₂ | 118,909 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente, ya que el repositorio no incluye pesos, configuraciones ni descripciones del sistema entrenado. La model card se limita a reportar los datos de consumo y emisiones del proceso de fine-tuning, sin especificar el tipo de red neuronal, el número de parámetros, el dataset utilizado ni las técnicas de optimización aplicadas. El entrenamiento se realizó con 6 GPUs NVIDIA V100 en la región asia-south1, durante 79,4 horas, con un factor de eficiencia energética (PUE) de 1,28. La herramienta CodeCarbon fue empleada para estimar las emisiones de CO₂, que ascendieron a 118,909 kg equivalentes.

## Capacidades

Este repositorio no implementa ninguna capacidad de inteligencia artificial. No genera texto, no procesa imágenes, no ejecuta razonamiento ni ofrece ninguna funcionalidad de inferencia. Su único contenido es un registro de métricas ambientales asociadas a un entrenamiento previo. Por tanto, no procede enumerar capacidades de modelo.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como evidencia documental del coste energético y las emisiones de un entrenamiento concreto, útil para informes de responsabilidad corporativa o cumplimiento de normativas ambientales.
- Comparación de eficiencia entre configuraciones de hardware: al existir repositorios similares con diferentes GPUs (por ejemplo, H100), permite contrastar el impacto ambiental de distintas infraestructuras de cómputo.
- Investigación en Green AI: los datos de emisiones y energía pueden utilizarse en estudios académicos sobre la huella de carbono del machine learning, contribuyendo a establecer métricas estandarizadas.
- Optimización de presupuestos de carbono en organizaciones: las empresas pueden usar estos registros para decidir qué tipo de GPU o región geográfica emplear en función de su impacto ambiental.
- Transparencia en publicaciones científicas: los autores pueden adjuntar este tipo de tarjetas a sus papers para cumplir con los requisitos de reproducibilidad y sostenibilidad de algunas conferencias.
- Formación en computación responsable: el repositorio puede servir como ejemplo didáctico en cursos sobre ética y sostenibilidad en IA, mostrando cómo cuantificar el coste ambiental de un experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo (como MMLU, HumanEval o GSM8K) porque no se trata de un modelo de IA, sino de un registro de contabilidad de carbono.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo desplegable.
- El hardware utilizado en el entrenamiento documentado fue de 6 GPUs NVIDIA V100, con un total de 79,4 horas de cómputo.
- No se especifican requisitos de VRAM, GPU recomendadas para inferencia, opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia, al no existir un modelo servible.

## Comparativa con modelos similares

No existen modelos de IA comparables, pero sí otros repositorios de la misma serie "tds-carbon-card" que documentan entrenamientos con diferentes configuraciones. La siguiente tabla compara los datos de emisiones y hardware de dos de ellos:

| Repositorio | Hardware | Horas GPU | Energia (kWh) | CO₂ (kg) | Region |
|---|---|---|---|---|---|
| 23f2004680/tds-carbon-card | 6x V100 | 79,4 | 182,94 | 118,91 | asia-south1 |
| Bhagwat8978/tds-carbon-card | 3x H100 | 459,5 | 1399,18 | 587,66 | us-east1 |

Se observa una gran diferencia en el consumo y las emisiones, atribuible al tipo de GPU y a la duración del entrenamiento. No obstante, al carecer de información sobre el modelo entrenado, no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo de IA, por lo que no puede utilizarse para inferencia ni para ninguna tarea de procesamiento del lenguaje natural, visión u otra modalidad.
- No se dispone de información sobre la licencia, los idiomas, la arquitectura o los parámetros del modelo subyacente, lo que impide cualquier uso práctico más allá de la consulta de los datos de emisiones.
- La metodología de cálculo de emisiones (CodeCarbon) puede tener incertidumbres asociadas a los factores de emisión de la red eléctrica de la región asia-south1, que no se detallan en el repositorio.
- Al ser un registro de un entrenamiento específico, los datos no son generalizables a otros experimentos ni pueden extrapolarse a modelos de diferente tamaño o arquitectura.
- No se indica si el entrenamiento documentado corresponde a un modelo open source o propietario, ni si los pesos están disponibles en algún otro repositorio.

## Enlaces

- Repositorio original: https://huggingface.co/23f2004680/tds-carbon-card
- Repositorio similar (Bhagwat8978): https://huggingface.co/Bhagwat8978/tds-carbon-card
- Repositorio similar (anant-venkatesh1): https://huggingface.co/anant-venkatesh1/tds-carbon-card
- Repositorio similar (pranhai): https://huggingface.co/pranhai/tds-carbon-card
- Repositorio similar (Jesmelchi): https://huggingface.co/Jesmelchi/tds-carbon-card
- Repositorio similar (23f3000911): https://huggingface.co/23f3000911/tds-carbon-card
