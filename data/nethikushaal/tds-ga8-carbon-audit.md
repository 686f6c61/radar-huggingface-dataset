# nethikushaal/tds-ga8-carbon-audit

## Resumen

El repositorio `nethikushaal/tds-ga8-carbon-audit` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de emisiones de carbono asociado a una ejecución de entrenamiento de un modelo. Fue creado por el usuario `nethikushaal` el 26 de agosto de 2026 como parte de un ejercicio académico para el curso TDS 2026 May GA8 (MLOps & Fine-Tuning), concretamente la pregunta 10. El documento detalla el cálculo de la huella de carbono (24,836 kg CO₂eq) de un entrenamiento realizado con 4 GPU NVIDIA T4 en la región europe-west4.

Este tipo de repositorios se utilizan en la comunidad de Hugging Face para reportar las emisiones asociadas a ejecuciones de entrenamiento, siguiendo el estándar de metadatos `co2_eq_emissions` de la plataforma. No se incluye ningún peso de modelo, tokenizador o código de inferencia; solo los datos de cálculo y la metodología empleada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |
| Emisiones CO₂eq | 24,836 kg |
| Hardware de entrenamiento | 4x NVIDIA T4 (TDP 70W) |
| Horas de GPU | 354,8 |
| PUE | 1,25 |
| Region | europe-west4 (intensidad de red 200 gCO₂eq/kWh) |
| Tipo de entrenamiento | pre-training |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo (transformer, MoE, SSM, etc.) porque el repositorio no contiene un modelo. El contenido se limita a un cálculo de emisiones de carbono para una ejecución de entrenamiento hipotética o real, usando la metodología de CodeCarbon. La fórmula aplicada es:

`energy_kWh = (70 * 4 * 354,8 * 1,25) / 1000 = 124,18 kWh`
`co2_kg = (124,18 * 200) / 1000 = 24,836 kg CO₂eq`

No se documentan datos del dataset, ni proceso de optimización, ni técnicas de entrenamiento. El repositorio es un ejemplo de cómo reportar la huella de carbono de un entrenamiento en el formato estándar de Hugging Face.

## Capacidades

No aplicable. Este repositorio no contiene un modelo de IA ni expone ninguna capacidad de generación, razonamiento, código, visión, etc. Su única función es documentar la huella de carbono de un entrenamiento.

## Casos de uso

Dado que no es un modelo, los casos de uso se limitan a:

- Auditoría de emisiones de carbono de ejecuciones de entrenamiento: el repositorio sirve como plantilla o ejemplo para calcular y reportar las emisiones de CO₂ de un entrenamiento de ML, siguiendo el estándar de Hugging Face.
- Cumplimiento de requisitos académicos o corporativos: puede usarse como entrega para un curso (como el TDS GA8) o para documentar el impacto ambiental de una ejecución en un informe de sostenibilidad.
- Comparación de huellas de carbono entre configuraciones de hardware: el cálculo permite comparar la eficiencia energética de distintas GPUs o regiones.
- Educación sobre sostenibilidad en IA: sirve como material didáctico para mostrar cómo calcular emisiones de entrenamiento.
- Integración en pipelines de MLOps: el formato de metadatos puede extraerse automáticamente por herramientas de Hugging Face para registrar el impacto ambiental de cada ejecución.
- Referencia para calcular PUE y emisiones en entornos cloud: el ejemplo incluye un factor de PUE (1,25) y una intensidad de red regional, útil para replicar en otros escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de modelo (MMLU, HumanEval, GSM8K, etc.) porque el repositorio no contiene un modelo.

## Requisitos de hardware

No aplicable para el modelo, pero el entrenamiento auditado utilizó:

- 4 GPU NVIDIA T4 (TDP 70W cada una)
- Total de horas de GPU: 354,8
- Consumo energético estimado: 124,18 kWh
- Emisiones de CO₂: 24,836 kg

Para reproducir el cálculo no se necesita hardware específico; es una operación aritmética con los parámetros documentados.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no tiene comparables en la misma categoría. Otros repositorios con el mismo propósito (por ejemplo, `aiajajaiintelligence/tds-ga8-carbon-audit` y `mayankawrr/tds-ga8-green-ai-carbon-audit`) contienen el mismo tipo de documentación de auditoría de carbono, pero no presentan métricas de rendimiento de modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para inferencia, generación de texto, código, etc.
- Los datos de emisiones son estimaciones basadas en el TDP de la GPU y el PUE, no en mediciones reales del consumo energético.
- La región europe-west4 tiene una intensidad de red específica que puede no ser representativa de otros centros de datos.
- La licencia no está especificada, por lo que su uso comercial no está claramente permitido.
- El repositorio no incluye el código fuente del entrenamiento ni los datos utilizados, solo la auditoría.
- Fecha de creación futura (2026-08-26) puede indicar un error en la metadata o un ejercicio con datos simulados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nethikushaal/tds-ga8-carbon-audit
- Repositorio similar de `aiajajaiintelligence`: https://huggingface.co/aiajajaiintelligence/tds-ga8-carbon-audit
- Repositorio similar de `mayankawrr`: https://huggingface.co/mayankawrr/tds-ga8-green-ai-carbon-audit
- GitHub con herramienta de auditoría de carbono (relacionado): https://github.com/Sathwik-giddi/Carbon_audit
- GitHub con el ejercicio TDS GA8 (referencia del curso): https://github.com/llEclipsell/tds-ga8
