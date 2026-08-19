# Amit2122005/green-ai-carbon-audit

## Resumen

El repositorio `Amit2122005/green-ai-carbon-audit` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de huella de carbono correspondiente a una ejecución de entrenamiento concreta. Documenta las emisiones de CO₂ equivalente generadas durante un proceso de preentrenamiento, utilizando la librería CodeCarbon para el cálculo. El autor, Amit2122005, ha publicado este artefacto como parte de la iniciativa Green AI, que busca cuantificar y mitigar el impacto ambiental del desarrollo de modelos.

La relevancia de este repositorio radica en su carácter ejemplar: muestra cómo se puede reportar de forma estandarizada el coste energético y las emisiones asociadas a un entrenamiento. No se trata de un modelo con parámetros, arquitectura o capacidades de inferencia, sino de un metadato de sostenibilidad. El registro indica un total de 70,37 kg de CO₂eq, calculado a partir de 356,7 horas de GPU en una NVIDIA V100, con una intensidad de carbono regional de 480 gCO₂eq/kWh en la ubicación `ap-southeast1`.

En el contexto actual de la IA responsable, este tipo de documentación es cada vez más demandada por organizaciones y equipos de investigación para cumplir con criterios de transparencia ambiental. Aunque el repositorio no ofrece ningún artefacto de modelo, su existencia contribuye a la estandarización de métricas de carbono en el ecosistema de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |
| Emisiones de CO₂eq | 70,37 kg |
| Hardware de entrenamiento | NVIDIA V100 (300 W TDP) |
| Tiempo de computo | 356,7 horas GPU (1 GPU) |
| Energia total consumida | 146,604 kWh |
| PUE del centro de datos | 1,37 |
| Intensidad de carbono regional | 480 gCO₂eq/kWh |
| Ubicacion geografica | ap-southeast1 |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

Este repositorio no describe ninguna arquitectura de red neuronal ni proceso de entrenamiento en el sentido convencional. Se trata de un registro de auditoría de carbono asociado a una ejecución de entrenamiento identificada como `carbon_run_log_24f2007687.json`. Los datos incluidos cubren el hardware utilizado (una NVIDIA V100), el tiempo de cómputo (356,7 horas GPU), la energía consumida (146,604 kWh) y las emisiones resultantes (70,37 kg CO₂eq), calculadas con CodeCarbon.

El cálculo de emisiones se basa en la intensidad de carbono de la red eléctrica de la región `ap-southeast1` (480 gCO₂eq/kWh) y el PUE del centro de datos (1,37). No se proporciona información sobre el tipo de modelo, el dataset, el número de parámetros ni el framework de entrenamiento. Por tanto, no es posible extraer ninguna conclusión sobre la arquitectura o las técnicas de optimización empleadas.

## Capacidades

- No aplicable: este repositorio no contiene un modelo de IA y no ofrece ninguna capacidad de generación, razonamiento, codificación o procesamiento de datos.
- Su única función es documentar la huella de carbono de un entrenamiento específico, sirviendo como referencia para prácticas de reporte ambiental en IA.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el registro puede utilizarse como plantilla para documentar las emisiones de entrenamientos propios, siguiendo el mismo formato y metodología de CodeCarbon.
- Cumplimiento de políticas de transparencia ambiental: organizaciones que necesiten reportar el impacto de sus modelos ante reguladores o clientes pueden usar este tipo de artefacto como evidencia.
- Investigación en Green AI: el dato de 70,37 kg CO₂eq para 356,7 horas de GPU V100 sirve como punto de referencia para estimar costes ambientales en estudios comparativos.
- Educación y divulgación: el repositorio es útil para enseñar cómo calcular la huella de carbono de un entrenamiento y qué factores intervienen (hardware, ubicación, PUE, intensidad de red).
- Integración en pipelines de MLOps: equipos que quieran automatizar el registro de emisiones pueden replicar este esquema de metadatos dentro de sus flujos de entrenamiento.
- Benchmarking de eficiencia energética: comparar diferentes configuraciones de hardware o regiones de nube en función de sus emisiones, usando este registro como caso de ejemplo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo evaluable y no presenta métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- No aplica como requisito de inferencia, ya que no hay modelo que ejecutar.
- El entrenamiento documentado utilizó una NVIDIA V100 (300 W TDP) durante 356,7 horas GPU.
- Para reproducir el cálculo de emisiones se requiere la librería CodeCarbon y acceso a los metadatos del entrenamiento (tiempo, hardware, ubicación).
- No se proporcionan opciones de despliegue ni latencias, al no existir un artefacto de inferencia.

## Comparativa con modelos similares

Existe un repositorio equivalente publicado por el usuario `Bhakti1206` con el mismo nombre (`green-ai-carbon-audit`). Ambos parecen seguir el mismo formato de model card y documentan entrenamientos distintos. Sin embargo, no se dispone de datos comparativos detallados (emisiones, hardware, duración) del repositorio de Bhakti1206, por lo que no es posible establecer una comparación cuantitativa. No se conocen otros modelos de la misma categoría en el ecosistema de Hugging Face.

## Limitaciones y advertencias

- Este repositorio no es un modelo de IA: no contiene pesos, arquitectura ni código ejecutable. Cualquier intento de utilizarlo como tal resultará en un error.
- La información de carbono es específica de una ejecución concreta y no es generalizable a otros entrenamientos. Depende del hardware, la ubicación y el tiempo de cómputo.
- La licencia no está especificada, por lo que el uso comercial del contenido (si lo hubiera) queda sujeto a las condiciones por defecto de Hugging Face (sin licencia explícita).
- No se indica el tipo de modelo entrenado, el dataset utilizado ni el propósito del entrenamiento, lo que limita la reproducibilidad y el contexto.
- Las emisiones calculadas con CodeCarbon son estimaciones; pueden variar según la precisión de los datos de intensidad de carbono y el PUE real del centro de datos.
- La fecha de creación (2026-08-19) sugiere que el registro es reciente, pero no hay evidencia de validación externa de los datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Amit2122005/green-ai-carbon-audit
- Repositorio similar de Bhakti1206: https://huggingface.co/Bhakti1206/green-ai-carbon-audit
- Documentación de Green AI Model: https://green-ai-model.github.io/docs/1_introduction/
- Artículo "Green AI: Exploring Carbon Footprints, Mitigation Strategies, and Trade Offs in Large Language Model Training" (arXiv): https://arxiv.org/abs/2404.01157
- GreenModel: AI Carbon Emission Tracker (GitHub): https://github.com/izzulroslan/GreenModel-AI-Carbon-Emission-Tracker
