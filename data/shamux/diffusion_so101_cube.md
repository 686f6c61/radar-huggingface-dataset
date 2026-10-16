# shamux/diffusion_so101_cube

## Resumen
shamux/diffusion_so101_cube es una política visomotora (policy) de robótica entrenada con el framework LeRobot de HuggingFace, publicada por el usuario shamux. No es un modelo de lenguaje: se trata de una implementación de Diffusion Policy aplicada al control de un brazo robótico SO-101 en la tarea concreta "Pick up the cube and place it in the bin" (coger el cubo y depositarlo en la papelera). Emite acciones de 6 grados de libertad a partir de una observación compuesta por el estado de las articulaciones y una única cámara de muñeca. La relevancia actual radica en que materializa el patrón de imitación end-to-end con políticas generativas en hardware accesible, mostrando cómo un modelo de 262 millones de parámetros puede automatizar una tarea de manipulación con una sola cámara.

El modelo fue entrenado íntegramente con el dataset shamux/so101_cube_camera, formado por 51 episodios y 23 612 fotogramas grabados a 30 FPS, mediante 100 000 pasos de optimización con Adam y una tasa de aprendizaje de 0,0001. Diffusion Policy trata el control motor como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multimodales que destacan en escenarios de contacto rico (contact-rich manipulation), según el artículo de referencia 2303.04137.

Al tratarse de una política específica y de propósito muy acotado, no debe confundirse con un modelo fundacional reutilizable: su licencia Apache 2.0 permite uso comercial, pero su comportamiento está atado a la tarea, al número de articulaciones, a la cámara y a la disposición física para la que fue entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (politica visomotora generativa, red de difusion condicionada por observaciones) |
| Parametros totales | 262 962 942 (~263 M, dato safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot (0.6.2 para entrenamiento) |
| Robot objetivo | so_follower (SO-101) |
| Entradas | observation.state `(6,)`; observation.images.wrist `(3, 480, 640)` |
| Salidas | action `(6,)` |
| Tamano del repositorio | 1.1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |

## Arquitectura y entrenamiento
La política sigue el paradigma de Diffusion Policy (paper arXiv 2303.04137): en lugar de regresar directamente la siguiente acción, el modelo aprende a denoising una secuencia de acciones (chunk de acciones) condicionada por las observaciones RGB y el vector de estado articular. Esta formulación generativa permite representar distribuciones multimodales de acciones, algo crítico en tareas de manipulación con contacto. La observación combina un vector de estado de 6 dimensiones con una imagen de muñeca de 3x480x640, lo que implica un codificador visual para la imagen y una red de difusión para el ruido de las acciones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset shamux/so101_cube_camera (51 episodios, 23 612 fotogramas, 30 FPS, una única tarea). La configuración registrada incluye 100 000 pasos, batch size 8, optimizador Adam, learning rate 0,0001 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de post-entrenamiento por preferencias, ni se especifican innovaciones extra como decodificación especulativa o atención lineal. Tampoco se detalla la composición del dataset más allá de la tarea y el número de episodios.

## Capacidades
- Control visomotor end-to-end: genera trayectorias de 6 grados de libertad a partir de una imagen de muñeca y el estado articular.
- Ejecución de la tarea específica "Pick up the cube and place it in the bin".
- Producción de trayectorias multimodales y suaves propias de modelos generativos de difusión, adecuadas para manipulación con contacto.
- Operación orientada a action chunking (predicción de secuencias de acciones), típica de Diffusion Policy.
- Integración directa con el ecosistema LeRobot para rollout y entrenamiento mediante CLI.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso en lenguaje, capacidades multilingües, ni modos de pensamiento (thinking mode). No procesa ni genera texto.

## Casos de uso
- Demo reproducible de manipulación con SO-101: permite ejecutar la política entrenada con `lerobot-rollout` para mostrar el ciclo completo coger-colocar cubos en ferias, aulas o vídeos de presentación.
- Punto de partida para fine-tuning en tareas de pick-and-place similares: al compartirse los pesos safetensors y la configuración, un investigador puede reentrenar con un dataset propio manteniendo la columna vertebral de Diffusion Policy.
- Estudio comparativo de políticas visomotoras: sirve como referencia dentro de LeRobot para comparar Diffusion Policy frente a ACT, VQ-BeT o TDMPC en la misma tarea y robot.
- Investigación en imitation learning con pocos datos: con 51 episodios y 23 612 fotogramas es un caso útil para analizar la relación entre tamaño de dataset y calidad de la política generativa.
- Docencia en robótica basada en aprendizaje: el flujo hardware -> grabación -> entrenamiento -> rollout documentado por LeRobot convierte este modelo en material didáctico para asignaturas de robótica.
- Benchmark interno de hardware robótico: al ser un modelo acotado, permite medir latencia de inferencia y throughput de control sobre distintas GPU sin la variabilidad de modelos fundacionales.
- Base para análisis de robustez frente a cambios de iluminación, posición de objeto o distracciones, dado que la model card invita explícitamente a reportar estos factores de dificultad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que aún no se han facilitado resultados de evaluación en robot real (la tabla de tarea, ensayos, éxitos y tasa de éxito permanece vacía). No se dispone, por tanto, de cifras de tasa de éxito ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible como cifra oficial. Con 262 962 942 parámetros, en FP32 la carga de pesos ronda 1,05 GB y en FP16 unos 0,53 GB; sumando el bucle de denoising y el codificador visual, la inferencia debería caber holgadamente en GPU consumer de 8 GB o más. Esta estimación no está confirmada por el autor.
- GPU recomendadas: no indicadas en la información disponible. Entrenamiento registrado con `--policy.device=cuda`; inferencia viable en RTX 3060, RTX 4060, RTX 4090 y superiores por el reducido tamaño del modelo.
- Cabe en GPU consumer: previsiblemente sí, dado el número de parámetros; sin confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento), PyTorch como backend subyacente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. La captura del dataset y presumiblemente el bucle de control operan a 30 FPS según la configuración del dataset (23 612 fotogramas a 30 FPS).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shamux/diffusion_so101_cube | Diffusion Policy (visomotor) | 262 962 942 | state (6,) + imagen muñeca 480x640 | apache-2.0 | HuggingFace Hub |
| ACCION (Action Chunking Transformer) en LeRobot | Transformer por chunks | no disponible | state + imagenes | apache-2.0 en LeRobot | LeRobot |
| VQ-BeT | Cuantizacion vectorial de comportamiento | no disponible | state + imagenes | apache-2.0 en LeRobot | LeRobot |
| TDMPC | Modelo de mundo con planificacion | no disponible | state + imagenes | apache-2.0 en LeRobot | LeRobot |

