# pretzelspep/tds_carbon_card_1

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning realizado en el marco de la asignatura TDS GA8. El autor, pretzelspep, documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento de un modelo no especificado, utilizando la herramienta CodeCarbon. La información disponible se limita a métricas de consumo energético y huella de carbono: 124,3 horas de GPU en tres NVIDIA L40S, un consumo total de 198,38 kWh y 83,321 kg de CO₂eq emitidos en la región us-east1.

Al no existir pesos, arquitectura ni ningún artefacto de modelo, esta ficha no puede evaluar capacidades técnicas ni de rendimiento. Su relevancia radica en ser un ejemplo de práctica de transparencia ambiental en el desarrollo de IA, alineada con iniciativas de Green AI. Para cualquier uso práctico, este repositorio carece de utilidad como modelo; debe tratarse como un metadato de sostenibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica ningún modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura, ya que el repositorio no contiene un modelo. Los únicos datos de entrenamiento disponibles son los relativos al consumo energético: se utilizaron 3 GPUs NVIDIA L40S durante 124,3 horas, con un PUE (Power Usage Effectiveness) de 1,52, lo que resulta en un consumo total de 198,3828 kWh. La emisión de CO₂eq se calculó con CodeCarbon y asciende a 83,321 kg. No se indica el tipo de modelo fine-tuneado, el dataset empleado ni ninguna técnica de optimización.

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de generación, razonamiento, código, visión u otras.
- No se ha publicado ningún artefacto que permita inferencia o uso práctico.
- La única funcionalidad es documental: registrar la huella de carbono de un proceso de entrenamiento.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para reportar emisiones de CO₂ de entrenamientos, siguiendo el formato de CodeCarbon.
- Cumplimiento de requisitos de transparencia ambiental: puede usarse como referencia para integrar métricas de carbono en model cards de otros proyectos.
- Educación en Green AI: útil como ejemplo práctico en cursos sobre computación sostenible, mostrando cómo cuantificar el impacto energético de un fine-tuning.
- Comparación de eficiencia entre configuraciones de hardware: los datos de GPU horas y PUE permiten estimar el coste ambiental relativo de distintas infraestructuras.
- Elaboración de informes de responsabilidad social corporativa: las cifras de emisiones pueden incorporarse a memorias de sostenibilidad de empresas que desarrollan IA.
- Investigación sobre huella de carbono en ML: los valores registrados (83,321 kg CO₂eq) pueden servir como dato empírico en estudios sobre el impacto ambiental del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene ningún modelo evaluable, por lo que no existen métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otras arquitecturas.

## Requisitos de hardware

- No aplica: al no existir un modelo, no se requieren recursos de inferencia.
- Los únicos datos de hardware se refieren al entrenamiento: 3 GPUs NVIDIA L40S, con 124,3 horas de uso.
- No se proporciona información sobre VRAM, latencia, throughput ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no existe una categoría comparable. Los repositorios encontrados en la búsqueda web (pranhai/tds-carbon-card, shivainlabs/tds-carbon-card, srujannnn/tds-carbon-card, 24f1002805/tds-carbon-card, pandey1111/tds-carbon-card) contienen exactamente el mismo tipo de documentación de carbono, pero no son modelos alternativos.

## Limitaciones y advertencias

- No contiene ningún modelo utilizable: no hay pesos, tokenizador ni configuración de inferencia.
- La información sobre el modelo fine-tuneado es inexistente: se desconoce la arquitectura, el dataset y el propósito del entrenamiento.
- Los datos de emisiones dependen de la metodología de CodeCarbon y del factor de emisión de la región us-east1; no son directamente extrapolables a otras ubicaciones.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable legalmente.
- No se ofrecen garantías sobre la exactitud de las métricas energéticas; el PUE de 1,52 es un valor estimado.
- Para producción o investigación, este repositorio no aporta valor como modelo; solo como registro ambiental.

## Enlaces

- Repositorio principal: https://huggingface.co/pretzelspep/tds_carbon_card_1
- Repositorios similares (misma plantilla de contabilidad de carbono):
  - https://huggingface.co/pranhai/tds-carbon-card
  - https://huggingface.co/shivainlabs/tds-carbon-card
  - https://huggingface.co/srujannnn/tds-carbon-card
  - https://huggingface.co/24f1002805/tds-carbon-card
  - https://huggingface.co/pandey1111/tds-carbon-card
