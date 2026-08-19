# LiLXBro/sassytds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial funcional, sino una documentación de contabilidad de carbono asociada a un entrenamiento de fine-tuning realizado en el marco del proyecto TDS GA8. El autor, LiLXBro, publica en Hugging Face una model card que detalla las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante el proceso de entrenamiento. El objetivo es proporcionar transparencia sobre el impacto ambiental del ciclo de entrenamiento, siguiendo prácticas de Green AI.

La información disponible se limita a los metadatos de emisiones y especificaciones de hardware. No se incluyen pesos, arquitectura, datos de entrenamiento ni capacidades de inferencia, por lo que este repositorio no es utilizable como modelo de aprendizaje automático. Su relevancia radica en ser un ejemplo de reporte de sostenibilidad en IA, alineado con iniciativas como carbon.txt y las recomendaciones de model cards de Google DeepMind.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (sin pesos publicados) |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura del modelo, ya que este repositorio no contiene un modelo entrenado. Los datos de entrenamiento se limitan a los siguientes: modo de entrenamiento fine-tuning, hardware NVIDIA L40S (2 GPUs), región europe-north1, 217,3 horas de GPU con un PUE de 1,33, consumo energético total de 202,3063 kWh y emisiones de 24,277 kg CO₂eq. No se especifican técnicas de entrenamiento como RLHF, DPO ni innovaciones arquitectónicas.

## Capacidades

- No se dispone de ninguna capacidad funcional del modelo, ya que no se publican pesos ni artefactos de inferencia.
- El repositorio solo ofrece metadatos de emisiones de carbono y consumo energético.
- No hay soporte de generación de texto, razonamiento, código, visión ni tool calling.
- No es posible realizar inferencias ni integraciones con este artefacto.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como registro verificable de las emisiones generadas durante un entrenamiento concreto, útil para informes de responsabilidad ambiental corporativa.
- Investigación en Green AI: permite comparar el coste energético de distintos entrenamientos y hardware, contribuyendo a estudios sobre eficiencia de cómputo.
- Cumplimiento normativo: puede emplearse como evidencia de prácticas de transparencia ambiental en entornos regulados o con políticas ESG.
- Formación y divulgación: sirve como ejemplo didáctico de cómo documentar la huella de carbono de un modelo, siguiendo estándares como los de CodeCarbon.
- Integración en pipelines de reporte: los datos de emisiones pueden incorporarse a dashboards de seguimiento de impacto ambiental en organizaciones que entrenan modelos.
- Referencia para decisiones de infraestructura: los datos de hardware y consumo ayudan a estimar costes energéticos futuros al planificar entrenamientos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica, ya que no hay modelo para inferencia.
- El entrenamiento documentado utilizó 2 GPUs NVIDIA L40S durante 217,3 horas.
- Consumo energético total: 202,3063 kWh.
- Emisiones asociadas: 24,277 kg CO₂eq (fuente: CodeCarbon).
- No se especifican requisitos de despliegue ni opciones de inferencia (vLLM, llama.cpp, etc.).

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido de que este repositorio no es un modelo de IA, sino un registro de emisiones. No se puede establecer comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional; no se puede utilizar para ninguna tarea de IA.
- Los datos de emisiones corresponden a un único entrenamiento y no son generalizables a otros contextos.
- La licencia no está especificada, por lo que se desconoce si el contenido puede reutilizarse comercialmente.
- No se indica el idioma de la documentación (aunque está en inglés), ni se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto.
- Para producción, este artefacto es irrelevante; su valor es puramente documental y de auditoría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiLXBro/sassytds-carbon-card
- Model cards — Google DeepMind: https://deepmind.google/models/model-cards/
- Model Cards · Hugging Face: https://huggingface.co/docs/hub/model-cards
- AI model cards in carbon.txt y AI Sustainability Directory: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
