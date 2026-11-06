# Louislerikiki/act_sort_by_weight_multicam_v1

## Resumen

ACT multicam v1 es una política de imitación para robótica basada en la arquitectura ACT (Action Chunking with Transformers), entrenada con LeRobot sobre un robot bimanual real OpenArm de 7 grados de libertad. La desarrolla Louis Barthez durante una estancia de 16 semanas en AIST Tokyo Waterfront (abril-julio de 2026) y resuelve una tarea concreta de manipulación: clasificar cajas de cartón en el contenedor correcto según su peso, infiriendo dicho peso a partir del par articular durante el agarre, sin sensor dedicado.

El modelo es relevante porque constituye el baseline principal de un proyecto de investigación aplicada con hardware abierto y porque demuestra una habilidad relativamente compleja en manipulación bimanual: localización del objeto entre varios, transferencia de mano a mano cuando el contenedor destino está en el lado opuesto y colocación en el contenedor correcto en la mayoría de ensayos. Según el autor, supera en estabilidad de movimiento a Diffusion Policy, VQ-BeT y π0 entrenados con los mismos datos y hardware, que mostraron patrones de movimiento erráticos y a ráfagas.

Se trata de un modelo pequeño (51,7 millones de parámetros, ~0,2 GB de pesos en safetensors) especializado en una única tarea y morfología, no de un modelo de propósito general. Su interés es fundamentalmente de investigación en aprendizaje por imitación y en reproducibilidad de pipelines LeRobot sobre robots abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.754.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso y horizonte de chunking de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de compounding y suaviza la ejecución. En esta variante, el modelo consume seis flujos de cámara: una vista cenital ZED con RGB y profundidad y dos cámaras de muñeca RealSense con RGB y profundidad, y produce comandos de control para un robot bimanual OpenArm de 7 grados de libertad por brazo.

El entrenamiento se realizó con LeRobot 0.5.2 sobre 4 GPUs RTX 6000 Ada, usando el dataset `Louislerikiki/bimanual_sort_by_weight_v2`: 100 episodios teleoperados líder-seguidor, aproximadamente 249.000 fotogramas a 30 fps. No se documentan en la información disponible detalles sobre uso de RLHF, DPO ni sobre el volumen exacto de tokens o composición del dataset más allá de los episodios descritos. La innovación destacable es la inferencia del peso del objeto a partir del par articular durante el agarre, lo que evita instrumentar las pinzas con un sensor de peso.

## Capacidades

