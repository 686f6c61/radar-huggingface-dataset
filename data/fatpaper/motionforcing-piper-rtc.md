# Fatpaper/motionforcing-piper-rtc

## Resumen

`Fatpaper/motionforcing-piper-rtc` es un repositorio de pesos de inferencia para robótica de manipulación bimanual sobre el robot Piper, no un modelo de lenguaje general. Contiene tres tareas de destreza real (`tidy_desk`, `stack_cups`, `fold_towel`) y, para cada una, tres modelos entrenados con la misma demostración: π₀.₅ (3.35B parámetros, 30k pasos), MotionForcing (2.52B parámetros) y una variante MotionForcing con inicialización distinta (`jepa_pretrain`). El interés técnico está en el uso de *real-time chunking* (RTC) en el entrenamiento: se sustituye aleatoriamente el prefijo de cada *chunk* de acciones (hasta 15 de 50 pasos, el 30%) por acciones reales limpias, y el 25% de las muestras se dejan sin prefijo.

El repositorio expone los modelos mediante el protocolo websocket de openpi, de modo que el cliente de robot es idéntico para los tres y solo cambia el puerto. La entrada es un estado de 14 dimensiones (6 articulaciones más pinza por brazo) y tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) en formato CHW uint8; la salida es un *chunk* de 50×14 acciones absolutas. MotionForcing aplica una restricción dura al prefijo RTC, mientras que π₀.₅ en SANE usa el RTC de inferencia original (restricción blanda).

Es relevante para investigadores en *imitation learning* robótico porque publica pesos de despliegue real, el parche de entrenamiento con RTC y una comparación controlada entre una política tipo VLA grande (π₀.₅) y una arquitectura de 2.52B con *motion forcing*. El repositorio ocupa 72.2 GB y no tiene descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MotionForcing (2.52B, backbone bf16 + action expert fp32); π₀.₅ (VLA basada en PaliGemma, 3.35B) |
| Parametros totales | 2.52B (MotionForcing) / 3.35B (π₀.₅) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; *chunk* de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp32; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (instrucciones en inglés en los tres casos) |
| Licencia | other (π₀.₅ derivado de `pi05_base` con términos de PaliGemma/Gemma; MotionForcing derivado de RynnBrain-2B, Apache-2.0; código de inferencia Apache-2.0) |
| Formato de pesos | JAX/Orbax (~12 GB, π₀.₅); safetensors en dos fragmentos (~5.8 GB, MotionForcing) |

## Arquitectura y entrenamiento

MotionForcing es una política de 2.52B parámetros con un *backbone* en bf16 y un *action expert* en fp32, inicializada a partir de `Alibaba-DAMO-Academy/RynnBrain-2B` (Apache-2.0). La variante `jepa_pretrain` comparte estructura pero parte de una inicialización distinta, lo que permite aislar el efecto del preentrenamiento. π₀.₅ es la política VLA de Physical Intelligence derivada de `pi05_base`, con 3.35B parámetros y 30k pasos de entrenamiento, servida mediante el código público SANE más un parche que añade el RTC en entrenamiento.

El elemento diferenciador es el RTC en tiempo de entrenamiento: en cada muestra se reemplaza el inicio del *chunk* de 50 acciones por hasta 15 acciones reales limpias como prefijo, y un 25% de las muestras se dejan sin prefijo. Los datos provienen de demostraciones reales en el robot Piper bimanual (50 episodios en `tidy_desk`, 100 en `stack_cups` y 100 en `fold_towel`), publicadas como datasets LeRobot con nombres `HITdongdong/piper_dual_*_ros2_shifted*`. No se documentan número total de tokens, composición del dataset ni etapas de RLHF/DPO.

En inferencia, MotionForcing fija las primeras `d` filas del `prev_action` como prefijo limpio y devuelve esas filas idénticas al cliente, que empieza a ejecutar en el paso `d` (0 ≤ d ≤ 15). π₀.₅ en SANE aplica *guidance* sobre el prefijo (restricción blanda), por lo que las primeras `d` acciones se aproximan pero no coinciden exactamente. Una comprobación offline sobre fotogramas de las demostraciones muestra que los seis modelos MotionForcing reducen el error de acción entre los pasos 10 y 19 en un 30–43% al darles prefijo real, y que el salto en la unión prefijo/generación es comparable al de las acciones reales; los modelos antiguos sin RTC en entrenamiento no mejoran con prefijo.

## Capacidades

