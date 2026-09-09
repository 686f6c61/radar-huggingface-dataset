# RyanL22/pi05-anyh2r-rh56f1-depth-idm-60k

## Resumen

El modelo `pi05-anyh2r-rh56f1-depth-idm-60k` es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, un Vision-Language-Action (VLA) desarrollado por Physical Intelligence e implementado en el framework LeRobot. Ha sido creado por RyanL22 para control de manipulación bimanual en una plataforma robótica OpenArm equipada con manos RH56F1. Resuelve el problema de generar acciones robóticas de bajo nivel a partir de observaciones visuales de dos cámaras, combinando datos de teleoperación real con datos sintéticos de transferencia humano-robot.

El modelo es relevante porque incorpora un modelo de dinámica inversa (IDM) que utiliza DepthAnything v2 y el par estéreo para etiquetar acciones sintéticas, una técnica que permite aumentar los datos de entrenamiento sin teleoperación manual. La arquitectura es un VLA basado en transformer con 4.143.404.816 parámetros (aproximadamente 4.14 mil millones). No se especifica longitud de contexto en el sentido de los modelos de lenguaje, ya que se trata de un modelo de acción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en transformer, ajuste fino de `lerobot/pi05_base` |
| Parametros totales | 4.143.404.816 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9.4 GB |
| Modelo base | `lerobot/pi05_base` |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo pi0.5 de Physical Intelligence, adaptado en LeRobot. El modulo predice un bloque (chunk) de acciones de 50 pasos a 20 fps, lo que equivale a un horizonte de 2.5 segundos por inferencia. El estado y la accion son vectores de 28 dimensiones que se rellenan a las 32 dimensiones que espera el policy. Las observaciones visuales proceden de dos camaras mapeadas a los slots de pi0.5: `camera_ego_left` se asigna a `base_0_rgb` y `camera_ego_right` a `left_wrist_0_rgb`. La normalizacion usa `QUANTILES` para estado y accion, y `IDENTITY` para las imagenes, con los estadisticos q01/q99 incluidos en los ficheros de procesador del repositorio.

El entrenamiento se ejecuto durante 60.000 pasos con un lote global de 64 (16 por GPU en 4 Nvidia H200), en precision bfloat16 y con gradient checkpointing, semilla 1000. La perdida final de entrenamiento fue 0.005, con norma de gradiente 0.117, tras 13.55 epocas. El dataset fusiona 885 episodios con 253.549 frames, organizados en 16 celdas (source x category) con probabilidad de muestreo igualitaria para cada celda. Doce categorias corresponden a datos sinteticos de retargeting humano-robot, cuyas etiquetas de dinamica inversa proceden de un IDM que consume DepthAnything v2 junto al par estereo. Las otras cuatro categorias son teleoperacion real filtrada por frecuencia de contenido superior o igual a 19 Hz en ambas vistas.

## Capacidades

- Control bimanual de robots: genera acciones de 28 dimensiones para una plataforma OpenArm con manos RH56F1.
- Percepcion visual bimanual: integra dos camaras (ego izquierda y muneca derecha), mapeadas a los slots del pi0.5, para tomar decisiones a partir de imagenes.
- Generacion de acciones a largo plazo: predice un chunk de 50 pasos a 20 fps, es decir, un horizonte de 2.5 segundos por inferencia.
- Transferencia humano-robot: aprende de acciones sinteticas etiquetadas por un IDM con DepthAnything v2 y par estereo, ampliando la diversidad de datos sin necesidad de teleoperacion directa.
- Robustez en el aprendizaje: combina 12 categorias sinteticas y 4 de teleoperacion real con muestreo equilibrado por celda, a pesar de la dispersion de ~6x en el tamano de cada celda.
- No es un modelo de lenguaje: no incluye tool calling, razonamiento multi-step ni soporte multilingue.

## Casos de uso

