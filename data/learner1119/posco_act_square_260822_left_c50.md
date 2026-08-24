# learner1119/posco_act_square_260822_left_c50

## Resumen

`posco_act_square_260822_left_c50` es una política de control robótico basada en el transformer de acción por chunks (ACT, action-chunking transformer), entrenada con la librería LeRobot 0.4.3 sobre un dataset de pick-and-place del brazo izquierdo del robot POSCO. El modelo aprende a generar secuencias de 50 acciones a partir de una observación compuesta por una imagen de cámara (480x640) y el estado propioceptivo del brazo, a una frecuencia de control de 20 Hz (lo que equivale a 2,5 segundos de planificación por chunk).

El modelo está desarrollado por learner1119 (Doyoung Kim) y publicado en Hugging Face bajo el pipeline de robótica. A diferencia de los modelos de lenguaje, esta política no genera texto: produce acciones de 8 dimensiones (7 articulaciones del brazo izquierdo más la pinza) para ejecutar tareas de manipulación física. Es relevante porque demuestra un flujo completo de entrenamiento de políticas ACT con LeRobot, incluyendo normalización de observaciones mediante pre/post-procesadores, y porque documenta un caveat importante: se entrenó sin partición de validación, por lo que no existe una métrica honesta de generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (action-chunking transformer) |
| Parámetros totales | 51.621.512 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo robótico, no lingüístico) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política usa la arquitectura ACT, un transformer que procesa observaciones multimodales (imagen de agente y estado del brazo) y genera un chunk de acciones futuras de longitud fija (50 pasos). El entrenamiento se realizó con behavioral cloning sobre un dataset de 150 episodios y 73.529 frames, con 50.000 pasos de optimización, tamaño de lote 64 y tasa de aprendizaje 1e-05. Se eliminaron las dimensiones del brazo derecho antes del entrenamiento porque en las grabaciones eran constantes (desviación estándar cero), por lo que bajo normalización solo aportaban ruido de sensor unitario sin información aprendible.

Una innovación destacable de la implementación es que la normalización de observaciones y acciones vive en los procesadores de LeRobot (`make_pre_post_processors`), no dentro de la política. El autor advierte explícitamente que llamar a `predict_action_chunk` sobre observaciones crudas produce acciones incorrectas: es obligatorio pasar por los procesadores `pre` y `post`.

## Capacidades

- Generación de secuencias de acciones de 8 dimensiones (7 articulaciones del brazo izquierdo más la apertura del gripper) para manipulación robótica.
- Control basado en visión: utiliza una única cámara (480x640) para observar la escena y generar el chunk de acciones.
- Planificación a 20 Hz: cada chunk de 50 acciones cubre 2,5 segundos de ejecución, lo que permite control en tiempo real.
- Clonación de comportamiento (behavioral cloning): aprende imitando demostraciones humanas del dataset POSCO.
- No soporta tool calling, razonamiento lingüístico ni procesamiento multimodal de texto: es exclusivamente un controlador robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede ejecutar secuencias de agarre y colocación de objetos en una estación de trabajo fija, replicando las demostraciones del dataset.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre configuraciones de brazos o para comparar estrategias de normalización en LeRobot.
- Prototipado de células de fabricación flexibles: integrado en un sistema con LeRobot, permite reprogramar un brazo robótico mediante demostraciones en lugar de programación manual.
- Evaluación de la robustez de políticas visuales: al usar una única cámara, es útil para medir cómo afecta la variabilidad de iluminación o perspectiva a la ejecución de la tarea.
- Formación de operadores en robótica: sirve como ejemplo didáctico de entrenamiento de políticas con LeRobot, mostrando el flujo completo de captura de datos, entrenamiento y despliegue.
- Desarrollo de sistemas de control de bajo coste: con un modelo de 51,6 millones de parámetros, puede ejecutarse en hardware modesto, lo que facilita la experimentación en laboratorios sin GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo se entrenó con todos los episodios disponibles sin una partición de validación, por lo que no existe una métrica honesta de generalización offline. La pérdida de entrenamiento reportada refleja el ajuste a los datos de entrenamiento, no la capacidad de generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica, pero con 51,6 millones de parámetros, la inferencia es ligera. En formato de precisión flotante de 32 bits, los pesos ocupan aproximadamente 206 MB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 3050) es suficiente para inferencia. Para el entrenamiento, una GPU con 8-12 GB de VRAM (RTX 3070, RTX 4060) es razonable.
- Compatibilidad con GPU de consumo: sí, cabe en GPU de consumo e incluso en CPU para inferencia, aunque la latencia dependerá del hardware.
- Opciones de despliegue: se integra con el framework LeRobot; no se menciona compatibilidad con vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la información del modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `posco_act_square_260822_left_c50` | ACT | 51,6 M | Control robótico pick-and-place | no disponible | Hugging Face (LeRobot) |
| ACT (original de Google) | ACT | ~50-80 M | Control robótico | no disponible | GitHub (no Hugging Face) |
| Políticas LeRobot (ej. `lerobot/pusht`) | ACT / Diffusion Policy | 50-100 M | Control robótico | Apache 2.0 | Hugging Face |

