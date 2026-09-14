# HyeonseokE/smolvla_ablation2_turn_off_lever_B1_1000_10fps

## Resumen

SmolVLA (identificador `HyeonseokE/smolvla_ablation2_turn_off_lever_B1_1000_10fps`) es un *policy* de robótica de tipo vision-language-action (VLA) afinado por el usuario HyeonseokE a partir del modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje generativo: es una política de imitación que consume observaciones multimodales (estado de las articulaciones e imágenes de cámara) y produce acciones motoras de 6 dimensiones para un brazo robótico SO-101 (`so101_follower`). El modelo cuenta con 450.046.176 parámetros en formato safetensors y ocupa 0,9 GB en el repositorio.

SmolVLA, el método sobre el que se construye (paper arXiv:2506.01844), se presenta según la model card como un modelo VLA compacto y eficiente que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. Este checkpoint concreto está especializado en una única tarea: accionar una palanca para apagarla hasta que el indicador de estado se ponga rojo. El nombre del repositorio indica que forma parte de un estudio de ablación (variante B1, semilla 1000, datos a 10 FPS).

Su relevancia es principalmente metodológica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot 0.6.0 sobre un robot de bajo coste, con datos, configuración de entrenamiento y comandos de ejecución publicados. Se trata de un artefacto de investigación con muy poca adopción (16 descargas, 0 *likes*) y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, VLA); política de imitación derivada de `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (política VLA orientada a acciones; no expone ventana de contexto de texto) |
| Tipos de cuantización | no disponible (el repositorio publica pesos sin documentar cuantizaciones) |
| Idiomas soportados | no disponible; la instrucción de tarea está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so101_follower` |
| Cámaras | `top`, `left_wrist` (entradas declaradas: `camera1`, `camera2`, `camera3`) |
| Dimensión de estado | `observation.state` de forma `(6,)` |
| Dimensión de acción | `action` de forma `(6,)` y `action.radian_urdf0` de forma `(6,)` |
| Resolución de imagen de entrada | 3 x 256 x 256 por cámara |
| Frecuencia de los datos | 10 FPS |
| Framework / librería | LeRobot 0.6.0 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un *policy* SmolVLA, una arquitectura vision-language-action que combina un codificador visual y de lenguaje con un módulo generador de acciones, y que se distribuye a través de la librería LeRobot. La model card describe SmolVLA como un modelo VLA compacto y eficiente, desplegable en hardware de consumo, y remite al paper arXiv:2506.01844 para los detalles de arquitectura, que no se reproducen en la información disponible. El checkpoint parte de `lerobot/smolvla_base`, sobre el que se realiza un ajuste fino específico para la tarea.

El entrenamiento se realizó con el conjunto de datos `HyeonseokE/ablation2_turn_off_lever_B1_10fps`, compuesto por 100 episodios y 21.699 fotogramas grabados a 10 FPS para una única tarea: "Turn the lever off; the status indicator should turn red". La configuración publicada es de 16.950 pasos de entrenamiento, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documentan en la información disponible detalles sobre el número total de tokens, la composición completa del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Control robótico de imitación: genera comandos de acción de 6 dimensiones para un brazo SO-101 a partir de observaciones de estado y de hasta tres cámaras.
- Fusión visio-lingüística: procesa simultáneamente imágenes de 3 x 256 x 256 píxeles y una instrucción de tarea en lenguaje natural.
- Ejecución de una tarea concreta: accionar una palanca hasta que el indicador de estado cambie a rojo, según el dataset de entrenamiento.
- Despliegue mediante LeRobot: se ejecuta con `lerobot-rollout` frente a `lerobot-train` para reentrenamiento.
- Condicionamiento por instrucción textual: la tarea se especifica en el argumento `--task` de la CLI.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, capacidades multilingües, ni modos especiales como *thinking*, visión general o audio. Al ser una política de acción, no genera texto libre.

## Casos de uso

