# roaddata-ai/gr00t-n1.7-h1-street-crossing

## Resumen

GR00T N1.7 · Unitree H1 street crossing es un ajuste fino del modelo fundacional de robótica NVIDIA GR00T-N1.7-3B, publicado por RoadData.AI. El modelo convierte observaciones egocéntricas de un robot humanoide Unitree H1 (una imagen de su cámara de cabeza, el estado de la ruta y datos del peatón objetivo) en comandos de velocidad para su controlador de marcha. El objetivo concreto es que el H1 cruce un paso de peatones abarrotado siguiendo la ruta de una persona real.

El escenario no es físico: se trata de un gemelo digital construido en NVIDIA Isaac Sim a partir de metraje de dashcam de un cruce real de Jersey City (Grove St y Newark Ave), con la multitud real reproducida sobre sus trayectorias y tiempos originales. El modelo se ha entrenado con 46 caminatas simuladas y 5.000 pasos de entrenamiento en una sola GPU.

La relevancia es doble: por un lado, demuestra el flujo de trabajo de especialización de un modelo fundacional de robótica (VLA, vision-language-action) mediante ajuste fino con un embodiment nuevo; por otro, ilustra las limitaciones actuales de estos sistemas, ya que el autor lo describe explícitamente como un modelo de un solo cruce y no como un caminante urbano general. No hay resultados de benchmarks estándar de IA, sino métricas de navegación en el gemelo digital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional vision-language-action GR00T N1.7; detalles de capas y atención no publicados en la información disponible) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (la tarea se especifica mediante una instrucción en inglés) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (librería lerobot; requiere el código de Isaac-GR00T para inferencia) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de NVIDIA GR00T-N1.7-3B, un modelo fundacional de robótica de tipo vision-language-action que combina percepción visual, estado propioceptivo y una instrucción en lenguaje natural para producir acciones. En este caso, la entrada visual es un único fotograma RGB de 448 x 252 de la cámara de cabeza (`ego_view`); la entrada de estado son 25 valores (20 correspondientes a los siguientes 10 puntos de ruta en el marco del robot, 1 de velocidad, 2 de dirección al objetivo y 2 de ritmo y distancia al peatón objetivo). La salida es `vel_cmd`, una secuencia de 16 pasos (1,33 s a 12 Hz) de velocidad de avance y tasa de giro. El embodiment se registra como `new_embodiment` mediante el archivo `h1_crosswalk_config.py`.

El entrenamiento se realizó sobre el dataset `roaddata-ai/h1-street-crossing-lerobot`, compuesto por 46 caminatas simuladas: una caminata guionizada por cada ruta de peatón real, más caminatas de recuperación que arrancan fuera de la ruta o cerca de una pared y vuelven a corregir. El ajuste fino consumió 5.000 pasos en una sola GPU. Las piernas no las controla este modelo: los comandos de velocidad alimentan la política de marcha H1 de NVIDIA Isaac Lab, que los traduce a movimiento articular. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de lo descrito, ni si se aplicaron RLHF o DPO.

## Capacidades

- Navegación reactiva de un humanoide en un cruce peatonal simulado, siguiendo una ruta predefinida proporcionada como entrada.
- Generación de comandos de velocidad de bajo nivel (avance y giro) a 12 Hz con horizonte de 16 pasos.
- Condicionamiento por lenguaje natural: acepta una instrucción de tarea ("walk across the crosswalk with the crowd, following the route").
- Percepción egocéntrica a partir de una única imagen de cámara de cabeza.
- Esquiva implícita de peatones: en el gemelo digital las personas se apartan cuando el robot se acerca a menos de 0,65 m, y el modelo mantiene distancias mínimas de 0,61 a 0,63 m en las rutas de prueba.
- Corrección de desviaciones: las caminatas de recuperación le permiten reincorporarse a la ruta desde posiciones iniciales fuera de ella o próximas a paredes.
- No planifica su propia ruta; depende de que se le suministren los puntos de ruta por delante.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en navegación social de humanoides: permite estudiar cómo un VLA ajustado reacciona ante multitudes reproducidas con trayectorias y tiempos reales en un gemelo digital, sin riesgo físico ni coste de despliegue en un cruce real.
- Evaluación de políticas de marcha de Isaac Lab: los comandos `vel_cmd` del modelo se pueden conectar a la política de locomoción H1 para medir la robustez del lazo cerrado completo (velocidad, giro y estabilidad) en condiciones de tráfico peatonal.
- Generación de datos sintéticos para robótica: el runner del gemelo digital (`street-robots-crossing-twin`) permite repetir cruces con variaciones de multitud y puntuar cada ejecución, útil para ampliar datasets de entrenamiento.
- Prueba de concepto de especialización de modelos fundacionales: sirve como referencia metodológica para equipos que quieran ajustar GR00T N1.7 a un embodiment nuevo con pocos datos (46 episodios, 5.000 pasos).
- Docencia y divulgación en IA física: la demo pública en Hugging Spaces permite mostrar de forma visual el ciclo percepción-decisión-acción de un VLA en un escenario urbano reconocible.
- Análisis de seguridad en robótica urbana: las métricas de distancia mínima a personas y paredes y de desviación máxima de ruta permiten estudiar márgenes de seguridad antes de plantear pruebas físicas.
- Validación de pipelines de simulación a realidad: el modelo y el gemelo digital sirven para identificar qué información de estado (ruta, ritmo del peatón, dirección al objetivo) es necesaria antes de trasladar el sistema a un H1 real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica métricas de navegación en el gemelo digital de Isaac Sim, en lazo cerrado y con peatones reproducidos que se apartan al acercarse el robot a menos de 0,65 m:

