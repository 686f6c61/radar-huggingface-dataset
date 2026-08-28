# beingtushar/tds-carbon-card

## Resumen

Este repositorio, identificado como `beingtushar/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento de un modelo no especificado. El autor, `beingtushar`, documenta las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning realizado en la región `ap-southeast1` de Google Cloud, utilizando cuatro GPUs NVIDIA V100. El objetivo es proporcionar transparencia sobre el coste energético y la huella de carbono de un entrenamiento concreto, en el contexto de la iniciativa "Green AI" (TDS GA8).

La relevancia de este repositorio radica en la creciente preocupación por el impacto ambiental del entrenamiento de modelos de IA. Aunque no ofrece capacidades de inferencia ni generación, sirve como ejemplo de buenas prácticas para el registro de emisiones, un aspecto cada vez más demandado en entornos académicos y empresariales. No se dispone de información sobre la arquitectura, el tamaño o el propósito del modelo original que fue ajustado.

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

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura del modelo subyacente, ya que su propósito es documentar el impacto ambiental del proceso de entrenamiento. Según la model card, se realizó un fine-tuning sobre un modelo no identificado, utilizando 4 GPUs NVIDIA V100 en la región `ap-southeast1`. El entrenamiento consumió 472,9 horas de GPU (con un PUE de 1,55), lo que supuso un total de 879,594 kWh de energía y 422,205 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se especifican detalles sobre el dataset, el número de tokens o técnicas como RLHF o DPO.

## Capacidades

No aplica. Este repositorio no contiene un modelo de IA con capacidades de generación, razonamiento, código, visión o tool calling. Se limita a un registro de emisiones de carbono.

## Casos de uso

No aplica. Al no ser un modelo de IA, no existen casos de uso de inferencia o generación. El único propósito práctico es servir como referencia para la contabilidad de carbono en proyectos de entrenamiento de modelos, pero no es una aplicación de IA en sí misma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye evaluaciones de rendimiento del modelo original.

## Requisitos de hardware

- No aplica para inferencia, ya que no se ofrece ningún modelo desplegable.
- El entrenamiento documentado utilizó 4 GPUs NVIDIA V100, con un total de 472,9 horas de GPU.
- No se proporcionan requisitos de VRAM, latencia o throughput para inferencia.

## Comparativa con modelos similares

No disponible. No existen modelos comparables, dado que este repositorio no es un modelo de IA sino un registro de emisiones.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para tareas de generación, análisis o procesamiento de lenguaje.
- La información sobre el modelo original es inexistente: se desconoce su arquitectura, tamaño, licencia o propósito.
- Los datos de emisiones son específicos de una ejecución concreta y no generalizables a otros entrenamientos.
- No se indica si el repositorio tiene restricciones de uso comercial, aunque al carecer de licencia explícita, su reutilización podría estar sujeta a interpretación.
- Para producción, no ofrece ninguna utilidad práctica como modelo.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/beingtushar/tds-carbon-card)
