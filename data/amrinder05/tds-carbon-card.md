# Amrinder05/tds-carbon-card

## Resumen

Este repositorio, identificado como `Amrinder05/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono y energía asociado a un entrenamiento de modelo realizado en el contexto del proyecto TDS GA8. El autor, Amrinder05, documenta las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento con hardware específico. La relevancia de este artefacto radica en la creciente demanda de transparencia ambiental en el desarrollo de IA, ofreciendo un ejemplo de cómo se puede cuantificar el impacto ecológico de un entrenamiento.

Según la model card, el entrenamiento se llevó a cabo con cuatro GPUs NVIDIA RTX 4090 en la región `asia-south1`, con un total de 95,4 horas de GPU y un consumo energético de 224,9532 kWh. Las emisiones reportadas son de 146,22 kg de CO₂ equivalente, calculadas mediante la herramienta CodeCarbon. No se proporcionan detalles sobre la arquitectura del modelo entrenado, su tamaño, ni su propósito final, ya que el repositorio se centra exclusivamente en la medición de la huella de carbono.

Dado que no se trata de un modelo de IA, las especificaciones técnicas habituales (parámetros, contexto, licencia, etc.) no están disponibles. Esta ficha se limita a documentar los datos de emisiones y aclarar que no es un artefacto utilizable para tareas de inferencia o generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂ equivalente | 146,22 kg (según CodeCarbon) |
| Hardware de entrenamiento | 4x NVIDIA RTX 4090 |
| Region de entrenamiento | asia-south1 |
| Horas de GPU | 95,4 h (PUE: 1,31) |
| Energia total consumida | 224,9532 kWh |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo que fue entrenado, ya que el repositorio no incluye pesos, configuración ni detalles técnicos del mismo. La model card únicamente especifica el modo de entrenamiento (`pre-training`) y el hardware utilizado: cuatro GPUs NVIDIA RTX 4090. El cálculo de emisiones se realizó con la herramienta CodeCarbon, que estima las emisiones de CO₂ equivalente a partir del consumo energético y la ubicación geográfica. El factor PUE (Power Usage Effectiveness) del centro de datos se indica como 1,31, lo que ajusta el consumo total de energía. No se mencionan técnicas de optimización, datasets ni procesos de alineación (RLHF, DPO, etc.).

## Capacidades

- No aplica: este repositorio no contiene un modelo de inteligencia artificial, por lo que no posee capacidades de generación de texto, razonamiento, codificación, visión u otras tareas propias de los modelos de IA.
- La única "capacidad" documentada es la de registrar y comunicar el impacto ambiental de un entrenamiento específico, sirviendo como referencia para prácticas de Green AI.

## Casos de uso

- No aplica como modelo de IA. Sin embargo, la información contenida puede utilizarse en los siguientes contextos:
  - Auditoría de sostenibilidad: las métricas de emisiones pueden incorporarse en informes de responsabilidad ambiental de proyectos de IA.
  - Comparación de eficiencia energética: los datos de consumo y emisiones permiten contrastar diferentes configuraciones de hardware o regiones de entrenamiento.
  - Investigación en Green AI: el repositorio sirve como ejemplo de cómo documentar la huella de carbono en publicaciones académicas o técnicas.
  - Planificación de infraestructura: los valores de energía y emisiones ayudan a estimar el impacto de futuros entrenamientos con hardware similar.
  - Cumplimiento normativo: en contextos donde se exija reportar el impacto ambiental de actividades computacionales, estos datos pueden ser útiles.
  - Educación y concienciación: el registro puede emplearse en materiales formativos sobre el coste ambiental del entrenamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo, ya que su propósito es exclusivamente el registro de emisiones.

## Requisitos de hardware

- No aplica: al no ser un modelo de inferencia, no se requieren recursos de hardware para su ejecución. El hardware mencionado (4x NVIDIA RTX 4090) corresponde al entrenamiento documentado, no a un despliegue posterior.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, etc.) ni estimaciones de latencia o throughput, dado que no existe un modelo servible.

## Comparativa con modelos similares

No disponible: este repositorio no es un modelo de IA, por lo que no puede compararse con alternativas de la misma categoría (modelos de lenguaje, visión, etc.). No existe una categoría equivalente para artefactos de contabilidad de carbono.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para tareas de generación, razonamiento, análisis de texto, código u otras funciones propias de los modelos entrenados.
- Los datos de emisiones corresponden únicamente al entrenamiento específico documentado (hardware, región, duración) y no son generalizables a otros escenarios.
- No se indica la licencia del repositorio, por lo que su uso y redistribución pueden estar sujetos a restricciones no especificadas.
- La ausencia de información sobre el modelo entrenado impide evaluar su calidad, sesgos o posibles riesgos asociados.
- Para producción, este artefacto no ofrece ninguna utilidad directa; su valor es meramente documental.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/Amrinder05/tds-carbon-card)
