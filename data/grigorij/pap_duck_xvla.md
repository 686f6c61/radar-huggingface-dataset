# Grigorij/PaP_duck_xvla

## Resumen

Grigorij/PaP_duck_xvla es un modelo de política robótica basado en X-VLA, un framework de visión-lenguaje-acción (VLA) que emplea soft prompts para adaptar un único modelo base a distintas configuraciones de robots y tareas. Este repositorio contiene un fine-tune del modelo base `lerobot/xvla-base` realizado con la librería LeRobot, especializado en la tarea de manipulación "poner un pato en un cuenco" (put duck to the bowl) sobre un robot seguidor tipo `so_follower`. El modelo fue entrenado por el usuario Grigorij y publicado bajo licencia Apache-2.0.

El interés de este modelo radica en que demuestra el flujo completo de adaptación de un VLA fundacional a una tarea concreta con un conjunto de datos reducido (32 episodios, 16 288 fotogramas). Con aproximadamente 880 millones de parámetros, el modelo procesa observaciones de múltiples cámaras y el estado del robot para generar acciones de control de 6 dimensiones. Su relevancia actual se enmarca en la tendencia de democratizar la robótica mediante modelos abiertos entrenables con pocos datos, siguiendo el paradigma de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (transformer con soft prompts y flow-matching) |
| Parametros totales | 879 687 256 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de accion visual, no procesa texto largo) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible (modelo robotico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

X-VLA es un framework que introduce embeddings aprendibles denominados soft prompts para representar cada configuración de robot o tarea como un vector de tarea. La arquitectura base es un transformer apilado de bloques de autoatención, combinado con un mecanismo de flow-matching para la generación de acciones. Este diseño permite preentrenar un único modelo sobre datasets heterogéneos de múltiples robots y después ajustarlo eficientemente a dominios específicos, como se hace en este repositorio.

El fine-tune parte del checkpoint `lerobot/xvla-base` y se entrena sobre el dataset `Grigorij/PaP_duck_20260819_145921`, que contiene 32 episodios de la tarea "poner un pato en un cuenco", con 16 288 fotogramas a 30 FPS. La configuración de entrenamiento incluye 20 000 pasos, un tamaño de lote de 8, el optimizador `xvla-adamw` con una tasa de aprendizaje de 0.0001 y una semilla de 1000. El modelo se entrenó con la versión 0.6.1 de LeRobot. No se especifican técnicas adicionales como RLHF o DPO, ya que se trata de un ajuste por imitación supervisada.

## Capacidades

- Ejecución de tareas de manipulación robótica tipo pick-and-place, concretamente la acción de recoger un objeto (pato) y depositarlo en un recipiente (cuenco).
- Generación de acciones de control de 6 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y del estado del robot.
- Procesamiento de múltiples entradas visuales: dos cámaras a resolución 256x256 (front y arm) y una tercera cámara a 224x224, junto con un vector de estado de 8 dimensiones.
- Adaptación a una tarea específica mediante fine-tuning sobre un modelo base preentrenado, siguiendo el paradigma de soft prompts de X-VLA.
- No es un modelo de lenguaje: no genera texto, no realiza razonamiento simbólico ni soporta tool calling. Sus capacidades se limitan al dominio de control robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede controlar un robot seguidor para recoger y colocar objetos, útil en investigación de robótica y automatización de pruebas repetitivas.
- Prototipado rápido de políticas robóticas con LeRobot: al estar integrado con la librería, permite entrenar y desplegar nuevas tareas con pocos episodios de demostración, ideal para validar conceptos en entornos académicos.
- Investigación en aprendizaje por imitación y VLA: sirve como ejemplo de fine-tuning de un modelo fundacional sobre un dataset pequeño, permitiendo estudiar la transferencia de conocimiento entre tareas y configuraciones de robot.
- Educación en robótica: el modelo y su pipeline de entrenamiento pueden usarse en cursos universitarios para ilustrar el ciclo completo de recolección de datos, entrenamiento y despliegue de políticas robóticas.
- Benchmarking de algoritmos de control basados en visión: al estar disponible públicamente con licencia Apache-2.0, puede emplearse como referencia para comparar nuevos métodos de VLA o de imitación.
- Integración en sistemas de fabricación flexible: con adaptación adicional, el modelo podría aplicarse a tareas de ensamblaje o clasificación en líneas de producción donde se requiera manipulación precisa de objetos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito ni comparaciones con otros modelos en la tarea específica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 879 millones de parámetros y un tamaño de repositorio de 1.8 GB en precisión fp32, se estima un consumo de memoria de aproximadamente 3.5-4 GB en fp32. Esto permite ejecutar el modelo en GPUs de consumo con al menos 4 GB de VRAM, como una NVIDIA GTX 1660 o RTX 3050.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y al menos 4 GB de VRAM es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM, como una RTX 3060 o superior, dado el tamaño del modelo y el batch size utilizado.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media, aunque el despliegue real requiere también el robot físico (tipo `so_follower`) y las cámaras configuradas.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, usando el comando `lerobot-rollout` con la estrategia base. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje y su pipeline es específico de robótica.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grigorij/PaP_duck_xvla (este) | 879 M | no disponible | Pick-and-place (pato en cuenco) | Apache-2.0 | HuggingFace |
| lerobot/xvla-base | no disponible | no disponible | Modelo base preentrenado multi-robot | Apache-2.0 | HuggingFace |
| Grigorij/smolvla_pap_duck | no disponible | no disponible | Pick-and-place (pato en cuenco) | no disponible | HuggingFace |

La comparativa se limita a los modelos relacionados encontrados en la búsqueda. `smolvla_pap_duck` es una versión compacta de SmolVLA para la misma tarea, pero no se dispone de sus especificaciones detalladas. `xvla-base` es el checkpoint preentrenado del que parte este fine-tune. No hay datos de rendimiento publicados para ninguno de ellos en esta tarea.

## Limitaciones y advertencias

- El modelo se entrenó con solo 32 episodios de demostración, por lo que su capacidad de generalización a variaciones de posición, iluminación o presencia de distractores es limitada y no ha sido evaluada formalmente.
- No se han proporcionado resultados de evaluación en el mundo real; la model card indica explícitamente que no hay resultados reportados, lo que implica un riesgo desconocido de fallo en condiciones no vistas.
- Depende del hardware específico: el modelo espera tres cámaras con resoluciones concretas (256x256, 256x256 y 224x224) y un robot tipo `so_follower`. Cambios en la configuración de sensores o en la cinemática del robot invalidarían el modelo.
- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni realizar razonamiento simbólico. Su uso queda restringido exclusivamente al control robótico.
- Aunque la licencia Apache-2.0 permite uso comercial, no se especifican restricciones adicionales sobre patentes o uso en sistemas de seguridad crítica. Se recomienda revisar la licencia completa antes de un despliegue productivo.
- El modelo fue creado en agosto de 2026 según los metadatos, lo que puede implicar que las versiones de LeRobot o del hardware asociado hayan evolucionado; se recomienda verificar la compatibilidad con la versión actual de la librería.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Grigorij/PaP_duck_xvla
- Paper X-VLA (arXiv 2510.10274): https://arxiv.org/html/2510.10274v1
- Sitio web del proyecto X-VLA: https://thu-air-dream.github.io/X-VLA/
- Repositorio GitHub de X-VLA: https://github.com/2toinf/X-VLA
- Documentación de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/xvla
- Dataset de entrenamiento: https://huggingface.co/datasets/Grigorij/PaP_duck_20260819_145921
- Modelo relacionado (SmolVLA para la misma tarea): https://huggingface.co/Grigorij/smolvla_pap_duck
