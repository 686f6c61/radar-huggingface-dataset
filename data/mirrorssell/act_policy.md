# mirrorssell/act_policy

## Resumen

`mirrorssell/act_policy` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado originalmente por Zhao et al. en 2023 (arXiv:2304.13705). El modelo ha sido entrenado y empaquetado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales, y está pensado para controlar un brazo robótico de tipo `so102_follower` equipado con una única cámara de muñeca (`cam_wrist`). Su cometido concreto es ejecutar la tarea "placing dice" (colocar dados), aprendida a partir de 28 episodios de teleoperación.

Técnicamente es un transformer relativamente pequeño: 51.670.663 parámetros en formato safetensors, con un repositorio de apenas 0,2 GB. Consume un vector de estado de 7 dimensiones y una imagen RGB de 480x640, y produce acciones de 7 dimensiones a 30 FPS. No es un modelo de lenguaje ni un modelo multimodal generalista: es una política de control motor entrenada sobre un dataset muy específico y con una única tarea.

Su relevancia es la de un ejemplo canónico de flujo de trabajo LeRobot de extremo a extremo: recogida de datos con un robot SO-102, entrenamiento de ACT durante 10.000 pasos y publicación en el Hub. Resulta útil como referencia para quien quiera replicar el pipeline, pero no como política generalizable: el modelo está sobreajustado a la tarea y al montaje concreto con el que se grabaron los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de imitación con encoder visual y decoder de acciones por chunks |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación en robótica. El encoder procesa la observación (estado propioceptivo de 7 dimensiones más la imagen de la cámara de muñeca de 3x480x640) y el decoder genera un chunk de acciones futuras de 7 dimensiones en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. La implementación concreta es la de LeRobot 0.6.0.

El entrenamiento se realizó sobre el dataset `mirrorssell/dice_place2`: 28 episodios, 26.605 frames a 30 FPS, tarea "placing dice". La configuración reportada es de 10.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje por imitación supervisado puro a partir de demostraciones teleoperadas. No se especifica el número de tokens ni composición de datos adicional, ya que no aplica a este tipo de modelo.

## Capacidades

- Control motor de un brazo `so102_follower` con 7 grados de libertad (vector de acción de 7 dimensiones).
- Percepción visual monocular a través de una única cámara de muñeca (`observation.images.cam_wrist`, 3x480x640).
- Predicción de chunks de acciones a 30 FPS para la tarea "placing dice".
- Ejecución autónoma de la política mediante `lerobot-rollout` con estrategia base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación del pipeline LeRobot de extremo a extremo: sirve como referencia para grabar un dataset propio, entrenar ACT y desplegar la política en un SO-102, siguiendo los comandos documentados en la model card.
- Tarea de pick-and-place de dados: la política ejecuta "placing dice" sobre el montaje concreto con el que fue entrenada, útil como banco de pruebas de manipulación básica.
- Evaluación de infraestructura de inferencia robótica: al ser un modelo pequeño (51,7 M de parámetros, 0,2 GB), permite validar latencias y cadencias de control a 30 FPS en hardware modesto antes de escalar a políticas mayores.
- Docencia y formación en aprendizaje por imitación: ejemplo mínimo y reproducible de ACT con un dataset de 28 episodios y configuración de entrenamiento documentada.
- Base para fine-tuning sobre nuevas tareas: el checkpoint puede reentrenarse con `lerobot-train` sobre datasets propios del mismo tipo de robot y cámara.
- Comparación de métodos de imitación: sirve como línea base ACT frente a otras políticas (Diffusion Policy, VQ-BeT, etc.) en el mismo montaje experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía) y no incluye métricas de MMLU, HumanEval, GSM8K ni equivalentes, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors el modelo ocupa del orden de 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100); no se requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en cualquier modelo con soporte CUDA, e incluso en CPU para inferencia a baja cadencia (no documentado).
- Opciones de despliegue: `lerobot-rollout` (estrategia base) para ejecución en robot; `lerobot-train` para reentrenamiento con `--policy.device=cuda`.
- Latencia y throughput: no disponibles; la cadencia de control objetivo es 30 FPS según el dataset de entrenamiento, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mirrorssell/act_policy | 51,7 M | no aplica | placing dice (SO-102, cam_wrist) | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy (referencia metodológica) | no disponible | no aplica | imitación visomotora genérica | no disponible | paper y repos públicos |
| Otras políticas LeRobot ACT en el Hub | variable | no aplica | tareas diversas | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sobreajuste a la tarea y al montaje: entrenada solo con 28 episodios de "placing dice" sobre un `so102_follower` con cámara `cam_wrist`; no se espera generalización a otras tareas, objetos, posiciones, iluminación o robots.
- Sin evaluación publicada: la model card no reporta tasa de éxito en robot real, por lo que no hay evidencia cuantitativa de robustez.
- Dependencia del hardware exacto: los nombres de cámara y la configuración de observación deben coincidir con los del entrenamiento (`observation.state` de 7 dimensiones y `observation.images.cam_wrist` de 3x480x640).
- Riesgo de fallo silencioso: al ser una política de imitación, puede ejecutar acciones incorrectas sin señal de error; requiere supervisión y parada de emergencia en producción.
- Sesgos: no documentados; en robótica de imitación los sesgos provienen de las demostraciones (posiciones, velocidades, objetos) y no se han caracterizado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene citar el paper de ACT y LeRobot según la model card.
- Idiomas y contexto: no aplica; no es un modelo lingüístico y no debe evaluarse con métricas de NLP.
