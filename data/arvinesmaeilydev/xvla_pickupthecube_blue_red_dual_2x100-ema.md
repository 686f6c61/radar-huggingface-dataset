# arvinesmaeilydev/xvla_PickUpTheCube_Blue_Red_Dual_2x100-ema

## Resumen

X-VLA (xvla_PickUpTheCube_Blue_Red_Dual_2x100-ema) es una política robótica de tipo Vision-Language-Action (VLA) desarrollada por el usuario arvinesmaeilydev y publicada en Hugging Face. Se trata de un ajuste fino supervisado del modelo base `lerobot/xvla-base`, entrenado específicamente para dos tareas de manipulación sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot): recoger un cubo azul y recoger un cubo rojo. El modelo forma parte del ecosistema LeRobot de Hugging Face y emplea el framework X-VLA, presentado en el artículo arXiv 2510.10274.

La arquitectura subyacente es un framework VLA con *flow matching* y *soft prompts*: cada configuración de robot o hardware se trata como una "tarea" codificada mediante un conjunto reducido de embeddings de soft prompt aprendibles, lo que permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos. El checkpoint contiene 879.687.256 parámetros (aproximadamente 880 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 1,8 GB.

Su relevancia es acotada pero clara: es un ejemplo reproducible de ajuste fino de un VLA preentrenado para una tarea concreta de manipulación sobre hardware de bajo coste, con licencia Apache 2.0, y sirve como referencia práctica para quien quiera replicar el flujo de entrenamiento e inferencia con LeRobot. No es un modelo de propósito general ni un LLM: es una política de control motor que consume imágenes y estado y produce acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (X-VLA) con flow matching y soft prompts |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural como texto libre; recibe una instrucción de tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Camaras | top, wrist |
| Tamano del repositorio | 1,8 GB |
| Dataset de entrenamiento | arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100 |
| Episodios / frames | 200 episodios / 85.682 frames a 30 FPS |
| Tareas | "pick up the blue cube", "pick up the red cube" |

Entradas y salidas del modelo:

| Feature | Tipo | Forma |
|---|---|---|
| observation.images.image | VISUAL | (3, 256, 256) |
| observation.images.image2 | VISUAL | (3, 256, 256) |
| observation.images.image3 | VISUAL | (3, 224, 224) |
| observation.state | STATE | (8,) |
| action | ACTION | (6,) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA basado en *soft prompting* y *flow matching*. La idea central es tratar cada morfología de robot, conjunto de sensores y espacio de acción como una "tarea" distinta, representada por un pequeño conjunto de embeddings de soft prompt aprendibles. Esto permite que un único modelo preentrenado se adapte a configuraciones heterogéneas sin necesidad de arquitecturas específicas por robot. El modelo consume tres flujos visuales (dos a 256×256 y uno a 224×224, correspondientes a las cámaras `top` y `wrist`) más un vector de estado de 8 dimensiones, y genera un vector de acción de 6 dimensiones.

Este checkpoint concreto es un ajuste fino del modelo base `lerobot/xvla-base` sobre el dataset `PickUpTheCube_Blue_Red_Dual_2x100`, compuesto por 200 episodios y 85.682 frames grabados a 30 FPS para dos tareas de recogida de cubos. La configuración de entrenamiento reportada es de 20.000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. El sufijo `-ema` del nombre indica que el checkpoint publicado corresponde a los pesos promediados exponencialmente (EMA), práctica habitual para estabilizar la política final. No se documentan detalles sobre el número de tokens de preentrenamiento del modelo base ni sobre la composición completa del dataset original de X-VLA.

## Capacidades

- Control robótico de manipulación mediante imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen (cámara superior y cámara de muñeca).
- Ejecución de instrucciones de tarea acotadas: "pick up the blue cube" y "pick up the red cube".
- Adaptación a morfologías mediante soft prompts: el framework subyacente está diseñado para reconciliar distintos robots y espacios de acción.
- Inferencia en tiempo real sobre hardware LeRobot (`so_follower`) a 30 FPS.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente LLM.
- No dispone de capacidades multilingües de texto libre, visión general, audio ni modo "thinking".
- No se han documentado capacidades de generalización más allá de las dos tareas entrenadas.

## Casos de uso

- Recogida automatizada de objetos en laboratorio: el modelo ejecuta las tareas "pick up the blue cube" y "pick up the red cube" sobre un SO-100/SO-101, útil para demostraciones de manipulación con hardware de bajo coste.
- Base para ajuste fino de nuevas tareas: al partir de `lerobot/xvla-base` y publicarse con LeRobot 0.6.2, sirve como plantilla reproducible para entrenar políticas propias con `lerobot-train` sobre nuevos datasets.
- Evaluación de pipelines de imitación: permite comparar configuraciones de entrenamiento (pasos, batch, learning rate) sobre un mismo dataset de 200 episodios.
- Docencia y prototipado en robótica: ejemplo completo de extremo a extremo (grabación de datos, entrenamiento, rollout) con comandos `lerobot-rollout` documentados.
- Pruebas de robustez visual: al usar dos cámaras (top y wrist), permite estudiar el efecto de oclusiones y cambios de iluminación en tareas de picking.
- Referencia para investigación en VLA: punto de partida para experimentar con soft prompts y flow matching en configuraciones multi-robot.
- Validación de hardware: sirve para verificar la calibración de un SO-100/SO-101 y de sus cámaras antes de entrenar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (_"No evaluation results have been provided for this policy yet"_).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~880 M parámetros en precisión completa (fp32) serían aproximadamente 3,5 GB solo de pesos, y en fp16/bf16 alrededor de 1,8 GB, a lo que hay que sumar el coste de los tres flujos visuales y del codificador visual del VLA.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer con 8 GB o más (RTX 3060/4060 en adelante) debería ser suficiente para inferencia en fp16, y una RTX 4090 o A100/H100 para entrenamiento.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint (1,8 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia, pero no se reportan medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xvla_PickUpTheCube_Blue_Red_Dual_2x100-ema | ~880 M | VLA (X-VLA) | 2 tareas de picking | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/xvla-base | No disponible | VLA (X-VLA) base | Preentrenado multi-robot | No disponible en la informacion | Hugging Face |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | No disponible | Politicas de imitacion | Segun dataset | No disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo se ha entrenado para dos tareas concretas ("pick up the blue cube" y "pick up the red cube"); no generaliza a otras instrucciones ni objetos.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que se desconoce su fiabilidad.
- Dependencia del hardware: diseñado para `so_follower` con cámaras `top` y `wrist`; los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento.
- Dataset pequeño: 200 episodios y 85.682 frames, lo que limita la diversidad de posiciones, iluminación y distractores vistos durante el entrenamiento.
- Riesgo de sobreajuste al entorno de grabación: cambios de fondo, iluminación u objetos pueden degradar el comportamiento.
- Sin capacidades de lenguaje libre ni de agente: no debe emplearse como sustituto de un LLM.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base `lerobot/xvla-base`.
- Sin información sobre sesgos: no se documentan sesgos conocidos, aunque al ser una política visual puede verse afectada por sesgos de los datos de grabación (colores, posiciones, iluminación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvinesmaeilydev/xvla_PickUpTheCube_Blue_Red_Dual_2x100-ema
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100
- Artículo X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100
- Guía X-VLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
