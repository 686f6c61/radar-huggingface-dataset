# jhd0313/smolvla_move-box-grab-cube

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Este repositorio concreto, `jhd0313/smolvla_move-box-grab-cube`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario jhd0313 para dos tareas roboticas especificas: mover una caja y agarrar un cubo negro. El modelo resuelve el problema de mapear observaciones visuales y de estado del robot a acciones motoras de bajo nivel, siguiendo el paradigma de imitation learning.

La relevancia de SmolVLA radica en que demuestra que un VLA puede ejecutarse en hardware de consumo manteniendo un rendimiento competitivo, algo poco habitual en modelos de esta categoria, que suelen requerir GPUs de datacenter. Con aproximadamente 450 millones de parametros y un tamano de repositorio de 0,9 GB, es un modelo ligero pensado para desplegarse directamente sobre el robot.

Este ajuste concreto esta entrenado sobre el dataset `jhd0313/move-box-grab-cube`, compuesto por 50 episodios y 11.884 frames a 30 FPS, capturados con un robot `so_follower` y dos camaras (overhead y wrist). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, segun el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Camaras | overhead, wrist |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3,256,256), observation.images.empty_camera_0 (3,480,640) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, un diseno de vision-language-action compacto que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones. La model card no detalla la composicion interna exacta ni el numero de tokens de preentrenamiento del modelo base; esa informacion debe consultarse en el paper original. El ajuste fino se realiza sobre `lerobot/smolvla_base`, que actua como inicializacion.

El entrenamiento de este repositorio concreto se ejecuto con LeRobot 0.6.0 durante 5.000 pasos, con batch size de 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. El dataset de ajuste contiene 50 episodios y 11.884 frames a 30 FPS, con dos tareas anotadas ("Move the box" y "Grab the black cube"). No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento por preferencias; se trata de imitation learning supervisado sobre demostraciones. La model card no menciona innovaciones adicionales como decodificacion especulativa o atencion lineal para este ajuste.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones a partir de observaciones visuales y de estado del robot.
- Percepcion visual multi-camara: procesa tres vistas a 256x256 y una vista adicional a 480x640.
- Ejecucion de tareas de manipulacion de corto horizonte: mover una caja y agarrar un cubo negro.
- Control de un robot tipo `so_follower` (SO-100/SO-101 del ecosistema LeRobot).
- Inferencia en hardware de consumo, segun la descripcion del modelo base.
- Integracion nativa con el pipeline de LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual ni procesamiento de audio.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la secuencia de agarre del cubo negro y su traslado, adecuado para prototipos de investigacion en imitation learning con un robot SO-100.
- Reubicacion de objetos en celdas de fabricacion: la tarea "Move the box" permite integrar el modelo en un banco de pruebas para mover contenedores entre posiciones fijas.
- Docencia y formacion en robotica: al ser un modelo de 450 M de parametros y 0,9 GB, se puede desplegar en un portatil con GPU de consumo para demostrar el ciclo completo de grabacion, entrenamiento y despliegue con LeRobot.
- Base para nuevos ajustes finos: el modelo sirve como punto de partida para entrenar politicas sobre datasets propios con `lerobot-train` y `--policy.path=lerobot/smolvla_base`.
- Validacion de pipelines de imitation learning: util para comparar configuraciones de entrenamiento (pasos, batch size, learning rate) sobre un dataset pequeno y reproducible de 50 episodios.
- Pruebas de robustez visual: al usar dos camaras con vistas distintas (overhead y wrist), permite evaluar como afectan cambios de iluminacion o posicion de camara al exito de la politica.
- Automatizacion de tareas repetitivas de baja destreza: recogida y colocacion de piezas ligeras en entornos controlados donde no se requiere precision sub-milimetrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica y que la tabla de evaluacion en robot real esta pendiente de rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros en safetensors (0,9 GB de repositorio), la huella en FP32 ronda 1,8 GB y en FP16/BF16 unos 0,9 GB, mas el overhead de las imagenes de entrada.
- GPU recomendadas: el modelo base se describe como desplegable en hardware de consumo; una RTX 4090, RTX 3090 o superior ofrece margen amplio. Para entornos de investigacion con varias camaras, una A100 o H100 no es necesaria pero acelera el entrenamiento.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM; no se especifica un minimo oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA via `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de robotica.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS en el dataset de entrenamiento, pero la model card no reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jhd0313/smolvla_move-box-grab-cube | 450 M | VLA (fine-tune) | no disponible | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | VLA (base) | no disponible | no disponible en la informacion | Hugging Face |
| Otros VLA de gran escala (p. ej. OpenVLA) | no disponible en la informacion | VLA | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y licencia; para alternativas de la misma categoria debe consultarse el paper de SmolVLA y el ecosistema LeRobot.

## Limitaciones y advertencias

- Entrenado exclusivamente para dos tareas ("Move the box" y "Grab the black cube") sobre un unico robot `so_follower`; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 50 episodios y 11.884 frames, lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de posicion, iluminacion o distractores.
- Sin resultados de evaluacion publicados: no hay tasa de exito medida en robot real, por lo que el rendimiento real es desconocido.
- Dependencia de la configuracion exacta de camaras: los nombres e indices deben coincidir con las claves de observacion del entrenamiento (`camera1`, `camera2`, `camera3`, `empty_camera_0`), y una de las entradas tiene forma 480x640 frente a 256x256 de las demas.
- Riesgo de fallo silencioso en produccion: al ser una politica de imitation learning, puede reproducir comportamientos incorrectos de las demostraciones o degradarse fuera de la distribucion de entrenamiento.
- Sesgos: no documentados, pero al entrenarse con un unico operador y entorno, hereda sus sesgos de trayectoria y estilo de manipulacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye tal cual.
- No apto para tareas de seguridad critica sin validacion extensa y mecanismos de parada de emergencia externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhd0313/smolvla_move-box-grab-cube
- Dataset de entrenamiento: https://huggingface.co/datasets/jhd0313/move-box-grab-cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jhd0313/move-box-grab-cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
