# bsbretly/act_first_data_set

## Resumen

`bsbretly/act_first_data_set` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice trozos («chunks») de acciones en lugar de pasos individuales. No es un modelo de lenguaje: es un controlador visomotor entrenado con LeRobot que recibe el estado articular de un brazo `so_follower` (vector de 6 dimensiones) y una imagen de una cámara frontal (3x720x1280), y devuelve un vector de acción de 6 dimensiones. Lo publica el usuario `bsbretly` (Brett Stephens) en Hugging Face, con licencia Apache 2.0.

El modelo se ha entrenado sobre el dataset `bsbretly/first_data_set_20261002_170801`, compuesto por 5 episodios teleoperados, 4208 fotogramas a 30 FPS y una única tarea: «Grab the erasor». Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU.

Su relevancia es acotada y experimental: sirve como ejemplo reproducible del flujo de trabajo completo de LeRobot (grabación de datos, entrenamiento y despliegue) y como punto de partida para fine-tuning en brazos SO-100/SO-101. No hay resultados de evaluación publicados ni evidencia de generalización fuera del entorno de grabación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación con transformer y codificador visual |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible; es una política de control, no un modelo de lenguaje |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; la model card no documenta variantes cuantizadas) |
| Idiomas soportados | No aplica; el condicionamiento de tarea es una cadena fija en inglés («Grab the erasor») |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

Datos adicionales de la ficha: tipo de robot `so_follower`, una cámara `front`, entrada `observation.state` con forma `(6,)`, entrada `observation.images.front` con forma `(3, 720, 1280)` y salida `action` con forma `(6,)`. Descargas: 16. Likes: 0. Creado el 2026-10-03.

## Arquitectura y entrenamiento

ACT es un método de imitación publicado en el paper arXiv:2304.13705 que combina un transformer con un esquema de predicción por chunks: en lugar de emitir una acción por paso, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de compounding y suaviza la ejecución. La implementación concreta usada aquí es la de LeRobot, que combina un codificador visual para la imagen de la cámara frontal con el estado articular del robot y una cabeza de acción que produce el vector de 6 grados de libertad.

La configuración de entrenamiento declarada es: 5000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.2. El dataset de entrenamiento contiene 5 episodios con 4208 fotogramas a 30 FPS, todos correspondientes a la tarea «Grab the erasor» sobre un robot `so_follower`. No se documenta en la información disponible si hubo fases de RLHF, DPO ni ninguna innovación técnica adicional más allá del propio método ACT. Tampoco se especifica el número de tokens ni la composición del dataset más allá del recuento de episodios y fotogramas.

## Capacidades

- Generación de acciones de control visomotor: predice un vector de acción de 6 dimensiones a partir de una imagen RGB y el estado articular.
- Aprendizaje por imitación a partir de datos teleoperados, sin recompensa explícita ni entorno simulado.
- Predicción por chunks de acciones (característica del método ACT), orientada a ejecuciones más estables que el control paso a paso.
- Ejecución de una única tarea concreta: agarrar un borrador («Grab the erasor»), en el entorno y con el robot del dataset de entrenamiento.
- Compatibilidad con el ecosistema LeRobot: los comandos `lerobot-rollout` y `lerobot-train` permiten ejecutar y reentrenar la política.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo «thinking», visión general, audio ni otras modalidades fuera de la cámara frontal declarada.

## Casos de uso

