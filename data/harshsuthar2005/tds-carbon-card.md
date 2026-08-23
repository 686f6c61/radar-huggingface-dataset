# harshsuthar2005/tds-carbon-card

## Resumen

El repositorio `harshsuthar2005/tds-carbon-card` no contiene un modelo de IA, sino una tarjeta de documentación de contabilidad de carbono (carbon card) asociada a una tarea académica denominada TDS GA8. Este tipo de artefactos forma parte de una iniciativa creciente en la comunidad de IA para registrar de forma estandarizada las emisiones de CO₂ asociadas al entrenamiento de modelos, siguiendo el formato de metadatos `co2_eq_emissions` de Hugging Face y herramientas como CodeCarbon.

La tarjeta documenta un entrenamiento de tipo pre-training realizado en la región europe-north1 sobre 7 GPUs NVIDIA L40S, con un total de 471,1 horas de cómputo (PUE 1,12), un consumo energético de 1292,6984 kWh y unas emisiones de 155,124 kg de CO₂ equivalente. No se proporciona información sobre arquitectura, parámetros, dataset o rendimiento del modelo que se entrenó; el repositorio se limita exclusivamente a la contabilidad ambiental del proceso.

La relevancia de este tipo de repositorios radica en que contribuyen a la transparencia y trazabilidad del impacto ambiental de la IA, un tema cada vez más presente en la evaluación de modelos y en la toma de decisiones de despliegue en producción. Sin embargo, para un desarrollador que busque un modelo con capacidades de inferencia, este repositorio no ofrece ningún artefacto utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

Datos de la contabilidad de carbono (según la model card):

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | NVIDIA L40S (7 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | europe-north1 |
| Horas de GPU | 471,1 h |
| PUE | 1,12 |
| Energia total | 1292,6984 kWh |
| Emisiones de CO₂ | 155,124 kg CO₂eq |
| Herramienta de medicion | Codecarbon |

## Arquitectura y entrenamiento

No hay información sobre arquitectura del modelo, ya que el repositorio no incluye pesos, configuración ni código. Los únicos datos disponibles se refieren al entorno de cómputo: 7 GPUs NVIDIA L40S, un modo de entrenamiento declarado como pre-training y una ubicación en europe-north1. El dato de emisiones se calculó con Codecarbon, una herramienta de seguimiento de huella de carbono para cómputo en la nube.

## Capacidades

- Ninguna capacidad de inferencia, generación o procesamiento de datos.
- El repositorio es una tarjeta de documentación de emisiones de carbono, no un modelo ejecutable.
- No soporta tool calling, agentes, visión, audio ni ningún otro tipo de tarea de IA.
- No se incluyen pesos, tokenizador ni configuración de inferencia.

## Casos de uso

- Auditoría interna de sostenibilidad: el repositorio sirve como registro de emisiones de un entrenamiento concreto, útil para que un equipo pueda reportar el impacto ambiental de sus cargas de trabajo a la dirección o a organismos reguladores.
- Transparencia en publicaciones científicas: al publicar una tarjeta de carbono junto al paper o al modelo final, se facilita la reproducción del cómputo y la comparación de eficiencia energética entre propuestas.
- Comparación de hardware y regiones: el mismo formato de tarjeta permite comparar emisiones entre distintas configuraciones (por ejemplo, L40S en europe-north1 frente a H100 en us-east1), como se observa en otros repositorios similares de la misma tarea.
- Integración en pipelines de MLOps: la métrica de emisiones puede extraerse y registrarse en un dashboard de sostenibilidad, alimentando decisiones sobre qué region o hardware elegir para futuros entrenamientos.
- Formación en Green AI: en un contexto académico, esta tarjeta sirve como ejemplo práctico de cómo documentar la huella de carbono de un experimento, algo que se enseña en cursos de IA responsable.
- Calibración de presupuestos de carbono: el dato de 155,124 kg CO₂eq permite a un equipo estimar el coste ambiental de replicar un entrenamiento similar y planificar presupuestos de emisiones anuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene ningún modelo evaluable ni métricas de rendimiento.

## Requisitos de hardware

- No aplicable para inferencia, ya que no se distribuyen pesos.
- El hardware documentado para el entrenamiento fue de 7 GPUs NVIDIA L40S, con 471,1 horas de cómputo y un PUE de 1,12 en la región europe-north1.
- Para reproducir el entrenamiento que se documentó, se necesitaría un clúster equivalente (7 L40S) o superior, aunque no se especifica el framework ni la configuración exacta.
- No se indica soporte para vLLM, llama.cpp, Ollama u otras herramientas de despliegue.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no tiene sentido compararlo con alternativas de la misma categoría. En el contexto de tarjetas de carbono de la misma tarea académica, se observan otros repositorios similares (por ejemplo, `24f2005112/tds-carbon-card` y `Bhagwat8978/tds-carbon-card`) que documentan entrenamientos con configuraciones distintas (H100, fine-tuning, región us-east1), pero no son modelos comparables en términos de capacidades.

| Repositorio | Hardware | Modo | Region | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| harshsuthar2005/tds-carbon-card | L40S (7) | pre-training | europe-north1 | 471,1 | 1292,6984 | 155,124 |
| Bhagwat8978/tds-carbon-card | H100 (3) | fine-tuning | us-east1 | 459,5 | 1399,1775 | 587,655 |

## Limitaciones y advertencias

- No contiene un modelo utilizable: no hay pesos, tokenizador ni configuración de inferencia.
- Los datos de emisiones dependen de la herramienta Codecarbon y del valor de PUE declarado, que pueden variar según la fuente de energía de la región y el método de cálculo.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial de los datos contenidos en la tarjeta.
- La fecha de creación (2026-08-22) y la ausencia de descargas y likes indican que es un repositorio de práctica académica, no un recurso de producción.
- No se proporciona información sobre el modelo entrenado, el dataset, los hiperparámetros ni la calidad del resultado, por lo que no es posible evaluar la validez del entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/harshsuthar2005/tds-carbon-card
- Otros ejemplos de la misma tarea: https://huggingface.co/24f2005112/tds-carbon-card
- Otros ejemplos de la misma tarea: https://huggingface.co/Bhagwat8978/tds-carbon-card
- Directorio de sostenibilidad de modelos (carbontxt): https://carbontxt.org/ai-model-cards
- Model cards de Google DeepMind (referencia de formato): https://deepmind.google/models/model-cards/
- Paper relacionado (arXiv 2508.16672): https://arxiv.org/pdf/2508.16672