La comparativa se limita a la arquitectura y el dominio: todas son políticas de aprendizaje robótico basadas en behavioral cloning. No hay datos públicos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con datos de un brazo izquierdo en una configuración fija (cámara fija, iluminación estable), por lo que no generaliza a otras configuraciones del robot ni a entornos no vistos.
- Riesgo de alucinación: en el contexto robótico, equivale a generar acciones incorrectas o fuera de la distribución de entrenamiento, lo que puede causar movimientos peligrosos en el robot físico.
- Limitaciones de contexto: no tiene ventana de contexto textual; su única entrada es una imagen y el estado de articulaciones. No puede procesar instrucciones verbales.
- Restricciones de licencia: la licencia no está disponible en la model card, por lo que se recomienda contactar con el autor antes de uso comercial.
- Caveat de producción: el modelo se entrenó sin split de validación, por lo que no se puede evaluar la generalización. Además, requiere el uso obligatorio de los procesadores `pre` y `post` de LeRobot; usarlo directamente sobre observaciones crudas produce acciones incorrectas.
- Restricciones de idioma: no aplica, no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner1119/posco_act_square_260822_left_c50
- Perfil del autor en Hugging Face: https://huggingface.co/learner1119
- Lista de modelos del autor: https://huggingface.co/learner1119/models
- LeRobot (framework de entrenamiento): https://github.com/huggingface/lerobot

No se han encontrado papers, blogs o demos adicionales asociados a este modelo en la búsqueda web.</think>## Resumen

`posco_act_square_260822_left_c50` es una política de aprendizaje robótico basada en ACT (action-chunking transformer), entrenada con la librería LeRobot 0.4.3 sobre un dataset de pick-and-place del brazo izquierdo del robot POSCO. El modelo genera secuencias de 50 acciones a partir de una observación compuesta por una imagen de cámara (480x640) y el estado propioceptivo del brazo, a una frecuencia de control de 20 Hz, lo que equivale a planificar 2,5 segundos de movimiento por cada chunk.

El autor, learner1119 (Doyoung Kim), publica el modelo en Hugging Face con el pipeline de robótica y la librería LeRobot. A diferencia de los modelos de lenguaje, este no procesa texto: es un controlador robótico que aprende por clonación de comportamiento (behavioral cloning) y produce comandos de 8 dimensiones (7 articulaciones del brazo izquierdo más el gripper). El modelo es relevante como ejemplo práctico de entrenamiento de políticas ACTUAL con LeRobot, aunque presenta un caveat importante: se entrenó con todos los episodios disponibles sin una partición de validación, por lo que no se dispone de una métrica honesta de generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (action-chunking transformer) |
| Parámetros totales | 51.621.512 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo robótico, no lingüístico) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura ACT, que combina un transformer con decodificación autorregresiva para generar un chunk de acciones de longitud fija (50) dado un contexto de observación. La entrada es una imagen de la cámara de agente (480x640) y un vector de estado de 8 dimensiones. El entrenamiento se realizó con behavioral cloning sobre un dataset de 150 episodios y 73.529 frames, con 50.000 pasos, tamaño de lote 64 y tasa de aprendizaje 1e-05. Se eliminaron las dimensiones del brazo derecho antes del entrenamiento porque en las grabaciones eran constantes (desviación estándar cero), lo que habría introducido ruido de sensor unitario que la política no puede aprender.

Una innovación técnica destacable es la separación de la normalización en los procesadores de LeRobot: la política `ACT` no normaliza internamente, sino que los procesadores `pre` y `post` se aplican antes y después de la predicción. El autor advierte explícitamente que llamar a `predict_action_chunk` sobre observaciones crudas produce acciones incorrectas, por lo que es obligatorio usar el pipeline de pre/post procesamiento.

## Capacidades

