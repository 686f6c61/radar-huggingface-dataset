# arvinesmaeilydev/smolvla_so101_pick_up_the_cube_75_AUG_normal_and_rotation

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, adaptado específicamente para la tarea de recoger un cubo con el brazo robótico SO-101. El autor, arvinesmaeilydev, ha entrenado el modelo sobre el dataset `PickUpTheCube_Rotation45_25_AUG`, que contiene 50 episodios teleoperados con 22.530 frames a 30 FPS, incluyendo rotaciones de 45 grados y aumentación de datos. El resultado es una política de imitación que genera acciones de 6 dimensiones a partir de observaciones de estado y tres cámaras.

La relevancia de este modelo radica en que demuestra cómo adaptar un VLA preentrenado a una tarea robótica concreta con un número reducido de demostraciones, manteniendo un tamaño de 450 millones de parámetros que permite su despliegue en hardware de consumo. Al estar basado en el modelo base `lerobot/smolvla_base` y entrenado con la librería LeRobot, sigue el flujo de trabajo estándar de la comunidad para entrenamiento y evaluación de políticas robóticas. La licencia Apache 2.0 facilita su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de accion, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, diseñado para ejecutarse en hardware de consumo. Este fine-tuning parte de los pesos preentrenados de `lerobot/smolvla_base` y se entrena con el dataset `PickUpTheCube_Rotation45_25_AUG`, que incluye 50 episodios de teleoperación del brazo SO-101 recogiendo un cubo, con variaciones de rotación de 45 grados y aumentación de datos. La configuración de entrenamiento especifica 20.000 pasos con un batch size de 4, optimizador AdamW, learning rate de 0,0001 y semilla 1000, utilizando la versión 0.6.1 de LeRobot. El modelo procesa tres imágenes de cámaras a 256x256 píxeles junto con el estado del robot (6 dimensiones) y produce una acción de 6 dimensiones (posición y orientación del efector final).

## Capacidades

- Generacion de acciones de control para el brazo robotico SO-101, especificamente la tarea de recoger un cubo.
- Procesamiento de tres vistas de camara (256x256) y fusion con el estado del robot para decidir la siguiente accion.
- Soporte de imitacion learning: el modelo reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Capacidad de generalizar a variaciones de rotacion del objeto gracias a la aumentacion de datos aplicada durante el entrenamiento.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- No incluye capacidades de lenguaje natural, chat ni generacion de texto; es exclusivamente un modelo de politica robotica.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo SO-101 para recoger objetos de una posicion fija, reduciendo la necesidad de programacion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como los VLA compactos se adaptan a tareas especificas con pocas demostraciones.
- Prototipado rapido en laboratorios de robotica: al ser un modelo pequeno, puede desplegarse en GPUs de consumo para validar algoritmos de control antes de escalar a modelos mayores.
- Educacion en robotica: permite a estudiantes experimentar con politicas de aprendizaje por refuerzo e imitacion sin requerir infraestructura de alto rendimiento.
- Desarrollo de sistemas de manipulacion asistida: el modelo puede integrarse en estaciones de trabajo donde un robot colaborativo asiste en tareas repetitivas de recogida y colocacion.
- Benchmarking de VLA en tareas de manipulacion: al estar disponible publicamente, puede usarse como referencia para comparar el rendimiento de otros modelos en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado el tamano de 450M parametros y el peso del repo (5,3 GB), se estima que puede ejecutarse en GPUs con al menos 8 GB de VRAM, pero no hay datos confirmados.
- GPU recomendadas: no se especifican. SmolVLA esta disenado para hardware de consumo, por lo que GPUs como RTX 3060, RTX 4070 o superiores serian adecuadas, aunque no se confirma.
- Compatibilidad con consumer GPU: probablemente si, segun las caracteristicas del modelo base, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en local con `lerobot-rollout`. Tambien puede usarse con otras herramientas de la comunidad, aunque no se mencionan vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| arvinesmaeilydev/smolvla_so101_pick_up_the_cube_75_AUG_normal_and_rotation | 450M | No disponible | Apache 2.0 | Recoger cubo con SO-101 |
| arvinesmaeilydev/smolvla_so101_pick_up_the_cube_50_AUG | 450M (estimado) | No disponible | Apache 2.0 | Recoger cubo con SO-101 (variante) |
| dobri420/smolvla-so101-pick-cube | 450M (estimado) | No disponible | Apache 2.0 | Recoger cubo y colocarlo en caja |
| lerobot/smolvla_base | 450M (estimado) | No disponible | Apache 2.0 | Modelo base preentrenado |

Nota: los parametros de los modelos comparados se estiman por ser fine-tunes del mismo base, pero no se confirman en las fuentes. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- No se han realizado evaluaciones en robot real, por lo que el rendimiento en entornos fisicos es desconocido y podria diferir de las simulaciones.
- El modelo esta entrenado exclusivamente para la tarea de recoger un cubo con el brazo SO-101; no generaliza a otros objetos o configuraciones sin reentrenamiento.
- La dependencia de tres camaras fijas limita su uso en entornos donde la configuracion de sensores sea diferente.
- Riesgo de sobreajuste al dataset de entrenamiento, que solo incluye 50 episodios, lo que puede afectar la robustez ante variaciones no vistas.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de control, los fallos podrian manifestarse como acciones incorrectas o erraticas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base y del dataset asociado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/arvinesmaeilydev/smolvla_so101_pick_up_the_cube_75_AUG_normal_and_rotation)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Rotation45_25_AUG)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Guia de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
