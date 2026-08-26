# 23f3001593/green-ai-carbon-audit-demo

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial en el sentido convencional, sino un registro de auditoría de huella de carbono correspondiente a un proceso de entrenamiento. El autor, identificado como `23f3001593`, documenta las emisiones de CO₂ equivalente (149,863 kg) generadas durante un entrenamiento realizado con 8 GPUs NVIDIA RTX 4090, acumulando 296,5 horas de cómputo en la región `europe-north1` con un PUE de 1,17. Los datos proceden de la herramienta CodeCarbon y se presentan en el formato de model card propuesto por la iniciativa Green AI.

Su relevancia reside en la creciente necesidad de contabilizar el impacto ambiental del entrenamiento de modelos de IA. Aunque no ofrece capacidades de inferencia, sirve como referencia metodológica para reportar emisiones en proyectos similares, siguiendo las convenciones de Hugging Face y el movimiento Green AI. No se dispone de información sobre arquitectura, parámetros, licencia o idiomas, ya que no se trata de un modelo funcional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos adicionales extraídos de la model card:

| Parametro | Valor |
|---|---|
| Emisiones de CO₂ eq | 149,863 kg (CodeCarbon) |
| Hardware de entrenamiento | 8x NVIDIA RTX 4090 |
| Horas de cómputo | 296,5 GPU-hours |
| Ubicación del entrenamiento | europe-north1 |
| PUE del centro de datos | 1,17 |
| Tipo de entrenamiento | pre-training |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de red neuronal, ya que el repositorio no contiene pesos ni código de un modelo. La información de la model card se limita a documentar el proceso de entrenamiento: 8 GPUs NVIDIA RTX 4090 durante 296,5 horas en la región `europe-north1` de Google Cloud, con un PUE de 1,17. Las emisiones se calcularon mediante la librería CodeCarbon, que estima el CO₂ equivalente a partir del consumo energético y la intensidad de carbono de la red eléctrica local.

No se mencionan datos de entrenamiento, técnicas de alineación (RLHF, DPO) ni innovaciones técnicas. El propósito del repositorio es exclusivamente la contabilización del impacto ambiental, no el desarrollo de un sistema de IA.

## Capacidades

No aplica: este repositorio no contiene un modelo de IA funcional.

- No ofrece generación de texto, razonamiento, código, visión ni ninguna otra capacidad de IA.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural.
- No tiene capacidades multilingües.
- Su única función es documentar la huella de carbono de un entrenamiento, sirviendo como ejemplo de reporte ambiental.

## Casos de uso

Aunque no es un modelo de IA, el repositorio tiene utilidad práctica en el ámbito de la sostenibilidad del desarrollo de IA:

- Auditoría de emisiones en proyectos de IA: permite registrar y verificar el impacto de CO₂ de entrenamientos, siguiendo la metodología Green AI y las convenciones de Hugging Face.
- Elaboración de informes de sostenibilidad: los datos de emisiones pueden integrarse en reportes corporativos o académicos sobre el impacto ambiental de la IA.
- Comparación de eficiencia energética: investigadores pueden comparar las emisiones de distintos entrenamientos (por ejemplo, variando hardware o región) para elegir configuraciones más sostenibles.
- Educación y concienciación: sirve como ejemplo didáctico para enseñar cómo se contabiliza el impacto ambiental en proyectos de IA.
- Documentación de proyectos open source: los equipos pueden replicar el formato de esta model card para publicar su propia huella de carbono, mejorando la transparencia en el ecosistema.
- Optimización de recursos: al conocer las emisiones por hora de GPU, se puede estimar el coste ambiental de futuros entrenamientos y decidir si compensar o reducir el cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

No aplica para inferencia, ya que no existe un modelo que ejecutar. No obstante, el entrenamiento documentado utilizó:

- 8 GPUs NVIDIA RTX 4090 (24 GB VRAM cada una).
- 296,5 GPU-hours de cómputo en la región `europe-north1` de Google Cloud.
- PUE del centro de datos: 1,17.

No se dispone de datos sobre latencia o throughput, y no se recomienda ningún despliegue de inferencia.

## Comparativa con modelos similares

No existen modelos comparables en el sentido funcional, pero sí otros repositorios de auditoría de carbono con el mismo propósito:

| Repositorio | Contenido | Autor | Emisiones reportadas |
|---|---|---|---|
| `23f3001593/green-ai-carbon-audit-demo` | Registro de auditoría de entrenamiento | 23f3001593 | 149,863 kg CO₂ eq. |
| `harshitaarora14/carbon-audit-demo` | Model card de impacto ambiental | harshitaarora14 | no disponible |
| `rajkumar17493/green-ai-carbon-audit` | Auditoría de carbono de entrenamiento | rajkumar17493 | no disponible |

Los tres repositorios comparten el mismo propósito: documentar la huella de carbono de entrenamientos de IA, pero no contienen modelos funcionales.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede usar para ninguna tarea de inferencia, generación o razonamiento.
- No contiene pesos, arquitectura ni código de entrenamiento.
- La licencia no está especificada, por lo que su uso comercial o redistribución es incierto.
- Los datos de emisiones dependen de la precisión de CodeCarbon y de la intensidad de carbono de la red eléctrica en el momento del entrenamiento; pueden variar si se repite en otra región o con otro proveedor.
- La fecha de creación (2026-08-25) es posterior a la fecha actual del sistema, lo que sugiere que el repositorio podría ser un ejemplo de demostración o un error en los metadatos.
- No se proporcionan detalles sobre el dataset de entrenamiento, la duración real del entrenamiento (solo horas de GPU) ni el tamaño del modelo, por lo que es imposible evaluar la eficiencia energética relativa.

## Enlaces

- Hugging Face: https://huggingface.co/23f3001593/green-ai-carbon-audit-demo
- Repositorio similar (harshitaarora14): https://huggingface.co/harshitaarora14/carbon-audit-demo
- Repositorio similar (rajkumar17493): https://huggingface.co/rajkumar17493/green-ai-carbon-audit
- Página de Green AI (ejhusom): https://ejhusom.github.io/green-ai/
- Herramienta de auditoría de carbono en GitHub: https://github.com/komaipenrai/ai-carbon-auditor
- Documentación del modelo Green AI: https://green-ai-model.github.io/docs/1_introduction/
