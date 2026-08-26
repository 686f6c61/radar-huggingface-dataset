# innoblabla/cube_sphere_3cam_GR00T17

## Resumen

El modelo `innoblabla/cube_sphere_3cam_GR00T17` es una política robótica de manipulación entrenada mediante aprendizaje por imitación con la librería LeRobot. Se basa en el modelo fundacional de código abierto GR00T N1.7 de NVIDIA, diseñado para razonamiento y habilidades de robots humanoides. El modelo fue desarrollado por el usuario `innoblabla` y está pensado para un robot tipo `so_follower` equipado con tres cámaras (`pince`, `base`, `top`), con el objetivo de realizar dos tareas concretas: coger un cubo o una esfera y colocarlos en un cáliz.

El modelo emplea una arquitectura de visión-lenguaje-acción (VLA) con un backbone Cosmos-Reason2/Qwen3-VL y un transformer de acciones basado en flow-matching. Tiene 3.144.016.000 parámetros y se distribuye bajo licencia Apache 2.0. La relevancia actual del modelo reside en que es un ejemplo práctico de cómo adaptar un modelo fundacional de robótica de NVIDIA a un escenario específico con LeRobot, con un dataset propio de 114 episodios. No se han publicado resultados de evaluación sobre el robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LeRobot/PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7, el modelo fundacional de NVIDIA para robótica generalizada. Según la documentación de NVIDIA, la versión N1.7 sustituye el backbone anterior por `nvidia/Cosmos-Reason2-2B` a través de Qwen3-VL, y utiliza un transformer de acciones de flujo (flow-matching) que predice acciones condicionadas a visión, lenguaje y propiocepción. En este caso, el modelo se ha entrenado con el framework LeRobot sobre un dataset de demostraciones con 114 episodios y 55.203 fotogramas a 30 FPS, capturados con tres cámaras RGB de 640x480.

El entrenamiento se realizó durante 20.000 pasos con un tamaño de lote de 32, optimizador AdamW y tasa de aprendizaje de 1e-4, con semilla 42. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es de aprendizaje por imitación supervisado. El modelo se publica con el pipeline de robótica de LeRobot, con una entrada de estado de 6 dimensiones y salida de acción de 6 dimensiones.

## Capacidades

- Manipulación robótica de precisión: el modelo predice acciones de 6 grados de libertad (posición y orientación) para tareas de agarre y colocación de objetos.
- Seguimiento de instrucciones en lenguaje natural: las tareas se definen mediante texto ("pick up the cube and place it in the goblet", "pick up the sphere and place it in the goblet").
- Percepción multi-cámara: procesa simultáneamente imágenes de tres cámaras (pince, base, top), lo que le permite operar con vistas parciales y oclusiones.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Capacidad de generalización limitada: el modelo está entrenado para dos tareas específicas con un dataset reducido, por lo que no se espera que generalice a tareas no vistas.
- No dispone de tool calling ni funciones de agente; su uso es exclusivamente de política de control para el robot.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para estudiar la transferencia de modelos fundacionales de robótica a tareas concretas con LeRobot.
- Desarrollo de prototipos de manipulación: permite probar rápidamente un pipeline de entrenamiento de políticas para un robot `so_follower` con tres cámaras sin necesidad de escribir el controlador desde cero.
- Benchmarking de algoritmos de aprendizaje por refuerzo: puede utilizarse como política base para comparar métodos de RL o de imitación en entornos de simulación o reales.
- Automatización de tareas de recogida y colocación: en entornos industriales o de laboratorio, el modelo puede integrarse en un sistema de control para mover objetos entre posiciones fijas, siempre que el robot y las cámaras coincidan con la configuración de entrenamiento.
- Evaluación de generalización de modelos VLA: permite probar la robustez del modelo ante cambios de iluminación, posición de objetos o variaciones de la escena.
- Formación de estudiantes y desarrolladores: al ser de código abierto y con una configuración clara, es útil para aprender a usar LeRobot y a entrenar políticas de imitación con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación real (ni en simulación ni en robot físico), y se indica explícitamente que no hay resultados de evaluación.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. Sin embargo, se puede estimar en función del tamaño del modelo:

- El repositorio ocupa 12,6 GB, lo que sugiere que los pesos están almacenados en precisión FP32 (3,14 B × 4 bytes ≈ 12,6 GB). En precisión BF16, el modelo ocuparía aproximadamente 6,3 GB.
- Para inferencia en FP32, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40 GB).
- Para inferencia en BF16, una GPU con 8-12 GB de VRAM podría ser suficiente (por ejemplo, RTX 3060 12 GB, RTX 4070).
- No se han publicado mediciones de latencia o throughput. Se recomienda usar GPU con soporte de Tensor Cores para acelerar el transformer de acciones.
- La ejecución se realiza mediante LeRobot, que utiliza PyTorch. El despliegue en GPU es necesario; no se menciona compatibilidad con CPU ni con herramientas como vLLM, Ollama o llama.cpp, ya que es un modelo de robótica y no de generación de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| innoblabla/cube_sphere_3cam_GR00T17 (este modelo) | 3,14 B | GR00T N1.7 (VLA con flow matching) | Apache 2.0 | no disponible | Hugging Face (LeRobot) |
| OpenVLA | 7 B | VLA basado en Prismatic (Llama 2 + ViT) | MIT | 2048 tokens | Hugging Face |
| GR00T N1.7 base (NVIDIA) | 3,8 B | VLA con Cosmos-Reason2/Qwen3-VL | Apache 2.0 | no disponible | NVIDIA / Hugging Face |

Nota: los datos de GR00T N1.7 base se basan en la información pública de NVIDIA; no se dispone de comparativas de rendimiento directas porque este modelo no tiene benchmarks publicados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dos tareas (coger un cubo o una esfera y colocarlos en un goblet) y no se espera que generalice a otras tareas sin reentrenamiento.
- El dataset de entrenamiento es reducido (114 episodios) y no se han reportado resultados de evaluación en el robot real; el rendimiento real es desconocido.
- Depende de una configuración de hardware concreta: robot `so_follower`, tres cámaras con posiciones y resoluciones específicas. Cualquier cambio en la disposición de las cámaras o el robot puede degradar el rendimiento.
- No se proporcionan datos sobre sesgos o alucinaciones; al ser un modelo de control de acciones, el riesgo de alucinación se manifiesta como acciones erróneas o no seguras en el robot.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento del modelo en un entorno seguro antes de desplegarlo en producción.
- No se ha especificado la longitud de contexto del backbone VLM, lo que limita el conocimiento sobre el tamaño máximo de instrucciones o secuencias de observación soportadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/innoblabla/cube_sphere_3cam_GR00T17)
- [Dataset de entrenamiento](https://huggingface.co/datasets/innoblabla/cube_sphere_3cam)
- [GitHub de NVIDIA Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [Blog de NVIDIA sobre GR00T 1.7 en LeRobot](https://huggingface.co/blog/nvidia/nvidia-isaac-teleop-and-gr00t17-in-lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
