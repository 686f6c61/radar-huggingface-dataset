# jalal06/emodel30

## Resumen

emodel30 es una política de robótica (policy) entrenada con imitación para una tarea de ensamblaje real con un brazo Franka Panda. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de dos imágenes RGB (cámara principal y de muñeca) y del estado de las articulaciones, genera comandos de posición articular y apertura/cierre del gripper. Lo publica el usuario jalal06 en Hugging Face, con la librería LeRobot, y la tarea consiste en coger un cilindro amarillo ranurado e insertarlo en el agujero redondo de una placa blanca, después insertar un bloque verde escalonado en su hueco cuadrado y finalmente volver a la posición de reposo.

Técnicamente se trata de una política EBT (energy-based transformer): un codificador visual CLIP ViT-B/16 congelado o adaptado más un transformer de energía con modulación AdaLN que produce trozos (chunks) de 18 acciones, de las cuales se ejecutan 16 antes de volver a planificar. El checkpoint tiene 256.371.495 parámetros (~256 M) y un tamaño de repositorio de 1,0 GB, lo que lo hace desplegable en una GPU de consumo.

Su relevancia es acotada pero interesante para quien trabaja en manipulación fina: es un ejemplo reproducible de política de inserción de precisión (peg-in-hole de dos objetos) entrenada con solo 73 demostraciones de teleoperación con SpaceMouse, y sirve como referencia práctica para comparar EBT frente a ACT o Diffusion Policy dentro del ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Energy-based transformer (EBT) para políticas: CLIP ViT-B/16 como codificador visual + transformer de energía con modulación AdaLN |
| Parametros totales | 256.371.495 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. Ventana de observación de 2 frames y chunk de acción de 18 pasos (16 ejecutados) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors, presumiblemente fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (modelo de control robótico, sin entrada ni salida de texto) |
| Licencia | No disponible (la model card no la especifica) |
| Formato de pesos | safetensors (repositorio de 1,0 GB) |

Especificaciones adicionales de la política:

| Parametro | Valor |
|---|---|
| Tipo de política registrada | `ebt` y `dit_clip` (plugin `lerobot_policy_ebt`) |
| Entrada de estado | 7 posiciones articulares (rad) + anchura del gripper (m) |
| Entrada visual | `observation.images.main` y `observation.images.wrist`, 400x224 RGB, redimensionadas a 224x224 dentro del codificador CLIP |
| Salida | 7 objetivos absolutos de posición articular (rad) + comando de gripper (-1 abrir, +1 cerrar) |
| Frecuencia de control | 20 Hz (controlador de impedancia articular) |
| Normalización | Pre/post-procesadores de LeRobot guardados (estadísticas min-max de los episodios de entrenamiento) |
| Librería requerida | LeRobot 0.5.2 + plugin `lerobot_policy_ebt` |

## Arquitectura y entrenamiento

La política combina un codificador visual CLIP ViT-B/16 (parches de 16x16, resolución interna de 224x224) con un transformer de energía condicionado por modulación AdaLN. En lugar de predecir acciones con una cabeza de regresión o de difusión, el modelo formula la generación de la acción como un problema de minimización de energía: el transformer parametriza una función de energía sobre las acciones candidatas y la acción se obtiene por optimización (descenso sobre la energía) condicionada por la observación visual y propioceptiva. El chunk de 18 acciones con 16 ejecutadas es un mecanismo de acción temporal (action chunking) que reduce el coste de inferencia y aporta consistencia temporal, habitual en políticas modernas de imitación.

El entrenamiento es puramente de imitación supervisada sobre 73 demostraciones de teleoperación con SpaceMouse del dataset LeRobot v3 `jalal06/real-franka-insertion` (69 episodios de entrenamiento y 4 de validación, 101.675 frames a 20 Hz). El checkpoint publicado corresponde al paso 34.662 de la ejecución `ebt_real73_b88_h18e16`, con batch de 88, lo que equivale a unas 30 pasadas sobre los frames de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni de aumentos de datos, ni el número total de tokens (no aplica en el sentido de LLM).

## Capacidades

- Control visuomotor de manipulación fina: generar trayectorias articulares de 7 grados de libertad más comando de gripper a 20 Hz.
- Inserción de precisión: la tarea entrenada incluye insertar un cilindro ranurado en un agujero redondo y un bloque escalonado en un hueco cuadrado.
- Percepción multimodal: fusión de dos vistas RGB (cámara principal y de muñeca) con el estado propioceptivo de 7 articulaciones y la anchura del gripper.
- Action chunking: predice 18 acciones y ejecuta 16, lo que aporta suavidad y reduce el número de inferencias por segundo.
- Operación con controlador de impedancia articular en el robot real (Franka Panda).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni generación de texto.
- No tiene capacidades multilingües ni de visión general (no describe imágenes, no responde preguntas).
- No dispone de modo "thinking", audio ni vídeo.

## Casos de uso

