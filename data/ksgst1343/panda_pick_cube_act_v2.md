# ksgst1343/panda_pick_cube_act_v2

## Resumen

`ksgst1343/panda_pick_cube_act_v2` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705 y empaquetada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: recoger un cubo ("pick_cube") con un brazo robótico Panda, a partir de dos flujos de cámara (frontal y de muñeca) y un vector de estado de 18 dimensiones, produciendo una acción de 4 dimensiones.

No se trata de un modelo de lenguaje: es un transformer ligero de 51.678.852 parámetros entrenado por imitación sobre un dataset propio de 30 episodios y 799 fotogramas a 10 FPS. Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas con LeRobot, no la de un modelo generalista: el repositorio ocupa 0,2 GB y no tiene descargas ni valoraciones en el momento de la consulta.

La ficha describe sus especificaciones reales, la arquitectura ACT, sus capacidades limitadas al dominio robótico y las advertencias de uso derivadas de un dataset de entrenamiento muy reducido y de la ausencia de evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.678.852 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija por observación: 2 imágenes de 3x128x128 y estado de 18 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena "pick_cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |
| Pipeline | robotics |
| Entradas | `observation.images.front` (3, 128, 128), `observation.images.wrist` (3, 128, 128), `observation.state` (18,) |
| Salidas | `action` (4,) |
| Dataset de entrenamiento | ksgst1343/panda_pick_cube (30 episodios, 799 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso. La arquitectura combina un codificador visual que procesa las dos cámaras a resolución 128x128, un codificador del estado del robot (18 dimensiones) y un decodificador transformer que genera el chunk de acciones de 4 dimensiones; el paper original incorpora además un estilo CVAE con variable latente para modelar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `ksgst1343/panda_pick_cube`: 30 episodios teleoperados, 799 fotogramas a 10 FPS, una única tarea ("pick_cube"), 10.000 pasos, batch de 8, AdamW con learning rate 1e-05 y semilla 1000. No se documenta composición adicional del dataset, aumento de datos, RLHF ni DPO; es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de 4 dimensiones para ejecutar la tarea "pick_cube" con un brazo Panda.
- Percepción visual multimodal: consume simultáneamente una cámara frontal y una cámara de muñeca a 128x128 píxeles.
- Fusión de estado propioceptivo: integra un vector de estado del robot de 18 dimensiones junto con las imágenes.
- Predicción de chunks de acciones: emite secuencias de acciones en lugar de pasos sueltos, lo que mejora la estabilidad temporal.
- Ejecución en tiempo real mediante `lerobot-rollout` a la frecuencia del dataset (10 FPS).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Recogida de cubos en laboratorio: ejecutar la política sobre un brazo Panda con cámaras frontal y de muñeca para recoger un cubo, usando `lerobot-rollout` con la tarea "pick_cube" y una duración acotada.
- Base para fine-tuning con LeRobot: servir como punto de partida para reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de otra tarea de manipulación.
- Validación de pipelines de imitación: comprobar de extremo a extremo el flujo de grabación, entrenamiento y despliegue de LeRobot 0.6.1 en un entorno controlado.
- Docencia y demostraciones: ilustrar el método ACT en cursos de robótica con un ejemplo pequeño (0,2 GB) que cabe en cualquier equipo.
- Pruebas de calibración de cámaras: verificar que los nombres y índices de cámara coinciden con las claves de observación (`front`, `wrist`) antes de escalar a tareas mayores.
- Referencia de reproducibilidad: replicar la configuración exacta (10.000 pasos, batch 8, lr 1e-05, semilla 1000) para comparar variantes del método.
- Benchmark interno de políticas: medir tasas de éxito de ACT frente a otras políticas de LeRobot en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 (51,7 M de parámetros, unos 207 MB) y en torno a 100-150 MB en fp16; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobradas para la inferencia. Para reentrenar con 10.000 pasos y batch 8, una GPU consumer de gama media es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a 10 FPS.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=ksgst1343/panda_pick_cube_act_v2`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política.
- Latencia y throughput: no se documentan métricas; la frecuencia de control del dataset es de 10 FPS, por lo que la inferencia debe completarse en menos de 100 ms por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ksgst1343/panda_pick_cube_act_v2 | 51,7 M | 2 imágenes 128x128 + estado 18 | pick_cube (Panda) | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | variable | variable | tareas diversas | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | variable | tareas diversas | Apache 2.0 | Hugging Face |
| Políticas pi0 / pi0.5 (Physical Intelligence) | varios miles de millones | imágenes + texto | manipulación generalista | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 30 episodios y 799 fotogramas, insuficiente para generalizar fuera de posiciones y condiciones de iluminación similares a las de la grabación.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad en producción.
- Tarea única y robot específico: entrenada solo para "pick_cube" con un Panda; no transferirá directamente a otro robot, efector u objeto sin reentrenamiento.
- Dependencia de las cámaras: los nombres `front` y `wrist` y sus índices deben coincidir exactamente con los del entrenamiento; un cambio de calibración degrada el comportamiento.
- Sin capacidades de lenguaje ni razonamiento: no procesa instrucciones en texto más allá de la etiqueta de tarea, no soporta tool calling ni agentes.
- Riesgo de sobreajuste y de fallo silencioso: con tan pocos datos, la política puede reproducir trayectorias memorizadas y fallar ante perturbaciones (objetos desplazados, distracciones, cambios de luz).
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías del autor ni soporte; conviene citar el paper ACT y LeRobot.
- Repositorio sin tracción: 0 descargas y 0 likes, sin mantenimiento ni actualizaciones documentadas desde su creación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ksgst1343/panda_pick_cube_act_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/ksgst1343/panda_pick_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ksgst1343/panda_pick_cube
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
