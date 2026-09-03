# sdadasdaga/act-pick-cube-2cam-chunk50

## Resumen

El modelo `sdadasdaga/act-pick-cube-2cam-chunk50` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollado por el autor sdadasdaga y entrenado con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Este modelo concreto está especializado en la tarea de agarrar un cubo negro con un robot tipo `so_follower`, utilizando dos cámaras (una cenital y otra en la muñeca) y el estado del robot como entradas.

Con 51,6 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware de bajo coste. Su relevancia radica en que demuestra el flujo completo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de imitación, siendo un ejemplo práctico para investigadores y desarrolladores de robótica. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.617.414 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors) |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en una arquitectura Transformer con un codificador que procesa observaciones visuales (imágenes de dos cámaras) y el estado del robot, y un decodificador autorregresivo que genera un chunk de acciones futuras. Esta predicción por chunks reduce el error de acumulación típico de los métodos paso a paso y permite ejecutar movimientos más suaves y coordinados. El modelo fue entrenado con el dataset `sdadasdaga/pick-cube-2cam`, que contiene 30 episodios teleoperados (8.971 frames a 30 FPS) de la tarea "Grab the black cube". El entrenamiento se realizó durante 100.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, utilizando la versión 0.6.0 de LeRobot. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) de 6 dimensiones a partir de observaciones multimodales.
- Entrada visual dual: procesa simultáneamente imágenes de una cámara cenital y una cámara en la muñeca, ambas a 480x640 píxeles.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo scripts de entrenamiento y despliegue.
- Ejecución en tiempo real: al ser un modelo pequeño, puede ejecutarse en GPUs de consumo sin latencia significativa.
- No tiene capacidades de lenguaje, visión general ni tool calling; está especializado exclusivamente en la tarea de manipulación para la que fue entrenado.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en un robot `so_follower` para agarrar objetos específicos (en este caso, un cubo negro) en una configuración fija de cámaras.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del chunking de acciones, la influencia del número de cámaras o la transferencia a otras tareas.
- Demostración de LeRobot: es un ejemplo funcional del flujo completo de entrenamiento y despliegue, útil para talleres y tutoriales.
- Prototipado rápido de políticas robóticas: con solo 30 episodios de datos, se puede obtener una política funcional, lo que permite iterar rápidamente en nuevas tareas.
- Benchmarking de hardware robótico: al ser ligero, se puede usar para medir la latencia de inferencia en diferentes GPUs o incluso en CPU.
- Educación en robótica y aprendizaje automático: permite a estudiantes experimentar con un pipeline real de imitación sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado el tamaño del modelo (51,6 M parámetros) y la entrada de imágenes, se estima que puede ejecutarse en GPUs con menos de 2 GB de VRAM, aunque este dato no está confirmado.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060 o superior) es suficiente. También podría ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para caber en tarjetas como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño y con chunks de acción, se espera una latencia baja, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea o con la misma arquitectura dentro del repositorio. Dado que es un modelo de robótica específico para una tarea concreta, no se pueden establecer comparaciones directas sin datos adicionales. Se indica "no disponible".

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona para la tarea "Grab the black cube" y con la configuración exacta de cámaras y robot utilizada en el entrenamiento. Cambios en la posición de la cámara, iluminación o tipo de objeto degradarán su rendimiento.
- Dataset pequeño: solo 30 episodios de entrenamiento, lo que puede limitar la generalización a variaciones no vistas.
- Sin evaluación reportada: no hay resultados de éxito en robot real, por lo que su rendimiento real no está verificado.
- Dependencia de la calibración: el robot `so_follower` y las cámaras deben estar calibrados correctamente para que las observaciones coincidan con las del entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en entornos de producción.
- No es un modelo de lenguaje: no debe confundirse con modelos de IA generativa; su única función es generar acciones de control.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sdadasdaga/act-pick-cube-2cam-chunk50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/sdadasdaga/pick-cube-2cam
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
