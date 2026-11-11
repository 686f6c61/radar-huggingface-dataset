# nberezny/act_franka_pick_place_hyb_wp

## Resumen

`nberezny/act_franka_pick_place_hyb_wp` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub mediante la librería LeRobot. El modelo resuelve una tarea robótica concreta de manipulación: coger un cubo rojo y colocarlo sobre un cuadrado azul. Está entrenado sobre un robot `franka_panda_sim_hybrid_wp` con dos cámaras (`overhead` y `wrist`) y una observación de estado de 17 dimensiones, produciendo acciones de 11 dimensiones.

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce errores de composición y suele alcanzar tasas de éxito altas a partir de datos de teleoperación. Este checkpoint concreto cuenta con 51.583.627 parámetros y un tamaño de repositorio de 0,4 GB, con pesos en formato safetensors.

El modelo es relevante como ejemplo reproducible de un pipeline completo de LeRobot: dataset de 600 episodios y 1800 fotogramas a 20 FPS, entrenamiento de 30.000 pasos con AdamW y learning rate 1e-5, y un comando de rollout listo para ejecutar. No obstante, es un artefacto de investigación de nicho, sin métricas de evaluación publicadas ni licencia declarada, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación |
| Parametros totales | 51.583.627 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones robóticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | `franka_panda_sim_hybrid_wp` |
| Cámaras | `overhead`, `wrist` |
| Entrada visual | `observation.images.overhead` (3, 240, 320), `observation.images.wrist` (3, 240, 320) |
| Entrada de estado | `observation.state` (17,) |
| Salida de acción | `action` (11,) |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de una acción por paso. La política consume dos flujos visuales de 240x320 píxeles (cámara cenital y de muñeca) junto con un vector de estado de 17 dimensiones, y emite un vector de acción de 11 dimensiones. El modelo sigue el paper arXiv:2304.13705 y se entrena y ejecuta con LeRobot.

El entrenamiento se realizó sobre el dataset `nberezny/franka_pick_place_hyb_wp`, compuesto por 600 episodios y 1800 fotogramas a 20 FPS, con la tarea "Pick up the red cube and place it on the blue square". La configuración reportada es de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.7.0. No se documentan detalles sobre aumentos de datos, composición exacta del dataset ni uso de RLHF/DPO (no aplicable en este paradigma de imitación).

## Capacidades

- Control robótico de manipulación pick-and-place: coger un cubo rojo y colocarlo sobre un cuadrado azul.
- Fusión de dos vistas de cámara (overhead y wrist) con estado propioceptivo de 17 dimensiones.
- Predicción de action chunks para reducir errores de composición en secuencias de control.
- Ejecución mediante `lerobot-rollout` sobre el robot `franka_panda_sim_hybrid_wp`.
- Reentrenamiento reproducible con `lerobot-train` a partir del dataset asociado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en simulación: ejecutar la política sobre el robot `franka_panda_sim_hyb_wp` para coger el cubo rojo y depositarlo en el cuadrado azul, usando las dos cámaras entrenadas.
- Baseline de referencia para comparar variantes de ACT: al estar entrenado con una configuración documentada (30.000 pasos, lr 1e-5, batch 8), sirve como punto de partida reproducible en experimentos de imitación.
- Validación de pipelines de LeRobot: comprobar la integración de `lerobot-rollout` y `lerobot-train` en un flujo completo desde dataset hasta despliegue.
- Docencia y divulgación en robótica: ejemplo mínimo y autocontenido de aprendizaje por imitación con datos de teleoperación y dos cámaras.
- Pruebas de robustez visual: evaluar el comportamiento de la política ante cambios de iluminación, posiciones de objeto o distracciones en el entorno simulado.
- Reentrenamiento con datos propios: usar la receta de entrenamiento como plantilla para adaptar ACT a nuevas tareas de manipulación en el mismo tipo de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros y pesos safetensors, el modelo es muy ligero y cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con suficiente memoria para las dos cámaras de 240x320 y el modelo es viable; el autor no especifica requisitos.
- ¿Cabe en consumer GPU?: sí, por el reducido número de parámetros, aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nberezny/act_franka_pick_place_hyb_wp` | 51,6 M | no aplica | Pick-and-place Franka (sim) | no disponible | Hugging Face Hub, 0 descargas |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación diversa | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | Manipulación diversa | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, disponibilidad y licencia.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito ni validación en robot real, solo entrenamiento en simulación.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Dataset muy pequeño: 600 episodios y 1800 fotogramas a 20 FPS limitan la generalización a variaciones de posición, iluminación o distractores.
- Tarea única y específica: la política está entrenada exclusivamente para "Pick up the red cube and place it on the blue square"; no se espera transferencia a otras tareas sin reentrenamiento.
- Dependencia del robot y cámaras exactas: los nombres y dimensiones de las observaciones (`overhead`, `wrist`, 240x320, estado de 17 dimensiones) deben coincidir con el hardware.
- Riesgo de sobreajuste al entorno simulado (`franka_panda_sim_hybrid_wp`): el comportamiento en un robot físico no está documentado.
- Sin soporte de lenguaje, tool calling ni razonamiento: no debe evaluarse con métricas de LLM ni usarse como asistente conversacional.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place_hyb_wp
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_hyb_wp
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_hyb_wp
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
