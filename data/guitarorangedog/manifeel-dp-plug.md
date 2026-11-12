# guitarorangedog/manifeel-dp-plug

## Resumen

`manifeel-dp-plug` es un checkpoint de política de difusión (diffusion policy) para control robótico, entrenado con el framework robo-synapse sobre LeRobot 0.6.1. Lo publica el usuario guitarorangedog y está diseñado para una tarea concreta de manipulación: la inserción de un enchufe (plug) con un brazo Franka Panda, dentro del conjunto de tareas ManiFeel. El modelo consume dos flujos visuales de entrada, la cámara de muñeca y una imagen táctil derecha (`tacimg`), y genera acciones motrices.

Se trata de un modelo de robótica, no de un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Su relevancia reside en que sirve como baseline reproducible para la tarea de inserción con realimentación táctil, con una tasa de éxito declarada del 58,0 % medida sobre 4 semillas y 50 episodios por semilla, con un máximo de 500 pasos por episodio.

El checkpoint tiene 329.216.262 parámetros (dato real de los tensores safetensors) y ocupa 1,3 GB en el repositorio. La información pública disponible es muy limitada: no se declara licencia, idiomas ni resultados de benchmarks más allá de la tasa de éxito de la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (política de difusión para control robótico), framework LeRobot 0.6.1 / robo-synapse |
| Parámetros totales | 329.216.262 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de robótica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es una diffusion policy, un enfoque en el que una red neuronal aprende a generar secuencias de acciones mediante un proceso de difusión (desruido iterativo) condicionado por observaciones. En este caso las observaciones son dos imágenes: la cámara de muñeca y una imagen táctil derecha (`tacimg`), lo que sitúa al modelo en la categoría de políticas viso-táctiles.

El entrenamiento se realizó con robo-synapse sobre LeRobot 0.6.1, usando el dataset `RoboSynapse/manifeel-tacr_franka-panda_plug`. La model card indica semilla 1000, entrenamiento con AMP (mixed precision) y aumento de datos desactivado (augmentation off). No se especifican el número de tokens ni de muestras de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o preferencias (no aplicables en este dominio). Tampoco se detallan innovaciones técnicas adicionales más allá de la propia formulación de diffusion policy con entrada táctil.

## Capacidades

- Generación de acciones de control para un brazo Franka Panda en la tarea de inserción de un enchufe (plug).
- Percepción multimodal: combina cámara de muñeca e imagen táctil derecha (`tacimg`).
- Política de difusión para generación de trayectorias de acción multimodales.
- Ejecución de episodios de hasta 500 pasos.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Baseline de referencia para investigación en inserción con realimentación táctil: sirve como punto de partida reproducible (semilla 1000, AMP, sin aumento de datos) para comparar nuevas políticas en la tarea plug de ManiFeel.
- Evaluación de políticas viso-táctiles: permite medir el impacto de incorporar la imagen táctil frente a políticas puramente visuales en tareas de precisión.
- Reproducción de experimentos: el enlace al PR del repositorio robo-synapse facilita replicar la receta de entrenamiento con LeRobot 0.6.1.
- Desarrollo de pipelines de robótica con LeRobot: el checkpoint en formato safetensors se integra en flujos de entrenamiento y evaluación del ecosistema LeRobot.
- Estudio de robustez ante variaciones de semilla: la métrica declarada (4 semillas × 50 episodios) permite analizar la varianza del rendimiento.
- Transferencia y ajuste fino: al ser un baseline de 329 M de parámetros, puede servir como inicialización para tareas de manipulación relacionadas con el mismo robot y sensórica.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Tasa de éxito (tarea plug) | 58,0 % | 4 semillas × 50 episodios, máximo 500 pasos por episodio |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 329 M de parámetros y pesos en safetensors (1,3 GB de repositorio), la inferencia en precisión completa requiere del orden de 1,3 GB solo para pesos, más memoria para activaciones y las dos entradas de imagen.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder cargar los pesos.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (librería declarada); no se indican vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints comparables de diffusion policy para la misma tarea ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para la tarea plug con Franka Panda y la configuración de sensores descrita; no generaliza a otras tareas sin reentrenamiento.
- Tasa de éxito moderada: el 58,0 % implica que aproximadamente 4 de cada 10 episodios fallan en las condiciones evaluadas.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda sin autorización explícita y requiere consultar al autor.
- Sin información sobre sesgos: no se documentan sesgos del dataset ni limitaciones de generalización más allá de la tarea.
- Riesgo de sobreajuste al dataset y a la configuración de entrenamiento (semilla única, sin aumento de datos).
- Sin datos de benchmarks estandarizados ni de latencia, lo que dificulta la comparación objetiva con otras políticas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- No aplica a producción general: es un baseline de investigación, no un sistema validado para despliegue industrial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-dp-plug
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_plug
- Código y receta: https://github.com/kwk2696/robo-synapse/pull/2
