# deepti-iitm/tds-carbon-card

## Resumen

El repositorio `deepti-iitm/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una *model card* de contabilidad de carbono (Green AI Carbon Accounting) asociada a un entrenamiento de modelo realizado en el marco del curso TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento en una GPU NVIDIA A100, con un total de 4,821 kg de CO₂eq y un consumo energético de 24,104 kWh. Este tipo de registros forma parte de una iniciativa creciente en la comunidad de IA para hacer transparente el impacto ambiental del entrenamiento de modelos.

La relevancia de esta ficha radica en que ejemplifica cómo se reportan las emisiones de carbono en proyectos de IA, un aspecto cada vez más demandado por organismos reguladores y empresas con compromisos de sostenibilidad. No obstante, al no tratarse de un modelo con pesos ni arquitectura, no puede utilizarse para inferencia ni para tareas de procesamiento del lenguaje natural. Su utilidad es exclusivamente documental y de auditoría ambiental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

Datos de emisiones registrados en la model card:

| Metrica | Valor |
|---|---|
| Hardware utilizado | NVIDIA A100 (1 GPU) |
| Modo de entrenamiento | pre-training |
| Region | europe-west4 |
| Horas de GPU | 52,4 h (PUE: 1,15) |
| Energia total | 24,104 kWh |
| Emisiones de CO₂ | 4,821 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No aplica. Este repositorio no describe una arquitectura de red neuronal ni un proceso de entrenamiento en el sentido técnico habitual. La información disponible se limita a la contabilidad de emisiones de un entrenamiento previo, indicando que se usó una GPU NVIDIA A100 durante 52,4 horas en la región europe-west4, con un factor de eficiencia energética (PUE) de 1,15. No se especifican datos del dataset, número de tokens, ni técnicas como RLHF o DPO.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, visión ni ninguna otra función de inferencia.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es multilingüe ni tiene capacidades especiales de ningún tipo.
- Su única función es servir como registro de emisiones de carbono para un entrenamiento concreto.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: permite a organizaciones verificar el impacto de carbono de sus procesos de entrenamiento y reportarlo en memorias de sostenibilidad.
- Cumplimiento normativo: sirve como evidencia para regulaciones que exigen transparencia en el consumo energético de sistemas de IA (por ejemplo, la futura Ley de IA de la UE en su apartado de huella ambiental).
- Investigación en Green AI: proporciona datos empíricos para estudios sobre eficiencia energética en entrenamiento de modelos, comparando regiones, hardware y configuraciones.
- Educación y formación: utilizado en cursos como TDS GA8 para enseñar a estudiantes a medir y documentar emisiones con herramientas como CodeCarbon.
- Benchmarking de infraestructura: permite comparar el coste ambiental de diferentes proveedores de nube o tipos de GPU a partir de los datos de emisiones registrados.
- Transparencia en publicaciones académicas: los autores pueden adjuntar este tipo de tarjetas a sus papers para declarar el impacto ambiental de sus experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El entrenamiento documentado utilizó una única GPU NVIDIA A100, pero no se especifican requisitos de memoria ni configuración adicional.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA, dado que este repositorio no es un modelo. Existen otros repositorios con el mismo propósito y estructura, aparentemente creados por estudiantes del mismo curso (TDS GA8), que documentan entrenamientos con diferentes configuraciones:

| Repositorio | GPU | Horas | Energia (kWh) | CO₂ (kg) | Region |
|---|---|---|---|---|---|
| deepti-iitm/tds-carbon-card | A100 (1) | 52,4 | 24,104 | 4,821 | europe-west4 |
| Tokyo0412/tds-carbon-card | A100 (4) | 191 | 339,216 | 118,726 | us-central1 |
| jayiitm/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |
| DAKSHiitm/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |

Estas variaciones reflejan diferencias en el hardware, la duración y la ubicación geográfica, lo que afecta directamente a las emisiones calculadas.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para ninguna tarea de procesamiento de lenguaje, visión u otro tipo de inferencia.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de los factores de emisión de la región; pueden no ser directamente comparables con otras mediciones.
- La licencia no está especificada, por lo que se desconoce si el contenido puede reutilizarse comercialmente.
- No se indica el modelo de IA al que corresponde este entrenamiento, lo que limita su utilidad para asociar la huella de carbono a un sistema concreto.
- La fecha de creación (2026) sugiere que el proyecto es reciente, pero no hay información adicional sobre su mantenimiento o validez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/deepti-iitm/tds-carbon-card
- Repositorio similar (jayiitm): https://huggingface.co/jayiitm/tds-carbon-card
- Repositorio similar (DAKSHiitm): https://huggingface.co/DAKSHiitm/tds-carbon-card
- Repositorio similar (23f3001819): https://huggingface.co/23f3001819/tds-carbon-card
- Repositorio similar (23f3000911): https://huggingface.co/23f3000911/tds-carbon-card
- Repositorio similar (Tokyo0412): https://huggingface.co/Tokyo0412/tds-carbon-card
