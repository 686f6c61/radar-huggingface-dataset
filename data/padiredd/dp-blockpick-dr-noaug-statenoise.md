# padiredd/dp-blockpick-dr-noaug-statenoise

## Resumen

dp-blockpick-dr-noaug-statenoise es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, el framework de Hugging Face para aprendizaje por imitación. La desarrolla el usuario padiredd y está pensada para una tarea muy concreta: un pick de bloque en vista cenital (top-down) ejecutado con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2 dentro del simulador Isaac Lab. El modelo tiene 287.533.680 parámetros y se distribuye en formato safetensors, con un repositorio de 5,8 GB que incluye el checkpoint final (paso 100k) y cuatro checkpoints intermedios.

El problema que resuelve es el de generar trayectorias de acción de 16 articulaciones a 15 Hz a partir de observaciones multimodales: tres cámaras (cabeza y ambas muñecas, reescaladas a 240x240) más un vector de estado articular de 22 dimensiones. Se entrenó sobre un conjunto de 500 demostraciones con randomización de dominio (fondos, mesas, luces, montajes de cámara, color del bloque y tiempos de demostración), lo que busca mejorar la robustez frente a variaciones visuales y de iluminación en simulación.

Es relevante ahora porque ejemplifica el flujo de trabajo típico de la robótica basada en aprendizaje: entrenamiento en simulación con Isaac Lab, políticas de difusión como generador de acciones multimodales y publicación de checkpoints intermedios para análisis de curvas de aprendizaje. Su alcance es acotado: no es un modelo de propósito general, sino un artefacto de investigación reproducible para una tarea y un robot específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) sobre LeRobot, fork lerobot-cyclo de ROBOTIS (commit 240b4a0) |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de acción 64 pasos, 32 ejecutados) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una diffusion policy en el sentido de LeRobot: un modelo generativo de difusión (DDPM con 100 pasos de ruido) que produce secuencias de acciones condicionadas por observaciones. La entrada combina tres imágenes de 240x240 (cabeza y ambas muñecas) con un vector de estado de 22 dimensiones; la salida son 16 objetivos articulares a 15 Hz. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32, con un único paso de observación (n_obs_steps = 1).

El entrenamiento se realizó sobre el conjunto `pick-cube-topdown-25cm-dr-500-3cam` (84.111 fotogramas, 500 demostraciones) con randomización de dominio por episodio: fondo, mesa, luces, montajes de cámara, color del bloque y tiempos de demostración variables. El bloque se distribuye uniformemente en x 0,23-0,48 m e y 0,065-0,315 m (los episodios efectivos abarcan x 0,273-0,480 m por el borde de la mesa). La receta es de 100k pasos, batch 8, Adam con lr 1e-4 (betas 0,95/0,999), weight decay 1e-6, scheduler coseno. No se aplicó aumento de imagen, pero sí ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado. El entrenamiento se ejecutó en una porción MIG de A100 de 20 GB (ASU Sol), a unas 6 iteraciones por segundo, durante aproximadamente 4,5 horas.

## Capacidades

- Generación de trayectorias de acción de 16 articulaciones a 15 Hz condicionadas por imágenes y estado articular.
- Percepción visual multimodal mediante tres cámaras (cabeza y dos muñecas) reescaladas a 240x240.
- Ejecución de un pick de bloque en vista cenital con el brazo izquierdo del ROBOTIS FFW SG2, con agarre vertical y puntas 0,5 cm por encima de la mitad de la altura del bloque.
- Generalización limitada a variaciones de dominio contempladas en el entrenamiento: fondos, mesas, iluminación, montajes de cámara, color del bloque y tiempos de demostración.
- Robustez parcial a ruido en el estado articular de entrada (entrenado con ruido gaussiano de 1 grado en las 7 articulaciones del brazo izquierdo).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades lingüísticas: es una política motora, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación: reproducción del pipeline completo (datos, receta, checkpoints) para estudiar cómo evoluciona la política entre los pasos 20k y 100k y comparar curvas de aprendizaje.
- Evaluación de robustez a randomización de dominio: el conjunto de entrenamiento varía fondo, mesa, luces, cámaras y color del bloque, lo que permite medir la sensibilidad de la política a cada factor en simulación.
- Benchmark de diffusion policies en Isaac Lab: sirve como línea base para comparar con otras arquitecturas (ACT, VQ-BeT, políticas basadas en transformers) sobre la misma tarea y robot.
- Estudio de ruido en el estado de entrada: al haberse entrenado con ruido gaussiano de 1 grado en las articulaciones del brazo, permite analizar el efecto de dicha perturbación en la estabilidad del agarre.
- Prototipado de manipulación con humanoides ROBOTIS FFW SG2: útil para equipos que trabajen con este hardware y quieran partir de una política preentrenada para la tarea de pick cenital antes de adaptarla a sus propias configuraciones.
- Docencia y divulgación: ejemplo compacto (287 M parámetros, 4,5 h de entrenamiento en una MIG de A100 de 20 GB) de extremo a extremo de una política de difusión robótica, adecuado para demostraciones reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación en simulación se añadirán una vez se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287 M parámetros en safetensors, los pesos ocupan aproximadamente 1,15 GB en fp32 y unos 0,57 GB en fp16, a lo que hay que sumar el coste de los tres flujos de imagen a 240x240 y del decodificador de difusión (100 pasos DDPM).
- GPU recomendadas: el entrenamiento se realizó en una porción MIG de A100 de 20 GB; para inferencia en simulación es razonable una GPU de 16 GB o superior, aunque no hay cifras publicadas.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-16 GB (RTX 3060/4060/4070/4080/4090), aunque no está verificado en la información disponible.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-dr-noaug-statenoise")`) dentro de Isaac Lab; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el del entrenamiento (unas 6 iteraciones por segundo en una MIG de A100 de 20 GB).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de difusión ni con alternativas como ACT, VQ-BeT o DP3, ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre un pick de bloque cenital con el brazo izquierdo del ROBOTIS FFW SG2 en Isaac Lab; no es transferible sin reentrenamiento a otras tareas, robots o entornos.
- Dependencia del simulador: entrenado y pensado para Isaac Lab con una configuración concreta (mesa de 29,25 in, pose inicial fija en yaml, bloque lima de 5x5x4 cm, agarre con puntas 0,5 cm por encima de la mitad de la altura); el rendimiento en el robot real no está documentado.
- Sin resultados de evaluación publicados: no hay métricas de éxito en simulación ni en hardware, por lo que no es posible valorar su fiabilidad real.
- Sesgos de los datos de demostración: la distribución del bloque está acotada (x 0,273-0,480 m por el borde de la mesa) y las variaciones de dominio son las del conjunto de entrenamiento; fuera de ese rango el comportamiento es incierto.
- Riesgo de fallo en agarre: la política puede generar trayectorias plausibles pero incorrectas ante configuraciones no vistas, sin mecanismo explícito de detección de error.
- Licencia "other": no se especifican los términos exactos en la información disponible; es necesario consultar el repositorio antes de cualquier uso comercial.
- Idiomas no aplicables: al no ser un modelo de lenguaje, no procede evaluación multilingüe ni de alucinación textual; el riesgo análogo es la generación de acciones no válidas.
- Repositorio de 5,8 GB con cinco checkpoints: consumo de almacenamiento considerable para una política de 287 M parámetros.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/dp-blockpick-dr-noaug-statenoise
- LeRobot (framework): https://github.com/huggingface/lerobot
- Fork lerobot-cyclo de ROBOTIS: https://github.com/ROBOTIS-GIT/lerobot-cyclo (commit 240b4a0)
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: no disponible en la información proporcionada
