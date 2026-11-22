# MaxPrain/act_pick_place_blue_v3_40000

## Resumen

`MaxPrain/act_pick_place_blue_v3_40000` es una política robótica de tipo ACT (Action Chunking Transformer) entrenada con la librería LeRobot 0.7.0 de Hugging Face para un brazo robótico de bajo coste SO-101. Resuelve una tarea muy concreta de manipulación: coger el cubo de la pila azul situada en una posición fija de la mesa y dejarlo dentro de una caja. No es un modelo de lenguaje ni un modelo multimodal generalista, sino una política de imitación que mapea observaciones visuales y propioceptivas a comandos de articulación.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors. Se entrenó durante 40.000 pasos sobre 31 episodios de teleoperación con un SO-101 leader/follower a 30 fps, usando dos cámaras (top y wrist) a 640×480 y el estado de las 6 articulaciones como entrada, y produce bloques de 100 acciones objetivo para las 6 articulaciones.

Su relevancia es acotada pero práctica: demuestra un flujo completo de entrenamiento de políticas de imitación en hardware asequible con LeRobot, y forma parte de un proyecto mayor (un dispensador con agente de voz) donde un detector de color HSV decide qué política lanzar. La política en sí no entiende colores ni generaliza a nuevas posiciones: repite una trayectoria aprendida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación de 2 cámaras y estado de 6 articulaciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena `pick the blue cube and place it in the box`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks) a partir de observaciones. En esta implementación, la entrada combina dos flujos de imagen (cámara `top` y cámara `wrist`, ambas a 640×480 y 30 fps) con el estado de las 6 articulaciones del SO-101, y la salida son objetivos de las 6 articulaciones en bloques de 100 acciones. El entrenamiento se realizó con `lerobot-train --policy.type=act` durante 40.000 pasos en Hugging Face Jobs con instancia `a10g-small`.

Los datos provienen del dataset `MaxPrain/pick_place_blue_v3`: 31 episodios de teleoperación con SO-101 leader/follower a 30 fps, que incluyen demos base más demos con cubos ya dentro de la caja. No se documenta el número total de tokens ni el uso de RLHF/DPO, algo esperable en una política de imitación supervisada. La innovación práctica del proyecto no está en el modelo, sino en el sistema que lo rodea: un detector de color HSV sobre la cámara `top` selecciona qué política lanzar según el color del cubo, y se corrige la altura de las pilas sumando un pequeño offset a `shoulder_lift` durante el agarre.

## Capacidades

- Manipulación robótica pick-and-place: coger un cubo azul de una posición fija y depositarlo en una caja.
- Control de un brazo SO-101 mediante objetivos de 6 articulaciones en bloques de 100 acciones.
- Fusión de dos vistas de cámara (`top` y `wrist`) con el estado propioceptivo de las articulaciones.
- Ejecución de una trayectoria aprendida por imitación a partir de 31 episodios de teleoperación.
- Integración con LeRobot 0.7.0 (`lerobot-rollout`) y despliegue en dispositivos como MPS.
- No soporta tool calling, function calling, agentes multi-step, razonamiento, código, matemáticas, visión general ni capacidades multilingües: es una política específica de tarea.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger el cubo azul y dejarlo en la caja sobre un SO-101, útil para validar pipelines de imitación con LeRobot antes de escalar a tareas más complejas.
- Prototipado de sistemas multi-política: combinado con un detector de color HSV que decide qué política lanzar, sirve como una de las políticas de un dispensador que clasifica cubos por color.
- Docencia e investigación en robot learning: con 51,7 M de parámetros y 0,2 GB de pesos, es un ejemplo ligero y reproducible de entrenamiento ACT con teleoperación.
- Pruebas de despliegue en hardware asequible: la inferencia puede ejecutarse en un dispositivo con MPS (según el comando de ejemplo del autor), lo que permite iterar sin GPU de datacenter.
- Benchmark interno de éxito de agarre en pilas: el autor documenta la corrección de altura mediante offset en `shoulder_lift`, un caso práctico para estudiar el ajuste fino de políticas ante variaciones geométricas.
- Base para fine-tuning con nuevos datasets: al estar en LeRobot y con licencia Apache 2.0, puede reentrenarse con demos adicionales para otras posiciones u objetos dentro del mismo montaje.
- Integración en un agente de voz de extremo a extremo: forma parte del proyecto `lucia-so101-dispensador`, que incluye servicio del robot, agente de voz y documentación, como componente de ejecución de la acción física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la tasa de éxito no se ha medido con rigor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors de 0,2 GB, la huella de pesos es de aproximadamente 0,2 GB en precisión de entrenamiento, aunque el consumo real depende del runtime de LeRobot y de las cámaras.
- GPU recomendadas: el autor entrenó en `a10g-small` (Hugging Face Jobs); para inferencia el ejemplo usa `--device=mps`, por lo que se contempla hardware Apple Silicon.
- ¿Cabe en GPU consumer? Sí, por tamaño de pesos es viable en GPUs consumer con suficiente memoria para el runtime; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot 0.7.0 con `lerobot-rollout` (`--strategy.type=base`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles; el bucle de control se ejecuta a 30 fps (`--fps=30`) con `--duration=12` en el ejemplo, y `--robot.max_relative_target=10`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas ACT comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La política no entiende colores: repite una trayectoria aprendida para una única posición de la mesa. Si se mueve la pila, seguirá yendo al punto de entrenamiento.
- Entrenada con pocas decenas de demos (31 episodios), una sola mesa y una sola iluminación; la generalización es muy limitada.
- La tasa de éxito no se ha medido con rigor, por lo que no hay garantías cuantitativas para producción.
- Con manos o cuerpo dentro de la imagen `top`, la trayectoria cambia y el comportamiento se degrada.
- Las pilas de varios cubos requieren corrección manual de altura (offset en `shoulder_lift` durante el agarre); sin ese ajuste el agarre puede fallar.
- No es un producto sanitario; los «medicamentos» del proyecto son cubos de colores.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las obligaciones de la licencia en el despliegue.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de ejecutar acciones incorrectas ante observaciones fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxPrain/act_pick_place_blue_v3_40000
- Dataset de entrenamiento: https://huggingface.co/datasets/MaxPrain/pick_place_blue_v3
- Repositorio del proyecto (código, servicio del robot, agente de voz y documentación): https://github.com/maxprain12/lucia-so101-dispensador
- LeRobot (librería): https://github.com/huggingface/lerobot
