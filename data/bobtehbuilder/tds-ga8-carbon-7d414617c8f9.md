# bobtehbuilder/tds-ga8-carbon-7d414617c8f9

## Resumen

Este repositorio de HuggingFace, identificado como `bobtehbuilder/tds-ga8-carbon-7d414617c8f9`, no contiene un modelo de inteligencia artificial. Se trata de un registro de contabilidad de emisiones de carbono asociado a un proceso de fine-tuning, elaborado como parte de la asignación académica "GA8" del curso TDS (Tools in Data Science) del IIT Madras. El repositorio documenta las emisiones de CO₂ equivalente generadas durante un entrenamiento realizado en una GPU NVIDIA V100 en la región us-east1 de Google Cloud, utilizando la herramienta CodeCarbon para la medición.

La relevancia de este repositorio radica en su naturaleza ejemplar: muestra cómo se puede documentar la huella de carbono de un entrenamiento de modelos de IA siguiendo el estándar de la tarjeta de modelo (model card) con metadatos de emisiones. No aporta ningún peso, arquitectura ni capacidad de inferencia, por lo que no puede ser evaluado ni desplegado como un modelo de lenguaje o de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura de modelo, ya que este repositorio no contiene un modelo. Los únicos datos de entrenamiento disponibles son los metadatos de emisiones: se utilizó una GPU NVIDIA V100 con un TDP de 300 W, una sola GPU, durante 134,9 horas, con un PUE de 1,11 y una intensidad de red de 420 gCO₂eq/kWh en la región us-east1. El consumo energético total fue de 44,9217 kWh, lo que resulta en 18,867 kg de CO₂ equivalente. No se indica el tipo de modelo ni el dataset utilizado.

## Capacidades

- No dispone de ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de ningún otro tipo.
- No incluye thinking mode, visión ni audio.

## Casos de uso

Dado que no es un modelo de IA, no existen casos de uso operativos. Sin embargo, el repositorio puede servir como:

- Ejemplo académico de cómo documentar la huella de carbono de un entrenamiento de IA en una model card, útil para estudiantes de cursos de ciencia de datos que deban replicar esta práctica.
- Referencia para calcular las emisiones de entrenamientos propios siguiendo la fórmula `energy_kWh = TDP x GPUs x hours x PUE / 1000` y `co2_kg = energy_kWh x grid_intensity / 1000`.
- Plantilla para la integración de CodeCarbon en pipelines de entrenamiento de modelos.
- Documentación de la sostenibilidad de un proceso de fine-tuning en la región us-east1 de Google Cloud, para comparar con otras regiones o hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que no existe un modelo que evaluar.

## Requisitos de hardware

No aplica para inferencia, puesto que no hay modelo. Los requisitos de hardware documentados corresponden al entrenamiento original:

- GPU NVIDIA V100 (300 W TDP) durante 134,9 horas.
- Consumo energético total de 44,9217 kWh en la región us-east1.
- Emisiones de 18,867 kg de CO₂eq.
- No se requieren recursos adicionales para el despliegue, ya que no hay artefactos de modelo.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable en este repositorio. Los repositorios similares encontrados en la búsqueda web (`uditaab/IITM_TDS_GA8` y `24f1000999/tds-2025-ga8`) son también repositorios académicos para la misma asignación GA8, sin modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA, por lo que cualquier intento de usarlo como tal fallará.
- No hay pesos, configuraciones ni código de inferencia en el repositorio.
- La licencia no está especificada, por lo que no se puede asumir ningún permiso de uso comercial.
- Los datos de emisiones son específicos del hardware y la región utilizados; extrapolarlos a otros entornos requeriría recálculo.
- La fecha de creación (2026-08-19) es posterior a la fecha actual, lo que sugiere que el repositorio puede ser un artefacto de prueba o una simulación.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-7d414617c8f9
- Repositorio GitHub de un compañero de la asignación: https://github.com/uditaab/IITM_TDS_GA8
- Repositorio GitHub de otro estudiante: https://github.com/24f1000999/tds-2025-ga8
- Página de Wikipedia del avión GippsAero GA8 Airvan (sin relación directa, pero aparece en los resultados de búsqueda): https://en.wikipedia.org/wiki/GippsAero_GA8_Airvan
