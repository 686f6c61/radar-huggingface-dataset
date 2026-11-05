# mysterium99/smolvla_stage2c_complexity_1_to_ds1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico de bajo coste computacional. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_1_to_ds1`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds1`, orientado a una única tarea de manipulación: tomar un componente de hardware de manos de un humano y depositarlo en una zona delimitada con cinta.

El modelo combina percepción visual (tres cámaras a 256x256) con el estado proprioceptivo del robot (vector de 6 dimensiones) para producir acciones continuas de 6 dimensiones. Con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que quieren prototipar políticas de imitación sin infraestructura de datacenter.

La relevancia actual del modelo radica en su enfoque: en lugar de escalar parámetros, SmolVLA demuestra que un VLA pequeño, entrenado con imitación sobre datos teleoperados, puede ser competitivo en tareas concretas de manipulación. Esta variante es un artefacto de investigación con 20.000 pasos de entrenamiento, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, según el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | follow |
| Camaras | gripper, newtop, newside (3 entradas visuales de 3x256x256) |
| Estado de observacion | vector de 6 dimensiones |
| Salida de accion | vector de 6 dimensiones |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que fusiona un codificador visual, un codificador de lenguaje y un decodificador de acciones en una arquitectura transformer compacta. El modelo consume tres flujos de imagen (cámara de pinza, vista superior y vista lateral) junto con el estado proprioceptivo del robot, y emite directamente un vector de acción de 6 dimensiones. La arquitectura sigue la descripción del paper SmolVLA (arXiv:2506.01844), que propone un VLA eficiente capaz de desplegarse en hardware de consumo manteniendo un rendimiento competitivo frente a modelos más grandes.

El entrenamiento de esta variante se realizó por imitación supervisada sobre el dataset `ds1`: 50 episodios, 22.710 frames a 30 FPS, con una única tarea ("Take hardware from human and put in taped area"). La configuración reportada incluye 20.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-4, semilla 0 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni otras fases de alineación posteriores; es un fine-tuning directo del modelo base preentrenado.

## Capacidades

- Control robótico de manipulación: genera acciones continuas de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa tres vistas simultáneas (pinza, superior y lateral) a resolución 256x256.
- Condicionamiento por tarea en lenguaje natural: acepta una descripción textual de la tarea como entrada (por ejemplo, "Take hardware from human and put in taped area").
- Política de imitación entrenada para una tarea específica de recogida y colocación de hardware.
- Ejecución en hardware de consumo, según las afirmaciones del paper SmolVLA sobre eficiencia computacional.
- Integración con el ecosistema LeRobot para rollout, entrenamiento y evaluación.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto general ni procesamiento de audio.

## Casos de uso

- Prototipado de políticas de imitación en laboratorio: el modelo sirve como punto de partida para experimentar con fine-tuning sobre nuevos datasets de teleoperación, usando `lerobot-train` con `lerobot/smolvla_base` como base y sustituyendo `ds1` por datos propios.
- Automatización de una celda de recogida y entrega: la política está entrenada para recibir un componente de hardware de un operario humano y depositarlo en una zona marcada, un escenario típico de línea de montaje ligera o kitting.
- Validación de pipelines de robot learning: al ser un artefacto pequeño (0,9 GB) y con licencia Apache 2.0, es adecuado para probar flujos completos de LeRobot (grabación, entrenamiento, rollout) antes de escalar a modelos mayores.
- Investigación en eficiencia de VLAs: permite reproducir y comparar el comportamiento de un VLA de 450M parámetros frente a alternativas más grandes en tareas de manipulación concretas.
- Benchmarking de hardware de consumo para robótica: útil para medir latencia y throughput de inferencia de un VLA compacto en GPUs de gama media o en sistemas embebidos con acelerador.
- Educación y demos: la simplicidad de la tarea y el bajo requisito de recursos lo hacen apropiado para demostraciones docentes de imitación visual-motora con LeRobot.
- Base para experimentos de generalización: al estar fine-tuneado sobre solo 50 episodios, sirve para estudiar sobreajuste y transferencia a variaciones de posición, iluminación o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se ha medido la tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parámetros en safetensors (fp32/bf16) el peso ronda 0,9-1,8 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia, y una RTX 4090 o A100 acelera el entrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y CUDA mediante `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles; dependen del robot, las cámaras y la GPU, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_1_to_ds1 | 450M | no disponible | Manipulación (tarea única) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base preentrenado | Apache 2.0 (según modelo base) | Hugging Face |
| Políticas de imitación tipo ACT/DP de LeRobot | no disponible | no disponible | Manipulación | según variante | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un único dataset de 50 episodios y una sola tarea; la generalización a otras tareas, objetos o entornos es altamente improbable sin fine-tuning adicional.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Sensible a cambios en la configuración de cámaras: los nombres y la disposición (`gripper`, `newtop`, `newside`) deben coincidir con los usados en el entrenamiento.
- Riesgo de sobreajuste a posiciones, iluminación y condiciones específicas del dataset `ds1`.
- No es un modelo de lenguaje general: no debe usarse para generación de texto, código o razonamiento; su salida es un vector de acción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción requiere validación propia.
- No se documentan sesgos, pero al ser un modelo entrenado con datos teleoperados de un operador concreto, puede heredar sesgos de comportamiento de ese operador.
- El modelo se creó y actualizó en noviembre de 2026 según los metadatos, con 0 descargas y 0 likes: es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_1_to_ds1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset ds1: https://huggingface.co/datasets/ds1
