# Marufjon/so101_act_policy

## Resumen

`Marufjon/so101_act_policy` es una política de aprendizaje por imitación para robótica basada en el método ACT (Action Chunking with Transformers), descrito en el artículo arXiv 2304.13705. La desarrolla el usuario Marufjon y se publica en Hugging Face dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un controlador visomotor que traduce observaciones del robot (estado de articulaciones e imágenes) en comandos de acción de bajo nivel.

El modelo se ha entrenado para una tarea concreta de manipulación, "put the blue cube in a bowl" (introducir el cubo azul en un cuenco), a partir de 6 episodios teleoperados que suman 4705 fotogramas a 30 FPS. Va dirigido a un brazo robótico SO-101 con perfil `so_follower` y dos cámaras (`top` y `wrist`). El checkpoint final contiene 51.668.614 parámetros y el repositorio ocupa 0,2 GB.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de cómo entrenar y desplegar una política ACT con LeRobot sobre hardware de bajo coste, y como punto de partida para quien quiera replicar el flujo completo (grabación de datos, entrenamiento y ejecución en robot real) sin depender de modelos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers; transformer encoder-decoder con CVAE y backbones convolucionales para visión) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa secuencias de texto; consume una observación por paso de control) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado con la librería `lerobot`) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-101) |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos ("chunks") de acciones en lugar de un único paso. La arquitectura combina un codificador de estilo de tipo CVAE (que modela la variabilidad de las demostraciones humanas) con un transformer encoder-decoder, y utiliza extractores convolucionales para procesar las imágenes de cámara. La predicción por fragmentos reduce el error acumulado (compounding error) típico de las políticas que actúan paso a paso; en inferencia se suele aplicar un ensamblado temporal que promedia las predicciones solapadas.

El entrenamiento se realizó sobre el dataset `Marufjon/so101_dataset_test_20260923_140439`, compuesto por 6 episodios (4705 fotogramas, 30 FPS) de la tarea "put the blue cube in a bowl". La configuración reportada en la model card es: 100.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.2. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación.

## Capacidades

- Control visomotor de un brazo SO-101 (`so_follower`) a partir del estado de 6 grados de libertad y de dos cámaras (`top` y `wrist` a 480x640).
- Ejecución de una tarea de manipulación concreta: "put the blue cube in a bowl".
- Predicción de fragmentos de acción (action chunking) que reducen el error acumulado frente a políticas paso a paso.
- Aprendizaje por imitación a partir de datos teleoperados, sin recompensas ni entorno simulado.
- No dispone de tool calling, function calling, razonamiento multi-paso, ni capacidades de lenguaje o agentes.
- No dispone de capacidades multilingües ni de modalidades distintas de la percepción visual y propioceptiva descritas.
- No dispone de modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como implementación de referencia de ACT sobre un robot de bajo coste, permitiendo reproducir el flujo completo de grabación, entrenamiento y evaluación descrito en la guía de LeRobot.
- Automatización de tareas pick-and-place en entornos controlados: el modelo ejecuta la secuencia de colocar el cubo azul en un cuenco, útil como banco de pruebas para validar hardware, calibración de cámaras y control a 30 FPS.
- Formación y docencia en robótica: al apoyarse en LeRobot y en un robot SO-101 asequible, permite montar prácticas completas de "entrena tu propia política" con un único comando de entrenamiento y otro de despliegue.
- Comparativa de políticas: se puede usar como baseline ACT frente a otros métodos (Diffusion Policy, VINN) sobre el mismo dataset y hardware para estudiar tasas de éxito y robustez.
- Prototipado de pipelines de control: su naturaleza ligera (51,7 M de parámetros) permite iterar rápidamente sobre bucles de inferencia y ensamblado temporal antes de escalar a tareas más complejas.
- Recolección de datos teleoperados para ampliar el dataset: al integrarse con el flujo de LeRobot, facilita añadir episodios y reentrenar la política sobre nuevas posiciones u objetos.
- Demostración de despliegue en robot real sin GPU de gama alta: al ser un modelo pequeño, cabe en hardware de consumo, lo que facilita montajes de demostración.
- Evaluación de robustez ante variaciones limitadas (posiciones de objeto, iluminación) en el mismo tipo de robot, siempre dentro del alcance de la tarea entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación real sobre el robot ("No evaluation results have been provided for this policy yet"), por lo que no existe tabla de tasa de éxito por tarea ni comparaciones numéricas verificables.

