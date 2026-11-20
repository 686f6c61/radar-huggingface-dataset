# HRL-Group/stack_temporal_50

## Resumen
`HRL-Group/stack_temporal_50` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el grupo HRL-Group en Hugging Face y se ha entrenado y subido con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Resuelve una tarea de manipulación concreta: apilar un cubo sobre otro y colocar un cubo en una bandeja, sobre un robot `so_follower` con una cámara en la muñeca.

El modelo tiene 51.617.414 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Consume el estado del robot (vector de 6 dimensiones) y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones. Es, por tanto, una política de control visuomotor de pequeño tamaño, no un modelo de lenguaje: su relevancia está en el despliegue de políticas de imitación ligeras en robots de bajo coste.

La ficha se basa únicamente en la información pública disponible en Hugging Face. No hay resultados de evaluación, licencia declarada ni benchmarks publicados, lo que limita la evaluación de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` (una cámara) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | `HRL-Group/stack` (92 episodios, 218.681 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento
ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de una acción por paso de tiempo. La arquitectura combina un codificador visual (procesa la imagen de la cámara de muñeca) con un transformer que modela la secuencia de observaciones y genera el chunk de acciones. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y suele lograr tasas de éxito altas con datos de teleoperación.

El entrenamiento se realizó sobre el dataset `HRL-Group/stack`, con 92 episodios y 218.681 frames a 30 FPS, para dos tareas: "Pick up one cube and stack it on top of the other cube" y "Pick up the cube and place it in the tray". Se ejecutaron 100.000 pasos con batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.7.0. No se documenta en la model card el uso de RLHF, DPO ni otras técnicas de ajuste posteriores; se trata de aprendizaje supervisado por imitación a partir de demostraciones.

## Capacidades
- Control visuomotor de un robot `so_follower` a partir de una imagen de muñeca y el estado articular.
- Predicción de chunks de acciones de 6 dimensiones para tareas de manipulación.
- Ejecución de dos tareas concretas: apilar un cubo sobre otro y colocar un cubo en una bandeja.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso
- Apilado de cubos en línea de montaje: la política ejecuta la tarea "Pick up one cube and stack it on top of the other cube" sobre un `so_follower` con cámara de muñeca, adecuada para demostrar manipulación precisa en entornos controlados.
- Clasificación de piezas en bandeja: la tarea "Pick up the cube and place it in the tray" permite automatizar la recogida y colocación de objetos en un contenedor, un caso típico de pick-and-place.
- Prototipado rápido de políticas de imitación: al ser un modelo pequeño (51,6 M de parámetros) y ligero (0,2 GB), sirve para validar pipelines de LeRobot antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: útil como línea base reproducible para comparar variantes de ACT, con configuración de entrenamiento documentada (100.000 pasos, batch 16, lr 1e-05).
- Demostraciones educativas de robótica: permite mostrar el ciclo completo de teleoperación, entrenamiento y despliegue con LeRobot en hardware de bajo coste.
- Evaluación de robustez visual: al depender de una única cámara de muñeca, es un banco de pruebas para estudiar el efecto de cambios de iluminación y posiciones de objetos en políticas visuomotoras.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors, el modelo ocupa del orden de 0,1 GB en precisión nativa, por lo que la inferencia es viable en GPUs de gama baja.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay datos publicados de latencia.
- Cabe en GPU consumer: sí, por el reducido tamaño del modelo (0,2 GB de repositorio), aunque la latencia real depende del pipeline de visión y del robot.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- No se ha declarado licencia, por lo que el uso comercial queda sin regularizar explícitamente.
- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot.
- Entrenada para un robot concreto (`so_follower`) y una única cámara de muñeca; no es directamente transferible a otras configuraciones sin reentrenamiento.
- Solo cubre dos tareas específicas del dataset `HRL-Group/stack`; fuera de ese dominio su comportamiento es incierto.
- Depende de la posición de la cámara y de las condiciones de iluminación del entorno de entrenamiento; cambios en el entorno pueden degradar el rendimiento.
- Riesgo de sobreajuste a las posiciones de objetos vistas en los 92 episodios de entrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural más allá de la etiqueta de tarea.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack_temporal_50
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
