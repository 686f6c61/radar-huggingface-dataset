# maedmatt/DREAM_SmolVLA_full

## Resumen

`maedmatt/DREAM_SmolVLA_full` es un modelo de visión-lenguaje-acción (VLA) compacto, desarrollado como fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `maedmatt/DREAM-pyramid-circles`. SmolVLA, presentado en el artículo arXiv 2506.01844, es una arquitectura diseñada por el equipo de Hugging Face LeRobot para ejecutar políticas robóticas de imitación en hardware de consumo, reduciendo el coste computacional frente a modelos VLA de gran tamaño como OpenVLA (7B parámetros). Este repositorio concreto implementa una política entrenada para la tarea "Fill the pyramid with circles" sobre un robot tipo `so_follower`, con tres cámaras RGB y una salida de acción de 6 dimensiones.

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors a través de la librería LeRobot. Su relevancia radica en que demuestra cómo un VLA de tamaño reducido puede ser fine-tuneado con un dataset relativamente pequeño (251 episodios, 134 782 frames) y desplegado en GPUs de gama media, lo que abre la puerta a la robótica de aprendizaje por imitación accesible para laboratorios y pequeñas empresas. La licencia Apache-2.0 permite uso comercial sin restricciones de atribución.

Al ser un modelo de acción robótica, no está pensado para generación de lenguaje general ni para tareas de chat; su función es convertir observaciones visuales y de estado en comandos de actuación para un brazo robótico. La ventana de contexto no está documentada en la información proporcionada, pero al tratarse de un modelo VLA basado en SmolVLM, se espera que maneje secuencias de imágenes y texto de forma eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en SmolVLM con head de acción) |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión original) |
| Idiomas soportados | No disponible (modelo de acción robótica, no de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (vía LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual (basado en el backbone de SmolVLM), un módulo de lenguaje y un head de regresión de acciones. El modelo base `lerobot/smolvla_base` fue preentrenado en tareas de manipulación y luego fine-tuneado aquí con el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 251 episodios de demostración a 30 FPS. El entrenamiento se realizó con LeRobot 0.6.2, usando el optimizador AdamW con una tasa de aprendizaje de 2e-5, batch size de 32 y 12 000 pasos. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación supervisado (behavior cloning).

La arquitectura procesa tres imágenes RGB de 256x256 píxeles (cámaras `camera1`, `camera2`, `camera3`) junto con un vector de estado de 6 dimensiones, y produce una acción de 6 dimensiones (probablemente posición y orientación del efector final). El modelo base SmolVLA destaca por su eficiencia: puede ejecutarse en GPUs de consumo sin necesidad de servidores dedicados, gracias a su tamaño reducido y a la optimización de la atención en el backbone.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa tres cámaras RGB simultáneamente, lo que permite manejar escenarios con múltiples puntos de vista.
- Fine-tuning rápido: al ser un modelo compacto, puede adaptarse a nuevas tareas con datasets de pocos cientos de episodios.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face LeRobot.
- Sin capacidades de lenguaje general: no soporta generación de texto, tool calling ni razonamiento conversacional.
- Sin capacidades de visión fuera del contexto robótico: no realiza detección de objetos genérica ni segmentación.

## Casos de uso

- Manipulación de objetos en entornos controlados: el modelo está entrenado para llenar una pirámide con círculos, una tarea que requiere coordinación visomotora y planificación de movimientos. Puede usarse como punto de partida para tareas similares de apilado o colocación.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para estudiar cómo los VLA compactos se comportan con datasets pequeños, comparando con modelos más grandes.
- Prototipado rápido de políticas robóticas: al poder fine-tunearse en pocas horas con una GPU consumer, es ideal para validar nuevas tareas antes de escalar a modelos mayores.
- Educación y demostraciones: su bajo coste computacional permite montar demostraciones en laboratorios universitarios o ferias tecnológicas sin infraestructura especializada.
- Base para fine-tuning en otros robots: aunque está entrenado para `so_follower`, el proceso de adaptación a otros brazos robóticos con configuraciones similares de cámaras puede ser directo mediante LeRobot.
- Evaluación de robustez visual: las tres cámaras permiten probar la tolerancia del modelo a cambios de iluminación, oclusiones o variaciones de fondo en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real para esta política. Tampoco se proporcionan comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, el modelo en fp32 ocupa aproximadamente 1.8 GB, y en fp16 alrededor de 0.9 GB. El tamaño del repositorio (0.9 GB) sugiere pesos en fp16 o BF16. Esto permite inferencia en GPUs con 4 GB de VRAM o más.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 6 GB de VRAM (GTX 1660 Super, RTX 2060, RTX 3060, etc.) puede ejecutar el modelo. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3070/3080 o superior) para manejar el batch de 32.
- Compatibilidad con hardware de consumo: sí, es el objetivo principal de SmolVLA.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También puede usarse con el framework de inferencia de LeRobot sobre PyTorch.
- Latencia y throughput: no disponibles en la documentación, pero al ser un modelo compacto se espera una frecuencia de control superior a 10 Hz en GPU consumer, suficiente para tareas de manipulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maedmatt/DREAM_SmolVLA_full` | 450M | No disponible | Robótica (llenar pirámide) | Apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | 450M | No disponible | Robótica general (preentrenado) | Apache-2.0 | Hugging Face |
| OpenVLA (base) | 7B | 8192 (tokens) | Robótica general | MIT | Hugging Face |

SmolVLA se diferencia de OpenVLA por su tamaño significativamente menor (450M vs 7B), lo que reduce los requisitos de hardware y el tiempo de inferencia, aunque a costa de menor capacidad de generalización a tareas complejas. El modelo base `lerobot/smolvla_base` es el mismo arquitectónicamente, pero sin el fine-tuning específico para la tarea de la pirámide. No se dispone de datos comparativos de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Entrenado para una única tarea: la política solo ha sido validada para "Fill the pyramid with circles"; no generaliza a otras tareas sin fine-tuning adicional.
- Sin evaluación en robot real: la model card no reporta tasas de éxito, por lo que el rendimiento real es desconocido.
- Dependencia de la configuración de cámaras: el modelo espera exactamente tres cámaras con las mismas posiciones y calibración que durante el entrenamiento. Cambios en la disposición física degradarán el rendimiento.
- Sesgo del dataset: los datos provienen de un único entorno y un único robot; la política puede no ser robusta a variaciones de iluminación, fondo o dinámica del robot.
- Sin soporte de lenguaje: no es un modelo de propósito general; intentar usarlo para tareas de NLP o visión clásica producirá resultados sin sentido.
- Licencia del dataset: aunque el modelo tiene licencia Apache-2.0, la licencia del dataset `maedmatt/DREAM-pyramid-circles` no se especifica en la información proporcionada; conviene verificarla antes de usar el modelo en aplicaciones comerciales.
- Fecha de creación futura: el repositorio fue creado en agosto de 2026, lo que puede indicar que es un artefacto de demostración o experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maedmatt/DREAM_SmolVLA_full
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- Documentación de LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guía de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
