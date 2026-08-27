# Sharmitha27/green-ai-training-audit

## Resumen

Este repositorio no contiene un modelo de IA en el sentido convencional, sino una auditoría de entrenamiento de IA ecológica (Green AI). Fue creado por el usuario Sharmitha27 y documenta el impacto ambiental de una ejecución de entrenamiento previo (pre-training) realizada en hardware NVIDIA T4, con un total de 16,647 kg de CO₂ equivalente emitidos. La información se presenta en formato de model card, siguiendo la práctica de transparencia ambiental promovida por iniciativas como CodeCarbon.

El proyecto responde a la creciente necesidad de medir y reportar la huella de carbono de los entrenamientos de modelos de IA, un aspecto crítico para la sostenibilidad del sector. No se proporciona ningún artefacto de modelo (pesos, arquitectura, tokenizador), por lo que su utilidad práctica se limita al registro y auditoría de emisiones. La relevancia actual radica en que cada vez más organizaciones exigen este tipo de métricas para cumplir con objetivos de neutralidad climática.

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
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente, ya que este repositorio no contiene un modelo entrenado, sino únicamente los metadatos de su entrenamiento. Los datos reportados indican que el entrenamiento se realizó con 3 GPUs NVIDIA T4 durante 426,2 horas, con un consumo energético total de 138,7281 kWh y unas emisiones de 16,647 kg de CO₂ equivalente. La ubicación geográfica del centro de datos fue europe-north1 y se utilizó un PUE (Power Usage Effectiveness) de 1,55. La herramienta de medición empleada fue CodeCarbon, y el tipo de entrenamiento se clasifica como pre-training.

## Capacidades

- No se documentan capacidades funcionales del modelo (generación de texto, razonamiento, código, etc.), ya que no se proporciona ningún artefacto de modelo.
- La única capacidad demostrada es la de registrar y reportar métricas de emisiones de carbono asociadas a un entrenamiento.
- No hay soporte para tool calling, agentes, visión, audio ni otras funcionalidades típicas de modelos de IA.

## Casos de uso

- Auditoría interna de sostenibilidad: una organización puede utilizar este tipo de registro para verificar que sus entrenamientos cumplen con políticas de reducción de emisiones, comparando los valores reportados con objetivos internos.
- Reporte regulatorio: empresas sujetas a normativas de divulgación de huella de carbono pueden emplear estos datos como evidencia en sus informes anuales de sostenibilidad.
- Investigación académica: estudios sobre el impacto ambiental de la IA pueden citar estos valores como ejemplo de un entrenamiento típico en hardware de gama media (T4) en una región concreta.
- Optimización de infraestructura: los responsables de cómputo pueden analizar la relación entre horas de GPU, consumo energético y emisiones para decidir si conviene migrar a hardware más eficiente o a regiones con energía más limpia.
- Formación y concienciación: este tipo de model cards se utiliza en cursos de Green AI para ilustrar cómo se documenta el impacto ambiental de un entrenamiento real.
- Comparativa entre proveedores cloud: los datos de PUE y emisiones permiten comparar la eficiencia de diferentes centros de datos y elegir el más sostenible para futuros entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) porque no se trata de un modelo funcional, sino de un registro de auditoría ambiental.

## Requisitos de hardware

- No se requieren recursos de hardware para utilizar este repositorio, ya que no contiene pesos ni código de inferencia.
- El entrenamiento auditado utilizó 3 GPUs NVIDIA T4, con un tiempo total de GPU de 426,2 horas.
- No se especifican requisitos de VRAM, GPU recomendadas para inferencia, ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay modelo que desplegar.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros modelos de lenguaje o visión. Existen otros repositorios similares en Hugging Face (por ejemplo, `mri2026tds/green-ai-carbon-audit` o `23f3002755/green-ai-audit-23f3002755`) que también documentan auditorías de carbono de entrenamientos, pero no se dispone de sus datos detallados para realizar una comparación cuantitativa.

## Limitaciones y advertencias

- No contiene ningún modelo funcional: no se puede utilizar para generar texto, clasificar datos ni realizar ninguna tarea de IA.
- Los datos de emisiones son específicos de la ejecución reportada y no son generalizables a otros entrenamientos, incluso con el mismo hardware, debido a variables como la región, el PUE y la carga de trabajo.
- La licencia no está especificada, por lo que no se puede determinar si el contenido puede reutilizarse comercialmente.
- No se indica el idioma de los metadatos, aunque la model card está escrita en inglés.
- La fecha de creación (agosto de 2026) es futura en relación a la fecha actual, lo que sugiere que los datos podrían ser simulados o corresponder a un ejercicio académico.
- No se proporciona información sobre el dataset utilizado ni sobre el tipo de modelo entrenado, lo que limita cualquier análisis de reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sharmitha27/green-ai-training-audit
- Repositorio similar de auditoría de carbono: https://huggingface.co/mri2026tds/green-ai-carbon-audit
- Repositorio similar de auditoría de carbono: https://huggingface.co/23f3002755/green-ai-audit-23f3002755
- Artículo relacionado sobre entrenamiento de modelos de IA ecológicos: https://ieeexplore.ieee.org/document/10897883
