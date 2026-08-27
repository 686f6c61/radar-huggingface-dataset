# HyeonseokE/smolvla_phase1_pick_place_A2_2000_10fps

## Resumen

SmolVLA es una familia de modelos de visión-lenguaje-acción (VLA) de tamaño compacto, desarrollada por Hugging Face en colaboración con el equipo de LeRobot. Este repositorio concreto, `HyeonseokE/smolvla_phase1_pick_place_A2_2000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica de robótica: recoger un objeto y colocarlo en una posición determinada (pick-and-place). El modelo ha sido entrenado con 2000 episodios muestreados a 10 fps, utilizando el dataset `HyeonseokE/phase1_pick_place_A2_10fps`.

La relevancia de este modelo radica en que demuestra el flujo de trabajo completo de fine-tuning de un VLA para tareas robóticas personalizadas usando la librería LeRobot. SmolVLA, con aproximadamente 500 millones de parámetros, es significativamente más pequeño que otros VLA como OpenVLA (7B), lo que permite su despliegue en hardware más accesible. El modelo está pensado para ser usado con el ecosistema LeRobot, que facilita la recopilación de datos, el entrenamiento y la inferencia en robots reales y simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | ~500M (base), ~50M entrenables en fine-tuning |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador de vision SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" (experto de accion) que convierte las representaciones conjuntas de vision y lenguaje en comandos de actuacion para el robot. La arquitectura sigue el patron de los VLA modernos: las observaciones visuales se procesan con el codificador de vision, se combinan con instrucciones en lenguaje natural, y el action expert genera las acciones de los actuadores del robot.

En este fine-tuning especifico, el modelo base se ha ajustado para una tarea de pick-and-place en un brazo robotico SO-101, utilizando datos recopilados a 10 fps. Segun la documentacion de fine-tuning de SmolVLA, solo se entrenan aproximadamente 50 millones de parametros (el action expert y las proyecciones), mientras que el codificador de vision SigLIP y el modelo de lenguaje SmolLM2 permanecen congelados. El dataset de entrenamiento, `phase1_pick_place_A2_10fps`, fue generado mediante SCRAPE-IsaacLab, un pipeline de replay de codigo como politicas que se ejecuta en Isaac Sim 5.1, con 100 episodios de un robot recogiendo un bloque rojo y colocandolo en un plato azul.

## Capacidades

- Ejecucion de tareas de manipulacion robotica pick-and-place: el modelo recibe observaciones visuales de una camara y genera comandos de actuacion para el brazo robotico.
- Generalizacion a partir de instrucciones en lenguaje natural: al estar basado en SmolLM2, puede interpretar variaciones en las instrucciones de la tarea.
- Integracion con el ecosistema LeRobot: compatible con el entrenamiento y despliegue mediante la libreria LeRobot, que soporta multiples robots y simuladores.
- Fine-tuning eficiente: al congelar la mayoria de los parametros, el ajuste para nuevas tareas requiere relativamente pocos datos y recursos computacionales.
- Inferencia en tiempo real: con 500M de parametros, es posible ejecutar el modelo a frecuencias de control adecuadas (10-30 fps) en GPUs de gama media.

## Casos de uso

- Automatizacion de tareas de picking en almacenes: el modelo puede controlar un brazo robotico para recoger objetos de una cinta transportadora y colocarlos en contenedores, adaptandose a posiciones variables.
- Investigacion en manipulacion robotica: sirve como punto de partida para experimentos de fine-tuning en nuevas tareas, gracias a su tamano reducido y al soporte de LeRobot.
- Prototipado rapido en simulacion: permite validar politicas de control en entornos simulados (Isaac Sim, MuJoCo) antes de desplegarlas en robots fisicos.
- Educacion en robotica y aprendizaje por refuerzo: su tamano compacto y licencia permisiva lo hacen adecuado para cursos y talleres donde se necesita un VLA funcional sin grandes recursos.
- Desarrollo de asistentes roboticos de sobremesa: puede integrarse en brazos roboticos de bajo coste (como SO-101 o similar) para tareas de organizacion y manipulacion ligera.
- Benchmarking de VLA en tareas especificas: permite comparar el rendimiento de SmolVLA frente a otros modelos (ACT, OpenVLA) en tareas de pick-and-place con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exito de la tarea, ni comparaciones con otros modelos en el mismo escenario. Para evaluar el rendimiento, seria necesario ejecutar el modelo en el entorno de simulacion o en el robot fisico y medir la tasa de exito en la tarea de pick-and-place.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~500M de parametros, se estima que necesita entre 2 y 4 GB de VRAM en funcion de la precision y el tamano de lote. No se dispone de datos exactos de cuantizacion.
- GPU recomendadas: una GPU con al menos 6 GB de VRAM (GTX 1660, RTX 2060, RTX 3050) deberia ser suficiente para inferencia a 10-30 fps. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3070, RTX 4080).
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo de gama media y alta.
- Opciones de despliegue: LeRobot (libreria principal), y potencialmente exportacion a formatos como ONNX o TensorRT para inferencia optimizada. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo puro.
- Latencia y throughput: no disponible. Dependera de la GPU, la resolucion de las imagenes de entrada y la frecuencia de control requerida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este fine-tuning) | ~500M | no disponible | Pick-and-place | Apache-2.0 | HuggingFace |
| ACT (Action Chunking with Transformers) | ~80M | no disponible | Manipulacion robotica | MIT | Codigo abierto |
| OpenVLA | 7B | no disponible | Manipulacion robotica general | MIT | HuggingFace |

SmolVLA ofrece un equilibrio entre tamano y capacidad, siendo mucho mas ligero que OpenVLA pero con una arquitectura mas moderna que ACT. Su integracion con LeRobot y su licencia Apache-2.0 lo hacen especialmente atractivo para proyectos comerciales y de investigacion. La comparacion directa de rendimiento no es posible sin datos de benchmarks en la misma tarea.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en un dataset sintetico generado en Isaac Sim, puede no generalizar bien a entornos del mundo real con iluminacion, texturas o dinamicas diferentes.
- Riesgo de alucinacion: como modelo de lenguaje, puede generar instrucciones o acciones inconsistentes si las observaciones visuales son ambiguas o fuera de distribucion.
- Limitaciones de contexto: la tarea de pick-and-place es especifica y el modelo no esta preparado para otras tareas de manipulacion sin un nuevo fine-tuning.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que los componentes base (SmolLM2, SigLIP) no tengan restricciones adicionales.
- Caveat de produccion: el modelo ha sido entrenado con datos a 10 fps; si se usa a frecuencias de control mas altas, el rendimiento puede degradarse. Se recomienda validar en el robot fisico antes de un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A2_2000_10fps
- Perfil del autor: https://huggingface.co/HyeonseokE
- Repositorio del dataset: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A2_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Blog de fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- Demo de pick-and-place con SmolVLA: https://github.com/HuanYitiao/smolvla-pickplace-demo
