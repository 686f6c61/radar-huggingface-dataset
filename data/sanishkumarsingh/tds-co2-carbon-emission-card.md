# SanishKumarSingh/tds-co2-carbon-emission-card

## Resumen

El repositorio `SanishKumarSingh/tds-co2-carbon-emission-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella energética y las emisiones de CO₂ asociadas a un proceso de pre-entrenamiento de un modelo no especificado. El autor, SanishKumarSingh, lo ha publicado en Hugging Face como parte de un ejercicio académico (TDS GA8) para visibilizar el coste ambiental del entrenamiento de modelos. El documento reporta 313,3 horas de uso de una GPU NVIDIA L40S en la región europe-west4, con un consumo energético total de 128,3 kWh y unas emisiones de 25,66 kg de CO₂ equivalente.

La relevancia de esta tarjeta radica en que ejemplifica una práctica creciente en la comunidad de IA: la transparencia sobre el impacto medioambiental del desarrollo de modelos. No obstante, al carecer de arquitectura, pesos o funcionalidad, no es un modelo ejecutable ni ofrece capacidades de inferencia. Su contenido es exclusivamente informativo y de auditoría.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos) |
| Tipo de entrenamiento | pre-training |
| GPU utilizada | NVIDIA L40S (1 unidad) |
| Region | europe-west4 |
| Horas de GPU | 313,3 |
| PUE (Power Usage Effectiveness) | 1,17 |
| Energia total | 128,2963 kWh |
| Emisiones de CO₂ | 25,659 kg CO₂eq |

## Arquitectura y entrenamiento

El documento no describe la arquitectura del modelo entrenado (no se indica si es transformer, MoE, SSM, etc.), ni los datos de entrenamiento, ni el número de parámetros. La única información técnica se refiere al entorno de cómputo: se utilizó una GPU NVIDIA L40S en la región europe-west4, durante 313,3 horas, con un factor de efectividad energética (PUE) de 1,17. La energía total consumida fue de 128,296 kWh, lo que resultó en 25,659 kg de CO₂ equivalente, calculado mediante la herramienta CodeCarbon. No se menciona ningún tipo de ajuste posterior (RLHF, DPO, etc.).

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de generación, razonamiento, visión u otras funciones de IA.
- La única "capacidad" es documentar el consumo energético y las emisiones de un entrenamiento, lo que puede servir como referencia para auditorías de sostenibilidad.
- No hay soporte de tool calling, agentes, ni multilingüismo, ya que no existe un modelo subyacente.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: la tarjeta permite registrar y comunicar el impacto ambiental de un entrenamiento, útil para reportes de responsabilidad corporativa.
- Comparación de eficiencia entre configuraciones de entrenamiento: al conocer el consumo energético y las emisiones, los equipos pueden evaluar alternativas de hardware o regiones más limpias.
- Cumplimiento de normativas ambientales: en contextos donde se exige reportar la huella de carbono de procesos computacionales, esta tarjeta sirve como evidencia.
- Investigación académica sobre Green AI: proporciona un caso concreto de medición de emisiones con CodeCarbon, útil para estudios de eficiencia energética en el aprendizaje automático.
- Optimización de recursos en la nube: los datos de PUE y energía ayudan a decidir entre regiones o proveedores con menor impacto ambiental.
- Transparencia pública en modelos open source: integrar estas tarjetas en los repositorios de modelos permite a los usuarios conocer el coste ambiental de la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) porque no hay un modelo que evaluar.

## Requisitos de hardware

- El entrenamiento se realizó con una GPU NVIDIA L40S (1 unidad), en la región europe-west4.
- No se especifican requisitos de VRAM para la inferencia porque no hay modelo desplegable.
- Para el uso del repositorio (solo lectura de la tarjeta) no se requiere GPU; basta con un navegador o acceso a Hugging Face.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) ya que no existe un modelo servible.

## Comparativa con modelos similares

Existen otras tarjetas de contabilidad de carbono en Hugging Face con el mismo propósito. La siguiente tabla compara los datos reportados por tres de ellas:

| Tarjeta | GPU | Horas | Energía (kWh) | CO₂ (kg) | Región |
|---|---|---|---|---|---|
| SanishKumarSingh/tds-co2-carbon-emission-card | NVIDIA L40S (1) | 313,3 | 128,296 | 25,659 | europe-west4 |
| Sakshi22f3002973/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |
| WiseDev/tds-carbon-card | NVIDIA T4 (5) | 223 | 120,197 | 42,069 | us-central1 |

Nota: la tarjeta de Sakshi22f3002973 no proporciona detalles en la información recopilada. La comparativa muestra que la tarjeta de SanishKumarSingh registra menor emisión de CO₂ que la de WiseDev, pero con una GPU más potente (L40S frente a T4) y más horas de cómputo.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA funcional; es un registro de emisiones y no puede utilizarse para inferencia.
- Los datos de emisiones se basan en estimaciones de Codecarbon y dependen de la exactitud de los factores de emisión de la región europe-west4; no son medidos directamente.
- La tarjeta no incluye información sobre el modelo entrenado (arquitectura, parámetros, dataset), por lo que no es posible evaluar su rendimiento ni su idoneidad para ninguna tarea.
- La licencia MIT permite el uso comercial del documento, pero no implica que el contenido sea verificable o que los datos sean representativos de otros entrenamientos.
- La fecha de creación (2026-08-23) es inusualmente futura; puede ser un error o un dato ficticio del autor.
- No hay garantía de reproducibilidad, ya que no se especifican el software ni los hiperparámetros utilizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SanishKumarSingh/tds-co2-carbon-emission-card
- Tarjeta similar de Sakshi22f3002973: https://huggingface.co/Sakshi22f3002973/tds-carbon-card
- Tarjeta similar de WiseDev: https://huggingface.co/WiseDev/tds-carbon-card
