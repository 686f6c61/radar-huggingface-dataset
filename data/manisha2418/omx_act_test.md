# Manisha2418/omx_act_test

## Resumen

`Manisha2418/omx_act_test` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación publicada en el paper arXiv 2304.13705 (Zhao et al., 2023) que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot 0.7.1, la librería de Hugging Face para machine learning en robótica real, y se distribuye como un checkpoint de 51.668.614 parámetros en formato safetensors dentro de un repositorio de 0,2 GB.

Se trata de una política específica para el robot `omx_f`, que consume el estado de las articulaciones (vector de 6 dimensiones) y una imagen RGB de 240x320 píxeles de una cámara llamada `camera1`, y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre el dataset `Manisha2418/Task_1_test_v30`, compuesto por solo 6 episodios y 2101 fotogramas a 15 FPS para la tarea "test 1", lo que indica que se trata de un experimento de validación más que de un modelo listo para producción.

Su relevancia es limitada y acotada: sirve como ejemplo reproducible del flujo de trabajo de LeRobot para entrenar políticas ACT y como referencia para quien quiera replicar el pipeline con sus propios datos. No es un modelo de lenguaje ni un modelo multimodal general; es un controlador robótico de extremo a extremo entrenado con datos teleoperados muy escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena "test 1") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `omx_f` |
| Camaras de entrada | `camera1` (RGB, 3x240x320) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `Manisha2418/Task_1_test_v30` (6 episodios, 2101 frames, 15 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder visual (típicamente ResNet) y un decoder que genera chunks de acciones de longitud fija. La innovación principal del método es predecir varios pasos de acción de golpe, lo que reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación. El modelo aquí publicado tiene 51,7 millones de parámetros, un tamaño coherente con una política ACT de escala pequeña-media orientada a un robot de pocos grados de libertad (6 dimensiones de estado y 6 de acción).

El entrenamiento se realizó durante 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, semilla 1000, usando LeRobot 0.7.1. El dataset contiene únicamente 6 episodios y 2101 fotogramas a 15 FPS para una sola tarea denominada "test 1". No se documenta composición del dataset más allá de esas cifras, ni si hubo aumentos de datos, ni técnicas de regularización adicionales. No hay información sobre RLHF, DPO ni fine-tuning posterior: es aprendizaje por imitación supervisado puro sobre demostraciones teleoperadas.

## Capacidades

- Control robótico de extremo a extremo: dado un estado de 6 dimensiones y una imagen RGB de 240x320, genera un vector de acción de 6 dimensiones.
- Predicción de chunks de acción: el método ACT produce secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la suavidad y reduce el error acumulado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: reproduce la tarea "test 1" tal y como fue demostrada en el dataset.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`, con soporte para el robot `omx_f`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni procesamiento de lenguaje natural.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking": la imagen solo se usa como entrada visual para el control.

## Casos de uso

- Validación de pipeline de LeRobot: sirve para comprobar de extremo a extremo el flujo `lerobot-train` → Hugging Face Hub → `lerobot-rollout` antes de entrenar políticas con datasets mayores. Es adecuado porque el checkpoint es pequeño (0,2 GB) y se carga rápido.
- Reproducción de experimentos ACT: permite replicar el entrenamiento con los mismos hiperparámetros (20.000 pasos, batch 8, lr 1e-05, semilla 1000) y comparar resultados con variaciones del dataset.
- Pruebas de integración hardware-software: útil para verificar la calibración del robot `omx_f`, la cámara `camera1` y la correspondencia de claves de observación (`observation.state`, `observation.images.rgb.camera1`) antes de desplegar políticas reales.
- Demostración educativa de aprendizaje por imitación: ejemplo mínimo para explicar cómo se entrena una política ACT con muy pocos episodios y qué limitaciones tiene.
- Benchmark interno de infraestructura de inferencia: al ser un modelo pequeño, sirve para medir latencia de `lerobot-rollout` en distintas GPUs sin ruido de modelos grandes.
- Base para fine-tuning con datos propios: el checkpoint puede servir como inicialización para reentrenar ACT sobre un dataset mayor del mismo robot y tarea similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM necesaria es muy baja (por debajo de 1 GB en la mayoría de configuraciones, incluyendo buffers de activación).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior es más que suficiente. Para entrenamiento con batch 8 y 20.000 pasos, una RTX 3090 o RTX 4090 acelera notablemente el proceso, aunque el modelo cabe en GPUs de gama baja.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con al menos 2-4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Manisha2418/omx_act_test`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Dependen del robot, de la cámara y del hardware; el modelo opera a 15 FPS según el dataset de entrenamiento, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Manisha2418/omx_act_test` (ACT) | 51.668.614 | no disponible | Control `omx_f`, tarea "test 1" | no disponible | Hugging Face Hub |
| ACT original (Zhao et al., 2023) | no disponible en la informacion | chunks de acciones | Manipulación bimanual (ALOHA) | investigación (paper) | Paper + código de referencia |
| Políticas LeRobot ACT genéricas | variable | variable | Múltiples robots | variable según repo | Hugging Face Hub (varios repos) |
| Diffusion Policy (referencia del ecosistema LeRobot) | variable | no disponible | Control robótico por imitación | variable | Hugging Face Hub / LeRobot |

La comparación cuantitativa con alternativas no es posible porque no se publican métricas de éxito ni de rendimiento para esta política. A nivel cualitativo, este checkpoint se distingue por su tamaño reducido y su entrenamiento con solo 6 episodios, frente a políticas ACT publicadas con datasets de decenas o cientos de episodios.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 6 episodios y 2101 fotogramas para una única tarea ("test 1"), lo que limita severamente la generalización y hace probable el sobreajuste.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar si el uso comercial está permitido. No debe usarse en producción sin aclarar la licencia.
- Específica de hardware: solo funciona con el robot `omx_f` y la cámara `camera1` con la configuración exacta de observaciones (estado de 6 dimensiones, imagen 3x240x320). Cambiar robot, cámara o resolución invalida la política.
- Sin soporte de lenguaje natural: la tarea se fija como cadena ("test 1"); no hay comprensión de instrucciones variables ni generalización a tareas no vistas.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación con datos escasos, puede generar trayectorias erráticas fuera de la distribución de las demostraciones.
- Sin información sobre sesgos: no se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo robótico de control, los sesgos relevantes serían de distribución de estados y entornos, no de lenguaje.
- Fecha de creación futura (2026-11-20): conviene verificar la autenticidad y vigencia del repositorio antes de usarlo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Manisha2418/omx_act_test
- Dataset de entrenamiento: https://huggingface.co/datasets/Manisha2418/Task_1_test_v30
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Manisha2418/Task_1_test_v30