## Requisitos de hardware

- Huella del modelo: 51,7 M de parámetros. En fp32 ocupa aproximadamente 207 MB y en fp16 unos 104 MB, coherente con un repositorio de 0,2 GB.
- VRAM estimada para inferencia: del orden de 1 GB o menos, sumando pesos y activaciones de los backbones convolucionales sobre imágenes de 480x640, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con soporte CUDA suficiente para visión en tiempo real; una RTX 3060, RTX 4070 o RTX 4090 son más que suficientes. En el extremo profesional, una NVIDIA A100 o H100 queda sobredimensionada para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con CUDA; también es viable en CPU para pruebas, aunque el control a 30 FPS puede resentirse.
- Despliegue: mediante LeRobot, usando la CLI `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No está pensado para servidores de LLM como vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política.
- Hardware asociado: robot SO-101 con perfil `so_follower`, puerto serie para el robot y dos cámaras OpenCV (una `top` y otra `wrist`) a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / método | Tipo | Parámetros | Observación de entrada | Licencia / disponibilidad |
|---|---|---|---|---|
| ACT (este modelo, `so101_act_policy`) | Imitación supervisada con transformer y CVAE, action chunking | 51.668.614 | Estado (6,) y 2 cámaras 480x640 | apache-2.0, disponible en Hugging Face |
| Diffusion Policy | Imitación con modelo de difusión sobre acciones | no disponible | Típicamente estado y/o imágenes | no disponible en esta ficha |
| VINN (k-NN sobre demostraciones) | Imitación no paramétrica por vecinos más cercanos | no aplica | Estado y/o imágenes | no disponible en esta ficha |
| Otros checkpoints ACT de LeRobot | ACT sobre distintos robots y datasets | varía según configuración (no disponible) | Variable según robot | Mayoritariamente apache-2.0, disponibles en Hugging Face |

Nota: la comparación es cualitativa; no se dispone de cifras de rendimiento ni de tasas de éxito verificables para ninguno de los métodos en el contexto de este dataset y hardware.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo se entrenó únicamente para una tarea ("put the blue cube in a bowl") con una sola configuración de objetos y robot, por lo que no generaliza a otras tareas ni objetos sin reentrenamiento.
- Dataset reducido: 6 episodios y 4705 fotogramas, lo que limita la robustez frente a variaciones de posición, iluminación, distractores o cambios en el propio robot.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, de modo que no se puede afirmar su fiabilidad en producción.
- Riesgo de fallo silencioso: en tareas visomotoras, errores de percepción o deriva del control pueden producir acciones incorrectas sin aviso explícito, a diferencia de un modelo de lenguaje que puede declarar incertidumbre.
- Dependencia del hardware: las entradas están ligadas a un robot `so_follower`, a dos cámaras a 480x640 ya los nombres de las claves de observación (`observation.images.top`, `observation.images.wrist`); usar hardware distinto exige recalibración y posiblemente reentrenamiento.
- Sin soporte de lenguaje: no procesa instrucciones textuales ni mantiene diálogo; no es adecuado como asistente conversacional ni para tool calling.
- Sesgos: los derivados del dataset de demostración (posiciones, estilos y condiciones concretas de teleoperación), que se trasladan directamente a la política.
- Licencia: apache-2.0, permisiva para uso comercial, aunque las condiciones del dataset y del hardware subyacentes deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Marufjon/so101_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Marufjon/so101_dataset_test_20260923_140439
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Marufjon/so101_dataset_test_20260923_140439
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
