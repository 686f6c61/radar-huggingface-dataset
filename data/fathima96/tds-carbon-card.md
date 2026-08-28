# fathima96/tds-carbon-card

## Resumen

Este repositorio, identificado como `fathima96/tds-carbon-card`, no contiene un modelo de inteligencia artificial al uso, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento concreta. Forma parte de una serie de repositorios similares creados por estudiantes del programa TDS GA8, cuyo objetivo es documentar la huella medioambiental de los entrenamientos de modelos. En este caso, se detalla el hardware utilizado (seis GPU NVIDIA T4), la energía consumida (88,2235 kWh) y las emisiones de CO₂ equivalente (17,645 kg) durante un proceso de pre-entrenamiento.

La relevancia de este tipo de repositorios radica en la creciente preocupación por el impacto ambiental de la IA. Aunque no ofrece capacidades de inferencia ni procesamiento, sirve como ejemplo de buenas prácticas de transparencia y medición de emisiones en el desarrollo de modelos. No se dispone de información sobre arquitectura, parámetros, contexto o licencia, ya que no se trata de un modelo publicable.

## Especificaciones técnicas

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

Datos adicionales del entrenamiento documentado:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA T4 (6 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | europe-west4 |
| Horas de GPU | 136,4 h (PUE: 1,54) |
| Energia total | 88,2235 kWh |
| Emisiones de CO₂ | 17,645 kg CO₂eq |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de modelo, ya que este repositorio no contiene pesos ni configuración de red. La información se limita a los datos de consumo energético y emisiones de una ejecución de pre-entrenamiento. Se indica que se utilizaron seis GPU NVIDIA T4 en la región europe-west4, con un total de 136,4 horas de GPU y un factor de efectividad energética (PUE) de 1,54. La energía total consumida fue de 88,2235 kWh, lo que resultó en 17,645 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon.

No hay información sobre el dataset, el número de tokens procesados ni técnicas de optimización como RLHF o DPO. Tampoco se mencionan innovaciones técnicas en el entrenamiento.

## Capacidades

Este repositorio no ofrece capacidades de procesamiento de lenguaje, visión ni ninguna otra funcionalidad de IA. No es un modelo ejecutable, sino un documento de metadatos sobre el impacto ambiental de un entrenamiento. Por tanto, no procede enumerar capacidades de generación, razonamiento, tool calling, agentes, etc.

## Casos de uso

Dado que no es un modelo de IA, los casos de uso se limitan a su función como registro de contabilidad de carbono:

- Auditoría ambiental de entrenamientos: permite a organizaciones o investigadores verificar y reportar las emisiones asociadas a sus procesos de entrenamiento, contribuyendo a la transparencia en sostenibilidad.
- Comparación de eficiencia energética: sirve como referencia para comparar el coste energético de diferentes configuraciones de hardware (por ejemplo, T4 frente a A100) en la misma región.
- Educación y concienciación: puede utilizarse en cursos o talleres sobre IA verde para ilustrar cómo se mide y documenta la huella de carbono de un entrenamiento.
- Cumplimiento normativo: en contextos donde se exija reportar el impacto ambiental de la computación, este tipo de registros puede servir como evidencia.
- Investigación en eficiencia: los datos de energía y emisiones pueden alimentar estudios sobre optimización de recursos en centros de datos.
- Reproducibilidad de experimentos: aunque no se detalla el modelo, el registro de hardware y energía permite estimar el coste de replicar un entrenamiento similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo, ya que su propósito es exclusivamente la contabilidad de carbono.

## Requisitos de hardware

No aplica para inferencia, ya que no hay modelo que ejecutar. No obstante, el entrenamiento documentado utilizó:

- 6 GPU NVIDIA T4
- Región europe-west4
- 136,4 horas de GPU

No se proporcionan requisitos de VRAM, latencia ni throughput, ni opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

Existen otros repositorios con el mismo propósito y nombre (`tds-carbon-card`) creados por diferentes autores dentro del mismo programa TDS GA8. A continuación se comparan algunos de ellos según los datos disponibles en la búsqueda web:

| Repositorio | Hardware | GPU horas | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|
| fathima96/tds-carbon-card | NVIDIA T4 (6 GPUs) | 136,4 | 88,2235 | 17,645 |
| 23f3001222/tds-carbon-card | NVIDIA A100 (3 GPUs) | 206,6 | 384,276 | 76,855 |
| 24f1002805/tds-carbon-card | no disponible | no disponible | no disponible | no disponible |
| deepti-iitm/tds-carbon-card | no disponible | no disponible | no disponible | no disponible |

Se observa que el repositorio de fathima96 utiliza un hardware menos potente (T4) y consume menos energía que el de 23f3001222, que emplea A100. No hay más datos comparativos.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de inferencia, generación o procesamiento.
- Información incompleta: no se especifican la arquitectura, los parámetros, el dataset ni la licencia, lo que limita su utilidad para reproducir el entrenamiento.
- Datos de emisiones específicos de una ejecución: los valores de CO₂ dependen de la región y del hardware; no son generalizables a otros contextos.
- Sin garantía de precisión: la metodología de cálculo (CodeCarbon) puede tener incertidumbres asociadas a los factores de emisión de la red eléctrica.
- Uso comercial: al no haber licencia declarada, no se puede determinar si los datos pueden utilizarse comercialmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fathima96/tds-carbon-card
- Repositorios similares encontrados en la búsqueda web:
  - https://huggingface.co/23f3001222/tds-carbon-card
  - https://huggingface.co/24f1002805/tds-carbon-card
  - https://huggingface.co/deepti-iitm/tds-carbon-card
  - https://huggingface.co/24f2008906/tds-carbon
