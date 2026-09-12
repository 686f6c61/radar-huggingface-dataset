# Ricky97/SO101_pick_dice_in_bowl

## Resumen

SO101_pick_dice_in_bowl es una política de robótica (no un modelo de lenguaje) entrenada con LeRobot y publicada en Hugging Face por el usuario Ricky97. Se trata de una implementación de Diffusion Policy, un método que formula el control visomotor como un proceso generativo de difusión: en lugar de predecir una única acción, el modelo genera trayectorias de acción completas y suaves, lo que resulta especialmente adecuado para tareas de manipulación con contacto rico. El repositorio ocupa 0,4 GB y contiene 89.243.910 parámetros en formato safetensors.

La política está especializada en una única tarea: "Pick the dice and put it in the white bowl" (coger el dado y meterlo en el cuenco blanco). Consume como entradas el estado del robot (vector de 6 dimensiones) y dos cámaras RGB de 480x640 (muñeca y cámara frontal o "agent"), y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre un dataset propio de 30 episodios y 11.573 fotogramas grabados a 30 FPS con un robot SO-101 en configuración follower.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible y de código abierto (licencia Apache 2.0) del flujo completo de imitación en LeRobot; por otro, demuestra que con muy pocos episodios (30) y un modelo de ~89 M de parámetros es posible obtener políticas de manipulación contact-rich desplegables en hardware de consumo. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visomotor, ref. arXiv:2303.04137) |
| Parámetros totales | 89.243.910 (~89,2 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones por fotograma) |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural; la tarea se fija como cadena de texto en tiempo de ejecución) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (6,) |
| observation.images.wrist | VISUAL | (3, 480, 640) |
| observation.images.agent | VISUAL | (3, 480, 640) |
| action | ACTION | (6,) |

Datos de entrenamiento asociados:

| Parámetro | Valor |
|---|---|
| Dataset | Ricky97/SO101_pick_dice_in_bowl |
| Episodios | 30 |
| Fotogramas | 11.573 |
| Frecuencia de captura | 30 FPS |
| Tarea | "Pick the dice and put it in the white bowl" |
| Tipo de robot | so_follower (SO-101 en configuración follower) |
| Cámaras | wrist, agent |
| Pasos de entrenamiento | 150.000 |
| Tamano de lote | 32 |
| Optimizador | adam |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

La arquitectura sigue el enfoque Diffusion Policy: el control visomotor se trata como un proceso generativo de difusión que produce trayectorias de acción multi-paso suaves, en lugar de regresar una acción puntual. Este diseño está pensado para tareas de manipulación con contacto rico, donde las distribuciones de acción multimodales hacen que las políticas deterministas tiendan a promediar comportamientos incompatibles. La política consume dos flujos visuales de 480x640 píxeles (cámara de muñeca y cámara frontal) más un vector de estado propioceptivo de 6 dimensiones, y emite un vector de acción de 6 dimensiones.

El entrenamiento se realizó íntegramente con LeRobot 0.6.2 en modo aprendizaje por imitación (behavior cloning sobre demostraciones), con 150.000 pasos, lote de 32, optimizador Adam y tasa de aprendizaje 1e-4. El dataset de partida contiene únicamente 30 episodios (11.573 fotogramas a 30 FPS) de la tarea de recoger el dado y depositarlo en el cuenco blanco, lo que sitúa a esta política en el régimen de pocas demostraciones. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por preferencias, ni detalles sobre aumentos de datos, composición del dataset más allá de la tarea única o innovaciones técnicas adicionales (por ejemplo, decodificación especulativa o atención lineal), que en este contexto no aplican.

## Capacidades

