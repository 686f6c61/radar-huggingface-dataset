# drashutoshspace/moonbot_act_no_tf

## Resumen

moonbot_act_no_tf es una política de manipulación robótica basada en ACT (Action Chunking Transformer) publicada por el usuario drashutoshspace bajo licencia Apache-2.0 y distribuida a través de la librería LeRobot de Hugging Face. Se trata de un modelo entrenado desde cero con un backbone ResNet-18 preentrenado en ImageNet, cuyo propósito es actuar como baseline sin entrada de lenguaje ni señal de fuerza/par sobre un conjunto de 9 tareas de manipulación. El propio autor lo describe como "three blocks stack, WITHOUT force/torque", es decir, la variante que excluye la señal de fuerza/par del estado de entrada.

Su relevancia es principalmente experimental: forma parte de un estudio comparativo de seis ejecuciones que confronta las arquitecturas pi0, SmolVLA y ACT con y sin fuerza/par (F/T). Este modelo concreto es la ejecución ACT sin F/T, entrenada con el mismo dataset, batch 16, 20.000 pasos y semilla que la ejecución pi0 de referencia, lo que permite aislar el efecto de la arquitectura y de la señal F/T. El gemelo con fuerza/par es drashutoshspace/moonbot_act_tf.

No se especifican en la model card el número de parámetros totales, la longitud de contexto de observación ni los tipos de cuantización. El modelo no tiene entrada de lenguaje, por lo que no soporta instrucciones verbales ni capacidades multilingües: es un baseline sin lenguaje para las 9 tareas del dataset gdiazsrl/lerobot_sep23_no_tf.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet-18 preentrenado en ImageNet |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no es un LLM; ventana de observacion no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo sin entrada de lenguaje; baseline sin lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (checkpoints de LeRobot en PyTorch; incluyen pesos, pre/post-procesadores y tokenizer PaliGemma) |

| Parametro adicional | Valor |
|---|---|
| Dimension del estado | 15 (8 joint_read + 7 tip_pos), sin F_ee de fuerza/par |
| Camaras | 3 |
| Dimension de la accion | 8 |
| Tareas | 9 (dataset gdiazsrl/lerobot_sep23_no_tf) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una política de imitación de tipo behavior cloning que combina un codificador visual convolucional con un transformer y que predice bloques ("chunks") de acciones en lugar de acciones individuales, con el objetivo de reducir el error compuesto a lo largo del tiempo. En esta ejecución el backbone visual es una ResNet-18 preentrenada en ImageNet y el modelo se entrena desde cero sobre el dataset indicado. La model card señala explícitamente que LeRobot ACT no recibe la instrucción de tarea en lenguaje, de modo que funciona como baseline sin lenguaje sobre las 9 tareas. Cada carpeta de checkpoint es autocontenida e incluye pesos, pre/post-procesadores, el tokenizer PaliGemma, el contrato "rosetta" de la ejecución, `prepare_deploy.py`, `test_offline.py` y `DEPLOY.md`.

El entrenamiento se realizó con batch size 16, 20.000 pasos, el preset de optimizador propio de LeRobot y semilla 1000 (por defecto), sin split de validación (igual que en las ejecuciones pi0). No se documenta el número de tokens ni episodios, la composición exacta del dataset, ni el uso de RLHF o DPO; al ser imitación supervisada, el ajuste se basa en demostraciones. La ejecución forma parte de una comparativa de seis configuraciones (pi0, SmolVLA y ACT, con y sin fuerza/par) con hiperparámetros y semilla idénticos. Las curvas de entrenamiento están publicadas en Weights & Biases (run a7hpuoto).

## Capacidades

- Generación de políticas de manipulación robótica a partir de observaciones visuales (3 cámaras) y estado propioceptivo.
- Producción de acciones de 8 dimensiones a partir de un estado de 15 dimensiones (8 joint_read + 7 tip_pos).
- Ejecución de las 9 tareas definidas en el dataset gdiazsrl/lerobot_sep23_no_tf como baseline sin lenguaje.
- Inferencia con checkpoints listos para despliegue: incluye `prepare_deploy.py`, `test_offline.py` y `DEPLOY.md` en cada carpeta de checkpoint.
- No dispone de tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües ni procesamiento de instrucciones en lenguaje natural.
- No incluye modo "thinking", ni capacidades de audio, ni comprensión vision-lenguaje; la visión se usa únicamente como entrada de la política.

## Casos de uso

