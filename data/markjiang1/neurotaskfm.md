# markjiang1/NeuroTaskFM

## Resumen

NeuroTaskFM es un modelo de investigación orientado a la neuroimagen, diseñado para aprender relaciones específicas de cada paciente entre la actividad cerebral intrínseca, la función evocada por tareas, el comportamiento y el estado clínico longitudinal. El repositorio oficial (GitHub) lo describe como un codebase que combina un "teacher" de espacio crudo, un compilador de neuroimagen GPU determinista, un modelo clínico de espacio compilado y una firma de participante actualizable. A diferencia de los modelos de lenguaje convencionales, NeuroTaskFM no está pensado para generación de texto ni código, sino para modelar datos de neuroimagen (posiblemente fMRI o similares) con fines clínicos y de investigación.

El modelo está publicado en HuggingFace bajo licencia Apache-2.0, con un tamaño de repositorio de 72,3 GB, lo que sugiere que los pesos son voluminosos. Sin embargo, la model card proporcionada por el autor es extremadamente escueta (solo incluye la licencia), y no se especifican arquitectura, número de parámetros, contexto ni otros detalles técnicos habituales. La información disponible en la web es limitada, por lo que esta ficha se basa principalmente en la descripción del repositorio y en datos públicos del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrito como "teacher" de espacio crudo + compilador de neuroimagen + modelo clínico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje estándar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente no aplica, al ser un modelo de neuroimagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (tamaño del repo: 72,3 GB; no se especifica el formato) |

## Arquitectura y entrenamiento

La descripción del repositorio GitHub indica que NeuroTaskFM combina varios componentes: un "teacher" que opera en el espacio crudo (raw-space), un compilador de neuroimagen GPU determinista (que probablemente transforma los datos crudos en un espacio compilado), un modelo clínico que trabaja en ese espacio compilado y una "firma de participante" actualizable que captura la especificidad individual. No se detalla si se trata de un transformer, una red convolucional, un modelo de estado sólido o una arquitectura híbrida. Tampoco se publican datos sobre el volumen de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La ausencia de una model card completa impide conocer cualquier innovación técnica concreta.

## Capacidades

- Modelado de relaciones entre actividad cerebral intrínseca, función evocada por tareas, comportamiento y estado clínico longitudinal.
- Aprendizaje de representaciones específicas por paciente, lo que podría permitir personalización en entornos clínicos.
- Integración con un compilador de neuroimagen GPU, lo que sugiere capacidad de procesamiento eficiente de datos de neuroimagen.
- No se dispone de información sobre capacidades de generación de texto, código, razonamiento, tool calling, agentes o multilingüismo. Dado el ámbito del modelo, es probable que estas capacidades no apliquen.

## Casos de uso

- Investigación en neurociencia: análisis de datos de fMRI para estudiar cómo la actividad cerebral intrínseca se relaciona con la función evocada por tareas y el comportamiento.
- Medicina de precisión: desarrollo de biomarcadores individualizados para trastornos neurológicos o psiquiátricos, basados en la "firma de participante" actualizable.
- Seguimiento clínico longitudinal: monitorización de cambios en el estado clínico de pacientes a lo largo del tiempo mediante el modelo de espacio compilado.
- Integración con pipelines de neuroimagen: uso del compilador GPU para acelerar el preprocesamiento de datos volumétricos.
- Investigación de conectividad funcional: exploración de relaciones entre regiones cerebrales en estado de reposo y durante tareas.
- Desarrollo de herramientas de apoyo diagnóstico: el modelo podría servir como base para clasificadores o predictores de evolución clínica, aunque no se especifica su salida exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio GitHub no incluye métricas comparativas en la descripción accesible, y la model card de HuggingFace está vacía. Tampoco se han encontrado papers o informes técnicos que documenten el rendimiento del modelo en tareas estándar.

## Requisitos de hardware

- El tamaño del repositorio (72,3 GB) sugiere que los pesos son grandes; sin embargo, no se especifica si corresponden a un único modelo o a varios componentes (teacher, compilador, modelo clínico).
- No se dispone de estimaciones de VRAM para inferencia. Dado el volumen, es probable que se necesiten GPUs con al menos 24 GB de memoria (p. ej., RTX 3090/4090) o GPUs de datacenter (A100, H100) para cargar el modelo completo, pero esto es una especulación basada únicamente en el tamaño del archivo.
- No se indica si el modelo se puede cuantizar para reducir requisitos.
- Opciones de despliegue: no disponibles. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, probablemente porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Existen otros proyectos de neuroimagen con enfoques de foundation model, como NeuroFM (preentrenado en 100.000 volúmenes generados por IA) y NeuroLM (para EEG, que convierte señales en tokens y los procesa con un LLM). Sin embargo, NeuroTaskFM parece tener un enfoque distinto, centrado en la especificidad del paciente y en un pipeline de compilación de neuroimagen. No hay datos públicos que permitan comparar parámetros, contexto o rendimiento entre estos modelos.

## Limitaciones y advertencias

- La información técnica disponible es muy limitada; no se conocen la arquitectura exacta, el número de parámetros, el dataset de entrenamiento ni los procedimientos de validación.
- No se han publicado resultados de benchmarks ni estudios de evaluación independientes, por lo que su eficacia clínica o científica no está demostrada.
- Al ser un modelo de investigación, puede requerir conocimientos avanzados en neuroimagen y procesamiento de señales para su uso correcto.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda verificar los términos completos y la atribución requerida.
- No se especifican sesgos conocidos ni riesgos de alucinación (al no ser un modelo generativo de texto). Sin embargo, cualquier modelo entrenado con datos de neuroimagen puede heredar sesgos de las poblaciones de entrenamiento, lo que debe considerarse en aplicaciones clínicas.
- El tamaño del repositorio (72,3 GB) puede dificultar su despliegue en entornos con recursos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/markjiang1/NeuroTaskFM
- Repositorio GitHub: https://github.com/rest2task/NeuroTaskFM
- Documentación (GitHub): https://github.com/rest2task/NeuroTaskFM/tree/main/docs
- Proyecto NeuroFM (referencia relacionada): https://rocknroll87q.github.io/NeuroFM/
- Proyecto NeuroLM (referencia relacionada): https://bio.rodeo/models/neurolm
- Paper NeuroLM (arXiv): https://arxiv.org/pdf/2409.00101v2
