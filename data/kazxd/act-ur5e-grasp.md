# Kazxd/act-ur5e-grasp

## Resumen

`Kazxd/act-ur5e-grasp` es una política de control robótico basada en Action Chunking Transformer (ACT), entrenada con la librería LeRobot 0.7.1 para la tarea de agarre de un cubo con un brazo UR5e en el simulador MuJoCo. No es un modelo de lenguaje: es un modelo de imitación que mapea observaciones (imágenes y estado del robot) a secuencias de acciones de control, y se distribuye como checkpoint de `lerobot` en formato safetensors con 51.619.463 parámetros (aproximadamente 0,2 GB de repositorio).

El modelo se entrenó sobre 64 demostraciones teleoperadas con gamepad, publicadas en el dataset `Kazxd/ur5e-grasp-demos`. El autor reporta una tasa de éxito del 95 % (95/100) sobre semillas de evaluación reservadas (5000-5099) con `n_action_steps=50`, aunque el alcance es deliberadamente limitado: solo simulación, un único cubo, posición aleatorizada en un área de 16 cm x 20 cm, un solo operador y la misma física en entrenamiento y prueba.

Su relevancia es práctica para quien trabaja en imitación robótica: sirve como referencia reproducible y de bajo coste computacional para validar pipelines de LeRobot, comparar variantes de ACT y experimentar con transferencia sim-a-real antes de escalar a modelos mayores. Al tener cero descargas y cero likes en el momento de la consulta, debe tratarse como un artefacto de investigación incipiente, no como un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) |
| Parametros totales | 51.619.463 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de horizonte de acciones; `n_action_steps=50` en evaluación) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no aplica: modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación visuomotora que predice *chunks* de acciones (secuencias de posiciones articulares) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. El checkpoint se entrenó con LeRobot 0.7.1 sobre 64 episodios de teleoperación con gamepad recogidos en MuJoCo para un UR5e. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio). Tampoco se detalla la configuración de aumentos de datos, el tamaño de las imágenes de entrada ni la resolución del espacio de acciones.

La innovación principal es el propio esquema de *action chunking*: el modelo emite bloques de acciones coherentes temporalmente, lo que mejora la estabilidad en tareas de contacto como el agarre. El autor evalúa con `n_action_steps=50`, un valor que conviene respetar para reproducir el 95 % de éxito reportado. El alcance experimental es estrecho (un cubo, un operador, física idéntica en train y test), por lo que el resultado no debe extrapolarse sin validación adicional.

## Capacidades

- Control robótico de agarre: genera secuencias de acciones para un UR5e en MuJoCo a partir de observaciones visuales y de estado.
- Imitación visuomotora: aprende de demostraciones teleoperadas, sin recompensas explícitas.
- Predicción por *chunks* de acciones: produce bloques de acciones coherentes temporalmente (`n_action_steps=50` en evaluación).
- Generalización limitada a posición del cubo: el objeto se aleatoriza en un área de 16 cm x 20 cm.
- Integración con LeRobot: cargable mediante la librería `lerobot` 0.7.1.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües (no aplica).
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación: cargar el checkpoint con LeRobot 0.7.1 y evaluar sobre las semillas 5000-5099 para verificar el 95 % de éxito reportado y servir de línea base en comparaciones internas.
- Validación de pipelines de entrenamiento: usar el par modelo+dataset como referencia para comprobar que una instalación de LeRobot y MuJoCo produce resultados coherentes antes de entrenar políticas propias.
- Estudio de action chunking: variar `n_action_steps` y medir el impacto en la tasa de éxito para entender la sensibilidad del control a este hiperparámetro.
- Ablaciones de datos: reentrenar con subconjuntos de las 64 demostraciones para estudiar cuántos episodios son necesarios para alcanzar umbrales de éxito similares.
- Transferencia sim-a-real preliminar: emplear la política como punto de partida en un UR5e físico, asumiendo que requerirá ajuste fino por la brecha de física y percepción.
- Docencia y divulgación: ejemplo compacto (51,6 M de parámetros, 0,2 GB) para ilustrar el ciclo completo de teleoperación, entrenamiento ACT y evaluación en simulación.
- Benchmark interno de robustez: perturbar la posición del cubo más allá de los 16 cm x 20 cm para caracterizar el dominio de validez del modelo.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de exito | 95/100 (95 %, IC 95 % aprox. 91 %-99 %) | Semillas 5000-5099, `n_action_steps=50`, MuJoCo, un cubo |
| Parametros | 51.619.463 | Safetensors |
| Tamano del repositorio | 0,2 GB | — |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM, asumiendo overhead de activaciones y renderizado de MuJoCo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU moderna (RTX 3060 en adelante) es suficiente. GPU de datacenter (A100, H100) no son necesarias.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4-8 GB de VRAM; el cuello de botella será el renderizado de MuJoCo, no el modelo.
- Opciones de despliegue: LeRobot 0.7.1 como vía principal; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kazxd/act-ur5e-grasp | 51,6 M | `n_action_steps=50` en evaluación | 95 % en simulación (semillas 5000-5099) | no disponible | Hugging Face, 0 descargas |
| ACT original (Zhao et al., 2023) | no disponible en esta ficha | no disponible | no disponible | no disponible | Paper y código públicos |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible en esta ficha | no disponible | no disponible | no disponible | Ecosistema LeRobot |

No se dispone de datos comparativos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Alcance restringido a simulación: no hay evidencia de transferencia a un UR5e físico; la física de MuJoCo en train y test es idéntica.
- Un único objeto y un único operador: el cubo y las demostraciones provienen de una sola persona, lo que limita la diversidad de estilos de agarre.
- Generalización espacial acotada: la posición del cubo solo se aleatoriza en 16 cm x 20 cm; fuera de ese rango el rendimiento es desconocido.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el resultado del 95 % no ha sido replicado de forma independiente.
- Riesgo de sobreajuste a la configuración experimental: cambios en iluminación, cámara, resolución o dinámica del robot pueden degradar el control.
- Sin información sobre sesgos, alucinación o multilingüismo: no aplican en el sentido habitual, pero sí la advertencia de que el modelo no razona ni explica sus acciones.
- Hiperparámetro sensible: el éxito reportado depende de `n_action_steps=50`; otros valores no han sido caracterizados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kazxd/act-ur5e-grasp
- Dataset de demostraciones: https://huggingface.co/datasets/Kazxd/ur5e-grasp-demos
- Código del proyecto: https://github.com/Kazxd/ur5e-act-imitation-learning
