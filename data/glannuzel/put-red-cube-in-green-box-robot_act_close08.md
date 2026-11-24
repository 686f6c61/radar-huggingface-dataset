# glannuzel/put-red-cube-in-green-box-robot_act_close08

## Resumen
Este repositorio contiene una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT), publicado por primera vez en 2023 por investigadores de Stanford y Toyota Research Institute. El modelo predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele lograr tasas de éxito altas en tareas manipulativas. Está empaquetado en formato LeRobot y se ejecuta sobre un robot de tipo `grabette`.

El modelo lo ha entrenado y publicado el usuario `glannuzel` para la tarea concreta "put-red-cube-in-green-box-robot", usando un dataset propio de 45 episódios teleoperados (8.981 frames a 30 FPS). Se trata de un artefacto de robótica de nicho, no de un modelo de lenguaje: consume una imagen de cámara y un vector de estado de 2 dimensiones, y produce un vector de acción de 8 dimensiones.

Con 51,59 millones de parámetros y un repositorio de 0,2 GB, es un modelo pequeño que cabe en cualquier GPU consumer y que se ejecuta en tiempo real con la librería `lerobot`. Su relevancia es práctica para quien trabaja con el robot `grabette`: sirve como política de referencia reproducible para la tarea de colocar un cubo rojo en una caja verde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.594.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de una observación por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantización para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de política LeRobot) |

## Arquitectura y entrenamiento
ACT es un transformer que combina un backbone visual (codificador de imágenes) con un decodificador que genera una secuencia de acciones futuras, típicamente de 100 pasos o menos según la configuración, en una sola pasada. La entrada del modelo son las observaciones `observation.images.cam0` con forma `(3, 486, 648)` y `observation.state` con forma `(2,)`; la salida es `action` con forma `(8,)`. El entrenamiento se realizó con LeRobot 0.6.1 durante 25.000 pasos, batch size 16, optimizador AdamW y learning rate 1e-5, con semilla 1000. El dataset de entrenamiento es `glannuzel/put-red-cube-in-green-box-robot_act_graspproj`, con 45 episódios y 8.981 frames a 30 FPS. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos adicionales.

La innovación central de ACT es el chunking de acciones: en lugar de predecir una acción por paso de control, el modelo predice un bloque de acciones coherentes, lo que mitiga el problema de la composición de errores en horizontes largos y estabiliza el comportamiento. El repositorio incluye un único checkpoint entrenado para una tarea específica, sin variantes ni evaluaciones publicadas.

## Capacidades
- Control robótico por imitación para la tarea "put-red-cube-in-green-box-robot" sobre el robot `grabette`.
- Predicción de chunks de acciones a partir de una imagen de cámara (`cam0`) y un estado de 2 dimensiones.
- Ejecución en tiempo real mediante `lerobot-rollout` con estrategia `base`.
- Reentrenamiento sobre datasets propios con `lerobot-train` y `--policy.type=act`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas.

## Casos de uso
- Automatización de la tarea de picking and placing: el modelo coloca un cubo rojo en una caja verde sobre el robot `grabette`, usando la cámara `cam0` como única entrada visual y un estado de 2 dimensiones.
- Reproducción de experimentos de imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios de cámara o configuraciones de chunking sobre el mismo dataset.
- Prototipado rápido de políticas en laboratorio: al ser un modelo de 51,59 M de parámetros y 0,2 GB, se puede iterar en una estación de trabajo sin clúster.
- Docencia y demostraciones de LeRobot: el flujo `lerobot-rollout` con `--strategy.type=base` permite grabar demos de política en robot real con una configuración mínima.
- Fine-tuning sobre nuevos objetos o posiciones: partiendo del checkpoint, se puede reentrenar con `lerobot-train` sobre datasets adicionales grabados con el mismo robot y cámara.
- Pruebas de robustez visual: al recibir imágenes de 486x648, permite estudiar el efecto de cambios de iluminación, distracciones o posición de objetos sobre una política ACT concreta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (51,59 M de parámetros, pesos en safetensors de 0,2 GB), es previsible que quepa en GPUs consumer, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No confirmado; el tamaño del repositorio (0,2 GB) sugiere que sí, pero no hay dato oficial.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. El dataset de entrenamiento se grabó a 30 FPS, pero no se publica latencia de inferencia.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye políticas ACT comparables sobre el mismo robot o tarea, ni resultados de evaluación que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Sin evaluación publicada: no hay tasas de éxito medidas en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño y de una sola tarea: 45 episódios y 8.981 frames para una única tarea ("put-red-cube-in-green-box-robot"), lo que limita la generalización a otras tareas u objetos.
- Dependencia de hardware y calibración: requiere el robot `grabette`, la cámara `cam0` y nombres de cámara que coincidan con las claves de observación del entrenamiento; cualquier desviación invalida la política.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto.
- Licencia apache-2.0: permite uso comercial y modificación con atribución; conviene citar ACT y LeRobot según la model card.
- Caveat de producción: al ser un artefacto de investigación con 0 descargas y 0 likes, no hay evidencia de uso en entornos reales ni de mantenimiento.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/glannuzel/put-red-cube-in-green-box-robot_act_close08)
- [Dataset de entrenamiento](https://huggingface.co/datasets/glannuzel/put-red-cube-in-green-box-robot_act_graspproj)
- [Paper ACT (arXiv 2304.13705)](https://huggingface.co/papers/2304.13705)
- [Guía LeRobot ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia/rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=glannuzel/put-red-cube-in-green-box-robot_act_graspproj)