Los modelos alternativos pertenecen al mismo ecosistema LeRobot y comparten el enfoque de aprendizaje por imitación, pero sus recuentos de parametros y resultados concretos no se detallan en la información proporcionada. La comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias
- Alcance muy restringido: el modelo está entrenado exclusivamente para la tarea "Pick up the cube and place it in the bin" con un cubo concreto; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración hardware: asume un robot `so_follower` (SO-101) con una cámara `wrist`; los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito reportada, por lo que se desconoce su fiabilidad real, su robustez frente a cambios de iluminación, posición u oclusiones.
- Riesgo de fallo en producción: al ser una política de imitación entrenada con 51 episodios, es previsible una degradación del rendimiento ante distribuciones fuera del dataset (nuevos objetos, distractores, otra robot del mismo tipo). No se han documentado sesgos específicos, aunque el dataset reducido y monótono implica un sesgo hacia las condiciones de captura.
- Alucinacion no aplica: el modelo no genera lenguaje; el riesgo equivalente es la generación de trayectorias erróneas o inseguras que pueden provocar colisiones con el entorno físico.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre citando la autoría correspondiente y conservando el aviso de licencia.
- Recomendaciones de seguridad en produccion: se debe operar con límites de par, paradas de emergencia y supervisión humana, ya que el modelo no incorpora mecanismos de seguridad explícitos.
- Idiomas: no disponible (no procesa texto).

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/shamux/diffusion_so101_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/shamux/so101_cube_camera
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shamux/so101_cube_camera
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Guía de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
