# hugging-son/smolvla_uirp_drill_filtered_20260824_232427

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, disenado para controlar robots mediante instrucciones en lenguaje natural. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de manipulacion de taladro dental, donde el robot debe desplazar la punta del taladro hacia diferentes molares (superiores e inferiores, izquierdos y derechos). El modelo fue entrenado con el framework LeRobot mediante aprendizaje por imitacion.

Con 450 millones de parametros y un peso de 0,9 GB, este modelo se enmarca en la linea de SmolVLA, que busca ofrecer capacidades competitivas de control robotico a un coste computacional reducido, permitiendo su despliegue en hardware de consumo. La arquitectura combina percepcion visual (tres camaras), estado del robot y comprension de lenguaje para generar acciones de control de 6 grados de libertad. Su relevancia radica en que democratiza la robotica de aprendizaje, permitiendo que investigadores con recursos limitados entrenen y ejecuten politicas de manipulacion en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que adapta un modelo de vision-lenguaje compacto (SmolVLM) para el control robotico. En lugar de entrenar politicas desde cero, aprovecha el conocimiento visual y linguistico aprendido en datos multimodales a gran escala, y lo adapta para generar acciones de control. La arquitectura procesa tres flujos de entrada: imagenes de tres camaras (superior, muneca y lateral) a resolucion 256x256, el estado del robot (vector de 6 dimensiones) y la instruccion de tarea en lenguaje natural. Como salida genera un vector de accion de 6 dimensiones.

Este fine-tuning se realizo sobre el modelo base `lerobot/smolvla_base` utilizando el dataset `hugging-son/uirp_drill_task_20260821_173606_filtered`, que contiene 164 episodios y 70.155 fotogramas a 25 FPS. La tarea consiste en mover la punta de un taladro hacia cuatro objetivos distintos: molar inferior derecho, molar superior derecho, molar superior izquierdo y molar inferior izquierdo. La configuracion de entrenamiento incluyo 30.000 pasos con batch size 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, utilizando LeRobot version 0.6.0. El robot objetivo es el `so_follower` (SO-100), un brazo robotico de bajo coste.

## Capacidades

- Control robotico de 6 grados de libertad a partir de observaciones visuales y de estado.
- Comprension de instrucciones en lenguaje natural para especificar la tarea a ejecutar.
- Percepcion multimodal con tres camaras simultaneas (top, wrist y side) a 256x256.
- Aprendizaje por imitacion a partir de demostraciones humanas registradas con LeRobot.
- Ejecucion de politicas en tiempo real sobre el robot SO-100 (so_follower).
- Generalizacion a multiples variantes de la misma tarea (cuatro objetivos de molar distintos).
- Despliegue en hardware de consumo gracias a su tamano reducido (450 M de parametros).

## Casos de uso

- Manipulacion quirurgica asistida: el modelo puede guiar un brazo robotico para posicionar un taladro dental en puntos anatomicos especificos, reduciendo la variabilidad manual en entornos de entrenamiento odontologico.
- Automatizacion de procedimientos repetitivos en laboratorio: cualquier tarea de posicionamiento de herramientas sobre objetivos fijos puede replicarse con este enfoque, sustituyendo la programacion manual por demostraciones.
- Investigacion en robotica de aprendizaje: sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA sobre dominios especificos con pocos datos (164 episodios).
- Prototipado rapido de politicas robotizadas: con LeRobot, un investigador puede registrar demostraciones, entrenar y desplegar la politica en un mismo flujo de trabajo sin infraestructura compleja.
- Educacion en robotica e IA: al ejecutarse en hardware de consumo y con licencia Apache-2.0, es adecuado para cursos y talleres donde los estudiantes entrenan politicas de manipulacion.
- Evaluacion comparativa de VLA compactos: permite contrastar el rendimiento de SmolVLA frente a modelos mas grandes en tareas de precision, midiendo el equilibrio entre coste computacional y exito en tarea.

## Benchmarks y rendimiento

No se han publicado resultados de evaluacion para esta politica concreta. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". El articulo de SmolVLA (arXiv:2506.01844) reporta evaluaciones en entornos reales para tareas de pick-and-place, apilado y clasificacion con los robots SO100 y SO101, pero esos resultados corresponden al modelo base y no a este fine-tuning especifico.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud, pero al tratarse de un modelo de 450 M de parametros (0,9 GB en safetensors), es plausible que quepa en GPUs de consumo con 8 GB o menos, segun la precision de inferencia.
- GPU recomendadas: el articulo de SmolVLA indica que el modelo puede desplegarse en hardware de consumo; una RTX 3060 o superior deberia ser suficiente para inferencia.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos declarados del proyecto SmolVLA.
- Opciones de despliegue: el flujo principal es mediante LeRobot con el comando `lerobot-rollout`, que ejecuta la politica sobre el robot SO-100. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hugging-son/smolvla_uirp_drill_filtered (este) | 450 M | No disponible | Apache-2.0 | Hugging Face |
| lerobot/smolvla_base | No disponible | No disponible | Apache-2.0 | Hugging Face |
| OpenVLA (referencia del paper) | No disponible | No disponible | No disponible | No disponible |

La comparativa con otros VLA como OpenVLA es cualitativa: el paper de SmolVLA senala que los VLA existentes son tipicamente masivos y costosos, mientras que SmolVLA busca rendimiento competitivo a coste reducido. No se dispone de datos numericos de parametros o benchmarks de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en robot real para esta politica, por lo que su tasa de exito real es desconocida.
- El modelo esta especializado en una tarea muy concreta (posicionamiento de taladro dental sobre molares) y no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuracion especifica de camaras (top, wrist, side) y del robot so_follower; cambios en la disposicion de camaras o en el robot requieren reentrenamiento.
- El dataset de entrenamiento es reducido (164 episodios), lo que puede limitar la robustez frente a variaciones de iluminacion, posicion de objetos o distracciones.
- Riesgo de alucinacion o comportamiento impredecible en estados no vistos durante el entrenamiento, comun en politicas de aprendizaje por imitacion.
- No se dispone de informacion sobre sesgos del modelo, aunque al ser un modelo de control robotico el riesgo principal es la ejecucion insegura de movimientos en entornos reales.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en entornos clinicos reales requeriria validaciones adicionales de seguridad que no estan documentadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hugging-son/smolvla_uirp_drill_filtered_20260824_232427
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/hugging-son/uirp_drill_task_20260821_173606_filtered
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Repositorio VLAb (reproduccion de SmolVLA): https://github.com/huggingface/VLAb/tree/main
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
