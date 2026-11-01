# RoboCrafty/act_real_parol6_pick_place_yellow_cube_white_box

## Resumen

`RoboCrafty/act_real_parol6_pick_place_yellow_cube_white_box` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT) sobre el robot `my_parol6`. El modelo aprende una única tarea manipulativa —"put the yellow cube in the white box"— a partir de 20 episodios de teleoperación (7384 fotogramas a 30 FPS) y predice directamente comandos de acción de 7 dimensiones a partir de observaciones visuales y de estado. No es un modelo de lenguaje: es un controlador visuomotor de extremo a extremo para robótica real.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo completo de LeRobot (grabación de datos, entrenamiento, publicación en el Hub y despliegue en robot real) con una receta reproducible y una licencia permisiva (Apache 2.0). Por otro, permite evaluar con datos concretos las limitaciones de las políticas ACT entrenadas con datasets pequeños: 20 episodios y una sola tarea implican una generalización muy restringida, sin resultados de evaluación publicados por el autor.

El modelo tiene 51.670.663 parámetros totales y un repositorio de 0,2 GB, lo que lo hace desplegable en hardware de consumo. Consume tres cámaras (`gripper_cam`, `topdown_cam`, `isometric_cam`) y un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones. La model card no reporta tasas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre una ventana de observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantización para esta política) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se pasa como cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varias acciones futuras de golpe) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política combina un backbone visual que procesa tres cámaras RGB con un transformer que fusiona las representaciones visuales y el estado propioceptivo de 7 dimensiones para generar el vector de acción de 7 dimensiones. El repositorio tiene 51,67 M de parámetros, coherente con una política ACT compacta.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `RoboCrafty/parol6_pick_place_yellow_cube_white_box`: 20 episodios, 7384 fotogramas a 30 FPS, una única tarea. La configuración reportada es 10.000 pasos, batch de 128, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta aumento de datos, currículo, RLHF ni ajuste fino posterior; es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control visuomotor de manipulación: genera comandos de 7 dimensiones (posición/orientación del efector y pinza) para ejecutar la tarea de recoger el cubo amarillo y depositarlo en la caja blanca.
- Percepción multimodal: integra tres cámaras RGB (`gripper_cam` a 480×640, `topdown_cam` a 360×640, `isometric_cam` a 480×640) más el estado del robot.
- Predicción por chunks de acción, que aporta suavidad y robustez frente al ruido en la ejecución.
- Ejecución en tiempo real a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora modo de razonamiento explícito ni visión semántica de propósito general.

## Casos de uso

- Automatización de pick-and-place en laboratorio: desplegar la política con `lerobot-rollout` sobre el robot `my_parol6` para mover el cubo amarillo a la caja blanca en un entorno controlado, usando exactamente las tres cámaras y la disposición de la mesa del dataset.
- Base de referencia para comparar métodos de imitación: servir como línea base ACT reproducible (10.000 pasos, batch 128, lr 1e-5) frente a Diffusion Policy u otros métodos en el mismo dataset de 20 episodios.
- Reentrenamiento con nuevos datos: usar el comando `lerobot-train` con `--policy.type=act` para adaptar la política a variaciones de la tarea (otro objeto, otra caja) sustituyendo el `repo_id` del dataset.
- Docencia y formación en robótica de imitación: ejemplo completo de extremo a extremo (grabación, entrenamiento, publicación y despliegue) con licencia Apache 2.0 y pesos de 0,2 GB.
- Pruebas de integración de LeRobot: validar pipelines de inferencia, calibración de cámaras y sincronización de observaciones antes de escalar a políticas mayores.
- Evaluación de robustez ante cambios de iluminación y posición: al no haber resultados de evaluación publicados, el modelo es un buen sujeto para medir empíricamente la degradación de una política ACT con pocos episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) está vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para 51,67 M de parámetros; en la práctica el cuello de botella es el procesamiento de tres flujos de vídeo, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento, una RTX 4090 o A100 acelera los 10.000 pasos, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: la política está pensada para ejecutarse a 30 FPS (33 ms por paso); no se publican mediciones de latencia ni throughput reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observaciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, parol6) | 51,67 M | 3 cámaras + estado 7D | Pick-and-place cubo amarillo en caja blanca | Apache 2.0 | Hugging Face, 29 descargas |
| Diffusion Policy (referencia del paper ACT) | no disponible | depende de la implementación | Manipulación por imitación | según implementación | Repositorios de investigación |
| Otras políticas ACT en LeRobot Hub | variable | variable | Tareas diversas | habitualmente Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Dataset muy pequeño: 20 episodios y 7384 fotogramas limitan severamente la generalización; se espera un rendimiento frágil ante cambios de posición, iluminación o distractores.
- Una única tarea: la política solo ha visto "put the yellow cube in the white box"; no es reutilizable para otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia de la configuración exacta: requiere el robot `my_parol6`, las tres cámaras con sus nombres y resoluciones, y una disposición de escena similar a la del dataset.
- Riesgo de sobreajuste a la escena de entrenamiento y de fallos silenciosos fuera de distribución; no hay mecanismo de detección de incertidumbre documentado.
- Sesgos: no aplican sesgos lingüísticos, pero sí sesgos de escena (colores, posiciones y objetos concretos del dataset).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el despliegue en producción es responsabilidad del integrador.
- No apta para tareas de lenguaje, razonamiento o generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/act_real_parol6_pick_place_yellow_cube_white_box
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_pick_place_yellow_cube_white_box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_pick_place_yellow_cube_white_box
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
