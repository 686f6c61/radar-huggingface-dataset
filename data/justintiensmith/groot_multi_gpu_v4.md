# justintiensmith/groot_multi_gpu_v4

## Resumen

El modelo `justintiensmith/groot_multi_gpu_v4` es un vision-language-action (VLA) de código abierto basado en NVIDIA Isaac GR00T N1.7, adaptado y entrenado por el usuario justintiensmith para tareas de manipulación robótica. Utiliza un backbone Cosmos-Reason2/Qwen3-VL junto con un transformer de acciones con flow-matching, lo que le permite predecir secuencias de acciones continuas a partir de observaciones visuales, instrucciones en lenguaje natural y estado propioceptivo del robot. Con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones), el modelo está diseñado para operar en un robot tipo `so_follower` con dos cámaras (middle y wrist) y generar acciones de 6 grados de libertad.

Este modelo resuelve el problema de control robótico generalizable mediante aprendizaje por imitación, permitiendo que un robot ejecute tareas como colocar objetos en recipientes, mover objetos según relaciones espaciales (delante, detrás, izquierda, derecha) y manipular tazas, bolígrafos y bloques. Su relevancia radica en ser una implementación abierta y reproducible de un VLA de última generación, entrenado con el framework LeRobot y publicado bajo licencia Apache 2.0, lo que facilita su uso en investigación y desarrollo de robótica. El repositorio tiene un tamaño de 12,6 GB y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponibles (el backbone Qwen3-VL soporta múltiples idiomas, pero no se especifica para este modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de NVIDIA Isaac GR00T N1.7, un VLA cross-embodiment que combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un transformer de acciones basado en flow-matching. Esta arquitectura permite predecir acciones continuas de 6 dimensiones a partir de dos imágenes (cámara central y cámara de muñeca, ambas de 480x640 píxeles) y un vector de estado propioceptivo de 6 dimensiones. El flujo de datos es: las observaciones visuales y el estado se procesan conjuntamente con la instrucción en lenguaje natural, y el transformer genera la acción mediante un proceso de flow-matching, que modela la distribución de acciones de forma más estable que los métodos autorregresivos tradicionales.

El entrenamiento se realizó con el dataset `justintiensmith/VLA_Reasoning_Training_Dataset_1200_Trimmed_Start_5_Frame`, que contiene 1.200 episodios y 570.386 frames a 30 FPS. Las tareas incluyen instrucciones como "Move the closed white cup into the bowl", "Place the green pen next to the red block" y variaciones con relaciones espaciales (delante, detrás, izquierda, derecha). No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado mediante aprendizaje por imitación, utilizando el framework LeRobot. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las tareas listadas.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad a partir de observaciones visuales (dos cámaras) y estado propioceptivo.
- Comprensión de instrucciones en lenguaje natural para tareas de manipulación, incluyendo relaciones espaciales (delante, detrás, izquierda, derecha, junto a, etc.).
- Manipulación de objetos cotidianos como tazas (blancas, marrones, de rayas), bolígrafos, bloques y recipientes de especias.
- Ejecución de tareas de pick-and-place, como colocar objetos en un bol o mover objetos a posiciones relativas.
- Soporte de múltiples cámaras (middle y wrist) para percepción visual redundante.
- Integración con el ecosistema LeRobot, lo que permite entrenamiento, evaluación y despliegue en robots compatibles.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un brazo robótico para recoger objetos de una cinta y colocarlos en contenedores, guiado por instrucciones en lenguaje natural.
- Investigación en aprendizaje por imitación y VLA: sirve como punto de partida para estudiar la generalización de políticas robóticas a nuevas tareas y entornos, gracias a su arquitectura abierta y su entrenamiento reproducible con LeRobot.
- Desarrollo de robots humanoides para tareas domésticas: el modelo puede ejecutar tareas como ordenar objetos en una mesa, colocando tazas o bolígrafos en posiciones específicas según comandos verbales.
- Entrenamiento de políticas robóticas con datasets personalizados: al estar basado en GR00T N1.7, se puede fine-tuning con nuevos datos para adaptarlo a otros robots o tareas, usando el framework LeRobot.
- Evaluación de modelos VLA en entornos simulados: el modelo puede integrarse en simuladores como Isaac Sim para validar su rendimiento antes del despliegue físico.
- Educación y demostraciones de robótica: su licencia Apache 2.0 y su tamaño moderado (3,14 B parámetros) lo hacen accesible para laboratorios académicos que quieran experimentar con VLA sin necesidad de infraestructura masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como éxito en tareas, precisión de acciones o comparación con otros modelos VLA.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Basándose en el tamaño del modelo (3,14 B parámetros) y el formato safetensors, se estima que la inferencia en FP16 requiere aproximadamente 6,3 GB de VRAM solo para los pesos, más overhead de activaciones y memoria intermedia. Se recomienda al menos 8 GB de VRAM para inferencia básica.
- Para entrenamiento o fine-tuning, se necesitaría al menos 16 GB de VRAM, dependiendo del batch size y la resolución de las imágenes (480x640).
- GPUs compatibles: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10, A100 o H100.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con la librería LeRobot en Python, o exportar a otros formatos si se convierte. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos VLA como OpenVLA, RT-2 o el GR00T N1.7 original de NVIDIA. No hay datos de rendimiento ni especificaciones detalladas de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para un robot tipo `so_follower` con dos cámaras (middle y wrist) y un espacio de acción de 6 dimensiones. No se garantiza que funcione correctamente en otros robots sin fine-tuning.
- El dataset de entrenamiento se limita a tareas de manipulación de objetos concretos (tazas, bolígrafos, bloques, recipientes) en un entorno aparentemente fijo. La generalización a objetos o escenarios no vistos puede ser limitada.
- No se han evaluado sesgos ni comportamientos no deseados. Como cualquier modelo de aprendizaje automático, puede generar acciones incorrectas o alucinadas en situaciones fuera de su distribución de entrenamiento.
- La longitud de contexto no está especificada; se asume que el modelo procesa instrucciones cortas y observaciones de un solo paso, sin memoria de largo plazo.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de componentes de NVIDIA (GR00T N1.7) que pueden tener sus propias restricciones. Se recomienda revisar los términos de NVIDIA Isaac GR00T.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado por la comunidad. Se recomienda validar su rendimiento en un entorno controlado antes de usarlo en producción.

## Enlaces

- [HuggingFace - justintiensmith/groot_multi_gpu_v4](https://huggingface.co/justintiensmith/groot_multi_gpu_v4)
- [Dataset de entrenamiento - VLA_Reasoning_Training_Dataset_1200_Trimmed_Start_5_Frame](https://huggingface.co/datasets/justintiensmith/VLA_Reasoning_Training_Dataset_1200_Trimmed_Start_5_Frame)
- [GitHub - NVIDIA/Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [NVIDIA Developer - Isaac GR00T](https://developer.nvidia.com/isaac/gr00t)
- [DeepWiki - NVIDIA/Isaac-GR00T](https://deepwiki.com/NVIDIA/Isaac-GR00T)
