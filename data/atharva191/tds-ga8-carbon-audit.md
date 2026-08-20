# Atharva191/tds-ga8-carbon-audit

## Resumen

El artefacto `Atharva191/tds-ga8-carbon-audit` no es un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento de IA. Publicado por el usuario Atharva191, documenta las emisiones de CO₂ equivalente generadas durante un proceso de pre-entrenamiento realizado con dos GPUs NVIDIA RTX 4090 en la región europe-west4. Incluye métricas detalladas de consumo energético, factor de intensidad de red y emisiones totales, calculadas mediante la herramienta CodeCarbon.

Este tipo de artefactos es relevante en el contexto de la IA sostenible (Green AI), ya que permite auditar y comparar el impacto ambiental de distintos entrenamientos. Sin embargo, carece de cualquier componente de modelo entrenado: no hay pesos, arquitectura ni capacidades de inferencia. Su utilidad se limita a servir como referencia metodológica o ejemplo de reporte de emisiones.

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

Datos adicionales extraidos de la model card (no corresponden a un modelo, sino al entrenamiento auditado):

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 2x NVIDIA RTX 4090 (450 W TDP) |
| GPU horas | 448.1 |
| PUE | 1.26 |
| Region | europe-west4 (200 gCO2eq/kWh) |
| Energia consumida | 508.1454 kWh |
| Emisiones totales | 101.629 kg CO2eq |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo que fue entrenado, ni sobre el dataset, el numero de tokens o las tecnicas de optimizacion empleadas. La model card se limita a reportar el impacto ambiental del proceso de entrenamiento, indicando que se utilizaron dos GPUs NVIDIA RTX 4090 durante 448.1 horas, con un PUE de 1.26 y una intensidad de red de 200 gCO2eq/kWh en la region europe-west4. El calculo de emisiones se realizo con CodeCarbon, una herramienta estandar para medir el CO2 generado por cargas de trabajo de computacion.

## Capacidades

- No posee capacidades de generacion de texto, razonamiento, codigo, vision ni ninguna otra funcionalidad propia de un modelo de IA.
- Su unica funcion es documentar las emisiones de carbono de un entrenamiento concreto, sirviendo como registro de auditoria.
- Puede utilizarse como ejemplo de buenas practicas en la publicacion de metricas de sostenibilidad para modelos de IA.

## Casos de uso

- Auditoria interna de emisiones: una organizacion puede usar este artefacto como plantilla para reportar el impacto ambiental de sus propios entrenamientos, siguiendo la misma estructura de datos (hardware, horas, PUE, region, energia y CO2).
- Comparativa de eficiencia energetica: investigadores pueden contrastar las emisiones de este entrenamiento (101.629 kg CO2eq) con las de otros modelos para evaluar la eficiencia de diferentes configuraciones de hardware.
- Educacion en Green AI: en cursos o talleres sobre IA sostenible, este registro sirve como ejemplo concreto de como medir y comunicar la huella de carbono de un proceso de entrenamiento.
- Referencia metodologica: desarrolladores que quieran integrar CodeCarbon en sus pipelines pueden consultar este artefacto para entender el formato de salida y los campos necesarios.
- Documentacion de proyectos: al publicar un modelo, se puede anadir un enlace a este tipo de auditoria para cumplir con requisitos de transparencia ambiental.
- Estimacion de costes ambientales: antes de lanzar un entrenamiento a gran escala, se puede extrapolar a partir de estos datos el consumo esperado y las emisiones asociadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no contiene un modelo evaluable, por lo que no existen metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) que reportar.

## Requisitos de hardware

- El entrenamiento documentado utilizo 2 GPUs NVIDIA RTX 4090 (450 W TDP cada una) durante 448.1 horas.
- No se especifican requisitos de hardware para inferencia, ya que no hay modelo que ejecutar.
- Para reproducir el entrenamiento original se necesitarian al menos dos GPUs RTX 4090 o equivalentes, con una fuente de alimentacion adecuada y refrigeracion suficiente.
- El consumo energetico total fue de 508.1454 kWh, lo que da una idea de la demanda electrica del proceso.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no es posible compararlo con alternativas de la misma categoria (modelos de lenguaje, vision, etc.).

## Limitaciones y advertencias

- No es un modelo de IA: no puede realizar tareas de generacion, clasificacion, traduccion ni ninguna otra funcion predictiva.
- La informacion disponible se limita a la model card; no hay pesos, codigo ni documentacion adicional.
- La licencia no esta especificada, por lo que se desconoce si el artefacto puede reutilizarse libremente.
- Los datos de emisiones corresponden a un entrenamiento especifico y no son generalizables a otros contextos sin ajustar variables como hardware, region o PUE.
- No se indica el tipo de modelo entrenado, por lo que la relevancia de estas metricas para otros casos es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/Atharva191/tds-ga8-carbon-audit
