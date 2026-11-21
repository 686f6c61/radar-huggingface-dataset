# Josebarv01/act_pti_todo_v1

## Resumen

`act_pti_todo_v1` es una política de imitación robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario Josebarv01 en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor entrenado para ejecutar tareas de manipulación sobre un robot `so_follower` (formato SO-100/SO-101 de LeRobot), con dos cámaras de entrada (`top` y `wrist`) a resolución 640x480 y un estado propioceptivo de 6 dimensiones. El modelo predice directamente un vector de acción de 6 dimensiones.

El modelo se ha obtenido por ajuste fino del checkpoint `Josebarv01/act_pti_coger_v7` sobre el dataset `Josebarv01/pti_todo_v7_laser`, compuesto por 95 episodios y 75.614 fotogramas a 30 FPS. Las tareas cubiertas son dos: recoger un vaso de su soporte y, en una variante más compleja, recoger el vaso, seguir un puntero láser y depositarlo donde el láser se apaga.

Su relevancia es acotada y experimental: se trata de una política de investigación con 51,7 millones de parámetros, sin resultados de evaluación publicados y sin licencia declarada. Resulta útil como referencia reproducible de un pipeline de imitación con LeRobot 0.6.2, pero no constituye un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación definida por la configuración de ACT en LeRobot |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; recibe una cadena de tarea como condicionamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `top`, `wrist` (3, 480, 640) |
| Estado de entrada | `observation.state` (6,) |
| Salida | `action` (6,) |
| Modelo base | `Josebarv01/act_pti_coger_v7` (finetune) |
| Dataset de entrenamiento | `Josebarv01/pti_todo_v7_laser` (95 episodios, 75.614 frames, 30 FPS) |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La política combina un codificador visual (procesa las dos cámaras, `top` y `wrist`) con un transformer que genera una secuencia de acciones futuras a partir del estado de 6 dimensiones y de la instrucción de tarea. El modelo se entrenó con 15.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, partiendo del checkpoint `act_pti_coger_v7`.

El dataset de ajuste contiene 95 episodios teleoperados (75.614 fotogramas a 30 FPS) con dos tareas: "pick up the cup from the holder" y "pick up the cup, follow the laser and place it where the laser turns off". No se documenta composición adicional del dataset, aumentación de datos, ni procesos de RLHF/DPO (no aplicables en este paradigma). Tampoco se detalla la configuración exacta de la arquitectura (número de capas, dimensión de los chunks, resolución del backbone visual) más allá de lo indicado en la model card.

## Capacidades

- Control visomotor de manipulación: genera acciones de 6 grados de libertad a partir de dos vistas de cámara y del estado del robot.
- Ejecución de tareas condicionada por instrucción textual ("pick up the cup from the holder", "pick up the cup, follow the laser and place it where the laser turns off").
- Predicción de chunks de acciones, lo que aporta suavidad y consistencia temporal en la ejecución.
- Seguimiento de un objetivo visual dinámico (puntero láser) en la segunda tarea.
- Integración nativa con el ecosistema LeRobot: entrenamiento, rollout y visualización de datos mediante CLI.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües o de generación de texto.

## Casos de uso

- Recogida de objetos de un soporte: la política ejecuta la tarea "pick up the cup from the holder" sobre un robot `so_follower` con cámaras `top` y `wrist`, adecuada para validar pipelines de imitación en laboratorio.
- Seguimiento de objetivo visual con láser: la segunda tarea permite probar control reactivo ante un estímulo visual dinámico, útil en investigación de visomotricidad.
- Reproducción de experimentos de ACT: sirve como referencia para comparar configuraciones de entrenamiento (pasos, batch, learning rate) sobre el mismo dataset.
- Base para ajuste fino en nuevas tareas: al estar construida sobre `act_pti_coger_v7`, puede reentrenarse con `lerobot-train` sobre datasets propios de manipulación.
- Docencia y prototipado en robótica de imitación: el tamaño reducido (51,7 M de parámetros, 0,2 GB) facilita su despliegue en equipos modestos para prácticas.
- Validación de hardware SO-100/SO-101: permite comprobar calibración de cámaras, puertos y cinemática del robot antes de escalar a políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors y dos flujos de imagen a 480x640, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se documenta la cifra exacta.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA y suficiente memoria para dos cámaras a 30 FPS debería bastar; el entrenamiento se realizó con `--policy.device=cuda`.
- Compatibilidad con GPU de consumo: probable (el tamaño del repo es de 0,2 GB), si bien no se especifica el modelo mínimo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución está pensada para operar a 30 FPS, la misma tasa del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tareas | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `Josebarv01/act_pti_todo_v1` | 51,7 M | ACT (LeRobot) | 2 tareas de manipulación con vaso y láser | no disponible | no |
| `Josebarv01/act_pti_coger_v7` (modelo base) | no disponible | ACT (LeRobot) | tarea de recogida | no disponible | no disponible |
| Diffusion Policy (referencia del ecosistema LeRobot) | no disponible | difusión para control | manipulación genérica | según implementación | varía |
| Otros checkpoints ACT de LeRobot Hub | variable | ACT | tareas diversas | variable | variable |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, por lo que no puede afirmarse su fiabilidad en ninguna tarea.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Dataset muy reducido: 95 episodios y dos tareas concretas limitan la generalización a posiciones, iluminación, objetos o robots distintos de los vistos en entrenamiento.
- Dependencia de hardware específico: requiere robot `so_follower` y cámaras con los nombres y resoluciones exactos (`top`, `wrist`, 640x480, 30 FPS); cualquier desviación invalida la política.
- Sin información sobre sesgos: no se documentan sesgos, pero al ser un modelo de control visual, es sensible a condiciones de iluminación, oclusiones y cambios de apariencia del objeto.
- Riesgo de fallo silencioso en ejecución: al no haber métricas, los fallos pueden manifestarse como acciones erráticas sin señal de alerta.
- Sin soporte de lenguaje natural libre: la instrucción de tarea debe coincidir con las cadenas usadas en entrenamiento.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Josebarv01/act_pti_todo_v1
- Modelo base: https://huggingface.co/Josebarv01/act_pti_coger_v7
- Dataset de entrenamiento: https://huggingface.co/datasets/Josebarv01/pti_todo_v7_laser
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Josebarv01/pti_todo_v7_laser
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
