# MaxPrain/act_pick_place_green_clean2_40000

## Resumen

`MaxPrain/act_pick_place_green_clean2_40000` es una política de control robótico basada en ACT (Action Chunking Transformer) entrenada con la librería LeRobot 0.7.0 para un brazo manipulador SO-101. Resuelve una tarea concreta de pick-and-place: coger un cubo del montón verde situado en una posición fija de la mesa y depositarlo en una caja. No es un modelo de lenguaje ni un modelo multimodal general, sino una política visomotora que mapea dos cámaras (vista superior y vista de muñeca) más el estado articular a una secuencia de objetivos de articulación.

El modelo tiene 51.668.614 parámetros (~51,7 M), un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. Fue entrenado durante 40.000 pasos en Hugging Face Jobs con una GPU `a10g-small`, a partir de 19 episodios de teleoperación a 30 fps. La relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de imitación robótica (dataset, entrenamiento y despliegue con `lerobot-rollout`) sobre hardware asequible, no como componente de propósito general.

Un punto crítico documentado por el autor es que la política no interpreta el color ni la posición de los objetos: reproduce una trayectoria aprendida para una única localización de la mesa. La selección por color se delega a un detector HSV externo sobre la cámara `top` que decide qué política lanzar en cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot 0.7.0 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora con historial de observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se pasa como cadena fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice bloques de acciones futuras en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la ejecución. En esta configuración, la entrada son dos flujos de imagen de 640×480 a 30 fps (cámaras `top` y `wrist`) junto con el estado de las 6 articulaciones del SO-101, y la salida son objetivos para esas mismas 6 articulaciones emitidos en bloques de 100 acciones.

El entrenamiento se realizó con `lerobot-train --policy.type=act` durante 40.000 pasos sobre el dataset `MaxPrain/pick_place_green_clean2`, compuesto por 19 episodios de teleoperación leader/follower a 30 fps en una sola mesa y una sola condición de iluminación. No se documenta uso de RLHF, DPO ni datos sintéticos. El autor indica que la tasa de éxito no se ha medido con rigor y que, en la práctica, la altura de agarre se corrige sumando un pequeño offset a `shoulder_lift` porque los cubos están apilados.

## Capacidades

- Generación de trayectorias de pick-and-place para un brazo SO-101: coger el cubo verde de una posición fija y dejarlo en una caja.
- Control articular de 6 grados de libertad mediante predicción de bloques de 100 acciones.
- Fusión de dos vistas de cámara (`top` y `wrist`) con el estado propioceptivo de las articulaciones.
- Ejecución a 30 fps con `lerobot-rollout` sobre el robot `so101_follower`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural; la tarea se pasa como cadena de texto fija.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de las cámaras del robot.

## Casos de uso

- Demostración reproducible de imitación robótica: sirve como referencia completa de un pipeline LeRobot (dataset, entrenamiento en HF Jobs, despliegue con `lerobot-rollout`) para equipos que quieran replicar el flujo con su propio brazo SO-101.
- Clasificación de objetos por color en una célula de pick-and-place: combinada con un detector HSV sobre la cámara `top`, permite enrutar entre distintas políticas según el color del cubo presente en cada posición de la mesa.
- Automatización de tareas de recogida en entornos controlados: con posición de objetos e iluminación fijas, la política ejecuta el ciclo de agarre y depósito sin intervención humana.
- Docencia e investigación en robótica de bajo coste: el modelo cabe en 0,2 GB y puede ejecutarse en un portátil con MPS, lo que facilita prácticas y experimentos sin infraestructura GPU dedicada.
- Base para fine-tuning con nuevos datasets: al estar en formato LeRobot y licencia Apache 2.0, se puede reentrenar con demos adicionales para ampliar posiciones, colores o condiciones de iluminación.
- Prototipado de asistentes robóticos con voz: el repositorio del autor integra un agente de voz y un servicio de robot, de modo que la política actúa como capa de ejecución física de un dispensador de cubos de colores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la tasa de éxito no se ha medido con rigor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con ~51,7 M de parámetros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, aunque no se documenta una cifra concreta.
- GPU recomendadas: el autor entrenó en `a10g-small` (Hugging Face Jobs); para inferencia se documenta ejecución en `--device=mps` (Apple Silicon).
- Cabe en GPU consumer: sí, por tamaño; el cuello de botella real es el procesamiento de dos cámaras a 640×480 y 30 fps.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=MaxPrain/act_pick_place_green_clean2_40000`, sobre `robot.type=so101_follower` con `max_relative_target=10`.
- Latencia y throughput: no disponibles; la ejecución se fija a `--fps=30` y `--duration=12` en el ejemplo de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MaxPrain/act_pick_place_green_clean2_40000` | 51,7 M | no aplica | Pick-and-place verde en SO-101 | Apache 2.0 | Hugging Face, 2 descargas |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Tareas de manipulación diversas | variable | Hugging Face |
| Políticas basadas en Diffusion Policy | no disponible | no aplica | Manipulación visomotora | variable | Hugging Face / repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La política no entiende colores ni detecta objetos: repite una trayectoria aprendida para una posición fija de la mesa. Si se mueve el montón de cubos, seguirá yendo al punto original.
- Entrenada con 19 episodios en una sola mesa y una sola iluminación; la generalización a otras condiciones es muy limitada.
- La tasa de éxito no se ha medido con rigor, por lo que no hay garantías cuantitativas de fiabilidad en producción.
- La presencia de manos o cuerpos en la cámara `top` altera la trayectoria ejecutada.
- Los cubos apilados requieren un offset manual en `shoulder_lift` durante el agarre; sin esa corrección el agarre puede fallar.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí existe riesgo de ejecutar movimientos incorrectos ante observaciones fuera de distribución.
- No es un producto sanitario: los "medicamentos" del proyecto son cubos de colores, según advierte el autor.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxPrain/act_pick_place_green_clean2_40000
- Dataset: https://huggingface.co/datasets/MaxPrain/pick_place_green_clean2
- Repositorio del proyecto: https://github.com/maxprain12/lucia-so101-dispensador
- LeRobot: https://github.com/huggingface/lerobot
