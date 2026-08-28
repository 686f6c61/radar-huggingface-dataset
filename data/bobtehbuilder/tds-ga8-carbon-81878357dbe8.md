# bobtehbuilder/tds-ga8-carbon-81878357dbe8

## Resumen

El repositorio `bobtehbuilder/tds-ga8-carbon-81878357dbe8` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de emisiones de carbono asociado a un entrenamiento denominado "TDS GA8". La model card únicamente documenta métricas de consumo energético y emisiones de CO₂ equivalente, calculadas con la herramienta CodeCarbon sobre un entrenamiento realizado en 7 GPUs NVIDIA A100 en la región europe-west4.

No se incluyen pesos, arquitectura, configuración ni ningún artefacto de modelo. El repositorio parece ser parte de una práctica de contabilidad de carbono en IA (Green AI), pero carece de cualquier componente técnico que permita su uso como modelo. Por tanto, esta ficha se limita a describir la información disponible, que es exclusivamente medioambiental.

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
| Formato de pesos | no disponible (no se incluyen archivos de pesos) |

## Arquitectura y entrenamiento

No se proporciona ninguna información sobre la arquitectura del modelo, el conjunto de datos, el proceso de entrenamiento o posibles técnicas como RLHF o DPO. La única información disponible se refiere al consumo energético del pre-entrenamiento:

- Hardware: 7 × NVIDIA A100 (400 W TDP cada una)
- Horas de GPU: 97,3
- PUE: 1,19
- Región: europe-west4 (intensidad de red 200 gCO₂eq/kWh)
- Energía total: 324,2036 kWh
- Emisiones: 64,841 kg CO₂eq

Estos datos se calcularon con CodeCarbon y se presentan como una ficha de emisiones, pero no describen ningún aspecto técnico del modelo subyacente.

## Capacidades

No se ha declarado ninguna capacidad funcional. Este repositorio no ofrece un modelo utilizable, por lo que no es posible listar habilidades de generación de texto, razonamiento, código, tool calling, agentes o capacidades multilingües.

## Casos de uso

Dado que no existe un modelo, no hay casos de uso prácticos de inferencia. El repositorio podría servir únicamente como:

- Auditoría de emisiones de carbono: el archivo de metadatos permite verificar el coste medioambiental de un entrenamiento concreto, útil para informes de sostenibilidad.
- Referencia metodológica: el cálculo de energía y emisiones puede replicarse para otros entrenamientos usando las fórmulas indicadas.
- Documentación de transparencia: dentro de un marco de IA responsable, este tipo de registro ayuda a cumplir requisitos de divulgación de huella de carbono.

No obstante, estos usos no implican la ejecución de ningún modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no existir un modelo, no es posible evaluar rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No aplicable para inferencia, ya que no hay pesos que cargar. Los requisitos de hardware mencionados (7 × A100) corresponden al entrenamiento que generó las emisiones registradas, no a un despliegue posterior.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no contiene un modelo de IA. Los repositorios similares encontrados en la búsqueda web (`bobtehbuilder/tds-ga8-carbon-08e493cb95c2`, `bobtehbuilder/tds-ga8-carbon-2e4f994e4d15`) parecen seguir el mismo patrón de registro de emisiones, pero tampoco ofrecen artefactos de modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, configuración ni código ejecutable.
- No se puede utilizar para ninguna tarea de inferencia o generación.
- La información de emisiones es específica del entrenamiento documentado y no debe extrapolarse a otros contextos.
- La licencia no está especificada, por lo que el uso del contenido del repositorio (si lo hubiera) queda sujeto a la normativa general de Hugging Face.
- Riesgo de confusión: el nombre "tds-ga8" podría inducir a pensar que se trata de un modelo, pero es únicamente una etiqueta de seguimiento de carbono.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-81878357dbe8
- Repositorio similar (mismo autor): https://huggingface.co/bobtehbuilder/tds-ga8-carbon-08e493cb95c2
- Repositorio similar (mismo autor): https://huggingface.co/bobtehbuilder/tds-ga8-carbon-2e4f994e4d15
- Repositorio GitHub relacionado (sin confirmar contenido): https://github.com/22f3001797/tds-ga8
- Repositorio GitHub relacionado (sin confirmar contenido): https://github.com/llEclipsell/tds-ga8
