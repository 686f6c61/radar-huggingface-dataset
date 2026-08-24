# learner1119/posco_pi05_260820_left_c20

## Resumen

El modelo `learner1119/posco_pi05_260820_left_c20` es una política de control robótico basada en el modelo π₀.₅ (Pi05), un Vision-Language-Action (VLA) de flujo continuo desarrollado por Physical Intelligence y adaptado a LeRobot. El autor, learner1119 (Doyoung Kim), ha entrenado esta política específicamente para la tarea de pick-and-place con el brazo izquierdo de un robot POSCO, usando un dataset propio de 100 episodios con 44.136 fotogramas. El modelo genera secuencias de 20 pasos de acción (chunk) a partir de observaciones de una cámara y del estado articular del robot.

Este modelo es relevante porque demuestra el uso de un VLA de última generación (π₀.₅) en un caso concreto de automatización industrial, y porque su implementación en LeRobot permite su integración en sistemas robóticos reales. Con 3.616.757.520 parámetros, es una arquitectura compacta para control de bajo nivel, aunque su entrenamiento se ha realizado sin partición de validación, lo que limita la fiabilidad de sus métricas de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en π₀.₅ (flow-matching) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un VLA basado en flujo (flow-matching) que combina un codificador visual (Paligemma) con un decodificador de acciones. Se entrena con datos heterogéneos de múltiples robots para lograr generalización en el mundo real, aunque este checkpoint concreto se ha ajustado sobre un dataset propio de un brazo izquierdo POSCO. El entrenamiento se realizó con LeRobot 0.4.3, con 50.000 pasos, batch de 32 y learning rate de 2.5e-05. Se eliminaron las dimensiones del brazo derecho porque en las grabaciones eran constantes (desviación estándar 0.0), lo que habría introducido ruido innecesario. La observación consiste en una imagen de cámara (agentview, 480x640) y el estado articular del brazo izquierdo (7 articulaciones + pinza), con una tasa de control de 20 Hz. La normalización se aplica mediante los procesadores `pre` y `post` de LeRobot, no dentro del modelo.

## Capacidades

- Control robótico de brazo izquierdo de 7 grados de libertad más pinza, generando secuencias de 20 acciones (1 segundo a 20 Hz).
- Percepción visual a través de una cámara fija, procesada por el codificador Paligemma.
- Ejecución de tareas de pick-and-place en un entorno industrial específico (POSCO).
- Integración con LeRobot: permite cargar y ejecutar la política mediante `PI05Policy.from_pretrained`.
- No soporta tool calling, funciones de agente, ni capacidades lingüísticas, ya que es un modelo de control motor, no de lenguaje general.
- No multilingüe ni de visión general; su alcance se limita a la tarea y robot para los que fue entrenado.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo puede sustituir la programación manual de trayectorias para recoger y colocar piezas en posiciones fijas, aprovechando su chunk de 20 acciones (1 s) y control a 20 Hz.
- Control de brazo robótico en entornos de laboratorio: útil para investigación en manipulación con VLA, permitiendo reproducir el pipeline de LeRobot con un dataset propio.
- Prototipado rápido de políticas de control: al estar integrado en LeRobot, se puede usar como punto de partida para fine-tuning con nuevos datos de la misma plataforma robótica.
- Evaluación de VLA en entornos industriales: sirve para probar la viabilidad de π₀.₅ en un entorno concreto y comparar con métodos tradicionales.
- Teleoperación y aprendizaje por demostración: el modelo aprende de demostraciones humanas y puede reproducir comportamientos similares en el mismo robot.
- Control de precisión en tareas repetitivas: la eliminación de dimensiones constantes (brazo derecho) reduce el ruido y mejora la estabilidad de la acción para la tarea específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no existe una partición de validación (se entrenó con todos los episodios sin split), por lo que no hay una métrica honesta de generalización. Solo se reporta la pérdida de entrenamiento como indicador de ajuste, pero no es comparable con otros modelos.

## Requisitos de hardware

- El modelo tiene 3,6B parámetros, por lo que en FP32 ocuparía unos 14 GB y en FP16 unos 7 GB. El repo pesa 7,5 GB, lo que sugiere pesos en FP16 o BF16.
- Para inferencia en tiempo real a 20 Hz, se recomienda una GPU con al menos 8 GB de VRAM (p. ej., RTX 3070 o superior). En GPUs más pequeñas, se podría usar cuantización, pero no se han publicado tipos de cuantización.
- No se indican opciones de despliegue específicas, pero al ser un modelo de LeRobot, se puede ejecutar con la biblioteca LeRobot en Python, con soporte para PyTorch y CUDA.
- No se han proporcionado datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `posco_pi05_260820_left_c20` (este) | 3,6B | no aplica | sin benchmarks | no disponible | HuggingFace |
| π₀ (base) | ~3B (según paper) | no aplica | generalización limitada | open-source (OpenPI) | GitHub |
| π₀.₅ (base) | ~3B (según paper) | no aplica | mejor generalización que π0 | open-source (OpenPI) | HuggingFace |
| OpenVLA | 7B | 32k tokens | Múltiples benchmarks | MIT | HuggingFace |

No hay comparación directa con este checkpoint, ya que es un ajuste específico para un dataset concreto. Los modelos base π₀.₅ y OpenVLA son alternativas generales, pero no se han evaluado en el mismo entorno.

## Limitaciones y advertencias

- Entrenado sin split de validación: no hay evidencia de generalización a nuevos datos; la pérdida de entrenamiento solo indica ajuste al dataset de entrenamiento.
- Específico para un robot y tarea concretos (POSCO, brazo izquierdo, pick-and-place). No funciona en otros robots o entornos sin reentrenamiento.
- No soporta instrucciones en lenguaje natural ni razonamiento semántico; solo control visual-motor.
- Licencia no disponible: no se puede verificar el uso comercial o las restricciones de redistribución.
- Riesgo de sobreajuste: con solo 100 episodios, la variabilidad del mundo real puede no estar capturada.
- La eliminación de las dimensiones del brazo derecho puede ser problemática si en el despliegue real ese brazo se mueve (aunque en el dataset era constante).
- El tokenizer de Paligemma está incluido en el repo, pero si se usara otro modelo base, sería necesario acceso al repo gated de Google.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/learner1119/posco_pi05_260820_left_c20
- Autor (learner1119): https://huggingface.co/learner1119
- Documentación de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Repo oficial de OpenPI: https://github.com/Physical-Intelligence/openpi