- Manipulación bimanual real sobre robot Piper: 14 dimensiones de estado (6 articulaciones + pinza por brazo) y 14 dimensiones de acción absoluta.
- Ejecución de tres tareas de destreza con instrucción en lenguaje natural: ordenar escritorio, apilar vasos de papel y doblar una toalla.
- Entrada multisensorial con tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`); MotionForcing exige las tres y falla si falta alguna.
- Generación de *chunks* de acción de 50 pasos con horizonte de prefijo RTC de hasta 15 pasos.
- Soporte de *real-time chunking* duro (MotionForcing) y blando (π₀.₅ vía SANE) para continuidad entre inferencias asíncronas.
- Servido mediante protocolo websocket de openpi, con formato de petición y respuesta idéntico entre modelos.
- No se documentan capacidades de *tool calling*, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación comparativa de políticas VLA en robot real: los tres modelos de cada tarea comparten datos y cliente, de modo que se pueden alternar en la misma batería de posiciones aleatorias para medir éxito y suavidad sin cambiar la pila de software.
- Despliegue de manipulación bimanual con continuidad temporal: el RTC duro de MotionForcing permite ejecutar `d` pasos mientras se calcula el siguiente *chunk*, reduciendo paradas entre inferencias en tareas como apilar vasos.
- Investigación en *imitation learning* con pocos datos: `tidy_desk` entrena con solo 50 demostraciones, útil para estudiar regímenes de baja data en robots bimanuales.
- *Benchmarking* de inicializaciones: la pareja `ours`/`jepa_pretrain` permite medir el impacto del preentrenamiento JEPA manteniendo arquitectura y datos.
- Estudio de RTC en entrenamiento frente a inferencia: comparar π₀.₅ (RTC blando en inferencia) con MotionForcing (RTC duro) sobre las mismas demostraciones aísla el efecto del prefijo duro.
- Integración en *stacks* ROS 2: los datasets están publicados como `*_ros2_shifted`, y el cliente openpi se conecta por websocket, lo que facilita probar políticas en un *setup* ROS 2 existente.
- Reproducción de resultados: el repositorio incluye `checksums.sha256`, parche con hash y commits fijados, lo que permite reconstruir exactamente el entorno de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* solo reporta métricas internas de la comprobación offline de RTC: reducción del error de acción del 30–43% en los pasos 10–19 para los seis modelos MotionForcing con prefijo real, y ausencia de mejora en modelos antiguos sin RTC en entrenamiento. También indica que MotionForcing tarda 110–130 ms más por inferencia que π₀.₅ en una GB300.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los pesos de π₀.₅ suman ~12 GB (JAX/Orbax) y los de MotionForcing ~5.8 GB (bf16 + fp32), por lo que la inferencia requiere al menos esos órdenes de magnitud más activaciones y servidor websocket.
- GPU recomendadas: la *model card* cita medidas de latencia en NVIDIA GB300; no se listan otras GPU validadas.
- ¿Cabe en GPU de consumo? No disponible; con ~5.8 GB de pesos, MotionForcing podría caber en GPUs de 12–16 GB, pero no se documenta ni se valida.
- Opciones de despliegue: `serve_policy.py` de SANE (π₀.₅, con parche) y `serve_policy.py` de `motionforcing-piper-deploy` (MotionForcing), ambos sobre protocolo websocket de openpi. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: MotionForcing es 110–130 ms más lento por inferencia que π₀.₅ en GB300; no se publica *throughput* absoluto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | RTC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MotionForcing (`ours`, `jepa_pretrain`) | 2.52B | chunk de 50 acciones, prefijo ≤15 | Duro en entrenamiento e inferencia | Apache-2.0 en código; pesos derivados de RynnBrain-2B | Pesos en este repo; código en GitHub |
| π₀.₅ (`pi05/29999`) | 3.35B | chunk de 50 acciones, prefijo ≤15 | Blando en inferencia (SANE), parche de entrenamiento incluido | Términos de `pi05_base` y PaliGemma/Gemma | Pesos en este repo; código en SANE + parche |
| π₀.₅ base (`pi05_base`, Physical Intelligence) | 3.35B | no disponible en esta ficha | no disponible | Términos de PI/PaliGemma | Público en el ecosistema openpi |
| RynnBrain-2B (`Alibaba-DAMO-Academy`) | 2B | no disponible en esta ficha | no aplica | Apache-2.0 | Público en Hugging Face |

## Limitaciones y advertencias

- Modelo específico de robot: solo válido para el Piper bimanual con la configuración de cámaras y el orden de articulaciones documentados; no es un modelo de propósito general.
- Dependencia estricta de las tres cámaras en MotionForcing: si falta una, el servicio devuelve error.
- Riesgo de alucinación en el sentido de acciones no válidas: la *model card* advierte que si la primera acción devuelta se aleja mucho del estado actual, probablemente haya cámaras invertidas u orden de articulaciones incorrecto y no debe ejecutarse.
- Seguridad en robot real: se recomienda primera ejecución con parada de emergencia, supervisión humana y limitación de velocidad y aceleración en el cliente.
- Licencia restrictiva en π₀.₅: los pesos derivan de `pi05_base` y están sujetos a los términos de Physical Intelligence y de Gemma/PaliGemma; el uso comercial requiere revisar dichos términos.
- Idiomas: las instrucciones por defecto están en inglés y no se documenta soporte multilingüe.
- Datos escasos: 50–100 demostraciones por tarea, lo que limita la generalización a posiciones y objetos distintos de los vistos.
- Sin métricas de éxito publicadas en robot real: la validación reportada es offline sobre fotogramas de las demostraciones.
- Repositorio de 72.2 GB sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/Fatpaper/motionforcing-piper-rtc
- Código de inferencia MotionForcing: https://github.com/Hong-yu-Zhang/motionforcing-piper-deploy (commit `ac1ad1e2ba45e4e9a68832dd074eac1cae234de7`)
- SANE (código de π₀.₅): https://github.com/Linux-2023/SANE (commit `c9d724acd746dc521a748577ebe97ec1aa133f66`)
- RynnBrain-2B: https://huggingface.co/Alibaba-DAMO-Academy/RynnBrain-2B (commit `ad71236d013ae5618833fded73a32569045a8e9e`)
- Dataset `tidy_desk`: https://huggingface.co/datasets/HITdongdong/piper_dual_tidy_desk_ros2_shifted
- Dataset `stack_cups`: https://huggingface.co/datasets/HITdongdong/piper_dual_stack_cups_ros2_shifted_master_gripper_100ep
- Dataset `fold_towel`: https://huggingface.co/datasets/HITdongdong/piper_dual_fold_towel_ros2_shifted_master_gripper_100ep
