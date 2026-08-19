# adhjlm/smolvla_pen_v2v3v4v5v6

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para robótica. Este repositorio concreto, `adhjlm/smolvla_pen_v2v3v4v5v6`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica de manipulación robótica: recoger un bolígrafo y colocarlo en una posición objetivo. El modelo fue entrenado por el usuario `adhjlm` utilizando el framework LeRobot y el dataset `adhjlm/so101_pen_pick_place_v2v3v4v5v6`.

Con 450 millones de parámetros, SmolVLA destaca por su eficiencia computacional, permitiendo su despliegue en hardware de consumo, algo poco habitual en modelos VLA de tamaño similar. El modelo procesa dos flujos de entrada visual (cámara frontal y cámara en la muñeca del robot) junto con el estado del robot (6 dimensiones), y genera acciones de control de 6 dimensiones. Su relevancia radica en democratizar la robótica basada en aprendizaje por imitación, haciendo accesible la robótica avanzada a más desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con vision transformer, modelo de lenguaje y experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA ligero compuesto por un VLM (vision-language model) preentrenado compacto y un "experto de acciones" entrenado con flow matching. Dadas multiples imagenes y una instruccion en lenguaje natural, el modelo genera un fragmento de acciones (action chunk). Esta arquitectura permite aprovechar el conocimiento visual y linguistico de los VLM preentrenados a gran escala sin necesidad de entrenar politicas roboticas desde cero.

El modelo base `lerobot/smolvla_base` fue fine-tuneado con el dataset `adhjlm/so101_pen_pick_place_v2v3v4v5v6`, que contiene 170 episodios y 102.224 frames a 30 FPS. La tarea es "Pick up the pen and place it in the target location". El entrenamiento se realizo con 10.000 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001 y semilla 1000, utilizando LeRobot version 0.6.1. No se menciona el uso de RLHF o DPO; el entrenamiento es de aprendizaje por imitacion supervisado.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 dimensiones (posicion y orientacion del efector final) a partir de observaciones visuales y del estado del robot.
- Percepcion multimodal: procesa dos camaras simultaneamente (frontal y muneca) con resolucion de 480x640 píxeles.
- Comprension de instrucciones en lenguaje natural: la tarea se especifica mediante una instruccion textual ("Pick up the pen and place it in the target location").
- Ejecucion de tareas de pick-and-place: especificamente entrenado para recoger un boligrafo y colocarlo en una posicion objetivo.
- Inferencia en tiempo real: con 30 FPS de entrada, el modelo esta disenado para control robotico en bucle cerrado.
- Eficiencia computacional: 450M de parametros, apto para hardware de consumo.

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorios: el modelo puede controlar un robot SO-101 para tareas repetitivas de recogida y colocacion de objetos pequenos, liberando a investigadores de tareas manuales.
- Prototipado rapido de politicas roboticas: investigadores pueden usar este modelo como punto de partida para fine-tuning en tareas similares, reduciendo el tiempo de desarrollo.
- Educacion en robotica: al ejecutarse en hardware de consumo, es adecuado para cursos universitarios de robotica y aprendizaje por refuerzo.
- Investigacion en aprendizaje por imitacion: el modelo sirve como caso de estudio para comparar tecnicas de flow matching y VLA compactos.
- Despliegue en entornos de produccion con robots SO-101: empresas que usen este robot pueden integrar el modelo para automatizar tareas de manipulacion especificas.
- Benchmarking de modelos VLA: al ser open source y ligero, permite comparar rendimiento frente a modelos mas grandes en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos de tasa de exito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Dado el tamano de 450M de parametros y el repositorio de 1,2 GB, se estima que cabe en GPUs de consumo con al menos 8 GB de VRAM, pero este dato no esta confirmado.
- GPU recomendadas: no disponible. El paper de SmolVLA menciona despliegue en hardware de consumo, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probablemente si, dado el enfasis del paper en eficiencia, pero no confirmado para este checkpoint concreto.
- Opciones de despliegue: LeRobot (libreria principal), con soporte para rollout en robot SO-101. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de robotica, no de texto generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Propietaria | No publico |

SmolVLA se posiciona como una alternativa mucho mas ligera que OpenVLA (7B) y RT-2 (55B), priorizando la eficiencia y el despliegue en hardware de consumo frente al rendimiento bruto. No se dispone de datos comparativos de rendimiento en tareas de manipulacion.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo entrenado con un dataset limitado (170 episodios), puede tener problemas de generalizacion a entornos no vistos.
- Riesgo de alucinacion: en el contexto robotico, esto se traduce en acciones incorrectas o inseguras. No se han evaluado formalmente estos riesgos.
- Limitaciones de contexto: el modelo esta entrenado para una tarea muy especifica (pick-and-place de un boligrafo) y puede no generalizar a otros objetos o disposiciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el dataset de entrenamiento puede tener sus propias condiciones.
- Caveats de produccion: no se han proporcionado resultados de evaluacion en robot real, por lo que el rendimiento en produccion es incierto. Se recomienda validar exhaustivamente antes de un despliegue critico.
- Dependencia de hardware especifico: el modelo esta entrenado para el robot SO-101 con dos camaras especificas; usarlo con otro hardware requiere reentrenamiento o adaptacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/adhjlm/smolvla_pen_v2v3v4v5v6
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/adhjlm/so101_pen_pick_place_v2v3v4v5v6
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
