# dorisjlee/sim-place-colored-box-generalization-act-v2

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política robótica de imitación entrenada con la librería LeRobot de HuggingFace. Se trata de un checkpoint de ACT (Action Chunking with Transformers), el método descrito en el paper arXiv:2304.13705, que predice secuencias cortas de acciones ("chunks") en lugar de un único paso de control. El autor del repositorio es el usuario dorisjlee y el modelo se distribuye con licencia apache-2.0.

La política consume el estado articular de un robot seguidor SO (`observation.state`, vector de 6 dimensiones) junto con dos flujos de vídeo (`observation.images.front` a 3x480x640 y `observation.images.overhead` a 3x720x1280) y produce un vector de acción de 6 dimensiones. El modelo tiene 17.958.406 parámetros reales (según los pesos safetensors) y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en el rango de los modelos ligeros desplegables en hardware de consumo o incluso en una Jetson.

Su relevancia es acotada y experimental: se entrenó sobre el dataset dorisjlee/sim-place-colored-box-generalization (193 episodios, 86.850 fotogramas a 30 FPS) para la tarea "Place Rectangle in Box based on Color", es decir, colocar un rectángulo en la caja correspondiente según su color. El repositorio registra 0 descargas y 0 likes, y no incluye resultados de evaluación, por lo que debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer con predicción de chunks de acciones |
| Parámetros totales | 17.958.406 (dato real de los pesos safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica a una política robótica de imitación (el model card no especifica el tamaño de chunk de acciones) |
| Tipos de cuantización | no disponible (el repositorio publica pesos safetensors en la precisión de entrenamiento; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se pasa como una cadena fija: "Place Rectangle in Box based on Color") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de modelo | política de robótica (pipeline: robotics, tipo: act) |
| Robot objetivo | `so_follower` (seguidor SO-100/SO-101) |
| Cámaras | `front`, `overhead` |
| Entradas | `observation.state` (6,); `observation.images.front` (3, 480, 640); `observation.images.overhead` (3, 720, 1280) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | dorisjlee/sim-place-colored-box-generalization |
| Pasos de entrenamiento | 30.000 |
| Tamaño de lote | 4 |
| Optimizador | adamw |
| Tasa de aprendizaje | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.5.2 |
| Fecha de creación del repo | 2026-10-03 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación en el que un transformer consume las observaciones actuales y emite un chunk de acciones futuras, en lugar de regresar una sola acción por inferencia. La formulación original del paper (arXiv:2304.13705) combina un codificador de tipo CVAE que modela la variabilidad de las demostraciones humanas con un transformer encoder-decoder que produce la secuencia de acciones; las observaciones visuales se procesan con extractores convolucionales antes de entrar al transformer. El model card no detalla la configuración interna de este checkpoint concreto (número de capas, dimensiones ocultas, tamaño de chunk ni si el backbone visual está compartido entre las dos cámaras), por lo que esos datos se consideran no disponibles.

El entrenamiento es puramente de imitación supervisada sobre teleoperación; no se menciona RLHF, DPO ni ningún otro ajuste por preferencias. Se usaron 193 episodios y 86.850 fotogramas a 30 FPS, con 30.000 pasos de optimización, lote de 4, AdamW y tasa de aprendizaje 1e-5, sobre LeRobot 0.5.2 y con semilla 1000. El nombre del dataset ("generalization") y la variante "v2" del repositorio sugieren que el objetivo experimental es medir generalización ante cambios de color o posición de los objetos, aunque el model card no documenta la composición exacta ni los criterios de partición train/test.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 grados de libertad (vector `action` de forma (6,)) para un robot seguidor SO.
- Fusión de dos vistas de cámara: integra una vista frontal a 480x640 y una vista cenital a 720x1280 junto con el estado articular.
- Predicción de chunks de acciones: emite secuencias cortas de acciones por inferencia, lo que reduce la frecuencia efectiva de cómputo necesaria para control a 30 FPS.
- Ejecución de una tarea concreta de pick-and-place guiada por color: "Place Rectangle in Box based on Color".
- Funcionamiento autónomo en bucle cerrado: el script `lerobot-rollout` permite ejecutar la política durante un número de segundos determinado o indefinidamente.
- Reentrenamiento y ajuste fino: la misma receta (`lerobot-train --policy.type=act`) permite reentrenar sobre datos propios.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento ("thinking"), ni capacidades de audio, ni razonamiento simbólico o aritmético.
- No tiene capacidades multilingües: no procesa lenguaje natural más allá de la cadena de tarea.

## Casos de uso

- Automatización de pick-and-place en célula de laboratorio: la política clasifica el rectángulo por color a partir de las dos cámaras y coloca cada pieza en la caja correspondiente, replicando la tarea del dataset de entrenamiento.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de ACT sobre un dataset simulado pequeño (193 episodios), útil para comparar variantes de arquitectura o de aumentación de datos.
- Estudio de generalización visual: al haberse entrenado sobre un dataset denominado "generalization" con objetos de distintos colores, permite medir la degradación de la tasa de éxito ante colores, posiciones o iluminación no vistas.
- Base para ajuste fino con datos propios: con 30.000 pasos y lote 4 se puede reentrenar en una sola GPU en tiempos reducidos, partiendo de este checkpoint o del dataset público asociado.
- Despliegue en robot de bajo coste: al ser una política de ~18 M de parámetros, cabe en una GPU de consumo junto al robot, sin necesidad de servidores de inferencia externos.
- Docencia y prototipado en robótica: el flujo completo (grabar datos, entrenar, desplegar con `lerobot-rollout`) es reproducible en un curso o taller con hardware SO-100/SO-101.
- Pruebas de integración de LeRobot: sirve para validar la cadena de herramientas de la versión 0.5.2, incluida la visualización del dataset en el Space oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio model card indica explícitamente: "_No evaluation results have been provided for this policy yet._" No se dispone de tasas de éxito en robot real o simulado, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- Pesos: 17.958.406 parámetros equivalen a unos 72 MB en fp32 y unos 36 MB en fp16/bf16. El repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: el grueso del consumo proviene de las activaciones de las dos cámaras (3x480x640 y 3x720x1280), no de los pesos. Como estimación orientativa, entre 1 GB y 3 GB en fp32, dependiendo del tamaño de lote y de la implementación; no hay mediciones publicadas en el model card.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090) es suficiente. Una A100 o H100 solo tendría sentido para entrenamiento por lotes o para servir varias instancias.
- Cabe en GPU de consumo: sí, con margen amplio. También puede ejecutarse en CPU, aunque con latencia mayor y probablemente incompatible con un control fluido a 30 FPS.
- Alternativa embebida: por tamaño, es candidata a ejecutarse en una NVIDIA Jetson, siempre que se valide la latencia real de las dos cámaras a 30 FPS.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout --policy.path=dorisjlee/sim-place-colored-box-generalization-act-v2` sobre PyTorch. No aplica vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje ni se distribuye en formato GGUF.
- Latencia y throughput: no disponibles. Como referencia de diseño, el control a 30 FPS implica un presupuesto de 33 ms por paso; el uso de chunks de acciones de ACT reduce la frecuencia de inferencia necesaria, pero el model card no publica el tamaño de chunk ni latencias medidas.
- Hardware robótico asociado: robot seguidor tipo SO (`so_follower`) con dos cámaras (frontal y cenital) conectadas por OpenCV.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. La siguiente tabla recoge únicamente lo que puede afirmarse o bien marca los huecos como no disponibles.

| Modelo | Categoría | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (ACT v2 de dorisjlee) | Política de imitación ACT para robot SO | 17.958.406 | apache-2.0 | HuggingFace, 0 descargas, sin evaluación publicada |
| ACT original (Zhao et al., 2023) | Método de imitación con transformer y action chunking | no disponible | no disponible en la información proporcionada | Paper en arXiv:2304.13705 |
| Diffusion Policy | Política de imitación generativa basada en difusión | no disponible | no disponible en la información proporcionada | Implementación disponible en LeRobot |
| SmolVLA / otros VLA de HuggingFace | Modelos visión-lenguaje-acción | no disponible | no disponible en la información proporcionada | Ecosistema LeRobot |
| Políticas incluidas en LeRobot | Varias familias (ACT, diffusion, etc.) | no disponible | según implementación | Repositorio github.com/huggingface/lerobot |

La comparación cuantitativa (tasa de éxito, robustez, latencia) no puede establecerse porque este checkpoint carece de evaluación y los datos de las alternativas no forman parte de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: el model card declara que no se han proporcionado resultados, por lo que no existe ninguna evidencia publicada de tasa de éxito en robot real o simulado.
- Especialización extrema: la política está entrenada para una única tarea ("Place Rectangle in Box based on Color"); no es un modelo generalista y no se espera que funcione en tareas distintas sin reentrenamiento.
- Fuerte dependencia del montaje: las claves de observación (`observation.images.front`, `observation.images.overhead`), las resoluciones y el tipo de robot `so_follower` están fijados; usar cámaras con otros nombres, resoluciones o colocación invalidará la política.
- Posible brecha sim-a-real: el dataset se denomina "sim-place...", lo que sugiere datos de simulación; el model card no aclara si hubo transferencia a robot físico ni con qué resultado.
- Riesgo de fallo silencioso: al ser una política de imitación, puede producir trayectorias plausibles pero incorrectas ante objetos, colores o iluminación no vistos, sin ninguna señal de incertidumbre calibrada.
- Sesgos de datos: el comportamiento queda determinado por las demostraciones de teleoperación registradas (193 episodios, una única tarea); cualquier sesgo de posicionamiento, velocidad o estrategia del operador se reproduce en la política.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural ni mantiene diálogo; no debe confundirse con un LLM ni evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia: apache-2.0 permite uso comercial y modificación, pero la licencia del dataset asociado debe verificarse por separado antes de reutilizar los datos.
- Metadatos anómalos: el repositorio tiene 0 descargas y 0 likes y la fecha de creación registrada (2026-10-03) resulta inconsistente con un artefacto consolidado; conviene tratar el repositorio como experimental y sin mantenimiento garantizado.
- Seguridad física: cualquier despliegue en hardware real debe hacerse con límites de par, paradas de emergencia y espacio de trabajo despejado, dado que no hay métricas de fiabilidad publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dorisjlee/sim-place-colored-box-generalization-act-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/dorisjlee/sim-place-colored-box-generalization
- Visualización del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=dorisjlee/sim-place-colored-box-generalization
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al., 2024): incluida en el propio model card

Nota: la búsqueda web asociada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos trataban sobre grabación en cintas de casete y no se han incluido por no ser pertinentes.
