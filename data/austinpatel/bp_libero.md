# austinpatel/bp_libero

## Resumen

`austinpatel/bp_libero` es un checkpoint publicado en HuggingFace asociado al paper *What Enables In-Context Behavior Prompting for Manipulation?* (arXiv:2606.30457), cuyo codigo de referencia vive en el repositorio `real-stanford/behavior_prompting`. Por el nombre del repositorio y las etiquetas del paper, se trata de un modelo orientado a manipulación robótica que implementa *behavior prompting* en contexto: es decir, condicionar el comportamiento de un agente (un brazo robótico) a partir de demostraciones o ejemplos proporcionados en el propio contexto de inferencia, en lugar de reentrenar la política para cada tarea. El sufijo `libero` remite con alta probabilidad al benchmark LIBERO de manipulación robótica de horizonte largo, aunque la model card no lo confirma explícitamente.

La información publicada es extremadamente escasa: la model card se limita a declarar licencia MIT, enlazar el paper y el repositorio de código. No se especifican arquitectura, número de parámetros, longitud de contexto, idiomas ni formato de pesos. El tamaño del repositorio (8,5 GB) sugiere pesos en precisión nativa (probablemente safetensors o un checkpoint de PyTorch), pero este dato no está confirmado en la documentación disponible.

Por tanto, esta ficha debe leerse como una descripción de la propuesta metodológica (behavior prompting para manipulación) más que como una ficha de especificaciones cerrada. Cualquier dato numérico de arquitectura o entrenamiento debe verificarse en el paper y el repositorio antes de usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (paper orientado a *in-context behavior prompting* para manipulación; detalles en arXiv:2606.30457) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño del repo: 8,5 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El título del paper (*What Enables In-Context Behavior Prompting for Manipulation?*) indica que el trabajo estudia las condiciones bajo las cuales un modelo puede ejecutar comportamientos de manipulación a partir de prompts de comportamiento en contexto, es decir, sin ajuste específico por tarea. El repositorio `real-stanford/behavior_prompting` es la referencia para reproducir el entrenamiento y la evaluación.

No se dispone de información sobre volumen de datos de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Cualquier afirmación al respecto requeriría consultar el paper. El nombre `libero` sugiere evaluación sobre el benchmark LIBERO, pero no está confirmado en la información proporcionada.

## Capacidades

- Ejecución de comportamientos de manipulación robótica condicionados por prompts en contexto (según el título del paper).
- Presumiblemente, generalización a tareas no vistas mediante ejemplos en el contexto en lugar de reentrenamiento (a confirmar en el paper).
- Capacidades de generación de texto, código, matemáticas o visión: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible explícitamente; el paradigma de *behavior prompting* es afín a la idea, pero no está documentado.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Investigación en manipulación robótica: usar el checkpoint como línea base para reproducir los experimentos del paper sobre *in-context behavior prompting*, comparando con políticas entrenadas específicamente por tarea.
- Evaluación sobre benchmarks de manipulación: si se confirma la asociación con LIBERO, emplearlo para medir generalización en tareas de horizonte largo dentro de entornos simulados.
- Prototipado de políticas condicionadas por demostraciones: proporcionar ejemplos de comportamiento en el contexto para adaptar el agente a nuevas tareas sin reentrenar.
- Estudio de ablaciones: analizar qué componentes del prompt (número de demostraciones, formato, longitud) habilitan el comportamiento en contexto, tal como sugiere el título del paper.
- Reproducibilidad académica: punto de partida para validar los resultados del paper con el código de `real-stanford/behavior_prompting`.
- Formación y divulgación: material para cursos o talleres sobre aprendizaje por imitación y prompting de comportamiento en robótica.

No se documentan casos de uso fuera del ámbito de la manipulación robótica; no debe asumirse capacidad de chatbot, generación de código o procesamiento de lenguaje natural general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (8,5 GB) da una cota inferior aproximada del espacio en disco necesario para los pesos, pero no permite derivar VRAM sin conocer la arquitectura.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No determinable con los datos disponibles.
- Opciones de despliegue: no documentadas; el repositorio `real-stanford/behavior_prompting` es la referencia para el stack de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni métricas que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, parámetros, contexto ni datos de entrenamiento; no debe usarse en producción sin consultar el paper y el repositorio.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no evaluable sin benchmarks ni descripción de la tarea.
- Limitaciones de contexto o idioma: no documentadas.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las licencias de los datasets y del código asociado (por ejemplo, LIBERO) antes de redistribuir.
- Ámbito restringido: por el título del paper, el modelo está orientado a manipulación robótica; no debe asumirse capacidad generalista.
- Sin descargas ni *likes*: el checkpoint tiene 0 descargas en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/austinpatel/bp_libero
- Paper: https://huggingface.co/papers/2606.30457
- Repositorio de código: https://github.com/real-stanford/behavior_prompting