- Agarre de objetos planos en laboratorio: con 5 episodios de «Grab the erasor» y una cámara frontal, la política puede reproducir esa tarea concreta sobre un brazo `so_follower` en la misma configuración de cámara e iluminación.
- Punto de partida para fine-tuning: el repositorio sirve como política inicial para reentrenar con `lerobot-train` sobre un dataset propio más amplio, aprovechando los 51,7 M de parámetros y el hecho de que cabe en una GPU de consumo.
- Validación del pipeline completo de LeRobot: permite comprobar de extremo a extremo la grabación de datos, el entrenamiento y el despliegue en hardware real con `lerobot-rollout --strategy.type=base`.
- Docencia en aprendizaje por imitación: es un ejemplo mínimo (5 episodios, 4208 fotogramas, 5000 pasos) para ilustrar el efecto del tamaño de dataset y del sobreajuste en políticas visomotoras.
- Comparativa metodológica: sirve como referencia de ACT frente a alternativas como Diffusion Policy dentro del mismo framework LeRobot, siempre que se entrene con el mismo dataset.
- Recolección iterativa de datos: el flujo de teleoperación y reentrenamiento permite aumentar episodios y observar si mejora la tasa de éxito en la tarea, útil para calibrar cuántos datos necesita ACT en este setup.
- Pruebas de latencia y despliegue en robótica de bajo coste: al ser un modelo pequeño, se puede medir el rendimiento de inferencia en CPU o GPU modesta sobre brazos tipo SO-100.
- Prototipado educativo: uso en talleres de robótica con hardware asequible, dado el tamaño del modelo y la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: «No evaluation results have been provided for this policy yet», y la sección de evaluación aparece sin tabla de ensayos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1-2 GB en fp32 para los 51,7 M de parámetros, más el coste de las activaciones del codificador visual al procesar imágenes de hasta 3x720x1280. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB, como GTX 1650, RTX 3050, RTX 4090, A100 o H100. No hay requisitos específicos documentados.
- Cabe en GPU de consumo: sí, en cualquier modelo con unos pocos GB de VRAM; incluso es viable en CPU para pruebas.
- Opciones de despliegue: LeRobot con `lerobot-rollout` sobre PyTorch; los pesos están en safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de control.
- Latencia y throughput estimados: no disponible. La política está pensada para operar a la frecuencia del dataset de entrenamiento (30 FPS), pero no se proporcionan mediciones reales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bsbretly/act_first_data_set | ACT (imitación visomotora) | 51.668.614 | No aplica | Apache 2.0 | Hugging Face (16 descargas) |
| Diffusion Policy | Política por difusión para control visomotor | No disponible | No aplica | No disponible en la informacion proporcionada | Implementación en LeRobot |
| SmolVLA | Modelo visión-lenguaje-acción | No disponible | No disponible | No disponible en la informacion proporcionada | Implementación en LeRobot |
| Otras políticas ACT de LeRobot | ACT | Variable según entrenamiento | No aplica | Habitualmente Apache 2.0 | Hugging Face |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia relevante es el tamaño del dataset de entrenamiento: este modelo se ha entrenado con 5 episodios, muy por debajo de lo habitual en políticas publicadas con tasas de éxito altas.

## Limitaciones y advertencias

- Sobreajuste probable: 5 episodios, 4208 fotogramas y una sola tarea constituyen un dataset muy reducido para una política visomotora; es esperable un rendimiento pobre ante variaciones de posición, iluminación o distractores.
- Ausencia total de evaluación: no hay ensayos en robot real ni tasas de éxito publicadas, por lo que no se puede afirmar ningún nivel de fiabilidad.
- Dependencia del entorno de grabación: la cámara `front`, su montaje, resolución (720x1280) y la configuración del robot `so_follower` condicionan el comportamiento; cambiar cualquiera de estos elementos invalida la política.
- Sin generalización a otras tareas: el condicionamiento es la cadena fija «Grab the erasor»; no es un modelo de propósito general y no responde a instrucciones nuevas.
- Sin capacidades de lenguaje, tool calling ni agentes: no debe confundirse con un LLM ni usarse en pipelines conversacionales.
- Riesgo físico: es un controlador de un brazo robótico real; cualquier despliegue debe hacerse con límites de par, paradas de emergencia y supervisión humana. Los fallos de la política pueden provocar colisiones.
- Riesgo de alucinación en el sentido estadístico: el modelo puede producir acciones fuera de distribución ante entradas no vistas, sin mecanismo de detección de incertidumbre documentado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías del autor ni soporte. Conviene citar ACT (arXiv:2304.13705) y LeRobot según lo indicado en la model card.
- Idiomas: no aplica ningún soporte multilingüe; la única cadena de texto es el nombre de la tarea en inglés.
- Reproducibilidad: se documenta semilla 1000, LeRobot 0.6.2 y la configuración de entrenamiento, pero el dataset referenciado tiene un identificador con marca temporal que puede cambiar entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bsbretly/act_first_data_set
- Dataset de entrenamiento: https://huggingface.co/datasets/bsbretly/first_data_set_20261002_170801
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=bsbretly/first_data_set_20261002_170801
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/bsbretly
- Dataset adicional del autor: https://huggingface.co/datasets/bsbretly/first_data_set
