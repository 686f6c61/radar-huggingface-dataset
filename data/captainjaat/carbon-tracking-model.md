# CaptainJaat/carbon-tracking-model

## Resumen

El modelo `CaptainJaat/carbon-tracking-model` no es un modelo de inteligencia artificial convencional, sino un registro documental de las emisiones de carbono asociadas a un entrenamiento de aprendizaje automático. Publicado por el usuario CaptainJaat en HuggingFace, su propósito es aportar transparencia sobre el impacto ambiental de un proceso de entrenamiento concreto, siguiendo prácticas emergentes de sostenibilidad en IA. La model card incluye métricas detalladas de consumo energético y emisiones, calculadas con la herramienta CodeCarbon, y especifica el hardware utilizado (6 GPUs NVIDIA H100) y la región de cómputo (europe-north1). Este tipo de artefactos es relevante en un contexto donde la comunidad investigadora y empresarial demanda mayor responsabilidad ecológica en el desarrollo de modelos, y sirve como ejemplo de buenas prácticas para la documentación de huella de carbono. No se proporcionan especificaciones de arquitectura, parámetros ni capacidades de procesamiento, ya que no se trata de un modelo ejecutable.

## Especificaciones técnicas

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

Datos adicionales documentados en la model card (no son especificaciones del modelo, sino del entrenamiento):

| Parametro | Valor |
|---|---|
| Emisiones de CO2eq | 35.925 kg |
| Hardware de entrenamiento | 6x NVIDIA H100 |
| Duracion del entrenamiento | 54 GPU-horas |
| Region de computo | europe-north1 (120 gCO2eq/kWh) |
| PUE (Power Usage Effectiveness) | 1.32 |
| Energia total consumida | 299.376 kWh |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo, ya que este artefacto no contiene pesos ni configuración de red neuronal. La model card documenta un entrenamiento hipotético o real del que se reportan las emisiones, pero no se detalla qué tipo de modelo se entrenó (tamaño, arquitectura, dataset, etc.). El entrenamiento se realizó en la región europe-north1 de Google Cloud, con un factor de emisión de 120 gCO2eq/kWh y un PUE de 1.32, lo que resulta en un total de 299.376 kWh y 35.925 kg de CO2 equivalente. No se mencionan técnicas de optimización, datos de entrenamiento ni procesos de alineación como RLHF o DPO.

## Capacidades

- No aplica: este modelo no es un sistema de IA generativa ni de procesamiento de datos. No posee capacidades de generación de texto, razonamiento, codificación, visión, tool calling, ni soporte para agentes.
- Su única función es servir como registro de emisiones de carbono de un entrenamiento específico, útil para auditorías ambientales y reportes de sostenibilidad.

## Casos de uso

- Auditoría ambiental de proyectos de IA: el registro permite a organizaciones verificar la huella de carbono de sus entrenamientos y comparar con estándares internos o regulatorios.
- Transparencia en publicaciones científicas: investigadores pueden adjuntar este tipo de modelos a sus papers para documentar el impacto ecológico de sus experimentos, facilitando la reproducibilidad y la rendición de cuentas.
- Comparación de eficiencia energética: al conocer el hardware, la duración y la región, se puede estimar el coste ambiental de diferentes configuraciones de entrenamiento y optimizar futuros despliegues.
- Cumplimiento normativo: en jurisdicciones con requisitos de reporte de emisiones, este modelo sirve como evidencia del consumo energético asociado a cómputo de IA.
- Educación y concienciación: sirve como ejemplo didáctico para estudiantes y profesionales sobre cómo medir y comunicar el impacto ambiental de la IA.
- Integración en pipelines de MLOps: los datos de emisiones pueden incorporarse a sistemas de seguimiento de experimentos (como MLflow o Weights & Biases) para automatizar la recopilación de métricas de sostenibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este modelo no es un sistema de IA y, por tanto, no tiene métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica: al no ser un modelo ejecutable, no requiere VRAM, GPU ni infraestructura de inferencia.
- El entrenamiento documentado utilizó 6 GPUs NVIDIA H100 durante 54 GPU-horas, pero esto es información del proceso original, no un requisito para usar este artefacto.
- Para consultar el registro, basta con un navegador web o la API de HuggingFace.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que este artefacto no pertenece a una categoría de modelos de IA con métricas estándar. Existen herramientas como eco2AI o CodeCarbon que generan este tipo de registros, pero no son modelos alojados en HuggingFace con la misma estructura.

## Limitaciones y advertencias

- No es un modelo de IA: no puede ser utilizado para inferencia, generación de texto, clasificación ni ninguna tarea de procesamiento de lenguaje natural.
- Los datos de emisiones son específicos del entrenamiento documentado y no son generalizables a otros contextos; dependen del hardware, la región y la duración.
- La licencia no está especificada, por lo que se desconoce si el registro puede ser reutilizado o modificado libremente.
- No se indica el tipo de modelo entrenado, lo que limita la utilidad del registro para comparaciones entre arquitecturas.
- La fecha de creación (2026-08-28) es posterior a la fecha actual, lo que sugiere que el artefacto podría ser un ejemplo de simulación o un error de metadatos; se recomienda verificar su autenticidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CaptainJaat/carbon-tracking-model
- Paper de eco2AI (herramienta de seguimiento de emisiones): https://arxiv.org/abs/2208.00406
- Artículo en Springer sobre eco2AI: https://link.springer.com/article/10.1134/S1064562422060230
- Proyecto CAPTAIN (conservación con IA, no relacionado directamente): https://www.captain-project.net/
- Plataforma Tracking AI (análisis de sesgos políticos en IA, no relacionado): https://trackingai.org/models
