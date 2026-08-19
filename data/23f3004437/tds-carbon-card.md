# 23f3004437/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono (carbon card) asociada a un proceso de entrenamiento o ajuste fino realizado en el marco de la asignatura TDS GA8. El autor, identificado como 23f3004437, documenta las emisiones de CO₂ equivalente generadas durante una ejecución de entrenamiento con hardware NVIDIA H100, en la región europe-west4. El propósito es transparentar el impacto ambiental del cómputo, siguiendo prácticas de Green AI.

La relevancia de este tipo de fichas radica en la creciente necesidad de reportar el coste energético y la huella de carbono de los modelos de IA, especialmente en entornos académicos y de investigación. No se trata de un modelo con arquitectura, parámetros o capacidades de inferencia; es un documento de metadatos ambientales. Por tanto, todas las especificaciones técnicas habituales de un modelo de lenguaje o visión no aplican y se indican como no disponibles.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se trata de un modelo de IA, sino de un registro de contabilidad de carbono. El repositorio documenta una ejecución de ajuste fino (fine-tuning) realizada con 4 GPUs NVIDIA H100 en la región europe-west4. Según la model card, el entrenamiento consumió 190,6 horas de GPU (con un PUE de 1,4), una energía total de 747,152 kWh y generó 149,43 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se proporcionan detalles sobre el modelo base, el conjunto de datos ni el tipo de tarea.

## Capacidades

- No aplica: el repositorio no contiene un modelo funcional.
- La unica capacidad documentada es la de registrar emisiones de CO₂ y consumo energético de un entrenamiento.
- No hay generación de texto, razonamiento, código, visión ni ninguna otra capacidad de IA.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: este tipo de ficha permite a organizaciones y centros de investigación reportar el impacto climático de sus cargas de trabajo.
- Cumplimiento de políticas de sostenibilidad: las empresas pueden usar estos registros para alinearse con estándares de divulgación como el carbon.txt (versión 0.5) propuesto por The Green Web Foundation.
- Comparación de eficiencia energética entre configuraciones de hardware: por ejemplo, comparar el coste de carbono de entrenar en H100 frente a A100 (como se observa en otros repositorios similares).
- Educación en Green AI: en entornos académicos, estos registros sirven para concienciar sobre el coste ambiental del cómputo.
- Optimización de infraestructura: los datos de energía y emisiones pueden guiar decisiones sobre regiones de cómputo (europe-west4) y tipos de GPU.
- Trazabilidad en experimentos: permite asociar un coste ambiental concreto a un experimento concreto, facilitando la reproducibilidad y la rendición de cuentas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe un modelo que evaluar.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo.
- El entrenamiento documentado utilizó 4 GPUs NVIDIA H100, con un consumo total de 747,152 kWh y 190,6 horas de GPU.
- Para replicar el registro de emisiones se requiere la herramienta CodeCarbon y acceso a los metadatos de hardware y energía.
- No se especifican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay modelo que servir.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no tiene comparables en cuanto a capacidades. Existen otros repositorios de la misma serie (por ejemplo, 23f3001222/tds-carbon-card) que documentan entrenamientos con hardware diferente (A100) y distintos modos (pre-training), pero no son modelos.

## Limitaciones y advertencias

- El repositorio no contiene ningún artefacto de modelo; es exclusivamente un registro de emisiones.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de los factores de emisión de la región; pueden variar según la fuente de electricidad.
- No se indica la licencia del contenido, por lo que su reutilización debe hacerse con cautela.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque no hay modelo.
- Para uso en producción o investigación, este repositorio no aporta ninguna capacidad funcional.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/23f3004437/tds-carbon-card
- Repositorio similar (23f3001222): https://huggingface.co/23f3001222/tds-carbon-card
- Repositorio similar (24f3004361): https://huggingface.co/24f3004361/tds-carbon-card
- GitHub del autor (posiblemente relacionado): https://github.com/23f3004437/tds-ga5-q10-solver
- Referencia sobre model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
