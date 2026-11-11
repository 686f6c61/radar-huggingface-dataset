# namiciro/smolvla-sort-policy

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores mediante politicas de imitacion entrenadas sobre demostraciones. Este repositorio concreto, `namiciro/smolvla-sort-policy`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` orientado a una tarea especifica de clasificacion de bloques por color en cajas, ejecutada sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste).

El modelo resuelve el problema de obtener una politica de control visual end-to-end que corra en hardware de consumo, sin necesidad de GPUs de datacenter. Con 450 millones de parametros, el checkpoint es lo bastante pequeno como para desplegarse en una GPU consumer y ejecutar inferencia a la frecuencia de control de un robot de escritorio (30 FPS en el dataset de entrenamiento).

La relevancia actual de este checkpoint es limitada: es un artefacto de investigacion con cero descargas y sin resultados de evaluacion publicados. Su interes radica en servir como ejemplo reproducible de fine-tuning de SmolVLA sobre un dataset propio y como referencia para quien quiera entrenar politicas VLA de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA; backbone transformer con encoder visual y modulo de lenguaje, no se detalla la composicion exacta en la informacion disponible |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo produce acciones, no texto; las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`, tamano de repo 0,9 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina percepcion visual, comprension de instrucciones en lenguaje natural y generacion de acciones motoras en un unico transformer. El checkpoint aqui descrito se ha obtenido por fine-tuning del modelo base `lerobot/smolvla_base` mediante el flujo de entrenamiento de LeRobot, version 0.7.1. La politica consume un vector de estado de 6 dimensiones (`observation.state`), tres camaras visuales a 256x256 y dos camaras adicionales a 480x640 (etiquetadas como `empty_camera_0` y `empty_camera_1`, lo que sugiere que no aportan informacion util en este entrenamiento), y produce un vector de accion de 6 dimensiones.

El entrenamiento se realizo sobre el dataset `namiciro/red-to-right-v2`, compuesto por 70 episodios y 30.440 frames a 30 FPS, con dos tareas: "Put the red block in the right box" y "Put the blue block in the left box". La configuracion fue de 6.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de aprendizaje por imitacion supervisado. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset mas alla de los episodios citados.

## Capacidades

- Control robotico end-to-end a partir de observaciones visuales y estado proprioceptivo, generando acciones de 6 dimensiones.
- Seguimiento de instrucciones de tarea en lenguaje natural (las dos tareas de entrenamiento, en ingles).
- Percepcion visual multi-camara (hasta tres camaras de 256x256 y dos de 480x640 como entradas declaradas).
- Politica de imitacion especializada en una tarea de manipulacion concreta (clasificacion de bloques por color).
- No soporta tool calling ni function calling: es un modelo de robotica, no un LLM de proposito general.
- No dispone de modo thinking, vision general, audio ni razonamiento multi-paso mas alla de la secuencia de control.
- Capacidades multilingues no aplicables: las instrucciones de tarea estan fijadas en ingles.

## Casos de uso

- Clasificacion de bloques por color en un entorno de laboratorio: el modelo ejecuta la tarea "Put the red block in the right box" o "Put the blue block in the left box" sobre un SO-100/SO-101, usando las camaras frontales y el estado del robot.
- Reproduccion de experimentos de imitation learning: sirve como referencia para validar el pipeline de LeRobot (`lerobot-train`, `lerobot-rollout`) con un dataset pequeno de 70 episodios.
- Base para fine-tuning adicional: al estar licenciado Apache 2.0 y derivar de `smolvla_base`, puede reentrenarse con nuevos datasets para tareas de pick-and-place.
- Docencia y formacion en robotica de bajo coste: permite montar un banco de pruebas con hardware consumer y demostrar el ciclo completo de grabacion, entrenamiento y despliegue.
- Benchmark interno de politicas VLA: util como linea base para comparar con otras politicas entrenadas sobre el mismo dataset o con el modelo base sin fine-tuning.
- Prototipado de automatizacion de sorting en entornos controlados: con las limitaciones de generalizacion propias de un entrenamiento de 70 episodios, puede servir para validar una celda de clasificacion antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parametros en safetensors, la inferencia en precision completa requiere aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y buffers de imagen.
- GPU recomendadas: no especificadas por el autor. Por tamano, es viable en GPUs consumer con al menos 4-8 GB de VRAM.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=namiciro/smolvla-sort-policy`), que es el unico metodo documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de robotica.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS, lo que sugiere que la politica debe operar en ese orden de frecuencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| namiciro/smolvla-sort-policy | 450 M | no disponible | Clasificacion de bloques (SO-100) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA generalista para robotica | Apache 2.0 (segun repo base) | Hugging Face (modelo base) |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitation learning | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre 70 episodios y dos tareas concretas; la generalizacion a nuevas posiciones, colores, iluminacion o distracciones no esta garantizada ni evaluada.
- Sin resultados de evaluacion publicados: no se conoce la tasa de exito real de la politica.
- Las entradas `empty_camera_0` y `empty_camera_1` (480x640) parecen no aportar informacion; su presencia en la firma de observaciones puede complicar el despliegue si no se replican exactamente.
- Las instrucciones de tarea estan en ingles y limitadas a las dos frases de entrenamiento; no hay soporte multilingue.
- Riesgo de sobreajuste al entorno de grabacion (posiciones de camara, robot y objetos) y de fallo ante cambios en la celda de trabajo.
- No es un modelo de lenguaje: no debe usarse para generacion de texto, codigo ni tareas de NLP.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones; conviene verificar `lerobot/smolvla_base` y `namiciro/red-to-right-v2`.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiciro/smolvla-sort-policy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-v2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namiciro/red-to-right-v2
