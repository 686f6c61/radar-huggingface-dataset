# HyeonseokE/smolvla_extract_cube_cap_1000_10fps

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto desarrollado por Hugging Face, disenado para control robotico por imitacion con coste computacional reducido y despliegue en hardware de consumo. Esta ficha describe un fine-tuning especifico realizado por HyeonseokE sobre el modelo base `lerobot/smolvla_base`, entrenado con el framework LeRobot para la tarea de extraer un cubo de un bolsillo y colocarlo sobre un marcador objetivo.

El modelo cuenta con 450.046.176 parametros y ha sido entrenado sobre 100 episodios (31.575 frames a 10 FPS) del dataset `HyeonseokE/extract_cube_cap_10fps`, utilizando el robot SO-101 follower con camaras superior y de muneca izquierda. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en que demuestra el fine-tuning de SmolVLA para una tarea de manipulacion concreta con un dataset reducido, siguiendo el flujo de trabajo estandar de LeRobot. Al estar basado en SmolVLA, hereda la eficiencia del modelo base, que segun el paper arxiv 2506.01844 alcanza rendimiento competitivo con costes computacionales reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basado en SmolVLM con cabeza de accion por difusion) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un backbone de vision-lenguaje (basado en SmolVLM) con una cabeza de accion por difusion, segun se describe en el paper arxiv 2506.01844. El modelo procesa observaciones multimodales (estado del robot y multiples camaras) y genera acciones de control continuo. En este fine-tuning, las entradas son el estado del robot (6 dimensiones) y tres imagenes de camara a 256x256, mientras que las salidas son acciones de 6 dimensiones.

El entrenamiento parte de `lerobot/smolvla_base` y se realiza con LeRobot 0.5.1 durante 24.668 pasos, con batch size 64, optimizador AdamW y learning rate 0,0001. El dataset contiene 100 episodios de la tarea "Extract the cube from the pocket and place it on the target marker", con 31.575 frames a 10 FPS. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un fine-tuning supervisado por imitacion.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 grados de libertad para el robot SO-101 follower.
- Percepcion multimodal: procesa estado del robot (6 dims) y tres camaras RGB a 256x256.
- Tarea especifica: extraer un cubo de un bolsillo y colocarlo sobre un marcador objetivo.
- Integracion con LeRobot: compatible con el flujo completo de entrenamiento, evaluacion y despliegue de LeRobot.
- Eficiencia computacional: disenado para ejecutarse en hardware de consumo, segun el paper de SmolVLA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de texto general, al tratarse de un modelo de politica robotica.

## Casos de uso

- Manipulacion robotica pick-and-place: el modelo ejecuta la tarea de extraer un objeto de un contenedor y colocarlo en una posicion objetivo, como demuestra su entrenamiento especifico.
- Prototipado rapido de politicas robotica: al entrenarse con solo 100 episodios, sirve como referencia para evaluar la viabilidad de SmolVLA en nuevas tareas con datasets pequenos.
- Investigacion en imitation learning: permite estudiar el comportamiento de SmolVLA fine-tuneado en tareas de manipulacion de precision con un robot de bajo coste.
- Despliegue en robots de bajo coste: al ser compacto (450M parametros), puede ejecutarse en hardware accesible, facilitando la experimentacion en laboratorios con recursos limitados.
- Base para fine-tuning adicional: puede servir como punto de partida para adaptar la politica a variantes de la tarea (diferentes objetos, posiciones o condiciones de iluminacion).
- Evaluacion de generalizacion: permite comparar el rendimiento de SmolVLA frente a modelos VLA mas grandes en tareas de manipulacion concretas, contribuyendo a la investigacion sobre eficiencia en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: el modelo tiene 450M parametros; en precision BF16 los pesos ocupan aproximadamente 0,9 GB (coherente con el tamano del repositorio), por lo que la inferencia deberia caber en GPUs con 4-8 GB de VRAM. Esta es una estimacion basada en el tamano del repositorio, no en mediciones publicadas.
- GPUs recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente para inferencia.
- Despliegue: el flujo oficial usa LeRobot con `lerobot-rollout` y requiere CUDA (`--policy.device=cuda`).
- El paper de SmolVLA indica que el modelo esta disenado para hardware de consumo, aunque no se proporcionan cifras exactas de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HyeonseokE/smolvla_extract_cube_cap_1000_10fps | 450M | no disponible | Apache 2.0 | Fine-tuning de SmolVLA para extraccion de cubo |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | Modelo base de SmolVLA, sin fine-tuning especifico |
| OpenVLA (referencia) | 7B | no disponible | MIT | VLA de mayor tamano, requiere recursos computacionales superiores |

No se dispone de datos de rendimiento comparativos publicados para este fine-tuning concreto. La comparacion se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Entrenado para una tarea muy especifica (extraer cubo de bolsillo y colocarlo en marcador); no generaliza a otras tareas sin fine-tuning adicional.
- Dataset de entrenamiento pequeno (100 episodios), lo que puede limitar la robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento real no esta verificado.
- Las camaras utilizadas en entrenamiento (top y left_wrist) deben coincidir con las del despliegue; el modelo espera tres entradas de imagen a 256x256.
- No se dispone de informacion sobre la longitud de contexto ni los idiomas soportados, aunque al ser un modelo de robotica esto tiene relevancia limitada.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue depende de LeRobot y del hardware del robot SO-101.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_extract_cube_cap_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/extract_cube_cap_10fps
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Fork de LeRobot con mejoras para SmolVLA: https://github.com/HyeonseokE/kaia_lerobot