- Control robótico bimanual de 7 grados de libertad por brazo sobre OpenArm.
- Clasificación de objetos por peso inferido del par articular durante el agarre.
- Localización del objeto entre varios presentes en la escena.
- Transferencia de objeto de una mano a otra (hand-to-hand transfer) cuando el contenedor destino está en el lado opuesto.
- Colocación del objeto en el contenedor correcto.
- Percepción multimodal con seis cámaras: RGB y profundidad cenital más RGB y profundidad en dos muñecas.
- Ejecución de políticas de imitación con chunking de acciones (predicción de secuencias de acciones).
- No soporta tool calling, function calling, agentes de texto ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Clasificación automatizada de paquetes por peso en líneas de logística: el modelo puede tomar una caja, estimar su peso por el par articular durante el agarre y depositarla en el contenedor correspondiente, sin necesidad de báscula integrada.
- Investigación en aprendizaje por imitación bimanual: sirve como baseline reproducible para comparar ACT frente a Diffusion Policy, VQ-BeT o π0 sobre el mismo dataset y hardware.
- Transferencia de objeto entre brazos en espacios de trabajo amplios: útil en celdas donde el robot debe pasar una pieza de una zona a otra situada fuera del alcance de un solo brazo.
- Prototipado de pipelines LeRobot en robots abiertos: el modelo se puede evaluar con `lerobot-record` y `--policy.path=Louislerikiki/act_sort_by_weight_multicam_v1` para validar configuraciones de cámaras y puertos CAN.
- Selección de objetos entre varios en una bandeja: aplicable a tareas de picking donde el robot debe identificar el objeto correcto antes de agarrarlo.
- Estudio de ablaciones de percepción: las variantes publicadas (sin profundidad, con dropout de estado, con distinto número de capas decodificador y con distinto número de episodios) permiten analizar el impacto de cada factor en el rendimiento final.
- Docencia y divulgación en robótica de manipulación: al ser un modelo pequeño con licencia Apache 2.0 y código público, es adecuado para reproducir experimentos en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La model card únicamente describe resultados cualitativos en el robot real: el modelo localiza la caja entre varias, realiza la transferencia mano a mano cuando es necesario y coloca la caja en el contenedor correcto en la mayoría de los ensayos, con alineación de agarre imprecisa. Se indica además que Diffusion Policy, VQ-BeT y π0 mostraron un patrón de movimiento errático y a ráfagas sobre el mismo hardware y datos, pero no se aportan métricas numéricas de éxito ni de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros y pesos en safetensors de ~0,2 GB, el modelo es muy ligero y probablemente quepa en GPUs de consumo, aunque no se documenta la huella exacta en memoria durante la inferencia.
- GPU recomendadas: el entrenamiento se realizó en 4× RTX 6000 Ada; para inferencia no se especifica una GPU concreta.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (comando `lerobot-record` con `--policy.path`), con configuración previa de cámaras y puertos CAN del robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_sort_by_weight_multicam_v1 | ACT | 51,7 M | no aplica | Baseline principal; mejor compromiso global según el autor | Apache 2.0 | Hugging Face |
| act_sort_by_weight_no_depth | ACT | no disponible | no aplica | Variante RGB sin profundidad | Apache 2.0 | Hugging Face |
| act_sort_by_weight_dropout_v1 | ACT | no disponible | no aplica | Variante con 80 % de dropout de estado | Apache 2.0 | Hugging Face |
| pi0_sort_by_weight_v1 | π0 | no disponible | no aplica | Movimiento errático y a ráfagas según el autor | no disponible | Hugging Face |
| vqbet_sort_by_weight_topview_v1 | VQ-BeT | no disponible | no aplica | Movimiento errático y a ráfagas según el autor | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo especializado en una única tarea (clasificación de cajas por peso) y en una morfología concreta (OpenArm bimanual de 7 grados de libertad); no es generalizable a otras tareas sin reentrenamiento.
- La alineación del agarre sigue siendo imprecisa según el propio autor, lo que puede provocar fallos en objetos con geometrías o pesos distintos a los del dataset.
- Depende de una configuración exacta de cámaras y puertos CAN; cambios en la disposición física o en la calibración pueden degradar el rendimiento.
- Entrenado con solo 100 episodios teleoperados (~249.000 fotogramas), lo que limita la diversidad de escenarios cubiertos.
- No se documentan sesgos ni evaluaciones de robustez fuera de las condiciones del laboratorio.
- No hay métricas cuantitativas publicadas de tasa de éxito, por lo que las afirmaciones de rendimiento son cualitativas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del hardware OpenArm y de LeRobot, cuyas condiciones deben verificarse por separado.
- No apto para tareas de texto, razonamiento, código ni visión general: es exclusivamente una política de control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Louislerikiki/act_sort_by_weight_multicam_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Louislerikiki/bimanual_sort_by_weight_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio del proyecto (código, notas de hardware y análisis de fallos): https://github.com/hcp-ai-hub/openarm-box-sorting
- LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor en GitHub: https://github.com/LouisBarthez
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/louis-barthez-29a476398/
- Variantes relacionadas: https://huggingface.co/Louislerikiki/act_sort_by_weight_dropout_v1, https://huggingface.co/Louislerikiki/act_sort_by_weight_decoder4_louis, https://huggingface.co/Louislerikiki/act_sort_by_weight_no_depth, https://huggingface.co/Louislerikiki/act_sort_by_weight_25ep, https://huggingface.co/Louislerikiki/act_sort_by_weight_50ep, https://huggingface.co/Louislerikiki/act_sort_by_weight_75ep, https://huggingface.co/Louislerikiki/pi0_sort_by_weight_v1, https://huggingface.co/Louislerikiki/vqbet_sort_by_weight_topview_v1
