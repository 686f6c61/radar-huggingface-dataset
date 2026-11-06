# lukelu33/robomimic-diffusion-policy

## Resumen

`lukelu33/robomimic-diffusion-policy` es un repositorio de checkpoints de Diffusion Policy, una política de imitación basada en modelos de difusión para control robótico. Lo publica el usuario lukelu33 y contiene dos políticas entrenadas con robomimic 0.5.0 sobre las tareas `Lift` y `PickPlaceCan` del benchmark RoboMimic, usando observaciones de baja dimensión (estados del robot y del objeto, sin imágenes) de los datasets `ph` (proficient-human) v1.5.

No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal: es un artefacto de investigación en aprendizaje por imitación para manipulación robótica. Cada checkpoint corresponde a un entrenamiento de 2000 épocas con semilla 1, y el autor reporta una tasa de éxito de 0,98 en ambas tareas evaluadas sobre 50 episodios. El robot simulado es un Franka Panda con controlador delta `OSC_POSE` a 20 Hz.

Su relevancia es acotada pero práctica: sirve como referencia reproducible de Diffusion Policy sobre robomimic y como punto de partida para experimentos de imitación en entornos simulados. El repositorio pesa 2,1 GB, no declara licencia ni idiomas, y no incluye pesos en formato estándar de HuggingFace sino checkpoints pickled de PyTorch de aproximadamente 1 GB cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy con backbone UNet (denoising diffusion para acciones) |
| Parametros totales | no disponible (checkpoints de ~1 GB cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de predicción de acciones no especificado en la información disponible) |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch pickled (`.pth`), cargable con `robomimic.utils.file_utils.policy_from_checkpoint` |

## Arquitectura y entrenamiento

Diffusion Policy formula el control como un problema de generación condicionada: la política aprende a denoising una secuencia de acciones a partir de ruido gaussiano, condicionada por la observación del estado. El backbone es una UNet, habitual en esta familia de métodos, y el entrenamiento se realiza por imitación sobre demostraciones humanas. En este caso, las observaciones son de baja dimensión (sin visión), lo que reduce el coste computacional frente a variantes con imágenes.

Los datos provienen de los datasets `ph` v1.5 de robomimic, que contienen demostraciones de operadores humanos competentes en las tareas `Lift` y `PickPlaceCan`. Ambos entrenamientos usaron 2000 épocas y semilla 1, con robomimic 0.5.0. El controlador es `OSC_POSE` (operational space control en espacio de pose) a 20 Hz sobre un Panda. No se documenta en la información disponible el número de demostraciones, el tamaño del batch, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como data augmentation o ensamblado de políticas.

## Capacidades

- Generación de trayectorias de acción para manipulación robótica en las tareas `Lift` (levantar un cubo) y `PickPlaceCan` (recoger y colocar una lata).
- Control a partir de observaciones de baja dimensión (estado proprioceptivo y del objeto), sin entrada visual.
- Ejecución a 20 Hz con controlador `OSC_POSE` sobre un Franka Panda en simulación.
- Política de imitación entrenada por difusión, adecuada para escenarios con multimodalidad en las acciones (múltiples formas válidas de completar una tarea).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión, audio ni ninguna capacidad generativa de texto.

## Casos de uso

- Reproducción de resultados de Diffusion Policy: cargar los checkpoints con `policy_from_checkpoint` y evaluar las tasas de éxito reportadas (0,98 en `Lift` y `PickPlaceCan`) para validar el pipeline de robomimic 0.5.0 en un entorno controlado.
- Baseline para investigación en imitación: comparar nuevas políticas (por ejemplo, ACT, VQ-BeT o variantes de diffusion con visión) contra estos checkpoints en las mismas tareas y con el mismo controlador.
- Estudio de robustez y multimodalidad: analizar cómo la política de difusión maneja distribuciones multimodales de acciones en tareas de pick-and-place, usando las rollouts publicadas en la rama `diffusion` del repositorio q2rl.
- Docencia y formación en robótica: ejemplo práctico de entrenamiento por imitación con robomimic, útil para cursos que cubran diffusion policies y control en espacio operacional.
- Punto de partida para fine-tuning: adaptar los checkpoints a variaciones de las tareas (distintas posiciones iniciales, objetos o controladores) mediante reentrenamiento con nuevos datasets `ph`.
- Pruebas de infraestructura de simulación: validar pipelines de simulación a 20 Hz con `OSC_POSE` y medir latencia de inferencia de la política de difusión en distintas GPUs.
- Integración en bucles de evaluación automatizada: usar los checkpoints como política fija en un harness de evaluación de entornos robóticos para medir reproducibilidad entre ejecuciones.

