# Ricky97/SO101_push_dice_to_sticker_pose

## Resumen

SO101_push_dice_to_sticker_pose es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en Hugging Face mediante la librería LeRobot. El modelo resuelve una tarea concreta de manipulación robótica: empujar un dado hasta una pegatina ("Push the dice to the sticker"). Diffusion Policy trata el control visuomotor como un proceso generativo de difusión, de modo que en lugar de predecir una única acción por paso produce trayectorias de acción multimodo y suaves, algo especialmente útil en tareas con contacto rico como empujar objetos.

El modelo tiene aproximadamente 89,2 millones de parámetros (89.245.463 según los pesos en safetensors), ocupa unos 0,4 GB en el repositorio y se distribuye en formato safetensors con licencia Apache 2.0. Es un modelo de robótica de propósito específico, no un modelo de lenguaje: consume estado propioceptivo de 6 dimensiones y dos flujos de imagen RGB de 480x640 (cámaras de muñeca y de agente), y devuelve un vector de acción de 7 dimensiones.

Su relevancia es práctica más que de frontera: sirve como ejemplo reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento y despliegue) sobre el robot SO-101 dentro del ecosistema LeRobot. El dataset asociado contiene solo 15 episodios y 5175 fotogramas a 30 FPS, por lo que se trata de una política de un único operador para una única tarea en un entorno controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor como proceso de difusion generativo; encoder visual + red de difusion sobre acciones) |
| Parametros totales | 89.245.463 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica horizonte de observacion ni de prediccion) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No aplica (modelo de robotica); no disponible en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | so_follower |
| Camaras | wrist, agent |
| Entradas | observation.state (6,), observation.images.wrist (3, 480, 640), observation.images.agent (3, 480, 640) |
| Salidas | action (7,) |
| Tamano del repositorio | 0.4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el método Diffusion Policy (paper arXiv:2303.04137), que formula el control visuomotor como un proceso de difusión: la política aprende a generar secuencias de acciones a partir de ruido, condicionadas por las observaciones visuales y propioceptivas. Este enfoque produce trayectorias multimodales y suaves, lo que mejora el rendimiento en manipulación con contacto rico. La model card no detalla la topología interna exacta (tipo de encoder visual, backbone de la red de difusión ni número de pasos de denoising), por lo que esos detalles no están disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset Ricky97/SO101_push_dice_to_sticker_pose: 15 episodios, 5175 fotogramas a 30 FPS, una única tarea ("Push the dice to the sticker"). La configuración declarada es de 100.000 pasos de entrenamiento, batch size 32, optimizador Adam, learning rate 0.0001 y semilla 1000. No se menciona uso de RLHF, DPO ni fases de refinamiento posteriores; se trata de aprendizaje por imitación supervisado a partir de demostraciones. No hay resultados de evaluación en robot real publicados en la model card.

## Capacidades

- Generacion de trayectorias de accion de 7 dimensiones (posicion y orientacion del efector, mas pinza) para el robot SO-101 (so_follower).
- Control visuomotor a partir de dos camaras RGB: una de muñeca (wrist) y una de agente (agent), a 480x640.
- Fusión de estado propioceptivo de 6 dimensiones con observaciones visuales.
- Manipulación con contacto: la formulación de difusión permite trayectorias multimodales y suaves, adecuadas para empujar objetos.
- Ejecucion en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No tiene capacidades de generacion de texto, codigo, matematicas, vision general, audio ni modo de razonamiento.
- Multilingue: no aplica, no es un modelo de lenguaje.

## Casos de uso

