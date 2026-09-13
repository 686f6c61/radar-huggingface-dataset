# Kaz55/dp-bluev2-rs500-h64-150k

## Resumen

dp-bluev2-rs500-h64-150k es una política de robótica basada en Diffusion Policy, publicada por el usuario Kaz55 en HuggingFace y distribuida con la librería LeRobot. Se trata de un modelo de imitación (imitation learning) que, a partir del estado del robot y de cuatro cámaras (dos RealSense y dos sensores táctiles GelSight), genera secuencias de acciones para un brazo UR5e equipado con pinza DG5F. El checkpoint corresponde al paso 150.000 de un entrenamiento planificado de 200.000 pasos sobre el dataset Kaz55/dg5f_ur5e_bluev2_rs500 (90 episodios y 101.406 fotogramas).

El modelo tiene 308.812.570 parámetros y un repositorio de 1,2 GB en formato safetensors. Su relevancia es acotada y muy técnica: forma parte de una barrida de experimentos (sweeps) que compara variantes de Diffusion Policy y ACT bajo condiciones controladas de resolución de cámara, horizonte de predicción y número de pasos de entrenamiento. La model card explica decisiones de diseño concretas, como forzar las cuatro cámaras a 500x375 y usar horizon=64 en lugar de 60, porque el U-Net submuestrea tres veces por factor 2 y el horizonte debe ser múltiplo de 8.

