# digas99/smolvla_so101_tray_v5

## Resumen

smolvla_so101_tray_v5 es una política robótica de tipo vision-language-action (VLA) publicada por el usuario digas99 en Hugging Face. Se trata de un fine-tune completo de SmolVLA (450 millones de parámetros), el modelo base de LeRobot para control de robots, especializado en una tarea concreta: un brazo robótico SO-101 que mueve objetos entre una mesa y una bandeja transparente en ambas direcciones. El modelo no es un asistente conversacional ni un generador de texto: es un controlador de robot que recibe imágenes de dos cámaras y el estado de las articulaciones, y emite comandos de acción a 30 Hz.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo típico de la robótica de imitación moderna con LeRobot: partir de un modelo base preentrenado, recoger demostraciones teleoperadas, añadir correcciones humanas sobre los fallos del modelo anterior e iterar. Por otro, muestra un caso de diseño deliberadamente "class-agnostic": la política nunca recibe el nombre del objeto, sino que arranca desde una posición de hover fijada por un segmentador externo. Esta quinta iteración (v5) incorpora 58 correcciones humanas grabadas sobre los estados de fallo de la v4.

El modelo está pensado para desplegarse en hardware de borde (fue entrenado en una NVIDIA Jetson AGX Thor) y su licencia Apache 2.0 permite uso comercial. No obstante, su ámbito de aplicación es extremadamente estrecho: solo funciona con el contrato de entrada/salida y la posición inicial descritos por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer con backbone VLM y cabeza de acciones por flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 1 paso, `n_obs_steps = 1`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; entrenamiento en bf16 con maestros fp32) |
| Idiomas soportados | no disponible (las tareas se especifican con dos cadenas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA combina un backbone de visión-lenguaje con una cabeza de predicción de acciones entrenada mediante flow matching. La política recibe dos imágenes RGB de 480x640 (cámara superior fija y cámara de muñeca), el estado de 6 articulaciones del SO-101 y una cadena de tarea; produce un chunk de 50 acciones (`chunk_size = 50`, `n_action_steps = 50`), lo que equivale a 1,67 segundos de comandos a 30 fps por inferencia. El fine-tune es completo: `train_expert_only=false` y `freeze_vision_encoder=false`, aunque LeRobot mantiene congeladas la última capa del VLM, `lm_head` y la normalización final. El backbone se carga en bf16 pero se eleva a fp32 para los pesos maestros, porque a la tasa de aprendizaje empleada las actualizaciones de AdamW se perderían en bf16.

El entrenamiento usó 30.000 pasos con batch de 16 (unas 3 pasadas sobre 157.854 frames), learning rate 5e-05 con 1.000 pasos de warm-up y decaimiento coseno hasta 1/20, aumento de imagen por defecto de LeRobot y checkpoints cada 2.500 pasos. El dataset `digas99/so101_tray_train_v5` contiene 529 episodios (157.854 frames a 30 fps) en formato LeRobot v3.0 con `robot_type: so_follower`, y fusiona snapshots inmutables con procedencia registrada: 135 demostraciones mesa-bandeja, 90 bandeja-mesa, 73 correcciones A v1, 19 correcciones B v2, 27 y 9 correcciones de pared, 46 correcciones combinadas, 41 demostraciones de hover sobre mesa desordenada, 31 correcciones de v3 y 58 correcciones de v4. Cada episodio lleva un registro de procedencia (objeto, celda de rejilla, adyacencia, distractores, contenido de la bandeja, posición de hover) en `meta/provenance.jsonl`. No hubo datos de validación retenidos: la evaluación es en el robot, sobre diez layouts fijos.

## Capacidades

- Control robótico de manipulación: mueve objetos entre mesa y bandeja en ambas direcciones con un brazo SO-101 de 6 grados de libertad.
- Percepción visual dual: procesa simultáneamente cámara superior fija y cámara de muñeca.
- Política class-agnostic: no recibe el nombre del objeto; funciona con nueve objetos domésticos del set de entrenamiento y se evalúa con objetos no vistos.
- Generación de acciones en chunk: 50 acciones por inferencia, re-inferencia cada 50 llamadas a 30 Hz.
- Seguimiento de instrucción de tarea: dos cadenas fijas en inglés, una por dirección.
- Tolerancia a escenas complejas: entrenado con vecinos en contacto, distractores y bandejas parcialmente llenas en proporciones conocidas.
- No soporta tool calling, ni razonamiento multi-paso, ni generación de texto, ni visión general, ni audio.

## Casos de uso

- Automatización de picking y placing en laboratorio: el modelo mueve objetos entre una superficie y una bandeja transparente en ambas direcciones, lo que permite montar una celda de clasificación sencilla con un SO-101 y dos cámaras.
- Iteración de políticas por corrección humana: el flujo de v5 (partir de v4 y grabar 58 correcciones sobre sus estados de fallo) sirve como plantilla para equipos que quieran mejorar un modelo de imitación sin reentrenar desde cero.
- Benchmark de generalización a objetos no vistos: al ser class-agnostic y reservar objetos fuera del set de entrenamiento, es útil para medir hasta qué punto una política VLA generaliza por forma y posición.
- Despliegue en hardware de borde: entrenado en una Jetson AGX Thor, es adecuado para inferencia local en robots con recursos limitados, sin depender de la nube.
- Investigación en manipulación con oclusiones: la bandeja transparente y los objetos en contacto generan oclusiones y reflejos que lo convierten en un caso de prueba realista para políticas visuomotoras.
- Docencia y reproducción de experimentos: el repositorio incluye `verify_policy.py`, que ejecuta el checkpoint sobre frames del dataset y reproduce las métricas, lo que facilita la validación en una máquina de despliegue.
- Generación de datos sintéticos de trayectoria: el chunk de 50 acciones a 30 Hz puede usarse para estudiar suavidad y estabilidad de políticas de flow matching en tareas de contacto.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a una política robótica). Los únicos datos numéricos son la pérdida de entrenamiento (flow-matching MSE) y una verificación offline.