- Generación de trayectorias de acción de 6 grados de libertad para un brazo SO-101 en configuración follower, a partir de observaciones visuales y propioceptivas.
- Manipulación visomotora con contacto rico: la formulación por difusión favorece movimientos suaves y multi-paso, adecuados para agarre y colocación de objetos.
- Ejecución de una única tarea aprendida: "Pick the dice and put it in the white bowl".
- Fusión de dos vistas de cámara (muñeca y frontal) con el estado del robot en cada paso de inferencia.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout`, sin necesidad de teleoperación durante la inferencia.
- Entrenamiento y ajuste reproducible con `lerobot-train` sobre datasets en formato LeRobot.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de agente.
- No dispone de capacidades multilingües, de generación de texto, de código, matemáticas, visión general (VQA) ni audio.
- No dispone de modo "thinking" ni de capacidades de conversación: es una política de control, no un modelo generativo de lenguaje.

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política ejecuta de forma autónoma la secuencia de coger un dado y depositarlo en un cuenco, lo que permite validar montajes de robot SO-101 y calibrar cámaras sin escribir controladores propios.
- Base de referencia para investigación en diffusion policies: al ser un checkpoint público con dataset y configuración de entrenamiento documentados (150.000 pasos, lote 32, lr 1e-4, semilla 1000), permite reproducir experimentos y comparar variantes del método.
- Ajuste fino con pocas demostraciones: con solo 30 episodios como punto de partida, es un caso práctico para estudiar cuántos episodios adicionales hacen falta al adaptar la política a una tarea nueva o a una posición de objeto distinta.
- Recolección de datos y anotación: el flujo de LeRobot asociado sirve para grabar episodios sincronizados (vídeo de dos cámaras + estado + acción a 30 FPS) y construir datasets reutilizables para entrenar otras políticas.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos completos de ejecución y entrenamiento, por lo que es un material didáctico directo para cursos de aprendizaje por imitación con hardware de bajo coste.
- Despliegue en robot de bajo coste: al tener 89,2 M de parámetros y 0,4 GB de repositorio, la política puede ejecutarse en un equipo con GPU de gama media o incluso en un ordenador de sobremesa conectado al brazo, sin clúster de inferencia.
- Pruebas de integración en pipelines de robótica: sirve como componente de control dentro de un sistema mayor (por ejemplo, un orquestador que decide cuándo lanzar la política y evalúa el éxito de la tarea con una cámara adicional).
- Evaluación comparativa de políticas en LeRobot: al ser un checkpoint concreto de tipo `diffusion`, se puede contrastar contra políticas del mismo framework (por ejemplo, tipo `act`) sobre el mismo dataset y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica: "No evaluation results have been provided for this policy yet." No existen, por tanto, tablas de tasa de éxito por tarea, número de intentos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores o cambio de robot).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,36 GB solo para los pesos en precisión de 32 bits (89,2 M de parámetros); con activaciones de dos flujos de imagen a 480x640 y el búfer de difusión, el consumo se mantiene por debajo de 1 GB en la mayoría de configuraciones (estimación derivada del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con al menos 4 GB de VRAM es suficiente; no se documentan pruebas con modelos concretos (A100, H100, RTX 4090 u otros).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (por ejemplo, serie RTX 30/40) y en aceleradores integrados tipo Jetson con memoria suficiente; el cuello de botella real será el procesamiento de las dos cámaras a 30 FPS, no el modelo.
- CPU: viable en teoría por el tamano del modelo, aunque el coste del muestreo por difusión y el preprocesado de imagen pueden impedir mantener los 30 FPS; no hay datos publicados.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` (estrategia `base`), con `--policy.path=Ricky97/SO101_pick_dice_in_bowl`. No se documenta soporte específico para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponible. La inferencia de una política de difusión implica varios pasos de denoising por acción; el número exacto de pasos y los tiempos medidos no se indican en la información disponible.
- Requisitos de robot y sensores: brazo SO-101 en configuración `so_follower`, dos cámaras OpenCV a 640x480 y 30 FPS, y un puerto serie para el robot (parámetro `--robot.port`).

## Comparativa con modelos similares

No se dispone de datos publicados (parámetros, contexto, rendimiento, licencia específica) de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible. Se incluye una comparación cualitativa de categorías equivalentes en el ecosistema LeRobot:

| Modelo | Tipo de política | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ricky97/SO101_pick_dice_in_bowl | Diffusion Policy (difusión visomotora) | 89,2 M | no disponible | sin resultados publicados | apache-2.0 | pública en Hugging Face |
| Políticas `act` de LeRobot | Action Chunking Transformer (transformer con chunking de acciones) | no disponible | no disponible | no disponible | no disponible | framework LeRobot (GitHub) |
| Otras políticas `diffusion` entrenadas con LeRobot | Diffusion Policy | no disponible | no disponible | no disponible | no disponible | Hugging Face (checkpoints de la comunidad) |
| SmolVLA y modelos VLA de LeRobot | Vision-Language-Action | no disponible | no disponible | no disponible | no disponible | no disponible |

Criterios de comparación recomendados cuando existan datos: número de episodios y fotogramas del dataset, número de grados de libertad del robot, número de cámaras, frecuencia de control (30 FPS en este caso) y tasa de éxito medida en robot real bajo condiciones controladas.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente que no se han aportado resultados de evaluación, por lo que no hay evidencia publicada de tasa de éxito ni de robustez.
- Sesgos de datos: el entrenamiento se limita a 30 episodios de una única tarea, con una disposición concreta de objeto, cuenco, iluminación y fondo. La política probablemente fallará ante cambios de posición del dado, del cuenco, de iluminación o ante objetos distractores.
- Sobreajuste a la configuración de hardware: entrenada para el robot `so_follower` con cámaras concretas (`wrist`, `agent`) y nombres de observación específicos; los nombres de cámara deben coincidir con las claves de observación usadas en el entrenamiento o la ejecución fallará.
- Riesgo de alucinación en el sentido de generación de trayectorias no válidas: como política generativa, puede producir secuencias de acción plausibles pero físicamente inadecuadas en estados poco representados en el dataset, sin ninguna señal de incertidumbre calibrada.
- Ausencia de comprensión del lenguaje: la tarea se pasa como cadena de texto fija ("Pick the dice and put it in the white bowl"); no hay generalización a instrucciones nuevas ni capacidades multilingües.
- Dependencia de la versión del framework: el entrenamiento se realizó con LeRobot 0.6.2; cambios de API en versiones posteriores pueden requerir adaptaciones en los comandos de ejecución.
- Sin cuantizaciones publicadas: no hay pesos GGUF, AWQ, GPTQ ni similares, de modo que no se puede reducir el consumo más allá del formato safetensors entregado.
- Licencia: apache-2.0 permite uso comercial y modificación con atribución y conservación del aviso de licencia; conviene citar además el método (Diffusion Policy, arXiv:2303.04137) y LeRobot según lo indicado por el autor. No se documentan restricciones adicionales.
- Caveat de producción: no se debe desplegar en un entorno físico sin barreras de seguridad, dado que una política de manipulación sin evaluación puede provocar colisiones o agarres fallidos.
- Enlaces y búsqueda web: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos eran contenido no relacionado sobre hojas de cálculo), por lo que no se añaden fuentes externas adicionales a las del propio repositorio y su documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ricky97/SO101_pick_dice_in_bowl
- Dataset de entrenamiento: https://huggingface.co/datasets/Ricky97/SO101_pick_dice_in_bowl
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ricky97/SO101_pick_dice_in_bowl
- Paper del método (Diffusion Policy): https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
