# Adub123/smolvla-sim-variety-v0

## Resumen

`Adub123/smolvla-sim-variety-v0` es un fine-tuning del modelo vision-language-action (VLA) SmolVLA, desarrollado originalmente por Hugging Face y publicado en el paper arXiv:2506.01844. Se trata de una política de imitación compacta (450 millones de parámetros) que mapea observaciones multimodales (estado articular de 6 dimensiones más varias cámaras) a acciones de control de un brazo robótico de 6 grados de libertad. El autor del fine-tuning es el usuario de Hugging Face Adub123, y el modelo está pensado para ser ejecutado con la librería LeRobot.

El modelo parte de `lerobot/smolvla_base` y se ha ajustado sobre el dataset `Adub123/so101-sim-variety`, compuesto por 100 episodios y 16.805 fotogramas a 30 FPS en un entorno de simulación con el robot `so_follower`. La tarea es de manipulación de objetos variados: decenas de instrucciones de agarre y elevación de bolas, bloques, cilindros, cápsulas, corchos y huevos de distintos colores.

Su relevancia radica en que demuestra el flujo completo de fine-tuning de un VLA pequeño sobre hardware de consumo, con licencia Apache 2.0 y un tamaño de repositorio de 0,9 GB. Es un ejemplo práctico de cómo adaptar un modelo fundacional de robótica a un dominio concreto (simulación de picking variado) sin necesidad de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; transformer multimodal con encoder visual y de lenguaje y cabeza de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un encoder visual, un encoder de lenguaje y un decodificador de acciones para producir comandos motores a partir de observaciones e instrucciones en lenguaje natural. El modelo base `lerobot/smolvla_base` se distribuye dentro del ecosistema LeRobot y está diseñado para ejecutarse en hardware de consumo. La arquitectura concreta (número de capas, dimensión oculta, mecanismo de atención) no se detalla en la información proporcionada.

El fine-tuning se realizó sobre el dataset `Adub123/so101-sim-variety` con 100 episodios y 16.805 fotogramas a 30 FPS. La configuración de entrenamiento reportada es: 6.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. No se especifica el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de imitación supervisada sobre demostraciones, lo habitual en este tipo de políticas es el aprendizaje por imitación (behavior cloning), aunque no se confirma explícitamente en la información disponible.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de observaciones de estado y visión.
- Percepción multimodal: consume tres cámaras de 256x256 y dos cámaras adicionales de 480x640, además del estado articular de 6 dimensiones.
- Comprensión de instrucciones en lenguaje natural: el dataset incluye más de 80 instrucciones de tarea distintas (agarre y elevación de objetos de distintos colores y formas), lo que sugiere capacidad de condicionamiento por lenguaje.
- Generalización a variedad de objetos: el nombre del dataset (`sim-variety`) y la diversidad de tareas indican entrenamiento sobre múltiples formas, colores y tipos de objeto.
- Ejecución en hardware de consumo: el tamaño de 450 M de parámetros y el formato safetensors permiten despliegue en GPUs de gama media.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y el flujo de entrenamiento de la librería.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Manipulación robótica en simulación: ejecutar políticas de picking sobre el robot `so_follower` en entornos simulados para validar algoritmos de imitación antes de pasar a hardware real. El modelo está entrenado específicamente para este robot y tareas de agarre.
- Investigación en aprendizaje por imitación: servir como punto de partida para experimentos de fine-tuning con datasets propios, dado que parte de `smolvla_base` y usa la configuración estándar de LeRobot.
- Benchmark de generalización a variedad de objetos: el dataset cubre decenas de combinaciones de forma y color; útil para medir la robustez del modelo ante objetos no vistos durante el entrenamiento.
- Prototipado de bajo coste en robótica: con 450 M de parámetros y 0,9 GB de pesos, se puede desplegar en estaciones de trabajo con GPU de consumo para ciclos rápidos de prueba y error.
- Educación y docencia en robótica: ejemplo completo y reproducible de un pipeline de entrenamiento VLA con LeRobot, desde la grabación de datos hasta el rollout.
- Evaluación de políticas visión-lenguaje-acción: usar el modelo como baseline en comparativas de arquitecturas VLA pequeñas sobre tareas de manipulación simulada.
- Automatización de tareas de recogida en líneas de simulación: integrar el modelo en entornos de simulación para generar trayectorias de agarre de objetos de distintas geometrías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en fp32 se requieren aproximadamente 1,8 GB solo para pesos, más el overhead de las cámaras y buffers de inferencia. En fp16/bf16 bajaría a unos 0,9 GB.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, una GPU de consumo con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia.
- ¿Cabe en consumer GPU? Sí, por el tamaño del modelo (450 M de parámetros) y el formato safetensors; la model card menciona explícitamente que SmolVLA puede desplegarse en hardware de consumo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte del ecosistema Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI, que están orientados a LLMs de texto y no a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adub123/smolvla-sim-variety-v0 | 450 M | no disponible | VLA (fine-tuning) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base | no disponible | Hugging Face |
| Otros VLA pequeños (p. ej. RT-2, OpenVLA) | no disponible en la información | no disponible | VLA | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: el dataset `so101-sim-variety` es simulado, por lo que el rendimiento en el mundo real puede degradarse por la brecha sim-to-real.
- Específico de robot y cámara: la política asume el robot `so_follower` con una configuración concreta de cámaras (tres de 256x256 y dos de 480x640); cambiarla requiere reentrenamiento o adaptación.
- Tareas acotadas: las instrucciones cubren únicamente agarre y elevación de objetos variados; no se ha entrenado para tareas de ensamblaje, apilado u otras manipulaciones.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante objetos o configuraciones no vistas.
- Sesgos del dataset: la variedad de objetos está limitada a las formas y colores presentes en los 100 episodios; objetos con propiedades físicas distintas pueden no generalizarse.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/smolvla_base` debe verificarse por separado para confirmar compatibilidad.
- Sin benchmarks publicados: no hay métricas cuantitativas de éxito en tareas que permitan evaluar su rendimiento antes de desplegarlo.
- Repositorio con pocas descargas (44) y sin likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Adub123/smolvla-sim-variety-v0)
- [Dataset Adub123/so101-sim-variety](https://huggingface.co/datasets/Adub123/so101-sim-variety)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Paper SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Adub123/so101-sim-variety)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
