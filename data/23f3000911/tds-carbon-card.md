# 23f3000911/tds-carbon-card

## Resumen

El repositorio `23f3000911/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) asociada al entrenamiento de un modelo dentro del programa TDS GA8. Documenta la huella de carbono y el consumo energético de una ejecución de pre-entrenamiento realizada con tres GPU NVIDIA L40S en la región us-central1 de Google Cloud. El objetivo es proporcionar transparencia sobre el impacto ambiental del entrenamiento, siguiendo la iniciativa Green AI y el formato de model cards con metadatos `co2_eq_emissions`.

Este tipo de registros son relevantes para la comunidad de IA responsable, ya que permiten comparar el coste energético de diferentes configuraciones de entrenamiento y fomentar prácticas más sostenibles. La tarjeta incluye métricas como emisiones de CO2 equivalente, consumo eléctrico total, horas de GPU y el factor de eficiencia energética (PUE) del centro de datos. No se proporciona información sobre el modelo entrenado en sí (arquitectura, pesos, tareas), por lo que esta ficha se centra exclusivamente en los datos de sostenibilidad documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni documentación sobre arquitectura, dataset o proceso de optimización. La única información de entrenamiento disponible es la relativa al consumo de recursos: se utilizaron 3 GPU NVIDIA L40S durante 123,6 horas en modo pre-entrenamiento, en la región us-central1. El consumo energético total fue de 155,736 kWh, con un factor PUE de 1,2, lo que arroja unas emisiones de 54,508 kg de CO2 equivalente (calculadas con CodeCarbon). No se especifican los datos de entrenamiento, el número de tokens ni el tipo de modelo.

## Capacidades

No procede. Este repositorio no ofrece capacidades de generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad propia de un modelo de IA. Su única función es servir como registro de sostenibilidad y contabilidad de carbono para una ejecución de entrenamiento concreta.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: permite a organizaciones y equipos de ML cuantificar las emisiones de CO2 de sus cargas de trabajo y reportarlas en informes de sostenibilidad.
- Comparativa de eficiencia energética entre configuraciones: los datos de hardware, horas de GPU y PUE pueden utilizarse para evaluar qué infraestructura es más eficiente para un mismo tipo de entrenamiento.
- Cumplimiento de políticas de IA responsable: sirve como evidencia documental para iniciativas internas o externas que exigen transparencia sobre el impacto climático de los modelos.
- Investigación en Green AI: los datos agregados de múltiples tarjetas (como las de otros repositorios similares) pueden alimentar estudios sobre el coste energético real de los pre-entrenamientos en la nube.
- Trazabilidad de experimentos: junto con el repositorio de código asociado (`23f3000911/tds-may-2026`), permite reconstruir el contexto de un entrenamiento y su huella ambiental.
- Educación y divulgación: útil como ejemplo práctico de cómo documentar emisiones en model cards, siguiendo estándares como el formato `co2_eq_emissions` de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable ni métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.). Los únicos datos numéricos son los relativos a consumo energético y emisiones.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El entrenamiento documentado utilizó 3 GPU NVIDIA L40S, con un total de 123,6 horas de GPU.
- El consumo energético total fue de 155,736 kWh, con un PUE de 1,2 en la región us-central1.
- No se especifican requisitos de VRAM, memoria o almacenamiento para reproducir el entrenamiento.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable en el sentido de capacidades de IA. Sin embargo, se pueden comparar los datos de emisiones con otras tarjetas de carbono del mismo programa:

| Repositorio | Hardware | GPUs | Modo | Region | Horas GPU | Energia total | Emisiones CO2 |
|---|---|---|---|---|---|---|---|
| 23f3000911/tds-carbon-card | NVIDIA L40S | 3 | pre-training | us-central1 | 123,6 | 155,736 kWh | 54,508 kg |
| Divya-netter/tds-carbon-card | NVIDIA RTX 4090 | 6 | fine-tuning | us-east1 | 388 | 1508,544 kWh | 633,588 kg |

La comparativa muestra una gran diferencia en emisiones, atribuible al tipo de entrenamiento (pre-training vs fine-tuning), al hardware y a la duración. La tarjeta de 23f3000911 es notablemente más eficiente en términos de CO2 por hora de GPU (0,441 kg/h frente a 1,633 kg/h de la de Divya-netter).

## Limitaciones y advertencias

- No contiene ningún modelo de IA, por lo que no puede utilizarse para inferencia, generación ni ninguna tarea de procesamiento de lenguaje natural.
- Los datos de emisiones dependen del factor de emisión de la red eléctrica de la región us-central1 y del PUE declarado; no son directamente extrapolables a otras ubicaciones o proveedores.
- La metodología de cálculo (CodeCarbon) puede diferir de otros estándares, lo que dificulta comparaciones directas con otras tarjetas que usen herramientas distintas.
- No se indica la licencia del contenido, por lo que su reutilización fuera del contexto académico o de investigación requiere precaución.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un ejercicio académico o de demostración, no un recurso ampliamente validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/23f3000911/tds-carbon-card
- Repositorio GitHub asociado: https://github.com/23f3000911/tds-may-2026
- Directorio de sostenibilidad de modelos de IA (carbontxt.org): https://carbontxt.org/ai-model-cards
