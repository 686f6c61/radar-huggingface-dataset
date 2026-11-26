# LeeJun12/smolvla_pick-two-cubes

## Resumen
SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales y estado propioceptivo. Esta ficha concreta, `LeeJun12/smolvla_pick-two-cubes`, es un fine-tuning de `lerobot/smolvla_base` sobre un dataset propio de 50 episodios y 30.000 frames para la tarea de recoger un cubo (rojo o azul) y depositarlo en una caja.

El modelo resuelve el problema de la imitacion de politicas roboticas en hardware de consumo: con 450 millones de parametros y un repositorio de 0,9 GB, es desplegable en GPUs de gama media y en robots tipo `so_follower` (SO-100/SO-101). Su relevancia radica en que demuestra el flujo completo de LeRobot: grabar datos con camaras, entrenar una politica VLA y ejecutarla en un robot real mediante `lerobot-rollout`.

La arquitectura subyacente combina un codificador visual, un modelo de lenguaje pequeno y un cabezal de acciones, segun el paper SmolVLA (arXiv:2506.01844). La licencia Apache 2.0 permite uso comercial, aunque el modelo solo ha sido validado en la tarea concreta de su dataset y no incluye evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, segun SmolVLA; codificador visual + LM + cabezal de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de imitacion, no modelo de lenguaje general) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de robotica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento
SmolVLA es un modelo VLA compacto que procesa observaciones multimodales (imagenes de camaras y estado del robot) y emite acciones de control de 6 dimensiones. La politica consume `observation.state` de forma `(6,)`, tres camaras visuales de `(3, 256, 256)` y una camara adicional `empty_camera_0` de `(3, 480, 640)`, y produce `action` de forma `(6,)`. El modelo base es `lerobot/smolvla_base`, preentrenado por Hugging Face y descrito en el paper arXiv:2506.01844.

El fine-tuning se realizo sobre el dataset `LeeJun12/pick-two-cubes_20261126_160635` con 50 episodios, 30.000 frames a 30 FPS, para dos tareas: "Pick up the red cube and put it in the box." y "Pick up the blue cube and put it in the box.". La configuracion de entrenamiento fue de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.0. No se documenta uso de RLHF/DPO ni innovaciones adicionales mas alla de las del modelo base.

## Capacidades
- Control de robot manipulador `so_follower` mediante imitacion visual: genera acciones de 6 dimensiones a partir de imagenes y estado.
- Percepcion visual multi-camara: procesa tres vistas de 256x256 y una vista de 480x640.
- Ejecucion de tareas de pick-and-place especificas: recoger cubo rojo o azul y colocarlo en una caja.
- Integracion con LeRobot: comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Despliegue en hardware de consumo gracias a su tamano compacto (450M parametros).
- No soporta tool calling, agentes multi-paso, razonamiento general ni capacidades multilingues: es una politica de robotica, no un LLM conversacional.

## Casos de uso
- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo y depositarlo en una caja, util para validar pipelines de imitacion con SO-100/SO-101 antes de escalar a tareas mas complejas.
- Prototipado rapido de politicas roboticas: sirve como plantilla para fine-tuning con datasets propios usando `lerobot-train` y el modelo base `lerobot/smolvla_base`.
- Docencia e investigacion en robotica: permite reproducir el flujo completo de LeRobot (grabacion, entrenamiento, rollout) en hardware asequible.
- Benchmark interno de manipulacion: al ser una politica pequena, se puede comparar contra otras politicas LeRobot en la misma tarea y robot para medir tasas de exito.
- Demostraciones en ferias o presentaciones: su bajo coste computacional permite ejecutarlo en un portatil con GPU consumer conectado al robot.
- Base para data augmentation: el modelo puede servir como generador de trayectorias iniciales que luego se refinan con datos reales adicionales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parametros en fp32 el peso ronda 1,8 GB, por lo que en fp16 cabria en aproximadamente 1 GB, aunque no se documenta cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en fp16; el modelo base esta disenado para hardware de consumo.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a politicas de robotica).
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS segun la tasa del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeeJun12/smolvla_pick-two-cubes | 450M | VLA (fine-tune) | no aplica | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | VLA (base) | no aplica | apache-2.0 | Hugging Face |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | variable | Politicas de imitacion | no aplica | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- Entrenado exclusivamente para dos tareas concretas ("Pick up the red cube..." y "Pick up the blue cube...") sobre un robot `so_follower`; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito medida, por lo que el rendimiento real en produccion es desconocido.
- Dataset pequeno (50 episodios, 30.000 frames): riesgo de sobreajuste a posiciones, iluminacion y condiciones del entorno de grabacion.
- Dependencia de la configuracion exacta de camaras: las claves de observacion (`camera1`, `camera2`, `camera3`, `empty_camera_0`) deben coincidir con las del entrenamiento.
- No es un modelo de lenguaje: no soporta conversacion, razonamiento, codigo ni capacidades multilingues.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si de acciones erroneas ante distribuciones visuales fuera de las vistas en entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Requiere el stack LeRobot 0.6.0 o compatible; cambios de version pueden romper la carga de la politica.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LeeJun12/smolvla_pick-two-cubes
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LeeJun12/pick-two-cubes_20261126_160635
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LeeJun12/pick-two-cubes_20261126_160635
