# guitarorangedog/manifeel-dp-bulb

## Resumen

`manifeel-dp-bulb` es un checkpoint de política de difusión (diffusion policy) para control robótico, publicado por el usuario `guitarorangedog` en Hugging Face bajo la librería LeRobot. Se trata de un modelo de imitación entrenado sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_bulb`, orientado a una tarea concreta de manipulación con el robot Franka Panda en la que la política recibe como entrada la cámara de muñeca y una imagen táctil derecha (`tacimg`).

El modelo no es un LLM ni un modelo de lenguaje: es una política neuronal que mapea observaciones visuales y táctiles a acciones motoras, con 329.219.847 parámetros en formato safetensors y un tamaño de repositorio de 1,3 GB. Su relevancia es acotada: sirve como baseline reproducible para la tarea `bulb` dentro del ecosistema ManiFeel y robo-synapse, no como modelo de propósito general.

La información pública disponible es mínima: la model card no especifica licencia, idiomas ni arquitectura interna más allá de la etiqueta `diffusion-policy`, y no hay resultados de benchmarks más allá del 60,0 % de éxito reportado por el autor. Cualquier uso en producción requeriría validación propia sobre el entorno robótico objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | diffusion policy (política de difusión para control robótico); detalles internos no disponibles |
| Parametros totales | 329.219.847 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada basada en observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | RoboSynapse/manifeel-tacr_franka-panda_bulb |
| Tamano del repositorio | 1,3 GB |
| Entradas | cámara de muñeca + imagen táctil derecha (`tacimg`) |
| Tasa de éxito reportada | 60,0 % (4 semillas × 50 episodios, máximo 500 pasos) |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como `diffusion-policy`, lo que sitúa la política en la familia de métodos que generan trayectorias de acciones mediante un proceso de difusión condicionado por observaciones. No se detalla en la información disponible la columna vertebral visual, el número de pasos de difusión, la dimensión de las acciones ni la composición exacta de la red.

El entrenamiento se realizó con robo-synapse sobre LeRobot 0.6.1, con semilla 1000, precisión mixta (AMP) y aumento de datos desactivado. La entrada combina una cámara de muñeca y una imagen táctil derecha, lo que indica un enfoque multimodal visión-tacto para la tarea `bulb` sobre un Franka Panda. No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este contexto de imitación).

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales y táctiles.
- Fusión de información de cámara de muñeca e imagen táctil derecha (`tacimg`) como entrada multimodal.
- Ejecución de una tarea concreta (`bulb`) sobre un Franka Panda, con horizonte de hasta 500 pasos por episodio.
- Integración con el ecosistema LeRobot 0.6.1 y robo-synapse.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingües: no aplicables.
- No se documentan modos especiales como thinking, visión general o audio.

## Casos de uso

- Baseline reproducible para investigación en políticas de difusión: el checkpoint permite replicar el 60,0 % de éxito reportado y comparar variantes de arquitectura o datos sobre la tarea `bulb`.
- Evaluación de fusión visión-tacto: sirve para estudiar cómo contribuye la imagen táctil derecha al rendimiento frente a configuraciones solo visuales, usando el mismo protocolo de 4 semillas × 50 episodios.
- Punto de partida para fine-tuning en tareas de manipulación similares sobre Franka Panda, aprovechando los pesos preentrenados en el dataset ManiFeel.
- Validación de pipelines de entrenamiento con robo-synapse y LeRobot 0.6.1: útil para comprobar la reproducibilidad del recipe publicado en el PR del repositorio.
- Docencia y demostraciones de imitation learning: el tamaño de 1,3 GB y el formato safetensors facilitan su carga en entornos de laboratorio.
- Comparación de estrategias de aumento de datos y precisión mixta: el checkpoint se entrenó con AMP y sin augmentación, lo que permite contrastar contra variantes con estas técnicas activadas.
- Referencia para el desarrollo de benchmarks internos de manipulación táctil, dado que el autor publica el protocolo de evaluación de forma explícita.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| Tasa de éxito | 60,0 % | 4 semillas × 50 episodios, máximo 500 pasos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 329,2 M de parámetros en safetensors, el peso en precisión original ronda 1,3 GB, pero el consumo real depende de la arquitectura de difusión y del tamaño de las observaciones.
- GPU recomendadas: no disponible. Para robótica en tiempo real se suele requerir una GPU dedicada; no se especifica modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos sugiere que podría caber en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot 0.6.1 es la librería declarada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de diffusion policy comparables ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (`bulb`) sobre un Franka Panda con una configuración sensorial concreta; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Tasa de éxito del 60,0 %: implica un 40 % de fallos en el protocolo reportado, insuficiente para muchas aplicaciones de producción sin mitigaciones.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos, alucinación o limitaciones de contexto en el sentido habitual, al no ser un modelo de lenguaje.
- Dependencia de la imagen táctil derecha: si el sensor táctil falla o cambia de calibración, el rendimiento puede degradarse de forma significativa.
- Entrenado con semilla 1000 y sin augmentación: la robustez ante variaciones de iluminación, posición de objetos o entorno no está documentada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-12) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-dp-bulb
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_bulb
- Código y recipe (PR): https://github.com/kwk2696/robo-synapse/pull/2
