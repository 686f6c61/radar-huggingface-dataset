# fecasado/gfm-cubes-22dN10

## Resumen

`fecasado/gfm-cubes-22dN10` es una politica de aprendizaje por imitacion para robotica publicada por el usuario fecasado en Hugging Face. Esta etiquetada con el pipeline `robotics` y la libreria `lerobot`, el framework de Hugging Face para entrenamiento y despliegue de politicas de manipulacion. El nombre del modelo y sus etiquetas (`gaze_flow_matching`) indican que se trata de una politica basada en flow matching condicionada por la mirada (gaze), un enfoque relativamente poco frecuente frente a las politicas ACT o Diffusion Policy mas habituales en el ecosistema.

El modelo tiene 75.232.970 parametros (unos 75 M) y un repositorio de 0,3 GB en formato safetensors. Se ha entrenado sobre el conjunto de datos `fecasado/Ncubes-to-Nbaskets-320x240`, cuyo nombre sugiere una tarea de manipulacion de cubos hacia cestas con observaciones visuales de 320x240 pixeles. La model card no documenta la arquitectura exacta, los hiperparametros de entrenamiento ni el numero de episodios utilizados.

Su relevancia es la de un artefacto de investigacion en robotica open source: puede reproducirse con las herramientas publicas de LeRobot, es ligero (cabe en cualquier GPU de consumo) y esta liberado bajo licencia Apache 2.0, lo que permite reutilizarlo y modificarlo. No obstante, en el momento de redactar esta ficha acumula 0 descargas y 0 likes, y la model card esta practicamente vacia, por lo que debe considerarse un modelo experimental sin validacion externa publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de robot basada en flow matching condicionada por vision y mirada (gaze flow matching); no confirmada en detalle en la model card |
| Parametros totales | 75.232.970 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje); horizonte de observacion no disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | No aplicable (no genera texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tarea | Manipulacion robotica (imagen a acciones) |
| Dataset de entrenamiento | fecasado/Ncubes-to-Nbaskets-320x240 |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-10-11 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La model card declara explicitamente `_Model type not recognized — please update this template._`, lo que indica que se genero con la plantilla por defecto de LeRobot y que el campo de tipo de politica no se relleno. Por tanto, la descripcion arquitectonica concreta (numero de capas, backbone visual, dimension de las embeddings, mecanismo de atencion) no esta disponible. Lo unico documentado es el nombre `gaze_flow_matching` y la etiqueta homonima, de lo que se deduce que el modelo emplea flow matching como objetivo generativo de acciones y algun tipo de condicionamiento por mirada (gaze) ademas de la observacion visual. El diagrama de entrenamiento de LeRobot suele combinar un codificador visual con un decoder de acciones; en este caso no se especifica la composicion exacta.

Respecto a los datos de entrenamiento, solo se conoce el identificador del dataset asociado, `fecasado/Ncubes-to-Nbaskets-320x240`, que sugiere demostraciones de transferencia de cubos a cestas capturadas a 320x240. No se publican el numero de episodios, el numero de transiciones, si hubo aumentacion de datos, ni si se aplico algun esquema de regularizacion o RLHF/DPO (concepto por otra parte poco habitual en politicas de robot). Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio objetivo de flow matching. En consecuencia, cualquier afirmacion sobre el proceso de entrenamiento distinta de las aqui recogidas seria especulacion.

## Capacidades

- Generacion de acciones motoras de robot a partir de observaciones visuales de 320x240, en el marco de una tarea de manipulacion tipo pick-and-place.
- Condicionamiento por mirada (gaze), segun indica el nombre y la etiqueta `gaze_flow_matching`; el uso concreto de esta senal no esta documentado.
- Aprendizaje por imitacion a partir de demostraciones (offline imitation learning), entrenable y evaluable con el flujo de LeRobot (`lerobot-train`, `lerobot-record`).
- Integracion nativa con LeRobot, lo que permite cargar los pesos via `--policy.path` en scripts de evaluacion e inferencia.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbolico ni agentes conversacionales.
- Sin capacidades multilingues (no procesa ni genera lenguaje natural).
- No se documentan modos especiales (thinking mode, audio, vision general) mas alla del procesamiento visual necesario para la politica.

## Casos de uso

- Manipulacion pick-and-place de cubos a cestas: es la tarea para la que se entreno segun el dataset `Ncubes-to-Nbaskets-320x240`; el modelo genera comandos de accion a partir de imagenes de la escena, adecuado para replicar la politica en un banco de pruebas con el mismo montaje.
- Base para reentrenamiento en tareas de clasificacion de objetos: al ser un modelo ligero (75 M) y con licencia Apache 2.0, puede ajustarse con demostraciones propias para separar objetos por forma o color.
- Investigacion sobre condicionamiento por mirada: permite experimentar con politicas que incorporan senal de gaze frente a politicas puramente visuales, comparando el efecto en la tasa de exito.
- Despliegue en robots de bajo coste: con 0,3 GB de pesos y ~150 MB en fp16, puede ejecutarse en GPUs de gama media o incluso en CPU para inferencia de baja frecuencia, lo que encaja en plataformas tipo SO-100 (el ejemplo de la model card usa `so100_follower`).
- Evaluacion y benchmarking reproducible: util como punto de partida para medir tasas de exito con `lerobot-record` y `--episodes`, generando datasets de evaluacion propios.
- Docencia y formacion en aprendizaje por imitacion: el modelo sirve de ejemplo minimo de extremo a extremo (entrenamiento, exportacion a safetensors, evaluacion) para cursos de robotica.
- Generacion de datos sinteticos de trayectoria: las acciones muestreadas por la politica pueden usarse para aumentar datasets de manipulacion en simulacion, siempre que el dominio coincida con el de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion, ni comparaciones con otras politicas. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 300 MB; en fp16, unos 150 MB. Sumando activaciones del backbone visual y buffers de inferencia, el consumo realista se situa por debajo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090; tambien A100 o H100 si se entrena con lotes grandes, aunque estan sobredimensionadas para inferencia de un modelo de 75 M.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (RTX 30/40, e incluso integradas con soporte CUDA). La model card usa `--policy.device=cuda`, lo que confirma la ejecucion en GPU.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para evaluacion/inferencia), con backend PyTorch. No se documenta soporte en la model card para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a politicas de robot basadas en pytorch.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo de inferencia ni de frecuencia de control alcanzada.

