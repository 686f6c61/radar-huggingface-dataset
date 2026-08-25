# 1ys1/areumii-smolvla-pickplace-v9

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y descrito en el paper arxiv:2506.01844. El autor, 1ys1, lo ha entrenado con el framework LeRobot para una tarea concreta de manipulación robótica: recoger un cubo rojo y colocarlo en una cesta azul, ejecutada sobre el robot areumii_c1. El modelo se publica con licencia Apache 2.0 y está pensado para desplegarse en hardware de consumo, lo que lo hace relevante para equipos de investigación y desarrollo de robótica con presupuestos limitados.

El modelo parte del checkpoint preentrenado `lerobot/smolvla_base` y se ha ajustado con un dataset propio de 100 episodios y 6532 fotogramas, registrados a 20 FPS con tres cámaras (frontal y dos de muñeca). La arquitectura combina un codificador visual, un modelo de lenguaje y una cabeza de acción que produce vectores de 16 dimensiones para el control del brazo robótico. Con aproximadamente 450 millones de parámetros, es significativamente más ligero que otros VLA de la competencia, lo que permite su ejecución en GPU de gama media.

La relevancia de este modelo radica en que demuestra el flujo completo de entrenamiento y despliegue de un VLA de bajo coste con LeRobot, un ecosistema open source que está ganando tracción en la comunidad de robótica. Además, al ser un fine-tune de un modelo base público, cualquier investigador puede reproducir el proceso con su propio dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual (para procesar imágenes de cámaras), un modelo de lenguaje ligero y una cabeza de decisión que genera acciones de control del robot. La arquitectura está diseñada para ser eficiente: el modelo completo tiene 450 millones de parámetros, lo que permite su ejecución en hardware de consumo sin sacrificar rendimiento en tareas de manipulación. El modelo base, `lerobot/smolvla_base`, fue preentrenado por Hugging Face y se ha fine-tuneado aquí para la tarea específica de pick-and-place.

El entrenamiento se realizó con LeRobot 0.6.1, utilizando el dataset `1ys1/areumii_pickplace-v9` compuesto por 100 episodios y 6532 fotogramas a 20 FPS, con tres cámaras (frontal, muñeca izquierda y muñeca derecha) y un estado del robot de 6 dimensiones (posición y orientación del efector final). La configuración de entrenamiento fue: 30.000 pasos, batch size de 8, optimizador AdamW con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación (behavioral cloning) sobre las demostraciones del dataset.

## Capacidades

- Manipulación robótica: ejecuta la tarea de recoger un cubo rojo y colocarlo en una cesta azul, generando acciones de control de 16 dimensiones para el robot areumbb_c1.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas (frontal, muñeca izquierda y muñeca derecha) a resolución 256×256, lo que permite razonar sobre la escena y la posición del efector.
- Aprendizaje por imitación: el modelo aprende a replicar las demostraciones del dataset, por lo que puede generalizar a variaciones de posición del objeto dentro del espacio de trabajo del robot.
- Eficiencia computacional: al tener solo 450M de parámetros, la inferencia es rápida y apta para GPUs de gama media o incluso CPU con cuantización.
- Integración con LeRobot: compatible con el ecosistema LeRobot, lo que facilita su despliegue con el comando `lerobot-rollout` y su integración con otros robots y cámaras.
- No tiene capacidades de tool calling, generación de texto libre ni razonamiento de propósito general; es un modelo especializado en control robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un robot areumbb_c1 para mover objetos de un punto a otro, por ejemplo en líneas de ensamblaje o pruebas de investigación, reduciendo la necesidad de programación manual de trayectorias.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este fine-tune como punto de partida para entrenar su propio modelo con un dataset pequeño, gracias al flujo de LeRobot y a la base preentrenada de SmolVLA.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como referencia para comparar la calidad de otras técnicas de entrenamiento (por ejemplo, DPO o RL) sobre la misma tarea de pick-place.
- Despliegue en robots de bajo coste: al ser ligero, puede ejecutarse en un mini-PC con GPU modesta, como una Jetson Orin Nano o una RTX 3060, lo que lo hace viable para proyectos de robótica educativa o maker.
- Benchmarking de VLA en hardware de consumo: permite medir el rendimiento real de un modelo VLA de 450M parámetros en un entorno físico, frente a modelos más grandes como OpenVLA (7B), evaluando latencia y precisión.
- Generación de datos de entrenamiento: el modelo puede usarse para recolectar más episodios de forma autónoma (con supervisión humana), ampliando el dataset para mejorar la robustez del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación del robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en la tarea, ni comparaciones con otros modelos en el mismo entorno.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, en FP16 la inferencia requiere aproximadamente 1 GB de VRAM solo para los pesos, más el overhead de las imágenes y la activación. En FP32, se necesitarían ~2 GB. Con cuantización INT8, se reduce a ~500 MB, lo que permite ejecutarlo en GPU con 4 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). En GPU de gama alta (RTX 4090, A100) la inferencia será muy rápida, pero no es necesario.
- En consumer GPU: sí, cabe en GPUs de consumo de 4-8 GB, incluso en iGPU con cuantización agresiva.
- Opciones de despliegue: LeRobot proporciona el script `lerobot-rollout` para ejecutar la política en el robot. También se puede usar con la librería `lerobot` para cargar el modelo y realizar inferencia programática. No hay soporte directo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino de acción robótica.
- Latencia y throughput: no disponible, pero al ser un modelo ligero, se espera una latencia de inferencia inferior a 50 ms en GPU moderna (estimación razonable para un VLA de 450M parámetros con 3 imágenes).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| areumbb-smolvla-pickplace-v9 (este) | 450M | no disponible | Pick-place en robot areumbb | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | Base preentrenada para VLA | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | 2048 tokens | Manipulación general | MIT | HuggingFace |
| RT-2 (Google) | 55B | 32k tokens | Manipulación general | propietario | no público |