- Automatizacion de una tarea de empuje en laboratorio: el modelo ejecuta de forma autónoma la tarea "Push the dice to the sticker" sobre un SO-101, útil como banco de pruebas reproducible de manipulación con contacto.
- Base para aprendizaje por imitación: sirve de punto de partida para entrenar políticas Diffusion con `lerobot-train` sobre datasets propios, cambiando `--dataset.repo_id` y `--policy.type=diffusion`.
- Evaluación de pipelines LeRobot: permite verificar de extremo a extremo la cadena de captura de datos, entrenamiento y despliegue (`lerobot-rollout`) en un robot real.
- Docencia y prototipado en robótica: 15 episodios y 0,4 GB hacen que el ejemplo sea ligero y rápido de reproducir en un curso o taller de robotica de manipulacion.
- Comparativa de metodos de politica: util como referencia de Diffusion Policy frente a alternativas del ecosistema LeRobot (por ejemplo ACT o políticas VLA) para medir estabilidad de trayectorias en tareas con contacto.
- Demostraciones controladas en un banco de trabajo: al requerir las cámaras `wrist` y `agent` con nombres exactos, encaja en montajes fijos donde la posición de cámara y mesa se mantiene constante.
- Pruebas de robustez y ajuste fino: al no haber resultados de evaluación publicados, sirve para que un equipo genere su propia tabla de éxito/fracaso y decida si conviene reentrenar con más episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no se dispone de tasas de éxito ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- Parametros: 89,2 M, con un repositorio de 0,4 GB. Los pesos en precision completa de 32 bits ocupan aproximadamente 0,36 GB; en fp16/bf16, alrededor de 0,18 GB, sin contar activaciones ni codificadores de imagen.
- VRAM estimada para inferencia: del orden de 1-2 GB incluyendo los dos flujos de imagen de 480x640 y las activaciones, aunque la model card no publica cifras exactas.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA de gama media o superior es suficiente (por ejemplo RTX 3060, RTX 4090, A100, H100). No se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, dada la escala de parametros, deberia caber con holgura en GPUs de consumo con 4 GB o mas de VRAM; la model card no especifica requisitos minimos.
- Opciones de despliegue: LeRobot con `lerobot-rollout` (con `--policy.path=Ricky97/SO101_push_dice_to_sticker_pose`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que es una politica de robotica y no un modelo de lenguaje.
- Latencia y throughput: no disponibles. El control opera a 30 FPS de captura, pero no se publica la latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101_push_dice_to_sticker_pose (este) | 89.245.463 | Diffusion Policy sobre LeRobot | No disponible | apache-2.0 | Hugging Face, 0 descargas |
| ACT (Action Chunking Transformer) | No disponible | Transformer de imitacion en LeRobot | No disponible | No disponible | Implementado en LeRobot, sin este checkpoint |
| SmolVLA | No disponible | Vision-Language-Action en LeRobot | No disponible | No disponible | Ecosistema LeRobot |
| pi0 / pi0.5 | No disponible | Vision-Language-Action | No disponible | No disponible | Publicados por terceros |

No se dispone de datos numericos de estos modelos comparables en la informacion proporcionada, por lo que la comparacion se limita al tipo de metodo y licencia. No se han publicado benchmarks que permitan ordenarlos por rendimiento.

## Limitaciones y advertencias

- Dataset muy reducido: 15 episodios y 5175 fotogramas para una unica tarea, lo que limita la generalizacion a otras posiciones de objeto, iluminacion o distractores.
- Sin resultados de evaluacion: no hay tasa de exito publicada, por lo que el rendimiento real en robot no esta verificado en la model card.
- Dependencia fuerte del montaje: las camaras deben llamarse exactamente `wrist` y `agent`, y entrenarse a 640x480 y 30 FPS; cambiar la configuracion invalida la politica.
- Especifico de un robot: declarado para `so_follower` (SO-101); no es transferible directamente a otros robots sin reentrenamiento.
- Sin capacidades de lenguaje ni de agente: no admite tool calling, instrucciones en lenguaje natural ni razonamiento multi-paso.
- Riesgo de sobreajuste al operador y entorno de demostracion: el modelo reproduce el estilo de las demostraciones grabadas, con poca variedad de escenarios.
- Sesgos: no aplica el concepto de sesgo linguistico, pero si existe un sesgo hacia las condiciones fisicas de la mesa y del operador que genero los datos.
- Alucinacion: no aplica en el sentido de lenguaje; el riesgo equivalente es generar trayectorias de accion no validas o inestables fuera de la distribucion entrenada.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar del metodo Diffusion Policy conviene revisar la licencia del paper y del codigo original antes de explotarlo en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes, sin mantenimiento declarado ni garantias de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ricky97/SO101_push_dice_to_sticker_pose
- Dataset: https://huggingface.co/datasets/Ricky97/SO101_push_dice_to_sticker_pose
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ricky97/SO101_push_dice_to_sticker_pose
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
