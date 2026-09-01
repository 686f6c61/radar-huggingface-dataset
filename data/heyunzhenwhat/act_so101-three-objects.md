# heyunzhenwhat/act_so101-three-objects

## Resumen

El modelo `heyunzhenwhat/act_so101-three-objects` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. ACT, propuesto en el paper arxiv:2304.13705, predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. Este modelo concreto está entrenado para controlar un brazo robótico SO-101 (tipo `so_follower`) en la tarea de mover tres objetos de una caja izquierda a una caja derecha, utilizando dos cámaras (vista cenital y muñeca) y el estado del robot.

Con 51,67 millones de parámetros, es un modelo compacto diseñado para inferencia en tiempo real en hardware modesto. Su relevancia radica en que demuestra el flujo completo de LeRobot: teleoperación, entrenamiento de una política ACT y despliegue en un robot real, todo con licencia Apache 2.0. Es un ejemplo representativo de cómo los modelos de imitación pueden transferir habilidades manipulativas a robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder con VAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de observacion fija de 1 frame; predice chunks de 100 acciones por defecto en ACT) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

ACT combina un codificador de visión (ResNet) con un transformer encoder-decoder y un módulo VAE (variational autoencoder) para aprender representaciones latentes de las acciones. En lugar de predecir una sola acción por paso, genera un chunk de acciones (típicamente 100 pasos) que el robot ejecuta de forma abierta, reduciendo la acumulación de errores. El modelo consume observaciones de estado (6 dimensiones) y dos imágenes (cenital 720x1280 y muñeca 360x640) y produce acciones de 6 dimensiones (posición y orientación del efector).

El entrenamiento se realizó con el dataset `heyunzhenwhat/so101-three-objects`, que contiene 50 episodios teleoperados (36.227 frames a 30 FPS) de la tarea "mover todos los objetos de la caja izquierda a la caja derecha". Se usaron 100.000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, bajo LeRobot versión 0.6.1. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control de brazo robótico SO-101: genera comandos de posición/orientación (6 DOF) a partir de imágenes y estado.
- Manipulación de objetos: ejecuta tareas de pick-and-place con tres objetos entre dos cajas.
- Percepción visual multimodal: fusiona dos cámaras (cenital y muñeca) para localizar y manipular objetos.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad gracias al chunking de acciones.
- Inferencia en tiempo real: al ser un modelo pequeño (51M parámetros), es adecuado para control en bucle cerrado con latencia baja.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de Hugging Face.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede mover objetos entre contenedores de forma repetitiva, útil para pruebas de robótica educativa o investigación.
- Prototipado rápido de políticas de imitación: sirve como punto de partida para entrenar variantes con nuevos objetos o disposiciones, usando el mismo flujo de LeRobot.
- Evaluación de algoritmos de aprendizaje por imitación: investigadores pueden comparar ACT con otros métodos (diffusion policies, etc.) sobre la misma tarea y hardware.
- Demostración de robótica de bajo coste: el SO-101 es un brazo asequible; este modelo muestra cómo lograr manipulación autónoma sin sensores caros.
- Benchmark de generalización: al estar entrenado con solo 50 episodios, es útil para estudiar la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- Base para fine-tuning en tareas similares: se puede reentrenar con un dataset propio de la misma tarea o adaptar a tareas de apilado o clasificación de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas de éxito, tasa de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67M parámetros, en FP32 ocupa ~207 MB; en FP16 ~104 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en tarjetas integradas.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (GTX 1050 Ti o superior) es suficiente. Para entrenamiento, se recomienda al menos 8 GB de VRAM (el batch size 8 con imágenes 720x1280 puede requerir más).
- Compatibilidad con consumer GPU: sí, cabe en RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU para pruebas lentas, aunque la inferencia en tiempo real requiere GPU.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y controlan el robot. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, se espera una inferencia de pocos milisegundos en GPU moderna, suficiente para control a 30 Hz.

## Comparativa con modelos similares

No se dispone de datos de otros modelos ACT entrenados sobre la misma tarea o hardware para realizar una comparativa cuantitativa. Existen otros modelos ACT en el Hub de Hugging Face (por ejemplo, los oficiales de LeRobot), pero no se han encontrado métricas comparables en la información disponible. Se recomienda consultar el repositorio de LeRobot para ver políticas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado con datos de un único robot y una configuración de cámaras específica; puede fallar si se cambia la iluminación, la posición de las cámaras o el tipo de objetos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir acciones erróneas si las observaciones difieren del dominio de entrenamiento (por ejemplo, objetos nuevos o fondos distintos).
- Limitaciones de contexto: la ventana de observación es de un solo frame; no tiene memoria temporal más allá del chunk de acciones, por lo que no puede adaptarse a cambios dinámicos durante la ejecución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y del hardware SO-101; no se incluyen garantías de seguridad para uso en producción.
- Caveat para producción: no se han realizado evaluaciones de seguridad ni pruebas de robustez; es un modelo de investigación sin certificación para entornos industriales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heyunzhenwhat/act_so101-three-objects
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-three-objects
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