| Paso | Loss | Learning rate |
|---|---|---|
| 100 | 0.422 | 2.6e-06 |
| 1K | 0.229 | 5.0e-05 |
| 11K | 0.105 | 3.5e-05 |
| 21K | 0.063 | 1.2e-05 |
| 30K | 0.050 | 2.5e-06 |

La model card menciona una verificación offline sobre 15 frames del dataset (3 por tarea) que debe reproducirse en la máquina de despliegue hasta el tercer decimal, pero el texto proporcionado está truncado y no incluye los valores. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros, en bf16 los pesos ocupan aproximadamente 0,9 GB, y en fp32 unos 1,8 GB, a lo que hay que sumar activaciones y buffers de imagen (dos cámaras de 480x640).
- GPU recomendadas: el autor entrenó en NVIDIA Jetson AGX Thor; para inferencia son razonables GPUs de borde o consumer con al menos 4-8 GB de VRAM, aunque no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, pero no hay confirmación en la información disponible.
- Opciones de despliegue: LeRobot 0.6.1 (`pip install "lerobot[smolvla]==0.6.1"`), con `SmolVLAPolicy.from_pretrained` y `make_pre_post_processors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: la política re-infiere cada 50 llamadas a 30 Hz, es decir, un chunk de 1,67 s de acciones por inferencia. No se publican latencias por inferencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_tray_v5 | 450 M | VLA fine-tune para SO-101 | no aplica | apache-2.0 | Hugging Face (digas99) |
| lerobot/smolvla_base | no disponible en la información | VLA base preentrenado | no aplica | no disponible en la información | Hugging Face (lerobot) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | Políticas de imitación | no aplica | no disponible en la información | Hugging Face (lerobot) |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; solo se confirma que el modelo base es `lerobot/smolvla_base` y que la política se integra en el ecosistema LeRobot.

## Limitaciones y advertencias

- Ámbito estrecho: solo funciona con el brazo SO-101, el contrato de entrada/salida descrito y las dos cadenas de tarea exactas; no es un modelo de propósito general.
- Dependencia de la posición inicial: espera arrancar desde un hover de unos 10 cm sobre el objetivo con las pinzas giradas; desde la pose de reposo nunca ha visto el acercamiento.
- Sin datos de validación retenidos: la evaluación es en robot sobre diez layouts fijos, lo que limita la comparabilidad con otros trabajos.
- Riesgo de fallo en objetos no vistos: el propio autor reserva objetos fuera del set para medir generalización, lo que implica que el rendimiento en ellos no está garantizado.
- Dependencia de un segmentador externo: el carácter class-agnostic se apoya en un supervisor con segmentador que coloca el brazo en el hover; sin él, el contrato de uso se rompe.
- Posibles sesgos de datos: el dataset está limitado a nueve objetos domésticos, layouts concretos y condiciones de iluminación no documentadas.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erráticas o inseguras fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar en el robot antes de producción.
- Repositorio grande: 53,3 GB, lo que encarece la descarga y el almacenamiento en máquinas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/digas99/smolvla_so101_tray_v5
- Dataset de entrenamiento: https://huggingface.co/datasets/digas99/so101_tray_train_v5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
