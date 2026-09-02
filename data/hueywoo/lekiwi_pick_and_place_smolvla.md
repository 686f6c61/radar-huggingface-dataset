# HueyWoo/lekiwi_pick_and_place_smolvla

## Resumen

El modelo `HueyWoo/lekiwi_pick_and_place_smolvla` es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face y descrito en el artículo arXiv 2506.01844. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario HueyWoo, orientado a la tarea de recoger un cubo y colocarlo en una caja con un robot LeKiwi. El modelo se distribuye bajo licencia Apache 2.0 y está integrado en el ecosistema LeRobot, lo que facilita su despliegue y reproducción.

Con 450 millones de parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, a diferencia de otros VLA de mayor tamaño. Este fine-tuning se entrenó sobre un dataset propio de 60 episodios (26 919 fotogramas a 30 FPS) con dos cámaras (frontal y de muñeca), y produce acciones de 9 dimensiones a partir de observaciones de estado y tres imágenes de 256×256 píxeles. Su relevancia radica en demostrar que un modelo compacto puede aprender tareas de manipulación con un conjunto de datos reducido, abriendo la puerta a aplicaciones robóticas de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion, basada en transformer) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de control, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. El fine-tuning se realizó sobre el checkpoint `lerobot/smolvla_base` mediante aprendizaje por imitación supervisada, sin etapas de RLHF ni DPO. El dataset de entrenamiento (`HueyWoo/lekiwi_pick_and_place`) contiene 60 episodios de la tarea "Pick up the cube and place it in the box", con 26 919 fotogramas a 30 FPS. La configuración de entrenamiento incluye 100 000 pasos, batch size 4, optimizador AdamW, learning rate 0,0001 y semilla 42, utilizando la versión 0.6.0 de LeRobot. No se han publicado detalles adicionales sobre la composición del dataset ni sobre innovaciones técnicas específicas del fine-tuning.

## Capacidades

- Generacion de acciones de control robotico (9 dimensiones) a partir de observaciones de estado (6 dimensiones) y tres imagenes de camara (256×256).
- Ejecucion de tareas de pick-and-place en el robot LeKiwi, especificamente recoger un cubo y colocarlo en una caja.
- Procesamiento multimodal: fusiona informacion visual de multiples camaras con el estado del robot.
- Inferencia en tiempo real a 30 FPS, adecuada para control en bucle cerrado.
- No incluye capacidades de tool calling, agentes, razonamiento multi-step ni generacion de texto; es una politica de control pura.

## Casos de uso

- Automatizacion de tareas de manipulacion en entornos de laboratorio: el modelo puede ejecutar la tarea de pick-and-place de forma repetitiva, liberando a operarios humanos de tareas tediosas.
- Prototipado rapido de soluciones roboticas con hardware de bajo coste: al ser un modelo compacto, puede desplegarse en GPUs de consumo, reduciendo la barrera de entrada para investigacion y desarrollo.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas VLA a nuevos robots o tareas, dado su tamano reducido y su integracion con LeRobot.
- Educacion en robotica y aprendizaje automatico: permite a estudiantes y docentes experimentar con VLA en un robot real sin necesidad de infraestructura de alto rendimiento.
- Evaluacion de estrategias de aumento de datos y generalizacion: al entrenarse con solo 60 episodios, es util para analizar el impacto de la cantidad de datos en el rendimiento de politicas VLA.
- Integracion en pipelines de control robotico con ROS2: el repositorio Lekiwi-sim2sim-with-ROS2 muestra como generar datasets simulados y entrenar politicas para el mismo robot, lo que sugiere un flujo de trabajo sim2real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de metricas como tasa de exito, MMLU, HumanEval u otras comparaciones.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM ni latencia. Sin embargo, al tratarse de un modelo de 450 millones de parametros, se estima que en FP16 ocupa aproximadamente 0,9 GB de memoria, lo que permite su ejecucion en GPUs de consumo como una RTX 3060 (6 GB) o superiores.
- El modelo base SmolVLA esta disenado para hardware de consumo, segun el paper original, por lo que es probable que quepa en GPUs con 4-6 GB de VRAM.
- Para inferencia se recomienda usar el framework LeRobot, que soporta CUDA. Tambien es posible ejecutarlo con otras herramientas compatibles con safetensors, aunque no se mencionan vLLM, llama.cpp u Ollama.
- El despliegue tipico se realiza mediante el comando `lerobot-rollout` con el robot `lekiwi_client`, conectado por puerto serie o red.
- No se dispone de datos de throughput ni latencia medidos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria. Existe un fine-tuning alternativo para el mismo robot y tarea, `HueyWoo/act_lekiwi_pick_and_place`, basado en la arquitectura ACT (Action Chunking with Transformers), pero no se han publicado resultados de rendimiento de ninguno de los dos. Ambos comparten el mismo dataset y robot, pero difieren en arquitectura y tamano (ACT suele ser mas pequeno). Sin datos de evaluacion, no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real de la politica.
- El dataset de entrenamiento es reducido (60 episodios), lo que puede limitar la generalizacion a variaciones de posicion, iluminacion o distracciones no vistas durante el entrenamiento.
- La politica depende de la configuracion exacta de camaras y del robot LeKiwi; cambios en la disposicion de las camaras o en el robot pueden degradar el rendimiento.
- La model card indica dos camaras (frontal y de muñeca), pero la tabla de entradas muestra tres imagenes; esta discrepancia debe resolverse antes de desplegar el modelo.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado en un entorno controlado, puede presentar sesgos hacia las condiciones del dataset.
- Riesgo de alucinacion: al ser un modelo de control, no genera texto, pero podria producir acciones incorrectas si las observaciones se alejan de la distribucion de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y del dataset asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HueyWoo/lekiwi_pick_and_place_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/HueyWoo/lekiwi_pick_and_place
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot (libreria): https://github.com/huggingface/lerobot
- Documentacion de LeRobot para smolvla: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio sim2sim para LeKiwi: https://github.com/ArthurLABE/Lekiwi-sim2sim-with-ROS2
- Modelo ACT alternativo: https://huggingface.co/HueyWoo/act_lekiwi_pick_and_place
