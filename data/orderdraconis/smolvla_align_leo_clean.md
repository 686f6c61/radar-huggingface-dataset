# OrderDraconis/smolvla_align_leo_clean

## Resumen

SmolVLA es un modelo fundacional compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para robótica y control de manipuladores. Este repositorio concreto, `OrderDraconis/smolvla_align_leo_clean`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones de alineación de tela, recopilado con un robot bi_so_follower. El modelo toma como entrada el estado del robot (6 dimensiones) y tres vistas de cámara (256x256 píxeles cada una), junto con una instrucción en lenguaje natural, y produce una acción de 12 dimensiones.

El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache 2.0. Está entrenado con 133 episodios (124.930 frames a 30 FPS) para la tarea específica de colocar una pieza de tela verde sobre una rosa y alinearlas perfectamente. Su relevancia radica en que demuestra cómo un VLA compacto puede adaptarse a tareas de manipulación fina con un dataset relativamente pequeño, y puede ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores sin infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (no se especifican detalles internos) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la instruccion de entrenamiento esta en ingles, pero no se documentan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion compacto y eficiente, disenado para ser fine-tuneado en datasets de LeRobot. La arquitectura exacta (tipo de transformer, atencion, etc.) no se detalla en la informacion proporcionada, pero se sabe que toma multiples vistas de camara, el estado sensoriomotor del robot y una instruccion en lenguaje natural, que se codifican en caracteristicas contextuales que condicionan un "action expert" que genera las acciones. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este repositorio es un fine-tuning especifico.

El entrenamiento se realizo con el framework LeRobot (version 0.6.0) sobre el dataset `Janmeier820/align_fabric_dataset_leo`, que contiene 133 episodios y 124.930 frames a 30 FPS. La configuracion de entrenamiento incluye 20.000 pasos, batch size de 64, optimizador AdamW con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion; es un entrenamiento de imitacion supervisada estandar.

## Capacidades

- Generacion de acciones de robot de 12 dimensiones a partir de observaciones de estado (6 dimensiones) y tres vistas de camara (256x256).
- Ejecucion de tareas de manipulacion fina, especificamente alineacion de piezas de tela sobre una superficie.
- Condicionamiento por instruccion en lenguaje natural (en este caso, la tarea "Move the green piece of fabric on top of the pink piece of fabric so that is aligns perfectly").
- Inferencia en tiempo real a 30 FPS (frecuencia de los datos de entrenamiento).
- Integracion con el ecosistema LeRobot para despliegue en robots reales (tipo `bi_so_follower`).
- No es un modelo de proposito general: no genera texto libre, no responde preguntas ni tiene capacidades de chat.

## Casos de uso

- **Alineacion de piezas en manufactura**: el modelo puede controlar un robot para alinear componentes textiles o piezas flexibles sobre una base, una tarea comun en la industria de la confeccion o el ensamblaje de materiales compuestos. Su precision se basa en el entrenamiento con demostraciones reales.
- **Investigacion en aprendizaje por imitacion**: sirve como punto de partida para estudiar como un VLA compacto se adapta a tareas especificas con pocos datos (133 episodios). Los investigadores pueden replicar el fine-tuning con otros datasets.
- **Desarrollo de robots de bajo coste**: al ser un modelo de 450M de parametros, puede ejecutarse en GPUs de consumo, lo que permite a laboratorios con presupuesto limitado probar politicas de manipulacion sin necesidad de clusters.
- **Automatizacion de tareas repetitivas en entornos controlados**: por ejemplo, en laboratorios de biologia o quimica, donde se requiere colocar muestras o materiales con precision milimetrica. El modelo puede adaptarse con fine-tuning adicional.
- **Benchmark de VLA en hardware real**: el repositorio incluye instrucciones de rollout con LeRobot, lo que facilita su uso como referencia para comparar el rendimiento de diferentes arquitecturas VLA en tareas de manipulacion.
- **Educacion en robotica**: dado que el modelo es open source y ligero, puede utilizarse en cursos de robotica para ensenar a estudiantes a entrenar y desplegar politicas de aprendizaje por imitacion en robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas como tasa de exito, MMLU, HumanEval u otras.

## Requisitos de hardware

- **VRAM estimada**: no se proporcionan datos oficiales. Con 450M de parametros, una estimacion conservadora en FP32 seria de ~1.8 GB solo para los pesos, pero el repositorio ocupa 13.2 GB (probablemente incluye checkpoints y otros archivos). En inferencia, con cuantizacion a 8 bits, podria caber en GPUs con 4-6 GB de VRAM, aunque no hay confirmacion.
- **GPU recomendadas**: no se especifican. Dado el tamano, una GPU de consumo como una RTX 3060 (12 GB) o superior seria suficiente para inferencia. Para entrenamiento, se necesitaria al menos 16-24 GB de VRAM (por ejemplo, RTX 4090 o A5000).
- **Compatibilidad con consumer GPU**: probablemente si, dado el tamano compacto, pero no hay datos oficiales.
- **Opciones de despliegue**: el modelo se integra con LeRobot, que soporta inferencia en GPU via PyTorch. No se mencionan vLLM, llama.cpp u otras herramientas, ya que no es un modelo de lenguaje generativo.
- **Latencia y throughput**: no se proporcionan datos. La frecuencia de los datos de entrenamiento es de 30 FPS, lo que sugiere que la inferencia deberia ser capaz de operar a esa velocidad en hardware adecuado, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa con otros modelos VLA (como OpenVLA, RT-2, etc.) en terminos de rendimiento. Este modelo es un fine-tuning de SmolVLA, por lo que su comparacion natural seria con el propio `lerobot/smolvla_base`:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lerobot/smolvla_base` | 450M (aprox.) | no disponible | Apache 2.0 | Hugging Face |
| `OrderDraconis/smolvla_align_leo_clean` | 450.046.176 | no disponible | Apache 2.0 | Hugging Face |

La diferencia principal es que este modelo esta fine-tuneado para una tarea especifica, mientras que el base es generico. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **Especializacion extrema**: el modelo solo es util para la tarea de alineacion de tela con el robot `bi_so_follower` y las camaras especificas. No funcionara en otros robots o tareas sin un nuevo fine-tuning.
- **Sobreajuste potencial**: con solo 133 episodios, el modelo puede sobreajustarse a las condiciones del dataset (iluminacion, posiciones de camara, tipo de tela). Variaciones en el entorno pueden degradar el rendimiento.
- **Sin evaluacion publicada**: no hay resultados de exito en robot real, por lo que se desconoce su robustez en condiciones reales.
- **Dependencia de la configuracion de hardware**: las observaciones de camara y el estado del robot deben coincidir exactamente con las utilizadas en el entrenamiento (mismas camaras, misma resolucion, mismo orden de canales).
- **Idioma**: la instruccion en lenguaje natural esta en ingles; no se documenta soporte para otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales (el dataset `Janmeier820/align_fabric_dataset_leo` no especifica su licencia en la informacion proporcionada).
- **Riesgo de alucinacion**: al ser un modelo de accion, no genera texto, pero podria producir acciones incorrectas si la entrada no coincide con la distribucion de entrenamiento.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/OrderDraconis/smolvla_align_leo_clean)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Documentacion de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/smolvla)
- [Guia de SmolVLA en LeRobot (version alternativa)](https://dctx-team.github.io/lerobot-zh/en/smolvla/)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Janmeier820/align_fabric_dataset_leo)
