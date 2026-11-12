# guitarorangedog/manifeel-dp-usb

## Resumen

`manifeel-dp-usb` es un checkpoint de política de difusión (Diffusion Policy) para control robótico, publicado por el usuario guitarorangedog en Hugging Face y entrenado con la librería LeRobot 0.6.1 a través del framework robo-synapse. No es un modelo de lenguaje: es un modelo de imitación visomotora que mapea observaciones (imagen de cámara de muñeca e imagen táctil derecha) a acciones de un brazo Franka Panda en una tarea concreta del dataset ManiFeel. El checkpoint tiene 329.216.262 parámetros y ocupa 1,3 GB en formato safetensors.

El modelo se presenta explícitamente como una línea base ("baseline checkpoint") de referencia para la tarea `usb` del dataset `RoboSynapse/manifeel-tacr_franka-panda_usb`, con una tasa de éxito reportada del 53,0% sobre 4 semillas × 50 episodios y un máximo de 500 pasos por episodio. Su relevancia es acotada: sirve como punto de comparación reproducible para quienes trabajan en manipulación robótica con fusión de percepción táctil y visual, no como un modelo de propósito general.

La información disponible es muy limitada: no hay model card extendida, no se especifican licencia ni idiomas, y el repositorio no tiene descargas ni likes en el momento de la consulta. Todo lo que sigue se basa exclusivamente en los metadatos y en el contenido de la model card citada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control robótico), implementada en LeRobot 0.6.1 |
| Parámetros totales | 329.216.262 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el horizonte de predicción de acciones no se especifica) |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | RoboSynapse/manifeel-tacr_franka-panda_usb |
| Entradas | cámara de muñeca + imagen táctil derecha (`tacimg`) |
| Semilla | 1000 |
| Precisión de entrenamiento | AMP (mixed precision) |
| Aumento de datos | desactivado |
| Tamaño del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de Diffusion Policy: en lugar de predecir directamente una acción, aprende a generar trayectorias de acción mediante un proceso de difusión condicionado por las observaciones. La implementación concreta corresponde a LeRobot 0.6.1, la librería de Hugging Face para robótica, y el entrenamiento se realizó con el framework robo-synapse. La entrada combina dos modalidades: la imagen de la cámara de muñeca del robot y una imagen táctil del sensor derecho (`tacimg`), lo que sitúa al modelo en la categoría de políticas viso-táctiles.

Los detalles de entrenamiento disponibles son escasos: se conoce la semilla (1000), el uso de precisión mixta (AMP), la desactivación del aumento de datos y el dataset empleado (`RoboSynapse/manifeel-tacr_franka-panda_usb`, sobre un Franka Panda). No se especifican el número de tokens o frames de entrenamiento, la composición del dataset, el número de pasos de difusión, la arquitectura exacta del backbone de visión ni si hubo etapas de ajuste fino posteriores. Tampoco se documenta ninguna innovación técnica adicional más allá del uso combinado de percepción táctil y visual.

## Capacidades

- Generación de acciones robóticas de manipulación condicionadas por observaciones visuales y táctiles.
- Fusión de dos modalidades de entrada: imagen de cámara de muñeca e imagen táctil derecha.
- Ejecución de la tarea `usb` sobre un brazo Franka Panda, según el dataset de entrenamiento.
- Control de horizonte largo dentro de un episodio: la evaluación permite hasta 500 pasos por episodio.
- Reproducibilidad: el checkpoint está asociado a una semilla y a una receta de entrenamiento públicas (PR del repositorio robo-synapse).
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking". No es un modelo de lenguaje ni multimodal de texto.

## Casos de uso

- Línea base para investigación en políticas de imitación: sirve como referencia reproducible (semilla 1000, AMP, sin aumento) contra la que comparar variantes arquitectónicas o de datos en la tarea `usb`.
- Manipulación con percepción táctil: el modelo integra `tacimg`, por lo que es adecuado para estudiar cómo la señal táctil mejora el agarre y la inserción de conectores USB en un Franka Panda.
- Reproducción de experimentos: al estar vinculado a un PR concreto de robo-synapse, permite replicar el pipeline de entrenamiento y verificar la tasa de éxito del 53,0%.
- Evaluación comparativa de robustez: con 4 semillas × 50 episodios como protocolo, se puede usar para medir varianza entre ejecuciones y detectar inestabilidades.
- Prototipado en entornos simulados o de laboratorio: adecuado para validar políticas viso-táctiles antes de invertir en entrenamientos más largos o datasets mayores.
- Docencia y formación en robótica de imitación: ejemplo práctico y ligero (1,3 GB) de Diffusion Policy con LeRobot para cursos o talleres.
- Punto de partida para ajuste fino: al ser un baseline, puede servir como inicialización para tareas relacionadas con el mismo robot y sensor táctil.

## Benchmarks y rendimiento

| Métrica | Valor | Protocolo |
|---|---|---|
| Tasa de éxito en tarea `usb` | 53,0% | 4 semillas × 50 episodios, máximo 500 pasos por episodio |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de modelos de lenguaje, ya que no aplican a este tipo de modelo. Tampoco se ofrecen comparaciones numéricas con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 329 millones de parámetros en safetensors (1,3 GB), la inferencia en FP32 requeriría aproximadamente 1,3 GB solo para pesos, más el coste de los codificadores visuales y del proceso de difusión iterativo, que no se detalla.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el checkpoint es manejable en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño de pesos, pero no se dispone de confirmación ni de requisitos mínimos documentados.
- Opciones de despliegue: LeRobot 0.6.1 (librería nativa) y el stack robo-synapse. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el número de pasos de difusión y la frecuencia de control del robot, parámetros no especificados.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de Diffusion Policy comparables ni datos de rendimiento de alternativas sobre el mismo dataset.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para la tarea `usb` del dataset ManiFeel sobre un Franka Panda; no generaliza a otras tareas, robots o configuraciones de sensores sin reentrenamiento.
- Tasa de éxito moderada: el 53,0% implica que aproximadamente uno de cada dos episodios falla, lo que lo hace inadecuado para producción sin mejoras.
- Licencia no disponible: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue.
- Documentación mínima: sin model card extendida, sin detalles de dataset, sin especificación de pasos de difusión ni de arquitectura interna.
- Riesgo de sobreajuste al entorno de entrenamiento: al desactivarse el aumento de datos, la robustez ante cambios de iluminación, posición o textura táctil puede ser limitada.
- Sin métricas de seguridad ni de sesgo: no se han publicado evaluaciones de fallos catastróficos, daños al robot o al entorno.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa.
- Sin soporte multilingüe ni de texto: cualquier caso de uso que requiera lenguaje natural queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-dp-usb
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_usb
- Código y receta de entrenamiento (PR): https://github.com/kwk2696/robo-synapse/pull/2
