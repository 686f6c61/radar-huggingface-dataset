# jaheroth/act_pusht_bs64_chunk32_dec7_seed1001

## Resumen

El modelo `jaheroth/act_pusht_bs64_chunk32_dec7_seed1001` es una política de imitación basada en el método Action Chunking with Transformers (ACT), entrenada sobre el dataset PushT mediante la librería LeRobot de Hugging Face. ACT, propuesto en el paper arXiv:2304.13705, aborda el problema de la manipulación robótica aprendiendo a predecir secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito frente a políticas que actúan paso a paso.

El modelo cuenta con 83.899.796 parámetros y está publicado bajo licencia Apache-2.0. Su tamaño de repositorio es de 0,3 GB, lo que lo hace ligero y adecuado para experimentación en hardware modesto. Está diseñado para el control de robots, específicamente para la tarea de empuje (pushing) de un objeto hacia una posición objetivo, y puede ser evaluado o utilizado para inferencia mediante las herramientas de LeRobot.

Su relevancia radica en ser un ejemplo práctico de entrenamiento de políticas robóticas con ACT, un enfoque que ha demostrado altas tasas de éxito en tareas de manipulación con datos teleoperados. Al estar publicado en el Hub, permite reproducir experimentos, comparar configuraciones de entrenamiento (tamaño de batch, longitud de chunk, decodificador, semilla) y servir como base para desarrollos posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador y decodificador |
| Parametros totales | 83.899.796 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que utiliza un transformer con codificador y decodificador. El codificador procesa observaciones (imágenes y estados del robot) y el decodificador genera una secuencia de acciones futuras (chunk) de longitud fija, en lugar de predecir una única acción. Esto permite capturar la multimodalidad de las demostraciones y reduce la propagación de errores durante la ejecución.

El entrenamiento se realizó con la librería LeRobot, sobre el dataset `lerobot/pusht`, que contiene demostraciones teleoperadas de la tarea PushT (empujar un objeto en forma de T a una posición objetivo). Los hiperparámetros clave del entrenamiento se reflejan en el nombre del repositorio: tamaño de batch 64, longitud de chunk 32, número de capas del decodificador 7 y semilla 1001. No se especifican detalles adicionales como número de pasos de entrenamiento, tamaño del dataset o si se aplicaron técnicas de regularización o aumentación. La política se guarda en formato safetensors, compatible con la inferencia en LeRobot.

## Capacidades

- Control robótico por imitación: el modelo aprende a generar comandos de acción para un robot (en este caso, un brazo SO-100) a partir de observaciones visuales y del estado.
- Predicción de secuencias de acciones (action chunking): genera chunks de 32 pasos de acción, lo que permite una ejecución más fluida y robusta que la predicción paso a paso.
- Manejo de multimodalidad: ACT está diseñado para capturar múltiples modos de comportamiento en las demostraciones, algo relevante en tareas donde existen varias estrategias válidas.
- Integración con LeRobot: puede ser cargado y ejecutado directamente con las herramientas de la librería LeRobot para entrenamiento, evaluación e inferencia en robots reales o simulados.
- No incluye capacidades de lenguaje natural, visión general ni tool calling; su ámbito es exclusivamente el control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar el efecto del tamaño de batch, longitud de chunk o profundidad del decodificador en el rendimiento de ACT sobre PushT.
- Benchmarking de políticas robóticas: se puede comparar su rendimiento con otras políticas (p. ej., diffusion policy) en la misma tarea para evaluar ventajas y limitaciones.
- Desarrollo de sistemas de manipulación robótica: aunque entrenado en simulación (PushT), el enfoque ACT puede transferirse a tareas físicas similares, como empujar objetos en una línea de montaje.
- Educación y prototipado: al ser ligero (83,9 M parámetros) y con licencia Apache-2.0, es adecuado para cursos y proyectos de robótica donde se requiera una política de control simple y reproducible.
- Evaluación de robustez: se puede probar la política en entornos con perturbaciones o cambios de iluminación para analizar su generalización, aunque no se han publicado estudios específicos al respecto.
- Comparación de configuraciones de entrenamiento: dado que el nombre del repo codifica hiperparámetros, se pueden entrenar variantes con diferentes semillas o tamaños de chunk y comparar sus tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, ni comparaciones con otras políticas. Se desconoce la tasa de éxito en la tarea PushT para esta configuración concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo de 83,9 M parámetros en safetensors (0,3 GB), la inferencia debería caber en GPUs con al menos 2-4 GB de VRAM en precisión fp32, y menos si se cuantiza.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (p. ej., NVIDIA T4, RTX 3060, RTX 4090) es suficiente. El entrenamiento original de modelos ACT similares se ha realizado en T4 (como se menciona en modelos comparables).
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como RTX 3060 o superiores.
- Opciones de despliegue: LeRobot (Python, PyTorch) es la vía principal. También se podría exportar a otros formatos (ONNX) para despliegue en edge, aunque no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| jaheroth/act_pusht_bs64_chunk32_dec7_seed1001 | 83,9 M | no disponible | PushT | Apache-2.0 | Configuración con batch 64, chunk 32, dec 7 |
| jaheroth/act_pusht_chunk32_dec7 | no disponible | no disponible | PushT | Apache-2.0 | Variante sin tamaño de batch explícito en el nombre |
| aadarshram/act_pusht | no disponible | no disponible | PushT | no disponible | Entrenado 80.000 pasos, 3,5 h en T4, para comparar con diffusion policy |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a aspectos estructurales y de configuración.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una política entrenada en un entorno simulado específico (PushT), puede no generalizar a otros objetos, superficies o dinámicas del mundo real.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sin embargo, la política puede generar acciones erróneas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; su entrada son imágenes y estados del robot.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no usar marcas del autor sin permiso.
- Caveat para producción: no se han publicado resultados de éxito ni pruebas de robustez; antes de usarlo en un robot físico es imprescindible validarlo en el entorno real y considerar medidas de seguridad.
- Dependencia de la librería LeRobot: el modelo está ligado al ecosistema de LeRobot; su uso fuera de él requiere conversión de formatos y adaptación del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_chunk32_dec7_seed1001
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo variante (mismo autor): https://huggingface.co/jaheroth/act_pusht_chunk32_dec7
- Modelo comparable (otro autor): https://huggingface.co/aadarshram/act_pusht
