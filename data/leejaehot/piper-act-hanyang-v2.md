# leejaehot/piper-act-hanyang-v2

## Resumen

Piper ACT — Hanyang v2 es una política de aprendizaje por imitación (policy) para el brazo robótico de un solo brazo Piper, entrenada con el algoritmo ACT (Action Chunking Transformer) sobre el conjunto de datos normalizado de 100 demostraciones de la Universidad de Hanyang (HYU). El modelo fue desarrollado por Jaechan Lee (usuario `leejaehot`) y se distribuye a través de la librería LeRobot, un ecosistema de código abierto para robótica de aprendizaje.

El modelo resuelve el problema de la manipulación visuomotora de extremo a extremo: convierte imágenes de dos cámaras (frontal y derecha) en secuencias de acciones articulares para el robot. Es relevante porque demuestra cómo un dataset relativamente pequeño (100 demostraciones) puede entrenar una política ACT funcional con 51,7 millones de parámetros, un tamaño modesto que permite su ejecución en hardware de consumo. La v2 se distingue de la v1 por el uso del dataset normalizado a 30 Hz de la caja blanca, lo que apunta a una mejora en la consistencia de los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de visión y acción, no de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (modelo robótico, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ACT (Action Chunking Transformer), una arquitectura introducida por Zhao et al. (2023) que combina un Transformer con un VAE (autoencoder variacional) para la predicción de acciones. ACT divide el problema en dos partes: un encoder de visión que procesa las observaciones de las cámaras (frontal y frontal y derecha) y un decodificador que genera un "chunk" de acciones de tamaño fijo (en este caso, 100 pasos) de una sola vez, en lugar de predecir acción a acción. Esta predicción por bloques reduce el error acumulativo y permite una ejecución más suave y estable.

El entrenamiento se realizó con 100.000 pasos sobre el dataset `oms524/place_spam_into_the_white_box_30hz_normalized`, que contiene 100 demostraciones de la tarea de colocar una lata en una caja blanca, muestreadas a 30 Hz y normalizadas. El uso de VAE está habilitado, lo que permite al modelo aprender una distribución de acciones y muestrear de ella durante la inferencia, lo que le da cierta robustez frente a variaciones en el entorno. La semilla de entrenamiento se fijó en 1000 para garantizar la reproducibilidad. El repositorio incluye los pesos del modelo y los procesadores de política, pero no los archivos de estado de entrenamiento.

## Capacidades

- Control visuomotor de extremo a extremo: el modelo recibe imágenes de dos cámaras y genera directamente las acciones del brazo robótico Piper (7 grados de libertad).
- Predicción de acciones por chunks: genera secuencias de 100 acciones a la vez, lo que reduce la latencia y mejora la estabilidad del movimiento.
- Robustez frente a variaciones: gracias al VAE, el modelo puede muestrear diferentes trayectorias válidas ante la misma observación, lo que ayuda a generalizar en entornos con pequeñas perturbaciones.
- Entrenamiento con datos limitados: demuestra que con 100 demostraciones se puede obtener una política funcional, una capacidad clave para aplicaciones de robótica de bajo coste.
- Integración con LeRobot: se puede cargar directamente como `--policy.path=leejaehot/piper-act-hanyang-v2` en los comandos de inferencia o rollout de LeRobot, lo que facilita su despliegue.
- Sin capacidades lingüísticas: no procesa texto ni instrucciones en lenguaje natural; es un modelo puramente visual y motor.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo está entrenado para colocar una lata en una caja blanca, una tarea de pick-and-place típica que se puede extender a otros objetos y contenedores con un reentrenamiento mínimo.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo la normalización de datos (30 Hz vs. otros formatos) afecta al rendimiento de ACT en el brazo Piper.
- Desarrollo de sistemas de automatización de bajo coste: el modelo es pequeño (51,7 M de parámetros) y se puede ejecutar en hardware de gama baja, lo que permite prototipar sistemas robóticos de bajo coste.
- Bench de evaluación de algoritmos de control: al estar disponible en LeRobot, se puede usar como referencia para comparar nuevas arquitecturas o técnicas de entrenamiento en la misma tarea y con el mismo dataset.
- Educación en robótica de aprendizaje: el repositorio sirve como ejemplo práctico de cómo entrenar y desplegar una política de ACT con LeRobot, útil para cursos de robótica y aprendizaje automático.
- Reentrenamiento por transferencia: la política preentrenada puede servir como inicialización para tareas similares de manipulación (por ejemplo, colocar otros objetos), reduciendo el tiempo de convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de éxito de la tarea (tasa de éxito, tiempo de ejecución, etc.) ni comparaciones con otras políticas. Para obtener datos de rendimiento, sería necesario ejecutar el modelo en el entorno real o simulado del robot Piper y medir la tasa de éxito en la tarea de colocación.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, el modelo requiere aproximadamente 0,2 GB de VRAM en precisión FP32, y menos de 0,1 GB en cuantización FP16 o int8. Esto es despreciable para cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una CPU podría ejecutar el modelo con baja latencia para control robótico, aunque se recomienda una GPU para mantener una frecuencia de control estable.
- Compatibilidad con GPU de consumo: sí, funciona sin problemas en GPUs de consumo como la NVIDIA GTX 1650, RTX 3060 o superiores.
- Opciones de despliegue: LeRobot ofrece una API de inferencia y rollout. El modelo se puede cargar con `--policy.path=leejaehot/piper-act-hanyang-v2`. No se mencionan compatibilidades con vLLM, llama.cpp u otras herramientas de inferencia de modelos de lenguaje, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos. En un GPU de gama media, se espera una inferencia en el orden de milisegundos, ya que la carga de computación es pequeña (dos imágenes + 100 acciones).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Dataset | Tarea | Licencia |
|---|---|---|---|---|---|
| `leejaehot/piper-act-hanyang-v2` (este) | ACT | 51,7 M | HYU white-box 100 demos | Colocar lata en caja | No disponible |
| `leejaehot/piper-act-hanyang-v1` | ACT | No disponible | No especificado | Similar a v2 | No disponible |
| `zhitaoqiu/Piper-ACT` (GitHub) | ACT | No disponible | 4 posiciones de cubo, dual-camera | Agarre visuomotor de cubos | No disponible |

La comparativa se limita a otras variantes de ACT para el brazo Piper, ya que no hay modelos comparables de otras arquitecturas en la información disponible. La v1 de Hanyang es la versión anterior, sin el dataset normalizado; el de `zhitaoqiu` se centra en una tarea diferente (agarre de cubos) y usa un esquema de cámaras distinto.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado en un único entorno (caja blanca) con una cámara fija; no generaliza a otras configuraciones de iluminación, fondos o posiciones de la cámara sin un reentrenamiento.
- Riesgo de alucinación: en robótica, el equivalente es la generación de acciones incorrectas o erráticas ante observaciones fuera de la distribución de entrenamiento. El modelo puede intentar ejecutar movimientos no deseados si la escena cambia drásticamente.
- Limitaciones de contexto: el modelo no tiene contexto temporal más allá de la ventana de imágenes actuales; no puede razonar sobre objetivos de largo plazo ni sobre instrucciones.
- Restricciones de licencia: la licencia no se ha especificado, lo que limita el uso comercial sin consultar al autor.
- Limitaciones de datos: el dataset de 100 demostraciones es pequeño y puede no cubrir la variabilidad completa de la tarea; la política puede fallar ante perturbaciones no vistas en el entrenamiento.
- Ausencia de estado de entrenamiento: el repositorio no incluye los archivos de estado del entrenamiento, lo que dificulta reanudar el entrenamiento o reproducir exactamente el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leejaehot/piper-act-hanyang-v2
- Modelo v1 en Hugging Face: https://huggingface.co/leejaehot/piper-act-hanyang-v1
- Perfil del autor en Hugging Face: https://huggingface.co/leejaehot
- Repositorio de Piper-ACT (GitHub): https://github.com/zhitaoqiu/Piper-ACT/tree/main
