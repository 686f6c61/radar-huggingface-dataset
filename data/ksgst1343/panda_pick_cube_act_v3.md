# ksgst1343/panda_pick_cube_act_v3

## Resumen

`ksgst1343/panda_pick_cube_act_v3` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo lo publica el usuario ksgst1343 en Hugging Face Hub y se ha entrenado y subido mediante la librería LeRobot de Hugging Face. Su propósito concreto es ejecutar la tarea "pick_cube" (recoger un cubo) con un brazo robótico Panda, a partir de dos cámaras y del estado articular del robot.

La política consume dos flujos visuales de 128x128 píxeles (cámara frontal y cámara de muñeca) junto con un vector de estado de 18 dimensiones, y emite un vector de acción de 4 dimensiones. El modelo tiene 51.678.852 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real en hardware de consumo.

Es relevante ahora como ejemplo de flujo de trabajo completo de robótica de código abierto: dataset, entrenamiento y política publicados de forma reproducible con LeRobot. No obstante, se trata de un modelo experimental de un autor individual, con solo 30 episodios de entrenamiento y sin resultados de evaluación publicados, por lo que debe considerarse una demostración y no una política lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.678.852 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robótica por imitación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.images.front` (3, 128, 128), `observation.images.wrist` (3, 128, 128), `observation.state` (18,) |
| Salidas | `action` (4,) |
| Tarea | pick_cube |
| Dataset de entrenamiento | ksgst1343/panda_pick_cube_v3 (30 episodios, 1118 frames, 10 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador de imágenes (procesa las dos vistas de cámara) con un transformer que fusiona las representaciones visuales y el estado del robot para predecir un chunk de acciones futuras. Predecir secuencias de acciones en lugar de pasos aislados reduce el error de composición acumulado y mitiga el problema de la no estacionariedad en el entrenamiento por imitación, lo que se traduce en trayectorias más suaves y mayor tasa de éxito en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.1 durante 10.000 pasos, con batch size 8, optimizador AdamW y learning rate 1e-05, partiendo de un dataset de teleoperación de 30 episodios y 1.118 frames grabados a 10 FPS para la tarea "pick_cube". No se dispone de información sobre aumentos de datos, regularización temporal, número exacto de tokens de entrenamiento ni sobre el robot concreto utilizado más allá de la referencia al entorno Panda. Tampoco se documenta el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento supervisado.

## Capacidades

- Control robótico por imitación para la tarea específica "pick_cube" con un brazo Panda.
- Fusión multimodal de dos cámaras (frontal y muñeca) más el estado articular del robot.
- Predicción de chunks de acciones de 4 dimensiones, lo que permite movimientos más estables que la predicción paso a paso.
- Ejecución en tiempo real a través de `lerobot-rollout` con la estrategia base.
- Entrenamiento reproducible desde el dataset asociado mediante `lerobot-train`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de modo de razonamiento, capacidades multilingües, visión general, audio ni agentes multi-paso.
- No se documentan capacidades de generalización a otras tareas, objetos o posiciones distintas de las del dataset.

## Casos de uso

- Recogida de un cubo con un brazo Panda en un entorno controlado: la política ejecuta la tarea "pick_cube" a partir de las dos cámaras y el estado articular, adecuada para demostraciones de laboratorio y validación de pipelines de imitación.
- Reproducción de experimentos de aprendizaje por imitación: sirve como referencia para comparar configuraciones de entrenamiento ACT con LeRobot 0.6.1 y el dataset publicado.
- Base para fine-tuning con datos propios: al ser una política ligera (51,7 M de parámetros) y con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre nuevos datasets de teleoperación.
- Docencia y formación en robótica: ejemplo completo y de bajo coste computacional del ciclo grabar dataset, entrenar política y desplegar en robot.
- Pruebas de integración de LeRobot: útil para validar la instalación, la configuración de cámaras y el flujo `lerobot-rollout` antes de abordar proyectos mayores.
- Prototipado de manipulación pick-and-place: punto de partida para extender la tarea a otros objetos o posiciones añadiendo episodios al dataset y reentrenando.
- Benchmark interno de latencia y throughput: al ser un modelo pequeño, permite medir el rendimiento del hardware de inferencia en un caso de robótica realista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, la huella de pesos en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060, RTX 4060 o superior es suficiente; también cabría en GPUs de gama de entrada y en CPU para pruebas no críticas.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros y el tamaño del repositorio (0,2 GB).
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 10 FPS, pero no se publica la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ksgst1343/panda_pick_cube_act_v3 | 51,7 M | pick_cube (Panda) | no aplica | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | manipulación genérica | no aplica | Apache 2.0 | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | manipulación genérica | no aplica | Apache 2.0 | Hugging Face Hub / LeRobot |
| Políticas VQ-BeT (LeRobot) | no disponible | manipulación genérica | no aplica | Apache 2.0 | Hugging Face Hub / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenada con solo 30 episodios y 1.118 frames: alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación u objetos distintos.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Específica de la tarea "pick_cube" y de un robot tipo Panda con dos cámaras concretas; no es una política generalista.
- Requiere que los nombres y la resolución de las cámaras coincidan con las claves de observación del entrenamiento (`front`, `wrist`, 128x128) y que el estado tenga 18 dimensiones.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de ejecutar acciones incorrectas o inseguras ante distribuciones de entrada fuera del dataset.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgo hacia las condiciones del entorno de grabación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Publicada por un autor individual con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificables.
- No apta para producción sin una evaluación exhaustiva en el robot y entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ksgst1343/panda_pick_cube_act_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/ksgst1343/panda_pick_cube_v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ksgst1343/panda_pick_cube_v3
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