- Investigacion en manipulacion bimanual: el modelo permite evaluar politicas de control sobre un robot OpenArm con manos RH56F1 usando LeRobot, ideal para laboratorios de robotica que necesitan un punto de partida especifico para esa plataforma.
- Teleoperacion asistida: puede actuar como policy de bajo nivel que sigue las observaciones de dos camaras, generando trayectorias de 2.5 segundos para tareas de manipulacion en entornos controlados.
- Transferencia de habilidades humano-robot: gracias a las etiquetas sinteticas generadas por el IDM con DepthAnything v2, se pueden entrenar robots a partir de demostraciones humanas sin recoger datos de teleoperacion a gran escala.
- Control de bajo nivel en ensamblaje o encajado: el horizonte de 50 pasos y la salida de acciones continuas permiten comandos suaves para brazos bimanuales en tareas de precision con herramientas o piezas.
- Evaluacion de modelos de dinamica inversa: el modelo es util para comparar el efecto de usar DepthAnything v2 frente a solo el par estereo en la generacion de acciones sinteticas, como describe el propio autor.
- Despliegue en plataformas de robotica educativa: al estar integrado en LeRobot y ser de codigo abierto, puede usarse en practicas de robotica con hardware OpenArm compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento proporcionado es la perdida final de entrenamiento de 0.005 y la norma de gradiente 0.117, junto con 13.55 epocas completadas. No se dispone de comparaciones numericas con otros modelos en tareas de manipulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica oficialmente. Con 4.143.404.816 parametros y pesos en bfloat16, los pesos ocupan aproximadamente 8.3 GB, por lo que se recomienda una GPU con al menos 12-16 GB de VRAM para acomodar imagenes, activaciones y sobrecarga del processamiento.
- GPU recomendadas: el entrenamiento se realizo con 4 Nvidia H200 usando un lote de 16 por GPU. Para inferencia, una Nvidia A100, H100 o una RTX 4090 de 24 GB serian opciones adecuadas.
- Compatibilidad con GPU de consumo: si, una RTX 4090 de 24 GB puede ejecutar el modelo en bfloat16. Una RTX 4080 de 16 GB podria funcionar, aunque el margen de memoria seria mas ajustado.
- Opciones de despliegue: LeRobot 0.6.1 es el framework documentado. Al ser un modelo de accion robtica y no un modelo de lenguaje, no se soportan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-anyh2r-rh56f1-depth-idm-60k | 4.143.404.816 | no disponible | Apache-2.0 | HuggingFace | Ajuste fino para OpenArm RH56F1, acciones sinteticas con DepthAnything v2 |
| pi05-anyh2r-rh56f1-stereo-idm-60k | no disponible | no disponible | no disponible | HuggingFace | Mismo autor y configuracio, difiere en las etiquetas sinteticas (solo estereo) |
| lerobot/pi05_base | no disponible | no disponible | no disponible | HuggingFace | Modelo base general de pi0.5, sobre el que se realiza el ajuste fino |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento se limita a la perdida de entrenamiento reportada por el autor.
- El modelo esta especializado en la plataforma OpenArm con manos RH56F1; no se garantiza su transferencia a otros robots sin reentrenamiento.
- Las acciones sinteticas dependen del IDM con DepthAnything v2; una estimacion de profundidad incorrecta puede degradar la calidad de las acciones generadas.
- Los joints del cuello (dimensiones 0-1 del estado) se mantuvieron fijos durante la recoleccion de datos y se espera que permanezcan fijos en inferencia, por lo que el modelo no controla movimientos de cuello.
- Al ser un modelo de accion no textual, no puede utilizarse para tareas de lenguaje, tool calling ni razonamiento simbolico.
- La licencia Apache-2.0 permite uso comercial, pero hay que revisar la licencia del modelo base y de los datos de entrenamiento, ya que no se detallan en el repositorio.

## Enlaces

- https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-depth-idm-60k
- https://huggingface.co/lerobot/pi05_base
- https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-stereo-idm-60k
- https://huggingface.co/RyanL22/models
- https://huggingface.co/home1017/my_pi05_model