- Manipulación robótica sobre las 9 tareas del dataset: el modelo actúa como política end-to-end que mapea observaciones (3 cámaras y estado de 15 dimensiones) a acciones de 8 dimensiones, permitiendo reproducir las tareas demostradas.
- Baseline de ablación en investigación: sirve para medir el efecto de eliminar la señal de fuerza/par, ya que su gemelo moonbot_act_tf incorpora dicha señal con el mismo resto de configuración.
- Comparativa de arquitecturas: al compartir dataset, batch, pasos y semilla con la ejecución pi0 (moonbot_pi0_no_tf), permite aislar diferencias entre ACT y pi0 en igualdad de condiciones.
- Despliegue en el robot MoonBot: la inclusión de contrato de estado, pre/post-procesadores y scripts de despliegue facilita la puesta en marcha sobre hardware con 3 cámaras y sin sensor de fuerza/par.
- Reproducibilidad de estudios: los checkpoints en pasos 5.000, 10.000, 15.000 y 20.000 permiten analizar la evolución del rendimiento a lo largo del entrenamiento.
- Entrenamiento o ajuste posterior en imitación: al ser un modelo ACT entrenado desde cero con backbone ResNet-18, puede reutilizarse como punto de partida para nuevas tareas del mismo dominio.
- Validación offline: el script `test_offline.py` permite verificar el modelo sin necesidad de acceso al robot físico, útil en pipelines de integración previos al despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia las curvas de entrenamiento en Weights & Biases (run a7hpuoto) y no reporta tasas de éxito ni métricas comparativas entre las arquitecturas evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible; la arquitectura ACT con backbone ResNet-18 se diseña habitualmente para inferencia en tiempo real en una única GPU, pero este dato no se especifica para este modelo.
- Opciones de despliegue: LeRobot es la librería indicada (pipeline robotics); los checkpoints incluyen `prepare_deploy.py`, `test_offline.py` y `DEPLOY.md` para el despliegue en el robot.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada de lenguaje | Fuerza/par (F/T) | Dataset | Pasos | Licencia |
|---|---|---|---|---|---|---|
| moonbot_act_no_tf (este) | ACT, ResNet-18 | No | No | lerobot_sep23_no_tf | 20.000 | Apache-2.0 |
| moonbot_act_tf | ACT, ResNet-18 | No | Si | lerobot_sep23_no_tf | 20.000 | no disponible |
| moonbot_pi0_no_tf | pi0 | No | No | lerobot_sep23_no_tf | 20.000 | no disponible |
| SmolVLA (tercera arquitectura de la comparativa) | VLA | no disponible | no disponible | lerobot_sep23_no_tf | 20.000 | no disponible |

Los cuatro modelos forman parte del mismo estudio comparativo y comparten dataset, batch 16, 20.000 pasos y semilla, por lo que la comparación entre ellos es directa en cuanto a configuración de entrenamiento. No se dispone de métricas de rendimiento publicadas para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es un baseline sin lenguaje: no acepta instrucciones de tarea en lenguaje natural, de modo que no puede reorientarse a nuevas tareas mediante prompts.
- No se documentó split de validación, por lo que no existen métricas de generalización publicadas y el riesgo de sobreajuste no puede evaluarse con los datos disponibles.
- Al carecer de señal de fuerza/par, es previsible que tenga dificultades en tareas ricas en contacto; el autor lo plantea explícitamente como la variante sin F/T frente a su gemelo moonbot_act_tf.
- Está entrenado sobre un único dataset de 9 tareas, por lo que su capacidad de generalización a entornos, objetos o robots distintos no está demostrada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validación por parte de la comunidad.
- Riesgo de fallo por cambio de distribución: como política de imitación, puede degradarse ante observaciones fuera de la distribución de las demostraciones.
- Licencia Apache-2.0: permisiva, permite uso comercial y modificación, pero se recomienda verificar el cumplimiento respecto a los datos y componentes de terceros (por ejemplo, el backbone ResNet-18 y el tokenizer PaliGemma referenciados).
- El tokenizer PaliGemma se incluye en los checkpoints pese a que ACT no consume lenguaje; conviene revisar si es un artefacto heredado de la infraestructura de LeRobot.
- Los checkpoints denominados "complete" (con estado del optimizador) se alojan en un OneDrive del equipo, no en Hugging Face, lo que puede afectar a la reproducibilidad a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drashutoshspace/moonbot_act_no_tf
- Dataset de entrenamiento: https://huggingface.co/datasets/gdiazsrl/lerobot_sep23_no_tf
- Ejecucion pi0 de referencia: https://huggingface.co/drashutoshspace/moonbot_pi0_no_tf
- Gemelo con fuerza/par: drashutoshspace/moonbot_act_tf
- Curvas de entrenamiento (Weights & Biases): https://wandb.ai/drmishra-space/lerobot/runs/a7hpuoto

Nota: la busqueda web realizada no devolvio enlaces relevantes para este modelo; los resultados obtenidos correspondian a paginas genericas de GitHub y no guardan relacion con el modelo.
