# eslab1234/smolvla_5blocks_expert_only_b16_100k_v1

## Resumen

Este modelo es un fine-tuning del modelo base `lerobot/smolvla_base`, desarrollado por el usuario eslab1234, y entrenado con el framework LeRobot de Hugging Face. SmolVLA es un modelo vision-language-action (VLA) compacto de 450 millones de parametros, disenado por Hugging Face para desplegarse en hardware de consumo, que combina un VLM preentrenado compacto con un experto de acciones entrenado mediante flow matching.

La variante aqui presentada esta especializada en una tarea concreta de manipulacion robotica: recoger cinco bloques de colores en un orden especifico (rojo, amarillo, madera, verde, azul) y colocarlos en un area objetivo. El modelo consume imagenes de tres camaras (256x256) y el estado del robot (6 dimensiones), y produce acciones de 6 grados de libertad. Se entrenaron 100.000 pasos con un batch size de 16 sobre un dataset hibrido de 100 episodios y 138.387 frames a 30 FPS.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de SmolVLA para tareas de manipulacion especificas, con licencia Apache 2.0 y pesos en formato safetensors, lo que permite su uso comercial y su despliegue en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) SmolVLA: VLM compacto + experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de texto generativo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y vision preentrenado compacto con un experto de acciones entrenado mediante flow matching. Dado un conjunto de imagenes de multiples camaras y una instruccion en lenguaje natural, el modelo genera un chunk de acciones. La arquitectura esta optimizada para minimizar el coste computacional y permitir inferencia en hardware de consumo.

Este fine-tuning parte del checkpoint `lerobot/smolvla_base` y se entrena con el framework LeRobot (version 0.5.2) sobre el dataset `eslab1234/task1_hybrid_5blocks_v3_100ep_merged`, que contiene 100 episodios y 138.387 frames a 30 FPS. La configuracion de entrenamiento incluye 100.000 pasos, batch size de 16, optimizador AdamW con learning rate de 0,0001 y semilla 1000. El robot utilizado es un `so_follower` con tres camaras (top, wrist y una tercera no especificada en la model card). No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitacion supervisada con flow matching.

## Capacidades

- Manipulacion robotica pick-and-place: el modelo ejecuta la tarea de recoger cinco bloques en secuencia y colocarlos en un area objetivo.
- Entrada multimodal: consume tres imagenes de camara (256x256) y el estado del robot (6 dimensiones).
- Salida de acciones: genera acciones de 6 grados de libertad (posicion y orientacion del efector final).
- Ejecucion de tareas con instruccion en lenguaje natural: la tarea se especifica mediante un prompt textual.
- Inferencia en tiempo real: disenado para operar a 30 FPS, acorde con la frecuencia de captura del dataset.
- Despliegue en hardware de consumo: gracias al tamano compacto del modelo (450M parametros, 0,9 GB).

## Casos de uso

- Automatizacion de lineas de montaje: el modelo puede integrarse en un brazo robotico tipo `so_follower` para clasificar y colocar piezas de colores en posiciones determinadas, reduciendo el coste de programacion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA con datasets pequenos (100 episodios) y evaluar la transferencia entre tareas.
- Prototipado rapido de politicas roboticas: con LeRobot, un investigador puede entrenar y desplegar esta politica en un robot en horas, sin necesidad de infraestructura de GPU de gran escala.
- Educacion en robotica: al ser un modelo abierto (Apache 2.0) y ligero, es adecuado para laboratorios docentes que necesitan ejemplos funcionales de VLA sin costes elevados.
- Benchmarking de VLA en tareas de manipulacion: permite comparar el rendimiento de SmolVLA fine-tuneado frente a otras arquitecturas en una tarea estandarizada de pick-and-place multiobjeto.
- Integracion en pipelines de robotica con ROS: la salida de acciones de 6 DOF puede conectarse directamente a controladores de bajo nivel mediante los adaptadores de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos de tasa de exito en robot real ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado el tamano del modelo (450M parametros, 0,9 GB en safetensors), se estima que cabe en GPUs de consumo con al menos 8 GB de VRAM, aunque no se confirma oficialmente.
- GPU recomendadas: no especificadas por el autor. Por las caracteristicas de SmolVLA, se espera compatibilidad con RTX 3060/4060/4090 y GPUs de datacenter como A10 o A100.
- Compatibilidad con hardware de consumo: si, SmolVLA esta disenado explicitamente para consumer-grade hardware segun la documentacion oficial.
- Opciones de despliegue: LeRobot (framework principal), con soporte para rollout en robot real mediante `lerobot-rollout`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de robotica y no de texto generativo.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS, lo que sugiere que la politica esta disenada para operar a esa frecuencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eslab1234/smolvla_5blocks_expert_only_b16_100k_v1 | 450M | no disponible | Pick-and-place 5 bloques | Apache 2.0 | Hugging Face |
| eslab1234/smolvla_task1_5blocks_v3_100ep_b64_50k_v1 | 450M (estimado, mismo base) | no disponible | Pick-and-place 5 bloques (variante con batch 64 y 50k pasos) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de informacion sobre otros VLA comparables en la misma tarea. La diferencia principal entre las dos variantes de eslab1234 es la configuracion de entrenamiento (batch size y numero de pasos), lo que puede afectar a la convergencia y al rendimiento final, aunque no hay datos de evaluacion que lo confirmen.

## Limitaciones y advertencias

- Sin resultados de evaluacion: el autor no ha publicado tasas de exito en robot real, por lo que se desconoce la fiabilidad real de la politica en produccion.
- Especializacion estrecha: el modelo esta entrenado exclusivamente para la tarea de recoger cinco bloques en un orden especifico. No generaliza a otras tareas sin reentrenamiento.
- Dependencia del setup de captura: las entradas esperan tres camaras con resolucion 256x256 y un estado de 6 dimensiones. Cambios en la configuracion de camaras o en el robot requieren reentrenamiento o adaptacion.
- Riesgo de sobreajuste: con solo 100 episodios de entrenamiento, existe riesgo de que la politica no generalice a variaciones de iluminacion, posicion de objetos o distracciones no presentes en el dataset.
- Sin soporte de tool calling ni agentes: al ser un modelo de robotica, no ofrece capacidades de razonamiento conversacional, generacion de codigo ni funciones de agente.
- Idiomas no especificados: no se indica que idiomas soporta la instruccion textual, aunque el prompt de ejemplo esta en ingles.
- Modelo creado en 2026: la fecha de creacion (agosto de 2026) es reciente y el modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eslab1234/smolvla_5blocks_expert_only_b16_100k_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/task1_hybrid_5blocks_v3_100ep_merged
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Variante alternativa del mismo autor: https://huggingface.co/eslab1234/smolvla_task1_5blocks_v3_100ep_b64_50k_v1
