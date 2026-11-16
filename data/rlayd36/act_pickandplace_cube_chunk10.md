# Rlayd36/act_pickandplace_cube_chunk10

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error compuesto en tareas de manipulacion robotica. Este repositorio concreto, `Rlayd36/act_pickandplace_cube_chunk10`, es una politica entrenada con LeRobot sobre un dataset propio de 60 episodios teleoperados para la tarea "Red block pickup and place" (recogida y colocacion de un bloque rojo) con un robot `so_follower`.

El modelo consume el estado articular de 6 dimensiones y dos flujos de imagen RGB de 480x640 (camara cenital y camara de muneca), y produce un vector de accion de 6 dimensiones. Con 51.576.454 parametros y un repo de 0.2 GB, es una politica compacta orientada a inferencia en tiempo real a 30 FPS, no un modelo de lenguaje general.

Es relevante como ejemplo reproducible de un pipeline completo de imitacion robotica con LeRobot 0.6.0: dataset publico, configuracion de entrenamiento documentada (100.000 pasos, batch 8, AdamW, lr 1e-5) y comandos de rollout listos para ejecutar. No obstante, es un artefacto de autor individual, sin evaluacion publicada y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.576.454 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control; ventana de observacion de un paso con historial de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT sigue el diseno del paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La politica combina un backbone visual (encoder tipo ResNet sobre las dos camaras) con un transformer encoder-decoder que, condicionado por el estado del robot y las imagenes, predice un chunk de acciones futuras en lugar de una sola accion por paso. Esta prediccion por chunks mitiga el problema de error compuesto de las politicas de imitacion paso a paso y suaviza las discontinuidades en la ejecucion. El nombre del repositorio (`chunk10`) sugiere un tamano de chunk de 10 acciones, aunque este dato no se explicita en la model card.

El entrenamiento se realizo con LeRobot 0.6.0 sobre 60 episodios y 32.476 frames a 30 FPS del dataset `Rlayd36/pick-cube_20261113_161307`, con 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composicion del dataset mas alla de la tarea unica, ni uso de RLHF/DPO (no aplica en imitacion supervisada), ni aumentos de datos, ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control robotico de manipulacion: genera comandos de accion de 6 dimensiones para un robot `so_follower` a partir de estado articular e imagenes.
- Percepcion visual multimodal: procesa simultaneamente dos vistas RGB de 480x640 (cenital y de muneca).
- Aprendizaje por imitacion: reproduce la politica demostrada en teleoperacion para la tarea "Red block pickup and place".
- Prediccion por chunks de acciones: emite secuencias cortas de acciones que se ejecutan de forma abierta entre inferencias.
- Inferencia en tiempo real: disenado para ejecutarse a 30 FPS en hardware consumer con GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Recogida y colocacion de objetos en linea de montaje: la politica ejecuta la tarea de pick-and-place de un bloque rojo sobre un `so_follower`, adecuada para prototipos de automatizacion de bajo coste con camara cenital y de muneca.
- Base para fine-tuning en tareas similares: al estar entrenada con LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio de otra tarea de manipulacion, reutilizando la configuracion documentada.
- Banco de pruebas de imitacion robotica: sirve para validar el pipeline completo (grabacion, entrenamiento, rollout) antes de invertir en datasets mayores.
- Educacion e investigacion: ejemplo reproducible de ACT con hiperparametros y comandos de ejecucion publicos, util en cursos de robotica y aprendizaje por imitacion.
- Evaluacion de robustez visual: al depender de dos camaras, permite estudiar como afectan cambios de iluminacion, oclusiones o posiciones del objeto al exito de la politica.
- Despliegue en robot de bajo coste: el tamano de 0.2 GB y 51,6 M de parametros permiten ejecutarlo en una GPU consumer o incluso en CPU para pruebas no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (51,6 M de parametros, ~0,2 GB en fp32) se estima un consumo bajo, inferior a 2 GB incluyendo buffers de imagen, aunque es una estimacion, no un dato del autor.
- GPU recomendadas: cualquier GPU con CUDA compatible con PyTorch; el autor entreno con `--policy.device=cuda` sin especificar modelo de GPU.
- GPU consumer: previsiblemente cabe en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (comando documentado en la model card); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles; el dataset y las camaras operan a 30 FPS, lo que fija un objetivo de inferencia de 33 ms por paso, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rlayd36/act_pickandplace_cube_chunk10` | 51,6 M | ACT (imitacion) | estado 6D + 2 camaras 480x640 | apache-2.0 | Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible en esta ficha | ACT (imitacion) | bimanual de bajo coste | no disponible | paper y codigo de referencia |
| Otras politicas LeRobot (p. ej. Diffusion Policy, pi0) | no disponible en esta ficha | imitacion / VLA | variable | variable | Hugging Face |

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasa de exito medida en robot real, por lo que su rendimiento efectivo es desconocido.
- Dataset muy reducido y de una sola tarea: 60 episodios y 32.476 frames para "Red block pickup and place"; la politica probablemente no generaliza a otros objetos, posiciones o entornos.
- Dependencia de configuracion exacta: requiere robot `so_follower`, dos camaras con nombres `overhead` y `wrist`, y resolucion 480x640 a 30 FPS; cualquier desviacion puede degradar el comportamiento.
- Sobreajuste plausible: 100.000 pasos con batch 8 sobre 60 episodios sugiere riesgo de memorizacion de las trayectorias demostradas.
- Sin soporte linguistico ni de agentes: no es un modelo de texto y no debe evaluarse con metricas de LLM.
- Riesgo de alucinacion en el sentido de acciones no validas: al ser una politica de imitacion, puede generar comandos fuera de rango ante observaciones fuera de distribucion; se recomienda limitar velocidades y usar paradas de seguridad.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Artefacto de autor individual con 0 descargas y 0 likes: sin validacion por parte de la comunidad en el momento de redactar esta ficha.
- Idiomas: no aplica; el campo de idiomas figura como no disponible en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rlayd36/act_pickandplace_cube_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/Rlayd36/pick-cube_20261113_161307
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rlayd36/pick-cube_20261113_161307
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
