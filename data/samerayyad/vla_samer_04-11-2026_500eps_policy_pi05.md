# SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_Pi05

## Resumen

El modelo `SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_Pi05` es un ajuste fino de política robótica de tipo Vision-Language-Action (VLA) basado en π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. Lo publica el usuario SamerAyyad y está entrenado específicamente para una tarea de manipulación con un brazo UR5 equipado con ventosa: recoger una CPU y depositarla en una caja. No es un modelo de lenguaje general, sino una política de imitación que consume observaciones visuales y de estado para emitir comandos de acción de 7 dimensiones.

El modelo parte de `lerobot/pi05_base` y se ha ajustado con 500 episodios de demostración (322.402 fotogramas a 30 FPS) durante 20.000 pasos con AdamW y un learning rate de 2,5e-5. Con 4.143.404.816 parámetros y 9,4 GB de pesos en safetensors, es un modelo de gran tamaño para inferencia robótica en tiempo real, lo que condiciona seriamente su despliegue en hardware de consumo.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de cómo LeRobot permite adaptar un VLA de propósito general a una tarea concreta con datos propios, y como política directamente ejecutable en un UR5 mediante `lerobot-rollout`. La licencia Apache 2.0 facilita su reutilización comercial, aunque no se han publicado evaluaciones de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, implementada en LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,4 GB) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | UR5 (brazo con ventosa) |
| Entradas | `observation.images.camera` (3, 480, 640) + `observation.state` (7,) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | SamerAyyad/VLA_Samer_04.11.2026_500eps (500 episodios, 322.402 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalización en entornos abiertos. La implementación utilizada es la adaptación de LeRobot del repositorio OpenPI. El modelo combina un codificador visual (procesa imágenes de 3×480×640 píxeles de una cámara), un vector de estado del robot de 7 dimensiones y una cabeza de acción que emite comandos de 7 dimensiones. No se dispone de detalles sobre el número de tokens de entrenamiento del modelo base ni sobre la composición exacta de su dataset original.

El ajuste fino se realizó por imitación supervisada sobre 500 episodios de una única tarea ("Pick up the CPU with the suction gripper and place it in the box"), con 20.000 pasos, batch de 32, AdamW y learning rate de 2,5e-5, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; es aprendizaje por imitación puro. Tampoco se detallan innovaciones técnicas específicas del ajuste, más allá de las propias de π₀.₅ (generalización a entornos no vistos), que en este caso se aplican a un dominio muy estrecho.

## Capacidades

- Generación de acciones de control robótico de 7 dimensiones (posición/orientación y pinza) a partir de observaciones visuales y de estado.
- Percepción visual mediante una cámara RGB de 640×480 a 30 FPS.
- Ejecución de una tarea de manipulación concreta: recoger una CPU con ventosa y colocarla en una caja.
- Política de imitación entrenada para un robot UR5 con ventosa.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- **Automatización de una celda de picking en línea de montaje**: el modelo puede ejecutar la secuencia de recogida y depósito de CPUs en una caja sobre un UR5, sustituyendo a un operario en una estación repetitiva. Es adecuado porque está entrenado exactamente para esa tarea con 500 demostraciones.
- **Prototipado rápido de políticas VLA en laboratorio**: un equipo de robótica puede partir de `lerobot/pi05_base`, grabar sus propios episodios y ajustar una política en horas con `lerobot-train`, usando este modelo como referencia de configuración (20.000 pasos, batch 32, lr 2,5e-5).
- **Validación de pipelines de imitación con LeRobot**: sirve como caso de prueba de la versión 0.6.2 de LeRobot, verificando el flujo completo de grabación, entrenamiento, publicación en el Hub y despliegue con `lerobot-rollout`.
- **Investigación en generalización de VLA**: permite estudiar hasta qué punto π₀.₅ generaliza cuando se ajusta con un dataset pequeño y de una sola tarea, comparando el rendimiento en posiciones de objeto o iluminación ligeramente distintas.
- **Docencia y demostraciones de robótica de manipulación**: al ser un modelo apache-2.0 y estar integrado en LeRobot, es reutilizable en cursos y talleres para ilustrar el ciclo completo de una política de imitación.
- **Base para ajustes posteriores en tareas de ensamblaje**: el checkpoint puede servir como punto de partida para fine-tunings en tareas relacionadas (colocación de componentes, pick-and-place de piezas pequeñas) sobre el mismo UR5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4.143 millones de parámetros en safetensors (probablemente fp32 o bf16), se estima un consumo de aproximadamente 8-16 GB de VRAM en función de la precisión; el dato exacto de cuantización no está disponible.
- **GPU recomendadas**: para inferencia en tiempo real a 30 FPS se recomienda una GPU de datacenter (A100, H100) o una consumer de gama alta (RTX 4090, 24 GB). No se dispone de mediciones de latencia oficiales.
- **¿Cabe en consumer GPU?**: previsiblemente sí en una RTX 4090 o RTX 3090 (24 GB) en bf16, aunque no hay confirmación del autor ni cifras de VRAM medidas.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política VLA.
- **Latencia y throughput**: no disponibles. La tasa de control del dataset es de 30 FPS, pero no se confirma que el modelo alcance esa frecuencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_Pi05 | 4.143 M | no disponible | Pick-and-place CPU con UR5 | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base | no disponible | Hugging Face (modelo base) |
| Políticas ACT / Diffusion Policy en LeRobot | típicamente < 100 M | no disponible | Imitación por tarea | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| OpenVLA (referencia) | ~7.000 M | no disponible | VLA generalista | no disponible en esta ficha | no disponible |

La comparación con `lerobot/pi05_base` es directa: este modelo es un ajuste fino del base para una tarea concreta. Frente a políticas más ligeras como ACT o Diffusion Policy, π₀.₅ ofrece mayor capacidad de generalización pero con un coste computacional mucho mayor (4.143 M frente a decenas de millones de parámetros). No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- **Sesgos**: no documentados, pero al entrenarse con un único operador, una única cámara y una única configuración de robot, hereda los sesgos de ese entorno (posiciones, iluminación, fondo, estilo de demostración).
- **Riesgo de alucinación**: en políticas VLA se traduce en acciones incorrectas o inseguras cuando la escena difiere de las demostraciones; sin evaluación publicada no se puede cuantificar.
- **Limitación de tarea**: entrenado exclusivamente para "recoger la CPU con ventosa y colocarla en la caja"; no generaliza a otras tareas sin reentrenamiento.
- **Limitación de contexto e idioma**: no aplica como modelo de texto; no se documentan idiomas ni ventana de contexto.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el método π₀.₅ de Physical Intelligence deben verificarse por separado; la model card no aclara la licencia del base.
- **Caveat de producción**: cero descargas y cero likes en el Hub, sin evaluación en robot real, sin vídeo de demostración y sin métricas de éxito. No es recomendable para producción sin validación propia.
- **Hardware**: 9,4 GB de pesos y 4.143 M de parámetros implican requisitos de GPU elevados para control en tiempo real; no se confirma que alcance los 30 FPS del dataset.
- **Reproducibilidad**: se documentan semilla (1000) y versión de LeRobot (0.6.2), lo que facilita reproducir el entrenamiento, pero no se publican curvas de pérdida ni checkpoints intermedios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_Pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_04.11.2026_500eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_04.11.2026_500eps
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
