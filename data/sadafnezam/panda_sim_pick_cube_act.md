# sadafnezam/panda_sim_pick_cube_act

## Resumen

`panda_sim_pick_cube_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. en 2023 (arXiv:2304.13705). El modelo lo ha entrenado y subido a Hugging Face el usuario `sadafnezam` utilizando LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales y simulados. La tarea concreta es "PandaPickCubeKeyboard-v0", un escenario de simulación en el que un brazo Franka Panda debe coger un cubo.

A diferencia de los modelos de lenguaje, no se trata de un transformer generativo de texto, sino de una política visomotora que consume dos imágenes de cámara (frontal y de muñeca) de 128x128 píxeles y un vector de estado de 18 dimensiones, y produce una acción de 4 dimensiones. El modelo tiene 51.678.852 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para ejecutarse en hardware modesto.

Su relevancia es fundamentalmente didáctica y de referencia: es un ejemplo mínimo y reproducible de entrenamiento con LeRobot sobre un dataset pequeño (30 episodios, 641 fotogramas a 30 FPS). No se han publicado resultados de evaluación ni una licencia explícita, por lo que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visomotora de imitación |
| Parametros totales | 51.678.852 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política por pasos, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador visual para las imágenes de las cámaras con un transformer que modela la secuencia de estados y acciones; el modelo consume `observation.images.front` y `observation.images.wrist` (ambas de forma `(3, 128, 128)`) junto con `observation.state` de forma `(18,)`, y emite una acción de forma `(4,)`.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `sadafnezam/panda_sim_pick_cube_human`, compuesto por 30 episodios y 641 fotogramas a 30 FPS de la tarea "PandaPickCubeKeyboard-v0". La configuración fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos adicionales; se trata de aprendizaje supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones de 4 dimensiones a partir de dos vistas de cámara y del estado del robot.
- Predicción de action chunks: emite secuencias cortas de acciones para mejorar la estabilidad frente a políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- Tarea específica: coger un cubo en simulación con un Franka Panda ("PandaPickCubeKeyboard-v0").
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: sirve como punto de partida para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) con un coste computacional mínimo.
- Docencia y formación: permite ilustrar el funcionamiento de ACT y del aprendizaje por imitación con un caso concreto y reproducible en simulación.
- Benchmark interno de infraestructura: al ser ligero (0,2 GB, ~51,7 M de parámetros), es útil para probar entornos de inferencia robótica y flujos de CI antes de escalar a políticas mayores.
- Prototipado de tareas pick-and-place: la política puede adaptarse a variantes de la tarea de coger un cubo cambiando el dataset de entrenamiento y manteniendo la configuración de ACT.
- Comparación de métodos de imitación: sirve como línea base frente a otras políticas (p. ej., Diffusion Policy) en la misma tarea de simulación.
- Generación de datos sintéticos de evaluación: al ejecutarse en simulación, permite recoger trayectorias y analizar el comportamiento de la política sin riesgo físico.
- Integración en pipelines de investigación: su formato safetensors y su compatibilidad con LeRobot facilitan su carga programática en scripts de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB en FP32 para ~51,7 M de parámetros; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con CUDA es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama media son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna; también es viable en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del hardware, de la frecuencia de control del robot y del bucle de inferencia de LeRobot.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sadafnezam/panda_sim_pick_cube_act` | ACT (LeRobot) | 51.678.852 | no aplica | no disponible | Hugging Face |
| Diffusion Policy (referencia metodológica) | Política de imitación basada en difusión | no disponible | no aplica | según implementación | Papers y repos públicos |
| Otras políticas ACT en LeRobot Hub | ACT (LeRobot) | variable | no aplica | variable | Hugging Face |

La comparación con modelos de lenguaje no es pertinente. Frente a Diffusion Policy, ACT suele ser más ligero y rápido de entrenar, mientras que Diffusion Policy ha mostrado mejor desempeño en algunas tareas multimodales; no se dispone de datos comparativos concretos para esta política en particular.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política.
- Dataset muy pequeño (30 episodios, 641 fotogramas): alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación o distractores distintos.
- Entrenada en simulación ("PandaPickCubeKeyboard-v0"): no hay evidencia de transferencia a un robot real ni de robustez ante variaciones del entorno.
- Licencia no especificada: no está claro si se permite uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- Sin soporte de lenguaje natural, tool calling ni agentes: no es adecuada para tareas conversacionales o de razonamiento.
- Dependencia de la configuración exacta de cámaras y del vector de estado de 18 dimensiones; cambios en la morfología del robot o en la disposición de las cámaras invalidan la política.
- Riesgo de comportamiento errático fuera de la distribución de entrenamiento, típico de las políticas de imitación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadafnezam/panda_sim_pick_cube_act
- Dataset de entrenamiento: https://huggingface.co/datasets/sadafnezam/panda_sim_pick_cube_human
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sadafnezam/panda_sim_pick_cube_human
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