No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene benchmarks publicados de MMLU, HumanEval o similares. La licencia y los idiomas no están declarados en la información disponible. Con 0 descargas y 0 likes, es un artefacto de investigación reciente, pensado para evaluación en robot real y no para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión condicional sobre secuencias de acciones, con U-Net temporal que submuestrea 3 veces por factor 2 y codificadores visuales por cámara) |
| Parametros totales | 308.812.570 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de difusión = 64 pasos de acción, de los que se ejecutan 60 (n_action_steps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | robotics |
| Libreria | lerobot |
| Robot objetivo | UR5e con pinza DG5F |
| Entradas | observation.state (26 dimensiones) + 2x RealSense + 2x GelSight, todas a 500x375 |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La política sigue la formulación de Diffusion Policy: se aprende una distribución sobre fragmentos (chunks) de acciones mediante un proceso de difusión, condicionado por las observaciones. El componente generativo es un U-Net temporal con condicionamiento tipo FiLM sobre los embeddings de observación; las imágenes de las cuatro cámaras (dos RealSense y dos GelSight, todas a 500x375) y el vector observation.state de 26 dimensiones forman la condición. La model card justifica explícitamente el uso de horizon=64: el U-Net aplica tres submuestreos por factor 2, de modo que el horizonte debe ser múltiplo de 8 y 60 no es expresable; n_action_steps se mantiene en 60 para alinearse con las ejecuciones ACT ac60. Las entradas observation.velocity y observation.effort se excluyen deliberadamente, en coherencia con el resto de ejecuciones de la misma serie.

El entrenamiento se realizó sobre el dataset Kaz55/dg5f_ur5e_bluev2_rs500, compuesto por 90 episodios y 101.406 fotogramas. El checkpoint publicado corresponde a 150.000 de los 200.000 pasos previstos, con batch de 8 y semilla 1000 (aproximadamente 15,8 épocas si se completasen los 200.000 pasos). La función de pérdida es el error cuadrático medio (MSE) del ruido predicho, típica de los modelos de difusión. La model card advierte que esta pérdida no es comparable con la L1 sobre acciones que usa ACT, por lo que solo deben compararse entre sí los checkpoints de difusión (50k, 100k, 150k y 200k) y la selección final debe hacerse mediante evaluación en el robot real. No se documenta uso de RLHF, DPO, decodificación especulativa ni atención lineal.

## Capacidades

- Generación de secuencias de acciones para control robótico: produce fragmentos de 60 acciones ejecutables a partir de observaciones multimodales.
- Percepción visual multimodal: procesa dos cámaras RealSense junto con dos sensores táctiles GelSight, lo que permite tareas de manipulación sensibles al contacto.
- Condicionamiento por estado propioceptivo: integra un vector observation.state de 26 dimensiones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas o teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución en bucle cerrado: al reobservar y volver a predecir tras cada bloque de acciones, puede corregir desviaciones durante la tarea.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso simbólico: no soportado en el sentido de LLM; el razonamiento es puramente sensorio-motor.
- Capacidades multilingües: no aplica.
- Capacidades especiales: entrada táctil (GelSight) y difusión sobre acciones; no dispone de modo de razonamiento (thinking mode), visión para descripción de imágenes, audio ni generación de texto.

## Casos de uso

- Manipulación robótica con UR5e en laboratorio: el modelo genera directamente comandos de acción para el brazo a partir del estado y las cuatro cámaras, por lo que puede desplegarse como política de control en tareas de pick-and-place previamente demostradas.
- Tareas de inserción y ensamblaje con realimentación táctil: el uso de dos sensores GelSight permite detectar contacto y fuerzas locales, lo que resulta adecuado para encajar piezas donde la visión sola no basta.
- Agarre de objetos deformables o frágiles: la señal táctil a 500x375 ayuda a regular la fuerza de la pinza DG5F en objetos que no deben deformarse.
- Investigación en aprendizaje por imitación: sirve como punto de comparación dentro de una barrida que enfrenta Diffusion Policy (horizonte 64) con ACT (ac60) bajo el mismo conjunto de datos y condiciones.
- Selección de checkpoints por evaluación en robot: al existir versiones en 50k, 100k, 150k y 200k pasos, permite estudiar la relación entre pasos de entrenamiento y tasa de éxito real en la tarea.
- Reentrenamiento y ajuste fino sobre nuevos datasets: al estar en formato LeRobot con pesos safetensors, puede reutilizarse como inicialización para variantes con otras cámaras o tareas, siempre que se respete la resolución común de 500x375.
- Docencia y reproducción de experimentos: el repositorio documenta decisiones de configuración (resolución homogénea, múltiplos de 8 en el horizonte) que sirven como ejemplo práctico de las restricciones de LeRobot Diffusion Policy.
- Estudio de robustez frente a cambios de iluminación y punto de vista: al depender de cuatro cámaras, permite analizar cómo degrada el rendimiento al alterar las condiciones visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la pérdida de difusión es el MSE del ruido predicho y que no es comparable con la pérdida L1 de ACT, y recomienda elegir la política mediante evaluación en el robot real en lugar de comparar valores de pérdida entre familias de modelos.

| Metrica | Valor |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica / no disponible |
| Tasa de exito en robot | no disponible |
| Perdida de difusion (MSE del ruido) | no disponible (no se reporta el valor numérico) |
| Comparacion directa con ACT | no valida segun la model card (perdidas no comparables) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,2 GB (308,8 M de parámetros en fp32); sumando activaciones de cuatro cámaras a 500x375 y el proceso de difusión, es razonable reservar del orden de 4 a 8 GB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no hay recomendaciones publicadas; por tamaño, cabría en RTX 3090, RTX 4090, A100 o H100. Al ser una política de control, la latencia importa más que la capacidad bruta de cómputo.
- GPU de consumo: sí, es probable que quepa en GPU de consumo con 8 GB o más de VRAM, dado el tamaño de los pesos, aunque no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot con PyTorch es la vía documentada. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje. Exportación a ONNX o TensorRT: no disponible.
- Latencia y throughput: no disponible. El coste depende del número de pasos de denoising configurado y del número de cámaras activas, y no se reporta en la model card.
- Almacenamiento: 1,2 GB para el repositorio completo del checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte / acciones | Entradas | Licencia | Estado |
|---|---|---|---|---|---|
| dp-bluev2-rs500-h64-150k | 308,8 M | horizon=64, n_action_steps=60 | 26 dims de estado + 2x RealSense + 2x GelSight | no disponible | publicado |
| dp-bluev2-rs500-h64-50k | no disponible | horizon=64, n_action_steps=60 | idem | no disponible | publicado |
| dp-bluev2-rs500-h64-100k | no disponible | horizon=64, n_action_steps=60 | idem | no disponible | publicado |
| dp-bluev2-rs500-h64-200k | no disponible | horizon=64, n_action_steps=60 | idem | no disponible | publicado |
| Politica ACT (ac60) mencionada como referencia | no disponible | bloque de 60 acciones | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, licencia ni parámetros de las alternativas, por lo que no es posible establecer una comparación cuantitativa. La única comparación fiable que indica la model card es entre los cuatro checkpoints de la misma familia, seleccionando el mejor mediante evaluación en el robot.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al entorno de demostración: solo 90 episodios y 101.406 fotogramas de un montaje concreto (UR5e, DG5F, dos RealSense y dos GelSight). Cambios de robot, iluminación o disposición de cámaras degradarán el rendimiento.
- Restricción dura de resolución: las cuatro cámaras deben aportar imágenes a 500x375; LeRobot rechaza configuraciones donde las cámaras no comparten resolución.
- Checkpoint intermedio: corresponde a 150.000 de 200.000 pasos, por lo que está por debajo del entrenamiento previsto.
- Ausencia de benchmarks y de tasa de éxito: no hay ninguna métrica de rendimiento publicada; la única guía del autor es evaluar en el robot real.
- Pérdida no interpretable fuera de su familia: el MSE del ruido predicho no es comparable con la L1 de ACT, y un valor bajo de pérdida no garantiza buen comportamiento en la tarea.
- Riesgo de deriva en ejecución prolongada: al ser una política de imitación, puede acumular error fuera de la distribución de estados visitados durante las demostraciones.
- Alucinación en el sentido de LLM: no aplica. El fallo equivalente es generar acciones no válidas o inseguras ante entradas fuera de distribución, algo crítico en un brazo real.
- Idioma: no aplica, el modelo no procesa lenguaje ni texto.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Búsqueda web sin resultados útiles: las consultas realizadas no devolvieron documentación, papers ni discusiones relevantes sobre este modelo; toda la información procede de la model card y de los metadatos de HuggingFace.
- Dependencia de versión de LeRobot: el comportamiento de validación de características y las restricciones de configuración pueden variar entre versiones de la librería.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/dp-bluev2-rs500-h64-150k
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_bluev2_rs500
- Perfil del autor: https://huggingface.co/Kaz55
- Checkpoints relacionados citados en la model card: dp-bluev2-rs500-h64-50k, dp-bluev2-rs500-h64-100k, dp-bluev2-rs500-h64-200k (mismo autor, mismos tags de LeRobot)
- Papers, blogs, repositorios o demos adicionales: no disponible; la búsqueda web no devolvió resultados relevantes sobre este modelo.