## Comparativa con modelos similares

No se dispone de datos cuantitativos (parametros exactos, contexto, tasas de exito, licencia y disponibilidad) de otras politicas comparables en la informacion proporcionada, por lo que la comparacion se limita a nivel cualitativo.

| Modelo | Categoria | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| fecasado/gfm-cubes-22dN10 | Politica de manipulacion (flow matching con gaze) | 75.232.970 | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (Action Chunking Transformer) | Politica de manipulacion por imitacion | no disponible | Apache 2.0 (referencia del ecosistema LeRobot) | Implementada en LeRobot |
| Diffusion Policy | Politica de manipulacion por difusion | no disponible | no disponible | Implementada en LeRobot |
| SmolVLA y otras VLA de LeRobot | Politica vision-language-action | no disponible | no disponible | Ecosistema LeRobot |

Cualquier cifra de rendimiento relativo exigiria evaluar los modelos bajo el mismo montaje experimental, algo que no se ha publicado para este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un unico dataset muy especifico, la politica heredara los sesgos de las demostraciones (posiciones, iluminacion, objetos y montaje concretos).
- Riesgo de alucinacion o de acciones incorrectas: elevado en escenarios fuera de distribucion, ya que no hay informacion sobre el rango de variabilidad del dataset de entrenamiento. En robotica esto se traduce en colisiones o agarres fallidos, no en texto inventado.
- Limitaciones de dominio: la politica esta especializada en la tarea y montaje del dataset `Ncubes-to-Nbaskets-320x240`; su generalizacion a otros objetos, camaras o robots es desconocida.
- Limitaciones de idioma: no aplica (no procesa lenguaje).
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion; no obstante, el autor no ofrece garantias ni soporte.
- Caveats para produccion: 0 descargas y 0 likes, model card incompleta y sin validacion externa; el tipo de politica no fue reconocido por la plantilla de LeRobot, lo que sugiere que el entrenamiento pudo realizarse con una configuracion no estandar. No se deben asumir tasas de exito ni tiempos de inferencia concretos sin una evaluacion propia.
- La fecha de creacion indicada en los metadatos (2026-10-11) es posterior a la fecha habitual de publicacion, dato a verificar por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dN10
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
