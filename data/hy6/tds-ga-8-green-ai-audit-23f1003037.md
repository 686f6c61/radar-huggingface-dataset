# hy6/tds-ga-8-green-ai-audit-23f1003037

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial desplegable, sino un artefacto de metadatos destinado a la auditoría ambiental de un proceso de entrenamiento. Concretamente, se trata de un registro de emisiones de carbono asociado a una ejecución de fine-tuning, documentado bajo la iniciativa de "Green AI Training Audit". El autor, `hy6`, ha publicado únicamente la model card con los datos de huella de carbono, sin incluir pesos, arquitectura, pipeline de inferencia ni licencia de uso.

El registro indica que la ejecución de fine-tuning emitió un total de 568.127 kg de CO2 equivalente, medida calculada mediante la herramienta CodeCarbon. El entrenamiento se llevó a cabo en la región `us-central1` de Google Cloud, utilizando una GPU NVIDIA H100. La fecha de creación del repositorio es el 18 de agosto de 2026, y no se ha actualizado desde entonces.

La relevancia de este artefacto reside en su utilidad para la contabilidad ambiental en el desarrollo de IA. Para desarrolladores e investigadores que buscan evaluar el impacto ecológico de sus propios flujos de trabajo, este tipo de metadatos sirve como referencia metodológica y punto de partida para estandarizar la medición de emisiones en entornos de entrenamiento distribuido.

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
| Formato de pesos | no disponible |
| Emisiones registradas (CO2eq) | 568.127 kg |
| Hardware de entrenamiento | NVIDIA H100 |
| Ubicacion del entrenamiento | us-central1 (Google Cloud) |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de modelo (transformer, MoE, SSM, etc.) en la información proporcionada. El repositorio no contiene pesos ni código de inferencia. El único dato relativo al entrenamiento es que se realizó un proceso de fine-tuning, cuyo hardware fue una GPU NVIDIA H100. La herramienta CodeCarbon fue utilizada para monitorizar las emisiones, lo que sugiere que el proceso se ejecutó en un entorno cloud con seguimiento activo del consumo energético, pero no se detalla la composición del dataset, el número de tokens procesados ni las técnicas de optimización empleadas.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, visión o audio.
- No se indica soporte para tool calling, function calling ni razonamiento multi-paso.
- No se especifican capacidades multilingües.
- El artefacto únicamente proporciona metadatos de auditoría ambiental (emisiones de CO2, hardware y ubicación).

## Casos de uso

- Auditoría interna de emisiones: el artefacto permite a un equipo de ML registrar formalmente la huella de carbono de una ejecución de fine-tuning, sirviendo como evidencia para políticas internas de sostenibilidad.
- Comparativa de eficiencia hardware: los datos de emisiones (568.127 kg CO2eq en H100) pueden contrastarse con ejecuciones equivalentes en otras GPUs (A100, L4) para decidir qué infraestructura es más eficiente energéticamente.
- Reporte ESG corporativo: los metadatos de CodeCarbon pueden integrarse en informes anuales de sostenibilidad para cuantificar el impacto ambiental de los proyectos de IA de la empresa.
- Optimización de flujos de entrenamiento: al conocer el coste de carbono de una ejecución, los investigadores pueden experimentar con técnicas como fine-tuning eficiente en parámetros (LoRA, QLoRA) y comparar las emisiones resultantes con esta referencia.
- Trazabilidad en MLOps: el registro sirve como anotación en el ciclo de vida del modelo, permitiendo a los equipos de plataforma auditar qué experimentos se ejecutaron, con qué hardware y a qué coste ambiental.
- Educación y concienciación: sirve como ejemplo práctico de cómo estructurar un "Green AI Audit" para estudiantes o grupos de investigación que deseen implementar mediciones de carbono en sus propios proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un registro de auditoría ambiental y no de un modelo de inferencia, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se especifican requisitos de VRAM para inferencia, ya que el repositorio no contiene un modelo desplegable.
- El hardware de entrenamiento documentado es una GPU NVIDIA H100, ubicada en la región `us-central1` de Google Cloud.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) ni datos de latencia o throughput.
- Para reproducir la auditoría, se requeriría acceso a una infraestructura similar (H100) y la integración de CodeCarbon en el pipeline de entrenamiento.

## Comparativa con modelos similares

No disponible. Este artefacto no es un modelo de IA comparable con otras alternativas de la misma categoría (mismo tamaño o misma tarea), ya que carece de pesos, arquitectura y capacidades de inferencia. Su función es exclusivamente la de registrar metadatos de emisiones.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni pipeline de inferencia. Intentar cargarlo como un modelo estándar de Hugging Face fallará.
- Sin licencia de uso: al no especificarse licencia, no se puede determinar si los metadatos pueden reutilizarse comercialmente, aunque al ser datos factuales de una ejecución, su uso con fines de análisis es probablemente aceptable.
- Sin contexto del modelo original: se desconoce qué modelo base se fine-tuneó, qué dataset se utilizó o qué tarea se abordaba, lo que limita la interpretación del dato de emisiones.
- Riesgo de interpretación errónea: las emisiones de 568.127 kg CO2eq corresponden a una única ejecución y no son generalizables a otros entrenamientos sin conocer la duración exacta, el número de pasos y el consumo energético de la infraestructura.
- Sin actualizaciones: el repositorio no se ha modificado desde su creación, por lo que no hay información adicional más allá de la model card original.

## Enlaces

- Repositorio en Hugging Face: [https://huggingface.co/hy6/tds-ga-8-green-ai-audit-23f1003037](https://huggingface.co/hy6/tds-ga-8-green-ai-audit-23f1003037)
