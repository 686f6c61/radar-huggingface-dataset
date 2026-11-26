# Efficient-Large-Model/Long-WAM-LIBERO-IDM-LeRobot

## Resumen

Long-WAM LIBERO IDM es un modelo de política robótica (visión-lenguaje-acción) desarrollado por Efficient-Large-Model, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de la versión nativa para LeRobot del checkpoint original Long-WAM LIBERO IDM, empaquetada con todos los pesos de política, configuración y estadísticas de preprocesado necesarias para su ejecución directa en el ecosistema LeRobot. El modelo está diseñado para el benchmark LIBERO de manipulación robótica y emplea una arquitectura de "imaginación de vídeo futuro" antes de la eliminación de ruido de acciones (IDM, inverse dynamics model).

La propuesta técnica es relevante porque combina un modelo de difusión de vídeo con un decodificador de acciones: el modelo "imagina" fotogramas futuros antes de predecir la acción, lo que introduce una forma de planificación implícita en el espacio visual. El checkpoint usa 48 ticks de control de historial de observación, lo que le permite mantener contexto temporal amplio para tareas de manipulación con múltiples pasos. Con 12.406.309.603 parámetros (unos 12,4 mil millones) y un tamaño de repositorio de 24,8 GB, es un modelo de gran tamaño para robótica, pensado para ejecución en GPU de datacenter.

El modelo no está pensado para generación de texto ni para conversación general: es un componente de política para control robótico dentro de LeRobot, con pipeline declarado `robotics`. Su utilidad práctica se limita al ámbito de investigación y despliegue en manipulación robótica, especialmente en tareas tipo LIBERO (spatial, object, goal, long).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Long-WAM (modelo de vídeo futuro + IDM para acciones); política LeRobot |
| Parámetros totales | 12.406.309.603 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 48 ticks de control de historial de observación |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; tokenizer `google/umt5-xxl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

Long-WAM es una arquitectura de política robótica que combina un modelo generativo de vídeo con un modelo de dinámica inversa (IDM). El flujo descrito en la model card indica que el modelo "imagina vídeo futuro antes de eliminar el ruido de las acciones": primero genera una representación o predicción de fotogramas futuros y, a partir de ella, decodifica la acción de control. Esta separación en dos etapas (predicción visual y decodificación de acción) es la innovación técnica principal frente a políticas puramente reactivas.

El checkpoint está especializado en el benchmark LIBERO y utiliza 48 ticks de control de historial de observación, lo que le permite condicionar la acción en una ventana temporal amplia. El tokenizer se carga desde `google/umt5-xxl`, lo que sugiere el uso de un encoder de texto multilingüe de gran tamaño para las instrucciones de tarea. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no detalla estos extremos. La ejecución es síncrona y requiere llamar a `select_action` en cada tick de control y a `reset()` entre episodios.

## Capacidades

- Control robótico de manipulación: genera acciones de control a partir de observaciones visuales e instrucciones de tarea en entornos LIBERO.
- Predicción de vídeo futuro: el modelo imagina fotogramas futuros como paso intermedio antes de decodificar la acción.
- Historial de observación de 48 ticks: mantiene contexto temporal amplio para tareas de varios pasos.
- Integración nativa con LeRobot: compatible con `LongWAMPolicy.from_pretrained(...)` y con los pre/post-procesadores guardados.
- Soporte de instrucciones en lenguaje natural mediante tokenizer `google/umt5-xxl`.
- Evaluación estandarizada en LIBERO (`libero_spatial` y otras variantes) mediante `lerobot-eval`.
- No se documentan capacidades de tool calling, agentes multi-step genéricos, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en manipulación robótica: evaluar políticas de visión-lenguaje-acción en el benchmark LIBERO con `lerobot-eval`, comparando variantes spatial, object, goal y long.
- Planificación implícita mediante imaginación de vídeo: usar la predicción de fotogramas futuros para tareas que requieren anticipar el efecto de una acción antes de ejecutarla.
- Tareas de manipulación con múltiples pasos: los 48 ticks de historial permiten condicionar acciones en secuencias largas donde el estado pasado es relevante.
- Reproducción de experimentos: el repositorio incluye pesos completos, configuración y estadísticas de preprocesado, lo que facilita la replicación de resultados.
- Base para fine-tuning en dominios específicos: al estar bajo Apache 2.0 y en formato LeRobot, puede adaptarse a nuevos entornos de manipulación con datos propios.
- Despliegue en pipelines de evaluación automatizada: integración con `lerobot-eval` y ejecución síncrona en GPU para comparar políticas de forma reproducible.
- Estudio de la relación entre predicción visual y control: útil para investigar si la imaginación de vídeo mejora la robustez de la política en comparación con políticas reactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona el comando de evaluación (`lerobot-eval` sobre `libero_spatial`) sin cifras de éxito ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 12,4 mil millones de parámetros en precisión completa (fp16/bf16) se estiman del orden de 24-25 GB solo para pesos, más memoria para activaciones y el modelo de vídeo.
- GPU recomendadas: no especificadas por el autor; por tamaño, se requiere GPU de datacenter (A100 40/80 GB, H100) para ejecución cómoda en fp16.
- GPU de consumo: poco probable que quepa en RTX 4090 (24 GB) en fp16 sin cuantización o descarga parcial; no se documentan opciones de cuantización.
- Opciones de despliegue: LeRobot (versión con soporte de política Long-WAM) con los extras `longwam` y `libero`; ejecución vía `lerobot-eval` o `LongWAMPolicy.from_pretrained(...)`.
- Latencia y throughput: no disponibles; la model card indica que la ejecución es síncrona y que `select_action` se llama en cada tick de control.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas robóticas con imaginación de vídeo en LeRobot) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado y evaluado para el benchmark LIBERO; su generalización a otros entornos robóticos no está documentada.
- Sin datos de benchmarks publicados: no hay cifras de tasa de éxito que permitan evaluar su rendimiento real frente a alternativas.
- Requisitos de hardware elevados: 12,4 mil millones de parámetros y 24,8 GB de repositorio implican GPU de datacenter; no se documentan cuantizaciones para hardware de consumo.
- Dependencia de versiones concretas: requiere una versión de LeRobot con soporte de política Long-WAM y los extras `longwam` y `libero`; la incompatibilidad de versiones puede impedir la carga.
- Dependencia del tokenizer externo: carga `google/umt5-xxl`, por lo que necesita acceso a ese repositorio.
- Ejecución síncrona: no se documenta soporte para ejecución asíncrona o paralela, lo que puede limitar el throughput en producción.
- Riesgo de alucinación visual: al predecir vídeo futuro, errores en la imaginación pueden propagarse a la acción; no se documentan mecanismos de mitigación.
- Sesgos: no disponibles; no se documenta la composición del dataset de entrenamiento ni posibles sesgos en las instrucciones o escenas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento de las dependencias externas (`google/umt5-xxl`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/Long-WAM-LIBERO-IDM-LeRobot
- Modelo original (no LeRobot): https://huggingface.co/Efficient-Large-Model/Long-WAM-LIBERO-IDM
- Tokenizer: https://huggingface.co/google/umt5-xxl
- LeRobot (librería): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
