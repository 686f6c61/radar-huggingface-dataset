# Aikwed/pistar06_insert_carrot_into_the_hole_acp_r1

## Resumen

Este repositorio contiene una política de acción Pi0.5 (vision-language-action) afinada para la tarea de inserción de una zanahoria en un agujero, utilizando la etapa Advantage-Conditioned Policy (ACP) del pipeline Evo-RL de MINT-SJTU. A pesar del nombre `pistar06` en el identificador, la arquitectura guardada es `pi05`; Pi*0.6 se usó únicamente como modelo de valor para generar las etiquetas de ventaja que condicionan el entrenamiento de la política.

El modelo parte de los pesos base `lerobot/pi05_base` y se entrena sobre el dataset `AlvinAi/insert_carrot_into_the_hole_hil`, que contiene 83 episodios y 40.353 fotogramas con dos cámaras (frontal y lateral) y 6 dimensiones de articulaciones. El resultado es una política específica de tarea, cámara y embodiment, pensada para ser evaluada en robots reales o simulados dentro del ecosistema LeRobot/Evo-RL. Su relevancia radica en demostrar el uso de aprendizaje por refuerzo offline en el mundo real con condicionamiento por ventaja, un enfoque que permite aprovechar datos subóptimos con etiquetas de calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (vision-language-action, transformer con action expert) |
| Parametros totales | 3.616.757.520 (3,62B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la implementación Pi0.5) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | no disponible (el prompt de tarea es texto en inglés: "insert carrot into the hole") |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La política se basa en Pi0.5, una arquitectura VLA que combina un backbone de visión-lenguaje con un "action expert" que genera acciones de forma autoregresiva mediante difusión. En este caso, el modelo se inicializa desde `lerobot/pi05_base` y se afina por completo (todos los parámetros, incluido el backbone). El entrenamiento utiliza la etapa ACP de Evo-RL: se incorpora un indicador binario de ventaja (ACP indicator) que señala si una transición es de alta o baja calidad, permitiendo que la política aprenda a condicionar su comportamiento según la ventaja estimada por un modelo de valor Pi*0.6. Durante el entrenamiento se aplica un dropout del 30% sobre este indicador para que la política también funcione sin él en inferencia.

El dataset de entrenamiento contiene 83 episodios con 40.353 fotogramas, dos cámaras (`front` y `side`) y acciones de 6 grados de libertad (posiciones de articulaciones). Las imágenes se reasignan a los canales `base_0_rgb` y `left_wrist_0_rgb`, mientras que el canal `right_wrist_0_rgb` se rellena con una cámara enmascarada. El entrenamiento se realizó con 4 GPUs, batch global de 256, 1.580 pasos de optimizador (10,02 pasadas sobre el dataset), bfloat16, gradiente con clipping a 1.0 y checkpointing activado. La pérdida de entrenamiento descendió de ~0,332 a ~0,028, aunque estos son valores de entrenamiento, no de evaluación.

## Capacidades

- Ejecución de tareas de manipulación robótica: inserción de una zanahoria en un agujero, condicionada por texto de tarea.
- Procesamiento de imágenes de dos cámaras (frontal y lateral) para percibir el entorno.
- Generación de acciones de articulaciones (6 dimensiones) en forma de chunks de 50 pasos con 10 pasos de denoising.
- Condicionamiento por ventaja (ACP): puede comportarse de forma distinta según la calidad esperada de la transición, aunque en inferencia el indicador se puede omitir.
- Integración con el ecosistema LeRobot/Evo-RL: carga mediante `PI05Policy.from_pretrained` y procesadores de pre/post.
- No soporta tool calling, generación de texto libre, ni capacidades conversacionales; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de ensamblaje: el modelo puede controlar un brazo robótico para insertar piezas en cavidades, reduciendo la necesidad de programación explícita de trayectorias.
- Evaluación de políticas de RL offline en robótica: sirve como punto de partida para comparar el efecto del condicionamiento por ventaja frente a políticas sin él.
- Investigación en aprendizaje por refuerzo offline: permite estudiar cómo el uso de etiquetas de ventaja mejora la tasa de éxito en tareas de manipulación con datos subóptimos.
- Desarrollo de sistemas de control basados en VLA: el checkpoint puede integrarse en pipelines de LeRobot para pruebas en simuladores o robots reales.
- Benchmarking de hardware de inferencia: al ser un modelo de 3,62B, puede usarse para medir latencia y throughput en GPUs de consumo o de centro de datos.
- Formación y demostración en robótica: el repositorio incluye configuraciones y estadísticas de normalización que facilitan la reproducción y el aprendizaje del flujo Evo-RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de entrenamiento (de ~0,332 a ~0,028) y advierte explícitamente de que no hay evaluación held-out ni tasas de éxito en robot cerrado. No se deben inferir métricas de rendimiento a partir de estos valores.

## Requisitos de hardware

- El modelo tiene 3,62B parámetros; en bfloat16 los pesos ocupan aproximadamente 7,2 GB, pero el repositorio completo pesa 29,9 GB (incluye configuraciones, estadísticas y posiblemente otros artefactos).
- Para inferencia en bfloat16 se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060/4070, A10, L4). Con cuantización a 8 bits cabría en 6-8 GB, y a 4 bits en 3-4 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPUs recomendadas: RTX 4090 (24 GB) para pruebas locales, A100/H100 para despliegue en producción o entrenamiento.
- Opciones de despliegue: el modelo se carga mediante la librería LeRobot (versión compatible con Evo-RL). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. Dependen de la GPU, del tamaño de lote y de los pasos de denoising (10 por acción).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es un fine-tuning de Pi0.5 base, pero no se han publicado métricas comparativas con otras políticas VLA como OpenVLA, RT-2 o el propio Pi0.5 base. Se puede indicar que, por su naturaleza, es comparable en arquitectura a otros modelos VLA de ~3-7B, pero sin datos de rendimiento no es posible establecer una tabla objetiva.

## Limitaciones y advertencias

- No hay evaluación held-out ni pruebas en robot real; la pérdida de entrenamiento baja no garantiza éxito en la tarea.
- La política es específica de la tarea, del diseño de cámaras, del embodiment y de la configuración de normalización. Cualquier cambio en estos aspectos requiere reentrenamiento.
- El uso en robots reales exige límites de seguridad y validación supervisada; no es seguro desplegarlo sin supervisión.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación.
- Los nombres de observaciones, el orden de estado/acciones, el prompt de tarea y el preprocesado deben coincidir exactamente con la configuración guardada.
- No se incluyen estados de optimizador ni de RNG; los checkpoints no permiten reanudar el entrenamiento exactamente.
- El indicador ACP se entrena con un dropout del 30%, pero en inferencia puede omitirse; el comportamiento sin él puede diferir del entrenado con él.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Aikwed/pistar06_insert_carrot_into_the_hole_acp_r1
- Dataset de entrenamiento: https://huggingface.co/datasets/AlvinAi/insert_carrot_into_the_hole_hil
- Repositorio Evo-RL (MINT-SJTU): https://github.com/MINT-SJTU/Evo-RL
- Código del modelo de valor Pi*0.6: https://github.com/MINT-SJTU/Evo-RL/tree/main/src/lerobot/values/pistar06
- Checkpoint intermedio epoch-05: https://huggingface.co/Aikwed/pi0.5-insert-carrot-epoch-5
