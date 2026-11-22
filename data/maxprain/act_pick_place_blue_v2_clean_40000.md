# MaxPrain/act_pick_place_blue_v2_clean_40000

## Resumen

`act_pick_place_blue_v2_clean_40000` es una política de control robótico basada en la arquitectura ACT (Action Chunking Transformer) entrenada con la librería LeRobot 0.7.0 de Hugging Face para un brazo robótico de sobremesa SO-101. Su tarea es concreta y acotada: coger un cubo de la pila azul situada en una posición fija de la mesa y depositarlo en una caja. El modelo lo publica el usuario MaxPrain como parte de un proyecto personal de dispensador asistido por voz documentado en GitHub.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors. No es un modelo de lenguaje: es una política de imitación que recibe dos cámaras (vista superior y vista de muñeca a 640×480 y 30 fps) más el estado de las seis articulaciones del brazo, y emite bloques de 100 acciones correspondientes a objetivos articulares. Se entrenó durante 40.000 pasos sobre 18 episodios de teleoperación en una única mesa e iluminación.

Su relevancia es la de un ejemplo práctico y reproducible de entrenamiento de políticas visuomotoras con LeRobot en hardware asequible (se usó una GPU `a10g-small` en Hugging Face Jobs). Es un artefacto de investigación y demostración, no un componente listo para producción: el propio autor advierte que la política no entiende colores y repite una trayectoria aprendida para una posición concreta de la mesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot 0.7.0 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visomotora; ventana de observación de 2 cámaras + estado de 6 articulaciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje; la tarea se fija con la cadena `pick the blue cube and place it in the box`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación típico de las políticas paso a paso. En esta implementación, la entrada combina las imágenes de las cámaras `top` y `wrist` (640×480, 30 fps) con el vector de estado de las seis articulaciones del SO-101, y la salida son objetivos articulares en bloques de 100 acciones. El entrenamiento se realizó con `lerobot-train --policy.type=act` durante 40.000 pasos en una instancia `a10g-small` de Hugging Face Jobs.

Los datos provienen del dataset `MaxPrain/pick_place_blue_v2_clean`: 18 episodios de teleoperación con un par leader/follower SO-101 a 30 fps. No se documenta el número total de tokens ni de frames, ni el uso de RLHF o DPO (no aplica en este paradigma). La model card indica que se entrenó solo con demos base de caja vacía y que no se ha medido la tasa de éxito con rigor. No se describe ninguna innovación técnica adicional más allá del uso estándar de ACT con chunking de acciones.

## Capacidades

- Control visomotor de un brazo SO-101 de seis articulaciones: genera objetivos articulares a partir de dos cámaras y del estado propioceptivo.
- Ejecución de una tarea de pick-and-place concreta: coger el cubo azul de una posición fija y dejarlo en la caja.
- Predicción en bloques de 100 acciones, lo que permite ejecutar secuencias de movimiento relativamente largas sin replanificación paso a paso.
- Funcionamiento a 30 fps con dos flujos de vídeo simultáneos (cámara superior y de muñeca).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene modo de pensamiento, visión general, audio ni ninguna capacidad fuera del control robótico descrito.

## Casos de uso

- Demostración docente de entrenamiento de políticas ACT con LeRobot: sirve como referencia completa (dataset, comando de entrenamiento, comando de rollout) para cursos y talleres de robótica de imitación en brazos de bajo coste.
- Prototipo de dispensador asistido por voz: el repositorio del autor lo integra en un servicio de robot con agente de voz que decide qué política lanzar; este modelo cubre la rama del cubo azul.
- Banco de pruebas para detección de color y enrutado de políticas: combinado con un detector HSV sobre la cámara `top`, permite validar arquitecturas de selección de política según el objeto detectado.
- Investigación sobre corrección de altura en pilas de cubos: la model card documenta un offset manual sobre `shoulder_lift` durante el agarre, útil como caso de estudio de ajuste fino de trayectorias aprendidas.
- Validación de pipelines de despliegue en hardware Apple (MPS) o GPU pequeña: el comando de rollout usa `--device=mps`, lo que lo hace útil para probar LeRobot en equipos de consumo.
- Reproducción de experimentos de imitación con pocos datos: 18 episodios y 40.000 pasos constituyen una línea base para comparar con otras políticas o con más demos.
- Automatización de una celda de picking muy controlada: en un entorno con posición de mesa, iluminación y cámara fijas, puede ejecutar la tarea de forma repetitiva siempre que no haya cambios de escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la tasa de éxito no se ha medido con rigor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras publicadas; con 51,7 M de parámetros, el modelo es muy pequeño y cabe holgadamente en cualquier GPU moderna, pero no se documenta el consumo real.
- GPU recomendadas: no hay recomendación oficial. El entrenamiento se hizo en una `a10g-small` de Hugging Face Jobs; el rollout documentado se ejecuta en `mps` (Apple Silicon).
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no se especifican modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base`, `--policy.path=MaxPrain/act_pick_place_blue_v2_clean_40000` y `--device=mps` o CUDA; requiere un robot `so101_follower` con puerto e ID configurados y dos cámaras OpenCV (índices 1 y 0, 640×480, 30 fps).
- Latencia y throughput: se ejecuta a 30 fps según el comando de ejemplo (`--fps=30 --duration=12`), pero no se publican medidas de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_pick_place_blue_v2_clean_40000` (este) | 51,7 M | 2 cámaras 640×480 + 6 articulaciones | Pick-and-place de cubo azul en SO-101 | Apache 2.0 | Hugging Face, 1 descarga |
| Otras políticas ACT de LeRobot | no disponible | no disponible | Tareas diversas de manipulación | habitualmente Apache 2.0 | ecosistema LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | observaciones visuales + estado | Manipulación por difusión de acciones | no disponible | ecosistema LeRobot |
| Políticas VLA tipo OpenVLA / π0 | no disponible | imágenes + instrucción en lenguaje | Manipulación generalista | no disponible | ecosistema abierto |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- La política no entiende colores: repite una trayectoria aprendida para una posición fija de la mesa. Si se mueve la pila, irá igualmente al lugar donde se entrenó.
- Entrenada con 18 episodios en una sola mesa y una sola iluminación; la generalización a otras escenas, cámaras o condiciones de luz es nula o no medida.
- La tasa de éxito no se ha medido con rigor; no hay cifras de fiabilidad.
- Con manos o cuerpos dentro de la imagen de la cámara `top`, la trayectoria cambia y el comportamiento se degrada.
- Las pilas de varios cubos requieren una corrección manual de altura (offset sobre `shoulder_lift` durante el agarre), documentada en el repositorio del autor.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de ejecutar movimientos incorrectos ante entradas fuera de distribución.
- Sesgos conocidos: no documentados; el entrenamiento con pocas demos implica un fuerte sesgo hacia la configuración exacta de la mesa de captura.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo no está validado para entornos de producción ni de seguridad.
- No es un producto sanitario; el autor aclara que los "medicamentos" del proyecto son cubos de colores.
- El modelo tiene 1 descarga y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/MaxPrain/act_pick_place_blue_v2_clean_40000
- Dataset: https://huggingface.co/datasets/MaxPrain/pick_place_blue_v2_clean
- Repositorio del proyecto (código, servicio del robot, agente de voz y documentación): https://github.com/maxprain12/lucia-so101-dispensador
- LeRobot: https://github.com/huggingface/lerobot
