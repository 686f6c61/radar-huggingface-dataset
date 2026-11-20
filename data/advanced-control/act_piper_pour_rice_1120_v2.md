# advanced-control/act_piper_pour_rice_1120_v2

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulacion en tareas de manipulacion robotica. Este repositorio concreto, `advanced-control/act_piper_pour_rice_1120_v2`, es una politica entrenada con LeRobot sobre el robot Piper para la tarea de verter arroz, a partir de 50 episodios de teleoperacion y 87.288 frames a 15 FPS.

El modelo consume tres flujos de camara (`camera_hand`, `camera_chest`, `camera_top`) a 360x640 junto con un vector de estado de 7 dimensiones, y produce un vector de accion de 7 dimensiones. Con 51.670.663 parametros y un repositorio de 0,2 GB en formato safetensors, es una politica compacta orientada a inferencia en tiempo real sobre hardware de robot real, no un modelo de lenguaje.

Su relevancia es acotada: se trata de un artefacto de investigacion aplicada publicado en el Hub de Hugging Face bajo licencia Apache 2.0, sin resultados de evaluacion reportados y sin descargas ni interacciones en el momento de la consulta. Es util como referencia reproducible de un pipeline LeRobot completo (dataset, configuracion de entrenamiento y politica), no como componente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de imitacion; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin salida de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer disenado para imitacion: un codificador procesa las observaciones (tres imagenes RGB de 3x360x640 y un vector de estado de 7 dimensiones) y un decodificador genera un chunk de acciones de 7 dimensiones. La prediccion por chunks, en lugar de paso a paso, es la innovacion central del metodo descrito en el paper arXiv:2304.13705, y mitiga el sesgo de parada (stopping bias) y la acumulacion de errores en horizontes largos.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `advanced-control/piper_pour_rice_1120_v2`: 50 episodios, 87.288 frames a 15 FPS, una unica tarea etiquetada como `"task"`. Configuracion: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composicion del dataset, aumento de datos, ni uso de RLHF/DPO (no aplica en este paradigma).

## Capacidades

- Generacion de acciones de manipulacion robotica de 7 dimensiones a partir de observaciones visuales y de estado.
- Imitacion de una tarea especifica de vertido de arroz sobre el robot Piper.
- Percepcion multimodal: fusiona tres camaras (mano, pecho, superior) con el estado propioceptivo.
- Prediccion de chunks de accion, lo que aporta suavidad temporal en la ejecucion.
- Ejecucion en bucle cerrado sobre robot real mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- **Vertido de arroz en el robot Piper**: ejecucion directa de la politica con `lerobot-rollout` para reproducir la tarea entrenada; es el unico uso para el que existe evidencia de entrenamiento.
- **Base para fine-tuning en tareas de vertido similares**: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de otro material granular o recipiente, partiendo de esta configuracion como referencia.
- **Banco de pruebas de pipelines LeRobot**: usar el repositorio como ejemplo completo (dataset, config, pesos) para validar la instalacion, el formateo de observaciones y el flujo de rollout antes de invertir en datos propios.
- **Evaluacion de robustez ante variaciones de iluminacion y posicion**: al no haber resultados de evaluacion publicados, sirve como punto de partida para medir tasas de exito propias con distintos objetos y condiciones.
- **Investigacion en aprendizaje por imitacion con pocos datos**: 50 episodios y 87.288 frames constituyen un caso de estudio de que rendimiento se obtiene con un presupuesto de demostraciones reducido.
- **Docencia y divulgacion en robotica**: ejemplo compacto (51,7 M de parametros, 0,2 GB) de politica visuomotora que cabe en cualquier equipo con GPU consumer para experimentos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que aun no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parametros en precision completa (fp32) los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM necesaria la dominan las activaciones de las tres imagenes de 3x360x640 y no los pesos.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA es suficiente para el tamano del modelo; la model card solo indica `--policy.device=cuda` como opcion de entrenamiento.
- Cabe en GPU consumer: si, por el reducido numero de parametros; no se especifica un modelo concreto validado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. La frecuencia del dataset es de 15 FPS, lo que da una referencia del ritmo de control esperado, pero no se publica latencia medida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otras politicas comparables (por ejemplo, Diffusion Policy u otras variantes de ACT) con parametros, contexto o tasas de exito medidos, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sin resultados de evaluacion: se desconoce la tasa de exito real de la politica, incluso en la tarea para la que fue entrenada.
- Entrenada para una unica tarea (`"task"`) y un unico robot (Piper); no se espera generalizacion a otras tareas, objetos o morfologias sin reentrenamiento.
- Requiere que los nombres y la configuracion de las camaras coincidan exactamente con las claves de observacion (`camera_hand`, `camera_chest`, `camera_top`); cualquier desviacion invalida la inferencia.
- Dataset pequeno (50 episodios): riesgo alto de sobreajuste a posiciones, iluminacion y condiciones concretas del entorno de recogida.
- Sin informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma aplicables, al no ser un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Repositorio sin descargas ni interacciones en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Para produccion, es imprescindible una evaluacion propia en el entorno objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/advanced-control/act_piper_pour_rice_1120_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/advanced-control/piper_pour_rice_1120_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=advanced-control/piper_pour_rice_1120_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
