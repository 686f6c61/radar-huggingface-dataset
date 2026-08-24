# Hrishi-iitm/tds-carbon-card

## Resumen
Este repositorio, identificado como `Hrishi-iitm/tds-carbon-card`, no contiene un modelo de inteligencia artificial ni un conjunto de pesos entrenados. Se trata de una tarjeta de contabilidad de carbono (carbon card) que documenta las emisiones de CO₂ generadas durante una ejecución de entrenamiento de un modelo no especificado, realizada en el contexto de la asignatura TDS GA8. El autor, Hrishi-iitm, publica esta tarjeta como parte de un ejercicio académico sobre Green AI, con el objetivo de hacer transparente el coste energético del entrenamiento.

La información disponible se limita a los datos de emisiones: 202,26 kg de CO₂ equivalente, generados durante 137,2 horas de GPU en una configuración de 5 NVIDIA RTX 4090, con un consumo total de 481,572 kWh y un PUE de 1,56, en la región us-east1. No se proporciona ninguna especificación del modelo entrenado (arquitectura, parámetros, contexto, etc.), por lo que esta ficha se limita a describir el contenido real del repositorio y a señalar la ausencia de un modelo subyacente.

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
No se dispone de información sobre la arquitectura del modelo que se entrenó, ya que el repositorio solo contiene una tarjeta de emisiones. Los datos de entrenamiento incluidos son: hardware utilizado (5 NVIDIA RTX 4090), modo de entrenamiento (pre-training), región (us-east1), horas de GPU (137,2 h), energía total consumida (481,572 kWh) y emisiones de CO₂ (202,26 kg CO₂eq). No se menciona el número de tokens, la composición del dataset ni técnicas como RLHF o DPO. Tampoco hay innovaciones técnicas documentadas.

## Capacidades
No aplicable: este repositorio no contiene un modelo de IA, por lo que no posee capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes ni multilingüismo. La única funcionalidad es la de servir como registro de la huella de carbono de un entrenamiento.

## Casos de uso
No aplicable: al no existir un modelo, no hay casos de uso de inferencia ni de integración en aplicaciones. El repositorio podría utilizarse como ejemplo de cómo documentar emisiones de entrenamiento, pero no como un modelo desplegable.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
No aplicable para inferencia, ya que no hay un modelo que ejecutar. Los requisitos de hardware documentados se refieren al entrenamiento: 5 GPU NVIDIA RTX 4090, con un consumo total de 481,572 kWh y 137,2 horas de GPU. No se especifican requisitos de VRAM, latencia ni throughput para ningún escenario de despliegue.

## Comparativa con modelos similares
No disponible: no existen modelos comparables porque este repositorio no es un modelo. Existen otros repositorios similares con el mismo propósito (p. ej., `nyiitm/tds-carbon-card`, `DAKSHiitm/tds-carbon-card`, `srishti0109/tds-carbon-card`, `shivainlabs/tds-carbon-card`, `i-shashikant/tds-carbon-card`) que también son tarjetas de carbono, pero no contienen modelos. No hay datos de rendimiento ni de arquitectura para comparar.

## Limitaciones y advertencias
- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje, visión u otra.
- La información sobre emisiones es específica de un entrenamiento concreto y no generalizable a otros modelos.
- No se indica la licencia del repositorio, por lo que su uso comercial no está claramente permitido.
- No hay garantías de que los datos de emisiones sean exactos o verificables de forma independiente.
- La ausencia de especificaciones técnicas impide cualquier evaluación de rendimiento o calidad.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Hrishi-iitm/tds-carbon-card
- Repositorios similares (mismo propósito, sin modelo):
  - https://huggingface.co/nyiitm/tds-carbon-card
  - https://huggingface.co/DAKSHiitm/tds-carbon-card
  - https://huggingface.co/srishti0109/tds-carbon-card
  - https://huggingface.co/shivainlabs/tds-carbon-card
  - https://huggingface.co/i-shashikant/tds-carbon-card