| Ruta | Recorrido completado | Caída | Persona más cercana | Pared más cercana | Desviación máxima de ruta |
|---|---|---|---|---|---|
| Peatón 1 (335) | 21,4 de 21,4 m | no | 0,61 m | 0,51 m | 0,37 m |
| Peatón 2 (506) | 17,3 de 17,5 m | no | 0,63 m | 2,58 m | 0,13 m |
| Peatón 3 (10) | 13,0 de 13,2 m | no | 0,62 m | 4,20 m | 0,62 m |

Las tres rutas estaban incluidas en el entrenamiento. En una ruta excluida del entrenamiento el modelo necesitó que la ruta se suavizara previamente: con la ruta bruta y ruidosa de seguimiento, derivaba hacia una pared.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,14 B parámetros en safetensors (12,6 GB de repositorio), en precisión de 16 bits se sitúa en torno a 6-7 GB de pesos, más el coste del codificador visual y del resto del pipeline, por lo que se recomienda una GPU con al menos 16 GB para trabajar con margen.
- GPU recomendadas: una sola GPU es suficiente según el autor; tarjetas de datacenter como A100 o H100 son adecuadas, y GPU de consumo de gama alta (RTX 4090, 24 GB) deberían poder alojar el modelo, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: probable en modelos con 16 GB o más de VRAM; no confirmado por el autor.
- Opciones de despliegue: el código de NVIDIA Isaac-GR00T (`gr00t.policy.Gr00tPolicy`) con `EmbodimentTag.NEW_EMBODIMENT` y el archivo `h1_crosswalk_config.py`; para el escenario completo, el runner de `roaddata-ai/street-robots-crossing-twin`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se conoce la frecuencia de control de salida (12 Hz, horizonte de 1,33 s), pero no los tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roaddata-ai/gr00t-n1.7-h1-street-crossing | 3,14 B | no disponible | VLA para navegación de humanoide en un cruce simulado | NVIDIA Open Model License | Hugging Face (0 descargas, 0 likes en la fecha de consulta) |
| nvidia/GR00T-N1.7-3B | 3 B (según denominación) | no disponible | VLA fundacional de robótica, base de este ajuste | NVIDIA Open Model License | Hugging Face (modelo base) |
| Política de marcha H1 de Isaac Lab | no disponible | no disponible | Controlador de locomoción de bajo nivel | no disponible | Incluida en NVIDIA Isaac Lab |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, tipo de tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado y probado únicamente en simulación, en un solo cruce; no se ha ejecutado en un robot real.
- El autor lo describe como un modelo de un solo cruce, no como un caminante urbano general.
- Requiere la ruta por delante como entrada; no planifica su propia ruta.
- Las rutas provienen de personas rastreadas en el metraje de una única dashcam, con errores de colocación de aproximadamente 1 a 2 m para las personas lejanas.
- En una ruta no vista durante el entrenamiento necesitó suavizado previo de la ruta; con la ruta bruta derivaba hacia una pared, lo que indica poca generalización a trayectorias ruidosas.
- Las métricas de esquiva dependen de que los peatones del gemelo digital se aparten al acercarse el robot a 0,65 m; no se ha evaluado con peatones que no cedan el paso.
- No se han publicado evaluaciones de sesgos, alucinación ni comportamiento multilingüe; la instrucción de tarea está en inglés.
- Licencia NVIDIA Open Model License: es necesario revisar sus términos para uso comercial, redistribución y obligaciones de atribución; el modelo es un derivado de GR00T N1.7 y se distribuye con aviso (`NOTICE`) de NVIDIA.
- RoadData.AI no está afiliada ni respaldada por NVIDIA ni por Unitree; las marcas citadas pertenecen a sus titulares.
- El repositorio no registra descargas ni likes en la fecha de consulta, por lo que no hay evidencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roaddata-ai/gr00t-n1.7-h1-street-crossing
- Dataset de entrenamiento: https://huggingface.co/datasets/roaddata-ai/h1-street-crossing-lerobot
- Demo interactiva: https://huggingface.co/spaces/roaddata-ai/street-robots-demo
- Gemelo digital del cruce y runner de evaluación: https://huggingface.co/datasets/roaddata-ai/street-robots-crossing-twin
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Código de inferencia (NVIDIA Isaac-GR00T): https://github.com/NVIDIA/Isaac-GR00T
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Catálogo de datos de RoadData.AI: https://catalog.roaddata.ai
- Contacto de RoadData.AI: https://roaddata.ai/contact/?topic=humanoid-robots