- Despliegue directo de la tarea de ensamblaje: cargar el checkpoint con LeRobot 0.5.2 y el plugin `lerobot_policy_ebt` sobre un Franka Panda con las mismas cámaras y el mismo montaje para reproducir la secuencia cilindro-hueco redondo, bloque-hueco cuadrado y retorno a home.
- Base de partida para fine-tuning en inserción de precisión: al ser una política de 256 M parámetros entrenada con 73 demos, sirve para adaptar tareas de peg-in-hole similares con pocas demostraciones adicionales de SpaceMouse.
- Referencia comparativa de familias de políticas: evaluar EBT frente a ACT o Diffusion Policy con el mismo dataset y la misma frecuencia de control de 20 Hz para medir éxito de inserción y suavidad de trayectoria.
- Validación de pipelines de datos LeRobot v3: usar el par dataset + checkpoint para comprobar el flujo completo de normalización min-max, pre/post-procesadores y reproducción de episodios de validación (4 episodios reservados).
- Prototipado en laboratorio de ensamblaje de dos piezas: prueba de concepto de automatización de una celda de inserción con un solo brazo, sin necesidad de planificación geométrica explícita.
- Estudio de robustez visuomotora: al depender de dos vistas RGB de 400x224, permite experimentar con cambios de iluminación, oclusiones o recolocación de cámaras y medir la degradación de la política.
- Docencia e investigación en imitation learning: ejemplo pequeño (1,0 GB) y autocontenido para reproducir entrenamiento e inferencia de una política EBT en un curso o artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica el paso de entrenamiento (34.662), el número de frames (101.675), el batch (88) y que se reservaron 4 episodios de validación, pero no reporta tasas de éxito, error de posición ni métricas de inserción.

## Requisitos de hardware

- VRAM estimada para inferencia: los 256.371.495 parámetros en fp32 equivalen a aproximadamente 1,0 GB de pesos (coincide con el tamaño del repositorio de 1,0 GB); con el codificador CLIP, activaciones y contexto de CUDA, un presupuesto práctico de 4-8 GB de VRAM es razonable (estimación, no medida publicada).
- GPU recomendadas: cualquiera con 8 GB o más para despliegue en tiempo real; RTX 3060 12 GB, RTX 4070/4080, RTX 4090 para laboratorio; A100/H100 solo si se comparte con otras cargas.
- Cabe en GPU de consumo: sí, con holgura en cualquier GPU moderna de 8 GB o más.
- Opciones de despliegue: LeRobot 0.5.2 con el plugin `lerobot_policy_ebt` (requerido para registrar los tipos `ebt` y `dit_clip`); servidor de políticas de LeRobot para separar inferencia y robot. vLLM, llama.cpp, Ollama o TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: el bucle de control exige 20 Hz (50 ms por paso, con 16 acciones por chunk), pero no se publican medidas de latencia real ni throughput de inferencia. No disponible.
- Nota de despliegue: `config.json` apunta `clip_name` a una copia local de `openai/clip-vit-base-patch16`; hay que cambiarlo a `openai/clip-vit-base-patch16` o a la ruta local correcta antes de cargar el modelo en otra máquina.

## Comparativa con modelos similares

| Modelo | Familia | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emodel30 (jalal06) | EBT (CLIP ViT-B/16 + AdaLN) | 256.371.495 | 2 frames de observación, chunk de 18 (16 ejecutados) | No disponible | Hugging Face, requiere plugin `lerobot_policy_ebt` |
| ACT (Action Chunking Transformer) | Transformer con chunking | No disponible en la información proporcionada | Chunking de acciones | No disponible en la información proporcionada | Implementado en LeRobot |
| Diffusion Policy | Política de difusión | No disponible en la información proporcionada | Predicción de secuencias de acción | No disponible en la información proporcionada | Implementado en LeRobot |
| SmolVLA | VLA compacto | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Disponible en LeRobot |

No se dispone de datos verificados de rendimiento, licencia ni número de parámetros de las alternativas en la información proporcionada; la comparación es, por tanto, únicamente cualitativa y basada en la familia de política empleada (energía frente a chunking transformer y difusión).

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único montaje (cilindro amarillo + bloque verde sobre placa blanca con Franka Panda). No generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Dataset no publicado: `jalal06/real-franka-insertion` no está todavía en el Hub, por lo que no se puede reproducir el entrenamiento ni auditar la calidad de las demostraciones.
- Licencia no especificada: la ausencia de licencia impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Dependencia de un plugin externo: requiere LeRobot 0.5.2 y `lerobot_policy_ebt`; sin ellos el checkpoint no se puede cargar. Además, la ruta local de `clip_name` en `config.json` rompe la carga en otras máquinas si no se corrige.
- Riesgo de fallo por sobreajuste a la escena: con solo 73 demostraciones, cambios de iluminación, posición de cámara, fondo o variantes de las piezas pueden degradar la tasa de éxito; no se reportan métricas de robustez ni de éxito en validación.
- Sin datos de seguridad: no se documentan límites de fuerza, paradas de emergencia ni comportamiento ante fallos del controlador de impedancia, algo crítico en un robot real.
- Normalización dependiente del dataset: los pre/post-procesadores min-max están calculados sobre los episodios de entrenamiento; usar el modelo con otra configuración de robot o unidades distintas produce comandos incorrectos.
- Ausencia de benchmarks: no hay evidencia cuantitativa publicada que permita comparar su rendimiento con otras políticas.
- Advertencia sobre la búsqueda web: los resultados de búsqueda proporcionados no guardan relación con este modelo (tratan sobre el videojuego BeamNG.drive), por lo que no aportan información verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalal06/emodel30
- Dataset de entrenamiento (referenciado, no publicado aún): `jalal06/real-franka-insertion`
- Codificador visual base: https://huggingface.co/openai/clip-vit-base-patch16
- LeRobot (librería y políticas): https://github.com/huggingface/lerobot
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
