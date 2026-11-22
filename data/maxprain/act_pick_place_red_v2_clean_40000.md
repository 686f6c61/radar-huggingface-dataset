# MaxPrain/act_pick_place_red_v2_clean_40000

## Resumen

`MaxPrain/act_pick_place_red_v2_clean_40000` es una política de control robótico basada en ACT (Action Chunking with Transformers) publicada por el usuario MaxPrain y entrenada con la librería LeRobot 0.7.0 de Hugging Face. Su única tarea es coger un cubo rojo de una posición fija sobre la mesa y depositarlo en una caja mediante un brazo robótico SO-101. No es un modelo de lenguaje ni un modelo multimodal generalista: es una política de imitación que mapea dos cámaras (vista superior y vista de muñeca) más el estado de las seis articulaciones a bloques de 100 acciones articulares.

El modelo tiene 51.668.614 parámetros en formato safetensors (aproximadamente 0,2 GB de repositorio) y se entrenó durante 40.000 pasos sobre un conjunto de solo 21 episodios de teleoperación a 30 fps. La relevancia es acotada pero clara para quien trabaja con robótica de bajo coste: demuestra un flujo completo de entrenamiento y despliegue de políticas visuomotoras con LeRobot sobre hardware asequible, con un caso de uso documentado de principio a fin en un repositorio público.

Conviene subrayar que la política no detecta colores ni generaliza posiciones: repite una trayectoria aprendida para un único emplazamiento de la pila de cubos. En el proyecto original, un detector HSV externo decide qué política lanzar en función del color observado, y el modelo se limita a ejecutar el movimiento correspondiente al cubo rojo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 cámaras 640×480 a 30 fps y estado de 6 articulaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural como tarea principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación diseñada para control robótico que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de compuesto y suaviza la ejecución. En esta política concreta, la entrada combina dos flujos de imagen de 640×480 a 30 fps (cámaras `top` y `wrist`) con el vector de estado de las seis articulaciones del brazo SO-101; la salida son objetivos articulares agrupados en bloques de 100 acciones.

El entrenamiento se realizó con `lerobot-train --policy.type=act` durante 40.000 pasos sobre Hugging Face Jobs con una instancia `a10g-small`. El dataset `MaxPrain/pick_place_red_v2_clean` contiene 21 episodios de teleoperación con configuración leader/follower sobre SO-101 a 30 fps, todos ellos con la caja vacía. No se documenta el uso de RLHF, DPO ni ningún proceso de refinamiento por preferencias; es imitación supervisada pura sobre demostraciones. La tarea declarada es `pick the red cube and place it in the box`.

## Capacidades

- Control visuomotor de un brazo SO-101 de 6 grados de libertad mediante predicción de chunks de 100 acciones.
- Ejecución de una tarea concreta de pick-and-place: coger el cubo rojo de una posición fija y dejarlo en una caja.
- Procesamiento conjunto de dos cámaras (superior y de muñeca) y del estado articular en tiempo real a 30 fps.
- Integración con el ecosistema LeRobot 0.7.0 (`lerobot-rollout`, `lerobot-train`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta el ciclo completo de agarre y depósito de un cubo sobre una mesa de entrenamiento, útil como banco de pruebas para validar cadenas de teleoperación, calibración y despliegue con LeRobot.
- Docencia y formación en robótica de imitación: sirve como ejemplo reproducible de entrenamiento ACT con 21 episodios y 40.000 pasos sobre GPU asequible (`a10g-small`), adecuado para cursos que necesiten un caso completo desde la captura de demos hasta el rollout.
- Base para sistemas multi-política con selección por color: combinada con un detector HSV externo sobre la cámara `top`, el modelo actúa como la política especializada del cubo rojo dentro de un dispensador que conmuta entre políticas según el color detectado.
- Prototipado de asistentes robóticos de voz: el repositorio del proyecto integra un agente de voz y un servicio de robot; esta política puede emplearse como capa de ejecución física para comandos simples de recogida.
- Validación de pipelines de datos de teleoperación: al estar entrenada sobre un dataset público de 21 episodios, permite comprobar la calidad de nuevas capturas comparando el comportamiento aprendido con el esperado.
- Investigación sobre limitaciones de generalización: sirve para estudiar cómo una política ACT sobreajustada a una posición fija reacciona ante cambios de iluminación, presencia de manos en la imagen o desplazamiento de la pila, corrigiendo la altura con un offset en `shoulder_lift`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la tasa de éxito no se ha medido con rigor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en un repo de 0,2 GB, la carga en memoria es del orden de cientos de MB, pero la model card no publica cifras de VRAM.
- GPU recomendadas: el entrenamiento se realizó en `a10g-small` (Hugging Face Jobs); el ejemplo de rollout de la model card usa `--device=mps`, es decir, Apple Silicon.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no se documentan modelos concretos de GPU de consumo ni requisitos mínimos.
- Opciones de despliegue: LeRobot 0.7.0 mediante `lerobot-rollout` con `--strategy.type=base`, robot `so101_follower` y cámaras OpenCV. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el control se ejecuta a 30 fps según la configuración del ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaxPrain/act_pick_place_red_v2_clean_40000 | 51.668.614 | 2 cámaras 640×480 a 30 fps + estado de 6 articulaciones | Pick-and-place de cubo rojo en SO-101 | Apache 2.0 | Hugging Face, 2 descargas |
| Otras políticas ACT para LeRobot | no disponible | no disponible | Tareas de manipulación diversas | no disponible | no disponible |
| Políticas tipo Diffusion Policy para LeRobot | no disponible | no disponible | Manipulación visuomotora | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; las filas marcadas como no disponible reflejan esa ausencia y no deben interpretarse como valores estimados.

## Limitaciones y advertencias

- La política no entiende colores: repite una trayectoria aprendida para una posición fija de la mesa. Si se mueve la pila de cubos, seguirá yendo al emplazamiento original.
- Entrenada con pocas decenas de demostraciones (21 episodios), una sola mesa y una sola iluminación; la generalización a otros entornos es muy limitada.
- La tasa de éxito no se ha medido con rigor, por lo que no hay garantías cuantitativas de fiabilidad en producción.
- La presencia de manos o cuerpos dentro de la imagen `top` altera la trayectoria aprendida.
- Las pilas de varios cubos requieren un offset manual en `shoulder_lift` durante el agarre para corregir la altura; sin esa corrección el comportamiento puede fallar.
- Sesgos conocidos: no documentados más allá del sobreajuste a la posición e iluminación de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de movimientos incorrectos ante entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye tal cual.
- No es un producto sanitario: los «medicamentos» del proyecto son cubos de colores, según advierte la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxPrain/act_pick_place_red_v2_clean_40000
- Dataset de entrenamiento: https://huggingface.co/datasets/MaxPrain/pick_place_red_v2_clean
- Repositorio del proyecto (código, servicio del robot, agente de voz y documentación): https://github.com/maxprain12/lucia-so101-dispensador
- LeRobot (librería de Hugging Face): https://github.com/huggingface/lerobot
