# LM111/umi-arena-pi05-yubi-umi-open4

## Resumen

`LM111/umi-arena-pi05-yubi-umi-open4` es una política robótica de manipulación (visión-lenguaje-acción) publicada como envío a la competición UMI Arena (Track 1) de CoRL 2026. Se trata de un ajuste fino completo del modelo base `pi05_base` de OpenPI (familia pi0.5 de Physical Intelligence), entrenado sobre el conjunto de datos YUBI UMI Arena publicado por `airoa-org`. El modelo no genera texto libre: produce trayectorias de acción de 32 waypoints para un robot bimanual con dos cámaras de muñeca.

El entrenamiento se realizó en tres fases encadenadas: 52.500 pasos sobre la release `02` (1.930 horas de datos), seguidos de 10.000 pasos con sesgo hacia dos tareas de recogida y colocación de tazas, y finalmente 10.000 pasos adicionales con muestreo equilibrado de cuatro tareas abiertas (taza, inserción de cable, portaplumas y ensamblaje de dedo YUBI). El repositorio ocupa 12,4 GB e incluye pesos en formato Orbax, el adaptador `policy.py`, las transformaciones de datos y las estadísticas de normalización.

Es relevante porque ejemplifica el flujo actual de publicación de políticas robóticas reproducibles sobre OpenPI: un checkpoint fine-tuneado, con interfaz de acción documentada (frames corporales, temporización `next`, gripper binarizado con histéresis) y configuración de replay explícita, lo que facilita su evaluación en el banco UMI Arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción pi0.5 (OpenPI); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: dos imágenes de muñeca 480×640 redimensionadas a 224, estado de 11 dimensiones y un prompt de tarea) |
| Tipos de cuantizacion | no disponible; pesos en float32 (Orbax), servidos en bfloat16 por OpenPI |
| Idiomas soportados | no disponible (los prompts de tarea se procesan con el tokenizador PaliGemma) |
| Licencia | no disponible |
| Formato de pesos | Orbax (`params/`), más tokenizador PaliGemma (`paligemma_tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `pi05_base` dentro del framework OpenPI. La política consume dos imágenes de muñeca (izquierda y derecha, uint8 480×640), un vector de estado de 11 dimensiones (pose `hand_root` izquierda→derecha como xyz más rotación 6D, seguida de las 2 articulaciones de pinza) y un prompt textual de tarea; no utiliza cámara central. La salida son 32 waypoints separados 30 Hz, expresados de forma relativa a la pose `hand_root` actual, que se convierten en un tensor de acciones `(32, 16)`.

El entrenamiento se estructuró en tres etapas. La primera cubrió 52.500 pasos sobre la release `02` (1.930 horas), con balanceo de tareas, refuerzo de inserción de cable y portaplumas, aumentación de cámara de muñeca y 30 % de dropout de estado. La segunda añadió 10.000 pasos (config `pi05_yubi_umi_2k1_cup_ft`, LR coseno de 3e-5 a 3e-6) con 60 % de muestras de las dos tareas de taza y 40 % de la release `02`. La tercera sumó otros 10.000 pasos (config `pi05_yubi_umi_2k1_open4_ft`, paso final 9999, LR coseno 3e-5 a 3e-6, batch 512) con muestreo uniforme al 25 % de cuatro tareas: recogida y colocación de taza, inserción de cable, portaplumas y ensamblaje de dedo YUBI (sustituto de SPS YUBI, sin datos en la release `02`). El adaptador binariza la salida de pinza con histéresis (cierra por debajo de 0,55 rad, abre por encima de 0,65 rad; estado inicial cerrado por debajo de 0,6 rad).

## Capacidades

- Generación de trayectorias de manipulación bimanual: 32 waypoints a 30 Hz por llamada, con deltas de pose en marco corporal y pinzas como ángulos absolutos.
- Control de pinza binarizado con histéresis para evitar que los dedos presionen el objeto (el modelo reproduce el ángulo de agarre de las demostraciones, ~0,45 rad en la taza).
- Ejecución de cuatro tareas aprendidas: recogida y colocación de taza, inserción de cable, manejo de portaplumas y ensamblaje de dedo YUBI.
- Condicionamiento por prompt textual de tarea, con normalización de la instrucción (elimina numeración de pasos y punto final).
- Percepción basada únicamente en cámaras de muñeca (sin cámara central), lo que simplifica el montaje físico.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación en el banco UMI Arena: el checkpoint está pensado para replay con `--action-hz 30 --translation-frame body --pose-timing next`, de modo que puede puntuarse directamente en la competición Track 1 sin reentrenamiento.
- Recogida y colocación de objetos deformables o cilíndricos: las dos tareas de taza con agarre calibrado (~0,45 rad) permiten manipular recipientes sin aplastarlos, útil en líneas de envasado ligeras.
- Inserción de precisión (cable): la política está reforzada con datos de inserción de cable, adecuada para tareas de conector en ensamblaje electrónico con robot bimanual.
- Manipulación de herramientas de escritura: la tarea de portaplumas sirve como base para aplicaciones de pick-and-place de objetos alargados y frágiles.
- Ensamblaje de componentes pequeños: la tarea de dedo YUBI actúa como sustituto de SPS YUBI, útil para prototipos de ensamblaje de piezas de robot.
- Base para fine-tuning adicional: al ser un checkpoint OpenPI con transformaciones y norm stats incluidas, puede reentrenarse sobre datos propios de un robot con la misma interfaz de 11 dimensiones y dos cámaras de muñeca.
- Investigación en políticas VLA: sirve como referencia reproducible para comparar estrategias de balanceo de tareas, dropout de estado y binarización de pinza en manipulación bimanual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 12,4 GB en float32, por lo que se requiere al menos esa capacidad para cargar los parámetros, más memoria para activaciones y procesamiento de imágenes.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del checkpoint se descarta su ejecución en GPUs de gama baja sin cuantización.
- ¿Cabe en GPU de consumo? No confirmado. Con 12,4 GB de pesos en float32, una GPU de 24 GB (por ejemplo, RTX 4090) podría albergarlos, pero el autor no documenta requisitos ni latencias.
- Opciones de despliegue: runtime OpenPI (`runtime: openpi` en `umi_arena.yaml`), con el adaptador `policy.py` que construye el `TrainConfig` en proceso y precalienta en `__init__`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LM111/umi-arena-pi05-yubi-umi-open4` | no disponible | no disponible | 4 tareas UMI Arena (taza, cable, portaplumas, dedo YUBI) | no disponible | Hugging Face (12,4 GB) |
| `LM111/umi-arena-pi05-yubi-umi` | no disponible | no disponible | Política UMI Arena (config `pi05_yubi_umi`, paso 59999) | no disponible | Hugging Face |
| `pi05_base` (OpenPI) | no disponible | no disponible | Modelo base visión-lenguaje-acción de propósito general | no disponible en la información proporcionada | OpenPI |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Modelo específico de política robótica: no es un modelo de lenguaje general; no debe esperarse generación de texto, código ni razonamiento conversacional.
- Especialización estrecha: entrenado para cuatro tareas concretas del conjunto YUBI UMI Arena; el rendimiento fuera de esa distribución (otros robots, objetos o cámaras) no está documentado.
- Interfaz rígida: requiere exactamente dos cámaras de muñeca 480×640, estado de 11 dimensiones y prompts normalizados (sin numeración de pasos ni punto final); desviarse de este formato puede degradar las acciones.
- Binarización de pinza con histéresis: la salida continua del modelo se umbraliza, lo que limita el control fino de fuerza y puede no transferirse a pinzas con cinemática distinta.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse con el autor antes de cualquier despliegue en producción.
- Idiomas y sesgos: no documentados; al condicionarse por prompt textual con tokenizador PaliGemma, el comportamiento ante instrucciones en otros idiomas es desconocido.
- Riesgo de alucinación de acciones: como toda política VLA, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución; se recomienda supervisión y límites de seguridad en el robot.
- Sin datos de benchmarks ni de latencia: no es posible estimar el rendimiento en tiempo real ni comparar objetivamente con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/LM111/umi-arena-pi05-yubi-umi-open4
- Variante relacionada: https://huggingface.co/LM111/umi-arena-pi05-yubi-umi
- Perfil del autor: https://huggingface.co/LM111/models
- Dataset de entrenamiento: `airoa-org/yubi-corl2026-umi-arena` (referenciado en la model card)
- Tokenizador: `gs://big_vision/paligemma_tokenizer.model` (referenciado en la model card)
