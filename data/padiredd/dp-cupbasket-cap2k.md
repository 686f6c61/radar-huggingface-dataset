# padiredd/dp-cupbasket-cap2k

## Resumen

dp-cupbasket-cap2k es una política de difusión (diffusion policy) para robótica manipulativa bimanual, publicada por el usuario padiredd en Hugging Face. El modelo aprende a ejecutar una tarea concreta: recoger un vaso azul con la mano izquierda, transferirlo a la mano derecha y depositarlo en posición vertical sobre una cesta de mimbre invertida. Está pensado para el robot humanoide bimanual ROBOTIS FFW SG2, equipado con pinzas CAD y cámaras de muñeca calibradas.

El modelo tiene 287.533.680 parámetros (unos 288 M) y se distribuye en formato safetensors, con un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) en la raíz y diez checkpoints intermedios cada 10.000 pasos. Sigue el formato de LeRobot, la librería de referencia para aprendizaje por imitación, mediante un fork específico de ROBOTIS (lerobot-cyclo).

Su relevancia radica en que ejemplifica el flujo completo de entrenamiento de políticas robóticas en simulación con Isaac Lab y su empaquetado para despliegue con LeRobot. La política se entrenó exclusivamente con 2.012 demostraciones simuladas generadas por un programa de tipo code-as-policy, no con datos reales, lo que la convierte en un caso de estudio de sim-to-real y de generación sintética de datos de manipulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con codificador visual ResNet18 por cámara y horizonte de predicción de 64 pasos |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; n_obs_steps = 1, horizonte de acción 64 (32 ejecutados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy de tipo DDPM con 100 pasos de difusión, que predice secuencias de acciones de 16 articulaciones a 15 Hz. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha) se procesa con un codificador ResNet18 independiente, y las representaciones visuales se combinan con un vector de estado articular de 22 dimensiones. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32, con un único paso de observación (n_obs_steps = 1).

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con tasa de aprendizaje 1e-4 y scheduler cosine, semilla 1000, en una única NVIDIA RTX 4090 de 24 GB. Los datos provienen de 2.012 demostraciones simuladas en Isaac Lab generadas por el programa `cup_handover_v3.py`, que implementa la tarea con aleatorización por episodio de la inclinación y azimut de la pinza, la profundidad, el pre-cierre, la altura de agarre, el desplazamiento y giro de colocación y los tiempos. Se aplicó un aumento de imagen intenso (hasta 5 transformaciones aleatorias entre brillo, contraste, saturación, tono, nitidez, afinidad, perspectiva, desenfoque, borrado aleatorio y escala de grises) y no se añadió ruido al estado. El muestreo de frames es uniforme sobre todos los frames (EpisodeAwareSampler de LeRobot).

## Capacidades

- Generación de trayectorias de acción para control bimanual de 16 articulaciones a 15 Hz.
- Percepción visual multimodal mediante tres cámaras (cabeza y dos muñecas) a 240x240 píxeles.
- Ejecución de una tarea específica de manipulación: agarre por el borde, transporte, transferencia entre manos y colocación vertical.
- Condicionamiento por cadena de tarea: "pick up the blue cup with the left hand, hand it to the right hand, and place it on the basket".
- Robustez ante variaciones visuales gracias al aumento de imagen agresivo durante el entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas; es un modelo puramente motor-visual.

## Casos de uso

- Investigación en sim-to-real para manipulación bimanual: servir como punto de partida para evaluar la transferencia de una política entrenada solo en simulación al ROBOTIS FFW SG2 real, midiendo la brecha de rendimiento entre Isaac Lab y el hardware.
- Generación sintética de datos de manipulación: el pipeline code-as-policy con aleatorización paramétrica puede reutilizarse para producir demostraciones de otras tareas de transferencia entre manos sin teleoperación humana.
- Benchmark de diffusion policies en robótica: comparar la receta (ResNet18 por cámara, DDPM 100 pasos, horizonte 64/32) frente a otras configuraciones de LeRobot sobre la misma tarea.
- Estudio de aumento de datos visual: analizar el efecto del aumento agresivo (hasta 5 transformaciones por imagen) en la robustez de la política ante cambios de iluminación y punto de vista.
- Docencia en aprendizaje por imitación: el repositorio incluye checkpoints intermedios cada 10.000 pasos, lo que permite trazar la curva de aprendizaje y estudiar la convergencia de la política.
- Prototipado de tareas de pick-and-place con objetos deformables o frágiles: la tarea del vaso sobre cesta es representativa de manipulaciones que requieren control de fuerza y orientación precisa.
- Evaluación de forks de LeRobot: validar el fork lerobot-cyclo de ROBOTIS como base para despliegues con hardware SG2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M parámetros en fp32 serían aproximadamente 1,2 GB de pesos, más el coste de los tres ResNet18 y del proceso de difusión (100 pasos). En fp16 se reduciría a unos 0,6 GB.
- GPU de entrenamiento: una NVIDIA RTX 4090 de 24 GB (documentado en la model card).
- GPU recomendadas para inferencia: cualquier GPU consumer con al menos 8 GB de VRAM debería ser suficiente; no se especifican requisitos mínimos.
- Cabe en GPU consumer: sí, con holgura; una RTX 3060 de 12 GB o superior es suficiente para los pesos, aunque el rendimiento en tiempo real depende del bucle de control a 15 Hz.
- Opciones de despliegue: LeRobot con el fork lerobot-cyclo de ROBOTIS; `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-cap2k")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; la política está diseñada para ejecutarse a 15 Hz, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-cap2k | 288 M | horizonte 64 (32 ejecutados) | Transferencia bimanual de vaso a cesta | other | Hugging Face |
| Otras diffusion policies de LeRobot | no disponible | configurable | Manipulación genérica | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas ACT de LeRobot | no disponible | configurable | Manipulación genérica | Apache 2.0 (LeRobot) | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos simulados (Isaac Lab); el rendimiento en el robot real no está validado y la model card indica que los resultados de evaluación están pendientes.
- Especializado en una única tarea y un único objeto (vaso azul de 6,25 pulgadas sobre cesta de 3,25 pulgadas); no generaliza a otras tareas sin reentrenamiento.
- Depende de un hardware concreto (ROBOTIS FFW SG2 con pinzas CAD y cámaras de muñeca calibradas); no es portable a otras plataformas sin recalibración.
- Licencia "other": no se especifican los términos exactos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue comercial.
- El dataset de entrenamiento (`pick-cup-basket-cap2k-3cam`) no está publicado en Hugging Face, lo que limita la reproducibilidad.
- Riesgo de sobreajuste a la distribución de las demostraciones simuladas: la aleatorización cubre inclinación, azimut, profundidad, altura y tiempos, pero no variaciones de iluminación, textura o dinámica del robot real.
- No incluye mecanismos de seguridad ni de parada ante fallos; en producción requeriría capas de supervisión externas.
- El repositorio de 11,5 GB incluye diez checkpoints intermedios, lo que incrementa el coste de almacenamiento y descarga.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-cap2k
- LeRobot (librería base): https://github.com/huggingface/lerobot
- Fork lerobot-cyclo de ROBOTIS: no disponible en la información proporcionada
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- Dataset de entrenamiento: no disponible en Hugging Face (indicado en la model card)
