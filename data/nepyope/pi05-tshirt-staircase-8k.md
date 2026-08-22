# nepyope/pi05-tshirt-staircase-8k

## Resumen

El modelo `nepyope/pi05-tshirt-staircase-8k` es un ajuste fino de `lerobot/pi05_base`, un modelo fundacional de visión-lenguaje-acción (VLA) para robótica, especializado en la manipulación de objetos deformables. Concretamente, ha sido entrenado para que un robot humanoide Unitree G1 realice la tarea de recoger y colocar una camiseta sobre una mesa, utilizando tres cámaras (ego y dos muñecas). El autor es nepyope (Martino Russi), y el modelo está publicado en Hugging Face bajo el pipeline de robótica de la librería LeRobot.

La característica distintiva de este checkpoint es que emplea el programador de ruido **πR² (pi R cuadrado)** de tipo "staircase" (escalera), en lugar del objetivo de flujo compartido habitual. Este esquema asigna un nivel de ruido individual a cada una de las 50 posiciones del chunk de acción, de modo que la inferencia puede emitir acciones con un único paso de denoising por llamada, manteniendo el robot alimentado de forma continua. El modelo tiene 4,14 mil millones de parámetros en total, de los cuales solo 693 millones son entrenables (el VLM está congelado). El contexto de acción es de 50 pasos (1 segundo a 50 fps).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en pi0.5, con VLM congelado y proyecciones de acción entrenables |
| Parámetros totales | 4.143.474.482 (≈4,14B) |
| Parámetros activos | 693M (solo la parte experta de acción) |
| Longitud de contexto | No disponible (el chunk de acción es de 50 pasos, 1 segundo a 50 fps) |
| Tipos de cuantización | No disponible (repo solo contiene safetensors en fp32/bf16) |
| Idiomas soportados | No disponibles (modelo robótico, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (también incluye metadatos de preprocesado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi0.5_base`, un VLA de tipo transformer con codificador de visión, módulo de lenguaje y una cabeza de acción. En esta variante, el VLM completo está congelado y solo se entrenan los módulos de proyección y decodificación de acciones (`action_in_proj` y `action_out_proj`), junto con el bloque experto de acción. El entrenamiento se realizó sobre el dataset `nepyope/t-shirt_pick_and_place_clean`, que contiene 47 episodios con 101.254 frames a 50 fps, capturados con tres cámaras (ego_view, left_wrist, right_wrist) a 480×640.

La innovación clave es el **esquema de ruido escalera (staircase)** del marco πR² (arXiv 2607.26055). En lugar de un único nivel de ruido compartido por todos los pasos del chunk, cada posición del chunk tiene su propio nivel, que rampa desde limpio al inicio hasta ruido puro al final. Esto permite que el motor de inferencia reproduzca ese esquema como un punto fijo y realice un único denoising por llamada, emitiendo los `d` acciones correspondientes. El 20% de los ejemplos de entrenamiento usan el objetivo estándar de ruido compartido (`staircase_warmup_prob=0.2`) para conservar la capacidad de denoising desde ruido puro, necesaria para inicializar el buffer al inicio de un episodio.

El entrenamiento se realizó con 4×H100 80GB (una sola máquina, 39.9 GB por GPU), batch 128 (32 por GPU), optimizador AdamW con LR 1e-4 y decaimiento coseno hasta 1e-5, durante 8000 pasos (10,1 épocas). La pérdida final fue de 0.073, convergida desde la época 8.

## Capacidades

- **Manipulación robótica de objetos deformables**: entrenado específicamente para recoger y colocar una camiseta sobre una mesa, con control fino de 64 articulaciones y 2 pinzas (dimensión de acción 66).
- **Control continuo de robot humanoide**: produce comandos de acción para el robot Unitree 2, con 31 dimensiones de estado (29 DOF + 2 pinzas).
- **Inferencia en tiempo real**: gracias al esquema πR2, el modelo puede emitir acciones de forma continua con un único paso de denoising por llamada, sin esperar a generar un chunk completo.
- **Percepción multi-cámara**: procesa imágenes de tres cámaras simultáneamente (vista ego y dos muñecas) para decidir la acción.
- **Adaptación a tareas específicas**: el fine-tuning especializa el modelo generalista pi0.5 en una tarea concreta, mejorando el rendimiento en esa tarea frente al modelo base.
- **Capacidad de inicialización de buffer**: el 20% de ejemplos con objetivo compartido permite al modelo denoisir un chunk desde ruido puro, lo que es esencial para arrancar el episodio.

## Casos de uso

- **Automatización de tareas domésticas**: el modelo puede controlar un robot humanoide para realizar tareas de recogida y colocación de ropa, como doblar o colocar camisetas en superficies, reduciendo la intervención humana en entornos domésticos o de lavandería.
- **Investigación en manipulación deformable**: sirve como referencia para estudiar cómo los esquemas de ruido adaptativos (πR2) mejoran la latencia de inferencia en tareas de manipulación de objetos no rígidos.
- **Despliegue en robots Unitree G1**: el modelo está listo para ejecutarse en el robot Unitree G1 usando la infraestructura LeRobot, lo que permite su integración en laboratorios de robótica que ya usan ese hardware.
- **Evaluación de esquemas de denoising**: al ser un checkpoint entrenado con el esquema escalera, puede usarse como referencia para comparar con otros fine-tunes de pi0.5 que usan el objetivo estándar, midiendo la latencia y la estabilidad de la ejecución.
- **Generación de datos para entrenamiento posterior**: el modelo puede usarse en bucle de datos para generar nuevas demostraciones o para validar la robustez del controlador en escenarios con perturbaciones.
- **Investigación en generalización de VLA**: aunque está especializado en una tarea, su comportamiento puede analizarse para estudiar cómo los modelos fundacionales se adaptan a tareas específicas con pocos datos (47 episodios).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la evolución de la pérdida de entrenamiento, que converge a 0.073, pero no incluye métricas de evaluación en tareas reales (tasa de éxito, tiempo de completado, etc.).

## Requisitos de hardware

- **Entrenamiento**: se usaron 4×H100 80GB (39.9 GB por GPU) en una sola noda. No se ha probado en hardware inferior.
- **Inferencia**: no se especifican requisitos de VRAM para la inferencia en la información disponible. Dado que el modelo tiene 4.14B parámetros y se recomienda usar bf16, se estima que se necesita al menos 8-10 GB de VRAM para inferencia en bf16, más el espacio para los buffers y las imágenes. Para una ejecución fluida se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A10G, L4). No se han publicado datos de latencia o throughput.
- **Despliegue**: la inferencia se realiza mediante la herramienta `lerobot-rollout` de LeRobot, con el argumento `--inference.type=pir2` para activar el modo πR2. Se requiere tener instalado el código de LeRobot en el commit `0a53c2f2e` (con el soporte para πR2). No se mencionan alternativas como vLLM o llama.cpp, ya que es un modelo robótico no lingüístico.
- **Compatibilidad**: el modelo se ejecuta en hardware robótico con el robot Unitree G1 y cámaras compatibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto / chunk | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| `pi05-tshirt-staircase-8k` (este) | 4.14B | 50 pasos (1 s) | Fine-tune específico de tarea con πR2 | No disponible | Tarea de camiseta en Unitree G1 |
| `lerobot/pi05_base` | 4.14B | 50 pasos (1 s) | Pre-entrenamiento generalista en múltiples tareas | No disponible | Tareas generales de manipulación |
| `nepyope/g1_pillow` (otro fine-tune del mismo autor) | 4.14B | No disponible | Fine-tune para tarea de almohada | No disponible | Tarea de almohada en Unitree G1 |

La comparación directa no es posible porque no se han publicado métricas de rendimiento. Sin embargo, se puede afirmar que este modelo está especializado en una tarea concreta, mientras que pi0.5 base es generalista y probablemente tenga menor precisión en esa tarea específica pero mayor generalización a otras.

## Limitaciones y advertencias

- **Especialización excesiva**: el modelo solo ha sido entrenado para la tarea de poner una camiseta sobre una mesa. No generaliza a otras tareas de manipulación o a otros objetos deformables.
- **Dataset reducido**: solo 47 episodios, lo que puede llevar a sobreajuste y a una baja robustez ante variaciones en la posición de la camiseta, iluminación o condiciones de la mesa.
- **Dependencia de hardware específico**: el modelo está diseñado para el robot Unitree G1 y sus cámaras; no es portátil a otros robots sin reentrenamiento.
- **Riesgo de alucinación en acciones**: al ser un modelo generativo, puede producir comandos de acción no válidos o inestables en situaciones fuera de la distribución de entrenamiento.
- **Licencia no especificada**: no se indica la licencia, por lo que el uso comercial está sujeto a incertidumbre legal. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- **Dependencia del esquema πR2**: el checkpoint solo funciona con el motor de inferencia πR2 (`--inference.type=pir2`); no es compatible con el modo de inferencia estándar de pi0.5, lo que limita su uso en entornos que no tengan implementado ese esquema.
- **Falta de benchmarks**: no hay evidencia pública de rendimiento real en el robot, solo pérdida de entrenamiento. La eficacia en el mundo real no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nepyope/pi05-tshirt-staircase-8k
- Dataset de entrenamiento: https://huggingface.co/datasets/nepyope/t-shirt_pick_and_place_clean
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper πR²: https://arxiv.org/abs/2607.26055
- Pull request de LeRobot con soporte πR2: https://github.com/huggingface/lerobot/pull/4427
- Pull request de LeRobot para real-time-chunking: https://github.com/huggingface/lerobot/pull/4056
- Repositorio del autor en GitHub: https://github.com/nepyope/
- Página de modelos del autor en Hugging Face: https://huggingface.co/nepyope/models
