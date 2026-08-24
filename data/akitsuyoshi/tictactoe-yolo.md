# Akitsuyoshi/tictactoe-yolo

## Resumen

El modelo `Akitsuyoshi/tictactoe-yolo` es un detector de objetos basado en YOLO, desarrollado por Akitsuyoshi para un sistema robótico de tres en raya (tic-tac-toe). El modelo identifica tres clases: el tablero de juego y las fichas X y O. Forma parte de un proyecto más amplio que integra ROS 2, MoveIt 2 y control robótico para jugar partidas de forma autónoma. La relevancia de este modelo radica en su aplicación directa en robótica y visión por computador, demostrando cómo un detector de objetos ligero puede ser el componente visual de un sistema de manipulación física.

La arquitectura está basada en YOLO (probablemente una versión de Ultralytics, aunque no se especifica), y el modelo se distribuye a través de HuggingFace con la librería `ultralytics`. No se proporcionan detalles sobre el número de parámetros, el contexto de entrada (tamaño de imagen) ni la licencia, lo que limita su evaluación técnica exhaustiva. El modelo está orientado a un caso de uso muy concreto: la detección de elementos de juego en un entorno de robótica de manipulación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (versión no especificada, probablemente YOLOv8 o similar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | no disponible (posiblemente safetensors, ONNX o .pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO (You Only Look Once), implementada mediante la librería Ultralytics. YOLO es un detector de objetos de una sola pasada que divide la imagen en una cuadrícula y predice cajas delimitadoras y clases directamente. En este caso, el modelo está entrenado para reconocer tres clases: `Board` (tablero), `X` y `O`. El entrenamiento se realizó con el dataset `akitsuyoshi/tictactoe-with-real`, disponible en HuggingFace y también en Kaggle, que contiene imágenes reales de tableros y fichas de tres en-tras. No se especifican el número de imágenes, la cantidad de épocas ni los hiperparámetros utilizados.

El modelo se integra en un sistema robótico que utiliza ROS 2 para la comunicación entre nodos, YOLO para la detección visual, MoveIt 2 para la planificación de movimientos del brazo robótico y un algoritmo Minimax para calcular el mejor movimiento. La detección de las fichas y del tablero permite al robot conocer el estado del juego y actuar en consecuencia.

## Capacidades

- Detección de objetos en imágenes: identifica la presencia y posición de un tablero de tres en raya y de las fichas X y O.
- Soporte para integración robótica: diseñado específicamente para un sistema ROS 2 con control de brazo robótico (MoveIt 2).
- Inferencia en tiempo real: como cualquier modelo YOLO, es adecuado para aplicaciones con requisitos de latencia baja.
- No dispone de capacidades de generación de texto, razonamiento, tool calling ni agentes, ya que es un modelo exclusivamente de visión.
- No tiene soporte multilingüe ni de otros idiomas, al ser un modelo visual.

## Casos de uso

- Robot autónomo de tres en raya: el modelo detecta el tablero y las fichas colocadas por un jugador humano, permitiendo al robot calcular su siguiente movimiento mediante el algoritmo Minimax y ejecutarlo con el brazo robótico.
- Seguimiento de posición de fichas en tiempo real: puede usarse en aplicaciones de captura de movimiento para registrar las jugadas de un partido físico y digitalizarlas.
- Validación de tablero en juegos de mesa automatizados: en un entorno de producción, el modelo puede verificar si el tablero está correctamente colocado y si las fichas están en las casillas esperadas.
- Entrenamiento de sistemas de visión para robótica: como modelo simple y pequeño, sirve de ejemplo para estudiantes o desarrolladores que quieran integrar YOLO con ROS 2 y MoveIt 2.
- Interfaz humano-robot: el modelo puede usarse para que un robot responda a las jugadas humanas sin intervención manual, como se muestra en el vídeo de demostración del proyecto.
- Investigación en detección de objetos pequeños: aunque el tablero es un objeto relativamente grande, las fichas X y O son pequeñas, por lo que el modelo puede servir para estudiar la detección de objetos pequeños en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión media media (mAP), velocidad de inferencia ni comparaciones con otros modelos. Por tanto, no es posible evaluar el rendimiento cuantitativamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo YOLO pequeño, es probable que quepa en GPUs de consumo medio (4-8 GB de VRAM).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 2060 o superior). También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es un modelo ligero, adecuado para GPUs de gama media.
- Opciones de despliegue: al ser de la librería Ultralytics, se puede usar con la propia API de Ultralytics, exportar a ONNX para inferencia con TensorRT u OpenVINO, o integrar en un sistema ROS 2 mediante el paquete `ros2-yolo`.
- Latencia y throughput: no se dispone de mediciones concretas. En una GPU moderna, un modelo YOLO pequeño suele tardar entre 10 y 30 ms por imagen, pero no se puede confirmar para este modelo específico.

## Comparativa con modelos similares

No hay información suficiente para comparar este modelo con alternativas de la misma categoría. No se han publicado benchmarks ni se conoce el tamaño exacto del modelo. La comparativa con otros detectores de objetos genéricos (como YOLOv8n, YOLOv8s) sería posible si se conocieran los parámetros, pero no se dispone de esos datos.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer si es apto para uso comercial o si tiene restricciones.
- No se ha documentado el rendimiento en condiciones de iluminación variada, oclusión o tableros de diferentes diseños. El modelo fue entrenado con un dataset específico (tictactoe-with-real) que puede no generalizar a otros estilos de tableros.
- Al ser un modelo de visión, no presenta problemas de alucinación en el sentido de lenguaje, pero puede dar falsos positivos o negativos en la detección de fichas, especialmente si las fichas están parcialmente ocultas o tienen sombras.
- El modelo solo detecta tres clases; no distingue entre diferentes tipos de fichas (por ejemplo, colores o formas alternativas).
- No hay información sobre la robustez ante ataques adversariales o variaciones de iluminación.
- La documentación no incluye detalles sobre el proceso de entrenamiento, por lo que no se puede evaluar la calidad del dataset ni el riesgo de sesgos.

## Enlaces

- [HuggingFace - Akitsuyoshi/tictactoe-yolo](https://huggingface.co/Akitsuyoshi/tictactoe-yolo)
- [GitHub - tictactoe_robot](https://github.com/Akitsuyoshi/tictactoe_robot)
- [Dataset de entrenamiento en HuggingFace](https://huggingface.co/datasets/akitsuyoshi/tictactoe-with-real)
- [Dataset de entrenamiento en Kaggle](https://www.kaggle.com/datasets/akitsuyoshi/tictactoe-with-real)
- [Vídeo de demostración del robot autónomo](https://www.youtube.com/watch?v=ukr_7SG5Fbk)
