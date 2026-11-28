# chrisw-shadow/thread_nut_dit_hil_v6

## Resumen

`thread_nut_dit_hil_v6` es una política de robótica entrenada con LeRobot que implementa el método Multi-Task Diffusion Transformer (DiT), una extensión de Diffusion Policy que sustituye el backbone convolucional por un Diffusion Transformer con condicionamiento conjunto de texto y visión. El modelo lo publica el usuario `chrisw-shadow` y está especializado en una única tarea de manipulación: agarrar una tuerca y enroscarla en un perno orientado hacia arriba, sobre un robot UR10e equipado con pinza Dexee y tres cámaras.

La política consume el estado propioceptivo del robot (39 dimensiones) y tres flujos de imagen RGB de 480x640 (una cámara fija y dos en las muñecas) para producir un vector de acción de 21 dimensiones. Con 260,5 millones de parámetros y un repositorio de 1 GB en formato safetensors, es un modelo compacto pensado para inferencia en tiempo real a 50 FPS, no para despliegue como LLM.

Su relevancia es acotada y práctica: sirve como referencia reproducible de entrenamiento de imitación con DiT en LeRobot 0.7.0, y como política lista para evaluar en un montaje UR10e + Dexee. No es un modelo de propósito general, no tiene benchmarks publicados y su licencia no está declarada, lo que limita su uso comercial hasta que el autor la especifique.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento texto + vision; objetivos de difusion y flow-matching |
| Parametros totales | 260.512.021 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de accion definido por la configuracion de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (condicionamiento por instruccion de tarea en texto, sin cobertura multilingue declarada) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `ur10e_dexee` |
| Camaras | `fixed`, `wrist_1`, `wrist_2` |
| Entrada de observacion | `observation.state` (39,), 3 x `observation.images.*` (3, 480, 640) |
| Salida de accion | `action` (21,) |
| Frecuencia de datos | 50 FPS |
| Tamano del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseno Multi-Task Diffusion Transformer descrito en el paper arXiv:2507.05331, que extiende Diffusion Policy con un backbone Transformer de difusion de gran tamano y condicionamiento multimodal (texto de la instruccion de tarea e imagenes de camara). Soporta tanto el objetivo de difusion como el de flow-matching, y el autor reporta en la model card que el metodo alcanza alta destreza con aproximadamente 450M de parametros; esta instancia concreta tiene 260,5M. La entrada combina un vector de estado de 39 dimensiones con tres imagenes de 480x640, y la salida es un vector de accion de 21 dimensiones, coherente con un brazo UR10e con pinza Dexee.

El entrenamiento se realizo con LeRobot 0.7.0 sobre el dataset `chrisw-shadow/nut_5_hil_merged_subset_rel`: 175 episodios, 116.462 frames a 50 FPS, todos correspondientes a la tarea "grasp the nut and then thread it onto the upwards facing bolt". La configuracion reportada es de 60.000 pasos, batch size 96, optimizador Adam, learning rate 2e-05 y semilla 1000. El sufijo `hil` del nombre sugiere intervenciones humanas en el bucle (human-in-the-loop), aunque la model card no detalla la proporcion de datos teleoperados frente a correctivos. No se documenta el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO, algo que en politicas de imitacion no aplica del mismo modo que en LLM.

## Capacidades

- Generacion de acciones motoras continuas de 21 dimensiones para un UR10e con pinza Dexee, condicionadas por estado propioceptivo e imagenes.
- Manipulacion visomotora de precision: agarre de una tuerca y enroscado sobre un perno vertical, tarea que requiere alineacion fina y control de fuerza.
- Condicionamiento por instruccion de texto: la tarea se especifica en el campo `--task` del comando de rollout.
- Fusion de tres vistas de camara (fija y dos en muneca) para estimacion de pose relativa objeto-herramienta.
- Soporte de los objetivos de difusion y flow-matching heredado del metodo Multi-Task DiT.
- Inferencia en tiempo real a la frecuencia de los datos de entrenamiento (50 FPS), adecuada para control reactivo.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico ni capacidades de vision generales fuera del contexto robotico.

## Casos de uso

