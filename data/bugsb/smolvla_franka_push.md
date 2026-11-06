# BugsB/smolvla_franka_push

## Resumen

BugsB/smolvla_franka_push es un modelo de vision-lenguaje-accion (VLA) especializado en robótica, publicado en Hugging Face por el usuario BugsB. Se trata de un fine-tuning del modelo base lerobot/smolvla_base sobre un conjunto de datos propio de demostraciones reales de un robot Franka (tipo `fr3`), orientado a una única tarea de manipulación: empujar un cubo rojo hasta una zona objetivo verde. El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, un VLA compacto disenado para ejecutarse en hardware de consumo.

El modelo parte de la premisa de SmolVLA: conseguir un rendimiento competitivo en control robótico con un coste computacional reducido. Con aproximadamente 450 millones de parametros (450.046.176 segun los pesos en safetensors), procesa observaciones multimodales (estado del robot y hasta tres camaras) y produce acciones de control de 7 dimensiones. Es relevante como ejemplo practico de como adaptar un VLA preentrenado a una tarea concreta mediante imitation learning con LeRobot, en este caso con solo 51 episodios y 16.164 frames de entrenamiento.

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face. No hay resultados de evaluacion reportados por el autor, por lo que muchas afirmaciones de rendimiento deben considerarse no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto; detalles de capas y atencion no disponibles) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de lerobot/smolvla_base, un VLA compacto presentado en el paper SmolVLA (arXiv:2506.01844). La arquitectura combina un codificador visual y de lenguaje con un modulo de accion que genera comandos de control a partir de observaciones. La model card no detalla el numero de capas, el mecanismo de atencion ni el esquema exacto de fusion multimodal; solo se indica que es un modelo VLA eficiente pensado para hardware de consumo.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset BugsB/franka_push: 51 episodios, 16.164 frames a 10 FPS, con una unica tarea ("Push the red cube into the green goal area."). La configuracion fue de 3.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se indica si hubo RLHF, DPO ni otras fases de alineamiento; se trata de imitation learning supervisado sobre demostraciones. Las entradas son `observation.state` de forma (6,), tres imagenes de (3, 256, 256) (`camera1`, `camera2`, `camera3`) y la salida es una accion de forma (7,).

## Capacidades

- Control robótico de manipulacion: genera acciones de 7 dimensiones para el robot Franka `fr3` a partir de estado y vision.
- Percepcion visual multimodal: consume hasta tres camaras RGB a 256x256.
- Ejecucion de una tarea especifica de empuje de objetos guiada por instruccion en lenguaje natural.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento mediante CLI (`lerobot-rollout`, `lerobot-train`).
- Fine-tuning a partir de un VLA preentrenado con pocos datos (51 episodios).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Thinking mode, vision general, audio: no disponibles; la vision esta limitada a la entrada de politica.

## Casos de uso

- Manipulacion robotica de laboratorio: ejecutar la tarea de empujar un cubo a una zona objetivo en un Franka fr3, usando el comando de rollout de LeRobot con la instruccion de la tarea.
- Prototipado de politicas VLA: servir como punto de partida para experimentar con fine-tuning de SmolVLA sobre nuevos datasets de imitation learning.
- Investigacion en imitation learning: analizar el efecto de pocos episodios (51) y pasos de entrenamiento (3.000) en el rendimiento de un VLA compacto.
- Docencia y demostraciones: ilustrar el flujo completo de LeRobot (grabacion de datos, entrenamiento, rollout) en un caso reproducible de bajo coste.
- Benchmarking interno de hardware de consumo: evaluar la viabilidad de ejecutar un VLA de 450M parametros en GPUs de gama consumer.
- Base para tareas de pick-and-place o empuje en entornos controlados: reentrenar con un dataset propio manteniendo la arquitectura y el pipeline de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450M parametros, en FP32 los pesos ocupan aproximadamente 1,8 GB y en FP16/BF16 unos 0,9 GB, sin contar activaciones ni buffers de imagen.
- GPU recomendadas: no especificadas por el autor; SmolVLA se presenta como desplegable en hardware de consumo.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo, aunque no hay confirmacion del autor ni requisitos minimos publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA via `--policy.device=cuda` en entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BugsB/smolvla_franka_push | 450.046.176 | no disponible | Empuje de cubo en Franka fr3 | apache-2.0 | Hugging Face (30 descargas) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base preentrenado | no disponible | Hugging Face |
| Otros VLA comparables (p. ej. OpenVLA, pi0) | no disponible en la informacion | no disponible | Control robotico general | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con los datos proporcionados; solo se confirma que este modelo es un fine-tuning de lerobot/smolvla_base.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea y un unico tipo de robot (`fr3`); no es un VLA de proposito general.
- Sin resultados de evaluacion publicados: el rendimiento real en la tarea no esta verificado.
- Entrenado con solo 51 episodios y 3.000 pasos, lo que limita la robustez ante variaciones de posicion, iluminacion o distractores.
- Las camaras de entrada deben coincidir con los nombres y la configuracion de observacion del entrenamiento (`camera1`, `camera2`, `camera3` a 256x256); un desajuste puede degradar el comportamiento.
- Idiomas soportados no disponibles; la instruccion de tarea esta en ingles.
- Riesgo de alucinacion o acciones incorrectas fuera de la distribucion de entrenamiento, comun en politicas de imitation learning.
- Sesgos conocidos: no documentados por el autor.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluacion de seguridad para despliegue en produccion.
- El repo ocupa 7,9 GB, lo que puede incluir checkpoints y artefactos adicionales mas alla de los pesos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BugsB/smolvla_franka_push
- Arbol de archivos: https://huggingface.co/BugsB/smolvla_franka_push/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/BugsB/franka_push
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=BugsB/franka_push
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
