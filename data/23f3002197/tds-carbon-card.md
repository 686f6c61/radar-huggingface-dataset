# 23f3002197/tds-carbon-card

## Resumen

El repositorio `23f3002197/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (_carbon card_) asociada a un proceso de entrenamiento realizado en el marco del curso TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante un entrenamiento de pre-entrenamiento (_pre-training_) ejecutado en hardware NVIDIA A100, con el objetivo de fomentar prácticas de IA sostenible y transparencia en el impacto ambiental.

La información publicada incluye datos de consumo energético (822,024 kWh), emisiones totales (345,25 kg CO₂eq) y detalles del entorno de cómputo (6 GPUs A100, región us-east1, 233 horas de GPU). No se proporciona ninguna especificación técnica del modelo entrenado: ni arquitectura, ni número de parámetros, ni tareas, ni pesos. Por tanto, esta ficha se limita a describir el contenido real del repositorio y a señalar la ausencia de información de modelo.

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

Datos adicionales documentados en la tarjeta de carbono (no corresponden a parámetros del modelo):

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 6x NVIDIA A100 |
| Modo de entrenamiento | pre-training |
| Region | us-east1 |
| Horas de GPU | 233 h (PUE: 1,47) |
| Energia total consumida | 822,024 kWh |
| Emisiones de CO₂eq | 345,25 kg |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (si existe) ni sobre los datos de entrenamiento, el número de tokens procesados o las técnicas de alineación empleadas. La única información de entrenamiento disponible es la relativa al consumo de recursos: se utilizaron 6 GPUs NVIDIA A100 durante 233 horas en la región us-east1, con un factor de eficiencia energética (PUE) de 1,47. La energía total consumida fue de 822,024 kWh y las emisiones asociadas se estimaron en 345,25 kg de CO₂ equivalente mediante la herramienta CodeCarbon.

## Capacidades

No aplicable. Este repositorio no documenta capacidades de ningún modelo de IA. No hay información sobre generación de texto, razonamiento, código, visión, tool calling, agentes, ni capacidades multilingües. Se trata exclusivamente de un registro de contabilidad ambiental.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para documentar el impacto ambiental de un entrenamiento, siguiendo prácticas de "Green AI" que permiten a organizaciones reportar emisiones de forma estandarizada.
- Investigación en eficiencia energética: los datos de consumo (kWh, horas de GPU, PUE) pueden utilizarse para comparar la huella de carbono de diferentes configuraciones de hardware o estrategias de entrenamiento.
- Cumplimiento de políticas de transparencia: instituciones académicas o empresas que exigen informes de emisiones para proyectos de IA pueden usar este formato como referencia.
- Educación sobre IA responsable: en cursos como TDS GA8, este tipo de tarjetas sirve para concienciar sobre el coste ambiental del entrenamiento de modelos y fomentar decisiones de diseño más eficientes.
- Optimización de infraestructura: los datos de energía y emisiones permiten identificar ineficiencias en el uso de GPUs y ajustar la asignación de recursos.
- Comparativa entre regiones: al existir repositorios similares con distintas regiones (p. ej., europe-west4), se puede analizar cómo varía el factor de emisiones según la ubicación del centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ninguna evaluación de rendimiento del modelo, ya que no se proporcionan datos sobre tareas, métricas ni comparativas con otros sistemas.

## Requisitos de hardware

- El entrenamiento documentado utilizó 6 GPUs NVIDIA A100.
- No se especifican requisitos de VRAM para inferencia, ni recomendaciones de GPU para despliegue.
- No se indica si el modelo (inexistente en el repositorio) podría ejecutarse en hardware de consumo.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Al no existir un modelo de IA, no es posible comparar con alternativas de la misma categoría. Los únicos repositorios comparables son otras tarjetas de carbono del mismo curso (p. ej., `23f3001222/tds-carbon-card`), que documentan entrenamientos con distinto hardware y región, pero no contienen modelos.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA: no hay pesos, arquitectura, ni código de inferencia. Cualquier uso como modelo es inviable.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones lingüísticas porque no existe un sistema que las presente.
- La licencia no está especificada, por lo que no se puede determinar si el contenido (la tarjeta de carbono) puede reutilizarse comercialmente.
- Los datos de emisiones dependen de la metodología de CodeCarbon y del factor de emisión de la región us-east1; pueden no ser directamente comparables con otras mediciones si se usan herramientas o factores distintos.
- La fecha de creación (2026-08-19) es futura respecto a la fecha actual, lo que sugiere que podría tratarse de un repositorio de prueba o con datos simulados.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/23f3002197/tds-carbon-card)
- [Dashboard MMC de TDS](https://mmc.tds.ai/) (portal del curso, sin relación directa con el contenido del repositorio)