- Enroscado automatizado de tuercas en linea de montaje: la politica ejecuta el ciclo completo de agarre y roscado sobre un perno vertical, con las tres camaras cubriendo oclusiones tipicas de la muneca durante la aproximacion.
- Referencia reproducible para entrenar politicas DiT en LeRobot: el repositorio incluye el comando `lerobot-train` completo, lo que permite replicar el pipeline con otro dataset y comparar hiperparametros (60k pasos, batch 96, lr 2e-05).
- Base para fine-tuning en tareas de ensamblaje similares: al estar entrenada en una tarea de insercion con tolerancia estrecha, es un punto de partida razonable para pernos, tornillos o conectores con geometria parecida.
- Evaluacion de robustez visomotora en laboratorio: sirve para medir como afectan cambios de iluminacion, posicion del objeto o distractores en una politica de imitacion con condicionamiento de texto.
- Docencia y formacion en robotica de manipulacion: el modelo es pequeno (260M parametros, 1 GB) y el flujo de `lerobot-rollout` esta documentado, lo que facilita montar practicas de imitation learning de extremo a extremo.
- Integracion en pipelines de investigacion HIL: el nombre del modelo y del dataset indican datos con intervencion humana, utiles para estudiar estrategias de correccion en el bucle y su efecto en la tasa de exito.
- Pruebas de despliegue de politicas en hardware real: con `--strategy.type=base` y `--duration` se puede ejecutar la politica de forma controlada sin grabar episodios, util para validacion previa a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la plantilla vacia y la nota explicita: "No evaluation results have been provided for this policy yet". No hay tasas de exito en robot real, ni comparaciones con otras politicas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 260,5M de parametros en FP32 ocupan aproximadamente 1,04 GB solo en pesos, y en FP16 unos 0,52 GB; a ello hay que sumar activaciones del Transformer de difusion y los tres buffers de imagen de 480x640.
- GPU recomendadas: no especificadas por el autor. Para control a 50 FPS con tres camaras, se recomienda una GPU dedicada con al menos 8-12 GB de VRAM; una RTX 4090 o una A100/H100 cubren el caso con margen, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: probablemente si en tarjetas con 8 GB o mas, dado el tamano del checkpoint (1 GB de repositorio), pero no hay confirmacion empirica en la informacion disponible.
- Opciones de despliegue: LeRobot 0.7.0 mediante `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. El dato de 50 FPS corresponde a la frecuencia de captura del dataset, no a una medicion de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thread_nut_dit_hil_v6` (este) | 260,5M | no disponible | Enroscado de tuerca en UR10e Dexee | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy (baseline del paper) | no disponible | no disponible | Politicas visomotoras multi-tarea | no disponible | Referencia en arXiv:2507.05331 |
| Multi-Task DiT (~450M, segun model card) | ~450M | no disponible | Politicas visomotoras multi-tarea con texto + vision | no disponible | Referencia en arXiv:2507.05331 |
| Otras politicas LeRobot del Hub | variable | no disponible | Tareas diversas por robot | variable | Hugging Face |

La comparacion cuantitativa con alternativas no es posible: no hay benchmarks publicados para este checkpoint ni resultados de las variantes del paper en la informacion proporcionada. La unica diferencia verificable es el numero de parametros (260,5M frente a los ~450M que cita la model card para el metodo).

## Limitaciones y advertencias

- Licencia no declarada: la model card indica "More Information Needed". Sin licencia explicita no hay autorizacion clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin evaluacion publicada: no hay tasa de exito en robot real, ni numero de ensayos, ni condiciones de dificultad documentadas. Cualquier afirmacion de rendimiento seria especulativa.
- Especializacion extrema: entrenada en una sola tarea ("grasp the nut and then thread it onto the upwards facing bolt") y en un unico tipo de robot (`ur10e_dexee`). No generaliza a otras tareas, objetos o cinemáticas sin reentrenamiento.
- Dependencia del montaje de camaras: las claves de observacion (`fixed`, `wrist_1`, `wrist_2`) y sus resoluciones (3, 480, 640) deben coincidir exactamente con el hardware de despliegue; un cambio de montaje invalida la politica.
- Dataset pequeno y sesgado: 175 episodios y 116.462 frames de una unica tarea implican cobertura limitada de posiciones, iluminacion y distractores. El riesgo de sobreajuste al entorno de grabacion es alto.
- Riesgo de fallo fisico: en tareas de roscado, un error de alineacion puede danar la rosca, la pinza o el perno. Se recomienda limitar fuerzas y anadir supervision externa en produccion.
- Sin datos de sesgo, alucinacion o cobertura linguistica: al no ser un modelo de lenguaje, esas categorias no aplican directamente, pero tampoco hay analisis de robustez frente a cambios de apariencia del objeto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de uso o incidencias resueltas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrisw-shadow/thread_nut_dit_hil_v6
- Dataset de entrenamiento: https://huggingface.co/datasets/chrisw-shadow/nut_5_hil_merged_subset_rel
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chrisw-shadow/nut_5_hil_merged_subset_rel
- Paper del metodo (Multi-Task DiT): https://huggingface.co/papers/2507.05331
- Guia LeRobot de `multi_task_dit`: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
