# nepyope/pi05-can-to-martino-8k

## Resumen

El modelo `nepyope/pi05-can-to-martino-8k` es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, desarrollado por el usuario de Hugging Face nepyope (Martino Russi). Se trata de una política de visión-lenguaje-acción (VLA) entrenada para controlar un robot humanoide Unitree G1 en una tarea concreta: recoger una lata de una mesa baja y entregarla a una persona. El modelo se publica con el objetivo de servir como contrapartida directa de otro checkpoint del mismo autor (`pi05-tshirt-staircase-8k`), con la diferencia de que este no utiliza el esquema de entrenamiento en escalera (staircase) de πR², sino el objetivo estándar de flow-matching.

La arquitectura es la de pi0.5, un modelo VLA que combina un codificador de visión, un modelo de lenguaje (VLM) y un experto de acción. El checkpoint tiene 4.143.474.482 parámetros totales (4,14 B), de los cuales solo 693 M se entrenan durante el ajuste fino (el VLM queda congelado). La ventana de contexto no se especifica en la información disponible. El modelo se publica con la librería LeRobot y está pensado para ser ejecutado con la herramienta `lerobot-rollout` sobre un robot Unitree G1 con pinzas Damiao CAN en ambas manos.

Relevancia: es un ejemplo práctico de fine-tuning de un VLA de última generación sobre datos de teleoperación de cuerpo completo, y documenta de forma transparente las limitaciones de latencia y los requisitos de inferencia en tiempo real. Su valor radica en servir como caso de estudio para quienes despliegan políticas robóticas en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA, transformer con flow-matching, experto de acción + VLM) |
| Parámetros totales | 4.143.474.482 (4,14 B) |
| Parámetros activos | 693 M (solo el experto de acción; VLM congelado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0.5, un VLA que combina un codificador de visión, un modelo de lenguaje y un experto de acción (policy head) que genera secuencias de acciones mediante un objetivo de flow-matching. En este fine-tune se congela el VLM y se entrena únicamente el experto de acción (`train_expert_only=true`). La dimensión de acción es 66 (64 articulaciones + 2 pinzas), mientras que la dimensión de estado es 31 (29 DOF + 2 pinzas), rellenada a `max_state_dim=32`.

El entrenamiento se realizó sobre el dataset `nepyope/can_to_martino`, que contiene 44 episodios de teleoperación (98.516 frames a 50 fps) con 3 cámaras (ego_view, left_wrist, right_wrist) a resolución 480×640. Se usó un chunk de 50 acciones (1 segundo de movimiento a 50 fps). El entrenamiento duró 8000 pasos (10,4 épocas) con un lote de 128 (32×4 GPUs), optimizador AdamW (LR 1e-4, weight decay 1e-4), decaimiento coseno hasta 1e-5 y 500 pasos de warm-up. Se ejecutó en un nodo con 4×H100 de 80 GB, con un throughput de 48 muestras/s y 2,69 s/paso. El autor indica que la pérdida se estancó en 0,031 hacia el final, convergida.

## Capacidades

- Manipulación robótica de cuerpo completo: controla las 64 articulaciones del Unitree G1 más 2 pinzas (66 dimensiones de acción).
- Tarea específica: recoger una lata de una mesa baja y entregarla a una persona (tarea "Move the can from the low table to Martino").
- Generación de acciones en ventanas de 1 segundo (chunk de 50 frames a 50 fps).
- Procesamiento de imágenes de 3 cámaras (ego, muñeca izquierda y muñeca derecha) a 480×640.
- No soporta tool calling ni capacidades de agente conversacional; es una política puramente robótica.
- No tiene modo de razonamiento explícito; es un modelo de control directo.

## Casos de uso

- Manipulación robótica en entornos domésticos: el modelo puede servir como base para tareas de recogida y entrega de objetos, adaptándose a otras configuraciones con datos de teleoperación adicionales.
- Investigación en aprendizaje por imitación: como checkpoint de referencia para comparar el efecto de diferentes objetivos de entrenamiento (flow-matching vs. staircase) en tareas similares.
- Desarrollo de políticas de cuerpo completo en robots humanoides: el modelo demuestra el control simultáneo de torso, brazos y pinzas en un Unitree G1, útil para estudiar coordinación.
- Evaluación de inferencia en tiempo real: la documentación detalla cómo usar el modo RTC (Real-Time Control) con `execution_horizon=20` para ocultar la latencia de 272 ms por llamada, un caso práctico para sistemas de control con requisitos de tiempo real.
- Comparación de hiperparámetros: el autor proporciona el comando de entrenamiento completo, útil para reproducir el pipeline y ajustar hiperparámetros en otras tareas.
- Prueba de despliegue con `lerobot-rollout`: sirve como ejemplo para validar la integración de LeRobot con robots Unitree G1 y pinzas CAN, tanto en modo sincrónico como asíncrono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de entrenamiento (sin split de validación) y la norma del gradiente:

| Época | Pérdida | Norma del gradiente |
|---|---|---|
| 0,06 | 1,241 | 0,289 |
| 1,69 | 0,064 | 0,148 |
| 3,31 | 0,047 | 0,081 |
| 4,94 | 0,040 | 0,061 |
| 6,56 | 0,034 | 0,053 |
| 8,19 | 0,033 | 0,047 |
| 10,39 | 0,031 | 0,044 |

El autor advierte que esta pérdida es de entrenamiento y que no hay split de validación; solo un rollout en bucle cerrado puede determinar la calidad real.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica, pero el entrenamiento usó 39,9 GB por GPU en 4×H100, por lo que se recomienda al menos una GPU con 40 GB de VRAM para inferencia en bf16.
- GPU recomendadas: H100 80 GB (entrenamiento), A100 80 GB o similar para inferencia.
- No cabe en GPU de consumo como RTX 4090 (24 GB) sin cuantización, y no se documenta cuantización disponible.
- Opciones de despliegue: `lerobot-rollout` con LeRobot, tanto en modo síncrono como con RTC (Real-Time Control) para inferencia en tiempo real.
- Latencia: una llamada síncrona de `sample_actions` tarda ~272 ms, lo que equivale a 13,6 ticks de control a 50 fps; el modo RTC con `execution_horizon=20` oculta esa latencia.
- Throughput: 48 muestras/s en entrenamiento (4×H100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| `nepyope/pi05-can-to-martino-8k` (este) | 4,14 B total, 693 M activos | no disponible | Recoger lata y entregar a persona | flow-matching estándar, 8000 pasos | no disponible |
| `nepyope/pi05-tshirt-staircase-8k` | 4,14 B total (estimado) | no disponible | Manipulación de ropa (t-shirt pick-and-place) | staircase πR², 8000 pasos | no disponible |
| `lerobot/pi05_base` | 4,14 B | no disponible | Pre-entrenamiento general VLA | Pre-entrenamiento en 10k+ horas de datos | no disponible |

El modelo se compara directamente con el checkpoint de `pi05-tshirt-staircase-8k` del mismo autor, con hiperparámetros idénticos pero con objetivo de entrenamiento distinto. La pérdida final de este modelo (0,031) es menor que la reportada para la tarea de ropa (0,073), lo que el autor atribuye a la menor multimodalidad de la tarea de la lata, no a una mejor política.

## Limitaciones y advertencias

- Licencia no disponible: no se indica ninguna licencia, por lo que el uso comercial o la redistribución no están claramente permitidos. Debe contactarse con el autor antes de usarlo en producción.
- Sin datos de idiomas: el modelo no documenta idiomas; es una política robótica, no un modelo de lenguaje.
- Sin cuantizaciones: no se ofrecen versiones cuantizadas, lo que limita su despliegue en hardware de gama baja.
- Sin contexto de ventana especificado: la información sobre la longitud de contexto del VLM no está disponible.
- Riesgo de alucinación en acción: como toda política VLA, puede producir acciones erróneas en situaciones no vistas; el autor indica que la pérdida de entrenamiento no garantiza calidad en rollout.
- Dependencia del framerate: el modelo está entrenado para 50 fps; ejecutarlo a otra frecuencia degrada el rendimiento (por ejemplo, a 30 fps se ejecuta 1,67× más lento).
- No soporta ciertos modos de inferencia: no es compatible con `--inference.type=pir2` ni con `--inference.rtc.mode=trained`; requiere un checkpoint diferente para esas funcionalidades.
- Sin validación en bucle cerrado: no se han publicado resultados de evaluación en hardware real, solo pérdida de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nepyope/pi05-can-to-martino-8k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/nepyope/can_to_martino
- Checkpoint comparativo: https://huggingface.co/nepyope/pi05-tshirt-staircase-8k
- Perfil del autor: https://huggingface.co/nepyope
- Repositorio GitHub del autor: https://github.com/nepyope/
