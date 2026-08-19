# hrshvs/tds-carbon-card

## Resumen

El repositorio `hrshvs/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono (model card) que documenta la huella medioambiental de un entrenamiento de modelo realizado en el marco del proyecto "Green AI Carbon Accounting" (TDS GA8). Fue creado por el usuario hrshvs y publicado en Hugging Face el 19 de agosto de 2026.

El objetivo de este tipo de repositorios es registrar de forma transparente las emisiones de CO₂ asociadas a un entrenamiento concreto, siguiendo prácticas de IA sostenible. En este caso, se detalla un entrenamiento de pre-entrenamiento realizado en la región `asia-south1` con hardware NVIDIA V100 (6 GPUs), con un consumo energético total de 458,055 kWh y unas emisiones de 297,736 kg CO₂eq. No se especifica qué modelo se entrenó, ni su arquitectura, tamaño o cualquier otra característica técnica.

Este repositorio es relevante en el contexto actual de creciente preocupación por el impacto ambiental de la IA, y sirve como ejemplo de cómo documentar la huella de carbono de los entrenamientos, aunque carece de información sobre el modelo en sí.

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

Nota: este repositorio no contiene un modelo, sino una ficha de emisiones de carbono. Los datos técnicos del modelo entrenado no se han publicado.

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo entrenado. La única información disponible se refiere al entorno de entrenamiento:

- Hardware: 6 GPUs NVIDIA V100
- Modo de entrenamiento: pre-training
- Región: asia-south1 (Google Cloud)
- Horas de GPU: 175,5 horas (con PUE de 1,45)
- Energía total consumida: 458,055 kWh
- Emisiones de CO₂: 297,736 kg CO₂eq (medidas con CodeCarbon)

No se indican datos sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No aplicable. Este repositorio no contiene un modelo con capacidades de generación, razonamiento o procesamiento del lenguaje. Es un registro de contabilidad de carbono.

## Casos de uso

Dado que no se trata de un modelo de IA, los casos de uso se limitan al ámbito de la documentación y auditoría medioambiental:

- Auditoría de sostenibilidad: permite a organizaciones verificar las emisiones de CO₂ asociadas a un entrenamiento concreto, útil para reportes de responsabilidad corporativa.
- Comparativa de eficiencia energética: sirve como referencia para comparar el coste energético de distintos entrenamientos en función del hardware y la región.
- Cumplimiento normativo: en contextos donde se exija transparencia sobre el impacto ambiental de la IA, esta ficha puede servir como evidencia documental.
- Investigación en IA verde: proporciona datos empíricos (kWh, kg CO₂eq, PUE) para estudios sobre la huella de carbono de los modelos.
- Optimización de infraestructura: los datos de consumo energético pueden ayudar a decidir qué región o hardware utilizar para minimizar emisiones.
- Educación y concienciación: ejemplifica cómo documentar el coste ambiental de un entrenamiento, útil para cursos o talleres sobre IA sostenible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo.

## Requisitos de hardware

No aplicable. El repositorio no incluye un modelo para inferencia. Los únicos datos de hardware se refieren al entrenamiento:

- 6 GPUs NVIDIA V100 (utilizadas durante el entrenamiento)
- Región de cómputo: asia-south1
- Consumo energético total: 458,055 kWh
- Emisiones: 297,736 kg CO₂eq

No hay información sobre despliegue, VRAM estimada ni opciones de inferencia.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no es posible compararlo con otros modelos. Existen otros repositorios similares en Hugging Face (por ejemplo, `Akash7677/tds-carbon-card`) que también documentan emisiones de carbono para el mismo proyecto, pero no contienen modelos comparables.

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo de IA, solo una ficha de emisiones. Cualquier intento de usarlo como modelo fallará.
- No se especifica qué modelo se entrenó, por lo que los datos de emisiones no pueden asociarse a una arquitectura concreta.
- La licencia no está indicada, por lo que no se puede determinar si el contenido puede reutilizarse libremente.
- Los datos de emisiones dependen del proveedor de nube y de la metodología de CodeCarbon; pueden no ser directamente comparables con otras mediciones.
- No se proporciona información sobre el dataset, el número de parámetros ni la calidad del modelo entrenado.
- Para uso en producción, este repositorio no aporta ninguna funcionalidad de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hrshvs/tds-carbon-card
- Repositorio similar (mismo proyecto): https://huggingface.co/Akash7677/tds-carbon-card
- Documentación de model cards de Hugging Face: https://huggingface.co/docs/hub/model-cards