SmolVLA se destaca por su eficiencia en comparación con OpenVLA o RT-2, siendo mucho más ligero y ejecutable en hardware de consumo. En cuanto a la tarea, este fine-tune está especializado en un único escenario de pick-place, mientras que los modelos base como OpenVLA pueden generalizar a múltiples tareas con instrucciones de lenguaje. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que es una ventaja frente a otros modelos con licencias más restrictivas.

## Limitaciones y advertencias

- Especialización excesiva: el modelo solo está entrenado para una tarea concreta (recoger cubo rojo y colocarlo en cesta azul) y con un robot específico (areumbb_c1). No generaliza a otros objetos, colores, posiciones o robots sin un nuevo fine-tune.
- Riesgo de alucinación en la generación de acciones: como cualquier modelo de aprendizaje por imitación, puede generar acciones erróneas si la escena difiere de las demostraciones, por ejemplo, con cambios de iluminación o distracciones en el fondo.
- Datos de entrenamiento limitados: solo 100 episodios y 6532 frames, lo que puede causar sobreajuste y baja robustez ante variaciones en la posición del objeto o del brazo.
- Sin evaluación real: no se han publicado resultados de éxito en el robot, por lo que no hay evidencia de que la política funcione en el mundo real con la precisión esperada.
- Dependencia de las cámaras: el modelo requiere exactamente las tres cámaras (frontal, muñeca izquierda, muñeca derecha) con la misma configuración de resolución y posición. Cambios en la calibración o en la disposición de las cámaras invalidarán el modelo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de funcionamiento ni soporte técnico.
- No es un modelo de lenguaje: no se puede usar para generación de texto, diálogo ni razonamiento general. Su única salida es un vector de acciones de control.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/1ys1/areumii-smolvla-pickplace-v9](https://huggingface.co/1ys1/areumii-smolvla-pickplace-v9)
- Dataset de entrenamiento: [https://huggingface.co/datasets/1ys1/areumii_pickplace-v9](https://huggingface.co/datasets/1ys1/areumii_pickplace-v9)
- Paper de SmolVLA: [https://huggingface.co/papers/2506.01844](https://huggingface.co/papers/2506.01844)
- Modelo base: [https://huggingface.co/lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- Guía de LeRobot para SmolVLA: [https://huggingface.co/docs/lerobot/main/en/smolvla](https://huggingface.co/docs/lerobot/main/en/smolvla)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Repo de fine-tuning de SmolVLA (proyecto similar): [https://github.com/GadzhiAskhabaliev/SmolVLA](https://github.com/GadzhiAskhabaliev/SmolVLA)
- Video de evaluación de un modelo similar: [https://www.youtube.com/watch?v=yfHKDRRaGDg](https://www.youtube.com/watch?v=yfHKDRRaGDg)
