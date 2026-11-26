# SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_Pi0

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. Se trata de una política vision-language-action (VLA) especializada en una única tarea de manipulación robótica: recoger una CPU con una ventosa y colocarla en una caja, sobre un robot Universal Robots UR5. El autor es SamerAyyad y el modelo se publicó en noviembre de 2026 bajo licencia Apache 2.0.

A diferencia de un modelo de lenguaje, este artefacto no genera texto: consume una imagen de cámara a 480×640 píxeles y un vector de estado de 7 dimensiones (posición articular del UR5), y produce un vector de acción de 7 dimensiones por paso de control. El modelo parte de `lerobot/pi0_base` y se ha entrenado con 200 episodios de demostración (128.036 fotogramas a 30 FPS) recogidos por el propio autor.

Su relevancia es acotada: es un ejemplo práctico de cómo se ajusta un VLA generalista a una tarea concreta mediante imitación, útil para desarrolladores que quieran reproducir el flujo de trabajo de LeRobot con robots UR5 o evaluar la viabilidad de políticas VLA en entornos industriales de pick-and-place. No es un modelo de propósito general ni un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀, implementación de LeRobot adaptada de OpenPI |
| Parametros totales | 4.028.019.472 (~4,03 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observación por paso de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe instrucciones de tarea en lenguaje natural, pero no se documentan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB) |
| Modelo base | lerobot/pi0_base |
| Tipo de robot | ur5 |
| Entradas | imagen `observation.images.camera` (3, 480, 640) y estado `observation.state` (7,) |
| Salidas | acción `action` (7,) |
| Dataset de entrenamiento | SamerAyyad/VLA_Samer_22.11.2026_200eps (200 episodios, 128.036 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π₀, un VLA generalista de Physical Intelligence que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para mapear observaciones e instrucciones en comandos motores. La implementación utilizada es la de LeRobot, derivada del repositorio OpenPI de Physical Intelligence. El artefacto publicado hereda la arquitectura del modelo base y no introduce cambios estructurales documentados.

El entrenamiento se realizó por imitación supervisada sobre 200 episodios de la tarea "Pick up the CPU with the suction gripper and place it in the box", con 20.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, usando LeRobot 0.6.2. No se documentan fases de RLHF, DPO ni datos adicionales más allá del dataset citado. Tampoco se especifican innovaciones técnicas propias más allá de las heredadas del modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un UR5 a partir de una imagen y el estado articular.
- Ejecución de una tarea concreta de pick-and-place: recoger una CPU con ventosa y depositarla en una caja.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto en el comando de rollout (`--task`).
- Política de imitación entrenada de extremo a extremo sobre demostraciones reales.
- Integración con el ecosistema LeRobot: entrenamiento, rollout y visualización de dataset mediante CLI.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place industrial: el modelo ejecuta la secuencia de recogida con ventosa y depósito en caja sobre un UR5, adecuado para tareas repetitivas de manipulación de componentes electrónicos.
- Prototipado rápido de políticas VLA: sirve como plantilla para ajustar π₀ a nuevas tareas con LeRobot, sustituyendo el dataset y el tipo de robot en el comando `lerobot-train`.
- Investigación en imitación robótica: permite reproducir un pipeline completo (grabación, entrenamiento, rollout) con 200 episodios y 20.000 pasos, un coste asequible para laboratorios.
- Benchmark de referencia para comparar políticas: al estar entrenado sobre un dataset público concreto, puede usarse como línea base frente a otros ajustes de π₀ en la misma tarea.
- Formación y docencia: ejemplo didáctico de cómo se estructura un repositorio LeRobot con especificación de entradas, salidas y configuración de entrenamiento.
- Validación de hardware UR5: el rollout con `--strategy.type=base` permite comprobar la integración de cámara, puerto y calibración antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~4,03 mil millones de parámetros, una estimación en FP16 rondaría los 8 GB de pesos, pero no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento usa `--policy.device=cuda`, sin modelo concreto.
- Viabilidad en GPU de consumo: no confirmada; el tamaño de pesos en FP16 es compatible con GPUs de 12-16 GB, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_Pi0 | ~4,03 mil millones | imagen 480×640 + estado (7,) | Pick-and-place UR5 | Apache 2.0 | Hugging Face |
| lerobot/pi0_base | no disponible | no disponible | VLA generalista | no disponible | Hugging Face |
| π₀ original (Physical Intelligence) | no disponible | no disponible | VLA generalista multi-robot | no disponible | OpenPI |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo se ha entrenado para una tarea y un robot concretos (UR5 con ventosa); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en el mundo real, por lo que se desconoce su fiabilidad.
- Dataset pequeño: 200 episodios y una única tarea limitan la robustez ante variaciones de posición, iluminación u objetos.
- Dependencia de hardware: requiere un UR5, una cámara concreta y nombres de observación que coincidan con los del entrenamiento.
- Riesgo de sobreajuste: 20.000 pasos sobre 200 episodios puede producir sobreajuste al entorno de grabación.
- Idiomas no documentados: aunque la tarea se pasa como texto, no se especifica qué lenguas comprende el componente de lenguaje.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y sus dependencias pueden tener condiciones adicionales no detalladas aquí.
- Sin datos de sesgos ni alucinación: no aplica el marco de LLM, pero no se documenta el comportamiento ante entradas fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_Pi0
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_22.11.2026_200eps
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_22.11.2026_200eps