- Generación de secuencias de acciones de 8 dimensiones (7 articulaciones del brazo izquierdo + apertura del gripper) para tareas de pick-and-place.
- Control basado en observación visual de una sola cámara (480x640) más el estado de las articulaciones.
- Planificación de chunks de 50 acciones a 20 Hz, cubriendo 2,5 segundos de ejecución.
- Clonación de comportamiento a partir de demostraciones humanas, sin necesidad de recompensa explícita ni RL.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, generación de texto, razonamiento lingüístico ni procesamiento de lenguaje natural.

## Casos de uso

- **Automatización de tareas de pick-and-place en entornos industriales**: el modelo puede controlar un brazo robótico para mover objetos entre posiciones fijas en una celda de trabajo, replicando las demostraciones del dataset POSCO.
- **Investigación en aprendizaje por imitación**: sirve como banco de pruebas para estudiar la transferencia de políticas ACTUAL entre configuraciones de brazos o para comparar la influencia del tamaño del chunk en la suavidad del control.
- **Desarrollo de sistemas de control robótico de bajo coste**: al tener solo 51,6 millones de parámetros, puede ejecutarse en hardware modesto, lo que permite iterar rápidamente en laboratorios sin GPU de gama alta.
- **Formación de operadores en robótica**: el flujo completo de captura de datos, entrenamiento y despliegue con LeRobot se puede enseñar con este modelo como ejemplo práctico.
- **Evaluación de robustez visual**: con una única cámara, es adecuado para estudiar cómo afectan los cambios de iluminación o perspectiva a la política entrenada.
- **Prototipado de soluciones de manipulación**: en una celda de trabajo fija, el modelo puede sustituir la programación manual del robot por demostraciones, reduciendo el tiempo de puesta en marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo se entrenó sin una partición de validación, por lo que no se dispone de una métrica honesta de generalización offline. La pérdida de entrenamiento reportada solo refleja el ajuste a los datos de entrenamiento, no el rendimiento en datos no vistos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma específica, pero con 51,6 millones de parámetros, los pesos en FP32 ocupan aproximadamente 206 MB. Cualquier GPU con al menos 2 GB de VRAM puede ejecutar la inferencia.
- **GPU recomendadas**: para inferencia, cualquier GPU NVIDIA con 4 GB o más (GTX 1650, RTX 3050, RTX 4060). Para entrenamiento, se recomienda una GPU con al menos 8-12 GB de VRAM (RTX 3070, RTX 4080, A100).
- **Compatibilidad con GPU de consumo**: sí, el modelo es ligero y cabe en GPUs de consumo de gama media.
- **Opciones de despliegue**: se integra con LeRobot; no se menciona compatibilidad con vLLM, llama.cpp ni Ollama porque no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible en la información del modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `posco_act_square_260822_left_c50` | ACT | 51,6 M | Control robótico pick-and-place | no disponible | Hugging Face (LeRobot) |
| ACTUAL de Google (oficial) | ACT | 32-80 M | Control robótico | no disponible | GitHub (io) |
| Políticas LeRobot (ej. `lerobot/pusht`) | ACT / Diffusion Policy | 50-100 M | Control robótico | Apache 2.0 | Hugging Face (LeRobot) |

La comparativa se limita a la arquitectura y el tamaño: todas son políticas de clonación de comportamiento para control robótico. No se dispone de datos de rendimiento comparativos entre estos modelos.

## Limitaciones y advertencias

- **Validación ausente**: el modelo se entrenó con todos los episodios disponibles sin split de validación, por lo que no se puede evaluar la generalización a datos no vistos.
- **Sesgo de configuración**: se entrenó solo con el brazo izquierdo y una cámara fija; no generaliza a otras configuraciones de robot, posiciones de cámara ni tareas.
- **Riesgo de acciones incorrectas**: si se usan los procesadores `pre`/`post` de LeRobot, la política puede producir acciones erróneas o inseguras en el robot físico.
- **Alucinación en el contexto robótico**: el modelo puede generar secuencias de acciones fuera de la distribución de entrenamiento, lo que puede causar movimientos bruscos o colisiones.
- **Licencia no disponible**: la model card no especifica la licencia, por lo que se recomienda contactar con el autor antes de uso comercial.
- **Idiomas**: no aplica, el modelo no procesa texto ni instrucciones.
- **Sin cuantización publicada**: no hay versiones GGUF ni cuantizaciones disponibles, solo pesos safetensors.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/learner1119/posco_act_square_260822_left_c50)
- [Perfil del autor en Hugging Face](https://huggingface.co/learner1119)
- [Lista de modelos del autor](https://huggingface.co/learner1119/models)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)

No se han encontrado papers, blogs o demos adicionales asociados a este modelo en la búsqueda web.