- Automatización de accionamiento de palancas o interruptores en una estación de trabajo: el modelo recibe el estado del brazo y las imágenes de sus dos cámaras y emite las acciones de 6 grados de libertad necesarias para apagar el dispositivo hasta que el indicador se vuelva rojo.
- Reproducción de experimentos de aprendizaje por imitación: al publicarse el dataset (100 episodios, 21.699 fotogramas) y la configuración de entrenamiento (16.950 pasos, AdamW, lr 1e-4, semilla 1000), permite replicar el pipeline completo con LeRobot.
- Estudio de ablaciones: el nombre del checkpoint sugiere que es una variante (B1, semilla 1000, 10 FPS) dentro de una comparativa de configuraciones, útil para analizar el efecto de cambios en datos o hiperparámetros.
- Docencia y formación en robótica: el robot SO-101 y LeRobot están orientados a hardware de bajo coste, y el modelo sirve como ejemplo mínimo funcional de una política VLA entrenada de extremo a extremo.
- Punto de partida para ajuste fino en una tarea nueva: partiendo de `lerobot/smolvla_base` o de este checkpoint, se puede entrenar con `lerobot-train` sobre un dataset propio de otro accionamiento.
- Evaluación de robustez de políticas: al poder ejecutarse en bucle durante un tiempo configurable con `--duration`, permite medir la tasa de éxito bajo variaciones de iluminación, posición de la palanca o colocación de las cámaras.
- Integración en un banco de pruebas de laboratorio: ejecución sobre hardware de consumo (el método se describe como desplegable en este tipo de equipos) para validar el lazo percepción-acción antes de escalar a un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la nota "_No evaluation results have been provided for this policy yet_", por lo que no hay tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas. Tampoco se aportan métricas de latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 450 M parámetros. En precisión de 32 bits ocuparía aproximadamente 1,8 GB y en 16 bits en torno a 0,9 GB, sin contar activaciones ni los codificadores visuales. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas.
- La model card del método afirma que SmolVLA puede desplegarse en hardware de consumo, por lo que cabría esperar ejecución en GPU de gama media y alta con suficiente memoria para los pesos y las tres cámaras de entrada.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090 u otros) en la información proporcionada.
- ¿Cabe en GPU de consumo? Según la descripción del método, sí; no se detallan los modelos concretos compatibles ni los requisitos mínimos.
- Opciones de despliegue: LeRobot 0.6.0 mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento), con backends de cámara OpenCV. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican al ser una política de acción.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada (ni cifras de rendimiento ni especificaciones de alternativas). Como referencia cualitativa de categoría, este *policy* pertenece a la familia de modelos VLA para robótica, en la que se encuadran propuestas como OpenVLA o π0, pero no se han facilitado sus especificaciones para construir una tabla rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_ablation2_turn_off_lever_B1_1000_10fps | 450 M | no aplicable (VLA) | sin evaluación publicada | Apache 2.0 | HuggingFace (16 descargas) |
| lerobot/smolvla_base (modelo base) | no disponible | no aplicable (VLA) | no disponible | no disponible | HuggingFace |
| Otras alternativas VLA (OpenVLA, π0, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea ("Turn the lever off; the status indicator should turn red") sobre un único tipo de robot (`so101_follower`) y un conjunto de datos concreto. Fuera de ese escenario, su comportamiento no está caracterizado.
- Ausencia de evaluación: no hay tasas de éxito ni protocolo de evaluación publicados, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia del montaje: las cámaras declaradas (`top`, `left_wrist`) y sus nombres en la observación deben coincidir exactamente con los usados en el entrenamiento; cualquier cambio de posición, iluminación o tipo de cámara puede degradar el comportamiento, tal como advierte la propia model card.
- Dependencia del hardware: cambios en el robot, en la calibración o en el objeto manipulado pueden invalidar la política.
- Tamaño reducido del dataset: 100 episodios y 21.699 fotogramas para una sola tarea; es un volumen limitado que reduce la diversidad de situaciones cubiertas.
- Riesgo de sobreajuste al escenario de entrenamiento y de fallos silenciosos al salir del dominio, sin mecanismos de detección descritos.
- Idiomas: la instrucción de tarea está en inglés y no se documentan capacidades multilingües.
- Licencia: Apache 2.0, permisiva para uso comercial, aunque no se aclaran las condiciones de los datos de entrenamiento ni del modelo base.
- Artefacto de investigación: con 16 descargas y 0 *likes*, y con un nombre que indica una variante de ablación, debe tratarse como material experimental y no como un componente de producción validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_ablation2_turn_off_lever_B1_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_turn_off_lever_B1_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_turn_off_lever_B1_10fps
- Cita de LeRobot: Cadene, Remi et al., "LeRobot" (BibTeX incluido en la model card)

Nota: los resultados de búsqueda web recibidos (Geoportal Bayern y páginas asociadas) no guardan relación con este modelo y no se han utilizado como fuente.
