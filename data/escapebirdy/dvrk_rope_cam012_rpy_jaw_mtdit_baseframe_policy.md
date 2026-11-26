# escapebirdy/dvrk_rope_cam012_rpy_jaw_mtdit_baseframe_policy

## Resumen

`dvrk_rope_cam012_rpy_jaw_mtdit_baseframe_policy` es una política robótica entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo pertenece a la familia `multi_task_dit` (Multi-Task Diffusion Transformer) y ha sido desarrollado por el usuario `escapebirdy`. Su propósito es generar acciones de control para un robot quirúrgico da Vinci Research Kit (dVRK) en una tarea de manipulación de cuerda, a partir de observaciones de tres cámaras (`cam012`) y representaciones de orientación en ángulos roll-pitch-yaw junto con la apertura de la pinza (`rpy_jaw`), todo ello expresado en el marco de referencia base (`baseframe`).

El modelo resuelve un problema de política visuomotora multi-tarea: dado un conjunto de observaciones visuales y propioceptivas, predice la acción motora siguiente. Con 277.097.226 parámetros (aproximadamente 277 M) y un repositorio de 1,1 GB, se sitúa en el rango de políticas de tamaño medio, adecuadas para inferencia en tiempo real sobre GPU de gama alta. La arquitectura DiT (Diffusion Transformer) aplicada a políticas robóticas es una tendencia reciente que combina la capacidad de modelado de los transformers con la generación iterativa de acciones propia de los modelos de difusión.

La relevancia de esta ficha radica en que documenta un caso concreto de política robótica de código abierto con licencia Apache 2.0, publicada en el Hub de Hugging Face, lo que facilita su reproducibilidad y su integración en pipelines de LeRobot. No obstante, se trata de un modelo muy específico, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados, por lo que su evaluación debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) para políticas robóticas, integrado en LeRobot |
| Parametros totales | 277.097.226 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | `escapebirdy/dvrk_rope_cam012_baseframe` |
| Tamaño del repositorio | 1,1 GB |
| Fecha de creación | 2026-11-26 |
| Fecha de actualización | 2026-11-26 |

## Arquitectura y entrenamiento

La arquitectura declarada es `multi_task_dit`, es decir, un Diffusion Transformer multi-tarea. Los modelos DiT sustituyen las capas convolucionales de los modelos de difusión clásicos por bloques transformer, lo que permite modelar dependencias globales entre las observaciones (imágenes de las cámaras 0, 1 y 2) y las acciones. En el contexto de LeRobot, este tipo de política se entrena mediante aprendizaje por imitación sobre demostraciones teleoperadas, generando acciones de forma iterativa mediante un proceso de difusión condicionado por la observación.

El entrenamiento se realizó sobre el dataset `escapebirdy/dvrk_rope_cam012_baseframe`, que contiene episodios de manipulación de cuerda con el robot dVRK. Las observaciones incluyen tres cámaras (`cam012`) y el estado del robot expresado como orientación roll-pitch-yaw más apertura de pinza (`rpy_jaw`), todo en el marco base (`baseframe`). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; la model card no detalla estos extremos. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas: predice comandos motores para un robot dVRK a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa simultáneamente las imágenes de tres cámaras (`cam012`).
- Representación de orientación: utiliza ángulos roll-pitch-yaw y apertura de pinza (`rpy_jaw`) como parte del estado.
- Operación en marco base: las acciones se expresan en el marco de referencia base del robot (`baseframe`).
- Aprendizaje por imitación multi-tarea: la etiqueta `multi_task_dit` sugiere entrenamiento sobre múltiples tareas dentro del mismo dataset.
- Integración con LeRobot: compatible con `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Manipulación de cuerda con dVRK: la política está entrenada específicamente para tareas de manejo de cuerda con el robot quirúrgico da Vinci Research Kit, por lo que su uso principal es la ejecución autónoma de esta tarea en laboratorio.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar políticas DiT multi-tarea en robótica quirúrgica, gracias a su licencia Apache 2.0 y a la disponibilidad del dataset asociado.
- Evaluación de políticas visuomotoras: puede utilizarse con `lerobot-record` para generar episodios de evaluación y comparar el rendimiento de distintas configuraciones de política sobre el mismo dataset.
- Benchmarking de arquitecturas DiT en robótica: al ser un modelo de 277 M de parámetros, permite comparar el coste computacional y la calidad de políticas DiT frente a arquitecturas ACT u otras disponibles en LeRobot.
- Reproducción de experimentos: el repositorio incluye los pesos en safetensors, lo que facilita la reproducción de los resultados del autor en entornos con LeRobot instalado.
- Formación y docencia: útil como ejemplo práctico de entrenamiento de políticas robóticas con LeRobot en cursos de robótica o aprendizaje automático.
- Desarrollo de pipelines de teleoperación asistida: puede integrarse en flujos donde el robot asiste al operador en subtareas de manipulación de cuerda, aunque requiere validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 277 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,1 GB; en FP16, unos 0,55 GB. A ello hay que sumar el coste de las activaciones y del proceso de difusión iterativo, por lo que se recomienda al menos 4-8 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para entrenamiento y evaluación a alta frecuencia; para inferencia en laboratorio, una RTX 3090 o RTX 4090 es suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, etc.), siempre que se ajuste el tamaño de batch.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a políticas robóticas.
- Latencia y throughput estimados: no disponibles. La latencia dependerá del número de pasos de difusión y de la GPU; en una RTX 4090 se espera una frecuencia de control compatible con tareas de manipulación, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `escapebirdy/dvrk_rope_cam012_rpy_jaw_mtdit_baseframe_policy` | 277 M | no disponible | Política robótica dVRK (cuerda) | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot | no disponible | no disponible | Políticas de imitación genéricas | Apache 2.0 (LeRobot) | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy (referencia) | no disponible | no disponible | Políticas de imitación con difusión | MIT/Apache según implementación | Repositorios académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea de manipulación de cuerda con dVRK y el dataset `escapebirdy/dvrk_rope_cam012_baseframe`; no generaliza a otros robots, tareas o configuraciones de cámara sin reentrenamiento.
- Sin benchmarks publicados: no hay métricas de éxito, precisión ni robustez que permitan evaluar su calidad objetivamente.
- Riesgo de alucinación motora: como toda política generativa, puede producir acciones incoherentes o inseguras fuera de la distribución de entrenamiento.
- Sesgos desconocidos: no se documentan sesgos en el dataset ni en el proceso de entrenamiento; la model card no incluye sección de sesgos.
- Limitaciones de idioma: no aplica, al no ser un modelo lingüístico.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; el uso en entornos quirúrgicos reales requiere validación clínica independiente y no está cubierto por la licencia.
- Caveat para producción: con cero descargas y cero likes, el modelo no ha sido validado por la comunidad; se recomienda evaluarlo exhaustivamente antes de cualquier despliegue.
- La model card no reconoce el tipo de modelo ("Model type not recognized") y contiene una plantilla sin completar, lo que indica documentación incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/escapebirdy/dvrk_rope_cam012_rpy_jaw_mtdit_baseframe_policy
- Dataset asociado: https://huggingface.co/datasets/escapebirdy/dvrk_rope_cam012_baseframe
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
