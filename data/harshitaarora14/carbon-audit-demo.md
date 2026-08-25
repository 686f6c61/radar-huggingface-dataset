# harshitaarora14/carbon-audit-demo

## Resumen

El repositorio `harshitaarora14/carbon-audit-demo` es una demostración técnica centrada en la contabilidad de emisiones de carbono asociadas al entrenamiento de modelos de IA, siguiendo las convenciones de Green AI y Hugging Face para la declaración de huella ambiental. El autor, Harshita Arora, publica esta demo para ilustrar cómo se computa el impacto en CO₂ equivalente de un proceso de fine-tuning, incluyendo el desglose de consumo energético, factor de potencia del centro de datos y emisiones resultantes.

No se trata de un modelo de lenguaje o de visión, sino de un artefacto de demostración para auditoría ambiental. La relevancia actual radica en la creciente demanda de transparencia sobre el coste ecológico del desarrollo de IA, y en la necesidad de herramientas que estandaricen la medición de emisiones. La model card documenta un entrenamiento realizado en 5 GPUs NVIDIA H100 durante 303,3 horas en la región europe-west4, con un total de 284,495 kg de CO₂ equivalente emitidos.

A pesar de su carácter demostrativo, el repositorio sirve como referencia metodológica y podría integrarse en flujos de trabajo de medición de huella de carbono para otros proyectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo subyacente, ya que el propósito del repositorio no es presentar un modelo de IA funcional, sino documentar el proceso de entrenamiento y su impacto ambiental. Según la model card, se realizó un fine-tuning sobre un modelo no especificado, empleando 5 GPUs NVIDIA H100 con un TDP de 700 W cada una. El tiempo total de cómputo fue de 303,3 horas GPU, con un PUE del centro de datos de 1,34. La región de entrenamiento fue europe-west4, con una intensidad de carbono de la red eléctrica de 200 gCO₂eq/kWh.

El cálculo de emisiones se realizó mediante la herramienta CodeCarbon, que estima el consumo energético en 1422,488 kWh y las emisiones en 284,495 kg CO₂eq. No se mencionan detalles sobre el dataset, el proceso de optimización, ni técnicas como RLHF o DPO.

## Capacidades

- No es un modelo de generación de texto, razonamiento, código, matemáticas, visión, audio ni otras capacidades típicas de modelos de IA.
- Su función es la de servir como ejemplo de auditoría ambiental de un proceso de entrenamiento.
- Proporciona una plantilla de cálculo de emisiones de CO₂eq basada en consumo de hardware y PUE del centro de datos.
- Permite reproducir la metodología de contabilidad de carbono de Hugging Face para otros proyectos.
- No incluye soporte para tool calling, agentes o razonamiento multi-paso.
- La capacidad multilingüe no es aplicable.

## Casos de uso

- Auditoría de impacto ambiental de entrenamientos de IA: se puede utilizar como referencia para calcular las emisiones de CO₂ de un fine-tuning, siguiendo el mismo procedimiento de CodeCarbon.
- Reporte de sostenibilidad en proyectos de IA: los equipos de desarrollo pueden usar este ejemplo para incluir la huella de carbono en sus informes de responsabilidad social corporativa.
- Formación en Green AI: sirve como material didáctico para explicar cómo se miden las emisiones del entrenamiento de modelos y qué factores influyen (hardware, PUE, región).
- Comparativa de eficiencia energética: permite estimar el impacto de diferentes configuraciones de hardware o de regiones con distinta intensidad de carbono.
- Validación de herramientas de medición: el cálculo detallado puede usarse para verificar que otras herramientas de estimación de emisiones dan resultados consistentes.
- Documentación de proyectos open source: cualquier modelo publicado en Hugging Face puede incluir una sección de emisiones similar para cumplir con las convenciones de transparencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no reporta métricas de calidad del modelo (como MMLU, HumanEval o GSM8K) porque no se centra en el rendimiento de un modelo de IA, sino en el coste ambiental de su entrenamiento.

## Requisitos de hardware

- El entrenamiento documentado se realizó con 5 GPUs NVIDIA H100 (TDP 700 W cada una), durante 303,3 horas.
- No se especifican requisitos de VRAM para inferencia, ya que no se ofrece un modelo ejecutable.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se dispone de datos de latencia o throughput, dado que no es un modelo de inferencia.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ya que el repositorio es una demo de auditoría ambiental y no un modelo de IA funcional.

## Limitaciones y advertencias

- No es un modelo de IA utilizable para tareas de procesamiento del lenguaje natural u otras aplicaciones.
- La licencia no está especificada, por lo que el uso comercial y la redistribución del contenido no están claramente definidos.
- Los datos de emisiones corresponden a un único entrenamiento y no pueden extrapolarse a otros modelos o configuraciones.
- La intensidad de carbono de la región (200 gCO₂eq/kWh) es un valor medio; el impacto real puede variar según la hora del día o la fuente de energía.
- El repositorio no incluye código fuente ni scripts ejecutables, solo documentación en la model card.
- No hay garantías de precisión en la metodología de cálculo más allá de lo indicado por CodeCarbon.

## Enlaces

- Hugging Face: https://huggingface.co/harshitaarora14/carbon-audit-demo
- Perfil del autor en Hugging Face: https://huggingface.co/harshitaarora14
- Repositorio de GitHub (versión alternativa): https://github.com/24f3003125/carbon-audit-demo
- Blog sobre auditoría de huella de carbono en IA: https://suhasbhairav.com/blog/technical-auditing-of-ai-model-carbon-and-resource-footprints
