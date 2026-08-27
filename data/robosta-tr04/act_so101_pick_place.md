# robosta-tr04/act_so101_pick_place

## Resumen

El modelo `robosta-tr04/act_so101_pick_place` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Desarrollado por el usuario robosta-tr04 y entrenado con el framework LeRobot de Hugging Face, el modelo está diseñado para controlar un brazo robótico SO-101 (tipo `so_follower`) en la tarea de recoger un cubo y colocarlo sobre un plato.

El modelo se entrenó con un dataset de teleoperación compuesto por 10 episodios y 6861 frames a 30 FPS, utilizando dos cámaras (frontal y de muñeca) y el estado del robot como entradas. Con 51,7 millones de parámetros, es una política compacta que puede ejecutarse en hardware de consumo. Su relevancia radica en que demuestra cómo el aprendizaje por imitación con ACT permite transferir habilidades manipulativas a robots reales con relativamente pocos datos, un enfoque cada vez más accesible para la robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (para procesar imágenes de las cámaras) con un transformador que predice "chunks" de acciones futuras en lugar de una única acción por paso. Esta predicción por lotes reduce el error de acumulación típico de los métodos de clonación de comportamiento y mejora la estabilidad del control en tareas manipulativas.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `robosta-tr04/so101_pick_place`, que contiene 10 episodios teleoperados de la tarea "Pick up the cube and place it on the plate". La configuración de entrenamiento incluyó 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al entrenamiento supervisado.

## Capacidades

- Control robótico de precisión: ejecuta la tarea de pick-and-place de un cubo sobre un plato con un brazo SO-101.
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara frontal y de muñeca (resolución 480x640).
- Integración con estado del robot: utiliza 6 variables de estado (posición y orientación) como entrada adicional.
- Generación de acciones continuas: produce comandos de acción de 6 dimensiones (posición y orientación del efector final).
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS, compatible con el ciclo de control del robot.
- Compatibilidad con LeRobot: se integra con el ecosistema de herramientas de Hugging Face para robótica (entrenamiento, evaluación y despliegue).

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede controlar un brazo SO-101 para trasladar objetos pequeños entre posiciones fijas, útil en entornos de investigación y prototipado.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como punto de partida para comparar ACT con otros métodos (diffusion policies, etc.) en tareas manipulativas reales.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con políticas entrenadas sin necesidad de entrenar desde cero, usando el flujo de rollout de LeRobot.
- Transferencia a tareas similares: el checkpoint puede fine-tuning con datasets adicionales para adaptarlo a nuevas variantes de la tarea (diferentes posiciones de objetos, iluminación, etc.).
- Investigación en generalización de políticas: al ser un modelo pequeño y entrenado con pocos datos, es útil para estudiar los límites de la generalización en clonación de comportamiento.
- Demostraciones de robótica accesible: combinado con hardware de bajo coste como el SO-101, permite montar demostraciones funcionales de manipulación autónoma en ferias o aulas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,7 millones de parámetros, la inferencia requiere aproximadamente 0,2-0,5 GB de VRAM en FP32, y menos si se cuantiza (aunque no se ofrecen cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1050 Ti o superior sería adecuada. También puede ejecutarse en CPU para pruebas de baja frecuencia.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo básicas e incluso en sistemas embebidos con aceleración CUDA.
- Opciones de despliegue: el flujo principal es mediante LeRobot (`lerobot-rollout`), que gestiona la conexión con el robot y las cámaras. También puede integrarse en pipelines personalizados de PyTorch.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser un modelo pequeño y con predicción por chunks, se espera una latencia inferior a 50 ms en GPU moderna, suficiente para control a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| robosta-tr04/act_so101_pick_place | 51,7 M | Pick-and-place SO-101 | 10 episodios, 6861 frames | Apache-2.0 |
| robosta-tr01/act_so101_pick_place | no disponible | Pick-and-place SO-101 | no disponible | no disponible |
| Modelos ACT genéricos en LeRobot Hub | variable | Diversas tareas robóticas | variable | Apache-2.0 |

No se dispone de información suficiente sobre modelos comparables con el mismo robot y tarea. El repositorio `robosta-tr01/act_so101_pick_place` parece ser una variante del mismo autor, pero no se han encontrado sus especificaciones completas. Los modelos ACT entrenados con LeRobot suelen compartir la misma arquitectura base, diferenciándose en el dataset y la tarea específica.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entrenó con solo 10 episodios de un único operador, por lo que puede no generalizar a variaciones en la posición de los objetos, iluminación o condiciones del entorno.
- Riesgo de sobreajuste: con un dataset tan pequeño, es probable que la política memorice las trayectorias específicas en lugar de aprender una estrategia robusta.
- Sin evaluación en robot real: no hay resultados de tasa de éxito publicados, por lo que el rendimiento real en hardware no está verificado.
- Limitaciones de la tarea: el modelo solo ejecuta la tarea de pick-and-place con un cubo y un plato; no es transferible directamente a otras tareas sin reentrenamiento.
- Dependencia de cámaras específicas: las entradas visuales esperan imágenes de 480x640 de dos cámaras concretas (frontal y muñeca); cambios en la configuración de cámaras requieren reentrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye sin garantías y la responsabilidad del despliegue recae en el usuario.
- Sin soporte de cuantización oficial: no se ofrecen versiones GGUF u otras cuantizaciones, lo que puede limitar el despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robosta-tr04/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/robosta-tr04/so101_pick_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=robosta-tr04/so101_pick_place
- Repositorio relacionado (variante del autor): https://huggingface.co/robosta-tr01/act_so101_pick_place
- Proyecto comunitario con SO-101 y ACT: https://github.com/Janarthsr/so101-robot-tasks
