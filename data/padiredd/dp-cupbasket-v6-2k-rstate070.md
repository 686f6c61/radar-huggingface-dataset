# padiredd/dp-cupbasket-v6-2k-rstate070

## Resumen

dp-cupbasket-v6-2k-rstate070 es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario padiredd, entrenada para ejecutar la tarea de recoger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta. El modelo se distribuye en formato LeRobot, emplea la implementación del fork lerobot-cyclo de ROBOTIS y está pensado para el robot bimanual FFW SG2 de ROBOTIS, equipado con pinzas CAD y cámaras de muñeca calibradas. Con 287.533.680 parámetros, es un modelo compacto orientado a control motor fino más que a razonamiento lingüístico.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional generalista, sino de un artefacto de investigación en manipulación robótica, entrenado íntegramente en simulación (Isaac Lab) con aproximadamente 2.000 demostraciones exitosas y sin aleatorización de dominio. Su interés técnico reside en el parcheo del estado del gripper derecho (`-rstate070`), un ajuste que alinea la lectura articular registrada en simulación con la orden enviada, imitando el comportamiento del robot real.

El repositorio ocupa 11,5 GB e incluye el checkpoint final (paso 100k) en la raíz más diez checkpoints intermedios cada 10.000 pasos. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no hay métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara, sobre LeRobot (fork lerobot-cyclo de ROBOTIS) |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de acción 64, 32 ejecutados) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | other |
| Formato de pesos | safetensors (LeRobot `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

Se trata de una política de difusión condicionada por observaciones: tres cámaras (cabeza, muñeca izquierda y muñeca derecha) a 240x240 píxeles, cada una procesada por un ResNet18 independiente, más un vector de estado articular de 22 dimensiones. La salida es una secuencia de 16 objetivos articulares a 15 Hz. El proceso de difusión usa DDPM con 100 pasos, un horizonte de predicción de 64 pasos del que se ejecutan 32, y `n_obs_steps = 1`. El entrenamiento se realizó durante 100.000 pasos con batch 32, optimizador Adam a 1e-4 con decaimiento coseno y semilla 1000, en una única NVIDIA RTX 4090 de 24 GB.

Los datos provienen del conjunto `pick-cup-basket-v6-2k-3cam-rstate070` (no publicado en HuggingFace), con unas 2.000 demostraciones exitosas generadas en simulación mediante `cup_basket/programs/cup_handover_v6.py`, sin aleatorización de dominio y con semillas desde 60001. El muestreo es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot). La innovación destacable es el parcheo del estado del gripper derecho: el colector ejecuta el cierre a 0,50 pero registra la acción como 0,70, y `observation.state[15]` se remapea linealmente (0,157-0,50 → 0,157-0,70) para que la lectura registrada coincida con la orden, como ocurre en el robot real. La evaluación debe hacerse con `rollout_cup.py --grip_rec_r 0.70 --state_rec_r 1`. Se aplica augmentación de imagen agresiva en orden aleatorio (hasta 5 de: brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio, escala de grises), sin ruido de estado.

## Capacidades

- Control motor bimanual: genera 16 objetivos articulares a 15 Hz para el robot FFW SG2 con pinzas CAD.
- Percepción visual multi-cámara: fusiona cabeza, muñeca izquierda y muñeca derecha a 240x240.
- Ejecución de una tarea específica: "pick up the blue cup with the left hand, hand it to the right hand, and place it on the basket".
- Handover entre manos: coordinación izquierda-derecha con punto de transferencia a 8 cm del hombro derecho.
- Política de difusión condicionada por estado: no es un modelo generativo de texto ni soporta tool calling.
- No soporta function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües.
- Modo thinking, visión general, audio: no disponibles; la visión está limitada a las tres cámaras del robot.

## Casos de uso

- Investigación en manipulación bimanual: reproducir el handover vaso-cesta como baseline en experimentos de políticas de difusión, cargando el checkpoint con `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-v6-2k-rstate070")`.
- Transferencia sim-a-real con el FFW SG2: validar si una política entrenada solo en Isaac Lab generaliza al robot físico, usando `rollout_cup.py --grip_rec_r 0.70 --state_rec_r 1`.
- Estudio del parcheo de estado del gripper: analizar cómo el remapeo lineal de `observation.state[15]` afecta a la coherencia entre lectura y comando en el despliegue real.
- Comparación de checkpoints intermedios: los directorios `step-10000/` a `step-90000/` permiten trazar la curva de aprendizaje y elegir un punto de control concreto para ablaciones.
- Docencia en robótica de imitación: ejemplo completo de pipeline LeRobot con diffusion policy, augmentación de imagen y evaluación en simulación.
- Base para fine-tuning con datos reales: al ser un modelo compacto (288 M parámetros) y entrenado en una sola RTX 4090, sirve como punto de partida para adaptar la tarea a otras geometrías de pinza o cesta.
- Benchmark interno de robustez: al no haber aleatorización de dominio, es útil como control negativo para medir cuánto aporta el DR en variantes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten y no incluye tasas de éxito ni métricas de simulación o reales.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 4090 de 24 GB, según la model card (equipo "lab225", en solitario).
- Inferencia: no se especifica VRAM concreta; con 287,5 M parámetros en safetensors, la huella de pesos es de aproximadamente 1,15 GB en fp32 y unos 0,58 GB en fp16, más el estado del optimizador si se reanuda el entrenamiento.
- GPU recomendadas: RTX 4090 para entrenamiento; para inferencia cabe holgadamente en GPUs consumer (RTX 3060 12 GB, RTX 4070, RTX 4090) al tratarse de un modelo pequeño.
- Despliegue: pila LeRobot (`DiffusionPolicy.from_pretrained`), con el fork lerobot-cyclo de ROBOTIS; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es 15 Hz, pero no se publican tiempos de inferencia medidos.
- Almacenamiento: 11,5 GB de repositorio por los once checkpoints incluidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-v6-2k-rstate070 | 287,5 M | horizonte 64, 32 ejecutados, n_obs_steps 1 | Handover bimanual vaso-cesta (FFW SG2) | other | HuggingFace (padiredd) |
| Otras variantes del mismo autor (v3, v6 sin parche) | no disponible | no disponible | Tareas de pick-cup relacionadas | other | no disponible en la informacion proporcionada |
| Diffusion Policy original (Chi et al.) | no disponible | no disponible | Manipulación general | no disponible | Repositorio académico |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab) sin aleatorización de dominio: la transferencia al robot real no está validada y los resultados de evaluación aún no se han publicado.
- Tarea única y cerrada: no es un modelo generalista; solo ejecuta el handover vaso-cesta descrito.
- Dependencia del parche de estado: la coherencia entre lectura y comando del gripper derecho exige usar `--grip_rec_r 0.70 --state_rec_r 1` en la evaluación; otro ajuste puede degradar el comportamiento.
- Licencia "other": no se detallan los términos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Idiomas y sesgos: no aplica evaluación lingüística; el riesgo de alucinación se traduce aquí en fallos de política (agarres fallidos, colisiones) no cuantificados.
- Sin datos de robustez frente a cambios de iluminación, fondo u objetos distintos al vaso azul y la cesta de entrenamiento.
- Repositorio de 11,5 GB por los checkpoints intermedios; conviene descargar solo el paso deseado.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/dp-cupbasket-v6-2k-rstate070
- LeRobot (framework base): no disponible en la informacion proporcionada
- Fork lerobot-cyclo de ROBOTIS: no disponible en la informacion proporcionada
- Isaac Lab: no disponible en la informacion proporcionada
- Paper de Diffusion Policy (Chi et al.): no disponible en la informacion proporcionada
- Dataset `pick-cup-basket-v6-2k-3cam-rstate070`: no disponible en HuggingFace según la model card
