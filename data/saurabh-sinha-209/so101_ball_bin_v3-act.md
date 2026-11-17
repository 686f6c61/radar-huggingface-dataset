# Saurabh-sinha-209/so101_ball_bin_v3-act

## Resumen

so101_ball_bin_v3-act es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado por Saurabh-sinha-209 y distribuido a través del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de dos cámaras y del estado articular del robot, predice secuencias cortas de acciones para brazos robóticos. El modelo resuelve una tarea concreta de manipulación: recoger una pelota verde con pinchos y depositarla en un contenedor blanco.

La arquitectura ACT se basa en un transformer que predice *chunks* de acciones (varios pasos futuros de una vez) en lugar de un único paso, lo que reduce el error de acumulación y suaviza el comportamiento. El modelo tiene 51.617.414 parámetros (dato real de los pesos en safetensors), consume observaciones de estado de 6 dimensiones y dos imágenes RGB de 240x320 píxeles, y produce acciones de 6 dimensiones. El repositorio ocupa 3,7 GB, principalmente por los checkpoints y los pesos.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) sobre el robot SO-101. No es un modelo generalista ni apto para tareas distintas a la entrenada, y el autor no ha publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo visuomotor, sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras, `bench` y `wrist`, a 240x320) con un transformer que modela la secuencia de estados y genera un chunk de acciones futuras. La predicción por chunks mitiga el sesgo de acumulación de errores típico de los controladores paso a paso y produce trayectorias más suaves. El modelo es determinista en su configuración de despliegue y no incorpora RLHF ni DPO, ya que no es un modelo generativo de texto.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `Saurabh-sinha-209/so101_ball_bin_v3`: 81 episodios, 43.337 frames a 30 FPS, con la tarea "pick up the green spiky ball and place it in the white bin". La configuración fue de 30.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan aumentos de datos, composición del dataset más allá de los episodios ni innovaciones adicionales sobre el ACT canónico.

## Capacidades

- Control visuomotor de un brazo robótico SO-101 (`so101_follower`) con 6 grados de libertad en la acción.
- Percepción multimodal: dos cámaras RGB (`bench` y `wrist`) más estado articular de 6 dimensiones.
- Predicción de chunks de acciones para ejecución suave y reducción de errores acumulados.
- Ejecución de una única tarea de manipulación: recoger una pelota verde con pinchos y colocarla en un contenedor blanco.
- Despliegue mediante `lerobot-rollout` con estrategia base y duración configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline de aprendizaje por imitación: sirve como ejemplo completo de grabación de datos con LeRobot, entrenamiento ACT y despliegue en un SO-101, útil para equipos que quieren validar su cadena de herramientas antes de escalar a tareas propias.
- Benchmark interno de control visuomotor: al ser una tarea sencilla y bien delimitada (pelota a contenedor), permite comparar variantes de ACT, cambios de hiperparámetros o configuraciones de cámara con una referencia reproducible.
- Docencia y formación en robótica: el modelo y su dataset (81 episodios, 43.337 frames) constituyen un material didáctico para explicar ACT, el formato LeRobot y el flujo de teleoperación.
- Pruebas de integración de hardware SO-101: validar calibración, puertos y sincronización de cámaras antes de entrenar políticas propias, usando esta política como smoke test.
- Prototipado de pick-and-place en entornos controlados: la tarea de recogida y depósito es representativa de operaciones de alimentación de piezas en líneas de montaje, aunque el modelo solo generaliza a la tarea entrenada.
- Investigación en robustez visual: evaluar cómo afectan cambios de iluminación, posición del objeto o distracciones a una política ACT entrenada con datos limitados, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real (`No evaluation results have been provided for this policy yet`), por lo que no se dispone de tasas de éxito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y dos flujos de imagen de 240x320, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publican cifras medidas.
- GPU recomendadas: no disponibles en la información proporcionada; el comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- GPU de consumo: por el tamaño del modelo, es plausible que quepa en tarjetas consumer, pero no hay confirmación oficial ni requisitos mínimos documentados.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) y entrenamiento con `lerobot-train`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución depende del robot SO-101, de las cámaras OpenCV a 30 FPS y de la duración configurada en `--duration`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_ball_bin_v3-act | 51,6 M | no aplica | Pick-and-place de pelota en contenedor | apache-2.0 | Hugging Face, 25 descargas, 0 likes |
| Otras políticas ACT de LeRobot | no disponible | no aplica | Tareas de manipulación diversas | apache-2.0 (habitual) | Hub de Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación visuomotora | no disponible | Hub de Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo ejecuta la tarea para la que fue entrenado; no generaliza a otros objetos, contenedores ni instrucciones.
- No hay evaluación en robot real publicada: se desconoce la tasa de éxito, la robustez ante cambios de iluminación o posición, y el comportamiento ante distracciones.
- El dataset es pequeño (81 episodios, 43.337 frames) y de un único operador; es probable un sesgo hacia las condiciones de grabación.
- Riesgo de sobreajuste a la configuración de cámaras (`bench` y `wrist`) y a la escena concreta; los nombres e índices de cámara deben coincidir con los de entrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni multilingües, y no admite tool calling ni agentes.
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad sobre el despliegue físico y la seguridad del robot recae en el integrador.
- Al ser una política de imitación, puede reproducir comportamientos erróneos presentes en las demostraciones de teleoperación.
- No se documentan sesgos demográficos ni de otro tipo, pero tampoco se han auditado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saurabh-sinha-209/so101_ball_bin_v3-act
- Dataset de entrenamiento: https://huggingface.co/datasets/Saurabh-sinha-209/so101_ball_bin_v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Saurabh-sinha-209/so101_ball_bin_v3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