## Benchmarks y rendimiento

| Tarea | Entorno | Checkpoint | Tasa de éxito (50 episodios) |
|---|---|---|---|
| Lift | `Lift` | `lift/model_epoch_2000.pth` | 0,98 |
| Can | `PickPlaceCan` | `can/model_epoch_2000.pth` | 0,98 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; cada checkpoint pesa aproximadamente 1 GB, por lo que la inferencia cabe holgadamente en GPUs consumer con 8 GB o más, asumiendo carga en FP32.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento desde cero, se recomienda A100 o superior por el coste de 2000 épocas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más, dado el tamaño reducido de los pesos y la ausencia de entrada visual.
- Opciones de despliegue: robomimic 0.5.0 con PyTorch; carga mediante `robomimic.utils.file_utils.policy_from_checkpoint`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El control opera a 20 Hz, lo que impone un límite superior de 50 ms por paso de control, pero no se reportan mediciones reales de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Observaciones | Tasa de éxito reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lukelu33/robomimic-diffusion-policy` | Diffusion Policy (UNet) | `Lift`, `PickPlaceCan` | Baja dimensión | 0,98 en ambas | no disponible | HuggingFace |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy (UNet/Transformer) | Múltiples (Push-T, Robomimic, etc.) | Baja dimensión e imagen | Resultados publicados en paper | Código abierto (MIT en el repo oficial) | GitHub oficial |
| ACT (Zhao et al., 2023) | Transformer con action chunking | Tareas bimanuales (ALOHA) | Imagen | Resultados en paper | Código abierto | GitHub |
| VQ-BeT (Lee et al., 2024) | Transformer con cuantización vectorial | Robomimic y otros | Baja dimensión e imagen | Resultados en paper | Código abierto | GitHub |

La comparativa se limita a familias metodológicas porque no se dispone de otros checkpoints directamente comparables con idénticas condiciones de entrenamiento (2000 épocas, semilla 1, datasets `ph` v1.5) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor; el repositorio no incluye términos legales.
- Checkpoints en formato pickled de PyTorch: la carga ejecuta código Python arbitrario, por lo que solo deben cargarse desde fuentes de confianza, tal como advierte el propio autor.
- Entrenados exclusivamente sobre observaciones de baja dimensión: no funcionan con entrada visual sin reentrenamiento.
- Específicos de dos tareas (`Lift` y `PickPlaceCan`) y de un robot concreto (Panda con `OSC_POSE` a 20 Hz): no generalizan a otras tareas, robots o controladores.
- Tasa de éxito medida en simulación con 50 episodios: la varianza estadística es apreciable y no hay garantía de transferencia a un robot real (sim-to-real no documentado).
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo esperado en imitación; el riesgo principal es la degradación del rendimiento ante estados no vistos.
- No se documenta el número de demostraciones ni la composición exacta de los datasets, lo que dificulta la reproducibilidad completa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- HuggingFace: https://huggingface.co/lukelu33/robomimic-diffusion-policy
- Rollouts y resumen en la rama `diffusion` de q2rl: https://github.com/lakshitadodeja/q2rl/tree/diffusion/results/diffusion_policy
- Repositorio de robomimic (libería de carga): https://github.com/ARISE-Initiative/robomimic
- Paper de Diffusion Policy: no disponible en la información proporcionada
- Demo o Space oficial: no disponible
