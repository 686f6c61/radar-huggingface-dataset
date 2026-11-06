# SebasKoedam/act_so101_training_test

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la tasa de éxito en tareas de manipulación robótica. Este repositorio concreto, `SebasKoedam/act_so101_training_test`, es una política ACT entrenada con LeRobot sobre el robot `so_follower` (SO-101) para una única tarea de recogida y colocación de objetos.

Se trata de un artefacto de entrenamiento de pequeña escala: 51,7 millones de parámetros, entrenado durante 2800 pasos con un batch de 8 sobre un dataset de solo 5 episodios y 2238 fotogramas a 30 FPS. No es un modelo de propósito general ni un LLM, sino una política visuomotora que consume el estado articular (6 dimensiones) y una imagen frontal de 480x640 y produce un vector de acción de 6 dimensiones.

Su relevancia es limitada y de carácter demostrativo: sirve como ejemplo reproducible del flujo de trabajo de LeRobot para entrenar y desplegar políticas ACT en hardware asequible (SO-101), y como referencia de la configuración mínima viable de un pipeline de imitación. No dispone de resultados de evaluación publicados ni de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un codificador visual (procesa la imagen frontal de 3x480x640) con un transformer que fusiona la observación del estado articular (6 dimensiones) y genera un chunk de acciones futuras de dimensión 6. La innovación central del método es la predicción de secuencias de acciones (action chunking) junto con un mecanismo de ensamblado temporal (temporal ensembling) que suaviza las transiciones entre chunks y mitiga el error compounding típico de las políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `SebasKoedam/so101_training_test_20261102_093435`: 5 episodios, 2238 fotogramas a 30 FPS, una única tarea ("Pick up the object and place it on mat.") y una sola cámara frontal. La configuración fue de 2800 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de los episodios, ni uso de RLHF/DPO (no aplica en aprendizaje por imitación), ni aumentos de datos, ni validación.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones (probablemente articulaciones del brazo y pinza del SO-101) a partir de observación visual y de estado.
- Ejecución de una tarea específica de pick-and-place: "Pick up the object and place it on mat."
- Control visuomotor de bucle cerrado con una cámara frontal a 30 FPS.
- Predicción de chunks de acciones con ensamblado temporal para movimientos suaves.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración reproducible de imitación robótica: sirve para validar de extremo a extremo el pipeline `lerobot-train` → `lerobot-rollout` sobre un SO-101 real, con una configuración mínima (5 episodios) que cualquier laboratorio puede replicar.
- Prototipado rápido de tareas pick-and-place: la política puede ejecutarse con `--strategy.type=base` durante 60 segundos para comprobar si el robot recoge y coloca el objeto, antes de invertir en datasets mayores.
- Base para fine-tuning: al ser un checkpoint ACT estándar de LeRobot, puede reentrenarse sobre un dataset propio ampliado para mejorar la generalización a nuevas posiciones de objeto o iluminación.
- Docencia y formación: ejemplo didáctico de aprendizaje por imitación con action chunking, útil para explicar el error compounding y el ensamblado temporal en cursos de robótica.
- Pruebas de integración de hardware: verifica la calibración de la cámara frontal, el puerto del robot y la frecuencia de 30 FPS antes de desplegar políticas más complejas.
- Referencia de comparación de hiperparámetros: permite contrastar el efecto de 2800 pasos, batch 8 y lr 1e-05 frente a configuraciones alternativas en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet.", por lo que no existen tasas de éxito en robot real ni métricas de error de acción.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el pipeline de visión y la latencia de la cámara, no la memoria.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo es tan pequeño que la elección apenas afecta al rendimiento.
- Cabe holgadamente en cualquier GPU de consumo e incluso podría ejecutarse en CPU para inferencia, aunque a 30 FPS conviene GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`; no se documentan exportaciones a GGUF, ONNX, TensorRT ni vLLM/TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; el control se ejecuta a 30 FPS según el dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SebasKoedam/act_so101_training_test` | 51,7 M | no aplica | pick-and-place SO-101 | no disponible | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no aplica | manipulación ALOHA | investigación | paper + código |
| Políticas LeRobot `act` oficiales | variable | no aplica | múltiples tareas | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | manipulación | Apache-2.0 (LeRobot) | Hugging Face / GitHub |

La comparación cuantitativa de rendimiento no está disponible porque este checkpoint no publica tasas de éxito. Frente a las políticas de referencia de LeRobot, este modelo se distingue por su carácter de prueba (5 episodios, una tarea) y por la ausencia de licencia declarada, lo que limita su reutilización comercial frente a las políticas oficiales del proyecto.

## Limitaciones y advertencias

- Dataset extremadamente pequeño (5 episodios, 2238 fotogramas): alta probabilidad de sobreajuste y baja generalización a posiciones, objetos o iluminación distintos de los vistos en entrenamiento.
- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito en robot real.
- Una sola cámara frontal y una única tarea: no soporta variaciones de escena ni instrucciones en lenguaje natural.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos, pero al ser una política entrenada con datos de teleoperación de un único operador, hereda sus sesgos motores y de posicionamiento.
- Riesgo de fallo silencioso: al no haber métricas, un despliegue en producción requeriría monitorización manual y límites de seguridad en el robot.
- Fecha de creación futura (2026-11-02) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.
- No apto para tareas de lenguaje, razonamiento, código o visión general; su ámbito es exclusivamente el control visuomotor del SO-101.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebasKoedam/act_so101_training_test
- Dataset de entrenamiento: https://huggingface.co/datasets/SebasKoedam/so101_training_test_20261102_093435
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebasKoedam/so101_training_test_20261102_093435
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
