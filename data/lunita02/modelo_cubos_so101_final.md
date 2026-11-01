# Lunita02/modelo_cubos_so101_final

## Resumen

`Lunita02/modelo_cubos_so101_final` es una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular y dos cámaras de un robot `so_follower` (configuración SO-101 de LeRobot) y emite comandos de acción de 6 dimensiones. El problema que resuelve es la manipulación robótica de precisión en tareas de apilado o clasificación de cubos a partir de demostraciones teleoperadas.

El modelo tiene 51.668.614 parámetros en formato safetensors (aproximadamente 0,2 GB de repositorio) y se entrenó sobre el dataset `Lunita02/Cubos_300`, compuesto por 300 episodios y 238.889 fotogramas a 30 FPS. La tarea declarada en la model card está vacía (`Task(s): ""`), lo que limita la trazabilidad del propósito exacto del entrenamiento, aunque el nombre del repositorio sugiere manipulación de cubos.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para robótica de bajo coste, con un checkpoint listo para desplegar mediante `lerobot-rollout` en hardware SO-101. La licencia Apache-2.0 facilita su reutilización comercial, y el tamaño reducido permite inferencia en tiempo real en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política transformer de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por paso, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.cam1` (3, 480, 640), `observation.images.cam2` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `cam1`, `cam2` |
| Dataset de entrenamiento | `Lunita02/Cubos_300` (300 episodios, 238.889 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 300.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Descargas en el Hub | 95 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de horizonte largo. La política combina un codificador visual (procesa dos flujos de imagen de 480x640 a 30 FPS), un codificador del estado propioceptivo de 6 dimensiones y un transformer que genera secuencias de acciones de 6 grados de libertad. El paper de referencia es arXiv:2304.13705 (Zhao et al., 2023).

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, batch de 8, AdamW con learning rate 1e-05 y semilla 1000, sobre 300 episodios teleoperados (238.889 fotogramas). No se documentan aumentos de datos, composición del dataset más allá del recuento, ni fases de RLHF o DPO, que no aplican a este paradigma. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; el método se limita a la formulación estándar de ACT.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (`so_follower`) con 6 dimensiones de acción.
- Fusión de dos cámaras RGB (480x640, 30 FPS) con el estado articular para generar comandos.
- Predicción de chunks de acción, lo que aporta suavidad y robustez frente a errores acumulados.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Ejecución en tiempo real mediante `lerobot-rollout` con la estrategia `base`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual.
- No tiene capacidades multilingües, de visión general, audio ni modo thinking.

## Casos de uso

- Manipulación de cubos en laboratorio: el modelo recoge y recoloca cubos sobre una mesa con el brazo SO-101, usando las dos cámaras para localizar objetos y el estado articular para el control fino. Es adecuado por su entrenamiento específico sobre 300 episodios de esa tarea.
- Reproducción de una tarea teleoperada en producción de bajo volumen: se despliega con `lerobot-rollout --strategy.type=base` para ejecutar la política durante un tiempo acotado (`--duration`) en una celda de trabajo.
- Banco de pruebas para investigación en imitación: sirve como referencia de un pipeline ACT completo (grabación, entrenamiento, despliegue) para comparar variantes de arquitectura o de datos.
- Reentrenamiento con nuevos objetos: el checkpoint puede servir de inicialización o de línea base al ejecutar `lerobot-train --policy.type=act` sobre un dataset propio con la misma configuración de robot y cámaras.
- Automatización de tareas de pick-and-place en educación y prototipado: el coste del hardware SO-101 y la licencia Apache-2.0 permiten montar réplicas en aulas o laboratorios.
- Validación de calibración y hardware: al requerir que los nombres de cámara (`cam1`, `cam2`) y el puerto del robot coincidan con los del entrenamiento, el modelo funciona como prueba de integración del entorno LeRobot antes de entrenar políticas nuevas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», sin tabla de tareas, ensayos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors (0,2 GB), la política cabe holgadamente en cualquier GPU con 2-4 GB de VRAM, incluidas GTX 1650 o RTX 3050.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para entrenamiento y para ejecución con margen; cualquier GPU consumer reciente sirve para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU NVIDIA con soporte CUDA; también es viable en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`), `lerobot-train` para reentrenamiento; integración nativa con LeRobot 0.6.1. No se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El modelo debe operar a 30 FPS para igualar la frecuencia del dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Lunita02/modelo_cubos_so101_final` (ACT) | 51,7 M | 2 cámaras 480x640 + estado (6,) | Manipulación SO-101 | Apache-2.0 | HuggingFace Hub, 95 descargas |
| Políticas ACT genéricas de LeRobot | no disponible | configuración variable | Imitación robótica | Apache-2.0 (LeRobot) | Hub y documentación LeRobot |
| Diffusion Policy (referencia del ecosistema) | no disponible | imágenes + estado | Imitación robótica | según implementación | Repositorios de investigación |
| VLA generalistas (p. ej., familias tipo RT/OpenVLA) | no disponible en esta ficha | instrucciones en lenguaje + visión | Control robótico generalista | variable | no disponible |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados de este checkpoint ni datos de rendimiento de los modelos comparables en la información disponible.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Tarea no declarada: el campo `Task(s)` de la model card está vacío, lo que impide verificar el propósito exacto y complica la reproducibilidad.
- Dependencia estricta del hardware: solo funciona con robot `so_follower` y cámaras `cam1`/`cam2` en la configuración exacta de entrenamiento; cambios de cámara, iluminación, posición de objetos o robot degradan el rendimiento.
- Sesgo de dominio: entrenado sobre 300 episodios de un único entorno; no generaliza a otros objetos, colores o distribuciones espaciales sin reentrenamiento.
- Riesgo de alucinación en el sentido de acciones erróneas: al ser una política de imitación, puede generar comandos inseguros fuera de la distribución de entrenamiento; requiere parada de emergencia y límites de seguridad en el robot.
- Sin capacidades lingüísticas ni de razonamiento: no es adecuado para tareas de texto, código o agentes conversacionales.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna; conviene citar el paper de ACT y LeRobot según la model card.
- Sin datos de cuantización ni de latencia: no se puede planificar el despliegue en tiempo real a 30 FPS sin mediciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lunita02/modelo_cubos_so101_final
- Dataset de entrenamiento: https://huggingface.co/datasets/Lunita02/Cubos_300
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Lunita02/Cubos_300
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
