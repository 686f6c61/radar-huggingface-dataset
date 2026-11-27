# khb2439/capstone-gr00t-n1d7-lelab-subtask-30k-orin

## Resumen

`khb2439/capstone-gr00t-n1d7-lelab-subtask-30k-orin` es un checkpoint de ajuste fino (fine-tuning) del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B`, entrenado por el usuario khb2439 sobre un conjunto de datos propio de tareas de manipulacion con un brazo robotico Piper. El modelo resuelve el problema de la politica visomotora (vision-language-action, VLA): dado un par de imagenes de camara, el estado articular del robot y una instruccion de lenguaje natural, predice una secuencia de acciones articulares para ejecutar la tarea.

Se trata de un derivado experimental de tipo capstone (proyecto de fin de estudios), no de un modelo de proposito general. El entrenamiento consistio en 30.000 pasos sobre 371 episodios (115.784 fotogramas, aproximadamente 64 minutos de datos de manipulacion) del subconjunto de tareas "lelab sub-task" con el embodiment Piper. El repositorio publica 15 checkpoints intermedios cada 2.000 pasos, sin estados de optimizador, y esta pensado para desplegarse en un NVIDIA Jetson AGX Orin mediante exportacion a ONNX y construccion de motores TensorRT.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje general, sino un ejemplo concreto de como se adapta un VLA de NVIDIA a un hardware de robot especifico y a un conjunto de datos reducido, incluyendo los detalhes de preprocesado de imagen que condicionan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en `nvidia/GR00T-N1.7-3B`; backbone de razonamiento `nvidia/Cosmos-Reason2-2B`; cabeza de difusion para acciones |
| Parametros totales | 3B (heredados del modelo base `GR00T-N1.7-3B`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo menciona exportacion a ONNX y TensorRT en FP16/FP32 segun el pipeline de Isaac-GR00T) |
| Idiomas soportados | instrucciones de tarea en ingles (ejemplo: `pick up the barley tea bottle`); no se documentan otros idiomas |
| Licencia | la del modelo base `nvidia/GR00T-N1.7-3B` y la del backbone `nvidia/Cosmos-Reason2-2B`; el autor incluye el fichero `LICENSE` del base sin modificar |
| Formato de pesos | `safetensors` (2 shards, ~6,9 GB por checkpoint) + `config.json`, `processor_config.json`, `embodiment_id.json`, `statistics.json` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino parcial de `nvidia/GR00T-N1.7-3B`, un VLA de NVIDIA que combina un backbone vision-language (`nvidia/Cosmos-Reason2-2B`, con acceso sujeto a aprobacion en Hugging Face) con una cabeza de difusion que genera chunks de acciones. Durante el fine-tuning solo se entrenan el proyector, el modelo de difusion y el VLLN; el backbone LLM y el codificador visual permanecen congelados. El entrenamiento se realizo durante 30.000 pasos con batch de 512 en dos RTX PRO 6000, learning rate 1e-4 con schedule coseno y warmup del 5%, optimizador AdamW con weight decay 1e-5 y state dropout de 0,2.

Los datos de entrenamiento son un dataset en formato GR00T LeRobot v2.1 con 371 episodios y 115.784 fotogramas (unos 64 minutos), con dos camaras (`external_camera` y `wirst_camera`) a 480x640. La perdida de entrenamiento descendio de 0,0277 en el paso 2.000 a 0,0035 en el paso 30.000. Un detalle tecnico critico documentado por el autor: el codigo de entrenamiento (Isaac-GR00T commit `626af89`) aplicaba siempre un padding cuadrado (`letter_box_transform`) antes de reducir a 256x256, mientras que versiones posteriores de Isaac-GR00T solo lo hacen si el flag esta activo. Por eso el autor indica modificar `config.json` y `processor_config.json` para poner `letter_box_transform: true` antes de exportar, garantizando que la inferencia en Jetson coincida pixel a pixel con el entrenamiento (verificado con similitud coseno de 0,999999 en x86).

## Capacidades

- Prediccion de acciones visomotoras: genera chunks de 16 pasos de acciones articulares absolutas a partir de imagenes y estado.
- Percepcion multimodal: procesa dos flujos de camara (`external_camera` y `wirst_camera`) a 480x640.
- Comprension de instrucciones de lenguaje natural en ingles para tareas de manipulacion (p. ej., `pick up the barley tea bottle`).
- Control de brazo de 6 grados de libertad efectivos: `arm_1` (joints 1-3), `arm_2` (joints 5-6) y `gripper` (joint 4 no se usa).
- Representacion interna mixta: acciones relativas para `arm_1`/`arm_2` y absolutas para `gripper`, reconstruidas por la politica sumando el estado actual.
- Despliegue en edge: exportacion a ONNX y construccion de motores TensorRT para Jetson AGX Orin con JetPack 7.2.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto libre; es exclusivamente una politica de control.

## Casos de uso

- Manipulacion robotica de laboratorio: el modelo ejecuta subtareas como coger un objeto concreto (botella de te de cebada) sobre un brazo Piper, adecuado porque fue entrenado especificamente sobre ese embodiment y ese conjunto de tareas.
- Prototipado de politicas VLA en investigacion academica: sirve como punto de partida reproducible para experimentar con fine-tuning de GR00T sobre datasets pequenos (371 episodios), dado que el autor documenta los hiperparametros y la perdida por checkpoint.
- Despliegue en robotica de bajo consumo: con exportacion a TensorRT en Jetson AGX Orin, permite ejecutar la politica en hardware embebido sin GPU de servidor, lo que encaja en plataformas moviles o de laboratorio.
- Evaluacion de pipelines de exportacion ONNX/TensorRT: el repositorio incluye instrucciones para `--steps export,build,verify,benchmark`, util para validar paridad numerica entre PyTorch y TensorRT en un VLA.
- Reproduccion de experimentos de preprocesado: el caso documentado de `letter_box_transform` sirve como referencia practica para depurar discrepancias entre entrenamiento e inferencia en modelos que consumen imagenes de camara.
- Benchmarking de latencia en edge: el script `build_trt_pipeline.py --steps benchmark` permite medir latencia de un VLA de 3B en Jetson, util para decidir si un modelo cumple requisitos de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la perdida de entrenamiento por checkpoint:

| Checkpoint | Learning loss |
|---|---|
| 2.000 | 0,0277 |
| 10.000 | 0,0110 |
| 20.000 | 0,0056 |
| 30.000 | 0,0035 |

No hay datos de MMLU, HumanEval, GSM8K ni de exito en tareas (task success rate) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa 6,9 GB en `safetensors`, por lo que en FP16 se necesita al menos ese orden de magnitud mas activaciones y buffers de vision.
- GPU recomendadas: Jetson AGX Orin (objetivo declarado del autor, con JetPack 7.2 / Jetson Linux 39.2); el entrenamiento se realizo en 2x RTX PRO 6000.
- Cabe en GPU de consumo: no confirmado; el modelo base es de 3B parametros, lo que en principio es viable en GPUs de consumo con suficiente VRAM, pero el autor no lo documenta.
- Opciones de despliegue: Isaac-GR00T con exportacion a ONNX y TensorRT (`build_trt_pipeline.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica VLA.
- Latencia y throughput: no disponibles; el autor ofrece el flag `--steps benchmark` para medirlos, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `khb2439/capstone-gr00t-n1d7-lelab-subtask-30k-orin` | 3B | no disponible | VLA fine-tuned | la del base y backbone | publico en HF |
| `nvidia/GR00T-N1.7-3B` | 3B | no disponible | VLA base | NVIDIA (ver LICENSE) | publico en HF |
| `nvidia/Cosmos-Reason2-2B` | 2B | no disponible | backbone vision-language | NVIDIA (acceso con aprobacion) | gated en HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo funciona con el embodiment Piper, las dos camaras concretas y las tareas del dataset de entrenamiento; no generaliza a otros robots ni a otras instrucciones.
- Requiere el backbone `nvidia/Cosmos-Reason2-2B`, cuyo acceso esta sujeto a aprobacion; sin `hf auth login` con cuenta autorizada no se puede cargar el modelo.
- El preprocesado de imagen es fragil: si no se modifica `letter_box_transform` a `true`, la inferencia en Jetson recibe imagenes 256x341 en lugar de 256x256, produciendo acciones distintas a las del entrenamiento.
- El autor no incluye estados de optimizador, por lo que el repositorio no permite reanudar el entrenamiento, solo inferencia o evaluacion.
- No hay informacion sobre sesgos, tasas de alucinacion ni robustez ante condiciones de iluminacion o posiciones no vistas; el dataset es pequeno (371 episodios, ~64 minutos).
- La licencia efectiva depende del modelo base y del backbone; el autor no aclara si el uso comercial esta permitido, y remite al `LICENSE` de NVIDIA.
- No se documentan idiomas distintos del ingles para las instrucciones.
- El repositorio ocupa 129,6 GB (104 GB de checkpoints), lo que complica su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khb2439/capstone-gr00t-n1d7-lelab-subtask-30k-orin
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone vision-language: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Commit de referencia para despliegue en Orin: `708617f5716c63fc0a327391492ea2b91977ae90`
- Commit del codigo de entrenamiento: `626af89`
